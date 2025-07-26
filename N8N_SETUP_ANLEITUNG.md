# n8n Setup Anleitung - VALEO NeuroERP

## 🎯 Übersicht

Diese Anleitung zeigt, wie Sie **n8n** mit Docker einrichten und für die **Dual MCP Cursor.ai Integration** konfigurieren.

## 🐳 Docker Setup

### 1. Voraussetzungen

- **Docker Desktop** installiert und gestartet
- **Docker Compose** verfügbar
- **PowerShell** (Windows) oder **Bash** (Linux/Mac)

### 2. Schnellstart

```bash
# 1. Setup-Script ausführen
.\setup-n8n.ps1

# 2. Services starten
docker-compose up -d

# 3. Integration testen
.\test-n8n-integration.ps1
```

## 🌐 n8n Dashboard

### Zugriff

- **URL**: http://localhost:5678
- **Login**: admin / valeo2024
- **Port**: 5678

### Features

- ✅ **Workflow-Editor** - Visueller Workflow-Designer
- ✅ **API-Integration** - HTTP-Requests zu MCP-Servern
- ✅ **Webhook-Support** - Automatische Trigger
- ✅ **Scheduling** - Zeitgesteuerte Ausführung
- ✅ **Error Handling** - Robuste Fehlerbehandlung
- ✅ **Logging** - Detaillierte Ausführungsprotokolle

## 🔧 Konfiguration

### 1. Environment Variables (.env)

```bash
# Supabase Configuration
SUPABASE_URL=https://ftybxxndembbfjdkcsuk.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# n8n Configuration
N8N_ENCRYPTION_KEY=your-32-character-encryption-key-here
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=valeo2024

# Cursor AI Configuration (optional)
CURSOR_API_KEY=your_cursor_api_key_here

# Webhook Configuration (optional)
WEBHOOK_URL=https://your-webhook-url.com/notifications
```

### 2. Docker Compose Services

```yaml
services:
  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=valeo2024
    volumes:
      - n8n_data:/home/node/.n8n
      - ./n8n-flows:/home/node/.n8n/workflows
      - ./generated-components:/home/node/generated-components

  schema-mcp-server:
    build:
      context: ./backend
      dockerfile: Dockerfile.mcp
    ports:
      - "8000:8000"
    environment:
      - SUPABASE_URL=https://ftybxxndembbfjdkcsuk.supabase.co
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}

  ui-metadata-mcp-server:
    build:
      context: ./backend
      dockerfile: Dockerfile.mcp
    ports:
      - "8001:8001"
```

## 🚀 Workflow Import

### 1. Manueller Import

1. **n8n Dashboard öffnen**: http://localhost:5678
2. **Login**: admin / valeo2024
3. **Workflows** → **Import from file**
4. **Datei wählen**: `n8n-flows/dual-mcp-cursor-automation.json`
5. **Import bestätigen**

### 2. Automatischer Import

```bash
# Workflow wird automatisch beim ersten Start importiert
docker-compose up -d n8n
```

## 🔄 Workflow Verwendung

### 1. Manueller Start

1. **n8n Dashboard** → **Workflows**
2. **Dual MCP Cursor Automation** auswählen
3. **Execute Workflow** klicken
4. **Input Data** eingeben:
   ```json
   {
     "table_name": "invoices"
   }
   ```

### 2. Webhook-Trigger

```bash
# Webhook-URL für automatische Ausführung
curl -X POST http://localhost:5678/webhook/dual-mcp \
  -H "Content-Type: application/json" \
  -d '{"table_name": "invoices"}'
```

### 3. Scheduled Execution

1. **Workflow bearbeiten**
2. **Cron Node** hinzufügen
3. **Schedule** konfigurieren (z.B. täglich um 9:00)
4. **Workflow aktivieren**

## 📊 Monitoring

### 1. n8n Dashboard

- **Executions** - Ausführungsprotokolle
- **Logs** - Detaillierte Logs
- **Performance** - Ausführungszeiten
- **Errors** - Fehlerprotokolle

### 2. Docker Logs

```bash
# n8n Logs
docker logs valeo-n8n

# MCP Server Logs
docker logs valeo-schema-mcp
docker logs valeo-ui-metadata-mcp

# Alle Logs
docker-compose logs -f
```

### 3. Health Checks

```bash
# n8n Health
curl http://localhost:5678/health

# Schema MCP Health
curl http://localhost:8000/health

# UI Metadata MCP Health
curl http://localhost:8001/health
```

## 🧪 Testing

### 1. Integration Test

```bash
# Vollständiger Integration Test
.\test-n8n-integration.ps1
```

### 2. Einzelne Komponenten testen

```bash
# n8n Dashboard
curl http://localhost:5678

# Schema MCP API
curl http://localhost:8000/api/schema/invoices

# UI Metadata MCP API
curl http://localhost:8001/api/ui/complete/invoices
```

### 3. Workflow Test

```bash
# Test-Workflow ausführen
curl -X POST http://localhost:5678/webhook/dual-mcp-test \
  -H "Content-Type: application/json" \
  -d '{"table_name": "invoices", "test": true}'
```

## 🔧 Troubleshooting

### Häufige Probleme

#### 1. n8n startet nicht

```bash
# Docker Logs prüfen
docker logs valeo-n8n

# Port-Konflikte prüfen
netstat -an | findstr :5678

# Container neu starten
docker-compose restart n8n
```

#### 2. MCP Server nicht erreichbar

```bash
# Environment Variables prüfen
docker-compose config

# Container Status prüfen
docker ps

# MCP Server neu starten
docker-compose restart schema-mcp-server ui-metadata-mcp-server
```

#### 3. Workflow-Fehler

```bash
# n8n Logs prüfen
docker logs valeo-n8n

# Workflow-Execution prüfen
# → n8n Dashboard → Executions
```

### Debug-Modus

```bash
# Debug-Logs aktivieren
docker-compose down
docker-compose up -d --build
docker-compose logs -f
```

## 📈 Performance-Optimierung

### 1. Ressourcen-Limits

```yaml
services:
  n8n:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
        reservations:
          memory: 1G
          cpus: '0.5'
```

### 2. Caching

```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

### 3. Database-Optimierung

```yaml
services:
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=n8n
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=n8n_password
    command: >
      postgres
      -c shared_preload_libraries=pg_stat_statements
      -c pg_stat_statements.track=all
```

## 🔒 Sicherheit

### 1. Authentication

```yaml
environment:
  - N8N_BASIC_AUTH_ACTIVE=true
  - N8N_BASIC_AUTH_USER=admin
  - N8N_BASIC_AUTH_PASSWORD=strong_password_here
```

### 2. HTTPS

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx/ssl:/etc/nginx/ssl
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
```

### 3. API-Keys

```bash
# Sichere API-Keys verwenden
N8N_ENCRYPTION_KEY=32-character-random-string
CURSOR_API_KEY=your-secure-cursor-api-key
```

## 🚀 Production Deployment

### 1. Environment Setup

```bash
# Production .env
NODE_ENV=production
N8N_HOST=your-domain.com
N8N_PROTOCOL=https
N8N_PORT=443
```

### 2. Reverse Proxy

```nginx
# nginx.conf
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://n8n:5678;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3. Monitoring

```yaml
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    
  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
```

## 📚 Nützliche Links

- **n8n Documentation**: https://docs.n8n.io/
- **Docker Documentation**: https://docs.docker.com/
- **VALEO NeuroERP**: https://github.com/JochenWeerda/VALEO-NeuroERP-2.0
- **Dual MCP Architecture**: [DUAL_MCP_ARCHITEKTUR.md](./DUAL_MCP_ARCHITEKTUR.md)

## 🎯 Nächste Schritte

1. **Setup ausführen**: `.\setup-n8n.ps1`
2. **Services starten**: `docker-compose up -d`
3. **Integration testen**: `.\test-n8n-integration.ps1`
4. **Workflow importieren** in n8n Dashboard
5. **Erste Komponente generieren** mit Dual MCP
6. **CI/CD Pipeline** einrichten
7. **Monitoring** konfigurieren

---

**Hinweis**: n8n ist über **http://localhost:5678** erreichbar und bietet eine vollständige Workflow-Automatisierung für die Dual MCP Cursor.ai Integration. 