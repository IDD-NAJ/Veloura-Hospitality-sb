import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Import configuration
import { config, printConfigStatus } from './config/environment.js';

// Import database
import { testConnection, healthCheck } from './database/connection.js';

// Import middleware
import { errorHandler, notFoundHandler, corsOptions } from './auth/middleware.js';

// Import routes
import authRoutes from './routes/auth.js';
import hotelRoutes from './routes/hotels.js';
import bookingRoutes from './routes/bookings.js';
import paymentRoutes from './routes/payments.js';
import staffRoutes from './routes/staff.js';
import analyticsRoutes from './routes/analytics.js';
import webhookRoutes from './routes/webhooks.js';
import reviewRoutes from './routes/reviews.js';
import statsRoutes from './routes/stats.js';
import amadeusRoutes from './routes/amadeus.js';
import foursquareRoutes from './routes/foursquare.js';
import makecorpsRoutes from './routes/makecorps.js';

// Import scheduled tasks
import { initScheduledTasks } from './services/scheduler.js';

// Initialize Express app
const app = express();
const PORT = config.server.port;

// ═══════════════════════════════════════════════════════════════════
//  MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════

// Security headers
app.use(helmet({
  contentSecurityPolicy: config.server.isProduction ? undefined : false,
  crossOriginEmbedderPolicy: false
}));

// CORS
app.use(cors(corsOptions));

// Compression
app.use(compression());

// Request logging
if (config.server.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Webhooks need raw body (must be before json parser)
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

// JSON body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    retryAfter: Math.ceil(config.rateLimit.windowMs / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', globalLimiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ═══════════════════════════════════════════════════════════════════
//  ROUTES
// ═══════════════════════════════════════════════════════════════════

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const dbHealth = await healthCheck();
  const status = dbHealth.status === 'healthy' ? 200 : 503;

  res.status(status).json({
    success: dbHealth.status === 'healthy',
    service: 'Veloura Hotel Backend',
    version: '1.0.0',
    environment: config.server.nodeEnv,
    timestamp: new Date().toISOString(),
    database: dbHealth,
    integrations: {
      stripe: config.stripe.isConfigured,
      sendgrid: config.sendgrid.isConfigured,
      twilio: config.twilio.isConfigured,
      cloudbeds: config.cloudbeds.isConfigured,
      siteminder: config.siteminder.isConfigured,
      googleMaps: config.googleMaps.isConfigured,
      amadeus: !!process.env.AMADEUS_API_KEY,
      foursquare: !!process.env.FOURSQUARE_API_KEY,
      makecorps: !!process.env.MAKECORPS_API_KEY
    }
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    service: 'Veloura Hotel Operations API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      hotels: '/api/hotels',
      bookings: '/api/bookings',
      payments: '/api/payments',
      staff: '/api/staff',
      analytics: '/api/analytics',
      reviews: '/api/reviews',
      webhooks: '/api/webhooks',
      stats: '/api/stats',
      amadeus: '/api/amadeus',
      foursquare: '/api/foursquare',
      makecorps: '/api/makecorps',
      health: '/api/health'
    }
  });
});

// Mount route handlers
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/stats', statsRoutes);

// External service integrations
app.use('/api/amadeus', amadeusRoutes);
app.use('/api/foursquare', foursquareRoutes);
app.use('/api/makecorps', makecorpsRoutes);

// ═══════════════════════════════════════════════════════════════════
//  INTEGRATION-SPECIFIC ROUTES
// ═══════════════════════════════════════════════════════════════════

// Cloudbeds sync endpoint
app.post('/api/integrations/cloudbeds/sync',
  async (req, res) => {
    try {
      if (!config.cloudbeds.isConfigured) {
        return res.status(503).json({ success: false, message: 'Cloudbeds is not configured' });
      }
      const { cloudbeds } = await import('./services/cloudbeds.js');
      const results = await cloudbeds.syncReservations();
      res.json({ success: true, data: results });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// SiteMinder sync endpoint
app.post('/api/integrations/siteminder/sync',
  async (req, res) => {
    try {
      if (!config.siteminder.isConfigured) {
        return res.status(503).json({ success: false, message: 'SiteMinder is not configured' });
      }
      const { siteminder } = await import('./services/siteminder.js');
      const { cloudbeds } = await import('./services/cloudbeds.js');
      const { property_id } = req.body;
      const results = await siteminder.syncFromCloudbeds(property_id, cloudbeds);
      res.json({ success: true, data: results });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// SiteMinder channels endpoint
app.get('/api/integrations/siteminder/channels/:propertyId',
  async (req, res) => {
    try {
      if (!config.siteminder.isConfigured) {
        return res.status(503).json({ success: false, message: 'SiteMinder is not configured' });
      }
      const { siteminder } = await import('./services/siteminder.js');
      const channels = await siteminder.getChannels(req.params.propertyId);
      res.json({ success: true, data: channels });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Toggle SiteMinder channel
app.patch('/api/integrations/siteminder/channels/:propertyId/:channelId',
  async (req, res) => {
    try {
      if (!config.siteminder.isConfigured) {
        return res.status(503).json({ success: false, message: 'SiteMinder is not configured' });
      }
      const { siteminder } = await import('./services/siteminder.js');
      const { enabled } = req.body;
      await siteminder.toggleChannel(req.params.propertyId, req.params.channelId, enabled);
      res.json({ success: true, message: 'Channel toggled' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Google Maps endpoints
app.get('/api/integrations/maps/geocode',
  async (req, res) => {
    try {
      if (!config.googleMaps.isConfigured) {
        return res.status(503).json({ success: false, message: 'Google Maps is not configured' });
      }
      const { googleMapsService } = await import('./services/googlemaps.js');
      const result = await googleMapsService.geocode(req.query.address);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

app.get('/api/integrations/maps/nearby',
  async (req, res) => {
    try {
      if (!config.googleMaps.isConfigured) {
        return res.status(503).json({ success: false, message: 'Google Maps is not configured' });
      }
      const { googleMapsService } = await import('./services/googlemaps.js');
      const { lat, lng, type, radius } = req.query;
      const result = await googleMapsService.getNearby(lat, lng, type, radius);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Messaging endpoints
app.post('/api/messaging/sms',
  async (req, res) => {
    try {
      if (!config.twilio.isConfigured) {
        return res.status(503).json({ success: false, message: 'Twilio is not configured' });
      }
      const { twilioService } = await import('./services/twilio.js');
      const result = await twilioService.send({ ...req.body, channel: 'sms' });
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

app.post('/api/messaging/whatsapp',
  async (req, res) => {
    try {
      if (!config.twilio.isConfigured) {
        return res.status(503).json({ success: false, message: 'Twilio is not configured' });
      }
      const { twilioService } = await import('./services/twilio.js');
      const result = await twilioService.send({ ...req.body, channel: 'whatsapp' });
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

app.post('/api/messaging/email',
  async (req, res) => {
    try {
      if (!config.sendgrid.isConfigured) {
        return res.status(503).json({ success: false, message: 'SendGrid is not configured' });
      }
      const { sendgridService } = await import('./services/sendgrid.js');
      const result = await sendgridService.send(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ═══════════════════════════════════════════════════════════════════
//  ERROR HANDLING
// ═══════════════════════════════════════════════════════════════════

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ═══════════════════════════════════════════════════════════════════
//  SERVER STARTUP
// ═══════════════════════════════════════════════════════════════════

const startServer = async () => {
  try {
    // Print configuration status
    printConfigStatus();

    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected && config.server.isProduction) {
      console.error('❌ Cannot start server without database connection in production');
      process.exit(1);
    }

    // Initialize scheduled tasks (cron jobs)
    initScheduledTasks();

    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`\n🏨 Veloura Hotel Backend running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      console.log(`💊 Health check at http://localhost:${PORT}/api/health`);
      console.log(`🌍 Environment: ${config.server.nodeEnv}\n`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('⚠️ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Unhandled errors
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
