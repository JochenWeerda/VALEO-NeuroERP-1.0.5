# VALEO NeuroERP Makefile
# Vereinfacht die Ausführung häufiger DevOps-Tasks

.PHONY: help install start stop restart status logs health backup build test clean deploy

# Standardziel
help:
	@echo "VALEO NeuroERP - Verfügbare Kommandos:"
	@echo ""
	@echo "  install    - Installiere alle Dependencies"
	@echo "  start      - Starte alle Services"
	@echo "  stop       - Stoppe alle Services"
	@echo "  restart    - Starte Services neu"
	@echo "  status     - Zeige Service-Status"
	@echo "  logs       - Zeige Logs"
	@echo "  health     - Führe Health Check durch"
	@echo "  backup     - Erstelle Backup"
	@echo "  build      - Baue Docker Images"
	@echo "  test       - Führe Tests aus"
	@echo "  clean      - Führe Cleanup durch"
	@echo "  deploy     - Vollständiges Deployment"
	@echo ""

# Dependencies installieren
install:
	@echo "Installiere Frontend Dependencies..."
	cd frontend && npm install
	@echo "Installiere Backend Dependencies..."
	cd backend && pip install -r requirements.txt
	@echo "Dependencies installiert!"

# Services starten
start:
	@echo "Starte Services..."
	./deploy.sh start

# Services stoppen
stop:
	@echo "Stoppe Services..."
	./deploy.sh stop

# Services neu starten
restart:
	@echo "Starte Services neu..."
	./deploy.sh restart

# Service-Status anzeigen
status:
	@echo "Service-Status:"
	./deploy.sh status

# Logs anzeigen
logs:
	@echo "Zeige Logs..."
	./deploy.sh logs

# Health Check
health:
	@echo "Führe Health Check durch..."
	./deploy.sh health

# Backup erstellen
backup:
	@echo "Erstelle Backup..."
	./deploy.sh backup

# Docker Images bauen
build:
	@echo "Baue Docker Images..."
	./deploy.sh build

# Tests ausführen
test:
	@echo "Führe Tests aus..."
	./deploy.sh test

# Cleanup
clean:
	@echo "Führe Cleanup durch..."
	./deploy.sh cleanup

# Vollständiges Deployment
deploy: install build start health
	@echo "Deployment abgeschlossen!"

# Frontend-spezifische Kommandos
frontend-install:
	@echo "Installiere Frontend Dependencies..."
	cd frontend && npm install

frontend-dev:
	@echo "Starte Frontend Development Server..."
	cd frontend && npm run dev

frontend-build:
	@echo "Baue Frontend..."
	cd frontend && npm run build

frontend-test:
	@echo "Führe Frontend Tests aus..."
	cd frontend && npm test

# Backend-spezifische Kommandos
backend-install:
	@echo "Installiere Backend Dependencies..."
	cd backend && pip install -r requirements.txt

backend-dev:
	@echo "Starte Backend Development Server..."
	cd backend && python main.py

backend-test:
	@echo "Führe Backend Tests aus..."
	cd backend && python -m pytest

# Datenbank-Kommandos
db-migrate:
	@echo "Führe Datenbank-Migrationen aus..."
	cd backend && python -m alembic upgrade head

db-seed:
	@echo "Seede Datenbank mit Test-Daten..."
	cd backend && python seed_data.py

# Monitoring-Kommandos
monitoring-start:
	@echo "Starte Monitoring Services..."
	docker-compose up -d prometheus grafana

monitoring-stop:
	@echo "Stoppe Monitoring Services..."
	docker-compose stop prometheus grafana

monitoring-logs:
	@echo "Zeige Monitoring Logs..."
	docker-compose logs prometheus grafana

# Development-Kommandos
dev-setup: frontend-install backend-install
	@echo "Development Setup abgeschlossen!"

dev-start:
	@echo "Starte Development Services..."
	cd frontend && npm run dev &
	cd backend && python main.py &
	@echo "Development Services gestartet!"

# Production-Kommandos
prod-deploy: clean build start health
	@echo "Production Deployment abgeschlossen!"

prod-backup:
	@echo "Erstelle Production Backup..."
	./deploy.sh backup

# Utility-Kommandos
check-deps:
	@echo "Prüfe Dependencies..."
	@command -v docker >/dev/null 2>&1 || { echo "Docker ist nicht installiert!"; exit 1; }
	@command -v docker-compose >/dev/null 2>&1 || { echo "Docker Compose ist nicht installiert!"; exit 1; }
	@command -v node >/dev/null 2>&1 || { echo "Node.js ist nicht installiert!"; exit 1; }
	@command -v python3 >/dev/null 2>&1 || { echo "Python 3 ist nicht installiert!"; exit 1; }
	@echo "Alle Dependencies sind verfügbar!"

update:
	@echo "Update alle Services..."
	git pull
	./deploy.sh restart

# Debug-Kommandos
debug-logs:
	@echo "Zeige Debug-Logs..."
	docker-compose logs --tail=100

debug-shell:
	@echo "Öffne Shell in Backend Container..."
	docker-compose exec backend /bin/bash

debug-frontend:
	@echo "Öffne Shell in Frontend Container..."
	docker-compose exec frontend /bin/sh 