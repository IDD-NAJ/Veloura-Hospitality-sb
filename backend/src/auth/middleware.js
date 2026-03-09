import { verifyAccessToken, hasRole, hasPermission } from './authService.js';

// Authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No authorization header provided'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = verifyAccessToken(token);
    
    // Attach user info to request
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Authentication failed'
    });
  }
};

// Role-based access control middleware
export const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role;
    
    if (!hasRole(userRole, roles)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        required: roles,
        current: userRole
      });
    }

    next();
  };
};

// Permission-based access control middleware
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role;
    
    if (!hasPermission(userRole, permission)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        required: permission,
        current: userRole
      });
    }

    next();
  };
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      
      if (token) {
        const decoded = verifyAccessToken(token);
        req.user = decoded;
      }
    }
    
    next();
  } catch (error) {
    // Don't fail, just continue without user info
    next();
  }
};

// Self-only access middleware (users can only access their own data)
export const selfOnlyOrAuthorized = (authorizedRoles, resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role;
    const userId = req.user.id;
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField] || req.query[resourceUserIdField];

    // Allow if user has authorized role
    if (hasRole(userRole, authorizedRoles)) {
      return next();
    }

    // Allow if user is accessing their own data
    if (userId === resourceUserId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'You can only access your own data',
      current: userId,
      requested: resourceUserId
    });
  };
};

// Hotel staff or admin middleware
export const hotelStaffOrAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const userRole = req.user.role;
  
  // Allow admins and managers
  if (hasRole(userRole, ['admin', 'manager'])) {
    return next();
  }

  // For staff, check if they belong to the requested hotel
  if (userRole === 'staff') {
    const hotelId = req.params.hotelId || req.body.hotelId || req.query.hotelId;
    
    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: 'Hotel ID is required'
      });
    }

    // In a real implementation, you would check if the staff member works at this hotel
    // For now, we'll allow all staff to access all hotels (simplified)
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Insufficient permissions',
    current: userRole
  });
};

// Rate limiting middleware for auth endpoints
export const authRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const identifier = req.body.email || req.ip;
    const now = Date.now();
    const userAttempts = attempts.get(identifier) || [];

    // Remove old attempts outside the window
    const recentAttempts = userAttempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      return res.status(429).json({
        success: false,
        message: 'Too many authentication attempts. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    // Record this attempt
    recentAttempts.push(now);
    attempts.set(identifier, recentAttempts);

    next();
  };
};

// API key authentication middleware (for external services)
export const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key required'
    });
  }

  // In a real implementation, you would validate the API key against your database
  const validApiKeys = {
    'cloudbeds-webhook-key': 'cloudbeds',
    'siteminder-webhook-key': 'siteminder',
    'stripe-webhook-key': 'stripe'
  };

  const service = validApiKeys[apiKey];
  
  if (!service) {
    return res.status(401).json({
      success: false,
      message: 'Invalid API key'
    });
  }

  req.service = service;
  next();
};

// CORS middleware helper
export const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.CORS_ORIGIN ? 
      process.env.CORS_ORIGIN.split(',') : 
      [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175'
      ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
  
  if (req.user) {
    console.log(`  User: ${req.user.email} (${req.user.role})`);
  }

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '\x1b[31m' : res.statusCode >= 300 ? '\x1b[33m' : '\x1b[32m';
    console.log(`${statusColor}${res.statusCode}\x1b[0m] ${req.method} ${req.path} - ${duration}ms`);
  });

  next();
};

// Error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error(`Error in ${req.method} ${req.path}:`, err);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.details
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    });
  }

  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden'
    });
  }

  if (err.name === 'NotFoundError') {
    return res.status(404).json({
      success: false,
      message: 'Resource not found'
    });
  }

  if (err.name === 'ConflictError') {
    return res.status(409).json({
      success: false,
      message: 'Resource conflict'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404 handler
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
};

// Validation middleware helper
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    next();
  };
};

// Async error wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default {
  authenticate,
  authorize,
  requirePermission,
  optionalAuth,
  selfOnlyOrAuthorized,
  hotelStaffOrAdmin,
  authRateLimit,
  authenticateApiKey,
  corsOptions,
  requestLogger,
  errorHandler,
  notFoundHandler,
  validate,
  asyncHandler
};
