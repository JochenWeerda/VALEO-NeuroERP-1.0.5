import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { Customer, CRMSubTab } from '../../../types/crm';

interface CustomerDirectBusinessTabProps {
  customer: Customer;
  currentSubTab: CRMSubTab;
  onSubTabChange: (subTab: CRMSubTab) => void;
}

const CustomerDirectBusinessTab: React.FC<CustomerDirectBusinessTabProps> = ({
  customer,
  currentSubTab,
  onSubTabChange
}) => {
  return (
    <Box className="space-y-4">
      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-4 text-gray-800">
            Streckengeschäfte - {customer.name}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Streckengeschäfte-Tab wird implementiert...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CustomerDirectBusinessTab; 