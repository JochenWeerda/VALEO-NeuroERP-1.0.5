"""
Celery-Konfiguration für das VALEO-NeuroERP-System.
"""
from celery import Celery
import os

# Erstelle die Celery-Anwendung
app = Celery('valeo_neuroerp')

# Konfigurationsdatei laden
app.config_from_object('backend.core.celeryconfig')

# Optional: Namespace für Tasks
app.autodiscover_tasks(['backend.tasks', 'backend.scheduled_tasks'])

@app.task(bind=True)
def debug_task(self):
    """Debug-Task zur Überprüfung der Celery-Konfiguration"""
    print(f'Request: {self.request!r}') 