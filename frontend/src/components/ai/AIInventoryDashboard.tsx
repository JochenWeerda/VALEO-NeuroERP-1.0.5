import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  Grid,
  Chip
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { SuggestionTable, SuggestionTableColumn } from './shared/SuggestionTable';
import { ConfidenceIndicator } from './shared/ConfidenceIndicator';

interface InventorySuggestion {
  id: string;
  product_id: string;
  product_name: string;
  current_stock: number;
  suggested_quantity: number;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  confidence_score: number;
  reason: string;
  cost_impact: number;
  seasonal_factor: number;
  created_at: string;
}

interface InventoryStats {
  total_suggestions: number;
  high_urgency_count: number;
  total_cost_impact: number;
  average_confidence: number;
  suggestions_by_urgency: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

const columns: SuggestionTableColumn<InventorySuggestion>[] = [
  { key: 'product_name', label: 'Produkt', width: 180 },
  { key: 'current_stock', label: 'Bestand', align: 'right' },
  { key: 'suggested_quantity', label: 'Vorschlag', align: 'right', render: row => <span className="font-semibold text-blue-600">{row.suggested_quantity}</span> },
  { key: 'urgency_level', label: 'Dringlichkeit', align: 'center', render: row => <>
    <span className="hidden md:inline">{row.urgency_level.charAt(0).toUpperCase() + row.urgency_level.slice(1)}</span>
    <span className="md:hidden">{row.urgency_level[0].toUpperCase()}</span>
  </> },
  { key: 'confidence_score', label: 'Konfidenz', align: 'center', render: row => <ConfidenceIndicator confidence={row.confidence_score} size="small" variant="chip" /> },
  { key: 'cost_impact', label: 'Kosten', align: 'right', render: row => <span className="font-semibold text-green-600">€{row.cost_impact.toFixed(2)}</span> },
  { key: 'seasonal_factor', label: 'Saison', align: 'center', render: row => <span>{(row.seasonal_factor * 100).toFixed(0)}%</span> },
];

const AIInventoryDashboard: React.FC = () => {
  const [suggestions, setSuggestions] = useState<InventorySuggestion[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [filterProduct, setFilterProduct] = useState<string>('');
  const [selectedSuggestion, setSelectedSuggestion] = useState<InventorySuggestion | null>(null);
  const [optimizeDialogOpen, setOptimizeDialogOpen] = useState(false);
  const [optimizeParams, setOptimizeParams] = useState({
    min_confidence: 0.7,
    max_cost_impact: 1000,
    urgency_weight: 0.5
  });

  // API-Aufrufe
  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai/inventory/suggestions');
      if (!response.ok) throw new Error('Fehler beim Laden der Vorschläge');
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/ai/inventory/stats');
      if (!response.ok) throw new Error('Fehler beim Laden der Statistiken');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
  };

  const optimizeInventory = async () => {
    try {
      const response = await fetch('/api/ai/inventory/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(optimizeParams)
      });
      if (!response.ok) throw new Error('Fehler bei der Optimierung');
      await fetchSuggestions();
      setOptimizeDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Optimierungsfehler');
    }
  };

  useEffect(() => {
    fetchSuggestions();
    fetchStats();
  }, []);

  const filteredSuggestions = suggestions.filter(suggestion => {
    const matchesUrgency = filterUrgency === 'all' || suggestion.urgency_level === filterUrgency;
    const matchesProduct = filterProduct === '' || suggestion.product_name.toLowerCase().includes(filterProduct.toLowerCase());
    return matchesUrgency && matchesProduct;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Typography variant="h4" className="text-gray-800 font-semibold">
            KI-Inventur-Vorschläge
          </Typography>
          <Typography variant="body1" className="text-gray-600">
            Automatische Vorschläge für optimale Lagerbestände
          </Typography>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchSuggestions}
          >
            Aktualisieren
          </Button>
          <Button
            variant="contained"
            startIcon={<SettingsIcon />}
            onClick={() => setOptimizeDialogOpen(true)}
          >
            Optimieren
          </Button>
        </div>
      </div>

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Statistiken */}
      {stats && (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="bg-blue-50">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Typography color="textSecondary" gutterBottom>
                      Gesamt-Vorschläge
                    </Typography>
                    <Typography variant="h4" className="text-blue-600">
                      {stats.total_suggestions}
                    </Typography>
                  </div>
                  <InventoryIcon className="text-blue-500 text-3xl" />
                </div>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="bg-orange-50">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Typography color="textSecondary" gutterBottom>
                      Hohe Dringlichkeit
                    </Typography>
                    <Typography variant="h4" className="text-orange-600">
                      {stats.high_urgency_count}
                    </Typography>
                  </div>
                  <WarningIcon className="text-orange-500 text-3xl" />
                </div>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="bg-green-50">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Typography color="textSecondary" gutterBottom>
                      Kosten-Impact
                    </Typography>
                    <Typography variant="h4" className="text-green-600">
                      €{stats.total_cost_impact.toFixed(0)}
                    </Typography>
                  </div>
                  <MoneyIcon className="text-green-500 text-3xl" />
                </div>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="bg-purple-50">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Typography color="textSecondary" gutterBottom>
                      Durchschn. Konfidenz
                    </Typography>
                    <Typography variant="h4" className="text-purple-600">
                      {(stats.average_confidence * 100).toFixed(1)}%
                    </Typography>
                  </div>
                  <AnalyticsIcon className="text-purple-500 text-3xl" />
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filter */}
      <Card>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <Typography variant="h6">Filter:</Typography>
            <FormControl size="small" className="min-w-32">
              <InputLabel>Dringlichkeit</InputLabel>
              <Select
                value={filterUrgency}
                onChange={(e) => setFilterUrgency(e.target.value)}
                label="Dringlichkeit"
              >
                <MenuItem value="all">Alle</MenuItem>
                <MenuItem value="low">Niedrig</MenuItem>
                <MenuItem value="medium">Mittel</MenuItem>
                <MenuItem value="high">Hoch</MenuItem>
                <MenuItem value="critical">Kritisch</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="Produkt suchen"
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className="min-w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Vorschläge Tabelle */}
      <SuggestionTable
        data={filteredSuggestions}
        columns={columns}
        onView={setSelectedSuggestion}
        loading={loading}
        emptyText="Keine Inventur-Vorschläge gefunden"
      />

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedSuggestion}
        onClose={() => setSelectedSuggestion(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedSuggestion && (
          <>
            <DialogTitle>
              <div className="flex items-center space-x-2">
                <InventoryIcon />
                <span>Vorschlag Details: {selectedSuggestion.product_name}</span>
              </div>
            </DialogTitle>
            <DialogContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Typography variant="subtitle2" color="textSecondary">
                      Aktueller Bestand
                    </Typography>
                    <Typography variant="h6">{selectedSuggestion.current_stock}</Typography>
                  </div>
                  <div>
                    <Typography variant="subtitle2" color="textSecondary">
                      Vorgeschlagene Menge
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {selectedSuggestion.suggested_quantity}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="subtitle2" color="textSecondary">
                      Dringlichkeit
                    </Typography>
                    <Chip
                      label={selectedSuggestion.urgency_level.toUpperCase()}
                      color="primary"
                    />
                  </div>
                  <div>
                    <Typography variant="subtitle2" color="textSecondary">
                      Konfidenz
                    </Typography>
                    <ConfidenceIndicator confidence={selectedSuggestion.confidence_score} />
                  </div>
                  <div>
                    <Typography variant="subtitle2" color="textSecondary">
                      Kosten-Impact
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      €{selectedSuggestion.cost_impact.toFixed(2)}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="subtitle2" color="textSecondary">
                      Saison-Faktor
                    </Typography>
                    <Typography variant="h6">
                      {(selectedSuggestion.seasonal_factor * 100).toFixed(1)}%
                    </Typography>
                  </div>
                </div>
                <div>
                  <Typography variant="subtitle2" color="textSecondary">
                    Begründung
                  </Typography>
                  <Typography variant="body1" className="mt-1">
                    {selectedSuggestion.reason}
                  </Typography>
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedSuggestion(null)}>
                Schließen
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Optimierung Dialog */}
      <Dialog
        open={optimizeDialogOpen}
        onClose={() => setOptimizeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Inventur-Parameter optimieren</DialogTitle>
        <DialogContent>
          <div className="space-y-4 pt-2">
            <TextField
              fullWidth
              label="Minimale Konfidenz"
              type="number"
              inputProps={{ min: 0, max: 1, step: 0.1 }}
              value={optimizeParams.min_confidence}
              onChange={(e) => setOptimizeParams({
                ...optimizeParams,
                min_confidence: parseFloat(e.target.value)
              })}
            />
            <TextField
              fullWidth
              label="Maximaler Kosten-Impact (€)"
              type="number"
              value={optimizeParams.max_cost_impact}
              onChange={(e) => setOptimizeParams({
                ...optimizeParams,
                max_cost_impact: parseFloat(e.target.value)
              })}
            />
            <TextField
              fullWidth
              label="Dringlichkeit-Gewichtung"
              type="number"
              inputProps={{ min: 0, max: 1, step: 0.1 }}
              value={optimizeParams.urgency_weight}
              onChange={(e) => setOptimizeParams({
                ...optimizeParams,
                urgency_weight: parseFloat(e.target.value)
              })}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOptimizeDialogOpen(false)}>
            Abbrechen
          </Button>
          <Button onClick={optimizeInventory} variant="contained">
            Optimieren
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AIInventoryDashboard; 