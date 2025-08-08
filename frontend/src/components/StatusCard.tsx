import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { CheckCircle, Cancel, Build, Warning } from '@mui/icons-material';
// ✅ NEU: Import der standardisierten UI-Komponenten
import { StatusChip } from './ui/UIStandardization';
import { UI_LABELS } from './ui/UIStandardization';
import { TrustIndicator } from './TrustIndicator';
import type { TrustLevel } from './TrustIndicator';

export interface StatusCardProps {
  title: string;
  status: 'online' | 'offline' | 'maintenance' | 'error';
  trustLevel: TrustLevel;
  confidence: number;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  status,
  trustLevel,
  confidence
}) => {
  // ✅ REFAKTORIERT: Verwendung von StatusChip für Status-Anzeige
  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return { 
          status: 'ACTIVE' as keyof typeof UI_LABELS.STATUS, 
          icon: <CheckCircle fontSize="small" />,
          label: 'Online'
        };
      case 'offline':
        return { 
          status: 'OFFLINE' as keyof typeof UI_LABELS.STATUS, 
          icon: <Cancel fontSize="small" />,
          label: 'Offline'
        };
      case 'maintenance':
        return { 
          status: 'MAINTENANCE' as keyof typeof UI_LABELS.STATUS, 
          icon: <Build fontSize="small" />,
          label: 'Wartung'
        };
      case 'error':
        return { 
          status: 'ERROR' as keyof typeof UI_LABELS.STATUS, 
          icon: <Warning fontSize="small" />,
          label: 'Fehler'
        };
      default:
        return { 
          status: 'PENDING' as keyof typeof UI_LABELS.STATUS, 
          icon: <Warning fontSize="small" />,
          label: status
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <Card sx={{ p: 2, height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box flex={1}>
            <Typography variant="body2" fontWeight="medium" color="text.primary" mb={0.5}>
              {title}
            </Typography>
            <Box display="flex" alignItems="center" gap={0.5}>
              {statusConfig.icon}
              <StatusChip 
                status={statusConfig.status} 
                size="small"
              />
            </Box>
          </Box>
          <Box ml={2}>
            <TrustIndicator level={trustLevel} confidence={confidence} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};