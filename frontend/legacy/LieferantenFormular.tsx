import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Snackbar,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AccountBalance as AccountBalanceIcon,
  Assignment as AssignmentIcon,
  Receipt as ReceiptIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
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
      id={`lieferant-tabpanel-${index}`}
      aria-labelledby={`lieferant-tab-${index}`}
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

interface Lieferant {
  id: string;
  lieferantennummer: string;
  firmenname: string;
  ansprechpartner: string;
  email: string;
  telefon: string;
  adresse: {
    strasse: string;
    plz: string;
    ort: string;
    land: string;
  };
  steuernummer: string;
  ust_id: string;
  zahlungsbedingungen: string;
  kreditlimit: number;
  status: 'aktiv' | 'inaktiv' | 'gesperrt';
  kategorie: string;
  notizen: string;
  erstellt_am: string;
  letzte_aktivitaet: string;
  bewertung: number;
}

const LieferantenFormular: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLieferant, setSelectedLieferant] = useState<Lieferant | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  // Formular-Daten für neuen Lieferanten
  const [lieferantForm, setLieferantForm] = useState({
    lieferantennummer: '',
    firmenname: '',
    ansprechpartner: '',
    email: '',
    telefon: '',
    strasse: '',
    plz: '',
    ort: '',
    land: 'Deutschland',
    steuernummer: '',
    ust_id: '',
    zahlungsbedingungen: '30 Tage netto',
    kreditlimit: 0,
    status: 'aktiv' as Lieferant['status'],
    kategorie: 'Standard',
    notizen: '',
    bewertung: 5
  });

  // Mock-Daten für Lieferanten
  const [lieferanten, setLieferanten] = useState<Lieferant[]>([
    {
      id: '1',
      lieferantennummer: 'L-2024-001',
      firmenname: 'TechSupply GmbH',
      ansprechpartner: 'Hans Weber',
      email: 'h.weber@techsupply.de',
      telefon: '+49 30 1234 5678',
      adresse: {
        strasse: 'Industriestraße 45',
        plz: '10115',
        ort: 'Berlin',
        land: 'Deutschland'
      },
      steuernummer: '29/123/12345',
      ust_id: 'DE123456789',
      zahlungsbedingungen: '30 Tage netto',
      kreditlimit: 100000,
      status: 'aktiv',
      kategorie: 'Premium',
      notizen: 'Hauptlieferant für Elektronik',
      erstellt_am: '2024-01-15',
      letzte_aktivitaet: '2024-01-20',
      bewertung: 4.5
    },
    {
      id: '2',
      lieferantennummer: 'L-2024-002',
      firmenname: 'MaterialHandel KG',
      ansprechpartner: 'Maria Schmidt',
      email: 'm.schmidt@materialhandel.de',
      telefon: '+49 40 9876 5432',
      adresse: {
        strasse: 'Handelsweg 78',
        plz: '20095',
        ort: 'Hamburg',
        land: 'Deutschland'
      },
      steuernummer: '22/456/78901',
      ust_id: 'DE987654321',
      zahlungsbedingungen: '14 Tage netto',
      kreditlimit: 50000,
      status: 'aktiv',
      kategorie: 'Standard',
      notizen: 'Lieferant für Rohmaterialien',
      erstellt_am: '2024-01-16',
      letzte_aktivitaet: '2024-01-18',
      bewertung: 4.0
    }
  ]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (lieferant?: Lieferant) => {
    if (lieferant) {
      setSelectedLieferant(lieferant);
      setLieferantForm({
        lieferantennummer: lieferant.lieferantennummer,
        firmenname: lieferant.firmenname,
        ansprechpartner: lieferant.ansprechpartner,
        email: lieferant.email,
        telefon: lieferant.telefon,
        strasse: lieferant.adresse.strasse,
        plz: lieferant.adresse.plz,
        ort: lieferant.adresse.ort,
        land: lieferant.adresse.land,
        steuernummer: lieferant.steuernummer,
        ust_id: lieferant.ust_id,
        zahlungsbedingungen: lieferant.zahlungsbedingungen,
        kreditlimit: lieferant.kreditlimit,
        status: lieferant.status,
        kategorie: lieferant.kategorie,
        notizen: lieferant.notizen,
        bewertung: lieferant.bewertung
      });
    } else {
      setSelectedLieferant(null);
      setLieferantForm({
        lieferantennummer: '',
        firmenname: '',
        ansprechpartner: '',
        email: '',
        telefon: '',
        strasse: '',
        plz: '',
        ort: '',
        land: 'Deutschland',
        steuernummer: '',
        ust_id: '',
        zahlungsbedingungen: '30 Tage netto',
        kreditlimit: 0,
        status: 'aktiv',
        kategorie: 'Standard',
        notizen: '',
        bewertung: 5
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedLieferant(null);
  };

  const handleSaveLieferant = () => {
    const newLieferant: Lieferant = {
      id: selectedLieferant?.id || Date.now().toString(),
      lieferantennummer: lieferantForm.lieferantennummer || `L-2024-${String(lieferanten.length + 1).padStart(3, '0')}`,
      firmenname: lieferantForm.firmenname,
      ansprechpartner: lieferantForm.ansprechpartner,
      email: lieferantForm.email,
      telefon: lieferantForm.telefon,
      adresse: {
        strasse: lieferantForm.strasse,
        plz: lieferantForm.plz,
        ort: lieferantForm.ort,
        land: lieferantForm.land
      },
      steuernummer: lieferantForm.steuernummer,
      ust_id: lieferantForm.ust_id,
      zahlungsbedingungen: lieferantForm.zahlungsbedingungen,
      kreditlimit: lieferantForm.kreditlimit,
      status: lieferantForm.status,
      kategorie: lieferantForm.kategorie,
      notizen: lieferantForm.notizen,
      erstellt_am: selectedLieferant?.erstellt_am || new Date().toISOString().split('T')[0],
      letzte_aktivitaet: new Date().toISOString().split('T')[0],
      bewertung: lieferantForm.bewertung
    };

    if (selectedLieferant) {
      setLieferanten(lieferanten.map(l => l.id === selectedLieferant.id ? newLieferant : l));
      setSnackbar({ open: true, message: 'Lieferant erfolgreich aktualisiert!', severity: 'success' });
    } else {
      setLieferanten([...lieferanten, newLieferant]);
      setSnackbar({ open: true, message: 'Lieferant erfolgreich erstellt!', severity: 'success' });
    }
    handleCloseDialog();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aktiv': return 'success';
      case 'inaktiv': return 'default';
      case 'gesperrt': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'aktiv': return 'Aktiv';
      case 'inaktiv': return 'Inaktiv';
      case 'gesperrt': return 'Gesperrt';
      default: return status;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5F6F7' }}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: '#0A6ED1' }}>
          Lieferantenverwaltung
        </Typography>

        <Card sx={{ mb: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="Lieferanten sections">
              <Tab 
                icon={<BusinessIcon />} 
                label="Lieferantenliste" 
                iconPosition="start"
              />
              <Tab 
                icon={<AssignmentIcon />} 
                label="Bestellungen" 
                iconPosition="start"
              />
              <Tab 
                icon={<ReceiptIcon />} 
                label="Rechnungen" 
                iconPosition="start"
              />
              <Tab 
                icon={<HistoryIcon />} 
                label="Bewertungen" 
                iconPosition="start"
              />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            {/* Lieferantenliste */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">Alle Lieferanten</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Neuer Lieferant
              </Button>
            </Box>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Lieferantennummer</TableCell>
                    <TableCell>Firmenname</TableCell>
                    <TableCell>Ansprechpartner</TableCell>
                    <TableCell>E-Mail</TableCell>
                    <TableCell>Telefon</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Bewertung</TableCell>
                    <TableCell>Aktionen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lieferanten.map((lieferant) => (
                    <TableRow key={lieferant.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {lieferant.lieferantennummer}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {lieferant.firmenname}
                        </Typography>
                      </TableCell>
                      <TableCell>{lieferant.ansprechpartner}</TableCell>
                      <TableCell>{lieferant.email}</TableCell>
                      <TableCell>{lieferant.telefon}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(lieferant.status)}
                          color={getStatusColor(lieferant.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${lieferant.bewertung}/5`}
                          color={lieferant.bewertung >= 4 ? 'success' : lieferant.bewertung >= 3 ? 'warning' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small" onClick={() => handleOpenDialog(lieferant)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {/* Bestellungen */}
            <Typography variant="h5" sx={{ mb: 3 }}>Lieferantenbestellungen</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Bestellnummer</TableCell>
                    <TableCell>Lieferant</TableCell>
                    <TableCell>Datum</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Betrag</TableCell>
                    <TableCell>Beschreibung</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        Keine Bestellungen vorhanden
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {/* Rechnungen */}
            <Typography variant="h5" sx={{ mb: 3 }}>Lieferantenrechnungen</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Rechnungsnummer</TableCell>
                    <TableCell>Lieferant</TableCell>
                    <TableCell>Datum</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Betrag</TableCell>
                    <TableCell>Fälligkeitsdatum</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        Keine Rechnungen vorhanden
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            {/* Bewertungen */}
            <Typography variant="h5" sx={{ mb: 3 }}>Lieferantenbewertungen</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Lieferant</TableCell>
                    <TableCell>Bewertung</TableCell>
                    <TableCell>Kategorie</TableCell>
                    <TableCell>Letzte Aktivität</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lieferanten.map((lieferant) => (
                    <TableRow key={lieferant.id} hover>
                      <TableCell>{lieferant.firmenname}</TableCell>
                      <TableCell>
                        <Chip
                          label={`${lieferant.bewertung}/5`}
                          color={lieferant.bewertung >= 4 ? 'success' : lieferant.bewertung >= 3 ? 'warning' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{lieferant.kategorie}</TableCell>
                      <TableCell>{lieferant.letzte_aktivitaet}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(lieferant.status)}
                          color={getStatusColor(lieferant.status) as any}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Card>
      </Box>

      {/* Lieferanten-Erstellungs-Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedLieferant ? 'Lieferant bearbeiten' : 'Neuen Lieferanten erstellen'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Lieferantennummer"
                  value={lieferantForm.lieferantennummer}
                  onChange={(e) => setLieferantForm({...lieferantForm, lieferantennummer: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Firmenname"
                  value={lieferantForm.firmenname}
                  onChange={(e) => setLieferantForm({...lieferantForm, firmenname: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Ansprechpartner"
                  value={lieferantForm.ansprechpartner}
                  onChange={(e) => setLieferantForm({...lieferantForm, ansprechpartner: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="E-Mail"
                  type="email"
                  value={lieferantForm.email}
                  onChange={(e) => setLieferantForm({...lieferantForm, email: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefon"
                  value={lieferantForm.telefon}
                  onChange={(e) => setLieferantForm({...lieferantForm, telefon: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Straße & Hausnummer"
                  value={lieferantForm.strasse}
                  onChange={(e) => setLieferantForm({...lieferantForm, strasse: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="PLZ"
                  value={lieferantForm.plz}
                  onChange={(e) => setLieferantForm({...lieferantForm, plz: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Ort"
                  value={lieferantForm.ort}
                  onChange={(e) => setLieferantForm({...lieferantForm, ort: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Land"
                  value={lieferantForm.land}
                  onChange={(e) => setLieferantForm({...lieferantForm, land: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Steuernummer"
                  value={lieferantForm.steuernummer}
                  onChange={(e) => setLieferantForm({...lieferantForm, steuernummer: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="USt-ID"
                  value={lieferantForm.ust_id}
                  onChange={(e) => setLieferantForm({...lieferantForm, ust_id: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Zahlungsbedingungen"
                  value={lieferantForm.zahlungsbedingungen}
                  onChange={(e) => setLieferantForm({...lieferantForm, zahlungsbedingungen: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Kreditlimit"
                  type="number"
                  value={lieferantForm.kreditlimit}
                  onChange={(e) => setLieferantForm({...lieferantForm, kreditlimit: parseFloat(e.target.value) || 0})}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={lieferantForm.status}
                    onChange={(e) => setLieferantForm({...lieferantForm, status: e.target.value as Lieferant['status']})}
                    label="Status"
                  >
                    <MenuItem value="aktiv">Aktiv</MenuItem>
                    <MenuItem value="inaktiv">Inaktiv</MenuItem>
                    <MenuItem value="gesperrt">Gesperrt</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Kategorie"
                  value={lieferantForm.kategorie}
                  onChange={(e) => setLieferantForm({...lieferantForm, kategorie: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notizen"
                  multiline
                  rows={3}
                  value={lieferantForm.notizen}
                  onChange={(e) => setLieferantForm({...lieferantForm, notizen: e.target.value})}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button onClick={handleSaveLieferant} variant="contained">
            {selectedLieferant ? 'Aktualisieren' : 'Erstellen'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LieferantenFormular; 