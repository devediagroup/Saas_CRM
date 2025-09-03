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
import { LeadsService } from './leads.service';
import { Lead, LeadStatus, LeadPriority } from './entities/lead.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { User } from '../auth/decorators/user.decorator';

class CreateLeadDto {
  first_name: string;
  last_name: string;
  company_name?: string;
  email: string;
  phone?: string;
  mobile?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  website?: string;
  notes?: string;
  budget_min?: number;
  budget_max?: number;
  timeline?: string;
  requirements?: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  tags?: string[];
  custom_fields?: Record<string, any>;
  lead_source_id?: string;
}

class UpdateLeadDto {
  first_name?: string;
  last_name?: string;
  company_name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  website?: string;
  notes?: string;
  budget_min?: number;
  budget_max?: number;
  timeline?: string;
  requirements?: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  tags?: string[];
  custom_fields?: Record<string, any>;
  lead_source_id?: string;
}

@ApiTags('Leads')
@Controller('leads')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @Permissions('leads.create')
  @ApiOperation({ summary: 'Create a new lead' })
  @ApiResponse({
    status: 201,
    description: 'Lead created successfully',
    type: Lead,
  })
  async create(
    @Body() createLeadDto: CreateLeadDto,
    @User('companyId') companyId: string,
    @User('id') userId: string,
  ): Promise<Lead> {
    return this.leadsService.create(
      { ...createLeadDto, company_id: companyId },
      userId,
    );
  }

  @Get()
  @Permissions('leads.read')
  @ApiOperation({ summary: 'Get all leads for company' })
  @ApiResponse({
    status: 200,
    description: 'Leads retrieved successfully',
    type: [Lead],
  })
  @ApiQuery({ name: 'status', required: false, enum: LeadStatus })
  @ApiQuery({ name: 'priority', required: false, enum: LeadPriority })
  @ApiQuery({ name: 'assigned_to', required: false })
  async findAll(
    @User('companyId') companyId: string,
    @User('id') userId: string,
    @Query('status') status?: LeadStatus,
    @Query('priority') priority?: LeadPriority,
    @Query('assigned_to') assignedTo?: string,
    @Query('search') search?: string,
  ): Promise<Lead[]> {
    if (status) {
      return this.leadsService.getLeadsByStatus(companyId, status);
    }

    if (priority) {
      return this.leadsService.getLeadsByPriority(companyId, priority);
    }

    if (assignedTo) {
      return this.leadsService.getLeadsByAssignee(companyId, assignedTo);
    }

    if (search) {
      return this.leadsService.searchLeads(companyId, userId, search);
    }

    return this.leadsService.findAll(companyId, userId);
  }

  @Get('stats')
  @Permissions('leads.read')
  @ApiOperation({ summary: 'Get lead statistics' })
  @ApiResponse({
    status: 200,
    description: 'Lead statistics retrieved successfully',
  })
  async getLeadStats(
    @User('companyId') companyId: string,
    @User('id') userId: string,
  ) {
    return this.leadsService.getLeadStats(companyId, userId);
  }

  @Get(':id')
  @Permissions('leads.read')
  @ApiOperation({ summary: 'Get lead by ID' })
  @ApiResponse({
    status: 200,
    description: 'Lead retrieved successfully',
    type: Lead,
  })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  async findOne(
    @Param('id') id: string,
    @User('id') userId: string,
  ): Promise<Lead> {
    return this.leadsService.findOne(id, userId);
  }

  @Patch(':id')
  @Permissions('leads.update')
  @ApiOperation({ summary: 'Update lead' })
  @ApiResponse({
    status: 200,
    description: 'Lead updated successfully',
    type: Lead,
  })
  async update(
    @Param('id') id: string,
    @Body() updateLeadDto: UpdateLeadDto,
    @User('id') userId: string,
  ): Promise<Lead> {
    return this.leadsService.update(id, updateLeadDto, userId);
  }

  @Patch(':id/assign')
  @Permissions('leads.update')
  @ApiOperation({ summary: 'Assign lead to user' })
  @ApiResponse({
    status: 200,
    description: 'Lead assigned successfully',
    type: Lead,
  })
  async assignLead(
    @Param('id') id: string,
    @Body() body: { userId: string },
    @User('id') userId: string,
  ): Promise<Lead> {
    return this.leadsService.assignLead(id, body.userId);
  }

  @Patch(':id/status')
  @Permissions('leads.update')
  @ApiOperation({ summary: 'Update lead status' })
  @ApiResponse({
    status: 200,
    description: 'Lead status updated successfully',
    type: Lead,
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: LeadStatus },
    @User('id') userId: string,
  ): Promise<Lead> {
    return this.leadsService.updateLeadStatus(id, userId, body.status);
  }

  @Patch(':id/priority')
  @Permissions('leads.update')
  @ApiOperation({ summary: 'Update lead priority' })
  @ApiResponse({
    status: 200,
    description: 'Lead priority updated successfully',
    type: Lead,
  })
  async updatePriority(
    @Param('id') id: string,
    @Body() body: { priority: LeadPriority },
    @User('id') userId: string,
  ): Promise<Lead> {
    return this.leadsService.updateLeadPriority(id, userId, body.priority);
  }

  @Delete(':id')
  @Permissions('leads.delete')
  @ApiOperation({ summary: 'Delete lead' })
  @ApiResponse({ status: 200, description: 'Lead deleted successfully' })
  async remove(
    @Param('id') id: string,
    @User('id') userId: string,
  ): Promise<{ message: string }> {
    await this.leadsService.remove(id, userId);
    return { message: 'Lead deleted successfully' };
  }

  @Get('by-unit/:unitId')
  @Permissions('leads.read')
  @ApiOperation({ summary: 'Get leads by unit' })
  @ApiResponse({
    status: 200,
    description: 'Leads retrieved successfully',
    type: [Lead],
  })
  async getLeadsByUnit(
    @Param('unitId') unitId: string,
    @User('companyId') companyId: string,
    @User('id') userId: string,
  ): Promise<Lead[]> {
    return this.leadsService.getLeadsByUnit(companyId, userId, unitId);
  }

  @Get('by-project/:projectId')
  @Permissions('leads.read')
  @ApiOperation({ summary: 'Get leads by project' })
  @ApiResponse({
    status: 200,
    description: 'Leads retrieved successfully',
    type: [Lead],
  })
  async getLeadsByProject(
    @Param('projectId') projectId: string,
    @User('companyId') companyId: string,
    @User('id') userId: string,
  ): Promise<Lead[]> {
    return this.leadsService.getLeadsByProject(companyId, userId, projectId);
  }

  @Get('by-developer/:developerId')
  @Permissions('leads.read')
  @ApiOperation({ summary: 'Get leads by developer' })
  @ApiResponse({
    status: 200,
    description: 'Leads retrieved successfully',
    type: [Lead],
  })
  async getLeadsByDeveloper(
    @Param('developerId') developerId: string,
    @User('companyId') companyId: string,
    @User('id') userId: string,
  ): Promise<Lead[]> {
    return this.leadsService.getLeadsByDeveloper(
      companyId,
      userId,
      developerId,
    );
  }
}
