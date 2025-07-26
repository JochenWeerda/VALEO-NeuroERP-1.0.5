import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

// MCP Integration Imports
import { getMCPSchemaInjector } from '../utils/mcpSchemaInjector';
import { useMCPForm, useMCPTable } from '../hooks/useMCPForm';

/**
 * Test-Komponente für MCP-Integration
 * Zeigt die Verbindung zum MCP-Server und Supabase-Schema
 */
export const TestMCPIntegration: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schemaData, setSchemaData] = useState<any>(null);
  const [tables, setTables] = useState<any[]>([]);

  // MCP Hooks testen
  const mcpForm = useMCPForm({
    tableName: 'invoices',
    autoValidate: true,
    onSchemaLoad: (schema) => {
      console.log('✅ MCP Form Schema geladen:', schema);
      setSchemaData(schema);
    },
    onError: (error) => {
      console.error('❌ MCP Form Fehler:', error);
      setError(error.message);
    }
  });

  const mcpTable = useMCPTable('invoices');

  // MCP Services
  const mcpInjector = getMCPSchemaInjector();

  /**
   * MCP-Server-Verbindung testen
   */
  const testMCPConnection = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔄 MCP-Server-Verbindung testen...');
      
      // Health-Check
      const healthResponse = await fetch('http://localhost:8000/api/health');
      if (!healthResponse.ok) {
        throw new Error(`Health-Check fehlgeschlagen: ${healthResponse.status}`);
      }
      
      const healthData = await healthResponse.json();
      console.log('✅ Health-Check erfolgreich:', healthData);

      // Tabellen auflisten
      const tablesResponse = await fetch('http://localhost:8000/api/tables');
      if (!tablesResponse.ok) {
        throw new Error(`Tabellen-Abruf fehlgeschlagen: ${tablesResponse.status}`);
      }
      
      const tablesData = await tablesResponse.json();
      setTables(tablesData.tables || []);
      console.log('✅ Tabellen erfolgreich geladen:', tablesData);

      // Schema für invoices abrufen
      const schemaResponse = await fetch('http://localhost:8000/api/schema/invoices');
      if (!schemaResponse.ok) {
        throw new Error(`Schema-Abruf fehlgeschlagen: ${schemaResponse.status}`);
      }
      
      const schemaData = await schemaResponse.json();
      setSchemaData(schemaData);
      console.log('✅ Schema erfolgreich geladen:', schemaData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler';
      setError(errorMessage);
      console.error('❌ MCP-Verbindungstest fehlgeschlagen:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Schema für spezifische Tabelle abrufen
   */
  const loadTableSchema = async (tableName: string) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log(`🔄 Schema für Tabelle ${tableName} laden...`);
      
      const schema = await mcpInjector.getTableSchema(tableName);
      setSchemaData(schema);
      
      console.log(`✅ Schema für ${tableName} erfolgreich geladen:`, schema);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler';
      setError(errorMessage);
      console.error(`❌ Schema-Laden für ${tableName} fehlgeschlagen:`, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cache leeren
   */
  const clearCache = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔄 Cache leeren...');
      
      const response = await fetch('http://localhost:8000/api/cache/clear', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Cache-Löschen fehlgeschlagen: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Cache erfolgreich geleert:', result);

      // Cache-Status anzeigen
      const cacheStatus = mcpInjector.getCacheStatus();
      console.log('📊 Cache-Status:', cacheStatus);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler';
      setError(errorMessage);
      console.error('❌ Cache-Löschen fehlgeschlagen:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Automatischer Test beim Laden
  useEffect(() => {
    testMCPConnection();
  }, []);

  return (
    <Box className="p-6 space-y-6">
      <Typography variant="h4" className="text-gray-800 mb-6">
        🧪 MCP-Integration Test
      </Typography>

      {/* Status-Anzeige */}
      <Card className="mb-6">
        <CardContent>
          <Typography variant="h6" className="mb-4">
            📊 MCP-Server Status
          </Typography>
          
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={testMCPConnection}
              disabled={isLoading}
            >
              {isLoading ? 'Teste...' : 'Verbindung testen'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={clearCache}
              disabled={isLoading}
            >
              Cache leeren
            </Button>
          </div>

          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}

          {isLoading && (
            <Box className="flex items-center space-x-2">
              <CircularProgress size={20} />
              <Typography>Lade...</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Verfügbare Tabellen */}
      {tables.length > 0 && (
        <Card className="mb-6">
          <CardContent>
            <Typography variant="h6" className="mb-4">
              📋 Verfügbare Tabellen
            </Typography>
            
            <List>
              {tables.map((table, index) => (
                <React.Fragment key={table.name}>
                  <ListItem 
                    button 
                    onClick={() => loadTableSchema(table.name)}
                    disabled={isLoading}
                  >
                    <ListItemText
                      primary={table.name}
                      secondary={`${table.description} (${table.columns} Spalten)`}
                    />
                  </ListItem>
                  {index < tables.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Schema-Anzeige */}
      {schemaData && (
        <Card className="mb-6">
          <CardContent>
            <Typography variant="h6" className="mb-4">
              🗄️ Schema: {schemaData.table}
            </Typography>
            
            <div className="space-y-4">
              {/* RLS-Informationen */}
              <div>
                <Typography variant="subtitle1" className="font-semibold mb-2">
                  🔒 RLS-Richtlinien
                </Typography>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>SELECT: {schemaData.rls.select ? '✅' : '❌'}</div>
                  <div>INSERT: {schemaData.rls.insert ? '✅' : '❌'}</div>
                  <div>UPDATE: {schemaData.rls.update ? '✅' : '❌'}</div>
                  <div>DELETE: {schemaData.rls.delete ? '✅' : '❌'}</div>
                </div>
              </div>

              {/* Spalten-Informationen */}
              <div>
                <Typography variant="subtitle1" className="font-semibold mb-2">
                  📊 Spalten
                </Typography>
                <div className="space-y-2">
                  {schemaData.columns.map((column: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{column.name}</span>
                        <span className="text-gray-500 ml-2">({column.type})</span>
                      </div>
                      <div className="flex space-x-2">
                        {column.primary && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">PK</span>}
                        {column.not_null && <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">NOT NULL</span>}
                        {column.foreign_key && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">FK</span>}
                        {column.enum_values && <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">ENUM</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Foreign Key Beziehungen */}
              {schemaData.columns.some((col: any) => col.foreign_key) && (
                <div>
                  <Typography variant="subtitle1" className="font-semibold mb-2">
                    🔗 Foreign Key Beziehungen
                  </Typography>
                  <div className="space-y-1">
                    {schemaData.columns
                      .filter((col: any) => col.foreign_key)
                      .map((col: any, index: number) => (
                        <div key={index} className="text-sm text-gray-600">
                          <code>{col.name}</code> → <code>{col.foreign_key}</code>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* MCP Hooks Status */}
      <Card className="mb-6">
        <CardContent>
          <Typography variant="h6" className="mb-4">
            🎣 MCP Hooks Status
          </Typography>
          
          <div className="space-y-4">
            {/* useMCPForm Status */}
            <div>
              <Typography variant="subtitle1" className="font-semibold">
                useMCPForm (invoices)
              </Typography>
              <div className="text-sm text-gray-600">
                <div>Schema geladen: {mcpForm.schema ? '✅' : '❌'}</div>
                <div>Loading: {mcpForm.isLoading ? '🔄' : '✅'}</div>
                <div>Error: {mcpForm.error ? mcpForm.error.message : 'Keine'}</div>
              </div>
            </div>

            {/* useMCPTable Status */}
            <div>
              <Typography variant="subtitle1" className="font-semibold">
                useMCPTable (invoices)
              </Typography>
              <div className="text-sm text-gray-600">
                <div>Schema geladen: {mcpTable.schema ? '✅' : '❌'}</div>
                <div>Loading: {mcpTable.isLoading ? '🔄' : '✅'}</div>
                <div>Error: {mcpTable.error ? mcpTable.error.message : 'Keine'}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug-Informationen */}
      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-4">
            🐛 Debug-Informationen
          </Typography>
          
          <div className="space-y-2 text-sm">
            <div>MCP Server URL: http://localhost:8000</div>
            <div>Supabase URL: https://ftybxxndembbfjdkcsuk.supabase.co</div>
            <div>Cache Status: {JSON.stringify(mcpInjector.getCacheStatus())}</div>
          </div>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TestMCPIntegration; 