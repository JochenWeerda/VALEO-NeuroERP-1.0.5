"""
Script zum Speichern des IMPLEMENTATION-Phase Prompts in MongoDB.
"""

import asyncio
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import yaml

async def store_implementation_phase_prompt():
    # MongoDB Verbindung aufbauen
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.genxais
    
    # YAML Prompt definieren
    prompt_yaml = """
phase: IMPLEMENTATION
trigger: automated
agent_mode: multi-agent
agents: [IntegratorAgent, DeployerAgent, MonitorAgent, IssueTrackerAgent]
context:
  last_phase: CREATE
  snapshot_doc: create_snapshot.md
  memory: MCP
  orchestrator: LangGraph
  ui_mode: streamlit

goals:
  - Integration der erstellten Komponenten in das Hauptsystem
  - Durchführung von Deployment-Tests
  - Aktivierung des Überwachungssystems (Prometheus, Grafana)
  - Anlegen von Tasks im Issue-Tracking für finale Verbesserungen
  - Bewertung der Systembereitschaft für den REFLEKTION-Zyklus

pipelines:
  - id: integration
    agent: IntegratorAgent
    goal: Integriere neue Komponenten aus source_code_bundle.zip in die Hauptarchitektur
    input:
      - source_code_bundle.zip
    output: integration_log.md

  - id: deployment_test
    agent: DeployerAgent
    depends_on: integration
    goal: Deployment in Staging + Smoke/Load-Tests
    input:
      - schema_update.yaml
    output: deploy_result_report.md

  - id: monitoring_init
    agent: MonitorAgent
    depends_on: deployment_test
    goal: Setup für Echtzeit-Monitoring und Fehleranalyse
    output: monitoring_config_snapshot.yaml

  - id: issue_log
    agent: IssueTrackerAgent
    depends_on: deployment_test
    goal: Erfassung von offenen Problemen und technischen Schulden
    output: open_issues.md

deliverables:
  - integration_log.md
  - deploy_result_report.md
  - monitoring_config_snapshot.yaml
  - open_issues.md

on_complete:
  - merge_outputs: implementation_review.md
  - update_phase_status: IMPLEMENTATION completed
  - notify: Slack + Streamlit UI
  - save_to: MongoDB > reviews
"""
    
    # YAML in Dict umwandeln
    prompt_data = yaml.safe_load(prompt_yaml)
    
    # MongoDB Dokument vorbereiten
    prompt_document = {
        "type": "phase_prompt",
        "phase": "IMPLEMENTATION",
        "created_at": datetime.now(),
        "status": "pending",
        "content": prompt_data,
        "metadata": {
            "source_file": "prompts/genxais_implementation_phase_prompt.yaml",
            "version": "1.0",
            "requires_langgraph": True,
            "requires_streamlit": True,
            "requires_mcp": True,
            "requires_monitoring": True,
            "expected_artifacts": [
                "integration_log.md",
                "deploy_result_report.md",
                "monitoring_config_snapshot.yaml",
                "open_issues.md",
                "implementation_review.md"
            ]
        },
        "dependencies": {
            "create_phase_artifacts": [
                "source_code_bundle.zip",
                "schema_update.yaml",
                "create_snapshot.md"
            ]
        }
    }
    
    # In MongoDB speichern
    result = await db.prompts.insert_one(prompt_document)
    print(f"IMPLEMENTATION-Phase Prompt gespeichert mit ID: {result.inserted_id}")
    
    # Status in phases Collection aktualisieren
    await db.phases.update_one(
        {"phase": "IMPLEMENTATION"},
        {
            "$set": {
                "status": "pending",
                "prompt_id": result.inserted_id,
                "started_at": datetime.now(),
                "dependencies": {
                    "requires_create_completion": True,
                    "create_snapshot": "create_snapshot.md",
                    "required_artifacts": [
                        "source_code_bundle.zip",
                        "schema_update.yaml"
                    ]
                }
            }
        },
        upsert=True
    )
    print("Phase-Status aktualisiert")

    # Erstelle Monitoring-Konfiguration
    await db.monitoring_config.insert_one({
        "phase": "IMPLEMENTATION",
        "created_at": datetime.now(),
        "status": "pending",
        "components": {
            "prometheus": {
                "enabled": True,
                "port": 9090,
                "config_path": "./monitoring/prometheus.yml"
            },
            "grafana": {
                "enabled": True,
                "port": 3000,
                "dashboards_path": "./monitoring/dashboards/"
            }
        },
        "metrics": [
            "deployment_success_rate",
            "integration_errors",
            "system_health",
            "performance_metrics"
        ]
    })
    print("Monitoring-Konfiguration initialisiert")

    # Erstelle Artefakt-Tracking
    await db.artifacts.insert_one({
        "phase": "IMPLEMENTATION",
        "created_at": datetime.now(),
        "status": "pending",
        "expected_files": {
            "integration": "integration_log.md",
            "deployment": "deploy_result_report.md",
            "monitoring": "monitoring_config_snapshot.yaml",
            "issues": "open_issues.md",
            "review": "implementation_review.md"
        },
        "storage_paths": {
            "local": "./artifacts/implementation_phase/",
            "mongodb": "fs.files"
        }
    })
    print("Artefakt-Tracking initialisiert")

if __name__ == "__main__":
    asyncio.run(store_implementation_phase_prompt()) 