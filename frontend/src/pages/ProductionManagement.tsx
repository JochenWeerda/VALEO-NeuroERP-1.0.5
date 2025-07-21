import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Build as BuildIcon,
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
  Engineering as EngineeringIcon,
  Verified as VerifiedIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

// =====================================================
// TYPESCRIPT INTERFACES
// =====================================================

interface Artikel {
  artikel_id: string;
  artikelnummer: string;
  bezeichnung: string;
  artikeltyp: 'ROHSTOFF' | 'HALBFERTIG' | 'FERTIGPRODUKT' | 'HILFSSTOFF';
  einheit: string;
  gewicht_kg?: number;
  einkaufspreis?: number;
  verkaufspreis?: number;
  status: 'AKTIV' | 'INAKTIV' | 'GESPERRT';
}

interface Produktionsauftrag {
  auftrag_id: string;
  auftragsnummer: string;
  artikel_bezeichnung: string;
  status: 'ERSTELLT' | 'FREIGEGEBEN' | 'IN_BEARBEITUNG' | 'PAUSIERT' | 'ABGESCHLOSSEN' | 'STORNIERT';
  menge_geplant: number;
  menge_fertiggestellt: number;
  menge_ausschnitt: number;
  fortschritt_prozent: number;
  starttermin: string;
  endtermin: string;
  prioritaet: number;
}

interface Maschinenauslastung {
  maschinen_nr: string;
  maschinen_bezeichnung: string;
  maschinen_status: string;
  anzahl_belegungen: number;
  belegungsstunden: number;
  naechste_wartung?: string;
}

interface Qualitaetsstatistik {
  monat: string;
  anzahl_pruefungen: number;
  bestanden: number;
  nicht_bestanden: number;
  qualitaetsquote_prozent: number;
}

interface Stueckliste {
  stueckliste_id: string;
  artikel_bezeichnung: string;
  stueckliste_typ: string;
  version: string;
  status: string;
  gueltig_von: string;
  gueltig_bis?: string;
}

interface Arbeitsplan {
  arbeitsplan_id: string;
  artikel_bezeichnung: string;
  arbeitsplan_typ: string;
  version: string;
  status: string;
  gueltig_von: string;
  gueltig_bis?: string;
}

// =====================================================
// MOCK DATA
// =====================================================

const mockProduktionsauftraege: Produktionsauftrag[] = [
  {
    auftrag_id: '1',
    auftragsnummer: 'PAU000001',
    artikel_bezeichnung: 'Motorblock Typ A',
    status: 'IN_BEARBEITUNG',
    menge_geplant: 100,
    menge_fertiggestellt: 65,
    menge_ausschnitt: 2,
    fortschritt_prozent: 65,
    starttermin: '2024-03-15',
    endtermin: '2024-03-25',
    prioritaet: 8
  },
  {
    auftrag_id: '2',
    auftragsnummer: 'PAU000002',
    artikel_bezeichnung: 'Kolben Typ B',
    status: 'FREIGEGEBEN',
    menge_geplant: 500,
    menge_fertiggestellt: 0,
    menge_ausschnitt: 0,
    fortschritt_prozent: 0,
    starttermin: '2024-03-20',
    endtermin: '2024-03-30',
    prioritaet: 5
  },
  {
    auftrag_id: '3',
    auftragsnummer: 'PAU000003',
    artikel_bezeichnung: 'Getriebe Typ C',
    status: 'ABGESCHLOSSEN',
    menge_geplant: 50,
    menge_fertiggestellt: 50,
    menge_ausschnitt: 1,
    fortschritt_prozent: 100,
    starttermin: '2024-03-10',
    endtermin: '2024-03-18',
    prioritaet: 9
  }
];

const mockMaschinenauslastung: Maschinenauslastung[] = [
  {
    maschinen_nr: 'M001',
    maschinen_bezeichnung: 'CNC-Fräse Typ A',
    maschinen_status: 'AKTIV',
    anzahl_belegungen: 12,
    belegungsstunden: 85,
    naechste_wartung: '2024-04-15'
  },
  {
    maschinen_nr: 'M002',
    maschinen_bezeichnung: 'Drehmaschine Typ B',
    maschinen_status: 'WARTUNG',
    anzahl_belegungen: 8,
    belegungsstunden: 65,
    naechste_wartung: '2024-03-25'
  },
  {
    maschinen_nr: 'M003',
    maschinen_bezeichnung: 'Schweißroboter Typ C',
    maschinen_status: 'AKTIV',
    anzahl_belegungen: 15,
    belegungsstunden: 92,
    naechste_wartung: '2024-04-20'
  }
];

const mockQualitaetsstatistiken: Qualitaetsstatistik[] = [
  {
    monat: 'Januar 2024',
    anzahl_pruefungen: 150,
    bestanden: 142,
    nicht_bestanden: 8,
    qualitaetsquote_prozent: 94.7
  },
  {
    monat: 'Februar 2024',
    anzahl_pruefungen: 165,
    bestanden: 158,
    nicht_bestanden: 7,
    qualitaetsquote_prozent: 95.8
  },
  {
    monat: 'März 2024',
    anzahl_pruefungen: 180,
    bestanden: 171,
    nicht_bestanden: 9,
    qualitaetsquote_prozent: 95.0
  }
];

const mockStuecklisten: Stueckliste[] = [
  {
    stueckliste_id: 'ST001',
    artikel_bezeichnung: 'Motorblock Typ A',
    stueckliste_typ: 'FERTIGPRODUKT',
    version: '1.2',
    status: 'AKTIV',
    gueltig_von: '2024-01-01',
    gueltig_bis: undefined
  },
  {
    stueckliste_id: 'ST002',
    artikel_bezeichnung: 'Kolben Typ B',
    stueckliste_typ: 'FERTIGPRODUKT',
    version: '2.1',
    status: 'AKTIV',
    gueltig_von: '2024-02-15',
    gueltig_bis: undefined
  }
];

const mockArbeitsplaene: Arbeitsplan[] = [
  {
    arbeitsplan_id: 'AP001',
    artikel_bezeichnung: 'Motorblock Typ A',
    arbeitsplan_typ: 'STANDARD',
    version: '1.0',
    status: 'AKTIV',
    gueltig_von: '2024-01-01',
    gueltig_bis: undefined
  },
  {
    arbeitsplan_id: 'AP002',
    artikel_bezeichnung: 'Kolben Typ B',
    arbeitsplan_typ: 'STANDARD',
    version: '1.5',
    status: 'AKTIV',
    gueltig_von: '2024-02-15',
    gueltig_bis: undefined
  }
];

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
  const getColorClass = (color: string) => {
    switch (color) {
      case 'primary': return 'text-blue-600';
      case 'secondary': return 'text-purple-600';
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-orange-600';
      case 'info': return 'text-cyan-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardContent>
        <Box className="flex items-center justify-between mb-2">
          <Typography variant="h6" className="font-semibold text-gray-700">
            {title}
          </Typography>
          <Box className={`${getColorClass(color)}`}>
            {icon}
          </Box>
        </Box>
        <Typography variant="h4" className={`font-bold ${getColorClass(color)} mb-1`}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="textSecondary" className="mb-2">
            {subtitle}
          </Typography>
        )}
        {trend && (
          <Box className="flex items-center">
            <Typography 
              variant="body2" 
              className={`font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}
            >
              {trend.isPositive ? '+' : '-'}{trend.value}%
            </Typography>
            <Typography variant="body2" color="textSecondary" className="ml-1">
              vs. Vormonat
            </Typography>
          </Box>
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
      case 'ERSTELLT':
      case 'FREIGEGEBEN':
        return 'default';
      case 'IN_BEARBEITUNG':
        return 'primary';
      case 'PAUSIERT':
        return 'warning';
      case 'ABGESCHLOSSEN':
        return 'success';
      case 'STORNIERT':
        return 'error';
      default:
        return 'default';
    }
  };

  return <Chip label={label} color={getStatusColor(status) as any} size="small" />;
};

// =====================================================
// MAIN COMPONENT
// =====================================================

const ProductionManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState<'auftrag' | 'stueckliste' | 'arbeitsplan' | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (type: 'auftrag' | 'stueckliste' | 'arbeitsplan') => {
    setOpenDialog(type);
  };

  const handleCloseDialog = () => {
    setOpenDialog(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ERSTELLT':
        return <AssignmentIcon className="text-gray-500" />;
      case 'FREIGEGEBEN':
        return <VerifiedIcon className="text-blue-500" />;
      case 'IN_BEARBEITUNG':
        return <BuildIcon className="text-orange-500" />;
      case 'PAUSIERT':
        return <ScheduleIcon className="text-yellow-500" />;
      case 'ABGESCHLOSSEN':
        return <VerifiedIcon className="text-green-500" />;
      case 'STORNIERT':
        return <DeleteIcon className="text-red-500" />;
      default:
        return <AssignmentIcon className="text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'text-red-600';
    if (priority >= 6) return 'text-orange-600';
    if (priority >= 4) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Box className="p-6">
      {/* Header */}
      <Box className="mb-6">
        <Typography variant="h4" className="font-bold text-gray-800 mb-2">
          Produktionsmanagement
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Verwaltung von Stücklisten, Arbeitsplänen, Produktionsaufträgen und Qualitätskontrolle
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <KPICard
          title="Aktive Aufträge"
          value={mockProduktionsauftraege.filter(a => a.status === 'IN_BEARBEITUNG').length}
          subtitle="In Bearbeitung"
          icon={<AssignmentIcon className="text-2xl" />}
          color="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <KPICard
          title="Maschinenauslastung"
          value="87%"
          subtitle="Durchschnitt"
          icon={<EngineeringIcon className="text-2xl" />}
          color="success"
          trend={{ value: 5, isPositive: true }}
        />
        <KPICard
          title="Qualitätsquote"
          value="94.9%"
          subtitle="Letzter Monat"
          icon={<VerifiedIcon className="text-2xl" />}
          color="info"
          trend={{ value: 2, isPositive: true }}
        />
        <KPICard
          title="Durchlaufzeit"
          value="3.2 Tage"
          subtitle="Durchschnitt"
          icon={<ScheduleIcon className="text-2xl" />}
          color="warning"
          trend={{ value: 8, isPositive: false }}
        />
      </Box>

      {/* Main Content */}
      <Card className="mb-6">
        <Box className="border-b border-gray-200">
          <Tabs value={activeTab} onChange={handleTabChange} className="px-4">
            <Tab 
              label="Produktionsaufträge" 
              icon={<AssignmentIcon />} 
              iconPosition="start"
              className="flex items-center"
            />
            <Tab 
              label="Stücklisten" 
              icon={<InventoryIcon />} 
              iconPosition="start"
              className="flex items-center"
            />
            <Tab 
              label="Arbeitspläne" 
              icon={<BuildIcon />} 
              iconPosition="start"
              className="flex items-center"
            />
            <Tab 
              label="Maschinenbelegung" 
              icon={<EngineeringIcon />} 
              iconPosition="start"
              className="flex items-center"
            />
            <Tab 
              label="Qualitätskontrolle" 
              icon={<VerifiedIcon />} 
              iconPosition="start"
              className="flex items-center"
            />
            <Tab 
              label="Statistiken" 
              icon={<AssessmentIcon />} 
              iconPosition="start"
              className="flex items-center"
            />
          </Tabs>
        </Box>

        <CardContent className="p-0">
          {/* Produktionsaufträge Tab */}
          {activeTab === 0 && (
            <Box className="p-6">
              <Box className="flex justify-between items-center mb-4">
                <Typography variant="h6" className="font-semibold">
                  Produktionsaufträge
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('auftrag')}
                >
                  Neuer Auftrag
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Auftragsnummer</TableCell>
                      <TableCell>Artikel</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Menge</TableCell>
                      <TableCell>Fortschritt</TableCell>
                      <TableCell>Priorität</TableCell>
                      <TableCell>Termine</TableCell>
                      <TableCell align="center">Aktionen</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockProduktionsauftraege.map((auftrag) => (
                      <TableRow key={auftrag.auftrag_id} hover>
                        <TableCell className="font-medium">
                          {auftrag.auftragsnummer}
                        </TableCell>
                        <TableCell>{auftrag.artikel_bezeichnung}</TableCell>
                        <TableCell>
                          <Box className="flex items-center">
                            {getStatusIcon(auftrag.status)}
                            <StatusChip status={auftrag.status} label={auftrag.status} />
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          {auftrag.menge_fertiggestellt} / {auftrag.menge_geplant}
                        </TableCell>
                        <TableCell>
                          <Box className="flex items-center">
                            <LinearProgress 
                              variant="determinate" 
                              value={auftrag.fortschritt_prozent} 
                              className="flex-1 mr-2"
                            />
                            <Typography variant="body2" className="min-w-[40px]">
                              {auftrag.fortschritt_prozent}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={`P${auftrag.prioritaet}`}
                            className={getPriorityColor(auftrag.prioritaet)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              Start: {new Date(auftrag.starttermin).toLocaleDateString('de-DE')}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Ende: {new Date(auftrag.endtermin).toLocaleDateString('de-DE')}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box className="flex justify-center space-x-1">
                            <Tooltip title="Anzeigen">
                              <IconButton size="small">
                                <VisibilityIcon />
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

          {/* Stücklisten Tab */}
          {activeTab === 1 && (
            <Box className="p-6">
              <Box className="flex justify-between items-center mb-4">
                <Typography variant="h6" className="font-semibold">
                  Stücklisten
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('stueckliste')}
                >
                  Neue Stückliste
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Stücklisten-ID</TableCell>
                      <TableCell>Artikel</TableCell>
                      <TableCell>Typ</TableCell>
                      <TableCell>Version</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Gültig von</TableCell>
                      <TableCell>Gültig bis</TableCell>
                      <TableCell align="center">Aktionen</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockStuecklisten.map((stueckliste) => (
                      <TableRow key={stueckliste.stueckliste_id} hover>
                        <TableCell className="font-medium">
                          {stueckliste.stueckliste_id}
                        </TableCell>
                        <TableCell>{stueckliste.artikel_bezeichnung}</TableCell>
                        <TableCell>{stueckliste.stueckliste_typ}</TableCell>
                        <TableCell>{stueckliste.version}</TableCell>
                        <TableCell>
                          <Chip 
                            label={stueckliste.status} 
                            color={stueckliste.status === 'AKTIV' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(stueckliste.gueltig_von).toLocaleDateString('de-DE')}
                        </TableCell>
                        <TableCell>
                          {stueckliste.gueltig_bis 
                            ? new Date(stueckliste.gueltig_bis).toLocaleDateString('de-DE')
                            : '-'
                          }
                        </TableCell>
                        <TableCell align="center">
                          <Box className="flex justify-center space-x-1">
                            <Tooltip title="Anzeigen">
                              <IconButton size="small">
                                <VisibilityIcon />
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

          {/* Arbeitspläne Tab */}
          {activeTab === 2 && (
            <Box className="p-6">
              <Box className="flex justify-between items-center mb-4">
                <Typography variant="h6" className="font-semibold">
                  Arbeitspläne
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('arbeitsplan')}
                >
                  Neuer Arbeitsplan
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Arbeitsplan-ID</TableCell>
                      <TableCell>Artikel</TableCell>
                      <TableCell>Typ</TableCell>
                      <TableCell>Version</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Gültig von</TableCell>
                      <TableCell>Gültig bis</TableCell>
                      <TableCell align="center">Aktionen</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockArbeitsplaene.map((arbeitsplan) => (
                      <TableRow key={arbeitsplan.arbeitsplan_id} hover>
                        <TableCell className="font-medium">
                          {arbeitsplan.arbeitsplan_id}
                        </TableCell>
                        <TableCell>{arbeitsplan.artikel_bezeichnung}</TableCell>
                        <TableCell>{arbeitsplan.arbeitsplan_typ}</TableCell>
                        <TableCell>{arbeitsplan.version}</TableCell>
                        <TableCell>
                          <Chip 
                            label={arbeitsplan.status} 
                            color={arbeitsplan.status === 'AKTIV' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(arbeitsplan.gueltig_von).toLocaleDateString('de-DE')}
                        </TableCell>
                        <TableCell>
                          {arbeitsplan.gueltig_bis 
                            ? new Date(arbeitsplan.gueltig_bis).toLocaleDateString('de-DE')
                            : '-'
                          }
                        </TableCell>
                        <TableCell align="center">
                          <Box className="flex justify-center space-x-1">
                            <Tooltip title="Anzeigen">
                              <IconButton size="small">
                                <VisibilityIcon />
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

          {/* Maschinenbelegung Tab */}
          {activeTab === 3 && (
            <Box className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                Maschinenbelegung
              </Typography>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Maschinen-Nr.</TableCell>
                      <TableCell>Bezeichnung</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Belegungen</TableCell>
                      <TableCell align="right">Stunden</TableCell>
                      <TableCell>Nächste Wartung</TableCell>
                      <TableCell align="center">Aktionen</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockMaschinenauslastung.map((maschine) => (
                      <TableRow key={maschine.maschinen_nr} hover>
                        <TableCell className="font-medium">
                          {maschine.maschinen_nr}
                        </TableCell>
                        <TableCell>{maschine.maschinen_bezeichnung}</TableCell>
                        <TableCell>
                          <Chip 
                            label={maschine.maschinen_status} 
                            color={maschine.maschinen_status === 'AKTIV' ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">{maschine.anzahl_belegungen}</TableCell>
                        <TableCell align="right">{maschine.belegungsstunden}h</TableCell>
                        <TableCell>
                          {maschine.naechste_wartung 
                            ? new Date(maschine.naechste_wartung).toLocaleDateString('de-DE')
                            : '-'
                          }
                        </TableCell>
                        <TableCell align="center">
                          <Box className="flex justify-center space-x-1">
                            <Tooltip title="Anzeigen">
                              <IconButton size="small">
                                <VisibilityIcon />
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

          {/* Qualitätskontrolle Tab */}
          {activeTab === 4 && (
            <Box className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                Qualitätskontrolle
              </Typography>

              <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="h-full">
                  <CardContent>
                    <Typography variant="h6" className="font-semibold mb-3">
                      Aktuelle Prüfungen
                    </Typography>
                    <Alert severity="info" className="mb-3">
                      3 offene Qualitätsprüfungen
                    </Alert>
                    <Button variant="outlined" startIcon={<AddIcon />} fullWidth>
                      Neue Prüfung erstellen
                    </Button>
                  </CardContent>
                </Card>
                <Card className="h-full">
                  <CardContent>
                    <Typography variant="h6" className="font-semibold mb-3">
                      Qualitätsquote
                    </Typography>
                    <Box className="text-center">
                      <Typography variant="h3" className="text-green-600 font-bold">
                        94.9%
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Letzter Monat
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          )}

          {/* Statistiken Tab */}
          {activeTab === 5 && (
            <Box className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                Produktionsstatistiken
              </Typography>

              <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent>
                    <Typography variant="h6" className="font-semibold mb-3">
                      Qualitätsentwicklung
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Monat</TableCell>
                            <TableCell align="right">Prüfungen</TableCell>
                            <TableCell align="right">Quote</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {mockQualitaetsstatistiken.map((stat) => (
                            <TableRow key={stat.monat}>
                              <TableCell>{stat.monat}</TableCell>
                              <TableCell align="right">{stat.anzahl_pruefungen}</TableCell>
                              <TableCell align="right">
                                <Chip 
                                  label={`${stat.qualitaetsquote_prozent}%`}
                                  color={stat.qualitaetsquote_prozent >= 95 ? 'success' : 'warning'}
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <Typography variant="h6" className="font-semibold mb-3">
                      Produktionskennzahlen
                    </Typography>
                    <Box className="space-y-3">
                      <Box className="flex justify-between items-center">
                        <Typography variant="body2">Durchschnittliche Durchlaufzeit</Typography>
                        <Typography variant="body1" className="font-semibold">3.2 Tage</Typography>
                      </Box>
                      <Box className="flex justify-between items-center">
                        <Typography variant="body2">Maschinenauslastung</Typography>
                        <Typography variant="body1" className="font-semibold">87%</Typography>
                      </Box>
                      <Box className="flex justify-between items-center">
                        <Typography variant="body2">Ausschussquote</Typography>
                        <Typography variant="body1" className="font-semibold text-red-600">2.1%</Typography>
                      </Box>
                      <Box className="flex justify-between items-center">
                        <Typography variant="body2">Termintreue</Typography>
                        <Typography variant="body1" className="font-semibold text-green-600">94%</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <Dialog open={openDialog !== null} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {openDialog === 'auftrag' && 'Neuer Produktionsauftrag'}
          {openDialog === 'stueckliste' && 'Neue Stückliste'}
          {openDialog === 'arbeitsplan' && 'Neuer Arbeitsplan'}
        </DialogTitle>
        <DialogContent>
          <Box className="space-y-4 pt-2">
            <TextField
              label="Bezeichnung"
              fullWidth
              variant="outlined"
            />
            <FormControl fullWidth>
              <InputLabel>Typ</InputLabel>
              <Select label="Typ">
                <MenuItem value="standard">Standard</MenuItem>
                <MenuItem value="express">Express</MenuItem>
                <MenuItem value="sonder">Sonderauftrag</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Menge"
              type="number"
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Starttermin"
              type="date"
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Endtermin"
              type="date"
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
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

export default ProductionManagement; 