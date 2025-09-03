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
import { DealsService } from './deals.service';
import {
  Deal,
  DealStage,
  DealPriority,
  DealType,
} from './entities/deal.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { User } from '../auth/decorators/user.decorator';

class CreateDealDto {
  title: string;
  description?: string;
  amount: number;
  currency?: string;
  stage?: DealStage;
  priority?: DealPriority;
  deal_type?: DealType;
  probability?: number;
  expected_close_date?: Date;
  commission_percentage?: number;
  commission_amount?: number;
  notes?: string;
  requirements?: Record<string, any>;
  competitors?: Record<string, any>;
  custom_fields?: Record<string, any>;
  lead_id?: string;
  property_id?: string;
  assigned_to_id?: string;
  documents?: string[];
}

class UpdateDealDto {
  title?: string;
  description?: string;
  amount?: number;
  currency?: string;
  stage?: DealStage;
  priority?: DealPriority;
  deal_type?: DealType;
  probability?: number;
  expected_close_date?: Date;
  actual_close_date?: Date;
  commission_percentage?: number;
  commission_amount?: number;
  notes?: string;
  requirements?: Record<string, any>;
  competitors?: Record<string, any>;
  custom_fields?: Record<string, any>;
  lead_id?: string;
  property_id?: string;
  assigned_to_id?: string;
  documents?: string[];
  is_active?: boolean;
}

@ApiTags('Deals')
@Controller('deals')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Post()
  @Permissions('deals.create')
  @ApiOperation({ summary: 'Create a new deal' })
  @ApiResponse({
    status: 201,
    description: 'Deal created successfully',
    type: Deal,
  })
  async create(
    @Body() createDealDto: CreateDealDto,
    @User('companyId') companyId: string,
    @User('id') userId: string,
  ): Promise<Deal> {
    return this.dealsService.create(
      { ...createDealDto, company_id: companyId },
      userId,
    );
  }

  @Get()
  @Permissions('deals.read')
  @ApiOperation({ summary: 'Get all deals for company' })
  @ApiResponse({
    status: 200,
    description: 'Deals retrieved successfully',
    type: [Deal],
  })
  @ApiQuery({ name: 'stage', required: false, enum: DealStage })
  @ApiQuery({ name: 'priority', required: false, enum: DealPriority })
  @ApiQuery({ name: 'type', required: false, enum: DealType })
  @ApiQuery({ name: 'assigned_to', required: false })
  @ApiQuery({ name: 'overdue', required: false, type: Boolean })
  @ApiQuery({ name: 'upcoming', required: false, type: Number })
  @ApiQuery({ name: 'min_amount', required: false, type: Number })
  @ApiQuery({ name: 'max_amount', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @User('companyId') companyId: string,
    @User('id') userId: string,
    @Query('stage') stage?: DealStage,
    @Query('priority') priority?: DealPriority,
    @Query('type') dealType?: DealType,
    @Query('assigned_to') assignedTo?: string,
    @Query('overdue') overdue?: string,
    @Query('upcoming') upcomingDays?: string,
    @Query('min_amount') minAmount?: string,
    @Query('max_amount') maxAmount?: string,
    @Query('search') search?: string,
  ): Promise<Deal[]> {
    // Handle different query types
    if (stage) {
      return this.dealsService.getDealsByStage(companyId, stage);
    }

    if (priority) {
      return this.dealsService.getDealsByPriority(companyId, priority);
    }

    if (dealType) {
      return this.dealsService.getDealsByType(companyId, dealType);
    }

    if (assignedTo) {
      return this.dealsService.getDealsByAssignee(companyId, assignedTo);
    }

    if (overdue === 'true') {
      return this.dealsService.getOverdueDeals(companyId, userId);
    }

    if (upcomingDays) {
      return this.dealsService.getUpcomingDeals(
        companyId,
        parseInt(upcomingDays),
      );
    }

    if (minAmount && maxAmount) {
      return this.dealsService.getDealsByAmountRange(
        companyId,
        userId,
        parseFloat(minAmount),
        parseFloat(maxAmount),
      );
    }

    if (search) {
      return this.dealsService.searchDeals(companyId, userId, search);
    }

    return this.dealsService.findAll(companyId, userId);
  }

  @Get('stats')
  @Permissions('deals.read')
  @ApiOperation({ summary: 'Get deal statistics' })
  @ApiResponse({
    status: 200,
    description: 'Deal statistics retrieved successfully',
  })
  async getDealStats(
    @User('companyId') companyId: string,
    @User('id') userId: string,
  ) {
    return this.dealsService.getDealStats(companyId, userId);
  }

  @Get('pipeline')
  @Permissions('deals.read')
  @ApiOperation({ summary: 'Get deals pipeline view' })
  @ApiResponse({
    status: 200,
    description: 'Pipeline view retrieved successfully',
  })
  async getPipelineView(
    @User('companyId') companyId: string,
    @User('id') userId: string,
  ) {
    return this.dealsService.getPipelineView(companyId, userId);
  }

  @Get('overdue')
  @Permissions('deals.read')
  @ApiOperation({ summary: 'Get overdue deals' })
  @ApiResponse({
    status: 200,
    description: 'Overdue deals retrieved successfully',
    type: [Deal],
  })
  async getOverdueDeals(
    @User('companyId') companyId: string,
    @User('id') userId: string,
  ): Promise<Deal[]> {
    return this.dealsService.getOverdueDeals(companyId, userId);
  }

  @Get('upcoming/:days')
  @Permissions('deals.read')
  @ApiOperation({ summary: 'Get upcoming deals' })
  @ApiResponse({
    status: 200,
    description: 'Upcoming deals retrieved successfully',
    type: [Deal],
  })
  async getUpcomingDeals(
    @Param('days') days: string,
    @User('companyId') companyId: string,
  ): Promise<Deal[]> {
    return this.dealsService.getUpcomingDeals(companyId, parseInt(days));
  }

  @Get(':id')
  @Permissions('deals.read')
  @ApiOperation({ summary: 'Get deal by ID' })
  @ApiResponse({
    status: 200,
    description: 'Deal retrieved successfully',
    type: Deal,
  })
  @ApiResponse({ status: 404, description: 'Deal not found' })
  async findOne(
    @Param('id') id: string,
    @User('id') userId: string,
  ): Promise<Deal> {
    return this.dealsService.findOne(id, userId);
  }

  @Patch(':id')
  @Permissions('deals.update')
  @ApiOperation({ summary: 'Update deal' })
  @ApiResponse({
    status: 200,
    description: 'Deal updated successfully',
    type: Deal,
  })
  async update(
    @Param('id') id: string,
    @Body() updateDealDto: UpdateDealDto,
    @User('id') userId: string,
  ): Promise<Deal> {
    return this.dealsService.update(id, updateDealDto, userId);
  }

  @Patch(':id/stage')
  @Permissions('deals.update')
  @ApiOperation({ summary: 'Update deal stage' })
  @ApiResponse({
    status: 200,
    description: 'Deal stage updated successfully',
    type: Deal,
  })
  async updateStage(
    @Param('id') id: string,
    @Body() body: { stage: DealStage },
    @User('id') userId: string,
  ): Promise<Deal> {
    return this.dealsService.updateDealStage(id, userId, body.stage);
  }

  @Patch(':id/assign')
  @Permissions('deals.update')
  @ApiOperation({ summary: 'Assign deal to user' })
  @ApiResponse({
    status: 200,
    description: 'Deal assigned successfully',
    type: Deal,
  })
  async assignDeal(
    @Param('id') id: string,
    @Body() body: { userId: string },
    @User('id') userId: string,
  ): Promise<Deal> {
    return this.dealsService.assignDeal(id, body.userId);
  }

  @Delete(':id')
  @Permissions('deals.delete')
  @ApiOperation({ summary: 'Delete deal' })
  @ApiResponse({ status: 200, description: 'Deal deleted successfully' })
  async remove(
    @Param('id') id: string,
    @User('id') userId: string,
  ): Promise<{ message: string }> {
    await this.dealsService.remove(id, userId);
    return { message: 'Deal deleted successfully' };
  }

  @Get('by-unit/:unitId')
  @Permissions('deals.read')
  @ApiOperation({ summary: 'Get deals by unit' })
  @ApiResponse({
    status: 200,
    description: 'Deals retrieved successfully',
    type: [Deal],
  })
  async getDealsByUnit(
    @Param('unitId') unitId: string,
    @User('companyId') companyId: string,
  ): Promise<Deal[]> {
    return this.dealsService.getDealsByUnit(companyId, unitId);
  }

  @Get('by-project/:projectId')
  @Permissions('deals.read')
  @ApiOperation({ summary: 'Get deals by project' })
  @ApiResponse({
    status: 200,
    description: 'Deals retrieved successfully',
    type: [Deal],
  })
  async getDealsByProject(
    @Param('projectId') projectId: string,
    @User('companyId') companyId: string,
  ): Promise<Deal[]> {
    return this.dealsService.getDealsByProject(companyId, projectId);
  }

  @Get('by-developer/:developerId')
  @Permissions('deals.read')
  @ApiOperation({ summary: 'Get deals by developer' })
  @ApiResponse({
    status: 200,
    description: 'Deals retrieved successfully',
    type: [Deal],
  })
  async getDealsByDeveloper(
    @Param('developerId') developerId: string,
    @User('companyId') companyId: string,
  ): Promise<Deal[]> {
    return this.dealsService.getDealsByDeveloper(companyId, developerId);
  }
}
