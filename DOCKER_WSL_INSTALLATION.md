# Docker Desktop und WSL 2 Installation

Diese Anleitung führt Sie durch die Installation von WSL 2 (Windows-Subsystem für Linux) und Docker Desktop auf Ihrem Windows-System.

## Voraussetzungen

- Windows 10 Version 1903 oder höher (Build 18362 oder höher) oder Windows 11
- 64-Bit-Prozessor mit SLAT (Second Level Address Translation)
- 4 GB RAM oder mehr
- BIOS-Virtualisierung muss aktiviert sein

## Installationsanleitung

Die Installation erfolgt in zwei Schritten und erfordert einen Neustart zwischen den Schritten.

### Schritt 1: WSL-Komponenten aktivieren

1. Öffnen Sie PowerShell als Administrator
2. Navigieren Sie zum Verzeichnis mit den Installationsskripten
3. Führen Sie das erste Skript aus:
   ```powershell
   .\docker_wsl_setup.ps1
   ```
4. Folgen Sie den Anweisungen auf dem Bildschirm
5. Wenn Sie dazu aufgefordert werden, starten Sie Ihren Computer neu

### Schritt 2: WSL 2 und Docker Desktop installieren

1. Nach dem Neustart öffnen Sie PowerShell erneut als Administrator
2. Navigieren Sie zum Verzeichnis mit den Installationsskripten
3. Führen Sie das zweite Skript aus:
   ```powershell
   .\docker_wsl_setup_teil2.ps1
   ```
4. Folgen Sie den Anweisungen auf dem Bildschirm
5. Die Installation wird automatisch durchgeführt

## Überprüfen der Installation

Nach Abschluss der Installation können Sie überprüfen, ob alles korrekt funktioniert:

1. Öffnen Sie Docker Desktop über das Startmenü
2. Akzeptieren Sie die Nutzungsbedingungen, wenn Sie dazu aufgefordert werden
3. Warten Sie, bis Docker Desktop vollständig gestartet ist
4. Öffnen Sie PowerShell oder eine Eingabeaufforderung und führen Sie aus:
   ```powershell
   docker --version
   wsl -l -v
   ```

Sie sollten die Docker-Version und eine Liste der installierten WSL-Distributionen mit Version 2 sehen.

## Finance-Microservice starten

Sobald Docker Desktop installiert ist, können Sie den Finance-Microservice auf zwei Arten starten:

### Methode 1: Mit dem Starter-Skript (empfohlen)

1. Öffnen Sie PowerShell (keine Administratorrechte erforderlich)
2. Navigieren Sie zum Verzeichnis mit den Skripten
3. Führen Sie das Starter-Skript aus:
   ```powershell
   .\finance-microservice-starten.ps1
   ```
4. Das Skript führt automatisch folgende Schritte aus:
   - Überprüft, ob Docker Desktop läuft und startet es bei Bedarf
   - Wechselt zum Finance-Microservice-Verzeichnis
   - Zeigt den Status vorhandener Container
   - Bietet an, vorhandene Container zu stoppen
   - Startet den Finance-Microservice mit Docker Compose
   - Zeigt die API-Endpoints des Services an

### Methode 2: Manuell über Kommandozeile

Alternativ können Sie den Service auch manuell starten:

1. Navigieren Sie zum Verzeichnis des Finance-Microservice:
   ```powershell
   cd finance-microservice
   ```

2. Starten Sie den Service mit Docker Compose:
   ```powershell
   docker-compose up -d
   ```

3. Überprüfen Sie, ob der Service läuft:
   ```powershell
   docker ps
   ```

4. Testen Sie den Service über die API:
   ```
   http://localhost:8005/health
   http://localhost:8005/api/v1/konten
   ```

5. Zum Stoppen des Services:
   ```powershell
   docker-compose down
   ```

## Fehlerbehebung

Falls Probleme auftreten:

- **WSL-Fehler**: Stellen Sie sicher, dass der Virtualisierungssupport im BIOS aktiviert ist
- **Docker Desktop startet nicht**: Starten Sie Ihren Computer neu und versuchen Sie es erneut
- **Berechtigungsprobleme**: Stellen Sie sicher, dass Sie als Administrator angemeldet sind oder Ihr Benutzer zur docker-users-Gruppe hinzugefügt wurde
- **Ubuntu-Installation schlägt fehl**: Versuchen Sie, Ubuntu manuell über den Microsoft Store zu installieren
- **Docker Compose nicht gefunden**: Falls Docker Compose nicht erkannt wird, starten Sie Docker Desktop neu oder führen Sie einen Neustart des Computers durch

## Weitere Informationen

- Docker Desktop Dokumentation: https://docs.docker.com/desktop/
- WSL Dokumentation: https://docs.microsoft.com/de-de/windows/wsl/
- Docker Compose Dokumentation: https://docs.docker.com/compose/ 