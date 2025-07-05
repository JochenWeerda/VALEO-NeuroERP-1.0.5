#!/usr/bin/env pwsh
# ERP-System PowerShell-Startskript
# Startet das gesamte ERP-System mit allen Komponenten

param (
    [switch]$BackendOnly,
    [switch]$MonitoringOnly,
    [switch]$DashboardOnly,
    [switch]$BenchmarkOnly,
    [switch]$Verbose,
    [int]$ServerPort = 8003,
    [int]$DashboardPort = 5000,
    [switch]$NoBrowser,
    [switch]$Help
)

# Konfiguration
$PROJECT_ROOT = $PSScriptRoot
$BACKEND_DIR = Join-Path -Path $PROJECT_ROOT -ChildPath "backend"
$FRONTEND_DIR = Join-Path -Path $PROJECT_ROOT -ChildPath "frontend"
$VENV_DIR = Join-Path -Path $PROJECT_ROOT -ChildPath ".venv"
$PYTHON_CMD = Join-Path -Path $VENV_DIR -ChildPath "Scripts\python.exe"
$NPM_CMD = "npm"

# Farbige Ausgabe für bessere Lesbarkeit
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success($message) {
    Write-ColorOutput Green "[ERFOLG] $message"
}

function Write-Info($message) {
    Write-ColorOutput Cyan "[INFO] $message"
}

function Write-Warning($message) {
    Write-ColorOutput Yellow "[WARNUNG] $message"
}

function Write-Error($message) {
    Write-ColorOutput Red "[FEHLER] $message"
}

function Write-Debug($message) {
    if ($Verbose) {
        Write-ColorOutput Gray "[DEBUG] $message"
    }
}

# Hilfe anzeigen
function Show-Help {
    Write-Host "ERP-System PowerShell-Startskript" -ForegroundColor Cyan
    Write-Host "Verwendung: .\start_erp_system.ps1 [Parameter]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Parameter:" -ForegroundColor Yellow
    Write-Host "  -BackendOnly              Nur Backend-Server starten" -ForegroundColor White
    Write-Host "  -MonitoringOnly           Nur Monitoring-Komponenten starten" -ForegroundColor White
    Write-Host "  -DashboardOnly            Nur Dashboard starten" -ForegroundColor White
    Write-Host "  -BenchmarkOnly            Nur Benchmark ausführen" -ForegroundColor White
    Write-Host "  -Verbose                  Ausführliche Ausgabe aktivieren" -ForegroundColor White
    Write-Host "  -ServerPort <port>        Port für den Server (Standard: 8003)" -ForegroundColor White
    Write-Host "  -DashboardPort <port>     Port für das Dashboard (Standard: 5000)" -ForegroundColor White
    Write-Host "  -NoBrowser                Browser nicht automatisch öffnen" -ForegroundColor White
    Write-Host "  -Help                     Diese Hilfe anzeigen" -ForegroundColor White
    Write-Host ""
    Write-Host "Beispiele:" -ForegroundColor Yellow
    Write-Host "  .\start_erp_system.ps1                     Startet alle Komponenten" -ForegroundColor White
    Write-Host "  .\start_erp_system.ps1 -BackendOnly        Startet nur den Backend-Server" -ForegroundColor White
    Write-Host "  .\start_erp_system.ps1 -MonitoringOnly     Startet nur die Monitoring-Komponenten" -ForegroundColor White
    Write-Host "  .\start_erp_system.ps1 -ServerPort 8080    Startet den Server auf Port 8080" -ForegroundColor White
}

# Umgebungsvariablen überprüfen und ggf. setzen
function Check-Environment {
    Write-Info "Überprüfe Umgebung..."
    
    # Prüfe Python
    if (-not (Test-Path -Path $PYTHON_CMD)) {
        Write-Warning "Python-Interpreter nicht gefunden unter $PYTHON_CMD"
        Write-Info "Versuche alternative Python-Installation..."
        
        if (Get-Command "python" -ErrorAction SilentlyContinue) {
            $PYTHON_CMD = "python"
            Write-Success "Python gefunden: $(& python --version)"
        } else {
            Write-Error "Python wurde nicht gefunden. Bitte installiere Python und richte eine virtuelle Umgebung ein."
            exit 1
        }
    } else {
        Write-Success "Python gefunden: $(& $PYTHON_CMD --version)"
    }
    
    # Prüfe NPM (nur wenn Frontend gestartet werden soll)
    if (-not $BackendOnly -and -not $MonitoringOnly -and -not $BenchmarkOnly -and -not $DashboardOnly) {
        if (Get-Command "npm" -ErrorAction SilentlyContinue) {
            Write-Success "NPM gefunden: $(& npm --version)"
        } else {
            Write-Warning "NPM wurde nicht gefunden. Frontend wird nicht verfügbar sein."
        }
    }
    
    # Prüfe ob Abhängigkeiten installiert sind
    Write-Info "Überprüfe Python-Abhängigkeiten..."
    $REQ_FILE = Join-Path -Path $BACKEND_DIR -ChildPath "requirements.txt"
    if (Test-Path -Path $REQ_FILE) {
        # Führe pip install aus, wenn Anforderungsdatei existiert
        & $PYTHON_CMD -m pip install -r $REQ_FILE
    } else {
        Write-Warning "Keine requirements.txt gefunden."
    }
    
    # Prüfe ob Observer-Abhängigkeiten installiert sind
    if ($MonitoringOnly -or $DashboardOnly -or (-not $BackendOnly -and -not $BenchmarkOnly)) {
        $OBS_REQ_FILE = Join-Path -Path $BACKEND_DIR -ChildPath "observer_requirements.txt"
        if (Test-Path -Path $OBS_REQ_FILE) {
            Write-Info "Installiere Observer-Abhängigkeiten..."
            & $PYTHON_CMD -m pip install -r $OBS_REQ_FILE
        }
        
        $DASHBOARD_REQ_FILE = Join-Path -Path $BACKEND_DIR -ChildPath "dashboard_requirements.txt"
        if (Test-Path -Path $DASHBOARD_REQ_FILE) {
            Write-Info "Installiere Dashboard-Abhängigkeiten..."
            & $PYTHON_CMD -m pip install -r $DASHBOARD_REQ_FILE
        }
    }
    
    Write-Success "Abhängigkeiten erfolgreich installiert."
}

# Überprüfe ob Server-Code vorhanden ist
function Check-BackendCode {
    Write-Info "Überprüfe Backend-Code..."
    
    # Prüfe ob minimal_server.py existiert
    $SERVER_FILE = Join-Path -Path $BACKEND_DIR -ChildPath "minimal_server.py"
    if (Test-Path -Path $SERVER_FILE) {
        Write-Debug "minimal_server.py gefunden."
    } else {
        Write-Error "Server-Code (minimal_server.py) nicht gefunden!"
        exit 1
    }
    
    # Prüfe ob main.py existiert
    $MAIN_FILE = Join-Path -Path $BACKEND_DIR -ChildPath "main.py"
    if (Test-Path -Path $MAIN_FILE) {
        Write-Debug "main.py gefunden."
    }
    
    # Syntaxprüfung
    try {
        & $PYTHON_CMD -m py_compile $SERVER_FILE
        Write-Success "Syntaxprüfung erfolgreich"
    } catch {
        Write-Error "Syntaxprüfung fehlgeschlagen: $_"
        exit 1
    }
    
    # Python-Pfad für Imports überprüfen
    $PYTHONPATH = @($BACKEND_DIR, $PROJECT_ROOT, (Join-Path -Path $BACKEND_DIR -ChildPath "app"), (Join-Path -Path $PROJECT_ROOT -ChildPath "app"))
    $env:PYTHONPATH = [string]::Join(";", $PYTHONPATH)
    Write-Debug "Python-Pfad: $($env:PYTHONPATH -split ';')"
}

# Starte Backend-Server
function Start-Backend {
    Write-Info "Starte Backend-Server..."
    
    $STARTUP_SCRIPT = Join-Path -Path $BACKEND_DIR -ChildPath "start_erp_system.py"
    
    # Argumentenliste erstellen
    $args = @()
    
    if ($MonitoringOnly) {
        $args += "--monitoring-only"
    }
    
    if ($DashboardOnly) {
        $args += "--with-dashboard"
        $args += "--no-server"
    }
    
    if ($BenchmarkOnly) {
        $args += "--benchmark-only"
    }
    
    if (-not $MonitoringOnly -and -not $DashboardOnly -and -not $BenchmarkOnly) {
        $args += "--all"
    }
    
    $args += "--server-port", "$ServerPort"
    $args += "--dashboard-port", "$DashboardPort"
    
    if ($NoBrowser) {
        $args += "--no-browser"
    }
    
    if ($Verbose) {
        $args += "--verbose"
    }
    
    Write-Info "Server wird unter http://localhost:$ServerPort verfügbar sein"
    Write-Info "API-Dokumentation: http://localhost:$ServerPort/docs"
    Write-Info "Health-Endpoint: http://localhost:$ServerPort/health"
    
    if ($MonitoringOnly -or $DashboardOnly -or (-not $BackendOnly -and -not $BenchmarkOnly)) {
        Write-Info "Performance-Dashboard: http://localhost:$DashboardPort"
    }
    
    Write-Info "Drücken Sie STRG+C, um den Server zu beenden."
    Write-Info "======================================="
    
    # Prüfe ob das zentrale Startskript existiert
    if (Test-Path -Path $STARTUP_SCRIPT) {
        & $PYTHON_CMD $STARTUP_SCRIPT $args
    } else {
        # Fallback: Starte minimal_server.py direkt
        $SERVER_SCRIPT = Join-Path -Path $BACKEND_DIR -ChildPath "minimal_server.py"
        & $PYTHON_CMD $SERVER_SCRIPT --port $ServerPort
    }
}

# Starte Frontend (falls vorhanden und gewünscht)
function Start-Frontend {
    if ($BackendOnly -or $MonitoringOnly -or $DashboardOnly -or $BenchmarkOnly) {
        return
    }
    
    Write-Info "Prüfe Frontend-Code..."
    
    if (-not (Test-Path -Path $FRONTEND_DIR)) {
        Write-Warning "Frontend-Verzeichnis nicht gefunden."
        return
    }
    
    $PACKAGE_JSON = Join-Path -Path $FRONTEND_DIR -ChildPath "package.json"
    if (-not (Test-Path -Path $PACKAGE_JSON)) {
        Write-Warning "package.json im Frontend-Verzeichnis nicht gefunden."
        return
    }
    
    Write-Info "Starte Frontend-Entwicklungsserver..."
    Set-Location $FRONTEND_DIR
    Start-Process -FilePath $NPM_CMD -ArgumentList "start" -NoNewWindow
    Set-Location $PROJECT_ROOT
}

# Hauptprogramm
try {
    # Hilfe anzeigen wenn angefordert
    if ($Help) {
        Show-Help
        exit 0
    }
    
    Write-Info "=== ERP-System-Starter ==="
    
    # Schritt 1: Umgebung prüfen
    Check-Environment
    
    # Schritt 2: Backend-Code prüfen
    Check-BackendCode
    
    # Schritt 3: Backend starten
    Start-Backend
    
    # Schritt 4: Frontend starten (falls gewünscht)
    if (-not $BackendOnly) {
        Start-Frontend
    }
    
} catch {
    Write-Error "Unerwarteter Fehler: $_"
    Write-Debug $_.ScriptStackTrace
    exit 1
} 