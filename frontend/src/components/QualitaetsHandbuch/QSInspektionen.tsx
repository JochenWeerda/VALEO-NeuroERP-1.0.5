import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  Refresh as RefreshIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  LocalShipping as LocalShippingIcon,
  Warehouse as WarehouseIcon,
  Agriculture as AgricultureIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import de from 'date-fns/locale/de';

// Typen für QS-Inspektionen
interface QSInspektion {
  id: string;
  titel: string;
  beschreibung: string;
  bereich: 'handel' | 'transport' | 'lagerung' | 'mahlMischAnlagen';
  intervall: 'täglich' | 'wöchentlich' | 'monatlich' | 'quartalsweise' | 'halbjährlich' | 'jährlich';
  naechstesDatum: string;
  verantwortlicher: string;
  status: 'ausstehend' | 'fällig' | 'erledigt' | 'überfällig' | 'in Bearbeitung';
  checklistenTyp: string;
}

// Typen für Mitarbeiter
interface Mitarbeiter {
  id: string;
  name: string;
  vorname: string;
  position: string;
  bereich: string;
}

// Mock-Daten für Mitarbeiter
const mitarbeiterListe: Mitarbeiter[] = [
  { id: '1', name: 'Müller', vorname: 'Hans', position: 'Lagerist', bereich: 'Lager' },
  { id: '2', name: 'Schmidt', vorname: 'Petra', position: 'Fahrerin', bereich: 'Transport' },
  { id: '3', name: 'Weber', vorname: 'Klaus', position: 'Anlagenführer', bereich: 'Produktion' },
  { id: '4', name: 'Becker', vorname: 'Thomas', position: 'QM-Beauftragter', bereich: 'Qualität' }
];

// Mock-Daten für Checklisten-Typen
const checklistenTypen = [
  'Handel - Standard QS',
  'Transport - Fahrzeugkontrolle',
  'Transport - Hygiene',
  'Lagerung - Lagerkontrolle',
  'Lagerung - Schädlingsmonitoring',
  'Mahl- und Mischanlagen - Reinigung',
  'Mahl- und Mischanlagen - Funktionskontrolle'
];

// Mock-Daten für QS-Inspektionen
const initialInspektionen: QSInspektion[] = [
  {
    id: '1',
    titel: 'Monatliche Lagerkontrolle',
    beschreibung: 'Regelmäßige Kontrolle aller Lagereinrichtungen gemäß QS-Vorgaben',
    bereich: 'lagerung',
    intervall: 'monatlich',
    naechstesDatum: '2024-07-15',
    verantwortlicher: '1',
    status: 'ausstehend',
    checklistenTyp: 'Lagerung - Lagerkontrolle'
  },
  {
    id: '2',
    titel: 'Fahrzeugkontrolle vor Rapsanlieferung',
    beschreibung: 'Kontrolle aller Transportfahrzeuge vor Beladung mit Raps',
    bereich: 'transport',
    intervall: 'wöchentlich',
    naechstesDatum: '2024-07-05',
    verantwortlicher: '2',
    status: 'fällig',
    checklistenTyp: 'Transport - Fahrzeugkontrolle'
  },
  {
    id: '3',
    titel: 'Reinigung der mobilen Mischanlage',
    beschreibung: 'Gründliche Reinigung der mobilen Mischanlage nach QS-Standard',
    bereich: 'mahlMischAnlagen',
    intervall: 'wöchentlich',
    naechstesDatum: '2024-07-08',
    verantwortlicher: '3',
    status: 'ausstehend',
    checklistenTyp: 'Mahl- und Mischanlagen - Reinigung'
  },
  {
    id: '4',
    titel: 'Jährliche QS-Handelsprüfung',
    beschreibung: 'Umfassende Prüfung aller QS-relevanten Handelsprozesse',
    bereich: 'handel',
    intervall: 'jährlich',
    naechstesDatum: '2024-09-30',
    verantwortlicher: '4',
    status: 'ausstehend',
    checklistenTyp: 'Handel - Standard QS'
  },
  {
    id: '5',
    titel: 'Schädlingsmonitoring',
    beschreibung: 'Kontrolle und Dokumentation der Schädlingsfallen im Lager',
    bereich: 'lagerung',
    intervall: 'monatlich',
    naechstesDatum: '2024-06-30',
    verantwortlicher: '1',
    status: 'überfällig',
    checklistenTyp: 'Lagerung - Schädlingsmonitoring'
  }
];

const QSInspektionen: React.FC = () => {
  const [inspektionen, setInspektionen] = useState<QSInspektion[]>(initialInspektionen);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [currentInspektion, setCurrentInspektion] = useState<QSInspektion | null>(null);
  const [sendDialogOpen, setSendDialogOpen] = useState<boolean>(false);
  const [selectedInspektionId, setSelectedInspektionId] = useState<string>('');
  
  // Dialog öffnen zum Erstellen/Bearbeiten
  const handleOpenDialog = (inspektion?: QSInspektion) => {
    if (inspektion) {
      setCurrentInspektion(inspektion);
    } else {
      setCurrentInspektion({
        id: (inspektionen.length + 1).toString(),
        titel: '',
        beschreibung: '',
        bereich: 'lagerung',
        intervall: 'monatlich',
        naechstesDatum: new Date().toISOString().split('T')[0],
        verantwortlicher: '',
        status: 'ausstehend',
        checklistenTyp: ''
      });
    }
    setDialogOpen(true);
  };
  
  // Dialog schließen
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentInspektion(null);
  };
  
  // Änderung der Formularfelder
  const handleInputChange = (field: keyof QSInspektion, value: string) => {
    if (currentInspektion) {
      setCurrentInspektion({
        ...currentInspektion,
        [field]: value
      });
    }
  };
  
  // Datum ändern
  const handleDateChange = (date: Date | null) => {
    if (currentInspektion && date) {
      setCurrentInspektion({
        ...currentInspektion,
        naechstesDatum: date.toISOString().split('T')[0]
      });
    }
  };
  
  // Inspektion speichern
  const handleSaveInspektion = () => {
    if (currentInspektion) {
      const existingIndex = inspektionen.findIndex(i => i.id === currentInspektion.id);
      
      if (existingIndex !== -1) {
        // Bestehende Inspektion aktualisieren
        const updatedInspektionen = [...inspektionen];
        updatedInspektionen[existingIndex] = currentInspektion;
        setInspektionen(updatedInspektionen);
      } else {
        // Neue Inspektion hinzufügen
        setInspektionen([...inspektionen, currentInspektion]);
      }
      
      handleCloseDialog();
    }
  };
  
  // Inspektion löschen
  const handleDeleteInspektion = (id: string) => {
    setInspektionen(inspektionen.filter(i => i.id !== id));
  };
  
  // Status aktualisieren
  const handleStatusUpdate = (id: string, newStatus: QSInspektion['status']) => {
    setInspektionen(inspektionen.map(i => 
      i.id === id ? { ...i, status: newStatus } : i
    ));
  };
  
  // Dialog zum Senden einer Checkliste öffnen
  const handleOpenSendDialog = (id: string) => {
    setSelectedInspektionId(id);
    setSendDialogOpen(true);
  };
  
  // Dialog zum Senden einer Checkliste schließen
  const handleCloseSendDialog = () => {
    setSendDialogOpen(false);
  };
  
  // Checkliste senden
  const handleSendChecklist = () => {
    // Hier würde die Logik zum Senden der Checkliste implementiert werden
    
    // Status aktualisieren
    handleStatusUpdate(selectedInspektionId, 'in Bearbeitung');
    handleCloseSendDialog();
  };
  
  // Status-Chip basierend auf dem Status anzeigen
  const renderStatusChip = (status: QSInspektion['status']) => {
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
    
    switch (status) {
      case 'ausstehend':
        color = 'default';
        break;
      case 'fällig':
        color = 'warning';
        break;
      case 'erledigt':
        color = 'success';
        break;
      case 'überfällig':
        color = 'error';
        break;
      case 'in Bearbeitung':
        color = 'info';
        break;
      default:
        color = 'default';
    }
    
    return <Chip label={status} color={color} size="small" />;
  };
  
  // Icon basierend auf dem Bereich anzeigen
  const renderBereichIcon = (bereich: QSInspektion['bereich']) => {
    switch (bereich) {
      case 'handel':
        return <BusinessIcon />;
      case 'transport':
        return <LocalShippingIcon />;
      case 'lagerung':
        return <WarehouseIcon />;
      case 'mahlMischAnlagen':
        return <AgricultureIcon />;
      default:
        return <AssignmentIcon />;
    }
  };
  
  // Bereichsname formatiert anzeigen
  const formatBereich = (bereich: QSInspektion['bereich']) => {
    switch (bereich) {
      case 'handel':
        return 'Handel';
      case 'transport':
        return 'Transport';
      case 'lagerung':
        return 'Lagerung';
      case 'mahlMischAnlagen':
        return 'Mahl- und Mischanlagen';
      default:
        return bereich;
    }
  };
  
  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2">
            QS-Inspektionen und Terminplanung
          </Typography>
          
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              sx={{ mr: 1 }}
            >
              Aktualisieren
            </Button>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Neue Inspektion
            </Button>
          </Box>
        </Box>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Hier werden alle anstehenden QS-Inspektionen verwaltet. Inspektionen können geplant, zugewiesen und überwacht werden. Klicken Sie auf "Checkliste senden", um die Inspektion einem Mitarbeiter zuzuweisen.
        </Alert>
      </Paper>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Bereich</TableCell>
              <TableCell>Titel</TableCell>
              <TableCell>Nächstes Datum</TableCell>
              <TableCell>Intervall</TableCell>
              <TableCell>Verantwortlicher</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inspektionen.map((inspektion) => {
              const verantwortlicher = mitarbeiterListe.find(m => m.id === inspektion.verantwortlicher);
              
              return (
                <TableRow key={inspektion.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      {renderBereichIcon(inspektion.bereich)}
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {formatBereich(inspektion.bereich)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {inspektion.titel}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {inspektion.checklistenTyp}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(inspektion.naechstesDatum).toLocaleDateString('de-DE')}
                  </TableCell>
                  <TableCell>{inspektion.intervall}</TableCell>
                  <TableCell>
                    {verantwortlicher ? `${verantwortlicher.vorname} ${verantwortlicher.name}` : '-'}
                  </TableCell>
                  <TableCell>{renderStatusChip(inspektion.status)}</TableCell>
                  <TableCell align="right">
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenDialog(inspektion)}
                      title="Bearbeiten"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenSendDialog(inspektion.id)}
                      title="Checkliste senden"
                    >
                      <SendIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleStatusUpdate(inspektion.id, 'erledigt')}
                      title="Als erledigt markieren"
                      color={inspektion.status === 'erledigt' ? 'success' : 'default'}
                    >
                      <CheckCircleIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteInspektion(inspektion.id)}
                      title="Löschen"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Dialog zum Erstellen/Bearbeiten einer Inspektion */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentInspektion && currentInspektion.titel 
            ? `Inspektion bearbeiten: ${currentInspektion.titel}` 
            : 'Neue Inspektion erstellen'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Titel"
                fullWidth
                value={currentInspektion?.titel || ''}
                onChange={(e) => handleInputChange('titel', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Beschreibung"
                fullWidth
                multiline
                rows={3}
                value={currentInspektion?.beschreibung || ''}
                onChange={(e) => handleInputChange('beschreibung', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Bereich</InputLabel>
                <Select
                  value={currentInspektion?.bereich || 'lagerung'}
                  label="Bereich"
                  onChange={(e) => handleInputChange('bereich', e.target.value as QSInspektion['bereich'])}
                >
                  <MenuItem value="handel">Handel</MenuItem>
                  <MenuItem value="transport">Transport</MenuItem>
                  <MenuItem value="lagerung">Lagerung</MenuItem>
                  <MenuItem value="mahlMischAnlagen">Mobile Mahl- und Mischanlagen</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Intervall</InputLabel>
                <Select
                  value={currentInspektion?.intervall || 'monatlich'}
                  label="Intervall"
                  onChange={(e) => handleInputChange('intervall', e.target.value as QSInspektion['intervall'])}
                >
                  <MenuItem value="täglich">Täglich</MenuItem>
                  <MenuItem value="wöchentlich">Wöchentlich</MenuItem>
                  <MenuItem value="monatlich">Monatlich</MenuItem>
                  <MenuItem value="quartalsweise">Quartalsweise</MenuItem>
                  <MenuItem value="halbjährlich">Halbjährlich</MenuItem>
                  <MenuItem value="jährlich">Jährlich</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
                <DatePicker
                  label="Nächstes Datum"
                  value={currentInspektion?.naechstesDatum ? new Date(currentInspektion.naechstesDatum) : null}
                  onChange={handleDateChange}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Verantwortlicher</InputLabel>
                <Select
                  value={currentInspektion?.verantwortlicher || ''}
                  label="Verantwortlicher"
                  onChange={(e) => handleInputChange('verantwortlicher', e.target.value)}
                >
                  {mitarbeiterListe.map((mitarbeiter) => (
                    <MenuItem key={mitarbeiter.id} value={mitarbeiter.id}>
                      {mitarbeiter.vorname} {mitarbeiter.name} - {mitarbeiter.position}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Checklisten-Typ</InputLabel>
                <Select
                  value={currentInspektion?.checklistenTyp || ''}
                  label="Checklisten-Typ"
                  onChange={(e) => handleInputChange('checklistenTyp', e.target.value)}
                >
                  {checklistenTypen.map((typ) => (
                    <MenuItem key={typ} value={typ}>
                      {typ}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={currentInspektion?.status || 'ausstehend'}
                  label="Status"
                  onChange={(e) => handleInputChange('status', e.target.value as QSInspektion['status'])}
                >
                  <MenuItem value="ausstehend">Ausstehend</MenuItem>
                  <MenuItem value="fällig">Fällig</MenuItem>
                  <MenuItem value="erledigt">Erledigt</MenuItem>
                  <MenuItem value="überfällig">Überfällig</MenuItem>
                  <MenuItem value="in Bearbeitung">In Bearbeitung</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveInspektion}
            disabled={!currentInspektion?.titel || !currentInspektion?.verantwortlicher}
          >
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog zum Senden einer Checkliste */}
      <Dialog
        open={sendDialogOpen}
        onClose={handleCloseSendDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <SendIcon sx={{ mr: 1 }} />
            Checkliste senden
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedInspektionId && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                {inspektionen.find(i => i.id === selectedInspektionId)?.titel}
              </Typography>
              
              <Alert severity="info" sx={{ my: 2 }}>
                Die Checkliste wird an den verantwortlichen Mitarbeiter gesendet. Der Mitarbeiter erhält eine Benachrichtigung auf seinem Gerät und kann die Checkliste bearbeiten.
              </Alert>
              
              <Typography variant="body1" gutterBottom>
                Verantwortlich: {
                  (() => {
                    const inspektion = inspektionen.find(i => i.id === selectedInspektionId);
                    if (!inspektion) return '-';
                    
                    const verantwortlicher = mitarbeiterListe.find(m => m.id === inspektion.verantwortlicher);
                    return verantwortlicher ? `${verantwortlicher.vorname} ${verantwortlicher.name}` : '-';
                  })()
                }
              </Typography>
              
              <Typography variant="body1">
                Checklisten-Typ: {inspektionen.find(i => i.id === selectedInspektionId)?.checklistenTyp}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSendDialog}>Abbrechen</Button>
          <Button 
            variant="contained" 
            startIcon={<SendIcon />}
            onClick={handleSendChecklist}
          >
            Checkliste senden
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QSInspektionen; 