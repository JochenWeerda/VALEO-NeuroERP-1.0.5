# -*- coding: utf-8 -*-
"""
Workflow-Management-Tool für die Development Pipeline.
"""

from typing import Dict, Any, List
from .base_tool import BaseTool
import asyncio
from datetime import datetime

class WorkflowManager(BaseTool):
    """Tool für das Management von Entwicklungs-Workflows."""
    
    def __init__(self):
        super().__init__(
            name="workflow_manager",
            description="Verwaltet und koordiniert Entwicklungs-Workflows"
        )
        self.workflow_collection = self.db.workflows
        
    async def initialize(self):
        """Initialisiert das Workflow-Management-Tool."""
        await super().initialize()
        await self.workflow_collection.create_index([
            ("workflow_id", 1),
            ("status", 1),
            ("last_updated", -1)
        ])
        
    async def _execute_tool_logic(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Führt die Workflow-Management-Logik aus.
        
        Args:
            input_data: Dict mit:
                - workflow_id: ID des Workflows
                - action: Auszuführende Aktion
                - parameters: Parameter für die Aktion
                
        Returns:
            Dict mit Ausführungsergebnis
        """
        workflow_id = input_data.get("workflow_id")
        action = input_data.get("action")
        parameters = input_data.get("parameters", {})
        
        if not workflow_id or not action:
            raise ValueError("workflow_id und action sind erforderlich")
            
        actions = {
            "create": self._create_workflow,
            "update": self._update_workflow,
            "pause": self._pause_workflow,
            "resume": self._resume_workflow,
            "complete": self._complete_workflow
        }
        
        if action not in actions:
            raise ValueError(f"Ungültige Aktion: {action}")
            
        result = await actions[action](workflow_id, parameters)
        return result
        
    async def _create_workflow(self, workflow_id: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Erstellt einen neuen Workflow."""
        workflow = {
            "workflow_id": workflow_id,
            "status": "created",
            "parameters": parameters,
            "created_at": datetime.utcnow(),
            "last_updated": datetime.utcnow(),
            "steps": [],
            "current_step": None
        }
        
        await self.workflow_collection.insert_one(workflow)
        return {"status": "success", "workflow": workflow}
        
    async def _update_workflow(self, workflow_id: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Aktualisiert einen bestehenden Workflow."""
        update = {
            "$set": {
                "parameters": parameters,
                "last_updated": datetime.utcnow()
            }
        }
        
        if "step" in parameters:
            update["$push"] = {"steps": parameters["step"]}
            update["$set"]["current_step"] = parameters["step"]
            
        result = await self.workflow_collection.update_one(
            {"workflow_id": workflow_id},
            update
        )
        
        if result.modified_count == 0:
            raise ValueError(f"Workflow nicht gefunden: {workflow_id}")
            
        return {"status": "success", "modified_count": result.modified_count}
        
    async def _pause_workflow(self, workflow_id: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Pausiert einen Workflow."""
        result = await self.workflow_collection.update_one(
            {"workflow_id": workflow_id},
            {
                "$set": {
                    "status": "paused",
                    "last_updated": datetime.utcnow(),
                    "pause_reason": parameters.get("reason", "Manuell pausiert")
                }
            }
        )
        
        if result.modified_count == 0:
            raise ValueError(f"Workflow nicht gefunden: {workflow_id}")
            
        return {"status": "success", "workflow_status": "paused"}
        
    async def _resume_workflow(self, workflow_id: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Setzt einen pausierten Workflow fort."""
        result = await self.workflow_collection.update_one(
            {"workflow_id": workflow_id},
            {
                "$set": {
                    "status": "running",
                    "last_updated": datetime.utcnow()
                },
                "$unset": {"pause_reason": ""}
            }
        )
        
        if result.modified_count == 0:
            raise ValueError(f"Workflow nicht gefunden: {workflow_id}")
            
        return {"status": "success", "workflow_status": "running"}
        
    async def _complete_workflow(self, workflow_id: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Markiert einen Workflow als abgeschlossen."""
        result = await self.workflow_collection.update_one(
            {"workflow_id": workflow_id},
            {
                "$set": {
                    "status": "completed",
                    "last_updated": datetime.utcnow(),
                    "completion_data": parameters.get("completion_data", {})
                }
            }
        )
        
        if result.modified_count == 0:
            raise ValueError(f"Workflow nicht gefunden: {workflow_id}")
            
        return {"status": "success", "workflow_status": "completed"}
