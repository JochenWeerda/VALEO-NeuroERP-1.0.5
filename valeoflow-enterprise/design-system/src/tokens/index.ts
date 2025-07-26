/**
 * ValeoFlow Design Tokens
 * SAP Fiori Style Design System für Enterprise ERP
 * Token-optimiert für konsistente UI/UX
 * 
 * @author VALEO NeuroERP Team
 * @version 1.0.0
 */

// ValeoFlow Design Tokens Definition
export interface ValeoFlowDesignTokens {
  colors: {
    // Primary Colors - SAP Fiori Blue
    primary: {
      50: '#eff6ff';
      100: '#dbeafe';
      200: '#bfdbfe';
      300: '#93c5fd';
      400: '#60a5fa';
      500: '#3b82f6';  // Main Primary - SAP Fiori Blue
      600: '#2563eb';
      700: '#1d4ed8';
      800: '#1e40af';
      900: '#1e3a8a';
    };
    
    // Secondary Colors - SAP Fiori Orange
    secondary: {
      50: '#fff7ed';
      100: '#ffedd5';
      200: '#fed7aa';
      300: '#fdba74';
      400: '#fb923c';
      500: '#f97316';  // Main Secondary - SAP Fiori Orange
      600: '#ea580c';
      700: '#c2410c';
      800: '#9a3412';
      900: '#7c2d12';
    };
    
    // Semantic Colors - SAP Fiori Status
    success: '#10b981';  // SAP Success Green
    warning: '#f59e0b';  // SAP Warning Orange
    error: '#ef4444';    // SAP Error Red
    info: '#3b82f6';     // SAP Info Blue
    
    // Neutral Colors - SAP Fiori Gray Scale
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
    
    // Background Colors
    background: {
      primary: '#ffffff';
      secondary: '#f8fafc';
      tertiary: '#f1f5f9';
      dark: '#0f172a';
    };
    
    // Surface Colors
    surface: {
      primary: '#ffffff';
      secondary: '#f8fafc';
      elevated: '#ffffff';
      overlay: 'rgba(0, 0, 0, 0.5)';
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
    '4xl': '6rem';    // 96px
  };
  
  typography: {
    fontFamily: {
      sans: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", sans-serif';
      mono: '"Fira Code", "Consolas", "Monaco", monospace';
      display: '"Inter", "Segoe UI", sans-serif';
    };
    
    fontSize: {
      xs: '0.75rem';      // 12px
      sm: '0.875rem';     // 14px
      base: '1rem';       // 16px
      lg: '1.125rem';     // 18px
      xl: '1.25rem';      // 20px
      '2xl': '1.5rem';    // 24px
      '3xl': '1.875rem';  // 30px
      '4xl': '2.25rem';   // 36px
      '5xl': '3rem';      // 48px
    };
    
    fontWeight: {
      light: '300';
      normal: '400';
      medium: '500';
      semibold: '600';
      bold: '700';
      extrabold: '800';
    };
    
    lineHeight: {
      none: '1';
      tight: '1.25';
      snug: '1.375';
      normal: '1.5';
      relaxed: '1.625';
      loose: '2';
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
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
  };
  
  breakpoints: {
    xs: '0px';
    sm: '600px';
    md: '900px';
    lg: '1200px';
    xl: '1536px';
  };
  
  zIndex: {
    hide: '-1';
    auto: 'auto';
    base: '0';
    docked: '10';
    dropdown: '1000';
    sticky: '1100';
    banner: '1200';
    overlay: '1300';
    modal: '1400';
    popover: '1500';
    skipLink: '1600';
    toast: '1700';
    tooltip: '1800';
  };
  
  animation: {
    duration: {
      fast: '150ms';
      normal: '250ms';
      slow: '350ms';
    };
    
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)';
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)';
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)';
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)';
    };
  };
}

// ValeoFlow Design Tokens Instance
export const valeofowTokens: ValeoFlowDesignTokens = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a'
    },
    secondary: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12'
    },
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827'
    },
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
      dark: '#0f172a'
    },
    surface: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      elevated: '#ffffff',
      overlay: 'rgba(0, 0, 0, 0.5)'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem'
  },
  typography: {
    fontFamily: {
      sans: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
      mono: '"Fira Code", "Consolas", "Monaco", monospace',
      display: '"Inter", "Segoe UI", sans-serif'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem'
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800'
    },
    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2'
    }
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  },
  breakpoints: {
    xs: '0px',
    sm: '600px',
    md: '900px',
    lg: '1200px',
    xl: '1536px'
  },
  zIndex: {
    hide: '-1',
    auto: 'auto',
    base: '0',
    docked: '10',
    dropdown: '1000',
    sticky: '1100',
    banner: '1200',
    overlay: '1300',
    modal: '1400',
    popover: '1500',
    skipLink: '1600',
    toast: '1700',
    tooltip: '1800'
  },
  animation: {
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms'
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
};

export default valeofowTokens; 