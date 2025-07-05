import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Tabs, 
  Tab, 
  Container, 
  Grid, 
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Button
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  DataObject as DataObjectIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  BugReport as BugReportIcon,
  ErrorOutline as ErrorOutlineIcon
} from '@mui/icons-material';
import anomalyApi, { AnomalyStats, AnomalyHistory } from '../services/anomalyApi';
import AnomalyDetectionPanel from '../components/anomaly/AnomalyDetectionPanel';
import AnomalyHistoryPanel from '../components/anomaly/AnomalyHistoryPanel';
import AnomalyModelManagement from '../components/anomaly/AnomalyModelManagement';
import AnomalySettings from '../components/anomaly/AnomalySettings';

// TabPanel-Komponente für die Tab-Inhalte
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`anomaly-tabpanel-${index}`}
      aria-labelledby={`anomaly-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

// Hauptkomponente für das Anomalieerkennungs-Dashboard
const AnomalyDashboard: React.FC = () => {
  // State für die aktive Tab-Auswahl
  const [activeTab, setActiveTab] = useState(0);
  
  // State für die Dropdown-Auswahl des Moduls
  const [selectedModule, setSelectedModule] = useState<string>('all');
  
  // State für die Statistiken und den Ladestatus
  const [stats, setStats] = useState<AnomalyStats | null>(null);
  const [recentAnomalies, setRecentAnomalies] = useState<AnomalyHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Verfügbare Module
  const modules = [
    { value: 'all', label: 'Alle Module' },
    { value: 'inventory', label: 'Lagerbestand' },
    { value: 'finance', label: 'Finanzen' },
    { value: 'production', label: 'Produktion' },
    { value: 'supply_chain', label: 'Lieferkette' },
    { value: 'quality', label: 'Qualitätssicherung' }
  ];

  // Laden der Anomalie-Statistiken beim ersten Rendern
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const moduleParam = selectedModule === 'all' ? undefined : selectedModule;
        const statsData = await anomalyApi.getAnomalyStats(moduleParam);
        const historyData = await anomalyApi.getAnomalyHistory(moduleParam, undefined, undefined, 5);
        
        setStats(statsData);
        setRecentAnomalies(historyData);
        setError(null);
      } catch (err) {
        console.error('Fehler beim Laden der Anomaliedaten:', err);
        setError('Die Anomaliedaten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedModule]);

  // Handler für Tab-Änderungen
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handler für Modul-Änderungen
  const handleModuleChange = (event: SelectChangeEvent) => {
    setSelectedModule(event.target.value);
  };

  // Handler für Aktualisierungen
  const handleRefresh = () => {
    const moduleParam = selectedModule === 'all' ? undefined : selectedModule;
    anomalyApi.getAnomalyStats(moduleParam).then(setStats);
    anomalyApi.getAnomalyHistory(moduleParam, undefined, undefined, 5).then(setRecentAnomalies);
  };

  // Render-Funktion für das Dashboard
  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          <BugReportIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          KI-gestützte Anomalieerkennung
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Überwachung, Analyse und Verwaltung von Anomalien im System
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="module-select-label">Modul</InputLabel>
          <Select
            labelId="module-select-label"
            id="module-select"
            value={selectedModule}
            label="Modul"
            onChange={handleModuleChange}
          >
            {modules.map((module) => (
              <MenuItem key={module.value} value={module.value}>
                {module.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Button 
          variant="outlined"
          startIcon={<DashboardIcon />}
          onClick={handleRefresh}
        >
          Aktualisieren
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {stats && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Karte: Gesamtzahl der Anomalien */}
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Anomalien gesamt
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ mt: 1 }}>
                      {stats.total_anomalies}
                    </Typography>
                    <Chip 
                      icon={<WarningIcon />} 
                      label={`Letzte ${stats.time_period_days} Tage`} 
                      size="small" 
                      color="primary" 
                      sx={{ mt: 1 }} 
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* Karte: Offene hochprioritäre Anomalien */}
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Hochprioritäre Anomalien
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ mt: 1 }}>
                      {stats.high_priority_open}
                    </Typography>
                    <Chip 
                      icon={<ErrorOutlineIcon />} 
                      label="Offen" 
                      size="small" 
                      color="error" 
                      sx={{ mt: 1 }} 
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* Karte: Durchschnittlicher Anomaliescore */}
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Durchschnittlicher Score
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ mt: 1 }}>
                      {stats.average_anomaly_score.toFixed(2)}
                    </Typography>
                    <Chip 
                      icon={<DataObjectIcon />} 
                      label="Anomaliescore" 
                      size="small" 
                      color="secondary" 
                      sx={{ mt: 1 }} 
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* Karte: Durchschnittliche Lösungszeit */}
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Durchschnittliche Lösungszeit
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ mt: 1 }}>
                      {stats.avg_resolution_time_hours.toFixed(1)}h
                    </Typography>
                    <Chip 
                      icon={<CheckCircleIcon />} 
                      label="Stunden" 
                      size="small" 
                      color="success" 
                      sx={{ mt: 1 }} 
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          <Paper sx={{ width: '100%' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              aria-label="Anomaly dashboard tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Erkennung" icon={<TrendingUpIcon />} iconPosition="start" />
              <Tab label="Historie" icon={<HistoryIcon />} iconPosition="start" />
              <Tab label="Modellverwaltung" icon={<DataObjectIcon />} iconPosition="start" />
              <Tab label="Einstellungen" icon={<SettingsIcon />} iconPosition="start" />
            </Tabs>

            <TabPanel value={activeTab} index={0}>
              <AnomalyDetectionPanel selectedModule={selectedModule} />
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <AnomalyHistoryPanel selectedModule={selectedModule} />
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              <AnomalyModelManagement selectedModule={selectedModule} />
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
              <AnomalySettings selectedModule={selectedModule} />
            </TabPanel>
          </Paper>
        </>
      )}
    </Container>
  );
};

export default AnomalyDashboard; 