# WSL und Docker Installation

Diese Anleitung führt Sie durch die Installation von WSL 2 (Windows-Subsystem für Linux) und Docker Desktop auf Ihrem Windows-System.

## Installationsskripte

In diesem Verzeichnis finden Sie drei Skripte:

1. `wsl_setup_einfach.ps1` - Aktiviert die notwendigen Windows-Features für WSL
2. `wsl_setup_teil2.ps1` - Installiert den WSL 2 Linux-Kernel und Ubuntu
3. `docker_install.ps1` - Installiert Docker Desktop für Windows

## Installationsschritte

### Schritt 1: WSL-Komponenten aktivieren

1. Öffnen Sie PowerShell als Administrator
2. Navigieren Sie zum Verzeichnis mit den Installationsskripten
3. Führen Sie das erste Skript aus:
   ```powershell
   .\wsl_setup_einfach.ps1
   ```
4. Starten Sie Ihren Computer neu

### Schritt 2: WSL 2 Linux-Kernel und Ubuntu installieren

1. Öffnen Sie nach dem Neustart PowerShell als Administrator
2. Navigieren Sie zum Verzeichnis mit den Installationsskripten
3. Führen Sie das zweite Skript aus:
   ```powershell
   .\wsl_setup_teil2.ps1
   ```
4. Warten Sie, bis die Installation abgeschlossen ist

### Schritt 3: Docker Desktop installieren

1. Bleiben Sie in der PowerShell als Administrator
2. Führen Sie das dritte Skript aus:
   ```powershell
   .\docker_install.ps1
   ```
3. Warten Sie, bis die Installation abgeschlossen ist und Docker Desktop gestartet wird

## Überprüfen der Installation

Nach Abschluss der Installation können Sie überprüfen, ob alles korrekt installiert wurde:

1. Öffnen Sie eine neue PowerShell und führen Sie `wsl -l -v` aus, um zu prüfen, ob Ubuntu installiert ist und mit WSL Version 2 läuft
2. Öffnen Sie Docker Desktop und überprüfen Sie, ob es mit WSL 2 verbunden ist (unter Einstellungen)

## Starten des Finance-Microservice

Nach der Installation können Sie den Finance-Microservice starten:

1. Navigieren Sie zum Finance-Microservice-Verzeichnis:
   ```powershell
   cd C:\AI_driven_ERP\AI_driven_ERP\finance-microservice
   ```

2. Starten Sie den Microservice mit Docker Compose:
   ```powershell
   docker-compose up -d
   ``` 