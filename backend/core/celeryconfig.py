"""
Celery-Konfiguration für das VALEO-NeuroERP-System.
"""

# Broker und Result Backend
broker_url = 'redis://localhost:6379/0'
result_backend = 'redis://localhost:6379/0'

# Task-Serialisierung
task_serializer = 'json'
accept_content = ['json']
result_serializer = 'json'

# Zeitzone
timezone = 'Europe/Berlin'
enable_utc = True

# Task-Routen
task_routes = {
    'backend.tasks.*': {'queue': 'default'},
    'backend.scheduled_tasks.*': {'queue': 'scheduled'},
}

# Task-Queues
task_queues = {
    'default': {
        'exchange': 'default',
        'routing_key': 'default',
    },
    'scheduled': {
        'exchange': 'scheduled',
        'routing_key': 'scheduled',
    },
}

# Task-Einstellungen
task_acks_late = True
task_reject_on_worker_lost = True
task_track_started = True

# Worker-Einstellungen
worker_prefetch_multiplier = 1
worker_max_tasks_per_child = 1000
worker_max_memory_per_child = 50000  # 50MB

# Beat-Einstellungen (für periodische Tasks)
beat_schedule = {} 