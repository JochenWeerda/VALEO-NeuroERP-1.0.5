"""
Minimaler Webserver für das AI-gesteuerte ERP-System mit IP-Manager-Integration
"""

import os
import sys
import argparse
import logging
import uvicorn
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Füge das Backend-Verzeichnis zum Pfad hinzu
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Eigene Module importieren
from backend.utils.microservice_register import MicroserviceRegister

# Logging konfigurieren
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("minimal_server_ip")

# Server-Instanz erstellen
app = FastAPI(
    title="Minimaler ERP-Server mit IP-Manager",
    description="Ein minimaler Server für das AI-gesteuerte ERP-System mit IP-Manager-Integration",
    version="0.1.0"
)

# CORS-Middleware hinzufügen
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In der Produktion einschränken
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Basis-Route
@app.get("/")
async def root():
    return {"message": "Minimaler ERP-Server läuft", "version": app.version}

# Health-Check-Endpunkt
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "metrics": {
            "cpu_usage_percent": 0.0,  # Platzhalter
            "memory_usage_percent": 0.0,  # Platzhalter
            "average_response_time_ms": 0.0  # Platzhalter
        }
    }

# Beispiel-API-Route
@app.get("/api/v1/example")
async def example():
    return {"data": "Dies ist ein Beispiel-Endpunkt"}

# Fehlerbehandlung
@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unbehandelte Ausnahme: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Ein interner Serverfehler ist aufgetreten"}
    )

def start_server(host: str = "0.0.0.0", port: int = None, log_level: str = "info", use_ip_manager: bool = True):
    """
    Startet den Server mit den angegebenen Parametern.
    
    Args:
        host: Host-Adresse zum Binden des Servers
        port: Port zum Binden des Servers (falls None, wird der IP-Manager verwendet)
        log_level: Log-Level (debug, info, warning, error, critical)
        use_ip_manager: Ob der IP-Manager für die Portzuweisung verwendet werden soll
    """
    # Standardport für den Fall, dass weder ein Port angegeben wurde noch der IP-Manager verfügbar ist
    default_port = 8005
    
    # Falls ein Port explizit angegeben wurde, verwende diesen
    actual_port = port or default_port
    
    # Microservice-ID und Name
    service_name = "minimal-server-ip"
    
    # API-Endpunkte, die dieser Server bereitstellt
    endpoints = [
        "/",
        "/health",
        "/api/v1/example"
    ]
    
    # IP-Manager-Interaktion
    if use_ip_manager and not port:
        # Wenn kein fester Port angegeben ist und der IP-Manager verwendet werden soll
        try:
            # Wir verwenden die MicroserviceRegister-Klasse mit IP-Manager-Unterstützung
            register = MicroserviceRegister(
                service_name=service_name,
                port=default_port,  # Als Präferenz/Fallback
                endpoints=endpoints,
                use_ip_manager=True
            )
            
            # Der Port wird während der Initialisierung vom IP-Manager zugewiesen
            actual_port = register.port
            logger.info(f"Port vom IP-Manager zugewiesen: {actual_port}")
        except Exception as e:
            logger.warning(f"Fehler bei der IP-Manager-Kommunikation: {str(e)}")
            logger.info(f"Verwende Standard-Port: {default_port}")
            actual_port = default_port
    else:
        logger.info(f"IP-Manager-Nutzung deaktiviert oder Port explizit angegeben: {actual_port}")
    
    # Server-Start ankündigen
    logger.info(f"Minimaler Server wird gestartet...")
    logger.info(f"Server läuft auf http://{host}:{actual_port}")
    logger.info(f"API-Dokumentation verfügbar unter: http://{host}:{actual_port}/docs")
    
    # Beim Observer-Service registrieren
    try:
        # Wir verwenden die bestehende Registrierung, die jetzt auch den IP-Manager nutzt
        # Die MicroserviceRegister-Klasse kümmert sich um beides
        register = MicroserviceRegister(
            service_name=service_name,
            port=actual_port,  # Der tatsächlich verwendete Port
            endpoints=endpoints,
            use_ip_manager=False  # Wir haben den Port bereits, brauchen keine neue Zuweisung
        )
        
        # Beim Observer registrieren
        success = register.register()
        if success:
            logger.info(f"Erfolgreich beim Observer-Service registriert")
        else:
            logger.warning(f"Registrierung beim Observer-Service fehlgeschlagen")
    except Exception as e:
        logger.error(f"Fehler bei der Observer-Registrierung: {str(e)}")
    
    # Server starten
    uvicorn.run(app, host=host, port=actual_port, log_level=log_level.lower())

if __name__ == "__main__":
    # Kommandozeilenargumente parsen
    parser = argparse.ArgumentParser(description="Minimaler ERP-Server mit IP-Manager")
    parser.add_argument("--port", type=int, default=None, help="Port (Standard: Vom IP-Manager oder 8005)")
    parser.add_argument("--host", type=str, default="0.0.0.0", help="Host (Standard: 0.0.0.0)")
    parser.add_argument("--log-level", type=str, default="info", 
                        choices=["debug", "info", "warning", "error", "critical"],
                        help="Log-Level (Standard: info)")
    parser.add_argument("--no-ip-manager", action="store_true", 
                        help="IP-Manager für Portzuweisung nicht verwenden")
    
    args = parser.parse_args()
    
    # Server starten
    start_server(
        host=args.host, 
        port=args.port, 
        log_level=args.log_level,
        use_ip_manager=not args.no_ip_manager
    ) 