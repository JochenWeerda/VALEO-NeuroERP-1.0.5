import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Box, 
  Typography, 
  Grid, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField, 
  FormControlLabel, 
  Checkbox,
  Alert,
  Collapse,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Chip
} from '@mui/material';
import { format } from 'date-fns';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import FilterListIcon from '@mui/icons-material/FilterList';

import {
  QSFuttermittelChargeFilter,
  QSStatus,
  generatePDFProtokoll,
  exportCSV
} from '../../services/qsApi';

// Import Mock-Daten
import {
  generateMockPDFProtokoll,
  exportMockCSV
} from '../../services/mockQsApi';

interface QSFuttermittelExportProps {
  selectedChargeId?: number;
}

const QSFuttermittelExport: React.FC<QSFuttermittelExportProps> = ({ selectedChargeId }) => {
  const [filter, setFilter] = useState<QSFuttermittelChargeFilter>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [useMockData, setUseMockData] = useState<boolean>(false);

  // Erkennen, ob ein Mock-Charge ausgewählt ist
  useEffect(() => {
    if (selectedChargeId && selectedChargeId >= 1000 && selectedChargeId < 2000) {
      setUseMockData(true);
    } else {
      setUseMockData(false);
    }
  }, [selectedChargeId]);

  const handleFilterChange = (name: keyof QSFuttermittelChargeFilter, value: any) => {
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilter({});
  };

  const handleExportCSV = async () => {
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      let blob;
      
      if (useMockData) {
        blob = await exportMockCSV(filter);
        setSuccessMessage('CSV-Export erfolgreich durchgeführt (Testdaten)');
      } else {
        try {
          blob = await exportCSV(filter);
          setSuccessMessage('CSV-Export erfolgreich durchgeführt');
        } catch (error) {
          console.error('Fehler beim Exportieren der CSV-Datei über API, verwende Mock-Daten:', error);
          blob = await exportMockCSV(filter);
          setUseMockData(true);
          setSuccessMessage('CSV-Export erfolgreich durchgeführt (Testdaten)');
        }
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'QS-Futtermittelchargen.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Fehler beim Exportieren der CSV-Datei:', error);
      setErrorMessage('Fehler beim Exportieren der CSV-Datei. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!selectedChargeId) {
      setErrorMessage('Bitte wählen Sie eine Charge aus, um ein PDF-Protokoll zu generieren');
      return;
    }
    
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      let blob;
      
      if (useMockData) {
        blob = await generateMockPDFProtokoll(selectedChargeId);
        setSuccessMessage('PDF-Protokoll erfolgreich generiert (Testdaten)');
      } else {
        try {
          blob = await generatePDFProtokoll(selectedChargeId);
          setSuccessMessage('PDF-Protokoll erfolgreich generiert');
        } catch (error) {
          console.error('Fehler beim Generieren des PDF-Protokolls über API, verwende Mock-Daten:', error);
          blob = await generateMockPDFProtokoll(selectedChargeId);
          setUseMockData(true);
          setSuccessMessage('PDF-Protokoll erfolgreich generiert (Testdaten)');
        }
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QS-Protokoll-${selectedChargeId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Fehler beim Generieren des PDF-Protokolls:', error);
      setErrorMessage('Fehler beim Generieren des PDF-Protokolls. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      {useMockData && (
        <Alert 
          severity="info" 
          sx={{ mb: 2 }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setUseMockData(false)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          Es werden Testdaten verwendet. Die generierten Dokumente enthalten Beispieldaten.
        </Alert>
      )}
      
      <Collapse in={!!successMessage}>
        <Alert
          severity="success"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setSuccessMessage('')}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          {successMessage}
        </Alert>
      </Collapse>

      <Collapse in={!!errorMessage}>
        <Alert
          severity="error"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setErrorMessage('')}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          {errorMessage}
        </Alert>
      </Collapse>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                CSV-Export aller Chargen
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Exportieren Sie alle QS-Futtermittelchargen als CSV-Datei mit Filter-Optionen.
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  onClick={() => setShowFilter(!showFilter)}
                  sx={{ mb: 2 }}
                >
                  {showFilter ? 'Filter ausblenden' : 'Filter einblenden'}
                </Button>
                
                {showFilter && (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Produkt"
                        value={filter.produkt || ''}
                        onChange={(e) => handleFilterChange('produkt', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Erstelldatum von"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={filter.erstelltVon || ''}
                        onChange={(e) => handleFilterChange('erstelltVon', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Erstelldatum bis"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={filter.erstelltBis || ''}
                        onChange={(e) => handleFilterChange('erstelltBis', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel id="export-status-label">Status</InputLabel>
                        <Select
                          labelId="export-status-label"
                          value={filter.status || ''}
                          label="Status"
                          onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                          <MenuItem value="">Alle</MenuItem>
                          <MenuItem value={QSStatus.NEU}>Neu</MenuItem>
                          <MenuItem value={QSStatus.IN_PRUEFUNG}>In Prüfung</MenuItem>
                          <MenuItem value={QSStatus.FREIGEGEBEN}>Freigegeben</MenuItem>
                          <MenuItem value={QSStatus.GESPERRT}>Gesperrt</MenuItem>
                          <MenuItem value={QSStatus.VERWENDUNG}>In Verwendung</MenuItem>
                          <MenuItem value={QSStatus.ARCHIVIERT}>Archiviert</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        onClick={resetFilters}
                        size="small"
                      >
                        Filter zurücksetzen
                      </Button>
                    </Grid>
                  </Grid>
                )}
              </Box>
            </CardContent>
            <CardActions>
              <Button
                fullWidth
                variant="contained"
                startIcon={<TableChartIcon />}
                onClick={handleExportCSV}
                disabled={loading}
              >
                CSV exportieren
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                PDF-Protokoll generieren
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Generieren Sie ein PDF-Protokoll für eine einzelne QS-Futtermittelcharge.
              </Typography>
              
              {selectedChargeId ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Sie haben die Charge mit der ID {selectedChargeId} ausgewählt.
                </Alert>
              ) : (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Keine Charge ausgewählt. Bitte wählen Sie eine Charge in der Übersicht aus.
                </Alert>
              )}
            </CardContent>
            <CardActions>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                startIcon={<PictureAsPdfIcon />}
                onClick={handleGeneratePDF}
                disabled={loading || !selectedChargeId}
              >
                PDF generieren
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default QSFuttermittelExport; 