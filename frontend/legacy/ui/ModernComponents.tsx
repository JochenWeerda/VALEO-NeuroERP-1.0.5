import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Box,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip,
  Alert,
  Divider,
  Grid,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { Table, Tag, Space, Progress, Statistic } from 'antd';

// Data Card Component
interface DataCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
  };
  onClick?: () => void;
}

export const DataCard: React.FC<DataCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = '#1976d2',
  trend,
  onClick
}) => {
  return (
    <Card 
      className="h-full hover:shadow-lg transition-all cursor-pointer"
      onClick={onClick}
    >
      <CardContent>
        <Box className="flex items-center justify-between">
          <Box className="flex-1">
            <Typography variant="body2" className="text-gray-600 mb-1">
              {title}
            </Typography>
            <Typography variant="h4" className="font-bold text-gray-800 mb-1">
              {typeof value === 'number' ? value.toLocaleString('de-DE') : value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" className="text-gray-500">
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box className="flex items-center mt-2">
                <Typography 
                  variant="body2" 
                  className={`font-medium ${
                    trend.direction === 'up' ? 'text-green-600' : 
                    trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}
                >
                  {trend.direction === 'up' ? '+' : ''}{trend.value}%
                </Typography>
              </Box>
            )}
          </Box>
          {icon && (
            <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>
              {icon}
            </Avatar>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

// Action Button Component
interface ActionButtonProps {
  variant: 'add' | 'edit' | 'delete' | 'view' | 'download' | 'upload';
  onClick: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  label?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  variant,
  onClick,
  disabled = false,
  size = 'medium',
  label
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'add': return <AddIcon />;
      case 'edit': return <EditIcon />;
      case 'delete': return <DeleteIcon />;
      case 'view': return <ViewIcon />;
      case 'download': return <DownloadIcon />;
      case 'upload': return <UploadIcon />;
      default: return <AddIcon />;
    }
  };

  const getColor = () => {
    switch (variant) {
      case 'add': return 'primary';
      case 'edit': return 'info';
      case 'delete': return 'error';
      case 'view': return 'success';
      case 'download': return 'secondary';
      case 'upload': return 'warning';
      default: return 'primary';
    }
  };

  const getLabel = () => {
    if (label) return label;
    switch (variant) {
      case 'add': return 'Hinzufügen';
      case 'edit': return 'Bearbeiten';
      case 'delete': return 'Löschen';
      case 'view': return 'Anzeigen';
      case 'download': return 'Herunterladen';
      case 'upload': return 'Hochladen';
      default: return 'Aktion';
    }
  };

  return (
    <Button
      variant="contained"
      color={getColor()}
      size={size}
      onClick={onClick}
      disabled={disabled}
      startIcon={getIcon()}
    >
      {getLabel()}
    </Button>
  );
};

// Status Chip Component
interface StatusChipProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'pending' | 'completed';
  label?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, label }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'success':
      case 'completed':
        return { color: 'success', label: label || 'Erfolgreich', icon: <SuccessIcon /> };
      case 'warning':
      case 'pending':
        return { color: 'warning', label: label || 'Ausstehend', icon: <WarningIcon /> };
      case 'error':
        return { color: 'error', label: label || 'Fehler', icon: <ErrorIcon /> };
      case 'info':
        return { color: 'info', label: label || 'Information', icon: <InfoIcon /> };
      default:
        return { color: 'default', label: label || 'Unbekannt', icon: <InfoIcon /> };
    }
  };

  const config = getStatusConfig();

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      color={config.color as any}
      size="small"
      className="font-medium"
    />
  );
};

// Search Bar Component
interface SearchBarProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  onClear?: () => void;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Suchen...',
  onSearch,
  onClear,
  className
}) => {
  const [searchValue, setSearchValue] = React.useState('');

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch(value);
  };

  const handleClear = () => {
    setSearchValue('');
    onClear?.();
  };

  return (
    <Box className={`flex items-center space-x-2 ${className}`}>
      <TextField
        fullWidth
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => handleSearch(e.target.value)}
        InputProps={{
          startAdornment: <SearchIcon className="text-gray-400 mr-2" />,
          endAdornment: searchValue && (
            <IconButton size="small" onClick={handleClear}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          )
        }}
        size="small"
      />
      <Tooltip title="Filter">
        <IconButton>
          <FilterIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Aktualisieren">
        <IconButton>
          <RefreshIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

// Progress Card Component
interface ProgressCardProps {
  title: string;
  progress: number;
  current: number;
  total: number;
  color?: string;
  subtitle?: string;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  progress,
  current,
  total,
  color = '#1976d2',
  subtitle
}) => {
  return (
    <Card className="h-full">
      <CardContent>
        <Typography variant="h6" className="font-semibold text-gray-800 mb-2">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" className="text-gray-600 mb-3">
            {subtitle}
          </Typography>
        )}
        <Box className="mb-3">
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#e5e7eb',
              '& .MuiLinearProgress-bar': {
                backgroundColor: color,
                borderRadius: 4
              }
            }}
          />
        </Box>
        <Box className="flex justify-between items-center">
          <Typography variant="body2" className="text-gray-600">
            {current} von {total}
          </Typography>
          <Typography variant="body2" className="font-medium text-gray-800">
            {progress}%
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

// Alert Message Component
interface AlertMessageProps {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
  onClose?: () => void;
}

export const AlertMessage: React.FC<AlertMessageProps> = ({
  type,
  title,
  message,
  onClose
}) => {
  return (
    <Alert
      severity={type}
      onClose={onClose}
      className="mb-4"
      action={
        onClose && (
          <Button color="inherit" size="small" onClick={onClose}>
            Schließen
          </Button>
        )
      }
    >
      <Box>
        <Typography variant="subtitle2" className="font-semibold">
          {title}
        </Typography>
        {message && (
          <Typography variant="body2" className="mt-1">
            {message}
          </Typography>
        )}
      </Box>
    </Alert>
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
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action
}) => {
  return (
    <Box className="text-center py-12">
      {icon && (
        <Box className="mb-4">
          {icon}
        </Box>
      )}
      <Typography variant="h6" className="font-semibold text-gray-800 mb-2">
        {title}
      </Typography>
      <Typography variant="body2" className="text-gray-600 mb-4 max-w-md mx-auto">
        {description}
      </Typography>
      {action && (
        <Button
          variant="contained"
          onClick={action.onClick}
          startIcon={<AddIcon />}
        >
          {action.label}
        </Button>
      )}
    </Box>
  );
};

// Loading State Component
interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Daten werden geladen...',
  size = 'medium'
}) => {
  return (
    <Box className="flex flex-col items-center justify-center py-8">
      <LinearProgress 
        className="w-32 mb-4"
        sx={{ height: size === 'large' ? 8 : 4 }}
      />
      <Typography variant="body2" className="text-gray-600">
        {message}
      </Typography>
    </Box>
  );
};

// Section Header Component
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actions
}) => {
  return (
    <Box className="flex items-center justify-between mb-6">
      <Box>
        <Typography variant="h5" className="font-semibold text-gray-800">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" className="text-gray-600 mt-1">
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && (
        <Box className="flex items-center space-x-2">
          {actions}
        </Box>
      )}
    </Box>
  );
}; 