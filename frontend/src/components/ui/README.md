# UI Standardization - VALEO NeuroERP

## 🎯 Übersicht

Die UI-Standardisierungskomponenten stellen sicher, dass alle Benutzeroberflächen im VALEO NeuroERP System konsistent, zugänglich und benutzerfreundlich sind.

## 📦 Komponenten

### UI_LABELS

Zentrale Label-Definitionen für das gesamte System:

```tsx
import { UI_LABELS } from './UIStandardization';

// Verwendung
const saveButtonText = UI_LABELS.ACTIONS.SAVE; // "Speichern"
const customerNumberLabel = UI_LABELS.ERP.CUSTOMER_NUMBER; // "Kundennummer"
const activeStatus = UI_LABELS.STATUS.ACTIVE; // "Aktiv"
```

#### Verfügbare Kategorien:

- **ACTIONS**: Allgemeine Aktionen (Speichern, Abbrechen, Löschen, etc.)
- **FORMS**: Formular-Labels (Name, E-Mail, Telefon, etc.)
- **ERP**: ERP-spezifische Labels (Kundennummer, Auftragsnummer, etc.)
- **STATUS**: Status-Labels (Aktiv, Ausstehend, Abgeschlossen, etc.)
- **PRIORITY**: Prioritäts-Labels (Niedrig, Mittel, Hoch, Dringend)
- **NAVIGATION**: Navigation-Labels (Dashboard, Benutzer, etc.)
- **MODULES**: Modul-Labels (CRM, ERP, WMS, etc.)
- **MESSAGES**: Meldungen (Erfolg, Fehler, Warnung, Info)
- **VALIDATION**: Validierungsmeldungen

### StatusChip

Standardisierte Status-Chip-Komponente:

```tsx
import { StatusChip } from './UIStandardization';

// Verwendung
<StatusChip status="ACTIVE" />
<StatusChip status="PENDING" size="small" />
<StatusChip status="CANCELLED" variant="outlined" />
```

**Props:**
- `status`: Status aus UI_LABELS.STATUS
- `size`: 'small' | 'medium' (Standard: 'medium')
- `variant`: 'filled' | 'outlined' (Standard: 'filled')

### PriorityChip

Standardisierte Prioritäts-Chip-Komponente:

```tsx
import { PriorityChip } from './UIStandardization';

// Verwendung
<PriorityChip priority="HIGH" />
<PriorityChip priority="URGENT" size="small" />
<PriorityChip priority="LOW" variant="outlined" />
```

**Props:**
- `priority`: Priorität aus UI_LABELS.PRIORITY
- `size`: 'small' | 'medium' (Standard: 'medium')
- `variant`: 'filled' | 'outlined' (Standard: 'filled')

### StandardMessage

Standardisierte Meldungs-Komponente:

```tsx
import { StandardMessage } from './UIStandardization';

// Verwendung
<StandardMessage
  type="success"
  title="Erfolg"
  message="Operation erfolgreich abgeschlossen"
  onClose={() => console.log('Closed')}
/>

<StandardMessage
  type="error"
  title="Fehler"
  message="Ein Fehler ist aufgetreten"
/>

<StandardMessage
  type="warning"
  message="Bitte überprüfen Sie Ihre Eingaben"
/>
```

**Props:**
- `type`: 'success' | 'error' | 'warning' | 'info'
- `title`: Optionaler Titel
- `message`: Meldungstext
- `onClose`: Optionaler Close-Handler
- `showIcon`: Icon anzeigen (Standard: true)

### InfoTooltip

Standardisierte Info-Tooltip-Komponente:

```tsx
import { InfoTooltip } from './UIStandardization';

// Verwendung
<InfoTooltip title="Hilfreiche Information">
  <span>Hover für Info</span>
</InfoTooltip>
```

**Props:**
- `title`: Tooltip-Text
- `children`: React-Komponente
- `placement`: 'top' | 'bottom' | 'left' | 'right' (Standard: 'top')
- `size`: 'small' | 'medium' | 'large' (Standard: 'small')

### HelpButton

Standardisierte Hilfe-Button-Komponente:

```tsx
import { HelpButton } from './UIStandardization';

// Verwendung
<HelpButton
  title="Hilfe"
  content="Hier finden Sie Hilfe zur Verwendung dieser Funktion"
/>
```

**Props:**
- `title`: Hilfe-Titel
- `content`: Hilfe-Inhalt
- `placement`: 'top' | 'bottom' | 'left' | 'right' (Standard: 'top')

### useUIStandardization

Hook für UI-Standardisierung:

```tsx
import { useUIStandardization } from './UIStandardization';

const MyComponent = () => {
  const { labels, getLabel } = useUIStandardization();
  
  return (
    <div>
      <button>{getLabel('ACTIONS.SAVE')}</button>
      <span>{getLabel('ERP.CUSTOMER_NUMBER')}</span>
    </div>
  );
};
```

## 🎨 Design-System

### Farben

- **Success**: Grün (#22c55e) - Erfolg, Aktiv, Abgeschlossen
- **Warning**: Orange (#f59e0b) - Warnung, Ausstehend, In Bearbeitung
- **Error**: Rot (#ef4444) - Fehler, Storniert, Abgelehnt
- **Info**: Blau (#3b82f6) - Information, Standard
- **Default**: Grau (#6b7280) - Standard, Inaktiv

### Typografie

- **Titel**: Roboto, 600 weight
- **Body**: Roboto, 400 weight
- **Caption**: Roboto, 400 weight, kleiner

### Abstände

- **Klein**: 4px (0.25rem)
- **Mittel**: 8px (0.5rem)
- **Groß**: 16px (1rem)
- **Extra Groß**: 24px (1.5rem)

## 🔧 Integration

### In bestehende Komponenten integrieren

```tsx
import { 
  UI_LABELS, 
  StatusChip, 
  StandardMessage,
  useUIStandardization 
} from './UIStandardization';

const MyComponent = () => {
  const { getLabel } = useUIStandardization();
  
  return (
    <div>
      <h2>{getLabel('NAVIGATION.DASHBOARD')}</h2>
      <StatusChip status="ACTIVE" />
      <StandardMessage
        type="success"
        message={getLabel('MESSAGES.SUCCESS.SAVED')}
      />
    </div>
  );
};
```

### Formular-Integration

```tsx
import { 
  StandardTextField, 
  StandardSelectField,
  FormActions 
} from './FormStandardization';

const MyForm = () => {
  return (
    <form>
      <StandardTextField
        name="name"
        label={UI_LABELS.FORMS.NAME}
        required
      />
      <StandardSelectField
        name="status"
        label={UI_LABELS.FORMS.STATUS}
        options={[
          { value: 'ACTIVE', label: UI_LABELS.STATUS.ACTIVE },
          { value: 'INACTIVE', label: UI_LABELS.STATUS.INACTIVE }
        ]}
      />
      <FormActions
        onSave={() => console.log('Save')}
        onCancel={() => console.log('Cancel')}
      />
    </form>
  );
};
```

## 🧪 Testing

### Unit Tests

```bash
# Tests ausführen
npm test -- UIStandardization.test.tsx

# Coverage
npm run test:coverage
```

### Test-Beispiele

```tsx
import { render, screen } from '@testing-library/react';
import { StatusChip } from './UIStandardization';

test('StatusChip rendert korrekt', () => {
  render(<StatusChip status="ACTIVE" />);
  expect(screen.getByText('Aktiv')).toBeInTheDocument();
});
```

## 📋 Best Practices

### 1. Labels verwenden

❌ **Falsch:**
```tsx
<button>Save</button>
<span>Customer Number</span>
```

✅ **Richtig:**
```tsx
<button>{UI_LABELS.ACTIONS.SAVE}</button>
<span>{UI_LABELS.ERP.CUSTOMER_NUMBER}</span>
```

### 2. Status-Chips verwenden

❌ **Falsch:**
```tsx
<span className="status active">Active</span>
```

✅ **Richtig:**
```tsx
<StatusChip status="ACTIVE" />
```

### 3. Standardisierte Meldungen verwenden

❌ **Falsch:**
```tsx
<div className="alert success">Success!</div>
```

✅ **Richtig:**
```tsx
<StandardMessage
  type="success"
  message={UI_LABELS.MESSAGES.SUCCESS.SAVED}
/>
```

### 4. Konsistente Formulare

❌ **Falsch:**
```tsx
<input type="text" placeholder="Name" />
```

✅ **Richtig:**
```tsx
<StandardTextField
  name="name"
  label={UI_LABELS.FORMS.NAME}
  required
/>
```

## 🚀 Migration

### Von bestehenden Komponenten migrieren

1. **Labels ersetzen:**
   ```tsx
   // Vorher
   const labels = {
     save: 'Speichern',
     cancel: 'Abbrechen'
   };
   
   // Nachher
   import { UI_LABELS } from './UIStandardization';
   const { save, cancel } = UI_LABELS.ACTIONS;
   ```

2. **Status-Chips ersetzen:**
   ```tsx
   // Vorher
   <Chip label="Aktiv" color="success" />
   
   // Nachher
   <StatusChip status="ACTIVE" />
   ```

3. **Meldungen ersetzen:**
   ```tsx
   // Vorher
   <Alert severity="success">Erfolgreich gespeichert</Alert>
   
   // Nachher
   <StandardMessage
     type="success"
     message={UI_LABELS.MESSAGES.SUCCESS.SAVED}
   />
   ```

## 📚 Weitere Ressourcen

- [Material-UI Dokumentation](https://mui.com/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [TypeScript Handbuch](https://www.typescriptlang.org/docs/)
- [VALEO Design System](https://valeo-design-system.com/) 