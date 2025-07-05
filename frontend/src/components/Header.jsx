import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Box,
  useTheme as useMuiTheme,
  Badge,
  Button,
  Tooltip,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DarkModeIcon from '@mui/icons-material/Brightness4';
import LightModeIcon from '@mui/icons-material/Brightness7';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTheme } from '../themes/ThemeProvider';

/**
 * Header-Komponente im Odoo-Stil mit Zurück-Button
 */
const Header = () => {
  const muiTheme = useMuiTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const { mode, toggleTheme } = useTheme();
  
  // Überprüfen, ob wir uns auf einer Unterseite befinden
  const isSubPage = location.pathname !== '/' && 
                    location.pathname !== '/apps' && 
                    location.pathname !== '/dashboard' && 
                    location.pathname !== '/erp-dashboard' &&
                    location.pathname !== '/landhandel';
  
  // Zurück zur übergeordneten Seite
  const handleBackClick = () => {
    // Bei Kundendetails zurück zur Kundenliste
    if (location.pathname.includes('/kunden/')) {
      navigate('/kunden');
    } 
    // Bei CPD-Kontendetails zurück zur Kontenliste
    else if (location.pathname.includes('/cpd-konten/')) {
      navigate('/cpd-konten');
    } 
    // Standardfall: Zurück zur App-Übersicht
    else {
      navigate('/apps');
    }
  };
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsMenuOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationsAnchorEl(null);
  };

  const handleToggleDarkMode = () => {
    toggleTheme();
  };

  const notificationsMenuId = 'notifications-menu';
  const renderNotificationsMenu = (
    <Menu
      anchorEl={notificationsAnchorEl}
      id={notificationsMenuId}
      keepMounted
      open={Boolean(notificationsAnchorEl)}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>Keine neuen Benachrichtigungen</MenuItem>
    </Menu>
  );

  const profileMenuId = 'primary-search-account-menu';
  const renderProfileMenu = (
    <Menu
      anchorEl={anchorEl}
      id={profileMenuId}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>Profil</MenuItem>
      <MenuItem onClick={handleMenuClose}>Mein Konto</MenuItem>
      <MenuItem onClick={handleMenuClose}>Abmelden</MenuItem>
    </Menu>
  );

  const isDarkMode = mode === 'dark';

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'background.paper',
        color: 'text.primary',
        boxShadow: 1,
      }}
    >
      <Toolbar>
        {isSubPage && (
          <Tooltip title="Zurück">
            <IconButton
              color="primary"
              onClick={handleBackClick}
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
        )}
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Box sx={{ display: 'flex' }}>
          <IconButton color="inherit" onClick={handleToggleDarkMode}>
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          
          <IconButton
            aria-label="notifications"
            aria-controls={notificationsMenuId}
            aria-haspopup="true"
            onClick={handleNotificationsMenuOpen}
            color="inherit"
          >
            <Badge badgeContent={0} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <IconButton
            edge="end"
            aria-label="account of current user"
            aria-controls={profileMenuId}
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <AccountCircleIcon />
          </IconButton>
        </Box>
      </Toolbar>
      {renderProfileMenu}
      {renderNotificationsMenu}
    </AppBar>
  );
};

export default Header; 