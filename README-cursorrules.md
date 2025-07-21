# VALEO NeuroERP - .cursorrules Bibliothek

Eine umfassende Sammlung von Cursor AI Konfigurationsdateien für die Frontend-Entwicklung mit React, TypeScript, Material-UI, Ant Design und Tailwind CSS.

## 📚 Übersicht

Diese Bibliothek enthält spezifische `.cursorrules`-Dateien für verschiedene UI-Frameworks und Entwicklungsbereiche:

- **`.cursorrules`** - Hauptkonfiguration für das gesamte Projekt
- **`frontend/.cursorrules`** - Spezifische Regeln für React/TypeScript Frontend
- **`.cursorrules-material-ui`** - Material-UI v5 Komponenten-Regeln
- **`.cursorrules-ant-design`** - Ant Design Komponenten-Regeln
- **`.cursorrules-tailwind`** - Tailwind CSS Utility-Klassen-Regeln

## 🎯 Ziel

Die Bibliothek soll Cursor AI dabei unterstützen, konsistente, wartbare und benutzerfreundliche Komponenten zu generieren, die:

- ✅ TypeScript mit vollständiger Typisierung verwenden
- ✅ Deutsche Lokalisierung implementieren
- ✅ Responsive Design berücksichtigen
- ✅ Accessibility-Features enthalten
- ✅ Performance-optimiert sind
- ✅ An das VALEO Design-System angepasst sind

## 🚀 Installation und Verwendung

### 1. Dateien in Ihr Projekt kopieren

```bash
# Hauptkonfiguration
cp .cursorrules /path/to/your/project/

# Frontend-spezifische Regeln
cp frontend/.cursorrules /path/to/your/frontend/

# Framework-spezifische Regeln (optional)
cp .cursorrules-material-ui /path/to/your/project/
cp .cursorrules-ant-design /path/to/your/project/
cp .cursorrules-tailwind /path/to/your/project/
```

### 2. Cursor AI konfigurieren

Cursor AI liest automatisch die `.cursorrules`-Dateien aus dem Projektverzeichnis. Sie können auch mehrere Dateien kombinieren oder spezifische Regeln für bestimmte Bereiche verwenden.

### 3. Verwendung in der Entwicklung

Sobald die Dateien installiert sind, wird Cursor AI automatisch:

- Konsistente Komponenten-Strukturen vorschlagen
- Deutsche Texte und Labels verwenden
- TypeScript-Interfaces generieren
- Framework-spezifische Best Practices befolgen
- Responsive Design implementieren

## 📁 Dateistruktur

```
valeo-neuroerp/
├── .cursorrules                    # Hauptkonfiguration
├── frontend/
│   └── .cursorrules               # Frontend-spezifische Regeln
├── .cursorrules-material-ui       # Material-UI Regeln
├── .cursorrules-ant-design        # Ant Design Regeln
├── .cursorrules-tailwind          # Tailwind CSS Regeln
└── README-cursorrules.md          # Diese Dokumentation
```

## 🎨 Framework-spezifische Regeln

### Material-UI (`.cursorrules-material-ui`)

**Verwendung:** Für komplexe UI-Elemente, Formulare und Tabellen

**Features:**
- MUI v5 Komponenten mit deutschen Texten
- Theme-Provider Integration
- DataGrid mit deutscher Lokalisierung
- Responsive Layout-Komponenten
- Loading und Error States

**Beispiel:**
```tsx
// Cursor AI generiert automatisch:
import { Card, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

export const ValeoComponent: React.FC<ComponentProps> = ({ title, onAdd }) => (
  <Card sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
    <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
      {title}
    </Typography>
    <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}>
      Hinzufügen
    </Button>
  </Card>
);
```

### Ant Design (`.cursorrules-ant-design`)

**Verwendung:** Für Tabellen, Formulare und Navigation

**Features:**
- Deutsche Lokalisierung für alle Komponenten
- Form-Validierung mit deutschen Fehlermeldungen
- Table-Komponenten mit Pagination
- Modal und Dialog-Komponenten
- Dashboard-Statistiken

**Beispiel:**
```tsx
// Cursor AI generiert automatisch:
import { Form, Input, Button, message } from 'antd';

export const ValeoUserForm: React.FC = () => (
  <Form layout="vertical" onFinish={handleSubmit}>
    <Form.Item
      name="name"
      label="Name"
      rules={[{ required: true, message: 'Bitte geben Sie einen Namen ein' }]}
    >
      <Input placeholder="Vollständiger Name" />
    </Form.Item>
    <Button type="primary" htmlType="submit">
      Speichern
    </Button>
  </Form>
);
```

### Tailwind CSS (`.cursorrules-tailwind`)

**Verwendung:** Für Layout, Spacing und Responsive Design

**Features:**
- Utility-First Ansatz
- Mobile-First Responsive Design
- Custom Komponenten mit Tailwind-Klassen
- Animation und Transition-Effekte
- Accessibility-Features

**Beispiel:**
```tsx
// Cursor AI generiert automatisch:
export const ValeoCard: React.FC<CardProps> = ({ title, children }) => (
  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    {children}
  </div>
);
```

## 🔧 Hauptkonfiguration (`.cursorrules`)

Die Hauptkonfiguration enthält:

### Projekt-Übersicht
- Tech-Stack: React 18, TypeScript, Material-UI, Ant Design, Tailwind CSS
- Projektstruktur und Namenskonventionen
- Entwicklungsworkflow

### TypeScript Regeln
- Interface-Definitionen für alle Props
- Generic Types für wiederverwendbare Komponenten
- Custom Hooks mit TypeScript

### Komponenten-Entwicklung
- Functional Components mit Hooks
- Props-Validierung
- Wiederverwendbare Komponenten-Strukturen

### Daten-Management
- Zustand Store-Konfiguration
- React Query Integration
- API-Service-Patterns

### Styling und Theming
- Material-UI Theme-Konfiguration
- Tailwind CSS Erweiterungen
- Responsive Design-Patterns

### Testing
- React Testing Library Setup
- Komponenten-Tests
- Accessibility-Tests

### Performance-Optimierung
- Code-Splitting
- Memoization
- Lazy Loading

## 🎯 KI-Assistenz Regeln

### Komponenten-Generierung
Bei der Erstellung neuer Komponenten folgt Cursor AI automatisch:

1. **TypeScript-Interface** für Props erstellen
2. **Deutsche Texte** und Labels verwenden
3. **Material-UI oder Ant Design** Komponenten nutzen
4. **Tailwind CSS** für Layout hinzufügen
5. **Wiederverwendbare** Komponenten erstellen
6. **Error-Handling** implementieren
7. **Loading-States** hinzufügen
8. **Responsive Design** testen

### Code-Review Checkliste
- [ ] TypeScript-Typen definiert
- [ ] Props-Interface erstellt
- [ ] Deutsche Texte verwendet
- [ ] Responsive Design implementiert
- [ ] Error-Handling vorhanden
- [ ] Loading-States definiert
- [ ] Accessibility berücksichtigt
- [ ] Performance optimiert
- [ ] Tests geschrieben

## 📱 Responsive Design

Alle generierten Komponenten folgen dem Mobile-First Ansatz:

```tsx
// Beispiel für responsive Grid
<div className="
  grid
  grid-cols-1     /* Mobile: 1 Spalte */
  md:grid-cols-2  /* Tablet: 2 Spalten */
  lg:grid-cols-3  /* Desktop: 3 Spalten */
  xl:grid-cols-4  /* Large Desktop: 4 Spalten */
  gap-4           /* Mobile: 16px gap */
  md:gap-6        /* Tablet: 24px gap */
  lg:gap-8        /* Desktop: 32px gap */
">
  {/* Grid Items */}
</div>
```

## 🔒 Sicherheit und Best Practices

### Input-Validierung
```tsx
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  age: z.number().min(18, 'Mindestalter ist 18 Jahre')
});
```

### Error Boundaries
```tsx
export class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert severity="error">
          <h2>Ein Fehler ist aufgetreten</h2>
          <p>Entschuldigung, etwas ist schiefgelaufen.</p>
        </Alert>
      );
    }
    return this.props.children;
  }
}
```

## 🧪 Testing

### Komponenten-Tests
```tsx
import { render, screen, fireEvent } from '@testing-library/react';

describe('UserCard', () => {
  it('rendert Benutzerinformationen korrekt', () => {
    render(<UserCard user={mockUser} />);
    expect(screen.getByText('Max Mustermann')).toBeInTheDocument();
  });

  it('ruft onEdit auf, wenn Bearbeiten-Button geklickt wird', () => {
    const onEdit = jest.fn();
    render(<UserCard user={mockUser} onEdit={onEdit} />);
    fireEvent.click(screen.getByText('Bearbeiten'));
    expect(onEdit).toHaveBeenCalledWith('1');
  });
});
```

## 🚀 Performance-Optimierung

### Code-Splitting
```tsx
import React, { Suspense, lazy } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const UserManagement = lazy(() => import('./pages/UserManagement'));

export const AppRouter: React.FC = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/users" element={<UserManagement />} />
    </Routes>
  </Suspense>
);
```

### Memoization
```tsx
export const ExpensiveComponent = React.memo<Props>(({ data, onItemClick }) => {
  const processedData = useMemo(() => {
    return data.map(item => item * 2).filter(item => item > 10);
  }, [data]);

  const handleClick = useCallback((index: number) => {
    onItemClick(index);
  }, [onItemClick]);

  return (
    <div>
      {processedData.map((item, index) => (
        <button key={index} onClick={() => handleClick(index)}>
          {item}
        </button>
      ))}
    </div>
  );
});
```

## 📝 Code-Qualität

### ESLint Konfiguration
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off"
  }
}
```

### Prettier Konfiguration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## 🔄 Workflow

### Neue Komponente erstellen
1. TypeScript-Interface für Props erstellen
2. Functional Component implementieren
3. Material-UI oder Ant Design Komponenten verwenden
4. Tailwind CSS für Layout hinzufügen
5. Error Boundaries implementieren
6. Unit Tests schreiben
7. Komponente dokumentieren

### Best Practices
- ✅ Immer TypeScript verwenden
- ✅ Deutsche Lokalisierung implementieren
- ✅ Konsistente Namenskonventionen nutzen
- ✅ Wiederverwendbare Komponenten erstellen
- ✅ Auf verschiedenen Bildschirmgrößen testen
- ✅ Accessibility-Features implementieren
- ✅ Performance optimieren
- ✅ Code dokumentieren

## 🤝 Beitragen

Um zur Bibliothek beizutragen:

1. **Fork** das Repository
2. **Erstellen** Sie einen Feature-Branch
3. **Hinzufügen** Sie neue Regeln oder Verbesserungen
4. **Testen** Sie die Regeln mit Cursor AI
5. **Erstellen** Sie einen Pull Request

### Richtlinien für Beiträge
- Neue Regeln sollten deutsche Lokalisierung unterstützen
- TypeScript-Interfaces für alle Komponenten
- Responsive Design berücksichtigen
- Accessibility-Features enthalten
- Performance-optimiert sein

## 📄 Lizenz

Diese Bibliothek ist Teil des VALEO NeuroERP Projekts und unterliegt den gleichen Lizenzbedingungen.

## 🆘 Support

Bei Fragen oder Problemen:

1. **Issues** im Repository erstellen
2. **Dokumentation** überprüfen
3. **Beispiele** in den `.cursorrules`-Dateien studieren
4. **Community** nach Hilfe fragen

## 🔄 Updates

Die Bibliothek wird regelmäßig aktualisiert mit:

- Neuen UI-Framework-Versionen
- Verbesserten Best Practices
- Zusätzlichen Komponenten-Templates
- Performance-Optimierungen
- Accessibility-Verbesserungen

---

**Entwickelt für VALEO NeuroERP - Intelligente Unternehmenslösungen auf Kubernetes** 