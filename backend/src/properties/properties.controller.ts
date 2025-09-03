import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseEnumPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import {
  Property,
  PropertyType,
  PropertyStatus,
  ListingType,
} from './entities/property.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
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
  project_id?: string;
  developer_id?: string;
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
  project_id?: string;
  developer_id?: string;
}

@ApiTags('Properties')
@Controller('properties')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @Permissions('properties.create')
  @ApiOperation({ summary: 'Create a new property' })
  @ApiResponse({
    status: 201,
    description: 'Property created successfully',
    type: Property,
  })
  async create(
    @Body() createPropertyDto: CreatePropertyDto,
    @User('companyId') companyId: string,
    @User('id') userId: string,
  ): Promise<Property> {
    return this.propertiesService.create(
      { ...createPropertyDto, company_id: companyId },
      userId,
    );
  }

  @Get()
  @Permissions('properties.read')
  @ApiOperation({ summary: 'Get all properties for company' })
  @ApiResponse({
    status: 200,
    description: 'Properties retrieved successfully',
    type: [Property],
  })
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
    @User('id') userId: string,
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
      return this.propertiesService.getPropertiesByType(
        companyId,
        propertyType,
      );
    }

    if (listingType) {
      return this.propertiesService.getPropertiesByListingType(
        companyId,
        listingType,
      );
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
        userId,
        parseFloat(minPrice),
        parseFloat(maxPrice),
        listing,
      );
    }

    if (minArea && maxArea) {
      return this.propertiesService.getPropertiesByAreaRange(
        companyId,
        userId,
        parseFloat(minArea),
        parseFloat(maxArea),
      );
    }

    if (search) {
      return this.propertiesService.searchProperties(companyId, userId, search);
    }

    return this.propertiesService.findAll(companyId, userId);
  }

  @Get('stats')
  @Permissions('properties.read')
  @ApiOperation({ summary: 'Get property statistics' })
  @ApiResponse({
    status: 200,
    description: 'Property statistics retrieved successfully',
  })
  async getPropertyStats(
    @User('companyId') companyId: string,
    @User('id') userId: string,
  ) {
    return this.propertiesService.getPropertyStats(companyId, userId);
  }

  @Get('by-project/:projectId')
  @Permissions('properties.read')
  @ApiOperation({ summary: 'Get properties by project' })
  @ApiResponse({
    status: 200,
    description: 'Properties by project retrieved successfully',
    type: [Property],
  })
  async getPropertiesByProject(
    @Param('projectId') projectId: string,
    @User('companyId') companyId: string,
    @User('id') userId: string,
  ): Promise<Property[]> {
    return this.propertiesService.getPropertiesByProject(
      companyId,
      userId,
      projectId,
    );
  }

  @Get('by-developer/:developerId')
  @Permissions('properties.read')
  @ApiOperation({ summary: 'Get properties by developer' })
  @ApiResponse({
    status: 200,
    description: 'Properties by developer retrieved successfully',
    type: [Property],
  })
  async getPropertiesByDeveloper(
    @Param('developerId') developerId: string,
    @User('companyId') companyId: string,
    @User('id') userId: string,
  ): Promise<Property[]> {
    return this.propertiesService.getPropertiesByDeveloper(
      companyId,
      userId,
      developerId,
    );
  }

  @Get('by-project-and-developer/:projectId/:developerId')
  @Permissions('properties.read')
  @ApiOperation({ summary: 'Get properties by project and developer' })
  @ApiResponse({
    status: 200,
    description: 'Properties by project and developer retrieved successfully',
    type: [Property],
  })
  async getPropertiesByProjectAndDeveloper(
    @Param('projectId') projectId: string,
    @Param('developerId') developerId: string,
    @User('companyId') companyId: string,
  ): Promise<Property[]> {
    return this.propertiesService.getPropertiesByProjectAndDeveloper(
      companyId,
      projectId,
      developerId,
    );
  }

  @Get(':id')
  @Permissions('properties.read')
  @ApiOperation({ summary: 'Get property by ID' })
  @ApiResponse({
    status: 200,
    description: 'Property retrieved successfully',
    type: Property,
  })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async findOne(
    @Param('id') id: string,
    @User('id') userId: string,
  ): Promise<Property> {
    return this.propertiesService.findOne(id, userId);
  }

  @Patch(':id')
  @Permissions('properties.update')
  @ApiOperation({ summary: 'Update property' })
  @ApiResponse({
    status: 200,
    description: 'Property updated successfully',
    type: Property,
  })
  async update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @User('id') userId: string,
  ): Promise<Property> {
    return this.propertiesService.update(id, updatePropertyDto, userId);
  }

  @Patch(':id/status')
  @Permissions('properties.update')
  @ApiOperation({ summary: 'Update property status' })
  @ApiResponse({
    status: 200,
    description: 'Property status updated successfully',
    type: Property,
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: PropertyStatus },
    @User('id') userId: string,
  ): Promise<Property> {
    return this.propertiesService.updatePropertyStatus(id, userId, body.status);
  }

  @Patch(':id/view')
  @Permissions('properties.update')
  @ApiOperation({ summary: 'Increment property view count' })
  @ApiResponse({
    status: 200,
    description: 'View count incremented successfully',
    type: Property,
  })
  async incrementView(
    @Param('id') id: string,
    @User('id') userId: string,
  ): Promise<Property> {
    return this.propertiesService.incrementViewCount(id, userId);
  }

  @Patch(':id/inquiry')
  @Permissions('properties.update')
  @ApiOperation({ summary: 'Increment property inquiry count' })
  @ApiResponse({
    status: 200,
    description: 'Inquiry count incremented successfully',
    type: Property,
  })
  async incrementInquiry(
    @Param('id') id: string,
    @User('id') userId: string,
  ): Promise<Property> {
    return this.propertiesService.incrementInquiryCount(id, userId);
  }

  @Delete(':id')
  @Permissions('properties.delete')
  @ApiOperation({ summary: 'Delete property' })
  @ApiResponse({ status: 200, description: 'Property deleted successfully' })
  async remove(
    @Param('id') id: string,
    @User('id') userId: string,
  ): Promise<{ message: string }> {
    await this.propertiesService.remove(id, userId);
    return { message: 'Property deleted successfully' };
  }
}
