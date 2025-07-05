import React, { useState, useEffect } from 'react';
import { 
  Badge, 
  IconButton, 
  Popover, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Typography, 
  Box, 
  Divider, 
  Button,
  Chip,
  ListItemButton,
  ListItemSecondaryAction,
  CircularProgress
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import ScheduleIcon from '@mui/icons-material/Schedule';
import DoneIcon from '@mui/icons-material/Done';
import ClearIcon from '@mui/icons-material/Clear';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import SignalCellularConnectedNoInternet0BarIcon from '@mui/icons-material/SignalCellularConnectedNoInternet0Bar';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

import chargenNotificationService, { ChargenNotification } from '../../services/chargenNotificationService';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface ChargenNotificationCenterProps {
  onNotificationClick?: (notification: ChargenNotification) => void;
}

const ChargenNotificationCenter: React.FC<ChargenNotificationCenterProps> = ({ onNotificationClick }) => {
  const [notifications, setNotifications] = useState<ChargenNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);

  useEffect(() => {
    // Abonniere den Benachrichtigungsstrom
    const subscription = chargenNotificationService.allNotifications$.subscribe(allNotifications => {
      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.gelesen).length);
    });

    // Abonniere den Verbindungsstatus
    const connectionSubscription = chargenNotificationService.connectionStatus$.subscribe(status => {
      setIsConnected(status);
      setConnecting(false);
    });

    // Verbinde mit dem WebSocket-Server beim Komponenten-Start
    setConnecting(true);
    chargenNotificationService.connect();

    // Bereinige Abonnements beim Komponenten-Abbau
    return () => {
      subscription.unsubscribe();
      connectionSubscription.unsubscribe();
      chargenNotificationService.disconnect();
    };
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: ChargenNotification) => {
    if (!notification.gelesen) {
      chargenNotificationService.markAsRead(notification.id);
    }
    
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    
    // Optional: Schließe das Popover
    // handleClose();
  };

  const handleMarkAllAsRead = (event: React.MouseEvent) => {
    event.stopPropagation();
    chargenNotificationService.markAllAsRead();
  };

  const handleClearAll = (event: React.MouseEvent) => {
    event.stopPropagation();
    chargenNotificationService.clearAllNotifications();
  };

  const handleDeleteNotification = (event: React.MouseEvent, id: string) => {
    event.stopPropagation();
    chargenNotificationService.deleteNotification(id);
  };

  const handleReconnect = (event: React.MouseEvent) => {
    event.stopPropagation();
    setConnecting(true);
    chargenNotificationService.connect();
  };

  // Hilfsfunktion zum Rendern des entsprechenden Icons basierend auf dem Benachrichtigungstyp
  const getNotificationIcon = (notification: ChargenNotification) => {
    switch (notification.typ) {
      case 'mhd':
        return <ScheduleIcon color={notification.prioritaet === 'hoch' ? 'error' : 'warning'} />;
      case 'qualitaet':
        return <WarningIcon color={notification.prioritaet === 'hoch' ? 'error' : 'warning'} />;
      case 'lager':
        return <InfoIcon color="info" />;
      case 'rueckruf':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  // Hilfsfunktion zur formatierung des Zeitstempels
  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: de });
    } catch (error) {
      return timestamp;
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  return (
    <div>
      <IconButton
        aria-describedby={id}
        onClick={handleClick}
        color="inherit"
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
          sx: { width: '400px', maxHeight: '500px' }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <Typography variant="h6">Benachrichtigungen</Typography>
          <Box>
            {isConnected ? (
              <Chip 
                label="Verbunden" 
                size="small" 
                color="success" 
                icon={<ThumbUpIcon />} 
                sx={{ mr: 1 }}
              />
            ) : connecting ? (
              <Chip 
                label="Verbinde..." 
                size="small" 
                icon={<CircularProgress size={16} color="inherit" />} 
                sx={{ mr: 1 }}
              />
            ) : (
              <Chip 
                label="Nicht verbunden" 
                size="small" 
                color="error" 
                icon={<SignalCellularConnectedNoInternet0BarIcon />} 
                onClick={handleReconnect}
                sx={{ mr: 1 }}
              />
            )}
          </Box>
        </Box>
        <Divider />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, bgcolor: 'background.paper' }}>
          <Button 
            size="small" 
            startIcon={<DoneIcon />} 
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            Alle gelesen
          </Button>
          <Button 
            size="small" 
            startIcon={<ClearIcon />} 
            onClick={handleClearAll}
            disabled={notifications.length === 0}
          >
            Alle löschen
          </Button>
        </Box>
        
        <Divider />
        
        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <NotificationsOffIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body1" color="text.secondary">
              Keine Benachrichtigungen vorhanden
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItemButton 
                  onClick={() => handleNotificationClick(notification)}
                  sx={{ 
                    bgcolor: notification.gelesen ? 'transparent' : 'action.hover',
                    '&:hover': {
                      bgcolor: 'action.selected',
                    }
                  }}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" noWrap>
                        {notification.titel}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {notification.beschreibung}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" component="div">
                          {notification.chargenNummer} • {formatTimestamp(notification.zeitstempel)}
                        </Typography>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={(e) => handleDeleteNotification(e, notification.id)}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItemButton>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
        
        {/* Footer mit Link zu allen Benachrichtigungen */}
        <Box sx={{ p: 1, textAlign: 'center', bgcolor: 'background.paper' }}>
          <Button size="small" variant="text">
            Alle Benachrichtigungen anzeigen
          </Button>
        </Box>
      </Popover>
    </div>
  );
};

export default ChargenNotificationCenter; 