import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { de } from 'date-fns/locale';
import {
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Assessment as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Chat as ChatIcon,
  LocalOffer as OfferIcon,
  ShoppingCart as OrderIcon,
  Receipt as InvoiceIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';

interface CRMReportingAnalyticsProps {
  onReportClick?: (reportType: string, data?: any) => void;
}

interface CustomerData {
  id: string;
  name: string;
  segment: string;
  status: string;
  revenue: number;
  lastOrder: string;
  riskScore: number;
}

interface CommunicationData {
  id: string;
  customer: string;
  type: string;
  subject: string;
  date: string;
  status: string;
  outcome: string;
}

interface OfferData {
  id: string;
  customer: string;
  title: string;
  value: number;
  status: string;
  createdDate: string;
  validUntil: string;
}

interface OrderData {
  id: string;
  customer: string;
  orderNumber: string;
  total: number;
  status: string;
  orderDate: string;
  deliveryDate: string;
}

interface InvoiceData {
  id: string;
  customer: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  issueDate: string;
  dueDate: string;
}

type ReportData = CustomerData | CommunicationData | OfferData | OrderData | InvoiceData;

const CRMReportingAnalytics: React.FC<CRMReportingAnalyticsProps> = ({
  onReportClick
}) => {
  const [selectedReport, setSelectedReport] = useState<string>('customers');
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [filters, setFilters] = useState<any>({});
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<string>('excel');

  // Fetch CRM analytics data
  const { data: analytics, isLoading, error, refetch } = useQuery({
    queryKey: ['crm-analytics', selectedReport, dateFrom, dateTo, filters],
    queryFn: () => Promise.resolve({ customers: [], revenue: 0, orders: 0 }), // Mock data
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleReportChange = (reportType: string) => {
    setSelectedReport(reportType);
  };

  const handleFilterChange = (filterName: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleExport = () => {
    setIsExportDialogOpen(true);
  };

  const handleExportConfirm = () => {
    // TODO: Implement export functionality
    console.log('Exporting data in format:', exportFormat);
    setIsExportDialogOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('de-DE').format(num);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('de-DE');
  };

  const getReportData = () => {
    // Mock data for different report types
    const mockData = {
      customers: [
        {
          id: '1',
          name: 'Musterfirma GmbH',
          segment: 'Premium',
          status: 'Aktiv',
          revenue: 150000,
          lastOrder: '2024-01-20',
          riskScore: 2
        },
        {
          id: '2',
          name: 'Beispiel AG',
          segment: 'Standard',
          status: 'Aktiv',
          revenue: 75000,
          lastOrder: '2024-01-18',
          riskScore: 4
        }
      ],
      communications: [
        {
          id: '1',
          customer: 'Musterfirma GmbH',
          type: 'WhatsApp',
          subject: 'Bestellbestätigung',
          date: '2024-01-20',
          status: 'Delivered',
          outcome: 'Positive'
        },
        {
          id: '2',
          customer: 'Beispiel AG',
          type: 'Email',
          subject: 'Angebot',
          date: '2024-01-19',
          status: 'Sent',
          outcome: 'Neutral'
        }
      ],
      offers: [
        {
          id: '1',
          customer: 'Musterfirma GmbH',
          number: 'OFF-2024-001',
          title: 'Maschinenausstattung',
          amount: 50000,
          status: 'Draft',
          validUntil: '2024-02-20'
        }
      ],
      orders: [
        {
          id: '1',
          customer: 'Musterfirma GmbH',
          number: 'ORD-2024-001',
          title: 'Maschinenausstattung',
          amount: 50000,
          status: 'Confirmed',
          orderDate: '2024-01-20',
          deliveryDate: '2024-02-15'
        }
      ],
      invoices: [
        {
          id: '1',
          customer: 'Musterfirma GmbH',
          number: 'INV-2024-001',
          title: 'Maschinenausstattung',
          amount: 50000,
          status: 'Paid',
          invoiceDate: '2024-02-01',
          dueDate: '2024-03-01'
        }
      ]
    };

    return mockData[selectedReport as keyof typeof mockData] || [];
  };

  const getReportColumns = () => {
    const columns = {
      customers: [
        { field: 'name', header: 'Kundenname' },
        { field: 'segment', header: 'Segment' },
        { field: 'status', header: 'Status' },
        { field: 'revenue', header: 'Umsatz' },
        { field: 'lastOrder', header: 'Letzter Auftrag' },
        { field: 'riskScore', header: 'Risikobewertung' }
      ],
      communications: [
        { field: 'customer', header: 'Kunde' },
        { field: 'type', header: 'Typ' },
        { field: 'subject', header: 'Betreff' },
        { field: 'date', header: 'Datum' },
        { field: 'status', header: 'Status' },
        { field: 'outcome', header: 'Ergebnis' }
      ],
      offers: [
        { field: 'customer', header: 'Kunde' },
        { field: 'number', header: 'Angebotsnummer' },
        { field: 'title', header: 'Titel' },
        { field: 'amount', header: 'Betrag' },
        { field: 'status', header: 'Status' },
        { field: 'validUntil', header: 'Gültig bis' }
      ],
      orders: [
        { field: 'customer', header: 'Kunde' },
        { field: 'number', header: 'Auftragsnummer' },
        { field: 'title', header: 'Titel' },
        { field: 'amount', header: 'Betrag' },
        { field: 'status', header: 'Status' },
        { field: 'orderDate', header: 'Auftragsdatum' },
        { field: 'deliveryDate', header: 'Lieferdatum' }
      ],
      invoices: [
        { field: 'customer', header: 'Kunde' },
        { field: 'number', header: 'Rechnungsnummer' },
        { field: 'title', header: 'Titel' },
        { field: 'amount', header: 'Betrag' },
        { field: 'status', header: 'Status' },
        { field: 'invoiceDate', header: 'Rechnungsdatum' },
        { field: 'dueDate', header: 'Fälligkeitsdatum' }
      ]
    };

    return columns[selectedReport as keyof typeof columns] || [];
  };

  const renderTableCell = (row: any, column: any) => {
    const value = row[column.field];

    switch (column.field) {
      case 'revenue':
      case 'amount':
        return formatCurrency(value);
      case 'lastOrder':
      case 'date':
      case 'validUntil':
      case 'orderDate':
      case 'deliveryDate':
      case 'invoiceDate':
      case 'dueDate':
        return formatDate(value);
      case 'segment':
        return (
          <Chip
            label={value}
            color={value === 'Premium' ? 'primary' : value === 'Standard' ? 'success' : 'default'}
            size="small"
          />
        );
      case 'status':
        return (
          <Chip
            label={value}
            color={value === 'Aktiv' || value === 'Confirmed' || value === 'Paid' ? 'success' : 
                   value === 'Draft' ? 'default' : 'warning'}
            size="small"
          />
        );
      case 'type':
        return (
          <Chip
            label={value}
            color={value === 'WhatsApp' ? 'success' : value === 'Email' ? 'primary' : 'default'}
            size="small"
          />
        );
      case 'outcome':
        return (
          <Chip
            label={value}
            color={value === 'Positive' ? 'success' : value === 'Negative' ? 'error' : 'default'}
            size="small"
          />
        );
      default:
        return value;
    }
  };

  if (isLoading) {
    return (
      <Box className="flex justify-center items-center h-64">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="p-4">
        <Alert severity="error">
          Fehler beim Laden der Reporting-Daten: {error.message}
        </Alert>
      </Box>
    );
  }

  const reportData = getReportData();
  const reportColumns = getReportColumns();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
      <Box className="p-6 space-y-6">
        {/* Header */}
        <Box className="flex justify-between items-center">
          <Typography variant="h4" className="text-gray-800">
            Reporting & Analytics
          </Typography>
          <Box className="flex gap-2">
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => refetch()}
            >
              Aktualisieren
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
            >
              Exportieren
            </Button>
          </Box>
        </Box>

        {/* Report Type Selection */}
        <Card>
          <CardContent>
            <Typography variant="h6" className="mb-4">
              Berichtstyp auswählen
            </Typography>
            <Grid container spacing={2}>
              <Grid item>
                <Button
                  variant={selectedReport === 'customers' ? 'contained' : 'outlined'}
                  startIcon={<PeopleIcon />}
                  onClick={() => handleReportChange('customers')}
                >
                  Kunden
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant={selectedReport === 'communications' ? 'contained' : 'outlined'}
                  startIcon={<ChatIcon />}
                  onClick={() => handleReportChange('communications')}
                >
                  Kommunikation
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant={selectedReport === 'offers' ? 'contained' : 'outlined'}
                  startIcon={<OfferIcon />}
                  onClick={() => handleReportChange('offers')}
                >
                  Angebote
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant={selectedReport === 'orders' ? 'contained' : 'outlined'}
                  startIcon={<OrderIcon />}
                  onClick={() => handleReportChange('orders')}
                >
                  Aufträge
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant={selectedReport === 'invoices' ? 'contained' : 'outlined'}
                  startIcon={<InvoiceIcon />}
                  onClick={() => handleReportChange('invoices')}
                >
                  Rechnungen
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent>
            <Typography variant="h6" className="mb-4">
              Filter
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Von Datum"
                  value={dateFrom}
                  onChange={(newValue) => setDateFrom(newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Bis Datum"
                  value={dateTo}
                  onChange={(newValue) => setDateTo(newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="">Alle</MenuItem>
                    <MenuItem value="active">Aktiv</MenuItem>
                    <MenuItem value="inactive">Inaktiv</MenuItem>
                    <MenuItem value="draft">Entwurf</MenuItem>
                    <MenuItem value="confirmed">Bestätigt</MenuItem>
                    <MenuItem value="paid">Bezahlt</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Segment</InputLabel>
                  <Select
                    value={filters.segment || ''}
                    onChange={(e) => handleFilterChange('segment', e.target.value)}
                    label="Segment"
                  >
                    <MenuItem value="">Alle</MenuItem>
                    <MenuItem value="premium">Premium</MenuItem>
                    <MenuItem value="regular">Standard</MenuItem>
                    <MenuItem value="basic">Basic</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Report Table */}
        <Card>
          <CardContent>
            <Box className="flex justify-between items-center mb-4">
              <Typography variant="h6">
                {selectedReport === 'customers' && 'Kundenbericht'}
                {selectedReport === 'communications' && 'Kommunikationsbericht'}
                {selectedReport === 'offers' && 'Angebotsbericht'}
                {selectedReport === 'orders' && 'Auftragsbericht'}
                {selectedReport === 'invoices' && 'Rechnungsbericht'}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                {reportData.length} Einträge
              </Typography>
            </Box>

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    {reportColumns.map((column) => (
                      <TableCell key={column.field}>
                        {column.header}
                      </TableCell>
                    ))}
                    <TableCell align="right">Aktionen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.map((row) => (
                    <TableRow key={row.id} hover>
                      {reportColumns.map((column) => (
                        <TableCell key={column.field}>
                          {renderTableCell(row, column)}
                        </TableCell>
                      ))}
                      <TableCell align="right">
                        <Tooltip title="Details anzeigen">
                          <IconButton
                            size="small"
                            onClick={() => onReportClick?.(selectedReport, row)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Analytics Summary */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" className="mb-4">
                  Zusammenfassung
                </Typography>
                <Box className="space-y-2">
                  <Box className="flex justify-between">
                    <Typography variant="body2">Gesamtanzahl:</Typography>
                    <Typography variant="body2" className="font-semibold">
                      {formatNumber(reportData.length)}
                    </Typography>
                  </Box>
                  {selectedReport === 'customers' && (
                    <>
                      <Box className="flex justify-between">
                        <Typography variant="body2">Durchschnittlicher Umsatz:</Typography>
                        <Typography variant="body2" className="font-semibold">
                          {formatCurrency(reportData.reduce((sum, row) => sum + ('revenue' in row ? row.revenue : 0), 0) / reportData.length)}
                        </Typography>
                      </Box>
                      <Box className="flex justify-between">
                        <Typography variant="body2">Premium Kunden:</Typography>
                        <Typography variant="body2" className="font-semibold">
                          {formatNumber(reportData.filter(row => 'segment' in row && row.segment === 'Premium').length)}
                        </Typography>
                      </Box>
                    </>
                  )}
                  {selectedReport === 'communications' && (
                    <>
                      <Box className="flex justify-between">
                        <Typography variant="body2">WhatsApp Nachrichten:</Typography>
                        <Typography variant="body2" className="font-semibold">
                          {formatNumber(reportData.filter(row => 'type' in row && row.type === 'WhatsApp').length)}
                        </Typography>
                      </Box>
                      <Box className="flex justify-between">
                        <Typography variant="body2">Positive Ergebnisse:</Typography>
                        <Typography variant="body2" className="font-semibold">
                          {formatNumber(reportData.filter(row => 'outcome' in row && row.outcome === 'Positive').length)}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" className="mb-4">
                  Trends
                </Typography>
                <Box className="space-y-4">
                  <Box className="flex items-center justify-between p-3 bg-blue-50 rounded">
                    <Box className="flex items-center">
                      <TrendingUpIcon className="text-blue-500 mr-2" />
                      <Typography variant="body2">Wachstum</Typography>
                    </Box>
                    <Typography variant="h6" className="text-blue-600">
                      +12.5%
                    </Typography>
                  </Box>
                  
                  <Box className="flex items-center justify-between p-3 bg-green-50 rounded">
                    <Box className="flex items-center">
                      <MoneyIcon className="text-green-500 mr-2" />
                      <Typography variant="body2">Umsatz</Typography>
                    </Box>
                    <Typography variant="h6" className="text-green-600">
                      +8.3%
                    </Typography>
                  </Box>
                  
                  <Box className="flex items-center justify-between p-3 bg-purple-50 rounded">
                    <Box className="flex items-center">
                      <ChatIcon className="text-purple-500 mr-2" />
                      <Typography variant="body2">Engagement</Typography>
                    </Box>
                    <Typography variant="h6" className="text-purple-600">
                      +15.2%
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Export Dialog */}
        <Dialog open={isExportDialogOpen} onClose={() => setIsExportDialogOpen(false)}>
          <DialogTitle>Daten exportieren</DialogTitle>
          <DialogContent>
            <FormControl fullWidth className="mt-2">
              <InputLabel>Export-Format</InputLabel>
              <Select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                label="Export-Format"
              >
                <MenuItem value="excel">Excel (.xlsx)</MenuItem>
                <MenuItem value="csv">CSV (.csv)</MenuItem>
                <MenuItem value="pdf">PDF (.pdf)</MenuItem>
                <MenuItem value="json">JSON (.json)</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsExportDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button variant="contained" onClick={handleExportConfirm}>
              Exportieren
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default CRMReportingAnalytics; 