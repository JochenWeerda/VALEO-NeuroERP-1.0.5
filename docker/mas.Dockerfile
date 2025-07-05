# Basis-Image
FROM python:3.11-slim

# Arbeitsverzeichnis setzen
WORKDIR /app

# System-Abhängigkeiten installieren
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Python-Abhängigkeiten kopieren und installieren
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Anwendungscode kopieren
COPY linkup_mcp/ ./linkup_mcp/
COPY .env .

# Benutzer für die Ausführung erstellen
RUN useradd -m valeo
RUN chown -R valeo:valeo /app
USER valeo

# Umgebungsvariablen setzen
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Healthcheck konfigurieren
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Start-Befehl
CMD ["python", "-m", "linkup_mcp.main"] 