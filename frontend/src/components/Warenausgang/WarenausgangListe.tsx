import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  InventoryTwoTone as InventoryIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import warenausgangService from '../../services/warenausgangService';
import StatusBadge from '../BelegeFormular/StatusBadge';

interface WarenausgangListItem {
  id: string;
  nummer: string;
  datum: string;
  kundenName?: string;
  lieferscheinNummer?: string;
  lagerortBezeichnung: string;
  status: string;
  positionenAnzahl: number;
}

const WarenausgangListe: React.FC = () => {
  const [warenausgaenge, setWarenausgaenge] = useState<WarenausgangListItem[]>([]);
  const [filteredWarenausgaenge, setFilteredWarenausgaenge] = useState<WarenausgangListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suchbegriff, setSuchbegriff] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWarenausgaenge = async () => {
      try {
        setLoading(true);
        const data = await warenausgangService.getWarenausgaenge();
        
        // Daten transformieren für die Anzeige
        const formattedData = data.map((item: any) => ({
          id: item.id,
          nummer: item.nummer || '-',
          datum: item.datum,
          kundenName: item.kundenName || '-',
          lieferscheinNummer: item.lieferscheinNummer || '-',
          lagerortBezeichnung: item.lagerortBezeichnung || '-',
          status: item.status,
          positionenAnzahl: item.positionen?.length || 0
        }));
        
        setWarenausgaenge(formattedData);
        setFilteredWarenausgaenge(formattedData);
        setError(null);
      } catch (err) {
        console.error('Fehler beim Laden der Warenausgänge:', err);
        setError('Fehler beim Laden der Warenausgänge. Bitte versuchen Sie es später erneut.');
      } finally {
        setLoading(false);
      }
    };

    fetchWarenausgaenge();
  }, []);

  useEffect(() => {
    if (suchbegriff) {
      const lowerCaseSuchbegriff = suchbegriff.toLowerCase();
      const filtered = warenausgaenge.filter(warenausgang => 
        warenausgang.nummer.toLowerCase().includes(lowerCaseSuchbegriff) ||
        warenausgang.kundenName?.toLowerCase().includes(lowerCaseSuchbegriff) ||
        warenausgang.lagerortBezeichnung.toLowerCase().includes(lowerCaseSuchbegriff) ||
        warenausgang.lieferscheinNummer?.toLowerCase().includes(lowerCaseSuchbegriff)
      );
      setFilteredWarenausgaenge(filtered);
    } else {
      setFilteredWarenausgaenge(warenausgaenge);
    }
    setPage(0);
  }, [suchbegriff, warenausgaenge]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleNeuerWarenausgang = () => {
    navigate('/warenausgang/neu');
  };

  const handleEditWarenausgang = (id: string) => {
    navigate(`/warenausgang/${id}`);
  };

  const handleViewWarenausgang = (id: string) => {
    navigate(`/warenausgang/${id}/ansicht`);
  };

  const handleDeleteWarenausgang = async (id: string) => {
    if (!window.confirm('Möchten Sie diesen Warenausgang wirklich löschen?')) {
      return;
    }
    
    try {
      await warenausgangService.deleteWarenausgang(id);
      setWarenausgaenge(prevState => prevState.filter(wa => wa.id !== id));
      alert('Warenausgang erfolgreich gelöscht');
    } catch (err) {
      console.error('Fehler beim Löschen des Warenausgangs:', err);
      alert('Fehler beim Löschen des Warenausgangs');
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Warenausgänge
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleNeuerWarenausgang}
        >
          Neuer Warenausgang
        </Button>
      </Box>

      <Box mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Nach Nummer, Kunde, Lagerort oder Lieferschein suchen..."
          value={suchbegriff}
          onChange={(e) => setSuchbegriff(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="200px"
          sx={{ color: 'error.main' }}
        >
          <Typography>{error}</Typography>
        </Box>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nummer</TableCell>
                  <TableCell>Datum</TableCell>
                  <TableCell>Kunde</TableCell>
                  <TableCell>Lieferschein</TableCell>
                  <TableCell>Lagerort</TableCell>
                  <TableCell>Positionen</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredWarenausgaenge
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((warenausgang) => (
                    <TableRow key={warenausgang.id}>
                      <TableCell>{warenausgang.nummer}</TableCell>
                      <TableCell>{new Date(warenausgang.datum).toLocaleDateString('de-DE')}</TableCell>
                      <TableCell>{warenausgang.kundenName}</TableCell>
                      <TableCell>{warenausgang.lieferscheinNummer}</TableCell>
                      <TableCell>{warenausgang.lagerortBezeichnung}</TableCell>
                      <TableCell>
                        <Chip
                          icon={<InventoryIcon />}
                          label={warenausgang.positionenAnzahl}
                          size="small"
                          color={warenausgang.positionenAnzahl > 0 ? "primary" : "default"}
                        />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={warenausgang.status as any} />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Ansehen">
                          <IconButton onClick={() => handleViewWarenausgang(warenausgang.id)}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        {warenausgang.status !== 'gebucht' && warenausgang.status !== 'storniert' && (
                          <Tooltip title="Bearbeiten">
                            <IconButton onClick={() => handleEditWarenausgang(warenausgang.id)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {warenausgang.status === 'entwurf' && (
                          <Tooltip title="Löschen">
                            <IconButton onClick={() => handleDeleteWarenausgang(warenausgang.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredWarenausgaenge.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body1" sx={{ py: 2 }}>
                        Keine Warenausgänge gefunden
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredWarenausgaenge.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Zeilen pro Seite:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} von ${count}`}
          />
        </>
      )}
    </Paper>
  );
};

export default WarenausgangListe; 