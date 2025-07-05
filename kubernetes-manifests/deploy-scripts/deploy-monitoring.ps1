# PowerShell-Skript zum Bereitstellen des Monitoring-Stacks in Kubernetes
# deploy-monitoring.ps1

# Funktion zum Überprüfen des Namespace
function Ensure-Namespace {
    param (
        [string] $Namespace
    )
    
    Write-Host "Überprüfe, ob Namespace $Namespace existiert..."
    $namespaceExists = kubectl get namespace $Namespace 2>$null
    
    if (-not $namespaceExists) {
        Write-Host "Namespace $Namespace existiert nicht. Erstelle Namespace..."
        kubectl create namespace $Namespace
    } else {
        Write-Host "Namespace $Namespace existiert bereits."
    }
}

# Funktion zum Anwenden von Manifesten
function Apply-Manifest {
    param (
        [string] $ManifestPath,
        [string] $Description
    )
    
    Write-Host "`nAnwenden von $Description..."
    kubectl apply -f $ManifestPath
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Fehler beim Anwenden von $ManifestPath. Breche ab." -ForegroundColor Red
        exit 1
    } else {
        Write-Host "$Description erfolgreich angewendet." -ForegroundColor Green
    }
}

# Setze Variablen
$NAMESPACE = "erp-system"
$MANIFEST_DIR = "$PSScriptRoot/.."

# Überprüfe Namespace
Ensure-Namespace -Namespace $NAMESPACE

# Anwenden der Monitoring-Komponenten
Write-Host "`n===== Bereitstellung des Monitoring-Stacks beginnt =====" -ForegroundColor Cyan

# 1. Prometheus-Konfiguration
Apply-Manifest -ManifestPath "$MANIFEST_DIR/prometheus-config.yaml" -Description "Prometheus-Konfiguration"

# 2. Prometheus-Deployment
Apply-Manifest -ManifestPath "$MANIFEST_DIR/prometheus-deployment.yaml" -Description "Prometheus-Deployment"

# 3. Alertmanager-Deployment
Apply-Manifest -ManifestPath "$MANIFEST_DIR/alertmanager-deployment.yaml" -Description "Alertmanager-Deployment"

# 4. Grafana-Deployment
Apply-Manifest -ManifestPath "$MANIFEST_DIR/grafana-deployment.yaml" -Description "Grafana-Deployment"

# 5. Monitoring-Ingress
Apply-Manifest -ManifestPath "$MANIFEST_DIR/monitoring-ingress.yaml" -Description "Monitoring-Ingress"

# 6. Document-Service-Metrics-Konfiguration
Apply-Manifest -ManifestPath "$MANIFEST_DIR/document-service-metrics.yaml" -Description "Document-Service-Metrics-Konfiguration"

# 7. Document-Service-Patch anwenden
Apply-Manifest -ManifestPath "$MANIFEST_DIR/document-service-patch.yaml" -Description "Document-Service-Patch"

# 8. Frontend-Patch anwenden
Apply-Manifest -ManifestPath "$MANIFEST_DIR/frontend.yaml" -Description "Frontend mit Metriken"

# Warten auf die Bereitstellung
Write-Host "`nWarte auf die Bereitstellung der Monitoring-Komponenten..." -ForegroundColor Yellow

Start-Sleep -Seconds 5

# Prüfen Sie den Status der Deployments
Write-Host "`nÜberprüfe den Status der Monitoring-Deployments:" -ForegroundColor Cyan

$deployments = @("prometheus", "alertmanager", "grafana")
foreach ($deployment in $deployments) {
    $status = kubectl -n $NAMESPACE get deployment $deployment -o jsonpath="{.status.readyReplicas}/{.status.replicas}"
    if ($status -eq "1/1") {
        Write-Host "$deployment`: $status bereit" -ForegroundColor Green
    } else {
        Write-Host "$deployment`: $status bereit" -ForegroundColor Yellow
    }
}

Write-Host "`n===== Bereitstellung des Monitoring-Stacks abgeschlossen =====" -ForegroundColor Cyan
Write-Host "Grafana ist verfügbar unter: https://monitoring.erp.example.com/grafana"
Write-Host "Prometheus ist verfügbar unter: https://monitoring.erp.example.com/prometheus"
Write-Host "Alertmanager ist verfügbar unter: https://monitoring.erp.example.com/alertmanager"
Write-Host "Zugangsdaten: admin / admin (bei erster Anmeldung bitte Passwort ändern)" 