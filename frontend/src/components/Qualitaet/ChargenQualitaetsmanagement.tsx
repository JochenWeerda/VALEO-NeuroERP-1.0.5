import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  LinearProgress,
  Snackbar,
  Autocomplete,
  DialogContentText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Assignment as AssignmentIcon,
  ExpandMore as ExpandMoreIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Save as SaveIcon,
  Print as PrintIcon,
  Science as ScienceIcon,
  FileDownload as FileDownloadIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Description as DescriptionIcon,
  Agriculture as AgricultureIcon,
} from '@mui/icons-material';
import axios from 'axios';
import {
  QualitaetsParameter,
  QualitaetsVorlage,
  QualitaetsPruefung,
  QualitaetsErgebnis,
  getAllPruefungen,
  getAllVorlagen,
  getAllParameter,
  createPruefung,
  updatePruefung,
  deletePruefung,
  changePruefungStatus,
  createVorlage,
  toggleVorlageStatus,
  createParameter,
  exportPruefungenToCsv,
  LieferantStammdaten,
} from '../../services/qualitaetsApi';
import RapsAnlieferungenUebersicht from './RapsAnlieferungenUebersicht';
import QualitaetsVereinbarungManager from './QualitaetsVereinbarungManager';
import NachhaltigkeitsErklaerungManager from './NachhaltigkeitsErklaerungManager';

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
      id={`chargen-tabpanel-${index}`}
      aria-labelledby={`chargen-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `chargen-tab-${index}`,
    'aria-controls': `chargen-tabpanel-${index}`,
  };
};

interface ChargenQualitaetsmanagementProps {
  initialTab?: number;
  lieferantId?: string;
}

const ChargenQualitaetsmanagement: React.FC<ChargenQualitaetsmanagementProps> = ({
  initialTab = 0,
  lieferantId,
}) => {
  const [tabValue, setTabValue] = useState<number>(initialTab);
  const [selectedLieferant, setSelectedLieferant] = useState<LieferantStammdaten | null>(null);
  const [selectedQualitaetsPruefung, setSelectedQualitaetsPruefung] = useState<QualitaetsPruefung | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [aktuellesErntejahr, setAktuellesErntejahr] = useState<string>('2024');
  
  // Wenn ein Lieferant ausgewählt ist, Daten laden
  useEffect(() => {
    if (lieferantId) {
      // Lieferantendaten laden
      // ...
    }
  }, [lieferantId]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleLieferantSave = (updatedLieferant: LieferantStammdaten) => {
    setSelectedLieferant(updatedLieferant);
    setSuccess('Lieferantendaten wurden erfolgreich gespeichert.');
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ mb: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="scrollable" 
            scrollButtons="auto"
            aria-label="Chargen-Qualitätsmanagement-Tabs"
          >
            <Tab icon={<DashboardIcon />} label="Dashboard" {...a11yProps(0)} />
            <Tab icon={<InventoryIcon />} label="Qualitätsprüfungen" {...a11yProps(1)} />
            <Tab icon={<DescriptionIcon />} label="Prüfvorlagen" {...a11yProps(2)} />
            <Tab icon={<CheckIcon />} label="Prüfparameter" {...a11yProps(3)} />
            <Tab icon={<AgricultureIcon />} label="Raps-Anlieferungen" {...a11yProps(4)} />
            <Tab icon={<DescriptionIcon />} label="Qualitätsvereinbarungen" {...a11yProps(5)} />
            <Tab icon={<DescriptionIcon />} label="Nachhaltigkeitserklärungen" {...a11yProps(6)} />
            <Tab icon={<SettingsIcon />} label="Einstellungen" {...a11yProps(7)} />
          </Tabs>
        </Box>
      </Paper>
      
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      
      <TabPanel value={tabValue} index={0}>
        <Typography variant="h5" component="h2" gutterBottom>
          Qualitätsmanagement Dashboard
        </Typography>
        
        <Box display="flex" flexWrap="wrap" gap={2}>
          <Paper sx={{ flex: '1 1 300px', p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Qualitätsprüfungen
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Übersicht aller Qualitätsprüfungen
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ mt: 2 }}
              onClick={() => setTabValue(1)}
            >
              Neue Prüfung
            </Button>
          </Paper>
          
          <Paper sx={{ flex: '1 1 300px', p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Raps-Anlieferungen
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Übersicht aller Raps-Anlieferungen
            </Typography>
            <Button
              variant="contained"
              startIcon={<AgricultureIcon />}
              sx={{ mt: 2 }}
              onClick={() => setTabValue(4)}
            >
              Anlieferungen anzeigen
            </Button>
          </Paper>
          
          <Paper sx={{ flex: '1 1 300px', p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Dokumente
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Qualitätsvereinbarungen & Nachhaltigkeitserklärungen
            </Typography>
            <Button
              variant="contained"
              startIcon={<DescriptionIcon />}
              sx={{ mt: 2 }}
              onClick={() => setTabValue(5)}
            >
              Dokumente verwalten
            </Button>
          </Paper>
        </Box>
        
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Schnellzugriff
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box display="flex" flexWrap="wrap" gap={2}>
            <Button
              variant="outlined"
              onClick={() => setTabValue(1)}
            >
              Offene Qualitätsprüfungen
            </Button>
            <Button
              variant="outlined"
              onClick={() => setTabValue(4)}
            >
              Raps-Anlieferungen {aktuellesErntejahr}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setTabValue(2)}
            >
              Prüfvorlagen verwalten
            </Button>
          </Box>
        </Box>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h5" component="h2" gutterBottom>
          Qualitätsprüfungen
        </Typography>
        {/* Hier kommt die Komponente für Qualitätsprüfungen */}
        <Alert severity="info">
          Die Komponente für Qualitätsprüfungen wird hier eingebunden.
        </Alert>
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h5" component="h2" gutterBottom>
          Prüfvorlagen
        </Typography>
        {/* Hier kommt die Komponente für Prüfvorlagen */}
        <Alert severity="info">
          Die Komponente für Prüfvorlagen wird hier eingebunden.
        </Alert>
      </TabPanel>
      
      <TabPanel value={tabValue} index={3}>
        <Typography variant="h5" component="h2" gutterBottom>
          Prüfparameter
        </Typography>
        {/* Hier kommt die Komponente für Prüfparameter */}
        <Alert severity="info">
          Die Komponente für Prüfparameter wird hier eingebunden.
        </Alert>
      </TabPanel>
      
      <TabPanel value={tabValue} index={4}>
        <RapsAnlieferungenUebersicht erntejahr={aktuellesErntejahr} />
      </TabPanel>
      
      <TabPanel value={tabValue} index={5}>
        <Typography variant="h5" component="h2" gutterBottom>
          Qualitätsvereinbarungen
        </Typography>
        <QualitaetsVereinbarungManager 
          lieferantId={lieferantId}
          lieferant={selectedLieferant}
          onSave={handleLieferantSave}
        />
      </TabPanel>
      
      <TabPanel value={tabValue} index={6}>
        <Typography variant="h5" component="h2" gutterBottom>
          Nachhaltigkeitserklärungen
        </Typography>
        <NachhaltigkeitsErklaerungManager 
          lieferantId={lieferantId}
          lieferant={selectedLieferant}
          onSave={handleLieferantSave}
        />
      </TabPanel>
      
      <TabPanel value={tabValue} index={7}>
        <Typography variant="h5" component="h2" gutterBottom>
          Einstellungen
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Allgemeine Einstellungen
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Aktuelles Erntejahr
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Button 
                variant={aktuellesErntejahr === '2023' ? 'contained' : 'outlined'}
                onClick={() => setAktuellesErntejahr('2023')}
              >
                2023
              </Button>
              <Button 
                variant={aktuellesErntejahr === '2024' ? 'contained' : 'outlined'}
                onClick={() => setAktuellesErntejahr('2024')}
              >
                2024
              </Button>
              <Button 
                variant={aktuellesErntejahr === '2025' ? 'contained' : 'outlined'}
                onClick={() => setAktuellesErntejahr('2025')}
              >
                2025
              </Button>
            </Box>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Qualitätsmanagement Einstellungen
          </Typography>
          
          {/* Hier könnten weitere Einstellungen eingefügt werden */}
          <Alert severity="info" sx={{ mt: 2 }}>
            Weitere Einstellungen für das Qualitätsmanagement können hier hinzugefügt werden.
          </Alert>
        </Paper>
      </TabPanel>
    </Box>
  );
};

export default ChargenQualitaetsmanagement; 