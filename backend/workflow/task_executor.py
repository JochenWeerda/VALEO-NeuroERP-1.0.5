"""
Task Executor für die tatsächliche Implementierung der Tasks
"""

import asyncio
from typing import Dict, Any
from backend.core.simple_logging import logger
from backend.workflow.task_implementations.performance import (
    implement_redis_cache,
    implement_bulk_operations,
    implement_connection_pool
)
from backend.workflow.task_implementations.monitoring import (
    implement_apm_integration,
    implement_health_checks,
    implement_business_kpis
)
from backend.workflow.task_implementations.security import (
    implement_rate_limiting,
    implement_audit_logging,
    implement_gdpr_compliance
)
from backend.workflow.task_implementations.workflow import (
    implement_dynamic_rules,
    implement_conditional_tasks,
    implement_external_callbacks
)

class TaskExecutor:
    """Task Executor für die tatsächliche Implementierung"""
    
    def __init__(self):
        self.implementation_map = {
            # Performance & Skalierung
            "redis_cache": implement_redis_cache,
            "bulk_operations": implement_bulk_operations,
            "connection_pool": implement_connection_pool,
            
            # Monitoring & Observability
            "apm_integration": implement_apm_integration,
            "health_checks": implement_health_checks,
            "business_kpis": implement_business_kpis,
            
            # Sicherheit & Compliance
            "rate_limiting": implement_rate_limiting,
            "audit_logging": implement_audit_logging,
            "gdpr_compliance": implement_gdpr_compliance,
            
            # Workflow-Erweiterungen
            "dynamic_rules": implement_dynamic_rules,
            "conditional_tasks": implement_conditional_tasks,
            "external_callbacks": implement_external_callbacks
        }
        
        self.results: Dict[str, Any] = {}
        
    async def execute_task(self, task_id: str) -> Dict[str, Any]:
        """Führt einen Task aus und gibt das Ergebnis zurück"""
        if task_id not in self.implementation_map:
            raise ValueError(f"Unknown task: {task_id}")
            
        implementation = self.implementation_map[task_id]
        
        try:
            logger.info(f"Executing implementation for task {task_id}")
            result = await implementation()
            self.results[task_id] = result
            return result
            
        except Exception as e:
            logger.error(f"Error executing task {task_id}: {str(e)}")
            raise
            
    def get_task_result(self, task_id: str) -> Dict[str, Any]:
        """Gibt das Ergebnis eines Tasks zurück"""
        if task_id not in self.results:
            raise ValueError(f"No results for task {task_id}")
        return self.results[task_id]
        
    def get_all_results(self) -> Dict[str, Any]:
        """Gibt alle Task-Ergebnisse zurück"""
        return self.results 