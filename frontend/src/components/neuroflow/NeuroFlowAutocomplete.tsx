/**
 * 🧠 NeuroFlow Autocomplete Component
 * KI-first Autocomplete mit PostgreSQL-Integration für Stammdaten
 * Typeahead, Fuzzy Matching und intelligente Vorschläge
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  TextField,
  Autocomplete as MuiAutocomplete,
  CircularProgress,
  Chip,
  Box,
  Typography,
  Popper,
  Paper,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  AccountBalance as BankIcon,
  Science as ScienceIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import debounce from 'lodash/debounce';

// Styled Components
const StyledAutocomplete = styled(MuiAutocomplete)(({ theme }) => ({
  '& .MuiAutocomplete-inputRoot': {
    padding: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius * 1.5,
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
      boxShadow: theme.shadows[2],
    },
    '&.Mui-focused': {
      boxShadow: theme.shadows[4],
    },
  },
  '& .MuiAutocomplete-option': {
    padding: theme.spacing(1.5),
    '&[data-focus="true"]': {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.contrastText,
    },
  },
}));

const CustomPopper = styled(Popper)(({ theme }) => ({
  '& .MuiAutocomplete-paper': {
    borderRadius: theme.shape.borderRadius * 1.5,
    boxShadow: theme.shadows[8],
    border: `1px solid ${theme.palette.divider}`,
    maxHeight: 400,
  },
}));

// Autocomplete Option Interface
interface AutocompleteOption {
  id: string;
  value: string;
  label: string;
  type: 'customer' | 'supplier' | 'article' | 'personnel' | 'charge' | 'location' | 'bank';
  category?: string;
  subcategory?: string;
  icon?: React.ReactNode;
  metadata?: Record<string, any>;
  score?: number;
  isExact?: boolean;
  isFuzzy?: boolean;
}

// Autocomplete Props Interface
interface NeuroFlowAutocompleteProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string, option?: AutocompleteOption) => void;
  onSelect?: (option: AutocompleteOption) => void;
  type: 'customer' | 'supplier' | 'article' | 'personnel' | 'charge' | 'location' | 'bank';
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  variant?: 'outlined' | 'filled' | 'standard';
  showChips?: boolean;
  multiple?: boolean;
  maxSuggestions?: number;
  minChars?: number;
  debounceMs?: number;
  apiEndpoint?: string;
  customOptions?: AutocompleteOption[];
  onLoadOptions?: (query: string) => Promise<AutocompleteOption[]>;
  renderOption?: (option: AutocompleteOption) => React.ReactNode;
  getOptionLabel?: (option: AutocompleteOption) => string;
  filterOptions?: (options: AutocompleteOption[], inputValue: string) => AutocompleteOption[];
}

// Icon Mapping
const getIconForType = (type: string): React.ReactNode => {
  switch (type) {
    case 'customer':
      return <PersonIcon color="primary" />;
    case 'supplier':
      return <BusinessIcon color="secondary" />;
    case 'article':
      return <DescriptionIcon color="info" />;
    case 'personnel':
      return <PersonIcon color="success" />;
    case 'charge':
      return <ScienceIcon color="warning" />;
    case 'location':
      return <LocationIcon color="error" />;
    case 'bank':
      return <BankIcon color="primary" />;
    default:
      return <InfoIcon color="action" />;
  }
};

// Default API Endpoints
const getApiEndpoint = (type: string): string => {
  switch (type) {
    case 'customer':
      return '/api/customers/search';
    case 'supplier':
      return '/api/suppliers/search';
    case 'article':
      return '/api/articles/search';
    case 'personnel':
      return '/api/personnel/search';
    case 'charge':
      return '/api/charges/search';
    case 'location':
      return '/api/locations/search';
    case 'bank':
      return '/api/banks/search';
    default:
      return '/api/search';
  }
};

// Fuzzy Search Implementation
const fuzzySearch = (query: string, text: string): number => {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  if (textLower.includes(queryLower)) {
    return 1.0; // Exact match
  }
  
  // Simple fuzzy matching
  let score = 0;
  let queryIndex = 0;
  
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      score += 1;
      queryIndex++;
    }
  }
  
  return score / queryLower.length;
};

// NeuroFlow Autocomplete Component
export const NeuroFlowAutocomplete: React.FC<NeuroFlowAutocompleteProps> = ({
  label,
  placeholder,
  value,
  onChange,
  onSelect,
  type,
  required = false,
  disabled = false,
  error = false,
  helperText,
  fullWidth = true,
  size = 'medium',
  variant = 'outlined',
  showChips = false,
  multiple = false,
  maxSuggestions = 10,
  minChars = 2,
  debounceMs = 300,
  apiEndpoint,
  customOptions = [],
  onLoadOptions,
  renderOption,
  getOptionLabel,
  filterOptions,
}) => {
  const [options, setOptions] = useState<AutocompleteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [open, setOpen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < minChars) {
        setOptions([]);
        return;
      }

      setLoading(true);
      
      try {
        // Cancel previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        
        abortControllerRef.current = new AbortController();
        
        let searchResults: AutocompleteOption[] = [];
        
        // Use custom load function if provided
        if (onLoadOptions) {
          searchResults = await onLoadOptions(query);
        } else {
          // Default API call
          const endpoint = apiEndpoint || getApiEndpoint(type);
          const response = await fetch(`${endpoint}?q=${encodeURIComponent(query)}&limit=${maxSuggestions}`, {
            signal: abortControllerRef.current.signal,
          });
          
          if (response.ok) {
            const data = await response.json();
            searchResults = data.results || data || [];
          }
        }
        
        // Add custom options
        const allOptions = [...customOptions, ...searchResults];
        
        // Apply fuzzy matching and scoring
        const scoredOptions = allOptions.map(option => ({
          ...option,
          score: fuzzySearch(query, option.label),
          isExact: option.label.toLowerCase().includes(query.toLowerCase()),
          isFuzzy: !option.label.toLowerCase().includes(query.toLowerCase()) && fuzzySearch(query, option.label) > 0.5,
        }));
        
        // Sort by relevance
        const sortedOptions = scoredOptions
          .filter(option => option.score > 0.3)
          .sort((a, b) => {
            // Exact matches first
            if (a.isExact && !b.isExact) return -1;
            if (!a.isExact && b.isExact) return 1;
            
            // Then by score
            return (b.score || 0) - (a.score || 0);
          })
          .slice(0, maxSuggestions);
        
        setOptions(sortedOptions);
        
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Autocomplete search error:', error);
          setOptions([]);
        }
      } finally {
        setLoading(false);
      }
    }, debounceMs),
    [type, apiEndpoint, onLoadOptions, customOptions, maxSuggestions, minChars]
  );

  // Handle input change
  const handleInputChange = (event: React.SyntheticEvent, newInputValue: string) => {
    setInputValue(newInputValue);
    onChange(newInputValue);
    
    if (newInputValue.length >= minChars) {
      debouncedSearch(newInputValue);
    } else {
      setOptions([]);
    }
  };

  // Handle option selection
  const handleOptionSelect = (event: React.SyntheticEvent, option: AutocompleteOption | null) => {
    if (option) {
      onChange(option.value, option);
      onSelect?.(option);
    }
  };

  // Default option renderer
  const defaultRenderOption = (option: AutocompleteOption) => (
    <ListItem dense>
      <ListItemIcon>
        {option.icon || getIconForType(option.type)}
      </ListItemIcon>
      <ListItemText
        primary={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" fontWeight={option.isExact ? 600 : 400}>
              {option.label}
            </Typography>
            {option.isExact && (
              <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
            )}
            {option.isFuzzy && (
              <WarningIcon color="warning" sx={{ fontSize: 16 }} />
            )}
          </Box>
        }
        secondary={
          option.metadata && (
            <Typography variant="caption" color="text.secondary">
              {option.metadata.description || option.metadata.category || option.category}
            </Typography>
          )
        }
      />
    </ListItem>
  );

  // Default option label getter
  const defaultGetOptionLabel = (option: AutocompleteOption) => option.label;

  // Default filter function
  const defaultFilterOptions = (options: AutocompleteOption[], inputValue: string) => {
    return options.filter(option => 
      option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
      option.value.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  return (
    <StyledAutocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={options}
      loading={loading}
      value={value}
      onChange={handleOptionSelect}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      getOptionLabel={getOptionLabel || defaultGetOptionLabel}
      filterOptions={filterOptions || defaultFilterOptions as any}
      renderOption={renderOption || defaultRenderOption as any}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          required={required}
          error={error}
          helperText={helperText}
          fullWidth={fullWidth}
          size={size}
          variant={variant}
          disabled={disabled}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderTags={(tagValue, getTagProps) =>
        showChips && multiple
          ? tagValue.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                key={(option as any).id}
                label={(option as any).label}
                icon={(option as any).icon || getIconForType((option as any).type)}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))
          : null
      }
      PopperComponent={CustomPopper}
      multiple={multiple}
      freeSolo
      autoHighlight
      autoComplete
      includeInputInList
      filterSelectedOptions
      clearOnBlur={false}
      selectOnFocus
      handleHomeEndKeys
      blurOnSelect
    />
  );
};

// Specialized Autocomplete Components
export const CustomerAutocomplete: React.FC<Omit<NeuroFlowAutocompleteProps, 'type'>> = (props) => (
  <NeuroFlowAutocomplete
    {...props}
    type="customer"
    placeholder="Kundenname, -nummer oder E-Mail eingeben..."
    showChips={true}
  />
);

export const SupplierAutocomplete: React.FC<Omit<NeuroFlowAutocompleteProps, 'type'>> = (props) => (
  <NeuroFlowAutocomplete
    {...props}
    type="supplier"
    placeholder="Lieferantenname, -nummer oder Branche eingeben..."
    showChips={true}
  />
);

export const ArticleAutocomplete: React.FC<Omit<NeuroFlowAutocompleteProps, 'type'>> = (props) => (
  <NeuroFlowAutocomplete
    {...props}
    type="article"
    placeholder="Artikelnummer, -name oder Kategorie eingeben..."
    showChips={true}
  />
);

export const PersonnelAutocomplete: React.FC<Omit<NeuroFlowAutocompleteProps, 'type'>> = (props) => (
  <NeuroFlowAutocomplete
    {...props}
    type="personnel"
    placeholder="Mitarbeitername, -nummer oder Abteilung eingeben..."
    showChips={true}
  />
);

export const ChargeAutocomplete: React.FC<Omit<NeuroFlowAutocompleteProps, 'type'>> = (props) => (
  <NeuroFlowAutocomplete
    {...props}
    type="charge"
    placeholder="Chargennummer, Artikel oder Lieferant eingeben..."
    showChips={true}
  />
);

export default NeuroFlowAutocomplete; 