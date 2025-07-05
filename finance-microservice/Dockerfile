# Multi-Stage Dockerfile für Finance Microservice

# ===== Build-Stage =====
FROM python:3.10-slim AS builder

WORKDIR /app

# Installiere build-essentials für Abhängigkeiten, die Kompilierung erfordern
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Kopiere nur requirements.txt zuerst, um Layer-Caching zu optimieren
COPY requirements.txt .

# Erstelle ein virtuelles Environment und installiere Abhängigkeiten
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ===== Runtime-Stage =====
FROM python:3.10-slim AS runtime

WORKDIR /app

# Kopiere virtuelles Environment vom Builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Installiere nur Runtime-Abhängigkeiten
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Setze Umgebungsvariablen
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONIOENCODING=UTF-8 \
    TZ=Europe/Berlin

# Kopiere Anwendungscode
COPY src /app/src
COPY alembic.ini /app/
COPY migrations /app/migrations
COPY entrypoint.sh /app/

RUN chmod +x /app/entrypoint.sh

# Erstelle Nicht-Root-Benutzer für mehr Sicherheit
RUN addgroup --system appgroup && adduser --system appuser --ingroup appgroup
RUN chown -R appuser:appgroup /app
USER appuser

# Healthcheck zur Überwachung des Service-Status
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Exponiere Port für FastAPI
EXPOSE 8000

# Standardkommando zum Starten der Anwendung
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"] 