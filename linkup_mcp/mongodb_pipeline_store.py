# -*- coding: utf-8 -*-
"""
MongoDB-Integration für die Pipeline-Zustandsspeicherung.
"""

import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from bson.objectid import ObjectId

logger = logging.getLogger(__name__)

class PipelineStateStore:
    """Verwaltet die persistente Speicherung von Pipeline-Zustaenden in MongoDB."""
    
    def __init__(self, connection_string: str = "mongodb://localhost:27017"):
        """
        Initialisiert die MongoDB-Verbindung.
        
        Args:
            connection_string: MongoDB-Verbindungsstring
        """
        self.client = AsyncIOMotorClient(connection_string)
        self.db = self.client.valeo_neuro_erp
        self.workflows = self.db.pipeline_workflows
        self.stages = self.db.pipeline_stages
        self.results = self.db.pipeline_results
    
    async def init_collections(self):
        """Initialisiert die benoetigten Collections und Indices."""
        # Workflow-Collection
        await self.workflows.create_index("workflow_id", unique=True)
        await self.workflows.create_index("status")
        await self.workflows.create_index("pipeline_name")
        
        # Stage-Collection
        await self.stages.create_index([("workflow_id", 1), ("stage_name", 1)], unique=True)
        await self.stages.create_index("status")
        
        # Results-Collection
        await self.results.create_index([("workflow_id", 1), ("stage_name", 1)])
        await self.results.create_index("timestamp")
        
    async def create_workflow(self, 
                            workflow_id: str,
                            pipeline_name: str,
                            input_data: Dict[str, Any]) -> str:
        """
        Erstellt einen neuen Workflow-Eintrag.
        
        Args:
            workflow_id: ID des Workflows
            pipeline_name: Name der Pipeline
            input_data: Eingabedaten fuer den Workflow
            
        Returns:
            ID des erstellten Workflow-Dokuments
        """
        doc = {
            "workflow_id": workflow_id,
            "pipeline_name": pipeline_name,
            "status": "initialized",
            "input_data": input_data,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await self.workflows.insert_one(doc)
        return str(result.inserted_id)
        
    async def update_workflow_status(self,
                                   workflow_id: str,
                                   status: str,
                                   metadata: Optional[Dict[str, Any]] = None):
        """
        Aktualisiert den Status eines Workflows.
        
        Args:
            workflow_id: ID des Workflows
            status: Neuer Status
            metadata: Optionale Metadaten
        """
        update = {
            "$set": {
                "status": status,
                "updated_at": datetime.utcnow()
            }
        }
        
        if metadata:
            update["$set"].update(metadata)
            
        await self.workflows.update_one(
            {"workflow_id": workflow_id},
            update
        )
        
    async def create_stage(self,
                          workflow_id: str,
                          stage_name: str,
                          stage_config: Dict[str, Any]) -> str:
        """
        Erstellt einen neuen Stage-Eintrag.
        
        Args:
            workflow_id: ID des Workflows
            stage_name: Name der Stage
            stage_config: Konfiguration der Stage
            
        Returns:
            ID des erstellten Stage-Dokuments
        """
        doc = {
            "workflow_id": workflow_id,
            "stage_name": stage_name,
            "config": stage_config,
            "status": "pending",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await self.stages.insert_one(doc)
        return str(result.inserted_id)
        
    async def update_stage_status(self,
                                workflow_id: str,
                                stage_name: str,
                                status: str,
                                metadata: Optional[Dict[str, Any]] = None):
        """
        Aktualisiert den Status einer Stage.
        
        Args:
            workflow_id: ID des Workflows
            stage_name: Name der Stage
            status: Neuer Status
            metadata: Optionale Metadaten
        """
        update = {
            "$set": {
                "status": status,
                "updated_at": datetime.utcnow()
            }
        }
        
        if metadata:
            update["$set"].update(metadata)
            
        await self.stages.update_one(
            {"workflow_id": workflow_id, "stage_name": stage_name},
            update
        )
        
    async def store_result(self,
                          workflow_id: str,
                          stage_name: str,
                          result: Dict[str, Any]):
        """
        Speichert das Ergebnis einer Stage.
        
        Args:
            workflow_id: ID des Workflows
            stage_name: Name der Stage
            result: Ergebnis der Stage-Ausfuehrung
        """
        doc = {
            "workflow_id": workflow_id,
            "stage_name": stage_name,
            "result": result,
            "timestamp": datetime.utcnow()
        }
        
        await self.results.insert_one(doc)
        
    async def get_workflow_state(self, workflow_id: str) -> Optional[Dict[str, Any]]:
        """
        Ruft den aktuellen Zustand eines Workflows ab.
        
        Args:
            workflow_id: ID des Workflows
            
        Returns:
            Workflow-Zustand oder None wenn nicht gefunden
        """
        workflow = await self.workflows.find_one({"workflow_id": workflow_id})
        if not workflow:
            return None
            
        # Stage-Zustaende abrufen
        stages = await self.stages.find(
            {"workflow_id": workflow_id}
        ).to_list(length=None)
        
        # Letzte Ergebnisse abrufen
        results = await self.results.find(
            {"workflow_id": workflow_id}
        ).sort("timestamp", -1).to_list(length=None)
        
        return {
            "workflow": workflow,
            "stages": stages,
            "results": results
        }
        
    async def get_active_workflows(self) -> List[Dict[str, Any]]:
        """
        Ruft alle aktiven Workflows ab.
        
        Returns:
            Liste der aktiven Workflows
        """
        return await self.workflows.find(
            {"status": {"$in": ["initialized", "running"]}}
        ).to_list(length=None)
