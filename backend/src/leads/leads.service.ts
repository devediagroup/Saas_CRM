import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Lead, LeadStatus, LeadPriority } from './entities/lead.entity';
import { CacheKeys, CacheTTL } from '../config/cache.config';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private leadsRepository: Repository<Lead>,
    private dataSource: DataSource,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  async create(createLeadDto: Partial<Lead>, userId: string): Promise<Lead> {
    return this.createWithTransaction(createLeadDto, userId);
  }

  async createWithTransaction(createLeadDto: Partial<Lead>, userId: string): Promise<Lead> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create lead within transaction (permission check handled by PermissionGuard)
      const lead = queryRunner.manager.create(Lead, createLeadDto);
      const savedLead = await queryRunner.manager.save(lead);

      // Add activity log for lead creation
      // Note: You would need to import Activity entity and add it here
      // await queryRunner.manager.save(Activity, {
      //   user_id: userId,
      //   action: 'create_lead',
      //   entity_id: savedLead.id,
      //   entity_type: 'lead',
      //   description: `Created lead: ${savedLead.first_name} ${savedLead.last_name}`,
      //   company_id: savedLead.company_id
      // });

      await queryRunner.commitTransaction();

      // Invalidate cache after successful creation
      await this.invalidateLeadsCache(savedLead.company_id, userId);

      return savedLead;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(companyId?: string, userId?: string): Promise<Lead[]> {
    // Permission check handled by PermissionGuard

    // Try to get from cache first
    const cacheKey = CacheKeys.LEADS_ALL(companyId || 'all');
    const cachedLeads = await this.cacheManager.get<Lead[]>(cacheKey);
    if (cachedLeads) {
      console.log(`🎯 Cache HIT for ${cacheKey}`);
      return cachedLeads;
    }

    console.log(`💾 Cache MISS for ${cacheKey}, fetching from database`);

    const query = this.leadsRepository
      .createQueryBuilder('lead')
      .leftJoinAndSelect('lead.company', 'company')
      .leftJoinAndSelect('lead.assigned_to', 'assigned_to')
      .leftJoinAndSelect('lead.lead_source', 'lead_source')
      .leftJoinAndSelect('lead.unit', 'unit')
      .leftJoinAndSelect('unit.project', 'project')
      .leftJoinAndSelect('project.developer', 'developer')
      .orderBy('lead.created_at', 'DESC');

    if (companyId) {
      query.where('lead.company_id = :companyId', { companyId });
    }

    const leads = await query.getMany();

    // Cache the result for 30 minutes
    await this.cacheManager.set(cacheKey, leads, CacheTTL.MEDIUM);
    console.log(`💰 Cached ${leads.length} leads with key ${cacheKey}`);

    return leads;
  }

  async findOne(id: string, userId: string): Promise<Lead> {
    // Permission check handled by PermissionGuard

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
    return this.updateWithTransaction(id, updateLeadDto, userId);
  }

  async updateWithTransaction(
    id: string,
    updateLeadDto: Partial<Lead>,
    userId: string,
  ): Promise<Lead> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Permission check handled by PermissionGuard

      // Find the lead first
      const lead = await queryRunner.manager.findOne(Lead, {
        where: { id },
        relations: ['company', 'assigned_to', 'lead_source'],
      });

      if (!lead) {
        throw new NotFoundException(`Lead with ID ${id} not found`);
      }

      // Store old values for audit log
      const oldValues = { ...lead };

      // Update lead within transaction
      Object.assign(lead, updateLeadDto);
      const updatedLead = await queryRunner.manager.save(lead);

      // Add activity log for lead update
      // Note: You would need to import Activity entity and add it here
      // await queryRunner.manager.save(Activity, {
      //   user_id: userId,
      //   action: 'update_lead',
      //   entity_id: updatedLead.id,
      //   entity_type: 'lead',
      //   description: `Updated lead: ${updatedLead.first_name} ${updatedLead.last_name}`,
      //   old_values: oldValues,
      //   new_values: updateLeadDto,
      //   company_id: updatedLead.company_id
      // });

      await queryRunner.commitTransaction();

      // Invalidate cache after successful update
      await this.invalidateLeadsCache(updatedLead.company_id, userId);

      return updatedLead;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    return this.removeWithTransaction(id, userId);
  }

  async removeWithTransaction(id: string, userId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Permission check handled by PermissionGuard

      // Find the lead first
      const lead = await queryRunner.manager.findOne(Lead, {
        where: { id },
        relations: ['company', 'assigned_to', 'lead_source'],
      });

      if (!lead) {
        throw new NotFoundException(`Lead with ID ${id} not found`);
      }

      // Store lead info for audit log before deletion
      const leadInfo = {
        id: lead.id,
        name: `${lead.first_name} ${lead.last_name}`,
        email: lead.email,
        company_id: lead.company_id
      };

      // Remove lead within transaction
      await queryRunner.manager.remove(lead);

      // Add activity log for lead deletion
      // Note: You would need to import Activity entity and add it here
      // await queryRunner.manager.save(Activity, {
      //   user_id: userId,
      //   action: 'delete_lead',
      //   entity_id: leadInfo.id,
      //   entity_type: 'lead',
      //   description: `Deleted lead: ${leadInfo.name}`,
      //   old_values: leadInfo,
      //   company_id: leadInfo.company_id
      // });

      await queryRunner.commitTransaction();

      // Invalidate cache after successful deletion
      await this.invalidateLeadsCache(leadInfo.company_id, userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getLeadsByStatus(
    companyId: string,
    status: LeadStatus,
  ): Promise<Lead[]> {
    // Try to get from cache first
    const cacheKey = CacheKeys.LEADS_BY_STATUS(companyId, status);
    const cachedLeads = await this.cacheManager.get<Lead[]>(cacheKey);
    if (cachedLeads) {
      console.log(`🎯 Cache HIT for ${cacheKey}`);
      return cachedLeads;
    }

    console.log(`💾 Cache MISS for ${cacheKey}, fetching from database`);

    const leads = await this.leadsRepository
      .createQueryBuilder('lead')
      .leftJoinAndSelect('lead.assigned_to', 'assigned_to')
      .leftJoinAndSelect('lead.lead_source', 'lead_source')
      .leftJoinAndSelect('lead.company', 'company')
      .where('lead.company_id = :companyId', { companyId })
      .andWhere('lead.status = :status', { status })
      .orderBy('lead.created_at', 'DESC')
      .getMany();

    // Cache the result for 30 minutes
    await this.cacheManager.set(cacheKey, leads, CacheTTL.MEDIUM);
    console.log(`💰 Cached ${leads.length} leads by status with key ${cacheKey}`);

    return leads;
  }

  async getLeadsByPriority(
    companyId: string,
    priority: LeadPriority,
  ): Promise<Lead[]> {
    return this.leadsRepository
      .createQueryBuilder('lead')
      .leftJoinAndSelect('lead.assigned_to', 'assigned_to')
      .leftJoinAndSelect('lead.lead_source', 'lead_source')
      .leftJoinAndSelect('lead.company', 'company')
      .where('lead.company_id = :companyId', { companyId })
      .andWhere('lead.priority = :priority', { priority })
      .orderBy('lead.created_at', 'DESC')
      .getMany();
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
    return this.leadsRepository
      .createQueryBuilder('lead')
      .leftJoinAndSelect('lead.assigned_to', 'assigned_to')
      .leftJoinAndSelect('lead.lead_source', 'lead_source')
      .leftJoinAndSelect('lead.company', 'company')
      .where('lead.company_id = :companyId', { companyId })
      .andWhere('lead.assigned_to_id = :userId', { userId })
      .orderBy('lead.created_at', 'DESC')
      .getMany();
  }

  async getLeadStats(companyId: string, userId: string) {
    // Try to get from cache first
    const cacheKey = CacheKeys.LEADS_STATS(companyId);
    const cachedStats = await this.cacheManager.get(cacheKey);
    if (cachedStats) {
      console.log(`🎯 Cache HIT for ${cacheKey}`);
      return cachedStats;
    }

    console.log(`💾 Cache MISS for ${cacheKey}, calculating stats from database`);

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

    // Cache the stats for 15 minutes (analytics data)
    await this.cacheManager.set(cacheKey, stats, CacheTTL.ANALYTICS);
    console.log(`💰 Cached lead stats with key ${cacheKey}`);

    return stats;
  }

  async searchLeads(
    companyId: string,
    userId: string,
    searchTerm: string,
  ): Promise<Lead[]> {
    // Sanitize search term to prevent SQL injection
    const sanitizedSearchTerm = searchTerm
      .trim()
      .replace(/[^\w\s\-\.\@\+\(\)\[\]]/g, '')
      .substring(0, 100); // Limit length to prevent abuse

    if (!sanitizedSearchTerm) {
      return [];
    }

    return this.leadsRepository
      .createQueryBuilder('lead')
      .where('lead.company_id = :companyId', { companyId })
      .andWhere(
        '(lead.first_name LIKE :search OR lead.last_name LIKE :search OR lead.email LIKE :search OR lead.phone LIKE :search OR lead.company_name LIKE :search)',
        { search: `%${sanitizedSearchTerm}%` },
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
    return this.leadsRepository
      .createQueryBuilder('lead')
      .leftJoinAndSelect('lead.assigned_to', 'assigned_to')
      .leftJoinAndSelect('lead.lead_source', 'lead_source')
      .leftJoinAndSelect('lead.company', 'company')
      .leftJoinAndSelect('lead.unit', 'unit')
      .leftJoinAndSelect('unit.project', 'project')
      .leftJoinAndSelect('project.developer', 'developer')
      .where('lead.company_id = :companyId', { companyId })
      .andWhere('lead.unit_id = :unitId', { unitId })
      .orderBy('lead.created_at', 'DESC')
      .getMany();
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

  /**
   * Helper method to invalidate related cache entries
   * @param companyId Company ID
   * @param userId User ID (optional)
   */
  private async invalidateLeadsCache(companyId: string, userId?: string): Promise<void> {
    const cacheKeysToDelete = [
      CacheKeys.LEADS_ALL(companyId),
      CacheKeys.LEADS_STATS(companyId),
      // Invalidate all status-based caches
      ...Object.values(LeadStatus).map(status => CacheKeys.LEADS_BY_STATUS(companyId, status)),
      // Invalidate all priority-based caches
      ...Object.values(LeadPriority).map(priority => CacheKeys.LEADS_BY_PRIORITY(companyId, priority)),
    ];

    if (userId) {
      cacheKeysToDelete.push(CacheKeys.LEADS_BY_ASSIGNEE(companyId, userId));
    }

    // Delete all cache entries
    await Promise.all(cacheKeysToDelete.map(key =>
      this.cacheManager.del(key)
        .then(() => console.log(`🗑️ Invalidated cache: ${key}`))
        .catch(err => console.warn(`⚠️ Failed to invalidate cache ${key}:`, err))
    ));
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
