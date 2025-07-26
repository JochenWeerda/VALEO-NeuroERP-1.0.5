import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Box
} from '@mui/material';
import { LocationOn as LocationIcon } from '@mui/icons-material';
import { CustomerFormData } from '../../../types/crm';

interface CustomerAddressCardProps {
  formData: CustomerFormData;
  isEditing: boolean;
  onFieldChange: (field: keyof CustomerFormData, value: any) => void;
}

export const CustomerAddressCard: React.FC<CustomerAddressCardProps> = ({
  formData,
  isEditing,
  onFieldChange
}) => {
  return (
    <Card>
      <CardContent>
        <Box className="flex items-center mb-4">
          <LocationIcon className="mr-2 text-gray-600" />
          <Typography variant="h6">Adressdaten</Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Straße"
              value={formData.street}
              onChange={(e) => onFieldChange('street', e.target.value)}
              disabled={!isEditing}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="PLZ"
              value={formData.zipCode}
              onChange={(e) => onFieldChange('zipCode', e.target.value)}
              disabled={!isEditing}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Stadt"
              value={formData.city}
              onChange={(e) => onFieldChange('city', e.target.value)}
              disabled={!isEditing}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Postfach"
              value={formData.postBox || ''}
              onChange={(e) => onFieldChange('postBox', e.target.value)}
              disabled={!isEditing}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Land"
              value={formData.country || ''}
              onChange={(e) => onFieldChange('country', e.target.value)}
              disabled={!isEditing}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Bundesland"
              value={formData.state || ''}
              onChange={(e) => onFieldChange('state', e.target.value)}
              disabled={!isEditing}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}; 