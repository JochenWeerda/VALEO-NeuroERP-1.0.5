#!/usr/bin/env python
"""
Dieses Skript registriert den Finance Microservice beim Observer-Service,
damit dieser das Service-Monitoring übernehmen kann.
"""

import os
import sys
import json
import asyncio
import socket
import logging
from typing import Dict, Any, Optional, List

import httpx
from tenacity import (
    retry,
    stop_after_attempt,
    wait_fixed,
    retry_if_exception_type,
    RetryError,
)

logger = logging.getLogger("finance_service")


@retry(
    stop=stop_after_attempt(5),
    wait=wait_fixed(3),
    retry=retry_if_exception_type((httpx.HTTPError, httpx.ConnectError, httpx.TimeoutException)),
    reraise=True,
)
async def register_service(observer_url: str, service_data: Dict[str, Any]) -> None:
    """Registriert den Service beim Observer-Service"""
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(
            observer_url,
            json=service_data,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        result = response.json()
        print(f"Registrierung erfolgreich. Observer-Antwort: {result.get('message', 'OK')}")


def get_service_data() -> Dict[str, Any]:
    """
    Erstellt ein Dictionary mit den Service-Daten für die Registrierung beim Observer.
    
    Returns:
        Dictionary mit Service-Daten
    """
    # Basisverzeichnis des Projekts ermitteln
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    
    # Neustart-Skript für den Finance-Microservice
    restart_script = os.path.join(base_dir, "backend", "restart_scripts", "restart_finance_service.ps1")
    
    # Service-Daten zusammenstellen
    service_data = {
        "service_name": "finance-service",
        "service_type": "microservice",
        "version": os.environ.get("SERVICE_VERSION", "0.1.0"),
        "host": "localhost",
        "port": int(os.environ.get("PORT", "8007")),
        "health_endpoint": "/health",
        "api_endpoints": [
            "/api/v1/finanzen/accounts",
            "/api/v1/finanzen/transactions",
            "/api/v1/finanzen/documents"
        ],
        "monitoring": {
            "log_level": os.environ.get("LOG_LEVEL", "info"),
            "metrics_enabled": True,
        },
        "restart_script": restart_script if os.path.exists(restart_script) else None
    }
    
    return service_data


def get_observer_url_from_env() -> Optional[str]:
    """Ruft die Observer-Service-URL aus der Umgebungsvariable ab"""
    return os.environ.get("OBSERVER_SERVICE_URL")


async def main() -> None:
    """Hauptfunktion zur Registrierung beim Observer-Service"""
    print("Registriere Service beim Observer...")
    observer_url = get_observer_url_from_env()
    
    if not observer_url:
        print("WARNUNG: Keine OBSERVER_SERVICE_URL-Umgebungsvariable gefunden. Überspringe Registrierung.")
        return
    
    try:
        service_data = get_service_data()
        await register_service(observer_url, service_data)
    except RetryError:
        print("WARNUNG: Konnte Service nicht beim Observer registrieren nach mehreren Versuchen. "
              "Der Service wird trotzdem gestartet.")
    except Exception as e:
        print(f"WARNUNG: Unerwarteter Fehler bei der Observer-Registrierung: {e}. "
              "Der Service wird trotzdem gestartet.")
    else:
        print("Observer-Registrierung abgeschlossen.")


if __name__ == "__main__":
    asyncio.run(main()) 