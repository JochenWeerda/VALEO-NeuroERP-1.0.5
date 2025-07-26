/**
 * 🧠 NeuroFlow Customer Form
 * KI-first, responsive-first Kundenstammdaten-Formular für ERP-Systeme
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
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AccountBalance as BankIcon,
  Receipt as InvoiceIcon,
  Settings as SettingsIcon,
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

// Zod Schema für Kundenstammdaten
const CustomerSchema = z.object({
  // Grunddaten
  customer_number: z.string().min(1, 'Kundennummer ist erforderlich'),
  company_name: z.string().min(2, 'Firmenname muss mindestens 2 Zeichen lang sein'),
  legal_form: z.enum(['GmbH', 'AG', 'KG', 'OHG', 'Einzelunternehmen', 'Gbr', 'e.V.', 'Sonstige']),
  tax_number: z.string().optional(),
  vat_number: z.string().optional(),
  
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
  industry: z.enum(['Handel', 'Handwerk', 'Dienstleistung', 'Industrie', 'IT', 'Medizin', 'Bildung', 'Sonstige']),
  customer_type: z.enum(['Privatkunde', 'Geschäftskunde', 'Großkunde', 'VIP-Kunde']),
  credit_limit: z.number().min(0, 'Kreditlimit darf nicht negativ sein'),
  payment_terms: z.number().min(0, 'Zahlungsziel darf nicht negativ sein'),
  discount_percentage: z.number().min(0, 'Rabatt darf nicht negativ sein').max(100, 'Rabatt darf nicht über 100% sein'),
  
  // Status
  status: z.enum(['active', 'inactive', 'blocked', 'prospect']),
  notes: z.string().optional(),
  
  // ERP-spezifische Felder
  sales_rep: z.string().optional(),
  price_group: z.enum(['Standard', 'Großkunde', 'VIP', 'Mengenrabatt']),
  delivery_address_same: z.boolean().default(true),
  
  // Lieferadresse (falls abweichend)
  delivery_street: z.string().optional(),
  delivery_house_number: z.string().optional(),
  delivery_postal_code: z.string().optional(),
  delivery_city: z.string().optional(),
  delivery_country: z.string().optional(),
});

type CustomerFormData = z.infer<typeof CustomerSchema>;

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
  { value: 'Handel', label: 'Handel' },
  { value: 'Handwerk', label: 'Handwerk' },
  { value: 'Dienstleistung', label: 'Dienstleistung' },
  { value: 'Industrie', label: 'Industrie' },
  { value: 'IT', label: 'Informationstechnologie' },
  { value: 'Medizin', label: 'Medizin & Gesundheit' },
  { value: 'Bildung', label: 'Bildung' },
  { value: 'Sonstige', label: 'Sonstige' },
];

const mockCustomerTypes = [
  { value: 'Privatkunde', label: 'Privatkunde', color: 'default' },
  { value: 'Geschäftskunde', label: 'Geschäftskunde', color: 'primary' },
  { value: 'Großkunde', label: 'Großkunde', color: 'secondary' },
  { value: 'VIP-Kunde', label: 'VIP-Kunde', color: 'success' },
];

const mockPriceGroups = [
  { value: 'Standard', label: 'Standard' },
  { value: 'Großkunde', label: 'Großkunde' },
  { value: 'VIP', label: 'VIP' },
  { value: 'Mengenrabatt', label: 'Mengenrabatt' },
];

// NeuroFlow Customer Form Component
interface NeuroFlowCustomerFormProps {
  initialData?: Partial<CustomerFormData>;
  onSubmit?: (data: CustomerFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  mode?: 'create' | 'edit';
}

export const NeuroFlowCustomerForm: React.FC<NeuroFlowCustomerFormProps> = ({
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
  } = useForm<CustomerFormData>({
    resolver: zodResolver(CustomerSchema) as any,
    defaultValues: {
      customer_number: '',
      company_name: '',
      legal_form: 'GmbH',
      tax_number: '',
      vat_number: '',
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
      industry: 'Dienstleistung',
      customer_type: 'Geschäftskunde',
      credit_limit: 0,
      payment_terms: 30,
      discount_percentage: 0,
      status: 'active',
      notes: '',
      sales_rep: '',
      price_group: 'Standard',
      delivery_address_same: true,
      delivery_street: '',
      delivery_house_number: '',
      delivery_postal_code: '',
      delivery_city: '',
      delivery_country: 'Deutschland',
      ...initialData,
    },
  });

  const watchedDeliveryAddressSame = watch('delivery_address_same');
  const watchedStreet = watch('street');
  const watchedHouseNumber = watch('house_number');
  const watchedPostalCode = watch('postal_code');
  const watchedCity = watch('city');
  const watchedCountry = watch('country');

  // Auto-fill delivery address if same as billing
  useEffect(() => {
    if (watchedDeliveryAddressSame) {
      setValue('delivery_street', watchedStreet);
      setValue('delivery_house_number', watchedHouseNumber);
      setValue('delivery_postal_code', watchedPostalCode);
      setValue('delivery_city', watchedCity);
      setValue('delivery_country', watchedCountry);
    }
  }, [watchedDeliveryAddressSame, watchedStreet, watchedHouseNumber, watchedPostalCode, watchedCity, watchedCountry, setValue]);

  const handleFormSubmit = async (data: CustomerFormData) => {
    setSubmitLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(data);
      }
      console.log('Customer saved:', data);
    } catch (error) {
      console.error('Error saving customer:', error);
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

  const generateCustomerNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const customerNumber = `K${year}${month}-${random}`;
    setValue('customer_number', customerNumber);
  };

  const tabs = [
    { label: 'Grunddaten', icon: <PersonIcon /> },
    { label: 'Kontaktdaten', icon: <EmailIcon /> },
    { label: 'Adressdaten', icon: <LocationIcon /> },
    { label: 'Bankdaten', icon: <BankIcon /> },
    { label: 'Geschäftsdaten', icon: <BusinessIcon /> },
    { label: 'Notizen', icon: <SettingsIcon /> },
  ];

  return (
    <NeuroFlowCard>
      <CardContent>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <PersonIcon color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h5" fontWeight={600} color="text.primary">
                {mode === 'create' ? 'Neuer Kunde' : 'Kunde bearbeiten'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Erstellen Sie einen neuen Kundenstammsatz mit allen erforderlichen Informationen
              </Typography>
            </Box>
          </Box>
          
          <Stack direction="row" spacing={1}>
            <Tooltip title="Kundennummer generieren">
              <IconButton onClick={generateCustomerNumber} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <form onSubmit={handleSubmit(handleFormSubmit as any)}>
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
              {/* Kundennummer */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="customer_number"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Kundennummer *"
                      fullWidth
                      error={!!errors.customer_number}
                      helperText={errors.customer_number?.message}
                      InputProps={{
                        startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
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
                    <TextField
                      {...field}
                      label="Firmenname *"
                      fullWidth
                      error={!!errors.company_name}
                      helperText={errors.company_name?.message}
                      InputProps={{
                        startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />,
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
                    <FormControl fullWidth error={!!errors.industry}>
                      <InputLabel>Branche *</InputLabel>
                      <Select {...field} label="Branche *">
                        {mockIndustries.map((industry) => (
                          <MenuItem key={industry.value} value={industry.value}>
                            {industry.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.industry && (
                        <FormHelperText>{errors.industry.message}</FormHelperText>
                      )}
                    </FormControl>
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
                        startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
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
                        startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
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
                        startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
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
              {/* Rechnungsadresse */}
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Rechnungsadresse
                </Typography>
              </Grid>

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

              {/* Lieferadresse */}
              <Grid item xs={12}>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Lieferadresse
                </Typography>
              </Grid>

              {/* Lieferadresse gleich wie Rechnungsadresse */}
              <Grid item xs={12}>
                <Controller
                  name="delivery_address_same"
                  control={control}
                  render={({ field }) => (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Lieferadresse ist identisch mit Rechnungsadresse
                    </Alert>
                  )}
                />
              </Grid>

              {!watchedDeliveryAddressSame && (
                <>
                  <Grid item xs={12} md={8}>
                    <Controller
                      name="delivery_street"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Lieferstraße"
                          fullWidth
                          error={!!errors.delivery_street}
                          helperText={errors.delivery_street?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Controller
                      name="delivery_house_number"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Liefer-Hausnummer"
                          fullWidth
                          error={!!errors.delivery_house_number}
                          helperText={errors.delivery_house_number?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Controller
                      name="delivery_postal_code"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Liefer-PLZ"
                          fullWidth
                          error={!!errors.delivery_postal_code}
                          helperText={errors.delivery_postal_code?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Controller
                      name="delivery_city"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Liefer-Stadt"
                          fullWidth
                          error={!!errors.delivery_city}
                          helperText={errors.delivery_city?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Controller
                      name="delivery_country"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Liefer-Land"
                          fullWidth
                          error={!!errors.delivery_country}
                          helperText={errors.delivery_country?.message}
                        />
                      )}
                    />
                  </Grid>
                </>
              )}
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
              {/* Kundentyp */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="customer_type"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.customer_type}>
                      <InputLabel>Kundentyp *</InputLabel>
                      <Select {...field} label="Kundentyp *">
                        {mockCustomerTypes.map((type) => (
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
                      {errors.customer_type && (
                        <FormHelperText>{errors.customer_type.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Preiskategorie */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="price_group"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.price_group}>
                      <InputLabel>Preiskategorie *</InputLabel>
                      <Select {...field} label="Preiskategorie *">
                        {mockPriceGroups.map((group) => (
                          <MenuItem key={group.value} value={group.value}>
                            {group.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.price_group && (
                        <FormHelperText>{errors.price_group.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Kreditlimit */}
              <Grid item xs={12} md={4}>
                <Controller
                  name="credit_limit"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Kreditlimit (€)"
                      type="number"
                      fullWidth
                      error={!!errors.credit_limit}
                      helperText={errors.credit_limit?.message}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>

              {/* Zahlungsziel */}
              <Grid item xs={12} md={4}>
                <Controller
                  name="payment_terms"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Zahlungsziel (Tage)"
                      type="number"
                      fullWidth
                      error={!!errors.payment_terms}
                      helperText={errors.payment_terms?.message}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>

              {/* Rabatt */}
              <Grid item xs={12} md={4}>
                <Controller
                  name="discount_percentage"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Rabatt (%)"
                      type="number"
                      fullWidth
                      error={!!errors.discount_percentage}
                      helperText={errors.discount_percentage?.message}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
            </Grid>
          )}

          {activeTab === 5 && (
            <Grid container spacing={3}>
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
                      rows={6}
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
              {submitLoading ? 'Speichern...' : 'Kunde speichern'}
            </NeuroFlowButton>
          </Box>
        </form>
      </CardContent>
    </NeuroFlowCard>
  );
};

export default NeuroFlowCustomerForm; 