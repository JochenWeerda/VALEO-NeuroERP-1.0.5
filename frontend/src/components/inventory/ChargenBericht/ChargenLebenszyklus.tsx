import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  styled,
  Chip,
  IconButton,
  Button,
  CircularProgress,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineContent,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector
} from '@mui/lab';
import {
  Inventory as InventoryIcon,
  LocalShipping as ShippingIcon,
  Assignment as AssignmentIcon,
  Science as ScienceIcon,
  Factory as FactoryIcon,
  ShoppingCart as ShoppingCartIcon,
  Event as EventIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Print as PrintIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';

// Typen für die Komponente
interface ChargenEvent {
  id: string;
  type: 'erstellung' | 'lieferung' | 'produktion' | 'qualitaet' | 'lagerung' | 'verwendung' | 'info' | 'warnung';
  date: string;
  title: string;
  description: string;
  user: string;
  meta?: Record<string, any>;
}

interface ChargenData {
  id: string;
  bezeichnung: string;
  artikelNr: string;
  artikelName: string;
  menge: number;
  einheit: string;
  erstellungsdatum: string;
  mindesthaltbarkeitsdatum?: string;
  status: 'aktiv' | 'inaktiv' | 'gesperrt' | 'aufgebraucht';
  lagerort: string;
  herkunft: 'eigen' | 'extern';
  lieferant?: string;
  events: ChargenEvent[];
}

// Beispiel-Daten für die Demonstration
const beispielCharge: ChargenData = {
  id: 'CH123456',
  bezeichnung: 'CH-2025-05-001',
  artikelNr: 'WZ-BIO-001',
  artikelName: 'Bio Weizen',
  menge: 5000,
  einheit: 'kg',
  erstellungsdatum: '2025-05-01T08:15:00',
  mindesthaltbarkeitsdatum: '2026-05-01',
  status: 'aktiv',
  lagerort: 'Silo 3',
  herkunft: 'extern',
  lieferant: 'Biolandhof Meyer',
  events: [
    {
      id: 'EV001',
      type: 'erstellung',
      date: '2025-05-01T08:15:00',
      title: 'Chargenanlage',
      description: 'Charge wurde im System angelegt',
      user: 'Maria Schmidt'
    },
    {
      id: 'EV002',
      type: 'lieferung',
      date: '2025-05-01T09:30:00',
      title: 'Wareneingang',
      description: 'Lieferung von Biolandhof Meyer eingetroffen und erfasst',
      user: 'Thomas Müller'
    },
    {
      id: 'EV003',
      type: 'qualitaet',
      date: '2025-05-01T11:45:00',
      title: 'Qualitätsprüfung',
      description: 'Qualitätsprüfung durchgeführt, alle Parameter im Normbereich',
      user: 'Julia Weber',
      meta: {
        feuchtigkeit: '12.5%',
        proteingehalt: '13.2%',
        fallzahl: '280s'
      }
    },
    {
      id: 'EV004',
      type: 'lagerung',
      date: '2025-05-01T14:00:00',
      title: 'Einlagerung',
      description: 'Ware wurde in Silo 3 eingelagert',
      user: 'Klaus Fischer'
    },
    {
      id: 'EV005',
      type: 'verwendung',
      date: '2025-05-15T10:30:00',
      title: 'Teilentnahme',
      description: 'Entnahme von 1200 kg für Produktionsauftrag P-2025-0125',
      user: 'Klaus Fischer'
    },
    {
      id: 'EV006',
      type: 'qualitaet',
      date: '2025-05-20T09:15:00',
      title: 'Nachkontrolle',
      description: 'Regelmäßige Nachkontrolle der Lagerqualität',
      user: 'Julia Weber',
      meta: {
        feuchtigkeit: '12.7%',
        temperatur: '15.3°C'
      }
    },
    {
      id: 'EV007',
      type: 'warnung',
      date: '2025-05-25T16:45:00',
      title: 'Temperaturanstieg',
      description: 'Leichter Temperaturanstieg im Silo festgestellt. Überwachung intensiviert.',
      user: 'System'
    }
  ]
};

// Styled-Komponenten für den Stepper
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.success.main})`,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.success.main})`,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    borderRadius: 1,
  },
}));

interface ColorlibStepIconProps {
  active?: boolean;
  completed?: boolean;
  icon: React.ReactNode;
}

const ColorlibStepIcon = styled('div')<ColorlibStepIconProps>(({ theme, active, completed }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
  zIndex: 1,
  color: '#fff',
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  ...(active && {
    backgroundImage: `linear-gradient(136deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
  }),
  ...(completed && {
    backgroundImage: `linear-gradient(136deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
  }),
}));

// Funktion zum Formatieren von Datumsangaben
const formatDateTime = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('de-DE', options);
};

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric'
  };
  return new Date(dateString).toLocaleDateString('de-DE', options);
};

// Hauptkomponente
const ChargenLebenszyklus: React.FC<{ chargenId?: string }> = ({ chargenId = 'CH123456' }) => {
  const theme = useTheme();
  const [charge, setCharge] = useState<ChargenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In einer realen Anwendung würde hier ein API-Aufruf erfolgen
    // Hier wird eine Verzögerung simuliert, um die Lade-Erfahrung zu zeigen
    const fetchChargenData = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCharge(beispielCharge);
        setError(null);
      } catch (err) {
        console.error('Fehler beim Laden der Chargendaten:', err);
        setError('Die Chargendaten konnten nicht geladen werden.');
      } finally {
        setLoading(false);
      }
    };

    fetchChargenData();
  }, [chargenId]);

  // Ermittelt das Icon für einen Event-Typ
  const getEventIcon = (type: ChargenEvent['type']) => {
    switch (type) {
      case 'erstellung':
        return <AssignmentIcon />;
      case 'lieferung':
        return <ShippingIcon />;
      case 'produktion':
        return <FactoryIcon />;
      case 'qualitaet':
        return <ScienceIcon />;
      case 'lagerung':
        return <InventoryIcon />;
      case 'verwendung':
        return <ShoppingCartIcon />;
      case 'info':
        return <InfoIcon />;
      case 'warnung':
        return <WarningIcon />;
      default:
        return <EventIcon />;
    }
  };

  // Ermittelt die Farbe für einen Event-Typ
  const getEventColor = (type: ChargenEvent['type']) => {
    switch (type) {
      case 'erstellung':
        return theme.palette.primary.main;
      case 'lieferung':
        return theme.palette.info.main;
      case 'produktion':
        return theme.palette.secondary.main;
      case 'qualitaet':
        return theme.palette.success.main;
      case 'lagerung':
        return theme.palette.primary.light;
      case 'verwendung':
        return theme.palette.secondary.light;
      case 'info':
        return theme.palette.info.light;
      case 'warnung':
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Berechnet den aktuellen Status der Charge für die Stepper-Anzeige
  const chargenLebenszyklus = useMemo(() => {
    if (!charge) return { activeStep: 0, steps: [] };
    
    const steps = [
      { label: 'Anlage', icon: <AssignmentIcon /> },
      { label: 'Einlagerung', icon: <InventoryIcon /> },
      { label: 'Qualitätsprüfung', icon: <ScienceIcon /> },
      { label: 'Aktiv', icon: <EventIcon /> }
    ];
    
    let activeStep = 0;
    
    if (charge.events.some(e => e.type === 'erstellung')) {
      activeStep = 1;
    }
    
    if (charge.events.some(e => e.type === 'lagerung')) {
      activeStep = 2;
    }
    
    if (charge.events.some(e => e.type === 'qualitaet')) {
      activeStep = 3;
    }
    
    if (charge.status === 'aktiv' && activeStep >= 3) {
      activeStep = 4;
    }
    
    return { activeStep, steps };
  }, [charge, theme]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
        <Button 
          variant="outlined" 
          sx={{ mt: 2 }}
          onClick={() => window.location.reload()}
        >
          Erneut versuchen
        </Button>
      </Box>
    );
  }

  if (!charge) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">
          Keine Daten für diese Charge verfügbar.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Basis-Informationen zur Charge */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5">
                Chargen-Lebenszyklus: {charge.bezeichnung}
              </Typography>
              <Box>
                <Tooltip title="Bericht drucken">
                  <IconButton sx={{ mr: 1 }}>
                    <PrintIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Bericht herunterladen">
                  <IconButton>
                    <FileDownloadIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            <Divider sx={{ mb: 3 }} />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Stammdaten
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Chargen-ID:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {charge.id}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Artikel:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {charge.artikelName} ({charge.artikelNr})
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Menge:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {charge.menge.toLocaleString('de-DE')} {charge.einheit}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Status:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Chip 
                      label={charge.status.charAt(0).toUpperCase() + charge.status.slice(1)} 
                      size="small"
                      color={
                        charge.status === 'aktiv' ? 'success' :
                        charge.status === 'gesperrt' ? 'error' :
                        charge.status === 'aufgebraucht' ? 'warning' : 'default'
                      }
                    />
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Lagerort:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {charge.lagerort}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Zeitdaten
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Erstellungsdatum:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      {formatDateTime(charge.erstellungsdatum)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      MHD:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      {charge.mindesthaltbarkeitsdatum ? formatDate(charge.mindesthaltbarkeitsdatum) : '-'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Herkunft:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      {charge.herkunft === 'eigen' ? 'Eigenproduktion' : 'Extern'}
                    </Typography>
                  </Grid>
                  
                  {charge.herkunft === 'extern' && charge.lieferant && (
                    <>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Lieferant:
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          {charge.lieferant}
                        </Typography>
                      </Grid>
                    </>
                  )}
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Letzte Änderung:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      {charge.events.length > 0 
                        ? formatDateTime(charge.events[charge.events.length - 1].date)
                        : '-'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Lebenszyklusübersicht mit Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Lebenszyklusstatus
        </Typography>
        <Box sx={{ my: 3 }}>
          <Stepper 
            alternativeLabel 
            activeStep={chargenLebenszyklus.activeStep} 
            connector={<ColorlibConnector />}
          >
            {chargenLebenszyklus.steps.map((step, index) => (
              <Step key={index}>
                <StepLabel StepIconComponent={(props) => (
                  <ColorlibStepIcon
                    {...props}
                    icon={step.icon}
                  />
                )}>
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      </Paper>
      
      {/* Chronologische Ereignisse zur Charge */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Chronologischer Verlauf
        </Typography>
        
        <Timeline position="alternate" sx={{ mt: 3 }}>
          {charge.events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((event) => (
            <TimelineItem key={event.id}>
              <TimelineSeparator>
                <TimelineDot sx={{ bgcolor: getEventColor(event.type) }}>
                  {getEventIcon(event.type)}
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    mb: 2,
                    borderLeft: `4px solid ${getEventColor(event.type)}`,
                    '&:hover': {
                      boxShadow: theme.shadows[3]
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {event.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDateTime(event.date)}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" paragraph>
                      {event.description}
                    </Typography>
                    
                    {event.meta && Object.keys(event.meta).length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          Details:
                        </Typography>
                        <Grid container spacing={1} sx={{ mt: 0.5 }}>
                          {Object.entries(event.meta).map(([key, value]) => (
                            <Grid item xs={6} key={key}>
                              <Typography variant="body2" color="text.secondary" component="span">
                                {key}:
                              </Typography>{' '}
                              <Typography variant="body2" component="span">
                                {value}
                              </Typography>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Benutzer: {event.user}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Paper>
    </Box>
  );
};

export default ChargenLebenszyklus; 