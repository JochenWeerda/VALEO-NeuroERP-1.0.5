# PowerShell-Skript zum Starten des Finance-Microservice
# ------------------------------------------------------

# Aktiviere Python 3.11 Umgebung
Write-Host "Aktiviere Python 3.11 Umgebung..." -ForegroundColor Green
& ".\.venv311\Scripts\Activate.ps1"

# Starte Finance-Microservice
Write-Host "Starte Finance-Microservice..." -ForegroundColor Green

# Prüfen, ob Python-Umgebung aktiv ist
if ($env:VIRTUAL_ENV -eq $null) {
    Write-Host "WARNUNG: Python-Umgebung konnte nicht aktiviert werden. Versuche dennoch zu starten..." -ForegroundColor Yellow
}

# Umgebungsvariablen setzen
$env:OBSERVER_SERVICE_URL = "http://localhost:8010/register"
$env:PORT = "8007"
$env:SERVICE_VERSION = "0.2.0"
$env:LOG_LEVEL = "info"

# Wechsle ins Finance-Microservice-Verzeichnis
Set-Location -Path "finance-microservice"

Write-Host "Finanzmodul-Server wird gestartet..." -ForegroundColor Cyan
Write-Host "Server läuft auf http://localhost:8007" -ForegroundColor Green
Write-Host "Endpunkte verfügbar unter: http://localhost:8007/api/v1/finanzen/..." -ForegroundColor Green

# Starte den Server
try {
    python src/main.py
} catch {
    Write-Host "Fehler beim Starten des Finance-Microservice: $_" -ForegroundColor Red
}

# Zurück zum ursprünglichen Verzeichnis
Set-Location -Path ".."

# Warte auf Benutzereingabe, bevor das Fenster geschlossen wird
Write-Host "Drücke eine beliebige Taste, um das Fenster zu schließen..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 