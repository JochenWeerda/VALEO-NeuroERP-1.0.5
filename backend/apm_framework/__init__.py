"""
APM-Framework für VALEO-NeuroERP.

Dieses Framework implementiert den Agile Project Management (APM) Workflow
mit verschiedenen Modi für die Projektentwicklung.
"""

from backend.apm_framework.handover_manager import HandoverManager
from backend.apm_framework.workflow import APMWorkflow
from backend.apm_framework.plan_mode import PlanMode
from backend.apm_framework.create_mode import CREATEMode
from backend.apm_framework.implementation_mode import ImplementationMode
from backend.apm_framework.van_mode import VANMode
from backend.apm_framework.mongodb_connector import APMMongoDBConnector
from backend.apm_framework.rag_service import RAGService

__all__ = [
    'HandoverManager',
    'APMWorkflow',
    'PlanMode',
    'CREATEMode',
    'ImplementationMode',
    'VANMode',
    'APMMongoDBConnector',
    'RAGService'
]

__version__ = '1.0.0'

# Verzögerter Import der Hauptkomponenten, um zirkuläre Importabhängigkeiten zu vermeiden
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from backend.apm_framework.models import (
        ClarificationItem, RequirementAnalysis,
        ProjectPlan, SolutionDesign, Task, PlanResult,
        CodeArtifact, ResourceRequirement, DesignPattern, TestCase, CreateResult,
        IntegrationResult, TestResult, DeploymentConfig, EvaluationMetric, Improvement, ImplementationResult,
        APMWorkflowResult
    )
