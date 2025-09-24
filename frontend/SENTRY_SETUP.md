# 🚨 Sentry Error Tracking Setup für VALEO NeuroERP

## Schnellstart

### 1. Sentry-Projekt erstellen

1. Gehe zu [sentry.io](https://sentry.io) und melde dich an
2. Erstelle ein neues Projekt:
   - **Platform**: React
   - **Project Name**: `valeo-neuroerp-frontend`
   - **Team**: Wähle dein Team

### 2. DSN konfigurieren

Nach der Projekt-Erstellung erhältst du einen DSN. Erstelle eine `.env.local` Datei:

```bash
# Frontend/.env.local
VITE_SENTRY_DSN=https://YOUR_DSN_HERE@sentry.io/PROJECT_ID
VITE_APP_VERSION=1.0.0
```

### 3. Build-Konfiguration (Optional)

Für Production Builds mit Source Maps Upload:

```bash
# Frontend/.env.local
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=valeo-neuroerp-frontend
SENTRY_AUTH_TOKEN=your-auth-token
```

## Verwendung

### Automatisches Tracking

Sentry trackt automatisch:
- ✅ JavaScript-Fehler
- ✅ Promise-Rejections  
- ✅ React Error Boundaries
- ✅ API-Fehler
- ✅ Performance-Metriken

### Manuelles Tracking

```tsx
import { useSentry } from '../hooks/useSentry';

const MyComponent = () => {
  const { captureError, addBreadcrumb } = useSentry();

  const handleError = () => {
    try {
      // Riskanter Code
      riskyOperation();
    } catch (error) {
      captureError(error as Error, {
        tags: { component: 'MyComponent' },
        extra: { userId: '123' }
      });
    }
  };

  return <div>...</div>;
};
```

## Build-Scripts

```bash
# Development (mit Sentry)
npm run dev

# Production Build
npm run build:prod

# Production Build mit Sentry Source Maps
npm run build:sentry
```

## Dashboard

Gehe zu deinem Sentry-Dashboard um zu sehen:
- 📊 **Issues**: Alle Fehler mit Häufigkeit
- ⚡ **Performance**: Ladezeiten und langsame Operationen  
- 🚀 **Releases**: Version-spezifische Trends
- 👥 **Users**: Betroffene Benutzer

## Features

### Error Boundaries
- `SentryErrorBoundary`: Für React-Komponenten
- Automatisches Error-Tracking
- Benutzerfreundliche Fehler-Seiten

### Performance Monitoring
- Page Load Performance
- API-Response-Zeiten
- Custom Transactions
- Langsame Requests werden gewarnt (>5s)

### Session Replay
- Aktiviert im Development-Modus
- Hilft beim Debugging von Benutzer-Interaktionen
- Maskiert sensible Daten automatisch

### Data Privacy
- Automatisches Filtern von Passwörtern
- Entfernung von API-Keys
- Keine sensiblen Daten in Events

## Troubleshooting

### Sentry wird nicht initialisiert
1. Prüfe `VITE_SENTRY_DSN` in `.env.local`
2. Schaue in Browser-Konsole nach Fehlern
3. Stelle sicher, dass Sentry vor anderen Imports steht

### Source Maps werden nicht hochgeladen
1. Prüfe `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`
2. Führe `npm run build:sentry` aus
3. Prüfe Sentry-Dashboard auf Source Maps

### Zu viele Events
1. Passe `tracesSampleRate` in `src/config/sentry.ts` an
2. Verwende `beforeSend` Filter für weniger wichtige Events

## Sicherheit

- ✅ DSN ist öffentlich und kann in Client-Code stehen
- ✅ Auth Token nur für Build-Prozess verwenden  
- ✅ Keine Passwörter oder API-Keys in Events
- ✅ Automatisches Filtern von sensiblen Daten

## Support

Bei Problemen:
1. Prüfe Browser-Konsole auf Fehler
2. Schaue in Sentry-Dashboard für Event-Details
3. Kontaktiere das Development-Team

---

**🎉 Sentry ist jetzt erfolgreich in VALEO NeuroERP integriert!**
