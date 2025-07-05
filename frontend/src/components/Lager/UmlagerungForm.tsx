import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import de from 'date-fns/locale/de';
import {
  Save,
  Close,
  Info,
  SearchOutlined,
  QrCodeScanner
} from '@mui/icons-material';
import lagerService, { Lagerort } from '../../services/lagerService';
import artikelService from '../../services/artikelService';

interface UmlagerungFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialArtikelId?: string;
  initialVonLagerortId?: string;
  initialNachLagerortId?: string;
}

interface ArtikelOption {
  id: string;
  artikel_nr: string;
  bezeichnung: string;
  einheit: string;
}

const UmlagerungForm: React.FC<UmlagerungFormProps> = ({
  onSuccess,
  onCancel,
  initialArtikelId,
  initialVonLagerortId,
  initialNachLagerortId
}) => {
  // Formular-Daten
  const [artikelId, setArtikelId] = useState<string>(initialArtikelId || '');
  const [artikelOption, setArtikelOption] = useState<ArtikelOption | null>(null);
  const [vonLagerortId, setVonLagerortId] = useState<string>(initialVonLagerortId || '');
  const [nachLagerortId, setNachLagerortId] = useState<string>(initialNachLagerortId || '');
  const [menge, setMenge] = useState<number | ''>('');
  const [einheit, setEinheit] = useState<string>('');
  const [buchungsdatum, setBuchungsdatum] = useState<Date | null>(new Date());
  const [bemerkung, setBemerkung] = useState<string>('');
  const [chargenNr, setChargenNr] = useState<string>('');
  
  // Dropdown-Optionen
  const [artikelOptions, setArtikelOptions] = useState<ArtikelOption[]>([]);
  const [lagerorte, setLagerorte] = useState<Lagerort[]>([]);
  const [artikelSuche, setArtikelSuche] = useState<string>('');
  
  // Verfügbarer Bestand
  const [verfuegbarerBestand, setVerfuegbarerBestand] = useState<number | null>(null);
  
  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  // Daten beim Laden der Komponente initialisieren
  useEffect(() => {
    loadLagerorte();
    
    if (initialArtikelId) {
      loadArtikelDetails(initialArtikelId);
    }
  }, [initialArtikelId]);
  
  // Ladeorte laden
  const loadLagerorte = async () => {
    try {
      const data = await lagerService.getLagerorte();
      setLagerorte(data);
    } catch (error) {
      console.error('Fehler beim Laden der Lagerorte:', error);
      setError('Die Lagerorte konnten nicht geladen werden.');
    }
  };
  
  // Artikel suchen
  useEffect(() => {
    if (artikelSuche && artikelSuche.length >= 3) {
      searchArtikel(artikelSuche);
    }
  }, [artikelSuche]);
  
  // Verfügbaren Bestand laden, wenn Artikel und Lagerort ausgewählt sind
  useEffect(() => {
    if (artikelId && vonLagerortId) {
      loadVerfuegbarerBestand();
    } else {
      setVerfuegbarerBestand(null);
    }
  }, [artikelId, vonLagerortId]);
  
  const searchArtikel = async (suchbegriff: string) => {
    try {
      // Hier wird die Artikelsuche vom Backend aufgerufen
      const response = await artikelService.searchArtikel(suchbegriff);
      
      // Formatieren der Antwort für die Autocomplete-Komponente
      const options: ArtikelOption[] = response.map((artikel: any) => ({
        id: artikel.id,
        artikel_nr: artikel.artikelNr,
        bezeichnung: artikel.bezeichnung,
        einheit: artikel.einheit || 'Stk'
      }));
      
      setArtikelOptions(options);
    } catch (error) {
      console.error('Fehler bei der Artikelsuche:', error);
    }
  };
  
  const loadArtikelDetails = async (id: string) => {
    try {
      const artikel = await artikelService.getArtikel(id);
      
      setArtikelOption({
        id: artikel.id,
        artikel_nr: artikel.artikelNr,
        bezeichnung: artikel.bezeichnung,
        einheit: artikel.einheit || 'Stk'
      });
      
      setArtikelId(artikel.id);
      setEinheit(artikel.einheit || 'Stk');
    } catch (error) {
      console.error('Fehler beim Laden der Artikeldetails:', error);
    }
  };
  
  const loadVerfuegbarerBestand = async () => {
    try {
      const bestand = await lagerService.getArtikelBestand(artikelId, vonLagerortId);
      setVerfuegbarerBestand(bestand.verfuegbar);
    } catch (error) {
      console.error('Fehler beim Laden des verfügbaren Bestands:', error);
      setVerfuegbarerBestand(0);
    }
  };
  
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!artikelId) {
      errors.artikelId = 'Bitte wählen Sie einen Artikel aus.';
    }
    
    if (!vonLagerortId) {
      errors.vonLagerortId = 'Bitte wählen Sie den Quelllagerort aus.';
    }
    
    if (!nachLagerortId) {
      errors.nachLagerortId = 'Bitte wählen Sie den Ziellagerort aus.';
    }
    
    if (vonLagerortId === nachLagerortId) {
      errors.nachLagerortId = 'Quell- und Ziellagerort dürfen nicht identisch sein.';
    }
    
    if (!menge) {
      errors.menge = 'Bitte geben Sie eine Menge ein.';
    } else if (typeof menge === 'number' && menge <= 0) {
      errors.menge = 'Die Menge muss größer als 0 sein.';
    } else if (verfuegbarerBestand !== null && typeof menge === 'number' && menge > verfuegbarerBestand) {
      errors.menge = `Die Menge überschreitet den verfügbaren Bestand von ${verfuegbarerBestand} ${einheit}.`;
    }
    
    if (!buchungsdatum) {
      errors.buchungsdatum = 'Bitte wählen Sie ein Buchungsdatum aus.';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleArtikelChange = (option: ArtikelOption | null) => {
    setArtikelOption(option);
    setArtikelId(option?.id || '');
    setEinheit(option?.einheit || '');
  };
  
  const handleLagerortChange = (field: 'von' | 'nach', id: string) => {
    if (field === 'von') {
      setVonLagerortId(id);
    } else {
      setNachLagerortId(id);
    }
  };
  
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await lagerService.erstelleUmlagerung({
        artikel_id: artikelId,
        menge: menge as number,
        einheit,
        von_lagerort_id: vonLagerortId,
        nach_lagerort_id: nachLagerortId,
        chargen_nr: chargenNr || undefined,
        buchungsdatum: buchungsdatum ? buchungsdatum.toISOString().split('T')[0] : undefined,
        bemerkung: bemerkung || undefined
      });
      
      setSuccess(true);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Fehler beim Erstellen der Umlagerung:', error);
      setError('Die Umlagerung konnte nicht gespeichert werden. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleConfirm = () => {
    setConfirmDialogOpen(true);
  };
  
  const getLagerortBezeichnung = (id: string): string => {
    const lagerort = lagerorte.find(l => l.id === id);
    return lagerort ? lagerort.bezeichnung : '';
  };
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2">
            Lager zu Lager Bewegung (Umlagerung)
          </Typography>
          
          <Box>
            <Tooltip title="Abbrechen">
              <IconButton onClick={onCancel}>
                <Close />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {success ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Die Umlagerung wurde erfolgreich gespeichert.
          </Alert>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}
        
        <Grid container spacing={3}>
          {/* Artikel */}
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={artikelOptions}
              value={artikelOption}
              onChange={(event, newValue) => handleArtikelChange(newValue)}
              getOptionLabel={(option) => `${option.artikel_nr} - ${option.bezeichnung}`}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onInputChange={(event, newInputValue) => setArtikelSuche(newInputValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Artikel"
                  fullWidth
                  error={!!formErrors.artikelId}
                  helperText={formErrors.artikelId}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {params.InputProps.endAdornment}
                        <Tooltip title="Artikel scannen">
                          <IconButton size="small">
                            <QrCodeScanner />
                          </IconButton>
                        </Tooltip>
                      </>
                    )
                  }}
                />
              )}
            />
          </Grid>
          
          {/* Einheit */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Einheit"
              value={einheit}
              onChange={(e) => setEinheit(e.target.value)}
              fullWidth
              disabled
            />
          </Grid>
          
          {/* Von Lagerort */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!formErrors.vonLagerortId}>
              <InputLabel id="von-lagerort-label">Von Lagerort</InputLabel>
              <Select
                labelId="von-lagerort-label"
                value={vonLagerortId}
                onChange={(e) => handleLagerortChange('von', e.target.value as string)}
                label="Von Lagerort"
              >
                {lagerorte.map((lagerort) => (
                  <MenuItem key={lagerort.id} value={lagerort.id}>
                    {lagerort.bezeichnung}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.vonLagerortId && (
                <FormHelperText>{formErrors.vonLagerortId}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          {/* Nach Lagerort */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!formErrors.nachLagerortId}>
              <InputLabel id="nach-lagerort-label">Nach Lagerort</InputLabel>
              <Select
                labelId="nach-lagerort-label"
                value={nachLagerortId}
                onChange={(e) => handleLagerortChange('nach', e.target.value as string)}
                label="Nach Lagerort"
              >
                {lagerorte.map((lagerort) => (
                  <MenuItem key={lagerort.id} value={lagerort.id}>
                    {lagerort.bezeichnung}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.nachLagerortId && (
                <FormHelperText>{formErrors.nachLagerortId}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          {/* Menge */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Menge"
              type="number"
              value={menge}
              onChange={(e) => setMenge(e.target.value === '' ? '' : Number(e.target.value))}
              fullWidth
              error={!!formErrors.menge}
              helperText={
                formErrors.menge || 
                (verfuegbarerBestand !== null 
                  ? `Verfügbarer Bestand: ${verfuegbarerBestand} ${einheit}`
                  : '')
              }
              InputProps={{
                endAdornment: (
                  <Tooltip title="Verfügbarer Bestand">
                    <IconButton size="small">
                      <Info />
                    </IconButton>
                  </Tooltip>
                ),
              }}
            />
          </Grid>
          
          {/* Buchungsdatum */}
          <Grid item xs={12} md={6}>
            <DatePicker
              label="Buchungsdatum"
              value={buchungsdatum}
              onChange={(newValue) => setBuchungsdatum(newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!formErrors.buchungsdatum,
                  helperText: formErrors.buchungsdatum,
                },
              }}
            />
          </Grid>
          
          {/* Chargen-Nr. */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Chargen-Nr."
              value={chargenNr}
              onChange={(e) => setChargenNr(e.target.value)}
              fullWidth
              placeholder="Optional"
            />
          </Grid>
          
          {/* Bemerkung */}
          <Grid item xs={12}>
            <TextField
              label="Bemerkung"
              value={bemerkung}
              onChange={(e) => setBemerkung(e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="Optional"
            />
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={onCancel}
            sx={{ mr: 2 }}
            disabled={isLoading}
          >
            Abbrechen
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
            startIcon={isLoading ? <CircularProgress size={20} /> : <Save />}
            disabled={isLoading}
          >
            Umlagerung buchen
          </Button>
        </Box>
      </Paper>
      
      {/* Bestätigungsdialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Umlagerung bestätigen</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Möchten Sie folgende Umlagerung buchen?
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Artikel:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  {artikelOption?.artikel_nr} - {artikelOption?.bezeichnung}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Von Lagerort:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  {getLagerortBezeichnung(vonLagerortId)}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Nach Lagerort:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  {getLagerortBezeichnung(nachLagerortId)}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Menge:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  {menge} {einheit}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Buchungsdatum:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  {buchungsdatum?.toLocaleDateString('de-DE')}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={() => {
            setConfirmDialogOpen(false);
            handleSave();
          }} autoFocus>
            Bestätigen
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default UmlagerungForm; 