import React from 'react';
import { 
  Box, 
  Typography, 
  Breadcrumbs, 
  Link, 
  AppBar, 
  Toolbar, 
  useTheme as useMuiTheme,
  IconButton,
  Tooltip,
  Avatar,
  Badge
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import CustomerList from '../components/customer/CustomerList';
import IconSet from '../components/IconSet';

/**
 * Seite für die Anzeige der Kundenliste
 * Nutzt die volle Bildschirmbreite ohne Sidebar
 */
const CustomerListPage = () => {
  const muiTheme = useMuiTheme();
  
  return (
    <Box sx={{ 
      flexGrow: 1,
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E8F0FE 0%, #E0E7FF 100%)'
    }}>
      {/* Header-Bar im Dashboard-Stil */}
      <AppBar position="static" color="transparent" elevation={0} sx={{ mb: 3 }}>
        <Toolbar>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            <IconSet icon="people" color={muiTheme.palette.primary.main} size="large" sx={{ mr: 1 }} />
            Kundenstammdaten
          </Typography>
          
          {/* Rechte Seite mit Benachrichtigungen und Benutzer */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Zurück zum Dashboard">
              <IconButton color="inherit" component={RouterLink} to="/landhandel">
                <IconSet icon="dashboard" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Benachrichtigungen">
              <IconButton color="inherit">
                <Badge badgeContent={3} color="error">
                  <IconSet icon="notifications" />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Benutzerkonto">
              <IconButton color="inherit">
                <Avatar 
                  sx={{ 
                    width: 38, 
                    height: 38, 
                    bgcolor: muiTheme.palette.primary.main,
                    fontSize: '1rem'
                  }}
                >
                  MF
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box sx={{ px: 3, pb: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/landhandel" underline="hover" color="inherit">
            Dashboard
          </Link>
          <Typography color="text.primary">Kundenstammdaten</Typography>
        </Breadcrumbs>
        
        <CustomerList />
      </Box>
    </Box>
  );
};

export default CustomerListPage; 