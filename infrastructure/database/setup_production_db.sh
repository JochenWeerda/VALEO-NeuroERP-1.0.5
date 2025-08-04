#!/bin/bash
# VALEO NeuroERP 2.0 - Produktionsdatenbank Setup
# Dieses Skript richtet die PostgreSQL-Datenbank für Produktion ein

set -e  # Exit bei Fehler

# Konfiguration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-valeo_neuroerp}"
DB_USER="${DB_USER:-valeo_app}"
DB_ADMIN_USER="${DB_ADMIN_USER:-postgres}"
BACKUP_USER="${BACKUP_USER:-valeo_backup}"
READONLY_USER="${READONLY_USER:-valeo_readonly}"

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== VALEO NeuroERP 2.0 - Produktionsdatenbank Setup ===${NC}"
echo ""

# Funktion für Fehlerbehandlung
error_exit() {
    echo -e "${RED}Fehler: $1${NC}" >&2
    exit 1
}

# Prüfe ob PostgreSQL läuft
echo -e "${YELLOW}Prüfe PostgreSQL-Verbindung...${NC}"
if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" > /dev/null 2>&1; then
    error_exit "PostgreSQL ist nicht erreichbar auf $DB_HOST:$DB_PORT"
fi
echo -e "${GREEN}✓ PostgreSQL läuft${NC}"

# Passwörter generieren oder aus Umgebung nehmen
if [ -z "$DB_PASSWORD" ]; then
    DB_PASSWORD=$(openssl rand -base64 32)
    echo -e "${YELLOW}Generiertes App-Passwort: $DB_PASSWORD${NC}"
fi

if [ -z "$BACKUP_PASSWORD" ]; then
    BACKUP_PASSWORD=$(openssl rand -base64 32)
    echo -e "${YELLOW}Generiertes Backup-Passwort: $BACKUP_PASSWORD${NC}"
fi

if [ -z "$READONLY_PASSWORD" ]; then
    READONLY_PASSWORD=$(openssl rand -base64 32)
    echo -e "${YELLOW}Generiertes Readonly-Passwort: $READONLY_PASSWORD${NC}"
fi

# SQL-Befehle vorbereiten
cat > /tmp/setup_valeo_db.sql << EOF
-- VALEO NeuroERP 2.0 Datenbank-Setup

-- Datenbank erstellen (falls nicht existiert)
SELECT 'CREATE DATABASE $DB_NAME'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

-- Mit Datenbank verbinden
\c $DB_NAME

-- Extensions aktivieren
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Für Volltextsuche
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- Für Performance

-- Benutzer erstellen
DO \$\$
BEGIN
    -- App-Benutzer
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '$DB_USER') THEN
        CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
    END IF;
    
    -- Backup-Benutzer
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '$BACKUP_USER') THEN
        CREATE USER $BACKUP_USER WITH PASSWORD '$BACKUP_PASSWORD';
    END IF;
    
    -- Readonly-Benutzer
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '$READONLY_USER') THEN
        CREATE USER $READONLY_USER WITH PASSWORD '$READONLY_PASSWORD';
    END IF;
END\$\$;

-- Schema erstellen
CREATE SCHEMA IF NOT EXISTS erp AUTHORIZATION $DB_USER;

-- Berechtigungen setzen
-- App-Benutzer
GRANT CONNECT ON DATABASE $DB_NAME TO $DB_USER;
GRANT USAGE ON SCHEMA erp TO $DB_USER;
GRANT CREATE ON SCHEMA erp TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA erp TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA erp TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA erp TO $DB_USER;

-- Backup-Benutzer
GRANT CONNECT ON DATABASE $DB_NAME TO $BACKUP_USER;
GRANT USAGE ON SCHEMA erp TO $BACKUP_USER;
GRANT SELECT ON ALL TABLES IN SCHEMA erp TO $BACKUP_USER;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA erp TO $BACKUP_USER;

-- Readonly-Benutzer
GRANT CONNECT ON DATABASE $DB_NAME TO $READONLY_USER;
GRANT USAGE ON SCHEMA erp TO $READONLY_USER;
GRANT SELECT ON ALL TABLES IN SCHEMA erp TO $READONLY_USER;

-- Default-Berechtigungen für neue Objekte
ALTER DEFAULT PRIVILEGES IN SCHEMA erp 
    GRANT ALL ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA erp 
    GRANT ALL ON SEQUENCES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA erp 
    GRANT ALL ON FUNCTIONS TO $DB_USER;

ALTER DEFAULT PRIVILEGES IN SCHEMA erp 
    GRANT SELECT ON TABLES TO $BACKUP_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA erp 
    GRANT SELECT ON SEQUENCES TO $BACKUP_USER;

ALTER DEFAULT PRIVILEGES IN SCHEMA erp 
    GRANT SELECT ON TABLES TO $READONLY_USER;

-- Performance-Einstellungen
ALTER DATABASE $DB_NAME SET shared_buffers = '256MB';
ALTER DATABASE $DB_NAME SET effective_cache_size = '1GB';
ALTER DATABASE $DB_NAME SET maintenance_work_mem = '64MB';
ALTER DATABASE $DB_NAME SET checkpoint_completion_target = 0.9;
ALTER DATABASE $DB_NAME SET wal_buffers = '16MB';
ALTER DATABASE $DB_NAME SET default_statistics_target = 100;
ALTER DATABASE $DB_NAME SET random_page_cost = 1.1;
ALTER DATABASE $DB_NAME SET effective_io_concurrency = 200;
ALTER DATABASE $DB_NAME SET work_mem = '4MB';
ALTER DATABASE $DB_NAME SET min_wal_size = '1GB';
ALTER DATABASE $DB_NAME SET max_wal_size = '4GB';

-- Audit-Tabelle für Sicherheit
CREATE TABLE IF NOT EXISTS erp.audit_log_system (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_name VARCHAR(100),
    ip_address INET,
    details JSONB,
    success BOOLEAN DEFAULT TRUE
);

-- Index für Audit-Log
CREATE INDEX IF NOT EXISTS idx_audit_log_event_time 
    ON erp.audit_log_system(event_time DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_name 
    ON erp.audit_log_system(user_name);

-- Verbindungslimits setzen
ALTER USER $DB_USER CONNECTION LIMIT 100;
ALTER USER $BACKUP_USER CONNECTION LIMIT 5;
ALTER USER $READONLY_USER CONNECTION LIMIT 20;

EOF

# SQL ausführen
echo -e "${YELLOW}Führe Datenbank-Setup aus...${NC}"
PGPASSWORD="$DB_ADMIN_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_ADMIN_USER" -f /tmp/setup_valeo_db.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Datenbank-Setup erfolgreich${NC}"
else
    error_exit "Datenbank-Setup fehlgeschlagen"
fi

# Aufräumen
rm -f /tmp/setup_valeo_db.sql

# Backup-Verzeichnis erstellen
BACKUP_DIR="/var/valeo-erp/backups"
echo -e "${YELLOW}Erstelle Backup-Verzeichnis...${NC}"
sudo mkdir -p "$BACKUP_DIR"
sudo chown postgres:postgres "$BACKUP_DIR"
sudo chmod 750 "$BACKUP_DIR"
echo -e "${GREEN}✓ Backup-Verzeichnis erstellt${NC}"

# Backup-Skript erstellen
cat > /tmp/valeo_backup.sh << 'EOF'
#!/bin/bash
# VALEO NeuroERP Backup-Skript

BACKUP_DIR="/var/valeo-erp/backups"
DB_NAME="valeo_neuroerp"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/valeo_backup_$TIMESTAMP.sql.gz"

# Backup erstellen
pg_dump -h localhost -U valeo_backup -d $DB_NAME | gzip > "$BACKUP_FILE"

# Alte Backups löschen (älter als 30 Tage)
find "$BACKUP_DIR" -name "valeo_backup_*.sql.gz" -mtime +30 -delete

# Backup-Status loggen
if [ $? -eq 0 ]; then
    echo "$(date): Backup erfolgreich erstellt: $BACKUP_FILE" >> "$BACKUP_DIR/backup.log"
else
    echo "$(date): Backup fehlgeschlagen" >> "$BACKUP_DIR/backup.log"
fi
EOF

sudo mv /tmp/valeo_backup.sh /usr/local/bin/valeo_backup.sh
sudo chmod +x /usr/local/bin/valeo_backup.sh

# Cron-Job für tägliches Backup
echo -e "${YELLOW}Erstelle Backup-Cron-Job...${NC}"
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/valeo_backup.sh") | crontab -
echo -e "${GREEN}✓ Backup-Cron-Job erstellt (täglich um 2:00 Uhr)${NC}"

# .env Datei für Anwendung erstellen
echo -e "${YELLOW}Erstelle .env Datei...${NC}"
cat > .env.production << EOF
# VALEO NeuroERP 2.0 - Produktionsumgebung
# Generiert am $(date)

# Datenbank
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# Sicherheit
SECRET_KEY=$(openssl rand -hex 32)

# Redis (falls verwendet)
REDIS_HOST=localhost
REDIS_PORT=6379

# Email (anzupassen)
SMTP_HOST=smtp.valeo.de
SMTP_PORT=587
SMTP_USER=noreply@valeo.de
SMTP_PASSWORD=CHANGE_ME

# S3 Storage (optional)
# S3_BUCKET=valeo-erp-storage
# S3_REGION=eu-central-1
# S3_ACCESS_KEY=CHANGE_ME
# S3_SECRET_KEY=CHANGE_ME

# Monitoring (optional)
# SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
EOF

chmod 600 .env.production
echo -e "${GREEN}✓ .env.production erstellt${NC}"

# Zusammenfassung
echo ""
echo -e "${GREEN}=== Setup abgeschlossen ===${NC}"
echo ""
echo -e "${YELLOW}Wichtige Informationen:${NC}"
echo "Datenbank: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo ""
echo -e "${YELLOW}Benutzer:${NC}"
echo "App-User: $DB_USER"
echo "Backup-User: $BACKUP_USER"
echo "Readonly-User: $READONLY_USER"
echo ""
echo -e "${YELLOW}Konfigurationsdatei:${NC}"
echo ".env.production"
echo ""
echo -e "${YELLOW}Backup:${NC}"
echo "Verzeichnis: $BACKUP_DIR"
echo "Zeitplan: Täglich um 2:00 Uhr"
echo ""
echo -e "${RED}WICHTIG: Speichern Sie die generierten Passwörter sicher!${NC}"
echo ""
echo -e "${GREEN}Nächste Schritte:${NC}"
echo "1. Führen Sie die Datenbank-Migrationen aus:"
echo "   alembic upgrade head"
echo "2. Starten Sie die Anwendung:"
echo "   uvicorn backend.app.main:app --host 0.0.0.0 --port 8000"

# Passwörter in sicherer Datei speichern
cat > valeo_db_credentials.txt << EOF
VALEO NeuroERP 2.0 - Datenbank-Zugangsdaten
Generiert am: $(date)

App-User: $DB_USER
Passwort: $DB_PASSWORD

Backup-User: $BACKUP_USER
Passwort: $BACKUP_PASSWORD

Readonly-User: $READONLY_USER
Passwort: $READONLY_PASSWORD

WICHTIG: Diese Datei sicher aufbewahren und dann löschen!
EOF

chmod 600 valeo_db_credentials.txt
echo ""
echo -e "${RED}Zugangsdaten wurden in 'valeo_db_credentials.txt' gespeichert${NC}"
echo -e "${RED}Bitte sichern und dann löschen!${NC}"