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
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress
} from '@mui/material';
import {
  Build as BuildIcon,
  DirectionsCar as CarIcon,
  Business as BusinessIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Euro as EuroIcon,
  CalendarToday as CalendarIcon,
  Speed as SpeedIcon,
  LocalGasStation as GasIcon
} from '@mui/icons-material';

// Interfaces
interface Asset {
  id: string;
  anlagennummer: string;
  bezeichnung: string;
  kategoriename: string;
  anschaffungsdatum: string;
  anschaffungswert: number;
  restbuchwert: number;
  status: string;
  standort: string;
  verantwortlicher_name: string;
  anzahl_wartungen: number;
  naechste_wartung: string;
}

interface Vehicle {
  id: string;
  anlagennummer: string;
  kennzeichen: string;
  marke: string;
  modell: string;
  baujahr: number;
  kilometerstand: number;
  tuev_bis: string;
  versicherung_bis: string;
  steuer_bis: string;
  hauptfahrer: string;
  letzter_tank: string;
  durchschnittsverbrauch: number;
}

interface Maintenance {
  id: string;
  auftragsnummer: string;
  anlagennummer: string;
  anlagenbezeichnung: string;
  wartungstyp: string;
  geplantes_datum: string;
  tatsaechliches_datum?: string;
  status: string;
  prioritaet: string;
  verantwortlicher: string;
  kosten: number;
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
      id={`asset-tabpanel-${index}`}
      aria-labelledby={`asset-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AssetManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [assets, setAssets] = useState<Asset[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  
  // Dialog states
  const [assetDialogOpen, setAssetDialogOpen] = useState(false);
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  
  // Form states
  const [assetForm, setAssetForm] = useState({
    bezeichnung: '',
    kategoriename: '',
    anschaffungsdatum: '',
    anschaffungswert: '',
    standort: '',
    status: 'Aktiv'
  });

  const [vehicleForm, setVehicleForm] = useState({
    kennzeichen: '',
    marke: '',
    modell: '',
    baujahr: '',
    kilometerstand: '',
    tuev_bis: '',
    versicherung_bis: '',
    steuer_bis: ''
  });

  const [maintenanceForm, setMaintenanceForm] = useState({
    anlage_id: '',
    wartungstyp: '',
    geplantes_datum: '',
    prioritaet: 'Normal',
    beschreibung: ''
  });

  useEffect(() => {
    loadAssetData();
  }, []);

  const loadAssetData = async () => {
    setLoading(true);
    try {
      // Simuliere API-Aufrufe
      const mockAssets: Asset[] = [
        {
          id: '1',
          anlagennummer: 'ANL-2024-0001',
          bezeichnung: 'Dell Latitude Laptop',
          kategoriename: 'IT-Equipment',
          anschaffungsdatum: '2024-01-15',
          anschaffungswert: 1200,
          restbuchwert: 800,
          status: 'Aktiv',
          standort: 'Hauptsitz',
          verantwortlicher_name: 'Max Mustermann',
          anzahl_wartungen: 2,
          naechste_wartung: '2024-06-15'
        },
        {
          id: '2',
          anlagennummer: 'ANL-2024-0002',
          bezeichnung: 'Bürostuhl ergonomisch',
          kategoriename: 'Büroausstattung',
          anschaffungsdatum: '2024-02-01',
          anschaffungswert: 500,
          restbuchwert: 400,
          status: 'Aktiv',
          standort: 'Hauptsitz',
          verantwortlicher_name: 'Anna Schmidt',
          anzahl_wartungen: 0,
          naechste_wartung: 'Keine geplant'
        },
        {
          id: '3',
          anlagennummer: 'ANL-2024-0003',
          bezeichnung: 'VW Passat Firmenwagen',
          kategoriename: 'Fahrzeuge',
          anschaffungsdatum: '2024-01-01',
          anschaffungswert: 35000,
          restbuchwert: 28000,
          status: 'Aktiv',
          standort: 'Hauptsitz',
          verantwortlicher_name: 'Tom Weber',
          anzahl_wartungen: 1,
          naechste_wartung: '2024-05-20'
        }
      ];

      const mockVehicles: Vehicle[] = [
        {
          id: '1',
          anlagennummer: 'ANL-2024-0003',
          kennzeichen: 'M-AB 1234',
          marke: 'VW',
          modell: 'Passat',
          baujahr: 2024,
          kilometerstand: 15000,
          tuev_bis: '2025-01-01',
          versicherung_bis: '2024-12-31',
          steuer_bis: '2024-12-31',
          hauptfahrer: 'Tom Weber',
          letzter_tank: '2024-03-15',
          durchschnittsverbrauch: 6.5
        }
      ];

      const mockMaintenance: Maintenance[] = [
        {
          id: '1',
          auftragsnummer: 'WA-2024-000001',
          anlagennummer: 'ANL-2024-0001',
          anlagenbezeichnung: 'Dell Latitude Laptop',
          wartungstyp: 'Wartung',
          geplantes_datum: '2024-06-15',
          status: 'Geplant',
          prioritaet: 'Normal',
          verantwortlicher: 'Max Mustermann',
          kosten: 50
        },
        {
          id: '2',
          auftragsnummer: 'WA-2024-000002',
          anlagennummer: 'ANL-2024-0003',
          anlagenbezeichnung: 'VW Passat Firmenwagen',
          wartungstyp: 'Inspektion',
          geplantes_datum: '2024-05-20',
          status: 'Geplant',
          prioritaet: 'Hoch',
          verantwortlicher: 'Tom Weber',
          kosten: 200
        }
      ];

      setAssets(mockAssets);
      setVehicles(mockVehicles);
      setMaintenance(mockMaintenance);
    } catch (err) {
      setError('Fehler beim Laden der Anlagendaten');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddAsset = () => {
    setAssetDialogOpen(true);
  };

  const handleAddVehicle = () => {
    setVehicleDialogOpen(true);
  };

  const handleAddMaintenance = () => {
    setMaintenanceDialogOpen(true);
  };

  const handleSaveAsset = async () => {
    try {
      const newAsset: Asset = {
        id: Date.now().toString(),
        anlagennummer: `ANL-2024-${String(Date.now()).padStart(4, '0')}`,
        bezeichnung: assetForm.bezeichnung,
        kategoriename: assetForm.kategoriename,
        anschaffungsdatum: assetForm.anschaffungsdatum,
        anschaffungswert: parseFloat(assetForm.anschaffungswert),
        restbuchwert: parseFloat(assetForm.anschaffungswert),
        status: assetForm.status,
        standort: assetForm.standort,
        verantwortlicher_name: 'Neuer Verantwortlicher',
        anzahl_wartungen: 0,
        naechste_wartung: 'Keine geplant'
      };

      setAssets([...assets, newAsset]);
      setAssetDialogOpen(false);
      setAssetForm({
        bezeichnung: '',
        kategoriename: '',
        anschaffungsdatum: '',
        anschaffungswert: '',
        standort: '',
        status: 'Aktiv'
      });
    } catch (err) {
      setError('Fehler beim Speichern der Anlage');
    }
  };

  const handleSaveVehicle = async () => {
    try {
      const newVehicle: Vehicle = {
        id: Date.now().toString(),
        anlagennummer: `ANL-2024-${String(Date.now()).padStart(4, '0')}`,
        kennzeichen: vehicleForm.kennzeichen,
        marke: vehicleForm.marke,
        modell: vehicleForm.modell,
        baujahr: parseInt(vehicleForm.baujahr),
        kilometerstand: parseInt(vehicleForm.kilometerstand),
        tuev_bis: vehicleForm.tuev_bis,
        versicherung_bis: vehicleForm.versicherung_bis,
        steuer_bis: vehicleForm.steuer_bis,
        hauptfahrer: 'Neuer Fahrer',
        letzter_tank: 'Kein Tankvorgang',
        durchschnittsverbrauch: 0
      };

      setVehicles([...vehicles, newVehicle]);
      setVehicleDialogOpen(false);
      setVehicleForm({
        kennzeichen: '',
        marke: '',
        modell: '',
        baujahr: '',
        kilometerstand: '',
        tuev_bis: '',
        versicherung_bis: '',
        steuer_bis: ''
      });
    } catch (err) {
      setError('Fehler beim Speichern des Fahrzeugs');
    }
  };

  const handleSaveMaintenance = async () => {
    try {
      const newMaintenance: Maintenance = {
        id: Date.now().toString(),
        auftragsnummer: `WA-2024-${String(Date.now()).padStart(6, '0')}`,
        anlagennummer: 'ANL-2024-0001',
        anlagenbezeichnung: 'Neue Anlage',
        wartungstyp: maintenanceForm.wartungstyp,
        geplantes_datum: maintenanceForm.geplantes_datum,
        status: 'Geplant',
        prioritaet: maintenanceForm.prioritaet,
        verantwortlicher: 'Neuer Verantwortlicher',
        kosten: 0
      };

      setMaintenance([newMaintenance, ...maintenance]);
      setMaintenanceDialogOpen(false);
      setMaintenanceForm({
        anlage_id: '',
        wartungstyp: '',
        geplantes_datum: '',
        prioritaet: 'Normal',
        beschreibung: ''
      });
    } catch (err) {
      setError('Fehler beim Speichern des Wartungsauftrags');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aktiv': return 'success';
      case 'Inaktiv': return 'default';
      case 'Wartung': return 'warning';
      case 'Verkauft': return 'info';
      case 'Verschrottet': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Niedrig': return 'success';
      case 'Normal': return 'primary';
      case 'Hoch': return 'warning';
      case 'Kritisch': return 'error';
      default: return 'default';
    }
  };

  const getMaintenanceStatusColor = (status: string) => {
    switch (status) {
      case 'Geplant': return 'info';
      case 'In Bearbeitung': return 'warning';
      case 'Abgeschlossen': return 'success';
      case 'Abgebrochen': return 'error';
      default: return 'default';
    }
  };

  const isDateExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const isDateExpiringSoon = (dateString: string, days: number = 30) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days && diffDays > 0;
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
        <BuildIcon sx={{ color: 'primary.main' }} />
        Anlagenverwaltung
      </Typography>
      <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.secondary' }}>
        Verwaltung von Anlagen, Fuhrpark und Wartung
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
              {assets.length}
            </Typography>
            <Typography variant="body2" sx={{ color: 'primary.dark' }}>
              Anlagen
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 'bold' }}>
              {vehicles.length}
            </Typography>
            <Typography variant="body2" sx={{ color: 'success.dark' }}>
              Fahrzeuge
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
              {maintenance.filter(m => m.status === 'Geplant').length}
            </Typography>
            <Typography variant="body2" sx={{ color: 'warning.dark' }}>
              Geplante Wartungen
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ color: 'info.main', fontWeight: 'bold' }}>
              {assets.reduce((sum, a) => sum + a.anschaffungswert, 0).toLocaleString()}€
            </Typography>
            <Typography variant="body2" sx={{ color: 'info.dark' }}>
              Gesamtwert
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="asset tabs">
            <Tab 
              icon={<BusinessIcon />} 
              label="Anlagen" 
              iconPosition="start"
            />
            <Tab 
              icon={<CarIcon />} 
              label="Fuhrpark" 
              iconPosition="start"
            />
            <Tab 
              icon={<BuildIcon />} 
              label="Wartung" 
              iconPosition="start"
            />
            <Tab 
              icon={<ScheduleIcon />} 
              label="Übersicht" 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Anlagen Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Anlagen</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddAsset}
            >
              Anlage hinzufügen
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Anlagennummer</TableCell>
                  <TableCell>Bezeichnung</TableCell>
                  <TableCell>Kategorie</TableCell>
                  <TableCell>Standort</TableCell>
                  <TableCell align="right">Anschaffungswert</TableCell>
                  <TableCell align="right">Restbuchwert</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Verantwortlicher</TableCell>
                  <TableCell>Wartungen</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell>{asset.anlagennummer}</TableCell>
                    <TableCell>{asset.bezeichnung}</TableCell>
                    <TableCell>{asset.kategoriename}</TableCell>
                    <TableCell>{asset.standort}</TableCell>
                    <TableCell align="right">{asset.anschaffungswert.toLocaleString()}€</TableCell>
                    <TableCell align="right">{asset.restbuchwert.toLocaleString()}€</TableCell>
                    <TableCell>
                      <Chip 
                        label={asset.status} 
                        color={getStatusColor(asset.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{asset.verantwortlicher_name}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">{asset.anzahl_wartungen}</Typography>
                        {asset.naechste_wartung !== 'Keine geplant' && (
                          <Chip 
                            label="Wartung geplant" 
                            color="warning" 
                            size="small"
                            icon={<ScheduleIcon />}
                          />
                        )}
                      </Box>
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

        {/* Fuhrpark Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Fuhrpark</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddVehicle}
            >
              Fahrzeug hinzufügen
            </Button>
          </Box>

          <Grid container spacing={2}>
            {vehicles.map((vehicle) => (
              <Grid item xs={12} md={6} key={vehicle.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6">{vehicle.marke} {vehicle.modell}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {vehicle.kennzeichen} • {vehicle.baujahr}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" color="primary">
                          {vehicle.kilometerstand.toLocaleString()} km
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {vehicle.durchschnittsverbrauch} l/100km
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <CalendarIcon fontSize="small" color="primary" />
                          <Typography variant="body2">TÜV bis</Typography>
                        </Box>
                        <Chip 
                          label={new Date(vehicle.tuev_bis).toLocaleDateString('de-DE')}
                          color={isDateExpired(vehicle.tuev_bis) ? 'error' : isDateExpiringSoon(vehicle.tuev_bis) ? 'warning' : 'success'}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <CalendarIcon fontSize="small" color="primary" />
                          <Typography variant="body2">Versicherung bis</Typography>
                        </Box>
                        <Chip 
                          label={new Date(vehicle.versicherung_bis).toLocaleDateString('de-DE')}
                          color={isDateExpired(vehicle.versicherung_bis) ? 'error' : isDateExpiringSoon(vehicle.versicherung_bis) ? 'warning' : 'success'}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <CalendarIcon fontSize="small" color="primary" />
                          <Typography variant="body2">Steuer bis</Typography>
                        </Box>
                        <Chip 
                          label={new Date(vehicle.steuer_bis).toLocaleDateString('de-DE')}
                          color={isDateExpired(vehicle.steuer_bis) ? 'error' : isDateExpiringSoon(vehicle.steuer_bis) ? 'warning' : 'success'}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <GasIcon fontSize="small" color="primary" />
                          <Typography variant="body2">Letzter Tank</Typography>
                        </Box>
                        <Typography variant="body2">
                          {vehicle.letzter_tank === 'Kein Tankvorgang' ? 
                            'Kein Tankvorgang' : 
                            new Date(vehicle.letzter_tank).toLocaleDateString('de-DE')
                          }
                        </Typography>
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                      <Typography variant="body2" color="text.secondary">
                        Hauptfahrer: {vehicle.hauptfahrer}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Wartung Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Wartungsaufträge</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddMaintenance}
            >
              Wartung planen
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Auftragsnummer</TableCell>
                  <TableCell>Anlage</TableCell>
                  <TableCell>Wartungstyp</TableCell>
                  <TableCell>Geplantes Datum</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priorität</TableCell>
                  <TableCell>Verantwortlicher</TableCell>
                  <TableCell align="right">Kosten</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {maintenance.map((maintenanceItem) => (
                  <TableRow key={maintenanceItem.id}>
                    <TableCell>{maintenanceItem.auftragsnummer}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{maintenanceItem.anlagenbezeichnung}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {maintenanceItem.anlagennummer}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{maintenanceItem.wartungstyp}</TableCell>
                    <TableCell>
                      {new Date(maintenanceItem.geplantes_datum).toLocaleDateString('de-DE')}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={maintenanceItem.status} 
                        color={getMaintenanceStatusColor(maintenanceItem.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={maintenanceItem.prioritaet} 
                        color={getPriorityColor(maintenanceItem.prioritaet)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{maintenanceItem.verantwortlicher}</TableCell>
                    <TableCell align="right">
                      {maintenanceItem.kosten > 0 ? `${maintenanceItem.kosten.toLocaleString()}€` : '-'}
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

        {/* Übersicht Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" sx={{ mb: 2 }}>Anlagen-Übersicht</Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Anlagen nach Kategorie</Typography>
                  <List>
                    {Array.from(new Set(assets.map(a => a.kategoriename))).map((kategorie) => {
                      const count = assets.filter(a => a.kategoriename === kategorie).length;
                      const value = assets.filter(a => a.kategoriename === kategorie)
                        .reduce((sum, a) => sum + a.anschaffungswert, 0);
                      
                      return (
                        <ListItem key={kategorie}>
                          <ListItemText 
                            primary={kategorie}
                            secondary={`${count} Anlagen • ${value.toLocaleString()}€`}
                          />
                          <LinearProgress 
                            variant="determinate" 
                            value={(count / assets.length) * 100}
                            sx={{ width: 100, ml: 2 }}
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Wartungs-Status</Typography>
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="Geplante Wartungen"
                        secondary={`${maintenance.filter(m => m.status === 'Geplant').length} Aufträge`}
                      />
                      <Chip label="Geplant" color="info" size="small" />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="In Bearbeitung"
                        secondary={`${maintenance.filter(m => m.status === 'In Bearbeitung').length} Aufträge`}
                      />
                      <Chip label="In Bearbeitung" color="warning" size="small" />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Abgeschlossen"
                        secondary={`${maintenance.filter(m => m.status === 'Abgeschlossen').length} Aufträge`}
                      />
                      <Chip label="Abgeschlossen" color="success" size="small" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Kritische Anlagen</Typography>
                  <Grid container spacing={2}>
                    {assets.filter(asset => 
                      asset.naechste_wartung !== 'Keine geplant' && 
                      new Date(asset.naechste_wartung) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    ).map((asset) => (
                      <Grid item xs={12} md={4} key={asset.id}>
                        <Card variant="outlined" sx={{ borderColor: 'warning.main' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <WarningIcon color="warning" />
                              <Typography variant="subtitle2">{asset.bezeichnung}</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              Wartung fällig: {new Date(asset.naechste_wartung).toLocaleDateString('de-DE')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {asset.anlagennummer}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>

      {/* Anlage hinzufügen Dialog */}
      <Dialog open={assetDialogOpen} onClose={() => setAssetDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Neue Anlage hinzufügen</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bezeichnung"
                value={assetForm.bezeichnung}
                onChange={(e) => setAssetForm({...assetForm, bezeichnung: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Kategorie</InputLabel>
                <Select
                  value={assetForm.kategoriename}
                  onChange={(e) => setAssetForm({...assetForm, kategoriename: e.target.value})}
                  label="Kategorie"
                >
                  <MenuItem value="IT-Equipment">IT-Equipment</MenuItem>
                  <MenuItem value="Büroausstattung">Büroausstattung</MenuItem>
                  <MenuItem value="Fahrzeuge">Fahrzeuge</MenuItem>
                  <MenuItem value="Maschinen">Maschinen</MenuItem>
                  <MenuItem value="Gebäude">Gebäude</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Anschaffungsdatum"
                type="date"
                value={assetForm.anschaffungsdatum}
                onChange={(e) => setAssetForm({...assetForm, anschaffungsdatum: e.target.value})}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Anschaffungswert"
                type="number"
                value={assetForm.anschaffungswert}
                onChange={(e) => setAssetForm({...assetForm, anschaffungswert: e.target.value})}
                margin="normal"
                InputProps={{
                  endAdornment: <Typography>€</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Standort"
                value={assetForm.standort}
                onChange={(e) => setAssetForm({...assetForm, standort: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={assetForm.status}
                  onChange={(e) => setAssetForm({...assetForm, status: e.target.value})}
                  label="Status"
                >
                  <MenuItem value="Aktiv">Aktiv</MenuItem>
                  <MenuItem value="Inaktiv">Inaktiv</MenuItem>
                  <MenuItem value="Wartung">Wartung</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssetDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleSaveAsset} variant="contained">Speichern</Button>
        </DialogActions>
      </Dialog>

      {/* Fahrzeug hinzufügen Dialog */}
      <Dialog open={vehicleDialogOpen} onClose={() => setVehicleDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Neues Fahrzeug hinzufügen</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Kennzeichen"
                value={vehicleForm.kennzeichen}
                onChange={(e) => setVehicleForm({...vehicleForm, kennzeichen: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Marke"
                value={vehicleForm.marke}
                onChange={(e) => setVehicleForm({...vehicleForm, marke: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Modell"
                value={vehicleForm.modell}
                onChange={(e) => setVehicleForm({...vehicleForm, modell: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Baujahr"
                type="number"
                value={vehicleForm.baujahr}
                onChange={(e) => setVehicleForm({...vehicleForm, baujahr: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Kilometerstand"
                type="number"
                value={vehicleForm.kilometerstand}
                onChange={(e) => setVehicleForm({...vehicleForm, kilometerstand: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="TÜV bis"
                type="date"
                value={vehicleForm.tuev_bis}
                onChange={(e) => setVehicleForm({...vehicleForm, tuev_bis: e.target.value})}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Versicherung bis"
                type="date"
                value={vehicleForm.versicherung_bis}
                onChange={(e) => setVehicleForm({...vehicleForm, versicherung_bis: e.target.value})}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Steuer bis"
                type="date"
                value={vehicleForm.steuer_bis}
                onChange={(e) => setVehicleForm({...vehicleForm, steuer_bis: e.target.value})}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVehicleDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleSaveVehicle} variant="contained">Speichern</Button>
        </DialogActions>
      </Dialog>

      {/* Wartung planen Dialog */}
      <Dialog open={maintenanceDialogOpen} onClose={() => setMaintenanceDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Wartung planen</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Anlage</InputLabel>
                <Select
                  value={maintenanceForm.anlage_id}
                  onChange={(e) => setMaintenanceForm({...maintenanceForm, anlage_id: e.target.value})}
                  label="Anlage"
                >
                  {assets.map((asset) => (
                    <MenuItem key={asset.id} value={asset.id}>
                      {asset.anlagennummer} - {asset.bezeichnung}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Wartungstyp"
                value={maintenanceForm.wartungstyp}
                onChange={(e) => setMaintenanceForm({...maintenanceForm, wartungstyp: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Geplantes Datum"
                type="date"
                value={maintenanceForm.geplantes_datum}
                onChange={(e) => setMaintenanceForm({...maintenanceForm, geplantes_datum: e.target.value})}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Priorität</InputLabel>
                <Select
                  value={maintenanceForm.prioritaet}
                  onChange={(e) => setMaintenanceForm({...maintenanceForm, prioritaet: e.target.value})}
                  label="Priorität"
                >
                  <MenuItem value="Niedrig">Niedrig</MenuItem>
                  <MenuItem value="Normal">Normal</MenuItem>
                  <MenuItem value="Hoch">Hoch</MenuItem>
                  <MenuItem value="Kritisch">Kritisch</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Beschreibung"
                value={maintenanceForm.beschreibung}
                onChange={(e) => setMaintenanceForm({...maintenanceForm, beschreibung: e.target.value})}
                margin="normal"
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMaintenanceDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleSaveMaintenance} variant="contained">Wartung planen</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssetManagement; 