#!/bin/bash

# Kubernetes-Deployment-Skript für das ERP-System

echo -e "\e[32mDeploying ERP System to Kubernetes...\e[0m"

# Namensraum erstellen, falls nicht vorhanden
kubectl create namespace erp-system --dry-run=client -o yaml | kubectl apply -f -

# Persistente Volumes einrichten
echo -e "\e[36mSetting up persistent volumes...\e[0m"
kubectl apply -f database-pv.yaml -n erp-system

# Datenbank-Deployment
echo -e "\e[36mDeploying database...\e[0m"
kubectl apply -f database-deployment.yaml -n erp-system
kubectl apply -f database-service.yaml -n erp-system

# Warten, bis die Datenbank bereit ist
echo -e "\e[33mWaiting for database to be ready...\e[0m"
kubectl wait --for=condition=available --timeout=300s deployment/erp-db -n erp-system

# Backend-Deployment
echo -e "\e[36mDeploying backend services...\e[0m"
kubectl apply -f backend-deployment.yaml -n erp-system
kubectl apply -f backend-service.yaml -n erp-system

# Ingress einrichten
echo -e "\e[36mSetting up ingress...\e[0m"
kubectl apply -f ingress.yaml -n erp-system

echo -e "\e[32mDeployment complete! The ERP system should be available shortly.\e[0m"
echo -e "\e[32mYou can access the API at: http://localhost/api\e[0m"

# Status anzeigen
echo -e "\e[36mCurrent deployment status:\e[0m"
kubectl get all -n erp-system 