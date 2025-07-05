import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
  SelectChangeEvent
} from '@mui/material';
import { useThemeSystem } from '../themes/ThemeProvider';
import { ThemeMode, ThemeVariant } from '../themes/themeTypes';
import Layout from '../components/layout/Layout';
import AI from '../components/AI';

const ThemeSettings: React.FC = () => {
  const { mode, variant, parameters, setMode, setVariant, setParameters, resetTheme } = useThemeSystem();

  const handleModeChange = (event: SelectChangeEvent<string>) => {
    setMode(event.target.value as ThemeMode);
  };

  const handleVariantChange = (event: SelectChangeEvent<string>) => {
    setVariant(event.target.value as ThemeVariant);
  };

  const handleFontSizeChange = (event: SelectChangeEvent<string>) => {
    setParameters({ fontSize: event.target.value as 'small' | 'medium' | 'large' });
  };

  const handleSpacingChange = (event: SelectChangeEvent<string>) => {
    setParameters({ spacing: event.target.value as 'compact' | 'normal' | 'comfortable' });
  };

  const handleBorderRadiusChange = (event: SelectChangeEvent<string>) => {
    setParameters({ borderRadius: event.target.value as 'none' | 'small' | 'medium' | 'large' });
  };

  return (
    <Layout title="Theme-Einstellungen">
      <Typography variant="h4" gutterBottom>
        Theme-Einstellungen
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Grundeinstellungen
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="theme-mode-label">Modus</InputLabel>
              <Select
                labelId="theme-mode-label"
                id="theme-mode"
                value={mode}
                label="Modus"
                onChange={handleModeChange}
              >
                <MenuItem value="light">Hell</MenuItem>
                <MenuItem value="dark">Dunkel</MenuItem>
                <MenuItem value="high-contrast">Hoher Kontrast</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="theme-variant-label">Variante</InputLabel>
              <Select
                labelId="theme-variant-label"
                id="theme-variant"
                value={variant}
                label="Variante"
                onChange={handleVariantChange}
              >
                <MenuItem value="odoo">Odoo</MenuItem>
                <MenuItem value="default">Standard</MenuItem>
                <MenuItem value="modern">Modern</MenuItem>
                <MenuItem value="classic">Klassisch</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ mt: 3 }}>
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={resetTheme}
              >
                Auf Standardwerte zurücksetzen
              </Button>
            </Box>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Erweiterte Einstellungen
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="font-size-label">Schriftgröße</InputLabel>
              <Select
                labelId="font-size-label"
                id="font-size"
                value={parameters.fontSize || 'medium'}
                label="Schriftgröße"
                onChange={handleFontSizeChange}
              >
                <MenuItem value="small">Klein</MenuItem>
                <MenuItem value="medium">Mittel</MenuItem>
                <MenuItem value="large">Groß</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="spacing-label">Abstände</InputLabel>
              <Select
                labelId="spacing-label"
                id="spacing"
                value={parameters.spacing || 'normal'}
                label="Abstände"
                onChange={handleSpacingChange}
              >
                <MenuItem value="compact">Kompakt</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="comfortable">Komfortabel</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="border-radius-label">Eckenradius</InputLabel>
              <Select
                labelId="border-radius-label"
                id="border-radius"
                value={parameters.borderRadius || 'small'}
                label="Eckenradius"
                onChange={handleBorderRadiusChange}
              >
                <MenuItem value="none">Keine Abrundung</MenuItem>
                <MenuItem value="small">Leicht abgerundet</MenuItem>
                <MenuItem value="medium">Mittel abgerundet</MenuItem>
                <MenuItem value="large">Stark abgerundet</MenuItem>
              </Select>
            </FormControl>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Aktuelle Theme-Konfiguration" />
            <CardContent>
              <Typography variant="body1" gutterBottom>
                <strong>Modus:</strong> {mode === 'light' ? 'Hell' : mode === 'dark' ? 'Dunkel' : 'Hoher Kontrast'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Variante:</strong> {variant}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Schriftgröße:</strong> {parameters.fontSize === 'small' ? 'Klein' : parameters.fontSize === 'large' ? 'Groß' : 'Mittel'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Abstände:</strong> {parameters.spacing === 'compact' ? 'Kompakt' : parameters.spacing === 'comfortable' ? 'Komfortabel' : 'Normal'}
              </Typography>
              <Typography variant="body1">
                <strong>Eckenradius:</strong> {
                  parameters.borderRadius === 'none' ? 'Keine Abrundung' : 
                  parameters.borderRadius === 'small' ? 'Leicht abgerundet' : 
                  parameters.borderRadius === 'medium' ? 'Mittel abgerundet' : 
                  'Stark abgerundet'
                }
              </Typography>
            </CardContent>
          </Card>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              KI-Assistent für Theme-Anpassungen
            </Typography>
            <Typography variant="body2" paragraph>
              Nutzen Sie den KI-Assistenten, um das Theme mit natürlichsprachlichen Befehlen anzupassen.
            </Typography>
            <AI />
          </Box>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default ThemeSettings; 