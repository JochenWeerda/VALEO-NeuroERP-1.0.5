import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Divider,
  Grid,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  InsertDriveFile as CsvIcon
} from '@mui/icons-material';
import ChargenBerichtsDialog from './ChargenBerichtsDialog';
import chargenReportService from '../../services/chargenReportService';

const ChargenBerichtPage: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [berichte, setBerichte] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Beim Laden der Komponente Beispielberichte laden
  useEffect(() => {
    loadBeispielBerichte();
  }, []);

  const loadBeispielBerichte = async () => {
    setLoading(true);
    try {
      // Simuliere das Laden von Berichten vom Server
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Beispieldaten
      setBerichte([
        {
          id: 'report-1',
          titel: 'Chargenbericht Wöchentlich',
          erstelltAm: '2025-04-20T10:15:00Z',
          filter: {
            vonDatum: '2025-04-13',
            bisDatum: '2025-04-20'
          },
          options: {
            format: 'pdf',
            includeVorwaertsVerfolgung: true,
            includeRueckwaertsVerfolgung: true
          },
          chargenCount: 12
        },
        {
          id: 'report-2',
          titel: 'Chargenbericht Monatsende März',
          erstelltAm: '2025-03-31T16:30:00Z',
          filter: {
            vonDatum: '2025-03-01',
            bisDatum: '2025-03-31',
            qualitaetsstatus: 'freigegeben'
          },
          options: {
            format: 'excel',
            includeQualitaetsdaten: true,
            includeDokumente: true
          },
          chargenCount: 45
        },
        {
          id: 'report-3',
          titel: 'Qualitätsauswertung Q1/2025',
          erstelltAm: '2025-04-05T09:45:00Z',
          filter: {
            vonDatum: '2025-01-01',
            bisDatum: '2025-03-31'
          },
          options: {
            format: 'pdf',
            includeQualitaetsdaten: true,
            includeRueckrufInfo: true
          },
          chargenCount: 87
        }
      ]);
    } catch (error) {
      console.error('Fehler beim Laden der Berichte:', error);
      setError('Berichte konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleDeleteReport = (id: string) => {
    setBerichte(prev => prev.filter(report => report.id !== id));
    setSuccess('Bericht erfolgreich gelöscht');
  };

  const handleDownloadReport = async (report: any, format: 'pdf' | 'csv' | 'excel') => {
    try {
      setLoading(true);
      
      // Simuliere das Laden des vollständigen Berichts vom Server
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Hier würde der tatsächliche Bericht geladen werden
      // Für Demo-Zwecke erstellen wir einen neuen Bericht mit dem entsprechenden Filter
      const vollstaendigerBericht = await chargenReportService.generateChargenReport(
        report.filter,
        { ...report.options, format }
      );
      
      // Exportieren des Berichts
      const blob = await chargenReportService.exportChargenReport(vollstaendigerBericht, format);
      
      // Download-Link erstellen und klicken
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${report.titel}_${new Date().toISOString().slice(0, 10)}.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess(`Bericht erfolgreich als ${format.toUpperCase()} heruntergeladen`);
    } catch (error) {
      console.error('Fehler beim Herunterladen des Berichts:', error);
      setError(`Der Bericht konnte nicht als ${format.toUpperCase()} heruntergeladen werden`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" component="h1">
          Chargenberichte
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Neuen Bericht erstellen
        </Button>
      </Box>
      
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert 
          severity="success" 
          onClose={() => setSuccess(null)}
          sx={{ mb: 3 }}
        >
          {success}
        </Alert>
      )}
      
      {loading && (
        <Box display="flex" justifyContent="center" mb={3}>
          <CircularProgress />
        </Box>
      )}
      
      <Grid container spacing={3}>
        {berichte.map(bericht => (
          <Grid item xs={12} md={6} lg={4} key={bericht.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {bericht.titel}
                </Typography>
                
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Erstellt: {new Date(bericht.erstelltAm).toLocaleString('de-DE')}
                </Typography>
                
                <Divider sx={{ my: 1 }} />
                
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Zeitraum" 
                      secondary={`${bericht.filter.vonDatum} bis ${bericht.filter.bisDatum}`} 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText 
                      primary="Anzahl Chargen" 
                      secondary={bericht.chargenCount} 
                    />
                  </ListItem>
                  
                  {bericht.filter.qualitaetsstatus && (
                    <ListItem>
                      <ListItemText 
                        primary="Qualitätsstatus" 
                        secondary={bericht.filter.qualitaetsstatus} 
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
              
              <CardActions>
                <Button
                  size="small"
                  startIcon={<AssessmentIcon />}
                  onClick={() => handleOpenDialog()}
                >
                  Anzeigen
                </Button>
                
                <Box flexGrow={1} />
                
                <IconButton
                  size="small"
                  onClick={() => handleDownloadReport(bericht, 'pdf')}
                  title="Als PDF herunterladen"
                >
                  <PdfIcon />
                </IconButton>
                
                <IconButton
                  size="small"
                  onClick={() => handleDownloadReport(bericht, 'excel')}
                  title="Als Excel herunterladen"
                >
                  <ExcelIcon />
                </IconButton>
                
                <IconButton
                  size="small"
                  onClick={() => handleDownloadReport(bericht, 'csv')}
                  title="Als CSV herunterladen"
                >
                  <CsvIcon />
                </IconButton>
                
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteReport(bericht.id)}
                  title="Bericht löschen"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Dialog zum Erstellen eines neuen Berichts */}
      <ChargenBerichtsDialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
      />
    </Box>
  );
};

export default ChargenBerichtPage; 