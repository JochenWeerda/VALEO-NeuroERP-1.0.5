# Sentry Konfiguration für VALEO NeuroERP

## Umgebungsvariablen einrichten

Erstelle eine `.env.local` Datei im Frontend-Verzeichnis:

```bash
# Sentry Error Tracking
VITE_SENTRY_DSN=https://YOUR_DSN_HERE@sentry.io/PROJECT_ID

# App Version
VITE_APP_VERSION=1.0.0

# Environment
NODE_ENV=development
```

## Sentry-Projekt einrichten

1. Gehe zu [sentry.io](https://sentry.io)
2. Erstelle ein neues Projekt:
   - **Platform**: React
   - **Project Name**: `valeo-neuroerp-frontend`
3. Kopiere den DSN in die `.env.local` Datei

## Demo testen

1. Starte die Anwendung: `npm run dev`
2. Gehe zu `/sentry-demo` in der Navigation
3. Teste die verschiedenen Sentry-Features
4. Überprüfe dein Sentry-Dashboard für die Events

## Features der Demo

- ✅ JavaScript-Fehler auslösen
- ✅ Async-Fehler simulieren  
- ✅ Performance-Monitoring testen
- ✅ User-Context setzen
- ✅ Breadcrumbs hinzufügen
- ✅ Custom Tags setzen

Alle Events werden automatisch an Sentry gesendet!
