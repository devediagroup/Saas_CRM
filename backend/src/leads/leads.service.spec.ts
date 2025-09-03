import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeadsService } from './leads.service';
import { Lead } from './entities/lead.entity';
import { PermissionsService } from '../auth/permissions.service';
import { ForbiddenException } from '@nestjs/common';

describe('LeadsService', () => {
  let service: LeadsService;
  let repository: Repository<Lead>;
  let permissionsService: PermissionsService;

  const mockLead = {
    id: 1,
    name: 'أحمد محمد',
    phone: '+966501234567',
    email: 'ahmed@example.com',
    source: 'website',
    status: 'new',
    interest: 'شقة',
    budget: 500000,
    notes: 'عميل مهتم بشقة في الرياض',
    unit_id: '123e4567-e89b-12d3-a456-426614174000',
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
      getMany: jest.fn().mockResolvedValue([mockLead]),
      getOne: jest.fn().mockResolvedValue(mockLead),
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
        LeadsService,
        {
          provide: getRepositoryToken(Lead),
          useValue: mockRepository,
        },
        {
          provide: PermissionsService,
          useValue: mockPermissionsService,
        },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
    repository = module.get<Repository<Lead>>(getRepositoryToken(Lead));
    permissionsService = module.get<PermissionsService>(PermissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new lead when user has permission', async () => {
      const createLeadDto = {
        name: 'أحمد محمد',
        phone: '+966501234567',
        email: 'ahmed@example.com',
        source: 'website',
        status: 'new',
        interest: 'شقة',
        budget: 500000,
        notes: 'عميل مهتم بشقة في الرياض',
        unit_id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);
      mockRepository.create.mockReturnValue(mockLead);
      mockRepository.save.mockResolvedValue(mockLead);

      const result = await service.create(createLeadDto, userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'leads.create',
      );
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createLeadDto,
        company_id: companyId,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockLead);
      expect(result).toEqual(mockLead);
    });

    it('should throw ForbiddenException when user lacks permission', async () => {
      const createLeadDto = {
        name: 'أحمد محمد',
        phone: '+966501234567',
        email: 'ahmed@example.com',
      };

      const userId = 'user-123';

      mockPermissionsService.checkPermission.mockResolvedValue(false);

      await expect(service.create(createLeadDto, userId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'leads.create',
      );
    });
  });

  describe('findAll', () => {
    it('should return all leads when user has permission', async () => {
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);

      const result = await service.findAll(userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'leads.read',
      );
      expect(result).toEqual([mockLead]);
    });

    it('should throw ForbiddenException when user lacks permission', async () => {
      const userId = 'user-123';

      mockPermissionsService.checkPermission.mockResolvedValue(false);

      await expect(service.findAll(userId)).rejects.toThrow(ForbiddenException);
      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'leads.read',
      );
    });
  });

  describe('findOne', () => {
    it('should return a lead when user has permission', async () => {
      const leadId = '1';
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);

      const result = await service.findOne(leadId, userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'leads.read',
      );
      expect(result).toEqual(mockLead);
    });

    it('should throw ForbiddenException when user lacks permission', async () => {
      const leadId = '1';
      const userId = 'user-123';

      mockPermissionsService.checkPermission.mockResolvedValue(false);

      await expect(service.findOne(leadId, userId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'leads.read',
      );
    });
  });

  describe('update', () => {
    it('should update a lead when user has permission', async () => {
      const leadId = '1';
      const updateLeadDto = {
        status: 'contacted',
        notes: 'تم التواصل مع العميل',
      };
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.update(leadId, updateLeadDto, userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'leads.update',
      );
      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: leadId, company_id: companyId },
        updateLeadDto,
      );
      expect(result).toEqual({ affected: 1 });
    });

    it('should throw ForbiddenException when user lacks permission', async () => {
      const leadId = '1';
      const updateLeadDto = { status: 'contacted' };
      const userId = 'user-123';

      mockPermissionsService.checkPermission.mockResolvedValue(false);

      await expect(
        service.update(leadId, updateLeadDto, userId),
      ).rejects.toThrow(ForbiddenException);
      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'leads.update',
      );
    });
  });

  describe('remove', () => {
    it('should remove a lead when user has permission', async () => {
      const leadId = '1';
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(leadId, userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'leads.delete',
      );
      expect(mockRepository.delete).toHaveBeenCalledWith({
        id: leadId,
        company_id: companyId,
      });
      expect(result).toEqual({ affected: 1 });
    });

    it('should throw ForbiddenException when user lacks permission', async () => {
      const leadId = '1';
      const userId = 'user-123';

      mockPermissionsService.checkPermission.mockResolvedValue(false);

      await expect(service.remove(leadId, userId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'leads.delete',
      );
    });
  });

  describe('getLeadsByUnit', () => {
    it('should return leads by unit when user has permission', async () => {
      const unitId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);

      const result = await service.getLeadsByUnit(unitId, userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'leads.read',
      );
      expect(result).toEqual([mockLead]);
    });
  });

  describe('getLeadsByProject', () => {
    it('should return leads by project when user has permission', async () => {
      const projectId = '123e4567-e89b-12d3-a456-426614174002';
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);

      const result = await service.getLeadsByProject(projectId, userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'leads.read',
      );
      expect(result).toEqual([mockLead]);
    });
  });

  describe('getLeadsByDeveloper', () => {
    it('should return leads by developer when user has permission', async () => {
      const developerId = '123e4567-e89b-12d3-a456-426614174003';
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174001';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);

      const result = await service.getLeadsByDeveloper(developerId, userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'leads.read',
      );
      expect(result).toEqual([mockLead]);
    });
  });
});
