import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

// Vereinfachte Notification-Komponente ohne Redux-Abhängigkeit
const Notification: React.FC = () => {
  // Lokaler State für Benachrichtigungen
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertColor>('info');

  // Event-Handler für das Schließen der Benachrichtigung
  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  // Demo-Benachrichtigung nach dem Laden anzeigen
  useEffect(() => {
    // Timeout, um Demo-Benachrichtigung anzuzeigen
    const timer = setTimeout(() => {
      setMessage('Frontend erfolgreich geladen!');
      setSeverity('success');
      setOpen(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Notification; 