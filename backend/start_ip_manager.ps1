# Start-Skript für den IP-Manager-Service

# Prüfen, ob Python-Umgebung vorhanden ist
if (Test-Path ".venv311") {
    Write-Host "Aktiviere Python 3.11 Umgebung..." -ForegroundColor Green
    & .\.venv311\Scripts\Activate.ps1
} else {
    Write-Host "Python 3.11 Umgebung nicht gefunden. Bitte erstellen Sie diese zuerst." -ForegroundColor Red
    Write-Host "Beispiel: python -m venv .venv311" -ForegroundColor Yellow
    exit 1
}

# IP-Manager-Port setzen
$env:IP_MANAGER_PORT = "8020"
$env:IP_MANAGER_HOST = "0.0.0.0"

# Zum Backend-Verzeichnis wechseln
Set-Location -Path "backend"

# Prüfen, ob die erforderlichen Dateien vorhanden sind
if (-not (Test-Path "ip_manager.py")) {
    Write-Host "Fehler: ip_manager.py nicht gefunden!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "ip_manager_api.py")) {
    Write-Host "Fehler: ip_manager_api.py nicht gefunden!" -ForegroundColor Red
    exit 1
}

# IP-Manager-Service starten
Write-Host "Starte IP-Manager-Service auf Port $env:IP_MANAGER_PORT..." -ForegroundColor Green
try {
    python ip_manager_api.py
}
catch {
    Write-Host "Fehler beim Starten des IP-Manager-Service: $_" -ForegroundColor Red
    exit 1
}
finally {
    # Zurück zum ursprünglichen Verzeichnis
    Set-Location -Path ".."
    
    # Deaktiviere Python-Umgebung, wenn sie aktiviert wurde
    if ($env:VIRTUAL_ENV) {
        deactivate
    }
} 