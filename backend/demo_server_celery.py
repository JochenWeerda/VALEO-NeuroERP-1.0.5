"""
Erweiterter Demo-Server mit Celery-Integration.

Dieser Server ist ein minimaler FastAPI-Server mit Celery-Funktionalität,
der verwendet werden kann, wenn der modulare Server Probleme verursacht.
"""

import os
import time
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, Optional
from pydantic import BaseModel

# Konfiguriere Logger
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger("demo_server_celery")

# Erstelle FastAPI-App
app = FastAPI(title="ERP-System Demo API mit Celery", version="1.0.0")

# CORS-Middleware hinzufügen
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Für Produktion einschränken
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Celery-Integration
try:
    from backend.tasks.celery_app import health_check
    from celery.result import AsyncResult
    CELERY_AVAILABLE = True
    logger.info("Celery erfolgreich importiert")
except Exception as e:
    CELERY_AVAILABLE = False
    logger.warning(f"Celery konnte nicht importiert werden: {e}")
    logger.warning("Server läuft im eingeschränkten Modus ohne Celery-Funktionalität")

# Datenmodelle
class Message(BaseModel):
    """Einfaches Nachrichtenmodell."""
    content: str

class TaskRequest(BaseModel):
    """Anforderungsmodell für Tasks."""
    name: str
    parameters: Optional[Dict[str, Any]] = None

# Grundlegende Endpunkte
@app.get("/")
async def root():
    """Root-Endpunkt mit Informationen zum API-Server."""
    celery_status = "verfügbar" if CELERY_AVAILABLE else "nicht verfügbar"
    return {
        "name": "ERP-System Demo API mit Celery",
        "version": "1.0.0",
        "description": "Demo-API für ein ERP-System mit optionaler Celery-Integration",
        "celery_status": celery_status,
        "endpoints": [
            "/health - Health-Check",
            "/echo - Echo-Endpunkt",
            "/tasks/submit - Task-Submission (benötigt Celery)",
            "/tasks/status/{task_id} - Task-Status (benötigt Celery)",
            "/docs - API-Dokumentation"
        ]
    }

@app.get("/health")
async def health():
    """Health-Check-Endpunkt."""
    celery_status = "verfügbar" if CELERY_AVAILABLE else "nicht verfügbar"
    return {
        "status": "healthy",
        "celery": celery_status,
        "timestamp": time.time()
    }

@app.post("/echo")
async def echo(message: Message):
    """Echo-Endpunkt."""
    return {
        "echo": message.content,
        "timestamp": time.time()
    }

# Celery-spezifische Endpunkte
@app.post("/tasks/submit")
async def submit_task(request: TaskRequest):
    """
    Sendet einen Task an Celery.
    
    In der aktuellen Implementation wird nur der health_check-Task unterstützt.
    
    Args:
        request: Die Task-Anforderung
        
    Returns:
        Dict: Die Task-ID und der Status
    """
    if not CELERY_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Celery ist nicht verfügbar. Der Server läuft im eingeschränkten Modus."
        )
    
    try:
        if request.name == "health_check":
            task = health_check.delay()
            return {"task_id": task.id, "status": "PENDING"}
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Task '{request.name}' wird nicht unterstützt. Aktuell wird nur 'health_check' unterstützt."
            )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Ausführen des Tasks: {str(e)}"
        )

@app.get("/tasks/status/{task_id}")
async def get_task_status(task_id: str):
    """
    Ruft den Status eines Tasks ab.
    
    Args:
        task_id: Die ID des Tasks
        
    Returns:
        Dict: Status-Informationen
    """
    if not CELERY_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Celery ist nicht verfügbar. Der Server läuft im eingeschränkten Modus."
        )
    
    try:
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
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Abrufen des Task-Status: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    # Standardport ist 8003, um Konflikte mit anderen Servern zu vermeiden
    port = int(os.getenv("DEMO_CELERY_API_PORT", "8003"))
    logger.info(f"Starte Demo-Server mit Celery-Integration auf Port {port}")
    uvicorn.run("demo_server_celery:app", host="0.0.0.0", port=port, reload=True) 