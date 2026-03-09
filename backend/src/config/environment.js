import Joi from 'joi';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment variable validation schema
const envSchema = Joi.object({
  // Server
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),

  // Database (required)
  DATABASE_URL: Joi.string().required().messages({
    'any.required': 'DATABASE_URL is required. Set up a Neon PostgreSQL database.'
  }),

  // JWT (required)
  JWT_SECRET: Joi.string().min(32).required().messages({
    'any.required': 'JWT_SECRET is required (min 32 characters)',
    'string.min': 'JWT_SECRET must be at least 32 characters long'
  }),
  JWT_EXPIRES_IN: Joi.string().default('24h'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  // Stripe (optional — payments won't work without it)
  STRIPE_PUBLISHABLE_KEY: Joi.string().optional().allow(''),
  STRIPE_SECRET_KEY: Joi.string().optional().allow(''),
  STRIPE_WEBHOOK_SECRET: Joi.string().optional().allow(''),

  // SendGrid (optional — email won't work without it)
  SENDGRID_API_KEY: Joi.string().optional().allow(''),
  FROM_EMAIL: Joi.string().email().default('noreply@Veloura.com'),
  FROM_NAME: Joi.string().default('Veloura Hotels'),

  // Twilio (optional — SMS/WhatsApp won't work without it)
  TWILIO_ACCOUNT_SID: Joi.string().optional().allow(''),
  TWILIO_AUTH_TOKEN: Joi.string().optional().allow(''),
  TWILIO_PHONE_NUMBER: Joi.string().optional().allow(''),
  TWILIO_WHATSAPP_NUMBER: Joi.string().optional().allow(''),

  // Cloudbeds (optional — PMS sync won't work without it)
  CLOUDBEDS_CLIENT_ID: Joi.string().optional().allow(''),
  CLOUDBEDS_CLIENT_SECRET: Joi.string().optional().allow(''),
  CLOUDBEDS_PROPERTY_ID: Joi.string().optional().allow(''),
  CLOUDBEDS_BASE_URL: Joi.string().default('https://hotels.cloudbeds.com/api/v1.2'),
  CLOUDBEDS_WEBHOOK_KEY: Joi.string().optional().allow(''),

  // SiteMinder (optional — channel management won't work without it)
  SITEMINDER_API_KEY: Joi.string().optional().allow(''),
  SITEMINDER_BASE_URL: Joi.string().default('https://connect.siteminder.com/v1'),
  SITEMINDER_WEBHOOK_KEY: Joi.string().optional().allow(''),

  // Google Maps (optional — maps features won't work without it)
  GOOGLE_MAPS_API_KEY: Joi.string().optional().allow(''),

  // Supabase (optional — used if configured)
  NEXT_PUBLIC_SUPABASE_URL: Joi.string().optional().allow(''),
  SUPABASE_PUBLISHABLE_KEY: Joi.string().optional().allow(''),
  SUPABASE_SECRET_KEY: Joi.string().optional().allow(''),
  SUPABASE_ANON_KEY: Joi.string().optional().allow(''),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().optional().allow(''),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),

  // File Upload
  UPLOAD_DIR: Joi.string().default('uploads'),
  MAX_FILE_SIZE: Joi.number().default(5242880), // 5MB

  // Logging
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
}).unknown(true); // Allow unknown env vars (system vars, etc.)

// Validate environment variables
const validateEnv = () => {
  const { error, value } = envSchema.validate(process.env, {
    abortEarly: false,
    stripUnknown: false
  });

  if (error) {
    const messages = error.details.map(detail => `  ❌ ${detail.message}`).join('\n');
    console.error('\n🚫 Environment validation failed:\n' + messages + '\n');
    
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('⚠️  Running in development mode with missing env vars. Some features may not work.\n');
    }
  }

  return value;
};

// Validated environment
const env = validateEnv();

// Configuration object
export const config = {
  server: {
    port: parseInt(env.PORT) || 3000,
    nodeEnv: env.NODE_ENV || 'development',
    corsOrigin: env.CORS_ORIGIN || 'http://localhost:3000',
    isDevelopment: (env.NODE_ENV || 'development') === 'development',
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test'
  },

  database: {
    url: env.DATABASE_URL
  },

  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN || '7d'
  },

  stripe: {
    publishableKey: env.STRIPE_PUBLISHABLE_KEY,
    secretKey: env.STRIPE_SECRET_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    isConfigured: !!(env.STRIPE_SECRET_KEY)
  },

  sendgrid: {
    apiKey: env.SENDGRID_API_KEY,
    fromEmail: env.FROM_EMAIL || 'noreply@Veloura.com',
    fromName: env.FROM_NAME || 'Veloura Hotels',
    isConfigured: !!(env.SENDGRID_API_KEY)
  },

  twilio: {
    accountSid: env.TWILIO_ACCOUNT_SID,
    authToken: env.TWILIO_AUTH_TOKEN,
    phoneNumber: env.TWILIO_PHONE_NUMBER,
    whatsappNumber: env.TWILIO_WHATSAPP_NUMBER,
    isConfigured: !!(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN)
  },

  cloudbeds: {
    clientId: env.CLOUDBEDS_CLIENT_ID,
    clientSecret: env.CLOUDBEDS_CLIENT_SECRET,
    propertyId: env.CLOUDBEDS_PROPERTY_ID,
    baseUrl: env.CLOUDBEDS_BASE_URL || 'https://hotels.cloudbeds.com/api/v1.2',
    webhookKey: env.CLOUDBEDS_WEBHOOK_KEY,
    isConfigured: !!(env.CLOUDBEDS_CLIENT_ID && env.CLOUDBEDS_CLIENT_SECRET)
  },

  siteminder: {
    apiKey: env.SITEMINDER_API_KEY,
    baseUrl: env.SITEMINDER_BASE_URL || 'https://connect.siteminder.com/v1',
    webhookKey: env.SITEMINDER_WEBHOOK_KEY,
    isConfigured: !!(env.SITEMINDER_API_KEY)
  },

  googleMaps: {
    apiKey: env.GOOGLE_MAPS_API_KEY,
    isConfigured: !!(env.GOOGLE_MAPS_API_KEY)
  },

  supabase: {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: env.SUPABASE_PUBLISHABLE_KEY,
    secretKey: env.SUPABASE_SECRET_KEY,
    anonKey: env.SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    isConfigured: !!(env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_ANON_KEY)
  },

  rateLimit: {
    windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS) || 900000,
    maxRequests: parseInt(env.RATE_LIMIT_MAX_REQUESTS) || 100
  },

  upload: {
    dir: env.UPLOAD_DIR || 'uploads',
    maxFileSize: parseInt(env.MAX_FILE_SIZE) || 5242880
  },

  logging: {
    level: env.LOG_LEVEL || 'info'
  }
};

// Print configuration status on startup
export const printConfigStatus = () => {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║     Veloura Hotel Backend — Configuration    ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log(`║  Environment:  ${config.server.nodeEnv.padEnd(30)}║`);
  console.log(`║  Port:         ${String(config.server.port).padEnd(30)}║`);
  console.log('╠══════════════════════════════════════════════╣');
  console.log(`║  Database:     ${config.database.url ? '✅ Configured' : '❌ Missing'}`.padEnd(49) + '║');
  console.log(`║  Stripe:       ${config.stripe.isConfigured ? '✅ Configured' : '⚠️  Not configured'}`.padEnd(49) + '║');
  console.log(`║  SendGrid:     ${config.sendgrid.isConfigured ? '✅ Configured' : '⚠️  Not configured'}`.padEnd(49) + '║');
  console.log(`║  Twilio:       ${config.twilio.isConfigured ? '✅ Configured' : '⚠️  Not configured'}`.padEnd(49) + '║');
  console.log(`║  Cloudbeds:    ${config.cloudbeds.isConfigured ? '✅ Configured' : '⚠️  Not configured'}`.padEnd(49) + '║');
  console.log(`║  SiteMinder:   ${config.siteminder.isConfigured ? '✅ Configured' : '⚠️  Not configured'}`.padEnd(49) + '║');
  console.log(`║  Google Maps:  ${config.googleMaps.isConfigured ? '✅ Configured' : '⚠️  Not configured'}`.padEnd(49) + '║');
  console.log(`║  Supabase:     ${config.supabase.isConfigured ? '✅ Configured' : '⚠️  Not configured'}`.padEnd(49) + '║');
  console.log('╚══════════════════════════════════════════════╝\n');
};

export default config;
