import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  LocationOn as LocationIcon,
  Storage as StorageIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  LocalShipping as ShippingIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  PriorityHigh as PriorityIcon
} from '@mui/icons-material';

// =====================================================
// MOCK DATA
// =====================================================

const mockLagerorte: Lagerort[] = [
  {
    lagerort_id: '1',
    lagerort_nr: 'LAG-001',
    bezeichnung: 'Hauptlager A',
    lagerort_typ: 'Hochregallager',
    standort: 'Standort 1',
    status: 'AKTIV',
    kapazitaet_m3: 1000,
    belegte_kapazitaet_m3: 650,
    auslastung_prozent: 65
  },
  {
    lagerort_id: '2',
    lagerort_nr: 'LAG-002',
    bezeichnung: 'Kleinteilelager',
    lagerort_typ: 'Kleinteilelager',
    standort: 'Standort 1',
    status: 'AKTIV',
    kapazitaet_m3: 200,
    belegte_kapazitaet_m3: 120,
    auslastung_prozent: 60
  },
  {
    lagerort_id: '3',
    lagerort_nr: 'LAG-003',
    bezeichnung: 'Kühllager',
    lagerort_typ: 'Kühllager',
    standort: 'Standort 2',
    status: 'AKTIV',
    kapazitaet_m3: 500,
    belegte_kapazitaet_m3: 280,
    auslastung_prozent: 56
  },
  {
    lagerort_id: '4',
    lagerort_nr: 'LAG-004',
    bezeichnung: 'Gefahrgutlager',
    lagerort_typ: 'Gefahrgutlager',
    standort: 'Standort 3',
    status: 'AKTIV',
    kapazitaet_m3: 300,
    belegte_kapazitaet_m3: 150,
    auslastung_prozent: 50
  }
];

const mockBestaende: Bestand[] = [
  {
    artikel_id: '1',
    artikel_bezeichnung: 'Getreide Weizen',
    lagerort_nr: 'LAG-001',
    lagerzone_nr: 'ZONE-A',
    menge_verfuegbar: 150,
    menge_reserviert: 50,
    menge_gesamt: 200,
    einheit: 'Tonnen',
    bestandsstatus: 'OK',
    mindestbestand: 100,
    optimalbestand: 300
  },
  {
    artikel_id: '2',
    artikel_bezeichnung: 'Dünger NPK',
    lagerort_nr: 'LAG-001',
    lagerzone_nr: 'ZONE-B',
    menge_verfuegbar: 25,
    menge_reserviert: 10,
    menge_gesamt: 35,
    einheit: 'Tonnen',
    bestandsstatus: 'KRITISCH',
    mindestbestand: 30,
    optimalbestand: 100
  },
  {
    artikel_id: '3',
    artikel_bezeichnung: 'Pflanzenschutzmittel',
    lagerort_nr: 'LAG-004',
    lagerzone_nr: 'ZONE-C',
    menge_verfuegbar: 80,
    menge_reserviert: 20,
    menge_gesamt: 100,
    einheit: 'Liter',
    bestandsstatus: 'NIEDRIG',
    mindestbestand: 50,
    optimalbestand: 200
  }
];

const mockLagerbewegungen: Lagerbewegung[] = [
  {
    bewegung_id: '1',
    bewegungsnummer: 'BEW-2024-001',
    bewegungstyp: 'EINLAGERUNG',
    artikel_bezeichnung: 'Getreide Weizen',
    menge: 50,
    einheit: 'Tonnen',
    bewegungsdatum: '2024-12-21',
    status: 'ABGESCHLOSSEN',
    referenz_nr: 'LIEF-2024-001'
  },
  {
    bewegung_id: '2',
    bewegungsnummer: 'BEW-2024-002',
    bewegungstyp: 'AUSLAGERUNG',
    artikel_bezeichnung: 'Dünger NPK',
    menge: 15,
    einheit: 'Tonnen',
    bewegungsdatum: '2024-12-21',
    status: 'IN_BEARBEITUNG',
    referenz_nr: 'AUF-2024-001'
  }
];

const mockWareneingaenge: Wareneingang[] = [
  {
    wareneingang_id: '1',
    wareneingang_nr: 'WE-2024-001',
    lieferant_name: 'Agrar-Lieferant GmbH',
    lieferdatum: '2024-12-21',
    status: 'QUALITAETSPRUEFUNG',
    anzahl_positionen: 5,
    qualitaetspruefung_erforderlich: true
  },
  {
    wareneingang_id: '2',
    wareneingang_nr: 'WE-2024-002',
    lieferant_name: 'Chemie-Service AG',
    lieferdatum: '2024-12-20',
    status: 'ABGESCHLOSSEN',
    anzahl_positionen: 3,
    qualitaetspruefung_erforderlich: false
  }
];

const mockWarenausgaenge: Warenausgang[] = [
  {
    warenausgang_id: '1',
    warenausgang_nr: 'WA-2024-001',
    kunde_name: 'Landwirt Müller',
    ausgangstyp: 'VERKAUF',
    ausgangsdatum: '2024-12-21',
    status: 'KOMMISSIONIERUNG',
    kommissionierung_status: 'IN_BEARBEITUNG'
  },
  {
    warenausgang_id: '2',
    warenausgang_nr: 'WA-2024-002',
    kunde_name: 'Agrar-Genossenschaft',
    ausgangstyp: 'VERKAUF',
    ausgangsdatum: '2024-12-20',
    status: 'ABGESCHLOSSEN',
    kommissionierung_status: 'ABGESCHLOSSEN'
  }
];

const mockKommissionierauftraege: Kommissionierauftrag[] = [
  {
    kommissionierauftrag_id: '1',
    kommissionierauftrag_nr: 'KOMM-2024-001',
    kommissionierauftrag_typ: 'MANUELL',
    prioritaet: 1,
    status: 'IN_BEARBEITUNG',
    anzahl_positionen: 8,
    geplante_startzeit: '2024-12-21 08:00'
  },
  {
    kommissionierauftrag_id: '2',
    kommissionierauftrag_nr: 'KOMM-2024-002',
    kommissionierauftrag_typ: 'AUTOMATISCH',
    prioritaet: 2,
    status: 'GEPLANT',
    anzahl_positionen: 12,
    geplante_startzeit: '2024-12-21 10:00'
  }
];

// =====================================================
// INTERFACES
// =====================================================

interface Lagerort {
  lagerort_id: string;
  lagerort_nr: string;
  bezeichnung: string;
  lagerort_typ: string;
  standort: string;
  status: string;
  kapazitaet_m3: number;
  belegte_kapazitaet_m3: number;
  auslastung_prozent: number;
}

interface Bestand {
  artikel_id: string;
  artikel_bezeichnung: string;
  lagerort_nr: string;
  lagerzone_nr: string;
  menge_verfuegbar: number;
  menge_reserviert: number;
  menge_gesamt: number;
  einheit: string;
  bestandsstatus: 'KRITISCH' | 'NIEDRIG' | 'OK';
  mindestbestand: number;
  optimalbestand: number;
}

interface Lagerbewegung {
  bewegung_id: string;
  bewegungsnummer: string;
  bewegungstyp: string;
  artikel_bezeichnung: string;
  menge: number;
  einheit: string;
  bewegungsdatum: string;
  status: string;
  referenz_nr: string;
}

interface Wareneingang {
  wareneingang_id: string;
  wareneingang_nr: string;
  lieferant_name: string;
  lieferdatum: string;
  status: string;
  anzahl_positionen: number;
  qualitaetspruefung_erforderlich: boolean;
}

interface Warenausgang {
  warenausgang_id: string;
  warenausgang_nr: string;
  kunde_name: string;
  ausgangstyp: string;
  ausgangsdatum: string;
  status: string;
  kommissionierung_status: string;
}

interface Kommissionierauftrag {
  kommissionierauftrag_id: string;
  kommissionierauftrag_nr: string;
  kommissionierauftrag_typ: string;
  prioritaet: number;
  status: string;
  anzahl_positionen: number;
  geplante_startzeit: string;
}

// =====================================================
// COMPONENTS
// =====================================================

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const KPICard: React.FC<KPICardProps> = ({ title, value, subtitle, icon, color, trend }) => {
  return (
    <Card className="h-full">
      <CardContent>
        <Box className="flex items-center justify-between mb-2">
          <Box className="text-gray-600">
            {icon}
          </Box>
          {trend && (
            <Box className="flex items-center">
              {trend.isPositive ? (
                <TrendingUpIcon className="text-green-500 text-sm" />
              ) : (
                <TrendingDownIcon className="text-red-500 text-sm" />
              )}
              <Typography variant="caption" className="ml-1">
                {trend.value}%
              </Typography>
            </Box>
          )}
        </Box>
        <Typography variant="h4" className="font-bold mb-1">
          {value}
        </Typography>
        <Typography variant="body2" color="textSecondary" className="mb-1">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="textSecondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

interface StatusChipProps {
  status: string;
  label: string;
}

const StatusChip: React.FC<StatusChipProps> = ({ status, label }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AKTIV':
      case 'ABGESCHLOSSEN':
      case 'OK':
        return 'success';
      case 'IN_BEARBEITUNG':
      case 'KOMMISSIONIERUNG':
      case 'QUALITAETSPRUEFUNG':
        return 'primary';
      case 'NIEDRIG':
        return 'warning';
      case 'KRITISCH':
      case 'GEPLANT':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Chip 
      label={label} 
      color={getStatusColor(status) as any}
      size="small"
      variant="outlined"
    />
  );
};

// =====================================================
// WAREHOUSE MANAGEMENT COMPONENT
// =====================================================

const WarehouseManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'lagerort' | 'bewegung' | 'wareneingang' | 'warenausgang' | null>(null);

  // Mock loading state
  useEffect(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (type: 'lagerort' | 'bewegung' | 'wareneingang' | 'warenausgang') => {
    setDialogType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogType(null);
  };

  const getBestandsstatusIcon = (status: string) => {
    switch (status) {
      case 'KRITISCH':
        return <WarningIcon className="text-red-500" />;
      case 'NIEDRIG':
        return <WarningIcon className="text-orange-500" />;
      case 'OK':
        return <CheckIcon className="text-green-500" />;
      default:
        return <InventoryIcon className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-64">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <Box className="mb-6">
        <Typography variant="h4" className="font-bold text-gray-800 mb-2">
          Lagerverwaltung
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Verwaltung von Lagerorten, Beständen, Ein- und Auslagerungen sowie Kommissionierung
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <KPICard
          title="Lagerorte"
          value={mockLagerorte.length}
          subtitle="Aktive Standorte"
          icon={<LocationIcon className="text-2xl" />}
          color="primary"
          trend={{ value: 0, isPositive: true }}
        />
        <KPICard
          title="Durchschnittliche Auslastung"
          value="59.7%"
          subtitle="Alle Lagerorte"
          icon={<StorageIcon className="text-2xl" />}
          color="success"
          trend={{ value: 3, isPositive: true }}
        />
        <KPICard
          title="Kritische Bestände"
          value={mockBestaende.filter(b => b.bestandsstatus === 'KRITISCH').length}
          subtitle="Benötigen Nachbestellung"
          icon={<WarningIcon className="text-2xl" />}
          color="error"
          trend={{ value: -2, isPositive: false }}
        />
        <KPICard
          title="Offene Kommissionierungen"
          value={mockKommissionierauftraege.filter(k => k.status === 'IN_BEARBEITUNG').length}
          subtitle="Warten auf Bearbeitung"
          icon={<AssignmentIcon className="text-2xl" />}
          color="warning"
          trend={{ value: 1, isPositive: false }}
        />
      </Box>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="warehouse tabs">
            <Tab label="Lagerorte" />
            <Tab label="Bestände" />
            <Tab label="Lagerbewegungen" />
            <Tab label="Wareneingang" />
            <Tab label="Warenausgang" />
            <Tab label="Kommissionierung" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Lagerorte Tab */}
          {activeTab === 0 && (
            <Box>
              <Box className="flex justify-between items-center mb-4">
                <Typography variant="h6">Lagerorte Übersicht</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('lagerort')}
                >
                  Neuer Lagerort
                </Button>
              </Box>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Lagerort-Nr.</TableCell>
                      <TableCell>Bezeichnung</TableCell>
                      <TableCell>Typ</TableCell>
                      <TableCell>Standort</TableCell>
                      <TableCell>Auslastung</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Aktionen</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockLagerorte.map((lagerort) => (
                      <TableRow key={lagerort.lagerort_id}>
                        <TableCell>{lagerort.lagerort_nr}</TableCell>
                        <TableCell>{lagerort.bezeichnung}</TableCell>
                        <TableCell>{lagerort.lagerort_typ}</TableCell>
                        <TableCell>{lagerort.standort}</TableCell>
                        <TableCell>
                          <Box className="flex items-center">
                            <Box className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <Box
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${lagerort.auslastung_prozent}%` }}
                              />
                            </Box>
                            <Typography variant="body2">
                              {lagerort.auslastung_prozent}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <StatusChip status={lagerort.status} label={lagerort.status} />
                        </TableCell>
                        <TableCell>
                          <Box className="flex space-x-1">
                            <Tooltip title="Anzeigen">
                              <IconButton size="small">
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Bearbeiten">
                              <IconButton size="small">
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Löschen">
                              <IconButton size="small" color="error">
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Bestände Tab */}
          {activeTab === 1 && (
            <Box>
              <Box className="flex justify-between items-center mb-4">
                <Typography variant="h6">Bestandsübersicht</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                >
                  Bestand erfassen
                </Button>
              </Box>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Artikel</TableCell>
                      <TableCell>Lagerort</TableCell>
                      <TableCell>Verfügbar</TableCell>
                      <TableCell>Reserviert</TableCell>
                      <TableCell>Gesamt</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Aktionen</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockBestaende.map((bestand) => (
                      <TableRow key={bestand.artikel_id}>
                        <TableCell>{bestand.artikel_bezeichnung}</TableCell>
                        <TableCell>{bestand.lagerort_nr}</TableCell>
                        <TableCell>{bestand.menge_verfuegbar} {bestand.einheit}</TableCell>
                        <TableCell>{bestand.menge_reserviert} {bestand.einheit}</TableCell>
                        <TableCell>{bestand.menge_gesamt} {bestand.einheit}</TableCell>
                        <TableCell>
                          <Box className="flex items-center">
                            {getBestandsstatusIcon(bestand.bestandsstatus)}
                            <StatusChip status={bestand.bestandsstatus} label={bestand.bestandsstatus} />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box className="flex space-x-1">
                            <Tooltip title="Anzeigen">
                              <IconButton size="small">
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Bearbeiten">
                              <IconButton size="small">
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Lagerbewegungen Tab */}
          {activeTab === 2 && (
            <Box>
              <Box className="flex justify-between items-center mb-4">
                <Typography variant="h6">Lagerbewegungen</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('bewegung')}
                >
                  Neue Bewegung
                </Button>
              </Box>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Bewegungsnummer</TableCell>
                      <TableCell>Typ</TableCell>
                      <TableCell>Artikel</TableCell>
                      <TableCell>Menge</TableCell>
                      <TableCell>Datum</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Aktionen</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockLagerbewegungen.map((bewegung) => (
                      <TableRow key={bewegung.bewegung_id}>
                        <TableCell>{bewegung.bewegungsnummer}</TableCell>
                        <TableCell>{bewegung.bewegungstyp}</TableCell>
                        <TableCell>{bewegung.artikel_bezeichnung}</TableCell>
                        <TableCell>{bewegung.menge} {bewegung.einheit}</TableCell>
                        <TableCell>{bewegung.bewegungsdatum}</TableCell>
                        <TableCell>
                          <StatusChip status={bewegung.status} label={bewegung.status} />
                        </TableCell>
                        <TableCell>
                          <Box className="flex space-x-1">
                            <Tooltip title="Anzeigen">
                              <IconButton size="small">
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Bearbeiten">
                              <IconButton size="small">
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Wareneingang Tab */}
          {activeTab === 3 && (
            <Box>
              <Box className="flex justify-between items-center mb-4">
                <Typography variant="h6">Wareneingang</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('wareneingang')}
                >
                  Neuer Wareneingang
                </Button>
              </Box>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Wareneingang-Nr.</TableCell>
                      <TableCell>Lieferant</TableCell>
                      <TableCell>Lieferdatum</TableCell>
                      <TableCell>Positionen</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Aktionen</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockWareneingaenge.map((wareneingang) => (
                      <TableRow key={wareneingang.wareneingang_id}>
                        <TableCell>{wareneingang.wareneingang_nr}</TableCell>
                        <TableCell>{wareneingang.lieferant_name}</TableCell>
                        <TableCell>{wareneingang.lieferdatum}</TableCell>
                        <TableCell>{wareneingang.anzahl_positionen}</TableCell>
                        <TableCell>
                          <StatusChip status={wareneingang.status} label={wareneingang.status} />
                        </TableCell>
                        <TableCell>
                          <Box className="flex space-x-1">
                            <Tooltip title="Anzeigen">
                              <IconButton size="small">
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Bearbeiten">
                              <IconButton size="small">
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Warenausgang Tab */}
          {activeTab === 4 && (
            <Box>
              <Box className="flex justify-between items-center mb-4">
                <Typography variant="h6">Warenausgang</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('warenausgang')}
                >
                  Neuer Warenausgang
                </Button>
              </Box>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Warenausgang-Nr.</TableCell>
                      <TableCell>Kunde</TableCell>
                      <TableCell>Typ</TableCell>
                      <TableCell>Ausgangsdatum</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Kommissionierung</TableCell>
                      <TableCell>Aktionen</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockWarenausgaenge.map((warenausgang) => (
                      <TableRow key={warenausgang.warenausgang_id}>
                        <TableCell>{warenausgang.warenausgang_nr}</TableCell>
                        <TableCell>{warenausgang.kunde_name}</TableCell>
                        <TableCell>{warenausgang.ausgangstyp}</TableCell>
                        <TableCell>{warenausgang.ausgangsdatum}</TableCell>
                        <TableCell>
                          <StatusChip status={warenausgang.status} label={warenausgang.status} />
                        </TableCell>
                        <TableCell>
                          <StatusChip status={warenausgang.kommissionierung_status} label={warenausgang.kommissionierung_status} />
                        </TableCell>
                        <TableCell>
                          <Box className="flex space-x-1">
                            <Tooltip title="Anzeigen">
                              <IconButton size="small">
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Bearbeiten">
                              <IconButton size="small">
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Kommissionierung Tab */}
          {activeTab === 5 && (
            <Box>
              <Box className="flex justify-between items-center mb-4">
                <Typography variant="h6">Kommissionieraufträge</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                >
                  Neuer Auftrag
                </Button>
              </Box>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Auftrag-Nr.</TableCell>
                      <TableCell>Typ</TableCell>
                      <TableCell>Priorität</TableCell>
                      <TableCell>Positionen</TableCell>
                      <TableCell>Geplante Startzeit</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Aktionen</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockKommissionierauftraege.map((auftrag) => (
                      <TableRow key={auftrag.kommissionierauftrag_id}>
                        <TableCell>{auftrag.kommissionierauftrag_nr}</TableCell>
                        <TableCell>{auftrag.kommissionierauftrag_typ}</TableCell>
                        <TableCell>
                          <Box className="flex items-center">
                            <PriorityIcon className="text-red-500 mr-1" />
                            {auftrag.prioritaet}
                          </Box>
                        </TableCell>
                        <TableCell>{auftrag.anzahl_positionen}</TableCell>
                        <TableCell>{auftrag.geplante_startzeit}</TableCell>
                        <TableCell>
                          <StatusChip status={auftrag.status} label={auftrag.status} />
                        </TableCell>
                        <TableCell>
                          <Box className="flex space-x-1">
                            <Tooltip title="Anzeigen">
                              <IconButton size="small">
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Bearbeiten">
                              <IconButton size="small">
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'lagerort' && 'Neuer Lagerort'}
          {dialogType === 'bewegung' && 'Neue Lagerbewegung'}
          {dialogType === 'wareneingang' && 'Neuer Wareneingang'}
          {dialogType === 'warenausgang' && 'Neuer Warenausgang'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary">
            Dialog-Inhalt würde hier implementiert werden.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WarehouseManagement; 