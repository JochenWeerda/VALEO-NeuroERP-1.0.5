import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
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
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Slider
} from '@mui/material';
import {
  LocalOffer as VoucherIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Psychology as PsychologyIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface VoucherOptimization {
  id: string;
  voucher_type: string;
  discount_percentage: number;
  target_segment: string;
  predicted_revenue: number;
  risk_score: number;
  confidence_score: number;
  seasonal_factor: number;
  customer_segments: string[];
  optimization_reason: string;
  created_at: string;
}

interface VoucherStats {
  total_optimizations: number;
  average_revenue_prediction: number;
  average_risk_score: number;
  top_segments: Array<{
    segment: string;
    count: number;
    avg_revenue: number;
  }>;
  revenue_trends: Array<{
    month: string;
    actual: number;
    predicted: number;
  }>;
  segment_distribution: Array<{
    segment: string;
    percentage: number;
  }>;
}

interface OptimizationParams {
  min_discount: number;
  max_discount: number;
  target_revenue: number;
  risk_tolerance: number;
  seasonal_weight: number;
  segment_weight: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AIVoucherDashboard: React.FC = () => {
  const [optimizations, setOptimizations] = useState<VoucherOptimization[]>([]);
  const [stats, setStats] = useState<VoucherStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSegment, setFilterSegment] = useState<string>('all');
  const [filterConfidence, setFilterConfidence] = useState<number>(0);
  const [optimizationDialog, setOptimizationDialog] = useState(false);
  const [analyticsDialog, setAnalyticsDialog] = useState(false);
  const [retrainDialog, setRetrainDialog] = useState(false);
  const [optimizationParams, setOptimizationParams] = useState<OptimizationParams>({
    min_discount: 5,
    max_discount: 50,
    target_revenue: 10000,
    risk_tolerance: 0.3,
    seasonal_weight: 0.4,
    segment_weight: 0.6
  });
  const [retraining, setRetraining] = useState(false);
  const [optimizing, setOptimizing] = useState(false);

  const fetchOptimizations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai/voucher/optimizations');
      if (!response.ok) throw new Error('Fehler beim Laden der Voucher-Optimierungen');
      const data = await response.json();
      setOptimizations(data.optimizations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/ai/voucher/stats');
      if (!response.ok) throw new Error('Fehler beim Laden der Statistiken');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Fehler beim Laden der Statistiken:', err);
    }
  };

  const handleOptimize = async () => {
    try {
      setOptimizing(true);
      const response = await fetch('/api/ai/voucher/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(optimizationParams)
      });
      if (!response.ok) throw new Error('Fehler bei der Optimierung');
      await fetchOptimizations();
      setOptimizationDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Optimierungsfehler');
    } finally {
      setOptimizing(false);
    }
  };

  const handleRetrain = async () => {
    try {
      setRetraining(true);
      const response = await fetch('/api/ai/voucher/retrain', {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Fehler beim Neulernen des Modells');
      await fetchOptimizations();
      await fetchStats();
      setRetrainDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Neulernen-Fehler');
    } finally {
      setRetraining(false);
    }
  };

  useEffect(() => {
    fetchOptimizations();
    fetchStats();
  }, []);

  const filteredOptimizations = optimizations.filter(optimization => {
    if (filterSegment !== 'all' && !optimization.customer_segments.includes(filterSegment)) return false;
    if (optimization.confidence_score < filterConfidence) return false;
    return true;
  });

  const getRiskColor = (risk: number) => {
    if (risk < 0.3) return 'success';
    if (risk < 0.6) return 'warning';
    return 'error';
  };

  const getRiskLabel = (risk: number) => {
    if (risk < 0.3) return 'Niedrig';
    if (risk < 0.6) return 'Mittel';
    return 'Hoch';
  };

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
            KI-Voucher-Optimierung
          </Typography>
          <Typography variant="body1" className="text-gray-600">
            Intelligente Voucher-Strategien basierend auf KI-Analyse
          </Typography>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outlined"
            startIcon={<AnalyticsIcon />}
            onClick={() => setAnalyticsDialog(true)}
          >
            Analytics
          </Button>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setOptimizationDialog(true)}
          >
            Optimieren
          </Button>
          <Button
            variant="outlined"
            startIcon={<PsychologyIcon />}
            onClick={() => setRetrainDialog(true)}
          >
            Modell neu lernen
          </Button>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchOptimizations}
          >
            Aktualisieren
          </Button>
        </div>
      </div>

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent>
                <Typography variant="h6" className="text-white">
                  Optimierungen
                </Typography>
                <Typography variant="h4" className="text-white font-bold">
                  {stats.total_optimizations}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent>
                <Typography variant="h6" className="text-white">
                  Durchschn. Umsatz
                </Typography>
                <Typography variant="h4" className="text-white font-bold">
                  €{stats.average_revenue_prediction.toFixed(0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent>
                <Typography variant="h6" className="text-white">
                  Durchschn. Risiko
                </Typography>
                <Typography variant="h4" className="text-white font-bold">
                  {(stats.average_risk_score * 100).toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent>
                <Typography variant="h6" className="text-white">
                  Top Segment
                </Typography>
                <Typography variant="h4" className="text-white font-bold">
                  {stats.top_segments[0]?.segment || 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-4">
            Filter
          </Typography>
          <div className="flex space-x-4">
            <FormControl className="min-w-200">
              <InputLabel>Kundensegment</InputLabel>
              <Select
                value={filterSegment}
                onChange={(e) => setFilterSegment(e.target.value)}
                label="Kundensegment"
              >
                <MenuItem value="all">Alle Segmente</MenuItem>
                <MenuItem value="premium">Premium</MenuItem>
                <MenuItem value="regular">Regulär</MenuItem>
                <MenuItem value="budget">Budget</MenuItem>
                <MenuItem value="new">Neue Kunden</MenuItem>
              </Select>
            </FormControl>
            <FormControl className="min-w-200">
              <InputLabel>Min. Konfidenz</InputLabel>
              <Select
                value={filterConfidence}
                onChange={(e) => setFilterConfidence(e.target.value as number)}
                label="Min. Konfidenz"
              >
                <MenuItem value={0}>Alle</MenuItem>
                <MenuItem value={0.5}>50%+</MenuItem>
                <MenuItem value={0.7}>70%+</MenuItem>
                <MenuItem value={0.8}>80%+</MenuItem>
                <MenuItem value={0.9}>90%+</MenuItem>
              </Select>
            </FormControl>
          </div>
        </CardContent>
      </Card>

      {/* Optimizations Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-4">
            Voucher-Optimierungen ({filteredOptimizations.length})
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Voucher-Typ</TableCell>
                  <TableCell align="center">Rabatt</TableCell>
                  <TableCell align="center">Zielsegment</TableCell>
                  <TableCell align="right">Umsatz-Prognose</TableCell>
                  <TableCell align="center">Risiko</TableCell>
                  <TableCell align="center">Konfidenz</TableCell>
                  <TableCell align="center">Saisonfaktor</TableCell>
                  <TableCell>Grund</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOptimizations.map((optimization) => (
                  <TableRow key={optimization.id} hover>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <VoucherIcon className="text-purple-500" />
                        <Typography variant="body2" className="font-medium">
                          {optimization.voucher_type}
                        </Typography>
                      </div>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${optimization.discount_percentage}%`}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={optimization.target_segment}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" className="font-semibold text-green-600">
                        €{optimization.predicted_revenue.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={getRiskLabel(optimization.risk_score)}
                        color={getRiskColor(optimization.risk_score) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" alignItems="center">
                        <Box width="100%" mr={1}>
                          <LinearProgress
                            variant="determinate"
                            value={optimization.confidence_score * 100}
                            className="h-2"
                          />
                        </Box>
                        <Typography variant="body2">
                          {(optimization.confidence_score * 100).toFixed(0)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {(optimization.seasonal_factor * 100).toFixed(0)}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" className="text-gray-600 max-w-xs truncate">
                        {optimization.optimization_reason}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Optimization Dialog */}
      <Dialog open={optimizationDialog} onClose={() => setOptimizationDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <div className="flex items-center space-x-2">
            <SettingsIcon />
            <Typography variant="h6">
              Voucher-Parameter optimieren
            </Typography>
          </div>
        </DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-4">
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Minimaler Rabatt (%)"
                  type="number"
                  value={optimizationParams.min_discount}
                  onChange={(e) => setOptimizationParams({
                    ...optimizationParams,
                    min_discount: parseFloat(e.target.value)
                  })}
                  inputProps={{ min: 0, max: 100 }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Maximaler Rabatt (%)"
                  type="number"
                  value={optimizationParams.max_discount}
                  onChange={(e) => setOptimizationParams({
                    ...optimizationParams,
                    max_discount: parseFloat(e.target.value)
                  })}
                  inputProps={{ min: 0, max: 100 }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Ziel-Umsatz (€)"
                  type="number"
                  value={optimizationParams.target_revenue}
                  onChange={(e) => setOptimizationParams({
                    ...optimizationParams,
                    target_revenue: parseFloat(e.target.value)
                  })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography gutterBottom>Risiko-Toleranz</Typography>
                <Slider
                  value={optimizationParams.risk_tolerance}
                  onChange={(_, value) => setOptimizationParams({
                    ...optimizationParams,
                    risk_tolerance: value as number
                  })}
                  min={0}
                  max={1}
                  step={0.1}
                  marks={[
                    { value: 0, label: 'Niedrig' },
                    { value: 0.5, label: 'Mittel' },
                    { value: 1, label: 'Hoch' }
                  ]}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography gutterBottom>Saisonale Gewichtung</Typography>
                <Slider
                  value={optimizationParams.seasonal_weight}
                  onChange={(_, value) => setOptimizationParams({
                    ...optimizationParams,
                    seasonal_weight: value as number
                  })}
                  min={0}
                  max={1}
                  step={0.1}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography gutterBottom>Segment-Gewichtung</Typography>
                <Slider
                  value={optimizationParams.segment_weight}
                  onChange={(_, value) => setOptimizationParams({
                    ...optimizationParams,
                    segment_weight: value as number
                  })}
                  min={0}
                  max={1}
                  step={0.1}
                />
              </Grid>
            </Grid>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOptimizationDialog(false)}>
            Abbrechen
          </Button>
          <Button
            onClick={handleOptimize}
            variant="contained"
            disabled={optimizing}
            startIcon={optimizing ? <CircularProgress size={20} /> : <TrendingUpIcon />}
          >
            {optimizing ? 'Optimiere...' : 'Optimieren'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog open={analyticsDialog} onClose={() => setAnalyticsDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <div className="flex items-center space-x-2">
            <AnalyticsIcon />
            <Typography variant="h6">
              Voucher-Analytics
            </Typography>
          </div>
        </DialogTitle>
        <DialogContent>
          {stats && (
            <div className="space-y-6 mt-4">
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" className="mb-4">
                    Umsatz-Trends
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.revenue_trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="actual" stroke="#8884d8" name="Tatsächlich" />
                      <Line type="monotone" dataKey="predicted" stroke="#82ca9d" name="Prognose" />
                    </LineChart>
                  </ResponsiveContainer>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" className="mb-4">
                    Segment-Verteilung
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.segment_distribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ segment, percentage }) => `${segment} ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="percentage"
                      >
                        {stats.segment_distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" className="mb-4">
                    Top Segmente nach Umsatz
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.top_segments}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="segment" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="avg_revenue" fill="#8884d8" name="Durchschn. Umsatz" />
                    </BarChart>
                  </ResponsiveContainer>
                </Grid>
              </Grid>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnalyticsDialog(false)}>
            Schließen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Retrain Dialog */}
      <Dialog open={retrainDialog} onClose={() => setRetrainDialog(false)}>
        <DialogTitle>
          <div className="flex items-center space-x-2">
            <PsychologyIcon />
            <Typography variant="h6">
              KI-Modell neu lernen
            </Typography>
          </div>
        </DialogTitle>
        <DialogContent>
          <Typography className="mt-4">
            Das KI-Modell wird mit den neuesten Daten neu trainiert. 
            Dieser Vorgang kann einige Minuten dauern.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRetrainDialog(false)}>
            Abbrechen
          </Button>
          <Button
            onClick={handleRetrain}
            variant="contained"
            disabled={retraining}
            startIcon={retraining ? <CircularProgress size={20} /> : <PsychologyIcon />}
          >
            {retraining ? 'Lerne neu...' : 'Neu lernen'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AIVoucherDashboard; 