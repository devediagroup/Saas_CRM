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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { DevelopersService } from './developers.service';
import type {
  CreateDeveloperDto,
  UpdateDeveloperDto,
} from './developers.service';
import {
  Developer,
  DeveloperStatus,
  DeveloperType,
} from './entities/developer.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { User } from '../auth/decorators/user.decorator';

@ApiTags('Developers')
@Controller('developers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class DevelopersController {
  constructor(private readonly developersService: DevelopersService) {}

  @Post()
  @Permissions('developers.create')
  @ApiOperation({ summary: 'Create a new developer' })
  @ApiResponse({
    status: 201,
    description: 'Developer created successfully',
    type: Developer,
  })
  @ApiResponse({
    status: 409,
    description: 'Developer with this name already exists',
  })
  async create(
    @Body() createDeveloperDto: CreateDeveloperDto,
    @User('companyId') companyId: string,
    @User('id') userId: string,
  ): Promise<Developer> {
    return this.developersService.create(
      { ...createDeveloperDto, company_id: companyId },
      userId,
    );
  }

  @Get()
  @Permissions('developers.read')
  @ApiOperation({ summary: 'Get all developers for company' })
  @ApiResponse({
    status: 200,
    description: 'Developers retrieved successfully',
    type: [Developer],
  })
  @ApiQuery({ name: 'status', required: false, enum: DeveloperStatus })
  @ApiQuery({ name: 'type', required: false, enum: DeveloperType })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'state', required: false })
  @ApiQuery({ name: 'specialization', required: false })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @User('companyId') companyId: string,
    @User('id') userId: string,
    @Query('status') status?: DeveloperStatus,
    @Query('type') type?: DeveloperType,
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('specialization') specialization?: string,
    @Query('search') search?: string,
  ): Promise<Developer[]> {
    // Handle different query types
    if (status) {
      return this.developersService.getDevelopersByStatus(companyId, status);
    }

    if (type) {
      return this.developersService.getDevelopersByType(companyId, type);
    }

    if (city || state) {
      return this.developersService.getDevelopersByLocation(
        companyId,
        userId,
        city,
        state,
      );
    }

    if (specialization) {
      return this.developersService.getDevelopersBySpecialization(
        companyId,
        userId,
        specialization,
      );
    }

    if (search) {
      return this.developersService.searchDevelopers(companyId, userId, search);
    }

    return this.developersService.findAll(companyId, userId);
  }

  @Get('stats')
  @Permissions('developers.read')
  @ApiOperation({ summary: 'Get developer statistics' })
  @ApiResponse({
    status: 200,
    description: 'Developer statistics retrieved successfully',
  })
  async getDeveloperStats(
    @User('companyId') companyId: string,
    @User('id') userId: string,
  ) {
    return this.developersService.getDeveloperStats(companyId, userId);
  }

  @Get('top')
  @Permissions('developers.read')
  @ApiOperation({ summary: 'Get top developers by performance' })
  @ApiResponse({
    status: 200,
    description: 'Top developers retrieved successfully',
    type: [Developer],
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTopDevelopers(
    @User('companyId') companyId: string,
    @User('id') userId: string,
    @Query('limit') limit?: string,
  ): Promise<Developer[]> {
    const limitNum = limit ? parseInt(limit) : 5;
    return this.developersService.getTopDevelopers(companyId, limitNum, userId);
  }

  @Get('by-status/:status')
  @Permissions('developers.read')
  @ApiOperation({ summary: 'Get developers by status' })
  @ApiResponse({
    status: 200,
    description: 'Developers retrieved successfully',
    type: [Developer],
  })
  async getDevelopersByStatus(
    @Param('status') status: DeveloperStatus,
    @User('companyId') companyId: string,
  ): Promise<Developer[]> {
    return this.developersService.getDevelopersByStatus(companyId, status);
  }

  @Get('by-type/:type')
  @Permissions('developers.read')
  @ApiOperation({ summary: 'Get developers by type' })
  @ApiResponse({
    status: 200,
    description: 'Developers retrieved successfully',
    type: [Developer],
  })
  async getDevelopersByType(
    @Param('type') type: DeveloperType,
    @User('companyId') companyId: string,
  ): Promise<Developer[]> {
    return this.developersService.getDevelopersByType(companyId, type);
  }

  @Get('by-location')
  @Permissions('developers.read')
  @ApiOperation({ summary: 'Get developers by location' })
  @ApiResponse({
    status: 200,
    description: 'Developers retrieved successfully',
    type: [Developer],
  })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'state', required: false })
  async getDevelopersByLocation(
    @User('companyId') companyId: string,
    @User('id') userId: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
  ): Promise<Developer[]> {
    return this.developersService.getDevelopersByLocation(
      companyId,
      userId,
      city,
      state,
    );
  }

  @Get('by-specialization/:specialization')
  @Permissions('developers.read')
  @ApiOperation({ summary: 'Get developers by specialization' })
  @ApiResponse({
    status: 200,
    description: 'Developers retrieved successfully',
    type: [Developer],
  })
  async getDevelopersBySpecialization(
    @Param('specialization') specialization: string,
    @User('companyId') companyId: string,
    @User('id') userId: string,
  ): Promise<Developer[]> {
    return this.developersService.getDevelopersBySpecialization(
      companyId,
      userId,
      specialization,
    );
  }

  @Get('search')
  @Permissions('developers.read')
  @ApiOperation({ summary: 'Search developers' })
  @ApiResponse({
    status: 200,
    description: 'Developers retrieved successfully',
    type: [Developer],
  })
  @ApiQuery({ name: 'q', required: true })
  async searchDevelopers(
    @Query('q') searchTerm: string,
    @User('companyId') companyId: string,
    @User('id') userId: string,
  ): Promise<Developer[]> {
    return this.developersService.searchDevelopers(
      companyId,
      userId,
      searchTerm,
    );
  }

  @Get(':id')
  @Permissions('developers.read')
  @ApiOperation({ summary: 'Get developer by ID' })
  @ApiResponse({
    status: 200,
    description: 'Developer retrieved successfully',
    type: Developer,
  })
  @ApiResponse({ status: 404, description: 'Developer not found' })
  async findOne(
    @Param('id') id: string,
    @User('id') userId: string,
  ): Promise<Developer> {
    return this.developersService.findOne(id, userId);
  }

  @Patch(':id')
  @Permissions('developers.update')
  @ApiOperation({ summary: 'Update developer' })
  @ApiResponse({
    status: 200,
    description: 'Developer updated successfully',
    type: Developer,
  })
  async update(
    @Param('id') id: string,
    @Body() updateDeveloperDto: UpdateDeveloperDto,
    @User('id') userId: string,
  ): Promise<Developer> {
    return this.developersService.update(id, updateDeveloperDto, userId);
  }

  @Patch(':id/status')
  @Permissions('developers.update')
  @ApiOperation({ summary: 'Update developer status' })
  @ApiResponse({
    status: 200,
    description: 'Developer status updated successfully',
    type: Developer,
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: DeveloperStatus },
    @User('id') userId: string,
  ): Promise<Developer> {
    return this.developersService.updateDeveloperStatus(
      id,
      userId,
      body.status,
    );
  }

  @Patch(':id/increment-projects')
  @Permissions('developers.update')
  @ApiOperation({ summary: 'Increment completed projects count' })
  @ApiResponse({
    status: 200,
    description: 'Projects count incremented successfully',
    type: Developer,
  })
  async incrementCompletedProjects(
    @Param('id') id: string,
    @User('id') userId: string,
  ): Promise<Developer> {
    return this.developersService.incrementCompletedProjects(id, userId);
  }

  @Patch(':id/update-investment')
  @Permissions('developers.update')
  @ApiOperation({ summary: 'Update total investment' })
  @ApiResponse({
    status: 200,
    description: 'Investment updated successfully',
    type: Developer,
  })
  async updateTotalInvestment(
    @Param('id') id: string,
    @Body() body: { amount: number },
    @User('id') userId: string,
  ): Promise<Developer> {
    return this.developersService.updateTotalInvestment(
      id,
      userId,
      body.amount,
    );
  }

  @Delete(':id')
  @Permissions('developers.delete')
  @ApiOperation({ summary: 'Delete developer' })
  @ApiResponse({ status: 200, description: 'Developer deleted successfully' })
  async remove(
    @Param('id') id: string,
    @User('id') userId: string,
  ): Promise<{ message: string }> {
    await this.developersService.remove(id, userId);
    return { message: 'Developer deleted successfully' };
  }
}
