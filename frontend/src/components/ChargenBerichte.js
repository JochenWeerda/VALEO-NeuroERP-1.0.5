import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button, 
  Box, 
  CircularProgress, 
  Divider, 
  Card, 
  CardContent, 
  CardActions, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Alert,
  Snackbar
} from '@mui/material';
import { PictureAsPdf, TableChart } from '@mui/icons-material';
import { getChargen, getBerichtTypen, generateBericht, exportBerichtAsPDF, exportBerichtAsExcel } from '../../api/chargenApi';

const ChargenBerichte = () => {
  // Zustände
  const [chargen, setChargen] = useState([]);
  const [berichtTypen, setBerichtTypen] = useState([]);
  const [selectedCharge, setSelectedCharge] = useState('');
  const [selectedBerichtTyp, setSelectedBerichtTyp] = useState('');
  const [bericht, setBericht] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Daten beim Laden der Komponente abrufen
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Chargen und Berichtstypen parallel laden
        const [chargenData, berichtTypenData] = await Promise.all([
          getChargen(),
          getBerichtTypen()
        ]);
        
        setChargen(chargenData);
        setBerichtTypen(berichtTypenData);
      } catch (err) {
        setError('Fehler beim Laden der Daten: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Bericht generieren
  const handleGenerateBericht = async () => {
    if (!selectedCharge || !selectedBerichtTyp) {
      setError('Bitte wählen Sie eine Charge und einen Berichtstyp aus.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await generateBericht(selectedCharge, selectedBerichtTyp);
      setBericht(result);
      setSuccessMessage('Bericht wurde erfolgreich generiert!');
    } catch (err) {
      setError('Fehler bei der Berichtsgenerierung: ' + err.message);
      setBericht(null);
    } finally {
      setLoading(false);
    }
  };

  // PDF-Export
  const handleExportPDF = async () => {
    if (!bericht) return;
    
    try {
      setLoading(true);
      const pdfUrl = await exportBerichtAsPDF(bericht);
      setSuccessMessage(`PDF wurde generiert: ${pdfUrl}`);
    } catch (err) {
      setError('Fehler beim PDF-Export: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Excel-Export
  const handleExportExcel = async () => {
    if (!bericht) return;
    
    try {
      setLoading(true);
      const excelUrl = await exportBerichtAsExcel(bericht);
      setSuccessMessage(`Excel-Datei wurde generiert: ${excelUrl}`);
    } catch (err) {
      setError('Fehler beim Excel-Export: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Rendert den entsprechenden Berichtsinhalt basierend auf dem Typ
  const renderBerichtContent = () => {
    if (!bericht) return null;

    // Allgemeine Informationen anzeigen
    const commonInfo = (
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>Allgemeine Informationen</Typography>
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell component="th" scope="row">Charge ID:</TableCell>
                <TableCell>{bericht.charge_id}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">Chargennummer:</TableCell>
                <TableCell>{bericht.chargennummer}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">Bericht-Typ:</TableCell>
                <TableCell>{bericht.bericht_typ}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">Erstellt am:</TableCell>
                <TableCell>{new Date(bericht.erstellt_am).toLocaleString()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );

    // Spezifischer Inhalt je nach Berichtstyp
    let specificContent = null;

    switch (bericht.bericht_typ) {
      case 'qualitaet':
        specificContent = (
          <>
            <Typography variant="h6" gutterBottom>Qualitätsinformationen</Typography>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1">Qualitätsstatus: {bericht.qualitaetsstatus}</Typography>
            </Paper>
            
            {bericht.pruefungen && bericht.pruefungen.length > 0 && (
              <>
                <Typography variant="h6" gutterBottom>Durchgeführte Prüfungen</Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Parameter</TableCell>
                        <TableCell>Sollwert</TableCell>
                        <TableCell>Istwert</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Datum</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bericht.pruefungen.map((pruefung) => (
                        <TableRow key={pruefung.id}>
                          <TableCell>{pruefung.parameter}</TableCell>
                          <TableCell>{pruefung.sollwert}</TableCell>
                          <TableCell>{pruefung.istwert}</TableCell>
                          <TableCell>{pruefung.status}</TableCell>
                          <TableCell>{new Date(pruefung.pruefung_datum).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </>
        );
        break;

      case 'lager':
        specificContent = (
          <>
            <Typography variant="h6" gutterBottom>Lagerbestand</Typography>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="subtitle1">Gesamtmenge: {bericht.gesamtmenge}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle1">Reserviert: {bericht.gesamtreserviert}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle1">Verfügbar: {bericht.gesamtverfuegbar}</Typography>
                </Grid>
              </Grid>
            </Paper>
            
            {bericht.bestaende && bericht.bestaende.length > 0 && (
              <>
                <Typography variant="h6" gutterBottom>Lagerbeständeübersicht</Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Lager</TableCell>
                        <TableCell>Lagerort</TableCell>
                        <TableCell>Menge</TableCell>
                        <TableCell>Reserviert</TableCell>
                        <TableCell>Verfügbar</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bericht.bestaende.map((bestand, index) => (
                        <TableRow key={index}>
                          <TableCell>{bestand.lager_name}</TableCell>
                          <TableCell>{bestand.lagerort_name}</TableCell>
                          <TableCell>{bestand.menge}</TableCell>
                          <TableCell>{bestand.reserviert}</TableCell>
                          <TableCell>{bestand.verfuegbar}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </>
        );
        break;

      case 'rueckverfolgung':
        specificContent = (
          <>
            <Typography variant="h6" gutterBottom>Rückverfolgungsinformationen</Typography>
            
            {bericht.rueckwaerts_verfolgung && bericht.rueckwaerts_verfolgung.length > 0 && (
              <>
                <Typography variant="subtitle1" gutterBottom>Verwendete Materialien (Rückwärtsverfolgung)</Typography>
                <TableContainer component={Paper} sx={{ mb: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Chargennummer</TableCell>
                        <TableCell>Artikel</TableCell>
                        <TableCell>Menge</TableCell>
                        <TableCell>Prozess</TableCell>
                        <TableCell>Datum</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bericht.rueckwaerts_verfolgung.map((verfolgung, index) => (
                        <TableRow key={index}>
                          <TableCell>{verfolgung.chargennummer}</TableCell>
                          <TableCell>{verfolgung.artikel}</TableCell>
                          <TableCell>{verfolgung.menge} {verfolgung.einheit}</TableCell>
                          <TableCell>{verfolgung.prozess}</TableCell>
                          <TableCell>{new Date(verfolgung.prozess_datum).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
            
            {bericht.vorwaerts_verfolgung && bericht.vorwaerts_verfolgung.length > 0 && (
              <>
                <Typography variant="subtitle1" gutterBottom>Verwendung in Produkten (Vorwärtsverfolgung)</Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Referenz</TableCell>
                        <TableCell>Produkt/Kunde</TableCell>
                        <TableCell>Menge</TableCell>
                        <TableCell>Datum</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bericht.vorwaerts_verfolgung.map((verfolgung, index) => (
                        <TableRow key={index}>
                          <TableCell>{verfolgung.chargennummer || verfolgung.lieferschein}</TableCell>
                          <TableCell>{verfolgung.artikel || verfolgung.kunde}</TableCell>
                          <TableCell>{verfolgung.menge} {verfolgung.einheit}</TableCell>
                          <TableCell>{new Date(verfolgung.prozess_datum || verfolgung.lieferung_datum).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </>
        );
        break;

      case 'zusammenfassung':
        specificContent = (
          <>
            <Typography variant="h6" gutterBottom>Chargenzusammenfassung</Typography>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle1">Artikel: {bericht.artikel?.bezeichnung}</Typography>
                  <Typography variant="subtitle1">Status: {bericht.status}</Typography>
                  <Typography variant="subtitle1">Menge: {bericht.menge} {bericht.einheit}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle1">Herstelldatum: {new Date(bericht.herstelldatum).toLocaleDateString()}</Typography>
                  <Typography variant="subtitle1">MHD: {new Date(bericht.mindesthaltbarkeitsdatum).toLocaleDateString()}</Typography>
                  <Typography variant="subtitle1">Qualitätsstatus: {bericht.qualitaetsstatus}</Typography>
                </Grid>
              </Grid>
            </Paper>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" color="primary">Lagerbestand</Typography>
                    <Typography variant="body1">Gesamtmenge: {bericht.gesamtmenge}</Typography>
                    <Typography variant="body1">Verfügbar: {bericht.gesamtverfuegbar}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" color="primary">Rückverfolgung</Typography>
                    <Typography variant="body1">Material-Chargen: {bericht.material_chargen}</Typography>
                    <Typography variant="body1">Produkt-Chargen: {bericht.produkt_chargen}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        );
        break;

      case 'produktion':
        specificContent = (
          <>
            <Typography variant="h6" gutterBottom>Produktionsbericht</Typography>
            
            {bericht.prozess && (
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle1">Prozess: {bericht.prozess.typ}</Typography>
                <Typography variant="subtitle1">Start: {new Date(bericht.prozess.start_datum).toLocaleString()}</Typography>
                <Typography variant="subtitle1">Ende: {new Date(bericht.prozess.ende_datum).toLocaleString()}</Typography>
                <Typography variant="subtitle1">Verantwortlich: {bericht.prozess.verantwortlicher}</Typography>
              </Paper>
            )}
            
            {bericht.parameter && bericht.parameter.length > 0 && (
              <>
                <Typography variant="subtitle1" gutterBottom>Prozessparameter</Typography>
                <TableContainer component={Paper} sx={{ mb: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Parameter</TableCell>
                        <TableCell>Wert</TableCell>
                        <TableCell>Einheit</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bericht.parameter.map((param, index) => (
                        <TableRow key={index}>
                          <TableCell>{param.name}</TableCell>
                          <TableCell>{param.wert}</TableCell>
                          <TableCell>{param.einheit}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
            
            {bericht.materialien && bericht.materialien.length > 0 && (
              <>
                <Typography variant="subtitle1" gutterBottom>Verwendete Materialien</Typography>
                <TableContainer component={Paper} sx={{ mb: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Chargennummer</TableCell>
                        <TableCell>Artikel</TableCell>
                        <TableCell>Menge</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bericht.materialien.map((material, index) => (
                        <TableRow key={index}>
                          <TableCell>{material.chargennummer}</TableCell>
                          <TableCell>{material.artikel}</TableCell>
                          <TableCell>{material.menge} {material.einheit}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
            
            {bericht.ausbeute && (
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" color="primary">Ausbeute</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">Erwartete Menge: {bericht.ausbeute.erwartete_menge}</Typography>
                      <Typography variant="body1">Tatsächliche Menge: {bericht.ausbeute.tatsaechliche_menge}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">Differenz: {bericht.ausbeute.differenz}</Typography>
                      <Typography variant="body1">Differenz (%): {bericht.ausbeute.differenz_prozent}%</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </>
        );
        break;

      default:
        specificContent = (
          <Typography>Für diesen Berichtstyp ist keine spezifische Ansicht verfügbar.</Typography>
        );
    }

    return (
      <>
        {commonInfo}
        <Divider sx={{ my: 3 }} />
        {specificContent}
      </>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>Chargenberichte</Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Bericht generieren</Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <FormControl fullWidth>
              <InputLabel id="charge-select-label">Charge</InputLabel>
              <Select
                labelId="charge-select-label"
                value={selectedCharge}
                label="Charge"
                onChange={(e) => setSelectedCharge(e.target.value)}
              >
                {chargen.map((charge) => (
                  <MenuItem key={charge.id} value={charge.id}>
                    {charge.chargennummer} - {charge.artikel_name || `Artikel ${charge.artikel_id}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={5}>
            <FormControl fullWidth>
              <InputLabel id="bericht-typ-select-label">Berichtstyp</InputLabel>
              <Select
                labelId="bericht-typ-select-label"
                value={selectedBerichtTyp}
                label="Berichtstyp"
                onChange={(e) => setSelectedBerichtTyp(e.target.value)}
              >
                {berichtTypen.map((typ) => (
                  <MenuItem key={typ.id} value={typ.id}>
                    {typ.name} - {typ.beschreibung}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleGenerateBericht}
              disabled={loading || !selectedCharge || !selectedBerichtTyp}
              sx={{ height: '56px' }} // Anpassen der Höhe an die Select-Felder
            >
              {loading ? <CircularProgress size={24} /> : 'Generieren'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Fehleranzeige */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}
      
      {/* Erfolgsmeldung */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        message={successMessage}
      />
      
      {/* Berichtsanzeige */}
      {bericht && (
        <Paper sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">
              Bericht: {berichtTypen.find(t => t.id === bericht.bericht_typ)?.name || bericht.bericht_typ}
            </Typography>
            
            <Box>
              <Button
                startIcon={<PictureAsPdf />}
                variant="outlined"
                color="primary"
                onClick={handleExportPDF}
                sx={{ mr: 1 }}
              >
                Als PDF
              </Button>
              <Button
                startIcon={<TableChart />}
                variant="outlined"
                color="primary"
                onClick={handleExportExcel}
              >
                Als Excel
              </Button>
            </Box>
          </Box>
          
          {renderBerichtContent()}
        </Paper>
      )}
    </Container>
  );
};

export default ChargenBerichte; 