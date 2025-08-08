import React from 'react';
import { useForm, Controller, FieldError } from 'react-hook-form';
import {
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
  FormControlLabel
} from '@mui/material';
// ✅ NEU: Import der standardisierten UI-Komponenten
import { 
  StandardTextField, 
  StandardSelectField, 
  StandardButton, 
  FormActions, 
  FormMessage 
} from './FormStandardization';
import { UI_LABELS, StandardMessage } from '../ui/UIStandardization';

// Simple Form Component für VALEO NeuroERP
interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  options?: { value: string | number; label: string }[];
}

interface SimpleFormProps {
  fields: FormField[];
  onSubmit: (data: any) => void | Promise<void>;
  defaultValues?: Record<string, any>;
  loading?: boolean;
  error?: string | null;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  className?: string;
  showCancelButton?: boolean;
  disabled?: boolean;
}

export const SimpleForm: React.FC<SimpleFormProps> = ({
  fields,
  onSubmit,
  defaultValues = {},
  loading = false,
  error,
  submitText = UI_LABELS.ACTIONS.SAVE, // ✅ REFAKTORIERT: Standardisiertes Label
  cancelText = UI_LABELS.ACTIONS.CANCEL, // ✅ REFAKTORIERT: Standardisiertes Label
  onCancel,
  className = '',
  showCancelButton = true,
  disabled = false
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    defaultValues
  });

  const handleFormSubmit = async (data: any) => {
    try {
      await onSubmit(data);
    } catch (err) {
      console.error('Form submission error:', err);
    }
  };

  const handleCancel = () => {
    reset();
    onCancel?.();
  };

  // ✅ REFAKTORIERT: Rendering der Felder mit standardisierten Komponenten
  const renderField = (field: FormField) => {
    const fieldError = errors[field.name] as FieldError | undefined;
    const errorMessage = fieldError?.message as string;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
        return (
          <StandardTextField
            name={field.name}
            label={field.label}
            type={field.type}
            required={field.required}
            disabled={disabled || field.disabled}
            placeholder={field.placeholder}
            helperText={errorMessage}
          />
        );

      case 'number':
        return (
          <StandardTextField
            name={field.name}
            label={field.label}
            type="number"
            required={field.required}
            disabled={disabled || field.disabled}
            placeholder={field.placeholder}
            helperText={errorMessage}
          />
        );

      case 'select':
        return (
          <StandardSelectField
            name={field.name}
            label={field.label}
            options={field.options || []}
            required={field.required}
            disabled={disabled || field.disabled}
            helperText={errorMessage}
          />
        );

      case 'textarea':
        return (
          <StandardTextField
            name={field.name}
            label={field.label}
            type="text"
            required={field.required}
            disabled={disabled || field.disabled}
            placeholder={field.placeholder}
            helperText={errorMessage}
            multiline={true}
            rows={4}
          />
        );

      case 'date':
        return (
          <StandardTextField
            name={field.name}
            label={field.label}
            type="date"
            required={field.required}
            disabled={disabled || field.disabled}
            helperText={errorMessage}
          />
        );

      case 'checkbox':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: { onChange, value, ref } }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={value || false}
                    onChange={onChange}
                    disabled={disabled || field.disabled}
                    inputRef={ref}
                  />
                }
                label={field.label}
                className="mb-4"
              />
            )}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Box className={`space-y-6 ${className}`}>
      {/* ✅ REFAKTORIERT: Error-Message mit StandardMessage */}
      {error && (
        <StandardMessage
          type="error"
          message={error}
        />
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {fields.map((field) => (
          <Box key={field.name}>
            <Typography variant="subtitle2" className="mb-2 font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Typography>
            {renderField(field)}
          </Box>
        ))}

        {/* ✅ REFAKTORIERT: FormActions mit standardisierten Labels */}
        <FormActions
          onSave={handleSubmit(handleFormSubmit)}
          onCancel={showCancelButton ? handleCancel : undefined}
          saveText={loading || isSubmitting ? 'Wird gespeichert...' : submitText}
          cancelText={cancelText}
          loading={loading || isSubmitting}
          disabled={disabled}
        />
      </form>
    </Box>
  );
};

export default SimpleForm; 