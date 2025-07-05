# Konzept für Automatisierte Warnungen im ERP-System

Dieses Dokument beschreibt die Implementierung eines umfassenden Warnsystems für unser containerisiertes ERP-System, basierend auf der bestehenden Prometheus-Monitoring-Infrastruktur.

## 1. Übersicht

Das automatisierte Warnsystem soll Probleme frühzeitig erkennen, die Reaktionszeiten verkürzen und die Systemstabilität verbessern. Es wird auf der vorhandenen Prometheus-Metriken-Erfassung aufbauen und Alertmanager für die Benachrichtigungsverwaltung nutzen.

### Ziele
- Frühzeitige Erkennung von Problemen vor Benutzerauswirkungen
- Reduktion der mittleren Zeit bis zur Lösung (MTTR) um 50%
- Vermeidung von False Positives durch intelligente Schwellenwerte
- Klare Zuordnung von Verantwortlichkeiten und Eskalationspfaden
- Integration in bestehende Kommunikationssysteme (Slack, E-Mail, PagerDuty)

## 2. Architektur

```
┌─────────────┐     ┌────────────┐     ┌────────────────┐     ┌─────────────────┐
│ Anwendungen │────▶│ Prometheus │────▶│ Alertmanager   │────▶│ Benachrichtigung │
│ & Exporter  │     │            │     │                │     │ (Slack,Email,SMS)│
└─────────────┘     └────────────┘     └────────────────┘     └─────────────────┘
       │                  │                    │                       │
       │                  │                    │                       │
       ▼                  ▼                    ▼                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                                 Grafana                                       │
│                       (Visualisierung & Dashboard)                           │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Komponenten

1. **Prometheus**: Sammelt Metriken und wertet Warnungsregeln aus
2. **Alertmanager**: Verarbeitet Warnungen, dedupliziert und routet sie an die entsprechenden Empfänger
3. **Benachrichtigungskanäle**: Slack, E-Mail, SMS und PagerDuty für unterschiedliche Dringlichkeitsstufen
4. **Grafana**: Visualisierung von Metriken und Warnungen in Dashboards

## 3. Warnungsklassifizierung

Warnungen werden nach Schweregrad kategorisiert:

### Kritisch (P1)
- Erfordert sofortige Aufmerksamkeit (24/7)
- Betrifft Kerngeschäftsprozesse
- Benachrichtigt über PagerDuty und SMS
- Beispiele: 
  - Produktionsausfälle (API-Server nicht erreichbar)
  - Datenbankausfälle
  - Sicherheitsverletzungen

### Hoch (P2)
- Erfordert Aufmerksamkeit innerhalb von 1 Stunde während der Geschäftszeiten
- Benachrichtigt über Slack und E-Mail
- Beispiele:
  - Erhöhte Fehlerraten (>5%)
  - Übermäßige Antwortzeiten (>500ms)
  - Speichernutzung >85%

### Mittel (P3)
- Erfordert Aufmerksamkeit innerhalb eines Arbeitstages
- Benachrichtigt über Slack
- Beispiele:
  - Ressourcennutzung >70%
  - Langsamere Transaktionen als normal
  - Nicht-kritische Dienste betroffen

### Niedrig (P4)
- Informative Warnungen
- Werden in Grafana-Dashboards angezeigt, ohne aktive Benachrichtigung
- Beispiele:
  - Langsam wachsender Ressourcenverbrauch
  - Temporäre Leistungsschwankungen
  - Nichtkritische Aufgaben in der Warteschlange

## 4. Implementierung

### 4.1 Prometheus-Konfiguration

Beispiel für eine Warnungsregel-Datei (`alerts.yml`):

```yaml
groups:
- name: erp_system_alerts
  rules:
  - alert: HighErrorRate
    expr: sum(rate(http_requests_total{status_code=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.05
    for: 5m
    labels:
      severity: high
    annotations:
      summary: "Hohe Fehlerrate erkannt"
      description: "Die API-Fehlerrate überschreitet 5% (aktuell: {{ $value | humanizePercentage }})"

  - alert: SlowAPIResponse
    expr: http_request_duration_seconds{quantile="0.95"} > 0.5
    for: 5m
    labels:
      severity: high
    annotations:
      summary: "Langsame API-Antworten erkannt"
      description: "Die 95%-Antwortzeit ist höher als 500ms (aktuell: {{ $value | humanizeDuration }})"
      
  - alert: HighCPUUsage
    expr: avg(node_cpu_utilization) > 80
    for: 10m
    labels:
      severity: high
    annotations:
      summary: "Hohe CPU-Auslastung"
      description: "Die durchschnittliche CPU-Auslastung liegt über 80% (aktuell: {{ $value | humanizePercentage }})"
```

### 4.2 Alertmanager-Konfiguration

Beispiel für eine Alertmanager-Konfiguration:

```yaml
global:
  resolve_timeout: 5m
  slack_api_url: 'https://hooks.slack.com/services/TXXXXXXXX/BXXXXXXXX/XXXXXXXXXX'

route:
  group_by: ['alertname', 'job']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'slack-notifications'
  routes:
  - match:
      severity: critical
    receiver: 'pagerduty'
    continue: true
  - match:
      severity: high
    receiver: 'slack-notifications'
    continue: true
  - match:
      severity: medium
    receiver: 'slack-notifications'
    group_wait: 1m
    group_interval: 10m
    repeat_interval: 8h

receivers:
- name: 'slack-notifications'
  slack_configs:
  - channel: '#erp-alerts'
    send_resolved: true
    title: '{{ .Status | toUpper }}: {{ .GroupLabels.alertname }}'
    text: >-
      {{ range .Alerts }}
        *Alert:* {{ .Annotations.summary }}
        *Details:* {{ .Annotations.description }}
        *Severity:* {{ .Labels.severity }}
      {{ end }}

- name: 'pagerduty'
  pagerduty_configs:
  - service_key: '<pagerduty-service-key>'
    send_resolved: true
    description: '{{ .GroupLabels.alertname }}'
    details:
      summary: '{{ .Annotations.summary }}'
      description: '{{ .Annotations.description }}'
      severity: '{{ .Labels.severity }}'
      component: '{{ .Labels.job }}'
```

### 4.3 Spezifische Warnungsregeln

#### System-Warnungen
- CPU-Auslastung > 80% für 10 Minuten
- Speicherauslastung > 85% für 5 Minuten
- Festplattennutzung > 85% für 10 Minuten
- Netzwerkfehler > 1% für 5 Minuten

#### Anwendungs-Warnungen
- API-Fehlerrate > 5% für 5 Minuten
- P95-Antwortzeit > 500ms für 5 Minuten
- Mehr als 3 API-Server-Neustarts in 15 Minuten
- API-Verfügbarkeit < 99,9% in 5 Minuten

#### Redis-Warnungen
- Redis-Speichernutzung > 80% für 5 Minuten
- Redis-Verbindungsfehler > 5 in 5 Minuten
- Redis-Latenz > 100ms für 5 Minuten

#### Celery-Warnungen
- Fehlgeschlagene Tasks > 5% für 10 Minuten
- Task-Warteschlangenlänge > 1000 für 15 Minuten
- Mehr als 50 Tasks mit Verzögerung > 60 Sekunden

#### Geschäftsspezifische Warnungen
- Anzahl neuer Aufträge < Tagesuntergrenze für 1 Stunde
- Rechnungsstellungsfehler > 1% für 30 Minuten
- API-Anfragen für kritische Geschäftsfunktionen fehlgeschlagen > 1% für 5 Minuten

## 5. Reaktions- und Eskalationsverfahren

### 5.1 Standardreaktionsverfahren

1. **Erkennung**: Prometheus löst eine Warnung aus
2. **Benachrichtigung**: Alertmanager sendet Benachrichtigungen an die konfigurierten Kanäle
3. **Erstbewertung**: On-Call-Mitarbeiter bewertet die Warnung innerhalb der SLA-Zeit
4. **Behebung**: Problem wird gemäß den dokumentierten Runbooks behoben
5. **Überprüfung**: Bestätigung, dass das Problem gelöst ist
6. **Nachbesprechung**: Dokumentation des Vorfalls und der Behebungsmaßnahmen

### 5.2 Eskalationspfade

#### Kritische Warnungen (P1)
1. On-Call-Ingenieur (15 Minuten)
2. On-Call-Manager (15 Minuten nach Schritt 1)
3. CTO (15 Minuten nach Schritt 2)

#### Hohe Warnungen (P2)
1. Zuständiges Team (1 Stunde)
2. Teamleiter (1 Stunde nach Schritt 1)
3. Abteilungsleiter (2 Stunden nach Schritt 2)

### 5.3 Automatisierte Reaktionen

Für häufige Probleme werden automatisierte Reaktionen implementiert:

- **Erhöhte Lastwarnungen**: Automatische Skalierung der betroffenen Dienste
- **Fehlerhafte Pods**: Automatischer Neustart fehlerhafter Pods
- **Speicherprobleme**: Automatische Bereinigung temporärer Dateien und Logs
- **Fehlgeschlagene Hintergrundaufgaben**: Automatische Wiederholung mit exponentieller Rückstellung

## 6. Wartung und Weiterentwicklung

### 6.1 Regelmäßige Überprüfung
- Monatliche Überprüfung der Warnungseffektivität
- Anpassung von Schwellenwerten basierend auf historischen Daten
- Überprüfung und Aktualisierung der Eskalationspfade

### 6.2 False Positives Reduzierung
- Implementierung von intelligenten Schwellenwerten basierend auf Tageszeit und Wochentag
- Korrelation von Metriken, um komplexere Bedingungen zu erkennen
- Einführung von Saisonalitäts- und Trendanalyse in Warnungsschwellenwerte

### 6.3 Erweiterte Funktionen
- Integration von Machine Learning zur Anomalieerkennung
- Implementierung von prädiktiven Warnungen basierend auf Trendanalyse
- Automatisierte Runbooks für häufige Probleme

## 7. Implementierungsplan

### Phase 1: Grundlegende Warnungen (2 Wochen)
- Einrichtung von Alertmanager
- Implementierung grundlegender System- und Anwendungswarnungen
- Integration mit Slack

### Phase 2: Erweiterte Warnungen (2 Wochen)
- Implementierung aller spezifischen Warnungsregeln
- Integration mit PagerDuty und E-Mail
- Erstellung von Runbooks für häufige Probleme

### Phase 3: Automatisierung (3 Wochen)
- Implementierung automatisierter Reaktionen
- Entwicklung von Eskalationspfaden
- Schulung des Teams in Warnsystem und Reaktionsverfahren

### Phase 4: Optimierung (laufend)
- Sammlung von Feedback und Anpassung der Schwellenwerte
- Reduzierung von False Positives
- Erweiterung um geschäftsspezifische Metriken 