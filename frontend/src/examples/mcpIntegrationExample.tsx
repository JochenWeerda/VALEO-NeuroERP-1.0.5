import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Code as CodeIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// MCP Integration Imports
import { getMCPSchemaInjector } from '../utils/mcpSchemaInjector';
import { getCursorComponentGenerator } from '../utils/cursorComponentGenerator';
import { getGENXAISIntegration } from '../utils/genxaisIntegration';
import { useMCPForm, useMCPTable, useMCPData } from '../hooks/useMCPForm';
import { CursorPromptGenerator } from '../utils/cursorPrompts';

/**
 * Beispiel-Komponente für MCP-Integration
 * Zeigt die vollständige Integration von MCP-Schema-Server mit Cursor
 */
export const MCPIntegrationExample: React.FC = () => {
  const [currentTable, setCurrentTable] = useState('invoices');
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState<string>('');

  // MCP Hooks
  const mcpForm = useMCPForm();

  const mcpTable = useMCPTable(currentTable);
  const mcpData = useMCPData(currentTable);

  // MCP Services
  const mcpInjector = getMCPSchemaInjector();
  const componentGenerator = getCursorComponentGenerator();
  const genxais = getGENXAISIntegration();

  /**
   * Beispiel 1: Einfacher Schema-Abruf
   */
  const handleLoadSchema = async () => {
    try {
      setIsGenerating(true);
      setWorkflowStatus('🔄 Schema wird geladen...');

      const schema = await mcpInjector.getTableSchema(currentTable);
      console.log('Schema geladen:', schema);

      setWorkflowStatus('✅ Schema erfolgreich geladen');
    } catch (error) {
      setWorkflowStatus(`❌ Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Beispiel 2: Cursor-Prompt generieren
   */
  const handleGeneratePrompt = async () => {
    try {
      setIsGenerating(true);
      setWorkflowStatus('🔄 Cursor-Prompt wird generiert...');

      const schema = await mcpInjector.getTableSchema(currentTable);
      const prompt = CursorPromptGenerator.generatePrompt(schema, 'form', {
        language: 'de',
        includeTests: true,
        includeDocumentation: true
      });

      setGeneratedPrompt(prompt);
      setWorkflowStatus('✅ Cursor-Prompt generiert');
    } catch (error) {
      setWorkflowStatus(`❌ Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Beispiel 3: Komponenten automatisch generieren
   */
  const handleGenerateComponents = async () => {
    try {
      setIsGenerating(true);
      setWorkflowStatus('🔄 Komponenten werden generiert...');

      const components = await componentGenerator.generateComponents({
        tableName: currentTable,
        componentType: 'both',
        includeTests: true,
        includeDocumentation: true,
        language: 'de'
      });

      console.log('Generierte Komponenten:', components);
      setWorkflowStatus('✅ Komponenten erfolgreich generiert');
    } catch (error) {
      setWorkflowStatus(`❌ Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Beispiel 4: Vollständiger GENXAIS-Workflow
   */
  const handleFullWorkflow = async () => {
    try {
      setIsGenerating(true);
      setWorkflowStatus('🚀 GENXAIS Workflow gestartet...');

      const result = await genxais.executeFullWorkflow(currentTable, {
        componentType: 'both',
        includeTests: true,
        includeDocumentation: true,
        language: 'de'
      });

      console.log('GENXAIS Workflow Ergebnis:', result);
      setWorkflowStatus('🎉 GENXAIS Workflow erfolgreich abgeschlossen');
    } catch (error) {
      setWorkflowStatus(`❌ Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Beispiel 5: MCP-Formular verwenden
   */
  const handleFormSubmit = async (data: any) => {
    try {
      console.log('Formular-Daten:', data);
      
      // Hier würde die eigentliche API-Integration stattfinden
      const result = await mcpData.createData(data);
      
      setWorkflowStatus('✅ Daten erfolgreich erstellt');
    } catch (error) {
      setWorkflowStatus(`❌ Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    }
  };

  return (
    <Box className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Box className="text-center">
        <Typography variant="h4" component="h1" className="font-bold text-gray-800 mb-2">
          MCP-Schema-Integration Demo
        </Typography>
        <Typography variant="body1" className="text-gray-600">
          Live-Demo der MCP-Schema-Integration mit Cursor und GENXAIS
        </Typography>
      </Box>

      {/* Status */}
      {workflowStatus && (
        <Alert severity={workflowStatus.includes('❌') ? 'error' : 'info'} className="mb-4">
          {workflowStatus}
        </Alert>
      )}

      {/* Konfiguration */}
      <Card>
        <CardHeader
          title="Konfiguration"
          subheader="Wähle eine Tabelle und führe verschiedene MCP-Operationen aus"
        />
        <CardContent className="space-y-4">
          <FormControl fullWidth>
            <InputLabel>Tabelle auswählen</InputLabel>
            <Select
              value={currentTable}
              onChange={(e) => setCurrentTable(e.target.value)}
              label="Tabelle auswählen"
            >
              <MenuItem value="invoices">invoices</MenuItem>
              <MenuItem value="customers">customers</MenuItem>
              <MenuItem value="products">products</MenuItem>
              <MenuItem value="orders">orders</MenuItem>
            </Select>
          </FormControl>

          <Box className="flex flex-wrap gap-2">
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleLoadSchema}
              disabled={isGenerating}
            >
              Schema laden
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<CodeIcon />}
              onClick={handleGeneratePrompt}
              disabled={isGenerating}
            >
              Cursor-Prompt generieren
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleGenerateComponents}
              disabled={isGenerating}
            >
              Komponenten generieren
            </Button>
            
            <Button
              variant="contained"
              startIcon={<PlayIcon />}
              onClick={handleFullWorkflow}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              GENXAIS Workflow
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Schema-Info */}
      {mcpTable.schema && (
        <Card>
          <CardHeader
            title="Schema-Informationen"
            subheader={`Tabelle: ${mcpTable.schema.table}`}
          />
          <CardContent>
            <Grid container spacing={2}>
              {/* Spalten */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Spalten
                </Typography>
                <List dense>
                  {mcpTable.schema.columns.map((col) => (
                    <ListItem key={col.name}>
                      <ListItemText
                        primary={col.name}
                        secondary={`${col.type}${col.not_null ? ' (required)' : ''}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>

              {/* RLS */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Row Level Security
                </Typography>
                <List dense>
                  {Object.entries(mcpTable.schema.rls).map(([operation, allowed]) => (
                    <ListItem key={operation}>
                      <ListItemText
                        primary={operation}
                        secondary={allowed ? 'Erlaubt' : 'Nicht erlaubt'}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Formular */}
      {mcpTable.schema && !mcpTable.isLoading && (
        <Card>
          <CardHeader
            title="Dynamisches Formular"
            subheader="Generiert basierend auf dem Schema"
          />
          <CardContent>
            <form onSubmit={mcpForm.handleSubmit(handleFormSubmit)} className="space-y-4">
              <Grid container spacing={2}>
                {mcpTable.schema.columns
                  .filter(col => !col.primary)
                  .map((col) => (
                    <Grid item xs={12} sm={6} key={col.name}>
                      <TextField
                        label={col.name}
                        type={getFieldType(col.type)}
                        fullWidth
                        required={col.not_null}
                        disabled={mcpForm.formState.isSubmitting}
                      />
                    </Grid>
                  ))}
              </Grid>
              
              <Box className="flex gap-2">
                <Button
                  type="submit"
                  variant="contained"
                  disabled={mcpForm.formState.isSubmitting}
                >
                  Speichern
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => mcpForm.reset()}
                  disabled={mcpForm.formState.isSubmitting}
                >
                  Zurücksetzen
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Fehler */}
      {mcpForm.formState.errors && Object.keys(mcpForm.formState.errors).length > 0 && (
        <Alert severity="error" className="mb-4">
          <Typography variant="h6">Formular-Fehler</Typography>
          <Typography variant="body2">{JSON.stringify(mcpForm.formState.errors, null, 2)}</Typography>
        </Alert>
      )}

      {/* MCP-Tabelle Demo */}
      {mcpTable.schema && !mcpTable.isLoading && (
        <Card>
          <CardHeader
            title="MCP-Tabelle Demo"
            subheader="Live-Tabelle basierend auf MCP-Schema"
          />
          <CardContent>
            <Box className="space-y-4">
              <Box className="flex justify-between items-center">
                <Typography variant="body1">
                  Sichtbare Spalten: {mcpTable.getVisibleColumns().length}
                </Typography>
                <Typography variant="body1">
                  Editierbare Spalten: {mcpTable.getEditableColumns().length}
                </Typography>
                <Typography variant="body1">
                  Löschen erlaubt: {mcpTable.canDelete() ? 'Ja' : 'Nein'}
                </Typography>
              </Box>
              
              <Divider />
              
              <Box>
                <Typography variant="h6" className="font-semibold mb-2">
                  Sichtbare Spalten
                </Typography>
                <Box className="flex flex-wrap gap-2">
                  {mcpTable.getVisibleColumns().map((col) => (
                    <Chip
                      key={col.name}
                      label={col.name}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Generierter Cursor-Prompt */}
      {generatedPrompt && (
        <Card>
          <CardHeader
            title="Generierter Cursor-Prompt"
            subheader="Prompt für Cursor AI zur Komponenten-Generierung"
            action={
              <Button
                size="small"
                onClick={() => navigator.clipboard.writeText(generatedPrompt)}
              >
                Kopieren
              </Button>
            }
          />
          <CardContent>
            <Box className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap">
                {generatedPrompt}
              </pre>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isGenerating && (
        <Box className="flex justify-center items-center py-8">
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {mcpForm.formState.errors && Object.keys(mcpForm.formState.errors).length > 0 && (
        <Alert severity="error">
          <Typography variant="h6">Schema-Fehler</Typography>
          <Typography variant="body2">{JSON.stringify(mcpForm.formState.errors, null, 2)}</Typography>
        </Alert>
      )}
    </Box>
  );
};

/**
 * Helper-Funktion für Feld-Typen
 */
function getFieldType(columnType: string): string {
  switch (columnType) {
    case 'numeric':
    case 'integer':
      return 'number';
    case 'boolean':
      return 'checkbox';
    case 'timestamp':
      return 'datetime-local';
    default:
      return 'text';
  }
}

export default MCPIntegrationExample; 