# VALEO NeuroERP MCP Server Startup (Windows)
Write-Host "🚀 VALEO NeuroERP MCP Server starten..." -ForegroundColor Green

# Umgebungsvariablen laden
if (Test-Path "config.env") {
    Get-Content "config.env" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
    Write-Host "✅ Konfiguration geladen" -ForegroundColor Green
}

# Verzeichnisse erstellen
$directories = @("logs", "data", "cache", "temp")
foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
        Write-Host "✅ Verzeichnis $dir erstellt" -ForegroundColor Green
    }
}

# Dependencies prüfen
Write-Host "📦 Dependencies prüfen..." -ForegroundColor Yellow
try {
    python -c "import fastapi, uvicorn, supabase" 2>$null
    Write-Host "✅ Alle Dependencies verfügbar" -ForegroundColor Green
} catch {
    Write-Host "❌ Dependencies fehlen - Installiere..." -ForegroundColor Red
    pip install -r requirements.txt
}

# MCP Server starten
Write-Host "🌐 MCP Server starten auf http://localhost:8000" -ForegroundColor Cyan
Write-Host "📊 Health-Check: http://localhost:8000/api/health" -ForegroundColor Cyan
Write-Host "📋 Tabellen: http://localhost:8000/api/tables" -ForegroundColor Cyan
Write-Host "🗄️ Schema: http://localhost:8000/api/schema/invoices" -ForegroundColor Cyan
Write-Host ""
Write-Host "Drücke Ctrl+C zum Beenden" -ForegroundColor Yellow
Write-Host ""

python simple_mcp_server.py 