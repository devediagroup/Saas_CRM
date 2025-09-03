import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertiesService } from './properties.service';
import { Property } from './entities/property.entity';
import { PermissionsService } from '../auth/permissions.service';
import { ForbiddenException } from '@nestjs/common';

describe('PropertiesService', () => {
  let service: PropertiesService;
  let repository: Repository<Property>;
  let permissionsService: PermissionsService;

  const mockProperty = {
    id: 1,
    title: 'شقة فاخرة في الرياض',
    description: 'شقة فاخرة في قلب الرياض مع إطلالة رائعة',
    property_type: 'apartment',
    status: 'available',
    price: 500000,
    area: 150,
    bedrooms: 3,
    bathrooms: 2,
    parking_spaces: 2,
    floor_number: 5,
    project_id: '123e4567-e89b-12d3-a456-426614174000',
    developer_id: '123e4567-e89b-12d3-a456-426614174001',
    location: 'الرياض، المملكة العربية السعودية',
    address: 'شارع الملك فهد، الرياض',
    latitude: 24.7136,
    longitude: 46.6753,
    images: ['image1.jpg', 'image2.jpg'],
    features: ['مكيف مركزي', 'مصعد', 'مسبح'],
    company_id: '123e4567-e89b-12d3-a456-426614174002',
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
      getMany: jest.fn().mockResolvedValue([mockProperty]),
      getOne: jest.fn().mockResolvedValue(mockProperty),
    })),
  };

  const mockPermissionsService = {
    checkPermission: jest.fn(),
    getCompanyId: jest
      .fn()
      .mockResolvedValue('123e4567-e89b-12d3-a456-426614174002'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        {
          provide: getRepositoryToken(Property),
          useValue: mockRepository,
        },
        {
          provide: PermissionsService,
          useValue: mockPermissionsService,
        },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
    repository = module.get<Repository<Property>>(getRepositoryToken(Property));
    permissionsService = module.get<PermissionsService>(PermissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new property when user has permission', async () => {
      const createPropertyDto = {
        title: 'شقة فاخرة في الرياض',
        description: 'شقة فاخرة في قلب الرياض مع إطلالة رائعة',
        property_type: 'apartment',
        status: 'available',
        price: 500000,
        area: 150,
        bedrooms: 3,
        bathrooms: 2,
        parking_spaces: 2,
        floor_number: 5,
        project_id: '123e4567-e89b-12d3-a456-426614174000',
        developer_id: '123e4567-e89b-12d3-a456-426614174001',
        location: 'الرياض، المملكة العربية السعودية',
        address: 'شارع الملك فهد، الرياض',
        latitude: 24.7136,
        longitude: 46.6753,
        images: ['image1.jpg', 'image2.jpg'],
        features: ['مكيف مركزي', 'مصعد', 'مسبح'],
      };

      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174002';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);
      mockRepository.create.mockReturnValue(mockProperty);
      mockRepository.save.mockResolvedValue(mockProperty);

      const result = await service.create(createPropertyDto, userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'properties.create',
      );
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createPropertyDto,
        company_id: companyId,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockProperty);
      expect(result).toEqual(mockProperty);
    });

    it('should throw ForbiddenException when user lacks permission', async () => {
      const createPropertyDto = {
        title: 'شقة فاخرة في الرياض',
        price: 500000,
      };

      const userId = 'user-123';

      mockPermissionsService.checkPermission.mockResolvedValue(false);

      await expect(service.create(createPropertyDto, userId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'properties.create',
      );
    });
  });

  describe('findAll', () => {
    it('should return all properties when user has permission', async () => {
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174002';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);

      const result = await service.findAll(userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'properties.read',
      );
      expect(result).toEqual([mockProperty]);
    });

    it('should throw ForbiddenException when user lacks permission', async () => {
      const userId = 'user-123';

      mockPermissionsService.checkPermission.mockResolvedValue(false);

      await expect(service.findAll(userId)).rejects.toThrow(ForbiddenException);
      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'properties.read',
      );
    });
  });

  describe('findOne', () => {
    it('should return a property when user has permission', async () => {
      const propertyId = '1';
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174002';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);

      const result = await service.findOne(propertyId, userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'properties.read',
      );
      expect(result).toEqual(mockProperty);
    });

    it('should throw ForbiddenException when user lacks permission', async () => {
      const propertyId = '1';
      const userId = 'user-123';

      mockPermissionsService.checkPermission.mockResolvedValue(false);

      await expect(service.findOne(propertyId, userId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'properties.read',
      );
    });
  });

  describe('update', () => {
    it('should update a property when user has permission', async () => {
      const propertyId = '1';
      const updatePropertyDto = {
        title: 'شقة فاخرة محدثة في الرياض',
        price: 550000,
        status: 'reserved',
      };
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174002';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.update(
        propertyId,
        updatePropertyDto,
        userId,
      );

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'properties.update',
      );
      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: propertyId, company_id: companyId },
        updatePropertyDto,
      );
      expect(result).toEqual({ affected: 1 });
    });

    it('should throw ForbiddenException when user lacks permission', async () => {
      const propertyId = '1';
      const updatePropertyDto = { title: 'عنوان محدث' };
      const userId = 'user-123';

      mockPermissionsService.checkPermission.mockResolvedValue(false);

      await expect(
        service.update(propertyId, updatePropertyDto, userId),
      ).rejects.toThrow(ForbiddenException);
      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'properties.update',
      );
    });
  });

  describe('remove', () => {
    it('should remove a property when user has permission', async () => {
      const propertyId = '1';
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174002';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(propertyId, userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'properties.delete',
      );
      expect(mockRepository.delete).toHaveBeenCalledWith({
        id: propertyId,
        company_id: companyId,
      });
      expect(result).toEqual({ affected: 1 });
    });

    it('should throw ForbiddenException when user lacks permission', async () => {
      const propertyId = '1';
      const userId = 'user-123';

      mockPermissionsService.checkPermission.mockResolvedValue(false);

      await expect(service.remove(propertyId, userId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'properties.delete',
      );
    });
  });

  describe('getPropertiesByProject', () => {
    it('should return properties by project when user has permission', async () => {
      const projectId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174002';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);

      const result = await service.getPropertiesByProject(projectId, userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'properties.read',
      );
      expect(result).toEqual([mockProperty]);
    });
  });

  describe('getPropertiesByDeveloper', () => {
    it('should return properties by developer when user has permission', async () => {
      const developerId = '123e4567-e89b-12d3-a456-426614174001';
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174002';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);

      const result = await service.getPropertiesByDeveloper(
        developerId,
        userId,
      );

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'properties.read',
      );
      expect(result).toEqual([mockProperty]);
    });
  });

  describe('getPropertiesByProjectAndDeveloper', () => {
    it('should return properties by project and developer when user has permission', async () => {
      const projectId = '123e4567-e89b-12d3-a456-426614174000';
      const developerId = '123e4567-e89b-12d3-a456-426614174001';
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174002';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);

      const result = await service.getPropertiesByProjectAndDeveloper(
        projectId,
        developerId,
        userId,
      );

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'properties.read',
      );
      expect(result).toEqual([mockProperty]);
    });
  });

  describe('updateStatus', () => {
    it('should update property status when user has permission', async () => {
      const propertyId = '1';
      const status = 'sold';
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174002';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateStatus(propertyId, status, userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'properties.update',
      );
      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: propertyId, company_id: companyId },
        { status },
      );
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('incrementView', () => {
    it('should increment property view count when user has permission', async () => {
      const propertyId = '1';
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174002';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.incrementView(propertyId, userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'properties.update',
      );
      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: propertyId, company_id: companyId },
        { view_count: expect.any(Function) },
      );
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('incrementInquiry', () => {
    it('should increment property inquiry count when user has permission', async () => {
      const propertyId = '1';
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174002';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.incrementInquiry(propertyId, userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'properties.update',
      );
      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: propertyId, company_id: companyId },
        { inquiry_count: expect.any(Function) },
      );
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('searchProperties', () => {
    it('should search properties when user has permission', async () => {
      const searchParams = {
        property_type: 'apartment',
        min_price: 300000,
        max_price: 800000,
        location: 'الرياض',
      };
      const userId = 'user-123';
      const companyId = '123e4567-e89b-12d3-a456-426614174002';

      mockPermissionsService.checkPermission.mockResolvedValue(true);
      mockPermissionsService.getCompanyId.mockResolvedValue(companyId);

      const result = await service.searchProperties(searchParams, userId);

      expect(mockPermissionsService.checkPermission).toHaveBeenCalledWith(
        userId,
        'properties.read',
      );
      expect(result).toEqual([mockProperty]);
    });
  });
});
