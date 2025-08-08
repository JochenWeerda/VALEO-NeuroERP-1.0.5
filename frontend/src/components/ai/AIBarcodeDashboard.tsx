import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Box, Chip, IconButton, Tooltip,
  CircularProgress, FormControl, InputLabel, Select, MenuItem, Grid, LinearProgress, Snackbar
} from '@mui/material';
import {
  QrCode as BarcodeIcon, TrendingUp as TrendingIcon, Psychology as AIIcon,
  Refresh as RefreshIcon, Settings as SettingsIcon, Visibility as ViewIcon,
  CheckCircle as CheckIcon, Warning as WarningIcon, Info as InfoIcon,
  AutoAwesome as AutoAwesomeIcon, Analytics as AnalyticsIcon,
  WifiOff as OfflineIcon, Sync as SyncIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { SuggestionTable, SuggestionTableColumn } from './shared/SuggestionTable';
import { ConfidenceIndicator } from './shared/ConfidenceIndicator';
import { useOffline } from '../../hooks/useOffline';

interface BarcodeSuggestion {
  id: string;
  product_name: string;
  suggested_barcode: string;
  confidence_score: number;
  reasoning: string;
  category: string;
  similar_products: string[];
  market_trends: {
    demand_trend: string;
    price_trend: string;
    seasonality: string;
  };
  created_at: string;
}

interface AIBarcodeStats {
  total_suggestions: number;
  high_confidence: number;
  medium_confidence: number;
  low_confidence: number;
  categories: { name: string; count: number }[];
  confidence_trend: { date: string; avg_confidence: number }[];
  top_categories: { category: string; count: number }[];
}

interface AIBarcodeDashboardProps {
  className?: string;
}

// Tabellen-Spalten-Konfiguration
const columns: SuggestionTableColumn<BarcodeSuggestion>[] = [
  { 
    key: 'product_name', 
    label: 'Produkt', 
    width: 200,
    render: row => (
      <Typography variant="body2" className="font-medium">
        {row.product_name}
      </Typography>
    )
  },
  { 
    key: 'suggested_barcode', 
    label: 'Vorgeschlagener Barcode', 
    width: 180,
    render: row => (
      <Box className="flex items-center gap-2">
        <BarcodeIcon className="text-gray-500 text-sm" />
        <Typography variant="body2" className="font-mono text-sm">
          {row.suggested_barcode}
        </Typography>
      </Box>
    )
  },
  { 
    key: 'category', 
    label: 'Kategorie', 
    align: 'center',
    render: row => (
      <Chip 
        label={row.category} 
        size="small" 
        variant="outlined"
        className="text-xs"
      />
    )
  },
  { 
    key: 'confidence_score', 
    label: 'Konfidenz', 
    align: 'center',
    render: row => (
      <ConfidenceIndicator 
        confidence={row.confidence_score} 
        size="small" 
        variant="chip" 
      />
    )
  },
  { 
    key: 'market_trends', 
    label: 'Markttrends', 
    align: 'center',
    render: row => (
      <Box className="flex items-center gap-1">
        <TrendingIcon className="text-green-600 text-sm" />
        <Typography variant="caption" className="text-gray-600">
          {row.market_trends.demand_trend}
        </Typography>
      </Box>
    )
  },
  { 
    key: 'created_at', 
    label: 'Erstellt', 
    align: 'center',
    render: row => (
      <Typography variant="caption" className="text-gray-500">
        {new Date(row.created_at).toLocaleDateString('de-DE')}
      </Typography>
    )
  }
];

const AIBarcodeDashboard: React.FC<AIBarcodeDashboardProps> = ({ className = '' }) => {
  // Offline-Hooks für Offline-First-Funktionalität
  const { isOnline, pendingRequests } = useOffline();
  const [offlineSuggestions, setOfflineSuggestions] = useState<BarcodeSuggestion[]>([]);
  const [offlineStats, setOfflineStats] = useState<AIBarcodeStats | null>(null);

  const [suggestions, setSuggestions] = useState<BarcodeSuggestion[]>([]);
  const [stats, setStats] = useState<AIBarcodeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<BarcodeSuggestion | null>(null);
  const [optimizationDialog, setOptimizationDialog] = useState(false);
  const [retrainingDialog, setRetrainingDialog] = useState(false);
  const [retrainingLoading, setRetrainingLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterConfidence, setFilterConfidence] = useState<string>('all');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // API-Aufrufe mit Offline-First-Funktionalität
  const loadSuggestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Versuche Online-API
      const response = await fetch('/api/ai/barcode/suggestions');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      const suggestionsData = Array.isArray(data.data) ? data.data : [];
      setSuggestions(suggestionsData);
      
      // Zeige Offline-Hinweis wenn nötig
      if (!isOnline && offlineSuggestions.length > 0) {
        setSnackbar({
          open: true,
          message: 'Offline-Modus: Anzeige gespeicherter Daten',
          severity: 'info'
        });
      }
    } catch (err) {
      // Vereinheitlichte Fehlermeldung für Tests
      setError('Fehler beim Laden der Vorschläge');
      console.error('Fehler beim Laden der Barcode-Vorschläge:', err);
      
      // Fallback zu Offline-Daten wenn verfügbar
      if (offlineSuggestions.length > 0) {
        setSuggestions(offlineSuggestions);
        setSnackbar({
          open: true,
          message: 'Offline-Modus: Anzeige gespeicherter Daten',
          severity: 'info'
        });
      }
    } finally {
      setLoading(false);
    }
  }, [isOnline, offlineSuggestions]);

  const loadStats = useCallback(async () => {
    try {
      const response = await fetch('/api/ai/barcode/stats');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      const raw = data.data || {};
      const normalized: AIBarcodeStats = {
        total_suggestions: Number(raw.total_suggestions) || 0,
        high_confidence: Number(raw.high_confidence) || 0,
        medium_confidence: Number(raw.medium_confidence) || 0,
        low_confidence: Number(raw.low_confidence) || 0,
        categories: Array.isArray(raw.categories) ? raw.categories : [],
        confidence_trend: Array.isArray(raw.confidence_trend) ? raw.confidence_trend : [],
        top_categories: Array.isArray(raw.top_categories) ? raw.top_categories : []
      };
      setStats(normalized);
    } catch (err) {
      console.error('Fehler beim Laden der Statistiken:', err);
      // Fallback zu Offline-Statistiken wenn verfügbar
      if (offlineStats) {
        setStats(offlineStats);
      }
    }
  }, [offlineStats]);

  const retrainModel = useCallback(async () => {
    setRetrainingLoading(true);
    try {
      const response = await fetch('/api/ai/barcode/retrain', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      setSnackbar({
        open: true,
        message: 'KI-Modell erfolgreich neu trainiert',
        severity: 'success'
      });
      
      await Promise.all([loadSuggestions(), loadStats()]);
      setRetrainingDialog(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Neuladen des Modells';
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
      console.error('Fehler beim Neuladen des Modells:', err);
    } finally {
      setRetrainingLoading(false);
    }
  }, [loadSuggestions, loadStats]);

  const optimizeSuggestion = useCallback(async (suggestionId: string, optimizationData: any) => {
    try {
      const response = await fetch(`/api/ai/barcode/optimize/${suggestionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(optimizationData)
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      setSnackbar({
        open: true,
        message: 'Barcode-Vorschlag erfolgreich optimiert',
        severity: 'success'
      });
      
      await loadSuggestions();
      setOptimizationDialog(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler bei der Optimierung';
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
      console.error('Optimierungsfehler:', err);
    }
  }, [loadSuggestions]);

  // Initialisierung
  useEffect(() => {
    loadSuggestions();
    loadStats();
  }, [loadSuggestions, loadStats]);

  // Gefilterte Vorschläge
  const filteredSuggestions = useMemo(() => {
    return suggestions.filter(suggestion => {
      if (filterCategory !== 'all' && suggestion.category !== filterCategory) return false;
      if (filterConfidence !== 'all') {
        const confidence = suggestion.confidence_score;
        if (filterConfidence === 'high' && confidence < 0.8) return false;
        if (filterConfidence === 'medium' && (confidence < 0.6 || confidence >= 0.8)) return false;
        if (filterConfidence === 'low' && confidence >= 0.6) return false;
      }
      return true;
    });
  }, [suggestions, filterCategory, filterConfidence]);

  // Verfügbare Kategorien für Filter
  const availableCategories = useMemo(() => {
    const categories = new Set(suggestions.map(s => s.category));
    return Array.from(categories).sort();
  }, [suggestions]);

  // Hinweis bei initialem Laden (nicht als harter Return, damit Header/Buttons testbar bleiben)
  const isInitialLoading = loading && suggestions.length === 0;

  return (
    <div className={`space-y-6 ${className}`} role="main" aria-label="KI-Barcode-Vorschläge Dashboard">
      {/* Header */}
      <Card className="p-6 shadow-lg">
        <Box className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <Box className="flex items-center gap-3">
            <AIIcon className="text-blue-600 text-3xl" aria-hidden="true" />
          <Box className="flex-col md:flex-row">
              <Typography variant="h4" className="font-semibold text-gray-800">
                KI-Barcode-Vorschläge
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Intelligente Barcode-Generierung und -Optimierung mit künstlicher Intelligenz
              </Typography>
            </Box>
          </Box>
          <Box className="flex gap-2 flex-wrap">
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadSuggestions}
              disabled={loading}
              aria-label="Vorschläge aktualisieren"
            >
              Aktualisieren
            </Button>
            <Button
              variant="contained"
              startIcon={<AutoAwesomeIcon />}
              onClick={() => setRetrainingDialog(true)}
              disabled={loading || retrainingLoading}
              aria-label="KI-Modell neu trainieren"
            >
              Modell neu laden
            </Button>
          </Box>
        </Box>

        {isInitialLoading && (
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            minHeight="200px"
            className="flex-col gap-4"
          >
            <CircularProgress size={60} />
            <Typography variant="h6" color="textSecondary">
              KI-Barcode-Vorschläge werden geladen...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert 
            severity="error" 
            className="mb-6"
            onClose={() => setError(null)}
            action={
              <Button color="inherit" size="small" onClick={loadSuggestions}>
                Erneut versuchen
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Offline-Status-Anzeige */}
        {!isOnline && (
          <Alert 
            severity="info" 
            className="mb-6"
            icon={<OfflineIcon />}
            action={
              <Box className="flex items-center gap-2">
                {pendingRequests.length > 0 && (
                  <Chip 
                    label={`${pendingRequests.length} Sync`} 
                    size="small" 
                    color="warning" 
                    variant="outlined"
                  />
                )}
                <Button 
                  color="inherit" 
                  size="small" 
                  startIcon={<SyncIcon />}
                  onClick={loadSuggestions}
                >
                  Synchronisieren
                </Button>
              </Box>
            }
          >
            <Typography variant="body2">
              <strong>Offline-Modus aktiv:</strong> Anzeige gespeicherter Daten. 
              {offlineSuggestions.length > 0 && ` ${offlineSuggestions.length} Vorschläge verfügbar.`}
            </Typography>
          </Alert>
        )}

        {/* Statistiken */}
        {stats && (
          <Grid container spacing={3} className="mb-6">
            <Grid item xs={12} sm={6} md={3}>
              <Card className="p-4 text-center bg-blue-50 hover:bg-blue-100 transition-colors">
                <Typography variant="h4" className="text-blue-600 font-bold">
                  {stats.total_suggestions}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Gesamt Vorschläge
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card className="p-4 text-center bg-green-50 hover:bg-green-100 transition-colors">
                <Typography variant="h4" className="text-green-600 font-bold">
                  {stats.high_confidence}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Hohe Konfidenz
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card className="p-4 text-center bg-orange-50 hover:bg-orange-100 transition-colors">
                <Typography variant="h4" className="text-orange-600 font-bold">
                  {stats.medium_confidence}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Mittlere Konfidenz
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card className="p-4 text-center bg-red-50 hover:bg-red-100 transition-colors">
                <Typography variant="h4" className="text-red-600 font-bold">
                  {stats.low_confidence}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Niedrige Konfidenz
                </Typography>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Charts */}
        {stats && (stats.confidence_trend?.length ?? 0) > 0 && (
          <Grid container spacing={3} className="mb-6">
            <Grid item xs={12} md={6}>
              <Card className="p-4 shadow-md">
                <Typography variant="h6" className="mb-4 flex items-center gap-2">
                  <AnalyticsIcon className="text-blue-600" />
                  Konfidenz-Trend
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={stats.confidence_trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip 
                      formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Konfidenz']}
                      labelFormatter={(label) => `Datum: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avg_confidence" 
                      stroke="#1976d2" 
                      strokeWidth={2}
                      dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card className="p-4 shadow-md">
                <Typography variant="h6" className="mb-4 flex items-center gap-2">
                  <TrendingIcon className="text-green-600" />
                  Top Kategorien
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats.top_categories || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <RechartsTooltip 
                      formatter={(value: number) => [value, 'Anzahl']}
                      labelFormatter={(label) => `Kategorie: ${label}`}
                    />
                    <Bar dataKey="count" fill="#4caf50" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filter */}
        <Card className="p-4 mb-6 shadow-sm">
          <Typography variant="h6" className="mb-4 flex items-center gap-2">
            <SettingsIcon className="text-gray-600" />
            Filter & Einstellungen
          </Typography>
          <Box className="flex flex-wrap gap-4 items-center">
            <FormControl size="small" className="min-w-48">
              <InputLabel>Kategorie</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                label="Kategorie"
                aria-label="Nach Kategorie filtern"
              >
                <MenuItem value="all">Alle Kategorien</MenuItem>
                {availableCategories.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" className="min-w-48">
              <InputLabel>Konfidenz</InputLabel>
              <Select
                value={filterConfidence}
                onChange={(e) => setFilterConfidence(e.target.value)}
                label="Konfidenz"
                aria-label="Nach Konfidenz filtern"
              >
                <MenuItem value="all">Alle</MenuItem>
                <MenuItem value="high">Hoch (≥80%)</MenuItem>
                <MenuItem value="medium">Mittel (60-79%)</MenuItem>
                <MenuItem value="low">Niedrig (&lt;60%)</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body2" color="textSecondary">
              {filteredSuggestions.length} von {suggestions.length} Vorschlägen
            </Typography>
          </Box>
        </Card>

        {/* Vorschläge Tabelle */}
        <SuggestionTable
          data={filteredSuggestions}
          columns={columns}
          onView={setSelectedSuggestion}
          onOptimize={(suggestion) => {
            setSelectedSuggestion(suggestion);
            setOptimizationDialog(true);
          }}
          loading={loading}
          emptyText="Keine Barcode-Vorschläge gefunden"
          className="shadow-md"
        />
      </Card>

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedSuggestion && !optimizationDialog}
        onClose={() => setSelectedSuggestion(null)}
        maxWidth="md"
        fullWidth
        aria-labelledby="barcode-detail-dialog-title"
      >
        {selectedSuggestion && (
          <>
            <DialogTitle id="barcode-detail-dialog-title">
              <Box className="flex items-center gap-2">
                <BarcodeIcon className="text-blue-600" />
                Barcode-Vorschlag Details
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} className="mt-2">
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" className="mb-3 flex items-center gap-2">
                    <InfoIcon className="text-blue-600" />
                    Produktinformationen
                  </Typography>
                  <Box className="space-y-3">
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">Produkt</Typography>
                      <Typography variant="body1" className="font-medium">
                        {selectedSuggestion.product_name}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">Kategorie</Typography>
                      <Chip label={selectedSuggestion.category} size="small" />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">Vorgeschlagener Barcode</Typography>
                      <Typography variant="body1" className="font-mono bg-gray-100 p-2 rounded">
                        {selectedSuggestion.suggested_barcode}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">Konfidenz</Typography>
                      <ConfidenceIndicator confidence={selectedSuggestion.confidence_score} />
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" className="mb-3 flex items-center gap-2">
                    <TrendingIcon className="text-green-600" />
                    Markttrends
                  </Typography>
                  <Box className="space-y-3">
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">Nachfrage</Typography>
                      <Typography variant="body1">{selectedSuggestion.market_trends.demand_trend}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">Preis</Typography>
                      <Typography variant="body1">{selectedSuggestion.market_trends.price_trend}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">Saisonalität</Typography>
                      <Typography variant="body1">{selectedSuggestion.market_trends.seasonality}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" className="mb-3">Begründung</Typography>
                  <Typography variant="body2" className="bg-gray-50 p-4 rounded-lg">
                    {selectedSuggestion.reasoning}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" className="mb-3">Ähnliche Produkte</Typography>
                  <Box className="flex flex-wrap gap-2">
                    {selectedSuggestion.similar_products.map((product, index) => (
                      <Chip 
                        key={index} 
                        label={product} 
                        size="small" 
                        variant="outlined"
                        className="hover:bg-gray-100"
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedSuggestion(null)}>
                Schließen
              </Button>
              <Button
                variant="contained"
                startIcon={<SettingsIcon />}
                onClick={() => {
                  setOptimizationDialog(true);
                }}
              >
                Optimieren
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Optimierung Dialog */}
      <Dialog
        open={optimizationDialog}
        onClose={() => setOptimizationDialog(false)}
        maxWidth="sm"
        fullWidth
        aria-labelledby="optimization-dialog-title"
      >
        <DialogTitle id="optimization-dialog-title">
          Barcode-Vorschlag optimieren
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" className="mb-4 text-gray-600">
            Optimieren Sie die Parameter für bessere Barcode-Vorschläge basierend auf aktuellen Marktdaten.
          </Typography>
          <Alert severity="info" className="mb-4">
            <Typography variant="body2">
              Die Optimierung berücksichtigt Markttrends, Saisonalität und ähnliche Produkte für präzisere Vorschläge.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOptimizationDialog(false)}>
            Abbrechen
          </Button>
          <Button
            variant="contained"
            startIcon={<AutoAwesomeIcon />}
            onClick={() => {
              if (selectedSuggestion) {
                optimizeSuggestion(selectedSuggestion.id, {
                  product_name: selectedSuggestion.product_name,
                  category: selectedSuggestion.category
                });
              }
            }}
          >
            Optimieren
          </Button>
        </DialogActions>
      </Dialog>

      {/* Retraining Dialog */}
      <Dialog
        open={retrainingDialog}
        onClose={() => !retrainingLoading && setRetrainingDialog(false)}
        maxWidth="sm"
        fullWidth
        aria-labelledby="retraining-dialog-title"
      >
        <DialogTitle id="retraining-dialog-title">
          <Box className="flex items-center gap-2">
            <AutoAwesomeIcon className="text-blue-600" />
            KI-Modell neu laden
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" className="mb-4">
            Das KI-Modell wird mit den neuesten Daten neu trainiert. Dies kann einige Minuten dauern.
          </Typography>
          <Alert severity="info" className="mb-4">
            <Typography variant="body2">
              Das Neuladen verbessert die Genauigkeit der Barcode-Vorschläge basierend auf aktuellen Marktdaten und Verkaufsmustern.
            </Typography>
          </Alert>
          {retrainingLoading && (
            <Box className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <CircularProgress size={20} />
              <Typography variant="body2">
                Modell wird neu trainiert... Bitte warten Sie.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setRetrainingDialog(false)}
            disabled={retrainingLoading}
          >
            Abbrechen
          </Button>
          <Button
            variant="contained"
            startIcon={retrainingLoading ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
            onClick={retrainModel}
            disabled={retrainingLoading}
          >
            {retrainingLoading ? 'Neuladen läuft...' : 'Neuladen starten'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar für Benachrichtigungen */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AIBarcodeDashboard; 