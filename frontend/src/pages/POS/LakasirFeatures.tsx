import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Card,
  Container,
  Paper
} from '@mui/material';
import {
  QrCode as BarcodeIcon,
  Inventory as InventoryIcon,
  LocalOffer as VoucherIcon
} from '@mui/icons-material';
import { BarcodeScanner } from '../../components/barcode';
import { StockOpnameInterface } from '../../components/inventory';
import { VoucherManagement } from '../../components/voucher';

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
      id={`lakasir-tabpanel-${index}`}
      aria-labelledby={`lakasir-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box className="py-4">
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `lakasir-tab-${index}`,
    'aria-controls': `lakasir-tabpanel-${index}`,
  };
}

export const LakasirFeatures: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl" className="py-6">
      <Paper className="p-6">
        {/* Header */}
        <Box className="mb-6">
          <Typography variant="h4" className="mb-2">
            Lakasir Features - VALEO NeuroERP
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Erweiterte POS-Funktionen adaptiert von Lakasir
          </Typography>
        </Box>

        {/* Tabs */}
        <Box className="border-b border-gray-200">
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="Lakasir Features Tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              label={
                <Box className="flex items-center gap-2">
                  <BarcodeIcon />
                  <span>Barcode-Scanner</span>
                </Box>
              }
              {...a11yProps(0)}
            />
            <Tab
              label={
                <Box className="flex items-center gap-2">
                  <InventoryIcon />
                  <span>Inventur</span>
                </Box>
              }
              {...a11yProps(1)}
            />
            <Tab
              label={
                <Box className="flex items-center gap-2">
                  <VoucherIcon />
                  <span>Gutscheine</span>
                </Box>
              }
              {...a11yProps(2)}
            />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <TabPanel value={tabValue} index={0}>
          <Card className="p-4">
            <Typography variant="h6" className="mb-4">
              Barcode-Scanner Integration
            </Typography>
            <Typography variant="body2" color="textSecondary" className="mb-4">
              Scannen Sie Barcodes direkt über die Webcam oder verbinden Sie einen externen Barcode-Scanner.
            </Typography>
            <BarcodeScanner
              onBarcodeDetected={(barcode) => {
                console.log('Barcode erkannt:', barcode);
                // TODO: Produkt über Barcode suchen und zum Warenkorb hinzufügen
              }}
              onError={(error) => {
                console.error('Scanner-Fehler:', error);
              }}
            />
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <StockOpnameInterface />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <VoucherManagement />
        </TabPanel>
      </Paper>
    </Container>
  );
}; 