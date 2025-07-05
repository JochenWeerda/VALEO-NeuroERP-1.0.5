import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  Radio,
  RadioGroup,
  Snackbar,
  TextField,
  Typography,
  Alert
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SmsIcon from '@mui/icons-material/Sms';
import SendIcon from '@mui/icons-material/Send';
import SettingsIcon from '@mui/icons-material/Settings';
import notificationApi, { SMSConfig } from '../../services/notificationApi';

const SMSConfigPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [smsConfig, setSmsConfig] = useState<SMSConfig>({
    provider: 'twilio',
    twilio: {
      account_sid: '',
      auth_token: '',
      from_number: ''
    },
    vonage: {
      api_key: '',
      api_secret: '',
      from_number: ''
    },
    messagebird: {
      api_key: '',
      from_number: ''
    }
  });
  
  const [testSMS, setTestSMS] = useState({
    to_number: '',
    message: 'Dies ist eine Test-SMS vom ERP-System zur Überprüfung der SMS-Konfiguration.',
    country_code: 'DE'
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  useEffect(() => {
    const fetchSMSConfig = async () => {
      setLoading(true);
      try {
        const response = await notificationApi.getSMSConfig();
        setSmsConfig(response.data);
      } catch (error) {
        console.error('Fehler beim Laden der SMS-Konfiguration:', error);
        setSnackbar({
          open: true,
          message: 'Fehler beim Laden der SMS-Konfiguration',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSMSConfig();
  }, []);

  const handleProviderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSmsConfig({
      ...smsConfig,
      provider: (event.target as HTMLInputElement).value
    });
  };

  const handleTwilioChange = (field: string, value: string) => {
    setSmsConfig({
      ...smsConfig,
      twilio: {
        ...smsConfig.twilio!,
        [field]: value
      }
    });
  };

  const handleVonageChange = (field: string, value: string) => {
    setSmsConfig({
      ...smsConfig,
      vonage: {
        ...smsConfig.vonage!,
        [field]: value
      }
    });
  };

  const handleMessageBirdChange = (field: string, value: string) => {
    setSmsConfig({
      ...smsConfig,
      messagebird: {
        ...smsConfig.messagebird!,
        [field]: value
      }
    });
  };

  const handleTestSMSChange = (field: string, value: string) => {
    setTestSMS({
      ...testSMS,
      [field]: value
    });
  };

  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      await notificationApi.updateSMSConfig(smsConfig);
      setSnackbar({
        open: true,
        message: 'SMS-Konfiguration erfolgreich gespeichert',
        severity: 'success'
      });
    } catch (error) {
      console.error('Fehler beim Speichern der SMS-Konfiguration:', error);
      setSnackbar({
        open: true,
        message: 'Fehler beim Speichern der SMS-Konfiguration',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestSMS = async () => {
    if (!testSMS.to_number) {
      setSnackbar({
        open: true,
        message: 'Bitte geben Sie eine Empfänger-Telefonnummer ein',
        severity: 'warning'
      });
      return;
    }
    
    setTestLoading(true);
    try {
      await notificationApi.testSMSNotification(testSMS);
      setSnackbar({
        open: true,
        message: 'Test-SMS wurde erfolgreich gesendet',
        severity: 'success'
      });
    } catch (error: any) {
      console.error('Fehler beim Senden der Test-SMS:', error);
      setSnackbar({
        open: true,
        message: `Fehler beim Senden der Test-SMS: ${error.response?.data?.detail || error.message}`,
        severity: 'error'
      });
    } finally {
      setTestLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  if (loading && !smsConfig) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        <SmsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        SMS-Konfiguration
      </Typography>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Allgemeine Einstellungen
          </Typography>
          
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <RadioGroup
              row
              name="provider"
              value={smsConfig.provider}
              onChange={handleProviderChange}
            >
              <FormControlLabel value="twilio" control={<Radio />} label="Twilio" />
              <FormControlLabel value="vonage" control={<Radio />} label="Vonage (Nexmo)" />
              <FormControlLabel value="messagebird" control={<Radio />} label="MessageBird" />
            </RadioGroup>
            <FormHelperText>Wählen Sie den SMS-Provider aus</FormHelperText>
          </FormControl>
          
          <Divider sx={{ my: 3 }} />
          
          {smsConfig.provider === 'twilio' && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Account SID"
                  value={smsConfig.twilio?.account_sid || ''}
                  onChange={(e) => handleTwilioChange('account_sid', e.target.value)}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Auth Token"
                  value={smsConfig.twilio?.auth_token || ''}
                  onChange={(e) => handleTwilioChange('auth_token', e.target.value)}
                  variant="outlined"
                  margin="normal"
                  type="password"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Absender-Nummer"
                  value={smsConfig.twilio?.from_number || ''}
                  onChange={(e) => handleTwilioChange('from_number', e.target.value)}
                  variant="outlined"
                  margin="normal"
                  helperText="Im internationalen Format, z.B. +491234567890"
                />
              </Grid>
            </Grid>
          )}
          
          {smsConfig.provider === 'vonage' && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="API-Schlüssel"
                  value={smsConfig.vonage?.api_key || ''}
                  onChange={(e) => handleVonageChange('api_key', e.target.value)}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="API-Secret"
                  value={smsConfig.vonage?.api_secret || ''}
                  onChange={(e) => handleVonageChange('api_secret', e.target.value)}
                  variant="outlined"
                  margin="normal"
                  type="password"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Absender-Nummer oder Name"
                  value={smsConfig.vonage?.from_number || ''}
                  onChange={(e) => handleVonageChange('from_number', e.target.value)}
                  variant="outlined"
                  margin="normal"
                  helperText="Telefonnummer oder alphanumerischer Absendername (je nach Land-Unterstützung)"
                />
              </Grid>
            </Grid>
          )}
          
          {smsConfig.provider === 'messagebird' && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="API-Schlüssel"
                  value={smsConfig.messagebird?.api_key || ''}
                  onChange={(e) => handleMessageBirdChange('api_key', e.target.value)}
                  variant="outlined"
                  margin="normal"
                  type="password"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Absender-Nummer oder Name"
                  value={smsConfig.messagebird?.from_number || ''}
                  onChange={(e) => handleMessageBirdChange('from_number', e.target.value)}
                  variant="outlined"
                  margin="normal"
                  helperText="Telefonnummer oder alphanumerischer Absendername (je nach Land-Unterstützung)"
                />
              </Grid>
            </Grid>
          )}
          
          <Box sx={{ mt: 3, textAlign: 'right' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSaveConfig}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Konfiguration speichern'}
            </Button>
          </Box>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <SendIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            SMS-Konfiguration testen
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Ländercode"
                value={testSMS.country_code}
                onChange={(e) => handleTestSMSChange('country_code', e.target.value)}
                variant="outlined"
                margin="normal"
                helperText="z.B. DE für Deutschland"
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Empfänger-Telefonnummer"
                value={testSMS.to_number}
                onChange={(e) => handleTestSMSChange('to_number', e.target.value)}
                variant="outlined"
                margin="normal"
                required
                helperText="Telefonnummer mit oder ohne Ländervorwahl"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nachricht"
                value={testSMS.message}
                onChange={(e) => handleTestSMSChange('message', e.target.value)}
                variant="outlined"
                margin="normal"
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, textAlign: 'right' }}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<SendIcon />}
              onClick={handleTestSMS}
              disabled={testLoading}
            >
              {testLoading ? <CircularProgress size={24} /> : 'Test-SMS senden'}
            </Button>
          </Box>
        </CardContent>
      </Card>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SMSConfigPage;