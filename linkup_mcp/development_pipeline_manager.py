# -*- coding: utf-8 -*-
"""
Development Pipeline Manager für die parallele Entwicklung im VALEO-NeuroERP Multi-Agent-Framework.
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional, Set
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path

from .mongodb_pipeline_store import PipelineStateStore
from .parallel_pipeline import ParallelPipeline, PipelineStage

# Logger konfigurieren
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class DevelopmentTask:
    """Repraesentiert eine Entwicklungsaufgabe."""
    name: str
    description: str
    status: str = "pending"
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    dependencies: Set[str] = field(default_factory=set)
    artifacts: Dict[str, Any] = field(default_factory=dict)

@dataclass
class DevelopmentStage:
    """Repraesentiert eine Entwicklungsphase."""
    name: str
    tasks: List[DevelopmentTask]
    dependencies: Set[str] = field(default_factory=set)
    status: str = "pending"
    parallel_execution: bool = True

class DevelopmentPipelineManager:
    """Verwaltet die parallele Ausfuehrung von Entwicklungspipelines."""
    
    def __init__(self, config_path: str):
        """
        Initialisiert den Development Pipeline Manager.
        
        Args:
            config_path: Pfad zur Konfigurationsdatei
        """
        self.config_path = config_path
        self.config = self._load_config()
        self.store = PipelineStateStore()
        self.pipelines: Dict[str, List[DevelopmentStage]] = {}
        self.running_pipelines: Dict[str, Dict[str, Any]] = {}
        
    def _load_config(self) -> Dict[str, Any]:
        """Laedt die Konfiguration aus der JSON-Datei."""
        with open(self.config_path, "r", encoding="utf-8") as f:
            return json.load(f)
            
    async def initialize(self):
        """Initialisiert die MongoDB-Collections und laedt die Pipelines."""
        await self.store.init_collections()
        self._setup_pipelines()
        
    def _setup_pipelines(self):
        """Richtet die Entwicklungspipelines basierend auf der Konfiguration ein."""
        for pipeline_name, pipeline_config in self.config.items():
            if pipeline_name not in ("dependencies", "execution_config"):
                stages = []
                for stage_config in pipeline_config["stages"]:
                    tasks = [
                        DevelopmentTask(
                            name=task,
                            description=task
                        )
                        for task in stage_config["tasks"]
                    ]
                    
                    stage = DevelopmentStage(
                        name=stage_config["name"],
                        tasks=tasks,
                        dependencies=set(stage_config.get("dependencies", []))
                    )
                    stages.append(stage)
                
                self.pipelines[pipeline_name] = stages
                
    async def _execute_task(self, task: DevelopmentTask) -> Dict[str, Any]:
        """
        Fuehrt eine einzelne Entwicklungsaufgabe aus.
        
        Args:
            task: Die auszufuehrende Aufgabe
            
        Returns:
            Ergebnis der Aufgabenausfuehrung
        """
        task.status = "running"
        task.start_time = datetime.now()
        
        try:
            # Hier wuerde die eigentliche Task-Ausfuehrung stattfinden
            # Fuer jetzt simulieren wir nur die Ausfuehrung
            await asyncio.sleep(2)
            
            task.status = "completed"
            task.end_time = datetime.now()
            return {
                "status": "completed",
                "task": task.name,
                "duration": (task.end_time - task.start_time).total_seconds()
            }
            
        except Exception as e:
            task.status = "failed"
            task.end_time = datetime.now()
            return {
                "status": "failed",
                "task": task.name,
                "error": str(e)
            }
            
    async def _execute_stage(self, stage: DevelopmentStage) -> Dict[str, Any]:
        """
        Fuehrt eine Entwicklungsphase aus.
        
        Args:
            stage: Die auszufuehrende Phase
            
        Returns:
            Ergebnis der Phasenausfuehrung
        """
        stage.status = "running"
        results = []
        
        if stage.parallel_execution:
            # Parallele Ausfuehrung aller Tasks
            tasks = [
                self._execute_task(task)
                for task in stage.tasks
            ]
            results = await asyncio.gather(*tasks)
        else:
            # Sequentielle Ausfuehrung
            for task in stage.tasks:
                result = await self._execute_task(task)
                results.append(result)
                
                if result["status"] == "failed":
                    stage.status = "failed"
                    return {
                        "status": "failed",
                        "stage": stage.name,
                        "results": results
                    }
        
        # Pruefen, ob alle Tasks erfolgreich waren
        if all(r["status"] == "completed" for r in results):
            stage.status = "completed"
        else:
            stage.status = "failed"
            
        return {
            "status": stage.status,
            "stage": stage.name,
            "results": results
        }
        
    def _get_ready_pipelines(self) -> List[str]:
        """
        Ermittelt die Pipelines, die ausgefuehrt werden koennen.
        
        Returns:
            Liste der ausfuehrbaren Pipeline-Namen
        """
        ready_pipelines = []
        pipeline_dependencies = self.config["dependencies"]
        
        for pipeline_name in self.pipelines:
            if pipeline_name not in pipeline_dependencies:
                ready_pipelines.append(pipeline_name)
                continue
                
            dependencies = pipeline_dependencies[pipeline_name]
            if all(dep not in self.running_pipelines for dep in dependencies):
                ready_pipelines.append(pipeline_name)
                
        return ready_pipelines[:self.config["execution_config"]["max_parallel_pipelines"]]
        
    async def execute_pipeline(self, pipeline_name: str) -> Dict[str, Any]:
        """
        Fuehrt eine Entwicklungspipeline aus.
        
        Args:
            pipeline_name: Name der Pipeline
            
        Returns:
            Ergebnis der Pipeline-Ausfuehrung
        """
        if pipeline_name not in self.pipelines:
            raise ValueError(f"Pipeline '{pipeline_name}' nicht gefunden")
            
        stages = self.pipelines[pipeline_name]
        state = {
            "pipeline": pipeline_name,
            "status": "running",
            "start_time": datetime.now().isoformat(),
            "results": [],
            "current_stage": None
        }
        
        self.running_pipelines[pipeline_name] = state
        
        try:
            # Pipeline in MongoDB erstellen
            await self.store.create_workflow(
                workflow_id=pipeline_name,
                pipeline_name=pipeline_name,
                input_data={"type": "development_pipeline"}
            )
            
            # Status auf "running" setzen
            await self.store.update_workflow_status(
                workflow_id=pipeline_name,
                status="running"
            )
            
            for stage in stages:
                state["current_stage"] = stage.name
                
                # Stage-Status in MongoDB aktualisieren
                await self.store.update_workflow_status(
                    workflow_id=pipeline_name,
                    status="running",
                    metadata={"current_stage": stage.name}
                )
                
                result = await self._execute_stage(stage)
                state["results"].append(result)
                
                # Stage-Ergebnis in MongoDB speichern
                await self.store.store_result(
                    workflow_id=pipeline_name,
                    stage_name=stage.name,
                    result=result
                )
                
                if result["status"] == "failed":
                    state["status"] = "failed"
                    break
            
            if state["status"] != "failed":
                state["status"] = "completed"
                
            state["end_time"] = datetime.now().isoformat()
            
            # Finalen Status in MongoDB speichern
            await self.store.update_workflow_status(
                workflow_id=pipeline_name,
                status=state["status"],
                metadata={
                    "end_time": state["end_time"],
                    "results": state["results"]
                }
            )
            
            return state
            
        except Exception as e:
            error_msg = f"Fehler in Pipeline {pipeline_name}: {str(e)}"
            logger.error(error_msg)
            
            state["status"] = "failed"
            state["error"] = str(e)
            state["end_time"] = datetime.now().isoformat()
            
            # Fehlerstatus in MongoDB speichern
            await self.store.update_workflow_status(
                workflow_id=pipeline_name,
                status="failed",
                metadata={
                    "error": str(e),
                    "end_time": state["end_time"]
                }
            )
            
            return state
        finally:
            del self.running_pipelines[pipeline_name]
            
    async def execute_all_pipelines(self) -> Dict[str, Any]:
        """
        Fuehrt alle Entwicklungspipelines parallel aus.
        
        Returns:
            Gesamtergebnis der Pipeline-Ausfuehrung
        """
        overall_results = {}
        
        while len(overall_results) < len(self.pipelines):
            ready_pipelines = self._get_ready_pipelines()
            if not ready_pipelines:
                await asyncio.sleep(1)
                continue
                
            # Parallele Ausfuehrung der bereiten Pipelines
            tasks = [
                self.execute_pipeline(pipeline_name)
                for pipeline_name in ready_pipelines
                if pipeline_name not in overall_results
            ]
            
            if tasks:
                results = await asyncio.gather(*tasks)
                for pipeline_name, result in zip(ready_pipelines, results):
                    overall_results[pipeline_name] = result
                    
        return overall_results
