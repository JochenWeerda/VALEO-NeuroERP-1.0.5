import React from 'react';
import { Box, Paper, Typography, Tabs, Tab, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import ChargenBerichteGenerator from '../../components/inventory/ChargenBericht/ChargenBerichteGenerator';
import ChargenLebenszyklus from '../../components/inventory/ChargenBericht/ChargenLebenszyklus';

// Styled-Komponente für die Tabs
const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 3,
  },
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

/**
 * TabPanel-Komponente zur Anzeige des aktiven Tabs
 */
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`chargen-tabpanel-${index}`}
      aria-labelledby={`chargen-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

/**
 * ChargenBerichtePage-Komponente
 * Hauptkomponente für die Chargenberichte-Seite, die Tabs für verschiedene Berichtstypen enthält
 */
const ChargenBerichtePage: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Paper elevation={0} sx={{ p: 0 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ p: 3, pb: 2 }}>
          Chargenberichte
        </Typography>
        <StyledTabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="chargen-berichte-tabs"
          sx={{ px: 3 }}
        >
          <Tab label="Berichte-Generator" />
          <Tab label="Lebenszyklus-Analyse" />
          <Tab label="Qualitätsmanagement" />
        </StyledTabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <ChargenBerichteGenerator />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <ChargenLebenszyklus />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Qualitätsmanagement für Chargen (in Entwicklung)
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper 
                variant="outlined"
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  minHeight: '200px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  Dieses Modul wird in Kürze verfügbar sein.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </TabPanel>
    </Paper>
  );
};

export default ChargenBerichtePage; 