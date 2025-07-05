"""Hauptskript zur Ausführung des ERP-Implementierungs-Workflows."""

import os
import sys
import asyncio

# Füge das Projektverzeichnis zum Python-Pfad hinzu
project_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_dir)

from backend.workflow.manager import workflow_manager
from backend.core.simple_logging import logger
from backend.core.error_handling import ErrorHandler, ErrorCode

async def main():
    """Hauptfunktion zur Ausführung des ERP-Implementierungs-Workflows."""
    try:
        logger.info("Starting ERP implementation workflow")
        
        # Workflow ausführen
        await workflow_manager.execute_workflow()
        
        # Finale Statistiken ausgeben
        final_progress = workflow_manager.workflow.get_workflow_progress()
        logger.info(
            "ERP implementation completed",
            extra={"context": final_progress}
        )
        
    except Exception as e:
        error = ErrorHandler.create_error(
            code=ErrorCode.SYSTEM_ERROR,
            message_key="task_execution_failed",
            detail=str(e)
        )
        logger.critical("Workflow execution failed", extra={"error": error})
        raise

if __name__ == "__main__":
    asyncio.run(main()) 