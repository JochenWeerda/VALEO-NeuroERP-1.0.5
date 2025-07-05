"""
Beispiel für die Verwendung des Development Pipeline Managers im VALEO-NeuroERP Multi-Agent-Framework.
"""

import asyncio
import logging
from pathlib import Path

from linkup_mcp.development_pipeline_manager import DevelopmentPipelineManager

# Logger konfigurieren
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

async def main():
    """Hauptfunktion."""
    try:
        # Development Pipeline Manager initialisieren
        config_path = Path("config/development_pipelines.json")
        manager = DevelopmentPipelineManager(str(config_path))
        
        # MongoDB-Collections initialisieren
        await manager.initialize()
        
        logger.info("Starte parallele Entwicklungspipelines...")
        
        # Alle Pipelines ausführen
        results = await manager.execute_all_pipelines()
        
        # Ergebnisse ausgeben
        logger.info("\nGesamtergebnisse der Entwicklungspipelines:")
        for pipeline_name, result in results.items():
            logger.info(f"\nPipeline: {pipeline_name}")
            logger.info(f"Status: {result[\"status\"]}")
            logger.info(f"Startzeit: {result[\"start_time\"]}")
            logger.info(f"Endzeit: {result.get(\"end_time\", \"N/A\")}")
            
            if result["status"] == "completed":
                logger.info("\nStage-Ergebnisse:")
                for stage_result in result["results"]:
                    logger.info(f"\n  Stage: {stage_result[\"stage\"]}")
                    logger.info(f"  Status: {stage_result[\"status\"]}")
                    logger.info("  Task-Ergebnisse:")
                    for task_result in stage_result["results"]:
                        logger.info(f"    - {task_result[\"task\"]}: {task_result[\"status\"]}")
                        if "duration" in task_result:
                            logger.info(f"      Dauer: {task_result[\"duration\"]:.2f} Sekunden")
            else:
                logger.error(f"Fehler: {result.get(\"error\", \"Unbekannter Fehler\")}")

if __name__ == "__main__":
    asyncio.run(main())
