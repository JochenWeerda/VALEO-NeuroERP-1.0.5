FROM python:3.11-slim

WORKDIR /app

# Umgebungsvariablen setzen
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# System-Abhängigkeiten installieren
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Celery und Flower installieren
RUN pip install --no-cache-dir celery==5.3.0 flower==2.0.0 redis==4.5.0

# Port freigeben
EXPOSE 5555

# Health-Check konfigurieren
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:5555/healthcheck || exit 1

# Flower starten
CMD ["celery", "-A", "backend.tasks.celery_app", "flower", "--port=5555", "--address=0.0.0.0"] 