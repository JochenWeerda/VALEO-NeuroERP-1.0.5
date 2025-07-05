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
  Button,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  FireExtinguisher as FireExtinguisherIcon,
  Water as WaterIcon,
  ElectricBolt as ElectricBoltIcon,
  Security as SecurityIcon,
  Build as BuildIcon,
  LocalShipping as LocalShippingIcon,
  Nature as NatureIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  AttachMoney as AttachMoneyIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Dashboard as DashboardIcon,
  AddAlert as AddAlertIcon,
  PriorityHigh as PriorityHighIcon,
  WarningAmber as WarningAmberIcon
} from '@mui/icons-material';
import emergencyApi, { 
  EmergencyCase, 
  EmergencyPlan, 
  EmergencyStats, 
  EmergencyType, 
  EmergencySeverity, 
  EmergencyStatus,
  EscalationLevel,
  EmergencyEscalation
} from '../services/emergencyApi';
import EmergencyCaseList from '../components/emergency/EmergencyCaseList';
import EmergencyPlans from '../components/emergency/EmergencyPlans';
import EmergencyResources from '../components/emergency/EmergencyResources';
import EmergencyContacts from '../components/emergency/EmergencyContacts';
import EmergencyDrills from '../components/emergency/EmergencyDrills';
import EmergencyEscalationManager from '../components/emergency/EmergencyEscalation';

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
      id={`emergency-tabpanel-${index}`}
      aria-labelledby={`emergency-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

// Helper-Funktion für Icon-Auswahl basierend auf Notfalltyp
const getEmergencyTypeIcon = (type: EmergencyType) => {
  switch (type) {
    case EmergencyType.FIRE:
      return <FireExtinguisherIcon />;
    case EmergencyType.WATER:
      return <WaterIcon />;
    case EmergencyType.POWER_OUTAGE:
      return <ElectricBoltIcon />;
    case EmergencyType.IT_SECURITY:
      return <SecurityIcon />;
    case EmergencyType.MACHINE_FAILURE:
      return <BuildIcon />;
    case EmergencyType.SUPPLY_CHAIN:
      return <LocalShippingIcon />;
    case EmergencyType.ENVIRONMENTAL:
      return <NatureIcon />;
    case EmergencyType.QUALITY_ISSUE:
      return <AssignmentIcon />;
    case EmergencyType.PERSONNEL:
      return <PeopleIcon />;
    case EmergencyType.FINANCIAL:
      return <AttachMoneyIcon />;
    default:
      return <InfoIcon />;
  }
};

// Hauptkomponente
const EmergencyDashboard: React.FC = () => {
  // State für die aktive Tab-Auswahl
  const [activeTab, setActiveTab] = useState(0);
  
  // State für die Statistiken und den Ladestatus
  const [stats, setStats] = useState<EmergencyStats | null>(null);
  const [emergencyCases, setEmergencyCases] = useState<EmergencyCase[]>([]);
  const [escalations, setEscalations] = useState<EmergencyEscalation[]>([]);
  const [selectedCase, setSelectedCase] = useState<EmergencyCase | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State für Filter
  const [filterType, setFilterType] = useState<string>('all');
  
  // Laden der Notfalldaten beim ersten Rendern
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const statsData = await emergencyApi.getEmergencyStats();
        const casesData = await emergencyApi.getEmergencyCases();
        const escalationsData = await emergencyApi.getEscalations();
        
        setStats(statsData);
        setEmergencyCases(casesData);
        setEscalations(escalationsData);
        setError(null);
      } catch (err) {
        console.error('Fehler beim Laden der Notfalldaten:', err);
        setError('Die Notfalldaten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handler für Tab-Änderungen
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handler für Filter-Änderungen
  const handleFilterChange = (event: SelectChangeEvent) => {
    setFilterType(event.target.value);
  };

  // Handler für Aktualisierungen
  const handleRefresh = () => {
    emergencyApi.getEmergencyStats().then(setStats);
    emergencyApi.getEmergencyCases().then(setEmergencyCases);
    emergencyApi.getEscalations().then(setEscalations);
  };

  // Handler für Auswahl eines Notfalls für Eskalationsmanagement
  const handleSelectCase = (caseId: number) => {
    const selected = emergencyCases.find(c => c.id === caseId);
    setSelectedCase(selected || null);
  };

  // Handler für neue oder aktualisierte Eskalationen
  const handleEscalationUpdate = () => {
    // Notfalldaten und Eskalationen nach Aktualisierung neu laden
    emergencyApi.getEmergencyCases().then(setEmergencyCases);
    emergencyApi.getEscalations().then(setEscalations);
    
    // Den ausgewählten Fall aktualisieren, wenn vorhanden
    if (selectedCase) {
      emergencyApi.getEmergencyCase(selectedCase.id).then(setSelectedCase);
    }
  };

  // Render-Funktion für die Statistik-Karten
  const renderStatCards = () => {
    if (!stats) return null;
    
    return (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Karte: Offene Notfälle */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Offene Notfälle
              </Typography>
              <Typography variant="h4" component="div" sx={{ mt: 1 }}>
                {stats.status_distribution[EmergencyStatus.NEW] || 0 + 
                 stats.status_distribution[EmergencyStatus.IN_PROGRESS] || 0 + 
                 stats.status_distribution[EmergencyStatus.CONTAINED] || 0}
              </Typography>
              <Chip 
                icon={<WarningIcon />} 
                label="Benötigen Aufmerksamkeit" 
                size="small" 
                color="warning" 
                sx={{ mt: 1 }} 
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Karte: Hohe Priorität */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Hohe Priorität
              </Typography>
              <Typography variant="h4" component="div" sx={{ mt: 1 }}>
                {stats.high_priority_open}
              </Typography>
              <Chip 
                icon={<WarningIcon />} 
                label="Kritisch" 
                size="small" 
                color="error" 
                sx={{ mt: 1 }} 
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Karte: Gelöste Notfälle */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Gelöste Notfälle
              </Typography>
              <Typography variant="h4" component="div" sx={{ mt: 1 }}>
                {stats.status_distribution[EmergencyStatus.RESOLVED] || 0 + 
                 stats.status_distribution[EmergencyStatus.POST_ANALYSIS] || 0 + 
                 stats.status_distribution[EmergencyStatus.CLOSED] || 0}
              </Typography>
              <Chip 
                icon={<CheckCircleIcon />} 
                label="Abgeschlossen" 
                size="small" 
                color="success" 
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
                Ø Lösungszeit
              </Typography>
              <Typography variant="h4" component="div" sx={{ mt: 1 }}>
                {stats.avg_resolution_time_hours.toFixed(1)}h
              </Typography>
              <Chip 
                icon={<InfoIcon />} 
                label={`Letzten ${stats.time_period_days} Tage`} 
                size="small" 
                color="primary" 
                sx={{ mt: 1 }} 
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Neue Karte: Aktive Eskalationen */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Aktive Eskalationen
              </Typography>
              <Typography variant="h4" component="div" sx={{ mt: 1 }}>
                {escalations.filter(e => !e.resolved_at).length}
              </Typography>
              <Chip 
                icon={<PriorityHighIcon />} 
                label="Benötigen Aufmerksamkeit" 
                size="small" 
                color="error" 
                sx={{ mt: 1 }} 
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // Render-Funktion für die Verteilungs-Karten
  const renderDistributionCards = () => {
    if (!stats) return null;
    
    return (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Karte: Verteilung nach Typ */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Verteilung nach Typ" />
            <Divider />
            <CardContent sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.entries(stats.type_distribution).map(([type, count]) => (
                <Chip 
                  key={type}
                  icon={getEmergencyTypeIcon(type as EmergencyType)} 
                  label={`${type}: ${count}`} 
                  color="primary"
                  variant="outlined"
                  sx={{ m: 0.5 }}
                />
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Karte: Verteilung nach Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Verteilung nach Status" />
            <Divider />
            <CardContent sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.entries(stats.status_distribution).map(([status, count]) => {
                let color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" = "default";
                
                switch(status) {
                  case EmergencyStatus.NEW:
                    color = "error";
                    break;
                  case EmergencyStatus.IN_PROGRESS:
                    color = "warning";
                    break;
                  case EmergencyStatus.CONTAINED:
                    color = "info";
                    break;
                  case EmergencyStatus.RESOLVED:
                  case EmergencyStatus.CLOSED:
                    color = "success";
                    break;
                  case EmergencyStatus.POST_ANALYSIS:
                    color = "secondary";
                    break;
                }
                
                return (
                  <Chip 
                    key={status}
                    label={`${status}: ${count}`} 
                    color={color}
                    variant="outlined"
                    sx={{ m: 0.5 }}
                  />
                );
              })}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // Render-Funktion für das Eskalationsmanagement
  const renderEscalationManagement = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Notfälle</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Wählen Sie einen Notfall aus, um die Eskalationen zu verwalten
            </Typography>
            <List>
              {emergencyCases
                .filter(c => c.status !== EmergencyStatus.CLOSED)
                .map(emergencyCase => (
                  <ListItem 
                    key={emergencyCase.id} 
                    button 
                    selected={selectedCase?.id === emergencyCase.id}
                    onClick={() => handleSelectCase(emergencyCase.id)}
                  >
                    <ListItemIcon>
                      {getEmergencyTypeIcon(emergencyCase.type)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={emergencyCase.title} 
                      secondary={`${emergencyCase.severity} | ${emergencyCase.status}`}
                    />
                    {emergencyCase.escalations?.length > 0 && (
                      <Chip 
                        size="small" 
                        label={`${emergencyCase.escalations.length} Eskalation(en)`} 
                        color="warning" 
                      />
                    )}
                  </ListItem>
                ))
              }
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            {selectedCase ? (
              <EmergencyEscalationManager 
                emergencyCase={selectedCase}
                onEscalationCreated={handleEscalationUpdate}
                onEscalationUpdated={handleEscalationUpdate}
              />
            ) : (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                p: 4 
              }}>
                <WarningAmberIcon color="disabled" sx={{ fontSize: 64, mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Bitte wählen Sie einen Notfall aus
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    );
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Notfall- und Krisenmanagement
          </Typography>
          <Tooltip title="Aktualisieren">
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        ) : (
          <>
            {renderStatCards()}
            
            <Paper sx={{ width: '100%' }}>
              <Tabs 
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="Notfallmanagement-Tabs"
              >
                <Tab label="Dashboard" icon={<DashboardIcon />} iconPosition="start" />
                <Tab label="Notfälle" icon={<WarningIcon />} iconPosition="start" />
                <Tab label="Pläne" icon={<AssignmentIcon />} iconPosition="start" />
                <Tab label="Ressourcen" icon={<BuildIcon />} iconPosition="start" />
                <Tab label="Kontakte" icon={<PeopleIcon />} iconPosition="start" />
                <Tab label="Übungen" icon={<AddAlertIcon />} iconPosition="start" />
                <Tab label="Eskalationen" icon={<PriorityHighIcon />} iconPosition="start" />
              </Tabs>
              
              <TabPanel value={activeTab} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    {renderDistributionCards()}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {renderEscalationManagement()}
                  </Grid>
                </Grid>
              </TabPanel>
              
              <TabPanel value={activeTab} index={1}>
                <EmergencyCaseList cases={emergencyCases} />
              </TabPanel>
              
              <TabPanel value={activeTab} index={2}>
                <EmergencyPlans />
              </TabPanel>
              
              <TabPanel value={activeTab} index={3}>
                <EmergencyResources />
              </TabPanel>
              
              <TabPanel value={activeTab} index={4}>
                <EmergencyContacts />
              </TabPanel>
              
              <TabPanel value={activeTab} index={5}>
                <EmergencyDrills />
              </TabPanel>
              
              <TabPanel value={activeTab} index={6}>
                {renderEscalationManagement()}
              </TabPanel>
            </Paper>
          </>
        )}
      </Box>
    </Container>
  );
};

export default EmergencyDashboard; 