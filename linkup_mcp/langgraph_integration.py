# -*- coding: utf-8 -*-
"""
LangGraph-Integration für das VALEO-NeuroERP Multi-Agent-Framework.
"""

from enum import Enum
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from datetime import datetime

class AgentType(Enum):
    """Verfügbare Agententypen im Framework."""
    TOOL_AGENT = "tool_agent"
    WORKFLOW_AGENT = "workflow_agent"
    COMMUNICATION_AGENT = "communication_agent"
    TESTING_AGENT = "testing_agent"
    SUPERVISOR_AGENT = "supervisor_agent"

@dataclass
class AgentConfig:
    """Konfiguration für einen Agenten."""
    agent_type: AgentType
    name: str
    description: str
    tools: List[str]
    parameters: Dict[str, Any] = field(default_factory=dict)
    timeout: float = 300.0
    max_retries: int = 3

@dataclass
class AgentState:
    """Zustand eines Agenten während der Ausführung."""
    agent_id: str
    agent_type: AgentType
    status: str = "pending"
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    current_task: Optional[str] = None
    results: Dict[str, Any] = field(default_factory=dict)
    error: Optional[str] = None

class LangGraphIntegration:
    """
    Integration von LangGraph für die Multi-Agent-Koordination.
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialisiert die LangGraph-Integration.
        
        Args:
            config: Optionale Konfiguration
        """
        self.config = config or {}
        self.agents: Dict[str, AgentConfig] = {}
        self.agent_states: Dict[str, AgentState] = {}
        
    def register_agent(self, agent_config: AgentConfig) -> None:
        """
        Registriert einen neuen Agenten.
        
        Args:
            agent_config: Konfiguration des Agenten
        """
        self.agents[agent_config.name] = agent_config
        
    def get_agent_config(self, agent_name: str) -> Optional[AgentConfig]:
        """
        Ruft die Konfiguration eines Agenten ab.
        
        Args:
            agent_name: Name des Agenten
            
        Returns:
            Agentenkonfiguration oder None wenn nicht gefunden
        """
        return self.agents.get(agent_name)
        
    def get_agent_state(self, agent_id: str) -> Optional[AgentState]:
        """
        Ruft den Zustand eines Agenten ab.
        
        Args:
            agent_id: ID des Agenten
            
        Returns:
            Agentenzustand oder None wenn nicht gefunden
        """
        return self.agent_states.get(agent_id)
        
    def update_agent_state(self,
                          agent_id: str,
                          status: Optional[str] = None,
                          task: Optional[str] = None,
                          result: Optional[Dict[str, Any]] = None,
                          error: Optional[str] = None) -> None:
        """
        Aktualisiert den Zustand eines Agenten.
        
        Args:
            agent_id: ID des Agenten
            status: Neuer Status
            task: Aktuelle Aufgabe
            result: Ergebnis der Aufgabe
            error: Aufgetretener Fehler
        """
        if agent_id not in self.agent_states:
            return
            
        state = self.agent_states[agent_id]
        
        if status:
            state.status = status
            if status == "running" and not state.start_time:
                state.start_time = datetime.now()
            elif status in ("completed", "failed"):
                state.end_time = datetime.now()
                
        if task:
            state.current_task = task
            
        if result:
            state.results.update(result)
            
        if error:
            state.error = error
            state.status = "failed"
            state.end_time = datetime.now()
