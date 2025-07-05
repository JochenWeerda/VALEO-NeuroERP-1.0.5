import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  IconButton,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  FormGroup,
  Tooltip,
  Divider
} from '@mui/material';
import {
  CheckCircle as ResolveIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Alert as AlertType, AlertSettings, AlertSubscription } from '../../types/compliance';
import { complianceService } from '../../services/complianceService';
import { useForm, Controller } from 'react-hook-form';

interface AlertSettingsFormData {
  notification_threshold: {
    low: number;
    high: number;
  };
  notification_delay: number;
  auto_resolve: boolean;
  escalation_timeout?: number;
}

interface SubscriptionFormData {
  notification_types: ('low' | 'high')[];
  notification_channels: ('email' | 'sms' | 'push')[];
}

interface AlertDialogData {
  open: boolean;
  alert: AlertType | null;
}

const AlertManagement: React.FC<{ batchId: string }> = ({ batchId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<AlertType[]>([]);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AlertType | null>(null);
  const [dialogData, setDialogData] = useState<AlertDialogData>({
    open: false,
    alert: null
  });
  
  const settingsForm = useForm<AlertSettingsFormData>();
  const subscriptionForm = useForm<SubscriptionFormData>();
  
  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      setError(null);
      try {
        const alerts = await complianceService.getActiveAlerts(batchId);
        setActiveAlerts(alerts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fehler beim Abrufen der Alerts');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAlerts();
    
    // Aktualisiere alle 30 Sekunden
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [batchId]);
  
  const onConfigureAlerts = async (data: AlertSettingsFormData) => {
    setLoading(true);
    setError(null);
    try {
      await complianceService.configureAlerts(
        batchId,
        data as AlertSettings
      );
      setShowSettingsDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Konfigurieren der Alerts');
    } finally {
      setLoading(false);
    }
  };
  
  const onSubscribeToAlerts = async (data: SubscriptionFormData) => {
    setLoading(true);
    setError(null);
    try {
      const subscription: AlertSubscription = {
        user_id: 'current_user', // TODO: Aus Auth-Kontext
        batch_id: batchId,
        notification_types: data.notification_types,
        active: true,
        notification_channels: data.notification_channels
      };
      
      await complianceService.subscribeToAlerts(batchId, subscription);
      setShowSubscriptionDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Registrieren der Subscription');
    } finally {
      setLoading(false);
    }
  };
  
  const onResolveAlert = async (alertId: string) => {
    setLoading(true);
    setError(null);
    try {
      await complianceService.resolveAlert(
        batchId,
        alertId,
        'current_user' // TODO: Aus Auth-Kontext
      );
      
      // Aktualisiere die Liste
      const alerts = await complianceService.getActiveAlerts(batchId);
      setActiveAlerts(alerts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Auflösen des Alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleAlertClear = async (alertKey: string) => {
    try {
      await complianceService.clearAlert(alertKey);
      fetchAlerts();
    } catch (error) {
      console.error('Fehler beim Löschen des Alerts:', error);
    }
  };

  const getSeverityIcon = (schweregrad: number) => {
    switch (true) {
      case schweregrad >= 3:
        return <ErrorIcon color="error" />;
      case schweregrad === 2:
        return <WarningIcon color="warning" />;
      default:
        return <ResolveIcon color="success" />;
    }
  };

  const getSeverityColor = (schweregrad: number) => {
    switch (true) {
      case schweregrad >= 3:
        return 'error';
      case schweregrad === 2:
        return 'warning';
      default:
        return 'success';
    }
  };

  const getSeverityText = (schweregrad: number) => {
    switch (true) {
      case schweregrad >= 3:
        return 'Kritisch';
      case schweregrad === 2:
        return 'Warnung';
      default:
        return 'Info';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Alert-Management
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  Aktive Alerts
                </Typography>
                
                <Box>
                  <Tooltip title="Alert-Einstellungen">
                    <IconButton
                      onClick={() => setShowSettingsDialog(true)}
                      disabled={loading}
                    >
                      <SettingsIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Benachrichtigungen konfigurieren">
                    <IconButton
                      onClick={() => setShowSubscriptionDialog(true)}
                      disabled={loading}
                    >
                      <NotificationsIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : activeAlerts.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Parameter</TableCell>
                        <TableCell>Schweregrad</TableCell>
                        <TableCell>Nachricht</TableCell>
                        <TableCell>Zeitstempel</TableCell>
                        <TableCell>Aktionen</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {activeAlerts.map((alert) => (
                        <TableRow key={alert.id}>
                          <TableCell>{alert.parameter}</TableCell>
                          <TableCell>
                            <Chip
                              label={alert.severity}
                              color={alert.severity === 'high' ? 'error' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{alert.message}</TableCell>
                          <TableCell>
                            {new Date(alert.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Alert auflösen">
                              <IconButton
                                size="small"
                                onClick={() => onResolveAlert(alert.id)}
                                disabled={loading}
                              >
                                <CheckIcon />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Alert bearbeiten">
                              <IconButton
                                size="small"
                                onClick={() => setSelectedAlert(alert)}
                                disabled={loading}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">
                  Keine aktiven Alerts
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Alert-Einstellungen Dialog */}
      <Dialog
        open={showSettingsDialog}
        onClose={() => setShowSettingsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Alert-Einstellungen</DialogTitle>
        <DialogContent>
          <form onSubmit={settingsForm.handleSubmit(onConfigureAlerts)}>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Schwellenwerte
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Controller
                  name="notification_threshold.low"
                  control={settingsForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Unterer Schwellenwert"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="notification_threshold.high"
                  control={settingsForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Oberer Schwellenwert"
                      fullWidth
                    />
                  )}
                />
              </Grid>
            </Grid>
            
            <Controller
              name="notification_delay"
              control={settingsForm.control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Benachrichtigungsverzögerung (Sekunden)"
                  fullWidth
                  margin="normal"
                />
              )}
            />
            
            <Controller
              name="auto_resolve"
              control={settingsForm.control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      {...field}
                      checked={field.value}
                    />
                  }
                  label="Automatisch auflösen"
                />
              )}
            />
            
            <Controller
              name="escalation_timeout"
              control={settingsForm.control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Eskalations-Timeout (Minuten)"
                  fullWidth
                  margin="normal"
                />
              )}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowSettingsDialog(false)}
            disabled={loading}
          >
            Abbrechen
          </Button>
          <Button
            onClick={settingsForm.handleSubmit(onConfigureAlerts)}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Speichern'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Subscription Dialog */}
      <Dialog
        open={showSubscriptionDialog}
        onClose={() => setShowSubscriptionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Alert-Benachrichtigungen</DialogTitle>
        <DialogContent>
          <form onSubmit={subscriptionForm.handleSubmit(onSubscribeToAlerts)}>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Benachrichtigungstypen
            </Typography>
            
            <Controller
              name="notification_types"
              control={subscriptionForm.control}
              defaultValue={['low', 'high']}
              render={({ field }) => (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Button
                      variant={field.value.includes('low') ? 'contained' : 'outlined'}
                      onClick={() => {
                        const newValue = field.value.includes('low')
                          ? field.value.filter(t => t !== 'low')
                          : [...field.value, 'low'];
                        field.onChange(newValue);
                      }}
                      fullWidth
                    >
                      Niedrig
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant={field.value.includes('high') ? 'contained' : 'outlined'}
                      onClick={() => {
                        const newValue = field.value.includes('high')
                          ? field.value.filter(t => t !== 'high')
                          : [...field.value, 'high'];
                        field.onChange(newValue);
                      }}
                      fullWidth
                    >
                      Hoch
                    </Button>
                  </Grid>
                </Grid>
              )}
            />
            
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
              Benachrichtigungskanäle
            </Typography>
            
            <Controller
              name="notification_channels"
              control={subscriptionForm.control}
              defaultValue={['email']}
              render={({ field }) => (
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Button
                      variant={field.value.includes('email') ? 'contained' : 'outlined'}
                      onClick={() => {
                        const newValue = field.value.includes('email')
                          ? field.value.filter(c => c !== 'email')
                          : [...field.value, 'email'];
                        field.onChange(newValue);
                      }}
                      fullWidth
                    >
                      E-Mail
                    </Button>
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      variant={field.value.includes('sms') ? 'contained' : 'outlined'}
                      onClick={() => {
                        const newValue = field.value.includes('sms')
                          ? field.value.filter(c => c !== 'sms')
                          : [...field.value, 'sms'];
                        field.onChange(newValue);
                      }}
                      fullWidth
                    >
                      SMS
                    </Button>
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      variant={field.value.includes('push') ? 'contained' : 'outlined'}
                      onClick={() => {
                        const newValue = field.value.includes('push')
                          ? field.value.filter(c => c !== 'push')
                          : [...field.value, 'push'];
                        field.onChange(newValue);
                      }}
                      fullWidth
                    >
                      Push
                    </Button>
                  </Grid>
                </Grid>
              )}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowSubscriptionDialog(false)}
            disabled={loading}
          >
            Abbrechen
          </Button>
          <Button
            onClick={subscriptionForm.handleSubmit(onSubscribeToAlerts)}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Speichern'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Alert Bearbeiten Dialog */}
      <Dialog
        open={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Alert bearbeiten</DialogTitle>
        <DialogContent>
          {selectedAlert && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Parameter
              </Typography>
              <Typography variant="body1" gutterBottom>
                {selectedAlert.parameter}
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Schweregrad
              </Typography>
              <Chip
                label={selectedAlert.severity}
                color={selectedAlert.severity === 'high' ? 'error' : 'warning'}
                size="small"
              />
              
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Nachricht
              </Typography>
              <Typography variant="body1" gutterBottom>
                {selectedAlert.message}
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Erstellt am
              </Typography>
              <Typography variant="body1" gutterBottom>
                {new Date(selectedAlert.created_at).toLocaleString()}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Aktionen
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    if (selectedAlert) {
                      onResolveAlert(selectedAlert.id);
                      setSelectedAlert(null);
                    }
                  }}
                  disabled={loading}
                  startIcon={<CheckIcon />}
                  sx={{ mr: 1 }}
                >
                  Auflösen
                </Button>
                
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setSelectedAlert(null)}
                  disabled={loading}
                  startIcon={<CloseIcon />}
                >
                  Schließen
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AlertManagement; 