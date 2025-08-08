import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm, FieldValues, UseFormReturn, FieldError, FieldErrors, Path, PathValue, DefaultValues, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getMCPSchemaInjector } from '../utils/mcpSchemaInjector';
import type { MCPSchema } from '../utils/mcpSchemaInjector';

interface MCPFormConfig<T extends FieldValues> {
  schema?: z.ZodSchema<T>;
  defaultValues?: DefaultValues<T>;
  mode?: 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all';
  reValidateMode?: 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all';
  criteriaMode?: 'firstError' | 'all';
}

interface MCPFormState<T extends FieldValues> {
  isDirty: boolean;
  isSubmitting: boolean;
  isSubmitted: boolean;
  isValid: boolean;
  errors: FieldErrors<T>;
  touchedFields: Record<string, boolean>;
}

interface MCPFormActions<T extends FieldValues> {
  reset: (values?: DefaultValues<T>) => void;
  setValue: (name: Path<T>, value: PathValue<T, Path<T>>) => void;
  getValues: () => T;
  trigger: (name?: Path<T> | Path<T>[]) => Promise<boolean>;
  clearErrors: (name?: Path<T> | Path<T>[]) => void;
  setError: (name: Path<T>, error: FieldError) => void;
}

export function useMCPForm<T extends FieldValues = FieldValues>(
  config: MCPFormConfig<T> = {}
): UseFormReturn<T> & MCPFormState<T> & MCPFormActions<T> {
  const {
    schema,
    defaultValues,
    mode = 'onBlur',
    reValidateMode = 'onChange',
    criteriaMode = 'firstError'
  } = config;

  const resolver: Resolver<T> | undefined = schema ? zodResolver(schema as any) : undefined;

  const form = useForm<T>({
    defaultValues: defaultValues as DefaultValues<T>,
    mode,
    reValidateMode: reValidateMode as 'onBlur' | 'onChange' | 'onSubmit',
    criteriaMode,
    resolver
  });

  const [formState, setFormState] = useState<MCPFormState<T>>({
    isDirty: false,
    isSubmitting: false,
    isSubmitted: false,
    isValid: false,
    errors: {} as FieldErrors<T>,
    touchedFields: {}
  });

  const previousValues = useRef<T>(form.getValues());

  // Form State synchronisieren
  useEffect(() => {
    const subscription = form.watch((value) => {
      const currentValues = value as T;
      const isDirty = JSON.stringify(currentValues) !== JSON.stringify(previousValues.current);
      
      setFormState(prev => ({
        ...prev,
        isDirty,
        isValid: form.formState.isValid,
        errors: form.formState.errors,
        touchedFields: form.formState.touchedFields as Record<string, boolean>
      }));
      
      previousValues.current = currentValues;
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Reset Funktion
  const reset = useCallback((values?: DefaultValues<T>) => {
    form.reset(values as any);
    setFormState(prev => ({
      ...prev,
      isDirty: false,
      isSubmitted: false,
      errors: {} as FieldErrors<T>,
      touchedFields: {}
    }));
  }, [form]);

  // SetValue Funktion
  const setValue = useCallback((name: Path<T>, value: PathValue<T, Path<T>>) => {
    form.setValue(name, value as any);
  }, [form]);

  // GetValues Funktion
  const getValues = useCallback(() => {
    return form.getValues();
  }, [form]);

  // Trigger Funktion
  const trigger = useCallback(async (name?: Path<T> | Path<T>[]) => {
    return await form.trigger(name);
  }, [form]);

  // ClearErrors Funktion
  const clearErrors = useCallback((name?: Path<T> | Path<T>[]) => {
    form.clearErrors(name);
  }, [form]);

  // SetError Funktion
  const setError = useCallback((name: Path<T>, error: FieldError) => {
    form.setError(name, error);
  }, [form]);

  return {
    ...form,
    ...formState,
    reset,
    setValue,
    getValues: getValues as any,
    trigger,
    clearErrors,
    setError
  };
}

// Specialized hooks for common form patterns
export function useMCPFormWithValidation<T extends FieldValues>(
  schema: z.ZodSchema<T>,
  defaultValues?: DefaultValues<T>
) {
  return useMCPForm<T>({
    schema,
    defaultValues
  });
}

export function useMCPFormWithAutoSave<T extends FieldValues>(
  schema: z.ZodSchema<T>,
  defaultValues?: DefaultValues<T>,
  autoSaveDelay: number = 1000
) {
  const form = useMCPForm<T>({
    schema,
    defaultValues
  });

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const autoSave = useCallback(async () => {
    if (form.isDirty && form.isValid) {
      setIsSaving(true);
      try {
        // Hier würde die tatsächliche Speicherlogik implementiert
        await new Promise(resolve => setTimeout(resolve, 500));
        setLastSaved(new Date());
        form.reset(form.getValues());
      } catch (error) {
        console.error('Auto-Save fehlgeschlagen:', error);
      } finally {
        setIsSaving(false);
      }
    }
  }, [form]);

  useEffect(() => {
    const timeoutId = setTimeout(autoSave, autoSaveDelay);
    return () => clearTimeout(timeoutId);
  }, [form.watch(), autoSave, autoSaveDelay]);

  return {
    ...form,
    lastSaved,
    isSaving
  };
}

export function useMCPFormWithSteps<T extends FieldValues>(
  steps: Array<{
    id: string;
    title: string;
    fields: (keyof T)[];
    validation?: z.ZodSchema<Partial<T>>;
  }>,
  defaultValues?: DefaultValues<T>
) {
  const form = useMCPForm<T>({
    defaultValues
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const currentStepConfig = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const validateCurrentStep = useCallback(async () => {
    if (currentStepConfig?.validation) {
      try {
        const stepFields = form.getValues();
        currentStepConfig.validation.parse(stepFields);
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const zodError = error as z.ZodError;
          (zodError as any).errors.forEach((err: any) => {
            const fieldName = err.path.join('.') as Path<T>;
            form.setError(fieldName, {
              type: 'validation',
              message: err.message
            });
          });
        }
        return false;
      }
    }
    return true;
  }, [currentStepConfig, form]);

  const nextStep = useCallback(async () => {
    const isValid = await validateCurrentStep();
    if (isValid && !isLastStep) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(prev => prev + 1);
    }
  }, [validateCurrentStep, isLastStep, currentStep]);

  const prevStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  }, [isFirstStep]);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  }, [steps.length]);

  const isStepCompleted = useCallback((stepIndex: number) => {
    return completedSteps.has(stepIndex);
  }, [completedSteps]);

  return {
    ...form,
    currentStep,
    currentStepConfig,
    isFirstStep,
    isLastStep,
    nextStep,
    prevStep,
    goToStep,
    isStepCompleted,
    completedSteps: Array.from(completedSteps)
  };
}

// Hook for form with conditional fields
export function useMCPFormWithConditionalFields<T extends FieldValues>(
  schema: z.ZodSchema<T>,
  defaultValues?: DefaultValues<T>,
  conditionalLogic?: Record<keyof T, (values: T) => boolean>
) {
  const form = useMCPForm<T>({
    schema,
    defaultValues
  });

  const [visibleFields, setVisibleFields] = useState<Set<keyof T>>(new Set());

  useEffect(() => {
    if (conditionalLogic) {
      const values = form.getValues();
      const newVisibleFields = new Set<keyof T>();

      Object.entries(conditionalLogic).forEach(([field, condition]) => {
        if (condition(values)) {
          newVisibleFields.add(field as keyof T);
        }
      });

      setVisibleFields(newVisibleFields);
    }
  }, [form.watch(), conditionalLogic, form]);

  const isFieldVisible = useCallback((field: keyof T) => {
    if (!conditionalLogic) return true;
    return visibleFields.has(field);
  }, [visibleFields, conditionalLogic]);

  return {
    ...form,
    isFieldVisible,
    visibleFields: Array.from(visibleFields)
  };
}

// Hook for form with file uploads
export function useMCPFormWithFileUpload<T extends FieldValues>(
  schema: z.ZodSchema<T>,
  defaultValues?: DefaultValues<T>
) {
  const form = useMCPForm<T>({
    schema,
    defaultValues
  });

  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File[]>>({});

  const handleFileUpload = useCallback((fieldName: keyof T, files: FileList | File[]) => {
    const fileArray = Array.from(files);
    setUploadedFiles(prev => ({
      ...prev,
      [fieldName as string]: fileArray
    }));

    // Update form value
    form.setValue(fieldName as Path<T>, fileArray as PathValue<T, Path<T>>);
  }, [form]);

  const removeFile = useCallback((fieldName: keyof T, fileIndex: number) => {
    setUploadedFiles(prev => {
      const fieldFiles = prev[fieldName as string] || [];
      const newFiles = fieldFiles.filter((_, index) => index !== fileIndex);
      
      return {
        ...prev,
        [fieldName as string]: newFiles
      };
    });
  }, []);

  const clearFiles = useCallback((fieldName: keyof T) => {
    setUploadedFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[fieldName as string];
      return newFiles;
    });
    
    form.setValue(fieldName as Path<T>, [] as PathValue<T, Path<T>>);
  }, [form]);

  return {
    ...form,
    uploadedFiles,
    handleFileUpload,
    removeFile,
    clearFiles
  };
}

/**
 * React Hook für MCP-Tabellen
 */
export function useMCPTable<T = unknown>(tableName: string) {
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
  }, [tableName, mcpInjector]);

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
    return schema?.rls?.delete || false;
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
export function useMCPData<T = unknown>(tableName: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (options?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, unknown>;
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      // Mock-Daten für Demo-Zwecke
      const mockData = generateMockData(tableName);
      
      return {
        data: mockData as T[],
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
      const item = mockData.find((item: { id: string }) => item.id === id);
      
      if (!item) {
        throw new Error('Element nicht gefunden');
      }

      return item as T;

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

      return createdItem as T;

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

      return updatedItem as T;

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
function generateMockData(tableName: string): unknown[] {
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