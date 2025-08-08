import React from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Fade,
  Backdrop
} from '@mui/material';
import {
  Psychology as BrainIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  SmartToy as RobotIcon
} from '@mui/icons-material';
// ✅ NEU: Import der standardisierten UI-Komponenten
import { StandardButton } from './forms/FormStandardization';
import { UI_LABELS } from './ui/UIStandardization';

type AgentStatus = 'thinking' | 'processing' | 'ready' | 'error';

interface AgentProcessingOverlayProps {
  isVisible: boolean;
  status: AgentStatus;
  message: string;
  subMessage?: string;
  onCancel?: () => void;
}

export const AgentProcessingOverlay: React.FC<AgentProcessingOverlayProps> = ({
  isVisible,
  status,
  message,
  subMessage,
  onCancel
}) => {
  if (!isVisible) return null;

  // ✅ REFAKTORIERT: Verwendung von Material-UI Icons
  const getStatusIcon = () => {
    switch (status) {
      case 'thinking':
        return <BrainIcon sx={{ fontSize: 48, color: 'primary.main' }} />;
      case 'processing':
        return <SettingsIcon sx={{ fontSize: 48, color: 'primary.main' }} />;
      case 'ready':
        return <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main' }} />;
      case 'error':
        return <ErrorIcon sx={{ fontSize: 48, color: 'error.main' }} />;
      default:
        return <RobotIcon sx={{ fontSize: 48, color: 'primary.main' }} />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'thinking':
        return 'primary.main';
      case 'processing':
        return 'primary.main';
      case 'ready':
        return 'success.main';
      case 'error':
        return 'error.main';
      default:
        return 'text.primary';
    }
  };

  return (
    <Backdrop
      open={isVisible}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)'
      }}
    >
      <Fade in={isVisible}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            p: 4,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            maxWidth: 400,
            width: '100%'
          }}
        >
          <Box sx={{ mb: 2 }}>
            {getStatusIcon()}
          </Box>

          <Typography
            variant="h6"
            sx={{
              color: getStatusColor(),
              mb: 1
            }}
          >
            {message}
          </Typography>

          {subMessage && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              {subMessage}
            </Typography>
          )}

          {(status === 'thinking' || status === 'processing') && (
            <Box sx={{ mt: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {onCancel && (status === 'thinking' || status === 'processing') && (
            <Box sx={{ mt: 2 }}>
              <StandardButton
                variant="outlined"
                size="small"
                onClick={onCancel}
              >
                {UI_LABELS.ACTIONS.CANCEL}
              </StandardButton>
            </Box>
          )}
        </Box>
      </Fade>
    </Backdrop>
  );
}; 