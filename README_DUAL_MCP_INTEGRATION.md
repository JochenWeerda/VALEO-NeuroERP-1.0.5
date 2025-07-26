# 🚀 VALEO NeuroERP - Dual-MCP Integration

## 📋 Übersicht

Die Dual-MCP-Architektur kombiniert **Schema-Metadaten** (MCP #1) und **UI/UX-Metadaten** (MCP #2) für eine vollständig automatisierte React-Komponenten-Generierung.

## 🏗️ Architektur

### MCP #1 - Schema-MCP-Server (Port 8000)
- **Zweck**: Datenbank-Schema-Informationen
- **Quelle**: Supabase PostgreSQL
- **Daten**: Tabellen, Spalten, Datentypen, Foreign Keys, RLS-Richtlinien

### MCP #2 - UI-Metadata-MCP-Server (Port 8001)
- **Zweck**: UI/UX-Komponenten-Metadaten
- **Quelle**: Entwickler-definierte UI-Regeln
- **Daten**: Labels, Komponenten-Typen, Reihenfolge, Gruppierung, Validierung

## 🎯 Vorteile der Dual-MCP-Architektur

### ✅ Schema-Wahrheit (MCP #1)
- **Exakte Datentypen** aus der Datenbank
- **Foreign Key-Beziehungen** für Dropdowns
- **RLS-Richtlinien** für Sicherheit
- **Enum-Werte** für Selektionsfelder
- **NOT NULL-Constraints** für Validierung

### ✅ UI/UX-Wahrheit (MCP #2)
- **Semantische Labels** (deutsch)
- **Komponenten-Typen** (text, select, textarea)
- **Reihenfolge** und Gruppierung
- **Tooltips** und Placeholder
- **Business-Logik** und UX-Regeln

### ✅ Kombinierte Vorteile
- **Type-Safety** durch exakte Schema-Typen
- **Konsistente UI** durch zentrale Metadaten
- **Automatisierte Validierung** basierend auf Constraints
- **RLS-Compliance** für Sicherheit
- **Wartbare Komponenten** durch Metadaten-Definition

## 🔧 Installation & Setup

### 1. Services starten

```bash
# Schema MCP Server (Port 8000)
cd backend
python test_server.py

# UI Metadata MCP Server (Port 8001)
cd backend
python ui_metadata_server.py

# n8n Dashboard (Port 5678)
docker run -d --name valeo-n8n -p 5678:5678 \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=valeo2024 \
  -e OPENAI_API_KEY="your-openai-key" \
  n8nio/n8n:latest
```

### 2. Services testen

```bash
# Schema MCP Server
curl http://localhost:8000/api/tables
curl http://localhost:8000/api/schema/invoices

# UI Metadata MCP Server
curl http://localhost:8001/ui/tables
curl http://localhost:8001/ui/invoices

# n8n Dashboard
curl http://localhost:5678
```

## 📊 API-Endpunkte

### Schema MCP Server (Port 8000)
```
GET /api/health                    # Health Check
GET /api/tables                    # Alle Tabellen
GET /api/schema/{table_name}       # Schema für Tabelle
POST /api/cache/clear             # Cache leeren
```

### UI Metadata MCP Server (Port 8001)
```
GET /api/health                    # Health Check
GET /ui/tables                     # Alle Tabellen
GET /ui/{table_name}              # Vollständige UI-Metadaten
GET /ui/{table_name}/table        # Tabellen-UI-Metadaten
GET /ui/{table_name}/form         # Formular-UI-Metadaten
GET /ui/{table_name}/complete     # Kombinierte Metadaten
```

## 🔄 n8n-Workflow Integration

### Workflow: `dual-mcp-cursor-automation.json`

1. **Schema MCP** → Tabellen abrufen
2. **UI MCP** → UI-Metadaten abrufen
3. **Kombinieren** → Enhanced Fields erstellen
4. **Cursor AI** → React-Komponente generieren
5. **Speichern** → Komponente in Datei schreiben

### Workflow-Schritte:
```
Schema MCP (Port 8000) → UI MCP (Port 8001) → Combine → Cursor AI → Save
```

## 🎨 React-Komponenten-Generierung

### Enhanced Fields Beispiel (invoices)

```typescript
interface EnhancedField {
  // Schema-Informationen (MCP #1)
  name: string;                    // "customer_id"
  type: string;                    // "uuid"
  not_null: boolean;               // true
  is_primary_key: boolean;         // false
  is_foreign_key: boolean;         // true
  foreign_table?: string;          // "customers.id"
  enum_values?: string[];          // ["open", "paid", "overdue"]
  
  // UI-Informationen (MCP #2)
  ui_component: string;            // "select"
  label: string;                   // "Kunde"
  placeholder?: string;            // "Kunde auswählen"
  tooltip?: string;                // "Wählen Sie den Kunden"
  order: number;                   // 2
  required: boolean;               // true
  readonly: boolean;               // false
  hidden: boolean;                 // false
  group?: string;                  // "basic_info"
  options?: Array<{                // Dropdown-Optionen
    value: string;
    label: string;
    color?: string;
  }>;
}
```

### Generierte React-Komponente

```tsx
// InvoiceForm.tsx (automatisch generiert)
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const InvoiceSchema = z.object({
  customer_id: z.string().uuid('Ungültige Kunden-ID'),
  amount: z.number().positive('Betrag muss positiv sein'),
  status: z.enum(['open', 'paid', 'overdue']),
  notes: z.string().optional()
});

export const InvoiceForm = () => {
  const form = useForm<z.infer<typeof InvoiceSchema>>({
    resolver: zodResolver(InvoiceSchema)
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField
        control={form.control}
        name="customer_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kunde *</FormLabel>
            <Select onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Kunde auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Max Mustermann</SelectItem>
                <SelectItem value="2">Firma GmbH</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* Weitere Felder... */}
    </form>
  );
};
```

## 🧪 Demo-Komponente

### DualMCPDemo.tsx

```tsx
// Vollständige Demo der Dual-MCP-Integration
import DualMCPDemo from '@/examples/DualMCPDemo';

// Zeigt:
// - Kombinierte Schema- und UI-Metadaten
// - Enhanced Fields mit allen Informationen
// - RLS-Richtlinien
// - Formular-Gruppen
// - Live-Daten von beiden MCP-Servern
```

## 🔒 Sicherheit & RLS

### Row Level Security (RLS)
```sql
-- Beispiel RLS-Richtlinien
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoices" ON invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### MCP-Server Sicherheit
- **JWT-Authentifizierung** für MCP-Requests
- **CORS-Konfiguration** für Frontend-Integration
- **Rate Limiting** für API-Endpunkte
- **Input-Validierung** für alle Parameter

## 🚀 Automatisierung

### n8n-Workflow Schritte

1. **Trigger**: Webhook oder Schedule
2. **Schema MCP**: Tabellen abrufen
3. **UI MCP**: UI-Metadaten abrufen
4. **Combine**: Enhanced Fields erstellen
5. **Cursor AI**: Komponente generieren
6. **Save**: Datei speichern
7. **Notify**: Erfolg/Fehler melden

### Beispiel-Workflow-Ausführung

```json
{
  "status": "success",
  "message": "Dual MCP Integration erfolgreich",
  "generated_components": [
    "InvoiceForm.tsx",
    "InvoiceFormSchema.ts",
    "InvoiceTypes.ts"
  ],
  "timestamp": "2025-07-22T19:30:00.000Z"
}
```

## 📈 Monitoring & Logging

### Health Checks
```bash
# Schema MCP Server
curl http://localhost:8000/api/health
# Response: {"status": "healthy", "provider_initialized": true}

# UI Metadata MCP Server
curl http://localhost:8001/api/health
# Response: {"status": "healthy", "available_tables": 3}
```

### Logging
- **Schema MCP**: Supabase-Verbindung, Cache-Status
- **UI MCP**: Metadaten-Zugriffe, Validierung
- **n8n**: Workflow-Ausführung, AI-Generierung

## 🔧 Konfiguration

### Environment Variables
```bash
# Supabase
SUPABASE_URL=https://ftybxxndembbfjdkcsuk.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# OpenAI
OPENAI_API_KEY=your-openai-key

# n8n
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=valeo2024
```

### MCP-Server Konfiguration
```python
# Schema MCP Server
SUPABASE_URL = "https://ftybxxndembbfjdkcsuk.supabase.co"
SUPABASE_KEY = "your-anon-key"

# UI Metadata MCP Server
UI_METADATA = {
    "invoices": { /* UI-Metadaten */ },
    "customers": { /* UI-Metadaten */ },
    "assets": { /* UI-Metadaten */ }
}
```

## 🎯 Nächste Schritte

### 1. Produktions-Setup
- [ ] Supabase-Produktions-Datenbank konfigurieren
- [ ] MCP-Server in Docker-Container deployen
- [ ] n8n-Workflows für Produktion anpassen
- [ ] Monitoring und Alerting einrichten

### 2. Erweiterte Features
- [ ] Mehr Tabellen und UI-Metadaten hinzufügen
- [ ] Komplexe Validierungsregeln implementieren
- [ ] Multi-Sprach-Unterstützung
- [ ] Theme-Integration

### 3. Integration
- [ ] CI/CD-Pipeline für automatische Komponenten-Generierung
- [ ] Code-Review-Workflow für generierte Komponenten
- [ ] Testing-Automatisierung für generierte Komponenten
- [ ] Dokumentation-Automatisierung

## 📚 Ressourcen

- **MCP-Protokoll**: https://modelcontextprotocol.io/
- **Supabase**: https://supabase.com/docs
- **n8n**: https://docs.n8n.io/
- **Cursor AI**: https://cursor.sh/docs
- **React Hook Form**: https://react-hook-form.com/
- **Zod**: https://zod.dev/
- **Shadcn UI**: https://ui.shadcn.com/

## 🤝 Support

Bei Fragen oder Problemen:
1. **Logs prüfen**: MCP-Server und n8n-Logs
2. **Health Checks**: API-Endpunkte testen
3. **Dokumentation**: README-Dateien konsultieren
4. **Issues**: GitHub-Repository verwenden

---

**VALEO NeuroERP - Dual-MCP Integration**  
*Automatisierte React-Komponenten-Generierung mit Schema- und UI-Metadaten* 