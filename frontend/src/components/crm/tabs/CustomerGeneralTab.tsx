import React, { useState } from 'react';
import {
  Box,
  Grid,
  Button,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { Customer, CustomerSegment, CustomerFormData, mapApiCustomerToFormData, mapFormDataToApiCustomer, getInitialCustomerFormData } from '../../../types/crm';
import { useUpdateCustomer } from '../../../hooks/useCRM';
import { CustomerBasicInfoCard } from '../customers/CustomerBasicInfoCard';
import { CustomerAddressCard } from '../customers/CustomerAddressCard';
import { CustomerContactCard } from '../customers/CustomerContactCard';

interface CustomerGeneralTabProps {
  customer: Customer;
  currentSubTab?: string;
  onSubTabChange?: (subTab: string) => void;
  onCustomerChange?: (customer: Customer) => void;
}

const CustomerGeneralTab: React.FC<CustomerGeneralTabProps> = ({
  customer,
  onCustomerChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>(() => 
    mapApiCustomerToFormData(customer)
  );

  const updateCustomerMutation = useUpdateCustomer();

  const handleEdit = () => {
    setIsEditing(true);
    setFormData(mapApiCustomerToFormData(customer));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(mapApiCustomerToFormData(customer));
  };

  const handleSave = async () => {
    try {
      const updatedCustomer = await updateCustomerMutation.mutateAsync({
        id: customer.id,
        data: mapFormDataToApiCustomer(formData, customer.id)
      });
      
      onCustomerChange?.(updatedCustomer);
      setIsEditing(false);
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    }
  };

  const handleFieldChange = (field: keyof CustomerFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getSegmentColor = (segment: CustomerSegment) => {
    switch (segment) {
      case CustomerSegment.PREMIUM:
        return 'success';
      case CustomerSegment.REGULAR:
        return 'primary';
      case CustomerSegment.BASIC:
        return 'default';
      case CustomerSegment.PROSPECT:
        return 'warning';
      case CustomerSegment.INACTIVE:
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'prospect':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (updateCustomerMutation.isPending) {
    return (
      <Box className="flex justify-center items-center h-64">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="space-y-6">
      {/* Header mit Aktionen */}
      <Box className="flex justify-between items-center">
        <Box>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            {customer.name}
          </h2>
          <Box className="flex space-x-2">
            <Chip
              label={customer.status === 'active' ? 'Aktiv' : customer.status === 'inactive' ? 'Inaktiv' : 'Interessent'}
              color={getStatusColor(customer.status)}
              size="small"
            />
            <Chip
              label={customer.customerSegment === CustomerSegment.PREMIUM ? 'Premium' : 
                     customer.customerSegment === CustomerSegment.REGULAR ? 'Standard' :
                     customer.customerSegment === CustomerSegment.BASIC ? 'Basic' :
                     customer.customerSegment === CustomerSegment.PROSPECT ? 'Interessent' : 'Inaktiv'}
              color={getSegmentColor(customer.customerSegment)}
              size="small"
            />
          </Box>
        </Box>
        
        <Box className="flex space-x-2">
          {!isEditing ? (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Bearbeiten
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={updateCustomerMutation.isPending}
              >
                Speichern
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={updateCustomerMutation.isPending}
              >
                Abbrechen
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Fehleranzeige */}
      {updateCustomerMutation.error && (
        <Alert severity="error" className="mb-4">
          Fehler beim Speichern: {updateCustomerMutation.error.message}
        </Alert>
      )}

      {/* Kundeninformationen */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <CustomerBasicInfoCard
            formData={formData}
            isEditing={isEditing}
            onFieldChange={handleFieldChange}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <CustomerAddressCard
            formData={formData}
            isEditing={isEditing}
            onFieldChange={handleFieldChange}
          />
        </Grid>
        
        <Grid item xs={12}>
          <CustomerContactCard
            formData={formData}
            isEditing={isEditing}
            onFieldChange={handleFieldChange}
          />
        </Grid>
      </Grid>

      {/* Zusätzliche Informationen (nur Anzeige) */}
      {!isEditing && (
        <Box className="mt-6">
          <Divider className="mb-4" />
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Finanzielle Übersicht</h3>
                <Box className="space-y-2">
                  <Box className="flex justify-between">
                    <span className="text-gray-600">Gesamtumsatz:</span>
                    <span className="font-semibold">{formatCurrency(customer.totalRevenue)}</span>
                  </Box>
                  <Box className="flex justify-between">
                    <span className="text-gray-600">Kreditlimit:</span>
                    <span className="font-semibold">{formatCurrency(customer.creditLimit)}</span>
                  </Box>
                  <Box className="flex justify-between">
                    <span className="text-gray-600">Kredit ausgenutzt:</span>
                    <span className="font-semibold">{formatCurrency(customer.creditUsed)}</span>
                  </Box>
                  <Box className="flex justify-between">
                    <span className="text-gray-600">Offene Rechnungen:</span>
                    <span className="font-semibold">{customer.openInvoices}</span>
                  </Box>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Letzte Aktivitäten</h3>
                <Box className="space-y-2">
                  <Box className="flex justify-between">
                    <span className="text-gray-600">Letzter Kontakt:</span>
                    <span className="font-semibold">
                      {customer.lastContact ? new Date(customer.lastContact).toLocaleDateString('de-DE') : 'Keine'}
                    </span>
                  </Box>
                  <Box className="flex justify-between">
                    <span className="text-gray-600">Erstellt am:</span>
                    <span className="font-semibold">
                      {new Date(customer.createdAt).toLocaleDateString('de-DE')}
                    </span>
                  </Box>
                  <Box className="flex justify-between">
                    <span className="text-gray-600">Zuletzt aktualisiert:</span>
                    <span className="font-semibold">
                      {new Date(customer.updatedAt).toLocaleDateString('de-DE')}
                    </span>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default CustomerGeneralTab; 