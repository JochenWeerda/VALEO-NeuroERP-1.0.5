# VALEO NeuroERP - Docker Demo Start-Skript
# ================================================================

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "    VALEO NeuroERP - Docker Demo Start-Skript            " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# Funktion zum Ausführen von Befehlen mit Status-Anzeige
function Invoke-DockerCommand {
    param (
        [string]$Command,
        [string]$Description
    )
    
    Write-Host "🔄 $Description..." -ForegroundColor Yellow
    Write-Host "   Befehl: $Command" -ForegroundColor Gray
    
    try {
        $result = Invoke-Expression $Command 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ $Description erfolgreich" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $Description fehlgeschlagen (Exit-Code: $LASTEXITCODE)" -ForegroundColor Red
            Write-Host "   Fehler: $result" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "   ❌ Fehler bei $Description`: $_" -ForegroundColor Red
        return $false
    }
    
    return $true
}

# 1. Docker prüfen
Write-Host "`n🐳 1. DOCKER STATUS PRÜFEN" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Magenta

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker ist nicht installiert oder nicht im PATH" -ForegroundColor Red
    Write-Host "   Bitte installieren Sie Docker Desktop" -ForegroundColor Yellow
    exit 1
}

# Docker Desktop Status prüfen
if (-not (Invoke-DockerCommand -Command "docker version" -Description "Docker Version prüfen")) {
    Write-Host "❌ Docker Desktop läuft nicht" -ForegroundColor Red
    Write-Host "   Bitte starten Sie Docker Desktop" -ForegroundColor Yellow
    exit 1
}

# 2. Alte Container stoppen
Write-Host "`n🧹 2. ALTE CONTAINER BEREINIGEN" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Magenta

Invoke-DockerCommand -Command "docker-compose down" -Description "Alte Container stoppen"
Invoke-DockerCommand -Command "docker system prune -f" -Description "Docker System bereinigen"

# 3. Images bauen
Write-Host "`n🔨 3. DOCKER IMAGES BAUEN" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Magenta

if (-not (Invoke-DockerCommand -Command "docker-compose build" -Description "Docker Images bauen")) {
    Write-Host "❌ Image-Build fehlgeschlagen" -ForegroundColor Red
    exit 1
}

# 4. Services starten
Write-Host "`n🚀 4. SERVICES STARTEN" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Magenta

if (-not (Invoke-DockerCommand -Command "docker-compose up -d" -Description "Services starten")) {
    Write-Host "❌ Services konnten nicht gestartet werden" -ForegroundColor Red
    exit 1
}

# 5. Services warten
Write-Host "`n⏳ 5. SERVICES WARTEN" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Magenta

Write-Host "🔄 Warte auf Services..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# 6. Status prüfen
Write-Host "`n📊 6. SERVICE STATUS PRÜFEN" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Magenta

Invoke-DockerCommand -Command "docker-compose ps" -Description "Service Status anzeigen"

# 7. Health Checks
Write-Host "`n🏥 7. HEALTH CHECKS" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Magenta

$services = @("frontend", "backend", "postgres", "redis")

foreach ($service in $services) {
    $containerName = "valeo-neuroerp-2.0_${service}_1"
    $health = docker inspect --format='{{.State.Health.Status}}' $containerName 2>$null
    if ($health -eq "healthy") {
        Write-Host "   ✅ $service`t: Gesund" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  $service`t: $health" -ForegroundColor Yellow
    }
}

# 8. Browser öffnen
Write-Host "`n🌍 8. BROWSER ÖFFNEN" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Magenta

Start-Sleep -Seconds 5

try {
    Start-Process "chrome.exe" -ArgumentList "--new-window http://localhost"
    Write-Host "   ✅ Chrome Browser geöffnet" -ForegroundColor Green
} catch {
    try {
        Start-Process "http://localhost"
        Write-Host "   ✅ Standard-Browser geöffnet" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Browser konnte nicht geöffnet werden" -ForegroundColor Red
        Write-Host "   Öffnen Sie manuell: http://localhost" -ForegroundColor Yellow
    }
}

# 9. Demo-Informationen
Write-Host "`n📋 9. DEMO-INFORMATIONEN" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Magenta

Write-Host "🎯 VALEO NeuroERP ist bereit für die Demonstration!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Verfügbare Services:" -ForegroundColor Cyan
Write-Host "   • Frontend: http://localhost" -ForegroundColor White
Write-Host "   • Backend API: http://localhost/api" -ForegroundColor White
Write-Host "   • PostgreSQL: localhost:5432" -ForegroundColor White
Write-Host "   • Redis: localhost:6379" -ForegroundColor White
Write-Host ""
Write-Host "🔑 Demo-Credentials:" -ForegroundColor Cyan
Write-Host "   • Benutzername: admin" -ForegroundColor White
Write-Host "   • Passwort: admin123" -ForegroundColor White
Write-Host ""
Write-Host "🎨 Features:" -ForegroundColor Cyan
Write-Host "   • Vollständiges ERP-System mit 12 Modulen" -ForegroundColor White
Write-Host "   • 440 Datenbank-Tabellen (100% L3-Abdeckung)" -ForegroundColor White
Write-Host "   • Deutsche Lokalisierung" -ForegroundColor White
Write-Host "   • Responsive Design" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Verwaltung:" -ForegroundColor Cyan
Write-Host "   • Services stoppen: docker-compose down" -ForegroundColor White
Write-Host "   • Logs anzeigen: docker-compose logs -f" -ForegroundColor White
Write-Host "   • Status prüfen: docker-compose ps" -ForegroundColor White

Write-Host "`n🚀 Docker Demo erfolgreich gestartet!" -ForegroundColor Green
Write-Host "Bereit für die Stakeholder-Demonstration!" -ForegroundColor Green 