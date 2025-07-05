# Setup-Skript für Kubernetes-Deployment

Write-Host "Starte Setup für ERP-System in Kubernetes..." -ForegroundColor Green

# Docker-Image für das Backend bauen
Write-Host "Baue Docker-Image für das Backend..." -ForegroundColor Cyan
docker build -t erp-backend:latest -f Dockerfile.backend .

# ConfigMap und Secret erstellen
Write-Host "Erstelle ConfigMap und Secret..." -ForegroundColor Cyan
kubectl apply -f kubernetes/system-config.yaml
kubectl apply -f kubernetes/db-credentials.yaml

# Persistente Volumes einrichten
Write-Host "Richte persistente Volumes ein..." -ForegroundColor Cyan
kubectl apply -f kubernetes/database-pv.yaml

# Datenbank-Deployment
Write-Host "Starte Datenbank-Deployment..." -ForegroundColor Cyan
kubectl apply -f kubernetes/database-deployment.yaml
kubectl apply -f kubernetes/database-service.yaml

# Warten, bis die Datenbank bereit ist
Write-Host "Warte, bis die Datenbank bereit ist..." -ForegroundColor Yellow
kubectl wait --for=condition=available --timeout=300s deployment/erp-db -n erp-system

# Initializer-Job für die Systemeinrichtung
Write-Host "Führe System-Initialisierung durch..." -ForegroundColor Cyan
kubectl apply -f kubernetes/backend-init-job.yaml

# Warten, bis der Initializer-Job abgeschlossen ist
Write-Host "Warte, bis die Initialisierung abgeschlossen ist..." -ForegroundColor Yellow
$jobStatus = kubectl wait --for=condition=complete --timeout=120s job/erp-backend-init -n erp-system
if ($LASTEXITCODE -ne 0) {
    Write-Host "Initialisierung fehlgeschlagen oder Timeout. Überprüfe die Logs des Initializer-Jobs." -ForegroundColor Red
    kubectl logs job/erp-backend-init -n erp-system
    exit 1
}

# Backend-Deployment
Write-Host "Starte Backend-Deployment..." -ForegroundColor Cyan
kubectl apply -f kubernetes/backend-deployment.yaml
kubectl apply -f kubernetes/backend-service.yaml

# Ingress einrichten
Write-Host "Richte Ingress ein..." -ForegroundColor Cyan
kubectl apply -f kubernetes/ingress.yaml

# Status anzeigen
Write-Host "Deployment abgeschlossen. Status:" -ForegroundColor Green
kubectl get all -n erp-system

Write-Host "`nDas ERP-System sollte in Kürze verfügbar sein." -ForegroundColor Green
Write-Host "Zugangsdaten für Systemadministrator:" -ForegroundColor Yellow
Write-Host "Benutzername: sys" -ForegroundColor White
Write-Host "Passwort: ErpAdmin@2024!" -ForegroundColor White
Write-Host "`nAPI-Zugriff unter: http://localhost/api" -ForegroundColor Green
Write-Host "Swagger-Dokumentation unter: http://localhost/docs" -ForegroundColor Green 