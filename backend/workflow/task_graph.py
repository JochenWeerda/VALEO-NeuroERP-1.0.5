from typing import Dict, List, Any, Optional
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field
import networkx as nx

class TaskStatus(str, Enum):
    """Status eines Tasks im Workflow."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    BLOCKED = "blocked"

class TaskPriority(str, Enum):
    """Priorität eines Tasks."""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class TaskCategory(str, Enum):
    """Kategorie eines Tasks."""
    CORE = "core"
    FEATURE = "feature"
    TEST = "test"
    DOCUMENTATION = "documentation"
    OPTIMIZATION = "optimization"

class WorkflowTask(BaseModel):
    """Repräsentiert einen Task im Workflow."""
    id: str
    name: str
    description: str
    category: TaskCategory
    priority: TaskPriority
    status: TaskStatus = TaskStatus.PENDING
    dependencies: List[str] = []
    estimated_hours: float
    assigned_to: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    progress: float = 0.0
    artifacts: Dict[str, Any] = {}

class ERPWorkflowGraph:
    """Graph-basierte Workflow-Verwaltung für das ERP-System."""

    def __init__(self):
        self.graph = nx.DiGraph()
        self.tasks: Dict[str, WorkflowTask] = {}
        self._initialize_workflow()

    def _initialize_workflow(self):
        """Initialisiert den Workflow mit allen Tasks."""
        # Core Implementation Tasks
        self._add_task(
            WorkflowTask(
                id="CORE-001",
                name="Error Handling System",
                description="Implementierung des erweiterten Fehlerhandling-Systems",
                category=TaskCategory.CORE,
                priority=TaskPriority.HIGH,
                estimated_hours=8.0,
                dependencies=[]
            )
        )

        self._add_task(
            WorkflowTask(
                id="CORE-002",
                name="Logging System",
                description="Implementierung des erweiterten Logging-Systems",
                category=TaskCategory.CORE,
                priority=TaskPriority.HIGH,
                estimated_hours=6.0,
                dependencies=["CORE-001"]
            )
        )

        self._add_task(
            WorkflowTask(
                id="CORE-003",
                name="Batch Processing",
                description="Optimierte Batch-Verarbeitung mit Chunking",
                category=TaskCategory.CORE,
                priority=TaskPriority.HIGH,
                estimated_hours=12.0,
                dependencies=["CORE-001", "CORE-002"]
            )
        )

        # Feature Implementation Tasks
        self._add_task(
            WorkflowTask(
                id="FEAT-001",
                name="Transaction Types",
                description="Implementierung erweiterter Transaktionstypen",
                category=TaskCategory.FEATURE,
                priority=TaskPriority.MEDIUM,
                estimated_hours=16.0,
                dependencies=["CORE-003"]
            )
        )

        self._add_task(
            WorkflowTask(
                id="FEAT-002",
                name="Analytics Dashboard",
                description="Implementierung des Analytics Dashboards",
                category=TaskCategory.FEATURE,
                priority=TaskPriority.MEDIUM,
                estimated_hours=24.0,
                dependencies=["FEAT-001"]
            )
        )

        # Test Implementation Tasks
        self._add_task(
            WorkflowTask(
                id="TEST-001",
                name="Core Tests",
                description="Unit-Tests für Core-Komponenten",
                category=TaskCategory.TEST,
                priority=TaskPriority.HIGH,
                estimated_hours=8.0,
                dependencies=["CORE-003"]
            )
        )

        self._add_task(
            WorkflowTask(
                id="TEST-002",
                name="Feature Tests",
                description="Unit-Tests für neue Features",
                category=TaskCategory.TEST,
                priority=TaskPriority.MEDIUM,
                estimated_hours=12.0,
                dependencies=["FEAT-001", "FEAT-002"]
            )
        )

        # Documentation Tasks
        self._add_task(
            WorkflowTask(
                id="DOC-001",
                name="API Documentation",
                description="API-Dokumentation erstellen",
                category=TaskCategory.DOCUMENTATION,
                priority=TaskPriority.MEDIUM,
                estimated_hours=8.0,
                dependencies=["CORE-003", "FEAT-001"]
            )
        )

        self._add_task(
            WorkflowTask(
                id="DOC-002",
                name="User Documentation",
                description="Benutzerhandbuch erstellen",
                category=TaskCategory.DOCUMENTATION,
                priority=TaskPriority.MEDIUM,
                estimated_hours=16.0,
                dependencies=["FEAT-002"]
            )
        )

        # Optimization Tasks
        self._add_task(
            WorkflowTask(
                id="OPT-001",
                name="Performance Optimization",
                description="System-Performance optimieren",
                category=TaskCategory.OPTIMIZATION,
                priority=TaskPriority.LOW,
                estimated_hours=20.0,
                dependencies=["TEST-001", "TEST-002"]
            )
        )

    def _add_task(self, task: WorkflowTask):
        """Fügt einen Task zum Workflow hinzu."""
        self.tasks[task.id] = task
        self.graph.add_node(task.id, **task.dict())
        for dep in task.dependencies:
            self.graph.add_edge(dep, task.id)

    def get_next_tasks(self) -> List[WorkflowTask]:
        """Gibt die nächsten verfügbaren Tasks zurück."""
        next_tasks = []
        for task_id, task in self.tasks.items():
            if task.status == TaskStatus.PENDING:
                dependencies_completed = all(
                    self.tasks[dep].status == TaskStatus.COMPLETED
                    for dep in task.dependencies
                )
                if dependencies_completed:
                    next_tasks.append(task)
        return sorted(next_tasks, key=lambda x: (x.priority.value, x.estimated_hours))

    def update_task_status(
        self,
        task_id: str,
        status: TaskStatus,
        progress: float = None,
        artifacts: Dict[str, Any] = None
    ):
        """Aktualisiert den Status eines Tasks."""
        if task_id not in self.tasks:
            raise ValueError(f"Task {task_id} nicht gefunden")

        task = self.tasks[task_id]
        task.status = status

        if progress is not None:
            task.progress = progress

        if artifacts:
            task.artifacts.update(artifacts)

        if status == TaskStatus.IN_PROGRESS and not task.started_at:
            task.started_at = datetime.utcnow()
        elif status == TaskStatus.COMPLETED and not task.completed_at:
            task.completed_at = datetime.utcnow()

        self.graph.nodes[task_id].update(task.dict())

    def get_workflow_progress(self) -> Dict[str, Any]:
        """Berechnet den Gesamtfortschritt des Workflows."""
        total_tasks = len(self.tasks)
        completed_tasks = len([t for t in self.tasks.values() if t.status == TaskStatus.COMPLETED])
        in_progress_tasks = len([t for t in self.tasks.values() if t.status == TaskStatus.IN_PROGRESS])
        
        return {
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "in_progress_tasks": in_progress_tasks,
            "completion_percentage": (completed_tasks / total_tasks) * 100,
            "estimated_total_hours": sum(t.estimated_hours for t in self.tasks.values()),
            "remaining_hours": sum(
                t.estimated_hours * (1 - t.progress)
                for t in self.tasks.values()
            )
        }

    def get_critical_path(self) -> List[str]:
        """Berechnet den kritischen Pfad im Workflow."""
        return nx.dag_longest_path(self.graph)

# Workflow-Instanz erstellen
workflow = ERPWorkflowGraph() 