import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Container,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { getOrders, updateOrderStatus, Order } from '../services/ecommerceApi';

const statusColors = {
  pending: 'warning',
  processing: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'error'
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const EcommerceOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getOrders();
        setOrders(data);
        setError(null);
      } catch (err) {
        setError('Fehler beim Laden der Bestellungen');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusChange = async (order: Order, newStatus: Order['status']) => {
    try {
      const updatedOrder = await updateOrderStatus(order.id, newStatus);
      setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    } catch (err) {
      setError('Fehler beim Aktualisieren des Status');
      console.error(err);
    }
  };

  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
  };

  const handleCloseDetails = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
  };

  if (loading) return <Typography>Bestellungen werden geladen...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          E-Commerce-Bestellungen
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Verwalten Sie Ihre Online-Bestellungen und behalten Sie den Überblick
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Bestell-ID</TableCell>
                <TableCell>Datum</TableCell>
                <TableCell>Kunde</TableCell>
                <TableCell>Betrag</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Keine Bestellungen gefunden
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>#{order.id}</TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell>Kunde #{order.customer_id}</TableCell>
                    <TableCell>{order.total.toFixed(2)} €</TableCell>
                    <TableCell>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order, e.target.value as Order['status'])}
                          displayEmpty
                          size="small"
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value="pending">
                            <Chip 
                              label="Ausstehend" 
                              color="warning" 
                              size="small" 
                              sx={{ width: '100%' }}
                            />
                          </MenuItem>
                          <MenuItem value="processing">
                            <Chip 
                              label="In Bearbeitung" 
                              color="info" 
                              size="small" 
                              sx={{ width: '100%' }}
                            />
                          </MenuItem>
                          <MenuItem value="shipped">
                            <Chip 
                              label="Versendet" 
                              color="primary" 
                              size="small" 
                              sx={{ width: '100%' }}
                            />
                          </MenuItem>
                          <MenuItem value="delivered">
                            <Chip 
                              label="Geliefert" 
                              color="success" 
                              size="small" 
                              sx={{ width: '100%' }}
                            />
                          </MenuItem>
                          <MenuItem value="cancelled">
                            <Chip 
                              label="Storniert" 
                              color="error" 
                              size="small" 
                              sx={{ width: '100%' }}
                            />
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => handleOpenDetails(order)}
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Bestelldetails Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>
              Bestelldetails #{selectedOrder.id}
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Bestellinformationen</Typography>
                  <Box component="dl" sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 2, mt: 2 }}>
                    <Typography component="dt" fontWeight="bold">Status:</Typography>
                    <Typography component="dd">
                      <Chip 
                        label={selectedOrder.status === 'pending' ? 'Ausstehend' : 
                               selectedOrder.status === 'processing' ? 'In Bearbeitung' :
                               selectedOrder.status === 'shipped' ? 'Versendet' :
                               selectedOrder.status === 'delivered' ? 'Geliefert' : 'Storniert'} 
                        color={statusColors[selectedOrder.status] as any}
                        size="small" 
                      />
                    </Typography>
                    
                    <Typography component="dt" fontWeight="bold">Bestelldatum:</Typography>
                    <Typography component="dd">{formatDate(selectedOrder.created_at)}</Typography>
                    
                    <Typography component="dt" fontWeight="bold">Letzte Aktualisierung:</Typography>
                    <Typography component="dd">{formatDate(selectedOrder.updated_at)}</Typography>
                    
                    <Typography component="dt" fontWeight="bold">Zahlungsmethode:</Typography>
                    <Typography component="dd">{selectedOrder.payment_method}</Typography>
                    
                    <Typography component="dt" fontWeight="bold">Gesamtbetrag:</Typography>
                    <Typography component="dd">{selectedOrder.total.toFixed(2)} €</Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Lieferadresse</Typography>
                  <TextField
                    multiline
                    fullWidth
                    rows={4}
                    value={selectedOrder.shipping_address}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                    sx={{ mt: 2 }}
                  />
                  
                  <Typography variant="subtitle1" sx={{ mt: 2 }}>Rechnungsadresse</Typography>
                  <TextField
                    multiline
                    fullWidth
                    rows={4}
                    value={selectedOrder.billing_address}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                    sx={{ mt: 2 }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Bestellte Artikel</Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Artikel</TableCell>
                          <TableCell align="right">Menge</TableCell>
                          <TableCell align="right">Einzelpreis</TableCell>
                          <TableCell align="right">Gesamt</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedOrder.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="right">{item.price.toFixed(2)} €</TableCell>
                            <TableCell align="right">{item.total.toFixed(2)} €</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} align="right">
                            <Typography variant="subtitle1">Gesamtbetrag:</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle1">{selectedOrder.total.toFixed(2)} €</Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Schließen</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default EcommerceOrders; 