import React, { useState } from 'react';
import {
  Card,
  Typography,
  Grid,
  Button,
  Box,
  Tabs,
  Tab,
  Alert,
  Chip,
  Divider
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Assignment as AssignmentIcon,
  LocalOffer as LocalOfferIcon,
  LocalShipping as ShippingIcon,
  ConfirmationNumber as ConfirmationIcon
} from '@mui/icons-material';
import {
  OrderSuggestion,
  PurchaseOrder,
  SupplierOffer,
  DeliveryNote,
  OrderConfirmation,
  type OrderSuggestionData,
  type PurchaseOrderData,
  type SupplierOfferData,
  type DeliveryNoteData,
  type OrderConfirmationData
} from '../components/erp';

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
      id={`erp-tabpanel-${index}`}
      aria-labelledby={`erp-tab-${index}`}
      {...other}
    >
      {value === index && <Box className="p-4">{children}</Box>}
    </div>
  );
}

export const ERPDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [componentMode, setComponentMode] = useState<'create' | 'edit' | 'view'>('create');
  
  // Demo-Daten für die Komponenten
  const [orderSuggestionData, setOrderSuggestionData] = useState<OrderSuggestionData | null>(null);
  const [purchaseOrderData, setPurchaseOrderData] = useState<PurchaseOrderData | null>(null);
  const [supplierOfferData, setSupplierOfferData] = useState<SupplierOfferData | null>(null);
  const [deliveryNoteData, setDeliveryNoteData] = useState<DeliveryNoteData | null>(null);
  const [orderConfirmationData, setOrderConfirmationData] = useState<OrderConfirmationData | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleOrderSuggestionSelect = (suggestion: OrderSuggestionData) => {
    console.log('Vorschlag ausgewählt:', suggestion);
    setOrderSuggestionData(suggestion);
  };

  const handleOrderCreate = (order: any) => {
    console.log('Bestellung erstellt:', order);
    alert(`Bestellung ${order.id} wurde erstellt!`);
  };

  const handleSave = (data: any, type: string) => {
    console.log(`${type} gespeichert:`, data);
    alert(`${type} wurde erfolgreich gespeichert!`);
  };

  const handleCancel = () => {
    console.log('Aktion abgebrochen');
    alert('Aktion wurde abgebrochen');
  };

  const erpComponents = [
    {
      label: 'Bestellvorschlag',
      icon: <ShoppingCartIcon />,
      component: (
        <OrderSuggestion
          onSuggestionSelect={handleOrderSuggestionSelect}
          onOrderCreate={handleOrderCreate}
          filters={{}}
        />
      )
    },
    {
      label: 'Kaufbestellung',
      icon: <AssignmentIcon />,
      component: (
        <PurchaseOrder
          mode={componentMode}
          onSave={(data) => handleSave(data, 'Kaufbestellung')}
          onCancel={handleCancel}
        />
      )
    },
    {
      label: 'Lieferanten-Angebot',
      icon: <LocalOfferIcon />,
      component: (
        <SupplierOffer
          onOfferCreate={(data) => handleSave(data, 'Lieferanten-Angebot')}
          onOfferUpdate={(id, data) => handleSave(data, 'Lieferanten-Angebot')}
          onOfferDelete={(id) => console.log('Angebot gelöscht:', id)}
        />
      )
    },
    {
      label: 'Lieferschein',
      icon: <ShippingIcon />,
      component: (
        <DeliveryNote
          onDeliveryCreate={(data) => handleSave(data, 'Lieferschein')}
          onDeliveryUpdate={(id, data) => handleSave(data, 'Lieferschein')}
          onDeliveryDelete={(id) => console.log('Lieferschein gelöscht:', id)}
        />
      )
    },
    {
      label: 'Bestellbestätigung',
      icon: <ConfirmationIcon />,
      component: (
        <OrderConfirmation
          onConfirmationCreate={(data) => handleSave(data, 'Bestellbestätigung')}
          onConfirmationUpdate={(id, data) => handleSave(data, 'Bestellbestätigung')}
          onConfirmationDelete={(id) => console.log('Bestellbestätigung gelöscht:', id)}
        />
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card className="mb-6">
        <Box className="p-6">
          <Typography variant="h4" className="mb-4">
            VALEO NeuroERP - Komponenten Demo
          </Typography>
          <Typography variant="body1" className="mb-4 text-gray-600">
            Diese Demo zeigt alle ERP-Komponenten in verschiedenen Modi (Erstellen, Bearbeiten, Anzeigen).
          </Typography>
          
          <div className="flex items-center space-x-4 mb-4">
            <Typography variant="subtitle1">Komponenten-Modus:</Typography>
            <div className="flex space-x-2">
              <Button
                variant={componentMode === 'create' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setComponentMode('create')}
              >
                Erstellen
              </Button>
              <Button
                variant={componentMode === 'edit' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setComponentMode('edit')}
              >
                Bearbeiten
              </Button>
              <Button
                variant={componentMode === 'view' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setComponentMode('view')}
              >
                Anzeigen
              </Button>
            </div>
          </div>

          <Alert severity="info" className="mb-4">
            <strong>Aktueller Modus:</strong> {componentMode === 'create' ? 'Erstellen' : 
                                               componentMode === 'edit' ? 'Bearbeiten' : 'Anzeigen'}
            <br />
            <strong>Hinweis:</strong> Im "Anzeigen"-Modus sind alle Felder schreibgeschützt.
          </Alert>
        </Box>
      </Card>

      <Card>
        <Box className="border-b">
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="ERP Komponenten Tabs"
          >
            {erpComponents.map((component, index) => (
              <Tab
                key={index}
                label={
                  <div className="flex items-center space-x-2">
                    {component.icon}
                    <span>{component.label}</span>
                  </div>
                }
                id={`erp-tab-${index}`}
                aria-controls={`erp-tabpanel-${index}`}
              />
            ))}
          </Tabs>
        </Box>

        {erpComponents.map((component, index) => (
          <TabPanel key={index} value={activeTab} index={index}>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <Typography variant="h5" className="flex items-center">
                  {component.icon}
                  <span className="ml-2">{component.label}</span>
                </Typography>
                <Chip 
                  label={`Modus: ${componentMode === 'create' ? 'Erstellen' : 
                                   componentMode === 'edit' ? 'Bearbeiten' : 'Anzeigen'}`}
                  color={componentMode === 'create' ? 'primary' : 
                         componentMode === 'edit' ? 'secondary' : 'default'}
                />
              </div>
              <Divider className="mb-4" />
            </div>
            {component.component}
          </TabPanel>
        ))}
      </Card>

      <Card className="mt-6">
        <Box className="p-6">
          <Typography variant="h6" className="mb-4">
            Komponenten-Features
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" className="font-semibold mb-2">
                Bestellvorschlag
              </Typography>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Filterung nach Artikel-Gruppe und Niederlassung</li>
                <li>Suche in Artikel-Nummern und Beschreibungen</li>
                <li>Sortierbare Tabelle mit Bestandsanzeige</li>
                <li>Mehrfachauswahl für Bestellerstellung</li>
              </ul>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" className="font-semibold mb-2">
                Bestellung
              </Typography>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Registerkarten für verschiedene Bereiche</li>
                <li>Editierbare Positions-Tabelle</li>
                <li>Validierung aller Pflichtfelder</li>
                <li>Druck- und Löschfunktionen</li>
              </ul>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" className="font-semibold mb-2">
                Lieferanten-Angebot
              </Typography>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Kontaktpersonen-Verwaltung</li>
                <li>Dokumenten-Informationen</li>
                <li>Freitextfelder für Zusatzangaben</li>
                <li>Status-Tracking</li>
              </ul>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" className="font-semibold mb-2">
                Lieferschein
              </Typography>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Liefer- und Rechnungsanschrift</li>
                <li>Verschiedene Lieferoptionen (Checkboxen)</li>
                <li>Editierbare Lieferpositionen</li>
                <li>Rabatt- und Preisberechnung</li>
              </ul>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" className="font-semibold mb-2">
                Auftragsbestätigung
              </Typography>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Navigationsbaum für verschiedene Bereiche</li>
                <li>Kontaktpersonen- und Vertreter-Verwaltung</li>
                <li>Umfassende Kundendaten-Verwaltung</li>
                <li>Status-Management</li>
              </ul>
            </Grid>
          </Grid>
        </Box>
      </Card>
    </div>
  );
};

export default ERPDemo; 