"""
VAN-Mode (Verstehen, Analysieren, Nachfragen) für das APM-Framework
"""

import logging
import asyncio
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
from bson import ObjectId

from backend.apm_framework.mongodb_connector import APMMongoDBConnector
from backend.apm_framework.models import ClarificationItem, RequirementAnalysis
from backend.apm_framework.llm_service import LLMService, LLMProvider

# Logger konfigurieren
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class VANMode:
    """
    Implementierung des VAN-Mode (Verstehen, Analysieren, Nachfragen)
    für das APM-Framework.
    """
    
    def __init__(self, mongodb: APMMongoDBConnector, project_id: str, llm_provider: str = "mock"):
        """
        Initialisiert den VAN-Mode.
        
        Args:
            mongodb: MongoDB-Connector
            project_id: Projekt-ID
            llm_provider: LLM-Provider (openai, claude, deepseek, mock)
        """
        self.mongodb = mongodb
        self.project_id = project_id
        self.rag_service = None  # Wird später initialisiert
        self.llm_service = None  # Wird später initialisiert
        
        # LLM-Service initialisieren
        try:
            self.llm_service = LLMService(LLMProvider(llm_provider.lower()))
            logger.info(f"LLM-Service mit Provider {llm_provider} initialisiert")
        except Exception as e:
            logger.warning(f"LLM-Service konnte nicht initialisiert werden: {e}, verwende Mock-LLM")
            self.llm_service = LLMService(LLMProvider.MOCK)
    
    def set_rag_service(self, rag_service: Any) -> None:
        """
        Setzt den RAG-Service.
        
        Args:
            rag_service: RAG-Service
        """
        self.rag_service = rag_service
    
    def set_llm_provider(self, provider_name: str) -> None:
        """
        Ändert den LLM-Provider.
        
        Args:
            provider_name: Name des neuen Providers
        """
        try:
            self.llm_service = LLMService(LLMProvider(provider_name.lower()))
            logger.info(f"LLM-Provider zu {provider_name} gewechselt")
        except Exception as e:
            logger.error(f"Fehler beim Wechseln des LLM-Providers: {e}")
    
    async def retrieve_project_context(self) -> List[Dict[str, Any]]:
        """
        Ruft den Projektkontext ab.
        
        Returns:
            Projektkontext
        """
        try:
            project_data = await self.mongodb.find_many(
                "apm_project_context",
                {"project_id": self.project_id}
            )
            logger.info(f"Projektkontext abgerufen: {len(project_data)} Einträge")
            return project_data
        except Exception as e:
            logger.error(f"Fehler beim Abrufen des Projektkontexts: {str(e)}")
            return []
    
    async def analyze_similar_requirements(self, requirement_text: str) -> List[Dict[str, Any]]:
        """
        Analysiert ähnliche Anforderungen.
        
        Args:
            requirement_text: Anforderungstext
            
        Returns:
            Ähnliche Anforderungen
        """
        try:
            # Vereinfachte Volltextsuche via Regex über relevante Felder
            filter_dict = {
                "$or": [
                    {"requirement": {"$regex": requirement_text, "$options": "i"}},
                    {"analysis": {"$regex": requirement_text, "$options": "i"}}
                ]
            }
            similar_reqs = await self.mongodb.find_many(
                "van_analysis",
                filter_dict=filter_dict,
                sort_field="timestamp",
                sort_order=-1,
                limit=5
            )
            
            logger.info(f"Ähnliche Anforderungen gefunden: {len(similar_reqs)}")
            return similar_reqs
        except Exception as e:
            logger.error(f"Fehler bei der Analyse ähnlicher Anforderungen: {str(e)}")
            return []
    
    async def store_clarification_qa(self, question: str, answer: Optional[str] = None) -> str:
        """
        Speichert eine Klärungsfrage und Antwort.
        
        Args:
            question: Frage
            answer: Antwort (optional)
            
        Returns:
            ID des gespeicherten Eintrags
        """
        try:
            clarification_item = ClarificationItem(
                project_id=self.project_id,
                phase="VAN",
                question=question,
                answer=answer,
                status="answered" if answer else "pending"
            )
            
            # In MongoDB speichern
            item_id = await self.mongodb.insert_one(
                "clarifications",
                clarification_item.dict(exclude_none=True)
            )
            
            logger.info(f"Klärungsfrage gespeichert: {item_id}")
            return item_id or ""
        except Exception as e:
            logger.error(f"Fehler beim Speichern der Klärungsfrage: {str(e)}")
            raise
    
    async def generate_questions_from_analysis(self, analysis_result: str) -> List[str]:
        """
        Generiert Klärungsfragen aus der Analyse.
        
        Args:
            analysis_result: Analyseergebnis
            
        Returns:
            Liste von Klärungsfragen
        """
        try:
            if self.llm_service:
                # LLM-Service für Klärungsfragen verwenden
                questions = await self.llm_service.generate_clarification_questions(
                    analysis_result, 
                    context={"project_id": self.project_id, "agent": "van_agent"}
                )
                logger.info(f"Klärungsfragen mit LLM generiert: {len(questions)}")
                return questions
            elif self.rag_service:
                # Fallback zu RAG-Service
                prompt = f"""
                Basierend auf der folgenden Analyse einer Anforderung, generiere 3-5 präzise Klärungsfragen, 
                die helfen würden, die Anforderung besser zu verstehen.
                
                Analyse: {analysis_result}
                
                Fragen:
                """
                
                rag_result = await self.rag_service.rag_query(prompt, context={"agent": "van_agent"})
                response_text = (rag_result or {}).get("response", "")
                
                # Fragen extrahieren
                questions = []
                for line in response_text.strip().split("\n"):
                    line = line.strip()
                    if line and (line.endswith("?") or "?" in line):
                        # Nummerierung entfernen
                        question = line
                        for prefix in ["1. ", "2. ", "3. ", "4. ", "5. ", "- ", "* "]:
                            if question.startswith(prefix):
                                question = question[len(prefix):]
                        questions.append(question)
                
                logger.info(f"Klärungsfragen mit RAG generiert: {len(questions)}")
                return questions
            else:
                logger.warning("Weder LLM- noch RAG-Service verfügbar")
                return []
                
        except Exception as e:
            logger.error(f"Fehler bei der Generierung von Klärungsfragen: {str(e)}")
            return []
    
    async def get_answer_from_user(self, question: str) -> str:
        """
        Holt eine Antwort vom Benutzer.
        
        In einer realen Implementierung würde dies eine UI-Interaktion beinhalten.
        Hier simulieren wir die Antwort.
        
        Args:
            question: Frage
            
        Returns:
            Antwort
        """
        # Simulierte Antwort
        logger.info(f"Frage an Benutzer: {question}")
        return f"Simulierte Antwort auf die Frage: {question}"
    
    async def run(self, requirement_text: str) -> Dict[str, Any]:
        """
        Führt den VAN-Mode aus.
        
        Args:
            requirement_text: Anforderungstext
            
        Returns:
            Ergebnis des VAN-Mode
        """
        logger.info(f"VAN-Mode gestartet für Anforderung: {requirement_text[:50]}...")
        
        try:
            # Kontext abrufen
            project_context = await self.retrieve_project_context()
            
            # Ähnliche Anforderungen analysieren
            similar_requirements = await self.analyze_similar_requirements(requirement_text)
            
            # Anforderungsanalyse mit LLM oder RAG
            if self.llm_service:
                # LLM-Service für Anforderungsanalyse verwenden
                analysis_result = await self.llm_service.analyze_requirement(
                    requirement_text,
                    context={
                        "project_id": self.project_id,
                        "project_context": project_context,
                        "similar_requirements": similar_requirements,
                        "agent": "van_agent"
                    }
                )
                logger.info("Anforderungsanalyse mit LLM-Service abgeschlossen")
            elif self.rag_service:
                # Fallback zu RAG-Service
                analysis_query = f"""
                Analysiere folgende Anforderung im Kontext eines ERP-Systems:
                
                {requirement_text}
                
                Berücksichtige dabei:
                1. Funktionale Anforderungen
                2. Nicht-funktionale Anforderungen
                3. Systemgrenzen und Schnittstellen
                4. Mögliche Herausforderungen oder Unklarheiten
                
                Gib eine strukturierte Analyse zurück.
                """
                
                rag_result = await self.rag_service.rag_query(analysis_query, context={"agent": "van_agent"})
                analysis_result = (rag_result or {}).get("response", "") or "Analyse konnte nicht generiert werden."
                logger.info("Anforderungsanalyse mit RAG-Service abgeschlossen")
            else:
                analysis_result = "Weder LLM- noch RAG-Service verfügbar. Bitte initialisieren Sie einen der Services."
                logger.warning("Weder LLM- noch RAG-Service verfügbar, Analyse nicht möglich")
            
            # Klärungsfragen generieren
            clarification_questions = await self.generate_questions_from_analysis(analysis_result)
            
            # Klärungsfragen und Antworten speichern
            clarification_ids = []
            for question in clarification_questions:
                answer = await self.get_answer_from_user(question)
                clarification_id = await self.store_clarification_qa(question, answer)
                clarification_ids.append(clarification_id)
            
            # Analyseergebnis speichern
            requirement_analysis = RequirementAnalysis(
                project_id=self.project_id,
                requirement=requirement_text,
                analysis=analysis_result,
                similar_requirements=[str(req.get("_id", "")) for req in similar_requirements],
                clarifications=clarification_ids
            )
            
            van_id = await self.mongodb.insert_one(
                "van_analysis",
                requirement_analysis.dict(exclude_none=True)
            )
            
            logger.info(f"VAN-Mode abgeschlossen, Analyse-ID: {van_id}")
            
            return {
                "id": van_id,
                "requirement": requirement_text,
                "analysis": analysis_result,
                "clarifications": clarification_questions,
                "similar_requirements": [req.get("requirement", "") for req in similar_requirements],
                "llm_provider": self.llm_service.provider.value if self.llm_service else "none",
                "rag_service": "available" if self.rag_service else "none"
            }
            
        except Exception as e:
            logger.error(f"Fehler im VAN-Mode: {str(e)}")
            raise 