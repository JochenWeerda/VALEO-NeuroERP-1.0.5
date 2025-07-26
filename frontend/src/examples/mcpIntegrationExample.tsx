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
  MenuItem
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
  const mcpForm = useMCPForm({
    tableName: currentTable,
    autoValidate: true,
    onSchemaLoad: (schema) => console.log('Schema geladen:', schema),
    onError: (error) => console.error('Schema Fehler:', error)
  });

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
      
      if (result.success) {
        setWorkflowStatus('✅ Daten erfolgreich erstellt');
      } else {
        setWorkflowStatus(`❌ Fehler beim Erstellen: ${result.error?.message}`);
      }
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
      {mcpForm.schema && (
        <Card>
          <CardHeader
            title="Schema-Informationen"
            subheader={`Tabelle: ${mcpForm.schema.table}`}
          />
          <CardContent>
            <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Box>
                <Typography variant="h6" className="font-semibold mb-2">
                  Spalten
                </Typography>
                <Box className="space-y-1">
                  {mcpForm.schema.columns.map((col) => (
                    <Chip
                      key={col.name}
                      label={`${col.name} (${col.type})`}
                      size="small"
                      variant="outlined"
                      color={col.primary ? 'primary' : 'default'}
                    />
                  ))}
                </Box>
              </Box>
              
              <Box>
                <Typography variant="h6" className="font-semibold mb-2">
                  RLS-Richtlinien
                </Typography>
                <Box className="space-y-1">
                  {Object.entries(mcpForm.schema.rls).map(([operation, allowed]) => (
                    <Chip
                      key={operation}
                      label={`${operation.toUpperCase()}: ${allowed ? '✅' : '❌'}`}
                      size="small"
                      color={allowed ? 'success' : 'error'}
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
              
              <Box>
                <Typography variant="h6" className="font-semibold mb-2">
                  Foreign Keys
                </Typography>
                <Box className="space-y-1">
                  {mcpForm.schema.columns
                    .filter(col => col.foreign_key)
                    .map((col) => (
                      <Chip
                        key={col.name}
                        label={`${col.name} → ${col.foreign_key}`}
                        size="small"
                        variant="outlined"
                        color="info"
                      />
                    ))}
                  {mcpForm.schema.columns.filter(col => col.foreign_key).length === 0 && (
                    <Typography variant="body2" className="text-gray-500">
                      Keine Foreign Keys
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* MCP-Formular Demo */}
      {mcpForm.schema && !mcpForm.isLoading && (
        <Card>
          <CardHeader
            title="MCP-Formular Demo"
            subheader="Live-Formular basierend auf MCP-Schema"
          />
          <CardContent>
            <form onSubmit={mcpForm.handleSubmit(handleFormSubmit)} className="space-y-4">
              {mcpForm.schema.columns
                .filter(col => !col.primary || col.type !== 'uuid')
                .map((col) => (
                  <TextField
                    key={col.name}
                    {...mcpForm.register(col.name as any)}
                    label={col.name}
                    type={getFieldType(col.type)}
                    fullWidth
                    error={!!mcpForm.formState.errors[col.name as any]}
                    helperText={mcpForm.formState.errors[col.name as any]?.message as string}
                    disabled={mcpForm.isLoading}
                    required={col.not_null}
                  />
                ))}
              
              <Box className="flex justify-end">
                <Button
                  type="submit"
                  variant="contained"
                  disabled={mcpForm.isLoading || mcpForm.formState.isSubmitting}
                  startIcon={
                    mcpForm.formState.isSubmitting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : undefined
                  }
                >
                  {mcpForm.formState.isSubmitting ? 'Speichern...' : 'Speichern'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
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
      {mcpForm.error && (
        <Alert severity="error">
          <Typography variant="h6">Schema-Fehler</Typography>
          <Typography variant="body2">{mcpForm.error.message}</Typography>
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