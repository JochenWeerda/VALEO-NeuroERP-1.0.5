import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import app from '../api/routes';
import config from '../config/database';

// Load environment variables
dotenv.config();

const server = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
server.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
server.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Compression middleware
server.use(compression());

// Logging middleware
if (NODE_ENV === 'development') {
  server.use(morgan('dev'));
} else {
  server.use(morgan('combined'));
}

// Body parsing middleware
server.use(express.json({ limit: '10mb' }));
server.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
server.use('/api', app);

// Health check endpoint
server.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// Database connection test
server.get('/db-test', async (req, res) => {
  try {
    const client = await config.connect();
    await client.query('SELECT NOW() as current_time, version() as db_version');
    client.release();
    
    res.json({
      status: 'connected',
      timestamp: new Date().toISOString(),
      message: 'Database connection successful'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: error.message
    });
  }
});

// 404 handler for unmatched routes
server.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
server.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('🚨 Server Error:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    error: error.message,
    stack: NODE_ENV === 'development' ? error.stack : undefined
  });

  res.status(error.status || 500).json({
    success: false,
    error: {
      message: error.message || 'Internal Server Error',
      status: error.status || 500,
      timestamp: new Date().toISOString()
    },
    ...(NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  await config.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  await config.end();
  process.exit(0);
});

// Start server
server.listen(PORT, () => {
  console.log(`
🚀 VALEO NeuroERP Backend Server gestartet!
   
📊 Server-Informationen:
   • Port: ${PORT}
   • Environment: ${NODE_ENV}
   • Version: 1.0.0
   • Timestamp: ${new Date().toISOString()}
   
🔗 Verfügbare Endpunkte:
   • Health Check: http://localhost:${PORT}/health
   • Database Test: http://localhost:${PORT}/db-test
   • API Base: http://localhost:${PORT}/api
   
📋 API-Module:
   • Personal Management: /api/v1/personal
   • Finanzbuchhaltung: /api/v1/finance
   • Anlagenverwaltung: /api/v1/assets
   • Produktionsmanagement: /api/v1/production
   • Lagerverwaltung: /api/v1/warehouse
   • Einkaufsmanagement: /api/v1/purchasing
   • Verkaufsmanagement: /api/v1/sales
   • Qualitätsmanagement: /api/v1/quality
   • Kundenverwaltung: /api/v1/crm
   • Projektmanagement: /api/v1/projects
   • Dokumentenverwaltung: /api/v1/documents
   • Reporting & Analytics: /api/v1/reporting
   
✅ Server bereit für Anfragen!
  `);
});

export default server; 