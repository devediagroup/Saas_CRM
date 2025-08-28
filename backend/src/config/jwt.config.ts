export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret-here',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};
