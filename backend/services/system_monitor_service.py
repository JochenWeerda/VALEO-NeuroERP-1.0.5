from sqlalchemy.orm import Session
import psutil
import os
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class SystemMonitorService:
    """Service zur Überwachung des Systemzustands und zur Erkennung kritischer Zustände."""
    
    def __init__(self, db: Session):
        self.db = db
        
    def get_system_status(self) -> Dict[str, Any]:
        """
        Ruft den aktuellen Systemstatus ab und prüft auf kritische Zustände.
        Gibt nur die wichtigsten Informationen zurück.
        """
        status = {
            "status": "ok",
            "warnings": [],
            "critical_issues": [],
            "timestamp": datetime.now().isoformat(),
            "system_metrics": self._get_system_metrics(),
            "service_status": self._check_services_status()
        }
        
        # Kritische Zustände prüfen
        self._check_critical_conditions(status)
        
        return status
    
    def _get_system_metrics(self) -> Dict[str, Any]:
        """Sammelt die wichtigsten Systemmetriken."""
        try:
            metrics = {
                "cpu_usage": psutil.cpu_percent(interval=0.5),
                "memory_usage": psutil.virtual_memory().percent,
                "disk_usage": psutil.disk_usage('/').percent
            }
            return metrics
        except Exception as e:
            logger.error(f"Fehler beim Sammeln der Systemmetriken: {str(e)}")
            return {"error": "Systemmetriken konnten nicht abgerufen werden"}
    
    def _check_services_status(self) -> Dict[str, str]:
        """Prüft den Status der wichtigsten Dienste."""
        services = {
            "database": self._check_database_status(),
            "celery_worker": self._check_celery_status(),
            "api_server": "running"  # Wenn dieser Code ausgeführt wird, läuft der API-Server
        }
        return services
    
    def _check_database_status(self) -> str:
        """Prüft den Status der Datenbankverbindung."""
        try:
            # Einfache Abfrage zur Überprüfung der Datenbankverbindung
            self.db.execute("SELECT 1").scalar()
            return "running"
        except Exception as e:
            logger.error(f"Datenbankverbindungsfehler: {str(e)}")
            return "error"
    
    def _check_celery_status(self) -> str:
        """Prüft den Status des Celery-Workers."""
        try:
            # Hier könnte eine Celery-Inspektion durchgeführt werden
            # Dies ist eine vereinfachte Implementierung
            celery_pid_file = "/tmp/celery.pid"
            if os.path.exists(celery_pid_file):
                with open(celery_pid_file, 'r') as f:
                    pid = int(f.read().strip())
                if psutil.pid_exists(pid):
                    return "running"
            return "not_running"
        except Exception as e:
            logger.error(f"Fehler beim Prüfen des Celery-Status: {str(e)}")
            return "unknown"
    
    def _check_critical_conditions(self, status: Dict[str, Any]) -> None:
        """Prüft auf kritische Systemzustände und aktualisiert den Status entsprechend."""
        metrics = status["system_metrics"]
        services = status["service_status"]
        
        # CPU-Auslastung prüfen
        if metrics.get("cpu_usage", 0) > 90:
            status["critical_issues"].append({
                "type": "high_cpu_usage",
                "message": f"Kritische CPU-Auslastung: {metrics['cpu_usage']}%"
            })
        elif metrics.get("cpu_usage", 0) > 75:
            status["warnings"].append({
                "type": "elevated_cpu_usage",
                "message": f"Erhöhte CPU-Auslastung: {metrics['cpu_usage']}%"
            })
        
        # Speicherauslastung prüfen
        if metrics.get("memory_usage", 0) > 90:
            status["critical_issues"].append({
                "type": "high_memory_usage",
                "message": f"Kritische Speicherauslastung: {metrics['memory_usage']}%"
            })
        elif metrics.get("memory_usage", 0) > 80:
            status["warnings"].append({
                "type": "elevated_memory_usage",
                "message": f"Erhöhte Speicherauslastung: {metrics['memory_usage']}%"
            })
        
        # Festplattenauslastung prüfen
        if metrics.get("disk_usage", 0) > 90:
            status["critical_issues"].append({
                "type": "high_disk_usage",
                "message": f"Kritische Festplattenauslastung: {metrics['disk_usage']}%"
            })
        elif metrics.get("disk_usage", 0) > 80:
            status["warnings"].append({
                "type": "elevated_disk_usage",
                "message": f"Erhöhte Festplattenauslastung: {metrics['disk_usage']}%"
            })
        
        # Dienststatus prüfen
        if services.get("database") != "running":
            status["critical_issues"].append({
                "type": "database_error",
                "message": "Datenbankdienst ist nicht verfügbar"
            })
        
        if services.get("celery_worker") != "running":
            status["warnings"].append({
                "type": "celery_not_running",
                "message": "Celery-Worker ist nicht aktiv"
            })
        
        # Gesamtstatus aktualisieren
        if status["critical_issues"]:
            status["status"] = "critical"
        elif status["warnings"]:
            status["status"] = "warning" 