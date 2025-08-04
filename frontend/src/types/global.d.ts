// Global TypeScript Interfaces für VALEO NeuroERP

// Base Types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User Types
export interface User extends BaseEntity {
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
  lastLogin?: Date;
  isActive: boolean;
  permissions: Permission[];
}

export type UserRole = 'admin' | 'user' | 'manager' | 'accountant';

export type Permission = 
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'crm:read'
  | 'crm:write'
  | 'crm:delete'
  | 'invoices:read'
  | 'invoices:write'
  | 'invoices:delete'
  | 'reports:read'
  | 'settings:read'
  | 'settings:write';

export interface UserProfile extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  position: string;
  avatar?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: ThemeMode;
  language: Language;
  notifications: boolean;
  compactMode: boolean;
  highContrast: boolean;
  fontSize: FontSize;
}

export type ThemeMode = 'neural' | 'neural-light' | 'neural-dark';
export type Language = 'de' | 'en';
export type FontSize = 'small' | 'medium' | 'large';

// CRM Types
export interface Customer extends BaseEntity {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: Address;
  status: CustomerStatus;
  category: CustomerCategory;
  lastContact?: Date;
  notes?: string;
  tags: string[];
}

export type CustomerStatus = 'active' | 'inactive' | 'prospect' | 'lead';
export type CustomerCategory = 'A' | 'B' | 'C';

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Contact extends BaseEntity {
  customerId: string;
  type: ContactType;
  subject: string;
  description: string;
  date: Date;
  outcome?: string;
  nextAction?: string;
  assignedTo?: string;
}

export type ContactType = 'email' | 'phone' | 'meeting' | 'note';

// Invoice Types
export interface Invoice extends BaseEntity {
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  issueDate: Date;
  dueDate: Date;
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  notes?: string;
  paymentTerms?: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  total: number;
}

// Notification Types
export interface Notification extends BaseEntity {
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  read: boolean;
  action?: NotificationAction;
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationAction {
  label: string;
  onClick: () => void;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'checkbox';
  required?: boolean;
  validation?: ValidationRule[];
  options?: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'email' | 'custom';
  value?: any;
  message: string;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

// Table Types
export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex: keyof T;
  width?: number | string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
}

export interface TableFilter {
  key: string;
  value: any;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'in' | 'notIn';
}

export interface TableSort {
  key: string;
  direction: 'asc' | 'desc';
}

// Chart Types
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

// API Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Loading States
export interface LoadingState {
  loading: boolean;
  error: string | null;
  data: any | null;
}

// Filter Types
export interface FilterState {
  searchTerm: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  status: string[];
  category: string[];
  tags: string[];
}

// Modal Types
export interface ModalState {
  isOpen: boolean;
  title: string;
  content: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'full';
  onClose?: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

// Sidebar Types
export interface SidebarItem {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  path: string;
  children?: SidebarItem[];
  badge?: number | string;
  disabled?: boolean;
}

// Theme Types
export interface ThemeColors {
  primary: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
  secondary: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
  background: {
    default: string;
    paper: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface DataCardProps extends BaseComponentProps {
  title: string;
  subtitle?: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ComponentType<any>;
  onClick?: () => void;
  loading?: boolean;
}

export interface StatusBadgeProps extends BaseComponentProps {
  status: string;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Event Types
export interface FormSubmitEvent {
  preventDefault: () => void;
  target: HTMLFormElement;
}

export interface InputChangeEvent {
  target: {
    name: string;
    value: string | number | boolean;
  };
}

// Constants
export const VALEO_COLORS = {
  primary: '#0A6ED1',
  secondary: '#354A5F',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  grey: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121'
  }
} as const;

export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920
} as const;

export const DATE_FORMATS = {
  short: 'DD.MM.YYYY',
  long: 'DD.MM.YYYY HH:mm',
  time: 'HH:mm',
  iso: 'YYYY-MM-DD'
} as const; 