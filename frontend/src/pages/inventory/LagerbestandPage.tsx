import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Autocomplete,
  FormControlLabel,
  Checkbox,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
  CircularProgress,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Alert
} from '@mui/material';
import {
  Search,
  FilterList,
  FileDownload,
  MoreVert,
  TrendingUp,
  Inventory,
  SwapHoriz,
  Edit,
  History
} from '@mui/icons-material';
import lagerService, { 
  Lagerbestand, 
  LagerFilterOptions 
} from '../../services/lagerService';

const LagerbestandPage: React.FC = () => {
  const [bestaende, setBestaende] = useState<Lagerbestand[]>([]);
  const [filteredBestaende, setFilteredBestaende] = useState<Lagerbestand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [suchbegriff, setSuchbegriff] = useState('');
  
  const [filterOptions, setFilterOptions] = useState<LagerFilterOptions>({
    nullBestaendeVerbergen: true
  });
  
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [niederlassungen, setNiederlassungen] = useState<string[]>([]);
  const [lagerhallen, setLagerhallen] = useState<string[]>([]);
  const [artikelgruppen, setArtikelgruppen] = useState<string[]>([]);
  
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<Lagerbestand | null>(null);
  
  // Bestandsdaten laden
  useEffect(() => {
    loadBestaende();
    loadFilterOptions();
  }, []);
  
  // Filtere die Bestände, wenn sich der Suchbegriff oder die Filteroptionen ändern
  useEffect(() => {
    filterBestaende();
  }, [bestaende, suchbegriff, filterOptions]);
  
  const loadBestaende = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await lagerService.getLagerbestand(filterOptions);
      setBestaende(data);
    } catch (error) {
      console.error('Fehler beim Laden der Lagerbestände:', error);
      setError('Die Lagerbestände konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadFilterOptions = async () => {
    try {
      // Niederlassungen und Lagerhallen laden
      const lagerorte = await lagerService.getLagerorte();
      const niederlassungenSet = new Set<string>();
      const lagerhallenSet = new Set<string>();
      
      lagerorte.forEach(lagerort => {
        niederlassungenSet.add(lagerort.lager_bezeichnung);
        lagerhallenSet.add(lagerort.bezeichnung);
      });
      
      setNiederlassungen(Array.from(niederlassungenSet));
      setLagerhallen(Array.from(lagerhallenSet));
      
      // Artikelgruppen laden (hier als Beispiel statisch)
      setArtikelgruppen([
        'Futtermittel',
        'Düngemittel',
        'Saatgut',
        'Pflanzenschutz',
        'Sonstiges'
      ]);
    } catch (error) {
      console.error('Fehler beim Laden der Filter-Optionen:', error);
      setError('Fehler beim Laden der Filter-Optionen');
    }
  };
  
  const filterBestaende = () => {
    let filtered = [...bestaende];
    
    // Textsuche anwenden
    if (suchbegriff) {
      const lowerSuchbegriff = suchbegriff.toLowerCase();
      filtered = filtered.filter(item =>
        item.artikel_nr.toLowerCase().includes(lowerSuchbegriff) ||
        item.bezeichnung.toLowerCase().includes(lowerSuchbegriff) ||
        item.lagerhalle.toLowerCase().includes(lowerSuchbegriff) ||
        item.artikelgruppe.toLowerCase().includes(lowerSuchbegriff)
      );
    }
    
    // Filteroptionen anwenden
    if (filterOptions.nullBestaendeVerbergen) {
      filtered = filtered.filter(item => item.buch_bestand > 0);
    }
    
    if (filterOptions.niederlassung) {
      filtered = filtered.filter(item => item.lagerhalle.includes(filterOptions.niederlassung!));
    }
    
    if (filterOptions.lagerhalle) {
      filtered = filtered.filter(item => item.lagerhalle === filterOptions.lagerhalle);
    }
    
    if (filterOptions.artikelgruppe) {
      filtered = filtered.filter(item => item.artikelgruppe === filterOptions.artikelgruppe);
    }
    
    if (filterOptions.artikelnummer) {
      filtered = filtered.filter(item => item.artikel_nr.includes(filterOptions.artikelnummer!));
    }
    
    setFilteredBestaende(filtered);
  };
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleFilterChange = (field: keyof LagerFilterOptions, value: any) => {
    setFilterOptions(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, row: Lagerbestand) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedRow(null);
  };
  
  const handleExportBestand = async () => {
    try {
      const blob = await lagerService.exportBestandsUebersicht('excel', filterOptions);
      
      // Blob als Datei herunterladen
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `Lagerbestand_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Fehler beim Exportieren der Bestandsübersicht:', error);
      setError('Die Bestandsübersicht konnte nicht exportiert werden.');
    }
  };
  
  const handleUmlagerung = () => {
    if (selectedRow) {
      handleMenuClose();
      // Hier zur Umlagerungsseite navigieren
      window.location.href = `/lager/umlagerung?artikel=${selectedRow.artikel_id}`;
    }
  };
  
  const handleLagerkorrektur = () => {
    if (selectedRow) {
      handleMenuClose();
      // Hier zur Korrekturseite navigieren
      window.location.href = `/lager/korrektur?artikel=${selectedRow.artikel_id}`;
    }
  };
  
  const handleArtikelHistorie = () => {
    if (selectedRow) {
      handleMenuClose();
      // Hier zur Historieseite navigieren
      window.location.href = `/lager/historie?artikel=${selectedRow.artikel_id}`;
    }
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" component="h1">
          Lagerbestand
        </Typography>
        
        <Box>
          <Button
            variant="outlined"
            startIcon={<FileDownload />}
            onClick={handleExportBestand}
            sx={{ ml: 1 }}
          >
            Exportieren
          </Button>
        </Box>
      </Box>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <TextField
              placeholder="Suchen..."
              variant="outlined"
              size="small"
              value={suchbegriff}
              onChange={(e) => setSuchbegriff(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 300 }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              sx={{ ml: 2 }}
            >
              Filter
            </Button>
          </Box>
          
          <FormControlLabel
            control={
              <Checkbox
                checked={filterOptions.nullBestaendeVerbergen || false}
                onChange={(e) => handleFilterChange('nullBestaendeVerbergen', e.target.checked)}
              />
            }
            label="Null-Bestände verbergen"
          />
        </Box>
        
        {showFilterPanel && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Erweiterte Filter
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Autocomplete
                  options={niederlassungen}
                  value={filterOptions.niederlassung || null}
                  onChange={(event, newValue) => handleFilterChange('niederlassung', newValue)}
                  renderInput={(params) => <TextField {...params} label="Niederlassung" fullWidth />}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Autocomplete
                  options={lagerhallen}
                  value={filterOptions.lagerhalle || null}
                  onChange={(event, newValue) => handleFilterChange('lagerhalle', newValue)}
                  renderInput={(params) => <TextField {...params} label="Lagerhalle" fullWidth />}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Autocomplete
                  options={artikelgruppen}
                  value={filterOptions.artikelgruppe || null}
                  onChange={(event, newValue) => handleFilterChange('artikelgruppe', newValue)}
                  renderInput={(params) => <TextField {...params} label="Artikelgruppe" fullWidth />}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Artikelnummer"
                  fullWidth
                  value={filterOptions.artikelnummer || ''}
                  onChange={(e) => handleFilterChange('artikelnummer', e.target.value)}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setFilterOptions({
                    nullBestaendeVerbergen: true
                  });
                }}
                sx={{ mr: 1 }}
              >
                Zurücksetzen
              </Button>
              <Button
                variant="contained"
                onClick={loadBestaende}
              >
                Anwenden
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ width: '100%' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Lagerhalle</TableCell>
                <TableCell>Artikel-Nr.</TableCell>
                <TableCell>Bezeichnung</TableCell>
                <TableCell align="right">Min.-Bestand</TableCell>
                <TableCell align="right">Max.-Bestand</TableCell>
                <TableCell align="right">Buch-Bestand</TableCell>
                <TableCell align="right">Verfügbarer Bestand</TableCell>
                <TableCell align="right">Phys. Bestand</TableCell>
                <TableCell align="right">Ø EK-Preis</TableCell>
                <TableCell align="right">letzter EK-Preis</TableCell>
                <TableCell align="right">Bewerteter Preis</TableCell>
                <TableCell align="right">Bestandswert</TableCell>
                <TableCell>letztes Datum</TableCell>
                <TableCell align="center">Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={14} align="center">
                    <CircularProgress size={40} sx={{ my: 2 }} />
                  </TableCell>
                </TableRow>
              ) : filteredBestaende.length > 0 ? (
                filteredBestaende
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <TableRow key={`${row.artikel_id}-${row.lagerhalle}`} hover>
                      <TableCell>{row.lagerhalle}</TableCell>
                      <TableCell>{row.artikel_nr}</TableCell>
                      <TableCell>{row.bezeichnung}</TableCell>
                      <TableCell align="right">{row.min_bestand?.toLocaleString('de-DE') || '-'}</TableCell>
                      <TableCell align="right">{row.max_bestand?.toLocaleString('de-DE') || '-'}</TableCell>
                      <TableCell align="right">{row.buch_bestand.toLocaleString('de-DE')}</TableCell>
                      <TableCell align="right">{row.verfuegbarer_bestand.toLocaleString('de-DE')}</TableCell>
                      <TableCell align="right">{row.phys_bestand?.toLocaleString('de-DE') || '-'}</TableCell>
                      <TableCell align="right">
                        {row.avg_ek_preis?.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) || '-'}
                      </TableCell>
                      <TableCell align="right">
                        {row.letzter_ek_preis?.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) || '-'}
                      </TableCell>
                      <TableCell align="right">
                        {row.bewerteter_preis.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </TableCell>
                      <TableCell align="right">
                        {row.bestandswert.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </TableCell>
                      <TableCell>
                        {row.letztes_datum ? new Date(row.letztes_datum).toLocaleDateString('de-DE') : '-'}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, row)}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={14} align="center">
                    <Typography variant="body2" sx={{ py: 2 }}>
                      Keine Lagerbestände gefunden, die den Filterkriterien entsprechen.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          component="div"
          count={filteredBestaende.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Zeilen pro Seite:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} von ${count}`}
        />
      </Paper>
      
      {/* Kontextmenü für Tabellenzeilen */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleUmlagerung}>
          <ListItemIcon>
            <SwapHoriz fontSize="small" />
          </ListItemIcon>
          <ListItemText>Umlagerung</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleLagerkorrektur}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Lagerkorrektur</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleArtikelHistorie}>
          <ListItemIcon>
            <History fontSize="small" />
          </ListItemIcon>
          <ListItemText>Artikelhistorie</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default LagerbestandPage; 