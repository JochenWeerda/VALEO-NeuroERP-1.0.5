import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Divider,
  Alert,
  IconButton,
  LinearProgress,
  Grid,
  Paper,
  TextField,
  Chip,
  Stack,
  SelectChangeEvent
} from '@mui/material';
import {
  Close as CloseIcon,
  Sync as SyncIcon,
  DateRange as DateRangeIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { de } from 'date-fns/locale';
import financeExportService, { 
  InternalAccountingOptions,
  InternalTransferReadiness
} from '../../services/financeExportService';

interface InterneFinanzbuchhaltungDialogProps {
  open: boolean;
  onClose: () => void;
}

const InterneFinanzbuchhaltungDialog: React.FC<InterneFinanzbuchhaltungDialogProps> = ({ 
  open, 
  onClose 
}) => {
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [readinessChecked, setReadinessChecked] = useState(false);
  const [readinessData, setReadinessData] = useState<InternalTransferReadiness | null>(null);
  
  // Übernahmeoptionen
  const [options, setOptions] = useState<InternalAccountingOptions>({
    periodId: new Date().toISOString().split('T')[0].substring(0, 7), // YYYY-MM
    startDate: '',
    endDate: '',
    transactionTypes: ['all'],
    autoPostJournalEntries: false,
    createDraftEntries: true,
    accountingRules: 'standard',
    notes: ''
  });

  // Effekt für Datumsvorschlag (aktueller Monat)
  useEffect(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);
    
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };
    
    setOptions(prev => ({
      ...prev,
      startDate: formatDate(monthStart),
      endDate: formatDate(monthEnd)
    }));
  }, []);

  const handleChange = (field: keyof InternalAccountingOptions, value: any) => {
    setOptions(prev => ({ ...prev, [field]: value }));
    // Bei Änderung der Periode Readiness zurücksetzen
    if (field === 'periodId' || field === 'startDate' || field === 'endDate') {
      setReadinessChecked(false);
      setReadinessData(null);
    }
  };

  const handleCheckboxChange = (field: keyof InternalAccountingOptions, checked: boolean) => {
    setOptions(prev => ({ ...prev, [field]: checked }));
  };

  const handleTransactionTypesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setOptions(prev => ({
      ...prev,
      transactionTypes: typeof value === 'string' ? [value as any] : value as any[]
    }));
  };

  const handleDateChange = (field: string, date: Date | null) => {
    if (!date) return;
    
    const dateStr = date.toISOString().split('T')[0];
    
    setOptions(prev => ({ ...prev, [field]: dateStr }));
    setReadinessChecked(false);
    setReadinessData(null);
  };

  const checkReadiness = async () => {
    try {
      setIsTransferring(true);
      setTransferError(null);
      
      const data = await financeExportService.checkInternalTransferReadiness(options.periodId);
      
      setReadinessData(data);
      setReadinessChecked(true);
    } catch (error) {
      console.error('Fehler beim Prüfen der Übernahmebereitschaft:', error);
      setTransferError('Die Übernahmebereitschaft konnte nicht geprüft werden.');
    } finally {
      setIsTransferring(false);
    }
  };

  const handleTransfer = async () => {
    setIsTransferring(true);
    setTransferError(null);
    setTransferSuccess(false);
    
    try {
      await financeExportService.transferToInternalAccounting(options);
      
      setTransferSuccess(true);
      
      // Nach erfolgreicher Übernahme Dialog nach 2 Sekunden schließen
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Fehler bei der Übernahme:', error);
      setTransferError('Die Übernahme konnte nicht durchgeführt werden. Bitte überprüfen Sie die Einstellungen und versuchen Sie es erneut.');
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={isTransferring ? undefined : onClose}
      fullWidth 
      maxWidth="md"
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Übernahme in die interne Finanzbuchhaltung</Typography>
          {!isTransferring && (
            <IconButton edge="end" onClick={onClose} aria-label="schließen">
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {transferError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {transferError}
          </Alert>
        )}
        
        {transferSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Daten wurden erfolgreich in die Finanzbuchhaltung übernommen.
          </Alert>
        )}
        
        {isTransferring && (
          <Box sx={{ width: '100%', mb: 2 }}>
            <LinearProgress />
            <Typography variant="body2" align="center" sx={{ mt: 1 }}>
              Vorgang läuft... Bitte warten.
            </Typography>
          </Box>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
              <DatePicker
                label="Startdatum"
                value={options.startDate ? new Date(options.startDate) : null}
                onChange={(date) => handleDateChange('startDate', date)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
              <DatePicker
                label="Enddatum"
                value={options.endDate ? new Date(options.endDate) : null}
                onChange={(date) => handleDateChange('endDate', date)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="period-select-label">Buchungsperiode</InputLabel>
              <Select
                labelId="period-select-label"
                value={options.periodId}
                label="Buchungsperiode"
                onChange={(e) => handleChange('periodId', e.target.value)}
              >
                {[...Array(12)].map((_, i) => {
                  const month = i + 1;
                  const now = new Date();
                  const year = now.getFullYear();
                  const period = `${year}-${month.toString().padStart(2, '0')}`;
                  const monthName = new Date(year, i, 1).toLocaleString('de-DE', { month: 'long' });
                  return (
                    <MenuItem key={period} value={period}>
                      {monthName} {year}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="transaction-types-label">Vorgangsarten</InputLabel>
              <Select
                labelId="transaction-types-label"
                multiple
                value={options.transactionTypes}
                label="Vorgangsarten"
                onChange={handleTransactionTypesChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      let label = '';
                      switch(value) {
                        case 'sales': label = 'Verkäufe'; break;
                        case 'purchases': label = 'Einkäufe'; break;
                        case 'payments': label = 'Zahlungen'; break;
                        case 'all': label = 'Alle'; break;
                      }
                      return <Chip key={value} label={label} size="small" />;
                    })}
                  </Box>
                )}
              >
                <MenuItem value="all">Alle Vorgänge</MenuItem>
                <MenuItem value="sales">Verkäufe</MenuItem>
                <MenuItem value="purchases">Einkäufe</MenuItem>
                <MenuItem value="payments">Zahlungen</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={options.autoPostJournalEntries}
                  onChange={(e) => handleCheckboxChange('autoPostJournalEntries', e.target.checked)}
                  name="autoPostJournalEntries"
                />
              }
              label="Buchungssätze automatisch buchen"
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={options.createDraftEntries}
                  onChange={(e) => handleCheckboxChange('createDraftEntries', e.target.checked)}
                  name="createDraftEntries"
                />
              }
              label="Bei Problemen Buchungsentwürfe erstellen"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Anmerkungen"
              value={options.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              multiline
              rows={2}
              fullWidth
            />
          </Grid>
        </Grid>
        
        {readinessChecked && readinessData && (
          <Paper variant="outlined" sx={{ p: 2, mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Übernahmebereitschaft
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Box mr={1}>
                    {readinessData.ready ? (
                      <CheckCircleIcon color="success" />
                    ) : readinessData.errors.length > 0 ? (
                      <ErrorIcon color="error" />
                    ) : (
                      <WarningIcon color="warning" />
                    )}
                  </Box>
                  <Typography>
                    {readinessData.ready 
                      ? 'Übernahme kann durchgeführt werden' 
                      : readinessData.errors.length > 0
                        ? 'Übernahme nicht möglich'
                        : 'Übernahme mit Einschränkungen möglich'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  Verkäufe: <strong>{readinessData.transactionCounts.sales}</strong>
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  Einkäufe: <strong>{readinessData.transactionCounts.purchases}</strong>
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  Zahlungen: <strong>{readinessData.transactionCounts.payments}</strong>
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  Sonstige: <strong>{readinessData.transactionCounts.other}</strong>
                </Typography>
              </Grid>
              
              {readinessData.warnings.length > 0 && (
                <Grid item xs={12}>
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    <Typography variant="body2" fontWeight="bold">Warnungen:</Typography>
                    <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                      {readinessData.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </Alert>
                </Grid>
              )}
              
              {readinessData.errors.length > 0 && (
                <Grid item xs={12}>
                  <Alert severity="error" sx={{ mt: 1 }}>
                    <Typography variant="body2" fontWeight="bold">Fehler:</Typography>
                    <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                      {readinessData.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Paper>
        )}
        
        {!readinessChecked && (
          <Box mt={3}>
            <Alert severity="info" icon={<InfoIcon />}>
              Bitte prüfen Sie vor der Übernahme die Bereitschaft der Daten.
            </Alert>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={onClose} 
          disabled={isTransferring}
        >
          Abbrechen
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<InfoIcon />}
          onClick={checkReadiness}
          disabled={isTransferring || !options.startDate || !options.endDate}
          sx={{ mr: 1 }}
        >
          Bereitschaft prüfen
        </Button>
        
        <Button
          variant="contained"
          startIcon={<SyncIcon />}
          onClick={handleTransfer}
          disabled={isTransferring || !readinessChecked || (readinessData && readinessData.errors.length > 0)}
          color="primary"
        >
          Übernahme starten
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InterneFinanzbuchhaltungDialog; 