import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

describe('Projects (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let authToken: string;
  let testProjectId: string;

  const testUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    company_id: 'test-company-id',
  };

  const testProject = {
    name: 'مشروع الرياض السكني',
    description: 'مشروع سكني فاخر في قلب الرياض',
    developer_id: 'test-developer-id',
    location: 'الرياض، المملكة العربية السعودية',
    project_type: 'residential',
    status: 'under_construction',
    start_date: new Date('2024-01-01'),
    expected_completion_date: new Date('2026-12-31'),
    budget: 50000000,
    total_units: 200,
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

  describe('/projects (POST)', () => {
    it('should create a new project when user has permission', () => {
      return request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testProject)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe(testProject.name);
          expect(res.body.description).toBe(testProject.description);
          expect(res.body.developer_id).toBe(testProject.developer_id);
          expect(res.body.location).toBe(testProject.location);
          expect(res.body.project_type).toBe(testProject.project_type);
          expect(res.body.status).toBe(testProject.status);
          expect(res.body.budget).toBe(testProject.budget);
          expect(res.body.total_units).toBe(testProject.total_units);
          expect(res.body.company_id).toBe(testUser.company_id);

          testProjectId = res.body.id;
        });
    });

    it('should return 400 when required fields are missing', () => {
      const invalidProject = {
        name: 'مشروع الرياض السكني',
        // developer_id missing
        location: 'الرياض، المملكة العربية السعودية',
      };

      return request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidProject)
        .expect(400);
    });

    it('should return 401 when no token provided', () => {
      return request(app.getHttpServer())
        .post('/projects')
        .send(testProject)
        .expect(401);
    });
  });

  describe('/projects (GET)', () => {
    it('should return all projects when user has permission', () => {
      return request(app.getHttpServer())
        .get('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('name');
          expect(res.body[0]).toHaveProperty('developer_id');
          expect(res.body[0]).toHaveProperty('location');
        });
    });

    it('should return 401 when no token provided', () => {
      return request(app.getHttpServer()).get('/projects').expect(401);
    });
  });

  describe('/projects/:id (GET)', () => {
    it('should return a specific project when user has permission', () => {
      return request(app.getHttpServer())
        .get(`/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testProjectId);
          expect(res.body.name).toBe(testProject.name);
          expect(res.body.description).toBe(testProject.description);
          expect(res.body.developer_id).toBe(testProject.developer_id);
        });
    });

    it('should return 404 when project not found', () => {
      return request(app.getHttpServer())
        .get('/projects/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/projects/:id (PUT)', () => {
    it('should update a project when user has permission', () => {
      const updateData = {
        name: 'مشروع الرياض السكني المحدث',
        progress_percentage: 30,
        completed_units: 60,
        status: 'active',
      };

      return request(app.getHttpServer())
        .put(`/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.affected).toBe(1);
        });
    });

    it('should return 404 when project not found', () => {
      const updateData = {
        name: 'اسم محدث',
      };

      return request(app.getHttpServer())
        .put('/projects/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('/projects/:id (DELETE)', () => {
    it('should delete a project when user has permission', () => {
      return request(app.getHttpServer())
        .delete(`/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.affected).toBe(1);
        });
    });

    it('should return 404 when project not found', () => {
      return request(app.getHttpServer())
        .delete('/projects/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/projects/top (GET)', () => {
    it('should return top projects when user has permission', () => {
      return request(app.getHttpServer())
        .get('/projects/top')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/projects/status/:status (GET)', () => {
    it('should return projects by status when user has permission', () => {
      return request(app.getHttpServer())
        .get('/projects/status/under_construction')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            res.body.forEach((project: any) => {
              expect(project.status).toBe('under_construction');
            });
          }
        });
    });
  });

  describe('/projects/type/:type (GET)', () => {
    it('should return projects by type when user has permission', () => {
      return request(app.getHttpServer())
        .get('/projects/type/residential')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            res.body.forEach((project: any) => {
              expect(project.project_type).toBe('residential');
            });
          }
        });
    });
  });

  describe('/projects/developer/:developerId (GET)', () => {
    it('should return projects by developer when user has permission', () => {
      return request(app.getHttpServer())
        .get(`/projects/developer/${testProject.developer_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/projects/:id/status (PUT)', () => {
    it('should update project status when user has permission', () => {
      const statusData = {
        status: 'completed',
      };

      return request(app.getHttpServer())
        .put(`/projects/${testProjectId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(statusData)
        .expect(200)
        .expect((res) => {
          expect(res.body.affected).toBe(1);
        });
    });
  });

  describe('/projects/:id/progress (PUT)', () => {
    it('should update project progress when user has permission', () => {
      const progressData = {
        progress: 50,
        completed_units: 100,
      };

      return request(app.getHttpServer())
        .put(`/projects/${testProjectId}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(progressData)
        .expect(200)
        .expect((res) => {
          expect(res.body.affected).toBe(1);
        });
    });
  });

  describe('/projects/:id/milestone (POST)', () => {
    it('should add milestone when user has permission', () => {
      const milestoneData = {
        name: 'إكمال الأساسات',
        description: 'تم إكمال جميع الأساسات',
        due_date: new Date('2024-06-30'),
        status: 'completed',
      };

      return request(app.getHttpServer())
        .post(`/projects/${testProjectId}/milestone`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(milestoneData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe(milestoneData.name);
          expect(res.body.description).toBe(milestoneData.description);
        });
    });
  });

  describe('Project validation', () => {
    it('should validate budget is positive number', () => {
      const invalidProject = {
        name: 'مشروع الرياض السكني',
        developer_id: 'test-developer-id',
        budget: -1000000,
      };

      return request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidProject)
        .expect(400);
    });

    it('should validate total units is positive number', () => {
      const invalidProject = {
        name: 'مشروع الرياض السكني',
        developer_id: 'test-developer-id',
        total_units: 0,
      };

      return request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidProject)
        .expect(400);
    });

    it('should validate completion date is after start date', () => {
      const invalidProject = {
        name: 'مشروع الرياض السكني',
        developer_id: 'test-developer-id',
        start_date: new Date('2024-12-31'),
        expected_completion_date: new Date('2024-01-01'),
      };

      return request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidProject)
        .expect(400);
    });
  });

  describe('Project filtering and search', () => {
    it('should filter projects by location', () => {
      return request(app.getHttpServer())
        .get('/projects?location=الرياض')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should filter projects by budget range', () => {
      return request(app.getHttpServer())
        .get('/projects?min_budget=30000000&max_budget=80000000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            res.body.forEach((project: any) => {
              expect(project.budget).toBeGreaterThanOrEqual(30000000);
              expect(project.budget).toBeLessThanOrEqual(80000000);
            });
          }
        });
    });

    it('should search projects by name', () => {
      return request(app.getHttpServer())
        .get('/projects?search=الرياض')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('Project statistics', () => {
    it('should return project statistics when user has permission', () => {
      return request(app.getHttpServer())
        .get('/projects/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('byStatus');
          expect(res.body).toHaveProperty('byType');
          expect(res.body).toHaveProperty('byLocation');
          expect(res.body).toHaveProperty('totalBudget');
          expect(res.body).toHaveProperty('averageProgress');
        });
    });
  });

  describe('Project relationships', () => {
    it('should return project with developer when user has permission', () => {
      return request(app.getHttpServer())
        .get(`/projects/${testProjectId}?include=developer`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('developer');
          expect(res.body.developer).toHaveProperty('id');
          expect(res.body.developer).toHaveProperty('name');
        });
    });

    it('should return project with properties when user has permission', () => {
      return request(app.getHttpServer())
        .get(`/projects/${testProjectId}?include=properties`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('properties');
          expect(Array.isArray(res.body.properties)).toBe(true);
        });
    });

    it('should return project with milestones when user has permission', () => {
      return request(app.getHttpServer())
        .get(`/projects/${testProjectId}?include=milestones`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('milestones');
          expect(Array.isArray(res.body.milestones)).toBe(true);
        });
    });
  });
});
