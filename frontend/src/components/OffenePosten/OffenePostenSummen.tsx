import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Divider,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  PriceChange as PriceChangeIcon,
  AccountBalance as AccountBalanceIcon,
  Warning as WarningIcon,
  DateRange as DateRangeIcon,
  CreditCard as CreditCardIcon
} from '@mui/icons-material';
import { 
  OffenePostenSummenblock
} from '../../services/offenePostenApi';

interface OffenePostenSummenProps {
  summenblock: OffenePostenSummenblock;
  kontoNr: string;
  kontoName: string;
  kontoTyp: string;
}

const OffenePostenSummen: React.FC<OffenePostenSummenProps> = ({
  summenblock,
  kontoNr,
  kontoName,
  kontoTyp
}) => {
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    });
  };
  
  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="subtitle1" fontWeight="medium">
          Summen und Kennzahlen
        </Typography>
        <Typography 
          variant="caption" 
          color="text.secondary"
        >
          Letzte Bewegung: {new Date(summenblock.LetzteBewegungAm).toLocaleDateString('de-DE')}
        </Typography>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {kontoTyp} {kontoNr}
        </Typography>
        <Typography variant="h6" gutterBottom>
          {kontoName}
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                <AccountBalanceIcon fontSize="small" sx={{ verticalAlign: 'text-bottom', mr: 0.5, color: 'primary.main' }} />
                Offene Posten Gesamtsumme
              </Typography>
              <Typography variant="h5" fontWeight="medium" color="primary.main">
                {formatCurrency(summenblock.OPGesamtsumme)}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                <WarningIcon fontSize="small" sx={{ verticalAlign: 'text-bottom', mr: 0.5, color: 'error.main' }} />
                Fällige Summe
              </Typography>
              <Typography variant="h6" fontWeight="medium" color="error.main">
                {formatCurrency(summenblock.FaelligSumme)}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                <DateRangeIcon fontSize="small" sx={{ verticalAlign: 'text-bottom', mr: 0.5, color: 'info.main' }} />
                Nicht fällige Summe
              </Typography>
              <Typography variant="h6" fontWeight="medium" color="info.main">
                {formatCurrency(summenblock.NichtFaelligSumme)}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>
          
          <Grid item xs={12}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Aktueller Saldo
              </Typography>
              <Typography 
                variant="h5" 
                fontWeight="medium"
                color={summenblock.SaldoAktuell >= 0 ? 'success.main' : 'error.main'}
              >
                {formatCurrency(summenblock.SaldoAktuell)}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>
          
          <Grid item xs={6}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                <CreditCardIcon fontSize="small" sx={{ verticalAlign: 'text-bottom', mr: 0.5, color: 'primary.main' }} />
                Kreditlimit
              </Typography>
              <Typography variant="h6" fontWeight="medium">
                {formatCurrency(summenblock.Kreditlimit)}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                <PriceChangeIcon fontSize="small" sx={{ verticalAlign: 'text-bottom', mr: 0.5, color: 'secondary.main' }} />
                Auslastung
              </Typography>
              <Typography variant="h6" fontWeight="medium" color={
                summenblock.Kreditlimit === 0 ? 'text.secondary' :
                summenblock.OPGesamtsumme / summenblock.Kreditlimit > 0.8 ? 'error.main' :
                summenblock.OPGesamtsumme / summenblock.Kreditlimit > 0.5 ? 'warning.main' : 'success.main'
              }>
                {summenblock.Kreditlimit === 0 ? 
                  'k.A.' : 
                  `${Math.round(summenblock.OPGesamtsumme / summenblock.Kreditlimit * 100)}%`}
              </Typography>
            </Box>
          </Grid>
          
          {summenblock.Sperrgrund && (
            <Grid item xs={12}>
              <Box sx={{ mt: 1, bgcolor: 'error.main', color: 'white', p: 1, borderRadius: 1 }}>
                <Typography variant="body2" fontWeight="medium">
                  <WarningIcon fontSize="small" sx={{ verticalAlign: 'text-bottom', mr: 0.5 }} />
                  Sperrgrund: {summenblock.Sperrgrund}
                </Typography>
              </Box>
            </Grid>
          )}
          
          {summenblock.SkontoDatum && new Date(summenblock.SkontoDatum) > new Date() && (
            <Grid item xs={12}>
              <Box sx={{ mt: 1, bgcolor: 'success.light', color: 'success.contrastText', p: 1, borderRadius: 1 }}>
                <Typography variant="body2" fontWeight="medium">
                  Skonto bis: {new Date(summenblock.SkontoDatum).toLocaleDateString('de-DE')}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    </Paper>
  );
};

export default React.memo(OffenePostenSummen); 