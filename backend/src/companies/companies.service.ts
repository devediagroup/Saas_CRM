import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company, SubscriptionPlan, CompanyStatus } from './entities/company.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
  ) {}

  async create(createCompanyDto: Partial<Company>): Promise<Company> {
    // Check if company name already exists
    const existingCompany = await this.findByName(createCompanyDto.name || '');
    if (existingCompany) {
      throw new ConflictException('Company with this name already exists');
    }

    // Generate subdomain if not provided
    if (!createCompanyDto.subdomain) {
      createCompanyDto.subdomain = await this.generateSubdomain(createCompanyDto.name || '');
    }

    const company = this.companiesRepository.create(createCompanyDto);
    return this.companiesRepository.save(company);
  }

  async findAll(): Promise<Company[]> {
    return this.companiesRepository.find({
      relations: ['users'],
    });
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companiesRepository.findOne({
      where: { id },
      relations: ['users'],
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return company;
  }

  async findByName(name: string): Promise<Company | null> {
    return this.companiesRepository.findOne({
      where: { name },
      relations: ['users'],
    });
  }

  async findBySubdomain(subdomain: string): Promise<Company | null> {
    return this.companiesRepository.findOne({
      where: { subdomain },
      relations: ['users'],
    });
  }

  async update(id: string, updateCompanyDto: Partial<Company>): Promise<Company> {
    const company = await this.findOne(id);

    // Check name uniqueness if name is being updated
    if (updateCompanyDto.name && updateCompanyDto.name !== company.name) {
      const existingCompany = await this.findByName(updateCompanyDto.name);
      if (existingCompany) {
        throw new ConflictException('Company with this name already exists');
      }
    }

    Object.assign(company, updateCompanyDto);
    return this.companiesRepository.save(company);
  }

  async remove(id: string): Promise<void> {
    const company = await this.findOne(id);
    await this.companiesRepository.remove(company);
  }

  async activateCompany(id: string): Promise<Company> {
    return this.update(id, { status: CompanyStatus.ACTIVE });
  }

  async suspendCompany(id: string): Promise<Company> {
    return this.update(id, { status: CompanyStatus.SUSPENDED });
  }

  async updateSubscription(
    id: string,
    subscriptionPlan: SubscriptionPlan,
    expiresAt?: Date,
  ): Promise<Company> {
    return this.update(id, {
      subscription_plan: subscriptionPlan,
      subscription_expires_at: expiresAt,
    });
  }

  async updateUsage(id: string, monthlyUsage: number): Promise<Company> {
    return this.update(id, { monthly_usage: monthlyUsage });
  }

  async getCompanyStats(id: string) {
    const company = await this.findOne(id);

    return {
      id: company.id,
      name: company.name,
      status: company.status,
      subscription: {
        plan: company.subscription_plan,
        expiresAt: company.subscription_expires_at,
        isTrial: company.is_trial,
        monthlyUsage: company.monthly_usage,
        userLimit: company.user_limit,
        storageLimit: company.storage_limit,
      },
      users: {
        total: company.users?.length || 0,
        active: company.users?.filter(u => u.status === 'active').length || 0,
      },
      settings: company.settings,
      branding: company.branding,
      createdAt: company.created_at,
      updatedAt: company.updated_at,
    };
  }

  async getCompaniesByStatus(status: CompanyStatus): Promise<Company[]> {
    return this.companiesRepository.find({
      where: { status },
      relations: ['users'],
    });
  }

  async getCompaniesByPlan(plan: SubscriptionPlan): Promise<Company[]> {
    return this.companiesRepository.find({
      where: { subscription_plan: plan },
      relations: ['users'],
    });
  }

  async getExpiringSubscriptions(days: number = 30): Promise<Company[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.companiesRepository
      .createQueryBuilder('company')
      .where('company.subscription_expires_at <= :futureDate', { futureDate })
      .andWhere('company.status = :status', { status: CompanyStatus.ACTIVE })
      .leftJoinAndSelect('company.users', 'users')
      .getMany();
  }

  async getTotalStats() {
    const companies = await this.findAll();

    const stats = {
      total: companies.length,
      active: companies.filter(c => c.status === CompanyStatus.ACTIVE).length,
      suspended: companies.filter(c => c.status === CompanyStatus.SUSPENDED).length,
      inactive: companies.filter(c => c.status === CompanyStatus.INACTIVE).length,
      byPlan: {
        [SubscriptionPlan.FREE]: companies.filter(c => c.subscription_plan === SubscriptionPlan.FREE).length,
        [SubscriptionPlan.BASIC]: companies.filter(c => c.subscription_plan === SubscriptionPlan.BASIC).length,
        [SubscriptionPlan.PRO]: companies.filter(c => c.subscription_plan === SubscriptionPlan.PRO).length,
        [SubscriptionPlan.ENTERPRISE]: companies.filter(c => c.subscription_plan === SubscriptionPlan.ENTERPRISE).length,
      },
      trials: companies.filter(c => c.is_trial).length,
      totalUsers: companies.reduce((sum, c) => sum + (c.users?.length || 0), 0),
      expiringSoon: (await this.getExpiringSubscriptions()).length,
    };

    return stats;
  }

  private async generateSubdomain(companyName: string): Promise<string> {
    const baseSubdomain = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20);

    let subdomain = baseSubdomain;
    let counter = 1;

    while (await this.findBySubdomain(subdomain)) {
      subdomain = `${baseSubdomain}${counter}`;
      counter++;
    }

    return subdomain;
  }
}
