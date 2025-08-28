import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertiesService } from './properties.service';
import { Property, PropertyType, PropertyStatus, ListingType } from './entities/property.entity';

describe('PropertiesService', () => {
  let service: PropertiesService;
  let repository: Repository<Property>;

  const mockProperty: Property = {
    id: 'test-id',
    title: 'Test Property',
    description: 'Test Description',
    property_type: PropertyType.APARTMENT,
    status: PropertyStatus.AVAILABLE,
    listing_type: ListingType.SALE,
    price: 100000,
    bedrooms: 2,
    bathrooms: 1,
    area: 100,
    address: 'Test Address',
    city: 'Test City',
    country: 'Test Country',
    company_id: 'company-id',
    created_at: new Date(),
    updated_at: new Date(),
    view_count: 0,
    inquiry_count: 0,
    is_featured: false,
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockProperty]),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        {
          provide: getRepositoryToken(Property),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
    repository = module.get<Repository<Property>>(getRepositoryToken(Property));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a property', async () => {
      const createDto = {
        title: 'New Property',
        description: 'New Description',
        property_type: PropertyType.APARTMENT,
        price: 150000,
        bedrooms: 3,
        bathrooms: 2,
        area: 150,
        address: 'New Address',
        city: 'New City',
        country: 'New Country',
        company_id: 'company-id',
      };

      mockRepository.create.mockReturnValue(mockProperty);
      mockRepository.save.mockResolvedValue(mockProperty);

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockProperty);
      expect(result).toEqual(mockProperty);
    });
  });

  describe('findAll', () => {
    it('should return all properties for a company', async () => {
      mockRepository.find.mockResolvedValue([mockProperty]);

      const result = await service.findAll('company-id');

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { company_id: 'company-id' },
        relations: ['company'],
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual([mockProperty]);
    });
  });

  describe('findOne', () => {
    it('should return a property by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockProperty);

      const result = await service.findOne('test-id');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        relations: ['company', 'deals', 'activities'],
      });
      expect(result).toEqual(mockProperty);
    });

    it('should throw NotFoundException when property not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow('Property with ID nonexistent-id not found');
    });
  });

  describe('update', () => {
    it('should update a property', async () => {
      const updateDto = { title: 'Updated Title' };
      const updatedProperty = { ...mockProperty, ...updateDto };

      mockRepository.findOne.mockResolvedValue(mockProperty);
      mockRepository.save.mockResolvedValue(updatedProperty);

      const result = await service.update('test-id', updateDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        relations: ['company', 'deals', 'activities'],
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedProperty);
      expect(result).toEqual(updatedProperty);
    });
  });

  describe('remove', () => {
    it('should remove a property', async () => {
      mockRepository.findOne.mockResolvedValue(mockProperty);
      mockRepository.remove.mockResolvedValue(mockProperty);

      await service.remove('test-id');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        relations: ['company', 'deals', 'activities'],
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockProperty);
    });
  });

  describe('getPropertiesByStatus', () => {
    it('should return properties by status', async () => {
      mockRepository.find.mockResolvedValue([mockProperty]);

      const result = await service.getPropertiesByStatus('company-id', PropertyStatus.AVAILABLE);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          company_id: 'company-id',
          status: PropertyStatus.AVAILABLE,
        },
        relations: ['company'],
      });
      expect(result).toEqual([mockProperty]);
    });
  });

  describe('getPropertiesByType', () => {
    it('should return properties by type', async () => {
      mockRepository.find.mockResolvedValue([mockProperty]);

      const result = await service.getPropertiesByType('company-id', PropertyType.APARTMENT);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          company_id: 'company-id',
          property_type: PropertyType.APARTMENT,
        },
        relations: ['company'],
      });
      expect(result).toEqual([mockProperty]);
    });
  });

  describe('searchProperties', () => {
    it('should search properties', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockProperty]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.searchProperties('company-id', 'test search');

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('property');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('property.company_id = :companyId', { companyId: 'company-id' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(property.title LIKE :search OR property.description LIKE :search OR property.address LIKE :search OR property.city LIKE :search)',
        { search: '%test search%' }
      );
      expect(result).toEqual([mockProperty]);
    });
  });

  describe('getPropertyStats', () => {
    it('should return property statistics', async () => {
      const properties = [
        { ...mockProperty, status: PropertyStatus.AVAILABLE, property_type: PropertyType.APARTMENT },
        { ...mockProperty, status: PropertyStatus.SOLD, property_type: PropertyType.VILLA },
      ];

      mockRepository.find.mockResolvedValue(properties);

      const result = await service.getPropertyStats('company-id');

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { company_id: 'company-id' },
        relations: ['company'],
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual({
        total: 2,
        byStatus: {
          [PropertyStatus.AVAILABLE]: 1,
          [PropertyStatus.RESERVED]: 0,
          [PropertyStatus.SOLD]: 1,
          [PropertyStatus.RENTED]: 0,
          [PropertyStatus.UNDER_CONSTRUCTION]: 0,
          [PropertyStatus.OFF_MARKET]: 0,
        },
        byType: {
          [PropertyType.APARTMENT]: 1,
          [PropertyType.VILLA]: 1,
          [PropertyType.OFFICE]: 0,
          [PropertyType.SHOP]: 0,
          [PropertyType.LAND]: 0,
          [PropertyType.WAREHOUSE]: 0,
        },
        byListingType: {
          [ListingType.SALE]: 2,
          [ListingType.RENT]: 0,
        },
        featured: 0,
        totalViews: 0,
        totalInquiries: 0,
        averagePrice: 100000,
      });
    });
  });

  describe('updatePropertyStatus', () => {
    it('should update property status', async () => {
      const updatedProperty = { ...mockProperty, status: PropertyStatus.SOLD };

      mockRepository.findOne.mockResolvedValue(mockProperty);
      mockRepository.save.mockResolvedValue(updatedProperty);

      const result = await service.updatePropertyStatus('test-id', PropertyStatus.SOLD);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        relations: ['company', 'deals', 'activities'],
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedProperty);
      expect(result).toEqual(updatedProperty);
    });
  });

  describe('incrementViewCount', () => {
    it('should increment property view count', async () => {
      const updatedProperty = { ...mockProperty, view_count: 1 };

      mockRepository.findOne.mockResolvedValue(mockProperty);
      mockRepository.save.mockResolvedValue(updatedProperty);

      const result = await service.incrementViewCount('test-id');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        relations: ['company', 'deals', 'activities'],
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedProperty);
      expect(result).toEqual(updatedProperty);
    });
  });

  describe('incrementInquiryCount', () => {
    it('should increment property inquiry count', async () => {
      const updatedProperty = { ...mockProperty, inquiry_count: 1 };

      mockRepository.findOne.mockResolvedValue(mockProperty);
      mockRepository.save.mockResolvedValue(updatedProperty);

      const result = await service.incrementInquiryCount('test-id');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        relations: ['company', 'deals', 'activities'],
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedProperty);
      expect(result).toEqual(updatedProperty);
    });
  });
});
