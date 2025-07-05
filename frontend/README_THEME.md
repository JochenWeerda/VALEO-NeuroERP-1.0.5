# Theme-System für das AI-gesteuerte ERP-System

Dieses Dokument beschreibt die Installation, Nutzung und Integration des Theme-Systems im ERP-System.

## Übersicht

Das Theme-System ermöglicht eine flexible Anpassung des Erscheinungsbilds der Anwendung. Es unterstützt verschiedene Modi (Hell, Dunkel, Hoher Kontrast) und Theme-Varianten (Odoo, Default, Modern, Classic).

## Schnellstart

Um die Theme-Demo zu starten, führen Sie im Hauptverzeichnis des Projekts folgenden Befehl aus:

```powershell
# In PowerShell
.\start_theme_demo.ps1
```

## Funktionen

- **Verschiedene Modi**: Light, Dark, High-Contrast
- **Theme-Varianten**: Odoo, Default, Modern, Classic
- **Parametrisierbare Anpassungen**: Schriftgröße, Abstände, Eckenradien, etc.
- **KI-Integration**: Natürlichsprachliche Befehle zur Theme-Anpassung
- **Persistenz**: Speicherung der Theme-Einstellungen im localStorage

## Integration in Ihr Projekt

### 1. ThemeProvider einbinden

Binden Sie den ThemeProvider in Ihre Anwendung ein:

```tsx
// In Ihrer Root-Komponente (z.B. App.tsx)
import { ThemeProvider } from './themes/ThemeProvider';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      {/* Ihre Anwendung */}
    </ThemeProvider>
  );
};
```

### 2. Theme-Hook verwenden

Verwenden Sie den Theme-Hook in Ihren Komponenten:

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

### 3. KI-Assistenten integrieren

Um Theme-Befehle über natürliche Sprache zu verarbeiten:

```tsx
import { processLLMThemeRequest } from './themes/llmInterface';

// In Ihrem KI-Assistenten oder Chat-Komponente:
const handleUserMessage = (message: string) => {
  // Verarbeitung von Theme-Befehlen
  processLLMThemeRequest(message);
  
  // Weitere Verarbeitung der Nachricht...
};
```

## Modulstruktur

Das Theme-System besteht aus folgenden Hauptkomponenten:

- `ThemeProvider.tsx`: Zentraler Provider für das Theme-System
- `themeTypes.ts`: TypeScript-Definitionen für Theme-Parameter
- `themeService.ts`: Service für die Verwaltung und Erstellung von Themes
- `llmInterface.ts`: Schnittstelle für natürlichsprachliche Befehle
- `variants/`: Verzeichnis mit verschiedenen Theme-Varianten
  - `defaultTheme.ts`: Standard-Theme
  - `odooTheme.ts`: Odoo-inspiriertes Theme

## Verfügbare Komponenten

Das Theme-Modul enthält folgende Komponenten:

1. **ThemeProvider**: Kontext-Provider für das Theme-System
2. **Layout**: Einfache Layout-Komponente mit Theme-Integration
3. **AI**: KI-Assistent für Theme-Befehle
4. **ThemeSettings**: Einstellungsseite für manuelle Theme-Anpassungen
5. **ThemeDemo**: Demo-Anwendung für alle Theme-Funktionen

## Anpassung und Erweiterung

### Neue Theme-Variante hinzufügen

1. Erstellen Sie eine neue Datei in `variants/`, z.B. `modernTheme.ts`
2. Implementieren Sie die Theme-Erstellung basierend auf dem Modus
3. Erweitern Sie den Switch-Case in `createThemeFromConfig` in `ThemeProvider.tsx`

### Neue Theme-Parameter hinzufügen

1. Erweitern Sie die `ThemeParameters`-Schnittstelle in `themeTypes.ts`
2. Aktualisieren Sie den `defaultParameters`-Wert in `ThemeProvider.tsx`
3. Implementieren Sie die Verarbeitung der neuen Parameter in der Theme-Erstellung

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

## Bekannte Einschränkungen

- Die Varianten Modern und Classic sind noch nicht vollständig implementiert und fallen auf Default bzw. Odoo zurück.
- Die KI-Assistent-Integration erfordert die Einbindung des gesamten AI-Moduls.

## Fehlerbehebung

**Frage:** Theme-Einstellungen werden nicht gespeichert?  
**Antwort:** Stellen Sie sicher, dass localStorage im Browser verfügbar und aktiviert ist.

**Frage:** KI-Assistent erkennt Theme-Befehle nicht?  
**Antwort:** Überprüfen Sie die Regex-Muster in `llmInterface.ts` und passen Sie sie bei Bedarf an.

**Frage:** Nach dem Wechsel der Variante ändert sich das Erscheinungsbild nicht?  
**Antwort:** Stellen Sie sicher, dass die entsprechende Variante in `variants/` implementiert ist.

## Mitwirkende

- AI-Team von Folkerts Landhandel

## Lizenz

Dieses Modul ist Teil des AI-gesteuerten ERP-Systems und unterliegt dessen Lizenzbestimmungen. 