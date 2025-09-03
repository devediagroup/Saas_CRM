import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import {
  Property,
  PropertyType,
  PropertyStatus,
  ListingType,
} from './entities/property.entity';

describe('PropertiesController', () => {
  let controller: PropertiesController;
  let service: PropertiesService;

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

  const mockPropertiesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getPropertiesByStatus: jest.fn(),
    getPropertiesByType: jest.fn(),
    getPropertiesByListingType: jest.fn(),
    getFeaturedProperties: jest.fn(),
    getPropertiesByLocation: jest.fn(),
    getPropertiesByPriceRange: jest.fn(),
    getPropertiesByAreaRange: jest.fn(),
    searchProperties: jest.fn(),
    getPropertyStats: jest.fn(),
    updatePropertyStatus: jest.fn(),
    incrementViewCount: jest.fn(),
    incrementInquiryCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertiesController],
      providers: [
        {
          provide: PropertiesService,
          useValue: mockPropertiesService,
        },
      ],
    }).compile();

    controller = module.get<PropertiesController>(PropertiesController);
    service = module.get<PropertiesService>(PropertiesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
      };

      mockPropertiesService.create.mockResolvedValue(mockProperty);

      const result = await controller.create(createDto, 'company-id');

      expect(mockPropertiesService.create).toHaveBeenCalledWith({
        ...createDto,
        company_id: 'company-id',
      });
      expect(result).toEqual(mockProperty);
    });
  });

  describe('findAll', () => {
    it('should return all properties', async () => {
      mockPropertiesService.findAll.mockResolvedValue([mockProperty]);

      const result = await controller.findAll('company-id');

      expect(mockPropertiesService.findAll).toHaveBeenCalledWith('company-id');
      expect(result).toEqual([mockProperty]);
    });

    it('should return properties by status', async () => {
      mockPropertiesService.getPropertiesByStatus.mockResolvedValue([
        mockProperty,
      ]);

      const result = await controller.findAll(
        'company-id',
        PropertyStatus.AVAILABLE,
      );

      expect(mockPropertiesService.getPropertiesByStatus).toHaveBeenCalledWith(
        'company-id',
        PropertyStatus.AVAILABLE,
      );
      expect(result).toEqual([mockProperty]);
    });

    it('should return properties by type', async () => {
      mockPropertiesService.getPropertiesByType.mockResolvedValue([
        mockProperty,
      ]);

      const result = await controller.findAll(
        'company-id',
        undefined,
        PropertyType.APARTMENT,
      );

      expect(mockPropertiesService.getPropertiesByType).toHaveBeenCalledWith(
        'company-id',
        PropertyType.APARTMENT,
      );
      expect(result).toEqual([mockProperty]);
    });

    it('should return featured properties', async () => {
      mockPropertiesService.getFeaturedProperties.mockResolvedValue([
        mockProperty,
      ]);

      const result = await controller.findAll(
        'company-id',
        undefined,
        undefined,
        ListingType.SALE,
        'true',
      );

      expect(mockPropertiesService.getFeaturedProperties).toHaveBeenCalledWith(
        'company-id',
      );
      expect(result).toEqual([mockProperty]);
    });

    it('should search properties', async () => {
      mockPropertiesService.searchProperties.mockResolvedValue([mockProperty]);

      const result = await controller.findAll(
        'company-id',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        'test search',
      );

      expect(mockPropertiesService.searchProperties).toHaveBeenCalledWith(
        'company-id',
        'test search',
      );
      expect(result).toEqual([mockProperty]);
    });
  });

  describe('findOne', () => {
    it('should return a property by id', async () => {
      mockPropertiesService.findOne.mockResolvedValue(mockProperty);

      const result = await controller.findOne('test-id');

      expect(mockPropertiesService.findOne).toHaveBeenCalledWith('test-id');
      expect(result).toEqual(mockProperty);
    });
  });

  describe('update', () => {
    it('should update a property', async () => {
      const updateDto = { title: 'Updated Title' };
      const updatedProperty = { ...mockProperty, ...updateDto };

      mockPropertiesService.update.mockResolvedValue(updatedProperty);

      const result = await controller.update('test-id', updateDto);

      expect(mockPropertiesService.update).toHaveBeenCalledWith(
        'test-id',
        updateDto,
      );
      expect(result).toEqual(updatedProperty);
    });
  });

  describe('remove', () => {
    it('should remove a property', async () => {
      mockPropertiesService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('test-id');

      expect(mockPropertiesService.remove).toHaveBeenCalledWith('test-id');
      expect(result).toEqual({ message: 'Property deleted successfully' });
    });
  });

  describe('getPropertyStats', () => {
    it('should return property statistics', async () => {
      const stats = {
        total: 10,
        byStatus: { available: 5, sold: 3, reserved: 2 },
        byType: { apartment: 4, villa: 3, office: 2, shop: 1 },
        featured: 2,
        totalViews: 150,
        totalInquiries: 25,
        averagePrice: 250000,
      };

      mockPropertiesService.getPropertyStats.mockResolvedValue(stats);

      const result = await controller.getPropertyStats('company-id');

      expect(mockPropertiesService.getPropertyStats).toHaveBeenCalledWith(
        'company-id',
      );
      expect(result).toEqual(stats);
    });
  });

  describe('updateStatus', () => {
    it('should update property status', async () => {
      const updatedProperty = { ...mockProperty, status: PropertyStatus.SOLD };

      mockPropertiesService.updatePropertyStatus.mockResolvedValue(
        updatedProperty,
      );

      const result = await controller.updateStatus('test-id', {
        status: PropertyStatus.SOLD,
      });

      expect(mockPropertiesService.updatePropertyStatus).toHaveBeenCalledWith(
        'test-id',
        PropertyStatus.SOLD,
      );
      expect(result).toEqual(updatedProperty);
    });
  });

  describe('incrementView', () => {
    it('should increment property view count', async () => {
      const updatedProperty = { ...mockProperty, view_count: 1 };

      mockPropertiesService.incrementViewCount.mockResolvedValue(
        updatedProperty,
      );

      const result = await controller.incrementView('test-id');

      expect(mockPropertiesService.incrementViewCount).toHaveBeenCalledWith(
        'test-id',
      );
      expect(result).toEqual(updatedProperty);
    });
  });

  describe('incrementInquiry', () => {
    it('should increment property inquiry count', async () => {
      const updatedProperty = { ...mockProperty, inquiry_count: 1 };

      mockPropertiesService.incrementInquiryCount.mockResolvedValue(
        updatedProperty,
      );

      const result = await controller.incrementInquiry('test-id');

      expect(mockPropertiesService.incrementInquiryCount).toHaveBeenCalledWith(
        'test-id',
      );
      expect(result).toEqual(updatedProperty);
    });
  });
});
