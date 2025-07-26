import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Testing Library Konfiguration
configure({ testIdAttribute: 'data-testid' });

// Browser-API-Mocks für JSDOM
// (Diese sind weiterhin sinnvoll für die Testumgebung)
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

global.URL.createObjectURL = jest.fn(() => 'mock-url');

// Konsole für Tests ruhigstellen
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});

// Test-Helper Funktionen
export const createMockContact = (overrides = {}) => ({
  id: '1',
  contactNumber: 'K001',
  name: 'Max Mustermann',
  representative: 'Vertreter A',
  contactType: 'sales' as const,
  appointmentDate: null,
  orderQuantity: 100,
  remainingQuantity: 50,
  status: 'active' as const,
  phone: '+49 123 456789',
  email: 'max@example.com',
  lastContact: null,
  notes: 'Test Kontakt',
  ...overrides
});

export const createMockOrder = (overrides = {}) => ({
  id: '1',
  customerNumber: 'K001',
  debtorNumber: 'D001',
  documentDate: new Date('2024-01-15'),
  contactPerson: 'Max Mustermann',
  positions: [
    {
      id: '1',
      articleNumber: 'ART001',
      description: 'Test Artikel',
      quantity: 2,
      unit: 'Stück',
      unitPrice: 100,
      discount: 10,
      netPrice: 180
    }
  ],
  netAmount: 180,
  vatAmount: 34.2,
  totalAmount: 214.2,
  status: 'draft' as const,
  documentType: 'order' as const,
  ...overrides
});

export const createMockDelivery = (overrides = {}) => ({
  id: '1',
  deliveryNumber: 'L001',
  deliveryDate: new Date('2024-01-15'),
  deliveryTime: '10:00',
  vehicleLicensePlate: 'M-AB-1234',
  driver: 'Max Mustermann',
  invoiceStatus: 'pending' as const,
  netPrices: true,
  positions: [
    {
      id: '1',
      articleNumber: 'ART001',
      description: 'Test Artikel',
      quantity: 2,
      unit: 'Stück',
      unitPrice: 100,
      discount: 0,
      netPrice: 200
    }
  ],
  invoiceReference: 'R001',
  purchasePrice: 80,
  salesPrice: 100,
  ...overrides
}); 