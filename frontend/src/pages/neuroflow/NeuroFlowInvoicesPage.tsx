/**
 * 🧠 NeuroFlow Invoices Page
 * KI-first, responsive-first Rechnungsseite mit MCP-Integration
 */

import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Snackbar,
  Fab,
  Tooltip,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

// NeuroFlow Components
import { NeuroFlowLayout } from '../../design-system/NeuroFlowLayout';
import { 
  DataCard, 
  ActionCard, 
  EmptyState, 
  LoadingState, 
  ErrorState,
  ResponsiveGrid,
  SectionHeader 
} from '../../design-system/NeuroFlowComponents';
import NeuroFlowInvoiceForm from '../../components/neuroflow/NeuroFlowInvoiceForm';
import NeuroFlowInvoiceTable from '../../components/neuroflow/NeuroFlowInvoiceTable';

// Types
interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  invoice_date: string;
  due_date: string;
  amount: number;
  tax_rate: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  description: string;
  created_at: string;
}

// NeuroFlow Invoices Page Component
export const NeuroFlowInvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Mock data for demonstration
  const mockInvoices: Invoice[] = [
    {
      id: '1',
      invoice_number: 'INV-2024-001',
      customer_name: 'Max Mustermann GmbH',
      customer_email: 'max@mustermann.de',
      invoice_date: '2024-01-15',
      due_date: '2024-02-14',
      amount: 1500.00,
      tax_rate: 19,
      total_amount: 1785.00,
      status: 'paid',
      description: 'Webentwicklung Services',
      created_at: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      invoice_number: 'INV-2024-002',
      customer_name: 'Firma Schmidt AG',
      customer_email: 'info@schmidt.de',
      invoice_date: '2024-01-20',
      due_date: '2024-02-19',
      amount: 2500.00,
      tax_rate: 19,
      total_amount: 2975.00,
      status: 'sent',
      description: 'Beratung und Implementierung',
      created_at: '2024-01-20T14:30:00Z',
    },
    {
      id: '3',
      invoice_number: 'INV-2024-003',
      customer_name: 'Test Unternehmen',
      customer_email: 'test@unternehmen.de',
      invoice_date: '2024-01-25',
      due_date: '2024-02-24',
      amount: 800.00,
      tax_rate: 19,
      total_amount: 952.00,
      status: 'overdue',
      description: 'Support und Wartung',
      created_at: '2024-01-25T09:15:00Z',
    },
  ];

  // Load invoices
  React.useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setInvoices(mockInvoices);
      setLoading(false);
    }, 1000);
  }, []);

  // Calculate statistics
  const statistics = React.useMemo(() => {
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
    const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
    const paidAmount = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total_amount, 0);

    return {
      totalInvoices,
      paidInvoices,
      overdueInvoices,
      totalAmount,
      paidAmount,
      pendingAmount: totalAmount - paidAmount,
    };
  }, [invoices]);

  // Handle create invoice
  const handleCreateInvoice = async (data: any) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newInvoice: Invoice = {
        id: Date.now().toString(),
        ...data,
        total_amount: data.amount + (data.amount * data.tax_rate / 100),
        created_at: new Date().toISOString(),
      };
      
      setInvoices(prev => [newInvoice, ...prev]);
      setShowCreateDialog(false);
      setSnackbar({
        open: true,
        message: 'Rechnung erfolgreich erstellt',
        severity: 'success',
      });
    } catch (error) {
      setError('Fehler beim Erstellen der Rechnung');
      setSnackbar({
        open: true,
        message: 'Fehler beim Erstellen der Rechnung',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle edit invoice
  const handleEditInvoice = async (data: any) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedInvoice: Invoice = {
        ...selectedInvoice!,
        ...data,
        total_amount: data.amount + (data.amount * data.tax_rate / 100),
      };
      
      setInvoices(prev => 
        prev.map(inv => inv.id === selectedInvoice!.id ? updatedInvoice : inv)
      );
      setShowEditDialog(false);
      setSelectedInvoice(null);
      setSnackbar({
        open: true,
        message: 'Rechnung erfolgreich aktualisiert',
        severity: 'success',
      });
    } catch (error) {
      setError('Fehler beim Aktualisieren der Rechnung');
      setSnackbar({
        open: true,
        message: 'Fehler beim Aktualisieren der Rechnung',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete invoice
  const handleDeleteInvoice = async (invoice: Invoice) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setInvoices(prev => prev.filter(inv => inv.id !== invoice.id));
      setSnackbar({
        open: true,
        message: 'Rechnung erfolgreich gelöscht',
        severity: 'success',
      });
    } catch (error) {
      setError('Fehler beim Löschen der Rechnung');
      setSnackbar({
        open: true,
        message: 'Fehler beim Löschen der Rechnung',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle view invoice
  const handleViewInvoice = async (invoice: Invoice) => {
    try {
      // Generate PDF preview
      const response = await fetch(`/api/invoices/${invoice.id}/preview`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Open in new window/tab
        const newWindow = window.open(url, '_blank');
        if (!newWindow) {
          // Fallback: download the file
          const a = document.createElement('a');
          a.href = url;
          a.download = `invoice-${invoice.invoice_number}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
        
        window.URL.revokeObjectURL(url);
        console.log('Invoice preview generated:', invoice.id);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Error generating invoice preview:', err);
      alert('Fehler beim Generieren der Rechnungsvorschau');
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  if (error) {
    return (
      <NeuroFlowLayout
        title="Rechnungen"
        subtitle="Verwaltung von Kundenrechnungen"
        breadcrumbs={[{ label: 'Rechnungen' }]}
      >
        <ErrorState
          title="Fehler beim Laden der Rechnungen"
          message={error}
          retry={() => window.location.reload()}
        />
      </NeuroFlowLayout>
    );
  }

  return (
    <NeuroFlowLayout
      title="Rechnungen"
      subtitle="Verwaltung von Kundenrechnungen und Zahlungseingängen"
      breadcrumbs={[{ label: 'Rechnungen' }]}
      actions={
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateDialog(true)}
        >
          Neue Rechnung
        </Button>
      }
    >
      {/* Statistics Cards */}
      <SectionHeader
        title="Übersicht"
        subtitle="Aktuelle Statistiken und Kennzahlen"
      />
      
      <ResponsiveGrid columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}>
        <DataCard
          title="Gesamte Rechnungen"
          value={statistics.totalInvoices}
          subtitle="Alle Rechnungen"
          icon={<AddIcon />}
          color="primary"
        />
        
        <DataCard
          title="Bezahlte Rechnungen"
          value={statistics.paidInvoices}
          subtitle={`${((statistics.paidInvoices / statistics.totalInvoices) * 100).toFixed(1)}% Rate`}
          icon={<AddIcon />}
          color="success"
        />
        
        <DataCard
          title="Überfällige Rechnungen"
          value={statistics.overdueInvoices}
          subtitle="Benötigen Aufmerksamkeit"
          icon={<AddIcon />}
          color="error"
        />
        
        <DataCard
          title="Gesamtbetrag"
          value={formatCurrency(statistics.totalAmount)}
          subtitle={`${formatCurrency(statistics.paidAmount)} bezahlt`}
          icon={<AddIcon />}
          color="info"
        />
      </ResponsiveGrid>

      {/* Invoices Table */}
      <Box mt={4}>
        <NeuroFlowInvoiceTable
          onEdit={(invoice) => {
            setSelectedInvoice(invoice);
            setShowEditDialog(true);
          }}
          onDelete={handleDeleteInvoice}
          onView={handleViewInvoice}
          onCreate={() => setShowCreateDialog(true)}
          loading={loading}
        />
      </Box>

      {/* Create Invoice Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight={600}>
              Neue Rechnung erstellen
            </Typography>
            <IconButton onClick={() => setShowCreateDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <NeuroFlowInvoiceForm
            mode="create"
            onSubmit={handleCreateInvoice}
            onCancel={() => setShowCreateDialog(false)}
            loading={loading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Invoice Dialog */}
      <Dialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight={600}>
              Rechnung bearbeiten
            </Typography>
            <IconButton onClick={() => setShowEditDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <NeuroFlowInvoiceForm
              mode="edit"
              initialData={selectedInvoice}
              onSubmit={handleEditInvoice}
              onCancel={() => setShowEditDialog(false)}
              loading={loading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="Neue Rechnung"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => setShowCreateDialog(true)}
      >
        <AddIcon />
      </Fab>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </NeuroFlowLayout>
  );
};

export default NeuroFlowInvoicesPage; 