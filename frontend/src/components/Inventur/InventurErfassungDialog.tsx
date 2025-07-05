import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Grid,
  Autocomplete,
  CircularProgress,
  Box,
  Divider,
  Alert,
  Chip,
  IconButton,
  Badge
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import de from 'date-fns/locale/de';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { ArticleType } from '../../types/articleTypes';
import inventurService from '../../services/inventurService';
import artikelService from '../../services/artikelService';
import lagerService from '../../services/lagerService';
import ChargenAuswahlDialog, { SelectedCharge } from '../BelegeFormular/ChargenAuswahlDialog';

interface InventurErfassungDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (erfassung: InventurErfassungDaten) => void;
  inventurId: string;
  lagerortId?: string;
  initialDaten?: Partial<InventurErfassungDaten>;
}

export interface InventurErfassungDaten {
  inventurId: string;
  artikelId: string;
  artikelBezeichnung: string;
  artikelTyp?: ArticleType;
  mengeIst: number;
  mengeSoll?: number;
  einheit: string;
  lagerortId: string;
  lagerortBezeichnung: string;
  erfassungsDatum: string;
  bemerkung?: string;
  chargennummern?: string[];
  mhd?: string;
  buchungsregel?: 'FIFO' | 'LIFO' | 'MIX';
}

const InventurErfassungDialog: React.FC<InventurErfassungDialogProps> = ({
  open,
  onClose,
  onSave,
  inventurId,
  lagerortId,
  initialDaten
}) => {
  const [erfassung, setErfassung] = useState<InventurErfassungDaten>({
    inventurId,
    artikelId: '',
    artikelBezeichnung: '',
    mengeIst: 0,
    einheit: 'Stk',
    lagerortId: lagerortId || '',
    lagerortBezeichnung: '',
    erfassungsDatum: new Date().toISOString().split('T')[0]
  });
  
  const [artikel, setArtikel] = useState<any[]>([]);
  const [artikelLoading, setArtikelLoading] = useState(false);
  const [artikelSuche, setArtikelSuche] = useState('');
  
  const [lagerorte, setLagerorte] = useState<any[]>([]);
  const [lagerorteLoading, setLagerorteLoading] = useState(false);
  const [lagerortSuche, setLagerortSuche] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [showChargenDialog, setShowChargenDialog] = useState(false);
  
  // Beim Öffnen des Dialogs initialisieren
  useEffect(() => {
    if (open) {
      if (initialDaten) {
        setErfassung({
          ...erfassung,
          ...initialDaten,
          inventurId, // Sicherstellen, dass die aktuelle inventurId verwendet wird
          lagerortId: initialDaten.lagerortId || lagerortId || ''
        });
      } else {
        // Zurücksetzen auf Standardwerte
        setErfassung({
          inventurId,
          artikelId: '',
          artikelBezeichnung: '',
          mengeIst: 0,
          einheit: 'Stk',
          lagerortId: lagerortId || '',
          lagerortBezeichnung: '',
          erfassungsDatum: new Date().toISOString().split('T')[0]
        });
      }
      
      // Wenn ein Lagerort vorgegeben ist, diesen laden
      if (lagerortId) {
        loadLagerort(lagerortId);
      }
    }
  }, [open, initialDaten, inventurId, lagerortId]);
  
  // Artikel suchen
  useEffect(() => {
    if (artikelSuche) {
      const searchArtikel = async () => {
        setArtikelLoading(true);
        try {
          const result = await artikelService.searchArtikel(artikelSuche);
          setArtikel(result);
        } catch (error) {
          setError('Fehler bei der Artikelsuche');
        } finally {
          setArtikelLoading(false);
        }
      };
      
      const timeoutId = setTimeout(() => {
        searchArtikel();
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [artikelSuche]);
  
  // Lagerorte suchen
  useEffect(() => {
    if (lagerortSuche || (open && !lagerortId)) {
      const searchLagerorte = async () => {
        setLagerorteLoading(true);
        try {
          const result = await lagerService.searchLagerorte(lagerortSuche);
          setLagerorte(result);
        } catch (error) {
          setError('Fehler bei der Lagerortsuche');
        } finally {
          setLagerorteLoading(false);
        }
      };
      
      const timeoutId = setTimeout(() => {
        searchLagerorte();
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [lagerortSuche, open, lagerortId]);
  
  // Lagerort laden
  const loadLagerort = async (id: string) => {
    try {
      const lagerort = await lagerService.getLagerort(id);
      setErfassung(prev => ({
        ...prev,
        lagerortId: lagerort.id,
        lagerortBezeichnung: lagerort.bezeichnung
      }));
    } catch (error) {
      setError('Fehler beim Laden des Lagerorts');
    }
  };
  
  // Artikel auswählen
  const handleArtikelSelect = async (artikelId: string) => {
    try {
      const artikelDetails = await artikelService.getArtikel(artikelId);
      
      // Soll-Menge aus dem Lagerbestand ermitteln
      let mengeSoll = 0;
      try {
        if (erfassung.lagerortId) {
          const bestand = await lagerService.getArtikelBestand(artikelId, erfassung.lagerortId);
          mengeSoll = bestand.menge || 0;
        }
      } catch (e) {
        // Kein Fehler, wenn kein Bestand vorhanden ist
      }
      
      setErfassung(prev => ({
        ...prev,
        artikelId: artikelDetails.id,
        artikelBezeichnung: artikelDetails.bezeichnung,
        artikelTyp: artikelDetails.artikelTyp,
        einheit: artikelDetails.einheit,
        mengeSoll,
        // Wenn chargenpflichtig, dann Buchungsregel setzen
        buchungsregel: isChargenRequired(artikelDetails.artikelTyp) 
          ? (artikelDetails.standardBuchungsregel || 'FIFO') 
          : undefined
      }));
    } catch (error) {
      setError('Fehler beim Laden der Artikeldetails');
    }
  };
  
  // Änderungen in den Erfassungsdaten
  const handleChange = (field: keyof InventurErfassungDaten, value: any) => {
    setErfassung(prev => ({ ...prev, [field]: value }));
  };
  
  // Prüfen, ob ein Artikel chargenpflichtig ist
  const isChargenRequired = useCallback((artikelTyp?: ArticleType) => {
    return ['FUTTERMITTEL', 'SAATGUT', 'DÜNGEMITTEL', 'PFLANZENSCHUTZ'].includes(artikelTyp || '');
  }, []);
  
  // Öffnen des Chargen-Dialogs
  const handleOpenChargenDialog = () => {
    if (erfassung.artikelId && isChargenRequired(erfassung.artikelTyp)) {
      setShowChargenDialog(true);
    } else {
      setError('Bitte wählen Sie zuerst einen chargenpflichtigen Artikel aus');
    }
  };
  
  // Anwenden der ausgewählten Chargen
  const handleApplyChargen = (selectedCharges: SelectedCharge[]) => {
    if (selectedCharges.length > 0) {
      setErfassung(prev => ({
        ...prev,
        chargennummern: selectedCharges.map(c => c.chargennummer),
        mhd: selectedCharges[0].mhd
      }));
      setShowChargenDialog(false);
    }
  };
  
  // Erfassung speichern
  const handleSave = () => {
    if (!erfassung.artikelId) {
      setError('Bitte wählen Sie einen Artikel aus');
      return;
    }
    
    if (!erfassung.lagerortId) {
      setError('Bitte wählen Sie einen Lagerort aus');
      return;
    }
    
    // Für chargenpflichtige Artikel prüfen, ob Chargen ausgewählt wurden
    if (isChargenRequired(erfassung.artikelTyp) && (!erfassung.chargennummern || erfassung.chargennummern.length === 0)) {
      setError('Bitte wählen Sie mindestens eine Charge für den chargenpflichtigen Artikel aus');
      return;
    }
    
    onSave(erfassung);
    onClose();
  };
  
  // Mengenabweichung berechnen
  const mengenAbweichung = typeof erfassung.mengeSoll === 'number' 
    ? erfassung.mengeIst - erfassung.mengeSoll 
    : undefined;
  
  // Abweichungsstatus ermitteln
  const getAbweichungStatus = () => {
    if (mengenAbweichung === undefined) return 'none';
    if (mengenAbweichung === 0) return 'match';
    if (mengenAbweichung > 0) return 'excess';
    return 'shortage';
  };
  
  const abweichungStatus = getAbweichungStatus();
  
  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Inventurposition erfassen
          {erfassung.artikelBezeichnung && (
            <Typography variant="subtitle1" color="textSecondary">
              Artikel: {erfassung.artikelBezeichnung}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            {/* Artikel-Auswahl */}
            <Grid item xs={12}>
              <Autocomplete
                options={artikel}
                getOptionLabel={(option) => `${option.bezeichnung} (${option.artikelnummer || 'ohne Nr.'})`}
                loading={artikelLoading}
                value={artikel.find(a => a.id === erfassung.artikelId) || null}
                onChange={(_, value) => {
                  if (value) {
                    handleArtikelSelect(value.id);
                  }
                }}
                onInputChange={(_, value) => setArtikelSuche(value)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Artikel" 
                    variant="outlined" 
                    fullWidth
                    required
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {artikelLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            
            {/* Lagerort-Auswahl */}
            <Grid item xs={12}>
              <Autocomplete
                options={lagerorte}
                getOptionLabel={(option) => option.bezeichnung}
                loading={lagerorteLoading}
                value={lagerorte.find(l => l.id === erfassung.lagerortId) || null}
                onChange={(_, value) => {
                  if (value) {
                    handleChange('lagerortId', value.id);
                    handleChange('lagerortBezeichnung', value.bezeichnung);
                    
                    // Wenn bereits ein Artikel ausgewählt ist, Soll-Menge neu laden
                    if (erfassung.artikelId) {
                      handleArtikelSelect(erfassung.artikelId);
                    }
                  }
                }}
                onInputChange={(_, value) => setLagerortSuche(value)}
                disabled={!!lagerortId} // Deaktivieren, wenn ein Lagerort vorgegeben ist
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Lagerort" 
                    variant="outlined" 
                    fullWidth
                    required
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
            
            {/* Mengen */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Ist-Menge"
                type="number"
                fullWidth
                variant="outlined"
                value={erfassung.mengeIst}
                onChange={(e) => handleChange('mengeIst', parseFloat(e.target.value) || 0)}
                required
                InputProps={{
                  endAdornment: <Typography sx={{ ml: 1 }}>{erfassung.einheit}</Typography>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Soll-Menge (Laut System)"
                type="number"
                fullWidth
                variant="outlined"
                value={erfassung.mengeSoll !== undefined ? erfassung.mengeSoll : ''}
                InputProps={{
                  readOnly: true,
                  endAdornment: <Typography sx={{ ml: 1 }}>{erfassung.einheit}</Typography>,
                }}
              />
            </Grid>
            
            {/* Abweichungsanzeige */}
            {mengenAbweichung !== undefined && (
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
                  {abweichungStatus === 'match' && (
                    <Chip 
                      icon={<CheckCircleIcon />} 
                      label="Keine Abweichung" 
                      color="success" 
                      variant="outlined" 
                    />
                  )}
                  {abweichungStatus === 'excess' && (
                    <Chip 
                      icon={<WarningIcon />} 
                      label={`Überschuss: +${mengenAbweichung} ${erfassung.einheit}`} 
                      color="warning" 
                      variant="outlined" 
                    />
                  )}
                  {abweichungStatus === 'shortage' && (
                    <Chip 
                      icon={<WarningIcon />} 
                      label={`Fehlmenge: ${mengenAbweichung} ${erfassung.einheit}`} 
                      color="error" 
                      variant="outlined" 
                    />
                  )}
                </Box>
              </Grid>
            )}
            
            {/* Chargenauswahl für chargenpflichtige Artikel */}
            {erfassung.artikelId && isChargenRequired(erfassung.artikelTyp) && (
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ my: 1 }}>
                  <Typography variant="subtitle1">
                    Chargen
                  </Typography>
                  <Button
                    variant="outlined"
                    color={erfassung.chargennummern?.length ? "success" : "primary"}
                    onClick={handleOpenChargenDialog}
                    startIcon={
                      <Badge 
                        badgeContent={erfassung.chargennummern?.length || 0} 
                        color={erfassung.chargennummern?.length ? "success" : "error"}
                      >
                        <InventoryIcon />
                      </Badge>
                    }
                  >
                    Chargen auswählen
                  </Button>
                </Box>
                
                {erfassung.chargennummern && erfassung.chargennummern.length > 0 ? (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Ausgewählte Chargen:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {erfassung.chargennummern.map(chargennummer => (
                        <Chip 
                          key={chargennummer}
                          label={chargennummer}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                ) : (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    Keine Chargen ausgewählt. Für chargenpflichtige Artikel müssen Chargen erfasst werden.
                  </Alert>
                )}
              </Grid>
            )}
            
            {/* Datum und Bemerkung */}
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
                <DatePicker
                  label="Erfassungsdatum"
                  value={erfassung.erfassungsDatum ? new Date(erfassung.erfassungsDatum) : null}
                  onChange={(newValue) => handleChange('erfassungsDatum', newValue?.toISOString().split('T')[0] || '')}
                  slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Bemerkung"
                multiline
                rows={2}
                fullWidth
                variant="outlined"
                value={erfassung.bemerkung || ''}
                onChange={(e) => handleChange('bemerkung', e.target.value)}
              />
            </Grid>
          </Grid>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Abbrechen
          </Button>
          <Button 
            onClick={handleSave}
            color="primary"
            variant="contained"
            disabled={!erfassung.artikelId || !erfassung.lagerortId || (isChargenRequired(erfassung.artikelTyp) && (!erfassung.chargennummern || erfassung.chargennummern.length === 0))}
          >
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Chargen-Dialog */}
      <ChargenAuswahlDialog
        open={showChargenDialog}
        onClose={() => setShowChargenDialog(false)}
        onConfirm={handleApplyChargen}
        artikelId={erfassung.artikelId}
        artikelBezeichnung={erfassung.artikelBezeichnung}
        benötigteMenge={erfassung.mengeIst}
        buchungsregel={erfassung.buchungsregel}
        lagerplatz={erfassung.lagerortId}
      />
    </>
  );
};

export default InventurErfassungDialog; 