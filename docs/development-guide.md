# VALEO NeuroERP - Entwicklungsleitfaden
## Trust-basierte Frontend-Entwicklung

### 🚀 Schnellstart

#### Voraussetzungen
- Node.js 18+ 
- npm 9+
- Git
- Code-Editor (VS Code empfohlen)

#### Installation
```bash
# Repository klonen
git clone https://github.com/JochenWeerda/VALEO-NeuroERP-2.0.git
cd VALEO-NeuroERP-2.0

# Dependencies installieren
npm install

# Frontend-Dependencies installieren
cd frontend
npm install

# Entwicklungsserver starten
npm run dev
```

#### Entwicklungsserver
- **URL:** http://localhost:5173/
- **Hot Reload:** Aktiviert
- **TypeScript:** Konfiguriert
- **Tailwind CSS:** Konfiguriert

### 🏗️ Projektstruktur

```
frontend/src/
├── components/           # Wiederverwendbare UI-Komponenten
│   ├── TrustIndicator.tsx    # Zentrale Trust-Komponente
│   ├── Sidebar.tsx           # Navigation
│   ├── NotificationDropdown.tsx
│   ├── UserDropdown.tsx
│   ├── TrustAwareLayout.tsx
│   ├── ModuleCard.tsx
│   ├── ChatSidebar.tsx
│   └── index.ts              # Zentrale Exports
├── pages/                # Seiten-Komponenten
│   └── TrustAwareDashboard.tsx
├── features/             # Feature-Module
│   ├── crm/
│   ├── fibu/
│   ├── lager/
│   └── bi/
├── lib/                  # Utility-Funktionen
│   └── utils.ts
├── App.tsx               # Haupt-App
└── main.tsx              # Entry-Point
```

### 🎯 Trust-System-Entwicklung

#### Neue Trust-Indikatoren hinzufügen

```typescript
// 1. TrustLevel erweitern (falls nötig)
export type TrustLevel = 'fact' | 'assumption' | 'uncertain' | 'error' | 'processing' | 'new-level';

// 2. Trust-Konfiguration erweitern
const trustConfig = {
  // ... bestehende Levels
  'new-level': {
    color: 'bg-purple-500',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
    icon: '🔮',
    label: 'Neues Level',
    description: 'Beschreibung des neuen Levels'
  }
};
```

#### TrustIndicator verwenden

```typescript
import { TrustIndicator, TrustLevel } from '../components/TrustIndicator';

// Basis-Verwendung
<TrustIndicator level="fact" confidence={95} />

// Mit Benutzer-Entscheidung
<TrustIndicator
  level="assumption"
  confidence={75}
  requiresUserDecision={true}
  onUserDecision={(accepted) => {
    console.log('User decision:', accepted);
  }}
/>

// Mit Details
<TrustIndicator
  level="uncertain"
  confidence={60}
  source="KI-Agent: Lager-Optimierung"
  lastValidated={new Date()}
  showDetails={true}
/>
```

#### TrustAwareWrapper verwenden

```typescript
import { TrustAwareWrapper } from '../components/TrustIndicator';

<TrustAwareWrapper
  trustLevel="fact"
  confidence={98}
  source="Datenbank: Kundenstamm"
>
  <div>Ihr vertrauenswürdiger Inhalt hier</div>
</TrustAwareWrapper>
```

### 🧩 Neue Komponenten erstellen

#### Komponenten-Template

```typescript
// MyComponent.tsx
import React from 'react';
import { cn } from '../lib/utils';
import { TrustIndicator, TrustLevel } from './TrustIndicator';

export interface MyComponentProps {
  title: string;
  trustLevel: TrustLevel;
  confidence?: number;
  source?: string;
  className?: string;
  children?: React.ReactNode;
}

export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  trustLevel,
  confidence,
  source,
  className,
  children
}) => {
  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg p-4', className)}>
      {/* Header mit Trust-Indikator */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <TrustIndicator
          level={trustLevel}
          confidence={confidence}
          source={source}
        />
      </div>
      
      {/* Content */}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};
```

#### Komponente exportieren

```typescript
// components/index.ts
export { MyComponent, type MyComponentProps } from './MyComponent';
```

### 📊 Mock-Daten erstellen

#### Module-Daten

```typescript
// mock/modules.ts
import { ModuleItem } from '../components/Sidebar';

export const mockModules: ModuleItem[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: 'fas fa-home',
    description: 'Systemübersicht und Hauptfunktionen',
    trustLevel: 'fact',
    confidence: 95
  },
  // ... weitere Module
];
```

#### Notification-Daten

```typescript
// mock/notifications.ts
import { Notification } from '../components/NotificationDropdown';

export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Neue Bestellung',
    message: 'Kundenauftrag wurde erstellt',
    type: 'success',
    timestamp: new Date(),
    read: false,
    trustLevel: 'fact',
    confidence: 95,
    category: 'business'
  },
  // ... weitere Benachrichtigungen
];
```

### 🎨 Styling mit Tailwind CSS

#### Trust-basierte Farben

```typescript
// Trust-Level Farben verwenden
const getTrustColors = (level: TrustLevel) => {
  switch (level) {
    case 'fact':
      return 'bg-green-50 border-green-200 text-green-700';
    case 'assumption':
      return 'bg-yellow-50 border-yellow-200 text-yellow-700';
    case 'uncertain':
      return 'bg-orange-50 border-orange-200 text-orange-700';
    case 'error':
      return 'bg-red-50 border-red-200 text-red-700';
    case 'processing':
      return 'bg-blue-50 border-blue-200 text-blue-700';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-700';
  }
};
```

#### Responsive Design

```typescript
// Mobile-First Ansatz
<div className="
  w-full                    /* Mobile: volle Breite */
  md:w-1/2                  /* Tablet: halbe Breite */
  lg:w-1/3                  /* Desktop: ein Drittel */
  xl:w-1/4                  /* Large Desktop: ein Viertel */
">
  {/* Content */}
</div>
```

#### Dark Mode (vorbereitet)

```typescript
// Dark Mode Klassen
<div className="
  bg-white dark:bg-gray-800
  text-gray-900 dark:text-white
  border-gray-200 dark:border-gray-700
">
  {/* Content */}
</div>
```

### 🔧 API-Integration

#### API-Service erstellen

```typescript
// services/api.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export class ApiService {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Trust-Validierung
  static async validateTrust(data: any, source: string): Promise<{
    trustLevel: TrustLevel;
    confidence: number;
    validated: boolean;
  }> {
    return this.request('/api/trust/validate', {
      method: 'POST',
      body: JSON.stringify({ data, source }),
    });
  }

  // Benutzer-Entscheidung loggen
  static async logUserDecision(
    messageId: string,
    accepted: boolean,
    reason?: string
  ): Promise<void> {
    return this.request('/api/trust/user-decision', {
      method: 'POST',
      body: JSON.stringify({ messageId, accepted, reason }),
    });
  }
}
```

#### Hook für API-Calls

```typescript
// hooks/useTrustValidation.ts
import { useState, useCallback } from 'react';
import { ApiService } from '../services/api';
import { TrustLevel } from '../components/TrustIndicator';

export const useTrustValidation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateData = useCallback(async (data: any, source: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await ApiService.validateTrust(data, source);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validierung fehlgeschlagen');
      return {
        trustLevel: 'error' as TrustLevel,
        confidence: 0,
        validated: false,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return { validateData, loading, error };
};
```

### 🧪 Testing

#### Unit Tests schreiben

```typescript
// __tests__/TrustIndicator.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TrustIndicator } from '../components/TrustIndicator';

describe('TrustIndicator', () => {
  it('renders fact level correctly', () => {
    render(<TrustIndicator level="fact" confidence={95} />);
    
    expect(screen.getByText('Fakten-basiert')).toBeInTheDocument();
    expect(screen.getByText('(95%)')).toBeInTheDocument();
  });

  it('shows user decision buttons when required', () => {
    const onDecision = jest.fn();
    
    render(
      <TrustIndicator
        level="assumption"
        requiresUserDecision={true}
        onUserDecision={onDecision}
      />
    );
    
    const acceptButton = screen.getByText('Akzeptieren');
    const rejectButton = screen.getByText('Ablehnen');
    
    expect(acceptButton).toBeInTheDocument();
    expect(rejectButton).toBeInTheDocument();
    
    fireEvent.click(acceptButton);
    expect(onDecision).toHaveBeenCalledWith(true);
  });
});
```

#### Integration Tests

```typescript
// __tests__/TrustAwareDashboard.test.tsx
import { render, screen } from '@testing-library/react';
import { TrustAwareDashboard } from '../pages/TrustAwareDashboard';

describe('TrustAwareDashboard', () => {
  it('renders all modules with trust indicators', () => {
    render(<TrustAwareDashboard />);
    
    // Prüfe Module
    expect(screen.getByText('Kundenverwaltung')).toBeInTheDocument();
    expect(screen.getByText('Finanzbuchhaltung')).toBeInTheDocument();
    
    // Prüfe Trust-Indikatoren
    const trustIndicators = screen.getAllByText(/Fakten-basiert|Vermutung/);
    expect(trustIndicators.length).toBeGreaterThan(0);
  });
});
```

### 📱 Mobile-Entwicklung

#### Touch-Optimierung

```typescript
// Touch-freundliche Buttons
<button className="
  min-h-[44px]              /* Mindesthöhe für Touch */
  px-4 py-2                 /* Ausreichend Padding */
  rounded-lg                /* Abgerundete Ecken */
  active:scale-95           /* Touch-Feedback */
  transition-transform      /* Smooth Animation */
">
  Touch-Button
</button>
```

#### Responsive Navigation

```typescript
// Mobile Navigation
const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <i className="fas fa-bars"></i>
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="
          lg:hidden
          fixed inset-0 z-50
          bg-black bg-opacity-50
        ">
          <div className="
            w-64 h-full
            bg-white shadow-lg
            transform transition-transform
          ">
            {/* Mobile Menu Content */}
          </div>
        </div>
      )}
    </>
  );
};
```

### 🔒 Sicherheitsrichtlinien

#### Trust-Validierung

```typescript
// Immer Trust-Level validieren
const validateTrustLevel = (level: any): TrustLevel => {
  const validLevels: TrustLevel[] = ['fact', 'assumption', 'uncertain', 'error', 'processing'];
  
  if (validLevels.includes(level)) {
    return level;
  }
  
  console.warn(`Invalid trust level: ${level}, falling back to 'uncertain'`);
  return 'uncertain';
};

// Verwendung
const trustLevel = validateTrustLevel(data.trustLevel);
```

#### XSS-Schutz

```typescript
// Sichere Text-Rendering
import DOMPurify from 'dompurify';

const SafeText: React.FC<{ content: string }> = ({ content }) => {
  const sanitizedContent = DOMPurify.sanitize(content);
  
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      className="prose prose-sm max-w-none"
    />
  );
};
```

### 🚀 Performance-Optimierung

#### Code-Splitting

```typescript
// Lazy Loading für Module
const CrmDashboard = lazy(() => import('./features/crm/CrmDashboard'));
const FibuDashboard = lazy(() => import('./features/fibu/FibuDashboard'));

// Suspense Boundary
<Suspense fallback={<LoadingSpinner />}>
  <Route path="/crm" element={<CrmDashboard />} />
</Suspense>
```

#### Memoization

```typescript
// React.memo für teure Komponenten
export const ExpensiveComponent = React.memo<Props>(({ data, onAction }) => {
  // Komponenten-Logik
});

// useMemo für Berechnungen
const processedData = useMemo(() => 
  data.filter(item => item.trustLevel === 'fact'),
  [data]
);
```

#### Bundle-Optimierung

```typescript
// Vite-Konfiguration für Bundle-Splitting
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['tailwindcss', 'clsx'],
          trust: ['../components/TrustIndicator'],
        },
      },
    },
  },
});
```

### 📝 Code-Standards

#### TypeScript-Richtlinien

```typescript
// Strikte Typisierung
interface UserData {
  id: string;
  name: string;
  email: string;
  trustLevel: TrustLevel;
  confidence: number;
}

// Union Types für Status
type ModuleStatus = 'active' | 'maintenance' | 'planned' | 'deprecated';

// Generic Types für wiederverwendbare Komponenten
interface DataListProps<T> {
  data: T[];
  renderItem: (item: T) => React.ReactNode;
  trustLevel: TrustLevel;
}
```

#### Naming Conventions

```typescript
// Komponenten: PascalCase
export const TrustIndicator: React.FC<Props> = () => {};

// Hooks: camelCase mit "use" Prefix
export const useTrustValidation = () => {};

// Types/Interfaces: PascalCase
export interface TrustIndicatorProps {};

// Konstanten: UPPER_SNAKE_CASE
export const TRUST_LEVELS: TrustLevel[] = ['fact', 'assumption', 'uncertain'];

// Dateien: kebab-case
// trust-indicator.tsx
// use-trust-validation.ts
```

### 🔄 Git-Workflow

#### Commit-Message-Format

```bash
# Format: type(scope): description
feat(trust): add new trust level validation
fix(ui): resolve sidebar collapse issue
docs(api): update API documentation
test(components): add TrustIndicator tests
refactor(utils): optimize trust calculation
```

#### Branch-Strategie

```bash
# Feature-Branches
git checkout -b feature/trust-validation
git checkout -b feature/mobile-optimization

# Bugfix-Branches
git checkout -b fix/trust-indicator-display

# Release-Branches
git checkout -b release/v1.1.0
```

### 📊 Monitoring und Debugging

#### Trust-Metriken

```typescript
// Trust-Performance tracken
const trackTrustMetric = (metric: {
  component: string;
  trustLevel: TrustLevel;
  confidence: number;
  responseTime: number;
}) => {
  // Analytics-Integration
  analytics.track('trust_metric', metric);
  
  // Console für Development
  if (process.env.NODE_ENV === 'development') {
    console.log('Trust Metric:', metric);
  }
};
```

#### Error Boundary

```typescript
// Trust-spezifische Error Boundary
class TrustErrorBoundary extends Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Trust-Fehler loggen
    console.error('Trust Error:', error, errorInfo);
    
    // Analytics
    analytics.track('trust_error', {
      error: error.message,
      component: errorInfo.componentStack,
    });
  }
}
```

### 🎯 Best Practices

#### Trust-First Development

1. **Immer Trust-Level definieren**: Jede Datenquelle muss ein Trust-Level haben
2. **Benutzer-Entscheidungen ermöglichen**: Bei Unsicherheiten immer Benutzer-Input ermöglichen
3. **Transparenz gewährleisten**: Daten-Quelle und Validierungszeitpunkt immer anzeigen
4. **Audit-Trail**: Alle Trust-Entscheidungen protokollieren

#### Performance-First

1. **Lazy Loading**: Module und Komponenten bei Bedarf laden
2. **Memoization**: Teure Berechnungen cachen
3. **Bundle-Splitting**: Code in sinnvolle Chunks aufteilen
4. **Image-Optimization**: Bilder komprimieren und lazy laden

#### Accessibility-First

1. **ARIA-Labels**: Alle interaktiven Elemente beschriften
2. **Keyboard Navigation**: Vollständige Tastaturbedienung
3. **Color Contrast**: Ausreichende Farbkontraste
4. **Screen Reader**: Semantische HTML-Struktur

### 📚 Weiterführende Ressourcen

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Trust-Aware UI Patterns](docs/trust-aware-ui-components.md)
- [System Architecture](docs/technical-architecture.md)

### 🆘 Support

Bei Fragen oder Problemen:
1. Dokumentation prüfen
2. Issues auf GitHub erstellen
3. Team-Chat konsultieren
4. Code-Review anfordern

---

**Letzte Aktualisierung:** Dezember 2024  
**Version:** 1.0.0  
**Status:** Vollständig implementiert und dokumentiert 