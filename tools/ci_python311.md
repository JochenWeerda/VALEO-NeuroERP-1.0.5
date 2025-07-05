# CI/CD-Konfiguration für Python 3.11

## Übersicht

Dieses Dokument beschreibt die CI/CD-Konfiguration für das AI-gesteuerte ERP-System mit Python 3.11. Diese Richtlinien gelten für alle Entwickler und automatisierten Prozesse.

## Build-Umgebung

- **Python-Version**: 3.11.x (empfohlen: 3.11.9)
- **Virtuelle Umgebung**: Verwende `.venv311` für die Python 3.11-Umgebung
- **Abhängigkeiten**: `requirements.txt` ist für Python 3.11 optimiert

## Build-Prozess

### 1. Umgebung vorbereiten

```powershell
# Windows
python -m venv .venv311
.\.venv311\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

```bash
# Linux/macOS
python -m venv .venv311
source .venv311/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 2. Tests ausführen

```powershell
# Minimaler Server-Test
.\.venv311\Scripts\activate
python backend\minimal_server.py --port 8005 & 
sleep 5
python test_api_client.py
```

### 3. Microservices starten und testen

```powershell
# Minimaler Server
.\start_beleg_service_311.ps1

# Observer-Service
.\start_observer_311.ps1

# Finance-Service
.\start_finance_311.ps1
```

## Bekannte Einschränkungen

- Parameter `--log-level` wird vom Minimal-Server nicht unterstützt
- Standard-Port für den Minimal-Server ist 8005 statt 8003

## Build-Artefakte

- Die Virtuelle Umgebung (`.venv311/`) sollte nicht in Versionskontrolle aufgenommen werden
- Optimierungs-Reports und Log-Dateien sollten archiviert werden

## Automatisierte Überprüfungen

Folgende Überprüfungen sollten für jeden Build durchgeführt werden:

1. Python 3.11-Version überprüfen
2. Abhängigkeiten installieren
3. Minimal-Server starten und API-Tests ausführen
4. Observer-Service starten und Metriken überprüfen
5. Finance-Service starten und Transaktions-API testen

## Hinweise für Entwickler

- Verwende immer die `.venv311`-Umgebung für die Entwicklung
- Teste Änderungen mit den mitgelieferten Start-Skripten
- Halte dich an die vorgegebenen Ports (8005, 8010, 8007) für die Dienste 