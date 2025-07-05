# Docker und WSL Setup-Skript (Teil 2)
# ------------------------------

Write-Host "Docker und WSL Setup Teil 2 beginnt..." -ForegroundColor Green

# Prüfe, ob PowerShell als Administrator ausgeführt wird
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "Dieses Skript muss als Administrator ausgeführt werden." -ForegroundColor Red
    Write-Host "Bitte starten Sie PowerShell als Administrator und führen Sie das Skript erneut aus." -ForegroundColor Red
    exit
}

# Lade WSL 2 Linux-Kernel-Aktualisierung herunter
Write-Host "1. Lade WSL 2 Linux-Kernel-Aktualisierung herunter..." -ForegroundColor Cyan
$wslUpdateUrl = "https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi"
$wslUpdateInstallerPath = "$env:TEMP\wsl_update_x64.msi"
Invoke-WebRequest -Uri $wslUpdateUrl -OutFile $wslUpdateInstallerPath -UseBasicParsing

# Installiere WSL 2 Linux-Kernel-Aktualisierung
Write-Host "2. Installiere WSL 2 Linux-Kernel-Aktualisierung..." -ForegroundColor Cyan
Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$wslUpdateInstallerPath`" /quiet" -Wait

# Setze WSL 2 als Standard
Write-Host "3. Setze WSL 2 als Standard-Version..." -ForegroundColor Cyan
wsl --set-default-version 2

# Lade Docker Desktop herunter
Write-Host "4. Lade Docker Desktop für Windows herunter..." -ForegroundColor Cyan
$dockerUrl = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
$dockerInstallerPath = "$env:TEMP\DockerDesktopInstaller.exe"
Invoke-WebRequest -Uri $dockerUrl -OutFile $dockerInstallerPath -UseBasicParsing

# Installiere Docker Desktop
Write-Host "5. Installiere Docker Desktop für Windows..." -ForegroundColor Cyan
Start-Process -FilePath $dockerInstallerPath -ArgumentList "install", "--quiet", "--accept-license", "--backend=wsl-2" -Wait

# Installiere Ubuntu als WSL-Distribution
Write-Host "6. Installiere Ubuntu als WSL-Distribution..." -ForegroundColor Cyan
wsl --install -d Ubuntu

Write-Host "Installation abgeschlossen!" -ForegroundColor Green
Write-Host "Docker Desktop sollte automatisch gestartet werden." -ForegroundColor Green
Write-Host "Bei Problemen können Sie Docker Desktop manuell starten über das Startmenü." -ForegroundColor Yellow
Write-Host "Bitte beachten Sie, dass Sie möglicherweise Ihren Computer erneut neu starten müssen." -ForegroundColor Yellow 