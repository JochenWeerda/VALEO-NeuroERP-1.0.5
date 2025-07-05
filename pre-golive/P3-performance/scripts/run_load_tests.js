import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Metriken definieren
const failureRate = new Rate('failed_requests');

// Test-Konfiguration
export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Aufwärmphase
    { duration: '5m', target: 500 }, // Last steigern
    { duration: '10m', target: 1000 }, // Hauptlastphase
    { duration: '3m', target: 0 }, // Abkühlen
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% der Requests unter 500ms
    failed_requests: ['rate<0.01'], // weniger als 1% Fehler
  },
};

// Testszenarien
const scenarios = {
  'auth': {
    url: 'http://auth.staging.valeo-neuroerp.com',
    endpoints: {
      login: '/api/auth/login',
      verify: '/api/auth/verify',
      refresh: '/api/auth/refresh',
    }
  },
  'api': {
    url: 'http://api.staging.valeo-neuroerp.com',
    endpoints: {
      health: '/health',
      metrics: '/metrics',
      status: '/status',
    }
  },
  'excel': {
    url: 'http://excel.staging.valeo-neuroerp.com',
    endpoints: {
      export: '/api/excel/export',
      status: '/api/excel/status',
    }
  }
};

// Haupttestfunktion
export default function () {
  // Auth-Tests
  const loginPayload = JSON.stringify({
    username: 'testuser',
    password: 'testpass',
  });

  const loginRes = http.post(
    `${scenarios.auth.url}${scenarios.auth.endpoints.login}`,
    loginPayload,
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(loginRes, {
    'login successful': (r) => r.status === 200,
    'has token': (r) => JSON.parse(r.body).token !== undefined,
  });

  if (loginRes.status !== 200) {
    failureRate.add(1);
  }

  // Token aus Login-Response extrahieren
  const token = loginRes.status === 200 ? JSON.parse(loginRes.body).token : '';

  // API-Tests mit Token
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Health-Check
  const healthRes = http.get(
    `${scenarios.api.url}${scenarios.api.endpoints.health}`,
    { headers }
  );

  check(healthRes, {
    'health check successful': (r) => r.status === 200,
  });

  // Excel-Export Test
  const exportPayload = JSON.stringify({
    reportType: 'sales',
    dateRange: {
      start: '2024-01-01',
      end: '2024-03-31',
    },
  });

  const exportRes = http.post(
    `${scenarios.excel.url}${scenarios.excel.endpoints.export}`,
    exportPayload,
    { headers }
  );

  check(exportRes, {
    'export request accepted': (r) => r.status === 202,
    'has job id': (r) => JSON.parse(r.body).jobId !== undefined,
  });

  // Simuliere reale Benutzerverhalten
  sleep(Math.random() * 3 + 1); // 1-4 Sekunden Pause
}

// Teardown-Funktion
export function teardown(data) {
  // Cleanup-Code hier
}

// Setup-Funktion
export function setup() {
  // Setup-Code hier
  return {};
}

// Berichtserstellung
export function handleSummary(data) {
  return {
    '../reports/performance_results.md': generateMarkdownReport(data),
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
  };
}

// Markdown-Bericht generieren
function generateMarkdownReport(data) {
  return `# Performance-Testbericht - VALEO-NeuroERP v1.1.0

Testdatum: ${new Date().toISOString()}

## Zusammenfassung

- Dauer: ${data.state.testRunDuration}
- Virtuelle Benutzer max: ${data.state.maxVUs}
- Gesamtanfragen: ${data.metrics.iterations.count}

## Performance-Metriken

### Response-Zeiten
- Durchschnitt: ${data.metrics.http_req_duration.avg.toFixed(2)}ms
- P90: ${data.metrics.http_req_duration.p90.toFixed(2)}ms
- P95: ${data.metrics.http_req_duration.p95.toFixed(2)}ms
- P99: ${data.metrics.http_req_duration.p99.toFixed(2)}ms

### Fehlerraten
- Fehlerrate: ${(data.metrics.failed_requests.rate * 100).toFixed(2)}%
- Erfolgreiche Requests: ${data.metrics.successful_requests.count}
- Fehlgeschlagene Requests: ${data.metrics.failed_requests.count}

### Durchsatz
- Requests/Sekunde: ${(data.metrics.iterations.count / (data.state.testRunDuration / 1000)).toFixed(2)}
- Datenübertragung: ${(data.metrics.data_received.count / 1024 / 1024).toFixed(2)} MB

## Detaillierte Ergebnisse

### Auth-Service
- Login-Erfolgsrate: ${(data.metrics.successful_logins.rate * 100).toFixed(2)}%
- Token-Validierungszeit: ${data.metrics.token_validation_time.avg.toFixed(2)}ms

### API-Gateway
- Durchschnittliche Latenz: ${data.metrics.api_latency.avg.toFixed(2)}ms
- Rate-Limiting-Ereignisse: ${data.metrics.rate_limit_hits.count}

### Excel-Export
- Export-Jobverarbeitung: ${data.metrics.export_processing_time.avg.toFixed(2)}ms
- Parallele Jobs max: ${data.metrics.concurrent_exports.max}

## Empfehlungen

1. [ ] API-Gateway Caching optimieren
2. [ ] Auth-Service Connection Pooling anpassen
3. [ ] Excel-Export Worker-Pool vergrößern
4. [ ] Rate-Limiting-Schwellen überprüfen
5. [ ] Connection Timeouts anpassen

## Nächste Schritte

1. Ressourcenlimits basierend auf Lasttest anpassen
2. Monitoring-Alerts für identifizierte Schwellwerte einrichten
3. Automatische Skalierung konfigurieren
4. Backup-Strategie unter Last validieren

## Schwellwertüberschreitungen

${data.thresholds_exceeded ? '⚠️ Einige Schwellwerte wurden überschritten!' : '✅ Alle Schwellwerte eingehalten'}
`;
} 