import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from '@mui/material';
import {
  QrCodeScanner as QrCodeScannerIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import ChargenScanner from '../Mobile/ChargenScanner';
import { ChargeDetails } from '../../services/chargenService';

interface WareneingangScannerProps {
  onChargenSelected: (chargen: ChargeDetails[]) => void;
  artikelId?: string;
  artikelBezeichnung?: string;
  benoetigteMenge?: number;
  onCancel: () => void;
}

const WareneingangScanner: React.FC<WareneingangScannerProps> = ({
  onChargenSelected,
  artikelId,
  artikelBezeichnung,
  benoetigteMenge,
  onCancel
}) => {
  const [selectedChargen, setSelectedChargen] = useState<ChargeDetails[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Callback für den ChargenScanner
  const handleChargeSelected = (chargeData: ChargeDetails[]) => {
    setSelectedChargen(chargeData);
    setSuccess(`${chargeData.length} Charge(n) erfolgreich ausgewählt`);
  };

  // Übernahme der gescannten Chargen in das Formular
  const handleSave = () => {
    if (selectedChargen.length === 0) {
      setError('Bitte wählen Sie mindestens eine Charge aus');
      return;
    }
    
    onChargenSelected(selectedChargen);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton edge="start" onClick={onCancel}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Chargen für Wareneingang scannen
        </Typography>
      </Box>

      {/* Artikel-Informationen */}
      {artikelBezeichnung && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Artikel: {artikelBezeichnung}
          </Typography>
          {benoetigteMenge && (
            <Typography variant="body2">
              Benötigte Menge: {benoetigteMenge}
            </Typography>
          )}
        </Paper>
      )}

      {/* Fehler und Erfolg Meldungen */}
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError(null)} 
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert 
          severity="success" 
          onClose={() => setSuccess(null)} 
          sx={{ mb: 2 }}
        >
          {success}
        </Alert>
      )}

      {/* ChargenScanner-Komponente */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <ChargenScanner
          modus="wareneingang"
          onChargeSelected={handleChargeSelected}
          artikelId={artikelId}
          benötigteMenge={benoetigteMenge}
        />
      </Paper>

      {/* Aktionsbuttons */}
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Button
            variant="outlined"
            fullWidth
            onClick={onCancel}
            startIcon={<ArrowBackIcon />}
          >
            Abbrechen
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSave}
            startIcon={<SaveIcon />}
            disabled={selectedChargen.length === 0}
          >
            Übernehmen
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WareneingangScanner; 