# -*- coding: utf-8 -*-
"""
Agent-Kommunikations-Tool für die Development Pipeline.
"""

from typing import Dict, Any, List
from .base_tool import BaseTool
import asyncio
from datetime import datetime
import json

class AgentCommunicator(BaseTool):
    """Tool für die Kommunikation zwischen Agenten."""
    
    def __init__(self):
        super().__init__(
            name="agent_communicator",
            description="Verwaltet die Kommunikation zwischen Agenten"
        )
        self.message_collection = self.db.agent_messages
        self.agent_collection = self.db.agents
        
    async def initialize(self):
        """Initialisiert das Kommunikations-Tool."""
        await super().initialize()
        # Index für Nachrichten
        await self.message_collection.create_index([
            ("sender_id", 1),
            ("receiver_id", 1),
            ("timestamp", -1)
        ])
        # Index für Agenten
        await self.agent_collection.create_index([
            ("agent_id", 1),
            ("status", 1)
        ])
        
    async def _execute_tool_logic(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Führt die Kommunikations-Logik aus.
        
        Args:
            input_data: Dict mit:
                - action: Auszuführende Aktion
                - sender_id: ID des sendenden Agenten
                - receiver_id: ID des empfangenden Agenten (optional)
                - message_data: Nachrichteninhalt
                
        Returns:
            Dict mit Ausführungsergebnis
        """
        action = input_data.get("action")
        sender_id = input_data.get("sender_id")
        
        if not action or not sender_id:
            raise ValueError("action und sender_id sind erforderlich")
            
        actions = {
            "send_message": self._send_message,
            "get_messages": self._get_messages,
            "register_agent": self._register_agent,
            "update_agent_status": self._update_agent_status
        }
        
        if action not in actions:
            raise ValueError(f"Ungültige Aktion: {action}")
            
        result = await actions[action](**input_data)
        return result
        
    async def _send_message(
        self,
        sender_id: str,
        receiver_id: str,
        message_data: Dict[str, Any],
        **kwargs
    ) -> Dict[str, Any]:
        """Sendet eine Nachricht an einen anderen Agenten."""
        message = {
            "sender_id": sender_id,
            "receiver_id": receiver_id,
            "message_data": message_data,
            "timestamp": datetime.utcnow(),
            "status": "sent"
        }
        
        await self.message_collection.insert_one(message)
        return {"status": "success", "message": message}
        
    async def _get_messages(
        self,
        receiver_id: str,
        since: datetime = None,
        limit: int = 100,
        **kwargs
    ) -> Dict[str, Any]:
        """Ruft Nachrichten für einen Agenten ab."""
        query = {"receiver_id": receiver_id}
        if since:
            query["timestamp"] = {"$gt": since}
            
        messages = await self.message_collection.find(query).sort(
            "timestamp", -1
        ).limit(limit).to_list(length=None)
        
        return {
            "status": "success",
            "messages": messages,
            "count": len(messages)
        }
        
    async def _register_agent(
        self,
        agent_id: str,
        agent_type: str,
        capabilities: List[str],
        **kwargs
    ) -> Dict[str, Any]:
        """Registriert einen neuen Agenten."""
        agent = {
            "agent_id": agent_id,
            "agent_type": agent_type,
            "capabilities": capabilities,
            "status": "active",
            "registered_at": datetime.utcnow(),
            "last_heartbeat": datetime.utcnow()
        }
        
        await self.agent_collection.insert_one(agent)
        return {"status": "success", "agent": agent}
        
    async def _update_agent_status(
        self,
        agent_id: str,
        status: str,
        **kwargs
    ) -> Dict[str, Any]:
        """Aktualisiert den Status eines Agenten."""
        result = await self.agent_collection.update_one(
            {"agent_id": agent_id},
            {
                "$set": {
                    "status": status,
                    "last_heartbeat": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            raise ValueError(f"Agent nicht gefunden: {agent_id}")
            
        return {"status": "success", "agent_status": status}
        
    async def broadcast_message(
        self,
        sender_id: str,
        message_data: Dict[str, Any],
        agent_filter: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Sendet eine Nachricht an alle aktiven Agenten (optional gefiltert).
        
        Args:
            sender_id: ID des sendenden Agenten
            message_data: Nachrichteninhalt
            agent_filter: Filter für Zielagenten
            
        Returns:
            Dict mit Broadcast-Ergebnis
        """
        query = {"status": "active"}
        if agent_filter:
            query.update(agent_filter)
            
        target_agents = await self.agent_collection.find(query).to_list(length=None)
        
        sent_messages = []
        for agent in target_agents:
            if agent["agent_id"] != sender_id:  # Keine Selbstnachrichten
                message_result = await self._send_message(
                    sender_id=sender_id,
                    receiver_id=agent["agent_id"],
                    message_data=message_data
                )
                sent_messages.append(message_result["message"])
                
        return {
            "status": "success",
            "broadcast_count": len(sent_messages),
            "messages": sent_messages
        }
