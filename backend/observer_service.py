"""
Observer-Service für das AI-gesteuerte ERP-System
Überwacht die Performance-Metriken und reagiert auf potenzielle Probleme
"""

import os
import sys
import json
import time
import logging
import requests
import psutil
import signal
import threading
import schedule
import subprocess
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional, Union, Tuple
import matplotlib.pyplot as plt
import numpy as np
from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel

# Eigene Module importieren
try:
    from simple_optimizer import SimpleOptimizer
except ImportError:
    # Wenn nicht gefunden, versuche relativen Import
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    try:
        from simple_optimizer import SimpleOptimizer
    except ImportError:
        print("WARNUNG: simple_optimizer konnte nicht importiert werden. Automatische Optimierung deaktiviert.")
        SimpleOptimizer = None

# Logging konfigurieren
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('observer.log')
    ]
)
logger = logging.getLogger("observer_service")

# TODO: Erweiterung für zentrales IP-Adressmanagement
# Der Observer-Service soll um Funktionen für ein zentrales IP-Adressmanagement erweitert werden.
# Dies würde die Zuweisung und Verwaltung von IP-Adressen und Ports für alle Microservices
# zentralisieren und so Konflikte vermeiden.
#
# Geplante Erweiterungen:
# - Registry für IP-Adressen und Ports
# - Dynamische Portzuweisung für Microservices
# - Konfliktlösung bei bereits belegten Ports
# - Service-Discovery-Endpunkte
# - Unterstützung für verschiedene Umgebungen (Entwicklung, Test, Produktion)
# - Vorbereitung für die Containerisierung
#
# Diese Erweiterungen würden die Robustheit des Systems erhöhen und die Bereitstellung
# in verschiedenen Umgebungen erleichtern.
#
# Siehe memory-bank/archive/archive-ip-management.md für das vollständige Konzept.

class ServiceInfo(BaseModel):
    """Modell für die Registrierung eines Services"""
    service_name: str
    host: str
    port: int
    health_endpoint: str = "/health"
    metrics_endpoint: Optional[str] = "/metrics"
    restart_script: Optional[str] = None
    system_info: Optional[str] = None
    additional_info: Optional[Dict[str, Any]] = None

class ObserverService:
    """
    Observer-Service zur Überwachung der Performance des ERP-Systems und 
    zur Ausführung automatischer Optimierungsmaßnahmen.
    """
    
    def __init__(self, config_path: str = "observer_config.json"):
        """
        Initialisiert den Observer-Service
        
        Args:
            config_path: Pfad zur Konfigurationsdatei
        """
        self.config = self._load_config(config_path)
        self.server_url = self.config.get("server_url", "http://localhost:8000")
        self.metrics_history: List[Dict[str, Any]] = []
        self.max_history_size = self.config.get("max_history_size", 1000)
        self.alert_thresholds = self.config.get("alert_thresholds", {})
        self.check_interval = self.config.get("check_interval", 60)  # Sekunden
        self.data_dir = Path(self.config.get("data_dir", "observer_data"))
        self.chart_dir = self.data_dir / "charts"
        self.running = False
        self.optimizer = None
        self.registered_services = []
        self.service_health_checks = {}
        self.enable_auto_restart = self.config.get("enable_auto_restart", True)
        self.health_check_failures_threshold = self.config.get("health_check_failures_threshold", 3)
        self.restart_scripts_dir = Path(self.config.get("restart_scripts_dir", "restart_scripts"))
        
        # Verzeichnisse erstellen, falls nicht vorhanden
        self.data_dir.mkdir(exist_ok=True)
        self.chart_dir.mkdir(exist_ok=True)
        self.restart_scripts_dir.mkdir(exist_ok=True)
        
        # Laden der bereits registrierten Services, falls vorhanden
        self._load_registered_services()
        
        # Optimizer erstellen, wenn verfügbar
        if SimpleOptimizer is not None and self.config.get("enable_optimizer", False):
            optimizer_config = self.config.get("optimizer_config", "optimizer_config.json")
            self.optimizer = SimpleOptimizer(optimizer_config)
            logger.info(f"SimpleOptimizer initialisiert mit Konfiguration: {optimizer_config}")
        
        logger.info(f"ObserverService initialisiert mit Server-URL: {self.server_url}")
        logger.info(f"Überwachungsintervall: {self.check_interval} Sekunden")
        
        # API-Endpunkte registrieren
        self._register_endpoints()
    
    def _load_config(self, config_path: str) -> Dict[str, Any]:
        """
        Lädt die Konfiguration aus einer JSON-Datei
        
        Args:
            config_path: Pfad zur Konfigurationsdatei
            
        Returns:
            Die geladene Konfiguration als Dictionary
        """
        default_config = {
            "server_url": "http://localhost:8000",
            "check_interval": 60,
            "max_history_size": 1000,
            "data_dir": "observer_data",
            "alert_thresholds": {
                "cpu_usage_percent": 85.0,
                "memory_usage_percent": 90.0,
                "average_response_time_ms": 1000.0,
                "error_rate_percent": 10.0
            },
            "enable_optimizer": False,
            "optimizer_config": "optimizer_config.json",
            "chart_generation_interval": 3600,  # 1 Stunde
            "enable_auto_restart": True,
            "health_check_failures_threshold": 3,
            "restart_scripts_dir": "restart_scripts"
        }
        
        try:
            if os.path.exists(config_path):
                with open(config_path, 'r') as f:
                    loaded_config = json.load(f)
                logger.info(f"Konfiguration geladen aus: {config_path}")
                
                # Zusammenführen mit Standard-Konfiguration
                for key, value in loaded_config.items():
                    if isinstance(value, dict) and key in default_config:
                        default_config[key].update(value)
                    else:
                        default_config[key] = value
                        
                return default_config
            else:
                logger.warning(f"Konfigurationsdatei nicht gefunden: {config_path}")
                logger.info("Erstelle Standard-Konfigurationsdatei...")
                
                # Standard-Konfiguration speichern
                with open(config_path, 'w') as f:
                    json.dump(default_config, f, indent=2)
                
                return default_config
        except Exception as e:
            logger.error(f"Fehler beim Laden der Konfiguration: {str(e)}")
            return default_config
    
    def get_server_metrics(self) -> Dict[str, Any]:
        """
        Ruft die Performance-Metriken vom Server ab
        
        Returns:
            Dictionary mit Server-Metriken oder leeres Dictionary bei Fehler
        """
        try:
            response = requests.get(f"{self.server_url}/health", timeout=5)
            if response.status_code == 200:
                metrics = response.json()
                logger.debug(f"Server-Metriken abgerufen: {metrics}")
                
                # Zeitstempel hinzufügen
                metrics["timestamp"] = datetime.now().isoformat()
                
                return metrics
            else:
                logger.error(f"Fehler beim Abrufen der Metriken: HTTP {response.status_code}")
                return {}
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der Server-Metriken: {str(e)}")
            return {}
    
    def check_alerts(self, metrics: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Prüft, ob Metriken Schwellenwerte überschreiten und generiert Alerts
        
        Args:
            metrics: Dictionary mit Server-Metriken
            
        Returns:
            Liste der generierten Alerts
        """
        if not metrics:
            return []
        
        alerts = []
        server_metrics = metrics.get("metrics", {})
        timestamp = metrics.get("timestamp", datetime.now().isoformat())
        
        # CPU-Auslastung prüfen
        cpu_usage = server_metrics.get("cpu_usage_percent", 0)
        cpu_threshold = self.alert_thresholds.get("cpu_usage_percent", 85)
        if cpu_usage > cpu_threshold:
            alerts.append({
                "timestamp": timestamp,
                "type": "high_cpu",
                "metric": "cpu_usage_percent",
                "value": cpu_usage,
                "threshold": cpu_threshold,
                "message": f"Hohe CPU-Auslastung: {cpu_usage}% (Schwellenwert: {cpu_threshold}%)"
            })
        
        # Speicherauslastung prüfen
        memory_usage = server_metrics.get("memory_usage_percent", 0)
        memory_threshold = self.alert_thresholds.get("memory_usage_percent", 90)
        if memory_usage > memory_threshold:
            alerts.append({
                "timestamp": timestamp,
                "type": "high_memory",
                "metric": "memory_usage_percent",
                "value": memory_usage,
                "threshold": memory_threshold,
                "message": f"Hohe Speicherauslastung: {memory_usage}% (Schwellenwert: {memory_threshold}%)"
            })
        
        # Antwortzeit prüfen
        response_time = server_metrics.get("average_response_time_ms", 0)
        response_time_threshold = self.alert_thresholds.get("average_response_time_ms", 1000)
        if response_time > response_time_threshold:
            alerts.append({
                "timestamp": timestamp,
                "type": "high_response_time",
                "metric": "average_response_time_ms",
                "value": response_time,
                "threshold": response_time_threshold,
                "message": f"Hohe Antwortzeit: {response_time} ms (Schwellenwert: {response_time_threshold} ms)"
            })
        
        # Weitere Metriken können hier hinzugefügt werden
        
        return alerts
    
    def save_metrics(self, metrics: Dict[str, Any]):
        """
        Speichert die Metriken in der Historie und in einer JSON-Datei
        
        Args:
            metrics: Dictionary mit Server-Metriken
        """
        if not metrics:
            return
        
        # Zur Historie hinzufügen
        self.metrics_history.append(metrics)
        
        # Historie auf maximale Größe begrenzen
        if len(self.metrics_history) > self.max_history_size:
            self.metrics_history = self.metrics_history[-self.max_history_size:]
        
        # Metriken für den aktuellen Tag speichern
        try:
            date_str = datetime.now().strftime("%Y-%m-%d")
            metrics_file = self.data_dir / f"metrics_{date_str}.json"
            
            # Bestehende Metriken laden, falls vorhanden
            if metrics_file.exists():
                with open(metrics_file, 'r') as f:
                    try:
                        daily_metrics = json.load(f)
                    except json.JSONDecodeError:
                        daily_metrics = []
            else:
                daily_metrics = []
            
            # Neue Metriken hinzufügen
            daily_metrics.append(metrics)
            
            # Metriken speichern
            with open(metrics_file, 'w') as f:
                json.dump(daily_metrics, f, indent=2)
                
            logger.debug(f"Metriken gespeichert in: {metrics_file}")
        except Exception as e:
            logger.error(f"Fehler beim Speichern der Metriken: {str(e)}")
    
    def save_alerts(self, alerts: List[Dict[str, Any]]):
        """
        Speichert Alerts in einer JSON-Datei
        
        Args:
            alerts: Liste der zu speichernden Alerts
        """
        if not alerts:
            return
        
        try:
            date_str = datetime.now().strftime("%Y-%m-%d")
            alerts_file = self.data_dir / f"alerts_{date_str}.json"
            
            # Bestehende Alerts laden, falls vorhanden
            if alerts_file.exists():
                with open(alerts_file, 'r') as f:
                    try:
                        daily_alerts = json.load(f)
                    except json.JSONDecodeError:
                        daily_alerts = []
            else:
                daily_alerts = []
            
            # Neue Alerts hinzufügen
            daily_alerts.extend(alerts)
            
            # Alerts speichern
            with open(alerts_file, 'w') as f:
                json.dump(daily_alerts, f, indent=2)
            
            logger.info(f"{len(alerts)} Alerts gespeichert in: {alerts_file}")
            
            # Alerts protokollieren
            for alert in alerts:
                logger.warning(f"ALERT: {alert['message']}")
        except Exception as e:
            logger.error(f"Fehler beim Speichern der Alerts: {str(e)}")
    
    def generate_charts(self):
        """Generiert Diagramme aus den gesammelten Metriken"""
        if not self.metrics_history:
            logger.info("Keine Metriken für die Diagrammerstellung verfügbar")
            return
        
        try:
            # Zeitstempel für die Diagramm-Dateinamen
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # Daten extrahieren
            timestamps = []
            cpu_values = []
            memory_values = []
            response_times = []
            
            for entry in self.metrics_history:
                try:
                    dt = datetime.fromisoformat(entry.get("timestamp", ""))
                    timestamps.append(dt)
                    
                    metrics = entry.get("metrics", {})
                    cpu_values.append(metrics.get("cpu_usage_percent", 0))
                    memory_values.append(metrics.get("memory_usage_percent", 0))
                    response_times.append(metrics.get("average_response_time_ms", 0))
                except (ValueError, TypeError) as e:
                    logger.warning(f"Fehler bei der Datenextraktion für Diagramme: {str(e)}")
                    continue
            
            if not timestamps:
                logger.warning("Keine gültigen Zeitstempel für die Diagrammerstellung gefunden")
                return
            
            # CPU-Auslastungs-Diagramm
            plt.figure(figsize=(12, 6))
            plt.plot(timestamps, cpu_values, 'b-', label='CPU-Auslastung (%)')
            plt.axhline(y=self.alert_thresholds.get("cpu_usage_percent", 85), color='r', linestyle='--', label='Schwellenwert')
            plt.title('CPU-Auslastung über Zeit')
            plt.xlabel('Zeit')
            plt.ylabel('CPU-Auslastung (%)')
            plt.grid(True)
            plt.legend()
            plt.xticks(rotation=45)
            plt.tight_layout()
            cpu_chart_path = self.chart_dir / f"cpu_usage_{timestamp}.png"
            plt.savefig(cpu_chart_path)
            plt.close()
            
            # Speicherauslastungs-Diagramm
            plt.figure(figsize=(12, 6))
            plt.plot(timestamps, memory_values, 'g-', label='Speicherauslastung (%)')
            plt.axhline(y=self.alert_thresholds.get("memory_usage_percent", 90), color='r', linestyle='--', label='Schwellenwert')
            plt.title('Speicherauslastung über Zeit')
            plt.xlabel('Zeit')
            plt.ylabel('Speicherauslastung (%)')
            plt.grid(True)
            plt.legend()
            plt.xticks(rotation=45)
            plt.tight_layout()
            memory_chart_path = self.chart_dir / f"memory_usage_{timestamp}.png"
            plt.savefig(memory_chart_path)
            plt.close()
            
            # Antwortzeit-Diagramm
            plt.figure(figsize=(12, 6))
            plt.plot(timestamps, response_times, 'm-', label='Antwortzeit (ms)')
            plt.axhline(y=self.alert_thresholds.get("average_response_time_ms", 1000), color='r', linestyle='--', label='Schwellenwert')
            plt.title('Antwortzeit über Zeit')
            plt.xlabel('Zeit')
            plt.ylabel('Antwortzeit (ms)')
            plt.grid(True)
            plt.legend()
            plt.xticks(rotation=45)
            plt.tight_layout()
            response_time_chart_path = self.chart_dir / f"response_time_{timestamp}.png"
            plt.savefig(response_time_chart_path)
            plt.close()
            
            logger.info(f"Diagramme erstellt in: {self.chart_dir}")
            
            # Aktuelle Diagramme auch unter festen Namen speichern für Dashboards
            cpu_chart_path_latest = self.chart_dir / "cpu_usage_latest.png"
            memory_chart_path_latest = self.chart_dir / "memory_usage_latest.png"
            response_time_chart_path_latest = self.chart_dir / "response_time_latest.png"
            
            # Kopieren der aktuellen Diagramme
            import shutil
            shutil.copy(cpu_chart_path, cpu_chart_path_latest)
            shutil.copy(memory_chart_path, memory_chart_path_latest)
            shutil.copy(response_time_chart_path, response_time_chart_path_latest)
            
        except Exception as e:
            logger.error(f"Fehler bei der Diagrammerstellung: {str(e)}")
    
    def _load_registered_services(self):
        """Lädt die Liste der bereits registrierten Services"""
        try:
            services_file = self.data_dir / "registered_services.json"
            if services_file.exists():
                with open(services_file, 'r') as f:
                    self.registered_services = json.load(f)
                logger.info(f"Registrierte Services geladen: {len(self.registered_services)}")
                
                # Initialisiere Health-Check-Zähler für geladene Services
                for service in self.registered_services:
                    service_id = self._get_service_id(service)
                    self.service_health_checks[service_id] = 0
        except Exception as e:
            logger.error(f"Fehler beim Laden der registrierten Services: {str(e)}")
            self.registered_services = []
    
    def _get_service_id(self, service_data: Dict[str, Any]) -> str:
        """Generiert eine eindeutige ID für einen Service"""
        service_name = service_data.get("service_name", "unknown")
        service_host = service_data.get("host", "localhost")
        service_port = service_data.get("port", "0")
        return f"{service_name}_{service_host}_{service_port}"
    
    def check_service_health(self, service_id: str) -> str:
        """
        Überprüft den Gesundheitszustand eines Services
        
        :param service_id: ID des zu überprüfenden Services
        :return: Status des Services ("healthy", "unhealthy" oder "unreachable")
        """
        if service_id not in self.registered_services:
            logger.warning(f"Service nicht gefunden: {service_id}")
            return "unknown"
            
        service_info = self.registered_services[service_id]
        health_url = f"http://{service_info['host']}:{service_info['port']}{service_info['health_endpoint']}"
        
        try:
            response = requests.get(health_url, timeout=5)
            
            if response.status_code == 200:
                status = "healthy"
            else:
                status = "unhealthy"
                
            # Service-Status aktualisieren
            self.registered_services[service_id].update({
                "last_checked": datetime.now().isoformat(),
                "status": status,
                "last_status_code": response.status_code
            })
            
            return status
            
        except requests.exceptions.RequestException as e:
            logger.warning(f"Fehler beim Health-Check für {service_id}: {str(e)}")
            
            # Service-Status aktualisieren
            self.registered_services[service_id].update({
                "last_checked": datetime.now().isoformat(),
                "status": "unreachable",
                "last_error": str(e)
            })
            
            return "unreachable"
    
    def restart_service(self, service_id: str) -> bool:
        """
        Startet einen Service neu
        
        :param service_id: ID des neu zu startenden Services
        :return: True, wenn der Neustart erfolgreich war, sonst False
        """
        if service_id not in self.registered_services:
            logger.warning(f"Service nicht gefunden: {service_id}")
            return False
            
        service_info = self.registered_services[service_id]
        restart_script = service_info.get("restart_script")
        
        if not restart_script:
            logger.error(f"Kein Neustart-Skript für Service {service_id} konfiguriert")
            return False
            
        # Prüfen, ob die Skriptdatei existiert
        if not os.path.exists(restart_script):
            logger.error(f"Neustart-Skript nicht gefunden: {restart_script}")
            return False
            
        try:
            # Service-Status aktualisieren
            self.registered_services[service_id].update({
                "status": "restarting",
                "last_restart_attempt": datetime.now().isoformat()
            })
            
            # Betriebssystem ermitteln und entsprechenden Befehl ausführen
            system_info = service_info.get("system_info", "").lower()
            
            if "windows" in system_info:
                # PowerShell-Skript ausführen
                result = subprocess.run(
                    ["powershell", "-ExecutionPolicy", "Bypass", "-File", restart_script],
                    capture_output=True,
                    text=True,
                    check=False
                )
            else:
                # Bash-Skript ausführen (Linux/Mac)
                result = subprocess.run(
                    ["bash", restart_script],
                    capture_output=True,
                    text=True,
                    check=False
                )
                
            # Ergebnis protokollieren
            logger.info(f"Neustart-Skript für {service_id} ausgeführt. Exit-Code: {result.returncode}")
            logger.debug(f"Ausgabe: {result.stdout}")
            
            if result.stderr:
                logger.warning(f"Fehlerausgabe: {result.stderr}")
                
            # Service-Status aktualisieren
            self.registered_services[service_id].update({
                "last_restart": datetime.now().isoformat(),
                "last_restart_exit_code": result.returncode,
                "last_restart_output": result.stdout[:500] if result.stdout else "",
                "last_restart_error": result.stderr[:500] if result.stderr else ""
            })
            
            # Nach dem Neustart kurz warten und erneut Health-Check durchführen
            time.sleep(5)
            new_status = self.check_service_health(service_id)
            
            return new_status == "healthy"
            
        except Exception as e:
            logger.error(f"Fehler beim Neustart von Service {service_id}: {str(e)}")
            
            # Service-Status aktualisieren
            self.registered_services[service_id].update({
                "status": "restart_failed",
                "last_restart_error": str(e)
            })
            
            return False
    
    def _register_endpoints(self):
        """Registriert die API-Endpunkte für den Observer-Service"""
        
        @self.app.get("/")
        async def root():
            return {"message": "Observer Service is running", "services_count": len(self.registered_services)}
            
        @self.app.get("/health")
        async def health():
            return {"status": "healthy", "timestamp": datetime.now().isoformat()}
            
        @self.app.get("/services")
        async def get_services():
            return {"services": self.registered_services}
            
        @self.app.post("/register")
        async def register_service(service_info: ServiceInfo):
            """Registriert einen neuen Service zur Überwachung"""
            service_id = f"{service_info.service_name}_{service_info.host}_{service_info.port}"
            
            # Service-Informationen speichern
            self.registered_services[service_id] = {
                "service_name": service_info.service_name,
                "host": service_info.host,
                "port": service_info.port,
                "health_endpoint": service_info.health_endpoint,
                "metrics_endpoint": service_info.metrics_endpoint,
                "restart_script": service_info.restart_script,
                "system_info": service_info.system_info,
                "registered_at": datetime.now().isoformat(),
                "last_checked": None,
                "status": "registered",
                "additional_info": service_info.additional_info or {}
            }
            
            logger.info(f"Service registriert: {service_id}")
            
            # Health-Check durchführen
            health_status = self.check_service_health(service_id)
            
            return {
                "service_id": service_id, 
                "registered": True, 
                "health_status": health_status
            }
            
        @self.app.post("/deregister")
        async def deregister_service(request: Request):
            """Meldet einen Service von der Überwachung ab"""
            data = await request.json()
            service_name = data.get("service_name")
            host = data.get("host")
            port = data.get("port")
            
            if not all([service_name, host, port]):
                raise HTTPException(status_code=400, detail="Unvollständige Service-Informationen")
                
            service_id = f"{service_name}_{host}_{port}"
            
            if service_id in self.registered_services:
                del self.registered_services[service_id]
                if service_id in self.service_health_checks:
                    del self.service_health_checks[service_id]
                logger.info(f"Service abgemeldet: {service_id}")
                return {"service_id": service_id, "deregistered": True}
            else:
                raise HTTPException(status_code=404, detail=f"Service nicht gefunden: {service_id}")
                
        @self.app.get("/service/{service_id}")
        async def get_service(service_id: str):
            """Gibt Informationen zu einem bestimmten Service zurück"""
            if service_id in self.registered_services:
                return {"service_id": service_id, "info": self.registered_services[service_id]}
            else:
                raise HTTPException(status_code=404, detail=f"Service nicht gefunden: {service_id}")
    
    def start_monitoring(self):
        """Startet den Überwachungs-Thread"""
        if self.running:
            logger.warning("Observer-Service läuft bereits")
            return
        
        self.running = True
        logger.info("Observer-Service gestartet")
        
        # Initiales Diagramm erstellen
        self.generate_charts()
        
        # Planen der regelmäßigen Diagrammerstellung
        chart_interval = self.config.get("chart_generation_interval", 3600)  # Standardmäßig stündlich
        schedule.every(chart_interval).seconds.do(self.generate_charts)
        
        # Signal-Handler für sauberes Beenden
        def signal_handler(sig, frame):
            logger.info("Beende Observer-Service...")
            self.stop()
            sys.exit(0)
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
        # Überwachungsschleife starten
        try:
            while self.running:
                self.run_monitoring_cycle()
                
                # Geplante Aufgaben ausführen
                schedule.run_pending()
                
                # Warten bis zum nächsten Zyklus
                time.sleep(self.check_interval)
        except Exception as e:
            logger.error(f"Fehler im Überwachungszyklus: {str(e)}")
            self.running = False
    
    def stop(self):
        """Stoppt den Observer-Service"""
        if not self.running:
            return
        
        self.running = False
        logger.info("Observer-Service gestoppt")
        
        # Abschließendes Diagramm erstellen
        self.generate_charts()
    
    def run_monitoring_cycle(self):
        """Führt einen Überwachungszyklus aus"""
        logger.debug("Starte Überwachungszyklus...")
        
        # Server-Metriken abrufen
        metrics = self.get_server_metrics()
        if not metrics:
            logger.warning("Keine Metriken verfügbar, überspringe Zyklus")
            return
        
        # Metriken speichern
        self.save_metrics(metrics)
        
        # Alerts prüfen und speichern
        alerts = self.check_alerts(metrics)
        if alerts:
            self.save_alerts(alerts)
        
        # Überprüfe die Gesundheit aller registrierten Services
        failed_services = self.check_service_health()
        
        # Versuche, ausgefallene Services neu zu starten
        for service in failed_services:
            service_name = service.get("service_name", "unknown")
            logger.warning(f"Service {service_name} ist ausgefallen, versuche Neustart...")
            self.restart_service(self._get_service_id(service))
        
        # Optimizer ausführen, wenn verfügbar und aktiviert
        if self.optimizer is not None:
            logger.debug("Führe Optimierungszyklus aus...")
            self.optimizer.run_optimization_cycle()

# API-Funktionen für Starlette
async def register_service_api(request):
    """API-Endpunkt zur Registrierung von Microservices"""
    from starlette.responses import JSONResponse
    
    observer = request.app.state.observer
    if not observer:
        return JSONResponse({"success": False, "message": "Observer nicht initialisiert"}, status_code=500)
    
    try:
        data = await request.json()
        result = observer.register_service(data)
        return JSONResponse(result)
    except Exception as e:
        logger.error(f"Fehler bei der API-Registrierung: {str(e)}")
        return JSONResponse({"success": False, "message": f"Fehler: {str(e)}"}, status_code=400)

def create_startup_scripts():
    """Erstellt Startup-Skripte für verschiedene Betriebssysteme"""
    # Windows-Batch-Skript
    windows_script = """@echo off
echo Starte Observer-Service...
python observer_service.py
pause
"""
    
    # Linux/macOS-Shell-Skript
    linux_script = """#!/bin/bash
echo "Starte Observer-Service..."
python3 observer_service.py
"""
    
    try:
        # Windows-Skript erstellen
        with open("start_observer.bat", 'w') as f:
            f.write(windows_script)
        
        # Linux-Skript erstellen
        with open("start_observer.sh", 'w') as f:
            f.write(linux_script)
        
        # Linux-Skript ausführbar machen (falls unter Linux/macOS)
        try:
            os.chmod("start_observer.sh", 0o755)
        except:
            pass
        
        logger.info("Startup-Skripte erstellt: start_observer.bat, start_observer.sh")
    except Exception as e:
        logger.error(f"Fehler beim Erstellen der Startup-Skripte: {str(e)}")

def main():
    """Hauptfunktion für die Ausführung des Observer-Service"""
    # Konfigurationspfad bestimmen
    config_path = os.environ.get("OBSERVER_CONFIG", "observer_config.json")
    
    # Startup-Skripte erstellen
    create_startup_scripts()
    
    # Observer-Service erstellen und starten
    observer = ObserverService(config_path)
    observer.start_monitoring()
    
    return 0

if __name__ == "__main__":
    sys.exit(main()) 