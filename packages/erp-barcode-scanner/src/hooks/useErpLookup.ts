import { useCallback } from 'react';
import type { ErpItem } from '../types';

export class TimeoutError extends Error { constructor(message: string) { super(message); this.name = 'TimeoutError'; } }
export class ApiError extends Error { status: number; constructor(status: number, message: string) { super(message); this.name = 'ApiError'; this.status = status; } }
export class NotFoundError extends Error { constructor(message: string) { super(message); this.name = 'NotFoundError'; } }

export interface UseErpLookupOptions {
  baseUrl: string;
  token?: string;
  timeoutMs?: number;
  retries?: number;
}

const DEFAULT_TIMEOUT = 5000;
const DEFAULT_RETRIES = 2;

const MOCK_DB: Record<string, ErpItem> = {
  '4006381333931': { id: '1', sku: 'EAN-4006381333931', name: 'Stabilo Bleistift HB', uom: 'pcs', price: 0.89, stock: 120 },
  '5901234123457': { id: '2', sku: 'EAN-5901234123457', name: 'Wasserflasche 1.5L', uom: 'btl', price: 0.49, stock: 540 },
  'CODE128-ABC123': { id: '3', sku: 'ABC123', name: 'Musterartikel CODE128', uom: 'pcs', price: 12.49, stock: 34 },
};

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new TimeoutError(`Lookup timeout nach ${timeoutMs}ms`)), timeoutMs);
    promise.then(
      (res) => { clearTimeout(id); resolve(res); },
      (err) => { clearTimeout(id); reject(err); }
    );
  });
}

async function fetchWithAuth(url: string, token?: string, signal?: AbortSignal): Promise<Response> {
  const headers: Record<string, string> = { 'Accept': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(url, { headers, signal });
}

export function useErpLookup(opts: UseErpLookupOptions) {
  const { baseUrl, token, timeoutMs = DEFAULT_TIMEOUT, retries = DEFAULT_RETRIES } = opts;

  const lookupBarcode = useCallback(async (code: string): Promise<ErpItem | null> => {
    // Mock-Modus, wenn baseUrl explizit 'mock' ist
    if (baseUrl === 'mock') {
      return MOCK_DB[code] ?? null;
    }

    let attempt = 0;
    let lastError: unknown = null;
    while (attempt <= retries) {
      attempt += 1;
      try {
        const controller = new AbortController();
        const p = (async () => {
          const url = `${baseUrl.replace(/\/$/, '')}/api/erp/items/by-barcode/${encodeURIComponent(code)}`;
          const resp = await fetchWithAuth(url, token, controller.signal);
          if (!resp.ok) {
            if (resp.status === 404) throw new NotFoundError('Artikel nicht gefunden');
            throw new ApiError(resp.status, `HTTP ${resp.status}`);
          }
          const data = await resp.json();
          // Erwartete Form: { item: ErpItem | null }
          const item = (data && (data.item as ErpItem | null)) ?? null;
          return item;
        })();
        const res = await withTimeout(p, timeoutMs);
        return res;
      } catch (err) {
        lastError = err;
        if (err instanceof NotFoundError) return null;
        if (attempt > retries) throw err;
        await new Promise(r => setTimeout(r, 150 * attempt));
      }
    }
    // Falls wir hier landen, werfe den letzten Fehler
    throw lastError instanceof Error ? lastError : new Error('Unbekannter Fehler bei Lookup');
  }, [baseUrl, token, timeoutMs, retries]);

  return { lookupBarcode } as const;
}
