#!/usr/bin/env python
"""
Optimierter Startup-Skript für den minimalen ERP-Server
- Verbesserte Logging-Funktionen
- Prozess-Management
- Konfigurierbare Parameter
"""

import argparse
import os
import sys
import time
import logging
import subprocess
import psutil
from pathlib import Path
import signal
import atexit

# Logging-Konfiguration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger('erp-server')

# Standard-Konfiguration
DEFAULT_PORT = 8003
DEFAULT_HOST = "0.0.0.0"
DEFAULT_WORKERS = 4
DEFAULT_LOG_LEVEL = "warning"

# Prozess-Handling
server_process = None

def signal_handler(sig, frame):
    """Signal-Handler für graceful shutdown"""
    logger.info("Server-Shutdown eingeleitet...")
    shutdown_server()
    sys.exit(0)

def shutdown_server():
    """Server ordnungsgemäß herunterfahren"""
    global server_process
    if server_process and server_process.poll() is None:
        logger.info("Beende Server-Prozess...")
        if sys.platform == 'win32':
            # Windows-spezifischer Prozess-Termination
            subprocess.run(['taskkill', '/F', '/T', '/PID', str(server_process.pid)])
        else:
            # Unix-basierte Systeme
            server_process.terminate()
            try:
                server_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                logger.warning("Server reagiert nicht, erzwinge Beendigung...")
                server_process.kill()
        logger.info("Server-Prozess beendet.")

def check_port_availability(port):
    """Überprüft, ob der angegebene Port verfügbar ist"""
    for proc in psutil.process_iter(['pid', 'name', 'connections']):
        try:
            for conn in proc.connections():
                if conn.laddr.port == port and conn.status == 'LISTEN':
                    logger.warning(f"Port {port} wird bereits von Prozess {proc.pid} ({proc.name()}) verwendet!")
                    return False
        except (psutil.AccessDenied, psutil.NoSuchProcess):
            pass
    return True

def find_available_port(start_port):
    """Findet den nächsten verfügbaren Port, beginnend bei start_port"""
    current_port = start_port
    while not check_port_availability(current_port):
        logger.info(f"Port {current_port} ist belegt, versuche Port {current_port + 1}...")
        current_port += 1
        if current_port > 65535:
            logger.error("Keine verfügbaren Ports gefunden!")
            sys.exit(1)
    return current_port

def start_server(host, port, workers, log_level, reload=False):
    """Startet den Server mit den angegebenen Parametern"""
    global server_process
    
    # Sicherstellen, dass das Verzeichnis korrekt ist
    script_dir = Path(__file__).parent.absolute()
    os.chdir(script_dir)
    
    # Server-Startbefehl vorbereiten
    cmd = [
        sys.executable,
        "minimal_server.py",
        "--host", host,
        "--port", str(port),
        "--workers", str(workers)
    ]
    
    # Umgebungsvariablen für optimiertes Logging
    env = os.environ.copy()
    env["PYTHONUNBUFFERED"] = "1"
    
    logger.info(f"Starte optimierten ERP-Server auf http://{host if host != '0.0.0.0' else 'localhost'}:{port}")
    logger.info(f"API-Dokumentation verfügbar unter: http://{host if host != '0.0.0.0' else 'localhost'}:{port}/docs")
    
    try:
        server_process = subprocess.Popen(
            cmd,
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            bufsize=1
        )
        
        # Prozess-Ausgabe überwachen
        while server_process.poll() is None:
            line = server_process.stdout.readline()
            if line:
                line = line.strip()
                # Filtern der Uvicorn-Logs basierend auf log_level
                if "INFO:" in line and log_level == "warning":
                    # Info-Logs bei Warnstufe unterdrücken, aber wichtige Infos zeigen
                    if "Application startup complete" in line or "running on" in line:
                        logger.info(line)
                elif "WARNING:" in line:
                    logger.warning(line)
                elif "ERROR:" in line:
                    logger.error(line)
                elif "CRITICAL:" in line:
                    logger.critical(line)
                else:
                    # Alle anderen Logs entsprechend dem Log-Level
                    if log_level != "warning":
                        logger.info(line)
            
        # Server wurde beendet
        return_code = server_process.poll()
        if return_code != 0:
            logger.error(f"Server wurde mit Fehlercode {return_code} beendet!")
            return False
    except KeyboardInterrupt:
        logger.info("Server-Unterbrechung erkannt...")
        shutdown_server()
    except Exception as e:
        logger.error(f"Fehler beim Starten des Servers: {str(e)}")
        return False
    
    return True

def main():
    """Hauptfunktion"""
    # Kommandozeilenargumente verarbeiten
    parser = argparse.ArgumentParser(description="Optimierter Startup für ERP-Server")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT, help=f"Port für den Server (Standard: {DEFAULT_PORT})")
    parser.add_argument("--host", type=str, default=DEFAULT_HOST, help=f"Host-Adresse (Standard: {DEFAULT_HOST})")
    parser.add_argument("--workers", type=int, default=DEFAULT_WORKERS, help=f"Anzahl der Worker-Prozesse (Standard: {DEFAULT_WORKERS})")
    parser.add_argument("--log-level", type=str, choices=["debug", "info", "warning", "error", "critical"], 
                       default=DEFAULT_LOG_LEVEL, help=f"Logging-Level (Standard: {DEFAULT_LOG_LEVEL})")
    parser.add_argument("--auto-port", action="store_true", help="Automatisch nächsten verfügbaren Port finden falls besetzt")
    parser.add_argument("--reload", action="store_true", help="Server mit Auto-Reload für Entwicklung starten")
    
    args = parser.parse_args()
    
    # Port-Überprüfung
    port = args.port
    if not check_port_availability(port):
        if args.auto_port:
            port = find_available_port(port)
            logger.info(f"Verwende automatisch gewählten Port: {port}")
        else:
            logger.error(f"Port {port} ist nicht verfügbar. Verwenden Sie --auto-port oder wählen Sie einen anderen Port.")
            return False
    
    # Signal-Handler registrieren
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Server starten
    return start_server(
        host=args.host, 
        port=port,
        workers=args.workers,
        log_level=args.log_level,
        reload=args.reload
    )

if __name__ == "__main__":
    # Cleanup-Handler registrieren
    atexit.register(shutdown_server)
    
    # Server starten
    success = main()
    if not success:
        sys.exit(1) 