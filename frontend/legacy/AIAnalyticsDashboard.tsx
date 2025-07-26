import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Psychology as PsychologyIcon,
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import TrustIndicator from '../components/TrustIndicator';

interface AIModelStatus {
  transaction_forecast: string;
  inventory_optimization: string;
  anomaly_detection: string;
  overall_status: string;
  last_update: string;
}

interface PredictionMetrics {
  transaction_accuracy: number;
  inventory_optimization_score: number;
  anomaly_detection_rate: number;
}

interface Insight {
  type: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
}

interface AIHealth {
  status: string;
  models_loaded: number;
  anomaly_detector_ready: boolean;
  last_update: string;
  version: string;
}

const AIAnalyticsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiHealth, setAiHealth] = useState<AIHealth | null>(null);
  const [modelStatus, setModelStatus] = useState<AIModelStatus | null>(null);
  const [predictions, setPredictions] = useState<PredictionMetrics | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [transactionForecast, setTransactionForecast] = useState<any[]>([]);

  useEffect(() => {
    loadAIDashboard();
  }, []);

  const loadAIDashboard = async () => {
    setLoading(true);
    try {
      // Mock-Daten für Demo
      const mockData = {
        ai_health: {
          status: 'healthy',
          models_loaded: 3,
          anomaly_detector_ready: true,
          last_update: new Date().toISOString(),
          version: '2.0.0'
        },
        recent_predictions: {
          transaction_accuracy: 0.87,
          inventory_optimization_score: 0.92,
          anomaly_detection_rate: 0.95
        },
        active_models: [
          'transaction_forecast',
          'inventory_optimization',
          'anomaly_detection'
        ],
        last_insights: [
          {
            type: 'performance',
            title: 'System-Optimierung',
            description: 'AI-Modelle zeigen gute Performance',
            severity: 'info' as const,
            timestamp: new Date().toISOString()
          },
          {
            type: 'inventory',
            title: 'Lagerbestand-Optimierung',
            description: '3 Artikel benötigen Nachbestellung',
            severity: 'warning' as const,
            timestamp: new Date().toISOString()
          }
        ]
      };

      setAiHealth(mockData.ai_health);
      setPredictions(mockData.recent_predictions);
      setInsights(mockData.last_insights);

      // Mock Transaktionsvorhersage
      const forecastData = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString(),
        predicted: Math.random() * 2000 + 500,
        actual: i < 7 ? Math.random() * 2000 + 500 : null
      }));
      setTransactionForecast(forecastData);

      setModelStatus({
        transaction_forecast: 'ready',
        inventory_optimization: 'ready',
        anomaly_detection: 'ready',
        overall_status: 'healthy',
        last_update: new Date().toISOString()
      });

    } catch (err) {
      setError('Fehler beim Laden der AI-Analytics');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'success': return <CheckCircleIcon color="success" />;
      case 'warning': return <WarningIcon color="warning" />;
      case 'error': return <ErrorIcon color="error" />;
      default: return <InfoIcon color="info" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  };

  const getModelStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'success';
      case 'initializing': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PsychologyIcon sx={{ color: 'primary.main' }} />
          AI Analytics Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadAIDashboard}
        >
          Aktualisieren
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* AI Health Status */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6} lg={3}>
          <TrustIndicator
            title="AI Service Status"
            description="Gesundheitsstatus des KI-Services"
            level={aiHealth?.status === 'healthy' ? 'high' : 'medium'}
            value={aiHealth?.models_loaded || 0}
            unit="Modelle geladen"
            lastUpdated={aiHealth?.last_update}
            details={[
              `Version: ${aiHealth?.version}`,
              `Anomaly Detector: ${aiHealth?.anomaly_detector_ready ? 'Bereit' : 'Nicht bereit'}`
            ]}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <TrustIndicator
            title="Transaktionsvorhersage"
            description="Genauigkeit der Transaktionsvorhersage"
            level={predictions?.transaction_accuracy && predictions.transaction_accuracy > 0.8 ? 'high' : 'medium'}
            value={predictions?.transaction_accuracy ? Math.round(predictions.transaction_accuracy * 100) : 0}
            unit="% Genauigkeit"
            trend="up"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <TrustIndicator
            title="Inventar-Optimierung"
            description="Score der Inventar-Optimierung"
            level={predictions?.inventory_optimization_score && predictions.inventory_optimization_score > 0.9 ? 'high' : 'medium'}
            value={predictions?.inventory_optimization_score ? Math.round(predictions.inventory_optimization_score * 100) : 0}
            unit="% Score"
            trend="stable"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <TrustIndicator
            title="Anomalie-Erkennung"
            description="Rate der Anomalie-Erkennung"
            level={predictions?.anomaly_detection_rate && predictions.anomaly_detection_rate > 0.9 ? 'high' : 'medium'}
            value={predictions?.anomaly_detection_rate ? Math.round(predictions.anomaly_detection_rate * 100) : 0}
            unit="% Rate"
            trend="up"
          />
        </Grid>
      </Grid>

      {/* Model Status */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          AI-Modell Status
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Modell</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Letzte Aktualisierung</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {modelStatus && Object.entries({
                'Transaktionsvorhersage': modelStatus.transaction_forecast,
                'Inventar-Optimierung': modelStatus.inventory_optimization,
                'Anomalie-Erkennung': modelStatus.anomaly_detection
              }).map(([model, status]) => (
                <TableRow key={model}>
                  <TableCell>{model}</TableCell>
                  <TableCell>
                    <Chip
                      label={status}
                      color={getModelStatusColor(status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(modelStatus.last_update).toLocaleString('de-DE')}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Modell neu trainieren">
                      <IconButton size="small">
                        <RefreshIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Transaktionsvorhersage Chart */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Transaktionsvorhersage (30 Tage)
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={transactionForecast}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <RechartsTooltip />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#8884d8"
              strokeWidth={2}
              name="Vorhersage"
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#82ca9d"
              strokeWidth={2}
              name="Tatsächlich"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* AI Insights */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          KI-Insights
        </Typography>
        <Grid container spacing={2}>
          {insights.map((insight, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {getSeverityIcon(insight.severity)}
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {insight.title}
                  </Typography>
                  <Chip
                    label={insight.severity}
                    color={getSeverityColor(insight.severity) as any}
                    size="small"
                    sx={{ ml: 'auto' }}
                  />
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  {insight.description}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  {new Date(insight.timestamp).toLocaleString('de-DE')}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Card>

      {/* Performance Metrics */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Modell-Performance
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Transaktionsvorhersage Genauigkeit
              </Typography>
              <LinearProgress
                variant="determinate"
                value={predictions?.transaction_accuracy ? predictions.transaction_accuracy * 100 : 0}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {predictions?.transaction_accuracy ? Math.round(predictions.transaction_accuracy * 100) : 0}%
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Inventar-Optimierung Score
              </Typography>
              <LinearProgress
                variant="determinate"
                value={predictions?.inventory_optimization_score ? predictions.inventory_optimization_score * 100 : 0}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {predictions?.inventory_optimization_score ? Math.round(predictions.inventory_optimization_score * 100) : 0}%
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" gutterBottom>
                Anomalie-Erkennung Rate
              </Typography>
              <LinearProgress
                variant="determinate"
                value={predictions?.anomaly_detection_rate ? predictions.anomaly_detection_rate * 100 : 0}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {predictions?.anomaly_detection_rate ? Math.round(predictions.anomaly_detection_rate * 100) : 0}%
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Aktive Modelle
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {['Transaktionsvorhersage', 'Inventar-Optimierung', 'Anomalie-Erkennung'].map((model) => (
                <Box key={model} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CheckCircleIcon color="success" />
                  <Typography variant="body2">{model}</Typography>
                  <Chip label="Aktiv" color="success" size="small" sx={{ ml: 'auto' }} />
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AIAnalyticsDashboard; 