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

interface NachhaltigkeitsErklaerungManagerProps {
  lieferantId?: string;
  lieferant?: LieferantStammdaten;
  onSave?: (lieferant: LieferantStammdaten) => void;
  readOnly?: boolean;
  isPrintMode?: boolean;
}

const NachhaltigkeitsErklaerungManager: React.FC<NachhaltigkeitsErklaerungManagerProps> = ({
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
    land: initialLieferant?.land || 'Deutschland',
    nuts2Gebiet: 'DE91', // Braunschweig NUTS2-Gebiet als Default
    biomasseTyp: 'alle',
    spezifischeBiomasse: '',
    reststoffe: '',
    reststoffeBewirtschaftung: '',
    konformitaetMonitoring: 'national',
    auszunehmendeFlaechen: '',
    schutzgebiete: false,
    direktfoerderung: true,
    direktfoerderungVorjahr: true,
    direktfoerderungAktuell: true,
    dokumentation: 'selbst',
    treibhausgas: 'standardwert',
    redcert2: false
  });

  const [unterzeichnungsOrt, setUnterzeichnungsOrt] = useState<string>('');
  const [unterzeichnungsDatum, setUnterzeichnungsDatum] = useState<string>(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showEmailDialog, setShowEmailDialog] = useState<boolean>(false);
  const [emailAdresse, setEmailAdresse] = useState<string>('');
  
  const printRef = useRef<HTMLDivElement>(null);
  
  // Generieren der Nachhaltigkeitserklärung im PDF-Format
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Nachhaltigkeitserklaerung_${formData.name}_${formData.vorname || ''}`.replace(/\s+/g, '_'),
    onAfterPrint: () => {
      setSuccess('Nachhaltigkeitserklärung wurde erfolgreich zum Drucken vorbereitet.');
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
  
  const handleSelectChange = (event: React.ChangeEvent<{ name?: string, value: unknown }>) => {
    const name = event.target.name as string;
    const value = event.target.value as string;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
        land: formData.land,
        nachhaltigkeitsSelbsterklaerungVorhanden: true,
        nachhaltigkeitsSelbsterklaerungDatum: unterzeichnungsDatum,
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
      
      setSuccess('Nachhaltigkeitserklärung wurde erfolgreich per E-Mail verschickt.');
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
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Selbsterklärung
        </Typography>
        <Typography variant="h5" align="center" gutterBottom>
          für landwirtschaftliche Erzeugerbetriebe (GAP-Konditionalität)
        </Typography>
        
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Landwirtschaftlicher Betrieb:
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
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
            <Grid item xs={12}>
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
                label="PLZ"
                fullWidth
                name="plz"
                value={formData.plz}
                onChange={handleFormChange}
                margin="normal"
                disabled={readOnly}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Ort"
                fullWidth
                name="ort"
                value={formData.ort}
                onChange={handleFormChange}
                margin="normal"
                disabled={readOnly}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Land"
                fullWidth
                name="land"
                value={formData.land}
                onChange={handleFormChange}
                margin="normal"
                disabled={readOnly}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="nuts2-label">NUTS2-Gebiet*</InputLabel>
                <Select
                  labelId="nuts2-label"
                  name="nuts2Gebiet"
                  value={formData.nuts2Gebiet}
                  label="NUTS2-Gebiet*"
                  onChange={handleSelectChange as any}
                  disabled={readOnly}
                >
                  <MenuItem value="DE91">DE91 - Braunschweig</MenuItem>
                  <MenuItem value="DE92">DE92 - Hannover</MenuItem>
                  <MenuItem value="DE93">DE93 - Lüneburg</MenuItem>
                  <MenuItem value="DE94">DE94 - Weser-Ems</MenuItem>
                  <MenuItem value="DEF0">DEF0 - Schleswig-Holstein</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Typography variant="body1" mt={4} mb={2}>
            zur Nachhaltigkeit von Biomasse gemäß der Richtlinie (EU) 2018/2001 sowie/ oder nach den REDcert²-Anforderungen.
          </Typography>
          
          <Typography variant="h6" gutterBottom>
            Empfänger (Ersterfasser):
          </Typography>
          
          <TextField
            label="Empfänger"
            fullWidth
            value="Folkerts Landhandel, Groothuser Grenzweg 2, 26736 Krummhörn"
            InputProps={{
              readOnly: true,
            }}
            margin="normal"
          />
          
          <Typography variant="body1" mt={4} mb={2}>
            Die von mir angebaute, gelieferte und unter Punkt 1 näher erläuterte Biomasse des Erntejahres erfüllt die Anforderungen der Richtlinie (EU) 2018/2001 sowie ggf. die REDcert²-Anforderungen; die Nachweise auf nationaler Ebene bezüglich der GAP-Konditionalität liegen vor.
          </Typography>
          
          <Paper variant="outlined" sx={{ p: 2, mt: 2, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              1
            </Typography>
            
            <FormControl component="fieldset">
              <RadioGroup
                name="biomasseTyp"
                value={formData.biomasseTyp}
                onChange={handleFormChange}
              >
                <FormControlLabel 
                  value="alle" 
                  control={<Radio disabled={readOnly} />} 
                  label="Die Erklärung bezieht sich auf sämtliche Biomasse / Kulturarten (wie z. B. Raps, Weizen) meines Betriebes." 
                />
                <FormControlLabel 
                  value="spezifisch" 
                  control={<Radio disabled={readOnly} />} 
                  label="Die Erklärung wird für folgende Kulturarten abgegeben (bitte aufzählen):" 
                />
              </RadioGroup>
            </FormControl>
            
            {formData.biomasseTyp === 'spezifisch' && (
              <TextField
                fullWidth
                name="spezifischeBiomasse"
                value={formData.spezifischeBiomasse}
                onChange={handleFormChange}
                margin="normal"
                disabled={readOnly}
                placeholder="z.B. Raps, Weizen, Gerste"
              />
            )}
            
            <FormControlLabel 
              control={
                <Radio 
                  checked={formData.biomasseTyp === 'reststoffe'} 
                  onChange={handleFormChange} 
                  value="reststoffe" 
                  name="biomasseTyp"
                  disabled={readOnly}
                />
              } 
              label="Die Erklärung wird für die folgenden landwirtschaftlichen Reststoffe bzw. Ernterückstände abgegeben (bitte aufzählen):" 
            />
            
            {formData.biomasseTyp === 'reststoffe' && (
              <TextField
                fullWidth
                name="reststoffe"
                value={formData.reststoffe}
                onChange={handleFormChange}
                margin="normal"
                disabled={readOnly}
                placeholder="z.B. Stroh"
              />
            )}
            
            {formData.biomasseTyp === 'reststoffe' && (
              <>
                <Typography variant="body2" mt={2}>
                  Auf den Flächen werden folgende Bodenbewirtschaftungs- oder Überwachungspraktiken angewendet, um negative Auswirkungen auf die Bodenqualität und den Kohlenstoffbestand im Boden durch die Ernte von landwirtschaftlichen Abfällen und Reststoffen zu verringern:
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  name="reststoffeBewirtschaftung"
                  value={formData.reststoffeBewirtschaftung}
                  onChange={handleFormChange}
                  margin="normal"
                  disabled={readOnly}
                />
              </>
            )}
            
            <Box mt={2}>
              <Typography variant="body2">
                Die Einhaltung von Artikel 29 (2) der Richtlinie (EU) 2018/2001 wird überwacht auf
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  name="konformitaetMonitoring"
                  value={formData.konformitaetMonitoring}
                  onChange={handleFormChange}
                >
                  <FormControlLabel 
                    value="national" 
                    control={<Radio disabled={readOnly} />} 
                    label="nationaler Ebene" 
                  />
                  <FormControlLabel 
                    value="betrieb" 
                    control={<Radio disabled={readOnly} />} 
                    label="Ebene des Wirtschaftsbeteiligten" 
                  />
                </RadioGroup>
              </FormControl>
            </Box>
            
            <FormControlLabel 
              control={
                <Checkbox
                  checked={formData.auszunehmendeFlaechen !== ''}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      auszunehmendeFlaechen: e.target.checked ? 'Flurstück ' : ''
                    }));
                  }}
                  disabled={readOnly}
                />
              } 
              label="Auszunehmende Flächen, Flurstückbezeichnung (Pkt. 2):" 
            />
            
            {formData.auszunehmendeFlaechen && (
              <TextField
                fullWidth
                name="auszunehmendeFlaechen"
                value={formData.auszunehmendeFlaechen}
                onChange={handleFormChange}
                margin="normal"
                disabled={readOnly}
              />
            )}
          </Paper>
          
          <Paper variant="outlined" sx={{ p: 2, mt: 2, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              2
            </Typography>
            
            <FormControlLabel 
              control={
                <Checkbox
                  checked={true}
                  disabled={true}
                />
              } 
              label="Die Biomasse stammt von Ackerflächen, die bereits vor dem 01.01.2008 Ackerfläche war. Darüber hinaus stammt sie nicht von schützenswerten Flächen (Art. 29 der Richtlinie (EU) 2018/2001), die nach dem 01.01.2008 in Ackerland umgewandelt wurden. Sofern nach dem 01.01.2008 zulässige Landnutzungsänderungen vorgenommen wurden, wurden die entsprechenden Flächen unter Punkt 1 explizit ausgenommen, oder die einhergehenden Emissionen im Rahmen eigener Treibhausgasberechnungen berücksichtigt (Standardwerte können nicht verwendet werden)." 
            />
          </Paper>
          
          <Paper variant="outlined" sx={{ p: 2, mt: 2, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              3
            </Typography>
            
            <FormControlLabel 
              control={
                <Checkbox
                  checked={formData.schutzgebiete}
                  onChange={handleFormChange}
                  name="schutzgebiete"
                  disabled={readOnly}
                />
              } 
              label="Die Biomasse stammt von Flächen innerhalb von Schutzgebieten (nur Naturschutzgebiete, keine Wasserschutzgebiete) mit erlaubten Bewirtschaftungstätigkeiten. Die Schutzgebietsauflagen werden eingehalten." 
            />
          </Paper>
          
          <Paper variant="outlined" sx={{ p: 2, mt: 2, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              4
            </Typography>
            
            <FormControlLabel 
              control={<Checkbox checked={formData.direktfoerderung} onChange={handleFormChange} name="direktfoerderung" disabled={readOnly} />}
              label={`Bei Zahlungen aus Direktförderungssystemen unterliege ich den Anforderungen für GAP-Konditionalität, ` +
                    `die mindestens gleichwertige Anforderungen wie im REDcert-EU oder REDcert² System an die Erzeugung von ` +
                    `landwirtschaftlicher Biomasse stellt und überwacht. Damit erfüllt die Biomasse die Anforderungen des ` +
                    `REDcert-EU-Systemdokuments 'Systemgrundsätze für die Erzeugung von Biomasse, Biokraftstoffen, flüssigen ` +
                    `Biobrennstoffen und Biomasse-Brennstoffen' in seiner aktuellen Fassung.`}
            />
            
            <FormControlLabel 
              control={<Checkbox checked={formData.direktfoerderungVorjahr} onChange={handleFormChange} name="direktfoerderungVorjahr" disabled={readOnly} />}
              label={`Ich habe im vergangenen Kalenderjahr an den EU-Direktförderungsprogrammen teilgenommen. Als Nachweis ` +
                    `der Konformität mit den gestellten Anforderungen dient die Mitteilung über die Teilnahme an einem solchen System.`}
            />
            
            <FormControlLabel 
              control={
                <Checkbox
                  checked={formData.direktfoerderungAktuell}
                  onChange={handleFormChange}
                  name="direktfoerderungAktuell"
                  disabled={readOnly}
                />
              } 
              label="Ich werde in diesem Kalenderjahr Zahlungen aus einer Direktförderung beantragen." 
            />
          </Paper>
          
          <Paper variant="outlined" sx={{ p: 2, mt: 2, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              5
            </Typography>
            
            <Typography variant="body2" gutterBottom>
              Die Dokumentation über den Ort des Anbaus der Biomasse (Nachweis mittels Polygonzug oder vergleichbarer Flächennachweise über Feldblöcke, Flurstücke oder Schläge)
            </Typography>
            
            <FormControl component="fieldset">
              <RadioGroup
                name="dokumentation"
                value={formData.dokumentation}
                onChange={handleFormChange}
              >
                <FormControlLabel 
                  value="selbst" 
                  control={<Radio disabled={readOnly} />} 
                  label="liegt bei mir vor und ist jederzeit einsehbar" 
                />
                <FormControlLabel 
                  value="ersterfasser" 
                  control={<Radio disabled={readOnly} />} 
                  label="wird vom Ersterfasser (ggf. Gruppenmanager) der von mir gelieferten Biomasse geführt." 
                />
              </RadioGroup>
            </FormControl>
          </Paper>
          
          <Paper variant="outlined" sx={{ p: 2, mt: 2, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              6
            </Typography>
            
            <FormControlLabel 
              control={
                <Checkbox
                  checked={formData.treibhausgas === 'standardwert'}
                  onChange={() => {
                    setFormData(prev => ({
                      ...prev,
                      treibhausgas: 'standardwert'
                    }));
                  }}
                  disabled={readOnly}
                />
              } 
              label="Für die Berechnung der Treibhausgasbilanzierung soll – soweit vorhanden und zulässig - der Standardwert (Art. 29/31 der Richtlinie (EU) 2018/2001), der behördlich genehmigte Schätzwert oder der NUTS2-Wert verwendet werden." 
            />
          </Paper>
          
          <Paper variant="outlined" sx={{ p: 2, mt: 2, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              7
            </Typography>
            
            <Typography variant="subtitle1" gutterBottom>
              REDcert2
            </Typography>
            
            <FormControlLabel 
              control={
                <Checkbox
                  checked={formData.redcert2}
                  onChange={handleFormChange}
                  name="redcert2"
                  disabled={readOnly}
                />
              } 
              label={`Es können Nachweise dafür erbracht werden, dass diese Biomasse die REDcert2-Systemanforderungen erfüllt. ` +
                    `Ich erfülle die Anforderungen des REDcert²-Dokuments 'Systemgrundsätze für die Erzeugung von Biomasse im ` +
                    `Bereich Lebensmittelproduktion' in seiner aktuellen Fassung.`}
            />
          </Paper>
          
          <Alert severity="info" sx={{ mt: 4, mb: 4 }}>
            Hinweis: Mit dieser Selbsterklärung nimmt der landwirtschaftliche Betrieb zur Kenntnis, dass Auditoren der anerkannten Zertifizierungsstellen überprüfen können, ob die relevanten Anforderungen der Richtlinie (EU) 2018/2001 eingehalten werden. Es ist zu beachten, dass die Auditoren der Zertifizierungsstellen zur Beobachtung ihrer Tätigkeit ggf. von einer zuständigen Behörde begleitet werden. Zudem ist REDcert-Mitarbeitern wie auch von REDcert anerkannten Auditoren die Durchführung eines Sonder- bzw. Witness-Audits zu gewähren. Darüber hinaus erkennt der landwirtschaftliche Erzeuger an, dass sein Name und seine Adresse zum Zweck der Rückverfolgbarkeit der Rohstoffe in der verpflichtenden Unionsdatenbank der Union (UDB) registriert werden.
          </Alert>
          
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
          
          <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
            *NUTS2-Gebietsbezeichnung soweit bekannt, ggf. vom Ersterfasser auszufüllen
          </Typography>
          
          <Typography variant="caption" sx={{ mt: 4, display: 'block', textAlign: 'center' }}>
            REDcert-EU-/REDcert²-Selbsterklärung für Erzeuger landwirtschaftlicher Biomasse (GAP-Konditionalität)
            ©REDcert GmbH
            Vers. 3.1
            Datum:18.04.2024
          </Typography>
        </Box>
      </Box>
      
      {/* E-Mail-Dialog */}
      <Dialog
        open={showEmailDialog}
        onClose={() => setShowEmailDialog(false)}
      >
        <DialogTitle>Nachhaltigkeitserklärung per E-Mail senden</DialogTitle>
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

export default NachhaltigkeitsErklaerungManager; 