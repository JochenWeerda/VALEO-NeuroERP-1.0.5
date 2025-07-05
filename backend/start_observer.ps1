# PowerShell-Skript zum Starten des Observer-Service
# ------------------------------------------------------

# Aktiviere Python 3.11 Umgebung
Write-Host "Aktiviere Python 3.11 Umgebung..." -ForegroundColor Green
& ".\.venv311\Scripts\Activate.ps1"

# Starte Observer-Service
Write-Host "Starte Observer-Service..." -ForegroundColor Green

# Prüfen, ob Python-Umgebung aktiv ist
if ($env:VIRTUAL_ENV -eq $null) {
    Write-Host "WARNUNG: Python-Umgebung konnte nicht aktiviert werden. Versuche dennoch zu starten..." -ForegroundColor Yellow
}

# Installiere benötigte Pakete, falls nicht vorhanden
Write-Host "Überprüfe Abhängigkeiten..." -ForegroundColor Green
pip install -q -r backend\observer_requirements.txt

# Wechsle ins Backend-Verzeichnis
Set-Location -Path "backend"

# Starte den Observer
Write-Host "Starte Observer mit korrigierter Konfiguration..." -ForegroundColor Green
try {
    # Versuche zuerst den korrigierten Observer zu starten
    python start_observer_311_fixed.py
} catch {
    Write-Host "Fehler beim Starten des korrigierten Observers: $_" -ForegroundColor Yellow
    Write-Host "Versuche Standard-Observer..." -ForegroundColor Yellow
    try {
        python start_observer_simple.py
    } catch {
        Write-Host "Fehler beim Starten des Standard-Observers: $_" -ForegroundColor Red
    }
}

# Zurück zum ursprünglichen Verzeichnis
Set-Location -Path ".."

# Warte auf Benutzereingabe, bevor das Fenster geschlossen wird
Write-Host "Drücke eine beliebige Taste, um das Fenster zu schließen..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 