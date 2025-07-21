import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  Alert, 
  Chip,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { 
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';

interface BiMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
  category: string;
}

interface BiReport {
  id: string;
  name: string;
  type: 'sales' | 'inventory' | 'financial' | 'operational';
  lastUpdated: Date;
  status: 'ready' | 'processing' | 'error';
  description: string;
}

const BiDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<BiMetric[]>([]);
  const [reports, setReports] = useState<BiReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBiData();
  }, []);

  const loadBiData = async () => {
    setLoading(true);
    try {
      // Simuliere API-Aufruf für BI-Daten
      const mockMetrics: BiMetric[] = [
        {
          id: '1',
          name: 'Umsatz (Monat)',
          value: 125000,
          change: 8.5,
          trend: 'up',
          unit: 'EUR',
          category: 'sales'
        },
        {
          id: '2',
          name: 'Bestandswert',
          value: 450000,
          change: -2.1,
          trend: 'down',
          unit: 'EUR',
          category: 'inventory'
        },
        {
          id: '3',
          name: 'Gewinnmarge',
          value: 23.5,
          change: 1.2,
          trend: 'up',
          unit: '%',
          category: 'financial'
        },
        {
          id: '4',
          name: 'Kundenzufriedenheit',
          value: 4.2,
          change: 0.3,
          trend: 'up',
          unit: '/5',
          category: 'operational'
        }
      ];

      const mockReports: BiReport[] = [
        {
          id: '1',
          name: 'Umsatzanalyse Q4',
          type: 'sales',
          lastUpdated: new Date(),
          status: 'ready',
          description: 'Detaillierte Umsatzanalyse für Q4 2024'
        },
        {
          id: '2',
          name: 'Bestandsoptimierung',
          type: 'inventory',
          lastUpdated: new Date(Date.now() - 86400000),
          status: 'ready',
          description: 'Bestandsanalyse und Optimierungsvorschläge'
        },
        {
          id: '3',
          name: 'Finanzbericht',
          type: 'financial',
          lastUpdated: new Date(),
          status: 'processing',
          description: 'Monatlicher Finanzbericht'
        }
      ];

      setMetrics(mockMetrics);
      setReports(mockReports);
    } catch (err) {
      setError('Fehler beim Laden der BI-Daten');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUpIcon className="text-green-600" />;
      case 'down': return <TrendingUpIcon className="text-red-600 transform rotate-180" />;
      default: return <TimelineIcon className="text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'success';
      case 'down': return 'error';
      default: return 'default';
    }
  };

  const getReportStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'success';
      case 'processing': return 'warning';
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
      <Typography variant="h4" gutterBottom className="flex items-center gap-2">
        <AnalyticsIcon className="text-blue-600" />
        Business Intelligence Dashboard
      </Typography>
      <Typography variant="subtitle1" gutterBottom className="text-gray-600">
        Intelligente Analysen und Berichte für datengetriebene Entscheidungen
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Key Metrics */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom className="flex items-center gap-2">
          <AssessmentIcon className="text-green-600" />
          Key Performance Indicators
        </Typography>
        <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <Card key={metric.id} variant="outlined" sx={{ p: 2 }}>
              <Box className="flex items-center justify-between mb-2">
                <Typography variant="subtitle2" className="text-gray-600">
                  {metric.name}
                </Typography>
                {getTrendIcon(metric.trend)}
              </Box>
              <Typography variant="h4" className="font-bold">
                {metric.value.toLocaleString('de-DE')} {metric.unit}
              </Typography>
              <Box className="flex items-center gap-1 mt-1">
                <Chip
                  label={`${metric.change > 0 ? '+' : ''}${metric.change}%`}
                  size="small"
                  color={getTrendColor(metric.trend) as any}
                />
                <Typography variant="caption" className="text-gray-500">
                  vs. Vormonat
                </Typography>
              </Box>
            </Card>
          ))}
        </Box>
      </Card>

      {/* Reports Section */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom className="flex items-center gap-2">
          <BarChartIcon className="text-purple-600" />
          Verfügbare Berichte
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow className="bg-gray-50">
                <TableCell className="font-semibold">Bericht</TableCell>
                <TableCell className="font-semibold">Typ</TableCell>
                <TableCell className="font-semibold">Status</TableCell>
                <TableCell className="font-semibold">Letzte Aktualisierung</TableCell>
                <TableCell className="font-semibold">Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <Typography variant="body1" className="font-medium">
                        {report.name}
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                        {report.description}
                      </Typography>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={report.type}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={report.status}
                      size="small"
                      color={getReportStatusColor(report.status) as any}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {report.lastUpdated.toLocaleString('de-DE')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box className="flex gap-1">
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={report.status !== 'ready'}
                      >
                        Anzeigen
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                      >
                        Exportieren
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Chart Placeholders */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom className="flex items-center gap-2">
          <PieChartIcon className="text-orange-600" />
          Visualisierungen
        </Typography>
        <Box className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Box className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <Typography variant="body1" className="text-gray-500">
              Umsatz-Trend Chart
            </Typography>
          </Box>
          <Box className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <Typography variant="body1" className="text-gray-500">
              Bestands-Verteilung
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          onClick={loadBiData}
          disabled={loading}
        >
          Daten aktualisieren
        </Button>
        <Button variant="outlined">
          Neuen Bericht erstellen
        </Button>
        <Button variant="outlined">
          Alle Berichte exportieren
        </Button>
      </Box>
    </Box>
  );
};

export default BiDashboard; 