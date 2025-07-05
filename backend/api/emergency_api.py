from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import logging

from ..schemas.emergency import (
    EmergencyCaseCreate,
    EmergencyCaseUpdate,
    EmergencyCaseResponse,
    EmergencyActionCreate,
    EmergencyActionResponse,
    EmergencyUpdateCreate,
    EmergencyUpdateResponse,
    EmergencyResourceCreate,
    EmergencyResourceUpdate,
    EmergencyResourceResponse,
    EmergencyContactCreate, 
    EmergencyContactUpdate,
    EmergencyContactResponse,
    EmergencyPlanCreate,
    EmergencyPlanUpdate,
    EmergencyPlanResponse,
    EmergencyDrillCreate,
    EmergencyDrillResponse,
    EmergencyStatsResponse,
    EmergencyEscalationCreate,
    EmergencyEscalationUpdate,
    EmergencyEscalationResponse
)
from ..models.emergency import EmergencyStatus, EmergencyType, EmergencySeverity, EscalationLevel
try:
    from backend.services.emergency_service import EmergencyService
except ImportError:
    # Dummy-Service
    class EmergencyService:
        def __init__(self): pass import EmergencyService
from backend.db.database import get_db

router = APIRouter(
    prefix="/api/v1/emergency",
    tags=["Emergency"]
)

# Hilfsfunktion zum Abrufen der Notfall-Service-Instanz
def get_emergency_service(db: Session = Depends(get_db)) -> EmergencyService:
    return EmergencyService(db)

# --- Notfall-Management-Endpunkte ---

@router.post("/cases", response_model=EmergencyCaseResponse, status_code=status.HTTP_201_CREATED)
async def create_emergency_case(
    emergency_data: EmergencyCaseCreate,
    service: EmergencyService = Depends(get_emergency_service)
):
    """Erstellt einen neuen Notfall/Krisenfall"""
    return service.create_emergency(emergency_data.dict())

@router.get("/cases", response_model=List[EmergencyCaseResponse])
async def get_emergency_cases(
    status: Optional[EmergencyStatus] = None,
    emergency_type: Optional[EmergencyType] = None,
    severity: Optional[EmergencySeverity] = None,
    active_only: bool = True,
    service: EmergencyService = Depends(get_emergency_service)
):
    """Ruft Notfälle basierend auf Filterkriterien ab"""
    return service.get_emergencies(status, emergency_type, severity, active_only)

@router.get("/cases/{emergency_id}", response_model=EmergencyCaseResponse)
async def get_emergency_case(
    emergency_id: int = Path(..., description="ID des Notfalls"),
    service: EmergencyService = Depends(get_emergency_service)
):
    """Ruft einen bestimmten Notfall anhand seiner ID ab"""
    emergency = service.get_emergency_by_id(emergency_id)
    if not emergency:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notfall mit ID {emergency_id} nicht gefunden"
        )
    return emergency

@router.put("/cases/{emergency_id}", response_model=EmergencyCaseResponse)
async def update_emergency_case(
    emergency_data: EmergencyCaseUpdate,
    emergency_id: int = Path(..., description="ID des Notfalls"),
    service: EmergencyService = Depends(get_emergency_service)
):
    """Aktualisiert einen bestehenden Notfall"""
    emergency = service.update_emergency(emergency_id, emergency_data.dict(exclude_unset=True))
    if not emergency:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notfall mit ID {emergency_id} nicht gefunden"
        )
    return emergency

@router.post("/cases/{emergency_id}/close", response_model=EmergencyCaseResponse)
async def close_emergency_case(
    emergency_id: int = Path(..., description="ID des Notfalls"),
    resolution_notes: Optional[str] = Query(None, description="Abschlussnotizen"),
    service: EmergencyService = Depends(get_emergency_service)
):
    """Schließt einen Notfall ab"""
    emergency = service.close_emergency(emergency_id, resolution_notes)
    if not emergency:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notfall mit ID {emergency_id} nicht gefunden"
        )
    return emergency

# --- Notfall-Updates und Aktionen ---

@router.post("/cases/{emergency_id}/updates", response_model=EmergencyUpdateResponse, status_code=status.HTTP_201_CREATED)
async def add_emergency_update(
    update_data: EmergencyUpdateCreate,
    emergency_id: int = Path(..., description="ID des Notfalls"),
    service: EmergencyService = Depends(get_emergency_service)
):
    """Fügt ein Update zu einem Notfall hinzu"""
    update = service.add_emergency_update(
        emergency_id=emergency_id,
        update_text=update_data.update_text,
        user_id=update_data.created_by_id
    )
    if not update:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notfall mit ID {emergency_id} nicht gefunden"
        )
    return update

@router.post("/cases/{emergency_id}/actions", response_model=EmergencyActionResponse, status_code=status.HTTP_201_CREATED)
async def add_emergency_action(
    action_data: EmergencyActionCreate,
    emergency_id: int = Path(..., description="ID des Notfalls"),
    service: EmergencyService = Depends(get_emergency_service)
):
    """Fügt eine Aktion zu einem Notfall hinzu"""
    action = service.add_emergency_action(emergency_id, action_data.dict())
    if not action:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notfall mit ID {emergency_id} nicht gefunden"
        )
    return action

@router.post("/actions/{action_id}/complete", response_model=EmergencyActionResponse)
async def complete_action(
    action_id: int = Path(..., description="ID der Aktion"),
    service: EmergencyService = Depends(get_emergency_service)
):
    """Markiert eine Aktion als abgeschlossen"""
    action = service.mark_action_complete(action_id)
    if not action:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Aktion mit ID {action_id} nicht gefunden"
        )
    return action

# --- Eskalationsmanagement-Endpunkte ---

@router.post("/cases/{emergency_id}/escalations", response_model=EmergencyEscalationResponse, status_code=status.HTTP_201_CREATED)
async def create_escalation(
    escalation_data: EmergencyEscalationCreate,
    emergency_id: int = Path(..., description="ID des Notfalls"),
    service: EmergencyService = Depends(get_emergency_service)
):
    """Erstellt eine neue Eskalation für einen Notfall"""
    escalation = service.create_escalation(emergency_id, escalation_data.dict())
    if not escalation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notfall mit ID {emergency_id} nicht gefunden"
        )
    return escalation

@router.get("/escalations", response_model=List[EmergencyEscalationResponse])
async def get_escalations(
    emergency_id: Optional[int] = None,
    level: Optional[EscalationLevel] = None,
    resolved: bool = False,
    service: EmergencyService = Depends(get_emergency_service)
):
    """Ruft Eskalationen basierend auf Filterkriterien ab"""
    return service.get_escalations(emergency_id, level, resolved)

@router.get("/escalations/{escalation_id}", response_model=EmergencyEscalationResponse)
async def get_escalation(
    escalation_id: int = Path(..., description="ID der Eskalation"),
    service: EmergencyService = Depends(get_emergency_service)
):
    """Ruft eine bestimmte Eskalation anhand ihrer ID ab"""
    escalation = service.get_escalation_by_id(escalation_id)
    if not escalation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Eskalation mit ID {escalation_id} nicht gefunden"
        )
    return escalation

@router.post("/escalations/{escalation_id}/acknowledge", response_model=EmergencyEscalationResponse)
async def acknowledge_escalation(
    escalation_id: int = Path(..., description="ID der Eskalation"),
    data: dict = {},
    service: EmergencyService = Depends(get_emergency_service)
):
    """Bestätigt den Erhalt einer Eskalation"""
    acknowledged_by_id = data.get("acknowledged_by_id")
    escalation = service.acknowledge_escalation(escalation_id, acknowledged_by_id)
    if not escalation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Eskalation mit ID {escalation_id} nicht gefunden"
        )
    return escalation

@router.post("/escalations/{escalation_id}/resolve", response_model=EmergencyEscalationResponse)
async def resolve_escalation(
    escalation_id: int = Path(..., description="ID der Eskalation"),
    data: dict = {},
    service: EmergencyService = Depends(get_emergency_service)
):
    """Löst eine Eskalation auf"""
    resolution_notes = data.get("resolution_notes", "")
    escalation = service.resolve_escalation(escalation_id, resolution_notes)
    if not escalation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Eskalation mit ID {escalation_id} nicht gefunden"
        )
    return escalation

# --- Notfallplan-Endpunkte ---

@router.post("/plans", response_model=EmergencyPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_emergency_plan(
    plan_data: EmergencyPlanCreate,
    service: EmergencyService = Depends(get_emergency_service)
):
    """Erstellt einen neuen Notfallplan"""
    return service.create_emergency_plan(plan_data.dict())

@router.get("/plans", response_model=List[EmergencyPlanResponse])
async def get_emergency_plans(
    emergency_type: Optional[EmergencyType] = None,
    active_only: bool = True,
    service: EmergencyService = Depends(get_emergency_service)
):
    """Ruft Notfallpläne basierend auf Filterkriterien ab"""
    return service.get_plans(emergency_type, active_only)

@router.get("/plans/{plan_id}", response_model=EmergencyPlanResponse)
async def get_emergency_plan(
    plan_id: int = Path(..., description="ID des Notfallplans"),
    service: EmergencyService = Depends(get_emergency_service)
):
    """Ruft einen bestimmten Notfallplan anhand seiner ID ab"""
    plan = service.get_plan_by_id(plan_id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notfallplan mit ID {plan_id} nicht gefunden"
        )
    return plan

@router.put("/plans/{plan_id}", response_model=EmergencyPlanResponse)
async def update_emergency_plan(
    plan_data: EmergencyPlanUpdate,
    plan_id: int = Path(..., description="ID des Notfallplans"),
    service: EmergencyService = Depends(get_emergency_service)
):
    """Aktualisiert einen bestehenden Notfallplan"""
    plan = service.update_plan(plan_id, plan_data.dict(exclude_unset=True))
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notfallplan mit ID {plan_id} nicht gefunden"
        )
    return plan

@router.post("/cases/{emergency_id}/apply-plan/{plan_id}")
async def apply_plan_to_emergency(
    emergency_id: int = Path(..., description="ID des Notfalls"),
    plan_id: int = Path(..., description="ID des Notfallplans"),
    service: EmergencyService = Depends(get_emergency_service)
):
    """Wendet einen Notfallplan auf einen bestehenden Notfall an"""
    success = service.apply_emergency_plan(emergency_id, plan_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notfall mit ID {emergency_id} oder Plan mit ID {plan_id} nicht gefunden"
        )
    return {"message": f"Plan {plan_id} erfolgreich auf Notfall {emergency_id} angewendet"}

# --- Ressourcen-Endpunkte ---

@router.post("/resources", response_model=EmergencyResourceResponse, status_code=status.HTTP_201_CREATED)
async def create_resource(
    resource_data: EmergencyResourceCreate,
    service: EmergencyService = Depends(get_emergency_service)
):
    """Erstellt eine neue Notfallressource"""
    return service.create_resource(resource_data.dict())

@router.get("/resources", response_model=List[EmergencyResourceResponse])
async def get_resources(
    available_only: bool = False,
    resource_type: Optional[str] = None,
    service: EmergencyService = Depends(get_emergency_service)
):
    """Ruft Ressourcen basierend auf Filterkriterien ab"""
    return service.get_resources(available_only, resource_type)

@router.get("/resources/{resource_id}", response_model=EmergencyResourceResponse)
async def get_resource(
    resource_id: int = Path(..., description="ID der Ressource"),
    service: EmergencyService = Depends(get_emergency_service)
):
    """Ruft eine bestimmte Ressource anhand ihrer ID ab"""
    resource = service.get_resource_by_id(resource_id)
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ressource mit ID {resource_id} nicht gefunden"
        )
    return resource

@router.put("/resources/{resource_id}", response_model=EmergencyResourceResponse)
async def update_resource(
    resource_data: EmergencyResourceUpdate,
    resource_id: int = Path(..., description="ID der Ressource"),
    service: EmergencyService = Depends(get_emergency_service)
):
    """Aktualisiert eine bestehende Ressource"""
    resource = service.update_resource(resource_id, resource_data.dict(exclude_unset=True))
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ressource mit ID {resource_id} nicht gefunden"
        )
    return resource

# --- Kontakt-Endpunkte ---

@router.post("/contacts", response_model=EmergencyContactResponse, status_code=status.HTTP_201_CREATED)
async def create_contact(
    contact_data: EmergencyContactCreate,
    service: EmergencyService = Depends(get_emergency_service)
):
    """Erstellt einen neuen Notfallkontakt"""
    return service.create_contact(contact_data.dict())

@router.get("/contacts", response_model=List[EmergencyContactResponse])
async def get_contacts(
    is_external: Optional[bool] = None,
    area_of_expertise: Optional[str] = None,
    service: EmergencyService = Depends(get_emergency_service)
):
    """Ruft Kontakte basierend auf Filterkriterien ab"""
    return service.get_contacts(is_external, area_of_expertise)

@router.get("/contacts/{contact_id}", response_model=EmergencyContactResponse)
async def get_contact(
    contact_id: int = Path(..., description="ID des Kontakts"),
    service: EmergencyService = Depends(get_emergency_service)
):
    """Ruft einen bestimmten Kontakt anhand seiner ID ab"""
    contact = service.get_contact_by_id(contact_id)
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Kontakt mit ID {contact_id} nicht gefunden"
        )
    return contact

@router.put("/contacts/{contact_id}", response_model=EmergencyContactResponse)
async def update_contact(
    contact_data: EmergencyContactUpdate,
    contact_id: int = Path(..., description="ID des Kontakts"),
    service: EmergencyService = Depends(get_emergency_service)
):
    """Aktualisiert einen bestehenden Kontakt"""
    contact = service.update_contact(contact_id, contact_data.dict(exclude_unset=True))
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Kontakt mit ID {contact_id} nicht gefunden"
        )
    return contact

# --- Übungs-Endpunkte ---

@router.post("/drills", response_model=EmergencyDrillResponse, status_code=status.HTTP_201_CREATED)
async def create_drill(
    drill_data: EmergencyDrillCreate,
    service: EmergencyService = Depends(get_emergency_service)
):
    """Zeichnet eine neue Notfallübung auf"""
    return service.create_drill(drill_data.dict())

@router.get("/drills", response_model=List[EmergencyDrillResponse])
async def get_drills(
    plan_id: Optional[int] = None,
    service: EmergencyService = Depends(get_emergency_service)
):
    """Ruft Notfallübungen basierend auf Filterkriterien ab"""
    return service.get_drills(plan_id)

@router.get("/drills/{drill_id}", response_model=EmergencyDrillResponse)
async def get_drill(
    drill_id: int = Path(..., description="ID der Übung"),
    service: EmergencyService = Depends(get_emergency_service)
):
    """Ruft eine bestimmte Notfallübung anhand ihrer ID ab"""
    drill = service.get_drill_by_id(drill_id)
    if not drill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Übung mit ID {drill_id} nicht gefunden"
        )
    return drill

# --- Statistik-Endpunkte ---

@router.get("/stats", response_model=EmergencyStatsResponse)
async def get_emergency_stats(
    days: int = Query(30, description="Zeitraum in Tagen für die Statistik"),
    service: EmergencyService = Depends(get_emergency_service)
):
    """Ruft Statistiken zu Notfällen ab"""
    return service.get_emergency_statistics(days) 