# Startskript für Python 3.11
# Aktiviere die virtuelle Umgebung
$ErrorActionPreference = "Stop"

Write-Host "Aktiviere Python 3.11 Umgebung..."
if (Test-Path ".\.venv311\Scripts\Activate.ps1") {
    .\.venv311\Scripts\Activate.ps1
} else {
    Write-Host "Python 3.11 Umgebung nicht gefunden. Versuche, Python 3.11 direkt zu verwenden."
}

Write-Host "Starte Minimalen Server..."
Write-Host "Minimaler Server wird gestartet..."
try {
    # Entferne das --log-level-Argument, da es nicht unterstützt wird
    python backend/minimal_server.py --port 8005 --host 0.0.0.0
} catch {
    Write-Host "Fehler beim Starten des minimalen Servers: $_"
} 