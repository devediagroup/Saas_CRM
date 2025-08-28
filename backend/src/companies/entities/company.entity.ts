import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum SubscriptionPlan {
  FREE = 'free',
  BASIC = 'basic',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

export enum CompanyStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive'
}

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ unique: true })
  subdomain: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  website: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  contact_email: string;

  @Column({ nullable: true })
  stripe_customer_id: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  timezone: string;

  @Column({ nullable: true })
  language: string;

  @Column({
    type: 'enum',
    enum: SubscriptionPlan,
    default: SubscriptionPlan.FREE
  })
  subscription_plan: SubscriptionPlan;

  @Column({
    type: 'enum',
    enum: CompanyStatus,
    default: CompanyStatus.ACTIVE
  })
  status: CompanyStatus;

  @Column({ type: 'json', nullable: true })
  settings: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  branding: Record<string, any>;

  @Column({ type: 'int', default: 0 })
  user_limit: number;

  @Column({ type: 'int', default: 0 })
  storage_limit: number; // in MB

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  monthly_usage: number;

  @Column({ type: 'date', nullable: true })
  subscription_expires_at: Date;

  @Column({ type: 'boolean', default: false })
  is_trial: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => User, user => user.company)
  users: User[];
}
