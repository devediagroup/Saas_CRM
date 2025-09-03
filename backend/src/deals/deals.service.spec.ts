import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DealsService } from './deals.service';
import { Deal } from './entities/deal.entity';
import { PermissionsService } from '../auth/permissions.service';
import { ForbiddenException } from '@nestjs/common';

describe('DealsService', () => {
  let service: DealsService;
  let repository: Repository<Deal>;
  let permissionsService: PermissionsService;

  const mockDeal = {
    id: 1,
    title: 'صفقة شقة في الرياض',
    client: 'أحمد محمد',
    property: 'شقة الرياض',
    amount: 500000,
    commission: 25000,
    stage: 'negotiation',
    status: 'active',
    probability: 75,
    agent: 'سارة علي',
    createdAt: new Date(),
    expectedCloseDate: new Date('2024-12-31'),
    lastActivity: new Date(),
    notes: 'صفقة قيد التفاوض',
    unit_id: '123e4567-e89b-12d3-a456-426614174000',
    company_id: '123e4567-e89b-12d3-a456-426614174001',
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
      getMany: jest.fn().mockResolvedValue([mockDeal]),
      getOne: jest.fn().mockResolvedValue(mockDeal),
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
        DealsService,
        {
          provide: getRepositoryToken(Deal),
          useValue: mockRepository,
        },
        {
          provide: PermissionsService,
          useValue: mockPermissionsService,
        },
      ],
    }).compile();

    service = module.get<DealsService>(DealsService);
    repository = module.get<Repository<Deal>>(getRepositoryToken(Deal));
    permissionsService = module.get<PermissionsService>(PermissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new deal when user has permission', async () => {
      const createDealDto = {
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
        unit_id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);
      mockRepository.create.mockReturnValue(mockDeal);
      mockRepository.save.mockResolvedValue(mockDeal);

      const result = await service.create(createDealDto, userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'deals.create',
      );
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDealDto,
        company_id: companyId,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockDeal);
      expect(result).toEqual(mockDeal);
    });

    it('should throw ForbiddenException when user lacks permission', async () => {
      const createDealDto = {
        title: 'صفقة شقة في الرياض',
        amount: 500000,
      };

      const userId = 'user-123';

      mockPermissionsService.checkPermission.mockResolvedValue(false);

      await expect(service.create(createDealDto, userId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'deals.create',
      );
    });
  });

  describe('findAll', () => {
    it('should return all deals when user has permission', async () => {
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);

      const result = await service.findAll(userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'deals.read',
      );
      expect(result).toEqual([mockDeal]);
    });

    it('should throw ForbiddenException when user lacks permission', async () => {
      const userId = 'user-123';

      mockPermissionsService.checkPermission.mockResolvedValue(false);

      await expect(service.findAll(userId)).rejects.toThrow(ForbiddenException);
      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'deals.read',
      );
    });
  });

  describe('findOne', () => {
    it('should return a deal when user has permission', async () => {
      const dealId = '1';
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);

      const result = await service.findOne(dealId, userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'deals.read',
      );
      expect(result).toEqual(mockDeal);
    });

    it('should throw ForbiddenException when user lacks permission', async () => {
      const dealId = '1';
      const userId = 'user-123';

      mockPermissionsService.checkPermission.mockResolvedValue(false);

      await expect(service.findOne(dealId, userId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'deals.read',
      );
    });
  });

  describe('update', () => {
    it('should update a deal when user has permission', async () => {
      const dealId = '1';
      const updateDealDto = {
        stage: 'closed_won',
        probability: 100,
        notes: 'تم إغلاق الصفقة بنجاح',
      };
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.update(dealId, updateDealDto, userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'deals.update',
      );
      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: dealId, company_id: companyId },
        updateDealDto,
      );
      expect(result).toEqual({ affected: 1 });
    });

    it('should throw ForbiddenException when user lacks permission', async () => {
      const dealId = '1';
      const updateDealDto = { stage: 'closed_won' };
      const userId = 'user-123';

      mockPermissionsService.checkPermission.mockResolvedValue(false);

      await expect(
        service.update(dealId, updateDealDto, userId),
      ).rejects.toThrow(ForbiddenException);
      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'deals.update',
      );
    });
  });

  describe('remove', () => {
    it('should remove a deal when user has permission', async () => {
      const dealId = '1';
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(dealId, userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'deals.delete',
      );
      expect(mockRepository.delete).toHaveBeenCalledWith({
        id: dealId,
        company_id: companyId,
      });
      expect(result).toEqual({ affected: 1 });
    });

    it('should throw ForbiddenException when user lacks permission', async () => {
      const dealId = '1';
      const userId = 'user-123';

      mockPermissionsService.checkPermission.mockResolvedValue(false);

      await expect(service.remove(dealId, userId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'deals.delete',
      );
    });
  });

  describe('getPipelineView', () => {
    it('should return pipeline view when user has permission', async () => {
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);

      const result = await service.getPipelineView(userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'deals.read',
      );
      expect(result).toEqual([mockDeal]);
    });
  });

  describe('getOverdueDeals', () => {
    it('should return overdue deals when user has permission', async () => {
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);

      const result = await service.getOverdueDeals(userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'deals.read',
      );
      expect(result).toEqual([mockDeal]);
    });
  });

  describe('getUpcomingDeals', () => {
    it('should return upcoming deals when user has permission', async () => {
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);

      const result = await service.getUpcomingDeals(userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'deals.read',
      );
      expect(result).toEqual([mockDeal]);
    });
  });

  describe('updateStage', () => {
    it('should update deal stage when user has permission', async () => {
      const dealId = '1';
      const stage = 'closed_won';
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateStage(dealId, stage, userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'deals.update',
      );
      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: dealId, company_id: companyId },
        { stage },
      );
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('getDealsByUnit', () => {
    it('should return deals by unit when user has permission', async () => {
      const unitId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);

      const result = await service.getDealsByUnit(unitId, userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'deals.read',
      );
      expect(result).toEqual([mockDeal]);
    });
  });

  describe('getDealsByProject', () => {
    it('should return deals by project when user has permission', async () => {
      const projectId = '123e4567-e89b-12d3-a456-426614174002';
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);

      const result = await service.getDealsByProject(projectId, userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'deals.read',
      );
      expect(result).toEqual([mockDeal]);
    });
  });

  describe('getDealsByDeveloper', () => {
    it('should return deals by developer when user has permission', async () => {
      const developerId = '123e4567-e89b-12d3-a456-426614174003';
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);

      const result = await service.getDealsByDeveloper(developerId, userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'deals.read',
      );
      expect(result).toEqual([mockDeal]);
    });
  });
});
