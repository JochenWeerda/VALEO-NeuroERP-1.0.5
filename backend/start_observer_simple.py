"""
Vereinfachtes Starter-Skript für den Microservice Observer
"""

import os
import sys
import time
import logging
import argparse
import threading
import schedule
import json
from datetime import datetime
from pathlib import Path

# Lokale Module importieren
from observer_service import ObserverService
from simple_optimizer import SimplePerformanceOptimizer

# Logging-Konfiguration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('observer_starter.log')
    ]
)
logger = logging.getLogger("observer_starter")

class ObserverStarter:
    def __init__(self):
        self.observer = None
        self.optimizer = None
        self.metrics_export_file = "observer_metrics.json"
        self.report_interval = 30  # Minuten
        self.args = self.parse_arguments()
        
    def parse_arguments(self):
        parser = argparse.ArgumentParser(description="Startet den Microservice Observer und Optimizer")
        parser.add_argument("--report-interval", type=int, default=30,
                           help="Intervall für Optimierungsberichte in Minuten (Standard: 30)")
        parser.add_argument("--config", type=str, default="observer_config.json",
                           help="Pfad zur Konfigurationsdatei (Standard: observer_config.json)")
        parser.add_argument("--no-optimizer", action="store_true",
                           help="Deaktiviert den Performance Optimizer")
        parser.add_argument("--port", type=int, default=8010,
                           help="Port für das Observer-Dashboard (Standard: 8010)")
        return parser.parse_args()
    
    def start_observer(self):
        """Startet den ObserverService"""
        try:
            self.observer = ObserverService(config_path=self.args.config)
            self.observer.start()
            logger.info("Observer gestartet")
            return True
        except Exception as e:
            logger.error(f"Fehler beim Starten des Observers: {e}")
            return False
    
    def start_optimizer(self):
        """Startet den SimplePerformanceOptimizer"""
        if self.args.no_optimizer:
            logger.info("Optimizer ist deaktiviert")
            return False
        
        try:
            self.optimizer = SimplePerformanceOptimizer(
                metrics_file=self.metrics_export_file,
                config_file=self.args.config
            )
            logger.info("Optimizer initialisiert")
            
            # Planen der regelmäßigen Berichterstellung
            self.report_interval = self.args.report_interval
            
            # Erste Analyse nach 5 Minuten Datensammlung
            schedule.every(5).minutes.do(self.generate_optimization_report)
            
            # Danach gemäß konfiguriertem Intervall
            schedule.every(self.report_interval).minutes.do(self.generate_optimization_report)
            
            # Scheduler in separatem Thread starten
            self.scheduler_thread = threading.Thread(target=self.run_scheduler)
            self.scheduler_thread.daemon = True
            self.scheduler_thread.start()
            
            logger.info(f"Optimizer gestartet, Berichte werden alle {self.report_interval} Minuten erstellt")
            return True
        except Exception as e:
            logger.error(f"Fehler beim Starten des Optimizers: {e}")
            return False
    
    def run_scheduler(self):
        """Führt den Scheduler für geplante Aufgaben aus"""
        while True:
            schedule.run_pending()
            time.sleep(1)
    
    def export_metrics(self):
        """Exportiert die aktuellen Metriken für den Optimizer"""
        if not self.observer:
            logger.error("Observer nicht initialisiert")
            return False
        
        try:
            with open(self.metrics_export_file, 'w') as f:
                json.dump({"metrics_history": self.observer.metrics_history}, f)
            logger.info(f"Metriken in {self.metrics_export_file} exportiert")
            return True
        except Exception as e:
            logger.error(f"Fehler beim Exportieren der Metriken: {e}")
            return False
    
    def generate_optimization_report(self):
        """Erstellt einen Optimierungsbericht"""
        if not self.optimizer:
            logger.error("Optimizer nicht initialisiert")
            return False
        
        try:
            # Aktuelle Metriken exportieren
            self.export_metrics()
            
            # Zeitstempel für den Berichtsnamen
            timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
            report_file = f"optimization_report_{timestamp}.md"
            
            # Bericht generieren
            self.optimizer.generate_report(output_file=report_file)
            logger.info(f"Optimierungsbericht erstellt: {report_file}")
            return True
        except Exception as e:
            logger.error(f"Fehler bei der Berichterstellung: {e}")
            return False
    
    def start(self):
        """Startet den Observer und Dashboard-Service"""
        # Observer starten
        if not self.start_observer():
            logger.error("Observer konnte nicht gestartet werden")
            return False
        
        # Optimizer starten (falls aktiviert)
        if not self.args.no_optimizer:
            self.start_optimizer()
        
        try:
            # Dashboard-Webserver starten
            import uvicorn
            from starlette.applications import Starlette
            from starlette.responses import JSONResponse
            from starlette.routing import Route
            
            async def health(request):
                return JSONResponse({"status": "healthy", "service": "observer-dashboard"})
            
            async def metrics(request):
                if self.observer and hasattr(self.observer, 'metrics_history'):
                    return JSONResponse({"metrics": self.observer.metrics_history[-10:]})
                return JSONResponse({"error": "Keine Metriken verfügbar"})
            
            routes = [
                Route("/health", health),
                Route("/metrics", metrics),
            ]
            
            app = Starlette(routes=routes)
            logger.info(f"Observer-Dashboard wird gestartet auf http://localhost:{self.args.port}")
            uvicorn.run(app, host="0.0.0.0", port=self.args.port)
            return True
        except KeyboardInterrupt:
            logger.info("Beendet durch Benutzer")
            return True
        except Exception as e:
            logger.error(f"Fehler beim Starten des Dashboards: {e}")
            return False
        finally:
            # Observer stoppen
            if self.observer:
                self.observer.stop()
                logger.info("Observer gestoppt")

if __name__ == "__main__":
    starter = ObserverStarter()
    starter.start() 