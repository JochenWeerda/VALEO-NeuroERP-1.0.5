"""
Parallel Execution Manager für VALEO-NeuroERP mit LangGraph Integration
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
import networkx as nx
from pydantic import BaseModel, Field
from backend.core.simple_logging import logger
from backend.apm_framework.models import Task, APMWorkflowResult
import asyncio

from backend.workflow.task_executor import TaskExecutor
from backend.monitoring.dashboard import MonitoringDashboard
from backend.workflow.agent_communication import AgentCommunication
from backend.monitoring import init_monitoring

class ParallelTask(BaseModel):
    """Modell für parallel ausführbare Tasks"""
    task_id: str
    category: str
    status: str = "pending"
    dependencies: List[str] = []
    agent_role: str
    progress: float = 0.0
    result: Optional[Dict[str, Any]] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class ParallelExecutionManager:
    def __init__(self):
        self.task_graph = nx.DiGraph()
        self.tasks: Dict[str, ParallelTask] = {}
        self.active_agents: Dict[str, Any] = {}
        
        # Neue Komponenten initialisieren
        self.task_executor = TaskExecutor()
        self.dashboard = MonitoringDashboard()
        self.agent_communication = AgentCommunication()
        
        # Monitoring initialisieren
        init_monitoring()
        
    async def initialize_parallel_tasks(self):
        """Initialisiert alle parallel auszuführenden Tasks"""
        parallel_tasks = {
            # Performance & Skalierung
            "redis_cache": ParallelTask(
                task_id="redis_cache",
                category="performance",
                agent_role="DevOps",
                dependencies=[]
            ),
            "bulk_operations": ParallelTask(
                task_id="bulk_operations",
                category="performance",
                agent_role="Developer",
                dependencies=[]
            ),
            "connection_pool": ParallelTask(
                task_id="connection_pool",
                category="performance",
                agent_role="Developer",
                dependencies=[]
            ),
            
            # Monitoring & Observability
            "apm_integration": ParallelTask(
                task_id="apm_integration",
                category="monitoring",
                agent_role="DevOps",
                dependencies=[]
            ),
            "health_checks": ParallelTask(
                task_id="health_checks",
                category="monitoring",
                agent_role="DevOps",
                dependencies=[]
            ),
            "business_kpis": ParallelTask(
                task_id="business_kpis",
                category="monitoring",
                agent_role="Architect",
                dependencies=[]
            ),
            
            # Sicherheit & Compliance
            "rate_limiting": ParallelTask(
                task_id="rate_limiting",
                category="security",
                agent_role="Security",
                dependencies=[]
            ),
            "audit_logging": ParallelTask(
                task_id="audit_logging",
                category="security",
                agent_role="Security",
                dependencies=[]
            ),
            "gdpr_compliance": ParallelTask(
                task_id="gdpr_compliance",
                category="security",
                agent_role="Security",
                dependencies=[]
            ),
            
            # Workflow-Erweiterungen
            "dynamic_rules": ParallelTask(
                task_id="dynamic_rules",
                category="workflow",
                agent_role="Architect",
                dependencies=[]
            ),
            "conditional_tasks": ParallelTask(
                task_id="conditional_tasks",
                category="workflow",
                agent_role="Developer",
                dependencies=[]
            ),
            "external_callbacks": ParallelTask(
                task_id="external_callbacks",
                category="workflow",
                agent_role="Developer",
                dependencies=[]
            )
        }
        
        self.tasks = parallel_tasks
        for task_id, task in parallel_tasks.items():
            self.task_graph.add_node(task_id, **task.model_dump())
    
    async def start_parallel_execution(self):
        """Startet die parallele Ausführung aller Tasks"""
        await self.initialize_parallel_tasks()
        
        # Dashboard-Monitoring starten
        dashboard_task = asyncio.create_task(self.dashboard.start_monitoring())
        
        # Gruppiere Tasks nach Kategorien für besseres Monitoring
        categories = {
            "performance": [],
            "monitoring": [],
            "security": [],
            "workflow": []
        }
        
        for task_id, task in self.tasks.items():
            categories[task.category].append(task_id)
        
        # Starte alle Tasks parallel
        tasks = []
        for category, task_ids in categories.items():
            for task_id in task_ids:
                tasks.append(self.execute_task(task_id))
        
        # Warte auf Abschluss aller Tasks
        await asyncio.gather(*tasks)
        
        # Dashboard-Task beenden
        dashboard_task.cancel()
        try:
            await dashboard_task
        except asyncio.CancelledError:
            pass
    
    async def execute_task(self, task_id: str):
        """Führt einen einzelnen Task aus"""
        task = self.tasks[task_id]
        task.started_at = datetime.now()
        task.status = "in_progress"
        
        # Dashboard aktualisieren
        await self.dashboard.update_task_metrics(
            task_id=task_id,
            category=task.category,
            status=task.status,
            progress=task.progress,
            agent_role=task.agent_role
        )
        
        try:
            # Handover für den Task erstellen
            handover = await self.agent_communication.create_handover(
                task_id=task_id,
                from_agent="system",
                to_agent=task.agent_role,
                artifacts={},
                notes=f"Initial handover for task {task_id}",
                requirements=[],
                dependencies=task.dependencies
            )
            
            # Task ausführen
            logger.info(f"Starting task {task_id} in category {task.category}")
            result = await self.task_executor.execute_task(task_id)
            
            # Handover abschließen
            await self.agent_communication.complete_handover(
                task_id=task_id,
                agent=task.agent_role,
                result=result
            )
            
            task.status = "completed"
            task.completed_at = datetime.now()
            task.progress = 100.0
            task.result = result
            
            # Dashboard aktualisieren
            await self.dashboard.update_task_metrics(
                task_id=task_id,
                category=task.category,
                status=task.status,
                progress=task.progress,
                agent_role=task.agent_role
            )
            
            logger.info(f"Completed task {task_id}")
            
        except Exception as e:
            task.status = "failed"
            logger.error(f"Task {task_id} failed: {str(e)}")
            
            # Dashboard aktualisieren
            await self.dashboard.update_task_metrics(
                task_id=task_id,
                category=task.category,
                status=task.status,
                progress=task.progress,
                agent_role=task.agent_role
            )
            
            raise
    
    def get_execution_status(self) -> Dict[str, Any]:
        """Gibt den aktuellen Status aller Tasks zurück"""
        status = {
            "total_tasks": len(self.tasks),
            "completed": len([t for t in self.tasks.values() if t.status == "completed"]),
            "in_progress": len([t for t in self.tasks.values() if t.status == "in_progress"]),
            "pending": len([t for t in self.tasks.values() if t.status == "pending"]),
            "failed": len([t for t in self.tasks.values() if t.status == "failed"]),
            "tasks": {
                task_id: {
                    "status": task.status,
                    "progress": task.progress,
                    "category": task.category,
                    "agent_role": task.agent_role,
                    "result": task.result
                } for task_id, task in self.tasks.items()
            }
        }
        return status 