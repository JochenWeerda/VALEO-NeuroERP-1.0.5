import React from 'react';
import { TextField } from '@mui/material';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'agent';
  icon?: string;
}

/**
 * ✅ REFAKTORIERT: Input-Komponente verwendet jetzt StandardTextField
 * 
 * Diese Komponente wurde refaktoriert um die neue StandardTextField-Komponente zu verwenden.
 * Alle Props werden an die StandardTextField-Komponente weitergeleitet.
 * 
 * @deprecated Verwenden Sie direkt StandardTextField aus FormStandardization
 */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  variant = 'default',
  icon,
  className,
  id,
  type = 'text',
  required = false,
  disabled = false,
  placeholder,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <TextField
      id={inputId}
      label={label}
      type={type}
      required={required}
      disabled={disabled}
      placeholder={placeholder}
      fullWidth
      variant="outlined"
      error={!!error}
      helperText={error || helperText}
      inputProps={props}
    />
  );
}; 