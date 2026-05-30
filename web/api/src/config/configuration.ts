/**
 * Application configuration factory.
 * Reads environment variables and provides typed configuration objects
 * for all application subsystems.
 */
export default () => ({
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/smshive',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-in-production',
    expiration: process.env.JWT_EXPIRATION || '15m',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET || 'change-me-refresh-in-production',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  },
  clerk: {
    secretKey: process.env.CLERK_SECRET_KEY || '',
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY || '',
  },
  server: {
    port: parseInt(process.env.API_PORT || '8000', 10),
    corsOrigins: process.env.CORS_ORIGINS || 'http://localhost:3000',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
  },
});
