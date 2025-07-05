# Finance Microservice

Ein leistungsstarker Microservice für Finanz- und Buchhaltungsfunktionen im ERP-System mit KI-Integration.

## Überblick

Der Finance Microservice ist Teil einer größeren ERP-Systemlandschaft und bietet spezialisierte Funktionen für Finanzbuchhaltung und Controlling. Der Service ist als eigenständiger Microservice konzipiert und kann sowohl als Teil des Gesamtsystems als auch unabhängig betrieben werden.

Besondere Merkmale:
- Vollständige REST-API für Finanzfunktionen
- LLM-Integration für intelligente Buchungsvorschläge und Dokumentenanalyse
- Hochperformante Datenbankschicht mit Caching-Mechanismen
- Flexible Skalierbarkeit und Ausfallsicherheit durch Microservice-Architektur
- Umfassendes Monitoring und Observability

## Funktionalitäten

### Kernfunktionen

- **Kontenrahmen und Konten**: Verwaltung des Kontenplans (SKR03/SKR04) und Konten
- **Buchungen und Belege**: Erfassung und Verwaltung von Finanztransaktionen
- **Finanzberichte**: Bilanz, GuV, Kostenstellenberichte
- **Steuerberechnungen**: Automatische MwSt-Berechnung und -Verwaltung
- **Dokumentenmanagement**: Speicherung und Verwaltung von Belegen und Rechnungen

### KI-Funktionen

- **Buchungsvorschläge**: Automatische Kontierungsvorschläge basierend auf Transaktionsdaten
- **Dokumentenanalyse**: Extraktion von Finanzdaten aus Belegen und Rechnungen
- **Anomalieerkennung**: Identifikation ungewöhnlicher Transaktionen
- **Finanzprognosen**: Vorhersage finanzieller Entwicklungen

## Technologiestack

- **Backend**: Python 3.10+, FastAPI, SQLAlchemy
- **Datenbank**: PostgreSQL
- **Caching**: Redis
- **LLM-Integration**: OpenAI, Anthropic, Lokale LLMs (llama.cpp)
- **Containerisierung**: Docker, Docker Compose
- **Monitoring**: Prometheus, Structlog

## Installation und Betrieb

### Voraussetzungen

- Docker und Docker Compose
- Python 3.10+ (für lokale Entwicklung)
- Verfügbare Ports (Standard: 8005, 5435, 6380)

### Installation

1. Repository klonen:
```bash
git clone <repository-url>
cd finance-microservice
```

2. Umgebungsvariablen konfigurieren:
```bash
cp .env.example .env
# Umgebungsvariablen in .env anpassen
```

3. Mit Docker Compose starten:
```bash
docker-compose up -d
```

Für eine lokale Entwicklungsumgebung:
```bash
python -m venv venv
source venv/bin/activate  # oder venv\Scripts\activate auf Windows
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8005
```

### Konfiguration

Der Service wird über Umgebungsvariablen konfiguriert. Die wichtigsten sind:

| Variable | Beschreibung | Standard |
|----------|--------------|----------|
| `DATABASE_URL` | PostgreSQL-Verbindungs-URI | `postgresql://financeuser:financepassword@finance-db:5432/financedb` |
| `REDIS_URL` | Redis-Verbindungs-URI | `redis://finance-redis:6379/0` |
| `SECRET_KEY` | Schlüssel für JWT-Verschlüsselung | Zufällig generiert |
| `LOG_LEVEL` | Logging-Level (DEBUG, INFO, WARNING, ERROR) | INFO |
| `OPENAI_API_KEY` | OpenAI API-Schlüssel für LLM-Funktionen | - |
| `ANTHROPIC_API_KEY` | Anthropic API-Schlüssel (alternativ) | - |
| `LOCAL_LLM_URL` | URL des lokalen LLM-Servers (alternativ) | - |

### Verwendung der API

Die API-Dokumentation ist verfügbar unter:
- OpenAPI UI: http://localhost:8005/docs
- ReDoc: http://localhost:8005/redoc

Beispiel für eine Authentifizierung:
```bash
curl -X POST "http://localhost:8005/api/v1/auth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=password"
```

Beispiel für einen Kontovorschlag:
```bash
curl -X POST "http://localhost:8005/api/v1/llm/suggest-account" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Kauf von Büromaterial",
    "transaction_type": "expense",
    "amount": 119.0,
    "currency": "EUR"
  }'
```

## Entwicklung

### Projektstruktur

```
finance-microservice/
├── docker/                  # Docker-Konfigurationsdateien
├── docs/                    # Dokumentation
├── src/                     # Quellcode
│   ├── api/                 # API-Endpunkte
│   │   └── v1/              # API-Version 1
│   ├── core/                # Kernfunktionalitäten
│   ├── models/              # Datenmodelle
│   │   ├── domain/          # Domänenmodelle
│   │   └── schemas/         # API-Schemas (Pydantic)
│   ├── llm/                 # LLM-Integrationen
│   └── utils/               # Hilfsfunktionen
├── tests/                   # Tests
├── Dockerfile               # Dockerfile für den Service
├── docker-compose.yml       # Docker Compose-Konfiguration
├── requirements.txt         # Python-Abhängigkeiten
└── README.md                # Diese Datei
```

### Tests ausführen

```bash
# Unit-Tests
pytest tests/unit

# Integrationstests
pytest tests/integration

# Alle Tests mit Coverage-Report
pytest --cov=src tests/
```

## Integration mit anderen Microservices

Der Finance Microservice kann über folgende Methoden mit anderen Microservices kommunizieren:

1. **REST-API**: Standardmäßige HTTP-Kommunikation
2. **Event-basiert**: Asynchrone Kommunikation über Redis Pub/Sub oder einen Message Broker
3. **Observer-Service**: Integration mit dem zentralen Observer-Service für Service Discovery

### Beispiel für die Konfiguration im ERP-System

In der Docker Compose-Datei des Hauptsystems:

```yaml
services:
  finance-service:
    image: finance-microservice:latest
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/financedb
      - REDIS_URL=redis://redis:6379/0
      - OBSERVER_SERVICE_URL=http://observer-service:8010/register
    networks:
      - erp-network
```

## LLM-Integration

Der Service unterstützt verschiedene LLM-Provider:

1. **OpenAI**: Standard-Provider für Produktion
2. **Anthropic**: Alternative für spezielle Anwendungsfälle
3. **Lokale LLMs**: Für Datenschutz und Offline-Betrieb

Die LLM-Provider können zur Laufzeit gewechselt werden, mit automatischem Fallback bei Nichtverfügbarkeit.

## Lizenz

Copyright © 2023-2025

Alle Rechte vorbehalten. 