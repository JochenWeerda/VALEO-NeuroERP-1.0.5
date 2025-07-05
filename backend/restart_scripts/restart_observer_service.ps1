# PowerShell-Skript zum Neustart des Observer-Service
# Wird bei Problemen mit dem Observer-Service verwendet

# Pfad zur aktuellen Arbeitsumgebung setzen
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = Split-Path -Parent (Split-Path -Parent $scriptPath)
Set-Location -Path $rootPath

Write-Host "Observer-Service wird neu gestartet..." -ForegroundColor Yellow

# Beende alle laufenden Instanzen des Observer-Service
$observerPorts = @(8010)
foreach ($port in $observerPorts) {
    try {
        $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
        if ($process) {
            Write-Host "Beende Prozess mit PID $process auf Port $port..." -ForegroundColor Red
            Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
        }
    } catch {
        Write-Host "Kein Prozess auf Port $port gefunden" -ForegroundColor Gray
    }
}

# Zusätzlich nach Python-Prozessen suchen, die den Observer ausführen
try {
    $pythonProcesses = Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*observer_service.py*" -or $_.CommandLine -like "*start_observer*" }
    foreach ($proc in $pythonProcesses) {
        Write-Host "Beende Python-Prozess mit PID $($proc.Id)..." -ForegroundColor Red
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    }
} catch {
    Write-Host "Keine Python-Prozesse für Observer-Service gefunden" -ForegroundColor Gray
}

# Warte kurz, um sicherzustellen, dass der Prozess beendet ist
Start-Sleep -Seconds 3

# Starte den Observer-Service neu im Hintergrund
Write-Host "Starte Observer-Service neu..." -ForegroundColor Green
$startScript = Join-Path -Path $rootPath -ChildPath "backend\start_observer.ps1"

# Prüfe, ob das Startskript existiert
if (Test-Path $startScript) {
    # Starte den Prozess in einem neuen PowerShell-Fenster
    Start-Process powershell -ArgumentList "-NoExit -File `"$startScript`"" -WindowStyle Normal
    Write-Host "Observer-Service-Startskript wurde aufgerufen: $startScript" -ForegroundColor Green
} else {
    Write-Host "Startskript nicht gefunden: $startScript" -ForegroundColor Red
    exit 1
}

# Warte kurz und prüfe, ob der Service gestartet wurde
Start-Sleep -Seconds 10
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8010/health" -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "Observer-Service wurde erfolgreich neu gestartet und antwortet auf Health-Checks" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "Observer-Service wurde gestartet, antwortet aber nicht korrekt (Status: $($response.StatusCode))" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "Observer-Service reagiert noch nicht auf Health-Checks, möglicherweise ist der Start noch nicht abgeschlossen" -ForegroundColor Yellow
    exit 1
} 