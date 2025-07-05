# Finance-Microservice Startskript für Python 3.11
# Aktiviere die virtuelle Umgebung
$ErrorActionPreference = "Stop"

Write-Host "Aktiviere Python 3.11 Umgebung..." -ForegroundColor Cyan
if (Test-Path ".venv311\Scripts\activate.ps1") {
    & .\.venv311\Scripts\activate.ps1
} else {
    Write-Host "Fehler: Virtuelle Umgebung nicht gefunden!" -ForegroundColor Red
    exit 1
}

Write-Host "Starte Finance-Microservice..." -ForegroundColor Green
python backend\simple_finance_server.py --port 8007 