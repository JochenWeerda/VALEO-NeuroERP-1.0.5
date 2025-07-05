# VALERO – Die NeuroERP

[![Python](https://img.shields.io/badge/Python-3.8%2B-blue.svg)](https://python.org)
[![Framework](https://img.shields.io/badge/Framework-VALERO-green.svg)](https://github.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **"Die nächste Generation KI-gestützter Warenwirtschaftssysteme"**

## 🧠 Bedeutung des Namens VALERO

VALERO ist ein Kunstwort, das symbolisch für die Kernkomponenten des Systems steht:

| Buchstabe | Bedeutung im Kontext des Systems |
|-----------|----------------------------------|
| V | Vernetzte Datenflüsse und Agenten |
| A | Automatisierung durch KI-Modelle (z.B. LangGraph, Cursor.ai) |
| L | Lernfähigkeit via RAG + Memory-Bank |
| E | Erweiterbarkeit über Microservices & MCP |
| R | Resilienz durch robuste Netzwerk- und Fehlerlogik |
| O | Orchestrierung durch GENXAIS-Multi-Pipeline-Systeme |

## 🧩 Was ist "Die NeuroERP"?

Der Zusatz "Die NeuroERP" beschreibt eine neue Generation von ERP-Systemen, die weit über klassische Buchhaltungs- oder Warenwirtschaftsfunktionen hinausgeht:

- Neuronale Netzwerke zur Entscheidungsfindung
- Multi-agentische Systeme (APM mit VAN/PLAN/CREATE...)
- Kontextsensitive Arbeitsweise durch Memory-Bank
- Selbstverbessernde Zyklen (GENXAIS) für iterative Weiterentwicklung

## 🔍 Ziel und Philosophie

VALERO – Die NeuroERP ist:

- 🧠 **Intelligent**: Durch RAG, LLMs und LangGraph
- 🔁 **Selbstverbessernd**: Via GENXAIS-Zyklus
- 🤝 **Kooperativ**: Multi-Agenten mit geteiltem Kontext
- 💡 **Adaptiv**: Lernt aus Nutzerverhalten, API-Flows und Systemereignissen
- 🌐 **Vernetzt**: REST/gRPC, MCP, Cloud-native oder lokal

## Hauptfunktionen

### 🤖 KI-Integration
- RAG-basierte Wissensverwaltung
- LangGraph für komplexe Entscheidungsprozesse
- Cursor.ai für intelligente Entwicklungsunterstützung

### 🔄 Multi-Agent-System
- APM-Methodologie (VAN → PLAN → CREATE → IMPLEMENT → REFLECT)
- Kontextbewusste Agentenkommunikation
- Memory-Bank für Wissenserhalt

### 📊 Selbstoptimierung
- GENXAIS-Zyklen zur kontinuierlichen Verbesserung
- Automatische Performance-Optimierung
- Lernende Systemanpassung

### 🛠 Technische Exzellenz
- Microservice-Architektur
- MCP (Multi-Context-Protocol) Integration
- Robuste Fehlerbehandlung und Resilienz

## Installation

### Voraussetzungen

- Python 3.8 oder höher
- Docker & Docker Compose
- MongoDB
- Redis

### Standardinstallation

```bash
# 1. Repository klonen
git clone https://github.com/IHR-USERNAME/VALEO-NeuroERP.git
cd VALEO-NeuroERP

# 2. Virtuelle Umgebung erstellen (empfohlen)
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

# 3. Abhängigkeiten installieren
pip install -r requirements.txt

# 4. Installation überprüfen
python -m backend.main --help
```

### Entwicklungsinstallation

```bash
# Installation im Entwicklungsmodus mit zusätzlichen Abhängigkeiten
pip install -e .
pip install -r requirements-dev.txt

# Tests ausführen
python -m pytest tests/

# Entwicklungsserver starten
python -m backend.main --debug
```

## Konfiguration

### 1. Konfigurationsdatei erstellen

```bash
# Beispielkonfiguration kopieren
cp config/default.example.py config/default.py
```

### 2. Konfiguration anpassen

Bearbeiten Sie `config/default.py`:

```python
{
    "mongodb": {
        "url": "mongodb://localhost:27017/",
        "database": "valeo_neuroerp",
        "username": "optional-benutzername",
        "password": "optional-passwort"
    },
    "redis": {
        "host": "localhost",
        "port": 6379,
        "db": 0
    },
    "api": {
        "host": "0.0.0.0",
        "port": 8000,
        "debug": False
    }
}
```

### 3. Umgebungsvariablen (Alternative)

```bash
# Umgebungsvariablen statt Konfigurationsdatei
export MONGODB_URL="mongodb://localhost:27017/"
export REDIS_HOST="localhost"
export API_PORT="8000"

# System-spezifische Einstellungen
export VALEO_DEBUG="false"
export VALEO_LOG_LEVEL="INFO"
```

## Monitoring

### Zugriff auf Monitoring-Tools

- Grafana: http://localhost:3000 (admin/admin)
- Prometheus: http://localhost:9090

### Wichtige Metriken

- API-Performance
- Datenbankoperationen
- Cache-Effizienz
- Systemressourcen
- Feature-Nutzung

## Entwicklung

### Code-Stil

```bash
# Code formatieren
black .
isort .

# Linting
flake8
```

### Tests

```bash
# Alle Tests ausführen
pytest

# Spezifische Tests
pytest tests/test_services.py
pytest tests/test_api.py
```

### Dokumentation

```bash
# Dokumentation generieren
python tools/generate_docs.py

# API-Dokumentation aktualisieren
python tools/update_api_docs.py
```

## Deployment

### Docker-Deployment

```bash
# Container bauen
docker build -t valeo-neuroerp .

# Container starten
docker run -d -p 8000:8000 valeo-neuroerp
```

### Monitoring-Stack

```bash
# Monitoring-Services starten
cd monitoring
docker-compose up -d
```

## Fehlerbehebung

### Bekannte Probleme

1. MongoDB-Verbindung:
   - MongoDB-Service-Status prüfen
   - Verbindungsstring in der Konfiguration überprüfen

2. Redis-Cache:
   - Redis-Service-Status prüfen
   - Cache-Konfiguration überprüfen

3. Monitoring:
   - Prometheus-Targets überprüfen
   - Grafana-Datenquellen überprüfen

### Logs

- Anwendung: `logs/app.log`
- Zugriff: `logs/access.log`
- Fehler: `logs/error.log`

### Support

Bei Problemen:
1. Logs überprüfen
2. Issue erstellen
3. Support kontaktieren

## Lizenz

MIT Lizenz - siehe [LICENSE](LICENSE) für Details.
