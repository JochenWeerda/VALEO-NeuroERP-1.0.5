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
  IconButton
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import {
  Search as SearchIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  BarChart as BarChartIcon,
  SmartToy as AIIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { 
  getArtikelkonto, 
  ArtikelKonto as ArtikelKontoTyp,
  ArtikelkontoMetadaten
} from '../../services/artikelkontoApi';
import ArtikelKontoBuchungen from './ArtikelKontoBuchungen';
import ArtikelKontoKIAnalyse from './ArtikelKontoKIAnalyse';
import ArtikelKontoSummen from './ArtikelKontoSummen';
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
      id={`artikelkonto-tabpanel-${index}`}
      aria-labelledby={`artikelkonto-tab-${index}`}
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

const ArtikelKonto: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [artikelKonto, setArtikelKonto] = useState<ArtikelKontoTyp | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Suchparameter
  const [artikelNummer, setArtikelNummer] = useState<string>('10001');
  const [zeitraumVon, setZeitraumVon] = useState<Date | null>(new Date(new Date().getFullYear(), 0, 1));
  const [zeitraumBis, setZeitraumBis] = useState<Date | null>(new Date());
  const [niederlassung, setNiederlassung] = useState<string>('Alle');
  const [sortierung, setSortierung] = useState<string>('Datum');
  const [umsatzHauptkontoZugeordnet, setUmsatzHauptkontoZugeordnet] = useState<boolean>(true);
  
  // Funktionen
  const [summierungArtikelUmbuchungen, setSummierungArtikelUmbuchungen] = useState<boolean>(true);
  
  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  }, []);
  
  const handleSearch = useCallback(async () => {
    if (!artikelNummer) {
      setError('Bitte geben Sie eine Artikelnummer ein.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Parameter für die Suche zusammenstellen
      const parameter: Partial<ArtikelkontoMetadaten> = {
        Zeitraum_von: zeitraumVon ? zeitraumVon.toISOString().split('T')[0] : '',
        Zeitraum_bis: zeitraumBis ? zeitraumBis.toISOString().split('T')[0] : '',
        Niederlassung: niederlassung === 'Alle' ? '' : niederlassung,
        Sortierung: sortierung,
        UmsatzHauptkontoZugeordnet: umsatzHauptkontoZugeordnet
      };
      
      const data = await getArtikelkonto(artikelNummer, parameter);
      setArtikelKonto(data);
      setSuccess('Artikelkonto wurde erfolgreich geladen.');
      
      // Funktionsstatus von den geladenen Daten übernehmen
      if (data.Funktionen) {
        setSummierungArtikelUmbuchungen(data.Funktionen.SummierungArtikelUmbuchungen);
      }
    } catch (err) {
      setError('Fehler beim Laden des Artikelkontos.');
      console.error('Fehler beim Laden des Artikelkontos:', err);
    } finally {
      setLoading(false);
    }
  }, [artikelNummer, zeitraumVon, zeitraumBis, niederlassung, sortierung, umsatzHauptkontoZugeordnet]);
  
  useEffect(() => {
    // Beim ersten Laden Daten abrufen
    handleSearch();
  }, [handleSearch]);
  
  const handlePrint = useCallback((type: 'bewegungen' | 'kontoauszug') => {
    // Hier würde die Druckfunktion implementiert werden
    setSuccess(`Druckfunktion für ${type === 'bewegungen' ? 'Artikelbewegungen' : 'Kontoauszug'} wurde aufgerufen.`);
  }, []);

  // Memorisierte Komponenten
  const summenComponent = useMemo(() => {
    if (!artikelKonto) return null;
    return (
      <ArtikelKontoSummen 
        summen={artikelKonto.Summen}
        preise={artikelKonto.Preise}
        lagerstatus={artikelKonto.Lagerstatus}
      />
    );
  }, [artikelKonto]);

  const buchungenComponent = useMemo(() => {
    if (!artikelKonto) return null;
    return (
      <ArtikelKontoBuchungen 
        buchungen={artikelKonto.Tabelle_Buchungen}
        summierungArtikelUmbuchungen={summierungArtikelUmbuchungen}
      />
    );
  }, [artikelKonto, summierungArtikelUmbuchungen]);

  const kiAnalyseComponent = useMemo(() => {
    if (!artikelKonto) return null;
    return (
      <ArtikelKontoKIAnalyse 
        artikelNummer={artikelKonto.Metadaten.Artikelnummer} 
      />
    );
  }, [artikelKonto]);
  
  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Artikelkonto
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Artikelnummer"
              value={artikelNummer}
              onChange={(e) => setArtikelNummer(e.target.value)}
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
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
              <DatePicker
                label="Zeitraum von"
                value={zeitraumVon}
                onChange={(date) => setZeitraumVon(date)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
              <DatePicker
                label="Zeitraum bis"
                value={zeitraumBis}
                onChange={(date) => setZeitraumBis(date)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Niederlassung</InputLabel>
              <Select
                value={niederlassung}
                label="Niederlassung"
                onChange={(e) => setNiederlassung(e.target.value)}
              >
                <MenuItem value="Alle">Alle Niederlassungen</MenuItem>
                <MenuItem value="Hauptsitz">Hauptsitz</MenuItem>
                <MenuItem value="Filiale 1">Filiale 1</MenuItem>
                <MenuItem value="Filiale 2">Filiale 2</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sortierung</InputLabel>
              <Select
                value={sortierung}
                label="Sortierung"
                onChange={(e) => setSortierung(e.target.value)}
              >
                <MenuItem value="Datum">Datum</MenuItem>
                <MenuItem value="BelegNr">Belegnummer</MenuItem>
                <MenuItem value="Menge">Menge</MenuItem>
                <MenuItem value="Gesamtbetrag">Gesamtbetrag</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={umsatzHauptkontoZugeordnet}
                  onChange={(e) => setUmsatzHauptkontoZugeordnet(e.target.checked)}
                />
              }
              label="Nur Umsatz-Hauptkonto zugeordnete Buchungen"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
              >
                Aufbereiten
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={() => handlePrint('bewegungen')}
              >
                Artikelbewegungen drucken
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={() => handlePrint('kontoauszug')}
              >
                Kontoauszug drucken
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
        
        {artikelKonto && (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {artikelKonto.Metadaten.Artikelbezeichnung} ({artikelKonto.Metadaten.Artikelnummer})
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  {summenComponent}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="subtitle1" gutterBottom>
                      <AIIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
                      KI-Prognose (30 Tage)
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<AssessmentIcon />}
                        onClick={() => setTabValue(1)}
                        fullWidth
                      >
                        KI-Analyse anzeigen
                      </Button>
                    </Box>
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
              <FormControlLabel
                control={
                  <Checkbox
                    checked={summierungArtikelUmbuchungen}
                    onChange={(e) => setSummierungArtikelUmbuchungen(e.target.checked)}
                  />
                }
                label="Summierung Artikel-Umbuchungen"
              />
              
              {buchungenComponent}
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              {kiAnalyseComponent}
            </TabPanel>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default ArtikelKonto; 