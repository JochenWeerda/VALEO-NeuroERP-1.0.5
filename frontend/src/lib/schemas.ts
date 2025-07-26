import { z } from 'zod';

// Trust Level Schema
export const TrustLevelSchema = z.enum(['fact', 'assumption', 'uncertain']);
export type TrustLevel = z.infer<typeof TrustLevelSchema>;

// Module Status Schema
export const ModuleStatusSchema = z.enum(['active', 'maintenance', 'planned', 'deprecated']);
export type ModuleStatus = z.infer<typeof ModuleStatusSchema>;

// Module Category Schema
export const ModuleCategorySchema = z.enum([
  'business', 
  'core', 
  'analytics', 
  'management', 
  'quality', 
  'emergency',
  'finance',
  'logistics',
  'documentation',
  'support',
  'system',
  'security',
  'data',
  'integration',
  'monitoring',
  'training',
  'community',
  'updates',
  'communication',
  'reporting',
  'compliance',
  'search',
  'workflow',
  'storage'
]);
export type ModuleCategory = z.infer<typeof ModuleCategorySchema>;

// Module Feature Schema
export const ModuleFeatureSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  available: z.boolean(),
  trustLevel: TrustLevelSchema,
  confidence: z.number().min(0).max(100)
});
export type ModuleFeature = z.infer<typeof ModuleFeatureSchema>;

// Module Card Schema
export const ModuleCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: ModuleCategorySchema,
  status: ModuleStatusSchema,
  trustLevel: TrustLevelSchema,
  confidence: z.number().min(0).max(100),
  features: z.array(ModuleFeatureSchema).optional(),
  icon: z.string(),
  color: z.string()
});
export type ModuleCard = z.infer<typeof ModuleCardSchema>;

// Agent Context Schema
export const AgentContextSchema = z.object({
  userId: z.string(),
  sessionId: z.string(),
  module: z.string(),
  timestamp: z.date(),
  metadata: z.record(z.string(), z.any()).optional()
});
export type AgentContext = z.infer<typeof AgentContextSchema>;

// Agent Suggestion Schema
export const AgentSuggestionSchema = z.object({
  id: z.string(),
  type: z.enum(['action', 'recommendation', 'warning', 'info']),
  title: z.string(),
  description: z.string(),
  confidence: z.number().min(0).max(100),
  trustLevel: TrustLevelSchema,
  source: z.string(),
  timestamp: z.date(),
  parameters: z.record(z.string(), z.any()).optional()
});
export type AgentSuggestion = z.infer<typeof AgentSuggestionSchema>;

// Notification Schema
export const NotificationSchema = z.object({
  id: z.string(),
  type: z.enum(['info', 'success', 'warning', 'error']),
  title: z.string(),
  message: z.string(),
  timestamp: z.date(),
  read: z.boolean().default(false),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  source: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional()
});
export type Notification = z.infer<typeof NotificationSchema>;

// User Schema
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'user', 'manager', 'viewer']),
  avatar: z.string().optional(),
  lastLogin: z.date().optional(),
  preferences: z.record(z.string(), z.any()).optional()
});
export type User = z.infer<typeof UserSchema>;

// Data Card Schema
export const DataCardSchema = z.object({
  title: z.string(),
  value: z.string(),
  trend: z.enum(['up', 'down', 'neutral']),
  change: z.string(),
  icon: z.string(),
  trustLevel: TrustLevelSchema,
  confidence: z.number().min(0).max(100)
});
export type DataCard = z.infer<typeof DataCardSchema>;

// Status Card Schema
export const StatusCardSchema = z.object({
  title: z.string(),
  status: z.enum(['online', 'offline', 'maintenance', 'error']),
  trustLevel: TrustLevelSchema,
  confidence: z.number().min(0).max(100)
});
export type StatusCard = z.infer<typeof StatusCardSchema>;

// Trust Indicator Schema
export const TrustIndicatorSchema = z.object({
  level: TrustLevelSchema,
  confidence: z.number().min(0).max(100),
  source: z.string().optional()
});
export type TrustIndicator = z.infer<typeof TrustIndicatorSchema>;

// Create Agent Context Function
export const createAgentContext = (data: {
  userId: string;
  sessionId: string;
  module: string;
  metadata?: Record<string, any>;
}): AgentContext => {
  return {
    userId: data.userId,
    sessionId: data.sessionId,
    module: data.module,
    timestamp: new Date(),
    metadata: data.metadata
  };
};

// Validation Functions
export const validateModuleCard = (data: unknown): ModuleCard => {
  return ModuleCardSchema.parse(data);
};

export const validateAgentSuggestion = (data: unknown): AgentSuggestion => {
  return AgentSuggestionSchema.parse(data);
};

export const validateNotification = (data: unknown): Notification => {
  return NotificationSchema.parse(data);
};

export const validateUser = (data: unknown): User => {
  return UserSchema.parse(data);
};

// Helper Functions
export const isTrustLevel = (value: unknown): value is TrustLevel => {
  return TrustLevelSchema.safeParse(value).success;
};

export const isModuleStatus = (value: unknown): value is ModuleStatus => {
  return ModuleStatusSchema.safeParse(value).success;
};

export const isModuleCategory = (value: unknown): value is ModuleCategory => {
  return ModuleCategorySchema.safeParse(value).success;
}; 