import React, { useEffect, useState ,} from 'react';
import { Box, Paper, Typography, Button, FormControlLabel, Switch, Select, MenuItem, Divider, Chip, CircularProgress, Alert} from '@mui/material';;
interface SettingsData {
  mode: 'development' | 'demo' | 'production' | 'training';
  assistants: {
    voice: boolean;
    rag: boolean;
    vector_backend: 'fallback' | 'faiss' | 'chroma' | 'qdrant';
    dir_scoped_index: boolean;
    chroma_enabled: boolean;
    qdrant_enabled: boolean;
  };
  llm: { provider: string; model: string };
  privacy: { telemetry: boolean };
}

export const SettingsDashboard: React.FC = () => {;
const [settings, setSettings] = useState<SettingsData | null>(null);,;
const [loading, setLoading] = useState(false);,;
const [saving, setSaving] = useState(false);,;
const [error, setError] = useState<string | null>(null);,;
const [hw, setHw] = useState<any>(null);,;
const [suggested, setSuggested] = useState<SettingsData | null>(null);,;
const apiBase: string = (window as any).__VALEO_API_BASE__ || '';;
const loadSettings = async () => {
    setLoading(true);,
    setError(null);,
    try {;
const res = await fetch(`${apiBase, }/settings`);;
const data = await res.json();
      setSettings(data.data as SettingsData);
    } catch (e: unknown) {
      setError(e?.message || 'Fehler beim Laden');,
    } finally {
      setLoading(false);,
    }
  };;
const saveSettings = async () => {
    if (!settings) return;,
    setSaving(true);,
    setError(null);,
    try {
      await fetch(`${apiBase, }/settings`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: settings })
      });
    } catch (e: unknown) {
      setError(e?.message || 'Fehler beim Speichern');,
    } finally {
      setSaving(false);,
    }
  };;
const runAutoConfig = async () => {
    setLoading(true);,
    setError(null);,
    try {;
const res = await fetch(`${apiBase, }/autoconfig`);;
const data = await res.json();
      setHw(data.hardware);
      setSuggested(data.suggested);
      setSettings(data.suggested);
    } catch (e: unknown) {
      setError(e?.message || 'Fehler bei Auto-Konfiguration');,
    } finally {
      setLoading(false);,
    }
  };

  useEffect(() => {
    loadSettings();,
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2, }>
        <Box>
          <Typography variant="h5">Programm Einstellungen</Typography>
          <Typography variant="body2" color="text.secondary">Assistenten, Modi und Auto-Konfiguration</Typography>
        </Box>
        <Button variant="contained" onClick={saveSettings, } disabled={saving || !settings, }>Speichern</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error, }</Alert>}

      {loading && (, <Box display="flex" alignItems="center" gap={1, } mb={2, }>
          <CircularProgress size={18, } />
          <Typography variant="body2">Lade…</Typography>
        </Box>)}

      {settings && (<Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={2, }>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1">Modus</Typography>
            <Typography variant="body2" color="text.secondary" mb={1, }>Wählen Sie einen Betriebsmodus:</Typography>
            <Select
              fullWidth
              size="small"
              value={settings.mode, }
              onChange={(e) => setSettings({ ...settings, mode: e.target.value as SettingsData['mode'] })}
            >
              <MenuItem value="development">Entwicklung</MenuItem>
              <MenuItem value="demo">Demonstration (Pitches, Testdaten)</MenuItem>
              <MenuItem value="production">Produktivsystem (Guided Setup)</MenuItem>
              <MenuItem value="training">Lern- und Übungsplattform</MenuItem>
            </Select>
            <Box mt={1,}>
              <Chip label={settings.mode.toUpperCase(),} size="small" />
            </Box>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1">Assistenten</Typography>
            <FormControlLabel 
              control={<Switch checked={settings.assistants.voice,} onChange={(_, v) => setSettings({ ...settings, assistants: { ...settings.assistants, voice: v } })} />} 
              label="Sprachassistent aktivieren" 
            />
            <FormControlLabel 
              control={<Switch checked={settings.assistants.rag,} onChange={(_, v) => setSettings({ ...settings, assistants: { ...settings.assistants, rag: v } })} />} 
              label="RAG aktivieren" 
            />
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2" color="text.secondary" mb={1,}>Vektor-Backend</Typography>
            <Select
              fullWidth
              size="small"
              value={settings.assistants.vector_backend,}
              onChange={(e) => setSettings({ ...settings, assistants: { ...settings.assistants, vector_backend: e.target.value as any } })}
            >
              <MenuItem value="fallback">BM25 Fallback (Standard)</MenuItem>
              <MenuItem value="faiss">FAISS (on-demand)</MenuItem>
              <MenuItem value="chroma">Chroma (on-demand)</MenuItem>
              <MenuItem value="qdrant">Qdrant (Docker)</MenuItem>
            </Select>
            <FormControlLabel 
              control={<Switch checked={settings.assistants.dir_scoped_index,} onChange={(_, v) => setSettings({ ...settings, assistants: { ...settings.assistants, dir_scoped_index: v } })} />} 
              label="Nur ausgewählte Ordner indizieren" 
            />
            <FormControlLabel 
              control={<Switch checked={settings.assistants.chroma_enabled,} onChange={(_, v) => setSettings({ ...settings, assistants: { ...settings.assistants, chroma_enabled: v } })} />} 
              label="Chroma aktivieren" 
            />
            <FormControlLabel 
              control={<Switch checked={settings.assistants.qdrant_enabled,} onChange={(_, v) => setSettings({ ...settings, assistants: { ...settings.assistants, qdrant_enabled: v } })} />} 
              label="Qdrant aktivieren" 
            />
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1">LLM</Typography>
            <Typography variant="body2" color="text.secondary" mb={1,}>Modell</Typography>
            <Select
              fullWidth
              size="small"
              value={settings.llm.model,}
              onChange={(e) => setSettings({ ...settings, llm: { ...settings.llm, model: e.target.value as string } })}
            >
              <MenuItem value="gpt-oss-20b-small">gpt-oss-20b-small (empfohlen lokal)</MenuItem>
            </Select>
            <Typography variant="caption" color="text.secondary">Provider: {settings.llm.provider,}</Typography>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1">Auto-Konfiguration</Typography>
            <Typography variant="body2" color="text.secondary" mb={1,}>Hardware prüfen und optimale Einstellungen vorschlagen</Typography>
            <Box display="flex" gap={1,}>
              <Button variant="outlined" onClick={runAutoConfig,}>Hardware Check</Button>
              <Button variant="contained" disabled={!suggested,} onClick={saveSettings,}>Vorschläge übernehmen</Button>
            </Box>
            {hw && (<Box mt={2, }>
                <Typography variant="body2">CPU: {hw.cpu_count, } • RAM: {hw.ram_gb ?? '?', } GB • GPU: {hw.has_nvidia ? 'NVIDIA' : 'Nein'}</Typography>
                <Typography variant="body2">Audio In/Out: {hw.audio_input_available ? 'Ja' : 'Nein'} / {hw.audio_output_available ? 'Ja' : 'Nein'}</Typography>
                <Typography variant="body2">ffmpeg: {hw.ffmpeg_present ? 'gefunden' : 'fehlt'}</Typography>
              </Box>)}
          </Paper>
        </Box>
      )}
    </Box>
  );
}; 