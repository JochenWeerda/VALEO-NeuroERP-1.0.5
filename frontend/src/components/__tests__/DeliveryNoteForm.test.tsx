import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { DeliveryNoteForm } from '../erp/DeliveryNoteForm';
import { DeliveryNoteMasterData, DeliveryNotePosition } from '../../types/erp';
import { Supplier } from '../../types/crm';

// Theme für Tests
const theme = createTheme();

// Mock-Daten für Tests
const mockSuppliers: Supplier[] = [
  {
    id: '1',
    supplierNumber: 'SUP001',
    name: 'Test Lieferant 1',
    status: 'active' as any,
    category: 'manufacturer' as any,
    address: { street: 'Teststr. 1', zipCode: '12345', city: 'Teststadt', country: 'Deutschland' },
    phone: '+49 123 456789',
    purchasingRep: 'Test User',
    paymentTerms: '30 Tage',
    creditLimit: 50000,
    rating: 4,
    reliability: 'high',
    deliveryTime: 7,
    qualityRating: 8,
    totalSpent: 100000,
    openInvoices: 1,
    overdueInvoices: 0,
    creditUsed: 10000,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: 'test'
  }
];

const mockMasterData: DeliveryNoteMasterData = {
  lieferant: null,
  zwHaendler: '',
  lsReferenzNr: '',
  bearbeiter: '',
  datum: '2024-01-15',
  erledigt: false,
  lsNr: 'LS-001'
};

const mockPositions: DeliveryNotePosition[] = [
  {
    posNr: 1,
    artikelNr: 'ART001',
    lieferantenArtNr: 'SUP-ART-001',
    artikelbezeichnung: 'Test Artikel 1',
    gebindeNr: 'GB001',
    gebinde: '10 Stück',
    menge: 100,
    einheit: 'Stück',
    ekPreis: 15.50,
    niederlassung: 'Hamburg',
    lagerhalle: 'HALLE-A',
    lagerfach: 'A-01-01',
    charge: 'CH001',
    kontakt: 'Test Kontakt',
    preiscode: 'PC001',
    masterNr: 'MASTER001'
  }
];

// Mock-Funktionen
const mockOnChangeMasterData = jest.fn();
const mockOnChangePositions = jest.fn();
const mockOnSubmit = jest.fn();
const mockOnCancel = jest.fn();

// Test-Wrapper mit Theme
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('DeliveryNoteForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rendert das Formular korrekt', () => {
    renderWithTheme(
      <DeliveryNoteForm
        masterData={mockMasterData}
        positions={mockPositions}
        suppliers={mockSuppliers}
        onChangeMasterData={mockOnChangeMasterData}
        onChangePositions={mockOnChangePositions}
        onSubmit={mockOnSubmit}
      />
    );

    // Prüfe, ob alle wichtigen Elemente gerendert werden
    expect(screen.getByText('Lieferanten-Lieferschein')).toBeInTheDocument();
    expect(screen.getByLabelText('Lieferant')).toBeInTheDocument();
    expect(screen.getByLabelText('ZW-Händler')).toBeInTheDocument();
    expect(screen.getByLabelText('LS-Referenz-Nr.')).toBeInTheDocument();
    expect(screen.getByLabelText('Bearbeiter')).toBeInTheDocument();
    expect(screen.getByLabelText('Datum')).toBeInTheDocument();
    expect(screen.getByLabelText('Erledigt')).toBeInTheDocument();
    expect(screen.getByLabelText('LS-Nr.')).toBeInTheDocument();
    expect(screen.getByText('Positionen')).toBeInTheDocument();
    expect(screen.getByText('Speichern')).toBeInTheDocument();
  });

  it('zeigt Loading-State korrekt an', () => {
    renderWithTheme(
      <DeliveryNoteForm
        masterData={mockMasterData}
        positions={mockPositions}
        suppliers={mockSuppliers}
        loading={true}
        onChangeMasterData={mockOnChangeMasterData}
        onChangePositions={mockOnChangePositions}
        onSubmit={mockOnSubmit}
      />
    );

    // Prüfe, ob Loading-Spinner angezeigt wird
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('zeigt Error-Message korrekt an', () => {
    const errorMessage = 'Test-Fehlermeldung';
    
    renderWithTheme(
      <DeliveryNoteForm
        masterData={mockMasterData}
        positions={mockPositions}
        suppliers={mockSuppliers}
        error={errorMessage}
        onChangeMasterData={mockOnChangeMasterData}
        onChangePositions={mockOnChangePositions}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('ruft onChangeMasterData auf, wenn Stammdaten geändert werden', () => {
    renderWithTheme(
      <DeliveryNoteForm
        masterData={mockMasterData}
        positions={mockPositions}
        suppliers={mockSuppliers}
        onChangeMasterData={mockOnChangeMasterData}
        onChangePositions={mockOnChangePositions}
        onSubmit={mockOnSubmit}
      />
    );

    // Ändere ZW-Händler
    const zwHaendlerInput = screen.getByLabelText('ZW-Händler');
    fireEvent.change(zwHaendlerInput, { target: { value: 'Neuer ZW-Händler' } });

    expect(mockOnChangeMasterData).toHaveBeenCalledWith({
      zwHaendler: 'Neuer ZW-Händler'
    });
  });

  it('ruft onSubmit auf, wenn Formular abgesendet wird', () => {
    renderWithTheme(
      <DeliveryNoteForm
        masterData={mockMasterData}
        positions={mockPositions}
        suppliers={mockSuppliers}
        onChangeMasterData={mockOnChangeMasterData}
        onChangePositions={mockOnChangePositions}
        onSubmit={mockOnSubmit}
      />
    );

    // Klicke auf Speichern-Button
    const submitButton = screen.getByText('Speichern');
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('ruft onCancel auf, wenn Abbrechen-Button geklickt wird', () => {
    renderWithTheme(
      <DeliveryNoteForm
        masterData={mockMasterData}
        positions={mockPositions}
        suppliers={mockSuppliers}
        onChangeMasterData={mockOnChangeMasterData}
        onChangePositions={mockOnChangePositions}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Klicke auf Abbrechen-Button
    const cancelButton = screen.getByText('Abbrechen');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('zeigt Lieferanten-Auswahl korrekt an', async () => {
    renderWithTheme(
      <DeliveryNoteForm
        masterData={mockMasterData}
        positions={mockPositions}
        suppliers={mockSuppliers}
        onChangeMasterData={mockOnChangeMasterData}
        onChangePositions={mockOnChangePositions}
        onSubmit={mockOnSubmit}
      />
    );

    // Öffne Lieferanten-Auswahl
    const lieferantInput = screen.getByLabelText('Lieferant');
    fireEvent.click(lieferantInput);

    // Warte auf Dropdown und prüfe Optionen
    await waitFor(() => {
      expect(screen.getByText('Test Lieferant 1')).toBeInTheDocument();
    });
  });

  it('zeigt Positionen in der DataGrid korrekt an', () => {
    renderWithTheme(
      <DeliveryNoteForm
        masterData={mockMasterData}
        positions={mockPositions}
        suppliers={mockSuppliers}
        onChangeMasterData={mockOnChangeMasterData}
        onChangePositions={mockOnChangePositions}
        onSubmit={mockOnSubmit}
      />
    );

    // Prüfe, ob Positions-Daten in der Tabelle angezeigt werden
    expect(screen.getByText('ART001')).toBeInTheDocument();
    expect(screen.getByText('Test Artikel 1')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('15.5')).toBeInTheDocument();
  });

  it('ist responsive und funktioniert auf verschiedenen Bildschirmgrößen', () => {
    // Simuliere mobile Bildschirmgröße
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });

    renderWithTheme(
      <DeliveryNoteForm
        masterData={mockMasterData}
        positions={mockPositions}
        suppliers={mockSuppliers}
        onChangeMasterData={mockOnChangeMasterData}
        onChangePositions={mockOnChangePositions}
        onSubmit={mockOnSubmit}
      />
    );

    // Prüfe, ob das Formular auch auf kleineren Bildschirmen funktioniert
    expect(screen.getByText('Lieferanten-Lieferschein')).toBeInTheDocument();
    expect(screen.getByText('Speichern')).toBeInTheDocument();
  });
}); 