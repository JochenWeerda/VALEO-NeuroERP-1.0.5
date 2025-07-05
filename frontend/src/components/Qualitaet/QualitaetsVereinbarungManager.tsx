import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Divider,
  Grid,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  LinearProgress
} from '@mui/material';
import {
  Print as PrintIcon,
  Download as DownloadIcon,
  Save as SaveIcon,
  Email as EmailIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { LieferantStammdaten, updateLieferantStammdaten } from '../../services/qualitaetsApi';
import { useReactToPrint } from 'react-to-print';

interface QualitaetsVereinbarungManagerProps {
  lieferantId?: string;
  lieferant?: LieferantStammdaten;
  onSave?: (lieferant: LieferantStammdaten) => void;
  readOnly?: boolean;
  isPrintMode?: boolean;
}

const QualitaetsVereinbarungManager: React.FC<QualitaetsVereinbarungManagerProps> = ({
  lieferantId,
  lieferant: initialLieferant,
  onSave,
  readOnly = false,
  isPrintMode = false
}) => {
  // Zustandsvariablen
  const [lieferant, setLieferant] = useState<Partial<LieferantStammdaten>>(initialLieferant || {});
  const [formData, setFormData] = useState({
    name: initialLieferant?.name || '',
    vorname: initialLieferant?.vorname || '',
    strasse: initialLieferant?.strasse || '',
    plz: initialLieferant?.plz || '',
    ort: initialLieferant?.ort || '',
    steuerNr: initialLieferant?.steuerNr || '',
    ustIdNr: initialLieferant?.ustIdNr || '',
    landwirtTyp: initialLieferant?.landwirtTyp || 'pauschalierend',
    qualitaetsvereinbarungVorhanden: initialLieferant?.qualitaetsvereinbarungVorhanden || false,
    nachhaltigkeitsSelbsterklaerungVorhanden: initialLieferant?.nachhaltigkeitsSelbsterklaerungVorhanden || false,
    sortenschutzerklaerungVorhanden: initialLieferant?.sortenschutzerklaerungVorhanden || false,
  });

  const [unterzeichnungsOrt, setUnterzeichnungsOrt] = useState<string>('');
  const [unterzeichnungsDatum, setUnterzeichnungsDatum] = useState<string>(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showEmailDialog, setShowEmailDialog] = useState<boolean>(false);
  const [emailAdresse, setEmailAdresse] = useState<string>('');
  
  const printRef = useRef<HTMLDivElement>(null);
  
  // Generieren der Qualitätsvereinbarung im PDF-Format
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Qualitaetsvereinbarung_${formData.name}_${formData.vorname || ''}`.replace(/\s+/g, '_'),
    onAfterPrint: () => {
      setSuccess('Qualitätsvereinbarung wurde erfolgreich zum Drucken vorbereitet.');
    },
  });
  
  // Event-Handler für Formular-Änderungen
  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleLandwirtTypChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      landwirtTyp: event.target.value as 'optierend' | 'pauschalierend' | 'nicht_landwirt'
    }));
  };
  
  // Speichern der Änderungen
  const handleSave = async () => {
    if (!lieferantId && !initialLieferant?.id) {
      setError('Kein Lieferant ausgewählt.');
      return;
    }
    
    setLoading(true);
    try {
      const updatedLieferant: Partial<LieferantStammdaten> = {
        ...lieferant,
        name: formData.name,
        vorname: formData.vorname,
        strasse: formData.strasse,
        plz: formData.plz,
        ort: formData.ort,
        steuerNr: formData.steuerNr,
        ustIdNr: formData.ustIdNr,
        landwirtTyp: formData.landwirtTyp,
        qualitaetsvereinbarungVorhanden: formData.qualitaetsvereinbarungVorhanden,
        qualitaetsvereinbarungDatum: formData.qualitaetsvereinbarungVorhanden ? unterzeichnungsDatum : undefined,
        nachhaltigkeitsSelbsterklaerungVorhanden: formData.nachhaltigkeitsSelbsterklaerungVorhanden,
        sortenschutzerklaerungVorhanden: formData.sortenschutzerklaerungVorhanden,
      };
      
      if (lieferantId) {
        await updateLieferantStammdaten(lieferantId, updatedLieferant);
      } else if (initialLieferant?.id) {
        await updateLieferantStammdaten(initialLieferant.id, updatedLieferant);
      }
      
      setSuccess('Lieferantendaten wurden erfolgreich gespeichert.');
      
      if (onSave) {
        onSave({
          ...lieferant,
          ...updatedLieferant,
          id: lieferantId || initialLieferant?.id || '',
        } as LieferantStammdaten);
      }
    } catch (err) {
      console.error('Fehler beim Speichern der Lieferantendaten:', err);
      setError('Fehler beim Speichern der Daten. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };
  
  // E-Mail-Dialog
  const handleEmailDialogOpen = () => {
    setShowEmailDialog(true);
  };
  
  const handleSendEmail = async () => {
    // Implementierung zum Senden der E-Mail
    setLoading(true);
    try {
      // API-Aufruf zum Senden der E-Mail (hier nur simuliert)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Qualitätsvereinbarung wurde erfolgreich per E-Mail verschickt.');
      setShowEmailDialog(false);
    } catch (err) {
      console.error('Fehler beim Senden der E-Mail:', err);
      setError('Fehler beim Senden der E-Mail. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      {loading && <LinearProgress />}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      
      {!isPrintMode && (
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button 
            variant="outlined" 
            startIcon={<EmailIcon />} 
            onClick={handleEmailDialogOpen}
            sx={{ mr: 1 }}
            disabled={readOnly}
          >
            Per E-Mail senden
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<PrintIcon />} 
            onClick={handlePrint}
            sx={{ mr: 1 }}
          >
            Drucken
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            sx={{ mr: 1 }}
          >
            Als PDF speichern
          </Button>
          {!readOnly && (
            <Button 
              variant="contained" 
              startIcon={<SaveIcon />} 
              onClick={handleSave}
            >
              Speichern
            </Button>
          )}
        </Box>
      )}
      
      <Box ref={printRef} sx={{ p: 3, backgroundColor: 'white' }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h5" component="h1" gutterBottom>
            Folkerts Landhandel
          </Typography>
          <Typography variant="body1" gutterBottom>
            Groothuser Grenzweg 2
          </Typography>
          <Typography variant="body1" gutterBottom>
            26736 Krummhörn
          </Typography>
        </Box>
        
        <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ letterSpacing: 2 }}>
          Qualitätsvereinbarung / Kundenbestätigung
        </Typography>
        <Typography variant="subtitle1" align="center" gutterBottom>
          - gültig bis auf Widerruf -
        </Typography>
        
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Absender: (bitte geben Sie Ihre korrekte Adresse und Ihren umsatzsteuerrechtlichen Status an)
          </Typography>
          
          <Typography variant="subtitle1" fontWeight="bold">
            Neu: unbedingt die aktuellen Daten angeben
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Name, Vorname"
                fullWidth
                name="name"
                value={`${formData.name}${formData.vorname ? ', ' + formData.vorname : ''}`}
                onChange={handleFormChange}
                margin="normal"
                disabled={readOnly}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Steuer-Nr."
                fullWidth
                name="steuerNr"
                value={formData.steuerNr}
                onChange={handleFormChange}
                margin="normal"
                disabled={readOnly}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" align="center">oder</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Straße"
                fullWidth
                name="strasse"
                value={formData.strasse}
                onChange={handleFormChange}
                margin="normal"
                disabled={readOnly}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Umsatzsteuer-Ident.-Nr."
                fullWidth
                name="ustIdNr"
                value={formData.ustIdNr}
                onChange={handleFormChange}
                margin="normal"
                disabled={readOnly}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="PLZ/Ort"
                fullWidth
                name="plz_ort"
                value={`(${formData.plz}) ${formData.ort}`}
                InputProps={{
                  readOnly: true,
                }}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl component="fieldset" margin="normal">
                <FormLabel component="legend">Landwirt-Status</FormLabel>
                <RadioGroup
                  name="landwirtTyp"
                  value={formData.landwirtTyp}
                  onChange={handleLandwirtTypChange}
                >
                  <FormControlLabel 
                    value="optierend" 
                    control={<Radio disabled={readOnly} />} 
                    label="Ich bin optierender Landwirt" 
                  />
                  <FormControlLabel 
                    value="pauschalierend" 
                    control={<Radio disabled={readOnly} />} 
                    label="Ich bin pauschalierender Landwirt" 
                  />
                  <FormControlLabel 
                    value="nicht_landwirt" 
                    control={<Radio disabled={readOnly} />} 
                    label="Ich bin Nicht-Landwirt" 
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>
          
          <Typography variant="subtitle2" mt={2} sx={{ fontStyle: 'italic' }}>
            Fragen Sie im Zweifel Ihr Steuerbüro!
          </Typography>
          
          <Alert severity="warning" sx={{ mt: 2, mb: 4 }}>
            Falls uns obige Angaben fehlen, können wir keine gültigen Gutschriften im Sinne des Umsatzsteuergesetzes erstellen!  
            Bitte ausfüllen und an uns zurückschicken! Termin: VOR der ersten Ernte-Lieferung!
          </Alert>
          
          <Typography variant="body1" paragraph sx={{ mt: 4 }}>
            Hiermit bestätige ich, dass die von mir angelieferten Ernteerzeugnisse gemäß der guten landwirtschaftlichen Praxis angebaut, geerntet und gelagert wurden, wie dieses im Merkblatt "Maßnahmen für den sicheren Umgang mit Getreide, Ölsaaten und Leguminosen" (Anlage) gefordert wird. Die empfohlenen Maßnahmen habe ich befolgt und werde diese beachten. Auch von mir beauftragte Dritte (Mitarbeiter, Hilfskräfte) sind angewiesen entsprechend zu verfahren.
          </Typography>
          
          <Typography variant="body1" paragraph>
            Ich bestätige, dass die gelieferten Produkte nach meiner Kenntnis keine verbotenen oder unerwünschten Stoffe nach Anlage 5 der Futtermittelverordnung (FMV) enthalten und dass ich solche Stoffe nicht eingesetzt habe. Insbesondere bestätige ich,
          </Typography>
          
          <ul style={{ listStyleType: 'none', paddingLeft: '20px' }}>
            <li>✓ dass nur in Deutschland zugelassene Pflanzenschutz- und Düngemittel fach- und sachgerecht eingesetzt und die Wartezeiten jeweils eingehalten wurden,</li>
            <li>✓ dass nach der Ernte keine chemische Behandlung der Produkte erfolgte,</li>
            <li>✓ dass, falls erforderlich, die jeweiligen Vorschriften der EG-Verordnungen über gentechnisch veränderte Lebens- und Futtermittel sowie über Rückverfolgbarkeit und Kennzeichnung von gentechnisch veränderten Organismen strengstens angewandt werden,</li>
            <li>✓ dass mein Betrieb gemäß Verordnung (EG) Nr. 183/2005 registriert und/oder zugelassen ist,</li>
            <li>✓ dass ich die Probenahme bei Folkerts Landhandel anerkenne.</li>
          </ul>
          
          <Box sx={{ mt: 6, mb: 2, borderBottom: '1px solid black' }}></Box>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={4}>
              {!readOnly ? (
                <TextField
                  label="Ort"
                  fullWidth
                  value={unterzeichnungsOrt}
                  onChange={(e) => setUnterzeichnungsOrt(e.target.value)}
                />
              ) : (
                <Typography variant="body1">{unterzeichnungsOrt || '___________________'}</Typography>
              )}
            </Grid>
            <Grid item xs={4}>
              {!readOnly ? (
                <TextField
                  label="Datum"
                  type="date"
                  fullWidth
                  value={unterzeichnungsDatum}
                  onChange={(e) => setUnterzeichnungsDatum(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              ) : (
                <Typography variant="body1">{unterzeichnungsDatum ? new Date(unterzeichnungsDatum).toLocaleDateString('de-DE') : '___________________'}</Typography>
              )}
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body1">
                {readOnly ? '_______________________' : 'Unterschrift'}
              </Typography>
            </Grid>
          </Grid>
          
          <Alert severity="info" sx={{ mt: 4 }}>
            Sollten Sie uns die Qualitätsvereinbarung in den Vorjahren bereits zugestellt haben, bleibt diese bis auf Widerruf gültig. Eine erneute Ausstellung für 2024 ist nur bei Änderungen notwendig.
          </Alert>
          
          {/* Abschnitt für zusätzliche Dokumente und Erklärungen */}
          <Typography variant="h6" mt={4} mb={2}>
            Weitere Erklärungen
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.qualitaetsvereinbarungVorhanden}
                    onChange={handleFormChange}
                    name="qualitaetsvereinbarungVorhanden"
                    disabled={readOnly}
                  />
                }
                label="Qualitätsvereinbarung unterschrieben"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.nachhaltigkeitsSelbsterklaerungVorhanden}
                    onChange={handleFormChange}
                    name="nachhaltigkeitsSelbsterklaerungVorhanden"
                    disabled={readOnly}
                  />
                }
                label="Selbsterklärung für landwirtschaftliche Erzeugerbetriebe (GAP-Konditionalität / Nachhaltigkeit)"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.sortenschutzerklaerungVorhanden}
                    onChange={handleFormChange}
                    name="sortenschutzerklaerungVorhanden"
                    disabled={readOnly}
                  />
                }
                label="Sortenschutzrechtliche Erklärung zum angelieferten Erntegut"
              />
            </Grid>
          </Grid>
        </Box>
      </Box>
      
      {/* E-Mail-Dialog */}
      <Dialog
        open={showEmailDialog}
        onClose={() => setShowEmailDialog(false)}
      >
        <DialogTitle>Qualitätsvereinbarung per E-Mail senden</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Bitte geben Sie die E-Mail-Adresse des Empfängers ein:
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="E-Mail-Adresse"
            type="email"
            fullWidth
            value={emailAdresse}
            onChange={(e) => setEmailAdresse(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEmailDialog(false)}>Abbrechen</Button>
          <Button onClick={handleSendEmail} variant="contained">
            Senden
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QualitaetsVereinbarungManager; 