# Task-Queue-Infrastruktur: Entwicklerleitfaden

## Einführung

Die Task-Queue-Infrastruktur des VALEO-NeuroERP-Systems ermöglicht die asynchrone Verarbeitung von zeitintensiven Operationen. Diese Dokumentation bietet einen umfassenden Leitfaden für Entwickler, die mit der Task-Queue-Infrastruktur arbeiten möchten.

## Architektur

Die Task-Queue-Infrastruktur basiert auf Celery und Redis und besteht aus folgenden Komponenten:

1. **Celery**: Distributed Task Queue für die asynchrone Verarbeitung
2. **Redis**: Message Broker und Result Backend
3. **Celery Beat**: Scheduler für periodische Tasks
4. **Flower**: Monitoring-Tool für Celery
5. **Datenbank-Tracking**: Verfolgung von Task-Status in der PostgreSQL-Datenbank

### Komponentendiagramm

```
+----------------+     +-----------------+     +------------------+
|                |     |                 |     |                  |
|  Django App    +---->+  Celery Worker  +---->+  Redis Broker   |
|                |     |                 |     |                  |
+-------+--------+     +-----------------+     +------------------+
        |
        |                +------------------+
        |                |                  |
        +--------------->+  Celery Beat     |
        |                |                  |
        |                +------------------+
        |
        |                +------------------+
        |                |                  |
        +--------------->+  Flower          |
                         |  (Monitoring)    |
                         +------------------+
```

## Task-Typen

Die Task-Queue-Infrastruktur unterstützt verschiedene Task-Typen:

1. **Standard-Tasks**: Einfache asynchrone Aufgaben
2. **Periodische Tasks**: Regelmäßig ausgeführte Aufgaben
3. **Priorisierte Tasks**: Tasks mit unterschiedlichen Prioritätsstufen
4. **Transaktionale Tasks**: Tasks, die nach erfolgreicher Datenbank-Transaktion ausgeführt werden

## Task erstellen

### Standard-Task

```python
from celery import shared_task

@shared_task
def my_task(arg1, arg2):
    # Task-Logik
    return result
```

### Task mit Wiederholungsversuchen

```python
from celery import shared_task
from backend.services.task_queue import retry_task_with_exponential_backoff

@shared_task(bind=True, max_retries=5)
def my_retryable_task(self, arg1, arg2):
    try:
        # Task-Logik
        return result
    except Exception as e:
        return retry_task_with_exponential_backoff(self, exc=e)
```

### Task nach Transaktion

```python
from django.db import transaction
from backend.services.task_queue import enqueue_task_after_transaction
from backend.tasks.my_tasks import my_task

with transaction.atomic():
    # Datenbank-Operationen
    # ...
    
    # Task nach erfolgreicher Transaktion ausführen
    enqueue_task_after_transaction(my_task, arg1, arg2)
```

## Task ausführen

### Asynchron ausführen

```python
from backend.tasks.my_tasks import my_task

# Einfache asynchrone Ausführung
result = my_task.delay(arg1, arg2)

# Mit zusätzlichen Optionen
result = my_task.apply_async(
    args=[arg1, arg2],
    kwargs={'kwarg1': value1},
    priority=0,  # Hohe Priorität
    countdown=10  # Verzögerung in Sekunden
)
```

### Task-Status verfolgen

```python
from backend.services.task_queue import get_task_status, get_task_result

# Status abrufen
status = get_task_status(task_id)

# Ergebnis abrufen
result = get_task_result(task_id)
```

## Task-Datenbank-Modell

Das `AsyncTask`-Modell dient als "Quelle der Wahrheit" für den Status aller Tasks im System:

```python
from backend.models.async_task import AsyncTask

# Task in der Datenbank suchen
task = AsyncTask.objects.get(task_id=task_id)

# Status und Fortschritt abrufen
status = task.status
progress = task.progress

# Fortschritt aktualisieren (im Task selbst)
from backend.services.task_queue import update_task_progress

def my_long_running_task(task_id):
    # ...
    update_task_progress(task_id, 50, "Halbzeit erreicht")
    # ...
```

## Frontend-Integration

### Task-Fortschrittsanzeige

```vue
<template>
  <TaskProgress
    :taskId="taskId"
    :status="status"
    :progress="progress"
    :name="name"
    :createdAt="createdAt"
    :errorMessage="errorMessage"
    :showCancel="showCancel"
    @task-completed="onTaskCompleted"
    @task-cancelled="onTaskCancelled"
  />
</template>

<script>
import TaskProgress from '@/components/TaskProgress.vue';

export default {
  components: {
    TaskProgress
  },
  data() {
    return {
      taskId: '12345',
      // ...
    };
  },
  methods: {
    onTaskCompleted(event) {
      console.log('Task abgeschlossen:', event);
    },
    onTaskCancelled(event) {
      console.log('Task abgebrochen:', event);
    }
  }
};
</script>
```

### Task-Liste

```vue
<template>
  <TaskList
    title="Aktive Tasks"
    apiEndpoint="/api/tasks"
    :autoRefresh="true"
    :refreshInterval="5000"
    @task-completed="onTaskCompleted"
  />
</template>

<script>
import TaskList from '@/components/TaskList.vue';

export default {
  components: {
    TaskList
  },
  methods: {
    onTaskCompleted(event) {
      console.log('Task abgeschlossen:', event);
    }
  }
};
</script>
```

## API-Endpunkte

Die Task-Queue-Infrastruktur stellt folgende API-Endpunkte bereit:

1. **GET /api/tasks/**: Liste aller aktiven Tasks
2. **GET /api/tasks/{task_id}/status/**: Status eines bestimmten Tasks
3. **POST /api/tasks/{task_id}/cancel/**: Task abbrechen

## Konfiguration

Die Konfiguration der Task-Queue-Infrastruktur erfolgt in der Datei `backend/settings.py`:

```python
# Celery-Einstellungen
CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/1'
CELERY_TIMEZONE = TIME_ZONE

# Task-Konfiguration
CELERY_TASK_ALWAYS_EAGER = False  # True für Entwicklung/Tests
CELERY_TASK_EAGER_PROPAGATES = True
CELERY_TASK_IGNORE_RESULT = False
CELERY_TASK_STORE_ERRORS_EVEN_IF_IGNORED = True
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 3600  # 1 Stunde
CELERY_TASK_SOFT_TIME_LIMIT = 3540  # 59 Minuten

# Worker-Konfiguration
CELERY_WORKER_PREFETCH_MULTIPLIER = 1
CELERY_WORKER_MAX_TASKS_PER_CHILD = 1000
```

## Best Practices

### 1. Idempotente Tasks

Tasks sollten idempotent sein, d.h. sie sollten mehrfach ausgeführt werden können, ohne unerwünschte Nebeneffekte zu verursachen:

```python
@shared_task
def process_order(order_id):
    order = Order.objects.get(id=order_id)
    
    # Prüfen, ob der Task bereits ausgeführt wurde
    if order.is_processed:
        return "Bereits verarbeitet"
    
    # Verarbeitung durchführen
    result = perform_processing(order)
    
    # Status aktualisieren
    order.is_processed = True
    order.save()
    
    return result
```

### 2. Transaktionale Integrität

Verwende `transaction.on_commit()`, um sicherzustellen, dass Tasks erst nach erfolgreicher Transaktion ausgeführt werden:

```python
from django.db import transaction
from backend.services.task_queue import enqueue_task_after_transaction

with transaction.atomic():
    # Datenbank-Operationen
    order = Order.objects.create(...)
    
    # Task nach erfolgreicher Transaktion ausführen
    enqueue_task_after_transaction(process_order, order.id)
```

### 3. Fortschritts-Tracking

Aktualisiere den Fortschritt für langlaufende Tasks:

```python
@shared_task(bind=True)
def process_large_dataset(self, dataset_id):
    dataset = Dataset.objects.get(id=dataset_id)
    total_items = dataset.items.count()
    
    for i, item in enumerate(dataset.items.all()):
        # Verarbeitung
        process_item(item)
        
        # Fortschritt aktualisieren
        progress = int((i + 1) / total_items * 100)
        update_task_progress(self.request.id, progress, f"{i+1}/{total_items} Elemente verarbeitet")
```

### 4. Fehlerbehandlung

Implementiere robuste Fehlerbehandlung und Wiederholungsmechanismen:

```python
@shared_task(bind=True, max_retries=5)
def send_email(self, recipient, subject, body):
    try:
        # E-Mail senden
        email_service.send(recipient, subject, body)
    except ConnectionError as e:
        # Exponentielles Backoff für Wiederholungsversuche
        retry_in = 2 ** self.request.retries * 60  # 1min, 2min, 4min, 8min, 16min
        self.retry(exc=e, countdown=retry_in)
```

## Monitoring

### Flower

Flower bietet eine Web-Oberfläche zum Monitoring der Task-Queue:

- URL: http://localhost:5555
- Funktionen:
  - Überwachung aktiver, ausstehender und abgeschlossener Tasks
  - Worker-Status und -Auslastung
  - Task-Historie und -Statistiken
  - Task-Revocation und -Priorisierung

### Logging

Konfiguriere das Logging für Celery-Tasks:

```python
import logging
logger = logging.getLogger(__name__)

@shared_task
def my_task():
    logger.info("Task gestartet")
    try:
        # Task-Logik
        logger.debug("Zwischenschritt abgeschlossen")
    except Exception as e:
        logger.error(f"Fehler bei Task-Ausführung: {e}", exc_info=True)
        raise
    logger.info("Task erfolgreich abgeschlossen")
```

## Fehlerbehebung

### Häufige Probleme

1. **Task wird nicht ausgeführt**:
   - Prüfe, ob der Celery Worker läuft
   - Prüfe die Verbindung zum Redis-Server
   - Prüfe die Task-Queue mit `celery -A backend inspect active`

2. **Task schlägt fehl**:
   - Prüfe die Celery-Logs
   - Prüfe den Task-Status in der Datenbank
   - Prüfe die Task-Argumente

3. **Memory-Leaks**:
   - Prüfe die Worker-Prozesse mit `ps aux | grep celery`
   - Starte die Worker neu mit `celery -A backend worker -l info --max-tasks-per-child=1000`

### Debugging-Tipps

1. **Task-Ausführung im Eager-Modus**:

```python
# In settings.py für Entwicklung/Tests
CELERY_TASK_ALWAYS_EAGER = True
```

2. **Task-Status inspizieren**:

```bash
celery -A backend inspect active  # Aktive Tasks
celery -A backend inspect scheduled  # Geplante Tasks
celery -A backend inspect reserved  # Reservierte Tasks
```

3. **Task-Ausführung verfolgen**:

```bash
celery -A backend worker -l debug
```

## Skalierung

### Worker-Skalierung

Starte mehrere Worker-Prozesse für bessere Leistung:

```bash
celery -A backend worker -l info --concurrency=4
```

### Prioritäts-Queues

Verwende verschiedene Queues für Tasks mit unterschiedlichen Prioritäten:

```bash
# Worker für hochprioritäre Tasks starten
celery -A backend worker -l info -Q high_priority

# Worker für alle Queues starten
celery -A backend worker -l info -Q high_priority,default,low_priority
```

## Fazit

Die Task-Queue-Infrastruktur des VALEO-NeuroERP-Systems bietet eine robuste Lösung für die asynchrone Verarbeitung von zeitintensiven Operationen. Durch die Verwendung von Celery und Redis können Entwickler komplexe Workflows implementieren, die Systemleistung verbessern und eine bessere Benutzererfahrung gewährleisten. 