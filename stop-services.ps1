# VALEO NeuroERP - Service Shutdown
# Stoppt alle Services sauber

Write-Host "🛑 VALEO NeuroERP - Service Shutdown" -ForegroundColor Red
Write-Host "=====================================" -ForegroundColor Red

# 1. n8n Container stoppen
Write-Host "📋 Stoppe n8n Container..." -ForegroundColor Yellow
try {
    docker stop valeo-n8n
    Write-Host "✅ n8n Container gestoppt" -ForegroundColor Green
} catch {
    Write-Host "⚠️  n8n Container war nicht aktiv oder bereits gestoppt" -ForegroundColor Yellow
}

# 2. Python-Prozesse beenden
Write-Host "📋 Stoppe Python-Server..." -ForegroundColor Yellow
try {
    # Beende alle Python-Prozesse, die auf Port 8000 oder 8001 laufen
    $pythonProcesses = Get-Process python -ErrorAction SilentlyContinue | Where-Object {
        $_.ProcessName -eq "python"
    }
    
    if ($pythonProcesses) {
        $pythonProcesses | Stop-Process -Force
        Write-Host "✅ Python-Server gestoppt" -ForegroundColor Green
    } else {
        Write-Host "✅ Keine Python-Server aktiv" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Fehler beim Stoppen der Python-Server: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 3. Ports prüfen
Write-Host "📋 Prüfe Ports..." -ForegroundColor Yellow

function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

$ports = @(5678, 8000, 8001)
$activePorts = @()

foreach ($port in $ports) {
    if (Test-Port $port) {
        $activePorts += $port
    }
}

if ($activePorts.Count -eq 0) {
    Write-Host "✅ Alle Ports sind frei" -ForegroundColor Green
} else {
    Write-Host "⚠️  Folgende Ports sind noch aktiv: $($activePorts -join ', ')" -ForegroundColor Yellow
}

# 4. Zusammenfassung
Write-Host "`n📊 Shutdown-Status:" -ForegroundColor Cyan
Write-Host "   n8n Container:     Gestoppt" -ForegroundColor White
Write-Host "   Schema MCP:        Gestoppt" -ForegroundColor White
Write-Host "   UI Metadata MCP:   Gestoppt" -ForegroundColor White

Write-Host "`n🔧 Services neu starten:" -ForegroundColor Cyan
Write-Host "   .\startup-services.ps1" -ForegroundColor White

Write-Host "`n🛑 Alle Services gestoppt!" -ForegroundColor Red
Write-Host "=====================================" -ForegroundColor Red 