/**
 * Dual MCP Client für VALEO NeuroERP
 * Kombiniert Schema- und UI-Metadata-Server für optimale Komponenten-Generierung
 */

import { z } from 'zod';

// MCP Server URLs
const SCHEMA_MCP_URL = 'http://localhost:8000';
const UI_METADATA_MCP_URL = 'http://localhost:8001';

// TypeScript Interfaces für UI-Metadata
export interface UIFieldMetadata {
  field_name: string;
  ui_component: 'text' | 'select' | 'date' | 'number' | 'textarea' | 'checkbox' | 'radio' | 'email' | 'password' | 'url' | 'tel';
  label: string;
  placeholder?: string;
  tooltip?: string;
  order: number;
  required: boolean;
  readonly: boolean;
  hidden: boolean;
  group?: string;
  validation_rules?: Record<string, any>;
  options?: Array<{ value: string; label: string; color?: string; [key: string]: any }>;
  min_value?: number;
  max_value?: number;
  step?: number;
  rows?: number;
  max_length?: number;
  pattern?: string;
  icon?: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
}

export interface UITableMetadata {
  table_name: string;
  display_name: string;
  description: string;
  icon: string;
  color: string;
  fields: UIFieldMetadata[];
  actions: string[];
  default_sort?: string;
  default_order?: string;
  page_size: number;
  enable_search: boolean;
  enable_filter: boolean;
  enable_pagination: boolean;
  enable_export: boolean;
  enable_bulk_actions: boolean;
  custom_columns?: Array<Record<string, any>>;
}

export interface UIFormMetadata {
  form_name: string;
  display_name: string;
  description: string;
  layout: 'vertical' | 'horizontal' | 'grid' | 'tabs' | 'accordion';
  groups?: Array<{
    name: string;
    label: string;
    icon: string;
    collapsible: boolean;
  }>;
  submit_button_text: string;
  cancel_button_text: string;
  show_progress: boolean;
  auto_save: boolean;
  validation_mode: 'onSubmit' | 'onChange' | 'onBlur';
  fields: UIFieldMetadata[];
}

export interface CompleteMetadata {
  table_name: string;
  has_table: boolean;
  has_form: boolean;
  table?: UITableMetadata;
  form?: UIFormMetadata;
}

// Schema Interfaces (from existing MCP server)
export interface MCPSchema {
  table_name: string;
  columns: Array<{
    name: string;
    type: string;
    not_null: boolean;
    default_value?: string;
    is_primary_key: boolean;
    is_foreign_key: boolean;
    foreign_table?: string;
    foreign_column?: string;
    check_constraints?: string[];
    enum_values?: string[];
  }>;
  foreign_keys: Array<{
    column: string;
    foreign_table: string;
    foreign_column: string;
  }>;
  rls_policies: Array<{
    name: string;
    operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
    definition: string;
  }>;
}

/**
 * Dual MCP Client - Kombiniert Schema und UI-Metadata
 */
export class DualMCPClient {
  private schemaUrl: string;
  private uiMetadataUrl: string;

  constructor(
    schemaUrl: string = SCHEMA_MCP_URL,
    uiMetadataUrl: string = UI_METADATA_MCP_URL
  ) {
    this.schemaUrl = schemaUrl;
    this.uiMetadataUrl = uiMetadataUrl;
  }

  /**
   * Gesundheitscheck für beide Server
   */
  async checkHealth(): Promise<{ schema: boolean; uiMetadata: boolean }> {
    try {
      const [schemaHealth, uiHealth] = await Promise.allSettled([
        fetch(`${this.schemaUrl}/health`),
        fetch(`${this.uiMetadataUrl}/health`)
      ]);

      return {
        schema: schemaHealth.status === 'fulfilled' && schemaHealth.value.ok,
        uiMetadata: uiHealth.status === 'fulfilled' && uiHealth.value.ok
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return { schema: false, uiMetadata: false };
    }
  }

  /**
   * Schema von Schema-MCP-Server abrufen
   */
  async getSchema(tableName: string): Promise<MCPSchema | null> {
    try {
      const response = await fetch(`${this.schemaUrl}/api/schema/${tableName}`);
      if (!response.ok) {
        throw new Error(`Schema request failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error(`Error fetching schema for ${tableName}:`, error);
      return null;
    }
  }

  /**
   * UI-Metadata von UI-Metadata-MCP-Server abrufen
   */
  async getUIMetadata(tableName: string): Promise<CompleteMetadata | null> {
    try {
      const response = await fetch(`${this.uiMetadataUrl}/api/ui/complete/${tableName}`);
      if (!response.ok) {
        throw new Error(`UI metadata request failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error(`Error fetching UI metadata for ${tableName}:`, error);
      return null;
    }
  }

  /**
   * Kombinierte Metadaten abrufen (Schema + UI)
   */
  async getCombinedMetadata(tableName: string): Promise<{
    schema: MCPSchema | null;
    uiMetadata: CompleteMetadata | null;
    combined: any;
  }> {
    try {
      const [schema, uiMetadata] = await Promise.all([
        this.getSchema(tableName),
        this.getUIMetadata(tableName)
      ]);

      // Kombiniere Schema und UI-Metadata
      const combined = this.combineMetadata(schema, uiMetadata);

      return {
        schema,
        uiMetadata,
        combined
      };
    } catch (error) {
      console.error(`Error fetching combined metadata for ${tableName}:`, error);
      return {
        schema: null,
        uiMetadata: null,
        combined: null
      };
    }
  }

  /**
   * Kombiniere Schema und UI-Metadata zu einer optimierten Struktur
   */
  private combineMetadata(schema: MCPSchema | null, uiMetadata: CompleteMetadata | null): any {
    if (!schema && !uiMetadata) {
      return null;
    }

    const combined: any = {
      table_name: schema?.table_name || uiMetadata?.table_name,
      schema: schema,
      ui: uiMetadata,
      enhanced_fields: []
    };

    if (schema && uiMetadata?.form) {
      // Erstelle erweiterte Felder mit Schema + UI-Informationen
      combined.enhanced_fields = schema.columns.map(column => {
        const uiField = uiMetadata.form?.fields.find(f => f.field_name === column.name);
        
        return {
          // Schema-Informationen
          name: column.name,
          type: column.type,
          not_null: column.not_null,
          default_value: column.default_value,
          is_primary_key: column.is_primary_key,
          is_foreign_key: column.is_foreign_key,
          foreign_table: column.foreign_table,
          foreign_column: column.foreign_column,
          enum_values: column.enum_values,
          
          // UI-Informationen
          ui_component: uiField?.ui_component || this.inferUIComponent(column),
          label: uiField?.label || this.generateLabel(column.name),
          placeholder: uiField?.placeholder,
          tooltip: uiField?.tooltip,
          order: uiField?.order || 999,
          required: uiField?.required ?? column.not_null,
          readonly: uiField?.readonly ?? column.is_primary_key,
          hidden: uiField?.hidden ?? false,
          group: uiField?.group,
          validation_rules: uiField?.validation_rules || this.generateValidationRules(column),
          options: uiField?.options || this.generateOptions(column),
          icon: uiField?.icon,
          color: uiField?.color,
          size: uiField?.size
        };
      }).sort((a, b) => a.order - b.order);
    }

    return combined;
  }

  /**
   * UI-Komponente basierend auf Schema-Typ ableiten
   */
  private inferUIComponent(column: any): string {
    const type = column.type.toLowerCase();
    
    if (type.includes('enum')) return 'select';
    if (type.includes('date') || type.includes('timestamp')) return 'date';
    if (type.includes('int') || type.includes('numeric') || type.includes('decimal')) return 'number';
    if (type.includes('text') || type.includes('varchar')) {
      if (column.name.toLowerCase().includes('email')) return 'email';
      if (column.name.toLowerCase().includes('password')) return 'password';
      if (column.name.toLowerCase().includes('url')) return 'url';
      if (column.name.toLowerCase().includes('phone')) return 'tel';
      return 'text';
    }
    if (type.includes('boolean')) return 'checkbox';
    
    return 'text';
  }

  /**
   * Label aus Feldname generieren
   */
  private generateLabel(fieldName: string): string {
    return fieldName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Validierungsregeln basierend auf Schema generieren
   */
  private generateValidationRules(column: any): Record<string, any> {
    const rules: Record<string, any> = {};
    
    if (column.not_null) {
      rules.required = true;
    }
    
    if (column.type.includes('email')) {
      rules.email = true;
    }
    
    if (column.type.includes('uuid')) {
      rules.uuid = true;
    }
    
    if (column.type.includes('int') || column.type.includes('numeric')) {
      rules.number = true;
      if (column.type.includes('positive')) {
        rules.positive = true;
      }
    }
    
    return rules;
  }

  /**
   * Optionen für Select-Felder generieren
   */
  private generateOptions(column: any): Array<{ value: string; label: string }> {
    if (column.enum_values) {
      return column.enum_values.map((value: string) => ({
        value,
        label: this.generateLabel(value)
      }));
    }
    
    return [];
  }

  /**
   * Zod-Schema basierend auf kombinierten Metadaten generieren
   */
  generateZodSchema(combinedMetadata: any): z.ZodSchema {
    if (!combinedMetadata?.enhanced_fields) {
      return z.object({});
    }

    const schemaObject: Record<string, z.ZodTypeAny> = {};

    combinedMetadata.enhanced_fields.forEach((field: any) => {
      let zodType: z.ZodTypeAny;

      // Basis-Typ basierend auf Schema
      switch (field.type.toLowerCase()) {
        case 'uuid':
          zodType = z.string().uuid();
          break;
        case 'email':
          zodType = z.string().email();
          break;
        case 'int':
        case 'integer':
        case 'bigint':
          zodType = z.number().int();
          break;
        case 'numeric':
        case 'decimal':
        case 'real':
        case 'double precision':
          zodType = z.number();
          break;
        case 'boolean':
          zodType = z.boolean();
          break;
        case 'date':
        case 'timestamp':
        case 'timestamptz':
          zodType = z.string(); // Für Formulare als String
          break;
        default:
          zodType = z.string();
      }

      // Validierungsregeln anwenden
      if (field.validation_rules) {
        if (field.validation_rules.required && zodType instanceof z.ZodString) {
          zodType = zodType.min(1, `${field.label} ist erforderlich`);
        }
        if (field.validation_rules.email && zodType instanceof z.ZodString) {
          zodType = zodType.email('Ungültige E-Mail-Adresse');
        }
        if (field.validation_rules.positive && zodType instanceof z.ZodNumber) {
          zodType = zodType.positive('Wert muss positiv sein');
        }
        if (field.validation_rules.number && zodType instanceof z.ZodNumber) {
          if (field.validation_rules.min !== undefined) {
            zodType = zodType.min(field.validation_rules.min);
          }
          if (field.validation_rules.max !== undefined) {
            zodType = (zodType as any).max(field.validation_rules.max);
          }
        }
        if (field.validation_rules.max_length && zodType instanceof z.ZodString) {
          zodType = zodType.max(field.validation_rules.max_length);
        }
        if (field.validation_rules.pattern && zodType instanceof z.ZodString) {
          zodType = zodType.regex(new RegExp(field.validation_rules.pattern));
        }
      }

      // Enum-Werte anwenden
      if (field.enum_values && field.enum_values.length > 0) {
        zodType = z.enum(field.enum_values as [string, ...string[]]);
      }

      schemaObject[field.name] = zodType;
    });

    return z.object(schemaObject);
  }

  /**
   * React-Komponenten-Code basierend auf kombinierten Metadaten generieren
   */
  generateReactComponent(combinedMetadata: any, componentType: 'form' | 'table'): string {
    if (!combinedMetadata) {
      return '// Keine Metadaten verfügbar';
    }

    const tableName = combinedMetadata.table_name;
    const uiMetadata = combinedMetadata.ui;
    
    if (componentType === 'form' && uiMetadata?.form) {
      return this.generateFormComponent(combinedMetadata);
    } else if (componentType === 'table' && uiMetadata?.table) {
      return this.generateTableComponent(combinedMetadata);
    }

    return '// Komponente nicht verfügbar';
  }

  /**
   * Formular-Komponente generieren
   */
  private generateFormComponent(combinedMetadata: any): string {
    const form = combinedMetadata.ui.form;
    const fields = combinedMetadata.enhanced_fields;
    
    let code = `import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  Grid,
  InputAdornment
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

// Zod Schema
const ${combinedMetadata.table_name}Schema = z.object({
${fields.map((field: any) => `  ${field.name}: z.${this.getZodTypeString(field)}`).join(',\n')}
});

type ${combinedMetadata.table_name}FormData = z.infer<typeof ${combinedMetadata.table_name}Schema>;

interface ${combinedMetadata.table_name}FormProps {
  initialData?: Partial<${combinedMetadata.table_name}FormData>;
  onSubmit: (data: ${combinedMetadata.table_name}FormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const ${combinedMetadata.table_name}Form: React.FC<${combinedMetadata.table_name}FormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const form = useForm<${combinedMetadata.table_name}FormData>({
    resolver: zodResolver(${combinedMetadata.table_name}Schema),
    defaultValues: {
${fields.map((field: any) => `      ${field.name}: initialData?.${field.name} || ${this.getDefaultValue(field)}`).join(',\n')}
    }
  });

  const handleSubmit = async (data: ${combinedMetadata.table_name}FormData) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <Typography variant="h5">
          ${form.display_name}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          ${form.description}
        </Typography>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <Grid container spacing={2}>
`;

    // Felder generieren
    fields.forEach((field: any) => {
      if (field.hidden) return;
      
      code += `            <Grid item xs={12} sm={6}>
              <Controller
                name="${field.name}"
                control={form.control}
                render={({ field: formField }) => (
                  <TextField
                    {...formField}
                    fullWidth
                    label="${field.label}${field.required ? ' *' : ''}"
                    placeholder="${field.placeholder || ''}"
                    ${field.readonly ? 'disabled' : ''}
                    ${field.type.includes('number') ? 'type="number"' : ''}
                    ${field.type.includes('date') ? 'type="date"' : ''}
                    ${field.max_length ? `inputProps={{ maxLength: ${field.max_length} }}` : ''}
                    ${field.min_value !== undefined ? `inputProps={{ min: ${field.min_value} }}` : ''}
                    ${field.max_value !== undefined ? `inputProps={{ max: ${field.max_value} }}` : ''}
                    ${field.step ? `inputProps={{ step: ${field.step} }}` : ''}
                    error={!!form.formState.errors.${field.name}}
                    helperText={form.formState.errors.${field.name}?.message}
                  />
                )}
              />
            </Grid>
`;
    });

    code += `          </Grid>
          
          <Box className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={isLoading}
              startIcon={<CancelIcon />}
            >
              ${form.cancel_button_text}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {isLoading ? 'Speichere...' : '${form.submit_button_text}'}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default ${combinedMetadata.table_name}Form;
`;

    return code;
  }

  /**
   * Tabellen-Komponente generieren
   */
  private generateTableComponent(combinedMetadata: any): string {
    const table = combinedMetadata.ui.table;
    const fields = combinedMetadata.enhanced_fields;
    
    let code = `import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

interface ${combinedMetadata.table_name} {
${fields.map((field: any) => `  ${field.name}: ${this.getTypeScriptType(field)}`).join(';\n')}
}

interface ${combinedMetadata.table_name}TableProps {
  data: ${combinedMetadata.table_name}[];
  loading?: boolean;
  error?: string | null;
  onAdd?: () => void;
  onEdit?: (item: ${combinedMetadata.table_name}) => void;
  onDelete?: (id: string) => void;
  onRefresh?: () => void;
}

export const ${combinedMetadata.table_name}Table: React.FC<${combinedMetadata.table_name}TableProps> = ({
  data,
  loading = false,
  error = null,
  onAdd,
  onEdit,
  onDelete,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Card>
      <CardContent>
        <Box className="flex justify-between items-center mb-4">
          <Typography variant="h6">
            ${table.display_name} (0)
          </Typography>
          <Box className="flex space-x-2">
            <TextField
              size="small"
              placeholder="Suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            ${table.actions.includes('create') ? `
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAdd}
            >
              Hinzufügen
            </Button>` : ''}
            <IconButton onClick={onRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
`;

    // Tabellen-Header generieren
    fields.forEach((field: any) => {
      if (!field.hidden) {
        code += `                <TableCell>${field.label}</TableCell>
`;
      }
    });

    code += `                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={${fields.filter((f: any) => !f.hidden).length + 1}} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={${fields.filter((f: any) => !f.hidden).length + 1}} align="center">
                    Keine Daten verfügbar
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item: any) => (
                  <TableRow key={item.id}>
`;

    // Tabellen-Zellen generieren
    fields.forEach((field: any) => {
      if (!field.hidden) {
        if (field.ui_component === 'select' && field.options) {
          code += `                    <TableCell>
                      <Chip
                        label={\`${field.options[0]?.label || 'N/A'}\`}
                        color="${field.options[0]?.color || 'default'}"
                        size="small"
                      />
                    </TableCell>
`;
        } else {
          code += `                    <TableCell>{item[field.name]}</TableCell>
`;
        }
      }
    });

    code += `                    <TableCell>
                      <Box className="flex space-x-1">
                        ${table.actions.includes('update') ? `
                        <IconButton
                          size="small"
                          onClick={() => onEdit?.(item)}
                        >
                          <EditIcon />
                        </IconButton>` : ''}
                        ${table.actions.includes('delete') ? `
                        <IconButton
                          size="small"
                          onClick={() => onDelete?.(item.id)}
                        >
                          <DeleteIcon />
                        </IconButton>` : ''}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default \`\${combinedMetadata.table_name}Table\`;
`;

    return code;
  }

  /**
   * Hilfsmethoden für Code-Generierung
   */
  private getZodTypeString(field: any): string {
    if (field.enum_values && field.enum_values.length > 0) {
      const enumValues = field.enum_values.map((v: string) => `'${v}'`).join(', ');
      return `enum([${enumValues}])`;
    }
    
    switch (field.type.toLowerCase()) {
      case 'uuid': return 'string().uuid()';
      case 'email': return 'string().email()';
      case 'int':
      case 'integer':
      case 'bigint': return 'number().int()';
      case 'numeric':
      case 'decimal':
      case 'real': return 'number()';
      case 'boolean': return 'boolean()';
      case 'date':
      case 'timestamp': return 'string()';
      default: return 'string()';
    }
  }

  private getTypeScriptType(field: any): string {
    if (field.enum_values && field.enum_values.length > 0) {
      return `'${field.enum_values.join("' | '")}'`;
    }
    
    switch (field.type.toLowerCase()) {
      case 'uuid':
      case 'email':
      case 'text':
      case 'varchar':
      case 'date':
      case 'timestamp': return 'string';
      case 'int':
      case 'integer':
      case 'bigint':
      case 'numeric':
      case 'decimal':
      case 'real': return 'number';
      case 'boolean': return 'boolean';
      default: return 'string';
    }
  }

  private getDefaultValue(field: any): string {
    if (field.default_value) {
      return `'${field.default_value}'`;
    }
    
    switch (field.type.toLowerCase()) {
      case 'boolean': return 'false';
      case 'int':
      case 'integer':
      case 'bigint':
      case 'numeric':
      case 'decimal':
      case 'real': return '0';
      default: return "''";
    }
  }
}

// Singleton-Instanz
export const dualMCPClient = new DualMCPClient();

// Export für direkte Verwendung
export default dualMCPClient; 