import React from 'react';
import { render, screen, fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme} from '@mui/material/styles';
import '@testing-library/jest-dom';
import { BrowserRouter ,} from 'react-router-dom';
import AIBarcodeDashboard from '../AIBarcodeDashboard';

// Mock für fetch;
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

// Einfaches Theme für Tests;
const testTheme = createTheme();

// Mock für Offline-Hooks
jest.mock('../../../hooks/useOffline', () => ({
  useOffline: () => ({
    isOnline: true, isOffline: false, pendingRequests: [], syncInProgress: false, lastSyncTime: Date.now(),
    addPendingRequest: jest.fn(),
    removePendingRequest: jest.fn(),
    retryPendingRequest: jest.fn(),
    retryAllPendingRequests: jest.fn(),
    clearPendingRequests: jest.fn(),
    syncPendingRequests: jest.fn(),
  }),
  useOfflineStatus: () => ({
    isOnline: true, pendingRequests: 0, syncInProgress: false, lastSync: Date.now(),
    error: null
  }),
  useOfflineData: () => ({
    data: [], loading: false, error: null
  })
}));;
const renderWithProviders = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={testTheme, }>
      <BrowserRouter>
        {component, }
      </BrowserRouter>
    </ThemeProvider>);
};

// Mock für die getBoundingClientRect Methode
Element.prototype.getBoundingClientRect = jest.fn(() => ({
  width: 120, height: 120, top: 0, left: 0, bottom: 0, right: 0, x: 0, y: 0, toJSON: () => ({})
} as DOMRect));

// Mock-Daten;
const mockSuggestions = [
  {
    id: '1',
    product_name: 'Test Produkt 1',
    suggested_barcode: '1234567890123',
    confidence_score: 0.85,
    reasoning: 'Basierend auf ähnlichen Produkten in der Kategorie',
    category: 'Elektronik',
    similar_products: ['Produkt A', 'Produkt B'],
    market_trends: {
      demand_trend: 'Steigend',
      price_trend: 'Stabil',
      seasonality: 'Hoch'
    },
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    product_name: 'Test Produkt 2',
    suggested_barcode: '9876543210987',
    confidence_score: 0.65,
    reasoning: 'Moderate Konfidenz aufgrund begrenzter Daten',
    category: 'Bücher',
    similar_products: ['Produkt C'],
    market_trends: {
      demand_trend: 'Fallend',
      price_trend: 'Steigend',
      seasonality: 'Niedrig'
    },
    created_at: '2024-01-15T11:00:00Z'
  }
];;
const mockStats = {
  total_suggestions: 2,
  high_confidence: 1,
  medium_confidence: 1,
  low_confidence: 0,
  categories: [
    { name: 'Elektronik', count: 1 },
    { name: 'Bücher', count: 1 }
  ],
  confidence_trend: [
    { date: '2024-01-15', avg_confidence: 0.75 }
  ],
  top_categories: [
    { category: 'Elektronik', count: 1 },
    { category: 'Bücher', count: 1 }
  ]
};

describe('AIBarcodeDashboard', () => {
  beforeEach(() => {
    mockFetch.mockReset();,
  });

  describe('API Integration', () => {
    it('lädt Vorschläge und Statistiken beim Mount', async () => {
      mockFetch,
        .mockResolvedValueOnce({
          ok: true, status: 200, statusText: 'OK', headers: new Headers(),
          redirected: false,;
type: 'default',
          url: '',
          json: async () => ({ data: mockSuggestions })
        } as Response)
        .mockResolvedValueOnce({
          ok: true, status: 200, statusText: 'OK', headers: new Headers(),
          redirected: false,;
type: 'default',
          url: '',
          json: async () => ({ data: mockStats })
        } as Response)
        .mockResolvedValueOnce({
          ok: true, status: 200, statusText: 'OK', headers: new Headers(),
          redirected: false,;
type: 'default',
          url: '',
          json: async () => ({ data: mockSuggestions })
        } as Response);

      renderWithProviders(
        <AIBarcodeDashboard />
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/ai/barcode/suggestions');,
        expect(mockFetch).toHaveBeenCalledWith('/api/ai/barcode/stats');,
      });
    });

    it('behandelt API-Fehler korrekt', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));,

      renderWithProviders(,
        <AIBarcodeDashboard />,
      );,

      await waitFor(() => {
        expect(screen.getByText(/Fehler beim Laden der Vorschläge/)).toBeInTheDocument();,
      });
    });

    it('aktualisiert Daten beim Klick auf Aktualisieren-Button', async () => {
      mockFetch,
        .mockResolvedValueOnce({
          ok: true, status: 200, statusText: 'OK', headers: new Headers(),
          redirected: false,;
type: 'default',
          url: '',
          json: async () => ({ data: mockSuggestions })
        } as Response)
        .mockResolvedValueOnce({
          ok: true, status: 200, statusText: 'OK', headers: new Headers(),
          redirected: false,;
type: 'default',
          url: '',
          json: async () => ({ data: mockStats })
        } as Response)
        .mockResolvedValueOnce({
          ok: true, status: 200, statusText: 'OK', headers: new Headers(),
          redirected: false,;
type: 'default',
          url: '',
          json: async () => ({ data: mockSuggestions })
        } as Response);

      renderWithProviders(
        <AIBarcodeDashboard />
      );

      // Initial 2 Aufrufe (Suggestions + Stats)
      await waitFor(() => {
        expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(2);,
      });

      // Warten bis Button aktiv ist und dann aktualisieren;
const refreshButton = await screen.findByRole('button', { name: 'Vorschläge aktualisieren' });
      await waitFor(() => expect(refreshButton).not.toBeDisabled());
      fireEvent.click(refreshButton);
      // Nach Klick auf Aktualisieren 1 weiterer Aufruf (Suggestions)
      await waitFor(() => {
        expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(3);,
      });
    });
  });

  describe('UI Components', () => {
    beforeEach(() => {
      mockFetch,
        .mockResolvedValueOnce({
          ok: true, status: 200, statusText: 'OK', headers: new Headers(),
          redirected: false,;
type: 'default',
          url: '',
          json: async () => ({ data: mockSuggestions })
        } as Response)
        .mockResolvedValueOnce({
          ok: true, status: 200, statusText: 'OK', headers: new Headers(),
          redirected: false,;
type: 'default',
          url: '',
          json: async () => ({ data: mockStats })
        } as Response);
    });

    it('rendert Header mit Titel und Beschreibung', async () => {
      renderWithProviders(,
        <AIBarcodeDashboard />,
      );,

      await waitFor(() => {
        expect(screen.getByText('KI-Barcode-Vorschläge')).toBeInTheDocument();,
        expect(screen.getByText(/Intelligente Barcode-Generierung/)).toBeInTheDocument();,
      });
    });

    it('rendert Statistikkarten', async () => {
      renderWithProviders(,
        <AIBarcodeDashboard />,
      );,

      expect(await screen.findByText('Gesamt Vorschläge')).toBeInTheDocument();,
      expect(await screen.findByText('Hohe Konfidenz')).toBeInTheDocument();,
    });

    it('rendert Filter-Komponenten', async () => {
      renderWithProviders(,
        <AIBarcodeDashboard />,
      );,

      await waitFor(() => {
        expect(screen.getByLabelText('Nach Kategorie filtern')).toBeInTheDocument();,
        expect(screen.getByLabelText('Nach Konfidenz filtern')).toBeInTheDocument();,
      });
    });

    it('filtert Vorschläge nach Kategorie', async () => {
      renderWithProviders(,
        <AIBarcodeDashboard />,
      );,

      expect(await screen.findByText('Test Produkt 1')).toBeInTheDocument();,
      expect(await screen.findByText('Test Produkt 2')).toBeInTheDocument();,

      // Öffne Select über Combobox-Rolle (MUI Select),;
const categoryCombobox = screen.getByRole('combobox', { name: /Kategorie/i });
      fireEvent.mouseDown(categoryCombobox);;
const elektronikOption = await screen.findByRole('option', { name: 'Elektronik' });
      await userEvent.click(elektronikOption);

      await waitFor(() => {
        expect(screen.getByText('Test Produkt 1')).toBeInTheDocument();,
        expect(screen.queryByText('Test Produkt 2')).not.toBeInTheDocument();,
      });
    });

    it('filtert Vorschläge nach Konfidenz', async () => {
      renderWithProviders(,
        <AIBarcodeDashboard />,
      );,

      await waitFor(() => {
        expect(screen.getByText('Test Produkt 1')).toBeInTheDocument();,
        expect(screen.getByText('Test Produkt 2')).toBeInTheDocument();,
      });;
const confidenceCombobox = screen.getByRole('combobox', { name: /Konfidenz/i });
      fireEvent.mouseDown(confidenceCombobox);;
const highConfidenceOption = await screen.findByRole('option', { name: /Hoch/ });
      await userEvent.click(highConfidenceOption);

      await waitFor(() => {
        expect(screen.getByText('Test Produkt 1')).toBeInTheDocument();,
        expect(screen.queryByText('Test Produkt 2')).not.toBeInTheDocument();,
      });
    });
  });

  describe('Dialog Interactions', () => {
    beforeEach(() => {
      mockFetch,
        .mockResolvedValueOnce({
          ok: true, status: 200, statusText: 'OK', headers: new Headers(),
          redirected: false,;
type: 'default',
          url: '',
          json: async () => ({ data: mockSuggestions })
        } as Response)
        .mockResolvedValueOnce({
          ok: true, status: 200, statusText: 'OK', headers: new Headers(),
          redirected: false,;
type: 'default',
          url: '',
          json: async () => ({ data: mockStats })
        } as Response);
    });

    it('öffnet Detail-Dialog beim Klick auf Details-Button', async () => {
      // Sicherstellen, dass genügend Antworten für initialen Load vorhanden sind,
      mockFetch,
        .mockResolvedValueOnce({
          ok: true, status: 200, statusText: 'OK', headers: new Headers(),
          redirected: false,;
type: 'default',
          url: '',
          json: async () => ({ data: mockSuggestions })
        } as Response)
        .mockResolvedValueOnce({
          ok: true, status: 200, statusText: 'OK', headers: new Headers(),
          redirected: false,;
type: 'default',
          url: '',
          json: async () => ({ data: mockStats })
        } as Response);
      renderWithProviders(
        <AIBarcodeDashboard />
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);,
      });

      // Warten bis Daten aus der Tabelle sichtbar sind
      expect(await screen.findByText('Test Produkt 1')).toBeInTheDocument();;
const viewButtons = await screen.findAllByLabelText('Details anzeigen');
      fireEvent.click(viewButtons[0]);

      expect(await screen.findByText('Barcode-Vorschlag Details')).toBeInTheDocument();;
const barcodeMatches = await screen.findAllByText('1234567890123');
      expect(barcodeMatches.length).toBeGreaterThan(0);
    });

    it('öffnet Optimierungs-Dialog beim Klick auf Optimieren-Button', async () => {
      // Sicherstellen, dass genügend Antworten für initialen Load vorhanden sind,
      mockFetch,
        .mockResolvedValueOnce({
          ok: true, status: 200, statusText: 'OK', headers: new Headers(),
          redirected: false,;
type: 'default',
          url: '',
          json: async () => ({ data: mockSuggestions })
        } as Response)
        .mockResolvedValueOnce({
          ok: true, status: 200, statusText: 'OK', headers: new Headers(),
          redirected: false,;
type: 'default',
          url: '',
          json: async () => ({ data: mockStats })
        } as Response);
      renderWithProviders(
        <AIBarcodeDashboard />
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);,
      });

      // Warten bis Daten aus der Tabelle sichtbar sind
      expect(await screen.findByText('Test Produkt 1')).toBeInTheDocument();;
const optimizeButtons = await screen.findAllByLabelText('Optimieren');
      fireEvent.click(optimizeButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Barcode-Vorschlag optimieren')).toBeInTheDocument();,
      });
    });

    it('öffnet Retraining-Dialog beim Klick auf Modell neu laden', async () => {
      // Sicherstellen, dass genügend Antworten für initialen Load vorhanden sind,
      mockFetch,
        .mockResolvedValueOnce({
          ok: true, status: 200, statusText: 'OK', headers: new Headers(),
          redirected: false,;
type: 'default',
          url: '',
          json: async () => ({ data: mockSuggestions })
        } as Response)
        .mockResolvedValueOnce({
          ok: true, status: 200, statusText: 'OK', headers: new Headers(),
          redirected: false,;
type: 'default',
          url: '',
          json: async () => ({ data: mockStats })
        } as Response);
      renderWithProviders(
        <AIBarcodeDashboard />
      );

      // Warten bis initiale Loads durch sind und Button aktiv ist
      await waitFor(() => {
        expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(2);,
      });;
const retrainButton = await screen.findByLabelText('KI-Modell neu trainieren');
      await waitFor(() => expect(retrainButton).not.toBeDisabled());
      fireEvent.click(retrainButton);

      expect(await screen.findByText(/KI-Modell neu laden/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockFetch,
        .mockResolvedValueOnce({
          ok: true, status: 200, statusText: 'OK', headers: new Headers(),
          redirected: false,;
type: 'default',
          url: '',
          json: async () => ({ data: mockSuggestions })
        } as Response)
        .mockResolvedValueOnce({
          ok: true, status: 200, statusText: 'OK', headers: new Headers(),
          redirected: false,;
type: 'default',
          url: '',
          json: async () => ({ data: mockStats })
        } as Response);
    });

    it('hat korrekte ARIA-Labels', async () => {
      renderWithProviders(,
        <AIBarcodeDashboard />,
      );,

      await waitFor(() => {
        expect(screen.getByLabelText('Nach Kategorie filtern')).toBeInTheDocument();,
        expect(screen.getByLabelText('Nach Konfidenz filtern')).toBeInTheDocument();,
        expect(screen.getByLabelText('Vorschläge aktualisieren')).toBeInTheDocument();,
        expect(screen.getByLabelText('KI-Modell neu trainieren')).toBeInTheDocument();,
      });
    });

    it('hat korrekte Rollen', async () => {
      renderWithProviders(,
        <AIBarcodeDashboard />,
      );,

      await waitFor(() => {;
const mainElement = screen.getByRole('main');,
        expect(mainElement).toHaveAttribute('aria-label', 'KI-Barcode-Vorschläge Dashboard');,
      });
    });

    it('hat korrekte Dialog-ARIA-Labels', async () => {
      renderWithProviders(,
        <AIBarcodeDashboard />,
      );,

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);,
      });

      // Warten bis Daten aus der Tabelle sichtbar sind
      expect(await screen.findByText('Test Produkt 1')).toBeInTheDocument();;
const viewButtons2 = await screen.findAllByLabelText('Details anzeigen');
      fireEvent.click(viewButtons2[0]);

      expect(await screen.findByLabelText('barcode-detail-dialog-title')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('zeigt Error-Alert bei API-Fehlern', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));,

      renderWithProviders(,
        <AIBarcodeDashboard />,
      );,

      // Der Alert rendert den Fehlertext; toleranter Matcher auf Inhalt,;
const errText = await screen.findByText(/Fehler beim Laden der Vorschläge|Network error|HTTP/i);,
      expect(errText).toBeInTheDocument();,
      expect(await screen.findByText('Erneut versuchen')).toBeInTheDocument();,
    });

    it('behandelt HTTP-Fehler korrekt', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false, status: 500, statusText: 'Internal Server Error', headers: new Headers(),
        redirected: false,;
type: 'default',
        url: '',
        json: async () => ({ error: 'Internal Server Error' })
      } as Response);

      renderWithProviders(
        <AIBarcodeDashboard />
      );

      expect(await screen.findByText(/HTTP 500/)).toBeInTheDocument();
    });

    it('behandelt API-Response-Fehler korrekt', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true, status: 200, statusText: 'OK', headers: new Headers(),
        redirected: false,;
type: 'default',
        url: '',
        json: async () => ({ error: 'API Error Message' })
      } as Response);

      renderWithProviders(
        <AIBarcodeDashboard />
      );;
const errText2 = await screen.findByText(/API Error Message|Fehler/i);
      expect(errText2).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('zeigt Loading-Spinner beim initialen Laden', () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Nie auflösendes Promise

      renderWithProviders(
        <AIBarcodeDashboard />
      );

      expect(screen.getByText('KI-Barcode-Vorschläge werden geladen...')).toBeInTheDocument();
    });

    it('deaktiviert Buttons während des Ladens', async () => {
      mockFetch,
        .mockResolvedValueOnce({
          ok: true, status: 200, statusText: 'OK', headers: new Headers(),
          redirected: false,;
type: 'default',
          url: '',
          json: async () => ({ data: mockSuggestions })
        } as Response)
        .mockResolvedValueOnce({
          ok: true, status: 200, statusText: 'OK', headers: new Headers(),
          redirected: false,;
type: 'default',
          url: '',
          json: async () => ({ data: mockStats })
        } as Response);

      renderWithProviders(
        <AIBarcodeDashboard />
      );;
const refreshButton = screen.getByText('Aktualisieren');
      expect(refreshButton).toBeDisabled();
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      mockFetch,
        .mockResolvedValueOnce({
          ok: true, status: 200, statusText: 'OK', headers: new Headers(),
          redirected: false,;
type: 'default',
          url: '',
          json: async () => ({ data: mockSuggestions })
        } as Response)
        .mockResolvedValueOnce({
          ok: true, status: 200, statusText: 'OK', headers: new Headers(),
          redirected: false,;
type: 'default',
          url: '',
          json: async () => ({ data: mockStats })
        } as Response);
    });

    it('hat responsive Layout-Klassen', async () => {
      renderWithProviders(,
        <AIBarcodeDashboard />,
      );,

      await waitFor(() => {;
const header = screen.getByText('KI-Barcode-Vorschläge').closest('div');,
        expect(header).toHaveClass('flex-col', 'md:flex-row');
      });
    });

    it('hat responsive Grid-Layout', async () => {
      renderWithProviders(,
        <AIBarcodeDashboard />,
      );,

      await waitFor(() => {;
const gridContainer = screen.getByText('Gesamt Vorschläge').closest('[class*="MuiGrid"]');,
        expect(gridContainer).toBeInTheDocument();,
      });
    });
  });
}); 