"""
Datenmodelle für das Agentic Project Management (APM) Framework
mit MongoDB-Integration für VALEO-NeuroERP
"""

from datetime import datetime
from typing import Dict, List, Any, Optional, Union, Annotated, ClassVar
from pydantic import BaseModel, Field, BeforeValidator
from bson import ObjectId

# Benutzerdefinierte Klasse für MongoDB ObjectId-Kompatibilität mit Pydantic v2
def validate_object_id(v) -> str:
    if isinstance(v, ObjectId):
        return str(v)
    if isinstance(v, str):
        if ObjectId.is_valid(v):
            return str(v)
        raise ValueError("Ungültige ObjectId")
    raise TypeError("String oder ObjectId erwartet")

PyObjectId = Annotated[str, BeforeValidator(validate_object_id)]

# Basismodell für alle APM-Dokumente
class APMBaseModel(BaseModel):
    """Basismodell für alle APM-Dokumente mit gemeinsamen Feldern"""
    id: Optional[PyObjectId] = Field(None, alias="_id")
    project_id: str
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

# VAN-Mode Modelle
class ClarificationItem(APMBaseModel):
    """Modell für Klärungsfragen und Antworten"""
    phase: str = "VAN"
    question: str
    answer: Optional[str] = None
    status: str = "pending"  # pending, answered, resolved

class RequirementAnalysis(APMBaseModel):
    """Modell für die Anforderungsanalyse"""
    requirement: str
    analysis: str
    similar_requirements: List[PyObjectId] = []
    clarifications: List[PyObjectId] = []

# PLAN-Mode Modelle
class ProjectPlan(APMBaseModel):
    """Modell für Projektpläne"""
    name: str
    description: str
    milestones: List[Dict[str, Any]] = []
    timeline: Dict[str, Any] = {}
    van_analysis_id: PyObjectId

class SolutionDesign(APMBaseModel):
    """Modell für Lösungsdesigns"""
    requirement_id: PyObjectId
    design_type: str  # architecture, component, database, etc.
    description: str
    diagrams: List[str] = []
    design_decisions: List[Dict[str, Any]] = []
    alternatives_considered: List[Dict[str, Any]] = []

class Task(APMBaseModel):
    """Modell für Aufgaben"""
    name: str
    description: str
    requirement_id: PyObjectId
    assignee: Optional[str] = None
    status: str = "planned"  # planned, in_progress, implemented, completed
    priority: int = 1
    dependencies: List[PyObjectId] = []
    dependencies_met: bool = True
    estimated_hours: float = 0.0
    actual_hours: Optional[float] = None

class PlanResult(APMBaseModel):
    """Modell für Ergebnisse der Planungsphase"""
    van_analysis_id: PyObjectId
    plan_id: PyObjectId
    design_id: PyObjectId
    task_ids: List[PyObjectId] = []
    next_steps: List[PyObjectId] = []

# CREATE-Mode Modelle
class CodeArtifact(APMBaseModel):
    """Modell für Code-Artefakte"""
    file_path: str
    content: str
    task_id: PyObjectId
    version: int = 1
    language: str
    lines_of_code: int
    complexity_score: Optional[float] = None

class ResourceRequirement(APMBaseModel):
    """Modell für Ressourcenanforderungen"""
    resources: Dict[str, Any]
    task_id: PyObjectId

class DesignPattern(APMBaseModel):
    """Modell für Entwurfsmuster"""
    name: str
    category: str
    description: str
    code_artifacts: List[PyObjectId] = []
    task_id: PyObjectId

class TestCase(APMBaseModel):
    """Modell für Testfälle"""
    name: str
    description: str
    test_type: str  # unit, integration, system, etc.
    code_artifact_id: PyObjectId
    expected_result: str
    test_code: str
    task_id: PyObjectId

class CreateResult(APMBaseModel):
    """Modell für Ergebnisse der Erstellungsphase"""
    task_id: PyObjectId
    code_artifacts: List[PyObjectId] = []
    resources: Dict[str, Any] = {}
    patterns: List[str] = []
    test_cases: List[PyObjectId] = []

# IMPLEMENTATION-Mode Modelle
class IntegrationResult(APMBaseModel):
    """Modell für Integrationsergebnisse"""
    component_id: PyObjectId
    status: str  # success, failed, partial
    details: str
    logs: str

class TestResult(APMBaseModel):
    """Modell für Testergebnisse"""
    test_case_id: PyObjectId
    status: str  # pass, fail, error, skipped
    execution_time_ms: int
    output: str
    error_message: Optional[str] = None

class DeploymentConfig(APMBaseModel):
    """Modell für Deployment-Konfigurationen"""
    environment: str  # dev, staging, production
    config: Dict[str, Any]
    code_artifacts: List[PyObjectId] = []

class EvaluationMetric(APMBaseModel):
    """Modell für Evaluationsmetriken"""
    category: str  # performance, security, usability, etc.
    name: str
    value: Union[float, int, str]
    unit: Optional[str] = None
    threshold: Optional[float] = None
    is_within_threshold: Optional[bool] = None

class Improvement(APMBaseModel):
    """Modell für Verbesserungen"""
    issue_id: str
    description: str
    priority: str  # high, medium, low
    status: str = "identified"  # identified, in_progress, implemented
    related_artifacts: List[PyObjectId] = []

class ImplementationResult(APMBaseModel):
    """Modell für Ergebnisse der Implementierungsphase"""
    create_result_id: PyObjectId
    integration_status: bool
    test_pass_rate: float
    metrics: Dict[str, Any] = {}
    improvements_needed: bool = False

# Workflow-Ergebnis-Modell
class APMWorkflowResult(APMBaseModel):
    """Modell für das Gesamtergebnis des APM-Workflows"""
    requirement: str
    van_id: PyObjectId
    plan_result_id: PyObjectId
    create_result_ids: List[PyObjectId] = []
    implementation_result_ids: List[PyObjectId] = []
    status: str = "completed"  # in_progress, completed, failed
    metrics: Dict[str, Any] = {} 