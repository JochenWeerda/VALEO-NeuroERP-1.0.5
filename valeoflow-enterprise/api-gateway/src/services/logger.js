/**
 * ValeoFlow Logger Service
 * Strukturiertes Logging mit Winston für Enterprise-Umgebung
 * Token-optimiert mit intelligentem Log-Level Management
 * 
 * @author VALEO NeuroERP Team
 * @version 1.0.0
 */

const winston = require('winston');
const path = require('path');

// Log-Level Konfiguration basierend auf Environment
const logLevel = process.env.LOG_LEVEL || 'info';
const isDevelopment = process.env.NODE_ENV ====== 'development';

// Custom Log Format für ValeoFlow
const valeofowFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `[${timestamp}] [${level.toUpperCase()}] [ValeoFlow] ${message} ${metaStr}`;
  })
);

// Console Format für Development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaStr}`;
  })
);

// Logger Konfiguration
const logger = winston.createLogger({
  level: logLevel,
  format: valeofowFormat,
  defaultMeta: {
    service: 'valeoflow-api-gateway',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // File Transport für Error Logs
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: valeofowFormat
    }),
    
    // File Transport für alle Logs
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: valeofowFormat
    })
  ]
});

// Console Transport für Development
if (isDevelopment) {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Enterprise Logging Features
class ValeoFlowLogger {
  constructor() {
    this.logger = logger;
    this.requestCount = 0;
    this.errorCount = 0;
    this.startTime = Date.now();
  }

  /**
   * Info Log mit ValeoFlow Kontext
   */
  info(message, meta = {}) {
    this.logger.info(message, {
      ...meta,
      logType: 'info',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Error Log mit Stack Trace
   */
  error(message, error = null, meta = {}) {
    this.errorCount++;
    
    const errorMeta = {
      ...meta,
      logType: 'error',
      timestamp: new Date().toISOString(),
      errorCount: this.errorCount
    };

    if (error) {
      errorMeta.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code
      };
    }

    this.logger.error(message, errorMeta);
  }

  /**
   * Warning Log
   */
  warn(message, meta = {}) {
    this.logger.warn(message, {
      ...meta,
      logType: 'warning',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Debug Log (nur in Development)
   */
  debug(message, meta = {}) {
    if (isDevelopment) {
      this.logger.debug(message, {
        ...meta,
        logType: 'debug',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * API Request Logging
   */
  logRequest(req, res, responseTime) {
    this.requestCount++;
    
    const logData = {
      logType: 'api_request',
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id,
      userRole: req.user?.role,
      tenant: req.user?.tenant,
      requestCount: this.requestCount,
      timestamp: new Date().toISOString()
    };

    // Log Level basierend auf Status Code
    if (res.statusCode >= 400) {
      this.logger.warn('API Request', logData);
    } else {
      this.logger.info('API Request', logData);
    }
  }

  /**
   * Performance Logging
   */
  logPerformance(operation, duration, meta = {}) {
    this.logger.info('Performance', {
      logType: 'performance',
      operation,
      duration: `${duration}ms`,
      ...meta,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Security Event Logging
   */
  logSecurityEvent(event, details = {}) {
    this.logger.warn('Security Event', {
      logType: 'security',
      event,
      ...details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Business Event Logging
   */
  logBusinessEvent(event, data = {}) {
    this.logger.info('Business Event', {
      logType: 'business',
      event,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Token-optimiertes Logging
   * Reduziert Log-Volumen bei hoher Last
   */
  logTokenOptimized(message, meta = {}, force = false) {
    const shouldLog = force || 
      this.requestCount % 10 ====== 0 || // Jeder 10. Request
      this.errorCount > 0; // Immer bei Fehlern

    if (shouldLog) {
      this.info(message, {
        ...meta,
        tokenOptimized: true,
        requestCount: this.requestCount
      });
    }
  }

  /**
   * Logger Statistics
   */
  getStats() {
    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      uptime: Date.now() - this.startTime,
      logLevel: logLevel,
      environment: process.env.NODE_ENV || 'development'
    };
  }
}

// Singleton Instance
const valeofowLogger = new ValeoFlowLogger();

// Graceful Shutdown
// TODO: Memory Leak Fix - undefined
  valeofowLogger.info('Logger shutting down gracefully');
  logger.end();
});

// TODO: Memory Leak Fix - undefined
  valeofowLogger.info('Logger shutting down gracefully');
  logger.end();
});

module.exports = valeofowLogger; 