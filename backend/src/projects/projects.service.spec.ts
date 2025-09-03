import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';
import { PermissionsService } from '../auth/permissions.service';
import { ForbiddenException } from '@nestjs/common';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let repository: Repository<Project>;
  let permissionsService: PermissionsService;

  const mockProject = {
    id: 1,
    name: 'مشروع الرياض السكني',
    description: 'مشروع سكني فاخر في قلب الرياض',
    developer_id: '123e4567-e89b-12d3-a456-426614174000',
    location: 'الرياض، المملكة العربية السعودية',
    project_type: 'residential',
    status: 'under_construction',
    start_date: new Date('2024-01-01'),
    expected_completion_date: new Date('2026-12-31'),
    budget: 50000000,
    total_units: 200,
    completed_units: 50,
    progress_percentage: 25,
    company_id: '123e4567-e89b-12d3-a456-426614174001',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockProject]),
      getOne: jest.fn().mockResolvedValue(mockProject),
    })),
  };

  const mockPermissionsService = {
    checkPermission: jest.fn(),
    getCompanyId: jest
      .fn()
      .mockResolvedValue('123e4567-e89b-12d3-a456-426614174001'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getRepositoryToken(Project),
          useValue: mockRepository,
        },
        {
          provide: PermissionsService,
          useValue: mockPermissionsService,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    repository = module.get<Repository<Project>>(getRepositoryToken(Project));
    permissionsService = module.get<PermissionsService>(PermissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new project when user has permission', async () => {
      const createProjectDto = {
        name: 'مشروع الرياض السكني',
        description: 'مشروع سكني فاخر في قلب الرياض',
        developer_id: '123e4567-e89b-12d3-a456-426614174000',
        location: 'الرياض، المملكة العربية السعودية',
        project_type: 'residential',
        status: 'under_construction',
        start_date: new Date('2024-01-01'),
        expected_completion_date: new Date('2026-12-31'),
        budget: 50000000,
        total_units: 200,
      };

      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);
      mockRepository.create.mockReturnValue(mockProject);
      mockRepository.save.mockResolvedValue(mockProject);

      const result = await service.create(createProjectDto, userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'projects.create',
      );
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createProjectDto,
        company_id: companyId,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockProject);
      expect(result).toEqual(mockProject);
    });

    it('should throw ForbiddenException when user lacks permission', async () => {
      const createProjectDto = {
        name: 'مشروع الرياض السكني',
        description: 'مشروع سكني فاخر في قلب الرياض',
      };

      const userId = 'user-123';

      mockPermissionsService.checkPermission.mockResolvedValue(false);

      await expect(service.create(createProjectDto, userId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'projects.create',
      );
    });
  });

  describe('findAll', () => {
    it('should return all projects when user has permission', async () => {
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);

      const result = await service.findAll(userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'projects.read',
      );
      expect(result).toEqual([mockProject]);
    });

    it('should throw ForbiddenException when user lacks permission', async () => {
      const userId = 'user-123';

      mockPermissionsService.checkPermission.mockResolvedValue(false);

      await expect(service.findAll(userId)).rejects.toThrow(ForbiddenException);
      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'projects.read',
      );
    });
  });

  describe('findOne', () => {
    it('should return a project when user has permission', async () => {
      const projectId = '1';
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);

      const result = await service.findOne(projectId, userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'projects.read',
      );
      expect(result).toEqual(mockProject);
    });

    it('should throw ForbiddenException when user lacks permission', async () => {
      const projectId = '1';
      const userId = 'user-123';

      mockPermissionsService.checkPermission.mockResolvedValue(false);

      await expect(service.findOne(projectId, userId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'projects.read',
      );
    });
  });

  describe('update', () => {
    it('should update a project when user has permission', async () => {
      const projectId = '1';
      const updateProjectDto = {
        name: 'مشروع الرياض السكني المحدث',
        progress_percentage: 30,
        completed_units: 60,
      };
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.update(projectId, updateProjectDto, userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'projects.update',
      );
      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: projectId, company_id: companyId },
        updateProjectDto,
      );
      expect(result).toEqual({ affected: 1 });
    });

    it('should throw ForbiddenException when user lacks permission', async () => {
      const projectId = '1';
      const updateProjectDto = { name: 'اسم محدث' };
      const userId = 'user-123';

      mockPermissionsService.checkPermission.mockResolvedValue(false);

      await expect(
        service.update(projectId, updateProjectDto, userId),
      ).rejects.toThrow(ForbiddenException);
      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'projects.update',
      );
    });
  });

  describe('remove', () => {
    it('should remove a project when user has permission', async () => {
      const projectId = '1';
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(projectId, userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'projects.delete',
      );
      expect(mockRepository.delete).toHaveBeenCalledWith({
        id: projectId,
        company_id: companyId,
      });
      expect(result).toEqual({ affected: 1 });
    });

    it('should throw ForbiddenException when user lacks permission', async () => {
      const projectId = '1';
      const userId = 'user-123';

      mockPermissionsService.checkPermission.mockResolvedValue(false);

      await expect(service.remove(projectId, userId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'projects.delete',
      );
    });
  });

  describe('getTopProjects', () => {
    it('should return top projects when user has permission', async () => {
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);

      const result = await service.getTopProjects(userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'projects.read',
      );
      expect(result).toEqual([mockProject]);
    });
  });

  describe('getProjectsByStatus', () => {
    it('should return projects by status when user has permission', async () => {
      const status = 'under_construction';
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);

      const result = await service.getProjectsByStatus(status, userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'projects.read',
      );
      expect(result).toEqual([mockProject]);
    });
  });

  describe('getProjectsByType', () => {
    it('should return projects by type when user has permission', async () => {
      const type = 'residential';
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);

      const result = await service.getProjectsByType(type, userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'projects.read',
      );
      expect(result).toEqual([mockProject]);
    });
  });

  describe('getProjectsByDeveloper', () => {
    it('should return projects by developer when user has permission', async () => {
      const developerId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);

      const result = await service.getProjectsByDeveloper(developerId, userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'projects.read',
      );
      expect(result).toEqual([mockProject]);
    });
  });

  describe('updateStatus', () => {
    it('should update project status when user has permission', async () => {
      const projectId = '1';
      const status = 'completed';
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateStatus(projectId, status, userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'projects.update',
      );
      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: projectId, company_id: companyId },
        { status },
      );
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('updateProgress', () => {
    it('should update project progress when user has permission', async () => {
      const projectId = '1';
      const progress = 50;
      const completedUnits = 100;
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateProgress(
        projectId,
        progress,
        completedUnits,
        userId,
      );

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'projects.update',
      );
      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: projectId, company_id: companyId },
        { progress_percentage: progress, completed_units: completedUnits },
      );
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('addMilestone', () => {
    it('should add milestone when user has permission', async () => {
      const projectId = '1';
      const milestone = {
        name: 'إكمال الأساسات',
        description: 'تم إكمال جميع الأساسات',
        due_date: new Date('2024-06-30'),
        status: 'completed',
      };
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.addMilestone(projectId, milestone, userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'projects.update',
      );
      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: projectId, company_id: companyId },
        { milestones: expect.any(Function) },
      );
      expect(result).toEqual({ affected: 1 });
    });
  });
});
