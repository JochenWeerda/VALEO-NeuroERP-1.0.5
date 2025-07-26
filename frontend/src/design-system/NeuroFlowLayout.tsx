/**
 * 🧠 NeuroFlow Layout System
 * KI-first, responsive-first Layout für VALEO NeuroERP
 */

import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Tooltip,
  useTheme,
  useMediaQuery,
  Container,
  Breadcrumbs,
  Link,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Receipt as ReceiptIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Inventory as InventoryIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Search as SearchIcon,
  Help as HelpIcon,
  Logout as LogoutIcon,
  Home as HomeIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled Components
const NeuroFlowAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: theme.shadows[1],
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const NeuroFlowDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
    width: 280,
    [theme.breakpoints.down('md')]: {
      width: 260,
    },
  },
}));

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

// Navigation Items
const navigationItems = [
  {
    title: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
    badge: null,
  },
  {
    title: 'Rechnungen',
    icon: <ReceiptIcon />,
    path: '/invoices',
    badge: '12',
  },
  {
    title: 'Kunden',
    icon: <PeopleIcon />,
    path: '/customers',
    badge: null,
  },
  {
    title: 'Unternehmen',
    icon: <BusinessIcon />,
    path: '/companies',
    badge: null,
  },
  {
    title: 'Anlagen',
    icon: <InventoryIcon />,
    path: '/assets',
    badge: '3',
  },
  {
    title: 'Berichte',
    icon: <AssessmentIcon />,
    path: '/reports',
    badge: null,
  },
  {
    title: 'Einstellungen',
    icon: <SettingsIcon />,
    path: '/settings',
    badge: null,
  },
];

// User Menu Items
const userMenuItems = [
  {
    title: 'Profil',
    icon: <AccountCircleIcon />,
    action: () => console.log('Profile'),
  },
  {
    title: 'Einstellungen',
    icon: <SettingsIcon />,
    action: () => console.log('Settings'),
  },
  {
    title: 'Hilfe',
    icon: <HelpIcon />,
    action: () => console.log('Help'),
  },
  {
    title: 'Abmelden',
    icon: <LogoutIcon />,
    action: () => console.log('Logout'),
  },
];

// Layout Props
interface NeuroFlowLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  actions?: React.ReactNode;
  showNavigation?: boolean;
}

// Main Layout Component
export const NeuroFlowLayout: React.FC<NeuroFlowLayoutProps> = ({
  children,
  title,
  subtitle,
  breadcrumbs = [],
  actions,
  showNavigation = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <NeuroFlowAppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {showNavigation && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                backgroundColor: 'primary.main',
                color: 'white',
                mr: 2,
              }}
            >
              V
            </Avatar>
            <Typography variant="h6" fontWeight={600} color="text.primary">
              VALEO NeuroERP
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Search */}
            <Tooltip title="Suchen">
              <IconButton color="inherit">
                <SearchIcon />
              </IconButton>
            </Tooltip>

            {/* Notifications */}
            <Tooltip title="Benachrichtigungen">
              <IconButton color="inherit" onClick={handleNotificationsOpen}>
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* User Menu */}
            <Tooltip title="Benutzer-Menü">
              <IconButton color="inherit" onClick={handleUserMenuOpen}>
                <Avatar sx={{ width: 32, height: 32 }}>
                  <AccountCircleIcon />
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </NeuroFlowAppBar>

      {/* Navigation Drawer */}
      {showNavigation && (
        <NeuroFlowDrawer
          variant={isMobile ? 'temporary' : 'persistent'}
          open={drawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto', py: 2 }}>
            <List>
              {navigationItems.map((item) => (
                <ListItem key={item.title} disablePadding>
                  <ListItemButton
                    sx={{
                      mx: 1,
                      borderRadius: 2,
                      mb: 0.5,
                      '&:hover': {
                        backgroundColor: 'primary.light',
                        color: 'primary.main',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: 'inherit',
                        minWidth: 40,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.title}
                      primaryTypographyProps={{
                        fontWeight: 500,
                      }}
                    />
                    {item.badge && (
                      <Chip
                        label={item.badge}
                        size="small"
                        color="primary"
                        sx={{
                          height: 20,
                          fontSize: '0.75rem',
                          backgroundColor: 'primary.light',
                          color: 'primary.main',
                        }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </NeuroFlowDrawer>
      )}

      {/* Main Content */}
      <MainContent
        sx={{
          marginLeft: showNavigation && !isMobile ? '280px' : 0,
          width: showNavigation && !isMobile ? 'calc(100% - 280px)' : '100%',
        }}
      >
        <Toolbar />
        
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {/* Page Header */}
          {(title || breadcrumbs.length > 0) && (
            <Box mb={4}>
              {/* Breadcrumbs */}
              {breadcrumbs.length > 0 && (
                <Breadcrumbs
                  separator={<ChevronRightIcon fontSize="small" />}
                  sx={{ mb: 2 }}
                >
                  <Link
                    color="inherit"
                    href="/"
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
                    Start
                  </Link>
                  {breadcrumbs.map((crumb, index) => (
                    <Link
                      key={index}
                      color={index === breadcrumbs.length - 1 ? 'text.primary' : 'inherit'}
                      href={crumb.href}
                      underline={index === breadcrumbs.length - 1 ? 'none' : 'hover'}
                    >
                      {crumb.label}
                    </Link>
                  ))}
                </Breadcrumbs>
              )}

              {/* Title and Actions */}
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  {title && (
                    <Typography variant="h3" fontWeight={700} color="text.primary" mb={1}>
                      {title}
                    </Typography>
                  )}
                  {subtitle && (
                    <Typography variant="h6" color="text.secondary">
                      {subtitle}
                    </Typography>
                  )}
                </Box>
                
                {actions && (
                  <Box display="flex" gap={2}>
                    {actions}
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* Page Content */}
          {children}
        </Container>
      </MainContent>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            borderRadius: 2,
            boxShadow: theme.shadows[3],
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            Max Mustermann
          </Typography>
          <Typography variant="body2" color="text.secondary">
            max.mustermann@valeo.com
          </Typography>
        </Box>
        <Divider />
        {userMenuItems.map((item) => (
          <MenuItem
            key={item.title}
            onClick={() => {
              item.action();
              handleUserMenuClose();
            }}
            sx={{
              py: 1.5,
              px: 2,
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.title} />
          </MenuItem>
        ))}
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 320,
            maxHeight: 400,
            borderRadius: 2,
            boxShadow: theme.shadows[3],
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="subtitle2" fontWeight={600}>
            Benachrichtigungen
          </Typography>
        </Box>
        
        <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
          {[
            { title: 'Neue Rechnung erstellt', time: 'vor 5 Minuten', type: 'info' },
            { title: 'Kunde aktualisiert', time: 'vor 15 Minuten', type: 'success' },
            { title: 'System-Wartung geplant', time: 'vor 1 Stunde', type: 'warning' },
          ].map((notification, index) => (
            <MenuItem
              key={index}
              sx={{
                py: 1.5,
                px: 2,
                borderBottom: index < 2 ? `1px solid ${theme.palette.divider}` : 'none',
              }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" fontWeight={500}>
                  {notification.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {notification.time}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Box>
        
        <Divider />
        <MenuItem sx={{ py: 1.5, px: 2 }}>
          <Typography variant="body2" color="primary">
            Alle Benachrichtigungen anzeigen
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

// Page Layout Component
interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  actions?: React.ReactNode;
  showNavigation?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = (props) => {
  return <NeuroFlowLayout {...props} />;
};

// Dashboard Layout Component
interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title = 'Dashboard',
  subtitle = 'Übersicht über Ihr VALEO NeuroERP System',
}) => {
  return (
    <NeuroFlowLayout
      title={title}
      subtitle={subtitle}
      breadcrumbs={[{ label: 'Dashboard' }]}
    >
      {children}
    </NeuroFlowLayout>
  );
};

// Form Layout Component
interface FormLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  actions?: React.ReactNode;
}

export const FormLayout: React.FC<FormLayoutProps> = ({
  children,
  title,
  subtitle,
  breadcrumbs = [],
  actions,
}) => {
  return (
    <NeuroFlowLayout
      title={title}
      subtitle={subtitle}
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      {children}
    </NeuroFlowLayout>
  );
};

// Table Layout Component
interface TableLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  actions?: React.ReactNode;
}

export const TableLayout: React.FC<TableLayoutProps> = ({
  children,
  title,
  subtitle,
  breadcrumbs = [],
  actions,
}) => {
  return (
    <NeuroFlowLayout
      title={title}
      subtitle={subtitle}
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      {children}
    </NeuroFlowLayout>
  );
};

export default NeuroFlowLayout; 