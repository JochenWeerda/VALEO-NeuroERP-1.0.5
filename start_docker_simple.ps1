# VALEO NeuroERP - Docker Demo Start-Skript
# ================================================================

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "    VALEO NeuroERP - Docker Demo Start-Skript            " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Docker prüfen
Write-Host "1. DOCKER STATUS PRÜFEN" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Magenta

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "Docker ist nicht installiert oder nicht im PATH" -ForegroundColor Red
    Write-Host "Bitte installieren Sie Docker Desktop" -ForegroundColor Yellow
    exit 1
}

# Docker Desktop Status prüfen
Write-Host "Docker Version prüfen..." -ForegroundColor Yellow
docker version
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker Desktop läuft nicht" -ForegroundColor Red
    Write-Host "Bitte starten Sie Docker Desktop" -ForegroundColor Yellow
    exit 1
}

# 2. Alte Container stoppen
Write-Host "`n2. ALTE CONTAINER BEREINIGEN" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Magenta

Write-Host "Alte Container stoppen..." -ForegroundColor Yellow
docker-compose down
Write-Host "Docker System bereinigen..." -ForegroundColor Yellow
docker system prune -f

# 3. Images bauen
Write-Host "`n3. DOCKER IMAGES BAUEN" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Magenta

Write-Host "Docker Images bauen..." -ForegroundColor Yellow
docker-compose build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Image-Build fehlgeschlagen" -ForegroundColor Red
    exit 1
}

# 4. Services starten
Write-Host "`n4. SERVICES STARTEN" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Magenta

Write-Host "Services starten..." -ForegroundColor Yellow
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "Services konnten nicht gestartet werden" -ForegroundColor Red
    exit 1
}

# 5. Services warten
Write-Host "`n5. SERVICES WARTEN" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Magenta

Write-Host "Warte auf Services..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# 6. Status prüfen
Write-Host "`n6. SERVICE STATUS PRÜFEN" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Magenta

Write-Host "Service Status anzeigen..." -ForegroundColor Yellow
docker-compose ps

# 7. Browser öffnen
Write-Host "`n7. BROWSER ÖFFNEN" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Magenta

Start-Sleep -Seconds 5

try {
    Start-Process "chrome.exe" -ArgumentList "--new-window http://localhost"
    Write-Host "Chrome Browser geöffnet" -ForegroundColor Green
} catch {
    try {
        Start-Process "http://localhost"
        Write-Host "Standard-Browser geöffnet" -ForegroundColor Green
    } catch {
        Write-Host "Browser konnte nicht geöffnet werden" -ForegroundColor Red
        Write-Host "Öffnen Sie manuell: http://localhost" -ForegroundColor Yellow
    }
}

# 8. Demo-Informationen
Write-Host "`n8. DEMO-INFORMATIONEN" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Magenta

Write-Host "VALEO NeuroERP ist bereit für die Demonstration!" -ForegroundColor Green
Write-Host ""
Write-Host "Verfügbare Services:" -ForegroundColor Cyan
Write-Host "  • Frontend: http://localhost" -ForegroundColor White
Write-Host "  • Backend API: http://localhost/api" -ForegroundColor White
Write-Host "  • PostgreSQL: localhost:5432" -ForegroundColor White
Write-Host "  • Redis: localhost:6379" -ForegroundColor White
Write-Host ""
Write-Host "Demo-Credentials:" -ForegroundColor Cyan
Write-Host "  • Benutzername: admin" -ForegroundColor White
Write-Host "  • Passwort: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Features:" -ForegroundColor Cyan
Write-Host "  • Vollständiges ERP-System mit 12 Modulen" -ForegroundColor White
Write-Host "  • 440 Datenbank-Tabellen (100% L3-Abdeckung)" -ForegroundColor White
Write-Host "  • Deutsche Lokalisierung" -ForegroundColor White
Write-Host "  • Responsive Design" -ForegroundColor White
Write-Host ""
Write-Host "Verwaltung:" -ForegroundColor Cyan
Write-Host "  • Services stoppen: docker-compose down" -ForegroundColor White
Write-Host "  • Logs anzeigen: docker-compose logs -f" -ForegroundColor White
Write-Host "  • Status prüfen: docker-compose ps" -ForegroundColor White

Write-Host "`nDocker Demo erfolgreich gestartet!" -ForegroundColor Green
Write-Host "Bereit für die Stakeholder-Demonstration!" -ForegroundColor Green 