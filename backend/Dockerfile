# VALEO NeuroERP Backend Dockerfile
FROM python:3.11-slim

# Arbeitsverzeichnis setzen
WORKDIR /app

# Systemabhängigkeiten (schlank halten)
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Logs-Verzeichnis für FileHandler sicherstellen
RUN mkdir -p /app/logs

# Requirements kopieren und installieren
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Anwendungen kopieren (gesamter Build-Kontext ./backend → /app/backend)
COPY . ./backend

# Env
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Port freigeben
EXPOSE 8000

# Health Check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Anwendung starten
CMD ["uvicorn", "backend.api.main:app", "--host", "0.0.0.0", "--port", "8000"] 