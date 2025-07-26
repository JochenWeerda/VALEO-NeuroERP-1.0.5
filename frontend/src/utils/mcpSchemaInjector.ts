import { z } from 'zod';

// MCP Schema Response Types
const MCPColumnSchema = z.object({
  name: z.string(),
  type: z.string(),
  primary: z.boolean().optional(),
  foreign_key: z.string().optional(),
  not_null: z.boolean().optional(),
  default: z.string().optional(),
  enum_values: z.array(z.string()).optional(),
  check: z.string().optional(),
});

const MCPRLSSchema = z.object({
  select: z.boolean(),
  insert: z.boolean(),
  update: z.boolean(),
  delete: z.boolean(),
});

const MCPSchemaResponse = z.object({
  table: z.string(),
  columns: z.array(MCPColumnSchema),
  rls: MCPRLSSchema,
  indexes: z.array(z.object({
    name: z.string(),
    columns: z.array(z.string()),
    unique: z.boolean().optional(),
  })).optional(),
  triggers: z.array(z.object({
    name: z.string(),
    event: z.string(),
    function: z.string(),
  })).optional(),
});

export type MCPSchema = z.infer<typeof MCPSchemaResponse>;

interface MCPConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
}

class MCPSchemaInjector {
  private config: MCPConfig;
  private cache: Map<string, { schema: MCPSchema; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 Minuten

  constructor(config: MCPConfig) {
    this.config = {
      baseUrl: config.baseUrl || 'http://mcp.localhost',
      timeout: config.timeout || 10000,
      ...config,
    };
  }

  /**
   * Holt das aktuelle Schema für eine Tabelle vom MCP-Server
   */
  async getTableSchema(tableName: string): Promise<MCPSchema> {
    const cacheKey = tableName;
    const cached = this.cache.get(cacheKey);
    
    // Cache-Check
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`📋 MCP Schema Cache Hit für Tabelle: ${tableName}`);
      return cached.schema;
    }

    try {
      console.log(`🔄 MCP Schema Request für Tabelle: ${tableName}`);
      
      const response = await fetch(`${this.config.baseUrl}/api/schema/${tableName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
        },
        signal: AbortSignal.timeout(this.config.timeout!),
      });

      if (!response.ok) {
        throw new Error(`MCP Schema Request failed: ${response.status} ${response.statusText}`);
      }

      const rawData = await response.json();
      const schema = MCPSchemaResponse.parse(rawData);
      
      // Cache speichern
      this.cache.set(cacheKey, { schema, timestamp: Date.now() });
      
      console.log(`✅ MCP Schema erfolgreich geladen für Tabelle: ${tableName}`);
      return schema;
    } catch (error) {
      console.error(`❌ MCP Schema Request fehlgeschlagen für Tabelle: ${tableName}`, error);
      throw new Error(`Schema konnte nicht geladen werden: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    }
  }

  /**
   * Generiert einen strukturierten Prompt-Kontext für Cursor
   */
  async generateCursorPrompt(tableName: string): Promise<string> {
    const schema = await this.getTableSchema(tableName);
    
    return `## 🎯 SUPABASE SCHEMA CONTEXT (Live via MCP)

### Aktuelle Tabelle: \`${schema.table}\`

### Schema-Details:
\`\`\`json
${JSON.stringify(schema, null, 2)}
\`\`\`

### RLS-Richtlinien:
- **SELECT**: ${schema.rls.select ? '✅ Erlaubt' : '❌ Verboten'}
- **INSERT**: ${schema.rls.insert ? '✅ Erlaubt' : '❌ Verboten'}
- **UPDATE**: ${schema.rls.update ? '✅ Erlaubt' : '❌ Verboten'}
- **DELETE**: ${schema.rls.delete ? '✅ Erlaubt' : '❌ Verboten'}

### Foreign Key Beziehungen:
${schema.columns
  .filter(col => col.foreign_key)
  .map(col => `- \`${col.name}\` → \`${col.foreign_key}\``)
  .join('\n') || '- Keine Foreign Keys definiert'}

### Validierungsregeln:
${schema.columns
  .filter(col => col.not_null || col.check || col.enum_values)
  .map(col => {
    const rules = [];
    if (col.not_null) rules.push('NOT NULL');
    if (col.check) rules.push(`CHECK: ${col.check}`);
    if (col.enum_values) rules.push(`ENUM: [${col.enum_values.join(', ')}]`);
    return `- \`${col.name}\`: ${rules.join(', ')}`;
  })
  .join('\n') || '- Keine speziellen Validierungsregeln'}

### Schema-Timestamp: ${new Date().toISOString()}
### MCP-Server: ${this.config.baseUrl}

---
**HINWEIS:** Verwende ausschließlich die oben definierten Felder, Typen und Beziehungen. Erfinde KEINE zusätzlichen Felder oder Typen.`;
  }

  /**
   * Generiert TypeScript-Typen direkt aus dem Schema
   */
  generateTypeScriptTypes(schema: MCPSchema): string {
    const enumTypes = schema.columns
      .filter(col => col.enum_values && col.enum_values.length > 0)
      .map(col => {
        const enumName = `${col.name.charAt(0).toUpperCase() + col.name.slice(1)}Enum`;
        return `export const ${enumName} = z.enum([${col.enum_values!.map(v => `'${v}'`).join(', ')}]);
export type ${enumName.replace('Enum', '')} = z.infer<typeof ${enumName}>;`;
      })
      .join('\n\n');

    const interfaceFields = schema.columns
      .map(col => {
        let type = 'string';
        if (col.type === 'numeric' || col.type === 'integer') type = 'number';
        if (col.type === 'boolean') type = 'boolean';
        if (col.type === 'timestamp') type = 'string';
        if (col.enum_values) {
          const enumName = `${col.name.charAt(0).toUpperCase() + col.name.slice(1)}`;
          type = enumName;
        }
        
        const optional = !col.not_null && !col.primary ? '?' : '';
        return `  ${col.name}${optional}: ${type};`;
      })
      .join('\n');

    return `import { z } from 'zod';

${enumTypes}

export interface ${schema.table.charAt(0).toUpperCase() + schema.table.slice(1)} {
${interfaceFields}
}

export const ${schema.table.charAt(0).toUpperCase() + schema.table.slice(1)}Schema = z.object({
${schema.columns.map(col => {
  let zodType = 'z.string()';
  if (col.type === 'numeric' || col.type === 'integer') zodType = 'z.number()';
  if (col.type === 'boolean') zodType = 'z.boolean()';
  if (col.type === 'timestamp') zodType = 'z.string()';
  if (col.enum_values) {
    const enumName = `${col.name.charAt(0).toUpperCase() + col.name.slice(1)}Enum`;
    zodType = enumName;
  }
  
  if (col.not_null) zodType += '.min(1, "Feld ist erforderlich")';
  if (col.type === 'numeric') zodType += '.positive("Wert muss positiv sein")';
  
  return `  ${col.name}: ${zodType},`;
}).join('\n')}
});`;
  }

  /**
   * Generiert einen React Hook Form Hook basierend auf dem Schema
   */
  generateReactHookFormHook(schema: MCPSchema): string {
    const formFields = schema.columns
      .filter(col => !col.primary || col.type !== 'uuid') // Primary Keys ausschließen
      .map(col => {
        let fieldType = 'text';
        if (col.type === 'numeric' || col.type === 'integer') fieldType = 'number';
        if (col.type === 'boolean') fieldType = 'checkbox';
        if (col.type === 'timestamp') fieldType = 'datetime-local';
        
        return `  ${col.name}: {
    type: '${fieldType}',
    required: ${col.not_null || false},
    ${col.enum_values ? `options: [${col.enum_values.map(v => `'${v}'`).join(', ')}],` : ''}
  },`;
      })
      .join('\n');

    return `import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ${schema.table.charAt(0).toUpperCase() + schema.table.slice(1)}Schema } from '../types/${schema.table}';

export const use${schema.table.charAt(0).toUpperCase() + schema.table.slice(1)}Form = (defaultValues?: Partial<${schema.table.charAt(0).toUpperCase() + schema.table.slice(1)}>) => {
  return useForm({
    resolver: zodResolver(${schema.table.charAt(0).toUpperCase() + schema.table.slice(1)}Schema),
    defaultValues: {
${formFields}
      ...defaultValues,
    },
  });
};`;
  }

  /**
   * Cache leeren
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ MCP Schema Cache geleert');
  }

  /**
   * Cache-Status abrufen
   */
  getCacheStatus(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
}

// Singleton-Instanz
let mcpInjectorInstance: MCPSchemaInjector | null = null;

export const getMCPSchemaInjector = (config?: MCPConfig): MCPSchemaInjector => {
  if (!mcpInjectorInstance) {
    mcpInjectorInstance = new MCPSchemaInjector(config || { baseUrl: 'http://localhost:8000' });
  }
  return mcpInjectorInstance;
};

export default MCPSchemaInjector; 