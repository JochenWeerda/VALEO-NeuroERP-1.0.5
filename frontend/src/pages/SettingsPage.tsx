import React from 'react';
import { Box, Typography, Paper, TextField, Button } from '@mui/material';

const SettingsPage: React.FC = () => {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Einstellungen</Typography>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <form>
          <TextField label="Firmenname" fullWidth margin="normal" />
          <TextField label="E-Mail" fullWidth margin="normal" />
          <Button variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>Speichern</Button>
        </form>
      </Paper>
    </Box>
  );
};

export default SettingsPage; 