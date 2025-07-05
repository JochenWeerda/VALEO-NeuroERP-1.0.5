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
  CircularProgress,
  Rating,
  Stack
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  PriceChange as PriceChangeIcon,
  Assessment as AssessmentIcon,
  SmartToy as AIIcon,
  Refresh as RefreshIcon,
  MonetizationOn as MonetizationOnIcon,
  Receipt as ReceiptIcon,
  ErrorOutline as ErrorOutlineIcon
} from '@mui/icons-material';
import { 
  getKIAnalyse, 
  getAnomalieanalyse, 
  OffenePostenKIErweiterung 
} from '../../services/offenePostenApi';

interface OffenePostenKIAnalyseProps {
  kontoNr: string;
}

const OffenePostenKIAnalyse: React.FC<OffenePostenKIAnalyseProps> = ({ kontoNr }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [kiAnalyse, setKiAnalyse] = useState<OffenePostenKIErweiterung | null>(null);
  const [anomalien, setAnomalien] = useState<{
    Anomalien: { 
      RechnungsNr: string;
      Beschreibung: string;
      Schweregrad: 'niedrig' | 'mittel' | 'hoch';
      Typ: string;
    }[]
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Alle Daten parallel laden
      const [kiAnalyseData, anomalienData] = await Promise.all([
        getKIAnalyse(kontoNr),
        getAnomalieanalyse(kontoNr)
      ]);
      
      setKiAnalyse(kiAnalyseData);
      setAnomalien(anomalienData);
    } catch (err) {
      setError('Fehler beim Laden der KI-Analyse-Daten.');
      console.error('Fehler beim Laden der KI-Analyse-Daten:', err);
    } finally {
      setLoading(false);
    }
  }, [kontoNr]);
  
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  const getRisikoLevel = useCallback((score: number): {
    label: string;
    color: string;
    icon: React.ReactNode;
  } => {
    if (score < 20) {
      return { 
        label: 'Niedriges Risiko', 
        color: 'success.main',
        icon: <CheckCircleIcon color="success" />
      };
    } else if (score < 50) {
      return { 
        label: 'Mittleres Risiko', 
        color: 'warning.main',
        icon: <WarningIcon color="warning" />
      };
    } else {
      return { 
        label: 'Hohes Risiko', 
        color: 'error.main',
        icon: <ErrorIcon color="error" />
      };
    }
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
  
  // Memoize complex UI elements
  const loadingDisplay = useMemo(() => {
    if (loading && !kiAnalyse) {
      return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
          <CircularProgress size={60} thickness={5} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            KI-Analyse wird durchgeführt...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Die KI analysiert Zahlungsverhalten, Risiken und identifiziert Anomalien.
          </Typography>
        </Box>
      );
    }
    return null;
  }, [loading, kiAnalyse]);
  
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
  
  const zahlungsprognoseCard = useMemo(() => {
    if (!kiAnalyse) return null;
    
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle1" fontWeight="medium">
              <AccessTimeIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
              Zahlungsprognose
            </Typography>
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Zahlungswahrscheinlichkeit
                </Typography>
                <Box display="flex" alignItems="center">
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {(kiAnalyse.Zahlungswahrscheinlichkeit * 100).toFixed(0)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={kiAnalyse.Zahlungswahrscheinlichkeit * 100} 
                  sx={{ 
                    mt: 1, 
                    height: 8, 
                    borderRadius: 5,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: kiAnalyse.Zahlungswahrscheinlichkeit > 0.7 ? 'success.main' : 
                                        kiAnalyse.Zahlungswahrscheinlichkeit > 0.4 ? 'warning.main' : 'error.main'
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Prognostizierte Zahlung in
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="secondary.main">
                  {kiAnalyse.ZahlungsprognoseInTagen} Tagen
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {kiAnalyse.ZahlungsprognoseInTagen && kiAnalyse.ZahlungsprognoseInTagen > 0 ? (
                    <Chip 
                      label={kiAnalyse.ZahlungsprognoseInTagen > 14 ? "Verzögert" : "Pünktlich"} 
                      color={kiAnalyse.ZahlungsprognoseInTagen > 14 ? "warning" : "success"}
                      size="small"
                      variant="outlined"
                    />
                  ) : (
                    <Chip 
                      label="Unbekannt" 
                      color="default"
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Empfohlene Mahnstufe
              </Typography>
              <Box display="flex" alignItems="center">
                <Chip
                  label={`Stufe ${kiAnalyse.Empfohlene_Mahnstufe}`}
                  color={kiAnalyse.Empfohlene_Mahnstufe > 1 ? "warning" : "default"}
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2">
                  {kiAnalyse.Empfohlene_Mahnstufe === 0 ? "Keine Mahnung erforderlich" :
                   kiAnalyse.Empfohlene_Mahnstufe === 1 ? "Zahlungserinnerung empfohlen" :
                   kiAnalyse.Empfohlene_Mahnstufe === 2 ? "Erste Mahnung empfohlen" : "Nachdrückliche Mahnung empfohlen"}
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }, [kiAnalyse]);
  
  const risikoAnalyseCard = useMemo(() => {
    if (!kiAnalyse) return null;
    
    const risikoInfo = getRisikoLevel(kiAnalyse.RisikoScore);
    
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle1" fontWeight="medium">
              <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
              Risikoanalyse
            </Typography>
            {risikoInfo.icon}
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Risiko-Score
            </Typography>
            <Box display="flex" alignItems="center">
              <Typography variant="h4" fontWeight="bold" sx={{ color: risikoInfo.color }}>
                {kiAnalyse.RisikoScore}/100
              </Typography>
            </Box>
            
            <Box sx={{ mt: 1, mb: 2 }}>
              <Chip 
                label={risikoInfo.label} 
                sx={{ bgcolor: risikoInfo.color, color: 'white' }}
                size="small"
              />
            </Box>
            
            <LinearProgress 
              variant="determinate" 
              value={kiAnalyse.RisikoScore} 
              sx={{ 
                mt: 1, 
                height: 8, 
                borderRadius: 5,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: risikoInfo.color
                }
              }}
            />
            
            <Divider sx={{ my: 2 }} />
            
            {kiAnalyse.Empfehlungen && kiAnalyse.Empfehlungen.length > 0 && (
              <Box>
                <Typography variant="body2" fontWeight="medium" gutterBottom>
                  KI-Empfehlungen:
                </Typography>
                <List dense disablePadding>
                  {kiAnalyse.Empfehlungen.map((empfehlung, index) => (
                    <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <MonetizationOnIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={empfehlung} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  }, [kiAnalyse, getRisikoLevel]);
  
  const anomalienTabelle = useMemo(() => {
    if (!anomalien || anomalien.Anomalien.length === 0) return null;
    
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          <ErrorOutlineIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'error.main' }} />
          Erkannte Anomalien
        </Typography>
        
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Rechnungs-Nr.</TableCell>
                <TableCell>Beschreibung</TableCell>
                <TableCell>Typ</TableCell>
                <TableCell>Schweregrad</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {anomalien.Anomalien.map((anomalie, index) => (
                <TableRow key={index}>
                  <TableCell>{anomalie.RechnungsNr}</TableCell>
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
  
  if (loading && !kiAnalyse) {
    return loadingDisplay;
  }
  
  if (error && !kiAnalyse) {
    return errorDisplay;
  }
  
  if (!kiAnalyse) {
    return null;
  }
  
  return (
    <Box sx={{ width: '100%' }}>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      
      {errorDisplay}
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          <AIIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          KI-Analyse für Konto {kontoNr}
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {zahlungsprognoseCard}
          </Grid>
          
          <Grid item xs={12} md={6}>
            {risikoAnalyseCard}
          </Grid>
        </Grid>
      </Box>
      
      {anomalienTabelle}
      
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

export default React.memo(OffenePostenKIAnalyse); 