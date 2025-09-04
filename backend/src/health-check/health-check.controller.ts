import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthCheckService, HealthStatus } from './health-check.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthCheckController {
    constructor(private readonly healthCheckService: HealthCheckService) { }

    @Get()
    @Public()
    @ApiOperation({ summary: 'Health check endpoint' })
    @ApiResponse({
        status: 200,
        description: 'Health check successful',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'ok' },
                timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                uptime: { type: 'number', example: 123.456 },
                environment: { type: 'string', example: 'development' },
                version: { type: 'string', example: '1.0.0' },
                database: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'connected' },
                        latency: { type: 'number', example: 5.23 }
                    }
                },
                cache: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'connected' },
                        latency: { type: 'number', example: 2.15 }
                    }
                },
                memory: {
                    type: 'object',
                    properties: {
                        used: { type: 'number', example: 123456789 },
                        total: { type: 'number', example: 987654321 },
                        percentage: { type: 'number', example: 12.5 }
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 503,
        description: 'Health check failed',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'error' },
                timestamp: { type: 'string' },
                errors: {
                    type: 'array',
                    items: { type: 'string' }
                }
            }
        }
    })
    async check() {
        return this.healthCheckService.getHealthStatus();
    }

    @Get('detailed')
    @Public()
    @ApiOperation({ summary: 'Detailed health check with component status' })
    @ApiResponse({
        status: 200,
        description: 'Detailed health check successful'
    })
    async detailedCheck() {
        return this.healthCheckService.getDetailedHealthStatus();
    }

    @Get('ready')
    @Public()
    @ApiOperation({ summary: 'Readiness probe for orchestrators' })
    @ApiResponse({
        status: 200,
        description: 'Application is ready to serve traffic'
    })
    async readiness() {
        return this.healthCheckService.getReadinessStatus();
    }

    @Get('live')
    @Public()
    @ApiOperation({ summary: 'Liveness probe for orchestrators' })
    @ApiResponse({
        status: 200,
        description: 'Application is alive'
    })
    async liveness() {
        return this.healthCheckService.getLivenessStatus();
    }
}
