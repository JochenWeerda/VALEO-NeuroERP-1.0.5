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
  Badge,
  LinearProgress,
  CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Assignment as ProjectIcon,
  Task as TaskIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  ExpandMore as ExpandMoreIcon,
  TrendingUp as TrendingIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  BarChart as ChartIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Flag as FlagIcon
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

interface Projekt {
  id: string;
  name: string;
  beschreibung: string;
  kunde: string;
  projektleiter: string;
  startDatum: string;
  endDatum: string;
  status: 'planung' | 'aktiv' | 'abgeschlossen' | 'pausiert' | 'storniert';
  prioritaet: 'niedrig' | 'mittel' | 'hoch' | 'kritisch';
  budget: number;
  verbraucht: number;
  fortschritt: number;
  erstelltAm: string;
}

interface Aufgabe {
  id: string;
  projektId: string;
  projektName: string;
  name: string;
  beschreibung: string;
  zugewiesenAn: string;
  startDatum: string;
  endDatum: string;
  status: 'offen' | 'in_bearbeitung' | 'review' | 'abgeschlossen';
  prioritaet: 'niedrig' | 'mittel' | 'hoch' | 'kritisch';
  geschaetzteStunden: number;
  verbrauchteStunden: number;
  erstelltAm: string;
}

interface Ressource {
  id: string;
  name: string;
  typ: 'mitarbeiter' | 'ausstattung' | 'material' | 'extern';
  verfuegbarkeit: number;
  kostenProStunde: number;
  abteilung: string;
  skills: string[];
  status: 'verfuegbar' | 'ausgelastet' | 'nicht_verfuegbar';
  email: string;
  telefon: string;
}

interface Zeiterfassung {
  id: string;
  mitarbeiterId: string;
  mitarbeiterName: string;
  projektId: string;
  projektName: string;
  aufgabeId?: string;
  aufgabeName?: string;
  datum: string;
  startZeit: string;
  endZeit: string;
  stunden: number;
  beschreibung: string;
  status: 'offen' | 'genehmigt' | 'abgelehnt';
  erstelltAm: string;
}

const ProjektFormular: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProjekt, setSelectedProjekt] = useState<Projekt | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });

  // Mock-Daten
  const [projekte, setProjekte] = useState<Projekt[]>([
    {
      id: '1',
      name: 'Website-Relaunch',
      beschreibung: 'Kompletter Relaunch der Unternehmenswebsite',
      kunde: 'TechCorp GmbH',
      projektleiter: 'Max Mustermann',
      startDatum: '2024-01-15',
      endDatum: '2024-03-15',
      status: 'aktiv',
      prioritaet: 'hoch',
      budget: 25000,
      verbraucht: 18500,
      fortschritt: 65,
      erstelltAm: '2024-01-10'
    },
    {
      id: '2',
      name: 'ERP-Integration',
      beschreibung: 'Integration neuer ERP-Module',
      kunde: 'Industrie AG',
      projektleiter: 'Anna Schmidt',
      startDatum: '2024-02-01',
      endDatum: '2024-06-30',
      status: 'planung',
      prioritaet: 'mittel',
      budget: 50000,
      verbraucht: 0,
      fortschritt: 15,
      erstelltAm: '2024-01-20'
    },
    {
      id: '3',
      name: 'Mobile App Entwicklung',
      beschreibung: 'Entwicklung einer mobilen App für Kunden',
      kunde: 'Startup GmbH',
      projektleiter: 'Tom Weber',
      startDatum: '2024-01-01',
      endDatum: '2024-04-30',
      status: 'aktiv',
      prioritaet: 'kritisch',
      budget: 35000,
      verbraucht: 28000,
      fortschritt: 80,
      erstelltAm: '2023-12-15'
    }
  ]);

  const [aufgaben, setAufgaben] = useState<Aufgabe[]>([
    {
      id: '1',
      projektId: '1',
      projektName: 'Website-Relaunch',
      name: 'Design-Entwürfe erstellen',
      beschreibung: 'Erstellung von Design-Mockups für die neue Website',
      zugewiesenAn: 'Lisa Müller',
      startDatum: '2024-01-15',
      endDatum: '2024-01-25',
      status: 'abgeschlossen',
      prioritaet: 'hoch',
      geschaetzteStunden: 40,
      verbrauchteStunden: 38,
      erstelltAm: '2024-01-15'
    },
    {
      id: '2',
      projektId: '1',
      projektName: 'Website-Relaunch',
      name: 'Frontend-Entwicklung',
      beschreibung: 'Implementierung der Frontend-Komponenten',
      zugewiesenAn: 'Hans Klein',
      startDatum: '2024-01-26',
      endDatum: '2024-02-15',
      status: 'in_bearbeitung',
      prioritaet: 'hoch',
      geschaetzteStunden: 80,
      verbrauchteStunden: 45,
      erstelltAm: '2024-01-20'
    },
    {
      id: '3',
      projektId: '3',
      projektName: 'Mobile App Entwicklung',
      name: 'API-Entwicklung',
      beschreibung: 'Entwicklung der Backend-APIs für die App',
      zugewiesenAn: 'Peter Schulz',
      startDatum: '2024-01-01',
      endDatum: '2024-02-15',
      status: 'abgeschlossen',
      prioritaet: 'kritisch',
      geschaetzteStunden: 120,
      verbrauchteStunden: 115,
      erstelltAm: '2024-01-01'
    }
  ]);

  const [ressourcen, setRessourcen] = useState<Ressource[]>([
    {
      id: '1',
      name: 'Max Mustermann',
      typ: 'mitarbeiter',
      verfuegbarkeit: 40,
      kostenProStunde: 85,
      abteilung: 'Entwicklung',
      skills: ['React', 'TypeScript', 'Node.js', 'Projektmanagement'],
      status: 'ausgelastet',
      email: 'max.mustermann@firma.de',
      telefon: '+49 123 456789'
    },
    {
      id: '2',
      name: 'Anna Schmidt',
      typ: 'mitarbeiter',
      verfuegbarkeit: 35,
      kostenProStunde: 75,
      abteilung: 'Design',
      skills: ['UI/UX Design', 'Figma', 'Adobe Creative Suite'],
      status: 'verfuegbar',
      email: 'anna.schmidt@firma.de',
      telefon: '+49 123 456790'
    },
    {
      id: '3',
      name: 'Entwicklungsserver',
      typ: 'ausstattung',
      verfuegbarkeit: 168,
      kostenProStunde: 2.5,
      abteilung: 'IT',
      skills: ['Linux', 'Docker', 'AWS'],
      status: 'verfuegbar',
      email: '',
      telefon: ''
    }
  ]);

  const [zeiterfassung, setZeiterfassung] = useState<Zeiterfassung[]>([
    {
      id: '1',
      mitarbeiterId: '1',
      mitarbeiterName: 'Max Mustermann',
      projektId: '1',
      projektName: 'Website-Relaunch',
      aufgabeId: '2',
      aufgabeName: 'Frontend-Entwicklung',
      datum: '2024-01-20',
      startZeit: '09:00',
      endZeit: '17:00',
      stunden: 8,
      beschreibung: 'Entwicklung der React-Komponenten',
      status: 'genehmigt',
      erstelltAm: '2024-01-20'
    },
    {
      id: '2',
      mitarbeiterId: '2',
      mitarbeiterName: 'Anna Schmidt',
      projektId: '1',
      projektName: 'Website-Relaunch',
      aufgabeId: '1',
      aufgabeName: 'Design-Entwürfe erstellen',
      datum: '2024-01-19',
      startZeit: '08:30',
      endZeit: '16:30',
      stunden: 8,
      beschreibung: 'Finalisierung der Design-Mockups',
      status: 'genehmigt',
      erstelltAm: '2024-01-19'
    },
    {
      id: '3',
      mitarbeiterId: '1',
      mitarbeiterName: 'Max Mustermann',
      projektId: '3',
      projektName: 'Mobile App Entwicklung',
      datum: '2024-01-18',
      startZeit: '10:00',
      endZeit: '18:00',
      stunden: 8,
      beschreibung: 'Code-Review und Bugfixes',
      status: 'offen',
      erstelltAm: '2024-01-18'
    }
  ]);

  const [projektForm, setProjektForm] = useState<Partial<Projekt>>({
    name: '',
    beschreibung: '',
    kunde: '',
    projektleiter: '',
    startDatum: new Date().toISOString().split('T')[0],
    endDatum: '',
    status: 'planung',
    prioritaet: 'mittel',
    budget: 0,
    verbraucht: 0,
    fortschritt: 0
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (projekt?: Projekt) => {
    if (projekt) {
      setSelectedProjekt(projekt);
      setProjektForm(projekt);
    } else {
      setSelectedProjekt(null);
      setProjektForm({
        name: '',
        beschreibung: '',
        kunde: '',
        projektleiter: '',
        startDatum: new Date().toISOString().split('T')[0],
        endDatum: '',
        status: 'planung',
        prioritaet: 'mittel',
        budget: 0,
        verbraucht: 0,
        fortschritt: 0
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProjekt(null);
    setProjektForm({});
  };

  const handleSaveProjekt = () => {
    if (selectedProjekt) {
      // Update existing project
      setProjekte(projekte.map(p => 
        p.id === selectedProjekt.id 
          ? { ...projektForm, id: p.id, erstelltAm: p.erstelltAm } as Projekt
          : p
      ));
      setSnackbar({
        open: true,
        message: 'Projekt erfolgreich aktualisiert',
        severity: 'success'
      });
    } else {
      // Create new project
      const newProjekt: Projekt = {
        ...projektForm,
        id: Date.now().toString(),
        erstelltAm: new Date().toISOString().split('T')[0]
      } as Projekt;
      setProjekte([...projekte, newProjekt]);
      setSnackbar({
        open: true,
        message: 'Projekt erfolgreich erstellt',
        severity: 'success'
      });
    }
    handleCloseDialog();
  };

  const handleDeleteProjekt = (id: string) => {
    setProjekte(projekte.filter(p => p.id !== id));
    setSnackbar({
      open: true,
      message: 'Projekt erfolgreich gelöscht',
      severity: 'success'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aktiv': return 'success';
      case 'planung': return 'info';
      case 'abgeschlossen': return 'default';
      case 'pausiert': return 'warning';
      case 'storniert': return 'error';
      default: return 'default';
    }
  };

  const getPrioritaetColor = (prioritaet: string) => {
    switch (prioritaet) {
      case 'niedrig': return 'default';
      case 'mittel': return 'info';
      case 'hoch': return 'warning';
      case 'kritisch': return 'error';
      default: return 'default';
    }
  };

  const getAufgabenStatusColor = (status: string) => {
    switch (status) {
      case 'offen': return 'default';
      case 'in_bearbeitung': return 'warning';
      case 'review': return 'info';
      case 'abgeschlossen': return 'success';
      default: return 'default';
    }
  };

  const getRessourcenStatusColor = (status: string) => {
    switch (status) {
      case 'verfuegbar': return 'success';
      case 'ausgelastet': return 'warning';
      case 'nicht_verfuegbar': return 'error';
      default: return 'default';
    }
  };

  const getZeiterfassungStatusColor = (status: string) => {
    switch (status) {
      case 'offen': return 'warning';
      case 'genehmigt': return 'success';
      case 'abgelehnt': return 'error';
      default: return 'default';
    }
  };

  const calculateGesamtBudget = () => {
    return projekte.reduce((sum, p) => sum + p.budget, 0);
  };

  const calculateGesamtVerbraucht = () => {
    return projekte.reduce((sum, p) => sum + p.verbraucht, 0);
  };

  const calculateDurchschnittlicherFortschritt = () => {
    return projekte.length > 0 
      ? projekte.reduce((sum, p) => sum + p.fortschritt, 0) / projekte.length 
      : 0;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ProjectIcon color="primary" />
          Projektverwaltung
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          Neues Projekt
        </Button>
      </Box>

      {/* Projektübersicht */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <ProjectIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="primary.main">
                    {projekte.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Aktive Projekte
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
                    {calculateGesamtBudget().toLocaleString()} €
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Gesamtbudget
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
                  <TrendingIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="warning.main">
                    {calculateGesamtVerbraucht().toLocaleString()} €
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Verbraucht
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
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <ChartIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="info.main">
                    {calculateDurchschnittlicherFortschritt().toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ø Fortschritt
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Projekte" icon={<ProjectIcon />} iconPosition="start" />
          <Tab label="Aufgaben" icon={<TaskIcon />} iconPosition="start" />
          <Tab label="Ressourcen" icon={<PeopleIcon />} iconPosition="start" />
          <Tab label="Zeiterfassung" icon={<ScheduleIcon />} iconPosition="start" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {projekte.map((projekt) => (
              <Grid item xs={12} md={6} lg={4} key={projekt.id}>
                <Card sx={{ p: 2, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <ProjectIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{projekt.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {projekt.kunde}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {projekt.beschreibung}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Fortschritt</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {projekt.fortschritt}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={projekt.fortschritt}
                      color={projekt.fortschritt >= 100 ? 'success' : 'primary'}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip 
                      label={projekt.status} 
                      color={getStatusColor(projekt.status) as any}
                      size="small" 
                    />
                    <Chip 
                      label={projekt.prioritaet} 
                      color={getPrioritaetColor(projekt.prioritaet) as any}
                      size="small" 
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Budget: {projekt.budget.toLocaleString()} €
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Verbraucht: {projekt.verbraucht.toLocaleString()} €
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Projektleiter: {projekt.projektleiter}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      size="small" 
                      variant="outlined"
                      onClick={() => handleOpenDialog(projekt)}
                    >
                      Bearbeiten
                    </Button>
                    <Button size="small" variant="outlined">
                      Details
                    </Button>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      color="error"
                      onClick={() => handleDeleteProjekt(projekt.id)}
                    >
                      Löschen
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Aufgabe</TableCell>
                  <TableCell>Projekt</TableCell>
                  <TableCell>Zugewiesen an</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priorität</TableCell>
                  <TableCell>Stunden</TableCell>
                  <TableCell>Deadline</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {aufgaben.map((aufgabe) => (
                  <TableRow key={aufgabe.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {aufgabe.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {aufgabe.beschreibung}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{aufgabe.projektName}</TableCell>
                    <TableCell>{aufgabe.zugewiesenAn}</TableCell>
                    <TableCell>
                      <Chip
                        label={aufgabe.status.replace('_', ' ')}
                        color={getAufgabenStatusColor(aufgabe.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={aufgabe.prioritaet}
                        color={getPrioritaetColor(aufgabe.prioritaet) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {aufgabe.verbrauchteStunden}/{aufgabe.geschaetzteStunden}h
                      </Typography>
                    </TableCell>
                    <TableCell>{aufgabe.endDatum}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Bearbeiten">
                          <IconButton size="small" color="primary">
                            <EditIcon />
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

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {ressourcen.map((ressource) => (
              <Grid item xs={12} md={6} lg={4} key={ressource.id}>
                <Card sx={{ p: 2, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <PeopleIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{ressource.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {ressource.abteilung}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Chip 
                    label={ressource.typ} 
                    color="primary" 
                    size="small" 
                    sx={{ mb: 2 }}
                  />
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Verfügbarkeit: {ressource.verfuegbarkeit}h/Woche
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Kosten: {ressource.kostenProStunde}€/h
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                      Skills:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {ressource.skills.map((skill, index) => (
                        <Chip key={index} label={skill} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                  
                  <Chip 
                    label={ressource.status.replace('_', ' ')} 
                    color={getRessourcenStatusColor(ressource.status) as any}
                    size="small" 
                    sx={{ mb: 2 }}
                  />
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" variant="outlined">
                      Bearbeiten
                    </Button>
                    <Button size="small" variant="outlined">
                      Verfügbarkeit
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mitarbeiter</TableCell>
                  <TableCell>Projekt</TableCell>
                  <TableCell>Aufgabe</TableCell>
                  <TableCell>Datum</TableCell>
                  <TableCell>Stunden</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Beschreibung</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {zeiterfassung.map((zeit) => (
                  <TableRow key={zeit.id}>
                    <TableCell>{zeit.mitarbeiterName}</TableCell>
                    <TableCell>{zeit.projektName}</TableCell>
                    <TableCell>{zeit.aufgabeName || '-'}</TableCell>
                    <TableCell>{zeit.datum}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {zeit.stunden}h
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {zeit.startZeit} - {zeit.endZeit}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={zeit.status}
                        color={getZeiterfassungStatusColor(zeit.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {zeit.beschreibung}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Bearbeiten">
                          <IconButton size="small" color="primary">
                            <EditIcon />
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
      </Card>

      {/* Dialog für Projekt bearbeiten/erstellen */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProjekt ? 'Projekt bearbeiten' : 'Neues Projekt erstellen'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Projektname"
                value={projektForm.name || ''}
                onChange={(e) => setProjektForm({...projektForm, name: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Kunde"
                value={projektForm.kunde || ''}
                onChange={(e) => setProjektForm({...projektForm, kunde: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Beschreibung"
                value={projektForm.beschreibung || ''}
                onChange={(e) => setProjektForm({...projektForm, beschreibung: e.target.value})}
                margin="normal"
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Projektleiter"
                value={projektForm.projektleiter || ''}
                onChange={(e) => setProjektForm({...projektForm, projektleiter: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Budget (€)"
                type="number"
                value={projektForm.budget || ''}
                onChange={(e) => setProjektForm({...projektForm, budget: parseFloat(e.target.value) || 0})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Startdatum"
                type="date"
                value={projektForm.startDatum || ''}
                onChange={(e) => setProjektForm({...projektForm, startDatum: e.target.value})}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Enddatum"
                type="date"
                value={projektForm.endDatum || ''}
                onChange={(e) => setProjektForm({...projektForm, endDatum: e.target.value})}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={projektForm.status || ''}
                  onChange={(e) => setProjektForm({...projektForm, status: e.target.value as any})}
                  label="Status"
                >
                  <MenuItem value="planung">Planung</MenuItem>
                  <MenuItem value="aktiv">Aktiv</MenuItem>
                  <MenuItem value="abgeschlossen">Abgeschlossen</MenuItem>
                  <MenuItem value="pausiert">Pausiert</MenuItem>
                  <MenuItem value="storniert">Storniert</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Priorität</InputLabel>
                <Select
                  value={projektForm.prioritaet || ''}
                  onChange={(e) => setProjektForm({...projektForm, prioritaet: e.target.value as any})}
                  label="Priorität"
                >
                  <MenuItem value="niedrig">Niedrig</MenuItem>
                  <MenuItem value="mittel">Mittel</MenuItem>
                  <MenuItem value="hoch">Hoch</MenuItem>
                  <MenuItem value="kritisch">Kritisch</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fortschritt (%)"
                type="number"
                value={projektForm.fortschritt || ''}
                onChange={(e) => setProjektForm({...projektForm, fortschritt: parseFloat(e.target.value) || 0})}
                margin="normal"
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Verbraucht (€)"
                type="number"
                value={projektForm.verbraucht || ''}
                onChange={(e) => setProjektForm({...projektForm, verbraucht: parseFloat(e.target.value) || 0})}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button onClick={handleSaveProjekt} variant="contained">
            {selectedProjekt ? 'Aktualisieren' : 'Erstellen'}
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

export default ProjektFormular; 