import React, { useState } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Button, 
  Divider, 
  TextField, 
  Card, 
  CardContent, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  IconButton,
  Alert,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Chip
} from '@mui/material';
import { useThemeContext } from '../themes/ThemeProvider';
import { ThemeMode, ThemeVariant } from '../themes/themeTypes';
import { processNaturalLanguageCommand } from '../themes/llmInterface';

/**
 * ThemeDemo Komponente
 * Diese Seite demonstriert die verschiedenen Theme-Funktionen und -Varianten
 */
const ThemeDemo: React.FC = () => {
  const { 
    currentThemeConfig, 
    setThemeMode, 
    setThemeVariant, 
    updateThemeParameters, 
    resetTheme 
  } = useThemeContext();
  
  const [tabValue, setTabValue] = useState(0);
  const [nlCommand, setNlCommand] = useState('');
  const [commandResponse, setCommandResponse] = useState<string | null>(null);
  
  // Tabs ändern
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Theme-Modus ändern
  const handleModeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
  };
  
  // Theme-Variante ändern
  const handleVariantChange = (variant: ThemeVariant) => {
    setThemeVariant(variant);
  };
  
  // Parameter ändern
  const handleParameterChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    updateThemeParameters({ [name]: value });
  };
  
  // Natürlichsprachlichen Befehl verarbeiten
  const handleNLCommand = () => {
    if (!nlCommand.trim()) return;
    
    const response = processNaturalLanguageCommand(nlCommand);
    setCommandResponse(response);
    setNlCommand('');
    
    // Nach 5 Sekunden die Antwort ausblenden
    setTimeout(() => {
      setCommandResponse(null);
    }, 5000);
  };
  
  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Theme Demo
      </Typography>
      
      <Typography variant="body1" paragraph>
        Diese Demo zeigt die verschiedenen Theme-Funktionen und -Varianten des AI-gesteuerten ERP-Systems.
        Sie können zwischen verschiedenen Modi und Varianten wechseln oder natürlichsprachliche Befehle verwenden.
      </Typography>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Aktuelle Theme-Konfiguration
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2">Modus</Typography>
                <Typography variant="body1">{currentThemeConfig.mode}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2">Variante</Typography>
                <Typography variant="body1">{currentThemeConfig.variant}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2">Parameter</Typography>
                <Typography variant="body1">
                  Schriftgröße: {currentThemeConfig.parameters.fontSize || 'medium'}{', '}
                  Abstände: {currentThemeConfig.parameters.spacing || 'normal'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Modi" />
          <Tab label="Varianten" />
          <Tab label="Parameter" />
          <Tab label="KI-Befehle" />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {/* Modi-Tab */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    bgcolor: currentThemeConfig.mode === 'light' ? 'primary.light' : 'background.paper',
                    transition: 'all 0.3s'
                  }}
                  onClick={() => handleModeChange('light')}
                >
                  <CardContent>
                    <Typography variant="h6">Hell</Typography>
                    <Typography variant="body2">
                      Heller Modus mit neutralen Farben, ideal für die tägliche Nutzung.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    bgcolor: currentThemeConfig.mode === 'dark' ? 'primary.light' : 'background.paper',
                    transition: 'all 0.3s'
                  }}
                  onClick={() => handleModeChange('dark')}
                >
                  <CardContent>
                    <Typography variant="h6">Dunkel</Typography>
                    <Typography variant="body2">
                      Dunkler Modus, der die Augen schont und Energie spart.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    bgcolor: currentThemeConfig.mode === 'highContrast' ? 'primary.light' : 'background.paper',
                    transition: 'all 0.3s'
                  }}
                  onClick={() => handleModeChange('highContrast')}
                >
                  <CardContent>
                    <Typography variant="h6">Hoher Kontrast</Typography>
                    <Typography variant="body2">
                      Modus mit hohem Kontrast für verbesserte Barrierefreiheit.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          
          {/* Varianten-Tab */}
          {tabValue === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    bgcolor: currentThemeConfig.variant === 'default' ? 'primary.light' : 'background.paper',
                    transition: 'all 0.3s'
                  }}
                  onClick={() => handleVariantChange('default')}
                >
                  <CardContent>
                    <Typography variant="h6">Default</Typography>
                    <Typography variant="body2">
                      Standard-Variante mit modernem und funktionalem Design.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    bgcolor: currentThemeConfig.variant === 'odoo' ? 'primary.light' : 'background.paper',
                    transition: 'all 0.3s'
                  }}
                  onClick={() => handleVariantChange('odoo')}
                >
                  <CardContent>
                    <Typography variant="h6">Odoo</Typography>
                    <Typography variant="body2">
                      An Odoo angelehnte Variante für Benutzer, die damit vertraut sind.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    bgcolor: currentThemeConfig.variant === 'modern' ? 'primary.light' : 'background.paper',
                    transition: 'all 0.3s'
                  }}
                  onClick={() => handleVariantChange('modern')}
                >
                  <CardContent>
                    <Typography variant="h6">Modern</Typography>
                    <Typography variant="body2">
                      Modernes Design mit flachen Elementen und klaren Linien.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    bgcolor: currentThemeConfig.variant === 'classic' ? 'primary.light' : 'background.paper',
                    transition: 'all 0.3s'
                  }}
                  onClick={() => handleVariantChange('classic')}
                >
                  <CardContent>
                    <Typography variant="h6">Classic</Typography>
                    <Typography variant="body2">
                      Klassisches Design mit stärkeren Schatten und traditionelleren Komponenten.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          
          {/* Parameter-Tab */}
          {tabValue === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="fontSize-label">Schriftgröße</InputLabel>
                  <Select
                    labelId="fontSize-label"
                    name="fontSize"
                    value={currentThemeConfig.parameters.fontSize || 'medium'}
                    label="Schriftgröße"
                    onChange={handleParameterChange}
                  >
                    <MenuItem value="small">Klein</MenuItem>
                    <MenuItem value="medium">Mittel</MenuItem>
                    <MenuItem value="large">Groß</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="spacing-label">Abstände</InputLabel>
                  <Select
                    labelId="spacing-label"
                    name="spacing"
                    value={currentThemeConfig.parameters.spacing || 'normal'}
                    label="Abstände"
                    onChange={handleParameterChange}
                  >
                    <MenuItem value="compact">Kompakt</MenuItem>
                    <MenuItem value="normal">Normal</MenuItem>
                    <MenuItem value="comfortable">Komfortabel</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="borderRadius-label">Eckenradius</InputLabel>
                  <Select
                    labelId="borderRadius-label"
                    name="borderRadius"
                    value={currentThemeConfig.parameters.borderRadius || 'small'}
                    label="Eckenradius"
                    onChange={handleParameterChange}
                  >
                    <MenuItem value="none">Keine Rundung</MenuItem>
                    <MenuItem value="small">Leicht gerundet</MenuItem>
                    <MenuItem value="medium">Mittel gerundet</MenuItem>
                    <MenuItem value="large">Stark gerundet</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="visualDensity-label">Visuelle Dichte</InputLabel>
                  <Select
                    labelId="visualDensity-label"
                    name="visualDensity"
                    value={currentThemeConfig.parameters.visualDensity || 'medium'}
                    label="Visuelle Dichte"
                    onChange={handleParameterChange}
                  >
                    <MenuItem value="compact">Kompakt</MenuItem>
                    <MenuItem value="medium">Mittel</MenuItem>
                    <MenuItem value="comfortable">Komfortabel</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!currentThemeConfig.parameters.motionReduced}
                      onChange={e => updateThemeParameters({ motionReduced: e.target.checked })}
                    />
                  }
                  label="Reduzierte Bewegung"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!currentThemeConfig.parameters.enhancedFocus}
                      onChange={e => updateThemeParameters({ enhancedFocus: e.target.checked })}
                    />
                  }
                  label="Verbesserter Fokus"
                />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={resetTheme}
                >
                  Alle Parameter zurücksetzen
                </Button>
              </Grid>
            </Grid>
          )}
          
          {/* KI-Befehle-Tab */}
          {tabValue === 3 && (
            <Box>
              <Typography variant="body1" paragraph>
                Geben Sie natürlichsprachliche Befehle ein, um das Theme zu ändern.
                Beispiele: "Dunkles Theme", "Moderne Variante", "Große Schriftgröße" oder "Komfortable Abstände".
              </Typography>
              
              <Grid container spacing={2} alignItems="center">
                <Grid item xs>
                  <TextField
                    fullWidth
                    label="Natürlichsprachlicher Befehl"
                    variant="outlined"
                    value={nlCommand}
                    onChange={(e) => setNlCommand(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNLCommand()}
                  />
                </Grid>
                <Grid item>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={handleNLCommand}
                    disabled={!nlCommand.trim()}
                  >
                    Ausführen
                  </Button>
                </Grid>
              </Grid>
              
              {commandResponse && (
                <Alert 
                  severity="info" 
                  sx={{ mt: 2 }}
                  onClose={() => setCommandResponse(null)}
                >
                  {commandResponse}
                </Alert>
              )}
              
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Beispielbefehle:
                </Typography>
                <Grid container spacing={1}>
                  {[
                    'Dunkles Theme aktivieren',
                    'Helles Theme aktivieren',
                    'Hohen Kontrast aktivieren',
                    'Moderne Variante einstellen',
                    'Klassische Variante einstellen',
                    'Odoo-Variante einstellen',
                    'Schriftgröße erhöhen',
                    'Kompakte Abstände einstellen',
                    'Runde Ecken aktivieren',
                    'Theme zurücksetzen'
                  ].map((example, index) => (
                    <Grid item key={index}>
                      <Chip 
                        label={example}
                        onClick={() => {
                          setNlCommand(example);
                          handleNLCommand();
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
      
      {/* Vorschaubereich */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Vorschau der Elemente
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Buttons</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Button variant="contained" color="primary">Primär</Button>
              <Button variant="contained" color="secondary">Sekundär</Button>
              <Button variant="outlined" color="primary">Outlined</Button>
              <Button variant="text" color="primary">Text</Button>
              <Button variant="contained" disabled>Disabled</Button>
            </Box>
            
            <Typography variant="h6" gutterBottom>Text Fields</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <TextField label="Standard" />
              <TextField label="Disabled" disabled />
              <TextField label="Mit Fehler" error helperText="Fehlertext" />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Typographie</Typography>
            <Typography variant="h1">H1 Überschrift</Typography>
            <Typography variant="h2">H2 Überschrift</Typography>
            <Typography variant="h3">H3 Überschrift</Typography>
            <Typography variant="h4">H4 Überschrift</Typography>
            <Typography variant="h5">H5 Überschrift</Typography>
            <Typography variant="h6">H6 Überschrift</Typography>
            <Typography variant="subtitle1">Subtitle 1</Typography>
            <Typography variant="subtitle2">Subtitle 2</Typography>
            <Typography variant="body1">Body 1 Text</Typography>
            <Typography variant="body2">Body 2 Text</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ThemeDemo; 