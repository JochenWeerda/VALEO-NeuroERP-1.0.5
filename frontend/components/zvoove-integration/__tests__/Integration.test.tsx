import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

// Ant Design Konfiguration für Tests
const antdConfig = {
  locale: {
    locale: 'de_DE',
    Table: {
      filterTitle: 'Filter',
      filterConfirm: 'OK',
      filterReset: 'Zurücksetzen',
      emptyText: 'Keine Daten',
    },
  },
};

// Render-Helper mit allen Providern
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {/* <ConfigProvider {...antdConfig}> */}
        {component}
      {/* </ConfigProvider> */}
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

  test('✅ OrderForm rendert korrekt', () => {
    renderWithProviders(
      <OrderForm
        mode="order"
        onSave={() => {}}
        onCancel={() => {}}
      />
    );

    expect(screen.getByText(/Auftragserfassung/i)).toBeInTheDocument();
  });

  test('✅ ContactOverview rendert korrekt', () => {
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

    expect(screen.getByText(/Kontakte/i)).toBeInTheDocument();
  });
}); 