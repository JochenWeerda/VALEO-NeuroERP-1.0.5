import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Tooltip,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
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
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Help as HelpIcon,
  Home as HomeIcon,
  ChevronRight as ChevronRightIcon,
  AccountBalance as AccountBalanceIcon,
  LocalShipping as LocalShippingIcon,
  Assignment as AssignmentIcon,
  Build as BuildIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApi } from '../src/contexts/ApiContext';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  id: string;
  title: string;
  icon: React.ReactElement;
  route: string;
  badge?: number;
  children?: NavigationItem[];
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, notifications } = useApi();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);

  // Navigation-Items
  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <DashboardIcon />,
      route: '/dashboard'
    },
    {
      id: 'finance',
      title: 'Finanzwesen',
      icon: <FinanceIcon />,
      route: '/finance',
      children: [
        { id: 'accounting', title: 'Buchhaltung', icon: <AccountBalanceIcon />, route: '/finance/accounting' },
        { id: 'controlling', title: 'Controlling', icon: <AnalyticsIcon />, route: '/finance/controlling' },
        { id: 'payroll', title: 'Lohn & Gehalt', icon: <PeopleIcon />, route: '/finance/payroll' }
      ]
    },
    {
      id: 'sales',
      title: 'Vertrieb',
      icon: <SalesIcon />,
      route: '/sales',
      children: [
        { id: 'customers', title: 'Kundenmanagement', icon: <PeopleIcon />, route: '/sales/customers' },
        { id: 'orders', title: 'Aufträge', icon: <ReceiptIcon />, route: '/sales/orders' },
        { id: 'quotes', title: 'Angebote', icon: <DocumentIcon />, route: '/sales/quotes' }
      ]
    },
    {
      id: 'belege',
      title: 'Belege-Erstellung',
      icon: <ReceiptIcon />,
      route: '/belege',
      children: [
        { id: 'angebote', title: 'Angebote', icon: <DocumentIcon />, route: '/belege?tab=0' },
        { id: 'auftraege', title: 'Aufträge', icon: <AssignmentIcon />, route: '/belege?tab=1' },
        { id: 'bestellungen', title: 'Bestellungen', icon: <SalesIcon />, route: '/belege?tab=2' },
        { id: 'lieferscheine', title: 'Lieferscheine', icon: <LocalShippingIcon />, route: '/belege?tab=3' },
        { id: 'rechnungen', title: 'Rechnungen', icon: <ReceiptIcon />, route: '/belege?tab=4' }
      ]
    },
    {
      id: 'warenwirtschaft',
      title: 'Warenwirtschaft',
      icon: <InventoryIcon />,
      route: '/warenwirtschaft',
      children: [
        { id: 'bestellungen', title: 'Bestellungen', icon: <SalesIcon />, route: '/warenwirtschaft?tab=0' },
        { id: 'wareneingang', title: 'Wareneingang', icon: <LocalShippingIcon />, route: '/warenwirtschaft?tab=1' },
        { id: 'rechnungspruefung', title: 'Rechnungsprüfung', icon: <ReceiptIcon />, route: '/warenwirtschaft?tab=2' },
        { id: 'lagerbuchungen', title: 'Lagerbuchungen', icon: <InventoryIcon />, route: '/warenwirtschaft?tab=3' },
        { id: 'lagerbestand', title: 'Lagerbestand', icon: <InventoryIcon />, route: '/warenwirtschaft?tab=4' }
      ]
    },
    {
      id: 'inventory',
      title: 'Lagerverwaltung',
      icon: <InventoryIcon />,
      route: '/inventory',
      children: [
        { id: 'stock', title: 'Bestand', icon: <InventoryIcon />, route: '/inventory/stock' },
        { id: 'movements', title: 'Bewegungen', icon: <LocalShippingIcon />, route: '/inventory/movements' },
        { id: 'valuation', title: 'Bewertung', icon: <AnalyticsIcon />, route: '/inventory/valuation' }
      ]
    },
    {
      id: 'production',
      title: 'Produktion',
      icon: <ProductionIcon />,
      route: '/production',
      children: [
        { id: 'planning', title: 'Planung', icon: <AssignmentIcon />, route: '/production/planning' },
        { id: 'execution', title: 'Ausführung', icon: <BuildIcon />, route: '/production/execution' },
        { id: 'quality', title: 'Qualität', icon: <AssessmentIcon />, route: '/production/quality' }
      ]
    },
    {
      id: 'warehouse',
      title: 'Lager',
      icon: <WarehouseIcon />,
      route: '/warehouse',
      children: [
        { id: 'locations', title: 'Lagerplätze', icon: <LocalShippingIcon />, route: '/warehouse/locations' },
        { id: 'picking', title: 'Kommissionierung', icon: <InventoryIcon />, route: '/warehouse/picking' },
        { id: 'shipping', title: 'Versand', icon: <LocalShippingIcon />, route: '/warehouse/shipping' }
      ]
    },
    {
      id: 'quality',
      title: 'Qualitätsmanagement',
      icon: <QualityIcon />,
      route: '/quality',
      children: [
        { id: 'inspections', title: 'Prüfungen', icon: <AssessmentIcon />, route: '/quality/inspections' },
        { id: 'certificates', title: 'Zertifikate', icon: <DocumentIcon />, route: '/quality/certificates' },
        { id: 'reports', title: 'Berichte', icon: <AnalyticsIcon />, route: '/quality/reports' }
      ]
    },
    {
      id: 'projects',
      title: 'Projektmanagement',
      icon: <ProjectIcon />,
      route: '/projects',
      children: [
        { id: 'planning', title: 'Projektplanung', icon: <AssignmentIcon />, route: '/projects/planning' },
        { id: 'execution', title: 'Projektausführung', icon: <BuildIcon />, route: '/projects/execution' },
        { id: 'monitoring', title: 'Überwachung', icon: <AnalyticsIcon />, route: '/projects/monitoring' }
      ]
    },
    {
      id: 'hr',
      title: 'Personalwesen',
      icon: <PeopleIcon />,
      route: '/hr',
      children: [
        { id: 'employees', title: 'Mitarbeiter', icon: <PeopleIcon />, route: '/hr/employees' },
        { id: 'attendance', title: 'Zeiterfassung', icon: <AssignmentIcon />, route: '/hr/attendance' },
        { id: 'development', title: 'Entwicklung', icon: <AnalyticsIcon />, route: '/hr/development' }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: <AnalyticsIcon />,
      route: '/analytics'
    },
    {
      id: 'documents',
      title: 'Dokumente',
      icon: <DocumentIcon />,
      route: '/documents'
    }
  ];

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (route: string) => {
    navigate(route);
    setDrawerOpen(false);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleLogout = async () => {
    try {
    await logout();
    navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
    handleUserMenuClose();
  };

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [
      { title: 'Start', path: '/dashboard', icon: <HomeIcon /> }
    ];

    pathSegments.forEach((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      const navItem = navigationItems.find(item => item.route === path);
      if (navItem) {
        breadcrumbs.push({ title: navItem.title, path, icon: navItem.icon });
      }
    });

    return breadcrumbs;
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <Box className="flex h-screen bg-gray-50">
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        className="z-50 bg-white border-b border-gray-200"
        elevation={0}
      >
        <Toolbar className="px-4">
          <IconButton
            color="inherit"
            aria-label="Menü öffnen"
            onClick={handleDrawerToggle}
            className="mr-4 text-gray-700"
          >
            <MenuIcon />
          </IconButton>
          
          <Box className="flex items-center flex-1">
            <BusinessIcon className="mr-2 text-blue-600" />
            <Typography variant="h6" className="font-bold text-gray-800">
            VALEO NeuroERP
          </Typography>
          </Box>

          {/* Breadcrumbs */}
          <Box className="hidden md:flex items-center mr-4">
            <Breadcrumbs 
              separator={<ChevronRightIcon fontSize="small" className="text-gray-400" />}
              className="text-gray-600"
            >
              {getBreadcrumbs().map((breadcrumb, index) => (
                <Link
                  key={index}
                  color={index === getBreadcrumbs().length - 1 ? 'textPrimary' : 'inherit'}
                  href={breadcrumb.path}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(breadcrumb.path);
                  }}
                  className="flex items-center hover:text-blue-600"
                >
                  {breadcrumb.icon}
                  <span className="ml-1">{breadcrumb.title}</span>
                </Link>
              ))}
            </Breadcrumbs>
          </Box>

          {/* Notifications */}
          <Tooltip title="Benachrichtigungen">
            <IconButton
              color="inherit"
              onClick={handleNotificationsOpen}
              className="mr-2 text-gray-700"
            >
              <Badge badgeContent={unreadNotifications} color="error">
              <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
            
          {/* User Menu */}
          <Tooltip title="Benutzermenü">
            <IconButton
              color="inherit"
              onClick={handleUserMenuOpen}
              className="text-gray-700"
            >
              <Avatar className="w-8 h-8 bg-blue-600">
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        className="z-40"
        PaperProps={{
          className: 'w-64 bg-white border-r border-gray-200'
        }}
      >
        <Box className="p-4 border-b border-gray-200">
          <Box className="flex items-center">
            <BusinessIcon className="mr-2 text-blue-600" />
            <Typography variant="h6" className="font-bold text-gray-800">
              VALEO NeuroERP
            </Typography>
          </Box>
          <Typography variant="body2" className="text-gray-600 mt-1">
            {user?.name || 'Benutzer'}
          </Typography>
        </Box>

        <List className="flex-1 overflow-y-auto">
            {navigationItems.map((item) => (
            <React.Fragment key={item.id}>
              <ListItem
                component="button"
                onClick={() => handleNavigation(item.route)}
                className={`${
                  location.pathname === item.route 
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ListItemIcon className={`${
                  location.pathname === item.route ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.title}
                  className="font-medium"
                />
                {item.badge && (
                  <Badge badgeContent={item.badge} color="error" />
                )}
              </ListItem>
              
              {/* Submenu Items */}
              {item.children && location.pathname.startsWith(item.route) && (
                <List component="div" disablePadding>
                  {item.children.map((child) => (
                    <ListItem
                      key={child.id}
                      component="button"
                      onClick={() => handleNavigation(child.route)}
                      className={`pl-8 ${
                        location.pathname === child.route 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <ListItemIcon className={`${
                        location.pathname === child.route ? 'text-blue-600' : 'text-gray-400'
                      }`}>
                        {child.icon}
                      </ListItemIcon>
                      <ListItemText primary={child.title} />
                    </ListItem>
                  ))}
                </List>
              )}
            </React.Fragment>
          ))}
        </List>

        {/* Footer */}
        <Box className="p-4 border-t border-gray-200">
          <List>
            <ListItem component="button" onClick={() => navigate('/settings')}>
              <ListItemIcon className="text-gray-500">
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Einstellungen" />
            </ListItem>
            <ListItem component="button" onClick={() => navigate('/help')}>
              <ListItemIcon className="text-gray-500">
                <HelpIcon />
              </ListItemIcon>
              <ListItemText primary="Hilfe & Support" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box className="flex-1 flex flex-col">
        <Toolbar /> {/* Spacer for AppBar */}
        <Box className="flex-1 overflow-auto">
          {children}
        </Box>
      </Box>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        className="mt-2"
        PaperProps={{
          className: 'min-w-48 shadow-lg border border-gray-200'
        }}
      >
        <Box className="px-4 py-3 border-b border-gray-200">
          <Typography variant="subtitle1" className="font-semibold text-gray-800">
            {user?.name || 'Benutzer'}
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            {user?.email || 'benutzer@valeo.com'}
          </Typography>
        </Box>
        <MenuItem onClick={() => { navigate('/profile'); handleUserMenuClose(); }}>
          <ListItemIcon>
            <AccountCircleIcon />
          </ListItemIcon>
          <ListItemText primary="Profil" />
        </MenuItem>
        <MenuItem onClick={() => { navigate('/settings'); handleUserMenuClose(); }}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Einstellungen" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Abmelden" />
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
        className="mt-2"
        PaperProps={{
          className: 'min-w-80 max-h-96 shadow-lg border border-gray-200'
        }}
      >
        <Box className="px-4 py-3 border-b border-gray-200">
          <Typography variant="subtitle1" className="font-semibold text-gray-800">
            Benachrichtigungen
          </Typography>
        </Box>
        {notifications.length > 0 ? (
          notifications.slice(0, 5).map((notification) => (
            <MenuItem key={notification.id} className="px-4 py-3">
              <Box className="flex-1">
                <Typography variant="body2" className="font-medium text-gray-800">
                  {notification.message}
                </Typography>
                <Typography variant="caption" className="text-gray-500">
                  {new Date().toLocaleString('de-DE')}
                </Typography>
              </Box>
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>
            <Typography variant="body2" className="text-gray-500">
              Keine Benachrichtigungen
            </Typography>
          </MenuItem>
        )}
        {notifications.length > 5 && (
          <Box className="px-4 py-2 border-t border-gray-200">
            <Typography 
              variant="body2" 
              className="text-blue-600 cursor-pointer hover:text-blue-800"
              onClick={() => { navigate('/notifications'); handleNotificationsClose(); }}
            >
              Alle Benachrichtigungen anzeigen
            </Typography>
      </Box>
        )}
      </Menu>
    </Box>
  );
};

export default Layout; 