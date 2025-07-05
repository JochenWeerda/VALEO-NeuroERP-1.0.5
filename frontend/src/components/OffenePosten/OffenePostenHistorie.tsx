import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Alert,
  Chip,
  Grid,
  Button
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Event as EventIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  HistoryEdu as HistoryEduIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { 
  getHistorie, 
  OffenePostenHistorieEintrag,
  OffenePostenBuchung
} from '../../services/offenePostenApi';

interface OffenePostenHistorieProps {
  kontoNr: string;
  buchung: OffenePostenBuchung;
  onClose: () => void;
}

const OffenePostenHistorie: React.FC<OffenePostenHistorieProps> = ({
  kontoNr,
  buchung,
  onClose
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [historie, setHistorie] = useState<OffenePostenHistorieEintrag[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const loadHistorie = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const historieData = await getHistorie(kontoNr, buchung.RechnungsNr);
      setHistorie(historieData);
    } catch (err) {
      setError('Fehler beim Laden der Historie.');
      console.error('Fehler beim Laden der Historie:', err);
    } finally {
      setLoading(false);
    }
  }, [kontoNr, buchung.RechnungsNr]);
  
  useEffect(() => {
    loadHistorie();
  }, [loadHistorie]);
  
  const formatBetrag = (betrag: number, sh: string): string => {
    return `${sh === 'H' && betrag > 0 ? '-' : ''}${betrag.toLocaleString('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    })}`;
  };
  
  return (
    <Paper sx={{ p: 2, maxWidth: 600, mx: 'auto' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6">
          <HistoryEduIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Buchungshistorie
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
              Rechnungsart
            </Typography>
            <Typography variant="body1">
              {buchung.RechnungsArt}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Rechnungsdatum
            </Typography>
            <Typography variant="body1">
              {new Date(buchung.Datum).toLocaleDateString('de-DE')}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Ursprungsbetrag
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {formatBetrag(buchung.OPBetrag, buchung.SH)}
            </Typography>
          </Grid>
        </Grid>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Typography variant="subtitle1" gutterBottom>
        Historische Buchungen
      </Typography>
      
      {historie.length === 0 && !loading ? (
        <Alert severity="info">Keine Historiendaten verfügbar.</Alert>
      ) : (
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {historie.map((eintrag, index) => (
            <ListItem
              key={index}
              sx={{
                borderLeft: '3px solid',
                borderLeftColor: eintrag.SH === 'S' ? 'success.main' : 'error.main',
                mb: 1,
                bgcolor: 'background.paper',
                borderRadius: '0 4px 4px 0',
                boxShadow: 1
              }}
            >
              <ListItemIcon>
                {eintrag.SH === 'S' ? (
                  <ArrowUpwardIcon color="success" />
                ) : (
                  <ArrowDownwardIcon color="error" />
                )}
              </ListItemIcon>
              
              <ListItemText
                primary={
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1" fontWeight="medium">
                      {eintrag.Text}
                    </Typography>
                    <Typography variant="body1" fontWeight="medium" color={eintrag.SH === 'S' ? 'success.main' : 'error.main'}>
                      {formatBetrag(eintrag.BuchBetrag, eintrag.SH)}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box mt={1}>
                    <Grid container spacing={1}>
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center">
                          <EventIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {new Date(eintrag.Datum).toLocaleDateString('de-DE')} {eintrag.Uhrzeit}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center">
                          <ReceiptIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {eintrag.VerrechnungRechNr || '-'}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="center" mt={0.5}>
                          <Chip 
                            label={eintrag.Typ} 
                            size="small" 
                            color={eintrag.SH === 'S' ? 'success' : 'error'} 
                            variant="outlined"
                            sx={{ mr: 1 }}
                          />
                          
                          {eintrag.VeraenderungBetrag !== 0 && (
                            <Chip 
                              label={`Veränderung: ${formatBetrag(eintrag.VeraenderungBetrag, eintrag.SH)}`} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default OffenePostenHistorie; 