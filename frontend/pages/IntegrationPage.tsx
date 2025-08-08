import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Box,
  Alert,
  CircularProgress,
  Paper,
  Button,
  Chip,
  CardActions
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  LocalShipping as DeliveryIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useErpStore } from '../store/erpStore';
import { OrderForm } from '../components/zvoove-integration/ZvooveOrderForm';
import { ContactOverview } from '../components/zvoove-integration/ZvooveContactOverview';
import { Navigation } from '../components/zvoove-integration/Navigation';

// TypeScript Interfaces
interface IntegrationPageProps {
  initialTab?: 'orders' | 'contacts' | 'deliveries';
}

interface ContactFilters {
  contactType: 'all' | 'sales' | 'purchase';
  sortBy: 'contactNumber' | 'name' | 'date' | 'representative';
  sortOrder: 'asc' | 'desc';
  representative: string;
  dateRange: { from: any; to: any };
  parity: string;
  onlyPlannedAppointments: boolean;
  articleSumsInPrint: boolean;
  searchText: string;
  contactNumber: string;
}

interface OrderData {
  // Belegdaten
  customerNumber: string;
  debtorNumber: string;
  documentDate: Date;
  contactPerson: string;
  
  // Positionen
  positions: OrderPosition[];
  
  // Summen
  netAmount: number;
  vatAmount: number;
  totalAmount: number;
}

interface OrderPosition {
  id: string;
  articleNumber: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  netPrice: number;
}

type NavigationTab = 'orders' | 'contacts' | 'deliveries';

// TabPanel Component
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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
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

export const IntegrationPage: React.FC<IntegrationPageProps> = ({
  initialTab = 'orders'
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [navigationTab, setNavigationTab] = useState<'ALLGEMEIN' | 'ERFASSUNG' | 'ABRECHNUNG' | 'LAGER' | 'PRODUKTION' | 'AUSWERTUNG'>('ERFASSUNG');
  
  // Store Hooks
  const {
    orders,
    contacts,
    loading,
    error,
    fetchOrders,
    fetchContacts,
    createOrder,
    clearError
  } = useErpStore();

  // Contact Filters
  const [contactFilters, setContactFilters] = useState<ContactFilters>({
    contactType: 'all',
    sortBy: 'contactNumber',
    sortOrder: 'asc',
    representative: '',
    dateRange: { from: null, to: null },
    parity: '',
    onlyPlannedAppointments: false,
    articleSumsInPrint: false,
    searchText: '',
    contactNumber: ''
  });

  // Initial Data laden
  useEffect(() => {
    fetchOrders();
    fetchContacts();
  }, []);

  // Tab ändern
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Navigation Tab ändern
  const handleNavigationTabChange = (tab: 'ALLGEMEIN' | 'ERFASSUNG' | 'ABRECHNUNG' | 'LAGER' | 'PRODUKTION' | 'AUSWERTUNG') => {
    setNavigationTab(tab);
  };

  // Sub-Item klicken
  const handleSubItemClick = (subItem: any) => {
    console.log('Sub-Item geklickt:', subItem);
    // Hier könnte Navigation zu spezifischen Seiten erfolgen
  };

  // Order speichern
  const handleOrderSave = async (orderData: OrderData) => {
    try {
      await createOrder(orderData);
      console.log('Auftrag erfolgreich erstellt:', orderData);
    } catch (error) {
      console.error('Fehler beim Erstellen des Auftrags:', error);
    }
  };

  // Order abbrechen
  const handleOrderCancel = () => {
    console.log('Auftragserfassung abgebrochen');
  };

  // Contact Filter ändern
  const handleContactFilterChange = (newFilters: ContactFilters) => {
    setContactFilters(newFilters);
    fetchContacts();
  };

  // Statistiken berechnen
  const orderStats = {
    total: orders.length,
    byType: {
      offer: orders.filter(order => order.status === 'offer').length,
      order: orders.filter(order => order.status === 'order').length
    },
    totalAmount: orders.reduce((sum, order) => sum + order.totalAmount, 0)
  };
  const contactStats = {
    total: contacts.length,
    byType: {
      sales: contacts.filter(contact => contact.contactType === 'sales').length,
      purchase: contacts.filter(contact => contact.contactType === 'purchase').length
    },
    totalOrderQuantity: contacts.reduce((sum, contact) => sum + contact.totalOrderQuantity, 0),
    totalRemainingQuantity: contacts.reduce((sum, contact) => sum + contact.totalRemainingQuantity, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation
        activeTab={navigationTab}
        onTabChange={handleNavigationTabChange}
        onSubItemClick={handleSubItemClick}
      />

      <Container maxWidth="xl" className="py-8">
        {/* Header */}
        <Box className="mb-8">
          <Typography variant="h4" className="text-gray-800 font-bold mb-2">
            zvoove Handel Integration
          </Typography>
          <Typography variant="body1" className="text-gray-600">
            Vollständige Integration mit dem Warenwirtschaftssystem zvoove Handel
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            className="mb-6"
            onClose={clearError}
          >
            {error}
          </Alert>
        )}

        {/* Loading Indicator */}
        {loading && (
          <Box className="flex justify-center items-center py-8">
            <CircularProgress />
          </Box>
        )}

        {/* Statistiken */}
        <Grid container spacing={3} className="mb-8">
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" className="text-gray-700 mb-2">
                  Aufträge
                </Typography>
                <Typography variant="h4" className="text-blue-600 font-bold">
                  {orderStats.total}
                </Typography>
                <Box className="flex space-x-2 mt-2">
                  <Chip label={`${orderStats.byType.offer} Angebote`} size="small" color="primary" variant="outlined" />
                  <Chip label={`${orderStats.byType.order} Aufträge`} size="small" color="success" variant="outlined" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" className="text-gray-700 mb-2">
                  Kontakte
                </Typography>
                <Typography variant="h4" className="text-green-600 font-bold">
                  {contactStats.total}
                </Typography>
                <Box className="flex space-x-2 mt-2">
                  <Chip label={`${contactStats.byType.sales} Verkauf`} size="small" color="success" variant="outlined" />
                  <Chip label={`${contactStats.byType.purchase} Einkauf`} size="small" color="warning" variant="outlined" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" className="text-gray-700 mb-2">
                  Gesamtumsatz
                </Typography>
                <Typography variant="h4" className="text-purple-600 font-bold">
                  {orderStats.totalAmount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </Typography>
                <Typography variant="body2" className="text-gray-600 mt-1">
                  Alle Aufträge
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" className="text-gray-700 mb-2">
                  Bestellmenge
                </Typography>
                <Typography variant="h4" className="text-orange-600 font-bold">
                  {contactStats.totalOrderQuantity.toLocaleString()}
                </Typography>
                <Typography variant="body2" className="text-gray-600 mt-1">
                  Rest: {contactStats.totalRemainingQuantity.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Hauptinhalt */}
        <Paper className="shadow-lg">
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            className="border-b border-gray-200"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab 
              icon={<AssignmentIcon />} 
              label="Auftragserfassung" 
              className="flex items-center space-x-2"
            />
            <Tab 
              icon={<PeopleIcon />} 
              label="Kontaktübersicht" 
              className="flex items-center space-x-2"
            />
            <Tab 
              icon={<DeliveryIcon />} 
              label="Lieferungen" 
              className="flex items-center space-x-2"
            />
            <Tab 
              icon={<AssessmentIcon />} 
              label="Auswertungen" 
              className="flex items-center space-x-2"
            />
          </Tabs>

          {/* Auftragserfassung */}
          <TabPanel value={activeTab} index={0}>
            <OrderForm
              mode="order"
              onSave={handleOrderSave}
              onCancel={handleOrderCancel}
            />
          </TabPanel>

          {/* Kontaktübersicht */}
          <TabPanel value={activeTab} index={1}>
            <ContactOverview
              filters={contactFilters}
              onFilterChange={handleContactFilterChange}
              contacts={contacts}
              loading={loading}
            />
          </TabPanel>

          {/* Lieferungen */}
          <TabPanel value={activeTab} index={2}>
            <Box className="text-center py-12">
              <Typography variant="h6" className="text-gray-600 mb-4">
                Lieferungserfassung
              </Typography>
              <Typography variant="body1" className="text-gray-500">
                Die Lieferungserfassung wird in einer separaten Komponente implementiert.
              </Typography>
              <Button 
                variant="contained" 
                className="mt-4"
                onClick={() => console.log('Lieferungserfassung öffnen')}
              >
                Lieferung erstellen
              </Button>
            </Box>
          </TabPanel>

          {/* Auswertungen */}
          <TabPanel value={activeTab} index={3}>
            <Box className="text-center py-12">
              <Typography variant="h6" className="text-gray-600 mb-4">
                Auswertungen und Berichte
              </Typography>
              <Typography variant="body1" className="text-gray-500">
                Hier werden verschiedene Auswertungen und Berichte angezeigt.
              </Typography>
              <Grid container spacing={3} className="mt-6">
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" className="mb-2">
                        Auftragsstatistiken
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                        Detaillierte Auswertung der Aufträge nach verschiedenen Kriterien.
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" color="primary">
                        Bericht anzeigen
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" className="mb-2">
                        Kontaktstatistiken
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                        Analyse der Kontakte und deren Aktivitäten.
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" color="primary">
                        Bericht anzeigen
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
        </Paper>

        {/* Footer */}
        <Box className="mt-8 text-center">
          <Typography variant="body2" className="text-gray-500">
            zvoove Handel Integration v2.0.1 | Powered by VALEO NeuroERP
          </Typography>
        </Box>
      </Container>
    </div>
  );
}; 