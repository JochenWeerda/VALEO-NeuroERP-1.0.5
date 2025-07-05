import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  IconButton,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import LinkIcon from '@mui/icons-material/Link';
import TimelineIcon from '@mui/icons-material/Timeline';
import { Charge, getAllChargen, searchChargen } from '../../services/inventoryApi';

interface ChargeListProps {
  onViewCharge?: (charge: Charge) => void;
  onEditCharge?: (charge: Charge) => void;
  onTraceCharge?: (charge: Charge) => void;
  onLinkCharge?: (charge: Charge) => void;
}

const ChargeList: React.FC<ChargeListProps> = ({ 
  onViewCharge, 
  onEditCharge,
  onTraceCharge,
  onLinkCharge
}) => {
  const [chargen, setChargen] = useState<Charge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Paginierung
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filter
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    chargennummer: '',
    artikel_id: '',
    status: '',
    datum_von: '',
    datum_bis: '',
    lieferant_id: '',
  });

  useEffect(() => {
    fetchChargen();
  }, []);

  const fetchChargen = async () => {
    setLoading(true);
    try {
      const data = await getAllChargen();
      setChargen(data);
      setError(null);
    } catch (err) {
      console.error('Fehler beim Laden der Chargen:', err);
      setError('Fehler beim Laden der Daten. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const applyFilters = async () => {
    setLoading(true);
    try {
      // Filter leere Werte herausfiltern
      const filterParams = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string | number>);
      
      const data = await searchChargen(filterParams);
      setChargen(data);
      setError(null);
    } catch (err) {
      console.error('Fehler beim Filtern der Chargen:', err);
      setError('Fehler beim Filtern der Daten. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      chargennummer: '',
      artikel_id: '',
      status: '',
      datum_von: '',
      datum_bis: '',
      lieferant_id: '',
    });
    fetchChargen();
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h1">
          Chargenverwaltung
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<FilterAltIcon />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ mr: 1 }}
          >
            {showFilters ? 'Filter ausblenden' : 'Filter anzeigen'}
          </Button>
        </Box>
      </Box>

      {showFilters && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Chargennummer"
                name="chargennummer"
                value={filters.chargennummer}
                onChange={handleFilterChange}
                variant="outlined"
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Artikel"
                name="artikel_id"
                value={filters.artikel_id}
                onChange={handleFilterChange}
                variant="outlined"
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                label="Status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                variant="outlined"
                size="small"
                fullWidth
              >
                <MenuItem value="">Alle</MenuItem>
                <MenuItem value="neu">Neu</MenuItem>
                <MenuItem value="in_verwendung">In Verwendung</MenuItem>
                <MenuItem value="gesperrt">Gesperrt</MenuItem>
                <MenuItem value="freigegeben">Freigegeben</MenuItem>
                <MenuItem value="verbraucht">Verbraucht</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Lieferant"
                name="lieferant_id"
                value={filters.lieferant_id}
                onChange={handleFilterChange}
                variant="outlined"
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Datum von"
                name="datum_von"
                type="date"
                value={filters.datum_von}
                onChange={handleFilterChange}
                variant="outlined"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Datum bis"
                name="datum_bis"
                type="date"
                value={filters.datum_bis}
                onChange={handleFilterChange}
                variant="outlined"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <Box display="flex" justifyContent="flex-end">
                <Button 
                  variant="outlined" 
                  onClick={resetFilters} 
                  sx={{ mr: 1 }}
                >
                  Zurücksetzen
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<SearchIcon />}
                  onClick={applyFilters}
                >
                  Suchen
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {error ? (
          <Box p={2} textAlign="center">
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
              <Table stickyHeader aria-label="Chargen Tabelle">
                <TableHead>
                  <TableRow>
                    <TableCell>Chargennummer</TableCell>
                    <TableCell>Artikel</TableCell>
                    <TableCell>Menge</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Herstelldatum</TableCell>
                    <TableCell>MHD</TableCell>
                    <TableCell>Aktionen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">Lade Daten...</TableCell>
                    </TableRow>
                  ) : chargen.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">Keine Chargen gefunden</TableCell>
                    </TableRow>
                  ) : (
                    chargen
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((charge) => (
                        <TableRow key={charge.id} hover>
                          <TableCell>{charge.chargennummer}</TableCell>
                          <TableCell>{charge.artikel_name || `Artikel ${charge.artikel_id}`}</TableCell>
                          <TableCell>
                            {charge.menge !== undefined ? `${charge.menge} kg` : '-'}
                          </TableCell>
                          <TableCell>{charge.status}</TableCell>
                          <TableCell>{charge.herstelldatum || '-'}</TableCell>
                          <TableCell>{charge.mindesthaltbarkeitsdatum || '-'}</TableCell>
                          <TableCell>
                            <Box>
                              {onViewCharge && (
                                <Tooltip title="Details anzeigen">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => onViewCharge(charge)}
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {onEditCharge && (
                                <Tooltip title="Bearbeiten">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => onEditCharge(charge)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {onTraceCharge && (
                                <Tooltip title="Rückverfolgung">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => onTraceCharge(charge)}
                                  >
                                    <TimelineIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {onLinkCharge && (
                                <Tooltip title="Chargen verknüpfen">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => onLinkCharge(charge)}
                                  >
                                    <LinkIcon fontSize="small" />
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
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={chargen.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Zeilen pro Seite:"
              labelDisplayedRows={({ from, to, count }) => 
                `${from}-${to} von ${count !== -1 ? count : `mehr als ${to}`}`
              }
            />
          </>
        )}
      </Paper>
    </Box>
  );
};

export default ChargeList; 