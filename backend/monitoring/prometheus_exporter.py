"""
Prometheus-Exporter für VALEO-NeuroERP Metriken
"""

from prometheus_client import Counter, Gauge, Histogram, start_http_server
from backend.core.simple_logging import logger

# Metriken definieren
TASK_COUNTER = Counter(
    'task_total',
    'Total number of tasks',
    ['category', 'status']
)

TASK_DURATION = Histogram(
    'task_duration_seconds',
    'Task duration in seconds',
    ['category', 'task_id'],
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 30.0, 60.0]
)

ACTIVE_TASKS = Gauge(
    'active_tasks',
    'Number of currently active tasks',
    ['category']
)

MEMORY_USAGE = Gauge(
    'memory_usage_bytes',
    'Memory usage in bytes',
    ['task_id']
)

CPU_USAGE = Gauge(
    'cpu_usage_percent',
    'CPU usage percentage',
    ['task_id']
)

def init_metrics_server(port: int = 9090):
    """Initialisiert den Prometheus-Metrik-Server"""
    try:
        start_http_server(port)
        logger.info(f"Prometheus metrics server started on port {port}")
    except Exception as e:
        logger.error(f"Failed to start Prometheus metrics server: {str(e)}")
        raise

def track_task_start(task_id: str, category: str):
    """Trackt den Start eines Tasks"""
    TASK_COUNTER.labels(category=category, status="started").inc()
    ACTIVE_TASKS.labels(category=category).inc()

def track_task_completion(task_id: str, category: str, duration: float):
    """Trackt die Fertigstellung eines Tasks"""
    TASK_COUNTER.labels(category=category, status="completed").inc()
    ACTIVE_TASKS.labels(category=category).dec()
    TASK_DURATION.labels(category=category, task_id=task_id).observe(duration)

def track_task_failure(task_id: str, category: str):
    """Trackt das Fehlschlagen eines Tasks"""
    TASK_COUNTER.labels(category=category, status="failed").inc()
    ACTIVE_TASKS.labels(category=category).dec()

def update_resource_usage(task_id: str, memory_bytes: float, cpu_percent: float):
    """Aktualisiert die Ressourcennutzung eines Tasks"""
    MEMORY_USAGE.labels(task_id=task_id).set(memory_bytes)
    CPU_USAGE.labels(task_id=task_id).set(cpu_percent)

def init_app():
    """Initialisiert den Prometheus-Exporter"""
    try:
        init_metrics_server()
        logger.info("Prometheus-Exporter für Transaktionsmetriken initialisiert")
    except Exception as e:
        logger.error(f"Fehler beim Initialisieren des Prometheus-Exporters: {str(e)}")
        raise 