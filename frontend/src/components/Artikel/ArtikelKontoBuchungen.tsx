import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Chip,
  Typography,
  Divider,
  TableSortLabel
} from '@mui/material';
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import { ArtikelkontoBuchung } from '../../services/artikelkontoApi';

interface ArtikelKontoBuchungenProps {
  buchungen: ArtikelkontoBuchung[];
  summierungArtikelUmbuchungen: boolean;
}

type SortField = 'Datum' | 'BelegNr' | 'DebitorKreditorName' | 'Menge' | 'Einzelpreis' | 'Gesamtbetrag';
type SortDirection = 'asc' | 'desc';

const ArtikelKontoBuchungen: React.FC<ArtikelKontoBuchungenProps> = ({
  buchungen,
  summierungArtikelUmbuchungen
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>('Datum');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);
  
  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);
  
  const handleSort = useCallback((field: SortField) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortField(field);
  }, [sortField, sortDirection]);
  
  // Wenn Summierung aktiviert ist, dann Umbuchungen zusammenfassen
  const displayBuchungen = useMemo(() => {
    let result = [...buchungen];
    
    if (summierungArtikelUmbuchungen) {
      // Gruppiere Umbuchungen vom gleichen Tag
      const grouped = buchungen.reduce<Record<string, ArtikelkontoBuchung[]>>((acc, buchung) => {
        // Gruppiere nur interne Umbuchungen
        if (buchung.Bemerkung === 'Umbuchung') {
          const key = `${buchung.Datum}_${buchung.BelegNr}`;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(buchung);
        }
        return acc;
      }, {});
      
      // Ersetze Umbuchungsgruppen durch eine einzelne summierte Buchung
      result = [...buchungen];
      
      Object.values(grouped).forEach(group => {
        if (group.length > 1) {
          // Entferne alle Einzelbuchungen dieser Gruppe
          group.forEach(buchung => {
            const index = result.findIndex(b => 
              b.Datum === buchung.Datum && 
              b.BelegNr === buchung.BelegNr && 
              b.Bemerkung === buchung.Bemerkung
            );
            if (index !== -1) {
              result.splice(index, 1);
            }
          });
          
          // Berechne die Summe aller Mengen und Beträge
          const sumMenge = group.reduce((sum, b) => sum + b.Menge, 0);
          const sumBetrag = group.reduce((sum, b) => sum + b.Gesamtbetrag, 0);
          
          // Füge eine summierte Buchung hinzu
          if (sumMenge !== 0 || sumBetrag !== 0) {
            const firstBuchung = group[0];
            result.push({
              ...firstBuchung,
              Menge: sumMenge,
              Gesamtbetrag: sumBetrag,
              Bemerkung: `Umbuchung (${group.length} Positionen)`
            });
          }
        }
      });
    }
    
    // Sortiere nach ausgewähltem Feld und Richtung
    return result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'Datum':
          comparison = new Date(a.Datum).getTime() - new Date(b.Datum).getTime();
          break;
        case 'BelegNr':
          comparison = a.BelegNr.localeCompare(b.BelegNr);
          break;
        case 'DebitorKreditorName':
          comparison = a.DebitorKreditorName.localeCompare(b.DebitorKreditorName);
          break;
        case 'Menge':
          comparison = a.Menge - b.Menge;
          break;
        case 'Einzelpreis':
          comparison = a.Einzelpreis - b.Einzelpreis;
          break;
        case 'Gesamtbetrag':
          comparison = a.Gesamtbetrag - b.Gesamtbetrag;
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [buchungen, summierungArtikelUmbuchungen, sortField, sortDirection]);
  
  const paginatedBuchungen = useMemo(() => {
    return displayBuchungen.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [displayBuchungen, page, rowsPerPage]);
  
  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'Datum'}
                  direction={sortField === 'Datum' ? sortDirection : 'asc'}
                  onClick={() => handleSort('Datum')}
                >
                  Datum
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'BelegNr'}
                  direction={sortField === 'BelegNr' ? sortDirection : 'asc'}
                  onClick={() => handleSort('BelegNr')}
                >
                  Beleg
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'DebitorKreditorName'}
                  direction={sortField === 'DebitorKreditorName' ? sortDirection : 'asc'}
                  onClick={() => handleSort('DebitorKreditorName')}
                >
                  Geschäftspartner
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sortField === 'Menge'}
                  direction={sortField === 'Menge' ? sortDirection : 'asc'}
                  onClick={() => handleSort('Menge')}
                >
                  Menge
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sortField === 'Einzelpreis'}
                  direction={sortField === 'Einzelpreis' ? sortDirection : 'asc'}
                  onClick={() => handleSort('Einzelpreis')}
                >
                  Einzelpreis
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sortField === 'Gesamtbetrag'}
                  direction={sortField === 'Gesamtbetrag' ? sortDirection : 'asc'}
                  onClick={() => handleSort('Gesamtbetrag')}
                >
                  Gesamtbetrag
                </TableSortLabel>
              </TableCell>
              <TableCell>Lager</TableCell>
              <TableCell>Charge</TableCell>
              <TableCell>Bemerkung</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedBuchungen.map((buchung, index) => (
              <TableRow 
                key={`${buchung.Datum}_${buchung.BelegNr}_${index}`}
                sx={{ 
                  '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                  bgcolor: buchung.Menge < 0 ? 'rgba(244, 67, 54, 0.05)' : 
                           buchung.Menge > 0 ? 'rgba(76, 175, 80, 0.05)' : 'inherit'
                }}
              >
                <TableCell>{new Date(buchung.Datum).toLocaleDateString('de-DE')}</TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {buchung.BelegNr}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" display="block">
                    {buchung.LieferscheinNr}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {buchung.DebitorKreditorName}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" display="block">
                    {buchung.DebitorKreditorNr}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box display="flex" alignItems="center" justifyContent="flex-end">
                    {buchung.Menge > 0 && <ArrowUpwardIcon fontSize="small" color="success" sx={{ mr: 0.5 }} />}
                    {buchung.Menge < 0 && <ArrowDownwardIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />}
                    <Typography
                      variant="body2"
                      color={buchung.Menge > 0 ? 'success.main' : buchung.Menge < 0 ? 'error.main' : 'inherit'}
                      fontWeight="medium"
                    >
                      {Math.abs(buchung.Menge)} {buchung.Einheit}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  {buchung.Einzelpreis.toFixed(2)} €
                </TableCell>
                <TableCell align="right">
                  <Typography 
                    variant="body2" 
                    fontWeight="medium"
                    color={buchung.Gesamtbetrag > 0 ? 'success.main' : buchung.Gesamtbetrag < 0 ? 'error.main' : 'inherit'}
                  >
                    {buchung.Gesamtbetrag.toFixed(2)} €
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {buchung.Lagerfach}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" display="block">
                    {buchung.Niederlassung}
                  </Typography>
                </TableCell>
                <TableCell>{buchung.ChargenNr}</TableCell>
                <TableCell>
                  {buchung.Bemerkung.includes('Umbuchung') ? (
                    <Chip 
                      label={buchung.Bemerkung} 
                      size="small" 
                      color="info" 
                      variant="outlined"
                    />
                  ) : buchung.Menge > 0 ? (
                    <Chip 
                      label={buchung.Bemerkung || 'Wareneingang'} 
                      size="small" 
                      color="success" 
                      variant="outlined"
                    />
                  ) : (
                    <Chip 
                      label={buchung.Bemerkung || 'Warenausgang'} 
                      size="small" 
                      color="error" 
                      variant="outlined"
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
            
            {paginatedBuchungen.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Keine Buchungen gefunden.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={displayBuchungen.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Zeilen pro Seite:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} von ${count}`}
      />
    </Box>
  );
};

export default React.memo(ArtikelKontoBuchungen); 