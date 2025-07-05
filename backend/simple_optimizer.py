"""
Simple Performance Optimizer für das AI-gesteuerte ERP-System
Reagiert automatisch auf Performance-Probleme des Servers
"""

import os
import json
import logging
import time
from datetime import datetime
from pathlib import Path
import sys
import requests
from typing import Dict, List, Any, Optional, Tuple, Union

# Logging konfigurieren
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('optimizer.log')
    ]
)
logger = logging.getLogger("performance_optimizer")

class SimpleOptimizer:
    """
    Einfacher Performance-Optimizer, der auf verschiedene Performance-Metriken 
    reagiert und versucht, Systemparameter automatisch zu optimieren.
    """
    
    def __init__(self, config_path: str = "optimizer_config.json"):
        """
        Initialisiert den SimpleOptimizer
        
        Args:
            config_path: Pfad zur Konfigurationsdatei
        """
        self.config = self._load_config(config_path)
        self.thresholds = self.config.get("thresholds", {})
        self.actions = self.config.get("actions", {})
        self.server_url = self.config.get("server_url", "http://localhost:8000")
        self.history: List[Dict[str, Any]] = []
        self.last_action_time: Dict[str, float] = {}
        self.cooldown_period = self.config.get("cooldown_period", 300)  # 5 Minuten Standardwert
        
        logger.info(f"SimpleOptimizer initialisiert mit Server-URL: {self.server_url}")
        logger.info(f"Schwellenwerte: {self.thresholds}")
    
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
            "thresholds": {
                "cpu_usage_percent": 80.0,
                "memory_usage_percent": 85.0,
                "average_response_time_ms": 500.0,
                "error_rate_percent": 5.0
            },
            "actions": {
                "high_cpu": {
                    "description": "Reduziert die CPU-Last",
                    "cooldown": 600,
                    "commands": [
                        {"action": "adjust_workers", "value": "-1"}
                    ]
                },
                "high_memory": {
                    "description": "Reduziert den Speicherverbrauch",
                    "cooldown": 600,
                    "commands": [
                        {"action": "restart_server", "value": ""}
                    ]
                },
                "high_response_time": {
                    "description": "Optimiert die Antwortzeit",
                    "cooldown": 300,
                    "commands": [
                        {"action": "clear_cache", "value": ""}
                    ]
                }
            },
            "cooldown_period": 300
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
            response.raise_for_status()
            metrics = response.json()
            logger.debug(f"Server-Metriken abgerufen: {metrics}")
            return metrics
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der Server-Metriken: {str(e)}")
            return {}
    
    def analyze_metrics(self, metrics: Dict[str, Any]) -> List[str]:
        """
        Analysiert die Server-Metriken und identifiziert potenzielle Probleme
        
        Args:
            metrics: Dictionary mit Server-Metriken
            
        Returns:
            Liste der identifizierten Probleme
        """
        if not metrics:
            return []
        
        issues = []
        server_metrics = metrics.get("metrics", {})
        
        # CPU-Auslastung prüfen
        cpu_usage = server_metrics.get("cpu_usage_percent", 0)
        if cpu_usage > self.thresholds.get("cpu_usage_percent", 80):
            issues.append("high_cpu")
            logger.warning(f"Hohe CPU-Auslastung erkannt: {cpu_usage}%")
        
        # Speicherauslastung prüfen
        memory_usage = server_metrics.get("memory_usage_percent", 0)
        if memory_usage > self.thresholds.get("memory_usage_percent", 85):
            issues.append("high_memory")
            logger.warning(f"Hohe Speicherauslastung erkannt: {memory_usage}%")
        
        # Antwortzeit prüfen
        response_time = server_metrics.get("average_response_time_ms", 0)
        if response_time > self.thresholds.get("average_response_time_ms", 500):
            issues.append("high_response_time")
            logger.warning(f"Hohe Antwortzeit erkannt: {response_time} ms")
        
        # Weitere Metriken können hier hinzugefügt werden
        
        return issues
    
    def take_action(self, issues: List[str]) -> bool:
        """
        Führt Aktionen basierend auf identifizierten Problemen aus
        
        Args:
            issues: Liste der identifizierten Probleme
            
        Returns:
            True, wenn Aktionen ausgeführt wurden, sonst False
        """
        if not issues:
            return False
        
        actions_taken = False
        current_time = time.time()
        
        for issue in issues:
            # Prüfen, ob die Aktion im Cooldown ist
            if issue in self.last_action_time:
                last_time = self.last_action_time[issue]
                if current_time - last_time < self.actions.get(issue, {}).get("cooldown", self.cooldown_period):
                    logger.info(f"Aktion '{issue}' ist im Cooldown, überspringe...")
                    continue
            
            # Aktion ausführen
            if issue in self.actions:
                action_config = self.actions[issue]
                logger.info(f"Führe Aktion für Problem '{issue}' aus: {action_config['description']}")
                
                for command in action_config.get("commands", []):
                    action_type = command.get("action", "")
                    action_value = command.get("value", "")
                    
                    success = self._execute_action(action_type, action_value)
                    if success:
                        self.last_action_time[issue] = current_time
                        actions_taken = True
                        
                        # Aktion protokollieren
                        self.history.append({
                            "timestamp": datetime.now().isoformat(),
                            "issue": issue,
                            "action": action_type,
                            "value": action_value
                        })
            else:
                logger.warning(f"Keine Aktion für Problem '{issue}' definiert")
        
        # Historie in Datei schreiben
        self._save_history()
        
        return actions_taken
    
    def _execute_action(self, action_type: str, action_value: str) -> bool:
        """
        Führt eine spezifische Aktion aus
        
        Args:
            action_type: Typ der Aktion
            action_value: Wert/Parameter für die Aktion
            
        Returns:
            True bei Erfolg, False bei Misserfolg
        """
        try:
            if action_type == "adjust_workers":
                # Beispiel: Worker-Anzahl anpassen
                logger.info(f"Worker-Anzahl anpassen: {action_value}")
                # In einer echten Implementierung würde hier die Worker-Anzahl angepasst werden
                return True
                
            elif action_type == "restart_server":
                # Beispiel: Server neustarten
                logger.info("Server-Neustart initiiert")
                # In einer echten Implementierung würde hier der Server neugestartet werden
                return True
                
            elif action_type == "clear_cache":
                # Beispiel: Cache leeren
                logger.info("Cache-Löschung initiiert")
                try:
                    response = requests.post(f"{self.server_url}/api/admin/clear_cache")
                    response.raise_for_status()
                    return True
                except Exception as e:
                    logger.error(f"Fehler beim Leeren des Caches: {str(e)}")
                    return False
                
            else:
                logger.warning(f"Unbekannter Aktionstyp: {action_type}")
                return False
                
        except Exception as e:
            logger.error(f"Fehler bei Ausführung der Aktion {action_type}: {str(e)}")
            return False
    
    def _save_history(self):
        """Speichert die Aktions-Historie in einer JSON-Datei"""
        try:
            with open("optimizer_history.json", 'w') as f:
                json.dump(self.history, f, indent=2)
        except Exception as e:
            logger.error(f"Fehler beim Speichern der Historie: {str(e)}")
    
    def run_optimization_cycle(self):
        """Führt einen vollständigen Optimierungszyklus aus"""
        logger.info("Starte Optimierungszyklus...")
        
        # Metriken abrufen
        metrics = self.get_server_metrics()
        if not metrics:
            logger.warning("Keine Metriken verfügbar, überspringe Zyklus")
            return
        
        # Metriken analysieren
        issues = self.analyze_metrics(metrics)
        if issues:
            logger.info(f"Identifizierte Probleme: {', '.join(issues)}")
            
            # Aktionen ausführen
            actions_taken = self.take_action(issues)
            if actions_taken:
                logger.info("Optimierungsaktionen wurden ausgeführt")
            else:
                logger.info("Keine Optimierungsaktionen ausgeführt")
        else:
            logger.info("Keine Performance-Probleme erkannt")

def main():
    """Hauptfunktion für die Ausführung des Optimizers"""
    # Konfigurationspfad bestimmen
    config_path = os.environ.get("OPTIMIZER_CONFIG", "optimizer_config.json")
    
    # Optimizer erstellen
    optimizer = SimpleOptimizer(config_path)
    
    # Intervall für Optimierungszyklen (in Sekunden)
    interval = 60
    
    logger.info(f"Performance-Optimizer gestartet, Intervall: {interval} Sekunden")
    
    try:
        while True:
            # Optimierungszyklus ausführen
            optimizer.run_optimization_cycle()
            
            # Warten bis zum nächsten Zyklus
            logger.info(f"Warte {interval} Sekunden bis zum nächsten Optimierungszyklus...")
            time.sleep(interval)
    
    except KeyboardInterrupt:
        logger.info("Performance-Optimizer beendet durch Benutzer")
    except Exception as e:
        logger.error(f"Unerwarteter Fehler: {str(e)}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main()) 