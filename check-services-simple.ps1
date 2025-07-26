# VALEO NeuroERP - Service Status Check (Vereinfacht)
# Prüft den Status aller Services

Write-Host "VALEO NeuroERP - Service Status" -ForegroundColor Blue
Write-Host "===================================" -ForegroundColor Blue

# Funktion zum Testen eines Ports
function Test-Port {
    param([int]$Port, [string]$ServiceName)
    
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        Write-Host "OK $ServiceName (Port $Port): AKTIV" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "FEHLER $ServiceName (Port $Port): INAKTIV" -ForegroundColor Red
        return $false
    }
}

# Funktion zum Testen eines HTTP-Endpunkts
function Test-HTTPEndpoint {
    param([string]$Url, [string]$ServiceName)
    
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "OK ${ServiceName}: HTTP OK" -ForegroundColor Green
            return $true
        } else {
            Write-Host "WARNUNG ${ServiceName}: HTTP Status $($response.StatusCode)" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "FEHLER ${ServiceName}: HTTP Fehler" -ForegroundColor Red
        return $false
    }
}

# 1. Port-Tests
Write-Host "Port-Status:" -ForegroundColor Cyan
$portTests = @(
    @{ Port = 5678; Service = "n8n Dashboard" },
    @{ Port = 8000; Service = "Schema MCP Server" },
    @{ Port = 8001; Service = "UI Metadata MCP Server" }
)

$activeServices = 0
foreach ($test in $portTests) {
    if (Test-Port -Port $test.Port -ServiceName $test.Service) {
        $activeServices++
    }
}

# 2. HTTP-Tests
Write-Host "HTTP-Endpunkt-Tests:" -ForegroundColor Cyan
$httpTests = @(
    @{ Url = "http://localhost:5678"; Service = "n8n Dashboard" },
    @{ Url = "http://localhost:8000/api/health"; Service = "Schema MCP Health" },
    @{ Url = "http://localhost:8001/api/health"; Service = "UI Metadata MCP Health" },
    @{ Url = "http://localhost:8000/api/tables"; Service = "Schema MCP Tables" },
    @{ Url = "http://localhost:8001/ui/tables"; Service = "UI Metadata MCP Tables" }
)

$httpOk = 0
foreach ($test in $httpTests) {
    if (Test-HTTPEndpoint -Url $test.Url -Service $test.Service) {
        $httpOk++
    }
}

# 3. Docker-Container-Status
Write-Host "Docker-Container-Status:" -ForegroundColor Cyan
try {
    $containers = docker ps --filter "name=valeo-n8n" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    if ($containers -and $containers -notmatch "NAMES") {
        Write-Host "OK n8n Container laeuft:" -ForegroundColor Green
        Write-Host $containers -ForegroundColor White
    } else {
        Write-Host "FEHLER n8n Container laeuft nicht" -ForegroundColor Red
    }
} catch {
    Write-Host "FEHLER Docker nicht verfuegbar" -ForegroundColor Red
}

# 4. Python-Prozesse
Write-Host "Python-Prozesse:" -ForegroundColor Cyan
try {
    $pythonProcesses = Get-Process python -ErrorAction SilentlyContinue | Where-Object {
        $_.ProcessName -eq "python"
    }
    
    if ($pythonProcesses) {
        Write-Host "OK Python-Prozesse aktiv: $($pythonProcesses.Count)" -ForegroundColor Green
        $pythonProcesses | ForEach-Object {
            Write-Host "   PID: $($_.Id), CPU: $([math]::Round($_.CPU, 2))s" -ForegroundColor White
        }
    } else {
        Write-Host "FEHLER Keine Python-Prozesse aktiv" -ForegroundColor Red
    }
} catch {
    Write-Host "FEHLER Fehler beim Pruefen der Python-Prozesse" -ForegroundColor Red
}

# 5. Zusammenfassung
Write-Host "Status-Zusammenfassung:" -ForegroundColor Cyan
Write-Host "   Aktive Services:    $activeServices von $($portTests.Count)" -ForegroundColor White
Write-Host "   HTTP-Endpunkte:     $httpOk von $($httpTests.Count)" -ForegroundColor White

if ($activeServices -eq $portTests.Count -and $httpOk -eq $httpTests.Count) {
    Write-Host "Alle Services laufen perfekt!" -ForegroundColor Green
} elseif ($activeServices -gt 0) {
    Write-Host "Einige Services laufen, aber nicht alle" -ForegroundColor Yellow
} else {
    Write-Host "Keine Services aktiv" -ForegroundColor Red
}

# 6. Nützliche URLs
Write-Host "Verfuegbare URLs:" -ForegroundColor Cyan
Write-Host "   n8n Dashboard:     http://localhost:5678 (admin / valeo2024)" -ForegroundColor White
Write-Host "   Schema MCP API:    http://localhost:8000" -ForegroundColor White
Write-Host "   UI Metadata API:   http://localhost:8001" -ForegroundColor White

# 7. Nächste Schritte
Write-Host "Naechste Schritte:" -ForegroundColor Cyan
if ($activeServices -eq 0) {
    Write-Host "   Services starten:  .\startup-services.ps1" -ForegroundColor White
} else {
    Write-Host "   Services stoppen:  .\stop-services.ps1" -ForegroundColor White
    Write-Host "   Status erneut pruefen: .\check-services-simple.ps1" -ForegroundColor White
}

Write-Host "===================================" -ForegroundColor Blue 