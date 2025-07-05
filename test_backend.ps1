# Einfaches Testskript zum direkten Starten des Backends
Write-Host "=== Backend-Test-Skript ===" -ForegroundColor Cyan
Write-Host "Aktuelles Verzeichnis: $(Get-Location)" -ForegroundColor Cyan

Write-Host "Wechsle ins Backend-Verzeichnis..." -ForegroundColor Cyan
Set-Location -Path ".\backend"
Write-Host "Neues Verzeichnis: $(Get-Location)" -ForegroundColor Cyan

# Setze PYTHONPATH
$env:PYTHONPATH = (Get-Location).Path
Write-Host "PYTHONPATH gesetzt auf: $env:PYTHONPATH" -ForegroundColor Cyan

# Überprüfe, ob die main.py existiert
if (-not (Test-Path "main.py")) {
    Write-Host "FEHLER: main.py nicht gefunden!" -ForegroundColor Red
    exit 1
} else {
    Write-Host "main.py gefunden." -ForegroundColor Green
}

# Starte das Backend direkt
Write-Host "Starte Backend-Server direkt..." -ForegroundColor Cyan
try {
    python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
} catch {
    Write-Host "FEHLER beim Starten des Servers: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} 