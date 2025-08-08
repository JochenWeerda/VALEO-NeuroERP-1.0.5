import React from 'react';
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { Controller, useFormContext } from 'react-hook-form';

// =====================================================
// STANDARDIZED FORM COMPONENTS
// =====================================================

export interface StandardFormFieldProps {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date';
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  helperText?: string;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  minLength?: number;
  pattern?: RegExp;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  showClearButton?: boolean;
  showInfoTooltip?: boolean;
  infoText?: string;
}

/**
 * Standardisiertes Textfeld für alle Formulare
 */
export const StandardTextField: React.FC<StandardFormFieldProps> = ({
  name,
  label,
  type = 'text',
  required = false,
  disabled = false,
  placeholder,
  helperText,
  multiline = false,
  rows = 1,
  maxLength,
  minLength,
  pattern,
  startAdornment,
  endAdornment,
  showClearButton = false,
  showInfoTooltip = false,
  infoText
}) => {
  const { control, formState: { errors }, watch, setValue } = useFormContext();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showClear, setShowClear] = React.useState(false);
  
  const value = watch(name);
  
  React.useEffect(() => {
    setShowClear(!!value && showClearButton);
  }, [value, showClearButton]);

  const handleClear = () => {
    setValue(name, '');
  };

  const getInputProps = () => {
    const props: any = {};
    
    if (startAdornment) {
      props.startAdornment = startAdornment;
    }
    
    if (endAdornment) {
      props.endAdornment = endAdornment;
    }
    
    if (type === 'password') {
      props.endAdornment = (
        <InputAdornment position="end">
          <IconButton
            onClick={() => setShowPassword(!showPassword)}
            edge="end"
          >
            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </IconButton>
        </InputAdornment>
      );
    }
    
    if (showClear && value) {
      props.endAdornment = (
        <InputAdornment position="end">
          <IconButton onClick={handleClear} edge="end">
            <ClearIcon />
          </IconButton>
        </InputAdornment>
      );
    }
    
    return props;
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={{
        required: required ? `${label} ist erforderlich` : false,
        minLength: minLength ? { value: minLength, message: `Mindestens ${minLength} Zeichen` } : undefined,
        maxLength: maxLength ? { value: maxLength, message: `Maximal ${maxLength} Zeichen` } : undefined,
        pattern: pattern ? { value: pattern, message: `Ungültiges Format` } : undefined
      }}
      render={({ field }) => (
        <Box sx={{ position: 'relative' }}>
          <TextField
            {...field}
            label={label}
            type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
            required={required}
            disabled={disabled}
            placeholder={placeholder}
            multiline={multiline}
            rows={rows}
            fullWidth
            variant="outlined"
            error={!!errors[name]}
            helperText={errors[name]?.message?.toString() || helperText}
            InputProps={getInputProps()}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
          {showInfoTooltip && (
            <Tooltip title={infoText || `Informationen zu ${label}`} placement="top">
              <IconButton
                size="small"
                sx={{
                  position: 'absolute',
                  right: -40,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'text.secondary'
                }}
              >
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}
    />
  );
};

export interface StandardSelectFieldProps {
  name: string;
  label: string;
  options: Array<{ value: string | number; label: string; disabled?: boolean }>;
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  helperText?: string;
  showInfoTooltip?: boolean;
  infoText?: string;
}

/**
 * Standardisiertes Select-Feld für alle Formulare
 */
export const StandardSelectField: React.FC<StandardSelectFieldProps> = ({
  name,
  label,
  options,
  required = false,
  disabled = false,
  multiple = false,
  helperText,
  showInfoTooltip = false,
  infoText
}) => {
  const { control, formState: { errors } } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      rules={{
        required: required ? `${label} ist erforderlich` : false
      }}
      render={({ field }) => (
        <Box sx={{ position: 'relative' }}>
          <FormControl fullWidth error={!!errors[name]} disabled={disabled}>
            <InputLabel>{label}</InputLabel>
            <Select
              {...field}
              label={label}
              multiple={multiple}
              sx={{
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
              }}
            >
              {options.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {(errors[name]?.message || helperText) && (
              <FormHelperText>{errors[name]?.message?.toString() || helperText}</FormHelperText>
            )}
          </FormControl>
          {showInfoTooltip && (
            <Tooltip title={infoText || `Informationen zu ${label}`} placement="top">
              <IconButton
                size="small"
                sx={{
                  position: 'absolute',
                  right: -40,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'text.secondary'
                }}
              >
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}
    />
  );
};

export interface StandardButtonProps {
  type?: 'submit' | 'button' | 'reset';
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  sx?: any;
}

/**
 * Standardisierter Button für alle Formulare
 */
export const StandardButton: React.FC<StandardButtonProps> = ({
  type = 'button',
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  startIcon,
  endIcon,
  onClick,
  children,
  sx = {}
}) => {
  return (
    <Button
      type={type}
      variant={variant}
      color={color}
      size={size}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      startIcon={loading ? <CircularProgress size={16} /> : startIcon}
      endIcon={endIcon}
      onClick={onClick}
      sx={{
        borderRadius: 2,
        textTransform: 'none',
        fontWeight: 500,
        ...sx
      }}
    >
      {children}
    </Button>
  );
};

/**
 * Standardisierte Formular-Aktionen
 */
export const FormActions: React.FC<{
  onSave?: () => void;
  onCancel?: () => void;
  onReset?: () => void;
  saveText?: string;
  cancelText?: string;
  resetText?: string;
  loading?: boolean;
  disabled?: boolean;
}> = ({
  onSave,
  onCancel,
  onReset,
  saveText = 'Speichern',
  cancelText = 'Abbrechen',
  resetText = 'Zurücksetzen',
  loading = false,
  disabled = false
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
      {onReset && (
        <StandardButton
          variant="outlined"
          color="secondary"
          onClick={onReset}
          disabled={disabled}
        >
          {resetText}
        </StandardButton>
      )}
      {onCancel && (
        <StandardButton
          variant="outlined"
          onClick={onCancel}
          disabled={disabled}
        >
          {cancelText}
        </StandardButton>
      )}
      {onSave && (
        <StandardButton
          type="submit"
          variant="contained"
          color="primary"
          onClick={onSave}
          loading={loading}
          disabled={disabled}
        >
          {saveText}
        </StandardButton>
      )}
    </Box>
  );
};

/**
 * Standardisierte Erfolgs-/Fehlermeldungen
 */
export const FormMessage: React.FC<{
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
}> = ({ type, title, message, onClose }) => {
  return (
    <Alert
      severity={type}
      onClose={onClose}
      sx={{ mb: 2, borderRadius: 2 }}
    >
      {title && <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{title}</Typography>}
      {message}
    </Alert>
  );
};

/**
 * Standardisierte Formular-Validierung
 */
export const useFormValidation = () => {
  const { formState: { errors, isValid, isDirty } } = useFormContext();
  
  const hasErrors = Object.keys(errors).length > 0;
  const errorMessages = Object.values(errors).map((error: any) => error.message);
  
  return {
    hasErrors,
    errorMessages,
    isValid,
    isDirty,
    errors
  };
};

/**
 * Standardisierte Formular-Labels
 */
export const FORM_LABELS = {
  // Allgemeine Labels
  SAVE: 'Speichern',
  CANCEL: 'Abbrechen',
  RESET: 'Zurücksetzen',
  DELETE: 'Löschen',
  EDIT: 'Bearbeiten',
  VIEW: 'Anzeigen',
  SEARCH: 'Suchen',
  FILTER: 'Filter',
  SORT: 'Sortieren',
  EXPORT: 'Exportieren',
  IMPORT: 'Importieren',
  
  // Formular-Labels
  NAME: 'Name',
  EMAIL: 'E-Mail',
  PHONE: 'Telefon',
  ADDRESS: 'Adresse',
  CITY: 'Stadt',
  ZIP_CODE: 'PLZ',
  COUNTRY: 'Land',
  DESCRIPTION: 'Beschreibung',
  NOTES: 'Notizen',
  STATUS: 'Status',
  PRIORITY: 'Priorität',
  DATE: 'Datum',
  TIME: 'Zeit',
  AMOUNT: 'Betrag',
  QUANTITY: 'Menge',
  PRICE: 'Preis',
  CURRENCY: 'Währung',
  
  // ERP-spezifische Labels
  CUSTOMER_NUMBER: 'Kundennummer',
  ORDER_NUMBER: 'Auftragsnummer',
  INVOICE_NUMBER: 'Rechnungsnummer',
  DELIVERY_NUMBER: 'Lieferscheinnummer',
  PRODUCT_NUMBER: 'Artikelnummer',
  SUPPLIER_NUMBER: 'Lieferantennummer',
  EMPLOYEE_NUMBER: 'Mitarbeiternummer',
  PROJECT_NUMBER: 'Projektnummer',
  
  // Status-Labels
  ACTIVE: 'Aktiv',
  INACTIVE: 'Inaktiv',
  PENDING: 'Ausstehend',
  COMPLETED: 'Abgeschlossen',
  CANCELLED: 'Storniert',
  DRAFT: 'Entwurf',
  PUBLISHED: 'Veröffentlicht',
  
  // Prioritäts-Labels
  LOW: 'Niedrig',
  MEDIUM: 'Mittel',
  HIGH: 'Hoch',
  URGENT: 'Dringend'
} as const;

export default {
  StandardTextField,
  StandardSelectField,
  StandardButton,
  FormActions,
  FormMessage,
  useFormValidation,
  FORM_LABELS
}; 