"""
Beispiel f�r die Verwendung der MongoDB-integrierten Pipeline im VALEO-NeuroERP Multi-Agent-Framework.
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
    description="�berpr�ft die Implementierung"
)

async def run_example_workflow():
    """F�hrt einen Beispiel-Workflow aus."""
    # Pipeline mit MongoDB-Integration erstellen
    pipeline = ParallelPipeline(config={
        "mongodb_uri": "mongodb://localhost:27017",
        "max_parallel_tasks": 4
    })
    
    # MongoDB-Collections initialisieren
    await pipeline.initialize()
    
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
    
    # Mehrere Workflows parallel ausf�hren
    workflow_ids = [str(uuid4()) for _ in range(3)]
    tasks = []
    
    for i, workflow_id in enumerate(workflow_ids):
        input_data = {
            "data": f"Beispieldaten {i + 1}",
            "parameters": {"max_tasks": 5}
        }
        
        task = asyncio.create_task(
            pipeline.execute_workflow("example", workflow_id, input_data)
        )
        tasks.append(task)
    
    # Auf Abschluss aller Workflows warten
    results = await asyncio.gather(*tasks)
    
    # Ergebnisse ausgeben
    for workflow_id, result in zip(workflow_ids, results):
        logger.info(f"\nWorkflow {workflow_id} abgeschlossen:")
        logger.info(f"Status: {result[\"status\"]}")
        if result["status"] == "completed":
            logger.info("Ergebnisse:")
            for stage_name, stage_result in result["results"].items():
                logger.info(f"  {stage_name}: {stage_result}")
        else:
            logger.error(f"Fehler: {result.get(\"error\", \"Unbekannter Fehler\")}")
    
    # Aktive Workflows abrufen
    active_workflows = await pipeline.get_active_workflows()
    logger.info(f"\nAktive Workflows: {len(active_workflows)}")
    
    # Status einzelner Workflows abrufen
    for workflow_id in workflow_ids:
        status = await pipeline.get_workflow_status(workflow_id)
        logger.info(f"\nDetaillierter Status f�r Workflow {workflow_id}:")
        logger.info(f"Pipeline: {status[\"workflow\"][\"pipeline_name\"]}")
        logger.info(f"Status: {status[\"workflow\"][\"status\"]}")
        logger.info("Stage-Status:")
        for stage in status["stages"]:
            logger.info(f"  {stage[\"stage_name\"]}: {stage[\"status\"]}")
        logger.info("Letzte Ergebnisse:")
        for result in status["results"][:3]:  # Nur die letzten 3 Ergebnisse
            logger.info(f"  {result[\"stage_name\"]}: {result[\"result\"]}")

async def main():
    """Hauptfunktion."""
    try:
        await run_example_workflow()
    except Exception as e:
        logger.error(f"Fehler bei der Ausf�hrung: {str(e)}")

if __name__ == "__main__":
    asyncio.run(main())
