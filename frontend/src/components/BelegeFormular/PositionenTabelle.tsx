import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Button,
  Typography,
  Box,
  Autocomplete,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Checkbox,
  Chip,
  Tooltip,
  Badge,
  LinearProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import InventoryIcon from '@mui/icons-material/Inventory';
import { ArticleType } from '../../types/articleTypes';
import ChargenAuswahlDialog, { SelectedCharge } from './ChargenAuswahlDialog';
import { useDebounce, useThrottle } from '../../utils/performanceUtils';
import { FixedSizeList as VirtualList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

export interface Position {
  id?: string;
  artikelId: string;
  artikelBezeichnung: string;
  artikelBeschreibung?: string;
  artikelTyp?: ArticleType;
  menge: number;
  einheit: string;
  einzelpreis: number;
  mwstSatz: number;
  rabatt?: number;
  rabattProzent?: number;
  mehrwertsteuerProzent?: number;
  gesamtpreis?: number;
  chargennummern?: string[];
  mhd?: string;
  buchungsregel?: 'FIFO' | 'LIFO' | 'MIX';
  lagerplatz?: string;
  [key: string]: any; // Für belegspezifische Zusatzfelder
}

export interface PositionenTabelleProps {
  positionen: Position[];
  onPositionenChange: (positionen: Position[]) => void;
  onArtikelSearch?: (suchbegriff: string) => Promise<any[]>;
  artikelSearchLoading?: boolean;
  onEinheitenSearch?: (suchbegriff: string) => Promise<any[]>;
  einheitenSearchLoading?: boolean;
  extraFields?: {
    name: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'date' | 'checkbox';
    options?: { value: string; label: string }[];
  }[];
  readOnly?: boolean;
  showMwst?: boolean;
  showRabatt?: boolean;
  disableMengenAenderung?: boolean;
  disableArtikelAenderung?: boolean;
  recalculatePositions?: boolean;
  onPositionAdd?: (position: Position) => void;
  onPositionDelete?: (positionId: string) => void;
  showSummary?: boolean;
  maxPositionen?: number;
}

const PositionenTabelle: React.FC<PositionenTabelleProps> = ({
  positionen,
  onPositionenChange,
  onArtikelSearch,
  artikelSearchLoading = false,
  onEinheitenSearch,
  einheitenSearchLoading = false,
  extraFields = [],
  readOnly = false,
  showMwst = true,
  showRabatt = true,
  disableMengenAenderung = false,
  disableArtikelAenderung = false,
  recalculatePositions = true,
  onPositionAdd,
  onPositionDelete,
  showSummary = true,
  maxPositionen
}) => {
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showPositionDialog, setShowPositionDialog] = useState(false);
  const [newPosition, setNewPosition] = useState<Position>({
    artikelId: '',
    artikelBezeichnung: '',
    menge: 1,
    einheit: 'Stk',
    einzelpreis: 0,
    mwstSatz: 19,
    rabatt: 0,
    gesamtpreis: 0
  });
  const [artikelSuche, setArtikelSuche] = useState('');
  const [artikelOptions, setArtikelOptions] = useState<any[]>([]);
  const [einheitenOptions, setEinheitenOptions] = useState<any[]>([]);
  const [showChargenDialog, setShowChargenDialog] = useState<boolean>(false);
  const [selectedPositionIndex, setSelectedPositionIndex] = useState<number | null>(null);
  const [verfügbareChargen, setVerfügbareChargen] = useState<Array<{
    chargennummer: string;
    menge: number;
    mhd?: string;
    lagerplatz?: string;
    einlagerungsdatum?: string;
  }>>([]);

  // Suche nach Artikeln, wenn sich die Sucheingabe ändert
  useEffect(() => {
    if (artikelSuche && onArtikelSearch) {
      const fetchArtikel = async () => {
        const ergebnisse = await onArtikelSearch(artikelSuche);
        setArtikelOptions(ergebnisse);
      };
      
      const timeoutId = setTimeout(() => {
        fetchArtikel();
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [artikelSuche, onArtikelSearch]);

  // Laden von Einheiten
  useEffect(() => {
    if (onEinheitenSearch) {
      const fetchEinheiten = async () => {
        const ergebnisse = await onEinheitenSearch('');
        setEinheitenOptions(ergebnisse);
      };
      
      fetchEinheiten();
    }
  }, [onEinheitenSearch]);

  // Berechnet den Gesamtpreis einer Position
  const berechneGesamtpreis = (position: Position): number => {
    const menge = parseFloat(position.menge.toString()) || 0;
    const einzelpreis = parseFloat(position.einzelpreis.toString()) || 0;
    const rabatt = parseFloat(position.rabatt?.toString() || '0') || 0;
    
    const gesamtpreisOhneRabatt = menge * einzelpreis;
    const rabattBetrag = gesamtpreisOhneRabatt * (rabatt / 100);
    return gesamtpreisOhneRabatt - rabattBetrag;
  };

  // Berechnet Gesamtpreise für alle Positionen
  const berechneAlleGesamtpreise = (posList: Position[]): Position[] => {
    if (!recalculatePositions) return posList;
    
    return posList.map(pos => ({
      ...pos,
      gesamtpreis: berechneGesamtpreis(pos)
    }));
  };

  // Position bearbeiten
  const handleEdit = (index: number) => {
    setEditingPosition({ ...positionen[index] });
    setEditingIndex(index);
    setShowPositionDialog(true);
  };

  // Position speichern
  const handleSave = () => {
    if (editingPosition && editingIndex !== null) {
      const neueListe = [...positionen];
      neueListe[editingIndex] = {
        ...editingPosition,
        gesamtpreis: berechneGesamtpreis(editingPosition)
      };
      
      onPositionenChange(berechneAlleGesamtpreise(neueListe));
    }
    
    setEditingPosition(null);
    setEditingIndex(null);
    setShowPositionDialog(false);
  };

  // Position löschen
  const handleDelete = (index: number) => {
    const positionId = positionen[index].id;
    const neueListe = positionen.filter((_, i) => i !== index);
    onPositionenChange(berechneAlleGesamtpreise(neueListe));
    
    if (positionId && onPositionDelete) {
      onPositionDelete(positionId);
    }
  };

  // Neue Position hinzufügen
  const handleAddPosition = () => {
    setEditingPosition(null);
    setEditingIndex(null);
    setNewPosition({
      artikelId: '',
      artikelBezeichnung: '',
      menge: 1,
      einheit: 'Stk',
      einzelpreis: 0,
      mwstSatz: 19,
      rabatt: 0,
      gesamtpreis: 0
    });
    setShowPositionDialog(true);
  };

  // Neue Position speichern
  const handleSaveNewPosition = () => {
    const positionMitGesamtpreis = {
      ...newPosition,
      gesamtpreis: berechneGesamtpreis(newPosition)
    };
    
    const neueListe = [...positionen, positionMitGesamtpreis];
    onPositionenChange(berechneAlleGesamtpreise(neueListe));
    
    if (onPositionAdd) {
      onPositionAdd(positionMitGesamtpreis);
    }
    
    setShowPositionDialog(false);
  };

  // Dialog schließen
  const handleCloseDialog = () => {
    setShowPositionDialog(false);
    setEditingPosition(null);
    setEditingIndex(null);
  };

  // Änderungen im Dialog speichern
  const handleDialogChange = (field: string, value: any) => {
    if (editingPosition) {
      const updatedPosition = { ...editingPosition, [field]: value };
      if (recalculatePositions && (field === 'menge' || field === 'einzelpreis' || field === 'rabatt')) {
        updatedPosition.gesamtpreis = berechneGesamtpreis(updatedPosition);
      }
      setEditingPosition(updatedPosition);
    } else {
      const updatedPosition = { ...newPosition, [field]: value };
      if (recalculatePositions && (field === 'menge' || field === 'einzelpreis' || field === 'rabatt')) {
        updatedPosition.gesamtpreis = berechneGesamtpreis(updatedPosition);
      }
      setNewPosition(updatedPosition);
    }
  };

  // Formatiert einen Betrag als Währung
  const formatCurrency = (betrag: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(betrag);
  };

  // Artikel auswählen aus Suchergebnissen
  const handleArtikelSelect = (artikel: any) => {
    if (editingPosition) {
      setEditingPosition({
        ...editingPosition,
        artikelId: artikel.id,
        artikelBezeichnung: artikel.bezeichnung,
        artikelBeschreibung: artikel.beschreibung || '',
        einzelpreis: artikel.standardpreis || editingPosition.einzelpreis,
        einheit: artikel.einheit || editingPosition.einheit,
        artikelTyp: artikel.artikelTyp
      });
    } else {
      setNewPosition({
        ...newPosition,
        artikelId: artikel.id,
        artikelBezeichnung: artikel.bezeichnung,
        artikelBeschreibung: artikel.beschreibung || '',
        einzelpreis: artikel.standardpreis || newPosition.einzelpreis,
        einheit: artikel.einheit || newPosition.einheit,
        artikelTyp: artikel.artikelTyp
      });
    }
  };

  // Simulierte Funktion zum Abrufen verfügbarer Chargen für einen Artikel
  const fetchVerfügbareChargen = useCallback(async (artikelId: string, buchungsregel?: 'FIFO' | 'LIFO' | 'MIX') => {
    // In einer realen Implementierung würde dies eine API-Anfrage sein
    // Hier simulieren wir eine Antwort mit zufälligen Daten
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulierte Daten für verfügbare Chargen
    const heute = new Date();
    const zufälligeChargen = Array(5).fill(null).map((_, index) => {
      const mhdDate = new Date(heute);
      mhdDate.setDate(mhdDate.getDate() + Math.floor(Math.random() * 365)); // MHD zwischen heute und in einem Jahr
      
      const einlagerungDate = new Date(heute);
      einlagerungDate.setDate(einlagerungDate.getDate() - Math.floor(Math.random() * 60)); // Einlagerung in den letzten 60 Tagen
      
      return {
        chargennummer: `CH-${artikelId}-${String(Date.now()).substring(8)}${index}`,
        menge: Math.floor(Math.random() * 1000) + 100,
        mhd: mhdDate.toISOString().split('T')[0],
        lagerplatz: `Lager-${Math.floor(Math.random() * 5) + 1}`,
        einlagerungsdatum: einlagerungDate.toISOString().split('T')[0]
      };
    });
    
    // Sortieren je nach Buchungsregel
    if (buchungsregel === 'FIFO') {
      // Älteste Einlagerung zuerst (FIFO)
      zufälligeChargen.sort((a, b) => 
        new Date(a.einlagerungsdatum!).getTime() - new Date(b.einlagerungsdatum!).getTime()
      );
    } else if (buchungsregel === 'LIFO') {
      // Neueste Einlagerung zuerst (LIFO)
      zufälligeChargen.sort((a, b) => 
        new Date(b.einlagerungsdatum!).getTime() - new Date(a.einlagerungsdatum!).getTime()
      );
    } else if (buchungsregel === 'MIX') {
      // Bei MIX keine Sortierung, da sich die Chargen vermischen
    } else {
      // Standardmäßig nach MHD sortieren (ältestes MHD zuerst)
      zufälligeChargen.sort((a, b) => 
        new Date(a.mhd!).getTime() - new Date(b.mhd!).getTime()
      );
    }
    
    return zufälligeChargen;
  }, []);

  // Öffnen des Chargen-Dialogs für eine Position
  const handleChargenDialog = async (index: number) => {
    const position = positionen[index];
    if (position && position.artikelId) {
      setSelectedPositionIndex(index);
      
      try {
        const chargen = await fetchVerfügbareChargen(position.artikelId, position.buchungsregel);
        setVerfügbareChargen(chargen);
        setShowChargenDialog(true);
      } catch (error) {
        console.error('Fehler beim Laden der verfügbaren Chargen:', error);
        // Hier könnte eine Fehlerbehandlung erfolgen
      }
    }
  };

  // Anwenden der ausgewählten Chargen auf die Position
  const handleApplyChargen = (selectedChargen: SelectedCharge[]) => {
    if (selectedPositionIndex !== null && selectedChargen.length > 0) {
      const updatedPositionen = [...positionen];
      
      // Aktualisiere die Position mit den ausgewählten Chargen
      updatedPositionen[selectedPositionIndex] = {
        ...updatedPositionen[selectedPositionIndex],
        chargennummern: selectedChargen.map(c => c.chargennummer),
        mhd: selectedChargen[0].mhd, // Wir verwenden das MHD der ersten Charge als Referenz
        lagerplatz: selectedChargen[0].lagerplatz // Wir nehmen auch den Lagerplatz der ersten Charge
      };
      
      onPositionenChange(updatedPositionen);
      setShowChargenDialog(false);
      setSelectedPositionIndex(null);
    }
  };

  // Prüfen, ob ein Artikel chargenpflichtig ist
  const isChargenRequired = useCallback((artikelTyp?: ArticleType) => {
    return ['FUTTERMITTEL', 'SAATGUT', 'DÜNGEMITTEL', 'PFLANZENSCHUTZ'].includes(artikelTyp || '');
  }, []);

  // Memoized Position Row Component für bessere Performance bei großen Tabellen
  const PositionRow = memo(({ 
    position, 
    index, 
    onEdit, 
    onDelete, 
    onChargenDialog, 
    readOnly, 
    showMwst, 
    showRabatt, 
    formatCurrency 
  }: { 
    position: Position; 
    index: number; 
    onEdit: (index: number) => void; 
    onDelete: (index: number) => void; 
    onChargenDialog: (index: number) => void; 
    readOnly: boolean; 
    showMwst: boolean; 
    showRabatt: boolean; 
    formatCurrency: (betrag: number) => string; 
  }) => {
    const hatChargen = position.chargennummern && position.chargennummern.length > 0;
    
    return (
      <TableRow key={position.id || index}>
        <TableCell>{index + 1}</TableCell>
        <TableCell>
          {position.artikelBezeichnung}
          {position.artikelBeschreibung && (
            <Typography variant="caption" display="block" color="text.secondary">
              {position.artikelBeschreibung}
            </Typography>
          )}
        </TableCell>
        <TableCell align="right">{position.menge} {position.einheit}</TableCell>
        <TableCell align="right">{formatCurrency(position.einzelpreis)}</TableCell>
        {showRabatt && (
          <TableCell align="right">{position.rabatt ? `${position.rabatt}%` : '-'}</TableCell>
        )}
        {showMwst && (
          <TableCell align="right">{position.mwstSatz}%</TableCell>
        )}
        <TableCell align="right">{formatCurrency(position.gesamtpreis || 0)}</TableCell>
        <TableCell>
          {position.artikelTyp === 'CHARGE' && (
            <Tooltip title={hatChargen ? `${position.chargennummern?.join(', ')}` : 'Chargen auswählen'}>
              <Badge 
                badgeContent={position.chargennummern?.length || 0} 
                color={hatChargen ? "success" : "error"}
              >
                <IconButton 
                  size="small" 
                  onClick={() => onChargenDialog(index)}
                  color={hatChargen ? "success" : "default"}
                >
                  <InventoryIcon />
                </IconButton>
              </Badge>
            </Tooltip>
          )}
        </TableCell>
        <TableCell>
          {!readOnly && (
            <>
              <IconButton size="small" onClick={() => onEdit(index)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => onDelete(index)} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </>
          )}
        </TableCell>
      </TableRow>
    );
  });

  // Virtualisierte Tabelle für große Datensätze
  const VirtualizedPositionenTable = memo(({ 
    positionen, 
    onEdit, 
    onDelete, 
    onChargenDialog, 
    readOnly, 
    showMwst, 
    showRabatt, 
    formatCurrency 
  }: { 
    positionen: Position[]; 
    onEdit: (index: number) => void; 
    onDelete: (index: number) => void; 
    onChargenDialog: (index: number) => void; 
    readOnly: boolean; 
    showMwst: boolean; 
    showRabatt: boolean; 
    formatCurrency: (betrag: number) => string; 
  }) => {
    // Nur rendern, wenn mehr als 20 Positionen vorhanden sind
    if (positionen.length <= 20) {
      return (
        <TableBody>
          {positionen.map((position, index) => (
            <PositionRow
              key={position.id || index}
              position={position}
              index={index}
              onEdit={onEdit}
              onDelete={onDelete}
              onChargenDialog={onChargenDialog}
              readOnly={readOnly}
              showMwst={showMwst}
              showRabatt={showRabatt}
              formatCurrency={formatCurrency}
            />
          ))}
        </TableBody>
      );
    }

    // Virtualisierte Liste für große Datensätze
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={showMwst && showRabatt ? 8 : (showMwst || showRabatt ? 7 : 6)} style={{ padding: 0, height: 'auto' }}>
            <div style={{ height: '400px' }}>
              <AutoSizer>
                {({ height, width }) => (
                  <VirtualList
                    height={height}
                    width={width}
                    itemCount={positionen.length}
                    itemSize={53} // Anpassen je nach Zeilenhöhe
                  >
                    {({ index, style }) => (
                      <div style={style}>
                        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          <div style={{ width: '40px', textAlign: 'left' }}>{index + 1}</div>
                          <div style={{ flex: 2, textAlign: 'left' }}>
                            {positionen[index].artikelBezeichnung}
                            {positionen[index].artikelBeschreibung && (
                              <Typography variant="caption" display="block" color="text.secondary">
                                {positionen[index].artikelBeschreibung}
                              </Typography>
                            )}
                          </div>
                          <div style={{ width: '100px', textAlign: 'right' }}>
                            {positionen[index].menge} {positionen[index].einheit}
                          </div>
                          <div style={{ width: '100px', textAlign: 'right' }}>
                            {formatCurrency(positionen[index].einzelpreis)}
                          </div>
                          {showRabatt && (
                            <div style={{ width: '80px', textAlign: 'right' }}>
                              {positionen[index].rabatt ? `${positionen[index].rabatt}%` : '-'}
                            </div>
                          )}
                          {showMwst && (
                            <div style={{ width: '80px', textAlign: 'right' }}>
                              {positionen[index].mwstSatz}%
                            </div>
                          )}
                          <div style={{ width: '120px', textAlign: 'right' }}>
                            {formatCurrency(positionen[index].gesamtpreis || 0)}
                          </div>
                          <div style={{ width: '50px', textAlign: 'center' }}>
                            {positionen[index].artikelTyp === 'CHARGE' && (
                              <Tooltip title={(positionen[index].chargennummern?.length || 0) > 0 ? `${positionen[index].chargennummern?.join(', ')}` : 'Chargen auswählen'}>
                                <IconButton 
                                  size="small" 
                                  onClick={() => onChargenDialog(index)}
                                  color={(positionen[index].chargennummern?.length || 0) > 0 ? "success" : "default"}
                                >
                                  <Badge 
                                    badgeContent={positionen[index].chargennummern?.length || 0} 
                                    color={(positionen[index].chargennummern?.length || 0) > 0 ? "success" : "error"}
                                  >
                                    <InventoryIcon fontSize="small" />
                                  </Badge>
                                </IconButton>
                              </Tooltip>
                            )}
                          </div>
                          <div style={{ width: '100px', textAlign: 'center' }}>
                            {!readOnly && (
                              <>
                                <IconButton size="small" onClick={() => onEdit(index)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" onClick={() => onDelete(index)} color="error">
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </VirtualList>
                )}
              </AutoSizer>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    );
  });

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Positionen</Typography>
        {!readOnly && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddPosition}
          >
            Position hinzufügen
          </Button>
        )}
      </Box>
      
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Artikel</TableCell>
              <TableCell align="right">Menge</TableCell>
              <TableCell>Einheit</TableCell>
              <TableCell align="right">Einzelpreis</TableCell>
              {showRabatt && <TableCell align="right">Rabatt (%)</TableCell>}
              {showMwst && <TableCell align="right">MwSt (%)</TableCell>}
              <TableCell align="right">Gesamtpreis</TableCell>
              {!readOnly && <TableCell align="center">Aktionen</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {positionen.length > 0 ? (
              <VirtualizedPositionenTable
                positionen={positionen}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onChargenDialog={handleChargenDialog}
                readOnly={readOnly}
                showMwst={showMwst}
                showRabatt={showRabatt}
                formatCurrency={formatCurrency}
              />
            ) : (
              <TableRow>
                <TableCell colSpan={showMwst && showRabatt ? 8 : (showMwst || showRabatt ? 7 : 6)}>
                  <Typography align="center" variant="body2" color="textSecondary">
                    Keine Positionen vorhanden
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={showPositionDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPosition ? 'Position bearbeiten' : 'Neue Position hinzufügen'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Autocomplete
                disabled={readOnly || disableArtikelAenderung}
                options={artikelOptions}
                getOptionLabel={(option) => option.bezeichnung || ''}
                loading={artikelSearchLoading}
                onChange={(_, value) => value && handleArtikelSelect(value)}
                onInputChange={(_, value) => setArtikelSuche(value)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Artikel" 
                    fullWidth 
                    variant="outlined"
                    value={editingPosition?.artikelBezeichnung || newPosition.artikelBezeichnung}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {artikelSearchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Beschreibung"
                fullWidth
                multiline
                rows={2}
                variant="outlined"
                value={editingPosition?.artikelBeschreibung || newPosition.artikelBeschreibung || ''}
                onChange={(e) => handleDialogChange('artikelBeschreibung', e.target.value)}
                disabled={readOnly}
              />
            </Grid>
            
            <Grid item xs={4}>
              <TextField
                label="Menge"
                fullWidth
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                variant="outlined"
                value={editingPosition?.menge || newPosition.menge}
                onChange={(e) => handleDialogChange('menge', parseFloat(e.target.value) || 0)}
                disabled={readOnly || disableMengenAenderung}
              />
            </Grid>
            
            <Grid item xs={4}>
              {onEinheitenSearch ? (
                <Autocomplete
                  disabled={readOnly}
                  options={einheitenOptions}
                  getOptionLabel={(option) => option.bezeichnung || ''}
                  loading={einheitenSearchLoading}
                  value={einheitenOptions.find(e => e.code === (editingPosition?.einheit || newPosition.einheit)) || null}
                  onChange={(_, value) => value && handleDialogChange('einheit', value.code)}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Einheit" 
                      fullWidth 
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {einheitenSearchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              ) : (
                <TextField
                  label="Einheit"
                  fullWidth
                  variant="outlined"
                  value={editingPosition?.einheit || newPosition.einheit}
                  onChange={(e) => handleDialogChange('einheit', e.target.value)}
                  disabled={readOnly}
                />
              )}
            </Grid>
            
            <Grid item xs={4}>
              <TextField
                label="Einzelpreis"
                fullWidth
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                variant="outlined"
                value={editingPosition?.einzelpreis || newPosition.einzelpreis}
                onChange={(e) => handleDialogChange('einzelpreis', parseFloat(e.target.value) || 0)}
                disabled={readOnly}
              />
            </Grid>
            
            {showRabatt && (
              <Grid item xs={4}>
                <TextField
                  label="Rabatt (%)"
                  fullWidth
                  type="number"
                  inputProps={{ min: 0, max: 100, step: 0.1 }}
                  variant="outlined"
                  value={editingPosition?.rabatt || newPosition.rabatt || 0}
                  onChange={(e) => handleDialogChange('rabatt', parseFloat(e.target.value) || 0)}
                  disabled={readOnly}
                />
              </Grid>
            )}
            
            {showMwst && (
              <Grid item xs={4}>
                <TextField
                  label="MwSt (%)"
                  fullWidth
                  type="number"
                  inputProps={{ min: 0, max: 100, step: 0.1 }}
                  variant="outlined"
                  value={editingPosition?.mwstSatz || newPosition.mwstSatz}
                  onChange={(e) => handleDialogChange('mwstSatz', parseFloat(e.target.value) || 0)}
                  disabled={readOnly}
                />
              </Grid>
            )}
            
            <Grid item xs={4}>
              <TextField
                label="Gesamtpreis"
                fullWidth
                type="number"
                variant="outlined"
                value={
                  (editingPosition ? 
                    berechneGesamtpreis(editingPosition) : 
                    berechneGesamtpreis(newPosition)
                  ).toFixed(2)
                }
                disabled={true}
              />
            </Grid>

            {/* Zusätzliche Felder */}
            {extraFields.map((field) => (
              <Grid item xs={6} key={field.name}>
                {field.type === 'select' ? (
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>{field.label}</InputLabel>
                    <Select
                      value={
                        editingPosition 
                          ? (editingPosition[field.name] || '') 
                          : (newPosition[field.name] || '')
                      }
                      onChange={(e) => handleDialogChange(field.name, e.target.value)}
                      label={field.label}
                      disabled={readOnly}
                    >
                      {field.options?.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : field.type === 'date' ? (
                  <TextField
                    label={field.label}
                    type="date"
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    value={
                      editingPosition 
                        ? (editingPosition[field.name] || '') 
                        : (newPosition[field.name] || '')
                    }
                    onChange={(e) => handleDialogChange(field.name, e.target.value)}
                    disabled={readOnly}
                  />
                ) : (
                  <TextField
                    label={field.label}
                    type={field.type}
                    fullWidth
                    variant="outlined"
                    value={
                      editingPosition 
                        ? (editingPosition[field.name] || '') 
                        : (newPosition[field.name] || '')
                    }
                    onChange={(e) => handleDialogChange(
                      field.name, 
                      field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
                    )}
                    disabled={readOnly}
                  />
                )}
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Abbrechen
          </Button>
          <Button 
            onClick={editingPosition ? handleSave : handleSaveNewPosition}
            color="primary"
            variant="contained"
            disabled={!editingPosition?.artikelId && !newPosition.artikelId}
          >
            Speichern
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog für Chargenauswahl */}
      {selectedPositionIndex !== null && (
        <ChargenAuswahlDialog
          open={showChargenDialog}
          onClose={() => setShowChargenDialog(false)}
          onConfirm={handleApplyChargen}
          artikelId={positionen[selectedPositionIndex]?.artikelId || ''}
          artikelBezeichnung={positionen[selectedPositionIndex]?.artikelBezeichnung || ''}
          benötigteMenge={positionen[selectedPositionIndex]?.menge || 0}
          buchungsregel={positionen[selectedPositionIndex]?.buchungsregel}
          lagerplatz={positionen[selectedPositionIndex]?.lagerplatz}
        />
      )}
    </Box>
  );
};

// Hilfsfunktion, um zu prüfen, ob ein Datum in naher Zukunft liegt (MHD-Warnung)
const isDateNearExpiry = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  const daysUntilExpiry = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return daysUntilExpiry >= 0 && daysUntilExpiry <= 30; // Warnung, wenn MHD in weniger als 30 Tagen
};

export default PositionenTabelle; 