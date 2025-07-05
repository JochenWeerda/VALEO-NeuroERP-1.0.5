"""
Health-Modul für standardisierte Health-Checks
"""

import os
import platform
import sys
import time
import psutil
import logging
from datetime import datetime, UTC
from starlette.responses import JSONResponse

logger = logging.getLogger("core.health")

# Cache für Health-Check-Daten
health_cache = {
    "last_check": 0,
    "data": None,
    "ttl": 10  # Cache-TTL in Sekunden
}

def get_system_info():
    """
    Sammelt Systeminformationen für den Health-Check.
    
    Returns:
        dict: Systeminformationen
    """
    process = psutil.Process(os.getpid())
    cpu_usage = process.cpu_percent(interval=0.1)
    memory_info = process.memory_info()
    
    return {
        "os": platform.system(),
        "os_version": platform.version(),
        "python_version": sys.version,
        "cpu_cores": psutil.cpu_count(logical=True),
        "cpu_usage": cpu_usage,
        "memory_total": psutil.virtual_memory().total,
        "memory_available": psutil.virtual_memory().available,
        "memory_used_by_process": memory_info.rss,
        "memory_percent_by_process": process.memory_percent(),
        "disk_usage": {
            "total": psutil.disk_usage("/").total,
            "used": psutil.disk_usage("/").used,
            "free": psutil.disk_usage("/").free,
            "percent": psutil.disk_usage("/").percent
        }
    }

def get_health_check(
    service_name="main",
    version="1.0.0",
    dependencies=None,
    additional_checks=None,
    use_cache=True
):
    """
    Führt einen standardisierten Health-Check durch.
    
    Args:
        service_name: Name des Services
        version: Version des Services
        dependencies: Liste der Abhängigkeiten mit Health-Status
        additional_checks: Zusätzliche Prüfungen
        use_cache: Cache für die Systemdaten verwenden
        
    Returns:
        dict: Health-Check-Daten
    """
    # Cache verwenden, wenn erlaubt und gültig
    current_time = time.time()
    if use_cache and health_cache["data"] and (current_time - health_cache["last_check"] < health_cache["ttl"]):
        system_info = health_cache["data"]
        logger.debug("Health-Check-Daten aus Cache verwendet")
    else:
        system_info = get_system_info()
        health_cache["data"] = system_info
        health_cache["last_check"] = current_time
        logger.debug("Neue Health-Check-Daten gesammelt")
    
    # Standardwerte für Abhängigkeiten und zusätzliche Prüfungen
    if dependencies is None:
        dependencies = {}
    
    if additional_checks is None:
        additional_checks = {}
    
    # Gesamtstatus berechnen (OK, nur wenn alle Abhängigkeiten OK sind)
    status = "ok"
    for dep_name, dep_status in dependencies.items():
        if dep_status["status"] != "ok":
            status = "degraded"
            break
    
    # Health-Check-Response zusammenstellen
    return {
        "status": status,
        "service": service_name,
        "version": version,
        "timestamp": datetime.now(UTC).isoformat(),
        "uptime": time.time() - psutil.Process(os.getpid()).create_time(),
        "system_info": system_info,
        "dependencies": dependencies,
        "additional_checks": additional_checks
    }

async def health_check_handler(request):
    """
    Starlette-Handler für den Health-Check-Endpunkt.
    
    Args:
        request: Starlette-Request
        
    Returns:
        JSONResponse: Health-Check-Daten
    """
    # Service-Name und Version aus Query-Parametern oder Standardwerten
    service_name = request.query_params.get("service", "main")
    version = request.query_params.get("version", "1.0.0")
    
    # Cache verwenden, wenn nicht explizit deaktiviert
    use_cache = request.query_params.get("cache", "true").lower() == "true"
    
    # Health-Check durchführen
    health_data = get_health_check(
        service_name=service_name,
        version=version,
        use_cache=use_cache
    )
    
    return JSONResponse(health_data) 