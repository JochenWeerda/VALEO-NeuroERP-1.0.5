import { useState, useEffect, useCallback } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getMCPSchemaInjector } from '../utils/mcpSchemaInjector';
import type { MCPSchema } from '../utils/mcpSchemaInjector';

interface UseMCPFormOptions {
  tableName: string;
  initialData?: any;
  onSchemaLoad?: (schema: MCPSchema) => void;
  onError?: (error: Error) => void;
  autoValidate?: boolean;
}

interface UseMCPFormReturn<T> extends UseFormReturn<T> {
  schema: MCPSchema | null;
  isLoading: boolean;
  error: Error | null;
  validationSchema: z.ZodSchema | null;
  refreshSchema: () => Promise<void>;
  validateField: (fieldName: string, value: any) => Promise<boolean>;
  getFieldValidation: (fieldName: string) => z.ZodSchema | null;
}

/**
 * React Hook für MCP-Schema-basierte Formulare
 * 
 * @example
 * ```tsx
 * const form = useMCPForm({
 *   tableName: 'invoices',
 *   initialData: { amount: 100 },
 *   onSchemaLoad: (schema) => console.log('Schema geladen:', schema)
 * });
 * 
 * return (
 *   <form onSubmit={form.handleSubmit(onSubmit)}>
 *     <input {...form.register('amount')} />
 *     {form.formState.errors.amount && (
 *       <span>{form.formState.errors.amount.message}</span>
 *     )}
 *   </form>
 * );
 * ```
 */
export function useMCPForm<T = any>(options: UseMCPFormOptions): UseMCPFormReturn<T> {
  const [schema, setSchema] = useState<MCPSchema | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [validationSchema, setValidationSchema] = useState<z.ZodSchema | null>(null);

  const mcpInjector = getMCPSchemaInjector();

  /**
   * Schema vom MCP-Server laden
   */
  const loadSchema = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log(`🔄 MCP Schema wird geladen für Tabelle: ${options.tableName}`);
      
      const loadedSchema = await mcpInjector.getTableSchema(options.tableName);
      setSchema(loadedSchema);

      // Zod-Schema aus MCP-Schema generieren
      const zodSchema = generateZodSchema(loadedSchema);
      setValidationSchema(zodSchema);

      options.onSchemaLoad?.(loadedSchema);
      
      console.log(`✅ MCP Schema erfolgreich geladen für Tabelle: ${options.tableName}`);

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unbekannter Fehler beim Laden des Schemas');
      setError(error);
      options.onError?.(error);
      console.error(`❌ MCP Schema Fehler für Tabelle: ${options.tableName}:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [options.tableName, options.onSchemaLoad, options.onError]);

  /**
   * Schema beim Mount laden
   */
  useEffect(() => {
    loadSchema();
  }, [loadSchema]);

  /**
   * React Hook Form mit MCP-Schema initialisieren
   */
  const form = useForm<T>({
    resolver: validationSchema ? zodResolver(validationSchema) as any : undefined,
    defaultValues: options.initialData || {},
    mode: options.autoValidate ? 'onChange' : 'onSubmit'
  });

  /**
   * Schema neu laden
   */
  const refreshSchema = useCallback(async () => {
    await loadSchema();
  }, [loadSchema]);

  /**
   * Einzelnes Feld validieren
   */
  const validateField = useCallback(async (fieldName: string, value: any): Promise<boolean> => {
    if (!validationSchema) return true;

    try {
      // Einfache Validierung für einzelne Felder
      const fieldSchema = getFieldSchema(validationSchema, fieldName);
      if (fieldSchema) {
        fieldSchema.parse(value);
        return true;
      }
      return true;
    } catch (err) {
      console.error(`Validierungsfehler für Feld ${fieldName}:`, err);
      return false;
    }
  }, [validationSchema]);

  /**
   * Validierungsschema für ein Feld abrufen
   */
  const getFieldValidation = useCallback((fieldName: string): z.ZodSchema | null => {
    if (!validationSchema) return null;
    
    try {
      const fieldSchema = getFieldSchema(validationSchema, fieldName);
      return fieldSchema || null;
    } catch {
      return null;
    }
  }, [validationSchema]);

  return {
    ...form,
    schema,
    isLoading,
    error,
    validationSchema,
    refreshSchema,
    validateField,
    getFieldValidation
  };
}

/**
 * Zod-Schema aus MCP-Schema generieren
 */
function generateZodSchema(schema: MCPSchema): z.ZodSchema {
  const schemaObject: Record<string, z.ZodTypeAny> = {};

  schema.columns.forEach(column => {
    let zodType: z.ZodTypeAny;

    // Basis-Typ basierend auf Spalten-Typ
    switch (column.type) {
      case 'numeric':
      case 'integer':
        zodType = z.number();
        break;
      case 'boolean':
        zodType = z.boolean();
        break;
      case 'timestamp':
        zodType = z.string();
        break;
      default:
        zodType = z.string();
    }

    // Enum-Werte hinzufügen
    if (column.enum_values && column.enum_values.length > 0) {
      zodType = z.enum(column.enum_values as [string, ...string[]]);
    }

    // Validierungsregeln hinzufügen
    if (column.not_null) {
      if (zodType instanceof z.ZodString) {
        zodType = zodType.min(1, `${column.name} ist erforderlich`);
      } else if (zodType instanceof z.ZodNumber) {
        zodType = zodType.min(0.01, `${column.name} ist erforderlich`);
      }
    }

    // Spezielle Validierungen
    if (column.type === 'numeric' && zodType instanceof z.ZodNumber) {
      zodType = zodType.positive(`${column.name} muss positiv sein`);
    }

    if (column.name === 'email' && zodType instanceof z.ZodString) {
      zodType = zodType.email(`Ungültige E-Mail-Adresse`);
    }

    if (column.name.includes('id') && zodType instanceof z.ZodString) {
      zodType = zodType.uuid(`Ungültige ${column.name} ID`);
    }

    schemaObject[column.name] = zodType;
  });

  return z.object(schemaObject);
}

/**
 * Feld-Schema aus einem Zod-Objekt extrahieren
 */
function getFieldSchema(schema: z.ZodSchema, fieldName: string): z.ZodTypeAny | null {
  try {
    if (schema instanceof z.ZodObject) {
      const shape = schema.shape;
      return shape[fieldName] || null;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * React Hook für MCP-Tabellen
 */
export function useMCPTable<T = any>(tableName: string) {
  const [schema, setSchema] = useState<MCPSchema | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const mcpInjector = getMCPSchemaInjector();

  useEffect(() => {
    const loadSchema = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const loadedSchema = await mcpInjector.getTableSchema(tableName);
        setSchema(loadedSchema);

      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unbekannter Fehler');
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSchema();
  }, [tableName]);

  const getVisibleColumns = useCallback(() => {
    if (!schema) return [];
    return schema.columns.filter(col => !col.primary || col.type !== 'uuid');
  }, [schema]);

  const getEditableColumns = useCallback(() => {
    if (!schema) return [];
    return schema.columns.filter(col => 
      !col.primary && 
      col.type !== 'uuid' && 
      !col.name.includes('created_at') && 
      !col.name.includes('updated_at')
    );
  }, [schema]);

  const canDelete = useCallback(() => {
    return schema?.rls.delete || false;
  }, [schema]);

  return {
    schema,
    isLoading,
    error,
    getVisibleColumns,
    getEditableColumns,
    canDelete
  };
}

/**
 * React Hook für MCP-Datenoperationen
 */
export function useMCPData<T = any>(tableName: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (options?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, any>;
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      // Mock-Daten für Demo-Zwecke
      const mockData = generateMockData(tableName);
      
      return {
        data: mockData,
        total: mockData.length,
        page: options?.page || 1,
        limit: options?.limit || 10
      };

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unbekannter Fehler');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [tableName]);

  const fetchById = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Mock-Daten für Demo-Zwecke
      const mockData = generateMockData(tableName);
      const item = mockData.find((item: any) => item.id === id);
      
      if (!item) {
        throw new Error('Element nicht gefunden');
      }

      return item;

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unbekannter Fehler');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [tableName]);

  const createData = useCallback(async (newData: Partial<T>) => {
    try {
      setIsLoading(true);
      setError(null);

      // Mock-Erstellung für Demo-Zwecke
      const createdItem = {
        id: `mock-${Date.now()}`,
        ...newData,
        created_at: new Date().toISOString()
      };

      return createdItem;

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unbekannter Fehler');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateData = useCallback(async (id: string, updateData: Partial<T>) => {
    try {
      setIsLoading(true);
      setError(null);

      // Mock-Update für Demo-Zwecke
      const updatedItem = {
        id,
        ...updateData,
        updated_at: new Date().toISOString()
      };

      return updatedItem;

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unbekannter Fehler');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteData = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Mock-Löschung für Demo-Zwecke
      console.log(`Mock-Löschung: ${id}`);

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unbekannter Fehler');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    fetchData,
    fetchById,
    createData,
    updateData,
    deleteData,
    isLoading,
    error
  };
}

/**
 * Mock-Daten generieren
 */
function generateMockData(tableName: string): any[] {
  switch (tableName) {
    case 'customers':
      return [
        { id: '1', name: 'Max Mustermann', email: 'max@example.com', type: 'individual' },
        { id: '2', name: 'Firma GmbH', email: 'info@firma.de', type: 'company' }
      ];
    case 'invoices':
      return [
        { 
          id: '1', 
          customer_id: '1', 
          amount: 150.00, 
          status: 'open', 
          created_at: '2024-01-15T10:00:00Z' 
        },
        { 
          id: '2', 
          customer_id: '2', 
          amount: 299.99, 
          status: 'paid', 
          created_at: '2024-01-14T15:30:00Z' 
        }
      ];
    default:
      return [];
  }
} 