# Cursor.ai Integration Guide - Dual MCP Architektur

## 🎯 Übersicht

Diese Anleitung zeigt, wie Sie die **Dual MCP Architektur** mit **Cursor.ai** für automatische React-Komponenten-Generierung verwenden können.

## 🏗️ Architektur

```
┌─────────────────────────────────────────────────────────────────┐
│                    Cursor.ai Workflow                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │   Prompt File   │    │   MCP Context   │                    │
│  │   (.md)         │◄──►│   (Schema + UI) │                    │
│  └─────────────────┘    └─────────────────┘                    │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              Cursor.ai Generation Engine                   │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────┐              ┌─────────────────────┐
│   Generated Code    │              │   n8n Automation    │
│   (React + TS)      │              │   (Optional)        │
└─────────────────────┘              └─────────────────────┘
```

## 📁 Dateistruktur

```
cursor-prompts/
├── generate-react-form-shadcn-mcp.md      # Formular-Prompt
├── generate-react-table-shadcn-mcp.md     # Tabellen-Prompt
└── generate-react-component-shadcn-mcp.md # Allgemeiner Prompt

n8n-flows/
└── dual-mcp-cursor-automation.json        # Automatisierung

generated-components/
├── invoices/
│   ├── InvoiceForm.tsx
│   ├── InvoiceFormSchema.ts
│   ├── InvoiceTable.tsx
│   ├── InvoiceTableSchema.ts
│   └── README.md
└── customers/
    ├── CustomerForm.tsx
    ├── CustomerFormSchema.ts
    ├── CustomerTable.tsx
    ├── CustomerTableSchema.ts
    └── README.md
```

## 🚀 Schnellstart

### 1. MCP-Server starten

```bash
# Terminal 1: Schema Server
cd backend
python mcp_supabase_server.py

# Terminal 2: UI Metadata Server
cd backend
python mcp_ui_metadata_server.py
```

### 2. Prompt-Template verwenden

```bash
# In Cursor.ai
CMD+K → Run prompt from file → cursor-prompts/generate-react-form-shadcn-mcp.md
```

### 3. Live-Schema einfügen

```json
// MCP #1: Schema-Kontext
{
  "table": "invoices",
  "columns": [
    { "name": "id", "type": "uuid", "primary": true },
    { "name": "customer_id", "type": "uuid", "foreign_key": "customers.id" },
    { "name": "amount", "type": "numeric", "not_null": true },
    { "name": "status", "type": "enum", "enum_values": ["open", "paid", "overdue"] }
  ]
}

// MCP #2: UI-Metadata-Kontext
{
  "form": {
    "fields": [
      {
        "field_name": "customer_id",
        "ui_component": "select",
        "label": "Kunde",
        "order": 1
      }
    ]
  }
}
```

## 📋 Prompt-Templates

### 1. Formular-Generierung

**Datei:** `cursor-prompts/generate-react-form-shadcn-mcp.md`

**Verwendung:**
```bash
# In Cursor.ai
CMD+K → Run prompt from file → generate-react-form-shadcn-mcp.md
```

**Features:**
- ✅ Dual-MCP Integration (Schema + UI-Metadata)
- ✅ Shadcn UI Komponenten
- ✅ React Hook Form + Zod
- ✅ TypeScript-Typisierung
- ✅ Responsive Design
- ✅ Accessibility Features

### 2. Tabellen-Generierung

**Datei:** `cursor-prompts/generate-react-table-shadcn-mcp.md`

**Verwendung:**
```bash
# In Cursor.ai
CMD+K → Run prompt from file → generate-react-table-shadcn-mcp.md
```

**Features:**
- ✅ TanStack Table Integration
- ✅ Sortierung, Filterung, Pagination
- ✅ Row Selection & Bulk Actions
- ✅ Responsive Design
- ✅ Export-Funktionalität

## 🔧 Automatisierung mit n8n

### 1. n8n-Flow importieren

```bash
# n8n-Flow importieren
n8n import --input n8n-flows/dual-mcp-cursor-automation.json
```

### 2. Environment Variables setzen

```bash
# .env Datei erstellen
CURSOR_API_KEY=your_cursor_api_key
WEBHOOK_URL=https://your-webhook-url.com/notifications
```

### 3. Flow konfigurieren

```json
{
  "nodes": [
    {
      "name": "Schema MCP Server",
      "url": "http://localhost:8000/api/schema/{{ $json.table_name }}"
    },
    {
      "name": "UI Metadata MCP Server", 
      "url": "http://localhost:8001/api/ui/complete/{{ $json.table_name }}"
    }
  ]
}
```

### 4. Flow ausführen

```bash
# Manuell ausführen
n8n execute --workflow "Dual MCP Cursor Automation" --data '{"table_name": "invoices"}'

# Oder per Webhook
curl -X POST http://localhost:5678/webhook/dual-mcp \
  -H "Content-Type: application/json" \
  -d '{"table_name": "invoices"}'
```

## 🎯 Verwendung in Cursor.ai

### 1. Prompt-Template laden

```markdown
# In Cursor.ai
1. CMD+K drücken
2. "Run prompt from file" auswählen
3. Datei: cursor-prompts/generate-react-form-shadcn-mcp.md
4. Enter drücken
```

### 2. Live-Schema einfügen

```typescript
// Vor dem Prompt das aktuelle Schema einfügen
const schema = await fetch('http://localhost:8000/api/schema/invoices');
const uiMetadata = await fetch('http://localhost:8001/api/ui/complete/invoices');

// Schema in den Prompt einfügen
```

### 3. Komponente generieren

```typescript
// Cursor.ai generiert automatisch:
// - InvoiceForm.tsx
// - InvoiceFormSchema.ts
// - TypeScript-Typen
// - Zod-Validierung
// - Shadcn UI Komponenten
```

## 📊 Beispiel-Ausgabe

### Generierte Formular-Komponente

```tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Zod Schema (aus MCP Schema generiert)
const InvoiceFormSchema = z.object({
  customer_id: z.string().uuid('Ungültige Kunden-ID'),
  amount: z.number().positive('Betrag muss positiv sein'),
  status: z.enum(['open', 'paid', 'overdue']),
  notes: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof InvoiceFormSchema>;

interface InvoiceFormProps {
  initialData?: Partial<InvoiceFormValues>;
  onSubmit: (data: InvoiceFormValues) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(InvoiceFormSchema),
    defaultValues: {
      customer_id: initialData?.customer_id || '',
      amount: initialData?.amount || 0,
      status: initialData?.status || 'open',
      notes: initialData?.notes || '',
    },
  });

  const handleSubmit = async (data: InvoiceFormValues) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Rechnung</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kunde *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Kunde auswählen" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Betrag *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full p-2 border rounded">
                      <option value="open">Offen</option>
                      <option value="paid">Bezahlt</option>
                      <option value="overdue">Überfällig</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notizen</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      className="w-full p-2 border rounded"
                      rows={4}
                      placeholder="Optionale Notizen..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Speichere...' : 'Speichern'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default InvoiceForm;
```

### Generiertes Zod-Schema

```typescript
// InvoiceFormSchema.ts
import { z } from 'zod';

export const InvoiceFormSchema = z.object({
  customer_id: z.string().uuid('Ungültige Kunden-ID'),
  amount: z.number().positive('Betrag muss positiv sein'),
  status: z.enum(['open', 'paid', 'overdue']),
  notes: z.string().optional(),
});

export type InvoiceFormValues = z.infer<typeof InvoiceFormSchema>;
```

## 🔄 Workflow-Automatisierung

### 1. Automatische Schema-Erkennung

```bash
# Alle Tabellen auflisten
curl http://localhost:8000/api/schema/tables

# Schema für spezifische Tabelle
curl http://localhost:8000/api/schema/invoices
```

### 2. Batch-Generierung

```bash
# Mehrere Tabellen auf einmal generieren
for table in invoices customers assets; do
  n8n execute --workflow "Dual MCP Cursor Automation" \
    --data "{\"table_name\": \"$table\"}"
done
```

### 3. Git-Integration

```bash
# Automatischer Commit nach Generierung
git add generated-components/
git commit -m "feat: Add $TABLE_NAME components via Dual MCP"
git push origin main
```

## 🧪 Testing

### 1. Komponenten testen

```bash
# TypeScript-Kompilierung testen
npx tsc --noEmit

# Unit Tests ausführen
npm test

# Storybook starten
npm run storybook
```

### 2. Integration testen

```bash
# MCP-Server testen
curl http://localhost:8000/health
curl http://localhost:8001/health

# Schema-API testen
curl http://localhost:8000/api/schema/invoices
```

## 🚀 Deployment

### 1. Produktions-Setup

```bash
# Environment Variables
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# MCP-Server starten
docker-compose up -d
```

### 2. CI/CD Pipeline

```yaml
# .github/workflows/component-generation.yml
name: Component Generation
on:
  push:
    paths: ['backend/mcp_*.py']
  workflow_dispatch:
    inputs:
      table_name:
        description: 'Table to generate components for'
        required: true

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Start MCP Servers
        run: |
          cd backend
          python mcp_supabase_server.py &
          python mcp_ui_metadata_server.py &
      - name: Generate Components
        run: |
          n8n execute --workflow "Dual MCP Cursor Automation" \
            --data '{"table_name": "${{ github.event.inputs.table_name }}"}'
      - name: Commit Changes
        run: |
          git add generated-components/
          git commit -m "feat: Auto-generate ${{ github.event.inputs.table_name }} components"
          git push
```

## 📈 Monitoring & Analytics

### 1. Erfolgs-Metriken

- **Generierungsrate**: % erfolgreicher Komponenten-Generierungen
- **Code-Qualität**: TypeScript-Fehler, Linting-Score
- **Performance**: Generierungszeit, Bundle-Größe
- **Nutzung**: Häufigkeit der Komponenten-Verwendung

### 2. Error-Tracking

```typescript
// Error-Tracking in generierten Komponenten
try {
  await onSubmit(data);
} catch (error) {
  console.error('Form submission error:', error);
  // Error-Tracking (Sentry, LogRocket, etc.)
  trackError('form_submission_error', {
    table: 'invoices',
    error: error.message,
    timestamp: new Date().toISOString()
  });
}
```

## 🎯 Best Practices

### 1. Prompt-Engineering

- **Klare Anweisungen**: Spezifische, messbare Ziele
- **Kontext bereitstellen**: Vollständige Schema-Informationen
- **Beispiele einbauen**: Konkrete Code-Beispiele
- **Iterative Verbesserung**: Feedback-Schleifen

### 2. Code-Qualität

- **TypeScript**: Strikte Typisierung
- **Zod-Validierung**: Schema-basierte Validierung
- **Error Handling**: Graceful Error-Behandlung
- **Accessibility**: ARIA-Labels, Keyboard Navigation

### 3. Performance

- **Lazy Loading**: Bedarfsgerechte Komponenten-Ladung
- **Code-Splitting**: Automatische Bundle-Optimierung
- **Caching**: MCP-Response-Caching
- **Optimization**: React.memo, useMemo, useCallback

## 🔮 Zukunftsvision

### 1. Erweiterte Features

- **Visual Builder**: Drag & Drop UI-Konfiguration
- **Template-System**: Wiederverwendbare Komponenten-Patterns
- **Theme-Integration**: Automatische Theme-Anpassung
- **Multi-Language**: Internationalisierung (i18n)

### 2. KI-Integration

- **Smart Suggestions**: KI-basierte Komponenten-Vorschläge
- **Auto-Optimization**: Automatische Performance-Optimierung
- **Code Review**: KI-gestützte Code-Qualitäts-Prüfung
- **Documentation**: Automatische Dokumentations-Generierung

### 3. Ecosystem

- **Plugin-System**: Erweiterbare MCP-Server
- **Marketplace**: Komponenten-Templates teilen
- **Community**: Entwickler-Community aufbauen
- **Standards**: Offene Standards für MCP-Integration

---

## 📞 Support

Bei Fragen oder Problemen:

1. **GitHub Issues**: [VALEO-NeuroERP-2.0 Issues](https://github.com/JochenWeerda/VALEO-NeuroERP-2.0/issues)
2. **Documentation**: [DUAL_MCP_ARCHITEKTUR.md](./DUAL_MCP_ARCHITEKTUR.md)
3. **Examples**: [DualMCPExample.tsx](./frontend/src/examples/DualMCPExample.tsx)

---

**Hinweis**: Diese Integration nutzt die **Dual-MCP-Architektur** für optimale Komponenten-Generierung. Schema und UI-Metadata werden kombiniert, um hochwertige, wartbare React-Komponenten zu erstellen. 