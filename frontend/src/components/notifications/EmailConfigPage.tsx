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
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Snackbar,
  TextField,
  Typography,
  Alert
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EmailIcon from '@mui/icons-material/Email';
import SendIcon from '@mui/icons-material/Send';
import SettingsIcon from '@mui/icons-material/Settings';
import notificationApi, { EmailConfig } from '../../services/notificationApi';

const EmailConfigPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    provider: 'smtp',
    smtp: {
      server: '',
      port: 587,
      username: '',
      password: '',
      use_tls: true,
      from_email: '',
      from_name: ''
    },
    sendgrid: {
      api_key: '',
      from_email: '',
      from_name: ''
    },
    mailgun: {
      api_key: '',
      domain: '',
      from_email: '',
      from_name: ''
    }
  });
  
  const [testEmail, setTestEmail] = useState({
    to_email: '',
    subject: 'Test-E-Mail vom ERP-System',
    body: 'Dies ist eine Test-E-Mail vom ERP-System zur Überprüfung der E-Mail-Konfiguration.'
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  useEffect(() => {
    const fetchEmailConfig = async () => {
      setLoading(true);
      try {
        const response = await notificationApi.getEmailConfig();
        setEmailConfig(response.data);
      } catch (error) {
        console.error('Fehler beim Laden der E-Mail-Konfiguration:', error);
        setSnackbar({
          open: true,
          message: 'Fehler beim Laden der E-Mail-Konfiguration',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEmailConfig();
  }, []);

  const handleProviderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmailConfig({
      ...emailConfig,
      provider: (event.target as HTMLInputElement).value
    });
  };

  const handleSmtpChange = (field: string, value: string | number | boolean) => {
    setEmailConfig({
      ...emailConfig,
      smtp: {
        ...emailConfig.smtp!,
        [field]: value
      }
    });
  };

  const handleSendgridChange = (field: string, value: string) => {
    setEmailConfig({
      ...emailConfig,
      sendgrid: {
        ...emailConfig.sendgrid!,
        [field]: value
      }
    });
  };

  const handleMailgunChange = (field: string, value: string) => {
    setEmailConfig({
      ...emailConfig,
      mailgun: {
        ...emailConfig.mailgun!,
        [field]: value
      }
    });
  };

  const handleTestEmailChange = (field: string, value: string) => {
    setTestEmail({
      ...testEmail,
      [field]: value
    });
  };

  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      await notificationApi.updateEmailConfig(emailConfig);
      setSnackbar({
        open: true,
        message: 'E-Mail-Konfiguration erfolgreich gespeichert',
        severity: 'success'
      });
    } catch (error) {
      console.error('Fehler beim Speichern der E-Mail-Konfiguration:', error);
      setSnackbar({
        open: true,
        message: 'Fehler beim Speichern der E-Mail-Konfiguration',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail.to_email) {
      setSnackbar({
        open: true,
        message: 'Bitte geben Sie eine Empfänger-E-Mail-Adresse ein',
        severity: 'warning'
      });
      return;
    }
    
    setTestLoading(true);
    try {
      await notificationApi.testEmailNotification(testEmail);
      setSnackbar({
        open: true,
        message: 'Test-E-Mail wurde erfolgreich gesendet',
        severity: 'success'
      });
    } catch (error: any) {
      console.error('Fehler beim Senden der Test-E-Mail:', error);
      setSnackbar({
        open: true,
        message: `Fehler beim Senden der Test-E-Mail: ${error.response?.data?.detail || error.message}`,
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

  if (loading && !emailConfig) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        <EmailIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        E-Mail-Konfiguration
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
              value={emailConfig.provider}
              onChange={handleProviderChange}
            >
              <FormControlLabel value="smtp" control={<Radio />} label="SMTP" />
              <FormControlLabel value="sendgrid" control={<Radio />} label="SendGrid" />
              <FormControlLabel value="mailgun" control={<Radio />} label="Mailgun" />
            </RadioGroup>
            <FormHelperText>Wählen Sie den E-Mail-Provider aus</FormHelperText>
          </FormControl>
          
          <Divider sx={{ my: 3 }} />
          
          {emailConfig.provider === 'smtp' && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="SMTP-Server"
                  value={emailConfig.smtp?.server || ''}
                  onChange={(e) => handleSmtpChange('server', e.target.value)}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="SMTP-Port"
                  value={emailConfig.smtp?.port || ''}
                  onChange={(e) => handleSmtpChange('port', parseInt(e.target.value) || 0)}
                  variant="outlined"
                  margin="normal"
                  type="number"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Benutzername"
                  value={emailConfig.smtp?.username || ''}
                  onChange={(e) => handleSmtpChange('username', e.target.value)}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Passwort"
                  value={emailConfig.smtp?.password || ''}
                  onChange={(e) => handleSmtpChange('password', e.target.value)}
                  variant="outlined"
                  margin="normal"
                  type="password"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>TLS verwenden</InputLabel>
                  <Select
                    value={emailConfig.smtp?.use_tls ? 'true' : 'false'}
                    onChange={(e) => handleSmtpChange('use_tls', e.target.value === 'true')}
                    label="TLS verwenden"
                  >
                    <MenuItem value="true">Ja</MenuItem>
                    <MenuItem value="false">Nein</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Absender-E-Mail"
                  value={emailConfig.smtp?.from_email || ''}
                  onChange={(e) => handleSmtpChange('from_email', e.target.value)}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Absendername"
                  value={emailConfig.smtp?.from_name || ''}
                  onChange={(e) => handleSmtpChange('from_name', e.target.value)}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
            </Grid>
          )}
          
          {emailConfig.provider === 'sendgrid' && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="API-Schlüssel"
                  value={emailConfig.sendgrid?.api_key || ''}
                  onChange={(e) => handleSendgridChange('api_key', e.target.value)}
                  variant="outlined"
                  margin="normal"
                  type="password"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Absender-E-Mail"
                  value={emailConfig.sendgrid?.from_email || ''}
                  onChange={(e) => handleSendgridChange('from_email', e.target.value)}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Absendername"
                  value={emailConfig.sendgrid?.from_name || ''}
                  onChange={(e) => handleSendgridChange('from_name', e.target.value)}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
            </Grid>
          )}
          
          {emailConfig.provider === 'mailgun' && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="API-Schlüssel"
                  value={emailConfig.mailgun?.api_key || ''}
                  onChange={(e) => handleMailgunChange('api_key', e.target.value)}
                  variant="outlined"
                  margin="normal"
                  type="password"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Domain"
                  value={emailConfig.mailgun?.domain || ''}
                  onChange={(e) => handleMailgunChange('domain', e.target.value)}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Absender-E-Mail"
                  value={emailConfig.mailgun?.from_email || ''}
                  onChange={(e) => handleMailgunChange('from_email', e.target.value)}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Absendername"
                  value={emailConfig.mailgun?.from_name || ''}
                  onChange={(e) => handleMailgunChange('from_name', e.target.value)}
                  variant="outlined"
                  margin="normal"
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
            E-Mail-Konfiguration testen
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Empfänger-E-Mail"
                value={testEmail.to_email}
                onChange={(e) => handleTestEmailChange('to_email', e.target.value)}
                variant="outlined"
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Betreff"
                value={testEmail.subject}
                onChange={(e) => handleTestEmailChange('subject', e.target.value)}
                variant="outlined"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nachricht"
                value={testEmail.body}
                onChange={(e) => handleTestEmailChange('body', e.target.value)}
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
              onClick={handleTestEmail}
              disabled={testLoading}
            >
              {testLoading ? <CircularProgress size={24} /> : 'Test-E-Mail senden'}
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

export default EmailConfigPage; 