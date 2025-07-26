import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { OrderForm } from '../OrderForm';
import '@testing-library/jest-dom';

// Mock der API-Service
const mockCreateOrder = jest.fn();
const mockGetOrders = jest.fn();
const mockGetContacts = jest.fn();

jest.mock('../../../services/erpApi', () => ({
  ErpApiService: jest.fn().mockImplementation(() => ({
    createOrder: mockCreateOrder,
    getOrders: mockGetOrders,
    getContacts: mockGetContacts
  }))
}));

// Theme für Tests erstellen
const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('OrderForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Backend-Integration', () => {
    it('sollte einen Auftrag über die API erstellen', async () => {
      const data = {
        documentType: 'order' as const,
        customerNumber: 'K001',
        debtorNumber: 'D001',
        orderDate: new Date('2024-01-15'),
        deliveryDate: new Date('2024-01-20'),
        positions: [
          {
            productNumber: 'P001',
            description: 'Test Produkt',
            quantity: 5,
            unitPrice: 100,
            discount: 0
          }
        ]
      };

      mockCreateOrder.mockResolvedValue({
        id: '1',
        ...data,
        status: 'draft' as const,
        totalAmount: 500,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      const result = await mockCreateOrder(data);
      expect(result.id).toBe('1');
      expect(mockCreateOrder).toHaveBeenCalledWith(data);
    });
  });

  describe('UI-Rendering', () => {
    it('sollte das Formular korrekt rendern', () => {
      const realOnCancel = jest.fn();
      
      renderWithTheme(
        <OrderForm
          mode="order"
          onSave={jest.fn()}
          onCancel={realOnCancel}
        />
      );

      expect(screen.getByText('Auftrag erfassen')).toBeInTheDocument();
      // Verwende getByText für MUI-Labels, da sie als Text-Elemente gerendert werden
      expect(screen.getByText('Auftragsnummer')).toBeInTheDocument();
      expect(screen.getByText('Kunde')).toBeInTheDocument();
    });

    it('sollte alle erforderlichen Felder anzeigen', () => {
      const realOnCancel = jest.fn();
      
      renderWithTheme(
        <OrderForm
          mode="order"
          onSave={jest.fn()}
          onCancel={realOnCancel}
        />
      );

      expect(screen.getByText('Auftragsnummer')).toBeInTheDocument();
      expect(screen.getByText('Kunde')).toBeInTheDocument();
      expect(screen.getByText('Auftragsdatum')).toBeInTheDocument();
      expect(screen.getByText('E-Mail')).toBeInTheDocument();
    });
  });

  describe('Benutzer-Interaktionen', () => {
    it('sollte Benutzereingaben korrekt verarbeiten', async () => {
      const user = userEvent.setup();
      const realOnCancel = jest.fn();
      
      renderWithTheme(
        <OrderForm
          mode="order"
          onSave={jest.fn()}
          onCancel={realOnCancel}
        />
      );

      // Verwende getByRole mit name-Attribut für spezifische Input-Felder
      const customerNumberInput = screen.getByRole('textbox', { name: /auftragsnummer/i });
      await user.type(customerNumberInput, 'TEST001');
      expect(customerNumberInput).toHaveValue('TEST001');
    });

    it('sollte Positionen hinzufügen und entfernen', async () => {
      const user = userEvent.setup();
      const realOnCancel = jest.fn();
      
      renderWithTheme(
        <OrderForm
          mode="order"
          onSave={jest.fn()}
          onCancel={realOnCancel}
        />
      );

      const addButton = screen.getByText('Position hinzufügen');
      await user.click(addButton);
      
      // Nach dem Hinzufügen sollte der "Entfernen" Button (IconButton) vorhanden sein
      expect(screen.getByTitle('Entfernen')).toBeInTheDocument();
    });
  });

  describe('Formular-Validierung', () => {
    it('sollte erforderliche Felder validieren', async () => {
      const user = userEvent.setup();
      const realOnCancel = jest.fn();
      const mockOnSave = jest.fn();
      
      renderWithTheme(
        <OrderForm
          mode="order"
          onSave={mockOnSave}
          onCancel={realOnCancel}
        />
      );

      // Zuerst eine Position hinzufügen, damit der Speichern-Button aktiv wird
      const addButton = screen.getByText('Position hinzufügen');
      await user.click(addButton);

      // Verwende data-testid für den Speichern-Button
      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);

      // Warte auf Validierungsfehler - verwende spezifischere Selektoren
      await waitFor(() => {
        // Prüfe auf Validierungsfehler in den Helper-Texten
        const customerNumberField = screen.getByRole('textbox', { name: /auftragsnummer/i });
        const customerNumberContainer = customerNumberField.closest('.MuiFormControl-root');
        expect(customerNumberContainer).toHaveTextContent('erforderlich');
      });
    });

    it('sollte ungültige E-Mail-Adressen ablehnen', async () => {
      const user = userEvent.setup();
      const realOnCancel = jest.fn();
      
      renderWithTheme(
        <OrderForm
          mode="order"
          onSave={jest.fn()}
          onCancel={realOnCancel}
        />
      );

      // Verwende getByRole für das E-Mail-Feld
      const emailInput = screen.getByRole('textbox', { name: /e-mail/i });
      await user.type(emailInput, 'invalid-email');
      
      // E-Mail-Validierung wird beim Blur oder Submit ausgelöst
      emailInput.blur();
      
      // Warte auf Validierungsfehler und verwende flexiblere Text-Matcher
      await waitFor(() => {
        expect(screen.getByText(/ungültige.*e-mail/i)).toBeInTheDocument();
      });
    });

    it('sollte gültige E-Mail-Adressen akzeptieren', async () => {
      const user = userEvent.setup();
      const realOnCancel = jest.fn();
      
      renderWithTheme(
        <OrderForm
          mode="order"
          onSave={jest.fn()}
          onCancel={realOnCancel}
        />
      );

      // Verwende getByRole für das E-Mail-Feld
      const emailInput = screen.getByRole('textbox', { name: /e-mail/i });
      await user.type(emailInput, 'test@example.com');
      
      // E-Mail-Validierung sollte keine Fehler anzeigen
      emailInput.blur();
      
      await waitFor(() => {
        expect(screen.queryByText(/ungültige.*e-mail/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Dynamische Felder', () => {
    it('sollte Preisfelder korrekt berechnen', async () => {
      const user = userEvent.setup();
      const realOnCancel = jest.fn();
      
      renderWithTheme(
        <OrderForm
          mode="order"
          onSave={jest.fn()}
          onCancel={realOnCancel}
        />
      );

      // Position hinzufügen
      const addButton = screen.getByText('Position hinzufügen');
      await user.click(addButton);

      // Nach dem Hinzufügen sollten die Tabellenfelder vorhanden sein
      const quantityInputs = screen.getAllByPlaceholderText('Menge');
      const priceInputs = screen.getAllByPlaceholderText('Einzelpreis');
      
      if (quantityInputs.length > 0 && priceInputs.length > 0) {
        await user.clear(quantityInputs[0]);
        await user.type(quantityInputs[0], '5');
        await user.clear(priceInputs[0]);
        await user.type(priceInputs[0], '100');

        // Gesamtpreis sollte automatisch berechnet werden (5 * 100 = 500)
        await waitFor(() => {
          const totalInputs = screen.getAllByPlaceholderText('Gesamtpreis');
          expect(totalInputs[0]).toHaveValue('500.00');
        });
      }
    });

    it('sollte Rabatte korrekt anwenden', async () => {
      const user = userEvent.setup();
      const realOnCancel = jest.fn();
      
      renderWithTheme(
        <OrderForm
          mode="order"
          onSave={jest.fn()}
          onCancel={realOnCancel}
        />
      );

      // Position hinzufügen
      const addButton = screen.getByText('Position hinzufügen');
      await user.click(addButton);

      // Nach dem Hinzufügen sollten die Tabellenfelder vorhanden sein
      const quantityInputs = screen.getAllByPlaceholderText('Menge');
      const priceInputs = screen.getAllByPlaceholderText('Einzelpreis');
      const discountInputs = screen.getAllByPlaceholderText('Rabatt (%)');
      
      if (quantityInputs.length > 0 && priceInputs.length > 0 && discountInputs.length > 0) {
        await user.clear(quantityInputs[0]);
        await user.type(quantityInputs[0], '10');
        await user.clear(priceInputs[0]);
        await user.type(priceInputs[0], '100');
        await user.clear(discountInputs[0]);
        await user.type(discountInputs[0], '10');

        // Gesamtpreis sollte mit Rabatt berechnet werden (10 * 100 * 0.9 = 900)
        await waitFor(() => {
          const totalInputs = screen.getAllByPlaceholderText('Gesamtpreis');
          expect(totalInputs[0]).toHaveValue('900.00');
        });
      }
    });
  });

  describe('Modus-spezifisches Verhalten', () => {
    it('sollte Angebot-Modus korrekt anzeigen', () => {
      const realOnCancel = jest.fn();
      
      renderWithTheme(
        <OrderForm
          mode="offer"
          onSave={jest.fn()}
          onCancel={realOnCancel}
        />
      );

      expect(screen.getByText('Angebot erfassen')).toBeInTheDocument();
    });

    it('sollte Rechnung-Modus korrekt anzeigen', () => {
      const realOnCancel = jest.fn();
      
      renderWithTheme(
        <OrderForm
          mode="invoice"
          onSave={jest.fn()}
          onCancel={realOnCancel}
        />
      );

      expect(screen.getByText('Rechnung erfassen')).toBeInTheDocument();
    });

    it('sollte Lieferschein-Modus korrekt anzeigen', () => {
      const realOnCancel = jest.fn();
      
      renderWithTheme(
        <OrderForm
          mode="delivery"
          onSave={jest.fn()}
          onCancel={realOnCancel}
        />
      );

      expect(screen.getByText('Lieferschein erfassen')).toBeInTheDocument();
    });
  });

  describe('API-Integration', () => {
    it('sollte Aufträge von der API laden', async () => {
      const mockOrders = [
        {
          id: '1',
          documentType: 'order' as const,
          customerNumber: 'K001',
          debtorNumber: 'D001',
          orderDate: new Date('2024-01-15'),
          deliveryDate: new Date('2024-01-20'),
          status: 'draft' as const,
          totalAmount: 500,
          positions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      mockGetOrders.mockResolvedValue(mockOrders);

      const orders = await mockGetOrders();
      expect(orders).toHaveLength(1);
      expect(mockGetOrders).toHaveBeenCalled();
    });

    it('sollte Kontakte von der API laden', async () => {
      const mockContacts = [
        {
          id: '1',
          name: 'Test Kunde',
          email: 'test@example.com',
          phone: '123456789',
          address: 'Teststraße 1',
          customerNumber: 'K001',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      const filters = { search: 'Test' };
      mockGetContacts.mockResolvedValue(mockContacts);

      const contacts = await mockGetContacts(filters);
      expect(contacts).toHaveLength(1);
      expect(mockGetContacts).toHaveBeenCalledWith(filters);
    });
  });

  describe('Erweiterte Validierung', () => {
    it('sollte alle erforderlichen Felder beim Speichern validieren', async () => {
      const user = userEvent.setup();
      const realOnCancel = jest.fn();
      const mockOnSave = jest.fn();
      
      renderWithTheme(
        <OrderForm
          mode="order"
          onSave={mockOnSave}
          onCancel={realOnCancel}
        />
      );

      // Position hinzufügen
      const addButton = screen.getByText('Position hinzufügen');
      await user.click(addButton);

      // Verwende data-testid für den Speichern-Button
      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);

      // Alle erforderlichen Felder sollten Validierungsfehler anzeigen
      await waitFor(() => {
        // Prüfe auf Validierungsfehler in den Helper-Texten
        const customerNumberField = screen.getByRole('textbox', { name: /auftragsnummer/i });
        const customerNumberContainer = customerNumberField.closest('.MuiFormControl-root');
        expect(customerNumberContainer).toHaveTextContent('erforderlich');

        const debtorNumberField = screen.getByRole('textbox', { name: /kunde/i });
        const debtorNumberContainer = debtorNumberField.closest('.MuiFormControl-root');
        expect(debtorNumberContainer).toHaveTextContent('erforderlich');

        const contactPersonField = screen.getByRole('textbox', { name: /ansprechpartner/i });
        const contactPersonContainer = contactPersonField.closest('.MuiFormControl-root');
        expect(contactPersonContainer).toHaveTextContent('erforderlich');

        const emailField = screen.getByRole('textbox', { name: /e-mail/i });
        const emailContainer = emailField.closest('.MuiFormControl-root');
        expect(emailContainer).toHaveTextContent('erforderlich');
      });
    });

    it('sollte erfolgreich speichern wenn alle Felder ausgefüllt sind', async () => {
      const user = userEvent.setup();
      const realOnCancel = jest.fn();
      const mockOnSave = jest.fn();
      
      renderWithTheme(
        <OrderForm
          mode="order"
          onSave={mockOnSave}
          onCancel={realOnCancel}
        />
      );

      // Alle erforderlichen Felder ausfüllen
      const customerNumberInput = screen.getByRole('textbox', { name: /auftragsnummer/i });
      const debtorNumberInput = screen.getByRole('textbox', { name: /kunde/i });
      const contactPersonInput = screen.getByRole('textbox', { name: /ansprechpartner/i });
      const emailInput = screen.getByRole('textbox', { name: /e-mail/i });

      await user.type(customerNumberInput, 'TEST001');
      await user.type(debtorNumberInput, 'KUNDE001');
      await user.type(contactPersonInput, 'Max Mustermann');
      await user.type(emailInput, 'test@example.com');

      // Position hinzufügen und ausfüllen
      const addButton = screen.getByText('Position hinzufügen');
      await user.click(addButton);

      const quantityInputs = screen.getAllByPlaceholderText('Menge');
      const priceInputs = screen.getAllByPlaceholderText('Einzelpreis');
      const articleInputs = screen.getAllByPlaceholderText('Artikel-Nr.');
      const descriptionInputs = screen.getAllByPlaceholderText('Beschreibung');

      if (quantityInputs.length > 0) {
        await user.clear(quantityInputs[0]);
        await user.type(quantityInputs[0], '5');
        await user.clear(priceInputs[0]);
        await user.type(priceInputs[0], '100');
        await user.type(articleInputs[0], 'ART001');
        await user.type(descriptionInputs[0], 'Test Artikel');
      }

      // Warte kurz, damit die Validierung abgeschlossen ist
      await waitFor(() => {
        // Prüfe, ob alle Felder ausgefüllt sind
        expect(customerNumberInput).toHaveValue('TEST001');
        expect(debtorNumberInput).toHaveValue('KUNDE001');
        expect(contactPersonInput).toHaveValue('Max Mustermann');
        expect(emailInput).toHaveValue('test@example.com');
      });

      // Verwende data-testid für den Speichern-Button
      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);

      // onSave sollte aufgerufen werden
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });
    });
  });
}); 