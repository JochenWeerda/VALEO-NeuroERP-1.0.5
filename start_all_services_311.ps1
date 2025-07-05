# Start aller Dienste mit Python 3.11
# Aktiviere die virtuelle Umgebung
$ErrorActionPreference = "Stop"

Write-Host "Aktiviere Python 3.11 Umgebung..." -ForegroundColor Cyan
if (Test-Path ".venv311\Scripts\activate.ps1") {
    & .\.venv311\Scripts\activate.ps1
} else {
    Write-Host "Fehler: Virtuelle Umgebung nicht gefunden!" -ForegroundColor Red
    exit 1
}

# Verzeichnisse für Logs erstellen
if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
}

# Starte den minimalen Server im Hintergrund
Write-Host "Starte Minimalen Server..." -ForegroundColor Green
$minimalServer = Start-Process -FilePath "python" -ArgumentList "backend\minimal_server.py --port 8005" -RedirectStandardOutput "logs\minimal_server.log" -RedirectStandardError "logs\minimal_server_error.log" -PassThru -WindowStyle Hidden

# Starte den Observer-Service im Hintergrund
Write-Host "Starte Observer-Service..." -ForegroundColor Green
$observerService = Start-Process -FilePath "python" -ArgumentList "backend\start_observer_311_fixed.py --port 8010" -RedirectStandardOutput "logs\observer_service.log" -RedirectStandardError "logs\observer_service_error.log" -PassThru -WindowStyle Hidden

# Starte den Finance-Service im Hintergrund
Write-Host "Starte Finance-Service..." -ForegroundColor Green
$financeService = Start-Process -FilePath "python" -ArgumentList "backend\simple_finance_server.py --port 8007" -RedirectStandardOutput "logs\finance_service.log" -RedirectStandardError "logs\finance_service_error.log" -PassThru -WindowStyle Hidden

# Warte, bis die Dienste gestartet sind
Write-Host "Warte, bis alle Dienste gestartet sind..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Teste die Dienste
Write-Host "Teste Dienste..." -ForegroundColor Cyan

$testMinimalServer = $null
$testObserverService = $null
$testFinanceService = $null

try {
    $testMinimalServer = Invoke-WebRequest -Uri "http://localhost:8005/health" -UseBasicParsing
    Write-Host "Minimaler Server: OK (Status $($testMinimalServer.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "Minimaler Server: Fehler ($($_.Exception.Message))" -ForegroundColor Red
}

try {
    $testObserverService = Invoke-WebRequest -Uri "http://localhost:8010/health" -UseBasicParsing
    Write-Host "Observer-Service: OK (Status $($testObserverService.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "Observer-Service: Fehler ($($_.Exception.Message))" -ForegroundColor Red
}

try {
    $testFinanceService = Invoke-WebRequest -Uri "http://localhost:8007/health" -UseBasicParsing
    Write-Host "Finance-Service: OK (Status $($testFinanceService.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "Finance-Service: Fehler ($($_.Exception.Message))" -ForegroundColor Red
}

Write-Host "`nAlle Dienste wurden gestartet. Drücken Sie STRG+C, um alle Dienste zu beenden." -ForegroundColor Yellow

try {
    # Warte auf Benutzerabbruch
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    # Stoppe alle Prozesse beim Beenden
    Write-Host "`nBeende alle Dienste..." -ForegroundColor Yellow
    
    if ($minimalServer -ne $null -and -not $minimalServer.HasExited) {
        Stop-Process -Id $minimalServer.Id -Force
        Write-Host "Minimaler Server beendet." -ForegroundColor Cyan
    }
    
    if ($observerService -ne $null -and -not $observerService.HasExited) {
        Stop-Process -Id $observerService.Id -Force
        Write-Host "Observer-Service beendet." -ForegroundColor Cyan
    }
    
    if ($financeService -ne $null -and -not $financeService.HasExited) {
        Stop-Process -Id $financeService.Id -Force
        Write-Host "Finance-Service beendet." -ForegroundColor Cyan
    }
    
    Write-Host "Alle Dienste wurden beendet." -ForegroundColor Green
} 