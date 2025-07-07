"""
APM Workflow Manager
"""
from typing import Dict, Any, List, Tuple, Callable, Awaitable
from datetime import datetime
import asyncio
from pathlib import Path
import json
import logging
from .van_mode_optimized import OptimizedVANMode
from .base_mode import BaseMode
from .graph_manager import WorkflowGraph
from .tools import Tool

logger = logging.getLogger("apm-workflow")

class APMWorkflowManager:
    """
    Workflow Manager für APM Phasen.
    Steuert den Übergang zwischen Phasen und generiert Handover-Dokumente.
    """
    
    def __init__(self):
        self.project_root = Path(__file__).parent.parent.parent
        self.memory_bank = self.project_root / "memory-bank"
        self.handover_dir = self.project_root / "handovers"
        self.current_phase = None
        self.graph = self._create_workflow_graph()
        
    def _create_workflow_graph(self) -> WorkflowGraph:
        """Erstellt den Workflow Graph"""
        graph = WorkflowGraph()
        
        # Phasen definieren
        phases = ["van", "plan", "create", "implement", "reflect"]
        
        # Knoten für jede Phase erstellen
        for phase in phases:
            graph.add_node(phase, self._get_phase_executor(phase))
            
        # Handover-Knoten zwischen den Phasen
        for i in range(len(phases)-1):
            current_phase = phases[i]
            next_phase = phases[i+1]
            handover_node = f"handover_{current_phase}_to_{next_phase}"
            
            # Handover-Knoten hinzufügen
            graph.add_node(handover_node, self._get_handover_executor(current_phase, next_phase))
            
            # Kanten verbinden
            graph.add_edge(current_phase, handover_node)
            graph.add_edge(handover_node, next_phase)
            
        return graph
        
    def _get_phase_executor(self, phase: str) -> Callable[[Dict[str, Any]], Awaitable[Dict[str, Any]]]:
        """Erstellt einen Executor für die spezifische Phase"""
        tools = self._get_phase_tools(phase)
        
        async def phase_executor(state: Dict[str, Any]) -> Dict[str, Any]:
            """Führt die Phase aus"""
            try:
                logger.info(f"Starte Phase: {phase}")
                
                if phase == "van":
                    mode = OptimizedVANMode()
                    result = await mode.start({})
                    if result["status"] == "error":
                        raise Exception(result["error"])
                        
                    logger.info(f"Phase {phase} erfolgreich abgeschlossen")
                    return {
                        "status": "completed",
                        "phase": phase,
                        "result": result,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                # Weitere Phasen folgen...
                return state
                
            except Exception as e:
                logger.error(f"Fehler in Phase {phase}: {str(e)}")
                raise
            
        return phase_executor
        
    def _get_handover_executor(self, from_phase: str, to_phase: str) -> Callable[[Dict[str, Any]], Awaitable[Dict[str, Any]]]:
        """Erstellt einen Executor für das Handover zwischen Phasen"""
        
        async def handover_executor(state: Dict[str, Any]) -> Dict[str, Any]:
            """Generiert das Handover-Dokument"""
            try:
                logger.info(f"Starte Handover von {from_phase} zu {to_phase}")
                
                # Handover-Datei erstellen
                timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
                handover_file = self.handover_dir / f"handover_{from_phase}_to_{to_phase}_{timestamp}.json"
                
                # Handover-Daten sammeln
                handover_data = {
                    "from_phase": from_phase,
                    "to_phase": to_phase,
                    "timestamp": datetime.utcnow().isoformat(),
                    "phase_results": state.get("result", {}),
                    "metrics": self._collect_phase_metrics(state),
                    "next_steps": self._generate_next_steps(from_phase, to_phase, state),
                    "dependencies": self._identify_dependencies(state),
                    "risks": self._assess_risks(state)
                }
                
                # Handover speichern
                self.handover_dir.mkdir(exist_ok=True)
                with open(handover_file, "w", encoding="utf-8") as f:
                    json.dump(handover_data, f, indent=2, ensure_ascii=False)
                    
                # Memory Bank Update
                await self._update_memory_bank(handover_data)
                
                logger.info(f"Handover von {from_phase} zu {to_phase} erfolgreich abgeschlossen")
                return {
                    "status": "handover_completed",
                    "from_phase": from_phase,
                    "to_phase": to_phase,
                    "handover_file": str(handover_file),
                    "timestamp": datetime.utcnow().isoformat()
                }
                
            except Exception as e:
                logger.error(f"Fehler beim Handover von {from_phase} zu {to_phase}: {str(e)}")
                raise
            
        return handover_executor
        
    def _get_phase_tools(self, phase: str) -> List[Tool]:
        """Gibt die Tools für eine spezifische Phase zurück"""
        tools = [
            Tool(
                name="analyze_system",
                func=self._analyze_system,
                description="Analysiert das ERP-System"
            ),
            Tool(
                name="collect_metrics",
                func=self._collect_metrics,
                description="Sammelt Systemmetriken"
            ),
            Tool(
                name="generate_documentation",
                func=self._generate_documentation,
                description="Generiert Dokumentation"
            )
        ]
        return tools
        
    def _get_handover_tools(self) -> List[Tool]:
        """Gibt die Tools für Handover-Prozesse zurück"""
        tools = [
            Tool(
                name="collect_phase_results",
                func=self._collect_phase_results,
                description="Sammelt Phasenergebnisse"
            ),
            Tool(
                name="generate_next_steps",
                func=self._generate_next_steps,
                description="Generiert nächste Schritte"
            ),
            Tool(
                name="update_memory_bank",
                func=self._update_memory_bank,
                description="Aktualisiert Memory Bank"
            )
        ]
        return tools
        
    async def _analyze_system(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Analysiert das System"""
        # Implementierung folgt...
        pass
        
    def _collect_metrics(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Sammelt Metriken"""
        metrics = {
            "timestamp": datetime.utcnow().isoformat(),
            "performance": {
                "cpu_usage": 0,
                "memory_usage": 0,
                "response_times": []
            },
            "quality": {
                "test_coverage": 0,
                "code_quality": 0,
                "documentation_coverage": 0
            },
            "progress": {
                "completed_tasks": 0,
                "total_tasks": 0,
                "milestone_progress": 0
            }
        }
        return metrics
        
    def _collect_phase_metrics(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Sammelt Metriken für die aktuelle Phase"""
        return self._collect_metrics(state)
        
    def _generate_documentation(self, content: Dict[str, Any]) -> str:
        """Generiert Dokumentation"""
        # Implementierung folgt...
        pass
        
    async def _collect_phase_results(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Sammelt die Ergebnisse einer Phase"""
        return state.get("result", {})
        
    def _generate_next_steps(self, from_phase: str, to_phase: str, state: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generiert nächste Schritte für die Übergangsphase"""
        next_steps = [
            {
                "step": "Ergebnisse validieren",
                "description": f"Validierung der {from_phase.upper()} Phase Ergebnisse",
                "priority": "high"
            },
            {
                "step": "Abhängigkeiten prüfen",
                "description": f"Prüfung der Abhängigkeiten für {to_phase.upper()} Phase",
                "priority": "high"
            },
            {
                "step": "Team informieren",
                "description": "Team über Phasenübergang informieren",
                "priority": "medium"
            }
        ]
        return next_steps
        
    def _identify_dependencies(self, state: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Identifiziert Abhängigkeiten zwischen Phasen"""
        dependencies = [
            {
                "type": "data",
                "description": "Analyseergebnisse der vorherigen Phase",
                "required": True
            },
            {
                "type": "resource",
                "description": "Team-Verfügbarkeit",
                "required": True
            },
            {
                "type": "technical",
                "description": "System-Zugang und Berechtigungen",
                "required": True
            }
        ]
        return dependencies
        
    def _assess_risks(self, state: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Bewertet Risiken beim Phasenübergang"""
        risks = [
            {
                "category": "technical",
                "description": "Datenverlust während Migration",
                "severity": "high",
                "mitigation": "Backup-Strategie implementieren"
            },
            {
                "category": "process",
                "description": "Verzögerung durch fehlende Ressourcen",
                "severity": "medium",
                "mitigation": "Ressourcenplanung optimieren"
            }
        ]
        return risks
        
    async def _update_memory_bank(self, data: Dict[str, Any]) -> None:
        """Aktualisiert die Memory Bank"""
        try:
            # Speichere in entsprechender Sektion
            section = "handover"
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            
            memory_file = self.memory_bank / section / f"handover_{timestamp}.json"
            memory_file.parent.mkdir(exist_ok=True)
            
            with open(memory_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
                
            logger.info(f"Memory Bank Update erfolgreich: {memory_file}")
            
        except Exception as e:
            logger.error(f"Fehler beim Memory Bank Update: {str(e)}")
            raise
            
    async def start_workflow(self) -> Dict[str, Any]:
        """Startet den APM Workflow"""
        try:
            logger.info("Starte APM Workflow...")
            
            # Initialer Zustand
            state = {
                "status": "started",
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Workflow ausführen
            final_state = await self.graph.execute(state)
            
            if final_state["status"] == "completed":
                logger.info("Workflow erfolgreich abgeschlossen")
                logger.info(f"Finale Phase: {final_state.get('final_node')}")
            else:
                logger.error(f"Workflow fehlgeschlagen: {final_state.get('error')}")
                
            return final_state
            
        except Exception as e:
            logger.error(f"Fehler im Workflow: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            } 