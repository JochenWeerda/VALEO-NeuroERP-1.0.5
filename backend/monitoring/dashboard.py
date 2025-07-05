"""
Monitoring-Dashboard für die Task-Ausführung
"""

import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime
from pydantic import BaseModel
from backend.core.simple_logging import logger
import json
import os

class TaskMetrics(BaseModel):
    """Metriken für einen einzelnen Task"""
    task_id: str
    category: str
    status: str
    progress: float
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_seconds: Optional[float] = None
    agent_role: str
    memory_usage_mb: float = 0.0
    cpu_usage_percent: float = 0.0

class CategoryMetrics(BaseModel):
    """Metriken für eine Task-Kategorie"""
    category: str
    total_tasks: int
    completed_tasks: int
    failed_tasks: int
    in_progress_tasks: int
    average_duration: float = 0.0
    total_memory_usage_mb: float = 0.0
    total_cpu_usage_percent: float = 0.0

class DashboardMetrics(BaseModel):
    """Gesamtmetriken für das Dashboard"""
    timestamp: datetime
    total_tasks: int
    completed_tasks: int
    failed_tasks: int
    in_progress_tasks: int
    tasks: Dict[str, TaskMetrics]
    categories: Dict[str, CategoryMetrics]

class MonitoringDashboard:
    """Monitoring-Dashboard für die Task-Ausführung"""
    
    def __init__(self):
        self.metrics_history: List[DashboardMetrics] = []
        self.current_metrics: Dict[str, TaskMetrics] = {}
        self.update_interval = 1  # Sekunden
        
    async def start_monitoring(self):
        """Startet das Monitoring"""
        logger.info("Starting monitoring dashboard")
        while True:
            await self.update_metrics()
            await asyncio.sleep(self.update_interval)
            
    async def update_metrics(self):
        """Aktualisiert die Metriken"""
        timestamp = datetime.now()
        
        # Simuliere Systemmetriken (in der realen Implementierung würden diese
        # von tatsächlichen System-Monitoring-Tools kommen)
        for task_id, metrics in self.current_metrics.items():
            metrics.memory_usage_mb = 100 + (hash(task_id) % 100)  # Simuliert
            metrics.cpu_usage_percent = 20 + (hash(task_id) % 60)  # Simuliert
            
            if metrics.end_time:
                metrics.duration_seconds = (
                    metrics.end_time - metrics.start_time
                ).total_seconds()
        
        # Kategorie-Metriken berechnen
        categories: Dict[str, CategoryMetrics] = {}
        for metrics in self.current_metrics.values():
            if metrics.category not in categories:
                categories[metrics.category] = CategoryMetrics(
                    category=metrics.category,
                    total_tasks=0,
                    completed_tasks=0,
                    failed_tasks=0,
                    in_progress_tasks=0
                )
                
            cat_metrics = categories[metrics.category]
            cat_metrics.total_tasks += 1
            
            if metrics.status == "completed":
                cat_metrics.completed_tasks += 1
            elif metrics.status == "failed":
                cat_metrics.failed_tasks += 1
            elif metrics.status == "in_progress":
                cat_metrics.in_progress_tasks += 1
                
            cat_metrics.total_memory_usage_mb += metrics.memory_usage_mb
            cat_metrics.total_cpu_usage_percent += metrics.cpu_usage_percent
            
            if metrics.duration_seconds:
                cat_metrics.average_duration = (
                    cat_metrics.average_duration * (cat_metrics.completed_tasks - 1) +
                    metrics.duration_seconds
                ) / cat_metrics.completed_tasks
        
        # Dashboard-Metriken erstellen
        dashboard_metrics = DashboardMetrics(
            timestamp=timestamp,
            total_tasks=len(self.current_metrics),
            completed_tasks=sum(1 for m in self.current_metrics.values() if m.status == "completed"),
            failed_tasks=sum(1 for m in self.current_metrics.values() if m.status == "failed"),
            in_progress_tasks=sum(1 for m in self.current_metrics.values() if m.status == "in_progress"),
            tasks=self.current_metrics,
            categories=categories
        )
        
        self.metrics_history.append(dashboard_metrics)
        await self.save_metrics(dashboard_metrics)
        
    async def update_task_metrics(
        self,
        task_id: str,
        category: str,
        status: str,
        progress: float,
        agent_role: str
    ):
        """Aktualisiert die Metriken für einen Task"""
        if task_id not in self.current_metrics:
            self.current_metrics[task_id] = TaskMetrics(
                task_id=task_id,
                category=category,
                status=status,
                progress=progress,
                start_time=datetime.now(),
                agent_role=agent_role
            )
        else:
            metrics = self.current_metrics[task_id]
            metrics.status = status
            metrics.progress = progress
            
            if status in ["completed", "failed"]:
                metrics.end_time = datetime.now()
                
    async def save_metrics(self, metrics: DashboardMetrics):
        """Speichert die Metriken in einer JSON-Datei"""
        try:
            metrics_dir = "metrics"
            os.makedirs(metrics_dir, exist_ok=True)
            
            filename = os.path.join(
                metrics_dir,
                f"metrics_{metrics.timestamp.strftime('%Y%m%d_%H%M%S')}.json"
            )
            
            with open(filename, "w") as f:
                json.dump(metrics.model_dump(), f, default=str, indent=2)
                
        except Exception as e:
            logger.error(f"Error saving metrics: {str(e)}")
            
    def get_latest_metrics(self) -> DashboardMetrics:
        """Gibt die aktuellsten Metriken zurück"""
        if not self.metrics_history:
            raise ValueError("No metrics available")
        return self.metrics_history[-1]
        
    def get_metrics_history(self) -> List[DashboardMetrics]:
        """Gibt die gesamte Metrik-Historie zurück"""
        return self.metrics_history 