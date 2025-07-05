# VALEO-NeuroERP Kubernetes Operator

## Übersicht

Der VALEO-NeuroERP Kubernetes Operator ist ein spezialisierter Controller, der die Verwaltung und Orchestrierung von VALEO-NeuroERP-Komponenten in Kubernetes-Clustern automatisiert. Er wurde im Rahmen des GENXAIS-Zyklus v1.8 entwickelt, um die Kubernetes-Integration des ERP-Systems zu verbessern.

## Funktionen

- **Automatisierte Bereitstellung**: Vereinfachte Bereitstellung von VALEO-NeuroERP-Komponenten
- **Lifecycle-Management**: Automatisierte Updates, Skalierung und Wiederherstellung
- **Konfigurationsmanagement**: Zentrale Verwaltung von Konfigurationen über Custom Resources
- **Status-Überwachung**: Echtzeit-Überwachung und Statusberichte aller Komponenten
- **Integrierte Sicherheit**: Automatisierte Verwaltung von Secrets und RBAC-Konfigurationen
- **Service Mesh Integration**: Nahtlose Integration mit Istio/Linkerd

## Architektur

Der Operator folgt dem Kubernetes Operator Pattern und besteht aus:

1. **Custom Resource Definitions (CRDs)**:
   - `ValeoERP`: Hauptressource für die ERP-Instanz
   - `ValeoComponent`: Definition einzelner Komponenten
   - `ValeoBackup`: Konfiguration für Backups
   - `ValeoMonitoring`: Monitoring-Einstellungen

2. **Controller**:
   - Überwacht die Custom Resources
   - Führt Reconciliation-Loops aus
   - Stellt den gewünschten Zustand sicher

3. **Webhooks**:
   - Validierung neuer CR-Instanzen
   - Mutation für Standardwerte
   - Konvertierung zwischen API-Versionen

## Installation

```bash
# Operator CRDs installieren
kubectl apply -f https://raw.githubusercontent.com/valeo-neuroerp/operator/v1.8/deploy/crds/

# Operator installieren
kubectl apply -f https://raw.githubusercontent.com/valeo-neuroerp/operator/v1.8/deploy/operator.yaml

# Status prüfen
kubectl get pods -n valeo-system
```

## Verwendung

### ERP-Instanz erstellen

```yaml
apiVersion: erp.valeo.ai/v1
kind: ValeoERP
metadata:
  name: production-erp
spec:
  version: "1.8"
  replicas: 3
  components:
    - name: backend
      version: "1.8"
      replicas: 5
      resources:
        limits:
          cpu: "2"
          memory: "4Gi"
    - name: frontend
      version: "1.8"
      replicas: 3
  monitoring:
    enabled: true
    prometheus: true
    grafana: true
  backup:
    schedule: "0 2 * * *"
    retention: 7
```

### Status prüfen

```bash
kubectl get valeoerp
kubectl describe valeoerp production-erp
```

## Entwicklung

Der Operator wurde mit dem Operator SDK entwickelt. Der Quellcode ist in Go geschrieben und folgt den Best Practices für Kubernetes-Operatoren.

### Voraussetzungen für die Entwicklung

- Go 1.18+
- Operator SDK v1.25+
- kubectl 1.24+
- Zugriff auf einen Kubernetes-Cluster (v1.23+)

### Build und Test

```bash
# Repository klonen
git clone https://github.com/valeo-neuroerp/operator.git
cd operator

# Dependencies installieren
go mod tidy

# Controller bauen
make build

# Tests ausführen
make test

# Operator lokal ausführen
make run
```

## Integration mit anderen GENXAIS v1.8 Komponenten

Der Operator ist eng mit anderen Komponenten des GENXAIS-Zyklus v1.8 integriert:

- **KI-gestützte Anomalieerkennung**: Automatische Skalierung basierend auf ML-Prognosen
- **GraphQL API & Caching**: Verwaltung der API-Gateway und Caching-Infrastruktur
- **Edge Computing**: Orchestrierung der Edge-Knoten und deren Synchronisation
- **Warenwirtschaftsmodul**: Automatisierte Bereitstellung der Warenwirtschaftskomponenten

## Roadmap

- **v1.8.1**: Erweiterte Metriken und Dashboards
- **v1.8.2**: Multi-Cluster-Unterstützung
- **v1.9.0**: Integration mit GitOps-Workflows
- **v1.9.0**: Erweitertes Anomalieerkennungssystem

## Beitragende

- GENXAIS-Team
- Kubernetes-Integrationsteam
- APM-Framework-Entwickler

## Lizenz

Copyright (c) 2025 VALEO-NeuroERP 