import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  PhoneAndroid as PhoneAndroidIcon,
  Forum as ForumIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

import notificationApi, {
  NotificationType,
  NotificationLog,
  NotificationStats,
  NotificationGroup
} from '../services/notificationApi';
import { useAuth } from '../contexts/AuthContext';
import NotificationSettings from '../components/notification/NotificationSettings';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`notification-tab-${index}`}
      aria-labelledby={`notification-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `notification-tab-${index}`,
    'aria-controls': `notification-tabpanel-${index}`,
  };
}

const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [groups, setGroups] = useState<NotificationGroup[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter-Zustand
  const [notificationType, setNotificationType] = useState<string>('');
  const [entityType, setEntityType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Benachrichtigungen laden
  const loadNotifications = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Alle Benachrichtigungen laden
      const params: any = {
        user_id: user.id,
        limit: 50
      };
      
      if (notificationType) {
        params.notification_type = notificationType;
      }
      
      if (entityType) {
        params.entity_type = entityType;
      }
      
      const notificationsData = await notificationApi.getNotificationLogs(params);
      setNotifications(notificationsData);
      
      // Gruppierte Benachrichtigungen laden
      const groupsData = await notificationApi.getGroupedNotifications(user.id);
      setGroups(groupsData);
      
      // Statistiken laden
      const statsData = await notificationApi.getNotificationStats(user.id);
      setStats(statsData);
    } catch (error) {
      console.error('Fehler beim Laden der Benachrichtigungen:', error);
      setError('Fehler beim Laden der Benachrichtigungen. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  // Beim Laden der Komponente und bei Änderungen der Filter
  useEffect(() => {
    loadNotifications();
  }, [user?.id, notificationType, entityType]);

  // Filtert Benachrichtigungen nach Suchbegriff
  const filteredNotifications = searchQuery
    ? notifications.filter(n => 
        n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.related_entity_type && n.related_entity_type.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : notifications;

  // Formatiert einen Zeitstempel
  const formatTimestamp = (timestamp: string): string => {
    return format(new Date(timestamp), 'dd.MM.yyyy HH:mm', { locale: de });
  };

  // Gibt ein Icon basierend auf dem Benachrichtigungstyp zurück
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.EMAIL:
        return <EmailIcon />;
      case NotificationType.SMS:
        return <SmsIcon />;
      case NotificationType.PUSH:
        return <PhoneAndroidIcon />;
      case NotificationType.IN_APP:
        return <ForumIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  // Übersichtskomponente
  const OverviewPanel = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Benachrichtigungsübersicht
      </Typography>
      
      {stats ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Allgemeine Statistiken
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Gesamt:</Typography>
                  <Typography>{stats.total_notifications}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Erfolgreich gesendet:</Typography>
                  <Typography>{stats.sent_successfully}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Fehlgeschlagen:</Typography>
                  <Typography>{stats.failed}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Nach Typ
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {Object.entries(stats.by_type).map(([type, count]) => (
                  <Box key={type} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>{type}:</Typography>
                    <Typography>{count}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Neueste Aktivitäten
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List>
                  {stats.recent_activity.map((activity) => (
                    <ListItem key={activity.id}>
                      <ListItemText
                        primary={`${activity.notification_type} - ${activity.is_sent ? 'Erfolgreich' : 'Fehlgeschlagen'}`}
                        secondary={`${formatTimestamp(activity.created_at)} - ${activity.entity_type || 'Keine Entität'} ${activity.entity_id || ''}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Alert severity="info">
          Keine Statistiken verfügbar.
        </Alert>
      )}
    </Box>
  );

  // Alle Benachrichtigungen
  const AllNotificationsPanel = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Alle Benachrichtigungen
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Suchen..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1 }} />,
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="notification-type-label">Benachrichtigungstyp</InputLabel>
            <Select
              labelId="notification-type-label"
              value={notificationType}
              label="Benachrichtigungstyp"
              onChange={(e) => setNotificationType(e.target.value)}
            >
              <MenuItem value="">Alle</MenuItem>
              <MenuItem value={NotificationType.EMAIL}>E-Mail</MenuItem>
              <MenuItem value={NotificationType.SMS}>SMS</MenuItem>
              <MenuItem value={NotificationType.PUSH}>Push</MenuItem>
              <MenuItem value={NotificationType.IN_APP}>In-App</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="entity-type-label">Entitätstyp</InputLabel>
            <Select
              labelId="entity-type-label"
              value={entityType}
              label="Entitätstyp"
              onChange={(e) => setEntityType(e.target.value)}
            >
              <MenuItem value="">Alle</MenuItem>
              <MenuItem value="emergency">Notfall</MenuItem>
              <MenuItem value="escalation">Eskalation</MenuItem>
              <MenuItem value="test">Test</MenuItem>
            </Select>
          </FormControl>
          
          <IconButton onClick={loadNotifications}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredNotifications.length === 0 ? (
        <Alert severity="info">
          Keine Benachrichtigungen gefunden.
        </Alert>
      ) : (
        <Paper>
          <List>
            {filteredNotifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete">
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar>
                      {getNotificationIcon(notification.notification_type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">
                          {notification.notification_type}
                        </Typography>
                        {notification.is_sent ? (
                          <CheckIcon fontSize="small" color="success" />
                        ) : (
                          <Typography variant="caption" color="error">
                            Nicht gesendet
                          </Typography>
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" component="span">
                          {notification.content}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {formatTimestamp(notification.created_at)}
                          {notification.related_entity_type && ` | ${notification.related_entity_type} #${notification.related_entity_id}`}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );

  // Gruppierte Benachrichtigungen
  const GroupedNotificationsPanel = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Gruppierte Benachrichtigungen
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : groups.length === 0 ? (
        <Alert severity="info">
          Keine gruppierten Benachrichtigungen gefunden.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {groups.map((group) => (
            <Grid item xs={12} md={6} key={`${group.entity_type}-${group.entity_id}`}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      {group.entity_type} #{group.entity_id}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {group.count} Benachrichtigungen
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">
                      Neueste Benachrichtigung:
                    </Typography>
                    <Typography variant="body2">
                      {group.latest_notification.content}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatTimestamp(group.latest_timestamp)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button size="small" onClick={() => {
                      setEntityType(group.entity_type);
                      setTabValue(1); // Wechsle zum Tab "Alle Benachrichtigungen"
                    }}>
                      Alle anzeigen
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  // Einstellungen
  const SettingsPanel = () => (
    <NotificationSettings />
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Benachrichtigungszentrum
        </Typography>
        <IconButton onClick={() => navigate('/user/settings')}>
          <SettingsIcon />
        </IconButton>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ width: '100%', mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="notification center tabs"
          variant="fullWidth"
        >
          <Tab label="Übersicht" {...a11yProps(0)} />
          <Tab label="Alle Benachrichtigungen" {...a11yProps(1)} />
          <Tab label="Gruppiert" {...a11yProps(2)} />
          <Tab label="Einstellungen" {...a11yProps(3)} />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <OverviewPanel />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <AllNotificationsPanel />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <GroupedNotificationsPanel />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <SettingsPanel />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default NotificationCenter; 