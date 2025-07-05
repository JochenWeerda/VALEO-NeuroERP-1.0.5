# Theme-System für das ERP-System

Das Theme-System ermöglicht eine flexible Anpassung des Erscheinungsbilds der Anwendung. Es unterstützt verschiedene Modi (Hell, Dunkel, Hoher Kontrast) und Theme-Varianten (Odoo, Default, Modern, Classic).

## Hauptfunktionen

- **Verschiedene Modi**: Light, Dark, High-Contrast
- **Theme-Varianten**: Odoo, Default, Modern, Classic
- **Parametrisierbare Anpassungen**: Schriftgröße, Abstände, Eckenradien, etc.
- **KI-Integration**: Natürlichsprachliche Befehle zur Theme-Anpassung
- **Persistenz**: Speicherung der Theme-Einstellungen im localStorage

## Struktur

Das Theme-System besteht aus folgenden Hauptkomponenten:

- `ThemeProvider.tsx`: Zentraler Provider für das Theme-System
- `themeTypes.ts`: TypeScript-Definitionen für Theme-Parameter
- `themeService.ts`: Service für die Verwaltung und Erstellung von Themes
- `llmInterface.ts`: Schnittstelle für natürlichsprachliche Befehle
- `variants/`: Verzeichnis mit verschiedenen Theme-Varianten
  - `defaultTheme.ts`: Standard-Theme
  - `odooTheme.ts`: Odoo-inspiriertes Theme

## Verwendung

### ThemeProvider einbinden

```tsx
import { ThemeProvider } from './themes/ThemeProvider';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      {/* Anwendungskomponenten */}
    </ThemeProvider>
  );
};
```

### Theme-Hook verwenden

```tsx
import { useThemeSystem } from './themes/ThemeProvider';

const MyComponent: React.FC = () => {
  const { mode, variant, toggleColorMode, setMode, setVariant } = useThemeSystem();
  
  return (
    <div>
      <p>Aktueller Modus: {mode}</p>
      <p>Aktuelle Variante: {variant}</p>
      <button onClick={toggleColorMode}>Theme umschalten</button>
      <button onClick={() => setMode('dark')}>Dunkelmodus</button>
      <button onClick={() => setVariant('odoo')}>Odoo-Theme</button>
    </div>
  );
};
```

### LLM-Interface für natürlichsprachliche Befehle

```tsx
import { processLLMThemeRequest } from './themes/llmInterface';

// Verarbeitung von Textbefehlen
processLLMThemeRequest("Aktiviere den Dunkelmodus");
processLLMThemeRequest("Wechsle zum Odoo-Theme");
processLLMThemeRequest("Erhöhe die Schriftgröße");
```

## Erweiterung

### Neue Theme-Variante hinzufügen

1. Erstelle eine neue Datei in `variants/`, z.B. `modernTheme.ts`
2. Implementiere die Theme-Erstellung basierend auf dem Modus
3. Erweitere den Switch-Case in `createThemeFromConfig` in `ThemeProvider.tsx`

### Neue Theme-Parameter hinzufügen

1. Erweitere die `ThemeParameters`-Schnittstelle in `themeTypes.ts`
2. Aktualisiere den `defaultParameters`-Wert in `ThemeProvider.tsx`
3. Implementiere die Verarbeitung der neuen Parameter in der Theme-Erstellung

## Beispiele

### Modi

- **Light**: Helles Theme mit leichten Farben und weißem Hintergrund
- **Dark**: Dunkles Theme mit geringerer Helligkeit für weniger Augenbelastung
- **High-Contrast**: Hoher Kontrast für bessere Zugänglichkeit

### Varianten

- **Odoo**: Inspiriert vom Odoo ERP-System mit charakteristischen Farben und Stilen
- **Default**: Standard-Material-UI-Aussehen mit leichten Anpassungen
- **Modern**: Modernes Design mit flachen Elementen (Fallback auf Default)
- **Classic**: Klassisches Business-Look (Fallback auf Odoo)

## Geplante Erweiterungen

- Vollständige Implementierung der Modern- und Classic-Varianten
- Erweitertes Farbpaletten-Management
- Benutzerdefinierte Theme-Presets
- Verbessertes barrierefreies Design 