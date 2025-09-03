import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Activity,
  ActivityType,
  ActivityStatus,
  ActivityPriority,
} from './entities/activity.entity';
import { PermissionsService } from '../auth/services/permissions.service';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private activitiesRepository: Repository<Activity>,
    private permissionsService: PermissionsService,
  ) {}

  async create(
    createActivityDto: Partial<Activity>,
    userId: string,
  ): Promise<Activity> {
    // Check if user has permission to create activities
    const hasPermission = await this.permissionsService.hasPermission(
      userId,
      'activities.create',
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to create activities',
      );
    }

    const activity = this.activitiesRepository.create(createActivityDto);
    return this.activitiesRepository.save(activity);
  }

  async findAll(companyId: string, userId: string): Promise<Activity[]> {
    // Check if user has permission to read activities
    const hasPermission = await this.permissionsService.hasPermission(
      userId,
      'activities.read',
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to read activities',
      );
    }

    return this.activitiesRepository.find({
      where: { company_id: companyId },
      relations: ['company', 'user', 'lead', 'property', 'deal'],
      order: { scheduled_at: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Activity> {
    // Check if user has permission to read activities
    const hasPermission = await this.permissionsService.hasPermission(
      userId,
      'activities.read',
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to read activities',
      );
    }

    const activity = await this.activitiesRepository.findOne({
      where: { id },
      relations: ['company', 'user', 'lead', 'property', 'deal'],
    });

    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }

    return activity;
  }

  async update(
    id: string,
    updateActivityDto: Partial<Activity>,
    userId: string,
  ): Promise<Activity> {
    // Check if user has permission to update activities
    const hasPermission = await this.permissionsService.hasPermission(
      userId,
      'activities.update',
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to update activities',
      );
    }

    const activity = await this.findOne(id, userId);

    // If completing the activity, set completed_at
    if (
      updateActivityDto.status === ActivityStatus.COMPLETED &&
      !activity.completed_at
    ) {
      updateActivityDto.completed_at = new Date();
    }

    Object.assign(activity, updateActivityDto);
    return this.activitiesRepository.save(activity);
  }

  async remove(id: string, userId: string): Promise<void> {
    // Check if user has permission to delete activities
    const hasPermission = await this.permissionsService.hasPermission(
      userId,
      'activities.delete',
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to delete activities',
      );
    }

    const activity = await this.findOne(id, userId);
    await this.activitiesRepository.remove(activity);
  }

  async getActivitiesByStatus(
    companyId: string,
    status: ActivityStatus,
  ): Promise<Activity[]> {
    return this.activitiesRepository.find({
      where: {
        company_id: companyId,
        status,
      },
      relations: ['user', 'lead', 'property', 'deal'],
    });
  }

  async getActivitiesByType(
    companyId: string,
    type: ActivityType,
  ): Promise<Activity[]> {
    return this.activitiesRepository.find({
      where: {
        company_id: companyId,
        type,
      },
      relations: ['user', 'lead', 'property', 'deal'],
    });
  }

  async getActivitiesByPriority(
    companyId: string,
    priority: ActivityPriority,
  ): Promise<Activity[]> {
    return this.activitiesRepository.find({
      where: {
        company_id: companyId,
        priority,
      },
      relations: ['user', 'lead', 'property', 'deal'],
    });
  }

  async getActivitiesByUser(
    companyId: string,
    userId: string,
  ): Promise<Activity[]> {
    return this.activitiesRepository.find({
      where: {
        company_id: companyId,
        user_id: userId,
      },
      relations: ['lead', 'property', 'deal'],
    });
  }

  async getActivitiesByDateRange(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Activity[]> {
    return this.activitiesRepository
      .createQueryBuilder('activity')
      .where('activity.company_id = :companyId', { companyId })
      .andWhere('activity.scheduled_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .leftJoinAndSelect('activity.user', 'user')
      .leftJoinAndSelect('activity.lead', 'lead')
      .leftJoinAndSelect('activity.property', 'property')
      .leftJoinAndSelect('activity.deal', 'deal')
      .getMany();
  }

  async getOverdueActivities(companyId: string): Promise<Activity[]> {
    return this.activitiesRepository
      .createQueryBuilder('activity')
      .where('activity.company_id = :companyId', { companyId })
      .andWhere('activity.status = :status', {
        status: ActivityStatus.SCHEDULED,
      })
      .andWhere('activity.scheduled_at < :now', { now: new Date() })
      .leftJoinAndSelect('activity.user', 'user')
      .leftJoinAndSelect('activity.lead', 'lead')
      .leftJoinAndSelect('activity.property', 'property')
      .leftJoinAndSelect('activity.deal', 'deal')
      .orderBy('activity.scheduled_at', 'ASC')
      .getMany();
  }

  async getUpcomingActivities(
    companyId: string,
    hours: number = 24,
  ): Promise<Activity[]> {
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + hours);

    return this.activitiesRepository
      .createQueryBuilder('activity')
      .where('activity.company_id = :companyId', { companyId })
      .andWhere('activity.status = :status', {
        status: ActivityStatus.SCHEDULED,
      })
      .andWhere('activity.scheduled_at <= :futureDate', { futureDate })
      .andWhere('activity.scheduled_at >= :now', { now: new Date() })
      .leftJoinAndSelect('activity.user', 'user')
      .leftJoinAndSelect('activity.lead', 'lead')
      .leftJoinAndSelect('activity.property', 'property')
      .leftJoinAndSelect('activity.deal', 'deal')
      .orderBy('activity.scheduled_at', 'ASC')
      .getMany();
  }

  async getTodaysActivities(companyId: string): Promise<Activity[]> {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    return this.getActivitiesByDateRange(companyId, startOfDay, endOfDay);
  }

  async getActivitiesByLead(
    companyId: string,
    leadId: string,
  ): Promise<Activity[]> {
    return this.activitiesRepository.find({
      where: {
        company_id: companyId,
        lead_id: leadId,
      },
      relations: ['user', 'lead', 'property', 'deal'],
      order: { scheduled_at: 'DESC' },
    });
  }

  async getActivitiesByProperty(
    companyId: string,
    propertyId: string,
  ): Promise<Activity[]> {
    return this.activitiesRepository.find({
      where: {
        company_id: companyId,
        property_id: propertyId,
      },
      relations: ['user', 'lead', 'property', 'deal'],
      order: { scheduled_at: 'DESC' },
    });
  }

  async getActivitiesByDeal(
    companyId: string,
    dealId: string,
  ): Promise<Activity[]> {
    return this.activitiesRepository.find({
      where: {
        company_id: companyId,
        deal_id: dealId,
      },
      relations: ['user', 'lead', 'property', 'deal'],
      order: { scheduled_at: 'DESC' },
    });
  }

  async completeActivity(
    id: string,
    userId: string,
    outcome?: string,
    notes?: string,
  ): Promise<Activity> {
    return this.update(
      id,
      {
        status: ActivityStatus.COMPLETED,
        outcome,
        notes,
      },
      userId,
    );
  }

  async cancelActivity(
    id: string,
    userId: string,
    reason?: string,
  ): Promise<Activity> {
    return this.update(
      id,
      {
        status: ActivityStatus.CANCELLED,
        notes: reason,
      },
      userId,
    );
  }

  async postponeActivity(
    id: string,
    userId: string,
    newScheduledAt: Date,
    reason?: string,
  ): Promise<Activity> {
    return this.update(
      id,
      {
        status: ActivityStatus.POSTPONED,
        scheduled_at: newScheduledAt,
        notes: reason,
      },
      userId,
    );
  }

  async searchActivities(
    companyId: string,
    userId: string,
    searchTerm: string,
  ): Promise<Activity[]> {
    return this.activitiesRepository
      .createQueryBuilder('activity')
      .where('activity.company_id = :companyId', { companyId })
      .andWhere(
        '(activity.title LIKE :search OR activity.description LIKE :search OR activity.outcome LIKE :search OR activity.notes LIKE :search)',
        { search: `%${searchTerm}%` },
      )
      .leftJoinAndSelect('activity.user', 'user')
      .leftJoinAndSelect('activity.lead', 'lead')
      .leftJoinAndSelect('activity.property', 'property')
      .leftJoinAndSelect('activity.deal', 'deal')
      .getMany();
  }

  async getCalendarView(
    companyId: string,
    userId: string,
    month: number,
    year: number,
  ): Promise<any> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const activities = await this.getActivitiesByDateRange(
      companyId,
      startDate,
      endDate,
    );

    // Group activities by date
    const calendar = {};
    activities.forEach((activity) => {
      const dateKey = activity.scheduled_at.toISOString().split('T')[0];
      if (!calendar[dateKey]) {
        calendar[dateKey] = [];
      }
      calendar[dateKey].push(activity);
    });

    return calendar;
  }

  async getActivityStats(companyId: string, userId: string) {
    const activities = await this.findAll(companyId, userId);

    const stats = {
      total: activities.length,
      byStatus: {
        [ActivityStatus.SCHEDULED]: activities.filter(
          (a) => a.status === ActivityStatus.SCHEDULED,
        ).length,
        [ActivityStatus.COMPLETED]: activities.filter(
          (a) => a.status === ActivityStatus.COMPLETED,
        ).length,
        [ActivityStatus.CANCELLED]: activities.filter(
          (a) => a.status === ActivityStatus.CANCELLED,
        ).length,
        [ActivityStatus.POSTPONED]: activities.filter(
          (a) => a.status === ActivityStatus.POSTPONED,
        ).length,
      },
      byType: {
        [ActivityType.CALL]: activities.filter(
          (a) => a.type === ActivityType.CALL,
        ).length,
        [ActivityType.EMAIL]: activities.filter(
          (a) => a.type === ActivityType.EMAIL,
        ).length,
        [ActivityType.MEETING]: activities.filter(
          (a) => a.type === ActivityType.MEETING,
        ).length,
        [ActivityType.WHATSAPP]: activities.filter(
          (a) => a.type === ActivityType.WHATSAPP,
        ).length,
        [ActivityType.SITE_VISIT]: activities.filter(
          (a) => a.type === ActivityType.SITE_VISIT,
        ).length,
        [ActivityType.NOTE]: activities.filter(
          (a) => a.type === ActivityType.NOTE,
        ).length,
        [ActivityType.TASK]: activities.filter(
          (a) => a.type === ActivityType.TASK,
        ).length,
        [ActivityType.FOLLOW_UP]: activities.filter(
          (a) => a.type === ActivityType.FOLLOW_UP,
        ).length,
        [ActivityType.PRESENTATION]: activities.filter(
          (a) => a.type === ActivityType.PRESENTATION,
        ).length,
        [ActivityType.CONTRACT]: activities.filter(
          (a) => a.type === ActivityType.CONTRACT,
        ).length,
        [ActivityType.OTHER]: activities.filter(
          (a) => a.type === ActivityType.OTHER,
        ).length,
      },
      byPriority: {
        [ActivityPriority.LOW]: activities.filter(
          (a) => a.priority === ActivityPriority.LOW,
        ).length,
        [ActivityPriority.MEDIUM]: activities.filter(
          (a) => a.priority === ActivityPriority.MEDIUM,
        ).length,
        [ActivityPriority.HIGH]: activities.filter(
          (a) => a.priority === ActivityPriority.HIGH,
        ).length,
        [ActivityPriority.URGENT]: activities.filter(
          (a) => a.priority === ActivityPriority.URGENT,
        ).length,
      },
      overdue: (await this.getOverdueActivities(companyId)).length,
      today: (await this.getTodaysActivities(companyId)).length,
      upcoming: (await this.getUpcomingActivities(companyId)).length,
      completionRate:
        activities.length > 0
          ? (
              (activities.filter((a) => a.status === ActivityStatus.COMPLETED)
                .length /
                activities.length) *
              100
            ).toFixed(1)
          : 0,
      averageDuration: activities
        .filter((a) => a.duration_minutes)
        .reduce((sum, a, _, arr) => sum + a.duration_minutes / arr.length, 0),
    };

    return stats;
  }
}
