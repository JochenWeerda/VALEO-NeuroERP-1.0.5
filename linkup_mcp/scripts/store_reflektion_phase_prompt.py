"""
Script zum Speichern des REFLEKTION-Phase Prompts in MongoDB mit Versionierungslogik.
"""

import asyncio
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import yaml
from typing import Dict, Any

def increment_version(version: str) -> str:
    """Erhöht eine Versionsnummer vom Format 'v1.2' → 'v1.3'"""
    prefix, num = version[0], float(version[1:])
    return f"{prefix}{num + 0.1:.1f}"

def replace_version_placeholders(data: Dict[str, Any], version: str, next_version: str) -> Dict[str, Any]:
    """Ersetzt Versionsplatzhalter in einem Dictionary rekursiv"""
    if isinstance(data, dict):
        return {k: replace_version_placeholders(v, version, next_version) for k, v in data.items()}
    elif isinstance(data, list):
        return [replace_version_placeholders(item, version, next_version) for item in data]
    elif isinstance(data, str):
        return (data.replace("{{version}}", version)
                   .replace("{{next_version}}", next_version)
                   .replace("{{ version }}", version)
                   .replace("{{ next_version }}", next_version))
    return data

async def store_reflektion_phase_prompt():
    # MongoDB Verbindung aufbauen
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.genxais
    
    # Aktuelle Version abrufen
    current_version = "v1.2"  # Standardwert
    version_doc = await db.system_state.find_one({"type": "version"})
    if version_doc:
        current_version = version_doc["current_version"]
    
    next_version = increment_version(current_version)
    
    # YAML Prompt definieren
    prompt_yaml = """
phase: REFLEKTION
trigger: automated
agent_mode: multi-agent
agents: [ReviewerAgent, MetricsAgent, FeedbackAgent, SummaryAgent]
context:
  current_version: {{version}}
  next_version: {{next_version}}
  last_phase: IMPLEMENTATION
  inputs:
    - implementation_review.md
    - integration_log.md
    - open_issues.md
    - monitoring_config_snapshot.yaml
    - deploy_result_report.md
  orchestrator: LangGraph
  memory: MCP
  ui_mode: streamlit

goals:
  - Reflexion der erreichten Resultate in allen Phasen (VAN → IMPLEMENTATION)
  - Identifikation von Verbesserungspotenzial und Architektur-Schwächen
  - Evaluation von Performanz, Deployability und Skalierbarkeit
  - Aggregation der wichtigsten Metriken, Issue-Patterns und Lessons Learned
  - Vorbereitung auf Versionierung ({{next_version}}) und Übergabe an nächsten Zyklus

pipelines:
  - id: review
    agent: ReviewerAgent
    goal: Überprüfe die Phasen-Outputs und validiere die Zielerreichung
    input:
      - implementation_review.md
      - plan_overview.md
    output: reflection_validation.md

  - id: metrics
    agent: MetricsAgent
    depends_on: review
    goal: Extrahiere relevante Systemmetriken aus Monitoring und Deployment
    input:
      - monitoring_config_snapshot.yaml
      - deploy_result_report.md
    output: performance_metrics.md

  - id: feedback
    agent: FeedbackAgent
    depends_on: review
    goal: Sammle Feedback aus Issue-Dokumentation und offenen Punkten
    input:
      - open_issues.md
      - integration_log.md
    output: feedback_summary.md

  - id: synthesis
    agent: SummaryAgent
    depends_on: [metrics, feedback]
    goal: Führe alle Analysen zu einem reflektierten Gesamtbild zusammen
    output: reflection_overview.md

deliverables:
  - reflection_validation.md
  - performance_metrics.md
  - feedback_summary.md
  - reflection_overview.md

on_complete:
  - merge_outputs: {{version}}_final_review.md
  - update_phase_status: REFLEKTION completed
  - archive_all: GENXAIS_{{version}}
  - notify: Streamlit UI + Slack
  - suggest_next_cycle:
      phase: VAN
      version: {{next_version}}
"""
    
    # YAML in Dict umwandeln und Versionsplatzhalter ersetzen
    prompt_yaml = prompt_yaml.replace("{{version}}", current_version).replace("{{next_version}}", next_version)
    prompt_data = yaml.safe_load(prompt_yaml)
    
    # MongoDB Dokument vorbereiten
    prompt_document = {
        "type": "phase_prompt",
        "phase": "REFLEKTION",
        "created_at": datetime.now(),
        "status": "pending",
        "version": current_version,
        "next_version": next_version,
        "content": prompt_data,
        "metadata": {
            "source_file": "prompts/genxais_reflektion_phase_prompt.yaml",
            "version": "1.0",
            "requires_langgraph": True,
            "requires_streamlit": True,
            "requires_mcp": True,
            "expected_artifacts": [
                "reflection_validation.md",
                "performance_metrics.md",
                "feedback_summary.md",
                "reflection_overview.md",
                f"{current_version}_final_review.md"
            ]
        },
        "dependencies": {
            "implementation_phase_artifacts": [
                "implementation_review.md",
                "integration_log.md",
                "open_issues.md",
                "monitoring_config_snapshot.yaml",
                "deploy_result_report.md"
            ]
        }
    }
    
    # In MongoDB speichern
    result = await db.prompts.insert_one(prompt_document)
    print(f"REFLEKTION-Phase Prompt gespeichert mit ID: {result.inserted_id}")
    
    # Status in phases Collection aktualisieren
    await db.phases.update_one(
        {"phase": "REFLEKTION"},
        {
            "$set": {
                "status": "pending",
                "prompt_id": result.inserted_id,
                "started_at": datetime.now(),
                "version": current_version,
                "next_version": next_version,
                "dependencies": {
                    "requires_implementation_completion": True,
                    "implementation_review": "implementation_review.md"
                }
            }
        },
        upsert=True
    )
    print("Phase-Status aktualisiert")

    # Versionsinformationen für Streamlit UI vorbereiten
    await db.system_state.update_one(
        {"type": "version"},
        {
            "$set": {
                "current_version": current_version,
                "next_version": next_version,
                "last_update": datetime.now(),
                "cycle_status": {
                    "current": f"REFLEKTION ({current_version})",
                    "next": f"VAN ({next_version})",
                    "progress": 0
                }
            }
        },
        upsert=True
    )
    print("Versionsinformationen aktualisiert")

    # Artefakt-Archivierung vorbereiten
    await db.artifacts.insert_one({
        "phase": "REFLEKTION",
        "created_at": datetime.now(),
        "status": "pending",
        "version": current_version,
        "expected_files": {
            "validation": "reflection_validation.md",
            "metrics": "performance_metrics.md",
            "feedback": "feedback_summary.md",
            "overview": "reflection_overview.md",
            "final": f"{current_version}_final_review.md"
        },
        "storage_paths": {
            "local": f"./artifacts/reflektion_phase_{current_version}/",
            "mongodb": "fs.files",
            "archive": f"./archive/GENXAIS_{current_version}/"
        },
        "next_cycle": {
            "version": next_version,
            "start_phase": "VAN",
            "template_path": f"./templates/van_phase_{next_version}/"
        }
    })
    print("Artefakt-Tracking und Archivierung initialisiert")

if __name__ == "__main__":
    asyncio.run(store_reflektion_phase_prompt()) 