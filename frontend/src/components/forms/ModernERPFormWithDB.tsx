/**
 * VALEO NeuroERP 2.0 - Modern ERP Form mit echter Datenbank-Integration
 * Serena Quality: Vollständige CRUD-Operationen mit Type Safety und Error Handling
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  SaveAlt as AutoSaveIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Download as ExportIcon,
  Upload as ImportIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { message } from 'antd';
// ✅ NEU: Import der standardisierten UI-Komponenten
import { 
  StandardTextField, 
  StandardSelectField, 
  StandardButton, 
  FormActions, 
  FormMessage 
} from './FormStandardization';
import { UI_LABELS, StatusChip, StandardMessage } from '../ui/UIStandardization';

// Types und Services
import {
  FormTab,
  FormTimeline,
  TimelineStep,
  Belegfolge,
  WorkflowStep,
  FormLayout,
  StandardizedFormConfig
} from '../../types/forms';
import formDataService, { FormDataResponse, FormListResponse } from '../../services/FormDataService';

interface ModernERPFormWithDBProps {
  config: StandardizedFormConfig;
  initialData?: any;
  mode: 'create' | 'edit' | 'view';
  recordId?: number;
  onSave?: (data: any) => Promise<void>;
  onCancel?: () => void;
  onDelete?: (id: number) => Promise<void>;
  onExport?: (filters?: any) => Promise<void>;
  onImport?: (file: File) => Promise<void>;
  className?: string;
  showActions?: boolean;
  autoLoad?: boolean;
}

interface FormState {
  currentTab: number;
  currentStep: number;
  isSubmitting: boolean;
  isLoading: boolean;
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  validationErrors: string[];
  data: any;
  mode: 'create' | 'edit' | 'view';
}

export const ModernERPFormWithDB: React.FC<ModernERPFormWithDBProps> = ({
  config,
  initialData,
  mode,
  recordId,
  onSave,
  onCancel,
  onDelete,
  onExport,
  onImport,
  className = '',
  showActions = true,
  autoLoad = true
}) => {
  // Form State Management
  const [formState, setFormState] = useState<FormState>({
    currentTab: 0,
    currentStep: 0,
    isSubmitting: false,
    isLoading: false,
    autoSaveStatus: 'idle',
    validationErrors: [],
    data: initialData || {},
    mode
  });

  // React Hook Form Setup
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    watch,
    setValue,
    trigger,
    reset
  } = useForm({
    resolver: zodResolver(config.validationSchema),
    defaultValues: initialData || {},
    mode: 'onChange'
  });

  // Load data on mount if in edit/view mode
  useEffect(() => {
    if (autoLoad && (mode === 'edit' || mode === 'view') && recordId) {
      loadRecordData(recordId);
    }
  }, [recordId, mode, autoLoad]);

  // Load record data from database
  const loadRecordData = async (id: string | number) => {
    setFormState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await formDataService.getFormDataById(config, id.toString());
      
      if (response.success && response.data) {
        reset(response.data);
        setFormState(prev => ({ 
          ...prev, 
          data: response.data,
          isLoading: false 
        }));
        message.success('Daten erfolgreich geladen');
      } else {
        message.error(response.error || 'Fehler beim Laden der Daten');
        setFormState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error: any) {
      message.error('Fehler beim Laden der Daten: ' + error.message);
      setFormState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Auto-Save Functionality
  const autoSave = useCallback(async () => {
    if (!isDirty || formState.mode === 'view') return;
    
    setFormState(prev => ({ ...prev, autoSaveStatus: 'saving' }));
    
    try {
      const formData = watch();
      
      if (formState.mode === 'create') {
        const response = await formDataService.createFormData(config, formData as Record<string, unknown>);
        if (response.success) {
          setFormState(prev => ({ ...prev, autoSaveStatus: 'saved' }));
          message.success('Auto-Save erfolgreich');
        } else {
          setFormState(prev => ({ ...prev, autoSaveStatus: 'error' }));
          message.error('Auto-Save fehlgeschlagen: ' + response.error);
        }
      } else if (formState.mode === 'edit' && recordId) {
        const response = await formDataService.updateFormData(config, recordId.toString(), formData as Record<string, unknown>);
        if (response.success) {
          setFormState(prev => ({ ...prev, autoSaveStatus: 'saved' }));
          message.success('Auto-Save erfolgreich');
        } else {
          setFormState(prev => ({ ...prev, autoSaveStatus: 'error' }));
          message.error('Auto-Save fehlgeschlagen: ' + response.error);
        }
      }
    } catch (error: any) {
      setFormState(prev => ({ ...prev, autoSaveStatus: 'error' }));
      message.error('Auto-Save Fehler: ' + error.message);
    }
  }, [isDirty, formState.mode, recordId, config, watch]);

  // Auto-save effect
  useEffect(() => {
    if (config.features?.autoSave && isDirty) {
      const timer = setTimeout(autoSave, config.features.autoSaveInterval || 30000);
      return () => clearTimeout(timer);
    }
  }, [autoSave, isDirty, config.features?.autoSave, config.features?.autoSaveInterval]);

  // Form submission
  const onSubmit = async (data: any) => {
    setFormState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      let response: FormDataResponse;
      
      if (formState.mode === 'create') {
        response = await formDataService.createFormData(config, data);
      } else if (formState.mode === 'edit' && recordId) {
        response = await formDataService.updateFormData(config, recordId.toString(), data);
      } else {
        throw new Error('Ungültiger Modus');
      }
      
      if (response.success) {
        message.success(response.message || 'Daten erfolgreich gespeichert');
        
        // Call custom onSave if provided
        if (onSave) {
          await onSave(response.data || data);
        }
        
        // Reset form if in create mode
        if (formState.mode === 'create') {
          reset();
          setFormState(prev => ({ ...prev, data: {} }));
        }
      } else {
        message.error(response.error || 'Fehler beim Speichern');
      }
    } catch (error: any) {
      message.error('Fehler beim Speichern: ' + error.message);
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  // Delete record
  const handleDelete = async () => {
    if (!recordId) return;
    
    try {
      const response = await formDataService.deleteFormData(config, recordId.toString());
      
      if (response.success) {
        message.success('Datensatz erfolgreich gelöscht');
        
        // Call custom onDelete if provided
        if (onDelete) {
          await onDelete(recordId);
        }
        
        // Call onCancel to close form
        if (onCancel) {
          onCancel();
        }
      } else {
        message.error(response.error || 'Fehler beim Löschen');
      }
    } catch (error: any) {
      message.error('Fehler beim Löschen: ' + error.message);
    }
  };

  // Export data
  const handleExport = async () => {
    try {
      const blob = await formDataService.bulkExportFormData(config);
      
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${config.id}_export_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        message.success('Export erfolgreich');
      } else {
        message.error('Export fehlgeschlagen');
      }
    } catch (error: any) {
      message.error('Export Fehler: ' + error.message);
    }
  };

  // Import data
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const response = await formDataService.bulkImportFormData(config, file);
      
      if (response.success) {
        message.success('Import erfolgreich abgeschlossen');
        
        // Reload data if in edit mode
        if (formState.mode === 'edit' && recordId) {
          await loadRecordData(recordId);
        }
      } else {
        message.error('Import fehlgeschlagen: ' + response.error);
      }
    } catch (error: any) {
      message.error('Import Fehler: ' + error.message);
    }
  };

  // Navigation
  const handleNextTab = () => {
    if (formState.currentTab < (config.layout?.tabs?.length || 1) - 1) {
      setFormState(prev => ({ ...prev, currentTab: prev.currentTab + 1 }));
    }
  };

  const handlePrevTab = () => {
    if (formState.currentTab > 0) {
      setFormState(prev => ({ ...prev, currentTab: prev.currentTab - 1 }));
    }
  };

  // Loading state
  if (formState.isLoading) {
    return (
      <Card className={`modern-erp-form ${className}`}>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Lade...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`modern-erp-form ${className}`}>
      <CardContent>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              {config.metadata.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {config.metadata.description}
            </Typography>
          </Box>
          
          {showActions && (
            <Box display="flex" gap={1}>
              {formState.mode === 'view' && (
                <StandardButton
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setFormState(prev => ({ ...prev, mode: 'edit' }))}
                >
                  {UI_LABELS.ACTIONS.EDIT}
                </StandardButton>
              )}
              
              {formState.mode !== 'view' && (
                <StandardButton
                  variant="outlined"
                  startIcon={<ViewIcon />}
                  onClick={() => setFormState(prev => ({ ...prev, mode: 'view' }))}
                >
                  {UI_LABELS.ACTIONS.VIEW}
                </StandardButton>
              )}
              
              <StandardButton
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={handleExport}
              >
                {UI_LABELS.ACTIONS.EXPORT}
              </StandardButton>
              
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                style={{ display: 'none' }}
                onChange={handleImport}
                id="import-file"
              />
              <label htmlFor="import-file">
                <StandardButton
                  variant="outlined"
                  startIcon={<ImportIcon />}
                >
                  {UI_LABELS.ACTIONS.IMPORT}
                </StandardButton>
              </label>
              
              {formState.mode === 'edit' && recordId && (
                <StandardButton
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDelete}
                >
                  {UI_LABELS.ACTIONS.DELETE}
                </StandardButton>
              )}
            </Box>
          )}
        </Box>

        {/* Progress Bar */}
        {config.features?.progressBar && (
          <Box mb={3}>
            <LinearProgress 
              variant="determinate" 
              value={(formState.currentTab + 1) / (config.layout?.tabs?.length || 1) * 100}
            />
            <Typography variant="caption" color="text.secondary">
              {UI_LABELS.FORMS.STEP} {formState.currentTab + 1} {UI_LABELS.FORMS.OF} {config.layout?.tabs?.length || 1}
            </Typography>
          </Box>
        )}

        {/* ✅ REFAKTORIERT: Auto-Save Status mit StandardMessage */}
        {config.features?.autoSave && formState.autoSaveStatus !== 'idle' && (
          <StandardMessage
            type={formState.autoSaveStatus === 'saved' ? 'success' : 'error'}
            title="Auto-Save Status:"
            message={
              formState.autoSaveStatus === 'saving' 
                ? 'Auto-Save läuft...' 
                : formState.autoSaveStatus === 'saved' 
                ? 'Auto-Save erfolgreich' 
                : 'Auto-Save fehlgeschlagen'
            }
          />
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {config.layout?.type === 'tabs' && config.layout.tabs ? (
            <Stepper activeStep={formState.currentTab} orientation="vertical">
              {config.layout.tabs.map((tab: FormTab, index: number) => (
                <Step key={tab.id}>
                  <StepLabel>{tab.label}</StepLabel>
                  <StepContent>
                    <Box sx={{ mt: 2, mb: 2 }}>
                      {tab.fields?.map((fieldName) => (
                        <StandardTextField
                          key={fieldName.toString()}
                          name={fieldName.toString()}
                          label={fieldName.toString()}
                          disabled={formState.mode === 'view'}
                          helperText={errors[fieldName.toString()]?.message as string}
                        />
                      ))}
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <StandardButton
                        variant="contained"
                        onClick={handleNextTab}
                        disabled={index === config.layout.tabs.length - 1}
                        sx={{ mr: 1 }}
                      >
                        {UI_LABELS.ACTIONS.NEXT}
                      </StandardButton>
                      <StandardButton
                        variant="outlined"
                        onClick={handlePrevTab}
                        disabled={index === 0}
                      >
                        {UI_LABELS.ACTIONS.BACK}
                      </StandardButton>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          ) : (
            // ✅ REFAKTORIERT: Simple form layout mit StandardTextField
            <Box>
              {config.fields?.map((fieldName) => (
                <StandardTextField
                  key={fieldName.toString()}
                  name={fieldName.toString()}
                  label={fieldName.toString()}
                  disabled={formState.mode === 'view'}
                  helperText={errors[fieldName.toString()]?.message as string}
                />
              ))}
            </Box>
          )}

          {/* ✅ REFAKTORIERT: Form Actions mit FormActions */}
          {formState.mode !== 'view' && (
            <FormActions
              onSave={handleSubmit(onSubmit)}
              onCancel={onCancel}
              saveText={formState.isSubmitting ? 'Speichern...' : UI_LABELS.ACTIONS.SAVE}
              cancelText={UI_LABELS.ACTIONS.CANCEL}
              loading={formState.isSubmitting}
              disabled={formState.isSubmitting || !isValid}
            />
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default ModernERPFormWithDB; 