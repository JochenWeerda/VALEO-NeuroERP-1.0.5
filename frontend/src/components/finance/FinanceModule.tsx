import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Paper,
  Container,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountBalance as AccountBalanceIcon,
  Book as BookIcon,
  Receipt as ReceiptIcon,
  InsertChart as InsertChartIcon
} from '@mui/icons-material';
import AccountList from './AccountList';
import AccountDetail from './AccountDetail';

// Interface für die Tab-Panel-Props
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// TabPanel-Komponente
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`finance-tabpanel-${index}`}
      aria-labelledby={`finance-tab-${index}`}
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

// Hilfsfunktion für Accessibility
const a11yProps = (index: number) => {
  return {
    id: `finance-tab-${index}`,
    'aria-controls': `finance-tabpanel-${index}`,
  };
};

// Hauptkomponente für das Finanzmodul
const FinanceModule: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  
  // Handler für Tab-Wechsel
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handler für Konto-Auswahl
  const handleAccountSelect = (accountId: number) => {
    setSelectedAccountId(accountId);
  };

  // Handler für Zurück-Button von der Konto-Detail-Ansicht
  const handleBackToAccounts = () => {
    setSelectedAccountId(null);
  };

  // Handler für Konto-Bearbeitung
  const handleEditAccount = (accountId: number) => {
    console.log('Bearbeiten des Kontos:', accountId);
    // Hier später die Bearbeitungslogik implementieren
  };

  // Breadcrumbs basierend auf aktuellem Tab und Ansicht
  const renderBreadcrumbs = () => {
    let breadcrumbs;
    
    if (tabValue === 0) {
      breadcrumbs = (
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="#" onClick={() => {}}>
            Finanzen
          </Link>
          <Typography color="text.primary">Dashboard</Typography>
        </Breadcrumbs>
      );
    } else if (tabValue === 1) {
      breadcrumbs = (
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="#" onClick={() => {}}>
            Finanzen
          </Link>
          <Link color="inherit" href="#" onClick={() => setSelectedAccountId(null)}>
            Kontenplan
          </Link>
          {selectedAccountId && (
            <Typography color="text.primary">Kontodetails</Typography>
          )}
        </Breadcrumbs>
      );
    } else if (tabValue === 2) {
      breadcrumbs = (
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="#" onClick={() => {}}>
            Finanzen
          </Link>
          <Typography color="text.primary">Buchungen</Typography>
        </Breadcrumbs>
      );
    } else if (tabValue === 3) {
      breadcrumbs = (
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="#" onClick={() => {}}>
            Finanzen
          </Link>
          <Typography color="text.primary">Belege</Typography>
        </Breadcrumbs>
      );
    } else if (tabValue === 4) {
      breadcrumbs = (
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="#" onClick={() => {}}>
            Finanzen
          </Link>
          <Typography color="text.primary">Berichte</Typography>
        </Breadcrumbs>
      );
    }
    
    return (
      <Box sx={{ mb: 2 }}>
        {breadcrumbs}
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Finanzmodul
      </Typography>
      
      {renderBreadcrumbs()}
      
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<DashboardIcon />} label="Dashboard" {...a11yProps(0)} />
            <Tab icon={<AccountBalanceIcon />} label="Kontenplan" {...a11yProps(1)} />
            <Tab icon={<BookIcon />} label="Buchungen" {...a11yProps(2)} />
            <Tab icon={<ReceiptIcon />} label="Belege" {...a11yProps(3)} />
            <Tab icon={<InsertChartIcon />} label="Berichte" {...a11yProps(4)} />
          </Tabs>
        </Box>
        
        {/* Dashboard Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6">Finanz-Dashboard</Typography>
          <Box sx={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              Dashboard-Komponente wird hier integriert
            </Typography>
          </Box>
        </TabPanel>
        
        {/* Kontenplan Tab */}
        <TabPanel value={tabValue} index={1}>
          {selectedAccountId ? (
            <AccountDetail 
              accountId={selectedAccountId} 
              onBack={handleBackToAccounts}
              onEdit={handleEditAccount}
            />
          ) : (
            <AccountList />
          )}
        </TabPanel>
        
        {/* Buchungen Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6">Buchungen</Typography>
          <Box sx={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              Buchungs-Komponente wird hier integriert
            </Typography>
          </Box>
        </TabPanel>
        
        {/* Belege Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6">Belege</Typography>
          <Box sx={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              Beleg-Komponente wird hier integriert
            </Typography>
          </Box>
        </TabPanel>
        
        {/* Berichte Tab */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6">Berichte</Typography>
          <Box sx={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              Bericht-Komponente wird hier integriert
            </Typography>
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default FinanceModule; 