# VALEO-NeuroERP-2.0: Automatisches Installations- und Setup-Skript
# ---------------------------------------------------------------
# Dieses Skript automatisiert die lokale Einrichtung (Windows, Docker Desktop, Kubernetes, WSL)
# und bereinigt auf Wunsch Altlasten (z.B. alte Dockerfiles).
#
# Ausführung: Rechtsklick > Mit PowerShell ausführen (als Admin empfohlen)

param(
    [switch]$CleanOldDockerfiles = $true
)

Write-Host "[1/10] Prüfe Systemvoraussetzungen..."
# Docker Desktop, kubectl, WSL, Node, Python prüfen
# (Installationshinweise können hier ergänzt werden)

# --- Altlasten bereinigen ---
if ($CleanOldDockerfiles) {
    Write-Host "[2/10] Bereinige alte/Beispiel-Dockerfiles..."
    $oldDockerfiles = @(
        "docker/example-multi-stage-builds/api-server-multi-stage.Dockerfile",
        "docker/example-multi-stage-builds/celery-worker-multi-stage.Dockerfile"
    )
    foreach ($file in $oldDockerfiles) {
        if (Test-Path $file) {
            Remove-Item $file -Force
            Write-Host "  Entfernt: $file"
        }
    }
}

# --- Docker-Images bauen ---
Write-Host "[3/10] Baue Backend-Image..."
docker build -f docker/api-server.Dockerfile -t neuroerp-backend:latest .
Write-Host "[4/10] Baue Frontend-Image..."
docker build -f docker/frontend-server.Dockerfile -t neuroerp-frontend:latest .

# --- Weitere Images (optional) ---
# docker build -f docker/celery/Dockerfile -t neuroerp-celery:latest .
# docker build -f docker/flower/Dockerfile -t neuroerp-flower:latest .
# docker build -f docker/prometheus/Dockerfile -t neuroerp-prometheus:latest .
# docker build -f docker/grafana/Dockerfile -t neuroerp-grafana:latest .

# --- Kubernetes Namespace anlegen ---
Write-Host "[5/10] Lege Kubernetes-Namespace an..."
kubectl create namespace erp-system --dry-run=client -o yaml | kubectl apply -f -

# --- Kubernetes-Deployments anwenden ---
Write-Host "[6/10] Deploye Kubernetes-Manifeste..."
kubectl apply -f kubernetes-manifests/ --namespace=erp-system

# --- Hosts-Datei für neuroerp.local anpassen (optional, Admin-Rechte nötig) ---
$hostsEntry = "127.0.0.1`tneuroerp.local"
$hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
if (-not (Select-String -Path $hostsPath -Pattern "neuroerp.local" -Quiet)) {
    Write-Host "[7/10] Füge neuroerp.local zur hosts-Datei hinzu..."
    Add-Content -Path $hostsPath -Value $hostsEntry
}

# --- Healthchecks & Tests ---
Write-Host "[8/10] Führe Healthchecks und Tests aus..."
kubectl get pods -n erp-system
kubectl get svc -n erp-system
kubectl get ingress -n erp-system

# --- Build, Linter, Tests (Backend) ---
Write-Host "[9/10] Backend: Build, Linter, Tests..."
cd backend
pip install -r requirements.txt
pytest
cd ..

# --- Build, Linter, Tests (Frontend) ---
Write-Host "[10/10] Frontend: Build, Linter, Tests..."
cd frontend
npm install
npm run lint
npm run test
cd ..

Write-Host "\n✅ Installation und Setup abgeschlossen!"
Write-Host "\nZugriff: http://neuroerp.local (Frontend)"
Write-Host "API:    http://localhost:8000 (Backend)"
Write-Host "\nHinweis: Für produktive Nutzung bitte Secrets und Passwörter anpassen!" 