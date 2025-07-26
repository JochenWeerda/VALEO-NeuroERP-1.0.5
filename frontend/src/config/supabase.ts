// VALEO NeuroERP Supabase Configuration
import { createClient } from '@supabase/supabase-js';

// Supabase-Projekt-Konfiguration
const supabaseUrl = 'https://ftybxxndembbfjdkcsuk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbXJmbmx0cGV2cWh3dXFtamp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0NzQ0NTcsImV4cCI6MjA2MTA1MDQ1N30.S-n-zv2PwUSLHuY5St9ZNJpS_IcUTBhDslngs6G9eIU';

// Supabase-Client erstellen
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'valeo-neuroerp-frontend'
    }
  }
});

// MCP-Server-Konfiguration
export const mcpConfig = {
  baseUrl: process.env.VITE_MCP_SERVER_URL || 'http://localhost:8000',
  apiKey: process.env.VITE_MCP_API_KEY,
  timeout: 10000,
  projectId: 'ftybxxndembbfjdkcsuk'
};

// Datenbank-Tabellen
export const TABLES = {
  CUSTOMERS: 'customers',
  PRODUCTS: 'products',
  INVOICES: 'invoices',
  INVOICE_ITEMS: 'invoice_items',
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items'
} as const;

// RLS-Policies für Tabellen
export const RLS_POLICIES = {
  [TABLES.CUSTOMERS]: {
    select: true,
    insert: true,
    update: true,
    delete: true
  },
  [TABLES.PRODUCTS]: {
    select: true,
    insert: true,
    update: true,
    delete: true
  },
  [TABLES.INVOICES]: {
    select: true,
    insert: true,
    update: false, // Business rule: Invoices cannot be updated
    delete: false  // Business rule: Invoices cannot be deleted
  },
  [TABLES.INVOICE_ITEMS]: {
    select: true,
    insert: true,
    update: false, // Business rule: Invoice items cannot be updated
    delete: false  // Business rule: Invoice items cannot be deleted
  },
  [TABLES.ORDERS]: {
    select: true,
    insert: true,
    update: true,
    delete: true
  },
  [TABLES.ORDER_ITEMS]: {
    select: true,
    insert: true,
    update: true,
    delete: true
  }
} as const;

// Enum-Werte für Tabellen
export const ENUM_VALUES = {
  INVOICE_STATUS: ['open', 'paid', 'overdue'] as const,
  CUSTOMER_TYPE: ['individual', 'company'] as const,
  PRODUCT_CATEGORY: ['hardware', 'software', 'service'] as const
} as const;

// API-Endpunkte
export const API_ENDPOINTS = {
  MCP: {
    SCHEMA: (table: string) => `${mcpConfig.baseUrl}/api/schema/${table}`,
    TABLES: `${mcpConfig.baseUrl}/api/tables`,
    CACHE_CLEAR: `${mcpConfig.baseUrl}/api/cache/clear`,
    HEALTH: `${mcpConfig.baseUrl}/api/health`
  },
  SUPABASE: {
    REST: `${supabaseUrl}/rest/v1`,
    AUTH: `${supabaseUrl}/auth/v1`,
    STORAGE: `${supabaseUrl}/storage/v1`
  }
} as const;

// Validierungsregeln
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  PRICE: /^\d+(\.\d{1,2})?$/,
  QUANTITY: /^[1-9]\d*$/
} as const;

// Fehlermeldungen
export const ERROR_MESSAGES = {
  REQUIRED: 'Dieses Feld ist erforderlich',
  INVALID_EMAIL: 'Ungültige E-Mail-Adresse',
  INVALID_PHONE: 'Ungültige Telefonnummer',
  INVALID_UUID: 'Ungültige ID',
  INVALID_PRICE: 'Ungültiger Preis',
  INVALID_QUANTITY: 'Menge muss größer als 0 sein',
  NETWORK_ERROR: 'Netzwerkfehler - Bitte versuchen Sie es erneut',
  UNAUTHORIZED: 'Nicht autorisiert - Bitte melden Sie sich an',
  FORBIDDEN: 'Zugriff verweigert',
  NOT_FOUND: 'Ressource nicht gefunden',
  SERVER_ERROR: 'Serverfehler - Bitte versuchen Sie es später erneut'
} as const;

// Erfolgsmeldungen
export const SUCCESS_MESSAGES = {
  CREATED: 'Erfolgreich erstellt',
  UPDATED: 'Erfolgreich aktualisiert',
  DELETED: 'Erfolgreich gelöscht',
  SAVED: 'Erfolgreich gespeichert',
  CACHE_CLEARED: 'Cache erfolgreich geleert'
} as const;

// Paginierung
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
  MAX_PAGE_SIZE: 100
} as const;

// Cache-Konfiguration
export const CACHE_CONFIG = {
  SCHEMA_TTL: 5 * 60 * 1000, // 5 Minuten
  DATA_TTL: 2 * 60 * 1000,   // 2 Minuten
  USER_TTL: 30 * 60 * 1000   // 30 Minuten
} as const;

// Theme-Konfiguration
export const THEME_CONFIG = {
  PRIMARY_COLOR: '#1976d2',
  SECONDARY_COLOR: '#dc004e',
  SUCCESS_COLOR: '#4caf50',
  WARNING_COLOR: '#ff9800',
  ERROR_COLOR: '#f44336',
  INFO_COLOR: '#2196f3'
} as const;

// Export-Typen
export type TableName = typeof TABLES[keyof typeof TABLES];
export type InvoiceStatus = typeof ENUM_VALUES.INVOICE_STATUS[number];
export type CustomerType = typeof ENUM_VALUES.CUSTOMER_TYPE[number];
export type ProductCategory = typeof ENUM_VALUES.PRODUCT_CATEGORY[number];

// Hilfsfunktionen
export const isTableName = (value: string): value is TableName => {
  return Object.values(TABLES).includes(value as TableName);
};

export const isInvoiceStatus = (value: string): value is InvoiceStatus => {
  return ENUM_VALUES.INVOICE_STATUS.includes(value as InvoiceStatus);
};

export const isCustomerType = (value: string): value is CustomerType => {
  return ENUM_VALUES.CUSTOMER_TYPE.includes(value as CustomerType);
};

export const isProductCategory = (value: string): value is ProductCategory => {
  return ENUM_VALUES.PRODUCT_CATEGORY.includes(value as ProductCategory);
};

// Default-Werte für neue Einträge
export const DEFAULT_VALUES = {
  [TABLES.CUSTOMERS]: {
    type: 'individual' as CustomerType,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  [TABLES.PRODUCTS]: {
    price: 0,
    stock_quantity: 0,
    category: 'hardware' as ProductCategory,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  [TABLES.INVOICES]: {
    amount: 0,
    status: 'open' as InvoiceStatus,
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 Tage
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  [TABLES.ORDERS]: {
    total_amount: 0,
    status: 'pending',
    order_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
} as const;

export default {
  supabase,
  mcpConfig,
  TABLES,
  RLS_POLICIES,
  ENUM_VALUES,
  API_ENDPOINTS,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  PAGINATION,
  CACHE_CONFIG,
  THEME_CONFIG,
  DEFAULT_VALUES
}; 