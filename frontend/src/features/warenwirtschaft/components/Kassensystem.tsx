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
  PointOfSale as PointOfSaleIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useAgentApi } from '../../../hooks/useAgentApi';
import type { Kassensystem } from '../types/WarenwirtschaftTypes';

const Kassensystem: React.FC = () => {
  const [kassen] = useState<Kassensystem[]>([
    {
      id: '1',
      kassenId: 'KASSE-001',
      name: 'Hauptkasse',
      status: 'aktiv',
      tseAktiv: true,
      letzterTest: new Date(),
      tagesumsatz: 1250.50,
      transaktionen: 45,
      fehler: 0,
      compliance: 'konform'
    },
    {
      id: '2',
      kassenId: 'KASSE-002',
      name: 'Nebenkasse',
      status: 'aktiv',
      tseAktiv: true,
      letzterTest: new Date(),
      tagesumsatz: 890.30,
      transaktionen: 32,
      fehler: 1,
      compliance: 'warnung'
    }
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    kassenId: '',
    name: '',
    tseAktiv: false
  });

  const { getAgentSuggestions } = useAgentApi();

  const handleCreateKasse = () => {
    setFormData({
      kassenId: `KASSE-${String(kassen.length + 1).padStart(3, '0')}`,
      name: '',
      tseAktiv: false
    });
    setOpenDialog(true);
  };

  const handleTseTest = async (kasseId: string) => {
    console.log('TSE-Test für Kasse:', kasseId);
    
    const suggestions = await getAgentSuggestions(
      'Kassensystem TSE-Test: Kasse ' + kasseId + ' wird getestet. TSE-Signatur wird validiert.'
    );
    
    console.log('Agent-Vorschläge für TSE-Test:', suggestions);
  };

  const handleTagesabschluss = async (kasseId: string) => {
    console.log('Tagesabschluss für Kasse:', kasseId);
    
    const suggestions = await getAgentSuggestions(
      'Kassensystem Tagesabschluss: Kasse ' + kasseId + ' wird abgeschlossen. Tagesumsatz wird berechnet.'
    );
    
    console.log('Agent-Vorschläge für Tagesabschluss:', suggestions);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aktiv': return 'success';
      case 'inaktiv': return 'default';
      case 'wartung': return 'warning';
      default: return 'default';
    }
  };

  const getComplianceColor = (compliance: string) => {
    switch (compliance) {
      case 'konform': return 'success';
      case 'warnung': return 'warning';
      case 'nicht_konform': return 'error';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Typography variant="h4" className="text-gray-800 font-bold flex items-center gap-2">
            <PointOfSaleIcon className="text-green-600" />
            Kassensystem (TSE)
          </Typography>
          <Typography variant="subtitle1" className="text-gray-600">
            Technische Sicherheitseinrichtung - Konforme Kassensysteme mit TSE-Integration
          </Typography>
        </div>
      </div>

      {/* TSE-Info */}
      <Alert severity="info">
        <Typography variant="body1" className="font-medium">
          TSE - Technische Sicherheitseinrichtung
        </Typography>
        <Typography variant="body2">
          Alle Kassensysteme sind mit einer TSE ausgestattet, die jede Transaktion 
          kryptographisch signiert und unveränderlich protokolliert. 
          Dies entspricht den gesetzlichen Anforderungen für Kassensysteme.
        </Typography>
      </Alert>

      {/* Statistik-Karten */}
      <Card className="mb-6">
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CheckCircleIcon className="text-green-600 text-3xl mb-2" />
            <Typography variant="h6" className="text-green-800">Aktiv</Typography>
            <Typography variant="h4" className="text-green-600">
              {kassen.filter(k => k.status === 'aktiv').length}
            </Typography>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <PointOfSaleIcon className="text-blue-600 text-3xl mb-2" />
            <Typography variant="h6" className="text-blue-800">TSE Aktiv</Typography>
            <Typography variant="h4" className="text-blue-600">
              {kassen.filter(k => k.tseAktiv).length}
            </Typography>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <WarningIcon className="text-orange-600 text-3xl mb-2" />
            <Typography variant="h6" className="text-orange-800">Warnungen</Typography>
            <Typography variant="h4" className="text-orange-600">
              {kassen.filter(k => k.compliance === 'warnung').length}
            </Typography>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <ErrorIcon className="text-red-600 text-3xl mb-2" />
            <Typography variant="h6" className="text-red-800">Fehler</Typography>
            <Typography variant="h4" className="text-red-600">
              {kassen.reduce((sum, k) => sum + k.fehler, 0)}
            </Typography>
          </div>
        </div>
      </Card>

      {/* Aktionen */}
      <div className="flex gap-4">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateKasse}
          className="bg-green-600 hover:bg-green-700"
        >
          Neue Kasse hinzufügen
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
        >
          TSE-Status prüfen
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
        >
          Alle Tagesabschlüsse
        </Button>
      </div>

      {/* Kassen-Tabelle */}
      <Card>
        <div className="p-6">
          <Typography variant="h6" className="text-gray-800 mb-4">
            Kassensysteme
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow className="bg-gray-50">
                  <TableCell className="font-semibold">Kassen-ID</TableCell>
                  <TableCell className="font-semibold">Name</TableCell>
                  <TableCell className="font-semibold">Status</TableCell>
                  <TableCell className="font-semibold">TSE</TableCell>
                  <TableCell className="font-semibold">Tagesumsatz</TableCell>
                  <TableCell className="font-semibold">Transaktionen</TableCell>
                  <TableCell className="font-semibold">Compliance</TableCell>
                  <TableCell className="font-semibold">Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {kassen.map((kasse) => (
                  <TableRow key={kasse.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Typography variant="body1" className="font-medium">
                        {kasse.kassenId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{kasse.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={kasse.status}
                        color={getStatusColor(kasse.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={kasse.tseAktiv ? 'Aktiv' : 'Inaktiv'}
                        color={kasse.tseAktiv ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {kasse.tagesumsatz.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{kasse.transaktionen}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={kasse.compliance}
                        color={getComplianceColor(kasse.compliance) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <IconButton 
                          size="small" 
                          onClick={() => handleTseTest(kasse.id)}
                          className="text-blue-600"
                        >
                          <RefreshIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleTagesabschluss(kasse.id)}
                          className="text-green-600"
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </Card>

      {/* Dialog für neue Kasse */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Neue Kasse hinzufügen</DialogTitle>
        <DialogContent>
          <div className="space-y-4 pt-4">
            <TextField
              fullWidth
              label="Kassen-ID"
              value={formData.kassenId}
              onChange={(e) => setFormData({...formData, kassenId: e.target.value})}
            />
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Abbrechen</Button>
          <Button variant="contained" color="primary">
            Kasse erstellen
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Kassensystem; 