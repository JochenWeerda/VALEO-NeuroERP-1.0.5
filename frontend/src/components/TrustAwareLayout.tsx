import React, { useState } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem } from '@mui/material';
import { 
  Menu as MenuIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
// ✅ NEU: Import der standardisierten UI-Komponenten
import { UI_LABELS } from './ui/UIStandardization';
import { Sidebar } from './Sidebar';
import { NotificationDropdown } from './NotificationDropdown';
import type { ModuleItem, Module } from './Sidebar';
import type { Notification } from '../lib/schemas';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  lastLogin: Date;
  trustLevel: 'fact' | 'assumption' | 'uncertain';
  confidence: number;
  permissions: string[];
}

interface TrustAwareLayoutProps {
  children: React.ReactNode;
  modules: ModuleItem[];
  activeModule: Module;
  onModuleChange: (module: Module) => void;
  notifications: Notification[];
  user: User;
  onNotificationClick: (notification: Notification) => void;
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsAsRead: () => void;
  onProfileClick: () => void;
  onSettingsClick: () => void;
  onLogout: () => void;
}

export const TrustAwareLayout: React.FC<TrustAwareLayoutProps> = ({
  children,
  modules,
  activeModule,
  onModuleChange,
  notifications,
  user,
  onNotificationClick,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onProfileClick,
  onSettingsClick,
  onLogout
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar
        activeModule={activeModule}
        onModuleChange={onModuleChange}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setCollapsed(!collapsed)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>

            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {modules.find(m => m.id === activeModule)?.title}
            </Typography>

            {/* Notifications */}
            <NotificationDropdown
              notifications={notifications}
              onMarkAsRead={onMarkNotificationAsRead}
              onMarkAllAsRead={onMarkAllNotificationsAsRead}
              onNotificationClick={onNotificationClick}
            />

            {/* User Menu */}
            <IconButton
              color="inherit"
              onClick={handleUserMenuClick}
              sx={{ ml: 1 }}
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <AccountCircleIcon />
                )}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={handleUserMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={() => { onProfileClick(); handleUserMenuClose(); }}>
                <AccountCircleIcon sx={{ mr: 1 }} />
                {UI_LABELS.NAVIGATION.PROFILE}
              </MenuItem>
              <MenuItem onClick={() => { onSettingsClick(); handleUserMenuClose(); }}>
                <SettingsIcon sx={{ mr: 1 }} />
                {UI_LABELS.NAVIGATION.SETTINGS}
              </MenuItem>
              <MenuItem onClick={() => { onLogout(); handleUserMenuClose(); }}>
                <LogoutIcon sx={{ mr: 1 }} />
                {UI_LABELS.ACTIONS.LOGOUT}
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}; 