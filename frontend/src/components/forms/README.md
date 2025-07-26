# Invoice-Komponenten für VALEO NeuroERP

## 📋 Übersicht

Diese Komponenten implementieren eine vollständige Rechnungsverwaltung basierend auf dem Supabase-Schema für die `invoices`-Tabelle. Die Komponenten sind vollständig typisiert, validiert und folgen den Best Practices für React/TypeScript-Entwicklung.

## 🏗️ Architektur

### Dateistruktur
```
src/
├── types/
│   └── invoices.ts          # TypeScript-Typen und Zod-Schemas
├── components/
│   ├── forms/
│   │   └── InvoiceForm.tsx  # Formular-Komponente
│   └── tables/
│       └── InvoiceTable.tsx # Datentabelle-Komponente
└── pages/
    └── InvoicesPage.tsx     # Beispiel-Integration
```

## 🔧 Komponenten

### 1. InvoiceForm.tsx

**Zweck:** Formular für das Erstellen und Bearbeiten von Rechnungen

**Features:**
- ✅ Vollständige TypeScript-Typisierung
- ✅ Zod-Validierung basierend auf Supabase-Schema
- ✅ React Hook Form Integration
- ✅ Material-UI Komponenten
- ✅ Responsive Design
- ✅ RLS-Richtlinien-Respektierung
- ✅ Foreign Key Handling (Customer-Dropdown)
- ✅ Enum-Werte für Status
- ✅ Real-time Validierung
- ✅ Loading States

**Props:**
```typescript
interface InvoiceFormProps {
  initialData?: Partial<Invoice>;  // Für Bearbeitung
  customers: Customer[];           // Foreign Key Options
  onSubmit: (data: Invoice) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}
```

**Verwendung:**
```tsx
<InvoiceForm
  initialData={editingInvoice}
  customers={customers}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  isLoading={isLoading}
/>
```

### 2. InvoiceTable.tsx

**Zweck:** Datentabelle für die Anzeige und Verwaltung von Rechnungen

**Features:**
- ✅ Sortierung nach allen Spalten
- ✅ Filterung nach Status
- ✅ Volltext-Suche
- ✅ Paginierung
- ✅ Responsive Design
- ✅ Status-Chips mit Farbkodierung
- ✅ Aktionen (Anzeigen, Bearbeiten, Löschen)
- ✅ RLS-basierte Aktionen (nur offene Rechnungen bearbeitbar)
- ✅ Loading States

**Props:**
```typescript
interface InvoiceTableProps {
  invoices: Invoice[];
  customers: Customer[];
  isLoading?: boolean;
  onView?: (invoice: Invoice) => void;
  onEdit?: (invoice: Invoice) => void;
  onDelete?: (invoice: Invoice) => void;
}
```

**Verwendung:**
```tsx
<InvoiceTable
  invoices={invoices}
  customers={customers}
  onView={handleView}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

## 📊 Supabase-Schema-Integration

### Schema-basierte Validierung

Das Zod-Schema wird direkt aus dem Supabase-Schema generiert:

```typescript
export const InvoiceSchema = z.object({
  customer_id: z.string().uuid('Ungültige Customer-ID'),
  amount: z.number()
    .positive('Betrag muss positiv sein')
    .min(0.01, 'Betrag muss mindestens 0.01 sein'),
  status: InvoiceStatusEnum,
});
```

### RLS-Richtlinien

Die Komponenten respektieren die RLS-Richtlinien:
- **Update: false** → Bearbeitung nur für offene Rechnungen
- **Delete: false** → Löschung deaktiviert (UI-Hinweis)
- **Insert: true** → Neue Rechnungen können erstellt werden

### Foreign Key Handling

Customer-Beziehungen werden korrekt gehandhabt:
- Dropdown mit Customer-Namen und E-Mail
- UUID-Validierung
- Fallback für unbekannte Kunden

## 🎨 UI/UX-Features

### Formular
- **Intuitive Labels** mit Icons
- **Real-time Validierung** mit Fehlermeldungen
- **Betrag-Vorschau** während der Eingabe
- **Status-Farbkodierung** (Offen=Orange, Bezahlt=Grün, Überfällig=Rot)
- **RLS-Hinweise** für Benutzer

### Tabelle
- **Sortierbare Spalten** mit visuellen Indikatoren
- **Status-Chips** mit Icons und Farben
- **Responsive Design** für mobile Geräte
- **Paginierung** mit konfigurierbaren Seitengrößen
- **Volltext-Suche** über alle relevanten Felder

## 🔒 Sicherheit & Validierung

### Client-seitige Validierung
- **Zod-Schemas** für Type Safety
- **UUID-Validierung** für Foreign Keys
- **Betrag-Validierung** (positiv, Mindestbetrag)
- **Enum-Validierung** für Status-Werte

### Server-seitige Integration
- **Supabase RLS** wird respektiert
- **Error Handling** für API-Aufrufe
- **Loading States** für bessere UX
- **Optimistic Updates** mit Rollback

## 🚀 Performance

### Optimierungen
- **useMemo** für gefilterte/sortierte Daten
- **React.memo** für Komponenten (wenn nötig)
- **Lazy Loading** für große Datensätze
- **Debounced Search** (implementierbar)

### Bundle-Größe
- **Tree Shaking** für Material-UI
- **Code Splitting** für große Komponenten
- **Minimale Dependencies**

## 📱 Responsive Design

### Breakpoints
- **Mobile:** Einspaltige Layouts, Touch-optimiert
- **Tablet:** Zweispaltige Layouts
- **Desktop:** Vollständige Funktionalität

### Mobile-Features
- **Touch-friendly** Buttons und Inputs
- **Swipe-Gesten** für Aktionen (implementierbar)
- **Optimierte** Tabellen-Ansicht

## 🧪 Testing

### Test-Strategie
- **Unit Tests** für Validierungslogik
- **Integration Tests** für Formular-Flows
- **E2E Tests** für Benutzer-Workflows
- **Accessibility Tests** für Screen Reader

### Test-Coverage
- ✅ Zod-Schema-Validierung
- ✅ Formular-Submission
- ✅ Tabelle-Sortierung/Filterung
- ✅ Error Handling
- ✅ Loading States

## 🔄 Integration

### Mit Supabase
```typescript
// Beispiel für Supabase-Integration
const { data: invoices, error } = await supabase
  .from('invoices')
  .select('*')
  .order('created_at', { ascending: false });

const { data: customers } = await supabase
  .from('customers')
  .select('id, name, email');
```

### Mit React Router
```tsx
// Routing-Integration
<Route path="/invoices" element={<InvoicesPage />} />
<Route path="/invoices/new" element={<InvoiceForm />} />
<Route path="/invoices/:id/edit" element={<InvoiceForm />} />
```

## 📈 Erweiterbarkeit

### Neue Features
- **Bulk-Aktionen** für mehrere Rechnungen
- **Export-Funktionen** (PDF, Excel)
- **E-Mail-Benachrichtigungen**
- **Dashboard-Widgets**
- **Reporting-Features**

### Schema-Erweiterungen
Die Komponenten sind so designed, dass sie einfach um neue Felder erweitert werden können:
1. Schema in `types/invoices.ts` erweitern
2. Zod-Validierung hinzufügen
3. Formular-Felder ergänzen
4. Tabelle-Spalten hinzufügen

## 🎯 Best Practices

### Code-Qualität
- ✅ TypeScript für Type Safety
- ✅ Zod für Runtime-Validierung
- ✅ React Hook Form für Form-Management
- ✅ Material-UI für konsistentes Design
- ✅ TailwindCSS für Utility-First Styling

### Performance
- ✅ Memoization für teure Berechnungen
- ✅ Lazy Loading für große Datensätze
- ✅ Optimistic Updates für bessere UX
- ✅ Error Boundaries für Fehlerbehandlung

### Accessibility
- ✅ ARIA-Labels für Screen Reader
- ✅ Keyboard Navigation
- ✅ Focus Management
- ✅ Color Contrast Compliance

## 🔧 Konfiguration

### Environment Variables
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Feature Flags
VITE_ENABLE_INVOICE_EXPORT=true
VITE_ENABLE_BULK_ACTIONS=true
```

### Theme Customization
```typescript
// Material-UI Theme erweitern
const theme = createTheme({
  components: {
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});
```

## 📚 Weitere Ressourcen

- [Supabase Documentation](https://supabase.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [Material-UI](https://mui.com/)
- [TailwindCSS](https://tailwindcss.com/)

---

**Entwickelt für VALEO NeuroERP - Intelligente ERP-Lösung mit KI-Integration** 🚀 