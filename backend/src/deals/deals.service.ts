import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Deal,
  DealStage,
  DealPriority,
  DealType,
} from './entities/deal.entity';
import { PermissionsService } from '../auth/services/permissions.service';

@Injectable()
export class DealsService {
  constructor(
    @InjectRepository(Deal)
    private dealsRepository: Repository<Deal>,
    private permissionsService: PermissionsService,
  ) {}

  async create(createDealDto: Partial<Deal>, userId: string): Promise<Deal> {
    // Check if user has permission to create deals
    const hasPermission = await this.permissionsService.hasPermission(
      userId,
      'deals.create',
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to create deals',
      );
    }

    const deal = this.dealsRepository.create(createDealDto);
    return this.dealsRepository.save(deal);
  }

  async findAll(companyId: string, userId: string): Promise<Deal[]> {
    // Check if user has permission to read deals
    const hasPermission = await this.permissionsService.hasPermission(
      userId,
      'deals.read',
    );
    if (!hasPermission) {
      throw new ForbiddenException('You do not have permission to read deals');
    }

    return this.dealsRepository.find({
      where: { company_id: companyId },
      relations: ['company', 'lead', 'property', 'assigned_to'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Deal> {
    // Check if user has permission to read deals
    const hasPermission = await this.permissionsService.hasPermission(
      userId,
      'deals.read',
    );
    if (!hasPermission) {
      throw new ForbiddenException('You do not have permission to read deals');
    }

    const deal = await this.dealsRepository.findOne({
      where: { id },
      relations: ['company', 'lead', 'property', 'assigned_to', 'activities'],
    });

    if (!deal) {
      throw new NotFoundException(`Deal with ID ${id} not found`);
    }

    return deal;
  }

  async update(
    id: string,
    updateDealDto: Partial<Deal>,
    userId: string,
  ): Promise<Deal> {
    // Check if user has permission to update deals
    const hasPermission = await this.permissionsService.hasPermission(
      userId,
      'deals.update',
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to update deals',
      );
    }

    const deal = await this.findOne(id, userId);

    Object.assign(deal, updateDealDto);
    return this.dealsRepository.save(deal);
  }

  async remove(id: string, userId: string): Promise<void> {
    // Check if user has permission to delete deals
    const hasPermission = await this.permissionsService.hasPermission(
      userId,
      'deals.delete',
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to delete deals',
      );
    }

    const deal = await this.findOne(id, userId);
    await this.dealsRepository.remove(deal);
  }

  async getDealsByStage(companyId: string, stage: DealStage): Promise<Deal[]> {
    return this.dealsRepository.find({
      where: {
        company_id: companyId,
        stage,
      },
      relations: ['lead', 'property', 'assigned_to'],
    });
  }

  async getDealsByPriority(
    companyId: string,
    priority: DealPriority,
  ): Promise<Deal[]> {
    return this.dealsRepository.find({
      where: {
        company_id: companyId,
        priority,
      },
      relations: ['lead', 'property', 'assigned_to'],
    });
  }

  async getDealsByType(companyId: string, dealType: DealType): Promise<Deal[]> {
    return this.dealsRepository.find({
      where: {
        company_id: companyId,
        deal_type: dealType,
      },
      relations: ['lead', 'property', 'assigned_to'],
    });
  }

  async getDealsByAssignee(companyId: string, userId: string): Promise<Deal[]> {
    return this.dealsRepository.find({
      where: {
        company_id: companyId,
        assigned_to_id: userId,
      },
      relations: ['lead', 'property', 'assigned_to'],
    });
  }

  async updateDealStage(
    id: string,
    userId: string,
    stage: DealStage,
  ): Promise<Deal> {
    const deal = await this.findOne(id, userId);

    // If closing the deal, set the actual close date
    if (
      (stage === DealStage.CLOSED_WON || stage === DealStage.CLOSED_LOST) &&
      !deal.actual_close_date
    ) {
      deal.actual_close_date = new Date();
    }

    deal.stage = stage;
    return this.dealsRepository.save(deal);
  }

  async assignDeal(id: string, userId: string): Promise<Deal> {
    return this.update(id, { assigned_to_id: userId }, userId);
  }

  async getPipelineView(companyId: string, userId: string): Promise<any> {
    const deals = await this.findAll(companyId, userId);

    const pipeline = {
      [DealStage.PROSPECT]: deals.filter((d) => d.stage === DealStage.PROSPECT),
      [DealStage.QUALIFIED]: deals.filter(
        (d) => d.stage === DealStage.QUALIFIED,
      ),
      [DealStage.PROPOSAL]: deals.filter((d) => d.stage === DealStage.PROPOSAL),
      [DealStage.NEGOTIATION]: deals.filter(
        (d) => d.stage === DealStage.NEGOTIATION,
      ),
      [DealStage.CONTRACT]: deals.filter((d) => d.stage === DealStage.CONTRACT),
      [DealStage.CLOSED_WON]: deals.filter(
        (d) => d.stage === DealStage.CLOSED_WON,
      ),
      [DealStage.CLOSED_LOST]: deals.filter(
        (d) => d.stage === DealStage.CLOSED_LOST,
      ),
    };

    return pipeline;
  }

  async getDealsByDateRange(
    companyId: string,
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Deal[]> {
    return this.dealsRepository
      .createQueryBuilder('deal')
      .where('deal.company_id = :companyId', { companyId })
      .andWhere('deal.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .leftJoinAndSelect('deal.lead', 'lead')
      .leftJoinAndSelect('deal.property', 'property')
      .leftJoinAndSelect('deal.assigned_to', 'assigned_to')
      .getMany();
  }

  async getOverdueDeals(companyId: string, userId: string): Promise<Deal[]> {
    return this.dealsRepository
      .createQueryBuilder('deal')
      .where('deal.company_id = :companyId', { companyId })
      .andWhere('deal.expected_close_date < :now', { now: new Date() })
      .andWhere('deal.actual_close_date IS NULL')
      .leftJoinAndSelect('deal.lead', 'lead')
      .leftJoinAndSelect('deal.property', 'property')
      .leftJoinAndSelect('deal.assigned_to', 'assigned_to')
      .getMany();
  }

  async getDealsByAmountRange(
    companyId: string,
    userId: string,
    minAmount: number,
    maxAmount: number,
  ): Promise<Deal[]> {
    return this.dealsRepository
      .createQueryBuilder('deal')
      .where('deal.company_id = :companyId', { companyId })
      .andWhere('deal.amount BETWEEN :minAmount AND :maxAmount', {
        minAmount,
        maxAmount,
      })
      .leftJoinAndSelect('deal.lead', 'lead')
      .leftJoinAndSelect('deal.property', 'property')
      .leftJoinAndSelect('deal.assigned_to', 'assigned_to')
      .getMany();
  }

  async searchDeals(
    companyId: string,
    userId: string,
    searchTerm: string,
  ): Promise<Deal[]> {
    return this.dealsRepository
      .createQueryBuilder('deal')
      .where('deal.company_id = :companyId', { companyId })
      .andWhere('(deal.title LIKE :search OR deal.description LIKE :search)', {
        search: `%${searchTerm}%`,
      })
      .leftJoinAndSelect('deal.lead', 'lead')
      .leftJoinAndSelect('deal.property', 'property')
      .leftJoinAndSelect('deal.assigned_to', 'assigned_to')
      .getMany();
  }

  async getDealStats(companyId: string, userId: string) {
    const deals = await this.findAll(companyId, userId);

    const stats = {
      total: deals.length,
      byStage: {
        [DealStage.PROSPECT]: deals.filter(
          (d) => d.stage === DealStage.PROSPECT,
        ).length,
        [DealStage.QUALIFIED]: deals.filter(
          (d) => d.stage === DealStage.QUALIFIED,
        ).length,
        [DealStage.PROPOSAL]: deals.filter(
          (d) => d.stage === DealStage.PROPOSAL,
        ).length,
        [DealStage.NEGOTIATION]: deals.filter(
          (d) => d.stage === DealStage.NEGOTIATION,
        ).length,
        [DealStage.CONTRACT]: deals.filter(
          (d) => d.stage === DealStage.CONTRACT,
        ).length,
        [DealStage.CLOSED_WON]: deals.filter(
          (d) => d.stage === DealStage.CLOSED_WON,
        ).length,
        [DealStage.CLOSED_LOST]: deals.filter(
          (d) => d.stage === DealStage.CLOSED_LOST,
        ).length,
      },
      byPriority: {
        [DealPriority.LOW]: deals.filter((d) => d.priority === DealPriority.LOW)
          .length,
        [DealPriority.MEDIUM]: deals.filter(
          (d) => d.priority === DealPriority.MEDIUM,
        ).length,
        [DealPriority.HIGH]: deals.filter(
          (d) => d.priority === DealPriority.HIGH,
        ).length,
        [DealPriority.URGENT]: deals.filter(
          (d) => d.priority === DealPriority.URGENT,
        ).length,
      },
      byType: {
        [DealType.SALE]: deals.filter((d) => d.deal_type === DealType.SALE)
          .length,
        [DealType.RENT]: deals.filter((d) => d.deal_type === DealType.RENT)
          .length,
        [DealType.MANAGEMENT]: deals.filter(
          (d) => d.deal_type === DealType.MANAGEMENT,
        ).length,
        [DealType.CONSULTATION]: deals.filter(
          (d) => d.deal_type === DealType.CONSULTATION,
        ).length,
      },
      conversionRate:
        deals.length > 0
          ? (
              (deals.filter((d) => d.stage === DealStage.CLOSED_WON).length /
                deals.length) *
              100
            ).toFixed(1)
          : 0,
      totalValue: deals.reduce((sum, d) => sum + d.amount, 0),
      weightedValue: deals.reduce((sum, d) => sum + d.weighted_amount, 0),
      averageDealSize:
        deals.length > 0
          ? deals.reduce((sum, d) => sum + d.amount, 0) / deals.length
          : 0,
      overdue: (await this.getOverdueDeals(companyId, userId)).length,
    };

    return stats;
  }

  async getUpcomingDeals(
    companyId: string,
    days: number = 30,
  ): Promise<Deal[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.dealsRepository
      .createQueryBuilder('deal')
      .where('deal.company_id = :companyId', { companyId })
      .andWhere('deal.expected_close_date <= :futureDate', { futureDate })
      .andWhere('deal.actual_close_date IS NULL')
      .leftJoinAndSelect('deal.lead', 'lead')
      .leftJoinAndSelect('deal.property', 'property')
      .leftJoinAndSelect('deal.assigned_to', 'assigned_to')
      .orderBy('deal.expected_close_date', 'ASC')
      .getMany();
  }

  async getDealsByUnit(companyId: string, unitId: string): Promise<Deal[]> {
    return this.dealsRepository.find({
      where: {
        company_id: companyId,
        unit_id: unitId,
      },
      relations: [
        'lead',
        'property',
        'assigned_to',
        'unit',
        'unit.project',
        'unit.project.developer',
      ],
    });
  }

  async getDealsByProject(
    companyId: string,
    projectId: string,
  ): Promise<Deal[]> {
    return this.dealsRepository
      .createQueryBuilder('deal')
      .leftJoinAndSelect('deal.lead', 'lead')
      .leftJoinAndSelect('deal.property', 'property')
      .leftJoinAndSelect('deal.assigned_to', 'assigned_to')
      .leftJoinAndSelect('deal.unit', 'unit')
      .leftJoinAndSelect('unit.project', 'project')
      .leftJoinAndSelect('project.developer', 'developer')
      .where('deal.company_id = :companyId', { companyId })
      .andWhere('unit.project_id = :projectId', { projectId })
      .getMany();
  }

  async getDealsByDeveloper(
    companyId: string,
    developerId: string,
  ): Promise<Deal[]> {
    return this.dealsRepository
      .createQueryBuilder('deal')
      .leftJoinAndSelect('deal.lead', 'lead')
      .leftJoinAndSelect('deal.property', 'property')
      .leftJoinAndSelect('deal.assigned_to', 'assigned_to')
      .leftJoinAndSelect('deal.unit', 'unit')
      .leftJoinAndSelect('unit.project', 'project')
      .leftJoinAndSelect('project.developer', 'developer')
      .where('deal.company_id = :companyId', { companyId })
      .andWhere('project.developer_id = :developerId', { developerId })
      .getMany();
  }
}
