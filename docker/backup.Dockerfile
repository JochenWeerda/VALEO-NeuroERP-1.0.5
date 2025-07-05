# Basis-Image
FROM python:3.11-slim

# Arbeitsverzeichnis setzen
WORKDIR /app

# System-Abhängigkeiten installieren
RUN apt-get update && apt-get install -y \
    cron \
    && rm -rf /var/lib/apt/lists/*

# Python-Abhängigkeiten installieren
RUN pip install --no-cache-dir \
    motor==3.3.1 \
    pymongo==4.6.1 \
    python-dotenv==1.0.0

# Backup-Skript kopieren
COPY scripts/backup.py /app/backup.py

# Cron-Job einrichten
RUN echo "0 0 * * * /usr/local/bin/python /app/backup.py >> /var/log/cron.log 2>&1" > /etc/cron.d/backup-cron
RUN chmod 0644 /etc/cron.d/backup-cron
RUN crontab /etc/cron.d/backup-cron

# Backup-Verzeichnis erstellen
RUN mkdir -p /backups
RUN chmod 777 /backups

# Start-Skript erstellen
RUN echo '#!/bin/sh\n\
cron\n\
tail -f /var/log/cron.log' > /app/start.sh
RUN chmod +x /app/start.sh

# Start-Befehl
CMD ["/app/start.sh"] 