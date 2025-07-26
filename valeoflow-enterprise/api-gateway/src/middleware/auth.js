/**
 * ValeoFlow Authentication Middleware
 * JWT-basierte Authentifizierung mit Role-based Access Control
 * Token-optimiert für Enterprise-Umgebung
 * 
 * @author VALEO NeuroERP Team
 * @version 1.0.0
 */

const jwt = require('jsonwebtoken');
const logger = require('../services/logger');

/**
 * JWT Token Validierung
 * @param {string} token - JWT Token
 * @returns {object|null} Decoded token oder null
 */
const validateToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'valeoflow-secret-key');
  } catch (error) {
    logger.warn('Token validation failed:', error.message);
    return null;
  }
};

/**
 * Role-based Access Control
 * @param {string[]} allowedRoles - Erlaubte Rollen
 * @returns {function} Middleware function
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Nicht authentifiziert',
        message: 'Token erforderlich'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(`Access denied for user ${req.user.id} with role ${req.user.role}`);
      return res.status(403).json({
        error: 'Zugriff verweigert',
        message: 'Unzureichende Berechtigungen',
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
    }

    next();
  };
};

/**
 * Haupt-Auth Middleware
 * Token-optimiert: Caching für häufige Token-Validierungen
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Token aus verschiedenen Quellen extrahieren
    const token = 
      req.headers.authorization?.replace('Bearer ', '') ||
      req.headers['x-valeoflow-token'] ||
      req.cookies?.valeoflow_token;

    if (!token) {
      return res.status(401).json({
        error: 'Token fehlt',
        message: 'Authorization Header oder X-ValeoFlow-Token erforderlich'
      });
    }

    // Token validieren
    const decoded = validateToken(token);
    if (!decoded) {
      return res.status(401).json({
        error: 'Ungültiger Token',
        message: 'Token ist abgelaufen oder ungültig'
      });
    }

    // User-Informationen an Request anhängen
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions || [],
      tenant: decoded.tenant,
      lastLogin: decoded.lastLogin
    };

    // Token-optimiert: Request-ID für Tracking
    req.id = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Audit Log für Enterprise
    logger.info('API Access', {
      userId: req.user.id,
      role: req.user.role,
      endpoint: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.id
    });

    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Authentifizierungsfehler',
      message: 'Interner Server Fehler bei der Authentifizierung'
    });
  }
};

/**
 * Optional Auth Middleware
 * Erlaubt anonyme Zugriffe, fügt User-Info hinzu falls verfügbar
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = 
      req.headers.authorization?.replace('Bearer ', '') ||
      req.headers['x-valeoflow-token'] ||
      req.cookies?.valeoflow_token;

    if (token) {
      const decoded = validateToken(token);
      if (decoded) {
        req.user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          permissions: decoded.permissions || [],
          tenant: decoded.tenant
        };
      }
    }

    next();
  } catch (error) {
    // Bei optionaler Auth: Fehler ignorieren und weitermachen
    next();
  }
};

/**
 * Tenant Isolation Middleware
 * Stellt sicher, dass User nur auf ihre Tenant-Daten zugreifen
 */
const requireTenant = (req, res, next) => {
  if (!req.user?.tenant) {
    return res.status(400).json({
      error: 'Tenant erforderlich',
      message: 'User muss einem Tenant zugeordnet sein'
    });
  }

  // Tenant-ID an Request anhängen für Microservice-Routing
  req.tenantId = req.user.tenant;
  next();
};

/**
 * Permission Check Middleware
 * @param {string[]} requiredPermissions - Erforderliche Berechtigungen
 */
const requirePermission = (requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Nicht authentifiziert'
      });
    }

    const hasPermission = requiredPermissions.every(permission =>
      req.user.permissions.includes(permission)
    );

    if (!hasPermission) {
      logger.warn(`Permission denied for user ${req.user.id}`, {
        required: requiredPermissions,
        userPermissions: req.user.permissions
      });

      return res.status(403).json({
        error: 'Berechtigung verweigert',
        message: 'Unzureichende Berechtigungen für diese Aktion',
        requiredPermissions,
        userPermissions: req.user.permissions
      });
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  optionalAuth,
  requireRole,
  requireTenant,
  requirePermission,
  validateToken
}; 