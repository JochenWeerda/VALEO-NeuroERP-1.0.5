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
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AccountBalance as AccountBalanceIcon,
  Assignment as AssignmentIcon,
  Receipt as ReceiptIcon,
  History as HistoryIcon,
  Notes as NotesIcon,
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
      id={`kunde-tabpanel-${index}`}
      aria-labelledby={`kunde-tab-${index}`}
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

interface Kunde {
  id: string;
  kundennummer: string;
  typ: 'privat' | 'geschaeft';
  name: string;
  ansprechpartner?: string;
  email: string;
  telefon: string;
  adresse: {
    strasse: string;
    plz: string;
    ort: string;
    land: string;
  };
  steuernummer?: string;
  ust_id?: string;
  zahlungsbedingungen: string;
  kreditlimit: number;
  status: 'aktiv' | 'inaktiv' | 'gesperrt';
  kategorie: string;
  notizen: string;
  erstellt_am: string;
  letzte_aktivitaet: string;
}

interface KundenKontakt {
  id: string;
  name: string;
  position: string;
  email: string;
  telefon: string;
  mobil: string;
  ist_hauptansprechpartner: boolean;
}

interface KundenAuftrag {
  id: string;
  auftragsnummer: string;
  datum: string;
  status: 'offen' | 'in_bearbeitung' | 'abgeschlossen' | 'storniert';
  betrag: number;
  beschreibung: string;
}

const KundenFormular: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedKunde, setSelectedKunde] = useState<Kunde | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  // Formular-Daten für neuen Kunden
  const [kundeForm, setKundeForm] = useState({
    kundennummer: '',
    typ: 'geschaeft' as Kunde['typ'],
    name: '',
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
    status: 'aktiv' as Kunde['status'],
    kategorie: 'Standard',
    notizen: ''
  });

  // Mock-Daten für Kunden
  const [kunden, setKunden] = useState<Kunde[]>([
    {
      id: '1',
      kundennummer: 'K-2024-001',
      typ: 'geschaeft',
      name: 'Müller GmbH',
      ansprechpartner: 'Max Müller',
      email: 'max.mueller@mueller-gmbh.de',
      telefon: '+49 89 1234 5678',
      adresse: {
        strasse: 'Musterstraße 123',
        plz: '80331',
        ort: 'München',
        land: 'Deutschland'
      },
      steuernummer: '143/123/12345',
      ust_id: 'DE123456789',
      zahlungsbedingungen: '30 Tage netto',
      kreditlimit: 50000,
      status: 'aktiv',
      kategorie: 'Premium',
      notizen: 'Wichtiger Kunde, bevorzugte Behandlung',
      erstellt_am: '2024-01-15',
      letzte_aktivitaet: '2024-01-20'
    },
    {
      id: '2',
      kundennummer: 'K-2024-002',
      typ: 'privat',
      name: 'Schmidt, Anna',
      email: 'anna.schmidt@email.de',
      telefon: '+49 40 9876 5432',
      adresse: {
        strasse: 'Beispielweg 456',
        plz: '20095',
        ort: 'Hamburg',
        land: 'Deutschland'
      },
      zahlungsbedingungen: 'Sofort',
      kreditlimit: 1000,
      status: 'aktiv',
      kategorie: 'Standard',
      notizen: 'Privatkunde',
      erstellt_am: '2024-01-16',
      letzte_aktivitaet: '2024-01-18'
    }
  ]);

  const [kontakte, setKontakte] = useState<KundenKontakt[]>([]);
  const [auftraege, setAuftraege] = useState<KundenAuftrag[]>([]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (kunde?: Kunde) => {
    if (kunde) {
      setSelectedKunde(kunde);
      setKundeForm({
        kundennummer: kunde.kundennummer,
        typ: kunde.typ,
        name: kunde.name,
        ansprechpartner: kunde.ansprechpartner || '',
        email: kunde.email,
        telefon: kunde.telefon,
        strasse: kunde.adresse.strasse,
        plz: kunde.adresse.plz,
        ort: kunde.adresse.ort,
        land: kunde.adresse.land,
        steuernummer: kunde.steuernummer || '',
        ust_id: kunde.ust_id || '',
        zahlungsbedingungen: kunde.zahlungsbedingungen,
        kreditlimit: kunde.kreditlimit,
        status: kunde.status,
        kategorie: kunde.kategorie,
        notizen: kunde.notizen
      });
    } else {
      setSelectedKunde(null);
      setKundeForm({
        kundennummer: '',
        typ: 'geschaeft',
        name: '',
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
        notizen: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedKunde(null);
  };

  const handleSaveKunde = () => {
    const newKunde: Kunde = {
      id: selectedKunde?.id || Date.now().toString(),
      kundennummer: kundeForm.kundennummer || `K-2024-${String(kunden.length + 1).padStart(3, '0')}`,
      typ: kundeForm.typ,
      name: kundeForm.name,
      ansprechpartner: kundeForm.ansprechpartner || undefined,
      email: kundeForm.email,
      telefon: kundeForm.telefon,
      adresse: {
        strasse: kundeForm.strasse,
        plz: kundeForm.plz,
        ort: kundeForm.ort,
        land: kundeForm.land
      },
      steuernummer: kundeForm.steuernummer || undefined,
      ust_id: kundeForm.ust_id || undefined,
      zahlungsbedingungen: kundeForm.zahlungsbedingungen,
      kreditlimit: kundeForm.kreditlimit,
      status: kundeForm.status,
      kategorie: kundeForm.kategorie,
      notizen: kundeForm.notizen,
      erstellt_am: selectedKunde?.erstellt_am || new Date().toISOString().split('T')[0],
      letzte_aktivitaet: new Date().toISOString().split('T')[0]
    };

    if (selectedKunde) {
      setKunden(kunden.map(k => k.id === selectedKunde.id ? newKunde : k));
      setSnackbar({ open: true, message: 'Kunde erfolgreich aktualisiert!', severity: 'success' });
    } else {
      setKunden([...kunden, newKunde]);
      setSnackbar({ open: true, message: 'Kunde erfolgreich erstellt!', severity: 'success' });
    }
    handleCloseDialog();
  };

  const addKontakt = () => {
    const newKontakt: KundenKontakt = {
      id: Date.now().toString(),
      name: '',
      position: '',
      email: '',
      telefon: '',
      mobil: '',
      ist_hauptansprechpartner: false
    };
    setKontakte([...kontakte, newKontakt]);
  };

  const updateKontakt = (id: string, field: keyof KundenKontakt, value: any) => {
    setKontakte(kontakte.map(kontakt => {
      if (kontakt.id === id) {
        return { ...kontakt, [field]: value };
      }
      return kontakt;
    }));
  };

  const removeKontakt = (id: string) => {
    setKontakte(kontakte.filter(kontakt => kontakt.id !== id));
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
          Kundenverwaltung
        </Typography>

        <Card sx={{ mb: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="Kunden sections">
              <Tab 
                icon={<PersonIcon />} 
                label="Kundenliste" 
                iconPosition="start"
              />
              <Tab 
                icon={<BusinessIcon />} 
                label="Geschäftskunden" 
                iconPosition="start"
              />
              <Tab 
                icon={<AssignmentIcon />} 
                label="Aufträge" 
                iconPosition="start"
              />
              <Tab 
                icon={<HistoryIcon />} 
                label="Aktivitäten" 
                iconPosition="start"
              />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            {/* Kundenliste */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">Alle Kunden</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Neuer Kunde
              </Button>
            </Box>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Kundennummer</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Typ</TableCell>
                    <TableCell>E-Mail</TableCell>
                    <TableCell>Telefon</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Kategorie</TableCell>
                    <TableCell>Aktionen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {kunden.map((kunde) => (
                    <TableRow key={kunde.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {kunde.kundennummer}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {kunde.name}
                          </Typography>
                          {kunde.ansprechpartner && (
                            <Typography variant="caption" color="text.secondary">
                              {kunde.ansprechpartner}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={kunde.typ === 'geschaeft' ? 'Geschäft' : 'Privat'}
                          size="small"
                          color={kunde.typ === 'geschaeft' ? 'primary' : 'secondary'}
                        />
                      </TableCell>
                      <TableCell>{kunde.email}</TableCell>
                      <TableCell>{kunde.telefon}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(kunde.status)}
                          color={getStatusColor(kunde.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{kunde.kategorie}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small" onClick={() => handleOpenDialog(kunde)}>
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
            {/* Geschäftskunden */}
            <Typography variant="h5" sx={{ mb: 3 }}>Geschäftskunden</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Firmenname</TableCell>
                    <TableCell>Ansprechpartner</TableCell>
                    <TableCell>Steuernummer</TableCell>
                    <TableCell>USt-ID</TableCell>
                    <TableCell>Kreditlimit</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {kunden.filter(k => k.typ === 'geschaeft').map((kunde) => (
                    <TableRow key={kunde.id} hover>
                      <TableCell>{kunde.name}</TableCell>
                      <TableCell>{kunde.ansprechpartner}</TableCell>
                      <TableCell>{kunde.steuernummer || '-'}</TableCell>
                      <TableCell>{kunde.ust_id || '-'}</TableCell>
                      <TableCell>{kunde.kreditlimit.toLocaleString('de-DE')} €</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(kunde.status)}
                          color={getStatusColor(kunde.status) as any}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {/* Aufträge */}
            <Typography variant="h5" sx={{ mb: 3 }}>Kundenaufträge</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Auftragsnummer</TableCell>
                    <TableCell>Kunde</TableCell>
                    <TableCell>Datum</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Betrag</TableCell>
                    <TableCell>Beschreibung</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auftraege.map((auftrag) => (
                    <TableRow key={auftrag.id} hover>
                      <TableCell>{auftrag.auftragsnummer}</TableCell>
                      <TableCell>{auftrag.beschreibung}</TableCell>
                      <TableCell>{auftrag.datum}</TableCell>
                      <TableCell>
                        <Chip
                          label={auftrag.status}
                          color={auftrag.status === 'abgeschlossen' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{auftrag.betrag.toLocaleString('de-DE')} €</TableCell>
                      <TableCell>{auftrag.beschreibung}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            {/* Aktivitäten */}
            <Typography variant="h5" sx={{ mb: 3 }}>Kundenaktivitäten</Typography>
            <List>
              {kunden.map((kunde) => (
                <ListItem key={kunde.id}>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${kunde.name} - Letzte Aktivität: ${kunde.letzte_aktivitaet}`}
                    secondary={`Erstellt: ${kunde.erstellt_am}`}
                  />
                </ListItem>
              ))}
            </List>
          </TabPanel>
        </Card>
      </Box>

      {/* Kunden-Erstellungs-Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedKunde ? 'Kunde bearbeiten' : 'Neuen Kunden erstellen'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Kundentyp</InputLabel>
                  <Select
                    value={kundeForm.typ}
                    onChange={(e) => setKundeForm({...kundeForm, typ: e.target.value as Kunde['typ']})}
                    label="Kundentyp"
                  >
                    <MenuItem value="privat">Privatkunde</MenuItem>
                    <MenuItem value="geschaeft">Geschäftskunde</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Kundennummer"
                  value={kundeForm.kundennummer}
                  onChange={(e) => setKundeForm({...kundeForm, kundennummer: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={kundeForm.typ === 'geschaeft' ? 'Firmenname' : 'Name'}
                  value={kundeForm.name}
                  onChange={(e) => setKundeForm({...kundeForm, name: e.target.value})}
                  required
                />
              </Grid>
              {kundeForm.typ === 'geschaeft' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Ansprechpartner"
                    value={kundeForm.ansprechpartner}
                    onChange={(e) => setKundeForm({...kundeForm, ansprechpartner: e.target.value})}
                  />
                </Grid>
              )}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="E-Mail"
                  type="email"
                  value={kundeForm.email}
                  onChange={(e) => setKundeForm({...kundeForm, email: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefon"
                  value={kundeForm.telefon}
                  onChange={(e) => setKundeForm({...kundeForm, telefon: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Straße & Hausnummer"
                  value={kundeForm.strasse}
                  onChange={(e) => setKundeForm({...kundeForm, strasse: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="PLZ"
                  value={kundeForm.plz}
                  onChange={(e) => setKundeForm({...kundeForm, plz: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Ort"
                  value={kundeForm.ort}
                  onChange={(e) => setKundeForm({...kundeForm, ort: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Land"
                  value={kundeForm.land}
                  onChange={(e) => setKundeForm({...kundeForm, land: e.target.value})}
                  required
                />
              </Grid>
              {kundeForm.typ === 'geschaeft' && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Steuernummer"
                      value={kundeForm.steuernummer}
                      onChange={(e) => setKundeForm({...kundeForm, steuernummer: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="USt-ID"
                      value={kundeForm.ust_id}
                      onChange={(e) => setKundeForm({...kundeForm, ust_id: e.target.value})}
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Zahlungsbedingungen"
                  value={kundeForm.zahlungsbedingungen}
                  onChange={(e) => setKundeForm({...kundeForm, zahlungsbedingungen: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Kreditlimit"
                  type="number"
                  value={kundeForm.kreditlimit}
                  onChange={(e) => setKundeForm({...kundeForm, kreditlimit: parseFloat(e.target.value) || 0})}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={kundeForm.status}
                    onChange={(e) => setKundeForm({...kundeForm, status: e.target.value as Kunde['status']})}
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
                  value={kundeForm.kategorie}
                  onChange={(e) => setKundeForm({...kundeForm, kategorie: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notizen"
                  multiline
                  rows={3}
                  value={kundeForm.notizen}
                  onChange={(e) => setKundeForm({...kundeForm, notizen: e.target.value})}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button onClick={handleSaveKunde} variant="contained">
            {selectedKunde ? 'Aktualisieren' : 'Erstellen'}
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

export default KundenFormular; 