/**
 * VALEO NeuroERP Design System
 * Basierend auf aktuellen UIX-Trends für ERP-Systeme 2024
 * 
 * Dieses Design-System implementiert moderne UI-Patterns für:
 * - Adaptive UI & Personalisierung
 * - Progressive Web App Standards
 * - Voice & Conversational UI
 * - Micro-Interactions & Feedback
 * - Dark Mode & Accessibility
 */

// ============================================================================
// DESIGN TOKENS - Zentrale Design-Werte
// ============================================================================

export const VALEO_DESIGN_TOKENS = {
  // Farben basierend auf modernen ERP-Trends
  colors: {
    // Primary Brand Colors
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Hauptfarbe
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a'
    },
    
    // Secondary Brand Colors
    secondary: {
      50: '#fdf2f8',
      100: '#fce7f3',
      200: '#fbcfe8',
      300: '#f9a8d4',
      400: '#f472b6',
      500: '#ec4899', // Sekundärfarbe
      600: '#db2777',
      700: '#be185d',
      800: '#9d174d',
      900: '#831843'
    },
    
    // Status Colors
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d'
    },
    
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309'
    },
    
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c'
    },
    
    // Neutral Colors
    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a'
    },
    
    // Dark Mode Colors
    dark: {
      background: '#0f172a',
      surface: '#1e293b',
      primary: '#60a5fa',
      text: '#f1f5f9',
      border: '#334155'
    }
  },
  
  // Spacing System (8px Grid)
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem'    // 64px
  },
  
  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px'
  },
  
  // Shadows (Material Design inspired)
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      mono: '"JetBrains Mono", "Fira Code", "Consolas", monospace'
    },
    fontSize: {
      xs: '0.75rem',   // 12px
      sm: '0.875rem',  // 14px
      base: '1rem',    // 16px
      lg: '1.125rem',  // 18px
      xl: '1.25rem',   // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem'   // 36px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75'
    }
  },
  
  // Transitions
  transitions: {
    fast: '150ms ease-in-out',
    normal: '250ms ease-in-out',
    slow: '350ms ease-in-out'
  },
  
  // Z-Index Scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070
  }
};

// ============================================================================
// COMPONENT PATTERNS - Moderne UI-Patterns
// ============================================================================

export const COMPONENT_PATTERNS = {
  // Card Patterns
  card: {
    base: {
      borderRadius: VALEO_DESIGN_TOKENS.borderRadius.lg,
      boxShadow: VALEO_DESIGN_TOKENS.shadows.md,
      transition: VALEO_DESIGN_TOKENS.transitions.normal,
      backgroundColor: 'white',
      border: '1px solid',
      borderColor: VALEO_DESIGN_TOKENS.colors.neutral[200]
    },
    hover: {
      transform: 'translateY(-2px)',
      boxShadow: VALEO_DESIGN_TOKENS.shadows.lg
    },
    interactive: {
      cursor: 'pointer',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: VALEO_DESIGN_TOKENS.shadows.lg
      }
    }
  },
  
  // Button Patterns
  button: {
    primary: {
      backgroundColor: VALEO_DESIGN_TOKENS.colors.primary[500],
      color: 'white',
      border: 'none',
      borderRadius: VALEO_DESIGN_TOKENS.borderRadius.md,
      padding: `${VALEO_DESIGN_TOKENS.spacing.sm} ${VALEO_DESIGN_TOKENS.spacing.lg}`,
      fontWeight: VALEO_DESIGN_TOKENS.typography.fontWeight.medium,
      transition: VALEO_DESIGN_TOKENS.transitions.fast,
      '&:hover': {
        backgroundColor: VALEO_DESIGN_TOKENS.colors.primary[600]
      }
    },
    secondary: {
      backgroundColor: 'transparent',
      color: VALEO_DESIGN_TOKENS.colors.primary[500],
      border: `1px solid ${VALEO_DESIGN_TOKENS.colors.primary[500]}`,
      borderRadius: VALEO_DESIGN_TOKENS.borderRadius.md,
      padding: `${VALEO_DESIGN_TOKENS.spacing.sm} ${VALEO_DESIGN_TOKENS.spacing.lg}`,
      fontWeight: VALEO_DESIGN_TOKENS.typography.fontWeight.medium,
      transition: VALEO_DESIGN_TOKENS.transitions.fast,
      '&:hover': {
        backgroundColor: VALEO_DESIGN_TOKENS.colors.primary[50]
      }
    }
  },
  
  // Form Patterns
  form: {
    input: {
      border: `1px solid ${VALEO_DESIGN_TOKENS.colors.neutral[300]}`,
      borderRadius: VALEO_DESIGN_TOKENS.borderRadius.md,
      padding: `${VALEO_DESIGN_TOKENS.spacing.sm} ${VALEO_DESIGN_TOKENS.spacing.md}`,
      fontSize: VALEO_DESIGN_TOKENS.typography.fontSize.base,
      transition: VALEO_DESIGN_TOKENS.transitions.fast,
      '&:focus': {
        outline: 'none',
        borderColor: VALEO_DESIGN_TOKENS.colors.primary[500],
        boxShadow: `0 0 0 3px ${VALEO_DESIGN_TOKENS.colors.primary[100]}`
      }
    },
    label: {
      fontSize: VALEO_DESIGN_TOKENS.typography.fontSize.sm,
      fontWeight: VALEO_DESIGN_TOKENS.typography.fontWeight.medium,
      color: VALEO_DESIGN_TOKENS.colors.neutral[700],
      marginBottom: VALEO_DESIGN_TOKENS.spacing.xs
    }
  },
  
  // Navigation Patterns
  navigation: {
    tab: {
      padding: `${VALEO_DESIGN_TOKENS.spacing.md} ${VALEO_DESIGN_TOKENS.spacing.lg}`,
      borderBottom: '2px solid transparent',
      transition: VALEO_DESIGN_TOKENS.transitions.fast,
      '&.active': {
        borderBottomColor: VALEO_DESIGN_TOKENS.colors.primary[500],
        color: VALEO_DESIGN_TOKENS.colors.primary[500]
      }
    }
  }
};

// ============================================================================
// RESPONSIVE BREAKPOINTS
// ============================================================================

export const BREAKPOINTS = {
  xs: '0px',
  sm: '600px',
  md: '960px',
  lg: '1280px',
  xl: '1920px'
};

// ============================================================================
// ACCESSIBILITY PATTERNS
// ============================================================================

export const ACCESSIBILITY = {
  // Focus Styles
  focus: {
    outline: 'none',
    boxShadow: `0 0 0 3px ${VALEO_DESIGN_TOKENS.colors.primary[100]}`,
    borderRadius: VALEO_DESIGN_TOKENS.borderRadius.sm
  },
  
  // Screen Reader Only
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: '0'
  },
  
  // High Contrast Mode
  highContrast: {
    border: '2px solid',
    backgroundColor: 'white',
    color: 'black'
  }
};

// ============================================================================
// ANIMATION PATTERNS
// ============================================================================

export const ANIMATIONS = {
  // Fade In
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: VALEO_DESIGN_TOKENS.transitions.normal
  },
  
  // Slide Up
  slideUp: {
    from: { transform: 'translateY(20px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
    duration: VALEO_DESIGN_TOKENS.transitions.normal
  },
  
  // Scale In
  scaleIn: {
    from: { transform: 'scale(0.95)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
    duration: VALEO_DESIGN_TOKENS.transitions.normal
  },
  
  // Loading Spinner
  spinner: {
    animation: 'spin 1s linear infinite',
    '@keyframes spin': {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' }
    }
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const DESIGN_UTILS = {
  // Color Utilities
  getColor: (color: string, shade: number = 500) => {
    return VALEO_DESIGN_TOKENS.colors[color]?.[shade] || color;
  },
  
  // Spacing Utilities
  getSpacing: (size: keyof typeof VALEO_DESIGN_TOKENS.spacing) => {
    return VALEO_DESIGN_TOKENS.spacing[size];
  },
  
  // Responsive Utilities
  isMobile: () => window.innerWidth < parseInt(BREAKPOINTS.md),
  isTablet: () => window.innerWidth >= parseInt(BREAKPOINTS.md) && window.innerWidth < parseInt(BREAKPOINTS.lg),
  isDesktop: () => window.innerWidth >= parseInt(BREAKPOINTS.lg),
  
  // Accessibility Utilities
  generateId: (prefix: string = 'valeo') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },
  
  // Theme Utilities
  getThemeColor: (isDark: boolean = false) => {
    return isDark ? VALEO_DESIGN_TOKENS.colors.dark : VALEO_DESIGN_TOKENS.colors;
  }
};

/**
 * VALERO Form Design Guidelines
 * Integration der VALERO XML-basierten Formular-Definitionen
 * als Referenz für unsere Designstandards
 */
export const VALERO_DESIGN_GUIDELINES = {
  /**
   * XML-Struktur für Formular-Definitionen
   * Basierend auf VALERO's modularem Ansatz
   */
  XML_STRUCTURE: {
    FORM: '<form> - Haupt-Container der Eingabemaske',
    SHEET: '<sheet> - Inhaltsbereich, der die Felder enthält',
    GROUP: '<group> - Gruppiert Felder logisch nebeneinander',
    FIELD: '<field name="..."> - Zeigt ein bestimmtes Feld aus dem Datenmodell',
    NOTEBOOK: '<notebook> - Erzeugt Registerkarten zur Strukturierung',
    PAGE: '<page string="..."> - Ein Tab im Notebook',
    RECORD: '<record> - Die XML-Definition eines View-Eintrags'
  },

  /**
   * Frontend-Rendering-Ansatz
   * Wie VALERO XML-Definitionen in UI umwandelt
   */
  RENDERING_APPROACH: {
    INTUITIVE_FIELDS: 'Intuitiv bedienbare Felder',
    TAB_STRUCTURE: 'Tabs zur besseren Übersicht',
    TOOLTIPS: 'Tooltips für Hilfestellung',
    REQUIRED_MARKING: 'Pflichtfeld-Markierung',
    DYNAMIC_BEHAVIOR: 'Dynamisches Verhalten',
    VALIDATION: 'Validierung beim Speichern',
    WIDGETS: 'Optional mit Widget (z.B. Bild-Upload, Zeiterfassung, One2many-Tabelle)'
  },

  /**
   * Erweiterungen & Dynamik
   * VALERO's dynamische Features für Formulare
   */
  DYNAMIC_FEATURES: {
    ONCHANGE: '@api.onchange - Felder ändern sich dynamisch beim Editieren',
    WIDGET_TYPES: 'Many2many-Tags, Bilder, Checkboxen',
    DOMAIN_CONTEXT: 'Filterung von Auswahlfeldern abhängig von Bedingungen',
    ACCESS_RIGHTS: 'Nur bestimmte Gruppen sehen Felder'
  },

  /**
   * Design-Prinzipien von VALERO
   */
  DESIGN_PRINCIPLES: {
    MODULAR: 'Modular, XML-basiert definiert',
    DATA_MODEL_BOUND: 'Datenmodell-gebunden (<field name="...">)',
    FLEXIBLE: 'Extrem flexibel über dynamische Logik, Domains und Widgets',
    BACKEND_SUPPORTED: 'Im Backend durch Python/TypeScript-Klassen mit Business-Logik unterstützt',
    FRONTEND_INTEGRATED: 'Im Frontend vollständig integriert und nutzerfreundlich'
  },

  /**
   * Beispiel: Produkt-Formular Struktur
   * Referenz für unsere Formular-Implementierungen
   */
  EXAMPLE_PRODUCT_FORM: {
    BASIC_FIELDS: ['name', 'default_code', 'categ_id', 'type'],
    PRICING_FIELDS: ['list_price', 'standard_price', 'uom_id', 'uom_po_id'],
    TABS: {
      DESCRIPTION: 'Beschreibung - description',
      INVENTORY: 'Lager - qty_available, virtual_available, incoming_qty, outgoing_qty'
    }
  }
} as const;

// ============================================================================
// EXPORT ALL DESIGN SYSTEM COMPONENTS
// ============================================================================

export default {
  tokens: VALEO_DESIGN_TOKENS,
  patterns: COMPONENT_PATTERNS,
  breakpoints: BREAKPOINTS,
  accessibility: ACCESSIBILITY,
  animations: ANIMATIONS,
  utils: DESIGN_UTILS
}; 