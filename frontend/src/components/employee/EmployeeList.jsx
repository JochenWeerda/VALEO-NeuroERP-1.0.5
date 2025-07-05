import React, { useState, useEffect } from 'react';
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
  Alert,
  Snackbar,
  FormControlLabel,
  Switch
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';

/**
 * Mitarbeiterliste mit Suchfunktion und Paginierung
 */
const EmployeeList = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSalesRepsOnly, setShowSalesRepsOnly] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  // Beispieldaten für die Entwicklung
  const mockEmployees = [
    {
      id: 1,
      username: 'jweerda',
      full_name: 'Jochen Weerda',
      email: 'j.weerda@example.com',
      phone: '0123-456789',
      department: 'Vertrieb',
      position: 'Vertriebsleiter',
      is_active: true,
      is_sales_rep: true,
      sales_rep_code: 'JW',
      created_at: '2023-01-10T08:00:00Z'
    },
    {
      id: 2,
      username: 'chabbena',
      full_name: 'Claudia Habbena-Meyer',
      email: 'c.habbena-meyer@example.com',
      phone: '0123-456788',
      department: 'Vertrieb',
      position: 'Vertriebsmitarbeiterin',
      is_active: true,
      is_sales_rep: true,
      sales_rep_code: 'CHM',
      created_at: '2023-02-15T08:00:00Z'
    },
    {
      id: 3,
      username: 'tkleemann',
      full_name: 'Tjarde Berend Kleemann',
      email: 't.kleemann@example.com',
      phone: '0123-456787',
      department: 'Vertrieb',
      position: 'Key Account Manager',
      is_active: true,
      is_sales_rep: true,
      sales_rep_code: 'TBK',
      created_at: '2023-03-20T08:00:00Z'
    },
    {
      id: 4,
      username: 'amueller',
      full_name: 'Andreas Müller',
      email: 'a.mueller@example.com',
      phone: '0123-456786',
      department: 'IT',
      position: 'IT-Administrator',
      is_active: true,
      is_sales_rep: false,
      sales_rep_code: null,
      created_at: '2023-04-05T08:00:00Z'
    },
    {
      id: 5,
      username: 'mschmidt',
      full_name: 'Monika Schmidt',
      email: 'm.schmidt@example.com',
      phone: '0123-456785',
      department: 'Buchhaltung',
      position: 'Buchhalterin',
      is_active: true,
      is_sales_rep: false,
      sales_rep_code: null,
      created_at: '2023-05-10T08:00:00Z'
    }
  ];
  
  // Daten laden
  useEffect(() => {
    // API-Aufruf implementieren
    fetch('/api/v1/users')
      .then(response => response.json())
      .then(data => {
        setEmployees(data || []);
        setFilteredEmployees(data || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Fehler beim Laden der Mitarbeiterdaten:', error);
        setLoading(false);
        // Fallback auf simulierte Daten, falls API nicht verfügbar
        setEmployees(mockEmployees);
        setFilteredEmployees(mockEmployees);
      });
  }, []);
  
  // Suchfunktion und Filter
  useEffect(() => {
    let filtered = employees;
    
    // Filter für Vertriebsberater
    if (showSalesRepsOnly) {
      filtered = filtered.filter(employee => employee.is_sales_rep);
    }
    
    // Suchfilter
    if (searchTerm.trim()) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(employee => 
        employee.full_name.toLowerCase().includes(searchTermLower) ||
        employee.username.toLowerCase().includes(searchTermLower) ||
        employee.email.toLowerCase().includes(searchTermLower) ||
        (employee.department && employee.department.toLowerCase().includes(searchTermLower)) ||
        (employee.position && employee.position.toLowerCase().includes(searchTermLower)) ||
        (employee.sales_rep_code && employee.sales_rep_code.toLowerCase().includes(searchTermLower))
      );
    }
    
    setFilteredEmployees(filtered);
    setPage(0);
  }, [searchTerm, employees, showSalesRepsOnly]);
  
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
  
  // Toggle für Vertriebsberater-Filter
  const handleSalesRepFilterChange = (e) => {
    setShowSalesRepsOnly(e.target.checked);
  };
  
  // Navigation
  const handleAddEmployee = () => {
    navigate('/mitarbeiter/neu');
  };
  
  const handleEditEmployee = (id) => {
    navigate(`/mitarbeiter/${id}/bearbeiten`);
  };
  
  const handleViewEmployee = (id) => {
    navigate(`/mitarbeiter/${id}`);
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
            Mitarbeiter ({filteredEmployees.length})
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              placeholder="Mitarbeiter suchen..."
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
            
            <FormControlLabel
              control={
                <Switch 
                  checked={showSalesRepsOnly}
                  onChange={handleSalesRepFilterChange}
                />
              }
              label="Nur Vertriebsberater"
              sx={{ mr: 2 }}
            />
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddEmployee}
            >
              Neuer Mitarbeiter
            </Button>
          </Box>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredEmployees.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            Keine Mitarbeiter gefunden. Bitte passen Sie Ihre Suche an oder fügen Sie neue Mitarbeiter hinzu.
          </Alert>
        ) : (
          <>
            <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 300px)', width: '100%' }}>
              <Table stickyHeader sx={{ minWidth: 1200 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Benutzername</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Abteilung</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>VB-Kürzel</TableCell>
                    <TableCell>Telefon</TableCell>
                    <TableCell>E-Mail</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Aktionen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEmployees
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((employee) => (
                      <TableRow key={employee.id} hover>
                        <TableCell>{employee.username}</TableCell>
                        <TableCell>{employee.full_name}</TableCell>
                        <TableCell>{employee.department}</TableCell>
                        <TableCell>{employee.position}</TableCell>
                        <TableCell>
                          {employee.is_sales_rep && employee.sales_rep_code ? (
                            <Chip 
                              label={employee.sales_rep_code} 
                              color="primary"
                              size="small"
                            />
                          ) : '-'}
                        </TableCell>
                        <TableCell>{employee.phone}</TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>
                          <Chip 
                            label={employee.is_active ? "Aktiv" : "Inaktiv"} 
                            color={employee.is_active ? "success" : "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Details anzeigen">
                            <IconButton 
                              size="small" 
                              onClick={() => handleViewEmployee(employee.id)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Bearbeiten">
                            <IconButton 
                              size="small" 
                              onClick={() => handleEditEmployee(employee.id)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="E-Mail senden">
                            <IconButton 
                              size="small" 
                              href={`mailto:${employee.email}`}
                            >
                              <EmailIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Anrufen">
                            <IconButton 
                              size="small" 
                              href={`tel:${employee.phone}`}
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
              count={filteredEmployees.length}
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

export default EmployeeList; 