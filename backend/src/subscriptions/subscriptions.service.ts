import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, LessThan } from 'typeorm';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from '../companies/entities/company.entity';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
  TRIAL = 'trial',
}

export enum SubscriptionPlan {
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
  CUSTOM = 'custom',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
}

export interface SubscriptionFeatures {
  maxUsers: number;
  maxProperties: number;
  maxLeads: number;
  maxDeals: number;
  maxDevelopers: number;
  maxProjects: number;
  analyticsEnabled: boolean;
  aiFeaturesEnabled: boolean;
  whatsappIntegration: boolean;
  emailIntegration: boolean;
  customFields: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
  whiteLabel: boolean;
  customDomain: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  retentionPeriod: number; // in days
}

export interface CreateSubscriptionDto {
  plan: SubscriptionPlan;
  billing_cycle: BillingCycle;
  start_date: Date;
  end_date: Date;
  amount: number;
  currency: string;
  features: SubscriptionFeatures;
  auto_renew: boolean;
  payment_method?: string;
  notes?: string;
}

export interface UpdateSubscriptionDto extends Partial<CreateSubscriptionDto> {}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: SubscriptionPlan,
  })
  plan: SubscriptionPlan;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.PENDING,
  })
  status: SubscriptionStatus;

  @Column({
    type: 'enum',
    enum: BillingCycle,
  })
  billing_cycle: BillingCycle;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date' })
  end_date: Date;

  @Column({ type: 'date', nullable: true })
  trial_end_date: Date;

  @Column({ type: 'date', nullable: true })
  next_billing_date: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'json' })
  features: SubscriptionFeatures;

  @Column({ type: 'boolean', default: true })
  auto_renew: boolean;

  @Column({ nullable: true })
  payment_method: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'json', nullable: true })
  custom_fields: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  usage_metrics: {
    currentUsers: number;
    currentProperties: number;
    currentLeads: number;
    currentDeals: number;
    currentDevelopers: number;
    currentProjects: number;
    lastUpdated: Date;
  };

  @Column({ type: 'json', nullable: true })
  billing_history: Array<{
    date: Date;
    amount: number;
    status: string;
    invoice_id: string;
  }>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @Column('uuid')
  company_id: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;
}

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
  ) {}

  async create(
    createSubscriptionDto: CreateSubscriptionDto & { company_id: string },
  ): Promise<Subscription> {
    // Check if company already has an active subscription
    const existingSubscription = await this.subscriptionsRepository.findOne({
      where: {
        company_id: createSubscriptionDto.company_id,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (existingSubscription) {
      throw new ConflictException('Company already has an active subscription');
    }

    const subscription = this.subscriptionsRepository.create(
      createSubscriptionDto,
    );

    // Set next billing date based on billing cycle
    subscription.next_billing_date = this.calculateNextBillingDate(
      subscription.start_date,
      subscription.billing_cycle,
    );

    return this.subscriptionsRepository.save(subscription);
  }

  async findAll(companyId: string): Promise<Subscription[]> {
    return this.subscriptionsRepository.find({
      where: { company_id: companyId },
      relations: ['company'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionsRepository.findOne({
      where: { id },
      relations: ['company'],
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    return subscription;
  }

  async findActiveSubscription(
    companyId: string,
  ): Promise<Subscription | null> {
    return this.subscriptionsRepository.findOne({
      where: {
        company_id: companyId,
        status: SubscriptionStatus.ACTIVE,
      },
      relations: ['company'],
    });
  }

  async update(
    id: string,
    updateSubscriptionDto: UpdateSubscriptionDto,
  ): Promise<Subscription> {
    const subscription = await this.findOne(id);

    // If billing cycle is being updated, recalculate next billing date
    if (
      updateSubscriptionDto.billing_cycle &&
      updateSubscriptionDto.billing_cycle !== subscription.billing_cycle
    ) {
      subscription.next_billing_date = this.calculateNextBillingDate(
        subscription.start_date,
        updateSubscriptionDto.billing_cycle,
      );
    }

    Object.assign(subscription, updateSubscriptionDto);
    return this.subscriptionsRepository.save(subscription);
  }

  async remove(id: string): Promise<void> {
    const subscription = await this.findOne(id);
    await this.subscriptionsRepository.remove(subscription);
  }

  async cancelSubscription(id: string): Promise<Subscription> {
    const subscription = await this.findOne(id);
    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.auto_renew = false;
    return this.subscriptionsRepository.save(subscription);
  }

  async suspendSubscription(id: string): Promise<Subscription> {
    const subscription = await this.findOne(id);
    subscription.status = SubscriptionStatus.SUSPENDED;
    return this.subscriptionsRepository.save(subscription);
  }

  async activateSubscription(id: string): Promise<Subscription> {
    const subscription = await this.findOne(id);
    subscription.status = SubscriptionStatus.ACTIVE;
    return this.subscriptionsRepository.save(subscription);
  }

  async renewSubscription(id: string): Promise<Subscription> {
    const subscription = await this.findOne(id);

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new ConflictException('Only active subscriptions can be renewed');
    }

    // Extend end date based on billing cycle
    subscription.end_date = this.calculateNextBillingDate(
      subscription.end_date,
      subscription.billing_cycle,
    );

    subscription.next_billing_date = this.calculateNextBillingDate(
      subscription.end_date,
      subscription.billing_cycle,
    );

    return this.subscriptionsRepository.save(subscription);
  }

  async updateUsageMetrics(
    id: string,
    usageMetrics: {
      currentUsers: number;
      currentProperties: number;
      currentLeads: number;
      currentDeals: number;
      currentDevelopers: number;
      currentProjects: number;
    },
  ): Promise<Subscription> {
    const subscription = await this.findOne(id);

    subscription.usage_metrics = {
      ...usageMetrics,
      lastUpdated: new Date(),
    };

    return this.subscriptionsRepository.save(subscription);
  }

  async addBillingRecord(
    id: string,
    billingRecord: {
      amount: number;
      status: string;
      invoice_id: string;
    },
  ): Promise<Subscription> {
    const subscription = await this.findOne(id);

    if (!subscription.billing_history) {
      subscription.billing_history = [];
    }

    subscription.billing_history.push({
      date: new Date(),
      ...billingRecord,
    });

    return this.subscriptionsRepository.save(subscription);
  }

  async getSubscriptionStats(companyId: string) {
    const subscriptions = await this.findAll(companyId);

    const stats = {
      total: subscriptions.length,
      byStatus: {
        [SubscriptionStatus.ACTIVE]: subscriptions.filter(
          (s) => s.status === SubscriptionStatus.ACTIVE,
        ).length,
        [SubscriptionStatus.EXPIRED]: subscriptions.filter(
          (s) => s.status === SubscriptionStatus.EXPIRED,
        ).length,
        [SubscriptionStatus.CANCELLED]: subscriptions.filter(
          (s) => s.status === SubscriptionStatus.CANCELLED,
        ).length,
        [SubscriptionStatus.SUSPENDED]: subscriptions.filter(
          (s) => s.status === SubscriptionStatus.SUSPENDED,
        ).length,
        [SubscriptionStatus.PENDING]: subscriptions.filter(
          (s) => s.status === SubscriptionStatus.PENDING,
        ).length,
        [SubscriptionStatus.TRIAL]: subscriptions.filter(
          (s) => s.status === SubscriptionStatus.TRIAL,
        ).length,
      },
      byPlan: {
        [SubscriptionPlan.BASIC]: subscriptions.filter(
          (s) => s.plan === SubscriptionPlan.BASIC,
        ).length,
        [SubscriptionPlan.PROFESSIONAL]: subscriptions.filter(
          (s) => s.plan === SubscriptionPlan.PROFESSIONAL,
        ).length,
        [SubscriptionPlan.ENTERPRISE]: subscriptions.filter(
          (s) => s.plan === SubscriptionPlan.ENTERPRISE,
        ).length,
        [SubscriptionPlan.CUSTOM]: subscriptions.filter(
          (s) => s.plan === SubscriptionPlan.CUSTOM,
        ).length,
      },
      byBillingCycle: {
        [BillingCycle.MONTHLY]: subscriptions.filter(
          (s) => s.billing_cycle === BillingCycle.MONTHLY,
        ).length,
        [BillingCycle.QUARTERLY]: subscriptions.filter(
          (s) => s.billing_cycle === BillingCycle.QUARTERLY,
        ).length,
        [BillingCycle.YEARLY]: subscriptions.filter(
          (s) => s.billing_cycle === BillingCycle.YEARLY,
        ).length,
        [BillingCycle.CUSTOM]: subscriptions.filter(
          (s) => s.billing_cycle === BillingCycle.CUSTOM,
        ).length,
      },
      totalRevenue: subscriptions.reduce(
        (sum, s) => sum + Number(s.amount || 0),
        0,
      ),
      activeSubscriptions: subscriptions.filter(
        (s) => s.status === SubscriptionStatus.ACTIVE,
      ).length,
      expiringSoon: subscriptions.filter((s) => {
        const daysUntilExpiry = Math.ceil(
          (s.end_date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
        );
        return (
          s.status === SubscriptionStatus.ACTIVE &&
          daysUntilExpiry <= 30 &&
          daysUntilExpiry > 0
        );
      }).length,
    };

    return stats;
  }

  async getExpiringSubscriptions(
    companyId: string,
    daysThreshold: number = 30,
  ): Promise<Subscription[]> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    return this.subscriptionsRepository.find({
      where: {
        company_id: companyId,
        status: SubscriptionStatus.ACTIVE,
        end_date: Between(new Date(), thresholdDate),
      },
      relations: ['company'],
      order: { end_date: 'ASC' },
    });
  }

  async getOverdueSubscriptions(companyId: string): Promise<Subscription[]> {
    return this.subscriptionsRepository.find({
      where: {
        company_id: companyId,
        status: SubscriptionStatus.ACTIVE,
        end_date: LessThan(new Date()),
      },
      relations: ['company'],
      order: { end_date: 'ASC' },
    });
  }

  async checkFeatureAccess(
    companyId: string,
    feature: keyof SubscriptionFeatures,
  ): Promise<{ hasAccess: boolean; currentUsage: number; limit: number }> {
    const subscription = await this.findActiveSubscription(companyId);

    if (!subscription) {
      return { hasAccess: false, currentUsage: 0, limit: 0 };
    }

    const limit = subscription.features[feature] as number;
    const currentUsage =
      subscription.usage_metrics?.[
        `current${feature.charAt(0).toUpperCase() + feature.slice(1)}`
      ] || 0;

    return {
      hasAccess: true,
      currentUsage,
      limit,
    };
  }

  async isFeatureEnabled(
    companyId: string,
    feature: keyof SubscriptionFeatures,
  ): Promise<boolean> {
    const subscription = await this.findActiveSubscription(companyId);

    if (!subscription) {
      return false;
    }

    return subscription.features[feature] as boolean;
  }

  private calculateNextBillingDate(
    startDate: Date,
    billingCycle: BillingCycle,
  ): Date {
    const nextDate = new Date(startDate);

    switch (billingCycle) {
      case BillingCycle.MONTHLY:
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case BillingCycle.QUARTERLY:
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case BillingCycle.YEARLY:
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      case BillingCycle.CUSTOM:
        // For custom billing cycles, next billing date should be set manually
        nextDate.setDate(nextDate.getDate() + 30); // Default to 30 days
        break;
    }

    return nextDate;
  }
}
