// Temporär auskommentiert - wird später implementiert
/*
import React, { useState, useEffect } from 'react';
import { Container, Typography, Alert, Snackbar } from '@mui/material';
import { DeliveryNoteForm, DeliveryNoteFormProps } from '../../components/erp/DeliveryNoteForm';
import { DeliveryNoteMasterData, DeliveryNotePosition } from '../../types/erp';
import { Supplier } from '../../types/crm';

export const IntegrationPage: React.FC = () => {
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
    }
  ];

  return (
    <Container maxWidth="xl" className="py-6">
      <Typography variant="h4" className="mb-6 text-gray-800">
        Integration Page - Temporär deaktiviert
      </Typography>
      <Alert severity="info">
        Diese Seite wird später implementiert.
      </Alert>
    </Container>
  );
};
*/

export const IntegrationPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Integration Page</h1>
      <p className="text-gray-600">Diese Seite wird später implementiert.</p>
    </div>
  );
}; 