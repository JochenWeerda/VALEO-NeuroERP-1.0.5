# Docker und WSL Setup-Skript
# ------------------------------

Write-Host "Docker und WSL Setup beginnt..." -ForegroundColor Green

# Prüfe, ob PowerShell als Administrator ausgeführt wird
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "Dieses Skript muss als Administrator ausgeführt werden." -ForegroundColor Red
    Write-Host "Bitte starten Sie PowerShell als Administrator und führen Sie das Skript erneut aus." -ForegroundColor Red
    exit
}

# Aktivieren des WSL-Features
Write-Host "1. Aktiviere Windows-Subsystem für Linux..." -ForegroundColor Cyan
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# Aktivieren des VM-Plattform-Features (für WSL 2)
Write-Host "2. Aktiviere Virtual Machine Platform..." -ForegroundColor Cyan
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# Frage nach Neustart
$restart = Read-Host "Ein Neustart ist erforderlich, um mit der WSL 2-Installation fortzufahren. Jetzt neu starten? (j/n)"
if ($restart -eq "j") {
    Restart-Computer
    exit
}

Write-Host "Bitte starten Sie Ihren Computer neu und führen Sie dieses Skript erneut aus, um fortzufahren." -ForegroundColor Yellow
Write-Host "Nach dem Neustart wird die WSL 2 Linux-Kernel-Aktualisierung und Docker Desktop installiert." -ForegroundColor Yellow
exit

# Nach dem Neustart sollte dieser Teil ausgeführt werden (manuell erneut ausführen)
# ---------------------------------------------------------------------------------

Write-Host "3. Lade WSL 2 Linux-Kernel-Aktualisierung herunter..." -ForegroundColor Cyan
$wslUpdateUrl = "https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi"
$wslUpdateInstallerPath = "$env:TEMP\wsl_update_x64.msi"
Invoke-WebRequest -Uri $wslUpdateUrl -OutFile $wslUpdateInstallerPath -UseBasicParsing

Write-Host "4. Installiere WSL 2 Linux-Kernel-Aktualisierung..." -ForegroundColor Cyan
Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$wslUpdateInstallerPath`" /quiet" -Wait

# Setze WSL 2 als Standard
Write-Host "5. Setze WSL 2 als Standard-Version..." -ForegroundColor Cyan
wsl --set-default-version 2

# Lade Docker Desktop herunter
Write-Host "6. Lade Docker Desktop für Windows herunter..." -ForegroundColor Cyan
$dockerUrl = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
$dockerInstallerPath = "$env:TEMP\DockerDesktopInstaller.exe"
Invoke-WebRequest -Uri $dockerUrl -OutFile $dockerInstallerPath -UseBasicParsing

# Installiere Docker Desktop
Write-Host "7. Installiere Docker Desktop für Windows..." -ForegroundColor Cyan
Start-Process -FilePath $dockerInstallerPath -ArgumentList "install", "--quiet", "--accept-license" -Wait

Write-Host "Installation abgeschlossen. Docker Desktop wird jetzt gestartet." -ForegroundColor Green
Start-Process -FilePath "C:\Program Files\Docker\Docker\Docker Desktop.exe"

Write-Host "Bitte starten Sie Ihren Computer neu, um alle Änderungen zu übernehmen." -ForegroundColor Yellow 