"""
LLM-Service für das APM-Framework.
Integriert verschiedene LLM-APIs für bessere VAN-Analysen.
"""

import os
import logging
import asyncio
import aiohttp
from typing import Dict, List, Any, Optional, Union
from enum import Enum
from datetime import datetime
import json

# Logger konfigurieren
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# .env laden, falls vorhanden (robuste Suche)
try:
    from dotenv import load_dotenv, find_dotenv  # type: ignore
    _env_path = find_dotenv(usecwd=True)
    if _env_path:
        load_dotenv(_env_path, override=False)
    else:
        load_dotenv()
except Exception:
    pass


class LLMProvider(Enum):
    """Verfügbare LLM-Provider"""
    OPENAI = "openai"
    CLAUDE = "claude"
    DEEPSEEK = "deepseek"
    OLLAMA = "ollama"  # Lokale LLMs über Ollama
    MOCK = "mock"  # Für Tests und Entwicklung


class LLMService:
    """
    LLM-Service für das APM-Framework.
    
    Unterstützt verschiedene LLM-Provider:
    - OpenAI GPT-4/3.5
    - Anthropic Claude
    - DeepSeek
    - Ollama (lokale LLMs)
    - Mock-LLM für Entwicklung
    """
    
    def __init__(self, provider: LLMProvider = LLMProvider.MOCK):
        """
        Initialisiert den LLM-Service.
        
        Args:
            provider: LLM-Provider
        """
        self.provider = provider
        self.api_key = self._get_api_key()
        self.base_url = self._get_base_url()
        self.session = None
        
        logger.info(f"LLM-Service initialisiert mit Provider: {provider.value}")
    
    def _get_api_key(self) -> Optional[str]:
        """Holt den API-Key für den konfigurierten Provider."""
        provider_env_map = {
            LLMProvider.OPENAI: "OPENAI_API_KEY",
            LLMProvider.CLAUDE: "ANTHROPIC_API_KEY",
            LLMProvider.DEEPSEEK: "DEEPSEEK_API_KEY",
            LLMProvider.OLLAMA: "OLLAMA_API_KEY"  # Optional für Ollama
        }
        
        env_var = provider_env_map.get(self.provider)
        if env_var:
            return os.getenv(env_var)
        return None
    
    def _get_base_url(self) -> str:
        """Holt die Base-URL für den konfigurierten Provider."""
        provider_url_map = {
            LLMProvider.OPENAI: "https://api.openai.com/v1",
            LLMProvider.CLAUDE: "https://api.anthropic.com/v1",
            LLMProvider.DEEPSEEK: "https://api.deepseek.com/v1",
            LLMProvider.OLLAMA: os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")  # Standard Ollama-URL
        }
        
        return provider_url_map.get(self.provider, "")
    
    async def __aenter__(self):
        """Async Context Manager Entry."""
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async Context Manager Exit."""
        if self.session:
            await self.session.close()
            self.session = None
    
    async def analyze_requirement(self, requirement_text: str, context: Dict[str, Any] = None) -> str:
        """
        Analysiert eine Anforderung mit dem konfigurierten LLM.
        
        Args:
            requirement_text: Text der Anforderung
            context: Zusätzlicher Kontext
            
        Returns:
            Strukturierte Analyse der Anforderung
        """
        try:
            if self.provider == LLMProvider.MOCK:
                return await self._mock_requirement_analysis(requirement_text, context)
            
            prompt = self._build_requirement_analysis_prompt(requirement_text, context)
            response = await self._call_llm_api(prompt)
            
            logger.info(f"Anforderungsanalyse mit {self.provider.value} abgeschlossen")
            return response
            
        except Exception as e:
            logger.error(f"Fehler bei der Anforderungsanalyse: {str(e)}")
            # Fallback zu Mock-Response
            return await self._mock_requirement_analysis(requirement_text, context)
    
    async def generate_clarification_questions(self, analysis_text: str, context: Dict[str, Any] = None) -> List[str]:
        """
        Generiert Klärungsfragen basierend auf einer Analyse.
        
        Args:
            analysis_text: Analyse-Text
            context: Zusätzlicher Kontext
            
        Returns:
            Liste von Klärungsfragen
        """
        try:
            if self.provider == LLMProvider.MOCK:
                return await self._mock_clarification_questions(analysis_text, context)
            
            prompt = self._build_clarification_prompt(analysis_text, context)
            response = await self._call_llm_api(prompt)
            
            # Fragen aus der Antwort extrahieren
            questions = self._extract_questions_from_response(response)
            
            logger.info(f"Klärungsfragen mit {self.provider.value} generiert: {len(questions)}")
            return questions
            
        except Exception as e:
            logger.error(f"Fehler bei der Generierung von Klärungsfragen: {str(e)}")
            # Fallback zu Mock-Response
            return await self._mock_clarification_questions(analysis_text, context)
    
    def _build_requirement_analysis_prompt(self, requirement_text: str, context: Dict[str, Any] = None) -> Dict[str, str]:
        """Baut den Prompt für die Anforderungsanalyse."""
        system_prompt = """Du bist ein erfahrener Business Analyst für ERP-Systeme. 
Analysiere die folgende Anforderung strukturiert und detailliert.

Berücksichtige dabei:
1. Funktionale Anforderungen (Was soll das System tun?)
2. Nicht-funktionale Anforderungen (Performance, Sicherheit, Verfügbarkeit)
3. Systemgrenzen und Schnittstellen
4. Mögliche Herausforderungen oder Unklarheiten
5. Empfohlene nächste Schritte

Gib eine strukturierte Analyse in Markdown-Format zurück."""

        user_prompt = f"""
Anforderung: {requirement_text}

Zusätzlicher Kontext: {json.dumps(context, ensure_ascii=False) if context else 'Kein zusätzlicher Kontext verfügbar'}

Bitte analysiere diese Anforderung für das VALEO NeuroERP-System.
"""

        return {
            "system": system_prompt,
            "user": user_prompt
        }
    
    def _build_clarification_prompt(self, analysis_text: str, context: Dict[str, Any] = None) -> Dict[str, str]:
        """Baut den Prompt für die Generierung von Klärungsfragen."""
        system_prompt = """Du bist ein erfahrener Business Analyst. 
Basierend auf der folgenden Analyse generiere 3-5 präzise Klärungsfragen, 
die helfen würden, die Anforderung besser zu verstehen.

Die Fragen sollten:
- Spezifisch und handlungsorientiert sein
- Verschiedene Aspekte der Anforderung abdecken
- Stakeholder zur Klärung wichtiger Details anregen
- In einer klaren, verständlichen Sprache formuliert sein

Gib nur die Fragen zurück, eine pro Zeile, ohne Nummerierung."""

        user_prompt = f"""
Analyse: {analysis_text}

Kontext: {json.dumps(context, ensure_ascii=False) if context else 'Kein zusätzlicher Kontext verfügbar'}

Generiere Klärungsfragen:
"""

        return {
            "system": system_prompt,
            "user": user_prompt
        }
    
    async def _call_llm_api(self, prompt: Dict[str, str]) -> str:
        """Ruft die konfigurierte LLM-API auf (mit sauberem Session-Lebenszyklus)."""
        try:
            async with aiohttp.ClientSession() as session:
                # Temporäre Session auf Instanz setzen, damit Provider-Methoden sie verwenden
                self.session = session
                if self.provider == LLMProvider.OPENAI:
                    return await self._call_openai_api(prompt)
                elif self.provider == LLMProvider.CLAUDE:
                    return await self._call_claude_api(prompt)
                elif self.provider == LLMProvider.DEEPSEEK:
                    return await self._call_deepseek_api(prompt)
                elif self.provider == LLMProvider.OLLAMA:
                    return await self._call_ollama_api(prompt)
                else:
                    raise ValueError(f"Unbekannter LLM-Provider: {self.provider}")
        except Exception as e:
            logger.error(f"Fehler beim API-Aufruf: {str(e)}")
            raise
        finally:
            # Session-Referenz aufräumen
            self.session = None
    
    async def _call_openai_api(self, prompt: Dict[str, str]) -> str:
        """Ruft die OpenAI API auf."""
        if not self.api_key:
            raise Exception("OPENAI_API_KEY nicht gesetzt (aus .env laden oder Umgebungsvariable setzen)")
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        model = os.getenv("OPENAI_MODEL", "gpt-5")
        
        data = {
            "model": model,
            "messages": [
                {"role": "system", "content": prompt["system"]},
                {"role": "user", "content": prompt["user"]}
            ],
            "max_tokens": int(os.getenv("OPENAI_MAX_TOKENS", "2000")),
            "temperature": float(os.getenv("OPENAI_TEMPERATURE", "0.3"))
        }
        
        async with self.session.post(
            f"{self.base_url}/chat/completions",
            headers=headers,
            json=data
        ) as response:
            if response.status != 200:
                text = await response.text()
                raise Exception(f"OpenAI API Fehler: {response.status} - {text}")
            
            result = await response.json()
            return result["choices"][0]["message"]["content"]
    
    async def _call_claude_api(self, prompt: Dict[str, str]) -> str:
        """Ruft die Claude API auf."""
        headers = {
            "x-api-key": self.api_key,
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01"
        }
        
        data = {
            "model": "claude-3-sonnet-20240229",
            "max_tokens": 2000,
            "messages": [
                {"role": "user", "content": f"{prompt['system']}\n\n{prompt['user']}"}
            ]
        }
        
        async with self.session.post(
            f"{self.base_url}/messages",
            headers=headers,
            json=data
        ) as response:
            if response.status != 200:
                text = await response.text()
                raise Exception(f"Claude API Fehler: {response.status} - {text}")
            
            result = await response.json()
            return result["content"][0]["text"]
    
    async def _call_deepseek_api(self, prompt: Dict[str, str]) -> str:
        """Ruft die DeepSeek API auf."""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "deepseek-chat",
            "messages": [
                {"role": "system", "content": prompt["system"]},
                {"role": "user", "content": prompt["user"]}
            ],
            "max_tokens": 2000,
            "temperature": 0.3
        }
        
        async with self.session.post(
            f"{self.base_url}/chat/completions",
            headers=headers,
            json=data
        ) as response:
            if response.status != 200:
                text = await response.text()
                raise Exception(f"DeepSeek API Fehler: {response.status} - {text}")
            
            result = await response.json()
            return result["choices"][0]["message"]["content"]
    
    async def _call_ollama_api(self, prompt: Dict[str, str]) -> str:
        """Ruft die lokale Ollama API auf."""
        model = os.getenv("OLLAMA_MODEL", "llama3.2:3b")
        
        data = {
            "model": model,
            "messages": [
                {"role": "system", "content": prompt["system"]},
                {"role": "user", "content": prompt["user"]}
            ],
            "stream": False,
            "options": {
                "temperature": 0.3,
                "top_p": 0.9,
                "num_predict": 2000
            }
        }
        
        async with self.session.post(
            f"{self.base_url}/api/chat",
            json=data
        ) as response:
            if response.status != 200:
                text = await response.text()
                raise Exception(f"Ollama API Fehler: {response.status} - {text}")
            
            result = await response.json()
            return result["message"]["content"]
    
    def _extract_questions_from_response(self, response: str) -> List[str]:
        """Extrahiert Fragen aus der LLM-Antwort."""
        questions = []
        lines = response.strip().split('\n')
        
        for line in lines:
            line = line.strip()
            if line and ('?' in line or line.endswith('?')):
                for prefix in ['1.', '2.', '3.', '4.', '5.', '-', '*', '•']:
                    if line.startswith(prefix):
                        line = line[len(prefix):].strip()
                        break
                if line and line not in questions:
                    questions.append(line)
        
        return questions[:5]
    
    async def _mock_requirement_analysis(self, requirement_text: str, context: Dict[str, Any] = None) -> str:
        """Mock-Implementierung für die Anforderungsanalyse."""
        return f"""
# Anforderungsanalyse (Mock-LLM)

## Eingabe
{requirement_text}

## Funktionale Anforderungen
- **Kernfunktionalität**: Automatische Bestellungsprüfung
- **Validierung**: Vollständigkeit und Plausibilität
- **Klärungsfragen**: Intelligente Generierung bei Unklarheiten

## Nicht-funktionale Anforderungen
- **Performance**: Antwortzeit < 2 Sekunden
- **Sicherheit**: RBAC und Datenmaskierung
- **Verfügbarkeit**: 99.9% Uptime

## Systemgrenzen
- **Eingang**: EDI, API, UI
- **Ausgang**: ERP-System, WMS, CRM

## Herausforderungen
- Datenqualität und -konsistenz
- Integration mit Legacy-Systemen
- Skalierung bei wachsendem Volumen

## Nächste Schritte
1. Detaillierte Anforderungserhebung
2. Technische Machbarkeitsstudie
3. Prototyp-Entwicklung
4. Pilot-Implementierung

*Diese Analyse wurde mit dem Mock-LLM generiert. Für produktive Nutzung konfigurieren Sie einen echten LLM-Provider.*
        """
    
    async def _mock_clarification_questions(self, analysis_text: str, context: Dict[str, Any] = None) -> List[str]:
        """Mock-Implementierung für Klärungsfragen."""
        return [
            "Welche spezifischen Geschäftsregeln sollen bei der Bestellungsprüfung angewendet werden?",
            "Gibt es unterschiedliche Prüfregeln für verschiedene Kundensegmente?",
            "Wie sollen Ausnahmen von den Standardregeln behandelt werden?",
            "Welche ERP-Systeme müssen integriert werden?",
            "Welche Performance-Anforderungen gelten für Spitzenzeiten?"
        ]


# Factory-Funktion für einfache Erstellung
def create_llm_service(provider_name: str = "mock") -> LLMService:
    """
    Erstellt einen LLM-Service mit dem angegebenen Provider.
    
    Args:
        provider_name: Name des Providers (openai, claude, deepseek, ollama, mock)
        
    Returns:
        LLMService-Instanz
    """
    try:
        provider = LLMProvider(provider_name.lower())
        return LLMService(provider)
    except ValueError:
        logger.warning(f"Unbekannter Provider '{provider_name}', verwende Mock-LLM")
        return LLMService(LLMProvider.MOCK)


# Beispiel für die Verwendung
async def example_usage():
    """Beispiel für die Verwendung des LLM-Services."""
    async with LLMService(LLMProvider.MOCK) as llm:
        analysis = await llm.analyze_requirement(
            "Als Benutzer möchte ich Bestellungen automatisch prüfen lassen"
        )
        print("Analyse:", analysis)
        questions = await llm.generate_clarification_questions(analysis)
        print("Fragen:", questions)


if __name__ == "__main__":
    asyncio.run(example_usage())
