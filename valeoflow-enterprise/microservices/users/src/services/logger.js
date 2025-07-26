const winston = require('winston');
const path = require('path');

// Token-optimierte Logging-Konfiguration
const logLevel = process.env.LOG_LEVEL || 'info';
const logDir = process.env.LOG_DIR || 'logs';

// Custom Format für Token-Optimierung
const tokenOptimizedFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        // Token-optimierte Ausgabe: Nur wichtige Informationen
        const baseLog = `${timestamp} [${level.toUpperCase()}]: ${message}`;
        
        if (Object.keys(meta).length > 0) {
            // Reduziere Meta-Daten für Token-Einsparung
            const essentialMeta = {};
            if (meta.userId) essentialMeta.userId = meta.userId;
            if (meta.username) essentialMeta.username = meta.username;
            if (meta.action) essentialMeta.action = meta.action;
            if (meta.ip) essentialMeta.ip = meta.ip;
            if (meta.error) essentialMeta.error = meta.error;
            
            return `${baseLog} ${JSON.stringify(essentialMeta)}`;
        }
        
        return baseLog;
    })
);

// Logger-Konfiguration
const logger = winston.createLogger({
    level: logLevel,
    format: tokenOptimizedFormat,
    transports: [
        // Console Transport
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                tokenOptimizedFormat
            )
        }),
        
        // File Transport für alle Logs
        new winston.transports.File({
            filename: path.join(logDir, 'users-service.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true
        }),
        
        // Error Logs separat
        new winston.transports.File({
            filename: path.join(logDir, 'users-service-error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        
        // Security Events separat
        new winston.transports.File({
            filename: path.join(logDir, 'users-service-security.log'),
            level: 'warn',
            maxsize: 5242880, // 5MB
            maxFiles: 10
        })
    ],
    
    // Exception Handling
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(logDir, 'users-service-exceptions.log')
        })
    ],
    
    // Rejection Handling
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(logDir, 'users-service-rejections.log')
        })
    ]
});

// Token-optimierte Logging-Methoden
class UsersLogger {
    // Standard Logging
    info(message, meta = {}) {
        logger.info(message, meta);
    }

    error(message, meta = {}) {
        logger.error(message, meta);
    }

    warn(message, meta = {}) {
        logger.warn(message, meta);
    }

    debug(message, meta = {}) {
        logger.debug(message, meta);
    }

    // API Request Logging
    logApiRequest(method, path, userId = null, ip = null, userAgent = null, duration = null) {
        const meta = {
            type: 'api_request',
            method,
            path,
            duration: duration ? `${duration}ms` : null
        };
        
        if (userId) meta.userId = userId;
        if (ip) meta.ip = ip;
        if (userAgent) meta.userAgent = userAgent.substring(0, 100); // Token-optimiert
        
        logger.info(`API Request: ${method} ${path}`, meta);
    }

    // Authentication Logging
    logAuthentication(action, username, userId = null, ip = null, success = true, details = {}) {
        const meta = {
            type: 'authentication',
            action,
            username,
            success,
            ip
        };
        
        if (userId) meta.userId = userId;
        if (details.error) meta.error = details.error;
        
        const level = success ? 'info' : 'warn';
        logger[level](`Authentication: ${action} for ${username}`, meta);
    }

    // User Management Logging
    logUserOperation(action, userId, targetUserId = null, details = {}) {
        const meta = {
            type: 'user_operation',
            action,
            userId,
            targetUserId
        };
        
        if (details.changes) meta.changes = details.changes;
        if (details.reason) meta.reason = details.reason;
        
        logger.info(`User Operation: ${action}`, meta);
    }

    // Role Management Logging
    logRoleOperation(action, userId, roleId, targetUserId = null, details = {}) {
        const meta = {
            type: 'role_operation',
            action,
            userId,
            roleId,
            targetUserId
        };
        
        if (details.roleName) meta.roleName = details.roleName;
        if (details.reason) meta.reason = details.reason;
        
        logger.info(`Role Operation: ${action}`, meta);
    }

    // Session Management Logging
    logSessionOperation(action, userId, sessionId = null, ip = null, details = {}) {
        const meta = {
            type: 'session_operation',
            action,
            userId,
            sessionId,
            ip
        };
        
        if (details.expiresAt) meta.expiresAt = details.expiresAt;
        if (details.reason) meta.reason = details.reason;
        
        logger.info(`Session Operation: ${action}`, meta);
    }

    // Password Reset Logging
    logPasswordReset(action, userId, email = null, ip = null, success = true, details = {}) {
        const meta = {
            type: 'password_reset',
            action,
            userId,
            email,
            ip,
            success
        };
        
        if (details.error) meta.error = details.error;
        if (details.tokenUsed) meta.tokenUsed = details.tokenUsed;
        
        const level = success ? 'info' : 'warn';
        logger[level](`Password Reset: ${action}`, meta);
    }

    // Security Event Logging
    logSecurityEvent(event, details = {}) {
        const meta = {
            type: 'security_event',
            event,
            timestamp: new Date().toISOString()
        };
        
        // Token-optimiert: Nur wichtige Security-Details
        if (details.username) meta.username = details.username;
        if (details.userId) meta.userId = details.userId;
        if (details.ip) meta.ip = details.ip;
        if (details.attempts) meta.attempts = details.attempts;
        if (details.lockedUntil) meta.lockedUntil = details.lockedUntil;
        if (details.reason) meta.reason = details.reason;
        
        logger.warn(`Security Event: ${event}`, meta);
    }

    // Performance Logging
    logPerformance(operation, duration, userId = null, details = {}) {
        const meta = {
            type: 'performance',
            operation,
            duration: `${duration}ms`,
            userId
        };
        
        if (details.database) meta.database = details.database;
        if (details.cache) meta.cache = details.cache;
        
        // Nur langsame Operationen loggen
        if (duration > 1000) {
            logger.warn(`Slow Operation: ${operation} took ${duration}ms`, meta);
        } else if (duration > 500) {
            logger.info(`Performance: ${operation} took ${duration}ms`, meta);
        }
    }

    // Business Event Logging
    logBusinessEvent(event, userId = null, details = {}) {
        const meta = {
            type: 'business_event',
            event,
            userId,
            timestamp: new Date().toISOString()
        };
        
        if (details.resourceType) meta.resourceType = details.resourceType;
        if (details.resourceId) meta.resourceId = details.resourceId;
        if (details.changes) meta.changes = details.changes;
        
        logger.info(`Business Event: ${event}`, meta);
    }

    // Database Operation Logging
    logDatabaseOperation(operation, table, userId = null, duration = null, success = true, details = {}) {
        const meta = {
            type: 'database_operation',
            operation,
            table,
            success,
            userId
        };
        
        if (duration) meta.duration = `${duration}ms`;
        if (details.rowsAffected) meta.rowsAffected = details.rowsAffected;
        if (details.error) meta.error = details.error;
        
        const level = success ? 'debug' : 'error';
        logger[level](`Database: ${operation} on ${table}`, meta);
    }

    // Activity Logging
    logActivity(userId, action, resourceType = null, resourceId = null, ip = null, details = {}) {
        const meta = {
            type: 'activity',
            userId,
            action,
            resourceType,
            resourceId,
            ip
        };
        
        if (details.changes) meta.changes = details.changes;
        if (details.reason) meta.reason = details.reason;
        
        logger.info(`Activity: ${action}`, meta);
    }

    // Error Logging mit Kontext
    logError(error, context = {}) {
        const meta = {
            type: 'error',
            error: error.message,
            stack: error.stack,
            ...context
        };
        
        logger.error(`Error: ${error.message}`, meta);
    }

    // Health Check Logging
    logHealthCheck(status, details = {}) {
        const meta = {
            type: 'health_check',
            status,
            timestamp: new Date().toISOString(),
            ...details
        };
        
        const level = status ====== 'healthy' ? 'info' : 'error';
        logger[level](`Health Check: ${status}`, meta);
    }

    // Token-optimierte Batch-Logging
    logBatch(operation, count, duration, success = true, details = {}) {
        const meta = {
            type: 'batch_operation',
            operation,
            count,
            duration: `${duration}ms`,
            success
        };
        
        if (details.errors) meta.errors = details.errors.length;
        if (details.skipped) meta.skipped = details.skipped;
        
        const level = success ? 'info' : 'warn';
        logger[level](`Batch: ${operation} ${count} items`, meta);
    }

    // Cleanup old logs (für Token-Optimierung)
    cleanupOldLogs() {
        logger.info('Log cleanup initiated');
        // Implementierung für automatische Log-Bereinigung
    }
}

// Singleton instance
const usersLogger = new UsersLogger();

// Export both the class and the singleton
module.exports = {
    UsersLogger,
    logger: usersLogger
}; 