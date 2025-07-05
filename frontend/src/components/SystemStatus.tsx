import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, CircularProgress, Chip, Tooltip, Alert, LinearProgress, Grid, Divider, useTheme, IconButton } from '@mui/material';
import IconSet from './IconSet';
import axios from 'axios';

interface SystemStatusProps {
  expanded?: boolean;
}

interface DetailedStatus {
  timestamp: string;
  system_info: {
    system: string;
    version: string;
    python_version: string;
    cpu_count: number;
    memory_total: number;
    memory_available: number;
  };
  current_stats: {
    cpu_percent: number;
    memory_percent: number;
    disk_percent: number;
  };
  database: {
    status: string;
    response_time_ms: number;
    error?: string;
  };
  app_info: {
    version: string;
    project_name: string;
    api_prefix: string;
  };
  status: string;
  cache: {
    from_cache: boolean;
    cached_at?: string;
    cache_age_seconds?: number;
  };
}

/**
 * SystemStatus - Zeigt den Status aller Systemkomponenten im Odoo-Stil an
 * 
 * Visualisiert den aktuellen Systemstatus mit Odoo-typischen Statusanzeigen und
 * Fortschrittsbalken. Unterstützt erweiterbare Details und Aktualisierungen.
 */
const SystemStatus: React.FC<SystemStatusProps> = ({ expanded = false }) => {
  const theme = useTheme();
  const [backendStatus, setBackendStatus] = useState<'healthy' | 'warning' | 'error' | 'checking' | 'timeout'>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [message, setMessage] = useState<string>('');
  const [showDetails, setShowDetails] = useState(expanded);
  const [detailedStatus, setDetailedStatus] = useState<DetailedStatus | null>(null);
  const [loadingDetailed, setLoadingDetailed] = useState(false);

  // Einfacher Gesundheitscheck
  const checkBackendStatus = async () => {
    try {
      setBackendStatus('checking');
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/health`, {
        timeout: 5000, // 5 Sekunden Timeout
      });
      
      if (response.data.status === 'healthy') {
        setBackendStatus('healthy');
        setConsecutiveFailures(0);
        setMessage('');
      } else {
        setBackendStatus('warning');
        setConsecutiveFailures(prev => prev + 1);
        setMessage('Der Backend-Server meldet einen ungesunden Zustand.');
      }
    } catch (error) {
      setBackendStatus('timeout');
      setConsecutiveFailures(prev => prev + 1);
      setMessage('Keine Verbindung zum Backend-Server möglich.');
    } finally {
      setLastChecked(new Date());
    }
  };

  // Detaillierter Statusbericht
  const fetchDetailedStatus = async () => {
    if (backendStatus === 'timeout') {
      return; // Keine Verbindung, kein Versuch
    }
    
    setLoadingDetailed(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/v1/system/status`, {
        timeout: 8000, // 8 Sekunden Timeout für detaillierte Informationen
      });
      
      setDetailedStatus(response.data);
      
      // Aktualisiere den Gesamtstatus basierend auf dem detaillierten Status
      if (response.data.status === 'healthy') {
        setBackendStatus('healthy');
      } else if (response.data.status === 'warning') {
        setBackendStatus('warning');
      } else {
        setBackendStatus('error');
      }
    } catch (error) {
      console.error('Fehler beim Abrufen des detaillierten Status:', error);
      setDetailedStatus(null);
    } finally {
      setLoadingDetailed(false);
    }
  };

  // Kombinierter Check beim Laden und dann alle 30 Sekunden
  useEffect(() => {
    const checkStatus = async () => {
      await checkBackendStatus();
      if (showDetails) {
        await fetchDetailedStatus();
      }
    };
    
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    
    return () => clearInterval(interval);
  }, [showDetails]);

  // Wenn Details angezeigt werden sollen, aber noch nicht geladen wurden
  useEffect(() => {
    if (showDetails && !detailedStatus && backendStatus !== 'timeout') {
      fetchDetailedStatus();
    }
  }, [showDetails, detailedStatus, backendStatus]);

  // Status-Eigenschaften
  const getStatusIcon = () => {
    switch (backendStatus) {
      case 'healthy': return <IconSet icon="check_circle" status="success" />;
      case 'warning': return <IconSet icon="warning" status="warning" />;
      case 'error': 
      case 'timeout': return <IconSet icon="error" status="error" />;
      case 'checking': return <CircularProgress size={24} />;
      default: return <IconSet icon="help" />;
    }
  };

  const getStatusText = () => {
    switch (backendStatus) {
      case 'healthy': return 'Online';
      case 'warning': return 'Warnung';
      case 'error': return 'Fehler';
      case 'timeout': return 'Offline';
      case 'checking': return 'Überprüfe...';
      default: return 'Unbekannt';
    }
  };

  // Formatiere Bytes in lesbare Größe
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Farbcodierung für Prozentsätze
  const getColorForPercent = (percent: number) => {
    if (percent < 60) return theme.palette.success.main;
    if (percent < 80) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Für aktuelle Odoo-UI-Standards: Verwende Papier mit leichter Erhöhung
  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2, 
        mb: 2,
        transition: 'all 0.3s',
        borderLeft: `3px solid ${theme.palette.primary.main}`,
        '&:hover': { 
          boxShadow: 2,
        } 
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconSet icon="dns" color={theme.palette.primary.main} size="large" />
          <Typography variant="h6" sx={{ ml: 1 }}>
            Systemstatus
          </Typography>
        </Box>
        
        <Box>
          <Chip 
            icon={getStatusIcon()} 
            label={getStatusText()}
            color={backendStatus === 'healthy' ? 'success' : backendStatus === 'warning' ? 'warning' : 'error'}
            variant="outlined"
            sx={{ mr: 1 }}
          />
          
          <IconButton 
            size="small" 
            onClick={() => setShowDetails(!showDetails)}
            aria-label={showDetails ? 'Details ausblenden' : 'Details anzeigen'}
          >
            <IconSet icon={showDetails ? 'expand_less' : 'expand_more'} />
          </IconButton>
          
          <IconButton 
            size="small"
            onClick={() => {
              checkBackendStatus();
              if (showDetails) fetchDetailedStatus();
            }}
            aria-label="Aktualisieren"
            sx={{ ml: 1 }}
          >
            <IconSet icon="refresh" />
          </IconButton>
        </Box>
      </Box>
      
      {message && (
        <Alert 
          severity={backendStatus === 'warning' ? 'warning' : 'error'} 
          sx={{ mt: 2 }}
          action={
            <IconButton 
              color="inherit" 
              size="small" 
              onClick={() => setMessage('')}
            >
              <IconSet icon="close" size="small" />
            </IconButton>
          }
        >
          {message}
        </Alert>
      )}
      
      {showDetails && (
        <Box sx={{ mt: 2 }}>
          {loadingDetailed ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" sx={{ ml: 1 }}>
                Lade detaillierte Statusinformationen...
              </Typography>
            </Box>
          ) : detailedStatus ? (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    <IconSet icon="memory" size="small" sx={{ mr: 0.5 }} />
                    System-Informationen
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body2">
                      Betriebssystem: <strong>{detailedStatus.system_info.system}</strong>
                    </Typography>
                    <Typography variant="body2">
                      App-Version: <strong>{detailedStatus.app_info.version}</strong>
                    </Typography>
                    <Typography variant="body2">
                      Python-Version: <strong>{detailedStatus.system_info.python_version}</strong>
                    </Typography>
                    <Typography variant="body2">
                      CPU-Kerne: <strong>{detailedStatus.system_info.cpu_count}</strong>
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    <IconSet icon="storage" size="small" sx={{ mr: 0.5 }} />
                    Datenbank-Status
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body2">
                      Status: 
                      <Chip 
                        icon={
                          detailedStatus.database.status === 'connected' ? 
                          <IconSet icon="check_circle" size="small" status="success" /> : 
                          <IconSet icon="error" size="small" status="error" />
                        } 
                        label={detailedStatus.database.status === 'connected' ? 'Verbunden' : 'Fehler'}
                        size="small"
                        color={detailedStatus.database.status === 'connected' ? 'success' : 'error'}
                        variant="outlined"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                    <Typography variant="body2">
                      Antwortzeit: <strong>{detailedStatus.database.response_time_ms}ms</strong>
                    </Typography>
                    {detailedStatus.database.error && (
                      <Typography variant="body2" color="error">
                        Fehler: {detailedStatus.database.error}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                <IconSet icon="trending_up" size="small" sx={{ mr: 0.5 }} />
                Aktuelle Systemauslastung
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" gutterBottom>
                    CPU: {detailedStatus.current_stats.cpu_percent}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={detailedStatus.current_stats.cpu_percent} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4, 
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getColorForPercent(detailedStatus.current_stats.cpu_percent),
                      },
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" gutterBottom>
                    Speicher: {detailedStatus.current_stats.memory_percent}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={detailedStatus.current_stats.memory_percent} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4, 
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getColorForPercent(detailedStatus.current_stats.memory_percent),
                      },
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" gutterBottom>
                    Festplatte: {detailedStatus.current_stats.disk_percent}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={detailedStatus.current_stats.disk_percent} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4, 
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getColorForPercent(detailedStatus.current_stats.disk_percent),
                      },
                    }}
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Letzte Aktualisierung: {new Date(detailedStatus.timestamp).toLocaleString()}
                </Typography>
                
                {detailedStatus.cache.from_cache && (
                  <Tooltip title="Diese Daten stammen aus dem Cache" arrow>
                    <Chip 
                      icon={<IconSet icon="history" size="small" />}
                      label={`Cache (${detailedStatus.cache.cache_age_seconds}s)`}
                      size="small"
                      color="default"
                      variant="outlined"
                    />
                  </Tooltip>
                )}
              </Box>
            </>
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>
              Keine detaillierten Statusinformationen verfügbar.
            </Alert>
          )}
        </Box>
      )}
      
      {!showDetails && lastChecked && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Letzte Prüfung: {lastChecked.toLocaleString()}
          {consecutiveFailures > 0 && ` (${consecutiveFailures} fehlgeschlagene Versuche)`}
        </Typography>
      )}
    </Paper>
  );
};

export default SystemStatus; 