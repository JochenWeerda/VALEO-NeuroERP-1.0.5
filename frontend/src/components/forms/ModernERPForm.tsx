import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { useForm, Controller, FieldError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { StandardizedFormConfig, FormTab, FormTimeline } from '../../types/forms';
import { formSecurityManager } from '../../security/FormSecurityManager';
import { mcpSecurityManager } from '../../security/MCPSecurityManager';
// ✅ NEU: Import der standardisierten UI-Komponenten
import { 
  StandardTextField, 
  StandardSelectField, 
  StandardButton, 
  FormActions, 
  FormMessage 
} from './FormStandardization';
import { UI_LABELS, StatusChip, StandardMessage } from '../ui/UIStandardization';

interface ModernERPFormProps {
  config: StandardizedFormConfig;
  initialData?: Record<string, unknown>;
  onSave?: (data: Record<string, unknown>) => Promise<void>;
  onCancel?: () => void;
  mode?: 'create' | 'edit' | 'view';
  recordId?: string;
}

interface FormData {
  [key: string]: unknown;
}

export const ModernERPForm: React.FC<ModernERPFormProps> = ({
  config,
  initialData = {},
  onSave,
  onCancel,
  mode = 'create',
  recordId
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [securityIssues, setSecurityIssues] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [securityWarnings, setSecurityWarnings] = useState<Record<string, string[]>>({});

  // Dynamisches Schema basierend auf der Konfiguration
  const generateSchema = useCallback(() => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};
    
    config.fields?.forEach(field => {
      let fieldSchema = z.string();
      
      // Feldtyp-spezifische Validierung
      switch (field.type) {
        case 'email':
          fieldSchema = z.string().email('Ungültige E-Mail-Adresse');
          break;
        case 'number':
          fieldSchema = z.union([z.number(), z.string().transform(val => Number(val))]) as any;
          break;
        case 'date':
          fieldSchema = z.union([z.string(), z.date()]) as any;
          break;
        case 'select':
          fieldSchema = z.string();
          break;
        default:
          fieldSchema = z.string();
      }

      // Erforderliche Felder
      if (field.required) {
        fieldSchema = fieldSchema.refine(val => val !== '' && val != null, {
          message: `${field.label} ist erforderlich`
        });
      }

      // Minimale Länge
      if (field.validation?.min) {
        fieldSchema = fieldSchema.refine(
          val => typeof val === 'string' && val.length >= field.validation!.min!,
          { message: `${field.label} muss mindestens ${field.validation!.min} Zeichen lang sein` }
        );
      }

      // Maximale Länge
      if (field.validation?.max) {
        fieldSchema = fieldSchema.refine(
          val => typeof val === 'string' && val.length <= field.validation!.max!,
          { message: `${field.label} darf maximal ${field.validation!.max} Zeichen lang sein` }
        );
      }

      schemaFields[field.name] = fieldSchema;
    });

    return z.object(schemaFields);
  }, [config.fields]);

  const schema = generateSchema();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData
  });

  // Sicherheitsprüfung
  useEffect(() => {
    const checkSecurity = async () => {
      if (config.security) {
        const issues = await formSecurityManager.validateFormData(config.security, initialData, {
          formId: config.id || 'unknown',
          userId: 'current-user',
          sessionId: 'current-session',
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent,
          timestamp: new Date(),
          formData: initialData || {}
        });
        setSecurityIssues(issues.securityIssues || []);
      }
    };
    checkSecurity();
  }, [config.security, initialData]);

  // MCP-Sicherheitsprüfung
  useEffect(() => {
    const checkMCPSecurity = async () => {
      if (config.mcpSecurity) {
        const warnings = await mcpSecurityManager.validateFormData(config.mcpSecurity, initialData);
        setSecurityWarnings(warnings.reduce((acc, warning) => {
          acc[warning] = [warning];
          return acc;
        }, {} as Record<string, string[]>));
      }
    };
    checkMCPSecurity();
  }, [config.mcpSecurity, initialData]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      if (onSave) {
        await onSave(data);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setValidationErrors({ general: ['Fehler beim Speichern der Daten'] });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tab-Handling
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // ✅ REFAKTORIERT: Rendering der Felder mit standardisierten Komponenten
  const renderField = (field: any) => {
    const fieldError = errors[field.name] as FieldError | undefined;
    const validationError = validationErrors[field.name];
    const securityWarning = securityWarnings[field.name];

    return (
      <Grid item xs={12} sm={field.gridSize || 6} key={field.name}>
        {field.type === 'select' ? (
          <StandardSelectField
            name={field.name}
            label={field.label}
            options={field.options || []}
            required={field.required}
            disabled={mode === 'view'}
            helperText={
              fieldError?.message ||
              (validationError ? validationError.join(', ') : '') ||
              (securityWarning ? securityWarning.join(', ') : '') ||
              field.helpText
            }
          />
        ) : (
          <StandardTextField
            name={field.name}
            label={field.label}
            type={field.type === 'password' ? 'password' : field.type}
            required={field.required}
            disabled={mode === 'view'}
            placeholder={field.placeholder}
            helperText={
              fieldError?.message ||
              (validationError ? validationError.join(', ') : '') ||
              (securityWarning ? securityWarning.join(', ') : '') ||
              field.helpText
            }
            multiline={field.type === 'textarea'}
            rows={field.type === 'textarea' ? 4 : 1}
            maxLength={field.validation?.max}
            minLength={field.validation?.min}
          />
        )}
      </Grid>
    );
  };

  // Rendering der Tabs
  const renderTabs = () => {
    if (!config.tabs || config.tabs.length === 0) {
      return (
        <Grid container spacing={2}>
          {config.fields?.map(renderField)}
        </Grid>
      );
    }

    return (
      <Box>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable">
          {config.tabs.map((tab: FormTab, index: number) => (
            <Tab key={tab.id} label={tab.title} />
          ))}
        </Tabs>
        <Box sx={{ mt: 2 }}>
          {config.tabs[activeTab] && (
            <Grid container spacing={2}>
              {config.tabs[activeTab].fields?.map(renderField)}
            </Grid>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', mt: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {config.title}
        </Typography>
        
        {config.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {config.description}
          </Typography>
        )}

        {/* ✅ REFAKTORIERT: Sicherheitswarnungen mit StandardMessage */}
        {securityIssues.length > 0 && (
          <StandardMessage
            type="error"
            title="Sicherheitsprobleme erkannt:"
            message={securityIssues.join(', ')}
          />
        )}

        {/* ✅ REFAKTORIERT: Sicherheitswarnungen mit StandardMessage */}
        {Object.keys(securityWarnings).length > 0 && (
          <StandardMessage
            type="warning"
            title="Sicherheitswarnungen:"
            message={Object.entries(securityWarnings)
              .map(([field, warnings]) => `${field}: ${warnings.join(', ')}`)
              .join('; ')}
          />
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {renderTabs()}

          {/* ✅ REFAKTORIERT: FormActions mit standardisierten Labels */}
          <FormActions
            onSave={handleSubmit(onSubmit)}
            onCancel={onCancel}
            saveText={UI_LABELS.ACTIONS.SAVE}
            cancelText={UI_LABELS.ACTIONS.CANCEL}
            loading={isSubmitting}
            disabled={isSubmitting || securityIssues.length > 0}
          />
        </form>

        {/* Sicherheitsstatus */}
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            Sicherheitsstatus: {securityIssues.length > 0 ? 'Probleme erkannt' : 'Sicher'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}; 