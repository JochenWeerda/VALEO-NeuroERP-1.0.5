import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Switch,
  Divider,
  TextField,
  MenuItem,
  Grid,
  Button,
  Alert,
  CircularProgress,
  Select,
  InputLabel,
  FormControl,
  SelectChangeEvent,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EmailIcon from '@mui/icons-material/Email';
import SmsIcon from '@mui/icons-material/Sms';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import ForumIcon from '@mui/icons-material/Forum';

import notificationApi, { 
  NotificationSetting, 
  NotificationType,
  NotificationSettingCreate,
  NotificationSettingUpdate
} from '../../services/notificationApi';
import { useAuth } from '../../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`notification-tabpanel-${index}`}
      aria-labelledby={`notification-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `notification-tab-${index}`,
    'aria-controls': `notification-tabpanel-${index}`,
  };
}

const NotificationSettings: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Standard-Einstellungen für jeden Typ
  const defaultSettings: Record<NotificationType, NotificationSettingUpdate> = {
    [NotificationType.EMAIL]: {
      is_enabled: true,
      for_emergency_creation: true,
      for_emergency_update: true,
      for_emergency_escalation: true,
      for_emergency_resolution: true,
      minimum_severity: 'MEDIUM',
      minimum_escalation_level: 'LEVEL1',
      contact_information: user?.email || ''
    },
    [NotificationType.SMS]: {
      is_enabled: false,
      for_emergency_creation: false,
      for_emergency_update: false,
      for_emergency_escalation: true,
      for_emergency_resolution: false,
      minimum_severity: 'HIGH',
      minimum_escalation_level: 'LEVEL3',
      contact_information: user?.phone || ''
    },
    [NotificationType.PUSH]: {
      is_enabled: true,
      for_emergency_creation: false,
      for_emergency_update: true,
      for_emergency_escalation: true,
      for_emergency_resolution: true,
      minimum_severity: 'MEDIUM',
      minimum_escalation_level: 'LEVEL2',
      contact_information: ''
    },
    [NotificationType.IN_APP]: {
      is_enabled: true,
      for_emergency_creation: true,
      for_emergency_update: true,
      for_emergency_escalation: true,
      for_emergency_resolution: true,
      minimum_severity: 'LOW',
      minimum_escalation_level: 'LEVEL1',
      contact_information: ''
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Helferfunktion zum Abrufen der Einstellungen für einen bestimmten Typ
  const getSettingForType = (type: NotificationType): NotificationSetting | null => {
    return settings.find(s => s.notification_type === type) || null;
  };

  // Laden der Benutzereinstellungen
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const userSettings = await notificationApi.getNotificationSettings(user.id);
        setSettings(userSettings);
      } catch (error) {
        console.error('Fehler beim Laden der Benachrichtigungseinstellungen:', error);
        setError('Fehler beim Laden der Einstellungen. Bitte versuchen Sie es später erneut.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user?.id]);

  // Aktualisieren einer Einstellung
  const updateSetting = async (
    type: NotificationType, 
    data: NotificationSettingUpdate
  ) => {
    if (!user?.id) return;
    
    try {
      setSaving(true);
      setError(null);
      
      const existingSetting = getSettingForType(type);
      
      if (existingSetting) {
        // Aktualisiere die bestehende Einstellung
        const updated = await notificationApi.updateNotificationSetting(
          existingSetting.id, 
          data
        );
        
        setSettings(prev => 
          prev.map(s => s.id === updated.id ? updated : s)
        );
      } else {
        // Erstelle eine neue Einstellung
        const newSetting: NotificationSettingCreate = {
          user_id: user.id,
          notification_type: type,
          ...data
        };
        
        const created = await notificationApi.createNotificationSetting(newSetting);
        setSettings(prev => [...prev, created]);
      }
      
      setSuccess('Einstellungen wurden erfolgreich gespeichert.');
      
      // Erfolgsbenachrichtigung nach 3 Sekunden ausblenden
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Fehler beim Speichern der Einstellungen:', error);
      setError('Fehler beim Speichern der Einstellungen. Bitte versuchen Sie es später erneut.');
    } finally {
      setSaving(false);
    }
  };

  // Handler für die Änderung des Aktivierungsstatus
  const handleEnabledChange = (type: NotificationType, checked: boolean) => {
    const setting = getSettingForType(type);
    const update = { 
      ...setting ? {
        for_emergency_creation: setting.for_emergency_creation,
        for_emergency_update: setting.for_emergency_update,
        for_emergency_escalation: setting.for_emergency_escalation,
        for_emergency_resolution: setting.for_emergency_resolution,
        minimum_severity: setting.minimum_severity,
        minimum_escalation_level: setting.minimum_escalation_level,
        contact_information: setting.contact_information
      } : defaultSettings[type],
      is_enabled: checked
    };
    
    updateSetting(type, update);
  };

  // Handler für die Änderung der Event-Einstellungen
  const handleEventSettingChange = (
    type: NotificationType, 
    field: keyof NotificationSettingUpdate, 
    checked: boolean
  ) => {
    const setting = getSettingForType(type);
    const update = { [field]: checked };
    
    updateSetting(type, update);
  };

  // Handler für die Änderung der Schwellenwerte
  const handleThresholdChange = (
    type: NotificationType, 
    field: 'minimum_severity' | 'minimum_escalation_level', 
    value: string
  ) => {
    const update = { [field]: value };
    updateSetting(type, update);
  };

  // Handler für die Änderung der Kontaktinformationen
  const handleContactInfoChange = (
    type: NotificationType, 
    value: string
  ) => {
    const update = { contact_information: value };
    updateSetting(type, update);
  };

  // Handler für das Senden einer Testbenachrichtigung
  const handleSendTestNotification = async (type: NotificationType) => {
    if (!user?.id) return;
    
    try {
      setSaving(true);
      await notificationApi.sendTestNotification(user.id, type);
      setSuccess(`Test-Benachrichtigung vom Typ ${type} wurde gesendet.`);
      
      // Erfolgsbenachrichtigung nach 3 Sekunden ausblenden
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Fehler beim Senden der Test-Benachrichtigung:', error);
      setError('Fehler beim Senden der Test-Benachrichtigung. Bitte versuchen Sie es später erneut.');
    } finally {
      setSaving(false);
    }
  };

  // Generiere Icon basierend auf dem Benachrichtigungstyp
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.EMAIL:
        return <EmailIcon />;
      case NotificationType.SMS:
        return <SmsIcon />;
      case NotificationType.PUSH:
        return <PhoneAndroidIcon />;
      case NotificationType.IN_APP:
        return <ForumIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  // Benachrichtigungstyp-Karte
  const NotificationTypeCard = ({ type }: { type: NotificationType }) => {
    const setting = getSettingForType(type) || {
      ...defaultSettings[type],
      id: 0,
      user_id: user?.id || 0,
      notification_type: type,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ mr: 2 }}>
              {getNotificationIcon(type)}
            </Box>
            <Typography variant="h6">
              {type}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Switch
              checked={setting.is_enabled}
              onChange={(e) => handleEnabledChange(type, e.target.checked)}
              disabled={saving}
            />
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Ereignisse
          </Typography>
          
          <FormGroup>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={setting.for_emergency_creation}
                      onChange={(e) => handleEventSettingChange(type, 'for_emergency_creation', e.target.checked)}
                      disabled={!setting.is_enabled || saving}
                    />
                  }
                  label="Notfallerstellung"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={setting.for_emergency_update}
                      onChange={(e) => handleEventSettingChange(type, 'for_emergency_update', e.target.checked)}
                      disabled={!setting.is_enabled || saving}
                    />
                  }
                  label="Notfallaktualisierung"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={setting.for_emergency_escalation}
                      onChange={(e) => handleEventSettingChange(type, 'for_emergency_escalation', e.target.checked)}
                      disabled={!setting.is_enabled || saving}
                    />
                  }
                  label="Notfalleskalation"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={setting.for_emergency_resolution}
                      onChange={(e) => handleEventSettingChange(type, 'for_emergency_resolution', e.target.checked)}
                      disabled={!setting.is_enabled || saving}
                    />
                  }
                  label="Notfallauflösung"
                />
              </Grid>
            </Grid>
          </FormGroup>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Schwellenwerte
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel id={`min-severity-label-${type}`}>Minimaler Schweregrad</InputLabel>
                <Select
                  labelId={`min-severity-label-${type}`}
                  value={setting.minimum_severity}
                  label="Minimaler Schweregrad"
                  onChange={(e) => handleThresholdChange(type, 'minimum_severity', e.target.value)}
                  disabled={!setting.is_enabled || saving}
                >
                  <MenuItem value="LOW">Niedrig</MenuItem>
                  <MenuItem value="MEDIUM">Mittel</MenuItem>
                  <MenuItem value="HIGH">Hoch</MenuItem>
                  <MenuItem value="CRITICAL">Kritisch</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel id={`min-escalation-label-${type}`}>Minimale Eskalationsstufe</InputLabel>
                <Select
                  labelId={`min-escalation-label-${type}`}
                  value={setting.minimum_escalation_level}
                  label="Minimale Eskalationsstufe"
                  onChange={(e) => handleThresholdChange(type, 'minimum_escalation_level', e.target.value)}
                  disabled={!setting.is_enabled || saving}
                >
                  <MenuItem value="LEVEL1">Stufe 1</MenuItem>
                  <MenuItem value="LEVEL2">Stufe 2</MenuItem>
                  <MenuItem value="LEVEL3">Stufe 3</MenuItem>
                  <MenuItem value="LEVEL4">Stufe 4</MenuItem>
                  <MenuItem value="LEVEL5">Stufe 5</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          {(type === NotificationType.EMAIL || type === NotificationType.SMS) && (
            <>
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Kontaktinformationen
              </Typography>
              
              <TextField
                fullWidth
                margin="normal"
                label={type === NotificationType.EMAIL ? "E-Mail-Adresse" : "Telefonnummer"}
                value={setting.contact_information || ''}
                onChange={(e) => handleContactInfoChange(type, e.target.value)}
                disabled={!setting.is_enabled || saving}
                size="small"
                placeholder={type === NotificationType.EMAIL 
                  ? "beispiel@domain.de" 
                  : "+49 123 45678900"}
              />
            </>
          )}
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              onClick={() => handleSendTestNotification(type)}
              disabled={!setting.is_enabled || saving}
            >
              {saving ? <CircularProgress size={24} /> : "Test-Benachrichtigung senden"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Benachrichtigungseinstellungen
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      <Paper sx={{ width: '100%', mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="notification settings tabs"
          variant="fullWidth"
        >
          <Tab label="E-Mail" icon={<EmailIcon />} iconPosition="start" {...a11yProps(0)} />
          <Tab label="SMS" icon={<SmsIcon />} iconPosition="start" {...a11yProps(1)} />
          <Tab label="Push" icon={<PhoneAndroidIcon />} iconPosition="start" {...a11yProps(2)} />
          <Tab label="In-App" icon={<ForumIcon />} iconPosition="start" {...a11yProps(3)} />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <NotificationTypeCard type={NotificationType.EMAIL} />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <NotificationTypeCard type={NotificationType.SMS} />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <NotificationTypeCard type={NotificationType.PUSH} />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <NotificationTypeCard type={NotificationType.IN_APP} />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default NotificationSettings; 