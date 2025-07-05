# Finance-Microservice Starter-Skript
# ------------------------------

Write-Host "Finance-Microservice wird gestartet..." -ForegroundColor Green

# Prüfe, ob Docker Desktop läuft
$dockerProcess = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue
if (-Not $dockerProcess) {
    Write-Host "Docker Desktop scheint nicht zu laufen. Versuche, Docker Desktop zu starten..." -ForegroundColor Yellow
    Start-Process -FilePath "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    
    # Warte, bis Docker gestartet ist
    Write-Host "Warte, bis Docker Desktop bereit ist..." -ForegroundColor Yellow
    $dockerRunning = $false
    $attempts = 0
    $maxAttempts = 30
    
    while (-Not $dockerRunning -and $attempts -lt $maxAttempts) {
        $attempts++
        Start-Sleep -Seconds 5
        
        try {
            $dockerStatus = docker info 2>&1
            if ($LASTEXITCODE -eq 0) {
                $dockerRunning = $true
                Write-Host "Docker Desktop ist jetzt bereit!" -ForegroundColor Green
            }
        } catch {
            Write-Host "Docker noch nicht bereit. Warte weiter..." -ForegroundColor Yellow
        }
    }
    
    if (-Not $dockerRunning) {
        Write-Host "Docker Desktop konnte nicht gestartet werden. Bitte starten Sie Docker Desktop manuell und versuchen Sie es erneut." -ForegroundColor Red
        exit 1
    }
}

# Wechsle zum Finance-Microservice-Verzeichnis
Set-Location -Path ".\finance-microservice"

# Zeige Status der Docker-Container
Write-Host "Status der aktuellen Docker-Container:" -ForegroundColor Cyan
docker ps -a

# Frage, ob vorhandene Container gestoppt werden sollen
$existingContainers = docker ps -q -f "name=finance"
if ($existingContainers) {
    $stopContainers = Read-Host "Es laufen bereits Container. Möchten Sie diese stoppen? (j/n)"
    if ($stopContainers -eq "j") {
        docker-compose down
        Write-Host "Vorhandene Container wurden gestoppt." -ForegroundColor Yellow
    }
}

# Starte den Finance-Microservice
Write-Host "Starte Finance-Microservice mit Docker Compose..." -ForegroundColor Cyan
docker-compose up -d

# Warte kurz, bis der Service gestartet ist
Start-Sleep -Seconds 5

# Zeige die laufenden Container
Write-Host "Laufende Container:" -ForegroundColor Cyan
docker ps

# Zeige Logs des Finance-Microservice
Write-Host "Logs des Finance-Microservice:" -ForegroundColor Cyan
docker logs $(docker ps -q -f "name=finance") --tail 20

Write-Host "Finance-Microservice wurde gestartet!" -ForegroundColor Green
Write-Host "Die API ist verfügbar unter:" -ForegroundColor Green
Write-Host "- http://localhost:8005/health" -ForegroundColor Green
Write-Host "- http://localhost:8005/api/v1/konten" -ForegroundColor Green
Write-Host "- http://localhost:8005/docs (API-Dokumentation)" -ForegroundColor Green

Write-Host "`nZum Stoppen des Services führen Sie aus: docker-compose down" -ForegroundColor Yellow 