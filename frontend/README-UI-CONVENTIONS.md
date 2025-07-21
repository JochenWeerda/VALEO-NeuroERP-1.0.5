# VALEO NeuroERP UI-Konventionen

## 🎯 Übersicht

Dieses Dokument definiert die verbindlichen UI-Konventionen für das VALEO NeuroERP Frontend. Wir verwenden einen **Hybrid-Ansatz** aus Material-UI und Tailwind CSS für ein einheitliches, modernes Enterprise-Look & Feel.

## 🏗️ Architektur

### Hybrid-Ansatz: Material-UI + Tailwind CSS

```
VALEO NeuroERP Frontend
├── Material-UI (Enterprise-Grade)
│   ├── Komplexe Formulare
│   ├── Datenvisualisierung
│   ├── Navigation
│   └── Enterprise-Features
└── Tailwind CSS (Performance & Custom)
    ├── Layout & Spacing
    ├── Einfache UI-Elemente
    ├── Custom Styling
    └── Performance-kritische Bereiche
```

## 📊 Entscheidungsmatrix

### Wann Material-UI verwenden?

| Komponenten-Typ | Komplexität | Begründung |
|----------------|-------------|------------|
| **Formulare** | Hoch | Validierung, Accessibility, Komplexe Logik |
| **Tabellen** | Hoch | Sortierung, Filterung, Paginierung |
| **Navigation** | Hoch | Komplexe Navigation, Breadcrumbs |
| **Dashboard-Widgets** | Hoch | Interaktive Charts, Komplexe Visualisierung |
| **Enterprise-Features** | Alle | Benutzerverwaltung, Berechtigungssystem |

### Wann Tailwind CSS verwenden?

| Komponenten-Typ | Komplexität | Begründung |
|----------------|-------------|------------|
| **Layout** | Alle | Container, Grid, Spacing |
| **Utility** | Alle | Einfache UI-Elemente |
| **Dashboard-Widgets** | Niedrig | Statische Karten, Metriken |
| **Performance-kritische Bereiche** | Alle | Liste mit vielen Items, Quick-Actions |

## 🎨 Design-System

### VALEO Brand Colors

```css
/* Primary (Blau) */
--valeo-primary-500: #3b82f6;
--valeo-primary-600: #2563eb;
--valeo-primary-900: #1e3a8a;

/* Secondary (Pink) */
--valeo-secondary-500: #ec4899;
--valeo-secondary-600: #db2777;
--valeo-secondary-900: #831843;

/* Status Colors */
--valeo-success-500: #22c55e;
--valeo-warning-500: #f59e0b;
--valeo-error-500: #ef4444;
```

### Typography

```css
/* Font Family */
font-family: "Inter", "Roboto", "Helvetica", "Arial", sans-serif;

/* Font Sizes */
text-xs: 0.75rem;    /* 12px */
text-sm: 0.875rem;   /* 14px */
text-base: 1rem;     /* 16px */
text-lg: 1.125rem;   /* 18px */
text-xl: 1.25rem;    /* 20px */
text-2xl: 1.5rem;    /* 24px */
text-3xl: 1.875rem;  /* 30px */
text-4xl: 2.25rem;   /* 36px */
```

## 🔧 Implementierung

### 1. Neue Komponente erstellen

#### Checkliste:
- [ ] Komponenten-Typ bestimmen (Formular, Tabelle, Layout, etc.)
- [ ] Komplexität bewerten (Niedrig, Mittel, Hoch)
- [ ] UI-Bibliothek nach Matrix wählen
- [ ] Template verwenden
- [ ] Design-System befolgen

#### Templates:

**Material-UI Template:**
```tsx
import React from 'react';
import { Component } from '@mui/material';
import { Icon } from '@mui/icons-material';

interface ComponentNameProps {
  // Props definieren
}

export const ComponentName: React.FC<ComponentNameProps> = ({ 
  // Props destructuring
}) => {
  return (
    // Material-UI Komponenten verwenden
  );
};
```

**Tailwind Template:**
```tsx
import React from 'react';
import { cn } from '../lib/utils';

interface ComponentNameProps {
  className?: string;
}

export const ComponentName: React.FC<ComponentNameProps> = ({ 
  className,
}) => {
  return (
    <div className={cn(
      // Tailwind-Klassen hier
      className
    )}>
      {/* Komponenten-Inhalt */}
    </div>
  );
};
```

**Hybrid Template:**
```tsx
import React from 'react';
import { ComplexComponent } from '@mui/material';
import { cn } from '../lib/utils';

export const ComponentName: React.FC<ComponentNameProps> = ({ 
  className,
}) => {
  return (
    <div className={cn(
      // Tailwind für Layout
      className
    )}>
      {/* Material-UI für komplexe Komponenten */}
      {/* Tailwind für einfache Elemente */}
    </div>
  );
};
```

### 2. Helper-Funktionen verwenden

```tsx
import { getUILibrary, validateComponentDesign } from '../lib/ui-conventions';

// UI-Bibliothek für Komponente bestimmen
const library = getUILibrary('form', 'high'); // Returns 'material-ui'

// Komponenten-Design validieren
const validation = validateComponentDesign({
  type: 'form',
  complexity: 'high',
  styling: 'material-ui'
});
```

## 📁 Dateistruktur

```
frontend/
├── src/
│   ├── lib/
│   │   ├── ui-conventions.ts          # UI-Konventionen & Helper
│   │   └── utils.ts                   # Utility-Funktionen
│   ├── components/
│   │   ├── ui/
│   │   │   └── ComponentLibrary.tsx   # Komponenten-Bibliothek
│   │   └── ...                        # Weitere Komponenten
│   └── pages/
│       └── ...                        # Seiten-Komponenten
├── UI-DECISION-MATRIX.md              # Detaillierte Entscheidungsmatrix
└── README-UI-CONVENTIONS.md           # Diese Datei
```

## 🎯 Qualitätsrichtlinien

### ✅ Konsistenz
- Verwende immer die gleichen Farben aus dem Design-System
- Halte Typography-Hierarchien konsistent
- Verwende einheitliche Spacing-Werte
- Beachte die Komponenten-Kategorien

### ♿ Accessibility
- Alle interaktiven Elemente müssen fokussierbar sein
- Verwende semantische HTML-Elemente
- Stelle ausreichenden Farbkontrast sicher
- Füge ARIA-Labels hinzu wo nötig
- Teste mit Screen-Readern

### ⚡ Performance
- Lazy-load Material-UI Komponenten bei Bedarf
- Verwende Tailwind für Performance-kritische Bereiche
- Optimiere Bundle-Größe durch Tree-Shaking
- Verwende React.memo für teure Komponenten

### 📱 Responsive Design
- Mobile-First Ansatz
- Teste auf verschiedenen Bildschirmgrößen
- Verwende responsive Breakpoints konsistent
- Optimiere Touch-Targets für Mobile

### 🏢 Enterprise-Anforderungen
- Hohe Verfügbarkeit und Stabilität
- Skalierbarkeit für große Datenmengen
- Sicherheit und Datenschutz
- Audit-Trail für wichtige Aktionen
- Backup und Recovery-Funktionen

## 🚀 Beispiele

### ✅ Richtige Verwendung

#### Material-UI für komplexe Formulare:
```tsx
import { TextField, Button, FormControl } from '@mui/material';

export const UserForm = () => (
  <FormControl>
    <TextField label="Name" required />
    <TextField label="Email" type="email" />
    <Button variant="contained">Speichern</Button>
  </FormControl>
);
```

#### Tailwind für Dashboard-Widgets:
```tsx
export const MetricCard = () => (
  <div className="bg-white shadow-sm rounded-lg p-4 hover:shadow-md transition-shadow">
    <div className="text-2xl font-bold text-gray-900">1,247</div>
    <div className="text-sm text-gray-600">Aktive Benutzer</div>
  </div>
);
```

#### Hybrid für komplexe Layouts:
```tsx
import { DataGrid } from '@mui/material';

export const Dashboard = () => (
  <div className="p-6 space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard />
      <MetricCard />
      <MetricCard />
    </div>
    <DataGrid rows={data} columns={columns} />
  </div>
);
```

### ❌ Falsche Verwendung

#### Material-UI für einfache Elemente:
```tsx
// ❌ Überkomplex für einfache Anzeige
import { Card, CardContent, Typography } from '@mui/material';

export const SimpleCard = () => (
  <Card>
    <CardContent>
      <Typography>Einfacher Text</Typography>
    </CardContent>
  </Card>
);
```

#### Tailwind für komplexe Formulare:
```tsx
// ❌ Fehlende Validierung und Accessibility
export const ComplexForm = () => (
  <div className="space-y-4">
    <input className="border rounded p-2" />
    <button className="bg-blue-500 text-white px-4 py-2 rounded">
      Speichern
    </button>
  </div>
);
```

## 📈 Migration-Strategie

### Phase 1: Neue Komponenten
- Alle neuen Komponenten folgen der Matrix
- Konsistente Verwendung von Design-System
- Dokumentation der Entscheidungen

### Phase 2: Bestehende Komponenten
- Bewertung nach Matrix-Kriterien
- Schrittweise Migration wo sinnvoll
- Performance-Optimierung

### Phase 3: Optimierung
- Bundle-Größe optimieren
- Performance-Monitoring
- User-Feedback sammeln

## 📚 Weitere Ressourcen

- [Detaillierte Entscheidungsmatrix](./UI-DECISION-MATRIX.md)
- [UI-Konventionen Code](./src/lib/ui-conventions.ts)
- [Komponenten-Bibliothek](./src/components/ui/ComponentLibrary.tsx)
- [Material-UI Dokumentation](https://mui.com/)
- [Tailwind CSS Dokumentation](https://tailwindcss.com/)

## 🤝 Team-Richtlinien

### Code-Review Checkliste
- [ ] UI-Bibliothek nach Matrix gewählt?
- [ ] Design-System befolgt?
- [ ] Accessibility berücksichtigt?
- [ ] Performance optimiert?
- [ ] Responsive Design implementiert?
- [ ] Enterprise-Anforderungen erfüllt?

### Dokumentation
- Alle Komponenten müssen dokumentiert werden
- Entscheidungen für UI-Bibliothek begründen
- Beispiele für Verwendung bereitstellen
- Performance-Metriken dokumentieren

---

*Diese Konventionen sind verbindlich für alle Frontend-Entwickler im VALEO NeuroERP Projekt und werden kontinuierlich aktualisiert.* 