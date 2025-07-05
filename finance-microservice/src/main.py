#!/usr/bin/env python
"""
Finance-Microservice für das ERP-System
Hauptmodul für den Start des Dienstes
"""

import os
import sys
import logging
import asyncio
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import psutil
import time
from datetime import datetime, timedelta

# Lokale Module importieren
from core.config import settings
# Nur das System-Modul importieren, LLM weglassen, um Abhängigkeiten zu reduzieren
from api.v1 import system
from utils.register_with_observer import register_service, get_service_data

# Logging konfigurieren
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("finance_service.log")
    ]
)
logger = logging.getLogger("finance_service")

# Globale Metriken
start_time = time.time()
request_count = 0
error_count = 0
request_times = []

# FastAPI-App erstellen
app = FastAPI(
    title="Finance-Microservice",
    description="Microservice für Finanz- und Buchhaltungsprozesse",
    version="0.1.0"
)

# CORS-Middleware hinzufügen
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Für Produktion einschränken
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router registrieren
# Nur den System-Router registrieren
app.include_router(system.router, prefix="/api/v1/finanzen", tags=["System"])

# Middleware für Metriken
@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    global request_count, error_count, request_times
    
    # Startzeit des Requests
    start_time = time.time()
    
    try:
        # Request weiterleiten
        response = await call_next(request)
        
        # Erfolgreichen Request zählen
        request_count += 1
        
        # Anforderungszeit messen
        request_time = time.time() - start_time
        request_times.append(request_time)
        
        # Nur die letzten 1000 Anforderungszeiten speichern
        if len(request_times) > 1000:
            request_times = request_times[-1000:]
        
        return response
    except Exception as e:
        # Fehler zählen
        error_count += 1
        logger.error(f"Fehler bei Anfrage {request.url}: {str(e)}")
        
        # Fehler weitergeben
        raise e

@app.get("/health")
async def health_check():
    """
    Endpoint für Gesundheitsüberprüfung und Metriken.
    Gibt den Status des Service und grundlegende Metriken zurück.
    """
    global start_time, request_count, error_count, request_times
    
    # Systemmetriken abrufen
    cpu_percent = psutil.cpu_percent(interval=0.1)
    memory_info = psutil.virtual_memory()
    
    # Durchschnittliche Antwortzeit berechnen
    avg_response_time = sum(request_times) / len(request_times) if request_times else 0
    
    # Fehlerrate berechnen
    error_rate = (error_count / request_count) * 100 if request_count > 0 else 0
    
    # Laufzeit berechnen
    uptime_seconds = time.time() - start_time
    uptime = str(timedelta(seconds=int(uptime_seconds)))
    
    # Metriken zusammenstellen
    metrics = {
        "status": "healthy",
        "uptime": uptime,
        "timestamp": datetime.now().isoformat(),
        "metrics": {
            "cpu_usage_percent": cpu_percent,
            "memory_usage_percent": memory_info.percent,
            "total_requests": request_count,
            "error_count": error_count,
            "error_rate_percent": error_rate,
            "average_response_time_ms": avg_response_time * 1000,  # Umrechnung in ms
        }
    }
    
    return metrics

@app.get("/metrics")
async def get_metrics():
    """Detaillierte Metriken für Überwachungssysteme"""
    health_data = await health_check()
    return health_data

@app.on_event("startup")
async def startup_event():
    """Ereignishandler für den Start des Services"""
    logger.info("Finance-Microservice wird gestartet...")
    
    # Bei Observer-Service registrieren
    observer_url = os.environ.get("OBSERVER_SERVICE_URL", "http://localhost:8010/register")
    try:
        service_data = get_service_data()
        # Asynchron registrieren (im Hintergrund)
        asyncio.create_task(register_service(observer_url, service_data))
        logger.info(f"Registrierung beim Observer-Service ({observer_url}) eingeleitet")
    except Exception as e:
        logger.warning(f"Konnte nicht beim Observer-Service registrieren: {e}")
    
    logger.info("Finance-Microservice ist bereit")

@app.on_event("shutdown")
async def shutdown_event():
    """Ereignishandler für das Herunterfahren des Services"""
    logger.info("Finance-Microservice wird heruntergefahren...")

def main():
    """Hauptfunktion zum Starten des Services"""
    port = int(os.environ.get("PORT", "8007"))
    host = os.environ.get("HOST", "0.0.0.0")
    
    print(f"Finanzmodul-Server wird gestartet...")
    print(f"Server läuft auf http://localhost:{port}")
    print(f"Endpunkte verfügbar unter: http://localhost:{port}/api/v1/finanzen/...")
    
    uvicorn.run(app, host=host, port=port)

if __name__ == "__main__":
    main() 