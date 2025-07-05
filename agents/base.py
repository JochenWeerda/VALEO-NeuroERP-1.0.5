# -*- coding: utf-8 -*-
"""
🚀 GENXAIS Framework - Base Agent Implementation
"Build the Future from the Beginning"

Abstract base class for all GENXAIS agents with comprehensive capabilities.
"""

import asyncio
import json
import time
import logging
from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any, Callable
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum

logger = logging.getLogger("GENXAIS.Agent")

class AgentStatus(Enum):
    """Agent execution status states."""
    IDLE = "idle"
    WORKING = "working"
    WAITING = "waiting"
    ERROR = "error"
    COMPLETED = "completed"

@dataclass
class AgentMetrics:
    """Performance metrics for agent execution."""
    start_time: datetime
    end_time: Optional[datetime] = None
    tokens_used: int = 0
    api_calls: int = 0
    success_rate: float = 1.0
    error_count: int = 0
    quality_score: float = 0.0
    
    @property
    def duration(self) -> float:
        """Calculate execution duration in seconds."""
        if self.end_time:
            return (self.end_time - self.start_time).total_seconds()
        return (datetime.now() - self.start_time).total_seconds()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert metrics to dictionary."""
        return {
            **asdict(self),
            'start_time': self.start_time.isoformat(),
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'duration': self.duration
        }

@dataclass
class AgentMessage:
    """Message structure for agent communication."""
    sender: str
    recipient: str
    message_type: str
    content: Any
    timestamp: datetime
    priority: int = 0
    requires_response: bool = False
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert message to dictionary."""
        return {
            **asdict(self),
            'timestamp': self.timestamp.isoformat()
        }

class BaseAgent(ABC):
    """
    Abstract base class for all GENXAIS agents.
    
    Provides core functionality for:
    - Agent capabilities and messaging
    - Performance metrics tracking
    - Collaboration and coordination
    - State management and persistence
    """
    
    def __init__(self, agent_id: str, capabilities: List[str] = None):
        """
        Initialize base agent.
        
        Args:
            agent_id: Unique identifier for the agent
            capabilities: List of agent capabilities
        """
        self.agent_id = agent_id
        self.capabilities = capabilities or []
        self.status = AgentStatus.IDLE
        self.metrics = AgentMetrics(start_time=datetime.now())
        self.message_queue: List[AgentMessage] = []
        self.collaboration_history: List[Dict[str, Any]] = []
        self.coordinator = None
        self._handlers: Dict[str, Callable] = {}
        self._state: Dict[str, Any] = {}
        
        logger.info(f"🤖 Agent {self.agent_id} initialized with capabilities: {self.capabilities}")
    
    @abstractmethod
    async def execute_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a specific task assigned to this agent.
        
        Args:
            task: Task specification with requirements and parameters
            
        Returns:
            Task execution result with status and output
        """
        pass
    
    @abstractmethod
    def get_capabilities(self) -> List[str]:
        """
        Return list of agent capabilities.
        
        Returns:
            List of capability strings
        """
        pass
    
    async def send_message(self, recipient: str, message_type: str, content: Any, 
                          priority: int = 0, requires_response: bool = False) -> bool:
        """
        Send message to another agent or coordinator.
        
        Args:
            recipient: Target agent ID or 'coordinator'
            message_type: Type of message (request, response, notification, etc.)
            content: Message content
            priority: Message priority (0=low, 5=high)
            requires_response: Whether response is required
            
        Returns:
            Success status
        """
        try:
            message = AgentMessage(
                sender=self.agent_id,
                recipient=recipient,
                message_type=message_type,
                content=content,
                timestamp=datetime.now(),
                priority=priority,
                requires_response=requires_response
            )
            
            if self.coordinator and recipient == 'coordinator':
                await self.coordinator.receive_message(message)
            else:
                # Store message for later delivery
                self.message_queue.append(message)
            
            logger.debug(f"📤 {self.agent_id} sent {message_type} to {recipient}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Message sending failed: {e}")
            self.metrics.error_count += 1
            return False
    
    async def receive_message(self, message: AgentMessage) -> Optional[Dict[str, Any]]:
        """
        Receive and process incoming message.
        
        Args:
            message: Incoming message
            
        Returns:
            Response if required, None otherwise
        """
        try:
            logger.debug(f"📥 {self.agent_id} received {message.message_type} from {message.sender}")
            
            # Handle message based on type
            handler = self._handlers.get(message.message_type, self._default_message_handler)
            response = await handler(message)
            
            # Store collaboration history
            self.collaboration_history.append({
                'timestamp': message.timestamp.isoformat(),
                'sender': message.sender,
                'message_type': message.message_type,
                'processed': True
            })
            
            return response
            
        except Exception as e:
            logger.error(f"❌ Message processing failed: {e}")
            self.metrics.error_count += 1
            return None
    
    async def _default_message_handler(self, message: AgentMessage) -> Optional[Dict[str, Any]]:
        """Default message handler for unregistered message types."""
        logger.warning(f"⚠️ No handler for message type: {message.message_type}")
        return None
    
    def register_message_handler(self, message_type: str, handler: Callable):
        """
        Register handler for specific message type.
        
        Args:
            message_type: Type of message to handle
            handler: Async function to handle the message
        """
        self._handlers[message_type] = handler
        logger.debug(f"🔧 Registered handler for {message_type}")
    
    async def collaborate_with(self, other_agent_id: str, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Collaborate with another agent on a task.
        
        Args:
            other_agent_id: ID of collaborating agent
            task: Collaborative task specification
            
        Returns:
            Collaboration result
        """
        try:
            self.status = AgentStatus.WORKING
            
            # Send collaboration request
            await self.send_message(
                recipient=other_agent_id,
                message_type='collaboration_request',
                content=task,
                requires_response=True
            )
            
            # Wait for response (simplified - in real implementation would use proper async waiting)
            await asyncio.sleep(0.1)
            
            result = {
                'status': 'success',
                'collaborator': other_agent_id,
                'task_id': task.get('id', 'unknown'),
                'timestamp': datetime.now().isoformat()
            }
            
            self.collaboration_history.append(result)
            logger.info(f"🤝 {self.agent_id} collaborated with {other_agent_id}")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Collaboration failed: {e}")
            self.metrics.error_count += 1
            return {'status': 'error', 'error': str(e)}
        finally:
            self.status = AgentStatus.IDLE
    
    def update_metrics(self, tokens_used: int = 0, api_calls: int = 0, 
                      quality_score: float = None):
        """
        Update agent performance metrics.
        
        Args:
            tokens_used: Number of tokens consumed
            api_calls: Number of API calls made
            quality_score: Quality score for the operation
        """
        self.metrics.tokens_used += tokens_used
        self.metrics.api_calls += api_calls
        
        if quality_score is not None:
            # Update running average of quality score
            if self.metrics.quality_score == 0.0:
                self.metrics.quality_score = quality_score
            else:
                self.metrics.quality_score = (self.metrics.quality_score + quality_score) / 2
    
    def set_coordinator(self, coordinator):
        """
        Set agent coordinator for message routing.
        
        Args:
            coordinator: Coordinator instance
        """
        self.coordinator = coordinator
        logger.debug(f"🎯 {self.agent_id} connected to coordinator")
    
    def get_status(self) -> Dict[str, Any]:
        """
        Get current agent status and metrics.
        
        Returns:
            Comprehensive status information
        """
        return {
            'agent_id': self.agent_id,
            'status': self.status.value,
            'capabilities': self.capabilities,
            'metrics': self.metrics.to_dict(),
            'message_queue_size': len(self.message_queue),
            'collaboration_count': len(self.collaboration_history),
            'uptime': self.metrics.duration
        }
    
    def export_state(self) -> Dict[str, Any]:
        """
        Export agent state for persistence.
        
        Returns:
            Serializable state dictionary
        """
        return {
            'agent_id': self.agent_id,
            'capabilities': self.capabilities,
            'status': self.status.value,
            'metrics': self.metrics.to_dict(),
            'collaboration_history': self.collaboration_history,
            'state': self._state,
            'export_timestamp': datetime.now().isoformat()
        }
    
    def import_state(self, state: Dict[str, Any]) -> bool:
        """
        Import agent state from persistence.
        
        Args:
            state: State dictionary to import
            
        Returns:
            Success status
        """
        try:
            self.agent_id = state.get('agent_id', self.agent_id)
            self.capabilities = state.get('capabilities', self.capabilities)
            self.status = AgentStatus(state.get('status', AgentStatus.IDLE.value))
            self.collaboration_history = state.get('collaboration_history', [])
            self._state = state.get('state', {})
            
            logger.info(f"📥 {self.agent_id} state imported successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ State import failed: {e}")
            return False
    
    def __repr__(self) -> str:
        """String representation of the agent."""
        return f"<{self.__class__.__name__}(id={self.agent_id}, status={self.status.value})>" 