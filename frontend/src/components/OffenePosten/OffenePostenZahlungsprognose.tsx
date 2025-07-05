import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  LinearProgress,
  Alert,
  Chip,
  Grid,
  Button,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import {
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  SmartToy as SmartToyIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  AssessmentOutlined as AssessmentOutlinedIcon,
  HistoryToggleOff as HistoryToggleOffIcon,
  EmojiEvents as EmojiEventsIcon
} from '@mui/icons-material';
import { 
  getZahlungsprognose, 
  OffenePostenBuchung 
} from '../../services/offenePostenApi';

interface OffenePostenZahlungsprognoseProps {
  kontoNr: string;
  buchung: OffenePostenBuchung;
  onClose: () => void;
}

const OffenePostenZahlungsprognose: React.FC<OffenePostenZahlungsprognoseProps> = ({
  kontoNr,
  buchung,
  onClose
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [prognose, setPrognose] = useState<{
    WahrscheinlichkeitInProzent: number;
    PrognostiziertesZahlungsdatum: string;
    HistorischesZahlungsverhalten: string;
    Empfehlung: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const loadPrognose = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const prognoseData = await getZahlungsprognose(kontoNr, buchung.RechnungsNr);
      setPrognose(prognoseData);
    } catch (err) {
      setError('Fehler beim Laden der Zahlungsprognose.');
      console.error('Fehler beim Laden der Zahlungsprognose:', err);
    } finally {
      setLoading(false);
    }
  }, [kontoNr, buchung.RechnungsNr]);
  
  useEffect(() => {
    loadPrognose();
  }, [loadPrognose]);
  
  if (loading && !prognose) {
    return (
      <Paper sx={{ p: 2, maxWidth: 600, mx: 'auto' }}>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={4}>
          <CircularProgress size={60} thickness={5} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            KI-Zahlungsprognose wird erstellt...
          </Typography>
        </Box>
      </Paper>
    );
  }
  
  if (error && !prognose) {
    return (
      <Paper sx={{ p: 2, maxWidth: 600, mx: 'auto' }}>
        <Alert severity="error">{error}</Alert>
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button variant="outlined" onClick={onClose}>Schließen</Button>
        </Box>
      </Paper>
    );
  }
  
  if (!prognose) {
    return null;
  }
  
  // Berechne wieviele Tage die Zahlung vor oder nach Fälligkeit erfolgt
  const zahlungsdatumDate = new Date(prognose.PrognostiziertesZahlungsdatum);
  const faelligkeitsdatumDate = new Date(buchung.FaelligBis);
  const differenzInMs = zahlungsdatumDate.getTime() - faelligkeitsdatumDate.getTime();
  const differenzInTagen = Math.round(differenzInMs / (1000 * 60 * 60 * 24));
  
  // Bestimme den Status der Prognose
  const getZahlungsStatus = () => {
    if (differenzInTagen <= 0) {
      return { 
        text: 'Pünktlich', 
        color: 'success' as const,
        icon: <CheckIcon />
      };
    } else if (differenzInTagen <= 7) {
      return { 
        text: 'Leicht verzögert', 
        color: 'info' as const,
        icon: <AccessTimeIcon />
      };
    } else if (differenzInTagen <= 30) {
      return { 
        text: 'Verzögert', 
        color: 'warning' as const,
        icon: <HistoryToggleOffIcon />
      };
    } else {
      return { 
        text: 'Stark verzögert', 
        color: 'error' as const,
        icon: <AccessTimeIcon />
      };
    }
  };
  
  const status = getZahlungsStatus();
  
  return (
    <Paper sx={{ p: 2, maxWidth: 600, mx: 'auto' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6">
          <SmartToyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          KI-Zahlungsprognose
        </Typography>
        
        <Button
          variant="outlined"
          size="small"
          startIcon={<CloseIcon />}
          onClick={onClose}
        >
          Schließen
        </Button>
      </Box>
      
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Rechnung
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {buchung.RechnungsNr}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Fällig bis
            </Typography>
            <Typography variant="body1">
              {new Date(buchung.FaelligBis).toLocaleDateString('de-DE')}
            </Typography>
          </Grid>
        </Grid>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                Prognostizierte Zahlungswahrscheinlichkeit
              </Typography>
              
              <Box display="flex" alignItems="flex-end">
                <Typography variant="h3" fontWeight="bold">
                  {prognose.WahrscheinlichkeitInProzent}%
                </Typography>
                <Box 
                  component="span" 
                  sx={{ 
                    ml: 1, 
                    mb: 1, 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    bgcolor: prognose.WahrscheinlichkeitInProzent > 80 ? 'success.main' : 
                              prognose.WahrscheinlichkeitInProzent > 50 ? 'warning.main' : 'error.main',
                    color: '#fff',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1
                  }}
                >
                  {prognose.WahrscheinlichkeitInProzent > 80 ? 'Hoch' : 
                    prognose.WahrscheinlichkeitInProzent > 50 ? 'Mittel' : 'Niedrig'}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                <EventIcon fontSize="small" sx={{ verticalAlign: 'text-bottom', mr: 0.5 }} />
                Prognostiziertes Zahlungsdatum
              </Typography>
              
              <Typography variant="h6" color="text.primary" fontWeight="medium">
                {new Date(prognose.PrognostiziertesZahlungsdatum).toLocaleDateString('de-DE')}
              </Typography>
              
              <Box display="flex" alignItems="center" mt={1}>
                <Chip 
                  icon={status.icon}
                  label={status.text} 
                  color={status.color}
                  size="small" 
                />
                
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  {differenzInTagen === 0 ? 'Pünktlich' : 
                    differenzInTagen < 0 ? `${Math.abs(differenzInTagen)} Tage vor Fälligkeit` : 
                    `${differenzInTagen} Tage nach Fälligkeit`}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                <HistoryToggleOffIcon fontSize="small" sx={{ verticalAlign: 'text-bottom', mr: 0.5 }} />
                Historisches Zahlungsverhalten
              </Typography>
              
              <Typography variant="body1" color="text.primary">
                {prognose.HistorischesZahlungsverhalten}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card sx={{ bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                <EmojiEventsIcon fontSize="small" sx={{ verticalAlign: 'text-bottom', mr: 0.5 }} />
                KI-Empfehlung
              </Typography>
              
              <Typography variant="body1">
                {prognose.Empfehlung}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Box mt={3}>
        <Alert severity="info" icon={<AssessmentOutlinedIcon />}>
          Diese Prognose basiert auf historischen Zahlungsverhalten und KI-gestützter Analyse. Die tatsächliche Zahlung kann abweichen.
        </Alert>
      </Box>
    </Paper>
  );
};

export default OffenePostenZahlungsprognose; 