/**
 * Logging-Konfiguration für Node.js-Services zur Integration mit ELK-Stack
 * Datei: node-service-logging.js
 */

const winston = require('winston');
const { ElasticsearchTransport } = require('winston-elasticsearch');

// Konfigurierbare Umgebungsvariablen mit Defaults
const SERVICE_NAME = process.env.SERVICE_NAME || 'unknown-service';
const NODE_ENV = process.env.NODE_ENV || 'development';
const LOG_LEVEL = process.env.LOG_LEVEL || (NODE_ENV === 'production' ? 'info' : 'debug');
const ELASTICSEARCH_HOST = process.env.ELASTICSEARCH_HOST || 'elasticsearch.erp-system.svc.cluster.local:9200';
const ELASTICSEARCH_PROTOCOL = process.env.ELASTICSEARCH_PROTOCOL || 'http';
const ELASTICSEARCH_USER = process.env.ELASTICSEARCH_USER || 'elastic';
const ELASTICSEARCH_PASSWORD = process.env.ELASTICSEARCH_PASSWORD || '';
const USE_ELASTICSEARCH = process.env.USE_ELASTICSEARCH === 'true' || NODE_ENV === 'production';
const LOGSTASH_HOST = process.env.LOGSTASH_HOST || 'logstash.erp-system.svc.cluster.local:8080';
const USE_LOGSTASH = process.env.USE_LOGSTASH === 'true' || false;

// Standard-Format für alle Logs
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.metadata({
    fillExcept: ['level', 'message', 'timestamp']
  }),
  winston.format.printf(info => {
    const { timestamp, level, message, metadata } = info;
    const metaString = Object.keys(metadata).length ? JSON.stringify(metadata) : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message} ${metaString}`;
  })
);

// JSON-Format für Elasticsearch/Logstash
const elasticFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Transporter für Elasticsearch
const createElasticsearchTransport = () => {
  return new ElasticsearchTransport({
    level: LOG_LEVEL,
    clientOpts: {
      node: `${ELASTICSEARCH_PROTOCOL}://${ELASTICSEARCH_HOST}`,
      auth: {
        username: ELASTICSEARCH_USER,
        password: ELASTICSEARCH_PASSWORD
      }
    },
    indexPrefix: `service-${SERVICE_NAME.toLowerCase()}`,
    indexSuffixPattern: 'YYYY.MM.DD',
    messageType: 'log',
    ensureMappingTemplate: true,
    mappingTemplate: {
      index_patterns: [`service-${SERVICE_NAME.toLowerCase()}-*`],
      settings: {
        number_of_shards: 1,
        number_of_replicas: 0
      },
      mappings: {
        properties: {
          '@timestamp': { type: 'date' },
          level: { type: 'keyword' },
          message: { type: 'text' },
          service: { type: 'keyword' },
          environment: { type: 'keyword' },
          trace_id: { type: 'keyword' },
          span_id: { type: 'keyword' },
          user_id: { type: 'keyword' },
          request_id: { type: 'keyword' },
          http: {
            properties: {
              method: { type: 'keyword' },
              url: { type: 'text' },
              status_code: { type: 'integer' },
              duration_ms: { type: 'float' }
            }
          },
          error: {
            properties: {
              message: { type: 'text' },
              stack: { type: 'text' },
              code: { type: 'keyword' }
            }
          }
        }
      }
    }
  });
};

// HTTP-Transport für Logstash
const createLogstashTransport = () => {
  return new winston.transports.Http({
    host: LOGSTASH_HOST.split(':')[0],
    port: parseInt(LOGSTASH_HOST.split(':')[1], 10),
    path: '/',
    ssl: false,
    format: elasticFormat,
    headers: { 'Content-Type': 'application/json' },
    batch: true,
    batchInterval: 5000,
    batchCount: 10
  });
};

// Transports konfigurieren
const transports = [
  // Console-Logging immer aktiviert
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      logFormat
    ),
    level: LOG_LEVEL
  })
];

// Elasticsearch-Transport optional hinzufügen
if (USE_ELASTICSEARCH && ELASTICSEARCH_PASSWORD) {
  try {
    transports.push(createElasticsearchTransport());
  } catch (error) {
    console.warn('Elasticsearch-Transport konnte nicht initialisiert werden:', error.message);
  }
}

// Logstash-Transport optional hinzufügen
if (USE_LOGSTASH) {
  try {
    transports.push(createLogstashTransport());
  } catch (error) {
    console.warn('Logstash-Transport konnte nicht initialisiert werden:', error.message);
  }
}

// Logger erstellen
const logger = winston.createLogger({
  level: LOG_LEVEL,
  defaultMeta: {
    service: SERVICE_NAME,
    environment: NODE_ENV
  },
  transports
});

// Request-Logging-Middleware für Express
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] || req.headers['x-correlation-id'] || `req-${Date.now()}-${Math.random().toString(16).substr(2, 8)}`;
  
  // Speichere Request-ID zur Korrelation
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  
  // Trace-ID von Jaeger, falls vorhanden
  const traceId = req.headers['x-b3-traceid'] || null;
  const spanId = req.headers['x-b3-spanid'] || null;
  
  // Log beim Anfang der Anfrage
  logger.info(`${req.method} ${req.originalUrl} begonnen`, {
    request_id: requestId,
    trace_id: traceId,
    span_id: spanId,
    http: {
      method: req.method,
      url: req.originalUrl,
      headers: {
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type'],
        'content-length': req.headers['content-length']
      }
    },
    remote_ip: req.ip,
    user_id: req.user ? req.user.id : null
  });
  
  // Log beim Ende der Anfrage
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logMethod = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[logMethod](`${req.method} ${req.originalUrl} beendet`, {
      request_id: requestId,
      trace_id: traceId,
      span_id: spanId,
      http: {
        method: req.method,
        url: req.originalUrl,
        status_code: res.statusCode,
        duration_ms: duration
      },
      response: {
        content_length: res._contentLength,
        content_type: res.getHeader('content-type')
      }
    });
  });
  
  next();
};

// Error-Logging-Middleware für Express
const errorLogger = (err, req, res, next) => {
  logger.error(`Fehler bei ${req.method} ${req.originalUrl}`, {
    request_id: req.requestId,
    error: {
      message: err.message,
      stack: err.stack,
      code: err.code || err.statusCode
    },
    http: {
      method: req.method,
      url: req.originalUrl
    }
  });
  
  next(err);
};

// Anwendungsbeispiel mit Express
const setupLogging = (app) => {
  if (!app) return;
  
  // Middleware registrieren
  app.use(requestLogger);
  
  // Error-Middleware als letztes registrieren
  app.use(errorLogger);
  
  // Weise Logger dem App-Objekt zu
  app.locals.logger = logger;
  
  // Shutdown-Handler
  process.on('SIGTERM', () => {
    logger.info('Server herunterfahren...', {
      shutdown_reason: 'SIGTERM'
    });
    
    // Warte auf Flush der Logs
    setTimeout(() => {
      process.exit(0);
    }, 1500);
  });
};

module.exports = {
  logger,
  requestLogger,
  errorLogger,
  setupLogging
}; 