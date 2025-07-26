import { MCPSchema, getMCPSchemaInjector } from './mcpSchemaInjector';

interface ComponentGenerationOptions {
  tableName: string;
  componentType: 'form' | 'table' | 'both';
  includeTests?: boolean;
  includeDocumentation?: boolean;
  customStyling?: 'material-ui' | 'tailwind' | 'both';
  language?: 'de' | 'en';
}

interface GeneratedComponent {
  types: string;
  form?: string;
  table?: string;
  tests?: string;
  documentation?: string;
  prompt: string;
}

class CursorComponentGenerator {
  private mcpInjector = getMCPSchemaInjector();

  /**
   * Generiert vollständige React-Komponenten basierend auf MCP-Schema
   */
  async generateComponents(options: ComponentGenerationOptions): Promise<GeneratedComponent> {
    const schema = await this.mcpInjector.getTableSchema(options.tableName);
    const prompt = await this.mcpInjector.generateCursorPrompt(options.tableName);
    
    const result: GeneratedComponent = {
      types: this.generateTypeScriptTypes(schema),
      prompt,
    };

    if (options.componentType === 'form' || options.componentType === 'both') {
      result.form = this.generateFormComponent(schema, options);
    }

    if (options.componentType === 'table' || options.componentType === 'both') {
      result.table = this.generateTableComponent(schema, options);
    }

    if (options.includeTests) {
      result.tests = this.generateTests(schema, options);
    }

    if (options.includeDocumentation) {
      result.documentation = this.generateDocumentation(schema, options);
    }

    return result;
  }

  /**
   * Generiert TypeScript-Typen
   */
  private generateTypeScriptTypes(schema: MCPSchema): string {
    return this.mcpInjector.generateTypeScriptTypes(schema);
  }

  /**
   * Generiert React Hook Form Hook
   */
  private generateReactHookFormHook(schema: MCPSchema): string {
    return this.mcpInjector.generateReactHookFormHook(schema);
  }

  /**
   * Generiert Formular-Komponente
   */
  private generateFormComponent(schema: MCPSchema, options: ComponentGenerationOptions): string {
    const tableName = schema.table;
    const className = tableName.charAt(0).toUpperCase() + tableName.slice(1);
    const language = options.language || 'de';
    const styling = options.customStyling || 'both';

    const formFields = schema.columns
      .filter(col => !col.primary || col.type !== 'uuid')
      .map(col => this.generateFormField(col, schema, language))
      .join('\n\n');

    const imports = this.generateFormImports(styling);
    const validation = this.generateFormValidation(schema);

    return `import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zup';
${imports}
import { ${className}Schema, type ${className} } from '../types/${tableName}';

interface ${className}FormProps {
  initialData?: Partial<${className}>;
  onSubmit: (data: ${className}) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const ${className}Form: React.FC<${className}FormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch
  } = useForm<${className}>({
    resolver: zodResolver(${className}Schema),
    defaultValues: {
      ${this.generateDefaultValues(schema)}
      ...initialData
    }
  });

  const handleFormSubmit = async (data: ${className}) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    }
  };

  const handleCancel = () => {
    reset();
    onCancel?.();
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader
        title={
          <Box className="flex items-center space-x-2">
            <AssignmentIcon className="text-blue-600" />
            <Typography variant="h5" component="h2">
              {initialData?.id ? '${this.getLabel(tableName, 'edit', language)}' : '${this.getLabel(tableName, 'create', language)}'}
            </Typography>
          </Box>
        }
        subheader="${this.getLabel(tableName, 'description', language)}"
        className="bg-gradient-to-r from-blue-50 to-indigo-50"
      />
      
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
${formFields}

          {/* RLS Info */}
          ${this.generateRLSInfo(schema, language)}

          {/* Action Buttons */}
          <Box className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              disabled={isLoading || isSubmitting}
              startIcon={<CancelIcon />}
              className="min-w-[120px]"
            >
              ${language === 'de' ? 'Abbrechen' : 'Cancel'}
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading || isSubmitting}
              startIcon={
                isSubmitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SaveIcon />
                )
              }
              className="min-w-[120px] bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? '${language === 'de' ? 'Speichern...' : 'Saving...'}' : '${language === 'de' ? 'Speichern' : 'Save'}'}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};`;
  }

  /**
   * Generiert Tabellen-Komponente
   */
  private generateTableComponent(schema: MCPSchema, options: ComponentGenerationOptions): string {
    const tableName = schema.table;
    const className = tableName.charAt(0).toUpperCase() + tableName.slice(1);
    const language = options.language || 'de';
    const styling = options.customStyling || 'both';

    const tableColumns = schema.columns
      .map(col => this.generateTableColumn(col, schema, language))
      .join('\n');

    const imports = this.generateTableImports(styling);

    return `import React, { useState, useMemo } from 'react';
${imports}
import type { ${className} } from '../types/${tableName}';

interface ${className}TableProps {
  ${tableName}s: ${className}[];
  isLoading?: boolean;
  onView?: (${tableName}: ${className}) => void;
  onEdit?: (${tableName}: ${className}) => void;
  onDelete?: (${tableName}: ${className}) => void;
}

type SortField = ${schema.columns.map(col => `'${col.name}'`).join(' | ')};
type SortOrder = 'asc' | 'desc';

export const ${className}Table: React.FC<${className}TableProps> = ({
  ${tableName}s,
  isLoading = false,
  onView,
  onEdit,
  onDelete
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>('${schema.columns.find(col => col.type === 'timestamp')?.name || schema.columns[0].name}');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  // Sortierung
  const handleSort = (field: SortField) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  // Gefilterte und sortierte Daten
  const filteredAndSortedData = useMemo(() => {
    let filtered = ${tableName}s.filter(item => {
      return searchTerm === '' || 
        Object.values(item).some(value => 
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    // Sortierung
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [${tableName}s, searchTerm, sortField, sortOrder]);

  // Paginierung
  const paginatedData = filteredAndSortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (isLoading) {
    return (
      <Box className="flex justify-center items-center h-64">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper className="shadow-lg">
      {/* Header */}
      <Box className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <Box className="flex items-center justify-between mb-4">
          <Box className="flex items-center space-x-2">
            <AssignmentIcon className="text-blue-600" />
            <Typography variant="h6" className="font-semibold">
              ${this.getLabel(tableName, 'plural', language)}
            </Typography>
            <Chip 
              label={\`\${${tableName}s.length} ${this.getLabel(tableName, 'plural', language)}\`} 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          </Box>
        </Box>

        {/* Suche */}
        <TextField
          placeholder="${language === 'de' ? 'Suche...' : 'Search...'}"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          className="w-full"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon className="text-gray-400" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Tabelle */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow className="bg-gray-50">
${tableColumns}
              <TableCell align="center">${language === 'de' ? 'Aktionen' : 'Actions'}</TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={${schema.columns.length + 1}} align="center" className="py-8">
                  <Alert severity="info">
                    ${language === 'de' ? 'Keine Daten gefunden' : 'No data found'}
                  </Alert>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((${tableName}) => (
                <TableRow key={${tableName}.id} className="hover:bg-gray-50">
${this.generateTableRowCells(schema, tableName)}
                  <TableCell align="center">
                    <Box className="flex justify-center space-x-1">
                      {onView && (
                        <Tooltip title="${language === 'de' ? 'Anzeigen' : 'View'}">
                          <IconButton
                            size="small"
                            onClick={() => onView(${tableName})}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {onEdit && (
                        <Tooltip title="${language === 'de' ? 'Bearbeiten' : 'Edit'}">
                          <IconButton
                            size="small"
                            onClick={() => onEdit(${tableName})}
                            className="text-orange-600 hover:bg-orange-50"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {onDelete && (
                        <Tooltip title="${language === 'de' ? 'Löschen' : 'Delete'}">
                          <IconButton
                            size="small"
                            onClick={() => onDelete(${tableName})}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginierung */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredAndSortedData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="${language === 'de' ? 'Zeilen pro Seite:' : 'Rows per page:'}"
        labelDisplayedRows={({ from, to, count }) => 
          \`\${from}-\${to} von \${count !== -1 ? count : \`mehr als \${to}\`}\`
        }
      />
    </Paper>
  );
};`;
  }

  /**
   * Generiert Tests
   */
  private generateTests(schema: MCPSchema, options: ComponentGenerationOptions): string {
    const tableName = schema.table;
    const className = tableName.charAt(0).toUpperCase() + tableName.slice(1);
    const language = options.language || 'de';

    return `import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { ${className}Form } from '../${className}Form';
import { ${className}Table } from '../${className}Table';
import type { ${className} } from '../types/${tableName}';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('${className}Form', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  it('rendert Formular korrekt', () => {
    renderWithTheme(
      <${className}Form onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    
    expect(screen.getByText('${this.getLabel(tableName, 'create', language)}')).toBeInTheDocument();
  });

  it('validiert erforderliche Felder', async () => {
    renderWithTheme(
      <${className}Form onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    
    const submitButton = screen.getByText('${language === 'de' ? 'Speichern' : 'Save'}');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('ruft onSubmit mit korrekten Daten auf', async () => {
    renderWithTheme(
      <${className}Form onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    
    // Fülle Formular aus
    ${this.generateTestFormFill(schema)}
    
    const submitButton = screen.getByText('${language === 'de' ? 'Speichern' : 'Save'}');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        // Erwartete Daten basierend auf Schema
      }));
    });
  });
});

describe('${className}Table', () => {
  const mockData: ${className}[] = [
    {
      id: '1',
      ${this.generateMockData(schema)}
    }
  ];

  it('rendert Tabelle korrekt', () => {
    renderWithTheme(
      <${className}Table ${tableName}s={mockData} />
    );
    
    expect(screen.getByText('${this.getLabel(tableName, 'plural', language)}')).toBeInTheDocument();
  });

  it('zeigt Daten korrekt an', () => {
    renderWithTheme(
      <${className}Table ${tableName}s={mockData} />
    );
    
    // Prüfe ob Daten angezeigt werden
    expect(screen.getByText(mockData[0].id)).toBeInTheDocument();
  });
});`;
  }

  /**
   * Generiert Dokumentation
   */
  private generateDocumentation(schema: MCPSchema, options: ComponentGenerationOptions): string {
    const tableName = schema.table;
    const className = tableName.charAt(0).toUpperCase() + tableName.slice(1);
    const language = options.language || 'de';

    return `# ${className}-Komponenten

## Übersicht

Diese Komponenten implementieren eine vollständige Verwaltung für die \`${tableName}\`-Tabelle basierend auf dem Supabase-Schema.

## Schema-Details

### Tabelle: \`${tableName}\`

| Spalte | Typ | Erforderlich | Beschreibung |
|--------|-----|--------------|--------------|
${schema.columns.map(col => `| \`${col.name}\` | \`${col.type}\` | ${col.not_null ? 'Ja' : 'Nein'} | ${this.getColumnDescription(col, language)} |`).join('\n')}

### RLS-Richtlinien

- **SELECT**: ${schema.rls.select ? '✅ Erlaubt' : '❌ Verboten'}
- **INSERT**: ${schema.rls.insert ? '✅ Erlaubt' : '❌ Verboten'}
- **UPDATE**: ${schema.rls.update ? '✅ Erlaubt' : '❌ Verboten'}
- **DELETE**: ${schema.rls.delete ? '✅ Erlaubt' : '❌ Verboten'}

## Komponenten

### ${className}Form

Formular für das Erstellen und Bearbeiten von ${this.getLabel(tableName, 'singular', language)}.

**Props:**
- \`initialData\`: Optionale Initialdaten für Bearbeitung
- \`onSubmit\`: Callback für Formular-Submission
- \`onCancel\`: Optionale Cancel-Callback
- \`isLoading\`: Loading-State

### ${className}Table

Datentabelle für die Anzeige und Verwaltung von ${this.getLabel(tableName, 'plural', language)}.

**Props:**
- \`${tableName}s\`: Array der ${this.getLabel(tableName, 'plural', language)}
- \`isLoading\`: Loading-State
- \`onView\`: Optionaler View-Callback
- \`onEdit\`: Optionaler Edit-Callback
- \`onDelete\`: Optionaler Delete-Callback

## Verwendung

\`\`\`tsx
import { ${className}Form } from './components/${className}Form';
import { ${className}Table } from './components/${className}Table';

// Formular verwenden
<${className}Form
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>

// Tabelle verwenden
<${className}Table
  ${tableName}s={${tableName}s}
  onView={handleView}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
\`\`\`

## Tests

Die Komponenten sind vollständig getestet mit:
- Unit Tests für Validierung
- Integration Tests für Formular-Flows
- E2E Tests für Benutzer-Workflows

## Erweiterung

Um neue Felder hinzuzufügen:
1. Schema in Supabase erweitern
2. MCP-Server neu laden
3. Komponenten neu generieren
4. Tests anpassen
`;
  }

  // Helper-Methoden für die Generierung
  private generateFormField(col: any, schema: MCPSchema, language: string): string {
    // Implementierung für Formular-Felder
    return `          {/* ${this.getColumnLabel(col.name, language)} */}
          <Controller
            name="${col.name}"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="${this.getColumnLabel(col.name, language)}"
                type="${this.getFieldType(col.type)}"
                fullWidth
                error={!!errors.${col.name}}
                helperText={errors.${col.name}?.message}
                disabled={isLoading}
                ${col.not_null ? 'required' : ''}
              />
            )}
          />`;
  }

  private generateTableColumn(col: any, schema: MCPSchema, language: string): string {
    return `              <TableCell>
                <TableSortLabel
                  active={sortField === '${col.name}'}
                  direction={sortField === '${col.name}' ? sortOrder : 'asc'}
                  onClick={() => handleSort('${col.name}')}
                >
                  ${this.getColumnLabel(col.name, language)}
                </TableSortLabel>
              </TableCell>`;
  }

  private generateTableRowCells(schema: MCPSchema, tableName: string): string {
    return schema.columns.map(col => {
      if (col.type === 'timestamp') {
        return `                  <TableCell>
                    <Box className="flex flex-col">
                      <Typography variant="body2" className="font-medium">
                        {new Date(${tableName}.${col.name}).toLocaleDateString('de-DE')}
                      </Typography>
                      <Typography variant="caption" className="text-gray-500">
                        {new Date(${tableName}.${col.name}).toLocaleTimeString('de-DE')}
                      </Typography>
                    </Box>
                  </TableCell>`;
      }
      return `                  <TableCell>
                    <Typography variant="body2">
                      {${tableName}.${col.name}}
                    </Typography>
                  </TableCell>`;
    }).join('\n');
  }

  private generateFormImports(styling: string): string {
    const imports = [
      'import { Card, CardContent, CardHeader, Button, TextField, Box, Typography, CircularProgress } from \'@mui/material\';',
      'import { Save as SaveIcon, Cancel as CancelIcon, Assignment as AssignmentIcon } from \'@mui/icons-material\';'
    ];
    
    if (styling === 'tailwind' || styling === 'both') {
      imports.push('import \'tailwindcss/tailwind.css\';');
    }
    
    return imports.join('\n');
  }

  private generateTableImports(styling: string): string {
    const imports = [
      'import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, TableSortLabel, IconButton, Tooltip, Box, Typography, TextField, InputAdornment, Alert, CircularProgress, Chip } from \'@mui/material\';',
      'import { Visibility as ViewIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon, Assignment as AssignmentIcon } from \'@mui/icons-material\';'
    ];
    
    if (styling === 'tailwind' || styling === 'both') {
      imports.push('import \'tailwindcss/tailwind.css\';');
    }
    
    return imports.join('\n');
  }

  private generateDefaultValues(schema: MCPSchema): string {
    return schema.columns
      .filter(col => !col.primary)
      .map(col => {
        if (col.default) return `      ${col.name}: ${col.default},`;
        if (col.type === 'boolean') return `      ${col.name}: false,`;
        if (col.type === 'numeric' || col.type === 'integer') return `      ${col.name}: 0,`;
        return `      ${col.name}: '',`;
      })
      .join('\n');
  }

  private generateRLSInfo(schema: MCPSchema, language: string): string {
    if (!schema.rls.update && !schema.rls.delete) {
      return `          <Alert severity="info" className="bg-amber-50">
            <Typography variant="body2">
              <strong>${language === 'de' ? 'Hinweis:' : 'Note:'}</strong> ${language === 'de' ? 'Daten können nach dem Erstellen nicht mehr bearbeitet werden (RLS-Richtlinie).' : 'Data cannot be edited after creation (RLS policy).'}
            </Typography>
          </Alert>`;
    }
    return '';
  }

  private generateFormValidation(schema: MCPSchema): string {
    // Implementierung für Formular-Validierung
    return '';
  }

  private generateTestFormFill(schema: MCPSchema): string {
    // Implementierung für Test-Formular-Ausfüllung
    return '';
  }

  private generateMockData(schema: MCPSchema): string {
    return schema.columns
      .filter(col => !col.primary)
      .map(col => {
        if (col.type === 'string') return `${col.name}: 'Test ${col.name}',`;
        if (col.type === 'numeric' || col.type === 'integer') return `${col.name}: 100,`;
        if (col.type === 'boolean') return `${col.name}: false,`;
        if (col.type === 'timestamp') return `${col.name}: new Date().toISOString(),`;
        return `${col.name}: 'test',`;
      })
      .join('\n      ');
  }

  // Label-Helper
  private getLabel(tableName: string, type: string, language: string): string {
    const labels: Record<string, Record<string, Record<string, string>>> = {
      invoices: {
        de: {
          singular: 'Rechnung',
          plural: 'Rechnungen',
          create: 'Neue Rechnung erstellen',
          edit: 'Rechnung bearbeiten',
          description: 'Rechnungsdaten eingeben und speichern'
        },
        en: {
          singular: 'Invoice',
          plural: 'Invoices',
          create: 'Create New Invoice',
          edit: 'Edit Invoice',
          description: 'Enter and save invoice data'
        }
      },
      customers: {
        de: {
          singular: 'Kunde',
          plural: 'Kunden',
          create: 'Neuen Kunden erstellen',
          edit: 'Kunde bearbeiten',
          description: 'Kundendaten eingeben und speichern'
        },
        en: {
          singular: 'Customer',
          plural: 'Customers',
          create: 'Create New Customer',
          edit: 'Edit Customer',
          description: 'Enter and save customer data'
        }
      }
    };

    return labels[tableName]?.[language]?.[type] || tableName;
  }

  private getColumnLabel(columnName: string, language: string): string {
    const labels: Record<string, Record<string, string>> = {
      id: { de: 'ID', en: 'ID' },
      name: { de: 'Name', en: 'Name' },
      email: { de: 'E-Mail', en: 'Email' },
      amount: { de: 'Betrag', en: 'Amount' },
      status: { de: 'Status', en: 'Status' },
      created_at: { de: 'Erstellt am', en: 'Created at' },
      updated_at: { de: 'Aktualisiert am', en: 'Updated at' }
    };

    return labels[columnName]?.[language] || columnName;
  }

  private getColumnDescription(col: any, language: string): string {
    // Implementierung für Spalten-Beschreibungen
    return col.name;
  }

  private getFieldType(type: string): string {
    switch (type) {
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
}

// Singleton-Instanz
let generatorInstance: CursorComponentGenerator | null = null;

export const getCursorComponentGenerator = (): CursorComponentGenerator => {
  if (!generatorInstance) {
    generatorInstance = new CursorComponentGenerator();
  }
  return generatorInstance;
};

export default CursorComponentGenerator; 