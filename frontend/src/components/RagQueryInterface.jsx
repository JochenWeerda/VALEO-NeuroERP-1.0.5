import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CloseIcon from '@mui/icons-material/Close';
import { API_BASE_URL } from '../config';

/**
 * Komponente für die RAG-Abfrage-Benutzeroberfläche.
 * Ermöglicht Web-Suche und RAG-Abfragen mit Anzeige der Ergebnisse.
 */
const RagQueryInterface = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [ragResponse, setRagResponse] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [ragHistory, setRagHistory] = useState([]);
  const [showMetrics, setShowMetrics] = useState(false);
  const [metrics, setMetrics] = useState(null);

  // Funktion zum Durchführen einer Web-Suche
  const handleWebSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setSearchResults(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/rag/web-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP-Fehler: ${response.status}`);
      }
      
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      setError(`Fehler bei der Web-Suche: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Funktion zum Durchführen einer RAG-Abfrage
  const handleRagQuery = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setRagResponse(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/rag/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP-Fehler: ${response.status}`);
      }
      
      const data = await response.json();
      setRagResponse(data);
    } catch (err) {
      setError(`Fehler bei der RAG-Abfrage: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Funktion zum Laden der Suchhistorie
  const loadSearchHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/rag/search-history?limit=5`);
      
      if (!response.ok) {
        throw new Error(`HTTP-Fehler: ${response.status}`);
      }
      
      const data = await response.json();
      setSearchHistory(data);
    } catch (err) {
      console.error(`Fehler beim Laden der Suchhistorie: ${err.message}`);
    }
  };

  // Funktion zum Laden der RAG-Abfragehistorie
  const loadRagHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/rag/rag-history?limit=5`);
      
      if (!response.ok) {
        throw new Error(`HTTP-Fehler: ${response.status}`);
      }
      
      const data = await response.json();
      setRagHistory(data);
    } catch (err) {
      console.error(`Fehler beim Laden der RAG-Abfragehistorie: ${err.message}`);
    }
  };

  // Funktion zum Laden der Leistungsmetriken
  const loadMetrics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/rag/performance-metrics`);
      
      if (!response.ok) {
        throw new Error(`HTTP-Fehler: ${response.status}`);
      }
      
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      console.error(`Fehler beim Laden der Leistungsmetriken: ${err.message}`);
    }
  };

  // Funktion zum Umschalten der Historienanzeige
  const toggleHistory = () => {
    if (!showHistory) {
      loadSearchHistory();
      loadRagHistory();
    }
    setShowHistory(!showHistory);
  };

  // Funktion zum Umschalten der Metrikanzeige
  const toggleMetrics = () => {
    if (!showMetrics) {
      loadMetrics();
    }
    setShowMetrics(!showMetrics);
  };

  // Funktion zum Auswählen einer Abfrage aus der Historie
  const selectQueryFromHistory = (historyQuery) => {
    setQuery(historyQuery);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      <Typography variant="h4" gutterBottom>
        RAG-Abfrage-Interface
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TextField
            fullWidth
            label="Abfrage eingeben"
            variant="outlined"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleRagQuery()}
            disabled={loading}
            sx={{ mr: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleRagQuery}
            disabled={loading || !query.trim()}
            startIcon={<SearchIcon />}
            sx={{ mr: 1 }}
          >
            RAG-Abfrage
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleWebSearch}
            disabled={loading || !query.trim()}
            startIcon={<SearchIcon />}
            sx={{ mr: 1 }}
          >
            Web-Suche
          </Button>
          <Tooltip title="Historie anzeigen">
            <IconButton onClick={toggleHistory} color={showHistory ? "primary" : "default"}>
              <HistoryIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Metriken anzeigen">
            <IconButton onClick={toggleMetrics} color={showMetrics ? "primary" : "default"}>
              <TrendingUpIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Box sx={{ my: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}
      </Paper>
      
      {/* Historienanzeige */}
      {showHistory && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Abfragehistorie</Typography>
            <IconButton onClick={() => setShowHistory(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Typography variant="subtitle1" gutterBottom>Web-Suchen</Typography>
          <List dense>
            {searchHistory.length > 0 ? (
              searchHistory.map((item, index) => (
                <ListItem 
                  key={`search-${index}`} 
                  button 
                  onClick={() => selectQueryFromHistory(item.query)}
                >
                  <ListItemText 
                    primary={item.query} 
                    secondary={new Date(item.timestamp).toLocaleString()} 
                  />
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="Keine Suchhistorie verfügbar" />
              </ListItem>
            )}
          </List>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>RAG-Abfragen</Typography>
          <List dense>
            {ragHistory.length > 0 ? (
              ragHistory.map((item, index) => (
                <ListItem 
                  key={`rag-${index}`} 
                  button 
                  onClick={() => selectQueryFromHistory(item.query)}
                >
                  <ListItemText 
                    primary={item.query} 
                    secondary={new Date(item.timestamp).toLocaleString()} 
                  />
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="Keine RAG-Abfragehistorie verfügbar" />
              </ListItem>
            )}
          </List>
        </Paper>
      )}
      
      {/* Metrikanzeige */}
      {showMetrics && metrics && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Leistungsmetriken</Typography>
            <IconButton onClick={() => setShowMetrics(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Card sx={{ minWidth: 200 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Durchschnittliche Ausführungszeit</Typography>
                <Typography variant="h6">{metrics.avg_execution_time.toFixed(3)} s</Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ minWidth: 200 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Max. Ausführungszeit</Typography>
                <Typography variant="h6">{metrics.max_execution_time.toFixed(3)} s</Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ minWidth: 200 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Min. Ausführungszeit</Typography>
                <Typography variant="h6">{metrics.min_execution_time.toFixed(3)} s</Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ minWidth: 200 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Durchschnittliche Dokumente</Typography>
                <Typography variant="h6">{metrics.avg_document_count.toFixed(1)}</Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ minWidth: 200 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Gesamtabfragen</Typography>
                <Typography variant="h6">{metrics.total_queries}</Typography>
              </CardContent>
            </Card>
          </Box>
        </Paper>
      )}
      
      {/* RAG-Antwort */}
      {ragResponse && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>RAG-Antwort</Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
            {ragResponse.response}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Verwendete Dokumente ({ragResponse.documents.length})
          </Typography>
          
          <List dense>
            {ragResponse.documents.map((doc, index) => (
              <ListItem key={index}>
                <ListItemText 
                  primary={doc.title || `Dokument ${index + 1}`} 
                  secondary={`Relevanz: ${(doc.score * 100).toFixed(1)}%`} 
                />
              </ListItem>
            ))}
          </List>
          
          <Box sx={{ mt: 2 }}>
            <Chip 
              label={`Ausführungszeit: ${ragResponse.execution_time.toFixed(3)} s`} 
              variant="outlined" 
              size="small" 
              sx={{ mr: 1 }} 
            />
          </Box>
        </Paper>
      )}
      
      {/* Web-Suchergebnisse */}
      {searchResults && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Web-Suchergebnisse ({searchResults.results.length})
          </Typography>
          
          <List>
            {searchResults.results.map((result, index) => (
              <ListItem key={index} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography variant="subtitle1" component="a" href={result.url} target="_blank" rel="noopener noreferrer">
                  {result.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {result.url}
                </Typography>
                <Typography variant="body2">
                  {result.snippet}
                </Typography>
              </ListItem>
            ))}
          </List>
          
          <Box sx={{ mt: 2 }}>
            <Chip 
              label={`Ausführungszeit: ${searchResults.execution_time.toFixed(3)} s`} 
              variant="outlined" 
              size="small" 
              sx={{ mr: 1 }} 
            />
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default RagQueryInterface; 