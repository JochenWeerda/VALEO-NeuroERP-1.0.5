"""
Starter-Skript für den Microservice Observer und Performance Optimizer
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
from observer_service import MicroserviceObserver
from performance_optimizer import PerformanceOptimizer

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
        self.dashboard_thread = None
        self.metrics_export_interval = 15  # Minuten
        self.report_generation_interval = 60  # Minuten
        self.metrics_file = "observer_metrics.json"
    
    def export_metrics(self):
        """Exportiert die aktuellen Metriken in eine JSON-Datei"""
        if not self.observer:
            logger.warning("Observer ist nicht initialisiert, keine Metriken zum Exportieren")
            return
        
        try:
            with open(self.metrics_file, 'w') as f:
                json.dump(self.observer.metrics, f, indent=2)
            logger.info(f"Metriken exportiert nach {self.metrics_file}")
        except Exception as e:
            logger.error(f"Fehler beim Exportieren der Metriken: {e}")
    
    def generate_optimization_report(self):
        """Generiert einen Optimierungsbericht"""
        if not self.optimizer:
            logger.warning("Optimizer ist nicht initialisiert, kein Bericht möglich")
            return
        
        try:
            # Aktuelle Metriken exportieren
            self.export_metrics()
            
            # Bericht generieren
            timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
            report_file = f"optimization_report_{timestamp}.md"
            self.optimizer.generate_report(output_file=report_file)
            logger.info(f"Optimierungsbericht generiert: {report_file}")
        except Exception as e:
            logger.error(f"Fehler bei der Berichtgenerierung: {e}")
    
    def start_observer_dashboard(self):
        """Startet das Observer-Dashboard in einem separaten Thread"""
        from starlette.applications import Starlette
        from observer_service import create_app
        import uvicorn
        
        app = create_app(self.observer)
        
        # In einem Thread starten, damit das Hauptprogramm weiterlaufen kann
        def run_server():
            uvicorn.run(app, host="0.0.0.0", port=8010)
        
        self.dashboard_thread = threading.Thread(target=run_server)
        self.dashboard_thread.daemon = True
        self.dashboard_thread.start()
        logger.info("Observer-Dashboard gestartet auf http://localhost:8010")
    
    def schedule_tasks(self):
        """Plant regelmäßige Aufgaben"""
        # Metriken regelmäßig exportieren
        schedule.every(self.metrics_export_interval).minutes.do(self.export_metrics)
        
        # Optimierungsbericht regelmäßig generieren
        schedule.every(self.report_generation_interval).minutes.do(self.generate_optimization_report)
        
        # Initial einmal ausführen
        self.export_metrics()
        self.generate_optimization_report()
        
        logger.info(f"Geplante Aufgaben: Metrik-Export alle {self.metrics_export_interval} Minuten, "
                   f"Optimierungsbericht alle {self.report_generation_interval} Minuten")
    
    def run_scheduler(self):
        """Führt den Scheduler in einer Endlosschleife aus"""
        while True:
            schedule.run_pending()
            time.sleep(1)
    
    def start(self):
        """Startet den Observer und den Optimizer"""
        try:
            # Observer initialisieren und starten
            logger.info("Initialisiere Observer...")
            self.observer = MicroserviceObserver()
            self.observer.start_monitoring()
            logger.info("Observer gestartet")
            
            # Optimizer initialisieren
            logger.info("Initialisiere Performance-Optimizer...")
            self.optimizer = PerformanceOptimizer()
            logger.info("Optimizer initialisiert")
            
            # Dashboard starten
            logger.info("Starte Observer-Dashboard...")
            self.start_observer_dashboard()
            
            # Regelmäßige Aufgaben planen
            self.schedule_tasks()
            
            # Scheduler starten
            logger.info("Starte Scheduler für wiederkehrende Aufgaben...")
            self.run_scheduler()
            
        except KeyboardInterrupt:
            logger.info("Prozess wird durch Benutzer beendet")
        except Exception as e:
            logger.error(f"Fehler beim Starten der Services: {e}")
        finally:
            # Aufräumen
            if self.observer:
                self.observer.stop_monitoring()
                logger.info("Observer gestoppt")

def parse_arguments():
    """Kommandozeilenargumente verarbeiten"""
    parser = argparse.ArgumentParser(description="Microservice Observer und Performance Optimizer")
    parser.add_argument("--metrics-interval", type=int, default=15,
                        help="Intervall für Metrik-Export in Minuten (Standard: 15)")
    parser.add_argument("--report-interval", type=int, default=60,
                        help="Intervall für Berichtgenerierung in Minuten (Standard: 60)")
    parser.add_argument("--dashboard-only", action="store_true",
                        help="Nur das Dashboard starten, keine Metriken sammeln")
    return parser.parse_args()

if __name__ == "__main__":
    # Kommandozeilenargumente verarbeiten
    args = parse_arguments()
    
    # Starter initialisieren
    starter = ObserverStarter()
    
    # Intervalle setzen
    starter.metrics_export_interval = args.metrics_interval
    starter.report_generation_interval = args.report_interval
    
    # Dashboard-Only-Modus
    if args.dashboard_only:
        logger.info("Starte im Dashboard-Only-Modus")
        # Observer laden, aber keine Überwachung starten
        starter.observer = MicroserviceObserver()
        starter.start_observer_dashboard()
        while True:
            time.sleep(1)
    else:
        # Vollständigen Start durchführen
        starter.start() 