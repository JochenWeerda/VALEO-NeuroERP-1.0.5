# VALEO NeuroERP - n8n Integration Test
# PowerShell Script zum Testen der n8n-Integration

Write-Host "🧪 VALEO NeuroERP - n8n Integration Test" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Funktion zum Testen von HTTP-Endpunkten
function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Name,
        [int]$Timeout = 10
    )
    
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec $Timeout
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $Name ist erreichbar: $Url" -ForegroundColor Green
            return $true
        } else {
            Write-Host "⚠️  $Name antwortet mit Status: $($response.StatusCode)" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "❌ $Name ist nicht erreichbar: $Url" -ForegroundColor Red
        Write-Host "   Fehler: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Funktion zum Testen von JSON-APIs
function Test-JsonAPI {
    param(
        [string]$Url,
        [string]$Name
    )
    
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec 10
        $json = $response.Content | ConvertFrom-Json
        
        if ($json) {
            Write-Host "✅ $Name API funktioniert: $Url" -ForegroundColor Green
            Write-Host "   Antwort: $($json | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
            return $true
        } else {
            Write-Host "⚠️  $Name API gibt keine gültige JSON-Antwort" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "❌ $Name API Fehler: $Url" -ForegroundColor Red
        Write-Host "   Fehler: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Prüfe Docker Services
Write-Host "📋 Prüfe Docker Services..." -ForegroundColor Yellow
try {
    $containers = docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    Write-Host "✅ Docker Services Status:" -ForegroundColor Green
    Write-Host $containers -ForegroundColor White
} catch {
    Write-Host "❌ Docker ist nicht verfügbar" -ForegroundColor Red
    exit 1
}

# Teste n8n Dashboard
Write-Host "`n📋 Teste n8n Dashboard..." -ForegroundColor Yellow
$n8nWorking = Test-Endpoint -Url "http://localhost:5678" -Name "n8n Dashboard"

# Teste MCP Server APIs
Write-Host "`n📋 Teste MCP Server APIs..." -ForegroundColor Yellow

# Schema MCP Server Tests
Write-Host "   Schema MCP Server:" -ForegroundColor Blue
$schemaHealth = Test-Endpoint -Url "http://localhost:8000/health" -Name "Schema MCP Health"
$schemaTables = Test-JsonAPI -Url "http://localhost:8000/api/schema/tables" -Name "Schema MCP Tables"

# UI Metadata MCP Server Tests
Write-Host "   UI Metadata MCP Server:" -ForegroundColor Blue
$uiHealth = Test-Endpoint -Url "http://localhost:8001/health" -Name "UI Metadata MCP Health"
$uiTables = Test-JsonAPI -Url "http://localhost:8001/api/ui/tables" -Name "UI Metadata MCP Tables"

# Teste Dual MCP Integration
Write-Host "`n📋 Teste Dual MCP Integration..." -ForegroundColor Yellow

if ($schemaTables -and $uiTables) {
    Write-Host "✅ Dual MCP Integration funktioniert" -ForegroundColor Green
    
    # Teste spezifische Tabelle
    Write-Host "   Teste 'invoices' Tabelle..." -ForegroundColor Blue
    $schemaInvoices = Test-JsonAPI -Url "http://localhost:8000/api/schema/invoices" -Name "Schema Invoices"
    $uiInvoices = Test-JsonAPI -Url "http://localhost:8001/api/ui/complete/invoices" -Name "UI Metadata Invoices"
    
    if ($schemaInvoices -and $uiInvoices) {
        Write-Host "✅ 'invoices' Tabelle ist vollständig konfiguriert" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Dual MCP Integration hat Probleme" -ForegroundColor Red
}

# Teste n8n Webhook (falls konfiguriert)
Write-Host "`n📋 Teste n8n Webhook..." -ForegroundColor Yellow
try {
    $webhookUrl = "http://localhost:5678/webhook/dual-mcp-test"
    $testData = @{
        table_name = "invoices"
        test = $true
        timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri $webhookUrl -Method POST -Body $testData -ContentType "application/json" -TimeoutSec 10
    Write-Host "✅ n8n Webhook funktioniert" -ForegroundColor Green
} catch {
    Write-Host "⚠️  n8n Webhook ist nicht konfiguriert oder nicht erreichbar" -ForegroundColor Yellow
}

# Teste Cursor.ai Integration (falls API-Key vorhanden)
Write-Host "`n📋 Teste Cursor.ai Integration..." -ForegroundColor Yellow
if ($env:CURSOR_API_KEY) {
    Write-Host "✅ Cursor.ai API Key ist konfiguriert" -ForegroundColor Green
    
    # Teste Cursor.ai API
    try {
        $headers = @{
            "Authorization" = "Bearer $env:CURSOR_API_KEY"
            "Content-Type" = "application/json"
        }
        
        $testPrompt = @{
            model = "gpt-4"
            messages = @(
                @{
                    role = "system"
                    content = "Du bist ein React-Entwickler."
                },
                @{
                    role = "user"
                    content = "Erstelle eine einfache React-Komponente."
                }
            )
            max_tokens = 100
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "https://api.cursor.sh/v1/chat/completions" -Method POST -Headers $headers -Body $testPrompt -TimeoutSec 10
        Write-Host "✅ Cursor.ai API funktioniert" -ForegroundColor Green
    } catch {
        Write-Host "❌ Cursor.ai API Fehler: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Cursor.ai API Key ist nicht konfiguriert" -ForegroundColor Yellow
    Write-Host "   Setzen Sie CURSOR_API_KEY in der .env Datei" -ForegroundColor White
}

# Teste Prompt-Templates
Write-Host "`n📋 Teste Prompt-Templates..." -ForegroundColor Yellow
$promptFiles = @(
    "cursor-prompts/generate-react-form-shadcn-mcp.md",
    "cursor-prompts/generate-react-table-shadcn-mcp.md"
)

foreach ($file in $promptFiles) {
    if (Test-Path $file) {
        Write-Host "✅ Prompt-Template gefunden: $file" -ForegroundColor Green
    } else {
        Write-Host "❌ Prompt-Template fehlt: $file" -ForegroundColor Red
    }
}

# Teste n8n Workflow
Write-Host "`n📋 Teste n8n Workflow..." -ForegroundColor Yellow
if (Test-Path "n8n-flows/dual-mcp-cursor-automation.json") {
    Write-Host "✅ n8n Workflow Datei gefunden" -ForegroundColor Green
    
    # Prüfe Workflow JSON
    try {
        $workflow = Get-Content "n8n-flows/dual-mcp-cursor-automation.json" | ConvertFrom-Json
        Write-Host "✅ n8n Workflow JSON ist gültig" -ForegroundColor Green
        Write-Host "   Workflow Name: $($workflow.name)" -ForegroundColor White
        Write-Host "   Anzahl Nodes: $($workflow.nodes.Count)" -ForegroundColor White
    } catch {
        Write-Host "❌ n8n Workflow JSON ist ungültig" -ForegroundColor Red
    }
} else {
    Write-Host "❌ n8n Workflow Datei fehlt" -ForegroundColor Red
}

# Zusammenfassung
Write-Host "`n📊 Test-Zusammenfassung:" -ForegroundColor Cyan
Write-Host "   n8n Dashboard:     $(if ($n8nWorking) { '✅' } else { '❌' })" -ForegroundColor White
Write-Host "   Schema MCP:        $(if ($schemaHealth) { '✅' } else { '❌' })" -ForegroundColor White
Write-Host "   UI Metadata MCP:   $(if ($uiHealth) { '✅' } else { '❌' })" -ForegroundColor White
Write-Host "   Dual MCP:          $(if ($schemaTables -and $uiTables) { '✅' } else { '❌' })" -ForegroundColor White

# Empfehlungen
Write-Host "`n💡 Empfehlungen:" -ForegroundColor Cyan
if (-not $n8nWorking) {
    Write-Host "   - Starten Sie n8n: docker-compose up -d n8n" -ForegroundColor White
}
if (-not $schemaHealth) {
    Write-Host "   - Starten Sie Schema MCP: docker-compose up -d schema-mcp-server" -ForegroundColor White
}
if (-not $uiHealth) {
    Write-Host "   - Starten Sie UI Metadata MCP: docker-compose up -d ui-metadata-mcp-server" -ForegroundColor White
}

Write-Host "`n🎉 Integration Test abgeschlossen!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green 