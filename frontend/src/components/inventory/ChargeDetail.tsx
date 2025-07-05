import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Charge, getChargeById } from '../../services/inventoryApi';
import QRCodeComponent from './QRCodeComponent';

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
      id={`charge-tabpanel-${index}`}
      aria-labelledby={`charge-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `charge-tab-${index}`,
    'aria-controls': `charge-tabpanel-${index}`,
  };
}

interface ChargeDetailProps {
  chargeId: number;
  onBack?: () => void;
}

const ChargeDetail: React.FC<ChargeDetailProps> = ({ chargeId, onBack }) => {
  const [charge, setCharge] = useState<Charge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchCharge = async () => {
      setLoading(true);
      try {
        const data = await getChargeById(chargeId);
        setCharge(data);
        setError(null);
      } catch (err) {
        console.error('Fehler beim Laden der Charge:', err);
        setError('Die Charge konnte nicht geladen werden.');
      } finally {
        setLoading(false);
      }
    };

    fetchCharge();
  }, [chargeId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Helfer-Funktion zum Formatieren von Datumsangaben
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd.MM.yyyy', { locale: de });
    } catch (e) {
      return dateString;
    }
  };

  // Statusfarbe bestimmen
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'neu': return 'primary';
      case 'in_verwendung': return 'info';
      case 'gesperrt': return 'error';
      case 'freigegeben': return 'success';
      case 'verbraucht': return 'secondary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">{error}</Alert>
        {onBack && (
          <Button variant="outlined" onClick={onBack} sx={{ mt: 2 }}>
            Zurück
          </Button>
        )}
      </Box>
    );
  }

  if (!charge) {
    return (
      <Box p={2}>
        <Alert severity="info">Keine Daten verfügbar</Alert>
        {onBack && (
          <Button variant="outlined" onClick={onBack} sx={{ mt: 2 }}>
            Zurück
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box>
      {onBack && (
        <Button variant="outlined" onClick={onBack} sx={{ mb: 2 }}>
          Zurück zur Übersicht
        </Button>
      )}

      <Paper sx={{ mb: 2, p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" component="h1">
                Charge: {charge.chargennummer}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip 
                  label={charge.status} 
                  color={getStatusColor(charge.status) as any}
                />
                <QRCodeComponent chargeId={chargeId} chargennummer={charge.chargennummer} />
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Artikel
            </Typography>
            <Typography variant="body1">
              {charge.artikel_name || `Artikel ${charge.artikel_id}`}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Lieferant
            </Typography>
            <Typography variant="body1">
              {charge.lieferant_name || (charge.lieferant_id ? `Lieferant ${charge.lieferant_id}` : '-')}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Menge
            </Typography>
            <Typography variant="body1">
              {charge.menge !== undefined ? `${charge.menge} kg` : '-'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Charge Typ
            </Typography>
            <Typography variant="body1">
              {charge.charge_typ}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Herstelldatum
            </Typography>
            <Typography variant="body1">
              {formatDate(charge.herstelldatum)}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Mindesthaltbarkeitsdatum
            </Typography>
            <Typography variant="body1">
              {formatDate(charge.mindesthaltbarkeitsdatum)}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Qualitätsstatus
            </Typography>
            <Typography variant="body1">
              {charge.qualitaetsstatus || '-'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Erstellt am
            </Typography>
            <Typography variant="body1">
              {formatDate(charge.erstellt_am)}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Geändert am
            </Typography>
            <Typography variant="body1">
              {formatDate(charge.geaendert_am)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="Charge Tabs">
            <Tab label="Details" {...a11yProps(0)} />
            <Tab label="Qualität" {...a11yProps(1)} />
            <Tab label="Dokumente" {...a11yProps(2)} />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Zusätzliche Details
              </Typography>
              <Typography variant="body1" paragraph>
                {charge.bemerkung || 'Keine zusätzlichen Details vorhanden.'}
              </Typography>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Qualitätsdaten
          </Typography>
          
          {/* Beispieldaten für Qualitätsprüfungen */}
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Datum</TableCell>
                  <TableCell>Parameter</TableCell>
                  <TableCell>Wert</TableCell>
                  <TableCell>Einheit</TableCell>
                  <TableCell>Ergebnis</TableCell>
                  <TableCell>Prüfer</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Mock-Daten, die später durch echte API-Daten ersetzt werden */}
                {[].length > 0 ? (
                  [{ id: 1, pruefung_datum: '2023-05-15', parameter: 'Feuchtigkeit', wert: '12.5', einheit: '%', ergebnis: 'bestanden', pruefer: 'Max Mustermann' }].map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{formatDate(row.pruefung_datum)}</TableCell>
                      <TableCell>{row.parameter}</TableCell>
                      <TableCell>{row.wert}</TableCell>
                      <TableCell>{row.einheit}</TableCell>
                      <TableCell>
                        <Chip 
                          label={row.ergebnis === 'bestanden' ? 'Bestanden' : 'Nicht bestanden'} 
                          color={row.ergebnis === 'bestanden' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{row.pruefer}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Keine Qualitätsdaten verfügbar
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Dokumente
          </Typography>
          
          {/* Beispieldaten für Dokumente */}
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Dokumenttyp</TableCell>
                  <TableCell>Dateiname</TableCell>
                  <TableCell>Upload-Datum</TableCell>
                  <TableCell>Aktion</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Mock-Daten, die später durch echte API-Daten ersetzt werden */}
                {[].length > 0 ? (
                  [{ id: 1, dokument_typ: 'Analysezertifikat', dateiname: 'Analyse_12345.pdf', upload_datum: '2023-05-10' }].map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.dokument_typ}</TableCell>
                      <TableCell>{row.dateiname}</TableCell>
                      <TableCell>{formatDate(row.upload_datum)}</TableCell>
                      <TableCell>
                        <Button
                          startIcon={<DownloadIcon />}
                          size="small"
                          variant="outlined"
                          onClick={() => {/* Download-Logik hier */}}
                        >
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      Keine Dokumente verfügbar
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default ChargeDetail; 