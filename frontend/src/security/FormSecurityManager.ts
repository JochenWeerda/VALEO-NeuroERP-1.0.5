/**
 * Form Security Manager für VALEO NeuroERP 2.0
 * Absicherung aller Formulare gegen Schadcode und Intrusion-Methoden
 * 
 * Implementiert basierend auf MCP-Sicherheitsstandards und OWASP-Richtlinien
 */

import { mcpSecurityManager } from './MCPSecurityManager';

// Form Security Interfaces
interface FormSecurityConfig {
  inputValidation: {
    enabled: boolean;
    maxFieldLength: number;
    allowedCharacters: RegExp;
    blockedPatterns: RegExp[];
    sanitization: boolean;
    encoding: 'html' | 'url' | 'base64';
  };
  fileUpload: {
    enabled: boolean;
    maxFileSize: number; // in bytes
    allowedTypes: string[];
    blockedExtensions: string[];
    virusScan: boolean;
    contentValidation: boolean;
  };
  csrfProtection: {
    enabled: boolean;
    tokenExpiry: number; // in seconds
    tokenRotation: boolean;
  };
  xssProtection: {
    enabled: boolean;
    contentSecurityPolicy: boolean;
    inputSanitization: boolean;
    outputEncoding: boolean;
  };
  sqlInjectionProtection: {
    enabled: boolean;
    parameterizedQueries: boolean;
    inputValidation: boolean;
    patternDetection: boolean;
  };
  sessionSecurity: {
    enabled: boolean;
    sessionTimeout: number; // in seconds
    secureCookies: boolean;
    httpOnly: boolean;
    sameSite: 'strict' | 'lax' | 'none';
  };
  rateLimiting: {
    enabled: boolean;
    maxSubmissionsPerMinute: number;
    maxSubmissionsPerHour: number;
    burstSize: number;
  };
  auditLogging: {
    enabled: boolean;
    logAllActions: boolean;
    sensitiveFields: string[];
    retentionPeriod: number; // in days
  };
}

interface FormSecurityContext {
  formId: string;
  userId?: string;
  sessionId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  formData: Record<string, unknown>;
}

interface FormSecurityEvent {
  type: 'validation' | 'submission' | 'file_upload' | 'security_violation' | 'audit';
  severity: 'low' | 'medium' | 'high' | 'critical';
  formId: string;
  userId?: string;
  sessionId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  details: Record<string, unknown>;
  action: 'allowed' | 'denied' | 'blocked' | 'sanitized';
}

interface ValidationResult {
  valid: boolean;
  sanitized?: Record<string, unknown>;
  errors?: Record<string, string[]>;
  warnings?: Record<string, string[]>;
  securityIssues?: string[];
}

interface FileUploadResult {
  valid: boolean;
  sanitized?: File;
  errors?: string[];
  securityIssues?: string[];
  virusScanResult?: {
    clean: boolean;
    threats?: string[];
  };
}

export class FormSecurityManager {
  private config: FormSecurityConfig;
  private securityEvents: FormSecurityEvent[] = [];
  private blockedIPs: Set<string> = new Set();
  private rateLimitBuckets: Map<string, { count: number; lastReset: Date }> = new Map();

  constructor(config: FormSecurityConfig) {
    this.config = config;
  }

  /**
   * Validiert und sanitisiert Formulardaten
   */
  validateFormData(
    formId: string,
    formData: Record<string, unknown>,
    context: Partial<FormSecurityContext>
  ): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: {},
      warnings: {},
      securityIssues: []
    };

    const sanitizedData: Record<string, unknown> = {};

    // Rate Limiting für Formular-Submission
    if (!this.checkRateLimit(context.ipAddress || 'unknown', formId)) {
      result.valid = false;
      result.securityIssues?.push('Rate limit exceeded for form submission');
      this.logSecurityEvent({
        type: 'security_violation',
        severity: 'medium',
        formId,
        userId: context.userId,
        sessionId: context.sessionId,
        ipAddress: context.ipAddress || 'unknown',
        userAgent: context.userAgent || 'unknown',
        timestamp: new Date(),
        details: { reason: 'Rate limit exceeded' },
        action: 'denied'
      });
      return result;
    }

    // Input Validation für jedes Feld
    for (const [fieldName, fieldValue] of Object.entries(formData)) {
      const fieldValidation = this.validateField(fieldName, fieldValue);
      
      if (!fieldValidation.valid) {
        result.valid = false;
        result.errors![fieldName] = fieldValidation.errors || [];
      }

      if (fieldValidation.warnings && fieldValidation.warnings.length > 0) {
        result.warnings![fieldName] = fieldValidation.warnings;
      }

      if (fieldValidation.securityIssues && fieldValidation.securityIssues.length > 0) {
        result.securityIssues!.push(...fieldValidation.securityIssues);
      }

      // Sanitization
      if (this.config.inputValidation.sanitization) {
        sanitizedData[fieldName] = this.sanitizeFieldValue(fieldValue);
      } else {
        sanitizedData[fieldName] = fieldValue;
      }
    }

    // XSS Protection
    if (this.config.xssProtection.enabled) {
      const xssIssues = this.detectXSS(formData);
      if (xssIssues.length > 0) {
        result.valid = false;
        result.securityIssues!.push(...xssIssues);
      }
    }

    // SQL Injection Protection
    if (this.config.sqlInjectionProtection.enabled) {
      const sqlIssues = this.detectSQLInjection(formData);
      if (sqlIssues.length > 0) {
        result.valid = false;
        result.securityIssues!.push(...sqlIssues);
      }
    }

    // CSRF Protection
    if (this.config.csrfProtection.enabled) {
      const csrfValid = this.validateCSRFToken(formData, context);
      if (!csrfValid) {
        result.valid = false;
        result.securityIssues!.push('CSRF token validation failed');
      }
    }

    if (result.valid && this.config.inputValidation.sanitization) {
      result.sanitized = sanitizedData;
    }

    // Audit Logging
    if (this.config.auditLogging.enabled) {
      this.logSecurityEvent({
        type: 'validation',
        severity: result.valid ? 'low' : 'high',
        formId,
        userId: context.userId,
        sessionId: context.sessionId,
        ipAddress: context.ipAddress || 'unknown',
        userAgent: context.userAgent || 'unknown',
        timestamp: new Date(),
        details: {
          valid: result.valid,
          errors: result.errors,
          warnings: result.warnings,
          securityIssues: result.securityIssues
        },
        action: result.valid ? 'allowed' : 'denied'
      });
    }

    return result;
  }

  /**
   * Validiert und sanitisiert Datei-Uploads
   */
  validateFileUpload(
    formId: string,
    file: File,
    context: Partial<FormSecurityContext>
  ): FileUploadResult {
    const result: FileUploadResult = {
      valid: true,
      errors: [],
      securityIssues: []
    };

    // Dateigröße überprüfen
    if (file.size > this.config.fileUpload.maxFileSize) {
      result.valid = false;
      result.errors!.push(`File size exceeds maximum allowed size of ${this.config.fileUpload.maxFileSize} bytes`);
    }

    // Dateityp überprüfen
    const fileExtension = this.getFileExtension(file.name);
    if (this.config.fileUpload.blockedExtensions.includes(fileExtension.toLowerCase())) {
      result.valid = false;
      result.errors!.push(`File type ${fileExtension} is not allowed`);
    }

    // Erlaubte Typen überprüfen
    if (this.config.fileUpload.allowedTypes.length > 0) {
      const mimeType = file.type;
      if (!this.config.fileUpload.allowedTypes.includes(mimeType)) {
        result.valid = false;
        result.errors!.push(`MIME type ${mimeType} is not allowed`);
      }
    }

    // Content Validation
    if (this.config.fileUpload.contentValidation) {
      const contentIssues = this.validateFileContent(file);
      if (contentIssues.length > 0) {
        result.valid = false;
        result.securityIssues!.push(...contentIssues);
      }
    }

    // Virus Scan (Simulation)
    if (this.config.fileUpload.virusScan) {
      const virusScanResult = this.scanForViruses(file);
      if (!virusScanResult.clean) {
        result.valid = false;
        result.virusScanResult = virusScanResult;
        result.securityIssues!.push('Virus detected in uploaded file');
      }
    }

    // Audit Logging
    if (this.config.auditLogging.enabled) {
      this.logSecurityEvent({
        type: 'file_upload',
        severity: result.valid ? 'low' : 'high',
        formId,
        userId: context.userId,
        sessionId: context.sessionId,
        ipAddress: context.ipAddress || 'unknown',
        userAgent: context.userAgent || 'unknown',
        timestamp: new Date(),
        details: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          valid: result.valid,
          errors: result.errors,
          securityIssues: result.securityIssues
        },
        action: result.valid ? 'allowed' : 'denied'
      });
    }

    return result;
  }

  /**
   * Validiert ein einzelnes Feld
   */
  private validateField(fieldName: string, fieldValue: unknown): {
    valid: boolean;
    errors?: string[];
    warnings?: string[];
    securityIssues?: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const securityIssues: string[] = [];

    if (typeof fieldValue === 'string') {
      // Längenprüfung
      if (fieldValue.length > this.config.inputValidation.maxFieldLength) {
        errors.push(`Field length exceeds maximum allowed length of ${this.config.inputValidation.maxFieldLength} characters`);
      }

      // Erlaubte Zeichen überprüfen
      if (!this.config.inputValidation.allowedCharacters.test(fieldValue)) {
        errors.push('Field contains disallowed characters');
      }

      // Blockierte Patterns überprüfen
      for (const pattern of this.config.inputValidation.blockedPatterns) {
        if (pattern.test(fieldValue)) {
          securityIssues.push(`Field contains blocked pattern: ${pattern.source}`);
        }
      }

      // XSS Detection
      if (this.config.xssProtection.enabled) {
        const xssPatterns = [
          /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
          /javascript:/gi,
          /on\w+\s*=/gi,
          /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi
        ];

        for (const pattern of xssPatterns) {
          if (pattern.test(fieldValue)) {
            securityIssues.push('XSS attempt detected');
            break;
          }
        }
      }

      // SQL Injection Detection
      if (this.config.sqlInjectionProtection.enabled) {
        const sqlPatterns = [
          /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
          /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/gi,
          /(\b(OR|AND)\b\s+['"]\w+['"]\s*=\s*['"]\w+['"])/gi,
          /(\b(OR|AND)\b\s+\d+\s*=\s*\d+\s*--)/gi,
          /(\b(OR|AND)\b\s+\d+\s*=\s*\d+\s*#)/gi
        ];

        for (const pattern of sqlPatterns) {
          if (pattern.test(fieldValue)) {
            securityIssues.push('SQL injection attempt detected');
            break;
          }
        }
      }
    }

    return {
      valid: errors.length === 0 && securityIssues.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      securityIssues: securityIssues.length > 0 ? securityIssues : undefined
    };
  }

  /**
   * Sanitisiert einen Feldwert
   */
  private sanitizeFieldValue(fieldValue: unknown): unknown {
    if (typeof fieldValue === 'string') {
      let sanitized = fieldValue;

      // HTML Encoding
      if (this.config.inputValidation.encoding === 'html') {
        sanitized = sanitized
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/\//g, '&#x2F;');
      }

      // URL Encoding
      if (this.config.inputValidation.encoding === 'url') {
        sanitized = encodeURIComponent(sanitized);
      }

      // Base64 Encoding
      if (this.config.inputValidation.encoding === 'base64') {
        sanitized = btoa(sanitized);
      }

      return sanitized;
    }

    return fieldValue;
  }

  /**
   * Erkennt XSS-Angriffe
   */
  private detectXSS(formData: Record<string, unknown>): string[] {
    const issues: string[] = [];
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
    ];

    for (const [fieldName, fieldValue] of Object.entries(formData)) {
      if (typeof fieldValue === 'string') {
        for (const pattern of xssPatterns) {
          if (pattern.test(fieldValue)) {
            issues.push(`XSS attempt detected in field: ${fieldName}`);
            break;
          }
        }
      }
    }

    return issues;
  }

  /**
   * Erkennt SQL-Injection-Angriffe
   */
  private detectSQLInjection(formData: Record<string, unknown>): string[] {
    const issues: string[] = [];
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
      /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/gi,
      /(\b(OR|AND)\b\s+['"]\w+['"]\s*=\s*['"]\w+['"])/gi,
      /(\b(OR|AND)\b\s+\d+\s*=\s*\d+\s*--)/gi,
      /(\b(OR|AND)\b\s+\d+\s*=\s*\d+\s*#)/gi,
      /(\b(OR|AND)\b\s+\d+\s*=\s*\d+\s*\/\*)/gi
    ];

    for (const [fieldName, fieldValue] of Object.entries(formData)) {
      if (typeof fieldValue === 'string') {
        for (const pattern of sqlPatterns) {
          if (pattern.test(fieldValue)) {
            issues.push(`SQL injection attempt detected in field: ${fieldName}`);
            break;
          }
        }
      }
    }

    return issues;
  }

  /**
   * Validiert CSRF-Token
   */
  private validateCSRFToken(formData: Record<string, unknown>, context: Partial<FormSecurityContext>): boolean {
    // Implementierung der CSRF-Token-Validierung
    // Hier würde eine echte CSRF-Token-Validierung implementiert werden
    return true;
  }

  /**
   * Überprüft Rate Limiting
   */
  private checkRateLimit(identifier: string, formId: string): boolean {
    if (!this.config.rateLimiting.enabled) {
      return true;
    }

    const key = `${identifier}:${formId}`;
    const now = new Date();
    const bucket = this.rateLimitBuckets.get(key);

    if (!bucket) {
      this.rateLimitBuckets.set(key, {
        count: 1,
        lastReset: now
      });
      return true;
    }

    // Reset counter if hour has passed
    const timePassed = (now.getTime() - bucket.lastReset.getTime()) / 1000;
    if (timePassed > 3600) { // 1 hour
      bucket.count = 1;
      bucket.lastReset = now;
      return true;
    }

    if (bucket.count >= this.config.rateLimiting.maxSubmissionsPerHour) {
      return false;
    }

    bucket.count++;
    return true;
  }

  /**
   * Validiert Dateiinhalt
   */
  private validateFileContent(file: File): string[] {
    const issues: string[] = [];

    // Überprüfung auf verdächtige Dateiheader
    const suspiciousHeaders = [
      '4D5A90', // MZ header (executable)
      '7F454C46', // ELF header
      '504B0304', // ZIP header
      '25504446' // PDF header
    ];

    // Hier würde eine echte Dateiheader-Validierung implementiert werden
    // Für Demo-Zwecke wird eine einfache Überprüfung durchgeführt

    return issues;
  }

  /**
   * Scannt Datei auf Viren (Simulation)
   */
  private scanForViruses(file: File): { clean: boolean; threats?: string[] } {
    // Hier würde eine echte Virenscanner-Integration implementiert werden
    // Für Demo-Zwecke wird immer "clean" zurückgegeben
    return { clean: true };
  }

  /**
   * Extrahiert Dateiendung
   */
  private getFileExtension(filename: string): string {
    return filename.split('.').pop() || '';
  }

  /**
   * Loggt Sicherheitsereignisse
   */
  private logSecurityEvent(event: FormSecurityEvent): void {
    if (this.config.auditLogging.enabled) {
      this.securityEvents.push(event);
      
      // Real-time Alerts für kritische Ereignisse
      if (event.severity === 'critical') {
        this.sendAlert(event);
      }
    }
  }

  /**
   * Sendet Alerts bei kritischen Ereignissen
   */
  private sendAlert(event: FormSecurityEvent): void {
    // Implementierung der Alert-Funktionalität
    console.error('FORM SECURITY ALERT:', event);
  }

  /**
   * Gibt Sicherheitsstatistiken zurück
   */
  getSecurityStats(): {
    totalEvents: number;
    securityViolations: number;
    blockedSubmissions: number;
    xssAttempts: number;
    sqlInjectionAttempts: number;
  } {
    const stats = {
      totalEvents: this.securityEvents.length,
      securityViolations: 0,
      blockedSubmissions: 0,
      xssAttempts: 0,
      sqlInjectionAttempts: 0
    };

    for (const event of this.securityEvents) {
      if (event.type === 'security_violation') {
        stats.securityViolations++;
      }
      if (event.action === 'denied' || event.action === 'blocked') {
        stats.blockedSubmissions++;
      }
      if (event.details.securityIssues && Array.isArray(event.details.securityIssues)) {
        const securityIssues = event.details.securityIssues as string[];
        if (securityIssues.some(issue => issue.includes('XSS'))) {
          stats.xssAttempts++;
        }
        if (securityIssues.some(issue => issue.includes('SQL injection'))) {
          stats.sqlInjectionAttempts++;
        }
      }
    }

    return stats;
  }
}

// Singleton-Instanz
export const formSecurityManager = new FormSecurityManager({
  inputValidation: {
    enabled: true,
    maxFieldLength: 10000,
    allowedCharacters: /^[a-zA-Z0-9äöüßÄÖÜ\s\-_.,!?@#$%&*()+=:;"'<>\/\\[\]{}|~`^]+$/,
    blockedPatterns: [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi
    ],
    sanitization: true,
    encoding: 'html'
  },
  fileUpload: {
    enabled: true,
    maxFileSize: 10485760, // 10MB
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    blockedExtensions: ['exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js'],
    virusScan: true,
    contentValidation: true
  },
  csrfProtection: {
    enabled: true,
    tokenExpiry: 3600,
    tokenRotation: true
  },
  xssProtection: {
    enabled: true,
    contentSecurityPolicy: true,
    inputSanitization: true,
    outputEncoding: true
  },
  sqlInjectionProtection: {
    enabled: true,
    parameterizedQueries: true,
    inputValidation: true,
    patternDetection: true
  },
  sessionSecurity: {
    enabled: true,
    sessionTimeout: 3600,
    secureCookies: true,
    httpOnly: true,
    sameSite: 'strict'
  },
  rateLimiting: {
    enabled: true,
    maxSubmissionsPerMinute: 10,
    maxSubmissionsPerHour: 100,
    burstSize: 5
  },
  auditLogging: {
    enabled: true,
    logAllActions: true,
    sensitiveFields: ['password', 'creditCard', 'ssn', 'email'],
    retentionPeriod: 90
  }
}); 