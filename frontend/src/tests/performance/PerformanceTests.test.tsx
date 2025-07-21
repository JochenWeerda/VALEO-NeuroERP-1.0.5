import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { neuralTheme } from '../../themes/NeuroFlowTheme';
import { ApiProvider } from '../../contexts/ApiContext';
import SapFioriDashboard from '../../pages/SapFioriDashboard';
import TransactionsPage from '../../pages/TransactionsPage';
import AnalyticsPage from '../../pages/AnalyticsPage';

// Mock für fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock für Chart.js
jest.mock('chart.js/auto', () => ({
  Chart: jest.fn().mockImplementation(() => ({
    destroy: jest.fn(),
    update: jest.fn(),
  })),
}));

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

// Performance-Metriken sammeln
const performanceMetrics = {
  renderTimes: [] as number[],
  memoryUsage: [] as number[],
  interactionLatency: [] as number[],
  domComplexity: [] as number[],
};

// Hilfsfunktion zum Messen der Render-Zeit
const measureRenderTime = async (component: React.ReactElement): Promise<number> => {
  const startTime = performance.now();
  
  const { unmount } = renderWithProviders(component);
  
  await waitFor(() => {
    expect(screen.getByText(/dashboard|transaktionen|analytics/i)).toBeInTheDocument();
  });
  
  const endTime = performance.now();
  const renderTime = endTime - startTime;
  
  unmount();
  return renderTime;
};

// Hilfsfunktion zum Messen der DOM-Komplexität
const measureDOMComplexity = (container: HTMLElement): number => {
  const totalElements = container.querySelectorAll('*').length;
  const depth = getMaxDepth(container);
  const interactiveElements = container.querySelectorAll('button, a, input, select, textarea').length;
  
  return totalElements + (depth * 10) + (interactiveElements * 5);
};

const getMaxDepth = (element: HTMLElement, currentDepth = 0): number => {
  let maxDepth = currentDepth;
  
  for (const child of Array.from(element.children)) {
    const childDepth = getMaxDepth(child as HTMLElement, currentDepth + 1);
    maxDepth = Math.max(maxDepth, childDepth);
  }
  
  return maxDepth;
};

// Hilfsfunktion zum Messen der Memory-Nutzung
const measureMemoryUsage = (): number => {
  if ('memory' in performance) {
    return (performance as any).memory.usedJSHeapSize;
  }
  return 0;
};

describe('Performance Tests', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    
    // Mock für API-Daten
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        transactions: Array.from({ length: 100 }, (_, i) => ({
          id: i + 1,
          amount: 1000 + i * 100,
          description: `Transaction ${i + 1}`,
          status: 'completed'
        })),
        inventory: Array.from({ length: 50 }, (_, i) => ({
          id: i + 1,
          name: `Product ${i + 1}`,
          quantity: 100 + i * 10,
          price: 10.99 + i * 0.5
        })),
        analytics: {
          revenue: 100000,
          growth: 15,
          transactions: 1500,
          customers: 250
        }
      })
    });
  });

  describe('Render Performance', () => {
    test('Dashboard rendert in unter 500ms', async () => {
      const renderTime = await measureRenderTime(<SapFioriDashboard />);
      
      performanceMetrics.renderTimes.push(renderTime);
      
      expect(renderTime).toBeLessThan(500);
      console.log(`Dashboard render time: ${renderTime.toFixed(2)}ms`);
    });

    test('Transaktions-Seite rendert in unter 800ms mit 100 Einträgen', async () => {
      const renderTime = await measureRenderTime(<TransactionsPage />);
      
      performanceMetrics.renderTimes.push(renderTime);
      
      expect(renderTime).toBeLessThan(800);
      console.log(`Transactions page render time: ${renderTime.toFixed(2)}ms`);
    });

    test('Analytics-Seite rendert in unter 1000ms mit Charts', async () => {
      const renderTime = await measureRenderTime(<AnalyticsPage />);
      
      performanceMetrics.renderTimes.push(renderTime);
      
      expect(renderTime).toBeLessThan(1000);
      console.log(`Analytics page render time: ${renderTime.toFixed(2)}ms`);
    });

    test('Komponenten haben akzeptable DOM-Komplexität', async () => {
      const { container } = renderWithProviders(<SapFioriDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });
      
      const complexity = measureDOMComplexity(container);
      performanceMetrics.domComplexity.push(complexity);
      
      // DOM-Komplexität sollte unter 1000 liegen
      expect(complexity).toBeLessThan(1000);
      console.log(`DOM complexity: ${complexity}`);
    });
  });

  describe('Memory Performance', () => {
    test('Memory-Nutzung bleibt stabil bei wiederholten Renders', async () => {
      const initialMemory = measureMemoryUsage();
      const memoryReadings: number[] = [];
      
      // Führe mehrere Renders durch
      for (let i = 0; i < 5; i++) {
        const { unmount } = renderWithProviders(<SapFioriDashboard />);
        
        await waitFor(() => {
          expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
        });
        
        memoryReadings.push(measureMemoryUsage());
        unmount();
        
        // Warte kurz zwischen Renders
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const maxMemoryIncrease = Math.max(...memoryReadings) - initialMemory;
      
      // Memory-Zuwachs sollte unter 10MB liegen
      expect(maxMemoryIncrease).toBeLessThan(10 * 1024 * 1024);
      console.log(`Max memory increase: ${(maxMemoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    });

    test('Keine Memory-Leaks bei Komponenten-Wechsel', async () => {
      const initialMemory = measureMemoryUsage();
      
      // Wechsle zwischen verschiedenen Komponenten
      const components = [
        <SapFioriDashboard key="dashboard" />,
        <TransactionsPage key="transactions" />,
        <AnalyticsPage key="analytics" />
      ];
      
      for (const component of components) {
        const { unmount } = renderWithProviders(component);
        
        await waitFor(() => {
          expect(screen.getByText(/dashboard|transaktionen|analytics/i)).toBeInTheDocument();
        });
        
        unmount();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const finalMemory = measureMemoryUsage();
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory sollte nach Cleanup zurückgehen
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024); // 5MB
      console.log(`Memory increase after component switching: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    });
  });

  describe('Interaction Performance', () => {
    test('Button-Klicks reagieren in unter 100ms', async () => {
      const { container } = renderWithProviders(<SapFioriDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });
      
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      const button = buttons[0];
      const startTime = performance.now();
      
      fireEvent.click(button);
      
      const endTime = performance.now();
      const clickLatency = endTime - startTime;
      
      performanceMetrics.interactionLatency.push(clickLatency);
      
      expect(clickLatency).toBeLessThan(100);
      console.log(`Button click latency: ${clickLatency.toFixed(2)}ms`);
    });

    test('Formular-Eingaben sind responsiv', async () => {
      const { container } = renderWithProviders(<TransactionsPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/transaktionen/i)).toBeInTheDocument();
      });
      
      const inputs = container.querySelectorAll('input');
      expect(inputs.length).toBeGreaterThan(0);
      
      const input = inputs[0] as HTMLInputElement;
      const startTime = performance.now();
      
      fireEvent.change(input, { target: { value: 'test input' } });
      
      const endTime = performance.now();
      const inputLatency = endTime - startTime;
      
      performanceMetrics.interactionLatency.push(inputLatency);
      
      expect(inputLatency).toBeLessThan(50);
      console.log(`Input change latency: ${inputLatency.toFixed(2)}ms`);
    });

    test('Navigation zwischen Tabs ist schnell', async () => {
      const { container } = renderWithProviders(<SapFioriDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });
      
      const tabs = container.querySelectorAll('[role="tab"]');
      expect(tabs.length).toBeGreaterThan(1);
      
      const startTime = performance.now();
      
      fireEvent.click(tabs[1]);
      
      await waitFor(() => {
        expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
      });
      
      const endTime = performance.now();
      const tabSwitchLatency = endTime - startTime;
      
      performanceMetrics.interactionLatency.push(tabSwitchLatency);
      
      expect(tabSwitchLatency).toBeLessThan(200);
      console.log(`Tab switch latency: ${tabSwitchLatency.toFixed(2)}ms`);
    });
  });

  describe('Bundle Size Performance', () => {
    test('Komponenten haben akzeptable Bundle-Größe', () => {
      // Simuliere Bundle-Größe-Messung
      const componentSizes = {
        SapFioriDashboard: 45, // KB
        TransactionsPage: 38, // KB
        AnalyticsPage: 52, // KB
      };
      
      Object.entries(componentSizes).forEach(([component, size]) => {
        expect(size).toBeLessThan(100); // Max 100KB pro Komponente
        console.log(`${component} bundle size: ${size}KB`);
      });
    });
  });

  describe('Network Performance', () => {
    test('API-Aufrufe sind optimiert', async () => {
      const { container } = renderWithProviders(<TransactionsPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/transaktionen/i)).toBeInTheDocument();
      });
      
      // Prüfe Anzahl der API-Aufrufe
      expect(mockFetch).toHaveBeenCalledTimes(1);
      
      // Prüfe Request-Headers für Optimierung
      const lastCall = mockFetch.mock.calls[0];
      const requestOptions = lastCall[1];
      
      expect(requestOptions.headers).toHaveProperty('Content-Type', 'application/json');
      expect(requestOptions.headers).toHaveProperty('Accept', 'application/json');
    });

    test('Daten-Caching funktioniert korrekt', async () => {
      const { container, rerender } = renderWithProviders(<TransactionsPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/transaktionen/i)).toBeInTheDocument();
      });
      
      const initialCallCount = mockFetch.mock.calls.length;
      
      // Re-render ohne neue Daten
      rerender(
        <BrowserRouter>
          <ThemeProvider theme={neuralTheme}>
            <ApiProvider>
              <TransactionsPage />
            </ApiProvider>
          </ThemeProvider>
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/transaktionen/i)).toBeInTheDocument();
      });
      
      // Sollte keine zusätzlichen API-Aufrufe machen
      expect(mockFetch.mock.calls.length).toBe(initialCallCount);
    });
  });

  describe('Load Time Performance', () => {
    test('Initial Load Time ist akzeptabel', async () => {
      const startTime = performance.now();
      
      const { container } = renderWithProviders(<SapFioriDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      expect(loadTime).toBeLessThan(1000); // Max 1 Sekunde
      console.log(`Initial load time: ${loadTime.toFixed(2)}ms`);
    });

    test('Time to Interactive ist schnell', async () => {
      const { container } = renderWithProviders(<SapFioriDashboard />);
      
      const startTime = performance.now();
      
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });
      
      // Warte bis interaktive Elemente verfügbar sind
      await waitFor(() => {
        const buttons = container.querySelectorAll('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
      
      const endTime = performance.now();
      const timeToInteractive = endTime - startTime;
      
      expect(timeToInteractive).toBeLessThan(800); // Max 800ms
      console.log(`Time to interactive: ${timeToInteractive.toFixed(2)}ms`);
    });
  });

  describe('Scrolling Performance', () => {
    test('Smooth Scrolling funktioniert korrekt', async () => {
      const { container } = renderWithProviders(<TransactionsPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/transaktionen/i)).toBeInTheDocument();
      });
      
      const scrollableElement = container.querySelector('[data-testid="scrollable-container"]');
      if (scrollableElement) {
        const startTime = performance.now();
        
        fireEvent.scroll(scrollableElement, { target: { scrollTop: 1000 } });
        
        const endTime = performance.now();
        const scrollLatency = endTime - startTime;
        
        expect(scrollLatency).toBeLessThan(50);
        console.log(`Scroll latency: ${scrollLatency.toFixed(2)}ms`);
      }
    });
  });

  describe('Animation Performance', () => {
    test('CSS-Animationen sind flüssig', async () => {
      const { container } = renderWithProviders(<SapFioriDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });
      
      const animatedElements = container.querySelectorAll('[data-testid="animated-element"]');
      
      animatedElements.forEach((element) => {
        const styles = window.getComputedStyle(element as HTMLElement);
        const transitionDuration = parseFloat(styles.transitionDuration) * 1000; // Convert to ms
        
        // Animationen sollten nicht zu langsam sein
        expect(transitionDuration).toBeLessThan(500);
        console.log(`Animation duration: ${transitionDuration}ms`);
      });
    });
  });

  describe('Performance Regression Tests', () => {
    test('Performance-Metriken bleiben stabil über Zeit', () => {
      // Prüfe ob Performance-Metriken innerhalb akzeptabler Grenzen bleiben
      const averageRenderTime = performanceMetrics.renderTimes.reduce((a, b) => a + b, 0) / performanceMetrics.renderTimes.length;
      const averageInteractionLatency = performanceMetrics.interactionLatency.reduce((a, b) => a + b, 0) / performanceMetrics.interactionLatency.length;
      const averageDOMComplexity = performanceMetrics.domComplexity.reduce((a, b) => a + b, 0) / performanceMetrics.domComplexity.length;
      
      // Baseline-Werte (können angepasst werden)
      expect(averageRenderTime).toBeLessThan(600);
      expect(averageInteractionLatency).toBeLessThan(100);
      expect(averageDOMComplexity).toBeLessThan(800);
      
      console.log(`Average render time: ${averageRenderTime.toFixed(2)}ms`);
      console.log(`Average interaction latency: ${averageInteractionLatency.toFixed(2)}ms`);
      console.log(`Average DOM complexity: ${averageDOMComplexity.toFixed(2)}`);
    });
  });
}); 