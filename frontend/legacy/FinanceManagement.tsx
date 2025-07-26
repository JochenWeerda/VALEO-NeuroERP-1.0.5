import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ExpandMore as ExpandMoreIcon,
  Euro as EuroIcon,
  AccountCircle as AccountCircleIcon,
  Business as BusinessIcon,
  LocalAtm as LocalAtmIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';

// Interfaces
interface Account {
  id: string;
  kontonummer: string;
  kontobezeichnung: string;
  kontotyp: 'Aktiv' | 'Passiv' | 'Ertrag' | 'Aufwand';
  kontenklasse: string;
  kontengruppe: string;
  ist_aktiv: boolean;
  soll_betrag: number;
  haben_betrag: number;
  saldo: number;
}

interface Booking {
  id: string;
  buchungsnummer: string;
  buchungsdatum: string;
  belegnummer: string;
  buchungstext: string;
  sollkonto: string;
  habenkonto: string;
  betrag: number;
  waehrung: string;
  status: string;
}

interface Customer {
  id: string;
  debitor_nr: string;
  kundenname: string;
  kreditlimit: number;
  zahlungsziel: number;
  offene_betraege: number;
  ueberfaellige_betraege: number;
  verfuegbares_kreditlimit: number;
}

interface Supplier {
  id: string;
  kreditor_nr: string;
  lieferantenname: string;
  zahlungsziel: number;
  offene_betraege: number;
  ueberfaellige_betraege: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`finance-tabpanel-${index}`}
      aria-labelledby={`finance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const FinanceManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  
  // Dialog states
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  
  // Form states
  const [accountForm, setAccountForm] = useState({
    kontonummer: '',
    kontobezeichnung: '',
    kontotyp: 'Aktiv' as const,
    kontenklasse: '',
    kontengruppe: '',
    ist_aktiv: true
  });

  const [bookingForm, setBookingForm] = useState({
    buchungsdatum: '',
    belegnummer: '',
    buchungstext: '',
    sollkonto: '',
    habenkonto: '',
    betrag: '',
    waehrung: 'EUR'
  });

  useEffect(() => {
    loadFinanceData();
  }, []);

  const loadFinanceData = async () => {
    setLoading(true);
    try {
      // Simuliere API-Aufrufe
      const mockAccounts: Account[] = [
        {
          id: '1',
          kontonummer: '1000',
          kontobezeichnung: 'Kasse',
          kontotyp: 'Aktiv',
          kontenklasse: '1',
          kontengruppe: 'Umlaufvermögen',
          ist_aktiv: true,
          soll_betrag: 5000,
          haben_betrag: 2000,
          saldo: 3000
        },
        {
          id: '2',
          kontonummer: '1200',
          kontobezeichnung: 'Bankkonto',
          kontotyp: 'Aktiv',
          kontenklasse: '1',
          kontengruppe: 'Umlaufvermögen',
          ist_aktiv: true,
          soll_betrag: 50000,
          haben_betrag: 15000,
          saldo: 35000
        },
        {
          id: '3',
          kontonummer: '4000',
          kontobezeichnung: 'Umsatzerlöse',
          kontotyp: 'Ertrag',
          kontenklasse: '4',
          kontengruppe: 'Erträge',
          ist_aktiv: true,
          soll_betrag: 0,
          haben_betrag: 100000,
          saldo: -100000
        }
      ];

      const mockBookings: Booking[] = [
        {
          id: '1',
          buchungsnummer: 'BCH00000001',
          buchungsdatum: '2024-01-15',
          belegnummer: 'RECH-001',
          buchungstext: 'Rechnung Kunde A',
          sollkonto: '1400',
          habenkonto: '4000',
          betrag: 5000,
          waehrung: 'EUR',
          status: 'Buchung'
        },
        {
          id: '2',
          buchungsnummer: 'BCH00000002',
          buchungsdatum: '2024-01-16',
          belegnummer: 'RECH-002',
          buchungstext: 'Rechnung Kunde B',
          sollkonto: '1400',
          habenkonto: '4000',
          betrag: 3000,
          waehrung: 'EUR',
          status: 'Buchung'
        }
      ];

      const mockCustomers: Customer[] = [
        {
          id: '1',
          debitor_nr: 'DEB001',
          kundenname: 'Kunde A GmbH',
          kreditlimit: 10000,
          zahlungsziel: 30,
          offene_betraege: 5000,
          ueberfaellige_betraege: 0,
          verfuegbares_kreditlimit: 5000
        },
        {
          id: '2',
          debitor_nr: 'DEB002',
          kundenname: 'Kunde B KG',
          kreditlimit: 15000,
          zahlungsziel: 30,
          offene_betraege: 3000,
          ueberfaellige_betraege: 1000,
          verfuegbares_kreditlimit: 12000
        }
      ];

      const mockSuppliers: Supplier[] = [
        {
          id: '1',
          kreditor_nr: 'KRED001',
          lieferantenname: 'Lieferant A GmbH',
          zahlungsziel: 30,
          offene_betraege: 2000,
          ueberfaellige_betraege: 0
        },
        {
          id: '2',
          kreditor_nr: 'KRED002',
          lieferantenname: 'Lieferant B KG',
          zahlungsziel: 30,
          offene_betraege: 1500,
          ueberfaellige_betraege: 500
        }
      ];

      setAccounts(mockAccounts);
      setBookings(mockBookings);
      setCustomers(mockCustomers);
      setSuppliers(mockSuppliers);
    } catch (err) {
      setError('Fehler beim Laden der Finanzdaten');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddAccount = () => {
    setAccountDialogOpen(true);
  };

  const handleAddBooking = () => {
    setBookingDialogOpen(true);
  };

  const handleSaveAccount = async () => {
    try {
      // Simuliere API-Aufruf
      const newAccount: Account = {
        id: Date.now().toString(),
        kontonummer: accountForm.kontonummer,
        kontobezeichnung: accountForm.kontobezeichnung,
        kontotyp: accountForm.kontotyp,
        kontenklasse: accountForm.kontenklasse,
        kontengruppe: accountForm.kontengruppe,
        ist_aktiv: accountForm.ist_aktiv,
        soll_betrag: 0,
        haben_betrag: 0,
        saldo: 0
      };

      setAccounts([...accounts, newAccount]);
      setAccountDialogOpen(false);
      setAccountForm({
        kontonummer: '',
        kontobezeichnung: '',
        kontotyp: 'Aktiv',
        kontenklasse: '',
        kontengruppe: '',
        ist_aktiv: true
      });
    } catch (err) {
      setError('Fehler beim Speichern des Kontos');
    }
  };

  const handleSaveBooking = async () => {
    try {
      // Simuliere API-Aufruf
      const newBooking: Booking = {
        id: Date.now().toString(),
        buchungsnummer: `BCH${String(Date.now()).padStart(8, '0')}`,
        buchungsdatum: bookingForm.buchungsdatum,
        belegnummer: bookingForm.belegnummer,
        buchungstext: bookingForm.buchungstext,
        sollkonto: bookingForm.sollkonto,
        habenkonto: bookingForm.habenkonto,
        betrag: parseFloat(bookingForm.betrag),
        waehrung: bookingForm.waehrung,
        status: 'Buchung'
      };

      setBookings([newBooking, ...bookings]);
      setBookingDialogOpen(false);
      setBookingForm({
        buchungsdatum: '',
        belegnummer: '',
        buchungstext: '',
        sollkonto: '',
        habenkonto: '',
        betrag: '',
        waehrung: 'EUR'
      });
    } catch (err) {
      setError('Fehler beim Speichern der Buchung');
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'Aktiv': return 'primary';
      case 'Passiv': return 'secondary';
      case 'Ertrag': return 'success';
      case 'Aufwand': return 'error';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Buchung': return 'success';
      case 'Storniert': return 'error';
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
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <AccountBalanceIcon sx={{ color: 'primary.main' }} />
        Finanzbuchhaltung
      </Typography>
      <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.secondary' }}>
        Verwaltung der Finanzen, Buchungen und Konten
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              {accounts.length}
            </Typography>
            <Typography variant="body2" sx={{ color: 'primary.dark' }}>
              Konten
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 'bold' }}>
              {bookings.length}
            </Typography>
            <Typography variant="body2" sx={{ color: 'success.dark' }}>
              Buchungen
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
              {customers.reduce((sum, c) => sum + c.offene_betraege, 0).toLocaleString()}€
            </Typography>
            <Typography variant="body2" sx={{ color: 'warning.dark' }}>
              Offene Forderungen
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ color: 'info.main', fontWeight: 'bold' }}>
              {suppliers.reduce((sum, s) => sum + s.offene_betraege, 0).toLocaleString()}€
            </Typography>
            <Typography variant="body2" sx={{ color: 'info.dark' }}>
              Offene Verbindlichkeiten
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="finance tabs">
            <Tab 
              icon={<AccountCircleIcon />} 
              label="Kontenplan" 
              iconPosition="start"
            />
            <Tab 
              icon={<ReceiptIcon />} 
              label="Buchungen" 
              iconPosition="start"
            />
            <Tab 
              icon={<BusinessIcon />} 
              label="Debitoren" 
              iconPosition="start"
            />
            <Tab 
              icon={<LocalAtmIcon />} 
              label="Kreditoren" 
              iconPosition="start"
            />
            <Tab 
              icon={<AssessmentIcon />} 
              label="Berichte" 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Kontenplan Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Kontenplan</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddAccount}
            >
              Konto hinzufügen
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Kontonummer</TableCell>
                  <TableCell>Bezeichnung</TableCell>
                  <TableCell>Typ</TableCell>
                  <TableCell>Klasse</TableCell>
                  <TableCell align="right">Soll</TableCell>
                  <TableCell align="right">Haben</TableCell>
                  <TableCell align="right">Saldo</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>{account.kontonummer}</TableCell>
                    <TableCell>{account.kontobezeichnung}</TableCell>
                    <TableCell>
                      <Chip 
                        label={account.kontotyp} 
                        color={getAccountTypeColor(account.kontotyp)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{account.kontenklasse}</TableCell>
                    <TableCell align="right">{account.soll_betrag.toLocaleString()}€</TableCell>
                    <TableCell align="right">{account.haben_betrag.toLocaleString()}€</TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: account.saldo >= 0 ? 'success.main' : 'error.main',
                          fontWeight: 'bold'
                        }}
                      >
                        {account.saldo.toLocaleString()}€
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={account.ist_aktiv ? 'Aktiv' : 'Inaktiv'} 
                        color={account.ist_aktiv ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <ViewIcon />
                      </IconButton>
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Buchungen Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Buchungen</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddBooking}
            >
              Buchung erstellen
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Buchungsnummer</TableCell>
                  <TableCell>Datum</TableCell>
                  <TableCell>Belegnummer</TableCell>
                  <TableCell>Buchungstext</TableCell>
                  <TableCell>Sollkonto</TableCell>
                  <TableCell>Habenkonto</TableCell>
                  <TableCell align="right">Betrag</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>{booking.buchungsnummer}</TableCell>
                    <TableCell>{new Date(booking.buchungsdatum).toLocaleDateString('de-DE')}</TableCell>
                    <TableCell>{booking.belegnummer}</TableCell>
                    <TableCell>{booking.buchungstext}</TableCell>
                    <TableCell>{booking.sollkonto}</TableCell>
                    <TableCell>{booking.habenkonto}</TableCell>
                    <TableCell align="right">{booking.betrag.toLocaleString()}€</TableCell>
                    <TableCell>
                      <Chip 
                        label={booking.status} 
                        color={getStatusColor(booking.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <ViewIcon />
                      </IconButton>
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Debitoren Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" sx={{ mb: 2 }}>Debitoren (Kunden)</Typography>
          
          <Grid container spacing={2}>
            {customers.map((customer) => (
              <Grid item xs={12} md={6} key={customer.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6">{customer.kundenname}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {customer.debitor_nr}
                        </Typography>
                      </Box>
                      <Chip 
                        label={customer.offene_betraege > 0 ? 'Offene Forderungen' : 'Keine Forderungen'} 
                        color={customer.offene_betraege > 0 ? 'warning' : 'success'}
                        size="small"
                      />
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Kreditlimit</Typography>
                        <Typography variant="body1">{customer.kreditlimit.toLocaleString()}€</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Zahlungsziel</Typography>
                        <Typography variant="body1">{customer.zahlungsziel} Tage</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Offene Beträge</Typography>
                        <Typography variant="body1" color="warning.main">
                          {customer.offene_betraege.toLocaleString()}€
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Verfügbares Limit</Typography>
                        <Typography variant="body1" color="success.main">
                          {customer.verfuegbares_kreditlimit.toLocaleString()}€
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Kreditoren Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" sx={{ mb: 2 }}>Kreditoren (Lieferanten)</Typography>
          
          <Grid container spacing={2}>
            {suppliers.map((supplier) => (
              <Grid item xs={12} md={6} key={supplier.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6">{supplier.lieferantenname}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {supplier.kreditor_nr}
                        </Typography>
                      </Box>
                      <Chip 
                        label={supplier.offene_betraege > 0 ? 'Offene Verbindlichkeiten' : 'Keine Verbindlichkeiten'} 
                        color={supplier.offene_betraege > 0 ? 'warning' : 'success'}
                        size="small"
                      />
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Zahlungsziel</Typography>
                        <Typography variant="body1">{supplier.zahlungsziel} Tage</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Offene Beträge</Typography>
                        <Typography variant="body1" color="warning.main">
                          {supplier.offene_betraege.toLocaleString()}€
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Überfällige Beträge</Typography>
                        <Typography variant="body1" color="error.main">
                          {supplier.ueberfaellige_betraege.toLocaleString()}€
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Berichte Tab */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" sx={{ mb: 2 }}>Finanzberichte</Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Bilanz-Übersicht</Typography>
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="Aktiva" 
                        secondary={`${accounts.filter(a => a.kontotyp === 'Aktiv').reduce((sum, a) => sum + a.saldo, 0).toLocaleString()}€`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Passiva" 
                        secondary={`${accounts.filter(a => a.kontotyp === 'Passiv').reduce((sum, a) => sum + a.saldo, 0).toLocaleString()}€`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Eigenkapital" 
                        secondary={`${accounts.filter(a => a.kontotyp === 'Passiv').reduce((sum, a) => sum + a.saldo, 0).toLocaleString()}€`}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Gewinn & Verlust</Typography>
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="Erträge" 
                        secondary={`${accounts.filter(a => a.kontotyp === 'Ertrag').reduce((sum, a) => sum + Math.abs(a.saldo), 0).toLocaleString()}€`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Aufwendungen" 
                        secondary={`${accounts.filter(a => a.kontotyp === 'Aufwand').reduce((sum, a) => sum + Math.abs(a.saldo), 0).toLocaleString()}€`}
                      />
                    </ListItem>
                    <Divider sx={{ my: 1 }} />
                    <ListItem>
                      <ListItemText 
                        primary="Gewinn/Verlust" 
                        secondary={`${(accounts.filter(a => a.kontotyp === 'Ertrag').reduce((sum, a) => sum + Math.abs(a.saldo), 0) - 
                                   accounts.filter(a => a.kontotyp === 'Aufwand').reduce((sum, a) => sum + Math.abs(a.saldo), 0)).toLocaleString()}€`}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>

      {/* Konto hinzufügen Dialog */}
      <Dialog open={accountDialogOpen} onClose={() => setAccountDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Neues Konto hinzufügen</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Kontonummer"
                value={accountForm.kontonummer}
                onChange={(e) => setAccountForm({...accountForm, kontonummer: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Kontotyp</InputLabel>
                <Select
                  value={accountForm.kontotyp}
                  onChange={(e) => setAccountForm({...accountForm, kontotyp: e.target.value as any})}
                  label="Kontotyp"
                >
                  <MenuItem value="Aktiv">Aktiv</MenuItem>
                  <MenuItem value="Passiv">Passiv</MenuItem>
                  <MenuItem value="Ertrag">Ertrag</MenuItem>
                  <MenuItem value="Aufwand">Aufwand</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Kontobezeichnung"
                value={accountForm.kontobezeichnung}
                onChange={(e) => setAccountForm({...accountForm, kontobezeichnung: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Kontenklasse"
                value={accountForm.kontenklasse}
                onChange={(e) => setAccountForm({...accountForm, kontenklasse: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Kontengruppe"
                value={accountForm.kontengruppe}
                onChange={(e) => setAccountForm({...accountForm, kontengruppe: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <Switch
                  checked={accountForm.ist_aktiv}
                  onChange={(e) => setAccountForm({...accountForm, ist_aktiv: e.target.checked})}
                />
                <Typography>Aktiv</Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAccountDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleSaveAccount} variant="contained">Speichern</Button>
        </DialogActions>
      </Dialog>

      {/* Buchung erstellen Dialog */}
      <Dialog open={bookingDialogOpen} onClose={() => setBookingDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Neue Buchung erstellen</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Buchungsdatum"
                type="date"
                value={bookingForm.buchungsdatum}
                onChange={(e) => setBookingForm({...bookingForm, buchungsdatum: e.target.value})}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Belegnummer"
                value={bookingForm.belegnummer}
                onChange={(e) => setBookingForm({...bookingForm, belegnummer: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Buchungstext"
                value={bookingForm.buchungstext}
                onChange={(e) => setBookingForm({...bookingForm, buchungstext: e.target.value})}
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Sollkonto</InputLabel>
                <Select
                  value={bookingForm.sollkonto}
                  onChange={(e) => setBookingForm({...bookingForm, sollkonto: e.target.value})}
                  label="Sollkonto"
                >
                  {accounts.map((account) => (
                    <MenuItem key={account.id} value={account.kontonummer}>
                      {account.kontonummer} - {account.kontobezeichnung}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Habenkonto</InputLabel>
                <Select
                  value={bookingForm.habenkonto}
                  onChange={(e) => setBookingForm({...bookingForm, habenkonto: e.target.value})}
                  label="Habenkonto"
                >
                  {accounts.map((account) => (
                    <MenuItem key={account.id} value={account.kontonummer}>
                      {account.kontonummer} - {account.kontobezeichnung}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Betrag"
                type="number"
                value={bookingForm.betrag}
                onChange={(e) => setBookingForm({...bookingForm, betrag: e.target.value})}
                margin="normal"
                InputProps={{
                  endAdornment: <Typography>€</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Währung</InputLabel>
                <Select
                  value={bookingForm.waehrung}
                  onChange={(e) => setBookingForm({...bookingForm, waehrung: e.target.value})}
                  label="Währung"
                >
                  <MenuItem value="EUR">EUR</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="CHF">CHF</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleSaveBooking} variant="contained">Buchung erstellen</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FinanceManagement; 