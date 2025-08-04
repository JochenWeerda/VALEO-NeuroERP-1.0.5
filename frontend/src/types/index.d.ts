/**
 * VALEO NeuroERP 2.0 - Central TypeScript Definitions
 * Type definitions for all 12 modules and system components
 * Serena Quality: Complete type safety for all modules
 */

// ============================================================================
// CORE SYSTEM TYPES
// ============================================================================

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface User extends BaseEntity {
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
  roles: string[];
  permissions: string[];
  last_login?: string;
  avatar_url?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ============================================================================
// PERSONAL MANAGEMENT MODULE
// ============================================================================

export interface Employee extends BaseEntity {
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  hire_date: string;
  salary: number;
  manager_id?: string;
  is_active: boolean;
  address: Address;
  emergency_contact: EmergencyContact;
}

export interface Address {
  street: string;
  city: string;
  postal_code: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface VacationRequest extends BaseEntity {
  employee_id: string;
  start_date: string;
  end_date: string;
  vacation_type: 'annual' | 'sick' | 'personal' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  approved_by?: string;
  approved_at?: string;
}

export interface WorkSchedule extends BaseEntity {
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  break_duration: number;
  total_hours: number;
  overtime_hours: number;
}

export interface Payroll extends BaseEntity {
  employee_id: string;
  period_start: string;
  period_end: string;
  gross_salary: number;
  net_salary: number;
  deductions: PayrollDeduction[];
  bonuses: PayrollBonus[];
  status: 'draft' | 'approved' | 'paid';
}

export interface PayrollDeduction {
  type: string;
  amount: number;
  description: string;
}

export interface PayrollBonus {
  type: string;
  amount: number;
  description: string;
}

// ============================================================================
// FINANZBUCHHALTUNG MODULE
// ============================================================================

export interface Account extends BaseEntity {
  account_number: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parent_account_id?: string;
  balance: number;
  is_active: boolean;
  description?: string;
}

export interface JournalEntry extends BaseEntity {
  entry_number: string;
  date: string;
  description: string;
  reference: string;
  status: 'draft' | 'posted' | 'void';
  total_debit: number;
  total_credit: number;
  lines: JournalEntryLine[];
}

export interface JournalEntryLine extends BaseEntity {
  journal_entry_id: string;
  account_id: string;
  debit_amount: number;
  credit_amount: number;
  description: string;
  reference?: string;
}

export interface Invoice extends BaseEntity {
  invoice_number: string;
  customer_id: string;
  invoice_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  items: InvoiceItem[];
}

export interface InvoiceItem extends BaseEntity {
  invoice_id: string;
  product_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  total_amount: number;
}

// ============================================================================
// ANLAGENVERWALTUNG MODULE
// ============================================================================

export interface Asset extends BaseEntity {
  asset_number: string;
  name: string;
  category: string;
  purchase_date: string;
  purchase_price: number;
  current_value: number;
  depreciation_rate: number;
  location: string;
  status: 'active' | 'inactive' | 'sold' | 'disposed';
  supplier_id?: string;
  warranty_expiry?: string;
  maintenance_schedule: MaintenanceSchedule[];
}

export interface MaintenanceSchedule extends BaseEntity {
  asset_id: string;
  maintenance_type: 'preventive' | 'corrective' | 'inspection';
  scheduled_date: string;
  completed_date?: string;
  cost: number;
  description: string;
  technician_id?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface Depreciation extends BaseEntity {
  asset_id: string;
  period_start: string;
  period_end: string;
  depreciation_amount: number;
  accumulated_depreciation: number;
  book_value: number;
}

// ============================================================================
// PRODUKTIONSMANAGEMENT MODULE
// ============================================================================

export interface ProductionOrder extends BaseEntity {
  order_number: string;
  product_id: string;
  quantity: number;
  planned_start_date: string;
  planned_end_date: string;
  actual_start_date?: string;
  actual_end_date?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  work_center_id: string;
  materials: ProductionMaterial[];
  operations: ProductionOperation[];
}

export interface ProductionMaterial extends BaseEntity {
  production_order_id: string;
  material_id: string;
  required_quantity: number;
  issued_quantity: number;
  unit_cost: number;
  total_cost: number;
}

export interface ProductionOperation extends BaseEntity {
  production_order_id: string;
  operation_id: string;
  sequence: number;
  planned_duration: number;
  actual_duration?: number;
  status: 'pending' | 'in_progress' | 'completed';
  work_center_id: string;
  operator_id?: string;
}

export interface WorkCenter extends BaseEntity {
  code: string;
  name: string;
  capacity: number;
  efficiency: number;
  cost_per_hour: number;
  is_active: boolean;
  location: string;
}

// ============================================================================
// LAGERVERWALTUNG MODULE (Landhandel specific)
// ============================================================================

export interface Article extends BaseEntity {
  article_number: string;
  name: string;
  description?: string;
  category: string;
  product_type: 'Saatgut' | 'Düngemittel' | 'Pflanzenschutz' | 'Maschinen' | 'Sonstiges';
  unit: string;
  purchase_price: number;
  selling_price: number;
  stock_quantity: number;
  min_stock: number;
  max_stock: number;
  supplier_id?: string;
  is_active: boolean;
  approval_number?: string; // For regulated products
  expiry_date?: string;
  batch_tracking: boolean;
  location: string;
  dimensions?: ProductDimensions;
  images: string[];
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  weight: number;
  unit: string;
}

export interface StockMovement extends BaseEntity {
  movement_number: string;
  article_id: string;
  movement_type: 'in' | 'out' | 'transfer' | 'adjustment';
  quantity: number;
  unit_price: number;
  total_value: number;
  from_location?: string;
  to_location?: string;
  reference_document?: string;
  reference_number?: string;
  batch_number?: string;
  expiry_date?: string;
  reason: string;
}

export interface InventoryCount extends BaseEntity {
  count_number: string;
  warehouse_id: string;
  count_date: string;
  status: 'planned' | 'in_progress' | 'completed' | 'approved';
  items: InventoryCountItem[];
  total_items: number;
  counted_items: number;
  variance_amount: number;
}

export interface InventoryCountItem extends BaseEntity {
  inventory_count_id: string;
  article_id: string;
  expected_quantity: number;
  counted_quantity: number;
  variance_quantity: number;
  variance_value: number;
  notes?: string;
}

export interface Warehouse extends BaseEntity {
  code: string;
  name: string;
  address: Address;
  manager_id: string;
  capacity: number;
  is_active: boolean;
  temperature_controlled: boolean;
  hazardous_materials: boolean;
}

// ============================================================================
// EINKAUFSMANAGEMENT MODULE
// ============================================================================

export interface PurchaseOrder extends BaseEntity {
  order_number: string;
  supplier_id: string;
  order_date: string;
  expected_delivery_date: string;
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  items: PurchaseOrderItem[];
  terms_conditions?: string;
  delivery_address: Address;
}

export interface PurchaseOrderItem extends BaseEntity {
  purchase_order_id: string;
  article_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  received_quantity: number;
  notes?: string;
}

export interface Supplier extends BaseEntity {
  supplier_number: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: Address;
  tax_id: string;
  payment_terms: number;
  credit_limit: number;
  is_active: boolean;
  categories: string[];
  rating: number;
}

export interface GoodsReceipt extends BaseEntity {
  receipt_number: string;
  purchase_order_id: string;
  receipt_date: string;
  supplier_id: string;
  items: GoodsReceiptItem[];
  total_amount: number;
  notes?: string;
  quality_check_passed: boolean;
}

export interface GoodsReceiptItem extends BaseEntity {
  goods_receipt_id: string;
  article_id: string;
  received_quantity: number;
  accepted_quantity: number;
  rejected_quantity: number;
  unit_price: number;
  total_amount: number;
  batch_number?: string;
  expiry_date?: string;
  quality_notes?: string;
}

// ============================================================================
// VERKAUFSMANAGEMENT MODULE
// ============================================================================

export interface SalesOrder extends BaseEntity {
  order_number: string;
  customer_id: string;
  order_date: string;
  delivery_date: string;
  status: 'draft' | 'confirmed' | 'in_production' | 'ready' | 'delivered' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  items: SalesOrderItem[];
  delivery_address: Address;
  payment_terms: number;
  notes?: string;
}

export interface SalesOrderItem extends BaseEntity {
  sales_order_id: string;
  article_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  delivered_quantity: number;
  notes?: string;
}

export interface Customer extends BaseEntity {
  customer_number: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: Address;
  tax_id: string;
  credit_limit: number;
  payment_terms: number;
  is_active: boolean;
  customer_type: 'retail' | 'wholesale' | 'farmer' | 'dealer';
  rating: number;
  notes?: string;
}

export interface DeliveryNote extends BaseEntity {
  delivery_number: string;
  sales_order_id: string;
  delivery_date: string;
  customer_id: string;
  items: DeliveryNoteItem[];
  total_amount: number;
  delivery_method: string;
  driver_name?: string;
  vehicle_number?: string;
  notes?: string;
}

export interface DeliveryNoteItem extends BaseEntity {
  delivery_note_id: string;
  article_id: string;
  delivered_quantity: number;
  unit_price: number;
  total_amount: number;
  notes?: string;
}

// ============================================================================
// QUALITAETSMANAGEMENT MODULE
// ============================================================================

export interface QualityControl extends BaseEntity {
  control_number: string;
  article_id: string;
  batch_number?: string;
  control_date: string;
  inspector_id: string;
  control_type: 'incoming' | 'in_process' | 'final';
  status: 'pending' | 'in_progress' | 'passed' | 'failed';
  result: QualityControlResult;
  actions: QualityControlAction[];
}

export interface QualityControlResult extends BaseEntity {
  quality_control_id: string;
  parameter: string;
  specification: string;
  actual_value: string;
  tolerance_min?: number;
  tolerance_max?: number;
  result: 'pass' | 'fail';
  notes?: string;
}

export interface QualityControlAction extends BaseEntity {
  quality_control_id: string;
  action_type: 'accept' | 'reject' | 'rework' | 'return';
  description: string;
  responsible_person: string;
  due_date: string;
  completed_date?: string;
  status: 'pending' | 'completed';
}

export interface Certificate extends BaseEntity {
  certificate_number: string;
  article_id: string;
  certificate_type: string;
  issue_date: string;
  expiry_date: string;
  issuing_authority: string;
  status: 'active' | 'expired' | 'revoked';
  file_url?: string;
}

// ============================================================================
// CRM MODULE (with Tagesprotokoll)
// ============================================================================

export interface CustomerContact extends BaseEntity {
  customer_id: string;
  contact_type: 'phone' | 'email' | 'visit' | 'meeting';
  contact_date: string;
  subject: string;
  description: string;
  outcome: string;
  follow_up_date?: string;
  follow_up_completed: boolean;
  employee_id: string;
}

export interface Tagesprotokoll extends BaseEntity {
  protocol_number: string;
  customer_id: string;
  employee_id: string;
  visit_date: string;
  visit_time: string;
  duration: number;
  conversation_topic: string;
  customer_needs: string;
  products_discussed: string[];
  quotes_provided: number;
  orders_received: number;
  order_value?: number;
  follow_up_required: boolean;
  follow_up_date?: string;
  follow_up_completed: boolean;
  notes: string;
  location: string;
  weather_conditions?: string;
}

export interface SalesOpportunity extends BaseEntity {
  opportunity_number: string;
  customer_id: string;
  title: string;
  description: string;
  value: number;
  probability: number;
  expected_close_date: string;
  status: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  source: string;
  assigned_to: string;
  activities: SalesActivity[];
}

export interface SalesActivity extends BaseEntity {
  opportunity_id: string;
  activity_type: 'call' | 'email' | 'meeting' | 'presentation' | 'proposal';
  subject: string;
  description: string;
  scheduled_date: string;
  completed_date?: string;
  duration: number;
  outcome: string;
  next_action?: string;
  next_action_date?: string;
}

// ============================================================================
// PROJEKTMANAGEMENT MODULE
// ============================================================================

export interface Project extends BaseEntity {
  project_number: string;
  name: string;
  description: string;
  customer_id?: string;
  start_date: string;
  end_date: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  budget: number;
  actual_cost: number;
  progress: number;
  manager_id: string;
  team_members: ProjectTeamMember[];
  tasks: ProjectTask[];
}

export interface ProjectTeamMember extends BaseEntity {
  project_id: string;
  employee_id: string;
  role: string;
  start_date: string;
  end_date?: string;
  hours_allocated: number;
  hours_worked: number;
}

export interface ProjectTask extends BaseEntity {
  project_id: string;
  task_number: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  duration: number;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assigned_to: string;
  predecessor_tasks: string[];
  resources: ProjectResource[];
}

export interface ProjectResource extends BaseEntity {
  task_id: string;
  resource_type: 'material' | 'equipment' | 'labor';
  resource_id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
}

// ============================================================================
// DOKUMENTENVERWALTUNG MODULE
// ============================================================================

export interface Document extends BaseEntity {
  document_number: string;
  title: string;
  description?: string;
  category: string;
  subcategory?: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_url: string;
  version: string;
  status: 'draft' | 'review' | 'approved' | 'archived';
  tags: string[];
  related_entities: DocumentRelation[];
  permissions: DocumentPermission[];
}

export interface DocumentRelation extends BaseEntity {
  document_id: string;
  entity_type: string;
  entity_id: string;
  relation_type: 'primary' | 'secondary' | 'reference';
}

export interface DocumentPermission extends BaseEntity {
  document_id: string;
  user_id: string;
  permission: 'read' | 'write' | 'delete' | 'admin';
  granted_by: string;
  granted_at: string;
  expires_at?: string;
}

export interface DocumentVersion extends BaseEntity {
  document_id: string;
  version_number: string;
  file_name: string;
  file_size: number;
  file_url: string;
  change_log: string;
  created_by: string;
}

// ============================================================================
// REPORTING MODULE
// ============================================================================

export interface Report extends BaseEntity {
  report_number: string;
  name: string;
  description: string;
  category: string;
  report_type: 'financial' | 'operational' | 'analytical' | 'regulatory';
  parameters: ReportParameter[];
  schedule?: ReportSchedule;
  recipients: ReportRecipient[];
  last_generated?: string;
  status: 'active' | 'inactive';
}

export interface ReportParameter extends BaseEntity {
  report_id: string;
  parameter_name: string;
  parameter_type: 'string' | 'number' | 'date' | 'boolean' | 'list';
  default_value?: string;
  required: boolean;
  options?: string[];
}

export interface ReportSchedule extends BaseEntity {
  report_id: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  day_of_week?: number;
  day_of_month?: number;
  month?: number;
  time: string;
  timezone: string;
  is_active: boolean;
  last_run?: string;
  next_run?: string;
}

export interface ReportRecipient extends BaseEntity {
  report_id: string;
  user_id: string;
  email: string;
  delivery_method: 'email' | 'system' | 'file';
  format: 'pdf' | 'excel' | 'csv' | 'html';
}

export interface KPI extends BaseEntity {
  kpi_code: string;
  name: string;
  description: string;
  category: string;
  calculation_formula: string;
  unit: string;
  target_value?: number;
  current_value: number;
  trend: 'up' | 'down' | 'stable';
  last_updated: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

// ============================================================================
// SYSTEM CONFIGURATION TYPES
// ============================================================================

export interface SystemConfiguration extends BaseEntity {
  category: string;
  key: string;
  value: string;
  description?: string;
  is_encrypted: boolean;
  is_editable: boolean;
}

export interface Notification extends BaseEntity {
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: string;
  is_read: boolean;
  read_at?: string;
  action_url?: string;
  expires_at?: string;
}

export interface AuditLog extends BaseEntity {
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address: string;
  user_agent: string;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface BulkImportRequest {
  entity_type: string;
  items: Record<string, any>[];
  validate_only?: boolean;
}

export interface BulkImportResponse {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    error: string;
    data: Record<string, any>;
  }>;
  created_ids: string[];
}

export interface SearchRequest {
  query: string;
  entity_types?: string[];
  filters?: Record<string, any>;
  page?: number;
  per_page?: number;
}

export interface SearchResponse {
  results: Array<{
    entity_type: string;
    entity_id: string;
    title: string;
    description: string;
    relevance_score: number;
    highlights: string[];
  }>;
  total: number;
  page: number;
  per_page: number;
}

// ============================================================================
// WORKFLOW TYPES
// ============================================================================

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  module: string;
  steps: WorkflowStep[];
  triggers: string[];
  priority: 'low' | 'normal' | 'high' | 'critical';
  timeout: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  action: string;
  parameters: Record<string, any>;
  conditions: string[];
  timeout: number;
  retry_count: number;
  retry_delay: number;
}

export interface WorkflowInstance {
  id: string;
  workflow_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  current_step?: string;
  progress: number;
  started_at: string;
  completed_at?: string;
  error_message?: string;
  result_data: Record<string, any>;
  context: Record<string, any>;
}

// ============================================================================
// AI ASSISTANT TYPES
// ============================================================================

export interface AIRequest {
  query: string;
  context: AIContext;
  include_sources?: boolean;
  max_tokens?: number;
  temperature?: number;
}

export interface AIContext {
  user_id: string;
  module: string;
  conversation_id?: string;
  session_data: Record<string, any>;
  language: string;
}

export interface AIResponse {
  answer: string;
  sources: Array<{
    content: string;
    metadata: Record<string, any>;
  }>;
  suggestions: string[];
  confidence: number;
  metadata: Record<string, any>;
}

export interface AIInsight {
  type: 'trend' | 'opportunity' | 'warning' | 'info';
  title: string;
  description: string;
  action: string;
  confidence: number;
  data: Record<string, any>;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'multiselect' | 'textarea' | 'date' | 'datetime' | 'checkbox' | 'radio' | 'file';
  required: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  disabled?: boolean;
  hidden?: boolean;
  depends_on?: string;
  depends_value?: any;
}

export interface FormDefinition {
  id: string;
  name: string;
  description: string;
  entity_type: string;
  fields: FormField[];
  layout: 'single_column' | 'two_column' | 'three_column';
  submit_text: string;
  cancel_text: string;
  validation_schema?: any;
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'chart' | 'metric' | 'table' | 'list' | 'gauge' | 'progress';
  data_source: string;
  parameters: Record<string, any>;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  refresh_interval?: number;
  permissions: string[];
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  layout: 'grid' | 'flexible';
  widgets: DashboardWidget[];
  permissions: string[];
  is_default: boolean;
  created_by: string;
  created_at: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type EntityType = 
  | 'employee' | 'vacation_request' | 'payroll'
  | 'account' | 'journal_entry' | 'invoice'
  | 'asset' | 'maintenance_schedule'
  | 'production_order' | 'work_center'
  | 'article' | 'stock_movement' | 'inventory_count'
  | 'purchase_order' | 'supplier' | 'goods_receipt'
  | 'sales_order' | 'customer' | 'delivery_note'
  | 'quality_control' | 'certificate'
  | 'customer_contact' | 'tagesprotokoll' | 'sales_opportunity'
  | 'project' | 'project_task'
  | 'document' | 'report'
  | 'user' | 'notification' | 'audit_log';

export type ModuleType = 
  | 'personal_management'
  | 'finanzbuchhaltung'
  | 'anlagenverwaltung'
  | 'produktionsmanagement'
  | 'lagerverwaltung'
  | 'einkaufsmanagement'
  | 'verkaufsmanagement'
  | 'qualitaetsmanagement'
  | 'crm'
  | 'projektmanagement'
  | 'dokumentenverwaltung'
  | 'reporting';

export type PermissionType = 
  | 'read' | 'write' | 'delete' | 'admin'
  | 'approve' | 'export' | 'import'
  | 'view_reports' | 'manage_users' | 'system_settings';

export type StatusType = 
  | 'active' | 'inactive' | 'draft' | 'pending'
  | 'approved' | 'rejected' | 'completed' | 'cancelled'
  | 'in_progress' | 'on_hold' | 'overdue';

// ============================================================================
// ENUM TYPES
// ============================================================================

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  ACCOUNTANT = 'accountant',
  WAREHOUSE = 'warehouse',
  SALES = 'sales',
  VIEWER = 'viewer'
}

export enum Permission {
  // Article permissions
  ARTICLE_VIEW = 'article.view',
  ARTICLE_CREATE = 'article.create',
  ARTICLE_UPDATE = 'article.update',
  ARTICLE_DELETE = 'article.delete',
  ARTICLE_EXPORT = 'article.export',
  ARTICLE_IMPORT = 'article.import',

  // Customer permissions
  CUSTOMER_VIEW = 'customer.view',
  CUSTOMER_CREATE = 'customer.create',
  CUSTOMER_UPDATE = 'customer.update',
  CUSTOMER_DELETE = 'customer.delete',
  CUSTOMER_EXPORT = 'customer.export',

  // Invoice permissions
  INVOICE_VIEW = 'invoice.view',
  INVOICE_CREATE = 'invoice.create',
  INVOICE_UPDATE = 'invoice.update',
  INVOICE_DELETE = 'invoice.delete',
  INVOICE_APPROVE = 'invoice.approve',
  INVOICE_CANCEL = 'invoice.cancel',

  // Order permissions
  ORDER_VIEW = 'order.view',
  ORDER_CREATE = 'order.create',
  ORDER_UPDATE = 'order.update',
  ORDER_DELETE = 'order.delete',
  ORDER_APPROVE = 'order.approve',

  // Stock permissions
  STOCK_VIEW = 'stock.view',
  STOCK_UPDATE = 'stock.update',
  STOCK_INVENTORY = 'stock.inventory',
  STOCK_MOVEMENT = 'stock.movement',

  // Report permissions
  REPORT_VIEW = 'report.view',
  REPORT_EXPORT = 'report.export',
  REPORT_FINANCIAL = 'report.financial',

  // System permissions
  SYSTEM_SETTINGS = 'system.settings',
  USER_MANAGE = 'user.manage',
  ROLE_MANAGE = 'role.manage',
  BACKUP_MANAGE = 'backup.manage',

  // Monitoring permissions
  MONITORING_VIEW = 'monitoring.view',
  LOG_VIEW = 'log.view'
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const MODULE_PERMISSIONS: Record<ModuleType, Permission[]> = {
  personal_management: [
    Permission.USER_MANAGE,
    Permission.ROLE_MANAGE
  ],
  finanzbuchhaltung: [
    Permission.REPORT_FINANCIAL,
    Permission.INVOICE_VIEW,
    Permission.INVOICE_CREATE,
    Permission.INVOICE_UPDATE,
    Permission.INVOICE_APPROVE
  ],
  anlagenverwaltung: [
    Permission.STOCK_VIEW,
    Permission.STOCK_UPDATE
  ],
  produktionsmanagement: [
    Permission.ORDER_VIEW,
    Permission.ORDER_CREATE,
    Permission.ORDER_UPDATE
  ],
  lagerverwaltung: [
    Permission.STOCK_VIEW,
    Permission.STOCK_UPDATE,
    Permission.STOCK_INVENTORY,
    Permission.STOCK_MOVEMENT,
    Permission.ARTICLE_VIEW,
    Permission.ARTICLE_CREATE,
    Permission.ARTICLE_UPDATE,
    Permission.ARTICLE_IMPORT,
    Permission.ARTICLE_EXPORT
  ],
  einkaufsmanagement: [
    Permission.ORDER_VIEW,
    Permission.ORDER_CREATE,
    Permission.ORDER_UPDATE,
    Permission.ORDER_APPROVE
  ],
  verkaufsmanagement: [
    Permission.ORDER_VIEW,
    Permission.ORDER_CREATE,
    Permission.ORDER_UPDATE,
    Permission.CUSTOMER_VIEW,
    Permission.CUSTOMER_CREATE,
    Permission.CUSTOMER_UPDATE
  ],
  qualitaetsmanagement: [
    Permission.ARTICLE_VIEW,
    Permission.ARTICLE_UPDATE
  ],
  crm: [
    Permission.CUSTOMER_VIEW,
    Permission.CUSTOMER_CREATE,
    Permission.CUSTOMER_UPDATE,
    Permission.CUSTOMER_EXPORT
  ],
  projektmanagement: [
    Permission.ORDER_VIEW,
    Permission.ORDER_CREATE,
    Permission.ORDER_UPDATE
  ],
  dokumentenverwaltung: [
    Permission.REPORT_VIEW,
    Permission.REPORT_EXPORT
  ],
  reporting: [
    Permission.REPORT_VIEW,
    Permission.REPORT_EXPORT,
    Permission.REPORT_FINANCIAL,
    Permission.MONITORING_VIEW
  ]
};

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission),
  [UserRole.ADMIN]: Object.values(Permission).filter(p => !p.includes('system.')),
  [UserRole.MANAGER]: [
    Permission.ARTICLE_VIEW, Permission.ARTICLE_CREATE, Permission.ARTICLE_UPDATE,
    Permission.CUSTOMER_VIEW, Permission.CUSTOMER_CREATE, Permission.CUSTOMER_UPDATE,
    Permission.INVOICE_VIEW, Permission.INVOICE_CREATE, Permission.INVOICE_UPDATE,
    Permission.ORDER_VIEW, Permission.ORDER_CREATE, Permission.ORDER_UPDATE,
    Permission.ORDER_APPROVE, Permission.STOCK_VIEW, Permission.REPORT_VIEW,
    Permission.REPORT_EXPORT
  ],
  [UserRole.ACCOUNTANT]: [
    Permission.CUSTOMER_VIEW, Permission.INVOICE_VIEW, Permission.INVOICE_CREATE,
    Permission.INVOICE_UPDATE, Permission.REPORT_VIEW, Permission.REPORT_EXPORT,
    Permission.REPORT_FINANCIAL
  ],
  [UserRole.WAREHOUSE]: [
    Permission.ARTICLE_VIEW, Permission.ARTICLE_UPDATE, Permission.STOCK_VIEW,
    Permission.STOCK_UPDATE, Permission.STOCK_INVENTORY, Permission.STOCK_MOVEMENT
  ],
  [UserRole.SALES]: [
    Permission.CUSTOMER_VIEW, Permission.CUSTOMER_CREATE, Permission.CUSTOMER_UPDATE,
    Permission.INVOICE_VIEW, Permission.INVOICE_CREATE, Permission.ORDER_VIEW,
    Permission.ORDER_CREATE
  ],
  [UserRole.VIEWER]: [
    Permission.ARTICLE_VIEW, Permission.CUSTOMER_VIEW, Permission.INVOICE_VIEW,
    Permission.ORDER_VIEW, Permission.STOCK_VIEW, Permission.REPORT_VIEW
  ]
}; 