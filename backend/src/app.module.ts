import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD } from '@nestjs/core';

// Configuration
import { validateEnvironment } from './config/validation';
import { databaseConfig } from './config/database.config';
import { jwtConfig } from './config/jwt.config';
import { appConfig } from './config/app.config';
import { cacheConfig } from './config/cache.config';

// Controllers
import { AppController } from './app.controller';

// Services
import { AppService } from './app.service';

// Modules
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { UsersModule } from './users/users.module';
import { LeadsModule } from './leads/leads.module';
import { PropertiesModule } from './properties/properties.module';
import { DealsModule } from './deals/deals.module';
import { ActivitiesModule } from './activities/activities.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { SecurityModule } from './security/security.module';
import { AiModule } from './ai/ai.module';
import { DevelopersModule } from './developers/developers.module';
import { ProjectsModule } from './projects/projects.module';
import { HealthCheckModule } from './health-check/health-check.module';

// Guards
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { ThrottlerGuard } from '@nestjs/throttler';

// Middleware
import { PermissionMiddleware } from './auth/middleware/permission.middleware';

@Module({
  imports: [
    // Global Configuration with validation
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate: validateEnvironment,
    }),

    // Database Configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => databaseConfig,
      inject: [ConfigService],
    }),

    // JWT Configuration
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: () => jwtConfig,
      inject: [ConfigService],
      global: true,
    }),

    // Passport Configuration
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100,
      },
    ]),

    // Redis Cache Configuration
    CacheModule.registerAsync(cacheConfig),

    // Feature Modules
    AuthModule,
    CompaniesModule,
    UsersModule,
    LeadsModule,
    PropertiesModule,
    DealsModule,
    ActivitiesModule,
    WhatsAppModule,
    NotificationsModule,
    AnalyticsModule,
    SubscriptionsModule,
    SecurityModule,
    AiModule,
    DevelopersModule,
    ProjectsModule,
    HealthCheckModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PermissionMiddleware)
      .forRoutes('api/*'); // Apply to all API routes
  }
}
