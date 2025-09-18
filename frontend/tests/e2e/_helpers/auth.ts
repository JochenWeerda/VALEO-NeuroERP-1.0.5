import { Page, expect } from '@playwright/test';

export async function login(page: Page, email: string, password: string) {
  const useRealApi = (process.env.PW_REAL_API || '').toLowerCase() === '1' || (process.env.PW_REAL_API || '').toLowerCase() === 'true';
  const PW_API_URL = process.env.PW_API_URL || 'http://localhost:8000';
  const PW_API_BASE = process.env.PW_API_BASE || 'http://localhost:8000/api';
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  } as const;

  // Globale CORS-Preflight-Handler nur im Mock-Modus
  if (!useRealApi) {
    await page.route('**/api/**', async (route) => {
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({ status: 204, headers: { ...corsHeaders } });
        return;
      }
      await route.fallback();
    });
  }
  // Debug-Listener: Konsole, Page-Fehler, Netzwerkfehler
  page.on('console', msg => {
    // Nur relevante Typen loggen; Quagga-Meldungen unterdrücken
    const type = msg.type();
    const text = msg.text() || '';
    if (/quagga/i.test(text)) return;
    if (type === 'error' || type === 'warning') {
      console.log(`[console:${type}] ${text}`);
    }
  });
  page.on('pageerror', err => {
    console.log(`[pageerror] ${err?.message || err}`);
  });
  page.on('requestfailed', req => {
    console.log(`[requestfailed] ${req.method()} ${req.url()} -> ${req.failure()?.errorText}`);
  });

  // Globales Fetch-Mocking (umgeht CORS) nur im Mock-Modus
  if (!useRealApi) {
    await page.addInitScript(() => {
      const originalFetch = window.fetch.bind(window);
      const makeJsonResponse = (data: any, extraHeaders?: Record<string, string>) => {
        const body = JSON.stringify(data);
        const headers = new Headers({
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          ...(extraHeaders || {})
        });
        return new Response(body, { status: 200, headers });
      };
      window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : (input as Request).url;
        if (typeof url === 'string' && url.includes('/api/')) {
          // Spezifische Endpunkte
          if (url.includes('/api/settings')) {
            return Promise.resolve(makeJsonResponse({ data: { firstRunCompleted: true, version: '2.0.0', environment: 'e2e' } }));
          }
          if (url.includes('/api/agents/progress')) {
            return Promise.resolve(makeJsonResponse({
              total_percent: 80,
              items: [
                { name: 'E2E-Agent', percent: 90, status: 'running' },
                { name: 'Workflow-Agent', percent: 70, status: 'running' }
              ],
              timestamp: new Date().toISOString()
            }));
          }
          if (url.includes('/api/voice/status')) {
            return Promise.resolve(makeJsonResponse({ online: false, message: 'Voice service stub (e2e)', timestamp: new Date().toISOString() }));
          }
          if (url.includes('/api/ai/barcode/health')) {
            return Promise.resolve(makeJsonResponse({ ok: true, service: 'barcode', status: 'mock' }));
          }
          // Generischer Fallback für alle /api/*
          return Promise.resolve(makeJsonResponse({ ok: true }));
        }
        return originalFetch(input as any, init);
      };
    });
  }

  // Quagga-Stub: falls im Browser nicht vorhanden, bereitstellen
  await page.addInitScript(() => {
    // @ts-ignore
    if (!(window as any).Quagga) {
      // @ts-ignore
      (window as any).Quagga = {
        init: (_cfg: any, cb?: (err?: any) => void) => { cb && cb(); },
        start: () => {},
        stop: () => {},
        onDetected: (_h: any) => {},
        offDetected: (_h: any) => {},
        detach: () => {},
      };
    }
  });

  // API-Basis und Token setzen
  if (useRealApi) {
    // Frontend-API-Basis für echte Requests
    await page.addInitScript((apiBase: string) => {
      // @ts-ignore
      (window as any).__VALEO_API_BASE__ = apiBase;
    }, PW_API_BASE);

    // Test-User registrieren (idempotent) und Token holen
    try {
      await page.request.post(`${PW_API_URL}/api/v1/auth/register`, {
        data: { username: email, email, full_name: 'Test User', password, role: 'admin' }
      });
    } catch {}
    try {
      const resp = await page.request.post(`${PW_API_URL}/token`, {
        form: { username: email, password }
      });
      const data = await resp.json();
      const accessToken = (data as any)?.access_token || '';
      await page.addInitScript(([tokenKey, token]) => {
        window.localStorage.setItem(tokenKey, token);
      }, ['valeo_access_token', accessToken]);
    } catch (e) {
      console.log(`[login] Real-API Token fehlgeschlagen: ${String(e)}`);
    }
  } else {
    await page.addInitScript(([tokenKey, token]) => {
      window.localStorage.setItem(tokenKey, token);
    }, ['valeo_access_token', 'test-token']);
  }

  // API-Mocks für Auth nur im Mock-Modus
  if (!useRealApi) {
    await page.route('**/token', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'test-token',
          token_type: 'bearer',
          user: {
            id: '1',
            username: email,
            email,
            full_name: 'Test User',
            role: 'admin'
          }
        })
      });
    });
    await page.route('**/users/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { ...corsHeaders },
        body: JSON.stringify({
          id: '1',
          username: email,
          email,
          full_name: 'Test User',
          role: 'admin',
          disabled: false
        })
      });
    });
  }

  if (!useRealApi) {
    // Weitere API-Mocks zur Vermeidung von CORS/Backend-Abhängigkeiten
    await page.route('**/api/settings', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { ...corsHeaders },
        body: JSON.stringify({
          data: { firstRunCompleted: true, version: '2.0.0', environment: 'e2e' }
        })
      });
    });

    await page.route('**/api/agents/progress', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { ...corsHeaders },
        body: JSON.stringify({
          total_percent: 75,
          items: [
            { name: 'E2E-Agent', percent: 80, status: 'running' },
            { name: 'Workflow-Agent', percent: 70, status: 'running' }
          ],
          timestamp: new Date().toISOString()
        })
      });
    });

    await page.route('**/api/voice/status', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { ...corsHeaders },
        body: JSON.stringify({ online: false, message: 'Voice service stub (e2e)', timestamp: new Date().toISOString() })
      });
    });

    // Zusätzliche Health-Mocks
    await page.route('**/api/ai/barcode/health', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { ...corsHeaders },
        body: JSON.stringify({ ok: true, service: 'barcode', status: 'mock' })
      });
    });

    // Letzter Fallback: alle übrigen /api/** Calls erfolgreich mit Minimal-JSON beantworten
    await page.route('**/api/**', async route => {
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({ status: 204, headers: { ...corsHeaders } });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { ...corsHeaders },
        body: JSON.stringify({ ok: true })
      });
    });
  }

  // Navigiere und warte robust: ggf. Login-Formular bedienen
  await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
  await Promise.race([
    page.getByTestId('dashboard-root').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {}),
    page.getByTestId('app-shell').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {}),
    page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
  ]);

  if (page.url().includes('/login')) {
    // Fülle Login nur wenn sichtbar
    const userField = page.getByLabel(/benutzername|user(name)?/i);
    const passField = page.getByLabel(/passwort|password/i);
    if (await userField.count()) {
      await userField.fill(email);
      await passField.fill(password);
      await page.getByRole('button', { name: /anmelden/i }).click();
    }
  }

  // Warte auf sichtbare App-Hülle oder erstes Child in #root (sequentiell, strikt)
  const tryVisible = async () => {
    const dashboard = page.getByTestId('dashboard-root');
    if (await dashboard.count()) {
      await expect(dashboard).toBeVisible({ timeout: 30000 });
      return;
    }
    const appShell = page.getByTestId('app-shell');
    if (await appShell.count()) {
      await expect(appShell).toBeVisible({ timeout: 30000 });
      return;
    }
    const firstChild = page.locator('#root').locator(':scope > *').first();
    await expect(firstChild).toBeVisible({ timeout: 30000 });
  };

  try {
    await tryVisible();
  } catch {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    await tryVisible();
  }
}


