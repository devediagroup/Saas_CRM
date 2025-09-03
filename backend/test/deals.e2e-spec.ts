import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

describe('Deals (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let authToken: string;
  let testDealId: string;

  const testUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    company_id: 'test-company-id',
  };

  const testDeal = {
    title: 'صفقة شقة في الرياض',
    client: 'أحمد محمد',
    property: 'شقة الرياض',
    amount: 500000,
    commission: 25000,
    stage: 'negotiation',
    status: 'active',
    probability: 75,
    agent: 'سارة علي',
    expectedCloseDate: new Date('2024-12-31'),
    notes: 'صفقة قيد التفاوض',
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

  describe('/deals (POST)', () => {
    it('should create a new deal when user has permission', () => {
      return request(app.getHttpServer())
        .post('/deals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testDeal)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe(testDeal.title);
          expect(res.body.client).toBe(testDeal.client);
          expect(res.body.property).toBe(testDeal.property);
          expect(res.body.amount).toBe(testDeal.amount);
          expect(res.body.commission).toBe(testDeal.commission);
          expect(res.body.stage).toBe(testDeal.stage);
          expect(res.body.status).toBe(testDeal.status);
          expect(res.body.probability).toBe(testDeal.probability);
          expect(res.body.agent).toBe(testDeal.agent);
          expect(res.body.unit_id).toBe(testDeal.unit_id);
          expect(res.body.company_id).toBe(testUser.company_id);

          testDealId = res.body.id;
        });
    });

    it('should return 400 when required fields are missing', () => {
      const invalidDeal = {
        title: 'صفقة شقة في الرياض',
        // amount missing
        client: 'أحمد محمد',
      };

      return request(app.getHttpServer())
        .post('/deals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDeal)
        .expect(400);
    });

    it('should return 401 when no token provided', () => {
      return request(app.getHttpServer())
        .post('/deals')
        .send(testDeal)
        .expect(401);
    });
  });

  describe('/deals (GET)', () => {
    it('should return all deals when user has permission', () => {
      return request(app.getHttpServer())
        .get('/deals')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('title');
          expect(res.body[0]).toHaveProperty('client');
          expect(res.body[0]).toHaveProperty('amount');
        });
    });

    it('should return 401 when no token provided', () => {
      return request(app.getHttpServer()).get('/deals').expect(401);
    });
  });

  describe('/deals/:id (GET)', () => {
    it('should return a specific deal when user has permission', () => {
      return request(app.getHttpServer())
        .get(`/deals/${testDealId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testDealId);
          expect(res.body.title).toBe(testDeal.title);
          expect(res.body.client).toBe(testDeal.client);
          expect(res.body.amount).toBe(testDeal.amount);
        });
    });

    it('should return 404 when deal not found', () => {
      return request(app.getHttpServer())
        .get('/deals/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/deals/:id (PUT)', () => {
    it('should update a deal when user has permission', () => {
      const updateData = {
        stage: 'closed_won',
        probability: 100,
        notes: 'تم إغلاق الصفقة بنجاح',
      };

      return request(app.getHttpServer())
        .put(`/deals/${testDealId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.affected).toBe(1);
        });
    });

    it('should return 404 when deal not found', () => {
      const updateData = {
        stage: 'closed_won',
      };

      return request(app.getHttpServer())
        .put('/deals/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('/deals/:id (DELETE)', () => {
    it('should delete a deal when user has permission', () => {
      return request(app.getHttpServer())
        .delete(`/deals/${testDealId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.affected).toBe(1);
        });
    });

    it('should return 404 when deal not found', () => {
      return request(app.getHttpServer())
        .delete('/deals/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/deals/pipeline (GET)', () => {
    it('should return pipeline view when user has permission', () => {
      return request(app.getHttpServer())
        .get('/deals/pipeline')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('prospect');
          expect(res.body).toHaveProperty('qualified');
          expect(res.body).toHaveProperty('proposal');
          expect(res.body).toHaveProperty('negotiation');
          expect(res.body).toHaveProperty('contract');
          expect(res.body).toHaveProperty('closed_won');
          expect(res.body).toHaveProperty('closed_lost');
        });
    });
  });

  describe('/deals/overdue (GET)', () => {
    it('should return overdue deals when user has permission', () => {
      return request(app.getHttpServer())
        .get('/deals/overdue')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/deals/upcoming (GET)', () => {
    it('should return upcoming deals when user has permission', () => {
      return request(app.getHttpServer())
        .get('/deals/upcoming')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/deals/:id/stage (PUT)', () => {
    it('should update deal stage when user has permission', () => {
      const stageData = {
        stage: 'closed_won',
      };

      return request(app.getHttpServer())
        .put(`/deals/${testDealId}/stage`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(stageData)
        .expect(200)
        .expect((res) => {
          expect(res.body.affected).toBe(1);
        });
    });
  });

  describe('/deals/by-unit/:unitId (GET)', () => {
    it('should return deals by unit when user has permission', () => {
      return request(app.getHttpServer())
        .get(`/deals/by-unit/${testDeal.unit_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/deals/by-project/:projectId (GET)', () => {
    it('should return deals by project when user has permission', () => {
      return request(app.getHttpServer())
        .get('/deals/by-project/test-project-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/deals/by-developer/:developerId (GET)', () => {
    it('should return deals by developer when user has permission', () => {
      return request(app.getHttpServer())
        .get('/deals/by-developer/test-developer-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('Deal validation', () => {
    it('should validate amount is positive number', () => {
      const invalidDeal = {
        title: 'صفقة شقة في الرياض',
        client: 'أحمد محمد',
        amount: -100000,
      };

      return request(app.getHttpServer())
        .post('/deals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDeal)
        .expect(400);
    });

    it('should validate probability is between 0 and 100', () => {
      const invalidDeal = {
        title: 'صفقة شقة في الرياض',
        client: 'أحمد محمد',
        amount: 500000,
        probability: 150,
      };

      return request(app.getHttpServer())
        .post('/deals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDeal)
        .expect(400);
    });

    it('should validate commission is not greater than amount', () => {
      const invalidDeal = {
        title: 'صفقة شقة في الرياض',
        client: 'أحمد محمد',
        amount: 500000,
        commission: 600000,
      };

      return request(app.getHttpServer())
        .post('/deals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDeal)
        .expect(400);
    });
  });

  describe('Deal filtering and search', () => {
    it('should filter deals by stage', () => {
      return request(app.getHttpServer())
        .get('/deals?stage=negotiation')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            res.body.forEach((deal: any) => {
              expect(deal.stage).toBe('negotiation');
            });
          }
        });
    });

    it('should filter deals by status', () => {
      return request(app.getHttpServer())
        .get('/deals?status=active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            res.body.forEach((deal: any) => {
              expect(deal.status).toBe('active');
            });
          }
        });
    });

    it('should filter deals by amount range', () => {
      return request(app.getHttpServer())
        .get('/deals?min_amount=300000&max_amount=800000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            res.body.forEach((deal: any) => {
              expect(deal.amount).toBeGreaterThanOrEqual(300000);
              expect(deal.amount).toBeLessThanOrEqual(800000);
            });
          }
        });
    });

    it('should search deals by title or client', () => {
      return request(app.getHttpServer())
        .get('/deals?search=أحمد')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('Deal statistics', () => {
    it('should return deal statistics when user has permission', () => {
      return request(app.getHttpServer())
        .get('/deals/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('byStage');
          expect(res.body).toHaveProperty('byStatus');
          expect(res.body).toHaveProperty('totalValue');
          expect(res.body).toHaveProperty('averageDealSize');
          expect(res.body).toHaveProperty('conversionRate');
        });
    });
  });
});
