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
        return <CheckCircleIcon className="text-green-600" />;
      case 'info':
        return <InfoIcon className="text-blue-600" />;
      case 'warning':
        return <WarningIcon className="text-yellow-600" />;
      case 'error':
        return <ErrorIcon className="text-red-600" />;
      default:
        return <InfoIcon className="text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'default';
      default:
        return 'default';
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
    <div>
      <IconButton
        color="inherit"
        onClick={handleClick}
        className="relative"
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
          className: 'w-96 max-h-96'
        }}
      >
        {/* Header */}
        <Box className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <Typography variant="h6">Benachrichtigungen</Typography>
            {unreadCount > 0 && (
              <Chip
                label={`${unreadCount} ungelesen`}
                size="small"
                color="primary"
              />
            )}
          </div>
          
          {/* Filter Buttons */}
          <div className="flex gap-1">
            {(['all', 'unread', 'ai', 'system', 'business'] as const).map(filter => (
              <Chip
                key={filter}
                label={filter === 'all' ? 'Alle' : 
                       filter === 'unread' ? 'Ungelesen' :
                       filter === 'ai' ? 'KI' :
                       filter === 'system' ? 'System' : 'Geschäft'}
                size="small"
                variant={activeFilter === filter ? 'filled' : 'outlined'}
                onClick={() => setActiveFilter(filter)}
                className="text-xs"
              />
            ))}
          </div>
        </Box>

        {/* Notifications List */}
        <div className="max-h-64 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <Box className="p-4 text-center text-gray-500">
              <Typography variant="body2">
                Keine Benachrichtigungen
              </Typography>
            </Box>
          ) : (
            filteredNotifications.map((notification, index) => (
              <div key={notification.id}>
                <MenuItem
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-3 ${!notification.read ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start space-x-3 w-full">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <Typography variant="subtitle2" className="font-medium">
                          {notification.title}
                        </Typography>
                        <div className="flex items-center space-x-2">
                          {notification.source && (
                            <Chip
                              label={notification.source}
                              size="small"
                              className="text-xs"
                            />
                          )}
                          <Chip
                            label={notification.priority}
                            size="small"
                            color={getPriorityColor(notification.priority) as any}
                            className="text-xs"
                          />
                        </div>
                      </div>
                      
                      <Typography variant="body2" className="text-gray-600 mb-2">
                        {notification.message}
                      </Typography>
                      
                      <div className="flex items-center justify-between">
                        <Typography variant="caption" className="text-gray-500">
                          {notification.timestamp.toLocaleString('de-DE')}
                        </Typography>
                        
                        <div className="flex items-center space-x-2">
                          <TrustIndicator
                            level="high"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </MenuItem>
                {index < filteredNotifications.length - 1 && <Divider />}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {unreadCount > 0 && (
          <Box className="p-3 border-t bg-gray-50">
            <div className="flex justify-between items-center">
              <Typography variant="body2" className="text-gray-600">
                {unreadCount} ungelesene Benachrichtigungen
              </Typography>
              <Chip
                label="Alle als gelesen markieren"
                size="small"
                onClick={onMarkAllAsRead}
                className="cursor-pointer"
              />
            </div>
          </Box>
        )}
      </Menu>
    </div>
  );
}; 