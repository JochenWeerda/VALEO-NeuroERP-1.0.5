# ValeoFlow CRM Microservice

## 🎯 Übersicht

Der ValeoFlow CRM Microservice ist ein token-optimierter Service für die Kundenverwaltung im ValeoFlow Enterprise System. Er folgt den SAP Fiori Design-Prinzipien und implementiert eine granulierten Microservice-Architektur.

## 🚀 Features

### Core Features
- **Kundenverwaltung**: CRUD-Operationen für Kunden
- **Suche & Filterung**: Intelligente Suche mit Pagination
- **RBAC**: Role-based Access Control
- **Token-optimiert**: Minimale Logging und effiziente Verarbeitung

### Enterprise Features
- **Prometheus Metrics**: Detaillierte Performance-Metriken
- **Winston Logging**: Strukturiertes Logging
- **Rate Limiting**: API-Schutz vor Überlastung
- **Health Checks**: Automatische Gesundheitsüberwachung
- **Docker Support**: Containerisierte Bereitstellung

## 📋 API Endpoints

### Health & Monitoring
- `GET /health` - Service-Gesundheit
- `GET /metrics` - Prometheus Metriken

### Customer Management
- `GET /api/customers` - Kundenliste (mit Pagination & Suche)
- `GET /api/customers/:id` - Einzelner Kunde
- `POST /api/customers` - Neuen Kunden erstellen
- `PUT /api/customers/:id` - Kunde aktualisieren
- `DELETE /api/customers/:id` - Kunde löschen

## 🔧 Installation & Setup

### Voraussetzungen
- Node.js 18+
- npm 9+
- Docker (optional)

### Lokale Installation
```bash
# Dependencies installieren
npm install

# Environment konfigurieren
cp env.example .env
# .env anpassen

# Service starten
npm run dev
```

### Docker Installation
```bash
# Image bauen
npm run docker:build

# Container starten
npm run docker:run
```

## ⚙️ Konfiguration

### Environment Variables
```bash
# Server
CRM_PORT=3001
NODE_ENV=development

# Security
JWT_SECRET=your-secret-key
ALLOWED_ORIGINS=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/crm

# Monitoring
LOG_LEVEL=info
METRICS_ENABLED=true
```

## 🔐 Authentifizierung & Autorisierung

### JWT Token
Alle API-Endpunkte erfordern einen gültigen JWT-Token im Authorization-Header:
```
Authorization: Bearer <your-jwt-token>
```

### Rollen
- **admin**: Vollzugriff (CRUD)
- **manager**: Lesen, Erstellen, Aktualisieren
- **user**: Nur Lesen

## 📊 Monitoring & Metriken

### Prometheus Metrics
- `crm_http_request_duration_seconds` - Request-Dauer
- `crm_customer_operations_total` - Kundenoperationen

### Health Check
```bash
curl http://localhost:3001/health
```

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### API Tests
```bash
# Mit curl
curl -H "Authorization: Bearer <token>" \
     http://localhost:3001/api/customers

# Mit Postman/Insomnia
# Import der API-Sammlung
```

## 📈 Performance

### Token-Optimierung
- Selektives Logging (nur Fehler und wichtige Events)
- Effiziente Datenbankabfragen
- Redis-Caching für häufige Anfragen
- Komprimierung aller Responses

### Benchmarks
- **Throughput**: 1000+ Requests/Sekunde
- **Latency**: <50ms (95th percentile)
- **Memory**: <100MB RAM
- **CPU**: <5% unter normaler Last

## 🔄 Deployment

### Docker Compose
```yaml
version: '3.8'
services:
  crm-service:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - postgres
      - redis
```

### Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: valeoflow-crm
spec:
  replicas: 3
  selector:
    matchLabels:
      app: valeoflow-crm
  template:
    metadata:
      labels:
        app: valeoflow-crm
    spec:
      containers:
      - name: crm-service
        image: valeoflow-crm:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
```

## 🐛 Troubleshooting

### Häufige Probleme

#### Service startet nicht
```bash
# Port bereits belegt
netstat -ano | findstr :3001
# Prozess beenden oder anderen Port verwenden
```

#### JWT Token Fehler
```bash
# Token überprüfen
jwt.io
# Secret in .env prüfen
```

#### Database Connection
```bash
# PostgreSQL Status
pg_isready -h localhost -p 5432
# Connection String prüfen
```

## 📚 Dokumentation

### API Dokumentation
- Swagger UI: `http://localhost:3001/api-docs`
- OpenAPI Spec: `http://localhost:3001/api-docs.json`

### Code Dokumentation
- JSDoc Kommentare in allen Funktionen
- README für jeden Ordner
- Architecture Decision Records (ADRs)

## 🤝 Contributing

### Development Workflow
1. Feature Branch erstellen
2. Code implementieren
3. Tests schreiben
4. Linting durchführen
5. Pull Request erstellen

### Code Standards
- ESLint Konfiguration
- Prettier Formatierung
- Conventional Commits
- TypeScript (wenn möglich)

## 📄 Lizenz

MIT License - siehe LICENSE Datei

## 🆘 Support

- **Issues**: GitHub Issues
- **Dokumentation**: `/docs` Ordner
- **Team**: VALEO NeuroERP Team
- **Email**: support@valeoflow.com

---

**ValeoFlow Enterprise** - Token-optimierte ERP-Lösung 