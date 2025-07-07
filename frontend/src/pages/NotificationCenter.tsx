import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';
import { useNotification } from '../contexts/NotificationContext';

const NotificationCenter: React.FC = () => {
  const { notifications } = useNotification();
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Benachrichtigungszentrale</Typography>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <List>
          {notifications.length === 0 && (
            <ListItem>
              <ListItemText primary="Keine Benachrichtigungen vorhanden." />
            </ListItem>
          )}
          {notifications.map(n => (
            <ListItem key={n.id} divider>
              <ListItemText primary={n.message} secondary={n.type} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default NotificationCenter; 