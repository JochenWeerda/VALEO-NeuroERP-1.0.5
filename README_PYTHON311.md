# AI-gesteuertes ERP mit Python 3.11

## Übersicht
Dieses Dokument beschreibt die Konfiguration und Verwendung des AI-gesteuerten ERP-Systems mit Python 3.11.

## Anforderungen
- Python 3.11.0 oder höher
- Windows 10/11, Linux oder macOS
- Mindestens 4 GB RAM und 1 GB freier Festplattenspeicher

## Installation

### 1. Python 3.11 installieren
Stellen Sie sicher, dass Python 3.11 auf Ihrem System installiert ist:

```bash
python --version
```

### 2. Virtuelle Umgebung erstellen
```powershell
# Windows
python -m venv .venv311

# Linux/macOS
python -m venv .venv311
```

### 3. Virtuelle Umgebung aktivieren
```powershell
# Windows
.\.venv311\Scripts\activate

# Linux/macOS
source .venv311/bin/activate
```

### 4. Abhängigkeiten installieren
```powershell
pip install -r requirements.txt
```

## Verwendung

### Minimalen Server starten
```powershell
# Windows
.\start_beleg_service_311.ps1

# Linux/macOS
./start_beleg_service_311.sh  # Muss noch erstellt werden
```

### Observer-Service starten
```powershell
# Windows
.\start_observer_311.ps1

# Linux/macOS
./start_observer_311.sh  # Muss noch erstellt werden
```

### API testen
```powershell
python test_api_client.py
```

## Bekannte Unterschiede zu Python 3.13

- Der minimale Server verwendet standardmäßig Port 8005 statt 8003
- Einige Kommandozeilenparameter werden anders gehandhabt
- Leichte Unterschiede in den Abhängigkeitsversionen

## Fehlerbehebung

### Virtuelles Environment

Wenn Probleme mit der virtuellen Umgebung auftreten, können Sie diese neu erstellen:

```powershell
# Windows
rmdir /s /q .venv311
python -m venv .venv311
.\.venv311\Scripts\activate
pip install -r requirements.txt
```

### Port-Konflikte

Wenn der Port 8005 bereits belegt ist, können Sie das Startskript bearbeiten und einen anderen Port wählen:

```powershell
# In start_beleg_service_311.ps1 ändern:
python backend\minimal_server.py --port 8008  # Beliebigen freien Port wählen
```

## Support

Bei Problemen wenden Sie sich an das Entwicklungsteam oder erstellen Sie ein Issue im Repository. 