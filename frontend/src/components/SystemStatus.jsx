import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert, Card, CardContent, Typography, Box, Chip, Grid, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import { API_BASE_URL } from '../config';

/**
 * SystemStatus-Komponente zur Anzeige des Systemstatus
 */
const SystemStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/v1/reports/system-status`);
        setStatus(response.data);
        setError(null);
      } catch (err) {
        setError('Fehler beim Abrufen des Systemstatus');
        console.error('Fehler beim Abrufen des Systemstatus:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSystemStatus();
    // Status alle 60 Sekunden aktualisieren
    const interval = setInterval(fetchSystemStatus, 60000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  if (!status) {
    return null;
  }

  const getStatusIcon = (statusType) => {
    switch (statusType) {
      case 'critical':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'ok':
      default:
        return <CheckCircleIcon color="success" />;
    }
  };

  const getStatusColor = (statusType) => {
    switch (statusType) {
      case 'critical':
        return 'error';
      case 'warning':
        return 'warning';
      case 'ok':
      default:
        return 'success';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          {getStatusIcon(status.status)}
          <Typography variant="h5" component="div" ml={1}>
            Systemstatus
          </Typography>
          <Chip 
            label={status.status.toUpperCase()} 
            color={getStatusColor(status.status)} 
            size="small" 
            sx={{ ml: 2 }} 
          />
        </Box>

        <Typography variant="body2" color="text.secondary" mb={2}>
          Letztes Update: {formatTimestamp(status.timestamp)}
        </Typography>

        {status.critical_issues.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Kritische Probleme:</Typography>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              {status.critical_issues.map((issue, index) => (
                <li key={`critical-${index}`}>{issue.message}</li>
              ))}
            </ul>
          </Alert>
        )}

        {status.warnings.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Warnungen:</Typography>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              {status.warnings.map((warning, index) => (
                <li key={`warning-${index}`}>{warning.message}</li>
              ))}
            </ul>
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Systemmetriken
                </Typography>
                <Box>
                  <Typography variant="body2">
                    CPU-Auslastung: {status.system_metrics.cpu_usage}%
                  </Typography>
                  <Typography variant="body2">
                    Speicherauslastung: {status.system_metrics.memory_usage}%
                  </Typography>
                  <Typography variant="body2">
                    Festplattenauslastung: {status.system_metrics.disk_usage}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Dienststatus
                </Typography>
                <Box>
                  {Object.entries(status.service_status).map(([service, serviceStatus]) => (
                    <Box key={service} display="flex" alignItems="center" mb={1}>
                      {serviceStatus === 'running' ? (
                        <CheckCircleIcon color="success" fontSize="small" />
                      ) : (
                        <ErrorIcon color="error" fontSize="small" />
                      )}
                      <Typography variant="body2" ml={1}>
                        {service}: {serviceStatus}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SystemStatus; 