import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Speed as SpeedIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon
} from '@mui/icons-material';
import { usePreload, usePreloadPerformance } from '../hooks/usePreload';
import { preloadService, CRITICAL_ROUTES } from '../services/PreloadService';

// Preload-Optimizer Komponente
export const PreloadOptimizer: React.FC = () => {
  const {
    preloadStatus,
    preloadCriticalRoutes,
    preloadAllRoutes,
    getPreloadedRoutes,
    getPendingRoutes
  } = usePreload();

  const { metrics, trackPreloadAttempt, getSuccessRate, resetMetrics } = usePreloadPerformance();

  const [isOptimizerEnabled, setIsOptimizerEnabled] = useState(true);
  const [autoPreloadEnabled, setAutoPreloadEnabled] = useState(true);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Performance-Metriken berechnen
  const preloadedCount = getPreloadedRoutes().length;
  const pendingCount = getPendingRoutes().length;
  const totalRoutes = Object.keys(CRITICAL_ROUTES).length;
  const preloadProgress = (preloadedCount / totalRoutes) * 100;
  const successRate = getSuccessRate();

  // Automatisches Preloading
  useEffect(() => {
    if (isOptimizerEnabled && autoPreloadEnabled) {
      const interval = setInterval(() => {
        preloadCriticalRoutes();
      }, 5000); // Alle 5 Sekunden

      return () => clearInterval(interval);
    }
  }, [isOptimizerEnabled, autoPreloadEnabled, preloadCriticalRoutes]);

  // Manuelles Preloading
  const handleManualPreload = () => {
    const startTime = performance.now();
    preloadAllRoutes();
    
    setTimeout(() => {
      const endTime = performance.now();
      trackPreloadAttempt(true, endTime - startTime);
    }, 1000);
  };

  // Optimierungseinstellungen
  const optimizationSettings = [
    {
      name: 'Kritische Routen Preloading',
      description: 'Lädt kritische Routen sofort beim Start',
      enabled: true,
      priority: 'critical'
    },
    {
      name: 'Hover-basiertes Preloading',
      description: 'Lädt Routen beim Hover über Navigation-Links',
      enabled: true,
      priority: 'high'
    },
    {
      name: 'Idle-Zeit Preloading',
      description: 'Nutzt Browser-Idle-Zeit für Preloading',
      enabled: true,
      priority: 'medium'
    },
    {
      name: 'Intersection Observer',
      description: 'Preloading basierend auf Sichtbarkeit',
      enabled: false,
      priority: 'low'
    }
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        🔄 Preload-Optimizer
      </Typography>

      {/* Status-Übersicht */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Preload-Status</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Status aktualisieren">
                <IconButton onClick={() => window.location.reload()} size="small">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <FormControlLabel
                control={
                  <Switch
                    checked={isOptimizerEnabled}
                    onChange={(e) => setIsOptimizerEnabled(e.target.checked)}
                  />
                }
                label="Optimizer aktiv"
              />
            </Box>
          </Box>

          {/* Fortschrittsbalken */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Preload-Fortschritt</Typography>
              <Typography variant="body2">{preloadedCount}/{totalRoutes}</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={preloadProgress} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          {/* Status-Chips */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              icon={<CheckCircleIcon />} 
              label={`${preloadedCount} Preloaded`} 
              color="success" 
              variant="outlined"
            />
            <Chip 
              icon={<ScheduleIcon />} 
              label={`${pendingCount} Pending`} 
              color="warning" 
              variant="outlined"
            />
            <Chip 
              icon={<SpeedIcon />} 
              label={`${successRate.toFixed(1)}% Success`} 
              color="info" 
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Performance-Metriken */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Performance-Metriken</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Gesamte Preloads</Typography>
              <Typography variant="h4">{metrics.totalPreloads}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Erfolgreiche Preloads</Typography>
              <Typography variant="h4" color="success.main">{metrics.successfulPreloads}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Fehlgeschlagene Preloads</Typography>
              <Typography variant="h4" color="error.main">{metrics.failedPreloads}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Durchschnittliche Ladezeit</Typography>
              <Typography variant="h4">{metrics.averageLoadTime.toFixed(0)}ms</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Route-Details */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Route-Details</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Preloaded Routes</Typography>
              <List dense>
                {getPreloadedRoutes().map((route) => (
                  <ListItem key={route} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircleIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={route} 
                      secondary={CRITICAL_ROUTES[route]?.priority || 'unknown'}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Pending Routes</Typography>
              <List dense>
                {getPendingRoutes().map((route) => (
                  <ListItem key={route} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <ScheduleIcon color="warning" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={route} 
                      secondary={CRITICAL_ROUTES[route]?.priority || 'unknown'}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Optimierungseinstellungen */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Optimierungseinstellungen</Typography>
            <Button
              startIcon={<SettingsIcon />}
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              size="small"
            >
              {showAdvancedSettings ? 'Einfach' : 'Erweitert'}
            </Button>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={autoPreloadEnabled}
                onChange={(e) => setAutoPreloadEnabled(e.target.checked)}
              />
            }
            label="Automatisches Preloading aktivieren"
            sx={{ mb: 2 }}
          />

          {showAdvancedSettings && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Erweiterte Einstellungen</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {optimizationSettings.map((setting, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Switch checked={setting.enabled} />
                      </ListItemIcon>
                      <ListItemText
                        primary={setting.name}
                        secondary={setting.description}
                      />
                      <Chip 
                        label={setting.priority} 
                        size="small" 
                        color={setting.priority === 'critical' ? 'error' : 'default'}
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Aktionen */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Aktionen</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<PlayIcon />}
              onClick={handleManualPreload}
              disabled={!isOptimizerEnabled}
            >
              Manuelles Preloading starten
            </Button>
            <Button
              variant="outlined"
              startIcon={<PauseIcon />}
              onClick={() => setAutoPreloadEnabled(false)}
              disabled={!autoPreloadEnabled}
            >
              Auto-Preloading pausieren
            </Button>
            <Button
              variant="outlined"
              startIcon={<StopIcon />}
              onClick={resetMetrics}
              color="warning"
            >
              Metriken zurücksetzen
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Warnungen */}
      {metrics.failedPreloads > 0 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Es wurden {metrics.failedPreloads} fehlgeschlagene Preload-Versuche erkannt. 
          Überprüfen Sie die Netzwerkverbindung und die Route-Konfiguration.
        </Alert>
      )}

      {successRate < 80 && metrics.totalPreloads > 5 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Die Erfolgsrate liegt bei {successRate.toFixed(1)}%. 
          Erwägen Sie eine Optimierung der Preload-Strategie.
        </Alert>
      )}
    </Box>
  );
};

// Kompakte Version für Dashboard-Integration
export const PreloadOptimizerCompact: React.FC = () => {
  const { preloadStatus, getPreloadedRoutes } = usePreload();
  const { getSuccessRate } = usePreloadPerformance();

  const preloadedCount = getPreloadedRoutes().length;
  const totalRoutes = Object.keys(CRITICAL_ROUTES).length;
  const preloadProgress = (preloadedCount / totalRoutes) * 100;
  const successRate = getSuccessRate();

  return (
    <Card sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2">Preload-Status</Typography>
        <Chip 
          label={`${preloadedCount}/${totalRoutes}`} 
          size="small" 
          color={preloadProgress === 100 ? 'success' : 'default'}
        />
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={preloadProgress} 
        sx={{ height: 4, borderRadius: 2 }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        Erfolgsrate: {successRate.toFixed(1)}%
      </Typography>
    </Card>
  );
}; 