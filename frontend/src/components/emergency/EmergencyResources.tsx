import React, { useState, useEffect, useRef } from 'react';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import emergencyApi, { EmergencyResource } from '../../services/emergencyApi';

const resourceTypes = [
  { value: 'equipment', label: 'Ausrüstung' },
  { value: 'vehicles', label: 'Fahrzeuge' },
  { value: 'tools', label: 'Werkzeuge' },
  { value: 'first_aid', label: 'Erste Hilfe' },
  { value: 'safety', label: 'Sicherheitsausrüstung' },
  { value: 'communication', label: 'Kommunikation' },
  { value: 'power', label: 'Stromversorgung' },
  { value: 'it', label: 'IT-Ressourcen' },
  { value: 'other', label: 'Sonstiges' }
];

const EmergencyResources: React.FC = () => {
  const [resources, setResources] = useState<EmergencyResource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterAvailable, setFilterAvailable] = useState(false);

  // Dialog-States
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<EmergencyResource | null>(null);
  const [form, setForm] = useState<Partial<EmergencyResource>>({ name: '', type: '', quantity: 1, is_available: true });
  const [formError, setFormError] = useState<string | null>(null);

  // Ref für reload
  const fetchResourcesRef = useRef<() => Promise<void>>();

  useEffect(() => {
    fetchResourcesRef.current = async () => {
      setLoading(true);
      try {
        let data = await emergencyApi.getResources();
        // Filter anwenden
        if (filterType) data = data.filter(r => r.type === filterType);
        if (filterAvailable) data = data.filter(r => r.is_available);
        if (search) data = data.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
        setResources(data);
        setError(null);
      } catch (err) {
        setError('Fehler beim Laden der Ressourcen.');
      } finally {
        setLoading(false);
      }
    };
    fetchResourcesRef.current();
  }, [filterType, filterAvailable, search]);

  // Dialog-Handler
  const openCreate = () => { setForm({ name: '', type: '', quantity: 1, is_available: true }); setFormError(null); setCreateOpen(true); };
  const openEdit = (r: EmergencyResource) => { setSelected(r); setForm({ ...r }); setFormError(null); setEditOpen(true); };
  const openDelete = (r: EmergencyResource) => { setSelected(r); setDeleteOpen(true); };
  const closeDialogs = () => { setCreateOpen(false); setEditOpen(false); setDeleteOpen(false); setSelected(null); setFormError(null); };

  // Form-Handler
  const handleFormChange = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  // CRUD
  const handleCreate = async () => {
    if (!form.name || !form.type) { setFormError('Name und Typ sind Pflichtfelder.'); return; }
    try {
      await emergencyApi.createResource(form);
      closeDialogs();
      fetchResourcesRef.current && fetchResourcesRef.current();
    } catch {
      setFormError('Fehler beim Anlegen.');
    }
  };
  const handleEdit = async () => {
    if (!selected || !form.name || !form.type) { setFormError('Name und Typ sind Pflichtfelder.'); return; }
    try {
      await emergencyApi.updateResource(selected.id, form);
      closeDialogs();
      fetchResourcesRef.current && fetchResourcesRef.current();
    } catch {
      setFormError('Fehler beim Speichern.');
    }
  };
  const handleDelete = async () => {
    if (!selected) return;
    try {
      await emergencyApi.updateResource(selected.id, { ...selected, is_available: false, quantity: 0 }); // Soft-Delete
      closeDialogs();
      fetchResourcesRef.current && fetchResourcesRef.current();
    } catch {
      setError('Fehler beim Löschen.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <TextField size="small" placeholder="Suche nach Name" value={search} onChange={e => setSearch(e.target.value)} InputProps={{ startAdornment: <SearchIcon fontSize="small" /> }} />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Typ</InputLabel>
          <Select value={filterType} label="Typ" onChange={e => setFilterType(e.target.value)}>
            <MenuItem value="">Alle</MenuItem>
            {resourceTypes.map(rt => <MenuItem key={rt.value} value={rt.value}>{rt.label}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControlLabel control={<Switch checked={filterAvailable} onChange={e => setFilterAvailable(e.target.checked)} />} label="Nur verfügbare" />
        <Box flexGrow={1} />
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Neue Ressource</Button>
      </Box>
      {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box> : error ? <Alert severity="error">{error}</Alert> : (
        <Paper>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Typ</TableCell>
                <TableCell>Menge</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {resources.map(res => (
                <TableRow key={res.id}>
                  <TableCell>{res.name}</TableCell>
                  <TableCell>{resourceTypes.find(rt => rt.value === res.type)?.label || res.type}</TableCell>
                  <TableCell>{res.quantity}</TableCell>
                  <TableCell>{res.is_available ? 'verfügbar' : 'belegt'}</TableCell>
                  <TableCell>
                    <Tooltip title="Bearbeiten"><IconButton onClick={() => openEdit(res)}><EditIcon /></IconButton></Tooltip>
                    <Tooltip title="Löschen"><IconButton color="error" onClick={() => openDelete(res)}><DeleteIcon /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
      {/* Create Dialog */}
      <Dialog open={createOpen} onClose={closeDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Neue Ressource anlegen</DialogTitle>
        <DialogContent>
          <TextField label="Name" fullWidth margin="normal" value={form.name || ''} onChange={e => handleFormChange('name', e.target.value)} required />
          <FormControl fullWidth margin="normal">
            <InputLabel>Typ</InputLabel>
            <Select value={form.type || ''} label="Typ" onChange={e => handleFormChange('type', e.target.value)} required>
              {resourceTypes.map(rt => <MenuItem key={rt.value} value={rt.value}>{rt.label}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Menge" type="number" fullWidth margin="normal" value={form.quantity || 1} onChange={e => handleFormChange('quantity', Number(e.target.value))} />
          <FormControlLabel control={<Switch checked={!!form.is_available} onChange={e => handleFormChange('is_available', e.target.checked)} />} label="Verfügbar" />
          <TextField label="Standort" fullWidth margin="normal" value={form.location || ''} onChange={e => handleFormChange('location', e.target.value)} />
          <TextField label="Notizen" fullWidth margin="normal" value={form.notes || ''} onChange={e => handleFormChange('notes', e.target.value)} />
          {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialogs}>Abbrechen</Button>
          <Button variant="contained" onClick={handleCreate}>Anlegen</Button>
        </DialogActions>
      </Dialog>
      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={closeDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Ressource bearbeiten</DialogTitle>
        <DialogContent>
          <TextField label="Name" fullWidth margin="normal" value={form.name || ''} onChange={e => handleFormChange('name', e.target.value)} required />
          <FormControl fullWidth margin="normal">
            <InputLabel>Typ</InputLabel>
            <Select value={form.type || ''} label="Typ" onChange={e => handleFormChange('type', e.target.value)} required>
              {resourceTypes.map(rt => <MenuItem key={rt.value} value={rt.value}>{rt.label}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Menge" type="number" fullWidth margin="normal" value={form.quantity || 1} onChange={e => handleFormChange('quantity', Number(e.target.value))} />
          <FormControlLabel control={<Switch checked={!!form.is_available} onChange={e => handleFormChange('is_available', e.target.checked)} />} label="Verfügbar" />
          <TextField label="Standort" fullWidth margin="normal" value={form.location || ''} onChange={e => handleFormChange('location', e.target.value)} />
          <TextField label="Notizen" fullWidth margin="normal" value={form.notes || ''} onChange={e => handleFormChange('notes', e.target.value)} />
          {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialogs}>Abbrechen</Button>
          <Button variant="contained" onClick={handleEdit}>Speichern</Button>
        </DialogActions>
      </Dialog>
      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onClose={closeDialogs} maxWidth="xs">
        <DialogTitle>Löschen bestätigen</DialogTitle>
        <DialogContent>
          <Typography>Möchtest du die Ressource wirklich löschen?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialogs}>Abbrechen</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Löschen</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmergencyResources; 