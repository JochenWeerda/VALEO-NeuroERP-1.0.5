"""
API-Endpunkte für asynchrone Tasks über Celery.

Dieses Modul definiert FastAPI-Endpunkte zum Ausführen
und Überwachen von Celery-Tasks.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from backend.tasks.celery_app import health_check

router = APIRouter(prefix="/tasks", tags=["Tasks"])

class TaskResponse(BaseModel):
    """Antwortmodell für Task-Informationen."""
    task_id: str
    status: str
    
class EchoRequest(BaseModel):
    """Einfaches Anforderungsmodell für den Echo-Endpunkt."""
    message: str

@router.get("/health-check", response_model=TaskResponse)
async def run_health_check():
    """
    Führt einen Health-Check-Task aus, um die Celery-Konfiguration zu testen.
    
    Returns:
        TaskResponse: Die Task-ID und der Status
    """
    try:
        task = health_check.delay()
        return TaskResponse(task_id=task.id, status="PENDING")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler beim Ausführen des Health-Checks: {str(e)}")

@router.post("/echo", response_model=Dict[str, Any])
async def echo(request: EchoRequest):
    """
    Einfacher Echo-Endpunkt zum Testen der API ohne Celery-Abhängigkeit.
    
    Args:
        request: Die Echo-Anforderung
        
    Returns:
        Dict: Die Echo-Antwort
    """
    return {
        "status": "success",
        "echo": request.message,
        "service": "Task API",
        "version": "1.0.0"
    }

@router.get("/status/{task_id}", response_model=Dict[str, Any])
async def get_task_status(task_id: str):
    """
    Ruft den Status eines Tasks ab.
    
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

@router.get("/simple-health", response_model=Dict[str, Any])
async def simple_health():
    """
    Einfacher Health-Check-Endpunkt ohne Celery-Abhängigkeit.
    
    Returns:
        Dict: Status-Informationen
    """
    import platform
    import time
    
    return {
        "status": "healthy",
        "service": "Task API",
        "timestamp": time.time(),
        "python_version": platform.python_version(),
        "system": platform.system()
    } 