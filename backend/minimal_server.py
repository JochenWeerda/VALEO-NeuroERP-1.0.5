"""
Minimaler FastAPI-Server für das ERP-System.

Dieser Server dient als Fallback, wenn der modulare Server aufgrund von
Abhängigkeitsproblemen nicht starten kann. Er enthält nur grundlegende
Endpunkte ohne externe Abhängigkeiten.
"""

import os
import logging
import time
import platform
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

# Konfiguriere Logger
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger("minimal_server")

# Erstelle FastAPI-App
app = FastAPI(title="ERP-System Minimal API", version="1.0.0")

# CORS-Middleware für Frontend-Integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Für Produktion einschränken
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Einfaches Datenmodell für Nachrichten
class Message(BaseModel):
    """Einfaches Nachrichtenmodell."""
    content: str

# Grundlegende Endpunkte

@app.get("/")
async def root():
    """Root-Endpunkt mit Informationen zum API-Server."""
    return {
        "name": "ERP-System Minimal API",
        "version": "1.0.0",
        "description": "Minimale API für ein ERP-System ohne externe Abhängigkeiten",
        "endpoints": [
            "/health - Health-Check",
            "/echo - Echo-Endpunkt",
            "/system-info - Systeminformationen",
            "/docs - API-Dokumentation"
        ]
    }

@app.get("/health")
async def health_check():
    """Einfacher Health-Check-Endpunkt."""
    return {"status": "healthy"}

@app.post("/echo")
async def echo(message: Message):
    """Einfacher Echo-Endpunkt."""
    return {
        "status": "success",
        "echo": message.content,
        "timestamp": time.time()
    }

@app.get("/system-info")
async def system_info():
    """Liefert Informationen über das System."""
    return {
        "platform": platform.system(),
        "platform_version": platform.version(),
        "python_version": platform.python_version(),
        "processor": platform.processor(),
        "hostname": platform.node(),
        "time": time.time(),
        "timezone": time.tzname
    }

@app.get("/minimal-task")
async def minimal_task():
    """
    Simuliert einen asynchronen Task ohne Celery-Abhängigkeit.
    
    In einer vollständigen Implementierung würde dieser Endpunkt
    einen Task an Celery senden.
    """
    # Simuliere Verarbeitung
    import random
    import time
    
    # Zufällige Task-ID generieren
    task_id = f"task_{int(time.time())}_{random.randint(1000, 9999)}"
    
    # Simuliere erfolgreiche Task-Erstellung
    return {
        "task_id": task_id,
        "status": "PENDING",
        "created_at": time.time(),
        "message": "Task wurde simuliert (keine Celery-Integration)"
    }

@app.get("/minimal-task/{task_id}")
async def minimal_task_status(task_id: str):
    """
    Simuliert den Status eines asynchronen Tasks ohne Celery-Abhängigkeit.
    
    In einer vollständigen Implementierung würde dieser Endpunkt
    den Status von Celery abrufen.
    """
    # Simuliere Task-Status basierend auf Task-ID
    import random
    
    # Status basierend auf letzter Stelle der Task-ID
    last_digit = int(task_id[-1]) if task_id[-1].isdigit() else 0
    
    if last_digit < 3:
        status = "SUCCESS"
        result = {"value": random.randint(100, 999), "completed": True}
    elif last_digit < 7:
        status = "PENDING"
        result = {"progress": random.randint(10, 90), "completed": False}
    else:
        status = "FAILURE"
        result = {"error": "Simulierter Fehler", "completed": False}
    
    return {
        "task_id": task_id,
        "status": status,
        "result": result,
        "checked_at": time.time()
    }

if __name__ == "__main__":
    import uvicorn
    # Standardport ist 8001, um Konflikte mit dem modularen Server zu vermeiden
    port = int(os.getenv("MINIMAL_API_PORT", "8001"))
    logger.info(f"Starte minimalen Server auf Port {port}")
    uvicorn.run("minimal_server:app", host="0.0.0.0", port=port, reload=True) 