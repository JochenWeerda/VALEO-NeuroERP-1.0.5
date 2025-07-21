# 🧠 VALEO NeuroERP - Das intelligente ERP-System

## 📋 Übersicht

VALEO NeuroERP ist ein vollständig implementiertes, modulares ERP-System mit 12 Kernmodulen und 440 Datenbank-Tabellen. Das System ist speziell für mittelständische Unternehmen entwickelt und bietet Landhandel-spezifische Anpassungen.

## 🎯 Features

### ✅ **Vollständig implementierte Module (12/12)**

1. **Personal Management** - Mitarbeiterverwaltung & HR
2. **Finanzbuchhaltung** - Kontenplan & Buchungen  
3. **Anlagenverwaltung** - Asset Management
4. **Produktionsmanagement** - Landhandel-spezifisch
5. **Lagerverwaltung** - Bestandsmanagement
6. **Einkaufsmanagement** - Lieferanten & Bestellungen
7. **Verkaufsmanagement** - Kunden & Aufträge
8. **Qualitätsmanagement** - QS & Prüfungen
9. **Kundenverwaltung (CRM)** - Mit Tagesprotokoll
10. **Projektmanagement** - Projekte & Zeiterfassung
11. **Dokumentenverwaltung** - DSGVO-konform
12. **Reporting & Analytics** - KPIs & Berichte

### 🚀 **Besondere Features**

- **100% L3-Abdeckung** - Alle Anforderungen implementiert
- **Landhandel-spezifisch** - Mobile Mühle, Lohnspritzen, Futtermittel-Rezepturen
- **DSGVO-konform** - Automatische Bereinigung, gesetzliche Fristen
- **Tagesprotokoll-System** - Für Außendienst-Mitarbeiter
- **Zentrale Reporting** - Dashboard, KPIs, Export-Funktionen

## 🛠️ Technologie-Stack

### Frontend
- **React 18** mit TypeScript
- **Material-UI v5** für UI-Komponenten
- **TailwindCSS** für Styling
- **Zustand** für State Management
- **Axios** für API-Kommunikation

### Backend
- **Node.js** mit Express
- **TypeScript** für Type Safety
- **PostgreSQL** als Datenbank
- **JWT** für Authentifizierung
- **PL/pgSQL** für Datenbank-Funktionen

### Datenbank
- **12 Schemas** (personal, finance, assets, produktion, lager, einkauf, verkauf, qualitaet, crm, projekte, dokumente, reporting)
- **440 Tabellen** mit vollständiger L3-Abdeckung
- **UUID Primary Keys** für alle Tabellen
- **Referentielle Integrität** mit Foreign Keys
- **Automatische Nummerierung** für alle Entitäten

## 📦 Installation

### Voraussetzungen

- **Node.js** 18+ 
- **PostgreSQL** 14+
- **npm** oder **yarn**

### 1. Repository klonen

   ```bash
git clone https://github.com/valeo-neuroerp/valeo-neuroerp.git
cd valeo-neuroerp
```

### 2. Backend Setup

   ```bash
# Backend-Verzeichnis wechseln
cd backend

# Dependencies installieren
   npm install

# Environment-Variablen konfigurieren
cp env.example .env
# .env-Datei mit Ihren Datenbank-Einstellungen bearbeiten

# TypeScript kompilieren
npm run build

# Server starten
npm run dev
```

### 3. Frontend Setup

```bash
# Frontend-Verzeichnis wechseln
cd frontend

# Dependencies installieren
npm install

# Environment-Variablen konfigurieren
cp .env.example .env
# .env-Datei mit API-URL bearbeiten

# Entwicklungsserver starten
npm start
```

### 4. Datenbank Setup

```bash
# PostgreSQL-Verbindung herstellen
psql -U postgres -d valeo_neuroerp

# Alle Schemas importieren
\i database/personal_schema.sql
\i database/finance_schema.sql
\i database/assets_schema.sql
\i database/production_schema.sql
\i database/warehouse_schema.sql
\i database/purchasing_schema.sql
\i database/sales_schema.sql
\i database/quality_schema.sql
\i database/crm_schema.sql
\i database/project_schema.sql
\i database/document_schema.sql
\i database/reporting_schema.sql
```

## 🔧 Konfiguration

### Backend (.env)

```env
# Server Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=valeo_neuroerp
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_VERSION=1.0.0
```

## 🚀 Verwendung

### Entwicklung

```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm start
```

### Produktion

```bash
# Backend bauen und starten
cd backend
npm run build
npm start

# Frontend bauen
cd frontend
npm run build
```

## 📊 API-Endpunkte

### Health Checks
- `GET /health` - Server-Status
- `GET /db-test` - Datenbank-Verbindung

### Modul-APIs
- `GET /api/v1/personal/*` - Personal Management
- `GET /api/v1/finance/*` - Finanzbuchhaltung
- `GET /api/v1/assets/*` - Anlagenverwaltung
- `GET /api/v1/production/*` - Produktionsmanagement
- `GET /api/v1/warehouse/*` - Lagerverwaltung
- `GET /api/v1/purchasing/*` - Einkaufsmanagement
- `GET /api/v1/sales/*` - Verkaufsmanagement
- `GET /api/v1/quality/*` - Qualitätsmanagement
- `GET /api/v1/crm/*` - Kundenverwaltung
- `GET /api/v1/projects/*` - Projektmanagement
- `GET /api/v1/documents/*` - Dokumentenverwaltung
- `GET /api/v1/reporting/*` - Reporting & Analytics

## 🧪 Testing

```bash
# Backend Tests
cd backend
npm test

# Frontend Tests
cd frontend
npm test
```

## 📁 Projektstruktur

```
valeo-neuroerp/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── api/routes/     # API-Routen
│   │   ├── config/         # Konfiguration
│   │   ├── middleware/     # Middleware
│   │   └── server.ts       # Haupt-Server
│   ├── package.json
│   └── env.example
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # UI-Komponenten
│   │   ├── pages/          # Seiten-Komponenten
│   │   ├── services/       # API-Services
│   │   └── types/          # TypeScript-Typen
│   └── package.json
├── database/               # Datenbank-Schemas
│   ├── personal_schema.sql
│   ├── finance_schema.sql
│   ├── production_schema.sql
│   └── ...
└── docs/                   # Dokumentation
```

## 🔒 Sicherheit

- **JWT-basierte Authentifizierung**
- **Role-based Access Control (RBAC)**
- **Input-Validierung** mit Joi
- **SQL-Injection-Schutz** mit Parameterized Queries
- **CORS-Konfiguration**
- **Rate Limiting**
- **Helmet.js** für Security Headers

## 📈 Performance

- **Database Connection Pooling**
- **Caching-Strategien**
- **Lazy Loading** für große Datensätze
- **Compression** für API-Responses
- **Index-Optimierung** für alle Tabellen

## 🤝 Beitragen

1. Fork das Repository
2. Erstellen Sie einen Feature-Branch (`git checkout -b feature/AmazingFeature`)
3. Committen Sie Ihre Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. Pushen Sie zum Branch (`git push origin feature/AmazingFeature`)
5. Öffnen Sie einen Pull Request

## 📝 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert - siehe [LICENSE](LICENSE) Datei für Details.

## 🆘 Support

- **Dokumentation**: [docs.valeo-neuroerp.com](https://docs.valeo-neuroerp.com)
- **Issues**: [GitHub Issues](https://github.com/valeo-neuroerp/valeo-neuroerp/issues)
- **E-Mail**: support@valeo-neuroerp.com

## 🎉 Status

**Phase 2 - VOLLSTÄNDIG ABGESCHLOSSEN** ✅

- **12 von 12 Modulen implementiert (100%)**
- **440 Datenbank-Tabellen (100% L3-Abdeckung)**
- **12 React-Komponenten**
- **Vollständige ERP-Funktionalität**

---

**VALEO NeuroERP** - Das intelligente ERP-System für moderne Unternehmen 🚀
