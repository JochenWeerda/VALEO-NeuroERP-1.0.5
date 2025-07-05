"""
Erweiterter Demo-Server mit Celery-Integration.

Dieser Server ist ein umfassenderer FastAPI-Server mit Celery-Funktionalität,
der alle implementierten Task-Typen nutzt und verbesserte Fehlerbehandlung bietet.
"""

import os
import time
import logging
import json
import uuid
import random
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Union
from pydantic import BaseModel, Field
import asyncio

from fastapi import FastAPI, HTTPException, BackgroundTasks, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Konfiguriere Logger
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger("demo_server_celery_enhanced")

# Erstelle FastAPI-App
app = FastAPI(
    title="ERP-System Demo API mit erweiterter Celery-Integration",
    version="1.1.0",
    description="Demonstrationsserver für das ERP-System mit voller Celery-Unterstützung"
)

# CORS-Middleware für Frontend-Integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In Produktion einschränken
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Task-Status-Tracker (im Arbeitsspeicher - würde in Produktion in Redis gespeichert)
task_store = {}

# Task-Statistiken
task_stats = {
    "total": 0,
    "success": 0,
    "failed": 0,
    "pending": 0,
    "by_type": {}
}

# Datenmodelle
class TaskRequest(BaseModel):
    """Basismodell für Task-Anfragen."""
    task_type: str
    parameters: Dict[str, Any] = {}

class ReportTaskRequest(TaskRequest):
    """Modell für Report-Task-Anfragen."""
    task_type: str = "report"
    report_type: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    format: str = "pdf"

class ImportTaskRequest(TaskRequest):
    """Modell für Import-Task-Anfragen."""
    task_type: str = "import"
    source_type: str
    file_path: Optional[str] = None
    url: Optional[str] = None
    options: Dict[str, Any] = {}

class ExportTaskRequest(TaskRequest):
    """Modell für Export-Task-Anfragen."""
    task_type: str = "export"
    export_type: str
    data_filter: Dict[str, Any] = {}
    format: str = "csv"
    destination: Optional[str] = None

class OptimizationTaskRequest(TaskRequest):
    """Modell für Optimierungs-Task-Anfragen."""
    task_type: str = "optimization"
    target: str
    options: Dict[str, Any] = {}
    priority: int = 5

class TaskStatus(BaseModel):
    """Modell für Task-Status-Informationen."""
    task_id: str
    status: str
    task_type: str
    created_at: datetime
    updated_at: datetime
    progress: Optional[float] = None
    result: Optional[Any] = None
    error: Optional[str] = None

class TaskStatistics(BaseModel):
    """Modell für Task-Statistiken."""
    total: int
    success: int
    failed: int
    pending: int
    by_type: Dict[str, int]

# Mock-Implementierungen für Celery-Tasks
async def mock_task_execution(task_id: str, task_type: str, delay: int = None):
    """Simuliert die Ausführung eines Celery-Tasks."""
    if task_id not in task_store:
        return
    
    # Bestimme die Ausführungszeit basierend auf dem Task-Typ
    if delay is None:
        if task_type == "report":
            delay = random.randint(5, 15)
        elif task_type == "import":
            delay = random.randint(10, 30)
        elif task_type == "export":
            delay = random.randint(3, 10)
        elif task_type == "optimization":
            delay = random.randint(20, 60)
        else:
            delay = random.randint(2, 8)
    
    # Aktualisiere die Statistiken
    if task_type not in task_stats["by_type"]:
        task_stats["by_type"][task_type] = 0
    task_stats["by_type"][task_type] += 1
    task_stats["total"] += 1
    task_stats["pending"] += 1
    
    # Simuliere Fortschritt
    task_store[task_id]["status"] = "running"
    task_store[task_id]["updated_at"] = datetime.now()
    
    steps = 10
    for i in range(steps):
        # Simuliere 10% Fehlerrate
        if i == steps - 1 and random.random() < 0.1:
            task_store[task_id]["status"] = "failed"
            task_store[task_id]["error"] = f"Simulierter Fehler bei der Ausführung von {task_type}-Task"
            task_store[task_id]["updated_at"] = datetime.now()
            task_stats["failed"] += 1
            task_stats["pending"] -= 1
            return
        
        # Aktualisiere den Fortschritt
        progress = (i + 1) / steps * 100
        task_store[task_id]["progress"] = progress
        task_store[task_id]["updated_at"] = datetime.now()
        
        # Warte einen Teil der Gesamtzeit
        await asyncio.sleep(delay / steps)
    
    # Task erfolgreich
    result = None
    if task_type == "report":
        result = {"url": f"https://example.com/reports/{task_id}.pdf", "size": random.randint(100, 5000)}
    elif task_type == "import":
        result = {"records_processed": random.randint(50, 5000), "success_rate": random.uniform(0.9, 1.0)}
    elif task_type == "export":
        result = {"url": f"https://example.com/exports/{task_id}.csv", "record_count": random.randint(100, 10000)}
    elif task_type == "optimization":
        result = {"improvement": f"{random.uniform(5, 30):.2f}%", "details": {"before": random.uniform(1, 10), "after": random.uniform(0.5, 5)}}
    
    task_store[task_id]["status"] = "completed"
    task_store[task_id]["result"] = result
    task_store[task_id]["updated_at"] = datetime.now()
    task_stats["success"] += 1
    task_stats["pending"] -= 1

# API-Endpunkte
@app.get("/")
async def root():
    """Root-Endpunkt."""
    return {"message": "ERP-System Demo API mit erweiterter Celery-Integration", "version": "1.1.0"}

@app.get("/health")
async def health_check():
    """Gesundheitscheck-Endpunkt."""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/tasks", response_model=TaskStatus)
async def create_task(request: TaskRequest, background_tasks: BackgroundTasks):
    """Erstellt einen neuen Task."""
    # Erstelle eine Task-ID
    task_id = str(uuid.uuid4())
    
    # Erstelle den Task im Store
    task_store[task_id] = {
        "task_id": task_id,
        "status": "pending",
        "task_type": request.task_type,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "parameters": request.parameters
    }
    
    # Starte die Task-Ausführung im Hintergrund
    background_tasks.add_task(mock_task_execution, task_id, request.task_type)
    
    return TaskStatus(**task_store[task_id])

@app.post("/api/reports", response_model=TaskStatus)
async def create_report_task(request: ReportTaskRequest, background_tasks: BackgroundTasks):
    """Erstellt einen Report-Task."""
    # Erweiterte Parameter für den Report
    parameters = {
        "report_type": request.report_type,
        "start_date": request.start_date,
        "end_date": request.end_date,
        "format": request.format,
        **request.parameters
    }
    
    # Erstelle einen Task vom Typ "report"
    task_request = TaskRequest(task_type="report", parameters=parameters)
    return await create_task(task_request, background_tasks)

@app.post("/api/imports", response_model=TaskStatus)
async def create_import_task(request: ImportTaskRequest, background_tasks: BackgroundTasks):
    """Erstellt einen Import-Task."""
    # Erweiterte Parameter für den Import
    parameters = {
        "source_type": request.source_type,
        "file_path": request.file_path,
        "url": request.url,
        "options": request.options
    }
    
    # Erstelle einen Task vom Typ "import"
    task_request = TaskRequest(task_type="import", parameters=parameters)
    return await create_task(task_request, background_tasks)

@app.post("/api/exports", response_model=TaskStatus)
async def create_export_task(request: ExportTaskRequest, background_tasks: BackgroundTasks):
    """Erstellt einen Export-Task."""
    # Erweiterte Parameter für den Export
    parameters = {
        "export_type": request.export_type,
        "data_filter": request.data_filter,
        "format": request.format,
        "destination": request.destination
    }
    
    # Erstelle einen Task vom Typ "export"
    task_request = TaskRequest(task_type="export", parameters=parameters)
    return await create_task(task_request, background_tasks)

@app.post("/api/optimizations", response_model=TaskStatus)
async def create_optimization_task(request: OptimizationTaskRequest, background_tasks: BackgroundTasks):
    """Erstellt einen Optimierungs-Task."""
    # Erweiterte Parameter für die Optimierung
    parameters = {
        "target": request.target,
        "options": request.options,
        "priority": request.priority
    }
    
    # Erstelle einen Task vom Typ "optimization"
    task_request = TaskRequest(task_type="optimization", parameters=parameters)
    return await create_task(task_request, background_tasks)

@app.get("/api/tasks/{task_id}", response_model=TaskStatus)
async def get_task_status(task_id: str):
    """Gibt den Status eines Tasks zurück."""
    if task_id not in task_store:
        raise HTTPException(status_code=404, detail="Task nicht gefunden")
    
    return TaskStatus(**task_store[task_id])

@app.get("/api/tasks", response_model=List[TaskStatus])
async def list_tasks(
    status: Optional[str] = None,
    task_type: Optional[str] = None,
    limit: int = 10,
    offset: int = 0
):
    """Listet alle Tasks auf."""
    filtered_tasks = []
    
    for task in task_store.values():
        if status and task["status"] != status:
            continue
        if task_type and task["task_type"] != task_type:
            continue
        filtered_tasks.append(TaskStatus(**task))
    
    # Sortiere nach Erstellungsdatum (neueste zuerst)
    filtered_tasks.sort(key=lambda x: x.created_at, reverse=True)
    
    # Wende Paginierung an
    paginated_tasks = filtered_tasks[offset:offset + limit]
    
    return paginated_tasks

@app.get("/api/stats", response_model=TaskStatistics)
async def get_task_statistics():
    """Gibt Statistiken über die Tasks zurück."""
    return TaskStatistics(**task_stats)

@app.delete("/api/tasks/{task_id}", status_code=204)
async def cancel_task(task_id: str):
    """Bricht einen Task ab."""
    if task_id not in task_store:
        raise HTTPException(status_code=404, detail="Task nicht gefunden")
    
    task = task_store[task_id]
    if task["status"] in ["completed", "failed"]:
        raise HTTPException(status_code=400, detail=f"Task kann nicht abgebrochen werden, aktueller Status: {task['status']}")
    
    # Aktualisiere den Task-Status
    task["status"] = "cancelled"
    task["updated_at"] = datetime.now()
    
    # Aktualisiere die Statistiken
    task_stats["pending"] -= 1
    
    return Response(status_code=204)

@app.delete("/api/tasks", status_code=204)
async def clear_completed_tasks():
    """Löscht alle abgeschlossenen Tasks."""
    to_delete = []
    
    for task_id, task in task_store.items():
        if task["status"] in ["completed", "failed", "cancelled"]:
            to_delete.append(task_id)
    
    for task_id in to_delete:
        del task_store[task_id]
    
    return Response(status_code=204)

# Middleware für Fehlerprotokollierung
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Protokolliert alle Anfragen und Fehler."""
    start_time = time.time()
    
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        logger.info(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.4f}s")
        return response
    except Exception as e:
        process_time = time.time() - start_time
        logger.error(f"{request.method} {request.url.path} - Fehler: {str(e)} - {process_time:.4f}s")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Interner Serverfehler", "error": str(e)},
        )

# Beispiel-Endpunkt für das Testen der Fehlerbehandlung
@app.get("/api/test-error")
async def test_error():
    """Testet die Fehlerbehandlung."""
    raise ValueError("Dies ist ein simulierter Fehler zum Testen der Fehlerbehandlung")

# Ausführung mit uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("demo_server_celery_enhanced:app", host="0.0.0.0", port=8003, reload=True)