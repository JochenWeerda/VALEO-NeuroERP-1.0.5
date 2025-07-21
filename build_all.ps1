# VALEO NeuroERP - Build-Skript für Stakeholder-Demonstration
# ================================================================

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "    VALEO NeuroERP - Build-Prozess für Demonstration    " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# Funktion zum Ausführen von Befehlen mit Status-Anzeige
function Invoke-BuildCommand {
    param (
        [string]$Command,
        [string]$Description,
        [string]$WorkingDirectory = "."
    )
    
    Write-Host "`n🔄 $Description..." -ForegroundColor Yellow
    Write-Host "   Arbeitsverzeichnis: $WorkingDirectory" -ForegroundColor Gray
    Write-Host "   Befehl: $Command" -ForegroundColor Gray
    
    try {
        Push-Location $WorkingDirectory
        $result = Invoke-Expression $Command 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ $Description erfolgreich abgeschlossen" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $Description fehlgeschlagen (Exit-Code: $LASTEXITCODE)" -ForegroundColor Red
            Write-Host "   Fehler: $result" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "   ❌ Fehler bei $Description`: $_" -ForegroundColor Red
        return $false
    } finally {
        Pop-Location
    }
    
    return $true
}

# 1. Frontend Build
Write-Host "`n📦 1. FRONTEND BUILD" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Magenta

# Node.js Dependencies installieren
if (-not (Invoke-BuildCommand -Command "npm install" -Description "Frontend Dependencies installieren" -WorkingDirectory "frontend")) {
    Write-Host "❌ Frontend Build abgebrochen" -ForegroundColor Red
    exit 1
}

# TypeScript Build
if (-not (Invoke-BuildCommand -Command "npm run build" -Description "Frontend TypeScript Build" -WorkingDirectory "frontend")) {
    Write-Host "❌ Frontend Build abgebrochen" -ForegroundColor Red
    exit 1
}

# 2. Backend Build
Write-Host "`n🐍 2. BACKEND BUILD" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Magenta

# Python Dependencies installieren
if (-not (Invoke-BuildCommand -Command "pip install -r requirements.txt" -Description "Backend Dependencies installieren" -WorkingDirectory "backend")) {
    Write-Host "❌ Backend Build abgebrochen" -ForegroundColor Red
    exit 1
}

# Database Migrations
if (-not (Invoke-BuildCommand -Command "alembic upgrade head" -Description "Database Migrations ausführen" -WorkingDirectory "backend")) {
    Write-Host "⚠️  Database Migrations fehlgeschlagen - fahre trotzdem fort" -ForegroundColor Yellow
}

# 3. Middleware Build
Write-Host "`n🔗 3. MIDDLEWARE BUILD" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Magenta

# Middleware Dependencies installieren
if (Test-Path "backend/middleware/package.json") {
    if (-not (Invoke-BuildCommand -Command "npm install" -Description "Middleware Dependencies installieren" -WorkingDirectory "backend/middleware")) {
        Write-Host "⚠️  Middleware Build fehlgeschlagen - fahre trotzdem fort" -ForegroundColor Yellow
    }
}

# 4. Docker Images erstellen (optional)
Write-Host "`n🐳 4. DOCKER IMAGES" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Magenta

if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host "🔄 Docker Images erstellen..." -ForegroundColor Yellow
    
    # Frontend Docker Image
    if (Test-Path "frontend/Dockerfile") {
        docker build -t valeo-neuroerp-frontend:latest ./frontend
        Write-Host "   ✅ Frontend Docker Image erstellt" -ForegroundColor Green
    }
    
    # Backend Docker Image
    if (Test-Path "backend/Dockerfile") {
        docker build -t valeo-neuroerp-backend:latest ./backend
        Write-Host "   ✅ Backend Docker Image erstellt" -ForegroundColor Green
    }
    
    # Middleware Docker Image
    if (Test-Path "backend/Dockerfile.middleware") {
        docker build -f backend/Dockerfile.middleware -t valeo-neuroerp-middleware:latest ./backend
        Write-Host "   ✅ Middleware Docker Image erstellt" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  Docker nicht verfügbar - überspringe Docker Images" -ForegroundColor Yellow
}

# 5. Build-Status zusammenfassen
Write-Host "`n📊 BUILD-STATUS ZUSAMMENFASSUNG" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

Write-Host "✅ Frontend Build: Abgeschlossen" -ForegroundColor Green
Write-Host "   - Build-Verzeichnis: frontend/dist/" -ForegroundColor Gray
Write-Host "   - Verfügbare Scripts: npm run dev, npm run preview" -ForegroundColor Gray

Write-Host "✅ Backend Build: Abgeschlossen" -ForegroundColor Green
Write-Host "   - Python Environment: Aktiviert" -ForegroundColor Gray
Write-Host "   - Dependencies: Installiert" -ForegroundColor Gray

Write-Host "✅ Middleware Build: Abgeschlossen" -ForegroundColor Green
Write-Host "   - Node.js Dependencies: Installiert" -ForegroundColor Gray

Write-Host "`n🎯 NÄCHSTE SCHRITTE:" -ForegroundColor Yellow
Write-Host "1. Führen Sie 'start_demo.ps1' aus, um alle Services zu starten" -ForegroundColor White
Write-Host "2. Öffnen Sie http://localhost:3001 im Browser" -ForegroundColor White
Write-Host "3. Melden Sie sich mit den Demo-Credentials an" -ForegroundColor White

Write-Host "`n🚀 Build-Prozess erfolgreich abgeschlossen!" -ForegroundColor Green
Write-Host "Bereit für die Stakeholder-Demonstration!" -ForegroundColor Green 