import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import type {
  DashboardKPIs,
  LeadAnalytics,
  SalesAnalytics,
  PropertyAnalytics,
  DeveloperAnalytics,
  ActivityAnalytics,
} from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { User } from '../auth/decorators/user.decorator';

@ApiTags('Analytics & Reports')
@Controller('analytics')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @Permissions('analytics.read')
  @ApiOperation({ summary: 'Get dashboard KPIs' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard KPIs retrieved successfully',
    type: Object,
  })
  async getDashboardKPIs(
    @User('companyId') companyId: string,
  ): Promise<DashboardKPIs> {
    return this.analyticsService.getDashboardKPIs(companyId);
  }

  @Get('leads')
  @Permissions('analytics.read')
  @ApiOperation({ summary: 'Get lead analytics' })
  @ApiResponse({
    status: 200,
    description: 'Lead analytics retrieved successfully',
    type: Object,
  })
  @ApiQuery({ name: 'start_date', required: false, type: Date })
  @ApiQuery({ name: 'end_date', required: false, type: Date })
  async getLeadAnalytics(
    @User('companyId') companyId: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ): Promise<LeadAnalytics> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.getLeadAnalytics(companyId, start, end);
  }

  @Get('sales')
  @Permissions('analytics.read')
  @ApiOperation({ summary: 'Get sales analytics' })
  @ApiResponse({
    status: 200,
    description: 'Sales analytics retrieved successfully',
    type: Object,
  })
  @ApiQuery({ name: 'start_date', required: false, type: Date })
  @ApiQuery({ name: 'end_date', required: false, type: Date })
  async getSalesAnalytics(
    @User('companyId') companyId: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ): Promise<SalesAnalytics> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.getSalesAnalytics(companyId, start, end);
  }

  @Get('properties')
  @Permissions('analytics.read')
  @ApiOperation({ summary: 'Get property analytics' })
  @ApiResponse({
    status: 200,
    description: 'Property analytics retrieved successfully',
    type: Object,
  })
  @ApiQuery({ name: 'start_date', required: false, type: Date })
  @ApiQuery({ name: 'end_date', required: false, type: Date })
  async getPropertyAnalytics(
    @User('companyId') companyId: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ): Promise<PropertyAnalytics> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.getPropertyAnalytics(companyId, start, end);
  }

  @Get('developers')
  @Permissions('analytics.read')
  @ApiOperation({ summary: 'Get developer analytics' })
  @ApiResponse({
    status: 200,
    description: 'Developer analytics retrieved successfully',
    type: Object,
  })
  @ApiQuery({ name: 'start_date', required: false, type: Date })
  @ApiQuery({ name: 'end_date', required: false, type: Date })
  async getDeveloperAnalytics(
    @User('companyId') companyId: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ): Promise<DeveloperAnalytics> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.getDeveloperAnalytics(companyId, start, end);
  }

  @Get('activities')
  @Permissions('analytics.read')
  @ApiOperation({ summary: 'Get activity analytics' })
  @ApiResponse({
    status: 200,
    description: 'Activity analytics retrieved successfully',
    type: Object,
  })
  @ApiQuery({ name: 'start_date', required: false, type: Date })
  @ApiQuery({ name: 'end_date', required: false, type: Date })
  async getActivityAnalytics(
    @User('companyId') companyId: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ): Promise<ActivityAnalytics> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.getActivityAnalytics(companyId, start, end);
  }

  @Get('comprehensive')
  @ApiOperation({ summary: 'Get comprehensive analytics report' })
  @ApiResponse({
    status: 200,
    description: 'Comprehensive analytics retrieved successfully',
    type: Object,
  })
  @ApiQuery({ name: 'start_date', required: false, type: Date })
  @ApiQuery({ name: 'end_date', required: false, type: Date })
  async getComprehensiveAnalytics(
    @User('companyId') companyId: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const [
      dashboardKPIs,
      leadAnalytics,
      salesAnalytics,
      propertyAnalytics,
      developerAnalytics,
      activityAnalytics,
    ] = await Promise.all([
      this.analyticsService.getDashboardKPIs(companyId),
      this.analyticsService.getLeadAnalytics(companyId, start, end),
      this.analyticsService.getSalesAnalytics(companyId, start, end),
      this.analyticsService.getPropertyAnalytics(companyId, start, end),
      this.analyticsService.getDeveloperAnalytics(companyId, start, end),
      this.analyticsService.getActivityAnalytics(companyId, start, end),
    ]);

    return {
      dashboard: dashboardKPIs,
      leads: leadAnalytics,
      sales: salesAnalytics,
      properties: propertyAnalytics,
      developers: developerAnalytics,
      activities: activityAnalytics,
      generatedAt: new Date(),
      dateRange: {
        start: start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        end: end || new Date(),
      },
      summary: {
        totalRevenue: dashboardKPIs.totalRevenue,
        totalLeads: dashboardKPIs.totalLeads,
        totalDeals: dashboardKPIs.totalDeals,
        conversionRate: dashboardKPIs.conversionRate,
        averageDealValue: dashboardKPIs.averageDealValue,
      },
    };
  }

  @Get('reports/leads')
  @ApiOperation({ summary: 'Generate lead report' })
  @ApiResponse({
    status: 200,
    description: 'Lead report generated successfully',
    type: Object,
  })
  @ApiQuery({ name: 'start_date', required: true, type: Date })
  @ApiQuery({ name: 'end_date', required: true, type: Date })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv', 'pdf'] })
  async generateLeadReport(
    @User('companyId') companyId: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @Query('format') format: 'json' | 'csv' | 'pdf' = 'json',
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const leadAnalytics = await this.analyticsService.getLeadAnalytics(
      companyId,
      start,
      end,
    );

    return {
      report: 'Lead Analytics Report',
      dateRange: { start, end },
      generatedAt: new Date(),
      data: leadAnalytics,
      format,
      // TODO: Implement CSV and PDF export
    };
  }

  @Get('reports/sales')
  @Permissions('analytics.read')
  @ApiOperation({ summary: 'Generate sales report' })
  @ApiResponse({
    status: 200,
    description: 'Sales report generated successfully',
    type: Object,
  })
  @ApiQuery({ name: 'start_date', required: true, type: Date })
  @ApiQuery({ name: 'end_date', required: true, type: Date })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv', 'pdf'] })
  async generateSalesReport(
    @User('companyId') companyId: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @Query('format') format: 'json' | 'csv' | 'pdf' = 'json',
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const salesAnalytics = await this.analyticsService.getSalesAnalytics(
      companyId,
      start,
      end,
    );

    return {
      report: 'Sales Analytics Report',
      dateRange: { start, end },
      generatedAt: new Date(),
      data: salesAnalytics,
      format,
      // TODO: Implement CSV and PDF export
    };
  }

  @Get('reports/properties')
  @Permissions('analytics.read')
  @ApiOperation({ summary: 'Generate property report' })
  @ApiResponse({
    status: 200,
    description: 'Property report generated successfully',
    type: Object,
  })
  @ApiQuery({ name: 'start_date', required: true, type: Date })
  @ApiQuery({ name: 'end_date', required: true, type: Date })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv', 'pdf'] })
  async generatePropertyReport(
    @User('companyId') companyId: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @Query('format') format: 'json' | 'csv' | 'pdf' = 'json',
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const propertyAnalytics = await this.analyticsService.getPropertyAnalytics(
      companyId,
      start,
      end,
    );

    return {
      report: 'Property Analytics Report',
      dateRange: { start, end },
      generatedAt: new Date(),
      data: propertyAnalytics,
      format,
      // TODO: Implement CSV and PDF export
    };
  }

  @Get('reports/developers')
  @Permissions('analytics.read')
  @ApiOperation({ summary: 'Generate developer report' })
  @ApiResponse({
    status: 200,
    description: 'Developer report generated successfully',
    type: Object,
  })
  @ApiQuery({ name: 'start_date', required: true, type: Date })
  @ApiQuery({ name: 'end_date', required: true, type: Date })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv', 'pdf'] })
  async generateDeveloperReport(
    @User('companyId') companyId: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @Query('format') format: 'json' | 'csv' | 'pdf' = 'json',
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const developerAnalytics =
      await this.analyticsService.getDeveloperAnalytics(companyId, start, end);

    return {
      report: 'Developer Analytics Report',
      dateRange: { start, end },
      generatedAt: new Date(),
      data: developerAnalytics,
      format,
      // TODO: Implement CSV and PDF export
    };
  }

  @Get('reports/activities')
  @Permissions('analytics.read')
  @ApiOperation({ summary: 'Generate activity report' })
  @ApiResponse({
    status: 200,
    description: 'Activity report generated successfully',
    type: Object,
  })
  @ApiQuery({ name: 'start_date', required: true, type: Date })
  @ApiQuery({ name: 'end_date', required: true, type: Date })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv', 'pdf'] })
  async generateActivityReport(
    @User('companyId') companyId: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @Query('format') format: 'json' | 'csv' | 'pdf' = 'json',
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const activityAnalytics = await this.analyticsService.getActivityAnalytics(
      companyId,
      start,
      end,
    );

    return {
      report: 'Activity Analytics Report',
      dateRange: { start, end },
      generatedAt: new Date(),
      data: activityAnalytics,
      format,
      // TODO: Implement CSV and PDF export
    };
  }
}
