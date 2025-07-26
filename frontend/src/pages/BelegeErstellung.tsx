import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Container,
  Tabs,
  Tab,
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
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Receipt as ReceiptIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as ShippingIcon,
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Euro as EuroIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';

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
      id={`beleg-tabpanel-${index}`}
      aria-labelledby={`beleg-tab-${index}`}
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

interface BelegPosition {
  id: string;
  artikelnummer: string;
  bezeichnung: string;
  menge: number;
  einheit: string;
  einzelpreis: number;
  gesamtpreis: number;
  mwst: number;
}

interface Beleg {
  id: string;
  belegtyp: 'angebot' | 'auftrag' | 'bestellung' | 'lieferschein' | 'rechnung';
  belegnummer: string;
  datum: string;
  kunde_lieferant: string;
  status: 'draft' | 'sent' | 'confirmed' | 'delivered' | 'paid';
  positionen: BelegPosition[];
  gesamtbetrag: number;
  mwst_betrag: number;
  endbetrag: number;
}

const BelegeErstellung: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tabValue, setTabValue] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBeleg, setSelectedBeleg] = useState<Beleg | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  // URL-Parameter für Tab-Navigation
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam !== null) {
      const tabIndex = parseInt(tabParam);
      if (tabIndex >= 0 && tabIndex <= 4) {
        setTabValue(tabIndex);
      }
    }
  }, [searchParams]);

  // Formular-Daten für neuen Beleg
  const [belegForm, setBelegForm] = useState({
    belegtyp: 'angebot' as Beleg['belegtyp'],
    belegnummer: '',
    datum: new Date().toISOString().split('T')[0],
    kunde_lieferant: '',
    ansprechpartner: '',
    email: '',
    telefon: '',
    adresse: '',
    zahlungsbedingungen: '30 Tage netto',
    lieferbedingungen: 'Frei Haus',
    notizen: ''
  });

  // Mock-Daten für Belege
  const [belege, setBelege] = useState<Beleg[]>([
    {
      id: '1',
      belegtyp: 'angebot',
      belegnummer: 'ANG-2024-001',
      datum: '2024-01-15',
      kunde_lieferant: 'Müller GmbH',
      status: 'sent',
      positionen: [
        {
          id: '1',
          artikelnummer: 'ART-001',
          bezeichnung: 'Futtermittel Premium',
          menge: 100,
          einheit: 'kg',
          einzelpreis: 2.50,
          gesamtpreis: 250.00,
          mwst: 19
        }
      ],
      gesamtbetrag: 250.00,
      mwst_betrag: 47.50,
      endbetrag: 297.50
    },
    {
      id: '2',
      belegtyp: 'auftrag',
      belegnummer: 'AUF-2024-001',
      datum: '2024-01-16',
      kunde_lieferant: 'Schmidt KG',
      status: 'confirmed',
      positionen: [
        {
          id: '1',
          artikelnummer: 'ART-002',
          bezeichnung: 'Dünger NPK',
          menge: 50,
          einheit: 'kg',
          einzelpreis: 1.80,
          gesamtpreis: 90.00,
          mwst: 19
        }
      ],
      gesamtbetrag: 90.00,
      mwst_betrag: 17.10,
      endbetrag: 107.10
    }
  ]);

  const [positionen, setPositionen] = useState<BelegPosition[]>([]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setSearchParams({ tab: newValue.toString() });
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handleOpenDialog = (beleg?: Beleg) => {
    if (beleg) {
      setSelectedBeleg(beleg);
    } else {
      setSelectedBeleg(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBeleg(null);
  };

  const handleSaveBeleg = () => {
    const newBeleg: Beleg = {
      id: Date.now().toString(),
      belegtyp: belegForm.belegtyp,
      belegnummer: belegForm.belegnummer || `${belegForm.belegtyp.toUpperCase()}-2024-${String(belege.length + 1).padStart(3, '0')}`,
      datum: belegForm.datum,
      kunde_lieferant: belegForm.kunde_lieferant,
      status: 'draft',
      positionen: positionen,
      gesamtbetrag: positionen.reduce((sum, pos) => sum + pos.gesamtpreis, 0),
      mwst_betrag: positionen.reduce((sum, pos) => sum + (pos.gesamtpreis * pos.mwst / 100), 0),
      endbetrag: positionen.reduce((sum, pos) => sum + pos.gesamtpreis * (1 + pos.mwst / 100), 0)
    };

    setBelege([...belege, newBeleg]);
    setSnackbar({ open: true, message: 'Beleg erfolgreich erstellt!', severity: 'success' });
    handleCloseDialog();
    resetForm();
  };

  const resetForm = () => {
    setBelegForm({
      belegtyp: 'angebot',
      belegnummer: '',
      datum: new Date().toISOString().split('T')[0],
      kunde_lieferant: '',
      ansprechpartner: '',
      email: '',
      telefon: '',
      adresse: '',
      zahlungsbedingungen: '30 Tage netto',
      lieferbedingungen: 'Frei Haus',
      notizen: ''
    });
    setPositionen([]);
    setActiveStep(0);
  };

  const addPosition = () => {
    const newPosition: BelegPosition = {
      id: Date.now().toString(),
      artikelnummer: '',
      bezeichnung: '',
      menge: 1,
      einheit: 'Stück',
      einzelpreis: 0,
      gesamtpreis: 0,
      mwst: 19
    };
    setPositionen([...positionen, newPosition]);
  };

  const updatePosition = (id: string, field: keyof BelegPosition, value: any) => {
    setPositionen(positionen.map(pos => {
      if (pos.id === id) {
        const updated = { ...pos, [field]: value };
        if (field === 'menge' || field === 'einzelpreis') {
          updated.gesamtpreis = updated.menge * updated.einzelpreis;
        }
        return updated;
      }
      return pos;
    }));
  };

  const removePosition = (id: string) => {
    setPositionen(positionen.filter(pos => pos.id !== id));
  };

  const getBelegTypIcon = (typ: string) => {
    switch (typ) {
      case 'angebot': return <DescriptionIcon />;
      case 'auftrag': return <AssignmentIcon />;
      case 'bestellung': return <ShoppingCartIcon />;
      case 'lieferschein': return <ShippingIcon />;
      case 'rechnung': return <ReceiptIcon />;
      default: return <DescriptionIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'sent': return 'info';
      case 'confirmed': return 'warning';
      case 'delivered': return 'success';
      case 'paid': return 'success';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Entwurf';
      case 'sent': return 'Versendet';
      case 'confirmed': return 'Bestätigt';
      case 'delivered': return 'Geliefert';
      case 'paid': return 'Bezahlt';
      default: return status;
    }
  };

  const steps = [
    {
      label: 'Belegtyp & Grunddaten',
      description: 'Wählen Sie den Belegtyp und erfassen Sie die Grunddaten'
    },
    {
      label: 'Kunde/Lieferant',
      description: 'Erfassen Sie die Kontaktdaten des Kunden oder Lieferanten'
    },
    {
      label: 'Positionen',
      description: 'Fügen Sie Artikel und Positionen hinzu'
    },
    {
      label: 'Zusammenfassung',
      description: 'Überprüfen Sie alle Daten vor dem Speichern'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5F6F7' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: '#0A6ED1' }}>
          Belege-Erstellung
        </Typography>

        <Card sx={{ mb: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="Beleg types">
              <Tab 
                icon={<DescriptionIcon />} 
                label="Angebote" 
                iconPosition="start"
              />
              <Tab 
                icon={<AssignmentIcon />} 
                label="Aufträge" 
                iconPosition="start"
              />
              <Tab 
                icon={<ShoppingCartIcon />} 
                label="Bestellungen" 
                iconPosition="start"
              />
              <Tab 
                icon={<ShippingIcon />} 
                label="Lieferscheine" 
                iconPosition="start"
              />
              <Tab 
                icon={<ReceiptIcon />} 
                label="Rechnungen" 
                iconPosition="start"
              />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            {/* Angebote */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">Angebote</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Neues Angebot
              </Button>
            </Box>
            <BelegListe belege={belege.filter(b => b.belegtyp === 'angebot')} onEdit={handleOpenDialog} />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {/* Aufträge */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">Aufträge</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Neuer Auftrag
              </Button>
            </Box>
            <BelegListe belege={belege.filter(b => b.belegtyp === 'auftrag')} onEdit={handleOpenDialog} />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {/* Bestellungen */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">Bestellungen</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Neue Bestellung
              </Button>
            </Box>
            <BelegListe belege={belege.filter(b => b.belegtyp === 'bestellung')} onEdit={handleOpenDialog} />
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            {/* Lieferscheine */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">Lieferscheine</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Neuer Lieferschein
              </Button>
            </Box>
            <BelegListe belege={belege.filter(b => b.belegtyp === 'lieferschein')} onEdit={handleOpenDialog} />
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            {/* Rechnungen */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">Rechnungen</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Neue Rechnung
              </Button>
            </Box>
            <BelegListe belege={belege.filter(b => b.belegtyp === 'rechnung')} onEdit={handleOpenDialog} />
          </TabPanel>
        </Card>
      </Container>

      {/* Beleg-Erstellungs-Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {selectedBeleg ? 'Beleg bearbeiten' : 'Neuen Beleg erstellen'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel>{step.label}</StepLabel>
                  <StepContent>
                    <Typography>{step.description}</Typography>
                    
                    {index === 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">Belegtyp & Grunddaten</Typography>
                          <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={addPosition}
                          >
                            Position hinzufügen
                          </Button>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <FormControl fullWidth sx={{ mr: 2 }}>
                            <InputLabel>Belegtyp</InputLabel>
                            <Select
                              value={belegForm.belegtyp}
                              onChange={(e) => setBelegForm({...belegForm, belegtyp: e.target.value as Beleg['belegtyp']})}
                              label="Belegtyp"
                            >
                              <MenuItem value="angebot">Angebot</MenuItem>
                              <MenuItem value="auftrag">Auftrag</MenuItem>
                              <MenuItem value="bestellung">Bestellung</MenuItem>
                              <MenuItem value="lieferschein">Lieferschein</MenuItem>
                              <MenuItem value="rechnung">Rechnung</MenuItem>
                            </Select>
                          </FormControl>
                          <TextField
                            fullWidth
                            label="Belegnummer"
                            value={belegForm.belegnummer}
                            onChange={(e) => setBelegForm({...belegForm, belegnummer: e.target.value})}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <TextField
                            fullWidth
                            label="Datum"
                            type="date"
                            value={belegForm.datum}
                            onChange={(e) => setBelegForm({...belegForm, datum: e.target.value})}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Box>
                      </Box>
                    )}

                    {index === 1 && (
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">Kunde/Lieferant</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <TextField
                            fullWidth
                            label="Kunde/Lieferant"
                            value={belegForm.kunde_lieferant}
                            onChange={(e) => setBelegForm({...belegForm, kunde_lieferant: e.target.value})}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <TextField
                            fullWidth
                            label="Ansprechpartner"
                            value={belegForm.ansprechpartner}
                            onChange={(e) => setBelegForm({...belegForm, ansprechpartner: e.target.value})}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <TextField
                            fullWidth
                            label="E-Mail"
                            type="email"
                            value={belegForm.email}
                            onChange={(e) => setBelegForm({...belegForm, email: e.target.value})}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <TextField
                            fullWidth
                            label="Telefon"
                            value={belegForm.telefon}
                            onChange={(e) => setBelegForm({...belegForm, telefon: e.target.value})}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <TextField
                            fullWidth
                            label="Adresse"
                            multiline
                            rows={3}
                            value={belegForm.adresse}
                            onChange={(e) => setBelegForm({...belegForm, adresse: e.target.value})}
                          />
                        </Box>
                      </Box>
                    )}

                    {index === 2 && (
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">Positionen</Typography>
                          <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={addPosition}
                          >
                            Position hinzufügen
                          </Button>
                        </Box>
                        
                        <TableContainer component={Paper}>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Artikelnummer</TableCell>
                                <TableCell>Bezeichnung</TableCell>
                                <TableCell>Menge</TableCell>
                                <TableCell>Einheit</TableCell>
                                <TableCell>Einzelpreis</TableCell>
                                <TableCell>Gesamtpreis</TableCell>
                                <TableCell>MwSt. %</TableCell>
                                <TableCell>Aktionen</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {positionen.map((position) => (
                                <TableRow key={position.id}>
                                  <TableCell>
                                    <TextField
                                      size="small"
                                      value={position.artikelnummer}
                                      onChange={(e) => updatePosition(position.id, 'artikelnummer', e.target.value)}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <TextField
                                      size="small"
                                      value={position.bezeichnung}
                                      onChange={(e) => updatePosition(position.id, 'bezeichnung', e.target.value)}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <TextField
                                      size="small"
                                      type="number"
                                      value={position.menge}
                                      onChange={(e) => updatePosition(position.id, 'menge', parseFloat(e.target.value) || 0)}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <TextField
                                      size="small"
                                      value={position.einheit}
                                      onChange={(e) => updatePosition(position.id, 'einheit', e.target.value)}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <TextField
                                      size="small"
                                      type="number"
                                      value={position.einzelpreis}
                                      onChange={(e) => updatePosition(position.id, 'einzelpreis', parseFloat(e.target.value) || 0)}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    {position.gesamtpreis.toFixed(2)} €
                                  </TableCell>
                                  <TableCell>
                                    <TextField
                                      size="small"
                                      type="number"
                                      value={position.mwst}
                                      onChange={(e) => updatePosition(position.id, 'mwst', parseFloat(e.target.value) || 0)}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => removePosition(position.id)}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}

                    {index === 3 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Zusammenfassung</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="subtitle2">Belegtyp: {belegForm.belegtyp}</Typography>
                          <Typography variant="subtitle2">Belegnummer: {belegForm.belegnummer}</Typography>
                          <Typography variant="subtitle2">Datum: {belegForm.datum}</Typography>
                          <Typography variant="subtitle2">Kunde/Lieferant: {belegForm.kunde_lieferant}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="subtitle2">Anzahl Positionen: {positionen.length}</Typography>
                          <Typography variant="subtitle2">Gesamtbetrag: {positionen.reduce((sum, pos) => sum + pos.gesamtpreis, 0).toFixed(2)} €</Typography>
                          <Typography variant="subtitle2">MwSt.: {positionen.reduce((sum, pos) => sum + (pos.gesamtpreis * pos.mwst / 100), 0).toFixed(2)} €</Typography>
                          <Typography variant="subtitle2">Endbetrag: {positionen.reduce((sum, pos) => sum + pos.gesamtpreis * (1 + pos.mwst / 100), 0).toFixed(2)} €</Typography>
                        </Box>
                      </Box>
                    )}

                    <Box sx={{ mb: 2, mt: 2 }}>
                      <div>
                        <Button
                          variant="contained"
                          onClick={index === steps.length - 1 ? handleSaveBeleg : handleNext}
                          sx={{ mt: 1, mr: 1 }}
                        >
                          {index === steps.length - 1 ? 'Beleg speichern' : 'Weiter'}
                        </Button>
                        <Button
                          disabled={index === 0}
                          onClick={handleBack}
                          sx={{ mt: 1, mr: 1 }}
                        >
                          Zurück
                        </Button>
                      </div>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
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

// Komponente für die Beleg-Liste
const BelegListe: React.FC<{ belege: Beleg[], onEdit: (beleg: Beleg) => void }> = ({ belege, onEdit }) => {
  const getBelegTypIcon = (typ: string) => {
    switch (typ) {
      case 'angebot': return <DescriptionIcon />;
      case 'auftrag': return <AssignmentIcon />;
      case 'bestellung': return <ShoppingCartIcon />;
      case 'lieferschein': return <ShippingIcon />;
      case 'rechnung': return <ReceiptIcon />;
      default: return <DescriptionIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'sent': return 'info';
      case 'confirmed': return 'warning';
      case 'delivered': return 'success';
      case 'paid': return 'success';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Entwurf';
      case 'sent': return 'Versendet';
      case 'confirmed': return 'Bestätigt';
      case 'delivered': return 'Geliefert';
      case 'paid': return 'Bezahlt';
      default: return status;
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Belegnummer</TableCell>
            <TableCell>Datum</TableCell>
            <TableCell>Kunde/Lieferant</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Gesamtbetrag</TableCell>
            <TableCell>Aktionen</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {belege.map((beleg) => (
            <TableRow key={beleg.id} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getBelegTypIcon(beleg.belegtyp)}
                  {beleg.belegnummer}
                </Box>
              </TableCell>
              <TableCell>{beleg.datum}</TableCell>
              <TableCell>{beleg.kunde_lieferant}</TableCell>
              <TableCell>
                <Chip
                  label={getStatusText(beleg.status)}
                  color={getStatusColor(beleg.status) as any}
                  size="small"
                />
              </TableCell>
              <TableCell>{beleg.endbetrag.toFixed(2)} €</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton size="small" onClick={() => onEdit(beleg)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small">
                    <ViewIcon />
                  </IconButton>
                  <IconButton size="small">
                    <PrintIcon />
                  </IconButton>
                  <IconButton size="small">
                    <EmailIcon />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default BelegeErstellung; 