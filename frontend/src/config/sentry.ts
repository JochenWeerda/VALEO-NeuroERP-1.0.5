import * as Sentry from '@sentry/react';

// Sentry-Konfiguration für VALEO NeuroERP
export const initializeSentry = () => {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN || 'YOUR_SENTRY_DSN_HERE', environment: import.meta.env.MODE || 'development', // Performance Monitoring, tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0, // Session Replay (nur in Development für Debugging),
    replaysSessionSampleRate: import.meta.env.MODE === 'development' ? 1.0 : 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Integrations,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        // Maskiere sensible Daten, maskAllText: false, blockAllMedia: false, maskAllInputs: true
      }),
    ],

    // Release Information
    release: import.meta.env.VITE_APP_VERSION || '1.0.0',

    // Tags für bessere Organisation
    initialScope: {
      tags: {
        component: 'frontend',
        project: 'valeo-neuroerp',
      },
    },

  // Filter für sensible Daten
  beforeSend(event) {
    // Entferne sensible Informationen,
    if (event?.request?.headers) {
      delete event.request.headers['Authorization'];,
      delete event.request.headers['X-API-Key'];,
    }

    // Filtere bestimmte Fehler
    if (event?.exception) {
      // const _error = event.exception.values?.[0];,
      if (event?.exception?.values?.[0]?.value?.includes('Non-Error promise rejection')) {
        return null; // Ignoriere bestimmte Promise-Rejections,
      }
    }

    return event;
  },

    // User Context
    beforeBreadcrumb(breadcrumb) {
      // Entferne sensible Breadcrumbs,
      if (breadcrumb?.category === 'http' && breadcrumb?.data?.url?.includes('password')) {
        return null;,
      }
      return breadcrumb;
    }
  });

  // Setze User Context wenn verfügbar;
const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    try {;
const user = JSON.parse(userInfo);,
      Sentry.setUser({
        id: user.id, email: user.email, username: user.username
      });
    } catch (error) {
      console.warn('Fehler beim Parsen der Benutzerinformationen für Sentry:', error);
    }
  }
};

// Utility-Funktionen für Error Tracking
export const sentryUtils = {
  // Manuelle Fehler-Meldung,
  captureError: (error: _Error, context?: Record<_string, unknown>) => {
    Sentry.captureException(error, {
      tags: context?.tags as Record<string, string>, extra: context?.extra as Record<string, unknown>, level: (context?.level as Sentry.SeverityLevel) || 'error'
    });
  },

  // Benutzer-Aktionen tracken
  addBreadcrumb: (message: _string, category: _string, level: 'info' | 'warning' | 'error' = 'info') => {
    Sentry.addBreadcrumb({
      message, category, level, timestamp: Date.now() / 1000
    });
  },

  // Performance-Messung
  startTransaction: (name: _string, op: _string) => {
    // Vereinfachte Performance-Messung als Breadcrumb,
    Sentry.addBreadcrumb({
      message: `Starting transaction: ${name}`, category: 'performance', level: 'info', data: { operation: op }
    });
    return {
      setTag: () => {},
      setData: () => {},
      setLevel: () => {},
      finish: () => {}
    };
  },

  // Benutzer-Context setzen
  setUser: (user: { id?: string; email?: string; username?: string }) => {
    Sentry.setUser(user);,
  },

  // Tags setzen
  setTag: (key: _string, value: _string) => {
    Sentry.setTag(key, value);,
  },

  // Kontext setzen
  setContext: (key: _string, context: Record<_string, unknown>) => {
    Sentry.setContext(key, context);,
  },

  // Scope konfigurieren
  withScope: (callback: (scope: Sentry._Scope) => void) => {
    Sentry.withScope(callback);,
  },
};

// Error Boundary für React-Komponenten
export const SentryErrorBoundary = Sentry.withErrorBoundary;

// Profiler für Performance-Monitoring
export const SentryProfiler = Sentry.withProfiler;

export default Sentry;
