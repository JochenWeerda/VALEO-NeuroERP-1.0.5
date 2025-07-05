import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Grid,
  Typography,
  Box,
  Divider,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  InsertDriveFile as CsvIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ChargenFilter, ChargenReportOptions } from '../../services/chargenReportService';
import chargenReportService from '../../services/chargenReportService';
import { de } from 'date-fns/locale';

interface ChargenBerichtsDialogProps {
  open: boolean;
  onClose: () => void;
}

const ChargenBerichtsDialog: React.FC<ChargenBerichtsDialogProps> = ({ open, onClose }) => {
  const [filter, setFilter] = useState<ChargenFilter>({
    artikelId: '',
    lieferantId: '',
    status: '',
    vonDatum: '',
    bisDatum: '',
    qualitaetsstatus: ''
  });
  const [options, setOptions] = useState<ChargenReportOptions>({
    format: 'pdf',
    includeVorwaertsVerfolgung: true,
    includeRueckwaertsVerfolgung: true,
    includeQualitaetsdaten: true,
    includeDokumente: true,
    includeRueckrufInfo: false,
    includeGrafiken: true,
    titel: 'Chargenbericht'
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const handleOptionCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setOptions(prev => ({ ...prev, [name]: checked }));
  };

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOptions(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: string, date: Date | null) => {
    if (date) {
      setFilter(prev => ({ ...prev, [name]: date.toISOString().split('T')[0] }));
    } else {
      setFilter(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const report = await chargenReportService.generateChargenReport(filter, options);
      setGeneratedReport(report);
      setSuccess('Bericht erfolgreich generiert');
    } catch (error) {
      console.error('Fehler beim Generieren des Berichts:', error);
      setError('Der Bericht konnte nicht generiert werden');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (format: 'pdf' | 'csv' | 'excel') => {
    if (!generatedReport) return;

    try {
      setLoading(true);
      
      const blob = await chargenReportService.exportChargenReport(generatedReport, format);
      
      // Download-Link erstellen und klicken
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${generatedReport.titel}_${new Date().toISOString().slice(0, 10)}.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess(`Bericht erfolgreich als ${format.toUpperCase()} exportiert`);
    } catch (error) {
      console.error('Fehler beim Exportieren des Berichts:', error);
      setError(`Der Bericht konnte nicht als ${format.toUpperCase()} exportiert werden`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Chargenbericht erstellen</Typography>
          <IconButton edge="end" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        <Grid container spacing={2}>
          {/* Linke Spalte: Filter */}
          <Grid item xs={12} md={6}>
            <Box p={2}>
              <Typography variant="h6" gutterBottom>Filter</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    name="artikelId"
                    label="Artikel"
                    value={filter.artikelId}
                    onChange={handleFilterChange}
                    select
                    fullWidth
                  >
                    <MenuItem value="">Alle Artikel</MenuItem>
                    <MenuItem value="101">Weizenschrot Premium</MenuItem>
                    <MenuItem value="102">Maismehl</MenuItem>
                    <MenuItem value="103">Schweinefutter Premium</MenuItem>
                    <MenuItem value="104">Mineralfutter Rind</MenuItem>
                  </TextField>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    name="qualitaetsstatus"
                    label="Qualitätsstatus"
                    value={filter.qualitaetsstatus}
                    onChange={handleFilterChange}
                    select
                    fullWidth
                  >
                    <MenuItem value="">Alle Status</MenuItem>
                    <MenuItem value="freigegeben">Freigegeben</MenuItem>
                    <MenuItem value="gesperrt">Gesperrt</MenuItem>
                    <MenuItem value="in_pruefung">In Prüfung</MenuItem>
                  </TextField>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
                    <DatePicker
                      label="Von Datum"
                      value={filter.vonDatum ? new Date(filter.vonDatum) : null}
                      onChange={(date) => handleDateChange('vonDatum', date)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
                    <DatePicker
                      label="Bis Datum"
                      value={filter.bisDatum ? new Date(filter.bisDatum) : null}
                      onChange={(date) => handleDateChange('bisDatum', date)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
            </Box>
          </Grid>
          
          {/* Rechte Spalte: Berichtsoptionen */}
          <Grid item xs={12} md={6}>
            <Box p={2}>
              <Typography variant="h6" gutterBottom>Berichtsoptionen</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    name="titel"
                    label="Berichtstitel"
                    value={options.titel}
                    onChange={handleOptionChange}
                    fullWidth
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    name="format"
                    label="Ausgabeformat"
                    value={options.format}
                    onChange={handleOptionChange}
                    select
                    fullWidth
                  >
                    <MenuItem value="pdf">PDF</MenuItem>
                    <MenuItem value="excel">Excel</MenuItem>
                    <MenuItem value="csv">CSV</MenuItem>
                  </TextField>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Berichtsinhalte</Typography>
                  
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={options.includeVorwaertsVerfolgung}
                        onChange={handleOptionCheckboxChange}
                        name="includeVorwaertsVerfolgung"
                      />
                    }
                    label="Vorwärts-Verfolgung"
                  />
                  
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={options.includeRueckwaertsVerfolgung}
                        onChange={handleOptionCheckboxChange}
                        name="includeRueckwaertsVerfolgung"
                      />
                    }
                    label="Rückwärts-Verfolgung"
                  />
                  
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={options.includeQualitaetsdaten}
                        onChange={handleOptionCheckboxChange}
                        name="includeQualitaetsdaten"
                      />
                    }
                    label="Qualitätsdaten"
                  />
                  
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={options.includeDokumente}
                        onChange={handleOptionCheckboxChange}
                        name="includeDokumente"
                      />
                    }
                    label="Dokumente"
                  />
                  
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={options.includeRueckrufInfo}
                        onChange={handleOptionCheckboxChange}
                        name="includeRueckrufInfo"
                      />
                    }
                    label="Rückrufinformationen"
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>
          
          {/* Berichtsvorschau */}
          {generatedReport && (
            <Grid item xs={12}>
              <Box p={2}>
                <Typography variant="h6" gutterBottom>Berichtsvorschau</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle1">
                    {generatedReport.titel} - {generatedReport.chargen.length} Chargen
                  </Typography>
                  
                  <Box>
                    <Button
                      variant="outlined"
                      startIcon={<PdfIcon />}
                      onClick={() => handleExportReport('pdf')}
                      sx={{ mr: 1 }}
                    >
                      PDF
                    </Button>
                    
                    <Button
                      variant="outlined"
                      startIcon={<ExcelIcon />}
                      onClick={() => handleExportReport('excel')}
                      sx={{ mr: 1 }}
                    >
                      Excel
                    </Button>
                    
                    <Button
                      variant="outlined"
                      startIcon={<CsvIcon />}
                      onClick={() => handleExportReport('csv')}
                    >
                      CSV
                    </Button>
                  </Box>
                </Box>
                
                <Typography variant="body2">
                  Bericht enthält {generatedReport.chargen.length} Chargen.
                  {options.includeQualitaetsdaten && generatedReport.qualitaetsdaten && 
                    ` Qualitätsdaten für ${generatedReport.qualitaetsdaten.length} Chargen verfügbar.`}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Schließen
        </Button>
        <Button 
          onClick={handleGenerateReport} 
          color="primary" 
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          Bericht generieren
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChargenBerichtsDialog; 