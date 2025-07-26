import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  Divider
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { formatCurrency } from '../../utils/formatters';
import { EInvoicingFormData, InvoiceItem } from '../../types/invoices';

const schema = yup.object({
  customerId: yup.string().required('Kunde ist erforderlich'),
  customerName: yup.string().required('Kundenname ist erforderlich'),
  customerEmail: yup.string().email('Ungültige E-Mail').required('E-Mail ist erforderlich'),
  amount: yup.number().positive('Betrag muss positiv sein').required('Betrag ist erforderlich'),
  taxAmount: yup.number().min(0, 'Steuerbetrag darf nicht negativ sein').required('Steuerbetrag ist erforderlich'),
  totalAmount: yup.number().positive('Gesamtbetrag muss positiv sein').required('Gesamtbetrag ist erforderlich'),
  currency: yup.string().required('Währung ist erforderlich'),
  description: yup.string().required('Beschreibung ist erforderlich'),
  dueDate: yup.string().required('Fälligkeitsdatum ist erforderlich')
});

interface EInvoicingFormProps {
  initialData?: Partial<EInvoicingFormData>;
  onSubmit: (data: EInvoicingFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

/**
 * E-Invoicing Formular Komponente
 * Erstellt und bearbeitet elektronische Rechnungen
 */
export const EInvoicingForm: React.FC<EInvoicingFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [items, setItems] = useState<InvoiceItem[]>(initialData?.items || []);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      customerId: initialData?.customerId || '',
      customerName: initialData?.customerName || '',
      customerEmail: initialData?.customerEmail || '',
      amount: initialData?.amount || 0,
      taxAmount: initialData?.taxAmount || 0,
      totalAmount: initialData?.totalAmount || 0,
      currency: initialData?.currency || 'EUR',
      description: initialData?.description || '',
      dueDate: initialData?.dueDate || new Date().toISOString().split('T')[0],
      // items: initialData?.items || []
    }
  });

  const watchedAmount = watch('amount');
  const watchedTaxAmount = watch('taxAmount');

  // Berechne Gesamtbetrag automatisch
  React.useEffect(() => {
    const total = watchedAmount + watchedTaxAmount;
    setValue('totalAmount', total);
  }, [watchedAmount, watchedTaxAmount, setValue]);

  const handleFormSubmit = async (data: any) => {
    try {
      setError(null);
      await onSubmit({
        ...data,
        items
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern der Rechnung');
    }
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      name: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      taxRate: 19, // Standard USt-Satz
      taxAmount: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // Berechne abgeleitete Werte
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
          updatedItem.taxAmount = updatedItem.totalPrice * (updatedItem.taxRate / 100);
        }
        if (field === 'taxRate') {
          updatedItem.taxAmount = updatedItem.totalPrice * (value / 100);
        }
        return updatedItem;
      }
      return item;
    }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <Typography variant="h5" className="mb-6 text-gray-800">
          {initialData ? 'Rechnung bearbeiten' : 'Neue Rechnung erstellen'}
        </Typography>

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Kundeninformationen */}
          <Box>
            <Typography variant="h6" className="mb-3 text-gray-700">
              Kundeninformationen
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="customerName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Kundenname"
                      fullWidth
                      error={!!errors.customerName}
                      helperText={errors.customerName?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="customerEmail"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="E-Mail"
                      type="email"
                      fullWidth
                      error={!!errors.customerEmail}
                      helperText={errors.customerEmail?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Rechnungsdetails */}
          <Box>
            <Typography variant="h6" className="mb-3 text-gray-700">
              Rechnungsdetails
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Beschreibung"
                      multiline
                      rows={3}
                      fullWidth
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="dueDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Fälligkeitsdatum"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.dueDate}
                      helperText={errors.dueDate?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Rechnungspositionen */}
          <Box>
            <div className="flex justify-between items-center mb-3">
              <Typography variant="h6" className="text-gray-700">
                Rechnungspositionen
              </Typography>
              <Button
                type="button"
                variant="outlined"
                onClick={addItem}
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                Position hinzufügen
              </Button>
            </div>

            {items.map((item, index) => (
              <Card key={item.id} className="mb-3 p-4 border border-gray-200">
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Bezeichnung"
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <TextField
                      label="Menge"
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <TextField
                      label="Einzelpreis"
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <TextField
                      label="Steuersatz (%)"
                      type="number"
                      value={item.taxRate}
                      onChange={(e) => updateItem(item.id, 'taxRate', Number(e.target.value))}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <div className="text-right">
                      <Typography variant="body2" className="text-gray-600">
                        Gesamt: {formatCurrency(item.totalPrice)}
                      </Typography>
                      <Typography variant="body2" className="text-gray-500">
                        Steuer: {formatCurrency(item.taxAmount)}
                      </Typography>
                    </div>
                  </Grid>
                  <Grid item xs={12} md={1}>
                    <Button
                      type="button"
                      variant="outlined"
                      color="error"
                      onClick={() => removeItem(item.id)}
                      className="w-full"
                    >
                      Löschen
                    </Button>
                  </Grid>
                </Grid>
              </Card>
            ))}
          </Box>

          <Divider />

          {/* Beträge */}
          <Box>
            <Typography variant="h6" className="mb-3 text-gray-700">
              Beträge
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nettobetrag"
                      type="number"
                      fullWidth
                      error={!!errors.amount}
                      helperText={errors.amount?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="taxAmount"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Steuerbetrag"
                      type="number"
                      fullWidth
                      error={!!errors.taxAmount}
                      helperText={errors.taxAmount?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="totalAmount"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Gesamtbetrag"
                      type="number"
                      fullWidth
                      disabled
                      error={!!errors.totalAmount}
                      helperText={errors.totalAmount?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Aktionen */}
          <Box className="flex justify-end space-x-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outlined"
                onClick={onCancel}
                disabled={isLoading}
              >
                Abbrechen
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Speichere...' : (initialData ? 'Aktualisieren' : 'Erstellen')}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default EInvoicingForm; 