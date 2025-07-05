import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardHeader, 
  CardContent, 
  Typography, 
  CircularProgress,
  Chip,
  Grid,
  Button,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import IconSet from '../IconSet';

const WaagenStatus = () => {
  const [loading, setLoading] = useState(true);
  const [waagen, setWaagen] = useState([]);
  const [error, setError] = useState(null);

  const fetchWaagenStatus = () => {
    setLoading(true);
    // Simulierte API-Anfrage
    setTimeout(() => {
      setWaagen([
        { id: 1, name: 'Waage 1', status: 'online', lastCheck: new Date().toISOString(), maxCapacity: 150, unit: 'kg' },
        { id: 2, name: 'Waage 2', status: 'offline', lastCheck: '2024-05-24T10:30:00Z', maxCapacity: 200, unit: 'kg' },
        { id: 3, name: 'Waage 3', status: 'online', lastCheck: new Date().toISOString(), maxCapacity: 50, unit: 'kg' },
      ]);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    fetchWaagenStatus();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Fehler beim Laden der Waagen: {error}
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader 
        title="Waagen Status" 
        action={
          <Button 
            variant="outlined" 
            onClick={fetchWaagenStatus}
            startIcon={<IconSet icon="refresh" />}
          >
            Aktualisieren
          </Button>
        }
      />
      <CardContent>
        <List>
          {waagen.map((waage) => (
            <React.Fragment key={waage.id}>
              <ListItem>
                <ListItemIcon>
                  <IconSet 
                    icon={waage.status === 'online' ? 'scale' : 'scale_off'} 
                    color={waage.status === 'online' ? 'green' : 'red'}
                  />
                </ListItemIcon>
                <ListItemText 
                  primary={waage.name} 
                  secondary={`Letzte Prüfung: ${new Date(waage.lastCheck).toLocaleString()}`}
                />
                <Chip 
                  label={waage.status === 'online' ? 'Online' : 'Offline'} 
                  color={waage.status === 'online' ? 'success' : 'error'} 
                  size="small"
                  icon={<IconSet icon={waage.status === 'online' ? 'check_circle' : 'error'} size="small" />}
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default WaagenStatus; 