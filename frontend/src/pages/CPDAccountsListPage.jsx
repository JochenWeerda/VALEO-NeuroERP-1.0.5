import React from 'react';
import { Container, Typography, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import CPDAccountsList from '../components/cpd/CPDAccountsList';

/**
 * Seite zur Anzeige der CPD-Konten-Stammdaten
 */
const CPDAccountsListPage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/" underline="hover" color="inherit">
          Dashboard
        </Link>
        <Typography color="text.primary">CPD-Konten-Stammdaten</Typography>
      </Breadcrumbs>
      
      <CPDAccountsList />
    </Container>
  );
};

export default CPDAccountsListPage; 