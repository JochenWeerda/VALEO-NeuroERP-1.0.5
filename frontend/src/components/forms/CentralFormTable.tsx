/**
 * Zentrale Formular-Tabelle Komponente
 * 
 * Diese Komponente visualisiert und verwaltet die zentrale Formular-Tabelle
 * mit allen Formularen, Versionsnummern und Berechtigungen.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Badge
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { CentralFormTableService, FormTableEntry, FormStatus, PermissionLevel } from '../../services/CentralFormTable';

interface CentralFormTableProps {
  className?: string;
}

interface FilterState {
  searchTerm: string;
  module: string;
  status: string;
  complexity: string;
  category: string;
}

interface SortState {
  field: keyof FormTableEntry;
  direction: 'asc' | 'desc';
}

export const CentralFormTable: React.FC<CentralFormTableProps> = ({ className = '' }) => {
  const [formTableService] = useState(() => CentralFormTableService.getInstance());
  const [formEntries, setFormEntries] = useState<FormTableEntry[]>([]);
  const [filterState, setFilterState] = useState<FilterState>({
    searchTerm: '',
    module: '',
    status: '',
    complexity: '',
    category: ''
  });
  const [sortState, setSortState] = useState<SortState>({
    field: 'index',
    direction: 'asc'
  });
  const [selectedEntry, setSelectedEntry] = useState<FormTableEntry | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);

  // Lade alle Formular-Einträge
  useEffect(() => {
    const entries = formTableService.getAllFormEntries();
    setFormEntries(entries);
    setStatistics(formTableService.getTableStatistics());
  }, [formTableService]);

  // Gefilterte und sortierte Einträge
  const filteredAndSortedEntries = useMemo(() => {
    let filtered = formEntries;

    // Anwenden der Filter
    if (filterState.searchTerm) {
      const searchTerm = filterState.searchTerm.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(searchTerm) ||
        entry.description.toLowerCase().includes(searchTerm) ||
        entry.module.toLowerCase().includes(searchTerm) ||
        entry.category.toLowerCase().includes(searchTerm)
      );
    }

    if (filterState.module) {
      filtered = filtered.filter(entry => entry.module === filterState.module);
    }

    if (filterState.status) {
      filtered = filtered.filter(entry => entry.status === filterState.status as FormStatus);
    }

    if (filterState.complexity) {
      filtered = filtered.filter(entry => entry.complexity === filterState.complexity);
    }

    if (filterState.category) {
      filtered = filtered.filter(entry => entry.category === filterState.category);
    }

    // Sortierung anwenden
    filtered.sort((a, b) => {
      const aValue = a[sortState.field];
      const bValue = b[sortState.field];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortState.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortState.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    return filtered;
  }, [formEntries, filterState, sortState]);

  const handleFilterChange = (field: keyof FilterState, value: string) => {
    setFilterState(prev => ({ ...prev, [field]: value }));
  };

  const handleSort = (field: keyof FormTableEntry) => {
    setSortState(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleViewDetails = (entry: FormTableEntry) => {
    setSelectedEntry(entry);
    setShowDetailsDialog(true);
  };

  const handleEditPermissions = (entry: FormTableEntry) => {
    setSelectedEntry(entry);
    setShowPermissionsDialog(true);
  };

  const handleExport = () => {
    const data = formTableService.exportTable();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form-table-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          const success = formTableService.importTable(content);
          if (success) {
            // Neu laden
            const entries = formTableService.getAllFormEntries();
            setFormEntries(entries);
            setStatistics(formTableService.getTableStatistics());
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const getPermissionColor = (entry: FormTableEntry) => {
    const hasAdmin = entry.permissions.admin.length > 0;
    const hasWrite = entry.permissions.write.length > 0;
    const hasRead = entry.permissions.read.length > 0;

    if (hasAdmin) return 'error';
    if (hasWrite) return 'warning';
    if (hasRead) return 'info';
    return 'default';
  };

  const getStatusColor = (status: FormStatus) => {
    switch (status) {
      case FormStatus.ACTIVE: return 'success';
      case FormStatus.DRAFT: return 'info';
      case FormStatus.DEPRECATED: return 'error';
      case FormStatus.ARCHIVED: return 'default';
      default: return 'default';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  return (
    <div className={`central-form-table ${className}`}>
      {/* Header mit Statistiken */}
      <Card className="mb-6">
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom>
            Zentrale Formular-Tabelle
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Vollständig indexierte Übersicht aller {statistics?.total || 0} Formulare und Eingabemasken
          </Typography>

          {statistics && (
            <Grid container spacing={2} className="mt-4">
              <Grid item xs={12} md={3}>
                <Box textAlign="center">
                  <Typography variant="h6" color="primary">
                    {statistics.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Gesamt
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box textAlign="center">
                  <Typography variant="h6" color="success.main">
                    {statistics.byStatus?.active || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Aktiv
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box textAlign="center">
                  <Typography variant="h6" color="warning.main">
                    {statistics.byComplexity?.high || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Komplex
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box textAlign="center">
                  <Typography variant="h6" color="info.main">
                    {statistics.averagePriority?.toFixed(1) || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ø Priorität
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Filter und Aktionen */}
      <Card className="mb-4">
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Suche"
                value={filterState.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon className="mr-2" />
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Modul</InputLabel>
                <Select
                  value={filterState.module}
                  onChange={(e) => handleFilterChange('module', e.target.value)}
                  label="Modul"
                >
                  <MenuItem value="">Alle</MenuItem>
                  <MenuItem value="warenwirtschaft">Warenwirtschaft</MenuItem>
                  <MenuItem value="finanzbuchhaltung">Finanzbuchhaltung</MenuItem>
                  <MenuItem value="crm">CRM</MenuItem>
                  <MenuItem value="crosscutting">Übergreifend</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterState.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">Alle</MenuItem>
                  <MenuItem value="active">Aktiv</MenuItem>
                  <MenuItem value="draft">Entwurf</MenuItem>
                  <MenuItem value="deprecated">Veraltet</MenuItem>
                  <MenuItem value="archived">Archiviert</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Komplexität</InputLabel>
                <Select
                  value={filterState.complexity}
                  onChange={(e) => handleFilterChange('complexity', e.target.value)}
                  label="Komplexität"
                >
                  <MenuItem value="">Alle</MenuItem>
                  <MenuItem value="low">Niedrig</MenuItem>
                  <MenuItem value="medium">Mittel</MenuItem>
                  <MenuItem value="high">Hoch</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleExport}
                >
                  Export
                </Button>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                >
                  Import
                  <input
                    type="file"
                    hidden
                    accept=".json"
                    onChange={handleImport}
                  />
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => {
                    const entries = formTableService.getAllFormEntries();
                    setFormEntries(entries);
                    setStatistics(formTableService.getTableStatistics());
                  }}
                >
                  Aktualisieren
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Formular-Tabelle */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Box display="flex" alignItems="center">
                  Index
                  <IconButton size="small" onClick={() => handleSort('index')}>
                    <SortIcon />
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center">
                  Titel
                  <IconButton size="small" onClick={() => handleSort('title')}>
                    <SortIcon />
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell>Modul</TableCell>
              <TableCell>Kategorie</TableCell>
              <TableCell>Version</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Komplexität</TableCell>
              <TableCell>Priorität</TableCell>
              <TableCell>Berechtigungen</TableCell>
              <TableCell>Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedEntries.map((entry) => (
              <TableRow key={entry.id} hover>
                <TableCell>
                  <Badge badgeContent={entry.index} color="primary">
                    <Typography variant="body2" fontWeight="bold">
                      #{entry.index}
                    </Typography>
                  </Badge>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {entry.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {entry.description}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={entry.module}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {entry.category}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" fontWeight="medium">
                      v{entry.version}
                    </Typography>
                    <Tooltip title="Versionshistorie">
                      <IconButton size="small">
                        <HistoryIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={entry.status}
                    size="small"
                    color={getStatusColor(entry.status)}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={entry.complexity}
                    size="small"
                    color={getComplexityColor(entry.complexity)}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {entry.priority}/10
                  </Typography>
                </TableCell>
                <TableCell>
                  <Tooltip title={`Admin: ${entry.permissions.admin.length}, Write: ${entry.permissions.write.length}, Read: ${entry.permissions.read.length}`}>
                    <Badge
                      badgeContent={entry.permissions.admin.length + entry.permissions.write.length + entry.permissions.read.length}
                      color={getPermissionColor(entry)}
                    >
                      <SecurityIcon color="action" />
                    </Badge>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title="Details anzeigen">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(entry)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Berechtigungen bearbeiten">
                      <IconButton
                        size="small"
                        onClick={() => handleEditPermissions(entry)}
                      >
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

      {/* Details Dialog */}
      <Dialog
        open={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Formular-Details: {selectedEntry?.title}
        </DialogTitle>
        <DialogContent>
          {selectedEntry && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Basis-Informationen</Typography>
                <Box mb={2}>
                  <Typography variant="body2"><strong>ID:</strong> {selectedEntry.id}</Typography>
                  <Typography variant="body2"><strong>Index:</strong> #{selectedEntry.index}</Typography>
                  <Typography variant="body2"><strong>Modul:</strong> {selectedEntry.module}</Typography>
                  <Typography variant="body2"><strong>Kategorie:</strong> {selectedEntry.category}</Typography>
                  <Typography variant="body2"><strong>Version:</strong> v{selectedEntry.version}</Typography>
                  <Typography variant="body2"><strong>Status:</strong> {selectedEntry.status}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Technische Details</Typography>
                <Box mb={2}>
                  <Typography variant="body2"><strong>Komponente:</strong> {selectedEntry.componentPath}</Typography>
                  <Typography variant="body2"><strong>Validierung:</strong> {selectedEntry.validationSchema}</Typography>
                  <Typography variant="body2"><strong>Komplexität:</strong> {selectedEntry.complexity}</Typography>
                  <Typography variant="body2"><strong>Priorität:</strong> {selectedEntry.priority}/10</Typography>
                  <Typography variant="body2"><strong>Accessibility:</strong> {selectedEntry.accessibilityLevel}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Berechtigungen</Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Chip label={`Admin: ${selectedEntry.permissions.admin.length}`} color="error" size="small" />
                  <Chip label={`Write: ${selectedEntry.permissions.write.length}`} color="warning" size="small" />
                  <Chip label={`Read: ${selectedEntry.permissions.read.length}`} color="success" size="small" />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Tags</Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {selectedEntry.tags.map((tag, index) => (
                    <Chip key={index} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailsDialog(false)}>Schließen</Button>
        </DialogActions>
      </Dialog>

      {/* Berechtigungen Dialog */}
      <Dialog
        open={showPermissionsDialog}
        onClose={() => setShowPermissionsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Berechtigungen bearbeiten: {selectedEntry?.title}
        </DialogTitle>
        <DialogContent>
          {selectedEntry && (
            <Alert severity="info" className="mb-4">
              Hier können die Berechtigungen für das Formular angepasst werden.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPermissionsDialog(false)}>Abbrechen</Button>
          <Button variant="contained" onClick={() => setShowPermissionsDialog(false)}>
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CentralFormTable; 