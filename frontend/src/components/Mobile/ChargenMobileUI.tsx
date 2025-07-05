import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
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
  TextField,
  IconButton,
  Avatar,
  Fab,
  SwipeableDrawer,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  AppBar,
  Toolbar,
  Slide
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
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
  Remove as RemoveIcon,
  ArrowBack as ArrowBackIcon,
  Assignment as AssignmentIcon,
  LocalShipping as LocalShippingIcon
} from '@mui/icons-material';

interface ChargenMobileUIProps {
  modus: 'wareneingang' | 'warenausgang' | 'inventur' | 'umlagerung';
  onScanComplete?: (data: any) => void;
  onCancel?: () => void;
  artikelId?: string;
  artikelName?: string;
  benoetigteMenge?: number;
}

// Transition für Dialog
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ChargenMobileUI: React.FC<ChargenMobileUIProps> = ({
  modus,
  onScanComplete,
  onCancel,
  artikelId,
  artikelName,
  benoetigteMenge
}) => {
  // Zustand für den Erfassungsprozess
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  
  // Gescannte Daten
  const [gescannteChargen, setGescannteChargen] = useState<any[]>([]);
  const [ausgewählteChargen, setAusgewählteChargen] = useState<any[]>([]);
  
  // Mengen-Dialog
  const [mengenDialog, setMengenDialog] = useState(false);
  const [aktuelleCharge, setAktuelleCharge] = useState<any>(null);
  const [menge, setMenge] = useState(1);

  // Titel und Erklärungstext je nach Modus
  const getTitel = () => {
    switch (modus) {
      case 'wareneingang': return 'Wareneingang erfassen';
      case 'warenausgang': return 'Warenausgang erfassen';
      case 'inventur': return 'Inventur erfassen';
      case 'umlagerung': return 'Umlagerung erfassen';
      default: return 'Chargen erfassen';
    }
  };
  
  const getErklaerung = () => {
    switch (modus) {
      case 'wareneingang': return 'Scannen Sie die Chargennummern der eingehenden Waren';
      case 'warenausgang': return 'Scannen Sie die Chargennummern der ausgehenden Waren';
      case 'inventur': return 'Scannen Sie die Chargennummern für die Inventur';
      case 'umlagerung': return 'Scannen Sie die Chargennummern für die Umlagerung';
      default: return 'Scannen Sie die Chargennummern';
    }
  };

  // Schritte für den Erfassungsprozess
  const schritte = [
    {
      label: 'Artikel auswählen',
      description: artikelName 
        ? `Ausgewählter Artikel: ${artikelName}` 
        : 'Bitte wählen Sie den Artikel aus'
    },
    {
      label: 'Chargen scannen',
      description: 'Scannen Sie die QR-Codes der Chargen'
    },
    {
      label: 'Mengen bestätigen',
      description: benoetigteMenge 
        ? `Gesamtmenge: ${getGesamtMenge()} / ${benoetigteMenge}` 
        : `Gesamtmenge: ${getGesamtMenge()}`
    },
    {
      label: 'Abschließen',
      description: 'Überprüfen und bestätigen Sie die Erfassung'
    }
  ];

  // Berechnet die Gesamtmenge der ausgewählten Chargen
  function getGesamtMenge() {
    return ausgewählteChargen.reduce((sum, charge) => sum + charge.menge, 0);
  }

  // Öffnet den Scanner
  const handleScanStart = () => {
    setScannerOpen(true);
  };

  // Schließt den Scanner
  const handleScanClose = () => {
    setScannerOpen(false);
  };

  // Verarbeitet das Scan-Ergebnis (simuliert)
  const handleScanResult = (qrcode: string) => {
    setScannerOpen(false);
    setLoading(true);
    
    // Simuliert einen API-Aufruf
    setTimeout(() => {
      try {
        // Demo-Daten für einen erfolgreichen Scan
        const neuCharge = {
          id: `charge-${Date.now()}`,
          chargennummer: `CH-${Math.floor(Math.random() * 1000)}`,
          artikelName: artikelName || 'Demoprodukt',
          artikelId: artikelId || 'demo-id',
          menge: Math.floor(Math.random() * 100) + 10,
          mhd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          lagerplatz: 'Lager A / Regal 3',
          qrcode
        };
        
        // Prüft, ob die Charge bereits gescannt wurde
        const chargeExistiert = gescannteChargen.some(c => c.chargennummer === neuCharge.chargennummer);
        if (chargeExistiert) {
          setError(`Die Charge ${neuCharge.chargennummer} wurde bereits erfasst`);
        } else {
          setGescannteChargen(prev => [...prev, neuCharge]);
          setSuccess(`Charge ${neuCharge.chargennummer} erfolgreich gescannt`);
          setAktuelleCharge(neuCharge);
          setMenge(Math.min(neuCharge.menge, benoetigteMenge || neuCharge.menge));
          setMengenDialog(true);
        }
      } catch (err) {
        setError('Fehler beim Verarbeiten des Scans');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  // Fügt eine Charge mit Menge hinzu
  const handleMengeBestaetigen = () => {
    if (aktuelleCharge && menge > 0 && menge <= aktuelleCharge.menge) {
      const chargeWithMenge = { ...aktuelleCharge, menge };
      setAusgewählteChargen(prev => [...prev, chargeWithMenge]);
      setMengenDialog(false);
      
      // Wenn die benötigte Menge erreicht ist, automatisch zum nächsten Schritt
      const neueGesamtMenge = getGesamtMenge() + menge;
      if (benoetigteMenge && neueGesamtMenge >= benoetigteMenge) {
        setActiveStep(2); // Zum Mengen-Bestätigungsschritt springen
      }
    } else {
      setError(`Bitte geben Sie eine gültige Menge zwischen 1 und ${aktuelleCharge?.menge} ein`);
    }
  };

  // Entfernt eine Charge aus der Auswahl
  const handleChargeEntfernen = (chargeId: string) => {
    setAusgewählteChargen(prev => prev.filter(charge => charge.id !== chargeId));
  };

  // Geht zum nächsten Schritt
  const handleWeiter = () => {
    if (activeStep === 1 && ausgewählteChargen.length === 0) {
      setError('Bitte scannen Sie mindestens eine Charge');
      return;
    }
    
    if (activeStep === 2 && benoetigteMenge && getGesamtMenge() !== benoetigteMenge) {
      setError(`Die erfasste Menge (${getGesamtMenge()}) entspricht nicht der benötigten Menge (${benoetigteMenge})`);
      return;
    }
    
    setActiveStep(prev => prev + 1);
    setError(null);
  };

  // Geht zum vorherigen Schritt
  const handleZurueck = () => {
    setActiveStep(prev => prev - 1);
    setError(null);
  };

  // Schließt den Erfassungsprozess ab
  const handleAbschliessen = () => {
    if (onScanComplete) {
      onScanComplete({
        modus,
        chargen: ausgewählteChargen,
        gesamtMenge: getGesamtMenge(),
        timestamp: new Date().toISOString()
      });
    }
  };

  // Bricht den Erfassungsprozess ab
  const handleAbbrechen = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // Rendert eine einzelne Charge in der Liste
  const renderCharge = (charge: any, isSelected: boolean = false) => {
    const isMhdCritical = new Date(charge.mhd) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const isMhdExpired = new Date(charge.mhd) < new Date();
    
    return (
      <Card key={charge.id} sx={{ mb: 2, borderLeft: 4, borderColor: isMhdExpired ? 'error.main' : isMhdCritical ? 'warning.main' : 'success.main' }}>
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1" fontWeight="bold">
                  {charge.chargennummer}
                </Typography>
                {isSelected && (
                  <IconButton size="small" color="error" onClick={() => handleChargeEntfernen(charge.id)}>
                    <CloseIcon />
                  </IconButton>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {charge.artikelName}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Box display="flex" alignItems="center">
                <InventoryIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  {isSelected ? charge.menge : `${charge.menge} verfügbar`}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box display="flex" alignItems="center">
                <CalendarIcon fontSize="small" sx={{ mr: 1, color: isMhdExpired ? 'error.main' : isMhdCritical ? 'warning.main' : 'text.secondary' }} />
                <Typography variant="body2" color={isMhdExpired ? 'error.main' : isMhdCritical ? 'warning.main' : 'text.secondary'}>
                  {charge.mhd}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center">
                <RoomIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary" noWrap>
                  {charge.lagerplatz}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleAbbrechen}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {getTitel()}
          </Typography>
          {modus === 'wareneingang' && <LocalShippingIcon />}
          {modus === 'warenausgang' && <LocalShippingIcon sx={{ transform: 'scaleX(-1)' }} />}
          {modus === 'inventur' && <AssignmentIcon />}
          {modus === 'umlagerung' && <InventoryIcon />}
        </Toolbar>
      </AppBar>

      {/* Hauptinhalt */}
      <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
        {/* Fehlermeldungen */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* Erfolgsmeldungen */}
        {success && (
          <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Stepper */}
        <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 3 }}>
          {schritte.map((schritt, index) => (
            <Step key={schritt.label}>
              <StepLabel>{schritt.label}</StepLabel>
              <StepContent>
                <Typography>{schritt.description}</Typography>
                <Box sx={{ mb: 2, mt: 2 }}>
                  {index === 1 && (
                    <Button
                      variant="contained"
                      onClick={handleScanStart}
                      startIcon={<QrCodeIcon />}
                      fullWidth
                      sx={{ mb: 2 }}
                    >
                      QR-Code scannen
                    </Button>
                  )}
                  
                  {index === 0 && (
                    <Button
                      variant="contained"
                      onClick={() => setActiveStep(1)}
                      disabled={!artikelId}
                      fullWidth
                      sx={{ mb: 2 }}
                    >
                      Weiter
                    </Button>
                  )}
                  
                  {index === 2 && (
                    <Button
                      variant="contained"
                      onClick={handleWeiter}
                      fullWidth
                      disabled={ausgewählteChargen.length === 0 || (benoetigteMenge && getGesamtMenge() !== benoetigteMenge)}
                      sx={{ mb: 2 }}
                    >
                      Mengen bestätigen
                    </Button>
                  )}
                  
                  {index === 3 && (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleAbschliessen}
                      startIcon={<CheckIcon />}
                      fullWidth
                      sx={{ mb: 2 }}
                    >
                      Erfassung abschließen
                    </Button>
                  )}
                  
                  {index > 0 && (
                    <Button
                      onClick={handleZurueck}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Zurück
                    </Button>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {/* Inhalt je nach aktivem Schritt */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Gescannte Chargen
            </Typography>
            {ausgewählteChargen.length > 0 ? (
              <Box>
                {ausgewählteChargen.map(charge => renderCharge(charge, true))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                Noch keine Chargen gescannt
              </Typography>
            )}
          </Box>
        )}
        
        {activeStep === 2 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Ausgewählte Chargen
            </Typography>
            {ausgewählteChargen.map(charge => renderCharge(charge, true))}
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle1">
                Gesamtmenge: {getGesamtMenge()} {benoetigteMenge ? `/ ${benoetigteMenge}` : ''}
              </Typography>
              {benoetigteMenge && getGesamtMenge() < benoetigteMenge && (
                <Typography variant="body2" color="error">
                  Es fehlen noch {benoetigteMenge - getGesamtMenge()} Einheiten
                </Typography>
              )}
              {benoetigteMenge && getGesamtMenge() > benoetigteMenge && (
                <Typography variant="body2" color="error">
                  Es wurden {getGesamtMenge() - benoetigteMenge} Einheiten zu viel ausgewählt
                </Typography>
              )}
            </Box>
          </Box>
        )}
        
        {activeStep === 3 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Zusammenfassung
            </Typography>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Modus:</strong> {modus.charAt(0).toUpperCase() + modus.slice(1)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Artikel:</strong> {artikelName || 'Nicht angegeben'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Gesamtmenge:</strong> {getGesamtMenge()}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Anzahl Chargen:</strong> {ausgewählteChargen.length}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Zeitpunkt:</strong> {new Date().toLocaleString()}
              </Typography>
            </Paper>
            <Typography variant="subtitle1" gutterBottom>
              Erfasste Chargen
            </Typography>
            {ausgewählteChargen.map(charge => renderCharge(charge))}
          </Box>
        )}
      </Box>

      {/* Action-Button im Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        {activeStep === 1 && (
          <Fab
            color="primary"
            variant="extended"
            onClick={handleScanStart}
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
          >
            <QrCodeIcon sx={{ mr: 1 }} />
            Scannen
          </Fab>
        )}
      </Box>

      {/* Scanner-Dialog */}
      <Dialog
        fullScreen
        open={scannerOpen}
        onClose={handleScanClose}
        TransitionComponent={Transition}
      >
        <AppBar position="static">
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={handleScanClose}>
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" sx={{ ml: 2, flex: 1 }}>
              QR-Code scannen
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Box sx={{ p: 2 }}>
          <Typography variant="body1" gutterBottom>
            {getErklaerung()}
          </Typography>
          
          {/* Hier würde normalerweise die QR-Scanner-Komponente integriert werden */}
          <Paper 
            sx={{ 
              width: '100%', 
              height: 300, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mb: 2
            }}
          >
            {loading ? (
              <CircularProgress />
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                <QrCodeIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  QR-Scanner (Demo-Version)
                </Typography>
              </Box>
            )}
          </Paper>
          
          <Button
            variant="contained"
            fullWidth
            onClick={() => handleScanResult('demo-qr-code')}
            disabled={loading}
          >
            {loading ? 'Verarbeite Scan...' : 'Demo-Scan auslösen'}
          </Button>
        </Box>
      </Dialog>

      {/* Mengen-Dialog */}
      <Dialog open={mengenDialog} onClose={() => setMengenDialog(false)}>
        <DialogTitle>Menge festlegen</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Charge: {aktuelleCharge?.chargennummer}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Verfügbar: {aktuelleCharge?.menge} Einheiten
          </Typography>
          {benoetigteMenge && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Noch benötigt: {Math.max(0, benoetigteMenge - getGesamtMenge())} von {benoetigteMenge} Einheiten
            </Typography>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Menge"
            type="number"
            fullWidth
            value={menge}
            onChange={(e) => setMenge(parseInt(e.target.value) || 0)}
            inputProps={{ min: 1, max: aktuelleCharge?.menge }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMengenDialog(false)}>Abbrechen</Button>
          <Button onClick={handleMengeBestaetigen} variant="contained" color="primary">
            Bestätigen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChargenMobileUI;