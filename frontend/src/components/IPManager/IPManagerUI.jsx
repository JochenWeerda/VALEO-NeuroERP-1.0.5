import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AlertTitle,
  Grid,
  Tooltip,
  LinearProgress,
  useTheme
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DnsIcon from '@mui/icons-material/Dns';
import PortableWifiOffIcon from '@mui/icons-material/PortableWifiOff';
import RouterIcon from '@mui/icons-material/Router';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import ReportIcon from '@mui/icons-material/Report';
import SaveIcon from '@mui/icons-material/Save';
import IconSet from '../IconSet';

/**
 * IP-Manager UI-Komponente
 * 
 * Zeigt die vom IP-Manager verwalteten Services und deren IP-Adressen/Ports an.
 * Ermöglicht die Verwaltung der Portzuweisungen und Konfiguration des IP-Managers.
 */
const IPManagerUI = () => {
  const theme = useTheme();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [configData, setConfigData] = useState({
    serviceIpBase: '127.0.0.1',
    defaultPortRange: [8000, 9000],
    portAllocationStrategy: 'sequential',
    fallbackMode: true
  });
  const [portRanges, setPortRanges] = useState({
    api: [8000, 8099],
    web: [3000, 3099],
    database: [5000, 5099],
    observer: [8010, 8010],
    finance: [8007, 8007],
    minimal: [8005, 8005]
  });
  
  // Mock-Daten für IP-Manager-Services
  const mockIpManagerServices = [
    {
      service_id: 'finance-service_win10-dev',
      service_name: 'Finance-Service',
      service_type: 'finance',
      ip: '127.0.0.1',
      port: 8007,
      status: 'active',
      registered_at: '2025-05-25T08:15:32',
      last_heartbeat: '2025-05-28T14:23:45',
      environment: 'development'
    },
    {
      service_id: 'beleg-service_win10-dev',
      service_name: 'Beleg-Service',
      service_type: 'minimal',
      ip: '127.0.0.1',
      port: 8005,
      status: 'active',
      registered_at: '2025-05-25T08:15:45',
      last_heartbeat: '2025-05-28T14:23:40',
      environment: 'development'
    },
    {
      service_id: 'observer-service_win10-dev',
      service_name: 'Observer-Service',
      service_type: 'observer',
      ip: '127.0.0.1',
      port: 8010,
      status: 'active',
      registered_at: '2025-05-25T08:14:30',
      last_heartbeat: '2025-05-28T14:23:38',
      environment: 'development'
    },
    {
      service_id: 'api-gateway_win10-dev',
      service_name: 'API-Gateway',
      service_type: 'api',
      ip: '127.0.0.1',
      port: 8080,
      status: 'fallback',
      registered_at: '2025-05-26T09:32:10',
      last_heartbeat: '2025-05-28T14:22:15',
      environment: 'development',
      fallback_reason: 'no_available_port'
    },
    {
      service_id: 'frontend-dev_win10-dev',
      service_name: 'Frontend-Dev-Server',
      service_type: 'web',
      ip: '127.0.0.1',
      port: 3001,
      status: 'active',
      registered_at: '2025-05-25T08:18:22',
      last_heartbeat: '2025-05-28T14:23:41',
      environment: 'development'
    }
  ];

  // Daten laden
  useEffect(() => {
    // Hier würde eigentlich ein API-Call zum IP-Manager stehen
    // z.B. fetch('http://localhost:8020/services')
    
    // Simuliere einen API-Call mit Dummy-Daten
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simuliere Netzwerkverzögerung
        await new Promise(resolve => setTimeout(resolve, 800));
        setServices(mockIpManagerServices);
        setLoading(false);
      } catch (err) {
        setError('Fehler beim Laden der IP-Manager-Daten');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Service löschen
  const handleDeleteService = (serviceId) => {
    console.log(`Service ${serviceId} wird aus dem IP-Manager entfernt...`);
    // Hier würde ein API-Call an den IP-Manager gemacht werden
    // z.B. fetch(`http://localhost:8020/deregister`, { 
    //   method: 'POST',
    //   headers: {'Content-Type': 'application/json'},
    //   body: JSON.stringify({ service_id: serviceId })
    // })
    
    // Optimistisches UI-Update
    setServices(services.filter(service => service.service_id !== serviceId));
  };

  // Konfiguration speichern
  const handleSaveConfig = () => {
    // Hier würde ein API-Call an den IP-Manager gemacht werden
    // z.B. fetch(`http://localhost:8020/config`, { 
    //   method: 'POST', 
    //   headers: {'Content-Type': 'application/json'},
    //   body: JSON.stringify(configData)
    // })
    
    console.log('Speichere IP-Manager-Konfiguration:', configData, portRanges);
    setConfigDialogOpen(false);
  };

  // Daten aktualisieren
  const handleRefresh = () => {
    setLoading(true);
    // Simuliere Netzwerkverzögerung
    setTimeout(() => {
      setServices(mockIpManagerServices);
      setLoading(false);
    }, 800);
  };

  // Render Status-Chip
  const renderStatusChip = (status, fallbackReason) => {
    const statusConfig = {
      active: { color: 'success', label: 'Aktiv' },
      inactive: { color: 'error', label: 'Inaktiv' },
      fallback: { color: 'warning', label: 'Fallback' }
    };
    
    const config = statusConfig[status] || { color: 'default', label: status };
    
    return (
      <Tooltip title={fallbackReason ? `Grund: ${fallbackReason}` : ''}>
        <Chip size="small" color={config.color} label={config.label} />
      </Tooltip>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          <DnsIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          IP-Manager-Status
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<SettingsIcon />} 
            onClick={() => setConfigDialogOpen(true)}
            size="small"
            sx={{ mr: 1 }}
          >
            Konfiguration
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={handleRefresh}
            disabled={loading}
            size="small"
          >
            Aktualisieren
          </Button>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Fehler</AlertTitle>
          {error}
        </Alert>
      )}

      {!loading && !error && services.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Keine Services beim IP-Manager registriert.
        </Alert>
      )}

      {!loading && !error && services.length > 0 && (
        <Card>
          <CardHeader 
            title="Registrierte Services" 
            avatar={<RouterIcon color="primary" />}
            action={
              <Chip 
                label={`${services.length} Services`} 
                size="small" 
                color="primary" 
                variant="outlined" 
              />
            }
            sx={{ 
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              borderBottom: `1px solid ${theme.palette.divider}`
            }}
          />
          <CardContent sx={{ p: 0 }}>
            <List dense>
              {services.map((service) => (
                <ListItem 
                  key={service.service_id}
                  sx={{ 
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    '&:last-child': { borderBottom: 'none' }
                  }}
                >
                  <ListItemIcon>
                    <IconSet 
                      icon={service.status === 'active' ? 'dns' : 'portable_wifi_off'} 
                      status={service.status === 'active' ? 'success' : (service.status === 'fallback' ? 'warning' : 'error')}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight="medium">{service.service_name}</Typography>
                        {renderStatusChip(service.status, service.fallback_reason)}
                        <Chip 
                          size="small" 
                          variant="outlined" 
                          label={service.service_type} 
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="caption" display="block">
                          ID: {service.service_id}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          <b>Endpunkt:</b> {service.ip}:{service.port} | <b>Registriert:</b> {new Date(service.registered_at).toLocaleString()} | <b>Letzter Heartbeat:</b> {new Date(service.last_heartbeat).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Service aus dem IP-Manager entfernen">
                      <IconButton 
                        edge="end" 
                        aria-label="delete" 
                        onClick={() => handleDeleteService(service.service_id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* IP-Manager-Konfigurationsstatistik */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Portzuweisungs-Statistik" 
              avatar={<IconSet icon="speed" color={theme.palette.primary.main} />}
              sx={{ 
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                borderBottom: `1px solid ${theme.palette.divider}`
              }}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Gesamte Services</Typography>
                  <Typography variant="h6">{services.length}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Aktive Services</Typography>
                  <Typography variant="h6">{services.filter(s => s.status === 'active').length}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Fallback-Services</Typography>
                  <Typography variant="h6">{services.filter(s => s.status === 'fallback').length}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Zugewiesene Ports</Typography>
                  <Typography variant="h6">{services.length}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="IP-Manager-Status" 
              avatar={<IconSet icon="travel_explore" color={theme.palette.primary.main} />}
              sx={{ 
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                borderBottom: `1px solid ${theme.palette.divider}`
              }}
            />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Chip color="success" size="small" label="Aktiv" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  IP-Manager läuft unter http://localhost:8020
                </Typography>
              </Box>
              <Typography variant="body2" paragraph>
                <b>Portzuweisung:</b> {configData.portAllocationStrategy === 'sequential' ? 'Sequentiell' : 'Zufällig'} | 
                <b> Fallback-Modus:</b> {configData.fallbackMode ? 'Aktiv' : 'Inaktiv'}
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<RefreshIcon />} 
                onClick={handleRefresh}
                size="small"
                fullWidth
              >
                Status aktualisieren
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* IP-Manager-Konfigurationsdialog */}
      <Dialog
        open={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SettingsIcon sx={{ mr: 1 }} />
            IP-Manager-Konfiguration
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>Grundeinstellungen</Typography>
              <TextField
                label="Service IP Basis"
                value={configData.serviceIpBase}
                onChange={(e) => setConfigData({...configData, serviceIpBase: e.target.value})}
                fullWidth
                margin="normal"
                size="small"
                helperText="Basis-IP-Adresse für Services (z.B. 127.0.0.1)"
              />
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TextField
                  label="Standard-Portbereich Start"
                  value={configData.defaultPortRange[0]}
                  onChange={(e) => setConfigData({
                    ...configData, 
                    defaultPortRange: [parseInt(e.target.value), configData.defaultPortRange[1]]
                  })}
                  type="number"
                  fullWidth
                  margin="normal"
                  size="small"
                />
                <TextField
                  label="Standard-Portbereich Ende"
                  value={configData.defaultPortRange[1]}
                  onChange={(e) => setConfigData({
                    ...configData, 
                    defaultPortRange: [configData.defaultPortRange[0], parseInt(e.target.value)]
                  })}
                  type="number"
                  fullWidth
                  margin="normal"
                  size="small"
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>Zuweisungsstrategie</Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" gutterBottom>Portzuweisungsstrategie</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant={configData.portAllocationStrategy === 'sequential' ? 'contained' : 'outlined'}
                      onClick={() => setConfigData({...configData, portAllocationStrategy: 'sequential'})}
                      size="small"
                      sx={{ flexGrow: 1 }}
                    >
                      Sequentiell
                    </Button>
                    <Button
                      variant={configData.portAllocationStrategy === 'random' ? 'contained' : 'outlined'}
                      onClick={() => setConfigData({...configData, portAllocationStrategy: 'random'})}
                      size="small"
                      sx={{ flexGrow: 1 }}
                    >
                      Zufällig
                    </Button>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="body2" gutterBottom>Fallback-Modus</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant={configData.fallbackMode ? 'contained' : 'outlined'}
                      onClick={() => setConfigData({...configData, fallbackMode: true})}
                      size="small"
                      sx={{ flexGrow: 1 }}
                    >
                      Aktiviert
                    </Button>
                    <Button
                      variant={!configData.fallbackMode ? 'contained' : 'outlined'}
                      onClick={() => setConfigData({...configData, fallbackMode: false})}
                      size="small"
                      sx={{ flexGrow: 1 }}
                    >
                      Deaktiviert
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>Portbereiche nach Service-Typ</Typography>
              
              <Grid container spacing={2}>
                {Object.entries(portRanges).map(([type, range]) => (
                  <Grid item xs={12} sm={6} md={4} key={type}>
                    <Typography variant="body2" gutterBottom>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        label="Start"
                        value={range[0]}
                        onChange={(e) => setPortRanges({
                          ...portRanges,
                          [type]: [parseInt(e.target.value), range[1]]
                        })}
                        type="number"
                        fullWidth
                        size="small"
                      />
                      <TextField
                        label="Ende"
                        value={range[1]}
                        onChange={(e) => setPortRanges({
                          ...portRanges,
                          [type]: [range[0], parseInt(e.target.value)]
                        })}
                        type="number"
                        fullWidth
                        size="small"
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialogOpen(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleSaveConfig} 
            variant="contained"
            startIcon={<SaveIcon />}
          >
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IPManagerUI; 