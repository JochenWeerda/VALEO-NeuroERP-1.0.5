#!/bin/bash

# Farben für die Ausgabe
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "Starting VALEO-NeuroERP v1.1 INTEGRATION-MULTI Phase Deployment..."

# Namespace erstellen
kubectl create namespace valeo-neuroerp

# Helm Repositories hinzufügen
echo "Adding Helm repositories..."
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Secrets erstellen
echo "Creating secrets..."
kubectl create secret generic auth-secrets \
  --namespace valeo-neuroerp \
  --from-literal=jwt-secret=$(openssl rand -base64 32)

# ConfigMaps anwenden
echo "Applying ConfigMaps..."
kubectl apply -f ../config/configmap.yaml

# Services einzeln deployen
echo "Deploying individual services..."
services=("excel-export-service" "cache-manager" "api-gateway" "failover-monitor" "auth-service")

for service in "${services[@]}"
do
  echo "Deploying $service..."
  kubectl apply -f ../$service/deployment.yaml
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ $service deployed successfully${NC}"
  else
    echo -e "${RED}✗ Failed to deploy $service${NC}"
    exit 1
  fi
done

# Helm Chart installieren
echo "Installing Helm Chart..."
helm install valeo-neuroerp ../helm/valeo-neuroerp \
  --namespace valeo-neuroerp \
  --create-namespace \
  --wait

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Helm Chart installed successfully${NC}"
else
  echo -e "${RED}✗ Failed to install Helm Chart${NC}"
  exit 1
fi

# Überprüfen der Deployments
echo "Checking deployment status..."
kubectl get pods -n valeo-neuroerp

# Monitoring-Stack überprüfen
echo "Checking monitoring stack..."
kubectl get pods -n valeo-neuroerp -l app=prometheus
kubectl get pods -n valeo-neuroerp -l app=grafana

echo -e "${GREEN}INTEGRATION-MULTI Phase deployment completed successfully!${NC}"
echo "Please check the following URLs:"
echo "- API Gateway: https://api.valeo-neuroerp.com"
echo "- Grafana: http://grafana.valeo-neuroerp.com"
echo "- Prometheus: http://prometheus.valeo-neuroerp.com" 