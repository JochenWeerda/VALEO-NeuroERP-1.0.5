# VALEO NeuroERP - n8n Setup Script
# PowerShell Script für n8n Installation und Konfiguration

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

# Verwende vorhandene API-Keys
Write-Host "📋 Verwende vorhandene API-Keys..." -ForegroundColor Yellow

# OpenAI API Key (aus server_fastmcp_mongodb.py)
$OPENAI_API_KEY = "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"

# Supabase Keys (aus config.env)
$SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbXJmbmx0cGV2cWh3dXFtamp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0NzQ0NTcsImV4cCI6MjA2MTA1MDQ1N30.S-n-zv2PwUSLHuY5St9ZNJpS_IcUTBhDslngs6G9eIU"
$SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbXJmbmx0cGV2cWh3dXFtamp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTQ3NDQ1NywiZXhwIjoyMDYxMDUwNDU3fQ.lGmvqPjFrBvIjbkwY8C4hQx4XtTzRUuQzV-t89SPHN4"

Write-Host "✅ OpenAI API Key gefunden" -ForegroundColor Green
Write-Host "✅ Supabase Keys gefunden" -ForegroundColor Green

# Erstelle n8n.env Datei falls nicht vorhanden
Write-Host "📋 Erstelle n8n.env Datei..." -ForegroundColor Yellow
if (!(Test-Path "n8n.env")) {
    Write-Host "🔧 Erstelle n8n.env Datei mit vorhandenen API-Keys..." -ForegroundColor Blue
    
    $envContent = @"
# VALEO NeuroERP n8n Environment Variables

# Supabase Configuration
SUPABASE_URL=https://ftybxxndembbfjdkcsuk.supabase.co
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
SUPABASE_PROJECT_ID=ftybxxndembbfjdkcsuk

# n8n Configuration
N8N_ENCRYPTION_KEY=your-32-character-encryption-key-here
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=valeo2024

# OpenAI API Key (bereits vorhanden)
OPENAI_API_KEY=$OPENAI_API_KEY

# Cursor AI Configuration (optional)
CURSOR_API_KEY=your_cursor_api_key_here

# Webhook Configuration (optional)
WEBHOOK_URL=https://your-webhook-url.com/notifications

# Email Configuration (optional)
N8N_SMTP_HOST=smtp.gmail.com
N8N_SMTP_PORT=587
N8N_SMTP_USER=your-email@gmail.com
N8N_SMTP_PASS=your-app-password
N8N_SMTP_SENDER=your-email@gmail.com

# MCP Server Configuration
MCP_SERVER_HOST=localhost
MCP_SERVER_PORT=8000
MCP_SERVER_DEBUG=true

# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/valeo_neuroerp

# Security
JWT_SECRET_KEY=valeo-neuroerp-jwt-secret-2024
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/mcp_server.log

# Cache Configuration
CACHE_TIMEOUT=300
CACHE_ENABLED=true

# Development
DEBUG=true
ENVIRONMENT=development
"@
    
    $envContent | Out-File -FilePath "n8n.env" -Encoding UTF8
    Write-Host "✅ n8n.env Datei erstellt" -ForegroundColor Green
} else {
    Write-Host "✅ n8n.env Datei existiert bereits" -ForegroundColor Green
}

# Erstelle Verzeichnisse
Write-Host "📋 Erstelle Verzeichnisse..." -ForegroundColor Yellow
$directories = @(
    "n8n-flows",
    "generated-components",
    "logs"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
        Write-Host "✅ Verzeichnis erstellt: $dir" -ForegroundColor Green
    } else {
        Write-Host "✅ Verzeichnis existiert: $dir" -ForegroundColor Green
    }
}

# Starte Docker Compose mit vorhandenen API-Keys
Write-Host "🚀 Starte Docker Compose Services..." -ForegroundColor Yellow
Write-Host "📋 Dies kann einige Minuten dauern..." -ForegroundColor Blue

try {
    # Setze Environment Variables für Docker Compose
    $env:OPENAI_API_KEY = $OPENAI_API_KEY
    $env:SUPABASE_ANON_KEY = $SUPABASE_ANON_KEY
    $env:SUPABASE_SERVICE_ROLE_KEY = $SUPABASE_SERVICE_ROLE_KEY
    
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

# Prüfe Service-Status
Write-Host "📋 Prüfe Service-Status..." -ForegroundColor Yellow

# Prüfe n8n
try {
    $n8nResponse = Invoke-WebRequest -Uri "http://localhost:5678" -TimeoutSec 10
    if ($n8nResponse.StatusCode -eq 200) {
        Write-Host "✅ n8n ist erreichbar unter: http://localhost:5678" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  n8n ist noch nicht bereit. Versuchen Sie es in einigen Minuten erneut." -ForegroundColor Yellow
}

# Prüfe Schema MCP Server
try {
    $schemaResponse = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 10
    if ($schemaResponse.StatusCode -eq 200) {
        Write-Host "✅ Schema MCP Server ist erreichbar unter: http://localhost:8000" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Schema MCP Server ist noch nicht bereit." -ForegroundColor Yellow
}

# Prüfe UI Metadata MCP Server
try {
    $uiResponse = Invoke-WebRequest -Uri "http://localhost:8001/health" -TimeoutSec 10
    if ($uiResponse.StatusCode -eq 200) {
        Write-Host "✅ UI Metadata MCP Server ist erreichbar unter: http://localhost:8001" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  UI Metadata MCP Server ist noch nicht bereit." -ForegroundColor Yellow
}

# Importiere n8n Workflow
Write-Host "📋 Importiere n8n Workflow..." -ForegroundColor Yellow
if (Test-Path "n8n-flows/dual-mcp-cursor-automation.json") {
    Write-Host "✅ n8n Workflow Datei gefunden" -ForegroundColor Green
    Write-Host "💡 Importieren Sie den Workflow manuell in n8n:" -ForegroundColor Blue
    Write-Host "   1. Öffnen Sie http://localhost:5678" -ForegroundColor White
    Write-Host "   2. Login mit: admin / valeo2024" -ForegroundColor White
    Write-Host "   3. Gehen Sie zu Workflows" -ForegroundColor White
    Write-Host "   4. Klicken Sie auf 'Import from file'" -ForegroundColor White
    Write-Host "   5. Wählen Sie: n8n-flows/dual-mcp-cursor-automation.json" -ForegroundColor White
} else {
    Write-Host "⚠️  n8n Workflow Datei nicht gefunden" -ForegroundColor Yellow
}

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
Write-Host "   Cursor API Key:     ⚠️  Optional (für Cursor.ai Integration)" -ForegroundColor Yellow

# Zeige nächste Schritte
Write-Host "`n📋 Nächste Schritte:" -ForegroundColor Cyan
Write-Host "   1. Öffnen Sie http://localhost:5678 und loggen Sie sich ein" -ForegroundColor White
Write-Host "   2. Importieren Sie den Dual MCP Workflow" -ForegroundColor White
Write-Host "   3. Testen Sie die MCP-Server APIs" -ForegroundColor White
Write-Host "   4. Verwenden Sie die Cursor.ai Prompt-Templates" -ForegroundColor White
Write-Host "   5. Führen Sie Integration-Tests aus: .\test-n8n-integration.ps1" -ForegroundColor White

Write-Host "`n🎉 Setup abgeschlossen!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green 