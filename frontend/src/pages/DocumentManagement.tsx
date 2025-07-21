import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
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
  LinearProgress,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  IconButton,
  Box,
  Badge,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Folder as FolderIcon,
  AccountTree as WorkflowIcon,
  Archive as ArchiveIcon,
  Search as SearchIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  Tag as TagIcon,
  Category as CategoryIcon,
  Settings as SettingsIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  Verified as VerifiedIcon,
  Pending as PendingIcon,
  Block as BlockIcon,
  ExpandMore as ExpandMoreIcon,
  CleaningServices as CleaningServicesIcon,
  Gavel as GavelIcon,
  Storage as StorageIcon,
  Timeline as TimelineIcon,
  Notifications as NotificationsIcon,
  AutoDelete as AutoDeleteIcon,
  Backup as BackupIcon,
  RestoreFromTrash as RestoreFromTrashIcon,
  Assessment as AssessmentIcon
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
      id={`document-tabpanel-${index}`}
      aria-labelledby={`document-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Mock-Daten für Dokumentenstatistiken
const mockDocumentStats = {
  gesamtDokumente: 1247,
  neueDokumente: 45,
  freigegebeneDokumente: 892,
  archivierteDokumente: 310,
  gesamtDateigroesseMB: 2456.8,
  durchschnittlicheDateigroesseMB: 1.97,
  haeufigsteKategorien: 'Verträge, Rechnungen, Angebote',
  haeufigsteTypen: 'PDF, DOCX, XLSX',
  aktiveWorkflows: 23,
  abgeschlosseneWorkflows: 156
};

// Mock-Daten für Dokumente
const mockDocuments = [
  {
    id: '1',
    dokumentNr: 'DOC-2024-05-001',
    titel: 'Lieferantenvertrag Müller GmbH',
    beschreibung: 'Langfristiger Liefervertrag für Futtermittel',
    kategorieName: 'Verträge',
    dokumentTyp: 'PDF',
    status: 'freigegeben',
    version: '1.0',
    erstelltVonName: 'Max Mustermann',
    freigegebenVonName: 'Anna Schmidt',
    erstelltAm: '2024-05-15 10:30:00',
    freigegebenAm: '2024-05-16 14:20:00',
    dateigroesseMB: 2.0,
    anzahlVersionen: 3,
    anzahlTags: 2,
    anzahlZugriffe: 15
  },
  {
    id: '2',
    dokumentNr: 'DOC-2024-05-002',
    titel: 'Rechnung 2024-001',
    beschreibung: 'Rechnung für Düngerlieferung',
    kategorieName: 'Rechnungen',
    dokumentTyp: 'PDF',
    status: 'freigegeben',
    version: '1.0',
    erstelltVonName: 'Max Mustermann',
    freigegebenVonName: 'Anna Schmidt',
    erstelltAm: '2024-05-14 09:15:00',
    freigegebenAm: '2024-05-14 16:45:00',
    dateigroesseMB: 0.5,
    anzahlVersionen: 1,
    anzahlTags: 1,
    anzahlZugriffe: 8
  },
  {
    id: '3',
    dokumentNr: 'DOC-2024-05-003',
    titel: 'QS-Handbuch 2024',
    beschreibung: 'Qualitätssicherungshandbuch',
    kategorieName: 'Qualitätsdokumente',
    dokumentTyp: 'PDF',
    status: 'entwurf',
    version: '2.1',
    erstelltVonName: 'Max Mustermann',
    freigegebenVonName: null,
    erstelltAm: '2024-05-13 11:20:00',
    freigegebenAm: null,
    dateigroesseMB: 1.0,
    anzahlVersionen: 5,
    anzahlTags: 2,
    anzahlZugriffe: 3
  },
  {
    id: '4',
    dokumentNr: 'DOC-2024-05-004',
    titel: 'Angebot Kunde Schmidt',
    beschreibung: 'Preisangebot für Futtermittel',
    kategorieName: 'Angebote',
    dokumentTyp: 'DOCX',
    status: 'freigegeben',
    version: '1.0',
    erstelltVonName: 'Max Mustermann',
    freigegebenVonName: 'Anna Schmidt',
    erstelltAm: '2024-05-12 15:45:00',
    freigegebenAm: '2024-05-13 10:30:00',
    dateigroesseMB: 0.25,
    anzahlVersionen: 2,
    anzahlTags: 1,
    anzahlZugriffe: 12
  }
];

// Mock-Daten für Workflows
const mockWorkflows = [
  {
    id: '1',
    workflowName: 'Standard-Freigabe',
    dokumentNr: 'DOC-2024-05-003',
    dokumentTitel: 'QS-Handbuch 2024',
    workflowStatus: 'aktiv',
    gestartetVonName: 'Max Mustermann',
    gestartetAm: '2024-05-13 11:20:00',
    abgeschlossenAm: null,
    anzahlSchritte: 2,
    abgeschlosseneSchritte: 1
  },
  {
    id: '2',
    workflowName: 'QS-Freigabe',
    dokumentNr: 'DOC-2024-05-005',
    dokumentTitel: 'Qualitätszertifikat 2024',
    workflowStatus: 'abgeschlossen',
    gestartetVonName: 'Max Mustermann',
    gestartetAm: '2024-05-10 09:00:00',
    abgeschlossenAm: '2024-05-12 16:30:00',
    anzahlSchritte: 2,
    abgeschlosseneSchritte: 2
  }
];

// Mock-Daten für Kategorien
const mockCategories = [
  { id: '1', name: 'Verträge', beschreibung: 'Verträge und Vereinbarungen', farbe: '#1976d2', anzahlDokumente: 156 },
  { id: '2', name: 'Rechnungen', beschreibung: 'Rechnungen und Zahlungsbelege', farbe: '#388e3c', anzahlDokumente: 234 },
  { id: '3', name: 'Angebote', beschreibung: 'Kundenangebote und Preislisten', farbe: '#f57c00', anzahlDokumente: 89 },
  { id: '4', name: 'Qualitätsdokumente', beschreibung: 'QS-Dokumentation und Zertifikate', farbe: '#d32f2f', anzahlDokumente: 67 },
  { id: '5', name: 'Personal', beschreibung: 'Personalunterlagen und Arbeitsverträge', farbe: '#7b1fa2', anzahlDokumente: 45 },
  { id: '6', name: 'Finanzen', beschreibung: 'Finanzberichte und Buchhaltung', farbe: '#ff9800', anzahlDokumente: 123 }
];

// Mock-Daten für Tags
const mockTags = [
  { id: '1', name: 'Wichtig', beschreibung: 'Wichtige Dokumente', farbe: '#d32f2f', anzahlDokumente: 45 },
  { id: '2', name: 'Vertraulich', beschreibung: 'Vertrauliche Dokumente', farbe: '#7b1fa2', anzahlDokumente: 23 },
  { id: '3', name: 'QS', beschreibung: 'Qualitätssicherung', farbe: '#4caf50', anzahlDokumente: 67 },
  { id: '4', name: 'Final', beschreibung: 'Finale Versionen', farbe: '#388e3c', anzahlDokumente: 234 },
  { id: '5', name: 'Draft', beschreibung: 'Entwürfe', farbe: '#ff9800', anzahlDokumente: 89 }
];

// Mock-Daten für Bereinigungsaufträge
const mockBereinigungsauftraege = [
  {
    id: '1',
    auftragNr: 'BA-2024-001',
    auftragTyp: 'ARCHIVIERUNG',
    regelName: 'Rechnungen - 6 Jahre',
    status: 'ABGESCHLOSSEN',
    geplantesDatum: '2024-05-15',
    ausgefuehrtAm: '2024-05-15 02:00:00',
    anzahlDokumente: 156,
    erfolgreichVerarbeitet: 154,
    fehlgeschlageneVerarbeitung: 2,
    ausgefuehrtVonName: 'System',
    kommentar: 'Automatische Archivierung erfolgreich abgeschlossen'
  },
  {
    id: '2',
    auftragNr: 'BA-2024-002',
    auftragTyp: 'LOESCHUNG',
    regelName: 'Temporäre Dokumente - 1 Jahr',
    status: 'IN_BEARBEITUNG',
    geplantesDatum: '2024-05-20',
    ausgefuehrtAm: null,
    anzahlDokumente: 89,
    erfolgreichVerarbeitet: 45,
    fehlgeschlageneVerarbeitung: 0,
    ausgefuehrtVonName: 'System',
    kommentar: 'Löschung läuft...'
  }
];

// Mock-Daten für Bereinigungsprotokoll
const mockBereinigungsprotokoll = [
  {
    id: '1',
    auftragNr: 'BA-2024-001',
    dokumentNr: 'DOC-2020-001',
    dokumentTitel: 'Rechnung Müller GmbH',
    aktion: 'ARCHIVIERT',
    status: 'ERFOLGREICH',
    fehlermeldung: null,
    exportPfad: '/archive/2024/05/rechnungen/',
    dateigroesseVorher: 2048576,
    dateigroesseNachher: 2048576,
    ausgefuehrtAm: '2024-05-15 02:15:30'
  },
  {
    id: '2',
    auftragNr: 'BA-2024-001',
    dokumentNr: 'DOC-2020-002',
    dokumentTitel: 'Rechnung Schmidt KG',
    aktion: 'ARCHIVIERT',
    status: 'FEHLGESCHLAGEN',
    fehlermeldung: 'Datei nicht gefunden',
    exportPfad: null,
    dateigroesseVorher: 1536000,
    dateigroesseNachher: 1536000,
    ausgefuehrtAm: '2024-05-15 02:16:45'
  }
];

// Mock-Daten für gesetzliche Fristen
const mockGesetzlicheFristen = [
  {
    id: '1',
    dokumentTyp: 'Handelsbücher',
    kategorie: 'Buchhaltung',
    gesetzlicheFristJahre: 10,
    gesetzlicheGrundlage: '§ 147 AO, § 257 HGB',
    beschreibung: 'Handelsbücher, Inventare, Eröffnungsbilanzen, Jahresabschlüsse',
    bemerkungen: 'Elektronische Aufbewahrung möglich'
  },
  {
    id: '2',
    dokumentTyp: 'Rechnungen',
    kategorie: 'Buchhaltung',
    gesetzlicheFristJahre: 6,
    gesetzlicheGrundlage: '§ 14b UStG',
    beschreibung: 'Ausgangs- und Eingangsrechnungen',
    bemerkungen: 'Elektronische Aufbewahrung erforderlich'
  },
  {
    id: '3',
    dokumentTyp: 'Lohnunterlagen',
    kategorie: 'Personal',
    gesetzlicheFristJahre: 6,
    gesetzlicheGrundlage: '§ 147 AO',
    beschreibung: 'Lohnsteuerkarten, Lohnabrechnungen, Sozialversicherungsnachweise',
    bemerkungen: 'Aufbewahrung in elektronischer Form möglich'
  },
  {
    id: '4',
    dokumentTyp: 'Verträge',
    kategorie: 'Recht',
    gesetzlicheFristJahre: 3,
    gesetzlicheGrundlage: '§ 195 BGB',
    beschreibung: 'Kaufverträge, Dienstverträge, Werkverträge',
    bemerkungen: 'Verjährungsfrist beachten'
  },
  {
    id: '5',
    dokumentTyp: 'Qualitätsdokumentation',
    kategorie: 'Qualität',
    gesetzlicheFristJahre: 5,
    gesetzlicheGrundlage: 'QS-System, HACCP',
    beschreibung: 'Qualitätsprüfungen, HACCP-Dokumentation, Eigenkontrollen',
    bemerkungen: 'QS-konforme Aufbewahrung erforderlich'
  }
];

// Mock-Daten für Speicherplatz-Statistiken
const mockSpeicherplatzStats = {
  gesamtSpeicherMB: 2456.8,
  aktiveDokumenteMB: 1890.3,
  archivierteDokumenteMB: 566.5,
  anzahlAktiveDokumente: 892,
  anzahlArchivierteDokumente: 310,
  einsparungspotentialMB: 234.7,
  ablaufendeFristen: 45,
  kritischeFristen: 12
};

// Mock-Daten für Sicherheit und Compliance
const mockSicherheitsDaten = {
  verschluesselteDokumente: 45,
  digitaleSignaturen: 23,
  aktiveBerechtigungen: 156,
  sicherheitswarnungen: 3,
  letzteSicherheitspruefung: '2024-05-28 14:30:00'
};

const mockComplianceDaten = {
  dsgvoKonformeDokumente: 892,
  personenbezogeneDaten: 234,
  ablaufendeFristen: 12,
  auditEintraege: 1247,
  letzterComplianceCheck: '2024-05-28 10:15:00'
};

const mockPerformanceDaten = {
  durchschnittlicheSuchzeit: 0.8,
  durchschnittlicheUploadZeit: 2.3,
  durchschnittlicheDownloadZeit: 1.1,
  systemAuslastung: 67,
  aktiveBenutzer: 23
};

const mockVolltextSuchergebnisse = [
  {
    id: '1',
    dokumentNr: 'DOC-2024-001',
    titel: 'Lieferantenvertrag Müller GmbH',
    kategorieName: 'Verträge',
    relevanzScore: 0.95,
    trefferAnzahl: 3,
    erstelltAm: '2024-05-28'
  },
  {
    id: '2',
    dokumentNr: 'DOC-2024-002',
    titel: 'Rechnung 2024-001',
    kategorieName: 'Rechnungen',
    relevanzScore: 0.87,
    trefferAnzahl: 2,
    erstelltAm: '2024-05-27'
  }
];

// Helper-Funktionen
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'freigegeben': return 'success';
    case 'entwurf': return 'warning';
    case 'archiviert': return 'default';
    case 'geloescht': return 'error';
    default: return 'default';
  }
};

const getDocumentTypeIcon = (type: string) => {
  switch (type.toUpperCase()) {
    case 'PDF': return <DescriptionIcon />;
    case 'DOC':
    case 'DOCX': return <DescriptionIcon />;
    case 'XLS':
    case 'XLSX': return <DescriptionIcon />;
    case 'PPT':
    case 'PPTX': return <DescriptionIcon />;
    case 'JPG':
    case 'PNG': return <DescriptionIcon />;
    default: return <DescriptionIcon />;
  }
};

const getWorkflowStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'aktiv': return 'warning';
    case 'abgeschlossen': return 'success';
    case 'abgebrochen': return 'error';
    default: return 'default';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('de-DE');
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const DocumentManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'document' | 'workflow' | 'category' | 'tag' | 'bereinigung' | 'frist' | 'sicherheit'>('document');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (type: 'document' | 'workflow' | 'category' | 'tag' | 'bereinigung' | 'frist' | 'sicherheit') => {
    setDialogType(type);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <div className="p-6">
      <Typography variant="h4" className="mb-6 font-semibold text-gray-800">
        Dokumentenverwaltung
      </Typography>

      {/* KPI Dashboard */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} sm={6} md={3}>
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4" className="font-bold">
                    {mockDocumentStats.gesamtDokumente}
                  </Typography>
                  <Typography variant="body2" className="opacity-90">
                    Gesamt Dokumente
                  </Typography>
                </div>
                <DescriptionIcon className="text-4xl opacity-80" />
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4" className="font-bold">
                    {mockDocumentStats.freigegebeneDokumente}
                  </Typography>
                  <Typography variant="body2" className="opacity-90">
                    Freigegeben
                  </Typography>
                </div>
                <CheckCircleIcon className="text-4xl opacity-80" />
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4" className="font-bold">
                    {mockDocumentStats.archivierteDokumente}
                  </Typography>
                  <Typography variant="body2" className="opacity-90">
                    Archiviert
                  </Typography>
                </div>
                <ArchiveIcon className="text-4xl opacity-80" />
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4" className="font-bold">
                    {Math.round(mockDocumentStats.gesamtDateigroesseMB)} MB
                  </Typography>
                  <Typography variant="body2" className="opacity-90">
                    Speicherplatz
                  </Typography>
                </div>
                <StorageIcon className="text-4xl opacity-80" />
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Speicherplatz-Warnung */}
      {mockSpeicherplatzStats.einsparungspotentialMB > 200 && (
        <Alert severity="warning" className="mb-4">
          <Typography variant="body2">
            <strong>Speicherplatz-Optimierung möglich:</strong> {Math.round(mockSpeicherplatzStats.einsparungspotentialMB)} MB können durch Bereinigung abgelaufener Dokumente freigegeben werden.
          </Typography>
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="Dokumenten Tabs">
          <Tab label="Dokumente" icon={<DescriptionIcon />} iconPosition="start" />
          <Tab label="Workflows" icon={<WorkflowIcon />} iconPosition="start" />
          <Tab label="Kategorien" icon={<CategoryIcon />} iconPosition="start" />
          <Tab label="Tags" icon={<TagIcon />} iconPosition="start" />
          <Tab label="Archiv" icon={<ArchiveIcon />} iconPosition="start" />
          <Tab label="Bereinigung" icon={<CleaningServicesIcon />} iconPosition="start" />
          <Tab label="Gesetzliche Fristen" icon={<GavelIcon />} iconPosition="start" />
          <Tab label="Sicherheit" icon={<SecurityIcon />} iconPosition="start" />
          <Tab label="Compliance" icon={<VerifiedIcon />} iconPosition="start" />
          <Tab label="Suche" icon={<SearchIcon />} iconPosition="start" />
          <Tab label="Performance" icon={<TimelineIcon />} iconPosition="start" />
          <Tab label="Statistiken" icon={<AssessmentIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Dokumente Tab */}
      <TabPanel value={tabValue} index={0}>
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6">Dokumente</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('document')}
          >
            Neues Dokument
          </Button>
        </div>
        <Typography variant="body2" className="text-gray-600">
          Dokumentenverwaltung wird hier implementiert...
        </Typography>
      </TabPanel>

      {/* Workflows Tab */}
      <TabPanel value={tabValue} index={1}>
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6">Workflows</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('workflow')}
          >
            Neuer Workflow
          </Button>
        </div>
        <Typography variant="body2" className="text-gray-600">
          Workflow-Verwaltung wird hier implementiert...
        </Typography>
      </TabPanel>

      {/* Kategorien Tab */}
      <TabPanel value={tabValue} index={2}>
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6">Kategorien</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('category')}
          >
            Neue Kategorie
          </Button>
        </div>
        <Typography variant="body2" className="text-gray-600">
          Kategorie-Verwaltung wird hier implementiert...
        </Typography>
      </TabPanel>

      {/* Tags Tab */}
      <TabPanel value={tabValue} index={3}>
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6">Tags</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('tag')}
          >
            Neuer Tag
          </Button>
        </div>
        <Typography variant="body2" className="text-gray-600">
          Tag-Verwaltung wird hier implementiert...
        </Typography>
      </TabPanel>

      {/* Archiv Tab */}
      <TabPanel value={tabValue} index={4}>
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6">Archiv</Typography>
          <Button
            variant="outlined"
            startIcon={<SearchIcon />}
          >
            Archiv durchsuchen
          </Button>
        </div>
        <Typography variant="body2" className="text-gray-600">
          Archiv-Verwaltung wird hier implementiert...
        </Typography>
      </TabPanel>

      {/* Bereinigung Tab */}
      <TabPanel value={tabValue} index={5}>
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6">Dokumenten-Bereinigung</Typography>
          <div className="flex space-x-2">
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('bereinigung')}
            >
              Bereinigungsauftrag
            </Button>
            <Button
              variant="contained"
              startIcon={<AutoDeleteIcon />}
              color="warning"
            >
              Automatische Bereinigung
            </Button>
          </div>
        </div>

        {/* Speicherplatz-Übersicht */}
        <Grid container spacing={3} className="mb-6">
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" className="mb-4">Speicherplatz-Übersicht</Typography>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Aktive Dokumente:</span>
                    <span className="font-semibold">{Math.round(mockSpeicherplatzStats.aktiveDokumenteMB)} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Archivierte Dokumente:</span>
                    <span className="font-semibold">{Math.round(mockSpeicherplatzStats.archivierteDokumenteMB)} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Einsparungspotential:</span>
                    <span className="font-semibold text-orange-600">{Math.round(mockSpeicherplatzStats.einsparungspotentialMB)} MB</span>
                  </div>
                  <LinearProgress 
                    variant="determinate" 
                    value={(mockSpeicherplatzStats.aktiveDokumenteMB / mockSpeicherplatzStats.gesamtSpeicherMB) * 100}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" className="mb-4">Fristen-Übersicht</Typography>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Ablaufende Fristen:</span>
                    <Chip label={mockSpeicherplatzStats.ablaufendeFristen} color="warning" size="small" />
                  </div>
                  <div className="flex justify-between">
                    <span>Kritische Fristen:</span>
                    <Chip label={mockSpeicherplatzStats.kritischeFristen} color="error" size="small" />
                  </div>
                  <div className="flex justify-between">
                    <span>Nächste Bereinigung:</span>
                    <span className="font-semibold">15.06.2024</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Bereinigungsaufträge */}
        <Typography variant="h6" className="mb-4">Bereinigungsaufträge</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Auftrag-Nr</TableCell>
                <TableCell>Typ</TableCell>
                <TableCell>Regel</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Geplant</TableCell>
                <TableCell>Ausgeführt</TableCell>
                <TableCell>Dokumente</TableCell>
                <TableCell>Erfolgreich</TableCell>
                <TableCell>Fehler</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockBereinigungsauftraege.map((auftrag) => (
                <TableRow key={auftrag.id}>
                  <TableCell>
                    <Typography variant="subtitle2" className="font-semibold">
                      {auftrag.auftragNr}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={auftrag.auftragTyp}
                      color={auftrag.auftragTyp === 'ARCHIVIERUNG' ? 'primary' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{auftrag.regelName}</TableCell>
                  <TableCell>
                    <Chip
                      label={auftrag.status}
                      color={auftrag.status === 'ABGESCHLOSSEN' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(auftrag.geplantesDatum)}</TableCell>
                  <TableCell>
                    {auftrag.ausgefuehrtAm ? formatDate(auftrag.ausgefuehrtAm.split(' ')[0]) : '-'}
                  </TableCell>
                  <TableCell>{auftrag.anzahlDokumente}</TableCell>
                  <TableCell>
                    <Chip label={auftrag.erfolgreichVerarbeitet} color="success" size="small" />
                  </TableCell>
                  <TableCell>
                    {auftrag.fehlgeschlageneVerarbeitung > 0 && (
                      <Chip label={auftrag.fehlgeschlageneVerarbeitung} color="error" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <IconButton size="small" color="primary">
                        <ViewIcon />
                      </IconButton>
                      <IconButton size="small" color="primary">
                        <HistoryIcon />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Bereinigungsprotokoll */}
        <div className="mt-6">
          <Typography variant="h6" className="mb-4">Bereinigungsprotokoll</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Auftrag</TableCell>
                  <TableCell>Dokument</TableCell>
                  <TableCell>Aktion</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Fehlermeldung</TableCell>
                  <TableCell>Export-Pfad</TableCell>
                  <TableCell>Dateigröße</TableCell>
                  <TableCell>Ausgeführt</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockBereinigungsprotokoll.map((eintrag) => (
                  <TableRow key={eintrag.id}>
                    <TableCell>{eintrag.auftragNr}</TableCell>
                    <TableCell>
                      <div>
                        <Typography variant="body2" className="font-semibold">
                          {eintrag.dokumentNr}
                        </Typography>
                        <Typography variant="caption" className="text-gray-600">
                          {eintrag.dokumentTitel}
                        </Typography>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={eintrag.aktion}
                        color={eintrag.aktion === 'ARCHIVIERT' ? 'primary' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={eintrag.status}
                        color={eintrag.status === 'ERFOLGREICH' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {eintrag.fehlermeldung && (
                        <Typography variant="caption" className="text-red-600">
                          {eintrag.fehlermeldung}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {eintrag.exportPfad && (
                        <Typography variant="caption" className="text-blue-600">
                          {eintrag.exportPfad}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{formatFileSize(eintrag.dateigroesseVorher)}</TableCell>
                    <TableCell>{formatDate(eintrag.ausgefuehrtAm.split(' ')[0])}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </TabPanel>

      {/* Gesetzliche Fristen Tab */}
      <TabPanel value={tabValue} index={6}>
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6">Gesetzliche Aufbewahrungsfristen</Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('frist')}
          >
            Neue Frist
          </Button>
        </div>

        <Grid container spacing={3} className="mb-6">
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" className="mb-4">Gesetzliche Fristen</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Dokument-Typ</TableCell>
                        <TableCell>Kategorie</TableCell>
                        <TableCell>Frist (Jahre)</TableCell>
                        <TableCell>Gesetzliche Grundlage</TableCell>
                        <TableCell>Beschreibung</TableCell>
                        <TableCell>Aktionen</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mockGesetzlicheFristen.map((frist) => (
                        <TableRow key={frist.id}>
                          <TableCell>
                            <Typography variant="subtitle2" className="font-semibold">
                              {frist.dokumentTyp}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={frist.kategorie} color="primary" size="small" />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={`${frist.gesetzlicheFristJahre} Jahre`} 
                              color={frist.gesetzlicheFristJahre >= 10 ? 'error' : 'warning'}
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" className="text-gray-600">
                              {frist.gesetzlicheGrundlage}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {frist.beschreibung}
                            </Typography>
                            {frist.bemerkungen && (
                              <Typography variant="caption" className="text-gray-600 block">
                                {frist.bemerkungen}
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
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" className="mb-4">Fristen-Übersicht</Typography>
                <div className="space-y-4">
                  <div className="text-center">
                    <Typography variant="h4" className="text-red-600 font-bold">
                      {mockGesetzlicheFristen.filter(f => f.gesetzlicheFristJahre >= 10).length}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      Langfristige Aufbewahrung (≥10 Jahre)
                    </Typography>
                  </div>
                  <div className="text-center">
                    <Typography variant="h4" className="text-orange-600 font-bold">
                      {mockGesetzlicheFristen.filter(f => f.gesetzlicheFristJahre >= 6 && f.gesetzlicheFristJahre < 10).length}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      Mittelfristige Aufbewahrung (6-9 Jahre)
                    </Typography>
                  </div>
                  <div className="text-center">
                    <Typography variant="h4" className="text-blue-600 font-bold">
                      {mockGesetzlicheFristen.filter(f => f.gesetzlicheFristJahre < 6).length}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      Kurzfristige Aufbewahrung (&lt;6 Jahre)
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardContent>
                <Typography variant="h6" className="mb-4">Automatische Bereinigung</Typography>
                <div className="space-y-3">
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Automatische Archivierung aktiv"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Automatische Löschung aktiv"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="Export vor Löschung"
                  />
                  <div className="pt-2">
                    <Button
                      variant="contained"
                      startIcon={<AutoDeleteIcon />}
                      fullWidth
                      color="warning"
                    >
                      Manuelle Bereinigung starten
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Sicherheit Tab */}
      <TabPanel value={tabValue} index={7}>
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6">Sicherheit & Zugriffskontrolle</Typography>
          <div className="flex space-x-2">
            <Button
              variant="outlined"
              startIcon={<SecurityIcon />}
            >
              Sicherheitsprüfung
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('sicherheit')}
            >
              Berechtigung erteilen
            </Button>
          </div>
        </div>

        <Grid container spacing={3} className="mb-6">
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" className="mb-4">Sicherheits-Übersicht</Typography>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Verschlüsselte Dokumente:</span>
                    <Chip label={mockSicherheitsDaten.verschluesselteDokumente} color="primary" size="small" />
                  </div>
                  <div className="flex justify-between">
                    <span>Digitale Signaturen:</span>
                    <Chip label={mockSicherheitsDaten.digitaleSignaturen} color="success" size="small" />
                  </div>
                  <div className="flex justify-between">
                    <span>Aktive Berechtigungen:</span>
                    <Chip label={mockSicherheitsDaten.aktiveBerechtigungen} color="info" size="small" />
                  </div>
                  <div className="flex justify-between">
                    <span>Sicherheitswarnungen:</span>
                    <Chip label={mockSicherheitsDaten.sicherheitswarnungen} color="warning" size="small" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" className="mb-4">Zugriffskontrolle</Typography>
                <div className="space-y-3">
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="IP-Beschränkungen aktiv"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Zeitliche Beschränkungen"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="Zwei-Faktor-Authentifizierung"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Session-Timeout"
                  />
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h6" className="mb-4">Aktive Berechtigungen</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Dokument</TableCell>
                <TableCell>Benutzer</TableCell>
                <TableCell>Rolle</TableCell>
                <TableCell>Berechtigung</TableCell>
                <TableCell>Gültig bis</TableCell>
                <TableCell>IP-Beschränkung</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>DOC-2024-001</TableCell>
                <TableCell>Max Mustermann</TableCell>
                <TableCell>Freigeber</TableCell>
                <TableCell>
                  <Chip label="Lesen, Bearbeiten, Freigeben" color="primary" size="small" />
                </TableCell>
                <TableCell>2024-12-31</TableCell>
                <TableCell>
                  <Chip label="Aktiv" color="success" size="small" />
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <IconButton size="small" color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Compliance Tab */}
      <TabPanel value={tabValue} index={8}>
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6">DSGVO-Compliance & Audit</Typography>
          <div className="flex space-x-2">
            <Button
              variant="outlined"
              startIcon={<VerifiedIcon />}
            >
              Compliance-Report
            </Button>
            <Button
              variant="contained"
              startIcon={<AutoDeleteIcon />}
              color="warning"
            >
              DSGVO-Löschung
            </Button>
          </div>
        </div>

        <Grid container spacing={3} className="mb-6">
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" className="mb-4">Compliance-Status</Typography>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>DSGVO-konforme Dokumente:</span>
                    <Chip label={mockComplianceDaten.dsgvoKonformeDokumente} color="success" size="small" />
                  </div>
                  <div className="flex justify-between">
                    <span>Personenbezogene Daten:</span>
                    <Chip label={mockComplianceDaten.personenbezogeneDaten} color="warning" size="small" />
                  </div>
                  <div className="flex justify-between">
                    <span>Ablaufende Fristen:</span>
                    <Chip label={mockComplianceDaten.ablaufendeFristen} color="error" size="small" />
                  </div>
                  <div className="flex justify-between">
                    <span>Audit-Einträge:</span>
                    <Chip label={mockComplianceDaten.auditEintraege} color="info" size="small" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" className="mb-4">Datenschutz-Einstellungen</Typography>
                <div className="space-y-3">
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Automatische DSGVO-Löschung"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Audit-Trail aktiv"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Verschlüsselung sensibler Daten"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="Anonymisierung aktiv"
                  />
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h6" className="mb-4">Audit-Trail</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Dokument</TableCell>
                <TableCell>Benutzer</TableCell>
                <TableCell>Aktion</TableCell>
                <TableCell>IP-Adresse</TableCell>
                <TableCell>Zeitstempel</TableCell>
                <TableCell>Hash</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>DOC-2024-001</TableCell>
                <TableCell>Max Mustermann</TableCell>
                <TableCell>
                  <Chip label="GELESEN" color="info" size="small" />
                </TableCell>
                <TableCell>192.168.1.100</TableCell>
                <TableCell>2024-05-28 15:30:00</TableCell>
                <TableCell>
                  <Typography variant="caption" className="font-mono">
                    a1b2c3d4...
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Suche Tab */}
      <TabPanel value={tabValue} index={9}>
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6">Erweiterte Suche</Typography>
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
          >
            Suchhistorie
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent>
            <Typography variant="h6" className="mb-4">Volltext-Suche</Typography>
            <div className="flex space-x-2 mb-4">
              <TextField
                fullWidth
                placeholder="Suchbegriff eingeben..."
                variant="outlined"
                size="small"
              />
              <Button variant="contained" startIcon={<SearchIcon />}>
                Suchen
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormControl fullWidth size="small">
                <InputLabel>Kategorie</InputLabel>
                <Select label="Kategorie">
                  <MenuItem value="">Alle Kategorien</MenuItem>
                  <MenuItem value="vertraege">Verträge</MenuItem>
                  <MenuItem value="rechnungen">Rechnungen</MenuItem>
                  <MenuItem value="angebote">Angebote</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth size="small">
                <InputLabel>Dokumenttyp</InputLabel>
                <Select label="Dokumenttyp">
                  <MenuItem value="">Alle Typen</MenuItem>
                  <MenuItem value="pdf">PDF</MenuItem>
                  <MenuItem value="docx">DOCX</MenuItem>
                  <MenuItem value="xlsx">XLSX</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth size="small">
                <InputLabel>Zeitraum</InputLabel>
                <Select label="Zeitraum">
                  <MenuItem value="7">Letzte 7 Tage</MenuItem>
                  <MenuItem value="30">Letzte 30 Tage</MenuItem>
                  <MenuItem value="90">Letzte 90 Tage</MenuItem>
                  <MenuItem value="365">Letztes Jahr</MenuItem>
                </Select>
              </FormControl>
            </div>
          </CardContent>
        </Card>

        <Typography variant="h6" className="mb-4">Suchergebnisse</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Dokument</TableCell>
                <TableCell>Kategorie</TableCell>
                <TableCell>Relevanz</TableCell>
                <TableCell>Treffer</TableCell>
                <TableCell>Erstellt</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockVolltextSuchergebnisse.map((ergebnis) => (
                <TableRow key={ergebnis.id}>
                  <TableCell>
                    <div>
                      <Typography variant="subtitle2" className="font-semibold">
                        {ergebnis.dokumentNr}
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                        {ergebnis.titel}
                      </Typography>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip label={ergebnis.kategorieName} color="primary" size="small" />
                  </TableCell>
                  <TableCell>
                    <LinearProgress 
                      variant="determinate" 
                      value={ergebnis.relevanzScore * 100}
                      className="w-20"
                    />
                    <Typography variant="caption">
                      {Math.round(ergebnis.relevanzScore * 100)}%
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={ergebnis.trefferAnzahl} color="success" size="small" />
                  </TableCell>
                  <TableCell>{formatDate(ergebnis.erstelltAm)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <IconButton size="small" color="primary">
                        <ViewIcon />
                      </IconButton>
                      <IconButton size="small" color="primary">
                        <DownloadIcon />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Performance Tab */}
      <TabPanel value={tabValue} index={10}>
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6">Performance-Monitoring</Typography>
          <Button
            variant="outlined"
            startIcon={<TimelineIcon />}
          >
            Performance-Report
          </Button>
        </div>

        <Grid container spacing={3} className="mb-6">
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" className="text-blue-600 font-bold">
                  {mockPerformanceDaten.durchschnittlicheSuchzeit}s
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Durchschnittliche Suchzeit
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" className="text-green-600 font-bold">
                  {mockPerformanceDaten.durchschnittlicheUploadZeit}s
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Durchschnittliche Upload-Zeit
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" className="text-orange-600 font-bold">
                  {mockPerformanceDaten.durchschnittlicheDownloadZeit}s
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Durchschnittliche Download-Zeit
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" className="text-purple-600 font-bold">
                  {mockPerformanceDaten.systemAuslastung}%
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  System-Auslastung
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card>
          <CardContent>
            <Typography variant="h6" className="mb-4">Performance-Trends</Typography>
            <div className="space-y-4">
              <div>
                <Typography variant="body2" className="mb-2">Suchzeit (letzte 7 Tage)</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={80}
                  className="h-2"
                />
              </div>
              <div>
                <Typography variant="body2" className="mb-2">Upload-Zeit (letzte 7 Tage)</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={65}
                  className="h-2"
                />
              </div>
              <div>
                <Typography variant="body2" className="mb-2">Download-Zeit (letzte 7 Tage)</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={90}
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Statistiken Tab */}
      <TabPanel value={tabValue} index={7}>
        <Typography variant="h6" className="mb-4">Dokumentenstatistiken</Typography>
        <Typography variant="body2" className="text-gray-600">
          Statistik-Dashboard wird hier implementiert...
        </Typography>
      </TabPanel>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'document' && 'Neues Dokument'}
          {dialogType === 'workflow' && 'Neuer Workflow'}
          {dialogType === 'category' && 'Neue Kategorie'}
          {dialogType === 'tag' && 'Neuer Tag'}
          {dialogType === 'bereinigung' && 'Bereinigungsauftrag'}
          {dialogType === 'frist' && 'Neue gesetzliche Frist'}
          {dialogType === 'sicherheit' && 'Berechtigung erteilen'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" className="text-gray-600 mt-2">
            Dialog-Inhalt wird hier implementiert...
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DocumentManagement; 