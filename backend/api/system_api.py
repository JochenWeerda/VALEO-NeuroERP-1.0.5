"""
System-API für grundlegende Systemfunktionen

Dieses Modul enthält API-Endpunkte für grundlegende Systemfunktionen wie:
- Health-Check
- Swagger/OpenAPI-Dokumentation
- Root-Endpunkt
"""

import os
import sys
import platform
import logging
import json
from pathlib import Path
from datetime import datetime, UTC

from starlette.responses import JSONResponse, Response
from starlette.staticfiles import StaticFiles

from backend.core import APIRouter, get_health_check, health_check_handler
from enhanced_cache_manager import cache

# Logger konfigurieren
logger = logging.getLogger("api.system")

# Router erstellen
system_router = APIRouter(prefix="/api/system", tags=["System"])

# Root-Route
@system_router.get("/info")
async def system_info(request):
    """
    Gibt allgemeine Systeminformationen zurück.
    """
    # Systeminformationen sammeln
    system_info = {
        "name": "AI-Driven ERP System",
        "version": "1.0.0",
        "python_version": sys.version,
        "platform": platform.platform(),
        "timestamp": datetime.now(UTC).isoformat(),
        "modules": {
            "core": True,
            "api": True,
            "frontend": os.path.exists(str(Path(__file__).parent.parent.parent / "frontend"))
        }
    }
    
    return JSONResponse(system_info)

@system_router.get("/config")
async def system_config(request):
    """
    Gibt die Systemkonfiguration zurück (nur öffentliche Einstellungen).
    """
    # Öffentliche Systemkonfiguration
    config = {
        "api_version": "v1",
        "default_cache_ttl": 60,
        "supported_formats": ["json", "csv", "pdf"],
        "max_results_per_page": 100,
        "default_results_per_page": 20,
        "environment": os.environ.get("APP_ENV", "production")
    }
    
    return JSONResponse(config)

@system_router.get("/status")
async def system_status(request):
    """
    Gibt den aktuellen Systemstatus zurück.
    Verwendet den Health-Check-Handler.
    """
    return await health_check_handler(request)

@system_router.get("/time")
async def system_time(request):
    """
    Gibt die aktuelle Serverzeit zurück.
    """
    now = datetime.now(UTC)
    
    return JSONResponse({
        "utc": now.isoformat(),
        "timestamp": now.timestamp()
    })

@system_router.get("/modules")
async def system_modules(request):
    """
    Gibt eine Liste der verfügbaren Module zurück.
    """
    # Verfügbare Module aus dem Dateisystem ermitteln
    api_dir = Path(__file__).parent
    available_modules = []
    
    # API-Module suchen
    for file in api_dir.glob("*.py"):
        if file.name.endswith("_api.py") and file.name != "__init__.py":
            module_name = file.name[:-7]  # Entferne '_api.py'
            available_modules.append(module_name)
    
    return JSONResponse({
        "modules": available_modules,
        "count": len(available_modules)
    })

@system_router.get("/cache/stats")
async def cache_stats(request):
    """
    Gibt Statistiken zum Cache-Manager zurück.
    """
    # Cache-Statistiken sammeln
    stats = cache.get_stats()
    
    # Module-spezifische Cache-Statistiken abrufen, falls vorhanden
    module_stats = {}
    modules = []
    
    # API-Module suchen
    api_dir = Path(__file__).parent
    for file in api_dir.glob("*.py"):
        if file.name.endswith("_api.py") and file.name != "__init__.py":
            module_name = file.name[:-7]  # Entferne '_api.py'
            modules.append(module_name)
    
    # Für Demonstrationszwecke erzeugen wir simulierte Tag-Statistiken
    # In einer echten Implementierung würden wir diese Daten aus dem Cache-Manager abrufen
    tag_stats = {}
    for module in modules:
        tag_name = module
        tag_stats[tag_name] = {
            "count": 0,  # Anzahl der Cache-Einträge mit diesem Tag
            "size": 0,   # Geschätzte Größe in Bytes
            "ttl_avg": 0  # Durchschnittliche TTL
        }
    
    # Generische Tags hinzufügen
    common_tags = ["list", "details", "stats"]
    for tag in common_tags:
        tag_stats[tag] = {
            "count": 0,
            "size": 0,
            "ttl_avg": 0
        }
    
    # Gesamtstatistik
    response = {
        "global": stats,
        "modules": module_stats,
        "tags": tag_stats,
        "timestamp": datetime.now(UTC).isoformat()
    }
    
    return JSONResponse(response)

@system_router.get("/cache/clear")
async def clear_cache(request):
    """
    Löscht den Cache oder spezifische Cache-Tags.
    
    Query-Parameter:
    - tag: Spezifischer Tag, der gelöscht werden soll (optional)
    """
    tag = request.query_params.get("tag")
    
    if tag:
        # Nur den spezifischen Tag löschen
        count = cache.invalidate_tag(tag)
        logger.info(f"Cache-Tag '{tag}' mit {count} Einträgen gelöscht")
        return JSONResponse({
            "status": "success",
            "message": f"Cache-Tag '{tag}' erfolgreich gelöscht",
            "invalidated_entries": count
        })
    else:
        # Gesamten Cache löschen
        cache.clear()
        logger.info("Gesamter Cache gelöscht")
        return JSONResponse({
            "status": "success",
            "message": "Gesamter Cache erfolgreich gelöscht"
        })

# Zentrale Funktion, um alle System-API-Routen zu registrieren
def register_system_routes(main_router):
    """
    Registriert alle System-API-Routen am Hauptrouter.
    
    Args:
        main_router: Hauptrouter-Instanz
    """
    logger.info("Registriere System-API-Routen")
    
    # System-Router einbinden
    main_router.include_router(system_router)
    
    # Direkten Health-Check-Endpunkt hinzufügen
    main_router.add_route("/health", endpoint=health_check_handler, methods=["GET"])
    
    return main_router