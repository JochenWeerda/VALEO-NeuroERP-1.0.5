"use strict";
// ============================================================================================================================================================================
// VALEO-Die NeuroERP - Schwarm-Intelligenz Types
// ============================================================================================================================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTONOMY_LEVELS = exports.HEALTH_STATUSES = exports.PRIORITY_LEVELS = exports.TASK_TYPES = exports.AGENT_TYPES = exports.SWARM_CONSTANTS = void 0;
// ============================================================================================================================================================================
// CONSTANTS
// ============================================================================================================================================================================
exports.SWARM_CONSTANTS = {
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
};
exports.AGENT_TYPES = {
    FRONTEND: 'frontend',
    BACKEND: 'backend',
    AI: 'ai',
    TESTING: 'testing',
    DEPLOYMENT: 'deployment',
};
exports.TASK_TYPES = {
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
};
exports.PRIORITY_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
};
exports.HEALTH_STATUSES = {
    HEALTHY: 'healthy',
    WARNING: 'warning',
    CRITICAL: 'critical',
    OFFLINE: 'offline',
};
exports.AUTONOMY_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    FULL: 'full',
};
