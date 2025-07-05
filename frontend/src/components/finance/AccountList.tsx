import React, { useEffect, useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography, 
  TextField,
  Box,
  Chip,
  IconButton,
  CircularProgress
} from '@mui/material';
import { Search as SearchIcon, Edit as EditIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { formatCurrency } from '../../utils/formatters';

// Typendefinitionen
interface Account {
  id: number;
  kontonummer: string;
  bezeichnung: string;
  typ: 'Aktiv' | 'Passiv' | 'Ertrag' | 'Aufwand';
  saldo: number;
  waehrung: string;
  ist_aktiv: boolean;
}

const getChipColorByType = (type: string) => {
  switch (type) {
    case 'Aktiv':
      return 'primary';
    case 'Passiv':
      return 'secondary';
    case 'Ertrag':
      return 'success';
    case 'Aufwand':
      return 'error';
    default:
      return 'default';
  }
};

const AccountList: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Laden der Konten vom Server
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch('/api/v1/finanzen/konten');
        if (!response.ok) {
          throw new Error(`HTTP-Fehler: ${response.status}`);
        }
        const data = await response.json();
        setAccounts(data);
        setFilteredAccounts(data);
        setLoading(false);
      } catch (err) {
        setError('Fehler beim Laden der Konten: ' + (err instanceof Error ? err.message : String(err)));
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  // Filterung der Konten basierend auf dem Suchbegriff
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAccounts(accounts);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = accounts.filter(
        account => 
          account.kontonummer.toLowerCase().includes(term) || 
          account.bezeichnung.toLowerCase().includes(term)
      );
      setFilteredAccounts(filtered);
    }
  }, [searchTerm, accounts]);

  // Handler für Änderungen im Suchfeld
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h5" component="h2" sx={{ flexGrow: 1 }}>
          Kontenplan
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
          <TextField 
            label="Konto suchen" 
            variant="outlined" 
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table aria-label="Kontenplan-Tabelle">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.light' }}>
              <TableCell>Kontonummer</TableCell>
              <TableCell>Bezeichnung</TableCell>
              <TableCell>Typ</TableCell>
              <TableCell align="right">Saldo</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAccounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Keine Konten gefunden
                </TableCell>
              </TableRow>
            ) : (
              filteredAccounts.map((account) => (
                <TableRow 
                  key={account.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Typography fontWeight="bold">{account.kontonummer}</Typography>
                  </TableCell>
                  <TableCell>{account.bezeichnung}</TableCell>
                  <TableCell>
                    <Chip 
                      label={account.typ} 
                      color={getChipColorByType(account.typ) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(account.saldo, account.waehrung)}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={account.ist_aktiv ? 'Aktiv' : 'Inaktiv'} 
                      color={account.ist_aktiv ? 'success' : 'default'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" title="Details anzeigen">
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" title="Bearbeiten">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AccountList; 