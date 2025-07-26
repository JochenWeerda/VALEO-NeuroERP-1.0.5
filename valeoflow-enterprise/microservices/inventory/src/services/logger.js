const winston = require('winston');
const path = require('path');

// Token-optimierter Logger für Inventory Service
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'valeoflow-inventory-service' },
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
            filename: path.join(__dirname, '../../logs/inventory-service.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        }),
        // Error file transport
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/inventory-service-error.log'),
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
        logger.info('Inventory API Request', {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('User-Agent'),
            ip: req.ip
        });
    }
};

logger.logWarehouseOperation = (operation, warehouseId, warehouseCode, success) => {
    if (success) {
        logger.info('Warehouse Operation', {
            operation,
            warehouseId,
            warehouseCode,
            status: 'success'
        });
    } else {
        logger.error('Warehouse Operation Failed', {
            operation,
            warehouseId,
            warehouseCode,
            status: 'failed'
        });
    }
};

logger.logArticleOperation = (operation, articleId, articleNumber, success) => {
    if (success) {
        logger.info('Article Operation', {
            operation,
            articleId,
            articleNumber,
            status: 'success'
        });
    } else {
        logger.error('Article Operation Failed', {
            operation,
            articleId,
            articleNumber,
            status: 'failed'
        });
    }
};

logger.logBatchOperation = (operation, batchId, batchNumber, success) => {
    if (success) {
        logger.info('Batch Operation', {
            operation,
            batchId,
            batchNumber,
            status: 'success'
        });
    } else {
        logger.error('Batch Operation Failed', {
            operation,
            batchId,
            batchNumber,
            status: 'failed'
        });
    }
};

logger.logStockMovementOperation = (operation, movementId, movementNumber, success) => {
    if (success) {
        logger.info('Stock Movement Operation', {
            operation,
            movementId,
            movementNumber,
            status: 'success'
        });
    } else {
        logger.error('Stock Movement Operation Failed', {
            operation,
            movementId,
            movementNumber,
            status: 'failed'
        });
    }
};

logger.logInventoryCountOperation = (operation, countId, countNumber, success) => {
    if (success) {
        logger.info('Inventory Count Operation', {
            operation,
            countId,
            countNumber,
            status: 'success'
        });
    } else {
        logger.error('Inventory Count Operation Failed', {
            operation,
            countId,
            countNumber,
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

// Stock Alert Logging
logger.logStockAlert = (alertType, articleId, articleNumber, message) => {
    logger.warn('Stock Alert', {
        alertType,
        articleId,
        articleNumber,
        message,
        timestamp: new Date().toISOString()
    });
};

module.exports = logger; 