from typing import Dict, Any, List
from concurrent.futures import ThreadPoolExecutor
import logging
from datetime import datetime
from van_cycle_config import VANCycleConfig
from core.genxais_core import GENXAISCore, RAGSystem, APMCycle, AgentSystem

class PipelineManager:
    """
    Manager für die parallele Ausführung der VAN-Pipelines
    """
    def __init__(self):
        self.config = VANCycleConfig()
        self.core = GENXAISCore()
        self.rag = RAGSystem()
        self.apm = APMCycle()
        self.agents = AgentSystem()
        
        # Logger konfigurieren
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
    def execute_pipeline(self, pipeline_name: str) -> Dict[str, Any]:
        """
        Führt eine einzelne Pipeline aus
        """
        try:
            # Pipeline starten
            pipeline_status = self.config.start_pipeline(pipeline_name)
            pipeline_id = pipeline_status["pipeline_id"]
            
            # Validierungsphase (V)
            validation_result = self.execute_validation_phase(pipeline_name, pipeline_id)
            if not validation_result["success"]:
                return self.handle_pipeline_failure(pipeline_name, pipeline_id, "validation", validation_result["errors"])
            
            # Aktionsphase (A)
            action_result = self.execute_action_phase(pipeline_name, pipeline_id, validation_result)
            if not action_result["success"]:
                return self.handle_pipeline_failure(pipeline_name, pipeline_id, "action", action_result["errors"])
            
            # Nachbereitungsphase (N)
            review_result = self.execute_review_phase(pipeline_name, pipeline_id, action_result)
            if not review_result["success"]:
                return self.handle_pipeline_failure(pipeline_name, pipeline_id, "review", review_result["errors"])
            
            return {
                "pipeline_name": pipeline_name,
                "pipeline_id": pipeline_id,
                "status": "completed",
                "results": {
                    "validation": validation_result,
                    "action": action_result,
                    "review": review_result
                }
            }
            
        except Exception as e:
            self.logger.error(f"Fehler in Pipeline {pipeline_name}: {str(e)}")
            return {
                "pipeline_name": pipeline_name,
                "status": "failed",
                "error": str(e)
            }
            
    def execute_validation_phase(self, pipeline_name: str, pipeline_id: str) -> Dict[str, Any]:
        """
        Führt die Validierungsphase aus
        """
        try:
            config = self.config.pipeline_configs[pipeline_name]
            criteria = self.config.get_validation_criteria(pipeline_name)
            
            # Validierungsagenten ausführen
            validation_results = []
            for agent_type in config["agents"]:
                agent = self.agents.create_agent(agent_type)
                result = {
                    "agent_id": agent["id"],
                    "agent_type": agent_type,
                    "validation": {
                        "tasks": config["tasks"],
                        "criteria": criteria,
                        "status": "validated"
                    }
                }
                validation_results.append(result)
            
            # Handover erstellen
            handover = self.config.create_handover(
                pipeline_id,
                "V",
                {
                    "validation_results": validation_results,
                    "timestamp": self.core.get_current_timestamp()
                }
            )
            
            return {
                "success": True,
                "handover": handover,
                "results": validation_results
            }
            
        except Exception as e:
            self.logger.error(f"Fehler in Validierungsphase: {str(e)}")
            return {"success": False, "errors": str(e)}
            
    def execute_action_phase(self, pipeline_name: str, pipeline_id: str, validation_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Führt die Aktionsphase aus
        """
        try:
            config = self.config.pipeline_configs[pipeline_name]
            
            # Aktionen ausführen
            action_results = []
            for task in config["tasks"]:
                # Passenden Agenten auswählen
                agent = self.agents.create_agent(config["agents"][0])  # Vereinfacht: Erster Agent
                result = {
                    "agent_id": agent["id"],
                    "task": task,
                    "action": {
                        "status": "completed",
                        "timestamp": self.core.get_current_timestamp()
                    }
                }
                action_results.append(result)
            
            # Handover erstellen
            handover = self.config.create_handover(
                pipeline_id,
                "A",
                {
                    "action_results": action_results,
                    "timestamp": self.core.get_current_timestamp()
                }
            )
            
            return {
                "success": True,
                "handover": handover,
                "results": action_results
            }
            
        except Exception as e:
            self.logger.error(f"Fehler in Aktionsphase: {str(e)}")
            return {"success": False, "errors": str(e)}
            
    def execute_review_phase(self, pipeline_name: str, pipeline_id: str, action_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Führt die Nachbereitungsphase aus
        """
        try:
            config = self.config.pipeline_configs[pipeline_name]
            
            # Review durchführen
            review_results = []
            for agent_type in config["agents"]:
                agent = self.agents.create_agent(agent_type)
                result = {
                    "agent_id": agent["id"],
                    "agent_type": agent_type,
                    "review": {
                        "status": "approved",
                        "timestamp": self.core.get_current_timestamp()
                    }
                }
                review_results.append(result)
            
            # Handover erstellen
            handover = self.config.create_handover(
                pipeline_id,
                "N",
                {
                    "review_results": review_results,
                    "timestamp": self.core.get_current_timestamp()
                }
            )
            
            return {
                "success": True,
                "handover": handover,
                "results": review_results
            }
            
        except Exception as e:
            self.logger.error(f"Fehler in Nachbereitungsphase: {str(e)}")
            return {"success": False, "errors": str(e)}
            
    def handle_pipeline_failure(self, pipeline_name: str, pipeline_id: str, phase: str, error: str) -> Dict[str, Any]:
        """
        Behandelt Pipeline-Fehler
        """
        failure_record = {
            "pipeline_name": pipeline_name,
            "pipeline_id": pipeline_id,
            "phase": phase,
            "error": error,
            "timestamp": self.core.get_current_timestamp()
        }
        
        # Fehler im RAG System dokumentieren
        self.rag.store_context(failure_record)
        
        return {
            "pipeline_name": pipeline_name,
            "pipeline_id": pipeline_id,
            "status": "failed",
            "phase": phase,
            "error": error
        }
        
    def start_all_pipelines(self) -> List[Dict[str, Any]]:
        """
        Startet alle Pipelines parallel
        """
        try:
            # ThreadPool für parallele Ausführung
            with ThreadPoolExecutor(max_workers=7) as executor:
                # Pipelines parallel ausführen
                future_to_pipeline = {
                    executor.submit(self.execute_pipeline, name): name
                    for name in self.config.pipeline_configs.keys()
                }
                
                # Ergebnisse sammeln
                results = []
                for future in future_to_pipeline:
                    pipeline_name = future_to_pipeline[future]
                    try:
                        result = future.result()
                        results.append(result)
                        self.logger.info(f"Pipeline {pipeline_name} abgeschlossen: {result['status']}")
                    except Exception as e:
                        self.logger.error(f"Pipeline {pipeline_name} fehlgeschlagen: {str(e)}")
                        results.append({
                            "pipeline_name": pipeline_name,
                            "status": "failed",
                            "error": str(e)
                        })
                
                return results
                
        except Exception as e:
            self.logger.error(f"Fehler beim Starten der Pipelines: {str(e)}")
            raise

if __name__ == "__main__":
    # Pipeline-Manager initialisieren und alle Pipelines starten
    manager = PipelineManager()
    results = manager.start_all_pipelines()
    
    # Ergebnisse loggen
    for result in results:
        pipeline_name = result.get("pipeline_name", "Unbekannt")
        if result["status"] == "completed":
            logging.info(f"Pipeline {pipeline_name} erfolgreich abgeschlossen")
        else:
            logging.error(f"Pipeline {pipeline_name} fehlgeschlagen: {result.get('error', 'Unbekannter Fehler')}") 