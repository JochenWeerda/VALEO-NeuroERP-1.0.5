# -*- coding: utf-8 -*-
"""
Basis-Tool-Implementierung für das VALEO-NeuroERP Multi-Agent-Framework.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient

class BaseTool(ABC):
    """Basisklasse für alle Tools im Framework."""
    
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.client = AsyncIOMotorClient("mongodb://localhost:27017")
        self.db = self.client.valeo_neuro_erp
        self.tool_collection = self.db.tool_executions
        
    async def initialize(self):
        """Initialisiert das Tool und erstellt benötigte Indices."""
        await self.tool_collection.create_index([
            ("tool_name", 1),
            ("execution_time", -1)
        ])
        
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Führt das Tool aus und protokolliert die Ausführung.
        
        Args:
            input_data: Eingabedaten für das Tool
            
        Returns:
            Ergebnis der Tool-Ausführung
        """
        execution_id = await self._log_execution_start(input_data)
        
        try:
            result = await self._execute_tool_logic(input_data)
            await self._log_execution_success(execution_id, result)
            return result
        except Exception as e:
            error_msg = str(e)
            await self._log_execution_error(execution_id, error_msg)
            raise
            
    @abstractmethod
    async def _execute_tool_logic(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Implementiert die eigentliche Tool-Logik.
        
        Args:
            input_data: Eingabedaten für das Tool
            
        Returns:
            Ergebnis der Tool-Ausführung
        """
        pass
        
    async def _log_execution_start(self, input_data: Dict[str, Any]) -> str:
        """Protokolliert den Start der Tool-Ausführung."""
        doc = {
            "tool_name": self.name,
            "status": "running",
            "input_data": input_data,
            "start_time": datetime.utcnow(),
            "execution_time": datetime.utcnow()
        }
        result = await self.tool_collection.insert_one(doc)
        return str(result.inserted_id)
        
    async def _log_execution_success(self, execution_id: str, result: Dict[str, Any]):
        """Protokolliert die erfolgreiche Tool-Ausführung."""
        await self.tool_collection.update_one(
            {"_id": execution_id},
            {
                "$set": {
                    "status": "completed",
                    "result": result,
                    "end_time": datetime.utcnow()
                }
            }
        )
        
    async def _log_execution_error(self, execution_id: str, error_msg: str):
        """Protokolliert einen Fehler bei der Tool-Ausführung."""
        await self.tool_collection.update_one(
            {"_id": execution_id},
            {
                "$set": {
                    "status": "failed",
                    "error": error_msg,
                    "end_time": datetime.utcnow()
                }
            }
        )
        
    async def get_execution_history(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Ruft die Ausführungshistorie des Tools ab.
        
        Args:
            limit: Maximale Anzahl der Einträge
            
        Returns:
            Liste der letzten Ausführungen
        """
        return await self.tool_collection.find(
            {"tool_name": self.name}
        ).sort(
            "execution_time", -1
        ).limit(limit).to_list(length=None)
