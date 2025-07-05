# APM Multi-Agenten-System Deployment

Diese Dokumentation beschreibt das Deployment des APM Multi-Agenten-Systems in Kubernetes.

## Voraussetzungen

- Kubernetes-Cluster (Version 1.20+)
- kubectl CLI-Tool
- MongoDB-Installation
- Prometheus Operator (für Monitoring)

## Schnellstart

1. **Deployment ausführen:**
   ```powershell
   ./scripts/deploy-apm-system.ps1 -Namespace valeo-neuroerp
   ```

2. **Status überprüfen:**
   ```bash
   kubectl get all -n valeo-neuroerp -l app=apm-multi-agent
   ```

## Komponenten

Das Deployment besteht aus folgenden Kubernetes-Ressourcen:

- `deployment.yaml`: Hauptdeployment des APM-Controllers
- `service.yaml`: Service für die API-Endpunkte
- `pdb.yaml`: PodDisruptionBudget für Hochverfügbarkeit
- `servicemonitor.yaml`: Prometheus ServiceMonitor
- `prometheus-rules.yaml`: Alert-Regeln

## Konfiguration

### MongoDB-Credentials

Die MongoDB-Verbindung wird über ein Kubernetes-Secret konfiguriert:

```bash
kubectl create secret generic mongodb-credentials \
  --from-literal=uri='mongodb://username:password@host:port/db' \
  -n valeo-neuroerp
```

### Resource Limits

Die Standard-Ressourcenlimits sind:
- Memory: 512Mi
- CPU: 500m

Diese können in `deployment.yaml` angepasst werden.

## Monitoring

Das System exportiert Prometheus-Metriken unter:
- Endpoint: `/metrics`
- Port: 8080

### Wichtige Metriken

- `apm_agent_tasks_total`: Anzahl verarbeiteter Tasks
- `apm_agent_processing_seconds`: Task-Verarbeitungszeit
- `mongodb_connection_errors_total`: MongoDB-Verbindungsfehler

## Troubleshooting

### Häufige Probleme

1. **Pod startet nicht:**
   ```bash
   kubectl describe pod -n valeo-neuroerp -l app=apm-multi-agent
   ```

2. **MongoDB-Verbindungsprobleme:**
   ```bash
   kubectl logs -n valeo-neuroerp deployment/apm-multi-agent
   ```

3. **Metriken nicht verfügbar:**
   ```bash
   kubectl get servicemonitor -n valeo-neuroerp
   ```

## Wartung

### Backup

Memory Bank und MongoDB-Daten sollten regelmäßig gesichert werden:

```bash
# Memory Bank Backup
kubectl exec -n valeo-neuroerp deployment/apm-multi-agent -- tar czf /tmp/memory-bank-backup.tar.gz /app/memory-bank

# MongoDB Backup
mongodump --uri="$(kubectl get secret -n valeo-neuroerp mongodb-credentials -o jsonpath='{.data.uri}' | base64 -d)"
```

### Updates

Updates sollten über das Deployment-Skript durchgeführt werden:

```powershell
./scripts/deploy-apm-system.ps1 -Namespace valeo-neuroerp -SkipConfirmation
```

## Support

Bei Problemen oder Fragen:
1. Überprüfen Sie die Logs: `kubectl logs -n valeo-neuroerp deployment/apm-multi-agent`
2. Konsultieren Sie die [Hauptdokumentation](../docs/apm_framework/multi_agent_system.md)
3. Öffnen Sie ein Issue im [GitHub Repository](https://github.com/valeo-neuroerp/apm-system) 