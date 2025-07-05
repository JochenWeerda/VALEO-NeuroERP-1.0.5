# Docker-Installationsskript für Windows
# Dieses Skript installiert Docker Desktop unter Windows
# Voraussetzungen: Windows 10/11 64-bit Pro, Enterprise oder Education mit Hyper-V aktiviert

Write-Host "Docker-Installationsskript für Windows" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Pfad für den Download
$dockerInstallerUrl = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
$downloadPath = "$env:TEMP\DockerDesktopInstaller.exe"

# Prüfen, ob Docker bereits installiert ist
Write-Host "Prüfe, ob Docker bereits installiert ist..." -ForegroundColor Cyan
$dockerInstalled = $false

try {
    $dockerVersion = Invoke-Expression "docker --version" -ErrorAction SilentlyContinue
    if ($dockerVersion) {
        Write-Host "Docker ist bereits installiert: $dockerVersion" -ForegroundColor Green
        $dockerInstalled = $true
    }
} catch {
    Write-Host "Docker ist nicht installiert." -ForegroundColor Yellow
}

if ($dockerInstalled) {
    Write-Host "Docker ist bereits installiert. Keine weitere Aktion erforderlich." -ForegroundColor Green
    exit 0
}

# Prüfen, ob WSL aktiviert ist
Write-Host "Prüfe WSL-Status..." -ForegroundColor Cyan
$wslEnabled = $false

try {
    $wslStatus = wsl --status 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "WSL ist aktiviert." -ForegroundColor Green
        $wslEnabled = $true
    }
} catch {
    Write-Host "WSL ist nicht aktiviert." -ForegroundColor Yellow
}

if (-not $wslEnabled) {
    Write-Host "WSL wird installiert und aktiviert..." -ForegroundColor Cyan
    try {
        # WSL aktivieren
        dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
        
        # Virtual Machine Platform aktivieren
        dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
        
        Write-Host "WSL wurde aktiviert. Ein Neustart wird empfohlen." -ForegroundColor Yellow
        $restartNow = Read-Host "Möchten Sie den Computer jetzt neu starten? (j/n)"
        if ($restartNow -eq "j") {
            Restart-Computer
            return
        }
    } catch {
        Write-Host "Fehler beim Aktivieren von WSL: $_" -ForegroundColor Red
        Write-Host "Bitte aktivieren Sie WSL manuell und führen Sie dieses Skript erneut aus." -ForegroundColor Red
        exit 1
    }
}

# Docker Desktop herunterladen
Write-Host "Lade Docker Desktop herunter..." -ForegroundColor Cyan
try {
    Invoke-WebRequest -Uri $dockerInstallerUrl -OutFile $downloadPath
    Write-Host "Download abgeschlossen." -ForegroundColor Green
} catch {
    Write-Host "Fehler beim Herunterladen von Docker Desktop: $_" -ForegroundColor Red
    exit 1
}

# Docker Desktop installieren
Write-Host "Installiere Docker Desktop..." -ForegroundColor Cyan
try {
    Start-Process -FilePath $downloadPath -ArgumentList "install", "--quiet", "--accept-license" -Wait
    Write-Host "Docker Desktop wurde installiert." -ForegroundColor Green
} catch {
    Write-Host "Fehler bei der Installation von Docker Desktop: $_" -ForegroundColor Red
    exit 1
}

# Aufräumen
Remove-Item $downloadPath -Force

# Docker starten
Write-Host "Starte Docker Desktop..." -ForegroundColor Cyan
try {
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    Write-Host "Docker Desktop wird gestartet. Bitte warten Sie einen Moment, bis Docker vollständig geladen ist." -ForegroundColor Green
} catch {
    Write-Host "Fehler beim Starten von Docker Desktop: $_" -ForegroundColor Red
    Write-Host "Bitte starten Sie Docker Desktop manuell." -ForegroundColor Yellow
}

Write-Host "`nInstallation abgeschlossen." -ForegroundColor Green
Write-Host "Sie können Docker mit dem Befehl 'docker --version' testen, nachdem Docker Desktop vollständig geladen ist." -ForegroundColor Cyan
Write-Host "Hinweis: Ein Neustart könnte erforderlich sein, wenn Sie Docker zum ersten Mal installieren." -ForegroundColor Yellow 