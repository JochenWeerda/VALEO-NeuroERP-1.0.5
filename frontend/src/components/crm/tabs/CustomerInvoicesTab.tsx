import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { Customer, CRMSubTab } from '../../../types/crm';

interface CustomerInvoicesTabProps {
  customer: Customer;
  currentSubTab: CRMSubTab;
  onSubTabChange: (subTab: CRMSubTab) => void;
}

const CustomerInvoicesTab: React.FC<CustomerInvoicesTabProps> = ({
  customer,
  currentSubTab,
  onSubTabChange
}) => {
  return (
    <Box className="space-y-4">
      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-4 text-gray-800">
            Rechnungen - {customer.name}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Rechnungen-Tab wird implementiert...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CustomerInvoicesTab; 