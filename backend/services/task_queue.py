"""
Task-Queue-Service für die asynchrone Verarbeitung im VALEO-NeuroERP-System.

Dieser Service implementiert eine robuste Task-Queue-Infrastruktur mit Celery und Redis,
die zeitintensive Operationen in den Hintergrund verlagert und die Antwortzeiten des
Systems verbessert.
"""

import os
import logging
from functools import wraps
from celery import Celery, signals
from django.conf import settings
from django.db import transaction

logger = logging.getLogger(__name__)

# Celery-Konfiguration
app = Celery('valeo_neuroerp')
app.config_from_object('django.conf:settings', namespace='CELERY')

# Broker-Konfiguration für erhöhte Zuverlässigkeit
app.conf.broker_transport_options = {
    'confirm_publish': True,  # Bestätigung für erfolgreiche Nachrichtenübermittlung
    'visibility_timeout': 3600,  # 1 Stunde Sichtbarkeitstimeout für Redis
}

# Task-Konfiguration für erhöhte Zuverlässigkeit
app.conf.task_acks_late = True  # Tasks erst nach erfolgreicher Ausführung bestätigen
app.conf.task_reject_on_worker_lost = True  # Tasks bei Worker-Ausfall neu einreihen
app.conf.worker_prefetch_multiplier = 1  # Verhindert, dass Worker zu viele Tasks auf einmal holen
app.conf.worker_max_tasks_per_child = 1000  # Worker nach 1000 Tasks neu starten (verhindert Memory-Leaks)

# Task-Serialisierung
app.conf.task_serializer = 'json'
app.conf.result_serializer = 'json'
app.conf.accept_content = ['json']

# Worker-Shutdown-Konfiguration für Celery 5.5+
app.conf.worker_soft_shutdown_timeout = 60  # 60 Sekunden Zeit für graceful Shutdown
app.conf.worker_enable_soft_shutdown_on_idle = True  # Soft Shutdown auch für Idle-Worker

# Automatische Task-Erkennung in allen registrierten Django-Apps
app.autodiscover_tasks()

# Hierarchisches Task-Modell mit Prioritätsklassen
PRIORITY_HIGH = 0
PRIORITY_NORMAL = 3
PRIORITY_LOW = 6


def prioritized_task(*args, **kwargs):
    """
    Decorator für Tasks mit Priorität.
    
    Beispiel:
        @prioritized_task(priority=task_queue.PRIORITY_HIGH)
        def high_priority_task():
            pass
    """
    priority = kwargs.pop('priority', PRIORITY_NORMAL)
    
    def decorator(func):
        @app.task(*args, **kwargs)
        @wraps(func)
        def wrapper(*args, **kwargs):
            return func(*args, **kwargs)
        
        wrapper.priority = priority
        wrapper.apply_async_with_priority = lambda *args, **kwargs: wrapper.apply_async(
            *args, **{**kwargs, 'priority': priority}
        )
        return wrapper
    
    return decorator


class DatabaseTaskTracker:
    """
    Klasse zur Verfolgung von Tasks in der Datenbank.
    Implementiert das Pattern "Datenbank als Quelle der Wahrheit".
    """
    
    @staticmethod
    def record_task(task_name, task_id, status, args=None, kwargs=None):
        """Task in der Datenbank aufzeichnen"""
        from backend.models.async_task import AsyncTask
        
        AsyncTask.objects.create(
            task_name=task_name,
            task_id=task_id,
            status=status,
            args=args or [],
            kwargs=kwargs or {},
        )
    
    @staticmethod
    def update_task_status(task_id, status, result=None, error=None):
        """Task-Status in der Datenbank aktualisieren"""
        from backend.models.async_task import AsyncTask
        
        try:
            task = AsyncTask.objects.get(task_id=task_id)
            task.status = status
            if result is not None:
                task.result = result
            if error is not None:
                task.error = error
            task.save()
        except AsyncTask.DoesNotExist:
            logger.warning(f"Task mit ID {task_id} nicht gefunden")


def update_task_progress(task_id, progress, message=None):
    """
    Aktualisiert den Fortschritt eines Tasks in der Datenbank.
    
    Args:
        task_id: ID des Tasks
        progress: Fortschritt in Prozent (0-100)
        message: Optionale Statusmeldung
        
    Returns:
        None
    """
    from backend.models.async_task import AsyncTask
    
    try:
        task = AsyncTask.objects.get(task_id=task_id)
        
        # Fortschritt im result-Feld speichern
        result = task.result or {}
        if isinstance(result, dict):
            result['progress'] = progress
            if message:
                result['message'] = message
        else:
            # Falls result kein Dict ist, ein neues erstellen
            result = {'progress': progress}
            if message:
                result['message'] = message
        
        task.result = result
        task.save(update_fields=['result'])
        
        logger.debug(f"Task {task_id} Fortschritt aktualisiert: {progress}% - {message}")
    except AsyncTask.DoesNotExist:
        logger.warning(f"Task mit ID {task_id} nicht gefunden")
    except Exception as e:
        logger.error(f"Fehler beim Aktualisieren des Task-Fortschritts: {e}")


# Celery-Signale für Task-Tracking
@signals.task_prerun.connect
def task_prerun_handler(task_id, task, *args, **kwargs):
    """Wird ausgeführt, bevor ein Task gestartet wird"""
    logger.info(f"Task {task.name}[{task_id}] wird gestartet")
    DatabaseTaskTracker.update_task_status(task_id, "RUNNING")


@signals.task_success.connect
def task_success_handler(result, sender, **kwargs):
    """Wird ausgeführt, wenn ein Task erfolgreich abgeschlossen wurde"""
    task_id = kwargs.get('task_id')
    logger.info(f"Task {sender.name}[{task_id}] erfolgreich abgeschlossen")
    DatabaseTaskTracker.update_task_status(task_id, "SUCCESS", result=result)


@signals.task_failure.connect
def task_failure_handler(task_id, exception, traceback, sender, **kwargs):
    """Wird ausgeführt, wenn ein Task fehlschlägt"""
    logger.error(f"Task {sender.name}[{task_id}] fehlgeschlagen: {exception}")
    DatabaseTaskTracker.update_task_status(task_id, "FAILURE", error=str(exception))


def enqueue_task_with_db_tracking(task, *args, **kwargs):
    """
    Task in die Queue einreihen mit Datenbank-Tracking.
    Garantiert, dass der Task in der Datenbank aufgezeichnet wird,
    selbst wenn die Verbindung zum Broker fehlschlägt.
    """
    try:
        async_result = task.apply_async(args=args, **kwargs)
        task_id = async_result.id
        
        # Task in der Datenbank aufzeichnen
        DatabaseTaskTracker.record_task(
            task_name=task.name,
            task_id=task_id,
            status="PENDING",
            args=args,
            kwargs={k: v for k, v in kwargs.items() if k != 'priority'}
        )
        
        return task_id
    except Exception as e:
        logger.error(f"Fehler beim Einreihen von Task {task.name}: {e}")
        # Hier könnte eine Fallback-Strategie implementiert werden
        raise


def enqueue_task_after_transaction(task, *args, **kwargs):
    """
    Task nach erfolgreicher Transaktion in die Queue einreihen.
    Verhindert Race-Conditions zwischen Datenbank-Commit und Task-Ausführung.
    """
    def on_commit():
        return enqueue_task_with_db_tracking(task, *args, **kwargs)
    
    transaction.on_commit(on_commit)


def retry_task_with_exponential_backoff(self, exc, max_retries=5, retry_backoff=True):
    """
    Task mit exponentieller Verzögerung wiederholen.
    
    Beispiel:
        @app.task(bind=True)
        def my_task(self):
            try:
                # Task-Logik
            except Exception as exc:
                retry_task_with_exponential_backoff(self, exc)
    """
    countdown = 60  # 1 Minute Basis-Verzögerung
    
    if retry_backoff:
        countdown = countdown * (2 ** self.request.retries)
    
    logger.info(f"Task {self.name}[{self.request.id}] wird in {countdown} Sekunden wiederholt")
    
    raise self.retry(exc=exc, countdown=countdown, max_retries=max_retries)


def ensure_tasks_executed(task_model, filter_params, task_function, *args, **kwargs):
    """
    Stellt sicher, dass bestimmte Tasks ausgeführt werden, auch wenn die
    ursprüngliche Task-Einreihung fehlgeschlagen ist.
    
    Diese Funktion kann in einem periodischen Task verwendet werden,
    um die Datenbank nach nicht ausgeführten Tasks zu durchsuchen und
    diese erneut einzureihen.
    
    Beispiel:
        @app.task
        def ensure_activation_emails():
            ensure_tasks_executed(
                User,
                {'is_activation_email_sent': False},
                send_activation_email
            )
    """
    queryset = task_model.objects.filter(**filter_params)
    
    for obj in queryset:
        logger.info(f"Stelle sicher, dass Task für {obj} ausgeführt wird")
        enqueue_task_with_db_tracking(task_function, obj.pk, *args, **kwargs)


# Beispiel für einen idempotenten Task
@app.task(
    bind=True,
    autoretry_for=(Exception,),
    retry_kwargs={'max_retries': 3, 'retry_backoff': True}
)
def example_idempotent_task(self, object_id):
    """
    Beispiel für einen idempotenten Task, der sicher
    mehrfach ausgeführt werden kann.
    """
    from backend.models.example import ExampleModel
    
    # Transaktion für Atomarität
    with transaction.atomic():
        # get_or_create für Idempotenz
        obj, created = ExampleModel.objects.get_or_create(id=object_id)
        
        # Verarbeitung nur durchführen, wenn bestimmte Bedingungen erfüllt sind
        if not obj.is_processed:
            # Verarbeitung durchführen
            obj.process()
            obj.is_processed = True
            obj.save()
            
            logger.info(f"Objekt {object_id} wurde verarbeitet")
            return True
        else:
            logger.info(f"Objekt {object_id} wurde bereits verarbeitet")
            return False 