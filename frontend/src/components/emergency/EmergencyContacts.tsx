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
  Tooltip
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import emergencyApi, { EmergencyContact } from '../../services/emergencyApi';

const roles = [
  'Krisenstab',
  'Notfallmanager',
  'Arzt',
  'Feuerwehr',
  'IT',
  'Sicherheitsbeauftragter',
  'Externer Kontakt',
  'Sonstiges'
];

const EmergencyContacts: React.FC = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');

  // Dialog-States
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<EmergencyContact | null>(null);
  const [form, setForm] = useState<Partial<EmergencyContact>>({ name: '', role: '', is_external: false });
  const [formError, setFormError] = useState<string | null>(null);

  // Ref für reload
  const fetchContactsRef = useRef<() => Promise<void>>();

  useEffect(() => {
    fetchContactsRef.current = async () => {
      setLoading(true);
      try {
        let data = await emergencyApi.getContacts();
        if (filterRole) data = data.filter(c => c.role === filterRole);
        if (search) data = data.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
        setContacts(data);
        setError(null);
      } catch (err) {
        setError('Fehler beim Laden der Kontakte.');
      } finally {
        setLoading(false);
      }
    };
    fetchContactsRef.current();
  }, [filterRole, search]);

  // Dialog-Handler
  const openCreate = () => { setForm({ name: '', role: '', is_external: false }); setFormError(null); setCreateOpen(true); };
  const openEdit = (c: EmergencyContact) => { setSelected(c); setForm({ ...c }); setFormError(null); setEditOpen(true); };
  const openDelete = (c: EmergencyContact) => { setSelected(c); setDeleteOpen(true); };
  const closeDialogs = () => { setCreateOpen(false); setEditOpen(false); setDeleteOpen(false); setSelected(null); setFormError(null); };

  // Form-Handler
  const handleFormChange = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  // CRUD
  const handleCreate = async () => {
    if (!form.name || !form.role) { setFormError('Name und Rolle sind Pflichtfelder.'); return; }
    try {
      await emergencyApi.createContact(form);
      closeDialogs();
      fetchContactsRef.current && fetchContactsRef.current();
    } catch {
      setFormError('Fehler beim Anlegen.');
    }
  };
  const handleEdit = async () => {
    if (!selected || !form.name || !form.role) { setFormError('Name und Rolle sind Pflichtfelder.'); return; }
    try {
      await emergencyApi.updateContact(selected.id, form);
      closeDialogs();
      fetchContactsRef.current && fetchContactsRef.current();
    } catch {
      setFormError('Fehler beim Speichern.');
    }
  };
  const handleDelete = async () => {
    if (!selected) return;
    try {
      await emergencyApi.updateContact(selected.id, { ...selected, is_external: true, name: selected.name + ' (gelöscht)' }); // Soft-Delete
      closeDialogs();
      fetchContactsRef.current && fetchContactsRef.current();
    } catch {
      setError('Fehler beim Löschen.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <TextField size="small" placeholder="Suche nach Name" value={search} onChange={e => setSearch(e.target.value)} InputProps={{ startAdornment: <SearchIcon fontSize="small" /> }} />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Rolle</InputLabel>
          <Select value={filterRole} label="Rolle" onChange={e => setFilterRole(e.target.value)}>
            <MenuItem value="">Alle</MenuItem>
            {roles.map(role => <MenuItem key={role} value={role}>{role}</MenuItem>)}
          </Select>
        </FormControl>
        <Box flexGrow={1} />
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Neuer Kontakt</Button>
      </Box>
      {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box> : error ? <Alert severity="error">{error}</Alert> : (
        <Paper>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Rolle</TableCell>
                <TableCell>Telefon</TableCell>
                <TableCell>E-Mail</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contacts.map(contact => (
                <TableRow key={contact.id}>
                  <TableCell>{contact.name}</TableCell>
                  <TableCell>{contact.role}</TableCell>
                  <TableCell>{contact.phone_primary || '-'}</TableCell>
                  <TableCell>{contact.email || '-'}</TableCell>
                  <TableCell>
                    <Tooltip title="Bearbeiten"><IconButton onClick={() => openEdit(contact)}><EditIcon /></IconButton></Tooltip>
                    <Tooltip title="Löschen"><IconButton color="error" onClick={() => openDelete(contact)}><DeleteIcon /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
      {/* Create Dialog */}
      <Dialog open={createOpen} onClose={closeDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Neuen Kontakt anlegen</DialogTitle>
        <DialogContent>
          <TextField label="Name" fullWidth margin="normal" value={form.name || ''} onChange={e => handleFormChange('name', e.target.value)} required />
          <FormControl fullWidth margin="normal">
            <InputLabel>Rolle</InputLabel>
            <Select value={form.role || ''} label="Rolle" onChange={e => handleFormChange('role', e.target.value)} required>
              {roles.map(role => <MenuItem key={role} value={role}>{role}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Telefon" fullWidth margin="normal" value={form.phone_primary || ''} onChange={e => handleFormChange('phone_primary', e.target.value)} />
          <TextField label="E-Mail" fullWidth margin="normal" value={form.email || ''} onChange={e => handleFormChange('email', e.target.value)} />
          <TextField label="Organisation" fullWidth margin="normal" value={form.organization || ''} onChange={e => handleFormChange('organization', e.target.value)} />
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
        <DialogTitle>Kontakt bearbeiten</DialogTitle>
        <DialogContent>
          <TextField label="Name" fullWidth margin="normal" value={form.name || ''} onChange={e => handleFormChange('name', e.target.value)} required />
          <FormControl fullWidth margin="normal">
            <InputLabel>Rolle</InputLabel>
            <Select value={form.role || ''} label="Rolle" onChange={e => handleFormChange('role', e.target.value)} required>
              {roles.map(role => <MenuItem key={role} value={role}>{role}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Telefon" fullWidth margin="normal" value={form.phone_primary || ''} onChange={e => handleFormChange('phone_primary', e.target.value)} />
          <TextField label="E-Mail" fullWidth margin="normal" value={form.email || ''} onChange={e => handleFormChange('email', e.target.value)} />
          <TextField label="Organisation" fullWidth margin="normal" value={form.organization || ''} onChange={e => handleFormChange('organization', e.target.value)} />
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
          <Typography>Möchtest du den Kontakt wirklich löschen?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialogs}>Abbrechen</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Löschen</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmergencyContacts; 