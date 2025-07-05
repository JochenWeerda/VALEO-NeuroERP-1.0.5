"""
Monitoring-Service für die Transaktionsverarbeitung.
"""

import time
import logging
import threading
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import statistics
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_

from backend.db.database import get_db
from backend.models.transaction_processing import Transaction, TransactionStatus
from backend.monitoring.prometheus_exporter import (
    transaction_count_gauge,
    transaction_processing_time_histogram,
    transaction_success_rate_gauge,
    transaction_failure_count_gauge,
    transaction_batch_size_histogram
)

logger = logging.getLogger(__name__)

class TransactionMonitoringService:
    """
    Service für das Monitoring der Transaktionsverarbeitung.
    Sammelt Metriken und stellt sie für Prometheus bereit.
    """
    
    def __init__(
        self,
        db_session: Optional[Session] = None,
        monitoring_interval: int = 60,  # Sekunden
        alert_threshold_success_rate: float = 95.0,  # Prozent
        alert_threshold_processing_time: float = 2.0  # Sekunden
    ):
        """
        Initialisiert den TransactionMonitoringService.
        
        Args:
            db_session: SQLAlchemy Datenbanksession
            monitoring_interval: Intervall für das Monitoring in Sekunden
            alert_threshold_success_rate: Schwellenwert für Erfolgsrate-Alarme (Prozent)
            alert_threshold_processing_time: Schwellenwert für Verarbeitungszeit-Alarme (Sekunden)
        """
        self.db = db_session or next(get_db())
        self.monitoring_interval = monitoring_interval
        self.alert_threshold_success_rate = alert_threshold_success_rate
        self.alert_threshold_processing_time = alert_threshold_processing_time
        self.running = False
        self.monitoring_thread = None
        self.last_metrics: Dict[str, Any] = {}
    
    def start(self):
        """Startet den Monitoring-Service."""
        if self.running:
            logger.warning("Monitoring-Service läuft bereits")
            return
        
        self.running = True
        self.monitoring_thread = threading.Thread(
            target=self._monitoring_loop,
            daemon=True
        )
        self.monitoring_thread.start()
        logger.info(f"Transaction-Monitoring-Service gestartet (Intervall: {self.monitoring_interval}s)")
    
    def stop(self):
        """Stoppt den Monitoring-Service."""
        if not self.running:
            logger.warning("Monitoring-Service läuft nicht")
            return
        
        self.running = False
        if self.monitoring_thread:
            self.monitoring_thread.join(timeout=5.0)
        logger.info("Transaction-Monitoring-Service gestoppt")
    
    def _monitoring_loop(self):
        """Hauptschleife für das Monitoring."""
        while self.running:
            try:
                self.collect_metrics()
            except Exception as e:
                logger.error(f"Fehler beim Sammeln der Metriken: {str(e)}")
            
            # Warten bis zum nächsten Intervall
            time.sleep(self.monitoring_interval)
    
    def collect_metrics(self):
        """
        Sammelt Metriken zur Transaktionsverarbeitung und aktualisiert Prometheus-Gauges.
        """
        # Zeitfenster für die Metriksammlung (letzte Stunde)
        time_window = datetime.now() - timedelta(hours=1)
        
        # Neue Session erstellen, um Konflikte zu vermeiden
        with Session(self.db.bind) as session:
            # Gesamtzahl der Transaktionen im Zeitfenster
            total_count = session.query(func.count(Transaction.id)) \
                .filter(Transaction.created_at >= time_window) \
                .scalar() or 0
            
            # Anzahl erfolgreicher und fehlgeschlagener Transaktionen
            success_count = session.query(func.count(TransactionStatus.id)) \
                .filter(
                    TransactionStatus.status == "completed",
                    TransactionStatus.timestamp >= time_window
                ) \
                .scalar() or 0
            
            failure_count = session.query(func.count(TransactionStatus.id)) \
                .filter(
                    TransactionStatus.status == "failed",
                    TransactionStatus.timestamp >= time_window
                ) \
                .scalar() or 0
            
            # Erfolgsrate berechnen
            success_rate = 100.0
            if total_count > 0:
                success_rate = (success_count / total_count) * 100.0
            
            # Durchschnittliche Verarbeitungszeit für abgeschlossene Transaktionen
            processing_times = []
            completed_transactions = session.query(TransactionStatus) \
                .filter(
                    TransactionStatus.status == "completed",
                    TransactionStatus.timestamp >= time_window,
                    TransactionStatus.completed_at.isnot(None)
                ) \
                .limit(1000) \
                .all()
            
            for tx_status in completed_transactions:
                if tx_status.completed_at and tx_status.timestamp:
                    processing_time = (tx_status.completed_at - tx_status.timestamp).total_seconds()
                    processing_times.append(processing_time)
            
            avg_processing_time = 0.0
            if processing_times:
                avg_processing_time = statistics.mean(processing_times)
            
            # Häufigste Fehlertypen
            common_errors = session.query(
                    TransactionStatus.error_message,
                    func.count(TransactionStatus.id).label('count')
                ) \
                .filter(
                    TransactionStatus.status == "failed",
                    TransactionStatus.timestamp >= time_window
                ) \
                .group_by(TransactionStatus.error_message) \
                .order_by(desc('count')) \
                .limit(5) \
                .all()
            
            # Metriken für Prometheus aktualisieren
            transaction_count_gauge.set(total_count)
            transaction_success_rate_gauge.set(success_rate)
            transaction_failure_count_gauge.set(failure_count)
            
            # Verarbeitungszeiten in das Histogram eintragen
            for time_value in processing_times:
                transaction_processing_time_histogram.observe(time_value)
            
            # Metriken speichern
            self.last_metrics = {
                "timestamp": datetime.now(),
                "total_count": total_count,
                "success_count": success_count,
                "failure_count": failure_count,
                "success_rate": success_rate,
                "avg_processing_time": avg_processing_time,
                "common_errors": [{"error": err, "count": count} for err, count in common_errors]
            }
            
            # Logging
            logger.info(f"Transaktions-Metriken: {total_count} gesamt, {success_rate:.1f}% Erfolgsrate, "
                      f"{avg_processing_time:.3f}s durchschnittliche Verarbeitungszeit")
            
            # Alarme auslösen, wenn Schwellenwerte überschritten werden
            self._check_alerts()
    
    def _check_alerts(self):
        """Überprüft, ob Alarmschwellenwerte überschritten wurden."""
        if self.last_metrics.get("success_rate", 100.0) < self.alert_threshold_success_rate:
            logger.warning(
                f"ALARM: Erfolgsrate unter Schwellenwert! "
                f"Aktuell: {self.last_metrics.get('success_rate', 0):.1f}%, "
                f"Schwellenwert: {self.alert_threshold_success_rate:.1f}%"
            )
            # Hier könnte eine Benachrichtigung gesendet werden
        
        if self.last_metrics.get("avg_processing_time", 0.0) > self.alert_threshold_processing_time:
            logger.warning(
                f"ALARM: Verarbeitungszeit über Schwellenwert! "
                f"Aktuell: {self.last_metrics.get('avg_processing_time', 0):.3f}s, "
                f"Schwellenwert: {self.alert_threshold_processing_time:.3f}s"
            )
            # Hier könnte eine Benachrichtigung gesendet werden
    
    def get_metrics(self) -> Dict[str, Any]:
        """
        Gibt die aktuellen Metriken zurück.
        
        Returns:
            Dictionary mit aktuellen Metriken
        """
        return self.last_metrics
    
    def get_detailed_metrics(self, time_window_hours: int = 24) -> Dict[str, Any]:
        """
        Sammelt detaillierte Metriken für einen bestimmten Zeitraum.
        
        Args:
            time_window_hours: Zeitfenster in Stunden
            
        Returns:
            Dictionary mit detaillierten Metriken
        """
        time_window = datetime.now() - timedelta(hours=time_window_hours)
        
        with Session(self.db.bind) as session:
            # Transaktionen pro Stunde
            hourly_counts = []
            for hour_offset in range(time_window_hours):
                hour_start = datetime.now() - timedelta(hours=hour_offset+1)
                hour_end = datetime.now() - timedelta(hours=hour_offset)
                
                count = session.query(func.count(Transaction.id)) \
                    .filter(
                        Transaction.created_at >= hour_start,
                        Transaction.created_at < hour_end
                    ) \
                    .scalar() or 0
                
                hourly_counts.append({
                    "hour": hour_start.strftime("%Y-%m-%d %H:00"),
                    "count": count
                })
            
            # Transaktionen nach Typ
            type_counts = session.query(
                    Transaction.type,
                    func.count(Transaction.id).label('count')
                ) \
                .filter(Transaction.created_at >= time_window) \
                .group_by(Transaction.type) \
                .all()
            
            # Fehlerverteilung
            error_distribution = session.query(
                    TransactionStatus.error_message,
                    func.count(TransactionStatus.id).label('count')
                ) \
                .filter(
                    TransactionStatus.status == "failed",
                    TransactionStatus.timestamp >= time_window
                ) \
                .group_by(TransactionStatus.error_message) \
                .order_by(desc('count')) \
                .limit(10) \
                .all()
            
            return {
                "time_window_hours": time_window_hours,
                "hourly_counts": hourly_counts,
                "type_distribution": [{"type": t, "count": c} for t, c in type_counts],
                "error_distribution": [{"error": e, "count": c} for e, c in error_distribution]
            }

# Singleton-Instanz des Monitoring-Service
_monitoring_service_instance = None

def get_monitoring_service() -> TransactionMonitoringService:
    """
    Gibt die Singleton-Instanz des TransactionMonitoringService zurück.
    
    Returns:
        TransactionMonitoringService-Instanz
    """
    global _monitoring_service_instance
    if _monitoring_service_instance is None:
        _monitoring_service_instance = TransactionMonitoringService()
    return _monitoring_service_instance
