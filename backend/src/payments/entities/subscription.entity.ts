import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

export enum SubscriptionStatus {
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  TRIALING = 'trialing',
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  UNPAID = 'unpaid',
}

export enum SubscriptionPlan {
  FREE = 'free',
  BASIC = 'basic',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  stripe_subscription_id: string;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  @Column({
    type: 'enum',
    enum: SubscriptionPlan,
    default: SubscriptionPlan.FREE,
  })
  plan: SubscriptionPlan;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'SAR' })
  currency: string;

  @Column({ nullable: true })
  stripe_customer_id: string;

  @Column({ type: 'date', nullable: true })
  current_period_start: Date;

  @Column({ type: 'date', nullable: true })
  current_period_end: Date;

  @Column({ type: 'datetime', nullable: true })
  trial_start: Date;

  @Column({ type: 'datetime', nullable: true })
  trial_end: Date;

  @Column({ default: false })
  cancel_at_period_end: boolean;

  @Column({ type: 'date', nullable: true })
  canceled_at: Date;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

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

  // Virtual fields
  get is_active(): boolean {
    return this.status === SubscriptionStatus.ACTIVE || this.status === SubscriptionStatus.TRIALING;
  }

  get is_trial(): boolean {
    return this.status === SubscriptionStatus.TRIALING;
  }

  get is_canceled(): boolean {
    return this.status === SubscriptionStatus.CANCELED;
  }

  get is_past_due(): boolean {
    return this.status === SubscriptionStatus.PAST_DUE;
  }

  get days_until_renewal(): number {
    if (!this.current_period_end) return 0;

    const now = new Date();
    const diffTime = this.current_period_end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }

  get trial_days_remaining(): number {
    if (!this.is_trial || !this.trial_end) return 0;

    const now = new Date();
    const diffTime = this.trial_end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }

  get plan_limits(): any {
    const limits = {
      [SubscriptionPlan.FREE]: {
        users: 5,
        properties: 50,
        leads: 100,
        deals: 50,
        whatsapp_messages: 100,
        api_calls: 1000,
      },
      [SubscriptionPlan.BASIC]: {
        users: 25,
        properties: 500,
        leads: 1000,
        deals: 500,
        whatsapp_messages: 1000,
        api_calls: 10000,
      },
      [SubscriptionPlan.PRO]: {
        users: 100,
        properties: -1, // Unlimited
        leads: 5000,
        deals: -1,
        whatsapp_messages: 5000,
        api_calls: 50000,
      },
      [SubscriptionPlan.ENTERPRISE]: {
        users: -1,
        properties: -1,
        leads: -1,
        deals: -1,
        whatsapp_messages: -1,
        api_calls: -1,
      },
    };

    return limits[this.plan] || limits[SubscriptionPlan.FREE];
  }

  get formatted_amount(): string {
    return `${this.amount.toLocaleString()} ${this.currency}`;
  }

  get renewal_date(): string {
    return this.current_period_end?.toLocaleDateString() || 'N/A';
  }
}
