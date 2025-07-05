# Observer-Microservice für das AI-gesteuerte ERP-System

## Übersicht

Der Observer-Microservice ist eine Überwachungslösung, die speziell für die Microservice-Architektur des AI-gesteuerten ERP-Systems entwickelt wurde. Er überwacht in Echtzeit CPU- und RAM-Nutzung sowie Antwortzeiten aller Services und hilft bei der Performance-Optimierung.

## Funktionen

- **Echtzeitüberwachung von Services**:
  - CPU-Auslastung
  - RAM-Nutzung 
  - Antwortzeiten (Latenz)
  - Service-Status (online/offline)

- **Performance-Analyse**:
  - Identifikation von Performance-Engpässen
  - Erkennung von Memory-Leaks
  - Identifikation langsamer Service-Antworten
  - Empfehlungen für Skalierungsmaßnahmen

- **Web-Dashboard**:
  - Echtzeit-Visualisierung der Performance-Metriken
  - Grafische Darstellung von Trends
  - Übersicht über alle Services

- **Automatische Berichterstellung**:
  - Regelmäßige Performance-Berichte
  - Optimierungsempfehlungen mit Prioritäten
  - Dokumentation von Performance-Trends

## Architektur

Der Observer-Microservice besteht aus drei Hauptkomponenten:

1. **MicroserviceObserver**:
   - Kernkomponente zur Überwachung der Services
   - Sammelt Metriken über Prozesse und API-Endpunkte
   - Speichert Verlaufsdaten für die Analyse

2. **SimplePerformanceOptimizer**:
   - Analysiert gesammelte Metriken
   - Generiert Optimierungsempfehlungen
   - Erstellt regelmäßige Berichte

3. **Web-Dashboard**:
   - Starlette-basierte Web-Oberfläche
   - Visualisierung der Performance-Daten
   - Echtzeit-Updates über JavaScript

## Technische Details

- **Sprache & Framework**: Python, Starlette, uvicorn
- **Datensammlung**: psutil (Prozessüberwachung), requests (API-Tests)
- **Berichterstellung**: Markdown-Formatierung, Zeitreihenanalyse
- **Konfiguration**: JSON-basierte Konfigurationsdatei

## Verwendung

### Standardstart

```bash
# Linux/macOS
./start_observer.sh

# Windows
start_observer.bat
```

### Mit benutzerdefinierten Optionen

```bash
# Linux/macOS
cd backend
python start_observer_simple.py --port 8020 --report-interval 15

# Windows
cd backend
python start_observer_simple.py --port 8020 --report-interval 15
```

### Verfügbare Parameter

- `--port`: Port für das Dashboard (Standard: 8010)
- `--report-interval`: Intervall für Optimierungsberichte in Minuten (Standard: 30)
- `--config`: Pfad zur Konfigurationsdatei (Standard: observer_config.json)
- `--no-optimizer`: Deaktiviert den Performance Optimizer

## Konfiguration

Die Konfiguration erfolgt über die Datei `observer_config.json`:

```json
{
  "services": {
    "backend": {
      "name": "Backend Core Service",
      "url": "http://localhost:8003/health",
      "process_name": "python",
      "process_args": "minimal_server.py",
      "threshold_cpu": 80,
      "threshold_memory": 80,
      "threshold_response": 1.0
    },
    "theme_service": {
      "name": "Theme Microservice",
      "url": "http://localhost:5001/health",
      "process_name": "node",
      "process_args": "theme_service.js",
      "threshold_cpu": 70,
      "threshold_memory": 70,
      "threshold_response": 0.5
    }
  },
  "monitoring_interval": 5,
  "max_metrics_per_service": 1000
}
```

## Integration mit anderen Microservices

- Alle Microservices sollten einen `/health`-Endpunkt bereitstellen, der den Zustand des Services meldet
- Für die Prozessüberwachung sollten eindeutige Prozessnamen oder Befehlszeilenargumente verwendet werden
- Leistungsschwellwerte können pro Service konfiguriert werden

## Optimierungsberichte

Die Optimierungsberichte werden im Markdown-Format generiert und enthalten:

1. **Kritische Probleme** (Priorität 5)
   - Memory-Leaks
   - Schwerwiegende Performance-Engpässe

2. **Wichtige Optimierungen** (Priorität 4)
   - Hohe CPU- oder RAM-Auslastung
   - Langsame Antwortzeiten

3. **Empfohlene Optimierungen** (Priorität 3)
   - Performance-Optimierungsmöglichkeiten
   - Skalierungsempfehlungen

4. **Mögliche Optimierungen** (Priorität 1-2)
   - Kleinere Verbesserungsmöglichkeiten

## Projektübergreifender Performance-Standard

Die folgenden Anweisungen definieren den einheitlichen Performance-Standard für alle Microservices im AI-gesteuerten ERP-System. Sie sind verbindlich für alle Entwicklungsteams und dienen als Grundlage für eine optimale Systemleistung.

### Health-Endpunkt-Spezifikation

Jeder Microservice muss einen `/health`-Endpunkt mit folgender standardisierter JSON-Struktur bereitstellen:

```json
{
  "status": "online",
  "version": "1.0.0",
  "timestamp": "2024-07-15T12:00:00Z",
  "uptime_seconds": 3600,
  "metrics": {
    "cpu_usage_percent": 12.5,
    "memory_usage_percent": 35.8,
    "request_count": 1254,
    "average_response_time_ms": 48.2,
    "database_connections": 5,
    "queue_size": 0
  }
}
```

### Performance-Schwellwerte

Für jeden Microservice gelten die folgenden Basis-Schwellwerte, die in der Observer-Konfiguration überschrieben werden können:

| Metrik | Warnung | Kritisch | Beschreibung |
|--------|---------|----------|--------------|
| CPU-Auslastung | 70% | 85% | Prozessor-Auslastung des Service-Prozesses |
| Speichernutzung | 75% | 90% | RAM-Auslastung des Service-Prozesses |
| Antwortzeit | 300ms | 500ms | Durchschnittliche Zeit für API-Antworten |
| Datenbankverbindungen | 80% | 95% | Auslastung des Verbindungspools |
| 95. Perzentil Antwortzeit | 800ms | 1200ms | Langsamste 5% der Anfragen |

### Verlässlichkeitsmetriken

Neben Performance-Metriken werden auch folgende Zuverlässigkeits-Kennzahlen überwacht:

- **Verfügbarkeit**: Mindestens 99,9% Erreichbarkeit im Produktivbetrieb
- **Fehlerrate**: Maximal 0,1% Fehler bei Anfragen
- **Wiederherstellungszeit**: Maximal 30 Sekunden nach Absturz

### Diagnose und Fehlerbehebung

Bei Überschreitung der Schwellwerte unterstützt der Observer-Service mit:

1. **Automatischer Root-Cause-Analyse**
   - Korrelation von Metriken zur Identifikation der Ursache
   - Identifikation von Ressourcenengpässen
   - Erkennung von blockierenden Anfragen oder Deadlocks

2. **Empfohlene Gegenmaßnahmen**
   - Sofortmaßnahmen für kritische Probleme
   - Langfristige Architekturempfehlungen
   - Code-Optimierungsvorschläge

3. **Eskalationspfad**
   - Automatische Benachrichtigung des verantwortlichen Teams
   - Dokumentation in Jira/GitHub
   - Nachverfolgung bis zur Problemlösung

### Implementierungsrichtlinien für Teams

1. **Entwicklung neuer Services**
   - Health-Endpunkt muss vor Deployment implementiert sein
   - Performance-Tests müssen definierte Schwellwerte einhalten
   - Erste Überwachung mit Standard-Schwellwerten

2. **Bestehende Services**
   - Alle existierenden Services müssen den Health-Endpunkt nachrüsten
   - Observer-Integration ist verpflichtend für alle Services
   - Schwellwerte müssen basierend auf realen Nutzungsdaten angepasst werden

3. **Kontinuierliche Verbesserung**
   - Wöchentliche Überprüfung der Observer-Berichte
   - Priorisierung von Performance-Optimierungen
   - Regelmäßige Kalibrierung der Schwellwerte

### Verantwortlichkeiten

- **DevOps-Team**: Betrieb und Wartung des Observer-Services
- **Feature-Teams**: Integration ihrer Services mit dem Observer
- **Architektur-Team**: Überprüfung und Freigabe der Performance-Schwellwerte
- **Produkt-Owner**: Priorisierung von Performance-Optimierungen im Backlog

Diese Richtlinien stellen sicher, dass das gesamte ERP-System eine konsistente, optimale Leistung bietet und frühzeitig auf potenzielle Probleme reagiert werden kann.

## Entwicklungsziele

- **Erweiterte Metrik-Sammlung**: Zusätzliche Metriken wie Netzwerknutzung, Disk-I/O
- **Proaktive Warnungen**: E-Mail- oder Slack-Benachrichtigungen bei Performance-Problemen
- **Service-Auto-Healing**: Automatische Neustartversuche für problematische Services
- **Verteilte Tracing-Integration**: Unterstützung für OpenTelemetry 