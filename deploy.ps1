# VALEO NeuroERP Deployment Script für PowerShell
# Autor: AI Assistant
# Version: 2.0

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

# Logging-Funktionen
function Write-Log {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] WARNING: $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] ERROR: $Message" -ForegroundColor Red
}

# Dependencies prüfen
function Test-Dependencies {
    Write-Log "Prüfe Dependencies..."
    
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "Docker ist nicht installiert!"
        exit 1
    }
    
    if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
        Write-Error "Docker Compose ist nicht installiert!"
        exit 1
    }
    
    Write-Log "Dependencies sind verfügbar"
}

# Services starten
function Start-Services {
    Write-Log "Starte Services..."
    docker-compose up -d
    Write-Log "Services gestartet"
}

# Services stoppen
function Stop-Services {
    Write-Log "Stoppe Services..."
    docker-compose down
    Write-Log "Services gestoppt"
}

# Services neu starten
function Restart-Services {
    Write-Log "Starte Services neu..."
    Stop-Services
    Start-Services
    Write-Log "Services neu gestartet"
}

# Health Check
function Test-Health {
    Write-Log "Führe Health Check durch..."
    Start-Sleep -Seconds 5
    
    # Prüfe Backend
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 5
        Write-Log "✓ Backend ist gesund"
    } catch {
        Write-Error "✗ Backend Health Check fehlgeschlagen"
    }
    
    # Prüfe Frontend
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/" -UseBasicParsing -TimeoutSec 5
        Write-Log "✓ Frontend ist erreichbar"
    } catch {
        Write-Error "✗ Frontend Health Check fehlgeschlagen"
    }
    
    Write-Log "Health Check abgeschlossen"
}

# Logs anzeigen
function Show-Logs {
    Write-Log "Zeige Logs..."
    docker-compose logs -f
}

# Monitoring-Status
function Show-MonitoringStatus {
    Write-Log "Monitoring-Status:"
    Write-Host "Prometheus: http://localhost:9090"
    Write-Host "Grafana: http://localhost:3001 (admin/admin123)"
    Write-Host "Backend API: http://localhost:8000"
    Write-Host "Frontend: http://localhost:3000"
}

# Cleanup
function Invoke-Cleanup {
    Write-Log "Führe Cleanup durch..."
    docker-compose down
    docker image prune -f
    docker volume prune -f
    docker network prune -f
    Write-Log "Cleanup abgeschlossen"
}

# Tests ausführen
function Invoke-Tests {
    Write-Log "Führe Tests aus..."
    Set-Location frontend
    npm test -- --watchAll=false --coverage
    Set-Location ..
    Write-Log "Tests abgeschlossen"
}

# Build Images
function Build-Images {
    Write-Log "Baue Docker Images..."
    docker-compose build --no-cache
    Write-Log "Images gebaut"
}

# Hilfe anzeigen
function Show-Help {
    Write-Host "VALEO NeuroERP Deployment Script (PowerShell)"
    Write-Host ""
    Write-Host "Verwendung: .\deploy.ps1 [COMMAND]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  start       - Starte alle Services"
    Write-Host "  stop        - Stoppe alle Services"
    Write-Host "  restart     - Starte Services neu"
    Write-Host "  status      - Zeige Service-Status"
    Write-Host "  logs        - Zeige Logs"
    Write-Host "  health      - Führe Health Check durch"
    Write-Host "  build       - Baue Docker Images"
    Write-Host "  test        - Führe Tests aus"
    Write-Host "  cleanup     - Führe Cleanup durch"
    Write-Host "  help        - Zeige diese Hilfe"
    Write-Host ""
    Write-Host "Beispiele:"
    Write-Host "  .\deploy.ps1 start"
    Write-Host "  .\deploy.ps1 logs"
    Write-Host "  .\deploy.ps1 health"
}

# Hauptfunktion
function Main {
    switch ($Command.ToLower()) {
        "start" {
            Test-Dependencies
            Start-Services
            Test-Health
            Show-MonitoringStatus
        }
        "stop" {
            Stop-Services
        }
        "restart" {
            Test-Dependencies
            Restart-Services
            Test-Health
        }
        "status" {
            docker-compose ps
            Show-MonitoringStatus
        }
        "logs" {
            Show-Logs
        }
        "health" {
            Test-Health
        }
        "build" {
            Test-Dependencies
            Build-Images
        }
        "test" {
            Invoke-Tests
        }
        "cleanup" {
            Invoke-Cleanup
        }
        "help" {
            Show-Help
        }
        default {
            Show-Help
        }
    }
}

# Script ausführen
Main 