# ... Bestehende Django-Einstellungen ...

# Celery-Einstellungen
CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/1'
CELERY_TIMEZONE = TIME_ZONE

# Celery-Konfiguration für die Task-Queue-Infrastruktur
CELERY_TASK_ALWAYS_EAGER = False  # Tasks asynchron ausführen (True für Entwicklung/Tests)
CELERY_TASK_EAGER_PROPAGATES = True  # Exceptions in Tasks propagieren, wenn ALWAYS_EAGER=True
CELERY_TASK_IGNORE_RESULT = False  # Task-Ergebnisse speichern
CELERY_TASK_STORE_ERRORS_EVEN_IF_IGNORED = True  # Fehler speichern, auch wenn IGNORE_RESULT=True
CELERY_TASK_TRACK_STARTED = True  # Task-Status "STARTED" verfolgen
CELERY_TASK_TIME_LIMIT = 3600  # Task-Timeout nach 1 Stunde
CELERY_TASK_SOFT_TIME_LIMIT = 3540  # Soft-Timeout nach 59 Minuten (gibt Zeit für Cleanup)
CELERY_WORKER_SEND_TASK_EVENTS = True  # Task-Events senden
CELERY_TASK_SEND_SENT_EVENT = True  # SENT-Events senden
CELERY_WORKER_TASK_LOG_FORMAT = (
    '[%(asctime)s: %(levelname)s/%(processName)s] [%(task_name)s(%(task_id)s)] %(message)s'
)

# Redis-Konfiguration für Celery
CELERY_REDIS_MAX_CONNECTIONS = 20
CELERY_BROKER_TRANSPORT_OPTIONS = {
    'visibility_timeout': 3600,  # 1 Stunde
    'fanout_prefix': True,
    'fanout_patterns': True,
}

# Celery Beat-Konfiguration
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'
CELERY_BEAT_MAX_LOOP_INTERVAL = 60  # Maximales Intervall zwischen Scheduler-Durchläufen

# Celery-Monitoring mit Flower
CELERY_FLOWER_PORT = 5555
CELERY_FLOWER_URL_PREFIX = 'flower'
CELERY_FLOWER_PERSISTENT = True
CELERY_FLOWER_DB = 'flower.db'
CELERY_FLOWER_BASIC_AUTH = None  # Format: 'user:password' für Basic-Auth

# Celery-Queues
CELERY_TASK_DEFAULT_QUEUE = 'default'
CELERY_TASK_QUEUES = {
    'high_priority': {
        'exchange': 'high_priority',
        'routing_key': 'high_priority',
        'queue_arguments': {'x-max-priority': 10},
    },
    'default': {
        'exchange': 'default',
        'routing_key': 'default',
        'queue_arguments': {'x-max-priority': 5},
    },
    'low_priority': {
        'exchange': 'low_priority',
        'routing_key': 'low_priority',
        'queue_arguments': {'x-max-priority': 1},
    },
}

# Celery-Logging
CELERY_WORKER_HIJACK_ROOT_LOGGER = False
CELERY_WORKER_LOG_COLOR = True

# ... Weitere Django-Einstellungen ... 