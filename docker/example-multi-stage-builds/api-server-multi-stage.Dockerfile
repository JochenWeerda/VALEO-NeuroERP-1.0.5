# Multi-Stage-Build Dockerfile für den API-Server
# Stage 1: Build-Stage
FROM python:3.11-slim AS builder

WORKDIR /app

# Umgebungsvariablen setzen
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Nur die Build-Abhängigkeiten installieren
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Kopiere nur die Anforderungsdatei und installiere Abhängigkeiten
COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt

# Stage 2: Runtime-Stage
FROM python:3.11-slim AS runtime

WORKDIR /app

# Umgebungsvariablen setzen
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Installiere nur notwendige Laufzeitabhängigkeiten
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Kopiere die vorgebauten Wheels aus der Builder-Stage
COPY --from=builder /app/wheels /wheels
RUN pip install --no-cache-dir --no-index --find-links=/wheels /wheels/* \
    && rm -rf /wheels

# Kopiere nur die benötigten Anwendungsdateien
COPY backend/ /app/backend/
COPY alembic/ /app/alembic/
COPY alembic.ini /app/

# Erzeuge einen Benutzer mit niedrigen Rechten für die Anwendung
RUN groupadd -r appuser && useradd -r -g appuser appuser \
    && mkdir -p /app/logs /app/data \
    && chown -R appuser:appuser /app

# Wechsle zum Benutzer mit niedrigen Rechten
USER appuser

# Port freigeben
EXPOSE 8003

# Health-Check konfigurieren
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8003/health || exit 1

# Anwendung starten
CMD ["uvicorn", "backend.demo_server_celery_enhanced:app", "--host", "0.0.0.0", "--port", "8003"] 