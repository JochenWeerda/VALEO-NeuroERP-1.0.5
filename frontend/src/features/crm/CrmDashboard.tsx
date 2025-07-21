import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  Alert, 
  Chip,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { 
  People as PeopleIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive' | 'prospect';
  lastContact: Date;
  value: number;
}

interface Contact {
  id: string;
  customerId: string;
  type: 'email' | 'phone' | 'meeting';
  date: Date;
  description: string;
  outcome: 'positive' | 'neutral' | 'negative';
}

const CrmDashboard: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCrmData();
  }, []);

  const loadCrmData = async () => {
    setLoading(true);
    try {
      // Simuliere API-Aufruf für CRM-Daten
      const mockCustomers: Customer[] = [
        {
          id: '1',
          name: 'Max Mustermann',
          email: 'max@example.com',
          phone: '+49 123 456789',
          company: 'Muster GmbH',
          status: 'active',
          lastContact: new Date(),
          value: 25000
        },
        {
          id: '2',
          name: 'Anna Schmidt',
          email: 'anna@schmidt.de',
          phone: '+49 987 654321',
          company: 'Schmidt AG',
          status: 'prospect',
          lastContact: new Date(Date.now() - 86400000),
          value: 15000
        },
        {
          id: '3',
          name: 'Peter Weber',
          email: 'peter@weber.com',
          phone: '+49 555 123456',
          company: 'Weber & Co',
          status: 'active',
          lastContact: new Date(Date.now() - 172800000),
          value: 35000
        }
      ];

      const mockContacts: Contact[] = [
        {
          id: '1',
          customerId: '1',
          type: 'email',
          date: new Date(),
          description: 'Angebot versendet',
          outcome: 'positive'
        },
        {
          id: '2',
          customerId: '2',
          type: 'phone',
          date: new Date(Date.now() - 86400000),
          description: 'Erstkontakt',
          outcome: 'neutral'
        }
      ];

      setCustomers(mockCustomers);
      setContacts(mockContacts);
    } catch (err) {
      setError('Fehler beim Laden der CRM-Daten');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'prospect': return 'warning';
      default: return 'default';
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'positive': return 'success';
      case 'neutral': return 'default';
      case 'negative': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom className="flex items-center gap-2">
        <PeopleIcon className="text-blue-600" />
        CRM Dashboard
      </Typography>
      <Typography variant="subtitle1" gutterBottom className="text-gray-600">
        Kundenbeziehungsmanagement und Kontaktverwaltung
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Übersicht
        </Typography>
        <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Box className="text-center p-4 bg-blue-50 rounded-lg">
            <PeopleIcon className="text-blue-600 text-3xl mb-2" />
            <Typography variant="h6" className="text-blue-800">Kunden</Typography>
            <Typography variant="h4" className="text-blue-600">
              {customers.length}
            </Typography>
          </Box>
          <Box className="text-center p-4 bg-green-50 rounded-lg">
            <BusinessIcon className="text-green-600 text-3xl mb-2" />
            <Typography variant="h6" className="text-green-800">Aktiv</Typography>
            <Typography variant="h4" className="text-green-600">
              {customers.filter(c => c.status === 'active').length}
            </Typography>
          </Box>
          <Box className="text-center p-4 bg-orange-50 rounded-lg">
            <PhoneIcon className="text-orange-600 text-3xl mb-2" />
            <Typography variant="h6" className="text-orange-800">Kontakte</Typography>
            <Typography variant="h4" className="text-orange-600">
              {contacts.length}
            </Typography>
          </Box>
          <Box className="text-center p-4 bg-purple-50 rounded-lg">
            <EmailIcon className="text-purple-600 text-3xl mb-2" />
            <Typography variant="h6" className="text-purple-800">Wert</Typography>
            <Typography variant="h4" className="text-purple-600">
              {customers.reduce((sum, c) => sum + c.value, 0).toLocaleString('de-DE')}€
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Customers Table */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Box className="flex justify-between items-center mb-4">
          <Typography variant="h6">
            Kunden
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
          >
            Neuer Kunde
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow className="bg-gray-50">
                <TableCell className="font-semibold">Name</TableCell>
                <TableCell className="font-semibold">Firma</TableCell>
                <TableCell className="font-semibold">Kontakt</TableCell>
                <TableCell className="font-semibold">Status</TableCell>
                <TableCell className="font-semibold">Letzter Kontakt</TableCell>
                <TableCell className="font-semibold">Wert</TableCell>
                <TableCell className="font-semibold">Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-gray-50">
                  <TableCell>
                    <Typography variant="body1" className="font-medium">
                      {customer.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{customer.company}</Typography>
                  </TableCell>
                  <TableCell>
                    <div>
                      <Typography variant="body2">{customer.email}</Typography>
                      <Typography variant="body2" className="text-gray-600">
                        {customer.phone}
                      </Typography>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={customer.status}
                      size="small"
                      color={getStatusColor(customer.status) as any}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {customer.lastContact.toLocaleDateString('de-DE')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" className="font-medium">
                      {customer.value.toLocaleString('de-DE')}€
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box className="flex gap-1">
                      <Button
                        size="small"
                        variant="outlined"
                      >
                        Bearbeiten
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                      >
                        Kontakt
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Recent Contacts */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Letzte Kontakte
        </Typography>
        <Box className="space-y-2">
          {contacts.map((contact) => (
            <Box key={contact.id} className="border rounded p-3">
              <Box className="flex items-center justify-between">
                <div>
                  <Typography variant="body1" className="font-medium">
                    {customers.find(c => c.id === contact.customerId)?.name}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    {contact.description}
                  </Typography>
                </div>
                <div className="flex items-center gap-2">
                  <Chip
                    label={contact.type}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={contact.outcome}
                    size="small"
                    color={getOutcomeColor(contact.outcome) as any}
                  />
                  <Typography variant="caption" className="text-gray-500">
                    {contact.date.toLocaleDateString('de-DE')}
                  </Typography>
                </div>
              </Box>
            </Box>
          ))}
        </Box>
      </Card>

      {/* Actions */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          onClick={loadCrmData}
          disabled={loading}
        >
          Daten aktualisieren
        </Button>
        <Button variant="outlined" startIcon={<SearchIcon />}>
          Kunden suchen
        </Button>
        <Button variant="outlined">
          Bericht exportieren
        </Button>
      </Box>
    </Box>
  );
};

export default CrmDashboard; 