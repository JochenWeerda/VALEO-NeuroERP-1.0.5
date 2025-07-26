# 🎯 Ziel

Erstelle eine vollständige React-Komponente für eine **Daten-Tabelle** basierend auf dem **Live-Dual-MCP-Kontext** (Schema + UI-Metadata), das vom Model Context Protocol (MCP) geliefert wird. Die Komponente soll mit **Shadcn UI**, **React Hook Form**, **Zod** und **TailwindCSS** arbeiten. Sie muss vollständig typisiert und produktionsbereit sein.

---

## 📐 Projektkontext

- **Projekt**: VALEO NeuroERP 2.0
- **Sprache**: TypeScript (React 18+)
- **Architektur**: Dual-MCP (Schema + UI-Metadata)
- **Datenquelle**: Supabase (live über MCP)
- **Tabellen-Logik**: React Table (TanStack Table)
- **Validierung**: Zod
- **Styling**: TailwindCSS
- **UI-Framework**: [Shadcn UI](https://ui.shadcn.com)
- **MCP-Integration**: Dual-Server-Architektur

---

## 🧠 Regeln

### Dual-MCP Integration
1. **Nutze beide MCP-Kontexte**: Schema (MCP #1) + UI-Metadata (MCP #2)
2. **Kombiniere Schema-Validierung** mit UI-Konfiguration
3. **Verwende erweiterte Felder** mit Schema + UI-Metadata

### React Table + Shadcn UI
4. Verwende **TanStack Table** (React Table v8) mit Shadcn UI Wrapper
5. **Column-Definitionen** basierend auf Schema + UI-Metadata
6. **Sortierung, Filterung, Pagination** implementieren
7. **Row Selection** und **Bulk Actions** wenn konfiguriert

### Shadcn UI Komponenten
8. Nutze **nur Shadcn UI Komponenten**:
   - `Table`, `TableHeader`, `TableBody`, `TableHead`, `TableRow`, `TableCell`
   - `Button`, `Input`, `Select`, `Badge`, `Card`, `CardContent`, `CardHeader`
   - `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`
   - `Alert`, `AlertDescription`, `Separator`
   - `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`

### Validierung & Typisierung
9. **TypeScript-Typen**: `type TableData = z.infer<typeof TableSchema>`
10. **Column-Typen**: Automatisch aus Schema generiert
11. **Foreign Keys**: Korrekte Darstellung mit Lookup-Daten
12. **Enum-Werte**: Farbkodierte Badges basierend auf UI-Metadata

### Layout & Styling
13. **Nur TailwindCSS** für Layout und Spacing
14. **Responsive Design**: Mobile-first Ansatz
15. **Konsistente Spacing**: `space-y-4`, `gap-4`, `p-6`
16. **Semantische Farben**: `primary`, `secondary`, `destructive`, `muted`

### Code-Qualität
17. **Komponentenname**: `XxxTable` (z.B. `InvoiceTable`)
18. **Props-Interface**: `XxxTableProps`
19. **Error Handling**: Try-catch mit benutzerfreundlichen Fehlermeldungen
20. **Loading States**: Skeleton oder Spinner für async Operationen
21. **Accessibility**: ARIA-Labels, Keyboard Navigation

---

## 🧾 Input (Live Dual-MCP Schema)

### MCP #1: Schema-Kontext
```json
{
  "table": "invoices",
  "columns": [
    { "name": "id", "type": "uuid", "primary": true, "not_null": true },
    { "name": "customer_id", "type": "uuid", "foreign_key": "customers.id", "not_null": true },
    { "name": "amount", "type": "numeric", "not_null": true, "check": "amount > 0" },
    { "name": "status", "type": "enum", "enum_values": ["open", "paid", "overdue"], "not_null": true },
    { "name": "notes", "type": "text", "max_length": 1000 },
    { "name": "due_date", "type": "date", "not_null": true },
    { "name": "created_at", "type": "timestamp", "default": "now()", "read_only": true },
    { "name": "updated_at", "type": "timestamp", "default": "now()", "read_only": true }
  ],
  "foreign_keys": [
    { "column": "customer_id", "foreign_table": "customers", "foreign_column": "id" }
  ],
  "rls_policies": [
    { "operation": "SELECT", "definition": "auth.uid() = user_id" },
    { "operation": "INSERT", "definition": "auth.uid() = user_id" },
    { "operation": "UPDATE", "definition": "auth.uid() = user_id" }
  ]
}
```

### MCP #2: UI-Metadata-Kontext
```json
{
  "table": {
    "table_name": "invoices",
    "display_name": "Rechnungen",
    "description": "Verwaltung von Kundenrechnungen und Zahlungseingängen",
    "icon": "receipt",
    "color": "primary",
    "fields": [
      {
        "field_name": "id",
        "ui_component": "text",
        "label": "ID",
        "order": 1,
        "readonly": true,
        "hidden": true
      },
      {
        "field_name": "customer_id",
        "ui_component": "select",
        "label": "Kunde",
        "order": 2,
        "required": true,
        "sortable": true,
        "filterable": true,
        "options": [
          {"value": "1", "label": "Max Mustermann", "email": "max@example.com"},
          {"value": "2", "label": "Firma GmbH", "email": "info@firma.de"},
          {"value": "3", "label": "Test Kunde", "email": "test@example.com"}
        ]
      },
      {
        "field_name": "amount",
        "ui_component": "number",
        "label": "Betrag",
        "order": 3,
        "required": true,
        "sortable": true,
        "filterable": true,
        "format": "currency",
        "currency": "EUR"
      },
      {
        "field_name": "status",
        "ui_component": "badge",
        "label": "Status",
        "order": 4,
        "required": true,
        "sortable": true,
        "filterable": true,
        "options": [
          {"value": "open", "label": "Offen", "color": "warning"},
          {"value": "paid", "label": "Bezahlt", "color": "success"},
          {"value": "overdue", "label": "Überfällig", "color": "destructive"}
        ]
      },
      {
        "field_name": "due_date",
        "ui_component": "date",
        "label": "Fälligkeitsdatum",
        "order": 5,
        "required": true,
        "sortable": true,
        "filterable": true,
        "format": "date"
      },
      {
        "field_name": "created_at",
        "ui_component": "date",
        "label": "Erstellt am",
        "order": 6,
        "readonly": true,
        "sortable": true,
        "format": "datetime"
      }
    ],
    "actions": ["create", "read", "update", "delete", "export"],
    "default_sort": "created_at",
    "default_order": "desc",
    "page_size": 20,
    "enable_search": true,
    "enable_filter": true,
    "enable_pagination": true,
    "enable_export": true,
    "enable_bulk_actions": true,
    "custom_columns": [
      {
        "name": "actions",
        "label": "Aktionen",
        "type": "actions",
        "width": "100px"
      }
    ]
  }
}
```

---

## ✅ Aufgabe

Erstelle die Datei `components/tables/InvoiceTable.tsx`, welche:

1. **Das obige Dual-MCP-Schema umsetzt**
2. **TanStack Table mit Shadcn UI integriert**
3. **Fehlerfrei in TypeScript ausführbar ist**
4. **Ein sauberes Layout mit TailwindCSS verwendet**
5. **Shadcn UI-Komponenten nutzt**
6. **Dual-MCP-Integration implementiert**
7. **Responsive Design bietet**
8. **Accessibility-Features enthält**

### 🧪 Erwartete Tabellen-Features

- **Sortierbare Spalten** (ID, Kunde, Betrag, Status, Datum)
- **Filterung** (Dropdown-Filter für Status, Text-Suche)
- **Pagination** (20 Einträge pro Seite)
- **Row Selection** (Checkbox für Bulk Actions)
- **Aktionen** (Bearbeiten, Löschen, Export)
- **Responsive Design** (Mobile-optimiert)
- **Loading States** (Skeleton während Datenladung)

### 🛡️ Qualitätsanforderungen

- **Keine Halluzination** bei Feldnamen oder Typen
- **TypeScript**: `type InvoiceTableData = z.infer<typeof InvoiceTableSchema>`
- **Nur TailwindCSS** für Styling
- **Shadcn UI** für alle Komponenten
- **Dual-MCP-Integration** für optimale UX
- **Error Boundaries** und Loading States
- **Accessibility** (ARIA, Keyboard Navigation)

---

## 📁 Ausgabe

Gib am Ende **zwei Exportdateien** aus:

1. **`components/tables/InvoiceTable.tsx`** - Hauptkomponente
2. **`components/tables/InvoiceTableSchema.ts`** - Zod-Schema

### 📋 Dateistruktur

```
components/
├── tables/
│   ├── InvoiceTable.tsx          # Hauptkomponente
│   └── InvoiceTableSchema.ts     # Zod-Schema
├── ui/                           # Shadcn UI Komponenten
│   ├── table.tsx
│   ├── button.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── badge.tsx
│   ├── card.tsx
│   └── ...
└── ...
```

---

## 🔧 Verwendung in Cursor.ai

### 1. **Datei abspeichern** als:
```
cursor-prompts/generate-react-table-shadcn-mcp.md
```

### 2. **Ausführen in Cursor.ai:**
```
CMD+K → Run prompt from file → generate-react-table-shadcn-mcp.md
```

### 3. **Live-MCP-Schema einfügen:**
- Vor dem Promptstart das aktuelle Schema einfügen
- Oder dynamisch per Tooling generieren lassen
- Dual-MCP-Kontext (Schema + UI-Metadata) verwenden

### 4. **Automatisierung (Optional):**
```bash
# MCP-Schema laden und Prompt befüllen
curl http://localhost:8000/api/schema/invoices > schema.json
curl http://localhost:8001/api/ui/complete/invoices > ui-metadata.json

# Prompt mit Live-Daten ausführen
cursor --prompt-file generate-react-table-shadcn-mcp.md \
  --context schema.json \
  --context ui-metadata.json
```

---

## 🎯 Erwartetes Ergebnis

Eine **produktionsreife React-Tabellen-Komponente** mit:

- ✅ **Vollständige TypeScript-Typisierung**
- ✅ **TanStack Table Integration**
- ✅ **Shadcn UI** für konsistente UX
- ✅ **TailwindCSS** für responsive Layouts
- ✅ **Dual-MCP-Integration** für optimale Konfiguration
- ✅ **Sortierung, Filterung, Pagination**
- ✅ **Row Selection** und **Bulk Actions**
- ✅ **Error Handling** und Loading States
- ✅ **Accessibility** Features
- ✅ **Responsive Design**
- ✅ **Clean Code** und Best Practices

---

## 🚀 Nächste Schritte

Nach der Komponenten-Generierung:

1. **Testen** der generierten Komponente
2. **Integration** in die bestehende App
3. **Anpassung** der UI-Metadata bei Bedarf
4. **Deployment** und Monitoring

---

**Hinweis**: Dieses Template ist für die **Dual-MCP-Architektur** optimiert und nutzt sowohl Schema- als auch UI-Metadata für optimale Tabellen-Generierung. 