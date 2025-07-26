/**
 * 🧠 NeuroFlow Invoice Form
 * KI-first, responsive-first Rechnungsformular mit MCP-Integration
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
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
  FormHelperText,
  Alert,
  Chip,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  Skeleton,
  CircularProgress,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  Euro as EuroIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { styled } from '@mui/material/styles';

// Styled Components
const NeuroFlowCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[1],
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const NeuroFlowButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  textTransform: 'none',
  fontWeight: 600,
  padding: '0.75rem 1.5rem',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: theme.shadows[3],
  },
}));

// Zod Schema basierend auf MCP Schema
const InvoiceSchema = z.object({
  customer_id: z.string().min(1, 'Kunde ist erforderlich'),
  invoice_number: z.string().min(1, 'Rechnungsnummer ist erforderlich'),
  invoice_date: z.string().min(1, 'Rechnungsdatum ist erforderlich'),
  due_date: z.string().min(1, 'Fälligkeitsdatum ist erforderlich'),
  amount: z.number().positive('Betrag muss positiv sein'),
  tax_rate: z.number().min(0, 'Steuersatz darf nicht negativ sein').max(100, 'Steuersatz darf nicht über 100% sein'),
  description: z.string().min(1, 'Beschreibung ist erforderlich'),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
  payment_terms: z.string().optional(),
  notes: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof InvoiceSchema>;

// Mock Data für MCP Integration
const mockCustomers = [
  { id: '1', name: 'Max Mustermann GmbH', email: 'max@mustermann.de' },
  { id: '2', name: 'Firma Schmidt AG', email: 'info@schmidt.de' },
  { id: '3', name: 'Test Unternehmen', email: 'test@unternehmen.de' },
];

const mockStatusOptions = [
  { value: 'draft', label: 'Entwurf', color: 'default' },
  { value: 'sent', label: 'Versendet', color: 'info' },
  { value: 'paid', label: 'Bezahlt', color: 'success' },
  { value: 'overdue', label: 'Überfällig', color: 'error' },
  { value: 'cancelled', label: 'Storniert', color: 'warning' },
];

// NeuroFlow Invoice Form Component
interface NeuroFlowInvoiceFormProps {
  initialData?: Partial<InvoiceFormData>;
  onSubmit?: (data: InvoiceFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  mode?: 'create' | 'edit';
}

export const NeuroFlowInvoiceForm: React.FC<NeuroFlowInvoiceFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  mode = 'create',
}) => {
  const [customers, setCustomers] = useState(mockCustomers);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(InvoiceSchema),
    defaultValues: {
      customer_id: '',
      invoice_number: '',
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: 0,
      tax_rate: 19,
      description: '',
      status: 'draft',
      payment_terms: '',
      notes: '',
      ...initialData,
    },
  });

  const watchedAmount = watch('amount');
  const watchedTaxRate = watch('tax_rate');

  // Calculate totals
  const taxAmount = (watchedAmount * watchedTaxRate) / 100;
  const totalAmount = watchedAmount + taxAmount;

  // Load customers from MCP
  useEffect(() => {
    const loadCustomers = async () => {
      setIsLoadingCustomers(true);
      try {
        // TODO: Replace with actual MCP call
        // const response = await fetch('http://localhost:8000/api/schema/customers');
        // const data = await response.json();
        // setCustomers(data.customers);
        
        // For now, use mock data
        setTimeout(() => {
          setCustomers(mockCustomers);
          setIsLoadingCustomers(false);
        }, 1000);
      } catch (error) {
        console.error('Error loading customers:', error);
        setIsLoadingCustomers(false);
      }
    };

    loadCustomers();
  }, []);

  const handleFormSubmit = async (data: InvoiceFormData) => {
    setSubmitLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(data);
      }
      // Show success message or redirect
      console.log('Invoice saved:', data);
    } catch (error) {
      console.error('Error saving invoice:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('Änderungen verwerfen?')) {
        reset();
        onCancel?.();
      }
    } else {
      onCancel?.();
    }
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const invoiceNumber = `INV-${year}${month}-${random}`;
    setValue('invoice_number', invoiceNumber);
  };

  return (
    <NeuroFlowCard>
      <CardContent>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <ReceiptIcon color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h5" fontWeight={600} color="text.primary">
                {mode === 'create' ? 'Neue Rechnung' : 'Rechnung bearbeiten'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Erstellen Sie eine neue Rechnung mit allen erforderlichen Informationen
              </Typography>
            </Box>
          </Box>
          
          <Stack direction="row" spacing={1}>
            <Tooltip title="Rechnungsnummer generieren">
              <IconButton onClick={generateInvoiceNumber} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight={600} color="text.primary" mb={2}>
                Grundinformationen
              </Typography>
            </Grid>

            {/* Customer Selection */}
            <Grid item xs={12} md={6}>
              <Controller
                name="customer_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.customer_id}>
                    <InputLabel>Kunde *</InputLabel>
                    <Select
                      {...field}
                      label="Kunde *"
                      disabled={isLoadingCustomers}
                      startAdornment={
                        isLoadingCustomers ? (
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                        ) : (
                          <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        )
                      }
                    >
                      {customers.map((customer) => (
                        <MenuItem key={customer.id} value={customer.id}>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {customer.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {customer.email}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.customer_id && (
                      <FormHelperText>{errors.customer_id.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Invoice Number */}
            <Grid item xs={12} md={6}>
              <Controller
                name="invoice_number"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Rechnungsnummer *"
                    fullWidth
                    error={!!errors.invoice_number}
                    helperText={errors.invoice_number?.message}
                    InputProps={{
                      startAdornment: <ReceiptIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                )}
              />
            </Grid>

            {/* Invoice Date */}
            <Grid item xs={12} md={6}>
              <Controller
                name="invoice_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Rechnungsdatum *"
                    type="date"
                    fullWidth
                    error={!!errors.invoice_date}
                    helperText={errors.invoice_date?.message}
                    InputProps={{
                      startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                )}
              />
            </Grid>

            {/* Due Date */}
            <Grid item xs={12} md={6}>
              <Controller
                name="due_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Fälligkeitsdatum *"
                    type="date"
                    fullWidth
                    error={!!errors.due_date}
                    helperText={errors.due_date?.message}
                    InputProps={{
                      startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                )}
              />
            </Grid>

            {/* Amount and Tax */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight={600} color="text.primary" mb={2}>
                Rechnungsdetails
              </Typography>
            </Grid>

            {/* Amount */}
            <Grid item xs={12} md={4}>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Betrag (€) *"
                    type="number"
                    fullWidth
                    error={!!errors.amount}
                    helperText={errors.amount?.message}
                    InputProps={{
                      startAdornment: <EuroIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                )}
              />
            </Grid>

            {/* Tax Rate */}
            <Grid item xs={12} md={4}>
              <Controller
                name="tax_rate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Steuersatz (%) *"
                    type="number"
                    fullWidth
                    error={!!errors.tax_rate}
                    helperText={errors.tax_rate?.message}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                )}
              />
            </Grid>

            {/* Status */}
            <Grid item xs={12} md={4}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.status}>
                    <InputLabel>Status *</InputLabel>
                    <Select {...field} label="Status *">
                      {mockStatusOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Chip
                            label={option.label}
                            size="small"
                            color={option.color as any}
                            sx={{ mr: 1 }}
                          />
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.status && (
                      <FormHelperText>{errors.status.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Totals Display */}
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  backgroundColor: 'background.secondary',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Nettobetrag
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {watchedAmount.toFixed(2)} €
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Steuer ({watchedTaxRate}%)
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {taxAmount.toFixed(2)} €
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Gesamtbetrag
                    </Typography>
                    <Typography variant="h6" fontWeight={600} color="primary.main">
                      {totalAmount.toFixed(2)} €
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Beschreibung *"
                    multiline
                    rows={3}
                    fullWidth
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    InputProps={{
                      startAdornment: <DescriptionIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                )}
              />
            </Grid>

            {/* Payment Terms */}
            <Grid item xs={12} md={6}>
              <Controller
                name="payment_terms"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Zahlungsbedingungen"
                    fullWidth
                    placeholder="z.B. Zahlbar innerhalb von 30 Tagen"
                  />
                )}
              />
            </Grid>

            {/* Notes */}
            <Grid item xs={12} md={6}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Notizen"
                    fullWidth
                    placeholder="Zusätzliche Informationen"
                  />
                )}
              />
            </Grid>

            {/* Form Actions */}
            <Grid item xs={12}>
              <Divider sx={{ my: 3 }} />
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <NeuroFlowButton
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={submitLoading}
                  startIcon={<CancelIcon />}
                >
                  Abbrechen
                </NeuroFlowButton>
                <NeuroFlowButton
                  type="submit"
                  variant="contained"
                  disabled={submitLoading || loading}
                  startIcon={submitLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  {submitLoading ? 'Speichern...' : 'Rechnung speichern'}
                </NeuroFlowButton>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </NeuroFlowCard>
  );
};

export default NeuroFlowInvoiceForm; 