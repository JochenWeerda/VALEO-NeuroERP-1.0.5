# Implementierungsplan für Datenbankoptimierungen und Performance-Monitoring

## 1. Integration mit externen Monitoring-Systemen

### 1.1 Prometheus-Integration
- **Ziel**: Datenbankperformance-Metriken in Prometheus exportieren für langfristige Speicherung und Analyse
- **Schritte**:
  1. Prometheus-Client-Bibliothek installieren: `pip install prometheus-client`
  2. Metriken-Exporter in `backend/monitoring/prometheus_exporter.py` implementieren
     - Counter für Abfrageanzahl
     - Histogramm für Abfragezeiten
     - Gauge für aktive DB-Verbindungen
  3. Integration in `modular_server.py`
  4. Bereitstellung eines `/metrics`-Endpunkts für Prometheus-Scraping

```python
# Beispielcode für backend/monitoring/prometheus_exporter.py
from prometheus_client import Counter, Histogram, Gauge
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST

# Metriken definieren
QUERY_COUNT = Counter('erp_db_query_count', 'Anzahl der Datenbankabfragen', ['query_name'])
QUERY_DURATION = Histogram('erp_db_query_duration_seconds', 'Dauer der Datenbankabfragen', ['query_name'])
ACTIVE_CONNECTIONS = Gauge('erp_db_active_connections', 'Anzahl aktiver Datenbankverbindungen')

# Middleware zum Erfassen von Metriken
async def prometheus_middleware(request, call_next):
    # Metriken erfassen
    return await call_next(request)

# Endpunkt für Prometheus-Scraping
async def metrics():
    return generate_latest(), {'Content-Type': CONTENT_TYPE_LATEST}
```

### 1.2 Grafana-Dashboard
- **Ziel**: Visuelles Dashboard für Performance-Metriken und Alerts
- **Schritte**:
  1. Grafana als Docker-Container einrichten
  2. Prometheus als Datenquelle konfigurieren
  3. Dashboard mit folgenden Panels erstellen:
     - Abfragezeithistogramm
     - Top 10 langsamste Abfragen
     - Query-Rate pro Endpunkt
     - CPU- und Speichernutzung
     - Anzahl aktiver Datenbankverbindungen
  4. Dashboard als JSON exportieren und im Repository speichern

### 1.3 Alert-System
- **Ziel**: Automatische Benachrichtigungen bei Performance-Problemen
- **Schritte**:
  1. Alert-Regeln in Prometheus definieren:
     - Abfragen dauern länger als 1 Sekunde
     - Mehr als 100 Abfragen pro Minute auf einen Endpunkt
     - Mehr als 10 langsame Abfragen pro Stunde
  2. AlertManager für Benachrichtigungen konfigurieren
  3. Integration mit Teams/Slack/E-Mail

## 2. Weitere Optimierungen

### 2.1 Zusammengesetzte Indizes
- **Ziel**: Optimierung komplexer Abfragen durch zusammengesetzte Indizes
- **Schritte**:
  1. `db_optimization.py` um Funktionen für zusammengesetzte Indizes erweitern
  2. Analyse und Identifikation von Abfragen, die von zusammengesetzten Indizes profitieren
  3. Implementierung und Tests

```python
# Erweiterung für backend/db/db_optimization.py
def add_composite_indices(engine, composite_indices):
    """
    Fügt zusammengesetzte Indizes zur Datenbank hinzu.
    
    Args:
        engine: SQLAlchemy-Engine
        composite_indices: Liste von Indizes, jeder als Dict mit:
            - table: Name der Tabelle
            - columns: Liste von Spaltennamen in der gewünschten Reihenfolge
            - name: Name des Index (optional)
    """
    # Implementierung...

# Beispiel für zusammengesetzte Indizes
recommended_composite_indices = [
    {"table": "artikel", "columns": ["kategorie", "name"], "name": "idx_artikel_kat_name"},
    {"table": "charge", "columns": ["artikel_id", "produktionsdatum"], "name": "idx_charge_art_date"},
    {"table": "lagerbewegung", "columns": ["charge_id", "datum"], "name": "idx_lagerbewegung_charge_datum"}
]
```

### 2.2 Materialisierte Ansichten
- **Ziel**: Bereitstellung voraggregierter Daten für häufige Berichte
- **Schritte**:
  1. Identifikation häufiger rechenintensiver Abfragen
  2. Erstellung materialisierter Ansichten
  3. Implementierung eines Aktualisierungsmechanismus

```python
# Beispielcode für backend/db/materialized_views.py
def create_materialized_view(engine, view_name, query):
    """Erstellt eine materialisierte Ansicht."""
    # Implementierung...

def refresh_materialized_view(engine, view_name):
    """Aktualisiert eine materialisierte Ansicht."""
    # Implementierung...

# Beispiel für materialisierte Ansichten
views = {
    "mv_lagerbestand_pro_artikel": """
        SELECT artikel_id, SUM(menge) as bestand
        FROM lagerbewegung
        GROUP BY artikel_id
    """,
    "mv_chargen_pro_kategorie": """
        SELECT a.kategorie, COUNT(c.id) as anzahl_chargen
        FROM charge c
        JOIN artikel a ON c.artikel_id = a.id
        GROUP BY a.kategorie
    """
}
```

### 2.3 Partitionierung großer Tabellen
- **Ziel**: Verbesserung der Performance für große Tabellen durch Partitionierung
- **Schritte**:
  1. Identifikation großer Tabellen (z.B. Lagerbewegungen, Chargen)
  2. Partitionierungsstrategie definieren (z.B. nach Datum)
  3. SQLAlchemy-Modelle für Partitionierung anpassen
  4. Migrations-Skript erstellen

## 3. Asynchrone Verarbeitung

### 3.1 Task-Queue-Infrastruktur
- **Ziel**: Asynchrone Verarbeitung zeitintensiver Operationen
- **Schritte**:
  1. Celery als Task-Queue-System installieren:
     ```
     pip install celery redis
     ```
  2. Celery-Konfiguration in `backend/tasks/celery_app.py`
  3. Worker-Prozess-Konfiguration

```python
# Beispielcode für backend/tasks/celery_app.py
from celery import Celery

celery_app = Celery(
    "erp_tasks",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/1"
)

celery_app.conf.task_routes = {
    "backend.tasks.reports.*": {"queue": "reports"},
    "backend.tasks.imports.*": {"queue": "imports"},
    "backend.tasks.exports.*": {"queue": "exports"}
}
```

### 3.2 Zeitintensive Operationen auslagern
- **Ziel**: Identifikation und Auslagerung zeitintensiver Operationen
- **Schritte**:
  1. Analyse und Identifikation zeitintensiver Operationen:
     - Berichterstellung
     - Datenimport und -export
     - Batch-Verarbeitung großer Datensätze
  2. Implementierung als Celery-Tasks
  3. API-Endpunkte für das Starten und Überwachen von Tasks

```python
# Beispielcode für backend/tasks/reports.py
from .celery_app import celery_app
from backend.db.database import SessionLocal

@celery_app.task(name="backend.tasks.reports.generate_report")
def generate_report(report_type, params):
    """Generiert einen Bericht asynchron."""
    db = SessionLocal()
    try:
        # Bericht generieren
        # ...
        return {"status": "success", "result": "..."}
    finally:
        db.close()
```

### 3.3 Fortschritts-Tracking-System
- **Ziel**: Überwachung und Benachrichtigung über den Fortschritt langlaufender Prozesse
- **Schritte**:
  1. Implementierung eines Fortschritts-Tracking-Systems
  2. WebSocket-Server für Echtzeit-Updates
  3. Frontend-Komponenten für Fortschrittsanzeige

```python
# Beispielcode für backend/tasks/progress.py
from .celery_app import celery_app

class ProgressTracker:
    """Klasse zum Tracking des Fortschritts von Tasks."""
    
    def __init__(self, task_id, total_steps):
        self.task_id = task_id
        self.total_steps = total_steps
        self.current_step = 0
        self.status = "running"
        
    def update(self, current_step, status="running", message=None):
        """Aktualisiert den Fortschritt einer Task."""
        self.current_step = current_step
        self.status = status
        # Fortschritt in Redis speichern
        # Benachrichtigung über WebSocket senden
```

## 4. Umsetzungsplan

### Phase 1: Grundlegende Optimierungen (1-2 Wochen)
- Zusammengesetzte Indizes implementieren
- Erste materialisierte Ansichten erstellen
- Prometheus-Integration

### Phase 2: Monitoring-System (2-3 Wochen)
- Grafana-Dashboard einrichten
- Alert-System implementieren
- Dokumentation der Metriken

### Phase 3: Asynchrone Verarbeitung (3-4 Wochen)
- Celery-Infrastruktur einrichten
- Erste Tasks implementieren
- Fortschritts-Tracking-System

### Phase 4: Erweiterte Optimierungen (2-3 Wochen)
- Partitionierung großer Tabellen
- Weitere materialisierte Ansichten
- Performance-Tests und Benchmarks

## 5. Erfolgskriterien

- **Performance**: Reduktion der durchschnittlichen Antwortzeit um 50%
- **Skalierbarkeit**: Unterstützung von 3x mehr gleichzeitigen Anfragen
- **Nutzererfahrung**: Keine spürbaren Verzögerungen bei der Nutzung des Systems
- **Monitoring**: Frühzeitige Erkennung von Performance-Problemen
- **Wartbarkeit**: Klare Dokumentation und einfache Erweiterbarkeit der Optimierungen 