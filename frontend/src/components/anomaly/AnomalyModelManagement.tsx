import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Tooltip,
  Divider,
  Card,
  CardContent,
  CardActions,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayArrowIcon,
  Check as CheckIcon,
  DataObject as DataObjectIcon,
  Error as ErrorIcon,
  Cancel as CancelIcon,
  Timeline as TimelineIcon,
  Leaderboard as LeaderboardIcon,
  Insights as InsightsIcon
} from '@mui/icons-material';
import anomalyApi, { AnomalyModel, TrainingParams } from '../../services/anomalyApi';

// Chart.js für Modelleistung und Vorhersagen
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip as ChartTooltip, 
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Chart.js registrieren
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

// Interface für Tab-Panel
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// TabPanel-Komponente
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`model-tabpanel-${index}`}
      aria-labelledby={`model-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface AnomalyModelManagementProps {
  selectedModule: string;
}

const AnomalyModelManagement: React.FC<AnomalyModelManagementProps> = ({ selectedModule }) => {
  // State für die Modelle
  const [models, setModels] = useState<AnomalyModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State für das Training
  const [trainingDialogOpen, setTrainingDialogOpen] = useState<boolean>(false);
  const [trainingParams, setTrainingParams] = useState<TrainingParams>({
    module: selectedModule === 'all' ? 'inventory' : selectedModule,
    data_type: 'time_series'
  });
  const [trainingInProgress, setTrainingInProgress] = useState<boolean>(false);
  const [trainingSuccess, setTrainingSuccess] = useState<boolean | null>(null);
  const [trainingError, setTrainingError] = useState<string | null>(null);
  
  // State für Löschdialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [modelToDelete, setModelToDelete] = useState<AnomalyModel | null>(null);

  // Neue States für Model Dashboard
  const [activeTab, setActiveTab] = useState(0);
  const [selectedModel, setSelectedModel] = useState<AnomalyModel | null>(null);
  const [modelDetailsOpen, setModelDetailsOpen] = useState<boolean>(false);
  const [modelMetrics, setModelMetrics] = useState<any | null>(null);
  const [modelPredictions, setModelPredictions] = useState<any | null>(null);
  const [metricsLoading, setMetricsLoading] = useState<boolean>(false);
  const [predictionsLoading, setPredictionsLoading] = useState<boolean>(false);

  // Verfügbare Datentypen
  const dataTypes = [
    { value: 'time_series', label: 'Zeitreihen' },
    { value: 'categorical', label: 'Kategorische Daten' },
    { value: 'numerical', label: 'Numerische Daten' },
    { value: 'textual', label: 'Textdaten' },
    { value: 'transactional', label: 'Transaktionsdaten' }
  ];

  // Laden der Modelle
  useEffect(() => {
    fetchModels();
  }, [selectedModule]);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const moduleParam = selectedModule === 'all' ? undefined : selectedModule;
      const data = await anomalyApi.listModels(moduleParam);
      setModels(data);
      setError(null);
    } catch (err) {
      console.error('Fehler beim Laden der Modelle:', err);
      setError('Die Modelle konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  // Handler für das Öffnen/Schließen des Trainings-Dialogs
  const handleOpenTrainingDialog = () => {
    setTrainingParams({
      module: selectedModule === 'all' ? 'inventory' : selectedModule,
      data_type: 'time_series'
    });
    setTrainingSuccess(null);
    setTrainingError(null);
    setTrainingDialogOpen(true);
  };

  const handleCloseTrainingDialog = () => {
    setTrainingDialogOpen(false);
  };

  // Handler für Änderungen in den Trainingsparametern
  const handleTrainingParamChange = (field: string, value: string) => {
    setTrainingParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handler für das Training eines Modells
  const handleTrainModel = async () => {
    setTrainingInProgress(true);
    setTrainingSuccess(null);
    setTrainingError(null);
    
    try {
      await anomalyApi.trainModel(trainingParams);
      setTrainingSuccess(true);
      // Modelle neu laden nach erfolgreichem Training
      fetchModels();
    } catch (err) {
      console.error('Fehler beim Training des Modells:', err);
      setTrainingError('Das Modell konnte nicht trainiert werden. Bitte versuchen Sie es später erneut.');
      setTrainingSuccess(false);
    } finally {
      setTrainingInProgress(false);
    }
  };

  // Handler für das Öffnen/Schließen des Lösch-Dialogs
  const handleOpenDeleteDialog = (model: AnomalyModel) => {
    setModelToDelete(model);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setModelToDelete(null);
  };

  // Handler für das Löschen eines Modells
  const handleDeleteModel = async () => {
    if (!modelToDelete) return;
    
    try {
      await anomalyApi.deleteModel(modelToDelete.module, modelToDelete.data_type);
      // Modelle neu laden nach erfolgreichem Löschen
      fetchModels();
      handleCloseDeleteDialog();
    } catch (err) {
      console.error('Fehler beim Löschen des Modells:', err);
      setError('Das Modell konnte nicht gelöscht werden. Bitte versuchen Sie es später erneut.');
    }
  };

  // Neue Handler für Model Dashboard
  const handleOpenModelDetails = async (model: AnomalyModel) => {
    setSelectedModel(model);
    setModelDetailsOpen(true);
    setActiveTab(0);
    
    // Modelleistungsmetriken laden
    await fetchModelMetrics(model.id);
  };

  const handleCloseModelDetails = () => {
    setModelDetailsOpen(false);
    setSelectedModel(null);
    setModelMetrics(null);
    setModelPredictions(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    
    // Daten laden, wenn benötigt
    if (newValue === 1 && selectedModel && !modelPredictions) {
      fetchModelPredictions(selectedModel.id);
    }
  };

  const fetchModelMetrics = async (modelId: string) => {
    setMetricsLoading(true);
    try {
      const data = await anomalyApi.getModelPerformanceMetrics(modelId);
      setModelMetrics(data);
    } catch (err) {
      console.error('Fehler beim Laden der Modelleistungsmetriken:', err);
      // Simulierte Daten für die Demo
      setModelMetrics({
        accuracy: 0.92,
        precision: 0.88,
        recall: 0.85,
        f1_score: 0.86,
        confusion_matrix: {
          true_positives: 42,
          false_positives: 6,
          true_negatives: 135,
          false_negatives: 7
        },
        roc_auc: 0.94,
        training_time: 120, // in Sekunden
        training_history: [
          { epoch: 1, loss: 0.6, accuracy: 0.75 },
          { epoch: 2, loss: 0.4, accuracy: 0.82 },
          { epoch: 3, loss: 0.3, accuracy: 0.86 },
          { epoch: 4, loss: 0.25, accuracy: 0.89 },
          { epoch: 5, loss: 0.22, accuracy: 0.92 }
        ]
      });
    } finally {
      setMetricsLoading(false);
    }
  };

  const fetchModelPredictions = async (modelId: string) => {
    setPredictionsLoading(true);
    try {
      const data = await anomalyApi.getModelPredictions(modelId, 7);
      setModelPredictions(data);
    } catch (err) {
      console.error('Fehler beim Laden der Modellvorhersagen:', err);
      // Simulierte Daten für die Demo
      setModelPredictions({
        dates: ['2025-05-28', '2025-05-29', '2025-05-30', '2025-05-31', '2025-06-01', '2025-06-02', '2025-06-03'],
        values: [145, 152, 158, 145, 163, 178, 169],
        anomaly_probabilities: [0.12, 0.08, 0.25, 0.05, 0.35, 0.75, 0.15],
        anomaly_threshold: 0.7,
        predicted_anomalies: [false, false, false, false, false, true, false]
      });
    } finally {
      setPredictionsLoading(false);
    }
  };

  // Formatieren des Zeitstempels für die Anzeige
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Chart-Daten für Metriken
  const trainingHistoryChart = modelMetrics?.training_history ? {
    labels: modelMetrics.training_history.map((point: any) => `Epoch ${point.epoch}`),
    datasets: [
      {
        label: 'Genauigkeit',
        data: modelMetrics.training_history.map((point: any) => point.accuracy),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4
      },
      {
        label: 'Verlust',
        data: modelMetrics.training_history.map((point: any) => point.loss),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4
      }
    ]
  } : null;

  const confusionMatrixChart = modelMetrics?.confusion_matrix ? {
    labels: ['Richtig Positiv', 'Falsch Positiv', 'Richtig Negativ', 'Falsch Negativ'],
    datasets: [
      {
        data: [
          modelMetrics.confusion_matrix.true_positives,
          modelMetrics.confusion_matrix.false_positives,
          modelMetrics.confusion_matrix.true_negatives,
          modelMetrics.confusion_matrix.false_negatives
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 1
      }
    ]
  } : null;

  // Chart-Daten für Vorhersagen
  const predictionsChart = modelPredictions ? {
    labels: modelPredictions.dates,
    datasets: [
      {
        label: 'Werte',
        data: modelPredictions.values,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'Anomaliewahrscheinlichkeit',
        data: modelPredictions.anomaly_probabilities,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderDash: [5, 5],
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  } : null;

  const predictionsChartOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: 'Vorhersagen und Anomaliewahrscheinlichkeiten',
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Werte'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Anomaliewahrscheinlichkeit'
        },
        min: 0,
        max: 1,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Modellverwaltung
        </Typography>
        
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={fetchModels}
            sx={{ mr: 1 }}
          >
            Aktualisieren
          </Button>
          
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleOpenTrainingDialog}
          >
            Neues Modell trainieren
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : models.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Keine Modelle vorhanden
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Es wurden noch keine Anomalieerkennungsmodelle trainiert. Klicken Sie auf 'Neues Modell trainieren', um zu beginnen.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleOpenTrainingDialog}
          >
            Neues Modell trainieren
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Modul</TableCell>
                <TableCell>Datentyp</TableCell>
                <TableCell>Genauigkeit</TableCell>
                <TableCell>Erstellt am</TableCell>
                <TableCell>Aktualisiert am</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {models.map((model) => (
                <TableRow key={model.id}>
                  <TableCell>{model.module}</TableCell>
                  <TableCell>{model.data_type}</TableCell>
                  <TableCell>{(model.accuracy * 100).toFixed(2)}%</TableCell>
                  <TableCell>{formatDate(model.created_at)}</TableCell>
                  <TableCell>{formatDate(model.updated_at)}</TableCell>
                  <TableCell>
                    <Chip
                      label={model.is_active ? 'Aktiv' : 'Inaktiv'}
                      color={model.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Dashboard anzeigen">
                      <IconButton 
                        onClick={() => handleOpenModelDetails(model)} 
                        size="small"
                      >
                        <InsightsIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Löschen">
                      <IconButton 
                        onClick={() => handleOpenDeleteDialog(model)} 
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog für das Training eines neuen Modells */}
      <Dialog open={trainingDialogOpen} onClose={handleCloseTrainingDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Neues Modell trainieren</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="training-module-label">Modul</InputLabel>
                  <Select
                    labelId="training-module-label"
                    value={trainingParams.module}
                    label="Modul"
                    onChange={(e) => handleTrainingParamChange('module', e.target.value)}
                  >
                    <MenuItem value="inventory">Lagerbestand</MenuItem>
                    <MenuItem value="finance">Finanzen</MenuItem>
                    <MenuItem value="production">Produktion</MenuItem>
                    <MenuItem value="supply_chain">Lieferkette</MenuItem>
                    <MenuItem value="quality">Qualitätssicherung</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="training-data-type-label">Datentyp</InputLabel>
                  <Select
                    labelId="training-data-type-label"
                    value={trainingParams.data_type}
                    label="Datentyp"
                    onChange={(e) => handleTrainingParamChange('data_type', e.target.value)}
                  >
                    {dataTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            {trainingError && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {trainingError}
              </Alert>
            )}
            
            {trainingSuccess && (
              <Alert severity="success" sx={{ mt: 3 }}>
                Das Modell wurde erfolgreich trainiert.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTrainingDialog}>Abbrechen</Button>
          <Button 
            onClick={handleTrainModel} 
            variant="contained"
            disabled={trainingInProgress}
            startIcon={trainingInProgress ? <CircularProgress size={20} /> : <PlayArrowIcon />}
          >
            {trainingInProgress ? 'Training läuft...' : 'Modell trainieren'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog für das Löschen eines Modells */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Modell löschen</DialogTitle>
        <DialogContent>
          <Typography>
            Sind Sie sicher, dass Sie das Modell für {modelToDelete?.module} ({modelToDelete?.data_type}) löschen möchten?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Diese Aktion kann nicht rückgängig gemacht werden.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} startIcon={<CancelIcon />}>
            Abbrechen
          </Button>
          <Button onClick={handleDeleteModel} color="error" startIcon={<DeleteIcon />}>
            Löschen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog für Modell-Dashboard */}
      <Dialog open={modelDetailsOpen} onClose={handleCloseModelDetails} maxWidth="md" fullWidth>
        {selectedModel && (
          <>
            <DialogTitle>
              Modell-Dashboard: {selectedModel.module} - {selectedModel.data_type}
            </DialogTitle>
            <DialogContent>
              <Tabs value={activeTab} onChange={handleTabChange} centered sx={{ mb: 2 }}>
                <Tab label="Leistungsmetriken" icon={<LeaderboardIcon />} iconPosition="start" />
                <Tab label="Vorhersagen" icon={<TimelineIcon />} iconPosition="start" />
              </Tabs>
              
              <TabPanel value={activeTab} index={0}>
                {metricsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : modelMetrics ? (
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>Leistungsmetriken</Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Typography variant="subtitle2" color="text.secondary">Genauigkeit</Typography>
                              <Typography variant="h5">{(modelMetrics.accuracy * 100).toFixed(2)}%</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="subtitle2" color="text.secondary">Präzision</Typography>
                              <Typography variant="h5">{(modelMetrics.precision * 100).toFixed(2)}%</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="subtitle2" color="text.secondary">Sensitivität</Typography>
                              <Typography variant="h5">{(modelMetrics.recall * 100).toFixed(2)}%</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="subtitle2" color="text.secondary">F1-Score</Typography>
                              <Typography variant="h5">{(modelMetrics.f1_score * 100).toFixed(2)}%</Typography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>Konfusionsmatrix</Typography>
                          {confusionMatrixChart && (
                            <Box sx={{ height: 200 }}>
                              <Pie data={confusionMatrixChart} />
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>Trainingsverlauf</Typography>
                          {trainingHistoryChart && (
                            <Line 
                              data={trainingHistoryChart} 
                              options={{
                                responsive: true,
                                plugins: {
                                  title: {
                                    display: true,
                                    text: 'Genauigkeit und Verlust während des Trainings'
                                  }
                                }
                              }}
                            />
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                ) : (
                  <Alert severity="info">
                    Keine Leistungsmetriken verfügbar.
                  </Alert>
                )}
              </TabPanel>
              
              <TabPanel value={activeTab} index={1}>
                {predictionsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : modelPredictions ? (
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>7-Tage-Vorhersage</Typography>
                          {predictionsChart && (
                            <Line data={predictionsChart} options={predictionsChartOptions} />
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>Vorhersagedetails</Typography>
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Datum</TableCell>
                                  <TableCell>Wert</TableCell>
                                  <TableCell>Anomaliewahrscheinlichkeit</TableCell>
                                  <TableCell>Status</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {modelPredictions.dates.map((date: string, index: number) => (
                                  <TableRow key={date}>
                                    <TableCell>{date}</TableCell>
                                    <TableCell>{modelPredictions.values[index]}</TableCell>
                                    <TableCell>{(modelPredictions.anomaly_probabilities[index] * 100).toFixed(2)}%</TableCell>
                                    <TableCell>
                                      <Chip
                                        label={modelPredictions.predicted_anomalies[index] ? 'Anomalie' : 'Normal'}
                                        color={modelPredictions.predicted_anomalies[index] ? 'error' : 'success'}
                                        size="small"
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                ) : (
                  <Alert severity="info">
                    Keine Vorhersagedaten verfügbar.
                  </Alert>
                )}
              </TabPanel>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseModelDetails}>Schließen</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AnomalyModelManagement; 