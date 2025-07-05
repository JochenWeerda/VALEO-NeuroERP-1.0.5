# -*- coding: utf-8 -*-
"""
Parallele Pipeline-Integration für das VALEO-NeuroERP Multi-Agent-Framework.
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional, Set
from dataclasses import dataclass, field
from datetime import datetime
from asyncio_pool import AioPool
from aiostream import stream

from langchain.agents import Tool
from .langgraph_integration import AgentType
from .mongodb_pipeline_store import PipelineStateStore

# Logger konfigurieren
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

@dataclass
class PipelineStage:
    """Eine Stage in der parallelen Pipeline."""
    name: str
    agent_type: AgentType
    tools: List[Tool]
    dependencies: Set[str] = field(default_factory=set)
    max_parallel: int = 1
    timeout: float = 300.0

class ParallelPipeline:
    """
    Verwaltet die parallele Ausführung von Multi-Agent-Workflows.
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self.pool = AioPool(
            size=self.config.get("max_parallel_tasks", 4),
            pending_queues=True
        )
        self.stages: Dict[str, List[PipelineStage]] = {}
        self.running_workflows: Dict[str, Dict[str, Any]] = {}
        
        # MongoDB-Integration
        self.store = PipelineStateStore(
            connection_string=self.config.get("mongodb_uri", "mongodb://localhost:27017")
        )
        
    async def initialize(self):
        """Initialisiert die Pipeline und die MongoDB-Collections."""
        await self.store.init_collections()
        
    def create_pipeline(self, name: str, stages: List[PipelineStage]) -> None:
        """
        Erstellt eine neue Pipeline-Konfiguration.
        
        Args:
            name: Name der Pipeline
            stages: Liste der Pipeline-Stages
        """
        self.stages[name] = stages
        logger.info(f"Pipeline '{name}' mit {len(stages)} Stages erstellt")
        
    async def execute_stage(self, 
                          stage: PipelineStage,
                          input_data: Dict[str, Any],
                          workflow_id: str) -> Dict[str, Any]:
        """
        Führt eine einzelne Pipeline-Stage aus.
        
        Args:
            stage: Die auszuführende Stage
            input_data: Eingabedaten für die Stage
            workflow_id: ID des Workflows
            
        Returns:
            Ergebnis der Stage-Ausführung
        """
        # Stage in MongoDB erstellen
        await self.store.create_stage(
            workflow_id=workflow_id,
            stage_name=stage.name,
            stage_config={
                "agent_type": stage.agent_type,
                "max_parallel": stage.max_parallel,
                "timeout": stage.timeout
            }
        )
        
        # Status auf "running" setzen
        await self.store.update_stage_status(
            workflow_id=workflow_id,
            stage_name=stage.name,
            status="running"
        )
        
        results = {}
        async with self.pool.reserve() as slot:
            try:
                tasks = []
                for tool in stage.tools:
                    task = asyncio.create_task(
                        asyncio.wait_for(
                            tool.arun(input_data),
                            timeout=stage.timeout
                        )
                    )
                    tasks.append(task)
                
                # Parallele Ausführung der Tools innerhalb der Stage
                tool_results = await asyncio.gather(*tasks, return_exceptions=True)
                
                for tool, result in zip(stage.tools, tool_results):
                    if isinstance(result, Exception):
                        logger.error(f"Fehler bei Tool {tool.name}: {str(result)}")
                        results[tool.name] = {"error": str(result)}
                    else:
                        results[tool.name] = result
                
                # Erfolgreichen Status und Ergebnisse speichern
                await self.store.update_stage_status(
                    workflow_id=workflow_id,
                    stage_name=stage.name,
                    status="completed"
                )
                
                await self.store.store_result(
                    workflow_id=workflow_id,
                    stage_name=stage.name,
                    result=results
                )
                
                logger.info(f"Stage {stage.name} für Workflow {workflow_id} abgeschlossen")
                return results
                
            except Exception as e:
                error_msg = f"Fehler in Stage {stage.name}: {str(e)}"
                logger.error(error_msg)
                
                # Fehlerstatus speichern
                await self.store.update_stage_status(
                    workflow_id=workflow_id,
                    stage_name=stage.name,
                    status="failed",
                    metadata={"error": str(e)}
                )
                
                return {"error": str(e), "stage": stage.name}
    
    def _validate_dependencies(self, stages: List[PipelineStage]) -> bool:
        """
        Überprüft die Abhängigkeiten auf Zyklische Referenzen.
        
        Args:
            stages: Liste der zu überprüfenden Stages
            
        Returns:
            True wenn die Abhängigkeiten valid sind, sonst False
        """
        stage_names = {stage.name for stage in stages}
        for stage in stages:
            if not stage.dependencies.issubset(stage_names):
                return False
        return True
    
    def _group_stages(self, stages: List[PipelineStage]) -> List[List[PipelineStage]]:
        """
        Gruppiert Stages für parallele Ausführung.
        
        Args:
            stages: Liste der Pipeline-Stages
            
        Returns:
            Liste von Stage-Gruppen für parallele Ausführung
        """
        groups = []
        remaining = set(stages)
        completed_names = set()
        
        while remaining:
            current_group = []
            
            for stage in list(remaining):
                if stage.dependencies.issubset(completed_names):
                    current_group.append(stage)
                    remaining.remove(stage)
            
            if not current_group:
                raise ValueError("Zyklische Abhängigkeit in Pipeline gefunden")
            
            groups.append(current_group)
            completed_names.update(stage.name for stage in current_group)
        
        return groups
    
    async def execute_workflow(self,
                             pipeline_name: str,
                             workflow_id: str,
                             input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Führt einen Workflow in der Pipeline aus.
        
        Args:
            pipeline_name: Name der Pipeline
            workflow_id: ID des Workflows
            input_data: Eingabedaten für den Workflow
            
        Returns:
            Ergebnis der Workflow-Ausführung
        """
        if pipeline_name not in self.stages:
            raise ValueError(f"Pipeline '{pipeline_name}' nicht gefunden")
            
        stages = self.stages[pipeline_name]
        if not self._validate_dependencies(stages):
            raise ValueError("Ungültige Stage-Abhängigkeiten")
            
        # Workflow in MongoDB erstellen
        await self.store.create_workflow(
            workflow_id=workflow_id,
            pipeline_name=pipeline_name,
            input_data=input_data
        )
        
        # Status auf "running" setzen
        await self.store.update_workflow_status(
            workflow_id=workflow_id,
            status="running"
        )
        
        self.running_workflows[workflow_id] = {
            "pipeline": pipeline_name,
            "status": "running",
            "start_time": datetime.now().isoformat(),
            "results": {}
        }
        
        try:
            # Stages in Gruppen für parallele Ausführung einteilen
            stage_groups = self._group_stages(stages)
            
            for group in stage_groups:
                # Parallele Ausführung der Stages in der Gruppe
                tasks = [
                    self.execute_stage(stage, input_data, workflow_id)
                    for stage in group
                ]
                results = await asyncio.gather(*tasks, return_exceptions=True)
                
                # Ergebnisse verarbeiten
                for stage, result in zip(group, results):
                    if isinstance(result, Exception):
                        error_msg = f"Fehler in Stage {stage.name}: {str(result)}"
                        logger.error(error_msg)
                        
                        self.running_workflows[workflow_id]["status"] = "failed"
                        self.running_workflows[workflow_id]["error"] = error_msg
                        
                        # Fehlerstatus in MongoDB speichern
                        await self.store.update_workflow_status(
                            workflow_id=workflow_id,
                            status="failed",
                            metadata={"error": error_msg}
                        )
                        
                        return self.running_workflows[workflow_id]
                    
                    self.running_workflows[workflow_id]["results"][stage.name] = result
            
            # Workflow erfolgreich abgeschlossen
            self.running_workflows[workflow_id]["status"] = "completed"
            self.running_workflows[workflow_id]["end_time"] = datetime.now().isoformat()
            
            # Finalen Status in MongoDB speichern
            await self.store.update_workflow_status(
                workflow_id=workflow_id,
                status="completed",
                metadata={
                    "end_time": self.running_workflows[workflow_id]["end_time"],
                    "results": self.running_workflows[workflow_id]["results"]
                }
            )
            
            return self.running_workflows[workflow_id]
            
        except Exception as e:
            error_msg = f"Fehler in Workflow {workflow_id}: {str(e)}"
            logger.error(error_msg)
            
            self.running_workflows[workflow_id]["status"] = "failed"
            self.running_workflows[workflow_id]["error"] = str(e)
            self.running_workflows[workflow_id]["end_time"] = datetime.now().isoformat()
            
            # Fehlerstatus in MongoDB speichern
            await self.store.update_workflow_status(
                workflow_id=workflow_id,
                status="failed",
                metadata={
                    "error": str(e),
                    "end_time": self.running_workflows[workflow_id]["end_time"]
                }
            )
            
            return self.running_workflows[workflow_id]
        finally:
            if workflow_id in self.running_workflows:
                del self.running_workflows[workflow_id]
                
    async def get_workflow_status(self, workflow_id: str) -> Optional[Dict[str, Any]]:
        """
        Ruft den Status eines Workflows ab.
        
        Args:
            workflow_id: ID des Workflows
            
        Returns:
            Workflow-Status oder None wenn nicht gefunden
        """
        return await self.store.get_workflow_state(workflow_id)
        
    async def get_active_workflows(self) -> List[Dict[str, Any]]:
        """
        Ruft alle aktiven Workflows ab.
        
        Returns:
            Liste der aktiven Workflows
        """
        return await self.store.get_active_workflows()
