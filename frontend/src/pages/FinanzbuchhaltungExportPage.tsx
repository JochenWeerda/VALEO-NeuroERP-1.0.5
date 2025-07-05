import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Chip,
  Stack
} from '@mui/material';
import {
  Download as DownloadIcon,
  History as HistoryIcon,
  AccountBalance as AccountBalanceIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Cloud as CloudIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import FinanzbuchhaltungExportDialog from '../components/finance/FinanzbuchhaltungExportDialog';
import financeExportService from '../services/financeExportService';

interface ExportHistoryItem {
  id: string;
  timestamp: string;
  system: 'datev' | 'sap' | 'lexware';
  status: 'success' | 'error' | 'processing';
  message: string;
  exportType: string;
  dateRange: string;
}

const FinanzbuchhaltungExportPage: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [exportHistory, setExportHistory] = useState<ExportHistoryItem[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Beispiel-Export-Historie
  useEffect(() => {
    // In einer realen Anwendung würde hier die Historie vom Server abgerufen
    setExportHistory([
      {
        id: 'exp-2024-123',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        system: 'datev',
        status: 'success',
        message: 'Export erfolgreich',
        exportType: 'Buchungen',
        dateRange: '01.04.2024 - 30.06.2024'
      },
      {
        id: 'exp-2024-122',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        system: 'sap',
        status: 'error',
        message: 'Verbindungsfehler',
        exportType: 'Finanzbuchhaltung (FI)',
        dateRange: '01.04.2024 - 30.06.2024'
      },
      {
        id: 'exp-2024-121',
        timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        system: 'datev',
        status: 'success',
        message: 'Export erfolgreich',
        exportType: 'Stammdaten',
        dateRange: '01.01.2024 - 31.03.2024'
      }
    ]);
    
    // Vorlagen laden
    setTemplates([
      { id: 1, name: 'DATEV Quartalsexport', system: 'datev', type: 'Buchungen' },
      { id: 2, name: 'SAP Monatsexport', system: 'sap', type: 'FI' },
      { id: 3, name: 'Lexware Standard', system: 'lexware', type: 'Buchungen' }
    ]);
  }, []);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const getSystemName = (system: string): string => {
    switch (system) {
      case 'datev': return 'DATEV';
      case 'sap': return 'SAP';
      case 'lexware': return 'Lexware';
      default: return system;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'processing':
        return <ScheduleIcon color="warning" />;
      default:
        return <InfoIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'processing': return 'warning';
      default: return 'info';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Übernahme in die Finanzbuchhaltung
        </Typography>
        <Typography variant="body1" paragraph>
          Exportieren Sie Ihre Daten in externe Finanzbuchhaltungssysteme wie DATEV, SAP oder Lexware.
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<DownloadIcon />}
          onClick={handleOpenDialog}
          sx={{ mb: 2 }}
        >
          Daten exportieren
        </Button>
      </Paper>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader 
              title="Export-Historie" 
              avatar={<HistoryIcon />}
            />
            <Divider />
            <CardContent>
              {exportHistory.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  Keine Export-Historie verfügbar
                </Typography>
              ) : (
                <List>
                  {exportHistory.map((item, index) => (
                    <ListItem key={index} alignItems="flex-start" divider={index < exportHistory.length - 1}>
                      <ListItemIcon>
                        {getStatusIcon(item.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Typography variant="subtitle1">
                              Export nach {getSystemName(item.system)}
                            </Typography>
                            <Chip 
                              label={item.status === 'success' ? 'Erfolgreich' : item.status === 'error' ? 'Fehler' : 'In Bearbeitung'} 
                              color={getStatusColor(item.status) as any}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="textSecondary">
                              Zeitraum: {item.dateRange}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Typ: {item.exportType}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Datum: {new Date(item.timestamp).toLocaleString()}
                            </Typography>
                            {item.status === 'error' && (
                              <Typography variant="body2" color="error">
                                Fehler: {item.message}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardHeader 
              title="Export-Vorlagen" 
              avatar={<CloudIcon />}
            />
            <Divider />
            <CardContent>
              <List dense>
                {templates.map((template) => (
                  <ListItem key={template.id} button>
                    <ListItemIcon>
                      <AccountBalanceIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={template.name}
                      secondary={`${getSystemName(template.system)} - ${template.type}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader 
              title="Informationen" 
              avatar={<InfoIcon />}
            />
            <Divider />
            <CardContent>
              <Alert severity="info" sx={{ mb: 2 }}>
                Die exportierten Daten können direkt in Ihr Finanzbuchhaltungssystem importiert werden.
              </Alert>
              
              <Typography variant="body2" paragraph>
                Unterstützte Formate:
              </Typography>
              
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip label="DATEV" color="primary" size="small" />
                <Chip label="SAP" color="primary" size="small" />
                <Chip label="Lexware" color="primary" size="small" />
              </Stack>
              
              <Typography variant="body2">
                Bei Fragen zum Export oder Import wenden Sie sich bitte an den Support.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <FinanzbuchhaltungExportDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
      />
    </Container>
  );
};

export default FinanzbuchhaltungExportPage; 