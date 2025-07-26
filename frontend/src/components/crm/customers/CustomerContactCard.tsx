import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Box
} from '@mui/material';
import { 
  Phone as PhoneIcon, 
  Email as EmailIcon, 
  WhatsApp as WhatsAppIcon 
} from '@mui/icons-material';
import { CustomerFormData } from '../../../types/crm';

interface CustomerContactCardProps {
  formData: CustomerFormData;
  isEditing: boolean;
  onFieldChange: (field: keyof CustomerFormData, value: any) => void;
}

export const CustomerContactCard: React.FC<CustomerContactCardProps> = ({
  formData,
  isEditing,
  onFieldChange
}) => {
  return (
    <Card>
      <CardContent>
        <Box className="flex items-center mb-4">
          <PhoneIcon className="mr-2 text-gray-600" />
          <Typography variant="h6">Kontaktdaten</Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Telefon"
              value={formData.phone}
              onChange={(e) => onFieldChange('phone', e.target.value)}
              disabled={!isEditing}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Fax"
              value={formData.fax || ''}
              onChange={(e) => onFieldChange('fax', e.target.value)}
              disabled={!isEditing}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="E-Mail"
              type="email"
              value={formData.email || ''}
              onChange={(e) => onFieldChange('email', e.target.value)}
              disabled={!isEditing}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Homepage"
              value={formData.homepage || ''}
              onChange={(e) => onFieldChange('homepage', e.target.value)}
              disabled={!isEditing}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="WhatsApp"
              value={formData.skype || ''} // Mapping von skype zu whatsapp
              onChange={(e) => onFieldChange('skype', e.target.value)}
              disabled={!isEditing}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Skype"
              value={formData.skype || ''}
              onChange={(e) => onFieldChange('skype', e.target.value)}
              disabled={!isEditing}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="LinkedIn"
              value={formData.linkedin || ''}
              onChange={(e) => onFieldChange('linkedin', e.target.value)}
              disabled={!isEditing}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Twitter"
              value={formData.twitter || ''}
              onChange={(e) => onFieldChange('twitter', e.target.value)}
              disabled={!isEditing}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}; 