# VALEO NeuroERP DevOps Setup

Dieses Repository enthält die komplette DevOps-Einrichtung für das VALEO NeuroERP-System mit Docker, CI/CD, Monitoring und Deployment-Automatisierung.

## 🏗️ Architektur

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Middleware    │
│   (React)       │    │   (FastAPI)     │    │   (API Gateway) │
│   Port: 3000    │    │   Port: 8000    │    │   Port: 8001    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Nginx         │
                    │   (Reverse Proxy)│
                    │   Port: 80/443  │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │   MongoDB       │    │   Redis         │
│   Port: 5432    │    │   Port: 27017   │    │   Port: 6379    │
└─────────────────┘    └─────────────────┘    └─────────────────┘

┌─────────────────┐    ┌─────────────────┐
│   Prometheus    │    │   Grafana       │
│   Port: 9090    │    │   Port: 3001    │
└─────────────────┘    └─────────────────┘
```

## 🚀 Schnellstart

### Voraussetzungen

- Docker und Docker Compose
- Git
- Mindestens 4GB RAM
- 10GB freier Speicherplatz

### Lokale Entwicklung

1. **Repository klonen:**
   ```bash
   git clone https://github.com/your-org/valeo-neuroerp.git
   cd valeo-neuroerp
   ```

2. **Umgebungsvariablen setzen:**
   ```bash
   cp .env.example .env
   # Bearbeite .env mit deinen Werten
   ```

3. **Services starten:**
   ```bash
   # Alle Services starten
   ./deploy.sh local up
   
   # Oder mit Docker Compose
   docker-compose up -d
   ```

4. **Anwendung öffnen:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Grafana: http://localhost:3001 (admin/admin)
   - Prometheus: http://localhost:9090

## 📦 Docker Services

### Frontend (React)
- **Port:** 3000
- **Technologie:** React 18, TypeScript, Vite
- **Features:** Material-UI, Ant Design, Tailwind CSS

### Backend (FastAPI)
- **Port:** 8000
- **Technologie:** Python 3.11, FastAPI, SQLAlchemy
- **Features:** JWT Auth, Rate Limiting, CORS

### Middleware (API Gateway)
- **Port:** 8001
- **Technologie:** FastAPI, Redis
- **Features:** Caching, Rate Limiting, Load Balancing

### Datenbanken
- **PostgreSQL:** Port 5432 (Hauptdatenbank)
- **MongoDB:** Port 27017 (Dokumentenspeicher)
- **Redis:** Port 6379 (Cache)

### Monitoring
- **Prometheus:** Port 9090 (Metriken-Sammlung)
- **Grafana:** Port 3001 (Dashboards)

## 🔧 Deployment

### Lokale Entwicklung
```bash
./deploy.sh local up
```

### Staging
```bash
./deploy.sh staging up
```

### Production
```bash
./deploy.sh production up
```

### Verfügbare Aktionen
- `up` - Services starten
- `down` - Services stoppen
- `restart` - Services neustarten
- `logs` - Logs anzeigen
- `health` - Health Checks
- `cleanup` - Cleanup durchführen
- `monitoring` - Monitoring starten

## 🔍 Monitoring & Observability

### Prometheus Metriken
- API Response Times
- Error Rates
- System Resources
- Database Performance
- Custom Business Metrics

### Grafana Dashboards
- System Overview
- API Performance
- Database Metrics
- Error Tracking
- User Activity

### Health Checks
- Backend: `GET /health`
- Middleware: `GET /health`
- Frontend: `GET /`

## 🔒 Sicherheit

### SSL/TLS
- Automatische HTTPS-Umleitung
- Moderne Cipher Suites
- HSTS Headers

### Rate Limiting
- API: 10 requests/second
- Login: 5 requests/minute
- Configurable per endpoint

### Security Headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test
npm run test:coverage
```

### Backend Tests
```bash
cd backend
pytest
pytest --cov
```

### E2E Tests
```bash
npm run test:e2e
```

## 📊 CI/CD Pipeline

### GitHub Actions Workflow
- **Trigger:** Push to main/develop, Pull Requests
- **Jobs:**
  1. Frontend Tests & Build
  2. Backend Tests
  3. Security Scan
  4. Docker Build & Push
  5. Deploy to Staging/Production

### Deployment Stages
1. **Development:** Automatisch bei Push
2. **Staging:** Automatisch bei Push zu develop
3. **Production:** Automatisch bei Push zu main

## 🔧 Konfiguration

### Umgebungsvariablen
```bash
# Backend
DATABASE_URL=postgresql://user:pass@host:5432/db
MONGODB_URI=mongodb://host:27017
REDIS_URL=redis://host:6379/0
SECRET_KEY=your-secret-key

# Frontend
REACT_APP_API_URL=http://localhost:8000
REACT_APP_MIDDLEWARE_URL=http://localhost:8001
```

### Nginx Konfiguration
- Reverse Proxy Setup
- SSL Termination
- Rate Limiting
- Caching
- Load Balancing

## 📈 Performance

### Optimierungen
- Docker Multi-Stage Builds
- Nginx Gzip Kompression
- Redis Caching
- Database Connection Pooling
- CDN für statische Assets

### Monitoring
- Real-time Metriken
- Performance Alerts
- Capacity Planning
- Bottleneck Detection

## 🚨 Troubleshooting

### Häufige Probleme

1. **Port bereits in Verwendung:**
   ```bash
   # Ports prüfen
   netstat -tulpn | grep :8000
   
   # Services stoppen
   docker-compose down
   ```

2. **Datenbank-Verbindung fehlgeschlagen:**
   ```bash
   # Datenbank-Status prüfen
   docker-compose logs postgres
   
   # Datenbank neu starten
   docker-compose restart postgres
   ```

3. **Memory Issues:**
   ```bash
   # Docker System prüfen
   docker system df
   
   # Cleanup durchführen
   ./deploy.sh local cleanup
   ```

### Logs anzeigen
```bash
# Alle Logs
docker-compose logs

# Spezifischer Service
docker-compose logs backend

# Follow Mode
docker-compose logs -f frontend
```

## 📚 Weitere Dokumentation

- [API Dokumentation](http://localhost:8000/docs)
- [Frontend Guide](./frontend/README.md)
- [Backend Guide](./backend/README.md)
- [Architecture Decision Records](./docs/adr/)

## 🤝 Beitragen

1. Fork das Repository
2. Erstelle einen Feature Branch
3. Führe Tests aus
4. Erstelle einen Pull Request

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert. 