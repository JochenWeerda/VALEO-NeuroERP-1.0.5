#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
MCP-Integration für das VALEO-NeuroERP Multi-Agent-Framework.

Diese Klasse stellt die Integration zwischen dem Framework und dem Model Context Protocol (MCP) her,
um den Agenten Zugriff auf externe Tools zu ermöglichen.
"""

import os
import json
import logging
import asyncio
from typing import Dict, List, Any, Optional, Union

# MCP-Bibliothek importieren
try:
    import mcp
    from mcp.agents import Agent
    from mcp.tools import Tool
except ImportError:
    raise ImportError("MCP-Bibliothek nicht gefunden. Bitte installieren Sie 'mcp>=0.0.7'.")

logger = logging.getLogger(__name__)

class MCPIntegration:
    """
    Klasse zur Integration des Model Context Protocols (MCP) in das Multi-Agent-Framework.
    
    Diese Klasse ermöglicht es den Agenten des Frameworks, über MCP auf externe Tools zuzugreifen.
    Sie verwaltet die Konfiguration der Tools für verschiedene Agentenrollen und stellt
    MCP-Agenten für die verschiedenen Rollen bereit.
    """
    
    def __init__(self, mcp_server_url: str, config: Optional[Dict[str, Any]] = None):
        """
        Initialisiert die MCP-Integration.
        
        Args:
            mcp_server_url: Die URL des MCP-Servers.
            config: Optionale Konfigurationsparameter.
        """
        self.mcp_server_url = mcp_server_url
        self.config = config or {}
        self.api_key = self.config.get("api_key") or os.environ.get("MCP_API_KEY")
        self.timeout = self.config.get("timeout", 30)
        self.retry_attempts = self.config.get("retry_attempts", 3)
        
        # Tools aus Konfiguration laden
        self.tool_registry = self._load_tool_registry()
        
        logger.info(f"MCP-Integration initialisiert mit Server-URL: {mcp_server_url}")
    
    def _load_tool_registry(self) -> Dict[str, Dict[str, Any]]:
        """
        Lädt die Tool-Registry aus der Konfiguration oder einer Datei.
        
        Returns:
            Ein Dictionary mit Tool-Konfigurationen.
        """
        registry = {}
        
        # Aus der Konfiguration laden, falls vorhanden
        if "tools" in self.config:
            registry = self.config["tools"]
        
        # Aus einer Datei laden, falls angegeben
        tool_config_path = self.config.get("tool_config_path")
        if tool_config_path and os.path.exists(tool_config_path):
            try:
                with open(tool_config_path, "r", encoding="utf-8") as f:
                    file_registry = json.load(f)
                registry.update(file_registry)
            except Exception as e:
                logger.error(f"Fehler beim Laden der Tool-Konfiguration aus {tool_config_path}: {str(e)}")
        
        # Standard-Tools hinzufügen, falls nicht überschrieben
        if not registry:
            registry = self._get_default_tool_registry()
        
        return registry
    
    def _get_default_tool_registry(self) -> Dict[str, Dict[str, Any]]:
        """
        Gibt die Standard-Tool-Registry zurück.
        
        Returns:
            Ein Dictionary mit Standard-Tool-Konfigurationen.
        """
        return {
            # Gemeinsame Tools für alle Agenten
            "file_read": {
                "description": "Liest den Inhalt einer Datei",
                "allowed_agents": ["van", "plan", "create", "implement", "review"]
            },
            "file_write": {
                "description": "Schreibt Inhalt in eine Datei",
                "allowed_agents": ["van", "plan", "create", "implement", "review"]
            },
            "search": {
                "description": "Sucht nach Informationen",
                "allowed_agents": ["van", "plan", "create", "implement", "review"]
            },
            
            # VAN-Agent-spezifische Tools
            "data_analysis": {
                "description": "Analysiert Daten und generiert Metriken",
                "allowed_agents": ["van"]
            },
            "requirement_validation": {
                "description": "Validiert Anforderungen auf Machbarkeit und Konsistenz",
                "allowed_agents": ["van"]
            },
            "schema_validation": {
                "description": "Validiert Datenschemas gegen Anforderungen",
                "allowed_agents": ["van"]
            },
            
            # PLAN-Agent-spezifische Tools
            "task_planning": {
                "description": "Erstellt Aufgabenpläne mit Abhängigkeiten",
                "allowed_agents": ["plan"]
            },
            "resource_allocation": {
                "description": "Weist Ressourcen zu Aufgaben zu",
                "allowed_agents": ["plan"]
            },
            "timeline_generation": {
                "description": "Generiert Zeitpläne und Gantt-Diagramme",
                "allowed_agents": ["plan"]
            },
            
            # CREATE-Agent-spezifische Tools
            "code_generation": {
                "description": "Generiert Code basierend auf Spezifikationen",
                "allowed_agents": ["create"]
            },
            "design_tools": {
                "description": "Tools für UI/UX-Design",
                "allowed_agents": ["create"]
            },
            "prototype_creation": {
                "description": "Erstellt Prototypen",
                "allowed_agents": ["create"]
            },
            
            # IMPLEMENT-Agent-spezifische Tools
            "code_implementation": {
                "description": "Implementiert Code in bestehende Systeme",
                "allowed_agents": ["implement"]
            },
            "testing": {
                "description": "Führt Tests durch",
                "allowed_agents": ["implement"]
            },
            "deployment": {
                "description": "Stellt Anwendungen bereit",
                "allowed_agents": ["implement"]
            },
            
            # REVIEW-Agent-spezifische Tools
            "code_review": {
                "description": "Führt Code-Reviews durch",
                "allowed_agents": ["review"]
            },
            "performance_analysis": {
                "description": "Analysiert die Leistung von Code",
                "allowed_agents": ["review"]
            },
            "security_audit": {
                "description": "Führt Sicherheitsaudits durch",
                "allowed_agents": ["review"]
            }
        }
    
    def create_mcp_context(self, agent_type: str) -> Agent:
        """
        Erstellt einen MCP-Agenten für einen bestimmten Agententyp.
        
        Args:
            agent_type: Der Typ des Agenten (van, plan, create, implement, review).
            
        Returns:
            Ein MCP-Agent-Objekt für den Agenten.
        """
        tools = self._get_tools_for_agent(agent_type)
        
        # MCP-Agent erstellen
        agent = Agent(
            name=f"{agent_type}_agent",
            tools=tools,
            metadata={"agent_type": agent_type},
            api_key=self.api_key,
            timeout=self.timeout
        )
        
        logger.info(f"MCP-Agent für Agent-Typ '{agent_type}' erstellt mit {len(tools)} Tools")
        return agent
    
    def _get_tools_for_agent(self, agent_type: str) -> List[str]:
        """
        Gibt die für einen Agententyp verfügbaren Tools zurück.
        
        Args:
            agent_type: Der Typ des Agenten (van, plan, create, implement, review).
            
        Returns:
            Eine Liste von Tool-Namen, die für den Agenten verfügbar sind.
        """
        # Alle Tools finden, die für diesen Agententyp erlaubt sind
        available_tools = []
        
        for tool_name, tool_config in self.tool_registry.items():
            allowed_agents = tool_config.get("allowed_agents", [])
            if agent_type in allowed_agents:
                available_tools.append(tool_name)
        
        return available_tools
    
    def register_tool(self, tool_name: str, tool_config: Dict[str, Any]) -> None:
        """
        Registriert ein neues Tool in der Tool-Registry.
        
        Args:
            tool_name: Der Name des Tools.
            tool_config: Die Konfiguration des Tools.
        """
        self.tool_registry[tool_name] = tool_config
        logger.info(f"Tool '{tool_name}' registriert")
    
    def unregister_tool(self, tool_name: str) -> None:
        """
        Entfernt ein Tool aus der Tool-Registry.
        
        Args:
            tool_name: Der Name des zu entfernenden Tools.
        """
        if tool_name in self.tool_registry:
            del self.tool_registry[tool_name]
            logger.info(f"Tool '{tool_name}' entfernt")
        else:
            logger.warning(f"Tool '{tool_name}' nicht gefunden")
    
    async def execute_tool_with_retry(self, agent: Agent, tool_name: str, 
                                    parameters: Dict[str, Any]) -> Any:
        """
        Führt ein Tool mit Wiederholungsversuchen aus.
        
        Args:
            agent: Der MCP-Agent, der das Tool ausführen soll.
            tool_name: Der Name des Tools.
            parameters: Die Parameter für das Tool.
            
        Returns:
            Das Ergebnis der Tool-Ausführung.
            
        Raises:
            Exception: Wenn die Tool-Ausführung nach allen Versuchen fehlschlägt.
        """
        attempts = 0
        last_error = None
        
        while attempts < self.retry_attempts:
            try:
                result = await agent.execute_tool(tool_name, parameters)
                return result
            except Exception as e:
                attempts += 1
                last_error = e
                logger.warning(f"Versuch {attempts} von {self.retry_attempts} für Tool {tool_name} fehlgeschlagen: {str(e)}")
                if attempts < self.retry_attempts:
                    await asyncio.sleep(2 ** attempts)  # Exponentielles Backoff
        
        logger.error(f"Tool {tool_name} nach {self.retry_attempts} Versuchen fehlgeschlagen")
        raise last_error
    
    def get_tool_description(self, tool_name: str) -> Optional[str]:
        """
        Gibt die Beschreibung eines Tools zurück.
        
        Args:
            tool_name: Der Name des Tools.
            
        Returns:
            Die Beschreibung des Tools oder None, wenn das Tool nicht gefunden wurde.
        """
        tool_config = self.tool_registry.get(tool_name)
        if tool_config:
            return tool_config.get("description")
        return None
    
    def list_tools(self, agent_type: Optional[str] = None) -> List[str]:
        """
        Listet alle verfügbaren Tools auf.
        
        Args:
            agent_type: Optionaler Agententyp, um nur Tools für diesen Typ aufzulisten.
            
        Returns:
            Eine Liste von Tool-Namen.
        """
        if agent_type:
            return self._get_tools_for_agent(agent_type)
        return list(self.tool_registry.keys())
    
    def save_tool_registry(self, file_path: str) -> None:
        """
        Speichert die Tool-Registry in einer Datei.
        
        Args:
            file_path: Der Pfad zur Datei, in der die Registry gespeichert werden soll.
        """
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(self.tool_registry, f, indent=2)
            logger.info(f"Tool-Registry in {file_path} gespeichert")
        except Exception as e:
            logger.error(f"Fehler beim Speichern der Tool-Registry in {file_path}: {str(e)}")


# Beispiel für die Verwendung der MCP-Integration
if __name__ == "__main__":
    # Logger konfigurieren
    logging.basicConfig(level=logging.INFO)
    
    # MCP-Integration initialisieren
    mcp_integration = MCPIntegration(
        mcp_server_url="http://localhost:8000",
        config={
            "api_key": os.environ.get("MCP_API_KEY"),
            "timeout": 30,
            "retry_attempts": 3
        }
    )
    
    # Verfügbare Tools für verschiedene Agentenrollen anzeigen
    print("Tools für VAN-Agent:", mcp_integration.list_tools("van"))
    print("Tools für PLAN-Agent:", mcp_integration.list_tools("plan"))
    print("Tools für CREATE-Agent:", mcp_integration.list_tools("create"))
    print("Tools für IMPLEMENT-Agent:", mcp_integration.list_tools("implement"))
    print("Tools für REVIEW-Agent:", mcp_integration.list_tools("review"))
    
    # Benutzerdefiniertes Tool registrieren
    mcp_integration.register_tool(
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
    
    print("Alle verfügbaren Tools:", mcp_integration.list_tools())
