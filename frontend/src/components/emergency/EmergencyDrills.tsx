import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Button,
  Tooltip,
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
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  Badge,
  LinearProgress
} from '@mui/material';
import {
  Event as EventIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Group as GroupIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationIcon,
  Assignment as AssignmentIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO, isAfter, isBefore, addMonths } from 'date-fns';
import { de } from 'date-fns/locale';
import emergencyApi from '../../services/emergencyApi';

// Dummy-Schnittstellen - sollten durch die echten API-Schnittstellen ersetzt werden
interface EmergencyDrill {
  id: number;
  title: string;
  description: string;
  drill_type: string;
  location: string;
  scheduled_date: string;
  duration_minutes: number;
  participants: string[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  result_notes?: string;
  performance_rating?: number;
}

interface EmergencyDrillsProps {
  filterType?: string;
}

const EmergencyDrills: React.FC<EmergencyDrillsProps> = ({ filterType }) => {
  // State für Notfallübungen und Ladevorgang
  const [drills, setDrills] = useState<EmergencyDrill[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State für Paginierung
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // State für Dialog-Anzeige
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDrill, setSelectedDrill] = useState<EmergencyDrill | null>(null);
  
  // State für Formulardaten beim Erstellen/Bearbeiten
  const [formData, setFormData] = useState<Partial<EmergencyDrill>>({
    title: '',
    description: '',
    drill_type: 'fire',
    location: '',
    scheduled_date: new Date().toISOString(),
    duration_minutes: 60,
    participants: [],
    status: 'scheduled'
  });

  // Verfügbare Übungstypen
  const drillTypes = [
    { value: 'fire', label: 'Feueralarm' },
    { value: 'evacuation', label: 'Evakuierung' },
    { value: 'first_aid', label: 'Erste Hilfe' },
    { value: 'security', label: 'Sicherheitsübung' },
    { value: 'it_security', label: 'IT-Sicherheit' },
    { value: 'power_outage', label: 'Stromausfall' },
    { value: 'environmental', label: 'Umweltnotfall' },
    { value: 'other', label: 'Sonstige' }
  ];

  // Dummy-Daten für die Entwicklung - später durch API-Aufrufe ersetzen
  useEffect(() => {
    const fetchDrills = async () => {
      setLoading(true);
      try {
        // Hier API-Aufruf einfügen, wenn implementiert
        // const data = await emergencyApi.getDrills(filterType);
        
        // Dummy-Daten für die Entwicklung
        const dummyData: EmergencyDrill[] = [
          {
            id: 1,
            title: 'Jährliche Feuerübung',
            description: 'Regelmäßige Feuerübung für alle Mitarbeiter im Hauptgebäude',
            drill_type: 'fire',
            location: 'Hauptgebäude',
            scheduled_date: '2025-06-15T10:00:00Z',
            duration_minutes: 60,
            participants: ['Alle Mitarbeiter', 'Sicherheitsbeauftragter', 'Brandschutzbeauftragter'],
            status: 'scheduled'
          },
          {
            id: 2,
            title: 'IT-Notfallübung',
            description: 'Simulation eines Cyberangriffs und Wiederherstellung kritischer Systeme',
            drill_type: 'it_security',
            location: 'Serverraum & IT-Abteilung',
            scheduled_date: '2025-05-15T14:00:00Z',
            duration_minutes: 180,
            participants: ['IT-Team', 'Sicherheitsbeauftragter', 'Geschäftsleitung'],
            status: 'completed',
            result_notes: 'Alle kritischen Systeme wurden innerhalb von 2 Stunden wiederhergestellt. Verbesserungspotenzial bei der Kommunikation identifiziert.',
            performance_rating: 4
          },
          {
            id: 3,
            title: 'Evakuierungsübung Lagerhalle',
            description: 'Übung zur sicheren und schnellen Evakuierung der Lagerhalle im Notfall',
            drill_type: 'evacuation',
            location: 'Lagerhalle Ost',
            scheduled_date: '2025-04-05T09:30:00Z',
            duration_minutes: 45,
            participants: ['Lagermitarbeiter', 'Sicherheitsbeauftragter', 'Erste-Hilfe-Team'],
            status: 'completed',
            result_notes: 'Evakuierung in 3:45 Minuten abgeschlossen. Einige Mitarbeiter waren unsicher über die Sammelplätze.',
            performance_rating: 3
          },
          {
            id: 4,
            title: 'Erste-Hilfe-Training',
            description: 'Auffrischungskurs für Erste-Hilfe-Maßnahmen und Defibrillator-Einsatz',
            drill_type: 'first_aid',
            location: 'Schulungsraum 2',
            scheduled_date: '2025-07-22T13:00:00Z',
            duration_minutes: 240,
            participants: ['Erste-Hilfe-Team', 'Abteilungsleiter', 'Freiwillige Mitarbeiter'],
            status: 'scheduled'
          },
          {
            id: 5,
            title: 'Stromausfall-Simulation',
            description: 'Test der Notstromaggregate und kritischen Infrastruktur bei Stromausfall',
            drill_type: 'power_outage',
            location: 'Gesamtes Betriebsgelände',
            scheduled_date: '2025-08-10T20:00:00Z',
            duration_minutes: 120,
            participants: ['Technisches Team', 'Sicherheitsbeauftragter', 'Nachtschicht-Mitarbeiter'],
            status: 'scheduled'
          }
        ];
        
        setDrills(dummyData);
        setError(null);
      } catch (err) {
        console.error('Fehler beim Laden der Notfallübungen:', err);
        setError('Die Notfallübungen konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
      } finally {
        setLoading(false);
      }
    };

    fetchDrills();
  }, [filterType]);

  // Handler für Seitenänderung
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handler für Änderung der Anzahl der Zeilen pro Seite
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // Handler für Detailansicht
  const handleOpenDetails = (drill: EmergencyDrill) => {
    setSelectedDrill(drill);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedDrill(null);
  };

  // Handler für das Erstellen einer neuen Übung
  const handleOpenCreateDialog = () => {
    setFormData({
      title: '',
      description: '',
      drill_type: 'fire',
      location: '',
      scheduled_date: new Date().toISOString(),
      duration_minutes: 60,
      participants: [],
      status: 'scheduled'
    });
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
  };

  // Handler für das Bearbeiten einer Übung
  const handleOpenEditDialog = (drill: EmergencyDrill) => {
    setSelectedDrill(drill);
    setFormData({ ...drill });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedDrill(null);
  };

  // Handler für Änderungen im Formular
  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handler für das Speichern einer neuen Übung
  const handleCreateDrill = async () => {
    try {
      // Hier API-Aufruf einfügen, wenn implementiert
      // await emergencyApi.createDrill(formData);
      
      // Für die Entwicklung: Neue Übung zur lokalen Liste hinzufügen
      const newDrill: EmergencyDrill = {
        ...formData as EmergencyDrill,
        id: Math.max(...drills.map(d => d.id), 0) + 1
      };
      
      setDrills(prev => [...prev, newDrill]);
      handleCloseCreateDialog();
    } catch (err) {
      console.error('Fehler beim Erstellen der Übung:', err);
      setError('Die Übung konnte nicht erstellt werden. Bitte versuchen Sie es später erneut.');
    }
  };

  // Handler für das Aktualisieren einer Übung
  const handleUpdateDrill = async () => {
    if (!selectedDrill) return;
    
    try {
      // Hier API-Aufruf einfügen, wenn implementiert
      // await emergencyApi.updateDrill(selectedDrill.id, formData);
      
      // Für die Entwicklung: Übung in der lokalen Liste aktualisieren
      setDrills(prev => prev.map(drill => 
        drill.id === selectedDrill.id ? { ...drill, ...formData } : drill
      ));
      
      handleCloseEditDialog();
    } catch (err) {
      console.error('Fehler beim Aktualisieren der Übung:', err);
      setError('Die Übung konnte nicht aktualisiert werden. Bitte versuchen Sie es später erneut.');
    }
  };

  // Chip für den Status der Übung
  const getStatusChip = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Chip label="Geplant" color="primary" size="small" icon={<CalendarIcon />} />;
      case 'in_progress':
        return <Chip label="In Durchführung" color="warning" size="small" icon={<PlayArrowIcon />} />;
      case 'completed':
        return <Chip label="Abgeschlossen" color="success" size="small" icon={<CheckCircleIcon />} />;
      case 'cancelled':
        return <Chip label="Abgesagt" color="error" size="small" icon={<StopIcon />} />;
      default:
        return <Chip label="Unbekannt" color="default" size="small" />;
    }
  };

  // Chip für den Typ der Übung
  const getDrillTypeChip = (type: string) => {
    const drillType = drillTypes.find(t => t.value === type);
    const label = drillType ? drillType.label : 'Unbekannt';
    
    switch (type) {
      case 'fire':
        return <Chip label={label} color="error" size="small" />;
      case 'evacuation':
        return <Chip label={label} color="warning" size="small" />;
      case 'first_aid':
        return <Chip label={label} color="success" size="small" />;
      case 'it_security':
        return <Chip label={label} color="info" size="small" />;
      case 'power_outage':
        return <Chip label={label} color="secondary" size="small" />;
      case 'environmental':
        return <Chip label={label} style={{ backgroundColor: '#2e7d32' }} size="small" />;
      default:
        return <Chip label={label} color="default" size="small" />;
    }
  };

  // Helfer-Funktion zur Formatierung des Datums
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd.MM.yyyy HH:mm', { locale: de });
    } catch (e) {
      return 'Ungültiges Datum';
    }
  };

  // Bewertungsskala rendern
  const renderRating = (rating?: number) => {
    if (!rating) return 'Keine Bewertung';
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <LinearProgress 
          variant="determinate" 
          value={rating * 20} 
          sx={{ 
            width: 100, 
            height: 10, 
            borderRadius: 5,
            backgroundColor: '#e0e0e0',
            '& .MuiLinearProgress-bar': {
              backgroundColor: rating < 3 ? '#f44336' : rating < 4 ? '#ff9800' : '#4caf50',
              borderRadius: 5
            }
          }} 
        />
        <Typography variant="body2" sx={{ ml: 1 }}>
          {rating}/5
        </Typography>
      </Box>
    );
  };

  // Übersicht als Tabelle rendern
  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Notfallübungen
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Neue Übung planen
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Übungstitel</TableCell>
                  <TableCell>Typ</TableCell>
                  <TableCell>Datum</TableCell>
                  <TableCell>Ort</TableCell>
                  <TableCell>Dauer</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {drills
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((drill) => (
                    <TableRow key={drill.id}>
                      <TableCell>{drill.title}</TableCell>
                      <TableCell>{getDrillTypeChip(drill.drill_type)}</TableCell>
                      <TableCell>{formatDate(drill.scheduled_date)}</TableCell>
                      <TableCell>{drill.location}</TableCell>
                      <TableCell>{drill.duration_minutes} Min.</TableCell>
                      <TableCell>{getStatusChip(drill.status)}</TableCell>
                      <TableCell>
                        <Tooltip title="Details anzeigen">
                          <IconButton size="small" onClick={() => handleOpenDetails(drill)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Bearbeiten">
                          <IconButton size="small" onClick={() => handleOpenEditDialog(drill)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={drills.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Zeilen pro Seite:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} von ${count}`}
          />
        </>
      )}

      {/* Details-Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedDrill && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">{selectedDrill.title}</Typography>
                {getStatusChip(selectedDrill.status)}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>Beschreibung</Typography>
                  <Typography variant="body2">{selectedDrill.description}</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Übungstyp</Typography>
                  <Box sx={{ mt: 1 }}>{getDrillTypeChip(selectedDrill.drill_type)}</Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Geplanter Zeitpunkt</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <CalendarIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    {formatDate(selectedDrill.scheduled_date)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Ort</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <LocationIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    {selectedDrill.location}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Dauer</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <AccessTimeIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    {selectedDrill.duration_minutes} Minuten
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Teilnehmer</Typography>
                  <Box sx={{ mt: 1 }}>
                    {selectedDrill.participants.map((participant, index) => (
                      <Chip 
                        key={index}
                        label={participant}
                        icon={<GroupIcon />}
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                </Grid>
                
                {selectedDrill.status === 'completed' && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="subtitle1" gutterBottom>Ergebnisse</Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Bewertung</Typography>
                      <Box sx={{ mt: 1 }}>
                        {renderRating(selectedDrill.performance_rating)}
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">Notizen</Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {selectedDrill.result_notes || 'Keine Notizen vorhanden'}
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Schließen</Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => {
                  handleCloseDetails();
                  handleOpenEditDialog(selectedDrill);
                }}
              >
                Bearbeiten
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Weitere Dialoge für Erstellen und Bearbeiten hier einfügen - für Übersichtlichkeit ausgelassen */}
    </Box>
  );
};

export default EmergencyDrills; 