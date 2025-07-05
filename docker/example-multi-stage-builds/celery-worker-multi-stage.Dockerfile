# Multi-Stage-Build Dockerfile für den Celery-Worker
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
    PYTHONPATH=/app \
    C_FORCE_ROOT=true

# Installiere nur notwendige Laufzeitabhängigkeiten
RUN apt-get update && apt-get install -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Kopiere die vorgebauten Wheels aus der Builder-Stage
COPY --from=builder /app/wheels /wheels
RUN pip install --no-cache-dir --no-index --find-links=/wheels /wheels/* \
    && rm -rf /wheels

# Kopiere nur die benötigten Anwendungsdateien
COPY backend/ /app/backend/

# Erzeuge einen Benutzer mit niedrigen Rechten für die Anwendung
RUN groupadd -r celeryuser && useradd -r -g celeryuser celeryuser \
    && mkdir -p /app/logs /app/data \
    && chown -R celeryuser:celeryuser /app

# Wechsle zum Benutzer mit niedrigen Rechten
USER celeryuser

# Health-Check konfigurieren (prüft, ob der Celery-Worker läuft)
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD celery -A backend.tasks.celery_app inspect ping -d celery@$HOSTNAME | grep OK || exit 1

# Celery-Worker starten
CMD ["celery", "-A", "backend.tasks.celery_app", "worker", "--loglevel=info", "--concurrency=4", "-Q", "default,reports,imports,exports,optimization"] 