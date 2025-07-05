import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  PriceChange as PriceChangeIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import { 
  ArtikelkontoSummen, 
  ArtikelkontoPreise, 
  ArtikelkontoLagerstatus 
} from '../../services/artikelkontoApi';

interface ArtikelKontoSummenProps {
  summen: ArtikelkontoSummen;
  preise: ArtikelkontoPreise;
  lagerstatus: ArtikelkontoLagerstatus;
}

const ArtikelKontoSummen: React.FC<ArtikelKontoSummenProps> = ({
  summen,
  preise,
  lagerstatus
}) => {
  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="subtitle1" gutterBottom>
        Summen und Kennzahlen
      </Typography>
      
      <Box sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                <TrendingUpIcon fontSize="small" sx={{ verticalAlign: 'text-bottom', mr: 0.5, color: 'success.main' }} />
                Einkauf gesamt
              </Typography>
              <Typography variant="h6" fontWeight="medium" color="success.main">
                {summen.KumulierteEinkaufsmenge} {preise.Bezugsgröße}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {summen.KumulierteEinkaufssumme.toFixed(2)} €
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                <TrendingDownIcon fontSize="small" sx={{ verticalAlign: 'text-bottom', mr: 0.5, color: 'error.main' }} />
                Verkauf gesamt
              </Typography>
              <Typography variant="h6" fontWeight="medium" color="error.main">
                {summen.KumulierteVerkaufsmenge} {preise.Bezugsgröße}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {summen.KumulierteVerkaufssumme.toFixed(2)} €
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>
          
          <Grid item xs={12}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Deckungsbeitrag / Saldo
              </Typography>
              <Typography 
                variant="h5" 
                fontWeight="medium"
                color={summen.Saldo >= 0 ? 'success.main' : 'error.main'}
              >
                {summen.Saldo.toFixed(2)} €
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>
          
          <Grid item xs={6}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                <PriceChangeIcon fontSize="small" sx={{ verticalAlign: 'text-bottom', mr: 0.5, color: 'primary.main' }} />
                Ø EK-Preis
              </Typography>
              <Typography variant="h6" fontWeight="medium">
                {preise.DurchschnittlicherEKPreis.toFixed(2)} €
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                <PriceChangeIcon fontSize="small" sx={{ verticalAlign: 'text-bottom', mr: 0.5, color: 'secondary.main' }} />
                Ø VK-Preis
              </Typography>
              <Typography variant="h6" fontWeight="medium">
                {preise.DurchschnittlicherVKPreis.toFixed(2)} €
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>
          
          <Grid item xs={6}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                <InventoryIcon fontSize="small" sx={{ verticalAlign: 'text-bottom', mr: 0.5, color: 'info.main' }} />
                Verfügbarer Bestand
              </Typography>
              <Typography variant="h6" fontWeight="medium" color="info.main">
                {lagerstatus.VerfügbarerBestand} {preise.Bezugsgröße}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                <InventoryIcon fontSize="small" sx={{ verticalAlign: 'text-bottom', mr: 0.5, color: 'info.main' }} />
                Aktueller Buchbestand
              </Typography>
              <Typography variant="h6" fontWeight="medium" color="info.main">
                {lagerstatus.AktuellerBuchbestand} {preise.Bezugsgröße}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default React.memo(ArtikelKontoSummen); 