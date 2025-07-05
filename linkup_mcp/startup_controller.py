from typing import Dict, List
import asyncio
from datetime import datetime
import logging
import sys
import os

# Füge das Projektverzeichnis zum Python-Pfad hinzu
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from .multi_agent_pipeline import MultiAgentPipeline
from .mongodb_connector import MongoDBConnector
from .agents.specialized_agents import (
    ERPDataAnalyzer,
    WorkflowAnalyzer,
    SecurityAnalyzer,
    WorkflowOptimizationPlanner,
    ResourceAllocationPlanner,
    SecurityPlanningAgent,
    WorkflowExecutor,
    ResourceManager,
    SecurityImplementer
)
from .agents.base_agents import OrchestratorAgent

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class StartupController:
    """Controller für den Start und die Optimierung des Multi-Agenten-Systems."""
    
    def __init__(self):
        """Initialisiert den Startup-Controller."""
        self.pipeline = MultiAgentPipeline()
        self.db_connector = MongoDBConnector()
        self.optimization_cycles = 0
        self.performance_history = []
    
    async def initialize_system(self) -> None:
        """Initialisiert das System."""
        logger.info("Initialisiere System...")
        
        # Verbinde zur Datenbank
        await self.db_connector.connect()
        
        # Erstelle und registriere Agenten
        await self._setup_agents()
        
        # Setze Systemziele
        goals = [
            {
                "type": "optimization",
                "target": "workflow_efficiency",
                "threshold": 0.9
            },
            {
                "type": "security",
                "target": "compliance_level",
                "threshold": 0.95
            }
        ]
        
        # Erstelle und setze Orchestrator
        orchestrator = OrchestratorAgent("main_orchestrator", goals)
        self.pipeline.set_orchestrator(orchestrator)
        
        logger.info("System initialisiert")
    
    async def _setup_agents(self) -> None:
        """Erstellt und registriert die Agenten."""
        # Analyzer-Agenten
        self.pipeline.register_analyzer(
            "erp_analyzer",
            ERPDataAnalyzer("erp_analyzer", "erp_data")
        )
        self.pipeline.register_analyzer(
            "workflow_analyzer",
            WorkflowAnalyzer("workflow_analyzer", "workflow")
        )
        self.pipeline.register_analyzer(
            "security_analyzer",
            SecurityAnalyzer("security_analyzer", "security")
        )
        
        # Planner-Agenten
        self.pipeline.register_planner(
            "workflow_planner",
            WorkflowOptimizationPlanner("workflow_planner", "workflow")
        )
        self.pipeline.register_planner(
            "resource_planner",
            ResourceAllocationPlanner("resource_planner", "resources")
        )
        self.pipeline.register_planner(
            "security_planner",
            SecurityPlanningAgent("security_planner", "security")
        )
        
        # Executor-Agenten
        self.pipeline.register_executor(
            "workflow_executor",
            WorkflowExecutor("workflow_executor", "workflow")
        )
        self.pipeline.register_executor(
            "resource_manager",
            ResourceManager("resource_manager", "resources")
        )
        self.pipeline.register_executor(
            "security_implementer",
            SecurityImplementer("security_implementer", "security")
        )
    
    async def start_optimization_cycle(self) -> Dict:
        """Startet einen Optimierungszyklus.
        
        Returns:
            Die Ergebnisse des Optimierungszyklus.
        """
        logger.info(f"Starte Optimierungszyklus {self.optimization_cycles + 1}")
        
        try:
            # Starte einen neuen Workflow
            workflow_id = await self.pipeline.start_workflow({
                "cycle": self.optimization_cycles + 1,
                "timestamp": datetime.now().isoformat()
            })
            
            # Warte auf Abschluss
            while True:
                status = self.pipeline.get_workflow_status(workflow_id)
                if status["status"] in ["completed", "failed"]:
                    break
                await asyncio.sleep(1)
            
            # Speichere Ergebnisse
            await self.db_connector.store_workflow_data(
                workflow_id,
                status
            )
            
            self.optimization_cycles += 1
            self.performance_history.append({
                "cycle": self.optimization_cycles,
                "timestamp": datetime.now().isoformat(),
                "status": status
            })
            
            logger.info(f"Optimierungszyklus {self.optimization_cycles} abgeschlossen")
            return status
            
        except Exception as e:
            logger.error(f"Fehler im Optimierungszyklus: {e}")
            raise
    
    def get_optimization_history(self) -> List[Dict]:
        """Gibt die Historie der Optimierungszyklen zurück.
        
        Returns:
            Die Optimierungshistorie.
        """
        return self.performance_history
    
    async def shutdown(self) -> None:
        """Fährt das System herunter."""
        logger.info("Fahre System herunter...")
        await self.db_connector.close()
        logger.info("System heruntergefahren")

async def main():
    """Hauptfunktion für den Systemstart."""
    controller = StartupController()
    
    try:
        # Initialisiere das System
        await controller.initialize_system()
        
        # Führe drei Optimierungszyklen durch
        for _ in range(3):
            results = await controller.start_optimization_cycle()
            logger.info(f"Zyklus-Ergebnisse: {results}")
            
        # Zeige Optimierungshistorie
        history = controller.get_optimization_history()
        logger.info(f"Optimierungshistorie: {history}")
        
    except Exception as e:
        logger.error(f"Fehler beim Systemstart: {e}")
    finally:
        await controller.shutdown()

if __name__ == "__main__":
    asyncio.run(main()) 