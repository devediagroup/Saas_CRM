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
import { ProjectsService } from './projects.service';
import type { CreateProjectDto, UpdateProjectDto } from './projects.service';
import { Project, ProjectStatus, ProjectType } from './entities/project.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { User } from '../auth/decorators/user.decorator';

@ApiTags('Projects')
@Controller('projects')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @Permissions('projects.create')
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully',
    type: Project,
  })
  @ApiResponse({
    status: 409,
    description: 'Project with this name already exists',
  })
  async create(
    @Body() createProjectDto: CreateProjectDto & { developer_id: string },
    @User('companyId') companyId: string,
    @User('id') userId: string,
  ): Promise<Project> {
    return this.projectsService.create(
      { ...createProjectDto, company_id: companyId },
      userId,
    );
  }

  @Get()
  @Permissions('projects.read')
  @ApiOperation({ summary: 'Get all projects for company' })
  @ApiResponse({
    status: 200,
    description: 'Projects retrieved successfully',
    type: [Project],
  })
  @ApiQuery({ name: 'status', required: false, enum: ProjectStatus })
  @ApiQuery({ name: 'type', required: false, enum: ProjectType })
  @ApiQuery({ name: 'developer', required: false })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'state', required: false })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @User('companyId') companyId: string,
    @User('id') userId: string,
    @Query('status') status?: ProjectStatus,
    @Query('type') type?: ProjectType,
    @Query('developer') developerId?: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('search') search?: string,
  ): Promise<Project[]> {
    // Handle different query types
    if (status) {
      return this.projectsService.getProjectsByStatus(companyId, status);
    }

    if (type) {
      return this.projectsService.getProjectsByType(companyId, type);
    }

    if (developerId) {
      return this.projectsService.getProjectsByDeveloper(
        companyId,
        developerId,
      );
    }

    if (city || state) {
      return this.projectsService.getProjectsByLocation(companyId, city, state);
    }

    if (search) {
      return this.projectsService.searchProjects(companyId, search);
    }

    return this.projectsService.findAll(companyId, userId);
  }

  @Get('stats')
  @Permissions('projects.read')
  @ApiOperation({ summary: 'Get project statistics' })
  @ApiResponse({
    status: 200,
    description: 'Project statistics retrieved successfully',
  })
  async getProjectStats(
    @User('companyId') companyId: string,
    @User('id') userId: string,
  ) {
    return this.projectsService.getProjectStats(companyId, userId);
  }

  @Get('top')
  @Permissions('projects.read')
  @ApiOperation({ summary: 'Get top projects by performance' })
  @ApiResponse({
    status: 200,
    description: 'Top projects retrieved successfully',
    type: [Project],
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTopProjects(
    @User('companyId') companyId: string,
    @User('id') userId: string,
    @Query('limit') limit?: string,
  ): Promise<Project[]> {
    const limitNum = limit ? parseInt(limit) : 5;
    return this.projectsService.getTopProjects(companyId, limitNum, userId);
  }

  @Get('by-status/:status')
  @Permissions('projects.read')
  @ApiOperation({ summary: 'Get projects by status' })
  @ApiResponse({
    status: 200,
    description: 'Projects retrieved successfully',
    type: [Project],
  })
  async getProjectsByStatus(
    @Param('status') status: ProjectStatus,
    @User('companyId') companyId: string,
  ): Promise<Project[]> {
    return this.projectsService.getProjectsByStatus(companyId, status);
  }

  @Get('by-type/:type')
  @Permissions('projects.read')
  @ApiOperation({ summary: 'Get projects by type' })
  @ApiResponse({
    status: 200,
    description: 'Projects retrieved successfully',
    type: [Project],
  })
  async getProjectsByType(
    @Param('type') type: ProjectType,
    @User('companyId') companyId: string,
  ): Promise<Project[]> {
    return this.projectsService.getProjectsByType(companyId, type);
  }

  @Get('by-developer/:developerId')
  @Permissions('projects.read')
  @ApiOperation({ summary: 'Get projects by developer' })
  @ApiResponse({
    status: 200,
    description: 'Projects retrieved successfully',
    type: [Project],
  })
  async getProjectsByDeveloper(
    @Param('developerId') developerId: string,
    @User('companyId') companyId: string,
  ): Promise<Project[]> {
    return this.projectsService.getProjectsByDeveloper(companyId, developerId);
  }

  @Get('by-location')
  @Permissions('projects.read')
  @ApiOperation({ summary: 'Get projects by location' })
  @ApiResponse({
    status: 200,
    description: 'Projects retrieved successfully',
    type: [Project],
  })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'state', required: false })
  async getProjectsByLocation(
    @User('companyId') companyId: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
  ): Promise<Project[]> {
    return this.projectsService.getProjectsByLocation(companyId, city, state);
  }

  @Get('by-date-range')
  @Permissions('projects.read')
  @ApiOperation({ summary: 'Get projects by date range' })
  @ApiResponse({
    status: 200,
    description: 'Projects retrieved successfully',
    type: [Project],
  })
  @ApiQuery({ name: 'start_date', required: true, type: Date })
  @ApiQuery({ name: 'end_date', required: true, type: Date })
  async getProjectsByDateRange(
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @User('companyId') companyId: string,
  ): Promise<Project[]> {
    return this.projectsService.getProjectsByDateRange(
      companyId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('by-investment-range')
  @Permissions('projects.read')
  @ApiOperation({ summary: 'Get projects by investment range' })
  @ApiResponse({
    status: 200,
    description: 'Projects retrieved successfully',
    type: [Project],
  })
  @ApiQuery({ name: 'min_investment', required: true, type: Number })
  @ApiQuery({ name: 'max_investment', required: true, type: Number })
  async getProjectsByInvestmentRange(
    @Query('min_investment') minInvestment: string,
    @Query('max_investment') maxInvestment: string,
    @User('companyId') companyId: string,
  ): Promise<Project[]> {
    return this.projectsService.getProjectsByInvestmentRange(
      companyId,
      parseFloat(minInvestment),
      parseFloat(maxInvestment),
    );
  }

  @Get('search')
  @Permissions('projects.read')
  @ApiOperation({ summary: 'Search projects' })
  @ApiResponse({
    status: 200,
    description: 'Projects retrieved successfully',
    type: [Project],
  })
  @ApiQuery({ name: 'q', required: true })
  async searchProjects(
    @Query('q') searchTerm: string,
    @User('companyId') companyId: string,
  ): Promise<Project[]> {
    return this.projectsService.searchProjects(companyId, searchTerm);
  }

  @Get(':id')
  @Permissions('projects.read')
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiResponse({
    status: 200,
    description: 'Project retrieved successfully',
    type: Project,
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async findOne(
    @Param('id') id: string,
    @User('id') userId: string,
  ): Promise<Project> {
    return this.projectsService.findOne(id, userId);
  }

  @Patch(':id')
  @Permissions('projects.update')
  @ApiOperation({ summary: 'Update project' })
  @ApiResponse({
    status: 200,
    description: 'Project updated successfully',
    type: Project,
  })
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @User('id') userId: string,
  ): Promise<Project> {
    return this.projectsService.update(id, updateProjectDto, userId);
  }

  @Patch(':id/status')
  @Permissions('projects.update')
  @ApiOperation({ summary: 'Update project status' })
  @ApiResponse({
    status: 200,
    description: 'Project status updated successfully',
    type: Project,
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: ProjectStatus },
    @User('id') userId: string,
  ): Promise<Project> {
    return this.projectsService.updateProjectStatus(id, userId, body.status);
  }

  @Patch(':id/progress')
  @Permissions('projects.update')
  @ApiOperation({ summary: 'Update project progress' })
  @ApiResponse({
    status: 200,
    description: 'Project progress updated successfully',
    type: Project,
  })
  async updateProgress(
    @Param('id') id: string,
    @Body()
    progressUpdate: {
      date: Date;
      description: string;
      percentage: number;
      images?: string[];
    },
    @User('id') userId: string,
  ): Promise<Project> {
    return this.projectsService.updateProgress(id, userId, progressUpdate);
  }

  @Post(':id/milestones')
  @Permissions('projects.update')
  @ApiOperation({ summary: 'Add milestone to project' })
  @ApiResponse({
    status: 201,
    description: 'Milestone added successfully',
    type: Project,
  })
  async addMilestone(
    @Param('id') id: string,
    @Body()
    milestone: {
      name: string;
      description: string;
      target_date: Date;
      status: 'pending' | 'in_progress' | 'completed' | 'delayed';
    },
    @User('id') userId: string,
  ): Promise<Project> {
    return this.projectsService.addMilestone(id, userId, milestone);
  }

  @Patch(':id/milestones/:milestoneIndex')
  @Permissions('projects.update')
  @ApiOperation({ summary: 'Update project milestone' })
  @ApiResponse({
    status: 200,
    description: 'Milestone updated successfully',
    type: Project,
  })
  async updateMilestone(
    @Param('id') id: string,
    @Param('milestoneIndex') milestoneIndex: string,
    @Body()
    updates: Partial<{
      name: string;
      description: string;
      target_date: Date;
      completed_date: Date;
      status: 'pending' | 'in_progress' | 'completed' | 'delayed';
    }>,
    @User('id') userId: string,
  ): Promise<Project> {
    return this.projectsService.updateMilestone(
      id,
      parseInt(milestoneIndex),
      updates,
      userId,
    );
  }

  @Delete(':id')
  @Permissions('projects.delete')
  @ApiOperation({ summary: 'Delete project' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully' })
  async remove(
    @Param('id') id: string,
    @User('id') userId: string,
  ): Promise<{ message: string }> {
    await this.projectsService.remove(id, userId);
    return { message: 'Project deleted successfully' };
  }
}
