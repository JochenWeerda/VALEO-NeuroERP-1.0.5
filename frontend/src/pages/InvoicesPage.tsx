import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Alert,
  Snackbar
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { InvoiceForm } from '../components/forms/InvoiceForm';
import { InvoiceTable } from '../components/tables/InvoiceTable';
import type { Invoice, Customer } from '../types/invoices';

// Mock-Daten für Demo-Zwecke
const mockCustomers: Customer[] = [
  { id: '1', name: 'Max Mustermann', email: 'max@example.com' },
  { id: '2', name: 'Anna Schmidt', email: 'anna@example.com' },
  { id: '3', name: 'Tom Weber', email: 'tom@example.com' },
];

const mockInvoices: Invoice[] = [
  {
    id: '1',
    customer_id: '1',
    amount: 1500.00,
    status: 'open',
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    customer_id: '2',
    amount: 2300.50,
    status: 'paid',
    created_at: '2024-01-14T14:20:00Z'
  },
  {
    id: '3',
    customer_id: '3',
    amount: 800.25,
    status: 'overdue',
    created_at: '2024-01-10T09:15:00Z'
  },
];

export const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [customers] = useState<Customer[]>(mockCustomers);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Snackbar-Handler
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Form-Handler
  const handleSubmit = async (invoiceData: Invoice) => {
    setIsLoading(true);
    try {
      // Simuliere API-Aufruf
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingInvoice) {
        // Update existierende Rechnung
        setInvoices(prev => prev.map(inv => 
          inv.id === editingInvoice.id ? { ...invoiceData, id: inv.id } : inv
        ));
        showSnackbar('Rechnung erfolgreich aktualisiert!', 'success');
      } else {
        // Neue Rechnung erstellen
        const newInvoice: Invoice = {
          ...invoiceData,
          id: Date.now().toString(),
          created_at: new Date().toISOString()
        };
        setInvoices(prev => [newInvoice, ...prev]);
        showSnackbar('Rechnung erfolgreich erstellt!', 'success');
      }
      
      setIsFormOpen(false);
      setEditingInvoice(undefined);
    } catch (error) {
      showSnackbar('Fehler beim Speichern der Rechnung!', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingInvoice(undefined);
  };

  // Table-Handler
  const handleView = (invoice: Invoice) => {
    showSnackbar(`Rechnung ${invoice.id} wird angezeigt`, 'info');
    // Hier könnte ein Modal oder eine neue Seite geöffnet werden
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsFormOpen(true);
  };

  const handleDelete = async (invoice: Invoice) => {
    try {
      // Simuliere API-Aufruf
      await new Promise(resolve => setTimeout(resolve, 500));
      setInvoices(prev => prev.filter(inv => inv.id !== invoice.id));
      showSnackbar('Rechnung erfolgreich gelöscht!', 'success');
    } catch (error) {
      showSnackbar('Fehler beim Löschen der Rechnung!', 'error');
    }
  };

  const handleAddNew = () => {
    setEditingInvoice(undefined);
    setIsFormOpen(true);
  };

  return (
    <Box className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <Box className="mb-6">
        <Typography variant="h4" component="h1" className="font-bold text-gray-800 mb-2">
          Rechnungsverwaltung
        </Typography>
        <Typography variant="body1" className="text-gray-600">
          Verwalten Sie Ihre Rechnungen und behalten Sie den Überblick über offene, bezahlte und überfällige Rechnungen.
        </Typography>
      </Box>

      {/* Statistiken */}
      <Box className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Box className="bg-white p-4 rounded-lg shadow border">
          <Typography variant="h6" className="text-blue-600 font-semibold">
            {invoices.length}
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            Gesamt Rechnungen
          </Typography>
        </Box>
        <Box className="bg-white p-4 rounded-lg shadow border">
          <Typography variant="h6" className="text-orange-600 font-semibold">
            {invoices.filter(inv => inv.status === 'open').length}
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            Offen
          </Typography>
        </Box>
        <Box className="bg-white p-4 rounded-lg shadow border">
          <Typography variant="h6" className="text-green-600 font-semibold">
            {invoices.filter(inv => inv.status === 'paid').length}
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            Bezahlt
          </Typography>
        </Box>
        <Box className="bg-white p-4 rounded-lg shadow border">
          <Typography variant="h6" className="text-red-600 font-semibold">
            {invoices.filter(inv => inv.status === 'overdue').length}
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            Überfällig
          </Typography>
        </Box>
      </Box>

      {/* Action Button */}
      <Box className="mb-6">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Neue Rechnung erstellen
        </Button>
      </Box>

      {/* Invoice Table */}
      <InvoiceTable
        invoices={invoices}
        customers={customers}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Form Dialog */}
      <Dialog
        open={isFormOpen}
        onClose={handleCancel}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: "max-h-[90vh] overflow-y-auto"
        }}
      >
        <DialogTitle>
          {editingInvoice ? 'Rechnung bearbeiten' : 'Neue Rechnung erstellen'}
        </DialogTitle>
        <DialogContent>
          <InvoiceForm
            initialData={editingInvoice ? { ...editingInvoice, amount: editingInvoice.amount.toString() } : undefined}
            onSubmit={async (data) => {
              const invoiceData = { ...data, amount: parseFloat(data.amount) };
              await handleSubmit(invoiceData as any);
            }}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Snackbar für Benachrichtigungen */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          className="w-full"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 