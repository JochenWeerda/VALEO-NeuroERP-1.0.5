# Kubernetes-Deployment-Skript für das ERP-System

Write-Host "Deploying ERP System to Kubernetes..." -ForegroundColor Green

# Namensraum erstellen, falls nicht vorhanden
kubectl create namespace erp-system --dry-run=client -o yaml | kubectl apply -f -

# Persistente Volumes einrichten
Write-Host "Setting up persistent volumes..." -ForegroundColor Cyan
kubectl apply -f database-pv.yaml -n erp-system

# Datenbank-Deployment
Write-Host "Deploying database..." -ForegroundColor Cyan
kubectl apply -f database-deployment.yaml -n erp-system
kubectl apply -f database-service.yaml -n erp-system

# Warten, bis die Datenbank bereit ist
Write-Host "Waiting for database to be ready..." -ForegroundColor Yellow
kubectl wait --for=condition=available --timeout=300s deployment/erp-db -n erp-system

# Konfiguration und Secrets anwenden
Write-Host "Applying configurations and secrets..." -ForegroundColor Cyan
kubectl apply -f system-config.yaml -n erp-system
kubectl apply -f db-credentials.yaml -n erp-system

# Backend-Deployment
Write-Host "Deploying backend services..." -ForegroundColor Cyan
kubectl apply -f backend-deployment.yaml -n erp-system
kubectl apply -f backend-service.yaml -n erp-system

# Warten, bis das Backend bereit ist
Write-Host "Waiting for backend to be ready..." -ForegroundColor Yellow
kubectl wait --for=condition=available --timeout=300s deployment/api-server -n erp-system

# Zusätzliche Microservices
Write-Host "Deploying additional microservices..." -ForegroundColor Cyan

# Frontend
Write-Host "Deploying frontend..." -ForegroundColor Cyan
kubectl apply -f ../kubernetes-manifests/frontend.yaml -n erp-system

# Auth-Service
Write-Host "Deploying authentication service..." -ForegroundColor Cyan
kubectl apply -f ../kubernetes-manifests/auth-service/auth-service.yaml -n erp-system

# Reporting-Service
Write-Host "Deploying reporting service..." -ForegroundColor Cyan
kubectl apply -f ../kubernetes-manifests/reporting-service/reporting-service.yaml -n erp-system

# Document-Service
Write-Host "Deploying document service..." -ForegroundColor Cyan
kubectl apply -f ../kubernetes-manifests/document-service/document-service.yaml -n erp-system

# Notification-Service
Write-Host "Deploying notification service..." -ForegroundColor Cyan
kubectl apply -f ../kubernetes-manifests/notification-service/notification-service.yaml -n erp-system

# Network Policies anwenden
Write-Host "Applying network policies..." -ForegroundColor Cyan
kubectl apply -f ../network-policy-example.yaml -n erp-system

# Ingress einrichten
Write-Host "Setting up ingress..." -ForegroundColor Cyan
kubectl apply -f ingress.yaml -n erp-system

# Warten, bis alle Dienste bereit sind
Write-Host "Waiting for all services to be ready..." -ForegroundColor Yellow
$services = @("frontend", "auth-service", "reporting-service", "document-service", "notification-service")
foreach ($service in $services) {
    Write-Host "Waiting for $service..." -ForegroundColor Blue
    kubectl wait --for=condition=available --timeout=300s deployment/$service -n erp-system
}

Write-Host "Deployment complete! The ERP system should be available shortly." -ForegroundColor Green
Write-Host "You can access the application at: http://erp.example.com/" -ForegroundColor Green
Write-Host "API is available at: http://erp.example.com/api/" -ForegroundColor Green

# Status anzeigen
Write-Host "Current deployment status:" -ForegroundColor Cyan
kubectl get all -n erp-system 