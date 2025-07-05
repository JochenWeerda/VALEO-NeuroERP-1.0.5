import React, { useState, useEffect, useCallback } from 'react';
import { Badge, IconButton, Popover, List, ListItem, ListItemText, Typography, Box, Divider, Button } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useTheme } from '@mui/material/styles';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

import notificationApi, { InAppNotification } from '../../services/notificationApi';
import { useAuth } from '../../contexts/AuthContext';

const NotificationBell: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Polling-Intervall für Benachrichtigungen (alle 30 Sekunden)
  const POLLING_INTERVAL = 30000;

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const notificationsData = await notificationApi.getInAppNotifications(user.id);
      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Fehler beim Abrufen der Benachrichtigungen:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
    
    // Polling einrichten
    const intervalId = setInterval(fetchNotifications, POLLING_INTERVAL);
    
    // Polling beim Unmount bereinigen
    return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (notificationId: number) => {
    if (!user?.id) return;
    
    try {
      await notificationApi.markNotificationAsRead(notificationId);
      // Aktualisiere die lokale Liste der Benachrichtigungen
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Fehler beim Markieren der Benachrichtigung als gelesen:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    
    try {
      await notificationApi.markAllNotificationsAsRead(user.id);
      // Aktualisiere die lokale Liste der Benachrichtigungen
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Fehler beim Markieren aller Benachrichtigungen als gelesen:', error);
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    return format(new Date(timestamp), 'dd.MM.yyyy HH:mm', { locale: de });
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  return (
    <>
      <IconButton 
        aria-describedby={id}
        color="inherit"
        onClick={handleClick}
        sx={{ marginRight: 1 }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { 
            width: 350,
            maxHeight: 400,
            overflow: 'auto'
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Benachrichtigungen
          </Typography>
          {unreadCount > 0 && (
            <Button 
              size="small" 
              onClick={handleMarkAllAsRead}
              sx={{ textTransform: 'none' }}
            >
              Alle als gelesen markieren
            </Button>
          )}
        </Box>
        
        <Divider />
        
        {loading ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2">Benachrichtigungen werden geladen...</Typography>
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2">Keine Benachrichtigungen vorhanden</Typography>
          </Box>
        ) : (
          <List sx={{ width: '100%', padding: 0 }}>
            {notifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem 
                  alignItems="flex-start"
                  sx={{ 
                    bgcolor: notification.is_read ? 'inherit' : theme.palette.action.hover,
                    '&:hover': { bgcolor: theme.palette.action.selected }
                  }}
                  button
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: notification.is_read ? 'normal' : 'bold' }}>
                          {notification.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimestamp(notification.created_at)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{
                          display: '-webkit-box',
                          overflow: 'hidden',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 2,
                        }}
                      >
                        {notification.message}
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
        
        {notifications.length > 0 && (
          <Box sx={{ p: 1, textAlign: 'center' }}>
            <Button 
              size="small" 
              sx={{ textTransform: 'none' }}
              onClick={handleClose}
            >
              Alle Benachrichtigungen anzeigen
            </Button>
          </Box>
        )}
      </Popover>
    </>
  );
};

export default NotificationBell; 