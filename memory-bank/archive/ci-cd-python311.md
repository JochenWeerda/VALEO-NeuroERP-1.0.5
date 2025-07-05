# CI/CD-Einrichtung für Python 3.11

## Übersicht
Dieses Dokument beschreibt die CI/CD-Einrichtung für das AI-gesteuerte ERP-System mit Python 3.11. Die Einrichtung umfasst automatisierte Tests, Berichte und Deployment-Schritte.

## Komponenten

### 1. CI/CD-Pipeline-Skript
Das Skript `tools/ci_pipeline.py` ist das Herzstück der CI/CD-Pipeline und umfasst folgende Funktionen:

- **Umgebungsprüfung**: Überprüft, ob Python 3.11 installiert ist
- **Virtuelle Umgebung**: Erstellt und konfiguriert eine virtuelle Umgebung für Python 3.11
- **Abhängigkeiten**: Installiert alle notwendigen Abhängigkeiten aus `requirements.txt`
- **Tests**: Führt automatisierte Tests für die Kernkomponenten durch
- **Berichterstellung**: Generiert einen detaillierten Bericht über den Build-Prozess

Das Skript kann mit verschiedenen Parametern aufgerufen werden:
- `--skip-tests`: Überspringt die Tests
- `--report-only`: Erstellt nur einen Bericht, ohne Tests auszuführen

### 2. Start-Skripte für alle Dienste
Die Skripte `start_all_services_311.ps1` (Windows) und `start_all_services_311.sh` (Linux/macOS) starten alle Dienste mit Python 3.11:

- **Minimaler Server**: Auf Port 8005
- **Observer-Service**: Auf Port 8010
- **Finance-Service**: Auf Port 8007

Die Skripte überwachen alle Dienste und beenden sie ordnungsgemäß, wenn der Benutzer STRG+C drückt.

### 3. Individuelle Service-Skripte
Für jeden Dienst gibt es individuelle Start-Skripte:

- `start_beleg_service_311.ps1`/`.sh`: Startet den minimalen Server
- `start_observer_311.ps1`/`.sh`: Startet den Observer-Service
- `start_finance_311.ps1`: Startet den Finance-Service

### 4. Angepasste Dienste für Python 3.11
- `backend/start_observer_311_fixed.py`: Angepasste Version des Observer-Service für Python 3.11

## CI/CD-Workflow

### 1. Lokaler Entwicklungsprozess
1. Entwickler nutzen die `.venv311`-Umgebung für die lokale Entwicklung
2. Tests werden vor jedem Commit mit `python tools/ci_pipeline.py` ausgeführt
3. Die Start-Skripte werden verwendet, um die Dienste lokal zu testen

### 2. Automatisierter Build-Prozess
1. Bei jedem Push wird die CI/CD-Pipeline ausgeführt
2. Python 3.11-Kompatibilität wird überprüft
3. Tests werden für alle Dienste ausgeführt
4. Ein Bericht wird generiert und gespeichert

### 3. Deployment-Prozess
1. Bei erfolgreichen Tests werden die Änderungen für das Deployment freigegeben
2. Die Start-Skripte werden verwendet, um die Dienste auf dem Zielserver zu starten
3. Die Dienste werden überwacht und bei Bedarf automatisch neu gestartet

## Port-Konfiguration
Für Python 3.11 werden folgende Ports verwendet:

| Dienst | Port |
|--------|------|
| Minimaler Server | 8005 |
| Observer-Service | 8010 |
| Finance-Service  | 8007 |

Diese Ports unterscheiden sich von den Ports für Python 3.13, um Konflikte zu vermeiden.

## Bekannte Einschränkungen
- Der Observer-Service verwendet eine angepasste Version des Start-Skripts, da die ursprüngliche Version nicht mit Python 3.11 kompatibel ist
- Der Parameter `--log-level` wird vom minimalen Server nicht unterstützt und wurde entfernt

## Checkliste für Entwickler
- [ ] Verwenden Sie immer die `.venv311`-Umgebung für die Entwicklung
- [ ] Führen Sie die CI/CD-Pipeline vor jedem Commit aus
- [ ] Testen Sie Ihre Änderungen mit allen Diensten
- [ ] Achten Sie auf die richtigen Ports für Python 3.11

## Nächste Schritte
1. Integration mit einem Continuous Integration-Server (GitHub Actions, Jenkins, etc.)
2. Automatisiertes Deployment nach erfolgreichen Tests
3. Performance-Vergleich zwischen Python 3.11 und 3.13 