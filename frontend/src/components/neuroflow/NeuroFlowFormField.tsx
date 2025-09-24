import React from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Checkbox,
  FormControlLabel,
  Box,
  Typography
} from '@mui/material';
import { neuroFlowColors, neuroFlowTypography } from '../../design-system/NeuroFlowTheme';

// NeuroFlow Border Radius Standards
const neuroFlowBorderRadius = {
  small: '4px',
  medium: '6px', 
  large: '8px',
  xlarge: '12px'
};

export interface NeuroFlowFormFieldProps {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea';
  value: any;
  onChange: (value: any) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  options?: { value: string | number; label: string }[];
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
}

export const NeuroFlowFormField: React.FC<NeuroFlowFormFieldProps> = ({
  name,
  label,
  type,
  value,
  onChange,
  required = false,
  disabled = false,
  error,
  helperText,
  options = [],
  placeholder,
  multiline = false,
  rows = 3,
  fullWidth = true,
  size = 'medium'
}) => {
  // NeuroFlow Form Field Styles
  const neuroFlowFieldStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: neuroFlowBorderRadius.large,
      backgroundColor: neuroFlowColors.surface.primary,
      fontFamily: neuroFlowTypography.fontFamily,
      fontSize: neuroFlowTypography.body1.fontSize,
      '&:hover': {
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: neuroFlowColors.primary[300]
        }
      },
      '&.Mui-focused': {
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: neuroFlowColors.primary[500]
        }
      },
      '&.Mui-error': {
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: neuroFlowColors.error[500]
        }
      },
      '&.Mui-disabled': {
        backgroundColor: neuroFlowColors.neutral[100]
      }
    },
    '& .MuiInputLabel-root': {
      color: neuroFlowColors.neutral[600],
      fontFamily: neuroFlowTypography.fontFamily,
      fontSize: neuroFlowTypography.body1.fontSize,
      fontWeight: neuroFlowTypography.body1.fontWeight,
      '&.Mui-focused': {
        color: neuroFlowColors.primary[500]
      },
      '&.Mui-error': {
        color: neuroFlowColors.error[500]
      }
    },
    '& .MuiFormHelperText-root': {
      fontFamily: neuroFlowTypography.fontFamily,
      fontSize: neuroFlowTypography.body2.fontSize,
      fontWeight: neuroFlowTypography.body2.fontWeight,
      marginLeft: '0px',
      '&.Mui-error': {
        color: neuroFlowColors.error[500]
      }
    }
  };

  const neuroFlowSelectStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: neuroFlowBorderRadius.large,
      backgroundColor: neuroFlowColors.surface.primary,
      fontFamily: neuroFlowTypography.fontFamily,
      fontSize: neuroFlowTypography.body1.fontSize,
      '&:hover': {
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: neuroFlowColors.primary[300]
        }
      },
      '&.Mui-focused': {
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: neuroFlowColors.primary[500]
        }
      }
    },
    '& .MuiInputLabel-root': {
      color: neuroFlowColors.neutral[600],
      fontFamily: neuroFlowTypography.fontFamily,
      fontSize: neuroFlowTypography.body1.fontSize,
      fontWeight: neuroFlowTypography.body1.fontWeight
    }
  };

  const neuroFlowCheckboxStyles = {
    '& .MuiFormControlLabel-root': {
      fontFamily: neuroFlowTypography.fontFamily,
      fontSize: neuroFlowTypography.body1.fontSize,
      fontWeight: neuroFlowTypography.body1.fontWeight,
      color: neuroFlowColors.neutral[700]
    },
    '& .MuiCheckbox-root': {
      color: neuroFlowColors.neutral[400],
      '&.Mui-checked': {
        color: neuroFlowColors.primary[500]
      },
      '&.Mui-disabled': {
        color: neuroFlowColors.neutral[300]
      }
    }
  };

  const renderField = () => {
    switch (type) {
      case 'select':
        return (
          <FormControl 
            fullWidth={fullWidth} 
            error={!!error}
            disabled={disabled}
            size={size}
            sx={neuroFlowSelectStyles}
          >
            <InputLabel id={`${name}-label`}>{label}</InputLabel>
            <Select
              labelId={`${name}-label`}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              label={label}
              inputProps={{
                'aria-label': `${label} auswählen`,
                'aria-describedby': `${name}-helper-text`
              }}
            >
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {(error || helperText) && (
              <FormHelperText id={`${name}-helper-text`}>
                {error || helperText}
              </FormHelperText>
            )}
          </FormControl>
        );

      case 'checkbox':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={value || false}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
                inputProps={{
                  'aria-label': label,
                  'aria-describedby': `${name}-helper-text`
                }}
              />
            }
            label={label}
            sx={neuroFlowCheckboxStyles}
          />
        );

      case 'textarea':
        return (
          <TextField
            fullWidth={fullWidth}
            label={label}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            disabled={disabled}
            error={!!error}
            helperText={error || helperText}
            multiline={multiline}
            rows={rows}
            placeholder={placeholder}
            size={size}
            sx={neuroFlowFieldStyles}
            inputProps={{
              'aria-label': `${label} eingeben`,
              'aria-describedby': `${name}-helper-text`
            }}
            FormHelperTextProps={{
              id: `${name}-helper-text`
            }}
          />
        );

      default:
        return (
          <TextField
            fullWidth={fullWidth}
            label={label}
            type={type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            disabled={disabled}
            error={!!error}
            helperText={error || helperText}
            placeholder={placeholder}
            size={size}
            sx={neuroFlowFieldStyles}
            inputProps={{
              'aria-label': `${label} eingeben`,
              'aria-describedby': `${name}-helper-text`
            }}
            FormHelperTextProps={{
              id: `${name}-helper-text`
            }}
          />
        );
    }
  };

  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
      {renderField()}
    </Box>
  );
};

// NeuroFlow Form Section Component
export interface NeuroFlowFormSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
}

export const NeuroFlowFormSection: React.FC<NeuroFlowFormSectionProps> = ({
  title,
  subtitle,
  children,
  collapsible = false,
  expanded = true,
  onToggle
}) => {
  return (
    <Box
      sx={{
        marginBottom: '24px',
        padding: '20px',
        backgroundColor: neuroFlowColors.surface.secondary,
        borderRadius: neuroFlowBorderRadius.large,
        border: `1px solid ${neuroFlowColors.neutral[200]}`
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          cursor: collapsible ? 'pointer' : 'default'
        }}
        onClick={collapsible ? onToggle : undefined}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontFamily: neuroFlowTypography.fontFamily,
              fontSize: neuroFlowTypography.h6.fontSize,
              fontWeight: neuroFlowTypography.h6.fontWeight,
              color: neuroFlowColors.neutral[800]
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              sx={{
                fontFamily: neuroFlowTypography.fontFamily,
                fontSize: neuroFlowTypography.body2.fontSize,
                color: neuroFlowColors.neutral[600],
                marginTop: '4px'
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      
      {expanded && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {children}
        </Box>
      )}
    </Box>
  );
};

// NeuroFlow Form Actions Component
export interface NeuroFlowFormActionsProps {
  onSubmit?: () => void;
  onCancel?: () => void;
  onReset?: () => void;
  submitText?: string;
  cancelText?: string;
  resetText?: string;
  loading?: boolean;
  disabled?: boolean;
}

export const NeuroFlowFormActions: React.FC<NeuroFlowFormActionsProps> = ({
  onSubmit,
  onCancel,
  onReset,
  submitText = 'Speichern',
  cancelText = 'Abbrechen',
  resetText = 'Zurücksetzen',
  loading = false,
  disabled = false
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
        marginTop: '24px',
        paddingTop: '16px',
        borderTop: `1px solid ${neuroFlowColors.neutral[200]}`
      }}
    >
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          disabled={disabled}
          style={{
            padding: '8px 16px',
            borderRadius: neuroFlowBorderRadius.medium,
            border: `1px solid ${neuroFlowColors.neutral[400]}`,
            backgroundColor: 'transparent',
            color: neuroFlowColors.neutral[700],
            fontFamily: neuroFlowTypography.fontFamily,
            fontSize: neuroFlowTypography.body1.fontSize,
            fontWeight: neuroFlowTypography.body1.fontWeight,
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1
          }}
        >
          {resetText}
        </button>
      )}
      
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={disabled}
          style={{
            padding: '8px 16px',
            borderRadius: neuroFlowBorderRadius.medium,
            border: `1px solid ${neuroFlowColors.neutral[400]}`,
            backgroundColor: 'transparent',
            color: neuroFlowColors.neutral[700],
            fontFamily: neuroFlowTypography.fontFamily,
            fontSize: neuroFlowTypography.body1.fontSize,
            fontWeight: neuroFlowTypography.body1.fontWeight,
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1
          }}
        >
          {cancelText}
        </button>
      )}
      
      {onSubmit && (
        <button
          type="submit"
          onClick={onSubmit}
          disabled={disabled || loading}
          style={{
            padding: '8px 16px',
            borderRadius: neuroFlowBorderRadius.medium,
            border: 'none',
            backgroundColor: loading ? neuroFlowColors.neutral[400] : neuroFlowColors.primary[500],
            color: 'white',
            fontFamily: neuroFlowTypography.fontFamily,
            fontSize: neuroFlowTypography.body1.fontSize,
            fontWeight: neuroFlowTypography.body1.fontWeight,
            cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
            opacity: (disabled || loading) ? 0.5 : 1
          }}
        >
          {loading ? 'Speichern...' : submitText}
        </button>
      )}
    </Box>
  );
};