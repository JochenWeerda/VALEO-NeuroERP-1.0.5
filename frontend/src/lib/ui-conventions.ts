/**
 * VALEO NeuroERP UI-Konventionen
 * Hybrid-Ansatz: Material-UI + Tailwind CSS
 * 
 * Diese Datei definiert die Regeln für ein einheitliches Look & Feel
 * in einem modernen Enterprise-System.
 */

// ============================================================================
// ENTSCHEIDUNGSMATRIX: Wann welche UI-Bibliothek verwenden?
// ============================================================================

export const UI_DECISION_MATRIX = {
  // MATERIAL-UI VERWENDEN für:
  materialUI: {
    // Komplexe Formulare und Eingabefelder
    forms: [
      'Validierungslogik',
      'Komplexe Formulare',
      'Datei-Upload',
      'Rich Text Editor',
      'Datum/Zeit-Picker',
      'Autocomplete-Felder'
    ],
    
    // Datenvisualisierung und Tabellen
    dataDisplay: [
      'DataGrid mit Sortierung/Filterung',
      'Charts und Diagramme',
      'Paginierung',
      'Virtuelle Scrolling',
      'Export-Funktionen',
      'Bulk-Aktionen'
    ],
    
    // Navigation und Layout
    navigation: [
      'Breadcrumbs',
      'Tabs',
      'Stepper',
      'Drawer/Sidebar',
      'App Bar',
      'Bottom Navigation'
    ],
    
    // Feedback und Interaktion
    feedback: [
      'Snackbars/Toasts',
      'Progress Indicators',
      'Skeletons',
      'Tooltips',
      'Popover',
      'Modal/Dialog'
    ],
    
    // Enterprise-spezifische Komponenten
    enterprise: [
      'Benutzerverwaltung',
      'Berechtigungssystem',
      'Audit-Logs',
      'System-Einstellungen',
      'Backup/Restore',
      'Monitoring-Dashboards'
    ]
  },
  
  // TAILWIND CSS VERWENDEN für:
  tailwind: {
    // Layout und Spacing
    layout: [
      'Container-Layouts',
      'Grid-System',
      'Spacing und Padding',
      'Responsive Breakpoints',
      'Flexbox-Layouts',
      'Positioning'
    ],
    
    // Einfache UI-Elemente
    simpleUI: [
      'Einfache Buttons',
      'Badges/Labels',
      'Cards (einfach)',
      'Icons mit FontAwesome',
      'Status-Indikatoren',
      'Loading-Spinner'
    ],
    
    // Custom Styling
    custom: [
      'Brand-spezifische Farben',
      'Custom Animations',
      'Gradient-Hintergründe',
      'Custom Borders',
      'Shadow-Effekte',
      'Hover-States'
    ],
    
    // Performance-kritische Bereiche
    performance: [
      'Liste mit vielen Items',
      'Dashboard-Widgets',
      'Statistik-Karten',
      'Aktivitäts-Feeds',
      'Notification-Badges',
      'Quick-Actions'
    ]
  }
} as const;

// ============================================================================
// KOMPONENTEN-KATEGORIEN UND STYLING-RICHTLINIEN
// ============================================================================

export const COMPONENT_CATEGORIES = {
  // Enterprise-Kernkomponenten (Material-UI)
  enterprise: {
    description: 'Kritische Business-Funktionen mit hoher Komplexität',
    styling: 'material-ui',
    examples: [
      'UserManagement',
      'RolePermissions',
      'AuditTrail',
      'SystemSettings',
      'DataExport',
      'BackupRestore'
    ]
  },
  
  // Datenvisualisierung (Material-UI)
  dataVisualization: {
    description: 'Tabellen, Charts, Reports und Analytics',
    styling: 'material-ui',
    examples: [
      'DataGrid',
      'Charts',
      'Reports',
      'Analytics',
      'KPI-Dashboards',
      'Trend-Analysis'
    ]
  },
  
  // Formulare (Material-UI)
  forms: {
    description: 'Komplexe Eingabeformulare mit Validierung',
    styling: 'material-ui',
    examples: [
      'UserForms',
      'ConfigurationForms',
      'DataEntryForms',
      'SearchForms',
      'FilterForms',
      'SettingsForms'
    ]
  },
  
  // Navigation (Material-UI)
  navigation: {
    description: 'App-Navigation und Routing',
    styling: 'material-ui',
    examples: [
      'MainNavigation',
      'Breadcrumbs',
      'Tabs',
      'Sidebar',
      'Pagination',
      'BreadcrumbNavigation'
    ]
  },
  
  // Dashboard-Widgets (Tailwind)
  dashboardWidgets: {
    description: 'Einfache Dashboard-Komponenten',
    styling: 'tailwind',
    examples: [
      'MetricCards',
      'StatusCards',
      'QuickActions',
      'RecentActivity',
      'NotificationCards',
      'SummaryWidgets'
    ]
  },
  
  // Layout-Komponenten (Tailwind)
  layout: {
    description: 'Container und Layout-Strukturen',
    styling: 'tailwind',
    examples: [
      'PageContainer',
      'CardContainer',
      'GridLayout',
      'FlexLayout',
      'ResponsiveContainer',
      'SectionContainer'
    ]
  },
  
  // Utility-Komponenten (Tailwind)
  utility: {
    description: 'Einfache Hilfskomponenten',
    styling: 'tailwind',
    examples: [
      'LoadingSpinner',
      'StatusBadge',
      'IconButton',
      'SimpleCard',
      'Divider',
      'Spacer'
    ]
  }
} as const;

// ============================================================================
// DESIGN-SYSTEM KONSTANTEN
// ============================================================================

export const DESIGN_SYSTEM = {
  // Farben (VALEO Brand)
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      900: '#1e3a8a'
    },
    secondary: {
      50: '#fdf2f8',
      100: '#fce7f3',
      500: '#ec4899',
      600: '#db2777',
      700: '#be185d',
      900: '#831843'
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      900: '#14532d'
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      900: '#92400e'
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      900: '#7f1d1d'
    },
    neutral: {
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
    }
  },
  
  // Typography
  typography: {
    fontFamily: {
      primary: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      mono: '"JetBrains Mono", "Fira Code", "Consolas", monospace'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },
  
  // Spacing
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem'
  },
  
  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px'
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
  }
} as const;

// ============================================================================
// KOMPONENTEN-TEMPLATES
// ============================================================================

export const COMPONENT_TEMPLATES = {
  // Material-UI Template
  materialUI: `
import React from 'react';
import { 
  // Material-UI Komponenten hier importieren
} from '@mui/material';
import { 
  // Material-UI Icons hier importieren
} from '@mui/icons-material';

interface ComponentNameProps {
  // Props definieren
}

export const ComponentName: React.FC<ComponentNameProps> = ({ 
  // Props destructuring
}) => {
  return (
    // Material-UI Komponenten verwenden
  );
};
`,
  
  // Tailwind Template
  tailwind: `
import React from 'react';
import { cn } from '../lib/utils';

interface ComponentNameProps {
  // Props definieren
  className?: string;
}

export const ComponentName: React.FC<ComponentNameProps> = ({ 
  className,
  // Weitere Props
}) => {
  return (
    <div className={cn(
      // Tailwind-Klassen hier
      className
    )}>
      {/* Komponenten-Inhalt */}
    </div>
  );
};
`,
  
  // Hybrid Template
  hybrid: `
import React from 'react';
import { 
  // Material-UI für komplexe Teile
} from '@mui/material';
import { cn } from '../lib/utils';

interface ComponentNameProps {
  // Props definieren
  className?: string;
}

export const ComponentName: React.FC<ComponentNameProps> = ({ 
  className,
  // Weitere Props
}) => {
  return (
    <div className={cn(
      // Tailwind für Layout
      className
    )}>
      {/* Material-UI für komplexe Komponenten */}
      {/* Tailwind für einfache Elemente */}
    </div>
  );
};
`
} as const;

// ============================================================================
// QUALITÄTSRICHTLINIEN
// ============================================================================

export const QUALITY_GUIDELINES = {
  // Konsistenz
  consistency: [
    'Verwende immer die gleichen Farben aus dem Design-System',
    'Halte Typography-Hierarchien konsistent',
    'Verwende einheitliche Spacing-Werte',
    'Beachte die Komponenten-Kategorien'
  ],
  
  // Accessibility
  accessibility: [
    'Alle interaktiven Elemente müssen fokussierbar sein',
    'Verwende semantische HTML-Elemente',
    'Stelle ausreichenden Farbkontrast sicher',
    'Füge ARIA-Labels hinzu wo nötig',
    'Teste mit Screen-Readern'
  ],
  
  // Performance
  performance: [
    'Lazy-load Material-UI Komponenten bei Bedarf',
    'Verwende Tailwind für Performance-kritische Bereiche',
    'Optimiere Bundle-Größe durch Tree-Shaking',
    'Verwende React.memo für teure Komponenten'
  ],
  
  // Responsive Design
  responsive: [
    'Mobile-First Ansatz',
    'Teste auf verschiedenen Bildschirmgrößen',
    'Verwende responsive Breakpoints konsistent',
    'Optimiere Touch-Targets für Mobile'
  ],
  
  // Enterprise-Anforderungen
  enterprise: [
    'Hohe Verfügbarkeit und Stabilität',
    'Skalierbarkeit für große Datenmengen',
    'Sicherheit und Datenschutz',
    'Audit-Trail für wichtige Aktionen',
    'Backup und Recovery-Funktionen'
  ]
} as const;

// ============================================================================
// HELPER-FUNKTIONEN
// ============================================================================

/**
 * Entscheidungsfunktion: Welche UI-Bibliothek für eine Komponente verwenden?
 */
export function getUILibrary(componentType: string, complexity: 'low' | 'medium' | 'high'): 'material-ui' | 'tailwind' | 'hybrid' {
  const materialUITypes = [
    'form', 'table', 'chart', 'navigation', 'dialog', 'stepper',
    'dataGrid', 'complexForm', 'userManagement', 'settings'
  ];
  
  const tailwindTypes = [
    'layout', 'simpleCard', 'badge', 'button', 'icon', 'spinner',
    'metricCard', 'statusIndicator', 'quickAction'
  ];
  
  if (materialUITypes.includes(componentType) || complexity === 'high') {
    return 'material-ui';
  } else if (tailwindTypes.includes(componentType) || complexity === 'low') {
    return 'tailwind';
  } else {
    return 'hybrid';
  }
}

/**
 * Validiere Komponenten-Design gegen Konventionen
 */
export function validateComponentDesign(component: {
  type: string;
  complexity: 'low' | 'medium' | 'high';
  styling: 'material-ui' | 'tailwind' | 'hybrid';
}): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  const recommendedLibrary = getUILibrary(component.type, component.complexity);
  
  if (component.styling !== recommendedLibrary) {
    issues.push(`Empfohlene UI-Bibliothek: ${recommendedLibrary}, verwendet: ${component.styling}`);
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Generiere CSS-Klassen für konsistente Styling
 */
export function generateConsistentClasses(category: keyof typeof COMPONENT_CATEGORIES): string {
  const baseClasses = {
    enterprise: 'bg-white shadow-lg rounded-lg border border-gray-200',
    dataVisualization: 'bg-white shadow-md rounded-lg p-4',
    forms: 'bg-white shadow-sm rounded-lg p-6',
    navigation: 'bg-white shadow-sm rounded-md',
    dashboardWidgets: 'bg-white shadow-sm rounded-lg p-4 hover:shadow-md transition-shadow',
    layout: 'bg-gray-50 rounded-lg p-4',
    utility: 'bg-white rounded-md'
  };
  
  return baseClasses[category] || baseClasses.utility;
}

export default {
  UI_DECISION_MATRIX,
  COMPONENT_CATEGORIES,
  DESIGN_SYSTEM,
  COMPONENT_TEMPLATES,
  QUALITY_GUIDELINES,
  getUILibrary,
  validateComponentDesign,
  generateConsistentClasses
}; 