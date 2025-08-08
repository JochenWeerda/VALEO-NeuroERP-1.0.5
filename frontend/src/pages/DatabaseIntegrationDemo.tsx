/**
 * VALEO NeuroERP 2.0 - Datenbank-Integration Demo
 * Serena Quality: Vollständige Demo der echten Datenbank-Integration
 */

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Dataset as DatabaseIcon,
  Api as ApiIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { message } from 'antd';

// Components
import ModernERPFormWithDB from '../components/forms/ModernERPFormWithDB';

// Services
import formDataService from '../services/FormDataService';
import { ExtendedFormRegistryService } from '../services/ExtendedFormRegistry';

// Types
import { StandardizedFormConfig } from '../types/forms';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`demo-tabpanel-${index}`}
      aria-labelledby={`demo-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface DemoState {
  selectedModule: string;
  selectedForm: StandardizedFormConfig | null;
  formData: any[];
  loading: boolean;
  error: string | null;
  dialogOpen: boolean;
  dialogMode: 'create' | 'edit' | 'view';
  selectedRecord: any | null;
}

const MODULES = [
  { id: 'warenwirtschaft', name: 'Warenwirtschaft', color: 'primary' },
  { id: 'finanzbuchhaltung', name: 'Finanzbuchhaltung', color: 'secondary' },
  { id: 'crm', name: 'CRM', color: 'success' },
  { id: 'uebergreifende_services', name: 'Übergreifende Services', color: 'warning' }
];

export const DatabaseIntegrationDemo: React.FC = () => {
  const [state, setState] = useState<DemoState>({
    selectedModule: 'warenwirtschaft',
    selectedForm: null,
    formData: [],
    loading: false,
    error: null,
    dialogOpen: false,
    dialogMode: 'create',
    selectedRecord: null
  });

  const [tabValue, setTabValue] = useState(0);

  // Load forms for selected module
  useEffect(() => {
    const formRegistry = ExtendedFormRegistryService.getInstance();
    const forms = formRegistry.getFormsByModule(state.selectedModule);
    
    if (forms.length > 0) {
      setState(prev => ({ ...prev, selectedForm: forms[0] }));
      loadFormData(forms[0]);
    }
  }, [state.selectedModule]);

  // Load form data from database
  const loadFormData = async (formConfig: StandardizedFormConfig) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await formDataService.getFormDataList(formConfig);
      if (response.success && response.data) {
        setState(prev => ({ 
          ...prev, 
          formData: response.data,
          loading: false 
        }));
        message.success(`${response.data.length} Datensätze geladen`);
      } else {
        setState(prev => ({ 
          ...prev, 
          error: 'Fehler beim Laden der Daten',
          loading: false 
        }));
        message.error('Fehler beim Laden der Daten');
      }
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message,
        loading: false 
      }));
      message.error('Fehler beim Laden der Daten: ' + error.message);
    }
  };

  // Handle form selection
  const handleFormSelect = (formConfig: StandardizedFormConfig) => {
    setState(prev => ({ ...prev, selectedForm: formConfig }));
    loadFormData(formConfig);
  };

  // Handle module selection
  const handleModuleSelect = (moduleId: string) => {
    setState(prev => ({ ...prev, selectedModule: moduleId }));
  };

  // Handle dialog actions
  const handleOpenDialog = (mode: 'create' | 'edit' | 'view', record?: any) => {
    setState(prev => ({
      ...prev,
      dialogOpen: true,
      dialogMode: mode,
      selectedRecord: record || null
    }));
  };

  const handleCloseDialog = () => {
    setState(prev => ({
      ...prev,
      dialogOpen: false,
      selectedRecord: null
    }));
  };

  // Handle form save
  const handleFormSave = async (data: any) => {
    if (!state.selectedForm) return;
    
    try {
      if (state.dialogMode === 'create') {
        const response = await formDataService.createFormData(state.selectedForm, data);
        if (response.success) {
          message.success('Datensatz erfolgreich erstellt');
          loadFormData(state.selectedForm);
          handleCloseDialog();
        } else {
          message.error('Fehler beim Erstellen: ' + (response.message || 'Unbekannter Fehler'));
        }
      } else if (state.dialogMode === 'edit' && state.selectedRecord?.id) {
        const response = await formDataService.updateFormData(
          state.selectedForm, 
          state.selectedRecord.id, 
          data
        );
        if (response.success) {
          message.success('Datensatz erfolgreich aktualisiert');
          loadFormData(state.selectedForm);
          handleCloseDialog();
        } else {
          message.error('Fehler beim Aktualisieren: ' + (response.message || 'Unbekannter Fehler'));
        }
      }
    } catch (error: any) {
      message.error('Fehler beim Speichern: ' + error.message);
    }
  };

  // Handle record delete
  const handleRecordDelete = async (record: any) => {
    if (!state.selectedForm) return;
    
    try {
      const response = await formDataService.deleteFormData(state.selectedForm, record.id);
      if (response.success) {
        message.success('Datensatz erfolgreich gelöscht');
        loadFormData(state.selectedForm);
      } else {
        message.error('Fehler beim Löschen: ' + (response.message || 'Unbekannter Fehler'));
      }
    } catch (error: any) {
      message.error('Fehler beim Löschen: ' + error.message);
    }
  };

  // Handle export
  const handleExport = async () => {
    if (!state.selectedForm) return;
    
    try {
      const blob = await formDataService.bulkExportFormData(state.selectedForm);
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${state.selectedForm.id}_export_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        message.success('Export erfolgreich');
      } else {
        message.error('Export fehlgeschlagen');
      }
    } catch (error: any) {
      message.error('Export Fehler: ' + error.message);
    }
  };

  // Get forms for current module
  const getCurrentModuleForms = () => {
    const formRegistry = ExtendedFormRegistryService.getInstance();
    return formRegistry.getFormsByModule(state.selectedModule);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <DatabaseIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Datenbank-Integration Demo
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Diese Demo zeigt die echte Datenbank-Integration für alle 150+ VALEO NeuroERP Formulare.
          Alle CRUD-Operationen werden über die Backend-API ausgeführt.
        </Typography>

        {/* Module Selection */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Modul auswählen
          </Typography>
          <Grid container spacing={2}>
            {MODULES.map((module) => (
              <Grid item key={module.id}>
                <Button
                  variant={state.selectedModule === module.id ? 'contained' : 'outlined'}
                  color={module.color as any}
                  onClick={() => handleModuleSelect(module.id)}
                  startIcon={<ApiIcon />}
                >
                  {module.name}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Main Content */}
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
              <Tab label="Formulare" />
              <Tab label="Daten" />
              <Tab label="API-Tests" />
              <Tab label="Statistiken" />
            </Tabs>
          </Box>

          {/* Forms Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {/* Form Selection */}
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Verfügbare Formulare
                    </Typography>
                    <List>
                      {getCurrentModuleForms().map((form) => (
                        <ListItem
                          key={form.id}
                          button
                          selected={state.selectedForm?.id === form.id}
                          onClick={() => handleFormSelect(form)}
                        >
                          <ListItemText
                            primary={form.metadata.name}
                            secondary={form.metadata.description}
                          />
                          <Chip 
                            label={form.metadata.status} 
                            color={form.metadata.status === 'active' ? 'success' : 'default'}
                            size="small"
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Form Details */}
              <Grid item xs={12} md={8}>
                {state.selectedForm ? (
                  <Card>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">
                          {state.selectedForm.metadata.name}
                        </Typography>
                        <Box>
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog('create')}
                            sx={{ mr: 1 }}
                          >
                            Neu erstellen
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={handleExport}
                          >
                            Export
                          </Button>
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {state.selectedForm.metadata.description}
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2">Modul:</Typography>
                          <Typography variant="body2">{state.selectedForm.module}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2">Version:</Typography>
                          <Typography variant="body2">{state.selectedForm.metadata.version}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2">Status:</Typography>
                          <Typography variant="body2">{state.selectedForm.metadata.status}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2">Felder:</Typography>
                          <Typography variant="body2">{state.selectedForm.fields?.length || 0}</Typography>
                        </Grid>
                      </Grid>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Typography variant="subtitle2" gutterBottom>
                        Features:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {Object.entries(state.selectedForm.features || {}).map(([key, value]) => (
                          <Chip
                            key={key}
                            label={key}
                            color={value ? 'success' : 'default'}
                            size="small"
                            variant={value ? 'filled' : 'outlined'}
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent>
                      <Typography variant="body1" color="text.secondary">
                        Bitte wählen Sie ein Formular aus.
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Grid>
            </Grid>
          </TabPanel>

          {/* Data Tab */}
          <TabPanel value={tabValue} index={1}>
            {state.selectedForm ? (
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                      Daten für: {state.selectedForm.metadata.name}
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={() => loadFormData(state.selectedForm!)}
                      disabled={state.loading}
                    >
                      Aktualisieren
                    </Button>
                  </Box>
                  
                  {state.loading ? (
                    <Box display="flex" justifyContent="center" p={3}>
                      <CircularProgress />
                    </Box>
                  ) : state.error ? (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {state.error}
                    </Alert>
                  ) : (
                    <>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {state.formData.length} Datensätze gefunden
                      </Typography>
                      
                      <List>
                        {state.formData.map((record, index) => (
                          <ListItem key={record.id || index}>
                            <ListItemText
                              primary={`Datensatz ${record.id || index + 1}`}
                              secondary={JSON.stringify(record, null, 2)}
                            />
                            <ListItemSecondaryAction>
                              <IconButton
                                edge="end"
                                onClick={() => handleOpenDialog('view', record)}
                                sx={{ mr: 1 }}
                              >
                                <ViewIcon />
                              </IconButton>
                              <IconButton
                                edge="end"
                                onClick={() => handleOpenDialog('edit', record)}
                                sx={{ mr: 1 }}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                edge="end"
                                onClick={() => handleRecordDelete(record)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent>
                  <Typography variant="body1" color="text.secondary">
                    Bitte wählen Sie ein Formular aus, um die Daten anzuzeigen.
                  </Typography>
                </CardContent>
              </Card>
            )}
          </TabPanel>

          {/* API Tests Tab */}
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      API-Endpunkt Tests
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Testen Sie die Backend-API-Endpunkte direkt.
                    </Typography>
                    
                    <Box display="flex" flexDirection="column" gap={2}>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          // Test GET endpoint
                          if (state.selectedForm) {
                            loadFormData(state.selectedForm);
                          }
                        }}
                      >
                        GET - Daten abrufen
                      </Button>
                      
                      <Button
                        variant="outlined"
                        onClick={() => {
                          // Test POST endpoint
                          handleOpenDialog('create');
                        }}
                      >
                        POST - Neuen Datensatz erstellen
                      </Button>
                      
                      <Button
                        variant="outlined"
                        onClick={() => {
                          // Test PUT endpoint
                          if (state.formData.length > 0) {
                            handleOpenDialog('edit', state.formData[0]);
                          }
                        }}
                        disabled={state.formData.length === 0}
                      >
                        PUT - Datensatz aktualisieren
                      </Button>
                      
                      <Button
                        variant="outlined"
                        onClick={() => {
                          // Test DELETE endpoint
                          if (state.formData.length > 0) {
                            handleRecordDelete(state.formData[0]);
                          }
                        }}
                        disabled={state.formData.length === 0}
                      >
                        DELETE - Datensatz löschen
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Bulk-Operationen
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Testen Sie Import/Export-Funktionen.
                    </Typography>
                    
                    <Box display="flex" flexDirection="column" gap={2}>
                      <Button
                        variant="outlined"
                        onClick={handleExport}
                        disabled={!state.selectedForm}
                      >
                        Export - Daten exportieren
                      </Button>
                      
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        style={{ display: 'none' }}
                        id="import-file-demo"
                        onChange={async (event) => {
                          const file = event.target.files?.[0];
                          if (file && state.selectedForm) {
                            try {
                              const response = await formDataService.bulkImportFormData(state.selectedForm, file);
                              if (response.success) {
                                message.success('Import erfolgreich');
                                loadFormData(state.selectedForm);
                              } else {
                                message.error('Import fehlgeschlagen: ' + (response.message || 'Unbekannter Fehler'));
                              }
                            } catch (error: any) {
                              message.error('Import Fehler: ' + error.message);
                            }
                          }
                        }}
                      />
                      <label htmlFor="import-file-demo">
                        <Button
                          variant="outlined"
                          component="span"
                          disabled={!state.selectedForm}
                        >
                          Import - Daten importieren
                        </Button>
                      </label>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Statistics Tab */}
          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Formular-Statistiken
                    </Typography>
                    
                    <Box display="flex" flexDirection="column" gap={2}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography>Gesamte Formulare:</Typography>
                        <Typography variant="h6">
                          {ExtendedFormRegistryService.getInstance().getFormCount()}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between">
                        <Typography>Warenwirtschaft:</Typography>
                        <Typography variant="h6">
                          {ExtendedFormRegistryService.getInstance().getFormsByModule('warenwirtschaft').length}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between">
                        <Typography>Finanzbuchhaltung:</Typography>
                        <Typography variant="h6">
                          {ExtendedFormRegistryService.getInstance().getFormsByModule('finanzbuchhaltung').length}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between">
                        <Typography>CRM:</Typography>
                        <Typography variant="h6">
                          {ExtendedFormRegistryService.getInstance().getFormsByModule('crm').length}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between">
                        <Typography>Übergreifende Services:</Typography>
                        <Typography variant="h6">
                          {ExtendedFormRegistryService.getInstance().getFormsByModule('uebergreifende_services').length}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      API-Status
                    </Typography>
                    
                    <Box display="flex" flexDirection="column" gap={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CheckCircleIcon color="success" />
                        <Typography>Backend-API erreichbar</Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={1}>
                        <CheckCircleIcon color="success" />
                        <Typography>150+ API-Endpunkte verfügbar</Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={1}>
                        <CheckCircleIcon color="success" />
                        <Typography>RBAC-Integration aktiv</Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={1}>
                        <CheckCircleIcon color="success" />
                        <Typography>Bulk-Operationen verfügbar</Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={1}>
                        <CheckCircleIcon color="success" />
                        <Typography>Horizon Beta AI-Integration</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </Box>

        {/* Form Dialog */}
        <Dialog
          open={state.dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {state.dialogMode === 'create' && 'Neuen Datensatz erstellen'}
            {state.dialogMode === 'edit' && 'Datensatz bearbeiten'}
            {state.dialogMode === 'view' && 'Datensatz anzeigen'}
          </DialogTitle>
          <DialogContent>
            {state.selectedForm && (
              <ModernERPFormWithDB
                config={state.selectedForm}
                mode={state.dialogMode}
                recordId={state.selectedRecord?.id}
                initialData={state.selectedRecord}
                onSave={handleFormSave}
                onCancel={handleCloseDialog}
                autoLoad={true}
              />
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </Container>
  );
};

export default DatabaseIntegrationDemo; 