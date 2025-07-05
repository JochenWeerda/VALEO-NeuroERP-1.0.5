import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Chip,
  Alert,
  AlertTitle,
  LinearProgress,
  Divider,
  useTheme
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HeartBrokenIcon from '@mui/icons-material/HeartBroken';
import IconSet from '../IconSet';

/**
 * Heartbeat-Monitor-Komponente
 * 
 * Überwacht die Heartbeat-Signale aller registrierten Services.
 * Zeigt an, welche Services regelmäßig Heartbeats senden und welche inaktiv sind.
 */
const HeartbeatMonitor = () => {
  const theme = useTheme();
  const [heartbeats, setHeartbeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({
    active: 0,
    warning: 0,
    inactive: 0,
    total: 0
  });

  // Mock-Daten für Heartbeats
  const mockHeartbeats = [
    {
      service_id: 'finance-service_win10-dev',
      service_name: 'Finance-Service',
      last_heartbeat: '2025-05-28T14:23:45',
      status: 'active',
      heartbeat_interval_seconds: 60,
      elapsed_seconds: 10
    },
    {
      service_id: 'beleg-service_win10-dev',
      service_name: 'Beleg-Service',
      last_heartbeat: '2025-05-28T14:23:40',
      status: 'active',
      heartbeat_interval_seconds: 60,
      elapsed_seconds: 15
    },
    {
      service_id: 'observer-service_win10-dev',
      service_name: 'Observer-Service',
      last_heartbeat: '2025-05-28T14:23:38',
      status: 'active',
      heartbeat_interval_seconds: 30,
      elapsed_seconds: 17
    },
    {
      service_id: 'api-gateway_win10-dev',
      service_name: 'API-Gateway',
      last_heartbeat: '2025-05-28T14:20:15',
      status: 'warning',
      heartbeat_interval_seconds: 60,
      elapsed_seconds: 160
    },
    {
      service_id: 'frontend-dev_win10-dev',
      service_name: 'Frontend-Dev-Server',
      last_heartbeat: '2025-05-28T13:45:41',
      status: 'inactive',
      heartbeat_interval_seconds: 60,
      elapsed_seconds: 2380
    }
  ];

  // Daten laden
  useEffect(() => {
    // Hier würde eigentlich ein API-Call zum IP-Manager stehen
    // z.B. fetch('http://localhost:8020/heartbeats')
    
    // Simuliere einen API-Call mit Dummy-Daten
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simuliere Netzwerkverzögerung
        await new Promise(resolve => setTimeout(resolve, 800));
        setHeartbeats(mockHeartbeats);
        
        // Statistiken berechnen
        const stats = {
          active: mockHeartbeats.filter(h => h.status === 'active').length,
          warning: mockHeartbeats.filter(h => h.status === 'warning').length,
          inactive: mockHeartbeats.filter(h => h.status === 'inactive').length,
          total: mockHeartbeats.length
        };
        setStatistics(stats);
        
        setLoading(false);
      } catch (err) {
        setError('Fehler beim Laden der Heartbeat-Daten');
        setLoading(false);
      }
    };

    fetchData();
    
    // Regelmäßiges Aktualisieren alle 30 Sekunden
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Heartbeat Status manuell prüfen
  const handleCheckHeartbeat = (serviceId) => {
    console.log(`Heartbeat-Status für Service ${serviceId} wird geprüft...`);
    // Hier würde ein API-Call an den IP-Manager gemacht werden
    // z.B. fetch(`http://localhost:8020/heartbeat`, { 
    //   method: 'POST',
    //   headers: {'Content-Type': 'application/json'},
    //   body: JSON.stringify({ service_id: serviceId })
    // })
    
    // Simulierte Antwort
    setTimeout(() => {
      // Optimistisches UI-Update - Status auf aktiv setzen
      setHeartbeats(heartbeats.map(heartbeat => 
        heartbeat.service_id === serviceId 
          ? { 
              ...heartbeat, 
              status: 'active',
              last_heartbeat: new Date().toISOString(),
              elapsed_seconds: 0
            } 
          : heartbeat
      ));
      
      // Statistiken aktualisieren
      setStatistics({
        ...statistics,
        active: statistics.active + 1,
        warning: Math.max(0, statistics.warning - 1),
        inactive: Math.max(0, statistics.inactive - 1)
      });
    }, 800);
  };

  // Daten aktualisieren
  const handleRefresh = () => {
    setLoading(true);
    // Simuliere Netzwerkverzögerung
    setTimeout(() => {
      setHeartbeats(mockHeartbeats);
      
      // Statistiken aktualisieren
      const stats = {
        active: mockHeartbeats.filter(h => h.status === 'active').length,
        warning: mockHeartbeats.filter(h => h.status === 'warning').length,
        inactive: mockHeartbeats.filter(h => h.status === 'inactive').length,
        total: mockHeartbeats.length
      };
      setStatistics(stats);
      
      setLoading(false);
    }, 800);
  };

  // Render Status-Chip
  const renderStatusChip = (status, elapsedSeconds, intervalSeconds) => {
    const statusConfig = {
      active: { color: 'success', label: 'Aktiv', icon: <FavoriteIcon fontSize="small" /> },
      warning: { color: 'warning', label: 'Verzögert', icon: <IconSet icon="pending" size="small" /> },
      inactive: { color: 'error', label: 'Inaktiv', icon: <HeartBrokenIcon fontSize="small" /> }
    };
    
    const config = statusConfig[status] || { color: 'default', label: status };
    
    let subtitle = '';
    if (status === 'active') {
      subtitle = `Vor ${Math.floor(elapsedSeconds / 60)} Min ${elapsedSeconds % 60} Sek`;
    } else if (status === 'warning') {
      subtitle = `${Math.floor(elapsedSeconds / 60)} Min überfällig`;
    } else if (status === 'inactive') {
      subtitle = `${Math.floor(elapsedSeconds / 60)} Min inaktiv`;
    }
    
    return (
      <Box>
        <Chip 
          size="small" 
          color={config.color} 
          label={config.label}
          icon={config.icon}
        />
        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
          {subtitle}
        </Typography>
      </Box>
    );
  };

  // Render Heartbeat Progress
  const renderHeartbeatProgress = (elapsedSeconds, intervalSeconds) => {
    const percent = Math.min(100, (elapsedSeconds / intervalSeconds) * 100);
    const color = percent < 75 ? 'success.main' : percent < 100 ? 'warning.main' : 'error.main';
    
    return (
      <Box sx={{ position: 'relative', width: '100%', height: 4, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${percent}%`,
            bgcolor: color,
            borderRadius: 1,
            transition: 'width 0.3s ease'
          }}
        />
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          <FavoriteIcon sx={{ verticalAlign: 'middle', mr: 1, color: theme.palette.error.main }} />
          Heartbeat-Monitor
        </Typography>
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

      {loading && <LinearProgress sx={{ mb: 2 }} />}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Fehler</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Statistik-Karten */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Aktive Services</Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
              <Typography variant="h5" color="success.main">{statistics.active}</Typography>
              <Typography variant="caption" sx={{ ml: 1 }}>von {statistics.total}</Typography>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Verzögerte Services</Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
              <Typography variant="h5" color="warning.main">{statistics.warning}</Typography>
              <Typography variant="caption" sx={{ ml: 1 }}>von {statistics.total}</Typography>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Inaktive Services</Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
              <Typography variant="h5" color="error.main">{statistics.inactive}</Typography>
              <Typography variant="caption" sx={{ ml: 1 }}>von {statistics.total}</Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Card>
        <CardHeader 
          title="Service Heartbeats" 
          avatar={<IconSet icon="monitor_heart" color={theme.palette.primary.main} />}
          sx={{ 
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        />
        <CardContent sx={{ p: 0 }}>
          <List>
            {heartbeats.map((heartbeat) => (
              <ListItem 
                key={heartbeat.service_id}
                sx={{ 
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  '&:last-child': { borderBottom: 'none' }
                }}
              >
                <ListItemIcon>
                  <IconSet 
                    icon={heartbeat.status === 'active' ? 'favorite' : (heartbeat.status === 'warning' ? 'pending' : 'heart_broken')} 
                    status={heartbeat.status === 'active' ? 'success' : (heartbeat.status === 'warning' ? 'warning' : 'error')}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight="medium">
                      {heartbeat.service_name}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="caption" display="block">
                        Letzter Heartbeat: {new Date(heartbeat.last_heartbeat).toLocaleString()}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        {renderHeartbeatProgress(heartbeat.elapsed_seconds, heartbeat.heartbeat_interval_seconds)}
                      </Box>
                    </>
                  }
                />
                <Box sx={{ ml: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 120 }}>
                  {renderStatusChip(heartbeat.status, heartbeat.elapsed_seconds, heartbeat.heartbeat_interval_seconds)}
                  {(heartbeat.status === 'warning' || heartbeat.status === 'inactive') && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleCheckHeartbeat(heartbeat.service_id)}
                      sx={{ mt: 1 }}
                    >
                      Prüfen
                    </Button>
                  )}
                </Box>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default HeartbeatMonitor; 