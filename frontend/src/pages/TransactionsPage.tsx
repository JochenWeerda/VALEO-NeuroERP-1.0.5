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
  Alert,
  CircularProgress,
  TablePagination,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import { useApi } from '../contexts/ApiContext';
import {
  ObjectPageHeader,
  ActionBar,
  MessageStrip
} from '../components/ui/NeuroFlowComponents';

interface TransactionFormData {
  type: string;
  amount: number;
  description: string;
  date: string;
}

const TransactionsPage: React.FC = () => {
  const {
    transactions,
    getTransactions,
    createTransaction,
    isLoading,
    error
  } = useApi();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [formData, setFormData] = useState<TransactionFormData>({
    type: 'income',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    await getTransactions();
  };

  const handleSubmit = async () => {
    try {
      if (editingTransaction) {
        // Mock-Implementation für das Update
        console.log('Updating transaction:', editingTransaction.id);
        // In einer echten Implementierung würde hier die API aufgerufen werden
        // und dann der lokale State aktualisiert werden
      } else {
        await createTransaction({
          type: formData.type as 'income' | 'expense',
          amount: formData.amount,
          description: formData.description,
          date: formData.date,
          user_id: localStorage.getItem('userId') || 'current-user-id',
          status: 'pending'
        } as Omit<{ id: string; amount: number; description: string; date: string; type?: 'income' | 'expense'; user_id?: string; status?: 'pending' | 'completed' | 'cancelled' }, 'id'>);
      }
      setOpenDialog(false);
      resetForm();
      loadTransactions();
    } catch (err) {
      console.error('Error saving transaction:', err);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    // Mock-Implementation für das Löschen
    console.log('Deleting transaction:', id);
    // In einer echten Implementierung würde hier die API aufgerufen werden
    // und dann der lokale State aktualisiert werden
  };

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description || '',
      date: new Date(transaction.date).toISOString().split('T')[0]
    });
    setOpenDialog(true);
  };

  const resetForm = () => {
    setFormData({
      type: 'income',
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setEditingTransaction(null);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.amount.toString().includes(searchTerm);
    const matchesType = filterType === 'all' || (transaction.type && transaction.type.includes(filterType));
    return matchesSearch && matchesType;
  });

  const paginatedTransactions = filteredTransactions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'income' ? <TrendingUpIcon color="success" /> : <TrendingDownIcon color="error" />;
  };

  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5F6F7' }}>
      {/* Header */}
      <ObjectPageHeader
        title="Transaktionen"
        subtitle="Verwaltung aller Finanztransaktionen"
        status={`${filteredTransactions.length} Transaktionen`}
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
            >
              Neue Transaktion
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadTransactions}
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
        title="Transaktionsverwaltung"
        actions={[
          {
            label: 'Filter zurücksetzen',
            onClick: () => {
              setSearchTerm('');
              setFilterType('all');
            },
            variant: 'outlined'
          }
        ]}
      />

      <Box sx={{ p: 3 }}>
        {/* Summary Cards */}
        <Box className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AccountBalanceIcon sx={{ fontSize: 40, color: '#0A6ED1' }} />
              <Box>
                <Typography variant="h4" sx={{ color: '#0A6ED1', fontWeight: 600 }}>
                  {filteredTransactions.length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#515559' }}>
                  Gesamte Transaktionen
                </Typography>
              </Box>
            </Box>
          </Card>

          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: '#107C41' }} />
              <Box>
                <Typography variant="h4" sx={{ color: '#107C41', fontWeight: 600 }}>
                  {filteredTransactions.filter(t => t.type === 'income').length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#515559' }}>
                  Einnahmen
                </Typography>
              </Box>
            </Box>
          </Card>

          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TrendingDownIcon sx={{ fontSize: 40, color: '#BB0000' }} />
              <Box>
                <Typography variant="h4" sx={{ color: '#BB0000', fontWeight: 600 }}>
                  {filteredTransactions.filter(t => t.type === 'expense').length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#515559' }}>
                  Ausgaben
                </Typography>
              </Box>
            </Box>
          </Card>
        </Box>

        {/* Filters */}
        <Card sx={{ p: 3, mb: 3 }}>
          <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <InputLabel>Typ</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Typ"
              >
                <MenuItem value="all">Alle</MenuItem>
                <MenuItem value="income">Einnahmen</MenuItem>
                <MenuItem value="expense">Ausgaben</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ color: '#0A6ED1' }}>
                Gesamtbetrag: {totalAmount.toFixed(2)}€
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
                  <TableCell>Typ</TableCell>
                  <TableCell>Betrag</TableCell>
                  <TableCell>Beschreibung</TableCell>
                  <TableCell>Datum</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedTransactions.map((transaction) => (
                  <TableRow key={transaction.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTypeIcon(transaction.type || 'unknown')}
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {transaction.type || 'unknown'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          color: (transaction.type || 'unknown') === 'income' ? '#107C41' : '#BB0000',
                          fontWeight: 600
                        }}
                      >
                        {transaction.amount.toFixed(2)}€
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200 }}>
                        {transaction.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(transaction.date).toLocaleDateString('de-DE')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.status || 'pending'}
                        size="small"
                        color={getStatusColor(transaction.status || 'pending') as any}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Bearbeiten">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(transaction)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Löschen">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedTransactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Keine Transaktionen gefunden
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={filteredTransactions.length}
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
          {editingTransaction ? 'Transaktion bearbeiten' : 'Neue Transaktion'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Typ</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                label="Typ"
              >
                <MenuItem value="income">Einnahme</MenuItem>
                <MenuItem value="expense">Ausgabe</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Betrag"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              margin="normal"
              InputProps={{
                endAdornment: <InputAdornment position="end">€</InputAdornment>,
              }}
            />

            <TextField
              fullWidth
              label="Beschreibung"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />

            <TextField
              fullWidth
              label="Datum"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Abbrechen</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTransaction ? 'Aktualisieren' : 'Erstellen'}
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

export default TransactionsPage; 