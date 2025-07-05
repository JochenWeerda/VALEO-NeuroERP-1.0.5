"""
Beispiel für die Verwendung der parallelen Pipeline im VALEO-NeuroERP Multi-Agent-Framework.
"""

import asyncio
import logging
from typing import Dict, Any
from uuid import uuid4

from langchain.agents import Tool
from linkup_mcp.langgraph_integration import AgentType
from linkup_mcp.parallel_pipeline import ParallelPipeline, PipelineStage

# Logger konfigurieren
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Beispiel-Tools erstellen
analyze_tool = Tool(
    name="analyze_data",
    func=lambda x: {"metrics": {"accuracy": 0.95}},
    description="Analysiert Daten"
)

plan_tool = Tool(
    name="create_plan",
    func=lambda x: {"tasks": ["Task 1", "Task 2"]},
    description="Erstellt einen Plan"
)

implement_tool = Tool(
    name="implement_task",
    func=lambda x: {"status": "completed"},
    description="Implementiert eine Aufgabe"
)

review_tool = Tool(
    name="review_implementation",
    func=lambda x: {"approved": True},
    description="Überprüft die Implementierung"
)

async def main():
    # Pipeline-Konfiguration erstellen
    pipeline = ParallelPipeline()
    
    # Stages definieren
    stages = [
        PipelineStage(
            name="analyze",
            agent_type=AgentType.VAN,
            tools=[analyze_tool],
            max_parallel=2
        ),
        PipelineStage(
            name="plan",
            agent_type=AgentType.PLAN,
            tools=[plan_tool],
            dependencies={"analyze"},
            max_parallel=1
        ),
        PipelineStage(
            name="implement",
            agent_type=AgentType.IMPLEMENT,
            tools=[implement_tool],
            dependencies={"plan"},
            max_parallel=3
        ),
        PipelineStage(
            name="review",
            agent_type=AgentType.REVIEW,
            tools=[review_tool],
            dependencies={"implement"},
            max_parallel=2
        )
    ]
    
    # Pipeline erstellen
    pipeline.create_pipeline("example", stages)
    
    # Beispiel-Workflow ausführen
    workflow_id = str(uuid4())
    input_data = {
        "data": "Beispieldaten",
        "parameters": {"max_tasks": 5}
    }
    
    try:
        result = await pipeline.execute_workflow("example", workflow_id, input_data)
        logger.info(f"Workflow-Ergebnis: {result}")
    except Exception as e:
        logger.error(f"Fehler bei der Workflow-Ausführung: {str(e)}")

if __name__ == "__main__":
    asyncio.run(main())
