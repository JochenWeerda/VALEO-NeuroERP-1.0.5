import React from 'react';
import { Box, Typography, Grid, Paper, AppBar, Toolbar, Button } from '@mui/material';

const DashboardWidget: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
  <Paper elevation={3} sx={{ p: 2 }}>
    <Typography variant="h6">{title}</Typography>
    <Typography variant="h4" color="primary">{value}</Typography>
  </Paper>
);

const DashboardPage: React.FC = () => {
  // Beispiel-Daten, später durch echte API-Daten ersetzen
  const kpis = [
    { title: 'Umsatz (Monat)', value: '€ 12.340' },
    { title: 'Bestellungen', value: 128 },
    { title: 'Offene Tickets', value: 7 },
    { title: 'Neue Nutzer', value: 23 },
  ];

  return (
    <Box>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h5" sx={{ flexGrow: 1 }}>
            NeuroERP Dashboard
          </Typography>
          <Button color="primary" variant="outlined" sx={{ ml: 2 }}>
            Berichte
          </Button>
          <Button color="primary" variant="outlined" sx={{ ml: 2 }}>
            Einstellungen
          </Button>
        </Toolbar>
      </AppBar>
      <Box p={3}>
        <Typography variant="h4" gutterBottom>
          Willkommen im Dashboard
        </Typography>
        <Grid container spacing={3}>
          {kpis.map((kpi, idx) => (
            <Grid item xs={12} sm={6} md={3} key={kpi.title}>
              <DashboardWidget title={kpi.title} value={kpi.value} />
            </Grid>
          ))}
        </Grid>
        <Box mt={4}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Systemnachrichten
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hier könnten aktuelle Systemmeldungen, Hinweise oder ein Activity-Feed erscheinen.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage; 