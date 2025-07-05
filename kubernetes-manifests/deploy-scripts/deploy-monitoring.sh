#!/bin/bash
# Bash-Skript zum Bereitstellen des Monitoring-Stacks in Kubernetes
# deploy-monitoring.sh

# Funktion zum Überprüfen des Namespace
ensure_namespace() {
    local namespace=$1
    
    echo "Überprüfe, ob Namespace $namespace existiert..."
    if kubectl get namespace $namespace >/dev/null 2>&1; then
        echo "Namespace $namespace existiert bereits."
    else
        echo "Namespace $namespace existiert nicht. Erstelle Namespace..."
        kubectl create namespace $namespace
    fi
}

# Funktion zum Anwenden von Manifesten
apply_manifest() {
    local manifest_path=$1
    local description=$2
    
    echo -e "\nAnwenden von $description..."
    if kubectl apply -f $manifest_path; then
        echo -e "\e[32m$description erfolgreich angewendet.\e[0m"
    else
        echo -e "\e[31mFehler beim Anwenden von $manifest_path. Breche ab.\e[0m"
        exit 1
    fi
}

# Setze Variablen
NAMESPACE="erp-system"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MANIFEST_DIR="$SCRIPT_DIR/.."

# Überprüfe Namespace
ensure_namespace $NAMESPACE

# Anwenden der Monitoring-Komponenten
echo -e "\n===== Bereitstellung des Monitoring-Stacks beginnt ====="

# 1. Prometheus-Konfiguration
apply_manifest "$MANIFEST_DIR/prometheus-config.yaml" "Prometheus-Konfiguration"

# 2. Prometheus-Deployment
apply_manifest "$MANIFEST_DIR/prometheus-deployment.yaml" "Prometheus-Deployment"

# 3. Alertmanager-Deployment
apply_manifest "$MANIFEST_DIR/alertmanager-deployment.yaml" "Alertmanager-Deployment"

# 4. Grafana-Deployment
apply_manifest "$MANIFEST_DIR/grafana-deployment.yaml" "Grafana-Deployment"

# 5. Monitoring-Ingress
apply_manifest "$MANIFEST_DIR/monitoring-ingress.yaml" "Monitoring-Ingress"

# 6. Document-Service-Metrics-Konfiguration
apply_manifest "$MANIFEST_DIR/document-service-metrics.yaml" "Document-Service-Metrics-Konfiguration"

# 7. Document-Service-Patch anwenden
apply_manifest "$MANIFEST_DIR/document-service-patch.yaml" "Document-Service-Patch"

# 8. Frontend-Patch anwenden
apply_manifest "$MANIFEST_DIR/frontend.yaml" "Frontend mit Metriken"

# Warten auf die Bereitstellung
echo -e "\nWarte auf die Bereitstellung der Monitoring-Komponenten..."

sleep 5

# Prüfen Sie den Status der Deployments
echo -e "\nÜberprüfe den Status der Monitoring-Deployments:"

deployments=("prometheus" "alertmanager" "grafana")
for deployment in "${deployments[@]}"; do
    status=$(kubectl -n $NAMESPACE get deployment $deployment -o jsonpath="{.status.readyReplicas}/{.status.replicas}")
    if [ "$status" = "1/1" ]; then
        echo -e "\e[32m$deployment: $status bereit\e[0m"
    else
        echo -e "\e[33m$deployment: $status bereit\e[0m"
    fi
done

echo -e "\n===== Bereitstellung des Monitoring-Stacks abgeschlossen ====="
echo "Grafana ist verfügbar unter: https://monitoring.erp.example.com/grafana"
echo "Prometheus ist verfügbar unter: https://monitoring.erp.example.com/prometheus"
echo "Alertmanager ist verfügbar unter: https://monitoring.erp.example.com/alertmanager"
echo "Zugangsdaten: admin / admin (bei erster Anmeldung bitte Passwort ändern)" 