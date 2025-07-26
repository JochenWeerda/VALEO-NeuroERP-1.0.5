import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { Customer, CRMSubTab } from '../../../types/crm';

interface CustomerOrdersTabProps {
  customer: Customer;
  currentSubTab: CRMSubTab;
  onSubTabChange: (subTab: CRMSubTab) => void;
}

const CustomerOrdersTab: React.FC<CustomerOrdersTabProps> = ({
  customer,
  currentSubTab,
  onSubTabChange
}) => {
  return (
    <Box className="space-y-4">
      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-4 text-gray-800">
            Aufträge - {customer.name}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Aufträge-Tab wird implementiert...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CustomerOrdersTab; 