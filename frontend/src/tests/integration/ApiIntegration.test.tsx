import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { neuralTheme } from '../../themes/NeuroFlowTheme';
import { ApiProvider } from '../../contexts/ApiContext';
import SapFioriDashboard from '../../pages/SapFioriDashboard';
import TransactionsPage from '../../pages/TransactionsPage';
import InventoryPage from '../../pages/InventoryPage';

// Mock für fetch mit detaillierten Responses
const mockFetch = jest.fn();
global.fetch = mockFetch;

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

describe('API Integration Tests', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('Authentication Flow', () => {
    test('führt vollständigen Login/Logout-Flow durch', async () => {
      // Mock für erfolgreichen Login
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            token: 'mock-jwt-token',
            user: { id: 1, name: 'Test User', email: 'test@example.com' }
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ message: 'Logged out successfully' })
        });

      renderWithProviders(<SapFioriDashboard />);

      // Simuliere Login
      const loginButton = screen.getByText(/anmelden/i);
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/test user/i)).toBeInTheDocument();
      });

      // Simuliere Logout
      const userMenu = screen.getByLabelText(/benutzer menü/i);
      fireEvent.click(userMenu);
      
      const logoutButton = screen.getByText(/abmelden/i);
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/auth/logout'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Authorization': 'Bearer mock-jwt-token'
            })
          })
        );
      });
    });

    test('behandelt Login-Fehler korrekt', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Invalid credentials'));

      renderWithProviders(<SapFioriDashboard />);

      const loginButton = screen.getByText(/anmelden/i);
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/anmeldung fehlgeschlagen/i)).toBeInTheDocument();
      });
    });
  });

  describe('Transaction Management', () => {
    test('lädt, erstellt, aktualisiert und löscht Transaktionen', async () => {
      const mockTransactions = [
        { id: 1, amount: 1000, description: 'Test Transaction 1', status: 'pending' },
        { id: 2, amount: 2000, description: 'Test Transaction 2', status: 'completed' }
      ];

      // Mock für GET /transactions
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ transactions: mockTransactions })
      });

      renderWithProviders(<TransactionsPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Transaction 1')).toBeInTheDocument();
        expect(screen.getByText('Test Transaction 2')).toBeInTheDocument();
      });

      // Teste Transaktion erstellen
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 3,
          amount: 3000,
          description: 'New Transaction',
          status: 'pending'
        })
      });

      const addButton = screen.getByText(/neue transaktion/i);
      fireEvent.click(addButton);

      const amountInput = screen.getByLabelText(/betrag/i);
      const descriptionInput = screen.getByLabelText(/beschreibung/i);

      fireEvent.change(amountInput, { target: { value: '3000' } });
      fireEvent.change(descriptionInput, { target: { value: 'New Transaction' } });

      const saveButton = screen.getByText(/speichern/i);
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/transactions'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              amount: 3000,
              description: 'New Transaction'
            })
          })
        );
      });

      // Teste Transaktion aktualisieren
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
      fireEvent.click(editButton);

      fireEvent.change(amountInput, { target: { value: '1500' } });
      fireEvent.click(saveButton);

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

      // Teste Transaktion löschen
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Transaction deleted' })
      });

      const deleteButton = screen.getByLabelText(/transaktion 1 löschen/i);
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByText(/bestätigen/i);
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/transactions/1'),
          expect.objectContaining({
            method: 'DELETE'
          })
        );
      });
    });

    test('behandelt Transaktions-Fehler korrekt', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      renderWithProviders(<TransactionsPage />);

      await waitFor(() => {
        expect(screen.getByText(/fehler beim laden der transaktionen/i)).toBeInTheDocument();
      });
    });
  });

  describe('Inventory Management', () => {
    test('lädt, erstellt, aktualisiert und löscht Inventar-Items', async () => {
      const mockInventory = [
        { id: 1, name: 'Product A', quantity: 100, price: 10.99 },
        { id: 2, name: 'Product B', quantity: 50, price: 25.50 }
      ];

      // Mock für GET /inventory
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ inventory: mockInventory })
      });

      renderWithProviders(<InventoryPage />);

      await waitFor(() => {
        expect(screen.getByText('Product A')).toBeInTheDocument();
        expect(screen.getByText('Product B')).toBeInTheDocument();
      });

      // Teste Inventar-Item erstellen
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 3,
          name: 'New Product',
          quantity: 75,
          price: 15.99
        })
      });

      const addButton = screen.getByText(/neues produkt/i);
      fireEvent.click(addButton);

      const nameInput = screen.getByLabelText(/produktname/i);
      const quantityInput = screen.getByLabelText(/menge/i);
      const priceInput = screen.getByLabelText(/preis/i);

      fireEvent.change(nameInput, { target: { value: 'New Product' } });
      fireEvent.change(quantityInput, { target: { value: '75' } });
      fireEvent.change(priceInput, { target: { value: '15.99' } });

      const saveButton = screen.getByText(/speichern/i);
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/inventory'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              name: 'New Product',
              quantity: 75,
              price: 15.99
            })
          })
        );
      });
    });
  });

  describe('Data Consistency', () => {
    test('hält Daten zwischen verschiedenen Seiten konsistent', async () => {
      const mockData = {
        transactions: [{ id: 1, amount: 1000, status: 'pending' }],
        inventory: [{ id: 1, name: 'Product A', quantity: 100 }]
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData)
      });

      // Teste Dashboard
      const { unmount } = renderWithProviders(<SapFioriDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('1000')).toBeInTheDocument();
      });

      unmount();

      // Teste Transaktions-Seite
      renderWithProviders(<TransactionsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('1000')).toBeInTheDocument();
      });
    });

    test('aktualisiert Cache nach Datenänderungen', async () => {
      const initialData = { transactions: [{ id: 1, amount: 1000 }] };
      const updatedData = { transactions: [{ id: 1, amount: 1500 }] };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(initialData)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(updatedData)
        });

      renderWithProviders(<TransactionsPage />);

      await waitFor(() => {
        expect(screen.getByText('1000')).toBeInTheDocument();
      });

      // Aktualisiere Daten
      const refreshButton = screen.getByLabelText(/aktualisieren/i);
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(screen.getByText('1500')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('behandelt verschiedene HTTP-Status-Codes korrekt', async () => {
      // Teste 401 Unauthorized
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Unauthorized' })
      });

      renderWithProviders(<TransactionsPage />);

      await waitFor(() => {
        expect(screen.getByText(/nicht autorisiert/i)).toBeInTheDocument();
      });

      // Teste 403 Forbidden
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ message: 'Forbidden' })
      });

      await waitFor(() => {
        expect(screen.getByText(/zugriff verweigert/i)).toBeInTheDocument();
      });

      // Teste 500 Internal Server Error
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: 'Internal Server Error' })
      });

      await waitFor(() => {
        expect(screen.getByText(/server fehler/i)).toBeInTheDocument();
      });
    });

    test('behandelt Timeout-Fehler korrekt', async () => {
      mockFetch.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      );

      renderWithProviders(<TransactionsPage />);

      await waitFor(() => {
        expect(screen.getByText(/timeout fehler/i)).toBeInTheDocument();
      });
    });
  });

  describe('Performance Tests', () => {
    test('lädt große Datenmengen effizient', async () => {
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
      
      renderWithProviders(<TransactionsPage />);

      await waitFor(() => {
        expect(screen.getByText('Transaction 1')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Ladezeit sollte unter 2 Sekunden liegen
      expect(loadTime).toBeLessThan(2000);
    });

    test('implementiert Pagination korrekt', async () => {
      const paginatedData = {
        transactions: Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          amount: 1000 + i,
          description: `Transaction ${i + 1}`,
          status: 'completed'
        })),
        total: 100,
        page: 1,
        limit: 10
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(paginatedData)
      });

      renderWithProviders(<TransactionsPage />);

      await waitFor(() => {
        expect(screen.getByText('1-10 von 100')).toBeInTheDocument();
      });

      // Teste nächste Seite
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          ...paginatedData,
          transactions: Array.from({ length: 10 }, (_, i) => ({
            id: i + 11,
            amount: 1000 + i + 10,
            description: `Transaction ${i + 11}`,
            status: 'completed'
          })),
          page: 2
        })
      });

      const nextButton = screen.getByText(/nächste/i);
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('11-20 von 100')).toBeInTheDocument();
      });
    });
  });

  describe('Security Tests', () => {
    test('validiert Eingabedaten vor API-Aufrufen', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ transactions: [] })
      });

      renderWithProviders(<TransactionsPage />);

      const addButton = screen.getByText(/neue transaktion/i);
      fireEvent.click(addButton);

      const amountInput = screen.getByLabelText(/betrag/i);
      
      // Teste negative Werte
      fireEvent.change(amountInput, { target: { value: '-100' } });
      
      const saveButton = screen.getByText(/speichern/i);
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/betrag muss positiv sein/i)).toBeInTheDocument();
      });

      // Teste SQL Injection
      const descriptionInput = screen.getByLabelText(/beschreibung/i);
      fireEvent.change(descriptionInput, { 
        target: { value: "'; DROP TABLE transactions; --" } 
      });

      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/ungültige eingabe/i)).toBeInTheDocument();
      });
    });

    test('verwendet sichere HTTP-Header', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ transactions: [] })
      });

      renderWithProviders(<TransactionsPage />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            })
          })
        );
      });
    });
  });
}); 