import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Box,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Inventory as InventoryIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { BarcodeScanner } from '../barcode/BarcodeScanner';

interface StockOpnameItem {
  id: string;
  product_id: string;
  product_name: string;
  product_code: string;
  expected_quantity: number;
  actual_quantity: number;
  difference: number;
  unit: string;
  notes?: string;
}

interface StockOpname {
  id: string;
  number: string;
  date: string;
  status: 'offen' | 'in_bearbeitung' | 'abgeschlossen' | 'storniert';
  responsible_person: string;
  total_items: number;
  completed_items: number;
  created_at: string;
}

interface StockOpnameInterfaceProps {
  className?: string;
}

export const StockOpnameInterface: React.FC<StockOpnameInterfaceProps> = ({
  className = ''
}) => {
  const [stockOpnames, setStockOpnames] = useState<StockOpname[]>([]);
  const [currentOpname, setCurrentOpname] = useState<StockOpname | null>(null);
  const [opnameItems, setOpnameItems] = useState<StockOpnameItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Dialog States
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editItemDialogOpen, setEditItemDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockOpnameItem | null>(null);
  
  // Form States
  const [newOpnameData, setNewOpnameData] = useState({
    responsible_person: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [editItemData, setEditItemData] = useState({
    actual_quantity: 0,
    notes: ''
  });

  // Stock Opnames laden
  const loadStockOpnames = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stock-opname');
      if (response.ok) {
        const data = await response.json();
        setStockOpnames(data.stock_opnames || []);
      } else {
        throw new Error('Fehler beim Laden der Inventuren');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  }, []);

  // Neue Inventur erstellen
  const createStockOpname = useCallback(async () => {
    try {
      const response = await fetch('/api/stock-opname', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOpnameData)
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuccess('Inventur erfolgreich erstellt');
        setCreateDialogOpen(false);
        setNewOpnameData({ responsible_person: '', date: new Date().toISOString().split('T')[0] });
        loadStockOpnames();
      } else {
        throw new Error('Fehler beim Erstellen der Inventur');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
  }, [newOpnameData, loadStockOpnames]);

  // Inventur öffnen
  const openStockOpname = useCallback(async (opname: StockOpname) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/stock-opname/${opname.id}/items`);
      if (response.ok) {
        const data = await response.json();
        setOpnameItems(data.items || []);
        setCurrentOpname(opname);
      } else {
        throw new Error('Fehler beim Laden der Inventur-Details');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  }, []);

  // Barcode-Scan Handler
  const handleBarcodeDetected = useCallback((barcode: string) => {
    // Produkt über Barcode suchen und zur Inventur hinzufügen
    console.log('Barcode erkannt:', barcode);
    // TODO: API-Call zum Hinzufügen des Produkts
  }, []);

  // Item bearbeiten
  const editItem = useCallback((item: StockOpnameItem) => {
    setSelectedItem(item);
    setEditItemData({
      actual_quantity: item.actual_quantity,
      notes: item.notes || ''
    });
    setEditItemDialogOpen(true);
  }, []);

  // Item speichern
  const saveItem = useCallback(async () => {
    if (!selectedItem) return;
    
    try {
      const response = await fetch(`/api/stock-opname/items/${selectedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editItemData)
      });
      
      if (response.ok) {
        setSuccess('Artikel erfolgreich aktualisiert');
        setEditItemDialogOpen(false);
        setSelectedItem(null);
        // Items neu laden
        if (currentOpname) {
          openStockOpname(currentOpname);
        }
      } else {
        throw new Error('Fehler beim Aktualisieren des Artikels');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
  }, [selectedItem, editItemData, currentOpname, openStockOpname]);

  // Inventur abschließen
  const closeStockOpname = useCallback(async () => {
    if (!currentOpname) return;
    
    try {
      const response = await fetch(`/api/stock-opname/${currentOpname.id}/close`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setSuccess('Inventur erfolgreich abgeschlossen');
        setCurrentOpname(null);
        setOpnameItems([]);
        loadStockOpnames();
      } else {
        throw new Error('Fehler beim Abschließen der Inventur');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
  }, [currentOpname, loadStockOpnames]);

  // Status-Farbe
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'offen': return 'default';
      case 'in_bearbeitung': return 'warning';
      case 'abgeschlossen': return 'success';
      case 'storniert': return 'error';
      default: return 'default';
    }
  };

  // Status-Text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'offen': return 'Offen';
      case 'in_bearbeitung': return 'In Bearbeitung';
      case 'abgeschlossen': return 'Abgeschlossen';
      case 'storniert': return 'Storniert';
      default: return status;
    }
  };

  // Progress berechnen
  const getProgress = (opname: StockOpname) => {
    return opname.total_items > 0 ? (opname.completed_items / opname.total_items) * 100 : 0;
  };

  useEffect(() => {
    loadStockOpnames();
  }, [loadStockOpnames]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Box className="flex items-center justify-between">
        <Typography variant="h4" className="flex items-center gap-2">
          <InventoryIcon />
          Inventur-Verwaltung
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Neue Inventur
        </Button>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Inventur-Liste */}
      {!currentOpname && (
        <Card className="p-4">
          <Typography variant="h6" className="mb-4">
            Inventuren
          </Typography>
          
          {loading ? (
            <Box className="flex justify-center p-8">
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nummer</TableCell>
                    <TableCell>Datum</TableCell>
                    <TableCell>Verantwortlicher</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Fortschritt</TableCell>
                    <TableCell>Aktionen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stockOpnames.map((opname) => (
                    <TableRow key={opname.id} hover>
                      <TableCell>{opname.number}</TableCell>
                      <TableCell>{new Date(opname.date).toLocaleDateString('de-DE')}</TableCell>
                      <TableCell>{opname.responsible_person}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(opname.status)}
                          color={getStatusColor(opname.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box className="flex items-center gap-2">
                          <Box className="w-16 bg-gray-200 rounded-full h-2">
                            <Box
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${getProgress(opname)}%` }}
                            />
                          </Box>
                          <Typography variant="body2">
                            {opname.completed_items}/{opname.total_items}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => openStockOpname(opname)}
                          disabled={opname.status === 'abgeschlossen'}
                        >
                          Öffnen
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      )}

      {/* Inventur-Details */}
      {currentOpname && (
        <div className="space-y-4">
          {/* Header */}
          <Card className="p-4">
            <Box className="flex items-center justify-between mb-4">
              <Box>
                <Typography variant="h6">
                  Inventur: {currentOpname.number}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {new Date(currentOpname.date).toLocaleDateString('de-DE')} - {currentOpname.responsible_person}
                </Typography>
              </Box>
              <Box className="flex gap-2">
                <Button
                  variant="outlined"
                  onClick={() => {
                    setCurrentOpname(null);
                    setOpnameItems([]);
                  }}
                >
                  Zurück
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={closeStockOpname}
                  disabled={currentOpname.status === 'abgeschlossen'}
                >
                  Inventur abschließen
                </Button>
              </Box>
            </Box>
            
            <Chip
              label={getStatusText(currentOpname.status)}
              color={getStatusColor(currentOpname.status)}
            />
          </Card>

          {/* Barcode-Scanner */}
          <BarcodeScanner
            onBarcodeDetected={handleBarcodeDetected}
            onError={setError}
            className="mb-4"
          />

          {/* Artikel-Liste */}
          <Card className="p-4">
            <Typography variant="h6" className="mb-4">
              Inventur-Artikel
            </Typography>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Produkt</TableCell>
                    <TableCell>Code</TableCell>
                    <TableCell align="right">Erwartet</TableCell>
                    <TableCell align="right">Tatsächlich</TableCell>
                    <TableCell align="right">Differenz</TableCell>
                    <TableCell>Notizen</TableCell>
                    <TableCell>Aktionen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {opnameItems.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell>{item.product_code}</TableCell>
                      <TableCell align="right">{item.expected_quantity} {item.unit}</TableCell>
                      <TableCell align="right">
                        <span className={item.actual_quantity !== item.expected_quantity ? 'text-red-600 font-semibold' : ''}>
                          {item.actual_quantity} {item.unit}
                        </span>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${item.difference > 0 ? '+' : ''}${item.difference}`}
                          color={item.difference === 0 ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {item.notes && (
                          <Tooltip title={item.notes}>
                            <WarningIcon color="warning" fontSize="small" />
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => editItem(item)}
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </div>
      )}

      {/* Neue Inventur Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Neue Inventur erstellen</DialogTitle>
        <DialogContent>
          <Box className="space-y-4 pt-2">
            <TextField
              label="Verantwortlicher"
              fullWidth
              value={newOpnameData.responsible_person}
              onChange={(e) => setNewOpnameData(prev => ({ ...prev, responsible_person: e.target.value }))}
            />
            <TextField
              label="Datum"
              type="date"
              fullWidth
              value={newOpnameData.date}
              onChange={(e) => setNewOpnameData(prev => ({ ...prev, date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>
            Abbrechen
          </Button>
          <Button onClick={createStockOpname} variant="contained">
            Erstellen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Artikel bearbeiten Dialog */}
      <Dialog open={editItemDialogOpen} onClose={() => setEditItemDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Artikel bearbeiten</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box className="space-y-4 pt-2">
              <Typography variant="subtitle1">
                {selectedItem.product_name} ({selectedItem.product_code})
              </Typography>
              <TextField
                label="Tatsächliche Menge"
                type="number"
                fullWidth
                value={editItemData.actual_quantity}
                onChange={(e) => setEditItemData(prev => ({ ...prev, actual_quantity: Number(e.target.value) }))}
              />
              <TextField
                label="Notizen"
                multiline
                rows={3}
                fullWidth
                value={editItemData.notes}
                onChange={(e) => setEditItemData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditItemDialogOpen(false)}>
            Abbrechen
          </Button>
          <Button onClick={saveItem} variant="contained">
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}; 