import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

describe('Leads (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let authToken: string;
  let testLeadId: string;

  const testUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    company_id: 'test-company-id',
  };

  const testLead = {
    name: 'أحمد محمد',
    phone: '+966501234567',
    email: 'ahmed@example.com',
    source: 'website',
    status: 'new',
    interest: 'شقة',
    budget: 500000,
    notes: 'عميل مهتم بشقة في الرياض',
    unit_id: 'test-unit-id',
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

  describe('/leads (POST)', () => {
    it('should create a new lead when user has permission', () => {
      return request(app.getHttpServer())
        .post('/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testLead)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe(testLead.name);
          expect(res.body.email).toBe(testLead.email);
          expect(res.body.phone).toBe(testLead.phone);
          expect(res.body.source).toBe(testLead.source);
          expect(res.body.status).toBe(testLead.status);
          expect(res.body.interest).toBe(testLead.interest);
          expect(res.body.budget).toBe(testLead.budget);
          expect(res.body.notes).toBe(testLead.notes);
          expect(res.body.unit_id).toBe(testLead.unit_id);
          expect(res.body.company_id).toBe(testUser.company_id);

          testLeadId = res.body.id;
        });
    });

    it('should return 400 when required fields are missing', () => {
      const invalidLead = {
        name: 'أحمد محمد',
        // email missing
        phone: '+966501234567',
      };

      return request(app.getHttpServer())
        .post('/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidLead)
        .expect(400);
    });

    it('should return 401 when no token provided', () => {
      return request(app.getHttpServer())
        .post('/leads')
        .send(testLead)
        .expect(401);
    });
  });

  describe('/leads (GET)', () => {
    it('should return all leads when user has permission', () => {
      return request(app.getHttpServer())
        .get('/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('name');
          expect(res.body[0]).toHaveProperty('email');
        });
    });

    it('should return 401 when no token provided', () => {
      return request(app.getHttpServer()).get('/leads').expect(401);
    });
  });

  describe('/leads/:id (GET)', () => {
    it('should return a specific lead when user has permission', () => {
      return request(app.getHttpServer())
        .get(`/leads/${testLeadId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testLeadId);
          expect(res.body.name).toBe(testLead.name);
          expect(res.body.email).toBe(testLead.email);
        });
    });

    it('should return 404 when lead not found', () => {
      return request(app.getHttpServer())
        .get('/leads/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/leads/:id (PUT)', () => {
    it('should update a lead when user has permission', () => {
      const updateData = {
        status: 'contacted',
        notes: 'تم التواصل مع العميل',
        budget: 600000,
      };

      return request(app.getHttpServer())
        .put(`/leads/${testLeadId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.affected).toBe(1);
        });
    });

    it('should return 404 when lead not found', () => {
      const updateData = {
        status: 'contacted',
      };

      return request(app.getHttpServer())
        .put('/leads/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('/leads/:id (DELETE)', () => {
    it('should delete a lead when user has permission', () => {
      return request(app.getHttpServer())
        .delete(`/leads/${testLeadId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.affected).toBe(1);
        });
    });

    it('should return 404 when lead not found', () => {
      return request(app.getHttpServer())
        .delete('/leads/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/leads/by-unit/:unitId (GET)', () => {
    it('should return leads by unit when user has permission', () => {
      return request(app.getHttpServer())
        .get(`/leads/by-unit/${testLead.unit_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/leads/by-project/:projectId (GET)', () => {
    it('should return leads by project when user has permission', () => {
      return request(app.getHttpServer())
        .get('/leads/by-project/test-project-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/leads/by-developer/:developerId (GET)', () => {
    it('should return leads by developer when user has permission', () => {
      return request(app.getHttpServer())
        .get('/leads/by-developer/test-developer-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('Lead validation', () => {
    it('should validate email format', () => {
      const invalidLead = {
        name: 'أحمد محمد',
        email: 'invalid-email',
        phone: '+966501234567',
      };

      return request(app.getHttpServer())
        .post('/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidLead)
        .expect(400);
    });

    it('should validate phone number format', () => {
      const invalidLead = {
        name: 'أحمد محمد',
        email: 'ahmed@example.com',
        phone: 'invalid-phone',
      };

      return request(app.getHttpServer())
        .post('/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidLead)
        .expect(400);
    });

    it('should validate budget is positive number', () => {
      const invalidLead = {
        name: 'أحمد محمد',
        email: 'ahmed@example.com',
        phone: '+966501234567',
        budget: -1000,
      };

      return request(app.getHttpServer())
        .post('/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidLead)
        .expect(400);
    });
  });

  describe('Lead filtering and pagination', () => {
    it('should filter leads by status', () => {
      return request(app.getHttpServer())
        .get('/leads?status=new')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            res.body.forEach((lead: any) => {
              expect(lead.status).toBe('new');
            });
          }
        });
    });

    it('should filter leads by source', () => {
      return request(app.getHttpServer())
        .get('/leads?source=website')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            res.body.forEach((lead: any) => {
              expect(lead.source).toBe('website');
            });
          }
        });
    });

    it('should filter leads by budget range', () => {
      return request(app.getHttpServer())
        .get('/leads?min_budget=300000&max_budget=800000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            res.body.forEach((lead: any) => {
              expect(lead.budget).toBeGreaterThanOrEqual(300000);
              expect(lead.budget).toBeLessThanOrEqual(800000);
            });
          }
        });
    });
  });
});
