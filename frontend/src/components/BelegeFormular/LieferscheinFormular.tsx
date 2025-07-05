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
  MenuItem
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import de from 'date-fns/locale/de';
import PositionenTabelle, { Position } from './PositionenTabelle';
import BelegHistorie from './BelegHistorie';
import StatusBadge from './StatusBadge';
import belegService from '../../services/belegService';
import { BelegStatus } from '../../types/belegTypes';
import BelegketteVisualisierung from './BelegketteVisualisierung';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ChargenAuswahlDialog, { SelectedCharge } from './ChargenAuswahlDialog';

interface Lieferschein {
  id?: string;
  nummer?: string;
  datum: string;
  kundeId: string;
  kundenName?: string;
  kundenNummer?: string;
  auftragsnummer?: string;
  auftragId?: string;
  positionen: Position[];
  status: BelegStatus;
  bemerkung?: string;
  lieferdatum?: string;
  versandart?: string;
  frachtkosten?: number;
  historie?: { datum: string; status: string; benutzer: string; bemerkung?: string }[];
}

const initialLieferschein: Lieferschein = {
  datum: new Date().toISOString().split('T')[0],
  kundeId: '',
  positionen: [],
  status: 'entwurf',
  lieferdatum: new Date().toISOString().split('T')[0]
};

const versandarten = [
  { value: 'eigene_lieferung', label: 'Eigene Lieferung' },
  { value: 'spedition', label: 'Spedition' },
  { value: 'abholung', label: 'Abholung durch Kunden' },
  { value: 'paketdienst', label: 'Paketdienst' }
];

interface LieferscheinFormularProps {
  readOnly?: boolean;
  editMode?: boolean;
  onSave?: (lieferschein: Lieferschein) => void;
  onStatusChange?: (lieferschein: Lieferschein, neuerStatus: BelegStatus) => void;
}

const LieferscheinFormular: React.FC<LieferscheinFormularProps> = ({
  readOnly = false,
  editMode = false,
  onSave,
  onStatusChange
}) => {
  const [lieferschein, setLieferschein] = useState<Lieferschein>(initialLieferschein);
  const [kunden, setKunden] = useState<any[]>([]);
  const [kundenLoading, setKundenLoading] = useState<boolean>(false);
  const [kundenSuche, setKundenSuche] = useState<string>('');
  const [auftraege, setAuftraege] = useState<any[]>([]);
  const [auftraegeLoading, setAuftraegeLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showChargenDialog, setShowChargenDialog] = useState<boolean>(false);
  const [selectedPositionIndex, setSelectedPositionIndex] = useState<number | null>(null);

  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Lieferschein laden
  useEffect(() => {
    if (id && id !== 'neu') {
      const loadLieferschein = async () => {
        try {
          const result = await belegService.getLieferschein(id);
          setLieferschein(result);
        } catch (error) {
          setErrorMessage('Fehler beim Laden des Lieferscheins');
        }
      };
      loadLieferschein();
    } else if (location.state && (location.state as any).auftragId) {
      // Neuer Lieferschein aus Auftrag erstellen
      const loadAuftrag = async () => {
        try {
          const auftragId = (location.state as any).auftragId;
          const auftrag = await belegService.getAuftrag(auftragId);
          
          setLieferschein({
            ...initialLieferschein,
            auftragId: auftragId,
            auftragsnummer: auftrag.nummer,
            kundeId: auftrag.kundeId,
            kundenName: auftrag.kundenName,
            kundenNummer: auftrag.kundenNummer,
            positionen: auftrag.positionen.map(p => ({ ...p })) // Kopieren der Positionen
          });
        } catch (error) {
          setErrorMessage('Fehler beim Laden des Auftrags');
        }
      };
      loadAuftrag();
    }
  }, [id, location.state]);

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

  // Aufträge für einen Kunden laden
  useEffect(() => {
    if (lieferschein.kundeId) {
      const loadAuftraege = async () => {
        setAuftraegeLoading(true);
        try {
          const result = await belegService.getAuftraegeForKunde(lieferschein.kundeId);
          setAuftraege(result);
        } catch (error) {
          setErrorMessage('Fehler beim Laden der Aufträge');
        } finally {
          setAuftraegeLoading(false);
        }
      };
      
      loadAuftraege();
    }
  }, [lieferschein.kundeId]);

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

  // Änderung der Lieferscheindaten
  const handleChange = (field: keyof Lieferschein, value: any) => {
    setLieferschein(prev => ({ ...prev, [field]: value }));
  };

  // Änderung der Positionen
  const handlePositionenChange = (positionen: Position[]) => {
    setLieferschein(prev => ({ ...prev, positionen }));
  };

  // Hinzufügen einer Position
  const handlePositionAdd = (position: Position) => {
    // Hier könnten zusätzliche Validierungen oder Verarbeitungen erfolgen
  };

  // Löschen einer Position
  const handlePositionDelete = (positionId: string) => {
    // Hier könnten zusätzliche Validierungen oder Verarbeitungen erfolgen
  };

  // Speichern des Lieferscheins
  const handleSave = async () => {
    try {
      let result;
      if (lieferschein.id) {
        result = await belegService.updateLieferschein(lieferschein.id, lieferschein);
      } else {
        result = await belegService.createLieferschein(lieferschein);
      }
      
      if (onSave) {
        onSave(result);
      }
      
      setSuccessMessage('Lieferschein erfolgreich gespeichert');
      
      if (!lieferschein.id) {
        // Bei einem neuen Lieferschein zur Detailansicht navigieren
        navigate(`/lieferscheine/${result.id}`);
      }
    } catch (error) {
      setErrorMessage('Fehler beim Speichern des Lieferscheins');
    }
  };

  // Statusänderung des Lieferscheins
  const handleStatusChange = async (neuerStatus: BelegStatus) => {
    try {
      const updatedLieferschein = { ...lieferschein, status: neuerStatus };
      let result;
      
      if (lieferschein.id) {
        result = await belegService.updateLieferscheinStatus(lieferschein.id, neuerStatus);
      } else {
        // Wenn der Lieferschein noch nicht gespeichert wurde, zuerst speichern
        result = await belegService.createLieferschein(updatedLieferschein);
      }
      
      setLieferschein(result);
      
      if (onStatusChange) {
        onStatusChange(result, neuerStatus);
      }
      
      setSuccessMessage(`Status erfolgreich auf "${neuerStatus}" geändert`);
      
      if (!lieferschein.id) {
        // Bei einem neuen Lieferschein zur Detailansicht navigieren
        navigate(`/lieferscheine/${result.id}`);
      }
    } catch (error) {
      setErrorMessage('Fehler bei der Statusänderung');
    }
  };

  // Auftrag auswählen und Positionen übernehmen
  const handleAuftragSelect = async (auftragId: string) => {
    try {
      const auftrag = await belegService.getAuftrag(auftragId);
      
      setLieferschein(prev => ({
        ...prev,
        auftragId: auftragId,
        auftragsnummer: auftrag.nummer,
        positionen: auftrag.positionen.map(p => ({ ...p })) // Kopieren der Positionen
      }));
    } catch (error) {
      setErrorMessage('Fehler beim Laden des Auftrags');
    }
  };

  // Öffnen des Chargen-Dialogs für eine Position
  const handleChargenDialog = (index: number) => {
    setSelectedPositionIndex(index);
    setShowChargenDialog(true);
  };

  // Anwenden der ausgewählten Chargen
  const handleApplyChargen = (selectedCharges: SelectedCharge[]) => {
    if (selectedPositionIndex !== null && selectedCharges.length > 0) {
      const updatedPositionen = [...lieferschein.positionen];
      
      // Aktualisiere die Position mit den ausgewählten Chargen
      updatedPositionen[selectedPositionIndex] = {
        ...updatedPositionen[selectedPositionIndex],
        chargennummern: selectedCharges.map(c => c.chargennummer),
        mhd: selectedCharges[0].mhd,
        lagerplatz: selectedCharges[0].lagerplatz
      };
      
      setLieferschein(prev => ({ ...prev, positionen: updatedPositionen }));
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
            {id && id !== 'neu' ? 'Lieferschein bearbeiten' : 'Neuer Lieferschein'}
          </Typography>
          {lieferschein.nummer && (
            <Typography variant="h6">
              Lieferschein-Nr: {lieferschein.nummer}
            </Typography>
          )}
          {lieferschein.status && (
            <StatusBadge status={lieferschein.status} />
          )}
        </Grid>

        {/* Basisdaten */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
                <DatePicker
                  label="Datum"
                  value={lieferschein.datum ? new Date(lieferschein.datum) : null}
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
                value={kunden.find(k => k.id === lieferschein.kundeId) || null}
                onChange={(_, value) => {
                  if (value) {
                    handleChange('kundeId', value.id);
                    handleChange('kundenName', value.name);
                    handleChange('kundenNummer', value.kundennummer);
                  }
                }}
                onInputChange={(_, value) => setKundenSuche(value)}
                disabled={readOnly || (!!lieferschein.auftragId && !!lieferschein.kundeId)}
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
                options={auftraege}
                getOptionLabel={(option) => `${option.nummer} (${new Date(option.datum).toLocaleDateString('de-DE')})`}
                loading={auftraegeLoading}
                value={auftraege.find(a => a.id === lieferschein.auftragId) || null}
                onChange={(_, value) => {
                  if (value) {
                    handleAuftragSelect(value.id);
                  }
                }}
                disabled={readOnly || !lieferschein.kundeId}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Auftrag" 
                    variant="outlined" 
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {auftraegeLoading ? <CircularProgress color="inherit" size={20} /> : null}
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

        {/* Lieferdaten */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
                <DatePicker
                  label="Lieferdatum"
                  value={lieferschein.lieferdatum ? new Date(lieferschein.lieferdatum) : null}
                  onChange={(newValue) => handleChange('lieferdatum', newValue?.toISOString().split('T')[0] || '')}
                  disabled={readOnly}
                  slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Versandart</InputLabel>
                <Select
                  value={lieferschein.versandart || ''}
                  onChange={(e) => handleChange('versandart', e.target.value)}
                  label="Versandart"
                  disabled={readOnly}
                >
                  {versandarten.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Frachtkosten"
                type="number"
                fullWidth
                variant="outlined"
                value={lieferschein.frachtkosten || ''}
                onChange={(e) => handleChange('frachtkosten', parseFloat(e.target.value) || 0)}
                disabled={readOnly}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>€</Typography>,
                }}
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
            value={lieferschein.bemerkung || ''}
            onChange={(e) => handleChange('bemerkung', e.target.value)}
            disabled={readOnly}
          />
        </Grid>
        
        {/* Positionen */}
        <Grid item xs={12}>
          <Box mt={3}>
            <PositionenTabelle
              positionen={lieferschein.positionen}
              onPositionenChange={handlePositionenChange}
              onArtikelSearch={handleArtikelSearch}
              onEinheitenSearch={handleEinheitenSearch}
              readOnly={readOnly}
              onPositionAdd={handlePositionAdd}
              onPositionDelete={handlePositionDelete}
              disableArtikelAenderung={!!lieferschein.auftragId} // Wenn aus Auftrag, keine Artikeländerung
              showRabatt={true}
              showMwst={true}
            />
          </Box>
        </Grid>
        
        {/* Chargen-Button für chargenpflichtige Positionen */}
        {lieferschein.positionen.length > 0 && (
          <Grid item xs={12}>
            <Box mt={2}>
              <Typography variant="subtitle1" gutterBottom>
                Chargenverwaltung
              </Typography>
              <Grid container spacing={2}>
                {lieferschein.positionen.map((position, index) => (
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

        {/* Historie und Visualisierung, nur für bestehende Lieferscheine */}
        {id && id !== 'neu' && (
          <>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Historie</Typography>
              <BelegHistorie historie={lieferschein.historie || []} />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Belegkette</Typography>
              <BelegketteVisualisierung
                belegId={id}
                belegTyp="lieferschein"
                showPositionen={false}
              />
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
                onClick={() => navigate('/lieferscheine')}
                sx={{ mr: 1 }}
              >
                Zurück
              </Button>
              
              {!readOnly && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                  disabled={!lieferschein.kundeId || lieferschein.positionen.length === 0}
                >
                  Speichern
                </Button>
              )}
            </Box>
            
            {/* Statusaktionen */}
            {lieferschein.status && (
              <Box>
                {lieferschein.status === 'entwurf' && (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleStatusChange('freigegeben')}
                    disabled={readOnly || !lieferschein.kundeId || lieferschein.positionen.length === 0}
                    sx={{ mr: 1 }}
                  >
                    Freigeben
                  </Button>
                )}
                
                {lieferschein.status === 'freigegeben' && (
                  <>
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={() => handleStatusChange('entwurf')}
                      disabled={readOnly}
                      sx={{ mr: 1 }}
                    >
                      Zurücksetzen
                    </Button>
                    
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleStatusChange('versandt')}
                      disabled={readOnly}
                      sx={{ mr: 1 }}
                    >
                      Als versandt markieren
                    </Button>
                  </>
                )}
                
                {lieferschein.status === 'versandt' && (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleStatusChange('abgeschlossen')}
                    disabled={readOnly}
                    sx={{ mr: 1 }}
                  >
                    Abschließen
                  </Button>
                )}
                
                {lieferschein.status !== 'storniert' && lieferschein.status !== 'entwurf' && (
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
          artikelId={lieferschein.positionen[selectedPositionIndex]?.artikelId || ''}
          artikelBezeichnung={lieferschein.positionen[selectedPositionIndex]?.artikelBezeichnung || ''}
          benötigteMenge={lieferschein.positionen[selectedPositionIndex]?.menge || 0}
          buchungsregel={lieferschein.positionen[selectedPositionIndex]?.buchungsregel}
          lagerplatz={lieferschein.positionen[selectedPositionIndex]?.lagerplatz}
        />
      )}
    </Paper>
  );
};

export default LieferscheinFormular; 