import React from 'react';
import { Container, Typography, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import CPDAccountFormComponent from '../components/cpd/CPDAccountForm';

/**
 * Seite für das Erstellen/Bearbeiten von CPD-Konten-Stammdaten
 */
const CPDAccountForm = ({ mode = 'create' }) => {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/" underline="hover" color="inherit">
          Dashboard
        </Link>
        <Link component={RouterLink} to="/cpd-konten" underline="hover" color="inherit">
          CPD-Konten-Stammdaten
        </Link>
        <Typography color="text.primary">
          {mode === 'edit' ? 'CPD-Konto bearbeiten' : 'Neues CPD-Konto'}
        </Typography>
      </Breadcrumbs>
      
      <CPDAccountFormComponent mode={mode} />
    </Container>
  );
};

export default CPDAccountForm; 