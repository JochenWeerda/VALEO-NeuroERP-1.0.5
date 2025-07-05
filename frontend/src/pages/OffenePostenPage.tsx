import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  LinearProgress,
  Alert,
  Checkbox,
  FormControlLabel,
  IconButton,
  Dialog,
  DialogContent,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import {
  Search as SearchIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  SmartToy as AIIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { 
  getOffenePosten, 
  OffenePosten,
  OffenePostenBuchung,
  OffenePostenKIErweiterung
} from '../services/offenePostenApi';
import OffenePostenListe from '../components/OffenePosten/OffenePostenListe';
import OffenePostenKIAnalyse from '../components/OffenePosten/OffenePostenKIAnalyse';
import OffenePostenSummen from '../components/OffenePosten/OffenePostenSummen';
import OffenePostenHistorie from '../components/OffenePosten/OffenePostenHistorie';
import OffenePostenZahlungsprognose from '../components/OffenePosten/OffenePostenZahlungsprognose';
import de from 'date-fns/locale/de';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`offeneposten-tabpanel-${index}`}
      aria-labelledby={`offeneposten-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const OffenePostenPage: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  
  const [tabValue, setTabValue] = useState(0);
  const [offenePosten, setOffenePosten] = useState<OffenePosten | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Suchparameter
  const [kontoNr, setKontoNr] = useState<string>('D10001');
  const [datumVon, setDatumVon] = useState<Date | null>(new Date(new Date().getFullYear(), 0, 1));
  const [datumBis, setDatumBis] = useState<Date | null>(new Date());
  const [nurFaellige, setNurFaellige] = useState<boolean>(false);
  const [kontoTyp, setKontoTyp] = useState<string>('Debitor');
  const [status, setStatus] = useState<string>('offen');
  
  // Dialog-Steuerung
  const [selectedBuchung, setSelectedBuchung] = useState<OffenePostenBuchung | null>(null);
  const [showHistorieDialog, setShowHistorieDialog] = useState<boolean>(false);
  const [showZahlungsprognoseDialog, setShowZahlungsprognoseDialog] = useState<boolean>(false);
  
  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  }, []);
  
  const handleSearch = useCallback(async () => {
    if (!kontoNr) {
      setError('Bitte geben Sie eine Kontonummer ein.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Parameter für die Suche zusammenstellen
      const filter = {
        typ: kontoTyp,
        status: status,
        nurFaellige: nurFaellige,
        datumVon: datumVon ? datumVon.toISOString().split('T')[0] : undefined,
        datumBis: datumBis ? datumBis.toISOString().split('T')[0] : undefined
      };
      
      const data = await getOffenePosten(kontoNr, filter);
      setOffenePosten(data);
      setSuccess('Offene Posten wurden erfolgreich geladen.');
    } catch (err) {
      setError('Fehler beim Laden der Offenen Posten.');
      console.error('Fehler beim Laden der Offenen Posten:', err);
    } finally {
      setLoading(false);
    }
  }, [kontoNr, kontoTyp, status, nurFaellige, datumVon, datumBis]);
  
  useEffect(() => {
    // Beim ersten Laden Daten abrufen
    handleSearch();
  }, [handleSearch]);
  
  const handlePrint = useCallback(() => {
    // Hier würde die Druckfunktion implementiert werden
    setSuccess('Druckfunktion für Offene Posten wurde aufgerufen.');
  }, []);
  
  const handleRowClick = useCallback((buchung: OffenePostenBuchung) => {
    setSelectedBuchung(buchung);
    // Hier könnten zusätzliche Aktionen ausgeführt werden
  }, []);
  
  const handleHistorieClick = useCallback((buchung: OffenePostenBuchung) => {
    setSelectedBuchung(buchung);
    setShowHistorieDialog(true);
  }, []);
  
  const handleZahlungsprognoseClick = useCallback((buchung: OffenePostenBuchung) => {
    setSelectedBuchung(buchung);
    setShowZahlungsprognoseDialog(true);
  }, []);
  
  const closeHistorieDialog = useCallback(() => {
    setShowHistorieDialog(false);
  }, []);
  
  const closeZahlungsprognoseDialog = useCallback(() => {
    setShowZahlungsprognoseDialog(false);
  }, []);
  
  // Memorisierte Komponenten
  const summenComponent = useMemo(() => {
    if (!offenePosten) return null;
    return (
      <OffenePostenSummen 
        summenblock={offenePosten.Summenblock}
        kontoNr={offenePosten.Metadaten.KontoNr}
        kontoName={offenePosten.Metadaten.Name}
        kontoTyp={offenePosten.Metadaten.Typ}
      />
    );
  }, [offenePosten]);

  const buchungenComponent = useMemo(() => {
    if (!offenePosten) return null;
    return (
      <OffenePostenListe 
        buchungen={offenePosten.Buchungen}
        kiErweiterung={offenePosten.KI_Erweiterung}
        onRowClick={handleRowClick}
        onHistorieClick={handleHistorieClick}
        onZahlungsprognoseClick={handleZahlungsprognoseClick}
      />
    );
  }, [offenePosten, handleRowClick, handleHistorieClick, handleZahlungsprognoseClick]);

  const kiAnalyseComponent = useMemo(() => {
    if (!offenePosten) return null;
    return (
      <OffenePostenKIAnalyse 
        kontoNr={offenePosten.Metadaten.KontoNr}
      />
    );
  }, [offenePosten]);
  
  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Offene Posten
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Kontonummer"
              value={kontoNr}
              onChange={(e) => setKontoNr(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton 
                    size="small" 
                    onClick={handleSearch}
                    title="Suchen"
                  >
                    <SearchIcon />
                  </IconButton>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Kontotyp</InputLabel>
              <Select
                value={kontoTyp}
                label="Kontotyp"
                onChange={(e) => setKontoTyp(e.target.value)}
              >
                <MenuItem value="Debitor">Debitor</MenuItem>
                <MenuItem value="Kreditor">Kreditor</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                label="Status"
                onChange={(e) => setStatus(e.target.value)}
              >
                <MenuItem value="offen">Offen</MenuItem>
                <MenuItem value="bezahlt">Bezahlt</MenuItem>
                <MenuItem value="alle">Alle</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={nurFaellige}
                  onChange={(e) => setNurFaellige(e.target.checked)}
                />
              }
              label="Nur fällige Posten anzeigen"
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
              <DatePicker
                label="Zeitraum von"
                value={datumVon}
                onChange={(date) => setDatumVon(date)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
              <DatePicker
                label="Zeitraum bis"
                value={datumBis}
                onChange={(date) => setDatumBis(date)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
              >
                Suchen
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
              >
                Drucken
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleSearch}
              >
                Aktualisieren
              </Button>
            </Box>
          </Grid>
        </Grid>
        
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
        
        {offenePosten && (
          <>
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  {summenComponent}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Typography variant="subtitle1" gutterBottom>
                        <AIIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
                        KI-Analyse
                      </Typography>
                      
                      {offenePosten.KI_Erweiterung && (
                        <Chip 
                          label={`Risiko: ${offenePosten.KI_Erweiterung.RisikoScore}/100`} 
                          color={
                            offenePosten.KI_Erweiterung.RisikoScore < 20 ? "success" :
                            offenePosten.KI_Erweiterung.RisikoScore < 50 ? "warning" : "error"
                          } 
                          variant="outlined" 
                        />
                      )}
                    </Box>
                    
                    {offenePosten.KI_Erweiterung && (
                      <Box sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Zahlungswahrscheinlichkeit
                            </Typography>
                            <Typography variant="h6" fontWeight="medium" color="primary.main">
                              {(offenePosten.KI_Erweiterung.Zahlungswahrscheinlichkeit * 100).toFixed(0)}%
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Empfohlene Mahnstufe
                            </Typography>
                            <Typography variant="h6" fontWeight="medium">
                              {offenePosten.KI_Erweiterung.Empfohlene_Mahnstufe}
                            </Typography>
                          </Grid>
                        </Grid>
                        
                        <Box sx={{ mt: 2 }}>
                          <Button
                            variant="outlined"
                            startIcon={<AIIcon />}
                            onClick={() => setTabValue(1)}
                            fullWidth
                          >
                            Detaillierte KI-Analyse anzeigen
                          </Button>
                        </Box>
                      </Box>
                    )}
                    
                    {!offenePosten.KI_Erweiterung && (
                      <Box sx={{ mt: 2 }}>
                        <Alert severity="info">
                          KI-Analyse nicht verfügbar für dieses Konto.
                        </Alert>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Box>
            
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Buchungen" />
                <Tab label="KI-Analyse" />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              {buchungenComponent}
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              {kiAnalyseComponent}
            </TabPanel>
          </>
        )}
      </Paper>
      
      {/* Dialog für die Historie */}
      <Dialog 
        open={showHistorieDialog} 
        onClose={closeHistorieDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isSmallScreen}
      >
        <DialogContent sx={{ p: 0 }}>
          {selectedBuchung && offenePosten && (
            <OffenePostenHistorie 
              kontoNr={offenePosten.Metadaten.KontoNr}
              buchung={selectedBuchung}
              onClose={closeHistorieDialog}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Dialog für die Zahlungsprognose */}
      <Dialog 
        open={showZahlungsprognoseDialog} 
        onClose={closeZahlungsprognoseDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isSmallScreen}
      >
        <DialogContent sx={{ p: 0 }}>
          {selectedBuchung && offenePosten && (
            <OffenePostenZahlungsprognose 
              kontoNr={offenePosten.Metadaten.KontoNr}
              buchung={selectedBuchung}
              onClose={closeZahlungsprognoseDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default OffenePostenPage; 