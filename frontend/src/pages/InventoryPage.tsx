import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  CircularProgress,
  TablePagination,
  InputAdornment,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useApi } from '../contexts/ApiContext';
import {
  ObjectPageHeader,
  ActionBar,
  MessageStrip
} from '../components/ui/NeuroFlowComponents';

interface InventoryFormData {
  name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  location: string;
  category: string;
}

const InventoryPage: React.FC = () => {
  const {
    inventory,
    getInventory,
    createInventoryItem,
    updateInventoryItem,
    isLoading,
    error
  } = useApi();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<InventoryFormData>({
    name: '',
    sku: '',
    quantity: 0,
    unit_price: 0,
    location: '',
    category: 'general'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    await getInventory();
  };

  const handleSubmit = async () => {
    try {
      if (editingItem) {
        await updateInventoryItem(editingItem.id, formData);
      } else {
        await createInventoryItem({
          ...formData,
          price: formData.unit_price, // Map unit_price to price
          status: 'in_stock'
        });
      }
      setOpenDialog(false);
      resetForm();
      loadInventory();
    } catch (err) {
      console.error('Error saving inventory item:', err);
    }
  };

  const handleDeleteItem = (id: string) => {
    // Mock-Implementation für das Löschen
    console.log('Deleting inventory item:', id);
    // In einer echten Implementierung würde hier die API aufgerufen werden
    // und dann der lokale State aktualisiert werden
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      unit_price: item.unit_price,
      location: item.location || '',
      category: item.category
    });
    setOpenDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      quantity: 0,
      unit_price: 0,
      location: '',
      category: 'general'
    });
    setEditingItem(null);
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (item.location?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const paginatedInventory = filteredInventory.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'success';
      case 'low_stock': return 'warning';
      case 'out_of_stock': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock': return <CheckCircleIcon color="success" />;
      case 'low_stock': return <WarningIcon color="warning" />;
      case 'out_of_stock': return <ErrorIcon color="error" />;
      default: return <InventoryIcon />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_stock': return 'Verfügbar';
      case 'low_stock': return 'Niedrig';
      case 'out_of_stock': return 'Nicht verfügbar';
      default: return status;
    }
  };

  const totalValue = filteredInventory.reduce((sum, item) => sum + (item.quantity * (item.unit_price || item.price || 0)), 0);
  const totalItems = filteredInventory.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = filteredInventory.filter(item => item.status === 'low_stock').length;
  const outOfStockItems = filteredInventory.filter(item => item.status === 'out_of_stock').length;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5F6F7' }}>
      {/* Header */}
      <ObjectPageHeader
        title="Inventar"
        subtitle="Verwaltung aller Lagerbestände"
        status={`${filteredInventory.length} Artikel`}
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
            >
              Neuer Artikel
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadInventory}
              disabled={isLoading}
            >
              Aktualisieren
            </Button>
          </Box>
        }
      />

      {/* Error Display */}
      {error && (
        <Box sx={{ px: 3 }}>
          <MessageStrip type="error" title="Fehler">
            {error}
          </MessageStrip>
        </Box>
      )}

      {/* Action Bar */}
      <ActionBar
        title="Inventarverwaltung"
        actions={[
          {
            label: 'Filter zurücksetzen',
            onClick: () => {
              setSearchTerm('');
              setFilterCategory('all');
              setFilterStatus('all');
            },
            variant: 'outlined'
          }
        ]}
      />

      <Box sx={{ p: 3 }}>
        {/* Summary Cards */}
        <Box className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <InventoryIcon sx={{ fontSize: 40, color: '#0A6ED1' }} />
              <Box>
                <Typography variant="h4" sx={{ color: '#0A6ED1', fontWeight: 600 }}>
                  {filteredInventory.length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#515559' }}>
                  Artikel
                </Typography>
              </Box>
            </Box>
          </Card>

          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: '#107C41' }} />
              <Box>
                <Typography variant="h4" sx={{ color: '#107C41', fontWeight: 600 }}>
                  {totalItems}
                </Typography>
                <Typography variant="body2" sx={{ color: '#515559' }}>
                  Gesamtbestand
                </Typography>
              </Box>
            </Box>
          </Card>

          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <WarningIcon sx={{ fontSize: 40, color: '#E9730C' }} />
              <Box>
                <Typography variant="h4" sx={{ color: '#E9730C', fontWeight: 600 }}>
                  {lowStockItems}
                </Typography>
                <Typography variant="body2" sx={{ color: '#515559' }}>
                  Niedriger Bestand
                </Typography>
              </Box>
            </Box>
          </Card>

          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ErrorIcon sx={{ fontSize: 40, color: '#BB0000' }} />
              <Box>
                <Typography variant="h4" sx={{ color: '#BB0000', fontWeight: 600 }}>
                  {outOfStockItems}
                </Typography>
                <Typography variant="body2" sx={{ color: '#515559' }}>
                  Nicht verfügbar
                </Typography>
              </Box>
            </Box>
          </Card>
        </Box>

        {/* Filters */}
        <Card sx={{ p: 3, mb: 3 }}>
          <Box className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <TextField
              fullWidth
              label="Suchen"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Kategorie</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                label="Kategorie"
              >
                <MenuItem value="all">Alle</MenuItem>
                <MenuItem value="general">Allgemein</MenuItem>
                <MenuItem value="electronics">Elektronik</MenuItem>
                <MenuItem value="office">Büro</MenuItem>
                <MenuItem value="tools">Werkzeuge</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">Alle</MenuItem>
                <MenuItem value="in_stock">Verfügbar</MenuItem>
                <MenuItem value="low_stock">Niedrig</MenuItem>
                <MenuItem value="out_of_stock">Nicht verfügbar</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ color: '#0A6ED1' }}>
                Gesamtwert: {totalValue.toFixed(2)}€
              </Typography>
            </Box>
          </Box>
        </Card>

        {/* Data Table */}
        <Card>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F5F6F7' }}>
                  <TableCell>Artikel</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Bestand</TableCell>
                  <TableCell>Einzelpreis</TableCell>
                  <TableCell>Gesamtwert</TableCell>
                  <TableCell>Standort</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedInventory.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.category}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {item.sku || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.quantity}
                        </Typography>
                        {item.status === 'low_stock' && (
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min((item.quantity / 10) * 100, 100)} 
                            sx={{ width: 50, height: 4 }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {(item.unit_price || item.price || 0).toFixed(2)}€
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0A6ED1' }}>
                        {(item.quantity * (item.unit_price || item.price || 0)).toFixed(2)}€
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {item.location || '-'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getStatusIcon(item.status || 'unknown')}
                        <Chip
                          label={getStatusText(item.status || 'unknown')}
                          size="small"
                          color={getStatusColor(item.status || 'unknown') as any}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Bearbeiten">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(item)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Löschen">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedInventory.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Keine Artikel gefunden
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={filteredInventory.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Zeilen pro Seite:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} von ${count}`}
          />
        </Card>
      </Box>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem ? 'Artikel bearbeiten' : 'Neuer Artikel'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Artikelname"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="SKU"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              margin="normal"
              required
            />

            <Box className="grid grid-cols-2 gap-4">
              <TextField
                fullWidth
                label="Menge"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                label="Einzelpreis"
                type="number"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                margin="normal"
                required
                InputProps={{
                  endAdornment: <InputAdornment position="end">€</InputAdornment>,
                }}
              />
            </Box>

            <TextField
              fullWidth
              label="Standort"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              margin="normal"
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Kategorie</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                label="Kategorie"
              >
                <MenuItem value="general">Allgemein</MenuItem>
                <MenuItem value="electronics">Elektronik</MenuItem>
                <MenuItem value="office">Büro</MenuItem>
                <MenuItem value="tools">Werkzeuge</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Abbrechen</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingItem ? 'Aktualisieren' : 'Erstellen'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading Overlay */}
      {isLoading && (
        <Box sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          bgcolor: 'rgba(0,0,0,0.3)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default InventoryPage; 