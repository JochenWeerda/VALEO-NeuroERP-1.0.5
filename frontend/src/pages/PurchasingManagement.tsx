import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Grid,
  Button,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Fab,
  IconButton,
  Tooltip,
  Alert,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  LocalShipping as ShippingIcon,
  Receipt as ReceiptIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Euro as EuroIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon
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
      id={`purchasing-tabpanel-${index}`}
      aria-labelledby={`purchasing-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const PurchasingManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'lieferant' | 'bestellung' | 'lieferung' | 'rechnung'>('lieferant');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (type: 'lieferant' | 'bestellung' | 'lieferung' | 'rechnung') => {
    setDialogType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Mock-Daten für KPI-Cards
  const kpiData = {
    anzahlLieferanten: 156,
    offeneBestellungen: 23,
    erwarteteLieferungen: 8,
    offeneRechnungen: 45,
    monatlicherEinkauf: 125000,
    durchschnittlicheLieferzeit: 4.2,
    qualitaetsbewertung: 4.6,
    skontoAusnutzung: 78.5
  };

  // Mock-Daten für Lieferanten
  const lieferanten = [
    {
      id: '1',
      lieferant_nr: 'LIE001',
      firmenname: 'Agrarhandel Müller GmbH',
      ansprechpartner: 'Hans Müller',
      telefon: '+49 123 456789',
      email: 'h.mueller@agrar-mueller.de',
      kategorie: 'DÜNGER',
      status: 'AKTIV',
      bewertung: 5,
      anzahlBestellungen: 45,
      offeneBestellungen: 8500.00,
      offeneRechnungen: 12500.00
    },
    {
      id: '2',
      lieferant_nr: 'LIE002',
      firmenname: 'Futtermittel Schmidt KG',
      ansprechpartner: 'Maria Schmidt',
      telefon: '+49 234 567890',
      email: 'info@futter-schmidt.de',
      kategorie: 'FUTTERMITTEL',
      status: 'AKTIV',
      bewertung: 4,
      anzahlBestellungen: 32,
      offeneBestellungen: 4500.00,
      offeneRechnungen: 7800.00
    },
    {
      id: '3',
      lieferant_nr: 'LIE003',
      firmenname: 'PSM-Handel Weber',
      ansprechpartner: 'Peter Weber',
      telefon: '+49 345 678901',
      email: 'p.weber@psm-weber.de',
      kategorie: 'PSM',
      status: 'AKTIV',
      bewertung: 4,
      anzahlBestellungen: 28,
      offeneBestellungen: 1550.00,
      offeneRechnungen: 3200.00
    }
  ];

  // Mock-Daten für Bestellungen
  const bestellungen = [
    {
      id: '1',
      bestellung_nr: 'BES000001',
      lieferant: 'Agrarhandel Müller GmbH',
      bestell_datum: '2024-01-15',
      liefer_datum: '2024-01-22',
      status: 'ERSTELLT',
      gesamtbetrag: 8500.00,
      anzahl_positionen: 3,
      lieferfortschritt: 0
    },
    {
      id: '2',
      bestellung_nr: 'BES000002',
      lieferant: 'Futtermittel Schmidt KG',
      bestell_datum: '2024-01-10',
      liefer_datum: '2024-01-17',
      status: 'BESTÄTIGT',
      gesamtbetrag: 4500.00,
      anzahl_positionen: 2,
      lieferfortschritt: 60
    },
    {
      id: '3',
      bestellung_nr: 'BES000003',
      lieferant: 'PSM-Handel Weber',
      bestell_datum: '2024-01-05',
      liefer_datum: '2024-01-12',
      status: 'VOLLSTÄNDIG',
      gesamtbetrag: 1550.00,
      anzahl_positionen: 1,
      lieferfortschritt: 100
    }
  ];

  // Mock-Daten für Rechnungen
  const rechnungen = [
    {
      id: '1',
      rechnung_nr: 'REK000001',
      lieferant: 'Agrarhandel Müller GmbH',
      rechnungs_datum: '2024-01-10',
      faelligkeits_datum: '2024-02-09',
      rechnungs_betrag: 8500.00,
      zahlungs_betrag: 8500.00,
      status: 'VOLLSTÄNDIG',
      ueberfaellig_tage: 0
    },
    {
      id: '2',
      rechnung_nr: 'REK000002',
      lieferant: 'Futtermittel Schmidt KG',
      rechnungs_datum: '2024-01-20',
      faelligkeits_datum: '2024-02-19',
      rechnungs_betrag: 4500.00,
      zahlungs_betrag: 0,
      status: 'OFFEN',
      ueberfaellig_tage: 0
    },
    {
      id: '3',
      rechnung_nr: 'REK000003',
      lieferant: 'PSM-Handel Weber',
      rechnungs_datum: '2024-01-25',
      faelligkeits_datum: '2024-02-24',
      rechnungs_betrag: 1550.00,
      zahlungs_betrag: 0,
      status: 'OFFEN',
      ueberfaellig_tage: 0
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AKTIV':
      case 'VOLLSTÄNDIG':
        return 'success';
      case 'BESTÄTIGT':
      case 'OFFEN':
        return 'warning';
      case 'ERSTELLT':
        return 'info';
      case 'GESPERRT':
      case 'STORNIERT':
        return 'error';
      default:
        return 'default';
    }
  };

  const getBewertungColor = (bewertung: number) => {
    if (bewertung >= 4.5) return 'success';
    if (bewertung >= 3.5) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Einkaufsmanagement
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Verwaltung von Lieferanten, Bestellungen, Lieferungen und Rechnungen
        </Typography>
      </Box>

      {/* KPI Dashboard */}
      <Box className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PeopleIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" component="div">
                Lieferanten
              </Typography>
            </Box>
            <Typography variant="h4" component="div" sx={{ mb: 1 }}>
              {kpiData.anzahlLieferanten}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Aktive Lieferanten
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <InventoryIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6" component="div">
                Offene Bestellungen
              </Typography>
            </Box>
            <Typography variant="h4" component="div" sx={{ mb: 1 }}>
              {kpiData.offeneBestellungen}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Warten auf Lieferung
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ShippingIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="h6" component="div">
                Erwartete Lieferungen
              </Typography>
            </Box>
            <Typography variant="h4" component="div" sx={{ mb: 1 }}>
              {kpiData.erwarteteLieferungen}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Diese Woche
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ReceiptIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="h6" component="div">
                Offene Rechnungen
              </Typography>
            </Box>
            <Typography variant="h4" component="div" sx={{ mb: 1 }}>
              {kpiData.offeneRechnungen}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Zu begleichen
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Weitere KPI-Cards */}
      <Box className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EuroIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="h6" component="div">
                Monatlicher Einkauf
              </Typography>
            </Box>
            <Typography variant="h4" component="div" sx={{ mb: 1 }}>
              {kpiData.monatlicherEinkauf.toLocaleString('de-DE')} €
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Durchschnitt
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ScheduleIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" component="div">
                Lieferzeit
              </Typography>
            </Box>
            <Typography variant="h4" component="div" sx={{ mb: 1 }}>
              {kpiData.durchschnittlicheLieferzeit}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tage (Ø)
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AssessmentIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="h6" component="div">
                Qualitätsbewertung
              </Typography>
            </Box>
            <Typography variant="h4" component="div" sx={{ mb: 1 }}>
              {kpiData.qualitaetsbewertung}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              von 5 Sternen
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CheckCircleIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="h6" component="div">
                Skonto-Ausnutzung
              </Typography>
            </Box>
            <Typography variant="h4" component="div" sx={{ mb: 1 }}>
              {kpiData.skontoAusnutzung}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Erfolgreich genutzt
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="Einkaufsmanagement Tabs">
            <Tab label="Lieferanten" />
            <Tab label="Bestellungen" />
            <Tab label="Lieferungen" />
            <Tab label="Rechnungen" />
            <Tab label="Statistiken" />
          </Tabs>
        </Box>

        {/* Lieferanten Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Lieferantenverwaltung</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('lieferant')}
            >
              Neuer Lieferant
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Lieferant-Nr</TableCell>
                  <TableCell>Firmenname</TableCell>
                  <TableCell>Ansprechpartner</TableCell>
                  <TableCell>Kategorie</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Bewertung</TableCell>
                  <TableCell>Offene Bestellungen</TableCell>
                  <TableCell>Offene Rechnungen</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lieferanten.map((lieferant) => (
                  <TableRow key={lieferant.id}>
                    <TableCell>{lieferant.lieferant_nr}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {lieferant.firmenname}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <PhoneIcon sx={{ fontSize: 14, mr: 0.5 }} />
                          <Typography variant="caption">{lieferant.telefon}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{lieferant.ansprechpartner}</TableCell>
                    <TableCell>
                      <Chip label={lieferant.kategorie} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={lieferant.status} 
                        color={getStatusColor(lieferant.status) as any}
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${lieferant.bewertung}/5`}
                        color={getBewertungColor(lieferant.bewertung) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="warning.main">
                        {lieferant.offeneBestellungen.toLocaleString('de-DE')} €
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="error.main">
                        {lieferant.offeneRechnungen.toLocaleString('de-DE')} €
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Bearbeiten">
                          <IconButton size="small" color="primary">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Anzeigen">
                          <IconButton size="small" color="info">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Löschen">
                          <IconButton size="small" color="error">
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

        {/* Bestellungen Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Bestellverwaltung</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('bestellung')}
            >
              Neue Bestellung
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Bestellung-Nr</TableCell>
                  <TableCell>Lieferant</TableCell>
                  <TableCell>Bestell-Datum</TableCell>
                  <TableCell>Liefer-Datum</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Gesamtbetrag</TableCell>
                  <TableCell>Lieferfortschritt</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bestellungen.map((bestellung) => (
                  <TableRow key={bestellung.id}>
                    <TableCell>{bestellung.bestellung_nr}</TableCell>
                    <TableCell>{bestellung.lieferant}</TableCell>
                    <TableCell>{bestellung.bestell_datum}</TableCell>
                    <TableCell>{bestellung.liefer_datum}</TableCell>
                    <TableCell>
                      <Chip 
                        label={bestellung.status} 
                        color={getStatusColor(bestellung.status) as any}
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {bestellung.gesamtbetrag.toLocaleString('de-DE')} €
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={bestellung.lieferfortschritt} 
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="body2" color="text.secondary">
                            {bestellung.lieferfortschritt}%
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Bearbeiten">
                          <IconButton size="small" color="primary">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Anzeigen">
                          <IconButton size="small" color="info">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Drucken">
                          <IconButton size="small" color="secondary">
                            <PrintIcon />
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

        {/* Lieferungen Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Lieferungsverwaltung</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('lieferung')}
            >
              Neue Lieferung
            </Button>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>8 Lieferungen</strong> werden heute erwartet. 
              <strong>3 Lieferungen</strong> sind bereits unterwegs.
            </Typography>
          </Alert>

          <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Heute erwartet
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ShippingIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="h4">8</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Lieferungen stehen an
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Unterwegs
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ShippingIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h4">3</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Lieferungen in Bearbeitung
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        {/* Rechnungen Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Rechnungsverwaltung</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('rechnung')}
            >
              Neue Rechnung
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rechnung-Nr</TableCell>
                  <TableCell>Lieferant</TableCell>
                  <TableCell>Rechnungs-Datum</TableCell>
                  <TableCell>Fälligkeits-Datum</TableCell>
                  <TableCell>Rechnungsbetrag</TableCell>
                  <TableCell>Zahlungsbetrag</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Überfällig</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rechnungen.map((rechnung) => (
                  <TableRow key={rechnung.id}>
                    <TableCell>{rechnung.rechnung_nr}</TableCell>
                    <TableCell>{rechnung.lieferant}</TableCell>
                    <TableCell>{rechnung.rechnungs_datum}</TableCell>
                    <TableCell>{rechnung.faelligkeits_datum}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {rechnung.rechnungs_betrag.toLocaleString('de-DE')} €
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="success.main">
                        {rechnung.zahlungs_betrag.toLocaleString('de-DE')} €
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={rechnung.status} 
                        color={getStatusColor(rechnung.status) as any}
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      {rechnung.ueberfaellig_tage > 0 ? (
                        <Chip 
                          label={`${rechnung.ueberfaellig_tage} Tage`}
                          color="error"
                          size="small"
                          icon={<WarningIcon />}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Bearbeiten">
                          <IconButton size="small" color="primary">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Anzeigen">
                          <IconButton size="small" color="info">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Zahlen">
                          <IconButton size="small" color="success">
                            <EuroIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Drucken">
                          <IconButton size="small" color="secondary">
                            <PrintIcon />
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

        {/* Statistiken Tab */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>
            Einkaufsstatistiken
          </Typography>

          <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Einkaufsvolumen nach Kategorie
                </Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Chart: Einkaufsvolumen nach Kategorie
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Lieferantenbewertungen
                </Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Chart: Lieferantenbewertungen
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Monatliche Einkaufsentwicklung
                </Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Chart: Monatliche Einkaufsentwicklung
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      </Card>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => handleOpenDialog('lieferant')}
      >
        <AddIcon />
      </Fab>

      {/* Dialog für neue Einträge */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'lieferant' && 'Neuer Lieferant'}
          {dialogType === 'bestellung' && 'Neue Bestellung'}
          {dialogType === 'lieferung' && 'Neue Lieferung'}
          {dialogType === 'rechnung' && 'Neue Rechnung'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Bezeichnung"
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Kategorie</InputLabel>
                  <Select label="Kategorie">
                    <MenuItem value="DÜNGER">Dünger</MenuItem>
                    <MenuItem value="FUTTERMITTEL">Futtermittel</MenuItem>
                    <MenuItem value="PSM">PSM</MenuItem>
                    <MenuItem value="MASCHINEN">Maschinen</MenuItem>
                    <MenuItem value="DIENSTLEISTUNG">Dienstleistung</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Beschreibung"
                  variant="outlined"
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PurchasingManagement; 