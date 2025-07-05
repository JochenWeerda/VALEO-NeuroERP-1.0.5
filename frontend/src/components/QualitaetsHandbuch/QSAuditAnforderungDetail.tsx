import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Alert,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
  SmartToy as AIIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getAnforderungById,
  updateAnforderung,
  deleteAnforderung,
  uploadAuditDokument,
  generateKIErinnerungen,
  auditMockData
} from '../../services/auditApi';
import type { AuditAnforderung, AuditDokument, AuditErinnerung } from '../../services/auditApi';
import de from 'date-fns/locale/de';

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
      id={`anforderung-tabpanel-${index}`}
      aria-labelledby={`anforderung-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

interface QSAuditAnforderungDetailProps {
  anforderungId?: string;
  onBack?: () => void;
  onSave?: (anforderung: AuditAnforderung) => void;
  onDelete?: (id: string) => void;
}

const QSAuditAnforderungDetail: React.FC<QSAuditAnforderungDetailProps> = ({
  anforderungId: propAnforderungId,
  onBack,
  onSave,
  onDelete
}) => {
  const { id: paramId } = useParams<{ id: string }>();
  const anforderungId = propAnforderungId || paramId;
  const isNew = anforderungId === 'neu';
  
  const [anforderung, setAnforderung] = useState<AuditAnforderung | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [kiEmpfehlungenDialogOpen, setKiEmpfehlungenDialogOpen] = useState(false);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isNew) {
      // Neue Anforderung initialisieren
      setAnforderung({
        id: 'neu',
        titel: '',
        beschreibung: '',
        kategorie: 'QS',
        verantwortlicher: '',
        deadline: new Date().toISOString(),
        erstelltAm: new Date().toISOString(),
        erstelltVon: 'Aktueller Benutzer', // In einer realen Anwendung würde hier der aktuelle Benutzer stehen
        dokumentTypen: [],
        status: 'offen',
        prioritaet: 'mittel',
        erinnerungen: [],
        dokumente: [],
        notizen: '',
        automatischeErinnerungen: true,
        eskalationsLevel: 0
      });
      setDeadline(new Date());
    } else if (anforderungId) {
      // Bestehende Anforderung laden
      const fetchData = async () => {
        setLoading(true);
        try {
          // In einer realen Anwendung würden wir hier die API aufrufen
          // const data = await getAnforderungById(anforderungId);
          
          // Für den Prototyp verwenden wir Mock-Daten
          const mockAnforderung = auditMockData.anforderungen.find(a => a.id === anforderungId);
          
          if (mockAnforderung) {
            setAnforderung(mockAnforderung);
            setDeadline(new Date(mockAnforderung.deadline));
            setError(null);
          } else {
            setError(`Anforderung mit ID ${anforderungId} nicht gefunden.`);
          }
        } catch (err) {
          setError(`Fehler beim Laden der Anforderung mit ID ${anforderungId}.`);
          console.error(`Fehler beim Laden der Anforderung mit ID ${anforderungId}:`, err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    }
  }, [anforderungId, isNew]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/qualitaet/audit/anforderungen');
    }
  };
  
  const handleInputChange = (field: keyof AuditAnforderung, value: any) => {
    if (anforderung) {
      setAnforderung({
        ...anforderung,
        [field]: value
      });
    }
  };
  
  const handleDateChange = (date: Date | null) => {
    setDeadline(date);
    if (date && anforderung) {
      setAnforderung({
        ...anforderung,
        deadline: date.toISOString()
      });
    }
  };
  
  const handleSave = async () => {
    if (!anforderung) return;
    
    setLoading(true);
    try {
      // In einer realen Anwendung würden wir hier die API aufrufen
      // const savedAnforderung = isNew 
      //   ? await createAnforderung(anforderung)
      //   : await updateAnforderung(anforderung.id, anforderung);
      
      // Für den Prototyp simulieren wir die Speicherung
      const savedAnforderung = {
        ...anforderung,
        id: isNew ? String(auditMockData.anforderungen.length + 1) : anforderung.id
      };
      
      if (onSave) {
        onSave(savedAnforderung);
      }
      
      setError(null);
      if (isNew) {
        // Bei einer neuen Anforderung zur Liste zurückkehren oder zur Detailansicht der neuen Anforderung navigieren
        navigate('/qualitaet/audit/anforderungen');
      }
    } catch (err) {
      setError('Fehler beim Speichern der Anforderung.');
      console.error('Fehler beim Speichern der Anforderung:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!anforderung || isNew) return;
    
    setLoading(true);
    try {
      // In einer realen Anwendung würden wir hier die API aufrufen
      // await deleteAnforderung(anforderung.id);
      
      if (onDelete) {
        onDelete(anforderung.id);
      }
      
      setDeleteDialogOpen(false);
      handleBack();
    } catch (err) {
      setError(`Fehler beim Löschen der Anforderung mit ID ${anforderung.id}.`);
      console.error(`Fehler beim Löschen der Anforderung mit ID ${anforderung.id}:`, err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleKIEmpfehlungen = async () => {
    if (!anforderung) return;
    
    setLoading(true);
    try {
      // In einer realen Anwendung würden wir hier die API aufrufen
      // const empfehlungen = await generateKIEmpfehlungen(anforderung.id);
      
      // Für den Prototyp simulieren wir die KI-Empfehlungen
      const empfehlungen = {
        empfehlungen: "Für diese Anforderung empfehle ich folgende Maßnahmen: 1) Beauftragen Sie einen externen Dienstleister für die Kalibrierung, da dies Spezialwissen erfordert. 2) Planen Sie die Kalibrierung mindestens 4 Wochen vor dem Audit ein, um Zeit für eventuelle Nachkorrekturen zu haben. 3) Dokumentieren Sie den gesamten Prozess mit Fotos vor und nach der Kalibrierung.",
        optimierteDeadline: "2024-08-15"
      };
      
      setAnforderung({
        ...anforderung,
        kiEmpfehlungen: empfehlungen.empfehlungen,
        kiOptimierteDeadline: empfehlungen.optimierteDeadline
      });
      
      setKiEmpfehlungenDialogOpen(true);
      setError(null);
    } catch (err) {
      setError('Fehler bei der Generierung von KI-Empfehlungen.');
      console.error('Fehler bei der Generierung von KI-Empfehlungen:', err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !anforderung) {
    return (
      <Box sx={{ width: '100%' }}>
        <Paper sx={{ p: 3 }}>
          <LinearProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Daten werden geladen...
          </Typography>
        </Paper>
      </Box>
    );
  }
  
  if (error && !anforderung) {
    return (
      <Box sx={{ width: '100%' }}>
        <Paper sx={{ p: 3 }}>
          <Alert severity="error">{error}</Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ mt: 2 }}
          >
            Zurück
          </Button>
        </Paper>
      </Box>
    );
  }
  
  if (!anforderung) {
    return null;
  }
  
  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center">
            <IconButton onClick={handleBack} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" component="h2">
              {isNew ? 'Neue Audit-Anforderung' : anforderung.titel}
            </Typography>
          </Box>
          
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<AIIcon />}
              onClick={handleKIEmpfehlungen}
              sx={{ mr: 1 }}
              disabled={isNew}
            >
              KI-Empfehlungen
            </Button>
            
            <Button 
              variant="contained" 
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!anforderung.titel || !anforderung.verantwortlicher}
            >
              Speichern
            </Button>
            
            {!isNew && (
              <IconButton 
                color="error" 
                onClick={() => setDeleteDialogOpen(true)}
                sx={{ ml: 1 }}
                title="Löschen"
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        </Box>
        
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Allgemein" />
            <Tab label="Dokumente" disabled={isNew} />
            <Tab label="Erinnerungen" disabled={isNew} />
            <Tab label="KI-Empfehlungen" disabled={isNew} />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Titel"
                fullWidth
                required
                value={anforderung.titel}
                onChange={(e) => handleInputChange('titel', e.target.value)}
                error={!anforderung.titel}
                helperText={!anforderung.titel ? 'Titel ist erforderlich' : ''}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Beschreibung"
                fullWidth
                multiline
                rows={4}
                value={anforderung.beschreibung}
                onChange={(e) => handleInputChange('beschreibung', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Kategorie</InputLabel>
                <Select
                  value={anforderung.kategorie}
                  label="Kategorie"
                  onChange={(e) => handleInputChange('kategorie', e.target.value)}
                >
                  <MenuItem value="QS">QS</MenuItem>
                  <MenuItem value="GMP">GMP</MenuItem>
                  <MenuItem value="IFS">IFS</MenuItem>
                  <MenuItem value="BIO">BIO</MenuItem>
                  <MenuItem value="Nachhaltigkeit">Nachhaltigkeit</MenuItem>
                  <MenuItem value="HACCP">HACCP</MenuItem>
                  <MenuItem value="Andere">Andere</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Verantwortlicher</InputLabel>
                <Select
                  value={anforderung.verantwortlicher}
                  label="Verantwortlicher"
                  onChange={(e) => handleInputChange('verantwortlicher', e.target.value)}
                  error={!anforderung.verantwortlicher}
                >
                  <MenuItem value="4">Thomas Becker (QM-Beauftragter)</MenuItem>
                  <MenuItem value="3">Klaus Weber (Anlagenführer)</MenuItem>
                  <MenuItem value="2">Petra Schmidt (Fahrerin)</MenuItem>
                  <MenuItem value="1">Hans Müller (Lagerist)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
                <DatePicker
                  label="Deadline"
                  value={deadline}
                  onChange={handleDateChange}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priorität</InputLabel>
                <Select
                  value={anforderung.prioritaet}
                  label="Priorität"
                  onChange={(e) => handleInputChange('prioritaet', e.target.value)}
                >
                  <MenuItem value="niedrig">Niedrig</MenuItem>
                  <MenuItem value="mittel">Mittel</MenuItem>
                  <MenuItem value="hoch">Hoch</MenuItem>
                  <MenuItem value="kritisch">Kritisch</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {!isNew && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={anforderung.status}
                    label="Status"
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <MenuItem value="offen">Offen</MenuItem>
                    <MenuItem value="inBearbeitung">In Bearbeitung</MenuItem>
                    <MenuItem value="abgeschlossen">Abgeschlossen</MenuItem>
                    <MenuItem value="abgelehnt">Abgelehnt</MenuItem>
                    <MenuItem value="verschoben">Verschoben</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                label="Notizen"
                fullWidth
                multiline
                rows={3}
                value={anforderung.notizen}
                onChange={(e) => handleInputChange('notizen', e.target.value)}
              />
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Hier können Sie Dokumente hochladen, die für diese Audit-Anforderung relevant sind. Jedes Dokument wird versioniert und kann mit einem Gültigkeitsdatum versehen werden.
          </Alert>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={() => alert('Dokumentenupload-Dialog würde hier geöffnet werden.')}
              >
                Dokument hochladen
              </Button>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Hochgeladene Dokumente
              </Typography>
              
              {anforderung.dokumente && anforderung.dokumente.length > 0 ? (
                <List>
                  {anforderung.dokumente.map((dokument) => (
                    <ListItem key={dokument.id}>
                      <ListItemText
                        primary={dokument.name}
                        secondary={`Typ: ${dokument.dokumentTyp} | Hochgeladen am: ${new Date(dokument.hochgeladenAm).toLocaleDateString('de-DE')} | Version: ${dokument.version}`}
                      />
                      <Chip 
                        label={dokument.status} 
                        color={dokument.status === 'aktuell' ? 'success' : 
                               dokument.status === 'abgelaufen' ? 'error' : 'default'} 
                        size="small" 
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Noch keine Dokumente hochgeladen.
                </Typography>
              )}
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Hier können Sie automatische Erinnerungen für diese Audit-Anforderung konfigurieren. Die KI schlägt basierend auf der Priorität und Deadline optimale Erinnerungszeitpunkte vor.
          </Alert>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={<NotificationsIcon />}
                onClick={() => alert('KI würde optimale Erinnerungen generieren.')}
              >
                KI-Erinnerungen generieren
              </Button>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Geplante Erinnerungen
              </Typography>
              
              {anforderung.erinnerungen && anforderung.erinnerungen.length > 0 ? (
                <List>
                  {anforderung.erinnerungen.map((erinnerung) => (
                    <ListItem key={erinnerung.id}>
                      <ListItemText
                        primary={erinnerung.nachricht}
                        secondary={`Datum: ${new Date(erinnerung.datum).toLocaleDateString('de-DE')} | Typ: ${erinnerung.typ} | Status: ${erinnerung.status}`}
                      />
                      <Chip 
                        label={`Stufe ${erinnerung.eskalationsLevel}`} 
                        color={erinnerung.eskalationsLevel === 0 ? 'default' : 
                               erinnerung.eskalationsLevel === 1 ? 'primary' :
                               erinnerung.eskalationsLevel === 2 ? 'warning' : 'error'} 
                        size="small" 
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Noch keine Erinnerungen konfiguriert.
                </Typography>
              )}
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Die KI analysiert die Anforderung und gibt Empfehlungen zur optimalen Bearbeitung und Zeitplanung.
          </Alert>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                <Typography variant="h6" gutterBottom>
                  KI-Empfehlungen
                </Typography>
                
                {anforderung.kiEmpfehlungen ? (
                  <Typography variant="body1">
                    {anforderung.kiEmpfehlungen}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Noch keine KI-Empfehlungen generiert. Klicken Sie oben auf "KI-Empfehlungen", um Vorschläge zu erhalten.
                  </Typography>
                )}
              </Paper>
            </Grid>
            
            {anforderung.kiOptimierteDeadline && (
              <Grid item xs={12}>
                <Alert severity="info">
                  Die KI empfiehlt eine optimierte Deadline: {new Date(anforderung.kiOptimierteDeadline).toLocaleDateString('de-DE')}
                </Alert>
              </Grid>
            )}
          </Grid>
        </TabPanel>
      </Paper>
      
      {/* Dialog zum Löschen */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Anforderung löschen</DialogTitle>
        <DialogContent>
          Möchten Sie diese Audit-Anforderung wirklich löschen? Dieser Vorgang kann nicht rückgängig gemacht werden.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog für KI-Empfehlungen */}
      <Dialog
        open={kiEmpfehlungenDialogOpen}
        onClose={() => setKiEmpfehlungenDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <AIIcon sx={{ mr: 1 }} />
            KI-Empfehlungen
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Basierend auf meiner Analyse habe ich folgende Empfehlungen für die Anforderung "{anforderung.titel}":
          </Typography>
          
          <Typography variant="body1" paragraph>
            {anforderung.kiEmpfehlungen}
          </Typography>
          
          {anforderung.kiOptimierteDeadline && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="subtitle2">
                Optimierte Deadline: {new Date(anforderung.kiOptimierteDeadline).toLocaleDateString('de-DE')}
              </Typography>
              <Typography variant="body2">
                Diese Deadline berücksichtigt die Priorität der Aufgabe, den Zeitaufwand und den Zeitpunkt des Audits.
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setKiEmpfehlungenDialogOpen(false)}>
            Schließen
          </Button>
          {anforderung.kiOptimierteDeadline && (
            <Button 
              variant="contained"
              onClick={() => {
                handleDateChange(new Date(anforderung.kiOptimierteDeadline!));
                setKiEmpfehlungenDialogOpen(false);
              }}
            >
              Optimierte Deadline übernehmen
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QSAuditAnforderungDetail; 