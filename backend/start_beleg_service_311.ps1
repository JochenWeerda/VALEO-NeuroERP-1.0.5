# PowerShell-Skript zum Starten des Beleg-Services
# ------------------------------------------------------

# Aktiviere Python 3.11 Umgebung
Write-Host "Aktiviere Python 3.11 Umgebung..." -ForegroundColor Green
& ".\.venv311\Scripts\Activate.ps1"

# Starte Beleg-Service
Write-Host "Starte Beleg-Service..." -ForegroundColor Green

# Prüfen, ob Python-Umgebung aktiv ist
if ($env:VIRTUAL_ENV -eq $null) {
    Write-Host "WARNUNG: Python-Umgebung konnte nicht aktiviert werden. Versuche dennoch zu starten..." -ForegroundColor Yellow
}

# Umgebungsvariablen setzen
$env:OBSERVER_SERVICE_URL = "http://localhost:8010/register"
$env:PORT = "8006"
$env:SERVICE_VERSION = "0.1.0"
$env:LOG_LEVEL = "info"

# Wechsle ins Backend-Verzeichnis
Set-Location -Path "backend"

Write-Host "Beleg-Service wird gestartet..." -ForegroundColor Cyan
Write-Host "Server läuft auf http://localhost:8006" -ForegroundColor Green
Write-Host "API-Dokumentation verfügbar unter: http://localhost:8006/docs" -ForegroundColor Green

# Starte den Server
try {
    python services\document_service.py --port 8006 --host 0.0.0.0
} catch {
    Write-Host "Fehler beim Starten des Beleg-Services: $_" -ForegroundColor Red
}

# Zurück zum ursprünglichen Verzeichnis
Set-Location -Path ".."

# Warte auf Benutzereingabe, bevor das Fenster geschlossen wird
Write-Host "Drücke eine beliebige Taste, um das Fenster zu schließen..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
