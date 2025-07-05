# Manuelle Installation von WSL und Docker

Da die Skripte Administrator-Rechte benötigen, hier eine Anleitung zur manuellen Installation:

## 1. WSL aktivieren

1. Drücken Sie Windows + X und wählen Sie "Windows PowerShell (Administrator)" oder "Windows Terminal (Administrator)"
2. Führen Sie folgenden Befehl aus, um WSL zu aktivieren:

```powershell
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
```

3. Führen Sie folgenden Befehl aus, um die virtuellen Maschinen-Plattform zu aktivieren:

```powershell
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

4. Starten Sie Ihren Computer neu

## 2. WSL 2 Komponenten installieren

1. Laden Sie das WSL 2 Linux-Kernel-Update herunter und installieren Sie es:
   [WSL2 Linux Kernel Update (direkt)](https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi)

2. Öffnen Sie PowerShell als Administrator und setzen Sie WSL 2 als Standard:

```powershell
wsl --set-default-version 2
```

3. Installieren Sie Ubuntu:

```powershell
wsl --install -d Ubuntu
```

## 3. Docker Desktop installieren

1. Laden Sie Docker Desktop herunter:
   [Docker Desktop für Windows (direkt)](https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe)

2. Führen Sie das Docker Desktop-Installationsprogramm aus
3. Folgen Sie den Anweisungen des Installationsprogramms
4. Starten Sie Docker Desktop nach der Installation

## 4. Überprüfen der Installation

1. Prüfen Sie, ob WSL richtig installiert ist:

```powershell
wsl -l -v
```

2. Starten Sie Ubuntu:

```powershell
wsl -d Ubuntu
```

3. Öffnen Sie Docker Desktop und überprüfen Sie unter Einstellungen, ob die "Use the WSL 2 based engine" Option aktiviert ist

## 5. Starten des Finance-Microservice

1. Öffnen Sie PowerShell und navigieren Sie zum Finance-Microservice-Verzeichnis:

```powershell
cd C:\AI_driven_ERP\AI_driven_ERP\finance-microservice
```

2. Starten Sie den Microservice mit Docker Compose:

```powershell
docker-compose up -d
``` 