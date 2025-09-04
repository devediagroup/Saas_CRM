import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import {
  Property,
  PropertyType,
  PropertyStatus,
  ListingType,
} from './entities/property.entity';
import { CacheKeys, CacheTTL } from '../config/cache.config';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertiesRepository: Repository<Property>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  async create(
    createPropertyDto: Partial<Property>,
    userId: string,
  ): Promise<Property> {
    // Permission check handled by PermissionGuard

    const property = this.propertiesRepository.create(createPropertyDto);
    const savedProperty = await this.propertiesRepository.save(property);

    // Invalidate cache after successful creation
    await this.invalidatePropertiesCache(savedProperty.company_id);

    return savedProperty;
  }

  async findAll(companyId: string, userId: string): Promise<Property[]> {
    // Permission check handled by PermissionGuard

    // Try to get from cache first
    const cacheKey = CacheKeys.PROPERTIES_ALL(companyId);
    const cachedProperties = await this.cacheManager.get<Property[]>(cacheKey);
    if (cachedProperties) {
      console.log(`🎯 Cache HIT for ${cacheKey}`);
      return cachedProperties;
    }

    console.log(`💾 Cache MISS for ${cacheKey}, fetching from database`);

    const properties = await this.propertiesRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.company', 'company')
      .leftJoinAndSelect('property.project', 'project')
      .leftJoinAndSelect('property.developer', 'developer')
      .where('property.company_id = :companyId', { companyId })
      .orderBy('property.created_at', 'DESC')
      .getMany();

    // Cache the result for 30 minutes
    await this.cacheManager.set(cacheKey, properties, CacheTTL.MEDIUM);
    console.log(`💰 Cached ${properties.length} properties with key ${cacheKey}`);

    return properties;
  }

  async findOne(id: string, userId: string): Promise<Property> {
    // Permission check handled by PermissionGuard

    const property = await this.propertiesRepository.findOne({
      where: { id },
      relations: ['company', 'deals', 'activities', 'project', 'developer'],
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    return property;
  }

  async update(
    id: string,
    updatePropertyDto: Partial<Property>,
    userId: string,
  ): Promise<Property> {
    // Permission check handled by PermissionGuard

    const property = await this.findOne(id, userId);

    Object.assign(property, updatePropertyDto);
    const updatedProperty = await this.propertiesRepository.save(property);

    // Invalidate cache after successful update
    await this.invalidatePropertiesCache(updatedProperty.company_id);

    return updatedProperty;
  }

  async remove(id: string, userId: string): Promise<void> {
    // Permission check handled by PermissionGuard

    const property = await this.findOne(id, userId);
    const companyId = property.company_id;

    await this.propertiesRepository.remove(property);

    // Invalidate cache after successful deletion
    await this.invalidatePropertiesCache(companyId);
  }

  async getPropertiesByStatus(
    companyId: string,
    status: PropertyStatus,
  ): Promise<Property[]> {
    return this.propertiesRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.company', 'company')
      .leftJoinAndSelect('property.project', 'project')
      .leftJoinAndSelect('property.developer', 'developer')
      .where('property.company_id = :companyId', { companyId })
      .andWhere('property.status = :status', { status })
      .orderBy('property.created_at', 'DESC')
      .getMany();
  }

  async getPropertiesByType(
    companyId: string,
    propertyType: PropertyType,
  ): Promise<Property[]> {
    return this.propertiesRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.company', 'company')
      .leftJoinAndSelect('property.project', 'project')
      .leftJoinAndSelect('property.developer', 'developer')
      .where('property.company_id = :companyId', { companyId })
      .andWhere('property.property_type = :propertyType', { propertyType })
      .orderBy('property.created_at', 'DESC')
      .getMany();
  }

  async getPropertiesByListingType(
    companyId: string,
    listingType: ListingType,
  ): Promise<Property[]> {
    return this.propertiesRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.company', 'company')
      .leftJoinAndSelect('property.project', 'project')
      .leftJoinAndSelect('property.developer', 'developer')
      .where('property.company_id = :companyId', { companyId })
      .andWhere('property.listing_type = :listingType', { listingType })
      .orderBy('property.created_at', 'DESC')
      .getMany();
  }

  async getFeaturedProperties(companyId: string): Promise<Property[]> {
    return this.propertiesRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.company', 'company')
      .leftJoinAndSelect('property.project', 'project')
      .leftJoinAndSelect('property.developer', 'developer')
      .where('property.company_id = :companyId', { companyId })
      .andWhere('property.is_featured = :featured', { featured: true })
      .orderBy('property.created_at', 'DESC')
      .getMany();
  }

  async updatePropertyStatus(
    id: string,
    userId: string,
    status: PropertyStatus,
  ): Promise<Property> {
    return this.update(id, { status }, userId);
  }

  async incrementViewCount(id: string, userId: string): Promise<Property> {
    const property = await this.findOne(id, userId);
    property.view_count += 1;
    return this.propertiesRepository.save(property);
  }

  async incrementInquiryCount(id: string, userId: string): Promise<Property> {
    const property = await this.findOne(id, userId);
    property.inquiry_count += 1;
    return this.propertiesRepository.save(property);
  }

  async searchProperties(
    companyId: string,
    userId: string,
    searchTerm: string,
  ): Promise<Property[]> {
    // Sanitize search term to prevent SQL injection
    const sanitizedSearchTerm = searchTerm
      .trim()
      .replace(/[^\w\s\-\.\@\+\(\)\[\]]/g, '')
      .substring(0, 100); // Limit length to prevent abuse

    if (!sanitizedSearchTerm) {
      return [];
    }

    return this.propertiesRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.company', 'company')
      .leftJoinAndSelect('property.project', 'project')
      .leftJoinAndSelect('property.developer', 'developer')
      .where('property.company_id = :companyId', { companyId })
      .andWhere(
        '(property.title LIKE :search OR property.description LIKE :search OR property.address LIKE :search OR property.city LIKE :search)',
        { search: `%${sanitizedSearchTerm}%` },
      )
      .orderBy('property.created_at', 'DESC')
      .getMany();
  }

  async getPropertiesByPriceRange(
    companyId: string,
    userId: string,
    minPrice: number,
    maxPrice: number,
    listingType: ListingType = ListingType.SALE,
  ): Promise<Property[]> {
    return this.propertiesRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.company', 'company')
      .leftJoinAndSelect('property.project', 'project')
      .leftJoinAndSelect('property.developer', 'developer')
      .where('property.company_id = :companyId', { companyId })
      .andWhere('property.listing_type = :listingType', { listingType })
      .andWhere('property.price BETWEEN :minPrice AND :maxPrice', {
        minPrice,
        maxPrice,
      })
      .orderBy('property.price', 'ASC')
      .getMany();
  }

  async getPropertiesByAreaRange(
    companyId: string,
    userId: string,
    minArea: number,
    maxArea: number,
  ): Promise<Property[]> {
    return this.propertiesRepository
      .createQueryBuilder('property')
      .where('property.company_id = :companyId', { companyId })
      .andWhere('property.area BETWEEN :minArea AND :maxArea', {
        minArea,
        maxArea,
      })
      .leftJoinAndSelect('property.company', 'company')
      .getMany();
  }

  async getPropertiesByLocation(
    companyId: string,
    userId: string,
    city?: string,
    state?: string,
  ): Promise<Property[]> {
    const query = this.propertiesRepository
      .createQueryBuilder('property')
      .where('property.company_id = :companyId', { companyId })
      .leftJoinAndSelect('property.company', 'company')
      .leftJoinAndSelect('property.project', 'project')
      .leftJoinAndSelect('property.developer', 'developer');

    if (city) {
      query.andWhere('property.city = :city', { city });
    }

    if (state) {
      query.andWhere('property.state = :state', { state });
    }

    return query.getMany();
  }

  async getPropertiesByProject(
    companyId: string,
    userId: string,
    projectId: string,
  ): Promise<Property[]> {
    return this.propertiesRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.company', 'company')
      .leftJoinAndSelect('property.project', 'project')
      .leftJoinAndSelect('property.developer', 'developer')
      .where('property.company_id = :companyId', { companyId })
      .andWhere('property.project_id = :projectId', { projectId })
      .orderBy('property.created_at', 'DESC')
      .getMany();
  }

  async getPropertiesByDeveloper(
    companyId: string,
    userId: string,
    developerId: string,
  ): Promise<Property[]> {
    return this.propertiesRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.company', 'company')
      .leftJoinAndSelect('property.project', 'project')
      .leftJoinAndSelect('property.developer', 'developer')
      .where('property.company_id = :companyId', { companyId })
      .andWhere('property.developer_id = :developerId', { developerId })
      .orderBy('property.created_at', 'DESC')
      .getMany();
  }

  async getPropertiesByProjectAndDeveloper(
    companyId: string,
    projectId: string,
    developerId: string,
  ): Promise<Property[]> {
    return this.propertiesRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.company', 'company')
      .leftJoinAndSelect('property.project', 'project')
      .leftJoinAndSelect('property.developer', 'developer')
      .where('property.company_id = :companyId', { companyId })
      .andWhere('property.project_id = :projectId', { projectId })
      .andWhere('property.developer_id = :developerId', { developerId })
      .orderBy('property.created_at', 'DESC')
      .getMany();
  }

  async getPropertyStats(companyId: string, userId: string) {
    const properties = await this.findAll(companyId, userId);

    const stats = {
      total: properties.length,
      byStatus: {
        [PropertyStatus.AVAILABLE]: properties.filter(
          (p) => p.status === PropertyStatus.AVAILABLE,
        ).length,
        [PropertyStatus.RESERVED]: properties.filter(
          (p) => p.status === PropertyStatus.RESERVED,
        ).length,
        [PropertyStatus.SOLD]: properties.filter(
          (p) => p.status === PropertyStatus.SOLD,
        ).length,
        [PropertyStatus.RENTED]: properties.filter(
          (p) => p.status === PropertyStatus.RENTED,
        ).length,
        [PropertyStatus.UNDER_CONSTRUCTION]: properties.filter(
          (p) => p.status === PropertyStatus.UNDER_CONSTRUCTION,
        ).length,
        [PropertyStatus.OFF_MARKET]: properties.filter(
          (p) => p.status === PropertyStatus.OFF_MARKET,
        ).length,
      },
      byType: {
        [PropertyType.APARTMENT]: properties.filter(
          (p) => p.property_type === PropertyType.APARTMENT,
        ).length,
        [PropertyType.VILLA]: properties.filter(
          (p) => p.property_type === PropertyType.VILLA,
        ).length,
        [PropertyType.OFFICE]: properties.filter(
          (p) => p.property_type === PropertyType.OFFICE,
        ).length,
        [PropertyType.SHOP]: properties.filter(
          (p) => p.property_type === PropertyType.SHOP,
        ).length,
        [PropertyType.LAND]: properties.filter(
          (p) => p.property_type === PropertyType.LAND,
        ).length,
        [PropertyType.WAREHOUSE]: properties.filter(
          (p) => p.property_type === PropertyType.WAREHOUSE,
        ).length,
      },
      byListingType: {
        [ListingType.SALE]: properties.filter(
          (p) => p.listing_type === ListingType.SALE,
        ).length,
        [ListingType.RENT]: properties.filter(
          (p) => p.listing_type === ListingType.RENT,
        ).length,
      },
      featured: properties.filter((p) => p.is_featured).length,
      totalViews: properties.reduce((sum, p) => sum + p.view_count, 0),
      totalInquiries: properties.reduce((sum, p) => sum + p.inquiry_count, 0),
      averagePrice:
        properties.length > 0
          ? properties.reduce((sum, p) => sum + p.price, 0) / properties.length
          : 0,
    };

    return stats;
  }

  /**
   * Helper method to invalidate related cache entries
   * @param companyId Company ID
   */
  private async invalidatePropertiesCache(companyId: string): Promise<void> {
    const cacheKeysToDelete = [
      CacheKeys.PROPERTIES_ALL(companyId),
      CacheKeys.PROPERTIES_STATS(companyId),
      CacheKeys.PROPERTIES_FEATURED(companyId),
      // Invalidate all status-based caches
      ...Object.values(PropertyStatus).map(status => CacheKeys.PROPERTIES_BY_STATUS(companyId, status)),
      // Invalidate all type-based caches  
      ...Object.values(PropertyType).map(type => CacheKeys.PROPERTIES_BY_TYPE(companyId, type)),
    ];

    // Delete all cache entries
    await Promise.all(cacheKeysToDelete.map(key =>
      this.cacheManager.del(key)
        .then(() => console.log(`🗑️ Invalidated cache: ${key}`))
        .catch(err => console.warn(`⚠️ Failed to invalidate cache ${key}:`, err))
    ));
  }
}
