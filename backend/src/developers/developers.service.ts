import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import {
  Developer,
  DeveloperStatus,
  DeveloperType,
} from './entities/developer.entity';
import { PermissionsService } from '../auth/services/permissions.service';

export interface CreateDeveloperDto {
  name: string;
  description?: string;
  type?: DeveloperType;
  status?: DeveloperStatus;
  contact_info?: {
    email?: string;
    phone?: string;
    mobile?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zip_code?: string;
    website?: string;
  };
  logo_url?: string;
  website_url?: string;
  social_media?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  business_hours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  specializations?: string[];
  certifications?: string[];
  awards?: string[];
  years_experience?: number;
  completed_projects?: number;
  total_investment?: number;
  custom_fields?: Record<string, any>;
  seo_data?: Record<string, any>;
}

export interface UpdateDeveloperDto extends Partial<CreateDeveloperDto> {}

@Injectable()
export class DevelopersService {
  constructor(
    @InjectRepository(Developer)
    private developersRepository: Repository<Developer>,
    private permissionsService: PermissionsService,
  ) {}

  async create(
    createDeveloperDto: CreateDeveloperDto & { company_id: string },
    userId: string,
  ): Promise<Developer> {
    // Check if user has permission to create developers
    const hasPermission = await this.permissionsService.hasPermission(
      userId,
      'developers.create',
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to create developers',
      );
    }

    // Check if developer with same name exists in company
    const existingDeveloper = await this.developersRepository.findOne({
      where: {
        name: createDeveloperDto.name,
        company_id: createDeveloperDto.company_id,
      },
    });

    if (existingDeveloper) {
      throw new ConflictException(
        'Developer with this name already exists in this company',
      );
    }

    const developer = this.developersRepository.create(createDeveloperDto);
    return this.developersRepository.save(developer);
  }

  async findAll(companyId: string, userId: string): Promise<Developer[]> {
    // Check if user has permission to read developers
    const hasPermission = await this.permissionsService.hasPermission(
      userId,
      'developers.read',
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to read developers',
      );
    }

    return this.developersRepository.find({
      where: { company_id: companyId },
      relations: ['company', 'projects'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Developer> {
    // Check if user has permission to read developers
    const hasPermission = await this.permissionsService.hasPermission(
      userId,
      'developers.read',
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to read developers',
      );
    }

    const developer = await this.developersRepository.findOne({
      where: { id },
      relations: ['company', 'projects'],
    });

    if (!developer) {
      throw new NotFoundException(`Developer with ID ${id} not found`);
    }

    return developer;
  }

  async update(
    id: string,
    updateDeveloperDto: UpdateDeveloperDto,
    userId: string,
  ): Promise<Developer> {
    // Check if user has permission to update developers
    const hasPermission = await this.permissionsService.hasPermission(
      userId,
      'developers.update',
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to update developers',
      );
    }

    const developer = await this.findOne(id, userId);

    // Check if name is being updated and if it conflicts with existing developer
    if (updateDeveloperDto.name && updateDeveloperDto.name !== developer.name) {
      const existingDeveloper = await this.developersRepository.findOne({
        where: {
          name: updateDeveloperDto.name,
          company_id: developer.company_id,
          id: { $ne: id } as any, // Exclude current developer
        },
      });

      if (existingDeveloper) {
        throw new ConflictException(
          'Developer with this name already exists in this company',
        );
      }
    }

    Object.assign(developer, updateDeveloperDto);
    return this.developersRepository.save(developer);
  }

  async remove(id: string, userId: string): Promise<void> {
    // Check if user has permission to delete developers
    const hasPermission = await this.permissionsService.hasPermission(
      userId,
      'developers.delete',
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to delete developers',
      );
    }

    const developer = await this.findOne(id, userId);
    await this.developersRepository.remove(developer);
  }

  async getDevelopersByStatus(
    companyId: string,
    status: DeveloperStatus,
  ): Promise<Developer[]> {
    return this.developersRepository.find({
      where: {
        company_id: companyId,
        status,
      },
      relations: ['company', 'projects'],
    });
  }

  async getDevelopersByType(
    companyId: string,
    type: DeveloperType,
  ): Promise<Developer[]> {
    return this.developersRepository.find({
      where: {
        company_id: companyId,
        type,
      },
      relations: ['company', 'projects'],
    });
  }

  async searchDevelopers(
    companyId: string,
    userId: string,
    searchTerm: string,
  ): Promise<Developer[]> {
    return this.developersRepository
      .createQueryBuilder('developer')
      .where('developer.company_id = :companyId', { companyId })
      .andWhere(
        '(developer.name LIKE :search OR developer.description LIKE :search OR developer.contact_info LIKE :search)',
        { search: `%${searchTerm}%` },
      )
      .leftJoinAndSelect('developer.company', 'company')
      .leftJoinAndSelect('developer.projects', 'projects')
      .getMany();
  }

  async getDevelopersByLocation(
    companyId: string,
    userId: string,
    city?: string,
    state?: string,
  ): Promise<Developer[]> {
    const query = this.developersRepository
      .createQueryBuilder('developer')
      .where('developer.company_id = :companyId', { companyId })
      .leftJoinAndSelect('developer.company', 'company')
      .leftJoinAndSelect('developer.projects', 'projects');

    if (city) {
      query.andWhere('developer.contact_info->>"$.city" = :city', { city });
    }

    if (state) {
      query.andWhere('developer.contact_info->>"$.state" = :state', { state });
    }

    return query.getMany();
  }

  async getDevelopersBySpecialization(
    companyId: string,
    userId: string,
    specialization: string,
  ): Promise<Developer[]> {
    return this.developersRepository
      .createQueryBuilder('developer')
      .where('developer.company_id = :companyId', { companyId })
      .andWhere('JSON_CONTAINS(developer.specializations, :specialization)', {
        specialization: `"${specialization}"`,
      })
      .leftJoinAndSelect('developer.company', 'company')
      .leftJoinAndSelect('developer.projects', 'projects')
      .getMany();
  }

  async getDeveloperStats(companyId: string, userId: string) {
    const developers = await this.findAll(companyId, userId);

    const stats = {
      total: developers.length,
      byStatus: {
        [DeveloperStatus.ACTIVE]: developers.filter(
          (d) => d.status === DeveloperStatus.ACTIVE,
        ).length,
        [DeveloperStatus.INACTIVE]: developers.filter(
          (d) => d.status === DeveloperStatus.INACTIVE,
        ).length,
        [DeveloperStatus.SUSPENDED]: developers.filter(
          (d) => d.status === DeveloperStatus.SUSPENDED,
        ).length,
        [DeveloperStatus.PENDING]: developers.filter(
          (d) => d.status === DeveloperStatus.PENDING,
        ).length,
      },
      byType: {
        [DeveloperType.REAL_ESTATE_DEVELOPER]: developers.filter(
          (d) => d.type === DeveloperType.REAL_ESTATE_DEVELOPER,
        ).length,
        [DeveloperType.CONSTRUCTION_COMPANY]: developers.filter(
          (d) => d.type === DeveloperType.CONSTRUCTION_COMPANY,
        ).length,
        [DeveloperType.INVESTMENT_COMPANY]: developers.filter(
          (d) => d.type === DeveloperType.INVESTMENT_COMPANY,
        ).length,
        [DeveloperType.PROPERTY_MANAGEMENT]: developers.filter(
          (d) => d.type === DeveloperType.PROPERTY_MANAGEMENT,
        ).length,
        [DeveloperType.OTHER]: developers.filter(
          (d) => d.type === DeveloperType.OTHER,
        ).length,
      },
      totalProjects: developers.reduce(
        (sum, d) => sum + d.completed_projects,
        0,
      ),
      totalInvestment: developers.reduce(
        (sum, d) => sum + Number(d.total_investment || 0),
        0,
      ),
      averageExperience:
        developers.length > 0
          ? developers.reduce((sum, d) => sum + (d.years_experience || 0), 0) /
            developers.length
          : 0,
    };

    return stats;
  }

  async getTopDevelopers(
    companyId: string,
    limit: number = 5,
    userId: string,
  ): Promise<Developer[]> {
    return this.developersRepository
      .createQueryBuilder('developer')
      .where('developer.company_id = :companyId', { companyId })
      .andWhere('developer.status = :status', {
        status: DeveloperStatus.ACTIVE,
      })
      .orderBy('developer.completed_projects', 'DESC')
      .addOrderBy('developer.years_experience', 'DESC')
      .limit(limit)
      .leftJoinAndSelect('developer.company', 'company')
      .leftJoinAndSelect('developer.projects', 'projects')
      .getMany();
  }

  async updateDeveloperStatus(
    id: string,
    userId: string,
    status: DeveloperStatus,
  ): Promise<Developer> {
    return this.update(id, { status }, userId);
  }

  async incrementCompletedProjects(
    id: string,
    userId: string,
  ): Promise<Developer> {
    const developer = await this.findOne(id, userId);
    developer.completed_projects += 1;
    return this.developersRepository.save(developer);
  }

  async updateTotalInvestment(
    id: string,
    userId: string,
    amount: number,
  ): Promise<Developer> {
    const developer = await this.findOne(id, userId);
    developer.total_investment =
      Number(developer.total_investment || 0) + amount;
    return this.developersRepository.save(developer);
  }
}
