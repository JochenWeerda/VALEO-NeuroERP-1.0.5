# WSL Setup Teil 2
# ------------------------------

Write-Host "WSL Setup Teil 2 beginnt..." -ForegroundColor Green

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

# Installiere Ubuntu
Write-Host "4. Installiere Ubuntu..." -ForegroundColor Cyan
wsl --install -d Ubuntu

Write-Host "WSL 2 und Ubuntu wurden installiert." -ForegroundColor Green
Write-Host "Starten Sie nun Ubuntu, um die Einrichtung abzuschliessen." -ForegroundColor Green 