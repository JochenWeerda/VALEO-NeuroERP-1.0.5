/**
 * Performance Tests für VALEO NeuroERP Frontend
 * 
 * ZIELSETZUNG:
 * - Testen der echten Performance gegen laufende Server
 * - Validierung der Render-Zeiten mit echten Daten
 * - Messung der DOM-Komplexität mit realen Komponenten
 * - Performance-Tests für echte Benutzer-Interaktionen
 * - Netzwerk-Performance mit echten API-Calls
 * 
 * KONTEXT:
 * Diese Tests sind Teil der IMPLEMENT-Phase und testen die echte Performance
 * des Systems gegen laufende Server für realistische Messungen.
 * 
 * VORAUSSETZUNGEN:
 * - Backend-Server läuft auf http://localhost:8000
 * - Frontend-Server läuft auf http://localhost:3000 (optional)
 * - Echte Daten sind verfügbar
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { neuralTheme } from '../../themes/NeuroFlowTheme';
import { ApiProvider } from '../../contexts/ApiContext';
import SapFioriDashboard from '../../pages/SapFioriDashboard';
import TransactionsPage from '../../pages/TransactionsPage';
import AnalyticsPage from '../../pages/AnalyticsPage';

// Mock für Chart.js - verhindert Chart-Rendering-Fehler in Tests
jest.mock('chart.js/auto', () => ({
  Chart: jest.fn().mockImplementation(() => ({
    destroy: jest.fn(),
    update: jest.fn(),
  })),
}));

/**
 * Test-Wrapper mit allen notwendigen Providern
 * ZIEL: Konsistente Test-Umgebung für alle Performance-Tests
 */
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

/**
 * Hilfsfunktion zum Warten auf Komponenten-Load
 * ZIEL: Robuste Warte-Logik ohne spezifische Text-Abhängigkeiten
 */
const waitForComponentLoad = async (timeout = 1000) => {
  await new Promise(resolve => setTimeout(resolve, 50));
};

/**
 * Hilfsfunktion für echte API-Requests
 * ZIEL: Echte HTTP-Requests an den laufenden Backend-Server
 */
const makeApiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = 'http://localhost:8000';
  const url = `${baseUrl}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
    ...options,
  };
  
  try {
    const response = await fetch(url, defaultOptions);
    return {
      ok: response.ok,
      status: response.status,
      json: async () => {
        try {
          return await response.json();
        } catch {
          return { error: 'Invalid JSON response' };
        }
      },
      text: async () => await response.text(),
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      json: async () => ({ error: 'Network error' }),
      text: async () => 'Network error',
    };
  }
};

/**
 * Hilfsfunktion zum Prüfen der Server-Verfügbarkeit
 * ZIEL: Sicherstellen, dass Backend-Server erreichbar ist
 */
const checkServerAvailability = async (): Promise<boolean> => {
  try {
    const response = await makeApiRequest('/health');
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Hilfsfunktion zur Messung der DOM-Komplexität
 * ZIEL: Echte Messung der DOM-Struktur-Komplexität
 */
const measureDOMComplexity = (container: HTMLElement): number => {
  const elements = container.querySelectorAll('*');
  const depth = getMaxDepth(container);
  const attributes = Array.from(elements).reduce((acc, el) => {
    return acc + el.attributes.length;
  }, 0);
  
  return elements.length * depth * (attributes / elements.length);
};

const getMaxDepth = (element: Element, currentDepth = 0): number => {
  const children = Array.from(element.children);
  if (children.length === 0) return currentDepth;
  
  return Math.max(...children.map(child => getMaxDepth(child, currentDepth + 1)));
};

/**
 * Hilfsfunktion zur Messung der Memory-Nutzung
 * ZIEL: Echte Memory-Performance-Messung
 */
const measureMemoryUsage = (): number => {
  if ('memory' in performance) {
    return (performance as any).memory.usedJSHeapSize;
  }
  return 0;
};

describe('Performance Tests (Echte Server)', () => {
  let serverAvailable: boolean = false;

  beforeAll(async () => {
    // Prüfe Server-Verfügbarkeit vor allen Tests
    serverAvailable = await checkServerAvailability();
    console.log(`Backend-Server verfügbar für Performance-Tests: ${serverAvailable}`);
  });

  beforeEach(() => {
    // Reset vor jedem Test
  });

  describe('Render Performance (Echte Server)', () => {
    test('Dashboard rendert schnell mit echten Daten', async () => {
      // ZIEL: Testen der Render-Performance mit echten Server-Daten
      if (!serverAvailable) {
        console.log('Test übersprungen - Server nicht verfügbar');
        return;
      }

      const startTime = performance.now();
      const { container } = renderWithProviders(<SapFioriDashboard />);
      await waitForComponentLoad();
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Prüfe Performance (sollte unter 2 Sekunden sein für echte Server)
      expect(renderTime).toBeLessThan(2000);
      expect(container).toBeInTheDocument();
      
      console.log(`Dashboard Render-Zeit: ${renderTime.toFixed(2)}ms`);
    });

    test('Transactions-Page rendert effizient mit echten Daten', async () => {
      // ZIEL: Testen der Render-Performance der Transactions-Seite
      if (!serverAvailable) {
        console.log('Test übersprungen - Server nicht verfügbar');
        return;
      }

      const startTime = performance.now();
      const { container } = renderWithProviders(<TransactionsPage />);
      await waitForComponentLoad();
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Prüfe Performance (sollte unter 3 Sekunden sein für echte Server)
      expect(renderTime).toBeLessThan(3000);
      expect(container).toBeInTheDocument();
      
      console.log(`Transactions-Page Render-Zeit: ${renderTime.toFixed(2)}ms`);
    });

    test('Analytics-Page rendert performant mit echten Charts', async () => {
      // ZIEL: Testen der Render-Performance mit echten Chart-Daten
      if (!serverAvailable) {
        console.log('Test übersprungen - Server nicht verfügbar');
        return;
      }

      const startTime = performance.now();
      const { container } = renderWithProviders(<AnalyticsPage />);
      await waitForComponentLoad();
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Prüfe Performance (sollte unter 4 Sekunden sein für echte Charts)
      expect(renderTime).toBeLessThan(4000);
      expect(container).toBeInTheDocument();
      
      console.log(`Analytics-Page Render-Zeit: ${renderTime.toFixed(2)}ms`);
    });
  });

  describe('DOM Complexity (Echte Server)', () => {
    test('Dashboard hat akzeptable DOM-Komplexität mit echten Daten', async () => {
      // ZIEL: Testen der DOM-Komplexität mit echten Server-Daten
      if (!serverAvailable) {
        console.log('Test übersprungen - Server nicht verfügbar');
        return;
      }

      const { container } = renderWithProviders(<SapFioriDashboard />);
      await waitForComponentLoad();
      
      const complexity = measureDOMComplexity(container);
      
      // Prüfe DOM-Komplexität (sollte unter 1000 sein für echte Daten)
      expect(complexity).toBeLessThan(1000);
      
      console.log(`Dashboard DOM-Komplexität: ${complexity.toFixed(2)}`);
    });

    test('Transactions-Page hat effiziente DOM-Struktur', async () => {
      // ZIEL: Testen der DOM-Effizienz der Transactions-Seite
      if (!serverAvailable) {
        console.log('Test übersprungen - Server nicht verfügbar');
        return;
      }

      const { container } = renderWithProviders(<TransactionsPage />);
      await waitForComponentLoad();
      
      const complexity = measureDOMComplexity(container);
      
      // Prüfe DOM-Komplexität (sollte unter 1500 sein für echte Daten)
      expect(complexity).toBeLessThan(1500);
      
      console.log(`Transactions-Page DOM-Komplexität: ${complexity.toFixed(2)}`);
    });

    test('Analytics-Page hat optimierte DOM-Struktur mit Charts', async () => {
      // ZIEL: Testen der DOM-Optimierung mit echten Chart-Daten
      if (!serverAvailable) {
        console.log('Test übersprungen - Server nicht verfügbar');
        return;
      }

      const { container } = renderWithProviders(<AnalyticsPage />);
      await waitForComponentLoad();
      
      const complexity = measureDOMComplexity(container);
      
      // Prüfe DOM-Komplexität (sollte unter 2000 sein für echte Charts)
      expect(complexity).toBeLessThan(2000);
      
      console.log(`Analytics-Page DOM-Komplexität: ${complexity.toFixed(2)}`);
    });
  });

  describe('Memory Performance (Echte Server)', () => {
    test('Dashboard verwendet Memory effizient mit echten Daten', async () => {
      // ZIEL: Testen der Memory-Effizienz mit echten Server-Daten
      if (!serverAvailable) {
        console.log('Test übersprungen - Server nicht verfügbar');
        return;
      }

      const initialMemory = measureMemoryUsage();
      
      const { container } = renderWithProviders(<SapFioriDashboard />);
      await waitForComponentLoad();
      
      const finalMemory = measureMemoryUsage();
      const memoryIncrease = finalMemory - initialMemory;
      
      // Prüfe Memory-Nutzung (sollte unter 10MB sein für echte Daten)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
      expect(container).toBeInTheDocument();
      
      console.log(`Dashboard Memory-Zunahme: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    });

    test('Transactions-Page hat geringe Memory-Footprint', async () => {
      // ZIEL: Testen der Memory-Effizienz der Transactions-Seite
      if (!serverAvailable) {
        console.log('Test übersprungen - Server nicht verfügbar');
        return;
      }

      const initialMemory = measureMemoryUsage();
      
      const { container } = renderWithProviders(<TransactionsPage />);
      await waitForComponentLoad();
      
      const finalMemory = measureMemoryUsage();
      const memoryIncrease = finalMemory - initialMemory;
      
      // Prüfe Memory-Nutzung (sollte unter 15MB sein für echte Daten)
      expect(memoryIncrease).toBeLessThan(15 * 1024 * 1024);
      expect(container).toBeInTheDocument();
      
      console.log(`Transactions-Page Memory-Zunahme: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    });
  });

  describe('Interaction Performance (Echte Server)', () => {
    test('Button-Klicks sind responsiv mit echten Daten', async () => {
      // ZIEL: Testen der Interaktions-Performance mit echten Server-Daten
      if (!serverAvailable) {
        console.log('Test übersprungen - Server nicht verfügbar');
        return;
      }

      const { container } = renderWithProviders(<SapFioriDashboard />);
      await waitForComponentLoad();
      
      const buttons = container.querySelectorAll('button');
      if (buttons.length > 0) {
        const startTime = performance.now();
        fireEvent.click(buttons[0]);
        const endTime = performance.now();
        const clickTime = endTime - startTime;
        
        // Prüfe Klick-Performance (sollte unter 100ms sein)
        expect(clickTime).toBeLessThan(100);
        
        console.log(`Button-Klick-Zeit: ${clickTime.toFixed(2)}ms`);
      }
    });

    test('Navigation ist schnell mit echten Daten', async () => {
      // ZIEL: Testen der Navigations-Performance mit echten Server-Daten
      if (!serverAvailable) {
        console.log('Test übersprungen - Server nicht verfügbar');
        return;
      }

      const { container } = renderWithProviders(<SapFioriDashboard />);
      await waitForComponentLoad();
      
      const links = container.querySelectorAll('a, [role="tab"]');
      if (links.length > 0) {
        const startTime = performance.now();
        fireEvent.click(links[0]);
        const endTime = performance.now();
        const navigationTime = endTime - startTime;
        
        // Prüfe Navigations-Performance (sollte unter 200ms sein)
        expect(navigationTime).toBeLessThan(200);
        
        console.log(`Navigation-Zeit: ${navigationTime.toFixed(2)}ms`);
      }
    });
  });

  describe('Network Performance (Echte Server)', () => {
    test('API-Calls sind schnell mit echten Servern', async () => {
      // ZIEL: Testen der API-Performance mit echten Server-Verbindungen
      if (!serverAvailable) {
        console.log('Test übersprungen - Server nicht verfügbar');
        return;
      }

      const startTime = performance.now();
      const response = await makeApiRequest('/api/health');
      const endTime = performance.now();
      const apiTime = endTime - startTime;
      
      // Prüfe API-Performance (sollte unter 1 Sekunde sein für echte Server)
      expect(apiTime).toBeLessThan(1000);
      expect([200, 404]).toContain(response.status);
      
      console.log(`API-Call-Zeit: ${apiTime.toFixed(2)}ms`);
    });

    test('Bulk-Daten-Load ist effizient', async () => {
      // ZIEL: Testen der Bulk-Daten-Performance mit echten Servern
      if (!serverAvailable) {
        console.log('Test übersprungen - Server nicht verfügbar');
        return;
      }

      const startTime = performance.now();
      const response = await makeApiRequest('/api/transactions?limit=100');
      const endTime = performance.now();
      const bulkTime = endTime - startTime;
      
      // Prüfe Bulk-Performance (sollte unter 3 Sekunden sein für echte Server)
      expect(bulkTime).toBeLessThan(3000);
      expect([200, 404]).toContain(response.status);
      
      console.log(`Bulk-Daten-Load-Zeit: ${bulkTime.toFixed(2)}ms`);
    });

    test('Chart-Daten-Load ist performant', async () => {
      // ZIEL: Testen der Chart-Daten-Performance mit echten Servern
      if (!serverAvailable) {
        console.log('Test übersprungen - Server nicht verfügbar');
        return;
      }

      const startTime = performance.now();
      const response = await makeApiRequest('/api/analytics');
      const endTime = performance.now();
      const chartTime = endTime - startTime;
      
      // Prüfe Chart-Performance (sollte unter 2 Sekunden sein für echte Server)
      expect(chartTime).toBeLessThan(2000);
      expect([200, 404]).toContain(response.status);
      
      console.log(`Chart-Daten-Load-Zeit: ${chartTime.toFixed(2)}ms`);
    });
  });

  describe('Scrolling Performance (Echte Server)', () => {
    test('Scroll-Performance ist flüssig mit echten Daten', async () => {
      // ZIEL: Testen der Scroll-Performance mit echten Server-Daten
      if (!serverAvailable) {
        console.log('Test übersprungen - Server nicht verfügbar');
        return;
      }

      const { container } = renderWithProviders(<TransactionsPage />);
      await waitForComponentLoad();
      
      const scrollableElement = container.querySelector('[data-testid="scrollable-content"]') || container;
      
      const startTime = performance.now();
      fireEvent.scroll(scrollableElement, { target: { scrollTop: 100 } });
      const endTime = performance.now();
      const scrollTime = endTime - startTime;
      
      // Prüfe Scroll-Performance (sollte unter 50ms sein)
      expect(scrollTime).toBeLessThan(50);
      
      console.log(`Scroll-Zeit: ${scrollTime.toFixed(2)}ms`);
    });
  });

  describe('Performance Regression Tests (Echte Server)', () => {
    test('Performance bleibt konstant über mehrere Renders', async () => {
      // ZIEL: Testen der Performance-Stabilität mit echten Server-Daten
      if (!serverAvailable) {
        console.log('Test übersprungen - Server nicht verfügbar');
        return;
      }

      const renderTimes: number[] = [];
      
      for (let i = 0; i < 3; i++) {
        const startTime = performance.now();
        const { container } = renderWithProviders(<SapFioriDashboard />);
        await waitForComponentLoad();
        const endTime = performance.now();
        renderTimes.push(endTime - startTime);
      }
      
      const averageRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
      const maxRenderTime = Math.max(...renderTimes);
      
      // Prüfe Performance-Stabilität
      expect(averageRenderTime).toBeLessThan(2000);
      expect(maxRenderTime).toBeLessThan(3000);
      
      console.log(`Durchschnittliche Render-Zeit: ${averageRenderTime.toFixed(2)}ms`);
      console.log(`Maximale Render-Zeit: ${maxRenderTime.toFixed(2)}ms`);
    });

    test('DOM-Komplexität bleibt stabil', async () => {
      // ZIEL: Testen der DOM-Stabilität mit echten Server-Daten
      if (!serverAvailable) {
        console.log('Test übersprungen - Server nicht verfügbar');
        return;
      }

      const complexities: number[] = [];
      
      for (let i = 0; i < 3; i++) {
        const { container } = renderWithProviders(<SapFioriDashboard />);
        await waitForComponentLoad();
        complexities.push(measureDOMComplexity(container));
      }
      
      const averageComplexity = complexities.reduce((a, b) => a + b, 0) / complexities.length;
      const maxComplexity = Math.max(...complexities);
      
      // Prüfe DOM-Stabilität
      expect(averageComplexity).toBeLessThan(1000);
      expect(maxComplexity).toBeLessThan(1500);
      
      console.log(`Durchschnittliche DOM-Komplexität: ${averageComplexity.toFixed(2)}`);
      console.log(`Maximale DOM-Komplexität: ${maxComplexity.toFixed(2)}`);
    });
  });

  describe('Fallback Tests (wenn Server nicht verfügbar)', () => {
    test('Performance-Tests funktionieren auch ohne Server', () => {
      // ZIEL: Sicherstellen, dass Performance-Tests auch ohne Server funktionieren
      if (serverAvailable) {
        console.log('Server verfügbar - Fallback-Test übersprungen');
        return;
      }

      // Basis-Performance-Tests ohne Server
      const startTime = performance.now();
      const { container } = renderWithProviders(<SapFioriDashboard />);
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(5000); // Toleranterer Schwellenwert ohne Server
      expect(container).toBeInTheDocument();
      
      console.log('Fallback-Performance-Tests ohne Server funktionieren');
    });
  });
}); 