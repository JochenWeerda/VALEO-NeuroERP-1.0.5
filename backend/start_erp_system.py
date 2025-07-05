#!/usr/bin/env python
"""
ERP-System Hauptstartskript
- Startet und verwaltet alle Performance-Komponenten
- Integriert Benchmark, Observer, Optimizer und Dashboard
- Unterstützt verschiedene Betriebsmodi
"""

import os
import sys
import time
import argparse
import logging
import subprocess
import signal
import psutil
import threading
import webbrowser
from pathlib import Path
import atexit
import json
import socket

# Konfiguration des Loggings
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger('erp-system')

# Standardkonfiguration
DEFAULT_SERVER_PORT = 8003
DEFAULT_DASHBOARD_PORT = 5000
DEFAULT_WORKERS = 4
DEFAULT_LOG_LEVEL = "info"

# Globale Prozessverfolgung
processes = {
    "server": None,
    "observer": None,
    "dashboard": None,
    "optimizer": None
}

class ERPSystemManager:
    """Hauptklasse zur Verwaltung aller ERP-System-Komponenten"""
    
    def __init__(self, args):
        """Initialisiere den Manager mit den Befehlszeilenargumenten"""
        self.args = args
        self.server_port = self._find_free_port(args.server_port)
        self.dashboard_port = self._find_free_port(args.dashboard_port)
        self.backend_dir = Path(__file__).parent.absolute()
        self.project_dir = self.backend_dir.parent
        
        # Sicherstellen, dass erforderliche Verzeichnisse existieren
        (self.backend_dir / "performance_data").mkdir(exist_ok=True)
        (self.backend_dir / "reports").mkdir(exist_ok=True)
        (self.backend_dir / "templates").mkdir(exist_ok=True)
        
        # Status
        self.running = False
        self.components_status = {
            "server": False,
            "observer": False,
            "dashboard": False,
            "optimizer": False
        }
        
    def _find_free_port(self, preferred_port):
        """Findet einen freien Port, beginnend mit dem bevorzugten Port"""
        port = preferred_port
        max_attempts = 100
        
        for _ in range(max_attempts):
            try:
                with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                    s.bind(('0.0.0.0', port))
                    return port
            except OSError:
                logger.debug(f"Port {port} bereits belegt, versuche nächsten Port...")
                port += 1
                
        logger.error(f"Konnte keinen freien Port nach {max_attempts} Versuchen finden!")
        return preferred_port
    
    def start(self):
        """Startet alle Komponenten basierend auf den Befehlszeilenargumenten"""
        self.running = True
        
        logger.info("=== ERP-System wird gestartet ===")
        
        # Server starten
        if not self.args.no_server:
            self._start_server()
        
        # Observer Service starten wenn gewünscht
        if self.args.with_observer:
            self._start_observer()
        
        # Performance Optimizer starten wenn gewünscht
        if self.args.with_optimizer:
            self._start_optimizer()
        
        # Dashboard starten wenn gewünscht
        if self.args.with_dashboard:
            self._start_dashboard()
        
        # Benchmark ausführen wenn gewünscht
        if self.args.run_benchmark:
            self._run_benchmark()
        
        # Starte Monitoring Thread für alle Prozesse
        monitoring_thread = threading.Thread(target=self._monitor_processes)
        monitoring_thread.daemon = True
        monitoring_thread.start()
        
        logger.info(f"=== ERP-System erfolgreich gestartet ===")
        if not self.args.no_server:
            logger.info(f"API-Server: http://localhost:{self.server_port}")
            logger.info(f"API-Dokumentation: http://localhost:{self.server_port}/docs")
        if self.args.with_dashboard:
            logger.info(f"Performance-Dashboard: http://localhost:{self.dashboard_port}")
        
        # Warte auf Signal zum Beenden
        try:
            while self.running:
                time.sleep(1)
        except KeyboardInterrupt:
            self.shutdown()
    
    def _start_server(self):
        """Startet den optimierten ERP-Server"""
        logger.info("Starte optimierten ERP-Server...")
        
        # Prüfe, ob start_optimized_server.py oder minimal_server.py existiert
        server_script = None
        if (self.backend_dir / "start_optimized_server.py").exists():
            server_script = "start_optimized_server.py"
        elif (self.backend_dir / "minimal_server.py").exists():
            server_script = "minimal_server.py"
        else:
            logger.error("Konnte keine Server-Skriptdatei finden!")
            return False
        
        # Befehl vorbereiten
        cmd = [
            sys.executable,
            str(self.backend_dir / server_script),
            "--port", str(self.server_port),
            "--workers", str(self.args.workers),
            "--log-level", self.args.log_level
        ]
        
        # Starte Prozess
        try:
            if server_script == "start_optimized_server.py":
                # Wenn optimierter Starter verfügbar, als Prozess starten
                processes["server"] = subprocess.Popen(
                    cmd,
                    cwd=str(self.backend_dir),
                    stdout=subprocess.PIPE if not self.args.verbose else None,
                    stderr=subprocess.STDOUT if not self.args.verbose else None,
                    universal_newlines=True
                )
            else:
                # Wenn nur minimal_server.py verfügbar, mit Flags starten
                cmd = [
                    sys.executable,
                    str(self.backend_dir / "minimal_server.py"),
                    "--port", str(self.server_port)
                ]
                processes["server"] = subprocess.Popen(
                    cmd,
                    cwd=str(self.backend_dir),
                    stdout=subprocess.PIPE if not self.args.verbose else None,
                    stderr=subprocess.STDOUT if not self.args.verbose else None,
                    universal_newlines=True
                )
            
            # Warte kurz, um zu prüfen, ob der Server startet
            time.sleep(2)
            if processes["server"].poll() is None:
                logger.info(f"Server erfolgreich gestartet auf Port {self.server_port}")
                self.components_status["server"] = True
                return True
            else:
                logger.error("Server konnte nicht gestartet werden!")
                return False
                
        except Exception as e:
            logger.error(f"Fehler beim Starten des Servers: {str(e)}")
            return False
    
    def _start_observer(self):
        """Startet den Observer-Service für Performance-Monitoring"""
        logger.info("Starte Observer-Service...")
        
        if not (self.backend_dir / "observer_service.py").exists():
            logger.error("Observer-Service-Skript nicht gefunden!")
            return False
        
        # Konfiguration für Observer
        cmd = [
            sys.executable,
            str(self.backend_dir / "observer_service.py"),
            "--interval", str(self.args.monitoring_interval),
            "--server-url", f"http://localhost:{self.server_port}",
            "--threshold-cpu", "80",
            "--threshold-memory", "75"
        ]
        
        # Starte Prozess
        try:
            processes["observer"] = subprocess.Popen(
                cmd,
                cwd=str(self.backend_dir),
                stdout=subprocess.PIPE if not self.args.verbose else None,
                stderr=subprocess.STDOUT if not self.args.verbose else None,
                universal_newlines=True
            )
            
            # Warte kurz, um zu prüfen, ob der Observer startet
            time.sleep(1)
            if processes["observer"].poll() is None:
                logger.info("Observer-Service erfolgreich gestartet")
                self.components_status["observer"] = True
                return True
            else:
                logger.error("Observer-Service konnte nicht gestartet werden!")
                return False
                
        except Exception as e:
            logger.error(f"Fehler beim Starten des Observer-Service: {str(e)}")
            return False
    
    def _start_optimizer(self):
        """Startet den Performance-Optimizer"""
        logger.info("Starte Performance-Optimizer...")
        
        if not (self.backend_dir / "simple_optimizer.py").exists():
            logger.error("Performance-Optimizer-Skript nicht gefunden!")
            return False
        
        # Konfiguration für Optimizer
        cmd = [
            sys.executable,
            str(self.backend_dir / "simple_optimizer.py"),
            "--interval", str(self.args.optimization_interval),
            "--server-url", f"http://localhost:{self.server_port}"
        ]
        
        # Starte Prozess
        try:
            processes["optimizer"] = subprocess.Popen(
                cmd,
                cwd=str(self.backend_dir),
                stdout=subprocess.PIPE if not self.args.verbose else None,
                stderr=subprocess.STDOUT if not self.args.verbose else None,
                universal_newlines=True
            )
            
            # Warte kurz, um zu prüfen, ob der Optimizer startet
            time.sleep(1)
            if processes["optimizer"].poll() is None:
                logger.info("Performance-Optimizer erfolgreich gestartet")
                self.components_status["optimizer"] = True
                return True
            else:
                logger.error("Performance-Optimizer konnte nicht gestartet werden!")
                return False
                
        except Exception as e:
            logger.error(f"Fehler beim Starten des Performance-Optimizers: {str(e)}")
            return False
    
    def _start_dashboard(self):
        """Startet das Performance-Dashboard"""
        logger.info("Starte Performance-Dashboard...")
        
        if not (self.backend_dir / "monitor_dashboard.py").exists():
            logger.error("Dashboard-Skript nicht gefunden!")
            return False
        
        # Konfiguration für Dashboard
        cmd = [
            sys.executable,
            str(self.backend_dir / "monitor_dashboard.py"),
            "--port", str(self.dashboard_port),
            "--interval", str(self.args.monitoring_interval)
        ]
        
        if not self.args.open_browser:
            cmd.append("--no-browser")
        
        # Starte Prozess
        try:
            processes["dashboard"] = subprocess.Popen(
                cmd,
                cwd=str(self.backend_dir),
                stdout=subprocess.PIPE if not self.args.verbose else None,
                stderr=subprocess.STDOUT if not self.args.verbose else None,
                universal_newlines=True
            )
            
            # Warte kurz, um zu prüfen, ob das Dashboard startet
            time.sleep(2)
            if processes["dashboard"].poll() is None:
                logger.info(f"Performance-Dashboard erfolgreich gestartet auf Port {self.dashboard_port}")
                self.components_status["dashboard"] = True
                return True
            else:
                logger.error("Performance-Dashboard konnte nicht gestartet werden!")
                return False
                
        except Exception as e:
            logger.error(f"Fehler beim Starten des Performance-Dashboards: {str(e)}")
            return False
    
    def _run_benchmark(self):
        """Führt einen Performance-Benchmark durch"""
        logger.info("Starte Performance-Benchmark...")
        
        if not (self.backend_dir / "performance_benchmark.py").exists():
            logger.error("Benchmark-Skript nicht gefunden!")
            return False
        
        # Endpoints zum Testen
        endpoints = ["/health", "/api/v1/kunden", "/api/v1/dashboard"]
        
        # Konfiguration für Benchmark
        cmd = [
            sys.executable,
            str(self.backend_dir / "performance_benchmark.py"),
            "--url", f"http://localhost:{self.server_port}",
            "--requests", str(self.args.benchmark_requests),
            "--concurrency", str(self.args.benchmark_concurrency),
            "--warmup", "2",
            "--endpoints"
        ] + endpoints
        
        # Starte Prozess
        try:
            benchmark_process = subprocess.Popen(
                cmd,
                cwd=str(self.backend_dir),
                stdout=subprocess.PIPE if not self.args.verbose else None,
                stderr=subprocess.STDOUT if not self.args.verbose else None,
                universal_newlines=True
            )
            
            # Warte auf Benchmark-Abschluss
            benchmark_process.wait()
            
            if benchmark_process.returncode == 0:
                logger.info("Performance-Benchmark erfolgreich abgeschlossen")
                return True
            else:
                logger.error("Performance-Benchmark fehlgeschlagen!")
                return False
                
        except Exception as e:
            logger.error(f"Fehler beim Ausführen des Performance-Benchmarks: {str(e)}")
            return False
    
    def _monitor_processes(self):
        """Überwacht alle laufenden Prozesse"""
        while self.running:
            try:
                # Server-Prozess prüfen
                if processes["server"] is not None:
                    if processes["server"].poll() is not None:
                        logger.warning("Server-Prozess wurde beendet, versuche Neustart...")
                        self._start_server()
                    else:
                        logger.debug("Server-Prozess läuft: True")
                
                # Observer-Prozess prüfen
                if processes["observer"] is not None and self.args.with_observer:
                    if processes["observer"].poll() is not None:
                        logger.warning("Observer-Prozess wurde beendet, versuche Neustart...")
                        self._start_observer()
                    else:
                        logger.debug("Observer-Prozess läuft: True")
                
                # Optimizer-Prozess prüfen
                if processes["optimizer"] is not None and self.args.with_optimizer:
                    if processes["optimizer"].poll() is not None:
                        logger.warning("Optimizer-Prozess wurde beendet, versuche Neustart...")
                        self._start_optimizer()
                    else:
                        logger.debug("Optimizer-Prozess läuft: True")
                
                # Dashboard-Prozess prüfen
                if processes["dashboard"] is not None and self.args.with_dashboard:
                    if processes["dashboard"].poll() is not None:
                        logger.warning("Dashboard-Prozess wurde beendet, versuche Neustart...")
                        self._start_dashboard()
                    else:
                        logger.debug("Dashboard-Prozess läuft: True")
                
            except Exception as e:
                logger.error(f"Fehler beim Überwachen der Prozesse: {str(e)}")
            
            # Alle 5 Sekunden prüfen
            time.sleep(5)
    
    def shutdown(self):
        """Beendet alle laufenden Prozesse und Komponenten"""
        logger.info("Herunterfahren aller Komponenten...")
        self.running = False
        
        # Alle Prozesse sauber beenden
        for name, process in processes.items():
            if process is not None and process.poll() is None:
                logger.info(f"Beende {name}-Prozess...")
                try:
                    if sys.platform == 'win32':
                        # Windows-spezifisches Beenden
                        subprocess.run(['taskkill', '/F', '/T', '/PID', str(process.pid)])
                    else:
                        # Unix-basiertes Beenden
                        process.terminate()
                        try:
                            process.wait(timeout=5)
                        except subprocess.TimeoutExpired:
                            logger.warning(f"{name}-Prozess reagiert nicht, erzwinge Beendigung...")
                            process.kill()
                except Exception as e:
                    logger.error(f"Fehler beim Beenden des {name}-Prozesses: {str(e)}")
        
        logger.info("=== ERP-System wurde heruntergefahren ===")

def signal_handler(sig, frame):
    """Signal-Handler für graceful Shutdown"""
    logger.info("Shutdown-Signal empfangen...")
    if 'manager' in globals():
        manager.shutdown()
    sys.exit(0)

def main():
    """Hauptfunktion"""
    # Kommandozeilenargumente verarbeiten
    parser = argparse.ArgumentParser(description="ERP-System Starter")
    
    # Server-Parameter
    parser.add_argument("--server-port", type=int, default=DEFAULT_SERVER_PORT, 
                        help=f"Port für den ERP-Server (Standard: {DEFAULT_SERVER_PORT})")
    parser.add_argument("--workers", type=int, default=DEFAULT_WORKERS,
                        help=f"Anzahl der Worker-Prozesse (Standard: {DEFAULT_WORKERS})")
    parser.add_argument("--log-level", type=str, choices=["debug", "info", "warning", "error", "critical"],
                        default=DEFAULT_LOG_LEVEL, help=f"Logging-Level (Standard: {DEFAULT_LOG_LEVEL})")
    
    # Komponenten-Auswahl
    parser.add_argument("--no-server", action="store_true", help="Server nicht starten")
    parser.add_argument("--with-observer", action="store_true", help="Observer-Service starten")
    parser.add_argument("--with-optimizer", action="store_true", help="Performance-Optimizer starten")
    parser.add_argument("--with-dashboard", action="store_true", help="Performance-Dashboard starten")
    
    # Dashboard-Parameter
    parser.add_argument("--dashboard-port", type=int, default=DEFAULT_DASHBOARD_PORT,
                        help=f"Port für das Performance-Dashboard (Standard: {DEFAULT_DASHBOARD_PORT})")
    parser.add_argument("--no-browser", dest="open_browser", action="store_false",
                        help="Browser nicht automatisch öffnen")
    
    # Benchmark-Parameter
    parser.add_argument("--run-benchmark", action="store_true", help="Performance-Benchmark ausführen")
    parser.add_argument("--benchmark-requests", type=int, default=100,
                        help="Anzahl der Requests pro Endpoint für den Benchmark (Standard: 100)")
    parser.add_argument("--benchmark-concurrency", type=int, default=10,
                        help="Anzahl der gleichzeitigen Anfragen für den Benchmark (Standard: 10)")
    
    # Allgemeine Parameter
    parser.add_argument("--monitoring-interval", type=int, default=5,
                        help="Intervall für Monitoring in Sekunden (Standard: 5)")
    parser.add_argument("--optimization-interval", type=int, default=30,
                        help="Intervall für Optimierungen in Sekunden (Standard: 30)")
    parser.add_argument("--verbose", action="store_true", help="Ausführliche Ausgabe aktivieren")
    
    # Modi
    parser.add_argument("--all", action="store_true", 
                        help="Alle Komponenten starten (Server, Observer, Optimizer, Dashboard)")
    parser.add_argument("--monitoring-only", action="store_true", 
                        help="Nur Monitoring-Komponenten starten (Observer, Dashboard)")
    parser.add_argument("--benchmark-only", action="store_true",
                        help="Nur Benchmark ausführen und dann beenden")
    
    args = parser.parse_args()
    
    # Verarbeite Modus-Flags
    if args.all:
        args.with_observer = True
        args.with_optimizer = True
        args.with_dashboard = True
    
    if args.monitoring_only:
        args.no_server = True
        args.with_observer = True
        args.with_dashboard = True
    
    if args.benchmark_only:
        args.run_benchmark = True
        args.with_observer = False
        args.with_optimizer = False
        args.with_dashboard = False
    
    # Signal-Handler registrieren
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # ERP-System Manager erstellen und starten
    global manager
    manager = ERPSystemManager(args)
    
    # Cleanup-Handler registrieren
    atexit.register(manager.shutdown)
    
    if args.benchmark_only:
        # Nur Benchmark ausführen
        if not args.no_server:
            manager._start_server()
            time.sleep(2)  # Warte bis Server bereit ist
        success = manager._run_benchmark()
        manager.shutdown()
        sys.exit(0 if success else 1)
    else:
        # Normale Ausführung
        manager.start()

if __name__ == "__main__":
    main() 