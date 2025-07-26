# 🎯 Ziel

Erstelle eine vollständige React-Komponente für ein Formular basierend auf dem **Live-Dual-MCP-Kontext** (Schema + UI-Metadata), das vom Model Context Protocol (MCP) geliefert wird. Die Komponente soll mit **Shadcn UI**, **React Hook Form**, **Zod** und **TailwindCSS** arbeiten. Sie muss vollständig typisiert und produktionsbereit sein.

---

## 📐 Projektkontext

- **Projekt**: VALEO NeuroERP 2.0
- **Sprache**: TypeScript (React 18+)
- **Architektur**: Dual-MCP (Schema + UI-Metadata)
- **Datenquelle**: Supabase (live über MCP)
- **Formularlogik**: React Hook Form
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

### React Hook Form + Zod
4. Verwende `useForm()` aus React Hook Form mit `zodResolver`
5. **Zod-Schema muss separat** als Konstante exportiert werden (`InvoiceFormSchema`, `CustomerFormSchema`, ...)
6. **TypeScript-Typen**: `type FormValues = z.infer<typeof FormSchema>`

### Shadcn UI Komponenten
7. Nutze **nur Shadcn UI Komponenten**:
   - `Form`, `FormField`, `FormLabel`, `FormControl`, `FormMessage`
   - `Input`, `Textarea`, `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`
   - `Button`, `Card`, `CardContent`, `CardHeader`, `CardTitle`
   - `Alert`, `AlertDescription`
   - `Label`, `Badge`, `Separator`

### Validierung & Typisierung
8. **Alle Pflichtfelder** laut Schema müssen korrekt behandelt werden
9. **Foreign Keys**: Verwende `Select` mit `label`/`value`-Mapping
10. **Enum-Werte**: Verwende Schema-Enum-Werte + UI-Metadata-Optionen
11. **Readonly-Felder**: Markiere als `disabled` oder `readOnly`

### Layout & Styling
12. **Nur TailwindCSS** für Layout und Spacing
13. **Responsive Design**: Mobile-first Ansatz
14. **Konsistente Spacing**: `space-y-4`, `gap-4`, `p-6`
15. **Semantische Farben**: `primary`, `secondary`, `destructive`, `muted`

### Code-Qualität
16. **Komponentenname**: `XxxForm` (z.B. `InvoiceForm`)
17. **Props-Interface**: `XxxFormProps`
18. **Error Handling**: Try-catch mit benutzerfreundlichen Fehlermeldungen
19. **Loading States**: Skeleton oder Spinner für async Operationen
20. **Accessibility**: ARIA-Labels, Keyboard Navigation

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
  "form": {
    "form_name": "invoice_form",
    "display_name": "Rechnung",
    "description": "Erstellen oder bearbeiten einer Kundenrechnung",
    "layout": "vertical",
    "submit_button_text": "Rechnung speichern",
    "cancel_button_text": "Abbrechen",
    "show_progress": true,
    "auto_save": false,
    "validation_mode": "onSubmit",
    "fields": [
      {
        "field_name": "customer_id",
        "ui_component": "select",
        "label": "Kunde",
        "placeholder": "Kunde auswählen",
        "tooltip": "Wählen Sie den Kunden für diese Rechnung",
        "order": 1,
        "required": true,
        "group": "basic_info",
        "icon": "user",
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
        "placeholder": "0.00",
        "tooltip": "Rechnungsbetrag in Euro",
        "order": 2,
        "required": true,
        "group": "basic_info",
        "min_value": 0.01,
        "step": 0.01,
        "icon": "euro",
        "validation_rules": {
          "positive": true,
          "currency": "EUR"
        }
      },
      {
        "field_name": "status",
        "ui_component": "select",
        "label": "Status",
        "placeholder": "Status auswählen",
        "tooltip": "Aktueller Status der Rechnung",
        "order": 3,
        "required": true,
        "group": "basic_info",
        "options": [
          {"value": "open", "label": "Offen", "color": "warning"},
          {"value": "paid", "label": "Bezahlt", "color": "success"},
          {"value": "overdue", "label": "Überfällig", "color": "destructive"}
        ],
        "icon": "file-text"
      },
      {
        "field_name": "due_date",
        "ui_component": "date",
        "label": "Fälligkeitsdatum",
        "placeholder": "Datum auswählen",
        "tooltip": "Fälligkeitsdatum der Rechnung",
        "order": 4,
        "required": true,
        "group": "basic_info",
        "icon": "calendar"
      },
      {
        "field_name": "notes",
        "ui_component": "textarea",
        "label": "Notizen",
        "placeholder": "Optionale Notizen zur Rechnung",
        "tooltip": "Zusätzliche Informationen zur Rechnung",
        "order": 5,
        "required": false,
        "group": "additional_info",
        "rows": 4,
        "max_length": 1000,
        "icon": "message-square"
      },
      {
        "field_name": "created_at",
        "ui_component": "text",
        "label": "Erstellt am",
        "order": 6,
        "required": false,
        "readonly": true,
        "group": "system_info",
        "icon": "clock"
      }
    ],
    "groups": [
      {
        "name": "basic_info",
        "label": "Grundinformationen",
        "icon": "info",
        "collapsible": false
      },
      {
        "name": "additional_info",
        "label": "Zusätzliche Informationen",
        "icon": "plus-circle",
        "collapsible": true
      },
      {
        "name": "system_info",
        "label": "System-Informationen",
        "icon": "settings",
        "collapsible": true
      }
    ]
  }
}
```

---

## ✅ Aufgabe

Erstelle die Datei `components/forms/InvoiceForm.tsx`, welche:

1. **Das obige Dual-MCP-Schema umsetzt**
2. **Zod-Schema korrekt implementiert** (`InvoiceFormSchema`)
3. **Fehlerfrei in TypeScript ausführbar ist**
4. **Ein sauberes Layout mit TailwindCSS verwendet**
5. **Shadcn UI-Komponenten nutzt**
6. **Dual-MCP-Integration implementiert**
7. **Responsive Design bietet**
8. **Accessibility-Features enthält**

### 🧪 Erwartete Eingabemaske

- **Kunde** (Dropdown mit Customer-Daten)
- **Betrag** (Numerische Eingabe mit Validierung)
- **Status** (Dropdown mit ENUM-Werten + Farben)
- **Fälligkeitsdatum** (Date-Picker)
- **Notizen** (Textarea mit Zeichenbegrenzung)
- **Erstellt am** (Readonly, automatisch gefüllt)

### 🛡️ Qualitätsanforderungen

- **Keine Halluzination** bei Feldnamen oder Typen
- **TypeScript**: `type InvoiceFormValues = z.infer<typeof InvoiceFormSchema>`
- **Nur TailwindCSS** für Styling
- **Shadcn UI** für alle Komponenten
- **Dual-MCP-Integration** für optimale UX
- **Error Boundaries** und Loading States
- **Accessibility** (ARIA, Keyboard Navigation)

---

## 📁 Ausgabe

Gib am Ende **zwei Exportdateien** aus:

1. **`components/forms/InvoiceForm.tsx`** - Hauptkomponente
2. **`components/forms/InvoiceFormSchema.ts`** - Zod-Schema

### 📋 Dateistruktur

```
components/
├── forms/
│   ├── InvoiceForm.tsx          # Hauptkomponente
│   └── InvoiceFormSchema.ts     # Zod-Schema
├── ui/                          # Shadcn UI Komponenten
│   ├── form.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── textarea.tsx
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
└── ...
```

---

## 🔧 Verwendung in Cursor.ai

### 1. **Datei abspeichern** als:
```
cursor-prompts/generate-react-form-shadcn-mcp.md
```

### 2. **Ausführen in Cursor.ai:**
```
CMD+K → Run prompt from file → generate-react-form-shadcn-mcp.md
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
cursor --prompt-file generate-react-form-shadcn-mcp.md \
  --context schema.json \
  --context ui-metadata.json
```

---

## 🎯 Erwartetes Ergebnis

Eine **produktionsreife React-Komponente** mit:

- ✅ **Vollständige TypeScript-Typisierung**
- ✅ **Zod-Validierung** basierend auf Schema
- ✅ **Shadcn UI** für konsistente UX
- ✅ **TailwindCSS** für responsive Layouts
- ✅ **Dual-MCP-Integration** für optimale Konfiguration
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

**Hinweis**: Dieses Template ist für die **Dual-MCP-Architektur** optimiert und nutzt sowohl Schema- als auch UI-Metadata für optimale Komponenten-Generierung. 