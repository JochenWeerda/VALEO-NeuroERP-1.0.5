import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Typography, Paper, Container } from '@mui/material';
import { TabPanel } from '../../components/common/TabPanel';
import EInvoicingList from './EInvoicingList';
import EInvoicingForm from './EInvoicingForm';
import EInvoicingStatistics from './EInvoicingStatistics';
import EInvoicingValidation from './EInvoicingValidation';

interface EInvoicingPageProps {
  // Props für die e-Invoicing-Seite
}

export const EInvoicingPage: React.FC<EInvoicingPageProps> = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ width: '100%', mt: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          E-Invoicing Management
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          ZUGFeRD/XRechnung e-Invoicing mit Mustangproject und Claude Flow Integration
        </Typography>

        <Paper sx={{ width: '100%', mt: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="E-Rechnungen" />
            <Tab label="Neue e-Rechnung" />
            <Tab label="Validierung" />
            <Tab label="Statistiken" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <EInvoicingList />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <EInvoicingForm 
              onSubmit={async (data) => {
                console.log('Neue Rechnung:', data);
                // Hier würde die API-Integration erfolgen
              }}
              onCancel={() => setTabValue(0)}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <EInvoicingValidation 
              validationResult={{
                isValid: true,
                errors: [],
                warnings: []
              }}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <EInvoicingStatistics 
              statistics={{
                monthly: [],
                yearly: [],
                topCustomers: [],
                paymentMethods: []
              }}
            />
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default EInvoicingPage; 