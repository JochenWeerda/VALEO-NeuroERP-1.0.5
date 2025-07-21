import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  LinearProgress,
  Tooltip,
  Switch,
  FormControlLabel,
  Divider,
  Alert
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  DragIndicator as DragIcon,
  Business as BusinessIcon,
  Inventory as InventoryIcon,
  Receipt as ReceiptIcon,
  Description as DocumentIcon,
  Analytics as AnalyticsIcon,
  People as PeopleIcon,
  ShoppingCart as SalesIcon,
  LocalShipping as WarehouseIcon,
  Build as ProductionIcon,
  AccountBalance as FinanceIcon,
  Assessment as QualityIcon,
  Assignment as ProjectIcon,
  Notifications as NotificationsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  LocalShipping as LocalShippingIcon,
  Build as BuildIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../contexts/ApiContext';
import { DataCard, ProgressCard, AlertMessage, SectionHeader } from '../components/ui/ModernComponents';

// Komponenten-Typen
interface DashboardComponent {
  id: string;
  type: 'metric' | 'progress' | 'chart' | 'list' | 'quick-action' | 'notification' | 'favorite';
  title: string;
  description: string;
  icon: React.ReactElement;
  color: string;
  data?: any;
  size: 'small' | 'medium' | 'large';
  position: number;
  visible: boolean;
  favorite: boolean;
  roleBased: boolean;
  allowedRoles: string[];
}

// Benutzer-Rollen
type UserRole = 'admin' | 'manager' | 'employee' | 'finance' | 'sales' | 'warehouse' | 'production' | 'quality' | 'hr';

// Verfügbare Komponenten
const availableComponents: DashboardComponent[] = [
  // Metriken
  {
    id: 'revenue',
    type: 'metric',
    title: 'Umsatz (Monat)',
    description: 'Aktueller Monatsumsatz',
    icon: <FinanceIcon />,
    color: '#1976d2',
    data: { value: 2847500, unit: '€', change: 12.5, trend: 'up' },
    size: 'medium',
    position: 1,
    visible: true,
    favorite: true,
    roleBased: true,
    allowedRoles: ['admin', 'manager', 'finance']
  },
  {
    id: 'orders',
    type: 'metric',
    title: 'Bestellungen',
    description: 'Anzahl offener Bestellungen',
    icon: <ReceiptIcon />,
    color: '#2e7d32',
    data: { value: 1247, unit: '', change: -2.3, trend: 'down' },
    size: 'small',
    position: 2,
    visible: true,
    favorite: false,
    roleBased: true,
    allowedRoles: ['admin', 'manager', 'sales']
  },
  {
    id: 'inventory',
    type: 'metric',
    title: 'Lagerbestand',
    description: 'Aktueller Lagerbestand',
    icon: <InventoryIcon />,
    color: '#ed6c02',
    data: { value: 8942, unit: 'Stück', change: 5.7, trend: 'up' },
    size: 'small',
    position: 3,
    visible: true,
    favorite: false,
    roleBased: true,
    allowedRoles: ['admin', 'manager', 'warehouse']
  },
  {
    id: 'customers',
    type: 'metric',
    title: 'Aktive Kunden',
    description: 'Anzahl aktiver Kunden',
    icon: <PeopleIcon />,
    color: '#9c27b0',
    data: { value: 342, unit: '', change: 8.1, trend: 'up' },
    size: 'small',
    position: 4,
    visible: true,
    favorite: false,
    roleBased: true,
    allowedRoles: ['admin', 'manager', 'sales']
  },

  // Fortschritts-Komponenten
  {
    id: 'production-progress',
    type: 'progress',
    title: 'Produktionsfortschritt',
    description: 'Aktuelle Produktionsaufträge',
    icon: <ProductionIcon />,
    color: '#7b1fa2',
    data: { progress: 75, current: 15, total: 20 },
    size: 'medium',
    position: 5,
    visible: true,
    favorite: true,
    roleBased: true,
    allowedRoles: ['admin', 'manager', 'production']
  },
  {
    id: 'quality-checks',
    type: 'progress',
    title: 'Qualitätsprüfungen',
    description: 'Offene Qualitätsprüfungen',
    icon: <QualityIcon />,
    color: '#388e3c',
    data: { progress: 60, current: 12, total: 20 },
    size: 'medium',
    position: 6,
    visible: true,
    favorite: false,
    roleBased: true,
    allowedRoles: ['admin', 'manager', 'quality']
  },

  // Schnellaktionen
  {
    id: 'quick-actions',
    type: 'quick-action',
    title: 'Schnellaktionen',
    description: 'Häufig verwendete Aktionen',
    icon: <AddIcon />,
    color: '#f57c00',
    data: {
      actions: [
        { label: 'Neue Bestellung', route: '/sales/orders/new', icon: <ReceiptIcon /> },
        { label: 'Lagerbewegung', route: '/warehouse/movements/new', icon: <LocalShippingIcon /> },
        { label: 'Produktionsauftrag', route: '/production/orders/new', icon: <BuildIcon /> },
        { label: 'Qualitätsprüfung', route: '/quality/inspections/new', icon: <AssessmentIcon /> }
      ]
    },
    size: 'large',
    position: 7,
    visible: true,
    favorite: true,
    roleBased: false,
    allowedRoles: []
  },

  // Benachrichtigungen
  {
    id: 'notifications',
    type: 'notification',
    title: 'Wichtige Benachrichtigungen',
    description: 'Systembenachrichtigungen',
    icon: <NotificationsIcon />,
    color: '#d32f2f',
    data: {
      notifications: [
        { id: 1, type: 'warning', message: 'Lagerbestand Artikel A-123 niedrig', time: '2 Min' },
        { id: 2, type: 'info', message: 'Neue Bestellung #12345 eingegangen', time: '5 Min' },
        { id: 3, type: 'success', message: 'Produktionsauftrag #789 abgeschlossen', time: '12 Min' }
      ]
    },
    size: 'medium',
    position: 8,
    visible: true,
    favorite: false,
    roleBased: false,
    allowedRoles: []
  },

  // Favoriten
  {
    id: 'favorites',
    type: 'favorite',
    title: 'Meine Favoriten',
    description: 'Häufig verwendete Funktionen',
    icon: <StarIcon />,
    color: '#ff9800',
    data: {
      favorites: [
        { label: 'Kundenverwaltung', route: '/crm/customers', icon: <PeopleIcon /> },
        { label: 'Finanzberichte', route: '/finance/reports', icon: <AnalyticsIcon /> },
        { label: 'Lagerbestand', route: '/warehouse/inventory', icon: <InventoryIcon /> },
        { label: 'Dokumente', route: '/documents', icon: <DocumentIcon /> }
      ]
    },
    size: 'large',
    position: 9,
    visible: true,
    favorite: true,
    roleBased: false,
    allowedRoles: []
  }
];

const PersonalizedDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useApi();
  const [components, setComponents] = useState<DashboardComponent[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Benutzerrolle bestimmen (vereinfacht)
  const getUserRole = (): UserRole => {
    if (!user) return 'employee';
    if (user.role === 'admin') return 'admin';
    if (user.role === 'manager') return 'manager';
    if (user.role === 'finance') return 'finance';
    if (user.role === 'sales') return 'sales';
    if (user.role === 'warehouse') return 'warehouse';
    if (user.role === 'production') return 'production';
    if (user.role === 'quality') return 'quality';
    if (user.role === 'hr') return 'hr';
    return 'employee';
  };

  useEffect(() => {
    loadUserDashboard();
  }, [user]);

  const loadUserDashboard = async () => {
    setLoading(true);
    try {
      // Lade gespeicherte Dashboard-Konfiguration
      const savedConfig = localStorage.getItem(`dashboard-config-${user?.id}`);
      let userComponents: DashboardComponent[];

      if (savedConfig) {
        userComponents = JSON.parse(savedConfig);
      } else {
        // Erstelle Standard-Konfiguration basierend auf Rolle
        const userRole = getUserRole();
        userComponents = availableComponents.filter(comp => 
          !comp.roleBased || comp.allowedRoles.includes(userRole)
        ).map((comp, index) => ({
          ...comp,
          position: index + 1,
          visible: true
        }));
      }

      setComponents(userComponents);
    } catch (error) {
      console.error('Fehler beim Laden der Dashboard-Konfiguration:', error);
      setComponents(availableComponents.slice(0, 6)); // Fallback
    } finally {
      setLoading(false);
    }
  };

  const saveDashboardConfig = (newComponents: DashboardComponent[]) => {
    try {
      localStorage.setItem(`dashboard-config-${user?.id}`, JSON.stringify(newComponents));
      setComponents(newComponents);
    } catch (error) {
      console.error('Fehler beim Speichern der Dashboard-Konfiguration:', error);
    }
  };

  const toggleComponentVisibility = (componentId: string) => {
    const updatedComponents = components.map(comp =>
      comp.id === componentId ? { ...comp, visible: !comp.visible } : comp
    );
    saveDashboardConfig(updatedComponents);
  };

  const toggleFavorite = (componentId: string) => {
    const updatedComponents = components.map(comp =>
      comp.id === componentId ? { ...comp, favorite: !comp.favorite } : comp
    );
    saveDashboardConfig(updatedComponents);
  };

  const addComponent = (component: DashboardComponent) => {
    const newComponent = {
      ...component,
      position: components.length + 1,
      visible: true,
      favorite: false
    };
    const updatedComponents = [...components, newComponent];
    saveDashboardConfig(updatedComponents);
  };

  const removeComponent = (componentId: string) => {
    const updatedComponents = components.filter(comp => comp.id !== componentId);
    saveDashboardConfig(updatedComponents);
  };

  const renderComponent = (component: DashboardComponent) => {
    if (!component.visible) return null;

    switch (component.type) {
      case 'metric':
        return (
          <DataCard
            key={component.id}
            title={component.title}
            value={component.data.value}
            subtitle={component.description}
            icon={component.icon}
            color={component.color}
            trend={component.data.trend ? {
              value: component.data.change,
              direction: component.data.trend
            } : undefined}
            onClick={() => navigate(`/${component.id.split('-')[0]}`)}
          />
        );

      case 'progress':
        return (
          <ProgressCard
            key={component.id}
            title={component.title}
            progress={component.data.progress}
            current={component.data.current}
            total={component.data.total}
            color={component.color}
            subtitle={component.description}
          />
        );

      case 'quick-action':
        return (
          <Card key={component.id} className="h-full">
            <CardContent>
              <Box className="flex items-center justify-between mb-4">
                <Box className="flex items-center">
                  <Avatar sx={{ bgcolor: component.color, mr: 2 }}>
                    {component.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" className="font-semibold">
                      {component.title}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      {component.description}
                    </Typography>
                  </Box>
                </Box>
                <Box className="flex items-center space-x-1">
                  <Tooltip title="Favorit">
                    <IconButton
                      size="small"
                      onClick={() => toggleFavorite(component.id)}
                      color={component.favorite ? 'primary' : 'default'}
                    >
                      <FavoriteIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Ausblenden">
                    <IconButton
                      size="small"
                      onClick={() => toggleComponentVisibility(component.id)}
                    >
                      <VisibilityOffIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Box className="grid grid-cols-2 gap-2">
                {component.data.actions.map((action: any, index: number) => (
                  <Button
                    key={index}
                    fullWidth
                    variant="outlined"
                    startIcon={action.icon}
                    onClick={() => navigate(action.route)}
                    className="h-12"
                  >
                    {action.label}
                  </Button>
                ))}
              </Box>
            </CardContent>
          </Card>
        );

      case 'notification':
        return (
          <Card key={component.id} className="h-full">
            <CardContent>
              <Box className="flex items-center justify-between mb-4">
                <Box className="flex items-center">
                  <Avatar sx={{ bgcolor: component.color, mr: 2 }}>
                    {component.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" className="font-semibold">
                      {component.title}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      {component.description}
                    </Typography>
                  </Box>
                </Box>
                <Box className="flex items-center space-x-1">
                  <Tooltip title="Favorit">
                    <IconButton
                      size="small"
                      onClick={() => toggleFavorite(component.id)}
                      color={component.favorite ? 'primary' : 'default'}
                    >
                      <FavoriteIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Ausblenden">
                    <IconButton
                      size="small"
                      onClick={() => toggleComponentVisibility(component.id)}
                    >
                      <VisibilityOffIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Box className="space-y-2">
                {component.data.notifications.map((notification: any) => (
                  <Alert
                    key={notification.id}
                    severity={notification.type}
                    className="text-sm"
                    action={
                      <Typography variant="caption" className="text-gray-500">
                        {notification.time}
                      </Typography>
                    }
                  >
                    {notification.message}
                  </Alert>
                ))}
              </Box>
            </CardContent>
          </Card>
        );

      case 'favorite':
        return (
          <Card key={component.id} className="h-full">
            <CardContent>
              <Box className="flex items-center justify-between mb-4">
                <Box className="flex items-center">
                  <Avatar sx={{ bgcolor: component.color, mr: 2 }}>
                    {component.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" className="font-semibold">
                      {component.title}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      {component.description}
                    </Typography>
                  </Box>
                </Box>
                <Box className="flex items-center space-x-1">
                  <Tooltip title="Favorit">
                    <IconButton
                      size="small"
                      onClick={() => toggleFavorite(component.id)}
                      color={component.favorite ? 'primary' : 'default'}
                    >
                      <FavoriteIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Ausblenden">
                    <IconButton
                      size="small"
                      onClick={() => toggleComponentVisibility(component.id)}
                    >
                      <VisibilityOffIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Box className="grid grid-cols-2 gap-2">
                {component.data.favorites.map((favorite: any, index: number) => (
                  <Button
                    key={index}
                    fullWidth
                    variant="outlined"
                    startIcon={favorite.icon}
                    onClick={() => navigate(favorite.route)}
                    className="h-12"
                  >
                    {favorite.label}
                  </Button>
                ))}
              </Box>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  const getGridSize = (size: string) => {
    switch (size) {
      case 'small': return 'md:w-1/4';
      case 'medium': return 'md:w-1/2';
      case 'large': return 'md:w-full';
      default: return 'md:w-1/2';
    }
  };

  if (loading) {
    return (
      <Box className="flex items-center justify-center h-64">
        <LinearProgress className="w-32" />
      </Box>
    );
  }

  return (
    <Box className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <SectionHeader
        title={`Willkommen zurück, ${user?.full_name || 'Benutzer'}!`}
        subtitle="Ihr personalisiertes VALEO NeuroERP Dashboard"
        actions={
          <Box className="flex items-center space-x-2">
            <Chip
              icon={<BusinessIcon />}
              label={getUserRole().toUpperCase()}
              color="primary"
              variant="outlined"
            />
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={() => setSettingsOpen(true)}
            >
              Dashboard anpassen
            </Button>
          </Box>
        }
      />

      {/* Dashboard Grid */}
      <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {components
          .filter(comp => comp.visible)
          .sort((a, b) => a.position - b.position)
          .map(component => (
            <Box key={component.id} className={`w-full ${getGridSize(component.size)}`}>
              {renderComponent(component)}
            </Box>
          ))}
      </Box>

      {/* Einstellungen Dialog */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Dashboard anpassen
        </DialogTitle>
        <DialogContent>
          <Box className="space-y-4">
            <Typography variant="h6" className="font-semibold">
              Verfügbare Komponenten
            </Typography>
            
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableComponents.map(component => {
                const isVisible = components.some(c => c.id === component.id && c.visible);
                const isAdded = components.some(c => c.id === component.id);
                
                return (
                  <Card key={component.id} variant="outlined">
                    <CardContent>
                      <Box className="flex items-center justify-between">
                        <Box className="flex items-center">
                          <Avatar sx={{ bgcolor: component.color, mr: 2, width: 32, height: 32 }}>
                            {component.icon}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" className="font-semibold">
                              {component.title}
                            </Typography>
                            <Typography variant="caption" className="text-gray-600">
                              {component.description}
                            </Typography>
                          </Box>
                        </Box>
                        <Box className="flex items-center space-x-1">
                          {component.roleBased && (
                            <Chip
                              label="Rollenbasiert"
                              size="small"
                              variant="outlined"
                              color="primary"
                            />
                          )}
                          {isAdded ? (
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<RemoveIcon />}
                              onClick={() => removeComponent(component.id)}
                            >
                              Entfernen
                            </Button>
                          ) : (
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<AddIcon />}
                              onClick={() => addComponent(component)}
                            >
                              Hinzufügen
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>

            <Divider />

            <Typography variant="h6" className="font-semibold">
              Aktuelle Komponenten
            </Typography>
            
            <Box className="space-y-2">
              {components.map(component => (
                <Box key={component.id} className="flex items-center justify-between p-3 border rounded">
                  <Box className="flex items-center">
                    <DragIcon className="mr-2 text-gray-400" />
                    <Avatar sx={{ bgcolor: component.color, mr: 2, width: 24, height: 24 }}>
                      {component.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" className="font-medium">
                        {component.title}
                      </Typography>
                      <Typography variant="caption" className="text-gray-600">
                        {component.description}
                      </Typography>
                    </Box>
                  </Box>
                  <Box className="flex items-center space-x-2">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={component.visible}
                          onChange={() => toggleComponentVisibility(component.id)}
                          size="small"
                        />
                      }
                      label="Sichtbar"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={component.favorite}
                          onChange={() => toggleFavorite(component.id)}
                          size="small"
                        />
                      }
                      label="Favorit"
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>
            Schließen
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              // Reset auf Standard-Konfiguration
              const userRole = getUserRole();
              const defaultComponents = availableComponents
                .filter(comp => !comp.roleBased || comp.allowedRoles.includes(userRole))
                .map((comp, index) => ({
                  ...comp,
                  position: index + 1,
                  visible: true,
                  favorite: false
                }));
              saveDashboardConfig(defaultComponents);
              setSettingsOpen(false);
            }}
          >
            Zurücksetzen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PersonalizedDashboard; 