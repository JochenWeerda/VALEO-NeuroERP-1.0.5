import React from 'react';
import { Box, Breadcrumbs, Container, Link, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import InventoryIcon from '@mui/icons-material/Inventory';
import ScienceIcon from '@mui/icons-material/Science';
import ChargenQualitaetsmanagement from '../../components/Qualitaet/ChargenQualitaetsmanagement';

const ChargenQualitaetPage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 3, mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            component={RouterLink}
            to="/"
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            Start
          </Link>
          <Link
            component={RouterLink}
            to="/inventory"
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <InventoryIcon sx={{ mr: 0.5 }} fontSize="small" />
            Lager
          </Link>
          <Link
            component={RouterLink}
            to="/chargen"
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <InventoryIcon sx={{ mr: 0.5 }} fontSize="small" />
            Chargen
          </Link>
          <Typography
            sx={{ display: 'flex', alignItems: 'center' }}
            color="text.primary"
          >
            <ScienceIcon sx={{ mr: 0.5 }} fontSize="small" />
            Qualitätsmanagement
          </Typography>
        </Breadcrumbs>
      </Box>

      <ChargenQualitaetsmanagement />
    </Container>
  );
};

export default ChargenQualitaetPage; 