# VALEO NeuroERP - Service Startup (PowerShell)
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VALEO NeuroERP - Service Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starte Services..." -ForegroundColor Yellow
Write-Host ""

# 1. n8n Container starten
Write-Host "[1/3] Starte n8n Container..." -ForegroundColor Green
try {
    docker start valeo-n8n 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK: n8n Container gestartet" -ForegroundColor Green
    } else {
        Write-Host "Erstelle neuen n8n Container..." -ForegroundColor Yellow
        docker run -d --name valeo-n8n -p 5678:5678 `
            -e N8N_BASIC_AUTH_ACTIVE=true `
            -e N8N_BASIC_AUTH_USER=admin `
            -e N8N_BASIC_AUTH_PASSWORD=valeo2024 `
            -e OPENAI_API_KEY="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" `
            n8nio/n8n:latest
        Write-Host "OK: Neuer n8n Container erstellt" -ForegroundColor Green
    }
} catch {
    Write-Host "FEHLER: Docker nicht verfügbar" -ForegroundColor Red
}
Write-Host ""

# 2. Schema MCP Server starten (mit Fallback)
Write-Host "[2/3] Starte Schema MCP Server..." -ForegroundColor Green
Push-Location backend

$schemaServerStarted = $false

# Versuche verschiedene Schema Server
$schemaServers = @(
    @{ Name = "mcp_supabase_server.py"; Port = 8000 },
    @{ Name = "test_server.py"; Port = 8000 },
    @{ Name = "simple_mcp_server.py"; Port = 8000 }
)

foreach ($server in $schemaServers) {
    if (Test-Path $server.Name) {
        Write-Host "Verwende $($server.Name)..." -ForegroundColor Yellow
        try {
            Start-Process python -ArgumentList $server.Name -WindowStyle Hidden
            Start-Sleep -Seconds 5
            
            # Teste ob Server läuft
            $response = Invoke-WebRequest -Uri "http://localhost:$($server.Port)/api/tables" -TimeoutSec 5 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Host "OK: Schema MCP Server läuft auf Port $($server.Port)" -ForegroundColor Green
                $schemaServerStarted = $true
                break
            }
        } catch {
            Write-Host "WARNUNG: $($server.Name) konnte nicht gestartet werden" -ForegroundColor Yellow
        }
    }
}

if (-not $schemaServerStarted) {
    Write-Host "FEHLER: Kein Schema MCP Server konnte gestartet werden!" -ForegroundColor Red
    Write-Host "Verfügbare Dateien:" -ForegroundColor Yellow
    Get-ChildItem *.py | Where-Object { $_.Name -match "mcp|test|simple" } | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor Gray }
}

Pop-Location
Write-Host ""

# 3. UI Metadata MCP Server starten (mit Fallback)
Write-Host "[3/3] Starte UI Metadata MCP Server..." -ForegroundColor Green
Push-Location backend

$uiServerStarted = $false

# Versuche verschiedene UI Metadata Server
$uiServers = @(
    @{ Name = "ui_metadata_server.py"; Port = 8001 },
    @{ Name = "mcp_ui_metadata_server.py"; Port = 8001 }
)

foreach ($server in $uiServers) {
    if (Test-Path $server.Name) {
        Write-Host "Verwende $($server.Name)..." -ForegroundColor Yellow
        try {
            Start-Process python -ArgumentList $server.Name -WindowStyle Hidden
            Start-Sleep -Seconds 5
            
            # Teste ob Server läuft
            $response = Invoke-WebRequest -Uri "http://localhost:$($server.Port)/ui/tables" -TimeoutSec 5 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Host "OK: UI Metadata MCP Server läuft auf Port $($server.Port)" -ForegroundColor Green
                $uiServerStarted = $true
                break
            }
        } catch {
            Write-Host "WARNUNG: $($server.Name) konnte nicht gestartet werden" -ForegroundColor Yellow
        }
    }
}

if (-not $uiServerStarted) {
    Write-Host "FEHLER: Kein UI Metadata MCP Server konnte gestartet werden!" -ForegroundColor Red
    Write-Host "Verfügbare Dateien:" -ForegroundColor Yellow
    Get-ChildItem *.py | Where-Object { $_.Name -match "ui|metadata" } | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor Gray }
}

Pop-Location
Write-Host ""

# 4. Warte auf Services
Write-Host "Warte auf Services..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 5. Teste Services
Write-Host ""
Write-Host "Teste Services..." -ForegroundColor Yellow
Write-Host ""

# Teste Schema MCP Server
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/tables" -TimeoutSec 5
    Write-Host "OK: Schema MCP Server antwortet" -ForegroundColor Green
} catch {
    Write-Host "WARNUNG: Schema MCP Server antwortet nicht - versuche uvicorn..." -ForegroundColor Yellow
    try {
        Push-Location backend
        Start-Process python -ArgumentList "-c", "import uvicorn; from mcp_supabase_server import app; uvicorn.run(app, host='0.0.0.0', port=8000)" -WindowStyle Hidden
        Pop-Location
        Start-Sleep -Seconds 5
    } catch {
        Write-Host "FEHLER: Konnte Schema MCP Server nicht starten" -ForegroundColor Red
    }
}

# Teste UI Metadata MCP Server
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8001/ui/tables" -TimeoutSec 5
    Write-Host "OK: UI Metadata MCP Server antwortet" -ForegroundColor Green
} catch {
    Write-Host "WARNUNG: UI Metadata MCP Server antwortet nicht - versuche uvicorn..." -ForegroundColor Yellow
    try {
        Push-Location backend
        Start-Process python -ArgumentList "-c", "import uvicorn; from ui_metadata_server import app; uvicorn.run(app, host='0.0.0.0', port=8001)" -WindowStyle Hidden
        Pop-Location
        Start-Sleep -Seconds 5
    } catch {
        Write-Host "FEHLER: Konnte UI Metadata MCP Server nicht starten" -ForegroundColor Red
    }
}

# Teste n8n
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5678" -TimeoutSec 5
    Write-Host "OK: n8n Dashboard antwortet" -ForegroundColor Green
} catch {
    Write-Host "WARNUNG: n8n Dashboard antwortet nicht" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Service URLs:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "n8n Dashboard:     http://localhost:5678" -ForegroundColor White
Write-Host "Schema MCP API:    http://localhost:8000" -ForegroundColor White
Write-Host "UI Metadata API:   http://localhost:8001" -ForegroundColor White
Write-Host ""

Write-Host "Login fuer n8n: admin / valeo2024" -ForegroundColor Yellow
Write-Host ""

if ($schemaServerStarted -and $uiServerStarted) {
    Write-Host "Alle Services sind bereit!" -ForegroundColor Green
} else {
    Write-Host "WARNUNG: Nicht alle Services konnten gestartet werden!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Druecken Sie eine beliebige Taste, um zu beenden..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 