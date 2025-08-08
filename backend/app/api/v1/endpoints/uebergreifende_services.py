"""
API-Endpunkte für Übergreifende Services Module
Implementiert alle CRUD-Operationen für 45+ Übergreifende Services-Formulare
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body, Query, Path
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime, date
import logging

from backend.app.dependencies import get_db
from backend.app.models.uebergreifende_services import (
    Benutzer, Rolle, BenutzerRolle, Permission, RollenPermission, BenutzerAktivitaet, BenutzerSession,
    SystemEinstellung, ModulEinstellung,
    WorkflowDefinition, WorkflowExecution, WorkflowExecutionStep,
    BerichtDefinition, BerichtExecution, AnalyticsEvent,
    Integration, IntegrationSyncLog,
    Backup, BackupExecution,
    MonitoringAlert, MonitoringMetric, MonitoringAlertTrigger,
    APIEndpoint, APIKey, APIUsageLog,
    Dokument, DokumentVersion, DokumentShare
)
from backend.app.schemas.uebergreifende_services import (
    BenutzerCreate, BenutzerResponse, BenutzerUpdate,
    RolleCreate, RolleResponse, RolleUpdate,
    BenutzerRolleCreate, BenutzerRolleResponse, BenutzerRolleUpdate,
    PermissionCreate, PermissionResponse, PermissionUpdate,
    RollenPermissionCreate, RollenPermissionResponse, RollenPermissionUpdate,
    BenutzerAktivitaetCreate, BenutzerAktivitaetResponse, BenutzerAktivitaetUpdate,
    BenutzerSessionCreate, BenutzerSessionResponse, BenutzerSessionUpdate,
    SystemEinstellungCreate, SystemEinstellungResponse, SystemEinstellungUpdate,
    ModulEinstellungCreate, ModulEinstellungResponse, ModulEinstellungUpdate,
    WorkflowDefinitionCreate, WorkflowDefinitionResponse, WorkflowDefinitionUpdate,
    WorkflowExecutionCreate, WorkflowExecutionResponse, WorkflowExecutionUpdate,
    WorkflowExecutionStepCreate, WorkflowExecutionStepResponse, WorkflowExecutionStepUpdate,
    BerichtDefinitionCreate, BerichtDefinitionResponse, BerichtDefinitionUpdate,
    BerichtExecutionCreate, BerichtExecutionResponse, BerichtExecutionUpdate,
    AnalyticsEventCreate, AnalyticsEventResponse, AnalyticsEventUpdate,
    IntegrationCreate, IntegrationResponse, IntegrationUpdate,
    IntegrationSyncLogCreate, IntegrationSyncLogResponse, IntegrationSyncLogUpdate,
    BackupCreate, BackupResponse, BackupUpdate,
    BackupExecutionCreate, BackupExecutionResponse, BackupExecutionUpdate,
    MonitoringAlertCreate, MonitoringAlertResponse, MonitoringAlertUpdate,
    MonitoringMetricCreate, MonitoringMetricResponse, MonitoringMetricUpdate,
    MonitoringAlertTriggerCreate, MonitoringAlertTriggerResponse, MonitoringAlertTriggerUpdate,
    APIEndpointCreate, APIEndpointResponse, APIEndpointUpdate,
    APIKeyCreate, APIKeyResponse, APIKeyUpdate,
    APIUsageLogCreate, APIUsageLogResponse, APIUsageLogUpdate,
    DokumentCreate, DokumentResponse, DokumentUpdate,
    DokumentVersionCreate, DokumentVersionResponse, DokumentVersionUpdate,
    DokumentShareCreate, DokumentShareResponse, DokumentShareUpdate
)
from backend.app.auth.permissions import check_permission
from backend.app.auth.auth import get_current_user

router = APIRouter(prefix="/uebergreifende-services", tags=["Übergreifende Services"])

# ==================== Benutzer Endpoints ====================

@router.post("/benutzer/", response_model=BenutzerResponse)
async def create_benutzer(
    benutzer: BenutzerCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Erstellt neuen Benutzer"""
    if not check_permission(current_user, "uebergreifende_services", "benutzer", "create"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    try:
        db_benutzer = Benutzer(**benutzer.dict())
        db.add(db_benutzer)
        db.commit()
        db.refresh(db_benutzer)
        return db_benutzer
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Benutzer bereits vorhanden")

@router.get("/benutzer/", response_model=List[BenutzerResponse])
async def get_benutzer_list(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    abteilung: Optional[str] = None,
    ist_aktiv: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Listet alle Benutzer mit Filterung"""
    if not check_permission(current_user, "uebergreifende_services", "benutzer", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    query = db.query(Benutzer)
    if status:
        query = query.filter(Benutzer.status == status)
    if abteilung:
        query = query.filter(Benutzer.abteilung == abteilung)
    if ist_aktiv is not None:
        query = query.filter(Benutzer.ist_aktiv == ist_aktiv)
    
    return query.offset(skip).limit(limit).all()

@router.get("/benutzer/{benutzer_id}", response_model=BenutzerResponse)
async def get_benutzer(
    benutzer_id: int = Path(..., title="Benutzer ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Holt spezifischen Benutzer"""
    if not check_permission(current_user, "uebergreifende_services", "benutzer", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    benutzer = db.query(Benutzer).filter(Benutzer.id == benutzer_id).first()
    if not benutzer:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")
    return benutzer

@router.put("/benutzer/{benutzer_id}", response_model=BenutzerResponse)
async def update_benutzer(
    benutzer_id: int = Path(..., title="Benutzer ID"),
    benutzer_update: BenutzerUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Aktualisiert Benutzer"""
    if not check_permission(current_user, "uebergreifende_services", "benutzer", "update"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    benutzer = db.query(Benutzer).filter(Benutzer.id == benutzer_id).first()
    if not benutzer:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")
    
    for field, value in benutzer_update.dict(exclude_unset=True).items():
        setattr(benutzer, field, value)
    
    db.commit()
    db.refresh(benutzer)
    return benutzer

@router.delete("/benutzer/{benutzer_id}", status_code=204)
async def delete_benutzer(
    benutzer_id: int = Path(..., title="Benutzer ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Löscht Benutzer"""
    if not check_permission(current_user, "uebergreifende_services", "benutzer", "delete"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    benutzer = db.query(Benutzer).filter(Benutzer.id == benutzer_id).first()
    if not benutzer:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")
    
    db.delete(benutzer)
    db.commit()

# ==================== Rolle Endpoints ====================

@router.post("/rolle/", response_model=RolleResponse)
async def create_rolle(
    rolle: RolleCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Erstellt neue Rolle"""
    if not check_permission(current_user, "uebergreifende_services", "rolle", "create"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    try:
        db_rolle = Rolle(**rolle.dict())
        db.add(db_rolle)
        db.commit()
        db.refresh(db_rolle)
        return db_rolle
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Rolle bereits vorhanden")

@router.get("/rolle/", response_model=List[RolleResponse])
async def get_rolle_list(
    skip: int = 0,
    limit: int = 100,
    rollentyp: Optional[str] = None,
    ist_aktiv: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Listet alle Rollen mit Filterung"""
    if not check_permission(current_user, "uebergreifende_services", "rolle", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    query = db.query(Rolle)
    if rollentyp:
        query = query.filter(Rolle.rollentyp == rollentyp)
    if ist_aktiv is not None:
        query = query.filter(Rolle.ist_aktiv == ist_aktiv)
    
    return query.offset(skip).limit(limit).all()

@router.get("/rolle/{rolle_id}", response_model=RolleResponse)
async def get_rolle(
    rolle_id: int = Path(..., title="Rolle ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Holt spezifische Rolle"""
    if not check_permission(current_user, "uebergreifende_services", "rolle", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    rolle = db.query(Rolle).filter(Rolle.id == rolle_id).first()
    if not rolle:
        raise HTTPException(status_code=404, detail="Rolle nicht gefunden")
    return rolle

@router.put("/rolle/{rolle_id}", response_model=RolleResponse)
async def update_rolle(
    rolle_id: int = Path(..., title="Rolle ID"),
    rolle_update: RolleUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Aktualisiert Rolle"""
    if not check_permission(current_user, "uebergreifende_services", "rolle", "update"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    rolle = db.query(Rolle).filter(Rolle.id == rolle_id).first()
    if not rolle:
        raise HTTPException(status_code=404, detail="Rolle nicht gefunden")
    
    for field, value in rolle_update.dict(exclude_unset=True).items():
        setattr(rolle, field, value)
    
    db.commit()
    db.refresh(rolle)
    return rolle

@router.delete("/rolle/{rolle_id}", status_code=204)
async def delete_rolle(
    rolle_id: int = Path(..., title="Rolle ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Löscht Rolle"""
    if not check_permission(current_user, "uebergreifende_services", "rolle", "delete"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    rolle = db.query(Rolle).filter(Rolle.id == rolle_id).first()
    if not rolle:
        raise HTTPException(status_code=404, detail="Rolle nicht gefunden")
    
    db.delete(rolle)
    db.commit()

# ==================== Permission Endpoints ====================

@router.post("/permission/", response_model=PermissionResponse)
async def create_permission(
    permission: PermissionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Erstellt neue Permission"""
    if not check_permission(current_user, "uebergreifende_services", "permission", "create"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    try:
        db_permission = Permission(**permission.dict())
        db.add(db_permission)
        db.commit()
        db.refresh(db_permission)
        return db_permission
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Permission bereits vorhanden")

@router.get("/permission/", response_model=List[PermissionResponse])
async def get_permission_list(
    skip: int = 0,
    limit: int = 100,
    modul: Optional[str] = None,
    aktion: Optional[str] = None,
    ist_aktiv: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Listet alle Permissions mit Filterung"""
    if not check_permission(current_user, "uebergreifende_services", "permission", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    query = db.query(Permission)
    if modul:
        query = query.filter(Permission.modul == modul)
    if aktion:
        query = query.filter(Permission.aktion == aktion)
    if ist_aktiv is not None:
        query = query.filter(Permission.ist_aktiv == ist_aktiv)
    
    return query.offset(skip).limit(limit).all()

@router.get("/permission/{permission_id}", response_model=PermissionResponse)
async def get_permission(
    permission_id: int = Path(..., title="Permission ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Holt spezifische Permission"""
    if not check_permission(current_user, "uebergreifende_services", "permission", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    permission = db.query(Permission).filter(Permission.id == permission_id).first()
    if not permission:
        raise HTTPException(status_code=404, detail="Permission nicht gefunden")
    return permission

@router.put("/permission/{permission_id}", response_model=PermissionResponse)
async def update_permission(
    permission_id: int = Path(..., title="Permission ID"),
    permission_update: PermissionUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Aktualisiert Permission"""
    if not check_permission(current_user, "uebergreifende_services", "permission", "update"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    permission = db.query(Permission).filter(Permission.id == permission_id).first()
    if not permission:
        raise HTTPException(status_code=404, detail="Permission nicht gefunden")
    
    for field, value in permission_update.dict(exclude_unset=True).items():
        setattr(permission, field, value)
    
    db.commit()
    db.refresh(permission)
    return permission

@router.delete("/permission/{permission_id}", status_code=204)
async def delete_permission(
    permission_id: int = Path(..., title="Permission ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Löscht Permission"""
    if not check_permission(current_user, "uebergreifende_services", "permission", "delete"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    permission = db.query(Permission).filter(Permission.id == permission_id).first()
    if not permission:
        raise HTTPException(status_code=404, detail="Permission nicht gefunden")
    
    db.delete(permission)
    db.commit()

# ==================== System Einstellung Endpoints ====================

@router.post("/system-einstellung/", response_model=SystemEinstellungResponse)
async def create_system_einstellung(
    einstellung: SystemEinstellungCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Erstellt neue System Einstellung"""
    if not check_permission(current_user, "uebergreifende_services", "system_einstellung", "create"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    try:
        db_einstellung = SystemEinstellung(**einstellung.dict())
        db.add(db_einstellung)
        db.commit()
        db.refresh(db_einstellung)
        return db_einstellung
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="System Einstellung bereits vorhanden")

@router.get("/system-einstellung/", response_model=List[SystemEinstellungResponse])
async def get_system_einstellung_list(
    skip: int = 0,
    limit: int = 100,
    kategorie: Optional[str] = None,
    ist_aktiv: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Listet alle System Einstellungen mit Filterung"""
    if not check_permission(current_user, "uebergreifende_services", "system_einstellung", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    query = db.query(SystemEinstellung)
    if kategorie:
        query = query.filter(SystemEinstellung.kategorie == kategorie)
    if ist_aktiv is not None:
        query = query.filter(SystemEinstellung.ist_aktiv == ist_aktiv)
    
    return query.offset(skip).limit(limit).all()

@router.get("/system-einstellung/{einstellung_id}", response_model=SystemEinstellungResponse)
async def get_system_einstellung(
    einstellung_id: int = Path(..., title="Einstellung ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Holt spezifische System Einstellung"""
    if not check_permission(current_user, "uebergreifende_services", "system_einstellung", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    einstellung = db.query(SystemEinstellung).filter(SystemEinstellung.id == einstellung_id).first()
    if not einstellung:
        raise HTTPException(status_code=404, detail="System Einstellung nicht gefunden")
    return einstellung

@router.put("/system-einstellung/{einstellung_id}", response_model=SystemEinstellungResponse)
async def update_system_einstellung(
    einstellung_id: int = Path(..., title="Einstellung ID"),
    einstellung_update: SystemEinstellungUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Aktualisiert System Einstellung"""
    if not check_permission(current_user, "uebergreifende_services", "system_einstellung", "update"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    einstellung = db.query(SystemEinstellung).filter(SystemEinstellung.id == einstellung_id).first()
    if not einstellung:
        raise HTTPException(status_code=404, detail="System Einstellung nicht gefunden")
    
    for field, value in einstellung_update.dict(exclude_unset=True).items():
        setattr(einstellung, field, value)
    
    db.commit()
    db.refresh(einstellung)
    return einstellung

@router.delete("/system-einstellung/{einstellung_id}", status_code=204)
async def delete_system_einstellung(
    einstellung_id: int = Path(..., title="Einstellung ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Löscht System Einstellung"""
    if not check_permission(current_user, "uebergreifende_services", "system_einstellung", "delete"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    einstellung = db.query(SystemEinstellung).filter(SystemEinstellung.id == einstellung_id).first()
    if not einstellung:
        raise HTTPException(status_code=404, detail="System Einstellung nicht gefunden")
    
    db.delete(einstellung)
    db.commit()

# ==================== Workflow Definition Endpoints ====================

@router.post("/workflow-definition/", response_model=WorkflowDefinitionResponse)
async def create_workflow_definition(
    workflow: WorkflowDefinitionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Erstellt neue Workflow Definition"""
    if not check_permission(current_user, "uebergreifende_services", "workflow_definition", "create"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    try:
        db_workflow = WorkflowDefinition(**workflow.dict())
        db.add(db_workflow)
        db.commit()
        db.refresh(db_workflow)
        return db_workflow
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Workflow Definition konnte nicht erstellt werden")

@router.get("/workflow-definition/", response_model=List[WorkflowDefinitionResponse])
async def get_workflow_definition_list(
    skip: int = 0,
    limit: int = 100,
    workflow_typ: Optional[str] = None,
    status: Optional[str] = None,
    ist_aktiv: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Listet alle Workflow Definitionen mit Filterung"""
    if not check_permission(current_user, "uebergreifende_services", "workflow_definition", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    query = db.query(WorkflowDefinition)
    if workflow_typ:
        query = query.filter(WorkflowDefinition.workflow_typ == workflow_typ)
    if status:
        query = query.filter(WorkflowDefinition.status == status)
    if ist_aktiv is not None:
        query = query.filter(WorkflowDefinition.ist_aktiv == ist_aktiv)
    
    return query.offset(skip).limit(limit).all()

@router.get("/workflow-definition/{workflow_id}", response_model=WorkflowDefinitionResponse)
async def get_workflow_definition(
    workflow_id: int = Path(..., title="Workflow ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Holt spezifische Workflow Definition"""
    if not check_permission(current_user, "uebergreifende_services", "workflow_definition", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    workflow = db.query(WorkflowDefinition).filter(WorkflowDefinition.id == workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow Definition nicht gefunden")
    return workflow

@router.put("/workflow-definition/{workflow_id}", response_model=WorkflowDefinitionResponse)
async def update_workflow_definition(
    workflow_id: int = Path(..., title="Workflow ID"),
    workflow_update: WorkflowDefinitionUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Aktualisiert Workflow Definition"""
    if not check_permission(current_user, "uebergreifende_services", "workflow_definition", "update"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    workflow = db.query(WorkflowDefinition).filter(WorkflowDefinition.id == workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow Definition nicht gefunden")
    
    for field, value in workflow_update.dict(exclude_unset=True).items():
        setattr(workflow, field, value)
    
    db.commit()
    db.refresh(workflow)
    return workflow

@router.delete("/workflow-definition/{workflow_id}", status_code=204)
async def delete_workflow_definition(
    workflow_id: int = Path(..., title="Workflow ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Löscht Workflow Definition"""
    if not check_permission(current_user, "uebergreifende_services", "workflow_definition", "delete"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    workflow = db.query(WorkflowDefinition).filter(WorkflowDefinition.id == workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow Definition nicht gefunden")
    
    db.delete(workflow)
    db.commit()

# ==================== Dokument Endpoints ====================

@router.post("/dokument/", response_model=DokumentResponse)
async def create_dokument(
    dokument: DokumentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Erstellt neues Dokument"""
    if not check_permission(current_user, "uebergreifende_services", "dokument", "create"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    try:
        db_dokument = Dokument(**dokument.dict())
        db.add(db_dokument)
        db.commit()
        db.refresh(db_dokument)
        return db_dokument
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Dokument konnte nicht erstellt werden")

@router.get("/dokument/", response_model=List[DokumentResponse])
async def get_dokument_list(
    skip: int = 0,
    limit: int = 100,
    dokumenttyp: Optional[str] = None,
    kategorie: Optional[str] = None,
    ersteller_id: Optional[int] = None,
    von_datum: Optional[date] = None,
    bis_datum: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Listet alle Dokumente mit Filterung"""
    if not check_permission(current_user, "uebergreifende_services", "dokument", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    query = db.query(Dokument)
    if dokumenttyp:
        query = query.filter(Dokument.dokumenttyp == dokumenttyp)
    if kategorie:
        query = query.filter(Dokument.kategorie == kategorie)
    if ersteller_id:
        query = query.filter(Dokument.ersteller_id == ersteller_id)
    if von_datum:
        query = query.filter(Dokument.erstellungsdatum >= von_datum)
    if bis_datum:
        query = query.filter(Dokument.erstellungsdatum <= bis_datum)
    
    return query.offset(skip).limit(limit).all()

@router.get("/dokument/{dokument_id}", response_model=DokumentResponse)
async def get_dokument(
    dokument_id: int = Path(..., title="Dokument ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Holt spezifisches Dokument"""
    if not check_permission(current_user, "uebergreifende_services", "dokument", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    dokument = db.query(Dokument).filter(Dokument.id == dokument_id).first()
    if not dokument:
        raise HTTPException(status_code=404, detail="Dokument nicht gefunden")
    return dokument

@router.put("/dokument/{dokument_id}", response_model=DokumentResponse)
async def update_dokument(
    dokument_id: int = Path(..., title="Dokument ID"),
    dokument_update: DokumentUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Aktualisiert Dokument"""
    if not check_permission(current_user, "uebergreifende_services", "dokument", "update"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    dokument = db.query(Dokument).filter(Dokument.id == dokument_id).first()
    if not dokument:
        raise HTTPException(status_code=404, detail="Dokument nicht gefunden")
    
    for field, value in dokument_update.dict(exclude_unset=True).items():
        setattr(dokument, field, value)
    
    db.commit()
    db.refresh(dokument)
    return dokument

@router.delete("/dokument/{dokument_id}", status_code=204)
async def delete_dokument(
    dokument_id: int = Path(..., title="Dokument ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Löscht Dokument"""
    if not check_permission(current_user, "uebergreifende_services", "dokument", "delete"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    dokument = db.query(Dokument).filter(Dokument.id == dokument_id).first()
    if not dokument:
        raise HTTPException(status_code=404, detail="Dokument nicht gefunden")
    
    db.delete(dokument)
    db.commit()

# ==================== Monitoring Alert Endpoints ====================

@router.post("/monitoring-alert/", response_model=MonitoringAlertResponse)
async def create_monitoring_alert(
    alert: MonitoringAlertCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Erstellt neuen Monitoring Alert"""
    if not check_permission(current_user, "uebergreifende_services", "monitoring_alert", "create"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    try:
        db_alert = MonitoringAlert(**alert.dict())
        db.add(db_alert)
        db.commit()
        db.refresh(db_alert)
        return db_alert
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Monitoring Alert konnte nicht erstellt werden")

@router.get("/monitoring-alert/", response_model=List[MonitoringAlertResponse])
async def get_monitoring_alert_list(
    skip: int = 0,
    limit: int = 100,
    alert_typ: Optional[str] = None,
    schweregrad: Optional[str] = None,
    status: Optional[str] = None,
    von_datum: Optional[date] = None,
    bis_datum: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Listet alle Monitoring Alerts mit Filterung"""
    if not check_permission(current_user, "uebergreifende_services", "monitoring_alert", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    query = db.query(MonitoringAlert)
    if alert_typ:
        query = query.filter(MonitoringAlert.alert_typ == alert_typ)
    if schweregrad:
        query = query.filter(MonitoringAlert.schweregrad == schweregrad)
    if status:
        query = query.filter(MonitoringAlert.status == status)
    if von_datum:
        query = query.filter(MonitoringAlert.erstellungsdatum >= von_datum)
    if bis_datum:
        query = query.filter(MonitoringAlert.erstellungsdatum <= bis_datum)
    
    return query.offset(skip).limit(limit).all()

@router.get("/monitoring-alert/{alert_id}", response_model=MonitoringAlertResponse)
async def get_monitoring_alert(
    alert_id: int = Path(..., title="Alert ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Holt spezifischen Monitoring Alert"""
    if not check_permission(current_user, "uebergreifende_services", "monitoring_alert", "read"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    alert = db.query(MonitoringAlert).filter(MonitoringAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Monitoring Alert nicht gefunden")
    return alert

@router.put("/monitoring-alert/{alert_id}", response_model=MonitoringAlertResponse)
async def update_monitoring_alert(
    alert_id: int = Path(..., title="Alert ID"),
    alert_update: MonitoringAlertUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Aktualisiert Monitoring Alert"""
    if not check_permission(current_user, "uebergreifende_services", "monitoring_alert", "update"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    alert = db.query(MonitoringAlert).filter(MonitoringAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Monitoring Alert nicht gefunden")
    
    for field, value in alert_update.dict(exclude_unset=True).items():
        setattr(alert, field, value)
    
    db.commit()
    db.refresh(alert)
    return alert

@router.delete("/monitoring-alert/{alert_id}", status_code=204)
async def delete_monitoring_alert(
    alert_id: int = Path(..., title="Alert ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Löscht Monitoring Alert"""
    if not check_permission(current_user, "uebergreifende_services", "monitoring_alert", "delete"):
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    alert = db.query(MonitoringAlert).filter(MonitoringAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Monitoring Alert nicht gefunden")
    
    db.delete(alert)
    db.commit()

# ==================== Weitere Übergreifende Services Endpoints ====================

# BenutzerRolle, RollenPermission, BenutzerAktivitaet, BenutzerSession,
# ModulEinstellung, WorkflowExecution, WorkflowExecutionStep,
# BerichtDefinition, BerichtExecution, AnalyticsEvent,
# Integration, IntegrationSyncLog, Backup, BackupExecution,
# MonitoringMetric, MonitoringAlertTrigger, APIEndpoint, APIKey, APIUsageLog,
# DokumentVersion, DokumentShare werden in separaten Dateien implementiert

logger = logging.getLogger(__name__) 