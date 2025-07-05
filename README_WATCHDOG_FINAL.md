# Watchdog-System für das AI-Driven ERP-System - Finale Dokumentation

Diese Dokumentation beschreibt das implementierte Watchdog-Überwachungssystem und enthält wichtige Hinweise zur Fehlerbehebung.

## Systemübersicht

Das Watchdog-System ist ein robustes Fallback-System für das AI-Driven ERP, das aus mehreren Komponenten besteht:

1. **Zentrales Startskript** (`start_erp_system.ps1`): Koordiniert den Start aller Komponenten
2. **Watchdog-Skript** (`backend/watchdog.ps1`): Überwacht den Backend-Prozess und startet ihn bei Bedarf neu
3. **Logger-System** (`backend/watchdog_logger.ps1`): Protokolliert alle Aktivitäten
4. **Backend-Starter** (`backend/start_backend.ps1`): Startet den Backend-Server mit korrekten Importpfaden
5. **Status-API** (`backend/app/api/v1/endpoints/status.py`): Liefert detaillierte Systeminformationen
6. **Frontend-Komponente** (`frontend/src/components/SystemStatus.tsx`): Visualisiert den Systemstatus

## Implementierte Funktionen

- **Automatischer Neustart**: Erkennung von hängenden oder abgestürzten Backend-Prozessen
- **Robust gegenüber Importfehlern**: Fallback-Mechanismen für verschiedene Python-Importpfade
- **Detaillierte Protokollierung**: Umfangreiche Logs für Fehleranalyse
- **Ressourcenüberwachung**: Überwachung von CPU, RAM und Festplatte
- **Konfigurierbare Parameter**: Anpassbare Timeouts, Prüfintervalle und Neustart-Limits
- **Fehlerbehebung**: Automatische Problemerkennung und -behebung

## Bekannte Probleme und Lösungen

Während der Implementierung wurden mehrere kritische Probleme identifiziert und gelöst:

### Problem 1: Python-Importpfade

Das Backend-Skript hatte Probleme mit der korrekten Auflösung von Importpfaden.

**Lösung**: 
- Implementierung eines Fallback-Importmechanismus in `main.py`
- Umfassende PYTHONPATH-Einstellung mit mehreren alternativen Pfaden
- Try-Except-Blöcke für alternative Import-Varianten

### Problem 2: PowerShell-Prozesssteuerung

Die PowerShell-Prozesssteuerung hatte Schwierigkeiten bei der zuverlässigen Erkennung und Steuerung von Prozessen.

**Lösung**:
- Verbesserte Prozessüberwachung mit expliziten Prüfungen
- Verzögerungen zwischen Prozessstart und -überwachung
- Aufräummechanismus für verwaiste Prozesse

### Problem 3: Kommunikation zwischen Prozessen

Die Kommunikation zwischen Watchdog und Backend war unzuverlässig.

**Lösung**:
- Robustere Health-Check-Mechanismen mit Wiederholungsversuchen
- Optimierte Timeouts für HTTP-Anfragen
- Verbesserte Fehlerbehandlung für Netzwerkkommunikation

## Ultimatives Testskript

Das `start_test_backend.ps1`-Skript wurde als umfassende Lösung entwickelt, um das Backend zuverlässig zu starten:

1. Beendet alle potenziell störenden Prozesse
2. Setzt den PYTHONPATH mit mehreren alternativen Pfaden
3. Aktiviert virtuelle Umgebungen, falls vorhanden
4. Überprüft Python-Module und installiert fehlende Abhängigkeiten
5. Führt Syntax- und Importtests durch
6. Startet den Server mit mehreren Fallback-Methoden

## Richtlinien für den produktiven Einsatz

Für den Einsatz im Produktivbetrieb empfehlen wir:

1. **Höhere Stabilität**: Verwenden des stabilen Modus ohne Reload-Funktion
   ```powershell
   python -m uvicorn main:app --host 0.0.0.0 --port 8000
   ```

2. **Prozess-Isolation**: Verwendung eines dedizierten Service-Accounts für den Backend-Prozess

3. **Umfassendere Überwachung**: Integration mit externen Monitoring-Tools wie Prometheus/Grafana

4. **Automatischer Systemstart**: Einrichtung des Watchdogs als Windows-Service für automatischen Start beim Systemstart

## Fehlerdiagnose

Wenn der Backend-Server nicht startet oder der Watchdog nicht richtig funktioniert:

1. **Überprüfen Sie die Importpfade**:
   - Stellen Sie sicher, dass PYTHONPATH richtig gesetzt ist
   - Testen Sie die Imports manuell mit `python -c "import app.core.config"`

2. **Überprüfen Sie die Portbelegung**:
   - Führen Sie `netstat -ano | findstr ":8000"` aus, um zu prüfen, ob der Port bereits belegt ist
   - Beenden Sie blockierende Prozesse mit `Stop-Process -Id <PID> -Force`

3. **Überprüfen Sie die Python-Umgebung**:
   - Stellen Sie sicher, dass alle Abhängigkeiten installiert sind: `pip install -r requirements.txt`
   - Überprüfen Sie die Python-Version: `python --version`

4. **Überprüfen Sie die Logs**:
   - Schauen Sie in das `watchdog_logs`-Verzeichnis für detaillierte Fehlerinformationen
   - Starten Sie mit erhöhtem Debug-Level: `python -m uvicorn main:app --log-level debug`

## Abschließende Hinweise

Das implementierte Watchdog-System bietet eine robuste Grundlage für die kontinuierliche Verfügbarkeit des ERP-Systems. Durch die integrierten Fehlerbehandlungs- und Selbstheilungsmechanismen minimiert es Ausfallzeiten und verbessert die Systemstabilität erheblich.

Für die weitere Entwicklung empfehlen wir die Integration von E-Mail-Benachrichtigungen bei kritischen Fehlern und die Implementierung erweiterter Metriken zur langfristigen Leistungsüberwachung. 