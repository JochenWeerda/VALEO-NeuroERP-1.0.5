import React from 'react';
import { useForm, Controller } from 'react-hook-form';
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
  FormControlLabel
} from '@mui/material';

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
  submitText = 'Speichern',
  cancelText = 'Abbrechen',
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

  const renderField = (field: FormField) => {
    const fieldError = errors[field.name];
    const errorMessage = fieldError?.message as string;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={{ required: field.required ? 'Dieses Feld ist erforderlich' : false }}
            render={({ field: { onChange, value, ref } }) => (
              <TextField
                {...field}
                type={field.type}
                fullWidth
                value={value || ''}
                onChange={onChange}
                inputRef={ref}
                error={!!fieldError}
                helperText={errorMessage}
                disabled={disabled || field.disabled}
                placeholder={field.placeholder}
                className="mb-4"
              />
            )}
          />
        );

      case 'number':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={{ required: field.required ? 'Dieses Feld ist erforderlich' : false }}
            render={({ field: { onChange, value, ref } }) => (
              <TextField
                {...field}
                type="number"
                fullWidth
                value={value || ''}
                onChange={onChange}
                inputRef={ref}
                error={!!fieldError}
                helperText={errorMessage}
                disabled={disabled || field.disabled}
                placeholder={field.placeholder}
                className="mb-4"
              />
            )}
          />
        );

      case 'textarea':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={{ required: field.required ? 'Dieses Feld ist erforderlich' : false }}
            render={({ field: { onChange, value, ref } }) => (
              <TextField
                {...field}
                multiline
                rows={4}
                fullWidth
                value={value || ''}
                onChange={onChange}
                inputRef={ref}
                error={!!fieldError}
                helperText={errorMessage}
                disabled={disabled || field.disabled}
                placeholder={field.placeholder}
                className="mb-4"
              />
            )}
          />
        );

      case 'select':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={{ required: field.required ? 'Dieses Feld ist erforderlich' : false }}
            render={({ field: { onChange, value, ref } }) => (
              <FormControl fullWidth error={!!fieldError} className="mb-4">
                <InputLabel>{field.label}</InputLabel>
                <Select
                  value={value || ''}
                  onChange={onChange}
                  inputRef={ref}
                  disabled={disabled || field.disabled}
                  label={field.label}
                >
                  {field.options?.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
              </FormControl>
            )}
          />
        );

      case 'date':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={{ required: field.required ? 'Dieses Feld ist erforderlich' : false }}
            render={({ field: { onChange, value, ref } }) => (
              <TextField
                {...field}
                type="date"
                fullWidth
                value={value || ''}
                onChange={onChange}
                inputRef={ref}
                error={!!fieldError}
                helperText={errorMessage}
                disabled={disabled || field.disabled}
                InputLabelProps={{ shrink: true }}
                className="mb-4"
              />
            )}
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
                    checked={!!value}
                    onChange={onChange}
                    inputRef={ref}
                    disabled={disabled || field.disabled}
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
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
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

        <Box className="flex space-x-4 pt-4">
          <Button
            type="submit"
            variant="contained"
            disabled={loading || isSubmitting || disabled}
            className="flex-1"
            startIcon={loading || isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {loading || isSubmitting ? 'Wird gespeichert...' : submitText}
          </Button>

          {showCancelButton && (
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              disabled={loading || isSubmitting}
              className="flex-1"
            >
              {cancelText}
            </Button>
          )}
        </Box>
      </form>
    </Box>
  );
};

export default SimpleForm; 