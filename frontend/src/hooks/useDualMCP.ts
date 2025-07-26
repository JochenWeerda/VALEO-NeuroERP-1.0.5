/**
 * Dual MCP React Hooks für VALEO NeuroERP
 * Kombiniert Schema- und UI-Metadata für optimale Komponenten-Entwicklung
 */

import { useState, useEffect, useCallback } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dualMCPClient, { 
  type MCPSchema, 
  type CompleteMetadata, 
  type UIFieldMetadata 
} from '../utils/dualMCPClient';

// Hook für kombinierte Metadaten
export interface UseDualMCPMetadataReturn {
  schema: MCPSchema | null;
  uiMetadata: CompleteMetadata | null;
  combined: any;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useDualMCPMetadata = (tableName: string): UseDualMCPMetadataReturn => {
  const [schema, setSchema] = useState<MCPSchema | null>(null);
  const [uiMetadata, setUIMetadata] = useState<CompleteMetadata | null>(null);
  const [combined, setCombined] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetadata = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await dualMCPClient.getCombinedMetadata(tableName);
      
      setSchema(result.schema);
      setUIMetadata(result.uiMetadata);
      setCombined(result.combined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      console.error(`Error fetching dual MCP metadata for ${tableName}:`, err);
    } finally {
      setLoading(false);
    }
  }, [tableName]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  return {
    schema,
    uiMetadata,
    combined,
    loading,
    error,
    refetch: fetchMetadata
  };
};

// Hook für Schema-basierte Formulare mit UI-Metadata
export interface UseDualMCPFormReturn<T = any> extends UseFormReturn<T> {
  schema: MCPSchema | null;
  uiMetadata: CompleteMetadata | null;
  enhancedFields: UIFieldMetadata[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useDualMCPForm = <T = any>(
  tableName: string,
  defaultValues?: Partial<T>
): UseDualMCPFormReturn<T> => {
  const { schema, uiMetadata, combined, loading, error, refetch } = useDualMCPMetadata(tableName);
  
  // Zod-Schema generieren
  const zodSchema = combined ? dualMCPClient.generateZodSchema(combined) : z.object({});
  
  // React Hook Form mit Zod-Resolver
  const form = useForm<T>({
    resolver: zodResolver(zodSchema) as any,
    defaultValues: (defaultValues || {}) as any
  });

  // Erweiterte Felder mit UI-Metadata
  const enhancedFields = combined?.enhanced_fields || [];

  return {
    ...form,
    schema,
    uiMetadata,
    enhancedFields,
    loading,
    error,
    refetch
  };
};

// Hook für Schema-basierte Tabellen mit UI-Metadata
export interface UseDualMCPTableReturn {
  schema: MCPSchema | null;
  uiMetadata: CompleteMetadata | null;
  tableMetadata: any;
  enhancedFields: UIFieldMetadata[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useDualMCPTable = (tableName: string): UseDualMCPTableReturn => {
  const { schema, uiMetadata, combined, loading, error, refetch } = useDualMCPMetadata(tableName);
  
  const tableMetadata = uiMetadata?.table || null;
  const enhancedFields = combined?.enhanced_fields || [];

  return {
    schema,
    uiMetadata,
    tableMetadata,
    enhancedFields,
    loading,
    error,
    refetch
  };
};

// Hook für CRUD-Operationen mit RLS-Compliance
export interface UseDualMCPDataReturn<T = any> {
  data: T[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  create: (item: Omit<T, 'id'>) => Promise<T>;
  update: (id: string, item: Partial<T>) => Promise<T>;
  delete: (id: string) => Promise<void>;
}

export const useDualMCPData = <T = any>(tableName: string): UseDualMCPDataReturn<T> => {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { schema, uiMetadata } = useDualMCPMetadata(tableName);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock-Daten basierend auf Schema (später durch echte API ersetzen)
      const mockData = generateMockData<T>(schema, tableName);
      setData(mockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      console.error(`Error fetching data for ${tableName}:`, err);
    } finally {
      setLoading(false);
    }
  }, [schema, tableName]);

  const create = useCallback(async (item: Omit<T, 'id'>): Promise<T> => {
    try {
      setLoading(true);
      setError(null);

      // Mock-Create (später durch echte API ersetzen)
      const newItem = {
        ...item,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as T;

      setData(prev => prev ? [...prev, newItem] : [newItem]);
      return newItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Erstellen');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, item: Partial<T>): Promise<T> => {
    try {
      setLoading(true);
      setError(null);

      // Mock-Update (später durch echte API ersetzen)
      setData(prev => {
        if (!prev) return null;
        return prev.map(existingItem => {
          if ((existingItem as any).id === id) {
            return {
              ...existingItem,
              ...item,
              updated_at: new Date().toISOString()
            };
          }
          return existingItem;
        });
      });

      const updatedItem = data?.find(item => (item as any).id === id);
      if (!updatedItem) throw new Error('Item nicht gefunden');
      
      return updatedItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Aktualisieren');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [data]);

  const deleteItem = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Mock-Delete (später durch echte API ersetzen)
      setData(prev => prev ? prev.filter(item => (item as any).id !== id) : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    create,
    update,
    delete: deleteItem
  };
};

// Hook für automatische Komponenten-Generierung
export interface UseDualMCPComponentReturn {
  formComponent: string;
  tableComponent: string;
  loading: boolean;
  error: string | null;
  regenerate: () => Promise<void>;
}

export const useDualMCPComponent = (tableName: string): UseDualMCPComponentReturn => {
  const [formComponent, setFormComponent] = useState<string>('');
  const [tableComponent, setTableComponent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { combined, loading: metadataLoading, error: metadataError } = useDualMCPMetadata(tableName);

  const generateComponents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (combined) {
        const formCode = dualMCPClient.generateReactComponent(combined, 'form');
        const tableCode = dualMCPClient.generateReactComponent(combined, 'table');
        
        setFormComponent(formCode);
        setTableComponent(tableCode);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler bei der Komponenten-Generierung');
      console.error(`Error generating components for ${tableName}:`, err);
    } finally {
      setLoading(false);
    }
  }, [combined, tableName]);

  useEffect(() => {
    if (!metadataLoading && !metadataError) {
      generateComponents();
    }
  }, [metadataLoading, metadataError, generateComponents]);

  return {
    formComponent,
    tableComponent,
    loading: loading || metadataLoading,
    error: error || metadataError,
    regenerate: generateComponents
  };
};

// Hilfsfunktion für Mock-Daten-Generierung
function generateMockData<T>(schema: MCPSchema | null, tableName: string): T[] {
  if (!schema) return [];

  const mockData: T[] = [];
  const mockCount = 5; // Anzahl Mock-Einträge

  for (let i = 1; i <= mockCount; i++) {
    const item: any = {
      id: `${tableName}_${i}`,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    };

    // Felder basierend auf Schema generieren
    schema.columns.forEach(column => {
      if (column.name === 'id') return; // Bereits gesetzt

      switch (column.type.toLowerCase()) {
        case 'uuid':
          item[column.name] = `uuid-${i}-${Math.random().toString(36).substr(2, 9)}`;
          break;
        case 'email':
          item[column.name] = `user${i}@example.com`;
          break;
        case 'int':
        case 'integer':
        case 'bigint':
          item[column.name] = Math.floor(Math.random() * 1000);
          break;
        case 'numeric':
        case 'decimal':
        case 'real':
          item[column.name] = parseFloat((Math.random() * 1000).toFixed(2));
          break;
        case 'boolean':
          item[column.name] = Math.random() > 0.5;
          break;
        case 'date':
          item[column.name] = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        case 'timestamp':
        case 'timestamptz':
          item[column.name] = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'enum':
          if (column.enum_values && column.enum_values.length > 0) {
            item[column.name] = column.enum_values[Math.floor(Math.random() * column.enum_values.length)];
          } else {
            item[column.name] = 'default';
          }
          break;
        default:
          // Text-basierte Felder
          if (column.name.toLowerCase().includes('name')) {
            item[column.name] = `Test ${column.name} ${i}`;
          } else if (column.name.toLowerCase().includes('description')) {
            item[column.name] = `Beschreibung für ${column.name} ${i}`;
          } else if (column.name.toLowerCase().includes('status')) {
            item[column.name] = ['aktiv', 'inaktiv', 'wartung'][Math.floor(Math.random() * 3)];
          } else {
            item[column.name] = `Wert ${i}`;
          }
      }
    });

    mockData.push(item as T);
  }

  return mockData;
}

 