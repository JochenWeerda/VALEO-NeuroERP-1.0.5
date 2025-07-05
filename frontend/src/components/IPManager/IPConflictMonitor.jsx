import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Chip,
  Alert,
  AlertTitle,
  LinearProgress,
  Tooltip,
  useTheme
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import BuildIcon from '@mui/icons-material/Build';
import IconSet from '../IconSet';

/**
 * IP-Konflikt-Monitor-Komponente
 * 
 * Überwacht und zeigt aktuelle IP-Adress- und Portkonflikte im System an.
 * Bietet Lösungsmöglichkeiten für erkannte Konflikte.
 */
const IPConflictMonitor = () => {
  const theme = useTheme();
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock-Daten für Konflikte
  const mockConflicts = [
    {
      id: 'conflict-001',
      type: 'port_conflict',
      severity: 'high',
      timestamp: '2025-05-28T10:15:32',
      description: 'Port 8080 wird von mehreren Services beansprucht',
      services: [
        { service_id: 'api-gateway_win10-dev', service_name: 'API-Gateway', port: 8080 },
        { service_id: 'external-service', service_name: 'Externer Service', port: 8080 }
      ],
      resolution_suggestions: [
        'API-Gateway auf anderen Port umleiten',
        'Externen Service beenden'
      ]
    },
    {
      id: 'conflict-002',
      type: 'port_unavailable',
      severity: 'medium',
      timestamp: '2025-05-28T11:45:20',
      description: 'Bevorzugter Port 3000 ist nicht verfügbar',
      services: [
        { service_id: 'frontend-dev-server', service_name: 'Frontend Dev Server', port: 3000 }
      ],
      resolution_suggestions: [
        'Port 3001 als Alternative verwenden',
        'Prozess auf Port 3000 identifizieren und beenden'
      ]
    },
    {
      id: 'conflict-003',
      type: 'address_unreachable',
      severity: 'low',
      timestamp: '2025-05-28T09:12:05',
      description: 'IP-Adresse 192.168.1.100 ist nicht erreichbar',
      services: [
        { service_id: 'database-service', service_name: 'Datenbank-Service', ip: '192.168.1.100', port: 5432 }
      ],
      resolution_suggestions: [
        'Netzwerkverbindung prüfen',
        'Firewall-Einstellungen überprüfen'
      ]
    }
  ];

  // Daten laden
  useEffect(() => {
    // Hier würde eigentlich ein API-Call zum IP-Manager stehen
    // z.B. fetch('http://localhost:8020/conflicts')
    
    // Simuliere einen API-Call mit Dummy-Daten
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simuliere Netzwerkverzögerung
        await new Promise(resolve => setTimeout(resolve, 1000));
        setConflicts(mockConflicts);
        setLoading(false);
      } catch (err) {
        setError('Fehler beim Laden der Konfliktdaten');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Konflikt beheben
  const handleResolveConflict = (conflictId, solutionIndex) => {
    console.log(`Konflikt ${conflictId} wird mit Lösung ${solutionIndex} behoben...`);
    // Hier würde ein API-Call an den IP-Manager gemacht werden
    // z.B. fetch(`http://localhost:8020/conflicts/${conflictId}/resolve`, { 
    //   method: 'POST',
    //   headers: {'Content-Type': 'application/json'},
    //   body: JSON.stringify({ solution_index: solutionIndex })
    // })
    
    // Optimistisches UI-Update - Konflikt entfernen
    setConflicts(conflicts.filter(conflict => conflict.id !== conflictId));
  };

  // Daten aktualisieren
  const handleRefresh = () => {
    setLoading(true);
    // Simuliere Netzwerkverzögerung
    setTimeout(() => {
      setConflicts(mockConflicts);
      setLoading(false);
    }, 800);
  };

  // Render Severity-Chip
  const renderSeverityChip = (severity) => {
    const severityConfig = {
      high: { color: 'error', label: 'Hoch', icon: <ErrorIcon fontSize="small" /> },
      medium: { color: 'warning', label: 'Mittel', icon: <WarningIcon fontSize="small" /> },
      low: { color: 'info', label: 'Niedrig', icon: <IconSet icon="info" size="small" /> }
    };
    
    const config = severityConfig[severity] || { color: 'default', label: severity };
    
    return (
      <Chip 
        size="small" 
        color={config.color} 
        label={config.label}
        icon={config.icon}
      />
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          <IconSet icon="error_outline" sx={{ verticalAlign: 'middle', mr: 1 }} />
          IP-Konflikt-Monitor
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />} 
          onClick={handleRefresh}
          disabled={loading}
          size="small"
        >
          Aktualisieren
        </Button>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Fehler</AlertTitle>
          {error}
        </Alert>
      )}

      {!loading && !error && conflicts.length === 0 && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Keine IP- oder Portkonflikte erkannt. Das System läuft optimal.
        </Alert>
      )}

      {!loading && !error && conflicts.length > 0 && (
        <>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <AlertTitle>Achtung</AlertTitle>
            Es wurden {conflicts.length} potentielle Konflikte erkannt, die behoben werden sollten.
          </Alert>
          
          {conflicts.map((conflict) => (
            <Card key={conflict.id} sx={{ mb: 2, border: `1px solid ${theme.palette.divider}` }}>
              <CardHeader 
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1">{conflict.description}</Typography>
                    {renderSeverityChip(conflict.severity)}
                  </Box>
                }
                subheader={`Erkannt am ${new Date(conflict.timestamp).toLocaleString()}`}
                sx={{ 
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  borderBottom: `1px solid ${theme.palette.divider}`
                }}
              />
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Betroffene Services:
                </Typography>
                <List dense>
                  {conflict.services.map((service) => (
                    <ListItem key={service.service_id}>
                      <ListItemIcon>
                        <IconSet icon="dns" />
                      </ListItemIcon>
                      <ListItemText
                        primary={service.service_name}
                        secondary={`${service.ip || '127.0.0.1'}:${service.port}`}
                      />
                    </ListItem>
                  ))}
                </List>
                
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  Lösungsvorschläge:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {conflict.resolution_suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outlined"
                      size="small"
                      startIcon={<BuildIcon />}
                      onClick={() => handleResolveConflict(conflict.id, index)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </Box>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </Box>
  );
};

export default IPConflictMonitor; 