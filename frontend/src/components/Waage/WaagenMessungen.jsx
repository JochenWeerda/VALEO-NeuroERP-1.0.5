import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardHeader, 
  CardContent, 
  Typography, 
  CircularProgress,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import api from '../../services/api';

const WaagenMessungen = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messungen, setMessungen] = useState([]);
  const [selectedMessung, setSelectedMessung] = useState(null);
  const [stornierungOpen, setStornierungOpen] = useState(false);
  const [stornierungsGrund, setStornierungsGrund] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedWaage, setSelectedWaage] = useState('');
  const [waagen, setWaagen] = useState([]);

  const fetchWaagen = () => {
    // Simulierte API-Anfrage für Waagen
    setTimeout(() => {
      setWaagen([
        { id: 1, name: 'Waage 1' },
        { id: 2, name: 'Waage 2' },
        { id: 3, name: 'Waage 3' },
      ]);
    }, 500);
  };

  const fetchMessungen = async () => {
    setLoading(true);
    try {
      const url = statusFilter 
        ? `/api/v1/waage/messungen/?status=${statusFilter}` 
        : '/api/v1/waage/messungen/';
      const response = await api.get(url);
      setMessungen(response.data);
      setError(null);
    } catch (err) {
      setError('Fehler beim Abrufen der Waagemessungen. Bitte versuchen Sie es später erneut.');
      console.error('Waagemessungen Fehler:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaagen();
    fetchMessungen();
  }, []);

  useEffect(() => {
    fetchMessungen();
  }, [statusFilter]);

  const handleWaageChange = (event) => {
    setSelectedWaage(event.target.value);
  };

  const handleStornieren = async () => {
    if (!selectedMessung || !stornierungsGrund.trim()) return;
    
    try {
      await api.put(`/api/v1/waage/messungen/${selectedMessung.id}/stornieren`, {
        grund: stornierungsGrund
      });
      setStornierungOpen(false);
      setStornierungsGrund('');
      fetchMessungen();
    } catch (err) {
      setError('Fehler beim Stornieren der Messung. Bitte versuchen Sie es später erneut.');
      console.error('Stornierung Fehler:', err);
    }
  };

  const handleVerarbeiten = async (messung) => {
    try {
      await api.put(`/api/v1/waage/messungen/${messung.id}/verarbeiten`);
      fetchMessungen();
    } catch (err) {
      setError('Fehler beim Verarbeiten der Messung. Bitte versuchen Sie es später erneut.');
      console.error('Verarbeitung Fehler:', err);
    }
  };

  const openStornierungDialog = (messung) => {
    setSelectedMessung(messung);
    setStornierungOpen(true);
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'neu':
        return <Chip icon={<PendingIcon />} label="Neu" color="primary" />;
      case 'verarbeitet':
        return <Chip icon={<CheckCircleIcon />} label="Verarbeitet" color="success" />;
      case 'storniert':
        return <Chip icon={<CancelIcon />} label="Storniert" color="error" />;
      default:
        return <Chip label={status} />;
    }
  };

  if (loading && messungen.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card>
      <CardHeader 
        title="Waagen Messungen" 
        action={
          <Box display="flex" alignItems="center">
            <FormControl variant="outlined" size="small" sx={{ mr: 2, minWidth: 120 }}>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="">Alle</MenuItem>
                <MenuItem value="neu">Neu</MenuItem>
                <MenuItem value="verarbeitet">Verarbeitet</MenuItem>
                <MenuItem value="storniert">Storniert</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchMessungen}
            >
              Aktualisieren
            </Button>
          </Box>
        }
      />
      <CardContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box mb={3}>
          <FormControl fullWidth>
            <InputLabel id="waage-select-label">Waage auswählen</InputLabel>
            <Select
              labelId="waage-select-label"
              value={selectedWaage}
              label="Waage auswählen"
              onChange={handleWaageChange}
            >
              <MenuItem value="">
                <em>Alle Waagen</em>
              </MenuItem>
              {waagen.map((waage) => (
                <MenuItem key={waage.id} value={waage.id}>
                  {waage.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Zeitstempel</TableCell>
                <TableCell>Waage</TableCell>
                <TableCell>Gewicht</TableCell>
                <TableCell>Beleg/Kunde</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {messungen.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Keine Messungen gefunden
                  </TableCell>
                </TableRow>
              ) : (
                messungen.map((messung) => (
                  <TableRow key={messung.id}>
                    <TableCell>{messung.id}</TableCell>
                    <TableCell>{new Date(messung.zeitstempel).toLocaleString()}</TableCell>
                    <TableCell>{messung.waage_id}</TableCell>
                    <TableCell>{messung.gewicht} kg</TableCell>
                    <TableCell>
                      {messung.belegnr && <Typography variant="body2">Beleg: {messung.belegnr}</Typography>}
                      {messung.kundennr && <Typography variant="body2">Kunde: {messung.kundennr}</Typography>}
                    </TableCell>
                    <TableCell>{getStatusChip(messung.status)}</TableCell>
                    <TableCell>
                      {messung.status === 'neu' && (
                        <>
                          <Button 
                            size="small" 
                            variant="contained" 
                            color="primary"
                            onClick={() => handleVerarbeiten(messung)}
                            sx={{ mr: 1 }}
                          >
                            Verarbeiten
                          </Button>
                          <Button 
                            size="small" 
                            variant="outlined" 
                            color="error"
                            onClick={() => openStornierungDialog(messung)}
                          >
                            Stornieren
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>

      {/* Stornierung Dialog */}
      <Dialog open={stornierungOpen} onClose={() => setStornierungOpen(false)}>
        <DialogTitle>Messung stornieren</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Möchten Sie die Messung #{selectedMessung?.id} wirklich stornieren?
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Stornierungsgrund"
            fullWidth
            variant="outlined"
            value={stornierungsGrund}
            onChange={(e) => setStornierungsGrund(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStornierungOpen(false)}>Abbrechen</Button>
          <Button 
            onClick={handleStornieren} 
            color="error"
            disabled={!stornierungsGrund.trim()}
          >
            Stornieren
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default WaagenMessungen; 