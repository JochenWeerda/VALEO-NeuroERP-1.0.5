import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';

const AnalyticsPage: React.FC = () => {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Analytics</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6">KPI-Übersicht</Typography>
            <Typography variant="body2" color="text.secondary">Hier könnten KPIs oder kleine Charts erscheinen.</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6">Trend-Analyse</Typography>
            <Typography variant="body2" color="text.secondary">Hier könnte ein Liniendiagramm oder eine Heatmap erscheinen.</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsPage; 