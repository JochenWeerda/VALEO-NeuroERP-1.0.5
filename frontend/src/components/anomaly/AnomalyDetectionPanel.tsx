import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  FormHelperText,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  LinearProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  PlayArrow as PlayArrowIcon,
  Help as HelpIcon,
  Autorenew as AutorenewIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import anomalyApi, { 
  DetectionParams, 
  AnomalyDetectionResult,
  AnomalyHistory
} from '../../services/anomalyApi';

// Chart.js für Echtzeitvisualisierung
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip as ChartTooltip, 
  Legend 
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Chart.js registrieren
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

interface AnomalyDetectionPanelProps {
  selectedModule: string;
}

const AnomalyDetectionPanel: React.FC<AnomalyDetectionPanelProps> = ({ selectedModule }) => {
  // State für Formulardaten
  const [formData, setFormData] = useState<DetectionParams>({
    module: selectedModule === 'all' ? 'inventory' : selectedModule,
    data_type: 'time_series'
  });

  // State für die JSON-Eingabe
  const [jsonInput, setJsonInput] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  
  // State für Ergebnisse
  const [results, setResults] = useState<AnomalyDetectionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // State für den aktiven Datentyp
  const [activeDataType, setActiveDataType] = useState<string>('time_series');

  // Neue States für Echtzeitüberwachung und -visualisierung
  const [realtimeMonitoring, setRealtimeMonitoring] = useState<boolean>(false);
  const [realtimeData, setRealtimeData] = useState<any[]>([]);
  const [realtimeAnomalies, setRealtimeAnomalies] = useState<any[]>([]);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [realtimeLoading, setRealtimeLoading] = useState<boolean>(false);

  // Verfügbare Datentypen
  const dataTypes = [
    { value: 'time_series', label: 'Zeitreihen' },
    { value: 'categorical', label: 'Kategorische Daten' },
    { value: 'numerical', label: 'Numerische Daten' },
    { value: 'textual', label: 'Textdaten' },
    { value: 'transactional', label: 'Transaktionsdaten' }
  ];

  // JSON-Beispiele für die verschiedenen Datentypen
  const jsonExamples = {
    time_series: JSON.stringify([
      { date: "2025-05-01", value: 150, item_id: 1 },
      { date: "2025-05-02", value: 142, item_id: 1 },
      { date: "2025-05-03", value: 158, item_id: 1 },
      { date: "2025-05-04", value: 145, item_id: 1 },
      { date: "2025-05-05", value: 240, item_id: 1 }
    ], null, 2),
    categorical: JSON.stringify([
      { category: "A", count: 25, frequency: 0.1 },
      { category: "B", count: 180, frequency: 0.72 },
      { category: "C", count: 45, frequency: 0.18 }
    ], null, 2),
    numerical: JSON.stringify([
      { value: 12.5, name: "measure_1" },
      { value: 18.9, name: "measure_2" },
      { value: 95.2, name: "measure_3" },
      { value: 145.8, name: "measure_4" },
      { value: 22.3, name: "measure_5" }
    ], null, 2),
    textual: JSON.stringify([
      { text: "Normale Transaktion abgeschlossen", type: "transaction_log" },
      { text: "Fehler bei der Datenübertragung", type: "transaction_log" },
      { text: "Normale Transaktion abgeschlossen", type: "transaction_log" }
    ], null, 2),
    transactional: JSON.stringify([
      { transaction_id: "T001", amount: 125.50, customer_id: "C001", items: 3 },
      { transaction_id: "T002", amount: 75.20, customer_id: "C002", items: 1 },
      { transaction_id: "T003", amount: 1250.00, customer_id: "C003", items: 2 }
    ], null, 2)
  };

  // Bei Komponenteninitialisierung Beispiel-JSON für den aktiven Datentyp setzen
  useEffect(() => {
    setJsonInput(jsonExamples[activeDataType as keyof typeof jsonExamples]);
  }, [activeDataType]);

  // Cleanup beim Komponentenabbau
  useEffect(() => {
    return () => {
      // Echtzeitüberwachung beenden, falls aktiv
      if (subscriptionId) {
        anomalyApi.unsubscribeFromRealtimeUpdates(subscriptionId);
      }
    };
  }, [subscriptionId]);

  // Handler für Änderungen in den Formularfeldern
  const handleFormChange = (field: string, value: string) => {
    if (field === 'data_type') {
      setActiveDataType(value);
      // Beispiel-JSON für den ausgewählten Datentyp setzen
      setJsonInput(jsonExamples[value as keyof typeof jsonExamples]);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handler für Änderungen in der JSON-Eingabe
  const handleJsonChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(event.target.value);
    setJsonError(null);
  };

  // Handler für die Erkennung von Anomalien
  const handleDetection = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      // JSON-Eingabe validieren
      let data = null;
      try {
        data = JSON.parse(jsonInput);
      } catch (e) {
        setJsonError('Ungültiges JSON-Format. Bitte überprüfen Sie Ihre Eingabe.');
        setLoading(false);
        return;
      }
      
      // API-Aufruf zur Anomalieerkennung
      const response = await anomalyApi.detectAnomalies({
        ...formData,
        data
      });
      
      setResults(response);

      // Wenn wir Zeitreihendaten haben, fügen wir sie auch zu den Echtzeitdaten hinzu
      if (activeDataType === 'time_series' && Array.isArray(data)) {
        // Vorhandene Echtzeitdaten beibehalten und neue hinzufügen
        setRealtimeData(prevData => {
          // Max. 50 Datenpunkte behalten
          const combinedData = [...prevData, ...data].slice(-50);
          return combinedData;
        });

        // Anomalien hinzufügen
        if (response.anomaly_indices && response.anomaly_indices.length > 0) {
          const newAnomalies = response.anomaly_indices.map(index => data[index]);
          setRealtimeAnomalies(prevAnomalies => {
            // Max. 20 Anomalien behalten
            const combinedAnomalies = [...prevAnomalies, ...newAnomalies].slice(-20);
            return combinedAnomalies;
          });
        }
      }
    } catch (err) {
      console.error('Fehler bei der Anomalieerkennung:', err);
      setError('Bei der Anomalieerkennung ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  // Handler zum Zurücksetzen des Formulars
  const handleReset = () => {
    setFormData({
      module: selectedModule === 'all' ? 'inventory' : selectedModule,
      data_type: 'time_series'
    });
    setActiveDataType('time_series');
    setJsonInput(jsonExamples.time_series);
    setResults(null);
    setError(null);
    setJsonError(null);
    setRealtimeData([]);
    setRealtimeAnomalies([]);
  };

  // Beispiel-JSON-Daten laden
  const loadExample = () => {
    setJsonInput(jsonExamples[activeDataType as keyof typeof jsonExamples]);
    setJsonError(null);
  };

  // Echtzeitüberwachung ein-/ausschalten
  const toggleRealtimeMonitoring = async () => {
    if (!realtimeMonitoring) {
      // Echtzeitüberwachung starten
      setRealtimeLoading(true);
      try {
        // Auf Echtzeitdaten abonnieren
        const subId = anomalyApi.subscribeToRealtimeUpdates(
          formData.module,
          (anomaly: AnomalyHistory) => {
            // Neue Anomalie erhalten
            if (anomaly.module === formData.module) {
              setLastUpdate(new Date());
              
              // In unserem Fall werden wir die Daten zum Chart hinzufügen
              // In einer realen Implementierung würden wir die tatsächlichen Daten der Anomalie verwenden
              const randomValue = 100 + Math.random() * 100;
              const newDataPoint = {
                date: new Date().toISOString().split('T')[0],
                value: randomValue,
                item_id: 1
              };
              
              setRealtimeData(prevData => {
                const combinedData = [...prevData, newDataPoint].slice(-50);
                return combinedData;
              });
              
              // Wenn es sich um eine Anomalie handelt, zum Anomalien-Array hinzufügen
              if (anomaly.anomaly_score > 0.7) {
                setRealtimeAnomalies(prevAnomalies => {
                  const combinedAnomalies = [...prevAnomalies, newDataPoint].slice(-20);
                  return combinedAnomalies;
                });
              }
            }
          }
        );
        
        setSubscriptionId(subId);
        setRealtimeMonitoring(true);
      } catch (err) {
        console.error('Fehler beim Starten der Echtzeitüberwachung:', err);
        setError('Die Echtzeitüberwachung konnte nicht gestartet werden. Bitte versuchen Sie es später erneut.');
      } finally {
        setRealtimeLoading(false);
      }
    } else {
      // Echtzeitüberwachung beenden
      if (subscriptionId) {
        anomalyApi.unsubscribeFromRealtimeUpdates(subscriptionId);
        setSubscriptionId(null);
      }
      setRealtimeMonitoring(false);
    }
  };

  // Daten für das Chart vorbereiten
  const chartData = {
    labels: realtimeData.map(item => item.date),
    datasets: [
      {
        label: 'Messwerte',
        data: realtimeData.map(item => item.value),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4
      },
      {
        label: 'Anomalien',
        data: realtimeData.map(item => {
          // Prüfen, ob dieser Datenpunkt eine Anomalie ist
          return realtimeAnomalies.some(anomaly => 
            anomaly.date === item.date && anomaly.value === item.value
          ) ? item.value : null;
        }),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        pointRadius: 6,
        pointHoverRadius: 8,
        showLine: false
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Echtzeit-Anomalieüberwachung',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Anomalieerkennung
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Erkennen Sie Anomalien in Ihren Daten mit Hilfe der KI. Wählen Sie ein Modul und einen Datentyp aus, geben Sie die zu analysierenden Daten ein und starten Sie die Erkennung.
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          {/* Modul-Auswahl */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="module-select-label">Modul</InputLabel>
              <Select
                labelId="module-select-label"
                id="module-select"
                value={formData.module}
                label="Modul"
                onChange={(e) => handleFormChange('module', e.target.value)}
              >
                <MenuItem value="inventory">Lagerbestand</MenuItem>
                <MenuItem value="finance">Finanzen</MenuItem>
                <MenuItem value="production">Produktion</MenuItem>
                <MenuItem value="supply_chain">Lieferkette</MenuItem>
                <MenuItem value="quality">Qualitätssicherung</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Datentyp-Auswahl */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="data-type-select-label">Datentyp</InputLabel>
              <Select
                labelId="data-type-select-label"
                id="data-type-select"
                value={formData.data_type}
                label="Datentyp"
                onChange={(e) => handleFormChange('data_type', e.target.value)}
              >
                {dataTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Echtzeitüberwachung */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={realtimeMonitoring}
                    onChange={toggleRealtimeMonitoring}
                    disabled={realtimeLoading}
                  />
                }
                label="Echtzeitüberwachung"
              />
              {realtimeMonitoring && lastUpdate && (
                <Typography variant="caption" color="text.secondary">
                  Letzte Aktualisierung: {lastUpdate.toLocaleTimeString()}
                </Typography>
              )}
            </Box>
            {realtimeLoading && <LinearProgress sx={{ mb: 2 }} />}
          </Grid>

          {/* Echtzeit-Chart */}
          {(realtimeMonitoring || realtimeData.length > 0) && activeDataType === 'time_series' && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Line data={chartData} options={chartOptions} />
              </Paper>
            </Grid>
          )}

          {/* JSON-Eingabe */}
          <Grid item xs={12}>
            <TextField
              label="Daten (JSON-Format)"
              multiline
              rows={10}
              value={jsonInput}
              onChange={handleJsonChange}
              fullWidth
              error={!!jsonError}
              helperText={jsonError}
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <Tooltip title="Beispieldaten laden">
                    <IconButton onClick={loadExample} edge="end">
                      <HelpIcon />
                    </IconButton>
                  </Tooltip>
                )
              }}
            />
          </Grid>

          {/* Aktionsbuttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleReset}
                startIcon={<DeleteIcon />}
              >
                Zurücksetzen
              </Button>
              <Button
                variant="contained"
                onClick={handleDetection}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                disabled={loading}
              >
                {loading ? 'Wird ausgeführt...' : 'Anomalien erkennen'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Fehlermeldung */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Ergebnisse */}
      {results && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Erkennungsergebnisse
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Chip 
                icon={<InfoIcon />} 
                label={`Erkennung durchgeführt am ${new Date(results.detection_time).toLocaleString()}`} 
                size="small" 
                sx={{ mr: 1 }} 
              />
              <Chip 
                icon={results.anomalies.length > 0 ? <ErrorIcon /> : <CheckCircleIcon />} 
                label={`${results.anomalies.length} Anomalien gefunden`} 
                color={results.anomalies.length > 0 ? "error" : "success"}
                size="small" 
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            {results.anomalies.length > 0 ? (
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Anomaliescore</TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.anomalies.map((anomaly, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Chip 
                            label={results.anomaly_scores[results.anomaly_indices[index]].toFixed(3)} 
                            color={results.anomaly_scores[results.anomaly_indices[index]] < -0.5 ? "error" : "warning"}
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>
                          <pre style={{ margin: 0, fontSize: '0.8rem', maxHeight: '100px', overflow: 'auto' }}>
                            {JSON.stringify(anomaly, null, 2)}
                          </pre>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="success">
                Keine Anomalien in den analysierten Daten gefunden.
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AnomalyDetectionPanel; 