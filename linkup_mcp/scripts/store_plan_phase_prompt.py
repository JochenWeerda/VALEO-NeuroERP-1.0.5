"""
Script zum Speichern des PLAN-Phase Prompts in MongoDB.
"""

import asyncio
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import yaml

async def store_plan_phase_prompt():
    # MongoDB Verbindung aufbauen
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.genxais
    
    # YAML Prompt definieren
    prompt_yaml = """
phase: PLAN
trigger: automated
agent_mode: multi-agent
agents: [PlannerAgent, ValidatorAgent, ConfigAgent, AnalystAgent]
context:
  source: MongoDB
  last_phase: VAN
  handover_doc: handover_VAN_to_PLAN.md
  components_verified: true
  ui_mode: streamlit
  graph_integration: true

goals:
  - Review der abgeschlossenen Komponenten der VAN-Phase
  - Detaillierte Planung der offenen Punkte
  - Ableitung der technischen Schulden
  - Definition eines Zeitplans für die PLAN-Phase
  - Festlegung von Akzeptanzkriterien für jede folgende Phase
  - Abgleich mit verfügbaren Ressourcen & Rollen (TEAM_LEAD, DB_ADMIN, AI_ENGINEER, UI_DEVELOPER)

pipelines:
  - id: plan_review
    agent: PlannerAgent
    goal: Analysiere das Handover-Dokument und strukturiere die ToDos für die PLAN-Phase
    input:
      - handover_doc
      - review_context_from_Mongo
    output: structured_plan.md

  - id: validation_design
    agent: ValidatorAgent
    goal: Entwerfe Validierungsszenarien für trigger_execution, LLM-Integration und End-to-End Tests
    depends_on: plan_review
    output: test_plan_draft.md

  - id: config_evaluation
    agent: ConfigAgent
    goal: Überprüfe bestehende Konfigurationsstrukturen und plane notwendige Erweiterungen (API-Doku, Retry, Circuit Breaker)
    input:
      - genxais_cycle_config.py
    output: config_update_plan.md

  - id: dependency_check
    agent: AnalystAgent
    goal: Prüfe alle internen und externen Abhängigkeiten (Ports, Services, DBs)
    input:
      - phase_config
    output: dependency_status_report.md

deliverables:
  - structured_plan.md
  - test_plan_draft.md
  - config_update_plan.md
  - dependency_status_report.md

on_complete:
  - merge_outputs: plan_overview.md
  - save_to: MongoDB > reviews
  - update_phase_status: PLAN completed
  - notify: Slack + Streamlit UI
"""
    
    # YAML in Dict umwandeln
    prompt_data = yaml.safe_load(prompt_yaml)
    
    # MongoDB Dokument vorbereiten
    prompt_document = {
        "type": "phase_prompt",
        "phase": "PLAN",
        "created_at": datetime.now(),
        "status": "pending",
        "content": prompt_data,
        "metadata": {
            "source_file": "prompts/genxais_plan_phase_prompt.yaml",
            "version": "1.0",
            "requires_langgraph": True,
            "requires_streamlit": True
        }
    }
    
    # In MongoDB speichern
    result = await db.prompts.insert_one(prompt_document)
    print(f"PLAN-Phase Prompt gespeichert mit ID: {result.inserted_id}")
    
    # Status in phases Collection aktualisieren
    await db.phases.update_one(
        {"phase": "PLAN"},
        {
            "$set": {
                "status": "pending",
                "prompt_id": result.inserted_id,
                "started_at": datetime.now()
            }
        },
        upsert=True
    )
    print("Phase-Status aktualisiert")

if __name__ == "__main__":
    asyncio.run(store_plan_phase_prompt()) 