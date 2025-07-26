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
  Tab,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Assignment as AssignmentIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CalendarToday as CalendarIcon,
  AccountCircle as AccountCircleIcon
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
      id={`mitarbeiter-tabpanel-${index}`}
      aria-labelledby={`mitarbeiter-tab-${index}`}
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

interface Mitarbeiter {
  id: string;
  mitarbeiternummer: string;
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  geburtsdatum: string;
  eintrittsdatum: string;
  abteilungsnummer: string;
  abteilung: string;
  position: string;
  gehalt: number;
  status: 'aktiv' | 'inaktiv' | 'urlaub' | 'krank';
  vertragsart: 'unbefristet' | 'befristet' | 'teilzeit' | 'werkstudent';
  adresse: {
    strasse: string;
    plz: string;
    ort: string;
    land: string;
  };
  notizen: string;
  foto?: string;
}

const MitarbeiterFormular: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMitarbeiter, setSelectedMitarbeiter] = useState<Mitarbeiter | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  // Formular-Daten für neuen Mitarbeiter
  const [mitarbeiterForm, setMitarbeiterForm] = useState({
    mitarbeiternummer: '',
    vorname: '',
    nachname: '',
    email: '',
    telefon: '',
    geburtsdatum: '',
    eintrittsdatum: new Date().toISOString().split('T')[0],
    abteilungsnummer: '',
    abteilung: '',
    position: '',
    gehalt: 0,
    status: 'aktiv' as Mitarbeiter['status'],
    vertragsart: 'unbefristet' as Mitarbeiter['vertragsart'],
    strasse: '',
    plz: '',
    ort: '',
    land: 'Deutschland',
    notizen: ''
  });

  // Mock-Daten für Mitarbeiter
  const [mitarbeiter, setMitarbeiter] = useState<Mitarbeiter[]>([
    {
      id: '1',
      mitarbeiternummer: 'MA-2024-001',
      vorname: 'Max',
      nachname: 'Mustermann',
      email: 'max.mustermann@valeo.de',
      telefon: '+49 89 1234 5678',
      geburtsdatum: '1985-03-15',
      eintrittsdatum: '2020-01-15',
      abteilungsnummer: 'IT-001',
      abteilung: 'IT & Entwicklung',
      position: 'Senior Entwickler',
      gehalt: 65000,
      status: 'aktiv',
      vertragsart: 'unbefristet',
      adresse: {
        strasse: 'Musterstraße 123',
        plz: '80331',
        ort: 'München',
        land: 'Deutschland'
      },
      notizen: 'Erfahrener Full-Stack Entwickler'
    },
    {
      id: '2',
      mitarbeiternummer: 'MA-2024-002',
      vorname: 'Anna',
      nachname: 'Schmidt',
      email: 'anna.schmidt@valeo.de',
      telefon: '+49 40 9876 5432',
      geburtsdatum: '1990-07-22',
      eintrittsdatum: '2022-03-01',
      abteilungsnummer: 'HR-001',
      abteilung: 'Personalwesen',
      position: 'HR Manager',
      gehalt: 58000,
      status: 'aktiv',
      vertragsart: 'unbefristet',
      adresse: {
        strasse: 'Beispielweg 456',
        plz: '20095',
        ort: 'Hamburg',
        land: 'Deutschland'
      },
      notizen: 'Verantwortlich für Recruiting'
    }
  ]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (mitarbeiter?: Mitarbeiter) => {
    if (mitarbeiter) {
      setSelectedMitarbeiter(mitarbeiter);
      setMitarbeiterForm({
        mitarbeiternummer: mitarbeiter.mitarbeiternummer,
        vorname: mitarbeiter.vorname,
        nachname: mitarbeiter.nachname,
        email: mitarbeiter.email,
        telefon: mitarbeiter.telefon,
        geburtsdatum: mitarbeiter.geburtsdatum,
        eintrittsdatum: mitarbeiter.eintrittsdatum,
        abteilungsnummer: mitarbeiter.abteilungsnummer,
        abteilung: mitarbeiter.abteilung,
        position: mitarbeiter.position,
        gehalt: mitarbeiter.gehalt,
        status: mitarbeiter.status,
        vertragsart: mitarbeiter.vertragsart,
        strasse: mitarbeiter.adresse.strasse,
        plz: mitarbeiter.adresse.plz,
        ort: mitarbeiter.adresse.ort,
        land: mitarbeiter.adresse.land,
        notizen: mitarbeiter.notizen
      });
    } else {
      setSelectedMitarbeiter(null);
      setMitarbeiterForm({
        mitarbeiternummer: '',
        vorname: '',
        nachname: '',
        email: '',
        telefon: '',
        geburtsdatum: '',
        eintrittsdatum: new Date().toISOString().split('T')[0],
        abteilungsnummer: '',
        abteilung: '',
        position: '',
        gehalt: 0,
        status: 'aktiv',
        vertragsart: 'unbefristet',
        strasse: '',
        plz: '',
        ort: '',
        land: 'Deutschland',
        notizen: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMitarbeiter(null);
  };

  const handleSaveMitarbeiter = () => {
    const newMitarbeiter: Mitarbeiter = {
      id: selectedMitarbeiter?.id || Date.now().toString(),
      mitarbeiternummer: mitarbeiterForm.mitarbeiternummer || `MA-2024-${String(mitarbeiter.length + 1).padStart(3, '0')}`,
      vorname: mitarbeiterForm.vorname,
      nachname: mitarbeiterForm.nachname,
      email: mitarbeiterForm.email,
      telefon: mitarbeiterForm.telefon,
      geburtsdatum: mitarbeiterForm.geburtsdatum,
      eintrittsdatum: mitarbeiterForm.eintrittsdatum,
      abteilungsnummer: mitarbeiterForm.abteilungsnummer,
      abteilung: mitarbeiterForm.abteilung,
      position: mitarbeiterForm.position,
      gehalt: mitarbeiterForm.gehalt,
      status: mitarbeiterForm.status,
      vertragsart: mitarbeiterForm.vertragsart,
      adresse: {
        strasse: mitarbeiterForm.strasse,
        plz: mitarbeiterForm.plz,
        ort: mitarbeiterForm.ort,
        land: mitarbeiterForm.land
      },
      notizen: mitarbeiterForm.notizen
    };

    if (selectedMitarbeiter) {
      setMitarbeiter(mitarbeiter.map(m => m.id === selectedMitarbeiter.id ? newMitarbeiter : m));
      setSnackbar({ open: true, message: 'Mitarbeiter erfolgreich aktualisiert!', severity: 'success' });
    } else {
      setMitarbeiter([...mitarbeiter, newMitarbeiter]);
      setSnackbar({ open: true, message: 'Mitarbeiter erfolgreich erstellt!', severity: 'success' });
    }
    handleCloseDialog();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aktiv': return 'success';
      case 'inaktiv': return 'default';
      case 'urlaub': return 'warning';
      case 'krank': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'aktiv': return 'Aktiv';
      case 'inaktiv': return 'Inaktiv';
      case 'urlaub': return 'Urlaub';
      case 'krank': return 'Krank';
      default: return status;
    }
  };

  const getVertragsartText = (vertragsart: string) => {
    switch (vertragsart) {
      case 'unbefristet': return 'Unbefristet';
      case 'befristet': return 'Befristet';
      case 'teilzeit': return 'Teilzeit';
      case 'werkstudent': return 'Werkstudent';
      default: return vertragsart;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5F6F7' }}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: '#0A6ED1' }}>
          Personalverwaltung
        </Typography>

        <Card sx={{ mb: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="Mitarbeiter sections">
              <Tab 
                icon={<PersonIcon />} 
                label="Mitarbeiterliste" 
                iconPosition="start"
              />
              <Tab 
                icon={<BusinessIcon />} 
                label="Abteilungen" 
                iconPosition="start"
              />
              <Tab 
                icon={<AssignmentIcon />} 
                label="Zeiterfassung" 
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
            {/* Mitarbeiterliste */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">Alle Mitarbeiter</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Neuer Mitarbeiter
              </Button>
            </Box>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Foto</TableCell>
                    <TableCell>Mitarbeiternummer</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Abteilung</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>E-Mail</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Vertragsart</TableCell>
                    <TableCell>Aktionen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mitarbeiter.map((ma) => (
                    <TableRow key={ma.id} hover>
                      <TableCell>
                        <Avatar sx={{ width: 40, height: 40 }}>
                          {ma.foto ? (
                            <img src={ma.foto} alt={`${ma.vorname} ${ma.nachname}`} />
                          ) : (
                            <PersonIcon />
                          )}
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {ma.mitarbeiternummer}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {ma.vorname} {ma.nachname}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {ma.telefon}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {ma.abteilung}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {ma.abteilungsnummer}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{ma.position}</TableCell>
                      <TableCell>{ma.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(ma.status)}
                          color={getStatusColor(ma.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getVertragsartText(ma.vertragsart)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small" onClick={() => handleOpenDialog(ma)}>
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
            {/* Abteilungen */}
            <Typography variant="h5" sx={{ mb: 3 }}>Abteilungsübersicht</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Abteilungsnummer</TableCell>
                    <TableCell>Abteilungsname</TableCell>
                    <TableCell>Anzahl Mitarbeiter</TableCell>
                    <TableCell>Leiter</TableCell>
                    <TableCell>Budget</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>IT-001</TableCell>
                    <TableCell>IT & Entwicklung</TableCell>
                    <TableCell>12</TableCell>
                    <TableCell>Max Mustermann</TableCell>
                    <TableCell>850.000 €</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>HR-001</TableCell>
                    <TableCell>Personalwesen</TableCell>
                    <TableCell>8</TableCell>
                    <TableCell>Anna Schmidt</TableCell>
                    <TableCell>320.000 €</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {/* Zeiterfassung */}
            <Typography variant="h5" sx={{ mb: 3 }}>Zeiterfassung</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Mitarbeiter</TableCell>
                    <TableCell>Datum</TableCell>
                    <TableCell>Eingang</TableCell>
                    <TableCell>Ausgang</TableCell>
                    <TableCell>Arbeitszeit</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        Keine Zeiterfassungsdaten vorhanden
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            {/* Aktivitäten */}
            <Typography variant="h5" sx={{ mb: 3 }}>Mitarbeiteraktivitäten</Typography>
            <List>
              {mitarbeiter.map((ma) => (
                <ListItem key={ma.id}>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${ma.vorname} ${ma.nachname} - ${ma.position}`}
                    secondary={`Abteilung: ${ma.abteilung} | Eintritt: ${ma.eintrittsdatum}`}
                  />
                  <Chip
                    label={getStatusText(ma.status)}
                    color={getStatusColor(ma.status) as any}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </TabPanel>
        </Card>
      </Box>

      {/* Mitarbeiter-Erstellungs-Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedMitarbeiter ? 'Mitarbeiter bearbeiten' : 'Neuen Mitarbeiter erstellen'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Mitarbeiternummer"
                  value={mitarbeiterForm.mitarbeiternummer}
                  onChange={(e) => setMitarbeiterForm({...mitarbeiterForm, mitarbeiternummer: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Eintrittsdatum"
                  type="date"
                  value={mitarbeiterForm.eintrittsdatum}
                  onChange={(e) => setMitarbeiterForm({...mitarbeiterForm, eintrittsdatum: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Vorname"
                  value={mitarbeiterForm.vorname}
                  onChange={(e) => setMitarbeiterForm({...mitarbeiterForm, vorname: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nachname"
                  value={mitarbeiterForm.nachname}
                  onChange={(e) => setMitarbeiterForm({...mitarbeiterForm, nachname: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="E-Mail"
                  type="email"
                  value={mitarbeiterForm.email}
                  onChange={(e) => setMitarbeiterForm({...mitarbeiterForm, email: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefon"
                  value={mitarbeiterForm.telefon}
                  onChange={(e) => setMitarbeiterForm({...mitarbeiterForm, telefon: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Geburtsdatum"
                  type="date"
                  value={mitarbeiterForm.geburtsdatum}
                  onChange={(e) => setMitarbeiterForm({...mitarbeiterForm, geburtsdatum: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Position"
                  value={mitarbeiterForm.position}
                  onChange={(e) => setMitarbeiterForm({...mitarbeiterForm, position: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Abteilungsnummer"
                  value={mitarbeiterForm.abteilungsnummer}
                  onChange={(e) => setMitarbeiterForm({...mitarbeiterForm, abteilungsnummer: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Abteilung"
                  value={mitarbeiterForm.abteilung}
                  onChange={(e) => setMitarbeiterForm({...mitarbeiterForm, abteilung: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Gehalt"
                  type="number"
                  value={mitarbeiterForm.gehalt}
                  onChange={(e) => setMitarbeiterForm({...mitarbeiterForm, gehalt: parseFloat(e.target.value) || 0})}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={mitarbeiterForm.status}
                    onChange={(e) => setMitarbeiterForm({...mitarbeiterForm, status: e.target.value as Mitarbeiter['status']})}
                    label="Status"
                  >
                    <MenuItem value="aktiv">Aktiv</MenuItem>
                    <MenuItem value="inaktiv">Inaktiv</MenuItem>
                    <MenuItem value="urlaub">Urlaub</MenuItem>
                    <MenuItem value="krank">Krank</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Vertragsart</InputLabel>
                  <Select
                    value={mitarbeiterForm.vertragsart}
                    onChange={(e) => setMitarbeiterForm({...mitarbeiterForm, vertragsart: e.target.value as Mitarbeiter['vertragsart']})}
                    label="Vertragsart"
                  >
                    <MenuItem value="unbefristet">Unbefristet</MenuItem>
                    <MenuItem value="befristet">Befristet</MenuItem>
                    <MenuItem value="teilzeit">Teilzeit</MenuItem>
                    <MenuItem value="werkstudent">Werkstudent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Straße & Hausnummer"
                  value={mitarbeiterForm.strasse}
                  onChange={(e) => setMitarbeiterForm({...mitarbeiterForm, strasse: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="PLZ"
                  value={mitarbeiterForm.plz}
                  onChange={(e) => setMitarbeiterForm({...mitarbeiterForm, plz: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Ort"
                  value={mitarbeiterForm.ort}
                  onChange={(e) => setMitarbeiterForm({...mitarbeiterForm, ort: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Land"
                  value={mitarbeiterForm.land}
                  onChange={(e) => setMitarbeiterForm({...mitarbeiterForm, land: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notizen"
                  multiline
                  rows={3}
                  value={mitarbeiterForm.notizen}
                  onChange={(e) => setMitarbeiterForm({...mitarbeiterForm, notizen: e.target.value})}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button onClick={handleSaveMitarbeiter} variant="contained">
            {selectedMitarbeiter ? 'Aktualisieren' : 'Erstellen'}
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

export default MitarbeiterFormular; 