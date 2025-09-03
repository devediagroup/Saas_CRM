import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead, LeadStatus, LeadPriority } from './entities/lead.entity';
import { PermissionsService } from '../auth/services/permissions.service';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private leadsRepository: Repository<Lead>,
    private permissionsService: PermissionsService,
  ) {}

  async create(createLeadDto: Partial<Lead>, userId: string): Promise<Lead> {
    // Check if user has permission to create leads
    const hasPermission = await this.permissionsService.hasPermission(
      userId,
      'leads.create',
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to create leads',
      );
    }

    const lead = this.leadsRepository.create(createLeadDto);
    return this.leadsRepository.save(lead);
  }

  async findAll(companyId?: string, userId?: string): Promise<Lead[]> {
    // Check if user has permission to read leads
    if (userId) {
      const hasPermission = await this.permissionsService.hasPermission(
        userId,
        'leads.read',
      );
      if (!hasPermission) {
        throw new ForbiddenException(
          'You do not have permission to read leads',
        );
      }
    }

    const query = this.leadsRepository
      .createQueryBuilder('lead')
      .leftJoinAndSelect('lead.company', 'company')
      .leftJoinAndSelect('lead.assigned_to', 'assigned_to')
      .leftJoinAndSelect('lead.lead_source', 'lead_source');

    if (companyId) {
      query.where('lead.company_id = :companyId', { companyId });
    }

    return query.getMany();
  }

  async findOne(id: string, userId: string): Promise<Lead> {
    // Check if user has permission to read leads
    const hasPermission = await this.permissionsService.hasPermission(
      userId,
      'leads.read',
    );
    if (!hasPermission) {
      throw new ForbiddenException('You do not have permission to read leads');
    }

    const lead = await this.leadsRepository.findOne({
      where: { id },
      relations: ['company', 'assigned_to', 'lead_source'],
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    return lead;
  }

  async update(
    id: string,
    updateLeadDto: Partial<Lead>,
    userId: string,
  ): Promise<Lead> {
    // Check if user has permission to update leads
    const hasPermission = await this.permissionsService.hasPermission(
      userId,
      'leads.update',
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to update leads',
      );
    }

    const lead = await this.findOne(id, userId);

    Object.assign(lead, updateLeadDto);
    return this.leadsRepository.save(lead);
  }

  async remove(id: string, userId: string): Promise<void> {
    // Check if user has permission to delete leads
    const hasPermission = await this.permissionsService.hasPermission(
      userId,
      'leads.delete',
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to delete leads',
      );
    }

    const lead = await this.findOne(id, userId);
    await this.leadsRepository.remove(lead);
  }

  async getLeadsByStatus(
    companyId: string,
    status: LeadStatus,
  ): Promise<Lead[]> {
    return this.leadsRepository.find({
      where: {
        company_id: companyId,
        status,
      },
      relations: ['assigned_to', 'lead_source'],
    });
  }

  async getLeadsByPriority(
    companyId: string,
    priority: LeadPriority,
  ): Promise<Lead[]> {
    return this.leadsRepository.find({
      where: {
        company_id: companyId,
        priority,
      },
      relations: ['assigned_to', 'lead_source'],
    });
  }

  async assignLead(id: string, userId: string): Promise<Lead> {
    return this.update(id, { assigned_to_id: userId }, userId);
  }

  async updateLeadStatus(
    id: string,
    userId: string,
    status: LeadStatus,
  ): Promise<Lead> {
    return this.update(id, { status }, userId);
  }

  async updateLeadPriority(
    id: string,
    userId: string,
    priority: LeadPriority,
  ): Promise<Lead> {
    return this.update(id, { priority }, userId);
  }

  async getLeadsByAssignee(companyId: string, userId: string): Promise<Lead[]> {
    return this.leadsRepository.find({
      where: {
        company_id: companyId,
        assigned_to_id: userId,
      },
      relations: ['lead_source'],
    });
  }

  async getLeadStats(companyId: string, userId: string) {
    const leads = await this.findAll(companyId, userId);

    const stats = {
      total: leads.length,
      byStatus: {
        [LeadStatus.NEW]: leads.filter((l) => l.status === LeadStatus.NEW)
          .length,
        [LeadStatus.CONTACTED]: leads.filter(
          (l) => l.status === LeadStatus.CONTACTED,
        ).length,
        [LeadStatus.QUALIFIED]: leads.filter(
          (l) => l.status === LeadStatus.QUALIFIED,
        ).length,
        [LeadStatus.PROPOSAL]: leads.filter(
          (l) => l.status === LeadStatus.PROPOSAL,
        ).length,
        [LeadStatus.NEGOTIATION]: leads.filter(
          (l) => l.status === LeadStatus.NEGOTIATION,
        ).length,
        [LeadStatus.CLOSED_WON]: leads.filter(
          (l) => l.status === LeadStatus.CLOSED_WON,
        ).length,
        [LeadStatus.CLOSED_LOST]: leads.filter(
          (l) => l.status === LeadStatus.CLOSED_LOST,
        ).length,
      },
      byPriority: {
        [LeadPriority.LOW]: leads.filter((l) => l.priority === LeadPriority.LOW)
          .length,
        [LeadPriority.MEDIUM]: leads.filter(
          (l) => l.priority === LeadPriority.MEDIUM,
        ).length,
        [LeadPriority.HIGH]: leads.filter(
          (l) => l.priority === LeadPriority.HIGH,
        ).length,
        [LeadPriority.URGENT]: leads.filter(
          (l) => l.priority === LeadPriority.URGENT,
        ).length,
      },
      conversionRate:
        leads.length > 0
          ? (
              (leads.filter((l) => l.status === LeadStatus.CLOSED_WON).length /
                leads.length) *
              100
            ).toFixed(1)
          : 0,
      averageScore:
        leads.length > 0
          ? (leads.reduce((sum, l) => sum + l.score, 0) / leads.length).toFixed(
              1,
            )
          : 0,
    };

    return stats;
  }

  async searchLeads(
    companyId: string,
    userId: string,
    searchTerm: string,
  ): Promise<Lead[]> {
    return this.leadsRepository
      .createQueryBuilder('lead')
      .where('lead.company_id = :companyId', { companyId })
      .andWhere(
        '(lead.first_name LIKE :search OR lead.last_name LIKE :search OR lead.email LIKE :search OR lead.phone LIKE :search OR lead.company_name LIKE :search)',
        { search: `%${searchTerm}%` },
      )
      .leftJoinAndSelect('lead.assigned_to', 'assigned_to')
      .leftJoinAndSelect('lead.lead_source', 'lead_source')
      .getMany();
  }

  async getLeadsByUnit(
    companyId: string,
    userId: string,
    unitId: string,
  ): Promise<Lead[]> {
    return this.leadsRepository.find({
      where: {
        company_id: companyId,
        unit_id: unitId,
      },
      relations: [
        'assigned_to',
        'lead_source',
        'unit',
        'unit.project',
        'unit.project.developer',
      ],
    });
  }

  async getLeadsByProject(
    companyId: string,
    userId: string,
    projectId: string,
  ): Promise<Lead[]> {
    return this.leadsRepository
      .createQueryBuilder('lead')
      .leftJoinAndSelect('lead.assigned_to', 'assigned_to')
      .leftJoinAndSelect('lead.lead_source', 'lead_source')
      .leftJoinAndSelect('lead.unit', 'unit')
      .leftJoinAndSelect('unit.project', 'project')
      .leftJoinAndSelect('project.developer', 'developer')
      .where('lead.company_id = :companyId', { companyId })
      .andWhere('unit.project_id = :projectId', { projectId })
      .getMany();
  }

  async getLeadsByDeveloper(
    companyId: string,
    userId: string,
    developerId: string,
  ): Promise<Lead[]> {
    return this.leadsRepository
      .createQueryBuilder('lead')
      .leftJoinAndSelect('lead.assigned_to', 'assigned_to')
      .leftJoinAndSelect('lead.lead_source', 'lead_source')
      .leftJoinAndSelect('lead.unit', 'unit')
      .leftJoinAndSelect('unit.project', 'project')
      .leftJoinAndSelect('project.developer', 'developer')
      .where('lead.company_id = :companyId', { companyId })
      .andWhere('project.developer_id = :developerId', { developerId })
      .getMany();
  }
}
