import React from 'react';
import { Box, Typography, Paper, Grid, Button, TextField } from '@mui/material';

const ReportsPage: React.FC = () => {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Berichte</Typography>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">Filter</Typography>
        <Grid container spacing={2} alignItems="center" mt={1}>
          <Grid item xs={12} sm={4}>
            <TextField label="Zeitraum" fullWidth size="small" placeholder="z.B. 01.01.2024 - 31.01.2024" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Kategorie" fullWidth size="small" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button variant="contained" color="primary" fullWidth>Filtern</Button>
          </Grid>
        </Grid>
      </Paper>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6">Umsatzreport</Typography>
            <Typography variant="body2" color="text.secondary">Hier könnte ein Chart oder eine Tabelle erscheinen.</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6">Top-Produkte</Typography>
            <Typography variant="body2" color="text.secondary">Hier könnte eine Top-Liste erscheinen.</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportsPage; 