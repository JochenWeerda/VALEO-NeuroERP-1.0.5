import React from 'react';
import { cn } from '../lib/utils';
// ✅ NEU: Import der standardisierten UI-Komponenten
import { StandardTextField } from './forms/FormStandardization';
import { UI_LABELS } from './ui/UIStandardization';

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
    <StandardTextField
      name={inputId}
      label={label}
      type={type as 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date'}
      required={required}
      disabled={disabled}
      placeholder={placeholder}
      helperText={error || helperText}
    />
  );
}; 