import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const FirstRun: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hardware, setHardware] = useState<any>(null);
  const [suggested, setSuggested] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const apiBase: string = (window as any).__VALEO_API_BASE__ || '';
  const navigate = useNavigate();

  const fetchAuto = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/autoconfig`);
      const data = await res.json();
      setHardware(data.hardware);
      setSuggested(data.suggested);
    } catch (e: any) {
      setError(e?.message || 'Fehler bei der Ermittlung der Auto-Konfiguration');
    } finally {
      setLoading(false);
    }
  };

  const apply = async () => {
    if (!suggested) return;
    setSaving(true);
    try {
      await fetch(`${apiBase}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: suggested })
      });
      await fetch(`${apiBase}/first-run/completed`, { method: 'POST' });
      navigate('/settings');
    } catch (e) {
      // swallow
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchAuto();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" mb={1}>Ersteinrichtung</Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>Hardware prüfen und sinnvolle Voreinstellungen wählen</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Box display="flex" alignItems="center" gap={1}>
          <CircularProgress size={18} />
          <Typography variant="body2">Ermittle Systemressourcen…</Typography>
        </Box>
      ) : (
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={2}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1">Hardware</Typography>
            <Typography variant="body2">CPU-Kerne: {hardware?.cpu_count}</Typography>
            <Typography variant="body2">RAM: {hardware?.ram_gb ?? '?'} GB</Typography>
            <Typography variant="body2">GPU: {hardware?.has_nvidia ? 'NVIDIA' : 'Nein'}</Typography>
            <Typography variant="body2">Audio In/Out: {hardware?.audio_input_available ? 'Ja' : 'Nein'} / {hardware?.audio_output_available ? 'Ja' : 'Nein'}</Typography>
            <Typography variant="body2">ffmpeg: {hardware?.ffmpeg_present ? 'gefunden' : 'fehlt'}</Typography>
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1">Vorschlag</Typography>
            <Typography variant="body2">Modus: {suggested?.mode}</Typography>
            <Typography variant="body2">Sprachassistent: {suggested?.assistants?.voice ? 'an' : 'aus'}</Typography>
            <Typography variant="body2">RAG: {suggested?.assistants?.rag ? 'an' : 'aus'}</Typography>
            <Typography variant="body2">Vektor-Backend: {suggested?.assistants?.vector_backend}</Typography>
            <Typography variant="body2">LLM: {suggested?.llm?.model}</Typography>
          </Paper>
        </Box>
      )}
      <Box mt={2} display="flex" gap={1}>
        <Button variant="outlined" onClick={() => navigate('/dashboard')}>Später</Button>
        <Button variant="contained" onClick={apply} disabled={!suggested || saving}>Vorschlag übernehmen</Button>
        <Button variant="text" onClick={() => navigate('/settings')}>Zu den Einstellungen</Button>
      </Box>
    </Box>
  );
};
