import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { Customer, CRMSubTab } from '../../../types/crm';

interface CustomerExternalStocksTabProps {
  customer: Customer;
  currentSubTab: CRMSubTab;
  onSubTabChange: (subTab: CRMSubTab) => void;
}

const CustomerExternalStocksTab: React.FC<CustomerExternalStocksTabProps> = ({
  customer,
  currentSubTab,
  onSubTabChange
}) => {
  return (
    <Box className="space-y-4">
      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-4 text-gray-800">
            Fremdbestände - {customer.name}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Fremdbestände-Tab wird implementiert...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CustomerExternalStocksTab; 