import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailService } from '../email/email.service';
import { Notification, NotificationType, NotificationPriority } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';

export interface CreateNotificationDto {
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  user_id: string;
  company_id: string;
  related_entity_id?: string;
  related_entity_type?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  private logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    private emailService: EmailService,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      ...createNotificationDto,
      is_read: false,
      created_at: new Date(),
    });

    const savedNotification = await this.notificationsRepository.save(notification);

    // Send email notification if email service is configured
    try {
      await this.sendEmailNotification(savedNotification);
    } catch (error) {
      this.logger.error(`Failed to send email notification: ${error.message}`);
    }

    return savedNotification;
  }

  async findAllByUser(userId: string): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Notification | null> {
    return this.notificationsRepository.findOne({
      where: { id },
    });
  }

  async markAsRead(id: string): Promise<Notification | null> {
    const notification = await this.findOne(id);
    if (!notification) return null;

    notification.is_read = true;
    notification.read_at = new Date();
    return this.notificationsRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.update(
      { user_id: userId, is_read: false },
      { is_read: true, read_at: new Date() },
    );
  }

  async remove(id: string): Promise<void> {
    await this.notificationsRepository.delete(id);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationsRepository.count({
      where: { user_id: userId, is_read: false },
    });
  }

  async getByType(userId: string, type: NotificationType): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { user_id: userId, type },
      order: { created_at: 'DESC' },
    });
  }

  async getByPriority(userId: string, priority: NotificationPriority): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { user_id: userId, priority },
      order: { created_at: 'DESC' },
    });
  }

  private async sendEmailNotification(notification: Notification): Promise<void> {
    // Only send email for high priority notifications
    if (notification.priority === NotificationPriority.HIGH || notification.priority === NotificationPriority.URGENT) {
      // Note: We would need to get user email from user service
      // For now, we'll skip email sending as we don't have user email in this context
      // In a real implementation, you would fetch user details and send email
      this.logger.log(`Would send email notification: ${notification.title}`);
    }
  }

  // Specific notification creation methods
  async createLeadAssignedNotification(leadId: string, leadName: string, agentId: string, companyId: string): Promise<Notification> {
    return this.create({
      title: 'New Lead Assigned',
      message: `You have been assigned a new lead: ${leadName}`,
      type: NotificationType.LEAD_ASSIGNED,
      priority: NotificationPriority.MEDIUM,
      user_id: agentId,
      company_id: companyId,
      related_entity_id: leadId,
      related_entity_type: 'lead',
    });
  }

  async createDealStageChangedNotification(dealId: string, dealName: string, newStage: string, agentId: string, companyId: string): Promise<Notification> {
    return this.create({
      title: 'Deal Stage Changed',
      message: `Deal "${dealName}" has moved to stage: ${newStage}`,
      type: NotificationType.DEAL_UPDATED,
      priority: NotificationPriority.MEDIUM,
      user_id: agentId,
      company_id: companyId,
      related_entity_id: dealId,
      related_entity_type: 'deal',
    });
  }

  async createActivityReminderNotification(activityId: string, activityTitle: string, userId: string, companyId: string): Promise<Notification> {
    return this.create({
      title: 'Activity Reminder',
      message: `Upcoming activity: ${activityTitle}`,
      type: NotificationType.ACTIVITY_REMINDER,
      priority: NotificationPriority.LOW,
      user_id: userId,
      company_id: companyId,
      related_entity_id: activityId,
      related_entity_type: 'activity',
    });
  }

  async createOverdueActivityNotification(activityId: string, activityTitle: string, userId: string, companyId: string): Promise<Notification> {
    return this.create({
      title: 'Overdue Activity',
      message: `Activity "${activityTitle}" is now overdue`,
      type: NotificationType.ACTIVITY_OVERDUE,
      priority: NotificationPriority.HIGH,
      user_id: userId,
      company_id: companyId,
      related_entity_id: activityId,
      related_entity_type: 'activity',
    });
  }

  async createPropertyInquiryNotification(propertyId: string, propertyTitle: string, agentId: string, companyId: string): Promise<Notification> {
    return this.create({
      title: 'New Property Inquiry',
      message: `New inquiry received for property: ${propertyTitle}`,
      type: NotificationType.PROPERTY_INQUIRY,
      priority: NotificationPriority.MEDIUM,
      user_id: agentId,
      company_id: companyId,
      related_entity_id: propertyId,
      related_entity_type: 'property',
    });
  }

  async createSystemNotification(title: string, message: string, userId: string, companyId: string, priority: NotificationPriority = NotificationPriority.LOW): Promise<Notification> {
    return this.create({
      title,
      message,
      type: NotificationType.SYSTEM,
      priority,
      user_id: userId,
      company_id: companyId,
    });
  }

  // Bulk operations
  async createBulkNotifications(notifications: CreateNotificationDto[]): Promise<Notification[]> {
    const createdNotifications: Notification[] = [];

    for (const notificationDto of notifications) {
      const notification = await this.create(notificationDto);
      createdNotifications.push(notification);
    }

    return createdNotifications;
  }

  async deleteOldNotifications(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.notificationsRepository.delete({
      created_at: {
        $lt: cutoffDate,
      } as any,
    });

    return result.affected || 0;
  }

  // Statistics
  async getNotificationStats(userId: string): Promise<any> {
    const total = await this.notificationsRepository.count({
      where: { user_id: userId },
    });

    const unread = await this.getUnreadCount(userId);

    const byType = await Promise.all(
      Object.values(NotificationType).map(async (type) => ({
        type,
        count: await this.notificationsRepository.count({
          where: { user_id: userId, type },
        }),
      })),
    );

    const byPriority = await Promise.all(
      Object.values(NotificationPriority).map(async (priority) => ({
        priority,
        count: await this.notificationsRepository.count({
          where: { user_id: userId, priority },
        }),
      })),
    );

    return {
      total,
      unread,
      read: total - unread,
      byType,
      byPriority,
    };
  }
}
