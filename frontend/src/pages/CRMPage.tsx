import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Avatar,
  Badge
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon
} from '@mui/icons-material';
import { useCustomers } from '../hooks/useCRM';
import { Customer, CustomerSegment } from '../types/crm';
import CRMMainView from '../components/crm/CRMMainView';

const CRMPage: React.FC = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});

  // API Hooks
  const {
    data: customers = [],
    isLoading,
    error,
    refetch
  } = useCustomers(filters);

  // Mock search mutation
  const searchMutation = {
    mutateAsync: async (term: string) => {
      return customers?.filter(customer => 
        customer.name.toLowerCase().includes(term.toLowerCase()) ||
        customer.customerNumber.toLowerCase().includes(term.toLowerCase())
      ) || [];
    },
    isPending: false
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        const results = await searchMutation.mutateAsync(searchTerm);
        // Die Suche wird über den Service-Layer abgewickelt
        // Die Ergebnisse werden automatisch in den Cache geschrieben
      } catch (error) {
        console.error('Suchfehler:', error);
      }
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const getCustomerStatusColor = (status: string) => {
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

  const getSegmentColor = (segment: CustomerSegment) => {
    switch (segment) {
      case CustomerSegment.PREMIUM:
        return 'primary';
      case CustomerSegment.REGULAR:
        return 'success';
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (selectedCustomer) {
    return (
            <CRMMainView 
        customerId={selectedCustomer.id} 
        onCustomerChange={(customer) => setSelectedCustomer(customer)}
      />
    );
  }

  return (
    <Box className="p-6 bg-gray-50 min-h-screen">
      <Box className="mb-6">
        <Typography variant="h4" className="text-gray-800 mb-2">
          Kundenverwaltung
        </Typography>
        <Typography variant="body1" className="text-gray-600">
          Verwalten Sie Ihre Kunden, Kontakte und Geschäftsbeziehungen
        </Typography>
      </Box>

      {/* Suchleiste und Aktionen */}
      <Card className="mb-6">
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Kunden suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleSearch} disabled={searchMutation.isPending}>
                        {searchMutation.isPending ? <CircularProgress size={20} /> : <SearchIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box className="flex gap-2 justify-end">
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={() => {/* Filter-Dialog öffnen */}}
                >
                  Filter
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  Aktualisieren
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {/* Neuen Kunden erstellen */}}
                >
                  Neuer Kunde
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Fehleranzeige */}
      {error && (
        <Alert severity="error" className="mb-4">
          Fehler beim Laden der Kunden: {error.message}
        </Alert>
      )}

      {/* Ladezustand */}
      {isLoading && (
        <Box className="flex justify-center items-center h-64">
          <CircularProgress />
        </Box>
      )}

      {/* Kundenliste */}
      {!isLoading && !error && (
        <Grid container spacing={3}>
          {customers.map((customer) => (
            <Grid item xs={12} md={6} lg={4} key={customer.id}>
              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleCustomerSelect(customer)}
              >
                <CardContent>
                  <Box className="flex items-start justify-between mb-3">
                    <Box className="flex items-center">
                      <Avatar className="mr-3">
                        <BusinessIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" className="text-gray-800">
                          {customer.name}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600">
                          {customer.customerNumber}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={customer.status === 'active' ? 'Aktiv' : customer.status === 'inactive' ? 'Inaktiv' : 'Interessent'}
                      color={getCustomerStatusColor(customer.status) as any}
                      size="small"
                    />
                  </Box>

                  <Box className="mb-3">
                    <Typography variant="body2" className="text-gray-600 mb-1">
                      {customer.address.street}, {customer.address.zipCode} {customer.address.city}
                    </Typography>
                  </Box>

                  <Box className="flex items-center gap-4 mb-3">
                    {customer.phone && (
                      <Box className="flex items-center text-gray-600">
                        <PhoneIcon className="mr-1" fontSize="small" />
                        <Typography variant="body2">{customer.phone}</Typography>
                      </Box>
                    )}
                    {customer.email && (
                      <Box className="flex items-center text-gray-600">
                        <EmailIcon className="mr-1" fontSize="small" />
                        <Typography variant="body2">{customer.email}</Typography>
                      </Box>
                    )}
                    {customer.whatsapp && (
                      <Box className="flex items-center text-gray-600">
                        <WhatsAppIcon className="mr-1" fontSize="small" />
                        <Typography variant="body2">{customer.whatsapp}</Typography>
                      </Box>
                    )}
                  </Box>

                  <Box className="flex items-center justify-between">
                    <Chip
                      label={customer.customerSegment === CustomerSegment.PREMIUM ? 'Premium' :
                             customer.customerSegment === CustomerSegment.REGULAR ? 'Standard' :
                             customer.customerSegment === CustomerSegment.BASIC ? 'Basic' :
                             customer.customerSegment === CustomerSegment.PROSPECT ? 'Interessent' : 'Inaktiv'}
                      color={getSegmentColor(customer.customerSegment) as any}
                      size="small"
                    />
                    <Typography variant="body2" className="text-gray-600">
                      Umsatz: {formatCurrency(customer.totalRevenue)}
                    </Typography>
                  </Box>

                  <Box className="mt-3 pt-3 border-t border-gray-200">
                    <Grid container spacing={1}>
                      <Grid item xs={4}>
                        <Typography variant="caption" className="text-gray-500">
                          Kreditlimit
                        </Typography>
                        <Typography variant="body2" className="font-medium">
                          {formatCurrency(customer.creditLimit)}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" className="text-gray-500">
                          Offene Posten
                        </Typography>
                        <Typography variant="body2" className="font-medium">
                          {formatCurrency(customer.openInvoices)}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" className="text-gray-500">
                          Risiko
                        </Typography>
                        <Typography variant="body2" className="font-medium">
                          {customer.riskScore}/10
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Leerer Zustand */}
      {!isLoading && !error && customers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BusinessIcon className="text-gray-400 mb-4" style={{ fontSize: 64 }} />
            <Typography variant="h6" className="text-gray-600 mb-2">
              Keine Kunden gefunden
            </Typography>
            <Typography variant="body2" className="text-gray-500 mb-4">
              {searchTerm ? 'Versuchen Sie andere Suchbegriffe oder erstellen Sie einen neuen Kunden.' : 'Erstellen Sie Ihren ersten Kunden, um zu beginnen.'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {/* Neuen Kunden erstellen */}}
            >
              Ersten Kunden erstellen
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default CRMPage; 