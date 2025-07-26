/**
 * ValeoFlow Enterprise API Gateway
 * SAP Fiori Style ERP Gateway mit Token-optimierter Automatisierung
 * 
 * @author VALEO NeuroERP Team
 * @version 1.0.0
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const morgan = require('morgan');
const winston = require('winston');
require('dotenv').config();

// ValeoFlow Middleware
const authMiddleware = require('./middleware/auth');
const validationMiddleware = require('./middleware/validation');
const monitoringMiddleware = require('./middleware/monitoring');
const circuitBreakerMiddleware = require('./middleware/circuit-breaker');

// ValeoFlow Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const crmRoutes = require('./routes/crm');
const financeRoutes = require('./routes/finance');
const inventoryRoutes = require('./routes/inventory');
const reportingRoutes = require('./routes/reporting');

// ValeoFlow Services
const logger = require('./services/logger');
const metrics = require('./services/metrics');
const cache = require('./services/cache');

const app = express();
const PORT = process.env.PORT || 3000;

// 🛡️ Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  }
}));

// 🔄 CORS Configuration für ValeoFlow
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-ValeoFlow-Token']
}));

// 📊 Compression für Performance
app.use(compression());

// 📝 Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// ⚡ Rate Limiting - Token-optimiert
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 100, // Max 100 Requests pro IP
  message: {
    error: 'Rate limit exceeded',
    message: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Token-optimiert: Verwende User-ID falls verfügbar
    return req.user?.id || req.ip;
  }
});

// 🐌 Slow Down für API Protection
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  delayAfter: 50, // Nach 50 Requests
  delayMs: 500 // 500ms Verzögerung
});

app.use('/api/', limiter);
app.use('/api/', speedLimiter);

// 📊 Monitoring & Metrics
app.use(monitoringMiddleware);

// 🔌 Circuit Breaker für Microservices
app.use(circuitBreakerMiddleware);

// 📋 Request Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 🏠 Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'ValeoFlow API Gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 📊 Metrics Endpoint
app.get('/metrics', async (req, res) => {
  try {
    const metricsData = await metrics.getMetrics();
    res.set('Content-Type', 'text/plain');
    res.send(metricsData);
  } catch (error) {
    logger.error('Metrics error:', error);
    res.status(500).json({ error: 'Metrics nicht verfügbar' });
  }
});

// 🔐 API Routes mit Auth
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/crm', authMiddleware, crmRoutes);
app.use('/api/finance', authMiddleware, financeRoutes);
app.use('/api/inventory', authMiddleware, inventoryRoutes);
app.use('/api/reporting', authMiddleware, reportingRoutes);

// 📚 API Documentation
app.use('/api-docs', require('./routes/docs'));

// 🚫 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint nicht gefunden',
    message: `Route ${req.originalUrl} existiert nicht`,
    availableEndpoints: [
      '/health',
      '/metrics',
      '/api/auth',
      '/api/users',
      '/api/crm',
      '/api/finance',
      '/api/inventory',
      '/api/reporting',
      '/api-docs'
    ]
  });
});

// ⚠️ Error Handler
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  
  res.status(error.status || 500).json({
    error: 'Interner Server Fehler',
    message: process.env.NODE_ENV ====== 'production' 
      ? 'Ein unerwarteter Fehler ist aufgetreten' 
      : error.message,
    timestamp: new Date().toISOString(),
    requestId: req.id
  });
});

// 🚀 Server Start
app.listen(PORT, () => {
  logger.info(`🚀 ValeoFlow API Gateway gestartet auf Port ${PORT}`);
  logger.info(`📊 Metrics verfügbar unter: http://localhost:${PORT}/metrics`);
  logger.info(`📚 API Docs verfügbar unter: http://localhost:${PORT}/api-docs`);
  logger.info(`🏥 Health Check verfügbar unter: http://localhost:${PORT}/health`);
});

// 🔄 Graceful Shutdown
// TODO: Memory Leak Fix - undefined
  logger.info('SIGTERM empfangen, starte Graceful Shutdown...');
  app.close(() => {
    logger.info('Server geschlossen');
    process.exit(0);
  });
});

// TODO: Memory Leak Fix - undefined
  logger.info('SIGINT empfangen, starte Graceful Shutdown...');
  app.close(() => {
    logger.info('Server geschlossen');
    process.exit(0);
  });
});

module.exports = app; 