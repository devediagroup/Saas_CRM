import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property, PropertyType, PropertyStatus, ListingType } from './entities/property.entity';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertiesRepository: Repository<Property>,
  ) {}

  async create(createPropertyDto: Partial<Property>): Promise<Property> {
    const property = this.propertiesRepository.create(createPropertyDto);
    return this.propertiesRepository.save(property);
  }

  async findAll(companyId: string): Promise<Property[]> {
    return this.propertiesRepository.find({
      where: { company_id: companyId },
      relations: ['company'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Property> {
    const property = await this.propertiesRepository.findOne({
      where: { id },
      relations: ['company', 'deals', 'activities'],
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    return property;
  }

  async update(id: string, updatePropertyDto: Partial<Property>): Promise<Property> {
    const property = await this.findOne(id);

    Object.assign(property, updatePropertyDto);
    return this.propertiesRepository.save(property);
  }

  async remove(id: string): Promise<void> {
    const property = await this.findOne(id);
    await this.propertiesRepository.remove(property);
  }

  async getPropertiesByStatus(companyId: string, status: PropertyStatus): Promise<Property[]> {
    return this.propertiesRepository.find({
      where: {
        company_id: companyId,
        status,
      },
      relations: ['company'],
    });
  }

  async getPropertiesByType(companyId: string, propertyType: PropertyType): Promise<Property[]> {
    return this.propertiesRepository.find({
      where: {
        company_id: companyId,
        property_type: propertyType,
      },
      relations: ['company'],
    });
  }

  async getPropertiesByListingType(companyId: string, listingType: ListingType): Promise<Property[]> {
    return this.propertiesRepository.find({
      where: {
        company_id: companyId,
        listing_type: listingType,
      },
      relations: ['company'],
    });
  }

  async getFeaturedProperties(companyId: string): Promise<Property[]> {
    return this.propertiesRepository.find({
      where: {
        company_id: companyId,
        is_featured: true,
      },
      relations: ['company'],
    });
  }

  async updatePropertyStatus(id: string, status: PropertyStatus): Promise<Property> {
    return this.update(id, { status });
  }

  async incrementViewCount(id: string): Promise<Property> {
    const property = await this.findOne(id);
    property.view_count += 1;
    return this.propertiesRepository.save(property);
  }

  async incrementInquiryCount(id: string): Promise<Property> {
    const property = await this.findOne(id);
    property.inquiry_count += 1;
    return this.propertiesRepository.save(property);
  }

  async searchProperties(companyId: string, searchTerm: string): Promise<Property[]> {
    return this.propertiesRepository
      .createQueryBuilder('property')
      .where('property.company_id = :companyId', { companyId })
      .andWhere(
        '(property.title LIKE :search OR property.description LIKE :search OR property.address LIKE :search OR property.city LIKE :search)',
        { search: `%${searchTerm}%` }
      )
      .leftJoinAndSelect('property.company', 'company')
      .getMany();
  }

  async getPropertiesByPriceRange(
    companyId: string,
    minPrice: number,
    maxPrice: number,
    listingType: ListingType = ListingType.SALE
  ): Promise<Property[]> {
    return this.propertiesRepository
      .createQueryBuilder('property')
      .where('property.company_id = :companyId', { companyId })
      .andWhere('property.listing_type = :listingType', { listingType })
      .andWhere('property.price BETWEEN :minPrice AND :maxPrice', { minPrice, maxPrice })
      .leftJoinAndSelect('property.company', 'company')
      .getMany();
  }

  async getPropertiesByAreaRange(
    companyId: string,
    minArea: number,
    maxArea: number
  ): Promise<Property[]> {
    return this.propertiesRepository
      .createQueryBuilder('property')
      .where('property.company_id = :companyId', { companyId })
      .andWhere('property.area BETWEEN :minArea AND :maxArea', { minArea, maxArea })
      .leftJoinAndSelect('property.company', 'company')
      .getMany();
  }

  async getPropertiesByLocation(companyId: string, city?: string, state?: string): Promise<Property[]> {
    const query = this.propertiesRepository
      .createQueryBuilder('property')
      .where('property.company_id = :companyId', { companyId })
      .leftJoinAndSelect('property.company', 'company');

    if (city) {
      query.andWhere('property.city = :city', { city });
    }

    if (state) {
      query.andWhere('property.state = :state', { state });
    }

    return query.getMany();
  }

  async getPropertyStats(companyId: string) {
    const properties = await this.findAll(companyId);

    const stats = {
      total: properties.length,
      byStatus: {
        [PropertyStatus.AVAILABLE]: properties.filter(p => p.status === PropertyStatus.AVAILABLE).length,
        [PropertyStatus.RESERVED]: properties.filter(p => p.status === PropertyStatus.RESERVED).length,
        [PropertyStatus.SOLD]: properties.filter(p => p.status === PropertyStatus.SOLD).length,
        [PropertyStatus.RENTED]: properties.filter(p => p.status === PropertyStatus.RENTED).length,
        [PropertyStatus.UNDER_CONSTRUCTION]: properties.filter(p => p.status === PropertyStatus.UNDER_CONSTRUCTION).length,
        [PropertyStatus.OFF_MARKET]: properties.filter(p => p.status === PropertyStatus.OFF_MARKET).length,
      },
      byType: {
        [PropertyType.APARTMENT]: properties.filter(p => p.property_type === PropertyType.APARTMENT).length,
        [PropertyType.VILLA]: properties.filter(p => p.property_type === PropertyType.VILLA).length,
        [PropertyType.OFFICE]: properties.filter(p => p.property_type === PropertyType.OFFICE).length,
        [PropertyType.SHOP]: properties.filter(p => p.property_type === PropertyType.SHOP).length,
        [PropertyType.LAND]: properties.filter(p => p.property_type === PropertyType.LAND).length,
        [PropertyType.WAREHOUSE]: properties.filter(p => p.property_type === PropertyType.WAREHOUSE).length,
      },
      byListingType: {
        [ListingType.SALE]: properties.filter(p => p.listing_type === ListingType.SALE).length,
        [ListingType.RENT]: properties.filter(p => p.listing_type === ListingType.RENT).length,
      },
      featured: properties.filter(p => p.is_featured).length,
      totalViews: properties.reduce((sum, p) => sum + p.view_count, 0),
      totalInquiries: properties.reduce((sum, p) => sum + p.inquiry_count, 0),
      averagePrice: properties.length > 0 ?
        properties.reduce((sum, p) => sum + p.price, 0) / properties.length : 0,
    };

    return stats;
  }
}
