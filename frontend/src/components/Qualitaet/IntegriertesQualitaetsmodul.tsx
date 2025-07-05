import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  Divider,
  Button,
  Grid,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Description as DescriptionIcon,
  Check as CheckIcon,
  Settings as SettingsIcon,
  Agriculture as AgricultureIcon,
  Assignment as AssignmentIcon,
  Science as ScienceIcon,
  Info as InfoIcon,
  Assessment as AssessmentIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  LocalShipping as LocalShippingIcon,
  Warehouse as WarehouseIcon,
  Business as BusinessIcon,
  Engineering as EngineeringIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { LieferantStammdaten } from '../../services/qualitaetsApi';
import RapsAnlieferungenUebersicht from './RapsAnlieferungenUebersicht';
import QualitaetsVereinbarungManager from './QualitaetsVereinbarungManager';
import NachhaltigkeitsErklaerungManager from './NachhaltigkeitsErklaerungManager';
import QualitaetsHandbuch from '../QualitaetsHandbuch/QualitaetsHandbuch';
import QualitaetsMerkblatt from '../QualitaetsHandbuch/QualitaetsMerkblatt';
import QSChecklisten from '../QualitaetsHandbuch/QSChecklisten';
import QSInspektionen from '../QualitaetsHandbuch/QSInspektionen';
import QSAuditManager from '../QualitaetsHandbuch/QSAuditManager';

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

interface IntegriertesQualitaetsmodulProps {
  initialTab?: number;
  lieferantId?: string;
}

const IntegriertesQualitaetsmodul: React.FC<IntegriertesQualitaetsmodulProps> = ({
  initialTab = 0,
  lieferantId,
}) => {
  const [tabValue, setTabValue] = useState<number>(initialTab);
  const [selectedLieferant, setSelectedLieferant] = useState<LieferantStammdaten | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [aktuellesErntejahr, setAktuellesErntejahr] = useState<string>('2024');
  const [showQSHandbuch, setShowQSHandbuch] = useState<boolean>(false);
  const [showMerkblatt, setShowMerkblatt] = useState<boolean>(false);
  const [showQSChecklisten, setShowQSChecklisten] = useState<boolean>(false);
  const [showQSInspektionen, setShowQSInspektionen] = useState<boolean>(false);
  const [showQSAuditManager, setShowQSAuditManager] = useState<boolean>(false);
  
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
  
  // QS-Handbuch und Merkblatt-Handler
  const toggleQSHandbuch = () => {
    setShowQSHandbuch(!showQSHandbuch);
    if (!showQSHandbuch) {
      setShowMerkblatt(false);
      setShowQSChecklisten(false);
      setShowQSInspektionen(false);
      setShowQSAuditManager(false);
    }
  };
  
  const toggleMerkblatt = () => {
    setShowMerkblatt(!showMerkblatt);
    if (!showMerkblatt) {
      setShowQSHandbuch(false);
      setShowQSChecklisten(false);
      setShowQSInspektionen(false);
      setShowQSAuditManager(false);
    }
  };
  
  const toggleQSChecklisten = () => {
    setShowQSChecklisten(!showQSChecklisten);
    if (!showQSChecklisten) {
      setShowQSHandbuch(false);
      setShowMerkblatt(false);
      setShowQSInspektionen(false);
      setShowQSAuditManager(false);
    }
  };
  
  const toggleQSInspektionen = () => {
    setShowQSInspektionen(!showQSInspektionen);
    if (!showQSInspektionen) {
      setShowQSHandbuch(false);
      setShowMerkblatt(false);
      setShowQSChecklisten(false);
      setShowQSAuditManager(false);
    }
  };

  const toggleQSAuditManager = () => {
    setShowQSAuditManager(!showQSAuditManager);
    if (!showQSAuditManager) {
      setShowQSHandbuch(false);
      setShowMerkblatt(false);
      setShowQSChecklisten(false);
      setShowQSInspektionen(false);
    }
  };
  
  // Zurück zur Hauptansicht
  const handleBackToMain = () => {
    setShowQSHandbuch(false);
    setShowMerkblatt(false);
    setShowQSChecklisten(false);
    setShowQSInspektionen(false);
    setShowQSAuditManager(false);
  };
  
  // Wenn eine der QS-Komponenten angezeigt wird, zeigen wir das an
  if (showQSHandbuch) {
    return (
      <Box>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBackToMain}
          sx={{ mb: 2 }}
        >
          Zurück zum Qualitätsmanagement
        </Button>
        <QualitaetsHandbuch />
      </Box>
    );
  }
  
  if (showMerkblatt) {
    return (
      <Box>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBackToMain}
          sx={{ mb: 2 }}
        >
          Zurück zum Qualitätsmanagement
        </Button>
        <QualitaetsMerkblatt />
      </Box>
    );
  }
  
  if (showQSChecklisten) {
    return (
      <Box>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBackToMain}
          sx={{ mb: 2 }}
        >
          Zurück zum Qualitätsmanagement
        </Button>
        <QSChecklisten />
      </Box>
    );
  }
  
  if (showQSInspektionen) {
    return (
      <Box>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBackToMain}
          sx={{ mb: 2 }}
        >
          Zurück zum Qualitätsmanagement
        </Button>
        <QSInspektionen />
      </Box>
    );
  }

  if (showQSAuditManager) {
    return (
      <Box>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBackToMain}
          sx={{ mb: 2 }}
        >
          Zurück zum Qualitätsmanagement
        </Button>
        <QSAuditManager />
      </Box>
    );
  }
  
  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ mb: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="scrollable" 
            scrollButtons="auto"
            aria-label="Integriertes Qualitätsmodul Tabs"
          >
            <Tab icon={<DashboardIcon />} label="Dashboard" {...a11yProps(0)} />
            <Tab icon={<InventoryIcon />} label="Qualitätsprüfungen" {...a11yProps(1)} />
            <Tab icon={<DescriptionIcon />} label="Prüfvorlagen" {...a11yProps(2)} />
            <Tab icon={<CheckIcon />} label="Prüfparameter" {...a11yProps(3)} />
            <Tab icon={<AgricultureIcon />} label="Raps-Anlieferungen" {...a11yProps(4)} />
            <Tab icon={<DescriptionIcon />} label="Qualitätsvereinbarungen" {...a11yProps(5)} />
            <Tab icon={<DescriptionIcon />} label="Nachhaltigkeitserklärungen" {...a11yProps(6)} />
            <Tab icon={<AssessmentIcon />} label="QS-Handbuch" {...a11yProps(7)} />
            <Tab icon={<SettingsIcon />} label="Einstellungen" {...a11yProps(8)} />
            <Tab icon={<AssignmentIcon />} label="Audit-Management" {...a11yProps(9)} />
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
          Integriertes Qualitätsmanagement Dashboard
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
              startIcon={<InventoryIcon />}
              sx={{ mt: 2 }}
              onClick={() => setTabValue(1)}
            >
              Qualitätsprüfungen
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
              QS-Handbuch
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Dokumentation aller qualitätssichernden Maßnahmen
            </Typography>
            <Button
              variant="contained"
              startIcon={<AssessmentIcon />}
              sx={{ mt: 2 }}
              onClick={toggleQSHandbuch}
            >
              QS-Handbuch öffnen
            </Button>
          </Paper>
        </Box>
        
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            QS-Funktionen
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  QS-Checklisten und Inspektionen
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<CheckIcon />}
                  fullWidth
                  sx={{ mb: 1 }}
                  onClick={toggleQSChecklisten}
                >
                  QS-Checklisten
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ScheduleIcon />}
                  fullWidth
                  sx={{ mb: 1 }}
                  onClick={toggleQSInspektionen}
                >
                  QS-Inspektionen und Terminplanung
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AssessmentIcon />}
                  fullWidth
                  onClick={toggleQSHandbuch}
                >
                  QS-Maßnahmen
                </Button>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Wichtige Dokumente
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<DescriptionIcon />}
                  fullWidth
                  sx={{ mb: 1 }}
                  onClick={toggleMerkblatt}
                >
                  Maßnahmen für den sicheren Umgang mit Getreide
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DescriptionIcon />}
                  fullWidth
                  sx={{ mb: 1 }}
                  onClick={() => setTabValue(5)}
                >
                  Qualitätsvereinbarungen
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DescriptionIcon />}
                  fullWidth
                  onClick={() => setTabValue(6)}
                >
                  Nachhaltigkeitserklärungen
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Box>
        
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            QS-Anforderungen nach Bereichen
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle1" gutterBottom>
                  <Box display="flex" alignItems="center">
                    <BusinessIcon sx={{ mr: 1 }} />
                    Handel
                  </Box>
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  QS-Anforderungen für den Handel mit Futtermitteln
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={toggleQSChecklisten}
                >
                  Handel-Checklisten
                </Button>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle1" gutterBottom>
                  <Box display="flex" alignItems="center">
                    <LocalShippingIcon sx={{ mr: 1 }} />
                    Transport
                  </Box>
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  QS-Anforderungen für den Transport von Futtermitteln
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={toggleQSChecklisten}
                >
                  Transport-Checklisten
                </Button>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle1" gutterBottom>
                  <Box display="flex" alignItems="center">
                    <WarehouseIcon sx={{ mr: 1 }} />
                    Lagerung
                  </Box>
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  QS-Anforderungen für die Lagerung von Futtermitteln
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={toggleQSChecklisten}
                >
                  Lager-Checklisten
                </Button>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle1" gutterBottom>
                  <Box display="flex" alignItems="center">
                    <EngineeringIcon sx={{ mr: 1 }} />
                    Mobile Anlagen
                  </Box>
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  QS-Anforderungen für mobile Mahl- und Mischanlagen
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={toggleQSChecklisten}
                >
                  Anlagen-Checklisten
                </Button>
              </Paper>
            </Grid>
          </Grid>
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2" gutterBottom>
            QS-Handbuch
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowForwardIcon />}
            onClick={toggleQSHandbuch}
          >
            QS-Handbuch öffnen
          </Button>
        </Box>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Das QS-Handbuch dokumentiert alle qualitätssichernden Maßnahmen und Prozesse. Es dient als lebendes Dokument zur kontinuierlichen Verbesserung der Betriebsabläufe.
        </Alert>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                QS-Handbuch Module
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                sx={{ mb: 1 }}
                onClick={toggleQSHandbuch}
              >
                QS-Maßnahmen verwalten
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{ mb: 1 }}
                onClick={toggleQSChecklisten}
              >
                QS-Checklisten
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{ mb: 1 }}
                onClick={toggleQSInspektionen}
              >
                QS-Inspektionen und Terminplanung
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={toggleQSHandbuch}
              >
                Prüfhistorie
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Wichtige Dokumente
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                sx={{ mb: 1 }}
                onClick={toggleMerkblatt}
              >
                Maßnahmen für den sicheren Umgang mit Getreide
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{ mb: 1 }}
                onClick={toggleMerkblatt}
              >
                Leitlinie zum Vorratsschutz
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={toggleMerkblatt}
              >
                QS-Leitfaden Futtermittelwirtschaft
              </Button>
            </Paper>
          </Grid>
        </Grid>
        
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            QS-Bereiche
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <Box display="flex" alignItems="center">
                    <BusinessIcon sx={{ mr: 1 }} />
                    Handel
                  </Box>
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={toggleQSChecklisten}
                >
                  Checklisten Handel
                </Button>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <Box display="flex" alignItems="center">
                    <LocalShippingIcon sx={{ mr: 1 }} />
                    Transport
                  </Box>
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={toggleQSChecklisten}
                >
                  Checklisten Transport
                </Button>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <Box display="flex" alignItems="center">
                    <WarehouseIcon sx={{ mr: 1 }} />
                    Lagerung
                  </Box>
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={toggleQSChecklisten}
                >
                  Checklisten Lagerung
                </Button>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <Box display="flex" alignItems="center">
                    <EngineeringIcon sx={{ mr: 1 }} />
                    Mobile Anlagen
                  </Box>
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={toggleQSChecklisten}
                >
                  Checklisten Anlagen
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </TabPanel>
      
      <TabPanel value={tabValue} index={8}>
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
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  QS-Benachrichtigungen
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Konfigurieren Sie hier, wie und wann Mitarbeiter QS-Benachrichtigungen erhalten sollen.
                </Alert>
                <Button
                  variant="outlined"
                  fullWidth
                >
                  Benachrichtigungseinstellungen
                </Button>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Benutzerberechtigungen
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Legen Sie fest, welche Benutzer Zugriff auf QS-Module haben und welche Aktionen sie durchführen dürfen.
                </Alert>
                <Button
                  variant="outlined"
                  fullWidth
                >
                  Berechtigungen verwalten
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={9}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2" gutterBottom>
            Audit-Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowForwardIcon />}
            onClick={toggleQSAuditManager}
          >
            Audit-Management öffnen
          </Button>
        </Box>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Das KI-gestützte Audit-Management unterstützt Sie bei der Vorbereitung, Durchführung und Nachbereitung von Audits. Es sorgt dafür, dass alle erforderlichen Dokumente rechtzeitig vorbereitet werden und sendet automatisch freundliche Erinnerungen an die verantwortlichen Mitarbeiter.
        </Alert>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Audit-Funktionen
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                sx={{ mb: 1 }}
                onClick={toggleQSAuditManager}
              >
                Audit-Dashboard
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{ mb: 1 }}
                onClick={() => {
                  toggleQSAuditManager();
                  // In einer echten Implementierung würden wir hier Parameter übergeben
                }}
              >
                Audit-Anforderungen verwalten
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{ mb: 1 }}
                onClick={() => {
                  toggleQSAuditManager();
                  // In einer echten Implementierung würden wir hier Parameter übergeben
                }}
              >
                KI-Vollständigkeitsprüfung
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Audit-Vorbereitung
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                sx={{ mb: 1 }}
                onClick={toggleQSChecklisten}
              >
                QS-Checklisten
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{ mb: 1 }}
                onClick={toggleQSInspektionen}
              >
                QS-Inspektionen
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={toggleQSHandbuch}
              >
                QS-Handbuch
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default IntegriertesQualitaetsmodul; 