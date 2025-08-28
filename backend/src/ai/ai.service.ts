import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import * as ss from 'simple-statistics';
import { PropertyStatus } from '../properties/entities/property.entity';
import { Lead } from '../leads/entities/lead.entity';
import { Deal } from '../deals/entities/deal.entity';
import { Property } from '../properties/entities/property.entity';
import { Activity, ActivityType, ActivityStatus } from '../activities/entities/activity.entity';

export interface LeadScoreResult {
  leadId: string;
  score: number;
  factors: {
    engagement: number;
    budget: number;
    timeline: number;
    source: number;
    propertyInterest: number;
  };
  recommendation: string;
}

export interface DealPredictionResult {
  dealId: string;
  probability: number;
  predictedCloseDate: Date;
  riskFactors: string[];
  recommendations: string[];
}

export interface PropertyRecommendation {
  propertyId: string;
  propertyTitle: string;
  matchScore: number;
  reasons: string[];
}

@Injectable()
export class AiService {
  private logger = new Logger(AiService.name);

  constructor(
    @InjectRepository(Lead)
    private leadsRepository: Repository<Lead>,
    @InjectRepository(Deal)
    private dealsRepository: Repository<Deal>,
    @InjectRepository(Property)
    private propertiesRepository: Repository<Property>,
    @InjectRepository(Activity)
    private activitiesRepository: Repository<Activity>,
  ) {}

  /**
   * Lead Scoring Algorithm
   * Calculates a score from 0-100 based on multiple factors
   */
  async calculateLeadScore(leadId: string): Promise<LeadScoreResult> {
    const lead = await this.leadsRepository.findOne({
      where: { id: leadId },
      relations: ['activities', 'deals'],
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    // Factor 1: Engagement Score (0-25 points)
    const engagementScore = await this.calculateEngagementScore(lead);

    // Factor 2: Budget Score (0-25 points)
    const budgetScore = await this.calculateBudgetScore(lead);

    // Factor 3: Timeline Score (0-20 points)
    const timelineScore = await this.calculateTimelineScore(lead);

    // Factor 4: Source Score (0-15 points)
    const sourceScore = await this.calculateSourceScore(lead);

    // Factor 5: Property Interest Score (0-15 points)
    const propertyInterestScore = await this.calculatePropertyInterestScore(lead);

    const totalScore = engagementScore + budgetScore + timelineScore + sourceScore + propertyInterestScore;

    // Generate recommendation
    let recommendation = 'Low Priority';
    if (totalScore >= 80) recommendation = 'Hot Lead - Contact Immediately';
    else if (totalScore >= 60) recommendation = 'Warm Lead - Schedule Follow-up';
    else if (totalScore >= 40) recommendation = 'Medium Priority - Nurture';
    else if (totalScore >= 20) recommendation = 'Low Priority - Monitor';

    return {
      leadId,
      score: Math.round(totalScore),
      factors: {
        engagement: Math.round(engagementScore),
        budget: Math.round(budgetScore),
        timeline: Math.round(timelineScore),
        source: Math.round(sourceScore),
        propertyInterest: Math.round(propertyInterestScore),
      },
      recommendation,
    };
  }

  private async calculateEngagementScore(lead: Lead): Promise<number> {
    let score = 0;

    // Activity count (max 10 points)
    const activityCount = lead.activities?.length || 0;
    score += Math.min(activityCount * 2, 10);

    // Recent activity (max 10 points)
    const recentActivities = await this.activitiesRepository.count({
      where: {
        lead_id: lead.id,
        created_at: MoreThan(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), // Last 7 days
      },
    });
    score += Math.min(recentActivities * 5, 10);

    // Completed activities (max 5 points)
    const completedActivities = lead.activities?.filter(
      activity => activity.status === ActivityStatus.COMPLETED
    ).length || 0;
    score += Math.min(completedActivities * 2, 5);

    return score;
  }

  private async calculateBudgetScore(lead: Lead): Promise<number> {
    // Simple budget scoring based on lead notes or custom fields
    // In a real implementation, you would analyze budget information
    const budgetKeywords = ['high budget', 'expensive', 'luxury', 'premium', 'high end'];
    const note = lead.notes?.toLowerCase() || '';

    let score = 10; // Base score
    for (const keyword of budgetKeywords) {
      if (note.includes(keyword)) {
        score += 5;
      }
    }

    return Promise.resolve(Math.min(score, 25));
  }

  private async calculateTimelineScore(lead: Lead): Promise<number> {
    // Timeline scoring based on urgency keywords
    const urgentKeywords = ['urgent', 'asap', 'immediately', 'rush', 'quick'];
    const note = lead.notes?.toLowerCase() || '';

    let score = 5; // Base score
    for (const keyword of urgentKeywords) {
      if (note.includes(keyword)) {
        score += 5;
      }
    }

    return Promise.resolve(Math.min(score, 20));
  }

  private async calculateSourceScore(lead: Lead): Promise<number> {
    // Source scoring - different sources have different quality scores
    const highQualitySources = ['website', 'referral', 'organic'];
    const mediumQualitySources = ['social media', 'email campaign'];
    const lowQualitySources = ['cold call', 'unknown'];

    const source = lead.source?.toLowerCase() || 'unknown';

    if (highQualitySources.some(s => source.includes(s))) return Promise.resolve(15);
    if (mediumQualitySources.some(s => source.includes(s))) return Promise.resolve(10);
    if (lowQualitySources.some(s => source.includes(s))) return Promise.resolve(5);

    return Promise.resolve(5); // Default
  }

  private async calculatePropertyInterestScore(lead: Lead): Promise<number> {
    // Calculate based on property-related activities
    const propertyActivities = await this.activitiesRepository.count({
      where: {
        lead_id: lead.id,
        type: ActivityType.SITE_VISIT,
      },
    });

    const dealCount = lead.deals?.length || 0;

    let score = 0;
    score += Math.min(propertyActivities * 3, 10);
    score += Math.min(dealCount * 5, 5);

    return Math.min(score, 15);
  }

  /**
   * Deal Prediction Algorithm
   * Predicts deal close probability and expected close date
   */
  async predictDealOutcome(dealId: string): Promise<DealPredictionResult> {
    const deal = await this.dealsRepository.findOne({
      where: { id: dealId },
      relations: ['lead', 'activities', 'property'],
    });

    if (!deal) {
      throw new Error('Deal not found');
    }

    // Calculate base probability from deal factors
    let probability = deal.probability || 50;

    // Factor 1: Activity engagement
    const recentActivities = await this.activitiesRepository.count({
      where: {
        deal_id: dealId,
        created_at: MoreThan(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), // Last 30 days
      },
    });
    probability += Math.min(recentActivities * 5, 20);

    // Factor 2: Deal stage progression
    const stageWeight = this.getStageWeight(deal.stage);
    probability = (probability * 0.7) + (stageWeight * 0.3);

    // Factor 3: Lead score (if available)
    if (deal.lead_id) {
      try {
        const leadScore = await this.calculateLeadScore(deal.lead_id);
        probability = (probability * 0.8) + (leadScore.score * 0.2);
      } catch (error) {
        // Lead score not available, continue with current probability
      }
    }

    // Ensure probability is between 0 and 100
    probability = Math.max(0, Math.min(100, probability));

    // Calculate predicted close date
    const predictedCloseDate = this.predictCloseDate(deal);

    // Identify risk factors
    const riskFactors = await this.identifyRiskFactors(deal);

    // Generate recommendations
    const recommendations = await this.generateRecommendations(deal, probability);

    return {
      dealId,
      probability: Math.round(probability),
      predictedCloseDate,
      riskFactors,
      recommendations,
    };
  }

  private getStageWeight(stage: string): number {
    const stageWeights = {
      'prospect': 20,
      'qualified': 40,
      'proposal': 60,
      'negotiation': 75,
      'contract': 90,
      'closed_won': 100,
      'closed_lost': 0,
    };

    return stageWeights[stage] || 50;
  }

  private predictCloseDate(deal: Deal): Date {
    const now = new Date();
    const stage = deal.stage;

    // Different stages have different average completion times
    const stageCompletionDays = {
      'prospect': 30,
      'qualified': 20,
      'proposal': 15,
      'negotiation': 10,
      'contract': 5,
    };

    const estimatedDays = stageCompletionDays[stage] || 15;
    const predictedDate = new Date(now);
    predictedDate.setDate(now.getDate() + estimatedDays);

    return predictedDate;
  }

  private async identifyRiskFactors(deal: Deal): Promise<string[]> {
    const riskFactors: string[] = [];

    // Check if deal is overdue
    if (deal.expected_close_date && deal.expected_close_date < new Date()) {
      riskFactors.push('Deal is overdue');
    }

    // Check activity frequency
    if (deal.activity_count < 3) {
      riskFactors.push('Low activity engagement');
    }

    // Check probability
    if (deal.probability < 30) {
      riskFactors.push('Low probability score');
    }

    // Check if in early stage for too long
    if (deal.stage === 'prospect' && deal.days_in_pipeline > 60) {
      riskFactors.push('Stuck in prospect stage');
    }

    return riskFactors;
  }

  private async generateRecommendations(deal: Deal, probability: number): Promise<string[]> {
    const recommendations: string[] = [];

    if (probability < 30) {
      recommendations.push('Consider re-qualifying the lead');
      recommendations.push('Review pricing strategy');
    }

    if (deal.activity_count < 3) {
      recommendations.push('Increase activity frequency');
      recommendations.push('Schedule more follow-up calls');
    }

    if (deal.expected_close_date && deal.expected_close_date < new Date()) {
      recommendations.push('Send follow-up email to client');
      recommendations.push('Schedule urgent review meeting');
    }

    if (deal.stage === 'prospect' && deal.days_in_pipeline > 30) {
      recommendations.push('Move to qualification stage or close deal');
    }

    return recommendations;
  }

  /**
   * Property Recommendation System
   * Recommends properties based on lead preferences
   */
  async recommendPropertiesForLead(leadId: string, limit: number = 5): Promise<PropertyRecommendation[]> {
    const lead = await this.leadsRepository.findOne({
      where: { id: leadId },
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    // Get all available properties
    const properties = await this.propertiesRepository.find({
      where: { status: PropertyStatus.AVAILABLE },
    });

    const recommendations: PropertyRecommendation[] = [];

    for (const property of properties) {
      const matchScore = await this.calculatePropertyMatchScore(lead, property);
      const reasons = await this.generatePropertyMatchReasons(lead, property);

      if (matchScore > 30) { // Only include properties with reasonable match
        recommendations.push({
          propertyId: property.id,
          propertyTitle: property.title,
          matchScore,
          reasons,
        });
      }
    }

    // Sort by match score and return top results
    return recommendations
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  }

  private async calculatePropertyMatchScore(lead: Lead, property: Property): Promise<number> {
    let score = 50; // Base score

    // Budget match (max 30 points)
    if (lead.budget && property.price) {
      const budgetDiff = Math.abs(lead.budget - property.price) / lead.budget;
      if (budgetDiff <= 0.1) score += 30; // Within 10%
      else if (budgetDiff <= 0.25) score += 20; // Within 25%
      else if (budgetDiff <= 0.5) score += 10; // Within 50%
    }

    // Location match (max 10 points)
    if (lead.location_preference && property.city) {
      if (lead.location_preference.toLowerCase().includes(property.city.toLowerCase())) {
        score += 10;
      }
    }

    // Property type match (max 10 points)
    if (lead.property_type_preference && property.property_type) {
      if (lead.property_type_preference === property.property_type) {
        score += 10;
      }
    }

    return Math.min(score, 100);
  }

  private async generatePropertyMatchReasons(lead: Lead, property: Property): Promise<string[]> {
    const reasons: string[] = [];

    if (lead.budget && property.price) {
      const budgetDiff = Math.abs(lead.budget - property.price) / lead.budget;
      if (budgetDiff <= 0.1) {
        reasons.push('Within budget range');
      }
    }

    if (lead.location_preference && property.city) {
      if (lead.location_preference.toLowerCase().includes(property.city.toLowerCase())) {
        reasons.push(`Located in preferred area: ${property.city}`);
      }
    }

    if (lead.property_type_preference && property.property_type) {
      if (lead.property_type_preference === property.property_type) {
        reasons.push(`Matches preferred property type: ${property.property_type}`);
      }
    }

    if (property.is_featured) {
      reasons.push('Featured property');
    }

    if (property.price && lead.budget && property.price <= lead.budget) {
      reasons.push('Affordable option');
    }

    return reasons;
  }

  /**
   * Analytics and Insights
   */
  async generateLeadInsights(companyId: string): Promise<any> {
    const leads = await this.leadsRepository.find({
      where: { company_id: companyId },
      relations: ['activities', 'deals'],
    });

    const totalLeads = leads.length;
    const convertedLeads = leads.filter(lead =>
      lead.deals && lead.deals.some(deal => deal.stage === 'closed_won')
    ).length;

    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    // Lead source analysis
    const sourceStats = {};
    leads.forEach(lead => {
      const source = lead.source || 'unknown';
      if (!sourceStats[source]) sourceStats[source] = { total: 0, converted: 0 };
      sourceStats[source].total++;
      if (lead.deals && lead.deals.some(deal => deal.stage === 'closed_won')) {
        sourceStats[source].converted++;
      }
    });

    // Calculate source conversion rates
    Object.keys(sourceStats).forEach(source => {
      const stats = sourceStats[source];
      stats.conversionRate = (stats.converted / stats.total) * 100;
    });

    return {
      totalLeads,
      convertedLeads,
      conversionRate: Math.round(conversionRate * 100) / 100,
      sourceAnalysis: sourceStats,
      recommendations: await this.generateLeadRecommendations(sourceStats),
    };
  }

  private async generateLeadRecommendations(sourceStats: any): Promise<string[]> {
    const recommendations: string[] = [];

    // Find best performing source
    const bestSource = Object.entries(sourceStats)
      .sort(([,a]: any, [,b]: any) => b.conversionRate - a.conversionRate)[0];

    if (bestSource && (bestSource[1] as any).conversionRate > 20) {
      recommendations.push(`Focus more on ${(bestSource[0] as string)} as it has ${(bestSource[1] as any).conversionRate.toFixed(1)}% conversion rate`);
    }

    // Identify underperforming sources
    Object.entries(sourceStats).forEach(([source, stats]: [string, any]) => {
      if (stats.total > 10 && stats.conversionRate < 5) {
        recommendations.push(`Review ${source} strategy - only ${stats.conversionRate.toFixed(1)}% conversion rate`);
      }
    });

    return recommendations;
  }

  async generateSalesForecast(companyId: string, months: number = 3): Promise<any> {
    const deals = await this.dealsRepository.find({
      where: { company_id: companyId },
    });

    // Simple linear regression for forecasting
    const monthlyRevenue = this.calculateMonthlyRevenue(deals);
    const forecast = this.simpleLinearRegression(monthlyRevenue, months);

    const recommendations: string[] = [
      'Increase marketing spend on high-converting channels',
      'Focus on moving deals from proposal to negotiation stage',
      'Improve lead qualification process',
    ];

    return {
      currentRevenue: monthlyRevenue.reduce((sum, rev) => sum + rev, 0),
      forecast: forecast,
      confidence: 0.75, // Simple confidence score
      recommendations,
    };
  }

  private calculateMonthlyRevenue(deals: Deal[]): number[] {
    const monthlyRevenue: number[] = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthDeals = deals.filter(deal =>
        deal.actual_close_date &&
        deal.actual_close_date >= monthStart &&
        deal.actual_close_date <= monthEnd &&
        deal.stage === 'closed_won'
      );

      const revenue = monthDeals.reduce((sum, deal) => sum + deal.amount, 0);
      monthlyRevenue.push(revenue);
    }

    return monthlyRevenue;
  }

  private simpleLinearRegression(data: number[], forecastMonths: number): number[] {
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = data;

    // Calculate slope and intercept using simple-statistics
    const regression = ss.linearRegression([x, y]);
    const slope = regression.m;
    const intercept = regression.b;

    // Generate forecast
    const forecast: number[] = [];
    for (let i = 0; i < forecastMonths; i++) {
      const predictedValue = slope * (n + i) + intercept;
      forecast.push(Math.max(0, predictedValue)); // Ensure non-negative
    }

    return forecast;
  }
}
