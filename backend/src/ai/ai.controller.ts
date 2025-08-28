import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AiService, LeadScoreResult, DealPredictionResult, PropertyRecommendation } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';

@ApiTags('AI & Analytics')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('leads/:leadId/score')
  @ApiOperation({ summary: 'Calculate lead score using AI' })
  @ApiResponse({ status: 200, description: 'Lead score calculated successfully', type: Object })
  async calculateLeadScore(@Param('leadId') leadId: string): Promise<LeadScoreResult> {
    return this.aiService.calculateLeadScore(leadId);
  }

  @Get('deals/:dealId/predict')
  @ApiOperation({ summary: 'Predict deal outcome using AI' })
  @ApiResponse({ status: 200, description: 'Deal prediction generated successfully', type: Object })
  async predictDealOutcome(@Param('dealId') dealId: string): Promise<DealPredictionResult> {
    return this.aiService.predictDealOutcome(dealId);
  }

  @Get('leads/:leadId/recommendations')
  @ApiOperation({ summary: 'Get property recommendations for lead' })
  @ApiResponse({ status: 200, description: 'Property recommendations generated successfully', type: [Object] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPropertyRecommendations(
    @Param('leadId') leadId: string,
    @Query('limit') limit?: string,
  ): Promise<PropertyRecommendation[]> {
    const limitNum = limit ? parseInt(limit) : 5;
    return this.aiService.recommendPropertiesForLead(leadId, limitNum);
  }

  @Get('analytics/leads')
  @ApiOperation({ summary: 'Generate lead analytics and insights' })
  @ApiResponse({ status: 200, description: 'Lead analytics generated successfully' })
  async getLeadInsights(@User('companyId') companyId: string) {
    return this.aiService.generateLeadInsights(companyId);
  }

  @Get('analytics/sales-forecast')
  @ApiOperation({ summary: 'Generate sales forecast' })
  @ApiResponse({ status: 200, description: 'Sales forecast generated successfully' })
  @ApiQuery({ name: 'months', required: false, type: Number })
  async getSalesForecast(
    @User('companyId') companyId: string,
    @Query('months') months?: string,
  ) {
    const monthsNum = months ? parseInt(months) : 3;
    return this.aiService.generateSalesForecast(companyId, monthsNum);
  }

  @Get('analytics/performance')
  @ApiOperation({ summary: 'Get comprehensive performance analytics' })
  @ApiResponse({ status: 200, description: 'Performance analytics generated successfully' })
  async getPerformanceAnalytics(@User('companyId') companyId: string) {
    const [leadInsights, salesForecast] = await Promise.all([
      this.aiService.generateLeadInsights(companyId),
      this.aiService.generateSalesForecast(companyId),
    ]);

    return {
      leadInsights,
      salesForecast,
      generatedAt: new Date(),
      recommendations: [
        ...leadInsights.recommendations,
        ...salesForecast.recommendations,
      ],
    };
  }
}
