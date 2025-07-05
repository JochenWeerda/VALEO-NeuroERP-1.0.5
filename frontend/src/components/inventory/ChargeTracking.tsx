import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Divider,
  Grid,
  Collapse,
  Chip,
  Zoom,
  useTheme,
  TextField,
  MenuItem
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TimelineIcon from '@mui/icons-material/Timeline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { 
  Charge, 
  ChargeVorwaerts, 
  ChargeRueckwaerts, 
  getChargeById, 
  getChargeVorwaerts, 
  getChargeRueckwaerts 
} from '../../services/inventoryApi';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tracking-tabpanel-${index}`}
      aria-labelledby={`tracking-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `tracking-tab-${index}`,
    'aria-controls': `tracking-tabpanel-${index}`,
  };
}

interface ChargeTrackingProps {
  chargeId: number;
  onBack?: () => void;
  onViewCharge?: (chargeId: number) => void;
}

// Produktionstypen für Mahl- und Mischanlagen gemäß QS-Standards
const PRODUKTIONSTYPEN = [
  { value: 'mahlen', label: 'Mahlen' },
  { value: 'mischen', label: 'Mischen' },
  { value: 'mahl_misch', label: 'Mahlen und Mischen' }
];

// Zutatenkategorien gemäß QS-Standards
const ZUTATEN_KATEGORIEN = [
  { value: 'getreide', label: 'Getreide' },
  { value: 'extraktionsschrot', label: 'Extraktionsschrot' },
  { value: 'mineralfutter', label: 'Mineralfutter' },
  { value: 'futterharnstoff', label: 'Futterharnstoff' },
  { value: 'konservierungsmittel', label: 'Konservierungsmittel' },
  { value: 'oel_fett', label: 'Öl/Fett' },
  { value: 'sonstiges', label: 'Sonstiges' }
];

const ChargeTracking: React.FC<ChargeTrackingProps> = ({ 
  chargeId, 
  onBack,
  onViewCharge
}) => {
  const [charge, setCharge] = useState<Charge | null>(null);
  const [vorwaertsData, setVorwaertsData] = useState<ChargeVorwaerts | null>(null);
  const [rueckwaertsData, setRueckwaertsData] = useState<ChargeRueckwaerts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [visualizationMode, setVisualizationMode] = useState<'table' | 'tree' | 'timeline'>('table');
  const [expandedNodes, setExpandedNodes] = useState<{ [key: number]: boolean }>({});
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [showQSDetails, setShowQSDetails] = useState<boolean>(false);
  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Parallel-Anfragen für alle benötigten Daten
        const [chargeData, vorwaerts, rueckwaerts] = await Promise.all([
          getChargeById(chargeId),
          getChargeVorwaerts(chargeId),
          getChargeRueckwaerts(chargeId)
        ]);
        
        setCharge(chargeData);
        setVorwaertsData(vorwaerts);
        setRueckwaertsData(rueckwaerts);
        setError(null);
      } catch (err) {
        console.error('Fehler beim Laden der Chargenverfolgung:', err);
        setError('Die Chargenverfolgungsdaten konnten nicht geladen werden.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [chargeId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Helfer-Funktion zum Formatieren von Datumsangaben
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd.MM.yyyy', { locale: de });
    } catch (e) {
      return dateString;
    }
  };

  const toggleNodeExpansion = (nodeId: number) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const isNodeExpanded = (nodeId: number) => {
    return !!expandedNodes[nodeId];
  };

  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'freigegeben': return theme.palette.success.main;
      case 'gesperrt': return theme.palette.error.main;
      case 'in_pruefung': return theme.palette.warning.main;
      case 'neu': return theme.palette.info.main;
      default: return theme.palette.grey[500];
    }
  };

  // Rendert einen Baumknoten für die Charge
  const renderChargeNode = (charge: any, level: number = 0, direction: 'forward' | 'backward' = 'forward', isLast: boolean = false) => {
    const nodeId = charge.id;
    const hasChildren = direction === 'forward' 
      ? (charge.verwendungen?.length > 0)
      : (charge.bestandteile?.length > 0);
    
    const children = direction === 'forward' 
      ? charge.verwendungen || []
      : charge.bestandteile || [];
    
    return (
      <Box key={`${direction}-${nodeId}`} ml={level * 4} mb={1}>
        <Box 
          sx={{ 
            display: 'flex',
            position: 'relative',
            pb: hasChildren ? 1 : 0
          }}
        >
          {level > 0 && (
            <Box
              sx={{
                position: 'absolute',
                left: -24,
                top: 0,
                bottom: isLast ? 12 : -8,
                width: 20,
                borderLeft: `2px solid ${theme.palette.divider}`,
                borderBottom: isLast ? `2px solid ${theme.palette.divider}` : 'none',
              }}
            />
          )}
          
          <Card 
            variant="outlined" 
            sx={{
              width: '100%',
              borderColor: getStatusColor(charge.status),
              borderWidth: '2px',
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: 3,
                borderColor: getStatusColor(charge.status),
              }
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle1" component="div">
                    {charge.chargennummer || `Charge #${charge.id}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {charge.artikel_name || `Artikel ${charge.artikel_id}`}
                  </Typography>
                  <Box mt={0.5}>
                    <Chip 
                      label={charge.status || 'Unbekannt'} 
                      size="small" 
                      sx={{ 
                        backgroundColor: getStatusColor(charge.status),
                        color: '#fff'
                      }}
                    />
                    <Chip 
                      label={`${charge.menge || '?'} ${charge.einheit_name || 'Einh.'}`} 
                      size="small" 
                      sx={{ ml: 0.5 }}
                      variant="outlined"
                    />
                  </Box>
                </Box>
                <Box>
                  {hasChildren && (
                    <IconButton 
                      size="small" 
                      onClick={() => toggleNodeExpansion(nodeId)}
                      sx={{ mr: 1 }}
                    >
                      {isNodeExpanded(nodeId) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  )}
                  {onViewCharge && (
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => onViewCharge(charge.id)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  )}
                </Box>
              </Box>
              
              {charge.herstelldatum && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Herstelldatum: {formatDate(charge.herstelldatum)}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
        
        {hasChildren && isNodeExpanded(nodeId) && (
          <Collapse in={isNodeExpanded(nodeId)}>
            <Box sx={{ mt: 1 }}>
              {children.map((child: any, index: number) => 
                renderChargeNode(
                  child, 
                  level + 1, 
                  direction, 
                  index === children.length - 1
                )
              )}
            </Box>
          </Collapse>
        )}
      </Box>
    );
  };

  // Rendert die hierarchische Baumansicht
  const renderTreeView = (direction: 'forward' | 'backward') => {
    const data = direction === 'forward' ? vorwaertsData : rueckwaertsData;
    if (!data) return null;
    
    const rootNode = direction === 'forward' 
      ? { ...charge, verwendungen: data.verwendungen } 
      : { ...charge, bestandteile: data.bestandteile };
    
    return (
      <Box sx={{ mt: 2 }}>
        {renderChargeNode(rootNode, 0, direction)}
      </Box>
    );
  };

  // Rendert QS-spezifische Informationen für Chargen
  const renderQSDetails = (charge: any) => {
    return (
      <Box sx={{ mt: 2, p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          QS-relevante Informationen
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Produktionstyp"
              select
              value={charge.produktionstyp || ''}
              disabled
              size="small"
              margin="dense"
            >
              {PRODUKTIONSTYPEN.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Kategorie"
              select
              value={charge.kategorie || ''}
              disabled
              size="small"
              margin="dense"
            >
              {ZUTATEN_KATEGORIEN.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {charge.produktionstyp === 'mischen' || charge.produktionstyp === 'mahl_misch' ? (
            <>
              <Grid item xs={12}>
                <Typography variant="caption">
                  Mischreihenfolge und Kontaminationsmatrix:
                </Typography>
                {charge.mischprozessdaten ? (
                  <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Position</TableCell>
                          <TableCell>Material</TableCell>
                          <TableCell>Anteil (%)</TableCell>
                          <TableCell>Kontaminationsrisiko</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {charge.mischprozessdaten.map((item: any, index: number) => (
                          <TableRow key={`mix-${index}`}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{item.material_name}</TableCell>
                            <TableCell>{item.anteil}%</TableCell>
                            <TableCell>
                              <Chip 
                                size="small" 
                                label={item.kontaminationsrisiko || 'Niedrig'} 
                                color={
                                  item.kontaminationsrisiko === 'Hoch' ? 'error' :
                                  item.kontaminationsrisiko === 'Mittel' ? 'warning' : 'success'
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    Keine Mischprozessdaten vorhanden
                  </Alert>
                )}
              </Grid>
            </>
          ) : null}
          
          {/* Spülcharge-Information für QS-Konformität */}
          {charge.is_spuelcharge && (
            <Grid item xs={12}>
              <Alert severity="warning" sx={{ mt: 1 }}>
                Spülcharge nach kritischem Material (gemäß QS-Richtlinie)
              </Alert>
            </Grid>
          )}
          
          {/* QS-Prüfung und Dokumentation */}
          <Grid item xs={12}>
            <Box sx={{ mt: 1, p: 1, backgroundColor: theme.palette.background.default, borderRadius: 1 }}>
              <Typography variant="caption" display="block">
                QS-Dokumentation: {charge.qs_dokumentation_vollstaendig ? 'Vollständig' : 'Unvollständig'}
              </Typography>
              {charge.qs_pruefung_datum && (
                <Typography variant="caption" display="block">
                  Letzte QS-Prüfung: {formatDate(charge.qs_pruefung_datum)}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // Rendert die bisherige Tabellenansicht
  const renderTableView = (direction: 'forward' | 'backward') => {
    if (direction === 'backward') {
      return (
        <>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant={showQSDetails ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setShowQSDetails(!showQSDetails)}
              startIcon={<FilterAltIcon />}
            >
              QS-Details {showQSDetails ? 'ausblenden' : 'anzeigen'}
            </Button>
            
            {filterCategory && (
              <Chip 
                label={`Filter: ${ZUTATEN_KATEGORIEN.find(k => k.value === filterCategory)?.label}`}
                onDelete={() => setFilterCategory('')}
                color="primary"
                size="small"
              />
            )}
          </Box>
          
          {showQSDetails && charge && renderQSDetails(charge)}
          
          {/* Filter für Zutaten-Kategorien */}
          {showQSDetails && (
            <Box sx={{ mb: 2, mt: 2 }}>
              <TextField
                select
                label="Nach Kategorie filtern"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                size="small"
                sx={{ minWidth: 200 }}
              >
                <MenuItem value="">Alle anzeigen</MenuItem>
                {ZUTATEN_KATEGORIEN.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          )}
          
          {rueckwaertsData && rueckwaertsData.bestandteile.length === 0 ? (
            <Alert severity="info" sx={{ my: 2 }}>
              Diese Charge hat keine Bestandteile oder wurde nicht aus anderen Chargen hergestellt.
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>Charge</TableCell>
                    <TableCell>Artikel</TableCell>
                    <TableCell>Menge</TableCell>
                    <TableCell>Herstelldatum</TableCell>
                    <TableCell>Status</TableCell>
                    {showQSDetails && (
                      <>
                        <TableCell>Kategorie</TableCell>
                        <TableCell>QS-Status</TableCell>
                      </>
                    )}
                    <TableCell>Aktionen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rueckwaertsData?.bestandteile
                    .filter(b => !filterCategory || b.kategorie === filterCategory)
                    .map((bestandteil) => (
                    <TableRow key={bestandteil.id}>
                      <TableCell>{bestandteil.chargennummer}</TableCell>
                      <TableCell>{bestandteil.artikel_name || `Artikel ${bestandteil.artikel_id}`}</TableCell>
                      <TableCell>{bestandteil.menge} {bestandteil.einheit_name}</TableCell>
                      <TableCell>{formatDate(bestandteil.herstelldatum)}</TableCell>
                      <TableCell>{bestandteil.status}</TableCell>
                      {showQSDetails && (
                        <>
                          <TableCell>
                            {ZUTATEN_KATEGORIEN.find(k => k.value === bestandteil.kategorie)?.label || '-'}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              size="small" 
                              label={bestandteil.qs_dokumentation_vollstaendig ? 'QS-konform' : 'Prüfen'}
                              color={bestandteil.qs_dokumentation_vollstaendig ? 'success' : 'warning'}
                            />
                          </TableCell>
                        </>
                      )}
                      <TableCell>
                        {onViewCharge && (
                          <Tooltip title="Details anzeigen">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => onViewCharge(bestandteil.id)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      );
    } else {
      return (
        <>
          {vorwaertsData && vorwaertsData.verwendungen.length === 0 ? (
            <Alert severity="info" sx={{ my: 2 }}>
              Diese Charge wurde bisher in keinen anderen Chargen verwendet.
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>Charge</TableCell>
                    <TableCell>Artikel</TableCell>
                    <TableCell>Menge</TableCell>
                    <TableCell>Herstelldatum</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Aktionen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vorwaertsData?.verwendungen.map((verwendung) => (
                    <TableRow key={verwendung.id}>
                      <TableCell>{verwendung.chargennummer}</TableCell>
                      <TableCell>{verwendung.artikel_name || `Artikel ${verwendung.artikel_id}`}</TableCell>
                      <TableCell>{verwendung.menge} {verwendung.einheit_name}</TableCell>
                      <TableCell>{formatDate(verwendung.herstelldatum)}</TableCell>
                      <TableCell>{verwendung.status}</TableCell>
                      <TableCell>
                        {onViewCharge && (
                          <Tooltip title="Details anzeigen">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => onViewCharge(verwendung.id)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      );
    }
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">{error}</Alert>
        {onBack && (
          <Button variant="outlined" onClick={onBack} sx={{ mt: 2 }}>
            Zurück
          </Button>
        )}
      </Box>
    );
  }

  if (!charge || !vorwaertsData || !rueckwaertsData) {
    return (
      <Box p={2}>
        <Alert severity="info">Keine Verfolgungsdaten verfügbar</Alert>
        {onBack && (
          <Button variant="outlined" onClick={onBack} sx={{ mt: 2 }}>
            Zurück
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box>
      {onBack && (
        <Button variant="outlined" onClick={onBack} sx={{ mb: 2 }}>
          Zurück zur Übersicht
        </Button>
      )}

      <Paper sx={{ mb: 2, p: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Chargenverfolgung: {charge.chargennummer}
        </Typography>
        <Typography variant="subtitle1">
          Artikel: {charge.artikel_name || `Artikel ${charge.artikel_id}`}
        </Typography>
        
        {/* QS-Konformitätsanzeige */}
        {charge && charge.qs_dokumentation_vollstaendig && (
          <Chip 
            label="QS-konform" 
            color="success" 
            size="small" 
            sx={{ mt: 1 }}
          />
        )}
      </Paper>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="Verfolgung Tabs">
            <Tab label="Rückverfolgung" icon={<ArrowBackIcon />} iconPosition="start" {...a11yProps(0)} />
            <Tab label="Vorwärtsverfolgung" icon={<ArrowForwardIcon />} iconPosition="start" {...a11yProps(1)} />
          </Tabs>
        </Box>
        
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant={visualizationMode === 'table' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setVisualizationMode('table')}
            sx={{ mr: 1 }}
          >
            Tabelle
          </Button>
          <Button
            variant={visualizationMode === 'tree' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setVisualizationMode('tree')}
            startIcon={<AccountTreeIcon />}
          >
            Hierarchie
          </Button>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Woraus wurde diese Charge hergestellt?
          </Typography>
          
          {visualizationMode === 'table' ? 
            renderTableView('backward') : 
            renderTreeView('backward')
          }
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Wo wurde diese Charge verwendet?
          </Typography>
          
          {visualizationMode === 'table' ? 
            renderTableView('forward') : 
            renderTreeView('forward')
          }
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default ChargeTracking; 