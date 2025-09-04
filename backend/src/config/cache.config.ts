import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const cacheConfig: CacheModuleAsyncOptions = {
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
        // Use memory store for development (no Redis dependency)
        return {
            ttl: configService.get('REDIS_TTL', 3600),
            max: configService.get('REDIS_MAX_ITEMS', 1000),
            isGlobal: true,
        };
    },
};

/**
 * Redis connection configuration for direct Redis client usage
 */
export const redisConnectionConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    retryDelayOnFailover: 100,
    enableReadyCheck: true,
    maxRetriesPerRequest: 3,
};

/**
 * Cache key generators for consistent cache naming
 */
export const CacheKeys = {
    // Leads cache keys
    LEADS_ALL: (companyId: string) => `leads:all:${companyId}`,
    LEADS_BY_STATUS: (companyId: string, status: string) => `leads:status:${companyId}:${status}`,
    LEADS_BY_PRIORITY: (companyId: string, priority: string) => `leads:priority:${companyId}:${priority}`,
    LEADS_BY_ASSIGNEE: (companyId: string, userId: string) => `leads:assignee:${companyId}:${userId}`,
    LEADS_STATS: (companyId: string) => `leads:stats:${companyId}`,
    LEADS_SEARCH: (companyId: string, searchTerm: string) => `leads:search:${companyId}:${searchTerm}`,

    // Properties cache keys
    PROPERTIES_ALL: (companyId: string) => `properties:all:${companyId}`,
    PROPERTIES_BY_STATUS: (companyId: string, status: string) => `properties:status:${companyId}:${status}`,
    PROPERTIES_BY_TYPE: (companyId: string, type: string) => `properties:type:${companyId}:${type}`,
    PROPERTIES_FEATURED: (companyId: string) => `properties:featured:${companyId}`,
    PROPERTIES_STATS: (companyId: string) => `properties:stats:${companyId}`,
    PROPERTIES_SEARCH: (companyId: string, searchTerm: string) => `properties:search:${companyId}:${searchTerm}`,

    // Analytics cache keys
    ANALYTICS_DASHBOARD: (companyId: string) => `analytics:dashboard:${companyId}`,
    ANALYTICS_LEADS: (companyId: string) => `analytics:leads:${companyId}`,
    ANALYTICS_PROPERTIES: (companyId: string) => `analytics:properties:${companyId}`,

    // User permissions cache keys
    USER_PERMISSIONS: (userId: string) => `user:permissions:${userId}`,
    USER_ROLE: (userId: string) => `user:role:${userId}`,
};

/**
 * Default cache TTL values (in seconds)
 */
export const CacheTTL = {
    SHORT: 300, // 5 minutes
    MEDIUM: 1800, // 30 minutes
    LONG: 3600, // 1 hour
    VERY_LONG: 86400, // 24 hours
    PERMISSIONS: 1800, // 30 minutes for user permissions
    ANALYTICS: 900, // 15 minutes for analytics
    SEARCH: 300, // 5 minutes for search results
};