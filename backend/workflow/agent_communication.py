"""
Agenten-Kommunikation und Handover-Protokolle
"""

import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime
from pydantic import BaseModel
from backend.core.simple_logging import logger
import json
import os

class HandoverDocument(BaseModel):
    """Modell für Handover-Dokumente"""
    task_id: str
    from_agent: str
    to_agent: str
    timestamp: datetime
    artifacts: Dict[str, Any]
    status: str
    notes: str
    requirements: List[str]
    dependencies: List[str]

class CommunicationMessage(BaseModel):
    """Modell für Kommunikationsnachrichten zwischen Agenten"""
    message_id: str
    from_agent: str
    to_agent: str
    timestamp: datetime
    message_type: str  # request, response, notification
    content: Dict[str, Any]
    priority: str = "normal"
    requires_response: bool = False
    response_to: Optional[str] = None

class AgentCommunication:
    """Manager für die Agenten-Kommunikation"""
    
    def __init__(self):
        self.handover_documents: Dict[str, List[HandoverDocument]] = {}
        self.messages: Dict[str, List[CommunicationMessage]] = {}
        self.active_handovers: Dict[str, HandoverDocument] = {}
        
    async def create_handover(
        self,
        task_id: str,
        from_agent: str,
        to_agent: str,
        artifacts: Dict[str, Any],
        notes: str,
        requirements: List[str],
        dependencies: List[str]
    ) -> HandoverDocument:
        """Erstellt ein neues Handover-Dokument"""
        handover = HandoverDocument(
            task_id=task_id,
            from_agent=from_agent,
            to_agent=to_agent,
            timestamp=datetime.now(),
            artifacts=artifacts,
            status="pending",
            notes=notes,
            requirements=requirements,
            dependencies=dependencies
        )
        
        if task_id not in self.handover_documents:
            self.handover_documents[task_id] = []
            
        self.handover_documents[task_id].append(handover)
        self.active_handovers[task_id] = handover
        
        await self.save_handover(handover)
        await self.notify_handover(handover)
        
        return handover
        
    async def accept_handover(
        self,
        task_id: str,
        agent: str
    ) -> HandoverDocument:
        """Akzeptiert ein Handover"""
        if task_id not in self.active_handovers:
            raise ValueError(f"No active handover for task {task_id}")
            
        handover = self.active_handovers[task_id]
        if handover.to_agent != agent:
            raise ValueError(f"Handover is not for agent {agent}")
            
        handover.status = "accepted"
        await self.save_handover(handover)
        await self.notify_handover_status(handover)
        
        return handover
        
    async def complete_handover(
        self,
        task_id: str,
        agent: str,
        result: Dict[str, Any]
    ) -> HandoverDocument:
        """Schließt ein Handover ab"""
        if task_id not in self.active_handovers:
            raise ValueError(f"No active handover for task {task_id}")
            
        handover = self.active_handovers[task_id]
        if handover.to_agent != agent:
            raise ValueError(f"Handover is not for agent {agent}")
            
        handover.status = "completed"
        handover.artifacts.update({"result": result})
        
        await self.save_handover(handover)
        await self.notify_handover_status(handover)
        
        del self.active_handovers[task_id]
        return handover
        
    async def send_message(
        self,
        from_agent: str,
        to_agent: str,
        message_type: str,
        content: Dict[str, Any],
        priority: str = "normal",
        requires_response: bool = False,
        response_to: Optional[str] = None
    ) -> CommunicationMessage:
        """Sendet eine Nachricht zwischen Agenten"""
        message = CommunicationMessage(
            message_id=f"msg_{datetime.now().timestamp()}",
            from_agent=from_agent,
            to_agent=to_agent,
            timestamp=datetime.now(),
            message_type=message_type,
            content=content,
            priority=priority,
            requires_response=requires_response,
            response_to=response_to
        )
        
        if from_agent not in self.messages:
            self.messages[from_agent] = []
            
        self.messages[from_agent].append(message)
        await self.save_message(message)
        await self.notify_message(message)
        
        return message
        
    async def get_messages(
        self,
        agent: str,
        since: Optional[datetime] = None
    ) -> List[CommunicationMessage]:
        """Gibt Nachrichten für einen Agenten zurück"""
        if agent not in self.messages:
            return []
            
        messages = self.messages[agent]
        if since:
            messages = [m for m in messages if m.timestamp > since]
            
        return messages
        
    async def save_handover(self, handover: HandoverDocument):
        """Speichert ein Handover-Dokument"""
        try:
            handover_dir = "handovers"
            os.makedirs(handover_dir, exist_ok=True)
            
            filename = os.path.join(
                handover_dir,
                f"handover_{handover.task_id}_{handover.timestamp.strftime('%Y%m%d_%H%M%S')}.json"
            )
            
            with open(filename, "w") as f:
                json.dump(handover.model_dump(), f, default=str, indent=2)
                
        except Exception as e:
            logger.error(f"Error saving handover: {str(e)}")
            
    async def save_message(self, message: CommunicationMessage):
        """Speichert eine Nachricht"""
        try:
            message_dir = "messages"
            os.makedirs(message_dir, exist_ok=True)
            
            filename = os.path.join(
                message_dir,
                f"message_{message.message_id}.json"
            )
            
            with open(filename, "w") as f:
                json.dump(message.model_dump(), f, default=str, indent=2)
                
        except Exception as e:
            logger.error(f"Error saving message: {str(e)}")
            
    async def notify_handover(self, handover: HandoverDocument):
        """Benachrichtigt über ein neues Handover"""
        logger.info(
            f"New handover for task {handover.task_id} "
            f"from {handover.from_agent} to {handover.to_agent}"
        )
        
    async def notify_handover_status(self, handover: HandoverDocument):
        """Benachrichtigt über Statusänderungen eines Handovers"""
        logger.info(
            f"Handover status update for task {handover.task_id}: {handover.status}"
        )
        
    async def notify_message(self, message: CommunicationMessage):
        """Benachrichtigt über eine neue Nachricht"""
        logger.info(
            f"New message from {message.from_agent} to {message.to_agent}: "
            f"{message.message_type}"
        ) 