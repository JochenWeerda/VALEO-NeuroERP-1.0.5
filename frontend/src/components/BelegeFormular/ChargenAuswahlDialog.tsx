import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Checkbox,
  TextField,
  Box,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import DeleteIcon from '@mui/icons-material/Delete';

import { ChargeProperties, BuchungsregelType } from '../../types/articleTypes';
import chargenService from '../../services/chargenService';

// Definiert das Format der ausgewählten Chargen, die zurückgegeben werden
export interface SelectedCharge {
  chargennummer: string;
  menge: number;
  mhd?: string;
  lagerplatz?: string;
}

interface ChargenAuswahlDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (selectedCharges: SelectedCharge[]) => void;
  artikelId: string;
  artikelBezeichnung: string;
  benötigteMenge: number;
  buchungsregel?: BuchungsregelType;
  lagerplatz?: string;
}

const ChargenAuswahlDialog: React.FC<ChargenAuswahlDialogProps> = ({
  open,
  onClose,
  onConfirm,
  artikelId,
  artikelBezeichnung,
  benötigteMenge,
  buchungsregel = 'FIFO',
  lagerplatz
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [verfügbareChargen, setVerfügbareChargen] = useState<ChargeProperties[]>([]);
  const [selectedCharges, setSelectedCharges] = useState<Map<string, number>>(new Map());
  const [autoZuordnungAktiv, setAutoZuordnungAktiv] = useState<boolean>(true);
  const [verwendeteMenge, setVerwendeteMenge] = useState<number>(0);
  const [aktuelleRegel, setAktuelleRegel] = useState<BuchungsregelType>(buchungsregel);

  // Lade verfügbare Chargen, wenn der Dialog geöffnet wird
  useEffect(() => {
    if (open && artikelId) {
      loadChargen();
    } else {
      // Zurücksetzen, wenn der Dialog geschlossen wird
      setSelectedCharges(new Map());
      setVerwendeteMenge(0);
    }
  }, [open, artikelId, buchungsregel, lagerplatz]);

  // Ermittle die optimale Buchungsregel und lade Chargen
  const loadChargen = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Optimale Buchungsregel ermitteln
      let optimaleBuchungsregel = buchungsregel;
      if (!buchungsregel) {
        optimaleBuchungsregel = await chargenService.getOptimaleBuchungsregel(artikelId, lagerplatz);
      }
      setAktuelleRegel(optimaleBuchungsregel);
      
      // Verfügbare Chargen laden
      const chargen = await chargenService.getVerfügbareChargen(
        artikelId, 
        optimaleBuchungsregel,
        benötigteMenge * 1.5 // 50% mehr laden als benötigt, um Flexibilität zu bieten
      );
      
      setVerfügbareChargen(chargen);
      
      // Automatische Zuordnung, wenn aktiviert
      if (autoZuordnungAktiv) {
        await autoZuordnung();
      }
    } catch (err: any) {
      setError(`Fehler beim Laden der Chargen: ${err.message}`);
      console.error('Fehler beim Laden der Chargen:', err);
    } finally {
      setLoading(false);
    }
  };

  // Automatische Zuordnung der Chargen
  const autoZuordnung = async () => {
    try {
      const zuordnung = await chargenService.erstelleAutomatischeZuordnung(
        artikelId,
        benötigteMenge,
        lagerplatz
      );
      
      // Setze die ausgewählten Chargen entsprechend der automatischen Zuordnung
      const neueAuswahl = new Map<string, number>();
      let gesamtMenge = 0;
      
      zuordnung.forEach(charge => {
        neueAuswahl.set(charge.chargennummer, charge.menge);
        gesamtMenge += charge.menge;
      });
      
      setSelectedCharges(neueAuswahl);
      setVerwendeteMenge(gesamtMenge);
    } catch (err: any) {
      console.error('Fehler bei der automatischen Zuordnung:', err);
      // Keine Fehlermeldung anzeigen, da es nur eine Komfortfunktion ist
    }
  };

  // Überprüft, ob eine Charge ausgewählt ist
  const isChargeSelected = (chargennummer: string): boolean => {
    return selectedCharges.has(chargennummer);
  };

  // Aktualisiert die Menge einer ausgewählten Charge
  const updateChargeMenge = (chargennummer: string, menge: number) => {
    const neueMenge = Math.max(0, menge); // Keine negativen Mengen
    const neueAuswahl = new Map(selectedCharges);
    
    if (neueMenge <= 0) {
      neueAuswahl.delete(chargennummer);
    } else {
      // Finde die maximale verfügbare Menge für diese Charge
      const charge = verfügbareChargen.find(c => c.chargennummer === chargennummer);
      if (charge) {
        const maxMenge = charge.menge;
        neueAuswahl.set(chargennummer, Math.min(neueMenge, maxMenge));
      }
    }
    
    // Aktualisiere die Gesamtmenge
    let gesamtMenge = 0;
    neueAuswahl.forEach(menge => {
      gesamtMenge += menge;
    });
    
    setSelectedCharges(neueAuswahl);
    setVerwendeteMenge(gesamtMenge);
  };

  // Wählt eine Charge aus oder ab
  const toggleChargeSelection = (chargennummer: string, verfügbareMenge: number) => {
    const neueAuswahl = new Map(selectedCharges);
    
    if (neueAuswahl.has(chargennummer)) {
      neueAuswahl.delete(chargennummer);
    } else {
      // Bestimme die zu verwendende Menge
      // Wenn die benötigte Menge noch nicht erreicht ist, fülle sie auf
      const verbleibendeMenge = Math.max(0, benötigteMenge - verwendeteMenge);
      const zuVerwendendeMenge = Math.min(verfügbareMenge, verbleibendeMenge);
      
      if (zuVerwendendeMenge > 0) {
        neueAuswahl.set(chargennummer, zuVerwendendeMenge);
      }
    }
    
    // Aktualisiere die Gesamtmenge
    let gesamtMenge = 0;
    neueAuswahl.forEach(menge => {
      gesamtMenge += menge;
    });
    
    setSelectedCharges(neueAuswahl);
    setVerwendeteMenge(gesamtMenge);
  };

  // Formatiert ein Datum für die Anzeige
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  // Bestimmt die Warnstufe für ein MHD
  const getMhdWarningLevel = (mhd?: string): 'ok' | 'warning' | 'error' | 'none' => {
    if (!mhd) return 'none';
    
    const heute = new Date();
    const mhdDatum = new Date(mhd);
    const diffTime = mhdDatum.getTime() - heute.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'error'; // MHD bereits überschritten
    if (diffDays <= 30) return 'warning'; // Weniger als 30 Tage bis MHD
    return 'ok';
  };

  // Gibt ein Icon für den MHD-Status zurück
  const getMhdStatusIcon = (mhd?: string) => {
    const status = getMhdWarningLevel(mhd);
    
    switch (status) {
      case 'error':
        return <ErrorIcon color="error" fontSize="small" />;
      case 'warning':
        return <WarningIcon color="warning" fontSize="small" />;
      case 'ok':
        return <CheckCircleIcon color="success" fontSize="small" />;
      case 'none':
      default:
        return <HourglassEmptyIcon color="disabled" fontSize="small" />;
    }
  };

  // Ermittelt die Beschreibung der Buchungsregel
  const getBuchungsregelBeschreibung = (regel: BuchungsregelType): string => {
    switch (regel) {
      case 'FIFO':
        return 'First In First Out - Älteste Ware zuerst';
      case 'LIFO':
        return 'Last In First Out - Neueste Ware zuerst';
      case 'MIX':
        return 'Chargen werden gemischt (z.B. bei Tanks)';
      default:
        return regel;
    }
  };

  // Überprüft, ob die Bestätigung möglich ist (ausreichend Menge ausgewählt)
  const isConfirmPossible = (): boolean => {
    return verwendeteMenge > 0;
  };

  // Erzeugt die Daten für die Bestätigung
  const handleConfirm = () => {
    const result: SelectedCharge[] = [];
    
    // Wandle die ausgewählten Chargen in das erwartete Format um
    selectedCharges.forEach((menge, chargennummer) => {
      const chargeDetails = verfügbareChargen.find(c => c.chargennummer === chargennummer);
      if (chargeDetails) {
        result.push({
          chargennummer,
          menge,
          mhd: chargeDetails.mhd,
          lagerplatz: chargeDetails.lagerplatz
        });
      }
    });
    
    onConfirm(result);
  };

  // Berechne die Summe der ausgewählten Mengen
  const berechneteVerwendeteMenge = useMemo(() => {
    let summe = 0;
    selectedCharges.forEach(menge => {
      summe += menge;
    });
    return summe;
  }, [selectedCharges]);

  // Aktualisiert die verwendete Menge, wann immer sich selectedCharges ändert
  useEffect(() => {
    setVerwendeteMenge(berechneteVerwendeteMenge);
  }, [berechneteVerwendeteMenge]);

  // Wählt alle empfohlenen Chargen basierend auf der Buchungsregel aus
  const wähleEmpfohleneChargen = () => {
    // Neue Map für die Auswahl
    const neueAuswahl = new Map<string, number>();
    let verbleibendeMenge = benötigteMenge;
    
    // Iteriere durch die (bereits sortierten) Chargen
    for (const charge of verfügbareChargen) {
      if (verbleibendeMenge <= 0) break;
      
      // Bestimme die zu verwendende Menge aus dieser Charge
      const zuVerwendendeMenge = Math.min(charge.menge, verbleibendeMenge);
      
      if (zuVerwendendeMenge > 0) {
        neueAuswahl.set(charge.chargennummer, zuVerwendendeMenge);
        verbleibendeMenge -= zuVerwendendeMenge;
      }
    }
    
    setSelectedCharges(neueAuswahl);
    setVerwendeteMenge(benötigteMenge - verbleibendeMenge);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        Chargenauswahl
        <Typography variant="subtitle1" color="textSecondary">
          Artikel: {artikelBezeichnung} | Benötigte Menge: {benötigteMenge}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={4}>
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Lade verfügbare Chargen...
            </Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        ) : verfügbareChargen.length === 0 ? (
          <Alert severity="warning" sx={{ my: 2 }}>
            Keine Chargen für diesen Artikel verfügbar.
          </Alert>
        ) : (
          <>
            <Box mb={2}>
              <Alert severity="info" sx={{ mb: 1 }}>
                <Typography variant="body2">
                  Buchungsregel: <strong>{getBuchungsregelBeschreibung(aktuelleRegel)}</strong>
                  {lagerplatz && (
                    <span> | Lagerplatz: <strong>{lagerplatz}</strong></span>
                  )}
                </Typography>
              </Alert>
              
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Box>
                  <Chip 
                    label={`Ausgewählte Menge: ${verwendeteMenge}`} 
                    color={verwendeteMenge >= benötigteMenge ? "success" : "primary"}
                    sx={{ mr: 1 }}
                  />
                  <Chip 
                    label={`Benötigte Menge: ${benötigteMenge}`} 
                    variant="outlined"
                  />
                  {verwendeteMenge > benötigteMenge && (
                    <Chip 
                      label={`Überschuss: ${(verwendeteMenge - benötigteMenge).toFixed(2)}`}
                      color="warning"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
                
                <Box>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={autoZuordnung}
                    disabled={loading}
                    sx={{ mr: 1 }}
                  >
                    Automatisch zuordnen
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={wähleEmpfohleneChargen}
                    disabled={loading}
                  >
                    Empfohlene auswählen
                  </Button>
                </Box>
              </Box>

              {selectedCharges.size > 0 && (
                <Box mb={2} mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Ausgewählte Chargen:
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Chargennummer</TableCell>
                          <TableCell align="right">Menge</TableCell>
                          <TableCell>MHD</TableCell>
                          <TableCell>Lagerplatz</TableCell>
                          <TableCell align="right">Aktionen</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Array.from(selectedCharges.entries()).map(([chargennummer, menge]) => {
                          const chargeDetails = verfügbareChargen.find(c => c.chargennummer === chargennummer);
                          if (!chargeDetails) return null;
                          
                          return (
                            <TableRow key={chargennummer}>
                              <TableCell>{chargennummer}</TableCell>
                              <TableCell align="right">{menge}</TableCell>
                              <TableCell>{formatDate(chargeDetails.mhd)}</TableCell>
                              <TableCell>{chargeDetails.lagerplatz || '-'}</TableCell>
                              <TableCell align="right">
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => {
                                    const neueAuswahl = new Map(selectedCharges);
                                    neueAuswahl.delete(chargennummer);
                                    setSelectedCharges(neueAuswahl);
                                  }}
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
                </Box>
              )}
            </Box>
            
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox 
                        disabled={true} // "Alle auswählen" Feature hier nicht sinnvoll
                      />
                    </TableCell>
                    <TableCell>Chargennummer</TableCell>
                    <TableCell align="right">Verfügbare Menge</TableCell>
                    <TableCell>
                      MHD
                      <Tooltip title="Mindesthaltbarkeitsdatum">
                        <IconButton size="small">
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell>Lagerplatz</TableCell>
                    <TableCell>Einlagerung</TableCell>
                    <TableCell align="right">Zu verwendende Menge</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {verfügbareChargen.map((charge) => {
                    const isSelected = isChargeSelected(charge.chargennummer);
                    const selectedMenge = selectedCharges.get(charge.chargennummer) || 0;
                    const mhdStatus = getMhdWarningLevel(charge.mhd);
                    
                    return (
                      <TableRow 
                        key={charge.chargennummer}
                        selected={isSelected}
                        sx={{
                          '&.Mui-selected': {
                            backgroundColor: 'rgba(25, 118, 210, 0.08)'
                          },
                          backgroundColor: 
                            mhdStatus === 'error' ? 'rgba(211, 47, 47, 0.08)' : 
                            mhdStatus === 'warning' ? 'rgba(237, 108, 2, 0.08)' : 
                            'inherit'
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox 
                            checked={isSelected}
                            onChange={() => toggleChargeSelection(charge.chargennummer, charge.menge)}
                          />
                        </TableCell>
                        <TableCell>{charge.chargennummer}</TableCell>
                        <TableCell align="right">{charge.menge}</TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            {getMhdStatusIcon(charge.mhd)}
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              {formatDate(charge.mhd)}
                            </Typography>
                            {mhdStatus === 'warning' && (
                              <Chip 
                                label="MHD bald!" 
                                color="warning" 
                                size="small" 
                                sx={{ ml: 1 }}
                              />
                            )}
                            {mhdStatus === 'error' && (
                              <Chip 
                                label="MHD abgelaufen!" 
                                color="error" 
                                size="small" 
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>{charge.lagerplatz || '-'}</TableCell>
                        <TableCell>{formatDate(charge.einlagerungsdatum)}</TableCell>
                        <TableCell align="right">
                          <TextField 
                            type="number"
                            size="small"
                            value={isSelected ? selectedMenge : ''}
                            onChange={(e) => updateChargeMenge(
                              charge.chargennummer, 
                              parseFloat(e.target.value) || 0
                            )}
                            disabled={!isSelected}
                            inputProps={{ 
                              min: 0, 
                              max: charge.menge, 
                              step: 0.01,
                              style: { textAlign: 'right' }
                            }}
                            sx={{ width: '100px' }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            
            {verwendeteMenge < benötigteMenge && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Die ausgewählte Menge ({verwendeteMenge}) ist geringer als die benötigte Menge ({benötigteMenge}).
                </Typography>
              </Alert>
            )}
            
            {verfügbareChargen.some(c => getMhdWarningLevel(c.mhd) === 'error' && isChargeSelected(c.chargennummer)) && (
              <Alert severity="error" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Achtung: Sie haben Chargen mit abgelaufenem MHD ausgewählt!
                </Typography>
              </Alert>
            )}
          </>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleConfirm}
          disabled={loading || !isConfirmPossible()}
        >
          Chargen übernehmen
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChargenAuswahlDialog; 