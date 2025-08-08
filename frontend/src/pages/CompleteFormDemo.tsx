/**
 * Vollständige Formular-Demo für VALEO NeuroERP 2.0
 * 
 * Diese Seite demonstriert alle implementierten Formulare und Eingabemasken
 * mit vollständiger Funktionalität und Übersicht.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Assessment as StatsIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

import { CentralFormTableService } from '../services/CentralFormTable';
import { ExtendedFormRegistryService } from '../services/ExtendedFormRegistry';
import { ModernERPForm } from '../components/forms/ModernERPForm';
import { FormManager } from '../components/forms/FormManager';
import { z } from 'zod';

/**
 * Interface für Demo-Statistiken
 */
interface DemoStatistics {
  totalForms: number;
  byModule: Record<string, number>;
  byComplexity: Record<string, number>;
  byStatus: Record<string, number>;
  averagePriority: number;
  versionDistribution: Record<string, number>;
}

/**
 * Interface für Filter-Optionen
 */
interface FilterOptions {
  module: string;
  complexity: string;
  status: string;
  searchTerm: string;
}

/**
 * Hauptkomponente für die vollständige Formular-Demo
 */
const CompleteFormDemo: React.FC = () => {
  // State für die Demo
  const [activeTab, setActiveTab] = useState(0);
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [statistics, setStatistics] = useState<DemoStatistics | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    module: 'all',
    complexity: 'all',
    status: 'all',
    searchTerm: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Services
  const formTableService = CentralFormTableService.getInstance();
  const formRegistryService = ExtendedFormRegistryService.getInstance();

  // Lade Daten beim Mount
  useEffect(() => {
    loadDemoData();
  }, []);

  /**
   * Lädt alle Demo-Daten
   */
  const loadDemoData = async () => {
    try {
      setLoading(true);
      
      // Lade Statistiken
      const stats = formTableService.getTableStatistics();
      setStatistics({
        totalForms: stats.total,
        byModule: stats.byModule,
        byComplexity: stats.byComplexity,
        byStatus: stats.byStatus,
        averagePriority: stats.averagePriority,
        versionDistribution: stats.versionDistribution
      });
      
      setLoading(false);
    } catch (err) {
      setError('Fehler beim Laden der Demo-Daten');
      setLoading(false);
    }
  };

  /**
   * Filtert Formulare basierend auf den Filter-Optionen
   */
  const getFilteredForms = () => {
    let forms = formTableService.getAllFormEntries();

    // Filter nach Modul
    if (filterOptions.module !== 'all') {
      forms = forms.filter(form => form.module === filterOptions.module);
    }

    // Filter nach Komplexität
    if (filterOptions.complexity !== 'all') {
      forms = forms.filter(form => form.complexity === filterOptions.complexity);
    }

    // Filter nach Status
    if (filterOptions.status !== 'all') {
      forms = forms.filter(form => form.status === filterOptions.status);
    }

    // Filter nach Suchbegriff
    if (filterOptions.searchTerm) {
      forms = formTableService.searchForms(filterOptions.searchTerm);
    }

    return forms;
  };

  /**
   * Öffnet ein Formular im Dialog
   */
  const openForm = (formId: string, mode: 'create' | 'edit' | 'view' = 'create') => {
    setSelectedForm(formId);
    setFormMode(mode);
    setShowFormDialog(true);
  };

  /**
   * Schließt den Formular-Dialog
   */
  const closeFormDialog = () => {
    setShowFormDialog(false);
    setSelectedForm(null);
  };

  /**
   * Rendert die Statistik-Karten
   */
  const renderStatisticsCards = () => {
    if (!statistics) return null;

    return (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Gesamt-Formulare
              </Typography>
                             <Typography variant="h4" component="div">
                 {statistics.totalForms}
               </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Durchschnittliche Priorität
              </Typography>
              <Typography variant="h4" component="div">
                {statistics.averagePriority}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Module
              </Typography>
              <Typography variant="h4" component="div">
                {Object.keys(statistics.byModule).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Versionen
              </Typography>
              <Typography variant="h4" component="div">
                {Object.keys(statistics.versionDistribution).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  /**
   * Rendert die Filter-Sektion
   */
  const renderFilters = () => {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filter & Suche
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Modul</InputLabel>
                <Select
                  value={filterOptions.module}
                  onChange={(e) => setFilterOptions(prev => ({ ...prev, module: e.target.value }))}
                >
                  <MenuItem value="all">Alle Module</MenuItem>
                  <MenuItem value="warenwirtschaft">Warenwirtschaft</MenuItem>
                  <MenuItem value="finanzbuchhaltung">Finanzbuchhaltung</MenuItem>
                  <MenuItem value="crm">CRM</MenuItem>
                  <MenuItem value="crosscutting">Übergreifende Services</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Komplexität</InputLabel>
                <Select
                  value={filterOptions.complexity}
                  onChange={(e) => setFilterOptions(prev => ({ ...prev, complexity: e.target.value }))}
                >
                  <MenuItem value="all">Alle Komplexitäten</MenuItem>
                  <MenuItem value="low">Niedrig</MenuItem>
                  <MenuItem value="medium">Mittel</MenuItem>
                  <MenuItem value="high">Hoch</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterOptions.status}
                  onChange={(e) => setFilterOptions(prev => ({ ...prev, status: e.target.value }))}
                >
                  <MenuItem value="all">Alle Status</MenuItem>
                  <MenuItem value="active">Aktiv</MenuItem>
                  <MenuItem value="draft">Entwurf</MenuItem>
                  <MenuItem value="deprecated">Veraltet</MenuItem>
                  <MenuItem value="archived">Archiviert</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Suche"
                value={filterOptions.searchTerm}
                onChange={(e) => setFilterOptions(prev => ({ ...prev, searchTerm: e.target.value }))}
                InputProps={{
                  startAdornment: <SearchIcon />
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  /**
   * Rendert die Formular-Tabelle
   */
  const renderFormTable = () => {
    const forms = getFilteredForms();

    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Formulare ({forms.length})
            </Typography>
            <Button
              startIcon={<RefreshIcon />}
              onClick={loadDemoData}
              variant="outlined"
            >
              Aktualisieren
            </Button>
          </Box>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Index</TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell>Titel</TableCell>
                  <TableCell>Modul</TableCell>
                  <TableCell>Kategorie</TableCell>
                  <TableCell>Komplexität</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Version</TableCell>
                  <TableCell>Priorität</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {forms.map((form) => (
                  <TableRow key={form.id}>
                    <TableCell>{form.index}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {form.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {form.title}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {form.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={form.module}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {form.category}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={form.complexity}
                        size="small"
                        color={
                          form.complexity === 'high' ? 'error' :
                          form.complexity === 'medium' ? 'warning' : 'success'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={form.status}
                        size="small"
                        color={
                          form.status === 'active' ? 'success' :
                          form.status === 'draft' ? 'warning' :
                          form.status === 'deprecated' ? 'error' : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {form.version}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {form.priority}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Erstellen">
                          <IconButton
                            size="small"
                            onClick={() => openForm(form.id, 'create')}
                            color="primary"
                          >
                            <AddIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Bearbeiten">
                          <IconButton
                            size="small"
                            onClick={() => openForm(form.id, 'edit')}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Anzeigen">
                          <IconButton
                            size="small"
                            onClick={() => openForm(form.id, 'view')}
                            color="info"
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Testen">
                          <IconButton
                            size="small"
                            onClick={() => openForm(form.id, 'create')}
                            color="success"
                          >
                            <PlayIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  };

  /**
   * Rendert die Modul-Übersicht
   */
  const renderModuleOverview = () => {
    if (!statistics) return null;

    return (
      <Grid container spacing={3}>
        {Object.entries(statistics.byModule).map(([module, count]) => (
          <Grid item xs={12} sm={6} md={3} key={module}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {module.charAt(0).toUpperCase() + module.slice(1)}
                </Typography>
                <Typography variant="h4" component="div" color="primary">
                  {count}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Formulare
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => setFilterOptions(prev => ({ ...prev, module }))}
                >
                  Anzeigen
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  /**
   * Rendert die Komplexitäts-Übersicht
   */
  const renderComplexityOverview = () => {
    if (!statistics) return null;

    return (
      <Grid container spacing={3}>
        {Object.entries(statistics.byComplexity).map(([complexity, count]) => (
          <Grid item xs={12} sm={6} md={4} key={complexity}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {complexity === 'high' ? 'Hohe Komplexität' :
                   complexity === 'medium' ? 'Mittlere Komplexität' : 'Niedrige Komplexität'}
                </Typography>
                <Typography variant="h4" component="div" color="primary">
                  {count}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Formulare
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  /**
   * Rendert die Formular-Details
   */
  const renderFormDetails = () => {
    if (!selectedForm) return null;

    const form = formTableService.getFormEntry(selectedForm);
    if (!form) return null;

    return (
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {form.title}
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            {form.description}
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Basis-Informationen
              </Typography>
              <Typography variant="body2">
                <strong>ID:</strong> {form.id}
              </Typography>
              <Typography variant="body2">
                <strong>Modul:</strong> {form.module}
              </Typography>
              <Typography variant="body2">
                <strong>Kategorie:</strong> {form.category}
              </Typography>
              <Typography variant="body2">
                <strong>Version:</strong> {form.version}
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong> {form.status}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Technische Details
              </Typography>
              <Typography variant="body2">
                <strong>Komplexität:</strong> {form.complexity}
              </Typography>
              <Typography variant="body2">
                <strong>Priorität:</strong> {form.priority}
              </Typography>
              <Typography variant="body2">
                <strong>Komponenten-Pfad:</strong> {form.componentPath}
              </Typography>
              <Typography variant="body2">
                <strong>Validierung:</strong> {form.validationSchema}
              </Typography>
              <Typography variant="body2">
                <strong>Accessibility:</strong> {form.accessibilityLevel}
              </Typography>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Tags
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {form.tags.map((tag, index) => (
                <Chip key={index} label={tag} size="small" />
              ))}
            </Box>
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Abhängigkeiten
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {form.dependencies.map((dependency, index) => (
                <Chip key={index} label={dependency} size="small" variant="outlined" />
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Tab-Panels
  const tabPanels = [
    {
      label: 'Übersicht',
      icon: <StatsIcon />,
      content: (
        <Box>
          {renderStatisticsCards()}
          <Typography variant="h5" gutterBottom>
            Modul-Übersicht
          </Typography>
          {renderModuleOverview()}
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Komplexitäts-Übersicht
          </Typography>
          {renderComplexityOverview()}
        </Box>
      )
    },
    {
      label: 'Formulare',
      icon: <ViewIcon />,
      content: (
        <Box>
          {renderFilters()}
          {renderFormTable()}
        </Box>
      )
    },
    {
      label: 'Form Manager',
      icon: <SettingsIcon />,
      content: (
        <Box>
          <FormManager />
        </Box>
      )
    },
    {
      label: 'Details',
      icon: <EditIcon />,
      content: (
        <Box>
          {renderFormDetails()}
        </Box>
      )
    }
  ];

  // Loading-Zustand
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error-Zustand
  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Vollständige Formular-Demo - VALEO NeuroERP 2.0
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Diese Demo zeigt alle implementierten Formulare und Eingabemasken mit vollständiger Funktionalität.
      </Typography>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          {tabPanels.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Box>

      {/* Tab-Inhalte */}
      {tabPanels[activeTab].content}

      {/* Formular-Dialog */}
      {showFormDialog && selectedForm && (
        <ModernERPForm
          config={{
            id: selectedForm,
            metadata: {
              id: selectedForm,
              name: `Formular ${selectedForm}`,
              module: 'demo',
              version: '1.0.0',
              status: 'active',
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: 'demo',
              updatedBy: 'demo',
              description: `Beschreibung für ${selectedForm}`,
              tags: [],
              dependencies: [],
              permissions: {
                super_admin: ['read', 'write', 'admin', 'delete'],
                admin: ['read', 'write', 'admin'],
                manager: ['read', 'write'],
                accountant: ['read', 'write'],
                warehouse: ['read', 'write'],
                sales: ['read', 'write'],
                viewer: ['read']
              }
            },
            fields: [],
            validationSchema: z.object({}),
            defaultValues: {},
            layout: {
              type: 'standard',
              navigation: {
                showProgress: true,
                showTimeline: false,
                showBreadcrumbs: true,
                allowSkip: false,
                allowBack: true
              },
              validation: {
                realTime: true,
                onTabChange: true,
                onStepChange: true,
                showErrors: true,
                mode: 'onBlur'
              },
              autoSave: {
                enabled: true,
                interval: 30000,
                showIndicator: true
              }
            },
            size: 'medium',
            features: {
              autoSave: true,
              autoSaveInterval: 30000,
              keyboardShortcuts: true,
              barcodeScanner: false,
              progressBar: true,
              conditionalFields: false,
              groupedFields: false,
              realTimeValidation: true,
              accessibility: true,
              mobileOptimized: true,
              offlineSupport: false,
              bulkOperations: false,
              printSupport: false,
              exportSupport: false
            },
            module: 'demo',
            title: `Formular ${selectedForm}`,
            description: `Beschreibung für ${selectedForm}`,
            tabs: [],
            permissions: {
              canCreate: true,
              canEdit: true,
              canDelete: true,
              canApprove: true,
              canReject: true,
              canView: true
            }
          }}
          mode={formMode}
          onCancel={closeFormDialog}
          onSave={async (data) => {
            console.log('Formular gespeichert:', data);
            closeFormDialog();
          }}
        />
      )}
    </Box>
  );
};

export default CompleteFormDemo; 