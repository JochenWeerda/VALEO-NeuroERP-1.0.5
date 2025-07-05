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
  TableSortLabel,
  Tooltip,
  IconButton,
  Badge,
  Grid
} from '@mui/material';
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  InfoOutlined as InfoOutlinedIcon,
  Receipt as ReceiptIcon,
  NoteAlt as NoteAltIcon,
  Smartphone as SmartphoneIcon
} from '@mui/icons-material';
import { OffenePostenBuchung, OffenePostenKIErweiterung } from '../../services/offenePostenApi';

interface OffenePostenListeProps {
  buchungen: OffenePostenBuchung[];
  kiErweiterung?: OffenePostenKIErweiterung;
  onRowClick?: (buchung: OffenePostenBuchung) => void;
  onHistorieClick?: (buchung: OffenePostenBuchung) => void;
  onZahlungsprognoseClick?: (buchung: OffenePostenBuchung) => void;
}

type SortField = 'Datum' | 'RechnungsNr' | 'FaelligBis' | 'OPBetrag' | 'OPRestSumme';
type SortDirection = 'asc' | 'desc';

const OffenePostenListe: React.FC<OffenePostenListeProps> = ({
  buchungen,
  kiErweiterung,
  onRowClick,
  onHistorieClick,
  onZahlungsprognoseClick
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
  
  // Sortierte Buchungen
  const sortedBuchungen = useMemo(() => {
    return [...buchungen].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'Datum':
          comparison = new Date(a.Datum).getTime() - new Date(b.Datum).getTime();
          break;
        case 'RechnungsNr':
          comparison = a.RechnungsNr.localeCompare(b.RechnungsNr);
          break;
        case 'FaelligBis':
          comparison = new Date(a.FaelligBis).getTime() - new Date(b.FaelligBis).getTime();
          break;
        case 'OPBetrag':
          comparison = a.OPBetrag - b.OPBetrag;
          break;
        case 'OPRestSumme':
          comparison = a.OPRestSumme - b.OPRestSumme;
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [buchungen, sortField, sortDirection]);
  
  const paginatedBuchungen = useMemo(() => {
    return sortedBuchungen.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [sortedBuchungen, page, rowsPerPage]);
  
  // Bestimme, ob eine Buchung eine Anomalie ist (basierend auf KI-Erweiterung)
  const istAnomalerPosten = useCallback((rechnungsNr: string): boolean => {
    if (!kiErweiterung || !kiErweiterung.Anomalieerkennung) return false;
    
    // Hier würde in einer realen Anwendung ein Abgleich mit den konkreten Anomalien stattfinden
    return kiErweiterung.AnomalieDetails?.includes(rechnungsNr) || false;
  }, [kiErweiterung]);
  
  // Bestimme den Status einer Buchung (fällig, überfällig, etc.)
  const getPostenStatus = useCallback((buchung: OffenePostenBuchung): {
    label: string;
    color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  } => {
    const heute = new Date();
    const faelligkeitsDatum = new Date(buchung.FaelligBis);
    
    // Berechne die Differenz in Tagen
    const differenzInTagen = Math.floor(
      (faelligkeitsDatum.getTime() - heute.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (differenzInTagen < -30) {
      return { label: 'Stark überfällig', color: 'error' };
    } else if (differenzInTagen < 0) {
      return { label: 'Überfällig', color: 'warning' };
    } else if (differenzInTagen < 7) {
      return { label: 'Bald fällig', color: 'info' };
    } else {
      return { label: 'Offen', color: 'default' };
    }
  }, []);
  
  // Bestimme, ob eine Skontofrist noch aktiv ist
  const hatAktiveSkontofrist = useCallback((buchung: OffenePostenBuchung): {
    aktiv: boolean;
    prozent?: number;
    tageVerbleibend?: number;
  } => {
    if (!buchung.Skonto1_Prozent || buchung.Skonto1_Prozent === 0) {
      return { aktiv: false };
    }
    
    const heute = new Date();
    const rechnungsDatum = new Date(buchung.Datum);
    const skontoEnde = new Date(rechnungsDatum);
    skontoEnde.setDate(skontoEnde.getDate() + buchung.Skonto1_Tage);
    
    const verbleibendeTage = Math.floor(
      (skontoEnde.getTime() - heute.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (verbleibendeTage >= 0) {
      return {
        aktiv: true,
        prozent: buchung.Skonto1_Prozent,
        tageVerbleibend: verbleibendeTage
      };
    }
    
    return { aktiv: false };
  }, []);
  
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
                  active={sortField === 'RechnungsNr'}
                  direction={sortField === 'RechnungsNr' ? sortDirection : 'asc'}
                  onClick={() => handleSort('RechnungsNr')}
                >
                  Rechnungs-Nr.
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'FaelligBis'}
                  direction={sortField === 'FaelligBis' ? sortDirection : 'asc'}
                  onClick={() => handleSort('FaelligBis')}
                >
                  Fällig bis
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sortField === 'OPBetrag'}
                  direction={sortField === 'OPBetrag' ? sortDirection : 'asc'}
                  onClick={() => handleSort('OPBetrag')}
                >
                  Betrag
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sortField === 'OPRestSumme'}
                  direction={sortField === 'OPRestSumme' ? sortDirection : 'asc'}
                  onClick={() => handleSort('OPRestSumme')}
                >
                  Restbetrag
                </TableSortLabel>
              </TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Skonto</TableCell>
              <TableCell>Info</TableCell>
              <TableCell>Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedBuchungen.map((buchung, index) => {
              const postenStatus = getPostenStatus(buchung);
              const skontoInfo = hatAktiveSkontofrist(buchung);
              const istAnomalie = istAnomalerPosten(buchung.RechnungsNr);
              
              return (
                <TableRow 
                  key={`${buchung.RechnungsNr}_${index}`}
                  sx={{ 
                    '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                    bgcolor: istAnomalie ? 'rgba(255, 152, 0, 0.08)' : 'inherit',
                    cursor: onRowClick ? 'pointer' : 'default'
                  }}
                  onClick={() => onRowClick && onRowClick(buchung)}
                >
                  <TableCell>{new Date(buchung.Datum).toLocaleDateString('de-DE')}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      {istAnomalie && (
                        <Tooltip title="KI hat Anomalie erkannt">
                          <WarningIcon color="warning" fontSize="small" sx={{ mr: 1 }} />
                        </Tooltip>
                      )}
                      <Typography variant="body2" noWrap fontWeight={istAnomalie ? 'bold' : 'normal'}>
                        {buchung.RechnungsNr}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="textSecondary" display="block">
                      {buchung.RechnungsArt}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap>
                      {new Date(buchung.FaelligBis).toLocaleDateString('de-DE')}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block">
                      {buchung.Zahlziel_Tage} Tage
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" alignItems="center" justifyContent="flex-end">
                      {buchung.SH === 'S' ? (
                        <ArrowUpwardIcon fontSize="small" color="success" sx={{ mr: 0.5 }} />
                      ) : (
                        <ArrowDownwardIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />
                      )}
                      <Typography
                        variant="body2"
                        color={buchung.SH === 'S' ? 'success.main' : 'error.main'}
                        fontWeight="medium"
                      >
                        {buchung.OPBetrag.toFixed(2)} €
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography 
                      variant="body2" 
                      fontWeight="medium"
                      color={buchung.OPRestSumme > 0 ? 'primary.main' : 'success.main'}
                    >
                      {buchung.OPRestSumme.toFixed(2)} €
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={postenStatus.label} 
                      size="small" 
                      color={postenStatus.color}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {skontoInfo.aktiv ? (
                      <Tooltip title={`Noch ${skontoInfo.tageVerbleibend} Tage für ${skontoInfo.prozent}% Skonto`}>
                        <Chip 
                          label={`${skontoInfo.prozent}%`} 
                          size="small" 
                          color="success" 
                          variant="outlined"
                        />
                      </Tooltip>
                    ) : buchung.Skonto1_Prozent > 0 ? (
                      <Typography variant="caption" color="text.secondary">
                        Skonto abgelaufen
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Kein Skonto
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title={buchung.OPInfoText || 'Keine Information'}>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                        {buchung.OPInfoText}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Box display="flex">
                      <Tooltip title="Historie anzeigen">
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            onHistorieClick && onHistorieClick(buchung);
                          }}
                        >
                          <NoteAltIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      {kiErweiterung && (
                        <Tooltip title="KI-Zahlungsprognose">
                          <IconButton 
                            size="small"
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              onZahlungsprognoseClick && onZahlungsprognoseClick(buchung);
                            }}
                          >
                            <SmartphoneIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
            
            {paginatedBuchungen.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Keine offenen Posten gefunden.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Grid container alignItems="center" spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2">Legende:</Typography>
            <Box display="flex" alignItems="center">
              <WarningIcon color="warning" fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="body2">KI-Anomalie</Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <ArrowUpwardIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="body2">Ausgehend</Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <ArrowDownwardIcon color="error" fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="body2">Eingehend</Typography>
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={sortedBuchungen.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Zeilen pro Seite:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} von ${count}`}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default React.memo(OffenePostenListe); 