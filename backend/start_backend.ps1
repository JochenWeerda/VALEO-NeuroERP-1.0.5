# PowerShell-Startskript für das Backend

# Funktion zum Anzeigen von Meldungen
function Show-Message {
    param (
        [string]$Message,
        [string]$Type = "INFO"  # INFO, WARNING, ERROR, SUCCESS
    )
    
    $color = switch ($Type) {
        "INFO" { "White" }
        "WARNING" { "Yellow" }
        "ERROR" { "Red" }
        "SUCCESS" { "Green" }
        default { "White" }
    }
    
    Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] [$Type] $Message" -ForegroundColor $color
}

# Überprüfe, ob psutil installiert ist (wird für Systemstatistiken benötigt)
Show-Message "Überprüfe Abhängigkeiten..." "INFO"
try {
    $psutilInstalled = python -c "import psutil; print('OK')" 2>$null
    if ($psutilInstalled -ne "OK") {
        Show-Message "Installiere psutil..." "INFO"
        pip install psutil
        if ($LASTEXITCODE -ne 0) {
            Show-Message "WARNUNG: psutil konnte nicht installiert werden. Systemstatistiken werden nicht verfügbar sein." "WARNING"
        } else {
            Show-Message "psutil erfolgreich installiert." "SUCCESS"
        }
    } else {
        Show-Message "psutil ist bereits installiert." "SUCCESS"
    }
} catch {
    Show-Message "WARNUNG: Abhängigkeiten konnten nicht überprüft werden. Fahre trotzdem fort." "WARNING"
}

# 1. Virtuelle Umgebung aktivieren (falls vorhanden)
$venvPath = ".\.venv\Scripts\Activate.ps1"
if (Test-Path $venvPath) {
    try {
        . $venvPath
        Show-Message "Virtuelle Umgebung aktiviert." "SUCCESS"
    } catch {
        $errorMessage = $_.Exception.Message
        Show-Message "Fehler beim Aktivieren der virtuellen Umgebung: $errorMessage" "WARNING"
    }
} else {
    Show-Message "Hinweis: Virtuelle Umgebung nicht gefunden unter $venvPath. Fahre mit Systeminstallation fort." "INFO"
}

# 2. Setze den PYTHONPATH auf das aktuelle Verzeichnis und alle relevanten Pfade
$currentPath = (Get-Location).Path
$env:PYTHONPATH = "$currentPath;$currentPath\..;$currentPath\..\..;$currentPath\app"
Show-Message "PYTHONPATH gesetzt auf: $env:PYTHONPATH" "INFO"

# 3. Überprüfe, ob die Datenbank existiert
$dbPath = "erp.db"
if (-not (Test-Path $dbPath)) {
    Show-Message "Datenbank $dbPath nicht gefunden. Erstelle neue Datenbank." "INFO"
}

# 4. Migrationen generieren und anwenden (falls alembic installiert ist)
try {
    # Überprüfe, ob alembic verfügbar ist
    $alembicVersion = alembic --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Show-Message "Alembic gefunden: $alembicVersion" "INFO"
        Show-Message "Generiere Datenbank-Migrationen..." "INFO"
        
        # Erstelle einen eindeutigen Namen für die Migration
        $migrationName = "migration_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        
        # Führe Migrationen aus
        alembic revision --autogenerate -m $migrationName
        if ($LASTEXITCODE -eq 0) {
            Show-Message "Migrationen erfolgreich generiert." "SUCCESS"
            
            alembic upgrade head
            if ($LASTEXITCODE -eq 0) {
                Show-Message "Datenbank erfolgreich aktualisiert." "SUCCESS"
            } else {
                Show-Message "Fehler beim Anwenden der Migrationen. Tabellen werden beim Start erstellt." "WARNING"
            }
        } else {
            Show-Message "Fehler beim Generieren der Migrationen. Tabellen werden beim Start erstellt." "WARNING"
        }
    } else {
        Show-Message "Alembic nicht gefunden. Tabellen werden beim Start erstellt." "INFO"
    }
} catch {
    $errorMessage = $_.Exception.Message
    Show-Message "Fehler bei der Datenbankmigration: $errorMessage" "ERROR"
    Show-Message "Tabellen werden stattdessen beim Start erstellt." "INFO"
}

# 5. Installiere alle erforderlichen Abhängigkeiten
try {
    Show-Message "Überprüfe alle erforderlichen Abhängigkeiten..." "INFO"
    pip install -r requirements.txt
    if ($LASTEXITCODE -eq 0) {
        Show-Message "Alle Abhängigkeiten sind installiert." "SUCCESS"
    } else {
        Show-Message "Warnung: Einige Abhängigkeiten konnten nicht installiert werden." "WARNING"
    }
} catch {
    $errorMessage = $_.Exception.Message
    Show-Message "Fehler beim Installieren der Abhängigkeiten: $errorMessage" "WARNING"
}

# 6. Überprüfe Netzwerkports
try {
    $portInUse = $false
    $port = 8000
    
    # Überprüfe, ob der Port bereits verwendet wird
    $connections = netstat -ano | findstr ":$port "
    if ($connections) {
        $portInUse = $true
        Show-Message "WARNUNG: Port ${port} wird bereits verwendet! Der Server könnte Probleme beim Starten haben." "WARNING"
        Show-Message "Aktuelle Verbindungen auf Port ${port}:" "INFO"
        Write-Host $connections
    } else {
        Show-Message "Port ${port} ist frei und kann verwendet werden." "SUCCESS"
    }
} catch {
    $errorMessage = $_.Exception.Message
    Show-Message "Fehler beim Überprüfen der Netzwerkports: $errorMessage" "WARNING"
}

# 7. Teste, ob FastAPI-Module gefunden werden
Show-Message "Teste Python-Importpfade..." "INFO"
try {
    $testImport = python -c "try:
    from app.core.config import settings
    print('IMPORT_OK: app.core.config')
except ImportError:
    try:
        from core.config import settings
        print('IMPORT_OK: core.config')
    except ImportError:
        print('IMPORT_FAIL: Kann weder app.core.config noch core.config importieren')
" 2>&1

    if ($testImport -match "IMPORT_OK") {
        Show-Message $testImport "SUCCESS"
    } else {
        Show-Message $testImport "WARNING"
        Show-Message "Versuche Import-Fallback zu nutzen..." "INFO"
    }
} catch {
    Show-Message "WARNUNG: Import-Test fehlgeschlagen: $($_.Exception.Message)" "WARNING"
}

# 8. FastAPI-Server starten
Show-Message "Starte FastAPI-Server..." "INFO"
Show-Message "Server wird unter http://localhost:8000 verfügbar sein" "INFO"
Show-Message "API-Dokumentation: http://localhost:8000/docs" "INFO"
Show-Message "Drücken Sie STRG+C, um den Server zu beenden." "INFO"

try {
    # Direkter Start des Backend-Servers ohne den Modulpfad
    python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
} catch {
    $errorMessage = $_.Exception.Message
    Show-Message "Fehler beim Starten des Servers: $errorMessage" "ERROR"
    
    # Zeige spezifischere Fehlerinformationen an
    if ($errorMessage -match "Address already in use") {
        Show-Message "Der Port 8000 wird bereits verwendet. Beenden Sie andere Anwendungen, die diesen Port verwenden, oder ändern Sie den Port." "ERROR"
    } elseif ($errorMessage -match "ModuleNotFoundError") {
        Show-Message "Python-Modul nicht gefunden. Stellen Sie sicher, dass alle Abhängigkeiten installiert sind mit 'pip install -r requirements.txt'" "ERROR"
        Show-Message "PYTHONPATH ist: $env:PYTHONPATH" "ERROR"
    } elseif ($errorMessage -match "ImportError") {
        Show-Message "Fehler beim Importieren von Modulen. Überprüfen Sie die Pfadstruktur und PYTHONPATH-Einstellungen." "ERROR"
        Show-Message "PYTHONPATH ist: $env:PYTHONPATH" "ERROR"
    }
    
    # Gib dem Benutzer Zeit, die Fehlermeldung zu lesen
    Start-Sleep -Seconds 10
    exit 1
} 