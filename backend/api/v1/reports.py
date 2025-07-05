"""
API-Endpunkte für Berichte im VALEO-NeuroERP-System.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session

from backend.db.database import get_db
from backend.models.reports import Report, ReportDistribution, ReportSchedule, ReportFile
from backend.services.report_service import ReportService
from backend.schemas.reports import (
    ReportCreate,
    ReportResponse,
    ReportList,
    ReportGenerateRequest,
    ReportGenerateResponse,
    ReportDistributeRequest,
    ReportDistributeResponse,
    ReportScheduleCreate,
    ReportScheduleResponse,
    SystemStatusResponse
)
from backend.services.system_monitor_service import SystemMonitorService

router = APIRouter(
    prefix="/reports",
    tags=["reports"],
    responses={404: {"description": "Nicht gefunden"}},
)

@router.get("/system-status", response_model=SystemStatusResponse)
def get_system_status(
    db: Session = Depends(get_db),
):
    """Ruft den aktuellen Systemstatus ab und zeigt Warnungen bei kritischen Zuständen."""
    monitor_service = SystemMonitorService(db)
    return monitor_service.get_system_status()

@router.post("/", response_model=ReportResponse)
def create_report(
    report_data: ReportCreate,
    db: Session = Depends(get_db)
):
    """
    Erstellt einen neuen Bericht.
    """
    report_service = ReportService(db)
    return report_service.create_report(report_data)

@router.get("/", response_model=ReportList)
def get_reports(
    report_type: Optional[str] = None,
    created_by: Optional[int] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """
    Holt eine Liste von Berichten.
    """
    try:
        reports = ReportService.get_reports(
            db=db,
            report_type=report_type,
            created_by=created_by,
            skip=skip,
            limit=limit
        )
        
        return {
            "total": len(reports),
            "items": reports
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Fehler beim Abrufen der Berichte: {str(e)}")

@router.get("/{report_id}", response_model=ReportResponse)
def get_report(
    report_id: int,
    db: Session = Depends(get_db)
):
    """
    Holt einen Bericht anhand seiner ID.
    """
    report_service = ReportService(db)
    report = report_service.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Bericht nicht gefunden")
    return report

@router.post("/{report_id}/generate", response_model=Dict[str, Any])
def generate_report(
    report_id: int,
    parameters: Optional[Dict[str, Any]] = None,
    db: Session = Depends(get_db),
):
    """Generiert einen Bericht asynchron."""
    report_service = ReportService(db)
    try:
        task_id = report_service.generate_report(report_id, parameters)
        return {"task_id": task_id, "status": "pending"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/{report_id}/distribute", response_model=ReportDistributeResponse)
def distribute_report(
    report_id: int,
    request: ReportDistributeRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Verteilt einen Bericht an die angegebenen Empfänger.
    """
    report = ReportService.get_report(db=db, report_id=report_id)
    if not report:
        raise HTTPException(status_code=404, detail=f"Bericht mit ID {report_id} nicht gefunden")
    
    if not report.file_path:
        raise HTTPException(status_code=400, detail=f"Bericht wurde noch nicht generiert")
    
    try:
        # Bericht im Hintergrund verteilen
        background_tasks.add_task(
            ReportService.distribute_report,
            db=db,
            report_id=report_id,
            recipients=request.recipients,
            message=request.message,
            cc=request.cc
        )
        
        return {
            "status": "pending",
            "message": f"Bericht wird verteilt: {report.name}",
            "report_id": report_id,
            "recipients_count": len(request.recipients)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Fehler bei der Berichtsverteilung: {str(e)}")

@router.post("/{report_id}/schedule", response_model=ReportScheduleResponse)
def schedule_report(
    report_id: int,
    request: ReportScheduleCreate,
    db: Session = Depends(get_db)
):
    """
    Plant einen wiederkehrenden Bericht.
    """
    report = ReportService.get_report(db=db, report_id=report_id)
    if not report:
        raise HTTPException(status_code=404, detail=f"Bericht mit ID {report_id} nicht gefunden")
    
    try:
        schedule = ReportService.schedule_report(
            db=db,
            report_id=report_id,
            name=request.name,
            cron_expression=request.cron_expression,
            recipients=request.recipients,
            parameters=request.parameters,
            is_active=request.is_active
        )
        
        return schedule
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Fehler beim Planen des Berichts: {str(e)}")

@router.get("/{report_id}/schedules", response_model=List[ReportScheduleResponse])
def get_report_schedules(
    report_id: int,
    db: Session = Depends(get_db)
):
    """
    Holt alle Zeitpläne für einen Bericht.
    """
    report = ReportService.get_report(db=db, report_id=report_id)
    if not report:
        raise HTTPException(status_code=404, detail=f"Bericht mit ID {report_id} nicht gefunden")
    
    return report.schedules 