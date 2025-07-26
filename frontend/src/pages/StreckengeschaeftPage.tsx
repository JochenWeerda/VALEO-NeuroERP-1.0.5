import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Tabs, Tab, Chip, Grid } from '@mui/material';
import { 
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { StreckengeschaeftList } from '../components/streckengeschaeft/StreckengeschaeftList';
import { Streckengeschaeft, VorgangsTyp, StreckenStatus } from '../types/streckengeschaeft';

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
      id={`streckengeschaeft-tabpanel-${index}`}
      aria-labelledby={`streckengeschaeft-tab-${index}`}
      {...other}
    >
      {value === index && <Box className="pt-4">{children}</Box>}
    </div>
  );
}

export const StreckengeschaeftPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedStrecke, setSelectedStrecke] = useState<Streckengeschaeft | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleStreckeClick = (strecke: Streckengeschaeft) => {
    setSelectedStrecke(strecke);
    // Hier könnte man zu einer Detail-Ansicht navigieren
    console.log('Strecke ausgewählt:', strecke);
  };

  // Mock-Statistiken
  const stats = {
    totalStrecken: 156,
    activeStrecken: 23,
    completedStrecken: 89,
    pendingStrecken: 44,
    totalRevenue: 1250000,
    totalProfit: 187500
  };

  return (
    <Box className="min-h-screen bg-gray-50">
      {/* Header */}
      <Box className="bg-white shadow-sm border-b">
        <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Box className="flex items-center justify-between h-16">
            <Box className="flex items-center space-x-4">
              <BusinessIcon className="text-blue-600" />
              <Typography variant="h5" className="text-gray-900 font-semibold">
                Streckengeschäfte
              </Typography>
              <Chip 
                label="VALEO NeuroERP" 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Box>
            
            <Box className="flex items-center space-x-2">
              <Typography variant="body2" className="text-gray-600">
                Letzte Aktualisierung: {new Date().toLocaleString('de-DE')}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Statistiken */}
      <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Grid container spacing={3} className="mb-6">
          <Grid item xs={12} sm={6} md={3}>
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent>
                <Box className="flex items-center justify-between">
                  <Box>
                    <Typography variant="h4" className="font-bold">
                      {stats.totalStrecken}
                    </Typography>
                    <Typography variant="body2" className="opacity-90">
                      Gesamt Strecken
                    </Typography>
                  </Box>
                  <BusinessIcon className="text-4xl opacity-80" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent>
                <Box className="flex items-center justify-between">
                  <Box>
                    <Typography variant="h4" className="font-bold">
                      {stats.activeStrecken}
                    </Typography>
                    <Typography variant="body2" className="opacity-90">
                      Aktive Strecken
                    </Typography>
                  </Box>
                  <TrendingUpIcon className="text-4xl opacity-80" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent>
                <Box className="flex items-center justify-between">
                  <Box>
                    <Typography variant="h4" className="font-bold">
                      {new Intl.NumberFormat('de-DE', { 
                        style: 'currency', 
                        currency: 'EUR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(stats.totalRevenue)}
                    </Typography>
                    <Typography variant="body2" className="opacity-90">
                      Gesamtumsatz
                    </Typography>
                  </Box>
                  <AssessmentIcon className="text-4xl opacity-80" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent>
                <Box className="flex items-center justify-between">
                  <Box>
                    <Typography variant="h4" className="font-bold">
                      {new Intl.NumberFormat('de-DE', { 
                        style: 'currency', 
                        currency: 'EUR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(stats.totalProfit)}
                    </Typography>
                    <Typography variant="body2" className="opacity-90">
                      Gesamtgewinn
                    </Typography>
                  </Box>
                  <TrendingUpIcon className="text-4xl opacity-80" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Card>
          <CardContent className="p-0">
            <Box className="border-b border-gray-200">
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                className="px-6"
              >
                <Tab 
                  label={
                    <Box className="flex items-center space-x-2">
                      <BusinessIcon />
                      <span>Übersicht</span>
                    </Box>
                  }
                  iconPosition="start"
                />
                <Tab 
                  label={
                    <Box className="flex items-center space-x-2">
                      <TrendingUpIcon />
                      <span>Analysen</span>
                    </Box>
                  }
                  iconPosition="start"
                />
                <Tab 
                  label={
                    <Box className="flex items-center space-x-2">
                      <AssessmentIcon />
                      <span>Berichte</span>
                    </Box>
                  }
                  iconPosition="start"
                />
                <Tab 
                  label={
                    <Box className="flex items-center space-x-2">
                      <SettingsIcon />
                      <span>Einstellungen</span>
                    </Box>
                  }
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            {/* Tab Inhalte */}
            <TabPanel value={tabValue} index={0}>
              <StreckengeschaeftList />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box className="p-6">
                <Typography variant="h6" className="mb-4">
                  Streckengeschäft-Analysen
                </Typography>
                <Typography variant="body1" className="text-gray-600">
                  Hier werden detaillierte Analysen und Charts für die Streckengeschäfte angezeigt.
                  Funktionen wie Gewinnmargen-Analyse, Trend-Analyse und Performance-Metriken werden implementiert.
                </Typography>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Box className="p-6">
                <Typography variant="h6" className="mb-4">
                  Berichte und Exporte
                </Typography>
                <Typography variant="body1" className="text-gray-600">
                  Hier können verschiedene Berichte generiert und exportiert werden:
                  - Monatliche/Quartalsberichte
                  - Gewinnmargen-Analyse
                  - Kunden- und Lieferanten-Performance
                  - Excel/PDF Exporte
                </Typography>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Box className="p-6">
                <Typography variant="h6" className="mb-4">
                  Streckengeschäft-Einstellungen
                </Typography>
                <Typography variant="body1" className="text-gray-600">
                  Konfiguration für das Streckengeschäft-Modul:
                  - Standardwerte für neue Strecken
                  - Automatische Nummerierung
                  - Benachrichtigungen
                  - Workflow-Einstellungen
                </Typography>
              </Box>
            </TabPanel>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}; 