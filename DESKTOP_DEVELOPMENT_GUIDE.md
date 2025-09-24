# VALEO NeuroERP 2.0 - Desktop Development Guide

## 🖥️ **Desktop-Optimiertes Development Setup**

### **Voraussetzungen**
- Docker Desktop (Windows/Mac) oder Docker Engine (Linux)
- 8GB RAM (empfohlen)
- 50GB freier Speicherplatz
- Node.js 18+ (für lokale Entwicklung)

### **🚀 Schnellstart**

#### **1. Repository klonen und Setup**
```bash
git clone <repository-url>
cd VALEO-NeuroERP-2.0
```

#### **2. Environment Setup**
```bash
# Frontend Dependencies installieren
cd frontend
npm install

# Backend Dependencies installieren (falls vorhanden)
cd ../backend
pip install -r requirements.txt
```

#### **3. Docker Services starten**
```bash
# Alle Services starten
docker-compose -f docker-compose.desktop.yml up -d

# Nur Frontend + Backend (ohne Tools)
docker-compose -f docker-compose.desktop.yml up frontend backend postgres redis

# Mit Development Tools (pgAdmin)
docker-compose -f docker-compose.desktop.yml --profile tools up -d
```

#### **4. Services überprüfen**
```bash
# Status aller Container
docker-compose -f docker-compose.desktop.yml ps

# Logs anzeigen
docker-compose -f docker-compose.desktop.yml logs -f frontend
docker-compose -f docker-compose.desktop.yml logs -f backend
```

### **🔧 Development Workflow**

#### **Frontend Development**
```bash
# Lokale Entwicklung (empfohlen für Hot Reload)
cd frontend
npm start

# Oder via Docker (weniger performant)
docker-compose -f docker-compose.desktop.yml up frontend
```

**Frontend URL:** http://localhost:3000

#### **Backend Development**
```bash
# Lokale Entwicklung (empfohlen)
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Oder via Docker
docker-compose -f docker-compose.desktop.yml up backend
```

**Backend URL:** http://localhost:8000
**API Docs:** http://localhost:8000/docs

#### **Database Management**
```bash
# PostgreSQL direkt verbinden
psql -h localhost -p 5432 -U valeo_user -d valeo_neuroerp

# Oder pgAdmin (Web Interface)
# URL: http://localhost:5050
# Email: admin@valeo.local
# Password: admin123
```

### **📊 Service URLs**

| Service | URL | Beschreibung |
|---------|-----|--------------|
| Frontend | http://localhost:3000 | React Development Server |
| Backend API | http://localhost:8000 | FastAPI Server |
| API Docs | http://localhost:8000/docs | Swagger UI |
| pgAdmin | http://localhost:5050 | Database Management |
| PostgreSQL | localhost:5432 | Database Server |
| Redis | localhost:6379 | Cache Server |

### **🛠️ Development Commands**

#### **Docker Commands**
```bash
# Services starten
docker-compose -f docker-compose.desktop.yml up -d

# Services stoppen
docker-compose -f docker-compose.desktop.yml down

# Services neu starten
docker-compose -f docker-compose.desktop.yml restart

# Logs anzeigen
docker-compose -f docker-compose.desktop.yml logs -f [service-name]

# In Container einsteigen
docker-compose -f docker-compose.desktop.yml exec [service-name] sh
```

#### **Frontend Commands**
```bash
cd frontend

# Development Server
npm start

# Build für Production
npm run build

# Tests ausführen
npm test

# Linter ausführen
npm run lint

# Linter Fixes
npm run lint:fix
```

#### **Backend Commands**
```bash
cd backend

# Development Server
uvicorn main:app --reload

# Tests ausführen
pytest

# Database Migration
alembic upgrade head

# Database Reset
alembic downgrade base
alembic upgrade head
```

### **🔍 Troubleshooting**

#### **Port-Konflikte**
```bash
# Ports überprüfen
netstat -an | findstr :3000
netstat -an | findstr :8000
netstat -an | findstr :5432

# Docker Container stoppen
docker-compose -f docker-compose.desktop.yml down
```

#### **Docker Issues**
```bash
# Docker System bereinigen
docker system prune -a

# Volumes löschen
docker-compose -f docker-compose.desktop.yml down -v

# Images neu bauen
docker-compose -f docker-compose.desktop.yml build --no-cache
```

#### **Database Issues**
```bash
# Database zurücksetzen
docker-compose -f docker-compose.desktop.yml down -v
docker-compose -f docker-compose.desktop.yml up postgres

# Datenbank neu erstellen
docker-compose -f docker-compose.desktop.yml exec postgres psql -U valeo_user -d postgres -c "DROP DATABASE IF EXISTS valeo_neuroerp;"
docker-compose -f docker-compose.desktop.yml exec postgres psql -U valeo_user -d postgres -c "CREATE DATABASE valeo_neuroerp;"
```

### **📈 Performance Optimierung**

#### **Notebook-spezifische Optimierungen**
```yaml
# docker-compose.override.yml
services:
  postgres:
    environment:
      - shared_buffers=256MB
      - effective_cache_size=1GB
      - work_mem=4MB
      - maintenance_work_mem=64MB

  redis:
    command: redis-server --maxmemory 128mb --maxmemory-policy allkeys-lru
```

#### **Development Performance**
```bash
# Nur notwendige Services starten
docker-compose -f docker-compose.desktop.yml up frontend backend

# Ohne pgAdmin (spart Ressourcen)
docker-compose -f docker-compose.desktop.yml up frontend backend postgres redis
```

### **🔒 Security Notes**

- **Nur für Development:** Diese Konfiguration ist nicht für Production geeignet
- **Lokale Netzwerk:** Services sind nur lokal erreichbar
- **Default Passwords:** Ändern Sie die Default-Passwörter für Production
- **Firewall:** Stellen Sie sicher, dass keine Ports nach außen geöffnet sind

### **📝 Development Best Practices**

1. **Hot Reload nutzen:** Lokale Entwicklung für bessere Performance
2. **Docker für Services:** Nur für Database, Redis, etc.
3. **Code Quality:** ESLint Warnings = 0 (bereits erreicht!)
4. **Testing:** Lokale Tests vor Docker-Deployment
5. **Backup:** Regelmäßige Database-Backups

### **🎯 Nächste Schritte**

1. **Frontend Development:** http://localhost:3000
2. **API Testing:** http://localhost:8000/docs
3. **Database Management:** http://localhost:5050
4. **Code Quality:** `npm run lint` (0 Warnings! ✅)

---

**VALEO NeuroERP 2.0 - Desktop Development Setup** ✅
**Status:** Ready for Development
**Linter Warnings:** 0/0 ✨
**Next:** Start Development Server
