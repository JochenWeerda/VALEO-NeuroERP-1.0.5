import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArtikelKonto from '../components/Artikel/ArtikelKonto';

const ArtikelkontoPage: React.FC = () => {
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" component={RouterLink} to="/">
            Dashboard
          </Link>
          <Link underline="hover" color="inherit" component={RouterLink} to="/artikel">
            Artikel
          </Link>
          <Typography color="text.primary">Artikelkonto</Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 2 }}>
          Artikelkonto
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Buchungstransaktionen und KI-gestützte Analysen für Artikel
        </Typography>
      </Box>
      
      <ArtikelKonto />
    </Box>
  );
};

export default ArtikelkontoPage; 