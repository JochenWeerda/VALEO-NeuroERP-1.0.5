import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh">
      <Typography variant="h2" color="error" gutterBottom>404</Typography>
      <Typography variant="h5" gutterBottom>Seite nicht gefunden</Typography>
      <Button variant="contained" color="primary" onClick={() => navigate('/')}>Zurück zum Dashboard</Button>
    </Box>
  );
};

export default NotFoundPage; 