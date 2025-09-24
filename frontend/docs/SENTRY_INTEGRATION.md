# Sentry Error Tracking Integration

## Übersicht

Diese Dokumentation beschreibt die Integration von Sentry für Error Tracking und Performance Monitoring im VALEO NeuroERP Frontend.

## Konfiguration

### 1. Umgebungsvariablen

Erstelle eine `.env.local` Datei im Frontend-Verzeichnis:

```env
# Sentry Error Tracking
VITE_SENTRY_DSN=YOUR_SENTRY_DSN_HERE

# App Version
VITE_APP_VERSION=1.0.0

# Sentry Build-Konfiguration (nur für Production Builds)
SENTRY_ORG=YOUR_ORG
SENTRY_PROJECT=YOUR_PROJECT
SENTRY_AUTH_TOKEN=YOUR_AUTH_TOKEN
```

### 2. Sentry-Projekt einrichten

1. Gehe zu [sentry.io](https://sentry.io) und erstelle ein neues Projekt
2. Wähle "React" als Framework
3. Kopiere den DSN in deine Umgebungsvariablen

## Verwendung

### Automatisches Error Tracking

Sentry ist bereits in der Anwendung integriert und trackt automatisch:

- **JavaScript-Fehler**: Alle unerwarteten Fehler
- **Promise-Rejections**: Unbehandelte Promise-Fehler
- **React Error Boundaries**: Komponenten-Fehler
- **API-Fehler**: HTTP-Request-Fehler
- **Performance**: Langsame API-Aufrufe und Transaktionen

### Manuelles Error Tracking

#### Mit dem useSentry Hook

```tsx
import { useSentry } from '../hooks/useSentry';

const MyComponent = () => {
  const { captureError, addBreadcrumb, setTag } = useSentry();

  const handleError = () => {
    try {
      // Riskanter Code
      riskyOperation();
    } catch (error) {
      captureError(error as Error, {
        tags: { component: 'MyComponent' },
        extra: { userId: '123' },
        level: 'error'
      });
    }
  };

  const handleUserAction = () => {
    addBreadcrumb('Benutzer hat Aktion ausgeführt', 'user-action');
    setTag('feature', 'advanced-search');
  };

  return <div>...</div>;
};
```

#### Direkt mit sentryUtils

```tsx
import { sentryUtils } from '../config/sentry';

// Fehler melden
sentryUtils.captureError(new Error('Etwas ist schiefgelaufen'), {
  tags: { component: 'checkout' },
  extra: { orderId: '12345' }
});

// Breadcrumb hinzufügen
sentryUtils.addBreadcrumb('Benutzer hat Checkout gestartet', 'user-flow');

// Performance messen
const transaction = sentryUtils.startTransaction('checkout-process', 'user-action');
// ... Code ausführen ...
transaction.finish();
```

### API Error Tracking

Für automatisches API-Error-Tracking mit Axios:

```tsx
import axios from 'axios';
import { setupAxiosSentryInterceptor } from '../utils/sentryApiTracking';

const apiClient = axios.create({
  baseURL: '/api',
});

// Sentry Interceptor einrichten
setupAxiosSentryInterceptor(apiClient);
```

## Features

### Error Boundaries

Die Anwendung verwendet `SentryErrorBoundary` für React-Komponenten:

```tsx
import SentryErrorBoundary from '../components/SentryErrorBoundary';

const App = () => (
  <SentryErrorBoundary>
    <MyComponent />
  </SentryErrorBoundary>
);
```

### Performance Monitoring

Sentry trackt automatisch:

- **Page Load Performance**: Initiale Ladezeiten
- **API Performance**: Langsame Requests (>5s werden gewarnt)
- **User Interactions**: Klicks, Navigation, etc.
- **Custom Transactions**: Manuelle Performance-Messungen

### Session Replay

In Development-Modus wird Session Replay aktiviert für besseres Debugging.

### Sensitive Data Filtering

Sentry filtert automatisch sensible Daten:

- Authorization Headers
- Passwort-Felder
- API-Keys
- Benutzerdaten

## Build-Prozess

### Development

```bash
npm run dev
```

Sentry läuft im Development-Modus mit:
- Vollständige Error-Tracking
- Session Replay aktiviert
- Detaillierte Performance-Metriken

### Production

```bash
# Normale Production Build
npm run build:prod

# Mit Sentry Source Maps Upload
npm run build:sentry
```

## Monitoring Dashboard

### Sentry Dashboard

Gehe zu deinem Sentry-Projekt-Dashboard um zu sehen:

1. **Issues**: Alle Fehler mit Häufigkeit und Impact
2. **Performance**: Ladezeiten und langsame Operationen
3. **Releases**: Version-spezifische Fehler-Trends
4. **Users**: Betroffene Benutzer und Geräte

### Wichtige Metriken

- **Error Rate**: Prozentsatz der Benutzer mit Fehlern
- **Performance**: 75th und 95th Percentile Ladezeiten
- **Release Health**: Fehler-Trends pro Version

## Best Practices

### 1. Error Context

Füge immer relevanten Kontext hinzu:

```tsx
captureError(error, {
  tags: {
    component: 'UserProfile',
    action: 'updateProfile',
    userId: user.id
  },
  extra: {
    formData: formValues,
    validationErrors: errors
  }
});
```

### 2. Breadcrumbs

Verwende Breadcrumbs für bessere Debugging:

```tsx
addBreadcrumb('Benutzer hat Profil geöffnet', 'navigation');
addBreadcrumb('Formular validiert', 'validation', 'info');
addBreadcrumb('API-Request gestartet', 'http', 'info');
```

### 3. Performance Monitoring

Überwache kritische User-Flows:

```tsx
const transaction = startTransaction('user-registration', 'user-action');
try {
  await registerUser(userData);
  transaction.setTag('success', 'true');
} catch (error) {
  transaction.setTag('success', 'false');
  throw error;
} finally {
  transaction.finish();
}
```

### 4. User Context

Setze Benutzer-Kontext für besseres Debugging:

```tsx
setUser({
  id: user.id,
  email: user.email,
  username: user.username
});
```

## Troubleshooting

### Sentry wird nicht initialisiert

1. Prüfe, ob `VITE_SENTRY_DSN` gesetzt ist
2. Prüfe Browser-Konsole auf Fehler
3. Stelle sicher, dass Sentry vor anderen Imports steht

### Source Maps werden nicht hochgeladen

1. Prüfe `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`
2. Führe `npm run build:sentry` aus
3. Prüfe Sentry-Dashboard auf Source Maps

### Zu viele Events

1. Passe `tracesSampleRate` in der Sentry-Konfiguration an
2. Verwende `beforeSend` Filter für weniger wichtige Events
3. Setze `replaysSessionSampleRate` niedriger

## Sicherheit

- Alle sensiblen Daten werden automatisch gefiltert
- DSN ist öffentlich und kann in Client-Code stehen
- Auth Token nur für Build-Prozess verwenden
- Keine Passwörter oder API-Keys in Events

## Support

Bei Problemen mit der Sentry-Integration:

1. Prüfe die Browser-Konsole auf Fehler
2. Schaue in das Sentry-Dashboard für Event-Details
3. Kontaktiere das Development-Team
