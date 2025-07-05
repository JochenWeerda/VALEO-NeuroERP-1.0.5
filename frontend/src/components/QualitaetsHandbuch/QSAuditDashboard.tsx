import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Alert,
  LinearProgress,
  Chip,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  CalendarMonth as CalendarIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  PriorityHigh as PriorityHighIcon,
  SmartToy as AIIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getAuditStatistik, auditMockData } from '../../services/auditApi';
import type { AuditStatistik } from '../../services/auditApi';

interface QSAuditDashboardProps {
  onNavigateToDetail?: (view: string, id?: string) => void;
}

const QSAuditDashboard: React.FC<QSAuditDashboardProps> = ({ onNavigateToDetail }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statistik, setStatistik] = useState<AuditStatistik | null>(null);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In einer realen Anwendung würden wir hier die API aufrufen
        // const data = await getAuditStatistik();
        // Für den Prototyp verwenden wir Mock-Daten
        const data = auditMockData.statistik;
        setStatistik(data);
        setError(null);
      } catch (err) {
        setError('Fehler beim Laden der Audit-Daten.');
        console.error('Fehler beim Laden der Audit-Daten:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleNavigate = (view: string, id?: string) => {
    if (onNavigateToDetail) {
      onNavigateToDetail(view, id);
    } else {
      navigate(`/qualitaet/audit/${view}${id ? `/${id}` : ''}`);
    }
  };
  
  const renderFortschrittsanzeige = () => {
    if (!statistik) return null;
    
    return (
      <Box sx={{ width: '100%', mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="body2">
            Fortschritt der Audit-Vorbereitung
          </Typography>
          <Typography variant="body2" color="primary">
            {statistik.fortschrittProzent}%
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={statistik.fortschrittProzent} 
          sx={{ 
            height: 10, 
            borderRadius: 5,
            backgroundColor: '#e0e0e0',
            '& .MuiLinearProgress-bar': {
              backgroundColor: statistik.fortschrittProzent < 30 ? '#f44336' : 
                              statistik.fortschrittProzent < 70 ? '#ff9800' : '#4caf50'
            }
          }}
        />
        <Box display="flex" justifyContent="space-between" mt={1}>
          <Typography variant="caption" color="text.secondary">
            Beginn
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Audit ({statistik.zeitbisAudit} Tage)
          </Typography>
        </Box>
      </Box>
    );
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2">
            <DashboardIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            QS-Audit Dashboard
          </Typography>
          
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />} 
              onClick={() => window.location.reload()}
              sx={{ mr: 1 }}
            >
              Aktualisieren
            </Button>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleNavigate('anforderungen/neu')}
            >
              Neue Anforderung
            </Button>
          </Box>
        </Box>
        
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {statistik && statistik.zeitbisAudit && statistik.zeitbisAudit < 30 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle2">
              <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Das Audit findet in {statistik.zeitbisAudit} Tagen statt. Bitte stellen Sie sicher, dass alle erforderlichen Dokumente vorbereitet sind.
            </Typography>
          </Alert>
        )}
        
        {renderFortschrittsanzeige()}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Audit-Übersicht
            </Typography>
            
            <Grid container spacing={2}>
              {statistik && (
                <>
                  <Grid item xs={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="h5" color="primary">
                          {statistik.offeneAnforderungen}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Offene Anforderungen
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button size="small" onClick={() => handleNavigate('anforderungen')}>
                          Anzeigen
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="h5" color="success.main">
                          {statistik.abgeschlosseneAnforderungen}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Abgeschlossene Anforderungen
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button size="small" onClick={() => handleNavigate('anforderungen')}>
                          Anzeigen
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="h5" color="error.main">
                          {statistik.ueberfalligeAnforderungen}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Überfällige Anforderungen
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button size="small" onClick={() => handleNavigate('anforderungen')}>
                          Anzeigen
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="h5" color="info.main">
                          {statistik.dokumenteStatus.aktuell}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Aktuelle Dokumente
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button size="small" onClick={() => handleNavigate('dokumente')}>
                          Anzeigen
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                </>
              )}
            </Grid>
            
            <Box mt={4}>
              <Typography variant="h6" gutterBottom>
                Nächste Aktionen
              </Typography>
              
              <List>
                {auditMockData.anforderungen.slice(0, 3).map((anforderung) => (
                  <ListItem 
                    key={anforderung.id}
                    sx={{ 
                      mb: 1, 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 1,
                      backgroundColor: anforderung.prioritaet === 'hoch' ? '#fff8e1' : 
                                      anforderung.prioritaet === 'kritisch' ? '#ffebee' : 'inherit' 
                    }}
                  >
                    <ListItemText
                      primary={anforderung.titel}
                      secondary={`Fällig bis: ${new Date(anforderung.deadline).toLocaleDateString('de-DE')} | ${anforderung.kategorie}`}
                    />
                    <ListItemSecondaryAction>
                      <Chip 
                        label={anforderung.status} 
                        size="small"
                        color={anforderung.status === 'offen' ? 'primary' : 
                               anforderung.status === 'inBearbeitung' ? 'info' : 
                               anforderung.status === 'abgeschlossen' ? 'success' : 'default'}
                        sx={{ mr: 1 }}
                      />
                      <IconButton 
                        edge="end" 
                        size="small"
                        onClick={() => handleNavigate('anforderungen', anforderung.id)}
                      >
                        <AssignmentIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={() => handleNavigate('anforderungen')}
                  sx={{ mt: 1 }}
                >
                  Alle Anforderungen anzeigen
                </Button>
              </List>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                <AIIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                KI-Unterstützung
              </Typography>
              
              <List>
                <ListItem button onClick={() => handleNavigate('ki/vollstaendigkeitspruefung')}>
                  <ListItemText 
                    primary="Vollständigkeitsprüfung" 
                    secondary="KI-gestützte Prüfung aller benötigten Audit-Unterlagen" 
                  />
                </ListItem>
                
                <ListItem button onClick={() => handleNavigate('ki/erinnerungen')}>
                  <ListItemText 
                    primary="Erinnerungsplanung" 
                    secondary="Optimale Planung von Erinnerungen für pünktliche Fertigstellung" 
                  />
                </ListItem>
                
                <ListItem button onClick={() => handleNavigate('ki/empfehlungen')}>
                  <ListItemText 
                    primary="Aufgabenpriorisierung" 
                    secondary="KI-basierte Empfehlungen zur optimalen Reihenfolge" 
                  />
                </ListItem>
              </List>
            </Paper>
            
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                <CalendarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Audit-Zeitplan
              </Typography>
              
              {statistik && statistik.zeitbisAudit && (
                <Box sx={{ textAlign: 'center', my: 2 }}>
                  <Typography variant="h4" color="primary">
                    {statistik.zeitbisAudit}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tage bis zum Audit
                  </Typography>
                </Box>
              )}
              
              <Button 
                variant="outlined" 
                fullWidth 
                onClick={() => handleNavigate('zeitplan')}
                startIcon={<CalendarIcon />}
              >
                Zum Audit-Zeitplan
              </Button>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Schnellzugriff
              </Typography>
              
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ mb: 1 }}
                onClick={() => handleNavigate('checkliste')}
                startIcon={<CheckCircleIcon />}
              >
                Audit-Checkliste generieren
              </Button>
              
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ mb: 1 }}
                onClick={() => handleNavigate('zyklen')}
                startIcon={<HistoryIcon />}
              >
                Audit-Zyklen verwalten
              </Button>
              
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => handleNavigate('erinnerungen')}
                startIcon={<NotificationsIcon />}
              >
                Erinnerungen verwalten
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default QSAuditDashboard; 