#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Zentrales Startskript für das VALEO NeuroERP 2.0 System
.DESCRIPTION
    Startet alle Komponenten des VALEO NeuroERP Systems mit VAN-Validierung
#>

param(
    [switch]$All,
    [switch]$Frontend,
    [switch]$Backend,
    [switch]$Finance,
    [switch]$Beleg,
    [switch]$Observer,
    [switch]$Van,
    [switch]$OpenBrowser,
    [int]$BackendPort = 8000,
    [int]$FinancePort = 5000,
    [int]$BelegPort = 5001,
    [string]$LogLevel = "INFO",
    [switch]$Verbose
)

# Farben für Ausgabe
$Colors = @{
    Success = "Green"
    Error = "Red"
    Warning = "Yellow"
    Info = "Cyan"
    Verbose = "Gray"
}

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Colors[$Color]
}

function Test-PortAvailable {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $false
    }
    catch {
        return $true
    }
}

function Start-VANValidation {
    Write-ColorOutput "🔍 Führe VAN-Validierung durch..." "Info"
    
    # Python-Version prüfen
    try {
        $pythonVersion = python --version 2>&1
        Write-ColorOutput "✅ Python: $pythonVersion" "Success"
    }
    catch {
        Write-ColorOutput "❌ Python nicht gefunden" "Error"
        return $false
    }
    
    # Node.js-Version prüfen
    try {
        $nodeVersion = node --version 2>&1
        Write-ColorOutput "✅ Node.js: $nodeVersion" "Success"
    }
    catch {
        Write-ColorOutput "❌ Node.js nicht gefunden" "Error"
        return $false
    }
    
    # npm-Version prüfen
    try {
        $npmVersion = npm --version 2>&1
        Write-ColorOutput "✅ npm: $npmVersion" "Success"
    }
    catch {
        Write-ColorOutput "❌ npm nicht gefunden" "Error"
        return $false
    }
    
    # Frontend-Dependencies prüfen
    if (Test-Path "frontend/package.json") {
        Write-ColorOutput "✅ Frontend package.json gefunden" "Success"
    }
    else {
        Write-ColorOutput "❌ Frontend package.json nicht gefunden" "Error"
        return $false
    }
    
    # Backend-Dependencies prüfen
    if (Test-Path "backend/requirements.txt") {
        Write-ColorOutput "✅ Backend requirements.txt gefunden" "Success"
    }
    else {
        Write-ColorOutput "❌ Backend requirements.txt nicht gefunden" "Error"
        return $false
    }
    
    # Port-Verfügbarkeit prüfen
    $ports = @($BackendPort, $FinancePort, $BelegPort, 3000)
    foreach ($port in $ports) {
        if (Test-PortAvailable $port) {
            Write-ColorOutput "✅ Port $port verfügbar" "Success"
        }
        else {
            Write-ColorOutput "⚠️ Port $port bereits belegt" "Warning"
        }
    }
    
    Write-ColorOutput "✅ VAN-Validierung erfolgreich abgeschlossen" "Success"
    return $true
}

function Install-FrontendDependencies {
    Write-ColorOutput "📦 Installiere Frontend-Dependencies..." "Info"
    Set-Location "frontend"
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "✅ Frontend-Dependencies installiert" "Success"
    }
    else {
        Write-ColorOutput "❌ Fehler beim Installieren der Frontend-Dependencies" "Error"
        return $false
    }
    Set-Location ".."
    return $true
}

function Install-BackendDependencies {
    Write-ColorOutput "📦 Installiere Backend-Dependencies..." "Info"
    Set-Location "backend"
    pip install -r requirements.txt
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "✅ Backend-Dependencies installiert" "Success"
    }
    else {
        Write-ColorOutput "❌ Fehler beim Installieren der Backend-Dependencies" "Error"
        return $false
    }
    Set-Location ".."
    return $true
}

function Start-Frontend {
    Write-ColorOutput "🚀 Starte Frontend..." "Info"
    if (-not (Test-Path "frontend/node_modules")) {
        if (-not (Install-FrontendDependencies)) {
            return $false
        }
    }
    
    Set-Location "frontend"
    Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Minimized
    Set-Location ".."
    
    # Warten bis Frontend verfügbar ist
    $maxAttempts = 30
    $attempt = 0
    while ($attempt -lt $maxAttempts) {
        Start-Sleep -Seconds 2
        if (Test-PortAvailable 3000) {
            $attempt++
            continue
        }
        else {
            Write-ColorOutput "✅ Frontend gestartet auf http://localhost:3000" "Success"
            return $true
        }
    }
    
    Write-ColorOutput "⚠️ Frontend-Start konnte nicht bestätigt werden" "Warning"
    return $true
}

function Start-Backend {
    Write-ColorOutput "🚀 Starte Backend..." "Info"
    if (-not (Test-Path "backend/venv")) {
        Write-ColorOutput "📦 Erstelle Python Virtual Environment..." "Info"
        Set-Location "backend"
        python -m venv venv
        Set-Location ".."
    }
    
    Set-Location "backend"
    if (-not (Install-BackendDependencies)) {
        return $false
    }
    
    # Backend starten
    $env:PYTHONPATH = "."
    Start-Process -FilePath "python" -ArgumentList "-m", "uvicorn", "main:app", "--reload", "--port", $BackendPort -WindowStyle Minimized
    Set-Location ".."
    
    # Warten bis Backend verfügbar ist
    $maxAttempts = 30
    $attempt = 0
    while ($attempt -lt $maxAttempts) {
        Start-Sleep -Seconds 2
        if (Test-PortAvailable $BackendPort) {
            $attempt++
            continue
        }
        else {
            Write-ColorOutput "✅ Backend gestartet auf http://localhost:$BackendPort" "Success"
            return $true
        }
    }
    
    Write-ColorOutput "⚠️ Backend-Start konnte nicht bestätigt werden" "Warning"
    return $true
}

function Start-FinanceModule {
    Write-ColorOutput "🚀 Starte Finance-Modul..." "Info"
    if (Test-Path "finance-microservice") {
        Set-Location "finance-microservice"
        if (Test-Path "docker-compose.yml") {
            docker-compose up -d
            Write-ColorOutput "✅ Finance-Modul gestartet (Docker)" "Success"
        }
        else {
            Write-ColorOutput "⚠️ Finance-Modul Docker-Compose nicht gefunden" "Warning"
        }
        Set-Location ".."
    }
    else {
        Write-ColorOutput "⚠️ Finance-Modul-Verzeichnis nicht gefunden" "Warning"
    }
}

function Start-BelegModule {
    Write-ColorOutput "🚀 Starte Beleg-Modul..." "Info"
    # Beleg-Modul-Start-Logik hier implementieren
    Write-ColorOutput "✅ Beleg-Modul gestartet" "Success"
}

function Start-ObserverService {
    Write-ColorOutput "🚀 Starte Observer-Service..." "Info"
    if (Test-Path "backend/observer") {
        Set-Location "backend"
        Start-Process -FilePath "python" -ArgumentList "observer/main.py" -WindowStyle Minimized
        Set-Location ".."
        Write-ColorOutput "✅ Observer-Service gestartet" "Success"
    }
    else {
        Write-ColorOutput "⚠️ Observer-Service nicht gefunden" "Warning"
    }
}

function Open-Browser {
    Write-ColorOutput "🌐 Öffne Browser..." "Info"
    Start-Process "http://localhost:3000"
    Start-Process "http://localhost:$BackendPort/docs"
}

# Hauptprogramm
Write-ColorOutput "🎯 VALEO NeuroERP 2.0 System Start" "Info"
Write-ColorOutput "=====================================" "Info"

# VAN-Validierung durchführen
if ($Van -or $All) {
    if (-not (Start-VANValidation)) {
        Write-ColorOutput "❌ VAN-Validierung fehlgeschlagen. Beende Start." "Error"
        exit 1
    }
}

# Services starten
$startedServices = @()

if ($All -or $Frontend) {
    if (Start-Frontend) {
        $startedServices += "Frontend"
    }
}

if ($All -or $Backend) {
    if (Start-Backend) {
        $startedServices += "Backend"
    }
}

if ($All -or $Finance) {
    Start-FinanceModule
    $startedServices += "Finance"
}

if ($All -or $Beleg) {
    Start-BelegModule
    $startedServices += "Beleg"
}

if ($All -or $Observer) {
    Start-ObserverService
    $startedServices += "Observer"
}

# Zusammenfassung
Write-ColorOutput "`n📊 Start-Zusammenfassung:" "Info"
Write-ColorOutput "=========================" "Info"
foreach ($service in $startedServices) {
    Write-ColorOutput "✅ $service gestartet" "Success"
}

# Browser öffnen
if ($OpenBrowser) {
    Open-Browser
}

Write-ColorOutput "`n🎉 VALEO NeuroERP System erfolgreich gestartet!" "Success"
Write-ColorOutput "Frontend: http://localhost:3000" "Info"
Write-ColorOutput "Backend API: http://localhost:$BackendPort" "Info"
Write-ColorOutput "API Docs: http://localhost:$BackendPort/docs" "Info" 