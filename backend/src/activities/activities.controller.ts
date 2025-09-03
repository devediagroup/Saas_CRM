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
import { ActivitiesService } from './activities.service';
import {
  Activity,
  ActivityType,
  ActivityStatus,
  ActivityPriority,
} from './entities/activity.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { User } from '../auth/decorators/user.decorator';

class CreateActivityDto {
  title: string;
  description?: string;
  type: ActivityType;
  status?: ActivityStatus;
  priority?: ActivityPriority;
  scheduled_at: Date;
  completed_at?: Date;
  duration_minutes?: number;
  outcome?: string;
  notes?: string;
  attachments?: string[];
  participants?: Record<string, any>[];
  is_recurring?: boolean;
  recurrence_pattern?: string;
  send_notification?: boolean;
  reminder_minutes_before?: number;
  custom_fields?: Record<string, any>;
  cost?: number;
  lead_id?: string;
  property_id?: string;
  deal_id?: string;
}

class UpdateActivityDto {
  title?: string;
  description?: string;
  type?: ActivityType;
  status?: ActivityStatus;
  priority?: ActivityPriority;
  scheduled_at?: Date;
  completed_at?: Date;
  duration_minutes?: number;
  outcome?: string;
  notes?: string;
  attachments?: string[];
  participants?: Record<string, any>[];
  is_recurring?: boolean;
  recurrence_pattern?: string;
  send_notification?: boolean;
  reminder_minutes_before?: number;
  custom_fields?: Record<string, any>;
  cost?: number;
  lead_id?: string;
  property_id?: string;
  deal_id?: string;
}

@ApiTags('Activities')
@Controller('activities')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @Permissions('activities.create')
  @ApiOperation({ summary: 'Create a new activity' })
  @ApiResponse({
    status: 201,
    description: 'Activity created successfully',
    type: Activity,
  })
  async create(
    @Body() createActivityDto: CreateActivityDto,
    @User('companyId') companyId: string,
    @User('id') userId: string,
  ): Promise<Activity> {
    return this.activitiesService.create(
      {
        ...createActivityDto,
        company_id: companyId,
        user_id: userId,
      },
      userId,
    );
  }

  @Get()
  @Permissions('activities.read')
  @ApiOperation({ summary: 'Get all activities for company' })
  @ApiResponse({
    status: 200,
    description: 'Activities retrieved successfully',
    type: [Activity],
  })
  @ApiQuery({ name: 'status', required: false, enum: ActivityStatus })
  @ApiQuery({ name: 'type', required: false, enum: ActivityType })
  @ApiQuery({ name: 'priority', required: false, enum: ActivityPriority })
  @ApiQuery({ name: 'user', required: false })
  @ApiQuery({ name: 'lead', required: false })
  @ApiQuery({ name: 'property', required: false })
  @ApiQuery({ name: 'deal', required: false })
  @ApiQuery({ name: 'overdue', required: false, type: Boolean })
  @ApiQuery({ name: 'today', required: false, type: Boolean })
  @ApiQuery({ name: 'upcoming', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @User('companyId') companyId: string,
    @User('id') userId: string,
    @Query('status') status?: ActivityStatus,
    @Query('type') type?: ActivityType,
    @Query('priority') priority?: ActivityPriority,
    @Query('user') userQueryId?: string,
    @Query('lead') leadId?: string,
    @Query('property') propertyId?: string,
    @Query('deal') dealId?: string,
    @Query('overdue') overdue?: string,
    @Query('today') today?: string,
    @Query('upcoming') upcomingHours?: string,
    @Query('search') search?: string,
  ): Promise<Activity[]> {
    // Handle different query types
    if (status) {
      return this.activitiesService.getActivitiesByStatus(companyId, status);
    }

    if (type) {
      return this.activitiesService.getActivitiesByType(companyId, type);
    }

    if (priority) {
      return this.activitiesService.getActivitiesByPriority(
        companyId,
        priority,
      );
    }

    if (userQueryId) {
      return this.activitiesService.getActivitiesByUser(companyId, userQueryId);
    }

    if (leadId) {
      return this.activitiesService.getActivitiesByLead(companyId, leadId);
    }

    if (propertyId) {
      return this.activitiesService.getActivitiesByProperty(
        companyId,
        propertyId,
      );
    }

    if (dealId) {
      return this.activitiesService.getActivitiesByDeal(companyId, dealId);
    }

    if (overdue === 'true') {
      return this.activitiesService.getOverdueActivities(companyId);
    }

    if (today === 'true') {
      return this.activitiesService.getTodaysActivities(companyId);
    }

    if (upcomingHours) {
      return this.activitiesService.getUpcomingActivities(
        companyId,
        parseInt(upcomingHours),
      );
    }

    if (search) {
      return this.activitiesService.searchActivities(companyId, userId, search);
    }

    return this.activitiesService.findAll(companyId, userId);
  }

  @Get('stats')
  @Permissions('activities.read')
  @ApiOperation({ summary: 'Get activity statistics' })
  @ApiResponse({
    status: 200,
    description: 'Activity statistics retrieved successfully',
  })
  async getActivityStats(
    @User('companyId') companyId: string,
    @User('id') userId: string,
  ) {
    return this.activitiesService.getActivityStats(companyId, userId);
  }

  @Get('calendar/:year/:month')
  @Permissions('activities.read')
  @ApiOperation({ summary: 'Get calendar view of activities' })
  @ApiResponse({
    status: 200,
    description: 'Calendar view retrieved successfully',
  })
  async getCalendarView(
    @Param('year') year: string,
    @Param('month') month: string,
    @User('companyId') companyId: string,
    @User('id') userId: string,
  ) {
    return this.activitiesService.getCalendarView(
      companyId,
      userId,
      parseInt(month),
      parseInt(year),
    );
  }

  @Get('overdue')
  @Permissions('activities.read')
  @ApiOperation({ summary: 'Get overdue activities' })
  @ApiResponse({
    status: 200,
    description: 'Overdue activities retrieved successfully',
    type: [Activity],
  })
  async getOverdueActivities(
    @User('companyId') companyId: string,
  ): Promise<Activity[]> {
    return this.activitiesService.getOverdueActivities(companyId);
  }

  @Get('today')
  @Permissions('activities.read')
  @ApiOperation({ summary: "Get today's activities" })
  @ApiResponse({
    status: 200,
    description: "Today's activities retrieved successfully",
    type: [Activity],
  })
  async getTodaysActivities(
    @User('companyId') companyId: string,
  ): Promise<Activity[]> {
    return this.activitiesService.getTodaysActivities(companyId);
  }

  @Get('upcoming/:hours')
  @Permissions('activities.read')
  @ApiOperation({ summary: 'Get upcoming activities' })
  @ApiResponse({
    status: 200,
    description: 'Upcoming activities retrieved successfully',
    type: [Activity],
  })
  async getUpcomingActivities(
    @Param('hours') hours: string,
    @User('companyId') companyId: string,
  ): Promise<Activity[]> {
    return this.activitiesService.getUpcomingActivities(
      companyId,
      parseInt(hours),
    );
  }

  @Get(':id')
  @Permissions('activities.read')
  @ApiOperation({ summary: 'Get activity by ID' })
  @ApiResponse({
    status: 200,
    description: 'Activity retrieved successfully',
    type: Activity,
  })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async findOne(
    @Param('id') id: string,
    @User('id') userId: string,
  ): Promise<Activity> {
    return this.activitiesService.findOne(id, userId);
  }

  @Patch(':id')
  @Permissions('activities.update')
  @ApiOperation({ summary: 'Update activity' })
  @ApiResponse({
    status: 200,
    description: 'Activity updated successfully',
    type: Activity,
  })
  async update(
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
    @User('id') userId: string,
  ): Promise<Activity> {
    return this.activitiesService.update(id, updateActivityDto, userId);
  }

  @Patch(':id/complete')
  @Permissions('activities.update')
  @ApiOperation({ summary: 'Complete activity' })
  @ApiResponse({
    status: 200,
    description: 'Activity completed successfully',
    type: Activity,
  })
  async completeActivity(
    @Param('id') id: string,
    @Body() body: { outcome?: string; notes?: string },
    @User('id') userId: string,
  ): Promise<Activity> {
    return this.activitiesService.completeActivity(
      id,
      userId,
      body.outcome,
      body.notes,
    );
  }

  @Patch(':id/cancel')
  @Permissions('activities.update')
  @ApiOperation({ summary: 'Cancel activity' })
  @ApiResponse({
    status: 200,
    description: 'Activity cancelled successfully',
    type: Activity,
  })
  async cancelActivity(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @User('id') userId: string,
  ): Promise<Activity> {
    return this.activitiesService.cancelActivity(id, userId, body.reason);
  }

  @Patch(':id/postpone')
  @Permissions('activities.update')
  @ApiOperation({ summary: 'Postpone activity' })
  @ApiResponse({
    status: 200,
    description: 'Activity postponed successfully',
    type: Activity,
  })
  async postponeActivity(
    @Param('id') id: string,
    @Body() body: { newScheduledAt: Date; reason?: string },
    @User('id') userId: string,
  ): Promise<Activity> {
    return this.activitiesService.postponeActivity(
      id,
      userId,
      body.newScheduledAt,
      body.reason,
    );
  }

  @Delete(':id')
  @Permissions('activities.delete')
  @ApiOperation({ summary: 'Delete activity' })
  @ApiResponse({ status: 200, description: 'Activity deleted successfully' })
  async remove(
    @Param('id') id: string,
    @User('id') userId: string,
  ): Promise<{ message: string }> {
    await this.activitiesService.remove(id, userId);
    return { message: 'Activity deleted successfully' };
  }
}
