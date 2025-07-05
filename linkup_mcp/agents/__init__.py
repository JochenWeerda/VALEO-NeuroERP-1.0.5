"""
VALEO-NeuroERP Agent-System

Enthält die verschiedenen Agenten-Typen und deren Implementierungen.
"""

from .base_agents import (
    BaseAgent,
    AnalyzerAgent,
    PlannerAgent,
    ExecutorAgent,
    OrchestratorAgent
)

from .specialized_agents import (
    ERPDataAnalyzer,
    WorkflowAnalyzer,
    SecurityAnalyzer,
    WorkflowOptimizationPlanner,
    ResourceAllocationPlanner,
    SecurityPlanningAgent,
    WorkflowExecutor,
    ResourceManager,
    SecurityImplementer
)

__all__ = [
    'BaseAgent',
    'AnalyzerAgent',
    'PlannerAgent',
    'ExecutorAgent',
    'OrchestratorAgent',
    'ERPDataAnalyzer',
    'WorkflowAnalyzer',
    'SecurityAnalyzer',
    'WorkflowOptimizationPlanner',
    'ResourceAllocationPlanner',
    'SecurityPlanningAgent',
    'WorkflowExecutor',
    'ResourceManager',
    'SecurityImplementer'
] 