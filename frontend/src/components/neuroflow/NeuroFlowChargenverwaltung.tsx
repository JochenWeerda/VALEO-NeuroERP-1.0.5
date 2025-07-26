/**
 * 🧠 NeuroFlow Chargenverwaltung
 * KI-first, responsive-first Chargenverwaltung für Landhandel-ERP-Systeme
 * Integration mit n8n Workflows für Automatisierung
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  QrCode as QrCodeIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Description as DescriptionIcon,
  Science as ScienceIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  AutoGraph as AutoGraphIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { styled } from '@mui/material/styles';
import { 
  NeuroFlowAutocomplete, 
  ArticleAutocomplete, 
  SupplierAutocomplete,
  ChargeAutocomplete 
} from './NeuroFlowAutocomplete';

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

// Zod Schema für Chargenverwaltung
const ChargeSchema = z.object({
  // Grunddaten
  charge_number: z.string().min(1, 'Chargennummer ist erforderlich'),
  article_number: z.string().min(1, 'Artikelnummer ist erforderlich'),
  article_name: z.string().min(2, 'Artikelname muss mindestens 2 Zeichen lang sein'),
  supplier_number: z.string().min(1, 'Lieferantennummer ist erforderlich'),
  supplier_name: z.string().min(2, 'Lieferantenname muss mindestens 2 Zeichen lang sein'),
  
  // Chargendaten
  production_date: z.string().min(1, 'Produktionsdatum ist erforderlich'),
  expiry_date: z.string().min(1, 'Verfallsdatum ist erforderlich'),
  batch_size: z.number().min(0, 'Chargengröße darf nicht negativ sein'),
  unit: z.enum(['kg', 't', 'l', 'stk', 'm³']),
  
  // Qualitätsdaten
  quality_status: z.enum(['pending', 'approved', 'rejected', 'quarantine']),
  qs_milk_relevant: z.boolean(),
  vlog_gmo_status: z.enum(['VLOG', 'GMO', 'unknown']),
  eudr_compliant: z.boolean(),
  sustainability_rapeseed: z.boolean(),
  
  // Analysedaten
  protein_content: z.number().min(0).max(100).optional(),
  fat_content: z.number().min(0).max(100).optional(),
  moisture_content: z.number().min(0).max(100).optional(),
  ash_content: z.number().min(0).max(100).optional(),
  
  // Preisdaten
  purchase_price: z.number().min(0, 'Einkaufspreis darf nicht negativ sein'),
  currency: z.enum(['EUR', 'USD', 'CHF']),
  
  // Lagerdaten
  warehouse_location: z.string().min(1, 'Lagerort ist erforderlich'),
  storage_conditions: z.enum(['ambient', 'cooled', 'frozen', 'controlled']),
  
  // Zertifikate
  certificates: z.array(z.object({
    id: z.string(),
    type: z.string(),
    filename: z.string(),
    upload_date: z.string(),
    valid_until: z.string().optional(),
  })).optional(),
  
  // KI-Extensionen
  ki_analysis: z.object({
    risk_score: z.number().min(0).max(100),
    quality_prediction: z.enum(['excellent', 'good', 'average', 'poor']),
    shelf_life_prediction: z.number().min(0),
    price_optimization_suggestion: z.number().optional(),
    anomaly_detection: z.boolean(),
    trend_analysis: z.string().optional(),
  }).optional(),
  
  // Workflow-Status
  workflow_status: z.enum(['draft', 'in_review', 'approved', 'rejected', 'archived']),
  workflow_steps: z.array(z.object({
    step: z.string(),
    status: z.enum(['pending', 'completed', 'failed']),
    completed_by: z.string().optional(),
    completed_at: z.string().optional(),
    notes: z.string().optional(),
  })).optional(),
  
  // Audit Trail
  created_by: z.string(),
  created_at: z.string(),
  updated_by: z.string().optional(),
  updated_at: z.string().optional(),
  
  // Notizen
  notes: z.string().optional(),
});

type ChargeFormData = z.infer<typeof ChargeSchema>;

// Mock Data
const mockUnits = [
  { value: 'kg', label: 'Kilogramm (kg)' },
  { value: 't', label: 'Tonne (t)' },
  { value: 'l', label: 'Liter (l)' },
  { value: 'stk', label: 'Stück (stk)' },
  { value: 'm³', label: 'Kubikmeter (m³)' },
];

const mockQualityStatuses = [
  { value: 'pending', label: 'Ausstehend', color: 'warning' },
  { value: 'approved', label: 'Genehmigt', color: 'success' },
  { value: 'rejected', label: 'Abgelehnt', color: 'error' },
  { value: 'quarantine', label: 'Quarantäne', color: 'error' },
];

const mockVlogGmoStatuses = [
  { value: 'VLOG', label: 'VLOG-konform', color: 'success' },
  { value: 'GMO', label: 'GVO-haltig', color: 'error' },
  { value: 'unknown', label: 'Unbekannt', color: 'warning' },
];

const mockStorageConditions = [
  { value: 'ambient', label: 'Umgebungstemperatur' },
  { value: 'cooled', label: 'Gekühlt' },
  { value: 'frozen', label: 'Gefroren' },
  { value: 'controlled', label: 'Klimakontrolliert' },
];

// n8n Workflow Integration
interface N8nWorkflow {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  trigger: string;
  nodes: number;
  lastExecution?: string;
}

// NeuroFlow Chargenverwaltung Component
interface NeuroFlowChargenverwaltungProps {
  initialData?: Partial<ChargeFormData>;
  onSubmit?: (data: ChargeFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  mode?: 'create' | 'edit' | 'view';
}

export const NeuroFlowChargenverwaltung: React.FC<NeuroFlowChargenverwaltungProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  mode = 'create',
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [n8nWorkflows, setN8nWorkflows] = useState<N8nWorkflow[]>([]);
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<N8nWorkflow | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<ChargeFormData>({
    resolver: zodResolver(ChargeSchema),
    defaultValues: {
      charge_number: '',
      article_number: '',
      article_name: '',
      supplier_number: '',
      supplier_name: '',
      production_date: '',
      expiry_date: '',
      batch_size: 0,
      unit: 'kg',
      quality_status: 'pending',
      qs_milk_relevant: false,
      vlog_gmo_status: 'unknown',
      eudr_compliant: false,
      sustainability_rapeseed: false,
      protein_content: 0,
      fat_content: 0,
      moisture_content: 0,
      ash_content: 0,
      purchase_price: 0,
      currency: 'EUR',
      warehouse_location: '',
      storage_conditions: 'ambient',
      certificates: [],
      ki_analysis: {
        risk_score: 50,
        quality_prediction: 'average',
        shelf_life_prediction: 365,
        anomaly_detection: false,
      },
      workflow_status: 'draft',
      workflow_steps: [],
      created_by: 'System',
      created_at: new Date().toISOString(),
      notes: '',
      ...initialData,
    },
  });

  // n8n Workflow Integration
  useEffect(() => {
    fetchN8nWorkflows();
  }, []);

  const fetchN8nWorkflows = async () => {
    try {
      const response = await fetch('http://localhost:5678/api/v1/workflows');
      if (response.ok) {
        const workflows = await response.json();
        setN8nWorkflows(workflows.data || []);
      }
    } catch (error) {
      console.error('Fehler beim Laden der n8n Workflows:', error);
    }
  };

  const triggerWorkflow = async (workflowId: string, data: any) => {
    try {
      const response = await fetch(`http://localhost:5678/api/v1/workflows/${workflowId}/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        console.log('Workflow erfolgreich ausgelöst:', workflowId);
        return true;
      }
    } catch (error) {
      console.error('Fehler beim Auslösen des Workflows:', error);
    }
    return false;
  };

  const handleFormSubmit: SubmitHandler<ChargeFormData> = async (data) => {
    setSubmitLoading(true);
    try {
      // KI-Analyse durchführen
      const kiAnalysis = await performKIAnalysis(data);
      data.ki_analysis = { ...data.ki_analysis, ...kiAnalysis };
      
      // n8n Workflow für Chargenverarbeitung auslösen
      await triggerWorkflow('charge-processing', data);
      
      if (onSubmit) {
        await onSubmit(data);
      }
      console.log('Charge saved:', data);
    } catch (error) {
      console.error('Error saving charge:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const performKIAnalysis = async (data: ChargeFormData): Promise<any> => {
    // Simulierte KI-Analyse
    const riskScore = Math.random() * 100;
    const qualityPrediction = riskScore < 30 ? 'excellent' : 
                             riskScore < 60 ? 'good' : 
                             riskScore < 80 ? 'average' : 'poor';
    
    return {
      risk_score: Math.round(riskScore),
      quality_prediction: qualityPrediction,
      shelf_life_prediction: Math.floor(Math.random() * 730) + 30,
      price_optimization_suggestion: data.purchase_price * (0.9 + Math.random() * 0.2),
      anomaly_detection: Math.random() > 0.8,
      trend_analysis: 'Stabile Qualität, leichte Preiserhöhung erwartet',
    };
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

  const generateChargeNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const chargeNumber = `CH${year}${month}${day}-${random}`;
    setValue('charge_number', chargeNumber);
  };

  const tabs = [
    { label: 'Grunddaten', icon: <DescriptionIcon /> },
    { label: 'Qualität', icon: <ScienceIcon /> },
    { label: 'Analysen', icon: <AssessmentIcon /> },
    { label: 'Lagerung', icon: <ShippingIcon /> },
    { label: 'Zertifikate', icon: <SecurityIcon /> },
    { label: 'KI-Analyse', icon: <AutoGraphIcon /> },
    { label: 'Workflow', icon: <TimelineIcon /> },
  ];

  return (
    <NeuroFlowCard>
      <CardContent>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <ScienceIcon color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h5" fontWeight={600} color="text.primary">
                {mode === 'create' ? 'Neue Charge' : mode === 'edit' ? 'Charge bearbeiten' : 'Charge anzeigen'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Chargenverwaltung mit KI-Analyse und n8n Workflow-Integration
              </Typography>
            </Box>
          </Box>
          
          <Stack direction="row" spacing={1}>
            <Tooltip title="Chargennummer generieren">
              <IconButton onClick={generateChargeNumber} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="n8n Workflows">
              <IconButton onClick={() => setWorkflowDialogOpen(true)} color="secondary">
                <TimelineIcon />
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
              {/* Chargennummer */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="charge_number"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Chargennummer *"
                      fullWidth
                      error={!!errors.charge_number}
                      helperText={errors.charge_number?.message}
                      InputProps={{
                        startAdornment: <QrCodeIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Artikelnummer */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="article_number"
                  control={control}
                  render={({ field }) => (
                    <ArticleAutocomplete
                      label="Artikelnummer *"
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      error={!!errors.article_number}
                      helperText={errors.article_number?.message}
                      onLoadOptions={async (query) => {
                        // Mock data - in Produktion durch echte API ersetzen
                        const mockArticles = [
                          { id: '1', value: 'ART001', label: 'ART001 - Sojaschrot Premium', type: 'article' as const, metadata: { category: 'Futtermittel' } },
                          { id: '2', value: 'ART002', label: 'ART002 - Weizenkleie', type: 'article' as const, metadata: { category: 'Futtermittel' } },
                          { id: '3', value: 'ART003', label: 'ART003 - Maiskleber', type: 'article' as const, metadata: { category: 'Futtermittel' } },
                        ];
                        return mockArticles.filter(a => 
                          a.label.toLowerCase().includes(query.toLowerCase()) ||
                          a.value.toLowerCase().includes(query.toLowerCase())
                        );
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Artikelname */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="article_name"
                  control={control}
                  render={({ field }) => (
                    <ArticleAutocomplete
                      label="Artikelname *"
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      error={!!errors.article_name}
                      helperText={errors.article_name?.message}
                      onLoadOptions={async (query) => {
                        // Mock data - in Produktion durch echte API ersetzen
                        const mockArticleNames = [
                          { id: '1', value: 'Sojaschrot Premium', label: 'Sojaschrot Premium', type: 'article' as const, metadata: { category: 'Futtermittel', protein: '45%' } },
                          { id: '2', value: 'Weizenkleie', label: 'Weizenkleie', type: 'article' as const, metadata: { category: 'Futtermittel', protein: '15%' } },
                          { id: '3', value: 'Maiskleber', label: 'Maiskleber', type: 'article' as const, metadata: { category: 'Futtermittel', protein: '60%' } },
                        ];
                        return mockArticleNames.filter(a => 
                          a.label.toLowerCase().includes(query.toLowerCase())
                        );
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Lieferantennummer */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="supplier_number"
                  control={control}
                  render={({ field }) => (
                    <SupplierAutocomplete
                      label="Lieferantennummer *"
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      error={!!errors.supplier_number}
                      helperText={errors.supplier_number?.message}
                      onLoadOptions={async (query) => {
                        // Mock data - in Produktion durch echte API ersetzen
                        const mockSuppliers = [
                          { id: '1', value: 'L001', label: 'L001 - Agrarhandel GmbH', type: 'supplier' as const, metadata: { category: 'Landhandel' } },
                          { id: '2', value: 'L002', label: 'L002 - Futtermittel AG', type: 'supplier' as const, metadata: { category: 'Futtermittel' } },
                          { id: '3', value: 'L003', label: 'L003 - Dünger & Co KG', type: 'supplier' as const, metadata: { category: 'Düngemittel' } },
                        ];
                        return mockSuppliers.filter(s => 
                          s.label.toLowerCase().includes(query.toLowerCase()) ||
                          s.value.toLowerCase().includes(query.toLowerCase())
                        );
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Lieferantenname */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="supplier_name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Lieferantenname *"
                      fullWidth
                      error={!!errors.supplier_name}
                      helperText={errors.supplier_name?.message}
                    />
                  )}
                />
              </Grid>

              {/* Produktionsdatum */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="production_date"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Produktionsdatum *"
                      type="date"
                      fullWidth
                      error={!!errors.production_date}
                      helperText={errors.production_date?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>

              {/* Verfallsdatum */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="expiry_date"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Verfallsdatum *"
                      type="date"
                      fullWidth
                      error={!!errors.expiry_date}
                      helperText={errors.expiry_date?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>

              {/* Chargengröße */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="batch_size"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Chargengröße *"
                      type="number"
                      fullWidth
                      error={!!errors.batch_size}
                      helperText={errors.batch_size?.message}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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

              {/* Einkaufspreis */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="purchase_price"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Einkaufspreis *"
                      type="number"
                      fullWidth
                      error={!!errors.purchase_price}
                      helperText={errors.purchase_price?.message}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      InputProps={{
                        startAdornment: <PaymentIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Währung */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.currency}>
                      <InputLabel>Währung *</InputLabel>
                      <Select {...field} label="Währung *">
                        <MenuItem value="EUR">EUR (Euro)</MenuItem>
                        <MenuItem value="USD">USD (US-Dollar)</MenuItem>
                        <MenuItem value="CHF">CHF (Schweizer Franken)</MenuItem>
                      </Select>
                      {errors.currency && (
                        <FormHelperText>{errors.currency.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Grid container spacing={3}>
              {/* Qualitätsstatus */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="quality_status"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.quality_status}>
                      <InputLabel>Qualitätsstatus *</InputLabel>
                      <Select {...field} label="Qualitätsstatus *">
                        {mockQualityStatuses.map((status) => (
                          <MenuItem key={status.value} value={status.value}>
                            <Chip
                              label={status.label}
                              size="small"
                              color={status.color as any}
                              sx={{ mr: 1 }}
                            />
                            {status.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.quality_status && (
                        <FormHelperText>{errors.quality_status.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* VLOG/GMO Status */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="vlog_gmo_status"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.vlog_gmo_status}>
                      <InputLabel>VLOG/GMO Status *</InputLabel>
                      <Select {...field} label="VLOG/GMO Status *">
                        {mockVlogGmoStatuses.map((status) => (
                          <MenuItem key={status.value} value={status.value}>
                            <Chip
                              label={status.label}
                              size="small"
                              color={status.color as any}
                              sx={{ mr: 1 }}
                            />
                            {status.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.vlog_gmo_status && (
                        <FormHelperText>{errors.vlog_gmo_status.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Qualitäts-Flags */}
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Qualitäts-Eigenschaften
                </Typography>
                <Stack direction="row" spacing={3}>
                  <Controller
                    name="qs_milk_relevant"
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
                        label="QS Milch relevant"
                      />
                    )}
                  />
                  <Controller
                    name="eudr_compliant"
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
                        label="EUDR konform"
                      />
                    )}
                  />
                  <Controller
                    name="sustainability_rapeseed"
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
                        label="Nachhaltiger Raps"
                      />
                    )}
                  />
                </Stack>
              </Grid>
            </Grid>
          )}

          {activeTab === 2 && (
            <Grid container spacing={3}>
              {/* Proteingehalt */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="protein_content"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Proteingehalt (%)"
                      type="number"
                      fullWidth
                      error={!!errors.protein_content}
                      helperText={errors.protein_content?.message}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>

              {/* Fettgehalt */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="fat_content"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Fettgehalt (%)"
                      type="number"
                      fullWidth
                      error={!!errors.fat_content}
                      helperText={errors.fat_content?.message}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>

              {/* Feuchtigkeitsgehalt */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="moisture_content"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Feuchtigkeitsgehalt (%)"
                      type="number"
                      fullWidth
                      error={!!errors.moisture_content}
                      helperText={errors.moisture_content?.message}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>

              {/* Aschegehalt */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="ash_content"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Aschegehalt (%)"
                      type="number"
                      fullWidth
                      error={!!errors.ash_content}
                      helperText={errors.ash_content?.message}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>
            </Grid>
          )}

          {activeTab === 3 && (
            <Grid container spacing={3}>
              {/* Lagerort */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="warehouse_location"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Lagerort *"
                      fullWidth
                      error={!!errors.warehouse_location}
                      helperText={errors.warehouse_location?.message}
                      InputProps={{
                        startAdornment: <ShippingIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Lagerbedingungen */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="storage_conditions"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.storage_conditions}>
                      <InputLabel>Lagerbedingungen *</InputLabel>
                      <Select {...field} label="Lagerbedingungen *">
                        {mockStorageConditions.map((condition) => (
                          <MenuItem key={condition.value} value={condition.value}>
                            {condition.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.storage_conditions && (
                        <FormHelperText>{errors.storage_conditions.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          )}

          {activeTab === 4 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Zertifikate und Dokumente
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Zertifikate können über das n8n Workflow-System automatisch verarbeitet werden.
                </Alert>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Typ</TableCell>
                        <TableCell>Dateiname</TableCell>
                        <TableCell>Upload-Datum</TableCell>
                        <TableCell>Gültig bis</TableCell>
                        <TableCell>Aktionen</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {watch('certificates')?.map((cert, index) => (
                        <TableRow key={index}>
                          <TableCell>{cert.type}</TableCell>
                          <TableCell>{cert.filename}</TableCell>
                          <TableCell>{new Date(cert.upload_date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {cert.valid_until ? new Date(cert.valid_until).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>
                            <IconButton size="small" color="primary">
                              <ViewIcon />
                            </IconButton>
                            <IconButton size="small" color="error">
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          )}

          {activeTab === 5 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  KI-Analyse und Vorhersagen
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Die KI-Analyse wird automatisch durchgeführt und basiert auf historischen Daten und Qualitätsparametern.
                </Alert>
              </Grid>

              {/* Risiko-Score */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="ki_analysis.risk_score"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Risiko-Score (0-100)"
                      type="number"
                      fullWidth
                      error={!!errors.ki_analysis?.risk_score}
                      helperText={errors.ki_analysis?.risk_score?.message}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>

              {/* Qualitätsvorhersage */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="ki_analysis.quality_prediction"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.ki_analysis?.quality_prediction}>
                      <InputLabel>Qualitätsvorhersage</InputLabel>
                      <Select {...field} label="Qualitätsvorhersage">
                        <MenuItem value="excellent">
                          <Chip label="Ausgezeichnet" color="success" size="small" sx={{ mr: 1 }} />
                          Ausgezeichnet
                        </MenuItem>
                        <MenuItem value="good">
                          <Chip label="Gut" color="primary" size="small" sx={{ mr: 1 }} />
                          Gut
                        </MenuItem>
                        <MenuItem value="average">
                          <Chip label="Durchschnittlich" color="warning" size="small" sx={{ mr: 1 }} />
                          Durchschnittlich
                        </MenuItem>
                        <MenuItem value="poor">
                          <Chip label="Schlecht" color="error" size="small" sx={{ mr: 1 }} />
                          Schlecht
                        </MenuItem>
                      </Select>
                      {errors.ki_analysis?.quality_prediction && (
                        <FormHelperText>{errors.ki_analysis.quality_prediction.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Haltbarkeitsvorhersage */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="ki_analysis.shelf_life_prediction"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Haltbarkeitsvorhersage (Tage)"
                      type="number"
                      fullWidth
                      error={!!errors.ki_analysis?.shelf_life_prediction}
                      helperText={errors.ki_analysis?.shelf_life_prediction?.message}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>

              {/* Anomalie-Erkennung */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="ki_analysis.anomaly_detection"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                          color="warning"
                        />
                      }
                      label="Anomalie erkannt"
                    />
                  )}
                />
              </Grid>

              {/* Trend-Analyse */}
              <Grid item xs={12}>
                <Controller
                  name="ki_analysis.trend_analysis"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Trend-Analyse"
                      multiline
                      rows={3}
                      fullWidth
                      error={!!errors.ki_analysis?.trend_analysis}
                      helperText={errors.ki_analysis?.trend_analysis?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          )}

          {activeTab === 6 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Workflow-Status und Automatisierung
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Der Workflow wird über n8n gesteuert und automatisiert die Chargenverarbeitung.
                </Alert>
              </Grid>

              {/* Workflow-Status */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="workflow_status"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.workflow_status}>
                      <InputLabel>Workflow-Status *</InputLabel>
                      <Select {...field} label="Workflow-Status *">
                        <MenuItem value="draft">
                          <Chip label="Entwurf" color="default" size="small" sx={{ mr: 1 }} />
                          Entwurf
                        </MenuItem>
                        <MenuItem value="in_review">
                          <Chip label="In Prüfung" color="warning" size="small" sx={{ mr: 1 }} />
                          In Prüfung
                        </MenuItem>
                        <MenuItem value="approved">
                          <Chip label="Genehmigt" color="success" size="small" sx={{ mr: 1 }} />
                          Genehmigt
                        </MenuItem>
                        <MenuItem value="rejected">
                          <Chip label="Abgelehnt" color="error" size="small" sx={{ mr: 1 }} />
                          Abgelehnt
                        </MenuItem>
                        <MenuItem value="archived">
                          <Chip label="Archiviert" color="default" size="small" sx={{ mr: 1 }} />
                          Archiviert
                        </MenuItem>
                      </Select>
                      {errors.workflow_status && (
                        <FormHelperText>{errors.workflow_status.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Workflow-Schritte */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>
                  Workflow-Schritte
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Schritt</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Ausgeführt von</TableCell>
                        <TableCell>Ausgeführt am</TableCell>
                        <TableCell>Notizen</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {watch('workflow_steps')?.map((step, index) => (
                        <TableRow key={index}>
                          <TableCell>{step.step}</TableCell>
                          <TableCell>
                            <Chip
                              label={step.status === 'completed' ? 'Abgeschlossen' : 
                                    step.status === 'pending' ? 'Ausstehend' : 'Fehlgeschlagen'}
                              color={step.status === 'completed' ? 'success' : 
                                     step.status === 'pending' ? 'warning' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{step.completed_by || '-'}</TableCell>
                          <TableCell>
                            {step.completed_at ? new Date(step.completed_at).toLocaleString() : '-'}
                          </TableCell>
                          <TableCell>{step.notes || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
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
              {submitLoading ? 'Speichern...' : 'Charge speichern'}
            </NeuroFlowButton>
          </Box>
        </form>

        {/* n8n Workflow Dialog */}
        <Dialog
          open={workflowDialogOpen}
          onClose={() => setWorkflowDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <TimelineIcon color="primary" />
              n8n Workflows
            </Box>
          </DialogTitle>
          <DialogContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Trigger</TableCell>
                    <TableCell>Nodes</TableCell>
                    <TableCell>Letzte Ausführung</TableCell>
                    <TableCell>Aktionen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {n8nWorkflows.map((workflow) => (
                    <TableRow key={workflow.id}>
                      <TableCell>{workflow.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={workflow.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                          color={workflow.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{workflow.trigger}</TableCell>
                      <TableCell>{workflow.nodes}</TableCell>
                      <TableCell>
                        {workflow.lastExecution ? new Date(workflow.lastExecution).toLocaleString() : '-'}
                      </TableCell>
                      <TableCell>
                                                  <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              setSelectedWorkflow(workflow);
                              // Hier könnte man den Workflow auslösen
                            }}
                          >
                            <PlayArrowIcon />
                          </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setWorkflowDialogOpen(false)}>Schließen</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </NeuroFlowCard>
  );
};

export default NeuroFlowChargenverwaltung; 