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
import { neuroFlowColors, neuroFlowTypography } from '../../../design-system/NeuroFlowTheme';

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
  // NeuroFlow Border Radius Standards
  const neuroFlowBorderRadius = {
    small: '4px',
    medium: '6px', 
    large: '8px',
    xlarge: '12px'
  };

  // NeuroFlow Form Field Styles
  const neuroFlowFormStyles = {
    '& .MuiTextField-root': {
      '& .MuiOutlinedInput-root': {
        borderRadius: neuroFlowBorderRadius.large,
        backgroundColor: neuroFlowColors.surface.primary,
        '&:hover': {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: neuroFlowColors.primary[300]
          }
        },
        '&.Mui-focused': {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: neuroFlowColors.primary[500]
          }
        },
        '&.Mui-disabled': {
          backgroundColor: neuroFlowColors.neutral[100]
        }
      },
      '& .MuiInputLabel-root': {
        color: neuroFlowColors.neutral[600],
        fontFamily: neuroFlowTypography.fontFamily,
        fontSize: neuroFlowTypography.body1.fontSize,
        fontWeight: neuroFlowTypography.body1.fontWeight
      },
      '& .MuiFormHelperText-root': {
        fontFamily: neuroFlowTypography.fontFamily,
        fontSize: neuroFlowTypography.body2.fontSize,
        fontWeight: neuroFlowTypography.body2.fontWeight
      }
    }
  };

  return (
    <Card 
      sx={{
        borderRadius: neuroFlowBorderRadius.xlarge,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: `1px solid ${neuroFlowColors.neutral[200]}`
      }}
    >
      <CardContent sx={{ padding: '24px' }}>
        <Box 
          className="flex items-center mb-4"
          sx={{ 
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: `1px solid ${neuroFlowColors.neutral[200]}`
          }}
        >
          <BusinessIcon 
            sx={{ 
              marginRight: '12px',
              color: neuroFlowColors.primary[500],
              fontSize: '24px'
            }} 
          />
          <Typography 
            variant="h6"
            sx={{
              fontFamily: neuroFlowTypography.fontFamily,
              fontSize: neuroFlowTypography.h6.fontSize,
              fontWeight: neuroFlowTypography.h6.fontWeight,
              color: neuroFlowColors.neutral[800]
            }}
          >
            Grunddaten
          </Typography>
        </Box>
        
        <Grid container spacing={3} sx={neuroFlowFormStyles}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Firmenname"
              value={formData.name}
              onChange={(e) => onFieldChange('name', e.target.value)}
              disabled={!isEditing}
              inputProps={{
                'aria-label': 'Firmenname eingeben',
                'aria-describedby': 'firmenname-helper-text'
              }}
              FormHelperTextProps={{
                id: 'firmenname-helper-text'
              }}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Kundennummer"
              value={formData.customerNumber}
              onChange={(e) => onFieldChange('customerNumber', e.target.value)}
              disabled={!isEditing}
              inputProps={{
                'aria-label': 'Kundennummer eingeben',
                'aria-describedby': 'kundennummer-helper-text'
              }}
              FormHelperTextProps={{
                id: 'kundennummer-helper-text'
              }}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Debitorenkonto"
              value={formData.debtorAccount}
              onChange={(e) => onFieldChange('debtorAccount', e.target.value)}
              disabled={!isEditing}
              inputProps={{
                'aria-label': 'Debitorenkonto eingeben',
                'aria-describedby': 'debitorenkonto-helper-text'
              }}
              FormHelperTextProps={{
                id: 'debitorenkonto-helper-text'
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Kundengruppe"
              value={formData.customerGroup}
              onChange={(e) => onFieldChange('customerGroup', e.target.value)}
              disabled={!isEditing}
              inputProps={{
                'aria-label': 'Kundengruppe eingeben',
                'aria-describedby': 'kundengruppe-helper-text'
              }}
              FormHelperTextProps={{
                id: 'kundengruppe-helper-text'
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Vertriebsmitarbeiter"
              value={formData.salesRep}
              onChange={(e) => onFieldChange('salesRep', e.target.value)}
              disabled={!isEditing}
              inputProps={{
                'aria-label': 'Vertriebsmitarbeiter eingeben',
                'aria-describedby': 'vertriebsmitarbeiter-helper-text'
              }}
              FormHelperTextProps={{
                id: 'vertriebsmitarbeiter-helper-text'
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Disponent"
              value={formData.dispatcher}
              onChange={(e) => onFieldChange('dispatcher', e.target.value)}
              disabled={!isEditing}
              inputProps={{
                'aria-label': 'Disponent eingeben',
                'aria-describedby': 'disponent-helper-text'
              }}
              FormHelperTextProps={{
                id: 'disponent-helper-text'
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Zahlungsbedingungen"
              value={formData.paymentTerms}
              onChange={(e) => onFieldChange('paymentTerms', e.target.value)}
              disabled={!isEditing}
              inputProps={{
                'aria-label': 'Zahlungsbedingungen eingeben',
                'aria-describedby': 'zahlungsbedingungen-helper-text'
              }}
              FormHelperTextProps={{
                id: 'zahlungsbedingungen-helper-text'
              }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}; 