#!/usr/bin/env python
"""
Pydantic-Modelle für die LLM-Service-Endpunkte.
Diese Modelle definieren die Eingabe- und Ausgabeformate für die LLM-bezogenen API-Endpunkte.
"""

from datetime import date, datetime
from typing import Dict, List, Optional, Any, Union
from enum import Enum
from pydantic import BaseModel, Field, validator, root_validator


class TransactionType(str, Enum):
    """Enum für Transaktionstypen"""
    INCOME = "income"
    EXPENSE = "expense"
    TRANSFER = "transfer"
    OPENING_BALANCE = "opening_balance"
    ADJUSTMENT = "adjustment"


class LLMProvider(str, Enum):
    """Enum für LLM-Provider"""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    LOCAL = "local"


class TransactionAnalysisRequest(BaseModel):
    """Anfrage-Modell für die Transaktionsanalyse"""
    
    transaction_id: str = Field(..., description="ID der zu analysierenden Transaktion")
    description: str = Field(..., description="Beschreibung der Transaktion")
    amount: float = Field(..., description="Betrag der Transaktion")
    currency: str = Field("EUR", description="Währung der Transaktion")
    transaction_date: date = Field(..., description="Datum der Transaktion")
    transaction_type: Optional[TransactionType] = Field(None, description="Typ der Transaktion")
    counterparty: Optional[str] = Field(None, description="Gegenpartei der Transaktion")
    counterparty_account: Optional[str] = Field(None, description="Gegenkonto der Transaktion")
    additional_info: Optional[str] = Field(None, description="Zusätzliche Informationen")
    similar_transactions: Optional[List[Dict[str, Any]]] = Field(
        None, description="Historische ähnliche Transaktionen für Kontext"
    )
    
    @validator("amount")
    def validate_amount(cls, v):
        """Validiert, dass der Betrag nicht 0 ist"""
        if v == 0:
            raise ValueError("Betrag darf nicht 0 sein")
        return v


class TransactionAnalysisResponse(BaseModel):
    """Antwort-Modell für die Transaktionsanalyse"""
    
    transaction_id: str = Field(..., description="ID der analysierten Transaktion")
    suggested_accounts: List[str] = Field(..., description="Vorgeschlagene Konten für die Buchung")
    category: str = Field(..., description="Kategorie der Transaktion")
    subcategory: Optional[str] = Field(None, description="Unterkategorie der Transaktion")
    tax_treatment: Optional[str] = Field(None, description="Steuerliche Behandlung")
    anomaly_score: float = Field(..., ge=0, le=1, description="Anomaliewert (0-1)")
    reasoning: str = Field(..., description="Begründung für die Analyse")
    confidence: float = Field(..., ge=0, le=1, description="Konfidenzwert der Analyse (0-1)")
    provider_info: Dict[str, str] = Field(..., description="Informationen zum verwendeten LLM-Provider")
    
    class Config:
        schema_extra = {
            "example": {
                "transaction_id": "TR12345",
                "suggested_accounts": ["4400 - Büromaterial", "6815 - Fachliteratur"],
                "category": "Betriebsausgaben",
                "subcategory": "Bürobedarf",
                "tax_treatment": "Vorsteuerabzug möglich (19%)",
                "anomaly_score": 0.1,
                "reasoning": "Die Transaktion entspricht typischen Büromaterialeinkäufen.",
                "confidence": 0.95,
                "provider_info": {
                    "provider": "openai",
                    "model": "gpt-4",
                    "version": "1.0"
                }
            }
        }


class AccountSuggestionRequest(BaseModel):
    """Anfrage-Modell für Kontovorschläge"""
    
    description: str = Field(..., description="Beschreibung oder Zweck für die Kontovorschläge")
    transaction_type: Optional[TransactionType] = Field(None, description="Typ der Transaktion")
    amount: Optional[float] = Field(None, description="Betrag (falls bekannt)")
    currency: Optional[str] = Field("EUR", description="Währung (falls bekannt)")
    business_area: Optional[str] = Field(None, description="Geschäftsbereich")
    tax_relevant: Optional[bool] = Field(None, description="Steuerrelevant")
    chart_of_accounts: Optional[str] = Field("SKR03", description="Zu verwendender Kontenrahmen (SKR03, SKR04, etc.)")


class AccountSuggestion(BaseModel):
    """Modell für einen einzelnen Kontovorschlag"""
    
    account_number: str = Field(..., description="Kontonummer")
    name: str = Field(..., description="Kontobezeichnung")
    description: str = Field(..., description="Begründung für den Vorschlag")


class AccountSuggestionResponse(BaseModel):
    """Antwort-Modell für Kontovorschläge"""
    
    query: str = Field(..., description="Die ursprüngliche Anfrage")
    transaction_type: Optional[TransactionType] = Field(None, description="Typ der Transaktion")
    suggested_accounts: List[Dict[str, str]] = Field(..., description="Liste der vorgeschlagenen Konten")
    chart_of_accounts: str = Field(..., description="Verwendeter Kontenrahmen")
    confidence: float = Field(..., ge=0, le=1, description="Konfidenzwert der Vorschläge (0-1)")
    provider_info: Dict[str, str] = Field(..., description="Informationen zum verwendeten LLM-Provider")
    
    class Config:
        schema_extra = {
            "example": {
                "query": "Kauf von Büromaterialien",
                "transaction_type": "expense",
                "suggested_accounts": [
                    {
                        "account_number": "4400",
                        "name": "Büromaterial",
                        "description": "Für allgemeine Büromaterialien wie Papier, Stifte, etc."
                    },
                    {
                        "account_number": "6815",
                        "name": "Fachliteratur",
                        "description": "Falls es sich um Bücher oder Fachzeitschriften handelt"
                    }
                ],
                "chart_of_accounts": "SKR03",
                "confidence": 0.9,
                "provider_info": {
                    "provider": "openai",
                    "model": "gpt-4",
                    "version": "1.0"
                }
            }
        }


class DocumentType(str, Enum):
    """Enum für Dokumententypen"""
    INVOICE = "invoice"
    RECEIPT = "receipt"
    CREDIT_NOTE = "credit_note"
    BANK_STATEMENT = "bank_statement"
    CONTRACT = "contract"
    OTHER = "other"


class DocumentAnalysisRequest(BaseModel):
    """Anfrage-Modell für die Dokumentenanalyse"""
    
    document_type: DocumentType = Field(..., description="Typ des Dokuments")
    document_content: str = Field(..., description="Textinhalt des Dokuments")
    language: Optional[str] = Field("de", description="Sprache des Dokuments")
    extract_line_items: Optional[bool] = Field(True, description="Einzelposten extrahieren")
    suggest_accounts: Optional[bool] = Field(True, description="Kontierung vorschlagen")


class DocumentAnalysisResponse(BaseModel):
    """Antwort-Modell für die Dokumentenanalyse"""
    
    document_type: DocumentType = Field(..., description="Typ des Dokuments")
    extracted_data: Dict[str, Any] = Field(..., description="Extrahierte Daten aus dem Dokument")
    suggested_accounts: List[Dict[str, str]] = Field(..., description="Vorgeschlagene Konten für die Buchung")
    confidence: float = Field(..., ge=0, le=1, description="Konfidenzwert der Analyse (0-1)")
    provider_info: Dict[str, str] = Field(..., description="Informationen zum verwendeten LLM-Provider")
    
    class Config:
        schema_extra = {
            "example": {
                "document_type": "invoice",
                "extracted_data": {
                    "document_number": "RE-2023-12345",
                    "date": "2023-05-15",
                    "total_amount": 119.0,
                    "tax_amount": 19.0,
                    "tax_rate": 19,
                    "vendor": "Büro Plus GmbH",
                    "line_items": [
                        {"description": "Druckerpapier A4", "quantity": 5, "unit_price": 4.0, "total": 20.0},
                        {"description": "Kugelschreiber", "quantity": 20, "unit_price": 1.0, "total": 20.0},
                        {"description": "Aktenordner", "quantity": 10, "unit_price": 6.0, "total": 60.0}
                    ],
                    "payment_terms": "Zahlbar bis 30.05.2023"
                },
                "suggested_accounts": [
                    {
                        "account_number": "4400",
                        "name": "Büromaterial",
                        "description": "Für die Büromaterialien (Papier, Stifte, Ordner)"
                    }
                ],
                "confidence": 0.85,
                "provider_info": {
                    "provider": "openai",
                    "model": "gpt-4",
                    "version": "1.0"
                }
            }
        }


class TransactionForAnalysis(BaseModel):
    """Modell für eine zu analysierende Transaktion in der Anomalieerkennung"""
    
    transaction_id: str = Field(..., description="ID der Transaktion")
    description: str = Field(..., description="Beschreibung der Transaktion")
    amount: float = Field(..., description="Betrag der Transaktion")
    currency: str = Field("EUR", description="Währung der Transaktion")
    transaction_date: Union[date, datetime, str] = Field(..., description="Datum der Transaktion")
    account_number: str = Field(..., description="Kontonummer")
    counterparty_account: Optional[str] = Field(None, description="Gegenkonto")
    
    @validator("transaction_date")
    def validate_date(cls, v):
        """Konvertiert String-Datum in date-Objekt"""
        if isinstance(v, str):
            try:
                return datetime.strptime(v, "%Y-%m-%d").date()
            except ValueError:
                try:
                    return datetime.fromisoformat(v).date()
                except ValueError:
                    raise ValueError("Datum muss im Format YYYY-MM-DD oder ISO-Format sein")
        return v


class AnalysisContext(BaseModel):
    """Kontextinformationen für die Anomalieerkennung"""
    
    typical_patterns: Optional[str] = Field(None, description="Beschreibung typischer Transaktionsmuster")
    typical_amounts: Optional[str] = Field(None, description="Beschreibung typischer Beträge")
    account_description: Optional[str] = Field(None, description="Beschreibung des Kontos/der Konten")
    time_period: Optional[str] = Field(None, description="Betrachteter Zeitraum")


class AnomalyDetectionRequest(BaseModel):
    """Anfrage-Modell für die Anomalieerkennung"""
    
    transactions: List[TransactionForAnalysis] = Field(..., description="Liste der zu analysierenden Transaktionen")
    context: Optional[AnalysisContext] = Field(None, description="Kontextinformationen für die Analyse")
    
    @validator("transactions")
    def validate_transactions(cls, v):
        """Validiert, dass mindestens eine Transaktion vorhanden ist"""
        if not v:
            raise ValueError("Mindestens eine Transaktion muss angegeben werden")
        return v


class Anomaly(BaseModel):
    """Modell für eine erkannte Anomalie"""
    
    transaction_id: str = Field(..., description="ID der Transaktion mit Anomalie")
    severity: float = Field(..., ge=0, le=10, description="Schweregrad der Anomalie (0-10)")
    reason: str = Field(..., description="Begründung für die Anomalieeinstufung")


class AnomalyDetectionResponse(BaseModel):
    """Antwort-Modell für die Anomalieerkennung"""
    
    analyzed_transactions: int = Field(..., description="Anzahl der analysierten Transaktionen")
    anomalies: List[Dict[str, Any]] = Field(..., description="Liste der erkannten Anomalien")
    summary: str = Field(..., description="Zusammenfassung der Analyseergebnisse")
    confidence: float = Field(..., ge=0, le=1, description="Konfidenzwert der Analyse (0-1)")
    provider_info: Dict[str, str] = Field(..., description="Informationen zum verwendeten LLM-Provider")
    
    class Config:
        schema_extra = {
            "example": {
                "analyzed_transactions": 50,
                "anomalies": [
                    {
                        "transaction_id": "TR12345",
                        "severity": 8.5,
                        "reason": "Ungewöhnlich hoher Betrag für Büromaterialien (10x höher als üblich)"
                    },
                    {
                        "transaction_id": "TR12378",
                        "severity": 6.0,
                        "reason": "Ungewöhnliche Buchungszeit (3:00 Uhr nachts)"
                    }
                ],
                "summary": "Von 50 analysierten Transaktionen wurden 2 Anomalien mit hohem Schweregrad erkannt.",
                "confidence": 0.92,
                "provider_info": {
                    "provider": "openai",
                    "model": "gpt-4",
                    "version": "1.0"
                }
            }
        } 