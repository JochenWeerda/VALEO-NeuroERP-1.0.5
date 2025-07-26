import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Button,
  IconButton,
  Chip
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { CRMMainTab, CRMSubTab, CRMTabConfig, Customer, CustomerSegment } from '../../types/crm';
import { useCustomer } from '../../hooks/useCRM';

// Tab Components
import CustomerGeneralTab from './tabs/CustomerGeneralTab';
import CustomerContactsTab from './tabs/CustomerContactsTab';
import CustomerSalesTab from './tabs/CustomerSalesTab';
import CustomerOrdersTab from './tabs/CustomerOrdersTab';
import CustomerInvoicesTab from './tabs/CustomerInvoicesTab';
import CustomerDocumentsTab from './tabs/CustomerDocumentsTab';
import CustomerAnalysisTab from './tabs/CustomerAnalysisTab';
import CustomerDirectBusinessTab from './tabs/CustomerDirectBusinessTab';
import CustomerExternalStocksTab from './tabs/CustomerExternalStocksTab';
import CustomerCommunicationsTab from './tabs/CustomerCommunicationsTab';
import CustomerWhatsAppHistoryTab from './tabs/CustomerWhatsAppHistoryTab';
import { CustomerWhatsAppWebTab } from './tabs/CustomerWhatsAppWebTab';
import SupplierManagementTab from './tabs/SupplierManagementTab';

// Icons
import PersonIcon from '@mui/icons-material/Person';
import ContactsIcon from '@mui/icons-material/Contacts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ChatIcon from '@mui/icons-material/Chat';
import DescriptionIcon from '@mui/icons-material/Description';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import BusinessIcon from '@mui/icons-material/Business';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

import CRMRibbon from './CRMRibbon';
import CRMContextMenu from './CRMContextMenu';

interface CRMMainViewProps {
  customerId?: string;
  initialTab?: CRMMainTab;
  initialSubTab?: CRMSubTab;
  onCustomerChange?: (customer: Customer) => void;
  onTabChange?: (mainTab: CRMMainTab, subTab: CRMSubTab) => void;
  onBack?: () => void;
}

const CRMMainView: React.FC<CRMMainViewProps> = ({
  customerId,
  initialTab = CRMMainTab.GENERAL,
  initialSubTab = CRMSubTab.BASIC_INFO,
  onCustomerChange,
  onTabChange,
  onBack
}) => {
  const [currentMainTab, setCurrentMainTab] = useState<CRMMainTab>(initialTab);
  const [currentSubTab, setCurrentSubTab] = useState<CRMSubTab>(initialSubTab);

  // API Hook für Kundendaten
  const { 
    data: customer, 
    isLoading, 
    error, 
    refetch 
  } = useCustomer(customerId || '');

  // Tab-Konfiguration
  const tabConfig: CRMTabConfig[] = [
    {
      id: CRMMainTab.GENERAL,
      label: 'Allgemein',
      icon: <PersonIcon />,
      component: CustomerGeneralTab,
      subTabs: [],
      isEnabled: true,
      isVisible: true,
      order: 1
    },
    {
      id: CRMMainTab.CONTACTS,
      label: 'Kontakte',
      icon: <ContactsIcon />,
      component: CustomerContactsTab,
      subTabs: [],
      isEnabled: true,
      isVisible: true,
      order: 2
    },
    {
      id: CRMMainTab.SALES,
      label: 'Vertrieb',
      icon: <TrendingUpIcon />,
      component: CustomerSalesTab,
      subTabs: [],
      isEnabled: true,
      isVisible: true,
      order: 3
    },
    {
      id: CRMMainTab.ORDERS,
      label: 'Aufträge',
      icon: <ShoppingCartIcon />,
      component: CustomerOrdersTab,
      subTabs: [],
      isEnabled: true,
      isVisible: true,
      order: 4
    },
    {
      id: CRMMainTab.INVOICES,
      label: 'Rechnungen',
      icon: <ReceiptIcon />,
      component: CustomerInvoicesTab,
      subTabs: [],
      isEnabled: true,
      isVisible: true,
      order: 5
    },
    {
      id: CRMMainTab.COMMUNICATIONS,
      label: 'Kommunikation',
      icon: <ChatIcon />,
      component: CustomerCommunicationsTab,
      subTabs: [
        { id: CRMSubTab.EMAIL, label: 'E-Mail' },
        { id: CRMSubTab.PHONE, label: 'Telefon' },
        { id: CRMSubTab.WHATSAPP_HISTORY, label: 'WhatsApp' },
        { id: CRMSubTab.MEETINGS, label: 'Termine' }
      ],
      isEnabled: true,
      isVisible: true,
      order: 6
    },
    {
      id: CRMMainTab.DOCUMENTS,
      label: 'Dokumente',
      icon: <DescriptionIcon />,
      component: CustomerDocumentsTab,
      subTabs: [],
      isEnabled: true,
      isVisible: true,
      order: 7
    },
    {
      id: CRMMainTab.ANALYSIS,
      label: 'Analyse',
      icon: <AnalyticsIcon />,
      component: CustomerAnalysisTab,
      subTabs: [],
      isEnabled: true,
      isVisible: true,
      order: 8
    },
    {
      id: CRMMainTab.DIRECT_BUSINESS,
      label: 'Streckengeschäft',
      icon: <BusinessIcon />,
      component: CustomerDirectBusinessTab,
      subTabs: [],
      isEnabled: true,
      isVisible: true,
      order: 9
    },
    {
      id: CRMMainTab.EXTERNAL_STOCKS,
      label: 'Fremdbestände',
      icon: <InventoryIcon />,
      component: CustomerExternalStocksTab,
      subTabs: [],
      isEnabled: true,
      isVisible: true,
      order: 10
    },
    {
      id: CRMMainTab.SUPPLIERS,
      label: 'Lieferanten',
      icon: <LocalShippingIcon />,
      component: SupplierManagementTab,
      subTabs: [],
      isEnabled: true,
      isVisible: true,
      order: 11
    },
    {
      id: CRMMainTab.WHATSAPP_WEB,
      label: 'WhatsApp Web',
      icon: <WhatsAppIcon />,
      component: CustomerWhatsAppWebTab,
      subTabs: [],
      isEnabled: true,
      isVisible: true,
      order: 12
    }
  ];

  // Sortiere Tabs nach Reihenfolge
  const sortedTabs = tabConfig.sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleMainTabChange = (event: React.SyntheticEvent, newValue: CRMMainTab) => {
    setCurrentMainTab(newValue);
    // Setze den ersten verfügbaren Sub-Tab
    const tab = sortedTabs.find(t => t.id === newValue);
    if (tab && tab.subTabs.length > 0) {
      setCurrentSubTab(tab.subTabs[0].id);
    }
    onTabChange?.(newValue, currentSubTab);
  };

  const handleSubTabChange = (subTab: CRMSubTab) => {
    setCurrentSubTab(subTab);
    onTabChange?.(currentMainTab, subTab);
  };

  const renderTabContent = () => {
    if (isLoading) {
      return (
        <Box className="flex justify-center items-center h-64">
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" className="m-4">
          Fehler beim Laden der Kundendaten: {error.message}
        </Alert>
      );
    }

    if (!customer) {
      return (
        <Alert severity="warning" className="m-4">
          Keine Kundendaten gefunden.
        </Alert>
      );
    }

    const currentTab = sortedTabs.find(tab => tab.id === currentMainTab);
    if (!currentTab) {
      return (
        <Alert severity="error" className="m-4">
          Tab nicht gefunden.
        </Alert>
      );
    }

    const TabComponent = currentTab.component;
    return (
      <TabComponent 
        customer={customer}
        currentSubTab={currentSubTab}
        onSubTabChange={handleSubTabChange}
        onCustomerChange={onCustomerChange}
      />
    );
  };

  const getCurrentTab = () => sortedTabs.find(tab => tab.id === currentMainTab);

  return (
    <Box className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <Paper className="p-4 shadow-sm">
        <Box className="flex items-center justify-between mb-4">
          <Box className="flex items-center">
            {onBack && (
              <IconButton onClick={onBack} className="mr-2">
                <ArrowBackIcon />
              </IconButton>
            )}
            <Box>
              <Typography variant="h5" className="text-gray-800">
                {customer?.name || 'Kunde wird geladen...'}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                {customer?.customerNumber && `Kundennummer: ${customer.customerNumber}`}
              </Typography>
            </Box>
          </Box>
          <Box className="flex items-center gap-2">
            {customer && (
              <>
                <Chip
                  label={customer.status === 'active' ? 'Aktiv' : customer.status === 'inactive' ? 'Inaktiv' : 'Interessent'}
                  color={customer.status === 'active' ? 'success' : customer.status === 'inactive' ? 'error' : 'warning'}
                  size="small"
                />
                <Chip
                  label={customer.customerSegment === CustomerSegment.PREMIUM ? 'Premium' : 
                         customer.customerSegment === CustomerSegment.REGULAR ? 'Standard' :
                         customer.customerSegment === CustomerSegment.BASIC ? 'Basic' :
                         customer.customerSegment === CustomerSegment.PROSPECT ? 'Interessent' : 'Inaktiv'}
                  color={customer.customerSegment === CustomerSegment.PREMIUM ? 'primary' : 
                         customer.customerSegment === CustomerSegment.REGULAR ? 'success' : 'default'}
                  size="small"
                />
              </>
            )}
            <Button
              variant="outlined"
              size="small"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              Aktualisieren
            </Button>
          </Box>
        </Box>

        {/* Ribbon */}
        {customer && (
          <CRMRibbon 
            currentTab={currentMainTab}
            currentSubTab={currentSubTab}
            customer={customer}
          />
        )}
      </Paper>

      {/* Tabs */}
      <Paper className="flex-1 flex flex-col">
        <Tabs
          value={currentMainTab}
          onChange={handleMainTabChange}
          variant="scrollable"
          scrollButtons="auto"
          className="border-b border-gray-200"
        >
          {sortedTabs.map((tab) => (
            <Tab
              key={tab.id}
              value={tab.id}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              disabled={!tab.isEnabled}
              className="min-w-0"
            />
          ))}
        </Tabs>

        {/* Tab Content */}
        <Box className="flex-1 overflow-auto">
          {renderTabContent()}
        </Box>
      </Paper>

      {/* Context Menu */}
      <CRMContextMenu 
        currentTab={currentMainTab}
        currentSubTab={currentSubTab}
        customer={customer}
      />
    </Box>
  );
};

export default CRMMainView; 