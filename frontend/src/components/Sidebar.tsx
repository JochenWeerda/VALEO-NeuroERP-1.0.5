import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import { 
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
// ✅ NEU: Import der standardisierten UI-Komponenten
import { UI_LABELS } from './ui/UIStandardization';

export type Module = 'crm' | 'warenwirtschaft' | 'fibu' | 'lager' | 'bi' | 'dms' | 'settings' | 'help';

export interface ModuleItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  trustLevel: 'fact' | 'assumption' | 'uncertain';
  confidence: number;
  status: 'active' | 'inactive';
}

export interface SidebarProps {
  activeModule: Module;
  onModuleChange: (module: Module) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const defaultModules: ModuleItem[] = [
  {
    id: 'crm',
    title: UI_LABELS.NAVIGATION.CRM,
    description: UI_LABELS.NAVIGATION.CRM_DESCRIPTION,
    icon: 'fas fa-users',
    color: 'bg-blue-500',
    trustLevel: 'fact',
    confidence: 90,
    status: 'active'
  },
  {
    id: 'warenwirtschaft',
    title: UI_LABELS.NAVIGATION.WAREHOUSE_MANAGEMENT,
    description: UI_LABELS.NAVIGATION.WAREHOUSE_DESCRIPTION,
    icon: 'fas fa-warehouse',
    color: 'bg-purple-500',
    trustLevel: 'fact',
    confidence: 95,
    status: 'active'
  },
  {
    id: 'fibu',
    title: UI_LABELS.NAVIGATION.FINANCE,
    description: UI_LABELS.NAVIGATION.FINANCE_DESCRIPTION,
    icon: 'fas fa-calculator',
    color: 'bg-green-500',
    trustLevel: 'fact',
    confidence: 98,
    status: 'active'
  },
  {
    id: 'lager',
    title: UI_LABELS.NAVIGATION.INVENTORY,
    description: UI_LABELS.NAVIGATION.INVENTORY_DESCRIPTION,
    icon: 'fas fa-boxes',
    color: 'bg-orange-500',
    trustLevel: 'fact',
    confidence: 92,
    status: 'active'
  },
  {
    id: 'bi',
    title: UI_LABELS.NAVIGATION.BI,
    description: UI_LABELS.NAVIGATION.BI_DESCRIPTION,
    icon: 'fas fa-chart-line',
    color: 'bg-teal-500',
    trustLevel: 'assumption',
    confidence: 85,
    status: 'active'
  },
  {
    id: 'dms',
    title: UI_LABELS.NAVIGATION.DMS,
    description: UI_LABELS.NAVIGATION.DMS_DESCRIPTION,
    icon: 'fas fa-file-alt',
    color: 'bg-indigo-500',
    trustLevel: 'fact',
    confidence: 88,
    status: 'active'
  },
  {
    id: 'settings',
    title: UI_LABELS.NAVIGATION.SETTINGS,
    description: UI_LABELS.NAVIGATION.SETTINGS_DESCRIPTION,
    icon: 'fas fa-cog',
    color: 'bg-gray-500',
    trustLevel: 'fact',
    confidence: 100,
    status: 'active'
  },
  {
    id: 'help',
    title: UI_LABELS.NAVIGATION.HELP,
    description: UI_LABELS.NAVIGATION.HELP_DESCRIPTION,
    icon: 'fas fa-question-circle',
    color: 'bg-pink-500',
    trustLevel: 'fact',
    confidence: 92,
    status: 'active'
  }
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onModuleChange,
  collapsed = false,
  onToggleCollapse
}) => {
  return (
    <Box
      sx={{
        width: collapsed ? 64 : 240,
        minHeight: '100vh',
        bgcolor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
        transition: 'width 0.2s ease-in-out'
      }}
    >
      {/* Toggle Button */}
      {onToggleCollapse && (
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton onClick={onToggleCollapse} size="small">
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>
      )}

      {/* Module List */}
      <List>
        {defaultModules.map((module) => (
          <ListItem key={module.id} disablePadding>
            <ListItemButton
              selected={activeModule === module.id}
              onClick={() => onModuleChange(module.id as Module)}
              sx={{
                minHeight: 48,
                px: 2.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  '&:hover': {
                    bgcolor: 'primary.light',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: collapsed ? 'auto' : 3,
                  justifyContent: 'center',
                }}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: module.color.replace('bg-', ''),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px'
                  }}
                >
                  {module.icon.includes('fas fa-') ? 
                    module.icon.replace('fas fa-', '').charAt(0).toUpperCase() : 
                    'M'
                  }
                </Box>
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={module.title}
                  secondary={module.description}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: activeModule === module.id ? 600 : 400,
                  }}
                  secondaryTypographyProps={{
                    fontSize: '0.75rem',
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}; 