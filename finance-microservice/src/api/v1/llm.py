#!/usr/bin/env python
"""
API-Endpunkte für LLM-Funktionen des Finance Microservices.
Diese Endpunkte ermöglichen intelligente Funktionen wie:
- Automatische Buchungsvorschläge
- Kontierungshilfe
- Anomalieerkennung
- Dokumentenanalyse
"""

import time
import json
from typing import List, Dict, Any, Optional

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from fastapi.responses import JSONResponse
import structlog
import redis.asyncio as redis
import prometheus_client as prom

from core.config import settings
from core.security import get_current_user
from core.cache import get_redis
from core.llm import LLMProvider, get_llm_provider, get_fallback_llm_provider
from models.schemas.llm import (
    TransactionAnalysisRequest,
    TransactionAnalysisResponse,
    AccountSuggestionRequest,
    AccountSuggestionResponse,
    DocumentAnalysisRequest,
    DocumentAnalysisResponse,
    AnomalyDetectionRequest,
    AnomalyDetectionResponse,
)

router = APIRouter(prefix="/llm")
logger = structlog.get_logger(__name__)

# Prometheus-Metriken für LLM-Zugriffe
LLM_REQUESTS = prom.Counter(
    "finance_llm_requests_total",
    "Anzahl der LLM-Anfragen",
    ["provider", "endpoint", "success"]
)
LLM_REQUEST_LATENCY = prom.Histogram(
    "finance_llm_request_latency_seconds",
    "Latenz der LLM-Anfragen in Sekunden",
    ["provider", "endpoint"]
)
LLM_TOKEN_USAGE = prom.Counter(
    "finance_llm_token_usage_total",
    "Anzahl der verbrauchten LLM-Tokens",
    ["provider", "type"]  # type: input oder output
)


@router.post(
    "/analyze-transaction",
    response_model=TransactionAnalysisResponse,
    summary="Transaktion analysieren",
    description="Analysiert eine Transaktion und gibt Vorschläge zur Kontierung, "
                "Kategorisierung und potenziellen Anomalien."
)
async def analyze_transaction(
    request: TransactionAnalysisRequest,
    background_tasks: BackgroundTasks,
    redis_client: redis.Redis = Depends(get_redis),
    llm_provider: LLMProvider = Depends(get_llm_provider),
    current_user: dict = Depends(get_current_user) if settings.AUTH_ENABLED else None,
) -> TransactionAnalysisResponse:
    """
    Analysiert eine Transaktion mit Hilfe eines LLM und gibt Vorschläge
    zur Kontierung und Kategorisierung zurück.
    """
    if not settings.LLM_ENABLED:
        raise HTTPException(
            status_code=503,
            detail="LLM-Funktionen sind derzeit deaktiviert."
        )
    
    # Cache-Schlüssel generieren
    cache_key = f"finance:transaction_analysis:{hash(json.dumps(request.dict(), sort_keys=True))}"
    
    # Versuche, Ergebnisse aus dem Cache zu laden
    if settings.CACHE_ENABLED:
        cached_result = await redis_client.get(cache_key)
        if cached_result:
            logger.info("Cache-Treffer für Transaktionsanalyse", transaction_id=request.transaction_id)
            return TransactionAnalysisResponse.parse_raw(cached_result)
    
    # Starte Timer für Latenz-Messung
    start_time = time.time()
    
    try:
        # System-Prompt für die Transaktionsanalyse
        system_prompt = """
        Du bist ein KI-Assistent für Buchhaltung und Finanzen. Deine Aufgabe ist es, 
        Transaktionsdaten zu analysieren und Vorschläge für Kontierung, Kategorisierung 
        und mögliche Anomalien zu liefern. Berücksichtige dabei:
        
        1. Den Transaktionstyp (Einnahme, Ausgabe, interne Buchung)
        2. Den Beschreibungstext und zusätzliche Informationen
        3. Den Betrag und das Datum
        4. Historische Muster, falls vorhanden
        
        Liefere deine Antwort in einem strukturierten Format mit Kontierungsvorschlag,
        Kategorien, Steuerbehandlung und einer Bewertung der Anomaliewahrscheinlichkeit.
        """
        
        # Benutzerprompt mit den Transaktionsdaten
        user_prompt = f"""
        Analysiere die folgende Transaktion:
        
        ID: {request.transaction_id}
        Beschreibung: {request.description}
        Betrag: {request.amount} {request.currency}
        Datum: {request.transaction_date}
        Zusätzliche Informationen: {request.additional_info or 'Keine'}
        Gegenpartei: {request.counterparty or 'Nicht angegeben'}
        
        {f'Historische Transaktionen mit ähnlicher Beschreibung: {request.similar_transactions}' if request.similar_transactions else ''}
        """
        
        # LLM-Anfrage stellen
        llm_response = await llm_provider.generate_text(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            max_tokens=settings.LLM_MAX_TOKENS,
            temperature=settings.LLM_TEMPERATURE,
        )
        
        # Antwort verarbeiten und strukturieren
        response_data = llm_provider.parse_structured_response(
            llm_response,
            expected_fields=[
                "suggested_accounts",
                "category", 
                "subcategory",
                "tax_treatment",
                "anomaly_score",
                "reasoning"
            ]
        )
        
        # Erfolgreiches Ergebnis
        result = TransactionAnalysisResponse(
            transaction_id=request.transaction_id,
            suggested_accounts=response_data.get("suggested_accounts", []),
            category=response_data.get("category", ""),
            subcategory=response_data.get("subcategory", ""),
            tax_treatment=response_data.get("tax_treatment", ""),
            anomaly_score=float(response_data.get("anomaly_score", 0)),
            reasoning=response_data.get("reasoning", ""),
            confidence=llm_provider.calculate_confidence(llm_response),
            provider_info=llm_provider.get_provider_info(),
        )
        
        # Metrik-Erfassung
        LLM_REQUESTS.labels(
            provider=llm_provider.provider_name,
            endpoint="analyze-transaction",
            success="true"
        ).inc()
        
        # Cache-Ergebnis, wenn Caching aktiviert ist
        if settings.CACHE_ENABLED and settings.LLM_CACHE_RESPONSES:
            background_tasks.add_task(
                redis_client.set,
                cache_key,
                result.json(),
                ex=settings.CACHE_TTL
            )
        
        return result
        
    except Exception as e:
        logger.error(
            "Fehler bei der Transaktionsanalyse",
            error=str(e),
            transaction_id=request.transaction_id
        )
        
        # Versuche Fallback-Provider, wenn verfügbar
        try:
            fallback_llm = await get_fallback_llm_provider()
            if fallback_llm and fallback_llm.provider_name != llm_provider.provider_name:
                logger.info(
                    "Verwende Fallback-LLM-Provider",
                    primary=llm_provider.provider_name,
                    fallback=fallback_llm.provider_name
                )
                
                # Fallback-Anfrage stellen (vereinfacht)
                fallback_response = await fallback_llm.generate_text(
                    system_prompt="Analysiere die folgende Finanztransaktion und schlage eine Kontierung vor.",
                    user_prompt=f"Transaktion: {request.description}, Betrag: {request.amount} {request.currency}",
                    max_tokens=300,
                    temperature=0.1,
                )
                
                return TransactionAnalysisResponse(
                    transaction_id=request.transaction_id,
                    suggested_accounts=["Fehler beim primären LLM-Provider. Vereinfachte Analyse verwendet."],
                    category="Konnte nicht bestimmt werden",
                    subcategory="",
                    tax_treatment="",
                    anomaly_score=0.0,
                    reasoning="Ein Fehler ist beim primären LLM-Provider aufgetreten. "
                              "Diese vereinfachte Analyse wurde mit einem Fallback-Provider erzeugt.",
                    confidence=0.3,
                    provider_info=fallback_llm.get_provider_info(),
                )
        except Exception as fallback_error:
            logger.error(
                "Auch Fallback-LLM-Provider fehlgeschlagen",
                error=str(fallback_error),
                transaction_id=request.transaction_id
            )
        
        # Metrik für Fehler
        LLM_REQUESTS.labels(
            provider=llm_provider.provider_name,
            endpoint="analyze-transaction",
            success="false"
        ).inc()
        
        raise HTTPException(
            status_code=500,
            detail=f"Fehler bei der Transaktionsanalyse: {str(e)}"
        )
    finally:
        # Latenz erfassen
        end_time = time.time()
        LLM_REQUEST_LATENCY.labels(
            provider=llm_provider.provider_name,
            endpoint="analyze-transaction"
        ).observe(end_time - start_time)


@router.post(
    "/suggest-account",
    response_model=AccountSuggestionResponse,
    summary="Kontovorschläge generieren",
    description="Generiert Vorschläge für passende Konten basierend auf einer Beschreibung "
                "oder Transaktion."
)
async def suggest_account(
    request: AccountSuggestionRequest,
    background_tasks: BackgroundTasks,
    redis_client: redis.Redis = Depends(get_redis),
    llm_provider: LLMProvider = Depends(get_llm_provider),
    current_user: dict = Depends(get_current_user) if settings.AUTH_ENABLED else None,
) -> AccountSuggestionResponse:
    """
    Generiert Vorschläge für passende Konten basierend auf einer Beschreibung
    oder Transaktionsdaten.
    """
    if not settings.LLM_ENABLED:
        raise HTTPException(
            status_code=503,
            detail="LLM-Funktionen sind derzeit deaktiviert."
        )
    
    # Cache-Schlüssel generieren
    cache_key = f"finance:account_suggestion:{hash(json.dumps(request.dict(), sort_keys=True))}"
    
    # Versuche, Ergebnisse aus dem Cache zu laden
    if settings.CACHE_ENABLED:
        cached_result = await redis_client.get(cache_key)
        if cached_result:
            logger.info("Cache-Treffer für Kontovorschlag", description=request.description)
            return AccountSuggestionResponse.parse_raw(cached_result)
    
    # Starte Timer für Latenz-Messung
    start_time = time.time()
    
    try:
        # System-Prompt für die Kontovorschläge
        system_prompt = """
        Du bist ein Experte für Buchhaltung und Finanzkontenrahmen (SKR03/SKR04). 
        Deine Aufgabe ist es, basierend auf einer Beschreibung oder Transaktionsdaten 
        passende Konten aus dem Kontenrahmen vorzuschlagen. 
        
        Berücksichtige dabei:
        1. Art der Transaktion (Einnahme/Ausgabe/interne Buchung)
        2. Beschreibung und Zweck
        3. Branchenübliche Kontierungspraxis
        4. Steuerliche Aspekte
        
        Gib für jedes vorgeschlagene Konto die Kontonummer, Bezeichnung und eine kurze 
        Begründung an, warum dieses Konto passend ist.
        """
        
        # Benutzerprompt mit der Beschreibung
        user_prompt = f"""
        Schlage passende Konten für die folgende Beschreibung vor:
        
        Beschreibung: {request.description}
        Transaktionstyp: {request.transaction_type or 'Nicht angegeben'}
        {f'Betrag: {request.amount} {request.currency}' if request.amount else ''}
        {f'Geschäftsbereich: {request.business_area}' if request.business_area else ''}
        {f'Steuerrelevant: {request.tax_relevant}' if request.tax_relevant is not None else ''}
        
        Kontenrahmen: {request.chart_of_accounts or 'SKR03'}
        
        Gib mindestens 2, maximal 5 passende Konten mit Kontonummer, Bezeichnung und einer
        kurzen Begründung zurück.
        """
        
        # LLM-Anfrage stellen
        llm_response = await llm_provider.generate_text(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            max_tokens=settings.LLM_MAX_TOKENS,
            temperature=settings.LLM_TEMPERATURE,
        )
        
        # Antwort verarbeiten und strukturieren
        suggested_accounts = llm_provider.extract_account_suggestions(llm_response)
        
        # Erfolgreiches Ergebnis
        result = AccountSuggestionResponse(
            query=request.description,
            transaction_type=request.transaction_type,
            suggested_accounts=suggested_accounts,
            chart_of_accounts=request.chart_of_accounts or "SKR03",
            confidence=llm_provider.calculate_confidence(llm_response),
            provider_info=llm_provider.get_provider_info(),
        )
        
        # Metrik-Erfassung
        LLM_REQUESTS.labels(
            provider=llm_provider.provider_name,
            endpoint="suggest-account",
            success="true"
        ).inc()
        
        # Cache-Ergebnis, wenn Caching aktiviert ist
        if settings.CACHE_ENABLED and settings.LLM_CACHE_RESPONSES:
            background_tasks.add_task(
                redis_client.set,
                cache_key,
                result.json(),
                ex=settings.CACHE_TTL
            )
        
        return result
        
    except Exception as e:
        logger.error(
            "Fehler bei Kontovorschlägen",
            error=str(e),
            description=request.description
        )
        
        # Metrik für Fehler
        LLM_REQUESTS.labels(
            provider=llm_provider.provider_name,
            endpoint="suggest-account",
            success="false"
        ).inc()
        
        raise HTTPException(
            status_code=500,
            detail=f"Fehler bei der Generierung von Kontovorschlägen: {str(e)}"
        )
    finally:
        # Latenz erfassen
        end_time = time.time()
        LLM_REQUEST_LATENCY.labels(
            provider=llm_provider.provider_name,
            endpoint="suggest-account"
        ).observe(end_time - start_time)


@router.post(
    "/analyze-document",
    response_model=DocumentAnalysisResponse,
    summary="Dokument analysieren",
    description="Analysiert ein Dokument (Rechnung, Beleg) und extrahiert relevante "
                "Finanzdaten für die Buchführung."
)
async def analyze_document(
    request: DocumentAnalysisRequest,
    background_tasks: BackgroundTasks,
    redis_client: redis.Redis = Depends(get_redis),
    llm_provider: LLMProvider = Depends(get_llm_provider),
    current_user: dict = Depends(get_current_user) if settings.AUTH_ENABLED else None,
) -> DocumentAnalysisResponse:
    """
    Analysiert ein Dokument (Rechnung, Beleg) mit Hilfe eines LLM und extrahiert
    relevante Finanzdaten für die Buchführung.
    """
    if not settings.LLM_ENABLED:
        raise HTTPException(
            status_code=503,
            detail="LLM-Funktionen sind derzeit deaktiviert."
        )
    
    # Starte Timer für Latenz-Messung
    start_time = time.time()
    
    try:
        # System-Prompt für die Dokumentenanalyse
        system_prompt = """
        Du bist ein KI-Assistent für Buchhaltung und Finanzen. Deine Aufgabe ist es, Informationen
        aus Dokumenten wie Rechnungen und Belegen zu extrahieren und in einem strukturierten Format
        zurückzugeben. Achte besonders auf:
        
        1. Rechnungsnummer
        2. Datum
        3. Gesamtbetrag
        4. Mehrwertsteuerbetrag und -satz
        5. Lieferant/Empfänger
        6. Einzelposten mit Beträgen
        7. Zahlungsbedingungen
        
        Gib die extrahierten Informationen in einem strukturierten Format zurück.
        """
        
        # Benutzerprompt mit dem Dokumenteninhalt
        user_prompt = f"""
        Analysiere das folgende Dokument und extrahiere alle relevanten Finanzdaten:
        
        Dokumententyp: {request.document_type}
        Dokumenteninhalt:
        
        {request.document_content}
        
        Extrahiere alle relevanten Finanzdaten für eine korrekte buchhalterische Erfassung.
        """
        
        # LLM-Anfrage stellen
        llm_response = await llm_provider.generate_text(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            max_tokens=2048,  # Längere Antwort für komplexe Dokumente
            temperature=0.0,  # Niedrige Temperatur für präzise Extraktion
        )
        
        # Antwort verarbeiten und strukturieren
        extracted_data = llm_provider.parse_structured_response(
            llm_response,
            expected_fields=[
                "document_number", 
                "date", 
                "total_amount",
                "tax_amount",
                "tax_rate",
                "vendor",
                "line_items",
                "payment_terms",
                "suggested_accounts"
            ]
        )
        
        # Erfolgreiches Ergebnis
        result = DocumentAnalysisResponse(
            document_type=request.document_type,
            extracted_data=extracted_data,
            suggested_accounts=extracted_data.get("suggested_accounts", []),
            confidence=llm_provider.calculate_confidence(llm_response),
            provider_info=llm_provider.get_provider_info(),
        )
        
        # Metrik-Erfassung
        LLM_REQUESTS.labels(
            provider=llm_provider.provider_name,
            endpoint="analyze-document",
            success="true"
        ).inc()
        
        return result
        
    except Exception as e:
        logger.error(
            "Fehler bei der Dokumentenanalyse",
            error=str(e),
            document_type=request.document_type
        )
        
        # Metrik für Fehler
        LLM_REQUESTS.labels(
            provider=llm_provider.provider_name,
            endpoint="analyze-document",
            success="false"
        ).inc()
        
        raise HTTPException(
            status_code=500,
            detail=f"Fehler bei der Dokumentenanalyse: {str(e)}"
        )
    finally:
        # Latenz erfassen
        end_time = time.time()
        LLM_REQUEST_LATENCY.labels(
            provider=llm_provider.provider_name,
            endpoint="analyze-document"
        ).observe(end_time - start_time)


@router.post(
    "/detect-anomalies",
    response_model=AnomalyDetectionResponse,
    summary="Anomalien erkennen",
    description="Analysiert Finanztransaktionen auf Anomalien und potenzielle Unregelmäßigkeiten."
)
async def detect_anomalies(
    request: AnomalyDetectionRequest,
    background_tasks: BackgroundTasks,
    redis_client: redis.Redis = Depends(get_redis),
    llm_provider: LLMProvider = Depends(get_llm_provider),
    current_user: dict = Depends(get_current_user) if settings.AUTH_ENABLED else None,
) -> AnomalyDetectionResponse:
    """
    Analysiert eine Liste von Finanztransaktionen auf Anomalien und potenzielle
    Unregelmäßigkeiten.
    """
    if not settings.LLM_ENABLED:
        raise HTTPException(
            status_code=503,
            detail="LLM-Funktionen sind derzeit deaktiviert."
        )
    
    # Starte Timer für Latenz-Messung
    start_time = time.time()
    
    try:
        # System-Prompt für die Anomalieerkennung
        system_prompt = """
        Du bist ein Experte für Finanzprüfung und Anomalieerkennung. Deine Aufgabe ist es,
        eine Liste von Finanztransaktionen zu analysieren und potenzielle Anomalien oder
        Unregelmäßigkeiten zu identifizieren. Achte besonders auf:
        
        1. Ungewöhnlich hohe oder niedrige Beträge
        2. Abweichungen vom typischen Transaktionsmuster
        3. Ungewöhnliche Zeitpunkte oder Häufigkeiten
        4. Verdächtige Beschreibungen oder Kontokombinationen
        5. Potenzielle Duplikate oder fehlerhafte Buchungen
        
        Bewerte für jede identifizierte Anomalie den Schweregrad (1-10) und gib eine
        Begründung an, warum du diese Transaktion als auffällig einstufst.
        """
        
        # Benutzerprompt mit den Transaktionsdaten
        transactions_text = ""
        for idx, transaction in enumerate(request.transactions, 1):
            transactions_text += f"""
            Transaktion {idx}:
            - ID: {transaction.transaction_id}
            - Beschreibung: {transaction.description}
            - Betrag: {transaction.amount} {transaction.currency}
            - Datum: {transaction.transaction_date}
            - Konto: {transaction.account_number}
            - Gegenkonto: {transaction.counterparty_account or 'Nicht angegeben'}
            
            """
        
        user_prompt = f"""
        Analysiere die folgenden Transaktionen auf Anomalien und Unregelmäßigkeiten:
        
        {transactions_text}
        
        {f'Typische Transaktionsmuster für diese Konten: {request.context.typical_patterns}' if request.context and request.context.typical_patterns else ''}
        {f'Typische Beträge: {request.context.typical_amounts}' if request.context and request.context.typical_amounts else ''}
        
        Identifiziere Anomalien, ordne sie nach Schweregrad und gib eine Begründung an.
        """
        
        # LLM-Anfrage stellen
        llm_response = await llm_provider.generate_text(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            max_tokens=2048,
            temperature=0.2,
        )
        
        # Antwort verarbeiten und strukturieren
        anomalies = llm_provider.extract_anomalies(llm_response)
        
        # Erfolgreiches Ergebnis
        result = AnomalyDetectionResponse(
            analyzed_transactions=len(request.transactions),
            anomalies=anomalies,
            summary=llm_provider.extract_summary(llm_response) or "Zusammenfassung nicht verfügbar",
            confidence=llm_provider.calculate_confidence(llm_response),
            provider_info=llm_provider.get_provider_info(),
        )
        
        # Metrik-Erfassung
        LLM_REQUESTS.labels(
            provider=llm_provider.provider_name,
            endpoint="detect-anomalies",
            success="true"
        ).inc()
        
        return result
        
    except Exception as e:
        logger.error(
            "Fehler bei der Anomalieerkennung",
            error=str(e),
            transaction_count=len(request.transactions)
        )
        
        # Metrik für Fehler
        LLM_REQUESTS.labels(
            provider=llm_provider.provider_name,
            endpoint="detect-anomalies",
            success="false"
        ).inc()
        
        raise HTTPException(
            status_code=500,
            detail=f"Fehler bei der Anomalieerkennung: {str(e)}"
        )
    finally:
        # Latenz erfassen
        end_time = time.time()
        LLM_REQUEST_LATENCY.labels(
            provider=llm_provider.provider_name,
            endpoint="detect-anomalies"
        ).observe(end_time - start_time) 