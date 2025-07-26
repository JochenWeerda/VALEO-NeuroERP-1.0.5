import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  Button,
  Chip,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useApi } from '../contexts/ApiContext';
import {
  ObjectPageHeader
} from '../components/ui/NeuroFlowComponents';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const AnalyticsPage: React.FC = () => {
  const { isLoading, error } = useApi();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRefresh = () => {
    console.log('Refreshing analytics...');
  };

  const summaryCards = [
    {
      icon: <BarChartIcon sx={{ fontSize: 40, color: '#0A6ED1' }} />,
      value: '2.847 Mio. €',
      label: 'Gesamtumsatz',
      color: '#0A6ED1'
    },
    {
      icon: <PieChartIcon sx={{ fontSize: 40, color: '#107C41' }} />,
      value: '1.234',
      label: 'Bestellungen',
      color: '#107C41'
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: '#E9730C' }} />,
      value: '89',
      label: 'Lieferanten',
      color: '#E9730C'
    },
    {
      icon: <AssessmentIcon sx={{ fontSize: 40, color: '#BB0000' }} />,
      value: '2.308 €',
      label: 'Durchschnittsbestellwert',
      color: '#BB0000'
    }
  ];

  return (
    <Box 
      data-testid="analytics-container"
      sx={{ minHeight: '100vh', bgcolor: '#F5F6F7' }}
    >
      {/* Header */}
      <ObjectPageHeader
        title="Analytics Dashboard"
        subtitle="Intelligente Datenanalyse und Berichte"
        status="Live-Daten"
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={isLoading}
            >
              Aktualisieren
            </Button>
          </Box>
        }
      />

      {/* Error Display */}
      {error && (
        <Box sx={{ px: 3 }}>
          <Typography variant="body1" color="error">{error}</Typography>
        </Box>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}>
        <Box sx={{ px: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.875rem'
              },
              '& .Mui-selected': {
                color: '#0A6ED1',
                fontWeight: 600
              }
            }}
          >
            <Tab label="Übersicht" />
            <Tab label="Umsatzanalyse" />
            <Tab label="Lieferanten" />
            <Tab label="Bestellungen" />
            <Tab label="Trends" />
          </Tabs>
        </Box>
      </Box>

      {/* Tab Content */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ p: 3 }}>
          {/* Summary Cards */}
          <Box 
            data-testid="chart-container"
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 3,
              mb: 4
            }}
          >
            {summaryCards.map((card, index) => (
              <Box key={index}>
                <Card 
                  data-testid={`analytics-card-${index}`}
                  sx={{ p: 3, height: '100%' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {card.icon}
                    <Box>
                      <Typography variant="h4" sx={{ color: card.color, fontWeight: 600 }}>
                        {card.value}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#515559' }}>
                        {card.label}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Box>
            ))}
          </Box>

          {/* Placeholder Content */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
            gap: 3,
            mb: 4
          }}>
            <Card sx={{ p: 3, minHeight: 400 }}>
              <Typography variant="h6" gutterBottom>
                Umsatzentwicklung
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                <Typography variant="body1" color="text.secondary">
                  Chart wird geladen...
                </Typography>
              </Box>
            </Card>
            
            <Card sx={{ p: 3, minHeight: 400 }}>
              <Typography variant="h6" gutterBottom>
                Top Kategorien
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                <Typography variant="body1" color="text.secondary">
                  Chart wird geladen...
                </Typography>
              </Box>
            </Card>
          </Box>

          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            gap: 3
          }}>
            <Card sx={{ p: 3, minHeight: 300 }}>
              <Typography variant="h6" gutterBottom>
                Lieferanten-Performance
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                <Typography variant="body1" color="text.secondary">
                  Chart wird geladen...
                </Typography>
              </Box>
            </Card>
            
            <Card sx={{ p: 3, minHeight: 300 }}>
              <Typography variant="h6" gutterBottom>
                Bestelltrends
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                <Typography variant="body1" color="text.secondary">
                  Chart wird geladen...
                </Typography>
              </Box>
            </Card>
          </Box>
        </Box>
      </TabPanel>

      {/* Other Tab Panels */}
      {[1, 2, 3, 4].map((index) => (
        <TabPanel key={index} value={tabValue} index={index}>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ color: '#515559', mb: 2 }}>
              Tab {index + 1}
            </Typography>
            <Typography variant="body1" sx={{ color: '#6A6D70' }}>
              Diese Funktion wird in Kürze verfügbar sein.
            </Typography>
          </Box>
        </TabPanel>
      ))}

      {/* Loading Overlay */}
      {isLoading && (
        <Box sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          bgcolor: 'rgba(0,0,0,0.3)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default AnalyticsPage; 