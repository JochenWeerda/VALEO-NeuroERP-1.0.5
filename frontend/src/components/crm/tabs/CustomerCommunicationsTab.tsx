import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent,
  Tabs,
  Tab,
  Button
} from '@mui/material';
import { Customer, CRMSubTab } from '../../../types/crm';
import CustomerWhatsAppHistoryTab from './CustomerWhatsAppHistoryTab';

interface CustomerCommunicationsTabProps {
  customer: Customer;
  currentSubTab: CRMSubTab;
  onSubTabChange: (subTab: CRMSubTab) => void;
}

const CustomerCommunicationsTab: React.FC<CustomerCommunicationsTabProps> = ({
  customer,
  currentSubTab,
  onSubTabChange
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    
    // Map tab index to sub-tab
    switch (newValue) {
      case 0: // E-Mail
        onSubTabChange(CRMSubTab.EMAIL);
        break;
      case 1: // Telefon
        onSubTabChange(CRMSubTab.PHONE);
        break;
      case 2: // WhatsApp
        onSubTabChange(CRMSubTab.WHATSAPP_HISTORY);
        break;
      case 3: // Meeting-Notizen
        onSubTabChange(CRMSubTab.MEETINGS);
        break;
      default:
        break;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // E-Mail
        return (
          <Box className="p-4">
            <Typography variant="h6" className="mb-4 text-gray-800">
              E-Mail-Historie - {customer.name}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              E-Mail-Historie wird implementiert...
            </Typography>
          </Box>
        );
      
      case 1: // Telefon
        return (
          <Box className="p-4">
            <Typography variant="h6" className="mb-4 text-gray-800">
              Telefon-Historie - {customer.name}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Telefon-Historie wird implementiert...
            </Typography>
          </Box>
        );
      
      case 2: // WhatsApp
        return (
          <CustomerWhatsAppHistoryTab
            customer={customer}
            currentSubTab={currentSubTab}
            onSubTabChange={onSubTabChange}
          />
        );
      
      case 3: // Meeting-Notizen
        return (
          <Box className="p-4">
            <Typography variant="h6" className="mb-4 text-gray-800">
              Meeting-Notizen - {customer.name}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Meeting-Notizen werden implementiert...
            </Typography>
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <Box className="space-y-4">
      <Card>
        <CardContent className="p-0">
          {/* Tab Navigation */}
          <Box className="flex justify-center space-x-2 mb-4">
            <Button
              variant="outlined"
              onClick={() => onSubTabChange(CRMSubTab.EMAIL)}
              className="mr-2"
            >
              E-Mail
            </Button>
            <Button
              variant="outlined"
              onClick={() => onSubTabChange(CRMSubTab.PHONE)}
              className="mr-2"
            >
              Telefon
            </Button>
            <Button
              variant="outlined"
              onClick={() => onSubTabChange(CRMSubTab.WHATSAPP_HISTORY)}
              className="mr-2"
            >
              WhatsApp
            </Button>
            <Button
              variant="outlined"
              onClick={() => onSubTabChange(CRMSubTab.MEETINGS)}
            >
              Termine
            </Button>
          </Box>

          {/* Tab Content */}
          {renderTabContent()}
        </CardContent>
      </Card>
    </Box>
  );
};

export default CustomerCommunicationsTab; 