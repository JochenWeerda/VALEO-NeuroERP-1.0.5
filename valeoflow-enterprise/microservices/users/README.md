# VALEO-Die NeuroERP Users Microservice

## 📋 Übersicht

Der VALEO-Die NeuroERP Users Microservice ist ein Enterprise-grade Benutzerverwaltungssystem mit vollständiger Authentication, Authorization und Session-Management Funktionalität. Er ist speziell für die Integration mit dem bestehenden L3 ERP System optimiert und unterstützt die nahtlose Datenmigration.

## 🏗️ Architektur

```
valeoflow-enterprise/microservices/users/
├── src/
│   ├── server.js              # Express Server mit allen Endpoints
│   └── services/
│       ├── database.js         # PostgreSQL Database Service
│       └── logger.js           # Token-optimiertes Logging
├── database/
│   └── schema.sql             # PostgreSQL Schema
├── package.json               # Dependencies & Scripts
├── Dockerfile                 # Container-Konfiguration
└── README.md                  # Diese Dokumentation
```

## 🚀 Features

### ✅ Authentication & Authorization
- **JWT-basierte Session-Management**
- **Role-based Access Control (RBAC)**
- **Account Locking** nach fehlgeschlagenen Anmeldeversuchen
- **Password Reset** mit Token-basierter Validierung
- **Secure Password Hashing** mit bcrypt

### ✅ User Management
- **CRUD-Operationen** für Benutzer
- **Flexible Suche** und Filterung
- **Sales Representative** Unterstützung
- **Department & Position** Verwaltung
- **Soft Delete** für Datenintegrität

### ✅ Security Features
- **Rate Limiting** für API-Endpoints
- **Helmet Security Headers**
- **CORS-Konfiguration**
- **Input Validation** mit Joi
- **Comprehensive Logging** für Audit-Trails

### ✅ Monitoring & Observability
- **Prometheus Metrics** Integration
- **Health Check** Endpoints
- **Token-optimiertes Logging**
- **Performance Monitoring**
- **Error Tracking**

### ✅ Enterprise Features
- **Database Connection Pooling**
- **Graceful Shutdown**
- **Scheduled Cleanup Tasks**
- **Activity Logging**
- **Statistics & Analytics**

## 📊 Database Schema

### Core Tables
- **users** - Benutzerprofile mit Authentifizierung
- **roles** - Rollen-Definitionen mit Permissions
- **user_roles** - Many-to-Many Beziehung
- **user_sessions** - Session-Management
- **password_reset_tokens** - Passwort-Reset Funktionalität
- **user_activity_log** - Audit-Trail

### L3 ERP Kompatibilität
- **sales_rep_code** Feld für L3 Integration
- **is_sales_rep** Flag für Vertriebsberater
- **department** und **position** Felder
- **Soft Delete** für Datenmigration

## 🔧 Installation & Setup

### Voraussetzungen
- Node.js 18+
- PostgreSQL 12+
- Redis (optional für Caching)

### 1. Dependencies installieren
```bash
cd valeoflow-enterprise/microservices/users
npm install
```

### 2. Environment konfigurieren
```bash
cp env.example .env
```

**Wichtige Environment-Variablen:**
```env
# Server
PORT=3004
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=valeoflow_users
DB_USER=postgres
DB_PASSWORD=password

# Security
JWT_SECRET=your-super-secret-jwt-key
BCRYPT_ROUNDS=12

# Logging
LOG_LEVEL=info
LOG_DIR=logs

# CORS
CORS_ORIGIN=*
```

### 3. Database Setup
```bash
# Schema erstellen
npm run setup:db:schema

# Demo-Daten laden
npm run setup:db
```

### 4. Service starten
```bash
# Development
npm run dev

# Production
npm start
```

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Beschreibung | Auth |
|--------|----------|--------------|------|
| POST | `/auth/login` | Benutzeranmeldung | ❌ |
| POST | `/auth/logout` | Benutzerabmeldung | ✅ |
| POST | `/auth/refresh` | Token-Erneuerung | ❌ |
| POST | `/auth/forgot-password` | Passwort-Reset anfordern | ❌ |
| POST | `/auth/reset-password` | Passwort zurücksetzen | ❌ |

### User Management
| Method | Endpoint | Beschreibung | Auth | Roles |
|--------|----------|--------------|------|-------|
| GET | `/users` | Benutzerliste | ✅ | admin, manager |
| GET | `/users/:id` | Benutzerdetails | ✅ | - |
| POST | `/users` | Benutzer erstellen | ✅ | admin |
| PUT | `/users/:id` | Benutzer aktualisieren | ✅ | - |
| DELETE | `/users/:id` | Benutzer deaktivieren | ✅ | admin |

### Role Management
| Method | Endpoint | Beschreibung | Auth | Roles |
|--------|----------|--------------|------|-------|
| GET | `/roles` | Rollenliste | ✅ | admin, manager |
| POST | `/users/:id/roles` | Rolle zuweisen | ✅ | admin |
| DELETE | `/users/:id/roles/:roleId` | Rolle entfernen | ✅ | admin |

### Monitoring
| Method | Endpoint | Beschreibung | Auth |
|--------|----------|--------------|------|
| GET | `/health` | Health Check | ❌ |
| GET | `/metrics` | Prometheus Metrics | ❌ |
| GET | `/statistics` | Benutzerstatistiken | ✅ |
| GET | `/activity` | Aktivitätsprotokoll | ✅ |

## 🔐 Authentication

### Login Request
```json
POST /auth/login
{
  "username": "admin",
  "password": "securepassword"
}
```

### Login Response
```json
{
  "message": "Anmeldung erfolgreich",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@valeoflow.com",
    "firstName": "Admin",
    "lastName": "User",
    "roles": ["admin"]
  },
  "session": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "uuid-refresh-token",
    "expiresAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### Authorization Header
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 👥 User Management

### Benutzer erstellen
```json
POST /users
Authorization: Bearer <token>

{
  "username": "newuser",
  "email": "user@example.com",
  "password": "securepassword",
  "first_name": "Max",
  "last_name": "Mustermann",
  "department": "Sales",
  "position": "Sales Representative",
  "is_sales_rep": true,
  "sales_rep_code": "SR001"
}
```

### Benutzerliste abrufen
```http
GET /users?limit=10&offset=0&search=mustermann&isActive=true&isSalesRep=true
Authorization: Bearer <token>
```

## 🔍 Monitoring & Logging

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "service": "valeoflow-users-service",
  "version": "1.0.0",
  "database": {
    "status": "healthy",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "connected": true
  },
  "uptime": 3600
}
```

### Prometheus Metrics
```http
GET /metrics
```

**Wichtige Metriken:**
- `http_request_duration_seconds` - API Response-Zeiten
- `active_users_total` - Anzahl aktiver Benutzer
- `login_attempts_total` - Anmeldeversuche

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### Load Testing
```bash
npm run test:load
```

## 🐳 Docker

### Build Image
```bash
docker build -t valeoflow-users .
```

### Run Container
```bash
docker run -p 3004:3004 \
  -e DB_HOST=host.docker.internal \
  -e DB_NAME=valeoflow_users \
  valeoflow-users
```

### Docker Compose
```yaml
version: '3.8'
services:
  users-service:
    build: .
    ports:
      - "3004:3004"
    environment:
      - DB_HOST=postgres
      - DB_NAME=valeoflow_users
    depends_on:
      - postgres
```

## 🔧 Konfiguration

### Rate Limiting
- **Standard**: 100 Requests/15min pro IP
- **Authentication**: 5 Login-Versuche/15min pro IP

### Session Management
- **Token-Lifetime**: 24 Stunden
- **Refresh-Token**: UUID-basiert
- **Auto-Cleanup**: Täglich um 2:00 Uhr

### Security
- **Password Hashing**: bcrypt mit 12 Runden
- **Account Locking**: Nach 4 fehlgeschlagenen Versuchen
- **Lock Duration**: 15 Minuten

## 📈 Performance

### Optimierungen
- **Database Connection Pooling** (max 20 connections)
- **Token-optimiertes Logging** für hohe Last
- **Compression** für API-Responses
- **Caching** für Rollen und Permissions

### Benchmarks
- **Login**: ~50ms
- **User List**: ~100ms (1000 Benutzer)
- **Health Check**: ~10ms

## 🔄 L3 ERP Integration

### Datenmigration
```sql
-- L3 ERP Daten exportieren
SELECT 
  username,
  email,
  first_name,
  last_name,
  sales_rep_code,
  department,
  position
FROM l3_users 
WHERE is_active = true;
```

### Kompatibilitätsfelder
- `sales_rep_code` - Direkte L3 Integration
- `is_sales_rep` - Vertriebsberater-Flag
- `department` - Abteilungszuordnung
- `position` - Position im Unternehmen

## 🚨 Troubleshooting

### Häufige Probleme

**1. Database Connection Error**
```bash
# Prüfen Sie die DB-Verbindung
npm run setup:db:test
```

**2. Authentication Fehler**
```bash
# Logs überprüfen
tail -f logs/users-service.log
```

**3. Performance Issues**
```bash
# Metrics abrufen
curl http://localhost:3004/metrics
```

### Log-Dateien
- `logs/users-service.log` - Allgemeine Logs
- `logs/users-service-error.log` - Fehler-Logs
- `logs/users-service-security.log` - Security Events

## 📚 Weiterführende Dokumentation

- [API Reference](./API_REFERENCE.md)
- [Database Schema](./database/SCHEMA.md)
- [Security Guide](./SECURITY.md)
- [Deployment Guide](./DEPLOYMENT.md)

## 🤝 Support

Bei Fragen oder Problemen:
1. Logs überprüfen
2. Health Check ausführen
3. Metrics analysieren
4. Issue auf GitHub erstellen

---

**VALEO-Die NeuroERP Users Microservice v1.0.0**  
*Enterprise-grade Benutzerverwaltung für moderne ERP-Systeme* 