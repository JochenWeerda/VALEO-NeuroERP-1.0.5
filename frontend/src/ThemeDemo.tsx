import React from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Tabs, 
  Tab 
} from '@mui/material';
import { ThemeProvider } from './themes/ThemeProvider';
import Layout from './components/layout/Layout';
import AI from './components/AI';
import ThemeSettings from './pages/ThemeSettings';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`theme-demo-tabpanel-${index}`}
      aria-labelledby={`theme-demo-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `theme-demo-tab-${index}`,
    'aria-controls': `theme-demo-tabpanel-${index}`,
  };
};

const ThemeDemo: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <ThemeProvider>
      <Layout title="Theme-System Demonstration">
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Theme-System Demonstration
          </Typography>
          <Typography variant="body1" paragraph>
            Diese Demonstration zeigt die Funktionen des zentralen Theme-Systems des ERP. 
            Das System unterstützt verschiedene Modi (Hell, Dunkel, Hoher Kontrast) und 
            Theme-Varianten (Odoo, Default, Modern, Classic).
          </Typography>
          <Typography variant="body1">
            Verwenden Sie die Tabs unten, um zwischen den verschiedenen Ansichten zu wechseln.
          </Typography>
        </Paper>

        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            aria-label="Theme-Demo Tabs"
          >
            <Tab label="Theme-Einstellungen" {...a11yProps(0)} />
            <Tab label="KI-Assistent" {...a11yProps(1)} />
            <Tab label="Komponenten" {...a11yProps(2)} />
          </Tabs>

          <Box sx={{ p: 3 }}>
            <TabPanel value={tabValue} index={0}>
              <ThemeSettings />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h5" gutterBottom>
                KI-Assistent für Theme-Anpassungen
              </Typography>
              <Typography variant="body2" paragraph>
                Sie können natürlichsprachliche Befehle verwenden, um das Theme anzupassen.
                Beispiele: "Aktiviere Dark Mode", "Wechsle zum Odoo-Theme", "Stelle hohen Kontrast ein"
              </Typography>
              <AI />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <ComponentsShowcase />
            </TabPanel>
          </Box>
        </Paper>
      </Layout>
    </ThemeProvider>
  );
};

// Komponenten-Showcase
const ComponentsShowcase: React.FC = () => {
  return (
    <>
      <Typography variant="h5" gutterBottom>
        Komponenten-Showcase
      </Typography>
      <Typography variant="body2" paragraph>
        Diese Seite zeigt verschiedene UI-Komponenten im aktuellen Theme.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Typografie
            </Typography>
            <Typography variant="h1">H1 Überschrift</Typography>
            <Typography variant="h2">H2 Überschrift</Typography>
            <Typography variant="h3">H3 Überschrift</Typography>
            <Typography variant="h4">H4 Überschrift</Typography>
            <Typography variant="h5">H5 Überschrift</Typography>
            <Typography variant="h6">H6 Überschrift</Typography>
            <Typography variant="subtitle1">Untertitel 1</Typography>
            <Typography variant="subtitle2">Untertitel 2</Typography>
            <Typography variant="body1">Textkörper 1</Typography>
            <Typography variant="body2">Textkörper 2</Typography>
            <Typography variant="caption">Beschriftung</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Farbpalette
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                Primärfarbe
              </Box>
              <Box sx={{ p: 2, bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
                Sekundärfarbe
              </Box>
              <Box sx={{ p: 2, bgcolor: 'error.main', color: 'error.contrastText' }}>
                Fehlerfarbe
              </Box>
              <Box sx={{ p: 2, bgcolor: 'warning.main', color: 'warning.contrastText' }}>
                Warnfarbe
              </Box>
              <Box sx={{ p: 2, bgcolor: 'info.main', color: 'info.contrastText' }}>
                Infofarbe
              </Box>
              <Box sx={{ p: 2, bgcolor: 'success.main', color: 'success.contrastText' }}>
                Erfolgsfarbe
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Oberflächen
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ p: 2, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                Standard-Hintergrund
              </Box>
              <Box sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                Papier-Hintergrund
              </Box>
              <Box sx={{ p: 2, bgcolor: 'grey.100', color: 'text.primary' }}>
                Grau 100
              </Box>
              <Box sx={{ p: 2, bgcolor: 'grey.300', color: 'text.primary' }}>
                Grau 300
              </Box>
              <Box sx={{ p: 2, bgcolor: 'grey.500', color: 'common.white' }}>
                Grau 500
              </Box>
              <Box sx={{ p: 2, bgcolor: 'grey.700', color: 'common.white' }}>
                Grau 700
              </Box>
              <Box sx={{ p: 2, bgcolor: 'grey.900', color: 'common.white' }}>
                Grau 900
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default ThemeDemo; 