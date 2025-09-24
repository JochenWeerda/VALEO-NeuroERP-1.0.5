import React, { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Select, MenuItem, Chip, CircularProgress, Divider, List, ListItem, ListItemText, IconButton, InputLabel, FormControl } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface RagHitMeta { file?: string; filePath?: string; startLine?: number; endLine?: number; [k: string]: any }
interface RagHit { text: string; metadata?: RagHitMeta; score?: number }

type VectorBackend = 'fallback' | 'faiss' | 'chroma' | 'qdrant';

export const RAGPanel: React.FC = () => {
  const apiBase: string = (window as any).__VALEO_API_BASE__ || '';

  // Build state
  const [paths, setPaths] = useState<string>('linkup_mcp');
  const [backend, setBackend] = useState<VectorBackend>('fallback');
  const [building, setBuilding] = useState<boolean>(false);
  const [buildMsg, setBuildMsg] = useState<string>('');

  // Query state
  const [query, setQuery] = useState<string>('Where is the LangGraph workflow defined?');
  const [topK, setTopK] = useState<number>(5);
  const [searching, setSearching] = useState<boolean>(false);
  const [hits, setHits] = useState<RagHit[]>([]);

  // Answer state
  const [answering, setAnswering] = useState<boolean>(false);
  const [answer, setAnswer] = useState<string>('');

  // Load default backend from settings
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${apiBase}/settings`);
        if (!res.ok) return;
        const data = await res.json();
        const be = (data?.data?.assistants?.vector_backend || 'fallback') as VectorBackend;
        setBackend(be);
      } catch {/* ignore */}
    })();
  }, [apiBase]);

  const handleBuild = async () => {
    setBuilding(true); setBuildMsg('');
    try {
      const body = { paths: paths.split(',').map(s => s.trim()).filter(Boolean), backend };
      const res = await fetch(`${apiBase}/rag/build`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      });
      const json = await res.json();
      if (!res.ok || json?.ok === false) throw new Error(json?.error || `HTTP ${res.status}`);
      setBuildMsg(`Index gebaut: ${json.paths?.join(', ')} (${json.backend})`);
    } catch (e: any) {
      setBuildMsg(`Fehler: ${e?.message || e}`);
    } finally {
      setBuilding(false);
    }
  };

  const handleQuery = async () => {
    setSearching(true); setHits([]); setAnswer('');
    try {
      const res = await fetch(`${apiBase}/rag/query?q=${encodeURIComponent(query)}&k=${topK}`);
      const json = await res.json();
      setHits(Array.isArray(json?.hits) ? json.hits : json);
    } catch {/* ignore */}
    finally { setSearching(false); }
  };

  const handleAnswer = async () => {
    setAnswering(true); setAnswer('');
    try {
      const res = await fetch(`${apiBase}/rag/answer`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: query, k: topK })
      });
      const json = await res.json();
      setAnswer(json?.answer || '');
      if (Array.isArray(json?.hits)) setHits(json.hits);
    } catch {/* ignore */}
    finally { setAnswering(false); }
  };

  const copy = (text: string) => navigator.clipboard?.writeText(text);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1, p: 1 }}>
      <Typography variant="subtitle1">RAG</Typography>

      {/* Build */}
      <Paper variant="outlined" sx={{ p: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Build</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1 }}>
          <TextField size="small" label="Pfad(e) (kommagetrennt)" value={paths} onChange={(e) => setPaths(e.target.value)} />
          <FormControl size="small">
            <InputLabel>Backend</InputLabel>
            <Select label="Backend" value={backend} onChange={(e) => setBackend(e.target.value as VectorBackend)}>
              <MenuItem value="fallback">BM25 (Standard)</MenuItem>
              <MenuItem value="faiss">FAISS</MenuItem>
              <MenuItem value="chroma">Chroma</MenuItem>
              <MenuItem value="qdrant">Qdrant</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button variant="contained" onClick={handleBuild} disabled={building}>Index bauen</Button>
            {building && <CircularProgress size={18} />}
            {buildMsg && <Chip size="small" label={buildMsg} />}
          </Box>
        </Box>
      </Paper>

      {/* Query */}
      <Paper variant="outlined" sx={{ p: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Query</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 1 }}>
          <TextField size="small" label="Frage/Query" value={query} onChange={(e) => setQuery(e.target.value)} fullWidth />
          <FormControl size="small" sx={{ minWidth: 80 }}>
            <InputLabel>TopK</InputLabel>
            <Select label="TopK" value={topK} onChange={(e) => setTopK(Number(e.target.value))}>
              {[3,5,8,10].map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <Button variant="contained" onClick={handleQuery} disabled={searching}>Suchen</Button>
          {searching && <CircularProgress size={18} />}
        </Box>
        <Divider sx={{ my: 1 }} />
        <List dense sx={{ maxHeight: 160, overflow: 'auto' }}>
          {hits.map((h, i) => (
            <ListItem key={i} secondaryAction={<IconButton edge="end" onClick={() => copy(h.text)}><ContentCopyIcon fontSize="small" /></IconButton>}>
              <ListItemText
                primaryTypographyProps={{ variant: 'body2' }}
                primary={(h.metadata?.filePath || h.metadata?.file || '') + (h.metadata?.startLine ? `:${h.metadata.startLine}` : '')}
                secondary={h.text?.slice(0, 200) + (h.text && h.text.length > 200 ? '…' : '')}
              />
            </ListItem>
          ))}
          {!hits.length && <Typography variant="caption" color="text.secondary">Keine Treffer</Typography>}
        </List>
      </Paper>

      {/* Answer */}
      <Paper variant="outlined" sx={{ p: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Answer</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button variant="contained" onClick={handleAnswer} disabled={answering}>Synthese starten</Button>
          {answering && <CircularProgress size={18} />}
        </Box>
        <Box sx={{ mt: 1, flex: 1, overflow: 'auto', p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{answer || '—'}</Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default RAGPanel;
