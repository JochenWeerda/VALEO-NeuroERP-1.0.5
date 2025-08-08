import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { OrderForm } from '../ZvooveOrderForm';
import { ContactOverview } from '../ZvooveContactOverview';
import { zvooveApiService } from '../../../services/zvooveApi';

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

// Render-Helper mit Theme
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('Zvoove Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('✅ API Service ist verfügbar', () => {
    expect(zvooveApiService).toBeDefined();
    expect(typeof zvooveApiService.login).toBe('function');
    expect(typeof zvooveApiService.logout).toBe('function');
    expect(typeof zvooveApiService.getOrders).toBe('function');
    expect(typeof zvooveApiService.createOrder).toBe('function');
    expect(typeof zvooveApiService.getContacts).toBe('function');
    expect(typeof zvooveApiService.getSystemStatus).toBe('function');
  });

  test('✅ OrderForm rendert Header', () => {
    renderWithProviders(
      <OrderForm
        mode="order"
        onSave={() => {}}
        onCancel={() => {}}
      />
    );
    // Header kann durch Typographie-Layout getrennt sein
    const heading = screen.getByRole('heading', { name: /Auftrag\s*erfassen/i });
    expect(heading).toBeInTheDocument();
  });

  test('✅ ContactOverview rendert Tabelle', () => {
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

    renderWithProviders(
      <ContactOverview
        contacts={mockContacts}
        filters={mockFilters}
        onFilterChange={() => {}}
      />
    );
    // Prüfe auf Tabellen-Spalten der Kontaktübersicht
    expect(screen.getByRole('columnheader', { name: 'Kontakt-Nr.' })).toBeInTheDocument();
  });
}); 