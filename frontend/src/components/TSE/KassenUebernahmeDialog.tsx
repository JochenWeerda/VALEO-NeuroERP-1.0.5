import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Divider,
  Alert,
  IconButton,
  LinearProgress,
  Grid,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Database as DatabaseIcon,
  Info as InfoIcon
} from '@mui/icons-material';

interface KassenUebernahmeDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (selectedDatabases: string[]) => Promise<void>;
}

const KassenUebernahmeDialog: React.FC<KassenUebernahmeDialogProps> = ({ 
  open, 
  onClose, 
  onImport 
}) => {
  const [selectedDatabases, setSelectedDatabases] = useState<{[key: string]: boolean}>({
    'UM.db': true,
    'UEZ.db': true,
    'UL.db': true,
    'EA.db': true,
    'SE.db': true,
    'GU.db': true
  });
  
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);
  
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDatabases({
      ...selectedDatabases,
      [event.target.name]: event.target.checked
    });
  };
  
  const handleImport = async () => {
    setIsImporting(true);
    setImportError(null);
    setImportSuccess(false);
    
    try {
      // Filtere ausgewählte Datenbanken
      const databasesToImport = Object.keys(selectedDatabases).filter(
        db => selectedDatabases[db]
      );
      
      if (databasesToImport.length === 0) {
        setImportError("Bitte wählen Sie mindestens eine Datenbank aus.");
        setIsImporting(false);
        return;
      }
      
      // Führe den Import durch
      await onImport(databasesToImport);
      
      // Bei Erfolg
      setImportSuccess(true);
      
      // Nach erfolgreichem Import Dialog nach 2 Sekunden schließen
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Fehler beim Import:", error);
      setImportError("Der Import konnte nicht durchgeführt werden. Bitte überprüfen Sie die Verbindung und versuchen Sie es erneut.");
    } finally {
      setIsImporting(false);
    }
  };
  
  const getDatabaseLabel = (dbName: string): string => {
    switch(dbName) {
      case 'UM.db': return 'Artikel-Umsätze komprimiert';
      case 'UEZ.db': return 'Artikel-Umsätze einzeln';
      case 'UL.db': return 'Umsätze aus Lieferscheinen';
      case 'EA.db': return 'Einnahmen / Ausgaben';
      case 'SE.db': return 'Serien-Nummern';
      case 'GU.db': return 'Gutscheine';
      default: return dbName;
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={isImporting ? undefined : onClose}
      fullWidth 
      maxWidth="sm"
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Übernahme von Laden Kasse (SQLite)</Typography>
          {!isImporting && (
            <IconButton edge="end" onClick={onClose} aria-label="schließen">
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {importError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {importError}
          </Alert>
        )}
        
        {importSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Daten wurden erfolgreich importiert.
          </Alert>
        )}
        
        {isImporting && (
          <Box sx={{ width: '100%', mb: 2 }}>
            <LinearProgress />
            <Typography variant="body2" align="center" sx={{ mt: 1 }}>
              Import läuft... Bitte warten.
            </Typography>
          </Box>
        )}
        
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <DatabaseIcon sx={{ mr: 1 }} /> 
            Zu importierende Datenbanken
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <FormGroup>
            {Object.keys(selectedDatabases).map((dbName) => (
              <FormControlLabel
                key={dbName}
                control={
                  <Checkbox
                    checked={selectedDatabases[dbName]}
                    onChange={handleCheckboxChange}
                    name={dbName}
                    disabled={isImporting}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography>
                      {getDatabaseLabel(dbName)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      ({dbName})
                    </Typography>
                  </Box>
                }
              />
            ))}
          </FormGroup>
        </Paper>
        
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Alert severity="info" icon={<InfoIcon />}>
              Die markierten Datenbanken werden aus der Laden-Kasse importiert und in das ERP-System übernommen.
            </Alert>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={onClose} 
          disabled={isImporting}
        >
          Abbrechen
        </Button>
        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
          onClick={handleImport}
          disabled={isImporting || Object.values(selectedDatabases).every(v => !v)}
          color="primary"
        >
          Daten importieren
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default KassenUebernahmeDialog; 