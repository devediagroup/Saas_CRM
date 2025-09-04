import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckService } from './health-check.service';
import { Connection } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

describe('HealthCheckService', () => {
    let service: HealthCheckService;
    let mockConnection: jest.Mocked<Connection>;
    let mockCacheManager: jest.Mocked<Cache>;

    beforeEach(async () => {
        // Mock TypeORM Connection
        mockConnection = {
            query: jest.fn(),
            options: {
                database: 'test_db',
            },
        } as any;

        // Mock Cache Manager
        mockCacheManager = {
            set: jest.fn(),
            get: jest.fn(),
            del: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HealthCheckService,
                {
                    provide: Connection,
                    useValue: mockConnection,
                },
                {
                    provide: CACHE_MANAGER,
                    useValue: mockCacheManager,
                },
            ],
        }).compile();

        service = module.get<HealthCheckService>(HealthCheckService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getHealthStatus', () => {
        it('should return healthy status when all components are working', async () => {
            // Mock successful database query
            mockConnection.query.mockResolvedValue([{ '1': 1 }]);

            // Mock successful cache operations
            mockCacheManager.set.mockResolvedValue(undefined);
            mockCacheManager.get.mockResolvedValue('test-value');
            mockCacheManager.del.mockResolvedValue(true);

            const result = await service.getHealthStatus();

            expect(result.status).toBe('ok');
            expect(result.database?.status).toBe('connected');
            expect(result.cache?.status).toBe('connected');
            expect(result.memory).toBeDefined();
            expect(result.memory?.percentage).toBeGreaterThan(0);
            expect(result.timestamp).toBeDefined();
            expect(result.uptime).toBeGreaterThan(0);
            expect(result.environment).toBe('test');
        });

        it('should return error status when database fails', async () => {
            // Mock database failure
            mockConnection.query.mockRejectedValue(new Error('Database connection failed'));

            // Mock successful cache operations
            mockCacheManager.set.mockResolvedValue(undefined);
            mockCacheManager.get.mockResolvedValue('test-value');
            mockCacheManager.del.mockResolvedValue(true);

            const result = await service.getHealthStatus();

            expect(result.status).toBe('error');
            expect(result.database?.status).toBe('error');
            expect(result.database?.error).toBe('Database connection failed');
            expect(result.errors).toContain('Database: Database connection failed');
        });

        it('should return error status when cache fails', async () => {
            // Mock successful database query
            mockConnection.query.mockResolvedValue([{ '1': 1 }]);

            // Mock cache failure
            mockCacheManager.set.mockRejectedValue(new Error('Cache connection failed'));

            const result = await service.getHealthStatus();

            expect(result.status).toBe('error');
            expect(result.cache?.status).toBe('error');
            expect(result.cache?.error).toBe('Cache connection failed');
            expect(result.errors).toContain('Cache: Cache connection failed');
        });

        it('should handle cache value mismatch', async () => {
            // Mock successful database query
            mockConnection.query.mockResolvedValue([{ '1': 1 }]);

            // Mock cache value mismatch
            mockCacheManager.set.mockResolvedValue(undefined);
            mockCacheManager.get.mockResolvedValue('wrong-value');
            mockCacheManager.del.mockResolvedValue(true);

            const result = await service.getHealthStatus();

            expect(result.status).toBe('error');
            expect(result.cache?.status).toBe('error');
            expect(result.cache?.error).toBe('Cache value mismatch');
        });

        it('should include latency measurements', async () => {
            // Mock successful operations with delay
            mockConnection.query.mockImplementation(() =>
                new Promise(resolve => setTimeout(() => resolve([{ '1': 1 }]), 10))
            );

            mockCacheManager.set.mockImplementation(() =>
                new Promise(resolve => setTimeout(() => resolve(undefined), 5))
            );
            mockCacheManager.get.mockResolvedValue('test-value');
            mockCacheManager.del.mockResolvedValue(true);

            const result = await service.getHealthStatus();

            expect(result.database?.latency).toBeGreaterThan(0);
            expect(result.cache?.latency).toBeGreaterThan(0);
        });
    });

    describe('getDetailedHealthStatus', () => {
        it('should return detailed health status with additional checks', async () => {
            // Mock basic health checks
            mockConnection.query.mockResolvedValue([{ '1': 1 }]);
            mockCacheManager.set.mockResolvedValue(undefined);
            mockCacheManager.get.mockResolvedValue('test-value');
            mockCacheManager.del.mockResolvedValue(true);

            // Mock detailed database queries
            mockConnection.query
                .mockResolvedValueOnce([{ '1': 1 }]) // Basic health check
                .mockResolvedValueOnce([{ count: 5 }]); // Detailed query

            const result = await service.getDetailedHealthStatus();

            expect(result.detailed).toBeDefined();
            expect(result.detailed.databaseQueries).toBeDefined();
            expect(result.detailed.cacheOperations).toBeDefined();
            expect(result.detailed.fileSystem).toBeDefined();
            expect(result.detailed.externalServices).toBeDefined();
        });
    });

    describe('getReadinessStatus', () => {
        it('should return ready when health status is ok', async () => {
            // Mock successful health checks
            mockConnection.query.mockResolvedValue([{ '1': 1 }]);
            mockCacheManager.set.mockResolvedValue(undefined);
            mockCacheManager.get.mockResolvedValue('test-value');
            mockCacheManager.del.mockResolvedValue(true);

            const result = await service.getReadinessStatus();

            expect(result.ready).toBe(true);
            expect(result.status).toBe('ready');
        });

        it('should return not ready when health status is error', async () => {
            // Mock database failure
            mockConnection.query.mockRejectedValue(new Error('Database failed'));

            const result = await service.getReadinessStatus();

            expect(result.ready).toBe(false);
            expect(result.status).toBe('not ready');
        });
    });

    describe('getLivenessStatus', () => {
        it('should return alive when memory usage is normal', async () => {
            // Mock normal memory usage (less than 90%)
            const originalMemoryUsage = process.memoryUsage;
            (process.memoryUsage as any) = jest.fn().mockReturnValue({
                rss: 1000000,
                heapTotal: 1000000,
                heapUsed: 500000, // 50% usage
                external: 100000,
                arrayBuffers: 50000,
            });

            const result = await service.getLivenessStatus();

            expect(result.alive).toBe(true);
            expect(result.status).toBe('alive');

            // Restore original function
            process.memoryUsage = originalMemoryUsage;
        });

        it('should return dead when memory usage is too high', async () => {
            // Mock high memory usage (over 90%)
            const originalMemoryUsage = process.memoryUsage;
            (process.memoryUsage as any) = jest.fn().mockReturnValue({
                rss: 1000000,
                heapTotal: 1000000,
                heapUsed: 950000, // 95% usage
                external: 100000,
                arrayBuffers: 50000,
            });

            const result = await service.getLivenessStatus();

            expect(result.alive).toBe(false);
            expect(result.status).toBe('dead');

            // Restore original function
            process.memoryUsage = originalMemoryUsage;
        });
    });

    describe('Memory Management', () => {
        it('should calculate memory usage correctly', async () => {
            // Mock memory usage
            const originalMemoryUsage = process.memoryUsage;
            (process.memoryUsage as any) = jest.fn().mockReturnValue({
                rss: 1000000,
                heapTotal: 1000000,
                heapUsed: 750000, // 75% usage
                external: 100000,
                arrayBuffers: 50000,
            });

            mockConnection.query.mockResolvedValue([{ '1': 1 }]);
            mockCacheManager.set.mockResolvedValue(undefined);
            mockCacheManager.get.mockResolvedValue('test-value');
            mockCacheManager.del.mockResolvedValue(true);

            const result = await service.getHealthStatus();

            expect(result.memory?.used).toBe(750000);
            expect(result.memory?.total).toBe(1000000);
            expect(result.memory?.percentage).toBe(75);

            // Restore original function
            process.memoryUsage = originalMemoryUsage;
        });
    });

    describe('Error Handling', () => {
        it('should handle global errors gracefully', async () => {
            // Mock both database and cache failures
            mockConnection.query.mockRejectedValue(new Error('Database error'));
            mockCacheManager.set.mockRejectedValue(new Error('Cache error'));

            const result = await service.getHealthStatus();

            expect(result.status).toBe('error');
            expect(result.errors).toHaveLength(2);
            expect(result.errors).toContain('Database: Database error');
            expect(result.errors).toContain('Cache: Cache error');
        });

        it('should handle unexpected errors in health check', async () => {
            // Mock connection to throw during property access
            mockConnection.query.mockImplementation(() => {
                throw new Error('Unexpected error during query');
            });

            const result = await service.getHealthStatus();

            expect(result.status).toBe('error');
            expect(result.errors).toBeDefined();
        });
    });

    describe('Cache Operations Testing', () => {
        it('should perform multiple cache operations in detailed check', async () => {
            // Mock basic health checks
            mockConnection.query.mockResolvedValue([{ '1': 1 }]);
            mockCacheManager.set.mockResolvedValue(undefined);
            mockCacheManager.get.mockResolvedValue('test-value');
            mockCacheManager.del.mockResolvedValue(true);

            await service.getDetailedHealthStatus();

            // Check that cache operations were performed
            expect(mockCacheManager.set).toHaveBeenCalled();
            expect(mockCacheManager.del).toHaveBeenCalled();
        });
    });
});
