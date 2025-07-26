// Preloading-System Typen

// Preload-Prioritäten
export type PreloadPriority = 'critical' | 'high' | 'medium' | 'low';

// Preload-Trigger
export type PreloadTrigger = 'immediate' | 'idle' | 'hover' | 'intersection';

// Preload-Konfiguration
export interface PreloadConfig {
  priority: PreloadPriority;
  preloadTrigger: PreloadTrigger;
  dependencies?: string[];
  timeout?: number;
  retryAttempts?: number;
}

// Route-Konfiguration
export interface RouteConfig {
  path: string;
  component: string;
  preloadConfig: PreloadConfig;
  isProtected: boolean;
}

// Preload-Status
export interface PreloadStatus {
  route: string;
  isLoaded: boolean;
  isPreloading: boolean;
  loadTime?: number;
  error?: string;
  lastAttempt?: Date;
  attempts: number;
}

// Performance-Metriken
export interface PreloadMetrics {
  totalPreloads: number;
  successfulPreloads: number;
  failedPreloads: number;
  averageLoadTime: number;
  lastPreloadTime: number;
  successRate: number;
}

// Benutzerverhalten
export interface UserBehavior {
  route: string;
  visitCount: number;
  lastVisit: Date;
  averageTimeOnPage: number;
  navigationPattern: string[];
}

// Preload-Event
export interface PreloadEvent {
  type: 'start' | 'success' | 'error' | 'timeout';
  route: string;
  timestamp: Date;
  duration?: number;
  error?: string;
}

// Optimierungseinstellungen
export interface OptimizationSettings {
  autoPreloadEnabled: boolean;
  criticalRoutesEnabled: boolean;
  hoverPreloadEnabled: boolean;
  idlePreloadEnabled: boolean;
  intersectionPreloadEnabled: boolean;
  maxConcurrentPreloads: number;
  preloadTimeout: number;
  retryAttempts: number;
}

// Preload-Strategie
export interface PreloadStrategy {
  name: string;
  description: string;
  enabled: boolean;
  priority: PreloadPriority;
  conditions: PreloadCondition[];
}

// Preload-Bedingung
export interface PreloadCondition {
  type: 'route' | 'userBehavior' | 'performance' | 'network';
  condition: string;
  value: any;
}

// Netzwerk-Status
export interface NetworkStatus {
  isOnline: boolean;
  connectionType: 'slow-2g' | '2g' | '3g' | '4g' | '5g' | 'wifi' | 'ethernet';
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  downlink: number;
  rtt: number;
}

// Cache-Status
export interface CacheStatus {
  route: string;
  isCached: boolean;
  cacheSize: number;
  lastUpdated: Date;
  expiresAt?: Date;
}

// Preload-Manager-Status
export interface PreloadManagerStatus {
  isEnabled: boolean;
  activePreloads: number;
  queuedPreloads: number;
  completedPreloads: number;
  failedPreloads: number;
  totalRoutes: number;
  preloadedRoutes: number;
  pendingRoutes: number;
}

// Preload-Queue-Item
export interface PreloadQueueItem {
  id: string;
  route: string;
  priority: PreloadPriority;
  addedAt: Date;
  scheduledFor?: Date;
  attempts: number;
  maxAttempts: number;
  dependencies: string[];
  isResolved: boolean;
}

// Preload-Performance-Report
export interface PreloadPerformanceReport {
  timestamp: Date;
  duration: number;
  metrics: PreloadMetrics;
  networkStatus: NetworkStatus;
  userBehavior: UserBehavior[];
  recommendations: string[];
}

// Preload-Error
export interface PreloadError {
  code: string;
  message: string;
  route: string;
  timestamp: Date;
  stack?: string;
  context?: Record<string, any>;
}

// Preload-Success-Event
export interface PreloadSuccessEvent {
  route: string;
  loadTime: number;
  timestamp: Date;
  cacheHit: boolean;
  bundleSize?: number;
}

// Preload-Timeout-Event
export interface PreloadTimeoutEvent {
  route: string;
  timeout: number;
  timestamp: Date;
  attempts: number;
}

// Preload-Retry-Event
export interface PreloadRetryEvent {
  route: string;
  attempt: number;
  maxAttempts: number;
  timestamp: Date;
  reason: string;
}

// Preload-Cancellation-Event
export interface PreloadCancellationEvent {
  route: string;
  reason: string;
  timestamp: Date;
  wasPreloading: boolean;
}

// Preload-Priority-Queue
export interface PreloadPriorityQueue {
  critical: PreloadQueueItem[];
  high: PreloadQueueItem[];
  medium: PreloadQueueItem[];
  low: PreloadQueueItem[];
}

// Preload-Statistics
export interface PreloadStatistics {
  totalRoutes: number;
  preloadedRoutes: number;
  pendingRoutes: number;
  failedRoutes: number;
  averageLoadTime: number;
  successRate: number;
  cacheHitRate: number;
  networkUtilization: number;
}

// Preload-Configuration-Update
export interface PreloadConfigurationUpdate {
  route: string;
  oldConfig: PreloadConfig;
  newConfig: PreloadConfig;
  timestamp: Date;
  reason: string;
}

// Preload-Health-Check
export interface PreloadHealthCheck {
  isHealthy: boolean;
  issues: string[];
  recommendations: string[];
  lastCheck: Date;
  nextCheck: Date;
}

// Preload-Memory-Usage
export interface PreloadMemoryUsage {
  totalMemory: number;
  usedMemory: number;
  availableMemory: number;
  preloadMemory: number;
  cacheMemory: number;
  timestamp: Date;
}

// Preload-Bundle-Analysis
export interface PreloadBundleAnalysis {
  route: string;
  bundleSize: number;
  chunkSize: number;
  dependencies: string[];
  loadTime: number;
  parseTime: number;
  executeTime: number;
}

// Preload-User-Experience-Metrics
export interface PreloadUserExperienceMetrics {
  perceivedLoadTime: number;
  timeToInteractive: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

// Preload-API-Response
export interface PreloadAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: PreloadError;
  timestamp: Date;
  duration: number;
}

// Preload-Web-Vitals
export interface PreloadWebVitals {
  route: string;
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  fcp: number; // First Contentful Paint
  timestamp: Date;
} 