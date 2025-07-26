import React from 'react';
import { Box, Typography, LinearProgress, Chip } from '@mui/material';
import { CheckCircle as CheckIcon, Warning as WarningIcon, Error as ErrorIcon } from '@mui/icons-material';

interface ConfidenceIndicatorProps {
  confidence: number;
  showPercentage?: boolean;
  showIcon?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'progress' | 'chip' | 'text';
  className?: string;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  confidence,
  showPercentage = true,
  showIcon = true,
  size = 'medium',
  variant = 'progress',
  className = ''
}) => {
  const percentage = Math.round(confidence * 100);
  
  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return 'success';
    if (conf >= 0.6) return 'warning';
    return 'error';
  };

  const getConfidenceIcon = (conf: number) => {
    if (conf >= 0.8) return <CheckIcon />;
    if (conf >= 0.6) return <WarningIcon />;
    return <ErrorIcon />;
  };

  const getConfidenceLabel = (conf: number) => {
    if (conf >= 0.8) return 'Hoch';
    if (conf >= 0.6) return 'Mittel';
    return 'Niedrig';
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { height: 8, fontSize: '0.75rem' };
      case 'large':
        return { height: 12, fontSize: '1rem' };
      default:
        return { height: 10, fontSize: '0.875rem' };
    }
  };

  if (variant === 'chip') {
    return (
      <Chip
        icon={showIcon ? getConfidenceIcon(confidence) : undefined}
        label={showPercentage ? `${percentage}%` : getConfidenceLabel(confidence)}
        color={getConfidenceColor(confidence) as any}
        size={size === 'small' ? 'small' : 'medium'}
        className={className}
      />
    );
  }

  if (variant === 'text') {
    return (
      <Box className={`flex items-center space-x-1 ${className}`}>
        {showIcon && getConfidenceIcon(confidence)}
        <Typography
          variant={size === 'small' ? 'caption' : 'body2'}
          color={`${getConfidenceColor(confidence)}.main`}
          className="font-medium"
        >
          {showPercentage ? `${percentage}%` : getConfidenceLabel(confidence)}
        </Typography>
      </Box>
    );
  }

  // Default: progress variant
  return (
    <Box className={`flex items-center space-x-2 ${className}`}>
      <Box className="flex-1">
        <LinearProgress
          variant="determinate"
          value={percentage}
          color={getConfidenceColor(confidence) as any}
          sx={{ height: getSizeStyles().height, borderRadius: 1 }}
        />
      </Box>
      {showIcon && getConfidenceIcon(confidence)}
      {showPercentage && (
        <Typography
          variant={size === 'small' ? 'caption' : 'body2'}
          color="textSecondary"
          sx={{ fontSize: getSizeStyles().fontSize }}
        >
          {percentage}%
        </Typography>
      )}
    </Box>
  );
}; 