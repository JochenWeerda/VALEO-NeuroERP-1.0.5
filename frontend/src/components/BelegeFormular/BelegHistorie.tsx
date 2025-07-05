import React from 'react';
import { 
  Timeline, 
  TimelineItem, 
  TimelineSeparator, 
  TimelineConnector, 
  TimelineContent, 
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';
import { 
  Typography, 
  Paper, 
  Box, 
  Divider, 
  Card, 
  CardHeader, 
  CardContent, 
  Collapse,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  CheckCircleOutline as CheckIcon,
  InfoOutlined as InfoIcon,
  WarningAmber as WarningIcon,
  ErrorOutline as ErrorIcon,
  Edit as EditIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Assignment as AssignmentIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

export interface HistorienEintrag {
  id: string;
  datum: string;
  benutzer: string;
  aktion: string;
  status?: string;
  details?: string;
  typ: 'info' | 'success' | 'warning' | 'error';
  metadaten?: Record<string, any>;
}

interface BelegHistorieProps {
  eintraege: HistorienEintrag[];
  maxItems?: number;
  showAll?: boolean;
  title?: string;
  elevation?: number;
}

const ExpandIconWrapper = styled('div')(({ theme }) => ({
  transform: 'rotate(0deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
  '&.expanded': {
    transform: 'rotate(180deg)',
  },
}));

const getIconForType = (typ: string) => {
  switch (typ) {
    case 'success':
      return <CheckIcon color="success" />;
    case 'warning':
      return <WarningIcon color="warning" />;
    case 'error':
      return <ErrorIcon color="error" />;
    case 'info':
    default:
      return <InfoIcon color="info" />;
  }
};

const getIconForAktion = (aktion: string) => {
  if (aktion.includes('erstellt') || aktion.includes('geändert')) {
    return <EditIcon />;
  } else if (aktion.includes('gedruckt')) {
    return <PrintIcon />;
  } else if (aktion.includes('E-Mail') || aktion.includes('gesendet')) {
    return <EmailIcon />;
  } else if (aktion.includes('versendet') || aktion.includes('Versand') || aktion.includes('geliefert')) {
    return <ShippingIcon />;
  } else if (aktion.includes('bezahlt') || aktion.includes('Zahlung')) {
    return <PaymentIcon />;
  } else {
    return <AssignmentIcon />;
  }
};

const BelegHistorie: React.FC<BelegHistorieProps> = ({
  eintraege,
  maxItems = 5,
  showAll = false,
  title = 'Beleghistorie',
  elevation = 1
}) => {
  const [expanded, setExpanded] = React.useState(showAll);
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  
  // Sortiere Einträge nach Datum (neueste zuerst)
  const sortierteEintraege = [...eintraege].sort((a, b) => 
    new Date(b.datum).getTime() - new Date(a.datum).getTime()
  );
  
  const anzuzeigende = expanded ? sortierteEintraege : sortierteEintraege.slice(0, maxItems);

  // Formatiert ein Datum lesbar
  const formatDatum = (datum: string) => {
    return new Date(datum).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card elevation={elevation}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center">
            <Typography variant="h6">{title}</Typography>
            {sortierteEintraege.length > maxItems && (
              <IconButton
                onClick={handleExpandClick}
                aria-expanded={expanded}
                aria-label="Mehr anzeigen"
                sx={{ ml: 1 }}
              >
                <ExpandIconWrapper className={expanded ? 'expanded' : ''}>
                  <ExpandMoreIcon />
                </ExpandIconWrapper>
              </IconButton>
            )}
          </Box>
        }
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ pt: 1 }}>
        <Timeline position="right" sx={{ p: 0, m: 0 }}>
          {anzuzeigende.map((eintrag, index) => (
            <TimelineItem key={eintrag.id} 
              onMouseEnter={() => setHoveredItem(eintrag.id)}
              onMouseLeave={() => setHoveredItem(null)}
              sx={{ minHeight: hoveredItem === eintrag.id ? 'auto' : '70px' }}
            >
              <TimelineOppositeContent sx={{ flex: 0.2, pr: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                  {formatDatum(eintrag.datum)}
                </Typography>
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot color={eintrag.typ}>
                  {getIconForAktion(eintrag.aktion)}
                </TimelineDot>
                {index < anzuzeigende.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent sx={{ py: '12px', px: 2 }}>
                <Paper elevation={hoveredItem === eintrag.id ? 3 : 0} sx={{ p: 1.5, transition: 'all 0.3s' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2">{eintrag.aktion}</Typography>
                    {eintrag.status && (
                      <Typography variant="body2" color="text.secondary">
                        Status: <strong>{eintrag.status}</strong>
                      </Typography>
                    )}
                  </Box>
                  {eintrag.details && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {eintrag.details}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    Benutzer: {eintrag.benutzer}
                  </Typography>
                </Paper>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
        
        {!expanded && sortierteEintraege.length > maxItems && (
          <Box textAlign="center" mt={1}>
            <Typography 
              variant="body2" 
              color="primary" 
              sx={{ cursor: 'pointer' }}
              onClick={handleExpandClick}
            >
              {sortierteEintraege.length - maxItems} weitere Einträge anzeigen
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default BelegHistorie; 