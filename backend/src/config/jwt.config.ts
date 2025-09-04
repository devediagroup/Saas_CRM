export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'fallback-secret-for-dev',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-for-dev',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};

// Validate that required JWT secrets are set (only in production)
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET)) {
  throw new Error(
    'JWT_SECRET and JWT_REFRESH_SECRET must be set in environment variables'
  );
}
