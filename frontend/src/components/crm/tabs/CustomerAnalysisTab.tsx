import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { Customer, CRMSubTab } from '../../../types/crm';

interface CustomerAnalysisTabProps {
  customer: Customer;
  currentSubTab: CRMSubTab;
  onSubTabChange: (subTab: CRMSubTab) => void;
}

const CustomerAnalysisTab: React.FC<CustomerAnalysisTabProps> = ({
  customer,
  currentSubTab,
  onSubTabChange
}) => {
  return (
    <Box className="space-y-4">
      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-4 text-gray-800">
            Analyse - {customer.name}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Analyse-Tab wird implementiert...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CustomerAnalysisTab; 