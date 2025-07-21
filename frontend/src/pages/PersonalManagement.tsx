import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Tooltip,
  Avatar,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  AttachMoney as SalaryIcon,
  Event as EventIcon,
  Business as DepartmentIcon
} from '@mui/icons-material';

interface Employee {
  id: string;
  personalnummer: string;
  vorname: string;
  nachname: string;
  geburtsdatum: string;
  eintrittsdatum: string;
  austrittsdatum?: string;
  abteilung: string;
  position: string;
  gehalt: number;
  urlaubstage: number;
  krankheitstage: number;
  status: 'aktiv' | 'inaktiv' | 'beurlaubt';
  email: string;
  telefon: string;
  adresse: string;
  plz: string;
  ort: string;
  created_at: string;
  updated_at: string;
}

const PersonalManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<Partial<Employee>>({
    personalnummer: '',
    vorname: '',
    nachname: '',
    geburtsdatum: '',
    eintrittsdatum: '',
    abteilung: '',
    position: '',
    gehalt: 0,
    urlaubstage: 30,
    krankheitstage: 0,
    status: 'aktiv',
    email: '',
    telefon: '',
    adresse: '',
    plz: '',
    ort: ''
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      // Mock-Daten für Demo
      const mockEmployees: Employee[] = [
        {
          id: '1',
          personalnummer: 'P001',
          vorname: 'Max',
          nachname: 'Mustermann',
          geburtsdatum: '1985-03-15',
          eintrittsdatum: '2020-01-01',
          abteilung: 'IT',
          position: 'Senior Entwickler',
          gehalt: 65000,
          urlaubstage: 30,
          krankheitstage: 2,
          status: 'aktiv',
          email: 'max.mustermann@valeo.de',
          telefon: '+49-30-123456',
          adresse: 'Musterstraße 123',
          plz: '10115',
          ort: 'Berlin',
          created_at: '2020-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          personalnummer: 'P002',
          vorname: 'Anna',
          nachname: 'Schmidt',
          geburtsdatum: '1990-07-22',
          eintrittsdatum: '2021-03-01',
          abteilung: 'HR',
          position: 'HR Manager',
          gehalt: 58000,
          urlaubstage: 30,
          krankheitstage: 0,
          status: 'aktiv',
          email: 'anna.schmidt@valeo.de',
          telefon: '+49-30-654321',
          adresse: 'Beispielweg 456',
          plz: '80331',
          ort: 'München',
          created_at: '2021-03-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '3',
          personalnummer: 'P003',
          vorname: 'Thomas',
          nachname: 'Weber',
          geburtsdatum: '1988-11-10',
          eintrittsdatum: '2019-06-01',
          austrittsdatum: '2023-12-31',
          abteilung: 'Finanzen',
          position: 'Controller',
          gehalt: 52000,
          urlaubstage: 30,
          krankheitstage: 5,
          status: 'inaktiv',
          email: 'thomas.weber@valeo.de',
          telefon: '+49-40-789012',
          adresse: 'Testallee 789',
          plz: '20095',
          ort: 'Hamburg',
          created_at: '2019-06-01T00:00:00Z',
          updated_at: '2023-12-31T00:00:00Z'
        }
      ];
      setEmployees(mockEmployees);
    } catch (err) {
      setError('Fehler beim Laden der Mitarbeiter');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setFormData({
      personalnummer: '',
      vorname: '',
      nachname: '',
      geburtsdatum: '',
      eintrittsdatum: '',
      abteilung: '',
      position: '',
      gehalt: 0,
      urlaubstage: 30,
      krankheitstage: 0,
      status: 'aktiv',
      email: '',
      telefon: '',
      adresse: '',
      plz: '',
      ort: ''
    });
    setDialogOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData(employee);
    setDialogOpen(true);
  };

  const handleSaveEmployee = async () => {
    try {
      if (editingEmployee) {
        // Update existing employee
        const updatedEmployees = employees.map(e => 
          e.id === editingEmployee.id ? { ...e, ...formData } : e
        );
        setEmployees(updatedEmployees);
      } else {
        // Add new employee
        const newEmployee: Employee = {
          id: Date.now().toString(),
          ...formData as Employee,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setEmployees([...employees, newEmployee]);
      }
      setDialogOpen(false);
    } catch (err) {
      setError('Fehler beim Speichern des Mitarbeiters');
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      setEmployees(employees.filter(e => e.id !== employeeId));
    } catch (err) {
      setError('Fehler beim Löschen des Mitarbeiters');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aktiv': return 'success';
      case 'inaktiv': return 'default';
      case 'beurlaubt': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'aktiv': return 'Aktiv';
      case 'inaktiv': return 'Inaktiv';
      case 'beurlaubt': return 'Beurlaubt';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PersonIcon sx={{ color: 'primary.main' }} />
          Personal-Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddEmployee}
        >
          Neuer Mitarbeiter
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistiken */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              {employees.length}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Mitarbeiter gesamt
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 'bold' }}>
              {employees.filter(e => e.status === 'aktiv').length}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Aktive Mitarbeiter
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
              {employees.reduce((sum, e) => sum + e.krankheitstage, 0)}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Krankheitstage
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ color: 'info.main', fontWeight: 'bold' }}>
              {employees.reduce((sum, e) => sum + e.gehalt, 0).toLocaleString()}€
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Gehaltssumme
            </Typography>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mitarbeiter</TableCell>
                <TableCell>Abteilung</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Gehalt</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Eintritt</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {employee.vorname.charAt(0)}{employee.nachname.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {employee.vorname} {employee.nachname}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {employee.personalnummer}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {employee.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DepartmentIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {employee.abteilung}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WorkIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {employee.position}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SalaryIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {employee.gehalt.toLocaleString()}€
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(employee.status)}
                      color={getStatusColor(employee.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EventIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {new Date(employee.eintrittsdatum).toLocaleDateString('de-DE')}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Anzeigen">
                        <IconButton size="small">
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Bearbeiten">
                        <IconButton size="small" onClick={() => handleEditEmployee(employee)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Löschen">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteEmployee(employee.id)}
                        >
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
      </Card>

      {/* Dialog für Mitarbeiter-Formular */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingEmployee ? 'Mitarbeiter bearbeiten' : 'Neuen Mitarbeiter erstellen'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Personalnummer"
                value={formData.personalnummer}
                onChange={(e) => setFormData({ ...formData, personalnummer: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="E-Mail"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vorname"
                value={formData.vorname}
                onChange={(e) => setFormData({ ...formData, vorname: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nachname"
                value={formData.nachname}
                onChange={(e) => setFormData({ ...formData, nachname: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Geburtsdatum"
                type="date"
                value={formData.geburtsdatum}
                onChange={(e) => setFormData({ ...formData, geburtsdatum: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Eintrittsdatum"
                type="date"
                value={formData.eintrittsdatum}
                onChange={(e) => setFormData({ ...formData, eintrittsdatum: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Abteilung"
                value={formData.abteilung}
                onChange={(e) => setFormData({ ...formData, abteilung: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Gehalt (€)"
                type="number"
                value={formData.gehalt}
                onChange={(e) => setFormData({ ...formData, gehalt: parseFloat(e.target.value) || 0 })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Urlaubstage"
                type="number"
                value={formData.urlaubstage}
                onChange={(e) => setFormData({ ...formData, urlaubstage: parseInt(e.target.value) || 0 })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefon"
                value={formData.telefon}
                onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  label="Status"
                >
                  <MenuItem value="aktiv">Aktiv</MenuItem>
                  <MenuItem value="inaktiv">Inaktiv</MenuItem>
                  <MenuItem value="beurlaubt">Beurlaubt</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adresse"
                multiline
                rows={2}
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="PLZ"
                value={formData.plz}
                onChange={(e) => setFormData({ ...formData, plz: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ort"
                value={formData.ort}
                onChange={(e) => setFormData({ ...formData, ort: e.target.value })}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleSaveEmployee} variant="contained">
            {editingEmployee ? 'Aktualisieren' : 'Erstellen'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PersonalManagement; 