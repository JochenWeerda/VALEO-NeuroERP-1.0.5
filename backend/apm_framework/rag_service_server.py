#!/usr/bin/env python3
"""
RAG-Service-Server für das APM-Framework.
Dieser Server stellt den RAG-Service als eigenständigen Prozess bereit.
"""

import os
import sys
import asyncio
import logging
import signal
import json
from datetime import datetime
import socket
import threading
import time

# Pfad zum Projekt-Root hinzufügen
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.apm_framework.mongodb_connector import APMMongoDBConnector
from backend.apm_framework.rag_service import RAGService

# Logger konfigurieren
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("logs/rag_service_server.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Verzeichnis für Logs erstellen, falls es nicht existiert
os.makedirs("logs", exist_ok=True)

# Globale Variablen
rag_service = None
mongodb = None
running = True
status_file = "logs/rag_service_status.json"
api_token = os.getenv("RAG_API_TOKEN", "valeo_rag_api_token_2025")  # API-Token aus Umgebungsvariable oder Standardwert


async def initialize_rag_service():
    """
    Initialisiert den RAG-Service.
    
    Returns:
        RAGService: Initialisierter RAG-Service
    """
    global mongodb
    
    try:
        # MongoDB-Verbindung herstellen
        mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
        mongodb_db = os.getenv("MONGODB_DB", "valeo_neuroerp")
        
        logger.info(f"Stelle Verbindung zu MongoDB her: {mongodb_uri}, DB: {mongodb_db}")
        mongodb = APMMongoDBConnector(mongodb_uri, mongodb_db)
        await mongodb.connect()
        
        # Projekt-ID festlegen
        project_id = os.getenv("PROJECT_ID", "valeo_neuroerp_project")
        
        # RAG-Service initialisieren
        rag_service = RAGService(mongodb, project_id)
        logger.info(f"RAG-Service für Projekt {project_id} initialisiert")
        
        return rag_service
        
    except Exception as e:
        logger.error(f"Fehler bei der Initialisierung des RAG-Services: {str(e)}")
        raise


def update_status(status="running", error=None):
    """
    Aktualisiert die Status-Datei des RAG-Services.
    
    Args:
        status: Status des RAG-Services ("running", "error", "stopped")
        error: Fehlermeldung (optional)
    """
    try:
        status_data = {
            "status": status,
            "timestamp": datetime.now().isoformat(),
            "pid": os.getpid()
        }
        
        if error:
            status_data["error"] = str(error)
        
        with open(status_file, "w") as f:
            json.dump(status_data, f, indent=2)
            
        logger.debug(f"Status aktualisiert: {status}")
        
    except Exception as e:
        logger.error(f"Fehler beim Aktualisieren der Status-Datei: {str(e)}")


def signal_handler(sig, frame):
    """
    Signal-Handler für sauberes Herunterfahren.
    """
    global running
    logger.info(f"Signal {sig} empfangen, fahre herunter...")
    running = False
    update_status("stopping")


async def shutdown():
    """
    Fährt den RAG-Service sauber herunter.
    """
    global mongodb
    
    try:
        logger.info("Fahre RAG-Service herunter...")
        
        # MongoDB-Verbindung trennen
        if mongodb:
            await mongodb.disconnect()
            logger.info("MongoDB-Verbindung getrennt")
        
        update_status("stopped")
        logger.info("RAG-Service erfolgreich heruntergefahren")
        
    except Exception as e:
        logger.error(f"Fehler beim Herunterfahren des RAG-Services: {str(e)}")


class HealthCheckServer:
    """
    Einfacher TCP-Server für Health-Checks.
    """
    
    def __init__(self, host="localhost", port=5678):
        """
        Initialisiert den Health-Check-Server.
        
        Args:
            host: Host-Adresse
            port: Port
        """
        self.host = host
        self.port = port
        self.server_socket = None
        self.thread = None
        
    def start(self):
        """
        Startet den Health-Check-Server in einem separaten Thread.
        """
        self.thread = threading.Thread(target=self.run_server)
        self.thread.daemon = True
        self.thread.start()
        logger.info(f"Health-Check-Server gestartet auf {self.host}:{self.port}")
        
    def run_server(self):
        """
        Führt den Health-Check-Server aus.
        """
        try:
            self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            self.server_socket.bind((self.host, self.port))
            self.server_socket.listen(5)
            
            while running:
                try:
                    client_socket, address = self.server_socket.accept()
                    logger.debug(f"Health-Check-Verbindung von {address}")
                    
                    # Status senden
                    status_message = json.dumps({
                        "status": "ok",
                        "timestamp": datetime.now().isoformat(),
                        "service": "rag_service"
                    })
                    client_socket.send(status_message.encode())
                    client_socket.close()
                    
                except Exception as e:
                    if running:  # Nur loggen, wenn wir nicht gerade herunterfahren
                        logger.error(f"Fehler bei der Health-Check-Verbindung: {str(e)}")
                    
        except Exception as e:
            if running:  # Nur loggen, wenn wir nicht gerade herunterfahren
                logger.error(f"Fehler im Health-Check-Server: {str(e)}")
        finally:
            if self.server_socket:
                self.server_socket.close()
    
    def stop(self):
        """
        Stoppt den Health-Check-Server.
        """
        if self.server_socket:
            self.server_socket.close()
            logger.info("Health-Check-Server gestoppt")


class APIServer:
    """
    Einfacher HTTP-Server für die RAG-API.
    """
    
    def __init__(self, host="localhost", port=8000):
        """
        Initialisiert den API-Server.
        
        Args:
            host: Host-Adresse
            port: Port
        """
        self.host = host
        self.port = port
        self.server_socket = None
        self.thread = None
        
    def start(self):
        """
        Startet den API-Server in einem separaten Thread.
        """
        self.thread = threading.Thread(target=self.run_server)
        self.thread.daemon = True
        self.thread.start()
        logger.info(f"API-Server gestartet auf {self.host}:{self.port}")
        
    def run_server(self):
        """
        Führt den API-Server aus.
        """
        try:
            from http.server import HTTPServer, BaseHTTPRequestHandler
            import json
            
            class RAGHandler(BaseHTTPRequestHandler):
                def _set_headers(self, status_code=200):
                    self.send_response(status_code)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                    self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
                    self.end_headers()
                
                def do_OPTIONS(self):
                    self._set_headers()
                
                def do_GET(self):
                    if self.path == '/api/status':
                        self._set_headers()
                        self.wfile.write(json.dumps({
                            'status': 'running',
                            'timestamp': datetime.now().isoformat()
                        }).encode())
                    else:
                        self._set_headers(404)
                        self.wfile.write(json.dumps({
                            'error': 'Not found'
                        }).encode())
                
                def do_POST(self):
                    # API-Token überprüfen
                    auth_header = self.headers.get('Authorization')
                    if not auth_header or not auth_header.startswith('Bearer ') or auth_header[7:] != api_token:
                        self._set_headers(401)
                        self.wfile.write(json.dumps({
                            'error': 'Unauthorized'
                        }).encode())
                        return
                    
                    if self.path == '/api/query':
                        content_length = int(self.headers['Content-Length'])
                        post_data = self.rfile.read(content_length)
                        
                        try:
                            data = json.loads(post_data.decode())
                            query = data.get('query')
                            
                            if not query:
                                self._set_headers(400)
                                self.wfile.write(json.dumps({
                                    'error': 'No query provided'
                                }).encode())
                                return
                            
                            # Hier würde die Abfrage an den RAG-Service weitergeleitet werden
                            # Da dies asynchron ist, verwenden wir eine Mock-Antwort
                            self._set_headers()
                            self.wfile.write(json.dumps({
                                'response': f'RAG-Antwort für: {query}',
                                'timestamp': datetime.now().isoformat()
                            }).encode())
                            
                        except json.JSONDecodeError:
                            self._set_headers(400)
                            self.wfile.write(json.dumps({
                                'error': 'Invalid JSON'
                            }).encode())
                    else:
                        self._set_headers(404)
                        self.wfile.write(json.dumps({
                            'error': 'Not found'
                        }).encode())
            
            server = HTTPServer((self.host, self.port), RAGHandler)
            logger.info(f'API-Server läuft auf http://{self.host}:{self.port}')
            
            while running:
                server.handle_request()
                
        except Exception as e:
            if running:  # Nur loggen, wenn wir nicht gerade herunterfahren
                logger.error(f"Fehler im API-Server: {str(e)}")
    
    def stop(self):
        """
        Stoppt den API-Server.
        """
        logger.info("API-Server wird gestoppt")


async def main():
    """
    Hauptfunktion für den RAG-Service-Server.
    """
    global rag_service, running
    
    try:
        # Status-Datei initialisieren
        update_status("starting")
        
        # Signal-Handler registrieren
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
        # RAG-Service initialisieren
        rag_service = await initialize_rag_service()
        
        # Health-Check-Server starten
        health_check = HealthCheckServer()
        health_check.start()
        
        # API-Server starten
        api_server = APIServer()
        api_server.start()
        
        # Status aktualisieren
        update_status("running")
        
        logger.info("RAG-Service-Server läuft und ist bereit")
        logger.info(f"API-Token: {api_token}")
        
        # Haupt-Loop
        while running:
            # Hier könnten periodische Aufgaben ausgeführt werden
            await asyncio.sleep(5)
        
        # Health-Check-Server stoppen
        health_check.stop()
        
        # API-Server stoppen
        api_server.stop()
        
        # Herunterfahren
        await shutdown()
        
    except Exception as e:
        logger.error(f"Fehler im RAG-Service-Server: {str(e)}")
        update_status("error", error=str(e))
        
        # Versuche trotzdem herunterzufahren
        try:
            await shutdown()
        except:
            pass
        
        sys.exit(1)


if __name__ == "__main__":
    try:
        # Token-Datei prüfen
        token_file = os.path.join("config", "rag", "api_token.json")
        if os.path.exists(token_file):
            try:
                with open(token_file, "r") as f:
                    token_data = json.load(f)
                    file_token = token_data.get("api_token")
                    if file_token:
                        api_token = file_token
                        logger.info(f"API-Token aus Datei {token_file} geladen")
            except Exception as e:
                logger.warning(f"Fehler beim Laden des API-Tokens aus {token_file}: {str(e)}")
        
        # Event-Loop erstellen und Hauptfunktion ausführen
        loop = asyncio.get_event_loop()
        loop.run_until_complete(main())
    except KeyboardInterrupt:
        logger.info("RAG-Service-Server durch Benutzer beendet")
    except Exception as e:
        logger.error(f"Unbehandelte Ausnahme: {str(e)}")
        sys.exit(1) 