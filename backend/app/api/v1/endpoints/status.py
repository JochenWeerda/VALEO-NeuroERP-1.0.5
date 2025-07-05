from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import psutil
import platform
import os
import time
import json
from typing import Dict, List, Optional, Any

from app.dependencies import get_db
from app.core.config import settings

router = APIRouter()

# Cache für Statusinformationen
_status_cache = {
    "last_check": None,
    "data": None,
    "cache_duration": 15  # Cache-Dauer in Sekunden
}

def get_system_info() -> Dict[str, Any]:
    """Erfasst Basisinformationen über das System"""
    return {
        "system": platform.system(),
        "version": platform.version(),
        "python_version": platform.python_version(),
        "cpu_count": psutil.cpu_count(),
        "memory_total": psutil.virtual_memory().total,
        "memory_available": psutil.virtual_memory().available,
    }

def check_database(db: Session) -> Dict[str, Any]:
    """Überprüft die Datenbankverbindung"""
    start_time = time.time()
    try:
        # Einfache Datenbankabfrage zur Überprüfung der Verbindung
        result = db.execute("SELECT 1").fetchone()
        response_time = time.time() - start_time
        
        return {
            "status": "connected" if result[0] == 1 else "error",
            "response_time_ms": round(response_time * 1000, 2)
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "response_time_ms": round((time.time() - start_time) * 1000, 2)
        }

@router.get("/health")
async def health_check():
    """Einfacher Gesundheitscheck für Watchdog-Prozesse"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@router.get("/status")
async def get_detailed_status(db: Session = Depends(get_db)):
    """Detaillierter Statusbericht über das System"""
    
    # Überprüfe, ob ein gültiger Cache vorhanden ist
    if (_status_cache["last_check"] and 
        datetime.utcnow() - _status_cache["last_check"] < timedelta(seconds=_status_cache["cache_duration"]) and
        _status_cache["data"]):
        # Füge Hinweis hinzu, dass dies ein Cache-Ergebnis ist
        cached_data = _status_cache["data"].copy()
        cached_data["cache"] = {
            "from_cache": True,
            "cached_at": _status_cache["last_check"].isoformat(),
            "cache_age_seconds": (datetime.utcnow() - _status_cache["last_check"]).total_seconds()
        }
        return cached_data
    
    # Erfasse aktuelle Systemstatistiken
    cpu_percent = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    # Überprüfe die Datenbankverbindung
    db_status = check_database(db)
    
    # Sammle alle Statusinformationen
    status_data = {
        "timestamp": datetime.utcnow().isoformat(),
        "system_info": get_system_info(),
        "current_stats": {
            "cpu_percent": cpu_percent,
            "memory_percent": memory.percent,
            "disk_percent": disk.percent,
        },
        "database": db_status,
        "app_info": {
            "version": settings.VERSION,
            "project_name": settings.PROJECT_NAME,
            "api_prefix": settings.API_V1_STR,
        },
        "status": "healthy" if db_status["status"] == "connected" and cpu_percent < 90 else "warning",
        "cache": {
            "from_cache": False
        }
    }
    
    # Aktualisiere den Cache
    _status_cache["last_check"] = datetime.utcnow()
    _status_cache["data"] = status_data
    
    return status_data

@router.get("/status/reset-cache")
async def reset_status_cache():
    """Setzt den Status-Cache zurück"""
    global _status_cache
    _status_cache = {
        "last_check": None,
        "data": None,
        "cache_duration": _status_cache["cache_duration"]
    }
    return {"message": "Status cache has been reset", "timestamp": datetime.utcnow().isoformat()} 