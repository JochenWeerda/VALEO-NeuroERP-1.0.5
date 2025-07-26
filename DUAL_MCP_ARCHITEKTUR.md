# Dual MCP Architektur für VALEO NeuroERP

## 🎯 Übersicht

Die **Dual MCP Architektur** ist eine erweiterte Implementierung des Model Context Protocol (MCP), die zwei separate MCP-Server verwendet, um optimale Komponenten-Generierung zu ermöglichen.

## 🏗️ Architektur-Übersicht

```
┌─────────────────────────────────────────────────────────────────┐
│                    VALEO NeuroERP Frontend                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │   Dual MCP      │    │   React Hooks   │                    │
│  │     Client      │◄──►│   (useDualMCP)  │                    │
│  └─────────────────┘    └─────────────────┘                    │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              Dual MCP Integration Layer                     │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
           │                                    │
           ▼                                    ▼
┌─────────────────────┐              ┌─────────────────────┐
│   MCP Server #1     │              │   MCP Server #2     │
│  Schema Server      │              │ UI Metadata Server  │
│  (Port 8000)        │              │  (Port 8001)        │
├─────────────────────┤              ├─────────────────────┤
│ • Tabellen-Schema   │              │ • UI-Komponenten    │
│ • Datentypen        │              │ • Labels & Tooltips │
│ • Foreign Keys      │              │ • Feld-Reihenfolge  │
│ • RLS-Policies      │              │ • Validierungsregeln│
│ • Constraints       │              │ • Layout-Konfig.    │
└─────────────────────┘              └─────────────────────┘
           │                                    │
           ▼                                    ▼
┌─────────────────────┐              ┌─────────────────────┐
│    Supabase DB      │              │   UI-Metadata       │
│   (PostgreSQL)      │              │   (JSON/CMS)        │
└─────────────────────┘              └─────────────────────┘
```

## 🧩 MCP Server #1: Schema Server

### Zweck
Bereitstellung der **strukturierten Wahrheit** der Datenbank.

### Quelle
- Supabase PostgreSQL-Datenbank
- Introspection API
- SQL-Reflection

### Enthält
- ✅ Tabellen- und Spaltennamen
- ✅ Datentypen (inkl. ENUMs, UUIDs, etc.)
- ✅ Foreign-Key-Beziehungen
- ✅ Constraints (NOT NULL, Default-Werte, etc.)
- ✅ RLS-Regeln (Row Level Security)
- ✅ Trigger und Policies

### Verwendung
- Typisch korrekte Formularfelder
- Auswahlmöglichkeiten
- TypeScript-Typensicherheit
- Zod-Validierungslogik

## 🎨 MCP Server #2: UI Metadata Server

### Zweck
Bereitstellung der **semantischen Darstellung** und **UX-Logik**.

### Quelle
- Entwickler-gesteuerte UI-Metadaten
- Pattern-Library
- CMS-basierte Konfiguration

### Enthält
- ✅ UI-Komponententypen (Dropdown, Datepicker, etc.)
- ✅ Label-Texte und Tooltips
- ✅ Feld-Reihenfolge und Gruppierung
- ✅ Validierungsregeln (UI-spezifisch)
- ✅ Layout-Konfiguration
- ✅ Event-Handling-Zuordnung

### Verwendung
- Visuelle, semantische Komponenten-Generierung
- UX-kohärente Darstellung
- Businesslogik-Anpassung
- VALEO-spezifische Konventionen

## 🔄 Kombination der MCPs

### Beispiel: Invoice-Formular

```typescript
// MCP #1 liefert Schema-Informationen:
{
  "field": "status",
  "type": "enum",
  "enum_values": ["open", "paid", "overdue"],
  "not_null": true,
  "default_value": "open"
}

// MCP #2 liefert UI-Metadata:
{
  "field": "status",
  "ui_component": "select",
  "label": "Rechnungsstatus",
  "order": 3,
  "tooltip": "Wählen Sie den aktuellen Status der Rechnung",
  "options": [
    {"value": "open", "label": "Offen", "color": "warning"},
    {"value": "paid", "label": "Bezahlt", "color": "success"},
    {"value": "overdue", "label": "Überfällig", "color": "error"}
  ]
}

// Ergebnis: Hochgradig korrekte UND visuell abgestimmte React-Komponente
```

## 🚀 Implementierung

### 1. Dual MCP Client

```typescript
// frontend/src/utils/dualMCPClient.ts
export class DualMCPClient {
  private schemaUrl: string;
  private uiMetadataUrl: string;

  constructor(
    schemaUrl: string = 'http://localhost:8000',
    uiMetadataUrl: string = 'http://localhost:8001'
  ) {
    this.schemaUrl = schemaUrl;
    this.uiMetadataUrl = uiMetadataUrl;
  }

  async getCombinedMetadata(tableName: string) {
    const [schema, uiMetadata] = await Promise.all([
      this.getSchema(tableName),
      this.getUIMetadata(tableName)
    ]);

    return this.combineMetadata(schema, uiMetadata);
  }
}
```

### 2. React Hooks

```typescript
// frontend/src/hooks/useDualMCP.ts
export const useDualMCPMetadata = (tableName: string) => {
  // Kombiniert Schema und UI-Metadata
};

export const useDualMCPForm = (tableName: string) => {
  // Schema-basierte Formulare mit UI-Metadata
};

export const useDualMCPTable = (tableName: string) => {
  // Schema-basierte Tabellen mit UI-Metadata
};

export const useDualMCPComponent = (tableName: string) => {
  // Automatische Komponenten-Generierung
};
```

### 3. Server-Implementierung

#### Schema Server (Port 8000)
```python
# backend/mcp_supabase_server.py
@app.get("/api/schema/{table_name}")
async def get_table_schema(table_name: str):
    # Liefert Supabase-Schema-Informationen
```

#### UI Metadata Server (Port 8001)
```python
# backend/mcp_ui_metadata_server.py
@app.get("/api/ui/complete/{table_name}")
async def get_complete_metadata(table_name: str):
    # Liefert UI-Metadata für Komponenten
```

## 📊 Vorteile der Dual-MCP-Architektur

### 1. Saubere Trennung
- **Schema**: Datenstruktur und Business-Logik
- **UI-Metadata**: Präsentation und UX-Logik

### 2. Flexibilität
- UI-Änderungen ohne Code-Änderungen
- Schema-Änderungen ohne UI-Anpassungen
- Unabhängige Entwicklung und Deployment

### 3. Wiederverwendbarkeit
- UI-Patterns für gesamtes ERP-System
- Konsistente UX-Konventionen
- Zentrale Konfiguration

### 4. Skalierbarkeit
- Separate Server für verschiedene Domains
- Unabhängige Skalierung
- Microservice-Architektur

### 5. Wartbarkeit
- Klare Verantwortlichkeiten
- Einfache Debugging
- Versionierung der Metadaten

## 🎯 Anwendungsfälle

### 1. Dynamische Formulare
```typescript
const { enhancedFields, form } = useDualMCPForm('invoices');

// Automatisch generierte Felder mit UI-Metadata
enhancedFields.map(field => (
  <Controller
    name={field.name}
    control={form.control}
    render={({ field: formField }) => (
      <TextField
        {...formField}
        label={field.label}
        placeholder={field.placeholder}
        tooltip={field.tooltip}
        // ... weitere UI-Metadata
      />
    )}
  />
))
```

### 2. Intelligente Tabellen
```typescript
const { tableMetadata, enhancedFields } = useDualMCPTable('customers');

// Automatische Spalten-Konfiguration
tableMetadata.actions.includes('create') && (
  <Button onClick={handleCreate}>
    {tableMetadata.create_button_text}
  </Button>
)
```

### 3. Code-Generierung
```typescript
const { formComponent, tableComponent } = useDualMCPComponent('assets');

// Automatisch generierter React-Code
console.log(formComponent); // Vollständige Formular-Komponente
console.log(tableComponent); // Vollständige Tabellen-Komponente
```

## 🔧 Konfiguration

### Environment Variables
```bash
# Schema Server
SCHEMA_MCP_URL=http://localhost:8000
SUPABASE_URL=https://ftybxxndembbfjdkcsuk.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# UI Metadata Server
UI_METADATA_MCP_URL=http://localhost:8001
UI_METADATA_SOURCE=json  # oder 'cms', 'database'
```

### Server-Start
```bash
# Schema Server starten
cd backend
python mcp_supabase_server.py

# UI Metadata Server starten
cd backend
python mcp_ui_metadata_server.py
```

## 📈 Performance-Optimierungen

### 1. Caching
- Schema-Cache mit TTL
- UI-Metadata-Cache
- Kombinierte Metadaten-Cache

### 2. Lazy Loading
- Bedarfsgerechte Metadaten-Ladung
- Progressive Enhancement
- Code-Splitting

### 3. Optimistic Updates
- UI-Änderungen ohne Server-Roundtrip
- Hintergrund-Synchronisation
- Offline-Support

## 🔒 Sicherheit

### 1. RLS-Compliance
- Automatische RLS-Policy-Anwendung
- Benutzer-spezifische Metadaten
- Rollen-basierte UI-Konfiguration

### 2. Validierung
- Schema-Validierung auf Server-Seite
- UI-Metadata-Validierung
- Cross-Site-Scripting-Schutz

### 3. Authentifizierung
- JWT-basierte Authentifizierung
- API-Key-Management
- Rate-Limiting

## 🧪 Testing

### 1. Unit Tests
```typescript
describe('DualMCPClient', () => {
  it('should combine schema and UI metadata', async () => {
    const client = new DualMCPClient();
    const result = await client.getCombinedMetadata('invoices');
    expect(result.combined).toBeDefined();
  });
});
```

### 2. Integration Tests
```typescript
describe('useDualMCPForm', () => {
  it('should generate form with combined metadata', () => {
    const { enhancedFields } = useDualMCPForm('customers');
    expect(enhancedFields.length).toBeGreaterThan(0);
  });
});
```

### 3. E2E Tests
```typescript
describe('Dual MCP Integration', () => {
  it('should render form with correct UI metadata', () => {
    // E2E Test mit Playwright/Cypress
  });
});
```

## 🚀 Deployment

### 1. Docker-Compose
```yaml
version: '3.8'
services:
  schema-mcp-server:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}

  ui-metadata-mcp-server:
    build: ./backend
    ports:
      - "8001:8001"
    environment:
      - UI_METADATA_SOURCE=json

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - SCHEMA_MCP_URL=http://schema-mcp-server:8000
      - UI_METADATA_MCP_URL=http://ui-metadata-mcp-server:8001
```

### 2. Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dual-mcp-servers
spec:
  replicas: 2
  selector:
    matchLabels:
      app: dual-mcp
  template:
    metadata:
      labels:
        app: dual-mcp
    spec:
      containers:
      - name: schema-server
        image: valeo/schema-mcp-server
        ports:
        - containerPort: 8000
      - name: ui-metadata-server
        image: valeo/ui-metadata-mcp-server
        ports:
        - containerPort: 8001
```

## 📚 Nächste Schritte

### 1. CMS-Integration
- Headless CMS für UI-Metadata
- Visueller Metadata-Editor
- Versionierung und Rollback

### 2. Advanced Features
- Drag & Drop UI-Builder
- Template-System
- Theme-Integration

### 3. Monitoring
- Performance-Monitoring
- Error-Tracking
- Usage-Analytics

### 4. Documentation
- API-Dokumentation
- Developer-Guides
- Best-Practices

## 🎯 Fazit

Die **Dual MCP Architektur** bietet eine leistungsstarke, skalierbare Lösung für die automatische Komponenten-Generierung in VALEO NeuroERP. Durch die Trennung von Schema und UI-Metadata wird eine hohe Flexibilität bei gleichzeitig optimaler Code-Qualität erreicht.

**Vorteile:**
- ✅ Saubere Trennung von Daten und Präsentation
- ✅ Hohe Flexibilität und Wartbarkeit
- ✅ Automatische Code-Generierung
- ✅ Konsistente UX-Konventionen
- ✅ Skalierbare Architektur

**Ergebnis:** Eine zukunftssichere, wartbare und benutzerfreundliche ERP-Lösung. 