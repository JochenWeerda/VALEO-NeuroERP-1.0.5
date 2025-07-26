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
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  AttachMoney as PriceIcon,
  ExpandMore as ExpandMoreIcon,
  ShoppingCart as ProductIcon,
  LocalOffer as OfferIcon,
  TrendingUp as TrendingIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon
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

interface Produkt {
  id: string;
  name: string;
  artikelnummer: string;
  kategorie: string;
  beschreibung: string;
  preis: number;
  mwst: number;
  lagerbestand: number;
  mindestbestand: number;
  einheit: string;
  hersteller: string;
  status: 'aktiv' | 'inaktiv' | 'ausverkauft';
  bild?: string;
  gewicht: number;
  dimensionen: string;
  ean: string;
  erstelltAm: string;
  geaendertAm: string;
}

interface Kategorie {
  id: string;
  name: string;
  beschreibung: string;
  produktAnzahl: number;
  parentKategorie?: string;
}

interface Lagerbestand {
  produktId: string;
  produktName: string;
  aktuellerBestand: number;
  mindestbestand: number;
  reserviert: number;
  verfuegbar: number;
  letzteBewegung: string;
  status: 'normal' | 'niedrig' | 'kritisch';
}

interface Preis {
  produktId: string;
  produktName: string;
  listenpreis: number;
  verkaufspreis: number;
  rabatt: number;
  mwst: number;
  waehrung: string;
  gueltigAb: string;
  gueltigBis?: string;
}

const ProduktFormular: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProdukt, setSelectedProdukt] = useState<Produkt | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });

  // Mock-Daten
  const [produkte, setProdukte] = useState<Produkt[]>([
    {
      id: '1',
      name: 'Industrie-Schraube M8x20',
      artikelnummer: 'SCHR-001',
      kategorie: 'Befestigungselemente',
      beschreibung: 'Edelstahl-Schraube für industrielle Anwendungen',
      preis: 0.85,
      mwst: 19,
      lagerbestand: 1250,
      mindestbestand: 100,
      einheit: 'Stück',
      hersteller: 'Schrauben GmbH',
      status: 'aktiv',
      gewicht: 0.012,
      dimensionen: 'M8x20mm',
      ean: '4001234567890',
      erstelltAm: '2024-01-15',
      geaendertAm: '2024-01-20'
    },
    {
      id: '2',
      name: 'Aluminium-Profil 40x40',
      artikelnummer: 'PROF-002',
      kategorie: 'Profile',
      beschreibung: 'Aluminium-Profil für Maschinenbau',
      preis: 12.50,
      mwst: 19,
      lagerbestand: 45,
      mindestbestand: 20,
      einheit: 'Meter',
      hersteller: 'AluTech AG',
      status: 'aktiv',
      gewicht: 1.2,
      dimensionen: '40x40mm',
      ean: '4001234567891',
      erstelltAm: '2024-01-10',
      geaendertAm: '2024-01-18'
    },
    {
      id: '3',
      name: 'Sicherheits-Schalter',
      artikelnummer: 'SCHALT-003',
      kategorie: 'Elektronik',
      beschreibung: 'Not-Aus-Schalter mit Sicherheitsfunktion',
      preis: 89.90,
      mwst: 19,
      lagerbestand: 8,
      mindestbestand: 10,
      einheit: 'Stück',
      hersteller: 'ElektroSafe',
      status: 'aktiv',
      gewicht: 0.5,
      dimensionen: '80x60x30mm',
      ean: '4001234567892',
      erstelltAm: '2024-01-05',
      geaendertAm: '2024-01-15'
    }
  ]);

  const [kategorien, setKategorien] = useState<Kategorie[]>([
    {
      id: '1',
      name: 'Befestigungselemente',
      beschreibung: 'Schrauben, Muttern, Unterlegscheiben',
      produktAnzahl: 45
    },
    {
      id: '2',
      name: 'Profile',
      beschreibung: 'Aluminium- und Stahlprofile',
      produktAnzahl: 23
    },
    {
      id: '3',
      name: 'Elektronik',
      beschreibung: 'Schalter, Sensoren, Steuerungen',
      produktAnzahl: 67
    },
    {
      id: '4',
      name: 'Werkzeuge',
      beschreibung: 'Hand- und Elektrowerkzeuge',
      produktAnzahl: 34
    }
  ]);

  const [lagerbestand, setLagerbestand] = useState<Lagerbestand[]>([
    {
      produktId: '1',
      produktName: 'Industrie-Schraube M8x20',
      aktuellerBestand: 1250,
      mindestbestand: 100,
      reserviert: 50,
      verfuegbar: 1200,
      letzteBewegung: '2024-01-20',
      status: 'normal'
    },
    {
      produktId: '2',
      produktName: 'Aluminium-Profil 40x40',
      aktuellerBestand: 45,
      mindestbestand: 20,
      reserviert: 5,
      verfuegbar: 40,
      letzteBewegung: '2024-01-19',
      status: 'normal'
    },
    {
      produktId: '3',
      produktName: 'Sicherheits-Schalter',
      aktuellerBestand: 8,
      mindestbestand: 10,
      reserviert: 2,
      verfuegbar: 6,
      letzteBewegung: '2024-01-18',
      status: 'kritisch'
    }
  ]);

  const [preise, setPreise] = useState<Preis[]>([
    {
      produktId: '1',
      produktName: 'Industrie-Schraube M8x20',
      listenpreis: 1.00,
      verkaufspreis: 0.85,
      rabatt: 15,
      mwst: 19,
      waehrung: 'EUR',
      gueltigAb: '2024-01-01'
    },
    {
      produktId: '2',
      produktName: 'Aluminium-Profil 40x40',
      listenpreis: 15.00,
      verkaufspreis: 12.50,
      rabatt: 17,
      mwst: 19,
      waehrung: 'EUR',
      gueltigAb: '2024-01-01'
    },
    {
      produktId: '3',
      produktName: 'Sicherheits-Schalter',
      listenpreis: 99.90,
      verkaufspreis: 89.90,
      rabatt: 10,
      mwst: 19,
      waehrung: 'EUR',
      gueltigAb: '2024-01-01'
    }
  ]);

  const [produktForm, setProduktForm] = useState<Partial<Produkt>>({
    name: '',
    artikelnummer: '',
    kategorie: '',
    beschreibung: '',
    preis: 0,
    mwst: 19,
    lagerbestand: 0,
    mindestbestand: 0,
    einheit: 'Stück',
    hersteller: '',
    status: 'aktiv',
    gewicht: 0,
    dimensionen: '',
    ean: ''
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (produkt?: Produkt) => {
    if (produkt) {
      setSelectedProdukt(produkt);
      setProduktForm(produkt);
    } else {
      setSelectedProdukt(null);
      setProduktForm({
        name: '',
        artikelnummer: '',
        kategorie: '',
        beschreibung: '',
        preis: 0,
        mwst: 19,
        lagerbestand: 0,
        mindestbestand: 0,
        einheit: 'Stück',
        hersteller: '',
        status: 'aktiv',
        gewicht: 0,
        dimensionen: '',
        ean: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProdukt(null);
    setProduktForm({});
  };

  const handleSaveProdukt = () => {
    if (selectedProdukt) {
      // Update existing product
      setProdukte(produkte.map(p => 
        p.id === selectedProdukt.id 
          ? { ...produktForm, id: p.id, geaendertAm: new Date().toISOString().split('T')[0] } as Produkt
          : p
      ));
      setSnackbar({
        open: true,
        message: 'Produkt erfolgreich aktualisiert',
        severity: 'success'
      });
    } else {
      // Create new product
      const newProdukt: Produkt = {
        ...produktForm,
        id: Date.now().toString(),
        erstelltAm: new Date().toISOString().split('T')[0],
        geaendertAm: new Date().toISOString().split('T')[0]
      } as Produkt;
      setProdukte([...produkte, newProdukt]);
      setSnackbar({
        open: true,
        message: 'Produkt erfolgreich erstellt',
        severity: 'success'
      });
    }
    handleCloseDialog();
  };

  const handleDeleteProdukt = (id: string) => {
    setProdukte(produkte.filter(p => p.id !== id));
    setSnackbar({
      open: true,
      message: 'Produkt erfolgreich gelöscht',
      severity: 'success'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aktiv': return 'success';
      case 'inaktiv': return 'default';
      case 'ausverkauft': return 'error';
      default: return 'default';
    }
  };

  const getLagerStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'success';
      case 'niedrig': return 'warning';
      case 'kritisch': return 'error';
      default: return 'default';
    }
  };

  const getLagerStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return <CheckIcon />;
      case 'niedrig': return <WarningIcon />;
      case 'kritisch': return <ErrorIcon />;
      default: return <InfoIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ProductIcon color="primary" />
          Produktverwaltung
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          Neues Produkt
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Produktliste" icon={<ProductIcon />} iconPosition="start" />
          <Tab label="Kategorien" icon={<CategoryIcon />} iconPosition="start" />
          <Tab label="Lagerbestand" icon={<InventoryIcon />} iconPosition="start" />
          <Tab label="Preise" icon={<PriceIcon />} iconPosition="start" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Artikelnummer</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Kategorie</TableCell>
                  <TableCell>Preis (€)</TableCell>
                  <TableCell>Lagerbestand</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {produkte.map((produkt) => (
                  <TableRow key={produkt.id}>
                    <TableCell>{produkt.artikelnummer}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          <ProductIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {produkt.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {produkt.hersteller}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{produkt.kategorie}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {produkt.preis.toFixed(2)} €
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          {produkt.lagerbestand} {produkt.einheit}
                        </Typography>
                        {produkt.lagerbestand <= produkt.mindestbestand && (
                          <Chip
                            size="small"
                            color="warning"
                            icon={<WarningIcon />}
                            label="Niedrig"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={produkt.status}
                        color={getStatusColor(produkt.status) as any}
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
                            onClick={() => handleOpenDialog(produkt)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Löschen">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteProdukt(produkt.id)}
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
            {kategorien.map((kategorie) => (
              <Grid item xs={12} md={6} lg={4} key={kategorie.id}>
                <Card sx={{ p: 2, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <CategoryIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{kategorie.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {kategorie.produktAnzahl} Produkte
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {kategorie.beschreibung}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" variant="outlined">
                      Bearbeiten
                    </Button>
                    <Button size="small" variant="outlined" color="error">
                      Löschen
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Produkt</TableCell>
                  <TableCell>Verfügbar</TableCell>
                  <TableCell>Reserviert</TableCell>
                  <TableCell>Mindestbestand</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Letzte Bewegung</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lagerbestand.map((item) => (
                  <TableRow key={item.produktId}>
                    <TableCell>{item.produktName}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {item.verfuegbar}
                      </Typography>
                    </TableCell>
                    <TableCell>{item.reserviert}</TableCell>
                    <TableCell>{item.mindestbestand}</TableCell>
                    <TableCell>
                      <Chip
                        icon={getLagerStatusIcon(item.status)}
                        label={item.status}
                        color={getLagerStatusColor(item.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{item.letzteBewegung}</TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined">
                        Bestand anpassen
                      </Button>
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
                  <TableCell>Produkt</TableCell>
                  <TableCell>Listenpreis (€)</TableCell>
                  <TableCell>Verkaufspreis (€)</TableCell>
                  <TableCell>Rabatt (%)</TableCell>
                  <TableCell>MwSt (%)</TableCell>
                  <TableCell>Gültig ab</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {preise.map((preis) => (
                  <TableRow key={preis.produktId}>
                    <TableCell>{preis.produktName}</TableCell>
                    <TableCell>{preis.listenpreis.toFixed(2)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium" color="primary">
                        {preis.verkaufspreis.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${preis.rabatt}%`} 
                        color="success" 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{preis.mwst}%</TableCell>
                    <TableCell>{preis.gueltigAb}</TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined">
                        Preis anpassen
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Card>

      {/* Dialog für Produkt bearbeiten/erstellen */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProdukt ? 'Produkt bearbeiten' : 'Neues Produkt erstellen'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Produktname"
                value={produktForm.name || ''}
                onChange={(e) => setProduktForm({...produktForm, name: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Artikelnummer"
                value={produktForm.artikelnummer || ''}
                onChange={(e) => setProduktForm({...produktForm, artikelnummer: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Kategorie</InputLabel>
                <Select
                  value={produktForm.kategorie || ''}
                  onChange={(e) => setProduktForm({...produktForm, kategorie: e.target.value})}
                  label="Kategorie"
                >
                  {kategorien.map((kat) => (
                    <MenuItem key={kat.id} value={kat.name}>
                      {kat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Hersteller"
                value={produktForm.hersteller || ''}
                onChange={(e) => setProduktForm({...produktForm, hersteller: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Beschreibung"
                value={produktForm.beschreibung || ''}
                onChange={(e) => setProduktForm({...produktForm, beschreibung: e.target.value})}
                margin="normal"
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Preis (€)"
                type="number"
                value={produktForm.preis || ''}
                onChange={(e) => setProduktForm({...produktForm, preis: parseFloat(e.target.value) || 0})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="MwSt (%)"
                type="number"
                value={produktForm.mwst || ''}
                onChange={(e) => setProduktForm({...produktForm, mwst: parseFloat(e.target.value) || 0})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Einheit</InputLabel>
                <Select
                  value={produktForm.einheit || ''}
                  onChange={(e) => setProduktForm({...produktForm, einheit: e.target.value})}
                  label="Einheit"
                >
                  <MenuItem value="Stück">Stück</MenuItem>
                  <MenuItem value="Meter">Meter</MenuItem>
                  <MenuItem value="Kilogramm">Kilogramm</MenuItem>
                  <MenuItem value="Liter">Liter</MenuItem>
                  <MenuItem value="Packung">Packung</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Lagerbestand"
                type="number"
                value={produktForm.lagerbestand || ''}
                onChange={(e) => setProduktForm({...produktForm, lagerbestand: parseInt(e.target.value) || 0})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mindestbestand"
                type="number"
                value={produktForm.mindestbestand || ''}
                onChange={(e) => setProduktForm({...produktForm, mindestbestand: parseInt(e.target.value) || 0})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Gewicht (kg)"
                type="number"
                value={produktForm.gewicht || ''}
                onChange={(e) => setProduktForm({...produktForm, gewicht: parseFloat(e.target.value) || 0})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Dimensionen"
                value={produktForm.dimensionen || ''}
                onChange={(e) => setProduktForm({...produktForm, dimensionen: e.target.value})}
                margin="normal"
                placeholder="z.B. 100x50x25mm"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="EAN-Code"
                value={produktForm.ean || ''}
                onChange={(e) => setProduktForm({...produktForm, ean: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={produktForm.status || ''}
                  onChange={(e) => setProduktForm({...produktForm, status: e.target.value as any})}
                  label="Status"
                >
                  <MenuItem value="aktiv">Aktiv</MenuItem>
                  <MenuItem value="inaktiv">Inaktiv</MenuItem>
                  <MenuItem value="ausverkauft">Ausverkauft</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button onClick={handleSaveProdukt} variant="contained">
            {selectedProdukt ? 'Aktualisieren' : 'Erstellen'}
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

export default ProduktFormular; 