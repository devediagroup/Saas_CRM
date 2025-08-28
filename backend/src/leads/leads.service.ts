import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead, LeadStatus, LeadPriority } from './entities/lead.entity';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private leadsRepository: Repository<Lead>,
  ) {}

  async create(createLeadDto: Partial<Lead>): Promise<Lead> {
    const lead = this.leadsRepository.create(createLeadDto);
    return this.leadsRepository.save(lead);
  }

  async findAll(companyId?: string): Promise<Lead[]> {
    const query = this.leadsRepository.createQueryBuilder('lead')
      .leftJoinAndSelect('lead.company', 'company')
      .leftJoinAndSelect('lead.assigned_to', 'assigned_to')
      .leftJoinAndSelect('lead.lead_source', 'lead_source');

    if (companyId) {
      query.where('lead.company_id = :companyId', { companyId });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Lead> {
    const lead = await this.leadsRepository.findOne({
      where: { id },
      relations: ['company', 'assigned_to', 'lead_source'],
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    return lead;
  }

  async update(id: string, updateLeadDto: Partial<Lead>): Promise<Lead> {
    const lead = await this.findOne(id);

    Object.assign(lead, updateLeadDto);
    return this.leadsRepository.save(lead);
  }

  async remove(id: string): Promise<void> {
    const lead = await this.findOne(id);
    await this.leadsRepository.remove(lead);
  }

  async getLeadsByStatus(companyId: string, status: LeadStatus): Promise<Lead[]> {
    return this.leadsRepository.find({
      where: {
        company_id: companyId,
        status,
      },
      relations: ['assigned_to', 'lead_source'],
    });
  }

  async getLeadsByPriority(companyId: string, priority: LeadPriority): Promise<Lead[]> {
    return this.leadsRepository.find({
      where: {
        company_id: companyId,
        priority,
      },
      relations: ['assigned_to', 'lead_source'],
    });
  }

  async assignLead(id: string, userId: string): Promise<Lead> {
    return this.update(id, { assigned_to_id: userId });
  }

  async updateLeadStatus(id: string, status: LeadStatus): Promise<Lead> {
    return this.update(id, { status });
  }

  async updateLeadPriority(id: string, priority: LeadPriority): Promise<Lead> {
    return this.update(id, { priority });
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

  async getLeadStats(companyId: string) {
    const leads = await this.findAll(companyId);

    const stats = {
      total: leads.length,
      byStatus: {
        [LeadStatus.NEW]: leads.filter(l => l.status === LeadStatus.NEW).length,
        [LeadStatus.CONTACTED]: leads.filter(l => l.status === LeadStatus.CONTACTED).length,
        [LeadStatus.QUALIFIED]: leads.filter(l => l.status === LeadStatus.QUALIFIED).length,
        [LeadStatus.PROPOSAL]: leads.filter(l => l.status === LeadStatus.PROPOSAL).length,
        [LeadStatus.NEGOTIATION]: leads.filter(l => l.status === LeadStatus.NEGOTIATION).length,
        [LeadStatus.CLOSED_WON]: leads.filter(l => l.status === LeadStatus.CLOSED_WON).length,
        [LeadStatus.CLOSED_LOST]: leads.filter(l => l.status === LeadStatus.CLOSED_LOST).length,
      },
      byPriority: {
        [LeadPriority.LOW]: leads.filter(l => l.priority === LeadPriority.LOW).length,
        [LeadPriority.MEDIUM]: leads.filter(l => l.priority === LeadPriority.MEDIUM).length,
        [LeadPriority.HIGH]: leads.filter(l => l.priority === LeadPriority.HIGH).length,
        [LeadPriority.URGENT]: leads.filter(l => l.priority === LeadPriority.URGENT).length,
      },
      conversionRate: leads.length > 0 ?
        (leads.filter(l => l.status === LeadStatus.CLOSED_WON).length / leads.length * 100).toFixed(1) : 0,
      averageScore: leads.length > 0 ?
        (leads.reduce((sum, l) => sum + l.score, 0) / leads.length).toFixed(1) : 0,
    };

    return stats;
  }

  async searchLeads(companyId: string, searchTerm: string): Promise<Lead[]> {
    return this.leadsRepository
      .createQueryBuilder('lead')
      .where('lead.company_id = :companyId', { companyId })
      .andWhere(
        '(lead.first_name LIKE :search OR lead.last_name LIKE :search OR lead.email LIKE :search OR lead.phone LIKE :search OR lead.company_name LIKE :search)',
        { search: `%${searchTerm}%` }
      )
      .leftJoinAndSelect('lead.assigned_to', 'assigned_to')
      .leftJoinAndSelect('lead.lead_source', 'lead_source')
      .getMany();
  }
}
