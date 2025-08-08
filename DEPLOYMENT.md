# 🚀 VALEO NeuroERP 2.0 - Deployment Guide

**Vollständige Anleitung für Production Deployment**

## 📋 Inhaltsverzeichnis

- [🎯 Übersicht](#-übersicht)
- [🏗️ Architektur](#️-architektur)
- [🔧 Voraussetzungen](#-voraussetzungen)
- [📦 Installation](#-installation)
- [⚙️ Konfiguration](#️-konfiguration)
- [🚀 Deployment](#-deployment)
- [🔒 Sicherheit](#-sicherheit)
- [📊 Monitoring](#-monitoring)
- [🔄 CI/CD](#-cicd)
- [📝 Troubleshooting](#-troubleshooting)

## 🎯 Übersicht

VALEO NeuroERP 2.0 ist ein modernes, skalierbares ERP-System mit:

- **🔧 TypeScript-First** - 0 Compilation Errors
- **🎨 Modern UI/UX** - Material-UI + Ant Design
- **🤖 AI-Integration** - OpenAI + Custom AI Services
- **📊 Real-time Analytics** - Live Dashboard
- **🔒 Enterprise Security** - JWT + RBAC
- **📱 Responsive Design** - Mobile-First Approach

## 🏗️ Architektur

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   (PostgreSQL)  │
│   Port: 3000    │    │   Port: 8000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │   Redis Cache   │              │
         │              │   Port: 6379    │              │
         │              └─────────────────┘              │
         │                                              │
         │              ┌─────────────────┐              │
         └──────────────►│   Nginx Proxy   │◄─────────────┘
                        │   Port: 80/443  │
                        └─────────────────┘
```

## 🔧 Voraussetzungen

### System Requirements

- **OS**: Ubuntu 20.04+ / CentOS 8+ / Windows Server 2019+
- **CPU**: 4+ Cores
- **RAM**: 8GB+ (16GB recommended)
- **Storage**: 100GB+ SSD
- **Network**: Stable internet connection

### Software Requirements

```bash
# Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Python 3.11+
sudo apt-get install python3.11 python3.11-venv python3.11-dev

# PostgreSQL 14+
sudo apt-get install postgresql postgresql-contrib

# Redis
sudo apt-get install redis-server

# Nginx
sudo apt-get install nginx

# Git LFS
curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | sudo bash
sudo apt-get install git-lfs
```

## 📦 Installation

### 1. Repository Setup

```bash
# Repository klonen
git clone https://github.com/JochenWeerda/VALEO-NeuroERP-2.0.git
cd VALEO-NeuroERP-2.0

# Git LFS initialisieren
git lfs install
git lfs pull
```

### 2. Frontend Setup

```bash
# Frontend Dependencies
cd frontend
npm install

# Production Build
npm run build

# Environment konfigurieren
cp .env.example .env.production
# .env.production bearbeiten
```

### 3. Backend Setup

```bash
# Backend Dependencies
cd ../backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Environment konfigurieren
cp .env.example .env.production
# .env.production bearbeiten
```

### 4. Database Setup

```bash
# PostgreSQL konfigurieren
sudo -u postgres psql

CREATE DATABASE valeo_neuroerp;
CREATE USER valeo_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE valeo_neuroerp TO valeo_user;
\q

# Schema importieren
psql -U valeo_user -d valeo_neuroerp -f database/schema.sql
```

## ⚙️ Konfiguration

### Frontend (.env.production)

```env
# Production Configuration
NODE_ENV=production
REACT_APP_API_URL=https://api.valeo-neuroerp.com
REACT_APP_VERSION=2.0.0
REACT_APP_ENVIRONMENT=production

# Analytics
REACT_APP_GA_TRACKING_ID=GA-XXXXXXXXX
REACT_APP_SENTRY_DSN=https://xxxxxxxxx@sentry.io/xxxxx

# Feature Flags
REACT_APP_ENABLE_AI=true
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_MONITORING=true
```

### Backend (.env.production)

```env
# Server Configuration
ENVIRONMENT=production
DEBUG=false
HOST=0.0.0.0
PORT=8000

# Database Configuration
DATABASE_URL=postgresql://valeo_user:secure_password@localhost:5432/valeo_neuroerp
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=30

# Redis Configuration
REDIS_URL=redis://localhost:6379/0
REDIS_PASSWORD=secure_redis_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-production
JWT_ALGORITHM=HS256
JWT_EXPIRES_IN=24h

# Security
CORS_ORIGINS=https://valeo-neuroerp.com,https://www.valeo-neuroerp.com
SECRET_KEY=your-super-secret-key-production

# AI Services
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4

# Monitoring
SENTRY_DSN=https://xxxxxxxxx@sentry.io/xxxxx
LOG_LEVEL=INFO
```

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/valeo-neuroerp
server {
    listen 80;
    server_name valeo-neuroerp.com www.valeo-neuroerp.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name valeo-neuroerp.com www.valeo-neuroerp.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/valeo-neuroerp.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/valeo-neuroerp.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Frontend
    location / {
        root /var/www/valeo-neuroerp/frontend/build;
        try_files $uri $uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket Support
    location /ws/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

## 🚀 Deployment

### 1. Docker Deployment

```bash
# Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Oder mit Docker
docker build -t valeo-neuroerp:latest .
docker run -d -p 3000:3000 --name valeo-neuroerp valeo-neuroerp:latest
```

### 2. Manual Deployment

```bash
# Frontend Deployment
cd frontend
npm run build
sudo cp -r build/* /var/www/valeo-neuroerp/frontend/

# Backend Deployment
cd ../backend
source venv/bin/activate
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000

# Service Files
sudo cp deployment/valeo-neuroerp.service /etc/systemd/system/
sudo systemctl enable valeo-neuroerp
sudo systemctl start valeo-neuroerp
```

### 3. SSL Certificate

```bash
# Let's Encrypt SSL
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d valeo-neuroerp.com -d www.valeo-neuroerp.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔒 Sicherheit

### Firewall Configuration

```bash
# UFW Firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Database Security

```sql
-- PostgreSQL Security
ALTER USER valeo_user PASSWORD 'new_secure_password';
REVOKE CONNECT ON DATABASE valeo_neuroerp FROM PUBLIC;
GRANT CONNECT ON DATABASE valeo_neuroerp TO valeo_user;
```

### Application Security

```bash
# Security Headers
# Already configured in Nginx

# Rate Limiting
# Configure in Nginx or application level

# Input Validation
# Implemented in FastAPI with Pydantic
```

## 📊 Monitoring

### Application Monitoring

```bash
# Sentry Integration
# Already configured in environment variables

# Log Management
sudo journalctl -u valeo-neuroerp -f

# Performance Monitoring
# Implement with Prometheus + Grafana
```

### Health Checks

```bash
# Frontend Health Check
curl -f https://valeo-neuroerp.com/health

# Backend Health Check
curl -f https://valeo-neuroerp.com/api/health

# Database Health Check
pg_isready -h localhost -p 5432 -U valeo_user
```

## 🔄 CI/CD

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.KEY }}
          script: |
            cd /var/www/valeo-neuroerp
            git pull origin main
            docker-compose -f docker-compose.prod.yml up -d --build
```

### Automated Testing

```bash
# Pre-deployment Tests
npm run test:unit
npm run test:integration
npm run test:e2e

# Security Tests
npm audit
snyk test
```

## 📝 Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check port usage
   sudo netstat -tulpn | grep :3000
   sudo netstat -tulpn | grep :8000
   ```

2. **Database Connection**
   ```bash
   # Test database connection
   psql -h localhost -U valeo_user -d valeo_neuroerp
   ```

3. **Memory Issues**
   ```bash
   # Check memory usage
   free -h
   top
   ```

4. **Log Analysis**
   ```bash
   # Application logs
   sudo journalctl -u valeo-neuroerp -n 100

   # Nginx logs
   sudo tail -f /var/log/nginx/access.log
   sudo tail -f /var/log/nginx/error.log
   ```

### Performance Optimization

1. **Database Optimization**
   ```sql
   -- Index optimization
   CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
   ANALYZE users;
   ```

2. **Caching Strategy**
   ```bash
   # Redis optimization
   redis-cli CONFIG SET maxmemory 2gb
   redis-cli CONFIG SET maxmemory-policy allkeys-lru
   ```

3. **CDN Integration**
   ```bash
   # Cloudflare or similar CDN
   # Configure in DNS settings
   ```

## 🎯 Next Steps

1. **Monitoring Setup** - Prometheus + Grafana
2. **Backup Strategy** - Automated backups
3. **Scaling** - Load balancer setup
4. **Disaster Recovery** - Backup and restore procedures
5. **Performance Tuning** - Database and application optimization

---

**VALEO NeuroERP 2.0** - Production Ready! 🚀

Für Support: [GitHub Issues](https://github.com/JochenWeerda/VALEO-NeuroERP-2.0/issues)
