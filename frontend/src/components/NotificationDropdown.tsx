import React, { useState } from 'react';
import type { Notification } from '../lib/schemas';
import { 
  Badge, 
  IconButton, 
  Menu, 
  MenuItem, 
  Typography, 
  Box,
  Chip,
  Divider
} from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
// ✅ NEU: Import der standardisierten UI-Komponenten
import { StatusChip } from './ui/UIStandardization';
import { UI_LABELS } from './ui/UIStandardization';
import { TrustIndicator } from './TrustIndicator';

interface NotificationDropdownProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNotificationClick: (notification: Notification) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'ai' | 'system' | 'business'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    onNotificationClick(notification);
    handleClose();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon sx={{ color: 'success.main' }} />;
      case 'info':
        return <InfoIcon sx={{ color: 'info.main' }} />;
      case 'warning':
        return <WarningIcon sx={{ color: 'warning.main' }} />;
      case 'error':
        return <ErrorIcon sx={{ color: 'error.main' }} />;
      default:
        return <InfoIcon sx={{ color: 'text.secondary' }} />;
    }
  };

  // ✅ REFAKTORIERT: Verwendung von StatusChip für Priority-Anzeige
  const getPriorityStatus = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'error' as const;
      case 'high':
        return 'warning' as const;
      case 'medium':
        return 'info' as const;
      case 'low':
        return 'default' as const;
      default:
        return 'default' as const;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !notification.read;
    if (activeFilter === 'ai') return notification.source === 'ai';
    if (activeFilter === 'system') return notification.source === 'system';
    if (activeFilter === 'business') return notification.source === 'business';
    return true;
  });

  return (
    <Box>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ position: 'relative' }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 384, maxHeight: 384 }
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="h6">Benachrichtigungen</Typography>
            {unreadCount > 0 && (
              <Chip
                label={`${unreadCount} Ungelesen`}
                size="small"
                color="primary"
              />
            )}
          </Box>
          
          {/* Filter Buttons */}
          <Box display="flex" gap={0.5}>
            {(['all', 'unread', 'ai', 'system', 'business'] as const).map(filter => (
              <Chip
                key={filter}
                label={filter === 'all' ? 'Alle' : 
                       filter === 'unread' ? 'Ungelesen' :
                       filter === 'ai' ? 'KI' :
                       filter === 'system' ? 'System' : 
                       'Geschäft'}
                size="small"
                variant={activeFilter === filter ? 'filled' : 'outlined'}
                onClick={() => setActiveFilter(filter)}
                sx={{ fontSize: '0.75rem' }}
              />
            ))}
          </Box>
        </Box>

        {/* Notifications List */}
        <Box sx={{ maxHeight: 256, overflowY: 'auto' }}>
          {filteredNotifications.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="body2">
                Keine Benachrichtigungen
              </Typography>
            </Box>
          ) : (
            filteredNotifications.map((notification, index) => (
              <Box key={notification.id}>
                <MenuItem
                  onClick={() => handleNotificationClick(notification)}
                  sx={{ 
                    p: 1.5, 
                    backgroundColor: !notification.read ? 'action.hover' : 'transparent'
                  }}
                >
                  <Box display="flex" alignItems="flex-start" gap={1.5} width="100%">
                    <Box flexShrink={0} mt={0.5}>
                      {getNotificationIcon(notification.type)}
                    </Box>
                    
                    <Box flex={1} minWidth={0}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                        <Typography variant="subtitle2" fontWeight="medium">
                          {notification.title}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          {notification.source && (
                            <Chip
                              label={notification.source}
                              size="small"
                              sx={{ fontSize: '0.75rem' }}
                            />
                          )}
                          <Chip
                            label={notification.priority}
                            size="small"
                            color={getPriorityStatus(notification.priority) as 'success' | 'warning' | 'error' | 'info'}
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        {notification.message}
                      </Typography>
                      
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">
                          {notification.timestamp.toLocaleString('de-DE')}
                        </Typography>
                        
                        <Box display="flex" alignItems="center" gap={1}>
                          <TrustIndicator
                            level="high"
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </MenuItem>
                {index < filteredNotifications.length - 1 && <Divider />}
              </Box>
            ))
          )}
        </Box>

        {/* Footer */}
        {unreadCount > 0 && (
          <Box sx={{ p: 1.5, borderTop: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                {unreadCount} Ungelesen
              </Typography>
              <Chip
                label="Alle als gelesen markieren"
                size="small"
                onClick={onMarkAllAsRead}
                sx={{ cursor: 'pointer' }}
              />
            </Box>
          </Box>
        )}
      </Menu>
    </Box>
  );
}; 