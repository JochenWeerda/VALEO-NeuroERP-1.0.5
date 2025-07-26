// =============================================================================
// VALEO-Flow Frontend TypeScript Types
// =============================================================================

// =============================================================================
// CORE TYPES
// =============================================================================

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  department?: string;
  position?: string;
  isSalesRep?: boolean;
  salesRepCode?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  salesRepId?: number;
  salesRepName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceEntry {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  accountId: number;
  accountName: string;
  invoiceId?: number;
  paymentId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  description?: string;
  category: string;
  unit: string;
  price: number;
  cost: number;
  stockQuantity: number;
  minStockLevel: number;
  warehouseId: number;
  warehouseName: string;
  batchNumber?: string;
  expiryDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// NEURAL ENHANCEMENT TYPES
// =============================================================================

export interface AIContext {
  userId: number;
  userRole: string;
  currentPage: string;
  userActions: UserAction[];
  systemState: SystemState;
  preferences: UserPreferences;
}

export interface UserAction {
  id: string;
  type: 'navigation' | 'data_entry' | 'search' | 'filter' | 'export';
  target: string;
  timestamp: string;
  duration?: number;
  success: boolean;
  metadata?: Record<string, any>;
}

export interface SystemState {
  currentModule: string;
  openTabs: string[];
  recentSearches: string[];
  frequentlyUsedFeatures: string[];
  performanceMetrics: PerformanceMetrics;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
  notifications: NotificationPreferences;
  shortcuts: KeyboardShortcut[];
}

export interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  errorRate: number;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  frequency: 'immediate' | 'hourly' | 'daily';
  categories: string[];
}

export interface KeyboardShortcut {
  key: string;
  action: string;
  description: string;
}

// =============================================================================
// AI ASSISTANCE TYPES
// =============================================================================

export interface AIRecommendation {
  id: string;
  type: 'suggestion' | 'warning' | 'optimization' | 'prediction';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  confidence: number;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  expiresAt?: string;
}

export interface Prediction {
  id: string;
  type: 'trend' | 'anomaly' | 'forecast' | 'pattern';
  title: string;
  description: string;
  confidence: number;
  data: PredictionData[];
  timeframe: {
    start: string;
    end: string;
  };
  createdAt: string;
}

export interface PredictionData {
  timestamp: string;
  value: number;
  confidence: number;
  metadata?: Record<string, any>;
}

export interface QueryResult {
  query: string;
  results: any[];
  totalCount: number;
  processingTime: number;
  suggestions: string[];
  relatedQueries: string[];
}

export interface OptimizedWorkflow {
  id: string;
  originalWorkflow: Workflow;
  optimizedSteps: WorkflowStep[];
  estimatedTimeSavings: number;
  confidence: number;
  reasoning: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  estimatedDuration: number;
  complexity: 'low' | 'medium' | 'high';
  automationLevel: number;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'manual' | 'automated' | 'ai_assisted';
  duration: number;
  dependencies: string[];
  canBeOptimized: boolean;
  optimizationSuggestions: string[];
}

export interface Anomaly {
  id: string;
  type: 'data' | 'performance' | 'security' | 'business';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  detectedAt: string;
  data: AnomalyData;
  recommendations: string[];
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
}

export interface AnomalyData {
  metric: string;
  expectedValue: number;
  actualValue: number;
  deviation: number;
  historicalData: number[];
  context: Record<string, any>;
}

// =============================================================================
// UI COMPONENT TYPES
// =============================================================================

export interface ValeoFlowTheme {
  mode: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  accentColor: string;
  errorColor: string;
  warningColor: string;
  successColor: string;
  infoColor: string;
}

export interface ValeoFlowAppBarProps {
  title: string;
  subtitle?: string;
  user?: User;
  notifications: Notification[];
  onMenuClick: () => void;
  onNotificationClick: (id: string) => void;
  onUserMenuClick: () => void;
}

export interface ValeoFlowSidebarProps {
  open: boolean;
  onClose: () => void;
  modules: Module[];
  activeModule: string;
  onModuleClick: (moduleId: string) => void;
  userRole: string;
}

export interface Module {
  id: string;
  name: string;
  icon: string;
  path: string;
  description: string;
  permissions: string[];
  children?: Module[];
  badge?: number;
  isNew?: boolean;
}

export interface ValeoFlowDataGridProps<T> {
  data: T[];
  columns: DataGridColumn<T>[];
  loading: boolean;
  error?: string;
  pagination: PaginationState;
  sorting: SortingState;
  filtering: FilterState;
  onPaginationChange: (pagination: PaginationState) => void;
  onSortingChange: (sorting: SortingState) => void;
  onFilteringChange: (filtering: FilterState) => void;
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
  enableSelection?: boolean;
  enableExport?: boolean;
  enableBulkActions?: boolean;
  aiAssistance?: boolean;
}

export interface DataGridColumn<T> {
  field: keyof T;
  headerName: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  renderCell?: (value: any, row: T) => React.ReactNode;
  renderHeader?: () => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  type?: 'string' | 'number' | 'date' | 'boolean' | 'custom';
}

export interface PaginationState {
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface SortingState {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterState {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan';
  value: unknown;
}

export interface ValeoFlowFormProps<T> {
  data?: T;
  schema: unknown;
  onSubmit: (data: T) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
  title?: string;
  subtitle?: string;
  aiAssistance?: boolean;
  autoSave?: boolean;
}

export interface ValeoFlowChartProps {
  data: ChartData[];
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  title?: string;
  subtitle?: string;
  xAxis?: ChartAxis;
  yAxis?: ChartAxis;
  series: ChartSeries[];
  height?: number;
  width?: number;
  responsive?: boolean;
  interactive?: boolean;
  animations?: boolean;
  aiInsights?: boolean;
}

export interface ChartData {
  [key: string]: unknown;
}

export interface ChartAxis {
  label: string;
  type: 'category' | 'number' | 'time';
  format?: string;
  min?: number;
  max?: number;
}

export interface ChartSeries {
  name: string;
  dataKey: string;
  color?: string;
  type?: 'line' | 'bar' | 'area';
  strokeWidth?: number;
  fillOpacity?: number;
}

export interface ValeoFlowNotificationProps {
  notification: Notification;
  onClose: (id: string) => void;
  onAction?: (id: string, action: string) => void;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
}

export interface NotificationAction {
  label: string;
  action: string;
  url?: string;
  primary?: boolean;
}

// =============================================================================
// API TYPES
// =============================================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
  version: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  requestId: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  message?: string;
  success: boolean;
  timestamp: string;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

// =============================================================================
// STORE TYPES
// =============================================================================

export interface AppState {
  user: User | null;
  theme: ValeoFlowTheme;
  notifications: Notification[];
  aiRecommendations: AIRecommendation[];
  systemState: SystemState;
  preferences: UserPreferences;
  loading: boolean;
  error: string | null;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface UISate {
  sidebarOpen: boolean;
  activeModule: string;
  breadcrumbs: Breadcrumb[];
  modals: Modal[];
  toasts: Toast[];
  loading: boolean;
}

export interface Breadcrumb {
  label: string;
  path: string;
  icon?: string;
}

export interface Modal {
  id: string;
  type: 'dialog' | 'drawer' | 'fullscreen';
  title: string;
  content: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface Toast {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Required<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type Nullable<T> = T | null;

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export type Result<T, E = string> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};

// =============================================================================
// CONSTANTS
// =============================================================================

export const VALEO_FLOW_CONSTANTS = {
  APP_NAME: 'VALEO-Flow',
  APP_VERSION: '1.0.0',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  WS_BASE_URL: import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:3000',
  DEFAULT_PAGE_SIZE: 25,
  MAX_PAGE_SIZE: 100,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  REFRESH_TOKEN_INTERVAL: 5 * 60 * 1000, // 5 minutes
  AI_RECOMMENDATION_REFRESH_INTERVAL: 60 * 1000, // 1 minute
  NOTIFICATION_TIMEOUT: 5000, // 5 seconds
  DEBOUNCE_DELAY: 300, // 300ms
  THROTTLE_DELAY: 100, // 100ms
} as const;

export const VALEO_FLOW_MODULES = {
  DASHBOARD: 'dashboard',
  CRM: 'crm',
  FINANCE: 'finance',
  INVENTORY: 'inventory',
  USERS: 'users',
  REPORTS: 'reports',
  SETTINGS: 'settings',
} as const;

export const VALEO_FLOW_PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: 'view_dashboard',
  
  // CRM
  VIEW_CUSTOMERS: 'view_customers',
  CREATE_CUSTOMERS: 'create_customers',
  EDIT_CUSTOMERS: 'edit_customers',
  DELETE_CUSTOMERS: 'delete_customers',
  
  // Finance
  VIEW_FINANCE: 'view_finance',
  CREATE_FINANCE_ENTRIES: 'create_finance_entries',
  EDIT_FINANCE_ENTRIES: 'edit_finance_entries',
  DELETE_FINANCE_ENTRIES: 'delete_finance_entries',
  
  // Inventory
  VIEW_INVENTORY: 'view_inventory',
  CREATE_INVENTORY_ITEMS: 'create_inventory_items',
  EDIT_INVENTORY_ITEMS: 'edit_inventory_items',
  DELETE_INVENTORY_ITEMS: 'delete_inventory_items',
  
  // Users
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  
  // Reports
  VIEW_REPORTS: 'view_reports',
  EXPORT_REPORTS: 'export_reports',
  
  // Settings
  VIEW_SETTINGS: 'view_settings',
  EDIT_SETTINGS: 'edit_settings',
} as const; 