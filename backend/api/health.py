"""
API-Endpunkte für Health-Checks.
"""

from typing import Dict, Any
from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session
from sqlalchemy import text
import time
import psutil
import logging
from datetime import datetime

from backend.db.database import get_db
from backend.models.transaction_processing.batch_processor import get_batch_processor

router = APIRouter(
    prefix="/api/health",
    tags=["health"],
    responses={503: {"description": "Service Unavailable"}},
)

logger = logging.getLogger(__name__)

@router.get("")
def health_check(db: Session = Depends(get_db)):
    """
    Allgemeiner Health-Check-Endpunkt.
    Überprüft die Datenbankverbindung und grundlegende Systemmetriken.
    """
    start_time = time.time()
    
    # Datenbankverbindung prüfen
    try:
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        logger.error(f"Datenbankverbindung fehlgeschlagen: {str(e)}")
        db_status = "unhealthy"
        return Response(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=f"Datenbankverbindung fehlgeschlagen: {str(e)}"
        )
    
    # Systemmetriken sammeln
    system_metrics = {
        "cpu_percent": psutil.cpu_percent(),
        "memory_percent": psutil.virtual_memory().percent,
        "disk_usage_percent": psutil.disk_usage('/').percent
    }
    
    response_time = time.time() - start_time
    
    return {
        "status": "healthy",
        "timestamp": datetime.now(),
        "database": db_status,
        "system_metrics": system_metrics,
        "response_time": response_time
    }

@router.get("/transaction-processor")
def transaction_processor_health():
    """
    Health-Check-Endpunkt speziell für die Transaktionsverarbeitung.
    """
    try:
        # BatchProcessor-Instanz abrufen
        batch_processor = get_batch_processor()
        
        # Aktive Batches abrufen
        all_batches = batch_processor.get_all_batches()
        
        # Metriken berechnen
        total_batches = len(all_batches)
        pending_batches = sum(1 for info in all_batches.values() if info["status"] == "pending")
        processing_batches = sum(1 for info in all_batches.values() if info["status"] == "processing")
        
        # Status bestimmen
        if processing_batches > batch_processor.max_workers:
            status = "warning"
            message = f"Mehr Batches in Verarbeitung ({processing_batches}) als Worker ({batch_processor.max_workers})"
        else:
            status = "healthy"
            message = "Transaktionsverarbeitung funktioniert normal"
        
        return {
            "status": status,
            "message": message,
            "timestamp": datetime.now(),
            "metrics": {
                "total_batches": total_batches,
                "pending_batches": pending_batches,
                "processing_batches": processing_batches,
                "max_workers": batch_processor.max_workers
            }
        }
    except Exception as e:
        logger.error(f"Fehler beim Health-Check der Transaktionsverarbeitung: {str(e)}")
        return Response(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=f"Transaktionsverarbeitung nicht verfügbar: {str(e)}"
        )

@router.get("/database")
def database_health(db: Session = Depends(get_db)):
    """
    Detaillierter Health-Check der Datenbankverbindung.
    """
    start_time = time.time()
    
    try:
        # Einfache Abfrage zur Überprüfung der Verbindung
        db.execute(text("SELECT 1"))
        
        # Aktive Verbindungen abfragen
        result = db.execute(text("""
            SELECT count(*) as active_connections 
            FROM pg_stat_activity 
            WHERE state = 'active'
        """))
        active_connections = result.scalar()
        
        # Transaktionsstatistiken abfragen
        result = db.execute(text("""
            SELECT xact_commit, xact_rollback
            FROM pg_stat_database
            WHERE datname = current_database()
        """))
        stats = result.fetchone()
        
        response_time = time.time() - start_time
        
        return {
            "status": "healthy",
            "timestamp": datetime.now(),
            "response_time": response_time,
            "metrics": {
                "active_connections": active_connections,
                "transactions_committed": stats[0] if stats else None,
                "transactions_rolled_back": stats[1] if stats else None
            }
        }
    except Exception as e:
        logger.error(f"Datenbankverbindung fehlgeschlagen: {str(e)}")
        return Response(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=f"Datenbankverbindung fehlgeschlagen: {str(e)}"
        )

@router.get("/system")
def system_health():
    """
    Detaillierte Systemmetriken.
    """
    try:
        # CPU-Informationen
        cpu_percent = psutil.cpu_percent(interval=0.1)
        cpu_count = psutil.cpu_count()
        cpu_per_core = psutil.cpu_percent(interval=0.1, percpu=True)
        
        # Speicherinformationen
        memory = psutil.virtual_memory()
        
        # Festplatteninformationen
        disk = psutil.disk_usage('/')
        
        # Netzwerkinformationen
        net_io = psutil.net_io_counters()
        
        return {
            "status": "healthy",
            "timestamp": datetime.now(),
            "cpu": {
                "percent": cpu_percent,
                "count": cpu_count,
                "per_core": cpu_per_core
            },
            "memory": {
                "total": memory.total,
                "available": memory.available,
                "used": memory.used,
                "percent": memory.percent
            },
            "disk": {
                "total": disk.total,
                "used": disk.used,
                "free": disk.free,
                "percent": disk.percent
            },
            "network": {
                "bytes_sent": net_io.bytes_sent,
                "bytes_recv": net_io.bytes_recv,
                "packets_sent": net_io.packets_sent,
                "packets_recv": net_io.packets_recv
            }
        }
    except Exception as e:
        logger.error(f"Fehler beim Sammeln von Systemmetriken: {str(e)}")
        return Response(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=f"Fehler beim Sammeln von Systemmetriken: {str(e)}"
        ) 