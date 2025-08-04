import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  CircularProgress,
  Typography,
  Box,
  Chip,
  InputAdornment,
  IconButton,
  Tooltip,
  FormHelperText,
  LinearProgress
} from '@mui/material';
import {
  Check as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Visibility,
  VisibilityOff,
  Search,
  Clear
} from '@mui/icons-material';
import { debounce } from 'lodash';

// Typen
interface ValidationState {
  isValidating: boolean;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasChanges: boolean;
}

// Enhanced Input mit Live-Validierung
export const EnhancedTextField: React.FC<{
  value: string;
  onChange: (value: string) => void;
  validator?: (value: string) => Promise<ValidationState>;
  label: string;
  required?: boolean;
  type?: string;
  autoComplete?: string;
  helperText?: string;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
}> = ({
  value,
  onChange,
  validator,
  label,
  required = false,
  type = 'text',
  autoComplete,
  helperText,
  disabled = false,
  multiline = false,
  rows = 1
}) => {
  const [validation, setValidation] = useState<ValidationState>({
    isValidating: false,
    isValid: true,
    errors: [],
    warnings: []
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Debounced Validation
  const debouncedValidate = useRef(
    debounce(async (value: string) => {
      if (!validator) return;
      
      setValidation(prev => ({ ...prev, isValidating: true }));
      try {
        const result = await validator(value);
        setValidation(result);
      } catch (error) {
        setValidation({
          isValidating: false,
          isValid: false,
          errors: ['Validierungsfehler'],
          warnings: []
        });
      }
    }, 300)
  ).current;

  useEffect(() => {
    if (value && validator) {
      debouncedValidate(value);
    }
  }, [value, validator, debouncedValidate]);

  const getStatusIcon = () => {
    if (validation.isValidating) {
      return <CircularProgress size={20} />;
    }
    if (!validation.isValid) {
      return <ErrorIcon color="error" />;
    }
    if (validation.warnings.length > 0) {
      return <WarningIcon color="warning" />;
    }
    if (value && validation.isValid) {
      return <CheckIcon color="success" />;
    }
    return null;
  };

  const getHelperTexts = () => {
    const texts = [];
    if (validation.errors.length > 0) {
      texts.push(...validation.errors.map(e => ({ text: e, type: 'error' })));
    }
    if (validation.warnings.length > 0) {
      texts.push(...validation.warnings.map(w => ({ text: w, type: 'warning' })));
    }
    if (helperText && texts.length === 0) {
      texts.push({ text: helperText, type: 'info' });
    }
    return texts;
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <TextField
        fullWidth
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        required={required}
        type={type === 'password' && showPassword ? 'text' : type}
        autoComplete={autoComplete}
        disabled={disabled}
        multiline={multiline}
        rows={rows}
        error={!validation.isValid}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {type === 'password' && (
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  size="small"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              )}
              {getStatusIcon()}
            </InputAdornment>
          )
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            transition: 'all 0.2s',
            '&.Mui-focused': {
              transform: 'scale(1.01)',
              boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
            }
          }
        }}
      />
      
      {/* Helper Texts mit Animation */}
      <Box sx={{ mt: 0.5, minHeight: 20 }}>
        {getHelperTexts().map((helper, index) => (
          <FormHelperText
            key={index}
            error={helper.type === 'error'}
            sx={{
              color: helper.type === 'warning' ? 'warning.main' : undefined,
              fontSize: '0.75rem',
              animation: 'fadeIn 0.3s ease-in'
            }}
          >
            {helper.text}
          </FormHelperText>
        ))}
      </Box>

      {/* Zeichen-Zähler für Textfelder */}
      {multiline && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ position: 'absolute', bottom: 4, right: 4 }}
        >
          {value.length} Zeichen
        </Typography>
      )}
    </Box>
  );
};

// Auto-Complete Suchfeld
export const AutoCompleteSearch: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onSelect: (item: any) => void;
  searchFunction: (query: string) => Promise<any[]>;
  label: string;
  placeholder?: string;
  renderOption?: (item: any) => React.ReactNode;
}> = ({
  value,
  onChange,
  onSelect,
  searchFunction,
  label,
  placeholder,
  renderOption
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced Search
  const debouncedSearch = useRef(
    debounce(async (query: string) => {
      if (!query || query.length < 2) {
        setResults([]);
        return;
      }
      
      setIsSearching(true);
      try {
        const searchResults = await searchFunction(query);
        setResults(searchResults);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300)
  ).current;

  useEffect(() => {
    debouncedSearch(value);
  }, [value, debouncedSearch]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Box ref={searchRef} sx={{ position: 'relative' }}>
      <TextField
        fullWidth
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => results.length > 0 && setShowResults(true)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {isSearching && <CircularProgress size={20} />}
              {value && !isSearching && (
                <IconButton
                  size="small"
                  onClick={() => {
                    onChange('');
                    setResults([]);
                  }}
                >
                  <Clear />
                </IconButton>
              )}
            </InputAdornment>
          )
        }}
      />

      {/* Suchergebnisse */}
      {showResults && results.length > 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: 1,
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 3,
            maxHeight: 300,
            overflowY: 'auto',
            zIndex: 1000
          }}
        >
          {results.map((item, index) => (
            <Box
              key={index}
              onClick={() => {
                onSelect(item);
                setShowResults(false);
              }}
              sx={{
                p: 2,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'action.hover'
                },
                borderBottom: index < results.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider'
              }}
            >
              {renderOption ? renderOption(item) : (
                <Typography>{item.label || item.name || item.toString()}</Typography>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

// Auto-Save Indikator
export const AutoSaveIndicator: React.FC<{
  autoSaveState: AutoSaveState;
}> = ({ autoSaveState }) => {
  const { isSaving, lastSaved, hasChanges } = autoSaveState;

  const getStatusMessage = () => {
    if (isSaving) return 'Speichert...';
    if (lastSaved && !hasChanges) {
      const timeDiff = Date.now() - lastSaved.getTime();
      if (timeDiff < 60000) return 'Gespeichert';
      if (timeDiff < 3600000) return `Gespeichert vor ${Math.floor(timeDiff / 60000)} Min.`;
      return `Gespeichert um ${lastSaved.toLocaleTimeString()}`;
    }
    if (hasChanges) return 'Ungespeicherte Änderungen';
    return '';
  };

  const getStatusColor = () => {
    if (isSaving) return 'info';
    if (hasChanges) return 'warning';
    return 'success';
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {isSaving && <CircularProgress size={16} />}
      <Typography variant="caption" color={`${getStatusColor()}.main`}>
        {getStatusMessage()}
      </Typography>
    </Box>
  );
};

// Form Progress Tracker
export const FormProgressTracker: React.FC<{
  steps: { label: string; completed: boolean; current?: boolean }[];
}> = ({ steps }) => {
  const completedCount = steps.filter(s => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        {steps.map((step, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: step.completed ? 'success.main' : step.current ? 'primary.main' : 'grey.300',
                color: step.completed || step.current ? 'white' : 'text.secondary',
                fontWeight: 'bold',
                transition: 'all 0.3s'
              }}
            >
              {step.completed ? <CheckIcon fontSize="small" /> : index + 1}
            </Box>
            <Typography
              variant="caption"
              sx={{
                mt: 1,
                textAlign: 'center',
                color: step.current ? 'primary.main' : 'text.secondary'
              }}
            >
              {step.label}
            </Typography>
          </Box>
        ))}
      </Box>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 8,
          borderRadius: 4,
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
            transition: 'transform 0.3s ease'
          }
        }}
      />
    </Box>
  );
};

// Inline Validation Feedback
export const InlineValidationFeedback: React.FC<{
  field: string;
  value: any;
  rules: Array<{
    test: (value: any) => boolean;
    message: string;
    type: 'error' | 'warning' | 'success';
  }>;
}> = ({ field, value, rules }) => {
  const results = rules.map(rule => ({
    ...rule,
    passed: rule.test(value)
  }));

  return (
    <Box sx={{ mt: 1 }}>
      {results.map((result, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: result.passed
              ? result.type === 'success' ? 'success.main' : 'text.secondary'
              : result.type === 'error' ? 'error.main' : 'warning.main',
            fontSize: '0.875rem',
            transition: 'color 0.2s'
          }}
        >
          {result.passed ? (
            <CheckIcon fontSize="small" />
          ) : result.type === 'error' ? (
            <ErrorIcon fontSize="small" />
          ) : (
            <WarningIcon fontSize="small" />
          )}
          <Typography variant="caption">{result.message}</Typography>
        </Box>
      ))}
    </Box>
  );
};

// Tooltip Helper
export const TooltipHelper: React.FC<{
  title: string;
  content: string;
}> = ({ title, content }) => {
  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="body2">{content}</Typography>
        </Box>
      }
      placement="top"
      arrow
    >
      <IconButton size="small" sx={{ ml: 0.5 }}>
        <InfoIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};