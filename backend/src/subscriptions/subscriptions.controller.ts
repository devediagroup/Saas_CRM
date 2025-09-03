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
import { SubscriptionsService } from './subscriptions.service';
import type {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
} from './subscriptions.service';
import {
  Subscription,
  SubscriptionStatus,
  SubscriptionPlan,
  BillingCycle,
} from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';

@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new subscription' })
  @ApiResponse({
    status: 201,
    description: 'Subscription created successfully',
    type: Subscription,
  })
  @ApiResponse({
    status: 409,
    description: 'Company already has an active subscription',
  })
  async create(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @User('companyId') companyId: string,
  ): Promise<Subscription> {
    return this.subscriptionsService.create({
      ...createSubscriptionDto,
      company_id: companyId,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all subscriptions for company' })
  @ApiResponse({
    status: 200,
    description: 'Subscriptions retrieved successfully',
    type: [Subscription],
  })
  async findAll(@User('companyId') companyId: string): Promise<Subscription[]> {
    return this.subscriptionsService.findAll(companyId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active subscription for company' })
  @ApiResponse({
    status: 200,
    description: 'Active subscription retrieved successfully',
    type: Subscription,
  })
  async getActiveSubscription(
    @User('companyId') companyId: string,
  ): Promise<Subscription | null> {
    return this.subscriptionsService.findActiveSubscription(companyId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get subscription statistics' })
  @ApiResponse({
    status: 200,
    description: 'Subscription statistics retrieved successfully',
  })
  async getSubscriptionStats(@User('companyId') companyId: string) {
    return this.subscriptionsService.getSubscriptionStats(companyId);
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Get subscriptions expiring soon' })
  @ApiResponse({
    status: 200,
    description: 'Expiring subscriptions retrieved successfully',
    type: [Subscription],
  })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getExpiringSubscriptions(
    @User('companyId') companyId: string,
    @Query('days') days?: string,
  ): Promise<Subscription[]> {
    const daysThreshold = days ? parseInt(days) : 30;
    return this.subscriptionsService.getExpiringSubscriptions(
      companyId,
      daysThreshold,
    );
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get overdue subscriptions' })
  @ApiResponse({
    status: 200,
    description: 'Overdue subscriptions retrieved successfully',
    type: [Subscription],
  })
  async getOverdueSubscriptions(
    @User('companyId') companyId: string,
  ): Promise<Subscription[]> {
    return this.subscriptionsService.getOverdueSubscriptions(companyId);
  }

  @Get('feature-access/:feature')
  @ApiOperation({ summary: 'Check feature access for company' })
  @ApiResponse({
    status: 200,
    description: 'Feature access checked successfully',
  })
  async checkFeatureAccess(
    @Param('feature') feature: string,
    @User('companyId') companyId: string,
  ) {
    return this.subscriptionsService.checkFeatureAccess(
      companyId,
      feature as any,
    );
  }

  @Get('feature-enabled/:feature')
  @ApiOperation({ summary: 'Check if feature is enabled for company' })
  @ApiResponse({
    status: 200,
    description: 'Feature status checked successfully',
  })
  async isFeatureEnabled(
    @Param('feature') feature: string,
    @User('companyId') companyId: string,
  ): Promise<boolean> {
    return this.subscriptionsService.isFeatureEnabled(
      companyId,
      feature as any,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscription by ID' })
  @ApiResponse({
    status: 200,
    description: 'Subscription retrieved successfully',
    type: Subscription,
  })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async findOne(@Param('id') id: string): Promise<Subscription> {
    return this.subscriptionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription updated successfully',
    type: Subscription,
  })
  async update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ): Promise<Subscription> {
    return this.subscriptionsService.update(id, updateSubscriptionDto);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription cancelled successfully',
    type: Subscription,
  })
  async cancelSubscription(@Param('id') id: string): Promise<Subscription> {
    return this.subscriptionsService.cancelSubscription(id);
  }

  @Patch(':id/suspend')
  @ApiOperation({ summary: 'Suspend subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription suspended successfully',
    type: Subscription,
  })
  async suspendSubscription(@Param('id') id: string): Promise<Subscription> {
    return this.subscriptionsService.suspendSubscription(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription activated successfully',
    type: Subscription,
  })
  async activateSubscription(@Param('id') id: string): Promise<Subscription> {
    return this.subscriptionsService.activateSubscription(id);
  }

  @Patch(':id/renew')
  @ApiOperation({ summary: 'Renew subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription renewed successfully',
    type: Subscription,
  })
  @ApiResponse({
    status: 409,
    description: 'Only active subscriptions can be renewed',
  })
  async renewSubscription(@Param('id') id: string): Promise<Subscription> {
    return this.subscriptionsService.renewSubscription(id);
  }

  @Patch(':id/usage-metrics')
  @ApiOperation({ summary: 'Update subscription usage metrics' })
  @ApiResponse({
    status: 200,
    description: 'Usage metrics updated successfully',
    type: Subscription,
  })
  async updateUsageMetrics(
    @Param('id') id: string,
    @Body()
    usageMetrics: {
      currentUsers: number;
      currentProperties: number;
      currentLeads: number;
      currentDeals: number;
      currentDevelopers: number;
      currentProjects: number;
    },
  ): Promise<Subscription> {
    return this.subscriptionsService.updateUsageMetrics(id, usageMetrics);
  }

  @Post(':id/billing-record')
  @ApiOperation({ summary: 'Add billing record to subscription' })
  @ApiResponse({
    status: 201,
    description: 'Billing record added successfully',
    type: Subscription,
  })
  async addBillingRecord(
    @Param('id') id: string,
    @Body()
    billingRecord: {
      amount: number;
      status: string;
      invoice_id: string;
    },
  ): Promise<Subscription> {
    return this.subscriptionsService.addBillingRecord(id, billingRecord);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription deleted successfully',
  })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.subscriptionsService.remove(id);
    return { message: 'Subscription deleted successfully' };
  }
}
