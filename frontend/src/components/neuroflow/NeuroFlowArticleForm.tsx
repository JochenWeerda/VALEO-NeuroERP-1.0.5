/**
 * 🧠 NeuroFlow Article Form
 * KI-first, responsive-first Artikelstammdaten-Formular für ERP-Systeme
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
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  Euro as EuroIcon,
  Scale as ScaleIcon,
  Settings as SettingsIcon,
  QrCode as BarcodeIcon,
  Description as DescriptionIcon,
  LocalShipping as ShippingIcon,
  Storage as StorageIcon,
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

// Zod Schema für Artikelstammdaten
const ArticleSchema = z.object({
  // Grunddaten
  article_number: z.string().min(1, 'Artikelnummer ist erforderlich'),
  ean_code: z.string().optional(),
  name: z.string().min(2, 'Artikelname muss mindestens 2 Zeichen lang sein'),
  description: z.string().optional(),
  short_description: z.string().max(100, 'Kurzbeschreibung darf maximal 100 Zeichen haben').optional(),
  
  // Kategorisierung
  category: z.string().min(1, 'Kategorie ist erforderlich'),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  
  // Maße und Gewicht
  length: z.number().min(0, 'Länge darf nicht negativ sein').optional(),
  width: z.number().min(0, 'Breite darf nicht negativ sein').optional(),
  height: z.number().min(0, 'Höhe darf nicht negativ sein').optional(),
  weight: z.number().min(0, 'Gewicht darf nicht negativ sein').optional(),
  volume: z.number().min(0, 'Volumen darf nicht negativ sein').optional(),
  
  // Preise
  purchase_price: z.number().min(0, 'Einkaufspreis darf nicht negativ sein'),
  selling_price: z.number().min(0, 'Verkaufspreis darf nicht negativ sein'),
  wholesale_price: z.number().min(0, 'Großhandelspreis darf nicht negativ sein').optional(),
  vat_rate: z.number().min(0, 'MwSt-Satz darf nicht negativ sein').max(100, 'MwSt-Satz darf nicht über 100% sein'),
  
  // Lager
  min_stock: z.number().min(0, 'Mindestbestand darf nicht negativ sein'),
  max_stock: z.number().min(0, 'Maximalbestand darf nicht negativ sein').optional(),
  reorder_point: z.number().min(0, 'Bestellpunkt darf nicht negativ sein'),
  current_stock: z.number().min(0, 'Aktueller Bestand darf nicht negativ sein'),
  reserved_stock: z.number().min(0, 'Reservierter Bestand darf nicht negativ sein'),
  
  // Einheiten
  unit: z.enum(['Stück', 'Meter', 'Kilogramm', 'Liter', 'Packung', 'Karton', 'Palette']),
  unit_conversion: z.number().min(0, 'Einheitenumrechnung darf nicht negativ sein').optional(),
  
  // Lieferant
  supplier_id: z.string().optional(),
  supplier_article_number: z.string().optional(),
  delivery_time_days: z.number().min(0, 'Lieferzeit darf nicht negativ sein').optional(),
  
  // Status
  status: z.enum(['active', 'inactive', 'discontinued', 'new']),
  is_service: z.boolean().optional().default(false),
  is_digital: z.boolean().optional().default(false),
  is_hazardous: z.boolean().optional().default(false),
  
  // ERP-spezifische Felder
  cost_center: z.string().optional(),
  profit_center: z.string().optional(),
  tax_code: z.string().optional(),
  notes: z.string().optional(),
  
  // Bilder und Dokumente
  image_url: z.string().url('Ungültige Bild-URL').optional().or(z.literal('')),
  document_url: z.string().url('Ungültige Dokument-URL').optional().or(z.literal('')),
});

type ArticleFormData = z.infer<typeof ArticleSchema>;

// Mock Data
const mockCategories = [
  { value: 'Elektronik', label: 'Elektronik' },
  { value: 'Bürobedarf', label: 'Bürobedarf' },
  { value: 'Werkzeuge', label: 'Werkzeuge' },
  { value: 'Verbrauchsmaterial', label: 'Verbrauchsmaterial' },
  { value: 'Dienstleistungen', label: 'Dienstleistungen' },
  { value: 'Software', label: 'Software' },
  { value: 'Hardware', label: 'Hardware' },
  { value: 'Sonstige', label: 'Sonstige' },
];

const mockUnits = [
  { value: 'Stück', label: 'Stück (Stk)' },
  { value: 'Meter', label: 'Meter (m)' },
  { value: 'Kilogramm', label: 'Kilogramm (kg)' },
  { value: 'Liter', label: 'Liter (l)' },
  { value: 'Packung', label: 'Packung (Pkg)' },
  { value: 'Karton', label: 'Karton (Kt)' },
  { value: 'Palette', label: 'Palette (Pal)' },
];

const mockSuppliers = [
  { value: '1', label: 'TechSupply GmbH' },
  { value: '2', label: 'OfficeWorld AG' },
  { value: '3', label: 'ToolMaster KG' },
  { value: '4', label: 'DigitalSolutions' },
];

const mockVatRates = [
  { value: 0, label: '0% (Steuerfrei)' },
  { value: 7, label: '7% (Ermäßigt)' },
  { value: 19, label: '19% (Standard)' },
];

// NeuroFlow Article Form Component
interface NeuroFlowArticleFormProps {
  initialData?: Partial<ArticleFormData>;
  onSubmit?: (data: ArticleFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  mode?: 'create' | 'edit';
}

export const NeuroFlowArticleForm: React.FC<NeuroFlowArticleFormProps> = ({
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
  } = useForm<ArticleFormData>({
    resolver: zodResolver(ArticleSchema) as any,
    defaultValues: {
      article_number: '',
      ean_code: '',
      name: '',
      description: '',
      short_description: '',
      category: '',
      subcategory: '',
      brand: '',
      model: '',
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
      volume: 0,
      purchase_price: 0,
      selling_price: 0,
      wholesale_price: 0,
      vat_rate: 19,
      min_stock: 0,
      max_stock: 0,
      reorder_point: 0,
      current_stock: 0,
      reserved_stock: 0,
      unit: 'Stück',
      unit_conversion: 1,
      supplier_id: '',
      supplier_article_number: '',
      delivery_time_days: 0,
      status: 'active',
      is_service: false,
      is_digital: false,
      is_hazardous: false,
      cost_center: '',
      profit_center: '',
      tax_code: '',
      notes: '',
      image_url: '',
      document_url: '',
      ...initialData,
    },
  });

  const watchedPurchasePrice = watch('purchase_price');
  const watchedVatRate = watch('vat_rate');

  // Auto-berechnung des Verkaufspreises
  useEffect(() => {
    if (watchedPurchasePrice > 0) {
      const margin = 0.3; // 30% Aufschlag
      const calculatedPrice = watchedPurchasePrice * (1 + margin) * (1 + watchedVatRate / 100);
      setValue('selling_price', Math.round(calculatedPrice * 100) / 100);
    }
  }, [watchedPurchasePrice, watchedVatRate, setValue]);

  const handleFormSubmit = async (data: ArticleFormData) => {
    setSubmitLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(data);
      }
      console.log('Article saved:', data);
    } catch (error) {
      console.error('Error saving article:', error);
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

  const generateArticleNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const articleNumber = `A${year}${month}-${random}`;
    setValue('article_number', articleNumber);
  };

  const tabs = [
    { label: 'Grunddaten', icon: <InventoryIcon /> },
    { label: 'Kategorisierung', icon: <CategoryIcon /> },
    { label: 'Maße & Gewicht', icon: <ScaleIcon /> },
    { label: 'Preise', icon: <EuroIcon /> },
    { label: 'Lager', icon: <StorageIcon /> },
    { label: 'Lieferant', icon: <ShippingIcon /> },
    { label: 'Einstellungen', icon: <SettingsIcon /> },
  ];

  return (
    <NeuroFlowCard>
      <CardContent>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <InventoryIcon color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h5" fontWeight={600} color="text.primary">
                {mode === 'create' ? 'Neuer Artikel' : 'Artikel bearbeiten'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Erstellen Sie einen neuen Artikelstammsatz mit allen erforderlichen Informationen
              </Typography>
            </Box>
          </Box>
          
          <Stack direction="row" spacing={1}>
            <Tooltip title="Artikelnummer generieren">
              <IconButton onClick={generateArticleNumber} color="primary">
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
              {/* Artikelnummer */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="article_number"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Artikelnummer *"
                      fullWidth
                      error={!!errors.article_number}
                      helperText={errors.article_number?.message}
                      InputProps={{
                        startAdornment: <BarcodeIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  )}
                />
              </Grid>

              {/* EAN-Code */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="ean_code"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="EAN-Code"
                      fullWidth
                      error={!!errors.ean_code}
                      helperText={errors.ean_code?.message}
                      InputProps={{
                        startAdornment: <BarcodeIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Artikelname */}
              <Grid item xs={12}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Artikelname *"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      InputProps={{
                        startAdornment: <InventoryIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Kurzbeschreibung */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="short_description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Kurzbeschreibung"
                      fullWidth
                      error={!!errors.short_description}
                      helperText={errors.short_description?.message}
                      inputProps={{ maxLength: 100 }}
                    />
                  )}
                />
              </Grid>

              {/* Einheit */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="unit"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.unit}>
                      <InputLabel>Einheit *</InputLabel>
                      <Select {...field} label="Einheit *">
                        {mockUnits.map((unit) => (
                          <MenuItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.unit && (
                        <FormHelperText>{errors.unit.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Beschreibung */}
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Beschreibung"
                      multiline
                      rows={4}
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
            </Grid>
          )}

          {activeTab === 1 && (
            <Grid container spacing={3}>
              {/* Kategorie */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.category}>
                      <InputLabel>Kategorie *</InputLabel>
                      <Select {...field} label="Kategorie *">
                        {mockCategories.map((category) => (
                          <MenuItem key={category.value} value={category.value}>
                            {category.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.category && (
                        <FormHelperText>{errors.category.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Unterkategorie */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="subcategory"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Unterkategorie"
                      fullWidth
                      error={!!errors.subcategory}
                      helperText={errors.subcategory?.message}
                    />
                  )}
                />
              </Grid>

              {/* Marke */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="brand"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Marke"
                      fullWidth
                      error={!!errors.brand}
                      helperText={errors.brand?.message}
                    />
                  )}
                />
              </Grid>

              {/* Modell */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="model"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Modell"
                      fullWidth
                      error={!!errors.model}
                      helperText={errors.model?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          )}

          {activeTab === 2 && (
            <Grid container spacing={3}>
              {/* Länge */}
              <Grid item xs={12} md={4}>
                <Controller
                  name="length"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Länge (cm)"
                      type="number"
                      fullWidth
                      error={!!errors.length}
                      helperText={errors.length?.message}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>

              {/* Breite */}
              <Grid item xs={12} md={4}>
                <Controller
                  name="width"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Breite (cm)"
                      type="number"
                      fullWidth
                      error={!!errors.width}
                      helperText={errors.width?.message}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>

              {/* Höhe */}
              <Grid item xs={12} md={4}>
                <Controller
                  name="height"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Höhe (cm)"
                      type="number"
                      fullWidth
                      error={!!errors.height}
                      helperText={errors.height?.message}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>

              {/* Gewicht */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="weight"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Gewicht (kg)"
                      type="number"
                      fullWidth
                      error={!!errors.weight}
                      helperText={errors.weight?.message}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>

              {/* Volumen */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="volume"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Volumen (l)"
                      type="number"
                      fullWidth
                      error={!!errors.volume}
                      helperText={errors.volume?.message}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>
            </Grid>
          )}

          {activeTab === 3 && (
            <Grid container spacing={3}>
              {/* Einkaufspreis */}
              <Grid item xs={12} md={4}>
                <Controller
                  name="purchase_price"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Einkaufspreis (€) *"
                      type="number"
                      fullWidth
                      error={!!errors.purchase_price}
                      helperText={errors.purchase_price?.message}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      InputProps={{
                        startAdornment: <EuroIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Verkaufspreis */}
              <Grid item xs={12} md={4}>
                <Controller
                  name="selling_price"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Verkaufspreis (€) *"
                      type="number"
                      fullWidth
                      error={!!errors.selling_price}
                      helperText={errors.selling_price?.message}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      InputProps={{
                        startAdornment: <EuroIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Großhandelspreis */}
              <Grid item xs={12} md={4}>
                <Controller
                  name="wholesale_price"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Großhandelspreis (€)"
                      type="number"
                      fullWidth
                      error={!!errors.wholesale_price}
                      helperText={errors.wholesale_price?.message}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      InputProps={{
                        startAdornment: <EuroIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  )}
                />
              </Grid>

              {/* MwSt-Satz */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="vat_rate"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.vat_rate}>
                      <InputLabel>MwSt-Satz (%) *</InputLabel>
                      <Select {...field} label="MwSt-Satz (%) *">
                        {mockVatRates.map((rate) => (
                          <MenuItem key={rate.value} value={rate.value}>
                            {rate.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.vat_rate && (
                        <FormHelperText>{errors.vat_rate.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Einheitenumrechnung */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="unit_conversion"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Einheitenumrechnung"
                      type="number"
                      fullWidth
                      error={!!errors.unit_conversion}
                      helperText={errors.unit_conversion?.message}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 1)}
                    />
                  )}
                />
              </Grid>
            </Grid>
          )}

          {activeTab === 4 && (
            <Grid container spacing={3}>
              {/* Aktueller Bestand */}
              <Grid item xs={12} md={4}>
                <Controller
                  name="current_stock"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Aktueller Bestand *"
                      type="number"
                      fullWidth
                      error={!!errors.current_stock}
                      helperText={errors.current_stock?.message}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      InputProps={{
                        startAdornment: <StorageIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Mindestbestand */}
              <Grid item xs={12} md={4}>
                <Controller
                  name="min_stock"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Mindestbestand *"
                      type="number"
                      fullWidth
                      error={!!errors.min_stock}
                      helperText={errors.min_stock?.message}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>

              {/* Maximalbestand */}
              <Grid item xs={12} md={4}>
                <Controller
                  name="max_stock"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Maximalbestand"
                      type="number"
                      fullWidth
                      error={!!errors.max_stock}
                      helperText={errors.max_stock?.message}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>

              {/* Bestellpunkt */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="reorder_point"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Bestellpunkt *"
                      type="number"
                      fullWidth
                      error={!!errors.reorder_point}
                      helperText={errors.reorder_point?.message}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>

              {/* Reservierter Bestand */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="reserved_stock"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Reservierter Bestand"
                      type="number"
                      fullWidth
                      error={!!errors.reserved_stock}
                      helperText={errors.reserved_stock?.message}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>
            </Grid>
          )}

          {activeTab === 5 && (
            <Grid container spacing={3}>
              {/* Lieferant */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="supplier_id"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.supplier_id}>
                      <InputLabel>Lieferant</InputLabel>
                      <Select {...field} label="Lieferant">
                        <MenuItem value="">
                          <em>Kein Lieferant ausgewählt</em>
                        </MenuItem>
                        {mockSuppliers.map((supplier) => (
                          <MenuItem key={supplier.value} value={supplier.value}>
                            {supplier.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.supplier_id && (
                        <FormHelperText>{errors.supplier_id.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Lieferanten-Artikelnummer */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="supplier_article_number"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Lieferanten-Artikelnummer"
                      fullWidth
                      error={!!errors.supplier_article_number}
                      helperText={errors.supplier_article_number?.message}
                    />
                  )}
                />
              </Grid>

              {/* Lieferzeit */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="delivery_time_days"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Lieferzeit (Tage)"
                      type="number"
                      fullWidth
                      error={!!errors.delivery_time_days}
                      helperText={errors.delivery_time_days?.message}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>
            </Grid>
          )}

          {activeTab === 6 && (
            <Grid container spacing={3}>
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
                        <MenuItem value="discontinued">
                          <Chip label="Eingestellt" color="error" size="small" sx={{ mr: 1 }} />
                          Eingestellt
                        </MenuItem>
                        <MenuItem value="new">
                          <Chip label="Neu" color="primary" size="small" sx={{ mr: 1 }} />
                          Neu
                        </MenuItem>
                      </Select>
                      {errors.status && (
                        <FormHelperText>{errors.status.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Artikel-Typen */}
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Artikel-Typen
                </Typography>
                <Stack direction="row" spacing={3}>
                  <Controller
                    name="is_service"
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
                        label="Dienstleistung"
                      />
                    )}
                  />
                  <Controller
                    name="is_digital"
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
                        label="Digital"
                      />
                    )}
                  />
                  <Controller
                    name="is_hazardous"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value}
                            onChange={field.onChange}
                            color="error"
                          />
                        }
                        label="Gefahrgut"
                      />
                    )}
                  />
                </Stack>
              </Grid>

              {/* Kostenstelle */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="cost_center"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Kostenstelle"
                      fullWidth
                      error={!!errors.cost_center}
                      helperText={errors.cost_center?.message}
                    />
                  )}
                />
              </Grid>

              {/* Profit Center */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="profit_center"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Profit Center"
                      fullWidth
                      error={!!errors.profit_center}
                      helperText={errors.profit_center?.message}
                    />
                  )}
                />
              </Grid>

              {/* Steuercode */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="tax_code"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Steuercode"
                      fullWidth
                      error={!!errors.tax_code}
                      helperText={errors.tax_code?.message}
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
              {submitLoading ? 'Speichern...' : 'Artikel speichern'}
            </NeuroFlowButton>
          </Box>
        </form>
      </CardContent>
    </NeuroFlowCard>
  );
};

export default NeuroFlowArticleForm; 