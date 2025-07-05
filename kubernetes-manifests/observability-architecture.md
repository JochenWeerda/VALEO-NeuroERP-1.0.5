# Observability-Architektur für das ERP-System

Dieses Dokument beschreibt die Architektur und Komponenten des Observability-Stacks für das AI-getriebene ERP-System. Der Stack ist darauf ausgelegt, umfassende Einblicke in die Leistung, Verfügbarkeit und das Verhalten des Systems zu bieten.

## Überblick

Die Observability-Architektur basiert auf den drei Säulen der Observability:

1. **Metriken**: Erfassen quantitativer Daten über Systemleistung und -verhalten
2. **Tracing**: Verfolgen von Anfragen durch verschiedene Systemkomponenten
3. **Logging**: Detaillierte Erfassung von Ereignissen und Zuständen

![Observability-Architektur](https://excalidraw.com/#json=ZHLAoqJwTw1c-l11e89Fr,v4KBQwTLcUQd9EvvgePwqg)

```
+-------------------+     +-------------------+     +-------------------+
|   Metriken        |     |   Tracing         |     |   Logging         |
|   Prometheus      |     |   Jaeger          |     |   ELK-Stack       |
|   Grafana         |     |                   |     |                   |
|   Alertmanager    |     |                   |     |                   |
+-------------------+     +-------------------+     +-------------------+
          |                        |                        |
          v                        v                        v
+-----------------------------------------------------------------------+
|                          Kubernetes-Cluster                           |
|                                                                       |
|  +------------------------+      +-----------------------------+      |
|  |      Service Mesh      |      |    Ingress Controller       |      |
|  +------------------------+      +-----------------------------+      |
|                                                                       |
|  +----------------+  +----------------+  +----------------+           |
|  | Document       |  | Frontend       |  | Auth           |           |
|  | Service        |  | Service        |  | Service        |           |
|  +----------------+  +----------------+  +----------------+           |
|                                                                       |
|  +----------------+  +----------------+  +----------------+           |
|  | Reporting      |  | Notification   |  | Other          |           |
|  | Service        |  | Service        |  | Services       |           |
|  +----------------+  +----------------+  +----------------+           |
|                                                                       |
+-----------------------------------------------------------------------+
```

## Komponenten

### 1. Metriken-Stack

#### Prometheus
- **Funktion**: Sammlung und Speicherung von Metriken
- **Deployment**: StatefulSet mit persistentem Speicher
- **Konfiguration**: ConfigMap `prometheus-config`
- **Hauptfeatures**:
  - Automatische Service-Discovery über Kubernetes-Annotationen
  - Vordefinierte Alert-Regeln für kritische Systemzustände
  - Langzeitspeicherung von Metriken (15 Tage)
  - Recording Rules für optimierte Abfragen häufiger Metriken

#### Grafana
- **Funktion**: Visualisierung und Dashboards
- **Deployment**: Deployment mit ConfigMaps für vordefinierte Dashboards
- **Konfiguration**: ConfigMaps `grafana-datasources`, `grafana-dashboards`, `grafana-dashboard-definitions`
- **Dashboards**:
  - ERP-Übersichtsdashboard (System-KPIs)
  - Document-Service-Dashboard (spezifische Service-Metriken)
  - Weitere servicespezifische Dashboards können hinzugefügt werden

#### Alertmanager
- **Funktion**: Alarmmanagement und -benachrichtigung
- **Deployment**: Deployment mit persistentem Speicher
- **Konfiguration**: ConfigMap `alertmanager-config`
- **Benachrichtigungskanäle**:
  - E-Mail (konfigurierbar)
  - Slack (konfigurierbar)
  - Routing und Gruppierung nach Schweregrad und Service

### 2. Tracing-Stack

#### Jaeger
- **Funktion**: Verteiltes Tracing für Service-übergreifende Anfragen
- **Deployment**: Jaeger Operator mit Jaeger-Instance
- **Speicher**: Elasticsearch für langfristige Speicherung von Traces
- **Features**:
  - Automatische Instrumentierung über Sidecar-Injection
  - Vollständiges Tracing von End-to-End-Anfragen
  - Hierarchische Visualisierung von Spans
  - Performance-Analyse mit Flame-Graphs

### 3. Logging-Stack

#### Elasticsearch
- **Funktion**: Speicherung und Indizierung von Logs
- **Deployment**: StatefulSet mit persistentem Speicher
- **Konfiguration**: Single-Node für Entwicklungsumgebungen, Cluster für Produktion

#### Logstash
- **Funktion**: Log-Aggregation und -Transformation
- **Deployment**: Deployment mit ConfigMap für Pipeline-Konfiguration
- **Eingabekanäle**:
  - Filebeat für Container-Logs
  - HTTP-Eingabe für direkte API-Logs
  - Beats-Protokoll für Beat-Agenten

#### Kibana
- **Funktion**: Log-Visualisierung und -Analyse
- **Deployment**: Deployment mit Service und Ingress
- **Features**:
  - Vorkonfigurierte Index-Patterns für Services und Kubernetes
  - Saved Searches für häufige Abfragen
  - Dashboards für Systemübersicht

#### Filebeat
- **Funktion**: Log-Sammlung von Kubernetes-Nodes
- **Deployment**: DaemonSet mit Hostpfad-Mounts
- **Konfiguration**: ConfigMap `filebeat-config`
- **Erfasst**:
  - Container-Logs aus `/var/log/containers`
  - Kubernetes-Metadaten für Kontext

## Zugriffsmanagement

Alle Observability-Komponenten sind über Ingress-Ressourcen mit Basic-Authentication abgesichert:

- **Metrics**: https://monitoring.erp.example.com/
  - Grafana: `/grafana`
  - Prometheus: `/prometheus`
  - Alertmanager: `/alertmanager`
- **Tracing**: https://tracing.erp.example.com/
- **Logging**: https://logs.erp.example.com/

## Service-Instrumentierung

### Metriken-Instrumentierung

Dienste können auf zwei Arten Metriken bereitstellen:

1. **Prometheus-Annotationen** in Kubernetes-Manifesten:
   ```yaml
   annotations:
     prometheus.io/scrape: "true"
     prometheus.io/port: "8080"
     prometheus.io/path: "/metrics"
   ```

2. **Eigene Metriken-Endpunkte** mit bibliothekenspezifischem Code.

Beispiel für Document-Service (NodeJS):
```javascript
const client = require('prom-client');
const counter = new client.Counter({
  name: 'document_operations_total',
  help: 'Total number of document operations',
  labelNames: ['operation', 'document_type']
});

// Bei einer Operation inkrementieren
counter.inc({ operation: 'upload', document_type: 'invoice' });
```

### Tracing-Instrumentierung

Für die Implementierung von Tracing stehen zwei Hauptansätze zur Verfügung:

1. **Automatische Instrumentierung** über Jaeger-Sidecar:
   ```yaml
   annotations:
     jaeger.erp-system.svc.cluster.local/inject: "true"
     jaeger.erp-system.svc.cluster.local/service-name: "document-service"
   ```

2. **Manuelle Instrumentierung** mit OpenTracing-API:
   ```javascript
   const tracer = initJaegerTracer('document-service');
   const span = tracer.startSpan('document_upload');
   try {
     // Operation ausführen
     span.setTag('document.type', docType);
     span.finish();
   } catch (error) {
     span.setTag('error', true);
     span.log({ event: 'error', message: error.message });
     span.finish();
     throw error;
   }
   ```

### Logging-Instrumentierung

Für strukturiertes Logging wird ein standardisiertes Format mit Kontext-Informationen empfohlen:

```javascript
// Beispiel mit Winston (NodeJS)
logger.info('Dokument hochgeladen', {
  document_id: doc.id,
  document_type: doc.type,
  user_id: user.id,
  size_bytes: doc.size,
  trace_id: currentSpan.context().toTraceId(),
  span_id: currentSpan.context().toSpanId()
});
```

## Integration zwischen den Säulen

Die wahre Stärke des Observability-Stacks liegt in der Integration der drei Säulen:

1. **Korrelations-IDs**: Eindeutige Kennungen in Logs, Traces und Metriken
   - Trace-ID in Logs einfügen
   - Request-ID für Korrelation zwischen Services
   - Exemplar-Support in Prometheus

2. **Service-Kontext**: Konsistente Verwendung von Service-Namen und -Labels
   - Gleiche Service-Namen in allen Komponenten
   - Kubernetes-Labels für automatische Metadaten

3. **Alerting-Integration**: Benachrichtigungen mit kontextbezogenen Links
   - Links zu relevanten Dashboards
   - Links zu Tracing-Informationen
   - Links zu Logs für den entsprechenden Zeitraum

## Betriebsaspekte

### Ressourcenanforderungen

| Komponente       | CPU Request | CPU Limit | Memory Request | Memory Limit |
|------------------|-------------|-----------|----------------|--------------|
| Prometheus       | 500m        | 1000m     | 2Gi            | 4Gi          |
| Grafana          | 200m        | 500m      | 256Mi          | 1Gi          |
| Alertmanager     | 100m        | 200m      | 128Mi          | 256Mi        |
| Jaeger-Query     | 100m        | 500m      | 128Mi          | 512Mi        |
| Elasticsearch    | 500m        | 1000m     | 1Gi            | 2Gi          |
| Kibana           | 250m        | 500m      | 512Mi          | 1Gi          |
| Logstash         | 200m        | 500m      | 512Mi          | 1Gi          |
| Filebeat         | 50m         | 100m      | 100Mi          | 200Mi        |

### Persistenz

| Komponente       | Speicheranforderung | Datenerhalt bei Neustart |
|------------------|---------------------|--------------------------|
| Prometheus       | 50Gi                | Ja                       |
| Alertmanager     | 2Gi                 | Ja                       |
| Grafana          | 10Gi                | Ja                       |
| Elasticsearch    | 30Gi                | Ja                       |

### Skalierung

Für Produktionsumgebungen wird folgende Skalierung empfohlen:

- **Prometheus**: 1-3 Replicas (mit Thanos für Hochverfügbarkeit)
- **Elasticsearch**: 3-5 Node-Cluster mit dedizierten Master-, Data- und Ingest-Nodes
- **Logstash**: 2-3 Replicas
- **Filebeat**: DaemonSet (1 pro Node)

## Einrichtung und Bereitstellung

### Komplette Bereitstellung

```shell
# Windows (PowerShell)
.\kubernetes-manifests\deploy-scripts\deploy-complete-observability.ps1

# Linux/MacOS
bash ./kubernetes-manifests/deploy-scripts/deploy-complete-observability.sh
```

### Modulare Bereitstellung

```shell
# Nur Metrics-Stack
.\kubernetes-manifests\deploy-scripts\deploy-monitoring.ps1

# Nur Tracing-Stack
.\kubernetes-manifests\deploy-scripts\setup-jaeger-tracing.ps1

# Nur Logging-Stack
.\kubernetes-manifests\deploy-scripts\setup-elk-stack.ps1
```

## Erweiterungen und Anpassungen

### Hinzufügen neuer Dashboards

1. Erstellen Sie eine JSON-Dashboard-Definition
2. Fügen Sie sie zur `grafana-dashboard-definitions` ConfigMap hinzu
3. Aktualisieren Sie die ConfigMap:
   ```shell
   kubectl apply -f updated-dashboard-configmap.yaml
   ```

### Anpassen der Alert-Regeln

1. Bearbeiten Sie die `alert_rules.yml` in der `prometheus-config` ConfigMap
2. Wenden Sie die aktualisierten Regeln an:
   ```shell
   kubectl apply -f updated-prometheus-config.yaml
   ```

### Hinzufügen neuer Benachrichtigungskanäle

1. Bearbeiten Sie die `alertmanager.yml` in der `alertmanager-config` ConfigMap
2. Wenden Sie die aktualisierten Konfigurationen an:
   ```shell
   kubectl apply -f updated-alertmanager-config.yaml
   ```

## Best Practices

### Metriken

1. **Standardisierte Benennungskonventionen**: Verwenden Sie konsistente Namenskonventionen:
   - `service_operation_unit` (z.B. `http_requests_total`)
   - Einheitliche Labels für Dienste, Endpunkte und Umgebungen

2. **Relevante Kardinalität**: Vermeiden Sie zu hohe Kardinalität:
   - Nicht jede Request-ID als Label verwenden
   - Hochkardinale Dimensionen aggregieren oder reduzieren

3. **Service Level Objectives (SLOs)**: Definieren Sie klare SLOs:
   - Erfassen Sie Erfolgs- und Fehlerraten
   - Messen Sie Latenz mit Histogrammen
   - Erstellen Sie Recording Rules für SLO-Berechnungen

### Tracing

1. **Sampling-Strategie**: Konfigurieren Sie sinnvolles Sampling:
   - Entwicklungsumgebung: 100% der Traces
   - Produktionsumgebung: 10-20% oder adaptives Sampling

2. **Kritische Operationen**: Markieren Sie wichtige Geschäftsprozesse:
   - Stellen Sie sicher, dass kritische Flows immer erfasst werden
   - Verwenden Sie Flags wie `sampling.priority=1`

3. **Sparsame Span-Erzeugung**: Vermeiden Sie Overtracing:
   - Keine Spans für triviale Operationen
   - Kontextweitergabe auch ohne neue Spans

### Logging

1. **Strukturiertes Logging**: Verwenden Sie immer strukturierte Logs:
   - JSON-Format für maschinelle Verarbeitung
   - Standardisierte Felder für Korrelation

2. **Log-Levels**: Verwenden Sie Log-Levels angemessen:
   - ERROR: Fehler, die menschliches Eingreifen erfordern
   - WARN: Potenzielle Probleme, die beobachtet werden sollten
   - INFO: Wichtige Geschäftsereignisse und Operationen
   - DEBUG: Detaillierte Informationen für Fehlersuche (nur in Entwicklung)

3. **Sensible Daten**: Keine sensiblen Informationen loggen:
   - Keine Passwörter oder Tokens
   - Keine personenbezogenen Daten ohne Maskierung

## Fehlerbehebung

### Prometheus ist nicht erreichbar

1. Überprüfen Sie den Status des Pods:
   ```shell
   kubectl get pods -n erp-system -l app=prometheus
   ```

2. Überprüfen Sie die Logs:
   ```shell
   kubectl logs -n erp-system -l app=prometheus
   ```

3. Stellen Sie sicher, dass die PersistentVolumeClaim gebunden ist:
   ```shell
   kubectl get pvc -n erp-system prometheus-storage
   ```

### Jaeger zeigt keine Traces an

1. Überprüfen Sie, ob der Jaeger-Operator läuft:
   ```shell
   kubectl get pods -n erp-system -l app=jaeger-operator
   ```

2. Validieren Sie die Jaeger-Ressource:
   ```shell
   kubectl describe jaeger -n erp-system erp-jaeger
   ```

3. Stellen Sie sicher, dass die Elasticsearch-Verbindung funktioniert:
   ```shell
   kubectl logs -n erp-system -l app=jaeger-operator
   ```

### ELK-Stack-Probleme

1. Überprüfen Sie den Status von Elasticsearch:
   ```shell
   kubectl get pods -n erp-system -l app=elasticsearch
   ```

2. Validieren Sie die Logstash-Pipeline:
   ```shell
   kubectl logs -n erp-system -l app=logstash
   ```

3. Testen Sie die Filebeat-Konfiguration:
   ```shell
   kubectl logs -n erp-system -l app=filebeat
   ```

## Referenzen

- [Prometheus-Dokumentation](https://prometheus.io/docs/)
- [Grafana-Dokumentation](https://grafana.com/docs/)
- [Jaeger-Dokumentation](https://www.jaegertracing.io/docs/)
- [Elasticsearch-Dokumentation](https://www.elastic.co/guide/index.html)
- [OpenTelemetry-Projekt](https://opentelemetry.io/) 