import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  useTheme,
  useMediaQuery,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  AutoAwesome as AutoAwesomeIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
// ✅ NEU: Import der standardisierten UI-Komponenten
import { UI_LABELS } from './ui/UIStandardization';
import { useAuth } from '../contexts/AuthContext';
import { preloadService } from '../services/PreloadService';

// Navigation-Komponente ohne Router-Hooks
const NavigationContent: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);

  const navigationItems = [
    {
      path: '/dashboard',
      label: UI_LABELS.NAVIGATION.DASHBOARD,
      icon: DashboardIcon,
      priority: 'high'
    },
    {
      path: '/ai-dashboard',
      label: 'KI-Dashboard',
      icon: AutoAwesomeIcon,
      priority: 'high'
    },
    {
      path: '/dokumente',
      label: 'Dokumente',
      icon: DescriptionIcon,
      priority: 'high'
    },
    {
      path: '/users',
      label: UI_LABELS.NAVIGATION.USERS,
      icon: PeopleIcon,
      priority: 'medium'
    },
    {
      path: '/inventory',
      label: UI_LABELS.NAVIGATION.INVENTORY,
      icon: InventoryIcon,
      priority: 'medium'
    },
    {
      path: '/pos',
      label: 'POS-System',
      icon: ShoppingCartIcon,
      priority: 'high'
    },
    {
      path: '/reports',
      label: UI_LABELS.NAVIGATION.REPORTS,
      icon: AssessmentIcon,
      priority: 'low'
    },
    {
      path: '/settings',
      label: UI_LABELS.NAVIGATION.SETTINGS,
      icon: SettingsIcon,
      priority: 'low'
    }
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const handlePreload = (path: string) => {
    preloadService.preloadRoute(path);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" color="primary">
          VALEO NeuroERP
        </Typography>
      </Box>
      <List>
        {navigationItems.map((item) => (
          <ListItem
            key={item.path}
            button
            selected={isActive(item.path)}
            onClick={() => handleNavigation(item.path)}
            onMouseEnter={() => handlePreload(item.path)}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
              },
            }}
          >
            <ListItemIcon>
              <item.icon color={isActive(item.path) ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              primaryTypographyProps={{
                color: isActive(item.path) ? 'primary' : 'inherit',
                fontWeight: isActive(item.path) ? 'bold' : 'normal',
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="Menü öffnen"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            VALEO NeuroERP
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Notifications */}
            <IconButton
              color="inherit"
              onClick={handleNotificationsOpen}
              sx={{ ml: 1 }}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* User Menu */}
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
              sx={{ ml: 1 }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user?.username?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
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
            {user?.username || 'Benutzer'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {user?.email || 'benutzer@valeo.com'}
          </Typography>
        </Box>
        <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
          <ListItemIcon>
            <AccountCircleIcon />
          </ListItemIcon>
          <ListItemText primary="Profil" />
        </MenuItem>
        <MenuItem onClick={() => { navigate('/settings'); handleMenuClose(); }}>
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
        <MenuItem disabled>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Keine Benachrichtigungen
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export const Navigation: React.FC = () => {
  return <NavigationContent />;
};

export const PreloadIndicator: React.FC = () => {
  const [status, setStatus] = useState<string>('');

  const updateStatus = () => {
    const currentStatus = preloadService.getStatus();
    setStatus(currentStatus);
  };

  useEffect(() => {
    const interval = setInterval(updateStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  return status ? (
    <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {status}
      </Typography>
    </Box>
  ) : null;
}; 