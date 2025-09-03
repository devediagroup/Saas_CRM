import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, Between } from 'typeorm';
import { Project, ProjectStatus, ProjectType } from './entities/project.entity';
import { PermissionsService } from '../auth/services/permissions.service';

export interface CreateProjectDto {
  name: string;
  description?: string;
  type?: ProjectType;
  status?: ProjectStatus;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  start_date?: Date;
  end_date?: Date;
  expected_completion_date?: Date;
  image_url?: string;
  images?: string[];
  videos?: string[];
  documents?: string[];
  total_area?: number;
  total_units?: number;
  total_investment?: number;
  current_investment?: number;
  floors?: number;
  amenities?: string[];
  features?: string[];
  specifications?: Record<string, any>;
  progress_updates?: Array<{
    date: Date;
    description: string;
    percentage: number;
    images?: string[];
  }>;
  team?: Array<{
    name: string;
    role: string;
    contact: string;
  }>;
  milestones?: Array<{
    name: string;
    description: string;
    target_date: Date;
    completed_date?: Date;
    status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  }>;
  custom_fields?: Record<string, any>;
  seo_data?: Record<string, any>;
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {}

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    private permissionsService: PermissionsService,
  ) {}

  async create(
    createProjectDto: CreateProjectDto & {
      company_id: string;
      developer_id: string;
    },
    userId: string,
  ): Promise<Project> {
    // Check if user has permission to create projects
    const hasPermission = await this.permissionsService.hasPermission(
      userId,
      'projects.create',
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to create projects',
      );
    }

    // Check if project with same name exists in company
    const existingProject = await this.projectsRepository.findOne({
      where: {
        name: createProjectDto.name,
        company_id: createProjectDto.company_id,
      },
    });

    if (existingProject) {
      throw new ConflictException(
        'Project with this name already exists in this company',
      );
    }

    const project = this.projectsRepository.create(createProjectDto);
    return this.projectsRepository.save(project);
  }

  async findAll(companyId: string, userId: string): Promise<Project[]> {
    // Check if user has permission to read projects
    const hasPermission = await this.permissionsService.hasPermission(
      userId,
      'projects.read',
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to read projects',
      );
    }

    return this.projectsRepository.find({
      where: { company_id: companyId },
      relations: ['company', 'developer', 'properties'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Project> {
    // Check if user has permission to read projects
    const hasPermission = await this.permissionsService.hasPermission(
      userId,
      'projects.read',
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to read projects',
      );
    }

    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: ['company', 'developer', 'properties'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    userId: string,
  ): Promise<Project> {
    // Check if user has permission to update projects
    const hasPermission = await this.permissionsService.hasPermission(
      userId,
      'projects.update',
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to update projects',
      );
    }

    const project = await this.findOne(id, userId);

    // Check if name is being updated and if it conflicts with existing project
    if (updateProjectDto.name && updateProjectDto.name !== project.name) {
      const existingProject = await this.projectsRepository.findOne({
        where: {
          name: updateProjectDto.name,
          company_id: project.company_id,
          id: { $ne: id } as any, // Exclude current project
        },
      });

      if (existingProject) {
        throw new ConflictException(
          'Project with this name already exists in this company',
        );
      }
    }

    Object.assign(project, updateProjectDto);
    return this.projectsRepository.save(project);
  }

  async remove(id: string, userId: string): Promise<void> {
    // Check if user has permission to delete projects
    const hasPermission = await this.permissionsService.hasPermission(
      userId,
      'projects.delete',
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to delete projects',
      );
    }

    const project = await this.findOne(id, userId);
    await this.projectsRepository.remove(project);
  }

  async getProjectsByStatus(
    companyId: string,
    status: ProjectStatus,
  ): Promise<Project[]> {
    return this.projectsRepository.find({
      where: {
        company_id: companyId,
        status,
      },
      relations: ['company', 'developer', 'properties'],
    });
  }

  async getProjectsByType(
    companyId: string,
    type: ProjectType,
  ): Promise<Project[]> {
    return this.projectsRepository.find({
      where: {
        company_id: companyId,
        type,
      },
      relations: ['company', 'developer', 'properties'],
    });
  }

  async getProjectsByDeveloper(
    companyId: string,
    developerId: string,
  ): Promise<Project[]> {
    return this.projectsRepository.find({
      where: {
        company_id: companyId,
        developer_id: developerId,
      },
      relations: ['company', 'developer', 'properties'],
    });
  }

  async getProjectsByLocation(
    companyId: string,
    city?: string,
    state?: string,
  ): Promise<Project[]> {
    const query = this.projectsRepository
      .createQueryBuilder('project')
      .where('project.company_id = :companyId', { companyId })
      .leftJoinAndSelect('project.company', 'company')
      .leftJoinAndSelect('project.developer', 'developer')
      .leftJoinAndSelect('project.properties', 'properties');

    if (city) {
      query.andWhere('project.city = :city', { city });
    }

    if (state) {
      query.andWhere('project.state = :state', { state });
    }

    return query.getMany();
  }

  async searchProjects(
    companyId: string,
    searchTerm: string,
  ): Promise<Project[]> {
    return this.projectsRepository
      .createQueryBuilder('project')
      .where('project.company_id = :companyId', { companyId })
      .andWhere(
        '(project.name LIKE :search OR project.description LIKE :search OR project.location LIKE :search)',
        { search: `%${searchTerm}%` },
      )
      .leftJoinAndSelect('project.company', 'company')
      .leftJoinAndSelect('project.developer', 'developer')
      .leftJoinAndSelect('project.properties', 'properties')
      .getMany();
  }

  async getProjectsByDateRange(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Project[]> {
    return this.projectsRepository.find({
      where: {
        company_id: companyId,
        start_date: Between(startDate, endDate),
      },
      relations: ['company', 'developer', 'properties'],
    });
  }

  async getProjectsByInvestmentRange(
    companyId: string,
    minInvestment: number,
    maxInvestment: number,
  ): Promise<Project[]> {
    return this.projectsRepository
      .createQueryBuilder('project')
      .where('project.company_id = :companyId', { companyId })
      .andWhere(
        'project.total_investment BETWEEN :minInvestment AND :maxInvestment',
        { minInvestment, maxInvestment },
      )
      .leftJoinAndSelect('project.company', 'company')
      .leftJoinAndSelect('project.developer', 'developer')
      .leftJoinAndSelect('project.properties', 'properties')
      .getMany();
  }

  async getProjectStats(companyId: string, userId: string) {
    const projects = await this.findAll(companyId, userId);

    const stats = {
      total: projects.length,
      byStatus: {
        [ProjectStatus.PLANNING]: projects.filter(
          (p) => p.status === ProjectStatus.PLANNING,
        ).length,
        [ProjectStatus.IN_PROGRESS]: projects.filter(
          (p) => p.status === ProjectStatus.IN_PROGRESS,
        ).length,
        [ProjectStatus.ON_HOLD]: projects.filter(
          (p) => p.status === ProjectStatus.ON_HOLD,
        ).length,
        [ProjectStatus.COMPLETED]: projects.filter(
          (p) => p.status === ProjectStatus.COMPLETED,
        ).length,
        [ProjectStatus.CANCELLED]: projects.filter(
          (p) => p.status === ProjectStatus.CANCELLED,
        ).length,
      },
      byType: {
        [ProjectType.RESIDENTIAL]: projects.filter(
          (p) => p.type === ProjectType.RESIDENTIAL,
        ).length,
        [ProjectType.COMMERCIAL]: projects.filter(
          (p) => p.type === ProjectType.COMMERCIAL,
        ).length,
        [ProjectType.MIXED_USE]: projects.filter(
          (p) => p.type === ProjectType.MIXED_USE,
        ).length,
        [ProjectType.INDUSTRIAL]: projects.filter(
          (p) => p.type === ProjectType.INDUSTRIAL,
        ).length,
        [ProjectType.INFRASTRUCTURE]: projects.filter(
          (p) => p.type === ProjectType.INFRASTRUCTURE,
        ).length,
        [ProjectType.OTHER]: projects.filter(
          (p) => p.type === ProjectType.OTHER,
        ).length,
      },
      totalUnits: projects.reduce((sum, p) => sum + (p.total_units || 0), 0),
      totalArea: projects.reduce(
        (sum, p) => sum + Number(p.total_area || 0),
        0,
      ),
      totalInvestment: projects.reduce(
        (sum, p) => sum + Number(p.total_investment || 0),
        0,
      ),
      currentInvestment: projects.reduce(
        (sum, p) => sum + Number(p.current_investment || 0),
        0,
      ),
      averageCompletion:
        projects.filter((p) => p.status === ProjectStatus.COMPLETED).length > 0
          ? (projects.filter((p) => p.status === ProjectStatus.COMPLETED)
              .length /
              projects.length) *
            100
          : 0,
    };

    return stats;
  }

  async getTopProjects(
    companyId: string,
    limit: number = 5,
    userId: string,
  ): Promise<Project[]> {
    return this.projectsRepository
      .createQueryBuilder('project')
      .where('project.company_id = :companyId', { companyId })
      .andWhere('project.status = :status', {
        status: ProjectStatus.IN_PROGRESS,
      })
      .orderBy('project.total_investment', 'DESC')
      .addOrderBy('project.total_units', 'DESC')
      .limit(limit)
      .leftJoinAndSelect('project.company', 'company')
      .leftJoinAndSelect('project.developer', 'developer')
      .leftJoinAndSelect('project.properties', 'properties')
      .getMany();
  }

  async updateProjectStatus(
    id: string,
    userId: string,
    status: ProjectStatus,
  ): Promise<Project> {
    return this.update(id, { status }, userId);
  }

  async updateProgress(
    id: string,
    userId: string,
    progressUpdate: {
      date: Date;
      description: string;
      percentage: number;
      images?: string[];
    },
  ): Promise<Project> {
    const project = await this.findOne(id, userId);

    if (!project.progress_updates) {
      project.progress_updates = [];
    }

    project.progress_updates.push(progressUpdate);

    // Update status based on percentage
    if (progressUpdate.percentage >= 100) {
      project.status = ProjectStatus.COMPLETED;
      project.actual_completion_date = new Date();
    } else if (progressUpdate.percentage > 0) {
      project.status = ProjectStatus.IN_PROGRESS;
    }

    return this.projectsRepository.save(project);
  }

  async addMilestone(
    id: string,
    userId: string,
    milestone: {
      name: string;
      description: string;
      target_date: Date;
      status: 'pending' | 'in_progress' | 'completed' | 'delayed';
    },
  ): Promise<Project> {
    const project = await this.findOne(id, userId);

    if (!project.milestones) {
      project.milestones = [];
    }

    project.milestones.push(milestone);
    return this.projectsRepository.save(project);
  }

  async updateMilestone(
    id: string,
    milestoneIndex: number,
    updates: Partial<{
      name: string;
      description: string;
      target_date: Date;
      completed_date: Date;
      status: 'pending' | 'in_progress' | 'completed' | 'delayed';
    }>,
    userId: string,
  ): Promise<Project> {
    const project = await this.findOne(id, userId);

    if (!project.milestones || milestoneIndex >= project.milestones.length) {
      throw new NotFoundException('Milestone not found');
    }

    Object.assign(project.milestones[milestoneIndex], updates);
    return this.projectsRepository.save(project);
  }
}
