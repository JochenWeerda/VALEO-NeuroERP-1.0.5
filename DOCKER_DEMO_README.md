# 🐳 VALEO NeuroERP - Docker Demo

## 🎯 Übersicht

Diese Docker-basierte Demo bietet eine stabile und professionelle Umgebung für die Stakeholder-Demonstration des VALEO NeuroERP Systems.

## 🚀 Schnellstart

### Voraussetzungen
- **Docker Desktop** installiert und gestartet
- **PowerShell** (für Windows)

### Demo starten
```powershell
# Demo automatisch starten
.\start_docker_demo.ps1
```

### Manueller Start
```bash
# Images bauen
docker-compose build

# Services starten
docker-compose up -d

# Status prüfen
docker-compose ps
```

## 📊 Verfügbare Services

| Service | URL | Port | Beschreibung |
|---------|-----|------|--------------|
| **Frontend** | http://localhost | 80 | React ERP-System |
| **Backend API** | http://localhost/api | 8000 | Python FastAPI |
| **PostgreSQL** | localhost:5432 | 5432 | Datenbank |
| **Redis** | localhost:6379 | 6379 | Cache |

## 🔑 Demo-Credentials

- **Benutzername:** `admin`
- **Passwort:** `admin123`

## 🎨 Features

### ✅ Vollständiges ERP-System
- **12 ERP-Module** implementiert
- **440 Datenbank-Tabellen** (100% L3-Abdeckung)
- **Deutsche Lokalisierung** für alle Texte
- **Responsive Design** für alle Bildschirmgrößen

### ✅ Technische Highlights
- **React 18** mit TypeScript
- **Material-UI** und **Ant Design** Komponenten
- **FastAPI** Backend mit PostgreSQL
- **Docker** Containerisierung
- **Nginx** Reverse Proxy

## 🔧 Verwaltung

### Services verwalten
```bash
# Services stoppen
docker-compose down

# Services neu starten
docker-compose restart

# Logs anzeigen
docker-compose logs -f

# Status prüfen
docker-compose ps
```

### Container verwalten
```bash
# Alle Container anzeigen
docker ps

# Container-Logs anzeigen
docker logs <container-name>

# Container-Status beschreiben
docker inspect <container-name>
```

## 📈 Vorteile der Docker-Demo

### ✅ Stabilität
- **Isolierte Umgebung** - keine Konflikte mit lokalen Installationen
- **Konsistente Performance** - gleiche Umgebung auf allen Systemen
- **Automatische Neustarts** bei Fehlern

### ✅ Professionalität
- **Enterprise-Grade** Containerisierung
- **Health Checks** für alle Services
- **Load Balancing** durch Nginx

### ✅ Demo-Qualität
- **Sofortiger Start** - keine komplexe Konfiguration
- **Zuverlässige Performance** - optimierte Container
- **Einfache Wartung** - alles in einem System

## 🎯 Demo-Workflow

### 1. System starten
```powershell
.\start_docker_demo.ps1
```

### 2. Browser öffnet automatisch
- **URL:** http://localhost
- **Anmeldung:** admin / admin123

### 3. ERP-System demonstrieren
- **Personalisiertes Dashboard** zeigen
- **12 ERP-Module** durchgehen
- **Deutsche Lokalisierung** hervorheben
- **Responsive Design** demonstrieren

### 4. System stoppen
```bash
docker-compose down
```

## 🔧 Troubleshooting

### Services starten nicht
```bash
# Docker Desktop Status prüfen
docker version

# Container-Logs anzeigen
docker-compose logs

# System-Ressourcen prüfen
docker system df
```

### Frontend nicht erreichbar
```bash
# Frontend-Container Status prüfen
docker-compose ps frontend

# Frontend-Logs anzeigen
docker-compose logs frontend

# Port-Konflikte prüfen
netstat -ano | findstr :80
```

### Backend nicht erreichbar
```bash
# Backend-Container Status prüfen
docker-compose ps backend

# Backend-Logs anzeigen
docker-compose logs backend

# Datenbank-Verbindung prüfen
docker-compose logs postgres
```

## 📊 Performance-Optimierung

### Ressourcen anpassen
```yaml
# docker-compose.yml anpassen
services:
  frontend:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
```

### Monitoring aktivieren
```bash
# Container-Metriken anzeigen
docker stats

# System-Ressourcen überwachen
docker system df
```

## 🎉 Fazit

Die Docker-Demo bietet eine **stabile, professionelle und einfach zu verwaltende** Umgebung für die Stakeholder-Demonstration. Das System läuft zuverlässig und kann bei Bedarf einfach skaliert werden.

**Empfehlung:** Für die Stakeholder-Demonstration ist die Docker-Demo die beste Wahl!

---

*VALEO NeuroERP - Docker Demo Setup - Dezember 2024* 