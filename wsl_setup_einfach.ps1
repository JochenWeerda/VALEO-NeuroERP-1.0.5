# Einfaches WSL Setup-Skript
# ------------------------------

Write-Host "WSL Setup beginnt..." -ForegroundColor Green

# Aktivieren des WSL-Features
Write-Host "1. Aktiviere Windows-Subsystem fuer Linux..." -ForegroundColor Cyan
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# Aktivieren des VM-Plattform-Features (fuer WSL 2)
Write-Host "2. Aktiviere Virtual Machine Platform..." -ForegroundColor Cyan
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

Write-Host "3. Bitte starten Sie Ihren Computer neu und fuehren Sie Teil 2 des Skripts nach dem Neustart aus." -ForegroundColor Yellow 