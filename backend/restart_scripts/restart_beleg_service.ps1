# PowerShell-Skript zum Neustart des Beleg-Service
# Wird vom Observer-Service aufgerufen, wenn der Service nicht mehr reagiert

# Pfad zur aktuellen Arbeitsumgebung setzen
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = Split-Path -Parent (Split-Path -Parent $scriptPath)
Set-Location -Path $rootPath

Write-Host "Beleg-Service wird neu gestartet..." -ForegroundColor Yellow

# Beende alle laufenden Instanzen des Beleg-Service
$belegPorts = @(8005)
foreach ($port in $belegPorts) {
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

# Warte kurz, um sicherzustellen, dass der Prozess beendet ist
Start-Sleep -Seconds 3

# Starte den Beleg-Service neu im Hintergrund
Write-Host "Starte Beleg-Service neu..." -ForegroundColor Green
$startScript = Join-Path -Path $rootPath -ChildPath "backend\start_beleg_service_311.ps1"

# Prüfe, ob das Startskript existiert
if (Test-Path $startScript) {
    # Starte den Prozess in einem neuen PowerShell-Fenster
    Start-Process powershell -ArgumentList "-NoExit -File `"$startScript`"" -WindowStyle Normal
    Write-Host "Beleg-Service-Startskript wurde aufgerufen: $startScript" -ForegroundColor Green
} else {
    Write-Host "Startskript nicht gefunden: $startScript" -ForegroundColor Red
    exit 1
}

# Warte kurz und prüfe, ob der Service gestartet wurde
Start-Sleep -Seconds 5
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8005/health" -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "Beleg-Service wurde erfolgreich neu gestartet und antwortet auf Health-Checks" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "Beleg-Service wurde gestartet, antwortet aber nicht korrekt (Status: $($response.StatusCode))" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "Beleg-Service reagiert noch nicht auf Health-Checks, möglicherweise ist der Start noch nicht abgeschlossen" -ForegroundColor Yellow
    exit 1
} 