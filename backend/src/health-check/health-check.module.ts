import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthCheckController } from './health-check.controller';
import { HealthCheckService } from './health-check.service';

@Module({
    imports: [
        CacheModule.register(),
        TypeOrmModule.forFeature([]), // Empty array since we're using connection injection
    ],
    controllers: [HealthCheckController],
    providers: [HealthCheckService],
    exports: [HealthCheckService],
})
export class HealthCheckModule { }
