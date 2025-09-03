import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import {
  Company,
  SubscriptionPlan,
  CompanyStatus,
} from './entities/company.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

class CreateCompanyDto {
  name: string;
  description?: string;
  subdomain?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  timezone?: string;
  language?: string;
  subscription_plan?: SubscriptionPlan;
  settings?: Record<string, any>;
  branding?: Record<string, any>;
  user_limit?: number;
  storage_limit?: number;
}

class UpdateCompanyDto {
  name?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  timezone?: string;
  language?: string;
  settings?: Record<string, any>;
  branding?: Record<string, any>;
  user_limit?: number;
  storage_limit?: number;
}

@ApiTags('Companies')
@Controller('companies')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new company' })
  @ApiResponse({
    status: 201,
    description: 'Company created successfully',
    type: Company,
  })
  @ApiResponse({
    status: 409,
    description: 'Company with this name already exists',
  })
  async create(@Body() createCompanyDto: CreateCompanyDto): Promise<Company> {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all companies' })
  @ApiResponse({
    status: 200,
    description: 'Companies retrieved successfully',
    type: [Company],
  })
  async findAll(): Promise<Company[]> {
    return this.companiesService.findAll();
  }

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get overall company statistics' })
  @ApiResponse({
    status: 200,
    description: 'Company statistics retrieved successfully',
  })
  async getTotalStats() {
    return this.companiesService.getTotalStats();
  }

  @Get('by-status/:status')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get companies by status' })
  @ApiResponse({
    status: 200,
    description: 'Companies retrieved successfully',
    type: [Company],
  })
  async getCompaniesByStatus(
    @Param('status') status: CompanyStatus,
  ): Promise<Company[]> {
    return this.companiesService.getCompaniesByStatus(status);
  }

  @Get('by-plan/:plan')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get companies by subscription plan' })
  @ApiResponse({
    status: 200,
    description: 'Companies retrieved successfully',
    type: [Company],
  })
  async getCompaniesByPlan(
    @Param('plan') plan: SubscriptionPlan,
  ): Promise<Company[]> {
    return this.companiesService.getCompaniesByPlan(plan);
  }

  @Get('expiring/:days')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get companies with expiring subscriptions' })
  @ApiResponse({
    status: 200,
    description: 'Companies with expiring subscriptions retrieved',
    type: [Company],
  })
  async getExpiringSubscriptions(
    @Param('days') days: string,
  ): Promise<Company[]> {
    return this.companiesService.getExpiringSubscriptions(parseInt(days));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by ID' })
  @ApiResponse({
    status: 200,
    description: 'Company retrieved successfully',
    type: Company,
  })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async findOne(@Param('id') id: string): Promise<Company> {
    return this.companiesService.findOne(id);
  }

  @Get(':id/stats')
  @Roles(UserRole.COMPANY_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get company statistics' })
  @ApiResponse({
    status: 200,
    description: 'Company statistics retrieved successfully',
  })
  async getCompanyStats(@Param('id') id: string) {
    return this.companiesService.getCompanyStats(id);
  }

  @Patch(':id')
  @Roles(UserRole.COMPANY_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update company' })
  @ApiResponse({
    status: 200,
    description: 'Company updated successfully',
    type: Company,
  })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    return this.companiesService.update(id, updateCompanyDto);
  }

  @Patch(':id/subscription')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update company subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription updated successfully',
    type: Company,
  })
  async updateSubscription(
    @Param('id') id: string,
    @Body() body: { subscriptionPlan: SubscriptionPlan; expiresAt?: Date },
  ): Promise<Company> {
    return this.companiesService.updateSubscription(
      id,
      body.subscriptionPlan,
      body.expiresAt,
    );
  }

  @Patch(':id/usage')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update company usage' })
  @ApiResponse({
    status: 200,
    description: 'Usage updated successfully',
    type: Company,
  })
  async updateUsage(
    @Param('id') id: string,
    @Body() body: { monthlyUsage: number },
  ): Promise<Company> {
    return this.companiesService.updateUsage(id, body.monthlyUsage);
  }

  @Patch(':id/activate')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Activate company' })
  @ApiResponse({
    status: 200,
    description: 'Company activated successfully',
    type: Company,
  })
  async activate(@Param('id') id: string): Promise<Company> {
    return this.companiesService.activateCompany(id);
  }

  @Patch(':id/suspend')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Suspend company' })
  @ApiResponse({
    status: 200,
    description: 'Company suspended successfully',
    type: Company,
  })
  async suspend(@Param('id') id: string): Promise<Company> {
    return this.companiesService.suspendCompany(id);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete company' })
  @ApiResponse({ status: 200, description: 'Company deleted successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.companiesService.remove(id);
    return { message: 'Company deleted successfully' };
  }
}
