import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { neuralTheme } from '../../themes/NeuroFlowTheme';
import { ApiProvider } from '../../contexts/ApiContext';
import SapFioriDashboard from '../../pages/SapFioriDashboard';
import AnalyticsPage from '../../pages/AnalyticsPage';
import TrustAwareDashboard from '../../pages/TrustAwareDashboard';

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

// Hilfsfunktion zum Extrahieren von CSS-Styles
const getComputedStyles = (element: HTMLElement) => {
  const styles = window.getComputedStyle(element);
  return {
    backgroundColor: styles.backgroundColor,
    color: styles.color,
    fontSize: styles.fontSize,
    fontWeight: styles.fontWeight,
    padding: styles.padding,
    margin: styles.margin,
    border: styles.border,
    borderRadius: styles.borderRadius,
    boxShadow: styles.boxShadow,
    display: styles.display,
    flexDirection: styles.flexDirection,
    justifyContent: styles.justifyContent,
    alignItems: styles.alignItems,
    width: styles.width,
    height: styles.height,
    gridTemplateColumns: styles.gridTemplateColumns,
    outline: styles.outline,
    gap: styles.gap,
  };
};

// Hilfsfunktion zum Vergleichen von Styles
const compareStyles = (actual: any, expected: any, tolerance = 0) => {
  const differences: string[] = [];
  
  Object.keys(expected).forEach(key => {
    if (actual[key] !== expected[key]) {
      differences.push(`${key}: expected "${expected[key]}", got "${actual[key]}"`);
    }
  });
  
  return differences;
};

describe('Visual Regression Tests', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    
    // Mock für Dashboard-Daten
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        transactions: [
          { id: 1, amount: 1000, description: 'Test Transaction', status: 'completed' },
          { id: 2, amount: 2000, description: 'Test Transaction 2', status: 'pending' }
        ],
        inventory: [
          { id: 1, name: 'Test Product', quantity: 100, price: 10.99 },
          { id: 2, name: 'Test Product 2', quantity: 50, price: 25.50 }
        ],
        analytics: {
          revenue: 10000,
          growth: 15,
          transactions: 150,
          customers: 25
        }
      })
    });
  });

  describe('Dashboard Layout Consistency', () => {
    test('Dashboard behält konsistentes Layout bei verschiedenen Datenmengen', async () => {
      const { container } = renderWithProviders(<SapFioriDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Prüfe Layout-Struktur
      const dashboardContainer = container.querySelector('[data-testid="dashboard-container"]');
      expect(dashboardContainer).toBeInTheDocument();

      const styles = getComputedStyles(dashboardContainer as HTMLElement);
      
      // Erwartete Layout-Styles
      const expectedStyles = {
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        backgroundColor: 'rgb(245, 245, 245)',
      };

      const differences = compareStyles(styles, expectedStyles);
      expect(differences).toHaveLength(0);

      // Prüfe Grid-Layout
      const gridContainer = container.querySelector('[data-testid="grid-container"]');
      expect(gridContainer).toBeInTheDocument();

      const gridStyles = getComputedStyles(gridContainer as HTMLElement);
      const expectedGridStyles = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
      };

      const gridDifferences = compareStyles(gridStyles, expectedGridStyles);
      expect(gridDifferences).toHaveLength(0);
    });

    test('Status-Cards haben konsistente Farben und Abstände', async () => {
      const { container } = renderWithProviders(<SapFioriDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/aktive transaktionen/i)).toBeInTheDocument();
      });

      // Prüfe Status-Cards
      const statusCards = container.querySelectorAll('[data-testid="status-card"]');
      expect(statusCards.length).toBeGreaterThan(0);

      statusCards.forEach((card, index) => {
        const styles = getComputedStyles(card as HTMLElement);
        
        // Erwartete Card-Styles
        const expectedCardStyles = {
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          backgroundColor: 'rgb(255, 255, 255)',
        };

        const differences = compareStyles(styles, expectedCardStyles);
        expect(differences).toHaveLength(0);
      });
    });

    test('Navigation behält konsistente Position und Styling', async () => {
      const { container } = renderWithProviders(<SapFioriDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Prüfe Navigation
      const navigation = container.querySelector('[data-testid="navigation"]');
      expect(navigation).toBeInTheDocument();

      const navStyles = getComputedStyles(navigation as HTMLElement);
      const expectedNavStyles = {
        display: 'flex',
        flexDirection: 'column',
        padding: '16px',
        backgroundColor: 'rgb(255, 255, 255)',
        borderRight: '1px solid rgb(224, 224, 224)',
      };

      const differences = compareStyles(navStyles, expectedNavStyles);
      expect(differences).toHaveLength(0);
    });
  });

  describe('Analytics Page Visual Consistency', () => {
    test('Charts haben konsistente Größen und Positionen', async () => {
      const { container } = renderWithProviders(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText(/analytics/i)).toBeInTheDocument();
      });

      // Prüfe Chart-Container
      const chartContainers = container.querySelectorAll('[data-testid="chart-container"]');
      expect(chartContainers.length).toBeGreaterThan(0);

      chartContainers.forEach((chartContainer) => {
        const styles = getComputedStyles(chartContainer as HTMLElement);
        
        const expectedChartStyles = {
          width: '100%',
          height: '400px',
          padding: '16px',
          backgroundColor: 'rgb(255, 255, 255)',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        };

        const differences = compareStyles(styles, expectedChartStyles);
        expect(differences).toHaveLength(0);
      });
    });

    test('Metrik-Karten haben einheitliches Design', async () => {
      const { container } = renderWithProviders(<AnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText(/umsatz/i)).toBeInTheDocument();
      });

      // Prüfe Metrik-Karten
      const metricCards = container.querySelectorAll('[data-testid="metric-card"]');
      expect(metricCards.length).toBeGreaterThan(0);

      metricCards.forEach((card) => {
        const styles = getComputedStyles(card as HTMLElement);
        
        const expectedMetricStyles = {
          padding: '20px',
          borderRadius: '12px',
          backgroundColor: 'rgb(255, 255, 255)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
        };

        const differences = compareStyles(styles, expectedMetricStyles);
        expect(differences).toHaveLength(0);
      });
    });
  });

  describe('Trust Dashboard Visual Elements', () => {
    test('Trust-Indikatoren haben konsistente Farben', async () => {
      const { container } = renderWithProviders(<TrustAwareDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/trust dashboard/i)).toBeInTheDocument();
      });

      // Prüfe Trust-Indikatoren
      const trustIndicators = container.querySelectorAll('[data-testid="trust-indicator"]');
      expect(trustIndicators.length).toBeGreaterThan(0);

      trustIndicators.forEach((indicator) => {
        const styles = getComputedStyles(indicator as HTMLElement);
        
        // Erwartete Trust-Indikator-Styles
        const expectedTrustStyles = {
          padding: '12px',
          borderRadius: '6px',
          fontWeight: '600',
          textAlign: 'center',
        };

        const differences = compareStyles(styles, expectedTrustStyles);
        expect(differences).toHaveLength(0);

        // Prüfe spezifische Trust-Farben
        const trustLevel = indicator.getAttribute('data-trust-level');
        if (trustLevel === 'high') {
          expect(styles.backgroundColor).toBe('rgb(76, 175, 80)'); // Grün
        } else if (trustLevel === 'medium') {
          expect(styles.backgroundColor).toBe('rgb(255, 152, 0)'); // Orange
        } else if (trustLevel === 'low') {
          expect(styles.backgroundColor).toBe('rgb(244, 67, 54)'); // Rot
        }
      });
    });
  });

  describe('Responsive Layout Consistency', () => {
    test('Layout passt sich korrekt an verschiedene Bildschirmgrößen an', async () => {
      const { container } = renderWithProviders(<SapFioriDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Teste Desktop-Layout
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      fireEvent(window, new Event('resize'));

      await waitFor(() => {
        const gridContainer = container.querySelector('[data-testid="grid-container"]');
        const styles = getComputedStyles(gridContainer as HTMLElement);
        expect(styles.gridTemplateColumns).toBe('repeat(4, 1fr)');
      });

      // Teste Tablet-Layout
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      fireEvent(window, new Event('resize'));

      await waitFor(() => {
        const gridContainer = container.querySelector('[data-testid="grid-container"]');
        const styles = getComputedStyles(gridContainer as HTMLElement);
        expect(styles.gridTemplateColumns).toBe('repeat(2, 1fr)');
      });

      // Teste Mobile-Layout
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      fireEvent(window, new Event('resize'));

      await waitFor(() => {
        const gridContainer = container.querySelector('[data-testid="grid-container"]');
        const styles = getComputedStyles(gridContainer as HTMLElement);
        expect(styles.gridTemplateColumns).toBe('1fr');
      });
    });

    test('Navigation verhält sich korrekt auf verschiedenen Bildschirmgrößen', async () => {
      const { container } = renderWithProviders(<SapFioriDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Desktop: Navigation sollte sichtbar sein
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      fireEvent(window, new Event('resize'));

      await waitFor(() => {
        const navigation = container.querySelector('[data-testid="navigation"]');
        const styles = getComputedStyles(navigation as HTMLElement);
        expect(styles.display).toBe('flex');
      });

      // Mobile: Navigation sollte versteckt sein
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      fireEvent(window, new Event('resize'));

      await waitFor(() => {
        const navigation = container.querySelector('[data-testid="navigation"]');
        const styles = getComputedStyles(navigation as HTMLElement);
        expect(styles.display).toBe('none');
      });
    });
  });

  describe('Typography Consistency', () => {
    test('Alle Überschriften haben konsistente Typografie', async () => {
      const { container } = renderWithProviders(<SapFioriDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Prüfe H1-Überschriften
      const h1Elements = container.querySelectorAll('h1');
      h1Elements.forEach((h1) => {
        const styles = getComputedStyles(h1 as HTMLElement);
        const expectedH1Styles = {
          fontSize: '32px',
          fontWeight: '700',
          color: 'rgb(33, 33, 33)',
          marginBottom: '16px',
        };

        const differences = compareStyles(styles, expectedH1Styles);
        expect(differences).toHaveLength(0);
      });

      // Prüfe H2-Überschriften
      const h2Elements = container.querySelectorAll('h2');
      h2Elements.forEach((h2) => {
        const styles = getComputedStyles(h2 as HTMLElement);
        const expectedH2Styles = {
          fontSize: '24px',
          fontWeight: '600',
          color: 'rgb(33, 33, 33)',
          marginBottom: '12px',
        };

        const differences = compareStyles(styles, expectedH2Styles);
        expect(differences).toHaveLength(0);
      });

      // Prüfe H3-Überschriften
      const h3Elements = container.querySelectorAll('h3');
      h3Elements.forEach((h3) => {
        const styles = getComputedStyles(h3 as HTMLElement);
        const expectedH3Styles = {
          fontSize: '20px',
          fontWeight: '600',
          color: 'rgb(33, 33, 33)',
          marginBottom: '8px',
        };

        const differences = compareStyles(styles, expectedH3Styles);
        expect(differences).toHaveLength(0);
      });
    });

    test('Body-Text hat konsistente Typografie', async () => {
      const { container } = renderWithProviders(<SapFioriDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Prüfe Body-Text
      const bodyTextElements = container.querySelectorAll('p');
      bodyTextElements.forEach((p) => {
        const styles = getComputedStyles(p as HTMLElement);
        const expectedBodyStyles = {
          fontSize: '16px',
          fontWeight: '400',
          color: 'rgb(66, 66, 66)',
          lineHeight: '1.5',
        };

        const differences = compareStyles(styles, expectedBodyStyles);
        expect(differences).toHaveLength(0);
      });
    });
  });

  describe('Color Scheme Consistency', () => {
    test('Primärfarben sind konsistent in der gesamten App', async () => {
      const { container } = renderWithProviders(<SapFioriDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Prüfe Primärfarben
      const primaryElements = container.querySelectorAll('[data-color="primary"]');
      primaryElements.forEach((element) => {
        const styles = getComputedStyles(element as HTMLElement);
        expect(styles.backgroundColor).toBe('rgb(25, 118, 210)'); // MUI Primary Blue
      });

      // Prüfe Sekundärfarben
      const secondaryElements = container.querySelectorAll('[data-color="secondary"]');
      secondaryElements.forEach((element) => {
        const styles = getComputedStyles(element as HTMLElement);
        expect(styles.backgroundColor).toBe('rgb(220, 0, 78)'); // MUI Secondary Pink
      });

      // Prüfe Erfolgsfarben
      const successElements = container.querySelectorAll('[data-color="success"]');
      successElements.forEach((element) => {
        const styles = getComputedStyles(element as HTMLElement);
        expect(styles.backgroundColor).toBe('rgb(76, 175, 80)'); // MUI Success Green
      });

      // Prüfe Warnfarben
      const warningElements = container.querySelectorAll('[data-color="warning"]');
      warningElements.forEach((element) => {
        const styles = getComputedStyles(element as HTMLElement);
        expect(styles.backgroundColor).toBe('rgb(255, 152, 0)'); // MUI Warning Orange
      });

      // Prüfe Fehlerfarben
      const errorElements = container.querySelectorAll('[data-color="error"]');
      errorElements.forEach((element) => {
        const styles = getComputedStyles(element as HTMLElement);
        expect(styles.backgroundColor).toBe('rgb(244, 67, 54)'); // MUI Error Red
      });
    });
  });

  describe('Spacing Consistency', () => {
    test('Alle Abstände folgen dem Design-System', async () => {
      const { container } = renderWithProviders(<SapFioriDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Prüfe Container-Padding
      const containers = container.querySelectorAll('[data-testid="container"]');
      containers.forEach((container) => {
        const styles = getComputedStyles(container as HTMLElement);
        expect(styles.padding).toBe('24px');
      });

      // Prüfe Card-Padding
      const cards = container.querySelectorAll('[data-testid="card"]');
      cards.forEach((card) => {
        const styles = getComputedStyles(card as HTMLElement);
        expect(styles.padding).toBe('16px');
      });

      // Prüfe Grid-Gaps
      const grids = container.querySelectorAll('[data-testid="grid"]');
      grids.forEach((grid) => {
        const styles = getComputedStyles(grid as HTMLElement);
        expect(styles.gap).toBe('24px');
      });
    });
  });

  describe('Accessibility Visual Checks', () => {
    test('Kontrast-Verhältnisse sind ausreichend', async () => {
      const { container } = renderWithProviders(<SapFioriDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Prüfe Text-Kontrast
      const textElements = container.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
      textElements.forEach((element) => {
        const styles = getComputedStyles(element as HTMLElement);
        const backgroundColor = styles.backgroundColor;
        const color = styles.color;

        // Einfache Kontrast-Prüfung (kann erweitert werden)
        if (backgroundColor && color) {
          // Prüfe ob Text nicht auf ähnlichem Hintergrund steht
          expect(color).not.toBe(backgroundColor);
        }
      });
    });

    test('Fokus-Indikatoren sind sichtbar', async () => {
      const { container } = renderWithProviders(<SapFioriDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Prüfe Fokus-Styles für interaktive Elemente
      const interactiveElements = container.querySelectorAll('button, a, input, select, textarea');
      interactiveElements.forEach((element) => {
        const styles = getComputedStyles(element as HTMLElement);
        
        // Prüfe ob Fokus-Styles definiert sind
        expect(styles.outline).toBeDefined();
        expect(styles.outline).not.toBe('none');
      });
    });
  });
}); 