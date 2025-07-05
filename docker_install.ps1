# Docker Desktop Installation
# ------------------------------

Write-Host "Docker Desktop Installation beginnt..." -ForegroundColor Green

# Lade Docker Desktop herunter
Write-Host "1. Lade Docker Desktop fuer Windows herunter..." -ForegroundColor Cyan
$dockerUrl = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
$dockerInstallerPath = "$env:TEMP\DockerDesktopInstaller.exe"
Invoke-WebRequest -Uri $dockerUrl -OutFile $dockerInstallerPath -UseBasicParsing

# Installiere Docker Desktop
Write-Host "2. Installiere Docker Desktop fuer Windows..." -ForegroundColor Cyan
Start-Process -FilePath $dockerInstallerPath -ArgumentList "install", "--quiet", "--accept-license" -Wait

Write-Host "Installation abgeschlossen. Docker Desktop wird jetzt gestartet." -ForegroundColor Green
Start-Process -FilePath "C:\Program Files\Docker\Docker\Docker Desktop.exe" 