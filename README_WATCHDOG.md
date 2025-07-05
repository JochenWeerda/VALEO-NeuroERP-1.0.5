# Watchdog-System für das AI-Driven ERP-System

Dieses Dokument beschreibt das Watchdog-Überwachungssystem, das zur Sicherstellung der kontinuierlichen Verfügbarkeit des ERP-Systems entwickelt wurde.

## Übersicht

Das Watchdog-System ist ein robustes Fallback-System, das den Backend-Server kontinuierlich überwacht und bei Problemen automatisch neu startet. Es besteht aus mehreren Komponenten, die zusammenarbeiten, um die Systemstabilität zu gewährleisten.

### Hauptkomponenten

1. **Zentrales Startskript** (`start_erp_system.ps1`): Koordiniert den Start aller Systemkomponenten
2. **Watchdog-Skript** (`backend/watchdog.ps1`): Überwacht den Backend-Prozess und startet ihn bei Bedarf neu
3. **Logging-System** (`backend/watchdog_logger.ps1`): Protokolliert alle Aktivitäten des Watchdogs
4. **Backend-Starter** (`backend/start_backend.ps1`): Konfiguriert und startet den Backend-Server
5. **Status-API** (`backend/app/api/v1/endpoints/status.py`): Liefert Systeminformationen für Monitoring
6. **Frontend-Komponente** (`frontend/src/components/SystemStatus.tsx`): Visualisiert den Systemstatus

## Funktionsweise

### Start des Systems

1. Der Benutzer startet das System mit `.\start_erp_system.ps1`
2. Das Startskript initialisiert den Watchdog-Prozess im Backend-Verzeichnis
3. Der Watchdog startet den Backend-Server und beginnt mit der Überwachung
4. Optional wird auch das Frontend gestartet

### Überwachungsprozess

1. Der Watchdog prüft in regelmäßigen Intervallen (standardmäßig alle 15 Sekunden) die Gesundheit des Backends
2. Die Prüfung erfolgt über den `/health`-Endpunkt des Backends
3. Wenn der Server nicht reagiert, wird nach einem Timeout (standardmäßig 45 Sekunden) ein Neustart ausgelöst
4. Alle Aktivitäten werden protokolliert

### Fehlerbehebung

Der Watchdog kann den Backend-Server bis zu einer konfigurierbaren Anzahl von Malen (standardmäßig 5) neu starten. Wenn das Problem nach den maximalen Neustarts weiterhin besteht, beendet sich der Watchdog und protokolliert einen kritischen Fehler.

## Konfiguration

Das Watchdog-System kann über Parameter beim Start konfiguriert werden:

### Start_erp_system.ps1 Parameter

| Parameter | Beschreibung | Standardwert |
|-----------|--------------|--------------|
| `-BackendOnly` | Startet nur das Backend (mit Watchdog) | - |
| `-FrontendOnly` | Startet nur das Frontend | - |
| `-MaxRestarts` | Maximale Anzahl von Neustarts | 5 |
| `-CheckInterval` | Überprüfungsintervall in Sekunden | 15 |
| `-TimeoutThreshold` | Timeout in Sekunden, bevor ein Neustart ausgelöst wird | 45 |
| `-Debug` | Aktiviert detaillierte Debug-Ausgaben | false |

### Beispiele

```powershell
# Starte das komplette System mit Standardwerten
.\start_erp_system.ps1

# Starte nur das Backend mit angepassten Werten
.\start_erp_system.ps1 -BackendOnly -MaxRestarts 10 -CheckInterval 30 -TimeoutThreshold 60

# Starte nur das Frontend
.\start_erp_system.ps1 -FrontendOnly

# Starte mit Debug-Ausgaben
.\start_erp_system.ps1 -Debug
```

## Logs und Monitoring

### Log-Dateien

Das Watchdog-System erstellt Log-Dateien im Verzeichnis `watchdog_logs`. Die Logs enthalten detaillierte Informationen über:

- Start und Beendigung des Watchdogs
- Gesundheitsprüfungen des Backends
- Ressourcennutzung (CPU, RAM, Festplatte)
- Neustart-Ereignisse
- Fehler und Warnungen

### Echtzeit-Monitoring

Der Systemstatus kann in Echtzeit über zwei Wege überwacht werden:

1. **Backend API**: `http://localhost:8000/api/v1/system/status`
2. **Frontend-Komponente**: Systemstatus-Widget im Frontend

Die Status-API liefert detaillierte Informationen über:

- CPU-Auslastung
- Speichernutzung
- Festplattenspeicher
- Datenbankverbindung
- Antwortzeiten
- Prozessinformationen

## Fehlerbehandlung und Wartung

### Typische Probleme und Lösungen

| Problem | Mögliche Ursache | Lösung |
|---------|------------------|--------|
| Watchdog startet nicht | Fehlende Skriptdateien | Überprüfen Sie, ob alle Skriptdateien im richtigen Verzeichnis sind |
| Backend startet nicht | Importfehler oder fehlende Abhängigkeiten | Überprüfen Sie das Backend-Log für Details und installieren Sie fehlende Abhängigkeiten |
| Port-Konflikt | Port 8000 wird bereits verwendet | Beenden Sie andere Anwendungen, die diesen Port nutzen, oder ändern Sie den Port |
| Watchdog hängt | Prozess-Fehler | Beenden Sie den Watchdog-Prozess manuell und starten Sie ihn neu |

### Manuelle Neustarts

Im Falle eines kritischen Fehlers können Sie das System manuell neu starten:

1. Beenden Sie alle laufenden Prozesse mit `STRG+C`
2. Starten Sie das System mit `.\start_erp_system.ps1` neu

## Erweiterungsmöglichkeiten

Das Watchdog-System kann folgendermaßen erweitert werden:

1. **E-Mail-Benachrichtigungen**: Konfiguration von E-Mail-Benachrichtigungen bei kritischen Fehlern
2. **Erweiterte Metriken**: Sammlung und Visualisierung von Leistungsmetriken über längere Zeiträume
3. **Automatische Fehleranalyse**: Integration von KI-gestützter Fehleranalyse
4. **Load Balancing**: Erweiterung um mehrere Backend-Instanzen mit Load Balancing

## Technische Details

### Architektur

Das Watchdog-System verwendet eine mehrstufige Architektur:

1. **Hauptprozess**: `start_erp_system.ps1`
2. **Überwachungsprozess**: `watchdog.ps1`
3. **Backend-Prozess**: FastAPI-Server
4. **Logging-Prozess**: Protokollierungskomponente

Die Prozesse kommunizieren über HTTP-Endpoints und PowerShell-Prozessverwaltung.

### Sicherheitsüberlegungen

Das Watchdog-System wurde mit folgenden Sicherheitsaspekten entwickelt:

- Keine hartcodierten Passwörter oder Zugangsdaten
- Lokale Ausführung ohne externe Abhängigkeiten
- Begrenzte Neustartversuche zum Schutz vor Ressourcenerschöpfung
- Detaillierte Protokollierung für Audit-Zwecke

## Fazit

Das Watchdog-System bietet eine robuste Lösung zur Überwachung und automatischen Wiederherstellung des ERP-Systems. Durch kontinuierliche Überwachung und automatische Neustarts bei Problemen wird die Systemverfügbarkeit maximiert und Ausfallzeiten minimiert. 