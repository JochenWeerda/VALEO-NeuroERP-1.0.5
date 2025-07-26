/**
 * 🧠 NeuroFlow Components
 * KI-first, responsive-first Komponenten für VALEO NeuroERP
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Skeleton,
  Alert,
  AlertTitle,
  Divider,
  Stack,
  Grid,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled Components
const NeuroFlowCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[1],
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)',
  },
}));

const NeuroFlowButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  textTransform: 'none',
  fontWeight: 600,
  padding: '0.75rem 1.5rem',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: theme.shadows[3],
  },
}));

const NeuroFlowChip = styled(Chip)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  fontWeight: 500,
  '&.MuiChip-colorSuccess': {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.dark,
  },
  '&.MuiChip-colorWarning': {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.dark,
  },
  '&.MuiChip-colorError': {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.dark,
  },
  '&.MuiChip-colorInfo': {
    backgroundColor: theme.palette.info.light,
    color: theme.palette.info.dark,
  },
}));

// Data Card Component
interface DataCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  trendValue?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  onClick?: () => void;
  loading?: boolean;
}

export const DataCard: React.FC<DataCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  color = 'primary',
  onClick,
  loading = false,
}) => {
  const colorMap = {
    primary: '#2196F3',
    secondary: '#4CAF50',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
  };

  return (
    <NeuroFlowCard onClick={onClick} sx={{ cursor: onClick ? 'pointer' : 'default' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {title}
          </Typography>
          {icon && (
            <Avatar
              sx={{
                width: 40,
                height: 40,
                backgroundColor: `${colorMap[color]}20`,
                color: colorMap[color],
              }}
            >
              {icon}
            </Avatar>
          )}
        </Box>
        
        {loading ? (
          <Skeleton variant="text" width="60%" height={40} />
        ) : (
          <Typography variant="h4" fontWeight={700} color="text.primary" mb={1}>
            {value}
          </Typography>
        )}
        
        {subtitle && (
          <Typography variant="body2" color="text.secondary" mb={1}>
            {subtitle}
          </Typography>
        )}
        
        {trend && (
          <Box display="flex" alignItems="center" gap={1}>
            {trend.isPositive ? (
              <TrendingUpIcon color="success" fontSize="small" />
            ) : (
              <TrendingDownIcon color="error" fontSize="small" />
            )}
            <Typography
              variant="body2"
              color={trend.isPositive ? 'success.main' : 'error.main'}
              fontWeight={600}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </Typography>
          </Box>
        )}
        
        {trendValue && (
          <Typography variant="body2" color="text.secondary" mt={1}>
            {trendValue}
          </Typography>
        )}
      </CardContent>
    </NeuroFlowCard>
  );
};

// Status Badge Component
interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'default';
  label: string;
  size?: 'small' | 'medium' | 'large';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'medium',
}) => {
  const statusConfig = {
    success: { icon: <CheckCircleIcon />, color: 'success' as const },
    warning: { icon: <WarningIcon />, color: 'warning' as const },
    error: { icon: <ErrorIcon />, color: 'error' as const },
    info: { icon: <InfoIcon />, color: 'info' as const },
    default: { icon: null, color: 'default' as const },
  };

  const config = statusConfig[status];

  return (
    <NeuroFlowChip
      icon={config.icon}
      label={label}
      color={config.color}
      size={size === 'large' ? 'medium' : size}
      variant="filled"
    />
  );
};

// Action Card Component
interface ActionCardProps {
  title: string;
  description?: string;
  actions?: Array<{
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
    variant?: 'contained' | 'outlined' | 'text';
  }>;
  children?: React.ReactNode;
  loading?: boolean;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  actions = [],
  children,
  loading = false,
}) => {
  return (
    <NeuroFlowCard>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box>
            <Typography variant="h6" fontWeight={600} color="text.primary">
              {title}
            </Typography>
            {description && (
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                {description}
              </Typography>
            )}
          </Box>
          
          {actions.length > 0 && (
            <Stack direction="row" spacing={1}>
              {actions.map((action, index) => (
                <Tooltip key={index} title={action.label}>
                  <IconButton
                    onClick={action.onClick}
                    color={action.color}
                    size="small"
                    sx={{
                      backgroundColor: action.variant === 'contained' ? 'primary.main' : 'transparent',
                      color: action.variant === 'contained' ? 'white' : 'primary.main',
                      '&:hover': {
                        backgroundColor: action.variant === 'contained' ? 'primary.dark' : 'primary.light',
                      },
                    }}
                  >
                    {action.icon}
                  </IconButton>
                </Tooltip>
              ))}
            </Stack>
          )}
        </Box>
        
        {loading ? (
          <Box>
            <Skeleton variant="rectangular" height={100} />
            <Skeleton variant="text" sx={{ mt: 1 }} />
            <Skeleton variant="text" width="60%" />
          </Box>
        ) : (
          children
        )}
      </CardContent>
    </NeuroFlowCard>
  );
};

// Empty State Component
interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
}) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={8}
      px={4}
      textAlign="center"
    >
      {icon && (
        <Avatar
          sx={{
            width: 80,
            height: 80,
            backgroundColor: 'primary.light',
            color: 'primary.main',
            mb: 3,
          }}
        >
          {icon}
        </Avatar>
      )}
      
      <Typography variant="h5" fontWeight={600} color="text.primary" mb={2}>
        {title}
      </Typography>
      
      <Typography variant="body1" color="text.secondary" mb={4} maxWidth={400}>
        {description}
      </Typography>
      
      {action && (
        <NeuroFlowButton
          variant="contained"
          startIcon={action.icon}
          onClick={action.onClick}
        >
          {action.label}
        </NeuroFlowButton>
      )}
    </Box>
  );
};

// Loading State Component
interface LoadingStateProps {
  message?: string;
  showSkeleton?: boolean;
  skeletonRows?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Lade Daten...',
  showSkeleton = false,
  skeletonRows = 3,
}) => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" py={4}>
      {showSkeleton ? (
        <Box width="100%">
          {Array.from({ length: skeletonRows }).map((_, index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              height={60}
              sx={{ mb: 2, borderRadius: 2 }}
            />
          ))}
        </Box>
      ) : (
        <>
          <Skeleton variant="circular" width={40} height={40} sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            {message}
          </Typography>
        </>
      )}
    </Box>
  );
};

// Error State Component
interface ErrorStateProps {
  title?: string;
  message: string;
  retry?: () => void;
  showDetails?: boolean;
  details?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Ein Fehler ist aufgetreten',
  message,
  retry,
  showDetails = false,
  details,
}) => {
  return (
    <Alert severity="error" sx={{ borderRadius: 2 }}>
      <AlertTitle>{title}</AlertTitle>
      {message}
      
      {showDetails && details && (
        <Box mt={2}>
          <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
            {details}
          </Typography>
        </Box>
      )}
      
      {retry && (
        <Box mt={2}>
          <NeuroFlowButton
            variant="outlined"
            color="error"
            startIcon={<RefreshIcon />}
            onClick={retry}
            size="small"
          >
            Erneut versuchen
          </NeuroFlowButton>
        </Box>
      )}
    </Alert>
  );
};

// Section Header Component
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  divider?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actions,
  divider = true,
}) => {
  return (
    <Box mb={3}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Box>
          <Typography variant="h4" fontWeight={600} color="text.primary">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="text.secondary" mt={0.5}>
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {actions && (
          <Box display="flex" gap={1}>
            {actions}
          </Box>
        )}
      </Box>
      
      {divider && <Divider />}
    </Box>
  );
};

// Responsive Grid Component
interface ResponsiveGridProps {
  children: React.ReactNode;
  spacing?: number;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  spacing = 3,
  columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 6 },
}) => {
  return (
    <Grid container spacing={spacing}>
      {React.Children.map(children, (child, index) => (
        <Grid
          item
          xs={columns.xs}
          sm={columns.sm}
          md={columns.md}
          lg={columns.lg}
          xl={columns.xl}
          key={index}
        >
          {child}
        </Grid>
      ))}
    </Grid>
  );
};

// Export all components
export {
  NeuroFlowCard,
  NeuroFlowButton,
  NeuroFlowChip,
}; 