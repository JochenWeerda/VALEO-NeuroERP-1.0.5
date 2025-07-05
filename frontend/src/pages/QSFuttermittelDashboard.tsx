import React, { useState, useEffect } from 'react';
import { Box, Container, Tab, Tabs, Paper, Button, Snackbar, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import QSFuttermittelChargeList from '../components/qs/QSFuttermittelChargeList';
import QSFuttermittelChargeDetail from '../components/qs/QSFuttermittelChargeDetail';
import QSFuttermittelExport from '../components/qs/QSFuttermittelExport';
import { QSFuttermittelCharge, deleteQSFuttermittelCharge } from '../services/qsApi';
import { getMockQSFuttermittelChargeById } from '../services/mockQsApi';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`qs-futtermittel-tabpanel-${index}`}
      aria-labelledby={`qs-futtermittel-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const QSFuttermittelDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedCharge, setSelectedCharge] = useState<QSFuttermittelCharge | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [useMockData, setUseMockData] = useState<boolean>(false);

  // Beim ersten Laden automatisch die erste Charge auswählen (nur für Demo-Zwecke)
  useEffect(() => {
    const loadMockDataIfNeeded = async () => {
      // Wenn wir auf der Detailseite sind und keine Charge ausgewählt ist, Mock-Daten laden
      if (!selectedCharge && tabValue === 1) {
        const mockCharge = getMockQSFuttermittelChargeById(1001);
        if (mockCharge) {
          setSelectedCharge(mockCharge);
          setUseMockData(true);
        }
      }
    };

    loadMockDataIfNeeded();
  }, [tabValue, selectedCharge]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleViewCharge = (charge: QSFuttermittelCharge) => {
    setSelectedCharge(charge);
    setTabValue(1); // Switch to detail tab
    
    // Wenn die Charge aus den Mock-Daten stammt, setzen wir useMockData auf true
    if (charge.id && charge.id >= 1000 && charge.id < 2000) {
      setUseMockData(true);
    }
  };

  const handleEditCharge = (charge: QSFuttermittelCharge) => {
    // Hier könnte in Zukunft ein Formular zur Bearbeitung geöffnet werden
    console.log('Edit charge:', charge);
  };

  const handleDeleteCharge = async (id: number) => {
    try {
      // Bei Mock-Daten nur eine Erfolgsbenachrichtigung anzeigen
      if (useMockData || (id >= 1000 && id < 2000)) {
        setSnackbarMessage('QS-Futtermittelcharge erfolgreich gelöscht (Testdaten)');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
        
        // Wenn die aktuelle Detail-Charge gelöscht wurde, zurück zur Liste
        if (selectedCharge && selectedCharge.id === id) {
          setSelectedCharge(null);
          setTabValue(0);
        }
        return;
      }

      await deleteQSFuttermittelCharge(id);
      setSnackbarMessage('QS-Futtermittelcharge erfolgreich gelöscht');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      
      // Wenn die aktuelle Detail-Charge gelöscht wurde, zurück zur Liste
      if (selectedCharge && selectedCharge.id === id) {
        setSelectedCharge(null);
        setTabValue(0);
      }
    } catch (error) {
      console.error('Fehler beim Löschen der QS-Futtermittelcharge:', error);
      setSnackbarMessage('Fehler beim Löschen der QS-Futtermittelcharge');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleBackToList = () => {
    setSelectedCharge(null);
    setTabValue(0);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="QS-Futtermittel Tabs">
          <Tab label="Chargenübersicht" id="qs-futtermittel-tab-0" aria-controls="qs-futtermittel-tabpanel-0" />
          <Tab 
            label="Chargendetails" 
            id="qs-futtermittel-tab-1" 
            aria-controls="qs-futtermittel-tabpanel-1" 
          />
          <Tab label="Export & Berichte" id="qs-futtermittel-tab-2" aria-controls="qs-futtermittel-tabpanel-2" />
        </Tabs>
        {tabValue === 0 && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            // Hier könnte in Zukunft ein Formular zum Hinzufügen geöffnet werden
            onClick={() => {
              // Demo: Mock-Charge anzeigen
              if (useMockData) {
                const mockCharge = getMockQSFuttermittelChargeById(1003);
                if (mockCharge) {
                  setSelectedCharge(mockCharge);
                  setTabValue(1);
                  setSnackbarMessage('Neue Charge geladen (Testdaten)');
                  setSnackbarSeverity('success');
                  setOpenSnackbar(true);
                }
              } else {
                console.log('Neue Charge anlegen');
              }
            }}
          >
            Neue Charge
          </Button>
        )}
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <QSFuttermittelChargeList
          onView={handleViewCharge}
          onEdit={handleEditCharge}
          onDelete={handleDeleteCharge}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {selectedCharge ? (
          <QSFuttermittelChargeDetail
            charge={selectedCharge}
            onBack={handleBackToList}
            onAddRohstoff={() => {
              setSnackbarMessage('Rohstoff würde hinzugefügt werden (Testfunktion)');
              setSnackbarSeverity('success');
              setOpenSnackbar(true);
            }}
            onAddMonitoring={() => {
              setSnackbarMessage('Monitoring würde hinzugefügt werden (Testfunktion)');
              setSnackbarSeverity('success');
              setOpenSnackbar(true);
            }}
            onAddEreignis={() => {
              setSnackbarMessage('Ereignis würde hinzugefügt werden (Testfunktion)');
              setSnackbarSeverity('success');
              setOpenSnackbar(true);
            }}
          />
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Alert severity="info">
              Bitte wählen Sie zuerst eine Charge aus der Übersicht aus, um die Details anzuzeigen.
            </Alert>
            <Button 
              variant="contained" 
              color="primary"
              sx={{ mt: 2 }}
              onClick={() => setTabValue(0)}
            >
              Zur Chargenübersicht
            </Button>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <QSFuttermittelExport selectedChargeId={selectedCharge?.id} />
      </TabPanel>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default QSFuttermittelDashboard; 