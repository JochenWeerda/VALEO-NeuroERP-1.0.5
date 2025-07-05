import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  CircularProgress,
  Backdrop
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Layout from '../components/Layout';

/**
 * Lieferantenliste Seite
 * Zeigt alle Lieferanten in einer Tabelle an mit Filtermöglichkeiten
 */
const SupplierListPage = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Beispieldaten für die Lieferantenliste
  const mockSuppliers = [
    {
      id: '1',
      supplier_number: '612300',
      name: 'Hans Eilers',
      name2: 'Tiernahrung-Blecky',
      postal_code: '27777',
      city: 'Ganderkesee',
      is_active: true,
      is_grain_supplier: true
    },
    {
      id: '2',
      supplier_number: '453211',
      name: 'Müller GmbH & Co. KG',
      name2: 'Großhandel',
      postal_code: '28195',
      city: 'Bremen',
      is_active: true,
      is_grain_supplier: false
    },
    {
      id: '3',
      supplier_number: '781234',
      name: 'Futtermittel Schmidt',
      name2: '',
      postal_code: '49661',
      city: 'Cloppenburg',
      is_active: true,
      is_grain_supplier: false
    },
    {
      id: '4',
      supplier_number: '984522',
      name: 'Bio-Hof Petersen',
      name2: 'Direktvermarktung',
      postal_code: '24782',
      city: 'Büdelsdorf',
      is_active: false,
      is_grain_supplier: true
    },
    {
      id: '5',
      supplier_number: '552398',
      name: 'Landmaschinen Krause',
      name2: '',
      postal_code: '26655',
      city: 'Westerstede',
      is_active: true,
      is_grain_supplier: false
    }
  ];

  // Simuliere API-Aufruf zum Laden der Lieferanten
  useEffect(() => {
    // In Produktionssystem würde hier ein API-Aufruf stattfinden
    // fetch('/api/v1/lieferantenstamm')
    //   .then(response => response.json())
    //   .then(data => {
    //     setSuppliers(data);
    //     setFilteredSuppliers(data);
    //     setLoading(false);
    //   })
    //   .catch(error => {
    //     console.error('Fehler beim Laden der Lieferanten:', error);
    //     setLoading(false);
    //   });
    
    // Simuliere API-Aufruf mit Timeout
    setTimeout(() => {
      setSuppliers(mockSuppliers);
      setFilteredSuppliers(mockSuppliers);
      setLoading(false);
    }, 1000);
  }, []);

  // Filtern der Lieferanten basierend auf dem Suchbegriff
  useEffect(() => {
    const results = suppliers.filter(supplier => 
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.supplier_number.includes(searchTerm) ||
      supplier.postal_code.includes(searchTerm) ||
      supplier.city.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSuppliers(results);
    setPage(0);
  }, [searchTerm, suppliers]);

  // Seitenänderung
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Änderung der Zeilen pro Seite
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Suchbegriff-Änderung
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Neuen Lieferanten anlegen
  const handleCreateSupplier = () => {
    navigate('/lieferanten/neu');
  };

  // Lieferanten bearbeiten
  const handleEditSupplier = (id) => {
    navigate(`/lieferanten/${id}/bearbeiten`);
  };

  // Lieferanten anzeigen
  const handleViewSupplier = (id) => {
    navigate(`/lieferanten/${id}`);
  };

  return (
    <Layout>
      <Box sx={{ p: 3, maxWidth: '100%' }}>
        <Paper sx={{ p: 3, width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">Lieferantenstammdaten</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateSupplier}
            >
              Neuer Lieferant
            </Button>
          </Box>

          <TextField
            fullWidth
            margin="normal"
            placeholder="Suchen nach Lieferantennummer, Name, PLZ oder Ort..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ mb: 3 }}
          />

          <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 300px)' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Lieferanten-Nr.</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>PLZ</TableCell>
                  <TableCell>Ort</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Getreidelieferant</TableCell>
                  <TableCell align="right">Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSuppliers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((supplier) => (
                    <TableRow key={supplier.id} hover>
                      <TableCell>{supplier.supplier_number}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body1">{supplier.name}</Typography>
                          {supplier.name2 && (
                            <Typography variant="body2" color="textSecondary">
                              {supplier.name2}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{supplier.postal_code}</TableCell>
                      <TableCell>{supplier.city}</TableCell>
                      <TableCell>
                        <Chip 
                          label={supplier.is_active ? "Aktiv" : "Inaktiv"} 
                          color={supplier.is_active ? "success" : "default"} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        {supplier.is_grain_supplier ? (
                          <Chip label="Ja" color="primary" size="small" />
                        ) : (
                          <Chip label="Nein" color="default" size="small" variant="outlined" />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleViewSupplier(supplier.id)}
                          size="small"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton 
                          color="secondary" 
                          onClick={() => handleEditSupplier(supplier.id)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredSuppliers.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body1" sx={{ py: 2 }}>
                        Keine Lieferanten gefunden
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredSuppliers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Zeilen pro Seite:"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} von ${count}`}
          />
        </Paper>
      </Box>
      
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Layout>
  );
};

export default SupplierListPage; 