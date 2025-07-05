import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  MenuOpen as MenuOpenIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useThemeSystem } from '../themes/ThemeProvider';

import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './notification/NotificationBell';

// Header-Komponenten-Props
interface HeaderProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

// Header-Komponente mit Navigationsleiste, Toolbar-Optionen und Profilmenü
const Header: React.FC<HeaderProps> = ({ toggleSidebar, sidebarOpen }) => {
  const theme = useTheme();
  const { toggleColorMode } = useThemeSystem();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Handler für Profilmenü öffnen
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // Handler für Profilmenü schließen
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handler für Abmelden
  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/login');
  };

  return (
    <AppBar 
      position="fixed" 
      color="primary"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        transition: 'width 0.25s',
        width: '100%',
      }}
    >
      <Toolbar
        sx={{
          pr: 2,
        }}
      >
        <IconButton
          edge="start"
          color="inherit"
          aria-label="toggle sidebar"
          onClick={toggleSidebar}
          sx={{
            marginRight: 3,
          }}
        >
          {sidebarOpen ? <MenuOpenIcon /> : <MenuIcon />}
        </IconButton>
        
        <Typography
          component="h1"
          variant="h6"
          color="inherit"
          noWrap
          sx={{ flexGrow: 1 }}
        >
          ERP für Futtermittelherstellung
        </Typography>
        
        {/* Benachrichtigungsglocke einbinden */}
        <NotificationBell />
        
        <IconButton color="inherit" onClick={toggleColorMode}>
          {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
        
        <IconButton
          color="inherit"
          aria-label="account"
          onClick={handleMenuOpen}
        >
          <AccountCircleIcon />
        </IconButton>
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
        >
          <MenuItem onClick={() => navigate('/profile')}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Profil</ListItemText>
          </MenuItem>
          
          <MenuItem onClick={() => navigate('/settings')}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Einstellungen</ListItemText>
          </MenuItem>
          
          <MenuItem onClick={() => navigate('/notifications')}>
            <ListItemIcon>
              <NotificationsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Benachrichtigungen</ListItemText>
          </MenuItem>
          
          <Divider />
          
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Abmelden</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 