const winston = require('winston');
const path = require('path');

// Token-optimierter Logger für Finance Service
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'valeoflow-finance-service' },
    transports: [
        // Console transport
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        // File transport
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/finance-service.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        }),
        // Error file transport
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/finance-service-error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

// Token-optimierte Logging-Methoden
logger.logApiRequest = (req, res, duration) => {
    // Nur wichtige Requests loggen (Fehler oder nicht-GET)
    if (res.statusCode >= 400 || req.method !==== 'GET') {
        logger.info('Finance API Request', {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('User-Agent'),
            ip: req.ip
        });
    }
};

logger.logFinanceOperation = (operation, entryId, entryNumber, success) => {
    if (success) {
        logger.info('Finance Operation', {
            operation,
            entryId,
            entryNumber,
            status: 'success'
        });
    } else {
        logger.error('Finance Operation Failed', {
            operation,
            entryId,
            entryNumber,
            status: 'failed'
        });
    }
};

logger.logInvoiceOperation = (operation, invoiceId, invoiceNumber, success) => {
    if (success) {
        logger.info('Invoice Operation', {
            operation,
            invoiceId,
            invoiceNumber,
            status: 'success'
        });
    } else {
        logger.error('Invoice Operation Failed', {
            operation,
            invoiceId,
            invoiceNumber,
            status: 'failed'
        });
    }
};

logger.logPaymentOperation = (operation, paymentId, paymentNumber, success) => {
    if (success) {
        logger.info('Payment Operation', {
            operation,
            paymentId,
            paymentNumber,
            status: 'success'
        });
    } else {
        logger.error('Payment Operation Failed', {
            operation,
            paymentId,
            paymentNumber,
            status: 'failed'
        });
    }
};

// Performance-Logging
logger.logPerformance = (operation, duration, metadata = {}) => {
    if (duration > 1000) { // Nur langsame Operationen loggen
        logger.warn('Performance Warning', {
            operation,
            duration: `${duration}ms`,
            ...metadata
        });
    }
};

// Security-Logging
logger.logSecurityEvent = (event, details) => {
    logger.warn('Security Event', {
        event,
        ...details,
        timestamp: new Date().toISOString()
    });
};

// Business Event Logging
logger.logBusinessEvent = (event, data) => {
    logger.info('Business Event', {
        event,
        data,
        timestamp: new Date().toISOString()
    });
};

module.exports = logger; 