import React, { useState, ChangeEvent } from 'react';
import { Box, Typography, Button, TextField, MenuItem, Select, FormControl, InputLabel, Alert, CircularProgress, Paper } from '@mui/material';

const musterUstva = `{
  "unternehmer": {
    "name": "Max Mustermann",
    "steuernummer": "19811310010"
  },
  "umsatzsteuer": {
    "zeile_26": 1000.00,
    "zeile_33": 190.00
  }
}`;

const ExportModule: React.FC = () => {
  // State für DATEV
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [mandant, setMandant] = useState('Hauptmandant');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState('');

  // State für ELSTER
  const [steuerart, setSteuerart] = useState('UStVA');
  const [jahr, setJahr] = useState(new Date().getFullYear());
  const [zeitraum, setZeitraum] = useState('01-03');
  const [elsterLoading, setElsterLoading] = useState(false);
  const [elsterStatus, setElsterStatus] = useState<any>(null);
  const [elsterError, setElsterError] = useState('');
  const [zertifikat, setZertifikat] = useState<File | null>(null);
  const [pin, setPin] = useState('');
  const [steuerdaten, setSteuerdaten] = useState(musterUstva);
  const [jsonValid, setJsonValid] = useState(true);

  // DATEV-Export-Handler
  const handleDatevExport = async () => {
    setExportLoading(true);
    setExportError('');
    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        mandant,
        export_type: 'Buchungen',
      });
      const response = await fetch(`/api/datev/export?${params.toString()}`);
      if (!response.ok) throw new Error('Export fehlgeschlagen');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DATEV_Export_${mandant}_${startDate}_${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      setExportError(e.message || 'Unbekannter Fehler beim Export');
    } finally {
      setExportLoading(false);
    }
  };

  // ELSTER-Übermittlungs-Handler (ECHT)
  const handleElsterSend = async () => {
    setElsterLoading(true);
    setElsterError('');
    setElsterStatus(null);
    // JSON-Validierung
    try {
      JSON.parse(steuerdaten);
      setJsonValid(true);
    } catch (e) {
      setJsonValid(false);
      setElsterLoading(false);
      setElsterError('Steuerdaten sind kein gültiges JSON!');
      return;
    }
    try {
      if (!zertifikat) throw new Error('Bitte Zertifikat auswählen');
      const formData = new FormData();
      formData.append('steuerart', steuerart);
      formData.append('jahr', jahr.toString());
      formData.append('zeitraum', zeitraum);
      formData.append('zertifikat', zertifikat);
      formData.append('pin', pin);
      formData.append('data', steuerdaten);
      const response = await fetch('/api/elster/send', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.meldung || 'Übermittlung fehlgeschlagen');
      }
      const data = await response.json();
      setElsterStatus(data);
    } catch (e: any) {
      setElsterError(e.message || 'Unbekannter Fehler bei der Übermittlung');
    } finally {
      setElsterLoading(false);
    }
  };

  const handleZertifikatChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setZertifikat(e.target.files[0]);
    }
  };

  const handleSteuerdatenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSteuerdaten(e.target.value);
    try {
      JSON.parse(e.target.value);
      setJsonValid(true);
    } catch {
      setJsonValid(false);
    }
  };

  return (
    <Paper sx={{ p: 4, mt: 2 }}>
      <Typography variant="h5" gutterBottom>DATEV-Export</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Startdatum"
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Enddatum"
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <FormControl>
          <InputLabel>Mandant</InputLabel>
          <Select
            value={mandant}
            label="Mandant"
            onChange={e => setMandant(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="Hauptmandant">Hauptmandant</MenuItem>
            <MenuItem value="Testmandant">Testmandant</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={handleDatevExport}
          disabled={exportLoading || !startDate || !endDate}
        >
          {exportLoading ? <CircularProgress size={24} /> : 'Exportieren'}
        </Button>
      </Box>
      {exportError && <Alert severity="error">{exportError}</Alert>}

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>ELSTER-Übermittlung (ECHT)</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2, maxWidth: 600 }}>
        <FormControl>
          <InputLabel>Steuerart</InputLabel>
          <Select
            value={steuerart}
            label="Steuerart"
            onChange={e => setSteuerart(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="UStVA">UStVA</MenuItem>
            <MenuItem value="EÜR">EÜR</MenuItem>
            <MenuItem value="ZM">ZM</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Jahr"
          type="number"
          value={jahr}
          onChange={e => setJahr(Number(e.target.value))}
          sx={{ width: 100 }}
        />
        <TextField
          label="Zeitraum"
          value={zeitraum}
          onChange={e => setZeitraum(e.target.value)}
          sx={{ width: 100 }}
        />
        <Button
          variant="outlined"
          component="label"
        >
          Zertifikat auswählen (pfx)
          <input type="file" accept=".pfx" hidden onChange={handleZertifikatChange} />
        </Button>
        {zertifikat && <Typography variant="body2">{zertifikat.name}</Typography>}
        <TextField
          label="PIN"
          type="password"
          value={pin}
          onChange={e => setPin(e.target.value)}
          sx={{ width: 200 }}
        />
        <TextField
          label="Steuerdaten (JSON)"
          multiline
          minRows={4}
          value={steuerdaten}
          onChange={handleSteuerdatenChange}
          sx={{ width: '100%' }}
          error={!jsonValid}
          helperText={jsonValid ? "Beispiel: UStVA-Testdaten. Bitte anpassen." : "Ungültiges JSON!"}
        />
        <Button
          variant="contained"
          color="secondary"
          onClick={handleElsterSend}
          disabled={elsterLoading || !jahr || !zeitraum || !zertifikat || !pin || !steuerdaten || !jsonValid}
        >
          {elsterLoading ? <CircularProgress size={24} /> : 'Übermitteln'}
        </Button>
      </Box>
      {elsterError && <Alert severity="error">{elsterError}</Alert>}
      {elsterStatus && (
        <Alert severity={elsterStatus.status === 'erfolgreich' ? 'success' : 'error'} sx={{ mt: 2 }}>
          {elsterStatus.status === 'erfolgreich'
            ? <Box><b>ELSTER-Quittung:</b><pre style={{whiteSpace:'pre-wrap',wordBreak:'break-all'}}>{JSON.stringify(elsterStatus.elster_response, null, 2)}</pre></Box>
            : `Fehler: ${elsterStatus.meldung}`}
        </Alert>
      )}
    </Paper>
  );
};

export default ExportModule; 