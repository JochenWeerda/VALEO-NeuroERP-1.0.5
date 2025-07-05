import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Divider,
  Autocomplete,
  Tooltip,
  useTheme,
  SelectChangeEvent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import deLocale from 'date-fns/locale/de';
import {
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  Science as ScienceIcon,
  Inventory as InventoryIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Archive as ArchiveIcon,
  Delete as DeleteIcon,
  Loop as LoopIcon,
  Download as DownloadIcon,
  DateRange as DateRangeIcon,
  QueryStats as QueryStatsIcon
} from '@mui/icons-material';

// Berichtstypen
const REPORT_TYPES = [
  { id: 'charge_overview', name: 'Chargenübersicht', icon: <InventoryIcon /> },
  { id: 'production_trace', name: 'Produktionsrückverfolgung', icon: <LoopIcon /> },
  { id: 'quality_report', name: 'Qualitätsbericht', icon: <ScienceIcon /> },
  { id: 'inventory_movement', name: 'Lagerbewegungen', icon: <QueryStatsIcon /> },
  { id: 'expiry_dates', name: 'Ablaufdaten-Analyse', icon: <DateRangeIcon /> }
];

// Zeitintervalle
const TIME_INTERVALS = [
  { id: 'daily', name: 'Täglich' },
  { id: 'weekly', name: 'Wöchentlich' },
  { id: 'monthly', name: 'Monatlich' },
  { id: 'quarterly', name: 'Quartalsweise' },
  { id: 'custom', name: 'Benutzerdefiniert' }
];

// Exportformate
const EXPORT_FORMATS = [
  { id: 'pdf', name: 'PDF' },
  { id: 'excel', name: 'Excel' },
  { id: 'csv', name: 'CSV' },
  { id: 'json', name: 'JSON' }
];

// Typen für die Komponente
interface ReportConfig {
  id?: string;
  name: string;
  description: string;
  reportType: string;
  timeInterval: string;
  customStartDate: Date | null;
  customEndDate: Date | null;
  exportFormat: string[];
  isActive: boolean;
  lastGenerated?: string;
  recipients: string[];
}

interface ScheduledReport {
  id: string;
  name: string;
  reportType: string;
  timeInterval: string;
  lastGenerated: string;
  nextGeneration: string;
  isActive: boolean;
}

/**
 * ChargenBerichteGenerator-Komponente
 * Ermöglicht die Konfiguration und Erstellung automatisierter Chargenberichte
 */
const ChargenBerichteGenerator: React.FC = () => {
  const theme = useTheme();
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentReport, setCurrentReport] = useState<ReportConfig>({
    name: '',
    description: '',
    reportType: '',
    timeInterval: 'monthly',
    customStartDate: null,
    customEndDate: null,
    exportFormat: ['pdf'],
    isActive: true,
    recipients: []
  });
  const [newRecipient, setNewRecipient] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  // Laden der gespeicherten Berichte beim ersten Rendering
  useEffect(() => {
    const fetchScheduledReports = async () => {
      setLoading(true);
      try {
        // Hier würde normaleweise eine API-Anfrage stattfinden
        // Simuliere einen API-Aufruf mit einem Timeout
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock-Daten für die geplanten Berichte
        const mockData: ScheduledReport[] = [
          {
            id: '1',
            name: 'Monatliche Chargenübersicht',
            reportType: 'charge_overview',
            timeInterval: 'monthly',
            lastGenerated: '2025-05-01',
            nextGeneration: '2025-06-01',
            isActive: true
          },
          {
            id: '2',
            name: 'Wöchentlicher Qualitätsbericht',
            reportType: 'quality_report',
            timeInterval: 'weekly',
            lastGenerated: '2025-05-24',
            nextGeneration: '2025-05-31',
            isActive: true
          },
          {
            id: '3',
            name: 'Quartalsweise Ablaufdaten-Analyse',
            reportType: 'expiry_dates',
            timeInterval: 'quarterly',
            lastGenerated: '2025-04-01',
            nextGeneration: '2025-07-01',
            isActive: false
          }
        ];
        
        setScheduledReports(mockData);
      } catch (error) {
        console.error('Fehler beim Laden der geplanten Berichte:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchScheduledReports();
  }, []);

  const handleOpenDialog = (report?: ScheduledReport) => {
    if (report) {
      // Bestehenenden Bericht bearbeiten
      setCurrentReport({
        id: report.id,
        name: report.name,
        description: '', // Hier würde man die vollständigen Berichtsdaten laden
        reportType: report.reportType,
        timeInterval: report.timeInterval,
        customStartDate: null,
        customEndDate: null,
        exportFormat: ['pdf'],
        isActive: report.isActive,
        lastGenerated: report.lastGenerated,
        recipients: []
      });
    } else {
      // Neuen Bericht erstellen
      setCurrentReport({
        name: '',
        description: '',
        reportType: '',
        timeInterval: 'monthly',
        customStartDate: null,
        customEndDate: null,
        exportFormat: ['pdf'],
        isActive: true,
        recipients: []
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleTextInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = event.target.name as string;
    const value = event.target.value;
    
    setCurrentReport(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectInputChange = (event: SelectChangeEvent<string>) => {
    const name = event.target.name as string;
    const value = event.target.value;
    
    setCurrentReport(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTimeIntervalChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value as string;
    
    setCurrentReport(prev => ({
      ...prev,
      timeInterval: value,
      // Wenn nicht benutzerdefiniert, dann setze die Daten zurück
      ...(value !== 'custom' && {
        customStartDate: null,
        customEndDate: null
      })
    }));
  };

  const handleExportFormatChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    
    setCurrentReport(prev => ({
      ...prev,
      exportFormat: value
    }));
  };

  const handleDateChange = (date: Date | null, fieldName: string) => {
    setCurrentReport(prev => ({
      ...prev,
      [fieldName]: date
    }));
  };

  const handleAddRecipient = () => {
    if (newRecipient && !currentReport.recipients.includes(newRecipient)) {
      setCurrentReport(prev => ({
        ...prev,
        recipients: [...prev.recipients, newRecipient]
      }));
      setNewRecipient('');
    }
  };

  const handleRemoveRecipient = (email: string) => {
    setCurrentReport(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== email)
    }));
  };

  const handleSaveReport = async () => {
    setLoading(true);
    try {
      // Hier würde normalerweise die API zum Speichern aufgerufen werden
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock-Logik zum Hinzufügen/Aktualisieren des Berichts
      if (currentReport.id) {
        // Bestehenenden Bericht aktualisieren
        setScheduledReports(prev => 
          prev.map(report => 
            report.id === currentReport.id 
              ? {
                  ...report,
                  name: currentReport.name,
                  reportType: currentReport.reportType,
                  timeInterval: currentReport.timeInterval,
                  isActive: currentReport.isActive
                }
              : report
          )
        );
      } else {
        // Neuen Bericht hinzufügen
        const newId = (Math.max(...scheduledReports.map(r => parseInt(r.id)), 0) + 1).toString();
        const nextGenerationDate = new Date();
        
        if (currentReport.timeInterval === 'monthly') {
          nextGenerationDate.setMonth(nextGenerationDate.getMonth() + 1);
        } else if (currentReport.timeInterval === 'weekly') {
          nextGenerationDate.setDate(nextGenerationDate.getDate() + 7);
        } else if (currentReport.timeInterval === 'quarterly') {
          nextGenerationDate.setMonth(nextGenerationDate.getMonth() + 3);
        } else if (currentReport.timeInterval === 'daily') {
          nextGenerationDate.setDate(nextGenerationDate.getDate() + 1);
        }
        
        const newReport: ScheduledReport = {
          id: newId,
          name: currentReport.name,
          reportType: currentReport.reportType,
          timeInterval: currentReport.timeInterval,
          lastGenerated: 'Noch nicht generiert',
          nextGeneration: nextGenerationDate.toISOString().split('T')[0],
          isActive: currentReport.isActive
        };
        
        setScheduledReports(prev => [...prev, newReport]);
      }
      
      // Dialog schließen
      setOpenDialog(false);
    } catch (error) {
      console.error('Fehler beim Speichern des Berichts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = (id: string) => {
    setReportToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDeleteReport = async () => {
    if (!reportToDelete) return;
    
    setLoading(true);
    try {
      // Hier würde normalerweise die API zum Löschen aufgerufen werden
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Bericht aus der Liste entfernen
      setScheduledReports(prev => prev.filter(report => report.id !== reportToDelete));
      setShowDeleteDialog(false);
      setReportToDelete(null);
    } catch (error) {
      console.error('Fehler beim Löschen des Berichts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReportStatus = async (id: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      // Hier würde normalerweise die API aufgerufen werden
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Status des Berichts aktualisieren
      setScheduledReports(prev => 
        prev.map(report => 
          report.id === id 
            ? { ...report, isActive: !currentStatus }
            : report
        )
      );
    } catch (error) {
      console.error('Fehler beim Ändern des Berichtsstatus:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (id: string) => {
    setGeneratingReport(true);
    try {
      // Hier würde normalerweise die API zum manuellen Generieren aufgerufen werden
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Aktualisiere das Generierungsdatum
      const today = new Date().toISOString().split('T')[0];
      
      setScheduledReports(prev => 
        prev.map(report => 
          report.id === id 
            ? { ...report, lastGenerated: today }
            : report
        )
      );
      
      // Erfolgsmeldung anzeigen (hier vereinfacht mit alert)
      alert('Bericht wurde erfolgreich generiert und steht zum Download bereit.');
    } catch (error) {
      console.error('Fehler beim Generieren des Berichts:', error);
      alert('Fehler beim Generieren des Berichts. Bitte versuchen Sie es später erneut.');
    } finally {
      setGeneratingReport(false);
    }
  };

  // Optimierte Berechnung des Report-Types mit useMemo
  const getReportTypeInfo = useCallback((typeId: string) => {
    return REPORT_TYPES.find(type => type.id === typeId) || { id: '', name: 'Unbekannt', icon: <AssignmentIcon /> };
  }, []);
  
  const memoizedReportTypes = useMemo(() => {
    return REPORT_TYPES.map(type => ({
      id: type.id,
      name: type.name,
      icon: type.icon
    }));
  }, []);

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Automatisierte Chargenberichte
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Konfigurieren Sie regelmäßige Chargenberichte, die automatisch generiert und versendet werden.
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Neuen Bericht erstellen
          </Button>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : scheduledReports.length === 0 ? (
          <Paper
            variant="outlined"
            sx={{
              p: 4,
              textAlign: 'center',
              bgcolor: 'background.default'
            }}
          >
            <DescriptionIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Keine automatisierten Berichte konfiguriert
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Erstellen Sie Ihren ersten automatisierten Chargenbericht, um regelmäßige Auswertungen zu erhalten.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Bericht erstellen
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {scheduledReports.map(report => {
              const reportTypeInfo = getReportTypeInfo(report.reportType);
              
              return (
                <Grid item xs={12} md={6} lg={4} key={report.id}>
                  <Card
                    variant="outlined"
                    sx={{
                      position: 'relative',
                      opacity: report.isActive ? 1 : 0.7,
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: theme.shadows[3]
                      }
                    }}
                  >
                    {!report.isActive && (
                      <Chip
                        label="Inaktiv"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          bgcolor: 'background.paper',
                          border: `1px solid ${theme.palette.divider}`
                        }}
                      />
                    )}
                    
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {reportTypeInfo.icon}
                        <Typography variant="h6" sx={{ ml: 1 }}>
                          {report.name}
                        </Typography>
                      </Box>
                      
                      <List dense>
                        <ListItem>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <AssignmentIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={reportTypeInfo.name}
                            secondary="Berichtstyp"
                          />
                        </ListItem>
                        
                        <ListItem>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <DateRangeIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={TIME_INTERVALS.find(i => i.id === report.timeInterval)?.name || report.timeInterval}
                            secondary="Intervall"
                          />
                        </ListItem>
                        
                        <ListItem>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <QueryStatsIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={report.lastGenerated === 'Noch nicht generiert' ? 'Noch nicht generiert' : new Date(report.lastGenerated).toLocaleDateString('de-DE')}
                            secondary="Letzte Generierung"
                          />
                        </ListItem>
                        
                        <ListItem>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <DateRangeIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={new Date(report.nextGeneration).toLocaleDateString('de-DE')}
                            secondary="Nächste Generierung"
                          />
                        </ListItem>
                      </List>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box>
                          <Tooltip title="Bericht bearbeiten">
                            <IconButton 
                              size="small" 
                              onClick={() => handleOpenDialog(report)}
                            >
                              <AssignmentIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title={report.isActive ? 'Bericht deaktivieren' : 'Bericht aktivieren'}>
                            <IconButton 
                              size="small"
                              onClick={() => handleToggleReportStatus(report.id, report.isActive)}
                            >
                              {report.isActive ? <ArchiveIcon fontSize="small" /> : <LoopIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Bericht löschen">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteReport(report.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<DownloadIcon />}
                          onClick={() => handleGenerateReport(report.id)}
                          disabled={generatingReport}
                        >
                          {generatingReport ? 'Wird generiert...' : 'Jetzt generieren'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
      
      {/* Dialog zum Erstellen/Bearbeiten eines Berichts */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentReport.id ? 'Bericht bearbeiten' : 'Neuen Bericht erstellen'}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Berichtsname"
                fullWidth
                value={currentReport.name}
                onChange={handleTextInputChange}
                required
                autoFocus
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Beschreibung"
                fullWidth
                value={currentReport.description}
                onChange={handleTextInputChange}
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id="report-type-label">Berichtstyp</InputLabel>
                <Select
                  labelId="report-type-label"
                  name="reportType"
                  value={currentReport.reportType}
                  onChange={handleSelectInputChange}
                  label="Berichtstyp"
                  renderValue={(selected) => {
                    const type = REPORT_TYPES.find(t => t.id === selected);
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {type?.icon}
                        <Typography sx={{ ml: 1 }}>{type?.name}</Typography>
                      </Box>
                    );
                  }}
                >
                  {memoizedReportTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {type.icon}
                        <Typography sx={{ ml: 1 }}>{type.name}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id="time-interval-label">Zeitintervall</InputLabel>
                <Select
                  labelId="time-interval-label"
                  name="timeInterval"
                  value={currentReport.timeInterval}
                  onChange={handleTimeIntervalChange}
                  label="Zeitintervall"
                >
                  {TIME_INTERVALS.map((interval) => (
                    <MenuItem key={interval.id} value={interval.id}>
                      {interval.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {currentReport.timeInterval === 'custom' && (
              <>
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={deLocale}>
                    <DatePicker
                      label="Startdatum"
                      value={currentReport.customStartDate}
                      onChange={(date) => handleDateChange(date, 'customStartDate')}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={deLocale}>
                    <DatePicker
                      label="Enddatum"
                      value={currentReport.customEndDate}
                      onChange={(date) => handleDateChange(date, 'customEndDate')}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
              </>
            )}
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="export-format-label">Exportformate</InputLabel>
                <Select
                  labelId="export-format-label"
                  multiple
                  name="exportFormat"
                  value={currentReport.exportFormat}
                  onChange={handleExportFormatChange}
                  label="Exportformate"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip 
                          key={value} 
                          label={EXPORT_FORMATS.find(f => f.id === value)?.name || value} 
                          size="small" 
                        />
                      ))}
                    </Box>
                  )}
                >
                  {EXPORT_FORMATS.map((format) => (
                    <MenuItem key={format.id} value={format.id}>
                      {format.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                E-Mail-Empfänger
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TextField
                  label="E-Mail-Adresse"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  fullWidth
                  size="small"
                />
                <Button
                  variant="outlined"
                  sx={{ ml: 1, whiteSpace: 'nowrap' }}
                  onClick={handleAddRecipient}
                >
                  Hinzufügen
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {currentReport.recipients.map((email) => (
                  <Chip
                    key={email}
                    label={email}
                    onDelete={() => handleRemoveRecipient(email)}
                    size="small"
                  />
                ))}
                {currentReport.recipients.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Keine Empfänger hinzugefügt.
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleSaveReport}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!currentReport.name || !currentReport.reportType}
          >
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog zum Bestätigen des Löschens */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <DialogTitle>Bericht löschen</DialogTitle>
        <DialogContent>
          <Typography>
            Möchten Sie diesen Bericht wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={confirmDeleteReport}
            color="error"
            variant="contained"
          >
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChargenBerichteGenerator; 