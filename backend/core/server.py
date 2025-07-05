"""
Core-Server-Modul für das modulare ERP-System
Dieses Modul enthält die grundlegende Serverkonfiguration
"""

import sys
import os
from pathlib import Path
import logging
import uvicorn
from starlette.applications import Starlette
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from starlette.exceptions import ExceptionMiddleware
from starlette.staticfiles import StaticFiles

# Basispfade konfigurieren
BASE_DIR = Path(__file__).parent.parent
sys.path.append(str(BASE_DIR.parent))
sys.path.append(str(BASE_DIR))

# Logger konfigurieren
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(os.path.join(str(BASE_DIR), "server.log"))
    ]
)
logger = logging.getLogger("core.server")

# Standard-Middleware
middleware = [
    Middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    ),
    Middleware(ExceptionMiddleware, debug=False)
]

def create_app(routes=None, middleware=middleware, on_startup=None, on_shutdown=None, debug=False):
    """
    Erstellt eine Starlette-App mit den angegebenen Routen und Middleware.
    
    Args:
        routes: Liste der Route-Objekte
        middleware: Liste der Middleware
        on_startup: Liste der Startup-Funktionen
        on_shutdown: Liste der Shutdown-Funktionen
        debug: Debug-Modus aktivieren/deaktivieren
        
    Returns:
        Starlette-App
    """
    if routes is None:
        routes = []
    
    if on_startup is None:
        on_startup = []
    
    if on_shutdown is None:
        on_shutdown = []
    
    logger.info(f"Erstelle Starlette-App mit {len(routes)} Routen und {len(middleware)} Middleware")
    
    app = Starlette(
        debug=debug,
        routes=routes,
        middleware=middleware,
        on_startup=on_startup,
        on_shutdown=on_shutdown
    )
    
    # Statische Dateien für Frontend
    try:
        app.mount("/static", StaticFiles(directory=str(BASE_DIR.parent / "frontend/static")), name="static")
        app.mount("/", StaticFiles(directory=str(BASE_DIR.parent / "frontend/dist"), html=True), name="frontend")
        logger.info("Frontend-Dateien erfolgreich eingebunden")
    except Exception as e:
        logger.warning(f"Frontend-Dateien konnten nicht eingebunden werden: {str(e)}")
    
    return app

def run_server(app, host="0.0.0.0", port=8003, log_level="info"):
    """
    Startet den Server mit der angegebenen App.
    
    Args:
        app: Starlette-App
        host: Host-Adresse
        port: Port
        log_level: Log-Level (debug, info, warning, error, critical)
    """
    logger.info(f"Server wird gestartet auf {host}:{port}")
    logger.info(f"API-Dokumentation verfügbar unter: http://localhost:{port}/docs")
    
    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level=log_level
    )

if __name__ == "__main__":
    # Dieses Skript sollte nicht direkt ausgeführt werden
    logger.warning("Das Core-Server-Modul sollte nicht direkt ausgeführt werden.")
    logger.info("Verwenden Sie stattdessen das Hauptskript mit dem modularen Ansatz.") 