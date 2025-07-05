import subprocess
import sys
import time
import logging
from pathlib import Path
from backend.core.logging_config import setup_logging

def start_mongodb():
    """
    Startet den MongoDB Server
    """
    try:
        logger = logging.getLogger("mongodb")
        logger.info("Starte MongoDB...")
        
        # MongoDB Datenverzeichnis erstellen
        data_dir = Path("data/db")
        data_dir.mkdir(parents=True, exist_ok=True)
        
        # MongoDB Server starten
        process = subprocess.Popen(
            ["mongod", "--dbpath", str(data_dir)],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Warten und prüfen ob MongoDB erfolgreich gestartet ist
        time.sleep(5)
        if process.poll() is None:
            logger.info("MongoDB erfolgreich gestartet")
        else:
            stdout, stderr = process.communicate()
            logger.error(f"MongoDB konnte nicht gestartet werden: {stderr.decode()}")
            sys.exit(1)
            
    except Exception as e:
        logger.error(f"Fehler beim Starten von MongoDB: {str(e)}")
        sys.exit(1)

def start_api_server():
    """
    Startet den FastAPI Server
    """
    try:
        logger = logging.getLogger("api")
        logger.info("Starte API Server...")
        
        # API Server starten
        process = subprocess.Popen(
            [
                sys.executable,
                "-m",
                "uvicorn",
                "backend.api.server:app",
                "--host",
                "0.0.0.0",
                "--port",
                "8000",
                "--reload",
                "--workers",
                "4",
                "--log-config",
                "backend/core/logging_config.py"
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Warten und prüfen ob API Server erfolgreich gestartet ist
        time.sleep(3)
        if process.poll() is None:
            logger.info("API Server erfolgreich gestartet")
        else:
            stdout, stderr = process.communicate()
            logger.error(f"API Server konnte nicht gestartet werden: {stderr.decode()}")
            sys.exit(1)
            
    except Exception as e:
        logger.error(f"Fehler beim Starten des API Servers: {str(e)}")
        sys.exit(1)

def check_dependencies():
    """
    Überprüft ob alle Abhängigkeiten installiert sind
    """
    logger = logging.getLogger()
    try:
        import fastapi
        import uvicorn
        import pymongo
        logger.info("Alle Abhängigkeiten sind installiert")
        return True
    except ImportError as e:
        logger.error(f"Fehlende Abhängigkeit: {str(e)}")
        return False

def main():
    """
    Hauptfunktion zum Starten aller Komponenten
    """
    # Logging konfigurieren
    setup_logging()
    logger = logging.getLogger()
    
    # Projektverzeichnis setzen
    project_root = Path(__file__).parent.parent
    sys.path.append(str(project_root))
    
    logger.info("Starte VALEO-NeuroERP System...")
    
    # Abhängigkeiten prüfen
    if not check_dependencies():
        logger.error("Bitte installieren Sie alle benötigten Abhängigkeiten")
        sys.exit(1)
    
    # MongoDB starten
    start_mongodb()
    
    # API Server starten
    start_api_server()
    
    logger.info("Alle Komponenten erfolgreich gestartet")
    
    try:
        # Server am Laufen halten
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        logger.info("Server werden heruntergefahren...")
        sys.exit(0)

if __name__ == "__main__":
    main() 