import React, { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  Grid,
  Typography,
  TextField,
  Button,
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import de from 'date-fns/locale/de';
import InventoryIcon from '@mui/icons-material/Inventory';
import PositionenTabelle, { Position } from '../BelegeFormular/PositionenTabelle';
import StatusBadge from '../BelegeFormular/StatusBadge';
import belegService from '../../services/belegService';
import warenausgangService from '../../services/warenausgangService';
import lagerService from '../../services/lagerService';
import { BelegStatus } from '../../types/belegTypes';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ChargenAuswahlDialog, { SelectedCharge } from '../BelegeFormular/ChargenAuswahlDialog';

interface Warenausgang {
  id?: string;
  nummer?: string;
  datum: string;
  kundeId?: string;
  kundenName?: string;
  kundenNummer?: string;
  lieferscheinId?: string;
  lieferscheinNummer?: string;
  lagerortId: string;
  lagerortBezeichnung?: string;
  positionen: Position[];
  status: BelegStatus;
  bemerkung?: string;
  historie?: { datum: string; status: string; benutzer: string; bemerkung?: string }[];
}

const initialWarenausgang: Warenausgang = {
  datum: new Date().toISOString().split('T')[0],
  lagerortId: '',
  positionen: [],
  status: 'entwurf'
};

interface WarenausgangFormularProps {
  readOnly?: boolean;
  editMode?: boolean;
  onSave?: (warenausgang: Warenausgang) => void;
  onStatusChange?: (warenausgang: Warenausgang, neuerStatus: BelegStatus) => void;
}

const WarenausgangFormular: React.FC<WarenausgangFormularProps> = ({
  readOnly = false,
  editMode = false,
  onSave,
  onStatusChange
}) => {
  const [warenausgang, setWarenausgang] = useState<Warenausgang>(initialWarenausgang);
  const [kunden, setKunden] = useState<any[]>([]);
  const [kundenLoading, setKundenLoading] = useState<boolean>(false);
  const [kundenSuche, setKundenSuche] = useState<string>('');
  const [lieferscheine, setLieferscheine] = useState<any[]>([]);
  const [lieferscheineLoading, setLieferscheineLoading] = useState<boolean>(false);
  const [lagerorte, setLagerorte] = useState<any[]>([]);
  const [lagerorteLoading, setLagerorteLoading] = useState<boolean>(false);
  const [lagerortSuche, setLagerortSuche] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showChargenDialog, setShowChargenDialog] = useState<boolean>(false);
  const [selectedPositionIndex, setSelectedPositionIndex] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Warenausgang laden
  useEffect(() => {
    if (id && id !== 'neu') {
      const loadWarenausgang = async () => {
        try {
          const result = await warenausgangService.getWarenausgang(id);
          setWarenausgang(result);
        } catch (error) {
          setErrorMessage('Fehler beim Laden des Warenausgangs');
        }
      };
      loadWarenausgang();
    } else if (location.state && (location.state as any).lieferscheinId) {
      // Neuer Warenausgang aus Lieferschein erstellen
      const loadLieferschein = async () => {
        try {
          const lieferscheinId = (location.state as any).lieferscheinId;
          const lieferschein = await belegService.getLieferschein(lieferscheinId);
          
          setWarenausgang({
            ...initialWarenausgang,
            lieferscheinId: lieferscheinId,
            lieferscheinNummer: lieferschein.nummer,
            kundeId: lieferschein.kundeId,
            kundenName: lieferschein.kundenName,
            kundenNummer: lieferschein.kundenNummer,
            positionen: lieferschein.positionen.map(p => ({ ...p })) // Kopieren der Positionen
          });
        } catch (error) {
          setErrorMessage('Fehler beim Laden des Lieferscheins');
        }
      };
      loadLieferschein();
    }
  }, [id, location.state]);

  // Lagerorte laden
  useEffect(() => {
    const loadLagerorte = async () => {
      setLagerorteLoading(true);
      try {
        const result = await lagerService.getLagerorte();
        setLagerorte(result);
      } catch (error) {
        setErrorMessage('Fehler beim Laden der Lagerorte');
      } finally {
        setLagerorteLoading(false);
      }
    };
    
    loadLagerorte();
  }, []);

  // Kunden suchen
  useEffect(() => {
    if (kundenSuche) {
      const searchKunden = async () => {
        setKundenLoading(true);
        try {
          const result = await belegService.searchKunden(kundenSuche);
          setKunden(result);
        } catch (error) {
          setErrorMessage('Fehler bei der Kundensuche');
        } finally {
          setKundenLoading(false);
        }
      };
      
      const timeoutId = setTimeout(() => {
        searchKunden();
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [kundenSuche]);

  // Lieferscheine für einen Kunden laden
  useEffect(() => {
    if (warenausgang.kundeId) {
      const loadLieferscheine = async () => {
        setLieferscheineLoading(true);
        try {
          const result = await belegService.getLieferscheineForKunde(warenausgang.kundeId);
          // Nur freigegebene Lieferscheine anzeigen
          setLieferscheine(result.filter(ls => ls.status === 'freigegeben'));
        } catch (error) {
          setErrorMessage('Fehler beim Laden der Lieferscheine');
        } finally {
          setLieferscheineLoading(false);
        }
      };
      
      loadLieferscheine();
    }
  }, [warenausgang.kundeId]);

  // Artikelsuche Callback für die PositionenTabelle
  const handleArtikelSearch = useCallback(async (suchbegriff: string) => {
    try {
      return await belegService.searchArtikel(suchbegriff);
    } catch (error) {
      setErrorMessage('Fehler bei der Artikelsuche');
      return [];
    }
  }, []);

  // Einheitensuche Callback für die PositionenTabelle
  const handleEinheitenSearch = useCallback(async (suchbegriff: string) => {
    try {
      return await belegService.getEinheiten();
    } catch (error) {
      setErrorMessage('Fehler beim Laden der Einheiten');
      return [];
    }
  }, []);

  // Änderung der Warenausgangsdaten
  const handleChange = (field: keyof Warenausgang, value: any) => {
    setWarenausgang(prev => ({ ...prev, [field]: value }));
  };

  // Lagerort auswählen
  const handleLagerortSelect = (lagerortId: string, bezeichnung: string) => {
    setWarenausgang(prev => ({
      ...prev,
      lagerortId,
      lagerortBezeichnung: bezeichnung
    }));
  };

  // Änderung der Positionen
  const handlePositionenChange = (positionen: Position[]) => {
    setWarenausgang(prev => ({ ...prev, positionen }));
  };

  // Hinzufügen einer Position
  const handlePositionAdd = (position: Position) => {
    // Hier könnten zusätzliche Validierungen oder Verarbeitungen erfolgen
  };

  // Löschen einer Position
  const handlePositionDelete = (positionId: string) => {
    // Hier könnten zusätzliche Validierungen oder Verarbeitungen erfolgen
  };

  // Speichern des Warenausgangs
  const handleSave = async () => {
    try {
      // Validierung durchführen
      const errors = validateWarenausgang();
      if (errors.length > 0) {
        setValidationErrors(errors);
        return;
      }
      
      let result;
      if (warenausgang.id) {
        result = await warenausgangService.updateWarenausgang(warenausgang.id, warenausgang);
      } else {
        result = await warenausgangService.createWarenausgang(warenausgang);
      }
      
      if (onSave) {
        onSave(result);
      }
      
      setSuccessMessage('Warenausgang erfolgreich gespeichert');
      
      if (!warenausgang.id) {
        // Bei einem neuen Warenausgang zur Detailansicht navigieren
        navigate(`/warenausgang/${result.id}`);
      }
    } catch (error) {
      setErrorMessage('Fehler beim Speichern des Warenausgangs');
    }
  };

  // Validieren des Warenausgangs
  const validateWarenausgang = (): string[] => {
    const errors: string[] = [];
    
    if (!warenausgang.lagerortId) {
      errors.push('Bitte wählen Sie einen Lagerort aus');
    }
    
    if (warenausgang.positionen.length === 0) {
      errors.push('Der Warenausgang muss mindestens eine Position enthalten');
    }
    
    // Prüfen, ob alle chargenpflichtigen Artikel auch Chargen zugewiesen haben
    warenausgang.positionen.forEach((position, index) => {
      if (isChargenRequired(position.artikelTyp) && (!position.chargennummern || position.chargennummern.length === 0)) {
        errors.push(`Position ${index + 1} (${position.artikelBezeichnung}) benötigt eine Chargenzuweisung`);
      }
    });
    
    return errors;
  };

  // Statusänderung des Warenausgangs
  const handleStatusChange = async (neuerStatus: BelegStatus) => {
    try {
      // Bei Statusänderung zu "gebucht" validieren
      if (neuerStatus === 'gebucht') {
        const errors = validateWarenausgang();
        if (errors.length > 0) {
          setValidationErrors(errors);
          return;
        }
      }
      
      const updatedWarenausgang = { ...warenausgang, status: neuerStatus };
      let result;
      
      if (warenausgang.id) {
        result = await warenausgangService.updateWarenausgangStatus(warenausgang.id, neuerStatus);
      } else {
        // Wenn der Warenausgang noch nicht gespeichert wurde, zuerst speichern
        result = await warenausgangService.createWarenausgang(updatedWarenausgang);
      }
      
      setWarenausgang(result);
      
      if (onStatusChange) {
        onStatusChange(result, neuerStatus);
      }
      
      // Bei "gebucht" zusätzlich die Lagerbuchungen durchführen
      if (neuerStatus === 'gebucht') {
        await warenausgangService.bucheLagerausgang(result.id);
        setSuccessMessage('Warenausgang wurde erfolgreich gebucht und Lagerbestände aktualisiert');
      } else {
        setSuccessMessage(`Status erfolgreich auf "${neuerStatus}" geändert`);
      }
      
      if (!warenausgang.id) {
        // Bei einem neuen Warenausgang zur Detailansicht navigieren
        navigate(`/warenausgang/${result.id}`);
      }
    } catch (error) {
      setErrorMessage('Fehler bei der Statusänderung');
    }
  };

  // Lieferschein auswählen und Positionen übernehmen
  const handleLieferscheinSelect = async (lieferscheinId: string) => {
    try {
      const lieferschein = await belegService.getLieferschein(lieferscheinId);
      
      setWarenausgang(prev => ({
        ...prev,
        lieferscheinId: lieferscheinId,
        lieferscheinNummer: lieferschein.nummer,
        positionen: lieferschein.positionen.map(p => ({ ...p })) // Kopieren der Positionen
      }));
    } catch (error) {
      setErrorMessage('Fehler beim Laden des Lieferscheins');
    }
  };

  // Öffnen des Chargen-Dialogs für eine Position
  const handleChargenDialog = (index: number) => {
    if (!warenausgang.lagerortId) {
      setErrorMessage('Bitte wählen Sie zuerst einen Lagerort aus');
      return;
    }
    
    setSelectedPositionIndex(index);
    setShowChargenDialog(true);
  };

  // Anwenden der ausgewählten Chargen
  const handleApplyChargen = (selectedCharges: SelectedCharge[]) => {
    if (selectedPositionIndex !== null && selectedCharges.length > 0) {
      const updatedPositionen = [...warenausgang.positionen];
      
      // Aktualisiere die Position mit den ausgewählten Chargen
      updatedPositionen[selectedPositionIndex] = {
        ...updatedPositionen[selectedPositionIndex],
        chargennummern: selectedCharges.map(c => c.chargennummer),
        mhd: selectedCharges[0].mhd,
        lagerplatz: selectedCharges[0].lagerplatz
      };
      
      setWarenausgang(prev => ({ ...prev, positionen: updatedPositionen }));
      setShowChargenDialog(false);
      setSelectedPositionIndex(null);
    }
  };

  // Prüfen, ob ein Artikel chargenpflichtig ist
  const isChargenRequired = useCallback((artikelTyp?: string) => {
    return ['FUTTERMITTEL', 'SAATGUT', 'DÜNGEMITTEL', 'PFLANZENSCHUTZ'].includes(artikelTyp || '');
  }, []);

  return (
    <Paper sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Header mit Titel und Status */}
        <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">
            {id && id !== 'neu' ? 'Warenausgang bearbeiten' : 'Neuer Warenausgang'}
          </Typography>
          {warenausgang.nummer && (
            <Typography variant="h6">
              Warenausgang-Nr: {warenausgang.nummer}
            </Typography>
          )}
          {warenausgang.status && (
            <StatusBadge status={warenausgang.status} />
          )}
        </Grid>

        {/* Basisdaten */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
                <DatePicker
                  label="Datum"
                  value={warenausgang.datum ? new Date(warenausgang.datum) : null}
                  onChange={(newValue) => handleChange('datum', newValue?.toISOString().split('T')[0] || '')}
                  disabled={readOnly}
                  slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12}>
              <Autocomplete
                options={kunden}
                getOptionLabel={(option) => `${option.name} (${option.kundennummer})`}
                loading={kundenLoading}
                value={kunden.find(k => k.id === warenausgang.kundeId) || null}
                onChange={(_, value) => {
                  if (value) {
                    handleChange('kundeId', value.id);
                    handleChange('kundenName', value.name);
                    handleChange('kundenNummer', value.kundennummer);
                    // Wenn sich der Kunde ändert, müssen wir den Lieferschein zurücksetzen
                    handleChange('lieferscheinId', undefined);
                    handleChange('lieferscheinNummer', undefined);
                  }
                }}
                onInputChange={(_, value) => setKundenSuche(value)}
                disabled={readOnly || (!!warenausgang.lieferscheinId && !!warenausgang.kundeId)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Kunde" 
                    variant="outlined" 
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {kundenLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Autocomplete
                options={lieferscheine}
                getOptionLabel={(option) => `${option.nummer} (${new Date(option.datum).toLocaleDateString('de-DE')})`}
                loading={lieferscheineLoading}
                value={lieferscheine.find(l => l.id === warenausgang.lieferscheinId) || null}
                onChange={(_, value) => {
                  if (value) {
                    handleLieferscheinSelect(value.id);
                  }
                }}
                disabled={readOnly || !warenausgang.kundeId}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Lieferschein" 
                    variant="outlined" 
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {lieferscheineLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Lager */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Autocomplete
                options={lagerorte}
                getOptionLabel={(option) => option.bezeichnung}
                loading={lagerorteLoading}
                value={lagerorte.find(l => l.id === warenausgang.lagerortId) || null}
                onChange={(_, value) => {
                  if (value) {
                    handleLagerortSelect(value.id, value.bezeichnung);
                  }
                }}
                disabled={readOnly || warenausgang.status === 'gebucht'}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Lagerort" 
                    variant="outlined" 
                    fullWidth
                    required
                    error={!warenausgang.lagerortId}
                    helperText={!warenausgang.lagerortId ? "Lagerort ist erforderlich" : ""}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {lagerorteLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Grid>
        
        {/* Bemerkung */}
        <Grid item xs={12}>
          <TextField
            label="Bemerkung"
            multiline
            rows={2}
            fullWidth
            variant="outlined"
            value={warenausgang.bemerkung || ''}
            onChange={(e) => handleChange('bemerkung', e.target.value)}
            disabled={readOnly}
          />
        </Grid>
        
        {/* Positionen */}
        <Grid item xs={12}>
          <Box mt={3}>
            <PositionenTabelle
              positionen={warenausgang.positionen}
              onPositionenChange={handlePositionenChange}
              onArtikelSearch={handleArtikelSearch}
              onEinheitenSearch={handleEinheitenSearch}
              readOnly={readOnly || warenausgang.status === 'gebucht'}
              onPositionAdd={handlePositionAdd}
              onPositionDelete={handlePositionDelete}
              disableArtikelAenderung={!!warenausgang.lieferscheinId} // Wenn aus Lieferschein, keine Artikeländerung
              disableMengenAenderung={warenausgang.status === 'gebucht'} // Keine Mengenänderung, wenn bereits gebucht
              showRabatt={false}
              showMwst={false}
            />
          </Box>
        </Grid>
        
        {/* Chargen-Button für chargenpflichtige Positionen */}
        {warenausgang.positionen.length > 0 && (
          <Grid item xs={12}>
            <Box mt={2}>
              <Typography variant="subtitle1" gutterBottom>
                Chargenverwaltung
              </Typography>
              <Grid container spacing={2}>
                {warenausgang.positionen.map((position, index) => (
                  isChargenRequired(position.artikelTyp) && (
                    <Grid item key={index}>
                      <Button
                        variant="outlined"
                        color={position.chargennummern?.length ? "success" : "primary"}
                        onClick={() => handleChargenDialog(index)}
                        startIcon={
                          <Badge 
                            badgeContent={position.chargennummern?.length || 0} 
                            color={position.chargennummern?.length ? "success" : "error"}
                          >
                            <InventoryIcon />
                          </Badge>
                        }
                        disabled={readOnly || warenausgang.status === 'gebucht'}
                      >
                        Chargen für {position.artikelBezeichnung}
                      </Button>
                    </Grid>
                  )
                ))}
              </Grid>
            </Box>
          </Grid>
        )}

        {/* Historie, nur für bestehende Warenausgänge */}
        {id && id !== 'neu' && warenausgang.historie && (
          <>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Historie</Typography>
              <Box>
                {warenausgang.historie.map((eintrag, index) => (
                  <Box key={index} mb={1}>
                    <Typography variant="body2">
                      {new Date(eintrag.datum).toLocaleString('de-DE')} - {eintrag.status} - {eintrag.benutzer}
                      {eintrag.bemerkung && ` - ${eintrag.bemerkung}`}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
          </>
        )}
        
        {/* Aktionen */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" mt={3}>
            <Box>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate('/warenausgang')}
                sx={{ mr: 1 }}
              >
                Zurück
              </Button>
              
              {!readOnly && warenausgang.status !== 'gebucht' && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                  disabled={!warenausgang.lagerortId || warenausgang.positionen.length === 0}
                  sx={{ mr: 1 }}
                >
                  Speichern
                </Button>
              )}
            </Box>
            
            {/* Statusaktionen */}
            {warenausgang.status && (
              <Box>
                {warenausgang.status === 'entwurf' && (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleStatusChange('gebucht')}
                    disabled={readOnly || !warenausgang.lagerortId || warenausgang.positionen.length === 0}
                  >
                    Buchen
                  </Button>
                )}
                
                {warenausgang.status === 'gebucht' && (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleStatusChange('storniert')}
                    disabled={readOnly}
                  >
                    Stornieren
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </Grid>
        
        {/* Validierungsfehler */}
        {validationErrors.length > 0 && (
          <Grid item xs={12}>
            <Alert severity="error" sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Bitte korrigieren Sie folgende Fehler:</Typography>
              <ul>
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          </Grid>
        )}
      </Grid>
      
      {/* Snackbar für Erfolgs- und Fehlermeldungen */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
      >
        <Alert severity="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage(null)}
      >
        <Alert severity="error" onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      </Snackbar>

      {/* Chargen-Dialog */}
      {selectedPositionIndex !== null && (
        <ChargenAuswahlDialog
          open={showChargenDialog}
          onClose={() => setShowChargenDialog(false)}
          onConfirm={handleApplyChargen}
          artikelId={warenausgang.positionen[selectedPositionIndex]?.artikelId || ''}
          artikelBezeichnung={warenausgang.positionen[selectedPositionIndex]?.artikelBezeichnung || ''}
          benötigteMenge={warenausgang.positionen[selectedPositionIndex]?.menge || 0}
          buchungsregel={warenausgang.positionen[selectedPositionIndex]?.buchungsregel}
          lagerplatz={warenausgang.lagerortId}
        />
      )}
    </Paper>
  );
};

export default WarenausgangFormular; 