# PowerShell-Skript zum Starten des Finance-Microservice
# Entweder mit Docker oder lokal

param (
    [switch]$UseDocker = $false,
    [int]$Port = 8000,
    [switch]$Help = $false
)

# Hilfe anzeigen
if ($Help) {
    Write-Host "Finance-Microservice Starter" -ForegroundColor Green
    Write-Host "===============================================" -ForegroundColor Green
    Write-Host "Verwendung: .\start_finance_service.ps1 [-UseDocker] [-Port <port>] [-Help]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Parameter:" -ForegroundColor Yellow
    Write-Host "  -UseDocker    : Verwendet Docker statt lokalen Python-Interpreter" -ForegroundColor White
    Write-Host "  -Port <port>  : Bestimmt den Port (Standard: 8000)" -ForegroundColor White
    Write-Host "  -Help         : Zeigt diese Hilfe an" -ForegroundColor White
    Write-Host ""
    Write-Host "Beispiele:" -ForegroundColor Yellow
    Write-Host "  .\start_finance_service.ps1               # Startet lokal auf Port 8000" -ForegroundColor White
    Write-Host "  .\start_finance_service.ps1 -Port 8005    # Startet lokal auf Port 8005" -ForegroundColor White
    Write-Host "  .\start_finance_service.ps1 -UseDocker    # Startet mit Docker auf Port 8000" -ForegroundColor White
    exit 0
}

# Konfiguration
$serviceName = "Finance-Microservice"

Write-Host "$serviceName wird gestartet..." -ForegroundColor Green
Write-Host "Port: $Port" -ForegroundColor Cyan

# Docker-Option wurde gewählt
if ($UseDocker) {
    # Prüfen, ob Docker installiert ist
    $dockerInstalled = $false
    
    try {
        $dockerVersion = Invoke-Expression "docker --version" -ErrorAction SilentlyContinue
        if ($dockerVersion) {
            $dockerInstalled = $true
            Write-Host "Docker erkannt: $dockerVersion" -ForegroundColor Green
        }
    } catch {
        $dockerInstalled = $false
    }
    
    if (-not $dockerInstalled) {
        Write-Host "Docker ist nicht installiert oder nicht verfügbar." -ForegroundColor Red
        Write-Host "Bitte installieren Sie Docker oder verwenden Sie den lokalen Modus." -ForegroundColor Yellow
        Write-Host "Installation: .\install_docker.ps1" -ForegroundColor Yellow
        exit 1
    }
    
    # Prüfen, ob Docker-Compose-Datei existiert
    if (-not (Test-Path "docker-compose.yml")) {
        Write-Host "docker-compose.yml nicht gefunden!" -ForegroundColor Red
        exit 1
    }
    
    # Docker-Compose mit Port-Konfiguration ausführen
    Write-Host "Starte $serviceName mit Docker Compose..." -ForegroundColor Cyan
    
    # Umgebungsvariablen für Docker setzen
    $env:PORT = $Port
    
    try {
        # Container stoppen und neu erstellen, falls sie bereits laufen
        docker-compose down
        
        # Container starten
        docker-compose up --build -d
        
        # Kurz warten und dann Status prüfen
        Start-Sleep -Seconds 3
        $containerStatus = docker-compose ps
        
        Write-Host "Container-Status:" -ForegroundColor Green
        Write-Host $containerStatus
        
        Write-Host "$serviceName ist erreichbar unter http://localhost:$Port" -ForegroundColor Green
        Write-Host "API-Dokumentation: http://localhost:$Port/docs" -ForegroundColor Green
        Write-Host "Zum Beenden des Services: docker-compose down" -ForegroundColor Yellow
    }
    catch {
        Write-Host "Fehler beim Starten mit Docker: $_" -ForegroundColor Red
        exit 1
    }
}
# Lokale Ausführung
else {
    # Prüfen, ob Python installiert ist
    $pythonInstalled = $false
    
    try {
        $pythonVersion = python --version 2>&1
        if ($pythonVersion -match "Python") {
            $pythonInstalled = $true
            Write-Host "Python erkannt: $pythonVersion" -ForegroundColor Green
        }
    } catch {
        $pythonInstalled = $false
    }
    
    if (-not $pythonInstalled) {
        Write-Host "Python ist nicht installiert oder nicht im PATH." -ForegroundColor Red
        exit 1
    }
    
    # Prüfen, ob simple_finance_server.py existiert
    if (-not (Test-Path "simple_finance_server.py")) {
        Write-Host "simple_finance_server.py nicht gefunden!" -ForegroundColor Red
        exit 1
    }
    
    # Virtuelle Umgebung aktivieren, falls vorhanden
    if (Test-Path ".venv\Scripts\Activate.ps1") {
        Write-Host "Virtuelle Umgebung wird aktiviert..." -ForegroundColor Cyan
        try {
            & .\.venv\Scripts\Activate.ps1
        } catch {
            Write-Host "Warnung: Virtuelle Umgebung konnte nicht aktiviert werden." -ForegroundColor Yellow
            Write-Host "Server wird mit globalem Python gestartet." -ForegroundColor Yellow
        }
    }
    
    # Simple Finance Server starten
    Write-Host "Starte $serviceName lokal auf Port $Port..." -ForegroundColor Cyan
    
    try {
        # Server starten und Port übergeben
        python simple_finance_server.py $Port
    }
    catch {
        Write-Host "Fehler beim Starten des lokalen Servers: $_" -ForegroundColor Red
        exit 1
    }
}

# Hinweis: Der Skript-Prozess wird bei lokalem Start vom Python-Server blockiert,
# daher wird dieser Teil nur bei Fehlern oder bei Docker-Start erreicht 