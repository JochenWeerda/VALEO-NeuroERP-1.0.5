# Start APM System Script
Write-Host "Starting VALEO-NeuroERP APM System..." -ForegroundColor Green

# Aktiviere die Python-Umgebung
$env:PYTHONPATH = "."
$env:PYTHONUNBUFFERED = "1"

# Starte MongoDB (falls nicht bereits läuft)
Write-Host "Starting MongoDB..." -ForegroundColor Yellow
Start-Process "mongod" -ArgumentList "--dbpath", "data/db"

# Warte kurz auf MongoDB-Start
Start-Sleep -Seconds 5

# Starte das APM-System
Write-Host "Initializing APM System..." -ForegroundColor Yellow
python linkup_mcp/startup_controller.py

# Fehlerbehandlung
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error starting APM System. Check logs for details." -ForegroundColor Red
    exit 1
}

Write-Host "APM System successfully started." -ForegroundColor Green 