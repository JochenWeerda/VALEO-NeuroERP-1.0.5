import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  CircularProgress, 
  Alert, 
  Card, 
  CardContent, 
  Button,
  Divider,
  Chip,
  LinearProgress
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

// Dummy-Daten für das Dashboard
const dummyChargenData = {
  chargenStatus: {
    freigegeben: 125,
    gesperrt: 8,
    quarantaene: 15,
    ausstehend: 22
  },
  ablaufende: [
    { name: '< 7 Tage', value: 5, color: '#FF4842' },
    { name: '< 30 Tage', value: 18, color: '#FFC107' },
    { name: '< 90 Tage', value: 42, color: '#4CAF50' }
  ],
  qualitaetsmetriken: {
    chargenMitProblemen: 12,
    durchschnittlicheFreigabezeit: 1.8, // in Tagen
    rueckrufrisiko: 'niedrig',
    qualitaetsindex: 97.5 // Prozent
  },
  bestandsmetriken: {
    gesamtChargen: 170,
    durchschnittlichesAlter: 45, // in Tagen
    chargenverfolgbarkeit: 99.8, // Prozent
    umsatz: 2500000 // Euro
  },
  letzteBewegungen: [
    { typ: 'Wareneingang', artikel: 'Weizenschrot Premium', menge: 2500, datum: '2025-06-15' },
    { typ: 'Warenausgang', artikel: 'Maismehl', menge: 1500, datum: '2025-06-14' },
    { typ: 'Umlagerung', artikel: 'Mineralfutter Rind', menge: 800, datum: '2025-06-14' },
    { typ: 'Inventur', artikel: 'Schweinefutter Premium', menge: 3200, datum: '2025-06-13' }
  ],
  kritischeWarnungen: [
    { id: 1, titel: 'MHD-Überschreitung', charge: 'MM-2025-002', prioritaet: 'hoch' },
    { id: 2, titel: 'Qualitätsprobleme', charge: 'MR-2025-001', prioritaet: 'mittel' },
    { id: 3, titel: 'Lagertemperatur außerhalb Toleranz', charge: 'SF-2025-001', prioritaet: 'niedrig' }
  ]
};

// Farben für die Charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF4842'];

// Widget-Typen
export type WidgetType = 'kpi' | 'chart' | 'warnung' | 'liste';

export interface DashboardWidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  props?: any;
}

const DEFAULT_WIDGETS: DashboardWidgetConfig[] = [
  { id: 'gesamtChargen', type: 'kpi', title: 'Gesamt-Chargen', props: { value: dummyChargenData.bestandsmetriken.gesamtChargen } },
  { id: 'qualitaetsindex', type: 'kpi', title: 'Qualitätsindex', props: { value: dummyChargenData.qualitaetsmetriken.qualitaetsindex, unit: '%' } },
  { id: 'statusChart', type: 'chart', title: 'Chargenstatus', props: { data: Object.entries(dummyChargenData.chargenStatus).map(([name, value]) => ({ name, value })) } },
  { id: 'warnungen', type: 'warnung', title: 'Kritische Warnungen', props: { items: dummyChargenData.kritischeWarnungen } },
];

function loadWidgetConfig(): DashboardWidgetConfig[] {
  const raw = localStorage.getItem('dashboardWidgets');
  if (!raw) return DEFAULT_WIDGETS;
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_WIDGETS;
  }
}

function saveWidgetConfig(widgets: DashboardWidgetConfig[]) {
  localStorage.setItem('dashboardWidgets', JSON.stringify(widgets));
}

const ChargenDashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<string>('30tage');
  const [widgetConfig, setWidgetConfig] = useState<DashboardWidgetConfig[]>(loadWidgetConfig());

  useEffect(() => {
    // Hier würde normalerweise ein API-Aufruf stattfinden
    // Simuliere einen API-Aufruf mit einem Timeout
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simuliere Netzwerklatenz
        await new Promise(resolve => setTimeout(resolve, 1000));
        setData(dummyChargenData);
        setError(null);
      } catch (err) {
        setError('Fehler beim Laden der Dashboard-Daten. Bitte versuchen Sie es später erneut.');
        console.error('Dashboard Ladefehler:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  // Daten für das Statusdiagramm
  const statusData = Object.entries(data.chargenStatus).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: value
  }));

  // Widget-Operationen
  const handleRemoveWidget = (id: string) => {
    const updated = widgetConfig.filter(w => w.id !== id);
    setWidgetConfig(updated);
    saveWidgetConfig(updated);
  };
  const handleAddWidget = (widget: DashboardWidgetConfig) => {
    const updated = [...widgetConfig, widget];
    setWidgetConfig(updated);
    saveWidgetConfig(updated);
  };
  const handleMoveWidget = (from: number, to: number) => {
    if (from === to) return;
    const updated = [...widgetConfig];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setWidgetConfig(updated);
    saveWidgetConfig(updated);
  };

  // Widget-Renderer
  const renderWidget = (widget: DashboardWidgetConfig, idx: number) => {
    switch (widget.type) {
      case 'kpi':
        return (
          <Card key={widget.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>{widget.title}</Typography>
              <Typography variant="h4">{widget.props.value}{widget.props.unit || ''}</Typography>
              <Button size="small" onClick={() => handleRemoveWidget(widget.id)}>Entfernen</Button>
            </CardContent>
          </Card>
        );
      case 'chart':
        return (
          <Card key={widget.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>{widget.title}</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={widget.props.data}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
              <Button size="small" onClick={() => handleRemoveWidget(widget.id)}>Entfernen</Button>
            </CardContent>
          </Card>
        );
      case 'warnung':
        return (
          <Card key={widget.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>{widget.title}</Typography>
              {widget.props.items.map((warn: any) => (
                <Alert key={warn.id} severity={warn.prioritaet === 'hoch' ? 'error' : warn.prioritaet === 'mittel' ? 'warning' : 'info'} sx={{ mb: 1 }}>{warn.titel} (Charge: {warn.charge})</Alert>
              ))}
              <Button size="small" onClick={() => handleRemoveWidget(widget.id)}>Entfernen</Button>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Chargenverwaltung - KPI Dashboard
        </Typography>
        <Button size="small" variant="outlined" onClick={() => handleAddWidget({ id: `kpi${Date.now()}`, type: 'kpi', title: 'Neue KPI', props: { value: 0 } })}>
          Widget hinzufügen
        </Button>
      </Box>
      <Grid container spacing={3} mb={3}>
        {widgetConfig.map((widget, idx) => (
          <Grid item xs={12} sm={6} md={3} key={widget.id}>
            {renderWidget(widget, idx)}
            <Box display="flex" justifyContent="space-between">
              <Button size="small" disabled={idx === 0} onClick={() => handleMoveWidget(idx, idx - 1)}>↑</Button>
              <Button size="small" disabled={idx === widgetConfig.length - 1} onClick={() => handleMoveWidget(idx, idx + 1)}>↓</Button>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* KPI-Karten */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Gesamt-Chargen
              </Typography>
              <Typography variant="h4" component="div">
                {data.bestandsmetriken.gesamtChargen}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <Box component="span" sx={{ 
                  color: 'success.main',
                  display: 'flex',
                  alignItems: 'center',
                  mt: 1
                }}>
                  <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                  +5% zum Vormonat
                </Box>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Qualitätsindex
              </Typography>
              <Typography variant="h4" component="div">
                {data.qualitaetsmetriken.qualitaetsindex}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <Box component="span" sx={{ 
                  color: 'success.main',
                  display: 'flex',
                  alignItems: 'center',
                  mt: 1
                }}>
                  <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                  +1.2% zum Vormonat
                </Box>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Chargen mit Problemen
              </Typography>
              <Typography variant="h4" component="div">
                {data.qualitaetsmetriken.chargenMitProblemen}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <Box component="span" sx={{ 
                  color: 'error.main',
                  display: 'flex',
                  alignItems: 'center',
                  mt: 1
                }}>
                  <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                  +2 zum Vormonat
                </Box>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Chargenverfolgbarkeit
              </Typography>
              <Typography variant="h4" component="div">
                {data.bestandsmetriken.chargenverfolgbarkeit}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <Box component="span" sx={{ 
                  color: 'success.main',
                  display: 'flex',
                  alignItems: 'center',
                  mt: 1
                }}>
                  <CheckCircleIcon fontSize="small" sx={{ mr: 0.5 }} />
                  Vollständig auditierbar
                </Box>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Diagramme und detaillierte Karten */}
      <Grid container spacing={3}>
        {/* Chargenstatus-Diagramm */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Chargenstatus
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* MHD-Ablauf-Diagramm */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Ablaufende Chargen (MHD)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.ablaufende}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {data.ablaufende.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Kritische Warnungen */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" gutterBottom>
                Kritische Warnungen
              </Typography>
              <NotificationsActiveIcon color="warning" />
            </Box>
            <Divider sx={{ mb: 2 }} />
            {data.kritischeWarnungen.map((warnung: any) => (
              <Box key={warnung.id} mb={2} p={1.5} borderRadius={1} sx={{ 
                bgcolor: 'background.default',
                borderLeft: 4,
                borderColor: warnung.prioritaet === 'hoch' ? 'error.main' : 
                             warnung.prioritaet === 'mittel' ? 'warning.main' : 'info.main'
              }}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="subtitle1">
                    {warnung.titel}
                  </Typography>
                  <Chip 
                    label={warnung.prioritaet} 
                    size="small"
                    color={warnung.prioritaet === 'hoch' ? 'error' : 
                          warnung.prioritaet === 'mittel' ? 'warning' : 'info'}
                  />
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Charge: {warnung.charge}
                </Typography>
              </Box>
            ))}
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button variant="outlined" size="small">
                Alle Warnungen anzeigen
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Letzte Bewegungen */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Letzte Chargenbewegungen
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {data.letzteBewegungen.map((bewegung: any, index: number) => (
              <Box key={index} mb={2} display="flex" alignItems="center">
                <Box mr={2}>
                  {bewegung.typ === 'Wareneingang' ? (
                    <LocalShippingIcon color="primary" />
                  ) : bewegung.typ === 'Warenausgang' ? (
                    <LocalShippingIcon color="error" />
                  ) : (
                    <InventoryIcon color="info" />
                  )}
                </Box>
                <Box flexGrow={1}>
                  <Typography variant="subtitle2">
                    {bewegung.typ}: {bewegung.artikel}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {bewegung.menge} Einheiten • {bewegung.datum}
                  </Typography>
                </Box>
              </Box>
            ))}
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button variant="outlined" size="small">
                Alle Bewegungen anzeigen
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChargenDashboard; 