import React, { useState } from 'react';
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
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon,
  History as HistoryIcon,
  Storage as StorageIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { KassenUebernahmeDialog } from '../components/TSE';
import tseService from '../services/tseService';

interface ImportHistoryItem {
  timestamp: string;
  databases: string[];
  status: 'success' | 'error';
  message: string;
}

const KassenImportPage: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [importHistory, setImportHistory] = useState<ImportHistoryItem[]>([]);
  const [lastImportStatus, setLastImportStatus] = useState<'success' | 'error' | null>(null);
  const [lastImportMessage, setLastImportMessage] = useState<string>('');

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleImport = async (selectedDatabases: string[]) => {
    try {
      // Kassendaten importieren
      await tseService.importKassenDaten(selectedDatabases);
      
      // Erfolgsfall
      const successMessage = `${selectedDatabases.length} Datenbanken wurden erfolgreich importiert`;
      
      // Import-Historie aktualisieren
      const newHistoryItem: ImportHistoryItem = {
        timestamp: new Date().toISOString(),
        databases: selectedDatabases,
        status: 'success',
        message: successMessage
      };
      
      setImportHistory([newHistoryItem, ...importHistory]);
      setLastImportStatus('success');
      setLastImportMessage(successMessage);
      
      return Promise.resolve();
    } catch (error) {
      // Fehlerfall
      const errorMessage = 'Fehler beim Import der Kassendaten';
      
      // Import-Historie aktualisieren
      const newHistoryItem: ImportHistoryItem = {
        timestamp: new Date().toISOString(),
        databases: selectedDatabases,
        status: 'error',
        message: errorMessage
      };
      
      setImportHistory([newHistoryItem, ...importHistory]);
      setLastImportStatus('error');
      setLastImportMessage(errorMessage);
      
      return Promise.reject(error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Kassen-Datenübernahme
        </Typography>
        <Typography variant="body1" paragraph>
          Hier können Sie Daten aus der Laden-Kasse (SQLite) in das ERP-System importieren.
        </Typography>
        
        {lastImportStatus && (
          <Alert 
            severity={lastImportStatus} 
            sx={{ mb: 3 }}
            onClose={() => setLastImportStatus(null)}
          >
            {lastImportMessage}
          </Alert>
        )}
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<CloudUploadIcon />}
          onClick={handleOpenDialog}
          sx={{ mb: 2 }}
        >
          Kassen-Daten importieren
        </Button>
      </Paper>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Import-Historie" 
              avatar={<HistoryIcon />}
            />
            <Divider />
            <CardContent>
              {importHistory.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  Noch keine Importe durchgeführt
                </Typography>
              ) : (
                <List>
                  {importHistory.slice(0, 5).map((item, index) => (
                    <ListItem key={index} alignItems="flex-start">
                      <ListItemIcon>
                        {item.status === 'success' ? <CheckCircleIcon color="success" /> : <ErrorIcon color="error" />}
                      </ListItemIcon>
                      <ListItemText
                        primary={new Date(item.timestamp).toLocaleString()}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="textPrimary">
                              {item.message}
                            </Typography>
                            <br />
                            <Typography component="span" variant="body2" color="textSecondary">
                              Datenbanken: {item.databases.join(', ')}
                            </Typography>
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
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Informationen" 
              avatar={<InfoIcon />}
            />
            <Divider />
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Verfügbare Datenbanken:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><StorageIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Artikel-Umsätze komprimiert (UM.db)" 
                    secondary="Enthält zusammengefasste Artikelumsätze nach Datum" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><StorageIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Artikel-Umsätze einzeln (UEZ.db)" 
                    secondary="Enthält Einzelbuchungen aller Artikelumsätze" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><StorageIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Umsätze aus Lieferscheinen (UL.db)" 
                    secondary="Enthält Lieferschein-bezogene Umsatzdaten" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><StorageIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Einnahmen / Ausgaben (EA.db)" 
                    secondary="Enthält Zahlungsvorgänge und Kassenbuchungen" 
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <KassenUebernahmeDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onImport={handleImport}
      />
    </Container>
  );
};

export default KassenImportPage; 