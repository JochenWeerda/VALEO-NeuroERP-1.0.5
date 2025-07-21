import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from '../config/database';
import { errorHandler } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/auth';

// Import module routes
import personalRoutes from './personal';
import financeRoutes from './finance';
import assetsRoutes from './assets';
import productionRoutes from './production';
import warehouseRoutes from './warehouse';
import purchasingRoutes from './purchasing';
import salesRoutes from './sales';
import qualityRoutes from './quality';
import crmRoutes from './crm';
import projectRoutes from './projects';
import documentRoutes from './documents';
import reportingRoutes from './reporting';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    modules: [
      'personal', 'finance', 'assets', 'production', 'warehouse',
      'purchasing', 'sales', 'quality', 'crm', 'projects', 'documents', 'reporting'
    ]
  });
});

// Database connection test
app.get('/api/db-status', async (req, res) => {
  try {
    const client = await config.connect();
    await client.query('SELECT NOW()');
    client.release();
    res.json({ status: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// API versioning
app.use('/api/v1', authMiddleware);

// Module routes
app.use('/api/v1/personal', personalRoutes);
app.use('/api/v1/finance', financeRoutes);
app.use('/api/v1/assets', assetsRoutes);
app.use('/api/v1/production', productionRoutes);
app.use('/api/v1/warehouse', warehouseRoutes);
app.use('/api/v1/purchasing', purchasingRoutes);
app.use('/api/v1/sales', salesRoutes);
app.use('/api/v1/quality', qualityRoutes);
app.use('/api/v1/crm', crmRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/reporting', reportingRoutes);

// Global error handler
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

export default app; 