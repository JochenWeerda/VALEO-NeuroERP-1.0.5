import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  TextField,
  Button,
  CircularProgress,
  Collapse,
  IconButton,
  Card,
  CardContent,
  Alert,
  Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SendIcon from '@mui/icons-material/Send';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import TimelineIcon from '@mui/icons-material/Timeline';
import MoneyIcon from '@mui/icons-material/Money';
import CalculateIcon from '@mui/icons-material/Calculate';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { styled } from '@mui/material/styles';

import { LLMService } from '../../services/llmService';
import * as belegAssistentService from '../../services/belegAssistentService';
import { Angebot, Auftrag, Lieferschein, Rechnung, Bestellung } from '../../services/belegeApi';

// Typen der unterstützten Belegarten
type BelegTyp = 'angebot' | 'auftrag' | 'lieferschein' | 'rechnung' | 'bestellung';

// Props für die Komponente
interface BelegAssistentProps {
  belegTyp: BelegTyp;
  belegDaten: any;
  onApplyPreisvorschlag?: (artikelId: string, neuerPreis: number, rabatt?: number) => void;
  onApplyLiefertermin?: (liefertermin: string) => void;
  onApplyRoutenoptimierung?: (reihenfolge: any[]) => void;
  expanded?: boolean;
  toggleExpanded?: () => void;
}

// Styled-Komponente für den ausklappbaren Header
const AssistentHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1.5),
  borderBottom: expanded => expanded ? `1px solid ${theme.palette.divider}` : 'none',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

// Styled-Komponente für Vorschlagskarten
const VorschlagCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    boxShadow: theme.shadows[3],
  },
}));

const BelegAssistent: React.FC<BelegAssistentProps> = ({
  belegTyp,
  belegDaten,
  onApplyPreisvorschlag,
  onApplyLiefertermin,
  onApplyRoutenoptimierung,
  expanded = false,
  toggleExpanded
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preisvorschlaege, setPreisvorschlaege] = useState<belegAssistentService.PreisVorschlag[]>([]);
  const [lieferterminPrognose, setLieferterminPrognose] = useState<belegAssistentService.LieferterminPrognose | null>(null);
  const [routenOptimierung, setRoutenOptimierung] = useState<belegAssistentService.RoutenOptimierung | null>(null);
  const [zahlungsPrognose, setZahlungsPrognose] = useState<belegAssistentService.ZahlungsPrognose | null>(null);
  const [bedarfsErmittlung, setBedarfsErmittlung] = useState<belegAssistentService.BedarfsErmittlung | null>(null);
  const [qualitaetsAnalyse, setQualitaetsAnalyse] = useState<belegAssistentService.QualitaetsAnalyse | null>(null);
  
  const [userInput, setUserInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{text: string, sender: 'user' | 'assistant'}>>([]);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Wenn toggleExpanded als Prop übergeben wird, nutze diese Funktion
  const handleToggleExpand = () => {
    if (toggleExpanded) {
      toggleExpanded();
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  // Lade die relevanten KI-Vorschläge basierend auf dem Belegtyp
  useEffect(() => {
    if (!isExpanded) return;
    
    setLoading(true);
    setError(null);
    
    const loadAssistantData = async () => {
      try {
        // Je nach Belegtyp verschiedene Empfehlungen laden
        switch(belegTyp) {
          case 'angebot':
            const vorschlaege = await belegAssistentService.getPreisvorschlaege(belegDaten as Angebot);
            setPreisvorschlaege(vorschlaege);
            break;
            
          case 'auftrag':
            const prognose = await belegAssistentService.getLieferterminPrognose(belegDaten as Auftrag);
            setLieferterminPrognose(prognose);
            break;
            
          case 'lieferschein':
            const optimierung = await belegAssistentService.getRoutenoptimierung(belegDaten as Lieferschein);
            setRoutenOptimierung(optimierung);
            break;
            
          case 'rechnung':
            const zahlungsInfo = await belegAssistentService.getZahlungsprognose(belegDaten as Rechnung);
            setZahlungsPrognose(zahlungsInfo);
            break;
            
          case 'bestellung':
            const artikelIds = (belegDaten as Bestellung).positionen.map(pos => pos.artikelId);
            const bedarfsInfo = await belegAssistentService.getBedarfsermittlung(artikelIds);
            setBedarfsErmittlung(bedarfsInfo);
            break;
        }
      } catch (err: any) {
        setError(`Fehler beim Laden der KI-Vorschläge: ${err.message}`);
        console.error('KI-Assistent Fehler:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadAssistantData();
  }, [belegTyp, belegDaten, isExpanded]);

  // Handler zum Senden von Benutzeranfragen an den LLM-Service
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    const userMessage = userInput.trim();
    setChatMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setUserInput('');
    setSendingMessage(true);
    
    try {
      // Kontext zum Beleg hinzufügen
      const contextedQuery = `Im Kontext des ${getBelegTypName(belegTyp)}s mit ${belegDaten.positionen?.length || 0} Positionen: ${userMessage}`;
      const response = await LLMService.sendQuery(contextedQuery);
      
      setChatMessages(prev => [...prev, { text: response, sender: 'assistant' }]);
    } catch (err: any) {
      setError(`Fehler bei der Kommunikation mit dem KI-Assistenten: ${err.message}`);
    } finally {
      setSendingMessage(false);
    }
  };

  // Hilfsfunktion zur Bestimmung des Belegtyp-Namens
  const getBelegTypName = (typ: BelegTyp): string => {
    switch(typ) {
      case 'angebot': return 'Angebot';
      case 'auftrag': return 'Auftrag';
      case 'lieferschein': return 'Lieferschein';
      case 'rechnung': return 'Rechnung';
      case 'bestellung': return 'Bestellung';
      default: return 'Beleg';
    }
  };

  // Rendert den Inhalt basierend auf dem Belegtyp
  const renderContent = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" p={3}>
          <CircularProgress size={40} />
          <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
            KI-Assistent analysiert den Beleg...
          </Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
      );
    }

    // Je nach Belegtyp verschiedene Inhalte anzeigen
    switch(belegTyp) {
      case 'angebot':
        return renderPreisvorschlaege();
      case 'auftrag':
        return renderLieferterminPrognose();
      case 'lieferschein':
        return renderRoutenOptimierung();
      case 'rechnung':
        return renderZahlungsPrognose();
      case 'bestellung':
        return renderBedarfsermittlung();
      default:
        return (
          <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
            Keine spezifischen Vorschläge für diesen Belegtyp verfügbar.
          </Typography>
        );
    }
  };

  // Rendert Preisvorschläge für Angebote
  const renderPreisvorschlaege = () => {
    if (preisvorschlaege.length === 0) {
      return (
        <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
          Keine Preisvorschläge verfügbar.
        </Typography>
      );
    }

    return (
      <Box p={2}>
        <Typography variant="subtitle1" gutterBottom>
          Preisvorschläge basierend auf Marktanalyse
        </Typography>
        
        {preisvorschlaege.map((vorschlag, index) => (
          <VorschlagCard key={index}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2">{vorschlag.artikelBezeichnung}</Typography>
                <Chip 
                  label={`${vorschlag.konfidenz}% Konfidenz`}
                  color={vorschlag.konfidenz > 80 ? "success" : "primary"}
                  size="small"
                />
              </Box>
              
              <Box display="flex" alignItems="center" mb={1}>
                <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
                  Original: {vorschlag.originalPreis.toFixed(2)} €
                </Typography>
                <Typography variant="body1" fontWeight="bold" color="primary">
                  → {vorschlag.vorgeschlagenerPreis.toFixed(2)} €
                </Typography>
                {vorschlag.rabatt && (
                  <Chip 
                    label={`${vorschlag.rabatt}% Rabatt`}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
              
              <Typography variant="body2" color="textSecondary" paragraph>
                {vorschlag.begruendung}
              </Typography>
              
              {onApplyPreisvorschlag && (
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => onApplyPreisvorschlag(
                    vorschlag.artikelId, 
                    vorschlag.vorgeschlagenerPreis,
                    vorschlag.rabatt
                  )}
                >
                  Vorschlag übernehmen
                </Button>
              )}
            </CardContent>
          </VorschlagCard>
        ))}
      </Box>
    );
  };

  // Rendert Lieferterminprognose für Aufträge
  const renderLieferterminPrognose = () => {
    if (!lieferterminPrognose) {
      return (
        <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
          Keine Lieferterminprognose verfügbar.
        </Typography>
      );
    }

    const prognoseDatum = new Date(lieferterminPrognose.geschaetztesDatum);

    return (
      <Box p={2}>
        <Typography variant="subtitle1" gutterBottom>
          Lieferterminprognose
        </Typography>
        
        <VorschlagCard>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle2">Geschätzter Liefertermin</Typography>
              <Chip 
                label={`${lieferterminPrognose.konfidenz}% Konfidenz`}
                color={lieferterminPrognose.konfidenz > 80 ? "success" : "primary"}
                size="small"
              />
            </Box>
            
            <Typography variant="h6" color="primary" gutterBottom>
              {prognoseDatum.toLocaleDateString('de-DE')}
            </Typography>
            
            <Typography variant="body2" color="textSecondary">
              Lieferzeit: {lieferterminPrognose.minimaleDauer} bis {lieferterminPrognose.maximaleDauer} Tage
            </Typography>
            
            <Box mt={1} mb={2}>
              <Chip 
                icon={<LocalShippingIcon />}
                label={`Einflussfaktor: ${lieferterminPrognose.einflussbereich}`}
                size="small"
              />
            </Box>
            
            <Typography variant="body2" paragraph>
              {lieferterminPrognose.begruendung}
            </Typography>
            
            {lieferterminPrognose.alternativen && lieferterminPrognose.alternativen.length > 0 && (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  Alternative Lieferoptionen:
                </Typography>
                <List dense>
                  {lieferterminPrognose.alternativen.map((alt, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={new Date(alt.datum).toLocaleDateString('de-DE')}
                        secondary={alt.beschreibung}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
            
            {onApplyLiefertermin && (
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => onApplyLiefertermin(lieferterminPrognose.geschaetztesDatum)}
              >
                Prognosetermin übernehmen
              </Button>
            )}
          </CardContent>
        </VorschlagCard>
      </Box>
    );
  };

  // Rendert Routenoptimierung für Lieferscheine
  const renderRoutenOptimierung = () => {
    if (!routenOptimierung) {
      return (
        <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
          Keine Routenoptimierung verfügbar.
        </Typography>
      );
    }

    return (
      <Box p={2}>
        <Typography variant="subtitle1" gutterBottom>
          Optimierte Lieferroute
        </Typography>
        
        <VorschlagCard>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle2">Routenvorschlag</Typography>
              <Chip 
                icon={<TimelineIcon />}
                label={`${routenOptimierung.einsparpotential}% Einsparpotential`}
                color="success"
                size="small"
              />
            </Box>
            
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Gesamtentfernung: {routenOptimierung.gesamtEntfernung} km | 
              Gesamtzeit: {Math.floor(routenOptimierung.gesamtZeit / 60)}h {routenOptimierung.gesamtZeit % 60}min
            </Typography>
            
            <List dense>
              {routenOptimierung.optimierteReihenfolge.map((station, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <Chip label={index + 1} size="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={station.kundenName}
                    secondary={station.lieferadresse}
                  />
                  <Typography variant="body2" color="textSecondary">
                    {station.entfernung} km | {station.geschaetzteZeit} min
                  </Typography>
                </ListItem>
              ))}
            </List>
            
            <Typography variant="body2" paragraph>
              {routenOptimierung.begruendung}
            </Typography>
            
            {onApplyRoutenoptimierung && (
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => onApplyRoutenoptimierung(routenOptimierung.optimierteReihenfolge)}
              >
                Routenvorschlag übernehmen
              </Button>
            )}
          </CardContent>
        </VorschlagCard>
      </Box>
    );
  };

  // Rendert Zahlungsprognose für Rechnungen
  const renderZahlungsPrognose = () => {
    if (!zahlungsPrognose) {
      return (
        <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
          Keine Zahlungsprognose verfügbar.
        </Typography>
      );
    }

    const prognoseDatum = new Date(zahlungsPrognose.wahrscheinlichesDatum);

    return (
      <Box p={2}>
        <Typography variant="subtitle1" gutterBottom>
          Zahlungsprognose
        </Typography>
        
        <VorschlagCard>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle2">Erwarteter Zahlungseingang</Typography>
              <Chip 
                icon={<MoneyIcon />}
                label={`${zahlungsPrognose.zahlungswahrscheinlichkeit}% Wahrscheinlichkeit`}
                color={zahlungsPrognose.zahlungswahrscheinlichkeit > 75 ? "success" : 
                      zahlungsPrognose.zahlungswahrscheinlichkeit > 50 ? "warning" : "error"}
                size="small"
              />
            </Box>
            
            <Typography variant="h6" color="primary" gutterBottom>
              {prognoseDatum.toLocaleDateString('de-DE')}
            </Typography>
            
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Ausfallrisiko: {zahlungsPrognose.ausfallrisiko}%
            </Typography>
            
            {zahlungsPrognose.empfehlung && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {zahlungsPrognose.empfehlung}
              </Alert>
            )}
            
            <Typography variant="body2" paragraph>
              {zahlungsPrognose.begruendung}
            </Typography>
          </CardContent>
        </VorschlagCard>
      </Box>
    );
  };

  // Rendert Bedarfsermittlung für Bestellungen
  const renderBedarfsermittlung = () => {
    if (!bedarfsErmittlung) {
      return (
        <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
          Keine Bedarfsermittlung verfügbar.
        </Typography>
      );
    }

    return (
      <Box p={2}>
        <Typography variant="subtitle1" gutterBottom>
          Bedarfsanalyse
        </Typography>
        
        <VorschlagCard>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle2">Bestellbedarf</Typography>
              <Chip 
                icon={<CalculateIcon />}
                label={`Gesamtkosten: ${bedarfsErmittlung.gesamtkosten.toFixed(2)} €`}
                color="primary"
                size="small"
              />
            </Box>
            
            <List dense>
              {bedarfsErmittlung.artikel.map((artikel, index) => (
                <ListItem key={index} alignItems="flex-start">
                  <ListItemIcon>
                    <Chip 
                      label={artikel.bestelldringlichkeit}
                      color={artikel.bestelldringlichkeit === 'kritisch' ? 'error' : 
                             artikel.bestelldringlichkeit === 'hoch' ? 'warning' : 'default'}
                      size="small" 
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={artikel.artikelBezeichnung}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="textPrimary">
                          Fehlmenge: {artikel.fehlmenge} | Optimale Bestellmenge: {artikel.optimaleBestellmenge}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2" color="textSecondary">
                          Lieferzeit: ca. {artikel.lieferzeit} Tage
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
            
            {bedarfsErmittlung.lieferanten.length > 0 && (
              <>
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  Empfohlene Lieferanten:
                </Typography>
                <List dense>
                  {bedarfsErmittlung.lieferanten.map((lieferant, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={lieferant.lieferantenName}
                        secondary={`Bewertung: ${lieferant.bewertung}/100 | ${lieferant.artikelAnzahl} Artikel`}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </CardContent>
        </VorschlagCard>
      </Box>
    );
  };

  // Chat-Bereich für freie Anfragen
  const renderChat = () => {
    return (
      <Box p={2}>
        <Typography variant="subtitle1" gutterBottom>
          Fragen Sie den KI-Assistenten
        </Typography>
        
        <Box 
          sx={{ 
            minHeight: '150px', 
            maxHeight: '300px', 
            overflowY: 'auto',
            mb: 2,
            p: 1,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1
          }}
        >
          {chatMessages.length === 0 ? (
            <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 5 }}>
              Stellen Sie eine Frage zum aktuellen Beleg
            </Typography>
          ) : (
            chatMessages.map((msg, index) => (
              <Box 
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 1
                }}
              >
                <Paper
                  sx={{
                    p: 1,
                    maxWidth: '80%',
                    bgcolor: msg.sender === 'user' ? 'primary.light' : 'background.paper',
                    color: msg.sender === 'user' ? 'primary.contrastText' : 'text.primary'
                  }}
                >
                  <Typography variant="body2">
                    {msg.text}
                  </Typography>
                </Paper>
              </Box>
            ))
          )}
        </Box>
        
        <Box display="flex" alignItems="center">
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            placeholder="Stellen Sie eine Frage..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={sendingMessage}
          />
          <IconButton 
            color="primary" 
            onClick={handleSendMessage}
            disabled={sendingMessage || !userInput.trim()}
            sx={{ ml: 1 }}
          >
            {sendingMessage ? <CircularProgress size={24} /> : <SendIcon />}
          </IconButton>
        </Box>
      </Box>
    );
  };

  // Rendert die gesamte Komponente
  return (
    <Paper 
      sx={{ 
        mt: 2, 
        mb: 2, 
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <AssistentHeader onClick={handleToggleExpand}>
        <Box display="flex" alignItems="center">
          <LightbulbIcon color="primary" sx={{ mr: 1.5 }} />
          <Typography variant="subtitle1">
            KI-Assistent für {getBelegTypName(belegTyp)}
          </Typography>
          {belegTyp === 'angebot' && <LocalOfferIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />}
          {belegTyp === 'auftrag' && <FormatListNumberedIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />}
          {belegTyp === 'lieferschein' && <LocalShippingIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />}
          {belegTyp === 'rechnung' && <MoneyIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />}
          {belegTyp === 'bestellung' && <CalculateIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />}
        </Box>
        <IconButton size="small" onClick={handleToggleExpand}>
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </AssistentHeader>
      
      <Collapse in={isExpanded}>
        <Divider />
        {renderContent()}
        <Divider />
        {renderChat()}
      </Collapse>
    </Paper>
  );
};

export default BelegAssistent; 