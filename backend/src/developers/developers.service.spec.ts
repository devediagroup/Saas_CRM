import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DevelopersService } from './developers.service';
import { Developer } from './entities/developer.entity';
import { PermissionsService } from '../auth/permissions.service';
import { ForbiddenException } from '@nestjs/common';

describe('DevelopersService', () => {
  let service: DevelopersService;
  let repository: Repository<Developer>;
  let permissionsService: PermissionsService;

  const mockDeveloper = {
    id: 1,
    name: 'شركة الرياض للتطوير العقاري',
    email: 'info@riyadh-dev.com',
    phone: '+966501234567',
    address: 'الرياض، المملكة العربية السعودية',
    website: 'https://riyadh-dev.com',
    description: 'شركة رائدة في التطوير العقاري',
    logo_url: 'https://example.com/logo.png',
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
      getMany: jest.fn().mockResolvedValue([mockDeveloper]),
      getOne: jest.fn().mockResolvedValue(mockDeveloper),
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
        DevelopersService,
        {
          provide: getRepositoryToken(Developer),
          useValue: mockRepository,
        },
        {
          provide: PermissionsService,
          useValue: mockPermissionsService,
        },
      ],
    }).compile();

    service = module.get<DevelopersService>(DevelopersService);
    repository = module.get<Repository<Developer>>(
      getRepositoryToken(Developer),
    );
    permissionsService = module.get<PermissionsService>(PermissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new developer when user has permission', async () => {
      const createDeveloperDto = {
        name: 'شركة الرياض للتطوير العقاري',
        email: 'info@riyadh-dev.com',
        phone: '+966501234567',
        address: 'الرياض، المملكة العربية السعودية',
        website: 'https://riyadh-dev.com',
        description: 'شركة رائدة في التطوير العقاري',
        logo_url: 'https://example.com/logo.png',
      };

      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);
      mockRepository.create.mockReturnValue(mockDeveloper);
      mockRepository.save.mockResolvedValue(mockDeveloper);

      const result = await service.create(createDeveloperDto, userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'developers.create',
      );
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDeveloperDto,
        company_id: companyId,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockDeveloper);
      expect(result).toEqual(mockDeveloper);
    });

    it('should throw ForbiddenException when user lacks permission', async () => {
      const createDeveloperDto = {
        name: 'شركة الرياض للتطوير العقاري',
        email: 'info@riyadh-dev.com',
      };

      const userId = 'user-123';

      mockPermissionsService.checkPermission.mockResolvedValue(false);

      await expect(service.create(createDeveloperDto, userId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'developers.create',
      );
    });
  });

  describe('findAll', () => {
    it('should return all developers when user has permission', async () => {
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);

      const result = await service.findAll(userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'developers.read',
      );
      expect(result).toEqual([mockDeveloper]);
    });

    it('should throw ForbiddenException when user lacks permission', async () => {
      const userId = 'user-123';

      mockPermissionsService.checkPermission.mockResolvedValue(false);

      await expect(service.findAll(userId)).rejects.toThrow(ForbiddenException);
      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'developers.read',
      );
    });
  });

  describe('findOne', () => {
    it('should return a developer when user has permission', async () => {
      const developerId = '1';
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);

      const result = await service.findOne(developerId, userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'developers.read',
      );
      expect(result).toEqual(mockDeveloper);
    });

    it('should throw ForbiddenException when user lacks permission', async () => {
      const developerId = '1';
      const userId = 'user-123';

      mockPermissionsService.checkPermission.mockResolvedValue(false);

      await expect(service.findOne(developerId, userId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'developers.read',
      );
    });
  });

  describe('update', () => {
    it('should update a developer when user has permission', async () => {
      const developerId = '1';
      const updateDeveloperDto = {
        name: 'شركة الرياض للتطوير العقاري المحدثة',
        description: 'وصف محدث للشركة',
      };
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.update(
        developerId,
        updateDeveloperDto,
        userId,
      );

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'developers.update',
      );
      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: developerId, company_id: companyId },
        updateDeveloperDto,
      );
      expect(result).toEqual({ affected: 1 });
    });

    it('should throw ForbiddenException when user lacks permission', async () => {
      const developerId = '1';
      const updateDeveloperDto = { name: 'اسم محدث' };
      const userId = 'user-123';

      mockPermissionsService.checkPermission.mockResolvedValue(false);

      await expect(
        service.update(developerId, updateDeveloperDto, userId),
      ).rejects.toThrow(ForbiddenException);
      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'developers.update',
      );
    });
  });

  describe('remove', () => {
    it('should remove a developer when user has permission', async () => {
      const developerId = '1';
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(developerId, userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'developers.delete',
      );
      expect(mockRepository.delete).toHaveBeenCalledWith({
        id: developerId,
        company_id: companyId,
      });
      expect(result).toEqual({ affected: 1 });
    });

    it('should throw ForbiddenException when user lacks permission', async () => {
      const developerId = '1';
      const userId = 'user-123';

      mockPermissionsService.checkPermission.mockResolvedValue(false);

      await expect(service.remove(developerId, userId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'developers.delete',
      );
    });
  });

  describe('updateStatus', () => {
    it('should update developer status when user has permission', async () => {
      const developerId = '1';
      const status = 'active';
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateStatus(developerId, status, userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'developers.update',
      );
      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: developerId, company_id: companyId },
        { status },
      );
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('incrementCompletedProjects', () => {
    it('should increment completed projects when user has permission', async () => {
      const developerId = '1';
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.incrementCompletedProjects(
        developerId,
        userId,
      );

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'developers.update',
      );
      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: developerId, company_id: companyId },
        { completed_projects: expect.any(Function) },
      );
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('updateTotalInvestment', () => {
    it('should update total investment when user has permission', async () => {
      const developerId = '1';
      const investment = 1000000;
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateTotalInvestment(
        developerId,
        investment,
        userId,
      );

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'developers.update',
      );
      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: developerId, company_id: companyId },
        { total_investment: investment },
      );
      expect(result).toEqual({ affected: 1 });
    });
  });
});
