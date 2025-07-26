# ValeoFlow Design System
## SAP 4/HANA Fiori Design-Prinzipien für Enterprise UI

**Version:** 2.0.0  
**Datum:** 24. Juli 2025  
**Status:** Design System Spezifikation  
**Autor:** Claude Flow AI Agent  

---

## 🎨 **Design Philosophy**

### **SAP 4/HANA Fiori Design-Prinzipien**
- **Responsive Design:** Mobile-First, Touch-optimiert
- **Consistency:** Einheitliche Design-Sprache
- **Performance:** Schnelle Ladezeiten, optimierte Rendering
- **Accessibility:** WCAG 2.1 AA Compliance
- **Enterprise-Grade:** Skalierbar, wartbar, erweiterbar

### **ValeoFlow Design Tokens**
```typescript
// Design Tokens Definition
interface ValeoFlowDesignTokens {
  colors: {
    // Primary Colors
    primary: {
      50: '#eff6ff';
      100: '#dbeafe';
      200: '#bfdbfe';
      300: '#93c5fd';
      400: '#60a5fa';
      500: '#3b82f6';  // Main Primary
      600: '#2563eb';
      700: '#1d4ed8';
      800: '#1e40af';
      900: '#1e3a8a';
    };
    
    // Secondary Colors
    secondary: {
      50: '#fdf2f8';
      100: '#fce7f3';
      200: '#fbcfe8';
      300: '#f9a8d4';
      400: '#f472b6';
      500: '#ec4899';  // Main Secondary
      600: '#db2777';
      700: '#be185d';
      800: '#9d174d';
      900: '#831843';
    };
    
    // Semantic Colors
    success: '#10b981';
    warning: '#f59e0b';
    error: '#ef4444';
    info: '#3b82f6';
    
    // Neutral Colors
    gray: {
      50: '#f9fafb';
      100: '#f3f4f6';
      200: '#e5e7eb';
      300: '#d1d5db';
      400: '#9ca3af';
      500: '#6b7280';
      600: '#4b5563';
      700: '#374151';
      800: '#1f2937';
      900: '#111827';
    };
  };
  
  spacing: {
    xs: '0.25rem';    // 4px
    sm: '0.5rem';     // 8px
    md: '1rem';       // 16px
    lg: '1.5rem';     // 24px
    xl: '2rem';       // 32px
    '2xl': '3rem';    // 48px
    '3xl': '4rem';    // 64px
  };
  
  typography: {
    fontFamily: {
      sans: '"Inter", "Segoe UI", "Roboto", sans-serif';
      mono: '"Fira Code", "Consolas", monospace';
    };
    fontSize: {
      xs: '0.75rem';    // 12px
      sm: '0.875rem';   // 14px
      base: '1rem';     // 16px
      lg: '1.125rem';   // 18px
      xl: '1.25rem';    // 20px
      '2xl': '1.5rem';  // 24px
      '3xl': '1.875rem'; // 30px
      '4xl': '2.25rem';  // 36px
    };
    fontWeight: {
      light: '300';
      normal: '400';
      medium: '500';
      semibold: '600';
      bold: '700';
    };
  };
  
  borderRadius: {
    none: '0';
    sm: '0.125rem';   // 2px
    base: '0.25rem';  // 4px
    md: '0.375rem';   // 6px
    lg: '0.5rem';     // 8px
    xl: '0.75rem';    // 12px
    '2xl': '1rem';    // 16px
    full: '9999px';
  };
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
  };
}
```

---

## 🧩 **Component Library**

### **Core Components**

#### **1. ValeoFlowCard**
```typescript
interface ValeoFlowCardProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const ValeoFlowCard: React.FC<ValeoFlowCardProps> = ({
  variant = 'default',
  size = 'md',
  padding = 'md',
  children,
  className,
  onClick,
  disabled = false
}) => {
  const cardClasses = cn(
    'valeoflow-card',
    `valeoflow-card--${variant}`,
    `valeoflow-card--${size}`,
    `valeoflow-card--padding-${padding}`,
    {
      'valeoflow-card--clickable': onClick,
      'valeoflow-card--disabled': disabled
    },
    className
  );

  return (
    <div className={cardClasses} onClick={disabled ? undefined : onClick}>
      {children}
    </div>
  );
};
```

#### **2. ValeoFlowButton**
```typescript
interface ValeoFlowButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const ValeoFlowButton: React.FC<ValeoFlowButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className
}) => {
  const buttonClasses = cn(
    'valeoflow-button',
    `valeoflow-button--${variant}`,
    `valeoflow-button--${size}`,
    {
      'valeoflow-button--loading': loading,
      'valeoflow-button--disabled': disabled
    },
    className
  );

  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
    >
      {loading && <ValeoFlowSpinner size="sm" />}
      {icon && iconPosition === 'left' && !loading && icon}
      <span className="valeoflow-button__text">{children}</span>
      {icon && iconPosition === 'right' && !loading && icon}
    </button>
  );
};
```

#### **3. ValeoFlowInput**
```typescript
interface ValeoFlowInputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  error?: string;
  success?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  helperText?: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ValeoFlowInput: React.FC<ValeoFlowInputProps> = ({
  type = 'text',
  placeholder,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  error,
  success,
  disabled = false,
  required = false,
  label,
  helperText,
  icon,
  size = 'md',
  className
}) => {
  const inputClasses = cn(
    'valeoflow-input',
    `valeoflow-input--${size}`,
    {
      'valeoflow-input--error': error,
      'valeoflow-input--success': success,
      'valeoflow-input--disabled': disabled,
      'valeoflow-input--with-icon': icon
    },
    className
  );

  return (
    <div className="valeoflow-input-wrapper">
      {label && (
        <label className="valeoflow-input__label">
          {label}
          {required && <span className="valeoflow-input__required">*</span>}
        </label>
      )}
      <div className="valeoflow-input__container">
        {icon && <div className="valeoflow-input__icon">{icon}</div>}
        <input
          type={type}
          className={inputClasses}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          required={required}
        />
      </div>
      {(error || success || helperText) && (
        <div className={cn(
          'valeoflow-input__message',
          {
            'valeoflow-input__message--error': error,
            'valeoflow-input__message--success': success
          }
        )}>
          {error || success || helperText}
        </div>
      )}
    </div>
  );
};
```

#### **4. ValeoFlowDataTable**
```typescript
interface ValeoFlowDataTableProps<T> {
  data: T[];
  columns: ValeoFlowTableColumn<T>[];
  loading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    onPageChange: (page: number) => void;
  };
  sorting?: {
    sortBy: keyof T;
    sortDirection: 'asc' | 'desc';
    onSort: (column: keyof T) => void;
  };
  selection?: {
    selectedRows: T[];
    onSelectionChange: (rows: T[]) => void;
  };
  search?: {
    value: string;
    onSearch: (value: string) => void;
    placeholder?: string;
  };
  className?: string;
}

const ValeoFlowDataTable = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  pagination,
  sorting,
  selection,
  search,
  className
}: ValeoFlowDataTableProps<T>) => {
  return (
    <div className={cn('valeoflow-data-table', className)}>
      {/* Search Bar */}
      {search && (
        <div className="valeoflow-data-table__search">
          <ValeoFlowInput
            placeholder={search.placeholder || 'Suchen...'}
            value={search.value}
            onChange={search.onSearch}
            icon={<SearchIcon />}
          />
        </div>
      )}
      
      {/* Table */}
      <div className="valeoflow-data-table__container">
        <table className="valeoflow-data-table__table">
          <thead className="valeoflow-data-table__header">
            <tr>
              {selection && (
                <th className="valeoflow-data-table__checkbox">
                  <ValeoFlowCheckbox
                    checked={selection.selectedRows.length === data.length}
                    onChange={(checked) => {
                      if (checked) {
                        selection.onSelectionChange(data);
                      } else {
                        selection.onSelectionChange([]);
                      }
                    }}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    'valeoflow-data-table__column',
                    {
                      'valeoflow-data-table__column--sortable': column.sortable,
                      'valeoflow-data-table__column--sorted': 
                        sorting?.sortBy === column.key
                    }
                  )}
                  onClick={() => column.sortable && sorting?.onSort(column.key)}
                >
                  {column.header}
                  {column.sortable && sorting?.sortBy === column.key && (
                    <ValeoFlowIcon
                      name={sorting.sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'}
                      size="sm"
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="valeoflow-data-table__body">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selection ? 1 : 0)}>
                  <ValeoFlowSpinner />
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={index} className="valeoflow-data-table__row">
                  {selection && (
                    <td className="valeoflow-data-table__checkbox">
                      <ValeoFlowCheckbox
                        checked={selection.selectedRows.includes(row)}
                        onChange={(checked) => {
                          if (checked) {
                            selection.onSelectionChange([...selection.selectedRows, row]);
                          } else {
                            selection.onSelectionChange(
                              selection.selectedRows.filter(r => r !== row)
                            );
                          }
                        }}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={String(column.key)} className="valeoflow-data-table__cell">
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination && (
        <div className="valeoflow-data-table__pagination">
          <ValeoFlowPagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}
    </div>
  );
};
```

---

## 📱 **Responsive Design System**

### **Breakpoints**
```scss
// ValeoFlow Breakpoints
$valeoflow-breakpoints: (
  xs: 0,      // Extra Small: 0px - 575px
  sm: 576px,  // Small: 576px - 767px
  md: 768px,  // Medium: 768px - 991px
  lg: 992px,  // Large: 992px - 1199px
  xl: 1200px, // Extra Large: 1200px - 1399px
  xxl: 1400px // Extra Extra Large: 1400px+
);
```

### **Grid System**
```typescript
// ValeoFlow Grid Component
interface ValeoFlowGridProps {
  container?: boolean;
  item?: boolean;
  xs?: number | boolean;
  sm?: number | boolean;
  md?: number | boolean;
  lg?: number | boolean;
  xl?: number | boolean;
  xxl?: number | boolean;
  spacing?: 0 | 1 | 2 | 3 | 4 | 5;
  children: React.ReactNode;
  className?: string;
}

const ValeoFlowGrid: React.FC<ValeoFlowGridProps> = ({
  container = false,
  item = false,
  xs,
  sm,
  md,
  lg,
  xl,
  xxl,
  spacing = 0,
  children,
  className
}) => {
  const gridClasses = cn(
    {
      'valeoflow-grid': container,
      'valeoflow-grid__item': item,
      [`valeoflow-grid--spacing-${spacing}`]: container && spacing > 0
    },
    {
      [`valeoflow-grid__item--xs-${xs}`]: item && xs !== undefined,
      [`valeoflow-grid__item--sm-${sm}`]: item && sm !== undefined,
      [`valeoflow-grid__item--md-${md}`]: item && md !== undefined,
      [`valeoflow-grid__item--lg-${lg}`]: item && lg !== undefined,
      [`valeoflow-grid__item--xl-${xl}`]: item && xl !== undefined,
      [`valeoflow-grid__item--xxl-${xxl}`]: item && xxl !== undefined
    },
    className
  );

  return <div className={gridClasses}>{children}</div>;
};
```

---

## 🎯 **Accessibility (WCAG 2.1 AA)**

### **Accessibility Features**
```typescript
// Accessibility Hooks
const useAccessibility = () => {
  const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    // Detect user preferences
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleMotionChange);
    return () => mediaQuery.removeEventListener('change', handleMotionChange);
  }, []);

  return {
    isKeyboardNavigation,
    setIsKeyboardNavigation,
    isHighContrast,
    setIsHighContrast,
    isReducedMotion
  };
};

// Focus Management
const useFocusTrap = (ref: RefObject<HTMLElement>) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    return () => element.removeEventListener('keydown', handleKeyDown);
  }, [ref]);
};
```

---

## 🎨 **Theme Engine**

### **Theme Provider**
```typescript
interface ValeoFlowTheme {
  colors: ValeoFlowDesignTokens['colors'];
  spacing: ValeoFlowDesignTokens['spacing'];
  typography: ValeoFlowDesignTokens['typography'];
  borderRadius: ValeoFlowDesignTokens['borderRadius'];
  shadows: ValeoFlowDesignTokens['shadows'];
  mode: 'light' | 'dark';
}

const ValeoFlowThemeProvider: React.FC<{
  theme: ValeoFlowTheme;
  children: React.ReactNode;
}> = ({ theme, children }) => {
  return (
    <ThemeContext.Provider value={theme}>
      <div
        className={cn('valeoflow-theme', `valeoflow-theme--${theme.mode}`)}
        style={{
          '--valeoflow-primary-500': theme.colors.primary[500],
          '--valeoflow-secondary-500': theme.colors.secondary[500],
          '--valeoflow-success': theme.colors.success,
          '--valeoflow-warning': theme.colors.warning,
          '--valeoflow-error': theme.colors.error,
          '--valeoflow-spacing-md': theme.spacing.md,
          '--valeoflow-font-family': theme.typography.fontFamily.sans,
          '--valeoflow-border-radius': theme.borderRadius.md,
          '--valeoflow-shadow': theme.shadows.md
        } as React.CSSProperties}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
```

---

## 📊 **Performance Optimization**

### **Lazy Loading**
```typescript
// Lazy Loading Component
const ValeoFlowLazyLoad: React.FC<{
  children: React.ReactNode;
  threshold?: number;
  placeholder?: React.ReactNode;
}> = ({ children, threshold = 0.1, placeholder }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div ref={ref}>
      {!isLoaded && placeholder}
      {isVisible && (
        <div onLoad={() => setIsLoaded(true)}>
          {children}
        </div>
      )}
    </div>
  );
};
```

### **Virtual Scrolling**
```typescript
// Virtual Scrolling for Large Lists
const ValeoFlowVirtualList: React.FC<{
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
}> = ({ items, itemHeight, containerHeight, renderItem }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleItemCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleItemCount + 1, items.length);

  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return (
    <div
      ref={containerRef}
      className="valeoflow-virtual-list"
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => renderItem(item, startIndex + index))}
        </div>
      </div>
    </div>
  );
};
```

---

## 🧪 **Testing Strategy**

### **Component Testing**
```typescript
// Component Test Example
describe('ValeoFlowButton', () => {
  it('renders with correct variant and size', () => {
    render(
      <ValeoFlowButton variant="primary" size="md">
        Test Button
      </ValeoFlowButton>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('valeoflow-button--primary');
    expect(button).toHaveClass('valeoflow-button--md');
  });

  it('handles click events correctly', () => {
    const handleClick = jest.fn();
    render(
      <ValeoFlowButton onClick={handleClick}>
        Click Me
      </ValeoFlowButton>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is accessible with proper ARIA attributes', () => {
    render(
      <ValeoFlowButton aria-label="Submit form">
        Submit
      </ValeoFlowButton>
    );

    const button = screen.getByRole('button', { name: 'Submit form' });
    expect(button).toBeInTheDocument();
  });
});
```

---

## 📚 **Documentation & Usage**

### **Storybook Integration**
```typescript
// Storybook Story Example
export default {
  title: 'Components/ValeoFlowButton',
  component: ValeoFlowButton,
  parameters: {
    docs: {
      description: {
        component: 'Ein Enterprise-Grade Button-Component basierend auf SAP Fiori Design-Prinzipien.'
      }
    }
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger']
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg']
    }
  }
} as Meta;

const Template: Story<ValeoFlowButtonProps> = (args) => (
  <ValeoFlowButton {...args} />
);

export const Primary = Template.bind({});
Primary.args = {
  variant: 'primary',
  children: 'Primary Button'
};

export const Secondary = Template.bind({});
Secondary.args = {
  variant: 'secondary',
  children: 'Secondary Button'
};
```

---

**Das ValeoFlow Design System bietet eine vollständige, Enterprise-Grade UI-Bibliothek basierend auf SAP 4/HANA Fiori Design-Prinzipien mit Fokus auf Performance, Accessibility und Wartbarkeit.** 