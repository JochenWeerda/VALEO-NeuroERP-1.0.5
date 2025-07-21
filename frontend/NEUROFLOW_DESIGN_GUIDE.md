# VALEO NeuroERP - NeuroFlow Design-System

## 🎨 Übersicht

Das VALEO NeuroERP System verwendet das moderne **NeuroFlow Design-System**, das speziell für intelligente Enterprise-Anwendungen entwickelt wurde. Es bietet eine professionelle, benutzerfreundliche und konsistente Benutzeroberfläche mit Fokus auf KI-Integration und Mobile-First-Ansatz.

## 🌟 Design-Prinzipien

### 1. **Intelligente Klarheit**
- KI-gestützte visuelle Hierarchie
- Reduzierte kognitive Belastung
- Fokus auf wesentliche Informationen

### 2. **Adaptive Konsistenz**
- Einheitliche Komponenten
- Kontext-sensitive Interaktionen
- Vorhersehbare Verhaltensweisen

### 3. **Fluide Effizienz**
- Optimierte Workflows
- Schnelle Navigation
- Intelligente Standardwerte

### 4. **Mobile-First Responsivität**
- Mobile-First Ansatz
- Flexible Layouts
- Adaptive Komponenten

## 🎨 Die drei Modi

### **Neural (Standard)**
- **Verwendung**: Standard-Business-Anwendungen
- **Charakteristik**: Klare, professionelle Optik mit subtilen Schatten
- **Farben**: Weiße Hintergründe mit grauen Akzenten
- **Anwendung**: Hauptmodus für die meisten Anwendungsfälle

### **Neural Light**
- **Verwendung**: Moderne Web-Anwendungen
- **Charakteristik**: Minimalistische, flache Gestaltung
- **Farben**: Reduzierte Schatten und Tiefe
- **Anwendung**: Für moderne, clean Design-Anforderungen

### **Neural Dark**
- **Verwendung**: Nachtarbeit und reduzierte Augenbelastung
- **Charakteristik**: Dunkle Farbpalette für bessere Augenentlastung
- **Farben**: Hoher Kontrast für bessere Lesbarkeit
- **Anwendung**: Für Benutzer, die dunkle Themes bevorzugen

## 🎨 Farbpalette

### **Primärfarben**
```css
/* VALEO Blue - Hauptfarbe */
Primary: #0A6ED1
Primary Light: #4A90E2
Primary Dark: #0854A6

/* VALEO Dark Blue - Sekundärfarbe */
Secondary: #354A5F
Secondary Light: #5A6B7A
Secondary Dark: #2A3A4A
```

### **Textfarben**
```css
/* Text-Hierarchie */
Primary Text: #354A5F
Secondary Text: #515559
Disabled Text: #6A6D70
```

### **Statusfarben**
```css
/* Status-Indikatoren */
Success: #107C41
Warning: #E9730C
Error: #BB0000
Info: #0A6ED1
Neutral: #6A6D70
```

### **Hintergrundfarben**
```css
/* Hintergründe */
Background Default: #F5F6F7
Background Paper: #FFFFFF
Divider: #E5E5E5
```

## 📱 Komponenten-Bibliothek

### **Object Page Header**
```tsx
<ObjectPageHeader
  title="Seitentitel"
  subtitle="Untertitel oder Beschreibung"
  avatar="/path/to/avatar.png"
  status="Aktiv"
  actions={<Button>Action</Button>}
/>
```

**Verwendung**: Hauptseiten-Header mit Titel, Avatar und Aktionen

### **Object List Item**
```tsx
<ObjectListItem
  title="Objektname"
  subtitle="Untertitel"
  description="Beschreibung"
  status="Status"
  avatar="/path/to/avatar.png"
  actions={<IconButton><EditIcon /></IconButton>}
  onClick={() => handleClick()}
/>
```

**Verwendung**: Listen-Elemente mit Avatar, Informationen und Aktionen

### **Action Bar**
```tsx
<ActionBar
  title="Bereichstitel"
  actions={[
    {
      label: 'Neue Aktion',
      icon: <AddIcon />,
      onClick: () => handleAction(),
      variant: 'contained'
    }
  ]}
/>
```

**Verwendung**: Toolbar mit Aktionen für einen Bereich

### **Quick View Card**
```tsx
<QuickViewCard
  title="Karten-Titel"
  icon={<Icon />}
  actions={<IconButton><ViewIcon /></IconButton>}
>
  <Typography>Inhalt</Typography>
</QuickViewCard>
```

**Verwendung**: Kompakte Informationskarten mit Icon und Aktionen

### **Status Indicator**
```tsx
<StatusIndicator
  status="success"
  label="Status-Beschreibung"
  size="medium"
/>
```

**Verwendung**: Visuelle Status-Anzeige mit Farbkodierung

### **Data Table Toolbar**
```tsx
<DataTableToolbar
  title="Tabellen-Titel"
  searchValue={searchValue}
  onSearchChange={setSearchValue}
  actions={<Button>Filter</Button>}
/>
```

**Verwendung**: Toolbar für Datentabellen mit Suche und Aktionen

### **Section Header**
```tsx
<SectionHeader
  title="Abschnitts-Titel"
  subtitle="Beschreibung"
  actions={<Button>Action</Button>}
  collapsible={true}
  expanded={isExpanded}
  onToggle={() => setExpanded(!isExpanded)}
/>
```

**Verwendung**: Abschnitts-Header mit optionaler Kollaps-Funktion

### **Message Strip**
```tsx
<MessageStrip
  type="success"
  title="Titel"
  onClose={() => setShow(false)}
>
  Nachrichteninhalt
</MessageStrip>
```

**Verwendung**: Benachrichtigungen mit verschiedenen Typen

## 🎨 Typografie

### **Schriftart**
```css
font-family: "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif;
```

### **Schriftgrößen**
```css
h1: 2.5rem (40px) - Haupttitel
h2: 2rem (32px) - Untertitel
h3: 1.5rem (24px) - Abschnittstitel
h4: 1.25rem (20px) - Kartentitel
h5: 1.125rem (18px) - Listen-Titel
h6: 1rem (16px) - Kleinere Titel
body1: 1rem (16px) - Haupttext
body2: 0.875rem (14px) - Sekundärtext
button: 0.875rem (14px) - Button-Text
```

### **Schriftgewichte**
```css
Light: 300 - Haupttitel
Regular: 400 - Untertitel
Medium: 500 - Abschnittstitel, Buttons
```

## 📐 Layout & Spacing

### **Grid-System**
```css
/* 12-Spalten Grid für optimale Flexibilität */
.grid-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1rem;
}

/* Responsive Breakpoints */
xs: 0px - 599px
sm: 600px - 959px
md: 960px - 1279px
lg: 1280px - 1919px
xl: 1920px+
```

### **Spacing**
```css
/* Konsistente Abstände */
xs: 0.25rem (4px)
sm: 0.5rem (8px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
xxl: 3rem (48px)
```

### **Border Radius**
```css
/* Abgerundete Ecken */
small: 4px
medium: 6px
large: 8px
xlarge: 12px
xxlarge: 16px
```

## 🎯 Best Practices

### **1. Konsistente Verwendung**
- Verwende immer die vordefinierten Komponenten
- Halte dich an die Farbpalette
- Verwende die standardisierten Abstände

### **2. Mobile-First Design**
- Mobile-First Ansatz
- Flexible Grid-Layouts
- Adaptive Komponenten

### **3. Accessibility**
- Ausreichende Farbkontraste
- Klare Fokus-Indikatoren
- Semantische HTML-Struktur

### **4. Performance**
- Lazy Loading für große Listen
- Optimierte Bilder
- Effiziente Re-Renders

## 🔧 Implementierung

### **Theme einbinden**
```tsx
import { ThemeProvider } from '@mui/material/styles';
import { neuralTheme } from './themes/NeuroFlowTheme';

function App() {
  return (
    <ThemeProvider theme={neuralTheme}>
      <CssBaseline />
      {/* App-Inhalt */}
    </ThemeProvider>
  );
}
```

### **Komponenten importieren**
```tsx
import {
  ObjectPageHeader,
  ObjectListItem,
  ActionBar,
  QuickViewCard,
  StatusIndicator,
  DataTableToolbar,
  SectionHeader,
  MessageStrip
} from './components/ui/NeuroFlowComponents';
```

### **Theme-Modi wechseln**
```tsx
import { useNeuroFlowTheme } from './themes/NeuroFlowTheme';

const theme = useNeuroFlowTheme('neural-dark'); // oder 'neural-light'
```

## 📱 Responsive Verhalten

### **Mobile (< 600px)**
- Einspaltige Layouts
- Gestapelte Komponenten
- Touch-optimierte Interaktionen

### **Tablet (600px - 959px)**
- Zweispaltige Layouts
- Angepasste Komponenten-Größen
- Optimierte Navigation

### **Desktop (> 960px)**
- Mehrspaltige Layouts
- Vollständige Funktionalität
- Erweiterte Aktionen

## 🎨 Customization

### **Eigene Farben hinzufügen**
```tsx
const customTheme = createTheme({
  ...neuralTheme,
  palette: {
    ...neuralTheme.palette,
    custom: {
      main: '#FF6B35',
      light: '#FF8A65',
      dark: '#E64A19'
    }
  }
});
```

### **Komponenten anpassen**
```tsx
const customCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.custom.main,
  color: theme.palette.custom.contrastText
}));
```

## 🔍 Testing

### **Visuelle Tests**
- Screenshot-Vergleiche
- Cross-Browser-Tests
- Responsive Tests

### **Accessibility Tests**
- Screen Reader Tests
- Keyboard Navigation
- Farbkontrast-Tests

### **Performance Tests**
- Ladezeiten
- Render-Performance
- Memory Usage

## 📚 Weitere Ressourcen

- [Material-UI Documentation](https://mui.com/)
- [VALEO Design System](https://valeo.com/design-system)
- [Mobile-First Design Principles](https://www.lukew.com/ff/entry.asp?933)

## 🤝 Beitragen

Bei Fragen oder Verbesserungsvorschlägen für das NeuroFlow Design-System:

1. Erstelle ein Issue im Repository
2. Beschreibe das Problem oder die Verbesserung
3. Füge Screenshots oder Beispiele hinzu
4. Diskutiere die Lösung mit dem Team

---

**Entwickelt für VALEO NeuroERP 2.0**  
*NeuroFlow Design-System - Intelligente UI für moderne Enterprise-Anwendungen* 