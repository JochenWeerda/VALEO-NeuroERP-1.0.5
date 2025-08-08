/**
 * VALEO NeuroERP 2.0 - Formular-Registrierungs-Tabelle
 * Horizon Beta optimiert mit Versionsnummerierung und Rollenverwaltung
 * Serena Quality: Complete form registry table with role-based permissions
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
  Typography,
  Box,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Tooltip,
  Badge,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Edit as EditIcon,
  History as HistoryIcon,
  Security as SecurityIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Pending as PendingIcon,
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Inventory as InventoryIcon,
  AttachMoney as FinanceIcon,
  LocalShipping as SupplierIcon,
  ShoppingCart as OrderIcon,
  Assessment as ReportingIcon,
  Settings as SettingsIcon2,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { formRegistryService } from '../../services/FormRegistryService';
import {
  FormID,
  FormVersion,
  FormStatus,
  FormPermission,
  RolePermissions,
  FormConfig,
  FormVersionHistory,
  FormChangeRequest,
  FormChange,
  FORM_MODULES,
  FORM_STATUSES,
  FORM_PERMISSIONS,
} from '../../types/forms';

interface FormRegistryTableProps {
  currentUserRole: string;
  onFormEdit?: (formId: FormID) => void;
  onVersionHistory?: (formId: FormID) => void;
  onPermissionsEdit?: (formId: FormID) => void;
  onChangeRequest?: (requestId: string) => void;
}

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
      id={`form-registry-tabpanel-${index}`}
      aria-labelledby={`form-registry-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const FormRegistryTable: React.FC<FormRegistryTableProps> = ({
  currentUserRole,
  onFormEdit,
  onVersionHistory,
  onPermissionsEdit,
  onChangeRequest,
}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [selectedForm, setSelectedForm] = useState<FormConfig | null>(null);
  const [permissionsDialog, setPermissionsDialog] = useState(false);
  const [versionHistoryDialog, setVersionHistoryDialog] = useState(false);
  const [changeRequestsDialog, setChangeRequestsDialog] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);
  const [formTable, setFormTable] = useState<any[]>([]);
  const [changeRequests, setChangeRequests] = useState<FormChangeRequest[]>([]);

  // Daten laden
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const stats = formRegistryService.getFormStatistics();
    const forms = formRegistryService.getFormTable();
    const requests = formRegistryService.getAllChangeRequests();
    
    setStatistics(stats);
    setFormTable(forms);
    setChangeRequests(requests);
  };

  // Module-Icons Mapping
  const getModuleIcon = (module: string) => {
    switch (module) {
      case FORM_MODULES.PERSONAL:
        return <PersonIcon />;
      case FORM_MODULES.WAREHOUSE:
        return <InventoryIcon />;
      case FORM_MODULES.CRM:
        return <BusinessIcon />;
      case FORM_MODULES.FINANCE:
        return <FinanceIcon />;
      case FORM_MODULES.SUPPLIER:
        return <SupplierIcon />;
      case FORM_MODULES.ORDER:
        return <OrderIcon />;
      case FORM_MODULES.REPORTING:
        return <ReportingIcon />;
      case FORM_MODULES.SETTINGS:
        return <SettingsIcon2 />;
      default:
        return <SettingsIcon />;
    }
  };

  // Status-Farben
  const getStatusColor = (status: FormStatus) => {
    switch (status) {
      case FORM_STATUSES.ACTIVE:
        return 'success';
      case FORM_STATUSES.DRAFT:
        return 'warning';
      case FORM_STATUSES.DEPRECATED:
        return 'error';
      case FORM_STATUSES.ARCHIVED:
        return 'default';
      default:
        return 'default';
    }
  };

  // Berechtigungen prüfen
  const hasPermission = (formId: FormID, permission: FormPermission): boolean => {
    return formRegistryService.hasPermission(formId, currentUserRole, permission);
  };

  // Tab-Handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Dialog-Handler
  const handlePermissionsOpen = (form: FormConfig) => {
    setSelectedForm(form);
    setPermissionsDialog(true);
  };

  const handleVersionHistoryOpen = (formId: FormID) => {
    setVersionHistoryDialog(true);
    onVersionHistory?.(formId);
  };

  const handleChangeRequestsOpen = () => {
    setChangeRequestsDialog(true);
  };

  // Berechtigungen aktualisieren
  const handlePermissionsUpdate = (formId: FormID, permissions: RolePermissions) => {
    formRegistryService.updatePermissions(formId, permissions, currentUserRole);
    loadData();
    setPermissionsDialog(false);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header mit Statistiken */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Formular-Registrierung
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary">
                  {statistics?.totalForms || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Gesamt Formulare
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="success.main">
                  {statistics?.byStatus?.active || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Aktive Formulare
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="warning.main">
                  {statistics?.pendingRequests || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Ausstehende Anfragen
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="info.main">
                  {statistics?.changeRequests || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Änderungsanfragen
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="Formular-Registrierung Tabs">
          <Tab label="Formulare" />
          <Tab 
            label={
              <Badge badgeContent={statistics?.pendingRequests || 0} color="warning">
                Änderungsanfragen
              </Badge>
            } 
          />
          <Tab label="Statistiken" />
        </Tabs>
      </Box>

      {/* Formulare Tab */}
      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Formular</TableCell>
                <TableCell>Modul</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Berechtigungen</TableCell>
                <TableCell>Letzte Änderung</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formTable.map((form) => (
                <TableRow key={form.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getModuleIcon(form.module)}
                      <Box>
                        <Typography variant="subtitle2">{form.name}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          ID: {form.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={form.module} 
                      size="small" 
                      variant="outlined"
                      icon={getModuleIcon(form.module)}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={form.version} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={form.status} 
                      size="small" 
                      color={getStatusColor(form.status) as any}
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={0.5} flexWrap="wrap">
                      {Object.entries(form.permissions).map(([role, permissions]) => (
                        <Tooltip key={role} title={`${role}: ${Array.isArray(permissions) ? permissions.join(', ') : permissions}`}>
                          <Chip 
                            label={role} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontSize: '0.6rem' }}
                          />
                        </Tooltip>
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {form.lastUpdated.toLocaleDateString('de-DE')}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {form.lastUpdated.toLocaleTimeString('de-DE')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={0.5}>
                      {hasPermission(form.id, FORM_PERMISSIONS.READ) && (
                        <Tooltip title="Anzeigen">
                          <IconButton size="small" onClick={() => onFormEdit?.(form.id)}>
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {hasPermission(form.id, FORM_PERMISSIONS.WRITE) && (
                        <Tooltip title="Bearbeiten">
                          <IconButton size="small" onClick={() => onFormEdit?.(form.id)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      <Tooltip title="Versionshistorie">
                        <IconButton 
                          size="small" 
                          onClick={() => handleVersionHistoryOpen(form.id)}
                        >
                          <HistoryIcon />
                        </IconButton>
                      </Tooltip>
                      
                      {hasPermission(form.id, FORM_PERMISSIONS.ADMIN) && (
                        <Tooltip title="Berechtigungen">
                          <IconButton 
                            size="small" 
                            onClick={() => handlePermissionsOpen(form)}
                          >
                            <SecurityIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Änderungsanfragen Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Änderungsanfragen</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setChangeRequestsDialog(true)}
          >
            Neue Anfrage
          </Button>
        </Box>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Formular</TableCell>
                <TableCell>Angefordert von</TableCell>
                <TableCell>Datum</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Änderungen</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {changeRequests.map((request) => (
                <TableRow key={request.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {request.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">{request.formId}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{request.requestedBy}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {request.requestedAt.toLocaleDateString('de-DE')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={request.status} 
                      size="small" 
                      color={
                        request.status === 'approved' ? 'success' :
                        request.status === 'rejected' ? 'error' : 'warning'
                      }
                      icon={
                        request.status === 'approved' ? <ApprovedIcon /> :
                        request.status === 'rejected' ? <RejectedIcon /> : <PendingIcon />
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {request.changes.length} Änderungen
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => onChangeRequest?.(request.id)}
                    >
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Statistiken Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Formulare nach Modul
                </Typography>
                {statistics?.byModule && Object.entries(statistics.byModule).map(([module, count]) => (
                  <Box key={module} display="flex" justifyContent="space-between" alignItems="center" py={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getModuleIcon(module)}
                      <Typography variant="body2">{module}</Typography>
                    </Box>
                    <Chip label={count as number} size="small" color="primary" />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Formulare nach Status
                </Typography>
                {statistics?.byStatus && Object.entries(statistics.byStatus).map(([status, count]) => (
                  <Box key={status} display="flex" justifyContent="space-between" alignItems="center" py={1}>
                    <Chip 
                      label={status} 
                      size="small" 
                      color={getStatusColor(status as FormStatus) as any}
                    />
                    <Chip label={count as number} size="small" color="primary" />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Berechtigungen Dialog */}
      <Dialog 
        open={permissionsDialog} 
        onClose={() => setPermissionsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Berechtigungen bearbeiten: {selectedForm?.metadata.name}
        </DialogTitle>
        <DialogContent>
          {selectedForm && (
            <PermissionsEditor
              formId={selectedForm.id}
              currentPermissions={selectedForm.metadata.permissions}
              onSave={handlePermissionsUpdate}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPermissionsDialog(false)}>Abbrechen</Button>
        </DialogActions>
      </Dialog>

      {/* Versionshistorie Dialog */}
      <Dialog 
        open={versionHistoryDialog} 
        onClose={() => setVersionHistoryDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Versionshistorie</DialogTitle>
        <DialogContent>
          <VersionHistoryView />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVersionHistoryDialog(false)}>Schließen</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Berechtigungen-Editor Komponente
interface PermissionsEditorProps {
  formId: FormID;
  currentPermissions: RolePermissions;
  onSave: (formId: FormID, permissions: RolePermissions) => void;
}

const PermissionsEditor: React.FC<PermissionsEditorProps> = ({
  formId,
  currentPermissions,
  onSave,
}) => {
  const [permissions, setPermissions] = useState<RolePermissions>(currentPermissions);

  const roles = [
    'super_admin',
    'admin', 
    'manager',
    'accountant',
    'warehouse',
    'sales',
    'viewer'
  ];

  const permissionTypes = [
    FORM_PERMISSIONS.READ,
    FORM_PERMISSIONS.WRITE,
    FORM_PERMISSIONS.ADMIN,
    FORM_PERMISSIONS.DELETE
  ];

  const handlePermissionChange = (role: string, permission: FormPermission, checked: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [role]: checked 
        ? [...(prev[role as keyof RolePermissions] || []), permission]
        : (prev[role as keyof RolePermissions] || []).filter(p => p !== permission)
    }));
  };

  const handleSave = () => {
    onSave(formId, permissions);
  };

  return (
    <Box>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        Berechtigungen für Formular: {formId}
      </Typography>
      
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Rolle</TableCell>
              {permissionTypes.map(permission => (
                <TableCell key={permission} align="center">
                  {permission}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map(role => (
              <TableRow key={role}>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {role}
                  </Typography>
                </TableCell>
                {permissionTypes.map(permission => (
                  <TableCell key={permission} align="center">
                    <Switch
                      checked={permissions[role as keyof RolePermissions]?.includes(permission) || false}
                      onChange={(e) => handlePermissionChange(role, permission, e.target.checked)}
                      size="small"
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Button variant="contained" onClick={handleSave}>
          Berechtigungen speichern
        </Button>
      </Box>
    </Box>
  );
};

// Versionshistorie-View Komponente
const VersionHistoryView: React.FC = () => {
  const [selectedFormId, setSelectedFormId] = useState<FormID | null>(null);
  const [versionHistory, setVersionHistory] = useState<FormVersionHistory[]>([]);

  useEffect(() => {
    if (selectedFormId) {
      const history = formRegistryService.getVersionHistory(selectedFormId);
      setVersionHistory(history);
    }
  }, [selectedFormId]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Versionshistorie
      </Typography>
      
      {versionHistory.map((version, index) => (
        <Accordion key={version.version}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={2} width="100%">
              <Chip label={version.version} size="small" color="primary" />
              <Typography variant="body2">
                {version.timestamp.toLocaleDateString('de-DE')} - {version.author}
              </Typography>
              <Chip 
                label={version.status} 
                size="small" 
                color={
                  version.status === 'approved' ? 'success' :
                  version.status === 'rejected' ? 'error' : 'warning'
                }
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              {version.changes.map((change, changeIndex) => (
                <ListItem key={changeIndex}>
                  <ListItemText primary={change} />
                </ListItem>
              ))}
            </List>
            {version.approvedBy && (
              <Typography variant="caption" color="textSecondary">
                Genehmigt von: {version.approvedBy}
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default FormRegistryTable; 