"""
Celery-Konfiguration für das VALEO-NeuroERP-System.

Dieses Modul stellt eine Celery-Anwendung für asynchrone Verarbeitung
im ERP-System bereit, insbesondere für zeitintensive Operationen.
"""

import os
import logging
from celery import Celery
from kombu import Queue, Exchange
from celery.schedules import crontab

# Logger konfigurieren
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Celery-Konfiguration
CELERY_BROKER_URL = os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379/0")
CELERY_RESULT_BACKEND = os.environ.get("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

# Celery-App erstellen
celery_app = Celery(
    "valeo_neuroerp",
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND,
    include=[
        "backend.tasks.data_analysis_tasks",
        "backend.tasks.notification_tasks",
        "backend.tasks.report_tasks.pdf_reports",
        "backend.tasks.report_tasks.excel_exports",
        "backend.tasks.report_tasks.data_visualization",
        "backend.tasks.report_tasks.scheduled_reports"
    ]
)

# Celery-Konfiguration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Europe/Berlin",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 Stunde
    worker_max_tasks_per_child=1000,
    worker_prefetch_multiplier=1
)

# Geplante Aufgaben
celery_app.conf.beat_schedule = {
    "check-scheduled-reports": {
        "task": "backend.tasks.report_tasks.scheduled_reports.check_scheduled_reports",
        "schedule": crontab(minute="*/5"),  # Alle 5 Minuten
        "args": (),
    },
    "cleanup-old-reports": {
        "task": "backend.tasks.report_tasks.scheduled_reports.cleanup_old_reports",
        "schedule": crontab(hour=3, minute=0),  # Jeden Tag um 3:00 Uhr
        "args": (30,),  # Berichte löschen, die älter als 30 Tage sind
    },
}

# Warteschlangen definieren
task_queues = (
    Queue("default", Exchange("default"), routing_key="default"),
    Queue("reports", Exchange("reports"), routing_key="reports"),
    Queue("imports", Exchange("imports"), routing_key="imports"),
    Queue("exports", Exchange("exports"), routing_key="exports"),
    Queue("optimization", Exchange("optimization"), routing_key="optimization"),
)

# Warteschlangen konfigurieren
celery_app.conf.task_queues = task_queues

# Task-Routing konfigurieren
celery_app.conf.task_routes = {
    "backend.tasks.reports.*": {"queue": "reports"},
    "backend.tasks.imports.*": {"queue": "imports"},
    "backend.tasks.exports.*": {"queue": "exports"},
    "backend.tasks.optimization.*": {"queue": "optimization"},
}

# Task-Retry-Konfiguration
celery_app.conf.task_acks_late = True  # Aufgaben erst nach Abschluss bestätigen
celery_app.conf.task_reject_on_worker_lost = True  # Bei Worker-Verlust Task zurück in die Warteschlange
celery_app.conf.task_default_retry_delay = 60  # 1 Minute zwischen Wiederholungsversuchen
celery_app.conf.task_max_retries = 3  # Maximal 3 Wiederholungsversuche

# Optional: Task-Events für Monitoring aktivieren
celery_app.conf.worker_send_task_events = True
celery_app.conf.task_send_sent_event = True

@celery_app.task(name="backend.tasks.core.health_check")
def health_check():
    """
    Einfacher Health-Check-Task zum Testen der Celery-Funktionalität.
    
    Returns:
        dict: Status-Informationen
    """
    import platform
    import time
    
    return {
        "status": "healthy",
        "worker_hostname": platform.node(),
        "timestamp": time.time(),
        "python_version": platform.python_version(),
        "system": platform.system()
    }

def init_celery():
    """
    Initialisiert die Celery-Anwendung und gibt sie zurück.
    
    Returns:
        Celery: Die Celery-Anwendung
    """
    logger.info(f"Celery-Anwendung initialisiert mit Broker: {CELERY_BROKER_URL}")
    return celery_app 