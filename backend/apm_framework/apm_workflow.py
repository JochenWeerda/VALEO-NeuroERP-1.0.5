"""
APM-Workflow für das VALEO-NeuroERP-System.
Implementiert den Agile Project Management Workflow mit verschiedenen Modi.
"""

import logging
import asyncio
from typing import Dict, Any, Optional, List
from enum import Enum
from datetime import datetime

from backend.apm_framework.mongodb_connector import APMMongoDBConnector
from backend.apm_framework.plan_mode import PlanMode
from backend.apm_framework.create_mode import CREATEMode
from backend.apm_framework.implementation_mode import ImplementationMode
from backend.apm_framework.van_mode import VANMode
from backend.apm_framework.rag_service import RAGService

# Logger konfigurieren
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class APMMode(Enum):
    """Verfügbare Modi für den APM-Workflow."""
    PLAN = "PLAN"
    CREATE = "CREATE"
    IMPLEMENTATION = "IMPLEMENTATION"
    VAN = "VAN"


class APMWorkflow:
    """
    APM-Workflow für das VALEO-NeuroERP-System.
    
    Implementiert den Agile Project Management Workflow mit verschiedenen Modi:
    - PLAN: Planung und Anforderungsanalyse
    - CREATE: Codegenerierung und Ressourcenbereitstellung
    - IMPLEMENTATION: Implementierung und Integration
    - VAN: Validierung, Analyse und Normalisierung
    """
    
    def __init__(self, mongodb_connector: APMMongoDBConnector, project_id: str):
        """
        Initialisiert den APM-Workflow.
        
        Args:
            mongodb_connector: MongoDB-Connector für die Datenbankoperationen
            project_id: ID des Projekts
        """
        self.mongodb = mongodb_connector
        self.project_id = project_id
        self.current_mode = None
        self.rag_service = None
        
        # Modi initialisieren
        self.plan_mode = PlanMode(mongodb_connector, project_id)
        self.create_mode = CREATEMode(mongodb_connector, project_id)
        self.implementation_mode = ImplementationMode(mongodb_connector)
        self.van_mode = VANMode(mongodb_connector, project_id)
        
        logger.info(f"APM-Workflow initialisiert für Projekt {project_id}")
    
    def set_rag_service(self, rag_service: RAGService):
        """
        Setzt den RAG-Service für die Unterstützung bei der Codegenerierung.
        
        Args:
            rag_service: RAG-Service-Instanz
        """
        self.rag_service = rag_service
        self.create_mode.set_rag_service(rag_service)
        logger.info("RAG-Service für APM-Workflow gesetzt")
    
    async def switch_mode(self, mode: APMMode) -> bool:
        """
        Wechselt den aktuellen Modus.
        
        Args:
            mode: Neuer Modus
            
        Returns:
            True, wenn der Moduswechsel erfolgreich war, sonst False
        """
        try:
            logger.info(f"Wechsle zu Modus {mode.value}")
            
            # Modus wechseln
            self.current_mode = mode
            
            # Modus in der Datenbank speichern
            await self.mongodb.update_one(
                "apm_workflow",
                {"project_id": self.project_id},
                {"$set": {"current_mode": mode.value, "updated_at": datetime.now()}},
                upsert=True
            )
            
            logger.info(f"Modus gewechselt zu {mode.value}")
            return True
        except Exception as e:
            logger.error(f"Fehler beim Wechseln des Modus: {str(e)}")
            return False
    
    async def run_plan(self, requirements: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Führt den PLAN-Modus aus.
        
        Args:
            requirements: Liste von Anforderungen
            
        Returns:
            Ergebnis des PLAN-Modus
        """
        try:
            logger.info("Führe PLAN-Modus aus")
            
            # Zu PLAN-Modus wechseln
            await self.switch_mode(APMMode.PLAN)
            
            # PLAN-Modus ausführen
            result = await self.plan_mode.run(requirements)
            
            logger.info("PLAN-Modus abgeschlossen")
            return result
        except Exception as e:
            logger.error(f"Fehler im PLAN-Modus: {str(e)}")
            raise
    
    async def run_create(self, plan_result_id: str) -> Dict[str, Any]:
        """
        Führt den CREATE-Modus aus.
        
        Args:
            plan_result_id: ID des PLAN-Ergebnisses
            
        Returns:
            Ergebnis des CREATE-Modus
        """
        try:
            logger.info("Führe CREATE-Modus aus")
            
            # Zu CREATE-Modus wechseln
            await self.switch_mode(APMMode.CREATE)
            
            # CREATE-Modus ausführen
            result = await self.create_mode.run(plan_result_id)
            
            logger.info("CREATE-Modus abgeschlossen")
            return result
        except Exception as e:
            logger.error(f"Fehler im CREATE-Modus: {str(e)}")
            raise
    
    async def run_implementation(self, create_result_id: str) -> Dict[str, Any]:
        """
        Führt den IMPLEMENTATION-Modus aus.
        
        Args:
            create_result_id: ID des CREATE-Ergebnisses
            
        Returns:
            Ergebnis des IMPLEMENTATION-Modus
        """
        try:
            logger.info("Führe IMPLEMENTATION-Modus aus")
            
            # Zu IMPLEMENTATION-Modus wechseln
            await self.switch_mode(APMMode.IMPLEMENTATION)
            
            # IMPLEMENTATION-Modus ausführen
            result = await self.implementation_mode.run(create_result_id, self.project_id)
            
            logger.info("IMPLEMENTATION-Modus abgeschlossen")
            return result
        except Exception as e:
            logger.error(f"Fehler im IMPLEMENTATION-Modus: {str(e)}")
            raise
    
    async def run_van(self, implementation_result_id: str) -> Dict[str, Any]:
        """
        Führt den VAN-Modus aus.
        
        Args:
            implementation_result_id: ID des IMPLEMENTATION-Ergebnisses
            
        Returns:
            Ergebnis des VAN-Modus
        """
        try:
            logger.info("Führe VAN-Modus aus")
            
            # Zu VAN-Modus wechseln
            await self.switch_mode(APMMode.VAN)
            
            # VAN-Modus ausführen
            result = await self.van_mode.run(implementation_result_id)
            
            logger.info("VAN-Modus abgeschlossen")
            return result
        except Exception as e:
            logger.error(f"Fehler im VAN-Modus: {str(e)}")
            raise
    
    async def get_current_mode(self) -> Optional[APMMode]:
        """
        Ruft den aktuellen Modus ab.
        
        Returns:
            Aktueller Modus oder None, wenn kein Modus gesetzt ist
        """
        try:
            # Modus aus der Datenbank abrufen
            workflow_data = await self.mongodb.find_one(
                "apm_workflow",
                {"project_id": self.project_id}
            )
            
            if workflow_data and "current_mode" in workflow_data:
                mode_value = workflow_data["current_mode"]
                self.current_mode = APMMode(mode_value)
                return self.current_mode
            
            return self.current_mode
        except Exception as e:
            logger.error(f"Fehler beim Abrufen des aktuellen Modus: {str(e)}")
            return None 
