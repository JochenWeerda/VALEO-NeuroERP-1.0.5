import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Collapse,
  IconButton,
  useTheme,
  Skeleton
} from '@mui/material';
import {
  Lightbulb as LightbulbIcon,
  Send as SendIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AutoGraph as AutoGraphIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
  Insights as InsightsIcon
} from '@mui/icons-material';

interface KIAssistentPanelProps {
  belegTyp: 'angebot' | 'auftrag' | 'lieferschein' | 'rechnung' | 'bestellung' | 'eingangslieferschein';
  belegData?: any;
  onApplyRecommendation?: (field: string, value: any) => void;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: 'preisoptimierung' | 'liefertermin' | 'routing' | 'zahlungsbedingung' | 'bedarfsermittlung' | 'qualitaet';
  field?: string;
  value?: any;
  confidence: number; // 0-100
  icon: React.ReactNode;
}

// Memoized Recommendation Item
const RecommendationItem = memo(({
  recommendation,
  onApply
}: {
  recommendation: Recommendation;
  onApply: (recommendation: Recommendation) => void;
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);

  const handleApply = useCallback(() => {
    onApply(recommendation);
  }, [onApply, recommendation]);

  const confidenceColor = useMemo(() => {
    if (recommendation.confidence >= 90) return theme.palette.success.main;
    if (recommendation.confidence >= 70) return theme.palette.info.main;
    if (recommendation.confidence >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  }, [recommendation.confidence, theme]);

  return (
    <ListItem 
      alignItems="flex-start" 
      sx={{ 
        flexDirection: 'column',
        backgroundColor: `${theme.palette.background.default}`,
        borderRadius: 1,
        mb: 1,
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        width: '100%', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        cursor: 'pointer'
      }} onClick={toggleExpand}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            {recommendation.icon}
          </ListItemIcon>
          <ListItemText 
            primary={recommendation.title} 
            primaryTypographyProps={{ fontWeight: 'bold' }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Chip 
            label={`${recommendation.confidence}%`} 
            size="small" 
            sx={{ 
              mr: 1, 
              backgroundColor: confidenceColor,
              color: 'white',
              fontWeight: 'bold'
            }} 
          />
          <IconButton size="small">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>
      
      <Collapse in={expanded} timeout="auto" unmountOnExit sx={{ width: '100%' }}>
        <Box sx={{ pl: 5, pr: 2, pb: 2 }}>
          <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
            {recommendation.description}
          </Typography>
          {recommendation.field && recommendation.value !== undefined && (
            <Button 
              variant="contained" 
              size="small" 
              onClick={handleApply}
              sx={{ mt: 1 }}
            >
              Empfehlung anwenden
            </Button>
          )}
        </Box>
      </Collapse>
    </ListItem>
  );
});

// Memoized Recommendations List
const RecommendationsList = memo(({
  recommendations,
  onApplyRecommendation
}: {
  recommendations: Recommendation[];
  onApplyRecommendation: (recommendation: Recommendation) => void;
}) => {
  if (recommendations.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Keine Empfehlungen verfügbar
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ width: '100%', p: 0 }}>
      {recommendations.map(recommendation => (
        <RecommendationItem
          key={recommendation.id}
          recommendation={recommendation}
          onApply={onApplyRecommendation}
        />
      ))}
    </List>
  );
});

// Skeleton für Ladevorgang
const RecommendationSkeleton = () => (
  <Box sx={{ width: '100%' }}>
    {[1, 2].map((item) => (
      <Box 
        key={item}
        sx={{ 
          p: 2, 
          mb: 1, 
          borderRadius: 1,
          border: '1px solid #eee'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Skeleton variant="circular" width={24} height={24} sx={{ mr: 2 }} />
          <Skeleton variant="text" width="60%" height={24} />
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
            <Skeleton variant="rectangular" width={40} height={20} sx={{ mr: 1, borderRadius: 1 }} />
            <Skeleton variant="circular" width={20} height={20} />
          </Box>
        </Box>
      </Box>
    ))}
  </Box>
);

const KIAssistentPanel: React.FC<KIAssistentPanelProps> = ({ 
  belegTyp, 
  belegData, 
  onApplyRecommendation 
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [expanded, setExpanded] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [response, setResponse] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Empfehlungen generieren basierend auf dem Belegtyp und den Daten
  useEffect(() => {
    if (belegData) {
      generateRecommendations();
    }
  }, [belegTyp, belegData]);

  // API-Aufruf mit Abbrechen-Funktionalität
  const generateRecommendations = useCallback(() => {
    setLoading(true);
    
    // AbortController für abbruchfähige API-Aufrufe
    const controller = new AbortController();
    const signal = controller.signal;
    
    // Simuliert einen API-Aufruf
    const timeoutId = setTimeout(() => {
      if (signal.aborted) return;
      
      let newRecommendations: Recommendation[] = [];
      
      switch (belegTyp) {
        case 'angebot':
          newRecommendations = [
            {
              id: '1',
              title: 'Optimaler Preis',
              description: 'Basierend auf Marktdaten und Kundenhistorie empfehlen wir einen Preis von 95,50 € pro Einheit für diesen Kunden.',
              category: 'preisoptimierung',
              field: 'einzelpreis',
              value: 95.5,
              confidence: 87,
              icon: <AutoGraphIcon />
            },
            {
              id: '2',
              title: 'Rabattstrategie',
              description: 'Ein Mengenrabatt von 3% könnte die Abschlusswahrscheinlichkeit um 15% erhöhen.',
              category: 'preisoptimierung',
              field: 'rabatt',
              value: 3,
              confidence: 75,
              icon: <InsightsIcon />
            }
          ];
          break;
          
        case 'auftrag':
          newRecommendations = [
            {
              id: '1',
              title: 'Optimaler Liefertermin',
              description: 'Basierend auf Lagerbeständen und Produktionskapazitäten empfehlen wir einen Liefertermin am 15.06.2023.',
              category: 'liefertermin',
              field: 'liefertermin',
              value: '2023-06-15',
              confidence: 92,
              icon: <TimelineIcon />
            }
          ];
          break;
          
        case 'lieferschein':
          newRecommendations = [
            {
              id: '1',
              title: 'Optimale Route',
              description: 'Die effizienteste Route für diese Lieferung spart 12km und 22 Minuten.',
              category: 'routing',
              confidence: 88,
              icon: <TimelineIcon />
            }
          ];
          break;
          
        case 'rechnung':
          newRecommendations = [
            {
              id: '1',
              title: 'Zahlungswahrscheinlichkeit',
              description: 'Dieser Kunde zahlt mit 95% Wahrscheinlichkeit innerhalb von 14 Tagen.',
              category: 'zahlungsbedingung',
              confidence: 95,
              icon: <InsightsIcon />
            }
          ];
          break;
          
        case 'bestellung':
          newRecommendations = [
            {
              id: '1',
              title: 'Bedarfsermittlung',
              description: 'Basierend auf Ihrem aktuellen Lagerbestand und Verkaufsprognosen empfehlen wir eine Bestellmenge von 150 Einheiten.',
              category: 'bedarfsermittlung',
              field: 'menge',
              value: 150,
              confidence: 82,
              icon: <AutoGraphIcon />
            }
          ];
          break;
          
        case 'eingangslieferschein':
          newRecommendations = [
            {
              id: '1',
              title: 'Qualitätsprüfung',
              description: 'Bei diesem Lieferanten empfehlen wir eine detaillierte Qualitätsprüfung aufgrund früherer Abweichungen.',
              category: 'qualitaet',
              field: 'qualitaetspruefung',
              value: { erforderlich: true },
              confidence: 78,
              icon: <AssignmentIcon />
            }
          ];
          break;
      }
      
      setRecommendations(newRecommendations);
      setLoading(false);
    }, 1000);
    
    // Cleanup-Funktion
    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [belegTyp]);

  // Empfehlung anwenden
  const handleApplyRecommendation = useCallback((recommendation: Recommendation) => {
    if (onApplyRecommendation && recommendation.field && recommendation.value !== undefined) {
      onApplyRecommendation(recommendation.field, recommendation.value);
    }
  }, [onApplyRecommendation]);

  // Frage senden
  const handleSendQuestion = useCallback(() => {
    if (!question.trim()) return;
    
    setIsGenerating(true);
    setResponse(null);
    
    // AbortController für abbruchfähige API-Aufrufe
    const controller = new AbortController();
    const signal = controller.signal;
    
    // Simuliert einen API-Aufruf
    const timeoutId = setTimeout(() => {
      if (signal.aborted) return;
      
      let answer = '';
      
      // Einfache Antwortlogik basierend auf Schlüsselwörtern
      if (question.toLowerCase().includes('preis') || question.toLowerCase().includes('rabatt')) {
        answer = 'Preise sollten basierend auf Kundenhistorie, aktuellen Marktpreisen und strategischen Zielen festgelegt werden. Für diesen Kunden empfehle ich einen Preis im oberen Mittelfeld.';
      } else if (question.toLowerCase().includes('lieferung') || question.toLowerCase().includes('termin')) {
        answer = 'Der optimale Liefertermin hängt von Lagerbeständen, Produktionskapazitäten und Kundenpriorität ab. Basierend auf den aktuellen Daten wäre Mitte des Monats realistisch.';
      } else if (question.toLowerCase().includes('qualität') || question.toLowerCase().includes('prüfung')) {
        answer = 'Bei diesem Lieferanten sind aufgrund vergangener Abweichungen zusätzliche Qualitätsprüfungen sinnvoll, besonders im Hinblick auf Verpackungsstandards und Produktintegrität.';
      } else {
        answer = 'Leider kann ich diese Frage nicht spezifisch beantworten. Könnten Sie Ihre Frage bitte auf Preisgestaltung, Liefertermine oder Qualitätsaspekte fokussieren?';
      }
      
      setResponse(answer);
      setIsGenerating(false);
      
    }, 1500);
    
    // Cleanup-Funktion
    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [question]);

  const toggleExpand = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);

  // Memoized Panel-Header
  const panelHeader = useMemo(() => (
    <Box sx={{ 
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      p: 2,
      cursor: 'pointer',
      borderBottom: expanded ? `1px solid ${theme.palette.divider}` : 'none'
    }} onClick={toggleExpand}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <LightbulbIcon sx={{ color: theme.palette.warning.main, mr: 1 }} />
        <Typography variant="h6">KI-Assistent</Typography>
      </Box>
      <IconButton size="small">
        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </IconButton>
    </Box>
  ), [expanded, theme, toggleExpand]);

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        mt: 3, 
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
        borderLeft: `4px solid ${theme.palette.warning.main}`
      }}
    >
      {panelHeader}
      
      <Collapse in={expanded} timeout="auto">
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            KI-Empfehlungen für {belegTyp.charAt(0).toUpperCase() + belegTyp.slice(1)}
          </Typography>
          
          {loading ? (
            <RecommendationSkeleton />
          ) : (
            <RecommendationsList 
              recommendations={recommendations}
              onApplyRecommendation={handleApplyRecommendation}
            />
          )}
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            Fragen Sie den KI-Assistenten
          </Typography>
          
          <Box 
            component="form" 
            onSubmit={(e: React.FormEvent) => {
              e.preventDefault();
              handleSendQuestion();
            }}
            sx={{ 
              display: 'flex', 
              mt: 1 
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Stellen Sie eine Frage..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isGenerating}
              sx={{ mr: 1 }}
            />
            <Button
              variant="contained"
              color="primary"
              size="small"
              endIcon={isGenerating ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
              onClick={handleSendQuestion}
              disabled={!question.trim() || isGenerating}
            >
              Senden
            </Button>
          </Box>
          
          {response && (
            <Paper 
              variant="outlined" 
              sx={{ 
                mt: 2, 
                p: 2,
                backgroundColor: theme.palette.background.default 
              }}
            >
              <Typography variant="body2">{response}</Typography>
            </Paper>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default memo(KIAssistentPanel); 