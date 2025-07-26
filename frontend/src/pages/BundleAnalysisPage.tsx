import React from 'react';
import { Container, Typography, Box, Paper, Tabs, Tab } from '@mui/material';
import BundleAnalysisComponent from '../components/BundleAnalysis';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`bundle-analysis-tabpanel-${index}`}
      aria-labelledby={`bundle-analysis-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const BundleAnalysisPage: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        🔍 Bundle-Analyse & Performance-Monitoring
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Detaillierte Analyse der Bundle-Größen, Performance-Metriken und Optimierungsvorschläge für das VALEO NeuroERP Frontend.
      </Typography>

      <Paper sx={{ width: '100%', mt: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="Bundle-Analyse Tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Bundle-Übersicht" />
          <Tab label="Performance-Metriken" />
          <Tab label="Optimierungen" />
          <Tab label="Detaillierte Analyse" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <BundleAnalysisComponent 
            showPerformance={false}
            showOptimizations={false}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <BundleAnalysisComponent 
            showPerformance={true}
            showOptimizations={false}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <BundleAnalysisComponent 
            showPerformance={false}
            showOptimizations={true}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <BundleAnalysisComponent 
            showPerformance={true}
            showOptimizations={true}
          />
        </TabPanel>
      </Paper>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          📋 Anleitung zur Bundle-Analyse
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Bundle-Analyse generieren:</strong>
        </Typography>
        <Box component="pre" sx={{ 
          backgroundColor: 'grey.100', 
          p: 2, 
          borderRadius: 1,
          overflow: 'auto',
          fontSize: '0.875rem'
        }}>
{`# Bundle-Analyse mit Visualisierung
npm run build:analysis

# Bundle-Analyse öffnen
npm run analyze

# Production-Build ohne Analyse
npm run build:prod

# Development-Server
npm run dev`}
        </Box>
        
        <Typography variant="body2" paragraph sx={{ mt: 2 }}>
          Die Bundle-Analyse zeigt detaillierte Informationen über:
        </Typography>
        <ul>
          <li><strong>Bundle-Größen:</strong> Gesamtgröße und Aufteilung in Chunks</li>
          <li><strong>Performance-Metriken:</strong> Ladezeiten und Cache-Hit-Raten</li>
          <li><strong>Optimierungsvorschläge:</strong> Automatische Empfehlungen zur Verbesserung</li>
          <li><strong>Chunk-Analyse:</strong> Detaillierte Aufschlüsselung der größten Chunks</li>
        </ul>
      </Box>
    </Container>
  );
};

export default BundleAnalysisPage; 