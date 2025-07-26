import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper
} from '@mui/material';
import {
  Info as InfoIcon,
  Schema as SchemaIcon,
  Palette as PaletteIcon,
  Code as CodeIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useDualMCPMetadata, useDualMCPForm, useDualMCPTable, useDualMCPData, useDualMCPComponent } from '../hooks/useDualMCP';

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
      id={`dual-mcp-tabpanel-${index}`}
      aria-labelledby={`dual-mcp-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * Dual MCP Beispiel-Komponente
 * Demonstriert die Kombination von Schema- und UI-Metadata-MCP-Servern
 */
export const DualMCPExample: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedTable, setSelectedTable] = useState('invoices');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box className="p-6">
      <Typography variant="h4" className="mb-6 flex items-center">
        <CodeIcon className="mr-3" />
        Dual MCP Integration - VALEO NeuroERP
      </Typography>

      {/* Erklärung */}
      <Card className="mb-6">
        <CardContent>
          <Typography variant="h6" className="flex items-center mb-3">
            <InfoIcon className="mr-2" />
            Dual MCP Architektur
          </Typography>
          <Typography variant="body2" color="textSecondary" className="mb-4">
            Diese Komponente demonstriert die Kombination von zwei MCP-Servern:
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" className="flex items-center mb-2">
                    <SchemaIcon className="mr-2" color="primary" />
                    MCP #1: Schema-Server
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    • Tabellen- und Spaltennamen<br/>
                    • Datentypen und Constraints<br/>
                    • Foreign-Key-Beziehungen<br/>
                    • RLS-Regeln<br/>
                    • Trigger und Policies
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" className="flex items-center mb-2">
                    <PaletteIcon className="mr-2" color="secondary" />
                    MCP #2: UI-Metadata-Server
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    • UI-Komponententypen<br/>
                    • Label und Tooltips<br/>
                    • Feld-Reihenfolge<br/>
                    • Validierungsregeln<br/>
                    • Layout-Konfiguration
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabellen-Auswahl */}
      <Card className="mb-6">
        <CardContent>
          <Typography variant="h6" className="mb-3">
            Tabelle auswählen:
          </Typography>
          <Box className="flex space-x-2">
            {['invoices', 'customers', 'assets'].map((table) => (
              <Button
                key={table}
                variant={selectedTable === table ? 'contained' : 'outlined'}
                onClick={() => setSelectedTable(table)}
                startIcon={selectedTable === table ? <CheckCircleIcon /> : undefined}
              >
                {table.charAt(0).toUpperCase() + table.slice(1)}
              </Button>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Tabs für verschiedene Ansichten */}
      <Paper className="mb-6">
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="Dual MCP Tabs">
          <Tab label="Metadaten" icon={<InfoIcon />} />
          <Tab label="Formular" icon={<CodeIcon />} />
          <Tab label="Tabelle" icon={<CodeIcon />} />
          <Tab label="Daten" icon={<CodeIcon />} />
          <Tab label="Code-Generierung" icon={<CodeIcon />} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <TabPanel value={tabValue} index={0}>
        <MetadataView tableName={selectedTable} />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <FormView tableName={selectedTable} />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <TableView tableName={selectedTable} />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <DataView tableName={selectedTable} />
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <CodeGenerationView tableName={selectedTable} />
      </TabPanel>
    </Box>
  );
};

// Metadaten-Ansicht
const MetadataView: React.FC<{ tableName: string }> = ({ tableName }) => {
  const { schema, uiMetadata, combined, loading, error, refetch } = useDualMCPMetadata(tableName);

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-64">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" className="mb-4">
        <Typography variant="subtitle2" className="mb-2">
          Fehler beim Laden der Metadaten:
        </Typography>
        {error}
      </Alert>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Schema-Informationen */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" className="flex items-center mb-3">
              <SchemaIcon className="mr-2" color="primary" />
              Schema-Informationen (MCP #1)
            </Typography>
            
            {schema ? (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2">
                    Tabelle: {schema.table_name}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {schema.columns.map((column) => (
                      <ListItem key={column.name}>
                        <ListItemIcon>
                          {column.is_primary_key ? <CheckCircleIcon color="primary" /> : 
                           column.is_foreign_key ? <WarningIcon color="warning" /> : 
                           <InfoIcon color="action" />}
                        </ListItemIcon>
                        <ListItemText
                          primary={column.name}
                          secondary={`${column.type}${column.not_null ? ' (NOT NULL)' : ''}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            ) : (
              <Alert severity="warning">
                Keine Schema-Informationen verfügbar
              </Alert>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* UI-Metadata-Informationen */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" className="flex items-center mb-3">
              <PaletteIcon className="mr-2" color="secondary" />
              UI-Metadata (MCP #2)
            </Typography>
            
            {uiMetadata ? (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2">
                    UI-Konfiguration: {uiMetadata.table_name}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {uiMetadata.table && (
                    <Box className="mb-4">
                      <Typography variant="subtitle2" className="mb-2">
                        Tabellen-Konfiguration:
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary="Display Name"
                            secondary={uiMetadata.table.display_name}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Beschreibung"
                            secondary={uiMetadata.table.description}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Aktionen"
                            secondary={uiMetadata.table.actions.join(', ')}
                          />
                        </ListItem>
                      </List>
                    </Box>
                  )}
                  
                  {uiMetadata.form && (
                    <Box>
                      <Typography variant="subtitle2" className="mb-2">
                        Formular-Konfiguration:
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary="Layout"
                            secondary={uiMetadata.form.layout}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Validierung"
                            secondary={uiMetadata.form.validation_mode}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Auto-Save"
                            secondary={uiMetadata.form.auto_save ? 'Aktiviert' : 'Deaktiviert'}
                          />
                        </ListItem>
                      </List>
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            ) : (
              <Alert severity="warning">
                Keine UI-Metadata verfügbar
              </Alert>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Kombinierte Metadaten */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" className="flex items-center mb-3">
              <CodeIcon className="mr-2" color="success" />
              Kombinierte Metadaten
            </Typography>
            
            {combined?.enhanced_fields ? (
              <Box>
                <Typography variant="subtitle2" className="mb-2">
                  Erweiterte Felder ({combined.enhanced_fields.length}):
                </Typography>
                <Grid container spacing={2}>
                  {combined.enhanced_fields.map((field: any) => (
                    <Grid item xs={12} sm={6} md={4} key={field.name}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" className="mb-1">
                            {field.label}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" className="block mb-1">
                            {field.name} ({field.type})
                          </Typography>
                          <Box className="flex flex-wrap gap-1">
                            <Chip
                              label={field.ui_component}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                            {field.required && (
                              <Chip
                                label="Required"
                                size="small"
                                color="error"
                                variant="outlined"
                              />
                            )}
                            {field.readonly && (
                              <Chip
                                label="Readonly"
                                size="small"
                                color="warning"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ) : (
              <Alert severity="info">
                Keine kombinierten Metadaten verfügbar
              </Alert>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Formular-Ansicht
const FormView: React.FC<{ tableName: string }> = ({ tableName }) => {
  const { enhancedFields, loading, error } = useDualMCPForm(tableName);

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-64">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" className="mb-4">
          Generiertes Formular für {tableName}
        </Typography>
        
        <Typography variant="body2" color="textSecondary" className="mb-4">
          Dieses Formular wurde automatisch basierend auf Schema und UI-Metadata generiert.
        </Typography>

        <Box className="bg-gray-50 p-4 rounded-lg">
          <Typography variant="subtitle2" className="mb-2">
            Verfügbare Felder ({enhancedFields.length}):
          </Typography>
          <Grid container spacing={2}>
            {enhancedFields.map((field) => (
              <Grid item xs={12} sm={6} md={4} key={field.field_name}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2">
                      {field.label}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {field.field_name} - {field.ui_component}
                    </Typography>
                    {field.tooltip && (
                      <Typography variant="caption" className="block mt-1">
                        💡 {field.tooltip}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

// Tabellen-Ansicht
const TableView: React.FC<{ tableName: string }> = ({ tableName }) => {
  const { tableMetadata, enhancedFields, loading, error } = useDualMCPTable(tableName);

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-64">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" className="mb-4">
          Generierte Tabelle für {tableName}
        </Typography>
        
        {tableMetadata ? (
          <Box>
            <Typography variant="subtitle1" className="mb-2">
              {tableMetadata.display_name}
            </Typography>
            <Typography variant="body2" color="textSecondary" className="mb-4">
              {tableMetadata.description}
            </Typography>
            
            <Box className="flex flex-wrap gap-2 mb-4">
              {tableMetadata.actions.map((action: string) => (
                <Chip
                  key={action}
                  label={action}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
            
            <Typography variant="subtitle2" className="mb-2">
              Tabellen-Konfiguration:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="Seitengröße"
                  secondary={tableMetadata.page_size}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Suche"
                  secondary={tableMetadata.enable_search ? 'Aktiviert' : 'Deaktiviert'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Filter"
                  secondary={tableMetadata.enable_filter ? 'Aktiviert' : 'Deaktiviert'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Pagination"
                  secondary={tableMetadata.enable_pagination ? 'Aktiviert' : 'Deaktiviert'}
                />
              </ListItem>
            </List>
          </Box>
        ) : (
          <Alert severity="warning">
            Keine Tabellen-Metadata verfügbar
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

// Daten-Ansicht
const DataView: React.FC<{ tableName: string }> = ({ tableName }) => {
  const { data, loading, error, refetch } = useDualMCPData(tableName);

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-64">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box className="flex justify-between items-center mb-4">
          <Typography variant="h6">
            Daten für {tableName}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refetch}
          >
            Aktualisieren
          </Button>
        </Box>
        
        {data && data.length > 0 ? (
          <Box>
            <Typography variant="subtitle2" className="mb-2">
              {data.length} Einträge gefunden:
            </Typography>
            <Box className="max-h-96 overflow-y-auto">
              {data.slice(0, 5).map((item: any, index: number) => (
                <Card key={index} variant="outlined" className="mb-2">
                  <CardContent>
                    <Typography variant="subtitle2" className="mb-1">
                      Eintrag {index + 1}
                    </Typography>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(item, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              ))}
              {data.length > 5 && (
                <Typography variant="caption" color="textSecondary">
                  ... und {data.length - 5} weitere Einträge
                </Typography>
              )}
            </Box>
          </Box>
        ) : (
          <Alert severity="info">
            Keine Daten verfügbar
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

// Code-Generierung-Ansicht
const CodeGenerationView: React.FC<{ tableName: string }> = ({ tableName }) => {
  const { formComponent, tableComponent, loading, error, regenerate } = useDualMCPComponent(tableName);

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-64">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box className="flex justify-between items-center mb-4">
          <Typography variant="h6">
            Automatisch generierter Code für {tableName}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={regenerate}
          >
            Neu generieren
          </Button>
        </Box>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" className="mb-3">
              Formular-Komponente
            </Typography>
            <Box className="bg-gray-900 text-green-400 p-4 rounded-lg max-h-96 overflow-y-auto">
              <pre className="text-xs">
                {formComponent || '// Kein Code verfügbar'}
              </pre>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" className="mb-3">
              Tabellen-Komponente
            </Typography>
            <Box className="bg-gray-900 text-green-400 p-4 rounded-lg max-h-96 overflow-y-auto">
              <pre className="text-xs">
                {tableComponent || '// Kein Code verfügbar'}
              </pre>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default DualMCPExample; 