import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  IconButton,
  Button,
  LinearProgress,
  Chip,
  Alert,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  Timeline as TimelineIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  OpenInNew as OpenInNewIcon,
  BugReport as BugReportIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { apiService } from '../../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`monitoring-tabpanel-${index}`}
      aria-labelledby={`monitoring-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const SystemMonitoring: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // System-Metriken abfragen
  const { data: systemMetrics, refetch: refetchSystem } = useQuery(
    'system-metrics',
    () => apiService.get('/monitoring/system'),
    {
      refetchInterval: autoRefresh ? 5000 : false,
    }
  );

  // Service-Status abfragen
  const { data: serviceStatus, refetch: refetchServices } = useQuery(
    'service-status',
    () => apiService.get('/monitoring/services'),
    {
      refetchInterval: autoRefresh ? 10000 : false,
    }
  );

  // Fehler-Logs abfragen
  const { data: errorLogs } = useQuery(
    'error-logs',
    () => apiService.get('/monitoring/logs/errors'),
    {
      refetchInterval: autoRefresh ? 30000 : false,
    }
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRefresh = () => {
    refetchSystem();
    refetchServices();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Systemüberwachung
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{ mr: 2 }}
          >
            Aktualisieren
          </Button>
          <Button
            variant={autoRefresh ? 'contained' : 'outlined'}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            Auto-Refresh: {autoRefresh ? 'AN' : 'AUS'}
          </Button>
        </Box>
      </Box>

      {/* System-Übersicht */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SpeedIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">CPU-Auslastung</Typography>
              </Box>
              <Typography variant="h3" sx={{ mb: 1 }}>
                {systemMetrics?.cpu_usage || 0}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={systemMetrics?.cpu_usage || 0} 
                color={systemMetrics?.cpu_usage > 80 ? 'error' : 'primary'}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MemoryIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Speicher</Typography>
              </Box>
              <Typography variant="h3" sx={{ mb: 1 }}>
                {systemMetrics?.memory_usage || 0}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={systemMetrics?.memory_usage || 0}
                color={systemMetrics?.memory_usage > 80 ? 'error' : 'primary'}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StorageIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Festplatte</Typography>
              </Box>
              <Typography variant="h3" sx={{ mb: 1 }}>
                {systemMetrics?.disk_usage || 0}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={systemMetrics?.disk_usage || 0}
                color={systemMetrics?.disk_usage > 80 ? 'error' : 'primary'}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TimelineIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Uptime</Typography>
              </Box>
              <Typography variant="h3">
                {systemMetrics?.uptime_days || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tage
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Services" />
          <Tab label="Datenbank" />
          <Tab label="Fehler-Logs" />
          <Tab label="Externe Tools" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {/* Service-Status */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Service</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Uptime</TableCell>
                  <TableCell>CPU</TableCell>
                  <TableCell>Memory</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {serviceStatus?.services?.map((service: any) => (
                  <TableRow key={service.name}>
                    <TableCell>
                      <Typography variant="subtitle2">{service.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {service.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={service.status}
                        color={getStatusColor(service.health)}
                        size="small"
                        icon={service.health === 'healthy' ? <CheckCircleIcon /> : <ErrorIcon />}
                      />
                    </TableCell>
                    <TableCell>{service.uptime}</TableCell>
                    <TableCell>{service.cpu_usage}%</TableCell>
                    <TableCell>{service.memory_usage}MB</TableCell>
                    <TableCell>
                      <Tooltip title="Service neustarten">
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
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Datenbank-Metriken */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Verbindungen
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Aktive Verbindungen: {systemMetrics?.db_connections_active || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Idle Verbindungen: {systemMetrics?.db_connections_idle || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Max. Verbindungen: {systemMetrics?.db_connections_max || 100}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(systemMetrics?.db_connections_active || 0) / (systemMetrics?.db_connections_max || 100) * 100}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Query-Performance
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Durchschn. Query-Zeit: {systemMetrics?.db_avg_query_time || 0}ms
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Langsame Queries: {systemMetrics?.db_slow_queries || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cache Hit Rate: {systemMetrics?.db_cache_hit_rate || 0}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* Fehler-Logs */}
          {errorLogs?.errors?.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Zeitstempel</TableCell>
                    <TableCell>Level</TableCell>
                    <TableCell>Komponente</TableCell>
                    <TableCell>Nachricht</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {errorLogs.errors.map((log: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(log.timestamp).toLocaleString('de-DE')}</TableCell>
                      <TableCell>
                        <Chip
                          label={log.level}
                          size="small"
                          color={log.level === 'ERROR' ? 'error' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>{log.component}</TableCell>
                      <TableCell>{log.message}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">Keine Fehler in den letzten 24 Stunden</Alert>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {/* Externe Monitoring-Tools */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AssessmentIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Grafana</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Visualisierung von Metriken und Dashboards
                  </Typography>
                  <Button
                    variant="contained"
                    endIcon={<OpenInNewIcon />}
                    onClick={() => window.open('http://localhost:3000', '_blank')}
                    fullWidth
                  >
                    Grafana öffnen
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TimelineIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Prometheus</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Metrics Collection und Querying
                  </Typography>
                  <Button
                    variant="contained"
                    endIcon={<OpenInNewIcon />}
                    onClick={() => window.open('http://localhost:9090', '_blank')}
                    fullWidth
                  >
                    Prometheus öffnen
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BugReportIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Jaeger</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Distributed Tracing für Request-Analyse
                  </Typography>
                  <Button
                    variant="contained"
                    endIcon={<OpenInNewIcon />}
                    onClick={() => window.open('http://localhost:16686', '_blank')}
                    fullWidth
                  >
                    Jaeger UI öffnen
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ErrorIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">AlertManager</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Alert-Verwaltung und Benachrichtigungen
                  </Typography>
                  <Button
                    variant="contained"
                    endIcon={<OpenInNewIcon />}
                    onClick={() => window.open('http://localhost:9093', '_blank')}
                    fullWidth
                  >
                    AlertManager öffnen
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};