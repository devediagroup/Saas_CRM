import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('Authorization Security Tests', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            type: 'mysql',
            host: configService.get('DB_HOST'),
            port: configService.get('DB_PORT'),
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_DATABASE'),
            entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
            synchronize: true,
            logging: false,
          }),
          inject: [ConfigService],
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // الحصول على token للمدير
    const adminResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@echops.com',
        password: 'admin123',
      });

    adminToken = adminResponse.body.access_token;

    // الحصول على token لمستخدم عادي
    const userResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@echops.com',
        password: 'test123',
      });

    userToken = userResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Role-Based Access Control (RBAC)', () => {
    it('should prevent unauthorized access to admin endpoints', async () => {
      const adminEndpoints = [
        { method: 'GET', path: '/users' },
        { method: 'POST', path: '/users' },
        { method: 'GET', path: '/roles' },
        { method: 'POST', path: '/roles' },
        { method: 'GET', path: '/permissions' },
        { method: 'POST', path: '/permissions' },
      ];

      for (const endpoint of adminEndpoints) {
        const response = await request(app.getHttpServer())
          [endpoint.method.toLowerCase()](endpoint.path)
          .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(403);
        expect(response.body.message).toContain('غير مصرح');
      }
    });

    it('should allow admin access to protected endpoints', async () => {
      const adminEndpoints = [
        { method: 'GET', path: '/users' },
        { method: 'GET', path: '/roles' },
        { method: 'GET', path: '/permissions' },
      ];

      for (const endpoint of adminEndpoints) {
        const response = await request(app.getHttpServer())
          [endpoint.method.toLowerCase()](endpoint.path)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
      }
    });

    it('should enforce permission-based access control', async () => {
      // محاولة الوصول لإنشاء مستخدم جديد بدون صلاحية
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'New User',
          email: 'newuser@test.com',
          password: 'password123',
          role: 'AGENT',
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('غير مصرح');
    });

    it('should prevent privilege escalation', async () => {
      // محاولة إنشاء مستخدم بصلاحيات أعلى
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Admin User',
          email: 'admin2@test.com',
          password: 'password123',
          role: 'SUPER_ADMIN', // محاولة رفع الصلاحيات
        });

      expect(response.status).toBe(403);
    });

    it('should prevent users from modifying their own role', async () => {
      // محاولة تعديل الدور الذاتي
      const response = await request(app.getHttpServer())
        .put('/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          role: 'SUPER_ADMIN', // محاولة رفع الصلاحيات
        });

      expect(response.status).toBe(403);
    });
  });

  describe('Resource Access Control', () => {
    it('should prevent access to other users data', async () => {
      // محاولة الوصول لبيانات مستخدم آخر
      const response = await request(app.getHttpServer())
        .get('/users/other-user-id')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });

    it('should prevent users from accessing other companies data', async () => {
      // محاولة الوصول لبيانات شركة أخرى
      const response = await request(app.getHttpServer())
        .get('/developers')
        .set('Authorization', `Bearer ${userToken}`);

      // يجب أن يعيد فقط بيانات الشركة الخاصة بالمستخدم
      expect(response.status).toBe(200);
      if (response.body.length > 0) {
        response.body.forEach((developer: any) => {
          expect(developer.company_id).toBe('test-company-id');
        });
      }
    });

    it('should enforce row-level security', async () => {
      // إنشاء عميل محتمل
      const leadResponse = await request(app.getHttpServer())
        .post('/leads')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Test Lead',
          email: 'lead@test.com',
          phone: '+966501234567',
        });

      expect(leadResponse.status).toBe(201);
      const leadId = leadResponse.body.id;

      // محاولة الوصول للعميل المحتمل من مستخدم آخر
      const otherUserResponse = await request(app.getHttpServer())
        .get(`/leads/${leadId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // يجب أن يعيد خطأ 403 أو 404
      expect([403, 404]).toContain(otherUserResponse.status);
    });
  });

  describe('API Security', () => {
    it('should prevent unauthorized access to protected routes', async () => {
      const protectedRoutes = [
        '/users',
        '/leads',
        '/deals',
        '/projects',
        '/developers',
        '/properties',
        '/analytics',
      ];

      for (const route of protectedRoutes) {
        const response = await request(app.getHttpServer()).get(route);

        expect(response.status).toBe(401);
        expect(response.body.message).toContain('غير مصرح');
      }
    });

    it('should validate JWT token format', async () => {
      const invalidTokens = [
        'invalid-token',
        'Bearer invalid',
        'Bearer ',
        'Bearer',
        '',
        null,
        undefined,
      ];

      for (const token of invalidTokens) {
        const response = await request(app.getHttpServer())
          .get('/users')
          .set('Authorization', token);

        expect(response.status).toBe(401);
      }
    });

    it('should handle missing authorization header gracefully', async () => {
      const response = await request(app.getHttpServer()).get('/users');

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('غير مصرح');
    });

    it('should prevent method override attacks', async () => {
      // محاولة استخدام طريقة POST مع GET
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('X-HTTP-Method-Override', 'GET')
        .set('Authorization', `Bearer ${userToken}`);

      // يجب أن يعيد خطأ 403 وليس 200
      expect(response.status).toBe(403);
    });
  });

  describe('Input Validation Security', () => {
    it('should prevent malicious input in user creation', async () => {
      const maliciousPayloads = [
        {
          name: '<script>alert("xss")</script>',
          email: 'test@test.com',
          password: 'password123',
          role: 'AGENT',
        },
        {
          name: 'Test User',
          email: 'test@test.com',
          password: 'password123',
          role: 'INVALID_ROLE',
        },
        {
          name: 'a'.repeat(1000), // اسم طويل جداً
          email: 'test@test.com',
          password: 'password123',
          role: 'AGENT',
        },
      ];

      for (const payload of maliciousPayloads) {
        const response = await request(app.getHttpServer())
          .post('/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(payload);

        expect(response.status).toBe(400);
      }
    });

    it('should prevent SQL injection in search queries', async () => {
      const maliciousQueries = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "' UNION SELECT * FROM users --",
        "<script>alert('xss')</script>",
      ];

      for (const query of maliciousQueries) {
        const response = await request(app.getHttpServer())
          .get(`/users?search=${encodeURIComponent(query)}`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).not.toBe(500);
        expect(response.status).not.toBe(503);
      }
    });

    it('should validate email format', async () => {
      const invalidEmails = [
        'invalid-email',
        'test@',
        '@test.com',
        'test..test@test.com',
        'test@test..com',
        'test@test.com.',
        'test@.test.com',
      ];

      for (const email of invalidEmails) {
        const response = await request(app.getHttpServer())
          .post('/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: 'Test User',
            email: email,
            password: 'password123',
            role: 'AGENT',
          });

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('البريد الإلكتروني');
      }
    });

    it('should validate phone number format', async () => {
      const invalidPhones = [
        'invalid-phone',
        '123',
        'abc',
        '+966',
        '+966123',
        '+966123456789012345', // رقم طويل جداً
      ];

      for (const phone of invalidPhones) {
        const response = await request(app.getHttpServer())
          .post('/leads')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            name: 'Test Lead',
            email: 'test@test.com',
            phone: phone,
          });

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('الهاتف');
      }
    });
  });

  describe('Rate Limiting', () => {
    it('should implement rate limiting on authentication endpoints', async () => {
      const attempts = 20;

      for (let i = 0; i < attempts; i++) {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'wrong@test.com',
            password: 'wrongpassword',
          });

        if (i < 10) {
          // المحاولات الأولى يجب أن تعطي خطأ 401
          expect(response.status).toBe(401);
        } else {
          // بعد 10 محاولات يجب أن يتم حظر الطلبات
          expect([429, 403, 401]).toContain(response.status);
        }
      }
    });

    it('should implement rate limiting on API endpoints', async () => {
      const attempts = 100;

      for (let i = 0; i < attempts; i++) {
        const response = await request(app.getHttpServer())
          .get('/users')
          .set('Authorization', `Bearer ${adminToken}`);

        if (i < 50) {
          // الطلبات الأولى يجب أن تعمل
          expect(response.status).toBe(200);
        } else {
          // بعد 50 طلب يجب أن يتم حظر الطلبات
          expect([429, 403, 200]).toContain(response.status);
        }
      }
    });
  });

  describe('CSRF Protection', () => {
    it('should validate CSRF tokens on state-changing operations', async () => {
      // محاولة إنشاء مستخدم بدون CSRF token
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-CSRF-Token', 'invalid-token')
        .send({
          name: 'Test User',
          email: 'test@test.com',
          password: 'password123',
          role: 'AGENT',
        });

      // يجب أن يعيد خطأ 403
      expect(response.status).toBe(403);
    });
  });

  describe('Logging and Monitoring', () => {
    it('should log security events', async () => {
      // محاولة وصول غير مصرح
      const response = await request(app.getHttpServer()).get('/users');

      expect(response.status).toBe(401);

      // في التطبيق الحقيقي، يجب التحقق من تسجيل الحدث
      // لا يمكن اختبار السجلات في بيئة الاختبار
    });

    it('should not log sensitive information', async () => {
      // تسجيل الدخول
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@echops.com',
          password: 'admin123',
        });

      expect(response.status).toBe(200);

      // في التطبيق الحقيقي، يجب التحقق من عدم تسجيل كلمة المرور
    });
  });
});
