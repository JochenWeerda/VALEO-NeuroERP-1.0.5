import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid
} from '@mui/material';
import {
  QrCodeScanner as QrCodeScannerIcon,
  ArrowBack as ArrowBackIcon,
  Inventory as InventoryIcon,
  LocalShipping as LocalShippingIcon,
  SwapHoriz as SwapHorizIcon,
  Assignment as AssignmentIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  CalendarMonth as CalendarIcon,
  Room as RoomIcon,
  Clear as ClearIcon,
  ArrowForward as ArrowForwardIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import ChargenScanner from '../../components/Mobile/ChargenScanner';
import inventoryApi, { ScanResult } from '../../services/inventoryApi';
import { ChargeDetails } from '../../services/chargenService';
import offlineStorageService from '../../services/offlineStorageService';

interface ScanModus {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const scanModi: {[key: string]: ScanModus} = {
  wareneingang: {
    id: 'wareneingang',
    title: 'Wareneingang',
    description: 'Waren und Chargen erfassen',
    icon: <LocalShippingIcon sx={{ transform: 'scaleX(-1)' }} />,
    color: '#4caf50'
  },
  warenausgang: {
    id: 'warenausgang',
    title: 'Warenausgang',
    description: 'Kommissionierung und Versand',
    icon: <LocalShippingIcon />,
    color: '#2196f3'
  },
  inventur: {
    id: 'inventur',
    title: 'Inventur',
    description: 'Bestandserfassung durchführen',
    icon: <AssignmentIcon />,
    color: '#ff9800'
  },
  umlagerung: {
    id: 'umlagerung',
    title: 'Umlagerung',
    description: 'Artikel zwischen Lagerplätzen verschieben',
    icon: <SwapHorizIcon />,
    color: '#9c27b0'
  }
};

const MobileScannerPage: React.FC = () => {
  const { modus = 'wareneingang' } = useParams<{ modus: string }>();
  const navigate = useNavigate();
  const [currentModus, setCurrentModus] = useState<string>(modus in scanModi ? modus : 'wareneingang');
  const [tabValue, setTabValue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [selectedAufgabe, setSelectedAufgabe] = useState<any | null>(null);
  const [aufgaben, setAufgaben] = useState<any[]>([]);
  const [scanHistorie, setScanHistorie] = useState<{
    zeitpunkt: Date;
    typ: string;
    label: string;
    erfolgreich: boolean;
  }[]>([]);
  
  // Dummy-Benutzerdaten (in einer echten Anwendung würde dies aus einer Authentifizierung kommen)
  const [user] = useState({
    id: '1',
    name: 'Max Mustermann',
    position: 'Lagerist'
  });
  
  // Scan-Zwischenspeicher
  const [scannedItems, setScannedItems] = useState<{
    lagerplatz?: ScanResult;
    artikel?: ScanResult;
    chargen: ChargeDetails[];
    menge?: number;
    bemerkung?: string;
  }>({
    chargen: []
  });
  
  // Mengen-Dialog
  const [mengenDialog, setMengenDialog] = useState<boolean>(false);
  const [menge, setMenge] = useState<number>(1);
  
  // Neuer State für den Online-Status und die Synchronisation
  const [isOnline, setIsOnline] = useState<boolean>(offlineStorageService.isOnline());
  const [syncStatus, setSyncStatus] = useState<{
    syncing: boolean;
    lastSync: string | null;
    pendingItems: number;
  }>({
    syncing: false,
    lastSync: null,
    pendingItems: 0
  });
  
  // Aufgaben laden
  useEffect(() => {
    const loadAufgaben = async () => {
      try {
        setLoading(true);
        const aufgabenData = await inventoryApi.getScannerAufgaben(user.id, currentModus as any);
        setAufgaben(aufgabenData);
      } catch (error) {
        console.error('Fehler beim Laden der Aufgaben:', error);
        setError('Aufgaben konnten nicht geladen werden');
      } finally {
        setLoading(false);
      }
    };
    
    loadAufgaben();
  }, [currentModus, user.id]);
  
  // Wenn sich der Modus in der URL ändert
  useEffect(() => {
    if (modus in scanModi) {
      setCurrentModus(modus);
    }
  }, [modus]);
  
  // Tab-Wechsel
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Modus wechseln
  const handleModusChange = (newModus: string) => {
    navigate(`/mobile/scanner/${newModus}`);
    setCurrentModus(newModus);
    // Zurücksetzen der Scan-Daten bei Modus-Wechsel
    setScannedItems({ chargen: [] });
    setScanResult(null);
  };
  
  // Überprüft den Online-Status und aktualisiert den State
  const handleOnline = () => {
    setIsOnline(true);
    syncData();
  };
  
  // Aktualisiert den State, wenn die Verbindung verloren geht
  const handleOffline = () => {
    setIsOnline(false);
  };
  
  // Synchronisiert Offline-Daten, wenn eine Verbindung hergestellt wird
  const syncData = async () => {
    try {
      setSyncStatus(prev => ({ ...prev, syncing: true }));
      
      const result = await offlineStorageService.syncOfflineData();
      
      if (result.success) {
        setSyncStatus({
          syncing: false,
          lastSync: new Date().toISOString(),
          pendingItems: result.failedCount
        });
        
        if (result.syncedCount > 0) {
          setSuccess(`${result.syncedCount} Elemente erfolgreich synchronisiert`);
        }
      } else {
        setSyncStatus(prev => ({ ...prev, syncing: false }));
        setError('Synchronisation fehlgeschlagen');
      }
    } catch (error) {
      console.error('Fehler bei der Synchronisation:', error);
      setSyncStatus(prev => ({ ...prev, syncing: false }));
      setError('Fehler bei der Synchronisation');
    }
  };
  
  // Prüft regelmäßig auf ausstehende Synchronisationen
  const checkPendingSync = async () => {
    try {
      const scanResults = await offlineStorageService.getUnsyncedScanResults();
      const chargeSelections = await offlineStorageService.getUnsyncedChargeSelections();
      const operations = await offlineStorageService.getUnsyncedOperations();
      
      const pendingItems = scanResults.length + chargeSelections.length + operations.length;
      
      setSyncStatus(prev => ({ ...prev, pendingItems }));
    } catch (error) {
      console.error('Fehler beim Prüfen auf ausstehende Synchronisationen:', error);
    }
  };
  
  // Offline-Speicherung der Scan-Ergebnisse
  const handleScanResultOffline = async (result: ScanResult) => {
    try {
      await offlineStorageService.saveScanResult(result);
      checkPendingSync();
    } catch (error) {
      console.error('Fehler beim Speichern des Scan-Ergebnisses:', error);
    }
  };
  
  // Offline-Speicherung der Chargenbuchung
  const handleWarenbewegungBuchenOffline = async (bewegung: any) => {
    try {
      await offlineStorageService.savePendingOperation(currentModus as any, bewegung);
      checkPendingSync();
      setSuccess(`${scanModi[currentModus].title} offline gespeichert. Wird synchronisiert, sobald eine Verbindung besteht.`);
    } catch (error) {
      console.error('Fehler beim Speichern der Warenbewegung:', error);
      setError('Die Buchung konnte nicht offline gespeichert werden');
    }
  };
  
  // Setze Online-Status-Listener beim Laden der Komponente
  useEffect(() => {
    offlineStorageService.setupOnlineStatusListeners(handleOnline, handleOffline);
    checkPendingSync();
    
    // Bereinigen beim Entladen der Komponente
    return () => {
      offlineStorageService.removeOnlineStatusListeners(handleOnline, handleOffline);
    };
  }, []);
  
  // Bei Änderung des Online-Status ggf. synchronisieren
  useEffect(() => {
    if (isOnline && syncStatus.pendingItems > 0) {
      syncData();
    }
  }, [isOnline]);
  
  // Verarbeitung des Scanner-Ergebnisses
  const handleScanResult = (result: ChargeDetails[]) => {
    // Hier werden die gescannten Chargen zum Zwischenspeicher hinzugefügt
    setScannedItems(prev => ({
      ...prev,
      chargen: [...prev.chargen, ...result]
    }));
    
    // Scan zur Historie hinzufügen
    setScanHistorie(prev => [
      {
        zeitpunkt: new Date(),
        typ: 'charge',
        label: result.map(c => c.chargennummer).join(', '),
        erfolgreich: true
      },
      ...prev
    ]);
    
    setSuccess(`${result.length} Charge(n) erfolgreich erfasst`);
  };
  
  // QR-Code scannen (über die Scanner-Komponente)
  const handleQRCodeScan = async (qrCode: string) => {
    try {
      setLoading(true);
      
      if (!isOnline) {
        // Im Offline-Modus den Scan lokal speichern
        const mockResult: ScanResult = {
          type: 'charge',
          id: `offline-${Date.now()}`,
          label: `Offline-Scan: ${qrCode}`,
          data: { offlineData: true, originalCode: qrCode }
        };
        
        handleScanResultOffline(mockResult);
        setScanResult(mockResult);
        
        // Scan zur Historie hinzufügen
        setScanHistorie(prev => [
          {
            zeitpunkt: new Date(),
            typ: 'charge',
            label: `Offline-Scan: ${qrCode}`,
            erfolgreich: true
          },
          ...prev
        ]);
        
        setSuccess(`QR-Code offline gescannt. Wird verarbeitet, sobald eine Verbindung besteht.`);
      } else {
        // Im Online-Modus normal verarbeiten
        const result = await inventoryApi.verarbeiteQRCodeScan(qrCode, currentModus as any);
        setScanResult(result);
        
        // Scan zur Historie hinzufügen
        setScanHistorie(prev => [
          {
            zeitpunkt: new Date(),
            typ: result.type,
            label: result.label,
            erfolgreich: true
          },
          ...prev
        ]);
        
        // Je nach Typ des gescannten Codes unterschiedlich verarbeiten
        switch (result.type) {
          case 'lagerplatz':
            setScannedItems(prev => ({
              ...prev,
              lagerplatz: result
            }));
            setSuccess(`Lagerplatz ${result.label} erfolgreich gescannt`);
            break;
          case 'artikel':
            setScannedItems(prev => ({
              ...prev,
              artikel: result
            }));
            setSuccess(`Artikel ${result.label} erfolgreich gescannt`);
            
            // Bei Artikelscan direkt den Mengendialog öffnen
            setMengenDialog(true);
            break;
          case 'charge':
            // Hier wird die Charge direkt über die ChargenScanner-Komponente verarbeitet
            break;
          default:
            setSuccess(`${result.type} ${result.label} erfolgreich gescannt`);
        }
      }
    } catch (error) {
      console.error('Fehler beim Scannen:', error);
      setError('Der QR-Code konnte nicht verarbeitet werden');
      
      // Fehler zur Historie hinzufügen
      setScanHistorie(prev => [
        {
          zeitpunkt: new Date(),
          typ: 'error',
          label: 'Unbekannter QR-Code',
          erfolgreich: false
        },
        ...prev
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  // Warenbewegung buchen (Wareneingang, Warenausgang, Umlagerung)
  const handleWarenbewegungBuchen = async () => {
    try {
      setLoading(true);
      
      // Prüfen, ob alle notwendigen Daten vorhanden sind
      if (!scannedItems.artikel) {
        setError('Bitte zuerst einen Artikel scannen');
        return;
      }
      
      if (!scannedItems.menge || scannedItems.menge <= 0) {
        setError('Bitte eine gültige Menge angeben');
        return;
      }
      
      // Je nach Modus unterschiedliche Parameter für die Buchung
      const buchungsdaten: any = {
        typ: currentModus === 'warenausgang' ? 'ausgang' : 
             currentModus === 'wareneingang' ? 'eingang' : 'umlagerung',
        artikel_id: scannedItems.artikel.id,
        menge: scannedItems.menge,
        mitarbeiter_id: user.id,
        bemerkung: scannedItems.bemerkung
      };
      
      // Lagerplatz je nach Modus
      if (scannedItems.lagerplatz) {
        if (currentModus === 'wareneingang' || currentModus === 'umlagerung') {
          buchungsdaten.nach_lagerplatz_id = scannedItems.lagerplatz.id;
        }
        
        if (currentModus === 'warenausgang' || currentModus === 'umlagerung') {
          buchungsdaten.von_lagerplatz_id = scannedItems.lagerplatz.id;
        }
      }
      
      // Chargen hinzufügen, falls vorhanden
      if (scannedItems.chargen.length > 0) {
        buchungsdaten.chargen = scannedItems.chargen.map(charge => ({
          charge_id: charge.id,
          menge: charge.menge
        }));
      }
      
      if (!isOnline) {
        // Im Offline-Modus die Buchung lokal speichern
        await handleWarenbewegungBuchenOffline(buchungsdaten);
        
        // Scan-Daten zurücksetzen
        setScannedItems({ chargen: [] });
        setScanResult(null);
        
        // Buchung zur Historie hinzufügen
        setScanHistorie(prev => [
          {
            zeitpunkt: new Date(),
            typ: 'buchung',
            label: `Offline: ${scanModi[currentModus].title} für ${scannedItems.artikel?.label}`,
            erfolgreich: true
          },
          ...prev
        ]);
      } else {
        // Im Online-Modus normal buchen
        const result = await inventoryApi.bucheWarenbewegung(buchungsdaten);
        
        if (result.erfolg) {
          setSuccess(`${scanModi[currentModus].title} erfolgreich gebucht`);
          
          // Scan-Daten zurücksetzen
          setScannedItems({ chargen: [] });
          setScanResult(null);
          
          // Buchung zur Historie hinzufügen
          setScanHistorie(prev => [
            {
              zeitpunkt: new Date(),
              typ: 'buchung',
              label: `${scanModi[currentModus].title} für ${scannedItems.artikel?.label}`,
              erfolgreich: true
            },
            ...prev
          ]);
          
          // Bei Wareneingang die neuen Chargen anzeigen
          if (currentModus === 'wareneingang' && result.neue_chargen) {
            setScannedItems(prev => ({
              ...prev,
              chargen: result.neue_chargen || []
            }));
          }
        } else {
          setError(result.fehlermeldung || 'Buchung konnte nicht durchgeführt werden');
        }
      }
    } catch (error) {
      console.error('Fehler bei der Buchung:', error);
      setError('Die Buchung konnte nicht durchgeführt werden');
      
      // Fehler zur Historie hinzufügen
      setScanHistorie(prev => [
        {
          zeitpunkt: new Date(),
          typ: 'error',
          label: 'Buchungsfehler',
          erfolgreich: false
        },
        ...prev
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  // Menge bestätigen
  const handleMengeConfirm = () => {
    if (menge <= 0) {
      setError('Bitte eine gültige Menge eingeben');
      return;
    }
    
    setScannedItems(prev => ({
      ...prev,
      menge
    }));
    
    setMengenDialog(false);
  };
  
  // Format für Zeitanzeige in der Historie
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  return (
    <Box sx={{ pb: 7 }}>
      {/* Header */}
      <AppBar position="sticky" color="primary">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/mobile')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {scanModi[currentModus].title}
          </Typography>
          <Badge badgeContent={3} color="error">
            <NotificationsIcon />
          </Badge>
        </Toolbar>
        
        {/* Tabs für verschiedene Bereiche der Scanner-Seite */}
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ bgcolor: 'background.paper' }}
        >
          <Tab label="Scanner" icon={<QrCodeScannerIcon />} />
          <Tab label="Aufgaben" icon={<AssignmentIcon />} />
          <Tab label="Historie" icon={<InventoryIcon />} />
        </Tabs>
      </AppBar>
      
      <Container maxWidth="sm" sx={{ mt: 2 }}>
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
        
        {/* Offline/Online-Status-Anzeige */}
        {!isOnline && (
          <Alert 
            severity="warning" 
            sx={{ mb: 2 }}
            variant="filled"
          >
            Offline-Modus: Änderungen werden gespeichert und später synchronisiert
          </Alert>
        )}
        
        {isOnline && syncStatus.pendingItems > 0 && (
          <Alert 
            severity="info" 
            sx={{ mb: 2 }}
            variant="filled"
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={syncData}
                disabled={syncStatus.syncing}
              >
                {syncStatus.syncing ? <CircularProgress size={20} color="inherit" /> : 'Jetzt sync.'}
              </Button>
            }
          >
            {syncStatus.pendingItems} Elemente warten auf Synchronisation
          </Alert>
        )}
        
        {/* Modus-Auswahl */}
        <Paper sx={{ mb: 2, overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
            {Object.values(scanModi).map((modus) => (
              <Button
                key={modus.id}
                onClick={() => handleModusChange(modus.id)}
                sx={{
                  flex: '1 0 48%',
                  m: 0.5,
                  p: 1,
                  borderLeft: currentModus === modus.id ? `4px solid ${modus.color}` : undefined,
                  bgcolor: currentModus === modus.id ? 'action.selected' : undefined,
                  justifyContent: 'flex-start',
                  textAlign: 'left'
                }}
              >
                <Box sx={{ 
                  color: modus.color, 
                  display: 'flex',
                  alignItems: 'center',
                  mr: 1 
                }}>
                  {modus.icon}
                </Box>
                <Box>
                  <Typography variant="subtitle2">{modus.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {modus.description}
                  </Typography>
                </Box>
              </Button>
            ))}
          </Box>
        </Paper>
        
        {/* Tab-Inhalte */}
        {tabValue === 0 && (
          <>
            {/* Scanner-Tab */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {scanModi[currentModus].title}-Scanner
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Scannen Sie Artikel, Chargen und Lagerplätze für {scanModi[currentModus].title.toLowerCase()}.
                </Typography>
              </Box>
              
              {/* Scanner-Komponente */}
              <ChargenScanner
                modus={currentModus as any}
                onChargeSelected={handleScanResult}
                benötigteMenge={scannedItems.menge}
                artikelId={scannedItems.artikel?.id}
                lagerplatzId={scannedItems.lagerplatz?.id}
              />
            </Paper>
            
            {/* Aktuell erfasste Daten */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Aktuelle Erfassung
              </Typography>
              
              <List>
                {/* Artikel */}
                <ListItem>
                  <ListItemIcon>
                    <InventoryIcon color={scannedItems.artikel ? "primary" : "disabled"} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Artikel"
                    secondary={scannedItems.artikel ? 
                      `${scannedItems.artikel.label}${scannedItems.menge ? ` (${scannedItems.menge} Stk)` : ''}` : 
                      'Noch nicht gescannt'}
                  />
                </ListItem>
                
                {/* Lagerplatz */}
                <ListItem>
                  <ListItemIcon>
                    <RoomIcon color={scannedItems.lagerplatz ? "primary" : "disabled"} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Lagerplatz"
                    secondary={scannedItems.lagerplatz ? 
                      `${scannedItems.lagerplatz.label}${scannedItems.lagerplatz.data?.lagerplatz_name ? ` (${scannedItems.lagerplatz.data.lagerplatz_name})` : ''}` : 
                      'Noch nicht gescannt'}
                  />
                </ListItem>
                
                {/* Chargen */}
                <ListItem>
                  <ListItemIcon>
                    <Badge badgeContent={scannedItems.chargen.length} color="primary">
                      <CalendarIcon color={scannedItems.chargen.length > 0 ? "primary" : "disabled"} />
                    </Badge>
                  </ListItemIcon>
                  <ListItemText
                    primary="Chargen"
                    secondary={scannedItems.chargen.length > 0 ? 
                      `${scannedItems.chargen.length} Charge(n) erfasst` : 
                      'Noch nicht gescannt'}
                  />
                </ListItem>
              </List>
              
              {/* Bemerkung */}
              <TextField
                label="Bemerkung"
                fullWidth
                multiline
                rows={2}
                variant="outlined"
                value={scannedItems.bemerkung || ''}
                onChange={(e) => setScannedItems(prev => ({
                  ...prev,
                  bemerkung: e.target.value
                }))}
                sx={{ mt: 2, mb: 2 }}
              />
              
              {/* Buchungs-Button */}
              <Button
                variant="contained"
                color="primary"
                fullWidth
                disabled={!scannedItems.artikel || !scannedItems.menge}
                onClick={handleWarenbewegungBuchen}
                startIcon={<SaveIcon />}
              >
                {scanModi[currentModus].title} buchen
              </Button>
            </Paper>
          </>
        )}
        
        {tabValue === 1 && (
          // Aufgaben-Tab
          <Paper sx={{ mb: 2 }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Offene {scanModi[currentModus].title}-Aufgaben
              </Typography>
            </Box>
            
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : aufgaben.length > 0 ? (
              <List>
                {aufgaben.map((aufgabe) => (
                  <React.Fragment key={aufgabe.id}>
                    <ListItemButton onClick={() => setSelectedAufgabe(aufgabe)}>
                      <ListItemIcon>
                        {scanModi[currentModus].icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={aufgabe.bezeichnung}
                        secondary={
                          <>
                            {aufgabe.artikel_name && `Artikel: ${aufgabe.artikel_name}`}
                            {aufgabe.menge && aufgabe.einheit && `, Menge: ${aufgabe.menge} ${aufgabe.einheit}`}
                            {aufgabe.lagerort && `, Lagerort: ${aufgabe.lagerort}`}
                            {aufgabe.frist && `, Frist: ${new Date(aufgabe.frist).toLocaleDateString('de-DE')}`}
                          </>
                        }
                      />
                    </ListItemButton>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box p={3} textAlign="center">
                <Typography color="text.secondary">
                  Keine offenen Aufgaben für {scanModi[currentModus].title} vorhanden
                </Typography>
              </Box>
            )}
          </Paper>
        )}
        
        {tabValue === 2 && (
          // Historie-Tab
          <Paper sx={{ mb: 2 }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Scanner-Historie
              </Typography>
            </Box>
            
            {scanHistorie.length > 0 ? (
              <List>
                {scanHistorie.map((eintrag, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemIcon>
                        {eintrag.erfolgreich ? (
                          eintrag.typ === 'charge' ? (
                            <CalendarIcon color="primary" />
                          ) : eintrag.typ === 'lagerplatz' ? (
                            <RoomIcon color="primary" />
                          ) : eintrag.typ === 'artikel' ? (
                            <InventoryIcon color="primary" />
                          ) : eintrag.typ === 'buchung' ? (
                            <CheckIcon color="success" />
                          ) : (
                            <CheckIcon color="primary" />
                          )
                        ) : (
                          <ErrorIcon color="error" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={eintrag.label}
                        secondary={`${formatTime(eintrag.zeitpunkt)} - ${eintrag.typ}`}
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box p={3} textAlign="center">
                <Typography color="text.secondary">
                  Keine Scanner-Historie vorhanden
                </Typography>
              </Box>
            )}
          </Paper>
        )}
      </Container>
      
      {/* Mengen-Dialog */}
      <Dialog open={mengenDialog} onClose={() => setMengenDialog(false)}>
        <DialogTitle>
          Menge eingeben
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {scannedItems.artikel && (
              <Typography variant="body2" gutterBottom>
                Artikel: {scannedItems.artikel.label}
              </Typography>
            )}
            
            <TextField
              label="Menge"
              type="number"
              fullWidth
              value={menge}
              onChange={(e) => setMenge(Math.max(1, parseInt(e.target.value) || 0))}
              inputProps={{ min: 1 }}
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMengenDialog(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleMengeConfirm} 
            variant="contained"
          >
            Bestätigen
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Bottom Navigation */}
      <Box
        sx={{
          width: '100%',
          position: 'fixed',
          bottom: 0,
          zIndex: 1000,
          borderTop: '1px solid',
          borderColor: 'divider',
          boxShadow: 3,
          bgcolor: 'background.paper'
        }}
      >
        <Grid container>
          <Grid item xs={3}>
            <Button
              fullWidth
              onClick={() => navigate('/mobile')}
              sx={{ 
                py: 1.5,
                borderRadius: 0,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <HomeIcon sx={{ mb: 0.5 }} />
              <Typography variant="caption">Home</Typography>
            </Button>
          </Grid>
          <Grid item xs={3}>
            <Button
              fullWidth
              onClick={() => {}}
              sx={{ 
                py: 1.5,
                borderRadius: 0,
                display: 'flex',
                flexDirection: 'column',
                color: 'primary.main'
              }}
            >
              <QrCodeScannerIcon sx={{ mb: 0.5 }} />
              <Typography variant="caption">Scanner</Typography>
            </Button>
          </Grid>
          <Grid item xs={3}>
            <Button
              fullWidth
              onClick={() => navigate('/mobile/inventar')}
              sx={{ 
                py: 1.5,
                borderRadius: 0,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <InventoryIcon sx={{ mb: 0.5 }} />
              <Typography variant="caption">Inventar</Typography>
            </Button>
          </Grid>
          <Grid item xs={3}>
            <Button
              fullWidth
              onClick={() => navigate('/mobile/profil')}
              sx={{ 
                py: 1.5,
                borderRadius: 0,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <PersonIcon sx={{ mb: 0.5 }} />
              <Typography variant="caption">Profil</Typography>
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default MobileScannerPage; 