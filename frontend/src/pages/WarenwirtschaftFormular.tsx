import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormGroup,
  Switch,
  Slider,
  Rating,
  Autocomplete,
  CircularProgress,
  LinearProgress,
  Badge,
  Avatar,
  Tabs,
  Tab,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Breadcrumbs,
  Link,
  Pagination,
  Skeleton,
  Backdrop,
  Modal,
  Fade,
  Grow,
  Slide,
  Zoom,
  Collapse,
  ListItemButton,
  ListItemAvatar,
  ListSubheader,
  ListItemSecondaryAction,
  InputAdornment,
  OutlinedInput,
  FilledInput,
  InputBase,
  FormLabel,
  FormHelperText,

} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  KeyboardArrowRight as ArrowRightIcon,
  KeyboardArrowLeft as ArrowLeftIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,

  Help as HelpIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Business as BusinessIcon,
  Inventory as InventoryIcon,
  LocalShipping as LocalShippingIcon,
  Store as StoreIcon,
  ShoppingCart as ShoppingCartIcon,
  Receipt as ReceiptIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as ShowChartIcon,
  InsertChart as InsertChartIcon,
  Analytics as AnalyticsIcon,
  DataUsage as DataUsageIcon,
  Storage as StorageIcon,
  Cloud as CloudIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  Sync as SyncIcon,
  Autorenew as AutorenewIcon,
  Loop as LoopIcon,
  RotateRight as RotateRightIcon,
  RotateLeft as RotateLeftIcon,
  Flip as FlipIcon,
  Transform as TransformIcon,
  Crop as CropIcon,
  CropFree as CropFreeIcon,
  CropSquare as CropSquareIcon,
  Crop169 as Crop169Icon,
  Crop32 as Crop32Icon,
  Crop54 as Crop54Icon,
  Crop75 as Crop75Icon,
  CropDin as CropDinIcon,
  CropOriginal as CropOriginalIcon,
  CropPortrait as CropPortraitIcon,
  CropLandscape as CropLandscapeIcon,
  CropRotate as CropRotateIcon,

  CropSquare as CropSquareIcon2,
  Crop169 as Crop169Icon2,
  Crop32 as Crop32Icon2,
  Crop54 as Crop54Icon2,
  Crop75 as Crop75Icon2,
  CropDin as CropDinIcon2,
  CropOriginal as CropOriginalIcon2,
  CropPortrait as CropPortraitIcon2,
  CropLandscape as CropLandscapeIcon2,
  CropRotate as CropRotateIcon2,
  // Zusätzliche Icons für Warenwirtschaft
  ShoppingCart as BestellungIcon,
  LocalShipping as WareneingangIcon,
  Receipt as RechnungIcon,
  Inventory as LagerIcon,
  Inventory2 as Inventory2Icon,
  Visibility as ViewIcon,
  Flag as FlagIcon,
  AttachMoney as MoneyIcon

} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';

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
      id={`warenwirtschaft-tabpanel-${index}`}
      aria-labelledby={`warenwirtschaft-tab-${index}`}
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

interface Bestellung {
  id: string;
  bestellnummer: string;
  lieferant: string;
  bestelldatum: string;
  erwartetesLieferdatum: string;
  status: 'offen' | 'bestellt' | 'teilweise_geliefert' | 'vollstaendig_geliefert' | 'storniert';
  gesamtbetrag: number;
  mwst: number;
  endbetrag: number;
  besteller: string;
  notizen: string;
  positionen: BestellPosition[];
}

interface BestellPosition {
  id: string;
  artikelnummer: string;
  bezeichnung: string;
  bestellmenge: number;
  gelieferteMenge: number;
  einzelpreis: number;
  gesamtpreis: number;
  mwst: number;
  status: 'offen' | 'teilweise_geliefert' | 'vollstaendig_geliefert';
}

interface Wareneingang {
  id: string;
  wareneingangsnummer: string;
  bestellnummer: string;
  lieferant: string;
  lieferdatum: string;
  status: 'erwartet' | 'eingetroffen' | 'geprueft' | 'eingelagert';
  lkwNummer?: string;
  chauffeur?: string;
  notizen: string;
  positionen: WareneingangPosition[];
}

interface WareneingangPosition {
  id: string;
  artikelnummer: string;
  bezeichnung: string;
  bestellmenge: number;
  gelieferteMenge: number;
  gepruefteMenge: number;
  mangelhafteMenge: number;
  einzelpreis: number;
  status: 'erwartet' | 'eingetroffen' | 'geprueft' | 'mangelhaft';
}

interface Rechnung {
  id: string;
  rechnungsnummer: string;
  lieferant: string;
  rechnungsdatum: string;
  faelligkeitsdatum: string;
  status: 'eingegangen' | 'geprueft' | 'freigegeben' | 'bezahlt' | 'storniert';
  rechnungsbetrag: number;
  mwst: number;
  endbetrag: number;
  zahlungsbedingungen: string;
  notizen: string;
  positionen: RechnungsPosition[];
}

interface RechnungsPosition {
  id: string;
  artikelnummer: string;
  bezeichnung: string;
  menge: number;
  einzelpreis: number;
  gesamtpreis: number;
  mwst: number;
  bestellnummer?: string;
  wareneingangsnummer?: string;
}

interface Lagerbuchung {
  id: string;
  buchungsnummer: string;
  buchungsdatum: string;
  buchungstyp: 'eingang' | 'ausgang' | 'korrektur' | 'inventur';
  artikelnummer: string;
  bezeichnung: string;
  menge: number;
  lagerort: string;
  kostenstelle?: string;
  belegnummer?: string;
  notizen: string;
  buchungsgrund: string;
}

interface Lagerbestand {
  artikelnummer: string;
  bezeichnung: string;
  lagerort: string;
  aktuellerBestand: number;
  mindestbestand: number;
  maximalbestand: number;
  reserviert: number;
  verfuegbar: number;
  durchschnittspreis: number;
  gesamtwert: number;
  letzteBewegung: string;
  status: 'normal' | 'niedrig' | 'kritisch' | 'ueberbestand';
}

const WarenwirtschaftFormular: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });

  // Mock-Daten
  const [bestellungen, setBestellungen] = useState<Bestellung[]>([
    {
      id: '1',
      bestellnummer: 'BEST-2024-001',
      lieferant: 'Schrauben GmbH',
      bestelldatum: '2024-01-15',
      erwartetesLieferdatum: '2024-01-25',
      status: 'bestellt',
      gesamtbetrag: 1250.00,
      mwst: 237.50,
      endbetrag: 1487.50,
      besteller: 'Max Mustermann',
      notizen: 'Dringend benötigt für Projekt A',
      positionen: [
        {
          id: '1',
          artikelnummer: 'SCHR-001',
          bezeichnung: 'Industrie-Schraube M8x20',
          bestellmenge: 1000,
          gelieferteMenge: 0,
          einzelpreis: 0.85,
          gesamtpreis: 850.00,
          mwst: 19,
          status: 'offen'
        },
        {
          id: '2',
          artikelnummer: 'SCHR-002',
          bezeichnung: 'Industrie-Schraube M10x25',
          bestellmenge: 500,
          gelieferteMenge: 0,
          einzelpreis: 0.80,
          gesamtpreis: 400.00,
          mwst: 19,
          status: 'offen'
        }
      ]
    }
  ]);

  const [wareneingaenge, setWareneingaenge] = useState<Wareneingang[]>([
    {
      id: '1',
      wareneingangsnummer: 'WE-2024-001',
      bestellnummer: 'BEST-2024-001',
      lieferant: 'Schrauben GmbH',
      lieferdatum: '2024-01-20',
      status: 'eingetroffen',
      lkwNummer: 'M-AB 1234',
      chauffeur: 'Hans Müller',
      notizen: 'Ware in gutem Zustand eingetroffen',
      positionen: [
        {
          id: '1',
          artikelnummer: 'SCHR-001',
          bezeichnung: 'Industrie-Schraube M8x20',
          bestellmenge: 1000,
          gelieferteMenge: 1000,
          gepruefteMenge: 980,
          mangelhafteMenge: 20,
          einzelpreis: 0.85,
          status: 'geprueft'
        }
      ]
    }
  ]);

  const [rechnungen, setRechnungen] = useState<Rechnung[]>([
    {
      id: '1',
      rechnungsnummer: 'RE-2024-001',
      lieferant: 'Schrauben GmbH',
      rechnungsdatum: '2024-01-20',
      faelligkeitsdatum: '2024-02-19',
      status: 'eingegangen',
      rechnungsbetrag: 1250.00,
      mwst: 237.50,
      endbetrag: 1487.50,
      zahlungsbedingungen: '30 Tage netto',
      notizen: 'Rechnung zur Bestellung BEST-2024-001',
      positionen: [
        {
          id: '1',
          artikelnummer: 'SCHR-001',
          bezeichnung: 'Industrie-Schraube M8x20',
          menge: 1000,
          einzelpreis: 0.85,
          gesamtpreis: 850.00,
          mwst: 19,
          bestellnummer: 'BEST-2024-001',
          wareneingangsnummer: 'WE-2024-001'
        }
      ]
    }
  ]);

  const [lagerbuchungen, setLagerbuchungen] = useState<Lagerbuchung[]>([
    {
      id: '1',
      buchungsnummer: 'LB-2024-001',
      buchungsdatum: '2024-01-20',
      buchungstyp: 'eingang',
      artikelnummer: 'SCHR-001',
      bezeichnung: 'Industrie-Schraube M8x20',
      menge: 980,
      lagerort: 'Lager A, Regal 1',
      kostenstelle: 'KST-001',
      belegnummer: 'WE-2024-001',
      notizen: 'Wareneingang von Schrauben GmbH',
      buchungsgrund: 'Wareneingang'
    }
  ]);

  const [lagerbestaende, setLagerbestaende] = useState<Lagerbestand[]>([
    {
      artikelnummer: 'SCHR-001',
      bezeichnung: 'Industrie-Schraube M8x20',
      lagerort: 'Lager A, Regal 1',
      aktuellerBestand: 1980,
      mindestbestand: 100,
      maximalbestand: 5000,
      reserviert: 200,
      verfuegbar: 1780,
      durchschnittspreis: 0.85,
      gesamtwert: 1683.00,
      letzteBewegung: '2024-01-20',
      status: 'normal'
    }
  ]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (item?: any) => {
    setSelectedItem(item);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'offen': return 'default';
      case 'bestellt': return 'info';
      case 'teilweise_geliefert': return 'warning';
      case 'vollstaendig_geliefert': return 'success';
      case 'storniert': return 'error';
      case 'erwartet': return 'info';
      case 'eingetroffen': return 'warning';
      case 'geprueft': return 'success';
      case 'eingelagert': return 'success';
      case 'eingegangen': return 'info';
      case 'freigegeben': return 'success';
      case 'bezahlt': return 'success';
      case 'normal': return 'success';
      case 'niedrig': return 'warning';
      case 'kritisch': return 'error';
      case 'ueberbestand': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'offen': return 'Offen';
      case 'bestellt': return 'Bestellt';
      case 'teilweise_geliefert': return 'Teilweise geliefert';
      case 'vollstaendig_geliefert': return 'Vollständig geliefert';
      case 'storniert': return 'Storniert';
      case 'erwartet': return 'Erwartet';
      case 'eingetroffen': return 'Eingetroffen';
      case 'geprueft': return 'Geprüft';
      case 'eingelagert': return 'Eingelagert';
      case 'eingegangen': return 'Eingegangen';
      case 'freigegeben': return 'Freigegeben';
      case 'bezahlt': return 'Bezahlt';
      case 'normal': return 'Normal';
      case 'niedrig': return 'Niedrig';
      case 'kritisch': return 'Kritisch';
      case 'ueberbestand': return 'Überbestand';
      default: return status;
    }
  };

  const calculateGesamtBestellungen = () => {
    return bestellungen.reduce((sum, b) => sum + b.endbetrag, 0);
  };

  const calculateOffeneBestellungen = () => {
    return bestellungen.filter(b => b.status === 'offen' || b.status === 'bestellt').length;
  };

  const calculateGesamtLagerwert = () => {
    return lagerbestaende.reduce((sum, l) => sum + l.gesamtwert, 0);
  };

  const calculateKritischeArtikel = () => {
    return lagerbestaende.filter(l => l.status === 'kritisch' || l.status === 'niedrig').length;
  };

  return (
    <Box sx={{ p: 3 }}>


      <Typography variant="h4" component="h1" sx={{ mb: 3, color: 'primary.main' }}>
        Eingehende Belegfolge - Warenwirtschaft
      </Typography>

      {/* Warenwirtschaft-Übersicht */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <BestellungIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="primary.main">
                    {bestellungen.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bestellungen
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
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <WareneingangIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="warning.main">
                    {wareneingaenge.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Wareneingänge
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
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <MoneyIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="success.main">
                    {calculateGesamtLagerwert().toLocaleString()} €
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Lagerwert
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
                  <WarningIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="error.main">
                    {calculateKritischeArtikel()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Kritische Artikel
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Bestellungen" icon={<BestellungIcon />} iconPosition="start" />
          <Tab label="Wareneingang" icon={<WareneingangIcon />} iconPosition="start" />
          <Tab label="Rechnungsprüfung" icon={<RechnungIcon />} iconPosition="start" />
          <Tab label="Lagerbuchungen" icon={<LagerIcon />} iconPosition="start" />
          <Tab label="Lagerbestand" icon={<Inventory2Icon />} iconPosition="start" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Bestellnummer</TableCell>
                  <TableCell>Lieferant</TableCell>
                  <TableCell>Bestelldatum</TableCell>
                  <TableCell>Erwartetes Lieferdatum</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Gesamtbetrag</TableCell>
                  <TableCell>Besteller</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bestellungen.map((bestellung) => (
                  <TableRow key={bestellung.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {bestellung.bestellnummer}
                      </Typography>
                    </TableCell>
                    <TableCell>{bestellung.lieferant}</TableCell>
                    <TableCell>{bestellung.bestelldatum}</TableCell>
                    <TableCell>{bestellung.erwartetesLieferdatum}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(bestellung.status)}
                        color={getStatusColor(bestellung.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {bestellung.endbetrag.toFixed(2)} €
                      </Typography>
                    </TableCell>
                    <TableCell>{bestellung.besteller}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Bearbeiten">
                          <IconButton size="small" color="primary">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Anzeigen">
                          <IconButton size="small" color="primary">
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

        <TabPanel value={tabValue} index={1}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Wareneingangsnummer</TableCell>
                  <TableCell>Bestellnummer</TableCell>
                  <TableCell>Lieferant</TableCell>
                  <TableCell>Lieferdatum</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>LKW-Nummer</TableCell>
                  <TableCell>Chauffeur</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {wareneingaenge.map((wareneingang) => (
                  <TableRow key={wareneingang.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {wareneingang.wareneingangsnummer}
                      </Typography>
                    </TableCell>
                    <TableCell>{wareneingang.bestellnummer}</TableCell>
                    <TableCell>{wareneingang.lieferant}</TableCell>
                    <TableCell>{wareneingang.lieferdatum}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(wareneingang.status)}
                        color={getStatusColor(wareneingang.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{wareneingang.lkwNummer || '-'}</TableCell>
                    <TableCell>{wareneingang.chauffeur || '-'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Bearbeiten">
                          <IconButton size="small" color="primary">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Anzeigen">
                          <IconButton size="small" color="primary">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Prüfen">
                          <IconButton size="small" color="success">
                            <CheckIcon />
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

        <TabPanel value={tabValue} index={2}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rechnungsnummer</TableCell>
                  <TableCell>Lieferant</TableCell>
                  <TableCell>Rechnungsdatum</TableCell>
                  <TableCell>Fälligkeitsdatum</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Rechnungsbetrag</TableCell>
                  <TableCell>Zahlungsbedingungen</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rechnungen.map((rechnung) => (
                  <TableRow key={rechnung.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {rechnung.rechnungsnummer}
                      </Typography>
                    </TableCell>
                    <TableCell>{rechnung.lieferant}</TableCell>
                    <TableCell>{rechnung.rechnungsdatum}</TableCell>
                    <TableCell>{rechnung.faelligkeitsdatum}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(rechnung.status)}
                        color={getStatusColor(rechnung.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {rechnung.endbetrag.toFixed(2)} €
                      </Typography>
                    </TableCell>
                    <TableCell>{rechnung.zahlungsbedingungen}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Bearbeiten">
                          <IconButton size="small" color="primary">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Prüfen">
                          <IconButton size="small" color="success">
                            <CheckIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Freigeben">
                          <IconButton size="small" color="info">
                            <FlagIcon />
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

        <TabPanel value={tabValue} index={3}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Buchungsnummer</TableCell>
                  <TableCell>Buchungsdatum</TableCell>
                  <TableCell>Buchungstyp</TableCell>
                  <TableCell>Artikel</TableCell>
                  <TableCell>Menge</TableCell>
                  <TableCell>Lagerort</TableCell>
                  <TableCell>Belegnummer</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lagerbuchungen.map((buchung) => (
                  <TableRow key={buchung.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {buchung.buchungsnummer}
                      </Typography>
                    </TableCell>
                    <TableCell>{buchung.buchungsdatum}</TableCell>
                    <TableCell>
                      <Chip
                        label={buchung.buchungstyp}
                        color={buchung.buchungstyp === 'eingang' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {buchung.bezeichnung}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {buchung.artikelnummer}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{buchung.menge}</TableCell>
                    <TableCell>{buchung.lagerort}</TableCell>
                    <TableCell>{buchung.belegnummer || '-'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Anzeigen">
                          <IconButton size="small" color="primary">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Bearbeiten">
                          <IconButton size="small" color="primary">
                            <EditIcon />
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

        <TabPanel value={tabValue} index={4}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Artikel</TableCell>
                  <TableCell>Lagerort</TableCell>
                  <TableCell>Aktueller Bestand</TableCell>
                  <TableCell>Verfügbar</TableCell>
                  <TableCell>Mindestbestand</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Gesamtwert</TableCell>
                  <TableCell>Letzte Bewegung</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lagerbestaende.map((bestand) => (
                  <TableRow key={bestand.artikelnummer}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {bestand.bezeichnung}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {bestand.artikelnummer}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{bestand.lagerort}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {bestand.aktuellerBestand}
                        </Typography>
                        {bestand.status === 'niedrig' && (
                          <LinearProgress 
                            variant="determinate" 
                            value={(bestand.aktuellerBestand / bestand.mindestbestand) * 100}
                            color="warning"
                            sx={{ width: 50, height: 4 }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{bestand.verfuegbar}</TableCell>
                    <TableCell>{bestand.mindestbestand}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(bestand.status)}
                        color={getStatusColor(bestand.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {bestand.gesamtwert.toFixed(2)} €
                      </Typography>
                    </TableCell>
                    <TableCell>{bestand.letzteBewegung}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Bestand anpassen">
                          <IconButton size="small" color="primary">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Bewegungen">
                          <IconButton size="small" color="info">
                            <ViewIcon />
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
      </Card>

      {/* Dialog für neue Bestellung */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          Neue Bestellung erstellen
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Bestellnummer"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Lieferant"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Bestelldatum"
                  type="date"
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Erwartetes Lieferdatum"
                  type="date"
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notizen"
                  multiline
                  rows={3}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button variant="contained">Bestellung erstellen</Button>
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

export default WarenwirtschaftFormular; 