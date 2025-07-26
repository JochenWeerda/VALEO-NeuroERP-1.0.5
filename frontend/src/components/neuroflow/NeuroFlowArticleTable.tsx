/**
 * 🧠 NeuroFlow Article Table
 * KI-first, responsive-first Artikel-Tabelle für ERP-Systeme
 * Fehlerfreier TypeScript-Code mit vollständiger Funktionalität
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Chip,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Stack,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Skeleton,
  CircularProgress,
  Badge,
  Avatar,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  Euro as EuroIcon,
  Storage as StorageIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
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

const NeuroFlowButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  textTransform: 'none',
  fontWeight: 600,
  padding: '0.75rem 1.5rem',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: theme.shadows[3],
  },
}));

// TypeScript Interfaces
interface Article {
  id: string;
  article_number: string;
  ean_code?: string;
  name: string;
  description?: string;
  category: string;
  brand?: string;
  purchase_price: number;
  selling_price: number;
  vat_rate: number;
  current_stock: number;
  min_stock: number;
  max_stock?: number;
  unit: string;
  status: 'active' | 'inactive' | 'discontinued' | 'new';
  is_service: boolean;
  is_digital: boolean;
  is_hazardous: boolean;
  supplier_name?: string;
  created_at: string;
  updated_at: string;
}

interface NeuroFlowArticleTableProps {
  articles?: Article[];
  loading?: boolean;
  onAdd?: () => void;
  onEdit?: (article: Article) => void;
  onDelete?: (article: Article) => void;
  onView?: (article: Article) => void;
  onRefresh?: () => void;
  onExport?: () => void;
}

// Mock Data
const mockArticles: Article[] = [
  {
    id: '1',
    article_number: 'A202412-001',
    ean_code: '4001234567890',
    name: 'Laptop Dell XPS 13',
    description: 'Hochwertiger Business-Laptop mit 13" Display',
    category: 'Elektronik',
    brand: 'Dell',
    purchase_price: 899.99,
    selling_price: 1299.99,
    vat_rate: 19,
    current_stock: 15,
    min_stock: 5,
    max_stock: 50,
    unit: 'Stück',
    status: 'active',
    is_service: false,
    is_digital: false,
    is_hazardous: false,
    supplier_name: 'TechSupply GmbH',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-20T14:45:00Z',
  },
  {
    id: '2',
    article_number: 'A202412-002',
    ean_code: '4001234567891',
    name: 'Drucker HP LaserJet Pro',
    description: 'Monochrom-Laserdrucker für Büroanwendungen',
    category: 'Elektronik',
    brand: 'HP',
    purchase_price: 299.99,
    selling_price: 449.99,
    vat_rate: 19,
    current_stock: 8,
    min_stock: 3,
    max_stock: 20,
    unit: 'Stück',
    status: 'active',
    is_service: false,
    is_digital: false,
    is_hazardous: false,
    supplier_name: 'OfficeWorld AG',
    created_at: '2024-01-16T09:15:00Z',
    updated_at: '2024-01-19T16:20:00Z',
  },
  {
    id: '3',
    article_number: 'A202412-003',
    name: 'IT-Support Stunde',
    description: 'Professioneller IT-Support pro Stunde',
    category: 'Dienstleistungen',
    brand: 'VALEO',
    purchase_price: 0,
    selling_price: 89.99,
    vat_rate: 19,
    current_stock: 999,
    min_stock: 0,
    unit: 'Stück',
    status: 'active',
    is_service: true,
    is_digital: false,
    is_hazardous: false,
    created_at: '2024-01-17T11:00:00Z',
    updated_at: '2024-01-17T11:00:00Z',
  },
  {
    id: '4',
    article_number: 'A202412-004',
    ean_code: '4001234567892',
    name: 'Schrauben M6x20',
    description: 'Stahlschrauben M6x20mm, 100er Packung',
    category: 'Werkzeuge',
    brand: 'Würth',
    purchase_price: 4.99,
    selling_price: 8.99,
    vat_rate: 19,
    current_stock: 2,
    min_stock: 10,
    max_stock: 100,
    unit: 'Packung',
    status: 'active',
    is_service: false,
    is_digital: false,
    is_hazardous: false,
    supplier_name: 'ToolMaster KG',
    created_at: '2024-01-18T13:30:00Z',
    updated_at: '2024-01-21T10:15:00Z',
  },
  {
    id: '5',
    article_number: 'A202412-005',
    name: 'Cloud Backup 100GB',
    description: 'Monatliches Cloud-Backup 100GB Speicher',
    category: 'Software',
    brand: 'VALEO',
    purchase_price: 0,
    selling_price: 19.99,
    vat_rate: 19,
    current_stock: 999,
    min_stock: 0,
    unit: 'Stück',
    status: 'active',
    is_service: true,
    is_digital: true,
    is_hazardous: false,
    created_at: '2024-01-19T15:45:00Z',
    updated_at: '2024-01-19T15:45:00Z',
  },
];

// NeuroFlow Article Table Component
export const NeuroFlowArticleTable: React.FC<NeuroFlowArticleTableProps> = ({
  articles = mockArticles,
  loading = false,
  onAdd,
  onEdit,
  onDelete,
  onView,
  onRefresh,
  onExport,
}) => {
  // State Management
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<keyof Article>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter and Sort Logic
  const filteredAndSortedArticles = useMemo(() => {
    let filtered = articles.filter((article) => {
      const matchesSearch = 
        article.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.article_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !categoryFilter || article.category === categoryFilter;
      const matchesStatus = !statusFilter || article.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sorting
    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

    return filtered;
  }, [articles, searchTerm, categoryFilter, statusFilter, sortBy, sortOrder]);

  // Pagination
  const paginatedArticles = filteredAndSortedArticles.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Utility Functions
  const getStatusColor = (status: Article['status']) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'discontinued': return 'error';
      case 'new': return 'primary';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: Article['status']) => {
    switch (status) {
      case 'active': return 'Aktiv';
      case 'inactive': return 'Inaktiv';
      case 'discontinued': return 'Eingestellt';
      case 'new': return 'Neu';
      default: return status;
    }
  };

  const getStockStatus = (current: number, min: number) => {
    if (current <= 0) return { color: 'error', icon: <ErrorIcon />, label: 'Nicht verfügbar' };
    if (current <= min) return { color: 'warning', icon: <WarningIcon />, label: 'Niedrig' };
    return { color: 'success', icon: <CheckCircleIcon />, label: 'Verfügbar' };
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

  const getCategories = () => {
    const categories = Array.from(new Set(articles.map(a => a.category)));
    return categories.sort();
  };

  // Event Handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (property: keyof Article) => {
    const isAsc = sortBy === property && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortBy(property);
  };

  const handleDelete = (article: Article) => {
    if (window.confirm(`Artikel "${article.name}" wirklich löschen?`)) {
      onDelete?.(article);
    }
  };

  return (
    <NeuroFlowCard>
      <CardContent>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <InventoryIcon color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h5" fontWeight={600} color="text.primary">
                Artikelverwaltung
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Verwalten Sie alle Artikel und Produkte im System
              </Typography>
            </Box>
          </Box>
          
          <Stack direction="row" spacing={1}>
            <Tooltip title="Aktualisieren">
              <IconButton onClick={onRefresh} color="primary" disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Exportieren">
              <IconButton onClick={onExport} color="primary">
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <NeuroFlowButton
              variant="contained"
              onClick={onAdd}
              startIcon={<AddIcon />}
            >
              Neuer Artikel
            </NeuroFlowButton>
          </Stack>
        </Box>

        {/* Filters */}
        <Box mb={3}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Artikel suchen..."
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
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Kategorie</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  label="Kategorie"
                >
                  <MenuItem value="">Alle Kategorien</MenuItem>
                  {getCategories().map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">Alle Status</MenuItem>
                  <MenuItem value="active">Aktiv</MenuItem>
                  <MenuItem value="inactive">Inaktiv</MenuItem>
                  <MenuItem value="discontinued">Eingestellt</MenuItem>
                  <MenuItem value="new">Neu</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Box display="flex" gap={1}>
                <Chip 
                  label={`${filteredAndSortedArticles.length} Artikel`} 
                  color="primary" 
                  variant="outlined"
                />
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Table */}
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <InventoryIcon sx={{ fontSize: 20 }} />
                    Artikel
                  </Box>
                </TableCell>
                <TableCell>Kategorie</TableCell>
                <TableCell>Preise</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <StorageIcon sx={{ fontSize: 20 }} />
                    Bestand
                  </Box>
                </TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Lieferant</TableCell>
                <TableCell>Typ</TableCell>
                <TableCell align="right">Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                // Loading Skeletons
                Array.from({ length: rowsPerPage }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Skeleton variant="circular" width={40} height={40} />
                        <Box>
                          <Skeleton variant="text" width={120} height={20} />
                          <Skeleton variant="text" width={80} height={16} />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell><Skeleton variant="text" width={80} /></TableCell>
                    <TableCell><Skeleton variant="text" width={60} /></TableCell>
                    <TableCell><Skeleton variant="text" width={40} /></TableCell>
                    <TableCell><Skeleton variant="text" width={60} /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} /></TableCell>
                    <TableCell><Skeleton variant="text" width={60} /></TableCell>
                    <TableCell align="right">
                      <Skeleton variant="rectangular" width={80} height={32} />
                    </TableCell>
                  </TableRow>
                ))
              ) : paginatedArticles.length === 0 ? (
                // Empty State
                <TableRow>
                  <TableCell colSpan={8}>
                    <Box textAlign="center" py={4}>
                      <InfoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" mb={1}>
                        Keine Artikel gefunden
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchTerm || categoryFilter || statusFilter 
                          ? 'Versuchen Sie andere Suchkriterien'
                          : 'Erstellen Sie Ihren ersten Artikel'
                        }
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                // Article Rows
                paginatedArticles.map((article) => {
                  const stockStatus = getStockStatus(article.current_stock, article.min_stock);
                  
                  return (
                    <TableRow key={article.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <InventoryIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {article.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {article.article_number}
                            </Typography>
                            {article.brand && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                {article.brand}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Chip 
                          label={article.category} 
                          size="small" 
                          variant="outlined"
                          icon={<CategoryIcon />}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(article.selling_price)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            EK: {formatCurrency(article.purchase_price)}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Tooltip title={stockStatus.label}>
                            <IconButton size="small" color={stockStatus.color as any}>
                              {stockStatus.icon}
                            </IconButton>
                          </Tooltip>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {article.current_stock} {article.unit}
                            </Typography>
                            {article.current_stock <= article.min_stock && (
                              <Typography variant="caption" color="warning.main">
                                Min: {article.min_stock}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Chip 
                          label={getStatusLabel(article.status)}
                          color={getStatusColor(article.status) as any}
                          size="small"
                        />
                      </TableCell>
                      
                      <TableCell>
                        {article.supplier_name ? (
                          <Typography variant="body2">
                            {article.supplier_name}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          {article.is_service && (
                            <Chip label="Service" size="small" color="info" />
                          )}
                          {article.is_digital && (
                            <Chip label="Digital" size="small" color="secondary" />
                          )}
                          {article.is_hazardous && (
                            <Chip label="Gefahrgut" size="small" color="error" />
                          )}
                        </Stack>
                      </TableCell>
                      
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Anzeigen">
                            <IconButton 
                              size="small" 
                              onClick={() => onView?.(article)}
                              color="primary"
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Bearbeiten">
                            <IconButton 
                              size="small" 
                              onClick={() => onEdit?.(article)}
                              color="primary"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Löschen">
                            <IconButton 
                              size="small" 
                              onClick={() => handleDelete(article)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredAndSortedArticles.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Zeilen pro Seite:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} von ${count !== -1 ? count : `mehr als ${to}`}`
          }
        />
      </CardContent>
    </NeuroFlowCard>
  );
};

export default NeuroFlowArticleTable; 