import React, { useState, useEffect } from 'react';
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
  Store as StoreIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAgentApi } from '../../../hooks/useAgentApi';

interface StreckenhandelOrder {
  id: string;
  orderNumber: string;
  customer: string;
  deliveryDate: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  items: StreckenhandelItem[];
  route: string;
  driver: string;
  vehicle: string;
}

interface StreckenhandelItem {
  id: string;
  articleNumber: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface StreckenhandelProps {
  onBack: () => void;
}

export const Streckenhandel: React.FC<StreckenhandelProps> = ({ onBack }) => {
  const [orders, setOrders] = useState<StreckenhandelOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<StreckenhandelOrder | null>(null);
  const { } = useAgentApi();

  const mockOrders: StreckenhandelOrder[] = [
    {
      id: '1',
      orderNumber: 'ST-2024-001',
      customer: 'Metro AG - Filiale Hamburg',
      deliveryDate: '2024-01-16',
      status: 'confirmed',
      totalAmount: 2450.75,
      route: 'Route A - Hamburg Nord',
      driver: 'Max Mustermann',
      vehicle: 'LKW-001',
      items: [
        {
          id: '1',
          articleNumber: 'ART-001',
          description: 'Bio-Äpfel 1kg',
          quantity: 50,
          unitPrice: 2.99,
          totalPrice: 149.50
        },
        {
          id: '2',
          articleNumber: 'ART-002',
          description: 'Bio-Bananen 1kg',
          quantity: 30,
          unitPrice: 1.99,
          totalPrice: 59.70
        }
      ]
    },
    {
      id: '2',
      orderNumber: 'ST-2024-002',
      customer: 'Rewe - Filiale Bremen',
      deliveryDate: '2024-01-17',
      status: 'pending',
      totalAmount: 1890.25,
      route: 'Route B - Bremen Ost',
      driver: 'Anna Schmidt',
      vehicle: 'LKW-002',
      items: [
        {
          id: '3',
          articleNumber: 'ART-003',
          description: 'Bio-Orangen 1kg',
          quantity: 40,
          unitPrice: 3.49,
          totalPrice: 139.60
        }
      ]
    }
  ];

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simuliere API-Aufruf
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOrders(mockOrders);
    } catch (err) {
      setError('Fehler beim Laden der Streckenhandel-Aufträge');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadOrders();
  };

  const handleEdit = (order: StreckenhandelOrder) => {
    setSelectedOrder(order);
    setEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (selectedOrder) {
      setOrders(prev => 
        prev.map(order => 
          order.id === selectedOrder.id ? selectedOrder : order
        )
      );
    }
    setEditDialog(false);
    setSelectedOrder(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ausstehend';
      case 'confirmed': return 'Bestätigt';
      case 'shipped': return 'Versendet';
      case 'delivered': return 'Geliefert';
      case 'cancelled': return 'Storniert';
      default: return status;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Typography variant="h4" className="text-gray-800 mb-2">
            Streckenhandel
          </Typography>
          <Typography variant="body1" className="text-gray-600">
            Verwaltung von Streckenhandel-Aufträgen und Lieferungen
          </Typography>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Aktualisieren
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
          >
            Neuer Auftrag
          </Button>
          <Button
            variant="outlined"
            startIcon={<StoreIcon />}
            onClick={onBack}
          >
            Zurück
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4 text-center">
          <Typography variant="h6" className="text-gray-600 mb-2">
            Gesamt Aufträge
          </Typography>
          <Typography variant="h4" className="text-blue-600">
            {orders.length}
          </Typography>
        </Card>
        <Card className="p-4 text-center">
          <Typography variant="h6" className="text-gray-600 mb-2">
            Ausstehend
          </Typography>
          <Typography variant="h4" className="text-orange-600">
            {orders.filter(o => o.status === 'pending').length}
          </Typography>
        </Card>
        <Card className="p-4 text-center">
          <Typography variant="h6" className="text-gray-600 mb-2">
            Bestätigt
          </Typography>
          <Typography variant="h4" className="text-blue-600">
            {orders.filter(o => o.status === 'confirmed').length}
          </Typography>
        </Card>
        <Card className="p-4 text-center">
          <Typography variant="h6" className="text-gray-600 mb-2">
            Geliefert
          </Typography>
          <Typography variant="h4" className="text-green-600">
            {orders.filter(o => o.status === 'delivered').length}
          </Typography>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <div className="p-6">
          <Typography variant="h6" className="text-gray-800 mb-4">
            Streckenhandel-Aufträge
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow className="bg-gray-50">
                  <TableCell className="font-semibold">Auftragsnummer</TableCell>
                  <TableCell className="font-semibold">Kunde</TableCell>
                  <TableCell className="font-semibold">Lieferdatum</TableCell>
                  <TableCell className="font-semibold">Status</TableCell>
                  <TableCell className="font-semibold">Betrag</TableCell>
                  <TableCell className="font-semibold">Route</TableCell>
                  <TableCell className="font-semibold">Fahrer</TableCell>
                  <TableCell className="font-semibold">Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Typography variant="body1" className="font-medium">
                        {order.orderNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.customer}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.deliveryDate}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(order.status)}
                        color={getStatusColor(order.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" className="font-medium">
                        {order.totalAmount.toFixed(2)} €
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.route}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.driver}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(order)}
                          className="text-blue-600"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          className="text-red-600"
                        >
                          <DeleteIcon />
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

      {/* Edit Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Auftrag bearbeiten</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <div className="space-y-6 pt-2">
              {/* Order Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  label="Auftragsnummer"
                  value={selectedOrder.orderNumber}
                  onChange={(e) => setSelectedOrder({
                    ...selectedOrder,
                    orderNumber: e.target.value
                  })}
                  fullWidth
                />
                <TextField
                  label="Kunde"
                  value={selectedOrder.customer}
                  onChange={(e) => setSelectedOrder({
                    ...selectedOrder,
                    customer: e.target.value
                  })}
                  fullWidth
                />
                <TextField
                  label="Lieferdatum"
                  type="date"
                  value={selectedOrder.deliveryDate}
                  onChange={(e) => setSelectedOrder({
                    ...selectedOrder,
                    deliveryDate: e.target.value
                  })}
                  fullWidth
                />
                <TextField
                  label="Route"
                  value={selectedOrder.route}
                  onChange={(e) => setSelectedOrder({
                    ...selectedOrder,
                    route: e.target.value
                  })}
                  fullWidth
                />
                <TextField
                  label="Fahrer"
                  value={selectedOrder.driver}
                  onChange={(e) => setSelectedOrder({
                    ...selectedOrder,
                    driver: e.target.value
                  })}
                  fullWidth
                />
                <TextField
                  label="Fahrzeug"
                  value={selectedOrder.vehicle}
                  onChange={(e) => setSelectedOrder({
                    ...selectedOrder,
                    vehicle: e.target.value
                  })}
                  fullWidth
                />
              </div>

              {/* Items Table */}
              <div>
                <Typography variant="h6" className="mb-3">
                  Auftragspositionen
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Artikelnummer</TableCell>
                        <TableCell>Beschreibung</TableCell>
                        <TableCell>Menge</TableCell>
                        <TableCell>Einzelpreis</TableCell>
                        <TableCell>Gesamtpreis</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.articleNumber}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.unitPrice.toFixed(2)} €</TableCell>
                          <TableCell>{item.totalPrice.toFixed(2)} €</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}; 