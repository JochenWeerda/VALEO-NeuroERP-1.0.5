import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Typography,
  IconButton,
  Chip,
  InputAdornment,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Snackbar,
  Menu,
  MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MoreVertIcon from '@mui/icons-material/MoreVert';

/**
 * Kundenliste mit Suchfunktion und Paginierung
 */
const CustomerList = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [importDialog, setImportDialog] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  
  // Beispieldaten für die Entwicklung
  const mockCustomers = [
    {
      id: 1,
      customer_number: '10001',
      debitor_account: '10001',
      name: 'Landwirtschaft Müller GmbH',
      industry: 'Landwirtschaft',
      city: 'Bad Bentheim',
      postal_code: '48455',
      phone1: '05922 123456',
      email: 'info@landwirtschaft-mueller.de',
      is_active: true,
      creation_date: '2023-01-15',
      sales_rep: 'JW'
    },
    {
      id: 2,
      customer_number: '10002',
      debitor_account: '10002',
      name: 'Müller Agrar KG',
      industry: 'Landwirtschaft',
      city: 'Nordhorn',
      postal_code: '48529',
      phone1: '05921 654321',
      email: 'kontakt@mueller-agrar.de',
      is_active: true,
      creation_date: '2023-02-20',
      sales_rep: 'CHM'
    },
    {
      id: 3,
      customer_number: '10003',
      debitor_account: '10003',
      name: 'Garten & Landschaftsbau Schmidt',
      industry: 'Gartenbau',
      city: 'Wietmarschen',
      postal_code: '49835',
      phone1: '05925 987654',
      email: 'info@schmidt-gartenbau.de',
      is_active: true,
      creation_date: '2023-03-10',
      sales_rep: 'TBK'
    },
    {
      id: 4,
      customer_number: '10004',
      debitor_account: '10004',
      name: 'Logistik Meyer GmbH',
      industry: 'Transport & Logistik',
      city: 'Lingen',
      postal_code: '49808',
      phone1: '0591 123456',
      email: 'kontakt@meyer-logistik.de',
      is_active: false,
      creation_date: '2023-04-05',
      sales_rep: 'JW'
    },
    {
      id: 5,
      customer_number: '10005',
      debitor_account: '10005',
      name: 'Agravis Raiffeisen AG',
      industry: 'Landwirtschaft',
      city: 'Münster',
      postal_code: '48155',
      phone1: '0251 682-0',
      email: 'info@agravis.de',
      is_active: true,
      creation_date: '2023-05-20',
      sales_rep: 'CHM'
    }
  ];
  
  // Daten laden
  useEffect(() => {
    // API-Aufruf implementieren
    fetch('/api/v1/kundenstamm')
      .then(response => response.json())
      .then(data => {
        setCustomers(data.customers || []);
        setFilteredCustomers(data.customers || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Fehler beim Laden der Kundendaten:', error);
        setLoading(false);
        // Fallback auf simulierte Daten, falls API nicht verfügbar
        setCustomers(mockCustomers);
        setFilteredCustomers(mockCustomers);
      });
  }, []);
  
  // Suchfunktion
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(customers);
      return;
    }
    
    const searchTermLower = searchTerm.toLowerCase();
    const filtered = customers.filter(customer => 
      customer.name.toLowerCase().includes(searchTermLower) ||
      customer.customer_number.toLowerCase().includes(searchTermLower) ||
      (customer.postal_code && customer.postal_code.toLowerCase().includes(searchTermLower)) ||
      (customer.city && customer.city.toLowerCase().includes(searchTermLower)) ||
      (customer.industry && customer.industry.toLowerCase().includes(searchTermLower))
    );
    
    setFilteredCustomers(filtered);
    setPage(0);
  }, [searchTerm, customers]);
  
  // Paginierung
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Such-Handler
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Navigation
  const handleAddCustomer = () => {
    navigate('/kunden/neu');
  };
  
  const handleEditCustomer = (id) => {
    navigate(`/kunden/${id}/bearbeiten`);
  };
  
  const handleViewCustomer = (id) => {
    navigate(`/kunden/${id}`);
  };
  
  // Aktionen-Menü
  const handleActionMenuOpen = (event) => {
    setActionMenuAnchor(event.currentTarget);
  };
  
  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
  };
  
  // CSV-Import
  const handleImportClick = () => {
    setImportDialog(true);
    handleActionMenuClose();
  };
  
  const handleImportDialogClose = () => {
    setImportDialog(false);
    setImportResult(null);
    setCsvFile(null);
  };
  
  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };
  
  const handleImportSubmit = () => {
    if (!csvFile) {
      setNotification({
        open: true,
        message: 'Bitte wählen Sie eine CSV-Datei aus',
        severity: 'error'
      });
      return;
    }
    
    setImportLoading(true);
    
    const formData = new FormData();
    formData.append('file', csvFile);
    
    fetch('/api/v1/kundenstamm/import-csv', {
      method: 'POST',
      body: formData
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Fehler beim Import');
        }
        return response.json();
      })
      .then(data => {
        setImportLoading(false);
        setImportResult(data);
        
        if (data.success_count > 0) {
          // Daten neu laden
          setLoading(true);
          return fetch('/api/v1/kundenstamm');
        }
      })
      .then(response => {
        if (response) return response.json();
      })
      .then(data => {
        if (data) {
          setCustomers(data.customers || []);
          setFilteredCustomers(data.customers || []);
          setLoading(false);
        }
      })
      .catch(error => {
        console.error('Fehler beim Import:', error);
        setImportLoading(false);
        setNotification({
          open: true,
          message: 'Fehler beim Import der CSV-Datei',
          severity: 'error'
        });
      });
  };
  
  // CSV-Export
  const handleExportClick = () => {
    handleActionMenuClose();
    
    // Direkter Download der CSV-Datei
    window.location.href = '/api/v1/kundenstamm/export-csv';
  };
  
  // Benachrichtigung schließen
  const handleNotificationClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification({ ...notification, open: false });
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 2, mb: 3, width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, width: '100%' }}>
          <Typography variant="h6" component="h2">
            Kunden ({filteredCustomers.length})
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              placeholder="Kunden suchen..."
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ width: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddCustomer}
            >
              Neuer Kunde
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<MoreVertIcon />}
              onClick={handleActionMenuOpen}
            >
              Aktionen
            </Button>
            
            <Menu
              anchorEl={actionMenuAnchor}
              open={Boolean(actionMenuAnchor)}
              onClose={handleActionMenuClose}
            >
              <MenuItem onClick={handleImportClick}>
                <FileUploadIcon fontSize="small" sx={{ mr: 1 }} />
                CSV importieren
              </MenuItem>
              <MenuItem onClick={handleExportClick}>
                <FileDownloadIcon fontSize="small" sx={{ mr: 1 }} />
                CSV exportieren
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredCustomers.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            Keine Kunden gefunden. Bitte passen Sie Ihre Suche an oder fügen Sie neue Kunden hinzu.
          </Alert>
        ) : (
          <>
            <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 300px)', width: '100%' }}>
              <Table stickyHeader sx={{ minWidth: 1200 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Kundennr.</TableCell>
                    <TableCell>Debitor-Nr.</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Branche</TableCell>
                    <TableCell>PLZ</TableCell>
                    <TableCell>Ort</TableCell>
                    <TableCell>VB</TableCell>
                    <TableCell>Telefon</TableCell>
                    <TableCell>E-Mail</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Angelegt am</TableCell>
                    <TableCell align="right">Aktionen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCustomers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((customer) => (
                      <TableRow key={customer.id} hover>
                        <TableCell>{customer.customer_number}</TableCell>
                        <TableCell>{customer.debitor_account}</TableCell>
                        <TableCell>{customer.name}</TableCell>
                        <TableCell>{customer.industry}</TableCell>
                        <TableCell>{customer.postal_code}</TableCell>
                        <TableCell>{customer.city}</TableCell>
                        <TableCell>{customer.sales_rep || '-'}</TableCell>
                        <TableCell>{customer.phone1}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>
                          <Chip 
                            label={customer.is_active ? "Aktiv" : "Inaktiv"} 
                            color={customer.is_active ? "success" : "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(customer.creation_date).toLocaleDateString('de-DE')}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Details anzeigen">
                            <IconButton 
                              size="small" 
                              onClick={() => handleViewCustomer(customer.id)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Bearbeiten">
                            <IconButton 
                              size="small" 
                              onClick={() => handleEditCustomer(customer.id)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="E-Mail senden">
                            <IconButton 
                              size="small" 
                              href={`mailto:${customer.email}`}
                            >
                              <EmailIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Anrufen">
                            <IconButton 
                              size="small" 
                              href={`tel:${customer.phone1}`}
                            >
                              <PhoneIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredCustomers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Zeilen pro Seite:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} von ${count}`}
            />
          </>
        )}
      </Paper>
      
      {/* Import Dialog */}
      <Dialog open={importDialog} onClose={handleImportDialogClose}>
        <DialogTitle>CSV-Datei importieren</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Wählen Sie eine CSV-Datei mit Kundendaten zum Import aus. Die Datei sollte die folgenden Spalten enthalten: Kundennummer, Name, PLZ, Ort, Telefon, E-Mail.
          </DialogContentText>
          <Box sx={{ mt: 2 }}>
            <input
              accept=".csv"
              style={{ display: 'none' }}
              id="csv-file-input"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="csv-file-input">
              <Button 
                variant="outlined" 
                component="span"
                startIcon={<FileUploadIcon />}
              >
                CSV-Datei auswählen
              </Button>
            </label>
            {csvFile && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Ausgewählte Datei: {csvFile.name}
              </Typography>
            )}
          </Box>
          
          {importResult && (
            <Alert 
              severity={importResult.error ? "error" : "success"} 
              sx={{ mt: 2 }}
            >
              {importResult.error ? importResult.error : `${importResult.success_count} Kunden erfolgreich importiert, ${importResult.error_count} Fehler`}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleImportDialogClose}>Abbrechen</Button>
          <Button 
            onClick={handleImportSubmit}
            variant="contained" 
            disabled={!csvFile || importLoading}
            startIcon={importLoading ? <CircularProgress size={20} /> : null}
          >
            Importieren
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Benachrichtigungen */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleNotificationClose} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomerList; 