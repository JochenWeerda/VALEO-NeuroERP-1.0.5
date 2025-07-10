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

## Wichtiger Hinweis zu PyTorch (torch) und GPU-Unterstützung

Das Paket `torch` (PyTorch) wird standardmäßig als CPU-Version installiert. Für die meisten Entwicklungs- und Backend-Zwecke ist dies ausreichend und sorgt für einen stabilen Build – auch in Docker-Containern und auf Windows/WSL2.

**Falls GPU-Unterstützung benötigt wird:**
- Die Installation der GPU-Version von torch erfordert passende CUDA-Treiber und ein spezielles CUDA-Basis-Image im Dockerfile (z.B. `FROM nvidia/cuda:12.1.0-base`).
- Die Installation erfolgt dann z.B. mit `pip install torch==2.1.0+cu121` (je nach CUDA-Version).
- In Docker Desktop für Windows/WSL2 muss die GPU-Unterstützung explizit aktiviert und aktuelle NVIDIA-Treiber installiert sein.

**Empfehlung:**
- Für einen fehlerfreien Build im lokalen Kubernetes-Cluster und für Demos wird torch ohne CUDA installiert. Das System läuft dann auf CPU.
- GPU-Support kann bei Bedarf gezielt nachgerüstet werden.

Weitere Informationen: https://pytorch.org/get-started/locally/


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
