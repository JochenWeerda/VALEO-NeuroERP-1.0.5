// =============================================================================
// VALEO-Die NeuroERP - Schwarm-Intelligenz Types
// =============================================================================

// =============================================================================
// CORE SWARM TYPES
// =============================================================================

export interface DevelopmentAgent {
  id: string;
  type: 'frontend' | 'backend' | 'ai' | 'testing' | 'deployment';
  capabilities: string[];
  currentTask: Task | null;
  performance: PerformanceMetrics;
  autonomy: AutonomyLevel;
  status: AgentStatus;
  
  // Core Methods
  initialize(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  cleanup(): Promise<void>;
  
  // Task Management
  executeTask(task: Task): Promise<TaskResult>;
  getStatus(): Promise<AgentStatus>;
  
  // Optimization
  optimizePerformance?(data: PerformanceData): Promise<void>;
  optimizeQuality?(data: QualityData): Promise<void>;
  
  // Error Handling
  handleError?(error: AgentError): Promise<void>;
  fixIssue?(issue: QualityIssue): Promise<void>;
}

export interface Task {
  id: string;
  type: TaskType;
  priority: PriorityLevel;
  description: string;
  requirements: TaskRequirements;
  estimatedDuration: number;
  dependencies: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  deadline?: Date;
}

export type TaskType = 
  | 'code_generation'
  | 'code_review'
  | 'testing'
  | 'deployment'
  | 'optimization'
  | 'bug_fix'
  | 'feature_implementation'
  | 'refactoring'
  | 'documentation'
  | 'security_scan'
  | 'performance_analysis'
  | 'quality_check';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface TaskRequirements {
  skills: string[];
  resources: ResourceRequirement[];
  constraints: Constraint[];
  qualityThreshold: number;
  performanceTargets: PerformanceTarget[];
}

export interface ResourceRequirement {
  type: 'cpu' | 'memory' | 'storage' | 'network' | 'gpu';
  amount: number;
  unit: string;
  priority: PriorityLevel;
}

export interface Constraint {
  type: 'time' | 'budget' | 'security' | 'compliance' | 'performance';
  value: any;
  operator: 'equals' | 'less_than' | 'greater_than' | 'contains' | 'not_contains';
}

export interface PerformanceTarget {
  metric: string;
  target: number;
  unit: string;
  tolerance: number;
}

export interface TaskResult {
  taskId: string;
  success: boolean;
  duration: number;
  output: any;
  quality: QualityMetrics;
  performance: PerformanceMetrics;
  errors: AgentError[];
  recommendations: Recommendation[];
  metadata: Record<string, any>;
}

// =============================================================================
// AGENT STATUS & PERFORMANCE
// =============================================================================

export interface AgentStatus {
  id: string;
  type: string;
  isActive: boolean;
  isBusy: boolean;
  currentTask: Task | null;
  queueLength: number;
  uptime: number;
  lastActivity: Date;
  health: HealthStatus;
  capabilities: string[];
  performance: PerformanceMetrics;
  errors: AgentError[];
}

export interface HealthStatus {
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  score: number;
  issues: HealthIssue[];
  lastCheck: Date;
}

export interface HealthIssue {
  id: string;
  type: 'performance' | 'memory' | 'network' | 'disk' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export interface PerformanceMetrics {
  cpu: number;
  memory: number;
  responseTime: number;
  throughput: number;
  errorRate: number;
  efficiency: number;
  productivity: number;
  quality: number;
  autonomy: number;
}

export type AutonomyLevel = 'low' | 'medium' | 'high' | 'full';

// =============================================================================
// COORDINATION & DECISION MAKING
// =============================================================================

export interface Priority {
  id: string;
  agentId: string;
  task: Task;
  priority: PriorityLevel;
  weight: number;
  estimatedImpact: number;
  dependencies: string[];
  deadline: Date;
  metadata: Record<string, any>;
}

export interface DecisionContext {
  agentStatuses: AgentStatus[];
  systemHealth: SystemHealth;
  businessPriorities: BusinessPriority[];
  userFeedback: UserFeedback[];
  performanceMetrics: PerformanceMetrics;
  qualityMetrics: QualityMetrics;
  resourceAvailability: ResourceAvailability;
  constraints: Constraint[];
}

export interface Decision {
  id: string;
  type: DecisionType;
  context: DecisionContext;
  options: DecisionOption[];
  selectedOption: DecisionOption;
  confidence: number;
  reasoning: string;
  expectedOutcome: ExpectedOutcome;
  implementation: ImplementationPlan;
  timestamp: Date;
}

export type DecisionType = 
  | 'resource_allocation'
  | 'task_assignment'
  | 'priority_adjustment'
  | 'quality_improvement'
  | 'performance_optimization'
  | 'error_recovery'
  | 'scaling_decision';

export interface DecisionOption {
  id: string;
  description: string;
  actions: Action[];
  expectedOutcome: ExpectedOutcome;
  risks: Risk[];
  confidence: number;
  cost: Cost;
}

export interface Action {
  type: string;
  target: string;
  parameters: Record<string, any>;
  estimatedDuration: number;
  dependencies: string[];
}

export interface ExpectedOutcome {
  performance: PerformanceMetrics;
  quality: QualityMetrics;
  cost: Cost;
  timeline: Timeline;
  risks: Risk[];
}

export interface Risk {
  id: string;
  type: 'technical' | 'business' | 'security' | 'compliance';
  probability: number;
  impact: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string;
}

export interface Cost {
  monetary: number;
  time: number;
  resources: ResourceCost[];
  opportunity: number;
}

export interface ResourceCost {
  type: string;
  amount: number;
  unit: string;
  duration: number;
}

export interface Timeline {
  start: Date;
  end: Date;
  milestones: Milestone[];
  criticalPath: string[];
}

export interface Milestone {
  id: string;
  name: string;
  date: Date;
  deliverables: string[];
  dependencies: string[];
}

export interface ImplementationPlan {
  steps: ImplementationStep[];
  resources: ResourceAllocation[];
  timeline: Timeline;
  rollback: RollbackPlan;
  monitoring: MonitoringPlan;
}

export interface ImplementationStep {
  id: string;
  name: string;
  action: Action;
  dependencies: string[];
  estimatedDuration: number;
  responsible: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export interface ResourceAllocation {
  agentId: string;
  resources: ResourceRequirement[];
  duration: number;
  priority: PriorityLevel;
}

export interface RollbackPlan {
  triggers: RollbackTrigger[];
  steps: RollbackStep[];
  estimatedDuration: number;
}

export interface RollbackTrigger {
  condition: string;
  threshold: number;
  action: string;
}

export interface RollbackStep {
  id: string;
  action: string;
  target: string;
  parameters: Record<string, any>;
}

export interface MonitoringPlan {
  metrics: MonitoringMetric[];
  alerts: Alert[];
  frequency: number;
}

export interface MonitoringMetric {
  name: string;
  type: 'performance' | 'quality' | 'business' | 'security';
  threshold: number;
  operator: 'greater_than' | 'less_than' | 'equals';
  unit: string;
}

export interface Alert {
  id: string;
  metric: string;
  condition: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  action: string;
  recipients: string[];
}

// =============================================================================
// SYSTEM HEALTH & MONITORING
// =============================================================================

export interface SystemHealth {
  overall: HealthStatus;
  components: ComponentHealth[];
  services: ServiceHealth[];
  infrastructure: InfrastructureHealth;
  security: SecurityHealth;
  performance: PerformanceHealth;
  quality: QualityHealth;
  lastUpdated: Date;
}

export interface ComponentHealth {
  id: string;
  name: string;
  type: string;
  status: HealthStatus;
  dependencies: string[];
  metrics: ComponentMetrics;
}

export interface ComponentMetrics {
  availability: number;
  responseTime: number;
  errorRate: number;
  throughput: number;
  resourceUsage: ResourceUsage;
}

export interface ServiceHealth {
  id: string;
  name: string;
  endpoint: string;
  status: HealthStatus;
  responseTime: number;
  availability: number;
  lastCheck: Date;
}

export interface InfrastructureHealth {
  servers: ServerHealth[];
  databases: DatabaseHealth[];
  networks: NetworkHealth[];
  storage: StorageHealth[];
}

export interface ServerHealth {
  id: string;
  hostname: string;
  status: HealthStatus;
  cpu: number;
  memory: number;
  disk: number;
  network: NetworkMetrics;
}

export interface DatabaseHealth {
  id: string;
  name: string;
  type: string;
  status: HealthStatus;
  connections: number;
  queryTime: number;
  storage: number;
}

export interface NetworkHealth {
  id: string;
  name: string;
  status: HealthStatus;
  bandwidth: number;
  latency: number;
  packetLoss: number;
}

export interface StorageHealth {
  id: string;
  name: string;
  type: string;
  status: HealthStatus;
  capacity: number;
  used: number;
  iops: number;
}

export interface SecurityHealth {
  vulnerabilities: Vulnerability[];
  threats: Threat[];
  compliance: ComplianceStatus;
  lastScan: Date;
}

export interface Vulnerability {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affected: string[];
  remediation: string;
  status: 'open' | 'in_progress' | 'resolved';
}

export interface Threat {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  source: string;
  status: 'active' | 'mitigated' | 'resolved';
}

export interface ComplianceStatus {
  framework: string;
  status: 'compliant' | 'non_compliant' | 'partial';
  issues: ComplianceIssue[];
  lastAudit: Date;
}

export interface ComplianceIssue {
  id: string;
  requirement: string;
  status: 'pass' | 'fail' | 'warning';
  description: string;
  remediation: string;
}

export interface PerformanceHealth {
  overall: PerformanceMetrics;
  bottlenecks: Bottleneck[];
  optimizations: Optimization[];
  trends: PerformanceTrend[];
}

export interface Bottleneck {
  id: string;
  component: string;
  type: 'cpu' | 'memory' | 'disk' | 'network' | 'database';
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: number;
  solution: string;
}

export interface Optimization {
  id: string;
  component: string;
  type: string;
  impact: number;
  effort: number;
  priority: PriorityLevel;
  status: 'proposed' | 'approved' | 'implemented';
}

export interface PerformanceTrend {
  metric: string;
  values: number[];
  timestamps: Date[];
  trend: 'improving' | 'stable' | 'declining';
  forecast: number[];
}

export interface QualityHealth {
  overall: QualityMetrics;
  issues: QualityIssue[];
  improvements: QualityImprovement[];
  trends: QualityTrend[];
}

export interface QualityMetrics {
  codeQuality: number;
  testCoverage: number;
  documentation: number;
  accessibility: number;
  security: number;
  performance: number;
  maintainability: number;
  reliability: number;
}

export interface QualityIssue {
  id: string;
  type: 'bug' | 'code_smell' | 'security' | 'performance' | 'accessibility';
  severity: 'low' | 'medium' | 'high' | 'critical';
  component: string;
  description: string;
  impact: number;
  status: 'open' | 'in_progress' | 'resolved';
  assignedTo?: string;
}

export interface QualityImprovement {
  id: string;
  type: string;
  component: string;
  impact: number;
  effort: number;
  priority: PriorityLevel;
  status: 'proposed' | 'approved' | 'implemented';
}

export interface QualityTrend {
  metric: string;
  values: number[];
  timestamps: Date[];
  trend: 'improving' | 'stable' | 'declining';
  target: number;
}

// =============================================================================
// BUSINESS & USER CONTEXT
// =============================================================================

export interface BusinessPriority {
  id: string;
  name: string;
  description: string;
  priority: PriorityLevel;
  weight: number;
  category: string;
  stakeholders: string[];
  deadline: Date;
  success: SuccessCriteria;
  dependencies: string[];
}

export interface SuccessCriteria {
  metrics: SuccessMetric[];
  targets: Record<string, number>;
  timeframe: number;
}

export interface SuccessMetric {
  name: string;
  type: 'performance' | 'quality' | 'business' | 'user';
  target: number;
  current: number;
  unit: string;
}

export interface UserFeedback {
  id: string;
  userId: string;
  type: 'bug_report' | 'feature_request' | 'performance_issue' | 'usability' | 'general';
  priority: PriorityLevel;
  description: string;
  component: string;
  timestamp: Date;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  resolution?: string;
}

// =============================================================================
// RESOURCE MANAGEMENT
// =============================================================================

export interface ResourceAvailability {
  cpu: ResourceStatus;
  memory: ResourceStatus;
  storage: ResourceStatus;
  network: ResourceStatus;
  gpu: ResourceStatus;
  agents: AgentResourceStatus[];
}

export interface ResourceStatus {
  total: number;
  available: number;
  used: number;
  reserved: number;
  unit: string;
  utilization: number;
}

export interface AgentResourceStatus {
  agentId: string;
  resources: ResourceStatus[];
  capabilities: string[];
  currentLoad: number;
  maxCapacity: number;
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

export interface AgentError {
  id: string;
  agentId: string;
  type: ErrorType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  stack?: string;
  context: ErrorContext;
  timestamp: Date;
  resolved: boolean;
  resolution?: ErrorResolution;
}

export type ErrorType = 
  | 'runtime_error'
  | 'timeout_error'
  | 'resource_error'
  | 'network_error'
  | 'validation_error'
  | 'security_error'
  | 'business_logic_error';

export interface ErrorContext {
  taskId?: string;
  component: string;
  method: string;
  parameters: Record<string, any>;
  environment: string;
  version: string;
}

export interface ErrorResolution {
  action: string;
  timestamp: Date;
  resolvedBy: string;
  notes: string;
}

// =============================================================================
// RECOMMENDATIONS & OPTIMIZATIONS
// =============================================================================

export interface Recommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  priority: PriorityLevel;
  impact: number;
  effort: number;
  category: string;
  target: string;
  actions: Action[];
  expectedOutcome: ExpectedOutcome;
  confidence: number;
  timestamp: Date;
  status: 'proposed' | 'approved' | 'implemented' | 'rejected';
}

export type RecommendationType = 
  | 'performance_optimization'
  | 'quality_improvement'
  | 'security_enhancement'
  | 'cost_reduction'
  | 'user_experience'
  | 'maintainability'
  | 'scalability';

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

export const SWARM_CONSTANTS = {
  COORDINATION_INTERVAL: 30000, // 30 Sekunden
  QUALITY_THRESHOLD: 0.9,
  PERFORMANCE_THRESHOLD: 0.8,
  MAX_RETRY_ATTEMPTS: 3,
  TIMEOUT: 300000, // 5 Minuten
  MAX_CONCURRENT_TASKS: 5,
  MIN_AGENT_HEALTH_SCORE: 0.7,
  MAX_ERROR_RATE: 0.1,
  TARGET_RESPONSE_TIME: 1000, // 1 Sekunde
  TARGET_THROUGHPUT: 100, // Requests pro Sekunde
} as const;

export const AGENT_TYPES = {
  FRONTEND: 'frontend',
  BACKEND: 'backend',
  AI: 'ai',
  TESTING: 'testing',
  DEPLOYMENT: 'deployment',
} as const;

export const TASK_TYPES = {
  CODE_GENERATION: 'code_generation',
  CODE_REVIEW: 'code_review',
  TESTING: 'testing',
  DEPLOYMENT: 'deployment',
  OPTIMIZATION: 'optimization',
  BUG_FIX: 'bug_fix',
  FEATURE_IMPLEMENTATION: 'feature_implementation',
  REFACTORING: 'refactoring',
  DOCUMENTATION: 'documentation',
  SECURITY_SCAN: 'security_scan',
  PERFORMANCE_ANALYSIS: 'performance_analysis',
  QUALITY_CHECK: 'quality_check',
} as const;

export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const HEALTH_STATUSES = {
  HEALTHY: 'healthy',
  WARNING: 'warning',
  CRITICAL: 'critical',
  OFFLINE: 'offline',
} as const;

export const AUTONOMY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  FULL: 'full',
} as const; 