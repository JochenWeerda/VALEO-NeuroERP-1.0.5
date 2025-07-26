import React, { useState, useEffect } from 'react';
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
  FormControlLabel,
  Rating
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  ContactPhone as ContactPhoneIcon,
  PersonAdd as PersonAddIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Chat as ChatIcon,
  Feedback as FeedbackIcon,
  Group as GroupIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Description as DescriptionIcon
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
      id={`crm-tabpanel-${index}`}
      aria-labelledby={`crm-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const CustomerManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'kunde' | 'lead' | 'aktivitaet' | 'chance' | 'kontakt' | 'protokoll' | 'eintrag'>('kunde');
  const [customers, setCustomers] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  // Import the new CRM service
  useEffect(() => {
    // Load customers and statistics when component mounts
    // This will be implemented with the new API
  }, []);

  // Mock-Daten für KPI-Cards
  const kpiData = {
    gesamtKunden: 156,
    aktiveKunden: 142,
    neueKunden: 12,
    verloreneKunden: 2,
    durchschnittlicheBewertung: 4.2,
    gesamtLeads: 23,
    gewonneneLeads: 8,
    verloreneLeads: 5,
    konversionsrate: 34.8,
    gesamtAktivitaeten: 89,
    durchgefuehrteAktivitaeten: 67
  };

  // Mock-Daten für Kunden
  const kunden = [
        {
          id: '1',
      kunden_nr: 'K-2024-0001',
      firmenname: 'Agrarhof Müller GmbH',
      kundentyp: 'GESCHAEFTSKUNDE',
      kundenstatus: 'AKTIV',
      kundenbewertung: 5,
      kundenseit: 'A',
      umsatzklasse: 'GROSS',
      kundenbetreuer_name: 'Dr. Hans Weber',
      strasse: 'Musterstraße 123',
      plz: '12345',
      ort: 'Musterstadt',
      telefon: '01234-567890',
      email: 'info@agrarhof-mueller.de',
      anzahl_kontakte: 3,
      anzahl_aktivitaeten: 12,
      anzahl_chancen: 2,
      letzte_aktivitaet: '2024-01-15'
        },
        {
          id: '2',
      kunden_nr: 'K-2024-0002',
      firmenname: 'Bauernhof Schmidt',
      kundentyp: 'PRIVATKUNDE',
      kundenstatus: 'AKTIV',
      kundenbewertung: 4,
      kundenseit: 'B',
      umsatzklasse: 'KLEIN',
      kundenbetreuer_name: 'Maria Schmidt',
      strasse: 'Dorfstraße 45',
      plz: '54321',
      ort: 'Dorfstadt',
      telefon: '05432-123456',
      email: 'schmidt@bauernhof.de',
      anzahl_kontakte: 1,
      anzahl_aktivitaeten: 8,
      anzahl_chancen: 1,
      letzte_aktivitaet: '2024-01-16'
        },
        {
          id: '3',
      kunden_nr: 'K-2024-0003',
      firmenname: 'Landwirtschaftliche Genossenschaft',
      kundentyp: 'GESCHAEFTSKUNDE',
      kundenstatus: 'AKTIV',
      kundenbewertung: 5,
      kundenseit: 'A',
      umsatzklasse: 'GROSS',
      kundenbetreuer_name: 'Peter Müller',
      strasse: 'Genossenschaftsweg 1',
      plz: '67890',
      ort: 'Genossenschaftsstadt',
      telefon: '06789-987654',
      email: 'info@lwg.de',
      anzahl_kontakte: 2,
      anzahl_aktivitaeten: 15,
      anzahl_chancen: 3,
      letzte_aktivitaet: '2024-01-17'
    }
  ];

  // Mock-Daten für Leads
  const leads = [
    {
      id: '1',
      lead_nr: 'L-2024-0001',
      firmenname: 'Neuer Landwirt GmbH',
      ansprechpartner: 'Max Mustermann',
      email: 'max@neuer-landwirt.de',
      telefon: '01234-111111',
      quelle: 'WEBSITE',
      status: 'NEU',
      prioritaet: 'HOCH',
      wert: 50000,
      verantwortlicher_name: 'Dr. Hans Weber',
      naechster_kontakt: '2024-01-20',
      anzahl_aktivitaeten: 2,
      letzte_aktivitaet: '2024-01-17'
    },
    {
      id: '2',
      lead_nr: 'L-2024-0002',
      firmenname: 'Bio-Hof Meier',
      ansprechpartner: 'Anna Meier',
      email: 'anna@bio-hof-meier.de',
      telefon: '01234-222222',
      quelle: 'EMPFOHLUNG',
      status: 'KONTAKTIERT',
      prioritaet: 'NORMAL',
      wert: 30000,
      verantwortlicher_name: 'Maria Schmidt',
      naechster_kontakt: '2024-01-22',
      anzahl_aktivitaeten: 3,
      letzte_aktivitaet: '2024-01-16'
    },
    {
      id: '3',
      lead_nr: 'L-2024-0003',
      firmenname: 'Test Lead',
      ansprechpartner: 'Test Person',
      email: 'test@test.de',
      telefon: '01234-333333',
      quelle: 'MESSE',
      status: 'INTERESSIERT',
      prioritaet: 'NIEDRIG',
      wert: 15000,
      verantwortlicher_name: 'Peter Müller',
      naechster_kontakt: '2024-01-25',
      anzahl_aktivitaeten: 1,
      letzte_aktivitaet: '2024-01-15'
    }
  ];

  // Mock-Daten für Verkaufsaktivitäten
  const aktivitaeten = [
    {
      id: '1',
      aktivitaet_nr: 'VA-2024-0001',
      aktivitaet_typ: 'TELEFONAT',
      titel: 'Kundengespräch',
      datum: '2024-01-15',
      uhrzeit: '10:00',
      dauer: 30,
      status: 'DURCHGEFÜHRT',
      kunde_name: 'Agrarhof Müller GmbH',
      lead_name: null,
      verantwortlicher_name: 'Dr. Hans Weber',
      ergebnis: 'Kunde interessiert an neuen Futtermitteln',
      naechste_aktion: 'Angebot erstellen'
    },
    {
      id: '2',
      aktivitaet_nr: 'VA-2024-0002',
      aktivitaet_typ: 'BESUCH',
      titel: 'Hofbesuch',
      datum: '2024-01-16',
      uhrzeit: '14:00',
      dauer: 120,
      status: 'DURCHGEFÜHRT',
      kunde_name: 'Bauernhof Schmidt',
      lead_name: null,
      verantwortlicher_name: 'Maria Schmidt',
      ergebnis: 'Positives Feedback, Bestellung geplant',
      naechste_aktion: 'Bestellformular senden'
    },
    {
      id: '3',
      aktivitaet_nr: 'VA-2024-0003',
      aktivitaet_typ: 'EMAIL',
      titel: 'Erstkontakt',
      datum: '2024-01-17',
      uhrzeit: '09:00',
      dauer: 15,
      status: 'DURCHGEFÜHRT',
      kunde_name: null,
      lead_name: 'Neuer Landwirt GmbH',
      verantwortlicher_name: 'Dr. Hans Weber',
      ergebnis: 'Interesse bekundet, Rückruf gewünscht',
      naechste_aktion: 'Rückruf am 20.01.'
    }
  ];

  // Mock-Daten für Verkaufschancen
  const chancen = [
    {
      id: '1',
      chance_nr: 'VC-2024-0001',
      titel: 'Futtermittel-Liefervertrag',
      phase: 'VERHANDLUNG',
      wahrscheinlichkeit: 75,
      wert: 120000,
      erwarteter_abschluss: '2024-03-15',
      status: 'AKTIV',
      kunde_name: 'Agrarhof Müller GmbH',
      verantwortlicher_name: 'Dr. Hans Weber'
    },
    {
      id: '2',
      chance_nr: 'VC-2024-0002',
      titel: 'Dünger-Bestellung',
      phase: 'ANGEBOT',
      wahrscheinlichkeit: 60,
      wert: 25000,
      erwarteter_abschluss: '2024-02-28',
      status: 'AKTIV',
      kunde_name: 'Bauernhof Schmidt',
      verantwortlicher_name: 'Maria Schmidt'
    },
    {
      id: '3',
      chance_nr: 'VC-2024-0003',
      titel: 'Erstbestellung',
      phase: 'ANALYSE',
      wahrscheinlichkeit: 40,
      wert: 15000,
      erwarteter_abschluss: '2024-02-15',
      status: 'AKTIV',
      kunde_name: 'Neuer Landwirt GmbH',
      verantwortlicher_name: 'Dr. Hans Weber'
    }
  ];

  // Mock-Daten für Kontakte
  const kontakte = [
    {
      id: '1',
      kontakt_nr: 'KT-2024-0001',
      anrede: 'HERR',
      vorname: 'Hans',
      nachname: 'Müller',
      position: 'Geschäftsführer',
      telefon: '01234-567890',
      email: 'h.mueller@agrarhof-mueller.de',
      ist_hauptkontakt: true,
      kunde_name: 'Agrarhof Müller GmbH'
    },
    {
      id: '2',
      kontakt_nr: 'KT-2024-0002',
      anrede: 'FRAU',
      vorname: 'Maria',
      nachname: 'Schmidt',
      position: 'Inhaberin',
      telefon: '05432-123456',
      email: 'm.schmidt@bauernhof.de',
      ist_hauptkontakt: true,
      kunde_name: 'Bauernhof Schmidt'
    },
    {
      id: '3',
      kontakt_nr: 'KT-2024-0003',
      anrede: 'HERR',
      vorname: 'Peter',
      nachname: 'Weber',
      position: 'Vorstand',
      telefon: '06789-987654',
      email: 'p.weber@lwg.de',
      ist_hauptkontakt: true,
      kunde_name: 'Landwirtschaftliche Genossenschaft'
    }
  ];

  // Mock-Daten für Tagesprotokolle
  const mockTagesprotokolle = [
    {
      id: '1',
      protokollNr: 'TP-2024-05-001',
      protokollDatum: '2024-05-28',
      zeitraumStart: '2024-05-28',
      zeitraumEnde: '2024-06-04',
      status: 'freigegeben',
      mitarbeiterName: 'Max Mustermann',
      freigegebenVonName: 'Anna Schmidt',
      freigegebenAm: '2024-05-29 08:30:00',
      anzahlEintraege: 12,
      gesamtZeitaufwandMinuten: 480
    },
    {
      id: '2',
      protokollNr: 'TP-2024-05-002',
      protokollDatum: '2024-05-29',
      zeitraumStart: '2024-05-29',
      zeitraumEnde: '2024-05-29',
      status: 'entwurf',
      mitarbeiterName: 'Max Mustermann',
      freigegebenVonName: null,
      freigegebenAm: null,
      anzahlEintraege: 8,
      gesamtZeitaufwandMinuten: 320
    }
  ];

  const mockTagesprotokollEintraege = [
    {
      id: '1',
      protokollNr: 'TP-2024-05-001',
      protokollDatum: '2024-05-28',
      mitarbeiterName: 'Max Mustermann',
      kundeName: 'Agrarhof Müller GmbH',
      kontaktName: 'Hans Müller',
      eintragTyp: 'BETRIEBSBESUCH',
      kontaktRichtung: 'AUSGEHEND',
      titel: 'Betriebsbesuch Außenstände',
      beschreibung: 'Betriebsbesuch bei Uwe Lay, Aynwolde',
      ergebnis: 'Interesse an MLF und Mehlmischung',
      naechsteAktion: 'Finanzielle Sicherheit mit TBK klären',
      terminVereinbarung: '2024-06-10',
      mengeVereinbarung: null,
      einheitVereinbarung: null,
      preisVereinbarung: null,
      waehrungVereinbarung: 'EUR',
      kundenspezifischeAbsprachen: 'Soll zuvor finanzielle Sicherheit mit TBK klären, bevor er von mir Angebote erhält',
      zeitaufwandMinuten: 120
    },
    {
      id: '2',
      protokollNr: 'TP-2024-05-001',
      protokollDatum: '2024-05-28',
      mitarbeiterName: 'Max Mustermann',
      kundeName: 'Bauernhof Schmidt',
      kontaktName: 'Maria Schmidt',
      eintragTyp: 'TELEFONAT',
      kontaktRichtung: 'AUSGEHEND',
      titel: 'Telefonat Hero Fisser',
      beschreibung: 'Telefonat mit Hero Fisser',
      ergebnis: 'Nicht erreicht, Wuxal angeboten',
      naechsteAktion: 'Erneut versuchen',
      terminVereinbarung: null,
      mengeVereinbarung: null,
      einheitVereinbarung: null,
      preisVereinbarung: null,
      waehrungVereinbarung: 'EUR',
      kundenspezifischeAbsprachen: 'Wuxal angeboten',
      zeitaufwandMinuten: 15
    },
    {
      id: '3',
      protokollNr: 'TP-2024-05-001',
      protokollDatum: '2024-05-28',
      mitarbeiterName: 'Max Mustermann',
      kundeName: 'Landwirtschaftliche Genossenschaft',
      kontaktName: 'Peter Weber',
      eintragTyp: 'BESTELLUNG',
      kontaktRichtung: 'EINGEHEND',
      titel: 'Futter bestellt',
      beschreibung: 'Futterbestellung von Albert Koopmann',
      ergebnis: 'Futter bestellt',
      naechsteAktion: 'Lieferung planen',
      terminVereinbarung: '2024-06-05',
      mengeVereinbarung: 8.0,
      einheitVereinbarung: 'TO',
      preisVereinbarung: 184.50,
      waehrungVereinbarung: 'EUR',
      kundenspezifischeAbsprachen: 'Albert Koopmann hat Futter bestellt',
      zeitaufwandMinuten: 30
    }
  ];

  const mockTagesprotokollVorlagen = [
    {
      id: '1',
      vorlagenName: 'Betriebsbesuch - Standard',
      beschreibung: 'Standard-Vorlage für Betriebsbesuche',
      eintragTyp: 'BETRIEBSBESUCH',
      standardTitel: 'Betriebsbesuch',
      standardBeschreibung: 'Persönlicher Besuch beim Kunden',
      standardErgebnis: 'Kunde informiert über aktuelle Angebote',
      standardNaechsteAktion: 'Nächsten Termin vereinbaren'
    },
    {
      id: '2',
      vorlagenName: 'Telefonat - Rückruf',
      beschreibung: 'Standard-Vorlage für Rückrufe',
      eintragTyp: 'TELEFONAT',
      standardTitel: 'Rückruf',
      standardBeschreibung: 'Rückruf auf Kundenanfrage',
      standardErgebnis: 'Kunde erreicht, Anliegen besprochen',
      standardNaechsteAktion: 'Angebot erstellen'
    },
    {
      id: '3',
      vorlagenName: 'Lieferung - Standard',
      beschreibung: 'Standard-Vorlage für Lieferungen',
      eintragTyp: 'LIEFERUNG',
      standardTitel: 'Produktlieferung',
      standardBeschreibung: 'Lieferung durchgeführt',
      standardErgebnis: 'Lieferung erfolgreich',
      standardNaechsteAktion: 'Rechnung erstellen'
    }
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (type: 'kunde' | 'lead' | 'aktivitaet' | 'chance' | 'kontakt' | 'protokoll' | 'eintrag') => {
    setDialogType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AKTIV':
      case 'DURCHGEFÜHRT':
      case 'GEWONNEN':
        return 'success';
      case 'IN_BEARBEITUNG':
      case 'VERHANDLUNG':
      case 'ANGEBOT':
        return 'warning';
      case 'INAKTIV':
      case 'VERLOREN':
      case 'ABGESAGT':
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

  const getKundenseitColor = (seit: string) => {
    switch (seit) {
      case 'A':
        return 'success';
      case 'B':
        return 'info';
      case 'C':
        return 'warning';
      case 'D':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
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
          Kundenverwaltung (CRM)
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Erweiterte Kundenprofile, Leads, Verkaufsaktivitäten und Kontaktverwaltung
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
                    Aktive Kunden
        </Typography>
                  <Typography variant="h5" component="div">
                    {kpiData.aktiveKunden}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    +{kpiData.neueKunden} neu
                  </Typography>
      </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
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
                    Konversionsrate
                  </Typography>
                  <Typography variant="h5" component="div">
                    {kpiData.konversionsrate}%
                  </Typography>
                  <Typography variant="body2" color="info.main">
                    {kpiData.gewonneneLeads} von {kpiData.gesamtLeads}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <TrendingUpIcon />
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
                    Bewertung (Ø)
                  </Typography>
                  <Typography variant="h5" component="div">
                    {kpiData.durchschnittlicheBewertung}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Rating value={kpiData.durchschnittlicheBewertung} readOnly size="small" />
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <StarIcon />
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
                    Aktivitäten
                  </Typography>
                  <Typography variant="h5" component="div">
                    {kpiData.durchgefuehrteAktivitaeten}
                  </Typography>
                  <Typography variant="body2" color="primary.main">
                    von {kpiData.gesamtAktivitaeten}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <AssignmentIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="CRM Tabs">
          <Tab label="Kunden" icon={<PeopleIcon />} iconPosition="start" />
          <Tab label="Leads" icon={<PersonAddIcon />} iconPosition="start" />
          <Tab label="Aktivitäten" icon={<AssignmentIcon />} iconPosition="start" />
          <Tab label="Verkaufschancen" icon={<TrendingUpIcon />} iconPosition="start" />
          <Tab label="Kontakte" icon={<ContactPhoneIcon />} iconPosition="start" />
          <Tab label="Statistiken" icon={<AssessmentIcon />} iconPosition="start" />
          <Tab label="Tagesprotokolle" icon={<DescriptionIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Kundennummer</TableCell>
                <TableCell>Firmenname</TableCell>
                <TableCell>Typ</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Bewertung</TableCell>
                <TableCell>Kundenseit</TableCell>
                <TableCell>Umsatzklasse</TableCell>
                <TableCell>Betreuer</TableCell>
                <TableCell>Kontakte</TableCell>
                <TableCell>Letzte Aktivität</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {kunden.map((kunde) => (
                <TableRow key={kunde.id}>
                  <TableCell>{kunde.kunden_nr}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {kunde.firmenname}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {kunde.strasse}, {kunde.plz} {kunde.ort}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={kunde.kundentyp} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={kunde.kundenstatus} 
                      color={getStatusColor(kunde.kundenstatus) as any}
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Rating value={kunde.kundenbewertung} readOnly size="small" />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={kunde.kundenseit} 
                      color={getKundenseitColor(kunde.kundenseit) as any}
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={kunde.umsatzklasse} size="small" />
                  </TableCell>
                  <TableCell>{kunde.kundenbetreuer_name}</TableCell>
                  <TableCell>
                    <Badge badgeContent={kunde.anzahl_kontakte} color="primary">
                      <ContactPhoneIcon />
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(kunde.letzte_aktivitaet)}</TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <ViewIcon />
                    </IconButton>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small">
                      <PhoneIcon />
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
                <TableCell>Lead-Nr</TableCell>
                <TableCell>Firmenname</TableCell>
                <TableCell>Ansprechpartner</TableCell>
                <TableCell>Quelle</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priorität</TableCell>
                <TableCell>Wert</TableCell>
                <TableCell>Verantwortlicher</TableCell>
                <TableCell>Nächster Kontakt</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>{lead.lead_nr}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {lead.firmenname}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {lead.email} | {lead.telefon}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{lead.ansprechpartner}</TableCell>
                  <TableCell>
                    <Chip label={lead.quelle} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={lead.status} 
                      color={getStatusColor(lead.status) as any}
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={lead.prioritaet} 
                      color={getPrioritaetColor(lead.prioritaet) as any}
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{formatCurrency(lead.wert)}</TableCell>
                  <TableCell>{lead.verantwortlicher_name}</TableCell>
                  <TableCell>{formatDate(lead.naechster_kontakt)}</TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <ViewIcon />
                    </IconButton>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small">
                      <PhoneIcon />
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
                <TableCell>Aktivitäts-Nr</TableCell>
                <TableCell>Typ</TableCell>
                <TableCell>Titel</TableCell>
                <TableCell>Datum</TableCell>
                <TableCell>Kunde/Lead</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Dauer</TableCell>
                <TableCell>Verantwortlicher</TableCell>
                <TableCell>Ergebnis</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {aktivitaeten.map((aktivitaet) => (
                <TableRow key={aktivitaet.id}>
                  <TableCell>{aktivitaet.aktivitaet_nr}</TableCell>
                  <TableCell>
                    <Chip label={aktivitaet.aktivitaet_typ} size="small" />
                  </TableCell>
                  <TableCell>{aktivitaet.titel}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {formatDate(aktivitaet.datum)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {aktivitaet.uhrzeit}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{aktivitaet.kunde_name || aktivitaet.lead_name}</TableCell>
                  <TableCell>
                    <Chip 
                      label={aktivitaet.status} 
                      color={getStatusColor(aktivitaet.status) as any}
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{aktivitaet.dauer} Min</TableCell>
                  <TableCell>{aktivitaet.verantwortlicher_name}</TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                      {aktivitaet.ergebnis}
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
                      <ChatIcon />
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
                <TableCell>Chance-Nr</TableCell>
                <TableCell>Titel</TableCell>
                <TableCell>Kunde</TableCell>
                <TableCell>Phase</TableCell>
                <TableCell>Wahrscheinlichkeit</TableCell>
                <TableCell>Wert</TableCell>
                <TableCell>Erwarteter Abschluss</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Verantwortlicher</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {chancen.map((chance) => (
                <TableRow key={chance.id}>
                  <TableCell>{chance.chance_nr}</TableCell>
                  <TableCell>{chance.titel}</TableCell>
                  <TableCell>{chance.kunde_name}</TableCell>
                  <TableCell>
                    <Chip label={chance.phase} size="small" />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={chance.wahrscheinlichkeit} 
                          sx={{ height: 8, borderRadius: 5 }}
                        />
                      </Box>
                      <Box sx={{ minWidth: 35 }}>
                        <Typography variant="body2" color="text.secondary">
                          {chance.wahrscheinlichkeit}%
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{formatCurrency(chance.wert)}</TableCell>
                  <TableCell>{formatDate(chance.erwarteter_abschluss)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={chance.status} 
                      color={getStatusColor(chance.status) as any}
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{chance.verantwortlicher_name}</TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <ViewIcon />
                    </IconButton>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small">
                      <TrendingUpIcon />
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
                <TableCell>Kontakt-Nr</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Kunde</TableCell>
                <TableCell>Telefon</TableCell>
                <TableCell>E-Mail</TableCell>
                <TableCell>Hauptkontakt</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {kontakte.map((kontakt) => (
                <TableRow key={kontakt.id}>
                  <TableCell>{kontakt.kontakt_nr}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {kontakt.anrede} {kontakt.vorname} {kontakt.nachname}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{kontakt.position}</TableCell>
                  <TableCell>{kontakt.kunde_name}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneIcon sx={{ mr: 1, fontSize: 16 }} />
                      {kontakt.telefon}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EmailIcon sx={{ mr: 1, fontSize: 16 }} />
                      {kontakt.email}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {kontakt.ist_hauptkontakt ? (
                      <Chip label="Hauptkontakt" color="primary" size="small" />
                    ) : (
                      <Chip label="Kontakt" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <ViewIcon />
                    </IconButton>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small">
                      <PhoneIcon />
                    </IconButton>
                    <IconButton size="small">
                      <EmailIcon />
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
                  Kundenentwicklung
                </Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Chart: Kundenentwicklung der letzten 12 Monate
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Lead-Konversion
                </Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Chart: Lead-Konversion nach Quelle
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  CRM-Statistiken
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {kpiData.aktiveKunden}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Aktive Kunden
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main">
                        {kpiData.konversionsrate}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Konversionsrate
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main">
                        {kpiData.durchschnittlicheBewertung}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Bewertung (Ø)
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary.main">
                        {kpiData.durchgefuehrteAktivitaeten}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Aktivitäten (Monat)
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tagesprotokolle Tab */}
      <TabPanel value={tabValue} index={6}>
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6">Tagesprotokolle</Typography>
          <div className="flex space-x-2">
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('protokoll')}
            >
              Neues Protokoll
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('eintrag')}
            >
              Neuer Eintrag
            </Button>
          </div>
        </div>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Protokoll-Nr</TableCell>
                <TableCell>Datum</TableCell>
                <TableCell>Zeitraum</TableCell>
                <TableCell>Mitarbeiter</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Einträge</TableCell>
                <TableCell>Zeitaufwand</TableCell>
                <TableCell>Freigegeben</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockTagesprotokolle.map((protokoll) => (
                <TableRow key={protokoll.id}>
                  <TableCell>
                    <Typography variant="subtitle2" className="font-semibold">
                      {protokoll.protokollNr}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDate(protokoll.protokollDatum)}</TableCell>
                  <TableCell>
                    {protokoll.zeitraumStart === protokoll.zeitraumEnde 
                      ? formatDate(protokoll.zeitraumStart)
                      : `${formatDate(protokoll.zeitraumStart)} - ${formatDate(protokoll.zeitraumEnde)}`
                    }
                  </TableCell>
                  <TableCell>{protokoll.mitarbeiterName}</TableCell>
                  <TableCell>
                    <Chip
                      label={protokoll.status}
                      color={protokoll.status === 'freigegeben' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Badge badgeContent={protokoll.anzahlEintraege} color="primary">
                      <AssignmentIcon />
                    </Badge>
                  </TableCell>
                  <TableCell>{Math.round(protokoll.gesamtZeitaufwandMinuten / 60 * 10) / 10}h</TableCell>
                  <TableCell>
                    {protokoll.freigegebenVonName ? (
                      <div>
                        <Typography variant="caption" display="block">
                          {protokoll.freigegebenVonName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatDate(protokoll.freigegebenAm?.split(' ')[0])}
                        </Typography>
                      </div>
                    ) : (
                      <Typography variant="caption" color="textSecondary">
                        Nicht freigegeben
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <IconButton size="small" color="primary">
                        <ViewIcon />
                      </IconButton>
                      <IconButton size="small" color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="success">
                        <CheckCircleIcon />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Tagesprotokoll-Einträge */}
        <div className="mt-6">
          <Typography variant="h6" className="mb-4">Protokoll-Einträge</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Protokoll</TableCell>
                  <TableCell>Kunde</TableCell>
                  <TableCell>Typ</TableCell>
                  <TableCell>Richtung</TableCell>
                  <TableCell>Titel</TableCell>
                  <TableCell>Ergebnis</TableCell>
                  <TableCell>Termin</TableCell>
                  <TableCell>Menge/Preis</TableCell>
                  <TableCell>Zeitaufwand</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockTagesprotokollEintraege.map((eintrag) => (
                  <TableRow key={eintrag.id}>
                    <TableCell>
                      <div>
                        <Typography variant="body2" className="font-semibold">
                          {eintrag.protokollNr}
                        </Typography>
                        <Typography variant="caption" className="text-gray-600">
                          {eintrag.mitarbeiterName}
                        </Typography>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Typography variant="body2" className="font-semibold">
                          {eintrag.kundeName}
                        </Typography>
                        <Typography variant="caption" className="text-gray-600">
                          {eintrag.kontaktName}
                        </Typography>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={eintrag.eintragTyp}
                        color={getStatusColor(eintrag.eintragTyp.toLowerCase())}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={eintrag.kontaktRichtung}
                        color={eintrag.kontaktRichtung === 'EINGEHEND' ? 'info' : 'primary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" className="font-semibold">
                        {eintrag.titel}
                      </Typography>
                      <Typography variant="caption" className="text-gray-600">
                        {eintrag.beschreibung}
                      </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                        {eintrag.ergebnis}
                      </Typography>
                      <Typography variant="caption" className="text-gray-600">
                        {eintrag.naechsteAktion}
                    </Typography>
                  </TableCell>
                  <TableCell>
                      {eintrag.terminVereinbarung ? formatDate(eintrag.terminVereinbarung) : '-'}
                    </TableCell>
                    <TableCell>
                      {eintrag.mengeVereinbarung && eintrag.preisVereinbarung ? (
                        <div>
                          <Typography variant="body2">
                            {eintrag.mengeVereinbarung} {eintrag.einheitVereinbarung}
                          </Typography>
                          <Typography variant="caption" className="text-gray-600">
                            {formatCurrency(eintrag.preisVereinbarung)}/{eintrag.einheitVereinbarung}
                          </Typography>
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{eintrag.zeitaufwandMinuten}min</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <IconButton size="small" color="primary">
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small" color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        {/* Tagesprotokoll-Vorlagen */}
        <div className="mt-6">
          <Typography variant="h6" className="mb-4">Protokoll-Vorlagen</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Vorlagenname</TableCell>
                  <TableCell>Typ</TableCell>
                  <TableCell>Standard-Titel</TableCell>
                  <TableCell>Standard-Beschreibung</TableCell>
                  <TableCell>Standard-Ergebnis</TableCell>
                  <TableCell>Nächste Aktion</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockTagesprotokollVorlagen.map((vorlage) => (
                  <TableRow key={vorlage.id}>
                    <TableCell>
                      <Typography variant="subtitle2" className="font-semibold">
                        {vorlage.vorlagenName}
                      </Typography>
                      <Typography variant="caption" className="text-gray-600">
                        {vorlage.beschreibung}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={vorlage.eintragTyp}
                        color={getStatusColor(vorlage.eintragTyp.toLowerCase())}
                          size="small" 
                      />
                    </TableCell>
                    <TableCell>{vorlage.standardTitel}</TableCell>
                    <TableCell>{vorlage.standardBeschreibung}</TableCell>
                    <TableCell>{vorlage.standardErgebnis}</TableCell>
                    <TableCell>{vorlage.standardNaechsteAktion}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <IconButton size="small" color="primary">
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small" color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        </div>
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'kunde' && 'Neuen Kunden erstellen'}
          {dialogType === 'lead' && 'Neuen Lead erstellen'}
          {dialogType === 'aktivitaet' && 'Neue Verkaufsaktivität'}
          {dialogType === 'chance' && 'Neue Verkaufschance'}
          {dialogType === 'kontakt' && 'Neuen Kontakt erstellen'}
          {dialogType === 'protokoll' && 'Neues Tagesprotokoll erstellen'}
          {dialogType === 'eintrag' && 'Neuen Protokoll-Eintrag erstellen'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Firmenname"
                  variant="outlined"
                  size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Kundentyp</InputLabel>
                  <Select label="Kundentyp">
                    <MenuItem value="GESCHAEFTSKUNDE">Geschäftskunde</MenuItem>
                    <MenuItem value="PRIVATKUNDE">Privatkunde</MenuItem>
                    <MenuItem value="GROSSKUNDE">Großkunde</MenuItem>
                    <MenuItem value="TESTKUNDE">Testkunde</MenuItem>
                  </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="E-Mail"
                  variant="outlined"
                  size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefon"
                  variant="outlined"
                  size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adresse"
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

export default CustomerManagement; 