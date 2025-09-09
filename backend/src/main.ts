import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import * as express from 'express';
import { AppModule } from './app.module';
import { appConfig } from './config/app.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Validate critical environment variables
  if (!process.env.JWT_SECRET) {
    logger.error('❌ JWT_SECRET is not defined in environment variables');
    logger.error('Please check your .env file and ensure JWT_SECRET is set');
    process.exit(1);
  } else {
    logger.log(`✅ JWT_SECRET loaded (length: ${process.env.JWT_SECRET.length})`);
  }

  // Create NestJS application
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn']
        : ['log', 'error', 'warn', 'debug'],
  });

  // Security middleware
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    }),
  );

  // Compression middleware
  app.use(compression());

  // CORS configuration
  app.enableCors({
    origin: [
      'http://localhost:5173', // Vite dev server
      'http://localhost:8080', // Alternative dev server
      'http://localhost:3000', // Backend port
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('EchoOps CRM API')
    .setDescription('Complete API documentation for EchoOps Real Estate CRM')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Companies', 'Company management for multi-tenant system')
    .addTag('Users', 'User management within companies')
    .addTag('Leads', 'Lead management and tracking')
    .addTag('Properties', 'Real estate property management')
    .addTag('Deals', 'Deal pipeline and sales management')
    .addTag('Activities', 'Activity tracking and scheduling')
    .addTag('WhatsApp', 'WhatsApp Business API integration')
    .addTag('Notifications', 'Real-time notifications system')
    .addTag('Analytics', 'Dashboard analytics and reports')
    .addTag('Subscriptions', 'Subscription and billing management')
    .addTag('Security', 'Security monitoring and audit logs')
    .addTag('AI', 'Artificial intelligence features')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  // Static file serving for uploads
  app.use('/uploads', express.static(appConfig.upload.dest));

  // Health check endpoint
  app.use('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  });

  // Start server
  await app.listen(appConfig.port);

  // Log startup information
  const serverUrl = await app.getUrl();
  logger.log(`🚀 Server is running on: ${serverUrl}`);
  logger.log(`📚 API Documentation available at: ${serverUrl}/api/docs`);
  logger.log(`🏥 Health check available at: ${serverUrl}/health`);

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.log('Received SIGTERM, shutting down gracefully...');
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.log('Received SIGINT, shutting down gracefully...');
    await app.close();
    process.exit(0);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
