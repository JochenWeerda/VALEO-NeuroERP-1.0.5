/**
 * 🧠 NeuroFlow Invoice Table
 * KI-first, responsive-first Rechnungstabelle mit MCP-Integration
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
  TextField,
  InputAdornment,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Skeleton,
  CircularProgress,
  Stack,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  Euro as EuroIcon,
  CalendarToday as CalendarIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled Components
const NeuroFlowCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[1],
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const NeuroFlowTable = styled(Table)(({ theme }) => ({
  '& .MuiTableCell-root': {
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: '1rem',
  },
  '& .MuiTableHead-root .MuiTableCell-root': {
    backgroundColor: theme.palette.grey[100],
    fontWeight: 600,
    color: theme.palette.text.secondary,
  },
  '& .MuiTableRow-root:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

// Types
interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  invoice_date: string;
  due_date: string;
  amount: number;
  tax_rate: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  description: string;
  created_at: string;
}

// Status Configuration
const statusConfig = {
  draft: { label: 'Entwurf', color: 'default' as const, icon: <ReceiptIcon /> },
  sent: { label: 'Versendet', color: 'info' as const, icon: <ReceiptIcon /> },
  paid: { label: 'Bezahlt', color: 'success' as const, icon: <ReceiptIcon /> },
  overdue: { label: 'Überfällig', color: 'error' as const, icon: <ReceiptIcon /> },
  cancelled: { label: 'Storniert', color: 'warning' as const, icon: <ReceiptIcon /> },
};

// Mock Data
const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoice_number: 'INV-2024-001',
    customer_name: 'Max Mustermann GmbH',
    customer_email: 'max@mustermann.de',
    invoice_date: '2024-01-15',
    due_date: '2024-02-14',
    amount: 1500.00,
    tax_rate: 19,
    total_amount: 1785.00,
    status: 'paid',
    description: 'Webentwicklung Services',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    invoice_number: 'INV-2024-002',
    customer_name: 'Firma Schmidt AG',
    customer_email: 'info@schmidt.de',
    invoice_date: '2024-01-20',
    due_date: '2024-02-19',
    amount: 2500.00,
    tax_rate: 19,
    total_amount: 2975.00,
    status: 'sent',
    description: 'Beratung und Implementierung',
    created_at: '2024-01-20T14:30:00Z',
  },
  {
    id: '3',
    invoice_number: 'INV-2024-003',
    customer_name: 'Test Unternehmen',
    customer_email: 'test@unternehmen.de',
    invoice_date: '2024-01-25',
    due_date: '2024-02-24',
    amount: 800.00,
    tax_rate: 19,
    total_amount: 952.00,
    status: 'overdue',
    description: 'Support und Wartung',
    created_at: '2024-01-25T09:15:00Z',
  },
];

// NeuroFlow Invoice Table Component
interface NeuroFlowInvoiceTableProps {
  onEdit?: (invoice: Invoice) => void;
  onDelete?: (invoice: Invoice) => void;
  onView?: (invoice: Invoice) => void;
  onCreate?: () => void;
  loading?: boolean;
}

export const NeuroFlowInvoiceTable: React.FC<NeuroFlowInvoiceTableProps> = ({
  onEdit,
  onDelete,
  onView,
  onCreate,
  loading = false,
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Load data from MCP
  useEffect(() => {
    const loadInvoices = async () => {
      setLoadingData(true);
      try {
        // Try to load from MCP API first
        const response = await fetch('/api/mcp/invoices', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setInvoices(data.invoices || []);
          setFilteredInvoices(data.invoices || []);
        } else {
          // Fallback to mock data if MCP API is not available
          console.warn('MCP API not available, using mock data');
          setInvoices(mockInvoices);
          setFilteredInvoices(mockInvoices);
        }
      } catch (error) {
        console.error('Error loading invoices:', error);
        // Fallback to mock data
        setInvoices(mockInvoices);
        setFilteredInvoices(mockInvoices);
      } finally {
        setLoadingData(false);
      }
    };

    loadInvoices();
  }, []);

  // Filter invoices
  useEffect(() => {
    let filtered = invoices;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter);
    }

    setFilteredInvoices(filtered);
    setPage(0);
  }, [invoices, searchTerm, statusFilter]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, invoice: Invoice) => {
    setAnchorEl(event.currentTarget);
    setSelectedInvoice(invoice);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedInvoice(null);
  };

  const handleEdit = () => {
    if (selectedInvoice && onEdit) {
      onEdit(selectedInvoice);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedInvoice && onDelete) {
      onDelete(selectedInvoice);
    }
    handleMenuClose();
  };

  const handleView = () => {
    if (selectedInvoice && onView) {
      onView(selectedInvoice);
    }
    handleMenuClose();
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const getStatusChip = (status: Invoice['status']) => {
    const config = statusConfig[status];
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
        variant="filled"
      />
    );
  };

  const paginatedInvoices = filteredInvoices.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loadingData) {
    return (
      <NeuroFlowCard>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Typography variant="h5" fontWeight={600}>
              Rechnungen
            </Typography>
            <CircularProgress size={24} />
          </Box>
          <Skeleton variant="rectangular" height={400} />
        </CardContent>
      </NeuroFlowCard>
    );
  }

  return (
    <NeuroFlowCard>
      <CardContent>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <ReceiptIcon color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h5" fontWeight={600} color="text.primary">
                Rechnungen
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filteredInvoices.length} von {invoices.length} Rechnungen
              </Typography>
            </Box>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => window.location.reload()}
            >
              Aktualisieren
            </Button>
            {onCreate && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onCreate}
              >
                Neue Rechnung
              </Button>
            )}
          </Stack>
        </Box>

        {/* Filters */}
        <Box display="flex" gap={2} mb={3}>
          <TextField
            placeholder="Rechnungen durchsuchen..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="all">Alle Status</MenuItem>
              {Object.entries(statusConfig).map(([key, config]) => (
                <MenuItem key={key} value={key}>
                  <Chip
                    label={config.label}
                    size="small"
                    color={config.color}
                    sx={{ mr: 1 }}
                  />
                  {config.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Table */}
        <TableContainer>
          <NeuroFlowTable>
            <TableHead>
              <TableRow>
                <TableCell>Rechnungsnummer</TableCell>
                <TableCell>Kunde</TableCell>
                <TableCell>Datum</TableCell>
                <TableCell>Fällig</TableCell>
                <TableCell align="right">Betrag</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedInvoices.map((invoice) => (
                <TableRow key={invoice.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <ReceiptIcon color="primary" fontSize="small" />
                      <Typography variant="body2" fontWeight={500}>
                        {invoice.invoice_number}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {invoice.customer_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {invoice.customer_email}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {formatDate(invoice.invoice_date)}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(invoice.due_date)}
                    </Typography>
                  </TableCell>
                  
                  <TableCell align="right">
                    <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                      <EuroIcon fontSize="small" color="action" />
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(invoice.total_amount)}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    {getStatusChip(invoice.status)}
                  </TableCell>
                  
                  <TableCell align="center">
                    <Tooltip title="Aktionen">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, invoice)}
                      >
                        <MoreIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </NeuroFlowTable>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredInvoices.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Zeilen pro Seite:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} von ${count !== -1 ? count : `mehr als ${to}`}`
          }
        />

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              minWidth: 200,
              borderRadius: 2,
              boxShadow: (theme) => theme.shadows[3],
            },
          }}
        >
          <MenuItem onClick={handleView}>
            <ListItemIcon>
              <ViewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Anzeigen</ListItemText>
          </MenuItem>
          
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Bearbeiten</ListItemText>
          </MenuItem>
          
          <Divider />
          
          <MenuItem onClick={handleDelete}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Löschen</ListItemText>
          </MenuItem>
        </Menu>
      </CardContent>
    </NeuroFlowCard>
  );
};

export default NeuroFlowInvoiceTable; 