import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseEnumPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { Property, PropertyType, PropertyStatus, ListingType } from './entities/property.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';

class CreatePropertyDto {
  title: string;
  description: string;
  property_type: PropertyType;
  status?: PropertyStatus;
  listing_type?: ListingType;
  price: number;
  rent_price?: number;
  currency?: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  floor?: number;
  total_floors?: number;
  year_built?: number;
  features?: string[];
  amenities?: string[];
  address: string;
  city: string;
  state?: string;
  country: string;
  zip_code?: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
  videos?: string[];
  documents?: string[];
  virtual_tour?: Record<string, any>;
  is_featured?: boolean;
  available_from?: Date;
  custom_fields?: Record<string, any>;
  seo_data?: Record<string, any>;
}

class UpdatePropertyDto {
  title?: string;
  description?: string;
  property_type?: PropertyType;
  status?: PropertyStatus;
  listing_type?: ListingType;
  price?: number;
  rent_price?: number;
  currency?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  floor?: number;
  total_floors?: number;
  year_built?: number;
  features?: string[];
  amenities?: string[];
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
  videos?: string[];
  documents?: string[];
  virtual_tour?: Record<string, any>;
  is_featured?: boolean;
  available_from?: Date;
  custom_fields?: Record<string, any>;
  seo_data?: Record<string, any>;
}

@ApiTags('Properties')
@Controller('properties')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new property' })
  @ApiResponse({ status: 201, description: 'Property created successfully', type: Property })
  async create(
    @Body() createPropertyDto: CreatePropertyDto,
    @User('companyId') companyId: string,
  ): Promise<Property> {
    return this.propertiesService.create({ ...createPropertyDto, company_id: companyId });
  }

  @Get()
  @ApiOperation({ summary: 'Get all properties for company' })
  @ApiResponse({ status: 200, description: 'Properties retrieved successfully', type: [Property] })
  @ApiQuery({ name: 'status', required: false, enum: PropertyStatus })
  @ApiQuery({ name: 'type', required: false, enum: PropertyType })
  @ApiQuery({ name: 'listing_type', required: false, enum: ListingType })
  @ApiQuery({ name: 'featured', required: false, type: Boolean })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'min_price', required: false, type: Number })
  @ApiQuery({ name: 'max_price', required: false, type: Number })
  @ApiQuery({ name: 'min_area', required: false, type: Number })
  @ApiQuery({ name: 'max_area', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @User('companyId') companyId: string,
    @Query('status') status?: PropertyStatus,
    @Query('type') propertyType?: PropertyType,
    @Query('listing_type') listingType?: ListingType,
    @Query('featured') featured?: string,
    @Query('city') city?: string,
    @Query('min_price') minPrice?: string,
    @Query('max_price') maxPrice?: string,
    @Query('min_area') minArea?: string,
    @Query('max_area') maxArea?: string,
    @Query('search') search?: string,
  ): Promise<Property[]> {
    // Handle different query types
    if (status) {
      return this.propertiesService.getPropertiesByStatus(companyId, status);
    }

    if (propertyType) {
      return this.propertiesService.getPropertiesByType(companyId, propertyType);
    }

    if (listingType) {
      return this.propertiesService.getPropertiesByListingType(companyId, listingType);
    }

    if (featured === 'true') {
      return this.propertiesService.getFeaturedProperties(companyId);
    }

    if (city) {
      return this.propertiesService.getPropertiesByLocation(companyId, city);
    }

    if (minPrice && maxPrice) {
      const listing = listingType || ListingType.SALE;
      return this.propertiesService.getPropertiesByPriceRange(
        companyId,
        parseFloat(minPrice),
        parseFloat(maxPrice),
        listing
      );
    }

    if (minArea && maxArea) {
      return this.propertiesService.getPropertiesByAreaRange(
        companyId,
        parseFloat(minArea),
        parseFloat(maxArea)
      );
    }

    if (search) {
      return this.propertiesService.searchProperties(companyId, search);
    }

    return this.propertiesService.findAll(companyId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get property statistics' })
  @ApiResponse({ status: 200, description: 'Property statistics retrieved successfully' })
  async getPropertyStats(@User('companyId') companyId: string) {
    return this.propertiesService.getPropertyStats(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property by ID' })
  @ApiResponse({ status: 200, description: 'Property retrieved successfully', type: Property })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async findOne(@Param('id') id: string): Promise<Property> {
    return this.propertiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update property' })
  @ApiResponse({ status: 200, description: 'Property updated successfully', type: Property })
  async update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ): Promise<Property> {
    return this.propertiesService.update(id, updatePropertyDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update property status' })
  @ApiResponse({ status: 200, description: 'Property status updated successfully', type: Property })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: PropertyStatus },
  ): Promise<Property> {
    return this.propertiesService.updatePropertyStatus(id, body.status);
  }

  @Patch(':id/view')
  @ApiOperation({ summary: 'Increment property view count' })
  @ApiResponse({ status: 200, description: 'View count incremented successfully', type: Property })
  async incrementView(@Param('id') id: string): Promise<Property> {
    return this.propertiesService.incrementViewCount(id);
  }

  @Patch(':id/inquiry')
  @ApiOperation({ summary: 'Increment property inquiry count' })
  @ApiResponse({ status: 200, description: 'Inquiry count incremented successfully', type: Property })
  async incrementInquiry(@Param('id') id: string): Promise<Property> {
    return this.propertiesService.incrementInquiryCount(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete property' })
  @ApiResponse({ status: 200, description: 'Property deleted successfully' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.propertiesService.remove(id);
    return { message: 'Property deleted successfully' };
  }
}
