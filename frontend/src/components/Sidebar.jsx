import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  useTheme as useMuiTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Settings as SettingsIcon,
  SmartToy as AIIcon,
  Store as StoreIcon,
  Apps as AppsIcon,
  FilterAlt as FilterAltIcon,
} from '@mui/icons-material';
import { useTheme } from '../themes/ThemeProvider';
import { Link, useLocation } from 'react-router-dom';

/**
 * Sidebar-Komponente im Odoo-Stil
 */
const Sidebar = ({ open, onToggle }) => {
  const location = useLocation();
  
  const { mode } = useTheme();
  const muiTheme = useMuiTheme();
  
  // Theme-spezifische Anpassungen für die Sidebar
  const isDarkMode = mode === 'dark';
  const customBgColor = isDarkMode ? '#2c2c2c' : '#f5f5f5';
  
  // Standard-Padding für Sidebar-Elemente
  const itemPadding = '8px 16px';

  // Menüeinträge mit Icons
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/erp-dashboard' },
    { text: 'Kunden', icon: <PeopleIcon />, path: '/kunden' },
    { text: 'Chargenverwaltung', icon: <InventoryIcon />, path: '/chargen' },
    { text: 'QS-Futtermittel', icon: <FilterAltIcon />, path: '/qs-futtermittel' },
    { text: 'CPD-Konten', icon: <StoreIcon />, path: '/cpd-konten' },
    { text: 'Apps', icon: <AppsIcon />, path: '/apps' },
    { text: 'Einstellungen', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Systemstatus', icon: <AIIcon />, path: '/health-connectors' },
  ];

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          bgcolor: customBgColor,
        },
      }}
    >
      <Box sx={{ pt: 6, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          AI-Driven ERP
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            component={Link}
            to={item.path}
            key={item.text}
            selected={location.pathname === item.path}
            sx={{
              padding: itemPadding,
              '&.Mui-selected': {
                bgcolor: 'action.selected',
                borderLeft: '4px solid',
                borderColor: 'primary.main',
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                },
              },
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: 'text.secondary',
                minWidth: 40,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              sx={{
                '& .MuiTypography-root': {
                  fontSize: '0.9rem',
                },
              }}
            />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar; 