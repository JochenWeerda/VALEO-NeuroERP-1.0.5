import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Box
} from '@mui/material';
import { Business as BusinessIcon } from '@mui/icons-material';
import { CustomerFormData } from '../../../types/crm';

interface CustomerBasicInfoCardProps {
  formData: CustomerFormData;
  isEditing: boolean;
  onFieldChange: (field: keyof CustomerFormData, value: any) => void;
}

export const CustomerBasicInfoCard: React.FC<CustomerBasicInfoCardProps> = ({
  formData,
  isEditing,
  onFieldChange
}) => {
  return (
    <Card>
      <CardContent>
        <Box className="flex items-center mb-4">
          <BusinessIcon className="mr-2 text-gray-600" />
          <Typography variant="h6">Grunddaten</Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Firmenname"
              value={formData.name}
              onChange={(e) => onFieldChange('name', e.target.value)}
              disabled={!isEditing}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Kundennummer"
              value={formData.customerNumber}
              onChange={(e) => onFieldChange('customerNumber', e.target.value)}
              disabled={!isEditing}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Debitorenkonto"
              value={formData.debtorAccount}
              onChange={(e) => onFieldChange('debtorAccount', e.target.value)}
              disabled={!isEditing}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Kundengruppe"
              value={formData.customerGroup}
              onChange={(e) => onFieldChange('customerGroup', e.target.value)}
              disabled={!isEditing}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Vertriebsmitarbeiter"
              value={formData.salesRep}
              onChange={(e) => onFieldChange('salesRep', e.target.value)}
              disabled={!isEditing}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Disponent"
              value={formData.dispatcher}
              onChange={(e) => onFieldChange('dispatcher', e.target.value)}
              disabled={!isEditing}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Zahlungsbedingungen"
              value={formData.paymentTerms}
              onChange={(e) => onFieldChange('paymentTerms', e.target.value)}
              disabled={!isEditing}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}; 