import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  TextField,
  Button,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  IconButton,
  Chip,
  ListItemText,
  Checkbox,
  OutlinedInput
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Help as HelpIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  Tune as TuneIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Smartphone as SmartphoneIcon,
  NotificationsActive as NotificationsActiveIcon
} from '@mui/icons-material';
import anomalyApi, { NotificationSettings } from '../../services/anomalyApi';

interface AnomalySettingsProps {
  selectedModule: string;
}

const AnomalySettings: React.FC<AnomalySettingsProps> = ({ selectedModule }) => {
  // State für die Einstellungen
  const [settings, setSettings] = useState<Record<string, any>>({
    detection_threshold: 0.8,
    notification_enabled: true,
    notification_channel: 'email',
    notification_recipients: '',
    auto_resolve: false,
    max_anomalies_per_day: 100,
    ignore_minor_anomalies: true,
    min_data_points: 50,
    confidence_level: 0.95,
    batch_detection_interval: 3600
  });
  
  // State für Benachrichtigungseinstellungen
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: true,
    push: false,
    sms: false,
    inApp: true,
    severity_threshold: 0.7,
    modules: ['all']
  });
  
  // State für den Ladestatus und Fehler
  const [loading, setLoading] = useState<boolean>(true);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);
  const [notificationLoading, setNotificationLoading] = useState<boolean>(false);
  
  // Verfügbare Module für Benachrichtigungen
  const availableModules = [
    { value: 'all', label: 'Alle Module' },
    { value: 'inventory', label: 'Lagerbestand' },
    { value: 'finance', label: 'Finanzen' },
    { value: 'production', label: 'Produktion' },
    { value: 'supply_chain', label: 'Lieferkette' },
    { value: 'quality', label: 'Qualitätssicherung' }
  ];
  
  // Laden der Einstellungen beim ersten Rendern
  useEffect(() => {
    fetchSettings();
    fetchNotificationSettings();
  }, [selectedModule]);

  // Laden der Einstellungen aus der API
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const moduleParam = selectedModule === 'all' ? 'inventory' : selectedModule;
      const data = await anomalyApi.getModuleConfig(moduleParam);
      
      if (data) {
        setSettings(data);
      }
      
      setError(null);
    } catch (err) {
      console.error('Fehler beim Laden der Einstellungen:', err);
      setError('Die Einstellungen konnten nicht geladen werden. Standard-Einstellungen werden verwendet.');
    } finally {
      setLoading(false);
    }
  };

  // Laden der Benachrichtigungseinstellungen
  const fetchNotificationSettings = async () => {
    try {
      const data = await anomalyApi.getNotificationSettings();
      setNotificationSettings(data);
    } catch (err) {
      console.error('Fehler beim Laden der Benachrichtigungseinstellungen:', err);
      // Standard-Einstellungen beibehalten
    }
  };

  // Handler für Änderungen an den Einstellungen
  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Bei erfolgreicher Änderung Erfolgsmeldung zurücksetzen
    setSaveSuccess(null);
  };

  // Handler für Änderungen an den Benachrichtigungseinstellungen
  const handleNotificationSettingChange = (key: string, value: any) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Bei erfolgreicher Änderung Erfolgsmeldung zurücksetzen
    setSaveSuccess(null);
  };

  // Handler für Änderungen an den ausgewählten Modulen
  const handleModuleSelectionChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedModules = event.target.value as string[];
    setNotificationSettings(prev => ({
      ...prev,
      modules: selectedModules
    }));
  };

  // Handler für das Speichern der Einstellungen
  const handleSaveSettings = async () => {
    setSaveLoading(true);
    setSaveSuccess(null);
    
    try {
      // Erst Moduleinstellungen speichern
      const moduleParam = selectedModule === 'all' ? 'inventory' : selectedModule;
      await anomalyApi.setModuleConfig(moduleParam, settings);
      
      // Dann Benachrichtigungseinstellungen speichern
      await anomalyApi.updateNotificationSettings(notificationSettings);
      
      setSaveSuccess(true);
    } catch (err) {
      console.error('Fehler beim Speichern der Einstellungen:', err);
      setError('Die Einstellungen konnten nicht gespeichert werden. Bitte versuchen Sie es später erneut.');
      setSaveSuccess(false);
    } finally {
      setSaveLoading(false);
    }
  };

  // Handler für das Testen von Benachrichtigungen
  const handleTestNotification = async () => {
    setNotificationLoading(true);
    try {
      // In einer realen Implementierung würde hier ein API-Aufruf stehen
      // Da wir keine echte API haben, simulieren wir eine Verzögerung
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Testbenachrichtigung wurde gesendet!');
    } catch (err) {
      console.error('Fehler beim Senden der Testbenachrichtigung:', err);
    } finally {
      setNotificationLoading(false);
    }
  };

  const renderSettingHelp = (text: string) => (
    <Tooltip title={text}>
      <IconButton size="small">
        <HelpIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Einstellungen der Anomalieerkennung
        </Typography>
        
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={fetchSettings}
            sx={{ mr: 1 }}
            disabled={loading}
          >
            Zurücksetzen
          </Button>
          
          <Button 
            variant="contained" 
            startIcon={saveLoading ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={handleSaveSettings}
            disabled={loading || saveLoading}
          >
            Speichern
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Die Einstellungen wurden erfolgreich gespeichert.
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Erkennungseinstellungen */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TuneIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Erkennungseinstellungen
                  </Typography>
                </Box>
                
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography id="detection-threshold-slider" gutterBottom>
                        Erkennungsschwellenwert
                      </Typography>
                      {renderSettingHelp('Legt fest, ab welchem Score ein Datenpunkt als Anomalie erkannt wird. Höhere Werte führen zu weniger Erkennungen.')}
                    </Box>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs>
                        <Slider
                          value={settings.detection_threshold}
                          onChange={(_, value) => handleSettingChange('detection_threshold', value)}
                          aria-labelledby="detection-threshold-slider"
                          step={0.05}
                          marks
                          min={0.1}
                          max={0.95}
                          valueLabelDisplay="auto"
                        />
                      </Grid>
                      <Grid item>
                        <Typography>
                          {settings.detection_threshold}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography gutterBottom>
                        Minimale Datenpunkte
                      </Typography>
                      {renderSettingHelp('Minimale Anzahl an Datenpunkten, die benötigt werden, um Anomalien zu erkennen.')}
                    </Box>
                    <TextField
                      type="number"
                      value={settings.min_data_points}
                      onChange={(e) => handleSettingChange('min_data_points', parseInt(e.target.value))}
                      fullWidth
                      variant="outlined"
                      size="small"
                      disabled={loading}
                      inputProps={{
                        min: 10,
                        max: 1000
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography gutterBottom>
                        Konfidenzintervall
                      </Typography>
                      {renderSettingHelp('Statistisches Konfidenzintervall für die Anomalieerkennung (0.0 - 1.0).')}
                    </Box>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs>
                        <Slider
                          value={settings.confidence_level}
                          onChange={(_, value) => handleSettingChange('confidence_level', value)}
                          step={0.01}
                          marks={[
                            { value: 0.9, label: '0.9' },
                            { value: 0.95, label: '0.95' },
                            { value: 0.99, label: '0.99' }
                          ]}
                          min={0.9}
                          max={0.99}
                          disabled={loading}
                        />
                      </Grid>
                      <Grid item>
                        <Typography>
                          {settings.confidence_level.toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography gutterBottom>
                        Maximale Anomalien pro Tag
                      </Typography>
                      {renderSettingHelp('Begrenzt die Anzahl der gemeldeten Anomalien pro Tag, um Überlastung zu vermeiden.')}
                    </Box>
                    <TextField
                      type="number"
                      value={settings.max_anomalies_per_day}
                      onChange={(e) => handleSettingChange('max_anomalies_per_day', parseInt(e.target.value))}
                      fullWidth
                      variant="outlined"
                      size="small"
                      disabled={loading}
                      inputProps={{
                        min: 1,
                        max: 1000
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography gutterBottom>
                        Batch-Erkennungsintervall (Sekunden)
                      </Typography>
                      {renderSettingHelp('Zeitintervall in Sekunden für die automatische Batch-Erkennung von Anomalien.')}
                    </Box>
                    <TextField
                      type="number"
                      value={settings.batch_detection_interval}
                      onChange={(e) => handleSettingChange('batch_detection_interval', parseInt(e.target.value))}
                      fullWidth
                      variant="outlined"
                      size="small"
                      disabled={loading}
                      inputProps={{
                        min: 60,
                        max: 86400
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.ignore_minor_anomalies}
                          onChange={(e) => handleSettingChange('ignore_minor_anomalies', e.target.checked)}
                          disabled={loading}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography>Geringfügige Anomalien ignorieren</Typography>
                          {renderSettingHelp('Wenn aktiviert, werden Anomalien mit geringem Score nicht gemeldet.')}
                        </Box>
                      }
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Benachrichtigungseinstellungen */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <NotificationsIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Benachrichtigungseinstellungen
                  </Typography>
                </Box>
                
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  {/* Benachrichtigungskanäle */}
                  <Grid item xs={12}>
                    <Typography gutterBottom variant="subtitle2">
                      Benachrichtigungskanäle
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={notificationSettings.email}
                            onChange={(e) => handleNotificationSettingChange('email', e.target.checked)}
                            icon={<EmailIcon />}
                            checkedIcon={<EmailIcon color="primary" />}
                          />
                        }
                        label="E-Mail"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={notificationSettings.push}
                            onChange={(e) => handleNotificationSettingChange('push', e.target.checked)}
                            icon={<SmartphoneIcon />}
                            checkedIcon={<SmartphoneIcon color="primary" />}
                          />
                        }
                        label="Push"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={notificationSettings.sms}
                            onChange={(e) => handleNotificationSettingChange('sms', e.target.checked)}
                            icon={<SmsIcon />}
                            checkedIcon={<SmsIcon color="primary" />}
                          />
                        }
                        label="SMS"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={notificationSettings.inApp}
                            onChange={(e) => handleNotificationSettingChange('inApp', e.target.checked)}
                            icon={<NotificationsActiveIcon />}
                            checkedIcon={<NotificationsActiveIcon color="primary" />}
                          />
                        }
                        label="In-App"
                      />
                    </Box>
                  </Grid>
                  
                  {/* Schwellenwert für Benachrichtigungen */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography id="notification-threshold-slider" gutterBottom>
                        Schwellenwert für Benachrichtigungen
                      </Typography>
                      {renderSettingHelp('Legt fest, ab welchem Schweregrad Anomalien Benachrichtigungen auslösen. Höhere Werte führen zu weniger Benachrichtigungen.')}
                    </Box>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs>
                        <Slider
                          value={notificationSettings.severity_threshold}
                          onChange={(_, value) => handleNotificationSettingChange('severity_threshold', value)}
                          aria-labelledby="notification-threshold-slider"
                          step={0.05}
                          marks
                          min={0.1}
                          max={0.95}
                          valueLabelDisplay="auto"
                        />
                      </Grid>
                      <Grid item>
                        <Typography>
                          {notificationSettings.severity_threshold}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  
                  {/* Module für Benachrichtigungen */}
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel id="notification-modules-label">Module für Benachrichtigungen</InputLabel>
                      <Select
                        labelId="notification-modules-label"
                        id="notification-modules"
                        multiple
                        value={notificationSettings.modules}
                        onChange={handleModuleSelectionChange}
                        input={<OutlinedInput label="Module für Benachrichtigungen" />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(selected as string[]).map((value) => {
                              const module = availableModules.find(m => m.value === value);
                              return (
                                <Chip 
                                  key={value} 
                                  label={module ? module.label : value} 
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              );
                            })}
                          </Box>
                        )}
                      >
                        {availableModules.map((module) => (
                          <MenuItem key={module.value} value={module.value}>
                            <Checkbox checked={notificationSettings.modules.indexOf(module.value) > -1} />
                            <ListItemText primary={module.label} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {/* Testbenachrichtigung */}
                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={notificationLoading ? <CircularProgress size={20} /> : <NotificationsActiveIcon />}
                      onClick={handleTestNotification}
                      disabled={notificationLoading}
                      fullWidth
                    >
                      Testbenachrichtigung senden
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            {/* Info-Karte */}
            <Card variant="outlined" sx={{ mt: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <InfoIcon sx={{ mr: 1, color: 'info.main' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Die Einstellungen gelten für das ausgewählte Modul {selectedModule === 'all' ? '(Standardmäßig wird "Lagerbestand" verwendet)' : `"${selectedModule}"`}. 
                      Änderungen wirken sich auf alle neuen Erkennungsvorgänge aus. 
                      Bereits trainierte Modelle werden nicht automatisch mit den neuen Einstellungen aktualisiert.
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AnomalySettings; 