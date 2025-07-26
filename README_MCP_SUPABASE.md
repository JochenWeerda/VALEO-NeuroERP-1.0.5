# 🚀 VALEO NeuroERP - MCP Supabase Integration

Vollständige Integration von **Model Context Protocol (MCP)** mit **Supabase** für automatische React-Komponenten-Generierung basierend auf Live-Datenbankschemas.

## 📋 Übersicht

Diese Integration ermöglicht es, React-Komponenten automatisch aus Supabase-Schemas zu generieren, die über MCP-Protokoll bereitgestellt werden. Das System bietet:

- ✅ **Live-Schema-Abruf** vom Supabase-Server
- ✅ **Automatische Komponenten-Generierung** basierend auf Schema
- ✅ **RLS-Compliance** in allen generierten Komponenten
- ✅ **TypeScript-Integration** mit Zod-Validierung
- ✅ **Cursor AI Integration** für intelligente Prompt-Generierung
- ✅ **GENXAIS-Workflow** für vollständige Automatisierung

## 🏗️ Architektur

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   MCP Server    │    │   Supabase      │
│   (React)       │◄──►│   (Python)      │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ • useMCPForm    │    │ • Schema Cache  │    │ • Live Schema   │
│ • useMCPTable   │    │ • RLS Policies  │    │ • RLS Policies  │
│ • useMCPData    │    │ • HTTP API      │    │ • Triggers      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Installation

### 1. Backend-Setup

```bash
# Backend-Verzeichnis
cd backend

# Dependencies installieren
pip install -r requirements.txt

# Setup-Skript ausführen
python setup.py

# Umgebungsvariablen konfigurieren
cp config.env.example .env
# Bearbeite .env mit deinen Supabase-Daten
```

### 2. Supabase-Projekt erstellen

1. Gehe zu [Supabase Dashboard](https://supabase.com/dashboard)
2. Erstelle ein neues Projekt
3. Kopiere die Projekt-URL und API-Keys
4. Aktualisiere die `.env`-Datei:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_PROJECT_ID=your-project-id
```

### 3. Datenbank-Schema ausführen

1. Öffne den SQL-Editor in deinem Supabase-Projekt
2. Kopiere den Inhalt von `database/supabase_schema.sql`
3. Führe das Script aus

### 4. MCP-Server starten

```bash
# MCP-Server starten
python mcp_supabase_server.py

# Oder mit uvicorn für HTTP-API
uvicorn mcp_supabase_server:app --host 0.0.0.0 --port 8000
```

### 5. Frontend-Integration

```bash
# Frontend-Verzeichnis
cd frontend

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev
```

## 🔧 Konfiguration

### MCP-Server-Konfiguration

```toml
# mcp_config.toml
[mcp]
name = "supabase-schema"
version = "1.0.0"
description = "Supabase Schema Provider für VALEO NeuroERP"

[server]
host = "localhost"
port = 8000
debug = true

[supabase]
url = "${SUPABASE_URL}"
key = "${SUPABASE_ANON_KEY}"
project_id = "${SUPABASE_PROJECT_ID}"
```

### Frontend-Konfiguration

```typescript
// frontend/src/utils/mcpSchemaInjector.ts
const mcpConfig = {
  baseUrl: 'http://localhost:8000',
  apiKey: process.env.VITE_MCP_API_KEY,
  timeout: 10000
};
```

## 📖 Verwendung

### 1. Einfache Schema-Abfrage

```typescript
import { getMCPSchemaInjector } from './utils/mcpSchemaInjector';

const mcpInjector = getMCPSchemaInjector();
const schema = await mcpInjector.getTableSchema('invoices');
console.log('Schema:', schema);
```

### 2. Cursor-Prompt generieren

```typescript
import { CursorPromptGenerator } from './utils/cursorPrompts';

const prompt = CursorPromptGenerator.generatePrompt(schema, 'form', {
  language: 'de',
  includeTests: true,
  includeDocumentation: true
});
```

### 3. Komponenten automatisch generieren

```typescript
import { getCursorComponentGenerator } from './utils/cursorComponentGenerator';

const generator = getCursorComponentGenerator();
const components = await generator.generateComponents({
  tableName: 'invoices',
  componentType: 'both',
  includeTests: true,
  includeDocumentation: true,
  language: 'de'
});
```

### 4. Vollständiger GENXAIS-Workflow

```typescript
import { getGENXAISIntegration } from './utils/genxaisIntegration';

const genxais = getGENXAISIntegration();
const result = await genxais.executeFullWorkflow('invoices', {
  componentType: 'both',
  includeTests: true,
  includeDocumentation: true,
  language: 'de'
});
```

### 5. MCP-Hooks verwenden

```typescript
import { useMCPForm, useMCPTable, useMCPData } from './hooks/useMCPForm';

// Formular mit Schema-Validierung
const form = useMCPForm({
  tableName: 'invoices',
  autoValidate: true,
  onSchemaLoad: (schema) => console.log('Schema geladen:', schema)
});

// Tabelle mit RLS-Compliance
const table = useMCPTable('invoices');

// Daten mit RLS-Konformität
const data = useMCPData('invoices');
```

## 🎯 Features

### MCP-Server Features

- ✅ **Live-Schema-Abruf** von Supabase
- ✅ **Schema-Caching** (5 Minuten TTL)
- ✅ **RLS-Policy-Analyse**
- ✅ **Foreign Key-Erkennung**
- ✅ **Enum-Werte-Extraktion**
- ✅ **HTTP-API** für Frontend-Integration
- ✅ **MCP-Protokoll** für Cursor-Integration

### Frontend-Integration Features

- ✅ **React Hooks** für Schema-basierte Komponenten
- ✅ **Automatische Validierung** mit Zod
- ✅ **RLS-Compliance** in allen Komponenten
- ✅ **TypeScript-Integration**
- ✅ **Real-time Updates**
- ✅ **Error Handling**

### Komponenten-Generator Features

- ✅ **Formular-Generierung** mit React Hook Form
- ✅ **Tabellen-Generierung** mit Material-UI
- ✅ **Test-Generierung** mit React Testing Library
- ✅ **Dokumentation-Generierung**
- ✅ **Mehrsprachige Unterstützung**
- ✅ **Responsive Design**

## 🔒 Sicherheit

### RLS-Compliance

Alle generierten Komponenten respektieren automatisch die Supabase RLS-Richtlinien:

```sql
-- Beispiel RLS-Policy
CREATE POLICY "Invoices are viewable by authenticated users" ON invoices
    FOR SELECT USING (auth.role() = 'authenticated');
```

### JWT-Autorisierung

```typescript
// Automatische JWT-Validierung
const response = await fetch(`${mcpConfig.baseUrl}/api/schema/invoices`, {
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json'
  }
});
```

### Input-Validierung

```typescript
// Zod-Schema aus MCP-Schema generiert
const InvoiceSchema = z.object({
  customer_id: z.string().uuid('Ungültige Customer-ID'),
  amount: z.number().positive('Betrag muss positiv sein'),
  status: InvoiceStatusEnum,
});
```

## 📊 API-Endpunkte

### MCP-Server API

| Endpunkt | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/schema/{table}` | GET | Schema für Tabelle abrufen |
| `/api/tables` | GET | Alle Tabellen auflisten |
| `/api/cache/clear` | POST | Cache leeren |
| `/api/health` | GET | Health-Check |

### Beispiel-Requests

```bash
# Schema abrufen
curl http://localhost:8000/api/schema/invoices

# Alle Tabellen auflisten
curl http://localhost:8000/api/tables

# Health-Check
curl http://localhost:8000/api/health
```

## 🧪 Testing

### Backend-Tests

```bash
# Tests ausführen
cd backend
pytest tests/

# Coverage-Report
pytest --cov=mcp_supabase_server tests/
```

### Frontend-Tests

```bash
# Tests ausführen
cd frontend
npm test

# E2E-Tests
npm run test:e2e
```

## 🔧 Entwicklung

### Lokale Entwicklung

```bash
# Backend (Terminal 1)
cd backend
python mcp_supabase_server.py

# Frontend (Terminal 2)
cd frontend
npm run dev

# Supabase (Terminal 3)
supabase start
```

### Debugging

```bash
# MCP-Server mit Debug-Logging
DEBUG=true python mcp_supabase_server.py

# Frontend mit React DevTools
npm run dev:debug
```

## 📈 Performance

### Caching-Strategien

- **Schema-Cache**: 5 Minuten TTL
- **HTTP-Cache**: Browser-Caching
- **React-Cache**: useMemo für teure Berechnungen

### Optimierungen

- **Lazy Loading** für große Schemas
- **Debounced Search** in Tabellen
- **Virtual Scrolling** für große Datensätze
- **Tree Shaking** für Bundle-Größe

## 🚀 Deployment

### Docker-Deployment

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["python", "mcp_supabase_server.py"]
```

### Vercel-Deployment

```json
// vercel.json
{
  "functions": {
    "api/mcp/*.py": {
      "runtime": "python3.11"
    }
  }
}
```

## 📚 Dokumentation

### Weitere Ressourcen

- [MCP Dokumentation](https://modelcontextprotocol.io/)
- [Supabase Dokumentation](https://supabase.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Dokumentation](https://zod.dev/)

### Beispiele

- [MCP Integration Example](./frontend/src/examples/mcpIntegrationExample.tsx)
- [Invoice Components](./frontend/src/components/forms/InvoiceForm.tsx)
- [Schema Provider](./backend/mcp_supabase_server.py)

## 🤝 Beitragen

1. Fork das Repository
2. Erstelle einen Feature-Branch
3. Implementiere deine Änderungen
4. Füge Tests hinzu
5. Erstelle einen Pull Request

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE) für Details.

## 🆘 Support

Bei Fragen oder Problemen:

1. Überprüfe die [FAQ](FAQ.md)
2. Suche in den [Issues](https://github.com/your-repo/issues)
3. Erstelle ein neues Issue mit detaillierter Beschreibung

---

**Entwickelt für VALEO NeuroERP - Intelligente ERP-Lösung mit KI-Integration** 🚀 