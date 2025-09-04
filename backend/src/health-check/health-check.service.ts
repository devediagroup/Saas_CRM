import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

export interface HealthStatus {
    status: 'ok' | 'error' | 'degraded';
    timestamp: string;
    uptime: number;
    environment: string;
    version: string;
    database?: ComponentStatus;
    cache?: ComponentStatus;
    memory?: MemoryStatus;
    errors?: string[];
}

export interface ComponentStatus {
    status: 'connected' | 'disconnected' | 'error';
    latency?: number;
    error?: string;
}

export interface MemoryStatus {
    used: number;
    total: number;
    percentage: number;
}

@Injectable()
export class HealthCheckService {
    private readonly logger = new Logger(HealthCheckService.name);
    private readonly startTime = Date.now();

    constructor(
        @InjectConnection() private connection: Connection,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) { }

    async getHealthStatus(): Promise<HealthStatus> {
        const timestamp = new Date().toISOString();
        const uptime = (Date.now() - this.startTime) / 1000;
        const environment = process.env.NODE_ENV || 'development';
        const version = process.env.npm_package_version || '1.0.0';

        try {
            const [database, cache, memory] = await Promise.all([
                this.checkDatabase(),
                this.checkCache(),
                this.checkMemory(),
            ]);

            const hasErrors =
                database.status === 'error' ||
                cache.status === 'error';

            const status = hasErrors ? 'error' : 'ok';

            const healthStatus: HealthStatus = {
                status,
                timestamp,
                uptime,
                environment,
                version,
                database,
                cache,
                memory,
            };

            if (hasErrors) {
                healthStatus.errors = [];
                if (database.error) healthStatus.errors.push(`Database: ${database.error}`);
                if (cache.error) healthStatus.errors.push(`Cache: ${cache.error}`);
            }

            this.logger.log(`Health check completed: ${status}`);
            return healthStatus;

        } catch (error) {
            this.logger.error('Health check failed:', error);
            return {
                status: 'error',
                timestamp,
                uptime,
                environment,
                version,
                errors: [`Health check failed: ${error.message}`],
            };
        }
    }

    async getDetailedHealthStatus(): Promise<any> {
        const basicHealth = await this.getHealthStatus();

        // Add more detailed checks
        const additionalChecks = await Promise.allSettled([
            this.checkDatabaseQueries(),
            this.checkCacheOperations(),
            this.checkFileSystem(),
            this.checkExternalServices(),
        ]);

        return {
            ...basicHealth,
            detailed: {
                databaseQueries: this.getSettledResult(additionalChecks[0]),
                cacheOperations: this.getSettledResult(additionalChecks[1]),
                fileSystem: this.getSettledResult(additionalChecks[2]),
                externalServices: this.getSettledResult(additionalChecks[3]),
            },
        };
    }

    async getReadinessStatus(): Promise<{ status: string; ready: boolean }> {
        const health = await this.getHealthStatus();
        const ready = health.status === 'ok' || health.status === 'degraded';

        return {
            status: ready ? 'ready' : 'not ready',
            ready,
        };
    }

    async getLivenessStatus(): Promise<{ status: string; alive: boolean }> {
        // Simple liveness check - just return if the service is running
        const memory = this.checkMemory();
        const alive = memory.percentage < 90; // Consider dead if memory usage > 90%

        return {
            status: alive ? 'alive' : 'dead',
            alive,
        };
    }

    private async checkDatabase(): Promise<ComponentStatus> {
        try {
            const startTime = Date.now();
            await this.connection.query('SELECT 1');
            const latency = Date.now() - startTime;

            return {
                status: 'connected',
                latency,
            };
        } catch (error) {
            this.logger.error('Database health check failed:', error);
            return {
                status: 'error',
                error: error.message,
            };
        }
    }

    private async checkCache(): Promise<ComponentStatus> {
        try {
            const startTime = Date.now();
            const testKey = 'health-check-test';
            const testValue = 'test-value';

            await this.cacheManager.set(testKey, testValue, 5); // 5 seconds TTL
            const retrievedValue = await this.cacheManager.get(testKey);
            await this.cacheManager.del(testKey);

            const latency = Date.now() - startTime;

            if (retrievedValue === testValue) {
                return {
                    status: 'connected',
                    latency,
                };
            } else {
                return {
                    status: 'error',
                    error: 'Cache value mismatch',
                };
            }
        } catch (error) {
            this.logger.error('Cache health check failed:', error);
            return {
                status: 'error',
                error: error.message,
            };
        }
    }

    private checkMemory(): MemoryStatus {
        const used = process.memoryUsage().heapUsed;
        const total = process.memoryUsage().heapTotal;
        const percentage = (used / total) * 100;

        return {
            used,
            total,
            percentage: Math.round(percentage * 100) / 100,
        };
    }

    private async checkDatabaseQueries(): Promise<ComponentStatus> {
        try {
            const startTime = Date.now();

            // Test a more complex query
            const result = await this.connection.query(
                'SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ?',
                [this.connection.options.database]
            );

            const latency = Date.now() - startTime;

            return {
                status: 'connected',
                latency,
            };
        } catch (error) {
            return {
                status: 'error',
                error: error.message,
            };
        }
    }

    private async checkCacheOperations(): Promise<ComponentStatus> {
        try {
            const startTime = Date.now();

            // Test multiple cache operations
            const operations = Array.from({ length: 10 }, (_, i) =>
                this.cacheManager.set(`test-${i}`, `value-${i}`, 5)
            );

            await Promise.all(operations);

            // Clean up
            const cleanupOperations = Array.from({ length: 10 }, (_, i) =>
                this.cacheManager.del(`test-${i}`)
            );

            await Promise.all(cleanupOperations);

            const latency = Date.now() - startTime;

            return {
                status: 'connected',
                latency,
            };
        } catch (error) {
            return {
                status: 'error',
                error: error.message,
            };
        }
    }

    private async checkFileSystem(): Promise<ComponentStatus> {
        try {
            const fs = require('fs').promises;
            const path = require('path');

            const testFile = path.join(process.cwd(), 'health-check-test.tmp');
            const testContent = 'health check test';

            const startTime = Date.now();

            await fs.writeFile(testFile, testContent);
            const content = await fs.readFile(testFile, 'utf8');
            await fs.unlink(testFile);

            const latency = Date.now() - startTime;

            if (content === testContent) {
                return {
                    status: 'connected',
                    latency,
                };
            } else {
                return {
                    status: 'error',
                    error: 'File system content mismatch',
                };
            }
        } catch (error) {
            return {
                status: 'error',
                error: error.message,
            };
        }
    }

    private async checkExternalServices(): Promise<ComponentStatus> {
        // Placeholder for external service checks
        // Add checks for email service, WhatsApp API, etc.
        try {
            return {
                status: 'connected',
                latency: 0,
            };
        } catch (error) {
            return {
                status: 'error',
                error: error.message,
            };
        }
    }

    private getSettledResult(result: PromiseSettledResult<any>) {
        if (result.status === 'fulfilled') {
            return result.value;
        } else {
            return {
                status: 'error',
                error: result.reason?.message || 'Unknown error',
            };
        }
    }
}
