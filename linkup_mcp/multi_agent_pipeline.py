import os
import sys
import logging
import asyncio
from typing import Dict, List, Optional
from datetime import datetime

# Logger konfigurieren
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class MultiAgentPipeline:
    """Pipeline für die Koordination der verschiedenen Agenten im System."""
    
    def __init__(self):
        """Initialisiert die Multi-Agent-Pipeline."""
        self.analyzers = {}
        self.planners = {}
        self.executors = {}
        self.orchestrator = None
        self.active_workflows = {}
    
    def register_analyzer(self, name: str, analyzer: object) -> None:
        """Registriert einen neuen Analyzer-Agenten.
        
        Args:
            name: Der Name des Analyzers.
            analyzer: Das Analyzer-Objekt.
        """
        self.analyzers[name] = analyzer
        logger.info(f"Analyzer '{name}' registriert")
    
    def register_planner(self, name: str, planner: object) -> None:
        """Registriert einen neuen Planner-Agenten.
        
        Args:
            name: Der Name des Planners.
            planner: Das Planner-Objekt.
        """
        self.planners[name] = planner
        logger.info(f"Planner '{name}' registriert")
    
    def register_executor(self, name: str, executor: object) -> None:
        """Registriert einen neuen Executor-Agenten.
        
        Args:
            name: Der Name des Executors.
            executor: Das Executor-Objekt.
        """
        self.executors[name] = executor
        logger.info(f"Executor '{name}' registriert")
    
    def set_orchestrator(self, orchestrator: object) -> None:
        """Setzt den Orchestrator-Agenten.
        
        Args:
            orchestrator: Das Orchestrator-Objekt.
        """
        self.orchestrator = orchestrator
        logger.info("Orchestrator gesetzt")
    
    async def start_workflow(self, config: Dict) -> str:
        """Startet einen neuen Workflow.
        
        Args:
            config: Die Workflow-Konfiguration.
            
        Returns:
            Die Workflow-ID.
        """
        workflow_id = f"workflow_{len(self.active_workflows) + 1}"
        
        # Initialisiere den Workflow
        self.active_workflows[workflow_id] = {
            "config": config,
            "status": "running",
            "start_time": datetime.now(),
            "current_phase": "analysis",
            "results": {}
        }
        
        # Starte die asynchrone Workflow-Ausführung
        asyncio.create_task(self._execute_workflow(workflow_id))
        
        logger.info(f"Workflow {workflow_id} gestartet")
        return workflow_id
    
    async def _execute_workflow(self, workflow_id: str) -> None:
        """Führt einen Workflow aus.
        
        Args:
            workflow_id: Die ID des Workflows.
        """
        workflow = self.active_workflows[workflow_id]
        
        try:
            # Analyse-Phase
            workflow["current_phase"] = "analysis"
            analysis_tasks = []
            for analyzer in self.analyzers.values():
                analysis_tasks.append(analyzer.analyze({"phase": "analysis"}))
            
            analysis_results = await asyncio.gather(*analysis_tasks)
            workflow["results"]["analysis"] = self._combine_results(analysis_results)
            
            # Planungs-Phase
            workflow["current_phase"] = "planning"
            planning_tasks = []
            for planner in self.planners.values():
                planning_tasks.append(planner.create_plan(workflow["results"]["analysis"]))
            
            planning_results = await asyncio.gather(*planning_tasks)
            workflow["results"]["planning"] = self._combine_results(planning_results)
            
            # Ausführungs-Phase
            workflow["current_phase"] = "execution"
            execution_tasks = []
            for executor in self.executors.values():
                execution_tasks.append(executor.execute_plan(workflow["results"]["planning"]))
            
            execution_results = await asyncio.gather(*execution_tasks)
            workflow["results"]["execution"] = self._combine_results(execution_results)
            
            # Workflow abgeschlossen
            workflow["status"] = "completed"
            workflow["end_time"] = datetime.now()
            logger.info(f"Workflow {workflow_id} erfolgreich abgeschlossen")
            
        except Exception as e:
            workflow["status"] = "failed"
            workflow["error"] = str(e)
            logger.error(f"Fehler in Workflow {workflow_id}: {e}")
    
    def _combine_results(self, results: List[Dict]) -> Dict:
        """Kombiniert die Ergebnisse mehrerer Agenten.
        
        Args:
            results: Liste der Agenten-Ergebnisse.
            
        Returns:
            Die kombinierten Ergebnisse.
        """
        combined = {
            "timestamp": datetime.now().isoformat(),
            "results": results
        }
        return combined
    
    def get_workflow_status(self, workflow_id: str) -> Dict:
        """Gibt den Status eines Workflows zurück.
        
        Args:
            workflow_id: Die ID des Workflows.
            
        Returns:
            Der Workflow-Status.
        """
        if workflow_id not in self.active_workflows:
            return {"status": "not_found"}
        
        workflow = self.active_workflows[workflow_id]
        return {
            "status": workflow["status"],
            "current_phase": workflow["current_phase"],
            "start_time": workflow["start_time"].isoformat(),
            "end_time": workflow["end_time"].isoformat() if "end_time" in workflow else None,
            "results": workflow.get("results", {}),
            "error": workflow.get("error")
        }
    
    def get_active_workflows(self) -> List[str]:
        """Gibt die IDs aller aktiven Workflows zurück.
        
        Returns:
            Liste der Workflow-IDs.
        """
        return list(self.active_workflows.keys()) 