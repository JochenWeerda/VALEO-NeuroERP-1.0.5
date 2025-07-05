# Docker-Setup für das ERP-System

Diese Dokumentation beschreibt die Docker-basierte Infrastruktur des ERP-Systems und erklärt, wie Sie die Containerisierung einrichten und verwenden können.

## Übersicht

Die Docker-Infrastruktur des ERP-Systems besteht aus folgenden Komponenten:

- **API-Server**: Der Hauptanwendungsserver basierend auf FastAPI
- **Redis**: In-Memory-Datenbank für Caching und als Message Broker für Celery
- **Celery-Worker**: Verarbeitet asynchrone Aufgaben
- **Celery-Flower**: UI zum Überwachen der Celery-Tasks
- **Prometheus**: Speichert und verwaltet Metriken
- **Grafana**: Visualisiert die Metriken aus Prometheus
- **Node-Exporter**: Erfasst Systemmetriken der Host-Maschine

## Voraussetzungen

- Docker (Version 20.10.0+)
- Docker Compose (Version 2.0.0+)
- Git

## Installation und Start

1. **Repository klonen**

   ```bash
   git clone https://github.com/JochenWeerda/VALEO-NeuroERP-1.01.git
   cd VALEO-NeuroERP-1.01
   ```

2. **System bauen und starten**

   ```bash
   docker-compose up -d
   ```

   Dieser Befehl baut alle erforderlichen Images und startet die Container im Hintergrund.

3. **Status prüfen**

   ```bash
   docker-compose ps
   ```

   Dieser Befehl zeigt den Status aller Container an.

## Dienste und Ports

Nach dem Start sind die folgenden Dienste verfügbar:

- **API-Server**: http://localhost:8003
  - API-Dokumentation: http://localhost:8003/docs
  - Metriken: http://localhost:8003/metrics

- **Celery-Flower**: http://localhost:5555
  - Überwachung von Celery-Tasks

- **Prometheus**: http://localhost:9090
  - Metriken-Speicher und -Abfrage

- **Grafana**: http://localhost:3000
  - Anmeldedaten: admin/admin (ändern Sie das Passwort nach dem ersten Login)
  - Vorkonfigurierte Dashboards für das ERP-System

## Datenvolumes

Die folgenden Volumes werden verwendet, um persistente Daten zu speichern:

- **redis-data**: Speichert Redis-Daten (AOF und RDB)
- **prometheus-data**: Speichert historische Metriken
- **grafana-data**: Speichert Grafana-Konfiguration und Dashboards

## Logs anzeigen

Um die Logs eines bestimmten Dienstes anzuzeigen:

```bash
docker-compose logs -f api        # API-Server-Logs
docker-compose logs -f redis      # Redis-Logs
docker-compose logs -f celery-worker  # Celery-Worker-Logs
```

## Container neustarten

Um einen einzelnen Dienst neu zu starten:

```bash
docker-compose restart api        # API-Server neustarten
docker-compose restart redis      # Redis neustarten
```

## System stoppen

Um das gesamte System zu stoppen, aber Daten zu behalten:

```bash
docker-compose down
```

Um das System zu stoppen und alle Volumes zu entfernen:

```bash
docker-compose down -v
```

## Entwicklungsumgebung

Für die Entwicklung können Sie einzelne Dienste im Entwicklungsmodus starten:

```bash
# API-Server im Entwicklungsmodus starten (mit Hot-Reload)
docker-compose up -d redis
python -m uvicorn backend.demo_server_celery_enhanced:app --reload --host 0.0.0.0 --port 8003
```

## Überwachung mit Grafana

Nach dem Start können Sie auf Grafana unter http://localhost:3000 zugreifen. Die folgenden Dashboards sind vorkonfiguriert:

1. **ERP System Overview**: Gesamtübersicht des Systems
2. **API Performance**: Detaillierte Metriken für die API-Leistung
3. **Celery Tasks**: Überwachung der asynchronen Tasks
4. **Redis Monitoring**: Redis-Leistungsmetriken

## Problembehandlung

### Container startet nicht

Überprüfen Sie die Logs des problematischen Containers:

```bash
docker-compose logs -f <container-name>
```

### Redis-Verbindungsfehler

Wenn Celery oder die API-Server keine Verbindung zu Redis herstellen können:

1. Überprüfen Sie, ob der Redis-Container läuft: `docker-compose ps redis`
2. Prüfen Sie die Redis-Logs: `docker-compose logs redis`
3. Stellen Sie sicher, dass die Umgebungsvariablen korrekt gesetzt sind (REDIS_HOST, REDIS_PORT)

### Monitoring-Probleme

Wenn Prometheus oder Grafana keine Metriken anzeigen:

1. Überprüfen Sie, ob die Exporter laufen: `docker-compose ps`
2. Prüfen Sie, ob der API-Server Metriken exportiert: http://localhost:8003/metrics
3. Überprüfen Sie die Prometheus-Konfiguration und -Targets in der Prometheus-UI: http://localhost:9090/targets 