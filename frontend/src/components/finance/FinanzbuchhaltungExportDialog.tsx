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
  TextField,
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
  Tab,
  Tabs,
  SelectChangeEvent
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
  DateRange as DateRangeIcon,
  Info as InfoIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { de } from 'date-fns/locale';
import financeExportService, { 
  DatevExportOptions, 
  SapExportOptions, 
  LexwareExportOptions 
} from '../../services/financeExportService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`fibu-export-tabpanel-${index}`}
      aria-labelledby={`fibu-export-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface FinanzbuchhaltungExportDialogProps {
  open: boolean;
  onClose: () => void;
}

const FinanzbuchhaltungExportDialog: React.FC<FinanzbuchhaltungExportDialogProps> = ({ 
  open, 
  onClose 
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);
  
  // DATEV-Optionen
  const [datevOptions, setDatevOptions] = useState<DatevExportOptions>({
    startDate: '',
    endDate: '',
    exportType: 'buchungen',
    berater: '1001',
    mandant: '1',
    wirtschaftsjahr: new Date().getFullYear().toString(),
    includeSteuerkonten: true,
    exportFormat: 'csv'
  });

  // SAP-Optionen
  const [sapOptions, setSapOptions] = useState<SapExportOptions>({
    startDate: '',
    endDate: '',
    exportType: 'fi',
    companyCode: '1000',
    costCenter: '',
    exportFormat: 'xml'
  });

  // Lexware-Optionen
  const [lexwareOptions, setLexwareOptions] = useState<LexwareExportOptions>({
    startDate: '',
    endDate: '',
    exportType: 'buchungen',
    firma: 'Hauptfirma',
    exportFormat: 'csv'
  });

  // Effekt für Datumsvorschlag (aktuelles Quartal)
  useEffect(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentQuarter = Math.floor(now.getMonth() / 3);
    
    const quarterStart = new Date(currentYear, currentQuarter * 3, 1);
    const quarterEnd = new Date(currentYear, (currentQuarter + 1) * 3, 0);
    
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };
    
    const startDateStr = formatDate(quarterStart);
    const endDateStr = formatDate(quarterEnd);
    
    setDatevOptions(prev => ({ ...prev, startDate: startDateStr, endDate: endDateStr }));
    setSapOptions(prev => ({ ...prev, startDate: startDateStr, endDate: endDateStr }));
    setLexwareOptions(prev => ({ ...prev, startDate: startDateStr, endDate: endDateStr }));
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDatevChange = (field: keyof DatevExportOptions, value: any) => {
    setDatevOptions(prev => ({ ...prev, [field]: value }));
  };

  const handleSapChange = (field: keyof SapExportOptions, value: any) => {
    setSapOptions(prev => ({ ...prev, [field]: value }));
  };

  const handleLexwareChange = (field: keyof LexwareExportOptions, value: any) => {
    setLexwareOptions(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (system: string, field: string, date: Date | null) => {
    if (!date) return;
    
    const dateStr = date.toISOString().split('T')[0];
    
    switch (system) {
      case 'datev':
        setDatevOptions(prev => ({ ...prev, [field]: dateStr }));
        break;
      case 'sap':
        setSapOptions(prev => ({ ...prev, [field]: dateStr }));
        break;
      case 'lexware':
        setLexwareOptions(prev => ({ ...prev, [field]: dateStr }));
        break;
    }
  };

  const validateDates = (startDate: string, endDate: string): boolean => {
    if (!startDate || !endDate) {
      setExportError('Bitte geben Sie Start- und Enddatum an.');
      return false;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      setExportError('Das Startdatum muss vor dem Enddatum liegen.');
      return false;
    }
    
    return true;
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);
    setExportSuccess(false);
    
    try {
      switch (tabValue) {
        case 0: // DATEV
          if (!validateDates(datevOptions.startDate, datevOptions.endDate)) {
            setIsExporting(false);
            return;
          }
          await financeExportService.exportDatev(datevOptions);
          break;
          
        case 1: // SAP
          if (!validateDates(sapOptions.startDate, sapOptions.endDate)) {
            setIsExporting(false);
            return;
          }
          await financeExportService.exportSap(sapOptions);
          break;
          
        case 2: // Lexware
          if (!validateDates(lexwareOptions.startDate, lexwareOptions.endDate)) {
            setIsExporting(false);
            return;
          }
          await financeExportService.exportLexware(lexwareOptions);
          break;
      }
      
      setExportSuccess(true);
      
      // Nach erfolgreichem Export Dialog nach 2 Sekunden schließen
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Fehler beim Export:', error);
      setExportError('Der Export konnte nicht durchgeführt werden. Bitte überprüfen Sie die Einstellungen und versuchen Sie es erneut.');
    } finally {
      setIsExporting(false);
    }
  };
  
  const getExportSystemName = (): string => {
    switch (tabValue) {
      case 0: return 'DATEV';
      case 1: return 'SAP';
      case 2: return 'Lexware';
      default: return 'Finanzbuchhaltung';
    }
  };

  const getExportTypeName = (): string => {
    switch (tabValue) {
      case 0: 
        return datevOptions.exportType === 'buchungen' 
          ? 'Buchungen' 
          : datevOptions.exportType === 'stammdaten' 
            ? 'Stammdaten' 
            : 'Zahlungen';
      case 1:
        return sapOptions.exportType === 'fi'
          ? 'Finanzbuchhaltung (FI)'
          : sapOptions.exportType === 'co'
            ? 'Controlling (CO)'
            : sapOptions.exportType === 'mm'
              ? 'Materialwirtschaft (MM)'
              : 'Vertrieb (SD)';
      case 2:
        return lexwareOptions.exportType === 'buchungen'
          ? 'Buchungen'
          : 'Stammdaten';
      default:
        return 'Daten';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={isExporting ? undefined : onClose}
      fullWidth 
      maxWidth="md"
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Übernahme in die Finanzbuchhaltung</Typography>
          {!isExporting && (
            <IconButton edge="end" onClick={onClose} aria-label="schließen">
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {exportError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {exportError}
          </Alert>
        )}
        
        {exportSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Daten wurden erfolgreich exportiert.
          </Alert>
        )}
        
        {isExporting && (
          <Box sx={{ width: '100%', mb: 2 }}>
            <LinearProgress />
            <Typography variant="body2" align="center" sx={{ mt: 1 }}>
              Export läuft... Bitte warten.
            </Typography>
          </Box>
        )}
        
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="fibu-export-tabs"
          variant="fullWidth"
        >
          <Tab label="DATEV" />
          <Tab label="SAP" />
          <Tab label="Lexware" />
        </Tabs>
        
        {/* DATEV Export Panel */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
                <DatePicker
                  label="Startdatum"
                  value={datevOptions.startDate ? new Date(datevOptions.startDate) : null}
                  onChange={(date) => handleDateChange('datev', 'startDate', date)}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
                <DatePicker
                  label="Enddatum"
                  value={datevOptions.endDate ? new Date(datevOptions.endDate) : null}
                  onChange={(date) => handleDateChange('datev', 'endDate', date)}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Exporttyp</InputLabel>
                <Select
                  value={datevOptions.exportType}
                  label="Exporttyp"
                  onChange={(e: SelectChangeEvent) => handleDatevChange('exportType', e.target.value)}
                >
                  <MenuItem value="buchungen">Buchungen</MenuItem>
                  <MenuItem value="stammdaten">Stammdaten</MenuItem>
                  <MenuItem value="zahlungen">Zahlungen</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Exportformat</InputLabel>
                <Select
                  value={datevOptions.exportFormat}
                  label="Exportformat"
                  onChange={(e: SelectChangeEvent) => handleDatevChange('exportFormat', e.target.value)}
                >
                  <MenuItem value="csv">CSV</MenuItem>
                  <MenuItem value="xml">XML</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Berater-Nr."
                value={datevOptions.berater}
                onChange={(e) => handleDatevChange('berater', e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Mandanten-Nr."
                value={datevOptions.mandant}
                onChange={(e) => handleDatevChange('mandant', e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Wirtschaftsjahr"
                value={datevOptions.wirtschaftsjahr}
                onChange={(e) => handleDatevChange('wirtschaftsjahr', e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={datevOptions.includeSteuerkonten || false}
                    onChange={(e) => handleDatevChange('includeSteuerkonten', e.target.checked)}
                    name="includeSteuerkonten"
                  />
                }
                label="Steuerkonten einbeziehen"
              />
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* SAP Export Panel */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
                <DatePicker
                  label="Startdatum"
                  value={sapOptions.startDate ? new Date(sapOptions.startDate) : null}
                  onChange={(date) => handleDateChange('sap', 'startDate', date)}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
                <DatePicker
                  label="Enddatum"
                  value={sapOptions.endDate ? new Date(sapOptions.endDate) : null}
                  onChange={(date) => handleDateChange('sap', 'endDate', date)}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Exporttyp</InputLabel>
                <Select
                  value={sapOptions.exportType}
                  label="Exporttyp"
                  onChange={(e: SelectChangeEvent) => handleSapChange('exportType', e.target.value)}
                >
                  <MenuItem value="fi">Finanzbuchhaltung (FI)</MenuItem>
                  <MenuItem value="co">Controlling (CO)</MenuItem>
                  <MenuItem value="mm">Materialwirtschaft (MM)</MenuItem>
                  <MenuItem value="sd">Vertrieb (SD)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Exportformat</InputLabel>
                <Select
                  value={sapOptions.exportFormat}
                  label="Exportformat"
                  onChange={(e: SelectChangeEvent) => handleSapChange('exportFormat', e.target.value)}
                >
                  <MenuItem value="csv">CSV</MenuItem>
                  <MenuItem value="xml">XML</MenuItem>
                  <MenuItem value="idoc">IDoc</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Buchungskreis"
                value={sapOptions.companyCode}
                onChange={(e) => handleSapChange('companyCode', e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Kostenstelle"
                value={sapOptions.costCenter}
                onChange={(e) => handleSapChange('costCenter', e.target.value)}
                fullWidth
              />
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Lexware Export Panel */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
                <DatePicker
                  label="Startdatum"
                  value={lexwareOptions.startDate ? new Date(lexwareOptions.startDate) : null}
                  onChange={(date) => handleDateChange('lexware', 'startDate', date)}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
                <DatePicker
                  label="Enddatum"
                  value={lexwareOptions.endDate ? new Date(lexwareOptions.endDate) : null}
                  onChange={(date) => handleDateChange('lexware', 'endDate', date)}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Exporttyp</InputLabel>
                <Select
                  value={lexwareOptions.exportType}
                  label="Exporttyp"
                  onChange={(e: SelectChangeEvent) => handleLexwareChange('exportType', e.target.value)}
                >
                  <MenuItem value="buchungen">Buchungen</MenuItem>
                  <MenuItem value="stammdaten">Stammdaten</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Exportformat</InputLabel>
                <Select
                  value={lexwareOptions.exportFormat}
                  label="Exportformat"
                  onChange={(e: SelectChangeEvent) => handleLexwareChange('exportFormat', e.target.value)}
                >
                  <MenuItem value="csv">CSV</MenuItem>
                  <MenuItem value="xml">XML</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Firma"
                value={lexwareOptions.firma}
                onChange={(e) => handleLexwareChange('firma', e.target.value)}
                fullWidth
              />
            </Grid>
          </Grid>
        </TabPanel>
        
        <Box mt={3}>
          <Alert severity="info" icon={<InfoIcon />}>
            Die Daten werden im Format für {getExportSystemName()} exportiert. Es werden {getExportTypeName()} für den ausgewählten Zeitraum exportiert.
          </Alert>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={onClose} 
          disabled={isExporting}
        >
          Abbrechen
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          disabled={isExporting}
          color="primary"
        >
          Export starten
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FinanzbuchhaltungExportDialog; 