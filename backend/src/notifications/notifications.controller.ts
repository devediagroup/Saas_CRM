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
import { NotificationsService } from './notifications.service';
import type { CreateNotificationDto } from './notifications.service';
import {
  Notification,
  NotificationType,
  NotificationPriority,
} from './entities/notification.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { User } from '../auth/decorators/user.decorator';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @Permissions('notifications.create')
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({
    status: 201,
    description: 'Notification created successfully',
    type: Notification,
  })
  async create(
    @Body() createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @Permissions('notifications.read')
  @ApiOperation({ summary: 'Get all notifications for user' })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
    type: [Notification],
  })
  @ApiQuery({ name: 'type', required: false, enum: NotificationType })
  @ApiQuery({ name: 'priority', required: false, enum: NotificationPriority })
  async findAll(
    @User('id') userId: string,
    @Query('type') type?: NotificationType,
    @Query('priority') priority?: NotificationPriority,
  ): Promise<Notification[]> {
    if (type) {
      return this.notificationsService.getByType(userId, type);
    }

    if (priority) {
      return this.notificationsService.getByPriority(userId, priority);
    }

    return this.notificationsService.findAllByUser(userId);
  }

  @Get('stats')
  @Permissions('notifications.read')
  @ApiOperation({ summary: 'Get notification statistics' })
  @ApiResponse({
    status: 200,
    description: 'Notification statistics retrieved successfully',
  })
  async getStats(@User('id') userId: string) {
    return this.notificationsService.getNotificationStats(userId);
  }

  @Get('unread-count')
  @Permissions('notifications.read')
  @ApiOperation({ summary: 'Get unread notifications count' })
  @ApiResponse({
    status: 200,
    description: 'Unread count retrieved successfully',
  })
  async getUnreadCount(@User('id') userId: string): Promise<{ count: number }> {
    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  @Get(':id')
  @Permissions('notifications.read')
  @ApiOperation({ summary: 'Get notification by ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification retrieved successfully',
    type: Notification,
  })
  async findOne(@Param('id') id: string): Promise<Notification | null> {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id/read')
  @Permissions('notifications.update')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read',
    type: Notification,
  })
  async markAsRead(@Param('id') id: string): Promise<Notification | null> {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('mark-all-read')
  @Permissions('notifications.update')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(
    @User('id') userId: string,
  ): Promise<{ message: string }> {
    await this.notificationsService.markAllAsRead(userId);
    return { message: 'All notifications marked as read' };
  }

  @Delete(':id')
  @Permissions('notifications.delete')
  @ApiOperation({ summary: 'Delete notification' })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted successfully',
  })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.notificationsService.remove(id);
    return { message: 'Notification deleted successfully' };
  }

  // Specific notification endpoints
  @Post('lead-assigned')
  @Permissions('notifications.create')
  @ApiOperation({ summary: 'Create lead assigned notification' })
  @ApiResponse({
    status: 201,
    description: 'Lead assigned notification created',
    type: Notification,
  })
  async createLeadAssignedNotification(
    @Body() body: { leadId: string; leadName: string; agentId: string },
    @User('companyId') companyId: string,
  ): Promise<Notification> {
    return this.notificationsService.createLeadAssignedNotification(
      body.leadId,
      body.leadName,
      body.agentId,
      companyId,
    );
  }

  @Post('deal-stage-changed')
  @Permissions('notifications.create')
  @ApiOperation({ summary: 'Create deal stage changed notification' })
  @ApiResponse({
    status: 201,
    description: 'Deal stage notification created',
    type: Notification,
  })
  async createDealStageChangedNotification(
    @Body()
    body: {
      dealId: string;
      dealName: string;
      newStage: string;
      agentId: string;
    },
    @User('companyId') companyId: string,
  ): Promise<Notification> {
    return this.notificationsService.createDealStageChangedNotification(
      body.dealId,
      body.dealName,
      body.newStage,
      body.agentId,
      companyId,
    );
  }

  @Post('activity-reminder')
  @Permissions('notifications.create')
  @ApiOperation({ summary: 'Create activity reminder notification' })
  @ApiResponse({
    status: 201,
    description: 'Activity reminder notification created',
    type: Notification,
  })
  async createActivityReminderNotification(
    @Body() body: { activityId: string; activityTitle: string; userId: string },
    @User('companyId') companyId: string,
  ): Promise<Notification> {
    return this.notificationsService.createActivityReminderNotification(
      body.activityId,
      body.activityTitle,
      body.userId,
      companyId,
    );
  }

  @Post('overdue-activity')
  @Permissions('notifications.create')
  @ApiOperation({ summary: 'Create overdue activity notification' })
  @ApiResponse({
    status: 201,
    description: 'Overdue activity notification created',
    type: Notification,
  })
  async createOverdueActivityNotification(
    @Body() body: { activityId: string; activityTitle: string; userId: string },
    @User('companyId') companyId: string,
  ): Promise<Notification> {
    return this.notificationsService.createOverdueActivityNotification(
      body.activityId,
      body.activityTitle,
      body.userId,
      companyId,
    );
  }

  @Post('property-inquiry')
  @Permissions('notifications.create')
  @ApiOperation({ summary: 'Create property inquiry notification' })
  @ApiResponse({
    status: 201,
    description: 'Property inquiry notification created',
    type: Notification,
  })
  async createPropertyInquiryNotification(
    @Body()
    body: { propertyId: string; propertyTitle: string; agentId: string },
    @User('companyId') companyId: string,
  ): Promise<Notification> {
    return this.notificationsService.createPropertyInquiryNotification(
      body.propertyId,
      body.propertyTitle,
      body.agentId,
      companyId,
    );
  }

  @Post('system')
  @Permissions('notifications.create')
  @ApiOperation({ summary: 'Create system notification' })
  @ApiResponse({
    status: 201,
    description: 'System notification created',
    type: Notification,
  })
  async createSystemNotification(
    @Body()
    body: { title: string; message: string; priority?: NotificationPriority },
    @User('id') userId: string,
    @User('companyId') companyId: string,
  ): Promise<Notification> {
    return this.notificationsService.createSystemNotification(
      body.title,
      body.message,
      userId,
      companyId,
      body.priority,
    );
  }
}
