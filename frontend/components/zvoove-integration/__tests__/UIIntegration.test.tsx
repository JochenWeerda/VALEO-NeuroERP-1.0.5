import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { OrderForm } from '../ZvooveOrderForm';
import { ContactOverview } from '../ZvooveContactOverview';
import { Navigation } from '../Navigation';
import { zvooveApiService } from '../../../services/zvooveApi';
import { useZvooveStore } from '../../../store/zvooveStore';

// Create a test theme
const theme = createTheme();

// Mock the zvooveApiService
jest.mock('../../../services/zvooveApi', () => ({
  zvooveApiService: {
    login: jest.fn(),
    logout: jest.fn(),
    getOrders: jest.fn(),
    createOrder: jest.fn(),
    getContacts: jest.fn(),
    getSystemStatus: jest.fn()
  }
}));

// Mock the zvooveStore
jest.mock('../../../store/zvooveStore', () => ({
  useZvooveStore: jest.fn(() => ({
    orders: [],
    contacts: [],
    loading: false,
    error: null,
    fetchOrders: jest.fn(),
    fetchContacts: jest.fn(),
    createOrder: jest.fn()
  }))
}));

describe('Zvoove UI Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('✅ Navigation-Komponente rendert alle Haupt-Tabs', async () => {
    render(
      <ThemeProvider theme={theme}>
        <Navigation 
          activeTab="ERFASSUNG"
          onTabChange={() => {}}
        />
      </ThemeProvider>
    );
    // Es gibt mehrere Vorkommen von "Erfassung" (Chip/Label). Wähle Tab-Rolle.
    const tab = screen.getAllByRole('tab').find(el => /Erfassung/i.test(el.textContent || ''));
    expect(tab).toBeTruthy();
  });

  test('✅ OrderForm rendert Header', async () => {
    render(
      <ThemeProvider theme={theme}>
        <OrderForm 
          mode="order"
          onSave={() => {}}
          onCancel={() => {}}
        />
      </ThemeProvider>
    );
    const heading = screen.getByRole('heading', { name: /Auftrag\s*erfassen/i });
    expect(heading).toBeInTheDocument();
  });

  test('✅ ContactOverview rendert Tabelle', async () => {
    const mockContacts = [];
    const mockFilters = {
      contactType: 'all' as const,
      sortBy: 'contactNumber' as const,
      sortOrder: 'asc' as const,
      representative: '',
      dateRange: { from: null, to: null },
      parity: '',
      onlyPlannedAppointments: false,
      articleSumsInPrint: false,
      searchText: '',
      contactNumber: ''
    };

    render(
      <ThemeProvider theme={theme}>
        <ContactOverview 
          contacts={mockContacts}
          filters={mockFilters}
          onFilterChange={() => {}}
        />
      </ThemeProvider>
    );
    expect(screen.getByRole('columnheader', { name: 'Kontakt-Nr.' })).toBeInTheDocument();
  });
}); 