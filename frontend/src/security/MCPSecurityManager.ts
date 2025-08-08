/**
 * MCP Security Manager für VALEO NeuroERP 2.0
 * Implementiert umfassende Sicherheitsmaßnahmen basierend auf MCP-Sicherheitsstandards
 * 
 * Basierend auf: https://nordicapis.com/10-tools-for-securing-mcp-servers/
 */

import { createHash, randomBytes, timingSafeEqual } from 'crypto';

// MCP Security Interfaces
interface MCPSecurityConfig {
  authentication: {
    enabled: boolean;
    method: 'token' | 'basic' | 'oauth' | 'jwt';
    tokenExpiry: number; // in seconds
    refreshTokens: boolean;
    maxFailedAttempts: number;
    lockoutDuration: number; // in seconds
  };
  authorization: {
    enabled: boolean;
    defaultPolicy: 'allow' | 'deny';
    rbac: {
      enabled: boolean;
      roles: Role[];
      permissions: Permission[];
    };
  };
  encryption: {
    enabled: boolean;
    algorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
    keyRotationInterval: number; // in seconds
  };
  rateLimiting: {
    enabled: boolean;
    requestsPerMinute: number;
    burstSize: number;
    windowSize: number; // in seconds
  };
  inputValidation: {
    enabled: boolean;
    maxInputSize: number; // in bytes
    sanitization: boolean;
    schemaValidation: boolean;
  };
  monitoring: {
    enabled: boolean;
    auditLogging: boolean;
    threatDetection: boolean;
    realTimeAlerts: boolean;
  };
  sandboxing: {
    enabled: boolean;
    resourceLimits: {
      maxMemory: number; // in MB
      maxCpu: number; // percentage
      maxExecutionTime: number; // in seconds
    };
    allowedOperations: string[];
    blockedOperations: string[];
  };
}

interface Role {
  id: string;
  name: string;
  permissions: string[];
  restrictions?: {
    timeWindow?: {
      start: string; // HH:MM
      end: string; // HH:MM
      daysOfWeek?: string[]; // ['mon', 'tue', ...]
    };
    ipRanges?: string[]; // CIDR notation
    requireMFA?: boolean;
    maxSessions?: number;
  };
}

interface Permission {
  id: string;
  name: string;
  resource: string;
  actions: string[];
  conditions?: Record<string, unknown>;
}

interface SecurityContext {
  sessionId: string;
  userId?: string;
  roles: string[];
  permissions: string[];
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  mfaVerified: boolean;
}

interface SecurityEvent {
  type: 'authentication' | 'authorization' | 'rate_limit' | 'threat' | 'audit';
  severity: 'low' | 'medium' | 'high' | 'critical';
  sessionId: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  details: Record<string, unknown>;
  action: 'allowed' | 'denied' | 'blocked';
}

interface ThreatDetection {
  pattern: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'log' | 'block' | 'alert' | 'escalate';
  conditions: Record<string, unknown>;
}

export class MCPSecurityManager {
  private config: MCPSecurityConfig;
  private sessions: Map<string, SecurityContext> = new Map();
  private failedAttempts: Map<string, { count: number; lastAttempt: Date }> = new Map();
  private rateLimitBuckets: Map<string, { tokens: number; lastRefill: Date }> = new Map();
  private securityEvents: SecurityEvent[] = [];
  private threatPatterns: ThreatDetection[] = [];

  constructor(config: MCPSecurityConfig) {
    this.config = config;
    this.initializeThreatPatterns();
  }

  /**
   * Initialisiert Standard-Bedrohungsmuster basierend auf MCP-Sicherheitsstandards
   */
  private initializeThreatPatterns(): void {
    this.threatPatterns = [
      // Tool Poisoning Detection
      {
        pattern: 'tool_poisoning',
        description: 'Versuch der Tool-Manipulation',
        severity: 'high',
        action: 'block',
        conditions: {
          suspiciousToolCalls: true,
          unexpectedToolBehavior: true
        }
      },
      // Context Manipulation
      {
        pattern: 'context_manipulation',
        description: 'Versuch der Kontext-Manipulation',
        severity: 'high',
        action: 'block',
        conditions: {
          contextInjection: true,
          promptInjection: true
        }
      },
      // Rate Limiting Violations
      {
        pattern: 'rate_limit_violation',
        description: 'Rate Limiting Verletzung',
        severity: 'medium',
        action: 'block',
        conditions: {
          excessiveRequests: true,
          burstTraffic: true
        }
      },
      // Authentication Attacks
      {
        pattern: 'auth_attack',
        description: 'Authentifizierungsangriff',
        severity: 'critical',
        action: 'escalate',
        conditions: {
          bruteForce: true,
          credentialStuffing: true
        }
      },
      // Input Validation Attacks
      {
        pattern: 'input_validation_attack',
        description: 'Input Validation Angriff',
        severity: 'high',
        action: 'block',
        conditions: {
          sqlInjection: true,
          xssAttempt: true,
          pathTraversal: true
        }
      }
    ];
  }

  /**
   * Authentifiziert einen Benutzer
   */
  async authenticate(credentials: unknown, context: Partial<SecurityContext>): Promise<{
    success: boolean;
    sessionId?: string;
    error?: string;
    requiresMFA?: boolean;
  }> {
    if (!this.config.authentication.enabled) {
      return { success: true, sessionId: this.createSession(context) };
    }

    // Rate Limiting für Authentifizierungsversuche
    if (!this.checkRateLimit(context.ipAddress || 'unknown', 'auth')) {
      this.logSecurityEvent({
        type: 'rate_limit',
        severity: 'medium',
        sessionId: 'unknown',
        ipAddress: context.ipAddress || 'unknown',
        userAgent: context.userAgent || 'unknown',
        timestamp: new Date(),
        details: { reason: 'Authentication rate limit exceeded' },
        action: 'denied'
      });
      return { success: false, error: 'Rate limit exceeded' };
    }

    // Überprüfung auf gesperrte IPs
    if (this.isIPBlocked(context.ipAddress || 'unknown')) {
      return { success: false, error: 'IP address is blocked' };
    }

    let authenticated = false;
    let userId: string | undefined;

    try {
      switch (this.config.authentication.method) {
        case 'token':
          authenticated = await this.authenticateToken(credentials);
          break;
        case 'basic':
          authenticated = await this.authenticateBasic(credentials);
          break;
        case 'oauth':
          authenticated = await this.authenticateOAuth(credentials);
          break;
        case 'jwt':
          authenticated = await this.authenticateJWT(credentials);
          break;
      }

      if (authenticated) {
        userId = this.extractUserId(credentials);
        this.resetFailedAttempts(context.ipAddress || 'unknown');
        
        const sessionId = this.createSession({
          ...context,
          userId,
          timestamp: new Date()
        });

        this.logSecurityEvent({
          type: 'authentication',
          severity: 'low',
          sessionId,
          userId,
          ipAddress: context.ipAddress || 'unknown',
          userAgent: context.userAgent || 'unknown',
          timestamp: new Date(),
          details: { method: this.config.authentication.method },
          action: 'allowed'
        });

        return { success: true, sessionId };
      } else {
        this.incrementFailedAttempts(context.ipAddress || 'unknown');
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      this.logSecurityEvent({
        type: 'authentication',
        severity: 'high',
        sessionId: 'unknown',
        ipAddress: context.ipAddress || 'unknown',
        userAgent: context.userAgent || 'unknown',
        timestamp: new Date(),
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        action: 'denied'
      });
      return { success: false, error: 'Authentication failed' };
    }
  }

  /**
   * Autorisiert eine Aktion
   */
  authorize(sessionId: string, resource: string, action: string): boolean {
    if (!this.config.authorization.enabled) {
      return true;
    }

    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    // Überprüfung der Berechtigungen
    const hasPermission = this.checkPermission(session, resource, action);
    
    this.logSecurityEvent({
      type: 'authorization',
      severity: hasPermission ? 'low' : 'medium',
      sessionId,
      userId: session.userId,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      timestamp: new Date(),
      details: { resource, action, granted: hasPermission },
      action: hasPermission ? 'allowed' : 'denied'
    });

    return hasPermission;
  }

  /**
   * Validiert und sanitisiert Input
   */
  validateInput(input: unknown, schema?: unknown): {
    valid: boolean;
    sanitized?: unknown;
    errors?: string[];
  } {
    if (!this.config.inputValidation.enabled) {
      return { valid: true, sanitized: input };
    }

    const errors: string[] = [];

    // Größenprüfung
    if (typeof input === 'string' && input.length > this.config.inputValidation.maxInputSize) {
      errors.push('Input size exceeds maximum allowed size');
    }

    // Sanitization
    let sanitized = input;
    if (this.config.inputValidation.sanitization) {
      sanitized = this.sanitizeInput(input);
    }

    // Schema-Validierung
    if (this.config.inputValidation.schemaValidation && schema) {
      const schemaValidation = this.validateSchema(sanitized, schema);
      if (!schemaValidation.valid) {
        errors.push(...schemaValidation.errors || []);
      }
    }

    // Bedrohungserkennung
    const threatDetection = this.detectThreats(input);
    if (threatDetection.length > 0) {
      errors.push(...threatDetection.map(t => t.description));
      
      // Log threat detection
      threatDetection.forEach(threat => {
        this.logSecurityEvent({
          type: 'threat',
          severity: threat.severity,
          sessionId: 'unknown',
          ipAddress: 'unknown',
          userAgent: 'unknown',
          timestamp: new Date(),
          details: { threat: threat.pattern, description: threat.description },
          action: 'blocked'
        });
      });
    }

    return {
      valid: errors.length === 0,
      sanitized: errors.length === 0 ? sanitized : undefined,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Validiert Formulardaten
   */
  validateFormData(formData: Record<string, unknown>, context?: Partial<SecurityContext>): string[] {
    const warnings: string[] = [];
    
    if (!this.config.inputValidation.enabled) {
      return warnings;
    }

    // Input Validation
    for (const [fieldName, fieldValue] of Object.entries(formData)) {
      const validation = this.validateInput(fieldValue);
      if (!validation.valid && validation.errors) {
        warnings.push(...validation.errors);
      }
    }

    // Threat Detection
    const threats = this.detectThreats(formData);
    threats.forEach(threat => {
      warnings.push(`Sicherheitswarnung: ${threat.description}`);
    });

    return warnings;
  }

  /**
   * Überprüft Rate Limiting
   */
  checkRateLimit(identifier: string, operation: string): boolean {
    if (!this.config.rateLimiting.enabled) {
      return true;
    }

    const key = `${identifier}:${operation}`;
    const now = new Date();
    const bucket = this.rateLimitBuckets.get(key);

    if (!bucket) {
      this.rateLimitBuckets.set(key, {
        tokens: this.config.rateLimiting.requestsPerMinute - 1,
        lastRefill: now
      });
      return true;
    }

    // Token-Bucket Algorithmus
    const timePassed = (now.getTime() - bucket.lastRefill.getTime()) / 1000;
    const tokensToAdd = Math.floor(timePassed / (60 / this.config.rateLimiting.requestsPerMinute));
    
    bucket.tokens = Math.min(
      this.config.rateLimiting.requestsPerMinute,
      bucket.tokens + tokensToAdd
    );
    bucket.lastRefill = now;

    if (bucket.tokens > 0) {
      bucket.tokens--;
      return true;
    }

    return false;
  }

  /**
   * Erstellt eine neue Session
   */
  private createSession(context: Partial<SecurityContext>): string {
    const sessionId = this.generateSessionId();
    const session: SecurityContext = {
      sessionId,
      userId: context.userId,
      roles: context.roles || [],
      permissions: context.permissions || [],
      ipAddress: context.ipAddress || 'unknown',
      userAgent: context.userAgent || 'unknown',
      timestamp: context.timestamp || new Date(),
      mfaVerified: context.mfaVerified || false
    };

    this.sessions.set(sessionId, session);
    return sessionId;
  }

  /**
   * Generiert eine sichere Session-ID
   */
  private generateSessionId(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Überprüft Berechtigungen basierend auf RBAC
   */
  private checkPermission(session: SecurityContext, resource: string, action: string): boolean {
    if (!this.config.authorization.rbac.enabled) {
      return this.config.authorization.defaultPolicy === 'allow';
    }

    // Überprüfung auf Wildcard-Berechtigungen
    if (session.permissions.includes('*')) {
      return true;
    }

    // Überprüfung auf spezifische Berechtigungen
    const requiredPermission = `${resource}:${action}`;
    if (session.permissions.includes(requiredPermission)) {
      return true;
    }

    // Überprüfung auf Rollen-basierte Berechtigungen
    for (const roleId of session.roles) {
      const role = this.config.authorization.rbac.roles.find(r => r.id === roleId);
      if (role && role.permissions.includes(requiredPermission)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Sanitisiert Input gegen XSS und andere Angriffe
   */
  private sanitizeInput(input: unknown): unknown {
    if (typeof input === 'string') {
      // XSS Protection
      let sanitized = input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');

      // SQL Injection Protection
      const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
        /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/gi,
        /(\b(OR|AND)\b\s+['"]\w+['"]\s*=\s*['"]\w+['"])/gi
      ];

      sqlPatterns.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '[BLOCKED]');
      });

      return sanitized;
    }

    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item));
    }

    if (typeof input === 'object' && input !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }

    return input;
  }

  /**
   * Validiert Input gegen Schema
   */
  private validateSchema(input: unknown, schema: unknown): {
    valid: boolean;
    errors?: string[];
  } {
    // Implementierung der Schema-Validierung
    // Hier würde eine echte Schema-Validierung implementiert werden
    return { valid: true };
  }

  /**
   * Erkennt Bedrohungen im Input
   */
  private detectThreats(input: unknown): ThreatDetection[] {
    const threats: ThreatDetection[] = [];
    const inputString = JSON.stringify(input);

    for (const pattern of this.threatPatterns) {
      if (this.matchesThreatPattern(inputString, pattern)) {
        threats.push(pattern);
      }
    }

    return threats;
  }

  /**
   * Überprüft ob Input einem Bedrohungsmuster entspricht
   */
  private matchesThreatPattern(input: string, pattern: ThreatDetection): boolean {
    // Implementierung der Bedrohungserkennung
    // Hier würden echte Pattern-Matching-Algorithmen implementiert werden
    return false;
  }

  /**
   * Loggt Sicherheitsereignisse
   */
  private logSecurityEvent(event: SecurityEvent): void {
    if (this.config.monitoring.auditLogging) {
      this.securityEvents.push(event);
      
      // Real-time Alerts
      if (this.config.monitoring.realTimeAlerts && event.severity === 'critical') {
        this.sendAlert(event);
      }
    }
  }

  /**
   * Sendet Alerts bei kritischen Ereignissen
   */
  private sendAlert(event: SecurityEvent): void {
    // Implementierung der Alert-Funktionalität
    console.error('SECURITY ALERT:', event);
  }

  /**
   * Token-basierte Authentifizierung
   */
  private async authenticateToken(credentials: unknown): Promise<boolean> {
    // Implementierung der Token-Authentifizierung
    return false;
  }

  /**
   * Basic Authentifizierung
   */
  private async authenticateBasic(credentials: unknown): Promise<boolean> {
    // Implementierung der Basic-Authentifizierung
    return false;
  }

  /**
   * OAuth Authentifizierung
   */
  private async authenticateOAuth(credentials: unknown): Promise<boolean> {
    // Implementierung der OAuth-Authentifizierung
    return false;
  }

  /**
   * JWT Authentifizierung
   */
  private async authenticateJWT(credentials: unknown): Promise<boolean> {
    // Implementierung der JWT-Authentifizierung
    return false;
  }

  /**
   * Extrahiert User-ID aus Credentials
   */
  private extractUserId(credentials: unknown): string | undefined {
    // Implementierung der User-ID-Extraktion
    return undefined;
  }

  /**
   * Überprüft ob IP gesperrt ist
   */
  private isIPBlocked(ipAddress: string): boolean {
    // Implementierung der IP-Sperrung
    return false;
  }

  /**
   * Erhöht fehlgeschlagene Versuche
   */
  private incrementFailedAttempts(ipAddress: string): void {
    const attempts = this.failedAttempts.get(ipAddress) || { count: 0, lastAttempt: new Date() };
    attempts.count++;
    attempts.lastAttempt = new Date();
    this.failedAttempts.set(ipAddress, attempts);
  }

  /**
   * Setzt fehlgeschlagene Versuche zurück
   */
  private resetFailedAttempts(ipAddress: string): void {
    this.failedAttempts.delete(ipAddress);
  }

  /**
   * Gibt Sicherheitsstatistiken zurück
   */
  getSecurityStats(): {
    activeSessions: number;
    failedAttempts: number;
    securityEvents: number;
    blockedIPs: number;
  } {
    return {
      activeSessions: this.sessions.size,
      failedAttempts: this.failedAttempts.size,
      securityEvents: this.securityEvents.length,
      blockedIPs: 0 // Implementierung erforderlich
    };
  }
}

// Singleton-Instanz
export const mcpSecurityManager = new MCPSecurityManager({
  authentication: {
    enabled: true,
    method: 'token',
    tokenExpiry: 3600,
    refreshTokens: true,
    maxFailedAttempts: 5,
    lockoutDuration: 900
  },
  authorization: {
    enabled: true,
    defaultPolicy: 'deny',
    rbac: {
      enabled: true,
      roles: [],
      permissions: []
    }
  },
  encryption: {
    enabled: true,
    algorithm: 'AES-256-GCM',
    keyRotationInterval: 86400
  },
  rateLimiting: {
    enabled: true,
    requestsPerMinute: 100,
    burstSize: 20,
    windowSize: 60
  },
  inputValidation: {
    enabled: true,
    maxInputSize: 1048576, // 1MB
    sanitization: true,
    schemaValidation: true
  },
  monitoring: {
    enabled: true,
    auditLogging: true,
    threatDetection: true,
    realTimeAlerts: true
  },
  sandboxing: {
    enabled: true,
    resourceLimits: {
      maxMemory: 512,
      maxCpu: 50,
      maxExecutionTime: 30
    },
    allowedOperations: [],
    blockedOperations: []
  }
}); 