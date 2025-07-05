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
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaymentsIcon from '@mui/icons-material/Payments';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MoreVertIcon from '@mui/icons-material/MoreVert';

/**
 * CPD-Konten-Liste mit Suchfunktion und Paginierung
 */
const CPDAccountsList = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
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
  const mockAccounts = [
    {
      id: 1,
      accountNumber: 'CPD-10001',
      debitorAccount: '10001',
      name: 'Landwirtschaft Müller GmbH',
      industry: 'Landwirtschaft',
      city: 'Bad Bentheim',
      postalCode: '48455',
      paymentTerm1: 14,
      discount1: 2.0,
      paymentTerm2: 30,
      discount2: 0,
      isActive: true,
      creationDate: '2023-01-15'
    },
    {
      id: 2,
      accountNumber: 'CPD-10002',
      debitorAccount: '10002',
      name: 'Müller Agrar KG',
      industry: 'Landwirtschaft',
      city: 'Nordhorn',
      postalCode: '48529',
      paymentTerm1: 14,
      discount1: 3.0,
      paymentTerm2: 30,
      discount2: 0,
      isActive: true,
      creationDate: '2023-02-20'
    },
    {
      id: 3,
      accountNumber: 'CPD-10003',
      debitorAccount: '10003',
      name: 'Garten & Landschaftsbau Schmidt',
      industry: 'Gartenbau',
      city: 'Wietmarschen',
      postalCode: '49835',
      paymentTerm1: 7,
      discount1: 2.0,
      paymentTerm2: 14,
      discount2: 1.0,
      isActive: true,
      creationDate: '2023-03-10'
    },
    {
      id: 4,
      accountNumber: 'CPD-10004',
      debitorAccount: '10004',
      name: 'Logistik Meyer GmbH',
      industry: 'Transport & Logistik',
      city: 'Lingen',
      postalCode: '49808',
      paymentTerm1: 0,
      discount1: 0,
      paymentTerm2: 30,
      discount2: 0,
      isActive: false,
      creationDate: '2023-04-05'
    },
    {
      id: 5,
      accountNumber: 'CPD-10005',
      debitorAccount: '10005',
      name: 'Agravis Raiffeisen AG',
      industry: 'Landwirtschaft',
      city: 'Münster',
      postalCode: '48155',
      paymentTerm1: 14,
      discount1: 2.0,
      paymentTerm2: 30,
      discount2: 0,
      isActive: true,
      creationDate: '2023-05-20'
    }
  ];
  
  // Daten laden
  useEffect(() => {
    // API-Aufruf implementieren - später ersetzbar durch echte API
    setLoading(true);
    
    // Simuliere API-Aufruf mit Verzögerung
    setTimeout(() => {
      setAccounts(mockAccounts);
      setFilteredAccounts(mockAccounts);
      setLoading(false);
    }, 800);
    
    // Wenn die API fertig ist, kann dieser Code verwendet werden:
    /*
    fetch('/api/v1/cpd-konten')
      .then(response => response.json())
      .then(data => {
        setAccounts(data.accounts || []);
        setFilteredAccounts(data.accounts || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Fehler beim Laden der CPD-Kontendaten:', error);
        setLoading(false);
        // Fallback auf simulierte Daten, falls API nicht verfügbar
        setAccounts(mockAccounts);
        setFilteredAccounts(mockAccounts);
      });
    */
  }, []);
  
  // Suchfunktion
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredAccounts(accounts);
      return;
    }
    
    const searchTermLower = searchTerm.toLowerCase();
    const filtered = accounts.filter(account => 
      account.name.toLowerCase().includes(searchTermLower) ||
      account.accountNumber.toLowerCase().includes(searchTermLower) ||
      account.debitorAccount.toLowerCase().includes(searchTermLower) ||
      (account.postalCode && account.postalCode.toLowerCase().includes(searchTermLower)) ||
      (account.city && account.city.toLowerCase().includes(searchTermLower)) ||
      (account.industry && account.industry.toLowerCase().includes(searchTermLower))
    );
    
    setFilteredAccounts(filtered);
    setPage(0);
  }, [searchTerm, accounts]);
  
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
  const handleAddAccount = () => {
    navigate('/cpd-konten/neu');
  };
  
  const handleEditAccount = (id) => {
    navigate(`/cpd-konten/${id}/bearbeiten`);
  };
  
  const handleViewAccount = (id) => {
    navigate(`/cpd-konten/${id}`);
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
    
    // Simuliere Import mit Verzögerung
    setTimeout(() => {
      setImportLoading(false);
      setImportResult({
        success_count: 3,
        error_count: 1,
        error_messages: ['Zeile 3: Fehlende Pflichtfelder accountNumber und name']
      });
    }, 1500);
    
    // Wenn die API fertig ist:
    /*
    const formData = new FormData();
    formData.append('file', csvFile);
    
    fetch('/api/v1/cpd-konten/import-csv', {
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
          return fetch('/api/v1/cpd-konten');
        }
      })
      .then(response => {
        if (response) return response.json();
      })
      .then(data => {
        if (data) {
          setAccounts(data.accounts || []);
          setFilteredAccounts(data.accounts || []);
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
    */
  };
  
  // CSV-Export
  const handleExportClick = () => {
    handleActionMenuClose();
    
    // Simuliere Export mit Benachrichtigung
    setNotification({
      open: true,
      message: 'Export erfolgreich gestartet. Die Datei wird heruntergeladen.',
      severity: 'success'
    });
    
    // Für die echte API:
    // window.location.href = '/api/v1/cpd-konten/export-csv';
  };
  
  // Benachrichtigung schließen
  const handleNotificationClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification({ ...notification, open: false });
  };
  
  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">CPD-Konten-Stammdaten</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={handleActionMenuOpen}
            startIcon={<MoreVertIcon />}
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
              CSV-Import
            </MenuItem>
            <MenuItem onClick={handleExportClick}>
              <FileDownloadIcon fontSize="small" sx={{ mr: 1 }} />
              CSV-Export
            </MenuItem>
          </Menu>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleAddAccount}
          >
            Neues CPD-Konto
          </Button>
        </Box>
      </Box>
      
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Suchen nach Name, Kontonummer, PLZ, Ort oder Branche..."
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Konto-Nr.</TableCell>
              <TableCell>Debitoren-Konto</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>PLZ / Ort</TableCell>
              <TableCell>Zahlungsbedingungen</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Daten werden geladen...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredAccounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Keine CPD-Konten gefunden</TableCell>
              </TableRow>
            ) : (
              filteredAccounts
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(account => (
                  <TableRow key={account.id} hover>
                    <TableCell>{account.accountNumber}</TableCell>
                    <TableCell>{account.debitorAccount}</TableCell>
                    <TableCell>
                      <Typography variant="body1">{account.name}</Typography>
                      {account.industry && (
                        <Typography variant="caption" color="textSecondary">
                          {account.industry}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {account.postalCode && account.city ? 
                        `${account.postalCode} ${account.city}` : 
                        (account.city || '-')}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PaymentsIcon fontSize="small" color="primary" />
                        <Typography variant="body2">
                          {account.paymentTerm1 > 0 ? 
                            `${account.paymentTerm1} Tage / ${account.discount1}%` : 
                            'Keine Skonto'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={account.isActive ? 'Aktiv' : 'Inaktiv'} 
                        color={account.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="CPD-Konto anzeigen">
                          <IconButton 
                            size="small" 
                            color="info"
                            onClick={() => handleViewAccount(account.id)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="CPD-Konto bearbeiten">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleEditAccount(account.id)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredAccounts.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Zeilen pro Seite"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} von ${count}`}
      />
      
      {/* CSV-Import-Dialog */}
      <Dialog open={importDialog} onClose={handleImportDialogClose}>
        <DialogTitle>CPD-Kontendaten importieren</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Wählen Sie eine CSV-Datei mit CPD-Kontendaten zum Import aus. Die Datei sollte folgendes Format haben:
          </DialogContentText>
          <Typography variant="body2" component="ul" sx={{ mb: 3 }}>
            <li>Semikolon als Trennzeichen</li>
            <li>Header-Zeile mit Feldnamen</li>
            <li>Pflichtfelder: accountNumber, name</li>
          </Typography>
          
          {importLoading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 3 }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 2 }}>Import wird durchgeführt...</Typography>
            </Box>
          ) : importResult ? (
            <Box sx={{ my: 2 }}>
              <Alert severity={importResult.error_count > 0 ? 'warning' : 'success'} sx={{ mb: 2 }}>
                {importResult.success_count} CPD-Konten erfolgreich importiert.
                {importResult.error_count > 0 && ` ${importResult.error_count} Fehler beim Import.`}
              </Alert>
              
              {importResult.error_messages && importResult.error_messages.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Fehler:</Typography>
                  <Box 
                    component="ul" 
                    sx={{ 
                      maxHeight: '150px', 
                      overflowY: 'auto', 
                      bgcolor: 'error.light', 
                      color: 'error.contrastText',
                      borderRadius: 1,
                      p: 1
                    }}
                  >
                    {importResult.error_messages.map((msg, index) => (
                      <Typography component="li" variant="body2" key={index}>
                        {msg}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          ) : (
            <Button
              variant="outlined"
              component="label"
              startIcon={<FileUploadIcon />}
              sx={{ mt: 1 }}
            >
              CSV-Datei auswählen
              <input
                type="file"
                accept=".csv"
                hidden
                onChange={handleFileChange}
              />
            </Button>
          )}
          
          {csvFile && !importResult && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              Ausgewählte Datei: {csvFile.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleImportDialogClose}>
            {importResult ? 'Schließen' : 'Abbrechen'}
          </Button>
          {!importResult && !importLoading && (
            <Button 
              onClick={handleImportSubmit} 
              variant="contained" 
              color="primary"
              disabled={!csvFile}
            >
              Importieren
            </Button>
          )}
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
    </Paper>
  );
};

export default CPDAccountsList; 