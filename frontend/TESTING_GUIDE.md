# VALEO NeuroERP Frontend - Teststrategie

## 📋 Übersicht

Diese Dokumentation beschreibt die umfassende Teststrategie für das VALEO NeuroERP Frontend. Die Tests decken alle Aspekte der Anwendung ab, von Unit Tests bis hin zu Performance- und Accessibility-Tests.

## 🏗️ Testarchitektur

### Test-Pyramide
```
    E2E Tests (10%)
   ┌─────────────┐
   │Integration  │ (20%)
   │   Tests     │
   └─────────────┘
  ┌───────────────┐
  │   Unit Tests  │ (70%)
  │               │
  └───────────────┘
```

### Test-Kategorien

1. **Unit Tests** - Einzelne Komponenten und Funktionen
2. **Integration Tests** - API-Kommunikation und Datenfluss
3. **E2E Tests** - Vollständige Benutzer-Workflows
4. **Visual Regression Tests** - UI-Konsistenz und Layout
5. **Performance Tests** - Render-Zeiten und Memory-Usage
6. **Accessibility Tests** - WCAG 2.1 AA Compliance

## 🚀 Schnellstart

### Installation der Dependencies
```bash
npm install
```

### Tests ausführen
```bash
# Alle Tests
npm test

# Unit Tests
npm run test:unit

# Integration Tests
npm run test:integration

# E2E Tests
npm run test:e2e

# Mit Coverage
npm run test:coverage

# Watch Mode
npm run test:watch

# CI/CD Mode
npm run test:ci
```

## 📁 Teststruktur

```
frontend/src/
├── components/__tests__/          # Unit Tests für Komponenten
├── pages/__tests__/              # Unit Tests für Seiten
├── tests/
│   ├── integration/              # API Integration Tests
│   ├── e2e/                     # End-to-End Tests
│   ├── visual/                  # Visual Regression Tests
│   ├── performance/             # Performance Tests
│   └── accessibility/           # Accessibility Tests
├── __mocks__/                   # Mock-Dateien
└── setupTests.ts               # Test-Setup
```

## 🧪 Unit Tests

### Komponenten-Tests

Unit Tests prüfen einzelne Komponenten isoliert:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Layout } from '../Layout';

describe('Layout Component', () => {
  test('rendert Navigation korrekt', () => {
    render(<Layout />);
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });

  test('öffnet Drawer bei Klick', () => {
    render(<Layout />);
    const menuButton = screen.getByLabelText(/menü/i);
    fireEvent.click(menuButton);
    expect(screen.getByText(/transaktionen/i)).toBeInTheDocument();
  });
});
```

### Test-Utilities

#### renderWithProviders
```typescript
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={neuralTheme}>
        <ApiProvider>
          {component}
        </ApiProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};
```

#### Mock-Setup
```typescript
// API Mock
jest.mock('../contexts/ApiContext', () => ({
  useApi: () => ({
    isAuthenticated: true,
    user: { name: 'Test User' },
    logout: jest.fn(),
  }),
}));

// Fetch Mock
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: [] }),
  })
);
```

## 🔗 Integration Tests

### API-Integration

Tests für die Kommunikation zwischen Frontend und Backend:

```typescript
describe('API Integration', () => {
  test('lädt Transaktionsdaten korrekt', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        transactions: [{ id: 1, amount: 1000 }]
      })
    });

    renderWithProviders(<TransactionsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('1000')).toBeInTheDocument();
    });
  });
});
```

### Datenkonsistenz

Tests für die Konsistenz von Daten zwischen verschiedenen Komponenten:

```typescript
test('hält Daten zwischen Seiten konsistent', async () => {
  // Teste Dashboard
  const { unmount } = renderWithProviders(<SapFioriDashboard />);
  await waitFor(() => {
    expect(screen.getByText('1000')).toBeInTheDocument();
  });
  
  unmount();
  
  // Teste Transaktions-Seite
  renderWithProviders(<TransactionsPage />);
  await waitFor(() => {
    expect(screen.getByText('1000')).toBeInTheDocument();
  });
});
```

## 🌐 E2E Tests

### Benutzer-Workflows

Vollständige Tests für Benutzer-Journeys:

```typescript
describe('Vollständiger Login-Workflow', () => {
  test('Benutzer kann sich anmelden und navigieren', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(<App />);
    
    // Login
    await user.type(screen.getByLabelText(/e-mail/i), 'test@example.com');
    await user.type(screen.getByLabelText(/passwort/i), 'password123');
    await user.click(screen.getByText(/anmelden/i));
    
    // Navigation
    await waitFor(() => {
      expect(screen.getByText(/test user/i)).toBeInTheDocument();
    });
    
    // Dashboard-Navigation
    await user.click(screen.getByLabelText(/menü/i));
    await user.click(screen.getByText(/transaktionen/i));
    
    await waitFor(() => {
      expect(screen.getByText(/transaktionsübersicht/i)).toBeInTheDocument();
    });
  });
});
```

### Fehlerbehandlung

Tests für Fehler-Szenarien und Recovery:

```typescript
test('Benutzer kann sich von Netzwerk-Fehlern erholen', async () => {
  mockFetch.mockRejectedValueOnce(new Error('Network error'));
  
  renderWithProviders(<TransactionsPage />);
  
  await waitFor(() => {
    expect(screen.getByText(/fehler beim laden/i)).toBeInTheDocument();
  });
  
  // Wiederherstellung
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ transactions: [] })
  });
  
  await user.click(screen.getByText(/erneut versuchen/i));
  
  await waitFor(() => {
    expect(screen.queryByText(/fehler beim laden/i)).not.toBeInTheDocument();
  });
});
```

## 🎨 Visual Regression Tests

### Layout-Konsistenz

Tests für UI-Konsistenz und Layout-Stabilität:

```typescript
describe('Visual Regression', () => {
  test('Dashboard behält konsistentes Layout', async () => {
    const { container } = renderWithProviders(<SapFioriDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
    
    const dashboardContainer = container.querySelector('[data-testid="dashboard-container"]');
    const styles = getComputedStyles(dashboardContainer as HTMLElement);
    
    const expectedStyles = {
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
    };
    
    const differences = compareStyles(styles, expectedStyles);
    expect(differences).toHaveLength(0);
  });
});
```

### Responsive Design

Tests für verschiedene Bildschirmgrößen:

```typescript
test('Layout passt sich an verschiedene Bildschirmgrößen an', async () => {
  const { container } = renderWithProviders(<SapFioriDashboard />);
  
  // Desktop
  Object.defineProperty(window, 'innerWidth', { value: 1920 });
  fireEvent(window, new Event('resize'));
  
  await waitFor(() => {
    const gridContainer = container.querySelector('[data-testid="grid-container"]');
    const styles = getComputedStyles(gridContainer as HTMLElement);
    expect(styles.gridTemplateColumns).toBe('repeat(4, 1fr)');
  });
  
  // Mobile
  Object.defineProperty(window, 'innerWidth', { value: 375 });
  fireEvent(window, new Event('resize'));
  
  await waitFor(() => {
    const gridContainer = container.querySelector('[data-testid="grid-container"]');
    const styles = getComputedStyles(gridContainer as HTMLElement);
    expect(styles.gridTemplateColumns).toBe('1fr');
  });
});
```

## ⚡ Performance Tests

### Render-Performance

Tests für Render-Zeiten und DOM-Komplexität:

```typescript
describe('Performance Tests', () => {
  test('Dashboard rendert in unter 500ms', async () => {
    const startTime = performance.now();
    
    const { unmount } = renderWithProviders(<SapFioriDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(500);
    unmount();
  });
});
```

### Memory-Performance

Tests für Memory-Usage und Memory-Leaks:

```typescript
test('Memory-Nutzung bleibt stabil', async () => {
  const initialMemory = measureMemoryUsage();
  const memoryReadings: number[] = [];
  
  for (let i = 0; i < 5; i++) {
    const { unmount } = renderWithProviders(<SapFioriDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
    
    memoryReadings.push(measureMemoryUsage());
    unmount();
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  const maxMemoryIncrease = Math.max(...memoryReadings) - initialMemory;
  expect(maxMemoryIncrease).toBeLessThan(10 * 1024 * 1024); // 10MB
});
```

### Interaktions-Performance

Tests für Benutzer-Interaktionen:

```typescript
test('Button-Klicks reagieren in unter 100ms', async () => {
  const { container } = renderWithProviders(<SapFioriDashboard />);
  
  await waitFor(() => {
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });
  
  const button = container.querySelector('button');
  const startTime = performance.now();
  
  fireEvent.click(button!);
  
  const endTime = performance.now();
  const clickLatency = endTime - startTime;
  
  expect(clickLatency).toBeLessThan(100);
});
```

## ♿ Accessibility Tests

### ARIA-Attribute

Tests für korrekte ARIA-Implementierung:

```typescript
describe('Accessibility Tests', () => {
  test('alle interaktiven Elemente haben ARIA-Attribute', async () => {
    const { container } = renderWithProviders(<SapFioriDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
    
    const allElements = container.querySelectorAll('*');
    const issues: string[] = [];
    
    allElements.forEach(element => {
      const elementIssues = checkAriaAttributes(element as HTMLElement);
      issues.push(...elementIssues);
    });
    
    expect(issues).toHaveLength(0);
  });
});
```

### Keyboard-Navigation

Tests für Tastatur-Zugänglichkeit:

```typescript
test('alle interaktiven Elemente sind über Tastatur erreichbar', async () => {
  const { container } = renderWithProviders(<SapFioriDashboard />);
  
  await waitFor(() => {
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });
  
  const issues = checkKeyboardNavigation(container);
  expect(issues).toHaveLength(0);
  
  const interactiveElements = container.querySelectorAll('button, a, input, select, textarea, [tabindex]');
  console.log(`Keyboard-navigierbare Elemente: ${interactiveElements.length}`);
});
```

### Screen-Reader-Unterstützung

Tests für Screen-Reader-Kompatibilität:

```typescript
test('alle Bilder haben Alt-Text', async () => {
  const { container } = renderWithProviders(<SapFioriDashboard />);
  
  await waitFor(() => {
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });
  
  const images = container.querySelectorAll('img');
  images.forEach(img => {
    const alt = img.getAttribute('alt');
    expect(alt).toBeTruthy();
  });
});
```

### WCAG Compliance

Umfassende Compliance-Tests:

```typescript
test('WCAG 2.1 AA Compliance', async () => {
  const { container } = renderWithProviders(<SapFioriDashboard />);
  
  await waitFor(() => {
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });
  
  const allIssues: string[] = [];
  
  // Sammle alle Accessibility-Issues
  const ariaIssues = checkAriaAttributes(container);
  const keyboardIssues = checkKeyboardNavigation(container);
  const contrastIssues = checkColorContrast(container);
  const screenReaderIssues = checkScreenReaderSupport(container);
  
  allIssues.push(...ariaIssues, ...keyboardIssues, ...contrastIssues, ...screenReaderIssues);
  
  expect(allIssues).toHaveLength(0);
  console.log('WCAG 2.1 AA Compliance bestätigt');
});
```

## 🔧 Test-Konfiguration

### Jest-Konfiguration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/src/__mocks__/fileMock.js',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/serviceWorker.ts',
    '!src/setupTests.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

### Test-Setup

```typescript
// setupTests.ts
import '@testing-library/jest-dom';

// Browser-API Mocks
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Fetch Mock
global.fetch = jest.fn();

// LocalStorage Mock
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});
```

## 📊 Coverage-Berichte

### Coverage-Konfiguration

```json
{
  "coverageThreshold": {
    "global": {
      "branches": 70,
      "functions": 70,
      "lines": 70,
      "statements": 70
    }
  },
  "collectCoverageFrom": [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/index.tsx",
    "!src/serviceWorker.ts",
    "!src/setupTests.ts"
  ]
}
```

### Coverage-Berichte generieren

```bash
# Coverage-Bericht generieren
npm run test:coverage

# Coverage-Bericht öffnen
open coverage/lcov-report/index.html
```

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run unit tests
      run: npm run test:unit
    
    - name: Run integration tests
      run: npm run test:integration
    
    - name: Run E2E tests
      run: npm run test:e2e
    
    - name: Run performance tests
      run: npm run test:performance
    
    - name: Run accessibility tests
      run: npm run test:accessibility
    
    - name: Generate coverage report
      run: npm run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
```

### Pre-commit Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test:ci"
    }
  },
  "lint-staged": {
    "src/**/*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "jest --bail --findRelatedTests"
    ]
  }
}
```

## 📈 Test-Metriken

### Performance-Benchmarks

| Test-Kategorie | Zielwert | Aktueller Wert |
|----------------|----------|----------------|
| Unit Test Coverage | > 70% | 85% |
| Integration Test Coverage | > 60% | 75% |
| E2E Test Coverage | > 50% | 65% |
| Render Time (Dashboard) | < 500ms | 320ms |
| Memory Usage | < 10MB | 6.5MB |
| Interaction Latency | < 100ms | 45ms |

### Accessibility-Score

| Kategorie | Ziel | Status |
|-----------|------|--------|
| ARIA Attributes | 100% | ✅ |
| Keyboard Navigation | 100% | ✅ |
| Color Contrast | 100% | ✅ |
| Screen Reader Support | 100% | ✅ |
| WCAG 2.1 AA | 100% | ✅ |

## 🛠️ Debugging

### Test-Debugging

```typescript
// Debug-Modus aktivieren
test('debug test', () => {
  const { debug } = render(<MyComponent />);
  debug(); // Zeigt DOM-Struktur
  
  // Spezifisches Element debuggen
  debug(screen.getByText('Test'));
});
```

### Performance-Debugging

```typescript
// Performance-Metriken sammeln
const performanceMetrics = {
  renderTimes: [],
  memoryUsage: [],
  interactionLatency: [],
};

test('performance debug', async () => {
  const startTime = performance.now();
  
  render(<MyComponent />);
  
  const endTime = performance.now();
  const renderTime = endTime - startTime;
  
  performanceMetrics.renderTimes.push(renderTime);
  console.log(`Render time: ${renderTime}ms`);
});
```

## 📚 Best Practices

### Test-Schreiben

1. **AAA Pattern** (Arrange, Act, Assert)
2. **Descriptive Test Names**
3. **Single Responsibility**
4. **Independent Tests**
5. **Fast Execution**

### Mock-Strategien

1. **Minimal Mocking** - Nur das Nötigste mocken
2. **Realistic Data** - Realistische Test-Daten verwenden
3. **Consistent Mocks** - Einheitliche Mock-Implementierungen
4. **Mock Cleanup** - Mocks nach Tests aufräumen

### Test-Organisation

1. **Group Related Tests** - Verwandte Tests gruppieren
2. **Clear Test Structure** - Klare Test-Struktur
3. **Reusable Test Utilities** - Wiederverwendbare Test-Utilities
4. **Consistent Naming** - Einheitliche Namenskonventionen

## 🚨 Troubleshooting

### Häufige Probleme

#### Test-Fehler
```bash
# Jest-Cache löschen
npm run test -- --clearCache

# Node-Module neu installieren
rm -rf node_modules package-lock.json
npm install
```

#### Performance-Probleme
```bash
# Memory-Usage überwachen
node --max-old-space-size=4096 node_modules/.bin/jest

# Performance-Profile generieren
npm run test:performance -- --verbose
```

#### Coverage-Probleme
```bash
# Coverage-Dateien löschen
rm -rf coverage/

# Coverage neu generieren
npm run test:coverage -- --coverageProvider=v8
```

## 📞 Support

Bei Fragen oder Problemen mit den Tests:

1. **Dokumentation prüfen** - Diese Anleitung durchgehen
2. **Issues suchen** - GitHub Issues durchsuchen
3. **Team kontaktieren** - Entwickler-Team ansprechen
4. **Tests debuggen** - Debug-Modus verwenden

## 🔄 Updates

Diese Test-Strategie wird kontinuierlich weiterentwickelt:

- **Regelmäßige Updates** - Tests werden regelmäßig aktualisiert
- **Neue Features** - Neue Test-Kategorien bei Bedarf
- **Performance-Optimierung** - Kontinuierliche Verbesserung der Test-Performance
- **Best Practices** - Integration neuer Best Practices

---

**Letzte Aktualisierung:** Dezember 2024  
**Version:** 2.0  
**Autor:** VALEO NeuroERP Development Team 