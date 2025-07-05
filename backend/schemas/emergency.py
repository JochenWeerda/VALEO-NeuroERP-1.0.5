from pydantic import BaseModel, Field, validator
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum

from ..models.emergency import EmergencyType, EmergencyStatus, EmergencySeverity, EscalationLevel

# --- Basis-Schemas ---

class EmergencyBaseSchema(BaseModel):
    """Basis-Schema für Notfall-Schemas"""
    class Config:
        orm_mode = True
        use_enum_values = True

# --- Notfall-Schemas ---

class EmergencyCaseBase(EmergencyBaseSchema):
    """Basis-Schema für Notfälle"""
    title: str
    description: Optional[str] = None
    emergency_type: EmergencyType
    severity: Optional[EmergencySeverity] = EmergencySeverity.MEDIUM
    location: Optional[str] = None
    affected_areas: Optional[str] = None
    potential_impact: Optional[str] = None
    response_plan: Optional[Dict[str, Any]] = None

class EmergencyCaseCreate(EmergencyCaseBase):
    """Schema zum Erstellen eines Notfalls"""
    reported_by_id: Optional[int] = None
    assigned_to_id: Optional[int] = None
    resource_ids: Optional[List[int]] = []
    contact_ids: Optional[List[int]] = []
    plan_id: Optional[int] = None

class EmergencyCaseUpdate(BaseModel):
    """Schema zum Aktualisieren eines Notfalls"""
    title: Optional[str] = None
    description: Optional[str] = None
    emergency_type: Optional[EmergencyType] = None
    status: Optional[EmergencyStatus] = None
    severity: Optional[EmergencySeverity] = None
    location: Optional[str] = None
    affected_areas: Optional[str] = None
    potential_impact: Optional[str] = None
    response_plan: Optional[Dict[str, Any]] = None
    assigned_to_id: Optional[int] = None
    resource_ids: Optional[List[int]] = None
    contact_ids: Optional[List[int]] = None
    estimated_resolution_time: Optional[datetime] = None

    class Config:
        orm_mode = True
        use_enum_values = True

# --- Neue Eskalations-Schemas ---

class EmergencyEscalationBase(EmergencyBaseSchema):
    """Basis-Schema für Notfall-Eskalationen"""
    escalation_level: EscalationLevel
    reason: str
    acknowledgement_required: Optional[bool] = True
    escalation_recipients: Optional[List[int]] = []

class EmergencyEscalationCreate(EmergencyEscalationBase):
    """Schema zum Erstellen einer Notfall-Eskalation"""
    escalated_by_id: Optional[int] = None

class EmergencyEscalationUpdate(BaseModel):
    """Schema zum Aktualisieren einer Notfall-Eskalation"""
    acknowledgement_time: Optional[datetime] = None
    acknowledged_by_id: Optional[int] = None
    resolution_notes: Optional[str] = None
    resolved_at: Optional[datetime] = None

    class Config:
        orm_mode = True
        use_enum_values = True

class EmergencyEscalationResponse(EmergencyEscalationBase):
    """Schema für die Antwort einer Notfall-Eskalation"""
    id: int
    emergency_id: int
    escalated_at: datetime
    escalated_by_id: Optional[int] = None
    acknowledgement_time: Optional[datetime] = None
    acknowledged_by_id: Optional[int] = None
    resolution_notes: Optional[str] = None
    resolved_at: Optional[datetime] = None

class EmergencyUpdateBase(EmergencyBaseSchema):
    """Basis-Schema für Notfall-Updates"""
    update_text: str
    created_by_id: int

class EmergencyUpdateCreate(EmergencyUpdateBase):
    """Schema zum Erstellen eines Notfall-Updates"""
    pass

class EmergencyUpdateResponse(EmergencyUpdateBase):
    """Schema für die Antwort eines Notfall-Updates"""
    id: int
    emergency_id: int
    created_at: datetime

class EmergencyActionBase(EmergencyBaseSchema):
    """Basis-Schema für Notfall-Aktionen"""
    description: str
    due_date: Optional[datetime] = None
    assigned_to_id: Optional[int] = None

class EmergencyActionCreate(EmergencyActionBase):
    """Schema zum Erstellen einer Notfall-Aktion"""
    pass

class EmergencyActionResponse(EmergencyActionBase):
    """Schema für die Antwort einer Notfall-Aktion"""
    id: int
    emergency_id: int
    is_completed: bool
    completed_at: Optional[datetime] = None
    created_at: datetime

class EmergencyResourceBase(EmergencyBaseSchema):
    """Basis-Schema für Notfall-Ressourcen"""
    name: str
    type: str
    location: Optional[str] = None
    quantity: Optional[int] = 1
    is_available: Optional[bool] = True
    notes: Optional[str] = None

class EmergencyResourceCreate(EmergencyResourceBase):
    """Schema zum Erstellen einer Notfall-Ressource"""
    last_checked: Optional[datetime] = None
    next_check_due: Optional[datetime] = None

class EmergencyResourceUpdate(BaseModel):
    """Schema zum Aktualisieren einer Notfall-Ressource"""
    name: Optional[str] = None
    type: Optional[str] = None
    location: Optional[str] = None
    quantity: Optional[int] = None
    last_checked: Optional[datetime] = None
    next_check_due: Optional[datetime] = None
    is_available: Optional[bool] = None
    notes: Optional[str] = None

    class Config:
        orm_mode = True

class EmergencyResourceResponse(EmergencyResourceBase):
    """Schema für die Antwort einer Notfall-Ressource"""
    id: int
    last_checked: Optional[datetime] = None
    next_check_due: Optional[datetime] = None

class EmergencyContactBase(EmergencyBaseSchema):
    """Basis-Schema für Notfall-Kontakte"""
    name: str
    role: Optional[str] = None
    organization: Optional[str] = None
    is_external: Optional[bool] = False
    phone_primary: Optional[str] = None
    phone_secondary: Optional[str] = None
    email: Optional[str] = None
    area_of_expertise: Optional[str] = None
    notes: Optional[str] = None

class EmergencyContactCreate(EmergencyContactBase):
    """Schema zum Erstellen eines Notfall-Kontakts"""
    pass

class EmergencyContactUpdate(BaseModel):
    """Schema zum Aktualisieren eines Notfall-Kontakts"""
    name: Optional[str] = None
    role: Optional[str] = None
    organization: Optional[str] = None
    is_external: Optional[bool] = None
    phone_primary: Optional[str] = None
    phone_secondary: Optional[str] = None
    email: Optional[str] = None
    area_of_expertise: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        orm_mode = True

class EmergencyContactResponse(EmergencyContactBase):
    """Schema für die Antwort eines Notfall-Kontakts"""
    id: int

class EmergencyPlanBase(EmergencyBaseSchema):
    """Basis-Schema für Notfall-Pläne"""
    name: str
    emergency_type: EmergencyType
    description: Optional[str] = None
    steps: Optional[List[Dict[str, Any]]] = []
    required_resources: Optional[List[int]] = []
    required_contacts: Optional[List[int]] = []
    is_active: Optional[bool] = True

class EmergencyPlanCreate(EmergencyPlanBase):
    """Schema zum Erstellen eines Notfall-Plans"""
    pass

class EmergencyPlanUpdate(BaseModel):
    """Schema zum Aktualisieren eines Notfall-Plans"""
    name: Optional[str] = None
    emergency_type: Optional[EmergencyType] = None
    description: Optional[str] = None
    steps: Optional[List[Dict[str, Any]]] = None
    required_resources: Optional[List[int]] = None
    required_contacts: Optional[List[int]] = None
    is_active: Optional[bool] = None

    class Config:
        orm_mode = True
        use_enum_values = True

class EmergencyPlanResponse(EmergencyPlanBase):
    """Schema für die Antwort eines Notfall-Plans"""
    id: int
    created_at: datetime
    updated_at: datetime

class EmergencyDrillBase(EmergencyBaseSchema):
    """Basis-Schema für Notfall-Übungen"""
    plan_id: int
    date_conducted: datetime = Field(default_factory=datetime.utcnow)
    participants: Optional[List[int]] = []
    duration_minutes: Optional[int] = None
    outcome: Optional[str] = None
    notes: Optional[str] = None
    issues_identified: Optional[str] = None

class EmergencyDrillCreate(EmergencyDrillBase):
    """Schema zum Erstellen einer Notfall-Übung"""
    pass

class EmergencyDrillResponse(EmergencyDrillBase):
    """Schema für die Antwort einer Notfall-Übung"""
    id: int
    created_at: datetime

class EmergencyCaseResponse(EmergencyCaseBase):
    """Schema für die Antwort eines Notfalls"""
    id: int
    status: EmergencyStatus
    created_at: datetime
    updated_at: datetime
    reported_by_id: Optional[int] = None
    assigned_to_id: Optional[int] = None
    estimated_resolution_time: Optional[datetime] = None
    qs_freigabe_datum: Optional[datetime] = None
    qs_freigabe_durch_id: Optional[int] = None
    resources: List[EmergencyResourceResponse] = []
    contacts: List[EmergencyContactResponse] = []
    updates: List[EmergencyUpdateResponse] = []
    actions: List[EmergencyActionResponse] = []
    escalations: List[EmergencyEscalationResponse] = []

class EmergencyStatsResponse(BaseModel):
    """Schema für Notfall-Statistiken"""
    total_emergencies: int
    status_distribution: Dict[str, int]
    type_distribution: Dict[str, int]
    avg_resolution_time_hours: float
    high_priority_open: int
    time_period_days: int 