import React from 'react';
import {
  AppBar, Toolbar, Typography, Chip, IconButton, Tooltip, LinearProgress, Box
} from '@mui/material';
import {
  WifiOff as OfflineIcon, Wifi as OnlineIcon, Sync as SyncIcon, Warning as WarningIcon
} from '@mui/icons-material';
import { useOfflineStatus, usePendingRequests } from '../hooks/useOffline';

interface OfflineStatusBarProps {
  className?: string;
}

const OfflineStatusBar: React.FC<OfflineStatusBarProps> = ({ className = '' }) => {
  const { isOnline, pendingRequests, syncInProgress, lastSync, error } = useOfflineStatus();
  const { pendingRequests: pendingRequestsList, loading } = usePendingRequests();

  const getStatusColor = () => {
    if (!isOnline) return 'error.main';
    if (pendingRequests > 0) return 'warning.main';
    return 'success.main';
  };

  const getStatusIcon = () => {
    if (!isOnline) return <OfflineIcon />;
    if (pendingRequests > 0) return <SyncIcon />;
    return <OnlineIcon />;
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline - Synchronisation ausstehend';
    if (pendingRequests > 0) return `Online - ${pendingRequests} Sync-Pending`;
    return 'Online - Synchronisiert';
  };

  const getSyncProgress = () => {
    if (!isOnline || pendingRequests === 0) return 0;
    // Vereinfachte Fortschrittsberechnung
    return Math.min(90, (pendingRequests / 10) * 100);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        top: 'auto',
        bottom: 0,
        backgroundColor: getStatusColor(),
        zIndex: 1000
      }}
      className={`offline-status-bar ${className}`}
    >
      <Toolbar variant="dense" sx={{ minHeight: '40px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <IconButton size="small" color="inherit" sx={{ mr: 1 }}>
            {getStatusIcon()}
          </IconButton>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {getStatusText()}
          </Typography>
          {isOnline && pendingRequests > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, mr: 2 }}>
              <LinearProgress variant="determinate" value={getSyncProgress()} sx={{ flexGrow: 1, mr: 1 }} />
              <Typography variant="caption" sx={{ color: 'white' }}>
                {Math.round(getSyncProgress())}%
              </Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isOnline && pendingRequests > 0 && (
            <Chip label={`${pendingRequests} Sync`} size="small" color="warning" variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
          )}
          {error && (
            <Tooltip title={error}>
              <IconButton size="small" color="inherit">
                <WarningIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Letzte Synchronisation">
            <Typography variant="caption" sx={{ color: 'white' }}>
              {lastSync ? new Date(lastSync).toLocaleTimeString('de-DE') : 'Nie'}
            </Typography>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default OfflineStatusBar; 