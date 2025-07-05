"""
Script zum Speichern des CREATE-Phase Prompts in MongoDB.
"""

import asyncio
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import yaml

async def store_create_phase_prompt():
    # MongoDB Verbindung aufbauen
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.genxais
    
    # YAML Prompt definieren
    prompt_yaml = """
phase: CREATE
trigger: automated
agent_mode: multi-agent
agents: [CodeAgent, SchemaAgent, APIDocAgent, TestAgent]
context:
  source: MongoDB
  last_phase: PLAN
  plan_doc: plan_overview.md
  dependencies_verified: true
  ui_mode: streamlit
  memory: MCP
  orchestrator: LangGraph

goals:
  - Umsetzen der geplanten Komponenten aus PLAN-Phase
  - Erstellung neuer Klassen, Services, Schnittstellen laut Spezifikation
  - Generierung technischer Artefakte (z. B. YAML, OpenAPI, Pydantic, Test-Cases)
  - Einbindung in bestehende GENXAIS-Architektur
  - Abspeichern der erzeugten Dateien in DB & Dateisystem
  - Ausgabe eines `create_snapshot.md` als Übergabe-Dokument

pipelines:
  - id: code_gen
    agent: CodeAgent
    goal: Implementiere Klassen und Funktionen laut PLAN-Dokument
    input:
      - plan_overview.md
    output: source_code_bundle.zip

  - id: schema_update
    agent: SchemaAgent
    goal: Generiere/aktualisiere Datenmodelle (Pydantic, Enums, MongoDB-Schemas)
    depends_on: code_gen
    output: schema_update.yaml

  - id: doc_writer
    agent: APIDocAgent
    goal: Dokumentation der neuen Endpunkte (z. B. OpenAPI, Markdown)
    depends_on: code_gen
    output: api_doc.md

  - id: test_gen
    agent: TestAgent
    goal: Erstelle Unit-/Integrationstests für alle Komponenten
    depends_on: code_gen
    output: testsuite_report.md

deliverables:
  - source_code_bundle.zip
  - schema_update.yaml
  - api_doc.md
  - testsuite_report.md

on_complete:
  - merge_outputs: create_snapshot.md
  - save_to: MongoDB > reviews
  - update_phase_status: CREATE completed
  - notify: Slack + Streamlit UI
"""
    
    # YAML in Dict umwandeln
    prompt_data = yaml.safe_load(prompt_yaml)
    
    # MongoDB Dokument vorbereiten
    prompt_document = {
        "type": "phase_prompt",
        "phase": "CREATE",
        "created_at": datetime.now(),
        "status": "pending",
        "content": prompt_data,
        "metadata": {
            "source_file": "prompts/genxais_create_phase_prompt.yaml",
            "version": "1.0",
            "requires_langgraph": True,
            "requires_streamlit": True,
            "requires_mcp": True,
            "expected_artifacts": [
                "source_code_bundle.zip",
                "schema_update.yaml",
                "api_doc.md",
                "testsuite_report.md",
                "create_snapshot.md"
            ]
        }
    }
    
    # In MongoDB speichern
    result = await db.prompts.insert_one(prompt_document)
    print(f"CREATE-Phase Prompt gespeichert mit ID: {result.inserted_id}")
    
    # Status in phases Collection aktualisieren
    await db.phases.update_one(
        {"phase": "CREATE"},
        {
            "$set": {
                "status": "pending",
                "prompt_id": result.inserted_id,
                "started_at": datetime.now(),
                "dependencies": {
                    "requires_plan_completion": True,
                    "plan_doc": "plan_overview.md"
                }
            }
        },
        upsert=True
    )
    print("Phase-Status aktualisiert")

    # Erstelle Verzeichnisse für Artefakte
    await db.artifacts.insert_one({
        "phase": "CREATE",
        "created_at": datetime.now(),
        "status": "pending",
        "expected_files": {
            "code": "source_code_bundle.zip",
            "schema": "schema_update.yaml",
            "docs": "api_doc.md",
            "tests": "testsuite_report.md",
            "summary": "create_snapshot.md"
        },
        "storage_paths": {
            "local": "./artifacts/create_phase/",
            "mongodb": "fs.files"
        }
    })
    print("Artefakt-Tracking initialisiert")

if __name__ == "__main__":
    asyncio.run(store_create_phase_prompt()) 