#!/bin/bash

# VALEO NeuroERP Deployment Script
# Autor: AI Assistant
# Version: 2.0

set -e

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging-Funktion
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Prüfe Docker und Docker Compose
check_dependencies() {
    log "Prüfe Dependencies..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker ist nicht installiert!"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose ist nicht installiert!"
        exit 1
    fi
    
    log "Dependencies sind verfügbar"
}

# Backup erstellen
create_backup() {
    log "Erstelle Backup..."
    
    BACKUP_DIR="backups/$(date +'%Y%m%d_%H%M%S')"
    mkdir -p "$BACKUP_DIR"
    
    # Docker Volumes backup
    docker run --rm -v neuroerp_postgres_data:/data -v "$(pwd)/$BACKUP_DIR":/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
    docker run --rm -v neuroerp_mongo_data:/data -v "$(pwd)/$BACKUP_DIR":/backup alpine tar czf /backup/mongo_backup.tar.gz -C /data .
    docker run --rm -v neuroerp_redis_data:/data -v "$(pwd)/$BACKUP_DIR":/backup alpine tar czf /backup/redis_backup.tar.gz -C /data .
    
    log "Backup erstellt in: $BACKUP_DIR"
}

# SSL-Zertifikate erstellen (für Entwicklung)
create_ssl_certificates() {
    log "Erstelle SSL-Zertifikate für Entwicklung..."
    
    mkdir -p nginx/ssl
    
    if [ ! -f nginx/ssl/cert.pem ] || [ ! -f nginx/ssl/key.pem ]; then
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/key.pem \
            -out nginx/ssl/cert.pem \
            -subj "/C=DE/ST=Bayern/L=München/O=VALEO/CN=localhost"
        
        log "SSL-Zertifikate erstellt"
    else
        log "SSL-Zertifikate existieren bereits"
    fi
}

# Services starten
start_services() {
    log "Starte Services..."
    
    # Erstelle SSL-Zertifikate
    create_ssl_certificates
    
    # Starte Services
    docker-compose up -d
    
    log "Services gestartet"
}

# Services stoppen
stop_services() {
    log "Stoppe Services..."
    
    docker-compose down
    
    log "Services gestoppt"
}

# Services neu starten
restart_services() {
    log "Starte Services neu..."
    
    stop_services
    start_services
    
    log "Services neu gestartet"
}

# Health Check
health_check() {
    log "Führe Health Check durch..."
    
    # Warte auf Services
    sleep 10
    
    # Prüfe Backend
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        log "✓ Backend ist gesund"
    else
        error "✗ Backend Health Check fehlgeschlagen"
    fi
    
    # Prüfe Middleware
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        log "✓ Middleware ist gesund"
    else
        error "✗ Middleware Health Check fehlgeschlagen"
    fi
    
    # Prüfe Frontend
    if curl -f http://localhost:3000/ > /dev/null 2>&1; then
        log "✓ Frontend ist erreichbar"
    else
        error "✗ Frontend Health Check fehlgeschlagen"
    fi
    
    # Prüfe Nginx
    if curl -f http://localhost/health > /dev/null 2>&1; then
        log "✓ Nginx ist gesund"
    else
        error "✗ Nginx Health Check fehlgeschlagen"
    fi
    
    log "Health Check abgeschlossen"
}

# Logs anzeigen
show_logs() {
    log "Zeige Logs..."
    
    docker-compose logs -f
}

# Monitoring-Status
monitoring_status() {
    log "Monitoring-Status:"
    
    echo "Prometheus: http://localhost:9090"
    echo "Grafana: http://localhost:3001 (admin/admin123)"
    echo "Nginx: http://localhost (HTTP -> HTTPS)"
    echo "Backend API: http://localhost:8000"
    echo "Middleware: http://localhost:5000"
    echo "Frontend: http://localhost:3000"
}

# Cleanup
cleanup() {
    log "Führe Cleanup durch..."
    
    # Stoppe Services
    docker-compose down
    
    # Entferne ungenutzte Images
    docker image prune -f
    
    # Entferne ungenutzte Volumes
    docker volume prune -f
    
    # Entferne ungenutzte Networks
    docker network prune -f
    
    log "Cleanup abgeschlossen"
}

# Tests ausführen
run_tests() {
    log "Führe Tests aus..."
    
    # Frontend Tests
    cd frontend
    npm test -- --watchAll=false --coverage
    cd ..
    
    # Backend Tests (falls verfügbar)
    if [ -f "backend/test_main.py" ]; then
        cd backend
        python -m pytest test_main.py -v
        cd ..
    fi
    
    log "Tests abgeschlossen"
}

# Build Images
build_images() {
    log "Baue Docker Images..."
    
    docker-compose build --no-cache
    
    log "Images gebaut"
}

# Hilfe anzeigen
show_help() {
    echo "VALEO NeuroERP Deployment Script"
    echo ""
    echo "Verwendung: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start       - Starte alle Services"
    echo "  stop        - Stoppe alle Services"
    echo "  restart     - Starte Services neu"
    echo "  status      - Zeige Service-Status"
    echo "  logs        - Zeige Logs"
    echo "  health      - Führe Health Check durch"
    echo "  backup      - Erstelle Backup"
    echo "  build       - Baue Docker Images"
    echo "  test        - Führe Tests aus"
    echo "  cleanup     - Führe Cleanup durch"
    echo "  help        - Zeige diese Hilfe"
    echo ""
    echo "Beispiele:"
    echo "  $0 start"
    echo "  $0 logs"
    echo "  $0 health"
}

# Hauptfunktion
main() {
    case "${1:-help}" in
        start)
            check_dependencies
            start_services
            health_check
            monitoring_status
            ;;
        stop)
            stop_services
            ;;
        restart)
            check_dependencies
            restart_services
            health_check
            ;;
        status)
            docker-compose ps
            monitoring_status
            ;;
        logs)
            show_logs
            ;;
        health)
            health_check
            ;;
        backup)
            create_backup
            ;;
        build)
            check_dependencies
            build_images
            ;;
        test)
            run_tests
            ;;
        cleanup)
            cleanup
            ;;
        help|*)
            show_help
            ;;
    esac
}

# Script ausführen
main "$@" 