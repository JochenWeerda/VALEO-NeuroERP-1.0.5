#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Multi-Agent-Framework für das VALEO-NeuroERP-System.

Dieses Framework integriert verschiedene Agentenrollen (VAN, PLAN, CREATE, IMPLEMENT, REVIEW)
und koordiniert ihre Zusammenarbeit über LangGraph-Workflows und MCP-Tool-Integration.
"""

import os
import json
import logging
import asyncio
from typing import Dict, List, Any, Optional, Union, Callable
from enum import Enum
from pathlib import Path

# Lokale Importe
try:
    from .mcp_integration import MCPIntegration
    from .langgraph_integration import LangGraphIntegration, AgentType, WorkflowState
except ImportError:
    # Für direkte Ausführung dieses Skripts
    from mcp_integration import MCPIntegration
    from langgraph_integration import LangGraphIntegration, AgentType, WorkflowState

logger = logging.getLogger(__name__)

class AgentRole(str, Enum):
    """Enum für die verschiedenen Rollen der Agenten im Framework."""
    VALIDATOR_ANALYZER = "van"
    PLANNER = "plan"
    CREATOR = "create"
    IMPLEMENTER = "implement"
    REVIEWER = "review"

class MultiAgentFramework:
    """
    Hauptklasse für das Multi-Agent-Framework.
    
    Diese Klasse integriert die MCP- und LangGraph-Komponenten und stellt
    eine einheitliche Schnittstelle für die Verwendung des Frameworks bereit.
    """
    
    def __init__(self, 
                 config_path: Optional[str] = None,
                 mcp_server_url: Optional[str] = None):
        """
        Initialisiert das Multi-Agent-Framework.
        
        Args:
            config_path: Optionaler Pfad zur Konfigurationsdatei.
            mcp_server_url: Optionale URL des MCP-Servers.
        """
        # Konfiguration laden
        self.config = self._load_config(config_path)
        
        # MCP-Server-URL aus Konfiguration oder Parameter
        mcp_server_url = mcp_server_url or self.config.get("mcp_server_url") or "http://localhost:8000"
        
        # MCP-Integration initialisieren
        self.mcp_integration = MCPIntegration(
            mcp_server_url=mcp_server_url,
            config=self.config.get("mcp_config", {})
        )
        
        # LangGraph-Integration initialisieren
        self.langgraph_integration = LangGraphIntegration(
            config=self.config.get("langgraph_config", {})
        )
        
        # Agenten registrieren
        self._register_agents()
        
        # Workflows erstellen
        self._create_workflows()
        
        logger.info("Multi-Agent-Framework initialisiert")
    
    def _load_config(self, config_path: Optional[str] = None) -> Dict[str, Any]:
        """
        Lädt die Konfiguration aus einer Datei oder verwendet Standardwerte.
        
        Args:
            config_path: Optionaler Pfad zur Konfigurationsdatei.
            
        Returns:
            Ein Dictionary mit der Konfiguration.
        """
        config = {
            "mcp_server_url": "http://localhost:8000",
            "mcp_config": {
                "api_key": os.environ.get("MCP_API_KEY"),
                "timeout": 30,
                "retry_attempts": 3
            },
            "langgraph_config": {},
            "workflows": {
                "standard": {
                    "description": "Standard-Workflow für das Multi-Agent-Framework",
                    "transitions": {}  # Standardübergänge verwenden
                }
            },
            "agents": {
                "van": {
                    "description": "Validator-Analyzer-Agent",
                    "model": "gpt-4o",
                    "temperature": 0.2
                },
                "plan": {
                    "description": "Planner-Agent",
                    "model": "gpt-4o",
                    "temperature": 0.3
                },
                "create": {
                    "description": "Creator-Agent",
                    "model": "gpt-4o",
                    "temperature": 0.7
                },
                "implement": {
                    "description": "Implementer-Agent",
                    "model": "gpt-4o",
                    "temperature": 0.2
                },
                "review": {
                    "description": "Reviewer-Agent",
                    "model": "gpt-4o",
                    "temperature": 0.1
                }
            }
        }
        
        # Konfiguration aus Datei laden, falls vorhanden
        if config_path and os.path.exists(config_path):
            try:
                with open(config_path, "r", encoding="utf-8") as f:
                    file_config = json.load(f)
                
                # Konfiguration rekursiv aktualisieren
                def update_dict_recursive(d, u):
                    for k, v in u.items():
                        if isinstance(v, dict) and k in d and isinstance(d[k], dict):
                            update_dict_recursive(d[k], v)
                        else:
                            d[k] = v
                
                update_dict_recursive(config, file_config)
                logger.info(f"Konfiguration aus {config_path} geladen")
            except Exception as e:
                logger.error(f"Fehler beim Laden der Konfiguration aus {config_path}: {str(e)}")
        
        return config
    
    def _register_agents(self) -> None:
        """Registriert die Agentenfunktionen bei der LangGraph-Integration."""
        # VAN-Agent (Validator-Analyzer)
        self.langgraph_integration.register_agent(
            AgentType.VAN,
            self._create_agent_function(AgentType.VAN)
        )
        
        # PLAN-Agent (Planner)
        self.langgraph_integration.register_agent(
            AgentType.PLAN,
            self._create_agent_function(AgentType.PLAN)
        )
        
        # CREATE-Agent (Creator)
        self.langgraph_integration.register_agent(
            AgentType.CREATE,
            self._create_agent_function(AgentType.CREATE)
        )
        
        # IMPLEMENT-Agent (Implementer)
        self.langgraph_integration.register_agent(
            AgentType.IMPLEMENT,
            self._create_agent_function(AgentType.IMPLEMENT)
        )
        
        # REVIEW-Agent (Reviewer)
        self.langgraph_integration.register_agent(
            AgentType.REVIEW,
            self._create_agent_function(AgentType.REVIEW)
        )
    
    def _create_agent_function(self, agent_type: AgentType) -> Callable[[WorkflowState], WorkflowState]:
        """
        Erstellt eine Agentenfunktion für einen bestimmten Agententyp.
        
        Args:
            agent_type: Der Typ des Agenten.
            
        Returns:
            Eine Funktion, die den Agenten implementiert.
        """
        async def agent_function(state: WorkflowState) -> WorkflowState:
            """
            Die Agentenfunktion, die im Workflow ausgeführt wird.
            
            Args:
                state: Der aktuelle Workflow-Zustand.
                
            Returns:
                Der aktualisierte Workflow-Zustand.
            """
            logger.info(f"Agent {agent_type} wird ausgeführt")
            
            # MCP-Kontext für den Agenten erstellen
            mcp_context = self.mcp_integration.create_mcp_context(agent_type)
            
            # Agent-Konfiguration abrufen
            agent_config = self.config.get("agents", {}).get(agent_type, {})
            
            # Agentenzustand abrufen oder erstellen
            agent_state = state.agent_states.get(agent_type)
            if not agent_state:
                agent_state = {"data": {}, "messages": [], "completed": False, "error": None, "next_agent": None}
                state.agent_states[agent_type] = agent_state
            
            # Hier würde die eigentliche Agentenlogik implementiert werden
            # Je nach Agententyp würden unterschiedliche Aktionen ausgeführt werden
            
            # Beispiel für eine einfache Implementierung:
            try:
                if agent_type == AgentType.VAN:
                    # Validierung und Analyse durchführen
                    agent_state["data"]["validation_result"] = "Anforderungen validiert"
                    agent_state["completed"] = True
                    agent_state["next_agent"] = AgentType.PLAN
                
                elif agent_type == AgentType.PLAN:
                    # Planung durchführen
                    agent_state["data"]["plan"] = "Plan erstellt"
                    agent_state["completed"] = True
                    agent_state["next_agent"] = AgentType.CREATE
                
                elif agent_type == AgentType.CREATE:
                    # Code oder Design erstellen
                    agent_state["data"]["creation_result"] = "Code/Design erstellt"
                    agent_state["completed"] = True
                    agent_state["next_agent"] = AgentType.IMPLEMENT
                
                elif agent_type == AgentType.IMPLEMENT:
                    # Implementierung durchführen
                    agent_state["data"]["implementation_result"] = "Implementierung abgeschlossen"
                    agent_state["completed"] = True
                    agent_state["next_agent"] = AgentType.REVIEW
                
                elif agent_type == AgentType.REVIEW:
                    # Review durchführen
                    agent_state["data"]["review_result"] = "Review abgeschlossen"
                    agent_state["completed"] = True
                    agent_state["next_agent"] = None  # Workflow beenden
            
            except Exception as e:
                agent_state["error"] = str(e)
                logger.error(f"Fehler bei Ausführung von Agent {agent_type}: {str(e)}")
            
            return state
        
        # In der Praxis würde hier eine echte Agentenfunktion zurückgegeben werden,
        # die auf dem entsprechenden Agententyp basiert und asynchron ausgeführt wird
        
        # Wrapper für die asynchrone Funktion
        def sync_agent_function(state: WorkflowState) -> WorkflowState:
            loop = asyncio.get_event_loop()
            return loop.run_until_complete(agent_function(state))
        
        return sync_agent_function
    
    def _create_workflows(self) -> None:
        """Erstellt die Workflows für das Framework."""
        # Workflows aus der Konfiguration erstellen
        for workflow_id, workflow_config in self.config.get("workflows", {}).items():
            self.langgraph_integration.create_workflow(workflow_id, workflow_config)
            logger.info(f"Workflow '{workflow_id}' erstellt")
    
    async def run_workflow(self, 
                         workflow_id: str = "standard", 
                         input_data: Optional[Dict[str, Any]] = None, 
                         start_agent: Union[str, AgentType] = AgentType.VAN) -> Dict[str, Any]:
        """
        Führt einen Workflow aus.
        
        Args:
            workflow_id: Die ID des Workflows.
            input_data: Optionale Eingabedaten für den Workflow.
            start_agent: Der Agent, mit dem der Workflow beginnen soll.
            
        Returns:
            Das Ergebnis des Workflows.
            
        Raises:
            ValueError: Wenn der Workflow nicht gefunden wurde.
        """
        result = await self.langgraph_integration.run_workflow(
            workflow_id=workflow_id,
            input_data=input_data,
            start_agent=start_agent
        )
        
        return result
    
    def save_workflow_state(self, workflow_id: str, file_path: str) -> None:
        """
        Speichert den Zustand eines Workflows in einer Datei.
        
        Args:
            workflow_id: Die ID des Workflows.
            file_path: Der Pfad zur Datei, in der der Zustand gespeichert werden soll.
        """
        self.langgraph_integration.save_workflow_state(workflow_id, file_path)
    
    def load_workflow_state(self, file_path: str) -> str:
        """
        Lädt den Zustand eines Workflows aus einer Datei.
        
        Args:
            file_path: Der Pfad zur Datei, aus der der Zustand geladen werden soll.
            
        Returns:
            Die ID des geladenen Workflows.
        """
        return self.langgraph_integration.load_workflow_state(file_path)
    
    def get_workflow_state(self, workflow_id: str) -> Optional[Dict[str, Any]]:
        """
        Gibt den Zustand eines Workflows zurück.
        
        Args:
            workflow_id: Die ID des Workflows.
            
        Returns:
            Ein Dictionary mit dem Workflow-Zustand oder None, wenn der Workflow nicht gefunden wurde.
        """
        return self.langgraph_integration.get_workflow_state(workflow_id)
    
    def register_custom_tool(self, 
                            tool_name: str, 
                            tool_config: Dict[str, Any]) -> None:
        """
        Registriert ein benutzerdefiniertes Tool.
        
        Args:
            tool_name: Der Name des Tools.
            tool_config: Die Konfiguration des Tools.
        """
        self.mcp_integration.register_tool(tool_name, tool_config)


# Beispiel für die Verwendung des Multi-Agent-Frameworks
if __name__ == "__main__":
    # Logger konfigurieren
    logging.basicConfig(level=logging.INFO)
    
    # Multi-Agent-Framework initialisieren
    framework = MultiAgentFramework()
    
    # Benutzerdefiniertes Tool registrieren
    framework.register_custom_tool(
        "custom_analysis_tool",
        {
            "description": "Ein benutzerdefiniertes Analysetool",
            "allowed_agents": ["van", "review"],
            "parameters": {
                "data_source": "string",
                "analysis_type": "string"
            }
        }
    )
    
    # Workflow ausführen
    async def run_example():
        result = await framework.run_workflow(
            workflow_id="standard",
            input_data={"requirement": "Neue Funktionalität implementieren"}
        )
        print("Workflow-Ergebnis:", result)
    
    # asyncio.run(run_example())  # In einer echten asynchronen Umgebung ausführen
