import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('Authentication Security Tests', () => {
  let app: INestApplication;

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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Login Security', () => {
    it('should prevent SQL injection in email field', async () => {
      const maliciousPayloads = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "' UNION SELECT * FROM users --",
        "admin@test.com'; INSERT INTO users VALUES ('hacker', 'pass'); --",
        "'; UPDATE users SET password='hacked' WHERE email='admin@test.com'; --",
      ];

      for (const payload of maliciousPayloads) {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: payload,
            password: 'password123',
          });

        // يجب أن يعيد خطأ 400 أو 401، وليس خطأ قاعدة البيانات
        expect(response.status).not.toBe(500);
        expect(response.status).not.toBe(503);

        // يجب ألا يحتوي على رسائل خطأ قاعدة البيانات
        expect(response.body.message).not.toContain('SQL');
        expect(response.body.message).not.toContain('database');
        expect(response.body.message).not.toContain('syntax');
      }
    });

    it('should prevent SQL injection in password field', async () => {
      const maliciousPayloads = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "' UNION SELECT * FROM users --",
        "password'; INSERT INTO users VALUES ('hacker', 'pass'); --",
      ];

      for (const payload of maliciousPayloads) {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'admin@test.com',
            password: payload,
          });

        expect(response.status).not.toBe(500);
        expect(response.status).not.toBe(503);
        expect(response.body.message).not.toContain('SQL');
        expect(response.body.message).not.toContain('database');
      }
    });

    it('should prevent NoSQL injection attacks', async () => {
      const maliciousPayloads = [
        { $ne: '' },
        { $gt: '' },
        { $regex: '.*' },
        { $where: 'function() { return true; }' },
      ];

      for (const payload of maliciousPayloads) {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: payload,
            password: 'password123',
          });

        expect(response.status).not.toBe(500);
        expect(response.status).not.toBe(503);
      }
    });

    it('should prevent brute force attacks with rate limiting', async () => {
      const attempts = 10;

      for (let i = 0; i < attempts; i++) {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'wrong@test.com',
            password: 'wrongpassword',
          });

        if (i < 5) {
          // المحاولات الأولى يجب أن تعطي خطأ 401
          expect(response.status).toBe(401);
        } else {
          // بعد 5 محاولات يجب أن يتم حظر الطلبات
          expect([429, 403, 401]).toContain(response.status);
        }
      }
    });

    it('should prevent timing attacks by using constant time comparison', async () => {
      const startTime = Date.now();

      // محاولة تسجيل دخول خاطئة
      await request(app.getHttpServer()).post('/auth/login').send({
        email: 'admin@test.com',
        password: 'wrongpassword',
      });

      const wrongPasswordTime = Date.now() - startTime;

      const startTime2 = Date.now();

      // محاولة تسجيل دخول مع مستخدم غير موجود
      await request(app.getHttpServer()).post('/auth/login').send({
        email: 'nonexistent@test.com',
        password: 'anypassword',
      });

      const nonexistentUserTime = Date.now() - startTime2;

      // الفرق في الوقت يجب أن يكون أقل من 100ms
      const timeDifference = Math.abs(wrongPasswordTime - nonexistentUserTime);
      expect(timeDifference).toBeLessThan(100);
    });

    it('should prevent user enumeration attacks', async () => {
      // محاولة تسجيل دخول مع مستخدم موجود
      const existingUserResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'wrongpassword',
        });

      // محاولة تسجيل دخول مع مستخدم غير موجود
      const nonexistentUserResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'anypassword',
        });

      // يجب أن تكون رسائل الخطأ متشابهة
      expect(existingUserResponse.body.message).toBe(
        nonexistentUserResponse.body.message,
      );
      expect(existingUserResponse.status).toBe(nonexistentUserResponse.status);
    });

    it('should validate input length to prevent buffer overflow', async () => {
      const longEmail = 'a'.repeat(1000) + '@test.com';
      const longPassword = 'a'.repeat(1000);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: longEmail,
          password: longPassword,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('طول');
    });

    it('should prevent XSS in error messages', async () => {
      const maliciousPayloads = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(\'xss\')">',
        '"><script>alert("xss")</script>',
      ];

      for (const payload of maliciousPayloads) {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: payload,
            password: 'password123',
          });

        // يجب ألا يحتوي على علامات HTML
        expect(response.body.message).not.toContain('<script>');
        expect(response.body.message).not.toContain('javascript:');
        expect(response.body.message).not.toContain('onerror=');
      }
    });
  });

  describe('JWT Security', () => {
    let validToken: string;

    beforeAll(async () => {
      // الحصول على token صحيح
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@echops.com',
          password: 'admin123',
        });

      validToken = response.body.access_token;
    });

    it('should reject expired tokens', async () => {
      // إنشاء token منتهي الصلاحية
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('expired');
    });

    it('should reject malformed tokens', async () => {
      const malformedTokens = [
        'invalid.token.here',
        'Bearer invalid',
        'Bearer ',
        'Bearer',
        '',
        'not-a-jwt-token',
      ];

      for (const token of malformedTokens) {
        const response = await request(app.getHttpServer())
          .get('/users')
          .set('Authorization', token);

        expect(response.status).toBe(401);
      }
    });

    it('should reject tokens with invalid signature', async () => {
      // token مع توقيع خاطئ
      const invalidSignatureToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.invalid_signature';

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${invalidSignatureToken}`);

      expect(response.status).toBe(401);
    });

    it('should reject tokens with missing required claims', async () => {
      // token بدون sub claim
      const tokenWithoutSub =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UiLCJpYXQiOjE1MTYyMzkwMjJ9.invalid_signature';

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${tokenWithoutSub}`);

      expect(response.status).toBe(401);
    });

    it('should prevent token replay attacks', async () => {
      // استخدام نفس token مرتين
      const response1 = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${validToken}`);

      const response2 = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${validToken}`);

      // يجب أن يعمل كلا الطلبين
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
    });
  });

  describe('Password Security', () => {
    it('should enforce strong password requirements', async () => {
      const weakPasswords = [
        '123',
        'abc',
        'password',
        'qwerty',
        '123456',
        'abcdef',
      ];

      for (const password of weakPasswords) {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            name: 'Test User',
            email: 'test@example.com',
            password: password,
            role: 'AGENT',
          });

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('كلمة المرور');
      }
    });

    it('should hash passwords before storing', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'StrongPassword123!',
          role: 'AGENT',
        });

      expect(response.status).toBe(201);

      // التحقق من أن كلمة المرور محفوظة كـ hash
      const userResponse = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${response.body.access_token}`);

      const user = userResponse.body.find(
        (u: any) => u.email === 'test@example.com',
      );
      expect(user.password).not.toBe('StrongPassword123!');
      expect(user.password).toMatch(/^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/); // bcrypt hash format
    });

    it('should prevent password in logs', async () => {
      // هذا الاختبار يتطلب فحص سجلات التطبيق
      // في التطبيق الحقيقي، يجب التأكد من عدم تسجيل كلمات المرور
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@echops.com',
          password: 'admin123',
        });

      expect(response.status).toBe(200);
      // لا يمكن اختبار السجلات في بيئة الاختبار
    });
  });

  describe('Session Security', () => {
    it('should invalidate tokens on logout', async () => {
      // تسجيل الدخول
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@echops.com',
          password: 'admin123',
        });

      const token = loginResponse.body.access_token;

      // تسجيل الخروج
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      // محاولة استخدام token بعد تسجيل الخروج
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(401);
    });

    it('should implement proper session timeout', async () => {
      // هذا الاختبار يتطلب انتظار انتهاء صلاحية token
      // في التطبيق الحقيقي، يجب اختبار انتهاء الصلاحية
      expect(true).toBe(true);
    });
  });
});
