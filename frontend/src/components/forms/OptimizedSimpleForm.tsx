/**
 * VALEO NeuroERP 2.0 - Optimiertes SimpleForm
 * Horizon Beta optimiert für maximale UX/UI und Performance
 * Serena Quality: Complete form optimization with accessibility and performance
 */

import React, { useCallback, useMemo, useEffect, useRef } from 'react';
import { useForm, Controller, FieldValues, UseFormReturn, FieldError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  TextField,
  Button,
  Alert,
  Box,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Checkbox,
  FormControlLabel,
  Snackbar,
  IconButton,
  Tooltip,
  Chip,
  Divider,
  Paper,
  Fade,
  Zoom
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  KeyboardArrowRight as ArrowIcon,
  QrCodeScanner as BarcodeIcon,
  AutoFixHigh as AutoCompleteIcon,
  ErrorOutline as ErrorIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
// import { useHotkeys } from 'react-hotkeys-hook'; // Entfernt - nicht verfügbar

// Einfache Keyboard-Event-Behandlung
const useKeyboardShortcuts = (onSave: (data?: any) => void, onCancel: () => void) => {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 's':
            event.preventDefault();
            onSave();
            break;
          case 'Escape':
            event.preventDefault();
            onCancel();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onSave, onCancel]);
};

// Erweiterte TypeScript-Interfaces für bessere Typsicherheit
interface FormFieldOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface FormFieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'checkbox' | 'barcode' | 'autocomplete';
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  options?: FormFieldOption[];
  validation?: FormFieldValidation;
  autoComplete?: boolean;
  barcodeScanner?: boolean;
  helpText?: string;
  icon?: React.ReactNode;
  group?: string;
  dependencies?: string[];
  conditional?: (values: FieldValues) => boolean;
  transform?: (value: any) => any;
  format?: (value: any) => string;
  parse?: (value: string) => any;
}

interface OptimizedSimpleFormProps {
  fields: FormField[];
  onSubmit: (data: FieldValues) => void | Promise<void>;
  defaultValues?: Record<string, any>;
  loading?: boolean;
  error?: string | null;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  className?: string;
  showCancelButton?: boolean;
  disabled?: boolean;
  autoSave?: boolean;
  autoSaveInterval?: number;
  showProgress?: boolean;
  keyboardShortcuts?: boolean;
  barcodeScanner?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'small' | 'medium' | 'large';
  layout?: 'vertical' | 'horizontal' | 'grid';
  validationSchema?: z.ZodSchema<any>;
  onFieldChange?: (fieldName: string, value: any) => void;
  onAutoSave?: (data: FieldValues) => void;
  onBarcodeScan?: (barcode: string) => void;
  onKeyboardShortcut?: (shortcut: string) => void;
}

// Memoized Field Component für bessere Performance
const MemoizedField = React.memo<{
  field: FormField;
  control: any;
  errors: Record<string, FieldError | undefined>;
  disabled: boolean;
  onFieldChange?: (fieldName: string, value: any) => void;
  theme: any;
}>(({ field, control, errors, disabled, onFieldChange, theme }) => {
  const fieldError = errors[field.name];
  const errorMessage = fieldError?.message as string;

  const handleFieldChange = useCallback((value: any) => {
    if (onFieldChange) {
      onFieldChange(field.name, value);
    }
  }, [field.name, onFieldChange]);

  const renderField = () => {
    const commonProps = {
      fullWidth: true,
      error: !!fieldError,
      disabled: disabled || field.disabled,
      'aria-invalid': !!fieldError,
      'aria-describedby': fieldError ? `${field.name}-error` : undefined
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
        return (
          <TextField
            {...commonProps}
            type={field.type}
            label={field.label}
            placeholder={field.placeholder}
            helperText={errorMessage || field.helpText}
            InputProps={{
              startAdornment: field.icon,
              autoComplete: field.autoComplete ? 'on' : 'off'
            }}
          />
        );

      case 'number':
        return (
          <TextField
            {...commonProps}
            type="number"
            label={field.label}
            placeholder={field.placeholder}
            helperText={errorMessage || field.helpText}
            inputProps={{
              min: field.validation?.min,
              max: field.validation?.max
            }}
          />
        );

      case 'select':
        return (
          <FormControl fullWidth error={!!fieldError} className="mb-4">
            <InputLabel>{field.label}</InputLabel>
            <Select
              label={field.label}
              disabled={disabled || field.disabled}
            >
              <MenuItem value="">Bitte wählen...</MenuItem>
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
                  {option.icon} {option.label}
                </MenuItem>
              ))}
            </Select>
            {(errorMessage || field.helpText) && (
              <FormHelperText>{errorMessage || field.helpText}</FormHelperText>
            )}
          </FormControl>
        );

      case 'textarea':
        return (
          <TextField
            {...commonProps}
            multiline
            rows={4}
            label={field.label}
            placeholder={field.placeholder}
            helperText={errorMessage || field.helpText}
          />
        );

      case 'date':
        return (
          <TextField
            {...commonProps}
            type="date"
            label={field.label}
            helperText={errorMessage || field.helpText}
            InputLabelProps={{ shrink: true }}
          />
        );

      case 'checkbox':
        return (
          <FormControlLabel
            control={
              <Checkbox
                disabled={disabled || field.disabled}
                color="primary"
              />
            }
            label={field.label}
          />
        );

      default:
        return (
          <TextField
            {...commonProps}
            label={field.label}
            placeholder={field.placeholder}
            helperText={errorMessage || field.helpText}
          />
        );
    }
  };

  return (
    <Controller
      name={field.name}
      control={control}
      render={({ field: { onChange, value, ref } }) => (
        <Box className="mb-4">
          {renderField()}
          {field.helpText && !errorMessage && (
            <Typography variant="caption" color="textSecondary" className="mt-1">
              {field.helpText}
            </Typography>
          )}
        </Box>
      )}
    />
  );
});

MemoizedField.displayName = 'MemoizedField';

// Hauptkomponente mit Performance-Optimierungen
export const OptimizedSimpleForm: React.FC<OptimizedSimpleFormProps> = React.memo(({
  fields,
  onSubmit,
  defaultValues = {},
  loading = false,
  error,
  submitText = 'Speichern',
  cancelText = 'Abbrechen',
  onCancel,
  className = '',
  showCancelButton = true,
  disabled = false,
  autoSave = true,
  autoSaveInterval = 30000, // 30 Sekunden
  showProgress = true,
  keyboardShortcuts = true,
  barcodeScanner = false,
  theme: themeMode = 'auto',
  size = 'medium',
  layout = 'vertical',
  validationSchema,
  onFieldChange,
  onAutoSave,
  onBarcodeScan,
  onKeyboardShortcut
}) => {
  const theme = useTheme();
  const formRef = useRef<HTMLFormElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedDataRef = useRef<FieldValues>({});

  // Formular-Setup mit Zod-Validierung
  const form = useForm({
    defaultValues,
    resolver: validationSchema ? zodResolver(validationSchema) : undefined,
    mode: 'onChange', // Real-time Validierung
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid },
    reset,
    watch,
    setValue,
    getValues
  } = form;

  const formValues = watch();

  // Auto-Save Funktionalität
  useEffect(() => {
    if (autoSave && isDirty && isValid) {
      const currentData = getValues();
      const hasChanges = JSON.stringify(currentData) !== JSON.stringify(lastSavedDataRef.current);
      
      if (hasChanges) {
        autoSaveTimeoutRef.current = setTimeout(() => {
          onAutoSave?.(currentData);
          lastSavedDataRef.current = currentData;
        }, autoSaveInterval);
      }
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formValues, autoSave, isDirty, isValid, autoSaveInterval, onAutoSave, getValues]);

  // Keyboard-Shortcuts für bessere Benutzerfreundlichkeit
  if (keyboardShortcuts) {
    useKeyboardShortcuts(() => handleSubmit(onSubmit)(), onCancel || (() => {}));
  }

  useEffect(() => {
    const handleTab = (event: KeyboardEvent) => {
      onKeyboardShortcut?.('tab');
    };
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [onKeyboardShortcut]);

  // Barcode Scanner Integration
  useEffect(() => {
    if (barcodeScanner) {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && document.activeElement?.tagName === 'INPUT') {
          const barcode = (document.activeElement as HTMLInputElement).value;
          if (barcode.length > 8) { // Typische Barcode-Länge
            onBarcodeScan?.(barcode);
          }
        }
      };

      document.addEventListener('keypress', handleKeyPress);
      return () => document.removeEventListener('keypress', handleKeyPress);
    }
  }, [barcodeScanner, onBarcodeScan]);

  // Gruppierte Felder für bessere Organisation
  const groupedFields = useMemo(() => {
    const groups: Record<string, FormField[]> = {};
    fields.forEach(field => {
      const group = field.group || 'allgemein';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(field);
    });
    return groups;
  }, [fields]);

  // Conditional Fields Filtering
  const visibleFields = useMemo(() => {
    return fields.filter(field => {
      if (!field.conditional) return true;
      return field.conditional(formValues);
    });
  }, [fields, formValues]);

  // Progress-Berechnung
  const progress = useMemo(() => {
    const totalFields = fields.length;
    const filledFields = Object.keys(formValues).filter(key => 
      formValues[key] !== undefined && formValues[key] !== ''
    ).length;
    return Math.round((filledFields / totalFields) * 100);
  }, [fields.length, formValues]);

  return (
    <Paper 
      elevation={2} 
      className={`p-6 ${className}`}
      sx={{
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      {/* Progress Bar */}
      {showProgress && (
        <Box className="mb-6">
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" color="textSecondary">
              Formular-Fortschritt
            </Typography>
            <Typography variant="body2" color="primary">
              {progress}%
            </Typography>
          </Box>
          <Box 
            className="h-2 bg-gray-200 rounded-full overflow-hidden"
            sx={{ backgroundColor: theme.palette.grey[200] }}
          >
            <Box
              className="h-full bg-blue-500 transition-all duration-300"
              sx={{ 
                backgroundColor: theme.palette.primary.main,
                width: `${progress}%`
              }}
            />
          </Box>
        </Box>
      )}

      {/* Error Display */}
      {error && (
        <Fade in={!!error}>
          <Alert 
            severity="error" 
            className="mb-4"
            icon={<ErrorIcon />}
            action={
              <IconButton
                color="inherit"
                size="small"
                onClick={() => {/* Error dismiss */}}
              >
                <CancelIcon fontSize="inherit" />
              </IconButton>
            }
          >
            {error}
          </Alert>
        </Fade>
      )}

      {/* Auto-Save Indicator */}
      {autoSave && isDirty && (
        <Snackbar
          open={true}
          message="Änderungen werden automatisch gespeichert..."
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ zIndex: 9999 }}
        />
      )}

      {/* Form */}
      <form 
        ref={formRef}
        onSubmit={handleSubmit(onSubmit)} 
        className={`space-y-6 ${layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : ''}`}
      >
        {/* Gruppierte Felder */}
        {Object.entries(groupedFields).map(([groupName, groupFields]) => (
          <Box key={groupName}>
            {groupName !== 'allgemein' && (
              <Typography variant="h6" className="mb-4 text-gray-800 border-b pb-2">
                {groupName.charAt(0).toUpperCase() + groupName.slice(1)}
              </Typography>
            )}
            
            <Box className={layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
              {groupFields
                .filter(field => visibleFields.includes(field))
                .map((field) => (
                  <MemoizedField
                    key={field.name}
                    field={field}
                    control={control}
                    errors={errors as Record<string, FieldError>}
                    disabled={disabled}
                    onFieldChange={onFieldChange}
                    theme={theme}
                  />
                ))}
            </Box>
            
            {groupName !== 'allgemein' && <Divider className="my-6" />}
          </Box>
        ))}

        {/* Action Buttons */}
        <Box className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-6">
          <Button
            type="submit"
            variant="contained"
            disabled={loading || isSubmitting || disabled || !isValid}
            className="flex-1 sm:flex-none"
            startIcon={
              loading || isSubmitting ? (
                <CircularProgress size={20} />
              ) : (
                <SaveIcon />
              )
            }
            size={size}
            sx={{
              minHeight: size === 'large' ? 56 : size === 'small' ? 40 : 48,
            }}
          >
            {loading || isSubmitting ? 'Wird gespeichert...' : submitText}
          </Button>

          {showCancelButton && (
            <Button
              type="button"
              variant="outlined"
              onClick={onCancel || (() => {})}
              disabled={loading || isSubmitting}
              className="flex-1 sm:flex-none"
              startIcon={<CancelIcon />}
              size={size}
              sx={{
                minHeight: size === 'large' ? 56 : size === 'small' ? 40 : 48,
              }}
            >
              {cancelText}
            </Button>
          )}
        </Box>

        {/* Keyboard Shortcuts Info */}
        {keyboardShortcuts && (
          <Box className="mt-4 p-3 bg-gray-50 rounded-lg">
            <Typography variant="caption" color="textSecondary">
              <strong>Tastenkürzel:</strong> Strg+S (Speichern), Esc (Abbrechen), Tab (Navigation)
            </Typography>
          </Box>
        )}
      </form>
    </Paper>
  );
});

OptimizedSimpleForm.displayName = 'OptimizedSimpleForm';

export default OptimizedSimpleForm; 