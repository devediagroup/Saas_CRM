import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

describe('Developers (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let authToken: string;
  let testDeveloperId: string;

  const testUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    company_id: 'test-company-id',
  };

  const testDeveloper = {
    name: 'شركة الرياض للتطوير العقاري',
    email: 'info@riyadh-dev.com',
    phone: '+966501234567',
    address: 'الرياض، المملكة العربية السعودية',
    website: 'https://riyadh-dev.com',
    description: 'شركة رائدة في التطوير العقاري',
    logo_url: 'https://example.com/logo.png',
  };

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
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            synchronize: true,
            logging: false,
          }),
          inject: [ConfigService],
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // إنشاء JWT token للاختبار
    authToken = jwtService.sign({
      sub: testUser.id,
      email: testUser.email,
      company_id: testUser.company_id,
    });

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/developers (POST)', () => {
    it('should create a new developer when user has permission', () => {
      return request(app.getHttpServer())
        .post('/developers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testDeveloper)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe(testDeveloper.name);
          expect(res.body.email).toBe(testDeveloper.email);
          expect(res.body.phone).toBe(testDeveloper.phone);
          expect(res.body.address).toBe(testDeveloper.address);
          expect(res.body.website).toBe(testDeveloper.website);
          expect(res.body.description).toBe(testDeveloper.description);
          expect(res.body.logo_url).toBe(testDeveloper.logo_url);
          expect(res.body.company_id).toBe(testUser.company_id);

          testDeveloperId = res.body.id;
        });
    });

    it('should return 400 when required fields are missing', () => {
      const invalidDeveloper = {
        name: 'شركة الرياض للتطوير العقاري',
        // email missing
        phone: '+966501234567',
      };

      return request(app.getHttpServer())
        .post('/developers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDeveloper)
        .expect(400);
    });

    it('should return 401 when no token provided', () => {
      return request(app.getHttpServer())
        .post('/developers')
        .send(testDeveloper)
        .expect(401);
    });
  });

  describe('/developers (GET)', () => {
    it('should return all developers when user has permission', () => {
      return request(app.getHttpServer())
        .get('/developers')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('name');
          expect(res.body[0]).toHaveProperty('email');
          expect(res.body[0]).toHaveProperty('phone');
        });
    });

    it('should return 401 when no token provided', () => {
      return request(app.getHttpServer()).get('/developers').expect(401);
    });
  });

  describe('/developers/:id (GET)', () => {
    it('should return a specific developer when user has permission', () => {
      return request(app.getHttpServer())
        .get(`/developers/${testDeveloperId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testDeveloperId);
          expect(res.body.name).toBe(testDeveloper.name);
          expect(res.body.email).toBe(testDeveloper.email);
          expect(res.body.phone).toBe(testDeveloper.phone);
        });
    });

    it('should return 404 when developer not found', () => {
      return request(app.getHttpServer())
        .get('/developers/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/developers/:id (PUT)', () => {
    it('should update a developer when user has permission', () => {
      const updateData = {
        name: 'شركة الرياض للتطوير العقاري المحدثة',
        description: 'وصف محدث للشركة',
        website: 'https://riyadh-dev-updated.com',
      };

      return request(app.getHttpServer())
        .put(`/developers/${testDeveloperId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.affected).toBe(1);
        });
    });

    it('should return 404 when developer not found', () => {
      const updateData = {
        name: 'اسم محدث',
      };

      return request(app.getHttpServer())
        .put('/developers/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('/developers/:id (DELETE)', () => {
    it('should delete a developer when user has permission', () => {
      return request(app.getHttpServer())
        .delete(`/developers/${testDeveloperId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.affected).toBe(1);
        });
    });

    it('should return 404 when developer not found', () => {
      return request(app.getHttpServer())
        .delete('/developers/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/developers/:id/status (PUT)', () => {
    it('should update developer status when user has permission', () => {
      const statusData = {
        status: 'active',
      };

      return request(app.getHttpServer())
        .put(`/developers/${testDeveloperId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(statusData)
        .expect(200)
        .expect((res) => {
          expect(res.body.affected).toBe(1);
        });
    });
  });

  describe('/developers/:id/completed-projects (PUT)', () => {
    it('should increment completed projects when user has permission', () => {
      return request(app.getHttpServer())
        .put(`/developers/${testDeveloperId}/completed-projects`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.affected).toBe(1);
        });
    });
  });

  describe('/developers/:id/investment (PUT)', () => {
    it('should update total investment when user has permission', () => {
      const investmentData = {
        investment: 1000000,
      };

      return request(app.getHttpServer())
        .put(`/developers/${testDeveloperId}/investment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(investmentData)
        .expect(200)
        .expect((res) => {
          expect(res.body.affected).toBe(1);
        });
    });
  });

  describe('Developer validation', () => {
    it('should validate email format', () => {
      const invalidDeveloper = {
        name: 'شركة الرياض للتطوير العقاري',
        email: 'invalid-email',
        phone: '+966501234567',
      };

      return request(app.getHttpServer())
        .post('/developers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDeveloper)
        .expect(400);
    });

    it('should validate phone number format', () => {
      const invalidDeveloper = {
        name: 'شركة الرياض للتطوير العقاري',
        email: 'info@riyadh-dev.com',
        phone: 'invalid-phone',
      };

      return request(app.getHttpServer())
        .post('/developers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDeveloper)
        .expect(400);
    });

    it('should validate website URL format', () => {
      const invalidDeveloper = {
        name: 'شركة الرياض للتطوير العقاري',
        email: 'info@riyadh-dev.com',
        phone: '+966501234567',
        website: 'invalid-website',
      };

      return request(app.getHttpServer())
        .post('/developers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDeveloper)
        .expect(400);
    });
  });

  describe('Developer filtering and search', () => {
    it('should filter developers by status', () => {
      return request(app.getHttpServer())
        .get('/developers?status=active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            res.body.forEach((developer: any) => {
              expect(developer.status).toBe('active');
            });
          }
        });
    });

    it('should filter developers by location', () => {
      return request(app.getHttpServer())
        .get('/developers?location=الرياض')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should search developers by name', () => {
      return request(app.getHttpServer())
        .get('/developers?search=الرياض')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('Developer statistics', () => {
    it('should return developer statistics when user has permission', () => {
      return request(app.getHttpServer())
        .get('/developers/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('byStatus');
          expect(res.body).toHaveProperty('byLocation');
          expect(res.body).toHaveProperty('totalInvestment');
          expect(res.body).toHaveProperty('averageProjects');
          expect(res.body).toHaveProperty('topPerformers');
        });
    });
  });

  describe('Developer projects relationship', () => {
    it('should return developer with projects when user has permission', () => {
      return request(app.getHttpServer())
        .get(`/developers/${testDeveloperId}?include=projects`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('projects');
          expect(Array.isArray(res.body.projects)).toBe(true);
        });
    });

    it('should return developer with properties when user has permission', () => {
      return request(app.getHttpServer())
        .get(`/developers/${testDeveloperId}?include=properties`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('properties');
          expect(Array.isArray(res.body.properties)).toBe(true);
        });
    });
  });
});
