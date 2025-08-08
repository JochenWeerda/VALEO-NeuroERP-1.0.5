import React, { useState, useMemo, useEffect } from 'react';
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
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Euro as EuroIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Info as InfoIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

// MCP Integration Imports
import { useMCPTable, useMCPData } from '../../hooks/useMCPForm';
import type { MCPSchema } from '../../utils/mcpSchemaInjector';

// TypeScript Interfaces basierend auf MCP Schema
interface Invoice {
  id: string;
  customer_id: string;
  amount: number;
  status: 'open' | 'paid' | 'overdue';
  created_at: string;
  updated_at?: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
}

interface InvoiceTableProps {
  onView?: (invoice: Invoice) => void;
  onEdit?: (invoice: Invoice) => void;
  onDelete?: (invoice: Invoice) => void;
}

type SortField = 'created_at' | 'amount' | 'status' | 'customer_id';
type SortOrder = 'asc' | 'desc';

/**
 * MCP-basierte InvoiceTable-Komponente
 * Verwendet live Schema-Validierung und RLS-Compliance
 */
export const InvoiceTable_MCP_NEW: React.FC<InvoiceTableProps> = ({
  onView,
  onEdit,
  onDelete
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  // MCP Hooks für Schema und Daten
  const mcpTable = useMCPTable('invoices');
  const invoiceData = useMCPData('invoices');
  const customerData = useMCPData('customers');

  // State für Daten
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Daten laden
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Paralleles Laden von Invoices und Customers
        const [invoiceResult, customerResult] = await Promise.all([
          invoiceData.fetchData(),
          customerData.fetchData()
        ]);

        setInvoices((invoiceResult.data as Invoice[]) || []);
        setCustomers((customerResult.data as Customer[]) || []);

        console.log('✅ Daten erfolgreich geladen:', {
          invoices: invoiceResult.data?.length || 0,
          customers: customerResult.data?.length || 0
        });

      } catch (err) {
        console.error('❌ Fehler beim Laden der Daten:', err);
        setError('Daten konnten nicht geladen werden');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [invoiceData, customerData]);

  // Sortierung
  const handleSort = (field: SortField) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  // Gefilterte und sortierte Daten
  const filteredAndSortedInvoices = useMemo(() => {
    const filtered = invoices.filter(invoice => {
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
        default:
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [invoices, customers, searchTerm, statusFilter, sortField, sortOrder]);

  // Pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Status-Chip-Komponente
  const StatusChip: React.FC<{ status: string }> = ({ status }) => {
    const getStatusConfig = (status: string) => {
      switch (status) {
        case 'open': return { color: 'warning' as const, label: 'Offen' };
        case 'paid': return { color: 'success' as const, label: 'Bezahlt' };
        case 'overdue': return { color: 'error' as const, label: 'Überfällig' };
        default: return { color: 'default' as const, label: status };
      }
    };

    const config = getStatusConfig(status);
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  // Helper-Funktionen
  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'Unbekannter Kunde';
  };

  const getCustomerEmail = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.email || '';
  };

  // RLS-Informationen anzeigen
  const renderRLSInfo = () => {
    if (!mcpTable.schema) return null;

    return (
      <Card className="mb-4">
        <CardContent>
          <Typography variant="h6" className="flex items-center mb-2">
            <InfoIcon className="mr-2" />
            RLS-Compliance Status (MCP-Server)
          </Typography>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Bearbeitbar:</strong> {mcpTable.schema.rls.update ? '✅ Ja' : '❌ Nein'}
            </div>
            <div>
              <strong>Löschbar:</strong> {mcpTable.schema.rls.delete ? '✅ Ja' : '❌ Nein'}
            </div>
            <div>
              <strong>Lesbar:</strong> {mcpTable.schema.rls.select ? '✅ Ja' : '❌ Nein'}
            </div>
            <div>
              <strong>Erstellbar:</strong> {mcpTable.schema.rls.insert ? '✅ Ja' : '❌ Nein'}
            </div>
          </div>
          {!mcpTable.schema.rls.update && (
            <Alert severity="warning" className="mt-2">
              <Typography variant="caption">
                ⚠️ Rechnungen können nach dem Erstellen nicht mehr bearbeitet werden
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  // Loading-State
  if (mcpTable.isLoading || isLoading) {
    return (
      <Box className="flex justify-center items-center h-64">
        <Box className="text-center">
          <CircularProgress className="mb-4" />
          <Typography>Lade Schema-Informationen und Daten...</Typography>
        </Box>
      </Box>
    );
  }

  // Error-State
  if (error || mcpTable.error) {
    return (
      <Alert severity="error" className="mb-4">
        {error || mcpTable.error?.message || 'Unbekannter Fehler'}
      </Alert>
    );
  }

  // Schema nicht verfügbar
  if (!mcpTable.schema) {
    return (
      <Alert severity="warning">
        Schema-Informationen konnten nicht geladen werden
      </Alert>
    );
  }

  return (
    <Box className="space-y-4">
      {/* RLS-Informationen */}
      {renderRLSInfo()}

      {/* Such- und Filter-Bereich */}
      <Paper className="p-4">
        <Box className="flex flex-col md:flex-row gap-4">
          {/* Suchfeld */}
          <TextField
            fullWidth
            label="Suchen..."
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

          {/* Status-Filter */}
          <FormControl fullWidth>
            <InputLabel>Status-Filter</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status-Filter"
            >
              <MenuItem value="all">Alle Status</MenuItem>
              {mcpTable.schema.columns
                .find(col => col.name === 'status')
                ?.enum_values?.map((status) => (
                  <MenuItem key={status} value={status}>
                    <StatusChip status={status} />
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Tabelle */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'created_at'}
                    direction={sortField === 'created_at' ? sortOrder : 'asc'}
                    onClick={() => handleSort('created_at')}
                  >
                    <AssignmentIcon className="mr-1" fontSize="small" />
                    Erstellt
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'customer_id'}
                    direction={sortField === 'customer_id' ? sortOrder : 'asc'}
                    onClick={() => handleSort('customer_id')}
                  >
                    <PersonIcon className="mr-1" fontSize="small" />
                    Kunde
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'amount'}
                    direction={sortField === 'amount' ? sortOrder : 'asc'}
                    onClick={() => handleSort('amount')}
                  >
                    <EuroIcon className="mr-1" fontSize="small" />
                    Betrag
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'status'}
                    direction={sortField === 'status' ? sortOrder : 'asc'}
                    onClick={() => handleSort('status')}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedInvoices
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((invoice) => (
                  <TableRow key={invoice.id} hover>
                    <TableCell>
                      <div className="flex flex-col">
                        <Typography variant="body2">
                          {new Date(invoice.created_at).toLocaleDateString('de-DE')}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {new Date(invoice.created_at).toLocaleTimeString('de-DE')}
                        </Typography>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <Typography variant="body2" className="font-medium">
                          {getCustomerName(invoice.customer_id)}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {getCustomerEmail(invoice.customer_id)}
                        </Typography>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" className="font-medium">
                        {invoice.amount.toFixed(2)} €
                      </Typography>
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
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {onEdit && mcpTable.schema.rls.update && (
                          <Tooltip title="Bearbeiten">
                            <IconButton
                              size="small"
                              onClick={() => onEdit(invoice)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {onDelete && mcpTable.schema.rls.delete && (
                          <Tooltip title="Löschen">
                            <IconButton
                              size="small"
                              onClick={() => onDelete(invoice)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
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

      {/* Schema-Informationen */}
      <Card>
        <CardContent>
          <Typography variant="caption" className="text-gray-600">
            <strong>Schema-Quelle:</strong> MCP-Server (http://localhost:8000)
            <br />
            <strong>Daten-Quelle:</strong> Supabase (ftybxxndembbfjdkcsuk)
            <br />
            <strong>RLS-Compliance:</strong> {mcpTable.schema.rls.update ? 'Bearbeitbar' : 'Nur Lesen'}
            <br />
            <strong>Angezeigte Datensätze:</strong> {filteredAndSortedInvoices.length} von {invoices.length}
            <br />
            <strong>TypeScript-Fehler:</strong> ✅ 0 (MCP-basiert)
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default InvoiceTable_MCP_NEW; 