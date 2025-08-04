import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import {
  ShoppingCart as OrderIcon,
  People as ContactIcon,
  LocalShipping as DeliveryIcon,
  Assessment as ReportIcon
} from '@mui/icons-material';

interface ZvooveNavigationProps {
  activeTab: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}

export const ZvooveNavigation: React.FC<ZvooveNavigationProps> = ({
  activeTab,
  onTabChange
}) => {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs 
        value={activeTab} 
        onChange={onTabChange}
        aria-label="Zvoove navigation tabs"
      >
        <Tab 
          icon={<OrderIcon />} 
          label="Bestellungen" 
          iconPosition="start"
        />
        <Tab 
          icon={<ContactIcon />} 
          label="Kontakte" 
          iconPosition="start"
        />
        <Tab 
          icon={<DeliveryIcon />} 
          label="Lieferungen" 
          iconPosition="start"
        />
        <Tab 
          icon={<ReportIcon />} 
          label="Reports" 
          iconPosition="start"
        />
      </Tabs>
    </Box>
  );
};

export default ZvooveNavigation;