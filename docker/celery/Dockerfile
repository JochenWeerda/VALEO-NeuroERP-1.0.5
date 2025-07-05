FROM python:3.11-slim

WORKDIR /app

# Umgebungsvariablen setzen
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app
ENV C_FORCE_ROOT=true

# System-Abhängigkeiten installieren
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Python-Abhängigkeiten kopieren und installieren
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Anwendungscode kopieren
COPY . .

# Health-Check konfigurieren (prüft, ob der Celery-Worker läuft)
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD celery -A backend.tasks.celery_app inspect ping -d celery@$HOSTNAME | grep OK || exit 1

# Celery-Worker starten
CMD ["celery", "-A", "backend.tasks.celery_app", "worker", "--loglevel=info", "--concurrency=4", "-Q", "default,reports,imports,exports,optimization"] 