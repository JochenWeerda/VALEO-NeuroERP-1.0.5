import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { neuralTheme } from '../../themes/NeuroFlowTheme';
import { ApiProvider } from '../../contexts/ApiContext';
import App from '../../App';

// Mock für fetch mit realistischen API-Responses
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock für localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

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

describe('End-to-End User Flows', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  describe('Vollständiger Login-Workflow', () => {
    test('Benutzer kann sich erfolgreich anmelden und durch die App navigieren', async () => {
      const user = userEvent.setup();

      // Mock für Login
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          token: 'mock-jwt-token',
          user: { id: 1, name: 'Test User', email: 'test@example.com' }
        })
      });

      // Mock für Dashboard-Daten
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          transactions: [
            { id: 1, amount: 1000, description: 'Test Transaction', status: 'completed' }
          ],
          inventory: [
            { id: 1, name: 'Test Product', quantity: 100, price: 10.99 }
          ]
        })
      });

      renderWithProviders(<App />);

      // Login-Formular ausfüllen
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/passwort/i);
      const loginButton = screen.getByText(/anmelden/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);

      // Warte auf erfolgreiche Anmeldung
      await waitFor(() => {
        expect(screen.getByText(/test user/i)).toBeInTheDocument();
      });

      // Prüfe ob Token gespeichert wurde
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'mock-jwt-token');

      // Navigiere zum Dashboard
      await waitFor(() => {
        expect(screen.getByText(/valeo neuroerp/i)).toBeInTheDocument();
      });
    });

    test('Benutzer wird bei ungültigen Anmeldedaten abgewiesen', async () => {
      const user = userEvent.setup();

      mockFetch.mockRejectedValueOnce(new Error('Invalid credentials'));

      renderWithProviders(<App />);

      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/passwort/i);
      const loginButton = screen.getByText(/anmelden/i);

      await user.type(emailInput, 'invalid@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/anmeldung fehlgeschlagen/i)).toBeInTheDocument();
      });
    });
  });

  describe('Transaktions-Management-Workflow', () => {
    test('Benutzer kann vollständigen Transaktions-Workflow durchführen', async () => {
      const user = userEvent.setup();

      // Mock für Login
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          token: 'mock-jwt-token',
          user: { id: 1, name: 'Test User', email: 'test@example.com' }
        })
      });

      // Mock für Transaktions-Daten
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          transactions: [
            { id: 1, amount: 1000, description: 'Existing Transaction', status: 'completed' }
          ]
        })
      });

      renderWithProviders(<App />);

      // Login
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/passwort/i);
      const loginButton = screen.getByText(/anmelden/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/test user/i)).toBeInTheDocument();
      });

      // Navigiere zu Transaktionen
      const menuButton = screen.getByLabelText(/menü/i);
      await user.click(menuButton);

      const transactionsLink = screen.getByText(/transaktionen/i);
      await user.click(transactionsLink);

      await waitFor(() => {
        expect(screen.getByText(/transaktionsübersicht/i)).toBeInTheDocument();
      });

      // Erstelle neue Transaktion
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 2,
          amount: 2000,
          description: 'New Transaction',
          status: 'pending'
        })
      });

      const addButton = screen.getByText(/neue transaktion/i);
      await user.click(addButton);

      const amountInput = screen.getByLabelText(/betrag/i);
      const descriptionInput = screen.getByLabelText(/beschreibung/i);
      const saveButton = screen.getByText(/speichern/i);

      await user.type(amountInput, '2000');
      await user.type(descriptionInput, 'New Transaction');
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/transactions'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              amount: 2000,
              description: 'New Transaction'
            })
          })
        );
      });

      // Bearbeite Transaktion
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 1,
          amount: 1500,
          description: 'Updated Transaction',
          status: 'completed'
        })
      });

      const editButton = screen.getByLabelText(/transaktion 1 bearbeiten/i);
      await user.click(editButton);

      await user.clear(amountInput);
      await user.type(amountInput, '1500');
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/transactions/1'),
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify({
              amount: 1500,
              description: 'Updated Transaction'
            })
          })
        );
      });

      // Lösche Transaktion
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Transaction deleted' })
      });

      const deleteButton = screen.getByLabelText(/transaktion 1 löschen/i);
      await user.click(deleteButton);

      const confirmButton = screen.getByText(/bestätigen/i);
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/transactions/1'),
          expect.objectContaining({
            method: 'DELETE'
          })
        );
      });
    });
  });

  describe('Inventar-Management-Workflow', () => {
    test('Benutzer kann vollständigen Inventar-Workflow durchführen', async () => {
      const user = userEvent.setup();

      // Mock für Login
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          token: 'mock-jwt-token',
          user: { id: 1, name: 'Test User', email: 'test@example.com' }
        })
      });

      // Mock für Inventar-Daten
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          inventory: [
            { id: 1, name: 'Existing Product', quantity: 100, price: 10.99 }
          ]
        })
      });

      renderWithProviders(<App />);

      // Login
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/passwort/i);
      const loginButton = screen.getByText(/anmelden/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/test user/i)).toBeInTheDocument();
      });

      // Navigiere zu Inventar
      const menuButton = screen.getByLabelText(/menü/i);
      await user.click(menuButton);

      const inventoryLink = screen.getByText(/inventar/i);
      await user.click(inventoryLink);

      await waitFor(() => {
        expect(screen.getByText(/inventarübersicht/i)).toBeInTheDocument();
      });

      // Erstelle neues Produkt
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 2,
          name: 'New Product',
          quantity: 50,
          price: 25.99
        })
      });

      const addButton = screen.getByText(/neues produkt/i);
      await user.click(addButton);

      const nameInput = screen.getByLabelText(/produktname/i);
      const quantityInput = screen.getByLabelText(/menge/i);
      const priceInput = screen.getByLabelText(/preis/i);
      const saveButton = screen.getByText(/speichern/i);

      await user.type(nameInput, 'New Product');
      await user.type(quantityInput, '50');
      await user.type(priceInput, '25.99');
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/inventory'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              name: 'New Product',
              quantity: 50,
              price: 25.99
            })
          })
        );
      });
    });
  });

  describe('Dashboard-Navigation-Workflow', () => {
    test('Benutzer kann zwischen allen Dashboard-Bereichen navigieren', async () => {
      const user = userEvent.setup();

      // Mock für Login
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          token: 'mock-jwt-token',
          user: { id: 1, name: 'Test User', email: 'test@example.com' }
        })
      });

      // Mock für Dashboard-Daten
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          transactions: [],
          inventory: [],
          analytics: { revenue: 10000, growth: 15 }
        })
      });

      renderWithProviders(<App />);

      // Login
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/passwort/i);
      const loginButton = screen.getByText(/anmelden/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/test user/i)).toBeInTheDocument();
      });

      // Teste Navigation zu verschiedenen Bereichen
      const menuButton = screen.getByLabelText(/menü/i);
      await user.click(menuButton);

      // Dashboard
      const dashboardLink = screen.getByText(/dashboard/i);
      await user.click(dashboardLink);

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Analytics
      await user.click(menuButton);
      const analyticsLink = screen.getByText(/analytics/i);
      await user.click(analyticsLink);

      await waitFor(() => {
        expect(screen.getByText(/analytics/i)).toBeInTheDocument();
      });

      // Dokumente
      await user.click(menuButton);
      const documentsLink = screen.getByText(/dokumente/i);
      await user.click(documentsLink);

      await waitFor(() => {
        expect(screen.getByText(/dokumente/i)).toBeInTheDocument();
      });
    });
  });

  describe('Fehlerbehandlung-Workflow', () => {
    test('Benutzer kann sich von Netzwerk-Fehlern erholen', async () => {
      const user = userEvent.setup();

      // Mock für Login
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          token: 'mock-jwt-token',
          user: { id: 1, name: 'Test User', email: 'test@example.com' }
        })
      });

      // Mock für initiale Daten
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          transactions: [{ id: 1, amount: 1000, description: 'Test', status: 'completed' }]
        })
      });

      // Mock für Netzwerk-Fehler
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      renderWithProviders(<App />);

      // Login
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/passwort/i);
      const loginButton = screen.getByText(/anmelden/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/test user/i)).toBeInTheDocument();
      });

      // Navigiere zu Transaktionen
      const menuButton = screen.getByLabelText(/menü/i);
      await user.click(menuButton);

      const transactionsLink = screen.getByText(/transaktionen/i);
      await user.click(transactionsLink);

      // Warte auf Fehler
      await waitFor(() => {
        expect(screen.getByText(/fehler beim laden der daten/i)).toBeInTheDocument();
      });

      // Mock für erfolgreiche Wiederherstellung
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          transactions: [{ id: 1, amount: 1000, description: 'Test', status: 'completed' }]
        })
      });

      // Versuche erneut zu laden
      const retryButton = screen.getByText(/erneut versuchen/i);
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Test')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive-Design-Workflow', () => {
    test('App funktioniert korrekt auf verschiedenen Bildschirmgrößen', async () => {
      const user = userEvent.setup();

      // Mock für Login
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          token: 'mock-jwt-token',
          user: { id: 1, name: 'Test User', email: 'test@example.com' }
        })
      });

      // Mock für Dashboard-Daten
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          transactions: [],
          inventory: []
        })
      });

      renderWithProviders(<App />);

      // Login
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/passwort/i);
      const loginButton = screen.getByText(/anmelden/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/test user/i)).toBeInTheDocument();
      });

      // Teste Desktop-Ansicht
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      fireEvent(window, new Event('resize'));

      await waitFor(() => {
        expect(screen.getByLabelText(/menü/i)).toBeInTheDocument();
      });

      // Teste Tablet-Ansicht
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      fireEvent(window, new Event('resize'));

      await waitFor(() => {
        expect(screen.getByLabelText(/mobile navigation/i)).toBeInTheDocument();
      });

      // Teste Mobile-Ansicht
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      fireEvent(window, new Event('resize'));

      await waitFor(() => {
        expect(screen.getByLabelText(/mobile navigation/i)).toBeInTheDocument();
      });
    });
  });

  describe('Performance-Workflow', () => {
    test('App lädt und reagiert schnell auf Benutzerinteraktionen', async () => {
      const user = userEvent.setup();

      // Mock für Login
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          token: 'mock-jwt-token',
          user: { id: 1, name: 'Test User', email: 'test@example.com' }
        })
      });

      // Mock für große Datenmenge
      const largeDataset = {
        transactions: Array.from({ length: 1000 }, (_, i) => ({
          id: i + 1,
          amount: 1000 + i,
          description: `Transaction ${i + 1}`,
          status: 'completed'
        }))
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(largeDataset)
      });

      const startTime = performance.now();

      renderWithProviders(<App />);

      // Login
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/passwort/i);
      const loginButton = screen.getByText(/anmelden/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/test user/i)).toBeInTheDocument();
      });

      // Navigiere zu Transaktionen
      const menuButton = screen.getByLabelText(/menü/i);
      await user.click(menuButton);

      const transactionsLink = screen.getByText(/transaktionen/i);
      await user.click(transactionsLink);

      await waitFor(() => {
        expect(screen.getByText('Transaction 1')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Gesamtzeit sollte unter 3 Sekunden liegen
      expect(totalTime).toBeLessThan(3000);

      // Teste Interaktions-Latenz
      const interactionStart = performance.now();
      
      const filterInput = screen.getByPlaceholderText(/transaktionen filtern/i);
      await user.type(filterInput, 'test');

      const interactionEnd = performance.now();
      const interactionTime = interactionEnd - interactionStart;

      // Interaktionszeit sollte unter 100ms liegen
      expect(interactionTime).toBeLessThan(100);
    });
  });

  describe('Accessibility-Workflow', () => {
    test('App ist vollständig über Tastatur bedienbar', async () => {
      const user = userEvent.setup();

      // Mock für Login
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          token: 'mock-jwt-token',
          user: { id: 1, name: 'Test User', email: 'test@example.com' }
        })
      });

      // Mock für Dashboard-Daten
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          transactions: [],
          inventory: []
        })
      });

      renderWithProviders(<App />);

      // Login über Tastatur
      const emailInput = screen.getByLabelText(/e-mail/i);
      const passwordInput = screen.getByLabelText(/passwort/i);
      const loginButton = screen.getByText(/anmelden/i);

      emailInput.focus();
      await user.type(emailInput, 'test@example.com');
      
      passwordInput.focus();
      await user.type(passwordInput, 'password123');
      
      loginButton.focus();
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText(/test user/i)).toBeInTheDocument();
      });

      // Navigation über Tastatur
      const menuButton = screen.getByLabelText(/menü/i);
      menuButton.focus();
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Tab-Navigation testen
      const dashboardLink = screen.getByText(/dashboard/i);
      dashboardLink.focus();
      await user.keyboard('{Tab}');

      // Prüfe ob Fokus korrekt gesetzt wurde
      expect(document.activeElement).toHaveAttribute('tabindex', '0');
    });
  });
}); 