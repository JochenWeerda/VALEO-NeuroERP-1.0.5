import React, { useState } from 'react';
import { Box, Typography, Paper, Tabs, Tab } from '@mui/material';
import EmergencyCaseList from '../components/emergency/EmergencyCaseList';
import EmergencyEscalationManager from '../components/emergency/EmergencyEscalation';
import EmergencyPlans from '../components/emergency/EmergencyPlans';
import EmergencyResources from '../components/emergency/EmergencyResources';
import EmergencyContacts from '../components/emergency/EmergencyContacts';
// Dummy-Komponenten für Ressourcen und Kontakte, falls noch nicht vorhanden

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`emergency-tabpanel-${index}`}
      aria-labelledby={`emergency-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>{children}</Box>
      )}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `emergency-tab-${index}`,
    'aria-controls': `emergency-tabpanel-${index}`,
  };
};

const EmergencyDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Notfall- & Krisenzentrale</Typography>
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Notfallzentrale Tabs"
        >
          <Tab label="Notfälle" {...a11yProps(0)} />
          <Tab label="Eskalationen" {...a11yProps(1)} />
          <Tab label="Notfallpläne" {...a11yProps(2)} />
          <Tab label="Ressourcen" {...a11yProps(3)} />
          <Tab label="Kontakte" {...a11yProps(4)} />
        </Tabs>
        <Box sx={{ p: 3 }}>
          <TabPanel value={tabValue} index={0}>
            <EmergencyCaseList />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <EmergencyEscalationManager />
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <EmergencyPlans />
          </TabPanel>
          <TabPanel value={tabValue} index={3}>
            <EmergencyResources />
          </TabPanel>
          <TabPanel value={tabValue} index={4}>
            <EmergencyContacts />
          </TabPanel>
        </Box>
      </Paper>
    </Box>
  );
};

export default EmergencyDashboard; 