import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import AIBarcodeDashboard from '../AIBarcodeDashboard';

// Einfaches Theme für Tests
const testTheme = createTheme();

// Mock für Offline-Hooks
jest.mock('../../../hooks/useOffline', () => ({
  useOfflineStatus: () => ({
    isOnline: true,
    pendingRequests: 0,
    syncInProgress: false,
    lastSync: Date.now(),
    error: null
  }),
  useOfflineData: () => ({
    data: [],
    loading: false,
    error: null
  })
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={testTheme}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </ThemeProvider>
  );
};

// Integration-Tests mit echten API-Aufrufen
describe('AIBarcodeDashboard Integration Tests', () => {
  const API_BASE_URL = 'http://localhost:8000';

  beforeAll(() => {
    // Prüfe ob Backend verfügbar ist
    global.fetch = jest.fn();
  });

  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Echte API-Integration', () => {
    it('lädt echte Barcode-Vorschläge vom Backend', async () => {
      // Mock für echte API-Antwort
      const mockSuggestions = [
        {
          id: '1',
          product_name: 'iPhone 15 Pro',
          suggested_barcode: '4001234567890',
          confidence_score: 0.85,
          reasoning: 'Barcode basiert auf erfolgreichen Mustern in der Elektronik-Kategorie',
          category: 'Elektronik',
          similar_products: ['Samsung Galaxy S24', 'MacBook Air M3'],
          market_trends: {
            demand_trend: 'steigend',
            price_trend: 'stabil',
            seasonality: 'hoch'
          },
          created_at: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          product_name: 'Harry Potter Box Set',
          suggested_barcode: '9781234567890',
          confidence_score: 0.92,
          reasoning: 'ISBN-13 Format für Bücher',
          category: 'Bücher',
          similar_products: ['Der Herr der Ringe', 'Game of Thrones'],
          market_trends: {
            demand_trend: 'stabil',
            price_trend: 'fallend',
            seasonality: 'niedrig'
          },
          created_at: '2024-01-15T11:00:00Z'
        }
      ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockSuggestions })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              total_suggestions: 2,
              high_confidence: 1,
              medium_confidence: 1,
              low_confidence: 0,
              categories: [
                { name: 'Elektronik', count: 1 },
                { name: 'Bücher', count: 1 }
              ],
              confidence_trend: [
                { date: '2024-01-15', avg_confidence: 0.885 }
              ],
              top_categories: [
                { category: 'Elektronik', count: 1 },
                { category: 'Bücher', count: 1 }
              ]
            }
          })
        });

      renderWithProviders(<AIBarcodeDashboard />);

      // Warte auf das Laden der Daten
      await waitFor(() => {
        expect(screen.getByText('iPhone 15 Pro')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Harry Potter Box Set')).toBeInTheDocument();
      });

      // Prüfe API-Aufrufe
      expect(global.fetch).toHaveBeenCalledWith('/api/ai/barcode/suggestions');
      expect(global.fetch).toHaveBeenCalledWith('/api/ai/barcode/stats');
    });

    it('behandelt API-Fehler korrekt', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      renderWithProviders(<AIBarcodeDashboard />);

      // Warte auf Error-Anzeige
      await waitFor(() => {
        expect(screen.getByText(/Unbekannter Fehler beim Laden der Vorschläge/)).toBeInTheDocument();
      });
    });

    it('filtert Vorschläge nach Kategorie', async () => {
      const mockSuggestions = [
        {
          id: '1',
          product_name: 'iPhone 15 Pro',
          suggested_barcode: '4001234567890',
          confidence_score: 0.85,
          reasoning: 'Test',
          category: 'Elektronik',
          similar_products: [],
          market_trends: {},
          created_at: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          product_name: 'Harry Potter Box Set',
          suggested_barcode: '9781234567890',
          confidence_score: 0.92,
          reasoning: 'Test',
          category: 'Bücher',
          similar_products: [],
          market_trends: {},
          created_at: '2024-01-15T11:00:00Z'
        }
      ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockSuggestions })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: {} })
        });

      renderWithProviders(<AIBarcodeDashboard />);

      // Warte auf das Laden der Daten
      await waitFor(() => {
        expect(screen.getByText('iPhone 15 Pro')).toBeInTheDocument();
      });

      // Öffne Kategorie-Filter
      const categoryFilter = screen.getByLabelText('Nach Kategorie filtern');
      fireEvent.mouseDown(categoryFilter);

      // Wähle "Elektronik"
      const elektronikOption = screen.getByText('Elektronik');
      fireEvent.click(elektronikOption);

      // Prüfe dass nur Elektronik-Produkte angezeigt werden
      await waitFor(() => {
        expect(screen.getByText('iPhone 15 Pro')).toBeInTheDocument();
        expect(screen.queryByText('Harry Potter Box Set')).not.toBeInTheDocument();
      });
    });

    it('öffnet Detail-Dialog für Vorschlag', async () => {
      const mockSuggestions = [
        {
          id: '1',
          product_name: 'iPhone 15 Pro',
          suggested_barcode: '4001234567890',
          confidence_score: 0.85,
          reasoning: 'Detaillierte Begründung für Barcode-Vorschlag',
          category: 'Elektronik',
          similar_products: ['Samsung Galaxy S24', 'MacBook Air M3'],
          market_trends: {
            demand_trend: 'steigend',
            price_trend: 'stabil',
            seasonality: 'hoch'
          },
          created_at: '2024-01-15T10:30:00Z'
        }
      ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockSuggestions })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: {} })
        });

      renderWithProviders(<AIBarcodeDashboard />);

      // Warte auf das Laden der Daten
      await waitFor(() => {
        expect(screen.getByText('iPhone 15 Pro')).toBeInTheDocument();
      });

      // Klicke auf Details-Button
      const detailsButton = screen.getByLabelText('Details anzeigen');
      fireEvent.click(detailsButton);

      // Prüfe dass Dialog geöffnet wird
      await waitFor(() => {
        expect(screen.getByText('Barcode-Vorschlag Details')).toBeInTheDocument();
        expect(screen.getByText('Detaillierte Begründung für Barcode-Vorschlag')).toBeInTheDocument();
      });
    });

    it('führt Modell-Retraining durch', async () => {
      const mockSuggestions = [
        {
          id: '1',
          product_name: 'Test Product',
          suggested_barcode: '1234567890',
          confidence_score: 0.8,
          reasoning: 'Test',
          category: 'Test',
          similar_products: [],
          market_trends: {},
          created_at: '2024-01-15T10:30:00Z'
        }
      ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockSuggestions })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: {} })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'Modell erfolgreich neu trainiert' })
        });

      renderWithProviders(<AIBarcodeDashboard />);

      // Warte auf das Laden der Daten
      await waitFor(() => {
        expect(screen.getByText('Test Product')).toBeInTheDocument();
      });

      // Klicke auf "Modell neu laden"
      const retrainButton = screen.getByText('Modell neu laden');
      fireEvent.click(retrainButton);

      // Prüfe dass Retraining-Dialog geöffnet wird
      await waitFor(() => {
        expect(screen.getByText('KI-Modell neu laden')).toBeInTheDocument();
      });

      // Klicke auf "Neuladen starten"
      const startRetrainButton = screen.getByText('Neuladen starten');
      fireEvent.click(startRetrainButton);

      // Prüfe dass Retraining-API aufgerufen wird
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/ai/barcode/retrain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
      });
    });
  });

  describe('Offline-Funktionalität', () => {
    it('zeigt Offline-Status bei fehlender Verbindung', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      // Mock Offline-Status
      jest.doMock('../../../hooks/useOffline', () => ({
        useOfflineStatus: () => ({
          isOnline: false,
          pendingRequests: 2,
          syncInProgress: false,
          lastSync: Date.now(),
          error: null
        }),
        useOfflineData: () => ({
          data: [
            {
              id: '1',
              product_name: 'Offline Product',
              suggested_barcode: '1234567890',
              confidence_score: 0.8,
              reasoning: 'Offline data',
              category: 'Test',
              similar_products: [],
              market_trends: {},
              created_at: '2024-01-15T10:30:00Z'
            }
          ],
          loading: false,
          error: null
        })
      }));

      renderWithProviders(<AIBarcodeDashboard />);

      // Prüfe Offline-Banner
      await waitFor(() => {
        expect(screen.getByText(/Offline-Modus aktiv/)).toBeInTheDocument();
        expect(screen.getByText(/2 Sync/)).toBeInTheDocument();
      });
    });
  });

  describe('Performance-Tests', () => {
    it('lädt große Datenmengen effizient', async () => {
      // Generiere 100 Test-Vorschläge
      const mockSuggestions = Array.from({ length: 100 }, (_, i) => ({
        id: `${i + 1}`,
        product_name: `Product ${i + 1}`,
        suggested_barcode: `123456789${i.toString().padStart(3, '0')}`,
        confidence_score: 0.5 + (i % 50) / 100,
        reasoning: `Begründung für Produkt ${i + 1}`,
        category: ['Elektronik', 'Bücher', 'Kleidung'][i % 3],
        similar_products: [],
        market_trends: {},
        created_at: '2024-01-15T10:30:00Z'
      }));

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockSuggestions })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: {} })
        });

      const startTime = performance.now();

      renderWithProviders(<AIBarcodeDashboard />);

      // Warte auf das Laden aller Daten
      await waitFor(() => {
        expect(screen.getByText('Product 100')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Prüfe dass Ladezeit akzeptabel ist (< 2 Sekunden)
      expect(loadTime).toBeLessThan(2000);

      console.log(`Ladezeit für 100 Vorschläge: ${loadTime.toFixed(2)}ms`);
    });
  });
}); 