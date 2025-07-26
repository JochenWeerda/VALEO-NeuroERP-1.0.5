import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  Button, 
  Chip,
  Avatar,
  IconButton
} from '@mui/material';

// NeuroFlow Object Page Header
interface ObjectPageHeaderProps {
  title: string;
  subtitle?: string;
  avatar?: string;
  status?: string;
  actions?: React.ReactNode;
}

export const ObjectPageHeader: React.FC<ObjectPageHeaderProps> = ({
  title,
  subtitle,
  avatar,
  status,
  actions
}) => {
  return (
    <Card sx={{ 
      mb: 3, 
      borderRadius: 0, 
      borderBottom: '1px solid #E5E5E5',
      boxShadow: 'none'
    }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
        {avatar && (
          <Avatar 
            src={avatar} 
            sx={{ width: 64, height: 64, bgcolor: '#0A6ED1' }}
          />
        )}
        
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ 
            color: '#354A5F', 
            fontWeight: 300,
            mb: 0.5
          }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" sx={{ color: '#515559' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {status && (
            <Chip 
              label={status} 
              color="primary" 
              variant="outlined"
              sx={{ borderRadius: 16 }}
            />
          )}
          {actions}
        </Box>
      </Box>
    </Card>
  );
};

// NeuroFlow Object List Item
interface ObjectListItemProps {
  title: string;
  subtitle?: string;
  description?: string;
  status?: string;
  avatar?: string;
  actions?: React.ReactNode;
  onClick?: () => void;
}

export const ObjectListItem: React.FC<ObjectListItemProps> = ({
  title,
  subtitle,
  description,
  status,
  avatar,
  actions,
  onClick
}) => {
  return (
    <Card 
      sx={{ 
        mb: 2, 
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          transform: onClick ? 'translateY(-1px)' : 'none',
          transition: 'all 0.2s ease-in-out'
        }
      }}
      onClick={onClick}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        {avatar && (
          <Avatar 
            src={avatar} 
            sx={{ width: 48, height: 48, bgcolor: '#0A6ED1' }}
          />
        )}
        
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ 
            color: '#354A5F', 
            fontWeight: 500,
            mb: 0.5
          }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: '#515559', mb: 0.5 }}>
              {subtitle}
            </Typography>
          )}
          {description && (
            <Typography variant="body2" sx={{ color: '#6A6D70' }}>
              {description}
            </Typography>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {status && (
            <Chip 
              label={status} 
              size="small"
              color="primary" 
              variant="outlined"
              sx={{ borderRadius: 12 }}
            />
          )}
          {actions}
        </Box>
      </Box>
    </Card>
  );
};

// NeuroFlow Action Bar
interface ActionBarProps {
  title?: string;
  actions: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'contained' | 'outlined' | 'text';
    color?: 'primary' | 'secondary' | 'error';
    disabled?: boolean;
  }>;
}

export const ActionBar: React.FC<ActionBarProps> = ({ title, actions }) => {
  return (
    <Box sx={{ 
      p: 2, 
      bgcolor: '#F5F6F7', 
      borderBottom: '1px solid #E5E5E5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      {title && (
        <Typography variant="h6" sx={{ color: '#354A5F', fontWeight: 500 }}>
          {title}
        </Typography>
      )}
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || 'outlined'}
            color={action.color || 'primary'}
            startIcon={action.icon}
            onClick={action.onClick}
            disabled={action.disabled}
            sx={{ borderRadius: 6 }}
          >
            {action.label}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

// NeuroFlow Quick View Card
interface QuickViewCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const QuickViewCard: React.FC<QuickViewCardProps> = ({
  title,
  icon,
  children,
  actions
}) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        p: 2, 
        borderBottom: '1px solid #E5E5E5',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        {icon && (
          <Box sx={{ color: '#0A6ED1' }}>
            {icon}
          </Box>
        )}
        <Typography variant="h6" sx={{ 
          color: '#354A5F', 
          fontWeight: 500,
          flex: 1
        }}>
          {title}
        </Typography>
        {actions && (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {actions}
          </Box>
        )}
      </Box>
      
      <Box sx={{ p: 2, flex: 1 }}>
        {children}
      </Box>
    </Card>
  );
};

// NeuroFlow Status Indicator
interface StatusIndicatorProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  label: string;
  size?: 'small' | 'medium' | 'large';
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  size = 'medium'
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success': return '#107C41';
      case 'warning': return '#E9730C';
      case 'error': return '#BB0000';
      case 'info': return '#0A6ED1';
      default: return '#6A6D70';
    }
  };

  const getSize = () => {
    switch (size) {
      case 'small': return 8;
      case 'large': return 16;
      default: return 12;
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{
        width: getSize(),
        height: getSize(),
        borderRadius: '50%',
        bgcolor: getStatusColor(),
        flexShrink: 0
      }} />
      <Typography variant="body2" sx={{ color: '#515559' }}>
        {label}
      </Typography>
    </Box>
  );
};

// NeuroFlow Data Table Toolbar
interface DataTableToolbarProps {
  title?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
}

export const DataTableToolbar: React.FC<DataTableToolbarProps> = ({
  title,
  searchValue,
  onSearchChange,
  actions,
  filters
}) => {
  return (
    <Box sx={{ 
      p: 2, 
      bgcolor: '#FFFFFF', 
      borderBottom: '1px solid #E5E5E5',
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      flexWrap: 'wrap'
    }}>
      {title && (
        <Typography variant="h6" sx={{ 
          color: '#354A5F', 
          fontWeight: 500,
          minWidth: 'fit-content'
        }}>
          {title}
        </Typography>
      )}
      
      {onSearchChange && (
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <input
            type="text"
            placeholder="Suchen..."
            value={searchValue || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #E5E5E5',
              borderRadius: 6,
              fontSize: '14px',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#0A6ED1';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#E5E5E5';
            }}
          />
        </Box>
      )}
      
      {filters && (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {filters}
        </Box>
      )}
      
      {actions && (
        <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
          {actions}
        </Box>
      )}
    </Box>
  );
};

// NeuroFlow Section Header
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  collapsible?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actions,
  collapsible,
  expanded,
  onToggle
}) => {
  return (
    <Box sx={{ 
      p: 2, 
      bgcolor: '#F5F6F7', 
      borderBottom: '1px solid #E5E5E5',
      display: 'flex',
      alignItems: 'center',
      gap: 2
    }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="h6" sx={{ 
          color: '#354A5F', 
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          {title}
          {collapsible && (
            <IconButton 
              size="small" 
              onClick={onToggle}
              sx={{ p: 0.5 }}
            >
              {expanded ? '−' : '+'}
            </IconButton>
          )}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: '#515559', mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      
      {actions && (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {actions}
        </Box>
      )}
    </Box>
  );
};

// NeuroFlow Message Strip
interface MessageStripProps {
  type: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

export const MessageStrip: React.FC<MessageStripProps> = ({
  type,
  title,
  children,
  onClose
}) => {
  const getTypeColor = () => {
    switch (type) {
      case 'success': return '#E8F5E8';
      case 'warning': return '#FFF4E5';
      case 'error': return '#FFEBEE';
      case 'info': return '#E3F2FD';
      default: return '#F5F6F7';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success': return '#107C41';
      case 'warning': return '#E9730C';
      case 'error': return '#BB0000';
      case 'info': return '#0A6ED1';
      default: return '#E5E5E5';
    }
  };

  return (
    <Box sx={{
      p: 2,
      bgcolor: getTypeColor(),
      border: `1px solid ${getBorderColor()}`,
      borderRadius: 6,
      display: 'flex',
      alignItems: 'flex-start',
      gap: 2,
      mb: 2
    }}>
      <Box sx={{ flex: 1 }}>
        {title && (
          <Typography variant="subtitle2" sx={{ 
            color: getBorderColor(), 
            fontWeight: 500,
            mb: 0.5
          }}>
            {title}
          </Typography>
        )}
        <Typography variant="body2" sx={{ color: '#515559' }}>
          {children}
        </Typography>
      </Box>
      
      {onClose && (
        <IconButton 
          size="small" 
          onClick={onClose}
          sx={{ p: 0.5, color: getBorderColor() }}
        >
          ×
        </IconButton>
      )}
    </Box>
  );
}; 