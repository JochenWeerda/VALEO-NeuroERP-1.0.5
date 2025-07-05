"""
Hauptskript zum Ausführen der parallelen Tasks
"""

import asyncio
from backend.workflow.parallel_execution_manager import ParallelExecutionManager
from backend.core.simple_logging import logger

async def main():
    """Hauptfunktion"""
    try:
        # Manager initialisieren
        manager = ParallelExecutionManager()
        
        # Tasks ausführen
        await manager.start_parallel_execution()
        
        # Status abrufen
        status = manager.get_execution_status()
        logger.info(f"Execution completed with status: {status}")
        
    except Exception as e:
        logger.error(f"Error in parallel execution: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(main()) 