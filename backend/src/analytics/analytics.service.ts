import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, LessThan } from 'typeorm';
import { Lead, LeadStatus } from '../leads/entities/lead.entity';
import { Deal } from '../deals/entities/deal.entity';
import { Property } from '../properties/entities/property.entity';
import { Activity } from '../activities/entities/activity.entity';
import { Developer } from '../developers/entities/developer.entity';
import { Project } from '../projects/entities/project.entity';

export interface DashboardKPIs {
  totalLeads: number;
  totalDeals: number;
  totalProperties: number;
  totalDevelopers: number;
  totalProjects: number;
  totalRevenue: number;
  totalActivities: number;
  conversionRate: number;
  averageDealValue: number;
  activeUsers: number;
}

export interface LeadAnalytics {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  leadSources: Record<string, number>;
  leadStatusDistribution: Record<string, number>;
  leadPriorityDistribution: Record<string, number>;
  averageLeadScore: number;
  topLeadSources: Array<{ source: string; count: number }>;
  leadConversionTrend: Array<{ date: string; count: number }>;
}

export interface SalesAnalytics {
  totalDeals: number;
  activeDeals: number;
  closedDeals: number;
  totalRevenue: number;
  averageDealValue: number;
  dealStageDistribution: Record<string, number>;
  dealTypeDistribution: Record<string, number>;
  topSalesAgents: Array<{ agent: string; deals: number; revenue: number }>;
  salesTrend: Array<{ date: string; deals: number; revenue: number }>;
  conversionRateByStage: Record<string, number>;
}

export interface PropertyAnalytics {
  totalProperties: number;
  availableProperties: number;
  soldProperties: number;
  rentedProperties: number;
  propertyTypeDistribution: Record<string, number>;
  propertyStatusDistribution: Record<string, number>;
  averagePropertyPrice: number;
  topViewedProperties: Array<{ property: string; views: number }>;
  propertyLocationDistribution: Record<string, number>;
  propertyPriceRange: Array<{ range: string; count: number }>;
}

export interface DeveloperAnalytics {
  totalDevelopers: number;
  activeDevelopers: number;
  totalProjects: number;
  completedProjects: number;
  totalInvestment: number;
  developerTypeDistribution: Record<string, number>;
  topDevelopers: Array<{
    developer: string;
    projects: number;
    investment: number;
  }>;
  projectStatusDistribution: Record<string, number>;
  investmentTrend: Array<{ date: string; investment: number }>;
}

export interface ActivityAnalytics {
  totalActivities: number;
  completedActivities: number;
  pendingActivities: number;
  overdueActivities: number;
  activityTypeDistribution: Record<string, number>;
  activityStatusDistribution: Record<string, number>;
  averageCompletionTime: number;
  topActivityTypes: Array<{ type: string; count: number }>;
  activityTrend: Array<{ date: string; count: number }>;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(Lead)
    private leadsRepository: Repository<Lead>,
    @InjectRepository(Deal)
    private dealsRepository: Repository<Deal>,
    @InjectRepository(Property)
    private propertiesRepository: Repository<Property>,
    @InjectRepository(Activity)
    private activitiesRepository: Repository<Activity>,
    @InjectRepository(Developer)
    private developersRepository: Repository<Developer>,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async getDashboardKPIs(companyId: string): Promise<DashboardKPIs> {
    const [
      totalLeads,
      totalDeals,
      totalProperties,
      totalDevelopers,
      totalProjects,
      totalActivities,
      totalRevenue,
      activeUsers,
    ] = await Promise.all([
      this.leadsRepository.count({ where: { company_id: companyId } }),
      this.dealsRepository.count({ where: { company_id: companyId } }),
      this.propertiesRepository.count({ where: { company_id: companyId } }),
      this.developersRepository.count({ where: { company_id: companyId } }),
      this.projectsRepository.count({ where: { company_id: companyId } }),
      this.activitiesRepository.count({ where: { company_id: companyId } }),
      this.getTotalRevenue(companyId),
      this.getActiveUsers(companyId),
    ]);

    const convertedLeads = await this.leadsRepository.count({
      where: { company_id: companyId, status: LeadStatus.CLOSED_WON },
    });

    const conversionRate =
      totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
    const averageDealValue = totalDeals > 0 ? totalRevenue / totalDeals : 0;

    return {
      totalLeads,
      totalDeals,
      totalProperties,
      totalDevelopers,
      totalProjects,
      totalRevenue,
      totalActivities,
      conversionRate: Math.round(conversionRate * 100) / 100,
      averageDealValue: Math.round(averageDealValue * 100) / 100,
      activeUsers,
    };
  }

  async getLeadAnalytics(
    companyId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<LeadAnalytics> {
    const whereCondition: any = { company_id: companyId };
    if (startDate && endDate) {
      whereCondition.created_at = Between(startDate, endDate);
    }

    const leads = await this.leadsRepository.find({ where: whereCondition });

    const leadSources: Record<string, number> = {};
    const leadStatusDistribution: Record<string, number> = {};
    const leadPriorityDistribution: Record<string, number> = {};

    leads.forEach((lead) => {
      // Lead sources
      if (lead.lead_source_id) {
        leadSources[lead.lead_source_id] =
          (leadSources[lead.lead_source_id] || 0) + 1;
      }

      // Status distribution
      leadStatusDistribution[lead.status] =
        (leadStatusDistribution[lead.status] || 0) + 1;

      // Priority distribution
      leadPriorityDistribution[lead.priority] =
        (leadPriorityDistribution[lead.priority] || 0) + 1;
    });

    const topLeadSources = Object.entries(leadSources)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const leadConversionTrend = this.generateDateTrend(leads, 'created_at');

    return {
      totalLeads: leads.length,
      newLeads: leads.filter((lead) => lead.status === 'new').length,
      qualifiedLeads: leads.filter((lead) => lead.status === 'qualified')
        .length,
      convertedLeads: leads.filter(
        (lead) => lead.status === LeadStatus.CLOSED_WON,
      ).length,
      leadSources,
      leadStatusDistribution,
      leadPriorityDistribution,
      averageLeadScore: 0, // TODO: Implement lead scoring
      topLeadSources,
      leadConversionTrend,
    };
  }

  async getSalesAnalytics(
    companyId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<SalesAnalytics> {
    const whereCondition: any = { company_id: companyId };
    if (startDate && endDate) {
      whereCondition.created_at = Between(startDate, endDate);
    }

    const deals = await this.dealsRepository.find({ where: whereCondition });

    const dealStageDistribution: Record<string, number> = {};
    const dealTypeDistribution: Record<string, number> = {};
    const conversionRateByStage: Record<string, number> = {};

    deals.forEach((deal) => {
      // Stage distribution
      dealStageDistribution[deal.stage] =
        (dealStageDistribution[deal.stage] || 0) + 1;

      // Type distribution
      dealTypeDistribution[deal.deal_type] =
        (dealTypeDistribution[deal.deal_type] || 0) + 1;
    });

    // Calculate conversion rates by stage
    Object.keys(dealStageDistribution).forEach((stage) => {
      const stageDeals = deals.filter((deal) => deal.stage === stage);
      const closedDeals = stageDeals.filter(
        (deal) => deal.stage === 'closed_won',
      ).length;
      conversionRateByStage[stage] =
        stageDeals.length > 0 ? (closedDeals / stageDeals.length) * 100 : 0;
    });

    const topSalesAgents = await this.getTopSalesAgents(
      companyId,
      startDate,
      endDate,
    );
    const salesTrend = this.generateSalesTrend(deals, 'created_at');

    const totalRevenue = deals.reduce(
      (sum, deal) => sum + Number(deal.amount || 0),
      0,
    );
    const averageDealValue = deals.length > 0 ? totalRevenue / deals.length : 0;

    return {
      totalDeals: deals.length,
      activeDeals: deals.filter(
        (deal) => deal.stage !== 'closed_won' && deal.stage !== 'closed_lost',
      ).length,
      closedDeals: deals.filter(
        (deal) => deal.stage === 'closed_won' || deal.stage === 'closed_lost',
      ).length,
      totalRevenue,
      averageDealValue: Math.round(averageDealValue * 100) / 100,
      dealStageDistribution,
      dealTypeDistribution,
      topSalesAgents,
      salesTrend,
      conversionRateByStage,
    };
  }

  async getPropertyAnalytics(
    companyId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<PropertyAnalytics> {
    const whereCondition: any = { company_id: companyId };
    if (startDate && endDate) {
      whereCondition.created_at = Between(startDate, endDate);
    }

    const properties = await this.propertiesRepository.find({
      where: whereCondition,
    });

    const propertyTypeDistribution: Record<string, number> = {};
    const propertyStatusDistribution: Record<string, number> = {};
    const propertyLocationDistribution: Record<string, number> = {};

    properties.forEach((property) => {
      // Type distribution
      propertyTypeDistribution[property.property_type] =
        (propertyTypeDistribution[property.property_type] || 0) + 1;

      // Status distribution
      propertyStatusDistribution[property.status] =
        (propertyStatusDistribution[property.status] || 0) + 1;

      // Location distribution
      propertyLocationDistribution[property.city] =
        (propertyLocationDistribution[property.city] || 0) + 1;
    });

    const topViewedProperties = properties
      .map((property) => ({
        property: property.title,
        views: property.view_count,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    const propertyPriceRange = this.generatePriceRanges(properties);

    const totalPrice = properties.reduce(
      (sum, property) => sum + Number(property.price || 0),
      0,
    );
    const averagePropertyPrice =
      properties.length > 0 ? totalPrice / properties.length : 0;

    return {
      totalProperties: properties.length,
      availableProperties: properties.filter(
        (property) => property.status === 'available',
      ).length,
      soldProperties: properties.filter(
        (property) => property.status === 'sold',
      ).length,
      rentedProperties: properties.filter(
        (property) => property.status === 'rented',
      ).length,
      propertyTypeDistribution,
      propertyStatusDistribution,
      averagePropertyPrice: Math.round(averagePropertyPrice * 100) / 100,
      topViewedProperties,
      propertyLocationDistribution,
      propertyPriceRange,
    };
  }

  async getDeveloperAnalytics(
    companyId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<DeveloperAnalytics> {
    const whereCondition: any = { company_id: companyId };
    if (startDate && endDate) {
      whereCondition.created_at = Between(startDate, endDate);
    }

    const developers = await this.developersRepository.find({
      where: whereCondition,
      relations: ['projects'],
    });

    const developerTypeDistribution: Record<string, number> = {};
    const projectStatusDistribution: Record<string, number> = {};

    developers.forEach((developer) => {
      // Type distribution
      developerTypeDistribution[developer.type] =
        (developerTypeDistribution[developer.type] || 0) + 1;

      // Project status distribution
      developer.projects?.forEach((project) => {
        projectStatusDistribution[project.status] =
          (projectStatusDistribution[project.status] || 0) + 1;
      });
    });

    const topDevelopers = developers
      .map((developer) => ({
        developer: developer.name,
        projects: developer.projects?.length || 0,
        investment: Number(developer.total_investment || 0),
      }))
      .sort((a, b) => b.projects - a.projects)
      .slice(0, 10);

    const totalInvestment = developers.reduce(
      (sum, developer) => sum + Number(developer.total_investment || 0),
      0,
    );
    const totalProjects = developers.reduce(
      (sum, developer) => sum + (developer.projects?.length || 0),
      0,
    );
    const completedProjects = developers.reduce(
      (sum, developer) =>
        sum +
        (developer.projects?.filter((project) => project.status === 'completed')
          .length || 0),
      0,
    );

    const investmentTrend = this.generateInvestmentTrend(
      developers,
      'created_at',
    );

    return {
      totalDevelopers: developers.length,
      activeDevelopers: developers.filter(
        (developer) => developer.status === 'active',
      ).length,
      totalProjects,
      completedProjects,
      totalInvestment,
      developerTypeDistribution,
      topDevelopers,
      projectStatusDistribution,
      investmentTrend,
    };
  }

  async getActivityAnalytics(
    companyId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<ActivityAnalytics> {
    const whereCondition: any = { company_id: companyId };
    if (startDate && endDate) {
      whereCondition.created_at = Between(startDate, endDate);
    }

    const activities = await this.activitiesRepository.find({
      where: whereCondition,
    });

    const activityTypeDistribution: Record<string, number> = {};
    const activityStatusDistribution: Record<string, number> = {};

    activities.forEach((activity) => {
      // Type distribution
      activityTypeDistribution[activity.type] =
        (activityTypeDistribution[activity.type] || 0) + 1;

      // Status distribution
      activityStatusDistribution[activity.status] =
        (activityStatusDistribution[activity.status] || 0) + 1;
    });

    const topActivityTypes = Object.entries(activityTypeDistribution)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const activityTrend = this.generateDateTrend(activities, 'created_at');

    const completedActivities = activities.filter(
      (activity) => activity.status === 'completed',
    ).length;
    const pendingActivities = activities.filter(
      (activity) => activity.status === 'scheduled',
    ).length;
    const overdueActivities = activities.filter(
      (activity) =>
        activity.status === 'scheduled' && activity.scheduled_at < new Date(),
    ).length;

    // Calculate average completion time
    const completedActivitiesWithDuration = activities.filter(
      (activity) =>
        activity.status === 'completed' &&
        activity.completed_at &&
        activity.scheduled_at,
    );

    const totalDuration = completedActivitiesWithDuration.reduce(
      (sum, activity) => {
        const duration =
          activity.completed_at.getTime() - activity.scheduled_at.getTime();
        return sum + duration;
      },
      0,
    );

    const averageCompletionTime =
      completedActivitiesWithDuration.length > 0
        ? totalDuration / completedActivitiesWithDuration.length
        : 0;

    return {
      totalActivities: activities.length,
      completedActivities,
      pendingActivities,
      overdueActivities,
      activityTypeDistribution,
      activityStatusDistribution,
      averageCompletionTime:
        Math.round((averageCompletionTime / (1000 * 60 * 60 * 24)) * 100) / 100, // Convert to days
      topActivityTypes,
      activityTrend,
    };
  }

  private async getTotalRevenue(companyId: string): Promise<number> {
    const deals = await this.dealsRepository.find({
      where: { company_id: companyId, stage: 'closed_won' as any },
    });

    return deals.reduce((sum, deal) => sum + Number(deal.amount || 0), 0);
  }

  private async getActiveUsers(companyId: string): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.leadsRepository.count({
      where: {
        company_id: companyId,
        updated_at: MoreThan(thirtyDaysAgo),
      },
    });
  }

  private async getTopSalesAgents(
    companyId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Array<{ agent: string; deals: number; revenue: number }>> {
    const whereCondition: any = { company_id: companyId };
    if (startDate && endDate) {
      whereCondition.created_at = Between(startDate, endDate);
    }

    const deals = await this.dealsRepository.find({ where: whereCondition });

    const agentStats: Record<string, { deals: number; revenue: number }> = {};

    deals.forEach((deal) => {
      if (deal.assigned_to_id) {
        if (!agentStats[deal.assigned_to_id]) {
          agentStats[deal.assigned_to_id] = { deals: 0, revenue: 0 };
        }
        agentStats[deal.assigned_to_id].deals += 1;
        agentStats[deal.assigned_to_id].revenue += Number(deal.amount || 0);
      }
    });

    return Object.entries(agentStats)
      .map(([agent, stats]) => ({ agent, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }

  private generateDateTrend(
    data: any[],
    dateField: string,
  ): Array<{ date: string; count: number }> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trend: Record<string, number> = {};

    // Initialize all dates with 0
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      trend[dateStr] = 0;
    }

    // Count occurrences for each date
    data.forEach((item) => {
      const date = new Date(item[dateField]);
      const dateStr = date.toISOString().split('T')[0];
      if (trend[dateStr] !== undefined) {
        trend[dateStr]++;
      }
    });

    return Object.entries(trend)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private generateSalesTrend(
    deals: any[],
    dateField: string,
  ): Array<{ date: string; deals: number; revenue: number }> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trend: Record<string, { deals: number; revenue: number }> = {};

    // Initialize all dates with 0
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      trend[dateStr] = { deals: 0, revenue: 0 };
    }

    // Count deals and revenue for each date
    deals.forEach((deal) => {
      const date = new Date(deal[dateField]);
      const dateStr = date.toISOString().split('T')[0];
      if (trend[dateStr]) {
        trend[dateStr].deals++;
        trend[dateStr].revenue += Number(deal.amount || 0);
      }
    });

    return Object.entries(trend)
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private generateInvestmentTrend(
    developers: any[],
    dateField: string,
  ): Array<{ date: string; investment: number }> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trend: Record<string, number> = {};

    // Initialize all dates with 0
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      trend[dateStr] = 0;
    }

    // Sum investment for each date
    developers.forEach((developer) => {
      const date = new Date(developer[dateField]);
      const dateStr = date.toISOString().split('T')[0];
      if (trend[dateStr] !== undefined) {
        trend[dateStr] += Number(developer.total_investment || 0);
      }
    });

    return Object.entries(trend)
      .map(([date, investment]) => ({ date, investment }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private generatePriceRanges(
    properties: any[],
  ): Array<{ range: string; count: number }> {
    const ranges = [
      { min: 0, max: 500000, label: '0 - 500K' },
      { min: 500000, max: 1000000, label: '500K - 1M' },
      { min: 1000000, max: 2000000, label: '1M - 2M' },
      { min: 2000000, max: 5000000, label: '2M - 5M' },
      { min: 5000000, max: 10000000, label: '5M - 10M' },
      { min: 10000000, max: Infinity, label: '10M+' },
    ];

    const rangeCounts: Record<string, number> = {};

    ranges.forEach((range) => {
      rangeCounts[range.label] = 0;
    });

    properties.forEach((property) => {
      const price = Number(property.price || 0);
      const range = ranges.find((r) => price >= r.min && price < r.max);
      if (range) {
        rangeCounts[range.label]++;
      }
    });

    return Object.entries(rangeCounts)
      .map(([range, count]) => ({ range, count }))
      .filter((item) => item.count > 0);
  }
}
