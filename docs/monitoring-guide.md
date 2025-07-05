# Monitoring-Leitfaden für das VALEO-NeuroERP-System

Dieser Leitfaden beschreibt das Monitoring-Setup des VALEO-NeuroERP-Systems mit Prometheus und Grafana. Er erklärt, wie Sie die Metriken interpretieren, Warnungen konfigurieren und das System überwachen können.

## Architektur des Monitoring-Systems

Das Monitoring-System besteht aus folgenden Komponenten:

1. **Metriken-Exporters**: Komponenten, die Metriken aus verschiedenen Systemteilen sammeln:
   - FastAPI-Anwendungsmetriken (API-Server)
   - Celery-Aufgabenmetriken (über Flower)
   - Redis-Metriken (über Redis-Exporter)
   - Systemmetriken (über Node-Exporter)

2. **Prometheus**: Sammelt, speichert und verarbeitet die Metriken.

3. **Grafana**: Visualisiert die Metriken und stellt Dashboards und Warnungsmechanismen bereit.

![Monitoring-Architektur](monitoring-architecture.png)

## Wichtige Metriken

### API-Server-Metriken

- **http_requests_total**: Gesamtzahl der HTTP-Anfragen, aufgeschlüsselt nach Methode, Pfad und Statuscode.
- **http_request_duration_seconds**: Dauer der HTTP-Anfragen in Sekunden.
- **active_requests**: Anzahl der aktuell aktiven Anfragen.

### Celery-Metriken

- **tasks_total**: Gesamtzahl der Tasks, aufgeschlüsselt nach Task-Typ und Status (gestartet, abgeschlossen, fehlgeschlagen).
- **task_duration_seconds**: Dauer der Task-Ausführung in Sekunden.

### Redis-Metriken

- **redis_memory_used_bytes**: Vom Redis-Server verwendeter Speicher.
- **redis_connected_clients**: Anzahl der verbundenen Clients.
- **redis_commands_processed_total**: Gesamtzahl der verarbeiteten Befehle.

### System-Metriken

- **node_cpu_utilization**: CPU-Auslastung in Prozent.
- **node_memory_utilization**: Speicherauslastung in Prozent.
- **node_disk_utilization**: Festplattenauslastung in Prozent.

## Zugriff auf Grafana

Nach dem Start des Systems können Sie auf Grafana unter folgender URL zugreifen:

```
http://localhost:3000
```

Die Standard-Anmeldedaten sind:
- Benutzername: `admin`
- Passwort: `admin`

Sie werden aufgefordert, das Passwort bei der ersten Anmeldung zu ändern.

## Vorkonfigurierte Dashboards

### 1. ERP-System-Übersicht

Das Hauptdashboard bietet einen Überblick über das gesamte System:

- API-Server-Leistung (Anfragen pro Sekunde, Antwortzeiten)
- CPU-, Speicher- und Festplattenauslastung
- Celery-Task-Status
- Redis-Speichernutzung
- HTTP-Statuscodes

### 2. API-Leistungs-Dashboard

Dieses Dashboard konzentriert sich auf die API-Leistung:

- Anfragen pro Sekunde aufgeschlüsselt nach Endpunkten
- Antwortzeiten für jeden Endpunkt (Durchschnitt, P95, P99)
- Fehlerrate
- Top-10-langsamste Endpunkte

### 3. Celery-Tasks-Dashboard

Überwacht die asynchronen Aufgaben:

- Task-Durchsatz (Aufgaben pro Minute)
- Task-Dauer nach Typ
- Fehlgeschlagene Tasks
- Warteschlangenlänge

### 4. Redis-Monitoring-Dashboard

Überwacht den Redis-Server:

- Memory-Nutzung
- Befehle pro Sekunde
- Verbindungen
- Verdrängungen (Evictions)

## Warnungen konfigurieren

Grafana unterstützt verschiedene Warnungskanäle wie E-Mail, Slack, PagerDuty usw. So richten Sie Warnungen ein:

1. Navigieren Sie zu "Alerting" > "Notification channels" in Grafana.
2. Klicken Sie auf "New channel" und konfigurieren Sie Ihren bevorzugten Kanal.
3. Kehren Sie zu einem Dashboard zurück und bearbeiten Sie ein Panel.
4. Wechseln Sie zur Registerkarte "Alert" und definieren Sie Bedingungen für die Warnung.

### Empfohlene Warnungen

- **Hohe API-Antwortzeit**: Wenn die durchschnittliche Antwortzeit über 500 ms liegt.
- **Hohe Fehlerrate**: Wenn mehr als 5% der Anfragen fehlschlagen (5xx-Fehler).
- **Redis-Speicher-Warnung**: Wenn die Redis-Speichernutzung 80% überschreitet.
- **Fehlgeschlagene Tasks**: Wenn die Rate fehlgeschlagener Tasks 5% überschreitet.
- **Systemressourcen**: Wenn CPU oder Speicher über 85% liegen.

## PromQL-Beispiele

Prometheus Query Language (PromQL) wird verwendet, um Metriken abzufragen. Hier sind einige nützliche Beispiele:

### API-Anfragen pro Sekunde
```
sum(rate(http_requests_total[5m]))
```

### 95. Perzentil der API-Antwortzeit
```
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))
```

### Fehlerrate in Prozent
```
sum(rate(http_requests_total{status_code=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100
```

### Anzahl fehlgeschlagener Celery-Tasks
```
sum(tasks_total{status="failed"})
```

## Fehlerbehebung

### Keine Metriken in Prometheus

1. Überprüfen Sie, ob die Exporter laufen:
   ```
   docker-compose ps
   ```

2. Überprüfen Sie die Logs der Exporter:
   ```
   docker-compose logs prometheus
   docker-compose logs node-exporter
   docker-compose logs redis-exporter
   ```

3. Überprüfen Sie, ob die Ziele in Prometheus erreichbar sind:
   Öffnen Sie http://localhost:9090/targets in Ihrem Browser.

### Grafana zeigt keine Daten an

1. Überprüfen Sie, ob die Prometheus-Datenquelle korrekt konfiguriert ist:
   Gehen Sie zu "Configuration" > "Data sources" in Grafana.

2. Testen Sie die Verbindung zu Prometheus:
   Klicken Sie auf die Prometheus-Datenquelle und dann auf "Test".

3. Überprüfen Sie, ob Prometheus Daten hat:
   Führen Sie eine einfache Abfrage in der Prometheus-UI aus (http://localhost:9090/graph).

## Erweiterte Konfiguration

### Skalieren der Aufbewahrungszeit

Um die Aufbewahrungszeit für Metriken in Prometheus zu ändern, bearbeiten Sie die Prometheus-Konfiguration in `docker/prometheus/Dockerfile`:

```
CMD ["--config.file=/etc/prometheus/prometheus.yml", \
     "--storage.tsdb.path=/prometheus", \
     "--storage.tsdb.retention.time=30d"]  # Hier auf 30 Tage erhöht
```

### Hinzufügen benutzerdefinierter Metriken

1. Definieren Sie neue Metriken in `backend/monitoring/prometheus_exporter.py`.
2. Aktualisieren Sie die Anwendung, um diese Metriken zu erfassen.
3. Erstellen Sie ein neues Dashboard oder Panel in Grafana, um die Metriken zu visualisieren. 