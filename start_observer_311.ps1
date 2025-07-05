# Observer-Service Startskript für Python 3.11
# Aktiviere die virtuelle Umgebung
$ErrorActionPreference = "Stop"

Write-Host "Aktiviere Python 3.11 Umgebung..."
if (Test-Path ".\.venv311\Scripts\Activate.ps1") {
    .\.venv311\Scripts\Activate.ps1
} else {
    Write-Host "Python 3.11 Umgebung nicht gefunden. Versuche, Python 3.11 direkt zu verwenden."
}

Write-Host "Starte Observer-Service..."
try {
    # Verwende die korrigierte Observer-Datei, die in backend/start_observer_311_fixed.py verfügbar ist
    python backend/start_observer_311_fixed.py
} catch {
    Write-Host "Fehler beim Starten des Observer-Service: $_"
    Write-Host "Versuche alternative Observer-Datei..."
    try {
        python backend/start_observer_simple.py
    } catch {
        Write-Host "Auch die alternative Observer-Datei konnte nicht gestartet werden: $_"
    }
} 