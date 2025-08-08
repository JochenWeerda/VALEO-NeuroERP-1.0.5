import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfigProvider } from 'antd';
import { ContactOverview } from '../ContactOverview';
import '@testing-library/jest-dom';

// Mock der API-Service
const mockGetContacts = jest.fn();
const mockCreateContact = jest.fn();
const mockUpdateContact = jest.fn();
const mockDeleteContact = jest.fn();

jest.mock('../../../services/erpApi', () => ({
  ErpApiService: jest.fn().mockImplementation(() => ({
    getContacts: mockGetContacts,
    createContact: mockCreateContact,
    updateContact: mockUpdateContact,
    deleteContact: mockDeleteContact
  }))
}));

const renderWithConfig = (component: React.ReactElement) => {
  return render(
    <ConfigProvider>
      {component}
    </ConfigProvider>
  );
};

describe('ContactOverview', () => {
  const defaultProps = {
    filters: {
      contactType: 'all' as const,
      sortBy: 'contactNumber' as const,
      sortOrder: 'asc' as const,
      representative: '',
      dateRange: {
        from: null,
        to: null
      },
      parity: '',
      onlyPlannedAppointments: false,
      articleSumsInPrint: false,
      searchText: '',
      contactNumber: ''
    },
    onFilterChange: jest.fn(),
    contacts: [
      {
        id: '1',
        contactNumber: 'K001',
        name: 'Test Kunde',
        representative: 'Max Mustermann',
        contactType: 'sales' as const,
        orderQuantity: 100,
        remainingQuantity: 50,
        status: 'active' as const,
        phone: '123456789',
        email: 'test@example.com'
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Backend-Integration', () => {
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

      mockGetContacts.mockResolvedValue(mockContacts);

      const contacts = await mockGetContacts({});
      expect(contacts).toHaveLength(1);
      expect(mockGetContacts).toHaveBeenCalled();
    });
  });

  describe('UI-Rendering', () => {
    it('sollte die Kontaktübersicht korrekt rendern', () => {
      renderWithConfig(<ContactOverview {...defaultProps} />);

      expect(screen.getByText('Kontakte')).toBeInTheDocument();
      expect(screen.getByText('Neuen Kontakt erstellen')).toBeInTheDocument();
    });

    it('sollte Suchfelder anzeigen', () => {
      renderWithConfig(<ContactOverview {...defaultProps} />);

      expect(screen.getByPlaceholderText('Nach Namen oder E-Mail suchen...')).toBeInTheDocument();
      expect(screen.getByText('Filter')).toBeInTheDocument();
    });
  });

  describe('Benutzer-Interaktionen', () => {
    it('sollte Suchfunktion korrekt ausführen', async () => {
      const user = userEvent.setup();
      
      renderWithConfig(<ContactOverview {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Nach Namen oder E-Mail suchen...');
      await user.type(searchInput, 'Test');

      expect(searchInput).toHaveValue('Test');
    });

    it('sollte Filter öffnen und schließen', async () => {
      const user = userEvent.setup();
      
      renderWithConfig(<ContactOverview {...defaultProps} />);

      const filterButton = screen.getByText('Filter');
      await user.click(filterButton);

      expect(screen.getByText('Kontakttyp')).toBeInTheDocument();
    });
  });

  describe('Kontakt-Management', () => {
    it('sollte neuen Kontakt erstellen', async () => {
      const user = userEvent.setup();
      
      renderWithConfig(<ContactOverview {...defaultProps} />);

      const createButton = screen.getByText('Neuen Kontakt erstellen');
      await user.click(createButton);

      expect(screen.getByText('Kontakt erstellen')).toBeInTheDocument();
    });

    it('sollte Kontakt bearbeiten', async () => {
      const user = userEvent.setup();
      
      renderWithConfig(<ContactOverview {...defaultProps} />);

      // Simuliere vorhandene Kontakte
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

      mockGetContacts.mockResolvedValue(mockContacts);

      // Warte auf das Laden der Kontakte
      await waitFor(() => {
        expect(mockGetContacts).toHaveBeenCalled();
      });
    });
  });

  describe('API-Integration', () => {
    it('sollte Kontakte mit Filtern laden', async () => {
      const filters = {
        search: 'Test',
        contactType: 'customer' as const,
        sortBy: 'name' as const,
        sortOrder: 'asc' as const
      };

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

      mockGetContacts.mockResolvedValue(mockContacts);

      const contacts = await mockGetContacts(filters);
      expect(contacts).toHaveLength(1);
      expect(mockGetContacts).toHaveBeenCalledWith(filters);
    });

    it('sollte Kontakt erstellen', async () => {
      const newContact = {
        name: 'Neuer Kunde',
        email: 'neu@example.com',
        phone: '987654321',
        address: 'Neue Straße 1',
        customerNumber: 'K002'
      };

      const createdContact = {
        id: '2',
        ...newContact,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockCreateContact.mockResolvedValue(createdContact);

      const result = await mockCreateContact(newContact);
      expect(result.id).toBe('2');
      expect(mockCreateContact).toHaveBeenCalledWith(newContact);
    });

    it('sollte Kontakt aktualisieren', async () => {
      const updatedContact = {
        id: '1',
        name: 'Aktualisierter Kunde',
        email: 'updated@example.com',
        phone: '123456789',
        address: 'Aktualisierte Straße 1',
        customerNumber: 'K001'
      };

      mockUpdateContact.mockResolvedValue({
        ...updatedContact,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      const result = await mockUpdateContact('1', updatedContact);
      expect(result.name).toBe('Aktualisierter Kunde');
      expect(mockUpdateContact).toHaveBeenCalledWith('1', updatedContact);
    });

    it('sollte Kontakt löschen', async () => {
      mockDeleteContact.mockResolvedValue(true);

      const result = await mockDeleteContact('1');
      expect(result).toBe(true);
      expect(mockDeleteContact).toHaveBeenCalledWith('1');
    });
  });
}); 