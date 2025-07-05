"""
Monitoring-Initialisierung für VALEO-NeuroERP
"""

from backend.core.simple_logging import logger
from .prometheus_exporter import init_metrics_server

def init_monitoring():
    """Initialisiert das Monitoring-System"""
    try:
        # Prometheus-Metriken initialisieren
        init_metrics_server()
        logger.info("Monitoring-System erfolgreich initialisiert")
    except Exception as e:
        logger.error(f"Fehler beim Initialisieren des Monitoring-Systems: {str(e)}")
        raise 