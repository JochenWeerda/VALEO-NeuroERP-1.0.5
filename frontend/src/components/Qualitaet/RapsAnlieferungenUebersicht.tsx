import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  LinearProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  Download as DownloadIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Assignment as AssignmentIcon,
  FileUpload as FileUploadIcon,
  Print as PrintIcon,
  CalendarToday as CalendarIcon,
  FilterAlt as FilterIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { 
  RapsAnlieferung, 
  LieferantStammdaten, 
  exportRapsAnlieferungenAlsCSV, 
  getRapsAnlieferungen,
  updateRapsAnlieferung,
  getLieferantStammdaten,
  uploadDokument
} from '../../services/qualitaetsApi';

interface RapsAnlieferungenUebersichtProps {
  erntejahr?: string;
}

const RapsAnlieferungenUebersicht: React.FC<RapsAnlieferungenUebersichtProps> = ({ erntejahr = '2024' }) => {
  // Zustandsvariablen
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [anlieferungen, setAnlieferungen] = useState<RapsAnlieferung[]>([]);
  const [selectedAnlieferung, setSelectedAnlieferung] = useState<RapsAnlieferung | null>(null);
  const [selectedLieferant, setSelectedLieferant] = useState<LieferantStammdaten | null>(null);
  
  // Dialog-States
  const [detailsDialog, setDetailsDialog] = useState<boolean>(false);
  const [dokumentDialog, setDokumentDialog] = useState<boolean>(false);
  
  // Filter-States
  const [filter, setFilter] = useState<string>('');
  const [filterPlz, setFilterPlz] = useState<string>('');
  const [filterPruefung, setFilterPruefung] = useState<string>('alle');
  const [showFilter, setShowFilter] = useState<boolean>(false);
  
  // Dokument-Upload-States
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [dokumentTyp, setDokumentTyp] = useState<string>('nachhaltigkeitserklaerung');
  
  // Laden der Daten
  useEffect(() => {
    fetchAnlieferungen();
  }, [erntejahr]);
  
  const fetchAnlieferungen = async () => {
    setLoading(true);
    try {
      const data = await getRapsAnlieferungen(erntejahr);
      setAnlieferungen(data);
      setError(null);
    } catch (err) {
      console.error('Fehler beim Laden der Raps-Anlieferungen:', err);
      setError('Fehler beim Laden der Daten. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchLieferantDetails = async (lieferantId: string) => {
    setLoading(true);
    try {
      const lieferant = await getLieferantStammdaten(lieferantId);
      setSelectedLieferant(lieferant);
      setError(null);
    } catch (err) {
      console.error(`Fehler beim Laden der Lieferantendaten mit ID ${lieferantId}:`, err);
      setError('Fehler beim Laden der Lieferantendaten.');
    } finally {
      setLoading(false);
    }
  };
  
  // Event-Handler
  const handleDetailsClick = async (anlieferung: RapsAnlieferung) => {
    setSelectedAnlieferung(anlieferung);
    await fetchLieferantDetails(anlieferung.lieferantId);
    setDetailsDialog(true);
  };
  
  const handleDokumentUploadClick = (anlieferung: RapsAnlieferung) => {
    setSelectedAnlieferung(anlieferung);
    setDokumentDialog(true);
  };
  
  const handleDokumentUpload = async () => {
    if (!uploadFile || !selectedAnlieferung) return;
    
    setLoading(true);
    try {
      await uploadDokument(selectedAnlieferung.id, uploadFile, dokumentTyp);
      
      // Aktualisieren der Anlieferung nach erfolgreichem Upload
      if (dokumentTyp === 'nachhaltigkeitserklaerung' || dokumentTyp === 'sortenschutzerklaerung') {
        const updatedAnlieferung = {
          ...selectedAnlieferung,
          nachhaltigkeitsDokumenteVollstaendig: true
        };
        await updateRapsAnlieferung(selectedAnlieferung.id, updatedAnlieferung);
        
        // Aktualisieren der Anlieferungsliste
        setAnlieferungen(prev => 
          prev.map(a => a.id === selectedAnlieferung.id ? 
            { ...a, nachhaltigkeitsDokumenteVollstaendig: true } : a)
        );
      }
      
      setSuccess('Dokument erfolgreich hochgeladen.');
      setDokumentDialog(false);
      setUploadFile(null);
      setDokumentTyp('nachhaltigkeitserklaerung');
    } catch (err) {
      console.error('Fehler beim Hochladen des Dokuments:', err);
      setError('Fehler beim Hochladen des Dokuments.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleExportCSV = async () => {
    setLoading(true);
    try {
      const blob = await exportRapsAnlieferungenAlsCSV(erntejahr);
      
      // CSV-Datei zum Download anbieten
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Raps_Anlieferungen_${erntejahr}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Raps-Anlieferungen wurden erfolgreich als CSV exportiert.');
    } catch (err) {
      console.error('Fehler beim CSV-Export:', err);
      setError('Fehler beim Exportieren der Raps-Anlieferungen.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };
  
  const handlePlzFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterPlz(event.target.value);
  };
  
  const handlePruefungFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFilterPruefung(event.target.value as string);
  };
  
  const resetFilter = () => {
    setFilter('');
    setFilterPlz('');
    setFilterPruefung('alle');
  };
  
  // Filterfunktion für Anlieferungen
  const getFilteredAnlieferungen = () => {
    return anlieferungen.filter(anlieferung => {
      // Name-Filter
      if (filter && !anlieferung.lieferantName.toLowerCase().includes(filter.toLowerCase())) {
        return false;
      }
      
      // PLZ-Filter
      if (filterPlz && anlieferung.plz && !anlieferung.plz.startsWith(filterPlz)) {
        return false;
      }
      
      // Prüfungs-Filter
      if (filterPruefung !== 'alle') {
        const aktuellesJahr = new Date().getFullYear();
        if (filterPruefung === 'aktuell' && anlieferung.letztePruefung !== aktuellesJahr.toString()) {
          return false;
        } else if (filterPruefung === 'veraltet' && anlieferung.letztePruefung === aktuellesJahr.toString()) {
          return false;
        } else if (filterPruefung === 'fehlend' && anlieferung.letztePruefung) {
          return false;
        }
      }
      
      return true;
    });
  };
  
  // Berechnen der Summen
  const calculateSummen = () => {
    const filteredAnlieferungen = getFilteredAnlieferungen();
    const summeNachhaltig = filteredAnlieferungen.reduce((sum, anlieferung) => sum + anlieferung.mengeNachhaltig, 0);
    const summeNichtNachhaltig = filteredAnlieferungen.reduce((sum, anlieferung) => sum + anlieferung.mengeNichtNachhaltig, 0);
    return { summeNachhaltig, summeNichtNachhaltig };
  };
  
  const { summeNachhaltig, summeNichtNachhaltig } = calculateSummen();

  // Rendering der Komponente
  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Kunden Raps-Anlieferungen Ernte {erntejahr}
      </Typography>
      
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
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Button 
          variant="outlined" 
          startIcon={<FilterIcon />}
          onClick={() => setShowFilter(!showFilter)}
        >
          {showFilter ? 'Filter ausblenden' : 'Filter anzeigen'}
        </Button>
        
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            onClick={handleExportCSV}
            sx={{ mr: 1 }}
          >
            CSV Export
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<PrintIcon />}
          >
            Drucken
          </Button>
        </Box>
      </Box>
      
      {showFilter && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                label="Lieferant"
                fullWidth
                size="small"
                value={filter}
                onChange={handleFilterChange}
                InputProps={{
                  endAdornment: filter ? (
                    <IconButton size="small" onClick={() => setFilter('')}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ) : (
                    <SearchIcon fontSize="small" color="disabled" />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="PLZ"
                fullWidth
                size="small"
                value={filterPlz}
                onChange={handlePlzFilterChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="pruefung-filter-label">Letzte Prüfung</InputLabel>
                <Select
                  labelId="pruefung-filter-label"
                  value={filterPruefung}
                  label="Letzte Prüfung"
                  onChange={handlePruefungFilterChange}
                >
                  <MenuItem value="alle">Alle</MenuItem>
                  <MenuItem value="aktuell">Aktuell ({new Date().getFullYear()})</MenuItem>
                  <MenuItem value="veraltet">Veraltet</MenuItem>
                  <MenuItem value="fehlend">Fehlend</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button 
                variant="outlined" 
                startIcon={<CloseIcon />}
                onClick={resetFilter}
              >
                Filter zurücksetzen
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={40} align="center">#</TableCell>
              <TableCell>Name</TableCell>
              <TableCell align="right">Menge nachhaltig</TableCell>
              <TableCell align="right">Menge nicht nachhaltig</TableCell>
              <TableCell align="center">letzte Prüfung</TableCell>
              <TableCell align="center">PLZ</TableCell>
              <TableCell align="center">Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getFilteredAnlieferungen().map((anlieferung, index) => (
              <TableRow key={anlieferung.id}>
                <TableCell align="center">{index + 1}</TableCell>
                <TableCell>{anlieferung.lieferantName}</TableCell>
                <TableCell align="right">{anlieferung.mengeNachhaltig.toLocaleString('de-DE')}</TableCell>
                <TableCell align="right">{anlieferung.mengeNichtNachhaltig ? anlieferung.mengeNichtNachhaltig.toLocaleString('de-DE') : ''}</TableCell>
                <TableCell align="center">
                  {anlieferung.letztePruefung ? (
                    <Chip 
                      label={anlieferung.letztePruefung} 
                      size="small"
                      color={anlieferung.letztePruefung === new Date().getFullYear().toString() ? 'success' : 'warning'}
                    />
                  ) : (
                    <Chip label="Keine" size="small" color="error" />
                  )}
                </TableCell>
                <TableCell align="center">{anlieferung.plz}</TableCell>
                <TableCell align="center">
                  <Tooltip title="Details anzeigen">
                    <IconButton size="small" onClick={() => handleDetailsClick(anlieferung)}>
                      <AssignmentIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Dokumente hochladen">
                    <IconButton size="small" onClick={() => handleDokumentUploadClick(anlieferung)}>
                      <FileUploadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Bearbeiten">
                    <IconButton size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            
            {/* Summenzeile */}
            <TableRow>
              <TableCell colSpan={2} align="right" sx={{ fontWeight: 'bold' }}>Summe:</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>{summeNachhaltig.toLocaleString('de-DE')}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>{summeNichtNachhaltig.toLocaleString('de-DE')}</TableCell>
              <TableCell colSpan={3}></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Details-Dialog */}
      <Dialog
        open={detailsDialog}
        onClose={() => setDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedAnlieferung && selectedLieferant && (
          <>
            <DialogTitle>
              <Typography variant="h6">
                Lieferant: {selectedLieferant.name} {selectedLieferant.vorname ? selectedLieferant.vorname : ''}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>Lieferant-Informationen</Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography><strong>Adresse:</strong> {selectedLieferant.strasse}, {selectedLieferant.plz} {selectedLieferant.ort}</Typography>
                    <Typography><strong>Steuer:</strong> {selectedLieferant.landwirtTyp === 'optierend' ? 'Optierender Landwirt' : 
                      selectedLieferant.landwirtTyp === 'pauschalierend' ? 'Pauschalierender Landwirt' : 'Nicht-Landwirt'}</Typography>
                    <Typography><strong>USt-ID:</strong> {selectedLieferant.ustIdNr || 'Keine'}</Typography>
                    <Typography><strong>Steuer-Nr.:</strong> {selectedLieferant.steuerNr || 'Keine'}</Typography>
                    <Typography><strong>Letzte Prüfung:</strong> {selectedLieferant.letztePruefung || 'Keine'}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>Dokumente & Erklärungen</Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography>Qualitätsvereinbarung:</Typography>
                      <Chip 
                        label={selectedLieferant.qualitaetsvereinbarungVorhanden ? 'Vorhanden' : 'Fehlend'} 
                        color={selectedLieferant.qualitaetsvereinbarungVorhanden ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography>Nachhaltigkeitserklärung:</Typography>
                      <Chip 
                        label={selectedLieferant.nachhaltigkeitsSelbsterklaerungVorhanden ? 'Vorhanden' : 'Fehlend'} 
                        color={selectedLieferant.nachhaltigkeitsSelbsterklaerungVorhanden ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography>Sortenschutzerklärung:</Typography>
                      <Chip 
                        label={selectedLieferant.sortenschutzerklaerungVorhanden ? 'Vorhanden' : 'Fehlend'} 
                        color={selectedLieferant.sortenschutzerklaerungVorhanden ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>Raps-Anlieferungen Ernte {erntejahr}</Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography><strong>Menge nachhaltig:</strong> {selectedAnlieferung.mengeNachhaltig.toLocaleString('de-DE')} kg</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography><strong>Menge nicht nachhaltig:</strong> {selectedAnlieferung.mengeNichtNachhaltig ? selectedAnlieferung.mengeNichtNachhaltig.toLocaleString('de-DE') + ' kg' : 'Keine'}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography><strong>Nachhaltigkeitsdokumente:</strong></Typography>
                        <Chip 
                          label={selectedAnlieferung.nachhaltigkeitsDokumenteVollstaendig ? 'Vollständig' : 'Unvollständig'} 
                          color={selectedAnlieferung.nachhaltigkeitsDokumenteVollstaendig ? 'success' : 'error'}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography><strong>Anlieferungsdatum:</strong> {new Date(selectedAnlieferung.anlieferungsDatum).toLocaleDateString('de-DE')}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button 
                variant="outlined" 
                startIcon={<FileUploadIcon />}
                onClick={() => {
                  setDetailsDialog(false);
                  handleDokumentUploadClick(selectedAnlieferung);
                }}
              >
                Dokumente hochladen
              </Button>
              <Button onClick={() => setDetailsDialog(false)}>Schließen</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Dokument-Upload-Dialog */}
      <Dialog
        open={dokumentDialog}
        onClose={() => setDokumentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedAnlieferung && (
          <>
            <DialogTitle>Dokument hochladen</DialogTitle>
            <DialogContent>
              <Typography gutterBottom>
                Dokument für {selectedAnlieferung.lieferantName} hochladen
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="dokument-typ-label">Dokumenttyp</InputLabel>
                  <Select
                    labelId="dokument-typ-label"
                    value={dokumentTyp}
                    label="Dokumenttyp"
                    onChange={(e) => setDokumentTyp(e.target.value)}
                  >
                    <MenuItem value="nachhaltigkeitserklaerung">Nachhaltigkeitserklärung</MenuItem>
                    <MenuItem value="qualitaetsvereinbarung">Qualitätsvereinbarung</MenuItem>
                    <MenuItem value="sortenschutzerklaerung">Sortenschutzerklärung</MenuItem>
                    <MenuItem value="analysezertifikat">Analysezertifikat</MenuItem>
                    <MenuItem value="sonstig">Sonstiges Dokument</MenuItem>
                  </Select>
                </FormControl>
                
                <Box 
                  sx={{ 
                    border: '1px dashed grey', 
                    p: 2, 
                    textAlign: 'center',
                    mb: 2,
                    bgcolor: 'background.default'
                  }}
                >
                  <input
                    type="file"
                    id="dokument-upload"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        setUploadFile(files[0]);
                      }
                    }}
                  />
                  <label htmlFor="dokument-upload">
                    <Button 
                      component="span" 
                      variant="outlined"
                      startIcon={<FileUploadIcon />}
                    >
                      Datei auswählen
                    </Button>
                  </label>
                  
                  {uploadFile && (
                    <Box mt={2}>
                      <Typography variant="body2">
                        Ausgewählte Datei: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(2)} KB)
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDokumentDialog(false)}>Abbrechen</Button>
              <Button 
                onClick={handleDokumentUpload}
                variant="contained" 
                disabled={!uploadFile}
              >
                Hochladen
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default RapsAnlieferungenUebersicht; 