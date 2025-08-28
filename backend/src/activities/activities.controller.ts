import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { Activity, ActivityType, ActivityStatus, ActivityPriority } from './entities/activity.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new activity' })
  @ApiResponse({ status: 201, description: 'Activity created successfully', type: Activity })
  async create(
    @Body() createActivityDto: CreateActivityDto,
    @User('companyId') companyId: string,
    @User('id') userId: string,
  ): Promise<Activity> {
    return this.activitiesService.create({
      ...createActivityDto,
      company_id: companyId,
      user_id: userId,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all activities for company' })
  @ApiResponse({ status: 200, description: 'Activities retrieved successfully', type: [Activity] })
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
    @Query('status') status?: ActivityStatus,
    @Query('type') type?: ActivityType,
    @Query('priority') priority?: ActivityPriority,
    @Query('user') userId?: string,
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
      return this.activitiesService.getActivitiesByPriority(companyId, priority);
    }

    if (userId) {
      return this.activitiesService.getActivitiesByUser(companyId, userId);
    }

    if (leadId) {
      return this.activitiesService.getActivitiesByLead(companyId, leadId);
    }

    if (propertyId) {
      return this.activitiesService.getActivitiesByProperty(companyId, propertyId);
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
      return this.activitiesService.getUpcomingActivities(companyId, parseInt(upcomingHours));
    }

    if (search) {
      return this.activitiesService.searchActivities(companyId, search);
    }

    return this.activitiesService.findAll(companyId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get activity statistics' })
  @ApiResponse({ status: 200, description: 'Activity statistics retrieved successfully' })
  async getActivityStats(@User('companyId') companyId: string) {
    return this.activitiesService.getActivityStats(companyId);
  }

  @Get('calendar/:year/:month')
  @ApiOperation({ summary: 'Get calendar view of activities' })
  @ApiResponse({ status: 200, description: 'Calendar view retrieved successfully' })
  async getCalendarView(
    @Param('year') year: string,
    @Param('month') month: string,
    @User('companyId') companyId: string,
  ) {
    return this.activitiesService.getCalendarView(companyId, parseInt(month), parseInt(year));
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get overdue activities' })
  @ApiResponse({ status: 200, description: 'Overdue activities retrieved successfully', type: [Activity] })
  async getOverdueActivities(@User('companyId') companyId: string): Promise<Activity[]> {
    return this.activitiesService.getOverdueActivities(companyId);
  }

  @Get('today')
  @ApiOperation({ summary: 'Get today\'s activities' })
  @ApiResponse({ status: 200, description: 'Today\'s activities retrieved successfully', type: [Activity] })
  async getTodaysActivities(@User('companyId') companyId: string): Promise<Activity[]> {
    return this.activitiesService.getTodaysActivities(companyId);
  }

  @Get('upcoming/:hours')
  @ApiOperation({ summary: 'Get upcoming activities' })
  @ApiResponse({ status: 200, description: 'Upcoming activities retrieved successfully', type: [Activity] })
  async getUpcomingActivities(
    @Param('hours') hours: string,
    @User('companyId') companyId: string,
  ): Promise<Activity[]> {
    return this.activitiesService.getUpcomingActivities(companyId, parseInt(hours));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get activity by ID' })
  @ApiResponse({ status: 200, description: 'Activity retrieved successfully', type: Activity })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async findOne(@Param('id') id: string): Promise<Activity> {
    return this.activitiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update activity' })
  @ApiResponse({ status: 200, description: 'Activity updated successfully', type: Activity })
  async update(
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
  ): Promise<Activity> {
    return this.activitiesService.update(id, updateActivityDto);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Complete activity' })
  @ApiResponse({ status: 200, description: 'Activity completed successfully', type: Activity })
  async completeActivity(
    @Param('id') id: string,
    @Body() body: { outcome?: string; notes?: string },
  ): Promise<Activity> {
    return this.activitiesService.completeActivity(id, body.outcome, body.notes);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel activity' })
  @ApiResponse({ status: 200, description: 'Activity cancelled successfully', type: Activity })
  async cancelActivity(
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ): Promise<Activity> {
    return this.activitiesService.cancelActivity(id, body.reason);
  }

  @Patch(':id/postpone')
  @ApiOperation({ summary: 'Postpone activity' })
  @ApiResponse({ status: 200, description: 'Activity postponed successfully', type: Activity })
  async postponeActivity(
    @Param('id') id: string,
    @Body() body: { newScheduledAt: Date; reason?: string },
  ): Promise<Activity> {
    return this.activitiesService.postponeActivity(id, body.newScheduledAt, body.reason);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete activity' })
  @ApiResponse({ status: 200, description: 'Activity deleted successfully' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.activitiesService.remove(id);
    return { message: 'Activity deleted successfully' };
  }
}
