#!/usr/bin/env python3
"""
Start-Skript für VALEO NeuroERP Middleware
"""

import os
import sys
import subprocess
import time
import logging
from pathlib import Path

# Logger konfigurieren
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

def check_dependencies():
    """Prüfe ob alle Abhängigkeiten installiert sind"""
    try:
        import fastapi
        import uvicorn
        import httpx
        import redis
        import prometheus_client
        logger.info("Alle Abhängigkeiten sind verfügbar")
        return True
    except ImportError as e:
        logger.error(f"Fehlende Abhängigkeit: {e}")
        return False

def install_dependencies():
    """Installiere Middleware-Abhängigkeiten"""
    try:
        requirements_file = Path(__file__).parent / "middleware" / "requirements.txt"
        if requirements_file.exists():
            logger.info("Installiere Middleware-Abhängigkeiten...")
            subprocess.run([
                sys.executable, "-m", "pip", "install", "-r", str(requirements_file)
            ], check=True)
            logger.info("Abhängigkeiten erfolgreich installiert")
            return True
        else:
            logger.error("Requirements-Datei nicht gefunden")
            return False
    except subprocess.CalledProcessError as e:
        logger.error(f"Fehler beim Installieren der Abhängigkeiten: {e}")
        return False

def start_redis():
    """Starte Redis-Server (falls verfügbar)"""
    try:
        # Prüfe ob Redis läuft
        import redis
        r = redis.Redis(host='localhost', port=6379, db=0)
        r.ping()
        logger.info("Redis ist bereits verfügbar")
        return True
    except:
        logger.warning("Redis ist nicht verfügbar. Middleware wird ohne Caching gestartet.")
        return False

def start_middleware():
    """Starte die Middleware"""
    try:
        middleware_path = Path(__file__).parent / "middleware" / "api_gateway.py"
        if middleware_path.exists():
            logger.info("Starte VALEO NeuroERP Middleware...")
            logger.info("Middleware läuft auf: http://localhost:8001")
            logger.info("Health Check: http://localhost:8001/health")
            logger.info("Drücken Sie Ctrl+C zum Beenden")
            
            # Middleware starten
            subprocess.run([
                sys.executable, str(middleware_path)
            ])
        else:
            logger.error("Middleware-Datei nicht gefunden")
            return False
    except KeyboardInterrupt:
        logger.info("Middleware wird beendet...")
    except Exception as e:
        logger.error(f"Fehler beim Starten der Middleware: {e}")
        return False

def main():
    """Hauptfunktion"""
    logger.info("VALEO NeuroERP Middleware Starter")
    logger.info("=" * 50)
    
    # Abhängigkeiten prüfen und installieren
    if not check_dependencies():
        logger.info("Installiere fehlende Abhängigkeiten...")
        if not install_dependencies():
            logger.error("Konnte Abhängigkeiten nicht installieren")
            return
    
    # Redis prüfen
    start_redis()
    
    # Middleware starten
    start_middleware()

if __name__ == "__main__":
    main() 