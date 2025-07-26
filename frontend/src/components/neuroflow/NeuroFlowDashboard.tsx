/**
 * 🧠 NeuroFlow Dashboard
 * KI-first Dashboard mit integrierten NeuroFlow-Komponenten
 * Autocomplete, Chargenverwaltung, Lieferantenstammdaten und Workflow-Integration
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  Button,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Badge,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Science as ScienceIcon,
  Business as BusinessIcon,
  LocalShipping as ShippingIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Timeline as TimelineIcon,
  AutoGraph as AutoGraphIcon,
  QrCode as QrCodeIcon,
  Security as SecurityIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  AccountBalance as BankIcon,
  LocationOn as LocationIcon,
  Logout as LogoutIcon,
  Route as RouteIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../contexts/AuthContext';
import { trackComponentLoad } from '../../utils/performance';

// Lazy Loading für alle Subkomponenten
const NeuroFlowSupplierForm = lazy(() => import('./NeuroFlowSupplierForm').then(module => ({ default: module.NeuroFlowSupplierForm })));
const NeuroFlowChargenverwaltung = lazy(() => import('./NeuroFlowChargenverwaltung').then(module => ({ default: module.NeuroFlowChargenverwaltung })));
const NeuroFlowAutocomplete = lazy(() => import('./NeuroFlowAutocomplete').then(module => ({ default: module.NeuroFlowAutocomplete })));
const StreckengeschaeftPage = lazy(() => import('../../pages/StreckengeschaeftPage').then(module => ({ default: module.StreckengeschaeftPage })));
const EInvoicingPage = lazy(() => import('../e-invoicing/EInvoicingPage'));
const POSPage = lazy(() => import('../../pages/POS/POSPage'));
const DailyReportPage = lazy(() => import('../../pages/POS/DailyReportPage'));

// Loading Component für Subkomponenten
const ComponentLoader: React.FC<{ componentName: string }> = ({ componentName }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '200px',
      flexDirection: 'column',
      gap: 2
    }}
  >
    <CircularProgress size={40} />
    <Typography variant="body2" color="text.secondary">
      {componentName} wird geladen...
    </Typography>
  </Box>
);

// Styled Components
const DashboardCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[1],
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)',
  },
}));

const StatusChip = styled(Chip)(({ theme }: { theme: any }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  fontWeight: 600,
  '&.MuiChip-colorSuccess': {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.contrastText,
  },
  '&.MuiChip-colorWarning': {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.contrastText,
  },
  '&.MuiChip-colorError': {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
  },
  '&.MuiChip-colorInfo': {
    backgroundColor: theme.palette.info.light,
    color: theme.palette.info.contrastText,
  },
}));

// Dashboard Stats Interface
interface DashboardStats {
  totalCharges: number;
  pendingCharges: number;
  approvedCharges: number;
  quarantinedCharges: number;
  totalSuppliers: number;
  activeSuppliers: number;
  totalArticles: number;
  lowStockArticles: number;
  workflowExecutions: number;
  successfulWorkflows: number;
  failedWorkflows: number;
  kiAnalysisCount: number;
  averageProcessingTime: number;
}

// Service Status Interface
interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'warning';
  url: string;
  responseTime: number;
  lastCheck: Date;
  description: string;
}

// NeuroFlow Dashboard Component
export const NeuroFlowDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showChargeForm, setShowChargeForm] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalCharges: 0,
    pendingCharges: 0,
    approvedCharges: 0,
    quarantinedCharges: 0,
    totalSuppliers: 0,
    activeSuppliers: 0,
    totalArticles: 0,
    lowStockArticles: 0,
    workflowExecutions: 0,
    successfulWorkflows: 0,
    failedWorkflows: 0,
    kiAnalysisCount: 0,
    averageProcessingTime: 0,
  });
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'n8n Workflow Engine',
      status: 'online',
      url: 'http://localhost:5678',
      responseTime: 120,
      lastCheck: new Date(),
      description: 'Workflow-Automatisierung und KI-Integration',
    },
    {
      name: 'MCP Resource Server',
      status: 'online',
      url: 'http://localhost:8001',
      responseTime: 85,
      lastCheck: new Date(),
      description: 'Model Context Protocol für KI-Kommunikation',
    },
    {
      name: 'Autocomplete API',
      status: 'online',
      url: 'http://localhost:8003',
      responseTime: 45,
      lastCheck: new Date(),
      description: 'Intelligente Autocomplete-Funktionalität',
    },
    {
      name: 'PostgreSQL Database',
      status: 'online',
      url: 'localhost:5432',
      responseTime: 12,
      lastCheck: new Date(),
      description: 'Hauptdatenbank für Stammdaten',
    },
  ]);
  const [loading, setLoading] = useState(false);

  // Performance Tracking - Fix für endlose Render-Schleife
  const trackDashboardLoad = React.useCallback(() => {
    const startTime = performance.now();
    return () => {
      const loadEnd = performance.now();
      const loadDuration = loadEnd - startTime;
      console.log(`🧠 NeuroFlowDashboard geladen in ${loadDuration.toFixed(2)}ms`);
    };
  }, []);

  // Mock data loading
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      const trackLoad = trackDashboardLoad();
      
      try {
        // Simuliere API-Aufrufe
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats({
          totalCharges: 1247,
          pendingCharges: 23,
          approvedCharges: 1189,
          quarantinedCharges: 35,
          totalSuppliers: 89,
          activeSuppliers: 76,
          totalArticles: 456,
          lowStockArticles: 12,
          workflowExecutions: 2341,
          successfulWorkflows: 2218,
          failedWorkflows: 123,
          kiAnalysisCount: 1897,
          averageProcessingTime: 2.3,
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
        // Track component load completion
        trackLoad();
      }
    };

    loadDashboardData();
  }, []); // Leeres Dependency-Array - lädt nur einmal beim Mount

  // Tab configuration
  const tabs = [
    { label: 'Übersicht', icon: <DashboardIcon /> },
    { label: 'Kassensystem', icon: <ReceiptIcon /> },
    { label: 'Tagesjournal', icon: <AssessmentIcon /> },
    { label: 'Streckengeschäfte', icon: <RouteIcon /> },
    { label: 'E-Invoicing', icon: <ReceiptIcon /> },
    { label: 'Chargenverwaltung', icon: <ScienceIcon /> },
    { label: 'Lieferantenstammdaten', icon: <BusinessIcon /> },
    { label: 'Workflows', icon: <TimelineIcon /> },
    { label: 'KI-Analysen', icon: <AutoGraphIcon /> },
    { label: 'Services', icon: <SettingsIcon /> },
  ];

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'success';
      case 'warning': return 'warning';
      case 'offline': return 'error';
      default: return 'default';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircleIcon color="success" />;
      case 'warning': return <WarningIcon color="warning" />;
      case 'offline': return <ErrorIcon color="error" />;
      default: return <InfoIcon color="action" />;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 280,
          backgroundColor: 'background.paper',
          borderRight: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" component="h1" gutterBottom>
            VALEO NeuroERP
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.full_name} ({user?.role})
          </Typography>
        </Box>

        {/* Navigation */}
        <Box sx={{ flex: 1, p: 2 }}>
          <List>
            {tabs.map((tab, index) => (
              <ListItem
                key={index}
                button
                onClick={() => setActiveTab(index)}
                selected={activeTab === index}
              >
                <ListItemIcon>{tab.icon}</ListItemIcon>
                <ListItemText primary={tab.label} />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Logout Button */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
          >
            Abmelden
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, p: 3 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <AutoGraphIcon color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight={700} color="text.primary">
                VALEO NeuroERP Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                KI-first ERP-System mit intelligenter Workflow-Automatisierung
              </Typography>
            </Box>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Tooltip title="Daten aktualisieren">
              <IconButton onClick={() => window.location.reload()} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

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
            {/* Stats Cards */}
            <Grid item xs={12} md={3}>
              <DashboardCard>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight={700} color="primary">
                        {stats.totalCharges}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Gesamte Chargen
                      </Typography>
                    </Box>
                    <ScienceIcon color="primary" sx={{ fontSize: 40 }} />
                  </Box>
                  <Stack direction="row" spacing={1} mt={2}>
                    <StatusChip label={`${stats.approvedCharges} Genehmigt`} color="success" size="small" />
                    <StatusChip label={`${stats.pendingCharges} Ausstehend`} color="warning" size="small" />
                    <StatusChip label={`${stats.quarantinedCharges} Quarantäne`} color="error" size="small" />
                  </Stack>
                </CardContent>
              </DashboardCard>
            </Grid>

            <Grid item xs={12} md={3}>
              <DashboardCard>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight={700} color="secondary">
                        {stats.totalSuppliers}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Lieferanten
                      </Typography>
                    </Box>
                    <BusinessIcon color="secondary" sx={{ fontSize: 40 }} />
                  </Box>
                  <Stack direction="row" spacing={1} mt={2}>
                    <StatusChip label={`${stats.activeSuppliers} Aktiv`} color="success" size="small" />
                    <StatusChip label={`${stats.totalSuppliers - stats.activeSuppliers} Inaktiv`} color="default" size="small" />
                  </Stack>
                </CardContent>
              </DashboardCard>
            </Grid>

            <Grid item xs={12} md={3}>
              <DashboardCard>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight={700} color="info">
                        {stats.workflowExecutions}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Workflow-Ausführungen
                      </Typography>
                    </Box>
                    <TimelineIcon color="info" sx={{ fontSize: 40 }} />
                  </Box>
                  <Stack direction="row" spacing={1} mt={2}>
                    <StatusChip label={`${stats.successfulWorkflows} Erfolgreich`} color="success" size="small" />
                    <StatusChip label={`${stats.failedWorkflows} Fehlgeschlagen`} color="error" size="small" />
                  </Stack>
                </CardContent>
              </DashboardCard>
            </Grid>

            <Grid item xs={12} md={3}>
              <DashboardCard>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight={700} color="warning">
                        {stats.kiAnalysisCount}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        KI-Analysen
                      </Typography>
                    </Box>
                    <AutoGraphIcon color="warning" sx={{ fontSize: 40 }} />
                  </Box>
                  <Stack direction="row" spacing={1} mt={2}>
                    <StatusChip label={`${stats.averageProcessingTime}s Durchschnitt`} color="info" size="small" />
                  </Stack>
                </CardContent>
              </DashboardCard>
            </Grid>

            {/* Quick Actions */}
            <Grid item xs={12}>
              <DashboardCard>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    Schnellaktionen
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setShowChargeForm(true)}
                    >
                      Neue Charge erstellen
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => setShowSupplierForm(true)}
                    >
                      Neuen Lieferanten anlegen
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<PlayArrowIcon />}
                    >
                      Workflow ausführen
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<AutoGraphIcon />}
                    >
                      KI-Analyse starten
                    </Button>
                  </Stack>
                </CardContent>
              </DashboardCard>
            </Grid>

            {/* Recent Activity */}
            <Grid item xs={12} md={6}>
              <DashboardCard>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    Letzte Aktivitäten
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Charge CH20240701001 genehmigt"
                        secondary="Vor 5 Minuten"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <WarningIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Charge CH20240702001 in Quarantäne"
                        secondary="Vor 12 Minuten"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <AutoGraphIcon color="info" />
                      </ListItemIcon>
                      <ListItemText
                        primary="KI-Analyse für Sojaschrot abgeschlossen"
                        secondary="Vor 18 Minuten"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <BusinessIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Neuer Lieferant 'Agrarhandel GmbH' angelegt"
                        secondary="Vor 25 Minuten"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </DashboardCard>
            </Grid>

            {/* Service Status */}
            <Grid item xs={12} md={6}>
              <DashboardCard>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    Service-Status
                  </Typography>
                  <List dense>
                    {services.map((service, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          {getStatusIcon(service.status)}
                        </ListItemIcon>
                        <ListItemText
                          primary={service.name}
                          secondary={`${service.responseTime}ms • ${service.description}`}
                        />
                        <ListItemSecondaryAction>
                          <StatusChip
                            label={service.status}
                            color={getStatusColor(service.status)}
                            size="small"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </DashboardCard>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Box>
            <Suspense fallback={<ComponentLoader componentName="Kassensystem" />}>
              <POSPage />
            </Suspense>
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Suspense fallback={<ComponentLoader componentName="Tagesjournal" />}>
              <DailyReportPage />
            </Suspense>
          </Box>
        )}

        {activeTab === 3 && (
          <Box>
            <Suspense fallback={<ComponentLoader componentName="Streckengeschäft" />}>
              <StreckengeschaeftPage />
            </Suspense>
          </Box>
        )}

        {activeTab === 4 && (
          <Box>
            <Suspense fallback={<ComponentLoader componentName="E-Invoicing" />}>
              <EInvoicingPage />
            </Suspense>
          </Box>
        )}

        {activeTab === 5 && (
          <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Typography variant="h5" fontWeight={600}>
                Chargenverwaltung
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowChargeForm(true)}
              >
                Neue Charge
              </Button>
            </Box>
            <Suspense fallback={<ComponentLoader componentName="Chargenverwaltung" />}>
              <NeuroFlowChargenverwaltung />
            </Suspense>
          </Box>
        )}

        {activeTab === 6 && (
          <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Typography variant="h5" fontWeight={600}>
                Lieferantenstammdaten
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowSupplierForm(true)}
              >
                Neuer Lieferant
              </Button>
            </Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Verwenden Sie die Autocomplete-Funktionalität für schnelle Eingabe und intelligente Vorschläge.
            </Alert>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <DashboardCard>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} mb={2}>
                      Lieferanten-Suche
                    </Typography>
                    <Suspense fallback={<ComponentLoader componentName="Autocomplete" />}>
                      <NeuroFlowAutocomplete
                        label="Lieferant suchen"
                        value=""
                        onChange={(value) => console.log('Selected:', value)}
                        type="supplier"
                        placeholder="Lieferantenname oder -nummer eingeben..."
                        onLoadOptions={async (query) => {
                          // Mock data
                          const mockSuppliers = [
                            { id: '1', value: 'L001', label: 'L001 - Agrarhandel GmbH', type: 'supplier' as const, metadata: { category: 'Landhandel' } },
                            { id: '2', value: 'L002', label: 'L002 - Futtermittel AG', type: 'supplier' as const, metadata: { category: 'Futtermittel' } },
                            { id: '3', value: 'L003', label: 'L003 - Dünger & Co KG', type: 'supplier' as const, metadata: { category: 'Düngemittel' } },
                          ];
                          return mockSuppliers.filter(s => 
                            s.label.toLowerCase().includes(query.toLowerCase())
                          );
                        }}
                      />
                    </Suspense>
                  </CardContent>
                </DashboardCard>
              </Grid>
              <Grid item xs={12} md={6}>
                <DashboardCard>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} mb={2}>
                      Artikel-Suche
                    </Typography>
                    <Suspense fallback={<ComponentLoader componentName="Autocomplete" />}>
                      <NeuroFlowAutocomplete
                        label="Artikel suchen"
                        value=""
                        onChange={(value) => console.log('Selected:', value)}
                        type="article"
                        placeholder="Artikelnummer oder -name eingeben..."
                        onLoadOptions={async (query) => {
                          // Mock data
                          const mockArticles = [
                            { id: '1', value: 'ART001', label: 'ART001 - Sojaschrot Premium', type: 'article' as const, metadata: { category: 'Futtermittel' } },
                            { id: '2', value: 'ART002', label: 'ART002 - Weizenkleie', type: 'article' as const, metadata: { category: 'Futtermittel' } },
                            { id: '3', value: 'ART003', label: 'ART003 - Maiskleber', type: 'article' as const, metadata: { category: 'Futtermittel' } },
                          ];
                          return mockArticles.filter(a => 
                            a.label.toLowerCase().includes(query.toLowerCase())
                          );
                        }}
                      />
                    </Suspense>
                  </CardContent>
                </DashboardCard>
              </Grid>
            </Grid>
          </Box>
        )}

        {activeTab === 7 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <DashboardCard>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    n8n Workflow-Engine
                  </Typography>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    n8n Workflow-Engine läuft auf Port 5678
                  </Alert>
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      startIcon={<PlayArrowIcon />}
                      href="http://localhost:5678"
                      target="_blank"
                    >
                      n8n Dashboard öffnen
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                    >
                      Workflows aktualisieren
                    </Button>
                  </Stack>
                </CardContent>
              </DashboardCard>
            </Grid>
          </Grid>
        )}

        {activeTab === 8 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <DashboardCard>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    KI-Analysen Übersicht
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main">
                          {stats.kiAnalysisCount}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Durchgeführte KI-Analysen
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="info.main">
                          {stats.averageProcessingTime}s
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Durchschnittliche Verarbeitungszeit
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="warning.main">
                          98.5%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Genauigkeit der KI-Vorhersagen
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </DashboardCard>
            </Grid>
          </Grid>
        )}

        {activeTab === 9 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <DashboardCard>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    Service-Monitoring
                  </Typography>
                  <List>
                    {services.map((service, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          {getStatusIcon(service.status)}
                        </ListItemIcon>
                        <ListItemText
                          primary={service.name}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {service.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                URL: {service.url} • Response Time: {service.responseTime}ms
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Stack direction="row" spacing={1}>
                            <StatusChip
                              label={service.status}
                              color={getStatusColor(service.status)}
                            />
                            <IconButton size="small">
                              <RefreshIcon />
                            </IconButton>
                          </Stack>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </DashboardCard>
            </Grid>
          </Grid>
        )}

        {/* Modals */}
        {showSupplierForm && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 1300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2,
            }}
          >
            <Box sx={{ maxWidth: 1200, width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
              <Suspense fallback={<ComponentLoader componentName="Lieferantenformular" />}>
                <NeuroFlowSupplierForm
                  onCancel={() => setShowSupplierForm(false)}
                  onSubmit={async (data) => {
                    console.log('Supplier saved:', data);
                    setShowSupplierForm(false);
                  }}
                />
              </Suspense>
            </Box>
          </Box>
        )}

        {showChargeForm && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 1300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2,
            }}
          >
            <Box sx={{ maxWidth: 1400, width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
              <Suspense fallback={<ComponentLoader componentName="Chargenverwaltung" />}>
                <NeuroFlowChargenverwaltung />
              </Suspense>
            </Box>
          </Box>
        )}

        {/* Loading Overlay */}
        {loading && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.3)',
              zIndex: 1400,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularProgress size={60} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default NeuroFlowDashboard; 