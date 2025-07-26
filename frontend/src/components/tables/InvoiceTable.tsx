import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TableSortLabel,
  Chip,
  IconButton,
  Tooltip,
  Box,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Euro as EuroIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { Invoice, Customer, InvoiceStatus } from '../../types/invoices';

interface InvoiceTableProps {
  invoices: Invoice[];
  customers: Customer[];
  isLoading?: boolean;
  onView?: (invoice: Invoice) => void;
  onEdit?: (invoice: Invoice) => void;
  onDelete?: (invoice: Invoice) => void;
}

type SortField = 'created_at' | 'amount' | 'status' | 'customer_id';
type SortOrder = 'asc' | 'desc';

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  customers,
  isLoading = false,
  onView,
  onEdit,
  onDelete
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');

  // Sortierung
  const handleSort = (field: SortField) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  // Gefilterte und sortierte Daten
  const filteredAndSortedInvoices = useMemo(() => {
    let filtered = invoices.filter(invoice => {
      const customer = customers.find(c => c.id === invoice.customer_id);
      const matchesSearch = searchTerm === '' || 
        customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.amount.toString().includes(searchTerm) ||
        invoice.id?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sortierung
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'customer_id':
          const customerA = customers.find(c => c.id === a.customer_id);
          const customerB = customers.find(c => c.id === b.customer_id);
          aValue = customerA?.name || '';
          bValue = customerB?.name || '';
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'created_at':
          aValue = new Date(a.created_at || '').getTime();
          bValue = new Date(b.created_at || '').getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [invoices, customers, searchTerm, statusFilter, sortField, sortOrder]);

  // Paginierung
  const paginatedInvoices = filteredAndSortedInvoices.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Status-Chip-Komponente
  const StatusChip: React.FC<{ status: InvoiceStatus }> = ({ status }) => {
    const getStatusConfig = (status: InvoiceStatus) => {
      switch (status) {
        case 'open':
          return { color: 'warning' as const, label: 'Offen', icon: '⏳' };
        case 'paid':
          return { color: 'success' as const, label: 'Bezahlt', icon: '✅' };
        case 'overdue':
          return { color: 'error' as const, label: 'Überfällig', icon: '⚠️' };
        default:
          return { color: 'default' as const, label: status, icon: '❓' };
      }
    };

    const config = getStatusConfig(status);

    return (
      <Chip
        label={`${config.icon} ${config.label}`}
        color={config.color}
        size="small"
        variant="outlined"
        className="font-medium"
      />
    );
  };

  // Customer-Name-Resolver
  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unbekannter Kunde';
  };

  const getCustomerEmail = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.email : '';
  };

  if (isLoading) {
    return (
      <Box className="flex justify-center items-center h-64">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper className="shadow-lg">
      {/* Header */}
      <Box className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <Box className="flex items-center justify-between mb-4">
          <Box className="flex items-center space-x-2">
            <AssignmentIcon className="text-blue-600" />
            <Typography variant="h6" className="font-semibold">
              Rechnungen
            </Typography>
            <Chip 
              label={`${invoices.length} Rechnungen`} 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          </Box>
        </Box>

        {/* Filter und Suche */}
        <Box className="flex flex-col sm:flex-row gap-4">
          <TextField
            placeholder="Suche nach Kunde, E-Mail, Betrag oder ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            className="flex-1"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon className="text-gray-400" />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl size="small" className="min-w-[150px]">
            <InputLabel>Status Filter</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'all')}
              label="Status Filter"
            >
              <MenuItem value="all">Alle Status</MenuItem>
              <MenuItem value="open">Offen</MenuItem>
              <MenuItem value="paid">Bezahlt</MenuItem>
              <MenuItem value="overdue">Überfällig</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Tabelle */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow className="bg-gray-50">
              <TableCell>
                <TableSortLabel
                  active={sortField === 'created_at'}
                  direction={sortField === 'created_at' ? sortOrder : 'asc'}
                  onClick={() => handleSort('created_at')}
                >
                  <Box className="flex items-center space-x-1">
                    <AssignmentIcon className="text-gray-500" />
                    <span>Erstellt</span>
                  </Box>
                </TableSortLabel>
              </TableCell>
              
              <TableCell>
                <TableSortLabel
                  active={sortField === 'customer_id'}
                  direction={sortField === 'customer_id' ? sortOrder : 'asc'}
                  onClick={() => handleSort('customer_id')}
                >
                  <Box className="flex items-center space-x-1">
                    <PersonIcon className="text-gray-500" />
                    <span>Kunde</span>
                  </Box>
                </TableSortLabel>
              </TableCell>
              
              <TableCell>
                <TableSortLabel
                  active={sortField === 'amount'}
                  direction={sortField === 'amount' ? sortOrder : 'asc'}
                  onClick={() => handleSort('amount')}
                >
                  <Box className="flex items-center space-x-1">
                    <EuroIcon className="text-gray-500" />
                    <span>Betrag</span>
                  </Box>
                </TableSortLabel>
              </TableCell>
              
              <TableCell>
                <TableSortLabel
                  active={sortField === 'status'}
                  direction={sortField === 'status' ? sortOrder : 'asc'}
                  onClick={() => handleSort('status')}
                >
                  <Box className="flex items-center space-x-1">
                    <FilterIcon className="text-gray-500" />
                    <span>Status</span>
                  </Box>
                </TableSortLabel>
              </TableCell>
              
              <TableCell align="center">Aktionen</TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {paginatedInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" className="py-8">
                  <Alert severity="info">
                    Keine Rechnungen gefunden
                  </Alert>
                </TableCell>
              </TableRow>
            ) : (
              paginatedInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-gray-50">
                  <TableCell>
                    <Box className="flex flex-col">
                      <Typography variant="body2" className="font-medium">
                        {new Date(invoice.created_at || '').toLocaleDateString('de-DE')}
                      </Typography>
                      <Typography variant="caption" className="text-gray-500">
                        {new Date(invoice.created_at || '').toLocaleTimeString('de-DE')}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box className="flex flex-col">
                      <Typography variant="body2" className="font-medium">
                        {getCustomerName(invoice.customer_id)}
                      </Typography>
                      <Typography variant="caption" className="text-gray-500">
                        {getCustomerEmail(invoice.customer_id)}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box className="flex items-center space-x-1">
                      <EuroIcon className="text-gray-400" />
                      <Typography variant="body2" className="font-semibold">
                        {invoice.amount.toFixed(2)} €
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <StatusChip status={invoice.status} />
                  </TableCell>
                  
                  <TableCell align="center">
                    <Box className="flex justify-center space-x-1">
                      {onView && (
                        <Tooltip title="Anzeigen">
                          <IconButton
                            size="small"
                            onClick={() => onView(invoice)}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {onEdit && invoice.status === 'open' && (
                        <Tooltip title="Bearbeiten">
                          <IconButton
                            size="small"
                            onClick={() => onEdit(invoice)}
                            className="text-orange-600 hover:bg-orange-50"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {onDelete && (
                        <Tooltip title="Löschen">
                          <IconButton
                            size="small"
                            onClick={() => onDelete(invoice)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginierung */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredAndSortedInvoices.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Zeilen pro Seite:"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} von ${count !== -1 ? count : `mehr als ${to}`}`
        }
      />
    </Paper>
  );
}; 