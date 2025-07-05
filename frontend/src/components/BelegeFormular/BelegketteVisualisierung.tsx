import React, { useState, useMemo, useCallback, memo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  styled,
  Tooltip,
  Chip,
  IconButton,
  useTheme,
  Skeleton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse
} from '@mui/material';
import {
  FeaturedPlayList as AngebotIcon,
  Assignment as AuftragIcon,
  LocalShipping as LieferscheinIcon,
  Receipt as RechnungIcon,
  ShoppingBasket as BestellungIcon,
  Sync as EingangslieferscheinIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as PendingIcon,
  Warning as WarningIcon,
  Visibility as VisibilityIcon,
  Timeline as TimelineIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { FixedSizeList as VirtualList } from 'react-window';

type BelegStatus = 'offen' | 'inBearbeitung' | 'abgeschlossen' | 'storniert' | 'keiner';

interface BelegReferenz {
  id: string;
  nummer: string;
  typ: 'angebot' | 'auftrag' | 'lieferschein' | 'rechnung' | 'bestellung' | 'eingangslieferschein';
  status: BelegStatus;
  datum?: string;
  bemerkung?: string;
}

interface BelegketteVisualisierungProps {
  belegId: string;
  belegTyp: 'angebot' | 'auftrag' | 'lieferschein' | 'rechnung' | 'bestellung' | 'eingangslieferschein';
  mode?: 'verkauf' | 'einkauf';
  kompakt?: boolean;
}

// Styled Connector für den Stepper
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage:
        `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.success.main})`,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage:
        `linear-gradient(to right, ${theme.palette.success.main}, ${theme.palette.success.main})`,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    borderRadius: 1,
  },
}));

// Styled StepIconRoot für die Icons im Stepper
const StepIconRoot = styled('div')<{
  ownerState: { completed?: boolean; active?: boolean; status: BelegStatus };
}>(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
  zIndex: 1,
  color: '#fff',
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  ...(ownerState.active && {
    backgroundImage:
      `linear-gradient(136deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
  }),
  ...(ownerState.completed && {
    backgroundImage:
      `linear-gradient(136deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`,
  }),
  ...(ownerState.status === 'storniert' && {
    backgroundImage:
      `linear-gradient(136deg, ${theme.palette.error.light} 0%, ${theme.palette.error.main} 100%)`,
  }),
}));

// Gibt das entsprechende Icon für den Belegtyp zurück
const getIconForBelegTyp = (typ: string) => {
  switch (typ) {
    case 'angebot':
      return <AngebotIcon />;
    case 'auftrag':
      return <AuftragIcon />;
    case 'lieferschein':
      return <LieferscheinIcon />;
    case 'rechnung':
      return <RechnungIcon />;
    case 'bestellung':
      return <BestellungIcon />;
    case 'eingangslieferschein':
      return <EingangslieferscheinIcon />;
    default:
      return <WarningIcon />;
  }
};

// Gibt die Farbe für einen Status zurück
const getColorForStatus = (status: BelegStatus) => {
  switch (status) {
    case 'offen':
      return 'warning';
    case 'inBearbeitung':
      return 'info';
    case 'abgeschlossen':
      return 'success';
    case 'storniert':
      return 'error';
    default:
      return 'default';
  }
};

// Gibt den deutschen Text für einen Status zurück
const getTextForStatus = (status: BelegStatus) => {
  switch (status) {
    case 'offen':
      return 'Offen';
    case 'inBearbeitung':
      return 'In Bearbeitung';
    case 'abgeschlossen':
      return 'Abgeschlossen';
    case 'storniert':
      return 'Storniert';
    default:
      return 'Nicht vorhanden';
  }
};

// StepIcon-Komponente für den Stepper
const StepIcon = memo(({ 
  icon, 
  active, 
  completed, 
  status 
}: { 
  icon: React.ReactNode; 
  active: boolean; 
  completed: boolean; 
  status: BelegStatus; 
}) => {
  return (
    <StepIconRoot ownerState={{ completed, active, status }}>
      {icon}
    </StepIconRoot>
  );
});

// Memoized Beleg-Historieneintrag für die virtualisierte Liste
const BelegHistorienEintrag = memo(({ 
  beleg, 
  onBelegClick 
}: { 
  beleg: BelegReferenz; 
  onBelegClick: (beleg: BelegReferenz) => void; 
}) => {
  const isActive = beleg.status !== 'keiner';
  const statusColor = getColorForStatus(beleg.status);
  
  return (
    <ListItem 
      button={isActive} 
      onClick={() => isActive && onBelegClick(beleg)}
      disabled={!isActive}
      sx={{
        opacity: isActive ? 1 : 0.6,
        borderLeft: isActive ? `4px solid ${statusColor === 'default' ? '#ccc' : `var(--mui-palette-${statusColor}-main)`}` : 'none',
        pl: isActive ? 2 : 3
      }}
    >
      <ListItemIcon>
        {getIconForBelegTyp(beleg.typ)}
      </ListItemIcon>
      <ListItemText 
        primary={beleg.nummer || `Kein ${beleg.typ.charAt(0).toUpperCase() + beleg.typ.slice(1)}`}
        secondary={beleg.datum ? new Date(beleg.datum).toLocaleDateString('de-DE') : ''}
      />
      {isActive && (
        <Chip 
          label={getTextForStatus(beleg.status)} 
          color={statusColor as any}
          size="small"
          sx={{ ml: 1 }}
        />
      )}
    </ListItem>
  );
});

// Virtualisierte Liste für große Datenmengen
const VirtualizedBelegListe = memo(({ 
  belege, 
  onBelegClick 
}: { 
  belege: BelegReferenz[]; 
  onBelegClick: (beleg: BelegReferenz) => void; 
}) => {
  // Nur rendern, wenn mehr als 10 Belege vorhanden sind
  if (belege.length <= 10) {
    return (
      <List>
        {belege.map((beleg, index) => (
          <BelegHistorienEintrag 
            key={index} 
            beleg={beleg} 
            onBelegClick={onBelegClick} 
          />
        ))}
      </List>
    );
  }
  
  // Virtualisierte Liste für große Datenmengen
  return (
    <VirtualList
      height={400}
      width="100%"
      itemCount={belege.length}
      itemSize={72} // Höhe eines ListItems
    >
      {({ index, style }) => (
        <div style={style}>
          <BelegHistorienEintrag 
            key={index} 
            beleg={belege[index]} 
            onBelegClick={onBelegClick} 
          />
        </div>
      )}
    </VirtualList>
  );
});

const BelegketteVisualisierung: React.FC<BelegketteVisualisierungProps> = ({ 
  belegId, 
  belegTyp,
  mode = 'verkauf',
  kompakt = false
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [erweitert, setErweitert] = useState(false);
  
  // Simuliert eine API-Abfrage für die Belegkette - in einer realen Anwendung würde 
  // dies in einem useEffect mit API-Aufruf umgesetzt werden
  const belegkette = useMemo(() => {
    // In einem realen Szenario würde hier eine API-Abfrage erfolgen
    if (mode === 'verkauf') {
      // Verkaufsprozess: Angebot -> Auftrag -> Lieferschein -> Rechnung
      switch (belegTyp) {
        case 'angebot':
          return [
            { id: 'A123', nummer: 'ANG-2023-0001', typ: 'angebot', status: 'abgeschlossen', datum: '2023-05-15' },
            { id: '', nummer: '', typ: 'auftrag', status: 'keiner' },
            { id: '', nummer: '', typ: 'lieferschein', status: 'keiner' },
            { id: '', nummer: '', typ: 'rechnung', status: 'keiner' }
          ];
        case 'auftrag':
          return [
            { id: 'A123', nummer: 'ANG-2023-0001', typ: 'angebot', status: 'abgeschlossen', datum: '2023-05-15' },
            { id: 'B456', nummer: 'AUF-2023-0001', typ: 'auftrag', status: 'inBearbeitung', datum: '2023-05-20' },
            { id: '', nummer: '', typ: 'lieferschein', status: 'keiner' },
            { id: '', nummer: '', typ: 'rechnung', status: 'keiner' }
          ];
        case 'lieferschein':
          return [
            { id: 'A123', nummer: 'ANG-2023-0001', typ: 'angebot', status: 'abgeschlossen', datum: '2023-05-15' },
            { id: 'B456', nummer: 'AUF-2023-0001', typ: 'auftrag', status: 'abgeschlossen', datum: '2023-05-20' },
            { id: 'C789', nummer: 'LIS-2023-0001', typ: 'lieferschein', status: 'offen', datum: '2023-05-25' },
            { id: '', nummer: '', typ: 'rechnung', status: 'keiner' }
          ];
        case 'rechnung':
          return [
            { id: 'A123', nummer: 'ANG-2023-0001', typ: 'angebot', status: 'abgeschlossen', datum: '2023-05-15' },
            { id: 'B456', nummer: 'AUF-2023-0001', typ: 'auftrag', status: 'abgeschlossen', datum: '2023-05-20' },
            { id: 'C789', nummer: 'LIS-2023-0001', typ: 'lieferschein', status: 'abgeschlossen', datum: '2023-05-25' },
            { id: 'D012', nummer: 'REC-2023-0001', typ: 'rechnung', status: 'offen', datum: '2023-05-30' }
          ];
        default:
          return [];
      }
    } else {
      // Einkaufsprozess: Bestellung -> Eingangslieferschein
      switch (belegTyp) {
        case 'bestellung':
          return [
            { id: 'E123', nummer: 'BES-2023-0001', typ: 'bestellung', status: 'inBearbeitung', datum: '2023-06-05' },
            { id: '', nummer: '', typ: 'eingangslieferschein', status: 'keiner' }
          ];
        case 'eingangslieferschein':
          return [
            { id: 'E123', nummer: 'BES-2023-0001', typ: 'bestellung', status: 'abgeschlossen', datum: '2023-06-05' },
            { id: 'F456', nummer: 'ELS-2023-0001', typ: 'eingangslieferschein', status: 'offen', datum: '2023-06-10' }
          ];
        default:
          return [];
      }
    }
  }, [belegTyp, mode]);

  // Für Demo-Zwecke: Erstellt eine größere Liste für die virtualisierte Ansicht
  const erweiterteBelegHistorie = useMemo(() => {
    // Simuliert eine große Menge von Belegen für die Demonstration der virtualisierten Liste
    const historischeBesuche = Array.from({ length: 50 }, (_, i) => ({
      id: `HIST-${i}`,
      nummer: `Historischer Beleg ${i + 1}`,
      typ: ['angebot', 'auftrag', 'lieferschein', 'rechnung', 'bestellung', 'eingangslieferschein'][i % 6] as any,
      status: ['offen', 'inBearbeitung', 'abgeschlossen', 'storniert'][i % 4] as BelegStatus,
      datum: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(), // Ältere Daten
      bemerkung: `Dies ist ein historischer Beleg zur Demonstration der virtualisierten Liste.`
    }));
    
    return [...belegkette, ...historischeBesuche];
  }, [belegkette]);

  const handleBelegClick = useCallback((beleg: BelegReferenz) => {
    if (beleg.id && beleg.status !== 'keiner') {
      navigate(`/belegfolge/${beleg.typ}e/${beleg.id}`);
    }
  }, [navigate]);

  const isActiveBeleg = useCallback((beleg: BelegReferenz): boolean => {
    return beleg.id === belegId && beleg.typ === belegTyp;
  }, [belegId, belegTyp]);

  const getActiveStep = useCallback((): number => {
    if (mode === 'verkauf') {
      // Verkaufsprozess: Angebot -> Auftrag -> Lieferschein -> Rechnung
      switch (belegTyp) {
        case 'angebot': return 0;
        case 'auftrag': return 1;
        case 'lieferschein': return 2;
        case 'rechnung': return 3;
        default: return -1;
      }
    } else {
      // Einkaufsprozess: Bestellung -> Eingangslieferschein
      switch (belegTyp) {
        case 'bestellung': return 0;
        case 'eingangslieferschein': return 1;
        default: return -1;
      }
    }
  }, [belegTyp, mode]);

  const isStepCompleted = useCallback((index: number): boolean => {
    if (index < getActiveStep()) {
      return true;
    }
    
    if (index === getActiveStep() && belegkette[index]?.status === 'abgeschlossen') {
      return true;
    }
    
    return false;
  }, [belegkette, getActiveStep]);

  const toggleErweitert = useCallback(() => {
    setErweitert(prev => !prev);
  }, []);

  // Memoized Stepper-Schritte
  const stepperSteps = useMemo(() => {
    const schritte = mode === 'verkauf' 
      ? ['Angebot', 'Auftrag', 'Lieferschein', 'Rechnung']
      : ['Bestellung', 'Eingangslieferschein'];
      
    return (
      <Stepper 
        activeStep={getActiveStep()} 
        alternativeLabel 
        connector={<ColorlibConnector />}
        sx={{ mb: 3 }}
      >
        {schritte.map((label, index) => {
          const beleg = belegkette[index];
          const active = index === getActiveStep();
          const completed = isStepCompleted(index);
          
          return (
            <Step key={label} completed={completed}>
              <StepLabel
                StepIconComponent={(props) => (
                  <StepIcon
                    {...props}
                    active={active}
                    completed={completed}
                    status={beleg?.status || 'keiner'}
                    icon={getIconForBelegTyp(beleg?.typ || '')}
                  />
                )}
              >
                <Typography variant="body2">{label}</Typography>
                {beleg?.nummer && (
                  <Tooltip title="Beleg anzeigen">
                    <IconButton 
                      size="small" 
                      onClick={() => handleBelegClick(beleg)}
                      sx={{ ml: 1 }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    );
  }, [belegkette, getActiveStep, handleBelegClick, isStepCompleted, mode]);

  // Render
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h3">
          Belegkette
        </Typography>
        <Box>
          <Tooltip title={erweitert ? "Weniger anzeigen" : "Mehr anzeigen"}>
            <IconButton onClick={toggleErweitert}>
              {erweitert ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Prozessablauf anzeigen">
            <IconButton>
              <TimelineIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {!kompakt && stepperSteps}
      
      <Collapse in={erweitert} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Erweiterte Beleghistorie
          </Typography>
          <VirtualizedBelegListe 
            belege={erweiterteBelegHistorie} 
            onBelegClick={handleBelegClick} 
          />
        </Box>
      </Collapse>
    </Paper>
  );
};

export default memo(BelegketteVisualisierung); 