# ===================================================
# VALEO NeuroERP - Einheitliches Startsystem
# ===================================================
# Dieses Skript ermöglicht den Start aller Komponenten
# des VALEO NeuroERP-Systems mit VAN-Validierung und
# konfigurierbaren Optionen.
# ===================================================

param (
    [switch]$All,
    [switch]$Frontend,
    [switch]$Backend,
    [switch]$Finance,
    [switch]$Beleg,
    [switch]$Observer,
    [switch]$Van,
    [switch]$OpenBrowser,
    [int]$BackendPort = 8003,
    [int]$FinancePort = 8007,
    [int]$BelegPort = 8005,
    [string]$LogLevel = "info",
    [switch]$Verbose
)

# Farbige Ausgabe-Funktionen für bessere Lesbarkeit
function Write-ColorOutput {
    param (
        [string]$Text,
        [string]$Color = "White"
    )
    Write-Host $Text -ForegroundColor $Color
}

function Write-Success {
    param ([string]$Text)
    Write-ColorOutput $Text "Green"
}

function Write-Error {
    param ([string]$Text)
    Write-ColorOutput $Text "Red"
}

function Write-Warning {
    param ([string]$Text)
    Write-ColorOutput $Text "Yellow"
}

function Write-Info {
    param ([string]$Text)
    Write-ColorOutput $Text "Cyan"
}

function Write-Verbose {
    param ([string]$Text)
    if ($Verbose) {
        Write-ColorOutput $Text "Gray"
    }
}

# Banner ausgeben
Write-Host ""
Write-Host " ======================================================" -ForegroundColor Cyan
Write-Host "  VALEO NeuroERP - Einheitliches Startsystem" -ForegroundColor Cyan
Write-Host " ======================================================" -ForegroundColor Cyan
Write-Host ""

# Funktion zum Prüfen und Starten von Prozessen
function Start-Component {
    param (
        [string]$Name,
        [string]$ScriptPath,
        [string]$Arguments = "",
        [switch]$Background = $true
    )
    
    Write-Info "Starte $Name..."
    
    try {
        if ($Background) {
            if ($Verbose) {
                Write-Verbose "Ausführen: $ScriptPath $Arguments"
            }
            
            Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$ScriptPath`" $Arguments" -WindowStyle Normal
            Write-Success "$Name wurde gestartet"
        }
        else {
            if ($Verbose) {
                Write-Verbose "Ausführen: $ScriptPath $Arguments"
            }
            
            & "$ScriptPath" $Arguments
            Write-Success "$Name wurde gestartet"
        }
    }
    catch {
        Write-Error "Fehler beim Starten von $Name: $_"
        return $false
    }
    
    return $true
}

# Funktion zum Validieren der Umgebung
function Test-Environment {
    $errors = 0
    
    # Prüfe ob Frontend-Verzeichnis existiert
    if (-not (Test-Path "frontend")) {
        Write-Error "Frontend-Verzeichnis nicht gefunden!"
        $errors++
    }
    
    # Prüfe ob Backend-Verzeichnis existiert
    if (-not (Test-Path "backend")) {
        Write-Error "Backend-Verzeichnis nicht gefunden!"
        $errors++
    }
    
    # Prüfe Python-Version
    try {
        $pythonVersion = python --version 2>&1
        if (-not ($pythonVersion -match "Python 3\.(1[0-3]|9|8|7|6|5|4|3|2|1|0)")) {
            Write-Warning "Python-Version könnte inkompatibel sein. Python 3.11 wird empfohlen."
        }
        else {
            Write-Verbose "Python-Version: $pythonVersion"
        }
    }
    catch {
        Write-Error "Python ist nicht installiert oder nicht im PATH."
        $errors++
    }
    
    # Prüfe Node.js-Version
    try {
        $nodeVersion = node --version 2>&1
        if (-not ($nodeVersion -match "v1[0-9]\.")) {
            Write-Warning "Node.js-Version könnte inkompatibel sein. Node.js 18+ wird empfohlen."
        }
        else {
            Write-Verbose "Node.js-Version: $nodeVersion"
        }
    }
    catch {
        Write-Error "Node.js ist nicht installiert oder nicht im PATH."
        $errors++
    }
    
    # Port-Verfügbarkeit prüfen
    $portsToCheck = @($BackendPort, $FinancePort, $BelegPort)
    foreach ($port in $portsToCheck) {
        $portInUse = $false
        try {
            $listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $port)
            $listener.Start()
            $listener.Stop()
        }
        catch {
            $portInUse = $true
        }
        
        if ($portInUse) {
            Write-Warning "Port $port wird bereits verwendet. Bitte schließen Sie die Anwendung, die diesen Port verwendet, oder ändern Sie den Port."
        }
    }
    
    if ($errors -gt 0) {
        Write-Error "$errors Fehler bei der Umgebungsprüfung. Bitte beheben Sie diese Fehler, bevor Sie fortfahren."
        return $false
    }
    
    return $true
}

# VAN-Modus-Validierung
function Invoke-VanValidation {
    Write-Info "Führe VAN-Modus-Validierung durch..."
    
    # Frontend-Validator
    $frontendValidatorPath = Join-Path $PSScriptRoot "scripts/van-frontend-validator.ps1"
    if (Test-Path $frontendValidatorPath) {
        Write-Info "Validiere Frontend-Umgebung..."
        & $frontendValidatorPath
    }
    else {
        Write-Warning "Frontend-Validator nicht gefunden: $frontendValidatorPath"
    }
    
    # Backend-Validator
    $backendValidatorPath = Join-Path $PSScriptRoot "scripts/van-backend-validator.ps1"
    if (Test-Path $backendValidatorPath) {
        Write-Info "Validiere Backend-Umgebung..."
        & $backendValidatorPath
    }
    else {
        Write-Warning "Backend-Validator nicht gefunden: $backendValidatorPath"
    }
}

# Hauptlogik
if ($Van -or $All) {
    Invoke-VanValidation
}

if (-not (Test-Environment)) {
    Write-Error "Umgebungsprüfung fehlgeschlagen. Bitte beheben Sie die Fehler und versuchen Sie es erneut."
    exit 1
}

# Prüfe, ob mindestens eine Komponente ausgewählt wurde
if (-not ($All -or $Frontend -or $Backend -or $Finance -or $Beleg -or $Observer)) {
    Write-Info "Keine Komponente ausgewählt. Starte alle Komponenten..."
    $All = $true
}

# Komponenten starten
$startedComponents = 0

# Observer starten (wenn angefordert oder alle)
if ($Observer -or $All) {
    $observerScript = Join-Path $PSScriptRoot "backend/start_observer.ps1"
    if (Test-Path $observerScript) {
        $success = Start-Component -Name "Observer-Service" -ScriptPath $observerScript
        if ($success) { $startedComponents++ }
    }
    else {
        Write-Warning "Observer-Skript nicht gefunden: $observerScript"
    }
}

# Backend starten (wenn angefordert oder alle)
if ($Backend -or $All) {
    $backendScript = Join-Path $PSScriptRoot "backend/start_minimal_server.ps1"
    if (Test-Path $backendScript) {
        $backendArgs = "-Port $BackendPort -LogLevel $LogLevel"
        $success = Start-Component -Name "Backend-Server" -ScriptPath $backendScript -Arguments $backendArgs
        if ($success) { $startedComponents++ }
    }
    else {
        Write-Warning "Backend-Skript nicht gefunden: $backendScript"
    }
}

# Finance-Service starten (wenn angefordert oder alle)
if ($Finance -or $All) {
    $financeScript = Join-Path $PSScriptRoot "start_finance_311.ps1"
    if (Test-Path $financeScript) {
        $financeArgs = "-Port $FinancePort"
        $success = Start-Component -Name "Finance-Service" -ScriptPath $financeScript -Arguments $financeArgs
        if ($success) { $startedComponents++ }
    }
    else {
        Write-Warning "Finance-Skript nicht gefunden: $financeScript"
    }
}

# Beleg-Service starten (wenn angefordert oder alle)
if ($Beleg -or $All) {
    $belegScript = Join-Path $PSScriptRoot "start_beleg_service_311.ps1"
    if (Test-Path $belegScript) {
        $belegArgs = "-Port $BelegPort"
        $success = Start-Component -Name "Beleg-Service" -ScriptPath $belegScript -Arguments $belegArgs
        if ($success) { $startedComponents++ }
    }
    else {
        Write-Warning "Beleg-Skript nicht gefunden: $belegScript"
    }
}

# Frontend starten (wenn angefordert oder alle)
if ($Frontend -or $All) {
    $frontendScript = Join-Path $PSScriptRoot "start_frontend.ps1"
    if (Test-Path $frontendScript) {
        $frontendArgs = ""
        if ($OpenBrowser) {
            $frontendArgs += "-OpenBrowser"
        }
        $success = Start-Component -Name "Frontend" -ScriptPath $frontendScript -Arguments $frontendArgs
        if ($success) { $startedComponents++ }
    }
    else {
        Write-Warning "Frontend-Skript nicht gefunden: $frontendScript"
    }
}

# Zusammenfassung ausgeben
Write-Host ""
Write-Host "VALEO NeuroERP - Startzusammenfassung" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "Gestartete Komponenten: $startedComponents" -ForegroundColor White

if ($startedComponents -gt 0) {
    Write-Success "Das System wurde erfolgreich gestartet!"
    
    # Zugriffsinformationen anzeigen
    Write-Host ""
    Write-Host "Zugriff auf die Komponenten:" -ForegroundColor Cyan
    if ($Frontend -or $All) {
        Write-Host "- Frontend: http://localhost:3001" -ForegroundColor White
    }
    if ($Backend -or $All) {
        Write-Host "- Backend API: http://localhost:$BackendPort" -ForegroundColor White
        Write-Host "- Backend Health: http://localhost:$BackendPort/health" -ForegroundColor White
    }
    if ($Finance -or $All) {
        Write-Host "- Finance-Service: http://localhost:$FinancePort" -ForegroundColor White
        Write-Host "- Finance Health: http://localhost:$FinancePort/health" -ForegroundColor White
    }
    if ($Beleg -or $All) {
        Write-Host "- Beleg-Service: http://localhost:$BelegPort" -ForegroundColor White
        Write-Host "- Beleg Health: http://localhost:$BelegPort/health" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "Drücken Sie Strg+C, um die Komponenten zu beenden." -ForegroundColor Yellow
}
else {
    Write-Error "Keine Komponenten konnten gestartet werden. Überprüfen Sie die Fehlermeldungen und versuchen Sie es erneut."
}

Write-Host ""
Write-Host "Verwendung:" -ForegroundColor Cyan
Write-Host ".\start_valeo_system.ps1 [-All] [-Frontend] [-Backend] [-Finance] [-Beleg] [-Observer] [-Van]" -ForegroundColor White
Write-Host "                         [-OpenBrowser] [-BackendPort <port>] [-FinancePort <port>]" -ForegroundColor White
Write-Host "                         [-BelegPort <port>] [-LogLevel <level>] [-Verbose]" -ForegroundColor White
Write-Host ""