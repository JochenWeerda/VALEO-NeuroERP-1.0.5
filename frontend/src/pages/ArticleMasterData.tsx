import React from 'react';
import { Box, Typography, Paper, TextField, Button } from '@mui/material';

const ArticleMasterData: React.FC = () => {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Artikelstammdaten</Typography>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <form>
          <TextField label="Artikelnummer" fullWidth margin="normal" />
          <TextField label="Bezeichnung" fullWidth margin="normal" />
          <TextField label="Preis" fullWidth margin="normal" />
          <Button variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>Speichern</Button>
        </form>
      </Paper>
    </Box>
  );
};

export default ArticleMasterData; 