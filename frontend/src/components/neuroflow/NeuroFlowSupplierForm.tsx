/**
 * 🧠 NeuroFlow Supplier Form
 * KI-first, responsive-first Lieferantenstammdaten-Formular für ERP-Systeme
 * Fehlerfreier TypeScript-Code mit vollständiger Validierung
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
  Chip,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  Skeleton,
  CircularProgress,
  Tabs,
  Tab,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Business as BusinessIcon,
  ContactPhone as ContactIcon,
  LocationOn as LocationIcon,
  AccountBalance as BankIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { styled } from '@mui/material/styles';
import { NeuroFlowAutocomplete, SupplierAutocomplete } from './NeuroFlowAutocomplete';

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

// Zod Schema für Lieferantenstammdaten
const SupplierSchema = z.object({
  // Grunddaten
  supplier_number: z.string().min(1, 'Lieferantennummer ist erforderlich'),
  company_name: z.string().min(2, 'Firmenname muss mindestens 2 Zeichen lang sein'),
  legal_form: z.enum(['GmbH', 'AG', 'KG', 'OHG', 'Einzelunternehmen', 'Gbr', 'e.V.', 'Sonstige']),
  tax_number: z.string().optional(),
  vat_number: z.string().optional(),
  commercial_register: z.string().optional(),
  
  // Kontaktdaten
  contact_person: z.string().min(1, 'Ansprechpartner ist erforderlich'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  phone: z.string().min(1, 'Telefonnummer ist erforderlich'),
  fax: z.string().optional(),
  website: z.string().url('Ungültige Website-URL').optional().or(z.literal('')),
  
  // Adressdaten
  street: z.string().min(1, 'Straße ist erforderlich'),
  house_number: z.string().min(1, 'Hausnummer ist erforderlich'),
  postal_code: z.string().min(5, 'PLZ muss mindestens 5 Zeichen lang sein'),
  city: z.string().min(1, 'Stadt ist erforderlich'),
  country: z.string().min(1, 'Land ist erforderlich'),
  
  // Bankdaten
  bank_name: z.string().optional(),
  iban: z.string().optional(),
  bic: z.string().optional(),
  account_holder: z.string().optional(),
  
  // Geschäftsdaten
  industry: z.enum(['Elektronik', 'Bürobedarf', 'Werkzeuge', 'Verbrauchsmaterial', 'Dienstleistungen', 'Software', 'Hardware', 'Sonstige']),
  supplier_type: z.enum(['Hauptlieferant', 'Nebenlieferant', 'Notfalllieferant', 'Exklusivlieferant']),
  payment_terms: z.number().min(0, 'Zahlungsziel darf nicht negativ sein'),
  credit_limit: z.number().min(0, 'Kreditlimit darf nicht negativ sein'),
  discount_percentage: z.number().min(0, 'Rabatt darf nicht negativ sein').max(100, 'Rabatt darf nicht über 100% sein'),
  
  // Bewertung
  rating: z.number().min(1, 'Bewertung muss mindestens 1 sein').max(5, 'Bewertung darf maximal 5 sein'),
  reliability_score: z.number().min(0, 'Zuverlässigkeits-Score darf nicht negativ sein').max(100, 'Zuverlässigkeits-Score darf nicht über 100 sein'),
  quality_score: z.number().min(0, 'Qualitäts-Score darf nicht negativ sein').max(100, 'Qualitäts-Score darf nicht über 100 sein'),
  delivery_score: z.number().min(0, 'Liefer-Score darf nicht negativ sein').max(100, 'Liefer-Score darf nicht über 100 sein'),
  
  // Status
  status: z.enum(['active', 'inactive', 'blocked', 'prospect']),
  is_preferred: z.boolean(),
  is_certified: z.boolean(),
  is_local: z.boolean(),
  
  // ERP-spezifische Felder
  sales_rep: z.string().optional(),
  cost_center: z.string().optional(),
  notes: z.string().optional(),
  
  // Lieferdaten
  average_delivery_time: z.number().min(0, 'Durchschnittliche Lieferzeit darf nicht negativ sein'),
  minimum_order_value: z.number().min(0, 'Mindestbestellwert darf nicht negativ sein'),
  free_shipping_threshold: z.number().min(0, 'Kostenlose Lieferung ab darf nicht negativ sein'),
  
  // Zertifizierungen
  iso_9001: z.boolean(),
  iso_14001: z.boolean(),
  other_certifications: z.string().optional(),
});

type SupplierFormData = z.infer<typeof SupplierSchema>;

// Mock Data
const mockLegalForms = [
  { value: 'GmbH', label: 'GmbH' },
  { value: 'AG', label: 'Aktiengesellschaft (AG)' },
  { value: 'KG', label: 'Kommanditgesellschaft (KG)' },
  { value: 'OHG', label: 'Offene Handelsgesellschaft (OHG)' },
  { value: 'Einzelunternehmen', label: 'Einzelunternehmen' },
  { value: 'Gbr', label: 'Gesellschaft bürgerlichen Rechts (GbR)' },
  { value: 'e.V.', label: 'Eingetragener Verein (e.V.)' },
  { value: 'Sonstige', label: 'Sonstige' },
];

const mockIndustries = [
  { value: 'Elektronik', label: 'Elektronik' },
  { value: 'Bürobedarf', label: 'Bürobedarf' },
  { value: 'Werkzeuge', label: 'Werkzeuge' },
  { value: 'Verbrauchsmaterial', label: 'Verbrauchsmaterial' },
  { value: 'Dienstleistungen', label: 'Dienstleistungen' },
  { value: 'Software', label: 'Software' },
  { value: 'Hardware', label: 'Hardware' },
  { value: 'Sonstige', label: 'Sonstige' },
];

const mockSupplierTypes = [
  { value: 'Hauptlieferant', label: 'Hauptlieferant', color: 'success' },
  { value: 'Nebenlieferant', label: 'Nebenlieferant', color: 'primary' },
  { value: 'Notfalllieferant', label: 'Notfalllieferant', color: 'warning' },
  { value: 'Exklusivlieferant', label: 'Exklusivlieferant', color: 'secondary' },
];

// NeuroFlow Supplier Form Component
interface NeuroFlowSupplierFormProps {
  initialData?: Partial<SupplierFormData>;
  onSubmit?: (data: SupplierFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  mode?: 'create' | 'edit';
}

export const NeuroFlowSupplierForm: React.FC<NeuroFlowSupplierFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  mode = 'create',
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [submitLoading, setSubmitLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<SupplierFormData>({
    resolver: zodResolver(SupplierSchema),
    defaultValues: {
      supplier_number: '',
      company_name: '',
      legal_form: 'GmbH',
      tax_number: '',
      vat_number: '',
      commercial_register: '',
      contact_person: '',
      email: '',
      phone: '',
      fax: '',
      website: '',
      street: '',
      house_number: '',
      postal_code: '',
      city: '',
      country: 'Deutschland',
      bank_name: '',
      iban: '',
      bic: '',
      account_holder: '',
      industry: 'Elektronik',
      supplier_type: 'Nebenlieferant',
      payment_terms: 30,
      credit_limit: 0,
      discount_percentage: 0,
      rating: 3,
      reliability_score: 75,
      quality_score: 75,
      delivery_score: 75,
      status: 'active',
      is_preferred: false,
      is_certified: false,
      is_local: false,
      sales_rep: '',
      cost_center: '',
      notes: '',
      average_delivery_time: 7,
      minimum_order_value: 0,
      free_shipping_threshold: 0,
      iso_9001: false,
      iso_14001: false,
      other_certifications: '',
      ...initialData,
    },
  });

  const handleFormSubmit: SubmitHandler<SupplierFormData> = async (data) => {
    setSubmitLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(data);
      }
      console.log('Supplier saved:', data);
    } catch (error) {
      console.error('Error saving supplier:', error);
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

  const generateSupplierNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const supplierNumber = `L${year}${month}-${random}`;
    setValue('supplier_number', supplierNumber);
  };

  const tabs = [
    { label: 'Grunddaten', icon: <BusinessIcon /> },
    { label: 'Kontaktdaten', icon: <ContactIcon /> },
    { label: 'Adressdaten', icon: <LocationIcon /> },
    { label: 'Bankdaten', icon: <BankIcon /> },
    { label: 'Geschäftsdaten', icon: <AssessmentIcon /> },
    { label: 'Bewertung', icon: <AssessmentIcon /> },
    { label: 'Lieferdaten', icon: <ShippingIcon /> },
    { label: 'Zertifizierungen', icon: <SettingsIcon /> },
  ];

  return (
    <NeuroFlowCard>
      <CardContent>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <BusinessIcon color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h5" fontWeight={600} color="text.primary">
                {mode === 'create' ? 'Neuer Lieferant' : 'Lieferant bearbeiten'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Erstellen Sie einen neuen Lieferantenstammsatz mit allen erforderlichen Informationen
              </Typography>
            </Box>
          </Box>
          
          <Stack direction="row" spacing={1}>
            <Tooltip title="Lieferantennummer generieren">
              <IconButton onClick={generateSupplierNumber} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  label={tab.label}
                  icon={tab.icon}
                  iconPosition="start"
                  sx={{ minHeight: 64 }}
                />
              ))}
            </Tabs>
          </Box>

          {/* Tab Content */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              {/* Lieferantennummer */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="supplier_number"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Lieferantennummer *"
                      fullWidth
                      error={!!errors.supplier_number}
                      helperText={errors.supplier_number?.message}
                      InputProps={{
                        startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Firmenname */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="company_name"
                  control={control}
                  render={({ field }) => (
                    <NeuroFlowAutocomplete
                      label="Firmenname *"
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      type="supplier"
                      placeholder="Firmenname eingeben..."
                      error={!!errors.company_name}
                      helperText={errors.company_name?.message}
                      onLoadOptions={async (query) => {
                        // Mock data - in Produktion durch echte API ersetzen
                        const mockSuppliers = [
                          { id: '1', value: 'Agrarhandel GmbH', label: 'Agrarhandel GmbH', type: 'supplier' as const, metadata: { category: 'Landhandel' } },
                          { id: '2', value: 'Futtermittel AG', label: 'Futtermittel AG', type: 'supplier' as const, metadata: { category: 'Futtermittel' } },
                          { id: '3', value: 'Dünger & Co KG', label: 'Dünger & Co KG', type: 'supplier' as const, metadata: { category: 'Düngemittel' } },
                        ];
                        return mockSuppliers.filter(s => 
                          s.label.toLowerCase().includes(query.toLowerCase())
                        );
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Rechtsform */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="legal_form"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.legal_form}>
                      <InputLabel>Rechtsform *</InputLabel>
                      <Select {...field} label="Rechtsform *">
                        {mockLegalForms.map((form) => (
                          <MenuItem key={form.value} value={form.value}>
                            {form.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.legal_form && (
                        <FormHelperText>{errors.legal_form.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Branche */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="industry"
                  control={control}
                  render={({ field }) => (
                    <NeuroFlowAutocomplete
                      label="Branche *"
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      type="supplier"
                      placeholder="Branche auswählen..."
                      error={!!errors.industry}
                      helperText={errors.industry?.message}
                      customOptions={mockIndustries.map(industry => ({
                        id: industry.value,
                        value: industry.value,
                        label: industry.label,
                        type: 'supplier' as const,
                        metadata: { category: 'Branche' }
                      }))}
                    />
                  )}
                />
              </Grid>

              {/* Steuernummer */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="tax_number"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Steuernummer"
                      fullWidth
                      error={!!errors.tax_number}
                      helperText={errors.tax_number?.message}
                    />
                  )}
                />
              </Grid>

              {/* USt-ID */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="vat_number"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="USt-ID"
                      fullWidth
                      error={!!errors.vat_number}
                      helperText={errors.vat_number?.message}
                    />
                  )}
                />
              </Grid>

              {/* Handelsregister */}
              <Grid item xs={12}>
                <Controller
                  name="commercial_register"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Handelsregister"
                      fullWidth
                      error={!!errors.commercial_register}
                      helperText={errors.commercial_register?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Grid container spacing={3}>
              {/* Ansprechpartner */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="contact_person"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Ansprechpartner *"
                      fullWidth
                      error={!!errors.contact_person}
                      helperText={errors.contact_person?.message}
                      InputProps={{
                        startAdornment: <ContactIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  )}
                />
              </Grid>

              {/* E-Mail */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="E-Mail *"
                      type="email"
                      fullWidth
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      InputProps={{
                        startAdornment: <ContactIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Telefon */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Telefon *"
                      fullWidth
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                      InputProps={{
                        startAdornment: <ContactIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Fax */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="fax"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Fax"
                      fullWidth
                      error={!!errors.fax}
                      helperText={errors.fax?.message}
                    />
                  )}
                />
              </Grid>

              {/* Website */}
              <Grid item xs={12}>
                <Controller
                  name="website"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Website"
                      fullWidth
                      error={!!errors.website}
                      helperText={errors.website?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          )}

          {activeTab === 2 && (
            <Grid container spacing={3}>
              {/* Straße */}
              <Grid item xs={12} md={8}>
                <Controller
                  name="street"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Straße *"
                      fullWidth
                      error={!!errors.street}
                      helperText={errors.street?.message}
                      InputProps={{
                        startAdornment: <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Hausnummer */}
              <Grid item xs={12} md={4}>
                <Controller
                  name="house_number"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Hausnummer *"
                      fullWidth
                      error={!!errors.house_number}
                      helperText={errors.house_number?.message}
                    />
                  )}
                />
              </Grid>

              {/* PLZ */}
              <Grid item xs={12} md={4}>
                <Controller
                  name="postal_code"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="PLZ *"
                      fullWidth
                      error={!!errors.postal_code}
                      helperText={errors.postal_code?.message}
                    />
                  )}
                />
              </Grid>

              {/* Stadt */}
              <Grid item xs={12} md={4}>
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Stadt *"
                      fullWidth
                      error={!!errors.city}
                      helperText={errors.city?.message}
                    />
                  )}
                />
              </Grid>

              {/* Land */}
              <Grid item xs={12} md={4}>
                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Land *"
                      fullWidth
                      error={!!errors.country}
                      helperText={errors.country?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          )}

          {activeTab === 3 && (
            <Grid container spacing={3}>
              {/* Bankname */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="bank_name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Bankname"
                      fullWidth
                      error={!!errors.bank_name}
                      helperText={errors.bank_name?.message}
                      InputProps={{
                        startAdornment: <BankIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Kontoinhaber */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="account_holder"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Kontoinhaber"
                      fullWidth
                      error={!!errors.account_holder}
                      helperText={errors.account_holder?.message}
                    />
                  )}
                />
              </Grid>

              {/* IBAN */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="iban"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="IBAN"
                      fullWidth
                      error={!!errors.iban}
                      helperText={errors.iban?.message}
                    />
                  )}
                />
              </Grid>

              {/* BIC */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="bic"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="BIC"
                      fullWidth
                      error={!!errors.bic}
                      helperText={errors.bic?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          )}

          {activeTab === 4 && (
            <Grid container spacing={3}>
              {/* Lieferantentyp */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="supplier_type"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.supplier_type}>
                      <InputLabel>Lieferantentyp *</InputLabel>
                      <Select {...field} label="Lieferantentyp *">
                        {mockSupplierTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            <Chip
                              label={type.label}
                              size="small"
                              color={type.color as any}
                              sx={{ mr: 1 }}
                            />
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.supplier_type && (
                        <FormHelperText>{errors.supplier_type.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Zahlungsziel */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="payment_terms"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Zahlungsziel (Tage) *"
                      type="number"
                      fullWidth
                      error={!!errors.payment_terms}
                      helperText={errors.payment_terms?.message}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      InputProps={{
                        startAdornment: <PaymentIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Kreditlimit */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="credit_limit"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Kreditlimit (€) *"
                      type="number"
                      fullWidth
                      error={!!errors.credit_limit}
                      helperText={errors.credit_limit?.message}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      InputProps={{
                        startAdornment: <PaymentIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Rabatt */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="discount_percentage"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Rabatt (%) *"
                      type="number"
                      fullWidth
                      error={!!errors.discount_percentage}
                      helperText={errors.discount_percentage?.message}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      InputProps={{
                        startAdornment: <PaymentIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Status */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.status}>
                      <InputLabel>Status *</InputLabel>
                      <Select {...field} label="Status *">
                        <MenuItem value="active">
                          <Chip label="Aktiv" color="success" size="small" sx={{ mr: 1 }} />
                          Aktiv
                        </MenuItem>
                        <MenuItem value="inactive">
                          <Chip label="Inaktiv" color="default" size="small" sx={{ mr: 1 }} />
                          Inaktiv
                        </MenuItem>
                        <MenuItem value="blocked">
                          <Chip label="Gesperrt" color="error" size="small" sx={{ mr: 1 }} />
                          Gesperrt
                        </MenuItem>
                        <MenuItem value="prospect">
                          <Chip label="Interessent" color="warning" size="small" sx={{ mr: 1 }} />
                          Interessent
                        </MenuItem>
                      </Select>
                      {errors.status && (
                        <FormHelperText>{errors.status.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Vertriebsmitarbeiter */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="sales_rep"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Vertriebsmitarbeiter"
                      fullWidth
                      error={!!errors.sales_rep}
                      helperText={errors.sales_rep?.message}
                    />
                  )}
                />
              </Grid>

              {/* Lieferanten-Flags */}
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Lieferanten-Eigenschaften
                </Typography>
                <Stack direction="row" spacing={3}>
                  <Controller
                    name="is_preferred"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value}
                            onChange={field.onChange}
                            color="success"
                          />
                        }
                        label="Bevorzugter Lieferant"
                      />
                    )}
                  />
                  <Controller
                    name="is_certified"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value}
                            onChange={field.onChange}
                            color="primary"
                          />
                        }
                        label="Zertifiziert"
                      />
                    )}
                  />
                  <Controller
                    name="is_local"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value}
                            onChange={field.onChange}
                            color="info"
                          />
                        }
                        label="Lokaler Lieferant"
                      />
                    )}
                  />
                </Stack>
              </Grid>
            </Grid>
          )}

          {activeTab === 5 && (
            <Grid container spacing={3}>
              {/* Bewertung */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="rating"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.rating}>
                      <InputLabel>Bewertung (1-5) *</InputLabel>
                      <Select {...field} label="Bewertung (1-5) *">
                        <MenuItem value={1}>1 - Sehr schlecht</MenuItem>
                        <MenuItem value={2}>2 - Schlecht</MenuItem>
                        <MenuItem value={3}>3 - Durchschnittlich</MenuItem>
                        <MenuItem value={4}>4 - Gut</MenuItem>
                        <MenuItem value={5}>5 - Sehr gut</MenuItem>
                      </Select>
                      {errors.rating && (
                        <FormHelperText>{errors.rating.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Zuverlässigkeits-Score */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="reliability_score"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Zuverlässigkeits-Score (0-100) *"
                      type="number"
                      fullWidth
                      error={!!errors.reliability_score}
                      helperText={errors.reliability_score?.message}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>

              {/* Qualitäts-Score */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="quality_score"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Qualitäts-Score (0-100) *"
                      type="number"
                      fullWidth
                      error={!!errors.quality_score}
                      helperText={errors.quality_score?.message}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>

              {/* Liefer-Score */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="delivery_score"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Liefer-Score (0-100) *"
                      type="number"
                      fullWidth
                      error={!!errors.delivery_score}
                      helperText={errors.delivery_score?.message}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>
            </Grid>
          )}

          {activeTab === 6 && (
            <Grid container spacing={3}>
              {/* Durchschnittliche Lieferzeit */}
              <Grid item xs={12} md={4}>
                <Controller
                  name="average_delivery_time"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Durchschnittliche Lieferzeit (Tage) *"
                      type="number"
                      fullWidth
                      error={!!errors.average_delivery_time}
                      helperText={errors.average_delivery_time?.message}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      InputProps={{
                        startAdornment: <ShippingIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Mindestbestellwert */}
              <Grid item xs={12} md={4}>
                <Controller
                  name="minimum_order_value"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Mindestbestellwert (€) *"
                      type="number"
                      fullWidth
                      error={!!errors.minimum_order_value}
                      helperText={errors.minimum_order_value?.message}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      InputProps={{
                        startAdornment: <PaymentIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Kostenlose Lieferung ab */}
              <Grid item xs={12} md={4}>
                <Controller
                  name="free_shipping_threshold"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Kostenlose Lieferung ab (€) *"
                      type="number"
                      fullWidth
                      error={!!errors.free_shipping_threshold}
                      helperText={errors.free_shipping_threshold?.message}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      InputProps={{
                        startAdornment: <ShippingIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          )}

          {activeTab === 7 && (
            <Grid container spacing={3}>
              {/* ISO-Zertifizierungen */}
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Zertifizierungen
                </Typography>
                <Stack direction="row" spacing={3} mb={3}>
                  <Controller
                    name="iso_9001"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value}
                            onChange={field.onChange}
                            color="primary"
                          />
                        }
                        label="ISO 9001 (Qualitätsmanagement)"
                      />
                    )}
                  />
                  <Controller
                    name="iso_14001"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value}
                            onChange={field.onChange}
                            color="success"
                          />
                        }
                        label="ISO 14001 (Umweltmanagement)"
                      />
                    )}
                  />
                </Stack>
              </Grid>

              {/* Weitere Zertifizierungen */}
              <Grid item xs={12}>
                <Controller
                  name="other_certifications"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Weitere Zertifizierungen"
                      multiline
                      rows={4}
                      fullWidth
                      error={!!errors.other_certifications}
                      helperText={errors.other_certifications?.message}
                      placeholder="Zusätzliche Zertifizierungen, Qualitätsstandards, etc."
                    />
                  )}
                />
              </Grid>

              {/* Notizen */}
              <Grid item xs={12}>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Notizen"
                      multiline
                      rows={4}
                      fullWidth
                      error={!!errors.notes}
                      helperText={errors.notes?.message}
                      placeholder="Zusätzliche Informationen, Besonderheiten, etc."
                    />
                  )}
                />
              </Grid>
            </Grid>
          )}

          {/* Form Actions */}
          <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
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
              {submitLoading ? 'Speichern...' : 'Lieferant speichern'}
            </NeuroFlowButton>
          </Box>
        </form>
      </CardContent>
    </NeuroFlowCard>
  );
};

export default NeuroFlowSupplierForm; 