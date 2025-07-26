import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  LinearProgress,
  Avatar,
  Divider,
  Alert,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
  LocalShipping as ShippingIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon
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
      id={`sales-tabpanel-${index}`}
      aria-labelledby={`sales-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SalesManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'kunde' | 'angebot' | 'auftrag' | 'lieferung' | 'rechnung'>('kunde');

  // Mock-Daten für KPI-Cards
  const kpiData = {
    umsatz: { value: '€ 2.847.350', change: '+12.5%', trend: 'up' },
    auftraege: { value: '156', change: '+8.2%', trend: 'up' },
    kunden: { value: '89', change: '+3.4%', trend: 'up' },
    offeneForderungen: { value: '€ 423.680', change: '-5.1%', trend: 'down' }
  };

  // Mock-Daten für Kunden
  const kunden = [
    {
      id: '1',
      name: 'Agrarhof Müller GmbH',
      kundennummer: 'K-2024-001',
      typ: 'Geschäftskunde',
      umsatz: 125000,
      status: 'Aktiv',
      letzterKontakt: '2024-01-15',
      ansprechpartner: 'Hans Müller'
    },
    {
      id: '2',
      name: 'Bauernhof Schmidt',
      kundennummer: 'K-2024-002',
      typ: 'Privatkunde',
      umsatz: 45000,
      status: 'Aktiv',
      letzterKontakt: '2024-01-12',
      ansprechpartner: 'Maria Schmidt'
    },
    {
      id: '3',
      name: 'Landwirtschaftliche Genossenschaft',
      kundennummer: 'K-2024-003',
      typ: 'Geschäftskunde',
      umsatz: 320000,
      status: 'Aktiv',
      letzterKontakt: '2024-01-10',
      ansprechpartner: 'Peter Weber'
    }
  ];

  // Mock-Daten für Angebote
  const angebote = [
    {
      id: '1',
      angebotsnummer: 'A-2024-001',
      kunde: 'Agrarhof Müller GmbH',
      datum: '2024-01-15',
      gueltigBis: '2024-02-15',
      wert: 12500,
      status: 'Offen'
    },
    {
      id: '2',
      angebotsnummer: 'A-2024-002',
      kunde: 'Bauernhof Schmidt',
      datum: '2024-01-12',
      gueltigBis: '2024-02-12',
      wert: 8500,
      status: 'Angenommen'
    },
    {
      id: '3',
      angebotsnummer: 'A-2024-003',
      kunde: 'Landwirtschaftliche Genossenschaft',
      datum: '2024-01-10',
      gueltigBis: '2024-02-10',
      wert: 45000,
      status: 'Abgelehnt'
    }
  ];

  // Mock-Daten für Aufträge
  const auftraege = [
    {
      id: '1',
      auftragsnummer: 'AU-2024-001',
      kunde: 'Agrarhof Müller GmbH',
      datum: '2024-01-15',
      liefertermin: '2024-01-25',
      wert: 12500,
      status: 'In Bearbeitung',
      fortschritt: 75
    },
    {
      id: '2',
      auftragsnummer: 'AU-2024-002',
      kunde: 'Bauernhof Schmidt',
      datum: '2024-01-12',
      liefertermin: '2024-01-22',
      wert: 8500,
      status: 'Versandbereit',
      fortschritt: 90
    },
    {
      id: '3',
      auftragsnummer: 'AU-2024-003',
      kunde: 'Landwirtschaftliche Genossenschaft',
      datum: '2024-01-10',
      liefertermin: '2024-01-30',
      wert: 45000,
      status: 'Geplant',
      fortschritt: 25
    }
  ];

  // Mock-Daten für Lieferungen
  const lieferungen = [
    {
      id: '1',
      liefernummer: 'L-2024-001',
      auftrag: 'AU-2024-001',
      kunde: 'Agrarhof Müller GmbH',
      datum: '2024-01-20',
      status: 'Versendet',
      tracking: 'DHL-123456789'
    },
    {
      id: '2',
      liefernummer: 'L-2024-002',
      auftrag: 'AU-2024-002',
      kunde: 'Bauernhof Schmidt',
      datum: '2024-01-18',
      status: 'Zugestellt',
      tracking: 'DHL-987654321'
    },
    {
      id: '3',
      liefernummer: 'L-2024-003',
      auftrag: 'AU-2024-003',
      kunde: 'Landwirtschaftliche Genossenschaft',
      datum: '2024-01-25',
      status: 'In Vorbereitung',
      tracking: 'DHL-456789123'
    }
  ];

  // Mock-Daten für Rechnungen
  const rechnungen = [
    {
      id: '1',
      rechnungsnummer: 'R-2024-001',
      kunde: 'Agrarhof Müller GmbH',
      datum: '2024-01-20',
      faelligkeit: '2024-02-20',
      betrag: 12500,
      status: 'Offen',
      zahlungsziel: 30
    },
    {
      id: '2',
      rechnungsnummer: 'R-2024-002',
      kunde: 'Bauernhof Schmidt',
      datum: '2024-01-18',
      faelligkeit: '2024-02-18',
      betrag: 8500,
      status: 'Bezahlt',
      zahlungsziel: 30
    },
    {
      id: '3',
      rechnungsnummer: 'R-2024-003',
      kunde: 'Landwirtschaftliche Genossenschaft',
      datum: '2024-01-25',
      faelligkeit: '2024-02-25',
      betrag: 45000,
      status: 'Überfällig',
      zahlungsziel: 30
    }
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (type: 'kunde' | 'angebot' | 'auftrag' | 'lieferung' | 'rechnung') => {
    setDialogType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aktiv':
      case 'Angenommen':
      case 'Zugestellt':
      case 'Bezahlt':
        return 'success';
      case 'Offen':
      case 'In Bearbeitung':
      case 'Versendet':
      case 'Versandbereit':
        return 'warning';
      case 'Abgelehnt':
      case 'Überfällig':
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

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Verkaufsmanagement
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Kundenverwaltung, Angebote, Aufträge und Rechnungsstellung
        </Typography>
      </Box>

      {/* KPI Dashboard */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Umsatz (Monat)
                  </Typography>
                  <Typography variant="h5" component="div">
                    {kpiData.umsatz.value}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    {kpiData.umsatz.change}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <MoneyIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Aktive Aufträge
                  </Typography>
                  <Typography variant="h5" component="div">
                    {kpiData.auftraege.value}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    {kpiData.auftraege.change}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <CartIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Aktive Kunden
                  </Typography>
                  <Typography variant="h5" component="div">
                    {kpiData.kunden.value}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    {kpiData.kunden.change}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <PeopleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Offene Forderungen
                  </Typography>
                  <Typography variant="h5" component="div">
                    {kpiData.offeneForderungen.value}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    {kpiData.offeneForderungen.change}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <WarningIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="Verkaufsmanagement Tabs">
          <Tab label="Kunden" icon={<PeopleIcon />} iconPosition="start" />
          <Tab label="Angebote" icon={<AssessmentIcon />} iconPosition="start" />
          <Tab label="Aufträge" icon={<CartIcon />} iconPosition="start" />
          <Tab label="Lieferungen" icon={<ShippingIcon />} iconPosition="start" />
          <Tab label="Rechnungen" icon={<ReceiptIcon />} iconPosition="start" />
          <Tab label="Statistiken" icon={<TrendingUpIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Kundennummer</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Typ</TableCell>
                <TableCell>Umsatz</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Letzter Kontakt</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {kunden.map((kunde) => (
                <TableRow key={kunde.id}>
                  <TableCell>{kunde.kundennummer}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {kunde.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {kunde.ansprechpartner}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={kunde.typ} size="small" />
                  </TableCell>
                  <TableCell>{formatCurrency(kunde.umsatz)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={kunde.status} 
                      color={getStatusColor(kunde.status) as any}
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{kunde.letzterKontakt}</TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <ViewIcon />
                    </IconButton>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Angebotsnummer</TableCell>
                <TableCell>Kunde</TableCell>
                <TableCell>Datum</TableCell>
                <TableCell>Gültig bis</TableCell>
                <TableCell>Wert</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {angebote.map((angebot) => (
                <TableRow key={angebot.id}>
                  <TableCell>{angebot.angebotsnummer}</TableCell>
                  <TableCell>{angebot.kunde}</TableCell>
                  <TableCell>{angebot.datum}</TableCell>
                  <TableCell>{angebot.gueltigBis}</TableCell>
                  <TableCell>{formatCurrency(angebot.wert)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={angebot.status} 
                      color={getStatusColor(angebot.status) as any}
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
                    <IconButton size="small">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Auftragsnummer</TableCell>
                <TableCell>Kunde</TableCell>
                <TableCell>Datum</TableCell>
                <TableCell>Liefertermin</TableCell>
                <TableCell>Wert</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Fortschritt</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {auftraege.map((auftrag) => (
                <TableRow key={auftrag.id}>
                  <TableCell>{auftrag.auftragsnummer}</TableCell>
                  <TableCell>{auftrag.kunde}</TableCell>
                  <TableCell>{auftrag.datum}</TableCell>
                  <TableCell>{auftrag.liefertermin}</TableCell>
                  <TableCell>{formatCurrency(auftrag.wert)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={auftrag.status} 
                      color={getStatusColor(auftrag.status) as any}
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={auftrag.fortschritt} 
                          sx={{ height: 8, borderRadius: 5 }}
                        />
                      </Box>
                      <Box sx={{ minWidth: 35 }}>
                        <Typography variant="body2" color="text.secondary">
                          {auftrag.fortschritt}%
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <ViewIcon />
                    </IconButton>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small">
                      <ShippingIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Liefernummer</TableCell>
                <TableCell>Auftrag</TableCell>
                <TableCell>Kunde</TableCell>
                <TableCell>Datum</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Tracking</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lieferungen.map((lieferung) => (
                <TableRow key={lieferung.id}>
                  <TableCell>{lieferung.liefernummer}</TableCell>
                  <TableCell>{lieferung.auftrag}</TableCell>
                  <TableCell>{lieferung.kunde}</TableCell>
                  <TableCell>{lieferung.datum}</TableCell>
                  <TableCell>
                    <Chip 
                      label={lieferung.status} 
                      color={getStatusColor(lieferung.status) as any}
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {lieferung.tracking}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <ViewIcon />
                    </IconButton>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small">
                      <ReceiptIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rechnungsnummer</TableCell>
                <TableCell>Kunde</TableCell>
                <TableCell>Datum</TableCell>
                <TableCell>Fälligkeit</TableCell>
                <TableCell>Betrag</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Zahlungsziel</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rechnungen.map((rechnung) => (
                <TableRow key={rechnung.id}>
                  <TableCell>{rechnung.rechnungsnummer}</TableCell>
                  <TableCell>{rechnung.kunde}</TableCell>
                  <TableCell>{rechnung.datum}</TableCell>
                  <TableCell>{rechnung.faelligkeit}</TableCell>
                  <TableCell>{formatCurrency(rechnung.betrag)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={rechnung.status} 
                      color={getStatusColor(rechnung.status) as any}
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{rechnung.zahlungsziel} Tage</TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <ViewIcon />
                    </IconButton>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small">
                      <PaymentIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={5}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Umsatzentwicklung
                </Typography>
                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Chart: Umsatzentwicklung der letzten 12 Monate
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top-Kunden
                </Typography>
                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Chart: Top 10 Kunden nach Umsatz
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Auftragsstatistiken
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        156
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Aktive Aufträge
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        89%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Liefertreue
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main">
                        12
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Überfällige Rechnungen
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => handleOpenDialog('kunde')}
      >
        <AddIcon />
      </Fab>

      {/* Generic Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'kunde' && 'Neuen Kunden erstellen'}
          {dialogType === 'angebot' && 'Neues Angebot erstellen'}
          {dialogType === 'auftrag' && 'Neuen Auftrag erstellen'}
          {dialogType === 'lieferung' && 'Neue Lieferung erstellen'}
          {dialogType === 'rechnung' && 'Neue Rechnung erstellen'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="E-Mail"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Telefon"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Adresse"
              variant="outlined"
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button onClick={handleCloseDialog} variant="contained">
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalesManagement; 