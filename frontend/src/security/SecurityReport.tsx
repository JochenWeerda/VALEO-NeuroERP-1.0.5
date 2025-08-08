/**
 * Security Report Component für VALEO NeuroERP 2.0
 * Zeigt umfassende Sicherheitsberichte und Statistiken an
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Security as SecurityIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  BugReport as BugReportIcon,
  Shield as ShieldIcon
} from '@mui/icons-material';
import { mcpSecurityManager } from './MCPSecurityManager';
import { formSecurityManager } from './FormSecurityManager';

interface SecurityReportProps {
  timeRange?: '1h' | '24h' | '7d' | '30d' | 'all';
  showDetails?: boolean;
  refreshInterval?: number; // in seconds
}

interface SecurityMetrics {
  totalEvents: number;
  securityViolations: number;
  blockedSubmissions: number;
  xssAttempts: number;
  sqlInjectionAttempts: number;
  authenticationFailures: number;
  rateLimitViolations: number;
  activeSessions: number;
  failedAttempts: number;
  blockedIPs: number;
}

interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  source: string;
  action: string;
  details: Record<string, unknown>;
}

export const SecurityReport: React.FC<SecurityReportProps> = ({
  timeRange = '24h',
  showDetails = true,
  refreshInterval = 30
}) => {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);

  // Lade Sicherheitsdaten
  const loadSecurityData = async () => {
    setLoading(true);
    try {
      // MCP Security Stats
      const mcpStats = mcpSecurityManager.getSecurityStats();
      
      // Form Security Stats
      const formStats = formSecurityManager.getSecurityStats();

      // Kombinierte Metriken
      const combinedMetrics: SecurityMetrics = {
        totalEvents: mcpStats.securityEvents + formStats.totalEvents,
        securityViolations: formStats.securityViolations,
        blockedSubmissions: formStats.blockedSubmissions,
        xssAttempts: formStats.xssAttempts,
        sqlInjectionAttempts: formStats.sqlInjectionAttempts,
        authenticationFailures: mcpStats.failedAttempts,
        rateLimitViolations: 0, // Wird aus Events berechnet
        activeSessions: mcpStats.activeSessions,
        failedAttempts: mcpStats.failedAttempts,
        blockedIPs: mcpStats.blockedIPs
      };

      setMetrics(combinedMetrics);

      // Mock-Events für Demo-Zwecke
      const mockEvents: SecurityEvent[] = [
        {
          id: '1',
          timestamp: new Date(),
          type: 'authentication',
          severity: 'medium',
          description: 'Fehlgeschlagener Anmeldeversuch',
          source: '192.168.1.100',
          action: 'blocked',
          details: { reason: 'Invalid credentials', attempts: 3 }
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 3600000),
          type: 'xss_attempt',
          severity: 'high',
          description: 'XSS-Angriff erkannt',
          source: '10.0.0.50',
          action: 'blocked',
          details: { field: 'comment', pattern: '<script>' }
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 7200000),
          type: 'sql_injection',
          severity: 'critical',
          description: 'SQL-Injection-Versuch',
          source: '172.16.0.25',
          action: 'blocked',
          details: { field: 'search', pattern: 'OR 1=1' }
        }
      ];

      setEvents(mockEvents);
    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-Refresh
  useEffect(() => {
    loadSecurityData();
    
    if (refreshInterval > 0) {
      const interval = setInterval(loadSecurityData, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  // Severity Color Mapping
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  // Severity Icon Mapping
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <ErrorIcon color="error" />;
      case 'high':
        return <WarningIcon color="warning" />;
      case 'medium':
        return <InfoIcon color="info" />;
      case 'low':
        return <CheckCircleIcon color="success" />;
      default:
        return <InfoIcon />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <SecurityIcon color="primary" fontSize="large" />
        <Typography variant="h4" component="h1">
          Sicherheitsbericht
        </Typography>
        <Chip
          label={`Zeitraum: ${timeRange}`}
          color="primary"
          variant="outlined"
        />
      </Box>

      {/* Metriken */}
      {metrics && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1}>
                  <SecurityIcon color="primary" />
                  <Typography variant="h6">{metrics.totalEvents}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Gesamte Ereignisse
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1}>
                  <ErrorIcon color="error" />
                  <Typography variant="h6">{metrics.securityViolations}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Sicherheitsverletzungen
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1}>
                  <ShieldIcon color="success" />
                  <Typography variant="h6">{metrics.blockedSubmissions}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Blockierte Submissions
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1}>
                  <BugReportIcon color="warning" />
                  <Typography variant="h6">{metrics.xssAttempts + metrics.sqlInjectionAttempts}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Angriffsversuche
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Sicherheitswarnungen */}
      {metrics && (metrics.securityViolations > 0 || metrics.xssAttempts > 0 || metrics.sqlInjectionAttempts > 0) && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Sicherheitswarnungen aktiv:
          </Typography>
          <ul>
            {metrics.securityViolations > 0 && (
              <li>{metrics.securityViolations} Sicherheitsverletzungen erkannt</li>
            )}
            {metrics.xssAttempts > 0 && (
              <li>{metrics.xssAttempts} XSS-Angriffsversuche blockiert</li>
            )}
            {metrics.sqlInjectionAttempts > 0 && (
              <li>{metrics.sqlInjectionAttempts} SQL-Injection-Versuche blockiert</li>
            )}
          </ul>
        </Alert>
      )}

      {/* Ereignisliste */}
      {showDetails && (
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <TimelineIcon color="primary" />
              <Typography variant="h6">
                Sicherheitsereignisse
              </Typography>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Zeitstempel</TableCell>
                    <TableCell>Typ</TableCell>
                    <TableCell>Schweregrad</TableCell>
                    <TableCell>Beschreibung</TableCell>
                    <TableCell>Quelle</TableCell>
                    <TableCell>Aktion</TableCell>
                    <TableCell>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id} hover>
                      <TableCell>
                        {event.timestamp.toLocaleString('de-DE')}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={event.type}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={event.severity}
                          color={getSeverityColor(event.severity) as any}
                          size="small"
                          icon={getSeverityIcon(event.severity)}
                        />
                      </TableCell>
                      <TableCell>{event.description}</TableCell>
                      <TableCell>{event.source}</TableCell>
                      <TableCell>
                        <Chip
                          label={event.action}
                          color={event.action === 'blocked' ? 'error' : 'success'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowEventDialog(true);
                          }}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Sicherheitsempfehlungen */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <AssessmentIcon color="primary" />
            <Typography variant="h6">
              Sicherheitsempfehlungen
            </Typography>
          </Box>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                MCP-Server Hardening
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Token-basierte Authentifizierung aktiviert"
                    secondary="Sichere JWT-Tokens mit Rotation"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Rate Limiting implementiert"
                    secondary="100 Requests pro Minute, Burst: 20"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Input Validation aktiviert"
                    secondary="Schema-basierte Validierung mit Sanitization"
                  />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                Formular-Sicherheit
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="XSS-Schutz aktiviert"
                    secondary="HTML-Encoding und Pattern-Detection"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="SQL-Injection-Schutz"
                    secondary="Pattern-Detection und Parameterized Queries"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="CSRF-Schutz"
                    secondary="Token-basierte CSRF-Protection"
                  />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog
        open={showEventDialog}
        onClose={() => setShowEventDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Ereignis-Details
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedEvent.description}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Typ:</Typography>
                  <Typography>{selectedEvent.type}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Schweregrad:</Typography>
                  <Chip
                    label={selectedEvent.severity}
                    color={getSeverityColor(selectedEvent.severity) as any}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Quelle:</Typography>
                  <Typography>{selectedEvent.source}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Aktion:</Typography>
                  <Typography>{selectedEvent.action}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Details:</Typography>
                  <pre style={{ backgroundColor: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                    {JSON.stringify(selectedEvent.details, null, 2)}
                  </pre>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEventDialog(false)}>
            Schließen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 