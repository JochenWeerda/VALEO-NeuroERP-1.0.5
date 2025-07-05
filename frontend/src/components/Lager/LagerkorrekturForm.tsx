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
  Tooltip,
  FormControlLabel,
  Radio,
  RadioGroup
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import de from 'date-fns/locale/de';
import {
  Save,
  Close,
  Info,
  QrCodeScanner,
  Add,
  Remove
} from '@mui/icons-material';
import lagerService, { Lagerort } from '../../services/lagerService';
import artikelService from '../../services/artikelService';

interface LagerkorrekturFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialArtikelId?: string;
  initialLagerortId?: string;
}

interface ArtikelOption {
  id: string;
  artikel_nr: string;
  bezeichnung: string;
  einheit: string;
}

const LagerkorrekturForm: React.FC<LagerkorrekturFormProps> = ({
  onSuccess,
  onCancel,
  initialArtikelId,
  initialLagerortId
}) => {
  // Formular-Daten
  const [artikelId, setArtikelId] = useState<string>(initialArtikelId || '');
  const [artikelOption, setArtikelOption] = useState<ArtikelOption | null>(null);
  const [lagerortId, setLagerortId] = useState<string>(initialLagerortId || '');
  const [korrekturtyp, setKorrekturtyp] = useState<'zugang' | 'abgang'>('zugang');
  const [menge, setMenge] = useState<number | ''>('');
  const [einheit, setEinheit] = useState<string>('');
  const [buchungsdatum, setBuchungsdatum] = useState<Date | null>(new Date());
  const [bemerkung, setBemerkung] = useState<string>('');
  
  // Dropdown-Optionen
  const [artikelOptions, setArtikelOptions] = useState<ArtikelOption[]>([]);
  const [lagerorte, setLagerorte] = useState<Lagerort[]>([]);
  const [artikelSuche, setArtikelSuche] = useState<string>('');
  
  // Aktueller Bestand
  const [aktuellerBestand, setAktuellerBestand] = useState<number | null>(null);
  
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
  
  // Aktuellen Bestand laden, wenn Artikel und Lagerort ausgewählt sind
  useEffect(() => {
    if (artikelId && lagerortId) {
      loadAktuellerBestand();
    } else {
      setAktuellerBestand(null);
    }
  }, [artikelId, lagerortId]);
  
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
  
  const loadAktuellerBestand = async () => {
    try {
      const bestand = await lagerService.getArtikelBestand(artikelId, lagerortId);
      setAktuellerBestand(bestand.menge);
    } catch (error) {
      console.error('Fehler beim Laden des aktuellen Bestands:', error);
      setAktuellerBestand(0);
    }
  };
  
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!artikelId) {
      errors.artikelId = 'Bitte wählen Sie einen Artikel aus.';
    }
    
    if (!lagerortId) {
      errors.lagerortId = 'Bitte wählen Sie einen Lagerort aus.';
    }
    
    if (!menge) {
      errors.menge = 'Bitte geben Sie eine Menge ein.';
    } else if (typeof menge === 'number' && menge <= 0) {
      errors.menge = 'Die Menge muss größer als 0 sein.';
    } else if (korrekturtyp === 'abgang' && aktuellerBestand !== null && typeof menge === 'number' && menge > aktuellerBestand) {
      errors.menge = `Die Menge überschreitet den aktuellen Bestand von ${aktuellerBestand} ${einheit}.`;
    }
    
    if (!buchungsdatum) {
      errors.buchungsdatum = 'Bitte wählen Sie ein Buchungsdatum aus.';
    }
    
    if (!bemerkung) {
      errors.bemerkung = 'Bitte geben Sie einen Grund für die Korrektur an.';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleArtikelChange = (option: ArtikelOption | null) => {
    setArtikelOption(option);
    setArtikelId(option?.id || '');
    setEinheit(option?.einheit || '');
  };
  
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Bei Abgang die Menge negativ machen
      const korrekturMenge = korrekturtyp === 'abgang' ? -(menge as number) : (menge as number);
      
      await lagerService.erstelleLagerkorrektur({
        artikel_id: artikelId,
        lagerort_id: lagerortId,
        menge: korrekturMenge,
        einheit,
        buchungsdatum: buchungsdatum ? buchungsdatum.toISOString().split('T')[0] : undefined,
        bemerkung
      });
      
      setSuccess(true);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Fehler beim Erstellen der Lagerkorrektur:', error);
      setError('Die Lagerkorrektur konnte nicht gespeichert werden. Bitte versuchen Sie es später erneut.');
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
  
  const getNeuerBestand = (): number | null => {
    if (aktuellerBestand === null || menge === '') {
      return null;
    }
    
    return korrekturtyp === 'zugang'
      ? aktuellerBestand + (menge as number)
      : aktuellerBestand - (menge as number);
  };
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2">
            Lagerkorrektur
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
            Die Lagerkorrektur wurde erfolgreich gespeichert.
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
          
          {/* Lagerort */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!formErrors.lagerortId}>
              <InputLabel id="lagerort-label">Lagerort</InputLabel>
              <Select
                labelId="lagerort-label"
                value={lagerortId}
                onChange={(e) => setLagerortId(e.target.value as string)}
                label="Lagerort"
              >
                {lagerorte.map((lagerort) => (
                  <MenuItem key={lagerort.id} value={lagerort.id}>
                    {lagerort.bezeichnung}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.lagerortId && (
                <FormHelperText>{formErrors.lagerortId}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          {/* Korrekturtyp */}
          <Grid item xs={12} md={6}>
            <FormControl component="fieldset">
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Korrekturtyp
              </Typography>
              <RadioGroup
                row
                name="korrekturtyp"
                value={korrekturtyp}
                onChange={(e) => setKorrekturtyp(e.target.value as 'zugang' | 'abgang')}
              >
                <FormControlLabel 
                  value="zugang" 
                  control={<Radio color="success" />} 
                  label={
                    <Box display="flex" alignItems="center">
                      <Add color="success" fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography>Zugang</Typography>
                    </Box>
                  } 
                />
                <FormControlLabel 
                  value="abgang" 
                  control={<Radio color="error" />} 
                  label={
                    <Box display="flex" alignItems="center">
                      <Remove color="error" fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography>Abgang</Typography>
                    </Box>
                  } 
                />
              </RadioGroup>
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
                (aktuellerBestand !== null 
                  ? `Aktueller Bestand: ${aktuellerBestand} ${einheit}` +
                    (getNeuerBestand() !== null 
                      ? ` / Neuer Bestand: ${getNeuerBestand()} ${einheit}`
                      : '')
                  : '')
              }
              InputProps={{
                endAdornment: (
                  <Tooltip title="Aktueller Bestand">
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
          
          {/* Bemerkung */}
          <Grid item xs={12}>
            <TextField
              label="Grund der Korrektur"
              value={bemerkung}
              onChange={(e) => setBemerkung(e.target.value)}
              fullWidth
              multiline
              rows={3}
              required
              error={!!formErrors.bemerkung}
              helperText={formErrors.bemerkung || 'Bitte geben Sie einen Grund für die Korrektur an (z.B. Inventurdifferenz, Bruch, Verderb, Spende)'}
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
            color={korrekturtyp === 'zugang' ? 'primary' : 'error'}
          >
            Korrektur buchen
          </Button>
        </Box>
      </Paper>
      
      {/* Bestätigungsdialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Lagerkorrektur bestätigen</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Möchten Sie folgende Lagerkorrektur buchen?
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
                  Lagerort:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  {getLagerortBezeichnung(lagerortId)}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Korrekturtyp:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color={korrekturtyp === 'zugang' ? 'success.main' : 'error.main'}>
                  {korrekturtyp === 'zugang' ? 'Zugang' : 'Abgang'}
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
                  Aktueller Bestand:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  {aktuellerBestand} {einheit}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Neuer Bestand:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  {getNeuerBestand()} {einheit}
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
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Grund:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  {bemerkung}
                </Typography>
              </Grid>
            </Grid>
          </Box>
          
          <Alert severity="warning" sx={{ mt: 2 }}>
            Achtung: Lagerkorrekturen werden protokolliert und können nicht rückgängig gemacht werden!
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Abbrechen</Button>
          <Button 
            onClick={() => {
              setConfirmDialogOpen(false);
              handleSave();
            }} 
            color={korrekturtyp === 'zugang' ? 'primary' : 'error'}
            autoFocus
          >
            Bestätigen
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default LagerkorrekturForm; 