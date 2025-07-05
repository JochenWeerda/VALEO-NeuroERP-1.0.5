import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Tooltip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
  PriceChange as PriceChangeIcon,
  Inventory as InventoryIcon,
  ShowChart as ShowChartIcon,
  SmartToy as AIIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { 
  getKIPrognosen, 
  analysiereAnomalien, 
  getOptimierungsVorschlaege, 
  ArtikelkontoKIPrognosen 
} from '../../services/artikelkontoApi';

interface ArtikelKontoKIAnalyseProps {
  artikelNummer: string;
}

const ArtikelKontoKIAnalyse: React.FC<ArtikelKontoKIAnalyseProps> = ({ artikelNummer }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [prognosen, setPrognosen] = useState<ArtikelkontoKIPrognosen | null>(null);
  const [anomalien, setAnomalien] = useState<{
    Anomalien: { 
      Datum: string;
      BelegNr: string;
      Beschreibung: string;
      Schweregrad: 'niedrig' | 'mittel' | 'hoch';
      Typ: string;
    }[]
  } | null>(null);
  const [optimierungen, setOptimierungen] = useState<{
    Vorschlaege: {
      Typ: 'Bestand' | 'Preis' | 'Einkauf' | 'Verkauf';
      Beschreibung: string;
      Potenzial: string;
      Empfehlung: string;
    }[]
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Alle Daten parallel laden
      const [prognosenData, anomalienData, optimierungenData] = await Promise.all([
        getKIPrognosen(artikelNummer),
        analysiereAnomalien(artikelNummer),
        getOptimierungsVorschlaege(artikelNummer)
      ]);
      
      setPrognosen(prognosenData);
      setAnomalien(anomalienData);
      setOptimierungen(optimierungenData);
    } catch (err) {
      setError('Fehler beim Laden der KI-Analyse-Daten.');
      console.error('Fehler beim Laden der KI-Analyse-Daten:', err);
    } finally {
      setLoading(false);
    }
  }, [artikelNummer]);
  
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  const getTrendIcon = useCallback((trend: 'steigend' | 'fallend' | 'stabil') => {
    switch (trend) {
      case 'steigend':
        return <TrendingUpIcon sx={{ color: 'success.main' }} />;
      case 'fallend':
        return <TrendingDownIcon sx={{ color: 'error.main' }} />;
      case 'stabil':
        return <TrendingFlatIcon sx={{ color: 'info.main' }} />;
      default:
        return null;
    }
  }, []);
  
  const getKonfidenzFarbe = useCallback((konfidenz: number) => {
    if (konfidenz >= 0.8) return 'success.main';
    if (konfidenz >= 0.6) return 'info.main';
    if (konfidenz >= 0.4) return 'warning.main';
    return 'error.main';
  }, []);
  
  const getSchweregraduFarbe = useCallback((schweregrad: 'niedrig' | 'mittel' | 'hoch') => {
    switch (schweregrad) {
      case 'niedrig':
        return 'info';
      case 'mittel':
        return 'warning';
      case 'hoch':
        return 'error';
      default:
        return 'default';
    }
  }, []);
  
  const getTypIcon = useCallback((typ: 'Bestand' | 'Preis' | 'Einkauf' | 'Verkauf') => {
    switch (typ) {
      case 'Bestand':
        return <InventoryIcon color="primary" />;
      case 'Preis':
        return <PriceChangeIcon color="secondary" />;
      case 'Einkauf':
        return <TrendingDownIcon color="info" />;
      case 'Verkauf':
        return <TrendingUpIcon color="success" />;
      default:
        return <ShowChartIcon />;
    }
  }, []);
  
  // Memoize complex UI elements
  const loadingDisplay = useMemo(() => {
    if (loading && !prognosen) {
      return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
          <CircularProgress size={60} thickness={5} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            KI-Analyse wird durchgeführt...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Die KI analysiert Verkaufsmuster, Bestandsentwicklung und Preisgestaltung.
          </Typography>
        </Box>
      );
    }
    return null;
  }, [loading, prognosen]);
  
  const errorDisplay = useMemo(() => {
    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      );
    }
    return null;
  }, [error]);
  
  const prognosenCards = useMemo(() => {
    if (!prognosen) return null;
    
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle1" fontWeight="medium">
                  <InventoryIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
                  Bestandsprognose (30 Tage)
                </Typography>
                {getTrendIcon(prognosen.Trendrichtung)}
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {prognosen.KI_Prognose_BestandIn30Tagen} Stk
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Konfidenz: {(prognosen.KonfidenzBestand * 100).toFixed(0)}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={prognosen.KonfidenzBestand * 100} 
                  sx={{ 
                    mt: 1, 
                    height: 8, 
                    borderRadius: 5,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getKonfidenzFarbe(prognosen.KonfidenzBestand)
                    }
                  }}
                />
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2">
                  {prognosen.PrognoseBasierteEmpfehlung || 'Keine spezifische Empfehlung verfügbar.'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle1" fontWeight="medium">
                  <PriceChangeIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'secondary.main' }} />
                  Preisprognose (VK)
                </Typography>
                {getTrendIcon(prognosen.Trendrichtung)}
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="secondary.main">
                  {prognosen.KI_Preisprognose_VK.toFixed(2)} €
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Konfidenz: {(prognosen.KonfidenzPreis * 100).toFixed(0)}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={prognosen.KonfidenzPreis * 100} 
                  sx={{ 
                    mt: 1, 
                    height: 8, 
                    borderRadius: 5,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getKonfidenzFarbe(prognosen.KonfidenzPreis)
                    }
                  }}
                />
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2">
                  Basierend auf Marktdaten und Ihren eigenen Verkaufsmustern wird ein VK-Preis von {prognosen.KI_Preisprognose_VK.toFixed(2)} € empfohlen.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }, [prognosen, getTrendIcon, getKonfidenzFarbe]);
  
  const abweichungsanalyse = useMemo(() => {
    if (!prognosen) return null;
    
    return (
      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            <ShowChartIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
            Abweichungsanalyse
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    IST vs. SOLL Abweichung
                  </Typography>
                  <Typography variant="h5" fontWeight="medium" color={
                    Math.abs(prognosen.Abweichung_ISTvsSOLL) > 10 ? 'error.main' :
                    Math.abs(prognosen.Abweichung_ISTvsSOLL) > 5 ? 'warning.main' : 'success.main'
                  }>
                    {prognosen.Abweichung_ISTvsSOLL > 0 ? '+' : ''}{prognosen.Abweichung_ISTvsSOLL} Stk
                  </Typography>
                </Box>
                
                <Typography variant="body2">
                  {Math.abs(prognosen.Abweichung_ISTvsSOLL) > 10
                    ? 'Signifikante Abweichung zwischen Ist- und Sollbestand festgestellt. Eine Bestandskorrektur wird empfohlen.'
                    : Math.abs(prognosen.Abweichung_ISTvsSOLL) > 5
                      ? 'Leichte Abweichung zwischen Ist- und Sollbestand festgestellt. Beobachtung empfohlen.'
                      : 'Ist- und Sollbestand stimmen gut überein.'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Transaktionsanomalien
                  </Typography>
                  <Box display="flex" alignItems="center">
                    {prognosen.Anomalie_Transaktion ? (
                      <>
                        <ErrorIcon sx={{ mr: 1 }} color="error" />
                        <Typography variant="h5" fontWeight="medium" color="error.main">
                          Anomalien erkannt
                        </Typography>
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon sx={{ mr: 1 }} color="success" />
                        <Typography variant="h5" fontWeight="medium" color="success.main">
                          Keine Anomalien
                        </Typography>
                      </>
                    )}
                  </Box>
                </Box>
                
                <Typography variant="body2">
                  {prognosen.Anomalie_Transaktion
                    ? prognosen.AnomalieDetails || 'Ungewöhnliche Transaktionsmuster wurden erkannt. Details unten.'
                    : 'Alle Transaktionen entsprechen den erwarteten Mustern.'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    );
  }, [prognosen]);
  
  const anomalienTabelle = useMemo(() => {
    if (!anomalien || anomalien.Anomalien.length === 0) return null;
    
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          <ErrorIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'error.main' }} />
          Erkannte Anomalien
        </Typography>
        
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Datum</TableCell>
                <TableCell>Beleg</TableCell>
                <TableCell>Beschreibung</TableCell>
                <TableCell>Typ</TableCell>
                <TableCell>Schweregrad</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {anomalien.Anomalien.map((anomalie, index) => (
                <TableRow key={index}>
                  <TableCell>{new Date(anomalie.Datum).toLocaleDateString('de-DE')}</TableCell>
                  <TableCell>{anomalie.BelegNr}</TableCell>
                  <TableCell>{anomalie.Beschreibung}</TableCell>
                  <TableCell>{anomalie.Typ}</TableCell>
                  <TableCell>
                    <Chip 
                      label={anomalie.Schweregrad} 
                      color={getSchweregraduFarbe(anomalie.Schweregrad)}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }, [anomalien, getSchweregraduFarbe]);
  
  const optimierungsvorschlaege = useMemo(() => {
    if (!optimierungen || optimierungen.Vorschlaege.length === 0) return null;
    
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          <AIIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
          Optimierungsvorschläge
        </Typography>
        
        <Grid container spacing={2}>
          {optimierungen.Vorschlaege.map((vorschlag, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Paper sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <ListItemIcon>
                    {getTypIcon(vorschlag.Typ)}
                  </ListItemIcon>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {vorschlag.Beschreibung}
                  </Typography>
                </Box>
                
                <Typography variant="body2" paragraph>
                  <strong>Potenzial:</strong> {vorschlag.Potenzial}
                </Typography>
                
                <Divider sx={{ my: 1 }} />
                
                <Typography variant="body2">
                  <strong>Empfehlung:</strong> {vorschlag.Empfehlung}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }, [optimierungen, getTypIcon]);
  
  if (loading && !prognosen) {
    return loadingDisplay;
  }
  
  if (error && !prognosen) {
    return errorDisplay;
  }
  
  if (!prognosen) {
    return null;
  }
  
  return (
    <Box sx={{ width: '100%' }}>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      
      {errorDisplay}
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          <AIIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          KI-Prognosen und Analysen
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Letzte Aktualisierung: {new Date(prognosen.PrognoseDatum).toLocaleString('de-DE')}
        </Typography>
        
        {prognosenCards}
      </Box>
      
      <Box sx={{ mb: 4 }}>
        {abweichungsanalyse}
      </Box>
      
      {anomalienTabelle}
      
      {optimierungsvorschlaege}
      
      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadData}
          disabled={loading}
        >
          Analyse aktualisieren
        </Button>
      </Box>
    </Box>
  );
};

export default React.memo(ArtikelKontoKIAnalyse); 