import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import { QrReader } from 'react-qr-reader';
import {
  QrCode as QrCodeIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  CalendarMonth as CalendarIcon,
  Inventory as InventoryIcon,
  Room as RoomIcon,
  Add as AddIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import { verarbeiteQRCodeScan } from '../../services/inventoryApi';
import { chargenService } from '../../services/chargenService';

interface ChargenScannerProps {
  lagerplatzId?: string;
  artikelId?: string;
  onChargeSelected?: (chargeData: any) => void;
  modus: 'wareneingang' | 'warenausgang' | 'inventur' | 'umlagerung';
  benötigteMenge?: number;
}

interface ScannedCharge {
  id: string;
  chargennummer: string;
  artikelBezeichnung: string;
  menge: number;
  mhd?: string;
  lagerplatz?: string;
  status: 'verfügbar' | 'reserviert' | 'gesperrt';
}

const ChargenScanner: React.FC<ChargenScannerProps> = ({
  lagerplatzId,
  artikelId,
  onChargeSelected,
  modus,
  benötigteMenge = 0
}) => {
  const [scanning, setScanning] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [scannedChargen, setScannedChargen] = useState<ScannedCharge[]>([]);
  const [selectedChargen, setSelectedChargen] = useState<{[key: string]: number}>({});
  const [mengenDialog, setMengenDialog] = useState<boolean>(false);
  const [currentCharge, setCurrentCharge] = useState<ScannedCharge | null>(null);
  const [menge, setMenge] = useState<number>(1);
  const [verfügbareMenge, setVerfügbareMenge] = useState<number>(0);
  const [gesamtMenge, setGesamtMenge] = useState<number>(0);

  // Berechne die Gesamtmenge der ausgewählten Chargen
  useEffect(() => {
    let summe = 0;
    Object.entries(selectedChargen).forEach(([chargeId, menge]) => {
      summe += menge;
    });
    setGesamtMenge(summe);
  }, [selectedChargen]);

  // QR-Code scannen
  const handleScanResult = async (result: any) => {
    if (result?.text) {
      setScanning(false);
      console.log('QR-Code gescannt:', result.text);
      
      try {
        setLoading(true);
        // In einer realen Anwendung würde der gescannte Code zum Server gesendet
        const response = await verarbeiteQRCodeScan(result.text, modus);
        
        if (response.type === 'charge') {
          // Weitere Informationen zur Charge laden
          const chargeDetails = await chargenService.getChargeById(response.id);
          
          // Wenn Artikelfilter aktiv ist, prüfen ob die Charge zum Artikel passt
          if (artikelId && chargeDetails.artikel_id.toString() !== artikelId) {
            setError(`Die gescannte Charge gehört nicht zum ausgewählten Artikel. Bitte scannen Sie eine passende Charge.`);
            return;
          }
          
          // Neue Charge zum Scan-Ergebnis hinzufügen
          const newCharge: ScannedCharge = {
            id: response.id,
            chargennummer: response.label,
            artikelBezeichnung: chargeDetails.artikel_name || 'Unbekannter Artikel',
            menge: chargeDetails.menge || 0,
            mhd: chargeDetails.mindesthaltbarkeitsdatum,
            lagerplatz: chargeDetails.lagerort_name,
            status: chargeDetails.qualitaetsstatus === 'freigegeben' ? 'verfügbar' : 
                   chargeDetails.qualitaetsstatus === 'gesperrt' ? 'gesperrt' : 'reserviert'
          };
          
          // Prüfen, ob die Charge bereits gescannt wurde
          const exists = scannedChargen.some(charge => charge.id === newCharge.id);
          if (!exists) {
            setScannedChargen(prev => [...prev, newCharge]);
            setSuccess(`Charge ${newCharge.chargennummer} erfolgreich gescannt`);
            
            // Dialog zur Mengeneingabe öffnen
            setCurrentCharge(newCharge);
            setVerfügbareMenge(newCharge.menge);
            setMenge(Math.min(newCharge.menge, benötigteMenge > 0 ? benötigteMenge - gesamtMenge : newCharge.menge));
            setMengenDialog(true);
          } else {
            setError(`Die Charge ${newCharge.chargennummer} wurde bereits gescannt`);
          }
        } else if (response.type === 'lagerplatz') {
          // Lagerplatz-Handling könnte hier implementiert werden
          setSuccess(`Lagerplatz ${response.label} erfolgreich gescannt`);
        } else {
          setError(`Der gescannte Code konnte nicht als Charge erkannt werden`);
        }
      } catch (err) {
        console.error('Fehler bei der Verarbeitung des Scans:', err);
        setError('Der gescannte Code konnte nicht verarbeitet werden');
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Chargen-Menge bestätigen
  const handleMengeConfirm = () => {
    if (currentCharge) {
      if (menge > verfügbareMenge) {
        setError(`Die eingegebene Menge überschreitet die verfügbare Menge von ${verfügbareMenge}`);
        return;
      }
      
      // Menge zur Charge hinzufügen
      setSelectedChargen(prev => ({
        ...prev,
        [currentCharge.id]: menge
      }));
      
      setMengenDialog(false);
      setCurrentCharge(null);
    }
  };
  
  // Charge aus der Auswahl entfernen
  const handleRemoveCharge = (chargeId: string) => {
    const updatedSelection = { ...selectedChargen };
    delete updatedSelection[chargeId];
    setSelectedChargen(updatedSelection);
  };
  
  // Chargen bestätigen und zurückgeben
  const handleConfirmSelection = () => {
    if (gesamtMenge === 0) {
      setError('Bitte wählen Sie mindestens eine Charge aus');
      return;
    }
    
    // Wenn benötigteMenge gesetzt ist, prüfen ob die Gesamtmenge passt
    if (benötigteMenge > 0 && gesamtMenge !== benötigteMenge) {
      setError(`Die ausgewählte Menge (${gesamtMenge}) entspricht nicht der benötigten Menge (${benötigteMenge})`);
      return;
    }
    
    // Chargen-Daten zusammenstellen
    const selectedChargeData = scannedChargen
      .filter(charge => selectedChargen[charge.id])
      .map(charge => ({
        id: charge.id,
        chargennummer: charge.chargennummer,
        menge: selectedChargen[charge.id],
        artikelBezeichnung: charge.artikelBezeichnung,
        mhd: charge.mhd,
        lagerplatz: charge.lagerplatz
      }));
    
    // Daten an Parent-Komponente übergeben
    if (onChargeSelected) {
      onChargeSelected(selectedChargeData);
    }
  };
  
  // QR-Code Scanner starten
  const startScanning = () => {
    setScanning(true);
    setError(null);
  };
  
  // QR-Code Scanner stoppen
  const stopScanning = () => {
    setScanning(false);
  };
  
  // MHD formatieren
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Kein MHD';
    return new Date(dateString).toLocaleDateString('de-DE');
  };
  
  // Prüfen ob das MHD bald abläuft (30 Tage)
  const isMhdCritical = (mhd?: string) => {
    if (!mhd) return false;
    const mhdDate = new Date(mhd);
    const today = new Date();
    const differenceInDays = Math.floor((mhdDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return differenceInDays <= 30 && differenceInDays > 0;
  };
  
  // Prüfen ob das MHD abgelaufen ist
  const isMhdExpired = (mhd?: string) => {
    if (!mhd) return false;
    const mhdDate = new Date(mhd);
    const today = new Date();
    return mhdDate < today;
  };
  
  return (
    <Box>
      {/* Fehler und Erfolg Meldungen */}
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError(null)} 
          sx={{ mb: 2 }}
          variant="filled"
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert 
          severity="success" 
          onClose={() => setSuccess(null)} 
          sx={{ mb: 2 }}
          variant="filled"
        >
          {success}
        </Alert>
      )}
      
      {/* Scanner-Bereich */}
      <Paper elevation={2} sx={{ mb: 2, overflow: 'hidden' }}>
        {scanning ? (
          <Box sx={{ position: 'relative', height: 300 }}>
            <QrReader
              onResult={handleScanResult}
              constraints={{ facingMode: 'environment' }}
              scanDelay={500}
              videoStyle={{ width: '100%' }}
              videoId="qr-reader-video"
              ViewFinder={() => (
                <Box 
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '200px',
                    height: '200px',
                    border: '2px solid #4caf50',
                    borderRadius: '8px',
                    boxShadow: '0 0 0 4000px rgba(0, 0, 0, 0.5)',
                    zIndex: 10
                  }}
                />
              )}
            />
            <Box sx={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              p: 1, 
              bgcolor: 'rgba(0,0,0,0.7)',
              color: 'white',
              textAlign: 'center'
            }}>
              <Typography variant="body2">Scannen Sie den QR-Code der Charge</Typography>
              <Button 
                variant="contained" 
                color="error" 
                size="small" 
                onClick={stopScanning}
                sx={{ mt: 1 }}
              >
                Abbrechen
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<QrCodeIcon />}
              onClick={startScanning}
              disabled={loading}
              fullWidth
              size="large"
              sx={{ py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Charge scannen'}
            </Button>
          </Box>
        )}
      </Paper>
      
      {/* Übersicht der benötigten Menge */}
      {benötigteMenge > 0 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={1} alignItems="center">
            <Grid item xs={6}>
              <Typography variant="body2">Benötigte Menge:</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1" fontWeight="bold" align="right">
                {benötigteMenge} Stk
              </Typography>
            </Grid>
            
            <Grid item xs={6}>
              <Typography variant="body2">Ausgewählte Menge:</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography 
                variant="body1" 
                fontWeight="bold" 
                align="right"
                color={
                  gesamtMenge === benötigteMenge ? 'success.main' : 
                  gesamtMenge > benötigteMenge ? 'error.main' : 
                  'text.primary'
                }
              >
                {gesamtMenge} Stk
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <LinearProgress 
                variant="determinate" 
                value={Math.min((gesamtMenge / benötigteMenge) * 100, 100)} 
                sx={{ 
                  mt: 1,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 
                      gesamtMenge === benötigteMenge ? 'success.main' : 
                      gesamtMenge > benötigteMenge ? 'error.main' : 
                      'primary.main'
                  }
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {/* Liste der gescannten Chargen */}
      {scannedChargen.length > 0 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Gescannte Chargen ({scannedChargen.length})
          </Typography>
          
          <List sx={{ width: '100%', bgcolor: 'background.paper', mt: 1 }}>
            {scannedChargen.map((charge) => {
              const isSelected = selectedChargen[charge.id] !== undefined;
              const selectedMenge = selectedChargen[charge.id] || 0;
              
              return (
                <React.Fragment key={charge.id}>
                  <ListItem 
                    alignItems="flex-start"
                    sx={{ 
                      bgcolor: isSelected ? 'action.selected' : 'inherit',
                      borderLeft: isSelected ? '4px solid' : 'none',
                      borderLeftColor: 'primary.main'
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2">
                            {charge.chargennummer}
                          </Typography>
                          <Chip 
                            label={charge.status}
                            size="small"
                            color={
                              charge.status === 'verfügbar' ? 'success' :
                              charge.status === 'gesperrt' ? 'error' : 'warning'
                            }
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" component="span" color="text.primary">
                            {charge.artikelBezeichnung}
                          </Typography>
                          
                          <Grid container spacing={1} sx={{ mt: 0.5 }}>
                            <Grid item xs={6} display="flex" alignItems="center">
                              <InventoryIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                {charge.menge} Stk
                              </Typography>
                            </Grid>
                            
                            <Grid item xs={6} display="flex" alignItems="center">
                              <CalendarIcon 
                                fontSize="small" 
                                sx={{ 
                                  mr: 0.5, 
                                  color: isMhdExpired(charge.mhd) ? 'error.main' : 
                                          isMhdCritical(charge.mhd) ? 'warning.main' : 
                                          'text.secondary' 
                                }} 
                              />
                              <Typography 
                                variant="body2"
                                color={
                                  isMhdExpired(charge.mhd) ? 'error.main' : 
                                  isMhdCritical(charge.mhd) ? 'warning.main' : 
                                  'text.secondary'
                                }
                              >
                                {formatDate(charge.mhd)}
                              </Typography>
                            </Grid>
                            
                            {charge.lagerplatz && (
                              <Grid item xs={12} display="flex" alignItems="center">
                                <RoomIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                <Typography variant="body2">
                                  {charge.lagerplatz}
                                </Typography>
                              </Grid>
                            )}
                          </Grid>
                          
                          {isSelected && (
                            <Box display="flex" alignItems="center" mt={1}>
                              <Typography variant="body2" color="primary" fontWeight="bold">
                                Ausgewählte Menge: {selectedMenge} Stk
                              </Typography>
                              <IconButton 
                                size="small" 
                                color="error" 
                                onClick={() => handleRemoveCharge(charge.id)}
                                sx={{ ml: 'auto' }}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          )}
                        </Box>
                      }
                    />
                    
                    {!isSelected && (
                      <ListItemSecondaryAction>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            setCurrentCharge(charge);
                            setVerfügbareMenge(charge.menge);
                            setMenge(Math.min(charge.menge, benötigteMenge > 0 ? benötigteMenge - gesamtMenge : charge.menge));
                            setMengenDialog(true);
                          }}
                          disabled={charge.status === 'gesperrt'}
                        >
                          Auswählen
                        </Button>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              );
            })}
          </List>
        </Paper>
      )}
      
      {/* Mengen-Dialog */}
      <Dialog open={mengenDialog} onClose={() => setMengenDialog(false)}>
        <DialogTitle>
          Menge für Charge {currentCharge?.chargennummer}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" gutterBottom>
              Verfügbare Menge: {verfügbareMenge} Stk
            </Typography>
            
            {benötigteMenge > 0 && (
              <Typography variant="body2" gutterBottom>
                Noch benötigte Menge: {Math.max(0, benötigteMenge - gesamtMenge)} Stk
              </Typography>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <IconButton 
                color="primary"
                onClick={() => setMenge(prev => Math.max(1, prev - 1))}
              >
                <RemoveIcon />
              </IconButton>
              
              <TextField
                label="Menge"
                type="number"
                value={menge}
                onChange={(e) => setMenge(Math.max(1, parseInt(e.target.value) || 0))}
                inputProps={{ min: 1, max: verfügbareMenge }}
                sx={{ mx: 2 }}
                fullWidth
              />
              
              <IconButton 
                color="primary"
                onClick={() => setMenge(prev => Math.min(verfügbareMenge, prev + 1))}
              >
                <AddIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMengenDialog(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleMengeConfirm} 
            variant="contained"
            startIcon={<CheckIcon />}
          >
            Bestätigen
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Bestätigen-Button */}
      {scannedChargen.length > 0 && Object.keys(selectedChargen).length > 0 && (
        <Button
          variant="contained"
          color="success"
          fullWidth
          size="large"
          onClick={handleConfirmSelection}
          startIcon={<SaveIcon />}
          sx={{ mt: 2 }}
        >
          Chargenauswahl bestätigen
        </Button>
      )}
    </Box>
  );
};

export default ChargenScanner; 