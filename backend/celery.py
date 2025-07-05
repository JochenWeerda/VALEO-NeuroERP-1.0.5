"""
Celery-Konfiguration für das VALEO-NeuroERP-System.
"""
from celery import Celery

# Erstelle die Celery-Anwendung
app = Celery('valeo_neuroerp')

# Grundlegende Konfiguration
app.conf.update(
    broker_url='redis://localhost:6379/0',
    result_backend='redis://localhost:6379/0',
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='Europe/Berlin',
    enable_utc=True,
)

# Task-Routen
app.conf.task_routes = {
    'backend.tasks.*': {'queue': 'default'},
    'backend.scheduled_tasks.*': {'queue': 'scheduled'},
}

# Task-Queues
app.conf.task_queues = {
    'default': {
        'exchange': 'default',
        'routing_key': 'default',
    },
    'scheduled': {
        'exchange': 'scheduled',
        'routing_key': 'scheduled',
    },
}

@app.task(bind=True)
def debug_task(self):
    """Debug-Task zur Überprüfung der Celery-Konfiguration"""
    print(f'Request: {self.request!r}') 