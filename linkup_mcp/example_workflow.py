#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Beispiel für die Verwendung des VALEO-NeuroERP Multi-Agent-Frameworks.

Dieses Skript demonstriert, wie das Framework für eine einfache Aufgabe verwendet werden kann.
"""

import os
import json
import asyncio
import logging
from typing import Dict, Any

# Framework-Komponenten importieren
try:
    from linkup_mcp import MultiAgentFramework, AgentType
except ImportError:
    # Für direkte Ausführung dieses Skripts
    from multi_agent_framework import MultiAgentFramework
    from langgraph_integration import AgentType

# Logger konfigurieren
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def run_example_workflow():
    """Führt einen Beispiel-Workflow mit dem Multi-Agent-Framework aus."""
    
    logger.info("Initialisiere Multi-Agent-Framework")
    
    # Konfigurationspfad (optional)
    config_path = os.path.join(os.path.dirname(__file__), "config", "framework_config.json")
    if not os.path.exists(config_path):
        config_path = None
        logger.warning(f"Konfigurationsdatei nicht gefunden: {config_path}")
        logger.info("Verwende Standardkonfiguration")
    
    # Framework initialisieren
    framework = MultiAgentFramework(config_path=config_path)
    
    # Benutzerdefiniertes Tool registrieren
    framework.register_custom_tool(
        "erp_data_analyzer",
        {
            "description": "Analysiert ERP-Daten für Optimierungspotenziale",
            "allowed_agents": ["van", "review"],
            "parameters": {
                "data_source": "string",
                "analysis_type": "string",
                "time_range": "string"
            }
        }
    )
    
    # Eingabedaten für den Workflow definieren
    input_data = {
        "requirement": "Implementierung eines neuen Berichtssystems für Finanztransaktionen",
        "priority": "hoch",
        "deadline": "2025-07-15",
        "context": {
            "existing_systems": ["Finanzbuchhaltung", "Controlling", "Reporting"],
            "stakeholders": ["Finanzabteilung", "Management", "Controlling"],
            "constraints": [
                "Muss mit bestehenden Systemen kompatibel sein",
                "Darf keine Unterbrechung des laufenden Betriebs verursachen",
                "Muss DSGVO-konform sein"
            ]
        }
    }
    
    # Workflow ausführen
    logger.info(f"Starte Workflow mit Eingabedaten: {json.dumps(input_data, indent=2, ensure_ascii=False)}")
    
    try:
        # Workflow ausführen, beginnend mit dem VAN-Agent (Validator-Analyzer)
        result = await framework.run_workflow(
            workflow_id="standard",
            input_data=input_data,
            start_agent=AgentType.VAN
        )
        
        # Ergebnis ausgeben
        logger.info("Workflow erfolgreich abgeschlossen")
        logger.info(f"Ergebnis: {json.dumps(result, indent=2, ensure_ascii=False)}")
        
        # Workflow-Zustand speichern (optional)
        state_file = "workflow_state.json"
        framework.save_workflow_state("standard", state_file)
        logger.info(f"Workflow-Zustand in {state_file} gespeichert")
        
        return result
        
    except Exception as e:
        logger.error(f"Fehler bei der Ausführung des Workflows: {str(e)}")
        raise

def demonstrate_synchronous_usage():
    """Demonstriert die synchrone Verwendung des Frameworks."""
    
    logger.info("=== Synchrone Verwendung des Frameworks ===")
    
    # Framework initialisieren
    framework = MultiAgentFramework()
    
    # asyncio verwenden, um den asynchronen Workflow auszuführen
    loop = asyncio.get_event_loop()
    result = loop.run_until_complete(run_example_workflow())
    
    logger.info("Synchrone Demonstration abgeschlossen")
    return result

async def demonstrate_asynchronous_usage():
    """Demonstriert die asynchrone Verwendung des Frameworks."""
    
    logger.info("=== Asynchrone Verwendung des Frameworks ===")
    
    # Workflow ausführen
    result = await run_example_workflow()
    
    logger.info("Asynchrone Demonstration abgeschlossen")
    return result

if __name__ == "__main__":
    logger.info("Starte Beispiel für Multi-Agent-Framework")
    
    # Asynchrone Ausführung
    asyncio.run(demonstrate_asynchronous_usage())
    
    # Alternativ: Synchrone Ausführung
    # demonstrate_synchronous_usage()
    
    logger.info("Beispiel abgeschlossen") 