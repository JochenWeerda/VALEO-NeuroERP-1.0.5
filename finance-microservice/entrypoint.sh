#!/bin/bash
set -e

# Warte auf Datenbank
echo "Warte auf Datenbankverbindung..."
python src/utils/wait_for_db.py

# Führe Datenbankmigrationen aus
echo "Führe Datenbankmigrationen aus..."
alembic upgrade head

# Prüfe erforderliche Umgebungsvariablen
required_vars=("DATABASE_URL" "REDIS_URL")
missing_vars=()

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    missing_vars+=("$var")
  fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
  echo "ERROR: Folgende erforderliche Umgebungsvariablen fehlen:"
  for var in "${missing_vars[@]}"; do
    echo "- $var"
  done
  exit 1
fi

# Prüfe optionale LLM-Provider-Variablen
llm_providers=()
if [ ! -z "${OPENAI_API_KEY}" ]; then
  llm_providers+=("OpenAI")
fi

if [ ! -z "${ANTHROPIC_API_KEY}" ]; then
  llm_providers+=("Anthropic")
fi

if [ ! -z "${LOCAL_LLM_URL}" ]; then
  llm_providers+=("Local LLM")
fi

if [ ${#llm_providers[@]} -eq 0 ]; then
  echo "WARNUNG: Keine LLM-Provider konfiguriert. Der Service wird mit eingeschränkter Funktionalität starten."
else
  echo "LLM-Provider verfügbar: ${llm_providers[*]}"
fi

# Cache initialisieren
echo "Initialisiere Cache..."
python src/utils/init_cache.py

# Prüfe, ob Health-Check-Endpunkt vom Observer-Service erreichbar ist
if [ ! -z "${OBSERVER_SERVICE_URL}" ]; then
  echo "Registriere Service am Observer (${OBSERVER_SERVICE_URL})..."
  python src/utils/register_with_observer.py
fi

# Starte den Service
echo "Starte Finance Microservice..."
exec "$@" 