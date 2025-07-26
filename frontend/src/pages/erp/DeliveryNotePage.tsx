import React, { useState } from 'react';
import { Container, Typography, Alert, Snackbar } from '@mui/material';
import { DeliveryNoteForm, DeliveryNoteFormProps } from '../../components/erp/DeliveryNoteForm';
import { DeliveryNoteMasterData, DeliveryNotePosition } from '../../types/erp';
import { Supplier } from '../../types/crm';

/**
 * Beispiel-Seite für Lieferanten-Lieferschein
 * Demonstriert die Verwendung der DeliveryNoteForm-Komponente
 */
export const DeliveryNotePage: React.FC = () => {
  // Mock-Daten für Lieferanten
  const mockSuppliers: Supplier[] = [
    {
      id: '1',
      supplierNumber: 'SUP001',
      name: 'Metallhandel Schmidt GmbH',
      status: 'active' as any,
      category: 'manufacturer' as any,
      address: { street: 'Industriestr. 15', zipCode: '12345', city: 'Hamburg', country: 'Deutschland' },
      phone: '+49 40 123456',
      purchasingRep: 'Max Mustermann',
      paymentTerms: '30 Tage',
      creditLimit: 50000,
      rating: 4,
      reliability: 'high',
      deliveryTime: 7,
      qualityRating: 8,
      totalSpent: 150000,
      openInvoices: 2,
      overdueInvoices: 0,
      creditUsed: 15000,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      createdBy: 'system'
    },
    {
      id: '2',
      supplierNumber: 'SUP002',
      name: 'Stahlwerk Müller AG',
      status: 'active' as any,
      category: 'manufacturer' as any,
      address: { street: 'Werkstr. 8', zipCode: '54321', city: 'Bremen', country: 'Deutschland' },
      phone: '+49 421 654321',
      purchasingRep: 'Anna Schmidt',
      paymentTerms: '14 Tage',
      creditLimit: 75000,
      rating: 5,
      reliability: 'high',
      deliveryTime: 5,
      qualityRating: 9,
      totalSpent: 250000,
      openInvoices: 1,
      overdueInvoices: 0,
      creditUsed: 25000,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      createdBy: 'system'
    }
  ];

  // Initiale Stammdaten
  const initialMasterData: DeliveryNoteMasterData = {
    lieferant: null,
    zwHaendler: '',
    lsReferenzNr: '',
    bearbeiter: '',
    datum: new Date().toISOString().split('T')[0],
    erledigt: false,
    lsNr: `LS-${Date.now()}`
  };

  // Initiale Positionen
  const initialPositions: DeliveryNotePosition[] = [
    {
      posNr: 1,
      artikelNr: 'ART001',
      lieferantenArtNr: 'SUP-ART-001',
      artikelbezeichnung: 'Stahlblech 2mm',
      gebindeNr: 'GB001',
      gebinde: '10 Stück',
      menge: 100,
      einheit: 'Stück',
      ekPreis: 15.50,
      niederlassung: 'Hamburg',
      lagerhalle: 'HALLE-A',
      lagerfach: 'A-01-01',
      charge: 'CH001',
      kontakt: 'Max Mustermann',
      preiscode: 'PC001',
      masterNr: 'MASTER001'
    },
    {
      posNr: 2,
      artikelNr: 'ART002',
      lieferantenArtNr: 'SUP-ART-002',
      artikelbezeichnung: 'Aluminiumprofil 50x50',
      gebindeNr: 'GB002',
      gebinde: '5 Meter',
      menge: 50,
      einheit: 'Meter',
      ekPreis: 8.75,
      niederlassung: 'Hamburg',
      lagerhalle: 'HALLE-B',
      lagerfach: 'B-02-01',
      charge: 'CH002',
      kontakt: 'Anna Schmidt',
      preiscode: 'PC002',
      masterNr: 'MASTER002'
    }
  ];

  // State
  const [masterData, setMasterData] = useState<DeliveryNoteMasterData>(initialMasterData);
  const [positions, setPositions] = useState<DeliveryNotePosition[]>(initialPositions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();

  // Handler für Stammdaten-Änderungen
  const handleMasterDataChange: DeliveryNoteFormProps['onChangeMasterData'] = (data) => {
    setMasterData(prev => ({ ...prev, ...data }));
  };

  // Handler für Positions-Änderungen
  const handlePositionsChange: DeliveryNoteFormProps['onChangePositions'] = (newPositions) => {
    setPositions(newPositions);
  };

  // Handler für Formular-Submit
  const handleSubmit = async () => {
    setLoading(true);
    setError(undefined);
    
    try {
      // Simuliere API-Call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Validierung
      if (!masterData.lieferant) {
        throw new Error('Bitte wählen Sie einen Lieferanten aus.');
      }
      
      if (positions.length === 0) {
        throw new Error('Bitte fügen Sie mindestens eine Position hinzu.');
      }
      
      // Erfolg
      setSuccessMessage('Lieferschein erfolgreich gespeichert!');
      console.log('Lieferschein-Daten:', { masterData, positions });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  // Handler für Abbrechen
  const handleCancel = () => {
    setMasterData(initialMasterData);
    setPositions(initialPositions);
    setError(undefined);
  };

  return (
    <Container maxWidth="xl" className="py-6">
      <Typography variant="h4" className="mb-6 text-gray-800">
        Lieferanten-Lieferschein
      </Typography>
      
      <DeliveryNoteForm
        masterData={masterData}
        positions={positions}
        suppliers={mockSuppliers}
        loading={loading}
        error={error}
        onChangeMasterData={handleMasterDataChange}
        onChangePositions={handlePositionsChange}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />

      {/* Success Message */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(undefined)}
      >
        <Alert onClose={() => setSuccessMessage(undefined)} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}; 