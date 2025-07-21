import React, { useState } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  TextField, 
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { 
  PhoneAndroid as PhoneAndroidIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon
} from '@mui/icons-material';
import { useAgentApi } from '../../../hooks/useAgentApi';
import type { MobileTour } from '../types/WarenwirtschaftTypes';

const L3App: React.FC = () => {
  const [touren, setTouren] = useState<MobileTour[]>([]);
  const [selectedTour, setSelectedTour] = useState<MobileTour | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'view'>('create');
  const { getAgentSuggestions } = useAgentApi();

  // Formular-State für neue Tour
  const [formData, setFormData] = useState({
    tournummer: '',
    kommissioniererId: '',
    kommissioniererName: '',
    geraetId: '',
    startdatum: new Date().toISOString().split('T')[0]
  });

  const handleCreateTour = () => {
    setDialogMode('create');
    setFormData({
      tournummer: `TOUR-${new Date().getFullYear()}-${String(touren.length + 1).padStart(3, '0')}`,
      kommissioniererId: '',
      kommissioniererName: '',
      geraetId: '',
      startdatum: new Date().toISOString().split('T')[0]
    });
    setOpenDialog(true);
  };

  const handleViewTour = (tour: MobileTour) => {
    setDialogMode('view');
    setSelectedTour(tour);
    setOpenDialog(true);
  };

  const handleStartTour = async (tourId: string) => {
    setTouren(touren.map(t => 
      t.id === tourId 
        ? { ...t, status: 'aktiv', startdatum: new Date() }
        : t
    ));
    
    const suggestions = await getAgentSuggestions(
      'L3-App Tour starten: Tour ' + tourId + ' wurde gestartet. Kommissionierer beginnt mit der Arbeit.'
    );
    
    console.log('Agent-Vorschläge für Tour-Start:', suggestions);
  };

  const handleCompleteTour = async (tourId: string) => {
    setTouren(touren.map(t => 
      t.id === tourId 
        ? { ...t, status: 'abgeschlossen', enddatum: new Date() }
        : t
    ));
    
    const suggestions = await getAgentSuggestions(
      'L3-App Tour abschließen: Tour ' + tourId + ' wurde abgeschlossen. Alle Positionen wurden kommissioniert.'
    );
    
    console.log('Agent-Vorschläge für Tour-Abschluss:', suggestions);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'geplant': return 'default';
      case 'aktiv': return 'primary';
      case 'abgeschlossen': return 'success';
      case 'storniert': return 'error';
      default: return 'default';
    }
  };

  const getProgressPercentage = (tour: MobileTour) => {
    if (tour.positionen.length === 0) return 0;
    const scannedCount = tour.positionen.filter(p => p.gescannt).length;
    return Math.round((scannedCount / tour.positionen.length) * 100);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'geplant': return <PlayArrowIcon />;
      case 'aktiv': return <PlayArrowIcon />;
      case 'abgeschlossen': return <CheckCircleIcon />;
      case 'storniert': return <StopIcon />;
      default: return <PlayArrowIcon />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Typography variant="h4" className="text-gray-800 font-bold flex items-center gap-2">
            <PhoneAndroidIcon className="text-blue-600" />
            L3-App: Mobile Kommissionierung
          </Typography>
          <Typography variant="subtitle1" className="text-gray-600">
            Kommissionierung einfach mobil - Scan-Daten direkt mit Warenwirtschaft vernetzt
          </Typography>
        </div>
      </div>

      {/* L3-App-spezifische Info */}
      <Alert severity="info">
        <Typography variant="body1" className="font-medium">
          L3-App - Smarte Kommissionierung
        </Typography>
        <Typography variant="body2">
          Ihre Kommissionierer erhalten schnell eine Übersicht über anstehende Touren. 
          Doppelkommissionierungen werden von vornherein ausgeschlossen. 
          Scan-Daten werden direkt mit dem Warenwirtschaftssystem vernetzt.
        </Typography>
      </Alert>

      {/* Statistik-Karten */}
      <Card className="mb-6">
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <PlayArrowIcon className="text-blue-600 text-3xl mb-2" />
            <Typography variant="h6" className="text-blue-800">Aktiv</Typography>
            <Typography variant="h4" className="text-blue-600">
              {touren.filter(t => t.status === 'aktiv').length}
            </Typography>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <StopIcon className="text-red-600 text-3xl mb-2" />
            <Typography variant="h6" className="text-red-800">Storniert</Typography>
            <Typography variant="h4" className="text-red-600">
              {touren.filter(t => t.status === 'storniert').length}
            </Typography>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CheckCircleIcon className="text-green-600 text-3xl mb-2" />
            <Typography variant="h6" className="text-green-800">Abgeschlossen</Typography>
            <Typography variant="h4" className="text-green-600">
              {touren.filter(t => t.status === 'abgeschlossen').length}
            </Typography>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <PlayArrowIcon className="text-orange-600 text-3xl mb-2" />
            <Typography variant="h6" className="text-orange-800">Geplant</Typography>
            <Typography variant="h4" className="text-orange-600">
              {touren.filter(t => t.status === 'geplant').length}
            </Typography>
          </div>
        </div>
      </Card>

      {/* Aktionen */}
      <div className="flex gap-4">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateTour}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Neue Tour erstellen
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
        >
          App-Daten synchronisieren
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
        >
          Tour-Daten exportieren
        </Button>
      </div>

      {/* Touren-Tabelle */}
      <Card>
        <div className="p-6">
          <Typography variant="h6" className="text-gray-800 mb-4">
            Kommissionierungstouren
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow className="bg-gray-50">
                  <TableCell className="font-semibold">Tournummer</TableCell>
                  <TableCell className="font-semibold">Kommissionierer</TableCell>
                  <TableCell className="font-semibold">Gerät</TableCell>
                  <TableCell className="font-semibold">Status</TableCell>
                  <TableCell className="font-semibold">Fortschritt</TableCell>
                  <TableCell className="font-semibold">Positionen</TableCell>
                  <TableCell className="font-semibold">Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {touren.map((tour) => (
                  <TableRow key={tour.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Typography variant="body1" className="font-medium">
                        {tour.tournummer}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div>
                          <Typography variant="body2" className="font-medium">
                            {tour.kommissioniererName}
                          </Typography>
                          <Typography variant="body2" className="text-gray-600 text-xs">
                            {tour.kommissioniererId}
                          </Typography>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <PhoneAndroidIcon className="text-blue-600" />
                        <Typography variant="body2">{tour.geraetId}</Typography>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={tour.status}
                        color={getStatusColor(tour.status) as any}
                        size="small"
                        icon={getStatusIcon(tour.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="w-full">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>{getProgressPercentage(tour)}%</span>
                          <span>{tour.positionen.filter(p => p.gescannt).length}/{tour.positionen.length}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {tour.positionen.length} Artikel
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewTour(tour)}
                          className="text-blue-600"
                        >
                          <AddIcon />
                        </IconButton>
                        {tour.status === 'geplant' && (
                          <IconButton 
                            size="small" 
                            onClick={() => handleStartTour(tour.id)}
                            className="text-green-600"
                          >
                            <PlayArrowIcon />
                          </IconButton>
                        )}
                        {tour.status === 'aktiv' && (
                          <IconButton 
                            size="small" 
                            onClick={() => handleCompleteTour(tour.id)}
                            className="text-orange-600"
                          >
                            <StopIcon />
                          </IconButton>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </Card>

      {/* Dialog für Tour Details */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Neue Tour erstellen' : `Tour: ${selectedTour?.tournummer}`}
        </DialogTitle>
        <DialogContent>
          {dialogMode === 'create' ? (
            <div className="space-y-4">
              <TextField
                fullWidth
                label="Tournummer"
                value={formData.tournummer}
                onChange={(e) => setFormData({...formData, tournummer: e.target.value})}
              />
              <TextField
                fullWidth
                label="Kommissionierer ID"
                value={formData.kommissioniererId}
                onChange={(e) => setFormData({...formData, kommissioniererId: e.target.value})}
              />
              <TextField
                fullWidth
                label="Kommissionierer Name"
                value={formData.kommissioniererName}
                onChange={(e) => setFormData({...formData, kommissioniererName: e.target.value})}
              />
              <TextField
                fullWidth
                label="Gerät ID"
                value={formData.geraetId}
                onChange={(e) => setFormData({...formData, geraetId: e.target.value})}
              />
              <TextField
                fullWidth
                type="date"
                label="Startdatum"
                value={formData.startdatum}
                onChange={(e) => setFormData({...formData, startdatum: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Typography variant="subtitle2" className="text-gray-600">Tournummer</Typography>
                  <Typography variant="body1">{selectedTour?.tournummer}</Typography>
                </div>
                <div>
                  <Typography variant="subtitle2" className="text-gray-600">Status</Typography>
                  <Chip 
                    label={selectedTour?.status}
                    color={getStatusColor(selectedTour?.status || '') as any}
                    size="small"
                  />
                </div>
                <div>
                  <Typography variant="subtitle2" className="text-gray-600">Kommissionierer</Typography>
                  <Typography variant="body1">{selectedTour?.kommissioniererName}</Typography>
                </div>
                <div>
                  <Typography variant="subtitle2" className="text-gray-600">Gerät</Typography>
                  <Typography variant="body1">{selectedTour?.geraetId}</Typography>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Typography variant="subtitle2" className="text-gray-600">Startdatum</Typography>
                  <Typography variant="body1">
                    {selectedTour?.startdatum.toLocaleString('de-DE')}
                  </Typography>
                </div>
                <div>
                  <Typography variant="subtitle2" className="text-gray-600">Enddatum</Typography>
                  <Typography variant="body1">
                    {selectedTour?.enddatum ? selectedTour.enddatum.toLocaleString('de-DE') : 'Nicht beendet'}
                  </Typography>
                </div>
              </div>
              
              <Typography variant="h6">Positionen</Typography>
              {selectedTour?.positionen.map((position, index) => (
                <div key={index} className="border rounded p-3 mb-2 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {position.gescannt ? (
                      <CheckCircleIcon className="text-green-600" />
                    ) : (
                      <PlayArrowIcon className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <Typography variant="body2">{position.artikelName}</Typography>
                    <Typography variant="body2" className="text-gray-600 text-xs">
                      Menge: {position.menge} | Lagerplatz: {position.lagerplatz}
                      {position.gescannt && position.scanDatum && (
                        ` | Gescannt: ${position.scanDatum.toLocaleString('de-DE')}`
                      )}
                    </Typography>
                  </div>
                  {selectedTour.status === 'aktiv' && !position.gescannt && (
                    <IconButton
                      size="small"
                      className="text-blue-600"
                    >
                      <PlayArrowIcon />
                    </IconButton>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Schließen</Button>
          {dialogMode === 'create' && (
            <Button variant="contained" color="primary">
              Tour erstellen
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default L3App; 