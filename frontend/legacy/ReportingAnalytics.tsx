import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Tooltip,
  Fab
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  Description as DescriptionIcon,
  GetApp as ExportIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Remove as NeutralIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  Visibility as ViewIcon,
  Settings as SettingsIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TableChart as TableChartIcon,
  Timeline as TimelineIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';

// TabPanel-Komponente
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
      id={`reporting-tabpanel-${index}`}
      aria-labelledby={`reporting-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Mock-Daten für das Reporting & Analytics Modul
const mockKpiData = [
  {
    id: '1',
    name: 'Umsatz (Monat)',
    value: 125750.50,
    unit: 'EUR',
    target: 100000,
    warningLow: 80000,
    warningHigh: 120000,
    trend: 'AUFWAERTS',
    category: 'Finanzen',
    lastUpdate: '2024-12-15T10:30:00Z',
    change: 12.5
  },
  {
    id: '2',
    name: 'Produktionsaufträge (Offen)',
    value: 23,
    unit: 'Stück',
    target: 50,
    warningLow: 10,
    warningHigh: 60,
    trend: 'ABWAERTS',
    category: 'Produktion',
    lastUpdate: '2024-12-15T10:30:00Z',
    change: -8.2
  },
  {
    id: '3',
    name: 'Lagerbestand (Wert)',
    value: 485000.00,
    unit: 'EUR',
    target: 500000,
    warningLow: 400000,
    warningHigh: 600000,
    trend: 'NEUTRAL',
    category: 'Lager',
    lastUpdate: '2024-12-15T10:30:00Z',
    change: 2.1
  },
  {
    id: '4',
    name: 'Kunden (Aktiv)',
    value: 187,
    unit: 'Kunden',
    target: 200,
    warningLow: 150,
    warningHigh: 250,
    trend: 'AUFWAERTS',
    category: 'Verkauf',
    lastUpdate: '2024-12-15T10:30:00Z',
    change: 5.8
  }
];

const mockReportCategories = [
  { id: '1', name: 'Finanzen', icon: 'account_balance', color: '#1976d2', count: 15 },
  { id: '2', name: 'Produktion', icon: 'factory', color: '#388e3c', count: 12 },
  { id: '3', name: 'Verkauf', icon: 'trending_up', color: '#f57c00', count: 18 },
  { id: '4', name: 'Lager', icon: 'inventory', color: '#7b1fa2', count: 10 },
  { id: '5', name: 'Personal', icon: 'people', color: '#d32f2f', count: 8 },
  { id: '6', name: 'Qualität', icon: 'verified', color: '#388e3c', count: 6 },
  { id: '7', name: 'Projekte', icon: 'assignment', color: '#1976d2', count: 9 },
  { id: '8', name: 'Dokumente', icon: 'description', color: '#616161', count: 7 }
];

const mockReports = [
  {
    id: '1',
    name: 'Umsatzbericht (Monatlich)',
    category: 'Finanzen',
    type: 'TABELLE',
    lastRun: '2024-12-15T09:00:00Z',
    status: 'ABGESCHLOSSEN',
    duration: 45,
    recordCount: 1250,
    exportFormats: ['PDF', 'EXCEL']
  },
  {
    id: '2',
    name: 'Produktionsaufträge (Status)',
    category: 'Produktion',
    type: 'TABELLE',
    lastRun: '2024-12-15T08:30:00Z',
    status: 'ABGESCHLOSSEN',
    duration: 23,
    recordCount: 89,
    exportFormats: ['PDF', 'EXCEL', 'CSV']
  },
  {
    id: '3',
    name: 'Lagerbestand (Detailliert)',
    category: 'Lager',
    type: 'TABELLE',
    lastRun: '2024-12-15T08:00:00Z',
    status: 'ABGESCHLOSSEN',
    duration: 67,
    recordCount: 456,
    exportFormats: ['PDF', 'EXCEL']
  },
  {
    id: '4',
    name: 'Kundenanalyse (Quartal)',
    category: 'Verkauf',
    type: 'DIAGRAMM',
    lastRun: '2024-12-14T16:00:00Z',
    status: 'ABGESCHLOSSEN',
    duration: 34,
    recordCount: 187,
    exportFormats: ['PDF', 'EXCEL', 'JSON']
  }
];

const mockExportJobs = [
  {
    id: '1',
    name: 'Umsatzbericht Export',
    reportName: 'Umsatzbericht (Monatlich)',
    format: 'PDF',
    status: 'COMPLETED',
    startTime: '2024-12-15T09:00:00Z',
    endTime: '2024-12-15T09:01:00Z',
    duration: 60,
    fileSize: 2048576,
    fileName: 'umsatzbericht_2024_12.pdf'
  },
  {
    id: '2',
    name: 'Produktionsaufträge Export',
    reportName: 'Produktionsaufträge (Status)',
    format: 'EXCEL',
    status: 'RUNNING',
    startTime: '2024-12-15T10:15:00Z',
    endTime: null,
    duration: 45,
    fileSize: null,
    fileName: null
  },
  {
    id: '3',
    name: 'Lagerbestand Export',
    reportName: 'Lagerbestand (Detailliert)',
    format: 'CSV',
    status: 'FAILED',
    startTime: '2024-12-15T08:30:00Z',
    endTime: '2024-12-15T08:31:00Z',
    duration: 65,
    fileSize: null,
    fileName: null,
    error: 'Speicherplatz nicht ausreichend'
  }
];

const mockScheduledReports = [
  {
    id: '1',
    name: 'Täglicher Umsatzbericht',
    reportName: 'Umsatzbericht (Täglich)',
    schedule: 'TAEGLICH',
    nextRun: '2024-12-16T06:00:00Z',
    lastRun: '2024-12-15T06:00:00Z',
    recipients: 5,
    format: 'PDF',
    active: true
  },
  {
    id: '2',
    name: 'Wöchentliche Produktionsübersicht',
    reportName: 'Produktionsübersicht (Wöchentlich)',
    schedule: 'WOECHENTLICH',
    nextRun: '2024-12-20T08:00:00Z',
    lastRun: '2024-12-13T08:00:00Z',
    recipients: 3,
    format: 'EXCEL',
    active: true
  },
  {
    id: '3',
    name: 'Monatlicher Finanzbericht',
    reportName: 'Finanzbericht (Monatlich)',
    schedule: 'MONATLICH',
    nextRun: '2025-01-01T09:00:00Z',
    lastRun: '2024-12-01T09:00:00Z',
    recipients: 8,
    format: 'PDF',
    active: false
  }
];

const mockPerformanceData = [
  {
    metric: 'Durchschnittliche Ausführungszeit',
    value: 45.2,
    unit: 'Sekunden',
    trend: 'AUFWAERTS',
    change: 8.5
  },
  {
    metric: 'Cache-Hit-Rate',
    value: 78.3,
    unit: '%',
    trend: 'AUFWAERTS',
    change: 12.1
  },
  {
    metric: 'Aktive Berichtsausführungen',
    value: 3,
    unit: '',
    trend: 'NEUTRAL',
    change: 0
  },
  {
    metric: 'Export-Jobs (Heute)',
    value: 15,
    unit: '',
    trend: 'ABWAERTS',
    change: -5.2
  }
];

// Hilfsfunktionen
const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'AUFWAERTS':
      return <TrendingUpIcon color="success" />;
    case 'ABWAERTS':
      return <TrendingDownIcon color="error" />;
    default:
      return <NeutralIcon color="action" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ABGESCHLOSSEN':
    case 'COMPLETED':
      return 'success';
    case 'LAEUFT':
    case 'RUNNING':
      return 'warning';
    case 'FEHLER':
    case 'FAILED':
      return 'error';
    default:
      return 'default';
  }
};

const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ReportingAnalytics: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'report' | 'export' | 'schedule' | 'kpi'>('report');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (type: 'report' | 'export' | 'schedule' | 'kpi') => {
    setDialogType(type);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <Box className="p-6">
      {/* Header */}
      <Box className="flex justify-between items-center mb-6">
        <div>
          <Typography variant="h4" className="text-gray-800 font-bold mb-2">
            Reporting & Analytics
          </Typography>
          <Typography variant="body1" className="text-gray-600">
            Zentrale Berichterstattung und Analytics für alle Module
          </Typography>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
          >
            Alle KPIs aktualisieren
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('report')}
          >
            Neuer Bericht
          </Button>
        </div>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="Reporting Tabs">
          <Tab label="Dashboard" icon={<DashboardIcon />} iconPosition="start" />
          <Tab label="KPIs" icon={<AssessmentIcon />} iconPosition="start" />
          <Tab label="Berichte" icon={<DescriptionIcon />} iconPosition="start" />
          <Tab label="Export" icon={<ExportIcon />} iconPosition="start" />
          <Tab label="Zeitplan" icon={<ScheduleIcon />} iconPosition="start" />
          <Tab label="Performance" icon={<SpeedIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Dashboard Tab */}
      <TabPanel value={tabValue} index={0}>
        {/* KPI-Übersicht */}
        <Grid container spacing={3} className="mb-6">
          {mockKpiData.map((kpi) => (
            <Grid item xs={12} sm={6} md={3} key={kpi.id}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <Typography variant="h6" className="text-gray-800 font-semibold">
                        {kpi.name}
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                        {kpi.category}
                      </Typography>
                    </div>
                    {getTrendIcon(kpi.trend)}
                  </div>
                  
                  <Typography variant="h4" className="text-gray-900 font-bold mb-2">
                    {kpi.value.toLocaleString('de-DE')} {kpi.unit}
                  </Typography>
                  
                  <div className="flex items-center justify-between">
                    <Typography 
                      variant="body2" 
                      className={`font-medium ${
                        kpi.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {kpi.change >= 0 ? '+' : ''}{kpi.change}%
                    </Typography>
                    <Typography variant="caption" className="text-gray-500">
                      Ziel: {kpi.target.toLocaleString('de-DE')}
                    </Typography>
                  </div>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={(kpi.value / kpi.target) * 100}
                    className="mt-3"
                    color={kpi.value >= kpi.target ? 'success' : 'primary'}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Berichtskategorien */}
        <Grid container spacing={3} className="mb-6">
          <Grid item xs={12}>
            <Typography variant="h6" className="mb-4">Berichtskategorien</Typography>
          </Grid>
          {mockReportCategories.map((category) => (
            <Grid item xs={12} sm={6} md={3} key={category.id}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="text-center">
                  <div 
                    className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                    style={{ backgroundColor: category.color + '20' }}
                  >
                    <Typography 
                      variant="h6" 
                      style={{ color: category.color }}
                    >
                      {category.icon === 'account_balance' && '€'}
                      {category.icon === 'factory' && '🏭'}
                      {category.icon === 'trending_up' && '📈'}
                      {category.icon === 'inventory' && '📦'}
                      {category.icon === 'people' && '👥'}
                      {category.icon === 'verified' && '✓'}
                      {category.icon === 'assignment' && '📋'}
                      {category.icon === 'description' && '📄'}
                    </Typography>
                  </div>
                  <Typography variant="h6" className="font-semibold mb-1">
                    {category.name}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    {category.count} Berichte
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Aktuelle Berichtsausführungen */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" className="mb-4">Aktuelle Berichtsausführungen</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Bericht</TableCell>
                        <TableCell>Kategorie</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Dauer</TableCell>
                        <TableCell>Datensätze</TableCell>
                        <TableCell>Aktionen</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mockReports.slice(0, 3).map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>
                            <Typography variant="body2" className="font-medium">
                              {report.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={report.category} size="small" />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={report.status} 
                              color={getStatusColor(report.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{formatDuration(report.duration)}</TableCell>
                          <TableCell>{report.recordCount.toLocaleString('de-DE')}</TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <IconButton size="small" color="primary">
                                <ViewIcon />
                              </IconButton>
                              <IconButton size="small" color="primary">
                                <DownloadIcon />
                              </IconButton>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* KPIs Tab */}
      <TabPanel value={tabValue} index={1}>
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6">Key Performance Indicators</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('kpi')}
          >
            Neuer KPI
          </Button>
        </div>

        <Grid container spacing={3}>
          {mockKpiData.map((kpi) => (
            <Grid item xs={12} md={6} key={kpi.id}>
              <Card>
                <CardContent>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Typography variant="h6" className="font-semibold">
                        {kpi.name}
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                        {kpi.category}
                      </Typography>
                    </div>
                    <div className="flex space-x-1">
                      <IconButton size="small" color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="primary">
                        <RefreshIcon />
                      </IconButton>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Typography variant="body2" className="text-gray-600">
                        Aktueller Wert
                      </Typography>
                      <Typography variant="h5" className="font-bold">
                        {kpi.value.toLocaleString('de-DE')} {kpi.unit}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="body2" className="text-gray-600">
                        Zielwert
                      </Typography>
                      <Typography variant="h5" className="font-bold">
                        {kpi.target.toLocaleString('de-DE')} {kpi.unit}
                      </Typography>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(kpi.trend)}
                      <Typography 
                        variant="body2" 
                        className={`font-medium ${
                          kpi.change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {kpi.change >= 0 ? '+' : ''}{kpi.change}% vs. Vormonat
                      </Typography>
                    </div>
                    <Typography variant="caption" className="text-gray-500">
                      Letzte Aktualisierung: {new Date(kpi.lastUpdate).toLocaleString('de-DE')}
                    </Typography>
                  </div>

                  <LinearProgress 
                    variant="determinate" 
                    value={(kpi.value / kpi.target) * 100}
                    className="h-2"
                    color={kpi.value >= kpi.target ? 'success' : 'primary'}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Berichte Tab */}
      <TabPanel value={tabValue} index={2}>
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6">Berichtsvorlagen</Typography>
          <div className="flex space-x-2">
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
            >
              Filter
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('report')}
            >
              Neuer Bericht
            </Button>
          </div>
        </div>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Bericht</TableCell>
                <TableCell>Kategorie</TableCell>
                <TableCell>Typ</TableCell>
                <TableCell>Letzte Ausführung</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Dauer</TableCell>
                <TableCell>Datensätze</TableCell>
                <TableCell>Export</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <Typography variant="body2" className="font-medium">
                      {report.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={report.category} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={report.type} 
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(report.lastRun).toLocaleString('de-DE')}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={report.status} 
                      color={getStatusColor(report.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDuration(report.duration)}</TableCell>
                  <TableCell>{report.recordCount.toLocaleString('de-DE')}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      {report.exportFormats.map((format) => (
                        <Chip key={format} label={format} size="small" variant="outlined" />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <IconButton size="small" color="primary">
                        <ViewIcon />
                      </IconButton>
                      <IconButton size="small" color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="primary">
                        <DownloadIcon />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Export Tab */}
      <TabPanel value={tabValue} index={3}>
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6">Export-Jobs</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('export')}
          >
            Neuer Export
          </Button>
        </div>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Job-Name</TableCell>
                <TableCell>Bericht</TableCell>
                <TableCell>Format</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Startzeit</TableCell>
                <TableCell>Dauer</TableCell>
                <TableCell>Dateigröße</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockExportJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <Typography variant="body2" className="font-medium">
                      {job.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{job.reportName}</TableCell>
                  <TableCell>
                    <Chip label={job.format} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={job.status} 
                      color={getStatusColor(job.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(job.startTime).toLocaleString('de-DE')}
                  </TableCell>
                  <TableCell>{formatDuration(job.duration)}</TableCell>
                  <TableCell>
                    {job.fileSize ? formatFileSize(job.fileSize) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      {job.status === 'COMPLETED' && (
                        <IconButton size="small" color="primary">
                          <DownloadIcon />
                        </IconButton>
                      )}
                      <IconButton size="small" color="primary">
                        <ViewIcon />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Zeitplan Tab */}
      <TabPanel value={tabValue} index={4}>
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6">Automatische Berichtsversendung</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('schedule')}
          >
            Neue Zeitplanung
          </Button>
        </div>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Bericht</TableCell>
                <TableCell>Zeitplan</TableCell>
                <TableCell>Nächste Ausführung</TableCell>
                <TableCell>Letzte Ausführung</TableCell>
                <TableCell>Empfänger</TableCell>
                <TableCell>Format</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockScheduledReports.map((scheduled) => (
                <TableRow key={scheduled.id}>
                  <TableCell>
                    <Typography variant="body2" className="font-medium">
                      {scheduled.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{scheduled.reportName}</TableCell>
                  <TableCell>
                    <Chip label={scheduled.schedule} size="small" />
                  </TableCell>
                  <TableCell>
                    {new Date(scheduled.nextRun).toLocaleString('de-DE')}
                  </TableCell>
                  <TableCell>
                    {scheduled.lastRun ? new Date(scheduled.lastRun).toLocaleString('de-DE') : '-'}
                  </TableCell>
                  <TableCell>{scheduled.recipients}</TableCell>
                  <TableCell>
                    <Chip label={scheduled.format} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={scheduled.active ? 'Aktiv' : 'Inaktiv'} 
                      color={scheduled.active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <IconButton size="small" color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="primary">
                        <EmailIcon />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Performance Tab */}
      <TabPanel value={tabValue} index={5}>
        <Typography variant="h6" className="mb-4">Performance-Metriken</Typography>

        <Grid container spacing={3} className="mb-6">
          {mockPerformanceData.map((metric, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="body2" className="text-gray-600 mb-2">
                    {metric.metric}
                  </Typography>
                  <Typography variant="h4" className="font-bold mb-2">
                    {metric.value}{metric.unit}
                  </Typography>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(metric.trend)}
                    <Typography 
                      variant="body2" 
                      className={`font-medium ${
                        metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {metric.change >= 0 ? '+' : ''}{metric.change}%
                    </Typography>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" className="mb-4">Cache-Performance</Typography>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Cache-Hit-Rate:</span>
                    <Chip label="78.3%" color="success" size="small" />
                  </div>
                  <div className="flex justify-between">
                    <span>Cache-Miss-Rate:</span>
                    <Chip label="21.7%" color="warning" size="small" />
                  </div>
                  <div className="flex justify-between">
                    <span>Cache-Größe:</span>
                    <Chip label="2.4 GB" color="info" size="small" />
                  </div>
                  <div className="flex justify-between">
                    <span>Cache-Effizienz:</span>
                    <Chip label="Hoch" color="success" size="small" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" className="mb-4">System-Performance</Typography>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Durchschnittliche Antwortzeit:</span>
                    <Chip label="1.2s" color="success" size="small" />
                  </div>
                  <div className="flex justify-between">
                    <span>Maximale Antwortzeit:</span>
                    <Chip label="8.5s" color="warning" size="small" />
                  </div>
                  <div className="flex justify-between">
                    <span>Aktive Verbindungen:</span>
                    <Chip label="24" color="info" size="small" />
                  </div>
                  <div className="flex justify-between">
                    <span>System-Last:</span>
                    <Chip label="45%" color="success" size="small" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Dialog für neue Berichte/Exporte/etc. */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'report' && 'Neuer Bericht'}
          {dialogType === 'export' && 'Neuer Export'}
          {dialogType === 'schedule' && 'Neue Zeitplanung'}
          {dialogType === 'kpi' && 'Neuer KPI'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" className="text-gray-600 mb-4">
            {dialogType === 'report' && 'Erstellen Sie eine neue Berichtsvorlage mit SQL-Query und Parametern.'}
            {dialogType === 'export' && 'Konfigurieren Sie einen neuen Export-Job für Berichte.'}
            {dialogType === 'schedule' && 'Planen Sie die automatische Versendung von Berichten.'}
            {dialogType === 'kpi' && 'Definieren Sie einen neuen Key Performance Indicator.'}
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Beschreibung"
                variant="outlined"
                size="small"
                multiline
                rows={3}
              />
            </Grid>
            {dialogType === 'report' && (
              <>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Kategorie</InputLabel>
                    <Select label="Kategorie">
                      {mockReportCategories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Berichtstyp</InputLabel>
                    <Select label="Berichtstyp">
                      <MenuItem value="TABELLE">Tabelle</MenuItem>
                      <MenuItem value="DIAGRAMM">Diagramm</MenuItem>
                      <MenuItem value="DASHBOARD">Dashboard</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="SQL-Query"
                    variant="outlined"
                    size="small"
                    multiline
                    rows={4}
                    placeholder="SELECT * FROM table WHERE condition = $1"
                  />
                </Grid>
              </>
            )}
            {dialogType === 'export' && (
              <>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Bericht</InputLabel>
                    <Select label="Bericht">
                      {mockReports.map((report) => (
                        <MenuItem key={report.id} value={report.id}>
                          {report.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Export-Format</InputLabel>
                    <Select label="Export-Format">
                      <MenuItem value="PDF">PDF</MenuItem>
                      <MenuItem value="EXCEL">Excel</MenuItem>
                      <MenuItem value="CSV">CSV</MenuItem>
                      <MenuItem value="JSON">JSON</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
            {dialogType === 'schedule' && (
              <>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Bericht</InputLabel>
                    <Select label="Bericht">
                      {mockReports.map((report) => (
                        <MenuItem key={report.id} value={report.id}>
                          {report.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Zeitplan</InputLabel>
                    <Select label="Zeitplan">
                      <MenuItem value="TAEGLICH">Täglich</MenuItem>
                      <MenuItem value="WOECHENTLICH">Wöchentlich</MenuItem>
                      <MenuItem value="MONATLICH">Monatlich</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Empfänger (E-Mail-Adressen, kommagetrennt)"
                    variant="outlined"
                    size="small"
                    placeholder="max@example.com, anna@example.com"
                  />
                </Grid>
              </>
            )}
            {dialogType === 'kpi' && (
              <>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Kategorie</InputLabel>
                    <Select label="Kategorie">
                      <MenuItem value="FINANZEN">Finanzen</MenuItem>
                      <MenuItem value="PRODUKTION">Produktion</MenuItem>
                      <MenuItem value="VERKAUF">Verkauf</MenuItem>
                      <MenuItem value="LAGER">Lager</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Einheit"
                    variant="outlined"
                    size="small"
                    placeholder="EUR, Stück, %"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Berechnungsformel (SQL)"
                    variant="outlined"
                    size="small"
                    multiline
                    rows={3}
                    placeholder="SELECT COUNT(*) FROM table WHERE condition"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Zielwert"
                    variant="outlined"
                    size="small"
                    type="number"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Trend-Richtung</InputLabel>
                    <Select label="Trend-Richtung">
                      <MenuItem value="AUFWAERTS">Aufwärts</MenuItem>
                      <MenuItem value="ABWAERTS">Abwärts</MenuItem>
                      <MenuItem value="NEUTRAL">Neutral</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            Erstellen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button für schnelle Aktionen */}
      <Fab
        color="primary"
        aria-label="Schnelle Aktionen"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default ReportingAnalytics; 