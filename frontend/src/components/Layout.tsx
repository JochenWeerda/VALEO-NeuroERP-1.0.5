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
// ✅ NEU: Import der standardisierten UI-Komponenten
import { UI_LABELS } from './ui/UIStandardization';
import { useApi } from '../contexts/ApiContext';

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
      title: UI_LABELS.NAVIGATION.DASHBOARD,
      icon: <DashboardIcon />,
      route: '/dashboard'
    },
    {
      id: 'finance',
      title: UI_LABELS.NAVIGATION.FINANCE,
      icon: <FinanceIcon />,
      route: '/finance',
      children: [
        { id: 'accounting', title: 'Buchhaltung', icon: <AccountBalanceIcon />, route: '/finance/accounting' },
        { id: 'controlling', title: 'Controlling', icon: <AnalyticsIcon />, route: '/finance/controlling' },
        { id: 'payroll', title: UI_LABELS.NAVIGATION.PAYROLL, icon: <PeopleIcon />, route: '/finance/payroll' }
      ]
    },
    {
      id: 'sales',
      title: UI_LABELS.NAVIGATION.SALES,
      icon: <SalesIcon />,
      route: '/sales',
      children: [
        { id: 'customers', title: UI_LABELS.NAVIGATION.CUSTOMERS, icon: <PeopleIcon />, route: '/sales/customers' },
        { id: 'orders', title: UI_LABELS.NAVIGATION.ORDERS, icon: <ReceiptIcon />, route: '/sales/orders' },
        { id: 'invoices', title: UI_LABELS.NAVIGATION.INVOICES, icon: <DocumentIcon />, route: '/sales/invoices' }
      ]
    },
    {
      id: 'inventory',
      title: UI_LABELS.NAVIGATION.INVENTORY,
      icon: <InventoryIcon />,
      route: '/inventory',
      children: [
        { id: 'stock', title: UI_LABELS.NAVIGATION.STOCK, icon: <WarehouseIcon />, route: '/inventory/stock' },
        { id: 'movements', title: UI_LABELS.NAVIGATION.MOVEMENTS, icon: <LocalShippingIcon />, route: '/inventory/movements' }
      ]
    },
    {
      id: 'production',
      title: UI_LABELS.NAVIGATION.PRODUCTION,
      icon: <ProductionIcon />,
      route: '/production',
      children: [
        { id: 'orders', title: UI_LABELS.NAVIGATION.PRODUCTION_ORDERS, icon: <AssignmentIcon />, route: '/production/orders' },
        { id: 'planning', title: UI_LABELS.NAVIGATION.PLANNING, icon: <BuildIcon />, route: '/production/planning' }
      ]
    },
    {
      id: 'quality',
      title: UI_LABELS.NAVIGATION.QUALITY,
      icon: <QualityIcon />,
      route: '/quality',
      children: [
        { id: 'inspections', title: UI_LABELS.NAVIGATION.INSPECTIONS, icon: <AssessmentIcon />, route: '/quality/inspections' },
        { id: 'reports', title: UI_LABELS.NAVIGATION.REPORTS, icon: <AnalyticsIcon />, route: '/quality/reports' }
      ]
    },
    {
      id: 'projects',
      title: UI_LABELS.NAVIGATION.PROJECTS,
      icon: <ProjectIcon />,
      route: '/projects'
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
      console.error('Logout failed:', error);
    }
    handleUserMenuClose();
  };

  const getBreadcrumbs = () => {
    const breadcrumbs: { title: string; path: string; icon: React.ReactElement }[] = [];
    const pathSegments = location.pathname.split('/').filter(Boolean);

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
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'grey.50' }}>
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: 50, 
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          boxShadow: 0
        }}
      >
        <Toolbar sx={{ px: 2 }}>
          <IconButton
            color="inherit"
            aria-label={UI_LABELS.NAVIGATION.OPEN_MENU}
            onClick={handleDrawerToggle}
            sx={{ mr: 2, color: 'text.primary' }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box display="flex" alignItems="center" flex={1}>
            <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              {UI_LABELS.APP.TITLE}
            </Typography>
          </Box>

          {/* Breadcrumbs */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', mr: 2 }}>
            <Breadcrumbs 
              separator={<ChevronRightIcon fontSize="small" sx={{ color: 'text.secondary' }} />}
              sx={{ color: 'text.secondary' }}
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
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    '&:hover': { color: 'primary.main' }
                  }}
                >
                  {breadcrumb.icon}
                  <Box component="span" sx={{ ml: 0.5 }}>{breadcrumb.title}</Box>
                </Link>
              ))}
            </Breadcrumbs>
          </Box>

          {/* Notifications */}
          <Tooltip title={UI_LABELS.NOTIFICATIONS.TITLE}>
            <IconButton
              color="inherit"
              onClick={handleNotificationsOpen}
              sx={{ mr: 1, color: 'text.primary' }}
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
              sx={{ color: 'text.primary' }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
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
        sx={{ zIndex: 40 }}
        PaperProps={{
          sx: { 
            width: 256, 
            bgcolor: 'background.paper',
            borderRight: 1,
            borderColor: 'divider'
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box display="flex" alignItems="center">
            <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              VALEO NeuroERP
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {user?.name || 'Benutzer'}
          </Typography>
        </Box>

        <List sx={{ flex: 1, overflowY: 'auto' }}>
          {navigationItems.map((item) => (
            <React.Fragment key={item.id}>
              <ListItem
                component="button"
                onClick={() => handleNavigation(item.route)}
                sx={{
                  backgroundColor: location.pathname === item.route ? 'primary.50' : 'transparent',
                  color: location.pathname === item.route ? 'primary.main' : 'text.primary',
                  borderRight: location.pathname === item.route ? 2 : 0,
                  borderColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: location.pathname === item.route ? 'primary.50' : 'action.hover'
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  color: location.pathname === item.route ? 'primary.main' : 'text.secondary'
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.title}
                  sx={{ fontWeight: 'medium' }}
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
                      sx={{
                        pl: 4,
                        backgroundColor: location.pathname === child.route ? 'primary.50' : 'transparent',
                        color: location.pathname === child.route ? 'primary.main' : 'text.secondary',
                        '&:hover': {
                          backgroundColor: location.pathname === child.route ? 'primary.50' : 'action.hover'
                        }
                      }}
                    >
                      <ListItemIcon sx={{ 
                        color: location.pathname === child.route ? 'primary.main' : 'text.disabled'
                      }}>
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
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <List>
            <ListItem component="button" onClick={() => navigate('/settings')}>
              <ListItemIcon sx={{ color: 'text.secondary' }}>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary={UI_LABELS.NAVIGATION.SETTINGS} />
            </ListItem>
            <ListItem component="button" onClick={() => navigate('/help')}>
              <ListItemIcon sx={{ color: 'text.secondary' }}>
                <HelpIcon />
              </ListItemIcon>
              <ListItemText primary={UI_LABELS.NAVIGATION.HELP} />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Toolbar /> {/* Spacer for AppBar */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {children}
        </Box>
      </Box>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        sx={{ mt: 1 }}
        PaperProps={{
          sx: { 
            minWidth: 192, 
            boxShadow: 3,
            border: 1,
            borderColor: 'divider'
          }
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'semibold', color: 'text.primary' }}>
            {user?.name || 'Benutzer'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
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
        sx={{ mt: 1 }}
        PaperProps={{
          sx: { 
            minWidth: 320, 
            maxHeight: 384, 
            boxShadow: 3,
            border: 1,
            borderColor: 'divider'
          }
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'semibold', color: 'text.primary' }}>
            Benachrichtigungen
          </Typography>
        </Box>
        {notifications.length > 0 ? (
          notifications.slice(0, 5).map((notification) => (
            <MenuItem key={notification.id} sx={{ px: 2, py: 1.5 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.primary' }}>
                  {notification.message}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {new Date().toLocaleString('de-DE')}
                </Typography>
              </Box>
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Keine Benachrichtigungen
            </Typography>
          </MenuItem>
        )}
        {notifications.length > 5 && (
          <Box sx={{ px: 2, py: 1, borderTop: 1, borderColor: 'divider' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'primary.main', 
                cursor: 'pointer',
                '&:hover': { color: 'primary.dark' }
              }}
              onClick={() => { navigate('/notifications'); handleNotificationsClose(); }}
            >
              Alle anzeigen
            </Typography>
          </Box>
        )}
      </Menu>
    </Box>
  );
};

export default Layout; 