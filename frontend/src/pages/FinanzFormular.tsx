import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Avatar,
  Tooltip,
  Alert,
  Snackbar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  Badge,
  LinearProgress,
  CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  AccountBalance as AccountIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingIcon,
  ExpandMore as ExpandMoreIcon,
  AttachMoney as MoneyIcon,
  LocalOffer as OfferIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  BarChart as ChartIcon,
  AccountBalanceWallet as WalletIcon,
  CreditCard as CreditCardIcon,
  Savings as SavingsIcon
} from '@mui/icons-material';

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface Buchung {
  id: string;
  datum: string;
  beschreibung: string;
  betrag: number;
  typ: 'einnahme' | 'ausgabe';
  kategorie: string;
  konto: string;
  belegnummer?: string;
  status: 'offen' | 'bezahlt' | 'storniert';
  mwst: number;
  buchungstext: string;
  erstelltAm: string;
}

interface Konto {
  id: string;
  kontonummer: string;
  name: string;
  typ: 'aktiv' | 'passiv' | 'ertrag' | 'aufwand';
  saldo: number;
  waehrung: string;
  status: 'aktiv' | 'inaktiv';
  beschreibung: string;
  erstelltAm: string;
}

interface Bericht {
  id: string;
  name: string;
  typ: 'guv' | 'bilanz' | 'cashflow' | 'umsatz';
  zeitraum: string;
  erstelltAm: string;
  status: 'erstellt' | 'in_bearbeitung' | 'fehler';
  dateiUrl?: string;
}

interface Budget {
  id: string;
  name: string;
  kategorie: string;
  jahr: number;
  budgetBetrag: number;
  verbraucht: number;
  verbleibend: number;
  status: 'unter_budget' | 'im_budget' | 'ueber_budget';
  beschreibung: string;
}

const FinanzFormular: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBuchung, setSelectedBuchung] = useState<Buchung | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });

  // Mock-Daten
  const [buchungen, setBuchungen] = useState<Buchung[]>([
    {
      id: '1',
      datum: '2024-01-20',
      beschreibung: 'Einkauf Büromaterial',
      betrag: 245.50,
      typ: 'ausgabe',
      kategorie: 'Bürobedarf',
      konto: 'Bankkonto',
      belegnummer: 'RE-2024-001',
      status: 'bezahlt',
      mwst: 19,
      buchungstext: 'Büromaterial für Verwaltung',
      erstelltAm: '2024-01-20'
    },
    {
      id: '2',
      datum: '2024-01-19',
      beschreibung: 'Kundenzahlung',
      betrag: 1250.00,
      typ: 'einnahme',
      kategorie: 'Umsatzerlöse',
      konto: 'Bankkonto',
      belegnummer: 'RE-2024-002',
      status: 'bezahlt',
      mwst: 19,
      buchungstext: 'Zahlungseingang Kunde Müller GmbH',
      erstelltAm: '2024-01-19'
    },
    {
      id: '3',
      datum: '2024-01-18',
      beschreibung: 'Mietzahlung Büro',
      betrag: 850.00,
      typ: 'ausgabe',
      kategorie: 'Miete',
      konto: 'Bankkonto',
      belegnummer: 'RE-2024-003',
      status: 'offen',
      mwst: 19,
      buchungstext: 'Monatliche Mietzahlung',
      erstelltAm: '2024-01-18'
    }
  ]);

  const [konten, setKonten] = useState<Konto[]>([
    {
      id: '1',
      kontonummer: '1000',
      name: 'Bankkonto',
      typ: 'aktiv',
      saldo: 15420.50,
      waehrung: 'EUR',
      status: 'aktiv',
      beschreibung: 'Hauptbankkonto der Firma',
      erstelltAm: '2024-01-01'
    },
    {
      id: '2',
      kontonummer: '1200',
      name: 'Forderungen',
      typ: 'aktiv',
      saldo: 3250.00,
      waehrung: 'EUR',
      status: 'aktiv',
      beschreibung: 'Offene Forderungen aus Lieferungen',
      erstelltAm: '2024-01-01'
    },
    {
      id: '3',
      kontonummer: '4000',
      name: 'Umsatzerlöse',
      typ: 'ertrag',
      saldo: 45680.00,
      waehrung: 'EUR',
      status: 'aktiv',
      beschreibung: 'Erlöse aus Verkäufen',
      erstelltAm: '2024-01-01'
    },
    {
      id: '4',
      kontonummer: '5000',
      name: 'Materialaufwand',
      typ: 'aufwand',
      saldo: 12350.00,
      waehrung: 'EUR',
      status: 'aktiv',
      beschreibung: 'Aufwand für Materialien',
      erstelltAm: '2024-01-01'
    }
  ]);

  const [berichte, setBerichte] = useState<Bericht[]>([
    {
      id: '1',
      name: 'Gewinn- und Verlustrechnung Q4 2023',
      typ: 'guv',
      zeitraum: 'Q4 2023',
      erstelltAm: '2024-01-15',
      status: 'erstellt',
      dateiUrl: '/reports/guv-q4-2023.pdf'
    },
    {
      id: '2',
      name: 'Bilanz 31.12.2023',
      typ: 'bilanz',
      zeitraum: '31.12.2023',
      erstelltAm: '2024-01-10',
      status: 'erstellt',
      dateiUrl: '/reports/bilanz-2023.pdf'
    },
    {
      id: '3',
      name: 'Cashflow-Analyse Januar 2024',
      typ: 'cashflow',
      zeitraum: 'Januar 2024',
      erstelltAm: '2024-01-20',
      status: 'in_bearbeitung'
    }
  ]);

  const [budgets, setBudgets] = useState<Budget[]>([
    {
      id: '1',
      name: 'Marketing Budget 2024',
      kategorie: 'Marketing',
      jahr: 2024,
      budgetBetrag: 15000,
      verbraucht: 8500,
      verbleibend: 6500,
      status: 'im_budget',
      beschreibung: 'Jahresbudget für Marketingaktivitäten'
    },
    {
      id: '2',
      name: 'IT-Ausstattung 2024',
      kategorie: 'IT',
      jahr: 2024,
      budgetBetrag: 8000,
      verbraucht: 9200,
      verbleibend: -1200,
      status: 'ueber_budget',
      beschreibung: 'Budget für IT-Hardware und Software'
    },
    {
      id: '3',
      name: 'Bürobedarf 2024',
      kategorie: 'Bürobedarf',
      jahr: 2024,
      budgetBetrag: 3000,
      verbraucht: 1800,
      verbleibend: 1200,
      status: 'unter_budget',
      beschreibung: 'Jahresbudget für Büromaterial'
    }
  ]);

  const [buchungForm, setBuchungForm] = useState<Partial<Buchung>>({
    datum: new Date().toISOString().split('T')[0],
    beschreibung: '',
    betrag: 0,
    typ: 'ausgabe',
    kategorie: '',
    konto: '',
    belegnummer: '',
    status: 'offen',
    mwst: 19,
    buchungstext: ''
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (buchung?: Buchung) => {
    if (buchung) {
      setSelectedBuchung(buchung);
      setBuchungForm(buchung);
    } else {
      setSelectedBuchung(null);
      setBuchungForm({
        datum: new Date().toISOString().split('T')[0],
        beschreibung: '',
        betrag: 0,
        typ: 'ausgabe',
        kategorie: '',
        konto: '',
        belegnummer: '',
        status: 'offen',
        mwst: 19,
        buchungstext: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBuchung(null);
    setBuchungForm({});
  };

  const handleSaveBuchung = () => {
    if (selectedBuchung) {
      // Update existing booking
      setBuchungen(buchungen.map(b => 
        b.id === selectedBuchung.id 
          ? { ...buchungForm, id: b.id, erstelltAm: b.erstelltAm } as Buchung
          : b
      ));
      setSnackbar({
        open: true,
        message: 'Buchung erfolgreich aktualisiert',
        severity: 'success'
      });
    } else {
      // Create new booking
      const newBuchung: Buchung = {
        ...buchungForm,
        id: Date.now().toString(),
        erstelltAm: new Date().toISOString().split('T')[0]
      } as Buchung;
      setBuchungen([...buchungen, newBuchung]);
      setSnackbar({
        open: true,
        message: 'Buchung erfolgreich erstellt',
        severity: 'success'
      });
    }
    handleCloseDialog();
  };

  const handleDeleteBuchung = (id: string) => {
    setBuchungen(buchungen.filter(b => b.id !== id));
    setSnackbar({
      open: true,
      message: 'Buchung erfolgreich gelöscht',
      severity: 'success'
    });
  };

  const getTypColor = (typ: string) => {
    return typ === 'einnahme' ? 'success' : 'error';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'bezahlt': return 'success';
      case 'offen': return 'warning';
      case 'storniert': return 'error';
      default: return 'default';
    }
  };

  const getBudgetStatusColor = (status: string) => {
    switch (status) {
      case 'unter_budget': return 'success';
      case 'im_budget': return 'warning';
      case 'ueber_budget': return 'error';
      default: return 'default';
    }
  };

  const getBerichtStatusColor = (status: string) => {
    switch (status) {
      case 'erstellt': return 'success';
      case 'in_bearbeitung': return 'warning';
      case 'fehler': return 'error';
      default: return 'default';
    }
  };

  const getBerichtIcon = (typ: string) => {
    switch (typ) {
      case 'guv': return <TrendingIcon />;
      case 'bilanz': return <AccountIcon />;
      case 'cashflow': return <MoneyIcon />;
      case 'umsatz': return <ChartIcon />;
      default: return <InfoIcon />;
    }
  };

  const calculateTotalEinnahmen = () => {
    return buchungen
      .filter(b => b.typ === 'einnahme')
      .reduce((sum, b) => sum + b.betrag, 0);
  };

  const calculateTotalAusgaben = () => {
    return buchungen
      .filter(b => b.typ === 'ausgabe')
      .reduce((sum, b) => sum + b.betrag, 0);
  };

  const calculateSaldo = () => {
    return calculateTotalEinnahmen() - calculateTotalAusgaben();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <MoneyIcon color="primary" />
          Finanzverwaltung
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          Neue Buchung
        </Button>
      </Box>

      {/* Finanzübersicht */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <TrendingIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="success.main">
                    {calculateTotalEinnahmen().toFixed(2)} €
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Einnahmen
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <MoneyIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="error.main">
                    {calculateTotalAusgaben().toFixed(2)} €
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ausgaben
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: calculateSaldo() >= 0 ? 'success.main' : 'error.main' }}>
                  <AccountIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color={calculateSaldo() >= 0 ? 'success.main' : 'error.main'}>
                    {calculateSaldo().toFixed(2)} €
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Saldo
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <WalletIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="info.main">
                    {konten.reduce((sum, k) => sum + k.saldo, 0).toFixed(2)} €
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Kontostand
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Buchungen" icon={<ReceiptIcon />} iconPosition="start" />
          <Tab label="Konten" icon={<AccountIcon />} iconPosition="start" />
          <Tab label="Berichte" icon={<ChartIcon />} iconPosition="start" />
          <Tab label="Budgets" icon={<TrendingIcon />} iconPosition="start" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Datum</TableCell>
                  <TableCell>Beschreibung</TableCell>
                  <TableCell>Betrag (€)</TableCell>
                  <TableCell>Typ</TableCell>
                  <TableCell>Kategorie</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {buchungen.map((buchung) => (
                  <TableRow key={buchung.id}>
                    <TableCell>{buchung.datum}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {buchung.beschreibung}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {buchung.buchungstext}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        fontWeight="medium"
                        color={getTypColor(buchung.typ)}
                      >
                        {buchung.typ === 'ausgabe' ? '-' : '+'}{buchung.betrag.toFixed(2)} €
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={buchung.typ === 'einnahme' ? 'Einnahme' : 'Ausgabe'}
                        color={getTypColor(buchung.typ) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{buchung.kategorie}</TableCell>
                    <TableCell>
                      <Chip
                        label={buchung.status}
                        color={getStatusColor(buchung.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Anzeigen">
                          <IconButton size="small" color="primary">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Bearbeiten">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleOpenDialog(buchung)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Löschen">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteBuchung(buchung.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {konten.map((konto) => (
              <Grid item xs={12} md={6} lg={4} key={konto.id}>
                <Card sx={{ p: 2, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <AccountIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{konto.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Konto {konto.kontonummer}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                    {konto.saldo.toFixed(2)} {konto.waehrung}
                  </Typography>
                  <Chip 
                    label={konto.typ} 
                    color="primary" 
                    size="small" 
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {konto.beschreibung}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" variant="outlined">
                      Bearbeiten
                    </Button>
                    <Button size="small" variant="outlined">
                      Buchungen
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {berichte.map((bericht) => (
              <Grid item xs={12} md={6} lg={4} key={bericht.id}>
                <Card sx={{ p: 2, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      {getBerichtIcon(bericht.typ)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{bericht.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {bericht.zeitraum}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip 
                    label={bericht.status} 
                    color={getBerichtStatusColor(bericht.status) as any}
                    size="small" 
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Erstellt: {bericht.erstelltAm}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {bericht.status === 'erstellt' && (
                      <Button size="small" variant="contained">
                        Herunterladen
                      </Button>
                    )}
                    <Button size="small" variant="outlined">
                      Bearbeiten
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            {budgets.map((budget) => (
              <Grid item xs={12} md={6} lg={4} key={budget.id}>
                <Card sx={{ p: 2, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <TrendingIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{budget.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {budget.kategorie} - {budget.jahr}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Verbraucht</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {budget.verbraucht.toFixed(2)} €
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(budget.verbraucht / budget.budgetBetrag) * 100}
                      color={getBudgetStatusColor(budget.status) as any}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Budget: {budget.budgetBetrag.toFixed(2)} €
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Verbleibend: {budget.verbleibend.toFixed(2)} €
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Chip 
                    label={budget.status.replace('_', ' ')} 
                    color={getBudgetStatusColor(budget.status) as any}
                    size="small" 
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {budget.beschreibung}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" variant="outlined">
                      Bearbeiten
                    </Button>
                    <Button size="small" variant="outlined">
                      Details
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Card>

      {/* Dialog für Buchung bearbeiten/erstellen */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedBuchung ? 'Buchung bearbeiten' : 'Neue Buchung erstellen'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Datum"
                type="date"
                value={buchungForm.datum || ''}
                onChange={(e) => setBuchungForm({...buchungForm, datum: e.target.value})}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Belegnummer"
                value={buchungForm.belegnummer || ''}
                onChange={(e) => setBuchungForm({...buchungForm, belegnummer: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Beschreibung"
                value={buchungForm.beschreibung || ''}
                onChange={(e) => setBuchungForm({...buchungForm, beschreibung: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Buchungstext"
                value={buchungForm.buchungstext || ''}
                onChange={(e) => setBuchungForm({...buchungForm, buchungstext: e.target.value})}
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Betrag (€)"
                type="number"
                value={buchungForm.betrag || ''}
                onChange={(e) => setBuchungForm({...buchungForm, betrag: parseFloat(e.target.value) || 0})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="MwSt (%)"
                type="number"
                value={buchungForm.mwst || ''}
                onChange={(e) => setBuchungForm({...buchungForm, mwst: parseFloat(e.target.value) || 0})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Typ</InputLabel>
                <Select
                  value={buchungForm.typ || ''}
                  onChange={(e) => setBuchungForm({...buchungForm, typ: e.target.value as any})}
                  label="Typ"
                >
                  <MenuItem value="einnahme">Einnahme</MenuItem>
                  <MenuItem value="ausgabe">Ausgabe</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={buchungForm.status || ''}
                  onChange={(e) => setBuchungForm({...buchungForm, status: e.target.value as any})}
                  label="Status"
                >
                  <MenuItem value="offen">Offen</MenuItem>
                  <MenuItem value="bezahlt">Bezahlt</MenuItem>
                  <MenuItem value="storniert">Storniert</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Kategorie"
                value={buchungForm.kategorie || ''}
                onChange={(e) => setBuchungForm({...buchungForm, kategorie: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Konto</InputLabel>
                <Select
                  value={buchungForm.konto || ''}
                  onChange={(e) => setBuchungForm({...buchungForm, konto: e.target.value})}
                  label="Konto"
                >
                  {konten.map((konto) => (
                    <MenuItem key={konto.id} value={konto.name}>
                      {konto.name} ({konto.kontonummer})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button onClick={handleSaveBuchung} variant="contained">
            {selectedBuchung ? 'Aktualisieren' : 'Erstellen'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
      >
        <Alert 
          onClose={() => setSnackbar({...snackbar, open: false})} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FinanzFormular; 