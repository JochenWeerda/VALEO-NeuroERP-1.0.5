import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  LinearProgress,
  Alert,
  useTheme
} from '@mui/material';
import IconSet from '../components/IconSet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import HelpIcon from '@mui/icons-material/Help';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import TseStatus from '../components/TSE/TseStatus';
import WaagenStatus from '../components/Waage/WaagenStatus';
import { IPManagerUI, IPConflictMonitor, HeartbeatMonitor } from '../components/IPManager';

/**
 * Health und Konnektoren Seite
 * 
 * Zeigt Übersicht über Microservices, deren Gesundheitszustand und ermöglicht
 * das Starten, Stoppen und Neustarten von Services
 */
const HealthConnectors = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  // Dummy-Daten für Microservices
  const mockServices = [
    {
      id: 'finance-service',
      name: 'Finance-Service',
      status: 'running',
      health: 'healthy',
      uptime: '3d 4h 12m',
      cpu: 12,
      memory: 230,
      port: 8007,
      restartCount: 0,
      lastRestart: null
    },
    {
      id: 'beleg-service',
      name: 'Beleg-Service',
      status: 'running',
      health: 'warning',
      uptime: '2d 8h 45m',
      cpu: 28,
      memory: 450,
      port: 8005,
      restartCount: 2,
      lastRestart: '2025-05-25T14:23:45'
    },
    {
      id: 'observer-service',
      name: 'Observer-Service (Watchdog)',
      status: 'running',
      health: 'healthy',
      uptime: '5d 2h 30m',
      cpu: 5,
      memory: 180,
      port: 8010,
      restartCount: 0,
      lastRestart: null
    },
    {
      id: 'minimal-server',
      name: 'Minimal-Server',
      status: 'stopped',
      health: 'error',
      uptime: '0',
      cpu: 0,
      memory: 0,
      port: 8000,
      restartCount: 5,
      lastRestart: '2025-05-26T09:15:22'
    }
  ];

  // Daten laden
  useEffect(() => {
    // Hier würde eigentlich ein API-Call stehen, der die Dienste vom Observer-Service abruft
    // z.B. fetch('http://localhost:8010/services')
    
    // Simuliere einen API-Call mit Dummy-Daten
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simuliere Netzwerkverzögerung
        await new Promise(resolve => setTimeout(resolve, 1000));
        setServices(mockServices);
        setLoading(false);
      } catch (err) {
        setError('Fehler beim Laden der Dienste');
        setLoading(false);
      }
    };

    fetchData();
    
    // Regelmäßiges Aktualisieren der Daten alle 30 Sekunden
    const interval = setInterval(() => {
      fetchData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Tab wechseln
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Service neustarten
  const handleRestartService = (serviceId) => {
    console.log(`Service ${serviceId} wird neu gestartet...`);
    // Hier würde ein API-Call an den Observer-Service gemacht werden
    // z.B. fetch(`http://localhost:8010/services/${serviceId}/restart`, { method: 'POST' })
    
    // Optimistisches UI-Update
    setServices(services.map(service => 
      service.id === serviceId 
        ? { 
            ...service, 
            status: 'restarting', 
            restartCount: service.restartCount + 1,
            lastRestart: new Date().toISOString()
          } 
        : service
    ));
    
    // Simuliere den Neustart nach 2 Sekunden
    setTimeout(() => {
      setServices(services.map(service => 
        service.id === serviceId 
          ? { 
              ...service, 
              status: 'running',
              health: 'healthy',
              restartCount: service.restartCount + 1,
              lastRestart: new Date().toISOString()
            } 
          : service
      ));
    }, 2000);
  };

  // Service starten
  const handleStartService = (serviceId) => {
    console.log(`Service ${serviceId} wird gestartet...`);
    // Hier würde ein API-Call an den Observer-Service gemacht werden
    // z.B. fetch(`http://localhost:8010/services/${serviceId}/start`, { method: 'POST' })
    
    // Optimistisches UI-Update
    setServices(services.map(service => 
      service.id === serviceId 
        ? { ...service, status: 'starting' } 
        : service
    ));
    
    // Simuliere den Start nach 2 Sekunden
    setTimeout(() => {
      setServices(services.map(service => 
        service.id === serviceId 
          ? { 
              ...service, 
              status: 'running',
              health: 'healthy',
              uptime: '0m'
            } 
          : service
      ));
    }, 2000);
  };

  // Service stoppen
  const handleStopService = (serviceId) => {
    console.log(`Service ${serviceId} wird gestoppt...`);
    // Hier würde ein API-Call an den Observer-Service gemacht werden
    // z.B. fetch(`http://localhost:8010/services/${serviceId}/stop`, { method: 'POST' })
    
    // Optimistisches UI-Update
    setServices(services.map(service => 
      service.id === serviceId 
        ? { ...service, status: 'stopping' } 
        : service
    ));
    
    // Simuliere den Stopp nach 2 Sekunden
    setTimeout(() => {
      setServices(services.map(service => 
        service.id === serviceId 
          ? { 
              ...service, 
              status: 'stopped',
              health: 'error',
              uptime: '0'
            } 
          : service
      ));
    }, 2000);
  };

  // Daten manuell aktualisieren
  const handleRefresh = () => {
    setLoading(true);
    // Simuliere Netzwerkverzögerung
    setTimeout(() => {
      setServices(mockServices);
      setLoading(false);
    }, 1000);
  };

  // Render Service-Status-Chip
  const renderStatusChip = (status) => {
    const statusConfig = {
      running: { color: 'success', label: 'Aktiv' },
      stopped: { color: 'error', label: 'Gestoppt' },
      restarting: { color: 'warning', label: 'Neustart...' },
      starting: { color: 'info', label: 'Startet...' },
      stopping: { color: 'warning', label: 'Stoppt...' }
    };
    
    const config = statusConfig[status] || { color: 'default', label: status };
    
    return <Chip size="small" color={config.color} label={config.label} />;
  };

  // Render Health-Status-Icon
  const renderHealthIcon = (health) => {
    switch (health) {
      case 'healthy':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <HelpIcon color="disabled" />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Health und Konnektoren
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />} 
          onClick={handleRefresh}
          disabled={loading}
        >
          Aktualisieren
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<IconSet icon="health_and_safety" size="small" />} label="Services" iconPosition="start" />
          <Tab icon={<IconSet icon="autorenew" size="small" />} label="Auto-Restart" iconPosition="start" />
          <Tab icon={<IconSet icon="insights" size="small" />} label="Performance" iconPosition="start" />
          <Tab icon={<IconSet icon="hardware" size="small" />} label="Hardware" iconPosition="start" />
          <Tab icon={<IconSet icon="settings_input_component" size="small" />} label="Konfiguration" iconPosition="start" />
          <Tab icon={<IconSet icon="router" size="small" />} label="IP-Management" iconPosition="start" />
        </Tabs>

        <Divider />

        {/* Services Tab */}
        {activeTab === 0 && (
          <Box sx={{ p: 2 }}>
            {loading && <LinearProgress sx={{ mb: 2 }} />}
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <List>
              {services.map((service) => (
                <ListItem 
                  key={service.id}
                  sx={{ 
                    mb: 1, 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    bgcolor: theme.palette.background.paper
                  }}
                >
                  <ListItemIcon>
                    {renderHealthIcon(service.health)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">{service.name}</Typography>
                        {renderStatusChip(service.status)}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="caption" display="block">
                          Port: {service.port} | Uptime: {service.uptime} | CPU: {service.cpu}% | RAM: {service.memory} MB
                        </Typography>
                        {service.lastRestart && (
                          <Typography variant="caption" display="block">
                            Neustarts: {service.restartCount} | Letzter Neustart: {new Date(service.lastRestart).toLocaleString()}
                          </Typography>
                        )}
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {service.status === 'running' && (
                        <>
                          <IconButton 
                            edge="end" 
                            aria-label="restart" 
                            onClick={() => handleRestartService(service.id)}
                            title="Neu starten"
                            size="small"
                          >
                            <RestartAltIcon />
                          </IconButton>
                          <IconButton 
                            edge="end" 
                            aria-label="stop" 
                            onClick={() => handleStopService(service.id)}
                            title="Stoppen"
                            size="small"
                          >
                            <StopIcon />
                          </IconButton>
                        </>
                      )}
                      {service.status === 'stopped' && (
                        <IconButton 
                          edge="end" 
                          aria-label="start" 
                          onClick={() => handleStartService(service.id)}
                          title="Starten"
                          size="small"
                          color="primary"
                        >
                          <PlayArrowIcon />
                        </IconButton>
                      )}
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Auto-Restart Tab */}
        {activeTab === 1 && (
          <Box sx={{ p: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Die Auto-Restart-Funktionalität überwacht alle registrierten Microservices und startet sie automatisch neu, 
              wenn sie nicht mehr reagieren.
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader 
                    title="Auto-Restart Konfiguration" 
                    avatar={<IconSet icon="settings_suggest" color={theme.palette.primary.main} />}
                  />
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body1">Auto-Restart aktiviert</Typography>
                      <Chip label="Aktiv" color="success" size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body1">Health-Check-Intervall</Typography>
                      <Typography variant="body2">60 Sekunden</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body1">Fehler-Schwellenwert</Typography>
                      <Typography variant="body2">3 fehlgeschlagene Checks</Typography>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Button 
                      variant="contained" 
                      startIcon={<SettingsIcon />}
                      fullWidth
                    >
                      Einstellungen ändern
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader 
                    title="Neustart-Skripte" 
                    avatar={<IconSet icon="code" color={theme.palette.primary.main} />}
                  />
                  <CardContent>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <IconSet icon="description" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="restart_finance_service.ps1" 
                          secondary="Neustart des Finance-Service"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <IconSet icon="description" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="restart_beleg_service.ps1" 
                          secondary="Neustart des Beleg-Service" 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <IconSet icon="description" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="restart_observer_service.ps1" 
                          secondary="Neustart des Observer-Service"
                        />
                      </ListItem>
                    </List>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Button 
                      variant="outlined"
                      startIcon={<IconSet icon="add" />}
                      fullWidth
                    >
                      Neustart-Skript hinzufügen
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card>
                  <CardHeader 
                    title="Neustart-Historie" 
                    avatar={<IconSet icon="history" color={theme.palette.primary.main} />}
                  />
                  <CardContent>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <IconSet icon="restore" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Beleg-Service" 
                          secondary="Automatischer Neustart am 25.05.2025, 14:23 Uhr"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <IconSet icon="restore" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Minimal-Server" 
                          secondary="Automatischer Neustart am 24.05.2025, 08:45 Uhr" 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <IconSet icon="restore" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Beleg-Service" 
                          secondary="Automatischer Neustart am 22.05.2025, 19:12 Uhr"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Performance Tab */}
        {activeTab === 2 && (
          <Box sx={{ p: 2 }}>
            <Typography variant="body1" paragraph>
              In diesem Bereich können Sie die Performance-Metriken aller Microservices überwachen.
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Die Performance-Daten werden vom Observer-Service in Echtzeit erfasst und aufbereitet.
            </Alert>
            
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <IconSet icon="insights" size="large" />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Performance-Überwachung wird geladen...
              </Typography>
            </Box>
          </Box>
        )}
        
        {/* Hardware Tab */}
        {activeTab === 3 && (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TseStatus />
              </Grid>
              <Grid item xs={12} md={6}>
                <WaagenStatus />
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader 
                    title="Aktuelle Aktivitäten" 
                    avatar={<IconSet icon="notifications" color={theme.palette.info.main} />}
                    sx={{ 
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      borderBottom: `1px solid ${theme.palette.divider}`
                    }}
                  />
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <IconSet icon="task_alt" status="success" />
                      <Box sx={{ ml: 1 }}>
                        <Typography variant="body2">
                          Tagesabschluss durchgeführt
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Heute, 18:30 Uhr
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <IconSet icon="sync" status="info" />
                      <Box sx={{ ml: 1 }}>
                        <Typography variant="body2">
                          Datenbank-Backup abgeschlossen
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Heute, 16:00 Uhr
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconSet icon="warning" status="warning" />
                      <Box sx={{ ml: 1 }}>
                        <Typography variant="body2">
                          Wartung der Waagen anstehend
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          In 3 Tagen
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Konfiguration Tab */}
        {activeTab === 4 && (
          <Box sx={{ p: 2 }}>
            <Typography variant="body1" paragraph>
              Hier können Sie die Einstellungen des Observer-Service und der Auto-Restart-Funktionalität konfigurieren.
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Änderungen an der Konfiguration werden sofort wirksam und müssen nicht neu gestartet werden.
            </Alert>
            
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <IconSet icon="settings" size="large" />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Konfigurationseinstellungen werden geladen...
              </Typography>
            </Box>
          </Box>
        )}

        {/* IP-Management Tab */}
        {activeTab === 5 && (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <IPManagerUI />
              </Grid>
              <Grid item xs={12} md={6} sx={{ mt: 2 }}>
                <IPConflictMonitor />
              </Grid>
              <Grid item xs={12} md={6} sx={{ mt: 2 }}>
                <HeartbeatMonitor />
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default HealthConnectors; 