# VALEO-NeuroERP 2.0

Eine moderne ERP-Lösung mit KI-Integration, entwickelt mit Python, FastAPI und MongoDB.

## Features

- Benutzer-Authentifizierung und -Autorisierung
- Dokumenten-Management
- Workflow-Engine
- RAG (Retrieval-Augmented Generation)
- LangGraph-Integration
- Monitoring und Metriken
- REST API
- Docker-Support

## Technologie-Stack

- Python 3.9+
- FastAPI
- MongoDB
- Redis
- Prometheus
- Grafana
- Docker
- Kubernetes

## Installation

1. Repository klonen:
```bash
git clone https://github.com/username/VALEO-NeuroERP-2.0.git
cd VALEO-NeuroERP-2.0
```

2. Python Virtual Environment erstellen:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
.\venv\Scripts\activate   # Windows
```

3. Dependencies installieren:
```bash
pip install -r requirements.txt
```

4. Umgebungsvariablen konfigurieren:
```bash
cp .env.example .env
# .env-Datei anpassen
```

5. Datenbank initialisieren:
```bash
python scripts/init_db.py
```

## Entwicklung

1. API-Server starten:
```bash
uvicorn apps.api.main:app --reload
```

2. Worker starten:
```bash
python -m apps.worker.main
```

3. Tests ausführen:
```bash
pytest
```

## Docker

Mit Docker Compose starten:
```bash
docker-compose up -d
```

## API-Dokumentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Monitoring

- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000

## Verzeichnisstruktur

```
VALEO-NeuroERP-2.0/
├── apps/                  # Anwendungsmodule
│   ├── api/              # REST API
│   ├── web/              # Web-Frontend
│   └── worker/           # Background-Worker
├── core/                 # Kernfunktionalität
│   ├── models/           # Datenmodelle
│   ├── services/         # Business-Logik
│   └── utils/            # Hilfsfunktionen
├── data_integration/     # Datenintegration
│   ├── rag/              # RAG-System
│   ├── langgraph/        # LangGraph-Integration
│   └── mongodb/          # MongoDB-Integration
├── infrastructure/       # Infrastruktur
│   ├── docker/           # Docker-Konfiguration
│   ├── kubernetes/       # Kubernetes-Manifeste
│   └── terraform/        # Terraform-Module
└── tests/               # Tests
```

## Lizenz

MIT
