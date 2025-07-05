# Test-Skript für die Auto-Restart-Funktionalität
# Dieses Skript führt einen einfachen Test der Neustart-Funktionalität durch

Write-Host "Test der Auto-Restart-Funktionalität für Microservices" -ForegroundColor Cyan
Write-Host "----------------------------------------------------" -ForegroundColor Cyan

# 1. Alle Python-Prozesse beenden
Write-Host "`n1. Bestehende Python-Prozesse beenden..." -ForegroundColor Yellow
taskkill /F /IM python.exe 2> $null
Start-Sleep -Seconds 3

# 2. Observer-Service starten
Write-Host "`n2. Observer-Service starten..." -ForegroundColor Yellow
$observerProcess = Start-Process powershell -ArgumentList "-NoExit -File .\backend\start_observer.ps1" -WindowStyle Normal -PassThru
Write-Host "   Observer-Prozess gestartet mit PID $($observerProcess.Id)" -ForegroundColor Green
Start-Sleep -Seconds 10

# 3. Überprüfen, ob der Observer läuft
Write-Host "`n3. Überprüfe Observer-Health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8010/health" -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "   Observer-Service läuft und antwortet auf Health-Checks" -ForegroundColor Green
    } else {
        Write-Host "   Observer-Service antwortet nicht korrekt (Status: $($response.StatusCode))" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   Observer-Service reagiert nicht auf Health-Checks" -ForegroundColor Red
    exit 1
}

# 4. Finance-Service starten
Write-Host "`n4. Finance-Service starten..." -ForegroundColor Yellow
$financeProcess = Start-Process powershell -ArgumentList "-NoExit -File .\backend\start_finance_311.ps1" -WindowStyle Normal -PassThru
Write-Host "   Finance-Prozess gestartet mit PID $($financeProcess.Id)" -ForegroundColor Green
Start-Sleep -Seconds 10

# 5. Überprüfen, ob der Finance-Service läuft
Write-Host "`n5. Überprüfe Finance-Service-Health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8007/health" -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "   Finance-Service läuft und antwortet auf Health-Checks" -ForegroundColor Green
    } else {
        Write-Host "   Finance-Service antwortet nicht korrekt (Status: $($response.StatusCode))" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   Finance-Service reagiert nicht auf Health-Checks" -ForegroundColor Red
    exit 1
}

# 6. Finance-Service beenden, um einen Ausfall zu simulieren
Write-Host "`n6. Finance-Service beenden, um Ausfall zu simulieren..." -ForegroundColor Yellow
try {
    $process = Get-NetTCPConnection -LocalPort 8007 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
    if ($process) {
        Write-Host "   Beende Prozess mit PID $process auf Port 8007..." -ForegroundColor Red
        Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
        Write-Host "   Finance-Service wurde beendet" -ForegroundColor Green
    } else {
        Write-Host "   Kein Prozess auf Port 8007 gefunden" -ForegroundColor Red
    }
} catch {
    Write-Host "   Fehler beim Beenden des Finance-Service: $_" -ForegroundColor Red
}

# 7. Warten und beobachten, ob der Observer den Ausfall erkennt und neu startet
Write-Host "`n7. Warte auf automatischen Neustart durch Observer..." -ForegroundColor Yellow
Write-Host "   (Der Observer prüft regelmäßig den Gesundheitszustand. Bitte warte 30-60 Sekunden)" -ForegroundColor Gray

$maxWaitTime = 60  # Sekunden
$startTime = Get-Date
$detected = $false

while ((Get-Date).Subtract($startTime).TotalSeconds -lt $maxWaitTime) {
    Write-Host "   Warte auf Neustart... ($(([int](Get-Date).Subtract($startTime).TotalSeconds))/$maxWaitTime Sekunden)" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8007/health" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "`n✅ Finance-Service wurde erfolgreich neu gestartet!" -ForegroundColor Green
            $detected = $true
            break
        }
    } catch {
        # Service noch nicht verfügbar, weiterwarten
    }
    
    Start-Sleep -Seconds 5
}

if (-not $detected) {
    Write-Host "`n❌ Der Finance-Service wurde nicht automatisch neu gestartet innerhalb der Wartezeit." -ForegroundColor Red
    Write-Host "   Mögliche Gründe:" -ForegroundColor Yellow
    Write-Host "   - Der Observer hat den Ausfall noch nicht erkannt (Schwellenwert für Fehler nicht erreicht)" -ForegroundColor Yellow
    Write-Host "   - Es gibt ein Problem mit der Auto-Restart-Funktionalität" -ForegroundColor Yellow
    Write-Host "   - Das Neustart-Skript konnte nicht ausgeführt werden" -ForegroundColor Yellow
}

Write-Host "`nTest abgeschlossen. Überprüfe die Observer-Logs für weitere Details." -ForegroundColor Cyan
Write-Host "Die letzten 10 Zeilen des Observer-Logs:" -ForegroundColor Cyan
if (Test-Path -Path "backend\observer.log") {
    Get-Content -Path "backend\observer.log" -Tail 10
} 
elseif (Test-Path -Path "observer.log") {
    Get-Content -Path "observer.log" -Tail 10
} 
else {
    Write-Host "Observer-Log nicht gefunden" -ForegroundColor Red
} 