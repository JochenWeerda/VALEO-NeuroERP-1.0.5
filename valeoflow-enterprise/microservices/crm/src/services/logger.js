/**
 * 📝 ValeoFlow CRM - Logger Service
 * =========================================================================
 * Token-optimiertes Logging für CRM Microservice
 * Migriert von VALEO-NeuroERP-2.0 backend/api/services/logger.js
 */

const winston = require('winston');
const path = require('path');

// ======================================================================================================================
// LOGGER-KONFIGURATION
// ======================================================================================================================

class ValeoFlowLogger {
  constructor() {
    this.logger = this.createLogger();
    this.requestCounter = 0;
    this.lastLogTime = Date.now();
  }

  /**
   * Erstellt den Winston Logger
   */
  createLogger() {
    const logFormat = winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    );

    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({
        format: 'HH:mm:ss'
      }),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let log = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(meta).length > 0) {
          log += ` ${JSON.stringify(meta)}`;
        }
        return log;
      })
    );

    return winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: logFormat,
      transports: [
        // Console Transport
        new winston.transports.Console({
          format: consoleFormat,
          level: process.env.NODE_ENV ====== 'production' ? 'warn' : 'debug'
        }),

        // File Transport - Combined Logs
        new winston.transports.File({
          filename: path.join('logs', 'crm-service-combined.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5,
          tailable: true
        }),

        // File Transport - Error Logs
        new winston.transports.File({
          filename: path.join('logs', 'crm-service-error.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
          tailable: true
        }),

        // File Transport - Performance Logs
        new winston.transports.File({
          filename: path.join('logs', 'crm-service-performance.log'),
          level: 'info',
          maxsize: 5242880, // 5MB
          maxFiles: 3,
          tailable: true
        })
      ],

      // Exception Handling
      exceptionHandlers: [
        new winston.transports.File({
          filename: path.join('logs', 'crm-service-exceptions.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 3
        })
      ],

      // Rejection Handling
      rejectionHandlers: [
        new winston.transports.File({
          filename: path.join('logs', 'crm-service-rejections.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 3
        })
      ]
    });
  }

  // ======================================================================================================================
  // TOKEN-OPTIMIERTE LOGGING-METHODEN
  // ======================================================================================================================

  /**
   * Token-optimiertes Info Logging
   * Nur wichtige Events werden geloggt
   */
  info(message, meta = {}) {
    // Token-Optimierung: Nur jeden 10. Request loggen
    if (this.shouldLogRequest()) {
      this.logger.info(message, {
        ...meta,
        service: 'valeoflow-crm',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Error Logging - Immer loggen
   */
  error(message, meta = {}) {
    this.logger.error(message, {
      ...meta,
      service: 'valeoflow-crm',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Warning Logging - Immer loggen
   */
  warn(message, meta = {}) {
    this.logger.warn(message, {
      ...meta,
      service: 'valeoflow-crm',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Debug Logging - Nur in Development
   */
  debug(message, meta = {}) {
    if (process.env.NODE_ENV !==== 'production') {
      this.logger.debug(message, {
        ...meta,
        service: 'valeoflow-crm',
        timestamp: new Date().toISOString()
      });
    }
  }

  // ======================================================================================================================
  // SPEZIALISIERTE LOGGING-METHODEN
  // ======================================================================================================================

  /**
   * API Request Logging
   */
  logApiRequest(req, res, duration) {
    const shouldLog = this.shouldLogRequest() || res.statusCode >= 400;
    
    if (shouldLog) {
      this.info('API Request', {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        userId: req.user?.id
      });
    }
  }

  /**
   * Database Operation Logging
   */
  logDatabaseOperation(operation, table, duration, rowCount = null) {
    // Token-Optimierung: Nur langsame DB-Operationen loggen
    if (duration > 100) {
      this.info('Database Operation', {
        operation,
        table,
        duration,
        rowCount,
        service: 'valeoflow-crm'
      });
    }
  }

  /**
   * Customer Operation Logging
   */
  logCustomerOperation(operation, customerId, customerName, success = true) {
    this.info('Customer Operation', {
      operation,
      customerId,
      customerName,
      success,
      service: 'valeoflow-crm'
    });
  }

  /**
   * Performance Logging
   */
  logPerformance(metric, value, context = {}) {
    this.logger.info('Performance Metric', {
      metric,
      value,
      context,
      service: 'valeoflow-crm',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Security Event Logging
   */
  logSecurityEvent(event, details = {}) {
    this.warn('Security Event', {
      event,
      details,
      service: 'valeoflow-crm',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Business Event Logging
   */
  logBusinessEvent(event, data = {}) {
    this.info('Business Event', {
      event,
      data,
      service: 'valeoflow-crm',
      timestamp: new Date().toISOString()
    });
  }

  // ======================================================================================================================
  // TOKEN-OPTIMIERUNG
  // ======================================================================================================================

  /**
   * Entscheidet, ob ein Request geloggt werden soll
   */
  shouldLogRequest() {
    this.requestCounter++;
    const now = Date.now();
    
    // Logging-Strategie:
    // - Jeder 10. Request
    // - Mindestens alle 5 Sekunden
    // - Immer bei Fehlern (wird separat geprüft)
    
    const shouldLog = 
      this.requestCounter % 10 ====== 0 || 
      (now - this.lastLogTime) > 5000;
    
    if (shouldLog) {
      this.lastLogTime = now;
    }
    
    return shouldLog;
  }

  /**
   * Reset Request Counter
   */
  resetRequestCounter() {
    this.requestCounter = 0;
    this.lastLogTime = Date.now();
  }

  // ======================================================================================================================
  // LOGGING-STATISTIKEN
  // ======================================================================================================================

  /**
   * Gibt Logging-Statistiken zurück
   */
  getLoggingStats() {
    return {
      requestCounter: this.requestCounter,
      lastLogTime: this.lastLogTime,
      service: 'valeoflow-crm',
      timestamp: new Date().toISOString()
    };
  }

  // ======================================================================================================================
  // LOGGING-LEVEL-MANAGEMENT
  // ======================================================================================================================

  /**
   * Ändert das Logging-Level dynamisch
   */
  setLogLevel(level) {
    this.logger.level = level;
    this.info('Log Level Changed', { newLevel: level });
  }

  /**
   * Gibt das aktuelle Logging-Level zurück
   */
  getLogLevel() {
    return this.logger.level;
  }
}

// ======================================================================================================================
// SINGLETON-INSTANZ
// ======================================================================================================================

let loggerInstance = null;

function getLogger() {
  if (!loggerInstance) {
    loggerInstance = new ValeoFlowLogger();
  }
  return loggerInstance;
}

// ======================================================================================================================
// EXPORT
// ======================================================================================================================

module.exports = getLogger(); 