"""
Script zum Speichern des HANDOVER-Dokuments in MongoDB.
"""

import asyncio
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import json

async def store_handover():
    # MongoDB Verbindung aufbauen
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.genxais
    
    # HANDOVER-Dokument vorbereiten
    handover = {
        "type": "HANDOVER",
        "from_phase": "VAN",
        "to_phase": "PLAN",
        "timestamp": datetime.now(),
        "version": "1.0",
        "content": {
            "completed_components": {
                "architecture": [
                    "Konfigurationssystem mit Dataclasses",
                    "MongoDB Integration",
                    "LangGraph-Graphiti Integration",
                    "RAG-Service"
                ],
                "technical_foundation": [
                    "GenXAISConfig",
                    "LangGraphGraphitiIntegration",
                    "RAGService",
                    "WorkflowState"
                ],
                "data_model": {
                    "enums": ["PhaseType", "TriggerType"],
                    "collections": ["phases", "prompts", "reviews", "logs"]
                }
            },
            "technical_debt": {
                "known_issues": [
                    "Neo4j Integration Testing",
                    "LangGraph Execution Implementation",
                    "RAG-Service LLM Integration"
                ],
                "validations_needed": [
                    "Graph-Operations Integration Tests",
                    "RAG-Service Performance Tests",
                    "API-Key Security Audit"
                ]
            },
            "recommendations": {
                "priorities": [
                    "trigger_execution Implementation",
                    "LLM Integration",
                    "End-to-End Tests",
                    "API Documentation"
                ],
                "technical_considerations": [
                    "asyncio Usage",
                    "Retry Mechanisms",
                    "Circuit Breakers"
                ],
                "architecture": [
                    "Graph-Operations Modularization",
                    "Event-Bus Implementation",
                    "Logging System Enhancement"
                ]
            },
            "resources": {
                "external_dependencies": [
                    "OpenAI API",
                    "Neo4j",
                    "MongoDB",
                    "Sentence Transformers"
                ],
                "internal_services": {
                    "rag_service": 8000,
                    "streamlit_ui": 8501,
                    "mongodb": 27017,
                    "neo4j": 7687
                }
            },
            "next_steps": [
                "VAN-Phase Review",
                "Component Planning",
                "Technical Debt Prioritization",
                "Timeline Creation",
                "Quality Metrics Definition"
            ]
        },
        "status": "active"
    }
    
    # In MongoDB speichern
    result = await db.handovers.insert_one(handover)
    print(f"HANDOVER-Dokument gespeichert mit ID: {result.inserted_id}")
    
    # Phase-Status aktualisieren
    await db.phases.update_one(
        {"phase": "VAN"},
        {
            "$set": {
                "status": "completed",
                "completed_at": datetime.now(),
                "handover_id": result.inserted_id
            }
        }
    )
    print("Phase-Status aktualisiert")

if __name__ == "__main__":
    asyncio.run(store_handover()) 