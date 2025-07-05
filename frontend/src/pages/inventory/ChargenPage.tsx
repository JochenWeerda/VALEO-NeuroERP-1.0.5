import React, { useState } from 'react';
import { Box, Button, Container, Paper, Typography, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ScienceIcon from '@mui/icons-material/Science';
import ChargeList from '../../components/inventory/ChargeList';
import ChargeDetail from '../../components/inventory/ChargeDetail';
import ChargeTracking from '../../components/inventory/ChargeTracking';
import { Charge } from '../../services/inventoryApi';

enum View {
  LIST = 'list',
  DETAIL = 'detail',
  TRACKING = 'tracking',
  CREATE = 'create',
}

const ChargenPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.LIST);
  const [selectedCharge, setSelectedCharge] = useState<Charge | null>(null);

  // Handler-Funktionen für die Navigation
  const handleViewCharge = (charge: Charge) => {
    setSelectedCharge(charge);
    setCurrentView(View.DETAIL);
  };

  const handleEditCharge = (charge: Charge) => {
    // Diese Funktion würde zur Bearbeitung führen, aber wir implementieren hier nur die Anzeige
    setSelectedCharge(charge);
    setCurrentView(View.DETAIL);
  };

  const handleTraceCharge = (charge: Charge) => {
    setSelectedCharge(charge);
    setCurrentView(View.TRACKING);
  };

  const handleLinkCharge = (charge: Charge) => {
    // Diese Funktion würde zur Verknüpfung führen, aber wir implementieren das jetzt nicht
    console.log('Charge verknüpfen:', charge);
  };

  const handleCreateCharge = () => {
    setCurrentView(View.CREATE);
  };

  const handleBackToList = () => {
    setCurrentView(View.LIST);
    setSelectedCharge(null);
  };

  // Render-Funktion für die aktuelle Ansicht
  const renderContent = () => {
    switch (currentView) {
      case View.DETAIL:
        return (
          <ChargeDetail 
            chargeId={selectedCharge?.id || 0} 
            onBack={handleBackToList} 
          />
        );
      case View.TRACKING:
        return (
          <ChargeTracking 
            chargeId={selectedCharge?.id || 0} 
            onBack={handleBackToList}
            onViewCharge={(chargeId) => {
              // Wenn wir auf eine andere Charge wechseln wollen
              // Hier würde normalerweise ein API-Aufruf stattfinden, um die Charge zu laden
              // Für jetzt simulieren wir das mit dem vorhandenen Objekt
              setSelectedCharge({ ...selectedCharge!, id: chargeId });
              setCurrentView(View.DETAIL);
            }}
          />
        );
      case View.CREATE:
        // Hier würde ein Formular zum Erstellen einer neuen Charge erscheinen
        return (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Neue Charge erstellen
            </Typography>
            <Typography paragraph>
              Hier würde das Formular zum Erstellen einer neuen Charge erscheinen.
            </Typography>
            <Button variant="outlined" onClick={handleBackToList}>
              Zurück zur Übersicht
            </Button>
          </Paper>
        );
      case View.LIST:
      default:
        return (
          <ChargeList
            onViewCharge={handleViewCharge}
            onEditCharge={handleEditCharge}
            onTraceCharge={handleTraceCharge}
            onLinkCharge={handleLinkCharge}
          />
        );
    }
  };

  // Breadcrumbs-Titel basierend auf der aktuellen Ansicht
  const getBreadcrumbTitle = () => {
    switch (currentView) {
      case View.DETAIL:
        return `Charge ${selectedCharge?.chargennummer}`;
      case View.TRACKING:
        return `Verfolgung ${selectedCharge?.chargennummer}`;
      case View.CREATE:
        return 'Neue Charge';
      case View.LIST:
      default:
        return 'Chargen';
    }
  };

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
          <Typography
            sx={{ display: 'flex', alignItems: 'center' }}
            color="text.primary"
          >
            {getBreadcrumbTitle()}
          </Typography>
        </Breadcrumbs>
      </Box>

      {currentView === View.LIST && (
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Box>
            <Button
              component={RouterLink}
              to="/chargenberichte"
              variant="outlined"
              color="primary"
              startIcon={<AssessmentIcon />}
              sx={{ mr: 2 }}
            >
              Chargenberichte
            </Button>
            <Button
              component={RouterLink}
              to="/chargen/qualitaet"
              variant="outlined"
              color="primary"
              startIcon={<ScienceIcon />}
            >
              Qualitätsmanagement
            </Button>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateCharge}
          >
            Neue Charge
          </Button>
        </Box>
      )}

      {renderContent()}
    </Container>
  );
};

export default ChargenPage; 