"""Workflow-Manager für das VALEO-NeuroERP System."""

from typing import List, Dict, Any, Optional
from datetime import datetime
import asyncio
from .task_graph import (
    ERPWorkflowGraph,
    WorkflowTask,
    TaskStatus,
    TaskCategory,
    TaskPriority
)
from backend.core.simple_logging import logger
from backend.core.error_handling import ErrorHandler, ErrorCode

from .core_implementations import (
    implement_error_handling,
    implement_logging,
    implement_batch_processing
)
from .feature_implementations import (
    implement_transaction_types,
    implement_analytics_dashboard
)
from .test_implementations import (
    run_core_tests,
    run_feature_tests
)
from .documentation_implementations import (
    create_api_documentation,
    create_user_documentation
)
from .optimization_implementations import optimize_performance

class WorkflowManager:
    """Manager für die Ausführung des ERP-Implementierungs-Workflows."""

    def __init__(self):
        self.workflow = ERPWorkflowGraph()
        self.active_tasks: Dict[str, asyncio.Task] = {}

    async def execute_task(self, task: WorkflowTask):
        """Führt einen einzelnen Task aus."""
        try:
            logger.info(f"Starting task: {task.id} - {task.name}")
            self.workflow.update_task_status(task.id, TaskStatus.IN_PROGRESS)

            # Implementierung der Task-Ausführung basierend auf der Kategorie
            artifacts = None
            if task.category == TaskCategory.CORE:
                artifacts = await self._execute_core_task(task)
            elif task.category == TaskCategory.FEATURE:
                artifacts = await self._execute_feature_task(task)
            elif task.category == TaskCategory.TEST:
                artifacts = await self._execute_test_task(task)
            elif task.category == TaskCategory.DOCUMENTATION:
                artifacts = await self._execute_documentation_task(task)
            elif task.category == TaskCategory.OPTIMIZATION:
                artifacts = await self._execute_optimization_task(task)

            self.workflow.update_task_status(
                task_id=task.id,
                status=TaskStatus.COMPLETED,
                progress=1.0,
                artifacts=artifacts
            )
            logger.info(f"Completed task: {task.id} - {task.name}")

        except Exception as e:
            error = ErrorHandler.create_error(
                code=ErrorCode.SYSTEM_ERROR,
                message_key="task_execution_failed",
                detail=str(e)
            )
            logger.error(f"Task failed: {task.id}", extra={"error": error})
            self.workflow.update_task_status(task.id, TaskStatus.FAILED)
            raise

    async def _execute_core_task(self, task: WorkflowTask) -> Dict[str, Any]:
        """Führt einen Core-Task aus."""
        if task.id == "CORE-001":
            return await implement_error_handling()
        elif task.id == "CORE-002":
            return await implement_logging()
        elif task.id == "CORE-003":
            return await implement_batch_processing()
        return {}

    async def _execute_feature_task(self, task: WorkflowTask) -> Dict[str, Any]:
        """Führt einen Feature-Task aus."""
        if task.id == "FEAT-001":
            return await implement_transaction_types()
        elif task.id == "FEAT-002":
            return await implement_analytics_dashboard()
        return {}

    async def _execute_test_task(self, task: WorkflowTask) -> Dict[str, Any]:
        """Führt einen Test-Task aus."""
        if task.id == "TEST-001":
            return await run_core_tests()
        elif task.id == "TEST-002":
            return await run_feature_tests()
        return {}

    async def _execute_documentation_task(self, task: WorkflowTask) -> Dict[str, Any]:
        """Führt einen Dokumentations-Task aus."""
        if task.id == "DOC-001":
            return await create_api_documentation()
        elif task.id == "DOC-002":
            return await create_user_documentation()
        return {}

    async def _execute_optimization_task(self, task: WorkflowTask) -> Dict[str, Any]:
        """Führt einen Optimierungs-Task aus."""
        if task.id == "OPT-001":
            return await optimize_performance()
        return {}

    async def execute_workflow(self):
        """Führt den gesamten Workflow aus."""
        while True:
            next_tasks = self.workflow.get_next_tasks()
            if not next_tasks:
                break

            # Führe alle verfügbaren Tasks parallel aus
            tasks = [self.execute_task(task) for task in next_tasks]
            await asyncio.gather(*tasks)

            # Aktualisiere den Workflow-Status
            progress = self.workflow.get_workflow_progress()
            logger.info("Workflow progress", extra={"context": progress})

        logger.info("Workflow completed", extra={"context": self.workflow.get_workflow_progress()})

# Workflow-Manager-Instanz erstellen
workflow_manager = WorkflowManager() 