# VALEO NeuroERP - n8n Setup Script (Vereinfacht)
Write-Host "🚀 VALEO NeuroERP - n8n Setup" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Prüfe Docker Installation
Write-Host "📋 Prüfe Docker Installation..." -ForegroundColor Yellow
try {
    docker --version | Out-Null
    Write-Host "✅ Docker ist installiert" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker ist nicht installiert. Bitte installieren Sie Docker Desktop." -ForegroundColor Red
    exit 1
}

# Prüfe Docker Compose
Write-Host "📋 Prüfe Docker Compose..." -ForegroundColor Yellow
try {
    docker-compose --version | Out-Null
    Write-Host "✅ Docker Compose ist verfügbar" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose ist nicht verfügbar." -ForegroundColor Red
    exit 1
}

# Erstelle Verzeichnisse
Write-Host "📋 Erstelle Verzeichnisse..." -ForegroundColor Yellow
$directories = @("n8n-flows", "generated-components", "logs")

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
        Write-Host "✅ Verzeichnis erstellt: $dir" -ForegroundColor Green
    } else {
        Write-Host "✅ Verzeichnis existiert: $dir" -ForegroundColor Green
    }
}

# Setze Environment Variables
Write-Host "📋 Setze Environment Variables..." -ForegroundColor Yellow
$env:OPENAI_API_KEY = "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"
$env:SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbXJmbmx0cGV2cWh3dXFtamp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0NzQ0NTcsImV4cCI6MjA2MTA1MDQ1N30.S-n-zv2PwUSLHuY5St9ZNJpS_IcUTBhDslngs6G9eIU"
$env:SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbXJmbmx0cGV2cWh3dXFtamp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTQ3NDQ1NywiZXhwIjoyMDYxMDUwNDU3fQ.lGmvqPjFrBvIjbkwY8C4hQx4XtTzRUuQzV-t89SPHN4"

Write-Host "✅ Environment Variables gesetzt" -ForegroundColor Green

# Starte Docker Compose
Write-Host "🚀 Starte Docker Compose Services..." -ForegroundColor Yellow
Write-Host "📋 Dies kann einige Minuten dauern..." -ForegroundColor Blue

try {
    docker-compose up -d
    Write-Host "✅ Docker Compose Services gestartet" -ForegroundColor Green
} catch {
    Write-Host "❌ Fehler beim Starten der Docker Compose Services" -ForegroundColor Red
    Write-Host "💡 Versuchen Sie: docker-compose logs" -ForegroundColor Yellow
    exit 1
}

# Warte auf Services
Write-Host "⏳ Warte auf Services..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Zeige nützliche URLs
Write-Host "`n🌐 Nützliche URLs:" -ForegroundColor Cyan
Write-Host "   n8n Dashboard:     http://localhost:5678" -ForegroundColor White
Write-Host "   Schema MCP API:    http://localhost:8000" -ForegroundColor White
Write-Host "   UI Metadata API:   http://localhost:8001" -ForegroundColor White
Write-Host "   PostgreSQL:        localhost:5432" -ForegroundColor White

# Zeige nützliche Befehle
Write-Host "`n🔧 Nützliche Befehle:" -ForegroundColor Cyan
Write-Host "   Docker Compose Logs:     docker-compose logs -f" -ForegroundColor White
Write-Host "   Services stoppen:        docker-compose down" -ForegroundColor White
Write-Host "   Services neu starten:    docker-compose restart" -ForegroundColor White
Write-Host "   n8n Container Logs:      docker logs valeo-n8n" -ForegroundColor White

# Zeige API-Keys Status
Write-Host "`n🔑 API-Keys Status:" -ForegroundColor Cyan
Write-Host "   OpenAI API Key:     ✅ Konfiguriert" -ForegroundColor Green
Write-Host "   Supabase Anon Key:  ✅ Konfiguriert" -ForegroundColor Green
Write-Host "   Supabase Service:   ✅ Konfiguriert" -ForegroundColor Green

# Zeige nächste Schritte
Write-Host "`n📋 Nächste Schritte:" -ForegroundColor Cyan
Write-Host "   1. Öffnen Sie http://localhost:5678 und loggen Sie sich ein" -ForegroundColor White
Write-Host "   2. Login: admin / valeo2024" -ForegroundColor White
Write-Host "   3. Importieren Sie den Dual MCP Workflow" -ForegroundColor White
Write-Host "   4. Testen Sie die MCP-Server APIs" -ForegroundColor White

Write-Host "`n🎉 Setup abgeschlossen!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green 