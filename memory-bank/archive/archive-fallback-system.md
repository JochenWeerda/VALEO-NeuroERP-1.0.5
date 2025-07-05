# Fallback-System: Automatisierte Überwachung und Wiederherstellung

## Übersicht

Das implementierte Fallback-System bietet eine robuste Lösung zur Überwachung und automatischen Wiederherstellung des ERP-Systems. Es erkennt Ausfälle oder Hänger des Backend-Servers und initiiert automatische Neustarts, während es gleichzeitig detaillierte Protokolle und Systemstatistiken erfasst.

## Architektur

Das System besteht aus mehreren Komponenten, die zusammenarbeiten:

1. **Watchdog-Prozess**: Überwacht kontinuierlich den Backend-Server und startet ihn bei Bedarf neu
2. **Logger-System**: Erfasst alle Ereignisse und Systemstatistiken in rotierbaren Protokolldateien
3. **Status-API**: Bietet detaillierte Systemstatistiken über REST-Endpunkte
4. **Frontend-Komponente**: Zeigt den Systemstatus in Echtzeit an
5. **Hauptstarter**: Zentrale Steuerung des gesamten ERP-Systems

## Implementierte Funktionen

### Watchdog-System

- **Gesundheitsüberprüfung**: Regelmäßige Überprüfung des `/health`-Endpunkts
- **Automatischer Neustart**: Automatisches Neustarten des Backends bei fehlender Reaktion
- **Konfigurierbare Parameter**: Anpassbare Intervalle, Timeouts und maximale Neustartzahlen
- **Farbkodierte Statusanzeigen**: Visuelle Darstellung des Systemzustands

### Logger-System

- **Detaillierte Protokollierung**: Erfassung aller relevanten Ereignisse und Systemstatistiken
- **Logrotation**: Automatische Rotation von Protokolldateien bei Größenüberschreitung
- **Saubere Trennung**: Verschiedene Schweregrade für unterschiedliche Ereignistypen
- **Analyse-Tools**: PowerShell-Befehle zur Analyse der Protokolldateien

### Status-API

- **Einfacher Gesundheitscheck**: `/health`-Endpunkt für Watchdog-Prozesse
- **Detaillierter Systemstatus**: `/api/v1/system/status`-Endpunkt mit umfassenden Informationen
- **Cache-Mechanismus**: Reduzierte Serverlast durch intelligente Zwischenspeicherung
- **Statistik-Reset**: Möglichkeit zum Zurücksetzen des Status-Cache

### Frontend-Komponente

- **Echtzeit-Statusanzeige**: Visuelle Darstellung des Systemzustands
- **Detaillierte Statistiken**: Anzeige von CPU, RAM und Datenbankstatistiken
- **Interaktive Elemente**: Möglichkeit zum manuellen Aktualisieren des Status
- **Responsive Design**: Passt sich an verschiedene Bildschirmgrößen an

### Hauptstarter

- **Zentrale Steuerung**: Einheitliche Schnittstelle zum Starten aller Komponenten
- **Flexible Optionen**: Möglichkeit, nur Backend oder Frontend zu starten
- **Robuste Fehlerbehandlung**: Umfassende Fehlerbehandlung und -meldungen
- **Abhängigkeitsprüfung**: Überprüfung und Installation fehlender Abhängigkeiten

## Technische Details

### Verwendete Technologien

- **PowerShell**: Primäre Skriptsprache für Watchdog und Logger
- **Python/FastAPI**: Backend-Server und Status-API
- **React/Material-UI**: Frontend-Komponenten für Statusanzeige
- **SQLite**: Datenbankanbindung und -überwachung

### Dateipfade

- `backend/watchdog.ps1`: Hauptwatchdog-Skript
- `backend/watchdog_logger.ps1`: Logger-System
- `backend/app/api/v1/endpoints/status.py`: Status-API
- `frontend/src/components/SystemStatus.tsx`: Frontend-Statuskomponente
- `start_erp_system.ps1`: Hauptstarter für das gesamte System

### API-Endpunkte

- `GET /health`: Einfacher Gesundheitscheck
- `GET /api/v1/system/status`: Detaillierter Systemstatus
- `GET /api/v1/system/status/reset-cache`: Zurücksetzen des Status-Cache

## Vorteile

1. **Verbesserte Zuverlässigkeit**: Automatische Wiederherstellung bei Systemabstürzen
2. **Transparente Überwachung**: Umfassende Einblicke in den Systemzustand
3. **Frühwarnsystem**: Erkennung potenzieller Probleme vor kritischen Ausfällen
4. **Reduzierte Ausfallzeiten**: Minimierung von Systemausfällen durch schnelle Reaktion
5. **Vereinfachte Fehlerbehebung**: Detaillierte Protokolle für die Fehleranalyse

## Fazit

Das implementierte Fallback-System bietet eine robuste Lösung zur Sicherstellung der Systemstabilität und -verfügbarkeit. Es kombiniert automatische Überwachung, Wiederherstellung und umfassende Protokollierung, um Ausfallzeiten zu minimieren und die Benutzererfahrung zu verbessern. Die modulare Architektur ermöglicht eine einfache Anpassung und Erweiterung, während die integrierten Überwachungstools wertvolle Einblicke in die Systemleistung bieten. 