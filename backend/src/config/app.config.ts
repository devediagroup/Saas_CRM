export const appConfig = {
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60'),
    limit: parseInt(process.env.RATE_LIMIT_LIMIT || '100'),
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    dest: process.env.UPLOAD_DEST || './uploads',
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY || 'your-encryption-key-here',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};
