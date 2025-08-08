import React, { useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Box,
  Chip,
  Alert,
  Divider
} from '@mui/material';
import {
  FormManager,
  FormFactory,
  FormUtils,
  ExtendedFormRegistryService
} from '../components/forms';

/**
 * Demo-Seite für die Formular-Verwaltung
 * 
 * Diese Seite demonstriert alle erstellten Formular-Komponenten
 * und bietet eine Test-Umgebung für die Formular-Verwaltung.
 */

const FormDemo: React.FC = () => {
  const [selectedDemo, setSelectedDemo] = useState<string>('manager');
  const [formStats, setFormStats] = useState(FormUtils.getFormStatistics());

  const demos = [
    {
      id: 'manager',
      title: 'Formular-Manager',
      description: 'Zentrale Verwaltung aller Formulare',
      component: <FormManager />
    },
    {
      id: 'statistics',
      title: 'Formular-Statistiken',
      description: 'Übersicht über alle registrierten Formulare',
      component: <FormStatisticsDemo />
    },
    {
      id: 'factory',
      title: 'Formular-Factory',
      description: 'Dynamische Formular-Erstellung',
      component: <FormFactoryDemo />
    },
    {
      id: 'validation',
      title: 'Formular-Validierung',
      description: 'Test der Validierungslogik',
      component: <FormValidationDemo />
    }
  ];

  return (
    <Container maxWidth="xl" className="py-8">
      <Typography variant="h3" component="h1" gutterBottom>
        Formular-Demo
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Demonstration der erweiterten Formular-Verwaltung für VALEO NeuroERP
      </Typography>

      {/* Demo-Navigation */}
      <Box className="mb-6">
        <Grid container spacing={2}>
          {demos.map((demo) => (
            <Grid item key={demo.id}>
              <Button
                variant={selectedDemo === demo.id ? 'contained' : 'outlined'}
                onClick={() => setSelectedDemo(demo.id)}
                className="min-w-[200px]"
              >
                {demo.title}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Demo-Content */}
      <Card>
        <CardContent>
          {demos.find(d => d.id === selectedDemo)?.component}
        </CardContent>
      </Card>
    </Container>
  );
};

// Formular-Statistiken Demo
const FormStatisticsDemo: React.FC = () => {
  const formRegistry = ExtendedFormRegistryService.getInstance();
  const allForms = formRegistry.getAllForms();
  const moduleCounts = formRegistry.getModuleCounts();

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Formular-Statistiken
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Modul-Übersicht
              </Typography>
              <div className="space-y-2">
                {Object.entries(moduleCounts).map(([module, count]) => (
                  <div key={module} className="flex justify-between items-center">
                    <Typography variant="body2" className="capitalize">
                      {module}
                    </Typography>
                    <Chip label={count} color="primary" size="small" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Formular-Liste
              </Typography>
              <div className="max-h-96 overflow-y-auto space-y-1">
                {allForms.map((form) => (
                  <div key={form.id} className="p-2 border rounded">
                    <Typography variant="body2" className="font-medium">
                      {form.metadata.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" className="mb-2">
                      {form.id} • v{form.metadata.version} • {form.module}
                    </Typography>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

// Formular-Factory Demo
const FormFactoryDemo: React.FC = () => {
  const [selectedFormId, setSelectedFormId] = useState<string>('');
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('view');
  const [showForm, setShowForm] = useState(false);

  const formRegistry = ExtendedFormRegistryService.getInstance();
  const allForms = formRegistry.getAllForms();

  const handleCreateForm = () => {
    if (selectedFormId) {
      setShowForm(true);
    }
  };

  const handleFormSave = async (data: any) => {
    console.log('Formular gespeichert:', data);
    setShowForm(false);
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Formular-Factory Demo
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Formular auswählen
              </Typography>
              
              <div className="space-y-2 mb-4">
                <select
                  value={selectedFormId}
                  onChange={(e) => setSelectedFormId(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Formular auswählen...</option>
                  {allForms.map((form) => (
                    <option key={form.id} value={form.id}>
                      {form.metadata.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 mb-4">
                <Typography variant="body2">Modus:</Typography>
                <div className="flex space-x-2">
                  {(['create', 'edit', 'view'] as const).map((mode) => (
                    <Button
                      key={mode}
                      variant={formMode === mode ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => setFormMode(mode)}
                    >
                      {mode}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                variant="contained"
                onClick={handleCreateForm}
                disabled={!selectedFormId}
                fullWidth
              >
                Formular erstellen
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          {showForm && selectedFormId && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Dynamisch erstelltes Formular
                </Typography>
                {FormFactory.createForm(selectedFormId, {
                  mode: formMode,
                  onSave: handleFormSave,
                  onCancel: handleFormCancel
                })}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </div>
  );
};

// Formular-Validierung Demo
const FormValidationDemo: React.FC = () => {
  const [testData, setTestData] = useState<any>({});
  const [validationResult, setValidationResult] = useState<any>(null);
  const [selectedFormId, setSelectedFormId] = useState<string>('');

  const formRegistry = ExtendedFormRegistryService.getInstance();
  const allForms = formRegistry.getAllForms();

  const handleValidation = () => {
    if (selectedFormId) {
      const result = FormUtils.validateFormData(selectedFormId, testData);
      setValidationResult(result);
    }
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Formular-Validierung Demo
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Validierung testen
              </Typography>
              
              <div className="space-y-4">
                <div>
                  <Typography variant="body2" gutterBottom>
                    Formular auswählen:
                  </Typography>
                  <select
                    value={selectedFormId}
                    onChange={(e) => setSelectedFormId(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Formular auswählen...</option>
                    {allForms.map((form) => (
                      <option key={form.id} value={form.id}>
                        {form.metadata.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Typography variant="body2" gutterBottom>
                    Test-Daten (JSON):
                  </Typography>
                  <textarea
                    value={JSON.stringify(testData, null, 2)}
                    onChange={(e) => {
                      try {
                        setTestData(JSON.parse(e.target.value));
                      } catch {
                        // Ignore invalid JSON
                      }
                    }}
                    className="w-full p-2 border rounded"
                    rows={6}
                    placeholder='{"field1": "value1", "field2": "value2"}'
                  />
                </div>

                <Button
                  variant="contained"
                  onClick={handleValidation}
                  disabled={!selectedFormId}
                  fullWidth
                >
                  Validieren
                </Button>
              </div>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Validierungs-Ergebnis
              </Typography>
              
              {validationResult && (
                <div>
                  <Alert 
                    severity={validationResult.valid ? 'success' : 'error'}
                    className="mb-4"
                  >
                    {validationResult.valid ? 'Validierung erfolgreich' : 'Validierung fehlgeschlagen'}
                  </Alert>
                  
                  {!validationResult.valid && validationResult.errors && (
                    <div>
                      <Typography variant="body2" gutterBottom>
                        Fehler:
                      </Typography>
                      <ul className="list-disc list-inside space-y-1">
                        {validationResult.errors.map((error: any, index: number) => (
                          <li key={index} className="text-red-600">
                            {error.path.join('.')}: {error.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default FormDemo; 