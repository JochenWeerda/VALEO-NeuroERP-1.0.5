import React from 'react';
import { Snackbar, Alert } from '@mui/material';

/**
 * Notification-Komponente für System-Benachrichtigungen
 */
const Notification = () => {
  // Dummy-State für Benachrichtigungen
  const [notifications, setNotifications] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  
  const handleClose = () => {
    setOpen(false);
  };
  
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert onClose={handleClose} severity="info" elevation={6} variant="filled">
        System-Benachrichtigung
      </Alert>
    </Snackbar>
  );
};

export default Notification; 