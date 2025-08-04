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
      label: 'Dashboard',
      icon: DashboardIcon,
      priority: 'high'
    },
    {
      path: '/ai-dashboard',
      label: 'AI Dashboard',
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
      label: 'Benutzer',
      icon: PeopleIcon,
      priority: 'medium'
    },
    {
      path: '/inventory',
      label: 'Inventar',
      icon: InventoryIcon,
      priority: 'medium'
    },
    {
      path: '/pos',
      label: 'POS',
      icon: ShoppingCartIcon,
      priority: 'high'
    },
    {
      path: '/reports',
      label: 'Berichte',
      icon: AssessmentIcon,
      priority: 'low'
    },
    {
      path: '/settings',
      label: 'Einstellungen',
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
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
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
            aria-label="open drawer"
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
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 250,
            marginTop: '64px' // AppBar height
          },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
        PaperProps={{
          sx: { width: 320, maxHeight: 400 }
        }}
      >
        <MenuItem onClick={handleNotificationsClose}>
          <Typography variant="body2">
            Neuer Benutzer registriert
          </Typography>
        </MenuItem>
        <MenuItem onClick={handleNotificationsClose}>
          <Typography variant="body2">
            Inventar-Update verfügbar
          </Typography>
        </MenuItem>
        <MenuItem onClick={handleNotificationsClose}>
          <Typography variant="body2">
            System-Backup abgeschlossen
          </Typography>
        </MenuItem>
      </Menu>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { width: 200 }
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
                     <Typography variant="body2">
             {user?.username || 'Benutzer'}
           </Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">
            Abmelden
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

// Wrapper-Komponente für Router-Kontext
export const Navigation: React.FC = () => {
  return <NavigationContent />;
};

// Preload-Status Indicator (nur in Entwicklung)
export const PreloadIndicator: React.FC = () => {
  const [preloadStatus, setPreloadStatus] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const updateStatus = () => {
      setPreloadStatus(preloadService.getPreloadStatus());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 2000);

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') return null;

  const loadedCount = Object.values(preloadStatus).filter(Boolean).length;
  const totalCount = Object.keys(preloadStatus).length;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        bgcolor: 'rgba(0,0,0,0.8)',
        color: 'white',
        p: 1,
        borderRadius: 1,
        fontSize: '0.75rem',
        zIndex: 9999
      }}
    >
      🔄 {loadedCount}/{totalCount} Routen preloaded
    </Box>
  );
}; 