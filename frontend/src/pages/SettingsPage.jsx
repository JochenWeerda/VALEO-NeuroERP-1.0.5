import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container, 
  Grid, 
  Card, 
  CardHeader, 
  CardContent, 
  Divider, 
  ToggleButtonGroup, 
  ToggleButton, 
  Button, 
  Snackbar, 
  Alert,
  Stack,
  IconButton,
  useTheme as useMuiTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  Tooltip
} from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import PaletteIcon from '@mui/icons-material/Palette';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../themes/ThemeProvider';
import IconSet from '../components/IconSet';

// Theme-Namen auf Deutsch anzeigen
const themeNames = {
  odoo: 'Odoo (Standard)',
  modern: 'Modern',
  standard: 'Standard Material',
  kontrast: 'Kontrastreich',
};

// Theme-Beschreibungen
const themeDescriptions = {
  odoo: 'Das klassische Odoo-Farbschema mit Lila und Orange.',
  modern: 'Ein modernes Design mit Blau und Pink, abgerundeten Ecken.',
  standard: 'Das Standard Material-UI Design mit Blau und Rot.',
  kontrast: 'Ein kontrastarmes Theme für bessere Lesbarkeit mit hohem Kontrast.',
};

// Theme-Vorschau-Farben (Primary, Secondary)
const themePreviewColors = {
  odoo: { light: ['#7C7BAD', '#F0AD4E'], dark: ['#9D9BC5', '#F8C885'] },
  modern: { light: ['#2196F3', '#FF4081'], dark: ['#64B5F6', '#FF80AB'] },
  standard: { light: ['#1976d2', '#dc004e'], dark: ['#42a5f5', '#ff4081'] },
  kontrast: { light: ['#000000', '#FFD700'], dark: ['#ffffff', '#FFD700'] },
};

/**
 * Einstellungsseite für Thema, Modus und weitere Systemeinstellungen
 */
const SettingsPage = () => {
  const muiTheme = useMuiTheme();
  const navigate = useNavigate();
  const { mode, toggleTheme, themeType, changeThemeType, availableThemes } = useTheme();
  
  // Lokaler State für die Formularwerte
  const [formValues, setFormValues] = useState({
    mode: mode || 'light',
    themeType: themeType || 'odoo',
  });
  
  // Benachrichtigungsstatus
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Handler für Theme-Modus-Änderung
  const handleModeChange = (event, newMode) => {
    if (newMode && newMode !== mode) {
      setFormValues(prev => ({ ...prev, mode: newMode }));
      toggleTheme();
    }
  };
  
  // Handler für Theme-Typ-Änderung
  const handleThemeTypeChange = (event) => {
    const newThemeType = event.target.value;
    setFormValues(prev => ({ ...prev, themeType: newThemeType }));
    changeThemeType(newThemeType);
  };
  
  // Einstellungen speichern
  const saveSettings = () => {
    // Benachrichtigung anzeigen
    setNotification({
      open: true,
      message: 'Einstellungen wurden erfolgreich gespeichert',
      severity: 'success'
    });
  };
  
  // Auf Standardwerte zurücksetzen
  const resetToDefaults = () => {
    setFormValues({
      mode: 'light',
      themeType: 'odoo',
    });
    
    if (mode !== 'light') {
      toggleTheme();
    }
    
    if (themeType !== 'odoo') {
      changeThemeType('odoo');
    }
    
    // Benachrichtigung anzeigen
    setNotification({
      open: true,
      message: 'Einstellungen wurden auf Standardwerte zurückgesetzt',
      severity: 'info'
    });
  };
  
  // Benachrichtigung schließen
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };
  
  // Einstellungen beim Laden aktualisieren
  useEffect(() => {
    setFormValues(prev => ({ 
      ...prev, 
      mode,
      themeType,
    }));
  }, [mode, themeType]);
  
  // Zurück zur App-Seite navigieren
  const handleBackClick = () => {
    navigate('/apps');
  };
  
  return (
    <Container maxWidth={false} sx={{ p: 3, width: '100%' }}>
      <Paper sx={{ p: 3, mb: 4, display: 'flex', alignItems: 'center' }}>
        <IconButton 
          onClick={handleBackClick} 
          color="primary" 
          sx={{ mr: 2 }}
          aria-label="Zurück zur App-Übersicht"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          <IconSet icon="settings" sx={{ mr: 1, verticalAlign: 'middle' }} />
          System-Einstellungen
        </Typography>
      </Paper>
      
      <Grid container spacing={3}>
        {/* Erscheinungsbild */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardHeader 
              title="Erscheinungsbild" 
              avatar={<ColorLensIcon color="primary" />}
              sx={{ bgcolor: muiTheme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}
            />
            <Divider />
            <CardContent>
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" gutterBottom>Thema-Modus</Typography>
                <ToggleButtonGroup
                  value={formValues.mode}
                  exclusive
                  onChange={handleModeChange}
                  aria-label="Thema-Modus"
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  <ToggleButton value="light" aria-label="Hell">
                    <LightModeIcon sx={{ mr: 1 }} />
                    Hell
                  </ToggleButton>
                  <ToggleButton value="dark" aria-label="Dunkel">
                    <DarkModeIcon sx={{ mr: 1 }} />
                    Dunkel
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Thema-Stil</Typography>
                <RadioGroup
                  value={formValues.themeType}
                  onChange={handleThemeTypeChange}
                  name="theme-type-group"
                >
                  {availableThemes.map((theme) => (
                    <Paper 
                      key={theme}
                      elevation={formValues.themeType === theme ? 3 : 1}
                      sx={{ 
                        mb: 2, 
                        p: 2, 
                        borderRadius: 1,
                        border: formValues.themeType === theme ? 
                          `2px solid ${muiTheme.palette.primary.main}` : 
                          '2px solid transparent',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: muiTheme.palette.mode === 'dark' ? 
                            'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                        }
                      }}
                      onClick={() => handleThemeTypeChange({ target: { value: theme } })}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Radio 
                          value={theme} 
                          checked={formValues.themeType === theme}
                          sx={{ mr: 1 }}
                        />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1">{themeNames[theme] || theme}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {themeDescriptions[theme] || ''}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Tooltip title="Primärfarbe" arrow>
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                bgcolor: themePreviewColors[theme]?.[formValues.mode]?.[0] || '#888',
                                border: '1px solid rgba(0,0,0,0.1)',
                              }}
                            />
                          </Tooltip>
                          <Tooltip title="Sekundärfarbe" arrow>
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                bgcolor: themePreviewColors[theme]?.[formValues.mode]?.[1] || '#888',
                                border: '1px solid rgba(0,0,0,0.1)',
                              }}
                            />
                          </Tooltip>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </RadioGroup>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Aktionen */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button 
              variant="outlined" 
              startIcon={<RestoreIcon />}
              onClick={resetToDefaults}
            >
              Auf Standardwerte zurücksetzen
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<SaveIcon />}
              onClick={saveSettings}
            >
              Einstellungen speichern
            </Button>
          </Paper>
        </Grid>
      </Grid>
      
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SettingsPage; 