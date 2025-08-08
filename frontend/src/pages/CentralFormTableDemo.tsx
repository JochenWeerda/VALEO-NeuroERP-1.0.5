/**
 * Demo-Seite für die Zentrale Formular-Tabelle
 * 
 * Diese Seite demonstriert alle Features der zentralen Formular-Tabelle
 * und bietet eine vollständige Übersicht über alle Formulare und Eingabemasken.
 */

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Tabs,
  Tab,
  Chip,
  Alert,
  Divider
} from '@mui/material';
import {
  TableChart as TableIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { CentralFormTable } from '../components/forms/CentralFormTable';
import { CentralFormTableService, FormTableEntry, FormStatus, PermissionLevel } from '../services/CentralFormTable';

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
      id={`form-table-tabpanel-${index}`}
      aria-labelledby={`form-table-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const CentralFormTableDemo: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [formTableService] = useState(() => CentralFormTableService.getInstance());

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatistics = () => {
    return formTableService.getTableStatistics();
  };

  const getModuleBreakdown = () => {
    const stats = getStatistics();
    return stats.byModule || {};
  };

  const getStatusBreakdown = () => {
    const stats = getStatistics();
    return stats.byStatus || {};
  };

  const getComplexityBreakdown = () => {
    const stats = getStatistics();
    return stats.byComplexity || {};
  };

  return (
    <Container maxWidth="xl" className="py-8">
      <Typography variant="h3" component="h1" gutterBottom>
        Zentrale Formular-Tabelle Demo
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Vollständig indexierte Übersicht aller Formulare und Eingabemasken mit Versionsnummern und Berechtigungen
      </Typography>

      {/* Übersicht-Karten */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="primary">
                    {getStatistics().total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Gesamt Formulare
                  </Typography>
                </Box>
                <TableIcon color="primary" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="success.main">
                    {getStatusBreakdown().active || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Aktive Formulare
                  </Typography>
                </Box>
                <AnalyticsIcon color="success" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="warning.main">
                    {getComplexityBreakdown().high || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Komplexe Formulare
                  </Typography>
                </Box>
                <SettingsIcon color="warning" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="info.main">
                    {getStatistics().averagePriority?.toFixed(1) || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ø Priorität
                  </Typography>
                </Box>
                <SecurityIcon color="info" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modul-Breakdown */}
      <Card className="mb-6">
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Verteilung nach Modulen
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(getModuleBreakdown()).map(([module, count]) => (
              <Grid item xs={6} md={3} key={module}>
                <Box textAlign="center" p={2} border={1} borderColor="divider" borderRadius={1}>
                  <Typography variant="h6" color="primary">
                    {count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" className="capitalize">
                    {module}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs für verschiedene Ansichten */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="Formular-Tabelle Ansichten">
            <Tab
              label="Vollständige Tabelle"
              icon={<TableIcon />}
              iconPosition="start"
            />
            <Tab
              label="Statistiken"
              icon={<AnalyticsIcon />}
              iconPosition="start"
            />
            <Tab
              label="Berechtigungen"
              icon={<SecurityIcon />}
              iconPosition="start"
            />
            <Tab
              label="Versionshistorie"
              icon={<HistoryIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <CentralFormTable />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <StatisticsView />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <PermissionsView />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <VersionHistoryView />
        </TabPanel>
      </Card>
    </Container>
  );
};

// Statistiken-Ansicht
const StatisticsView: React.FC = () => {
  const [formTableService] = useState(() => CentralFormTableService.getInstance());
  const stats = formTableService.getTableStatistics();

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Detaillierte Statistiken
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Status-Verteilung
              </Typography>
              {Object.entries(stats.byStatus || {}).map(([status, count]) => (
                <Box key={status} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Chip
                    label={status}
                    color={status === 'active' ? 'success' : status === 'draft' ? 'warning' : 'error'}
                    size="small"
                  />
                  <Typography variant="body2">{count}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Komplexitäts-Verteilung
              </Typography>
              {Object.entries(stats.byComplexity || {}).map(([complexity, count]) => (
                <Box key={complexity} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Chip
                    label={complexity}
                    color={complexity === 'low' ? 'success' : complexity === 'medium' ? 'warning' : 'error'}
                    size="small"
                  />
                  <Typography variant="body2">{count}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Versions-Verteilung
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(stats.versionDistribution || {}).map(([version, count]) => (
                  <Grid item xs={6} md={3} key={version}>
                    <Box textAlign="center" p={2} border={1} borderColor="divider" borderRadius={1}>
                      <Typography variant="h6" color="primary">
                        v{version}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {count} Formulare
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

// Berechtigungen-Ansicht
const PermissionsView: React.FC = () => {
  const [formTableService] = useState(() => CentralFormTableService.getInstance());
  const allEntries = formTableService.getAllFormEntries();

  const permissionStats = allEntries.reduce((acc, entry) => {
    acc.admin += entry.permissions.admin.length;
    acc.write += entry.permissions.write.length;
    acc.read += entry.permissions.read.length;
    return acc;
  }, { admin: 0, write: 0, read: 0 });

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Berechtigungs-Übersicht
      </Typography>

      <Alert severity="info" className="mb-4">
        Diese Ansicht zeigt die Gesamtverteilung der Berechtigungen über alle Formulare.
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Admin-Berechtigungen
              </Typography>
              <Typography variant="h4" color="error">
                {permissionStats.admin}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gesamt Admin-Berechtigungen
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Write-Berechtigungen
              </Typography>
              <Typography variant="h4" color="warning.main">
                {permissionStats.write}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gesamt Write-Berechtigungen
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Read-Berechtigungen
              </Typography>
              <Typography variant="h4" color="success.main">
                {permissionStats.read}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gesamt Read-Berechtigungen
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Formulare mit spezifischen Berechtigungen
              </Typography>
              <Grid container spacing={2}>
                {allEntries.slice(0, 10).map((entry) => (
                  <Grid item xs={12} md={6} key={entry.id}>
                    <Box p={2} border={1} borderColor="divider" borderRadius={1}>
                      <Typography variant="body2" fontWeight="medium">
                        {entry.title}
                      </Typography>
                      <Box display="flex" gap={1} mt={1}>
                        <Chip label={`Admin: ${entry.permissions.admin.length}`} color="error" size="small" />
                        <Chip label={`Write: ${entry.permissions.write.length}`} color="warning" size="small" />
                        <Chip label={`Read: ${entry.permissions.read.length}`} color="success" size="small" />
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

// Versionshistorie-Ansicht
const VersionHistoryView: React.FC = () => {
  const [formTableService] = useState(() => CentralFormTableService.getInstance());
  const allEntries = formTableService.getAllFormEntries();

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Versionshistorie
      </Typography>

      <Alert severity="info" className="mb-4">
        Diese Ansicht zeigt die Versionshistorie aller Formulare.
      </Alert>

      <Grid container spacing={2}>
        {allEntries.slice(0, 20).map((entry) => (
          <Grid item xs={12} md={6} key={entry.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {entry.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {entry.description}
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Chip label={`v${entry.version}`} color="primary" size="small" />
                  <Chip label={entry.module} color="secondary" size="small" />
                  <Chip label={entry.status} color="success" size="small" />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  <strong>Versionshistorie:</strong> {entry.versionHistory.join(', ')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Letzte Änderung:</strong> {entry.lastModified.toLocaleDateString('de-DE')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Geändert von:</strong> {entry.modifiedBy}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default CentralFormTableDemo; 