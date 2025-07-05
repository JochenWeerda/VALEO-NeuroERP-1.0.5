#!/bin/bash

# Farben für die Ausgabe
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Konfiguration
NAMESPACE="valeo-staging"
HELM_RELEASE="valeo-neuroerp-staging"
REPORT_FILE="../reports/staging_verification_log.md"

# Report-Header erstellen
cat > $REPORT_FILE << EOL
# Staging Deployment Verifizierung - VALEO-NeuroERP v1.1.0

Erstellungsdatum: $(date '+%Y-%m-%d %H:%M:%S')

## Deployment-Status

| Service | Pods Ready | Health Check | Logs | API Test |
|---------|------------|--------------|------|----------|
EOL

# Namespace erstellen
echo "Creating namespace $NAMESPACE..."
kubectl create namespace $NAMESPACE 2>/dev/null || true

# Helm-Chart deployen
echo "Deploying Helm chart..."
helm upgrade --install $HELM_RELEASE ../../helm/valeo-neuroerp \
  --namespace $NAMESPACE \
  --set global.environment=staging \
  --wait

# Services überprüfen
SERVICES=(
    "excel-export-service"
    "cache-manager"
    "api-gateway"
    "failover-monitor"
    "auth-service"
)

for SERVICE in "${SERVICES[@]}"; do
    echo -e "\n${YELLOW}Checking $SERVICE...${NC}"
    
    # Pod-Status prüfen
    READY_PODS=$(kubectl get pods -n $NAMESPACE -l app=$SERVICE -o jsonpath='{.items[*].status.containerStatuses[*].ready}' | tr ' ' '\n' | grep -c "true")
    TOTAL_PODS=$(kubectl get pods -n $NAMESPACE -l app=$SERVICE -o jsonpath='{.items[*].status.containerStatuses[*].ready}' | tr ' ' '\n' | wc -l)
    POD_STATUS="$READY_PODS/$TOTAL_PODS"
    
    # Health Check
    if kubectl exec -n $NAMESPACE -l app=$SERVICE -- curl -s http://localhost:8000/health; then
        HEALTH_STATUS="✅"
    else
        HEALTH_STATUS="❌"
    fi
    
    # Logs prüfen
    ERROR_COUNT=$(kubectl logs -n $NAMESPACE -l app=$SERVICE --tail=1000 2>/dev/null | grep -i "error" | wc -l)
    if [ $ERROR_COUNT -eq 0 ]; then
        LOG_STATUS="✅"
    else
        LOG_STATUS="⚠️ ($ERROR_COUNT errors)"
    fi
    
    # API-Test
    case $SERVICE in
        "api-gateway")
            if curl -s http://api.staging.valeo-neuroerp.com/health; then
                API_STATUS="✅"
            else
                API_STATUS="❌"
            fi
            ;;
        "auth-service")
            if curl -s http://auth.staging.valeo-neuroerp.com/health; then
                API_STATUS="✅"
            else
                API_STATUS="❌"
            fi
            ;;
        *)
            API_STATUS="N/A"
            ;;
    esac
    
    # Report aktualisieren
    echo "| $SERVICE | $POD_STATUS | $HEALTH_STATUS | $LOG_STATUS | $API_STATUS |" >> $REPORT_FILE
done

# Zusätzliche Tests
cat >> $REPORT_FILE << EOL

## Integrationstests

### Redis-Verbindung
$(if kubectl exec -n $NAMESPACE deploy/redis-master -- redis-cli ping | grep -q "PONG"; then echo "✅"; else echo "❌"; fi) Redis-Verbindung aktiv

### PostgreSQL-Replikation
$(if kubectl exec -n $NAMESPACE deploy/postgresql-primary -- pg_isready | grep -q "accepting connections"; then echo "✅"; else echo "❌"; fi) PostgreSQL Primary aktiv
$(if kubectl exec -n $NAMESPACE deploy/postgresql-replica -- pg_isready | grep -q "accepting connections"; then echo "✅"; else echo "❌"; fi) PostgreSQL Replica aktiv

### Monitoring-Stack
- Prometheus: $(if kubectl get pods -n $NAMESPACE -l app=prometheus -o jsonpath='{.items[*].status.phase}' | grep -q "Running"; then echo "✅"; else echo "❌"; fi)
- Grafana: $(if kubectl get pods -n $NAMESPACE -l app=grafana -o jsonpath='{.items[*].status.phase}' | grep -q "Running"; then echo "✅"; else echo "❌"; fi)

## Performance-Metriken

- CPU-Auslastung: $(kubectl top pods -n $NAMESPACE --containers | awk 'NR>1 {sum+=$3} END {print sum/NR}')%
- Memory-Auslastung: $(kubectl top pods -n $NAMESPACE --containers | awk 'NR>1 {sum+=$4} END {print sum/NR}')Mi

## Empfehlungen

1. [ ] Ressourcenlimits optimieren
2. [ ] Log-Level anpassen
3. [ ] Health-Check-Endpunkte verfeinern
4. [ ] API-Gateway-Routen testen
5. [ ] Backup-Restore-Test durchführen

## Nächste Schritte

1. Performance-Tests starten
2. Security-Scan durchführen
3. Backup-Strategie validieren
4. Monitoring-Dashboards finalisieren
EOL

echo -e "\n${GREEN}Report generated: $REPORT_FILE${NC}" 