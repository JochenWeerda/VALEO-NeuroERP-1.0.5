# VALEO NeuroERP Setup

## Voraussetzungen

- Python 3.8+
- Docker & Docker Compose
- MongoDB
- Redis

## Installation

1. Repository klonen:
```bash
git clone https://github.com/user/valeo-neuroerp.git
cd valeo-neuroerp
```

2. Python-Abhängigkeiten installieren:
```bash
pip install -e .
```

3. Monitoring-Stack starten:
```bash
cd monitoring
docker-compose up -d
```

4. Konfiguration anpassen:
- `config/default.py`: Grundeinstellungen
- `monitoring/prometheus/prometheus.yml`: Prometheus-Konfiguration
- `monitoring/grafana/dashboard.json`: Grafana-Dashboard

5. Anwendung starten:
```bash
python -m backend.main
```

## Monitoring

Zugriff auf:
- Grafana: http://localhost:3000 (admin/admin)
- Prometheus: http://localhost:9090

## Entwicklung

1. Entwicklungsumgebung:
```bash
python -m venv venv
source venv/bin/activate  # oder venv\Scripts\activate unter Windows
pip install -e ".[dev]"
```

2. Tests ausführen:
```bash
pytest
```

3. Linting:
```bash
flake8
black .
isort .
```

4. Dokumentation generieren:
```bash
python tools/generate_docs.py
```

## Deployment

1. Container bauen:
```bash
docker build -t valeo-neuroerp .
```

2. Container starten:
```bash
docker run -d -p 8000:8000 valeo-neuroerp
```

## Troubleshooting

### Bekannte Probleme

1. MongoDB-Verbindung:
- Prüfen ob MongoDB läuft
- Verbindungsstring in `config/default.py`

2. Redis-Cache:
- Redis-Service status
- Cache-Konfiguration

3. Monitoring:
- Prometheus Targets
- Grafana Datasources

### Logs

- Application: `logs/app.log`
- Access: `logs/access.log`
- Error: `logs/error.log`

### Support

Bei Problemen:
1. Logs prüfen
2. Issue erstellen
3. Support kontaktieren 