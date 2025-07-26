import React from 'react';
import { Box, Typography, Button, Container, Card, CardContent } from '@mui/material';

export const TestPage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            ✅ VALEO NeuroERP Test-Seite
          </Typography>
          <Typography variant="body1" paragraph>
            Diese Seite funktioniert! Das bedeutet, dass die Grundkonfiguration korrekt ist.
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Verfügbare Routen:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button variant="outlined" href="/" sx={{ justifyContent: 'flex-start' }}>
                / - Landing Page
              </Button>
              <Button variant="outlined" href="/login" sx={{ justifyContent: 'flex-start' }}>
                /login - Login Page
              </Button>
              <Button variant="outlined" href="/dashboard" sx={{ justifyContent: 'flex-start' }}>
                /dashboard - Dashboard
              </Button>
            </Box>
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Status:
            </Typography>
            <Typography variant="body2" color="success.main">
              ✅ React läuft
            </Typography>
            <Typography variant="body2" color="success.main">
              ✅ Material-UI funktioniert
            </Typography>
            <Typography variant="body2" color="success.main">
              ✅ Routing aktiv
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default TestPage; 