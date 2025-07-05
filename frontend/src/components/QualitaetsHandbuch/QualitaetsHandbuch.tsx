import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Divider,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Grid,
  IconButton,
  Tooltip,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Print as PrintIcon,
  InsertDriveFile as FileIcon,
  ExpandMore as ExpandMoreIcon,
  History as HistoryIcon,
  Assignment as AssignmentIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`qs-handbuch-tabpanel-${index}`}
      aria-labelledby={`qs-handbuch-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `qs-handbuch-tab-${index}`,
    'aria-controls': `qs-handbuch-tabpanel-${index}`,
  };
};

// Schnittstelle für QS-Maßnahmen
interface QSMassnahme {
  id: string;
  titel: string;
  beschreibung: string;
  prozessBereich: string;
  verantwortlich: string;
  erstelltAm: string;
  aktualisiertAm: string;
  status: 'aktiv' | 'inReview' | 'abgeschlossen' | 'geplant';
  dokumente?: string[];
  pruefintervall?: string;
}

// Schnittstelle für QS-Dokumente
interface QSDokument {
  id: string;
  titel: string;
  dateipfad: string;
  version: string;
  erstelltAm: string;
  aktualisiertAm: string;
  kategorie: string;
}

// Mock-Daten für QS-Maßnahmen
const initialMassnahmen: QSMassnahme[] = [
  {
    id: '1',
    titel: 'Regelmäßige Kontrolle der Lagerstätten',
    beschreibung: 'Monatliche Inspektion aller Lagerstätten auf Sauberkeit, baulichen Zustand und Schädlingsbefall.',
    prozessBereich: 'Lagerung',
    verantwortlich: 'Max Mustermann',
    erstelltAm: '2024-01-15',
    aktualisiertAm: '2024-04-10',
    status: 'aktiv',
    pruefintervall: 'monatlich'
  },
  {
    id: '2',
    titel: 'Reinigung der Transportfahrzeuge',
    beschreibung: 'Dokumentierte Reinigung aller Transportfahrzeuge vor Beladung mit Getreide oder Ölsaaten.',
    prozessBereich: 'Transport',
    verantwortlich: 'Anna Schmidt',
    erstelltAm: '2024-02-20',
    aktualisiertAm: '2024-04-15',
    status: 'aktiv',
    pruefintervall: 'vor jeder Beladung'
  },
  {
    id: '3',
    titel: 'Überprüfung der Trocknungsanlagen',
    beschreibung: 'Jährliche Wartung und Einstellung der Trocknungsanlagen durch Fachpersonal vor der Erntesaison.',
    prozessBereich: 'Trocknung',
    verantwortlich: 'Klaus Weber',
    erstelltAm: '2024-03-05',
    aktualisiertAm: '2024-03-05',
    status: 'geplant',
    pruefintervall: 'jährlich'
  }
];

// Mock-Daten für QS-Dokumente
const initialDokumente: QSDokument[] = [
  {
    id: '1',
    titel: 'Maßnahmen für den sicheren Umgang mit Getreide, Ölsaaten und Leguminosen',
    dateipfad: '/dokumente/merkblatt_umgang_getreide.pdf',
    version: '3.0',
    erstelltAm: '2023-05-01',
    aktualisiertAm: '2023-05-01',
    kategorie: 'Merkblatt'
  },
  {
    id: '2',
    titel: 'Checkliste Lagerkontrolle',
    dateipfad: '/dokumente/checkliste_lagerkontrolle.pdf',
    version: '2.1',
    erstelltAm: '2024-01-10',
    aktualisiertAm: '2024-03-15',
    kategorie: 'Checkliste'
  },
  {
    id: '3',
    titel: 'Protokoll Transportfahrzeug-Reinigung',
    dateipfad: '/dokumente/protokoll_fahrzeugreinigung.pdf',
    version: '1.5',
    erstelltAm: '2024-02-05',
    aktualisiertAm: '2024-02-05',
    kategorie: 'Protokoll'
  }
];

interface QualitaetsHandbuchProps {
  initialTab?: number;
}

const QualitaetsHandbuch: React.FC<QualitaetsHandbuchProps> = ({ initialTab = 0 }) => {
  const [tabValue, setTabValue] = useState<number>(initialTab);
  const [massnahmen, setMassnahmen] = useState<QSMassnahme[]>(initialMassnahmen);
  const [dokumente, setDokumente] = useState<QSDokument[]>(initialDokumente);
  const [selectedMassnahme, setSelectedMassnahme] = useState<QSMassnahme | null>(null);
  const [massnahmeDialog, setMassnahmeDialog] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const handbuchRef = useRef<HTMLDivElement>(null);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handler für das Drucken des Handbuchs
  const handlePrint = useReactToPrint({
    content: () => handbuchRef.current,
    documentTitle: 'QS_Handbuch',
    onAfterPrint: () => {
      setSuccess('QS-Handbuch wurde erfolgreich zum Drucken vorbereitet.');
    },
  });
  
  // Handler für das Öffnen des Maßnahmen-Dialogs
  const handleOpenMassnahmeDialog = (massnahme?: QSMassnahme) => {
    if (massnahme) {
      setSelectedMassnahme(massnahme);
    } else {
      setSelectedMassnahme(null);
    }
    setMassnahmeDialog(true);
  };
  
  // Handler für das Schließen des Maßnahmen-Dialogs
  const handleCloseMassnahmeDialog = () => {
    setMassnahmeDialog(false);
    setSelectedMassnahme(null);
  };
  
  // Handler für das Speichern einer Maßnahme
  const handleSaveMassnahme = () => {
    // Implementierung zum Speichern der Maßnahme
    setMassnahmeDialog(false);
    setSuccess('Maßnahme wurde erfolgreich gespeichert.');
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      
      <Paper sx={{ mb: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="scrollable" 
            scrollButtons="auto"
            aria-label="QS-Handbuch-Tabs"
          >
            <Tab icon={<DescriptionIcon />} label="Übersicht" {...a11yProps(0)} />
            <Tab icon={<CheckCircleIcon />} label="QS-Maßnahmen" {...a11yProps(1)} />
            <Tab icon={<FileIcon />} label="Dokumente" {...a11yProps(2)} />
            <Tab icon={<HistoryIcon />} label="Prüfhistorie" {...a11yProps(3)} />
            <Tab icon={<InfoIcon />} label="Grundlagen" {...a11yProps(4)} />
          </Tabs>
        </Box>
      </Paper>
      
      <Box ref={handbuchRef}>
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h5" component="h2" gutterBottom>
            QS-Handbuch Übersicht
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Das QS-Handbuch dokumentiert alle qualitätssichernden Maßnahmen und Prozesse. Es dient als lebendes Dokument zur kontinuierlichen Verbesserung der Betriebsabläufe.
          </Alert>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Aktive QS-Maßnahmen
                </Typography>
                <List>
                  {massnahmen.filter(m => m.status === 'aktiv').map((massnahme) => (
                    <ListItem 
                      key={massnahme.id}
                      secondaryAction={
                        <IconButton edge="end" onClick={() => handleOpenMassnahmeDialog(massnahme)}>
                          <ArrowForwardIcon />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={massnahme.titel}
                        secondary={`${massnahme.prozessBereich} | Prüfintervall: ${massnahme.pruefintervall}`}
                      />
                    </ListItem>
                  ))}
                </List>
                <Button 
                  variant="outlined" 
                  startIcon={<ArrowForwardIcon />} 
                  sx={{ mt: 2 }}
                  onClick={() => setTabValue(1)}
                >
                  Alle QS-Maßnahmen anzeigen
                </Button>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Aktuelle Dokumente
                </Typography>
                <List>
                  {dokumente.slice(0, 3).map((dokument) => (
                    <ListItem 
                      key={dokument.id}
                      secondaryAction={
                        <Chip 
                          label={dokument.kategorie} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                        />
                      }
                    >
                      <ListItemIcon>
                        <FileIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary={dokument.titel}
                        secondary={`Version: ${dokument.version} | Aktualisiert: ${new Date(dokument.aktualisiertAm).toLocaleDateString('de-DE')}`}
                      />
                    </ListItem>
                  ))}
                </List>
                <Button 
                  variant="outlined" 
                  startIcon={<ArrowForwardIcon />} 
                  sx={{ mt: 2 }}
                  onClick={() => setTabValue(2)}
                >
                  Alle Dokumente anzeigen
                </Button>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Schnellzugriff
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
                  <Button 
                    variant="outlined" 
                    startIcon={<PrintIcon />}
                    onClick={handlePrint}
                  >
                    QS-Handbuch drucken
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenMassnahmeDialog()}
                  >
                    Neue QS-Maßnahme
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<AssignmentIcon />}
                    onClick={() => setTabValue(3)}
                  >
                    Prüfhistorie anzeigen
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" component="h2">
              QS-Maßnahmen
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenMassnahmeDialog()}
            >
              Neue Maßnahme
            </Button>
          </Box>
          
          {massnahmen.map((massnahme) => (
            <Accordion key={massnahme.id} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" width="100%">
                  <Box flexGrow={1}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {massnahme.titel}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {massnahme.prozessBereich} | Verantwortlich: {massnahme.verantwortlich}
                    </Typography>
                  </Box>
                  <Chip 
                    label={
                      massnahme.status === 'aktiv' ? 'Aktiv' : 
                      massnahme.status === 'inReview' ? 'In Prüfung' :
                      massnahme.status === 'abgeschlossen' ? 'Abgeschlossen' : 'Geplant'
                    } 
                    color={
                      massnahme.status === 'aktiv' ? 'success' : 
                      massnahme.status === 'inReview' ? 'warning' :
                      massnahme.status === 'abgeschlossen' ? 'info' : 'default'
                    } 
                    size="small" 
                    sx={{ mr: 2 }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" paragraph>
                  {massnahme.beschreibung}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Prüfintervall:</strong> {massnahme.pruefintervall}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Erstellt am:</strong> {new Date(massnahme.erstelltAm).toLocaleDateString('de-DE')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Zuletzt aktualisiert:</strong> {new Date(massnahme.aktualisiertAm).toLocaleDateString('de-DE')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      variant="outlined" 
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenMassnahmeDialog(massnahme)}
                      sx={{ mr: 1 }}
                    >
                      Bearbeiten
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="error" 
                      startIcon={<DeleteIcon />}
                    >
                      Löschen
                    </Button>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" component="h2">
              QS-Dokumente
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
            >
              Neues Dokument
            </Button>
          </Box>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Titel</TableCell>
                  <TableCell>Kategorie</TableCell>
                  <TableCell>Version</TableCell>
                  <TableCell>Aktualisiert am</TableCell>
                  <TableCell align="right">Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dokumente.map((dokument) => (
                  <TableRow key={dokument.id}>
                    <TableCell>{dokument.titel}</TableCell>
                    <TableCell>
                      <Chip label={dokument.kategorie} size="small" />
                    </TableCell>
                    <TableCell>{dokument.version}</TableCell>
                    <TableCell>{new Date(dokument.aktualisiertAm).toLocaleDateString('de-DE')}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Dokument anzeigen">
                        <IconButton size="small">
                          <DescriptionIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Bearbeiten">
                        <IconButton size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Löschen">
                        <IconButton size="small" color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h5" component="h2" gutterBottom>
            Prüfhistorie
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Die Prüfhistorie dokumentiert alle durchgeführten Qualitätsprüfungen und deren Ergebnisse.
          </Alert>
          
          {/* Hier würde die Komponente für die Prüfhistorie eingebunden werden */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Prüfhistorie-Komponente
            </Typography>
            <Typography>
              An dieser Stelle wird die Komponente für die Prüfhistorie eingebunden.
            </Typography>
          </Paper>
        </TabPanel>
        
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h5" component="h2" gutterBottom>
            Grundlagen des Qualitätsmanagements
          </Typography>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Maßnahmen für den sicheren Umgang mit Getreide, Ölsaaten und Leguminosen
            </Typography>
            
            <Typography variant="body1" paragraph>
              In diesem Merkblatt sind die wichtigsten Schritte zur Sicherstellung einer hochwertigen Getreide-, Ölsaaten- und Leguminosenqualität zusammengefasst. Die Regelungen der guten landwirtschaftlichen Praxis sowie alle relevanten gesetzlichen Vorschriften, insbesondere die Vorgaben der Lebensmittel- und Futtermittelgesetzgebung, sind von allen Beteiligten der Wertschöpfungskette einzuhalten.
            </Typography>
            
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Lagerung
            </Typography>
            
            <Typography variant="body1" paragraph>
              <strong>Maßnahmen vor der Lagerung:</strong>
            </Typography>
            
            <ul>
              <li>Die Wände, Böden und sonstigen Oberflächen der Lagerstätte einschließlich Schüttgossen und Fördereinrichtungen sowie Trockner müssen in baulich einwandfreiem Zustand sein.</li>
              <li>Gebäude, die für die Lagerung genutzt werden, müssen trocken und gegen Eindringen von Nässe geschützt sein; undichte Stellen müssen vor der Einlagerung repariert werden.</li>
              <li>Es sind Maßnahmen zu treffen, um den Zugang und Verschmutzungen durch Tiere zu verhindern. Deshalb sind Türen und Fenster zum Lager geschlossen zu halten oder durch geeignete Schutzmaßnahmen zu sichern (z.B. durch Netze).</li>
              <li>Um das Risiko einer Verunreinigung durch Fremdkörper zu vermeiden, sind Glühbirnen und Leuchtstoffröhren gegen Glasbruch zu sichern bzw. zu ummanteln.</li>
            </ul>
            
            <Typography variant="body1" paragraph>
              <strong>Maßnahmen bei der Einlagerung und während der Lagerung:</strong>
            </Typography>
            
            <ul>
              <li>Während der Lagerung sind Verunreinigungen jeder Art und Vermischungen mit anderen Rohstoffen zu vermeiden.</li>
              <li>Getreide, Ölsaaten und Leguminosen sind entsprechend der Lagerdauer in einen lagerfähigen Zustand zu bringen (z.B. durch Reinigung, Kühlung, Trocknung und/oder Belüftung).</li>
              <li>Die Temperatur und der sonstige Qualitätszustand müssen regelmäßig (zu Beginn der Lagerung mind. 14-tägig) überprüft werden.</li>
            </ul>
            
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Transport
            </Typography>
            
            <ul>
              <li>Sämtliche Transportmittel müssen zur Vermeidung von Verunreinigungen sauber, trocken und für den Transport geeignet sein.</li>
              <li>Verschmutzte Transportmittel sind vor der Beladung sorgfältig zu reinigen.</li>
              <li>Transportmittel dürfen nicht mit Getreide, Ölsaaten und Leguminosen beladen werden, wenn diese zuvor für den Transport bestimmter kritischer Güter genutzt wurden.</li>
            </ul>
          </Paper>
        </TabPanel>
      </Box>
      
      {/* Dialog für QS-Maßnahmen */}
      <Dialog
        open={massnahmeDialog}
        onClose={handleCloseMassnahmeDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedMassnahme ? 'QS-Maßnahme bearbeiten' : 'Neue QS-Maßnahme erstellen'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Titel"
                fullWidth
                value={selectedMassnahme?.titel || ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Beschreibung"
                fullWidth
                multiline
                rows={4}
                value={selectedMassnahme?.beschreibung || ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Prozessbereich"
                fullWidth
                value={selectedMassnahme?.prozessBereich || ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Verantwortlich"
                fullWidth
                value={selectedMassnahme?.verantwortlich || ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Prüfintervall"
                fullWidth
                value={selectedMassnahme?.pruefintervall || ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedMassnahme?.status || 'geplant'}
                  label="Status"
                >
                  <MenuItem value="geplant">Geplant</MenuItem>
                  <MenuItem value="aktiv">Aktiv</MenuItem>
                  <MenuItem value="inReview">In Prüfung</MenuItem>
                  <MenuItem value="abgeschlossen">Abgeschlossen</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMassnahmeDialog}>Abbrechen</Button>
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />}
            onClick={handleSaveMassnahme}
          >
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QualitaetsHandbuch; 