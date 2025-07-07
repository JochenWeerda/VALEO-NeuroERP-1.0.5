import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';

const DashboardPage: React.FC = () => {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6">Widget 1</Typography>
            <Typography variant="body2" color="text.secondary">Platzhalter für KPI, Chart o.ä.</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6">Widget 2</Typography>
            <Typography variant="body2" color="text.secondary">Platzhalter für weitere Inhalte.</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage; 