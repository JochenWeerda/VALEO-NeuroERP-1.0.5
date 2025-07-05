# Aktualisiertes Start-Skript für das KI-gestützte ERP-System
# Dieses Skript startet sowohl das Backend als auch das Frontend

# Konfiguration
$pythonEnv = ".venv311"
$backendPort = 8000
$frontendPort = 5173
$frontendDir = "frontend"

function Write-ColorOutput($message, $color) {
    $currentForeground = $Host.UI.RawUI.ForegroundColor
    $Host.UI.RawUI.ForegroundColor = $color
    Write-Output $message
    $Host.UI.RawUI.ForegroundColor = $currentForeground
}

function Start-Backend {
    Write-ColorOutput "Aktiviere Python $pythonEnv Umgebung..." "Yellow"
    
    if (Test-Path "$pythonEnv\Scripts\Activate.ps1") {
        & ".\$pythonEnv\Scripts\Activate.ps1"
        
        Write-ColorOutput "Starte Backend-Server auf Port $backendPort..." "Green"
        Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", "python -m uvicorn backend.main:app --host 0.0.0.0 --port $backendPort --reload"
        
        # Warte kurz, damit der Server Zeit hat, zu starten
        Start-Sleep -Seconds 3
        
        Write-ColorOutput "Backend-Server gestartet: http://localhost:$backendPort" "Cyan"
        Write-ColorOutput "API-Dokumentation verfügbar unter: http://localhost:$backendPort/docs" "Cyan"
    } else {
        Write-ColorOutput "Python-Umgebung $pythonEnv nicht gefunden. Bitte erst einrichten." "Red"
        Write-ColorOutput "Führe aus: python -m venv $pythonEnv" "Yellow"
        exit 1
    }
}

function Start-Frontend {
    Write-ColorOutput "Starte Frontend-Entwicklungsserver..." "Yellow"
    
    if (Test-Path $frontendDir) {
        Set-Location -Path $frontendDir
        
        # Prüfe, ob node_modules existiert, wenn nicht, führe npm install aus
        if (-not (Test-Path "node_modules")) {
            Write-ColorOutput "node_modules nicht gefunden. Führe npm install aus..." "Yellow"
            npm install
        }
        
        # Starte den Frontend-Entwicklungsserver
        Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", "npm run dev"
        
        # Zurück zum Hauptverzeichnis
        Set-Location -Path ".."
        
        # Warte kurz, damit der Server Zeit hat, zu starten
        Start-Sleep -Seconds 3
        
        Write-ColorOutput "Frontend-Server gestartet: http://localhost:$frontendPort" "Cyan"
    } else {
        Write-ColorOutput "Frontend-Verzeichnis $frontendDir nicht gefunden." "Red"
        Write-ColorOutput "Bitte prüfen Sie die Verzeichnisstruktur." "Yellow"
    }
}

function Open-Browser {
    param (
        [string]$url
    )
    
    Write-ColorOutput "Öffne Browser mit URL: $url" "Magenta"
    Start-Process $url
}

# Hauptfunktion
function Start-AllServices {
    Write-ColorOutput "┌─────────────────────────────────────────────┐" "Cyan"
    Write-ColorOutput "│  KI-gestütztes ERP-System mit ORB-FMS Design  │" "Cyan"
    Write-ColorOutput "└─────────────────────────────────────────────┘" "Cyan"
    
    # Starte Backend
    Start-Backend
    
    # Starte Frontend
    Start-Frontend
    
    # Öffne Browser mit Frontend-URL
    Start-Sleep -Seconds 2
    Open-Browser "http://localhost:$frontendPort"
    
    Write-ColorOutput "Alle Dienste wurden gestartet." "Green"
    Write-ColorOutput "Drücken Sie STRG+C in den entsprechenden Fenstern, um die Dienste zu beenden." "Yellow"
}

# Starte alle Dienste
Start-AllServices 