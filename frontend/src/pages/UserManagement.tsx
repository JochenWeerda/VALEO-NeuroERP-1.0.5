import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  LinearProgress,
  Avatar,
  Alert,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Rating,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Tooltip,
  Menu,
  MenuItem as MenuItemComponent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  ContactPhone as ContactPhoneIcon,
  PersonAdd as PersonAddIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Chat as ChatIcon,
  Feedback as FeedbackIcon,
  Group as GroupIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Description as DescriptionIcon,
  MoreVert as MoreVertIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as ManagerIcon,
  Person as UserIcon,
  Visibility as ViewerIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { userManagementService, type User, type UserCreateRequest, type UserUpdateRequest, type UserStatistics } from '../services/userManagementService';

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
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const UserManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  // Form states
  const [formData, setFormData] = useState<UserCreateRequest>({
    username: '',
    email: '',
    full_name: '',
    password: '',
    role: 'user',
    department: '',
    position: '',
    phone: '',
    notes: ''
  });

  // Filter states
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');

  // Menu states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
    loadStatistics();
  }, [page, roleFilter, statusFilter, departmentFilter]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userManagementService.getUsers({
        page,
        limit,
        role_filter: roleFilter || undefined,
        status_filter: statusFilter || undefined,
        department_filter: departmentFilter || undefined
      });
      
      if (response.success && response.data) {
        setUsers(response.data.users);
        setTotal(response.data.total);
      } else {
        setError('Fehler beim Laden der Benutzer');
      }
    } catch (err) {
      setError('Fehler beim Laden der Benutzer');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await userManagementService.getUserStatistics();
      if (response.success && response.data) {
        setStatistics(response.data);
      }
    } catch (err) {
      console.error('Error loading statistics:', err);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (type: 'create' | 'edit' | 'view', user?: User) => {
    setDialogType(type);
    setSelectedUser(user || null);
    
    if (type === 'create') {
      setFormData({
        username: '',
        email: '',
        full_name: '',
        password: '',
        role: 'user',
        department: '',
        position: '',
        phone: '',
        notes: ''
      });
    } else if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        password: '',
        role: user.role,
        department: user.department || '',
        position: user.position || '',
        phone: user.phone || '',
        notes: ''
      });
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setFormData({
      username: '',
      email: '',
      full_name: '',
      password: '',
      role: 'user',
      department: '',
      position: '',
      phone: '',
      notes: ''
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (dialogType === 'create') {
        const response = await userManagementService.createUser(formData);
        if (response.success) {
          handleCloseDialog();
          loadUsers();
        } else {
          setError('Fehler beim Erstellen des Benutzers');
        }
      } else if (dialogType === 'edit' && selectedUser) {
        const updateData: UserUpdateRequest = {
          full_name: formData.full_name,
          email: formData.email,
          role: formData.role,
          department: formData.department,
          position: formData.position,
          phone: formData.phone,
          notes: formData.notes
        };
        
        const response = await userManagementService.updateUser(selectedUser.id, updateData);
        if (response.success) {
          handleCloseDialog();
          loadUsers();
        } else {
          setError('Fehler beim Aktualisieren des Benutzers');
        }
      }
    } catch (err) {
      setError('Fehler beim Speichern des Benutzers');
      console.error('Error saving user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Sind Sie sicher, dass Sie diesen Benutzer löschen möchten?')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await userManagementService.deleteUser(userId);
      if (response.success) {
        loadUsers();
      } else {
        setError('Fehler beim Löschen des Benutzers');
      }
    } catch (err) {
      setError('Fehler beim Löschen des Benutzers');
      console.error('Error deleting user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, userId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedUserId(userId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUserId(null);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <AdminIcon />;
      case 'manager': return <ManagerIcon />;
      case 'user': return <UserIcon />;
      case 'viewer': return <ViewerIcon />;
      default: return <UserIcon />;
    }
  };

  const getRoleColor = (role: string) => {
    return userManagementService.getRoleColor(role);
  };

  const getStatusColor = (status: string) => {
    return userManagementService.getStatusColor(status);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Benutzer-Management
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{statistics?.total_users || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Gesamt Benutzer
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{statistics?.active_users || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Aktive Benutzer
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AdminIcon sx={{ fontSize: 40, color: 'error.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{statistics?.role_distribution?.admin || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Administratoren
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ManagerIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{statistics?.role_distribution?.manager || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manager
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Benutzer-Liste" />
            <Tab label="Statistiken" />
            <Tab label="Berechtigungen" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {/* Filters */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Rolle</InputLabel>
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  label="Rolle"
                >
                  <MenuItem value="">Alle Rollen</MenuItem>
                  <MenuItem value="admin">Administrator</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="user">Benutzer</MenuItem>
                  <MenuItem value="viewer">Betrachter</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">Alle Status</MenuItem>
                  <MenuItem value="active">Aktiv</MenuItem>
                  <MenuItem value="inactive">Inaktiv</MenuItem>
                  <MenuItem value="suspended">Gesperrt</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Abteilung"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                placeholder="Abteilung filtern..."
              />
            </Grid>
          </Grid>

          {/* Users Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Benutzer</TableCell>
                  <TableCell>Rolle</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Abteilung</TableCell>
                  <TableCell>Letzter Login</TableCell>
                  <TableCell>Erstellt</TableCell>
                  <TableCell align="right">Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <LinearProgress />
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Keine Benutzer gefunden
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2 }}>
                            {user.full_name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{user.full_name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          icon={getRoleIcon(user.role)}
                          label={userManagementService.getRoleDisplayName(user.role)}
                          sx={{
                            backgroundColor: getRoleColor(user.role),
                            color: 'white'
                          }}
                          size="small"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={userManagementService.getStatusDisplayName(user.status)}
                          sx={{
                            backgroundColor: getStatusColor(user.status),
                            color: 'white'
                          }}
                          size="small"
                        />
                      </TableCell>
                      
                      <TableCell>{user.department || '-'}</TableCell>
                      <TableCell>{user.last_login ? formatDate(user.last_login) : '-'}</TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      
                      <TableCell align="right">
                        <IconButton onClick={() => handleOpenDialog('view', user)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton onClick={() => handleOpenDialog('edit', user)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={(e) => handleMenuOpen(e, user.id)}>
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Benutzer-Statistiken
          </Typography>
          
          {statistics && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Rollen-Verteilung
                    </Typography>
                    <List>
                      {Object.entries(statistics.role_distribution).map(([role, count]) => (
                        <ListItem key={role}>
                          <ListItemAvatar>
                            <Avatar sx={{ backgroundColor: getRoleColor(role) }}>
                              {getRoleIcon(role)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={userManagementService.getRoleDisplayName(role)}
                            secondary={`${count} Benutzer`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Abteilungs-Verteilung
                    </Typography>
                    <List>
                      {Object.entries(statistics.department_distribution).map(([dept, count]) => (
                        <ListItem key={dept}>
                          <ListItemAvatar>
                            <Avatar>
                              <BusinessIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={dept}
                            secondary={`${count} Benutzer`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Berechtigungssystem
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Administrator
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Vollzugriff auf alle Module und Funktionen
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Benutzer-Management" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="CRM-Management" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="System-Einstellungen" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Manager
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Erweiterte Berechtigungen für Geschäftsprozesse
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="CRM-Management" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Berichte und Analytics" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Benutzer-Einblick" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>

      {/* FAB */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => handleOpenDialog('create')}
      >
        <AddIcon />
      </Fab>

      {/* User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'create' ? 'Neuen Benutzer erstellen' : 
           dialogType === 'edit' ? 'Benutzer bearbeiten' : 'Benutzer-Details'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Benutzername"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={dialogType === 'edit'}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="E-Mail"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Vollständiger Name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </Grid>
            
            {dialogType === 'create' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Passwort"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </Grid>
            )}
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Rolle</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  label="Rolle"
                >
                  <MenuItem value="user">Benutzer</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="admin">Administrator</MenuItem>
                  <MenuItem value="viewer">Betrachter</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Telefon"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Abteilung"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notizen"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          {dialogType !== 'view' && (
            <Button onClick={handleSubmit} variant="contained" disabled={loading}>
              {loading ? 'Speichern...' : 'Speichern'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItemComponent onClick={() => {
          if (selectedUserId) {
            handleDeleteUser(selectedUserId);
          }
          handleMenuClose();
        }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Löschen
        </MenuItemComponent>
      </Menu>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default UserManagement; 