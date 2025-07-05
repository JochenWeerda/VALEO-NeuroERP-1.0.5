"""
API-Endpunkte für Bericht-Tasks über Celery.

Dieses Modul definiert FastAPI-Endpunkte zum Ausführen
und Überwachen von Report-Tasks mit Celery.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from datetime import datetime

from backend.tasks.reports import (
    generate_financial_report,
    generate_inventory_report,
    refresh_materialized_views
)

router = APIRouter(prefix="/reports", tags=["Reports"])

class ReportRequest(BaseModel):
    """Anforderungsmodell für Berichte."""
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    format: str = "pdf"
    parameters: Optional[Dict[str, Any]] = None

class TaskResponse(BaseModel):
    """Antwortmodell für Task-Informationen."""
    task_id: str
    status: str
    
@router.post("/financial", response_model=TaskResponse)
async def run_financial_report(request: ReportRequest):
    """
    Führt einen Finanzbericht-Task aus.
    
    Args:
        request: Die Berichtsanforderung
        
    Returns:
        TaskResponse: Die Task-ID und der Status
    """
    try:
        task = generate_financial_report.delay(
            start_date=request.start_date,
            end_date=request.end_date,
            format=request.format,
            parameters=request.parameters
        )
        return TaskResponse(task_id=task.id, status="PENDING")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler beim Ausführen des Finanzberichts: {str(e)}")

@router.post("/inventory", response_model=TaskResponse)
async def run_inventory_report(request: ReportRequest):
    """
    Führt einen Lagerbericht-Task aus.
    
    Args:
        request: Die Berichtsanforderung
        
    Returns:
        TaskResponse: Die Task-ID und der Status
    """
    try:
        task = generate_inventory_report.delay(
            start_date=request.start_date,
            end_date=request.end_date,
            format=request.format,
            parameters=request.parameters
        )
        return TaskResponse(task_id=task.id, status="PENDING")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler beim Ausführen des Lagerberichts: {str(e)}")

@router.post("/refresh-views", response_model=TaskResponse)
async def run_refresh_materialized_views():
    """
    Führt einen Task zum Aktualisieren der materialisierten Ansichten aus.
    
    Returns:
        TaskResponse: Die Task-ID und der Status
    """
    try:
        task = refresh_materialized_views.delay()
        return TaskResponse(task_id=task.id, status="PENDING")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler beim Aktualisieren der materialisierten Ansichten: {str(e)}")

@router.get("/status/{task_id}", response_model=Dict[str, Any])
async def get_report_task_status(task_id: str):
    """
    Ruft den Status eines Report-Tasks ab.
    
    Args:
        task_id: Die ID des Tasks
        
    Returns:
        Dict: Status-Informationen
    """
    try:
        from celery.result import AsyncResult
        
        task_result = AsyncResult(task_id)
        
        result = {
            "task_id": task_id,
            "status": task_result.status,
        }
        
        if task_result.ready():
            if task_result.successful():
                result["result"] = task_result.get()
            else:
                result["error"] = str(task_result.result)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler beim Abrufen des Task-Status: {str(e)}") 