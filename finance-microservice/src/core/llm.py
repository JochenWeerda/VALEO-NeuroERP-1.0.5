#!/usr/bin/env python
"""
LLM-Integration für den Finance Microservice.
Dieses Modul enthält die Klassen und Funktionen für die Integration mit verschiedenen
LLM-Providern (OpenAI, Anthropic, lokales LLM).
"""

import os
import json
import re
import time
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional, Tuple, Union
from functools import lru_cache

import httpx
import structlog
from fastapi import Depends, HTTPException
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)

from src.core.config import settings
from src.core.cache import get_redis

logger = structlog.get_logger(__name__)


class LLMProvider(ABC):
    """Abstrakte Basisklasse für verschiedene LLM-Provider."""
    
    def __init__(self):
        self.provider_name = "base"
        self.model_name = "unknown"
        self.initialized = False
        self.api_key = None
    
    @abstractmethod
    async def generate_text(
        self,
        system_prompt: str,
        user_prompt: str,
        max_tokens: int = 1024,
        temperature: float = 0.1,
    ) -> str:
        """
        Generiert Text mit dem LLM basierend auf dem angegebenen System- und Benutzer-Prompt.
        
        Args:
            system_prompt: Der Systemprompt, der das Verhalten des LLM definiert
            user_prompt: Der Benutzerprompt mit der eigentlichen Anfrage
            max_tokens: Maximale Anzahl von Tokens in der Antwort
            temperature: Zufälligkeit der Antwort (0.0 bis 1.0)
            
        Returns:
            Der generierte Text als String
        """
        pass
    
    @abstractmethod
    def get_provider_info(self) -> Dict[str, str]:
        """Liefert Informationen über den verwendeten LLM-Provider."""
        pass
    
    def parse_structured_response(
        self, response: str, expected_fields: List[str]
    ) -> Dict[str, Any]:
        """
        Analysiert die Antwort des LLM und extrahiert strukturierte Informationen.
        
        Args:
            response: Die Antwort des LLM
            expected_fields: Liste der erwarteten Felder
            
        Returns:
            Ein Dictionary mit den extrahierten Informationen
        """
        # Versuchen, JSON-Blöcke zu finden
        json_pattern = r"```json\s*([\s\S]*?)\s*```"
        matches = re.findall(json_pattern, response)
        
        if matches:
            try:
                # Versuche den ersten JSON-Block zu parsen
                return json.loads(matches[0])
            except json.JSONDecodeError:
                logger.warning("Konnte JSON in der Antwort nicht parsen", response=response[:100])
        
        # Alternativ versuchen, Schlüssel-Wert-Paare im Text zu finden
        result = {}
        for field in expected_fields:
            # Pattern für Feld: FELD: Wert oder FELD=Wert oder "FELD": Wert
            patterns = [
                rf"{field}:\s*(.*?)(?=\n\S+:|$)",
                rf"{field}=\s*(.*?)(?=\n\S+=|$)",
                rf'"{field}":\s*(.*?)(?=,\s*"\S+"|}})',
            ]
            
            for pattern in patterns:
                matches = re.findall(pattern, response, re.IGNORECASE)
                if matches:
                    result[field] = matches[0].strip()
                    break
        
        return result
    
    def extract_account_suggestions(self, response: str) -> List[Dict[str, str]]:
        """
        Extrahiert Kontovorschläge aus der LLM-Antwort.
        
        Args:
            response: Die Antwort des LLM
            
        Returns:
            Eine Liste von Dictionaries mit Kontonummer, Bezeichnung und Begründung
        """
        # Versuchen, JSON-Blöcke zu finden
        json_pattern = r"```json\s*([\s\S]*?)\s*```"
        matches = re.findall(json_pattern, response)
        
        if matches:
            try:
                data = json.loads(matches[0])
                if isinstance(data, list):
                    return data
                elif "accounts" in data and isinstance(data["accounts"], list):
                    return data["accounts"]
            except json.JSONDecodeError:
                logger.warning("Konnte JSON für Kontovorschläge nicht parsen", response=response[:100])
        
        # Alternativ reguläre Ausdrücke verwenden, um strukturierte Daten zu extrahieren
        accounts = []
        
        # Muster für Kontovorschläge im Format "1. Kontonummer - Bezeichnung: Begründung"
        account_pattern = r"(\d+)[\.:\)]\s*(?:Konto[:\s]*)?(\d+)[:\s-]+([^\n:]+)(?:[:\s]+(.+?)(?=\n\d+[\.:\)]|$|\n\n))"
        matches = re.findall(account_pattern, response)
        
        if matches:
            for idx, account_number, name, description in matches:
                accounts.append({
                    "account_number": account_number.strip(),
                    "name": name.strip(),
                    "description": description.strip()
                })
            
            return accounts
        
        # Wenn keine Struktur gefunden wurde, leere Liste zurückgeben
        return []
    
    def extract_anomalies(self, response: str) -> List[Dict[str, Any]]:
        """
        Extrahiert Anomalien aus der LLM-Antwort.
        
        Args:
            response: Die Antwort des LLM
            
        Returns:
            Eine Liste von Dictionaries mit Anomalieinformationen
        """
        # Versuchen, JSON-Blöcke zu finden
        json_pattern = r"```json\s*([\s\S]*?)\s*```"
        matches = re.findall(json_pattern, response)
        
        if matches:
            try:
                data = json.loads(matches[0])
                if isinstance(data, list):
                    return data
                elif "anomalies" in data and isinstance(data["anomalies"], list):
                    return data["anomalies"]
            except json.JSONDecodeError:
                logger.warning("Konnte JSON für Anomalien nicht parsen", response=response[:100])
        
        # Alternativ reguläre Ausdrücke verwenden, um strukturierte Daten zu extrahieren
        anomalies = []
        
        # Muster für Anomalien im Format "1. Transaktion XYZ: Schweregrad N - Begründung"
        anomaly_pattern = r"(\d+)[\.:\)]\s*(?:Transaktion|Transaction)?[:\s]*([^\n:]+)(?:[:\s]+)(?:Schweregrad|Severity)[:\s]*(\d+)[/\d]*\s*[-:]\s*(.+?)(?=\n\d+[\.:\)]|$|\n\n)"
        matches = re.findall(anomaly_pattern, response)
        
        if matches:
            for idx, transaction_id, severity, reason in matches:
                try:
                    severity_score = float(severity.strip())
                except ValueError:
                    severity_score = 0.0
                
                anomalies.append({
                    "transaction_id": transaction_id.strip(),
                    "severity": severity_score,
                    "reason": reason.strip()
                })
            
            return anomalies
        
        # Wenn keine Struktur gefunden wurde, leere Liste zurückgeben
        return []
    
    def extract_summary(self, response: str) -> Optional[str]:
        """
        Extrahiert eine Zusammenfassung aus der LLM-Antwort.
        
        Args:
            response: Die Antwort des LLM
            
        Returns:
            Die extrahierte Zusammenfassung oder None
        """
        # Muster für eine Zusammenfassung im Format "Zusammenfassung:" oder "Summary:"
        summary_pattern = r"(?:Zusammenfassung|Summary)[:\s]+(.+?)(?=\n\n|\n#|\n\d+[\.:\)]|$)"
        matches = re.findall(summary_pattern, response, re.IGNORECASE)
        
        if matches:
            return matches[0].strip()
        
        return None
    
    def calculate_confidence(self, response: str) -> float:
        """
        Berechnet einen Konfidenzwert basierend auf der LLM-Antwort.
        
        Args:
            response: Die Antwort des LLM
            
        Returns:
            Ein Konfidenzwert zwischen 0.0 und 1.0
        """
        # Einfache Heuristik: Konfidenz basierend auf der Strukturiertheit der Antwort
        
        # Enthält die Antwort JSON?
        if "```json" in response:
            return 0.9
        
        # Enthält die Antwort Schlüsselwortpaare?
        if re.search(r"\w+:\s*\S+", response):
            return 0.75
        
        # Enthält die Antwort nummerierte Listen?
        if re.search(r"\d+\.\s+\S+", response):
            return 0.6
        
        # Antwort scheint wenig strukturiert zu sein
        return 0.4


class OpenAIProvider(LLMProvider):
    """LLM-Provider für OpenAI-Modelle."""
    
    def __init__(self, api_key: Optional[str] = None):
        super().__init__()
        
        self.provider_name = "openai"
        self.model_name = settings.OPENAI_MODEL
        self.api_key = api_key or settings.OPENAI_API_KEY
        
        if not self.api_key:
            logger.warning("OpenAI API-Schlüssel nicht konfiguriert")
            self.initialized = False
        else:
            self.initialized = True
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((httpx.HTTPError, httpx.TimeoutException)),
    )
    async def generate_text(
        self,
        system_prompt: str,
        user_prompt: str,
        max_tokens: int = 1024,
        temperature: float = 0.1,
    ) -> str:
        """
        Generiert Text mit OpenAI-Modellen.
        
        Args:
            system_prompt: Der Systemprompt, der das Verhalten des LLM definiert
            user_prompt: Der Benutzerprompt mit der eigentlichen Anfrage
            max_tokens: Maximale Anzahl von Tokens in der Antwort
            temperature: Zufälligkeit der Antwort (0.0 bis 1.0)
            
        Returns:
            Der generierte Text als String
        """
        if not self.initialized:
            raise HTTPException(
                status_code=503, 
                detail="OpenAI-Provider nicht initialisiert"
            )
        
        # OpenAI API-Anfrage
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
        }
        
        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "max_tokens": max_tokens,
            "temperature": temperature,
        }
        
        start_time = time.time()
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers=headers,
                    json=payload,
                )
                response.raise_for_status()
                result = response.json()
                
                # Logge Token-Nutzung
                if "usage" in result:
                    usage = result["usage"]
                    logger.info(
                        "OpenAI-Anfrage abgeschlossen",
                        prompt_tokens=usage.get("prompt_tokens", 0),
                        completion_tokens=usage.get("completion_tokens", 0),
                        total_tokens=usage.get("total_tokens", 0),
                        latency=time.time() - start_time,
                    )
                
                # Extrahiere den generierten Text
                if "choices" in result and len(result["choices"]) > 0:
                    return result["choices"][0]["message"]["content"]
                else:
                    raise ValueError("Keine Antwort vom OpenAI-API erhalten")
                
        except httpx.HTTPStatusError as e:
            logger.error(
                "HTTP-Fehler bei OpenAI-Anfrage",
                status_code=e.response.status_code,
                response=e.response.text,
            )
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Fehler bei OpenAI-Anfrage: {e.response.text}"
            )
            
        except httpx.RequestError as e:
            logger.error("Netzwerkfehler bei OpenAI-Anfrage", error=str(e))
            raise HTTPException(
                status_code=500,
                detail=f"Netzwerkfehler bei OpenAI-Anfrage: {str(e)}"
            )
            
        except Exception as e:
            logger.error("Unerwarteter Fehler bei OpenAI-Anfrage", error=str(e))
            raise HTTPException(
                status_code=500,
                detail=f"Unerwarteter Fehler bei OpenAI-Anfrage: {str(e)}"
            )
    
    def get_provider_info(self) -> Dict[str, str]:
        """Liefert Informationen über den verwendeten OpenAI-Provider."""
        return {
            "provider": self.provider_name,
            "model": self.model_name,
            "version": "1.0",
        }


class AnthropicProvider(LLMProvider):
    """LLM-Provider für Anthropic-Modelle."""
    
    def __init__(self, api_key: Optional[str] = None):
        super().__init__()
        
        self.provider_name = "anthropic"
        self.model_name = settings.ANTHROPIC_MODEL
        self.api_key = api_key or settings.ANTHROPIC_API_KEY
        
        if not self.api_key:
            logger.warning("Anthropic API-Schlüssel nicht konfiguriert")
            self.initialized = False
        else:
            self.initialized = True
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((httpx.HTTPError, httpx.TimeoutException)),
    )
    async def generate_text(
        self,
        system_prompt: str,
        user_prompt: str,
        max_tokens: int = 1024,
        temperature: float = 0.1,
    ) -> str:
        """
        Generiert Text mit Anthropic-Modellen.
        
        Args:
            system_prompt: Der Systemprompt, der das Verhalten des LLM definiert
            user_prompt: Der Benutzerprompt mit der eigentlichen Anfrage
            max_tokens: Maximale Anzahl von Tokens in der Antwort
            temperature: Zufälligkeit der Antwort (0.0 bis 1.0)
            
        Returns:
            Der generierte Text als String
        """
        if not self.initialized:
            raise HTTPException(
                status_code=503, 
                detail="Anthropic-Provider nicht initialisiert"
            )
        
        # Anthropic API-Anfrage
        headers = {
            "Content-Type": "application/json",
            "X-API-Key": self.api_key,
            "anthropic-version": "2023-06-01",
        }
        
        payload = {
            "model": self.model_name,
            "system": system_prompt,
            "messages": [
                {"role": "user", "content": user_prompt},
            ],
            "max_tokens": max_tokens,
            "temperature": temperature,
        }
        
        start_time = time.time()
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers=headers,
                    json=payload,
                )
                response.raise_for_status()
                result = response.json()
                
                # Logge Token-Nutzung
                logger.info(
                    "Anthropic-Anfrage abgeschlossen",
                    latency=time.time() - start_time,
                )
                
                # Extrahiere den generierten Text
                if "content" in result and len(result["content"]) > 0:
                    content_blocks = [
                        block["text"] 
                        for block in result["content"] 
                        if block["type"] == "text"
                    ]
                    return " ".join(content_blocks)
                else:
                    raise ValueError("Keine Antwort von Anthropic-API erhalten")
                
        except httpx.HTTPStatusError as e:
            logger.error(
                "HTTP-Fehler bei Anthropic-Anfrage",
                status_code=e.response.status_code,
                response=e.response.text,
            )
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Fehler bei Anthropic-Anfrage: {e.response.text}"
            )
            
        except httpx.RequestError as e:
            logger.error("Netzwerkfehler bei Anthropic-Anfrage", error=str(e))
            raise HTTPException(
                status_code=500,
                detail=f"Netzwerkfehler bei Anthropic-Anfrage: {str(e)}"
            )
            
        except Exception as e:
            logger.error("Unerwarteter Fehler bei Anthropic-Anfrage", error=str(e))
            raise HTTPException(
                status_code=500,
                detail=f"Unerwarteter Fehler bei Anthropic-Anfrage: {str(e)}"
            )
    
    def get_provider_info(self) -> Dict[str, str]:
        """Liefert Informationen über den verwendeten Anthropic-Provider."""
        return {
            "provider": self.provider_name,
            "model": self.model_name,
            "version": "1.0",
        }


class LocalLLMProvider(LLMProvider):
    """LLM-Provider für lokale LLM-Server."""
    
    def __init__(self, api_url: Optional[str] = None):
        super().__init__()
        
        self.provider_name = "local"
        self.model_name = settings.LOCAL_LLM_MODEL
        self.api_url = api_url or settings.LOCAL_LLM_URL
        
        if not self.api_url:
            logger.warning("Lokale LLM-URL nicht konfiguriert")
            self.initialized = False
        else:
            self.initialized = True
    
    @retry(
        stop=stop_after_attempt(2),
        wait=wait_exponential(multiplier=1, min=1, max=3),
        retry=retry_if_exception_type((httpx.HTTPError, httpx.TimeoutException)),
    )
    async def generate_text(
        self,
        system_prompt: str,
        user_prompt: str,
        max_tokens: int = 1024,
        temperature: float = 0.1,
    ) -> str:
        """
        Generiert Text mit einem lokalen LLM-Server.
        
        Args:
            system_prompt: Der Systemprompt, der das Verhalten des LLM definiert
            user_prompt: Der Benutzerprompt mit der eigentlichen Anfrage
            max_tokens: Maximale Anzahl von Tokens in der Antwort
            temperature: Zufälligkeit der Antwort (0.0 bis 1.0)
            
        Returns:
            Der generierte Text als String
        """
        if not self.initialized:
            raise HTTPException(
                status_code=503, 
                detail="Lokaler LLM-Provider nicht initialisiert"
            )
        
        # Die Payload an den lokalen LLM-Server anpassen (z.B. llama.cpp-Server)
        headers = {"Content-Type": "application/json"}
        
        # llama.cpp Server verwendet ein OpenAI-kompatibles API-Format
        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "max_tokens": max_tokens,
            "temperature": temperature,
            "stream": False,
        }
        
        start_time = time.time()
        
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:  # Längeres Timeout für lokale Modelle
                response = await client.post(
                    f"{self.api_url}/chat/completions",
                    headers=headers,
                    json=payload,
                )
                response.raise_for_status()
                result = response.json()
                
                # Logge Latenz
                logger.info(
                    "Lokale LLM-Anfrage abgeschlossen",
                    latency=time.time() - start_time,
                )
                
                # Extrahiere den generierten Text (OpenAI-kompatibles Format)
                if "choices" in result and len(result["choices"]) > 0:
                    return result["choices"][0]["message"]["content"]
                else:
                    raise ValueError("Keine Antwort vom lokalen LLM-Server erhalten")
                
        except httpx.HTTPStatusError as e:
            logger.error(
                "HTTP-Fehler bei lokaler LLM-Anfrage",
                status_code=e.response.status_code,
                response=e.response.text,
            )
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Fehler bei lokaler LLM-Anfrage: {e.response.text}"
            )
            
        except httpx.RequestError as e:
            logger.error("Netzwerkfehler bei lokaler LLM-Anfrage", error=str(e))
            raise HTTPException(
                status_code=500,
                detail=f"Netzwerkfehler bei lokaler LLM-Anfrage: {str(e)}"
            )
            
        except Exception as e:
            logger.error("Unerwarteter Fehler bei lokaler LLM-Anfrage", error=str(e))
            raise HTTPException(
                status_code=500,
                detail=f"Unerwarteter Fehler bei lokaler LLM-Anfrage: {str(e)}"
            )
    
    def get_provider_info(self) -> Dict[str, str]:
        """Liefert Informationen über den verwendeten lokalen LLM-Provider."""
        return {
            "provider": self.provider_name,
            "model": self.model_name,
            "version": "1.0",
        }


@lru_cache()
def get_configured_providers() -> List[Tuple[str, bool]]:
    """
    Gibt eine Liste der konfigurierten LLM-Provider zurück.
    
    Returns:
        Eine Liste von Tupeln mit Provider-Name und Verfügbarkeitsstatus
    """
    providers = []
    
    # OpenAI
    if settings.OPENAI_API_KEY:
        providers.append(("openai", True))
    else:
        providers.append(("openai", False))
    
    # Anthropic
    if settings.ANTHROPIC_API_KEY:
        providers.append(("anthropic", True))
    else:
        providers.append(("anthropic", False))
    
    # Lokales LLM
    if settings.LOCAL_LLM_URL:
        providers.append(("local", True))
    else:
        providers.append(("local", False))
    
    return providers


async def get_llm_provider() -> LLMProvider:
    """
    Dependency-Funktion, die einen konfigurierten LLM-Provider zurückgibt.
    Verwendet den in den Einstellungen konfigurierten Standard-Provider
    oder wählt den ersten verfügbaren Provider aus.
    
    Returns:
        Eine initialisierte LLM-Provider-Instanz
    """
    if not settings.LLM_ENABLED:
        raise HTTPException(
            status_code=503,
            detail="LLM-Funktionen sind deaktiviert"
        )
    
    # Prüfe konfigurierten Standard-Provider
    default_provider = settings.DEFAULT_LLM_PROVIDER
    
    if default_provider == "openai" and settings.OPENAI_API_KEY:
        return OpenAIProvider()
    elif default_provider == "anthropic" and settings.ANTHROPIC_API_KEY:
        return AnthropicProvider()
    elif default_provider == "local" and settings.LOCAL_LLM_URL:
        return LocalLLMProvider()
    
    # Wenn der Standard-Provider nicht verfügbar ist, versuche einen anderen
    if settings.OPENAI_API_KEY:
        logger.info("Verwende OpenAI als Fallback-Provider")
        return OpenAIProvider()
    elif settings.ANTHROPIC_API_KEY:
        logger.info("Verwende Anthropic als Fallback-Provider")
        return AnthropicProvider()
    elif settings.LOCAL_LLM_URL:
        logger.info("Verwende lokales LLM als Fallback-Provider")
        return LocalLLMProvider()
    
    # Kein Provider verfügbar
    raise HTTPException(
        status_code=503,
        detail="Kein LLM-Provider konfiguriert"
    )


async def get_fallback_llm_provider() -> Optional[LLMProvider]:
    """
    Gibt einen alternativen LLM-Provider zurück, der als Fallback verwendet werden kann.
    
    Returns:
        Eine initialisierte LLM-Provider-Instanz oder None, wenn kein Fallback verfügbar ist
    """
    primary_provider = settings.DEFAULT_LLM_PROVIDER
    
    # Versuche, einen anderen Provider als den primären zu finden
    if primary_provider != "openai" and settings.OPENAI_API_KEY:
        return OpenAIProvider()
    elif primary_provider != "anthropic" and settings.ANTHROPIC_API_KEY:
        return AnthropicProvider()
    elif primary_provider != "local" and settings.LOCAL_LLM_URL:
        return LocalLLMProvider()
    
    # Kein alternativer Provider verfügbar
    return None 