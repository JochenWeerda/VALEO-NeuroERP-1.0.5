import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Alert,
  LinearProgress,
  Divider,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  SmartToy as AIIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  Send as SendIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  auditVollstaendigkeitsPruefung, 
  generateKIErinnerungen, 
  generateKIEmpfehlungen,
  auditMockData
} from '../../services/auditApi';

interface QSAuditKIProps {
  onBack?: () => void;
}

const QSAuditKI: React.FC<QSAuditKIProps> = ({ onBack }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pruefungErgebnis, setPruefungErgebnis] = useState<{
    vollstaendig: boolean;
    fehlendeDokumente: Array<{kategorie: string; titel: string; id: string}>;
    empfehlungen: string;
  } | null>(null);
  const [view, setView] = useState<'hauptmenu' | 'vollstaendigkeitspruefung' | 'erinnerungen' | 'empfehlungen'>('hauptmenu');
  
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (view !== 'hauptmenu') {
      setView('hauptmenu');
    } else if (onBack) {
      onBack();
    } else {
      navigate('/qualitaet/audit');
    }
  };
  
  const handleVollstaendigkeitspruefung = async () => {
    setView('vollstaendigkeitspruefung');
    setLoading(true);
    try {
      // In einer realen Anwendung würden wir hier die API aufrufen
      // const ergebnis = await auditVollstaendigkeitsPruefung();
      
      // Für den Prototyp verwenden wir simulierte Daten
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulierte Verzögerung
      const ergebnis = {
        vollstaendig: false,
        fehlendeDokumente: [
          { kategorie: 'QS', titel: 'Aktualisierte QS-Checkliste für Getreidelagerung', id: '1' },
          { kategorie: 'HACCP', titel: 'Schulungsnachweis für jährliche HACCP-Schulung', id: '2' },
          { kategorie: 'QS', titel: 'Kalibrierungszertifikate für Messgeräte', id: '3' }
        ],
        empfehlungen: 'Basierend auf meiner Analyse müssen noch 3 wichtige Dokumente für das bevorstehende Audit vorbereitet werden. Die QS-Checklisten sollten priorisiert werden, da sie einen kritischen Teil des Audits darstellen. Die HACCP-Schulung sollte innerhalb der nächsten 3 Wochen stattfinden, um ausreichend Zeit für Nachschulungen zu haben. Die Kalibrierung der Messgeräte sollte umgehend beauftragt werden, da externe Dienstleister oft längere Vorlaufzeiten benötigen.'
      };
      
      setPruefungErgebnis(ergebnis);
      setError(null);
    } catch (err) {
      setError('Fehler bei der KI-Vollständigkeitsprüfung.');
      console.error('Fehler bei der KI-Vollständigkeitsprüfung:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleErinnerungen = () => {
    setView('erinnerungen');
  };
  
  const handleEmpfehlungen = () => {
    setView('empfehlungen');
  };
  
  const renderHauptmenu = () => {
    return (
      <Box>
        <Typography variant="h5" component="h2" gutterBottom>
          <AIIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          KI-unterstütztes Audit-Management
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Die KI-Funktionen helfen Ihnen bei der optimalen Vorbereitung auf das anstehende Audit. Wählen Sie eine der folgenden Optionen, um loszulegen.
        </Alert>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <CheckCircleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Vollständigkeitsprüfung
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Die KI analysiert alle vorhandenen Dokumente und identifiziert fehlende Unterlagen für das anstehende Audit.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  fullWidth 
                  variant="contained"
                  onClick={handleVollstaendigkeitspruefung}
                >
                  Prüfung starten
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Erinnerungsplanung
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Die KI erstellt einen optimalen Erinnerungsplan für ausstehende Aufgaben unter Berücksichtigung der Prioritäten und Fristen.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  fullWidth 
                  variant="contained"
                  onClick={handleErinnerungen}
                >
                  Erinnerungen planen
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <AnalyticsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Aufgabenpriorisierung
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Die KI analysiert alle anstehenden Aufgaben und gibt Empfehlungen zur optimalen Reihenfolge für die Bearbeitung.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  fullWidth 
                  variant="contained"
                  onClick={handleEmpfehlungen}
                >
                  Empfehlungen erhalten
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  const renderVollstaendigkeitspruefung = () => {
    return (
      <Box>
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton onClick={handleBack} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h2">
            <CheckCircleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            KI-Vollständigkeitsprüfung
          </Typography>
        </Box>
        
        {loading && (
          <Box display="flex" flexDirection="column" alignItems="center" my={5}>
            <CircularProgress size={60} />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Die KI analysiert alle vorhandenen Dokumente und Anforderungen...
            </Typography>
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {!loading && pruefungErgebnis && (
          <Box>
            <Alert 
              severity={pruefungErgebnis.vollstaendig ? "success" : "warning"} 
              sx={{ mb: 3 }}
            >
              {pruefungErgebnis.vollstaendig ? (
                <Typography>
                  <CheckCircleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Die Unterlagen für das Audit sind vollständig. Alle erforderlichen Dokumente sind vorhanden und aktuell.
                </Typography>
              ) : (
                <Typography>
                  <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Es fehlen noch {pruefungErgebnis.fehlendeDokumente.length} Dokumente für das anstehende Audit. Bitte bearbeiten Sie die folgenden Anforderungen.
                </Typography>
              )}
            </Alert>
            
            {!pruefungErgebnis.vollstaendig && (
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Fehlende Dokumente
                </Typography>
                <List>
                  {pruefungErgebnis.fehlendeDokumente.map((dokument) => (
                    <ListItem 
                      key={dokument.id}
                      sx={{ 
                        mb: 1, 
                        border: '1px solid #e0e0e0', 
                        borderRadius: 1 
                      }}
                    >
                      <ListItemIcon>
                        <ErrorIcon color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary={dokument.titel}
                        secondary={`Kategorie: ${dokument.kategorie}`}
                      />
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => navigate(`/qualitaet/audit/anforderungen/${dokument.id}`)}
                      >
                        Zur Anforderung
                      </Button>
                    </ListItem>
                  ))}
                </List>
                
                <Button
                  variant="contained"
                  startIcon={<Send as any />}
                  sx={{ mt: 2 }}
                  onClick={() => {
                    alert('Erinnerungen wurden an die verantwortlichen Mitarbeiter gesendet.');
                  }}
                >
                  Erinnerungen an Verantwortliche senden
                </Button>
              </Paper>
            )}
            
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                KI-Empfehlungen
              </Typography>
              <Typography variant="body1" paragraph>
                {pruefungErgebnis.empfehlungen}
              </Typography>
              
              <Button
                variant="outlined"
                startIcon={<Refresh as any />}
                onClick={handleVollstaendigkeitspruefung}
              >
                Erneut prüfen
              </Button>
            </Paper>
          </Box>
        )}
      </Box>
    );
  };
  
  const renderErinnerungen = () => {
    return (
      <Box>
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton onClick={handleBack} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h2">
            <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            KI-gestützte Erinnerungsplanung
          </Typography>
        </Box>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Die KI hat basierend auf den anstehenden Aufgaben, Fristen und Prioritäten einen optimierten Erinnerungsplan erstellt. Dieser Plan stellt sicher, dass alle Aufgaben rechtzeitig abgeschlossen werden und die Verantwortlichen mit freundlichen, aber bestimmten Erinnerungen unterstützt werden.
        </Alert>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Automatische Erinnerungen
              </Typography>
              
              <List>
                {auditMockData.anforderungen.map((anforderung) => (
                  <ListItem 
                    key={anforderung.id}
                    sx={{ 
                      mb: 1, 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 1 
                    }}
                  >
                    <ListItemText
                      primary={anforderung.titel}
                      secondary={
                        <>
                          Deadline: {new Date(anforderung.deadline).toLocaleDateString('de-DE')}
                          <br />
                          Erinnerungen: Erste Erinnerung 14 Tage vor Deadline, Zweite Erinnerung 7 Tage vor Deadline, Letzte Erinnerung 2 Tage vor Deadline
                        </>
                      }
                    />
                    <Chip 
                      label="Automatisch" 
                      color="primary" 
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
              
              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() => {
                  alert('Die Erinnerungseinstellungen wurden auf alle aktuellen und zukünftigen Anforderungen angewendet.');
                }}
              >
                Auf alle Anforderungen anwenden
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Eskalationsmanagement
              </Typography>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                Das KI-gestützte Eskalationsmanagement sorgt dafür, dass trotz freundlicher Erinnerungen keine Aufgabe in Vergessenheit gerät.
              </Alert>
              
              <List>
                <ListItem sx={{ mb: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <ListItemText
                    primary="Stufe 1: Freundliche Erinnerung"
                    secondary="Eine höfliche Erinnerung mit Hinweis auf die Deadline und Angebot zur Unterstützung."
                  />
                  <Chip label="14 Tage vor Deadline" size="small" />
                </ListItem>
                
                <ListItem sx={{ mb: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <ListItemText
                    primary="Stufe 2: Dringende Erinnerung"
                    secondary="Eine freundliche, aber bestimmtere Erinnerung mit Betonung der Wichtigkeit für das Audit."
                  />
                  <Chip label="7 Tage vor Deadline" size="small" color="primary" />
                </ListItem>
                
                <ListItem sx={{ mb: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <ListItemText
                    primary="Stufe 3: Letzte Mahnung"
                    secondary="Eine letzte Erinnerung mit Hinweis auf mögliche Konsequenzen bei Nichteinhaltung."
                  />
                  <Chip label="2 Tage vor Deadline" size="small" color="warning" />
                </ListItem>
                
                <ListItem sx={{ mb: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <ListItemText
                    primary="Stufe 4: Eskalation an Vorgesetzte"
                    secondary="Information an die Geschäftsführung oder die zuständige QM-Leitung über nicht erledigte kritische Aufgaben."
                  />
                  <Chip label="Nach Deadline" size="small" color="error" />
                </ListItem>
              </List>
              
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => {
                  alert('Die Eskalationseinstellungen wurden angepasst.');
                }}
              >
                Eskalationseinstellungen anpassen
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  const renderEmpfehlungen = () => {
    return (
      <Box>
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton onClick={handleBack} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h2">
            <AnalyticsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            KI-Aufgabenpriorisierung
          </Typography>
        </Box>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Die KI hat alle anstehenden Aufgaben analysiert und einen optimierten Bearbeitungsplan erstellt, der die Prioritäten, Abhängigkeiten und Fristen berücksichtigt.
        </Alert>
        
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Empfohlene Bearbeitungsreihenfolge
          </Typography>
          
          <List>
            {auditMockData.anforderungen
              .slice()
              .sort((a, b) => {
                // Sortierung nach KI-Empfehlung (simuliert)
                const priorityScore = {
                  'kritisch': 4,
                  'hoch': 3,
                  'mittel': 2,
                  'niedrig': 1
                };
                
                // Kombiniere Priorität und Deadline für einen Gesamtscore
                const scoreA = priorityScore[a.prioritaet] * 100 - new Date(a.deadline).getTime();
                const scoreB = priorityScore[b.prioritaet] * 100 - new Date(b.deadline).getTime();
                
                return scoreB - scoreA;
              })
              .map((anforderung, index) => (
                <ListItem 
                  key={anforderung.id}
                  sx={{ 
                    mb: 1, 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 1,
                    backgroundColor: index === 0 ? '#f9fbe7' : 'inherit'
                  }}
                >
                  <Box 
                    sx={{ 
                      width: 30, 
                      height: 30, 
                      borderRadius: '50%', 
                      backgroundColor: 'primary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2
                    }}
                  >
                    {index + 1}
                  </Box>
                  <ListItemText
                    primary={anforderung.titel}
                    secondary={
                      <>
                        Priorität: {anforderung.prioritaet} | Deadline: {new Date(anforderung.deadline).toLocaleDateString('de-DE')}
                        <br />
                        {index === 0 && "KI-Empfehlung: Diese Aufgabe sollte sofort bearbeitet werden, da sie eine hohe Priorität hat und für andere Aufgaben benötigt wird."}
                        {index === 1 && "KI-Empfehlung: Diese Aufgabe erfordert Vorlaufzeit für die Organisation der Schulung und sollte zeitnah begonnen werden."}
                        {index === 2 && "KI-Empfehlung: Diese Aufgabe kann parallel zu den anderen bearbeitet werden und erfordert Kontakt mit externen Dienstleistern."}
                      </>
                    }
                  />
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => navigate(`/qualitaet/audit/anforderungen/${anforderung.id}`)}
                  >
                    Bearbeiten
                  </Button>
                </ListItem>
              ))}
          </List>
        </Paper>
        
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            KI-Empfehlung zur Ressourcenplanung
          </Typography>
          
          <Typography variant="body1" paragraph>
            Basierend auf der Analyse der anstehenden Aufgaben empfiehlt die KI folgende Ressourcenverteilung:
          </Typography>
          
          <Typography variant="body1" paragraph>
            • Thomas Becker (QM) sollte sich auf die QS-Checklisten-Aktualisierung und HACCP-Schulungsorganisation konzentrieren. Geschätzter Zeitaufwand: 3-4 Tage.
          </Typography>
          
          <Typography variant="body1" paragraph>
            • Klaus Weber (Anlagenführer) sollte sich um die Kalibrierung der Messgeräte kümmern und einen externen Dienstleister kontaktieren. Geschätzter Zeitaufwand: 1-2 Tage plus Wartezeit auf den Dienstleister.
          </Typography>
          
          <Typography variant="body1" paragraph>
            Um alle Aufgaben rechtzeitig abzuschließen, sollte mit der Bearbeitung innerhalb der nächsten 7 Tage begonnen werden, um einen ausreichenden Puffer vor dem Audit zu haben.
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<Send as any />}
            onClick={() => {
              alert('Die Empfehlungen wurden an die verantwortlichen Mitarbeiter gesendet.');
            }}
          >
            Empfehlungen teilen
          </Button>
        </Paper>
      </Box>
    );
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        {view === 'hauptmenu' && renderHauptmenu()}
        {view === 'vollstaendigkeitspruefung' && renderVollstaendigkeitspruefung()}
        {view === 'erinnerungen' && renderErinnerungen()}
        {view === 'empfehlungen' && renderEmpfehlungen()}
      </Paper>
    </Box>
  );
};

export default QSAuditKI; 