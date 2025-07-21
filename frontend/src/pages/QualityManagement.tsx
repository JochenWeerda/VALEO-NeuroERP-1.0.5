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
  Alert,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Science as ScienceIcon,
  Assignment as AssignmentIcon,
  Build as BuildIcon,
  Description as DescriptionIcon,
  Verified as VerifiedIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  BugReport as BugReportIcon,
  Security as SecurityIcon,
  School as SchoolIcon
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
      id={`quality-tabpanel-${index}`}
      aria-labelledby={`quality-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const QualityManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'pruefung' | 'reklamation' | 'messmittel' | 'zertifikat' | 'audit'>('pruefung');

  // Mock-Daten für KPI-Cards
  const kpiData = {
    gesamtPruefungen: 156,
    bestanden: 142,
    nichtBestanden: 14,
    bestandenProzent: 91.0,
    offeneReklamationen: 8,
    geloesteReklamationen: 23,
    durchschnittlicheLoesungszeit: 4.2,
    ueberfaelligeKalibrierungen: 3
  };

  // Mock-Daten für Qualitätsprüfungen
  const qualitaetspruefungen = [
    {
      id: '1',
      pruefung_nr: 'QP-2024-0001',
      pruefung_typ: 'EINGANGSKONTROLLE',
      artikel: 'Futtermittel Premium',
      lieferant: 'Agrarhandel Müller GmbH',
      pruefer: 'Dr. Hans Weber',
      pruefdatum: '2024-01-15',
      status: 'ABGESCHLOSSEN',
      ergebnis: 'BESTANDEN',
      anzahl_parameter: 6,
      ok_parameter: 6,
      nok_parameter: 0
    },
    {
      id: '2',
      pruefung_nr: 'QP-2024-0002',
      pruefung_typ: 'PRODUKTION',
      artikel: 'Dünger NPK 15-15-15',
      lieferant: null,
      pruefer: 'Maria Schmidt',
      pruefdatum: '2024-01-16',
      status: 'ABGESCHLOSSEN',
      ergebnis: 'BESTANDEN',
      anzahl_parameter: 4,
      ok_parameter: 4,
      nok_parameter: 0
    },
    {
      id: '3',
      pruefung_nr: 'QP-2024-0003',
      pruefung_typ: 'AUSGANGSKONTROLLE',
      artikel: 'PSM Roundup',
      lieferant: null,
      pruefer: 'Peter Müller',
      pruefdatum: '2024-01-17',
      status: 'IN_BEARBEITUNG',
      ergebnis: null,
      anzahl_parameter: 5,
      ok_parameter: 3,
      nok_parameter: 2
    }
  ];

  // Mock-Daten für Reklamationen
  const reklamationen = [
    {
      id: '1',
      reklamation_nr: 'REK-2024-0001',
      reklamation_typ: 'LIEFERANT',
      artikel: 'Futtermittel Premium',
      lieferant: 'Agrarhandel Müller GmbH',
      kunde: null,
      reklamation_datum: '2024-01-10',
      status: 'GELOEST',
      prioritaet: 'HOCH',
      beschreibung: 'Verpackung beschädigt bei Lieferung',
      verantwortlicher: 'Dr. Hans Weber',
      anzahl_massnahmen: 2,
      abgeschlossene_massnahmen: 2
    },
    {
      id: '2',
      reklamation_nr: 'REK-2024-0002',
      reklamation_typ: 'KUNDE',
      artikel: 'Dünger NPK 15-15-15',
      lieferant: null,
      kunde: 'Bauernhof Schmidt',
      reklamation_datum: '2024-01-12',
      status: 'IN_BEARBEITUNG',
      prioritaet: 'NORMAL',
      beschreibung: 'Produkt entspricht nicht der Spezifikation',
      verantwortlicher: 'Maria Schmidt',
      anzahl_massnahmen: 1,
      abgeschlossene_massnahmen: 0
    },
    {
      id: '3',
      reklamation_nr: 'REK-2024-0003',
      reklamation_typ: 'INTERN',
      artikel: 'PSM Roundup',
      lieferant: null,
      kunde: null,
      reklamation_datum: '2024-01-14',
      status: 'OFFEN',
      prioritaet: 'NIEDRIG',
      beschreibung: 'Leichte Abweichung bei der Produktion',
      verantwortlicher: 'Peter Müller',
      anzahl_massnahmen: 0,
      abgeschlossene_massnahmen: 0
    }
  ];

  // Mock-Daten für Messmittel
  const messmittel = [
    {
      id: '1',
      messmittel_nr: 'MM-001',
      bezeichnung: 'Laborwaage 25kg',
      typ: 'WAAGE',
      hersteller: 'Sartorius',
      modell: 'CP225D',
      status: 'AKTIV',
      standort: 'Labor',
      naechste_kalibrierung: '2024-12-15',
      verantwortlicher: 'Dr. Hans Weber',
      kalibrier_status: 'OK'
    },
    {
      id: '2',
      messmittel_nr: 'MM-002',
      bezeichnung: 'pH-Meter',
      typ: 'PH_METER',
      hersteller: 'Hanna Instruments',
      modell: 'HI98107',
      status: 'AKTIV',
      standort: 'Labor',
      naechste_kalibrierung: '2024-06-20',
      verantwortlicher: 'Maria Schmidt',
      kalibrier_status: 'OK'
    },
    {
      id: '3',
      messmittel_nr: 'MM-003',
      bezeichnung: 'Thermometer',
      typ: 'THERMOMETER',
      hersteller: 'Testo',
      modell: '0560 1041',
      status: 'KALIBRIERUNG',
      standort: 'Produktion',
      naechste_kalibrierung: '2024-11-30',
      verantwortlicher: 'Peter Müller',
      kalibrier_status: 'BALD_FÄLLIG'
    }
  ];

  // Mock-Daten für Zertifikate
  const zertifikate = [
    {
      id: '1',
      zertifikat_nr: 'ZERT-001',
      zertifikat_typ: 'QS',
      bezeichnung: 'QS-Zertifikat Futtermittel',
      aussteller: 'QS Qualität und Sicherheit GmbH',
      ausstellungs_datum: '2023-01-15',
      gueltig_bis: '2025-01-15',
      status: 'AKTIV'
    },
    {
      id: '2',
      zertifikat_nr: 'ZERT-002',
      zertifikat_typ: 'ISO_9001',
      bezeichnung: 'ISO 9001:2015',
      aussteller: 'TÜV Süd',
      ausstellungs_datum: '2023-03-20',
      gueltig_bis: '2026-03-20',
      status: 'AKTIV'
    },
    {
      id: '3',
      zertifikat_nr: 'ZERT-003',
      zertifikat_typ: 'HACCP',
      bezeichnung: 'HACCP-Zertifikat',
      aussteller: 'DIN CERTCO',
      ausstellungs_datum: '2023-06-10',
      gueltig_bis: '2025-06-10',
      status: 'AKTIV'
    }
  ];

  // Mock-Daten für Audits
  const audits = [
    {
      id: '1',
      audit_nr: 'AUD-2024-001',
      audit_typ: 'INTERN',
      audit_datum: '2024-01-20',
      audit_ort: 'Hauptstandort',
      auditiert_von: 'Dr. Hans Weber',
      auditiert_an: 'Produktionsabteilung',
      ergebnis: 'BESTANDEN',
      bewertung: 4,
      naechstes_audit: '2024-07-20'
    },
    {
      id: '2',
      audit_nr: 'AUD-2024-002',
      audit_typ: 'LIEFERANT',
      audit_datum: '2024-01-25',
      audit_ort: 'Agrarhandel Müller GmbH',
      auditiert_von: 'Maria Schmidt',
      auditiert_an: 'Lieferant',
      ergebnis: 'MIT_AUFLAGEN',
      bewertung: 3,
      naechstes_audit: '2024-04-25'
    },
    {
      id: '3',
      audit_nr: 'AUD-2024-003',
      audit_typ: 'ZERTIFIZIERER',
      audit_datum: '2024-02-01',
      audit_ort: 'Hauptstandort',
      auditiert_von: 'TÜV Süd',
      auditiert_an: 'QS-System',
      ergebnis: 'BESTANDEN',
      bewertung: 5,
      naechstes_audit: '2025-02-01'
    }
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (type: 'pruefung' | 'reklamation' | 'messmittel' | 'zertifikat' | 'audit') => {
    setDialogType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ABGESCHLOSSEN':
      case 'BESTANDEN':
      case 'GELOEST':
      case 'AKTIV':
        return 'success';
      case 'IN_BEARBEITUNG':
      case 'MIT_AUFLAGEN':
      case 'KALIBRIERUNG':
        return 'warning';
      case 'OFFEN':
      case 'NICHT_BESTANDEN':
      case 'DEFEKT':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPrioritaetColor = (prioritaet: string) => {
    switch (prioritaet) {
      case 'KRITISCH':
        return 'error';
      case 'HOCH':
        return 'warning';
      case 'NORMAL':
        return 'info';
      case 'NIEDRIG':
        return 'default';
      default:
        return 'default';
    }
  };

  const getKalibrierStatusColor = (status: string) => {
    switch (status) {
      case 'OK':
        return 'success';
      case 'BALD_FÄLLIG':
        return 'warning';
      case 'ÜBERFÄLLIG':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Qualitätsmanagement
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Qualitätsprüfungen, Reklamationen, Messmittel und QS-Dokumentation
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
                    Bestanden %
                  </Typography>
                  <Typography variant="h5" component="div">
                    {kpiData.bestandenProzent}%
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    {kpiData.bestanden} von {kpiData.gesamtPruefungen}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CheckCircleIcon />
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
                    Offene Reklamationen
                  </Typography>
                  <Typography variant="h5" component="div">
                    {kpiData.offeneReklamationen}
                  </Typography>
                  <Typography variant="body2" color="warning.main">
                    {kpiData.geloesteReklamationen} gelöst
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <BugReportIcon />
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
                    Lösungszeit (Ø)
                  </Typography>
                  <Typography variant="h5" component="div">
                    {kpiData.durchschnittlicheLoesungszeit}
                  </Typography>
                  <Typography variant="body2" color="info.main">
                    Tage
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <TimelineIcon />
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
                    Kalibrierungen
                  </Typography>
                  <Typography variant="h5" component="div">
                    {kpiData.ueberfaelligeKalibrierungen}
                  </Typography>
                  <Typography variant="body2" color="error.main">
                    Überfällig
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <SettingsIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="Qualitätsmanagement Tabs">
          <Tab label="Qualitätsprüfungen" icon={<ScienceIcon />} iconPosition="start" />
          <Tab label="Reklamationen" icon={<BugReportIcon />} iconPosition="start" />
          <Tab label="Messmittel" icon={<SettingsIcon />} iconPosition="start" />
          <Tab label="Zertifikate" icon={<VerifiedIcon />} iconPosition="start" />
          <Tab label="Audits" icon={<SecurityIcon />} iconPosition="start" />
          <Tab label="Statistiken" icon={<TrendingUpIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Prüfnummer</TableCell>
                <TableCell>Typ</TableCell>
                <TableCell>Artikel</TableCell>
                <TableCell>Lieferant</TableCell>
                <TableCell>Prüfer</TableCell>
                <TableCell>Datum</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ergebnis</TableCell>
                <TableCell>Parameter</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {qualitaetspruefungen.map((pruefung) => (
                <TableRow key={pruefung.id}>
                  <TableCell>{pruefung.pruefung_nr}</TableCell>
                  <TableCell>
                    <Chip label={pruefung.pruefung_typ} size="small" />
                  </TableCell>
                  <TableCell>{pruefung.artikel}</TableCell>
                  <TableCell>{pruefung.lieferant || '-'}</TableCell>
                  <TableCell>{pruefung.pruefer}</TableCell>
                  <TableCell>{formatDate(pruefung.pruefdatum)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={pruefung.status} 
                      color={getStatusColor(pruefung.status) as any}
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    {pruefung.ergebnis ? (
                      <Chip 
                        label={pruefung.ergebnis} 
                        color={getStatusColor(pruefung.ergebnis) as any}
                        size="small" 
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={(pruefung.ok_parameter / pruefung.anzahl_parameter) * 100} 
                          sx={{ height: 8, borderRadius: 5 }}
                        />
                      </Box>
                      <Box sx={{ minWidth: 35 }}>
                        <Typography variant="body2" color="text.secondary">
                          {pruefung.ok_parameter}/{pruefung.anzahl_parameter}
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
                <TableCell>Reklamationsnummer</TableCell>
                <TableCell>Typ</TableCell>
                <TableCell>Artikel</TableCell>
                <TableCell>Lieferant/Kunde</TableCell>
                <TableCell>Datum</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priorität</TableCell>
                <TableCell>Verantwortlicher</TableCell>
                <TableCell>Maßnahmen</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reklamationen.map((reklamation) => (
                <TableRow key={reklamation.id}>
                  <TableCell>{reklamation.reklamation_nr}</TableCell>
                  <TableCell>
                    <Chip label={reklamation.reklamation_typ} size="small" />
                  </TableCell>
                  <TableCell>{reklamation.artikel}</TableCell>
                  <TableCell>{reklamation.lieferant || reklamation.kunde || '-'}</TableCell>
                  <TableCell>{formatDate(reklamation.reklamation_datum)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={reklamation.status} 
                      color={getStatusColor(reklamation.status) as any}
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={reklamation.prioritaet} 
                      color={getPrioritaetColor(reklamation.prioritaet) as any}
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{reklamation.verantwortlicher}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {reklamation.abgeschlossene_massnahmen}/{reklamation.anzahl_massnahmen}
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
                <TableCell>Messmittel-Nr</TableCell>
                <TableCell>Bezeichnung</TableCell>
                <TableCell>Typ</TableCell>
                <TableCell>Hersteller</TableCell>
                <TableCell>Standort</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Nächste Kalibrierung</TableCell>
                <TableCell>Kalibrier-Status</TableCell>
                <TableCell>Verantwortlicher</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {messmittel.map((mittel) => (
                <TableRow key={mittel.id}>
                  <TableCell>{mittel.messmittel_nr}</TableCell>
                  <TableCell>{mittel.bezeichnung}</TableCell>
                  <TableCell>
                    <Chip label={mittel.typ} size="small" />
                  </TableCell>
                  <TableCell>{mittel.hersteller}</TableCell>
                  <TableCell>{mittel.standort}</TableCell>
                  <TableCell>
                    <Chip 
                      label={mittel.status} 
                      color={getStatusColor(mittel.status) as any}
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{formatDate(mittel.naechste_kalibrierung)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={mittel.kalibrier_status} 
                      color={getKalibrierStatusColor(mittel.kalibrier_status) as any}
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{mittel.verantwortlicher}</TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <ViewIcon />
                    </IconButton>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small">
                      <CalendarIcon />
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
                <TableCell>Zertifikat-Nr</TableCell>
                <TableCell>Typ</TableCell>
                <TableCell>Bezeichnung</TableCell>
                <TableCell>Aussteller</TableCell>
                <TableCell>Ausstellungsdatum</TableCell>
                <TableCell>Gültig bis</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {zertifikate.map((zertifikat) => (
                <TableRow key={zertifikat.id}>
                  <TableCell>{zertifikat.zertifikat_nr}</TableCell>
                  <TableCell>
                    <Chip label={zertifikat.zertifikat_typ} size="small" />
                  </TableCell>
                  <TableCell>{zertifikat.bezeichnung}</TableCell>
                  <TableCell>{zertifikat.aussteller}</TableCell>
                  <TableCell>{formatDate(zertifikat.ausstellungs_datum)}</TableCell>
                  <TableCell>{formatDate(zertifikat.gueltig_bis)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={zertifikat.status} 
                      color={getStatusColor(zertifikat.status) as any}
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
                      <DescriptionIcon />
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
                <TableCell>Audit-Nr</TableCell>
                <TableCell>Typ</TableCell>
                <TableCell>Datum</TableCell>
                <TableCell>Ort</TableCell>
                <TableCell>Auditiert von</TableCell>
                <TableCell>Auditiert an</TableCell>
                <TableCell>Ergebnis</TableCell>
                <TableCell>Bewertung</TableCell>
                <TableCell>Nächstes Audit</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {audits.map((audit) => (
                <TableRow key={audit.id}>
                  <TableCell>{audit.audit_nr}</TableCell>
                  <TableCell>
                    <Chip label={audit.audit_typ} size="small" />
                  </TableCell>
                  <TableCell>{formatDate(audit.audit_datum)}</TableCell>
                  <TableCell>{audit.audit_ort}</TableCell>
                  <TableCell>{audit.auditiert_von}</TableCell>
                  <TableCell>{audit.auditiert_an}</TableCell>
                  <TableCell>
                    <Chip 
                      label={audit.ergebnis} 
                      color={getStatusColor(audit.ergebnis) as any}
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {[...Array(5)].map((_, index) => (
                        <CheckCircleIcon 
                          key={index}
                          sx={{ 
                            color: index < audit.bewertung ? 'gold' : 'grey.300',
                            fontSize: 16
                          }} 
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>{formatDate(audit.naechstes_audit)}</TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <ViewIcon />
                    </IconButton>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small">
                      <AssessmentIcon />
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
                  Qualitätsentwicklung
                </Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Chart: Qualitätsentwicklung der letzten 12 Monate
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Reklamationsverteilung
                </Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Chart: Reklamationen nach Typ und Status
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Qualitätsstatistiken
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {kpiData.bestandenProzent}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Bestanden
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main">
                        {kpiData.offeneReklamationen}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Offene Reklamationen
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main">
                        {kpiData.durchschnittlicheLoesungszeit}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tage (Ø Lösungszeit)
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="error.main">
                        {kpiData.ueberfaelligeKalibrierungen}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Überfällige Kalibrierungen
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
        onClick={() => handleOpenDialog('pruefung')}
      >
        <AddIcon />
      </Fab>

      {/* Generic Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'pruefung' && 'Neue Qualitätsprüfung erstellen'}
          {dialogType === 'reklamation' && 'Neue Reklamation erstellen'}
          {dialogType === 'messmittel' && 'Neues Messmittel erstellen'}
          {dialogType === 'zertifikat' && 'Neues Zertifikat erstellen'}
          {dialogType === 'audit' && 'Neues Audit erstellen'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Bezeichnung"
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Typ</InputLabel>
                  <Select label="Typ">
                    <MenuItem value="EINGANGSKONTROLLE">Eingangskontrolle</MenuItem>
                    <MenuItem value="PRODUKTION">Produktion</MenuItem>
                    <MenuItem value="AUSGANGSKONTROLLE">Ausgangskontrolle</MenuItem>
                    <MenuItem value="PERIODISCH">Periodisch</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Beschreibung"
                  variant="outlined"
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch />}
                  label="Aktiv"
                />
              </Grid>
            </Grid>
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

export default QualityManagement; 