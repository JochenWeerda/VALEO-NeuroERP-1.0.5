import React, { useState, ReactNode } from 'react';
import { Box, CssBaseline, Toolbar, Paper, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';
import Notification from './Notification';
import SystemStatus from './SystemStatus';
import { useThemeContext } from '../themes/ThemeProvider';
import IconSet from './IconSet';
import { Outlet } from 'react-router-dom';

interface LayoutProps {
  children?: ReactNode;
}

/**
 * Layout - Hauptlayout-Komponente im Odoo-Stil
 * 
 * Diese Komponente stellt das Haupt-Layout der Anwendung bereit, bestehend aus
 * Header, Sidebar und dem Hauptinhaltsbereich.
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { currentThemeConfig } = useThemeContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Automatisches Schließen der Sidebar auf mobilen Geräten
  React.useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);
  
  // Toggle-Funktion für die Sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Visuellen Abstand (Dichte) aus dem Theme verwenden
  const visualDensity = currentThemeConfig.parameters?.visualDensity || 'medium';
  const paddingValue = visualDensity === 'compact' ? 2 : (visualDensity === 'comfortable' ? 4 : 3);
  
  // Anpassen der Breite basierend auf Sidebar-Status
  const mainWidth = isMobile ? '100%' : `calc(100% - ${sidebarOpen ? 240 : 64}px)`;
  const mainMargin = isMobile ? 0 : (sidebarOpen ? 240 : 64);

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      bgcolor: 'background.default',
    }}>
      <CssBaseline />
      
      {/* Header mit Toggle-Funktion */}
      <Header sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Sidebar mit aktuellen Status */}
      <Sidebar open={sidebarOpen} onToggle={toggleSidebar} />
      
      {/* Hauptinhalt */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1,
          width: mainWidth,
          ml: `${mainMargin}px`,
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {/* Toolbar für korrekten Abstand unter dem Header */}
        <Toolbar />
        
        {/* System-Status-Anzeige */}
        <Box sx={{ p: paddingValue }}>
          <SystemStatus />
          
          {/* Hauptinhalt / Outlet */}
          <Box sx={{ 
            bgcolor: 'background.paper', 
            borderRadius: 1,
            boxShadow: 1,
            p: 2,
            mt: 2,
            overflow: 'hidden',
          }}>
            {children || <Outlet />}
          </Box>
        </Box>
      </Box>
      
      {/* Benachrichtigungssystem */}
      <Notification />
    </Box>
  );
};

export default Layout; 