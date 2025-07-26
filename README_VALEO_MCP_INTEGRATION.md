# 🚀 VALEO NeuroERP - MCP Supabase Integration

## 📋 Übersicht

Diese Integration verbindet das VALEO NeuroERP Frontend direkt mit deinem Supabase-Projekt über einen MCP (Model Context Protocol) Server. Dadurch können React-Komponenten automatisch basierend auf dem aktuellen Datenbankschema generiert werden.

## 🔗 Dein Supabase-Projekt

- **Projekt-ID**: `ftybxxndembbfjdkcsuk`
- **URL**: https://ftybxxndembbfjdkcsuk.supabase.co
- **Anon Key**: ✅ Konfiguriert
- **Service Role Key**: ✅ Konfiguriert

## 🏗️ Architektur

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │    │   MCP Server     │    │   Supabase      │
│   (Frontend)    │◄──►│   (Backend)      │◄──►│   (Database)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                       │                       │
        │                       │                       │
        ▼                       ▼                       ▼
   ┌─────────┐           ┌─────────┐           ┌─────────┐
   │useMCPForm│           │Schema API│           │PostgreSQL│
   │useMCPTable│          │Cache    │           │RLS      │
   │useMCPData│           │Validation│          │Triggers │
   └─────────┘           └─────────┘           └─────────┘
```

## 🚀 Schnellstart

### 1. MCP-Server starten

```powershell
# Windows
cd backend
.\start_mcp_server.ps1

# Oder manuell
python simple_mcp_server.py
```

### 2. Frontend starten

```bash
cd frontend
npm install
npm start
```

### 3. Integration testen

Öffne http://localhost:3000 und navigiere zur Test-Komponente.

## 📊 Verfügbare Endpunkte

### MCP-Server (http://localhost:8000)

| Endpunkt | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/health` | GET | Health-Check |
| `/api/tables` | GET | Alle Tabellen auflisten |
| `/api/schema/{table}` | GET | Schema für Tabelle |
| `/api/cache/clear` | POST | Cache leeren |

### Beispiel-Requests

```bash
# Health-Check
curl http://localhost:8000/api/health

# Tabellen auflisten
curl http://localhost:8000/api/tables

# Schema für invoices
curl http://localhost:8000/api/schema/invoices

# Cache leeren
curl -X POST http://localhost:8000/api/cache/clear
```

## 🎣 React Hooks

### useMCPForm

```tsx
import { useMCPForm } from '../hooks/useMCPForm';

const MyForm = () => {
  const form = useMCPForm({
    tableName: 'invoices',
    autoValidate: true,
    onSchemaLoad: (schema) => console.log('Schema geladen:', schema)
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('amount')} />
      {form.formState.errors.amount && (
        <span>{form.formState.errors.amount.message}</span>
      )}
    </form>
  );
};
```

### useMCPTable

```tsx
import { useMCPTable } from '../hooks/useMCPForm';

const MyTable = () => {
  const table = useMCPTable('invoices');
  
  return (
    <table>
      <thead>
        {table.schema?.columns.map(col => (
          <th key={col.name}>{col.name}</th>
        ))}
      </thead>
    </table>
  );
};
```

### useMCPData

```tsx
import { useMCPData } from '../hooks/useMCPForm';

const MyDataComponent = () => {
  const data = useMCPData('invoices');
  
  const loadData = async () => {
    const result = await data.fetchData();
    console.log('Daten geladen:', result);
  };
  
  return <button onClick={loadData}>Daten laden</button>;
};
```

## 🗄️ Datenbank-Schema

### Verfügbare Tabellen

| Tabelle | Beschreibung | Spalten | RLS |
|---------|--------------|---------|-----|
| `customers` | Kunden-Daten | 8 | ✅ |
| `products` | Produkt-Katalog | 10 | ✅ |
| `invoices` | Rechnungen | 7 | ✅ |
| `invoice_items` | Rechnungspositionen | 6 | ✅ |
| `orders` | Bestellungen | 8 | ✅ |
| `order_items` | Bestellpositionen | 6 | ✅ |

### Beispiel-Schema (invoices)

```json
{
  "table": "invoices",
  "columns": [
    {
      "name": "id",
      "type": "uuid",
      "primary": true,
      "not_null": true,
      "default": "gen_random_uuid()"
    },
    {
      "name": "customer_id",
      "type": "uuid",
      "foreign_key": "customers.id",
      "not_null": true
    },
    {
      "name": "amount",
      "type": "numeric",
      "not_null": true
    },
    {
      "name": "status",
      "type": "enum",
      "enum_values": ["open", "paid", "overdue"],
      "not_null": true,
      "default": "'open'"
    },
    {
      "name": "created_at",
      "type": "timestamp",
      "not_null": true,
      "default": "now()"
    }
  ],
  "rls": {
    "select": true,
    "insert": true,
    "update": false,
    "delete": false
  }
}
```

## 🔒 RLS-Richtlinien

### Business Rules

- **Invoices**: Können nicht bearbeitet oder gelöscht werden (Business Rule)
- **Invoice Items**: Können nicht bearbeitet oder gelöscht werden (Business Rule)
- **Customers**: Vollständige CRUD-Operationen erlaubt
- **Products**: Vollständige CRUD-Operationen erlaubt
- **Orders**: Vollständige CRUD-Operationen erlaubt

## 🎨 Komponenten-Generierung

### Automatische Generierung

```tsx
import { getCursorComponentGenerator } from '../utils/cursorComponentGenerator';

const generateComponent = async () => {
  const generator = getCursorComponentGenerator();
  
  const result = await generator.generateComponents({
    tableName: 'invoices',
    componentType: 'both', // form + table
    includeTests: true,
    includeDocumentation: true,
    language: 'de'
  });
  
  console.log('Generierte Komponenten:', result);
};
```

### GENXAIS Workflow

```tsx
import { getGENXAISIntegration } from '../utils/genxaisIntegration';

const runWorkflow = async () => {
  const genxais = getGENXAISIntegration();
  
  await genxais.executeFullWorkflow('invoices', {
    componentType: 'both',
    includeTests: true,
    language: 'de'
  });
};
```

## 🧪 Testing

### MCP-Integration testen

```tsx
import { TestMCPIntegration } from './examples/testMCPIntegration';

// In deiner App
<TestMCPIntegration />
```

### Automatische Tests

```bash
# Backend-Tests
cd backend
python -m pytest tests/

# Frontend-Tests
cd frontend
npm test
```

## 🔧 Konfiguration

### Umgebungsvariablen

```env
# Supabase
SUPABASE_URL=https://ftybxxndembbfjdkcsuk.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# MCP Server
MCP_SERVER_HOST=localhost
MCP_SERVER_PORT=8000
MCP_SERVER_DEBUG=true

# Cache
CACHE_TIMEOUT=300
CACHE_ENABLED=true
```

### Frontend-Konfiguration

```typescript
// src/config/supabase.ts
export const mcpConfig = {
  baseUrl: 'http://localhost:8000',
  projectId: 'ftybxxndembbfjdkcsuk'
};
```

## 📁 Projektstruktur

```
VALEO-NeuroERP-2.0/
├── backend/
│   ├── simple_mcp_server.py      # MCP-Server
│   ├── config.env               # Konfiguration
│   ├── start_mcp_server.ps1     # Startup-Skript
│   └── requirements.txt         # Dependencies
├── frontend/
│   ├── src/
│   │   ├── utils/
│   │   │   ├── mcpSchemaInjector.ts
│   │   │   ├── cursorComponentGenerator.ts
│   │   │   └── genxaisIntegration.ts
│   │   ├── hooks/
│   │   │   └── useMCPForm.ts
│   │   ├── config/
│   │   │   └── supabase.ts
│   │   └── examples/
│   │       └── testMCPIntegration.tsx
│   └── package.json
└── README_VALEO_MCP_INTEGRATION.md
```

## 🚀 Deployment

### Lokale Entwicklung

1. **MCP-Server starten**:
   ```powershell
   cd backend
   .\start_mcp_server.ps1
   ```

2. **Frontend starten**:
   ```bash
   cd frontend
   npm start
   ```

3. **Testen**:
   - MCP-Server: http://localhost:8000/api/health
   - Frontend: http://localhost:3000

### Produktion

1. **MCP-Server deployen**:
   ```bash
   # Docker
   docker build -t valeo-mcp-server .
   docker run -p 8000:8000 valeo-mcp-server
   
   # Oder direkt
   python simple_mcp_server.py
   ```

2. **Frontend deployen**:
   ```bash
   npm run build
   # Deploy zu deinem Hosting-Service
   ```

## 🔍 Troubleshooting

### Häufige Probleme

1. **MCP-Server startet nicht**:
   ```bash
   # Dependencies prüfen
   pip install -r requirements.txt
   
   # Port prüfen
   netstat -an | findstr :8000
   ```

2. **Supabase-Verbindung fehlschlägt**:
   ```bash
   # Keys prüfen
   curl -H "apikey: YOUR_ANON_KEY" \
        -H "Authorization: Bearer YOUR_ANON_KEY" \
        https://ftybxxndembbfjdkcsuk.supabase.co/rest/v1/
   ```

3. **Frontend kann MCP-Server nicht erreichen**:
   ```bash
   # CORS prüfen
   # MCP-Server läuft auf localhost:8000
   # Frontend läuft auf localhost:3000
   ```

### Logs

```bash
# MCP-Server Logs
tail -f backend/logs/mcp_server.log

# Frontend Logs
# Browser Developer Tools → Console
```

## 📞 Support

Bei Problemen:

1. **Logs prüfen**: MCP-Server und Browser-Konsole
2. **Health-Check**: http://localhost:8000/api/health
3. **Schema-Test**: http://localhost:8000/api/schema/invoices
4. **Cache leeren**: POST http://localhost:8000/api/cache/clear

## 🎯 Nächste Schritte

1. ✅ **MCP-Server konfiguriert**
2. ✅ **Supabase-Keys eingetragen**
3. ✅ **Frontend-Integration erstellt**
4. 🔄 **Datenbank-Schema erstellen**
5. 🔄 **RLS-Policies implementieren**
6. 🔄 **Komponenten generieren**
7. 🔄 **Tests schreiben**

---

**🎉 VALEO NeuroERP MCP-Integration erfolgreich eingerichtet!**

Dein Supabase-Projekt ist jetzt vollständig mit dem MCP-Server verbunden und kann automatisch React-Komponenten basierend auf dem aktuellen Datenbankschema generieren. 